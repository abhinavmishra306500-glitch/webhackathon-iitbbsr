import React from 'react';
import { ArrowRight } from 'lucide-react';

interface GlassFeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  onClick: () => void;
}

export const GlassFeatureCard: React.FC<GlassFeatureCardProps> = ({
  icon: Icon,
  title,
  description,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className="liquid-glass-card rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 select-none group cursor-pointer"
    >
      <div className="flex items-center gap-3.5 min-w-0">
        {/* Glowing Blue/Cyan Circular Icon */}
        <div className="circle-icon-badge w-11 h-11 rounded-full flex items-center justify-center text-white shrink-0 group-hover:scale-105 transition-transform duration-200">
          <Icon className="w-5 h-5 text-white" />
        </div>

        {/* Title and Short Description */}
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-200 transition-colors truncate">
            {title}
          </h3>
          <p className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2">
            {description}
          </p>
        </div>
      </div>

      {/* Right Circular Arrow Button */}
      <div className="circle-arrow-btn w-8 h-8 rounded-full flex items-center justify-center shrink-0">
        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
      </div>
    </div>
  );
};
