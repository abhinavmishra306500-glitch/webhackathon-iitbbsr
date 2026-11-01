import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Users,
  Check,
  Building,
  Sparkles,
  Compass,
  ArrowRight,
  Send,
  AlertTriangle,
  Accessibility,
} from 'lucide-react';

interface VenueItem {
  id: string;
  name: string;
  building: string;
  type: string;
  capacity: number;
  accessible: boolean;
  allowed_uses: string[];
  features: string[];
  status: string;
}

export const VenueBookingPage: React.FC = () => {
  const navigate = useNavigate();
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [selectedVenue, setSelectedVenue] = useState<VenueItem | null>(null);
  const [eventName, setEventName] = useState('');
  const [eventDay, setEventDay] = useState('FRI');
  const [startPeriod, setStartPeriod] = useState(6);
  const [endPeriod, setEndPeriod] = useState(8);
  const [attendance, setAttendance] = useState(100);
  const [isBooked, setIsBooked] = useState(false);
  const [bookingMessage, setBookingMessage] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);

  // Natural language state
  const [nlQuery, setNlQuery] = useState('');
  const [isParsingNL, setIsParsingNL] = useState(false);
  const [nlResult, setNlResult] = useState<any>(null);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const data: VenueItem[] = await res.json();
          // Filter to venues authorized for events
          const eventVenues = data.filter((v) => v.allowed_uses.includes('event'));
          setVenues(eventVenues);
          if (eventVenues.length > 0) {
            setSelectedVenue(eventVenues[0]);
          }
        }
      } catch (err) {
        console.warn('Failed to load rooms for venue booking', err);
      }
    };
    fetchVenues();
  }, []);

  const handleNaturalLanguageParse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlQuery.trim()) return;
    setIsParsingNL(true);
    setNlResult(null);

    try {
      const res = await fetch('/api/bookings/natural-language', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: nlQuery,
          user_role: localStorage.getItem('cit_role') || 'club',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setNlResult(data);

        // Pre-fill form if draft data exists
        if (data.structured_draft) {
          const draft = data.structured_draft;
          if (draft.day) setEventDay(draft.day);
          if (draft.start_period) setStartPeriod(draft.start_period);
          if (draft.end_period) setEndPeriod(draft.end_period);
          if (draft.attendance) setAttendance(draft.attendance);

          // Select candidate venue if available
          if (data.available_candidate_venues && data.available_candidate_venues.length > 0) {
            const firstCand = venues.find((v) => v.id === data.available_candidate_venues[0].room_id);
            if (firstCand) setSelectedVenue(firstCand);
          }
        }
      }
    } catch (err) {
      console.warn('NLP error', err);
    } finally {
      setIsParsingNL(false);
    }
  };

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVenue || !eventName.trim()) return;

    try {
      const res = await fetch('/api/bookings/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: eventName,
          requester: 'TechZephyr Team Lead',
          role: localStorage.getItem('cit_role') || 'club',
          day: eventDay,
          start_period: Number(startPeriod),
          end_period: Number(endPeriod),
          room_id: selectedVenue.id,
          attendance: Number(attendance),
          needs: [],
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setIsBooked(true);
        setIsError(false);
        setBookingMessage(data.message);
        setTimeout(() => {
          setIsBooked(false);
          setEventName('');
          setBookingMessage(null);
        }, 4000);
      } else {
        setIsError(true);
        setBookingMessage(data.detail || 'Hard constraint clash or capacity violation.');
      }
    } catch (err) {
      setIsError(true);
      setBookingMessage('Failed to submit manual booking.');
    }
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
            <h2 className="text-lg font-bold text-white font-display">Venue Booking Portal</h2>
            <p className="text-xs text-slate-300">Reserve auditoriums, seminar halls & smart theatres with instant clash audit</p>
          </div>
        </div>

        {/* PROMINENT "VISUAL 3D BOOKING" BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/campus-3d')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-extrabold flex items-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300/40 transition-all transform hover:scale-105 active:scale-95 group"
          >
            <Compass className="w-4 h-4 text-white group-hover:rotate-45 transition-transform" />
            <span>Visual 3D Booking</span>
            <ArrowRight className="w-3.5 h-3.5 text-cyan-200" />
          </button>
        </div>
      </div>

      {/* Natural Language Booking Assistant (Section 3 Capability) */}
      <div className="p-4 rounded-2xl liquid-glass-card border-cyan-400/40 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Natural Language Booking Assistant (English & Hinglish)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-400/30">
            Hinglish NLP Parser Ready
          </span>
        </div>

        <form onSubmit={handleNaturalLanguageParse} className="flex gap-2">
          <input
            type="text"
            value={nlQuery}
            onChange={(e) => setNlQuery(e.target.value)}
            placeholder='Try: "seminar hall kal shaam 6 baje, 2 ghante, 100 log, mic chahiye" or "need auditorium on Friday 2pm for 350 students"'
            className="flex-1 px-3.5 py-2 rounded-xl glass-input text-xs text-slate-900 font-semibold caret-blue-600 outline-none"
          />
          <button
            type="submit"
            disabled={isParsingNL || !nlQuery.trim()}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xs font-bold flex items-center gap-1.5 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition-all shadow-md shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isParsingNL ? 'Parsing...' : 'Extract & Match'}</span>
          </button>
        </form>

        {nlResult && (
          <div className="p-3 rounded-xl bg-slate-900/90 border border-cyan-400/30 text-xs space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-slate-300">
                Matched: Day <strong className="text-cyan-300">{nlResult.structured_draft?.day}</strong> P
                {nlResult.structured_draft?.start_period}-P{nlResult.structured_draft?.end_period} • Attendance:{' '}
                <strong className="text-cyan-300">{nlResult.structured_draft?.attendance}</strong>
              </span>
              {nlResult.structured_draft?.wheelchair_warning && (
                <span className="flex items-center gap-1 text-[11px] text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30">
                  <AlertTriangle className="w-3 h-3 text-amber-400" />
                  <span>{nlResult.structured_draft.wheelchair_warning}</span>
                </span>
              )}
            </div>

            {nlResult.available_candidate_venues && nlResult.available_candidate_venues.length > 0 ? (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-slate-400 text-[11px]">Recommended Venues:</span>
                {nlResult.available_candidate_venues.map((v: any) => (
                  <button
                    key={v.room_id}
                    type="button"
                    onClick={() => {
                      const found = venues.find((x) => x.id === v.room_id);
                      if (found) setSelectedVenue(found);
                    }}
                    className="px-2 py-1 rounded-lg text-[11px] font-bold bg-cyan-950/60 border border-cyan-400/40 text-cyan-200 hover:bg-cyan-500 hover:text-slate-950 transition-colors"
                  >
                    {v.name} (Cap {v.capacity})
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-amber-300">No single venue matched all extracted criteria without adjustments.</p>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Venues List (Left 7 Cols) */}
        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-300 uppercase tracking-wider">
              Authorized Campus Venues ({venues.length})
            </h3>
            <span className="text-[11px] text-slate-300">Click to select venue</span>
          </div>

          <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
            {venues.map((venue) => {
              const isSelected = selectedVenue?.id === venue.id;
              return (
                <div
                  key={venue.id}
                  onClick={() => setSelectedVenue(venue)}
                  className={`p-4 rounded-2xl liquid-glass-card cursor-pointer transition-all ${
                    isSelected ? 'border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]' : 'hover:border-white/20'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                        <Building className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] font-bold text-cyan-300 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-400/30">
                            {venue.id}
                          </span>
                          <h4 className="text-sm font-bold text-white">{venue.name}</h4>
                        </div>
                        <p className="text-xs text-slate-300 mt-0.5">{venue.building}</p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        venue.status === 'Active'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      }`}
                    >
                      {venue.status}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs text-slate-300 gap-2">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Capacity: {venue.capacity} seats</span>
                      </span>
                      {venue.accessible ? (
                        <span className="flex items-center gap-1 text-emerald-300 text-[11px]" title="Wheelchair Accessible">
                          <Accessibility className="w-3.5 h-3.5" />
                          <span>Accessible</span>
                        </span>
                      ) : (
                        <span className="text-rose-300 text-[11px]" title="2nd Floor, No Lift">
                          No Lift
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {venue.features.join(', ') || 'Standard Class Equipment'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Booking Form (Right 5 Cols) */}
        <div className="lg:col-span-5">
          <div className="p-5 rounded-2xl liquid-glass-card space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>Instant Venue Requisition</span>
            </h3>

            {bookingMessage && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-center gap-2 ${
                  isError
                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-200'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}
              >
                {isError ? <AlertTriangle className="w-4 h-4 shrink-0" /> : <Check className="w-4 h-4 shrink-0" />}
                <span>{bookingMessage}</span>
              </div>
            )}

            {isBooked ? (
              <div className="p-6 text-center space-y-2 bg-emerald-950/40 border border-emerald-500/40 rounded-xl text-emerald-300">
                <Check className="w-8 h-8 mx-auto text-emerald-400" />
                <p className="font-bold text-sm">Booking Confirmed & Recorded!</p>
                <p className="text-xs text-slate-300">All hard constraints verified with 0 class clashes.</p>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Selected Venue</label>
                  <input
                    type="text"
                    disabled
                    value={selectedVenue ? `${selectedVenue.name} (${selectedVenue.id})` : 'Select a venue'}
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
                    placeholder="e.g. AI Hackathon Opening Ceremony"
                    className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 font-semibold caret-blue-600 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Day</label>
                    <select
                      value={eventDay}
                      onChange={(e) => setEventDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-400/30 text-white font-semibold outline-none"
                    >
                      {['MON', 'TUE', 'WED', 'THU', 'FRI'].map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Expected Attendance</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={1500}
                      value={attendance}
                      onChange={(e) => setAttendance(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl glass-input text-slate-900 font-semibold caret-blue-600 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Start Period</label>
                    <select
                      value={startPeriod}
                      onChange={(e) => setStartPeriod(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-400/30 text-white font-semibold outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map((p) => (
                        <option key={p} value={p}>
                          Period {p}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">End Period</label>
                    <select
                      value={endPeriod}
                      onChange={(e) => setEndPeriod(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-cyan-400/30 text-white font-semibold outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]
                        .filter((p) => p >= startPeriod)
                        .map((p) => (
                          <option key={p} value={p}>
                            Period {p}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/30 transition-all cursor-pointer"
                  >
                    Submit Booking with Constraint Check
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
