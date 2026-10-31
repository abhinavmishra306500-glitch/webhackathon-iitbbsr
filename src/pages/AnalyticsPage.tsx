import React from 'react';
import { BarChart2, TrendingUp, CheckCircle2 } from 'lucide-react';

export const AnalyticsPage: React.FC = () => {
  const blockUtilization = [
    { name: 'Block A (Engineering Wings)', rate: 91, rooms: 10, peak: '10:45 AM - 01:30 PM' },
    { name: 'Block B (Computing Center)', rate: 94, rooms: 8, peak: '09:30 AM - 03:30 PM' },
    { name: 'Block C (Advanced Research Labs)', rate: 82, rooms: 6, peak: '01:30 PM - 05:00 PM' },
    { name: 'Central Wing & Auditoriums', rate: 76, rooms: 3, peak: '02:00 PM - 06:00 PM' },
  ];

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Campus Analytics & Telemetry</h2>
            <p className="text-xs text-slate-300">Space utilization, schedule conflict tracking, and optimization metrics</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-400/30 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>99.4% Timetable Efficiency</span>
          </span>
        </div>
      </div>

      {/* Utilization Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 p-5 rounded-2xl liquid-glass-card space-y-4">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Campus Block Space Utilization Rate</span>
          </h3>

          <div className="space-y-4 pt-1">
            {blockUtilization.map((b, i) => (
              <div key={i} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{b.name}</span>
                  <span className="font-mono font-bold text-cyan-300">{b.rate}%</span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-white/10 overflow-hidden border border-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-600 via-cyan-400 to-emerald-400 transition-all duration-700"
                    style={{ width: `${b.rate}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>{b.rooms} Rooms Monitored</span>
                  <span>Peak Hours: {b.peak}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Metric Cards */}
        <div className="lg:col-span-4 space-y-3">
          <div className="p-4 rounded-2xl liquid-glass-card space-y-1">
            <p className="text-[11px] font-semibold text-slate-300 uppercase">Average Faculty Workload</p>
            <p className="text-2xl font-bold font-display text-white">18.4 hrs/wk</p>
            <p className="text-[11px] text-cyan-300">Within UGC / AICTE norms</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-card space-y-1">
            <p className="text-[11px] font-semibold text-slate-300 uppercase">Resolved Schedule Conflicts</p>
            <p className="text-2xl font-bold font-display text-emerald-400">0 Active / 14 Resolved</p>
            <p className="text-[11px] text-slate-300">100% automated resolution via AI</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-card space-y-1">
            <p className="text-[11px] font-semibold text-slate-300 uppercase">Energy Savings (Smart AC Roster)</p>
            <p className="text-2xl font-bold font-display text-cyan-300">22.8%</p>
            <p className="text-[11px] text-slate-300">CIT Green Campus Initiative</p>
          </div>
        </div>
      </div>
    </div>
  );
};
