#!/usr/bin/env python3
"""
CIT Official Schedule Exporter.
Generates exports/schedule.json and exports/schedule_after.json,
and validates them against the official validator.py.
"""
import copy
import json
import os
import subprocess
import sys
from collections import defaultdict

from timetable_solver import solve_timetable
from exam_solver import solve_exams
from booking_solver import solve_bookings

def generate_baseline_schedule(data):
    print("1. Generating 189-session weekly timetable with OR-Tools CP-SAT...")
    t_res = solve_timetable(data, time_limit_seconds=45)
    if t_res["status"] not in ("FEASIBLE", "OPTIMAL"):
        raise RuntimeError("Failed to solve timetable feasibility!")
    timetable_sessions = t_res["sessions"]

    print("2. Generating 41 midsem exams with CP-SAT (half-capacity seating)...")
    exam_schedule = solve_exams(data)

    print("3. Solving Spectra Fest Week booking requests...")
    bookings, overrides = solve_bookings(data, timetable_sessions)

    schedule_data = {
        "team": "TechZephyr CIT",
        "dataset_id": data.get("dataset_id", "cit-public-v1"),
        "sessions": timetable_sessions,
        "fest_week": {
            "bookings": bookings,
            "session_overrides": overrides
        },
        "exams": exam_schedule
    }
    return schedule_data

def generate_disrupted_schedule(data, baseline_schedule, disruption_path="CrunchWeek_StarterPack/examples/sample_disruption.json"):
    print("4. Applying disruption changes from sample_disruption.json...")
    with open(disruption_path, "r", encoding="utf-8") as f:
        disruption = json.load(f)

    # Apply changes to dataset
    disrupted_data = copy.deepcopy(data)
    fac_map = {f["id"]: f for f in disrupted_data["faculty"]}
    for ch in disruption.get("changes", []):
        t = ch["type"]
        if t == "faculty_unavailable":
            for d in ch["days"]:
                fac_map[ch["faculty_id"]]["unavailable"].append({
                    "day": d,
                    "periods": ch["periods"],
                    "reason": ch.get("reason", "")
                })
        elif t == "room_unavailable":
            for d in ch["days"]:
                disrupted_data["room_unavailability"].append({
                    "room_id": ch["room_id"],
                    "day": d,
                    "periods": ch["periods"],
                    "reason": ch.get("reason", "")
                })
        elif t == "add_faculty":
            disrupted_data["faculty"].append(ch["faculty"])
            fac_map[ch["faculty"]["id"]] = ch["faculty"]
        elif t == "add_session":
            disrupted_data["sessions"].append(ch["session"])
        elif t == "remove_session":
            disrupted_data["sessions"] = [s for s in disrupted_data["sessions"] if s["id"] != ch["session_id"]]

    print("5. Solving repaired timetable with minimum session movement...")
    baseline_map = {
        s["session_id"]: (s["day"], s["start_period"], s["room_id"])
        for s in baseline_schedule.get("sessions", [])
    }
    t_res_after = solve_timetable(disrupted_data, time_limit_seconds=45, baseline_assignments=baseline_map)
    timetable_after = t_res_after["sessions"]

    # Solve fest week bookings for disrupted schedule
    bookings_after, overrides_after = solve_bookings(disrupted_data, timetable_after)

    schedule_after = {
        "team": "TechZephyr CIT",
        "dataset_id": data.get("dataset_id", "cit-public-v1"),
        "sessions": timetable_after,
        "fest_week": {
            "bookings": bookings_after,
            "session_overrides": overrides_after
        },
        "exams": baseline_schedule.get("exams", [])
    }
    return schedule_after

def main():
    os.makedirs("exports", exist_ok=True)
    with open("CrunchWeek_StarterPack/data/cit_public.json", "r", encoding="utf-8") as f:
        data = json.load(f)

    baseline = generate_baseline_schedule(data)
    with open("exports/schedule.json", "w", encoding="utf-8") as f:
        json.dump(baseline, f, indent=2)
    print("Saved exports/schedule.json")

    after = generate_disrupted_schedule(data, baseline)
    with open("exports/schedule_after.json", "w", encoding="utf-8") as f:
        json.dump(after, f, indent=2)
    print("Saved exports/schedule_after.json")

    print("\n--- RUNNING OFFICIAL VALIDATOR ON exports/schedule.json ---")
    val_cmd1 = [
        sys.executable,
        "CrunchWeek_StarterPack/validator.py",
        "--data", "CrunchWeek_StarterPack/data/cit_public.json",
        "--schedule", "exports/schedule.json"
    ]
    p1 = subprocess.run(val_cmd1, capture_output=True, text=True)
    print(p1.stdout)
    if p1.stderr:
        print(p1.stderr)

    print("\n--- RUNNING OFFICIAL VALIDATOR ON exports/schedule_after.json ---")
    val_cmd2 = [
        sys.executable,
        "CrunchWeek_StarterPack/validator.py",
        "--data", "CrunchWeek_StarterPack/data/cit_public.json",
        "--schedule", "exports/schedule_after.json",
        "--disruption", "CrunchWeek_StarterPack/examples/sample_disruption.json",
        "--baseline", "exports/schedule.json"
    ]
    p2 = subprocess.run(val_cmd2, capture_output=True, text=True)
    print(p2.stdout)
    if p2.stderr:
        print(p2.stderr)

if __name__ == "__main__":
    main()
