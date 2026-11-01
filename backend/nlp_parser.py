#!/usr/bin/env python3
"""
CIT Natural Language Venue Requisition & Hinglish Parser.
Parses conversational requests (English / Hinglish) into validated, structured booking requisitions
ready for user review and editing before submission.
"""
import re
from datetime import datetime, timedelta

ROOM_TYPE_KEYWORDS = {
    "auditorium": ["auditorium", "audi", "main audi", "stage"],
    "seminar_hall": ["seminar hall", "sh", "seminar", "conference hall"],
    "classroom": ["classroom", "class", "cr", "room", "lecture room"],
    "lecture_hall": ["lecture hall", "lh", "theatre", "hall"],
    "lab_cs": ["computer lab", "coding lab", "cs lab", "software lab"],
    "lab_elec": ["electrical lab", "electronics lab", "circuits lab"],
    "lab_phy": ["physics lab"],
    "workshop": ["workshop", "mechanical workshop", "fitting"],
    "outdoor": ["oat", "open air", "ground", "outdoor"]
}

DAYS_MAP = {
    "monday": "MON", "mon": "MON", "somwar": "MON",
    "tuesday": "TUE", "tue": "TUE", "mangalwar": "TUE",
    "wednesday": "WED", "wed": "WED", "budhwar": "WED",
    "thursday": "THU", "thu": "THU", "guruwar": "THU", "veervar": "THU",
    "friday": "FRI", "fri": "FRI", "shukrawar": "FRI",
    "saturday": "SAT", "sat": "SAT", "shaniwar": "SAT"
}

def parse_plain_language_request(text, reference_date=None):
    """
    Parses English or Hinglish text into a structured booking requisition.
    """
    lower = text.lower().strip()
    
    # 1. Attendance detection
    attendance = 50 # Default
    att_match = re.search(r'(\d+)\s*(people|students|participants|log|seats|pax|attendance)', lower)
    if att_match:
        attendance = int(att_match.group(1))
    else:
        num_matches = re.findall(r'\b(\d{2,4})\b', lower)
        for num in num_matches:
            val = int(num)
            if 15 <= val <= 1200:
                attendance = val
                break

    # 2. Duration detection (hours / periods)
    duration = 2 # Default 2 hours / 2 periods
    dur_match = re.search(r'(\d+)\s*(hour|hr|ghante|ghanta|periods)', lower)
    if dur_match:
        duration = int(dur_match.group(1))

    # 3. Needs & equipment detection
    needs = []
    if any(k in lower for k in ["projector", "screen", "display", "ppt"]):
        needs.append("projector")
    if any(k in lower for k in ["mic", "pa system", "sound", "speaker", "audio"]):
        needs.append("pa_system")
    if any(k in lower for k in ["stage", "podium", "drama", "play"]):
        needs.append("stage")
    if any(k in lower for k in ["wheelchair", "accessible", "handicap", "divyang", "ramp"]):
        needs.append("accessible")
    if any(k in lower for k in ["computer", "pc", "workstation", "gpu"]):
        needs.append("computers")

    # 4. Room Types detection
    room_types = []
    for rtype, keywords in ROOM_TYPE_KEYWORDS.items():
        if any(k in lower for k in keywords):
            room_types.append(rtype)
    if not room_types:
        if attendance > 250:
            room_types = ["auditorium", "outdoor"]
        elif attendance > 100:
            room_types = ["seminar_hall", "lecture_hall", "auditorium"]
        else:
            room_types = ["classroom", "lecture_hall", "seminar_hall"]

    # 5. Day detection & Hinglish "kal" resolution
    day = "MON"
    if "kal" in lower:
        # Tomorrow
        now = reference_date or datetime.now()
        tomorrow = now + timedelta(days=1)
        day_str = tomorrow.strftime("%a").upper()
        if day_str in ["SAT", "SUN"]:
            day = "MON"
        else:
            day = day_str
    else:
        for k, d_code in DAYS_MAP.items():
            if k in lower:
                day = d_code
                break

    # 6. Period detection (Times of day)
    from_period = 10 # Default to evening event period P10 (18:00)
    to_period = 11

    # Check explicit times: e.g. "6 to 8 pm", "6 pm", "shaam 6 baje", "10 am"
    time_match = re.search(r'(\d{1,2})\s*(to|-)\s*(\d{1,2})\s*(pm|am)?', lower)
    if time_match:
        t_start = int(time_match.group(1))
        t_end = int(time_match.group(3))
        is_pm = "pm" in lower or "shaam" in lower or "evening" in lower
        if is_pm and t_start < 12:
            t_start += 12
        if is_pm and t_end < 12:
            t_end += 12
            
        # Map 24-hr clock to Periods (P1: 08:00, P2: 09:00, ..., P10: 18:00, P11: 19:00, etc.)
        from_period = max(1, min(13, t_start - 8 + 1))
        to_period = max(from_period, min(13, t_end - 8))
        duration = to_period - from_period + 1
    elif any(k in lower for k in ["6 pm", "6 baje", "shaam 6", "18:00"]):
        from_period = 10 # 18:00
        to_period = from_period + duration - 1
    elif any(k in lower for k in ["10 am", "morning", "subah"]):
        from_period = 3 # 10:00
        to_period = from_period + duration - 1
    elif any(k in lower for k in ["after lunch", "afternoon", "dopahar"]):
        from_period = 6 # 14:00
        to_period = from_period + duration - 1

    # 7. Accessibility conflict check (e.g. SH-2 conflict)
    follow_up = None
    if "sh-2" in lower and "accessible" in needs:
        follow_up = "Warning: SH-2 does not have wheelchair accessibility. We recommend SH-1 (fully accessible) instead."

    if any(k in lower for k in ["after lunch", "somewhere", "around"]) and "maybe" in lower:
        follow_up = "Notice: Start time and capacity were estimated. Please verify the time window (P6 onwards) and attendance."

    windows = [{"day": day, "from_period": from_period, "to_period": to_period}]

    return {
        "attendance": attendance,
        "duration_periods": duration,
        "windows": windows,
        "needs": needs,
        "room_types": room_types,
        "mandatory_for_groups": [],
        "follow_up": follow_up,
        "parsed_summary": f"Day: {day}, Periods: P{from_period}-P{to_period}, Attendance: {attendance}, Needs: {', '.join(needs) or 'Standard'}"
    }

if __name__ == "__main__":
    sample_queries = [
        "Need a room for 45 people on Tuesday 6 to 8 pm, projector please.",
        "Book the auditorium for the CSE department farewell, Friday evening, around 400 people, need stage and mic.",
        "seminar hall kal shaam 6 baje, 2 ghante, 100 log, mic chahiye",
        "I want SH-2 on Friday at 10 am for a wheelchair-accessible poster session, 60 people.",
        "Need somewhere for the quiz finals after lunch on Thursday, maybe 150 people."
    ]
    for q in sample_queries:
        res = parse_plain_language_request(q)
        print("QUERY:", q)
        print("RESULT:", res)
        print("-" * 50)
