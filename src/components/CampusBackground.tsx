import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface CampusBackgroundProps {
  onLoaded?: () => void;
}

export const CampusBackground: React.FC<CampusBackgroundProps> = ({ onLoaded }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const isReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Smooth fade-in & cinematic camera zoom on mount
    const ctx = gsap.context(() => {
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          {
            opacity: 0,
            scale: isReducedMotion ? 1 : 1.07,
          },
          {
            opacity: 1,
            scale: 1,
            duration: 2.4,
            ease: 'power2.out',
            onComplete: () => {
              if (onLoaded) onLoaded();
            },
          }
        );
      }
    }, containerRef);

    // Mouse parallax tracking
    if (!isReducedMotion) {
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;
      let isMoving = false;

      const handleMouseMove = (e: MouseEvent) => {
        // Calculate normalized offset from viewport center (-1 to 1)
        const { innerWidth, innerHeight } = window;
        mouseX = (e.clientX / innerWidth - 0.5) * 2;
        mouseY = (e.clientY / innerHeight - 0.5) * 2;

        if (!isMoving) {
          isMoving = true;
          requestAnimationFrame(updateParallax);
        }
      };

      const updateParallax = () => {
        // Subtle easing towards target
        targetX += (mouseX * 12 - targetX) * 0.05;
        targetY += (mouseY * 8 - targetY) * 0.05;

        if (imageRef.current) {
          gsap.set(imageRef.current, {
            x: -targetX,
            y: -targetY,
          });
        }

        if (Math.abs(mouseX * 12 - targetX) > 0.05 || Math.abs(mouseY * 8 - targetY) > 0.05) {
          requestAnimationFrame(updateParallax);
        } else {
          isMoving = false;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);

      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        ctx.revert();
      };
    }

    return () => {
      ctx.revert();
    };
  }, [onLoaded]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 w-full h-full overflow-hidden pointer-events-none select-none z-0 bg-slate-950"
      aria-hidden="true"
    >
      {/* Real CIT Campus Background Image with subtle scale buffer for parallax */}
      <div
        ref={imageRef}
        className="absolute -top-[3%] -left-[3%] -right-[3%] -bottom-[3%] w-[106%] h-[106%] bg-cover will-change-transform"
        style={{
          backgroundImage: `url('/assets/cit-campus.jpg')`,
          // Center the central rotunda, CIT letters, and fountain
          backgroundPosition: 'center 42%',
          backgroundRepeat: 'no-repeat',
        }}
      />

      {/* Light, natural cinematic overlay:
          - Preserves realistic daylight, fountain, and CIT architecture
          - Provides clean contrast for text without muddy dark slop
      */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-slate-950/40 via-transparent to-slate-950/45" 
      />
      <div 
        className="absolute inset-0 bg-gradient-to-b from-slate-950/30 via-transparent to-slate-950/40" 
      />
    </div>
  );
};
