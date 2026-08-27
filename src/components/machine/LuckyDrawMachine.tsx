'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MechanicalReelDisplay } from './MechanicalReelDisplay';
import { ArcadeControlDeck } from './ArcadeControlDeck';
import { WinnerStageCard } from './WinnerStageCard';
import { RedWhiteParticlesCanvas } from './RedWhiteParticlesCanvas';
import { OperatorDrawer } from '../operator/OperatorDrawer';
import { DrawState, DrawResult } from '@/lib/types';
import { sound } from '@/lib/audio';
import { Settings, ShieldAlert, RefreshCw } from 'lucide-react';

export const LuckyDrawMachine: React.FC = () => {
  const [state, setState] = useState<DrawState>('INITIALIZING');
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [winnerResult, setWinnerResult] = useState<DrawResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isOperatorOpen, setIsOperatorOpen] = useState<boolean>(false);
  const [isJolting, setIsJolting] = useState<boolean>(false);
  const [bootStep, setBootStep] = useState<number>(0);

  const isBusy = state === 'SPINNING' || state === 'REVEALING' || state === 'SELECTING';

  // Load participant pool status
  const fetchPoolStatus = useCallback(async () => {
    try {
      setErrorMessage(null);
      const res = await fetch('/api/participants');
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to connect to participant database');

      setParticipantCount(data.totalCount || 0);

      // Fast startup
      setBootStep(1);
      setTimeout(() => setBootStep(2), 150);
      setTimeout(() => setBootStep(3), 300);
      setTimeout(() => {
        setBootStep(4);
        setState('READY');
      }, 450);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Initialization failed';
      console.error('Initialization error:', err);
      setErrorMessage(msg);
      setState('ERROR');
    }
  }, []);

  useEffect(() => {
    fetchPoolStatus();
  }, [fetchPoolStatus]);

  // Execute Lucky Draw (26-Second Theatrical Livestream Arc)
  const handleExecuteDraw = async () => {
    if (state === 'SELECTING' || state === 'SPINNING' || state === 'REVEALING' || state === 'INITIALIZING') {
      return;
    }

    try {
      setState('SELECTING');
      setErrorMessage(null);

      // Call Authoritative Backend CSPRNG Endpoint
      const res = await fetch('/api/draw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Backend failed to select and persist winner.');
      }

      const drawResult: DrawResult = data.draw;
      setWinnerResult(drawResult);

      // Tactile Mechanical Cabinet Jolt
      setIsJolting(true);
      setTimeout(() => setIsJolting(false), 450);

      // Start 26-Second Theatrical Sequence & Audio Riser
      sound.startSpinSound();
      setState('REVEALING');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Draw failed';
      console.error('Draw Execution Error:', err);
      sound.stopSpinSound();
      setErrorMessage(msg);
      setState('ERROR');
    }
  };

  const handleAllSlotsLocked = useCallback(() => {
    sound.stopSpinSound();
    setState('WINNER_REVEALED');
  }, []);

  const handleToggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    sound.setMuted(nextMuted);
  };

  return (
    <main className="min-h-screen w-full bg-[#050608] text-white flex flex-col items-center justify-center p-3 sm:p-5 md:p-7 relative overflow-hidden">
      
      {/* Floating Red & White Stage Particles */}
      <RedWhiteParticlesCanvas />

      {/* Atmospheric Stage Spotlight — Dims and focuses when draw is running */}
      <div
        className={`absolute top-0 left-1/2 -translate-x-1/2 rounded-full pointer-events-none transition-all duration-1000 ${
          isBusy
            ? 'w-[650px] h-[450px] bg-gradient-to-b from-[#EB0028]/35 via-black/80 to-transparent blur-[110px]'
            : 'w-[900px] h-[550px] bg-gradient-to-b from-[#EB0028]/15 via-black/40 to-transparent blur-[140px]'
        }`}
      />
      
      {/* Discreet Floating Operator Settings Gear */}
      <button
        onClick={() => {
          sound.playButtonClick();
          setIsOperatorOpen(true);
        }}
        title="Settings & Diagnostics"
        className="fixed top-3 right-3 z-50 p-2.5 rounded-full bg-black/50 hover:bg-black/90 border border-white/10 text-neutral-400 hover:text-white opacity-40 hover:opacity-100 transition-all duration-300 shadow-lg cursor-pointer"
      >
        <Settings className="w-4 h-4" />
      </button>

      {/* =========================================================================
          HERO 3D TEDx ARCADE CABINET
          ========================================================================= */}
      <div className="w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-auto relative z-10 py-2">
        
        {/* Error Safeguard Banner */}
        {errorMessage && (
          <div className="w-full mb-4 p-4 rounded-2xl bg-black border-2 border-[#EB0028] text-white flex items-center justify-between shadow-2xl animate-in fade-in">
            <div className="flex items-center gap-3">
              <ShieldAlert className="w-5 h-5 text-[#EB0028] shrink-0" />
              <div className="text-xs font-mono">
                <strong className="text-[#EB0028] block font-bold">SYSTEM INTERLOCK ACTIVE:</strong>
                {errorMessage}
              </div>
            </div>
            <button
              onClick={fetchPoolStatus}
              className="px-3 py-1.5 rounded-xl bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-xs font-mono text-white flex items-center gap-1 transition-all"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Reset
            </button>
          </div>
        )}

        {/* 3D Physical Cabinet Shell */}
        <div className={`w-full arcade-cabinet-body rounded-[2.5rem] p-4 sm:p-6 md:p-8 relative ${isJolting ? 'animate-cabinet-jolt' : ''}`}>
          
          {/* =========================================================================
              1. TOP RECESSED SPEAKER COWL & LOGO MARQUEE
                 Hierarchy: 1. Official TEDxTCET Logo -> 2. TICKETS GIVEAWAY
              ========================================================================= */}
          <div className="w-full bg-[#0C0D12] rounded-2xl p-3 sm:p-4 mb-4 border-2 border-[#222530] shadow-inner relative flex items-center justify-between gap-4">
            
            {/* Left Stereo Speaker Grille */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full speaker-grille-mesh border-2 border-[#2A2D3A] flex items-center justify-center shrink-0 shadow-lg">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full speaker-cone flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#050608] border border-white/10" />
              </div>
            </div>

            {/* Center: Official TEDxTCET Logo & TICKETS GIVEAWAY Title */}
            <div className="flex flex-col items-center justify-center text-center flex-1 px-2">
              {/* Official TEDxTCET White Logo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="https://cdn.v1ggs.lol/tedxtcet/logo-white.png"
                alt="TEDxTCET"
                className="h-10 sm:h-13 md:h-15 w-auto object-contain drop-shadow-[0_2px_12px_rgba(255,255,255,0.4)]"
              />

              {/* TICKETS GIVEAWAY Title */}
              <h1
                className="text-xl sm:text-2xl md:text-3xl font-black text-white uppercase tracking-[0.2em] arcade-title-shadow mt-2 leading-none"
                style={{ fontFamily: 'Impact, "Arial Black", sans-serif' }}
              >
                ★ TICKETS GIVEAWAY ★
              </h1>
            </div>

            {/* Right Stereo Speaker Grille */}
            <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full speaker-grille-mesh border-2 border-[#2A2D3A] flex items-center justify-center shrink-0 shadow-lg">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full speaker-cone flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-[#050608] border border-white/10" />
              </div>
            </div>
          </div>

          {/* =========================================================================
              2. BULBOUS CURVED CRT MONITOR (Drum Reel Chamber)
              ========================================================================= */}
          <div className="w-full my-2">
            {state === 'INITIALIZING' ? (
              <div className="w-full min-h-[16rem] sm:min-h-[19rem] md:min-h-[21rem] crt-screen-curved rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3 font-mono text-xs border-2 border-[#222530]">
                <div className="text-[#EB0028] font-black animate-pulse text-sm tracking-widest uppercase">
                  ★ SYSTEM SELF-TEST IN PROGRESS ★
                </div>
                <div className="text-neutral-300 space-y-1.5 text-xs font-bold">
                  <div>DRUM CYLINDERS ............... {bootStep >= 1 ? '✓ ONLINE' : '...'}</div>
                  <div>MECHANICAL CONTROLS ........ {bootStep >= 2 ? '✓ ARMED' : '...'}</div>
                  <div>CSPRNG RANDOM ENGINE ........ {bootStep >= 3 ? '✓ CALIBRATED' : '...'}</div>
                  <div>ATTENDEE DATABASE .......... {bootStep >= 4 ? '✓ READY' : '...'}</div>
                </div>
              </div>
            ) : (
              <MechanicalReelDisplay
                winnerName={winnerResult?.winner.name || (state === 'READY' ? 'TEDxTCET 2026' : 'SELECTING')}
                state={state}
                onAllSlotsLocked={handleAllSlotsLocked}
              />
            )}
          </div>

          {/* =========================================================================
              3. PROTRUDING 3D ARCADE CONTROL DECK (Joystick + Launch Button)
              ========================================================================= */}
          <ArcadeControlDeck state={state} onPull={handleExecuteDraw} />

        </div>

        {/* 4. THEATRICAL JACKPOT WINNER REVEAL — Fullscreen Overlay */}
        {state === 'WINNER_REVEALED' && winnerResult && (
          <WinnerStageCard draw={winnerResult} />
        )}
      </div>

      {/* Operator Drawer */}
      <OperatorDrawer
        isOpen={isOperatorOpen}
        onClose={() => setIsOperatorOpen(false)}
        participantCount={participantCount}
        onRefreshData={fetchPoolStatus}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
      />
    </main>
  );
};
