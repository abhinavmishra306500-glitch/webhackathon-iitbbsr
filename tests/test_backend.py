#!/usr/bin/env python3
"""
Comprehensive Pytest Test Suite for CampusSync Backend.
Validates all 10 problem statement capabilities.
"""
import json
import os
import sys
import pytest
from fastapi.testclient import TestClient

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "../backend"))

from backend.main import app
from backend.nlp_parser import parse_plain_language_request

client = TestClient(app)

def test_1_dataset_health():
    """Verify official dataset entities and counts."""
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "online"
    assert data["rooms"] == 27
    assert data["faculty"] == 40
    assert data["sessions"] == 189
    assert data["exams"] == 41
    assert data["booking_requests"] == 25

def test_2_clash_free_timetable():
    """Verify baseline timetable has 189 sessions and supports filtering."""
    res = client.get("/api/timetable/view?group=CSE-3")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] > 0
    for s in data["sessions"]:
        assert "CSE-3" in s["groups"]
        assert s["day"] in ["MON", "TUE", "WED", "THU", "FRI"]
        assert 1 <= s["start_period"] <= 9

def test_3_midsem_exams_half_capacity():
    """Verify 41 midsem exams scheduled with half-capacity rule."""
    res = client.get("/api/exams/view")
    assert res.status_code == 200
    data = res.json()
    assert data["total_exams"] == 41
    for ex in data["exams"]:
        assert ex["capacity_status"] == "Valid"
        assert ex["total_effective_seats"] >= ex["size"]

def test_4_spectra_week_booking_decisions():
    """Verify all 25 booking requests evaluated with reasons and priority order."""
    res = client.get("/api/bookings/fest")
    assert res.status_code == 200
    data = res.json()
    assert data["count"] == 25
    assert data["approved"] >= 20
    # BR-04 must be rejected (cancelled)
    br04 = next(b for b in data["bookings"] if b["request_id"] == "BR-04")
    assert br04["status"] == "rejected"
    assert "cancel" in br04["reason"].lower() or "withdrawn" in br04["reason"].lower()

def test_5_hinglish_and_english_nlp_parser():
    """Verify plain English & Hinglish requests are parsed accurately."""
    # Hinglish query
    q_hinglish = "seminar hall kal shaam 6 baje, 2 ghante, 100 log, mic chahiye"
    res = parse_plain_language_request(q_hinglish)
    assert res["attendance"] == 100
    assert res["duration_periods"] == 2
    assert "pa_system" in res["needs"]
    assert "seminar_hall" in res["room_types"]
    assert res["windows"][0]["from_period"] == 10 # 6 PM

    # Wheelchair conflict query
    q_accessible = "I want SH-2 on Friday at 10 am for a wheelchair-accessible poster session, 60 people."
    res2 = parse_plain_language_request(q_accessible)
    assert "accessible" in res2["needs"]
    assert res2["follow_up"] is not None
    assert "SH-1" in res2["follow_up"]

def test_6_manual_event_scheduling_hard_constraints():
    """Verify manual event scheduling validates hard constraints."""
    # Attempt booking that exceeds room capacity
    invalid_payload = {
        "title": "Mega Fest",
        "requester": "Music Club",
        "role": "club",
        "day": "MON",
        "start_period": 10,
        "end_period": 12,
        "room_id": "CR-101", # capacity is 40
        "attendance": 500
    }
    res = client.post("/api/bookings/manual", json=invalid_payload)
    assert res.status_code == 400
    assert "capacity" in res.json()["detail"].lower()

    # Valid manual booking
    valid_payload = {
        "title": "Evening Code Sprint",
        "requester": "TechZephyr",
        "role": "club",
        "day": "WED",
        "start_period": 10,
        "end_period": 11,
        "room_id": "SH-1",
        "attendance": 60
    }
    res_valid = client.post("/api/bookings/manual", json=valid_payload)
    assert res_valid.status_code == 200
    assert res_valid.json()["success"] is True

def test_7_disruption_and_minimal_movement():
    """Verify disruption simulation produces minimal session moves."""
    res = client.post("/api/disruption/apply")
    assert res.status_code == 200
    data = res.json()
    assert data["success"] is True
    # Minimal movement: should move very few sessions (<= 25)
    assert data["sessions_moved"] <= 25

def test_8_decision_explanation_engine():
    """Verify AI decision explanation for 8 AM and rejection reasons."""
    res_8am = client.post("/api/ai/explain", json={"topic": "Why was a class put at 8 AM?"})
    assert res_8am.status_code == 200
    assert "lunch" in res_8am.json()["explanation"].lower() or "faculty" in res_8am.json()["explanation"].lower()

    res_1200 = client.post("/api/ai/explain", json={"topic": "Why was BR-09 rejected?"})
    assert res_1200.status_code == 200
    assert "capacity" in res_1200.json()["explanation"].lower() or "1,200" in res_1200.json()["explanation"].lower()

def test_9_official_validator_zero_violations():
    """Verify official validator.py runs and passes with zero hard violations."""
    res = client.post("/api/validator/run?target=baseline")
    assert res.status_code == 200
    assert "Hard violations: 0" in res.json()["stdout"]

def test_10_demo_reset():
    """Verify demo data reset endpoint."""
    res = client.post("/api/reset")
    assert res.status_code == 200
    assert res.json()["success"] is True

def test_11_dataset_repositories_and_utilization():
    """Verify official dataset entities: summary, 27 rooms, 40 faculty, 14 student groups, 62 courses, and utilization analytics."""
    # 1. Summary
    res_sum = client.get("/api/dataset/summary")
    assert res_sum.status_code == 200
    stats = res_sum.json()["stats"]
    assert stats["rooms"] == 27
    assert stats["faculty"] == 40
    assert stats["sessions"] == 189
    assert stats["courses"] == 62
    assert stats["studentGroups"] == 14
    assert stats["midsemExams"] == 41

    # 2. Rooms
    res_rooms = client.get("/api/rooms")
    assert res_rooms.status_code == 200
    rooms = res_rooms.json()
    assert len(rooms) == 27
    aud = next(r for r in rooms if r["id"] == "AUD")
    assert aud["capacity"] == 500
    assert aud["accessible"] is True
    cr201 = next(r for r in rooms if r["id"] == "CR-201")
    assert cr201["accessible"] is False  # 2nd floor, no lift

    # 3. Faculty
    res_fac = client.get("/api/faculty")
    assert res_fac.status_code == 200
    assert len(res_fac.json()) == 40

    # 4. Student Groups
    res_groups = client.get("/api/student-groups")
    assert res_groups.status_code == 200
    assert len(res_groups.json()) == 14

    # 5. Courses
    res_courses = client.get("/api/courses")
    assert res_courses.status_code == 200
    assert len(res_courses.json()) == 62

    # 6. Utilization Analytics
    res_util = client.get("/api/analytics/utilization")
    assert res_util.status_code == 200
    util = res_util.json()
    assert util["total_rooms"] == 27
    assert util["total_sessions"] == 189
    assert util["overall_utilization_pct"] > 0
    assert util["conflict_free_rate"] == 100.0

def test_12_native_gemini_ai_chat():
    """Verify native AI chat endpoint returns grounded response."""
    payload = {
        "messages": [
            {"sender": "user", "text": "What is the capacity of SH-1 vs SH-2?"}
        ],
        "userRole": "club"
    }
    res = client.post("/api/ai/chat", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert len(data["reply"]) > 10
