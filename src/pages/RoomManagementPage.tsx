import React, { useState } from 'react';
import { Building2, Search, Monitor, Wind, Shield } from 'lucide-react';

export const RoomManagementPage: React.FC = () => {
  const [filterType, setFilterType] = useState('All');
  const [search, setSearch] = useState('');

  const rooms = [
    { id: 'CR-101', name: 'Lecture Hall 101', block: 'Block A', capacity: 90, type: 'Lecture Hall', ac: true, projector: true, status: 'Active' },
    { id: 'CR-102', name: 'Lecture Hall 102', block: 'Block A', capacity: 90, type: 'Lecture Hall', ac: true, projector: true, status: 'Active' },
    { id: 'CR-204', name: 'Smart Theatre 204', block: 'Block B', capacity: 120, type: 'Smart Theatre', ac: true, projector: true, status: 'Active' },
    { id: 'LAB-AI', name: 'Advanced AI & GPU Lab', block: 'Block C', capacity: 55, type: 'Computer Lab', ac: true, projector: true, status: 'Active' },
    { id: 'LAB-SE', name: 'Software Engg. Lab B', block: 'Block C', capacity: 45, type: 'Computer Lab', ac: true, projector: true, status: 'Active' },
    { id: 'AUD-MN', name: 'Main CIT Auditorium', block: 'Central Wing', capacity: 600, type: 'Auditorium', ac: true, projector: true, status: 'Active' },
    { id: 'CR-305', name: 'Seminar Room 305', block: 'Block B', capacity: 60, type: 'Seminar Room', ac: true, projector: true, status: 'Maintenance' },
  ];

  const filtered = rooms.filter((r) => {
    const matchesType = filterType === 'All' || r.type === filterType;
    const matchesSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

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
            <p className="text-xs text-slate-300">Inspect 27 institutional rooms, seating capacities, and equipment telemetry</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/40 px-3 py-1.5 rounded-xl border border-cyan-400/30">
            26 / 27 Operational
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search room ID or name..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl glass-input text-xs text-white outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 rounded-xl liquid-glass-navbar self-end sm:self-auto overflow-x-auto">
          {['All', 'Lecture Hall', 'Computer Lab', 'Smart Theatre', 'Auditorium'].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterType === type ? 'bg-blue-600 text-white font-semibold' : 'text-slate-300 hover:text-white'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filtered.map((r) => (
          <div key={r.id} className="p-4 rounded-2xl liquid-glass-card space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="font-mono text-xs font-bold text-cyan-300">{r.id}</span>
                <h4 className="text-sm font-bold text-white">{r.name}</h4>
                <p className="text-xs text-slate-300">{r.block}</p>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  r.status === 'Active'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                }`}
              >
                {r.status}
              </span>
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-between text-xs text-slate-200">
              <span className="font-semibold text-white">Capacity: {r.capacity}</span>
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
                <span title="CIT Smart Access Node">
                  <Shield className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
