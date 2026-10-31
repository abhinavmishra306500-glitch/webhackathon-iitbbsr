import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Sunset,
  Moon,
  Building2,
  Users,
  Layers,
  MapPin,
  CheckCircle2,
  Calendar,
  X,
  Compass,
  Sparkles,
  Info,
} from 'lucide-react';
import { Campus3DScene } from '../components/campus3d/Campus3DScene';
import { CAMPUS_BUILDINGS, CampusBuilding } from '../components/campus3d/campusData';

export const Campus3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(
    CAMPUS_BUILDINGS[0] // Default select central landmark
  );
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const filteredBuildings = CAMPUS_BUILDINGS.filter(
    (b) => categoryFilter === 'all' || b.category === categoryFilter
  );

  const handleBookVenue = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingConfirmed(false);
    }, 2800);
  };

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-3xl select-none">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Return to Venue Booking / Dashboard */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => navigate('/venue-booking')}
            className="px-3.5 py-2 rounded-2xl liquid-glass-navbar text-xs font-bold text-white hover:border-cyan-400 shadow-lg flex items-center gap-2 transition-all group"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Venue Booking</span>
          </button>

          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-2xl liquid-glass-navbar text-xs font-bold text-white shadow-md">
            <Compass className="w-4 h-4 text-cyan-400 animate-spin" style={{ animationDuration: '15s' }} />
            <span>CIT 3D Campus Explorer</span>
          </div>
        </div>

        {/* Center: Category Filters */}
        <div className="hidden md:flex items-center gap-1 p-1 rounded-2xl liquid-glass-navbar pointer-events-auto shadow-lg">
          {[
            { id: 'all', label: 'All Campus' },
            { id: 'landmark', label: 'Core Landmark' },
            { id: 'venue', label: 'Event Venues' },
            { id: 'academic', label: 'Academic Quads' },
            { id: 'sports', label: 'Sports Stadium' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
                categoryFilter === cat.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Right: Lighting Modes */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl liquid-glass-navbar pointer-events-auto shadow-lg">
          <button
            onClick={() => setTimeOfDay('day')}
            title="Daylight Mode"
            className={`p-2 rounded-xl transition-all ${
              timeOfDay === 'day' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTimeOfDay('sunset')}
            title="Sunset Golden Hour"
            className={`p-2 rounded-xl transition-all ${
              timeOfDay === 'sunset' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTimeOfDay('night')}
            title="Night Neon Mode"
            className={`p-2 rounded-xl transition-all ${
              timeOfDay === 'night' ? 'bg-blue-600 text-white font-bold shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Moon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 3D WebGL Canvas Component */}
      <div className="w-full h-full relative z-10">
        <Campus3DScene
          onSelectBuilding={setSelectedBuilding}
          selectedBuildingId={selectedBuilding?.id || null}
          timeOfDay={timeOfDay}
        />
      </div>

      {/* Right Drawer: Selected Building & Venue Booking Panel */}
      {selectedBuilding && (
        <div className="absolute right-4 top-20 bottom-20 z-30 w-80 lg:w-96 rounded-3xl liquid-glass-sidebar p-5 flex flex-col justify-between overflow-y-auto shadow-2xl animate-fadeIn">
          <div>
            <div className="flex items-start justify-between pb-3 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                  {selectedBuilding.code}
                </span>
                <h3 className="text-base font-bold text-white font-display mt-1.5 leading-snug">
                  {selectedBuilding.name}
                </h3>
                <p className="text-xs text-slate-300">{selectedBuilding.type}</p>
              </div>

              <button
                onClick={() => setSelectedBuilding(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-2 my-3.5">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Max Capacity</span>
                <span className="text-base font-bold text-white font-display flex items-center gap-1">
                  <Users className="w-4 h-4 text-cyan-400" />
                  {selectedBuilding.capacity}
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Storeys</span>
                <span className="text-base font-bold text-white font-display flex items-center gap-1">
                  <Layers className="w-4 h-4 text-blue-400" />
                  {selectedBuilding.floors} Floors
                </span>
              </div>
            </div>

            {/* Architectural & Venue Description */}
            <div className="space-y-1.5 text-xs text-slate-200">
              <span className="font-semibold text-cyan-300 flex items-center gap-1 text-[11px]">
                <Info className="w-3.5 h-3.5" />
                <span>Facility Architecture</span>
              </span>
              <p className="leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10">
                {selectedBuilding.description}
              </p>
            </div>

            {/* Features Tags */}
            <div className="mt-3.5 space-y-2">
              <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Amenities & Equipment
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectedBuilding.features.map((feat, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-cyan-950/40 border border-cyan-400/30 text-[11px] text-cyan-200 font-medium"
                  >
                    {feat}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button: Book this 3D Venue */}
          <div className="pt-4 border-t border-white/10">
            {bookingConfirmed ? (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span className="font-bold">Venue Reserved for Active Session!</span>
              </div>
            ) : (
              <button
                onClick={handleBookVenue}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2"
              >
                <Calendar className="w-4 h-4" />
                <span>Book This Venue</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Bottom Horizontal Quick Selector Pills */}
      <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex justify-center">
        <div className="p-1.5 rounded-2xl liquid-glass-navbar pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full shadow-2xl">
          <span className="text-[10px] font-bold text-cyan-300 uppercase px-2 shrink-0">
            Direct Fly-To:
          </span>
          {filteredBuildings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBuilding(b)}
              className={`px-3 py-1 rounded-xl text-xs font-medium shrink-0 transition-all ${
                selectedBuilding?.id === b.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {b.name.split(' ')[0]} {b.name.split(' ')[1] || ''}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
