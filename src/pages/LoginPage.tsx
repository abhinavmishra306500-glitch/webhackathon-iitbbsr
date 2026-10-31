import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CampusBackground } from '../components/CampusBackground';
import { AtmosphericCanvas } from '../components/AtmosphericCanvas';
import { UniversityBranding } from '../components/UniversityBranding';
import { LoginCard } from '../components/LoginCard';
import type { UserSession } from '../types';

interface LoginPageProps {
  onLoginSuccess: (session: UserSession) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const navigate = useNavigate();

  const handleSuccess = (session: UserSession) => {
    onLoginSuccess(session);
    navigate('/');
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden">
      {/* 1. Cinematic Full-Screen CIT Campus Background */}
      <CampusBackground />

      {/* 2. Floating Atmospheric Particles */}
      <AtmosphericCanvas />

      {/* 3. Login Interface */}
      <div className="relative z-20 min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10">
        {/* Top Row: Upper-Left CIT University Branding */}
        <div className="w-full flex items-start justify-between">
          <UniversityBranding />
        </div>

        {/* Middle-Right Row: Positioned on the Right Side & Elevated above Bottom */}
        <div className="w-full flex-1 flex items-center justify-end py-4 pr-0 sm:pr-6 md:pr-10 lg:pr-16 xl:pr-24">
          <div className="w-full max-w-[380px]">
            <LoginCard onLoginSuccess={handleSuccess} />
          </div>
        </div>

        {/* Bottom Bar: Institutional Accreditation & Campus Note */}
        <div className="w-full pt-2 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-300 select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>CampusSync Gateway Online • Chilika Campus Main Rotunda</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300/80">
            <span>© {new Date().getFullYear()} Chilika Institute of Technology</span>
            <span>All rights reserved</span>
          </div>
        </div>
      </div>
    </main>
  );
};
