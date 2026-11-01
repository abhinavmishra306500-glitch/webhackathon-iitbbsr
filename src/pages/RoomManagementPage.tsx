import React, { useState, useEffect } from 'react';
import { Building2, Search, Monitor, Wind, Shield, Accessibility, AlertTriangle } from 'lucide-react';

interface RoomItem {
  id: string;
  name: string;
  building: string;
  type: string;
  capacity: number;
  accessible: boolean;
  allowed_uses: string[];
  features: string[];
  ac: boolean;
  projector: boolean;
  pa_system?: boolean;
  stage?: boolean;
  status: string;
  status_details?: string;
}

export const RoomManagementPage: React.FC = () => {
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const data = await res.json();
          setRooms(data);
        }
      } catch (err) {
        console.warn('Failed to fetch rooms from backend, using dataset snapshot', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const getCategory = (type: string) => {
    if (type.includes('lecture')) return 'Lecture Halls';
    if (type.includes('classroom')) return 'Classrooms';
    if (type.includes('lab') || type.includes('workshop')) return 'Labs & Workshops';
    if (type.includes('seminar')) return 'Seminar Halls';
    if (type.includes('auditorium') || type.includes('outdoor')) return 'Auditorium & Outdoor';
    return 'Other';
  };

  const filtered = rooms.filter((r) => {
    const cat = getCategory(r.type);
    const matchesType = filterType === 'All' || cat === filterType;
    const matchesSearch =
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.building.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  const activeCount = rooms.filter((r) => r.status === 'Active').length;

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Room Management</h2>
            <p className="text-xs text-slate-300">Official CIT Dataset: 27 Institutional Venues, Capacities & Accessibility Telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-400/30">
            {loading ? 'Loading...' : `${activeCount} / ${rooms.length} Operational`}
          </span>
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
            placeholder="Search ID, venue name, or building..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-slate-900 font-semibold caret-blue-600 outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-glass-navbar self-end sm:self-auto overflow-x-auto">
          {['All', 'Lecture Halls', 'Classrooms', 'Labs & Workshops', 'Seminar Halls', 'Auditorium & Outdoor'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                filterType === type ? 'bg-blue-600 text-white font-semibold shadow-md' : 'text-slate-300 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      {loading ? (
        <div className="p-8 text-center text-slate-300 text-sm">Loading 27 campus venues from backend...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {filtered.map((r) => (
            <div key={r.id} className="p-4 rounded-2xl liquid-glass-card space-y-3 flex flex-col justify-between">
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-400/30">
                      {r.id}
                    </span>
                    <h4 className="text-sm font-bold text-white mt-1">{r.name}</h4>
                    <p className="text-xs text-slate-300">{r.building}</p>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      r.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {r.status}
                  </span>
                </div>

                {r.status_details && r.status !== 'Active' && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-300 bg-amber-950/30 p-1.5 rounded-lg border border-amber-500/30">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>{r.status_details}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white">Cap: {r.capacity}</span>
                  {r.accessible ? (
                    <span className="flex items-center gap-0.5 text-[10px] font-medium text-emerald-300 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-500/30" title="Wheelchair Accessible (Ground Floor / Lift)">
                      <Accessibility className="w-3 h-3" />
                      <span>Lift/Ramp</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-medium text-rose-300 bg-rose-950/40 px-1.5 py-0.5 rounded border border-rose-500/30" title="No Lift (Second Floor) - H10 Enforced">
                      No Lift
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-cyan-300">
                  {r.ac && (
                    <span title="Air Conditioned">
                      <Wind className="w-3.5 h-3.5" />
                    </span>
                  )}
                  {r.projector && (
                    <span title="Digital Projector">
                      <Monitor className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span title="CIT Central Security Monitored">
                    <Shield className="w-3.5 h-3.5" />
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
