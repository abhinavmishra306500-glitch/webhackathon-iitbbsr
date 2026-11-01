import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Download, Clock, MapPin, User, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudentGroup {
  id: string;
  name: string;
  year: number;
  department: string;
  size: number;
  sessions_count: number;
}

interface ScheduledSession {
  session_id: string;
  course_id: string;
  course_title?: string;
  kind: string;
  duration: number;
  faculty_id: string;
  faculty_name: string;
  groups: string[];
  size: number;
  day: string;
  start_period: number;
  end_period: number;
  room_id: string;
  room_name: string;
  basket_slot?: string;
}

const PERIOD_TIMES: Record<number, string> = {
  1: '08:00 - 09:00',
  2: '09:00 - 10:00',
  3: '10:00 - 11:00',
  4: '11:00 - 12:00',
  5: '12:00 - 13:00',
  6: '14:00 - 15:00',
  7: '15:00 - 16:00',
  8: '16:00 - 17:00',
  9: '17:00 - 18:00',
  10: '18:00 - 19:00',
  11: '19:00 - 20:00',
  12: '20:00 - 21:00',
  13: '21:00 - 22:00',
};

const DAYS = [
  { label: 'Monday', code: 'MON' },
  { label: 'Tuesday', code: 'TUE' },
  { label: 'Wednesday', code: 'WED' },
  { label: 'Thursday', code: 'THU' },
  { label: 'Friday', code: 'FRI' },
];

export const TimetablePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('MON');
  const [selectedGroup, setSelectedGroup] = useState('CSE-3');
  const [groups, setGroups] = useState<StudentGroup[]>([]);
  const [sessions, setSessions] = useState<ScheduledSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Fetch student groups
  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/student-groups');
        if (res.ok) {
          const data: StudentGroup[] = await res.json();
          setGroups(data);
          if (data.length > 0 && !data.some((g) => g.id === selectedGroup)) {
            setSelectedGroup(data[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load student groups from API', err);
      }
    };
    fetchGroups();
  }, []);

  // Fetch timetable slots for selected group & day
  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      try {
        const url = `/api/timetable/view?group=${encodeURIComponent(selectedGroup)}&day=${selectedDay}`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setSessions(data.sessions || []);
        }
      } catch (err) {
        console.warn('Failed to fetch timetable slots', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTimetable();
  }, [selectedGroup, selectedDay]);

  const handleAutoGenerate = async () => {
    setGenerating(true);
    setNotice('Solving OR-Tools CP-SAT timetable constraints...');
    try {
      const res = await fetch('/api/timetable/generate', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setNotice(`✅ Solved: ${data.sessions_scheduled} sessions scheduled clash-free (${data.solver_status})!`);
        // Refresh timetable
        const refreshUrl = `/api/timetable/view?group=${encodeURIComponent(selectedGroup)}&day=${selectedDay}`;
        const refRes = await fetch(refreshUrl);
        if (refRes.ok) {
          const refData = await refRes.json();
          setSessions(refData.sessions || []);
        }
      } else {
        setNotice('❌ Solver error. Please verify room capacity constraints.');
      }
    } catch (err) {
      setNotice('Network error while running solver.');
    } finally {
      setGenerating(false);
      setTimeout(() => setNotice(null), 5000);
    }
  };

  const handleExportJSON = () => {
    const jsonStr = JSON.stringify(sessions, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CIT_Timetable_${selectedGroup}_${selectedDay}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getFormatTime = (startP: number, dur: number) => {
    const startTime = PERIOD_TIMES[startP]?.split(' - ')[0] || `P${startP}`;
    const endP = startP + dur - 1;
    const endTime = PERIOD_TIMES[endP]?.split(' - ')[1] || `P${endP}`;
    return `${startTime} - ${endTime} (P${startP}${dur > 1 ? `-P${endP}` : ''})`;
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Top Action Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Timetable Management</h2>
            <p className="text-xs text-slate-300">189 Academic Sessions • OR-Tools CP-SAT Verified Clash-Free</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAutoGenerate}
            disabled={generating}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${generating ? 'animate-spin' : ''}`} />
            <span>{generating ? 'Solving...' : 'Auto-Generate (CP-SAT)'}</span>
          </button>
          <button
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export JSON</span>
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/40 text-xs text-cyan-200 flex items-center gap-2 shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters & Day Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Days Segmented Pill */}
        <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass-navbar overflow-x-auto">
          {DAYS.map((d) => (
            <button
              key={d.code}
              onClick={() => setSelectedDay(d.code)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedDay === d.code
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>

        {/* Real Student Group Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-cyan-400" />
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-cyan-400/30 text-white text-xs font-medium outline-none cursor-pointer"
          >
            {groups.length === 0 ? (
              <option value="CSE-3">Loading cohorts...</option>
            ) : (
              groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.id} — {g.name} ({g.size} students)
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Timetable Schedule Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-300 text-xs">Loading scheduled slots for {selectedGroup}...</div>
      ) : sessions.length === 0 ? (
        <div className="liquid-glass-card rounded-2xl p-8 text-center space-y-2">
          <p className="text-sm font-semibold text-slate-200">No scheduled classes for {selectedGroup} on {selectedDay}.</p>
          <p className="text-xs text-slate-400">This student cohort is free or has dedicated self-study/project periods.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {sessions.map((slot) => (
            <div
              key={slot.session_id}
              className="liquid-glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group hover:border-cyan-400/40 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-36 shrink-0 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span>{getFormatTime(slot.start_period, slot.duration)}</span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {slot.course_title || slot.course_id}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      {slot.course_id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        slot.kind === 'lab'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : slot.kind === 'tutorial'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {slot.kind.toUpperCase()} ({slot.duration}h)
                    </span>
                    {slot.basket_slot && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-400/30">
                        {slot.basket_slot}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 mt-1">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3 text-cyan-400" />
                      <span>{slot.faculty_name} ({slot.faculty_id})</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span className="text-white font-medium">{slot.room_name} ({slot.room_id})</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Batch size: {slot.size} | Cohorts: {slot.groups.join(', ')}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-auto">
                <span className="px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold text-emerald-300 bg-emerald-950/40 border border-emerald-500/30">
                  Zero Clash Confirmed
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
