'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DrawState } from '@/lib/types';
import { sound } from '@/lib/audio';

interface ArcadeControlDeckProps {
  state: DrawState;
  onPull: () => void;
}

export const ArcadeControlDeck: React.FC<ArcadeControlDeckProps> = ({ state, onPull }) => {
  const [pullProgress, setPullProgress] = useState<number>(0); // 0.0 (top) to 1.0 (bottom)
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [isSpringingBack, setIsSpringingBack] = useState<boolean>(false);
  const [travelDistance, setTravelDistance] = useState<number>(100);

  const startYRef = useRef<number>(0);
  const lastRatchetStepRef = useRef<number>(0);
  const isBusy = state === 'SELECTING' || state === 'SPINNING' || state === 'REVEALING' || state === 'INITIALIZING';
  const canPull = !isBusy;

  useEffect(() => {
    const updateTravel = () => {
      setTravelDistance(window.innerWidth < 640 ? 60 : 100);
    };
    updateTravel();
    window.addEventListener('resize', updateTravel);
    return () => window.removeEventListener('resize', updateTravel);
  }, []);

  // Trigger draw action
  const triggerDraw = useCallback(() => {
    sound.playLeverPull();
    onPull();

    setIsSpringingBack(true);
    setTimeout(() => {
      setPullProgress(0);
      setIsSpringingBack(false);
      lastRatchetStepRef.current = 0;
    }, 550);
  }, [onPull]);

  // Pointer Down on the arcade joystick
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!canPull || isSpringingBack) return;

    e.currentTarget.setPointerCapture(e.pointerId);
    setIsDragging(true);
    startYRef.current = e.clientY;
    lastRatchetStepRef.current = 0;
  };

  // Pointer Move: physical drag with mechanical ratchet clicks
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging || !canPull || isSpringingBack) return;

    const deltaY = e.clientY - startYRef.current;
    const progress = Math.max(0, Math.min(1, deltaY / travelDistance));
    setPullProgress(progress);

    // Ratchet gear teeth sound feedback
    const currentStep = Math.floor(progress * 8);
    if (currentStep > lastRatchetStepRef.current) {
      const pitch = 0.9 + (currentStep / 8) * 0.4;
      sound.playRatchetClick(pitch);
      lastRatchetStepRef.current = currentStep;
    }

    // Trigger solenoid at bottom stop (>= 80%)
    if (progress >= 0.8) {
      setIsDragging(false);
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      triggerDraw();
    }
  };

  // Pointer Up
  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    setIsDragging(false);
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {}

    if (pullProgress >= 0.75) {
      triggerDraw();
    } else {
      setIsSpringingBack(true);
      setPullProgress(0);
      lastRatchetStepRef.current = 0;
      setTimeout(() => {
        setIsSpringingBack(false);
      }, 300);
    }
  };

  // Direct Button Launch Press
  const handleButtonPress = () => {
    if (!canPull || isSpringingBack || isDragging) return;
    triggerDraw();
  };

  const currentYOffset = pullProgress * travelDistance;

  return (
    <div className="w-full physical-sloping-deck rounded-2xl sm:rounded-3xl mt-2.5 sm:mt-4 mb-1 sm:mb-2 select-none overflow-hidden flex flex-col">
      
      {/* 3D Angled Deck Surface Plate */}
      <div className="w-full px-2 xs:px-4 sm:px-10 md:px-12 py-4 xs:py-5 sm:py-8 md:py-10 relative flex items-center justify-around gap-2 xs:gap-4 sm:gap-8">
        
        {/* Corner Metallic Carriage Bolts */}
        <div className="absolute top-2 left-3 sm:top-3 sm:left-4 carriage-bolt scale-75 sm:scale-100" />
        <div className="absolute top-2 right-3 sm:top-3 sm:right-4 carriage-bolt scale-75 sm:scale-100" />
        <div className="absolute bottom-2 left-3 sm:bottom-3 sm:left-4 carriage-bolt scale-75 sm:scale-100" />
        <div className="absolute bottom-2 right-3 sm:bottom-3 sm:right-4 carriage-bolt scale-75 sm:scale-100" />

        {/* Specular Deck Surface Reflection */}
        <div className="absolute top-0 inset-x-0 h-0.5 sm:h-1 bg-gradient-to-r from-transparent via-white/20 to-transparent" />

        {/* =========================================================================
            1. RECESSED JOYSTICK MOUNT WITH SOLID BAT-TOP CONTROLLER
            ========================================================================= */}
        <div className="flex flex-col items-center justify-center relative">
          
          {/* Deep Recessed Circular Dish / Well */}
          <div className="w-20 h-28 xs:w-24 xs:h-32 sm:w-32 sm:h-40 rounded-2xl sm:rounded-3xl recessed-joystick-well p-1.5 xs:p-2 sm:p-3 flex items-center justify-center relative">
            
            {/* Thick Concentric Rubber Dust Washer Disc */}
            <div className="w-14 h-14 xs:w-18 xs:h-18 sm:w-24 sm:h-24 rounded-full joystick-dust-collar flex items-center justify-center">
              <div className="w-7 h-7 xs:w-8 xs:h-8 sm:w-10 sm:h-10 rounded-full bg-[#050608] border border-black shadow-inner" />
            </div>

            {/* Substantially Larger Solid Bat-Top Joystick Controller */}
            <div
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
              className={`absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 touch-none flex flex-col items-center z-30 ${
                !canPull
                  ? 'cursor-not-allowed opacity-60'
                  : isDragging
                  ? 'cursor-grabbing'
                  : 'cursor-grab hover:scale-105'
              }`}
              style={{
                transform: `translateX(-50%) translateY(${currentYOffset}px)`,
                transition: isDragging
                  ? 'none'
                  : isSpringingBack
                  ? 'transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  : 'transform 0.12s ease-out',
              }}
            >
              {/* Weighted Bat-Top Knob */}
              <div
                className={`w-10 h-13 xs:w-12 xs:h-15 sm:w-16 sm:h-20 rounded-full solid-battop-knob relative flex items-center justify-center ${
                  isDragging ? 'scale-105 shadow-[0_10px_20px_rgba(0,0,0,0.95)]' : ''
                }`}
              >
                {/* Specular Highlight Glare */}
                <div className="absolute top-2 left-2 sm:top-2.5 sm:left-3 w-3 h-2.5 sm:w-4 sm:h-3.5 rounded-full bg-white blur-[0.5px] -rotate-45" />
                <span className="text-[10px] sm:text-xs font-mono font-black text-neutral-800 pointer-events-none opacity-80">
                  ▼
                </span>
              </div>

              {/* Heavy Cylindrical Chrome Shaft */}
              <div className="w-3.5 xs:w-4.5 sm:w-6 h-9 xs:h-11 sm:h-16 -mt-1 heavy-chrome-shaft rounded-b-md border-x border-neutral-600" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. RECESSED MOUNT WITH GENUINE PHYSICAL ARCADE PUSH-BUTTON
            ========================================================================= */}
        <div className="flex flex-col items-center justify-center relative">
          
          {/* Deep Recessed Circular Bezel Housing */}
          <div className="w-22 h-22 xs:w-26 xs:h-26 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full recessed-button-well p-1.5 xs:p-2 sm:p-4 flex items-center justify-center relative">
            
            {/* Genuine Physical Plunger Arcade Push Button */}
            <button
              onClick={handleButtonPress}
              disabled={!canPull}
              className={`w-16 h-16 xs:w-19 xs:h-19 sm:w-26 sm:h-26 md:w-28 md:h-28 rounded-full physical-arcade-plunger flex flex-col items-center justify-center text-center p-1 sm:p-2 select-none relative ${
                !canPull
                  ? 'cursor-not-allowed opacity-50'
                  : 'cursor-pointer'
              }`}
            >
              {/* Top Specular Arc Highlight */}
              <div className="absolute top-1.5 sm:top-2.5 inset-x-3 sm:inset-x-5 h-2.5 sm:h-4 rounded-full bg-gradient-to-b from-white/70 to-transparent blur-[0.5px]" />

              <span
                className="text-base xs:text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-wider drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] mt-0.5 sm:mt-1"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                DRAW
              </span>
            </button>
          </div>
        </div>

      </div>

      {/* Extruded Physical Front Lip with Metallic Chamfer Edge */}
      <div className="w-full h-3 sm:h-5 deck-front-lip flex items-center justify-center">
        <div className="w-16 sm:w-24 h-0.5 bg-white/20 rounded-full" />
      </div>

    </div>
  );
};
