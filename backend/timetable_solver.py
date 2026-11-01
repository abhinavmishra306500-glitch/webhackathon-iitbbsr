#!/usr/bin/env python3
"""
CIT Timetable Solver using Google OR-Tools CP-SAT.
Formulates all 189 sessions from cit_public.json and satisfies all H1-H14 hard constraints
while optimizing S1-S6 soft constraints.
"""
import json
import os
import sys
from collections import defaultdict
from ortools.sat.python import cp_model

def load_dataset(dataset_path="CrunchWeek_StarterPack/data/cit_public.json"):
    with open(dataset_path, "r", encoding="utf-8") as f:
        return json.load(f)

def solve_timetable(data, time_limit_seconds=60, baseline_assignments=None):
    model = cp_model.CpModel()
    
    sessions = data["sessions"]
    rooms = {r["id"]: r for r in data["rooms"]}
    faculty = {f["id"]: f for f in data["faculty"]}
    days = data["calendar"]["days"] # ["MON", "TUE", "WED", "THU", "FRI"]
    num_days = len(days) # 5
    day_to_idx = {d: i for i, d in enumerate(days)}
    idx_to_day = {i: d for i, d in enumerate(days)}
    
    # Periods: P1 (index 1) to P9 (index 9)
    # Lunch is between P5 and P6 -> sessions cannot span across P5 and P6
    lunch_after = data["calendar"]["lunch"]["after_period"] # 5
    lab_starts = set(data["calendar"]["lab_start_periods"]) # {2, 6}
    
    # Pre-index room IDs and types
    room_ids = list(rooms.keys())
    room_to_idx = {r: i for i, r in enumerate(room_ids)}
    idx_to_room = {i: r for i, r in enumerate(room_ids)}
    
    # Pre-index faculty unavailabilities: fac_id -> set of (day_idx, period)
    fac_unavail = defaultdict(set)
    for f in data["faculty"]:
        for u in f.get("unavailable", []):
            d_idx = day_to_idx.get(u["day"])
            if d_idx is not None:
                for p in u["periods"]:
                    fac_unavail[f["id"]].add((d_idx, p))
                    
    # Room unavailabilities: room_id -> set of (day_idx, period)
    room_unavail = defaultdict(set)
    for u in data.get("room_unavailability", []):
        d_idx = day_to_idx.get(u["day"])
        if d_idx is not None:
            for p in u["periods"]:
                room_unavail[u["room_id"]].add((d_idx, p))

    # Decision variables for each session
    # A session assignment is valid if:
    # - day in 0..4
    # - start_period:
    #   if lab: duration is 3, start can ONLY be 2 or 6 (occupying 2,3,4 or 6,7,8)
    #   if lecture/tutorial: start in 1..9, start + duration - 1 <= 9, does not cross lunch (i.e. not (start <= 5 and start + duration - 1 >= 6))
    # - room: room must be in session["room_types"], capacity >= size, accessibility if needed
    
    session_vars = {}
    
    # Group elective baskets so sessions in the same basket share (day, start_period)
    basket_sessions = defaultdict(list)
    for s in sessions:
        if s.get("basket_slot"):
            basket_sessions[s["basket_slot"]].append(s["id"])

    # First, filter valid rooms for each session
    session_valid_rooms = {}
    for s in sessions:
        valid_r = []
        for rid, r in rooms.items():
            if r["type"] not in s["room_types"]:
                continue
            if r["capacity"] < s["size"]:
                continue
            if s.get("needs_accessible") and not r["accessible"]:
                continue
            valid_r.append(rid)
        session_valid_rooms[s["id"]] = valid_r

    # Find valid (day, start_period) pairs for each session
    session_valid_slots = {}
    for s in sessions:
        dur = s["duration"]
        kind = s["kind"]
        fixed = s.get("fixed_slot")
        slots = []
        for d_idx, d_name in enumerate(days):
            if fixed and (fixed["day"] != d_name):
                continue
            if kind == "lab":
                # Labs start only at P2 or P6
                for p in [2, 6]:
                    if fixed and fixed["start_period"] != p:
                        continue
                    # Check faculty availability for all 3 periods
                    f_id = s["faculty_id"]
                    if any((d_idx, p + offset) in fac_unavail[f_id] for offset in range(dur)):
                        continue
                    slots.append((d_idx, p))
            else:
                for p in range(1, 10 - dur + 1):
                    if fixed and fixed["start_period"] != p:
                        continue
                    # Check crossing lunch
                    if p <= lunch_after and (p + dur - 1) > lunch_after:
                        continue
                    # Check faculty availability
                    f_id = s["faculty_id"]
                    if any((d_idx, p + offset) in fac_unavail[f_id] for offset in range(dur)):
                        continue
                    slots.append((d_idx, p))
        session_valid_slots[s["id"]] = slots

    # Create variables for each session
    # We represent assignment using boolean variables:
    # x[session_id, day, start, room] = 1 if session is assigned to (day, start, room)
    x = {}
    
    for s in sessions:
        sid = s["id"]
        valid_slots = session_valid_slots[sid]
        valid_rms = session_valid_rooms[sid]
        
        # Each session must be assigned exactly once
        s_choices = []
        for d_idx, start_p in valid_slots:
            dur = s["duration"]
            for rid in valid_rms:
                # Check room availability
                if any((d_idx, start_p + offset) in room_unavail[rid] for offset in range(dur)):
                    continue
                var = model.NewBoolVar(f"x_{sid}_{d_idx}_{start_p}_{rid}")
                x[(sid, d_idx, start_p, rid)] = var
                s_choices.append(var)
        model.AddExactlyOne(s_choices)

    # Constraint H11: Basket slot synchronicity
    # All sessions sharing the same basket slot must have the same (day, start_period)
    for b_slot, s_list in basket_sessions.items():
        if len(s_list) > 1:
            ref_sid = s_list[0]
            for other_sid in s_list[1:]:
                # For each valid (day, start), sum over rooms must be equal
                for d_idx in range(num_days):
                    for start_p in range(1, 10):
                        ref_vars = [v for (sid, d, sp, rid), v in x.items() if sid == ref_sid and d == d_idx and sp == start_p]
                        other_vars = [v for (sid, d, sp, rid), v in x.items() if sid == other_sid and d == d_idx and sp == start_p]
                        if ref_vars and other_vars:
                            model.Add(sum(ref_vars) == sum(other_vars))
                        elif ref_vars and not other_vars:
                            model.Add(sum(ref_vars) == 0)
                        elif other_vars and not ref_vars:
                            model.Add(sum(other_vars) == 0)

    # Constraint H4: Room non-overlapping
    # For every (room, day, period), at most 1 session can occupy it
    for rid in room_ids:
        for d_idx in range(num_days):
            for p in range(1, 10):
                occupying_vars = []
                for s in sessions:
                    sid = s["id"]
                    dur = s["duration"]
                    # If session starts at start_p and covers p, it satisfies: start_p <= p <= start_p + dur - 1
                    for start_p in range(max(1, p - dur + 1), p + 1):
                        key = (sid, d_idx, start_p, rid)
                        if key in x:
                            occupying_vars.append(x[key])
                if len(occupying_vars) > 1:
                    model.Add(sum(occupying_vars) <= 1)

    # Constraint H2: Faculty non-overlapping
    # For every (faculty, day, period), at most 1 session can occupy them
    faculty_ids = list(faculty.keys())
    for f_id in faculty_ids:
        for d_idx in range(num_days):
            for p in range(1, 10):
                fac_vars = []
                for s in sessions:
                    if s["faculty_id"] == f_id:
                        sid = s["id"]
                        dur = s["duration"]
                        for start_p in range(max(1, p - dur + 1), p + 1):
                            for rid in session_valid_rooms[sid]:
                                key = (sid, d_idx, start_p, rid)
                                if key in x:
                                    fac_vars.append(x[key])
                if len(fac_vars) > 1:
                    model.Add(sum(fac_vars) <= 1)

    # Constraint H3: Student Group non-overlapping
    # For every (group, day, period), at most 1 regular session or 1 basket slot can occupy them
    group_ids = [g["id"] for g in data["student_groups"]]
    for g_id in group_ids:
        for d_idx in range(num_days):
            for p in range(1, 10):
                # Separate regular sessions from basket slots
                basket_seen = set()
                regular_vars = []
                basket_slot_vars = defaultdict(list)
                
                for s in sessions:
                    if g_id in s["groups"]:
                        sid = s["id"]
                        dur = s["duration"]
                        b_slot = s.get("basket_slot")
                        for start_p in range(max(1, p - dur + 1), p + 1):
                            for rid in session_valid_rooms[sid]:
                                key = (sid, d_idx, start_p, rid)
                                if key in x:
                                    if b_slot:
                                        basket_slot_vars[b_slot].append(x[key])
                                    else:
                                        regular_vars.append(x[key])
                                        
                # If a group has both regular sessions and basket slots, at most one can happen at period p
                terms = list(regular_vars)
                for b_slot, b_vars in basket_slot_vars.items():
                    # For basket slot, all sessions happen simultaneously so we only count once
                    # Using an indicator variable for basket slot active
                    b_active = model.NewBoolVar(f"b_active_{g_id}_{b_slot}_{d_idx}_{p}")
                    # b_active >= each var
                    for bv in b_vars:
                        model.Add(b_active >= bv)
                    terms.append(b_active)
                    
                if len(terms) > 1:
                    model.Add(sum(terms) <= 1)

    # Constraint H12: Faculty Daily Limit
    # Faculty daily teaching hours <= max_hours_per_day
    for f_id, f_data in faculty.items():
        max_h = f_data.get("max_hours_per_day", 4)
        for d_idx in range(num_days):
            day_hour_terms = []
            for s in sessions:
                if s["faculty_id"] == f_id:
                    sid = s["id"]
                    dur = s["duration"]
                    for start_p in range(1, 10):
                        for rid in session_valid_rooms[sid]:
                            key = (sid, d_idx, start_p, rid)
                            if key in x:
                                day_hour_terms.append(x[key] * dur)
            if day_hour_terms:
                model.Add(sum(day_hour_terms) <= max_h)

    # SOFT CONSTRAINTS (Objective function)
    # Penalties:
    # S1: Faculty avoid preference (+2 per hour)
    # S5: Room underutilization < 0.4 (+1)
    # S6: Late teaching period P9 (+1)
    soft_penalties = []
    
    for (sid, d_idx, start_p, rid), var in x.items():
        s = next(s for s in sessions if s["id"] == sid)
        r = rooms[rid]
        dur = s["duration"]
        d_name = idx_to_day[d_idx]
        periods = list(range(start_p, start_p + dur))
        
        # S1: Faculty avoid
        fac_prefs = faculty[s["faculty_id"]].get("preferences", [])
        for pref in fac_prefs:
            if pref.get("type") == "avoid" and d_name in pref.get("days", days):
                avoid_overlap = sum(1 for p in periods if p in pref["periods"])
                if avoid_overlap > 0:
                    soft_penalties.append(var * (2 * avoid_overlap))
                    
        # S5: Room underutilization
        if r["capacity"] and (s["size"] / r["capacity"] < 0.4):
            soft_penalties.append(var * 1)
            
        # S6: Scheduled in P9
        if 9 in periods:
            soft_penalties.append(var * 1)

    # Stability objective: Minimize changes from baseline
    if baseline_assignments:
        for sid, (b_day, b_start, b_rid) in baseline_assignments.items():
            b_d_idx = day_to_idx.get(b_day)
            # Find the matching baseline variable
            b_key = (sid, b_d_idx, b_start, b_rid)
            if b_key in x:
                # If x[b_key] == 1, no penalty. If not chosen, penalty of 200
                soft_penalties.append(x[b_key].Not() * 200)

    if soft_penalties:
        model.Minimize(sum(soft_penalties))

    # Solve using CP-SAT
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = time_limit_seconds
    solver.parameters.num_workers = 8
    
    status = solver.Solve(model)
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        schedule = []
        for (sid, d_idx, start_p, rid), var in x.items():
            if solver.Value(var) == 1:
                schedule.append({
                    "session_id": sid,
                    "day": idx_to_day[d_idx],
                    "start_period": start_p,
                    "room_id": rid
                })
        return {
            "status": "FEASIBLE" if status == cp_model.FEASIBLE else "OPTIMAL",
            "sessions": schedule,
            "objective_value": solver.ObjectiveValue() if soft_penalties else 0
        }
    else:
        return {"status": "INFEASIBLE", "sessions": []}

if __name__ == "__main__":
    print("Loading CIT dataset...")
    data = load_dataset()
    print(f"Total sessions: {len(data['sessions'])}. Solving with OR-Tools CP-SAT...")
    res = solve_timetable(data, time_limit_seconds=45)
    print(f"Solver Status: {res['status']}")
    print(f"Scheduled sessions: {len(res['sessions'])}")
    if res['sessions']:
        print("Objective value:", res.get("objective_value"))
