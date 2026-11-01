/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * TontinePro - Brand Logo Component
 */

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  variant?: 'light' | 'dark' | 'white';
}

export const Logo: React.FC<LogoProps> = ({ size = 'md', showTagline = false, variant = 'dark' }) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const textColor = variant === 'white' ? 'text-white' : 'text-slate-900';
  const taglineColor = variant === 'white' ? 'text-emerald-200' : 'text-slate-500';

  return (
    <div className="flex items-center gap-2.5 group select-none">
      <div className={`relative ${iconSizes[size]} rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-950 flex items-center justify-center shadow-sm shrink-0 border border-emerald-500/20`}>
        {/* Solidary Rings SVG */}
        <svg viewBox="0 0 40 40" className="w-5 h-5 text-white" fill="none" stroke="currentColor">
          <circle cx="20" cy="20" r="14" strokeWidth="2.5" stroke="#10b981" />
          <circle cx="20" cy="20" r="7" strokeWidth="2" stroke="#ffffff" />
          <path d="M20 6V10M20 30V34M6 20H10M30 20H34" strokeWidth="2.5" strokeLinecap="round" stroke="#34d399" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className={`font-extrabold tracking-tight ${textSizes[size]} ${textColor} flex items-center gap-1.5`}>
          <span>Tontine<span className="text-emerald-600">Pro</span></span>
          <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-gradient-to-r from-blue-700 to-indigo-700 text-white px-1.5 py-0.5 rounded-md shadow-2xs border border-blue-400/30">
            Lite
          </span>
        </div>
        {showTagline && (
          <span className={`text-[10px] font-medium tracking-wide ${taglineColor} mt-0.5`}>
            Votre tontine, en toute transparence
          </span>
        )}
      </div>
    </div>
  );
};
