// CampusSync Knowledge Base - Chilika Institute of Technology (CIT)
// Provides verified institutional context for LLM grounding

export const CAMPUS_KNOWLEDGE = {
  institution: "Chilika Institute of Technology (CIT)",
  academicYear: "2026-2027 (Odd Semester)",
  
  // VENUES & CAPACITIES
  venues: [
    {
      name: "Main Auditorium",
      block: "Central Wing / Cultural Quad",
      capacity: 600,
      equipment: "Dual 4K Laser Projectors, JBL 7.1 Line Array Audio, DMX Stage Lighting, 6 Wireless Mics",
      availability: "Available Friday 2:00 PM onwards; Reserved Saturday morning for Alumni Keynote",
      rules: "Booking requires Administrative approval. Acoustic test required 2 hours prior."
    },
    {
      name: "SAC Seminar Hall A",
      block: "Student Activity Center (SAC) 1st Floor",
      capacity: 180,
      equipment: "98-inch 4K Interactive Touch Display, Shure Podium Mic, Central AC, Recording Rig",
      availability: "Available Monday-Thursday afternoons",
      rules: "Club events require Faculty Advisor endorsement."
    },
    {
      name: "Block B Conference Room (CR-B10)",
      block: "Academic Block B Ground Floor",
      capacity: 80,
      equipment: "Cisco Webex Room Kit, Dual Displays, Executive Polycom Audio",
      availability: "Reserved for Departmental Review until Wednesday 4:00 PM; Free Thursday/Friday",
      rules: "Priority given to Faculty Board and Academic Council."
    },
    {
      name: "Advanced Robotics & AI Lab",
      block: "Computing Center 3rd Floor (Block C)",
      capacity: 50,
      equipment: "35 High-End GPU Workstations (RTX 4090), 3D Prototyping Printers, ROS2 Rover Arena",
      availability: "Open for scheduled lab classes 09:00 - 16:30; Open access 16:30 - 20:00",
      rules: "Lab instructor safety briefing mandatory before hardware experiments."
    },
    {
      name: "Smart Lecture Theatre CR-204",
      block: "Academic Block B 2nd Floor",
      capacity: 120,
      equipment: "Dual Panasonic Projectors, Smart Digital Whiteboard, Tiered Acoustic Seating, AC",
      availability: "Free Tuesday 02:00 PM - 05:00 PM and Thursday 11:00 AM - 01:30 PM",
      rules: "Standard lecture room for 3rd year CSE & ECE courses."
    },
    {
      name: "Lecture Hall CR-102",
      block: "Academic Block A 1st Floor",
      capacity: 90,
      equipment: "Ultra-short throw projector, Wireless lapel mic, Surround ceiling speakers",
      availability: "Free Monday after 03:30 PM, Wednesday all morning",
      rules: "Allocated for core CSE theory and tutorial classes."
    }
  ],

  // TIMETABLE & ACTIVE COURSES
  timetables: {
    "CSE-3A": [
      { slot: "08:30 - 09:30", course: "Design & Analysis of Algorithms (CS301)", room: "CR-204 (Block B)", faculty: "Prof. Ananya Pattnaik", days: ["Mon", "Wed", "Fri"] },
      { slot: "09:30 - 10:30", course: "Computer Organization & Architecture (CS302)", room: "CR-204 (Block B)", faculty: "Dr. Rajeshwar Sen", days: ["Mon", "Tue", "Thu"] },
      { slot: "10:45 - 12:45", course: "AI & Machine Learning Lab (CS303P)", room: "Adv. AI Lab (Block C)", faculty: "Dr. Manoranjan Sharma", days: ["Mon", "Wed"] },
      { slot: "01:30 - 02:30", course: "Formal Language & Automata Theory (CS304)", room: "CR-102 (Block A)", faculty: "Prof. S. Mohanty", days: ["Tue", "Thu", "Fri"] },
      { slot: "02:30 - 03:30", course: "Database Management Systems (CS305)", room: "CR-102 (Block A)", faculty: "Dr. P. Rath", days: ["Mon", "Wed", "Thu"] }
    ]
  },

  // FACULTY PROFILES & STATUS
  faculty: [
    {
      name: "Dr. Manoranjan Sharma",
      department: "Computer Science & Engineering",
      designation: "Associate Professor (AI / Robotics)",
      currentLocation: "Advanced AI Lab C",
      officeHours: "Monday & Wednesday: 03:30 PM - 05:00 PM, Room C-312",
      recentUpdates: "Rescheduling CS303P lab session from Tuesday morning to Thursday afternoon due to IEEE AI Conference keynote."
    },
    {
      name: "Prof. Ananya Pattnaik",
      department: "Computer Science & Engineering",
      designation: "HOD & Professor",
      currentLocation: "Department Office, Block B Room 101",
      officeHours: "Tuesday & Thursday: 02:00 PM - 04:00 PM",
      recentUpdates: "Midsemester exam seating plan finalized for Academic Block B lecture halls."
    },
    {
      name: "Dr. Rajeshwar Sen",
      department: "Computer Science & Engineering",
      designation: "Dean of Academic Affairs & Professor",
      currentLocation: "Administrative Secretariat (Central Wing)",
      officeHours: "By appointment via Dean's Office",
      recentUpdates: "Overseeing annual campus network and server maintenance window scheduled Dec 02."
    }
  ],

  // RECENT BOOKING STATUS & REJECTION REASONS
  bookings: [
    {
      id: "REQ-2026-881",
      event: "TechZephyr Coding Hackathon",
      venue: "Main Auditorium",
      requester: "Abhinav Nayak (President, TechZephyr Club)",
      date: "Nov 20, 2026 (09:00 AM - 06:00 PM)",
      status: "Pending Verification",
      notes: "Awaiting final clearance from Central Facilities Coordinator. Sound levels and fire safety check verified."
    },
    {
      id: "REQ-2026-879",
      event: "Robotics Club Late Night Autonomous Drone Testing",
      venue: "SAC Seminar Hall A",
      requester: "Robotics Club Rep",
      date: "Nov 02, 2026 (10:00 PM - 02:00 AM)",
      status: "Rejected",
      rejectionReason: "Violation of Campus Quiet Hours Policy (Section 4.2). Unmanned aerial craft cannot operate inside SAC after 09:30 PM without special Registrar approval."
    },
    {
      id: "REQ-2026-874",
      event: "Cultural Fest Rock Band Rehearsal",
      venue: "Block B Conference Room",
      requester: "Music Society",
      date: "Oct 28, 2026",
      status: "Rejected",
      rejectionReason: "Incompatible Venue Requisition: Conference rooms are strictly designated for quiet academic meetings. Rehearsals must be scheduled in SAC Amphitheatre or Music Studio."
    },
    {
      id: "REQ-2026-872",
      event: "CSE Midsem Seating Block B Allocation",
      venue: "Block B Smart Lecture Rooms (CR-201 to CR-204)",
      requester: "Prof. Ananya Pattnaik (HOD)",
      date: "Nov 10-15, 2026",
      status: "Approved",
      notes: "Fully reserved for 2nd & 3rd Year B.Tech Examinations."
    }
  ],

  // RESCHEDULING & DISRUPTIONS
  disruptions: [
    {
      issue: "Faculty Emergency Leave - Dr. Manoranjan Sharma",
      course: "AI & Machine Learning (CS303)",
      originalSlot: "Tuesday 10:45 AM • CR-204",
      resolvedSlot: "Thursday 02:30 PM • CR-204 (Verified free slot, no student conflict)",
      status: "Proposed & Awaiting Coordinator Click"
    },
    {
      issue: "Lab Maintenance Window - Advanced AI Lab C",
      course: "Parallel Computing Lab",
      originalSlot: "Wednesday 01:30 PM • Lab C",
      resolvedSlot: "Rerouted to Software Engineering Lab B (35 Workstations Ready)",
      status: "Approved by Admin"
    }
  ],

  // GOVERNANCE & POLICY RULES
  policies: [
    "Strict Policy: The AI Assistant is an informational and advisory guide only. It CANNOT directly approve requisitions, alter room assignments, or cancel lectures.",
    "All room bookings must be approved by the Department Coordinator or Central Administrative Portal.",
    "Faculty schedule swaps require bilateral confirmation from both faculty members and department timetable chair."
  ]
};
