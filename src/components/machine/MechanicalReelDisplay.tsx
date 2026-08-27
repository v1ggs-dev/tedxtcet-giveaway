'use client';

import React, { useEffect, useState, useRef } from 'react';
import { CharacterReelSlot } from './CharacterReelSlot';
import { DrawState } from '@/lib/types';
import { sound } from '@/lib/audio';

interface MechanicalReelDisplayProps {
  winnerName: string;
  state: DrawState;
  onAllSlotsLocked: () => void;
}

interface TeaserStage {
  top: string;
  bottom: string;
  durationMs: number;
}

const TEASER_STAGES: TeaserStage[] = [
  { top: 'CALCULATING', bottom: '425 ENTRIES', durationMs: 3200 },
  { top: 'IS IT YOU?', bottom: 'MAYBE ★', durationMs: 3400 },
  { top: 'HOLD ON...', bottom: 'ALMOST THERE', durationMs: 3400 },
  { top: 'LUCKY ONE', bottom: 'SELECTED ★', durationMs: 3500 },
];

export const MechanicalReelDisplay: React.FC<MechanicalReelDisplayProps> = ({
  winnerName,
  state,
  onAllSlotsLocked,
}) => {
  // Winner name formatted and split
  const rawName = (winnerName || 'TEDxTCET 2026').trim().toUpperCase();
  const nameParts = rawName.split(/\s+/);

  let realFirstName = '';
  let realLastName = '';

  if (nameParts.length === 1) {
    realFirstName = nameParts[0];
  } else if (nameParts.length === 2) {
    realFirstName = nameParts[0];
    realLastName = nameParts[1];
  } else {
    realFirstName = nameParts.slice(0, Math.ceil(nameParts.length / 2)).join(' ');
    realLastName = nameParts.slice(Math.ceil(nameParts.length / 2)).join(' ');
  }

  // Active display text (can be teasers or the real winner)
  const [displayText, setDisplayText] = useState<{ top: string; bottom: string }>({
    top: 'TEDxTCET',
    bottom: '2026',
  });

  const [lockedTopCount, setLockedTopCount] = useState<number>(99);
  const [lockedBottomCount, setLockedBottomCount] = useState<number>(99);
  const [isClimaxFlash, setIsClimaxFlash] = useState<boolean>(false);
  const [isHeartbeating, setIsHeartbeating] = useState<boolean>(false);

  const isSpinning = state === 'SPINNING' || state === 'REVEALING';

  const onAllSlotsLockedRef = useRef(onAllSlotsLocked);
  useEffect(() => {
    onAllSlotsLockedRef.current = onAllSlotsLocked;
  });

  // =========================================================================
  // 26-SECOND THEATRICAL LIVESTREAM REVEAL CONTROLLER
  // =========================================================================
  useEffect(() => {
    if (state === 'SPINNING' || state === 'REVEALING') {
      setLockedTopCount(0);
      setLockedBottomCount(0);
      setIsClimaxFlash(false);
      setIsHeartbeating(false);

      const timeouts: ReturnType<typeof setTimeout>[] = [];

      // -----------------------------------------------------------------------
      // STAGE 1–4: FUN TEASER MESSAGES (0.0s – 13.5s)
      // -----------------------------------------------------------------------
      let accumulatedTime = 0;

      TEASER_STAGES.forEach((stage, idx) => {
        const t = setTimeout(() => {
          setDisplayText({ top: stage.top, bottom: stage.bottom });
          setLockedTopCount(idx % 2 === 0 ? stage.top.length : 0);
          setLockedBottomCount(idx % 2 === 0 ? stage.bottom.length : 0);

          if (idx > 0) {
            sound.playRatchetClick(1.0);
          }
          if (idx === 2 || idx === 3) {
            sound.playHeartbeat(0.7);
          }
        }, accumulatedTime);

        timeouts.push(t);
        accumulatedTime += stage.durationMs;
      });

      // -----------------------------------------------------------------------
      // STAGE 5: SWITCH TO REAL WINNER & LOCK FIRST NAME (13.5s – 18.5s)
      // -----------------------------------------------------------------------
      const realRevealStartTime = accumulatedTime; // ~13.5s

      const tRealStart = setTimeout(() => {
        setDisplayText({ top: realFirstName, bottom: realLastName });
        setLockedTopCount(0);
        setLockedBottomCount(0);

        const topCharsCount = realFirstName.length;
        const topStepTime = Math.max(250, Math.min(550, Math.floor(4500 / Math.max(topCharsCount, 1))));

        for (let i = 1; i <= topCharsCount; i++) {
          const tLock = setTimeout(() => {
            setLockedTopCount(i);
          }, i * topStepTime);
          timeouts.push(tLock);
        }
      }, realRevealStartTime);
      timeouts.push(tRealStart);

      // -----------------------------------------------------------------------
      // STAGE 6: THE SQUEEZE GAP / BREATHLESS HEARTBEAT (18.5s – 20.2s)
      // -----------------------------------------------------------------------
      const topLockFinishTime = realRevealStartTime + 4600; // ~18.1s
      const squeezeTime = topLockFinishTime + 500;

      const tHeartbeat1 = setTimeout(() => {
        setIsHeartbeating(true);
        sound.playHeartbeat(0.85);
        setTimeout(() => setIsHeartbeating(false), 350);
      }, squeezeTime);
      timeouts.push(tHeartbeat1);

      const tHeartbeat2 = setTimeout(() => {
        setIsHeartbeating(true);
        sound.playHeartbeat(0.95);
        setTimeout(() => setIsHeartbeating(false), 350);
      }, squeezeTime + 900);
      timeouts.push(tHeartbeat2);

      // -----------------------------------------------------------------------
      // STAGE 7: LAST NAME SLOW-MOTION DECELERATION (20.2s – 24.5s)
      // -----------------------------------------------------------------------
      const bottomStartTime = squeezeTime + 1700; // ~20.3s
      let bottomAccumDelay = bottomStartTime;
      const bottomCharsCount = realLastName.length;

      for (let j = 1; j <= bottomCharsCount; j++) {
        const isNearEnd = j >= bottomCharsCount - 2;
        const isLastChar = j === bottomCharsCount;

        const stepDelay = isLastChar ? 1000 : isNearEnd ? 800 : 520;
        bottomAccumDelay += stepDelay;

        const currentIdx = j;
        const tBottomLetter = setTimeout(() => {
          if (isNearEnd && !isLastChar) {
            setIsHeartbeating(true);
            sound.playHeartbeat(1.0);
            setTimeout(() => setIsHeartbeating(false), 350);
          }

          setLockedBottomCount(currentIdx);

          // Final character locked! (At ~24.5s)
          if (isLastChar) {
            sound.playLockSnap(0.75, true);
            sound.playClimaxFlashImpact();
            setIsClimaxFlash(true);

            // -----------------------------------------------------------------
            // STAGE 8: CLIMAX SUSPENSE FREEZE (1.5s) -> VICTORY AT EXACTLY 26.0s
            // -----------------------------------------------------------------
            setTimeout(() => {
              onAllSlotsLockedRef.current();
            }, 1500);
          }
        }, bottomAccumDelay);

        timeouts.push(tBottomLetter);
      }

      // Single Name Fallback
      if (bottomCharsCount === 0) {
        const tEndSingle = setTimeout(() => {
          sound.playLockSnap(0.75, true);
          sound.playClimaxFlashImpact();
          setIsClimaxFlash(true);
          setTimeout(() => {
            onAllSlotsLockedRef.current();
          }, 1500);
        }, topLockFinishTime + 1800);
        timeouts.push(tEndSingle);
      }

      return () => {
        timeouts.forEach(clearTimeout);
      };
    } else if (state === 'READY' || state === 'INITIALIZING' || state === 'WINNER_REVEALED' || state === 'COMPLETED_LOCKED') {
      setDisplayText({ top: realFirstName || 'TEDxTCET', bottom: realLastName || '2026' });
      setLockedTopCount(99);
      setLockedBottomCount(99);
      setIsClimaxFlash(false);
      setIsHeartbeating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, realFirstName, realLastName]);

  const topChars = displayText.top.split('');
  const bottomChars = displayText.bottom.split('');
  const totalSlots = topChars.length + bottomChars.length;

  const topRowLength = topChars.length;
  const bottomRowLength = bottomChars.length;

  return (
    <div className="w-full flex flex-col items-center justify-center relative">
      {/* 3D Curved Retro Arcade CRT Monitor Frame */}
      <div
        className={`w-full crt-outer-bezel rounded-2xl sm:rounded-[2rem] p-2 xs:p-3 sm:p-5 md:p-6 shadow-2xl relative flex flex-col transition-all duration-300 ${
          isHeartbeating ? 'scale-[1.018] shadow-[0_0_60px_rgba(235,0,40,0.6)]' : ''
        }`}
      >
        {/* Corner Metallic Mounting Screws */}
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#666] to-[#222] border border-white/20 shadow-sm z-30" />
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#666] to-[#222] border border-white/20 shadow-sm z-30" />
        <div className="absolute bottom-2 left-2 sm:bottom-3 sm:left-3 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#666] to-[#222] border border-white/20 shadow-sm z-30" />
        <div className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-gradient-to-br from-[#666] to-[#222] border border-white/20 shadow-sm z-30" />

        {/* Inner Curved Phosphor CRT Screen */}
        <div className="w-full min-h-[10.5rem] xs:min-h-[12.5rem] sm:min-h-[19rem] md:min-h-[21rem] crt-screen-curved rounded-xl sm:rounded-2xl p-2 xs:p-3 sm:p-6 md:p-8 relative overflow-hidden border-2 border-[#202330] flex flex-col items-center justify-center gap-2 xs:gap-3 sm:gap-5">
          
          {/* CRT Scanlines Filter */}
          <div className="absolute inset-0 crt-scanlines z-20 pointer-events-none opacity-45" />

          {/* CRT Curved Specular Glass Glare */}
          <div className="absolute inset-0 crt-glass-specular z-20 pointer-events-none rounded-xl sm:rounded-2xl" />

          {/* Dramatic Climax White / Red Voltage Flash Strobe */}
          {isClimaxFlash && (
            <div className="absolute inset-0 bg-white/45 z-30 pointer-events-none animate-pulse rounded-xl sm:rounded-2xl" />
          )}

          {/* Attract Mode Dynamic Sheen Sweep */}
          {!isSpinning && <div className="dynamic-glass-sheen z-20" />}

          {/* 1. TOP ROW — Always strictly on a SINGLE LINE (flex-nowrap) */}
          <div
            className={`flex flex-nowrap items-center justify-center ${
              topRowLength >= 10
                ? 'gap-0.5 xs:gap-1 sm:gap-2'
                : topRowLength >= 8
                ? 'gap-1 xs:gap-1.5 sm:gap-2'
                : 'gap-1 xs:gap-1.5 sm:gap-2.5'
            } w-full px-0.5 sm:px-2 z-10 relative`}
          >
            {topChars.map((char, localIdx) => {
              const globalIndex = localIdx;
              const isSlotLocked = localIdx < lockedTopCount;

              return (
                <CharacterReelSlot
                  key={`top-${localIdx}-${char}-${displayText.top}`}
                  globalIndex={globalIndex}
                  totalSlots={totalSlots}
                  rowLength={topRowLength}
                  targetChar={char}
                  isSpinning={isSpinning}
                  isLocked={isSlotLocked}
                />
              );
            })}
          </div>

          {/* 2. BOTTOM ROW — Always strictly on a SINGLE LINE (flex-nowrap) */}
          {bottomChars.length > 0 && (
            <div
              className={`flex flex-nowrap items-center justify-center ${
                bottomRowLength >= 10
                  ? 'gap-0.5 xs:gap-1 sm:gap-2'
                  : bottomRowLength >= 8
                  ? 'gap-1 xs:gap-1.5 sm:gap-2'
                  : 'gap-1 xs:gap-1.5 sm:gap-2.5'
              } w-full px-0.5 sm:px-2 z-10 relative`}
            >
              {bottomChars.map((char, localIdx) => {
                const globalIndex = topChars.length + localIdx;
                const isSlotLocked = localIdx < lockedBottomCount;

                return (
                  <CharacterReelSlot
                    key={`bottom-${localIdx}-${char}-${displayText.bottom}`}
                    globalIndex={globalIndex}
                    totalSlots={totalSlots}
                    rowLength={bottomRowLength}
                    targetChar={char}
                    isSpinning={isSpinning}
                    isLocked={isSlotLocked}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
