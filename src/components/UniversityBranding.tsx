import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ShieldCheck, Sparkles, Building2, MapPin } from 'lucide-react';

interface UniversityBrandingProps {
  onExploreCampus?: () => void;
}

export const UniversityBranding: React.FC<UniversityBrandingProps> = () => {
  const brandingRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        brandingRef.current,
        {
          opacity: 0,
          y: isReducedMotion ? 0 : 22,
        },
        {
          opacity: 1,
          y: 0,
          duration: 1.4,
          delay: 0.35,
          ease: 'power3.out',
        }
      );
    }, brandingRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={brandingRef}
      className="flex flex-col items-start gap-4 select-none max-w-xl z-20"
    >
      {/* Top Academic Tag */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/60 border border-blue-500/20 backdrop-blur-md shadow-lg shadow-black/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        <span className="text-xs font-semibold tracking-wider text-blue-200/90 uppercase">
          Official University Gateway
        </span>
        <span className="text-white/20 text-xs">•</span>
        <span className="text-xs font-medium text-slate-300/80">Est. 2009</span>
      </div>

      {/* Main Logo & Typography */}
      <div className="flex items-center gap-4 group">
        {/* Stylized Lotus Emblem matching building front facade */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-700/70 via-blue-900/60 to-slate-900/80 p-2.5 border border-blue-400/30 backdrop-blur-xl shadow-xl shadow-blue-950/40 flex items-center justify-center transition-all duration-300 group-hover:border-blue-400/60 group-hover:shadow-blue-500/20">
          <img
            src="/cit-logo.svg"
            alt="Chilika Institute of Technology Emblem"
            className="w-full h-full object-contain filter drop-shadow-[0_2px_8px_rgba(59,130,246,0.6)]"
          />
          {/* Subtle inner reflection */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-transparent via-white/5 to-white/15 pointer-events-none" />
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight font-display bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-blue-200 drop-shadow-sm">
              CIT
            </h1>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 border border-blue-400/30 tracking-wider">
              CAMPUS
            </span>
          </div>

          <h2 className="text-sm sm:text-base font-bold tracking-[0.22em] text-blue-100/90 uppercase drop-shadow-md">
            Chilika Institute of Technology
          </h2>
        </div>
      </div>

      {/* Subtitle & Smart Campus Tagline */}
      <div className="space-y-1.5 pl-0.5">
        <p className="text-base sm:text-lg font-medium text-slate-200/90 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-400 shrink-0" />
          <span>CampusSync – Smart Campus Management System</span>
        </p>
        <p className="text-xs sm:text-sm text-slate-400/80 max-w-md leading-relaxed hidden sm:block">
          Unified digital ecosystem connecting academic blocks, labs, administration, and student life across the Chilika campus.
        </p>
      </div>

      {/* University Highlights Pills */}
      <div className="flex flex-wrap items-center gap-2 pt-2 hidden md:flex">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 border border-white/10 text-xs text-slate-300/80 backdrop-blur-md">
          <Building2 className="w-3.5 h-3.5 text-blue-400" />
          <span>Main Academic Rotunda</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 border border-white/10 text-xs text-slate-300/80 backdrop-blur-md">
          <MapPin className="w-3.5 h-3.5 text-cyan-400" />
          <span>Chilika Campus</span>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900/50 border border-white/10 text-xs text-slate-300/80 backdrop-blur-md">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SSO Enterprise v4.2</span>
        </div>
      </div>
    </div>
  );
};
