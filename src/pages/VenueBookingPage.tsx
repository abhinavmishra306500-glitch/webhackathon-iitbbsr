import React, { useState } from 'react';
import { MapPin, Users, Check, Building, Sparkles } from 'lucide-react';

export const VenueBookingPage: React.FC = () => {
  const [selectedVenue, setSelectedVenue] = useState('Main Auditorium');
  const [eventName, setEventName] = useState('');
  const [eventDate, setEventDate] = useState('2026-11-05');
  const [eventTime, setEventTime] = useState('14:00 - 17:00');
  const [isBooked, setIsBooked] = useState(false);

  const venues = [
    { name: 'Main Auditorium', block: 'Central Wing', capacity: 600, equipment: '4K Projector, JBL PA System, Stage Lighting', status: 'Available' },
    { name: 'SAC Seminar Hall A', block: 'Student Activity Center', capacity: 180, equipment: 'HD Display, Podium Mic, AC', status: 'Available' },
    { name: 'Block B Conference Room', block: 'Academic Block B', capacity: 80, equipment: 'Video Conferencing, Smart Board', status: 'Reserved' },
    { name: 'Advanced Robotics Lab', block: 'Computing Center 3rd Floor', capacity: 50, equipment: 'Workstations, 3D Printers, GPU Cluster', status: 'Available' },
  ];

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventName.trim()) return;
    setIsBooked(true);
    setTimeout(() => {
      setIsBooked(false);
      setEventName('');
    }, 2500);
  };

  return (
    <div className="space-y-4 pb-8 dashboard-anim-item">
      {/* Header Bar */}
      <div className="liquid-glass-navbar px-4 sm:px-6 py-3 rounded-2xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-2 text-white flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white font-display">Venue Booking</h2>
            <p className="text-xs text-slate-300">Reserve auditoriums, seminar halls, and smart labs across Chilika campus</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Venues List (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
            Available Campus Venues
          </h3>

          <div className="space-y-3">
            {venues.map((venue, idx) => {
              const isSelected = selectedVenue === venue.name;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedVenue(venue.name)}
                  className={`p-4 rounded-2xl liquid-glass-card cursor-pointer transition-all ${
                    isSelected ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white">{venue.name}</h4>
                        <p className="text-xs text-slate-300">{venue.block}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        venue.status === 'Available'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {venue.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                    <span className="flex items-center gap-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" />
                      <span>Capacity: {venue.capacity} seats</span>
                    </span>
                    <span className="text-[11px] text-slate-400 max-w-xs truncate">
                      {venue.equipment}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Booking Form (Right 5 Cols) */}
        <div className="lg:col-span-5">
          <div className="p-5 rounded-2xl liquid-glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Book Selected Venue</span>
            </h3>

            {isBooked ? (
              <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300">
                <Check className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold text-sm">Booking Request Submitted!</p>
                <p className="text-xs text-slate-300">Routed to CIT Academic Coordinator for immediate authorization.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Target Venue</label>
                  <input
                    type="text"
                    disabled
                    value={selectedVenue}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/20 text-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Event / Purpose Title</label>
                  <input
                    type="text"
                    required
                    value={eventName}
                    onChange={(e) => setEventName(e.target.value)}
                    placeholder="e.g. TechZephyr Coding Hackathon"
                    className="w-full px-3 py-2 rounded-xl glass-input text-white outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Date</label>
                    <input
                      type="date"
                      value={eventDate}
                      onChange={(e) => setEventDate(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-white outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Slot Window</label>
                    <input
                      type="text"
                      value={eventTime}
                      onChange={(e) => setEventTime(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl glass-input text-white outline-none"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/30 transition-all"
                  >
                    Submit Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
