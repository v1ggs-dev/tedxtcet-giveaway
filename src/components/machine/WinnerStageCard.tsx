'use client';

import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { DrawResult } from '@/lib/types';
import { sound } from '@/lib/audio';
import { parseInstagramHandle } from '@/lib/utils';

interface WinnerStageCardProps {
  draw: DrawResult;
}

export const WinnerStageCard: React.FC<WinnerStageCardProps> = ({ draw }) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [glowPulse, setGlowPulse] = useState<boolean>(false);

  useEffect(() => {
    // Staggered entrance
    requestAnimationFrame(() => setIsVisible(true));
    const detailsTimer = setTimeout(() => setShowDetails(true), 450);

    // Play victory fanfare
    sound.playWinnerFanfare();

    // Vibrant TED Red, Gold, White & Silver Confetti Palette
    const colors = [
      '#EB0028', // TED Red
      '#FFFFFF', // Crisp White
      '#FFD700', // Gold Sparkle
      '#FF4D6A', // Bright Crimson
      '#FFFAFA', // Snow White
      '#E2E8F0', // Chrome Silver
      '#C90022', // Deep Red
      '#FFE082', // Soft Gold
    ];

    // =========================================================================
    // 1. INITIAL HUGE JACKPOT VOLLEY (Grand Opening Cannons)
    // =========================================================================
    const fireInitialVolley = () => {
      // Left Cannon
      confetti({
        particleCount: 80,
        angle: 60,
        spread: 80,
        origin: { x: 0, y: 0.8 },
        colors,
        startVelocity: 65,
        gravity: 0.9,
        ticks: 350,
      });

      // Right Cannon
      confetti({
        particleCount: 80,
        angle: 120,
        spread: 80,
        origin: { x: 1, y: 0.8 },
        colors,
        startVelocity: 65,
        gravity: 0.9,
        ticks: 350,
      });

      // Center High Skyburst
      confetti({
        particleCount: 60,
        angle: 90,
        spread: 120,
        origin: { x: 0.5, y: 0.7 },
        colors,
        startVelocity: 55,
        gravity: 0.8,
        ticks: 350,
      });
    };

    fireInitialVolley();
    const secondBurst = setTimeout(fireInitialVolley, 500);

    // =========================================================================
    // 2. CONTINUOUS LUXURY RAIN CASCADE & PERIODIC POPPERS
    // =========================================================================
    let frame = 0;
    const confettiInterval = setInterval(() => {
      frame++;

      // Gentle floating confetti rain from the top
      confetti({
        particleCount: 8,
        angle: 270,
        spread: 160,
        origin: { x: Math.random() * 0.8 + 0.1, y: -0.05 },
        colors,
        startVelocity: 15,
        gravity: 0.65,
        ticks: 300,
      });

      // Periodic energetic side cannon shots (every ~1.2 seconds)
      if (frame % 4 === 0) {
        confetti({
          particleCount: 25,
          angle: frame % 8 === 0 ? 55 : 125,
          spread: 70,
          origin: { x: frame % 8 === 0 ? 0.05 : 0.95, y: 0.75 },
          colors,
          startVelocity: 50,
          gravity: 0.85,
          ticks: 280,
        });
      }
    }, 280);

    // Ambient red spotlight pulse
    const glowInterval = setInterval(() => {
      setGlowPulse((p) => !p);
    }, 1800);

    return () => {
      clearTimeout(detailsTimer);
      clearTimeout(secondBurst);
      clearInterval(confettiInterval);
      clearInterval(glowInterval);
    };
  }, [draw]);

  // Split name
  const nameParts = draw.winner.name.split(/\s+/);
  const firstName = nameParts[0] || '';
  const lastName = nameParts.slice(1).join(' ') || '';
  
  // Extract Instagram handle
  const customData = (draw.winner.customData as Record<string, unknown>) || {};
  const rawIg =
    draw.winner.instagram ||
    customData.Instagram ||
    customData.instagram ||
    customData['IG Handle'] ||
    customData['Instagram Handle'] ||
    customData.Handle ||
    customData.Username;

  const igHandle = parseInstagramHandle(rawIg);

  return (
    <div
      className={`fixed inset-0 z-40 flex items-center justify-center p-3 sm:p-6 transition-all duration-700 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Cinematic dark backdrop */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />

      {/* Animated radial spotlight glow */}
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] xs:w-[500px] sm:w-[750px] h-[350px] xs:h-[500px] sm:h-[750px] rounded-full pointer-events-none transition-all duration-[2000ms] ${
          glowPulse
            ? 'bg-gradient-to-b from-[#EB0028]/25 via-red-950/20 to-transparent blur-[80px] sm:blur-[140px] scale-110'
            : 'bg-gradient-to-b from-[#EB0028]/12 via-red-950/10 to-transparent blur-[60px] sm:blur-[100px] scale-100'
        }`}
      />

      {/* Main content container */}
      <div
        className={`relative z-10 flex flex-col items-center justify-center text-center px-2 xs:px-4 sm:px-6 max-w-4xl w-full transition-all duration-700 ${
          isVisible ? 'translate-y-0 scale-100' : 'translate-y-8 scale-95'
        }`}
      >
        {/* TEDxTCET Official White Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://cdn.v1ggs.lol/tedxtcet/logo-white.png"
          alt="TEDxTCET"
          className={`h-8 xs:h-11 sm:h-16 md:h-20 w-auto object-contain mb-2 xs:mb-3 sm:mb-4 drop-shadow-[0_2px_14px_rgba(255,255,255,0.4)] transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}
        />

        {/* Decorative top red/white divider with stars */}
        <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
          <div className="w-10 xs:w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#EB0028]" />
          <span className="text-[#EB0028] text-sm sm:text-lg">★</span>
          <span className="text-white text-xs sm:text-sm">★</span>
          <span className="text-[#EB0028] text-sm sm:text-lg">★</span>
          <div className="w-10 xs:w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#EB0028]" />
        </div>

        {/* 2026 TICKETS GIVEAWAY WINNER */}
        <p
          className={`text-xs xs:text-sm sm:text-base md:text-lg font-mono font-black tracking-[0.2em] xs:tracking-[0.28em] sm:tracking-[0.35em] text-[#EB0028] uppercase mb-2 xs:mb-3 sm:mb-5 transition-all duration-700 delay-200 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          ★ 2026 TICKETS GIVEAWAY WINNER ★
        </p>

        {/* Winner Name — Massive Hero Display (Responsive for Phones) */}
        <div
          className={`transition-all duration-700 delay-300 max-w-full px-2 ${
            isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-90'
          }`}
        >
          <h1
            className="text-4xl xs:text-5xl sm:text-8xl md:text-9xl font-black text-white tracking-[0.05em] sm:tracking-[0.08em] leading-[0.95] drop-shadow-[0_4px_25px_rgba(235,0,40,0.7)] break-words"
            style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
          >
            {firstName}
          </h1>
          {lastName && (
            <h1
              className="text-4xl xs:text-5xl sm:text-8xl md:text-9xl font-black text-white tracking-[0.05em] sm:tracking-[0.08em] leading-[0.95] mt-1 drop-shadow-[0_4px_25px_rgba(235,0,40,0.7)] break-words"
              style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
            >
              {lastName}
            </h1>
          )}
        </div>

        {/* Luxury Branded Instagram Winner Tag Pill */}
        {igHandle && (
          <div
            className={`mt-3 xs:mt-4 sm:mt-6 inline-flex items-center gap-2.5 xs:gap-3.5 px-4 xs:px-6 py-2 sm:py-3 rounded-xl sm:rounded-2xl bg-gradient-to-r from-black/90 via-[#180A0D]/95 to-black/90 border-2 border-[#EB0028]/60 shadow-[0_0_35px_rgba(235,0,40,0.4)] backdrop-blur-xl relative overflow-hidden transition-all duration-700 delay-500 max-w-full ${
              showDetails ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'
            }`}
          >
            {/* Ambient Background Gradient Glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#EB0028]/20 via-white/5 to-[#EB0028]/20 pointer-events-none" />

            {/* Official Instagram 2016 Multi-Gradient SVG Logo */}
            <svg
              className="w-7 h-7 xs:w-9 xs:h-9 sm:w-11 sm:h-11 drop-shadow-[0_2px_10px_rgba(235,0,40,0.6)] shrink-0 z-10"
              viewBox="0 0 132.004 132"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <defs>
                <linearGradient id="ig-grad-b">
                  <stop offset="0" stopColor="#3771c8" />
                  <stop stopColor="#3771c8" offset=".128" />
                  <stop offset="1" stopColor="#60f" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="ig-grad-a">
                  <stop offset="0" stopColor="#fd5" />
                  <stop offset=".1" stopColor="#fd5" />
                  <stop offset=".5" stopColor="#ff543e" />
                  <stop offset="1" stopColor="#c837ab" />
                </linearGradient>
                <radialGradient
                  id="ig-rad-c"
                  cx="158.429"
                  cy="578.088"
                  r="65"
                  xlinkHref="#ig-grad-a"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(0 -1.98198 1.8439 0 -1031.402 454.004)"
                  fx="158.429"
                  fy="578.088"
                />
                <radialGradient
                  id="ig-rad-d"
                  cx="147.694"
                  cy="473.455"
                  r="65"
                  xlinkHref="#ig-grad-b"
                  gradientUnits="userSpaceOnUse"
                  gradientTransform="matrix(.17394 .86872 -3.5818 .71718 1648.348 -458.493)"
                  fx="147.694"
                  fy="473.455"
                />
              </defs>
              <path
                fill="url(#ig-rad-c)"
                d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z"
                transform="translate(1.004 1)"
              />
              <path
                fill="url(#ig-rad-d)"
                d="M65.03 0C37.888 0 29.95.028 28.407.156c-5.57.463-9.036 1.34-12.812 3.22-2.91 1.445-5.205 3.12-7.47 5.468C4 13.126 1.5 18.394.595 24.656c-.44 3.04-.568 3.66-.594 19.188-.01 5.176 0 11.988 0 21.125 0 27.12.03 35.05.16 36.59.45 5.42 1.3 8.83 3.1 12.56 3.44 7.14 10.01 12.5 17.75 14.5 2.68.69 5.64 1.07 9.44 1.25 1.61.07 18.02.12 34.44.12 16.42 0 32.84-.02 34.41-.1 4.4-.207 6.955-.55 9.78-1.28 7.79-2.01 14.24-7.29 17.75-14.53 1.765-3.64 2.66-7.18 3.065-12.317.088-1.12.125-18.977.125-36.81 0-17.836-.04-35.66-.128-36.78-.41-5.22-1.305-8.73-3.127-12.44-1.495-3.037-3.155-5.305-5.565-7.624C116.9 4 111.64 1.5 105.372.596 102.335.157 101.73.027 86.19 0H65.03z"
                transform="translate(1.004 1)"
              />
              <path
                fill="#fff"
                d="M66.004 18c-13.036 0-14.672.057-19.792.29-5.11.234-8.598 1.043-11.65 2.23-3.157 1.226-5.835 2.866-8.503 5.535-2.67 2.668-4.31 5.346-5.54 8.502-1.19 3.053-2 6.542-2.23 11.65C18.06 51.327 18 52.964 18 66s.058 14.667.29 19.787c.235 5.11 1.044 8.598 2.23 11.65 1.227 3.157 2.867 5.835 5.536 8.503 2.667 2.67 5.345 4.314 8.5 5.54 3.054 1.187 6.543 1.996 11.652 2.23 5.12.233 6.755.29 19.79.29 13.037 0 14.668-.057 19.788-.29 5.11-.234 8.602-1.043 11.656-2.23 3.156-1.226 5.83-2.87 8.497-5.54 2.67-2.668 4.31-5.346 5.54-8.502 1.18-3.053 1.99-6.542 2.23-11.65.23-5.12.29-6.752.29-19.788 0-13.036-.06-14.672-.29-19.792-.24-5.11-1.05-8.598-2.23-11.65-1.23-3.157-2.87-5.835-5.54-8.503-2.67-2.67-5.34-4.31-8.5-5.535-3.06-1.187-6.55-1.996-11.66-2.23-5.12-.233-6.75-.29-19.79-.29zm-4.306 8.65c1.278-.002 2.704 0 4.306 0 12.816 0 14.335.046 19.396.276 4.68.214 7.22.996 8.912 1.653 2.24.87 3.837 1.91 5.516 3.59 1.68 1.68 2.72 3.28 3.592 5.52.657 1.69 1.44 4.23 1.653 8.91.23 5.06.28 6.58.28 19.39s-.05 14.33-.28 19.39c-.214 4.68-.996 7.22-1.653 8.91-.87 2.24-1.912 3.835-3.592 5.514-1.68 1.68-3.275 2.72-5.516 3.59-1.69.66-4.232 1.44-8.912 1.654-5.06.23-6.58.28-19.396.28-12.817 0-14.336-.05-19.396-.28-4.68-.216-7.22-.998-8.913-1.655-2.24-.87-3.84-1.91-5.52-3.59-1.68-1.68-2.72-3.276-3.592-5.517-.657-1.69-1.44-4.23-1.653-8.91-.23-5.06-.276-6.58-.276-19.398s.046-14.33.276-19.39c.214-4.68.996-7.22 1.653-8.912.87-2.24 1.912-3.84 3.592-5.52 1.68-1.68 3.28-2.72 5.52-3.592 1.692-.66 4.233-1.44 8.913-1.655 4.428-.2 6.144-.26 15.09-.27zm29.928 7.97c-3.18 0-5.76 2.577-5.76 5.758 0 3.18 2.58 5.76 5.76 5.76 3.18 0 5.76-2.58 5.76-5.76 0-3.18-2.58-5.76-5.76-5.76zm-25.622 6.73c-13.613 0-24.65 11.037-24.65 24.65 0 13.613 11.037 24.645 24.65 24.645C79.617 90.645 90.65 79.613 90.65 66S79.616 41.35 66.003 41.35zm0 8.65c8.836 0 16 7.163 16 16 0 8.836-7.164 16-16 16-8.837 0-16-7.164-16-16 0-8.837 7.163-16 16-16z"
              />
            </svg>

            {/* Handle details */}
            <div className="flex flex-col text-left z-10 pr-1 sm:pr-2 min-w-0">
              <span className="text-[9px] xs:text-[10px] font-mono tracking-widest text-[#FF4D6A] uppercase font-bold">
                INSTAGRAM
              </span>
              <span className="text-sm xs:text-base sm:text-2xl md:text-3xl font-extrabold text-white tracking-wide drop-shadow-[0_2px_8px_rgba(235,0,40,0.7)] truncate">
                @{igHandle}
              </span>
            </div>
          </div>
        )}

        {/* Decorative bottom red/white divider with stars */}
        <div
          className={`flex items-center gap-2 sm:gap-3 mt-4 xs:mt-5 sm:mt-7 transition-all duration-700 delay-500 ${
            showDetails ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-10 xs:w-16 sm:w-24 h-px bg-gradient-to-r from-transparent to-[#EB0028]" />
          <span className="text-[#EB0028] text-xs sm:text-sm">★</span>
          <span className="text-white text-sm sm:text-lg">★</span>
          <span className="text-[#EB0028] text-xs sm:text-sm">★</span>
          <div className="w-10 xs:w-16 sm:w-24 h-px bg-gradient-to-l from-transparent to-[#EB0028]" />
        </div>

        {/* Folded to Flight tagline */}
        <p
          className={`mt-2 sm:mt-4 text-[10px] xs:text-xs sm:text-sm font-mono tracking-[0.2em] sm:tracking-[0.25em] text-neutral-400 uppercase transition-all duration-700 delay-700 ${
            showDetails ? 'opacity-100' : 'opacity-0'
          }`}
        >
          FOLDED TO FLIGHT • TEDxTCET 2026
        </p>
      </div>
    </div>
  );
};
