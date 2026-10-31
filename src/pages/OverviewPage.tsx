import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Building2,
  Users,
  Layers,
  GraduationCap,
  ClipboardList,
  MapPin,
  RefreshCw,
  Sparkles,
  CheckCircle,
  BarChart2,
  Database,
} from 'lucide-react';
import { GlassStatCard } from '../components/dashboard/GlassStatCard';
import { GlassFeatureCard } from '../components/dashboard/GlassFeatureCard';
import type { UserRole } from '../types';

interface OverviewPageProps {
  currentRole: UserRole;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({ currentRole }) => {
  const navigate = useNavigate();

  // Statistics Data from real CIT dataset
  const stats = [
    { icon: Building2, value: '27', label: 'Rooms' },
    { icon: Users, value: '40', label: 'Faculty' },
    { icon: Layers, value: '189', label: 'Sessions' },
    { icon: GraduationCap, value: '14', label: 'Student Groups' },
  ];

  // Nine Feature Cards matching reference screenshot
  const features = [
    {
      icon: CalendarIcon,
      title: 'Timetable Management',
      description: 'Generate, view and manage weekly timetables',
      path: '/timetable',
      roles: ['admin', 'coordinator', 'faculty'],
    },
    {
      icon: ClipboardList,
      title: 'Exam Scheduler',
      description: 'Schedule and manage midsem examinations',
      path: '/exam-scheduler',
      roles: ['admin', 'coordinator'],
    },
    {
      icon: MapPin,
      title: 'Venue Booking',
      description: 'Book venues, check availability and manage events',
      path: '/venue-booking',
      roles: ['admin', 'coordinator', 'faculty', 'club_rep'],
    },
    {
      icon: RefreshCw,
      title: 'Rescheduling',
      description: 'Automatically reschedule sessions and handle disruptions',
      path: '/rescheduling',
      roles: ['admin', 'coordinator', 'faculty'],
    },
    {
      icon: Sparkles,
      title: 'AI Assistant',
      description: 'Natural language scheduling, booking and queries',
      path: '/ai-assistant',
      roles: ['admin', 'coordinator', 'faculty', 'club_rep'],
    },
    {
      icon: CheckCircle,
      title: 'Approvals',
      description: 'Review and approve booking and scheduling requests',
      path: '/approvals',
      roles: ['admin', 'coordinator', 'club_rep'],
    },
    {
      icon: Building2,
      title: 'Room Management',
      description: 'Manage rooms, capacity, features and maintenance',
      path: '/rooms',
      roles: ['admin', 'coordinator'],
    },
    {
      icon: BarChart2,
      title: 'Analytics',
      description: 'View utilization, conflicts and optimization reports',
      path: '/analytics',
      roles: ['admin', 'coordinator', 'faculty'],
    },
    {
      icon: Database,
      title: 'Dataset Management',
      description: 'Upload, validate and manage institution datasets',
      path: '/datasets',
      roles: ['admin'],
    },
  ];

  // Formatted date matching reference: "Mon, Jan 27, 2025" or dynamic
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-5 pb-8">
      {/* 1. Header Banner & Date Pill */}
      <div className="dashboard-anim-item flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div className="flex items-start gap-3">
          {/* Cyan vertical accent pill */}
          <div className="w-1.5 h-10 bg-cyan-400 rounded-full shadow-[0_0_12px_rgba(6,182,212,0.8)] shrink-0 mt-0.5" />
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-2">
              <span>Welcome to</span>
              <span className="text-cyan-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.5)]">
                CampusSync
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-200/90 font-medium mt-0.5">
              Smart Campus Scheduling & Venue Management – Chilika Institute of Technology
            </p>
          </div>
        </div>

        {/* Date Display Glass Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full liquid-glass-navbar text-xs font-semibold text-slate-100 self-start sm:self-auto shrink-0 shadow-md">
          <CalendarIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>{formattedDate}</span>
        </div>
      </div>

      {/* 2. Horizontal 4 Statistics Cards Row */}
      <div className="dashboard-anim-item grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat, idx) => (
          <GlassStatCard
            key={idx}
            icon={stat.icon}
            value={stat.value}
            label={stat.label}
          />
        ))}
      </div>

      {/* 3. Three-Column Grid of 9 Feature Cards */}
      <div className="dashboard-anim-item grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 pt-1">
        {features.map((feat, idx) => {
          const isAllowed = feat.roles.includes(currentRole);
          return (
            <GlassFeatureCard
              key={idx}
              icon={feat.icon}
              title={feat.title}
              description={feat.description}
              onClick={() => {
                if (isAllowed) {
                  navigate(feat.path);
                } else {
                  alert(`Access restricted for current role (${currentRole}). Please switch to a permitted role to view this module.`);
                }
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
