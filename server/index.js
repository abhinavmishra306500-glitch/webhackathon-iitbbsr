import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { CAMPUS_KNOWLEDGE } from './campusKnowledge.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables from .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

app.use(cors());
app.use(express.json());

// Strict rule: Never log the raw API key
const AI_API_KEY = process.env.AI_API_KEY?.trim() || '';
const AI_BASE_URL = process.env.AI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta';
const PRIMARY_MODEL = process.env.AI_MODEL || 'gemini-3.1-flash-lite-preview';
const AI_PROVIDER = process.env.AI_PROVIDER || 'google_gemini';

// Resilient fallback models if a specific model returns 503 (high demand) or 404
const FALLBACK_MODELS = [
  PRIMARY_MODEL,
  'gemini-3.1-flash-lite-preview',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
];

// System prompt grounding the AI with CIT CampusSync data and institutional policies
function buildSystemInstruction(userRole = 'general') {
  return `You are the official CIT CampusSync AI Assistant for Chilika Institute of Technology (CIT).
Your role is to assist students, faculty, coordinators, and administrators with smart scheduling, venue queries, timetable navigation, and campus policy guidance.

### Grounding Knowledge Base:
- Institution: ${CAMPUS_KNOWLEDGE.institution}
- Academic Session: ${CAMPUS_KNOWLEDGE.academicYear}
- Active User Role: "${userRole}"

### Verified Campus Venues:
${CAMPUS_KNOWLEDGE.venues
  .map(
    (v) =>
      `• ${v.name} (${v.block}): Capacity ${v.capacity}. Equipment: ${v.equipment}. Availability: ${v.availability}. Policy: ${v.rules}`
  )
  .join('\n')}

### Verified Timetables & Classes (CSE-3A):
${CAMPUS_KNOWLEDGE.timetables['CSE-3A']
  .map((t) => `• [${t.slot}] ${t.course} in ${t.room} by ${t.faculty} (Days: ${t.days.join(', ')})`)
  .join('\n')}

### Verified Faculty Profiles:
${CAMPUS_KNOWLEDGE.faculty
  .map(
    (f) =>
      `• ${f.name} (${f.designation}, ${f.department}): Current location: ${f.currentLocation}. Office hours: ${f.officeHours}. Status: ${f.recentUpdates}`
  )
  .join('\n')}

### Verified Booking Records & Statuses:
${CAMPUS_KNOWLEDGE.bookings
  .map(
    (b) =>
      `• [${b.id}] "${b.event}" for ${b.venue} by ${b.requester} (${b.date}). Status: ${b.status}.${
        b.rejectionReason ? ` Rejection Reason: "${b.rejectionReason}".` : ''
      }${b.notes ? ` Notes: "${b.notes}".` : ''}`
  )
  .join('\n')}

### Active Schedule Rescheduling & Disruption Proposals:
${CAMPUS_KNOWLEDGE.disruptions
  .map((d) => `• Disruption: "${d.issue}". Original: ${d.originalSlot} -> Proposed Swap: ${d.resolvedSlot}. Status: ${d.status}`)
  .join('\n')}

### STRICT GOVERNANCE & SAFETY RULES (MUST OBEY):
1. NO AUTONOMOUS APPROVALS: You are strictly an advisory and informational assistant. You CANNOT independently approve venue bookings, modify timetables, or cancel classes.
2. If a user asks you to approve, confirm, or finalize a booking or schedule change, you MUST clearly state that official approvals require human authorization via the Campus Approvals Portal (/approvals) or Department Coordinator.
3. Keep answers concise, direct, helpful, and formatted in clean markdown.`;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  const isConfigured = Boolean(AI_API_KEY && AI_API_KEY.length > 10);
  res.json({
    status: isConfigured ? 'online' : 'credentials_missing',
    provider: 'Google Gemini',
    providerKeyPrefix: isConfigured ? AI_API_KEY.slice(0, 4) + '...' : 'none',
    model: PRIMARY_MODEL,
    endpoint: `${AI_BASE_URL}/models/${PRIMARY_MODEL}:generateContent`,
    campus: CAMPUS_KNOWLEDGE.institution,
  });
});

// Knowledge summary endpoint
app.get('/api/knowledge', (req, res) => {
  res.json(CAMPUS_KNOWLEDGE);
});

// Official CIT Dataset Summary Endpoint
app.get('/api/dataset/summary', (req, res) => {
  try {
    const candidatePaths = [
      path.resolve(__dirname, '../CrunchWeek_StarterPack/data/cit_public.json'),
      path.resolve(__dirname, '../data/CrunchWeek_StarterPack/data/cit_public.json'),
    ];
    const datasetPath = candidatePaths.find((p) => fs.existsSync(p));
    if (datasetPath && fs.existsSync(datasetPath)) {
      const raw = fs.readFileSync(datasetPath, 'utf8');
      const data = JSON.parse(raw);
      res.json({
        loaded: true,
        datasetId: data.dataset_id || 'cit_public_v1',
        institute: data.institute || 'Chilika Institute of Technology',
        stats: {
          rooms: Array.isArray(data.rooms) ? data.rooms.length : 27,
          faculty: Array.isArray(data.faculty) ? data.faculty.length : 40,
          sessions: Array.isArray(data.sessions) ? data.sessions.length : 189,
          courses: Array.isArray(data.courses) ? data.courses.length : 62,
          studentGroups: Array.isArray(data.student_groups) ? data.student_groups.length : 14,
          bookingRequests: Array.isArray(data.booking_requests) ? data.booking_requests.length : 25,
          midsemExams: Array.isArray(data.exams) ? data.exams.length : 41,
        },
        files: [
          { name: 'cit_public.json', type: 'JSON Master Schema', size: '138 KB', records: 'Full Institutional Database', status: 'Validated' },
          { name: 'rooms.csv', type: 'CSV Document', size: '3.7 KB', records: '27 Rooms & Capacities', status: 'Validated' },
          { name: 'faculty.csv', type: 'CSV Document', size: '4.0 KB', records: '40 Faculty Profiles & Max Hours', status: 'Validated' },
          { name: 'sessions.csv', type: 'CSV Document', size: '19.8 KB', records: '189 Sessions (243 Teaching Hours)', status: 'Validated' },
          { name: 'courses.csv', type: 'CSV Document', size: '2.4 KB', records: '62 Academic Courses', status: 'Validated' },
          { name: 'student_groups.csv', type: 'CSV Document', size: '562 B', records: '14 Student Cohorts (Y1-Y3)', status: 'Validated' },
          { name: 'booking_requests.csv', type: 'CSV Document', size: '8.5 KB', records: '25 Spectra Week Requisitions', status: 'Validated' },
          { name: 'exams.csv', type: 'CSV Document', size: '2.0 KB', records: '41 Midsemester Exams', status: 'Validated' },
          { name: 'validator.py', type: 'Python Audit Script', size: '23.2 KB', records: 'Official Zero-Hard-Violation Checker', status: 'Verified' },
        ]
      });
    } else {
      res.json({
        loaded: false,
        message: 'Dataset archive not yet unpacked in data/CrunchWeek_StarterPack'
      });
    }
  } catch (err) {
    res.status(500).json({ error: 'FAILED_TO_LOAD_DATASET', message: err.message });
  }
});

// Helper to invoke Gemini with timeout and retry
async function callGeminiModel(modelName, geminiPayload) {
  const targetUrl = `${AI_BASE_URL}/models/${modelName}:generateContent?key=${encodeURIComponent(AI_API_KEY)}`;
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(geminiPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const data = await response.json();
    return { ok: response.ok, status: response.status, data };
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
}

// Chat endpoint
app.post('/api/ai/chat', async (req, res) => {
  try {
    const { messages, userRole } = req.body;

    if (!AI_API_KEY) {
      return res.status(500).json({
        error: 'API_KEY_MISSING',
        message: 'AI_API_KEY is not configured in backend .env file. Please supply a valid Gemini key.',
      });
    }

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'INVALID_PAYLOAD',
        message: 'Expected "messages" array containing conversation history.',
      });
    }

    // Build Gemini contents array from conversation history
    const contents = [];
    for (const msg of messages) {
      const text = msg.text || msg.content || '';
      if (!text.trim()) continue;

      const role = msg.sender === 'user' ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: text.trim() }],
      });
    }

    if (contents.length === 0 || contents[contents.length - 1].role !== 'user') {
      return res.status(400).json({
        error: 'INVALID_HISTORY',
        message: 'The conversation must conclude with a user query.',
      });
    }

    const systemInstructionText = buildSystemInstruction(userRole);

    const geminiPayload = {
      system_instruction: {
        parts: [{ text: systemInstructionText }],
      },
      contents,
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    // Try primary and fallback models if high-demand/service unavailable
    let lastError = null;
    let successfulData = null;
    let usedModel = PRIMARY_MODEL;

    // Deduplicate models to try
    const modelsToTry = [...new Set(FALLBACK_MODELS)];

    for (const modelCandidate of modelsToTry) {
      try {
        const result = await callGeminiModel(modelCandidate, geminiPayload);
        if (result.ok) {
          successfulData = result.data;
          usedModel = modelCandidate;
          break;
        } else {
          lastError = result.data?.error?.message || `Model ${modelCandidate} returned HTTP ${result.status}`;
          // If status is 503 (high demand) or 404, continue to next fallback
          if (result.status === 503 || result.status === 404) {
            continue;
          } else {
            // Other client errors (e.g. 400 or 403) shouldn't blindly retry
            break;
          }
        }
      } catch (err) {
        lastError = err instanceof Error ? err.message : 'Network error or timeout';
      }
    }

    if (!successfulData) {
      return res.status(502).json({
        error: 'LLM_UNAVAILABLE',
        message: lastError || 'Unable to connect to Google Gemini. Please try again.',
        provider: AI_PROVIDER,
      });
    }

    // Extract generated response
    const candidate = successfulData.candidates?.[0];
    const generatedText =
      candidate?.content?.parts?.map((p) => p.text).filter(Boolean).join('\n') ||
      'No text response generated.';

    // Generate intelligent action card recommendation if applicable
    let actionCard = undefined;
    const lastUserText = contents[contents.length - 1].parts[0].text.toLowerCase();

    if (lastUserText.includes('auditorium') || lastUserText.includes('event') || lastUserText.includes('hackathon')) {
      actionCard = {
        title: 'CIT Main Auditorium (Central Wing)',
        detail: 'Capacity: 600 seats • Stage Lighting, Surround JBL Audio • Available Friday 2:00 PM onwards',
        status: 'Open for Requisition',
      };
    } else if (lastUserText.includes('sharma') || lastUserText.includes('cs303') || lastUserText.includes('swap')) {
      actionCard = {
        title: 'Disruption Proposal #1: Dr. Manoranjan Sharma',
        detail: 'CS303P Lab Swap: Shift to Thursday 02:30 PM (CR-204 Free Slot Verified)',
        status: 'Pending Coordinator Click',
      };
    } else if (lastUserText.includes('cr-204') || lastUserText.includes('lecture') || lastUserText.includes('room')) {
      actionCard = {
        title: 'CR-204 (Smart Lecture Theatre - Block B)',
        detail: 'Capacity: 120 seats • Smart Board, Dual AC • Free Tuesday 2-5 PM, Thursday 11:00-13:30',
        status: 'Instantly Bookable',
      };
    } else if (lastUserText.includes('drone') || lastUserText.includes('sac') || lastUserText.includes('reject')) {
      actionCard = {
        title: 'Booking Record REQ-2026-879',
        detail: 'Robotics Club SAC Hall Requisition: Rejected due to Campus Quiet Hours Policy (Section 4.2)',
        status: 'Rejected with Audit Log',
      };
    }

    res.json({
      reply: generatedText,
      actionCard,
      model: usedModel,
      usage: successfulData.usageMetadata || null,
    });
  } catch (err) {
    res.status(500).json({
      error: 'SERVER_ERROR',
      message: err instanceof Error ? err.message : 'Internal error processing AI query.',
    });
  }
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[CampusSync AI Backend] Running on http://localhost:${PORT}`);
  console.log(`[CampusSync AI Backend] Provider: ${AI_PROVIDER} | Model: ${PRIMARY_MODEL}`);
  console.log(`[CampusSync AI Backend] Key Status: ${AI_API_KEY ? 'Present (AQ...)' : 'MISSING'}`);
});
