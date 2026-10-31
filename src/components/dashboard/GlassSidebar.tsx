import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  Calendar,
  ClipboardList,
  MapPin,
  RefreshCw,
  Sparkles,
  CheckCircle,
  Building2,
  BarChart2,
  Database,
  ChevronRight,
  Compass,
} from 'lucide-react';
import type { UserRole } from '../../types';

interface GlassSidebarProps {
  currentRole: UserRole;
}

interface NavItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  allowedRoles: UserRole[];
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Overview', path: '/', icon: Home, allowedRoles: ['admin', 'coordinator', 'faculty', 'club_rep'] },
  { name: 'Timetable Management', path: '/timetable', icon: Calendar, allowedRoles: ['admin', 'coordinator', 'faculty'] },
  { name: 'Exam Scheduler', path: '/exam-scheduler', icon: ClipboardList, allowedRoles: ['admin', 'coordinator'] },
  { name: 'Venue Booking', path: '/venue-booking', icon: MapPin, allowedRoles: ['admin', 'coordinator', 'faculty', 'club_rep'] },
  { name: '3D Campus Map', path: '/campus-3d', icon: Compass, allowedRoles: ['admin', 'coordinator', 'faculty', 'club_rep'] },
  { name: 'Rescheduling', path: '/rescheduling', icon: RefreshCw, allowedRoles: ['admin', 'coordinator', 'faculty'] },
  { name: 'AI Assistant', path: '/ai-assistant', icon: Sparkles, allowedRoles: ['admin', 'coordinator', 'faculty', 'club_rep'] },
  { name: 'Approvals', path: '/approvals', icon: CheckCircle, allowedRoles: ['admin', 'coordinator', 'club_rep'] },
  { name: 'Room Management', path: '/rooms', icon: Building2, allowedRoles: ['admin', 'coordinator'] },
  { name: 'Analytics', path: '/analytics', icon: BarChart2, allowedRoles: ['admin', 'coordinator', 'faculty'] },
  { name: 'Dataset Management', path: '/datasets', icon: Database, allowedRoles: ['admin'] },
];

export const GlassSidebar: React.FC<GlassSidebarProps> = ({ currentRole = 'admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const currentPath = location.pathname;

  return (
    <aside className="w-64 xl:w-72 h-[calc(100vh-2rem)] sticky top-4 rounded-3xl liquid-glass-sidebar p-4 xl:p-5 flex flex-col justify-between shrink-0 select-none z-30 overflow-hidden">
      {/* Top University Branding */}
      <div>
        <div
          onClick={() => navigate('/')}
          className="flex items-center gap-3 pb-5 pt-1 border-b border-white/10 cursor-pointer group"
        >
          {/* Circular CIT Seal matching reference */}
          <div className="w-11 h-11 rounded-full p-1 bg-gradient-to-tr from-blue-600/60 to-cyan-400/40 border border-cyan-300/50 shadow-[0_0_15px_rgba(6,182,212,0.4)] flex items-center justify-center shrink-0">
            <img src="/cit-seal.svg" alt="CIT Seal" className="w-full h-full object-contain" />
          </div>

          <div>
            <h1 className="text-2xl font-extrabold tracking-tight font-display text-white leading-none">
              CIT
            </h1>
            <p className="text-[9px] font-bold tracking-[0.2em] text-slate-200 uppercase mt-0.5 leading-tight">
              Chilika Institute
            </p>
            <p className="text-[8px] font-medium tracking-[0.16em] text-cyan-300 uppercase leading-none">
              of Technology
            </p>
          </div>
        </div>

        {/* Navigation Options List */}
        <nav className="mt-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)] pr-1">
          {NAV_ITEMS.filter((item) => item.allowedRoles.includes(currentRole)).map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/'
                ? currentPath === '/' || currentPath === '/dashboard'
                : currentPath.startsWith(item.path);

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 group text-left ${
                  isActive
                    ? 'sidebar-active-tab text-white'
                    : 'text-slate-200 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-white' : 'text-cyan-300/90'
                    }`}
                  />
                  <span className="truncate">{item.name}</span>
                </div>

                {isActive && (
                  <ChevronRight className="w-3.5 h-3.5 text-white/90 shrink-0" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Glowing Liquid Wave Light Refraction */}
      <div className="relative pt-3 pointer-events-none">
        <svg
          viewBox="0 0 200 45"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-12 opacity-80"
        >
          <path
            d="M0 35C40 38 70 20 100 25C130 30 160 42 200 28V45H0V35Z"
            fill="url(#blueWave)"
          />
          <path
            d="M0 32C50 30 80 12 120 18C160 24 180 34 200 24"
            stroke="url(#cyanGlow)"
            strokeWidth="2"
          />
          <defs>
            <linearGradient id="blueWave" x1="0" y1="0" x2="200" y2="45" gradientUnits="userSpaceOnUse">
              <stop stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="1" stopColor="#1e3a8a" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="cyanGlow" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="#38bdf8" />
              <stop offset="0.5" stopColor="#06b6d4" />
              <stop offset="1" stopColor="#60a5fa" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </aside>
  );
};
