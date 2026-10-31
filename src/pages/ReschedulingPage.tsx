import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';

export const ReschedulingPage: React.FC = () => {
  const [resolvedIds, setResolvedIds] = useState<number[]>([]);

  const disruptions = [
    {
      id: 1,
      title: 'Faculty Emergency Leave - Dr. Manoranjan Sharma',
      original: 'AI & Machine Learning (CS303) • Tuesday 10:45 AM • CR-204',
      proposed: 'Shifted to Thursday 02:30 PM • CR-204 (Free Slot Verified)',
      urgency: 'High',
      impact: '62 Students affected',
    },
    {
      id: 2,
      title: 'Lab Maintenance Window - Advanced AI Lab C',
      original: 'Parallel Computing Lab • Wednesday 01:30 PM • Lab C',
      proposed: 'Re-routed to Software Engineering Lab B (35 Workstations Ready)',
      urgency: 'Medium',
      impact: '32 Students affected',
    },
    {
      id: 3,
      title: 'Guest Lecture Alignment - Silicon Valley Industry Expert',
      original: 'Open Elective Slot • Friday 03:30 PM',
      proposed: 'Merged into Main Auditorium 11:00 AM • Dual Branch Combined',
      urgency: 'Low',
      impact: '120 Students affected',
    },
  ];

  const handleApplyResolution = (id: number) => {
    setResolvedIds([...resolvedIds, id]);
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Rescheduling & Disruption Engine</h2>
            <p className="text-xs text-slate-300">Automatically handle academic timetable disruptions and propose verified swaps</p>
          </div>
        </div>

        <button className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Scan Active Clashes</span>
        </button>
      </div>

      {/* Disruption Cards */}
      <div className="space-y-3">
        {disruptions.map((item) => {
          const isResolved = resolvedIds.includes(item.id);
          return (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-2xl liquid-glass-card transition-all ${
                isResolved ? 'opacity-60 border-emerald-500/40' : ''
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${isResolved ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <h3 className="text-sm font-bold text-white">{item.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {item.impact}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    item.urgency === 'High' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {item.urgency} Priority
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20">
                  <p className="text-[10px] uppercase font-bold text-rose-300 mb-1">Original Disrupted Schedule</p>
                  <p className="text-slate-200 font-medium">{item.original}</p>
                </div>

                <div className="p-3 rounded-xl bg-cyan-950/30 border border-cyan-400/30">
                  <p className="text-[10px] uppercase font-bold text-cyan-300 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>AI Recommended Alternative</span>
                  </p>
                  <p className="text-white font-medium">{item.proposed}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                {isResolved ? (
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Schedule Swap Synchronized to ERP</span>
                  </span>
                ) : (
                  <button
                    onClick={() => handleApplyResolution(item.id)}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-cyan-600 text-white text-xs font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    <span>Approve & Apply Rescheduling</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
