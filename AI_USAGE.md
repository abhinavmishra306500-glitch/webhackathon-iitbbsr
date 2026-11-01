# AI Usage Declaration (CampusSync — CIT)

This document complies with Section 6 of the official CrunchWeek Problem Statement regarding full declaration of artificial intelligence tools and models.

---

## 1. Models & APIs Used in the Product

| Model / API | Provider | Purpose / Functionality | Invocation Point |
| :--- | :--- | :--- | :--- |
| **`gemini-3.1-flash-lite-preview`** *(with automatic fallback to `gemini-3-flash-preview` / `gemini-flash-latest`)* | Google AI Studio / Google Gemini API | Natural language conversational assistance, answering institutional scheduling questions, explaining room & timetable decisions in plain English & Hinglish, and structured venue booking drafting. | Called via authenticated backend proxy (`POST /api/ai/chat` & `POST /api/ai/explain`). Never called directly from client browsers. |

---

## 2. Tools Used During Development

| AI Tool | Parts of the Project Assisted |
| :--- | :--- |
| **Google Antigravity Coding Assistant** | Architecture planning, boilerplate generation for FastAPI routes, OR-Tools CP-SAT constraint formulation, Three.js 3D campus layout matching aerial campus references, glassmorphic UI components, and test suite creation. |

---

## 3. Location of Prompts & Knowledge Grounding

All system instructions, prompt templates, and institutional knowledge injections are securely stored and versioned on the backend:
- [`server/index.js`](server/index.js): System prompt formulating CIT advisory role and strict non-autonomous approval policies.
- [`server/campusKnowledge.js`](server/campusKnowledge.js): Grounded facts on timetables, venue capacities, faculty office hours, and rejection audit reasons.
- [`backend/nlp_parser.py`](backend/nlp_parser.py): Deterministic regex & keyword parsing rules for English/Hinglish entity extraction.

---

## 4. What the LLM is NOT Allowed to Decide (Strict Safety Guardrails)

Per Section 6 of the CrunchWeek rules, **the LLM is strictly restricted from making scheduling decisions**:
1. **No Autonomous Approvals:** The LLM cannot approve, reject, or modify any venue booking or exam schedule.
2. **No Timetable Mutations:** The LLM cannot reschedule sessions, move classes, or declare a schedule clash-free.
3. **Deterministic Verification Required:** All validity checks, capacity verifications, clash detections, and timetable generation are executed solely by deterministic backend code (**Google OR-Tools CP-SAT solver** and Python validation logic).
4. **Human-in-the-Loop:** All schedule changes, disruptions, and lab swaps require explicit Human Administrator / Department Coordinator review and approval via the Approvals Portal.
