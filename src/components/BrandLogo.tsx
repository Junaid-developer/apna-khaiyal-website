import React, { useState } from 'react';

interface BrandLogoProps {
  customLogoUrl?: string;
  className?: string;
  showTagline?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'auto' | 'square' | 'horizontal' | 'vertical';
}

export default function BrandLogo({
  customLogoUrl,
  className = '',
  showTagline = true,
  size = 'md',
}: BrandLogoProps) {
  const [imgError, setImgError] = useState(false);

  const logoHeights = {
    sm: 'h-7 sm:h-9 w-7 sm:w-9',
    md: 'h-8 xs:h-9 sm:h-11 md:h-12 w-8 xs:w-9 sm:w-11 md:w-12',
    lg: 'h-11 sm:h-14 md:h-16 w-11 sm:w-14 md:w-16',
    xl: 'h-14 sm:h-18 md:h-22 w-14 sm:w-18 md:w-22',
  }[size];

  const textSizes = {
    sm: { title: 'text-base sm:text-lg font-bold', tagline: 'text-[8px] sm:text-[9px]' },
    md: { title: 'text-lg xs:text-xl sm:text-2xl font-bold', tagline: 'text-[9px] xs:text-[10px] sm:text-[11px]' },
    lg: { title: 'text-xl sm:text-2xl md:text-3xl font-bold', tagline: 'text-[10px] sm:text-xs' },
    xl: { title: 'text-2xl sm:text-3xl md:text-4xl font-bold', tagline: 'text-xs sm:text-sm' },
  }[size];

  const effectiveLogoUrl = (customLogoUrl && customLogoUrl.trim() !== '') ? customLogoUrl : '/logo.png';

  return (
    <div className={`flex items-center space-x-2.5 sm:space-x-3.5 cursor-pointer select-none group/logo ${className}`} id="brand-logo-container">
      {/* Golden Winged "K" Bird Logo Mark on left side of Heading */}
      {!imgError ? (
        <img
          src={effectiveLogoUrl}
          alt="Apna Khaiyal Logo"
          onError={() => setImgError(true)}
          referrerPolicy="no-referrer"
          className={`${logoHeights} object-contain transition-transform duration-300 group-hover/logo:scale-105 shrink-0 rounded-lg`}
        />
      ) : (
        /* Crisp Golden Vector SVG Fallback */
        <div className={`${logoHeights} shrink-0 flex items-center justify-center transition-transform duration-300 group-hover/logo:scale-105`}>
          <svg viewBox="0 0 400 240" fill="none" className="w-full h-full drop-shadow-md">
            <defs>
              <linearGradient id="goldGradFallback" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#FFF0A8"/>
                <stop offset="35%" stopColor="#E7C66A"/>
                <stop offset="75%" stopColor="#D4AF37"/>
                <stop offset="100%" stopColor="#8E6A1B"/>
              </linearGradient>
              <linearGradient id="goldGradFeather" x1="10%" y1="0%" x2="90%" y2="100%">
                <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9"/>
                <stop offset="30%" stopColor="#FFE893"/>
                <stop offset="70%" stopColor="#E7C66A"/>
                <stop offset="100%" stopColor="#9E741B"/>
              </linearGradient>
            </defs>
            <path
              d="M50,26 C75,26 95,35 125,58 C155,82 178,118 202,152 C184,185 158,212 120,222 C88,225 68,205 70,170 C72,130 90,88 140,48 C108,30 75,25 50,26 Z"
              fill="url(#goldGradFallback)"
            />
            <path
              d="M185,150 C215,188 255,208 300,215 C335,212 355,205 350,203 C310,195 272,175 235,142 C215,124 198,138 185,150 Z"
              fill="url(#goldGradFallback)"
            />
            <path
              d="M135,170 C165,130 205,85 255,52 C285,34 315,25 325,25 C315,30 290,48 262,72 C225,105 188,148 160,190 C145,185 138,178 135,170 Z"
              fill="url(#goldGradFeather)"
            />
            <g stroke="#FFF0A8" strokeWidth="2.5" strokeLinecap="round" opacity="0.9">
              <path d="M170,160 C195,126 230,88 275,56" />
              <path d="M180,152 C205,120 238,82 285,50" />
              <path d="M190,144 C215,112 248,76 295,44" />
              <path d="M200,136 C225,104 258,70 305,38" />
            </g>
          </svg>
        </div>
      )}

      {/* Brand Heading & Green Tagline */}
      <div className="flex flex-col justify-center select-none" id="brand-text-block">
        <span className={`${textSizes.title} font-sans tracking-wide text-[#E7C66A] group-hover/logo:text-[#F3E2A9] transition-colors leading-tight`}>
          Apna Khaiyal
        </span>
        {showTagline && (
          <span className={`${textSizes.tagline} font-sans font-semibold tracking-wider text-[#22c55e] uppercase leading-tight mt-0.5 group-hover/logo:text-[#4ade80] transition-colors`}>
            Anytime Anywhere
          </span>
        )}
      </div>
    </div>
  );
}





