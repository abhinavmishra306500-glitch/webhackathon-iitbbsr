import React, { useState } from 'react';
import { CampusBackground } from './components/CampusBackground';
import { AtmosphericCanvas } from './components/AtmosphericCanvas';
import { UniversityBranding } from './components/UniversityBranding';
import { LoginCard } from './components/LoginCard';
import { WorkspaceEntrance } from './components/WorkspaceEntrance';
import type { UserSession } from './types';

export const App: React.FC = () => {
  const [session, setSession] = useState<UserSession | null>(null);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
  };

  const handleLogout = () => {
    setSession(null);
  };

  return (
    <main className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden">
      {/* 1. Cinematic Full-Screen CIT Campus Background */}
      <CampusBackground />

      {/* 2. Floating Atmospheric Particles */}
      <AtmosphericCanvas />

      {/* 3. Main Screen View: Login or Workspace Entrance */}
      {!session ? (
        <div className="relative z-20 min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-8 xl:p-10">
          {/* Top Row: Upper-Left CIT University Branding */}
          <div className="w-full flex items-start justify-between">
            <UniversityBranding />
          </div>

          {/* Middle-Right Row: Positioned strictly on the Right Side, vertically centered */}
          <div className="w-full flex-1 flex items-center justify-end py-4 pr-0 sm:pr-6 md:pr-10 lg:pr-16 xl:pr-24">
            <div className="w-full max-w-[380px]">
              <LoginCard onLoginSuccess={handleLoginSuccess} />
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
      ) : (
        /* Authenticated Entrance Screen */
        <div className="relative z-20 flex-1 flex items-center justify-center py-6 sm:py-10">
          <WorkspaceEntrance session={session} onLogout={handleLogout} />
        </div>
      )}
    </main>
  );
};

export default App;
