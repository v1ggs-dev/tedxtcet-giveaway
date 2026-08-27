'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { sound } from '@/lib/audio';

interface CharacterReelSlotProps {
  globalIndex: number;
  totalSlots: number;
  rowLength?: number;
  targetChar: string;
  isSpinning: boolean;
  isLocked: boolean;
}

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789★ ';

export const CharacterReelSlot: React.FC<CharacterReelSlotProps> = ({
  globalIndex,
  totalSlots,
  rowLength = 8,
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

  // Dynamic slot sizing based on number of characters in row
  const isLongRow = rowLength >= 10;
  const isMediumRow = rowLength >= 8 && rowLength < 10;

  if (targetChar === ' ') {
    return (
      <div
        className={`shrink-0 ${
          isLongRow
            ? 'w-1 xs:w-1.5 sm:w-3 h-10 xs:h-12 sm:h-20'
            : isMediumRow
            ? 'w-1.5 xs:w-2 sm:w-3.5 h-12 xs:h-14 sm:h-20'
            : 'w-2 xs:w-2.5 sm:w-4 h-13 xs:h-15 sm:h-22'
        }`}
      />
    );
  }

  const isCurrentlySpinning = isSpinning && !isLocked;

  const slotDimensions = isLongRow
    ? 'w-[20px] xs:w-[25px] sm:w-10 md:w-12 h-10 xs:h-12 sm:h-20 md:h-22 rounded sm:rounded-lg'
    : isMediumRow
    ? 'w-6 xs:w-7.5 sm:w-10 md:w-12 h-12 xs:h-14 sm:h-20 md:h-22 rounded-md sm:rounded-lg'
    : 'w-7 xs:w-8.5 sm:w-11 md:w-13 h-13 xs:h-15 sm:h-22 rounded-md sm:rounded-lg';

  const fontDimensions = isLongRow
    ? 'text-xs xs:text-sm sm:text-2xl md:text-3xl'
    : isMediumRow
    ? 'text-sm xs:text-base sm:text-2xl md:text-3xl'
    : 'text-base xs:text-xl sm:text-3xl md:text-4xl';

  const rollHeight = isLongRow
    ? 'h-[40px] xs:h-[48px] sm:h-[80px]'
    : isMediumRow
    ? 'h-[48px] xs:h-[56px] sm:h-[80px]'
    : 'h-[52px] xs:h-[60px] sm:h-[88px]';

  return (
    <div className="relative flex items-center justify-center select-none shrink-0">
      {/* Individual Drum Reel Housing (Zero wrapping, fluid responsive scaling) */}
      <div
        className={`${slotDimensions} relative overflow-hidden transition-all duration-150 border sm:border-2 ${
          isLocked
            ? 'border-[#EB0028] ivory-reel-strip shadow-[0_0_8px_rgba(235,0,40,0.4)]'
            : isCurrentlySpinning
            ? 'border-neutral-400 ivory-reel-strip'
            : 'border-neutral-600 ivory-reel-strip'
        } ${hasOvershot ? 'scale-105' : 'scale-100'}`}
      >
        {/* Top & Bottom 3D Cylinder Curvature Shadows */}
        <div className="absolute inset-x-0 top-0 h-3 xs:h-3.5 sm:h-6 drum-cylinder-shading z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-3 xs:h-3.5 sm:h-6 drum-cylinder-shading rotate-180 z-20 pointer-events-none" />

        {/* 1. GPU High-Speed Spinning Strip */}
        {isCurrentlySpinning && (
          <div className="absolute inset-x-0 flex flex-col items-center animate-reel-fast-roll pointer-events-none">
            {spinStrip.map((char, i) => (
              <div key={i} className={`${rollHeight} w-full flex items-center justify-center shrink-0`}>
                <span
                  className={`font-mono font-black ${fontDimensions} text-neutral-900 leading-none`}
                  style={{ fontFamily: 'Impact, "Arial Black", -apple-system, sans-serif' }}
                >
                  {char}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* 2. Settled Target Character */}
        {!isCurrentlySpinning && (
          <div
            className={`absolute inset-0 flex items-center justify-center transition-transform duration-200 ${
              hasOvershot ? 'translate-y-0.5 scale-105' : 'translate-y-0 scale-100'
            }`}
          >
            <span
              className={`font-mono font-black ${fontDimensions} tracking-tight leading-none ${
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
