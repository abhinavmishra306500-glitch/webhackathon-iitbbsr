import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {
  LogOut,
  ShieldCheck,
  Building,
  Briefcase,
  Layers,
  ArrowRight,
  Bell,
  Cpu,
  GraduationCap,
  Sparkles,
  ExternalLink,
  QrCode,
  Calendar,
  Users,
  CheckCircle,
} from 'lucide-react';
import type { UserSession } from '../types';
import { ROLES_DATA } from '../services/authService';

interface WorkspaceEntranceProps {
  session: UserSession;
  onLogout: () => void;
}

export const WorkspaceEntrance: React.FC<WorkspaceEntranceProps> = ({ session, onLogout }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const roleMeta = ROLES_DATA[session.role];

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.entrance-anim-item',
        {
          opacity: 0,
          y: isReducedMotion ? 0 : 25,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSignOut = () => {
    gsap.to(containerRef.current, {
      opacity: 0,
      scale: 0.97,
      duration: 0.4,
      ease: 'power2.in',
      onComplete: onLogout,
    });
  };

  // Role-specific operational modules
  const getRoleModules = () => {
    switch (session.role) {
      case 'admin':
        return [
          { title: 'Campus Directory & IAM', icon: Users, desc: 'Manage 6,500+ student & faculty profiles', count: 'Active' },
          { title: 'Security & Access Control', icon: ShieldCheck, desc: 'Biometric terminals and smart turnstile nodes', count: 'Online' },
          { title: 'ERP Financial & Infrastructure', icon: Building, desc: 'Block A to D campus resource allocation', count: 'Operational' },
          { title: 'Central Audit & Telemetry', icon: Cpu, desc: 'CIT server farm & gateway load analytics', count: '99.98% SLA' },
        ];
      case 'coordinator':
        return [
          { title: 'Branch Curriculum & Rosters', icon: Layers, desc: 'CSE 3rd & 5th Semester timetables & labs', count: '18 Batches' },
          { title: 'Faculty Assignment Matrix', icon: Briefcase, desc: 'Course workload balancing & substitute slots', count: '42 Faculty' },
          { title: 'Mid-Term Exam Evaluation', icon: GraduationCap, desc: 'Autonomous hall ticket & seating generation', count: 'In Review' },
          { title: 'Department Approvals', icon: CheckCircle, desc: 'Academic leave requests & research approvals', count: '6 Pending' },
        ];
      case 'faculty':
        return [
          { title: 'Smart Attendance Register', icon: Users, desc: 'RFID + Classroom beacon automated rollcall', count: 'CS-302 Ready' },
          { title: 'Continuous Gradebook LMS', icon: GraduationCap, desc: 'Internal assessments & assignment portal', count: '3 Courses' },
          { title: 'AI & Robotics Research Lab', icon: Cpu, desc: 'Hardware workbench reservation & GPU cluster', count: 'Reserved' },
          { title: 'Academic Advising Desk', icon: Calendar, desc: 'Mentorship schedules & student office hours', count: '14 Mentees' },
        ];
      case 'club_rep':
        return [
          { title: 'TechZephyr Hackathon 2026', icon: Sparkles, desc: 'Annual flagship technical festival planning', count: 'Phase 2' },
          { title: 'SAC Auditorium Booking', icon: Building, desc: 'Venue requisition for robotics workshops', count: 'Approved' },
          { title: 'Sponsorship & Treasury Ledger', icon: Layers, desc: 'CIT Student Activity Council budget line', count: 'Verified' },
          { title: 'Member Certifications', icon: CheckCircle, desc: 'Participant badge dispatch & digital credentials', count: '320 Issued' },
        ];
      default:
        return [];
    }
  };

  const modules = getRoleModules();

  return (
    <div
      ref={containerRef}
      className="relative z-30 max-w-6xl w-full mx-auto p-4 sm:p-6 lg:p-8"
    >
      {/* Top Bar with CIT Branding & User Session Status */}
      <div className="entrance-anim-item flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl glass-panel mb-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600/30 border border-blue-400/40 p-2 flex items-center justify-center">
            <img src="/cit-logo.svg" alt="CIT" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold font-display text-white">
                Chilika Institute of Technology
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
                PORTAL ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              CampusSync Enterprise Workspace • Connected to CIT Main Server Node
            </p>
          </div>
        </div>

        {/* User Quick Info & Sign Out */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <div className="text-right hidden md:block">
            <p className="text-xs font-semibold text-white">{session.name}</p>
            <p className="text-[11px] text-slate-400 font-mono">{session.regId}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-rose-500/20 border border-white/15 hover:border-rose-500/40 text-xs font-semibold text-slate-200 hover:text-rose-300 transition-all duration-200 group"
          >
            <LogOut className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Digital ID Card on Left, Role Modules on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Official CIT Digital Identity Card */}
        <div className="entrance-anim-item lg:col-span-4 space-y-4">
          <div className="rounded-2xl glass-panel p-6 relative overflow-hidden">
            {/* Header Stripe */}
            <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-400" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                  Institutional ID
                </span>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-gradient-to-r ${roleMeta.color} text-white shadow-sm`}
              >
                {roleMeta.badge}
              </span>
            </div>

            {/* Profile Info */}
            <div className="text-center py-2">
              <div className="relative inline-block mx-auto mb-3">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-800 p-1 shadow-lg shadow-blue-900/40">
                  <div className="w-full h-full rounded-xl bg-slate-900 flex items-center justify-center text-2xl font-bold font-display text-blue-200 border border-white/10">
                    {session.name
                      .split(' ')
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-slate-950" />
                </div>
              </div>

              <h3 className="text-lg font-bold text-white font-display">{session.name}</h3>
              <p className="text-xs text-blue-300 font-medium">{session.title}</p>
              <p className="text-xs text-slate-400 mt-1">{session.department}</p>
            </div>

            {/* Meta details list */}
            <div className="mt-4 pt-4 border-t border-white/10 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Reg ID:</span>
                <span className="font-mono font-semibold text-slate-200">{session.regId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">CIT Email:</span>
                <span className="font-mono text-slate-200 truncate max-w-[180px]">{session.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Campus Office:</span>
                <span className="text-slate-200 text-right">{session.office}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Authentication:</span>
                <span className="text-slate-300">{session.lastLogin}</span>
              </div>
              <div className="flex justify-between items-center pt-1">
                <span className="text-slate-400">Security Token:</span>
                <span className="font-mono text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                  {session.token.slice(0, 18)}...
                </span>
              </div>
            </div>

            {/* Simulated QR Code for Gate Access */}
            <div className="mt-4 p-3 rounded-xl bg-slate-900/80 border border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-8 h-8 text-blue-400 shrink-0" />
                <div className="text-[11px]">
                  <p className="font-semibold text-white">Smart Gate QR Access</p>
                  <p className="text-slate-400">Main CIT Fountain Entrance</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-900/40 px-2 py-1 rounded">
                VALID
              </span>
            </div>
          </div>

          {/* Security Compliance Card */}
          <div className="rounded-2xl glass-panel p-4 text-xs text-slate-300 space-y-2">
            <div className="flex items-center gap-2 text-blue-300 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>CIT Security Perimeter</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Your session is routed through Chilika Institute of Technology Intranet Gateway. IP logging and role authorization are enforced.
            </p>
          </div>
        </div>

        {/* Right Column: Role Modules & Workspace Dashboard */}
        <div className="entrance-anim-item lg:col-span-8 space-y-6">
          {/* Welcome Banner */}
          <div className="p-6 rounded-2xl glass-panel relative overflow-hidden bg-gradient-to-r from-blue-900/40 via-slate-900/60 to-indigo-900/40">
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold mb-2">
                <Bell className="w-3.5 h-3.5 text-blue-300" />
                <span>Notice: Academic Session 2026–2027 Underway</span>
              </div>
              <h2 className="text-2xl font-bold font-display text-white">
                Welcome to CampusSync, {session.name.split(' ')[0]}
              </h2>
              <p className="text-sm text-slate-300 mt-1 max-w-xl">
                You have authenticated as <span className="text-white font-semibold">{roleMeta.label}</span>. All permissions, department records, and administrative tools are loaded and synced.
              </p>
            </div>
          </div>

          {/* Workspace Modules Header */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold font-display text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-blue-400" />
                <span>Authorized Campus Modules</span>
              </h3>
              <span className="text-xs text-slate-400">4 Core Applications Synced</span>
            </div>

            {/* Modules Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {modules.map((mod, idx) => {
                const IconComponent = mod.icon;
                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl glass-panel hover:bg-slate-800/40 border border-white/10 hover:border-blue-400/40 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-300 group-hover:scale-105 group-hover:bg-blue-600/30 transition-all">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-300">
                        {mod.count}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-blue-200 transition-colors flex items-center justify-between">
                      <span>{mod.title}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all text-blue-400" />
                    </h4>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{mod.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Permissions Section */}
          <div className="p-5 rounded-2xl glass-panel">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span>Assigned Role Privileges</span>
            </h4>
            <div className="flex flex-wrap gap-2">
              {session.permissions.map((perm, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-blue-950/50 border border-blue-500/20 text-blue-200 text-xs font-medium flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                  {perm}
                </span>
              ))}
            </div>
          </div>

          {/* Campus Quick Links Footer */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl glass-panel-subtle text-xs text-slate-400">
            <span>Chilika Institute of Technology • CampusSync ERP</span>
            <div className="flex items-center gap-4">
              <button
                onClick={handleSignOut}
                className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
              >
                <span>Switch Role / Account</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
