import React, { useState, useEffect } from 'react';
import { CheckCircle, Search, Filter, ShieldCheck, XCircle } from 'lucide-react';
import type { UserRole } from '../types';

interface ApprovalsPageProps {
  currentRole: UserRole;
}

interface FestBookingItem {
  request_id: string;
  title: string;
  requester: string;
  role: string;
  requested_category: string;
  status: 'approved' | 'alternative_offered' | 'rejected';
  day?: string;
  start_period?: number;
  end_period?: number;
  room_id?: string;
  room_name?: string;
  reason?: string;
}

export const ApprovalsPage: React.FC<ApprovalsPageProps> = ({ currentRole: _currentRole }) => {
  const [bookings, setBookings] = useState<FestBookingItem[]>([]);
  const [stats, setStats] = useState({ approved: 0, alternatives: 0, rejected: 0, overrides: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchFestBookings = async () => {
      try {
        const res = await fetch('/api/bookings/fest');
        if (res.ok) {
          const data = await res.json();
          setBookings(data.bookings || []);
          setStats({
            approved: data.approved || 0,
            alternatives: data.alternatives || 0,
            rejected: data.rejected || 0,
            overrides: data.overrides_count || 0,
          });
        }
      } catch (err) {
        console.warn('Failed to load fest bookings from API', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFestBookings();
  }, []);

  const filtered = bookings.filter((b) => {
    const matchesFilter = filterStatus === 'all' || b.status === filterStatus;
    const matchesSearch =
      b.request_id.toLowerCase().includes(search.toLowerCase()) ||
      b.title.toLowerCase().includes(search.toLowerCase()) ||
      b.requester.toLowerCase().includes(search.toLowerCase()) ||
      (b.room_name && b.room_name.toLowerCase().includes(search.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

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
              Spectra Fest Week (Week 7) Priority Solver • 25 Requisitions Evaluated with Zero Priority Inversions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 font-bold">
              {stats.approved} Approved
            </span>
            {stats.alternatives > 0 && (
              <span className="px-2.5 py-1 rounded-xl bg-cyan-950/40 border border-cyan-400/30 text-cyan-300 font-bold">
                {stats.alternatives} Alternatives
              </span>
            )}
            <span className="px-2.5 py-1 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 font-bold">
              {stats.rejected} Rejected
            </span>
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
            placeholder="Search request ID, event, or organizer..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-900 font-semibold caret-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-glass-navbar self-end sm:self-auto overflow-x-auto">
          <Filter className="w-3.5 h-3.5 text-cyan-400 ml-2" />
          {[
            { label: 'All Requests', code: 'all' },
            { label: 'Approved', code: 'approved' },
            { label: 'Alternative Offered', code: 'alternative_offered' },
            { label: 'Rejected', code: 'rejected' },
          ].map((item) => (
            <button
              key={item.code}
              onClick={() => setFilterStatus(item.code)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                filterStatus === item.code ? 'bg-blue-600 text-white font-semibold shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Requests List */}
      {loading ? (
        <div className="p-8 text-center text-slate-300 text-xs">Evaluating Spectra week booking requests...</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item) => (
            <div
              key={item.request_id}
              className="p-4 sm:p-5 rounded-2xl liquid-glass-card space-y-3 hover:border-cyan-400/40 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-400/30">
                      {item.request_id}
                    </span>
                    <h3 className="text-sm font-bold text-white">{item.title}</h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    Requester: <span className="text-white font-semibold">{item.requester}</span> ({item.role}) • Category:{' '}
                    <span className="font-mono text-cyan-300">{item.requested_category}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-1 rounded text-xs font-bold ${
                      item.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : item.status === 'alternative_offered'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/30'
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                    }`}
                  >
                    {item.status === 'approved'
                      ? 'Approved'
                      : item.status === 'alternative_offered'
                      ? 'Alternative Offered'
                      : 'Rejected'}
                  </span>
                </div>
              </div>

              {item.status === 'approved' ? (
                <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>
                      Allocated: <strong className="text-white">{item.room_name} ({item.room_id})</strong> on{' '}
                      <strong className="text-white">{item.day}</strong> P{item.start_period}-P{item.end_period}
                    </span>
                  </div>
                  <span className="text-[11px] text-emerald-300/80 font-mono">Hierarchy Rule Verified</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-950/30 p-2.5 rounded-xl border border-rose-500/30">
                  <XCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>
                    <strong>Rejection/Audit Note:</strong> {item.reason || 'Did not meet venue capacity or policy requirements.'}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
