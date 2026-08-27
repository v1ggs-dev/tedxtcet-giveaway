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

  // -------------------------------------------------------------------------
  // Sizing tiers — ONLY uses standard Tailwind spacing values
  // h-10=40px, h-12=48px, h-14=56px, h-16=64px, h-20=80px
  // w-5=20px, w-6=24px, w-7=28px, w-8=32px, w-10=40px, w-12=48px
  // -------------------------------------------------------------------------
  const isLongRow = rowLength >= 10;
  const isMediumRow = rowLength >= 8 && rowLength < 10;

  // Space character → thin spacer
  if (targetChar === ' ') {
    return (
      <div
        className={
          isLongRow
            ? 'w-1 xs:w-1.5 sm:w-3 h-10 xs:h-12 sm:h-20 shrink'
            : isMediumRow
            ? 'w-1.5 xs:w-2 sm:w-3 h-12 xs:h-14 sm:h-20 shrink'
            : 'w-2 xs:w-2.5 sm:w-4 h-12 xs:h-14 sm:h-20 shrink'
        }
      />
    );
  }

  const isCurrentlySpinning = isSpinning && !isLocked;

  // Outer wrapper sizing — all values are standard Tailwind spacing
  const wrapperSize = isLongRow
    ? 'w-5 xs:w-6 sm:w-10 md:w-12 h-10 xs:h-12 sm:h-20'
    : isMediumRow
    ? 'w-6 xs:w-7 sm:w-10 md:w-12 h-12 xs:h-14 sm:h-20'
    : 'w-7 xs:w-8 sm:w-10 md:w-12 h-12 xs:h-14 sm:h-20';

  const fontDimensions = isLongRow
    ? 'text-[10px] xs:text-xs sm:text-2xl md:text-3xl'
    : isMediumRow
    ? 'text-xs xs:text-sm sm:text-2xl md:text-3xl'
    : 'text-sm xs:text-lg sm:text-3xl md:text-4xl';

  // Roll strip cell height must match the slot height
  const rollHeight = isLongRow
    ? 'h-10 xs:h-12 sm:h-20'
    : isMediumRow
    ? 'h-12 xs:h-14 sm:h-20'
    : 'h-12 xs:h-14 sm:h-20';

  return (
    <div className={`${wrapperSize} relative select-none shrink`}>
      {/* Inner housing — fills parent, clips spin animation */}
      <div
        className={`w-full h-full relative overflow-hidden transition-all duration-150 rounded sm:rounded-lg border sm:border-2 ${
          isLocked
            ? 'border-[#EB0028] ivory-reel-strip shadow-[0_0_8px_rgba(235,0,40,0.4)]'
            : isCurrentlySpinning
            ? 'border-neutral-400 ivory-reel-strip'
            : 'border-neutral-600 ivory-reel-strip'
        } ${hasOvershot ? 'scale-105' : 'scale-100'}`}
      >
        {/* Top & Bottom 3D Cylinder Curvature Shadows */}
        <div className="absolute inset-x-0 top-0 h-3 sm:h-6 drum-cylinder-shading z-20 pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-3 sm:h-6 drum-cylinder-shading rotate-180 z-20 pointer-events-none" />

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
