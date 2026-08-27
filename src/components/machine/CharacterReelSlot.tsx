'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { sound } from '@/lib/audio';

interface CharacterReelSlotProps {
  globalIndex: number;
  totalSlots: number;
  targetChar: string;
  isSpinning: boolean;
  isLocked: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789★ ';

export const CharacterReelSlot: React.FC<CharacterReelSlotProps> = ({
  globalIndex,
  totalSlots,
  targetChar,
  isSpinning,
  isLocked,
}) => {
  const [hasOvershot, setHasOvershot] = useState<boolean>(false);
  const prevLockedRef = useRef<boolean>(isLocked);

  useEffect(() => {
    if (!prevLockedRef.current && isLocked) {
      const pitchFactor = 0.9 + (globalIndex / Math.max(totalSlots, 1)) * 0.35;
      sound.playLockSnap(pitchFactor);

      // Settle bounce
      setHasOvershot(true);
      const timer = setTimeout(() => setHasOvershot(false), 140);
      return () => clearTimeout(timer);
    }
    prevLockedRef.current = isLocked;
  }, [isLocked, globalIndex, totalSlots]);

  const spinStrip = useMemo(() => {
    const chars: string[] = [];
    const baseOffset = (globalIndex * 5) % ALPHABET.length;
    for (let i = 0; i < 20; i++) {
      chars.push(ALPHABET[(baseOffset + i) % ALPHABET.length]);
    }
    return chars;
  }, [globalIndex]);

  if (targetChar === ' ') {
    return <div className="w-2 sm:w-3 md:w-4 h-16 sm:h-20 md:h-22 shrink-0" />;
  }

  const isCurrentlySpinning = isSpinning && !isLocked;

  return (
    <div className="relative flex items-center justify-center select-none">
      {/* Individual Drum Reel Housing (Clean, no glow) */}
      <div
        className={`w-8 sm:w-10 md:w-12 lg:w-13 h-16 sm:h-20 md:h-22 rounded-lg relative overflow-hidden transition-all duration-150 border-2 ${
          isLocked
            ? 'border-[#EB0028] ivory-reel-strip'
            : isCurrentlySpinning
            ? 'border-neutral-400 ivory-reel-strip'
            : 'border-neutral-600 ivory-reel-strip'
        } ${hasOvershot ? 'scale-105' : 'scale-100'}`}
      >
        {/* Top & Bottom 3D Cylinder Curvature Shadows */}
        <div className="absolute inset-x-0 top-0 h-6 drum-cylinder-shading z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-6 drum-cylinder-shading rotate-180 z-20 pointer-events-none" />

        {/* 1. GPU High-Speed Spinning Strip (Sharp text) */}
        {isCurrentlySpinning && (
          <div className="absolute inset-x-0 flex flex-col items-center animate-reel-fast-roll pointer-events-none">
            {spinStrip.map((char, i) => (
              <div key={i} className="h-[56px] w-full flex items-center justify-center shrink-0">
                <span
                  className="font-mono font-black text-xl sm:text-2xl md:text-3xl text-neutral-900"
                  style={{ fontFamily: 'Impact, "Arial Black", -apple-system, sans-serif' }}
                >
                  {char}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 2. Settled Target Character (Clean text with zero text-shadow or glow) */}
        {!isCurrentlySpinning && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
              hasOvershot ? 'translate-y-1 scale-105' : 'translate-y-0 scale-100'
            }`}
          >
            <span
              className={`font-mono font-black text-xl sm:text-2xl md:text-3xl tracking-tight ${
                isLocked
                  ? 'text-[#EB0028] scale-110'
                  : 'text-neutral-900 opacity-90'
              }`}
              style={{ fontFamily: 'Impact, "Arial Black", -apple-system, sans-serif' }}
            >
              {targetChar}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
