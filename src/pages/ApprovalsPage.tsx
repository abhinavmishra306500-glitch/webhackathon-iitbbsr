import React, { useState } from 'react';
import { CheckCircle, AlertCircle, Check } from 'lucide-react';
import type { UserRole } from '../types';

interface ApprovalsPageProps {
  currentRole: UserRole;
}

interface ApprovalItem {
  id: number;
  requester: string;
  requesterRole: UserRole;
  requestType: string;
  title: string;
  details: string;
  submittedAt: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ currentRole }) => {
  const [items, setItems] = useState<ApprovalItem[]>([
    {
      id: 1,
      requester: 'Abhinav Nayak (President, TechZephyr)',
      requesterRole: 'club_rep',
      requestType: 'Venue Booking',
      title: 'Main Auditorium Booking - TechZephyr Coding Hackathon',
      details: 'Nov 20, 2026 • 09:00 AM to 06:00 PM • Expected attendance: 350 students • Stage mics and projector required',
      submittedAt: '2 hours ago',
      status: 'Pending',
    },
    {
      id: 2,
      requester: 'Dr. Manoranjan Sharma',
      requesterRole: 'faculty',
      requestType: 'Rescheduling',
      title: 'Swap CS303P Lab Session with AI Seminar Room',
      details: 'Shift from Tuesday 10:45 AM to Thursday 02:30 PM due to research conference keynotes',
      submittedAt: '5 hours ago',
      status: 'Pending',
    },
    {
      id: 3,
      requester: 'Prof. Ananya Pattnaik',
      requesterRole: 'coordinator',
      requestType: 'Hall Allocation',
      title: 'CSE Midsem Seating Block B Allocation',
      details: 'All 4 Smart Lecture rooms booked for 2nd & 3rd Year B.Tech Examinations',
      submittedAt: 'Yesterday',
      status: 'Approved',
    },
    {
      id: 4,
      requester: 'Dr. Rajeshwar Sen (Registrar)',
      requesterRole: 'admin',
      requestType: 'System Policy',
      title: 'Annual Campus Network Maintenance Lockdown',
      details: 'Dec 02, 2026 • All rooms maintenance window from 08:00 PM to 06:00 AM',
      submittedAt: '2 days ago',
      status: 'Pending',
    },
  ]);

  const handleAction = (id: number, newStatus: 'Approved' | 'Rejected') => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Campus Approvals Portal</h2>
            <p className="text-xs text-slate-300">
              Review institutional requisitions • <span className="text-cyan-300">Strict Rule: Self-approval is restricted</span>
            </p>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-3">
        {items.map((item) => {
          const isOwnRequest = item.requesterRole === currentRole;
          return (
            <div
              key={item.id}
              className="p-4 sm:p-5 rounded-2xl liquid-glass-card space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                      {item.requestType}
                    </span>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Submitted by: <span className="font-semibold text-white">{item.requester}</span> • {item.submittedAt}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto ${
                    item.status === 'Approved'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : item.status === 'Rejected'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="text-xs text-slate-200 leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                {item.details}
              </p>

              <div className="flex items-center justify-between pt-1">
                {isOwnRequest ? (
                  <span className="text-[11px] text-amber-300 flex items-center gap-1.5 font-medium">
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span>Your Request (Self-Approval Restricted by CIT Governance)</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-slate-400">
                    Authority: {currentRole.toUpperCase()} Tier Approval
                  </span>
                )}

                {item.status === 'Pending' && (
                  <div className="flex items-center gap-2">
                    <button
                      disabled={isOwnRequest}
                      onClick={() => handleAction(item.id, 'Rejected')}
                      className="px-3.5 py-1.5 rounded-xl border border-rose-400/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      Reject
                    </button>
                    <button
                      disabled={isOwnRequest}
                      onClick={() => handleAction(item.id, 'Approved')}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs font-bold shadow-md transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Authorize Request</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
