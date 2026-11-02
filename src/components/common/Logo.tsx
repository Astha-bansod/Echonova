import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
}

export const Logo: React.FC<LogoProps> = ({
  className = '',
  size = 'md',
  showTagline = false,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  }[size];

  const textStyles = {
    sm: 'text-base font-bold tracking-tight',
    md: 'text-xl font-bold tracking-tight',
    lg: 'text-2xl md:text-3xl font-extrabold tracking-tight',
  }[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Original Orbit & Soundwave Emblem */}
      <div className={`relative ${iconDimensions} flex items-center justify-center shrink-0`}>
        {/* Deep Violet & Coral Glow Ambient */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-[#7c3aed]/40 via-[#a78bfa]/20 to-[#ff6b6b]/30 blur-sm pointer-events-none" />

        {/* Outer Orbit Ring */}
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative w-full h-full"
          aria-hidden="true"
        >
          {/* Orbit ellipse */}
          <ellipse
            cx="24"
            cy="24"
            rx="21"
            ry="11"
            transform="rotate(-25 24 24)"
            stroke="url(#orbitGradient)"
            strokeWidth="1.75"
            strokeDasharray="4 2"
            opacity="0.85"
          />
          {/* Orbiting celestial satellite / coral dot */}
          <circle
            cx="39"
            cy="15"
            r="2.5"
            fill="#ff6b6b"
            className="animate-pulse"
          />
          {/* Central Soundwave Bars */}
          <g transform="translate(14, 14)">
            <rect x="0" y="6" width="3" height="8" rx="1.5" fill="#a78bfa" />
            <rect x="5.5" y="2" width="3" height="16" rx="1.5" fill="#c4b5fd" />
            <rect x="11" y="0" width="3.5" height="20" rx="1.75" fill="#ffffff" />
            <rect x="17" y="3" width="3" height="14" rx="1.5" fill="#c4b5fd" />
            <rect x="22.5" y="7" width="3" height="6" rx="1.5" fill="#a78bfa" />
          </g>

          <defs>
            <linearGradient id="orbitGradient" x1="4" y1="24" x2="44" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="#a78bfa" />
              <stop offset="0.6" stopColor="#7c3aed" />
              <stop offset="1" stopColor="#ff6b6b" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Brand Wordmark */}
      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-1.5">
          <span className={`font-display text-white ${textStyles}`}>
            ECHO<span className="text-[#a78bfa]">NOVA</span>
          </span>
          <span className="text-[10px] font-semibold text-[#a78bfa]/70 uppercase tracking-widest pl-0.5">
            JCOET
          </span>
        </div>
        {showTagline && (
          <span className="text-[11px] font-medium text-[#c4b5fd]/70 tracking-wide mt-1">
            Your Voice. Your Universe.
          </span>
        )}
      </div>
    </div>
  );
};
