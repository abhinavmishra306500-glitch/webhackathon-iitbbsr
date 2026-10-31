import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Layers,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Shield,
  CheckCircle,
} from 'lucide-react';
import type { UserRole } from '../../types';
import { ROLES_DATA } from '../../services/authService';

interface GlassNavbarProps {
  currentRole: UserRole;
  onRoleChange?: (newRole: UserRole) => void;
  onLogout?: () => void;
}

export const GlassNavbar: React.FC<GlassNavbarProps> = ({
  currentRole = 'admin',
  onRoleChange,
  onLogout,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Map pathname to breadcrumb title
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
      case '/dashboard':
        return 'Dashboard';
      case '/timetable':
        return 'Timetable Management';
      case '/exam-scheduler':
        return 'Exam Scheduler';
      case '/venue-booking':
        return 'Venue Booking';
      case '/rescheduling':
        return 'Rescheduling';
      case '/ai-assistant':
        return 'AI Assistant';
      case '/approvals':
        return 'Approvals';
      case '/rooms':
        return 'Room Management';
      case '/analytics':
        return 'Analytics';
      case '/datasets':
        return 'Dataset Management';
      default:
        return 'Dashboard';
    }
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      navigate('/login');
    }
  };

  return (
    <header className="w-full relative z-30 mb-4 select-none">
      <div className="w-full h-14 px-4 sm:px-6 rounded-full liquid-glass-navbar flex items-center justify-between gap-4">
        {/* Left: Logo & Active Page Breadcrumb */}
        <div className="flex items-center gap-3 shrink-0">
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 p-1 flex items-center justify-center text-white shadow-[0_0_12px_rgba(6,182,212,0.4)]">
              <Layers className="w-4 h-4" />
            </div>
            <span className="text-base sm:text-lg font-bold font-display text-white tracking-tight group-hover:text-cyan-300 transition-colors">
              CampusSync
            </span>
          </div>

          <span className="text-white/30 text-sm font-light">|</span>

          <span className="text-xs sm:text-sm font-medium text-slate-200/90 hidden sm:inline-block">
            {getPageTitle()}
          </span>
        </div>

        {/* Center / Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Search Bar Capsule */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cyan-300/80" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-44 lg:w-56 pl-8 pr-3 py-1.5 rounded-full bg-white/5 border border-cyan-400/30 text-xs text-white placeholder:text-slate-300/70 focus:outline-none focus:border-cyan-400 focus:bg-white/10 transition-all"
            />
          </div>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowRoleDropdown(false);
              }}
              className="relative p-2 rounded-full text-slate-200 hover:text-white hover:bg-white/10 transition-colors"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-cyan-300" />
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-cyan-500 text-slate-950 font-extrabold text-[9px] flex items-center justify-center shadow-[0_0_8px_rgba(6,182,212,0.8)]">
                1
              </span>
            </button>

            {/* Notification Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 rounded-2xl liquid-glass-navbar p-3 shadow-2xl z-50 text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <span className="font-semibold text-white">CIT System Alerts</span>
                  <span className="text-[10px] text-cyan-400">1 new</span>
                </div>
                <div className="p-2 rounded-xl bg-white/5 border border-white/10 flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-white text-[11px]">Midsem Timetable Approved</p>
                    <p className="text-[10px] text-slate-300">CSE Department exam slots published for Block B.</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill with Role Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setShowRoleDropdown(!showRoleDropdown);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2 py-1 pl-1.5 pr-2.5 rounded-full bg-white/5 hover:bg-white/10 border border-cyan-400/30 text-white transition-all duration-200 group"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white border border-white/30">
                <User className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-semibold capitalize text-slate-100 group-hover:text-cyan-200">
                {ROLES_DATA[currentRole]?.label.split(' ')[0] || 'Admin'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-cyan-300 group-hover:rotate-180 transition-transform duration-200" />
            </button>

            {/* Role Dropdown */}
            {showRoleDropdown && (
              <div className="absolute right-0 mt-2 w-56 rounded-2xl liquid-glass-navbar p-2 shadow-2xl z-50 text-xs">
                <div className="px-2 py-1.5 text-[10px] uppercase font-bold text-cyan-300/80 border-b border-white/10 mb-1">
                  Switch Active Role
                </div>
                {(Object.keys(ROLES_DATA) as UserRole[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      if (onRoleChange) onRoleChange(r);
                      setShowRoleDropdown(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg transition-colors ${
                      currentRole === r
                        ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-400/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <span>{ROLES_DATA[r].label}</span>
                    {currentRole === r && <Shield className="w-3.5 h-3.5 text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-full text-slate-300 hover:text-rose-300 hover:bg-rose-500/20 border border-transparent hover:border-rose-400/30 transition-all duration-200"
            title="Log Out to CIT Gateway"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
