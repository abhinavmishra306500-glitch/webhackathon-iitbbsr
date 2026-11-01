#!/usr/bin/env python3
"""
CIT Spectra Fest Week (Week 7) Booking Solver.
Implements priority-ranked room allocation with role category capping,
alternative offering, displacement, and priority-inversion prevention.
"""
import json
from collections import defaultdict

CAT_WEIGHT = {
    "institute_event": 5,
    "guest_lecture": 4,
    "department_event": 3,
    "club_event": 2
}

def effective_category(data, req):
    order = data["priority_order"] # ['exam', 'regular_session', 'institute_event', 'guest_lecture', 'department_event', 'club_event']
    cap = data["role_category_cap"].get(req["role"], "club_event")
    req_cat = req.get("requested_category", "club_event")
    a = order.index(req_cat) if req_cat in order else len(order) - 1
    cap_idx = order.index(cap) if cap in order else len(order) - 1
    return order[max(a, cap_idx)]

def solve_bookings(data, timetable_sessions):
    """
    data: cit_public.json dictionary
    timetable_sessions: list of {"session_id", "day", "start_period", "room_id"}
    """
    days = data["calendar"]["days"]
    rooms = {r["id"]: r for r in data["rooms"]}
    requests = data.get("booking_requests", [])
    cancellations = {c["request_id"] for c in data.get("cancellations", [])}
    room_un = defaultdict(set)
    for u in data.get("room_unavailability", []):
        for p in u["periods"]:
            room_un[u["room_id"]].add((u["day"], p))
            
    # Regular classes occupancy in Week 7 (before displacement)
    session_map = {s["id"]: s for s in data["sessions"]}
    class_occ = defaultdict(list) # (rid, day, p) -> [sid]
    group_class_occ = defaultdict(set) # (gid, day, p) -> set(sid)
    
    for s_entry in timetable_sessions:
        sid = s_entry["session_id"]
        d = s_entry["day"]
        sp = s_entry["start_period"]
        rid = s_entry["room_id"]
        s_obj = session_map.get(sid)
        if s_obj:
            dur = s_obj["duration"]
            for p in range(sp, sp + dur):
                class_occ[(rid, d, p)].append(sid)
                for g in s_obj["groups"]:
                    group_class_occ[(g, d, p)].add(sid)

    # Sort requests by priority
    # Category order rank, then submitted_at
    cat_order = data["priority_order"]
    def sort_key(req):
        cat = effective_category(data, req)
        cat_rank = cat_order.index(cat) if cat in cat_order else 99
        return (cat_rank, req.get("submitted_at", ""))
        
    sorted_requests = sorted(requests, key=sort_key)
    
    decisions = []
    overrides = []
    placed_bookings = {} # req_id -> (rid, day, a, b)
    room_event_busy = defaultdict(list) # (rid, day, p) -> [req_id]

    # Suitable rooms filter
    def get_candidate_rooms(req):
        cands = []
        # If requested_room is specified and valid, put it first
        req_room = req.get("requested_room")
        for rid, r in rooms.items():
            if "event" not in r.get("allowed_uses", []):
                continue
            if r["type"] not in req["room_types"]:
                continue
            if r["capacity"] < req["attendance"]:
                continue
            feats = set(r.get("features", [])) | ({"accessible"} if r.get("accessible") else set())
            if set(req.get("needs", [])) - feats:
                continue
            if rid == req_room:
                cands.insert(0, rid)
            else:
                cands.append(rid)
        return cands

    for req in sorted_requests:
        req_id = req["id"]
        dur = req["duration_periods"]
        
        # Check cancellation
        if req_id in cancellations:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": "Request was officially cancelled and withdrawn by the organizer"
            })
            continue

        cands = get_candidate_rooms(req)
        if not cands:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": f"No available venue satisfies attendance requirement of {req['attendance']} with required facilities"
            })
            continue

        # Try to approve inside requested windows
        allocated = False
        for window in req.get("windows", []):
            d = window["day"]
            w_start = window["from_period"]
            w_end = window["to_period"]
            
            # Possible start periods within window
            for sp in range(w_start, w_end - dur + 2):
                ep = sp + dur - 1
                if ep > 13:
                    continue
                # Try candidate rooms
                for rid in cands:
                    clash = False
                    for p in range(sp, ep + 1):
                        # Room unavailable?
                        if (d, p) in room_un[rid]:
                            clash = True; break
                        # Another event booked?
                        if room_event_busy[(rid, d, p)]:
                            clash = True; break
                        # Class in session?
                        if class_occ[(rid, d, p)]:
                            # Regular class clash. Only institute_event can displace!
                            eff_cat = effective_category(data, req)
                            if eff_cat != "institute_event":
                                clash = True; break
                        # Mandatory groups busy?
                        for g in req.get("mandatory_for_groups", []):
                            if group_class_occ[(g, d, p)]:
                                clash = True; break
                    if not clash:
                        # Success: Allocate inside window!
                        allocated = True
                        for p in range(sp, ep + 1):
                            room_event_busy[(rid, d, p)].append(req_id)
                        decisions.append({
                            "request_id": req_id,
                            "status": "approved",
                            "day": d,
                            "start_period": sp,
                            "end_period": ep,
                            "room_id": rid,
                            "reason": f"Approved for {req['title']} in {rooms[rid]['name']}"
                        })
                        placed_bookings[req_id] = (rid, d, sp, ep)
                        break
                if allocated:
                    break
            if allocated:
                break
                
        if allocated:
            continue
            
        # If not allocated inside window, try alternative_offered
        alt_found = False
        for d in days:
            # Check evening slots P10-P13 or afternoon P6-P9
            for sp in range(10, 14 - dur + 1):
                ep = sp + dur - 1
                for rid in cands:
                    clash = False
                    for p in range(sp, ep + 1):
                        if (d, p) in room_un[rid] or room_event_busy[(rid, d, p)] or class_occ[(rid, d, p)]:
                            clash = True; break
                        for g in req.get("mandatory_for_groups", []):
                            if group_class_occ[(g, d, p)]:
                                clash = True; break
                    if not clash:
                        alt_found = True
                        for p in range(sp, ep + 1):
                            room_event_busy[(rid, d, p)].append(req_id)
                        decisions.append({
                            "request_id": req_id,
                            "status": "alternative_offered",
                            "day": d,
                            "start_period": sp,
                            "end_period": ep,
                            "room_id": rid,
                            "reason": f"Preferred time window was congested; alternative offered in {rooms[rid]['name']} on {d} P{sp}-P{ep}"
                        })
                        placed_bookings[req_id] = (rid, d, sp, ep)
                        break
                if alt_found:
                    break
            if alt_found:
                break
                
        if not alt_found:
            decisions.append({
                "request_id": req_id,
                "status": "rejected",
                "reason": "All matching venues in the requested time windows are occupied by higher-priority bookings or regular sessions"
            })
            
    return decisions, overrides

if __name__ == "__main__":
    with open("CrunchWeek_StarterPack/data/cit_public.json") as f:
        data = json.load(f)
    from timetable_solver import solve_timetable
    t_res = solve_timetable(data, time_limit_seconds=15)
    bookings, overrides = solve_bookings(data, t_res["sessions"])
    print(f"Decisions generated for {len(bookings)} requests.")
    approved = sum(1 for b in bookings if b["status"] == "approved")
    alt = sum(1 for b in bookings if b["status"] == "alternative_offered")
    rej = sum(1 for b in bookings if b["status"] == "rejected")
    print(f"Approved: {approved}, Alternative Offered: {alt}, Rejected: {rej}")
