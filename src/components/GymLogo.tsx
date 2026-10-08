import React from 'react';

interface GymLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export const GymLogo: React.FC<GymLogoProps> = ({ 
  size = 'md', 
  showText = true,
  className = '' 
}) => {
  // Proportions according to size
  const config = {
    sm: { iconSize: 'w-8 h-8', textTitle: 'text-base', subText: 'text-[8px]', gap: 'gap-2' },
    md: { iconSize: 'w-10 h-10 sm:w-11 sm:h-11', textTitle: 'text-lg sm:text-2xl', subText: 'text-[9px] sm:text-[10px]', gap: 'gap-2.5 sm:gap-3' },
    lg: { iconSize: 'w-14 h-14', textTitle: 'text-2xl sm:text-3xl', subText: 'text-xs', gap: 'gap-3.5' },
    xl: { iconSize: 'w-20 h-20', textTitle: 'text-3xl sm:text-4xl', subText: 'text-sm', gap: 'gap-4' }
  }[size];

  return (
    <div className={`inline-flex items-center ${config.gap} whitespace-nowrap select-none group ${className}`}>
      {/* Brand-New Luxury Spartan & Iron Dumbbells Gold Emblem Icon */}
      <div className={`relative ${config.iconSize} shrink-0 drop-shadow-[0_4px_16px_rgba(247,203,85,0.4)] group-hover:scale-105 group-hover:drop-shadow-[0_6px_22px_rgba(247,203,85,0.6)] transition-all duration-300`}>
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* 3D Platinum Gold Outer Shield Gradient */}
            <linearGradient id="shieldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fff7a1" />
              <stop offset="25%" stopColor="#f59e0b" />
              <stop offset="50%" stopColor="#d97706" />
              <stop offset="85%" stopColor="#92400e" />
              <stop offset="100%" stopColor="#451a03" />
            </linearGradient>

            {/* Inner Dark Carbon Gradient */}
            <linearGradient id="shieldInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#121826" />
              <stop offset="50%" stopColor="#080b12" />
              <stop offset="100%" stopColor="#020408" />
            </linearGradient>

            {/* 24K Pure Gold Plates Gradient */}
            <linearGradient id="goldPlate24k" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#fff9c4" />
              <stop offset="30%" stopColor="#f7cb55" />
              <stop offset="70%" stopColor="#d97706" />
              <stop offset="100%" stopColor="#78350f" />
            </linearGradient>

            {/* Glowing Core Radial */}
            <radialGradient id="centerCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f7cb55" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f7cb55" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ================= 1. OCTAGONAL / SHIELD ATHLETIC BASE ================= */}
          {/* Outer Gold Facet Border */}
          <polygon 
            points="50,2 88,14 96,50 82,86 50,98 18,86 4,50 12,14" 
            fill="url(#shieldBorderGrad)" 
            stroke="#fff7a1" 
            strokeWidth="1.2"
          />

          {/* Inner Dark Carbon Shield */}
          <polygon 
            points="50,6 84,17 91,50 78,82 50,93 22,82 9,50 16,17" 
            fill="url(#shieldInnerGrad)" 
            stroke="#d97706" 
            strokeWidth="1.2"
          />

          {/* Center Energy Glow */}
          <circle cx="50" cy="50" r="38" fill="url(#centerCoreGlow)" />

          {/* ================= 2. CROSSED HEAVY HEXAGONAL DUMBBELLS ================= */}
          {/* Dumbbell 1: Top-Left to Bottom-Right */}
          <g transform="rotate(45 50 50)">
            {/* Bar Handle with Knurling */}
            <rect x="26" y="47" width="48" height="6" rx="2" fill="url(#goldPlate24k)" stroke="#fff" strokeWidth="0.5" />
            <line x1="38" y1="47.5" x2="38" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="44" y1="47.5" x2="44" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="50" y1="47.5" x2="50" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="56" y1="47.5" x2="56" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="62" y1="47.5" x2="62" y2="52.5" stroke="#78350f" strokeWidth="1" />
            
            {/* Left Hex Plates */}
            <rect x="14" y="38" width="6" height="24" rx="2" fill="url(#goldPlate24k)" stroke="#fff7a1" strokeWidth="0.8" />
            <rect x="21" y="41" width="4" height="18" rx="1.5" fill="#451a03" stroke="#f59e0b" strokeWidth="0.8" />
            
            {/* Right Hex Plates */}
            <rect x="75" y="41" width="4" height="18" rx="1.5" fill="#451a03" stroke="#f59e0b" strokeWidth="0.8" />
            <rect x="80" y="38" width="6" height="24" rx="2" fill="url(#goldPlate24k)" stroke="#fff7a1" strokeWidth="0.8" />
          </g>

          {/* Dumbbell 2: Top-Right to Bottom-Left */}
          <g transform="rotate(-45 50 50)">
            {/* Bar Handle with Knurling */}
            <rect x="26" y="47" width="48" height="6" rx="2" fill="url(#goldPlate24k)" stroke="#fff" strokeWidth="0.5" />
            <line x1="38" y1="47.5" x2="38" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="44" y1="47.5" x2="44" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="50" y1="47.5" x2="50" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="56" y1="47.5" x2="56" y2="52.5" stroke="#78350f" strokeWidth="1" />
            <line x1="62" y1="47.5" x2="62" y2="52.5" stroke="#78350f" strokeWidth="1" />

            {/* Left Hex Plates */}
            <rect x="14" y="38" width="6" height="24" rx="2" fill="url(#goldPlate24k)" stroke="#fff7a1" strokeWidth="0.8" />
            <rect x="21" y="41" width="4" height="18" rx="1.5" fill="#451a03" stroke="#f59e0b" strokeWidth="0.8" />
            
            {/* Right Hex Plates */}
            <rect x="75" y="41" width="4" height="18" rx="1.5" fill="#451a03" stroke="#f59e0b" strokeWidth="0.8" />
            <rect x="80" y="38" width="6" height="24" rx="2" fill="url(#goldPlate24k)" stroke="#fff7a1" strokeWidth="0.8" />
          </g>

          {/* ================= 3. CENTER POWER EMBLEM: CROWN & M22 ================= */}
          {/* Center Crown Crest */}
          <path 
            d="M36 30 L50 20 L64 30 L58 35 L50 31 L42 35 Z" 
            fill="url(#goldPlate24k)" 
            stroke="#fff" 
            strokeWidth="0.8"
          />

          {/* Center Diamond Plate */}
          <polygon 
            points="50,33 69,50 50,67 31,50" 
            fill="#060910" 
            stroke="url(#shieldBorderGrad)" 
            strokeWidth="2.2" 
          />
          <polygon 
            points="50,36 65,50 50,64 35,50" 
            fill="#0d131f" 
            stroke="#fff7a1" 
            strokeWidth="0.8" 
          />

          {/* 3D Bold M22 Monogram */}
          <text 
            x="50" 
            y="55" 
            textAnchor="middle" 
            fill="#fff9c4" 
            fontSize="14" 
            fontWeight="900" 
            fontFamily="'Russo One', 'Orbitron', sans-serif"
            letterSpacing="-1"
            className="select-none"
          >
            M22
          </text>
        </svg>
      </div>

      {/* Brand Typography & Gym Name (Custom Athletic Font) */}
      {showText && (
        <div className="flex flex-col items-start justify-center leading-none text-right rtl:text-right ltr:text-left">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            {/* GYM in Platinum Chrome White */}
            <span className={`font-['Russo_One',sans-serif] ${config.textTitle} text-white tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] group-hover:text-amber-200 transition-colors`}>
              GYM
            </span>

            {/* M22 in Glowing 24K Gold Gradient */}
            <span className={`font-['Russo_One',sans-serif] ${config.textTitle} bg-gradient-to-r from-[#fff7a1] via-[#f7cb55] to-[#e5a91b] bg-clip-text text-transparent tracking-tight uppercase drop-shadow-[0_2px_12px_rgba(247,203,85,0.5)]`}>
              M22
            </span>
          </div>

          {/* Athletic Sub-brand Tagline */}
          <span className={`font-['Orbitron',sans-serif] font-black ${config.subText} text-[#f7cb55]/90 tracking-[0.25em] uppercase mt-0.5 opacity-90`}>
            PRO FITNESS
          </span>
        </div>
      )}
    </div>
  );
};
