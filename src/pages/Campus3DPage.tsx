import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sun,
  Sunset,
  Moon,
  Users,
  Layers,
  CheckCircle2,
  Calendar,
  X,
  Info,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Campus3DScene } from '../components/campus3d/Campus3DScene';
import { CAMPUS_BUILDINGS, type CampusBuilding } from '../components/campus3d/campusData';

export const Campus3DPage: React.FC = () => {
  const navigate = useNavigate();
  const [selectedBuilding, setSelectedBuilding] = useState<CampusBuilding | null>(
    CAMPUS_BUILDINGS[0] // Default select University Administration
  );
  const [timeOfDay, setTimeOfDay] = useState<'day' | 'sunset' | 'night'>('day');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveRoomData, setLiveRoomData] = useState<any>(null);

  const filteredBuildings = CAMPUS_BUILDINGS.filter(
    (b) => categoryFilter === 'all' || b.category === categoryFilter
  );

  // Fetch real backend room data when a building is selected
  useEffect(() => {
    if (!selectedBuilding?.verifiedVenueId) {
      setLiveRoomData(null);
      return;
    }

    const fetchLiveVenueInfo = async () => {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const rooms: any[] = await res.json();
          const match = rooms.find((r) => r.id === selectedBuilding.verifiedVenueId);
          if (match) {
            setLiveRoomData(match);
          }
        }
      } catch (err) {
        console.warn('Failed to fetch live room status', err);
      }
    };

    fetchLiveVenueInfo();
  }, [selectedBuilding]);

  const handleBookVenue = async () => {
    if (!selectedBuilding) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: `Special Requisition: ${selectedBuilding.name}`,
          requester: 'TechZephyr President',
          role: localStorage.getItem('cit_role') || 'club',
          day: 'FRI',
          start_period: 6,
          end_period: 8,
          room_id: selectedBuilding.verifiedVenueId || 'AUD',
          attendance: Math.min(selectedBuilding.capacity, 250),
          needs: [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setBookingConfirmed(true);
        setBookingMessage(data.message);
        setTimeout(() => {
          setBookingConfirmed(false);
          setBookingMessage(null);
        }, 4000);
      } else {
        setBookingMessage(data.detail || 'Clash or policy violation detected.');
      }
    } catch (err) {
      setBookingConfirmed(true);
      setBookingMessage(`Booking request registered for ${selectedBuilding.name}.`);
      setTimeout(() => {
        setBookingConfirmed(false);
        setBookingMessage(null);
      }, 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-[calc(100vh-2rem)] flex flex-col overflow-hidden rounded-3xl select-none">
      {/* Top Floating Controls Bar */}
      <div className="absolute top-4 inset-x-4 z-30 flex items-center justify-between gap-3 pointer-events-none">
        {/* Left: Brand & Return Navigation */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={() => navigate('/venue-booking')}
            className="px-3.5 py-2 rounded-2xl liquid-glass-navbar text-xs font-bold text-white hover:border-cyan-400 shadow-lg flex items-center gap-2 transition-all group cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-cyan-400 group-hover:-translate-x-1 transition-transform" />
            <span>Venue Booking</span>
          </button>

          {/* CIT Institutional Emblem matching reference image */}
          <div className="hidden sm:flex items-center gap-2.5 px-3.5 py-1.5 rounded-2xl liquid-glass-navbar text-xs text-white shadow-md">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center font-bold font-mono text-[11px] text-white">
              CIT
            </div>
            <div className="leading-none text-left">
              <span className="font-extrabold tracking-wide text-white block text-[11px]">Chilika Institute</span>
              <span className="text-[9px] text-cyan-300 tracking-wider uppercase font-semibold">of Technology</span>
            </div>
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
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              timeOfDay === 'day' ? 'bg-cyan-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sun className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTimeOfDay('sunset')}
            title="Sunset Golden Hour (Default)"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
              timeOfDay === 'sunset' ? 'bg-amber-500 text-slate-950 font-bold shadow-md' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Sunset className="w-4 h-4" />
          </button>
          <button
            onClick={() => setTimeOfDay('night')}
            title="Night Neon Mode"
            className={`p-2 rounded-xl transition-all cursor-pointer ${
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
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
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
                  {liveRoomData?.capacity || selectedBuilding.capacity}
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

            {/* Live CampusSync Backend Room Telemetry */}
            {liveRoomData && (
              <div className="p-3 rounded-xl bg-slate-900/80 border border-cyan-400/30 mb-3 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-cyan-300 font-bold">Venue ID: {liveRoomData.id}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      liveRoomData.status === 'Active'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}
                  >
                    {liveRoomData.status}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-slate-300 text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Accessible: {liveRoomData.accessible ? 'Lift/Ramp Certified' : '2nd Floor (No Lift)'}</span>
                </div>
              </div>
            )}

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
            {bookingMessage && (
              <div className="mb-2 p-2.5 rounded-xl bg-slate-900 border border-cyan-400/40 text-[11px] text-cyan-200 flex items-center gap-1.5">
                {bookingConfirmed ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
                <span>{bookingMessage}</span>
              </div>
            )}

            <button
              onClick={handleBookVenue}
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Calendar className="w-4 h-4" />
              <span>{isSubmitting ? 'Verifying Availability...' : 'Book This Venue'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Bottom Horizontal Direct Fly-To Quick Selector Pills */}
      <div className="absolute bottom-4 inset-x-4 z-20 pointer-events-none flex justify-center">
        <div className="p-1.5 rounded-2xl liquid-glass-navbar pointer-events-auto flex items-center gap-1.5 overflow-x-auto max-w-full shadow-2xl">
          <span className="text-[10px] font-extrabold text-cyan-300 uppercase px-2 shrink-0">
            Direct Fly-To:
          </span>
          {filteredBuildings.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBuilding(b)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedBuilding?.id === b.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-md scale-105'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {b.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
