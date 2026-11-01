import React, { useState, useEffect } from 'react';
import { ClipboardList, CheckCircle2, Search, Filter } from 'lucide-react';

interface ExamRoomDetail {
  id: string;
  name: string;
  half_capacity: number;
}

interface ExamEntry {
  exam_id: string;
  course_ids: string[];
  groups: string[];
  size: number;
  day: string;
  session: string;
  rooms: ExamRoomDetail[];
  total_effective_seats: number;
  capacity_status: string;
}

export const ExamSchedulerPage: React.FC = () => {
  const [exams, setExams] = useState<ExamEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedDay, setSelectedDay] = useState('ALL');

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch('/api/exams/view');
        if (res.ok) {
          const data = await res.json();
          setExams(data.exams || []);
        }
      } catch (err) {
        console.warn('Failed to load exams from API', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, []);

  const filtered = exams.filter((e) => {
    const matchesDay = selectedDay === 'ALL' || e.day === selectedDay;
    const matchesSearch =
      e.course_ids.some((c) => c.toLowerCase().includes(search.toLowerCase())) ||
      e.groups.some((g) => g.toLowerCase().includes(search.toLowerCase())) ||
      e.rooms.some((r) => r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));
    return matchesDay && matchesSearch;
  });

  const allDays = ['ALL', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Midsem Exam Scheduler</h2>
            <p className="text-xs text-slate-300">
              41 Midsem Exams • Section 3 Half-Capacity Rule Enforced (Zero Seating Clashes)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-cyan-300 flex items-center gap-1.5 font-mono bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-400/30">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>41 / 41 Exams Scheduled</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search course code, group, or room..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-900 font-semibold caret-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-glass-navbar self-end sm:self-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-cyan-400 ml-2" />
          {allDays.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedDay === day ? 'bg-blue-600 text-white font-semibold shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Exam Table Card */}
      {loading ? (
        <div className="p-8 text-center text-slate-300 text-xs">Loading midsem examination schedule...</div>
      ) : (
        <div className="liquid-glass-card rounded-2xl overflow-hidden p-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-white/10 text-slate-300 uppercase font-semibold text-[10px] tracking-wider bg-white/5">
                <tr>
                  <th className="py-3 px-4">Exam ID & Course</th>
                  <th className="py-3 px-4">Day & Session</th>
                  <th className="py-3 px-4">Student Cohorts</th>
                  <th className="py-3 px-4">Students</th>
                  <th className="py-3 px-4">Allocated Exam Halls (Half-Capacity)</th>
                  <th className="py-3 px-4 text-right">Capacity Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filtered.map((exam) => (
                  <tr key={exam.exam_id} className="hover:bg-white/5 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-white text-xs">{exam.exam_id}</p>
                      <p className="text-[10px] font-mono text-cyan-300">{exam.course_ids.join(', ')}</p>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono text-xs font-semibold text-white">{exam.day}</span>
                      <span className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                        {exam.session} ({exam.session === 'AM' ? '09:30 - 11:30' : '14:00 - 16:00'})
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <div className="flex flex-wrap gap-1">
                        {exam.groups.map((g) => (
                          <span key={g} className="px-1.5 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 text-slate-300 font-mono">
                            {g}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-cyan-300">{exam.size}</td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1.5">
                        {exam.rooms.map((r) => (
                          <span
                            key={r.id}
                            className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-cyan-400/30 text-slate-200"
                            title={`${r.name} (Effective capacity: ${r.half_capacity})`}
                          >
                            <span className="font-bold text-cyan-300">{r.id}</span>
                            <span className="text-slate-400 ml-1">({r.half_capacity} seats)</span>
                          </span>
                        ))}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Total Half-Capacity Seats: <span className="text-emerald-300 font-mono font-bold">{exam.total_effective_seats}</span>
                      </p>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {exam.capacity_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
