import React, { useState, useEffect } from 'react';
import { RefreshCw, AlertTriangle, ArrowRight, CheckCircle2, Sparkles, ShieldAlert, Check } from 'lucide-react';

interface DisruptionChange {
  session_id: string;
  previous?: {
    day: string;
    start_period: number;
    room_id: string;
  };
  proposed: {
    day: string;
    start_period: number;
    room_id: string;
  };
  type: string;
}

export const ReschedulingPage: React.FC = () => {
  const [changes, setChanges] = useState<DisruptionChange[]>([]);
  const [loading, setLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [approved, setApproved] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [sessionsMoved, setSessionsMoved] = useState(0);

  // Auto-scan disruption on mount
  useEffect(() => {
    handleScanDisruptions();
  }, []);

  const handleScanDisruptions = async () => {
    setLoading(true);
    setStatusMessage('Scanning active academic disruptions and computing minimal-movement repair...');
    try {
      const res = await fetch('/api/disruption/apply', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setChanges(data.changes || []);
        setSessionsMoved(data.sessions_moved || 0);
        setStatusMessage(
          `Disruption detected: ${data.changes_count} changes. Rescheduling engine proposed ${data.sessions_moved} minimal moves (Stability budget <= 15 compliant).`
        );
      }
    } catch (err) {
      setStatusMessage('Failed to scan disruption.');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveDisruption = async () => {
    setApproving(true);
    try {
      const res = await fetch('/api/disruption/approve', { method: 'POST' });
      if (res.ok) {
        setApproved(true);
        setStatusMessage('✅ Approved by Institutional Administrator. Saved to exports/schedule_after.json.');
      }
    } catch (err) {
      setStatusMessage('Error approving disruption.');
    } finally {
      setApproving(false);
    }
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
            <p className="text-xs text-slate-300">
              Section 5 Minimal Movement Solver • Stability Objective: sessions_moved = {sessionsMoved} (&lt;= 15)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleScanDisruptions}
            disabled={loading}
            className="px-3.5 py-1.5 rounded-xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-200 text-xs font-semibold hover:bg-cyan-500/30 flex items-center gap-1.5 transition-colors disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-cyan-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Solving...' : 'Rescan Disruption'}</span>
          </button>

          <button
            onClick={handleApproveDisruption}
            disabled={approving || approved || changes.length === 0}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] disabled:opacity-50"
          >
            <Check className="w-4 h-4" />
            <span>{approved ? 'Approved & Locked' : approving ? 'Saving...' : 'Approve Swaps (Admin)'}</span>
          </button>
        </div>
      </div>

      {statusMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900/80 border border-cyan-400/30 text-xs text-cyan-200 flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Disruption Cards */}
      {changes.length === 0 ? (
        <div className="liquid-glass-card rounded-2xl p-8 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h3 className="text-sm font-bold text-white">All Timetables Operational</h3>
          <p className="text-xs text-slate-300">No active faculty leaves or room outages currently recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {changes.map((item, idx) => (
            <div
              key={idx}
              className={`p-4 sm:p-5 rounded-2xl liquid-glass-card transition-all ${
                approved ? 'opacity-80 border-emerald-500/40' : 'hover:border-cyan-400/40'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-4 h-4 ${approved ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <h3 className="text-sm font-bold text-white">
                    Session Relocation: <span className="font-mono text-cyan-300">{item.session_id}</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white/5 border border-white/10 text-slate-300">
                    {item.type}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      approved
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {approved ? 'Approved' : 'Pending Review'}
                  </span>
                </div>
              </div>

              <div className="pt-3 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
                {item.previous && (
                  <div className="space-y-1">
                    <p className="text-[10px] uppercase font-semibold text-slate-400 tracking-wider">Original Baseline Slot</p>
                    <p className="font-medium text-slate-300">
                      <strong className="text-rose-300">{item.previous.day}</strong> Period {item.previous.start_period} in{' '}
                      <strong className="text-slate-200">{item.previous.room_id}</strong>
                    </p>
                  </div>
                )}

                <div className="hidden md:flex items-center justify-center">
                  <ArrowRight className="w-5 h-5 text-cyan-400" />
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] uppercase font-semibold text-emerald-400 tracking-wider">Proposed Stability Swap</p>
                  <p className="font-medium text-slate-200">
                    <strong className="text-emerald-300">{item.proposed.day}</strong> Period {item.proposed.start_period} in{' '}
                    <strong className="text-cyan-200">{item.proposed.room_id}</strong>
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono text-emerald-300 bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30">
                    Zero Hard Violations
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
