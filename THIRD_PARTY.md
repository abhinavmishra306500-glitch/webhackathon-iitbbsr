# Third-Party Libraries & Solvers Declaration (CampusSync — CIT)

This document complies with Section 6 of the official CrunchWeek Problem Statement regarding open-source libraries and solver declarations.

---

## 1. Constraint Solvers & Mathematical Optimizers

| Library / Tool | Version | License | Purpose in Project |
| :--- | :--- | :--- | :--- |
| **Google OR-Tools (CP-SAT Solver)** | `9.15.6755` | Apache 2.0 | Formulates and solves the weekly timetable (189 sessions), satisfies all H1–H14 hard constraints, minimizes S1–S6 soft penalties, schedules midsem examinations with half-capacity bin-packing, and optimizes disruption repairs for minimal session movement. |

---

## 2. Backend Frameworks & Libraries

| Library | Version | License | Purpose in Project |
| :--- | :--- | :--- | :--- |
| **FastAPI** | `0.162.0` | MIT | High-performance asynchronous REST API framework for scheduling endpoints, validator execution, and disruption management. |
| **Uvicorn** | `0.54.0` | BSD-3-Clause | ASGI web server implementation. |
| **Pydantic** | `2.14.2` | MIT | Data parsing, validation, and schema definitions. |
| **SQLAlchemy** | `2.1.6` | MIT | Database object-relational mapping. |
| **Pytest** | `9.2.0` | MIT | Comprehensive automated backend test suite. |
| **HTTPX** | `0.28.1` | BSD-3-Clause | Asynchronous HTTP client for API and test client requests. |
| **Express / Node.js** | `v26.8.2` | MIT | Node backend proxy bridge for Google Gemini AI integration. |

---

## 3. Frontend & 3D Visualization Libraries

| Library | Version | License | Purpose in Project |
| :--- | :--- | :--- | :--- |
| **React** | `19.3.1` | MIT | UI library for reactive dashboard components. |
| **React Router DOM** | `7.18.5` | MIT | Client-side routing across all 10 dashboard modules. |
| **Three.js** | `0.187.0` | MIT | WebGL 3D rendering engine for CIT interactive 3D campus environment. |
| **GSAP (GreenSock)** | `3.15.0` | Standard | High-performance micro-animations and entrance transitions. |
| **Tailwind CSS** | `3.4.19` | MIT | Utility-first styling for liquid transparent glassmorphism design. |
| **Lucide React** | `1.66.0` | ISC | Accessible, modern iconography. |

---

## 4. Prior Projects Statement
In strict compliance with Section 6, this project was developed from scratch for the CrunchWeek hackathon. No pre-built code or prior timetable submissions from previous hackathons were utilized.
