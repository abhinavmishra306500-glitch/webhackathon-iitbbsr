import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { GlassNavbar } from './GlassNavbar';
import { GlassSidebar } from './GlassSidebar';
import { CampusBackground } from '../CampusBackground';
import { AtmosphericCanvas } from '../AtmosphericCanvas';
import type { UserRole } from '../../types';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentRole: UserRole;
  onRoleChange: (newRole: UserRole) => void;
  onLogout: () => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentRole,
  onRoleChange,
  onLogout,
}) => {
  const contentRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.dashboard-anim-item',
        {
          opacity: 0,
          y: isReducedMotion ? 0 : 15,
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power2.out',
        }
      );
    }, contentRef);

    return () => ctx.revert();
  }, [children]);

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-slate-100 flex flex-col">
      {/* 1. Exact CIT Campus Background (Fixed throughout navigation) */}
      <CampusBackground />

      {/* 2. Floating Atmospheric Particles */}
      <AtmosphericCanvas />

      {/* 3. Main Dashboard Grid */}
      <div className="relative z-20 flex-1 flex p-3 sm:p-4 lg:p-5 gap-4 lg:gap-6 max-w-[1700px] w-full mx-auto">
        {/* Left Floating Sidebar */}
        <div className="hidden lg:block">
          <GlassSidebar currentRole={currentRole} />
        </div>

        {/* Right Content Area: Navbar on top, Module content below */}
        <div ref={contentRef} className="flex-1 flex flex-col min-w-0">
          <GlassNavbar
            currentRole={currentRole}
            onRoleChange={onRoleChange}
            onLogout={onLogout}
          />

          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
