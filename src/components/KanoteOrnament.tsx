import React from 'react';

interface KanoteProps {
  className?: string;
  variant?: 'divider' | 'corner' | 'stupa' | 'frame';
}

export const KanoteOrnament: React.FC<KanoteProps> = ({ className = '', variant = 'divider' }) => {
  if (variant === 'stupa') {
    // Ancient Bagan Stupa / Pagoda Spire Silhouette
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 120 70"
          className="w-24 h-14 text-amber-500/80 drop-shadow-md"
          fill="currentColor"
        >
          {/* Spire / Hti */}
          <circle cx="60" cy="4" r="2.5" fill="#f59e0b" />
          <path d="M59 6h2v10h-2z" fill="#f59e0b" />
          <path d="M56 16h8l-2 4h-4z" fill="#d97706" />
          <path d="M54 20h12l-2 5h-8z" fill="#f59e0b" />
          {/* Bell shape / Stupa dome (Bagan style) */}
          <path
            d="M60 25 C52 28, 46 36, 48 46 L72 46 C74 36, 68 28, 60 25 Z"
            fill="url(#stupaGold)"
          />
          {/* Terraces */}
          <path d="M42 46h36v4h-36z" fill="#b45309" />
          <path d="M36 50h48v5h-48z" fill="#92400e" />
          <path d="M30 55h60v6h-60z" fill="#78350f" />
          {/* Base plinth */}
          <path d="M24 61h72v4h-72z" fill="#451a03" />

          {/* Side ornamental flames / Kanote leaves */}
          <path
            d="M44 45 C38 42, 34 35, 30 40 C34 46, 38 48, 42 48 Z"
            fill="#d97706"
          />
          <path
            d="M76 45 C82 42, 86 35, 90 40 C86 46, 82 48, 78 48 Z"
            fill="#d97706"
          />

          <defs>
            <linearGradient id="stupaGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    );
  }

  if (variant === 'corner') {
    return (
      <svg
        viewBox="0 0 50 50"
        className={`w-8 h-8 text-amber-500/70 pointer-events-none ${className}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M2 2 H35 C28 6, 20 14, 20 25 C14 20, 6 28, 2 35 Z" fill="rgba(245, 158, 11, 0.15)" />
        <path d="M2 2 L2 45 M2 2 L45 2" stroke="#d97706" strokeWidth="2" />
        <circle cx="10" cy="10" r="3" fill="#f59e0b" />
        <path d="M12 25 C16 16, 25 12, 35 12" stroke="#f59e0b" strokeLinecap="round" />
        <path d="M25 12 C20 18, 18 25, 20 35" stroke="#b45309" strokeLinecap="round" />
      </svg>
    );
  }

  // Default: Horizontal Kanote Floral Divider
  return (
    <div className={`flex items-center justify-center gap-2 py-2 select-none ${className}`}>
      <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-amber-600/40 to-amber-500/60" />
      <svg viewBox="0 0 160 24" className="w-36 h-6 text-amber-500/90" fill="currentColor">
        {/* Central Lotus Bud */}
        <circle cx="80" cy="12" r="3" fill="#fef08a" />
        <path
          d="M80 5 C77 9, 76 13, 80 17 C84 13, 83 9, 80 5 Z"
          fill="#f59e0b"
        />
        {/* Left Kanote Swirl */}
        <path
          d="M74 12 C66 6, 58 10, 52 14 C58 15, 64 12, 70 14 C62 18, 54 18, 46 12 C52 8, 62 6, 72 10 Z"
          fill="url(#goldGrad)"
        />
        <circle cx="44" cy="12" r="1.8" fill="#d97706" />
        {/* Right Kanote Swirl */}
        <path
          d="M86 12 C94 6, 102 10, 108 14 C102 15, 96 12, 90 14 C98 18, 106 18, 114 12 C108 8, 98 6, 88 10 Z"
          fill="url(#goldGrad)"
        />
        <circle cx="116" cy="12" r="1.8" fill="#d97706" />

        <defs>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d97706" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
        </defs>
      </svg>
      <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent via-amber-600/40 to-amber-500/60" />
    </div>
  );
};
