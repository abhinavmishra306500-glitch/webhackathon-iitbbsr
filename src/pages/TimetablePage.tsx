import React, { useState } from 'react';
import { Calendar, Filter, Download, Clock, MapPin, User, Sparkles } from 'lucide-react';

export const TimetablePage: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const [selectedBatch, setSelectedBatch] = useState('CSE-3A');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Sample schedule for selected batch & day
  const slots = [
    { time: '08:30 - 09:30', course: 'Design & Analysis of Algorithms', code: 'CS301', room: 'CR-204 (Block B)', faculty: 'Prof. Ananya Pattnaik', type: 'Lecture' },
    { time: '09:30 - 10:30', course: 'Computer Organization & Arch.', code: 'CS302', room: 'CR-204 (Block B)', faculty: 'Dr. Rajeshwar Sen', type: 'Lecture' },
    { time: '10:45 - 12:45', course: 'AI & Machine Learning Lab', code: 'CS303P', room: 'Adv. AI Lab (Block C)', faculty: 'Dr. Manoranjan Sharma', type: 'Lab' },
    { time: '01:30 - 02:30', course: 'Formal Language & Automata', code: 'CS304', room: 'CR-102 (Block A)', faculty: 'Prof. S. Mohanty', type: 'Lecture' },
    { time: '02:30 - 03:30', course: 'Database Management Systems', code: 'CS305', room: 'CR-102 (Block A)', faculty: 'Dr. P. Rath', type: 'Tutorial' },
  ];

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
            <p className="text-xs text-slate-300">Generate, view, and balance weekly timetables for CIT campus</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Auto-Generate</span>
          </button>
          <button className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* Filters & Day Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Days Segmented Pill */}
        <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass-navbar overflow-x-auto">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedDay === day
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {/* Batch Selector */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Filter className="w-4 h-4 text-cyan-400" />
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-900/60 border border-cyan-400/30 text-white text-xs font-medium outline-none"
          >
            <option value="CSE-3A">Batch: CSE 3rd Sem (Sec A)</option>
            <option value="CSE-5B">Batch: CSE 5th Sem (Sec B)</option>
            <option value="IT-3A">Batch: IT 3rd Sem (Sec A)</option>
            <option value="ECE-4A">Batch: ECE 4th Sem (Sec A)</option>
          </select>
        </div>
      </div>

      {/* Timetable Schedule Grid */}
      <div className="space-y-3">
        {slots.map((slot, index) => (
          <div
            key={index}
            className="liquid-glass-card rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-28 shrink-0 text-xs font-mono font-bold text-cyan-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>{slot.time}</span>
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors">
                    {slot.course}
                  </h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                    {slot.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    slot.type === 'Lab'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30'
                      : 'bg-purple-500/20 text-purple-300 border border-purple-400/30'
                  }`}>
                    {slot.type}
                  </span>
                </div>

                <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{slot.room}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-blue-400" />
                    <span>{slot.faculty}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end md:self-auto">
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Synchronized
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
