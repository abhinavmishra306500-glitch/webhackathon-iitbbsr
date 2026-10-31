import React from 'react';

interface GlassStatCardProps {
  icon: React.ComponentType<{ className?: string }>;
  value: string | number;
  label: string;
}

export const GlassStatCard: React.FC<GlassStatCardProps> = ({
  icon: Icon,
  value,
  label,
}) => {
  return (
    <div className="stat-glass-pill rounded-2xl py-3 px-4 flex items-center gap-3.5 select-none group cursor-default">
      {/* Glowing Circular Icon Badge */}
      <div className="circle-icon-badge w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-200">
        <Icon className="w-5 h-5 text-white" />
      </div>

      {/* Number & Label */}
      <div>
        <div className="text-2xl sm:text-3xl font-extrabold font-display text-white tracking-tight leading-none">
          {value}
        </div>
        <div className="text-xs font-semibold text-slate-200/90 mt-1 leading-none tracking-wide">
          {label}
        </div>
      </div>
    </div>
  );
};
