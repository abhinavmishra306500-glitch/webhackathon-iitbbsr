import React, { useState } from 'react';
import { ClipboardList, Plus, CheckCircle2 } from 'lucide-react';

export const ExamSchedulerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'midsem' | 'endsem'>('midsem');

  const exams = [
    { code: 'CS301', subject: 'Design & Analysis of Algorithms', date: 'Nov 12, 2026', time: '10:00 AM - 12:00 PM', block: 'Block B - Hall 1 & 2', capacity: '120 / 120', invigilators: 'Dr. Sen, Prof. Pattnaik', status: 'Scheduled' },
    { code: 'CS302', subject: 'Computer Organization & Architecture', date: 'Nov 14, 2026', time: '10:00 AM - 12:00 PM', block: 'Block A - 201 to 204', capacity: '115 / 120', invigilators: 'Dr. Sharma, Prof. Das', status: 'Scheduled' },
    { code: 'CS305', subject: 'Database Management Systems', date: 'Nov 17, 2026', time: '02:00 PM - 04:00 PM', block: 'Block C - Main Hall', capacity: '120 / 120', invigilators: 'Dr. Rath, Prof. Roy', status: 'Draft' },
  ];

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Exam Scheduler</h2>
            <p className="text-xs text-slate-300">Schedule midsem & endsem examinations and manage seating rosters</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors">
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>Schedule Examination</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1 p-1 rounded-2xl liquid-glass-navbar">
          <button
            onClick={() => setActiveTab('midsem')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'midsem' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Midsem Examination 2026
          </button>
          <button
            onClick={() => setActiveTab('endsem')}
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'endsem' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            Endsem Final Roster
          </button>
        </div>

        <div className="text-xs text-cyan-300 flex items-center gap-1 font-mono">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Zero Seating Conflicts Detected</span>
        </div>
      </div>

      {/* Exam Table Card */}
      <div className="liquid-glass-card rounded-2xl overflow-hidden p-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 text-slate-300 uppercase font-semibold text-[10px] tracking-wider bg-white/5">
              <tr>
                <th className="py-3 px-4">Subject & Code</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Exam Hall / Block</th>
                <th className="py-3 px-4">Allocated Students</th>
                <th className="py-3 px-4">Invigilator Leads</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {exams.map((exam, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4">
                    <p className="font-bold text-white text-xs">{exam.subject}</p>
                    <p className="text-[10px] font-mono text-cyan-300">{exam.code}</p>
                  </td>
                  <td className="py-3 px-4">
                    <p className="text-slate-200 font-medium">{exam.date}</p>
                    <p className="text-[10px] text-slate-400">{exam.time}</p>
                  </td>
                  <td className="py-3 px-4 text-slate-200">{exam.block}</td>
                  <td className="py-3 px-4 font-mono text-slate-200">{exam.capacity}</td>
                  <td className="py-3 px-4 text-slate-300">{exam.invigilators}</td>
                  <td className="py-3 px-4 text-right">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      exam.status === 'Scheduled'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {exam.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
