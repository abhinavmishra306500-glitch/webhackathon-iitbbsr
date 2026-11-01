#!/usr/bin/env python3
"""
CIT Midsem Exam Solver using OR-Tools CP-SAT.
Schedules all 41 midsem exams across MON-SAT (AM/PM) ensuring half-capacity seating
and no clashing student groups or rooms.
"""
import json
from collections import defaultdict
from ortools.sat.python import cp_model

def solve_exams(data):
    model = cp_model.CpModel()
    
    exams = data.get("exams", [])
    rooms = {r["id"]: r for r in data["rooms"] if "exam" in r.get("allowed_uses", [])}
    cal = data["calendar"]["exam_week"]
    days = cal["days"] # MON, TUE, WED, THU, FRI, SAT (6 days)
    sessions = [s["id"] for s in cal["sessions"]] # ["AM", "PM"] (2 sessions)
    
    # 12 slots: (d_idx, sess_idx)
    slots = []
    for d_idx, d in enumerate(days):
        for s_idx, s in enumerate(sessions):
            slots.append((d_idx, s_idx, d, s))
            
    exam_ids = [e["id"] for e in exams]
    room_ids = list(rooms.keys())
    
    # Decision variables:
    # slot_var[exam_id, slot_idx] = 1 if exam is in this slot
    slot_vars = {}
    for e in exams:
        eid = e["id"]
        v_list = []
        for slot_idx in range(len(slots)):
            var = model.NewBoolVar(f"exam_slot_{eid}_{slot_idx}")
            slot_vars[(eid, slot_idx)] = var
            v_list.append(var)
        model.AddExactlyOne(v_list)
        
    # room_vars[exam_id, room_id] = 1 if room is used for exam
    room_vars = {}
    for e in exams:
        eid = e["id"]
        for rid in room_ids:
            room_vars[(eid, rid)] = model.NewBoolVar(f"exam_room_{eid}_{rid}")
            
    # Capacity constraint: sum(room_capacity // 2) >= exam.size
    for e in exams:
        eid = e["id"]
        size = e["size"]
        cap_terms = []
        for rid in room_ids:
            half_cap = rooms[rid]["capacity"] // 2
            cap_terms.append(room_vars[(eid, rid)] * half_cap)
        model.Add(sum(cap_terms) >= size)
        
    # No student group conflict in same slot
    for slot_idx in range(len(slots)):
        group_exams = defaultdict(list)
        for e in exams:
            eid = e["id"]
            for g in e["groups"]:
                group_exams[g].append(slot_vars[(eid, slot_idx)])
        for g, var_list in group_exams.items():
            if len(var_list) > 1:
                model.Add(sum(var_list) <= 1)
                
    # No room double-booking in same slot
    for slot_idx in range(len(slots)):
        for rid in room_ids:
            # If room rid is used by exam eid AND exam eid is in slot_idx -> active
            active_vars = []
            for e in exams:
                eid = e["id"]
                # active_e_r_s = 1 iff (slot_vars[(eid, slot_idx)] and room_vars[(eid, rid)])
                active = model.NewBoolVar(f"act_{eid}_{rid}_{slot_idx}")
                model.AddBoolAnd([slot_vars[(eid, slot_idx)], room_vars[(eid, rid)]]).OnlyEnforceIf(active)
                model.AddBoolOr([slot_vars[(eid, slot_idx)].Not(), room_vars[(eid, rid)].Not()]).OnlyEnforceIf(active.Not())
                active_vars.append(active)
            model.Add(sum(active_vars) <= 1)
            
    # Soft constraint: Minimize same group having 2 exams on the same day
    same_day_penalties = []
    for d_idx in range(len(days)):
        # AM slot is d_idx * 2, PM slot is d_idx * 2 + 1
        am_slot = d_idx * 2
        pm_slot = d_idx * 2 + 1
        for g in data["student_groups"]:
            gid = g["id"]
            g_am = [slot_vars[(e["id"], am_slot)] for e in exams if gid in e["groups"]]
            g_pm = [slot_vars[(e["id"], pm_slot)] for e in exams if gid in e["groups"]]
            if g_am and g_pm:
                has_am = model.NewBoolVar(f"has_am_{gid}_{d_idx}")
                has_pm = model.NewBoolVar(f"has_pm_{gid}_{d_idx}")
                model.Add(sum(g_am) >= 1).OnlyEnforceIf(has_am)
                model.Add(sum(g_am) == 0).OnlyEnforceIf(has_am.Not())
                model.Add(sum(g_pm) >= 1).OnlyEnforceIf(has_pm)
                model.Add(sum(g_pm) == 0).OnlyEnforceIf(has_pm.Not())
                both = model.NewBoolVar(f"both_{gid}_{d_idx}")
                model.AddBoolAnd([has_am, has_pm]).OnlyEnforceIf(both)
                model.AddBoolOr([has_am.Not(), has_pm.Not()]).OnlyEnforceIf(both.Not())
                same_day_penalties.append(both * 5)
                
    if same_day_penalties:
        model.Minimize(sum(same_day_penalties))
        
    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 30
    solver.parameters.num_workers = 8
    
    status = solver.Solve(model)
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        scheduled_exams = []
        for e in exams:
            eid = e["id"]
            chosen_slot = None
            for slot_idx, (d_idx, s_idx, d, s) in enumerate(slots):
                if solver.Value(slot_vars[(eid, slot_idx)]) == 1:
                    chosen_slot = (d, s)
                    break
            chosen_rooms = [rid for rid in room_ids if solver.Value(room_vars[(eid, rid)]) == 1]
            scheduled_exams.append({
                "exam_id": eid,
                "day": chosen_slot[0],
                "session": chosen_slot[1],
                "rooms": chosen_rooms
            })
        return scheduled_exams
    return []

if __name__ == "__main__":
    with open("CrunchWeek_StarterPack/data/cit_public.json") as f:
        data = json.load(f)
    res = solve_exams(data)
    print(f"Solved {len(res)} exams:")
    for ex in res[:5]:
        print(ex)
