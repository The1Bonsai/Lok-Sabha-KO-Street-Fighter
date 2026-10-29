/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { MatchResult, MatchSettings } from '../types/game';
import { FightingEngine } from '../game/engine';
import { BattleHUD } from './BattleHUD';
import { VirtualTouchPad } from './VirtualTouchPad';
import { FIGHTERS } from '../game/fightersData';
import { sound } from '../audio/soundEngine';
import { Smartphone, Monitor } from 'lucide-react';

interface BattleArenaProps {
  settings: MatchSettings;
  onMatchEnd: (result: MatchResult) => void;
  onQuitToTitle: () => void;
}

export const BattleArena: React.FC<BattleArenaProps> = ({ settings, onMatchEnd, onQuitToTitle }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<FightingEngine | null>(null);

  // React state mirroring engine state for HUD
  const [, setTick] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showTouchControls, setShowTouchControls] = useState(true);

  // Auto-detect mobile devices for initial touch controls setting
  useEffect(() => {
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setShowTouchControls(isTouchDevice || window.innerWidth <= 768);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to internal resolution
    canvas.width = 1100;
    canvas.height = 500;

    const engine = new FightingEngine(canvas, settings);
    engineRef.current = engine;

    engine.onStateUpdate = () => {
      // Trigger subtle React re-render for HUD elements
      setTick(t => t + 1);
    };

    engine.onMatchEnd = (result) => {
      onMatchEnd(result);
    };

    engine.start();

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [settings, onMatchEnd]);

  // Handle Pause
  const handleTogglePause = useCallback(() => {
    if (!engineRef.current) return;
    setIsPaused(prev => !prev);
  }, []);

  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  const handleTouchInput = useCallback((key: string, isPressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.setTouchInput(key, isPressed);
    }
  }, []);

  const p1TeamDefs = settings.p1Team.map(id => FIGHTERS.find(f => f.id === id) || FIGHTERS[0]);
  const p2TeamDefs = settings.p2Team.map(id => FIGHTERS.find(f => f.id === id) || FIGHTERS[1]);

  return (
    <div className="relative w-full h-screen bg-[#0b0f19] flex items-center justify-center overflow-hidden select-none">
      {/* 16:9 / Letterboxed Virtual Canvas Frame */}
      <div className="relative w-full max-w-[1200px] aspect-[11/5] max-h-screen flex items-center justify-center bg-black shadow-2xl crt-overlay">
        {/* Isolated Canvas Container */}
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain pixelated"
        />

        {/* BATTLE HUD OVERLAY */}
        {engineRef.current && (
          <BattleHUD
            p1={engineRef.current.p1Fighter}
            p2={engineRef.current.p2Fighter}
            p1Team={p1TeamDefs}
            p2Team={p2TeamDefs}
            p1TeamIndex={engineRef.current.p1TeamIndex}
            p2TeamIndex={engineRef.current.p2TeamIndex}
            roundTimer={engineRef.current.roundTimer}
            roundNumber={engineRef.current.roundNumber}
            p1Wins={engineRef.current.p1Wins}
            p2Wins={engineRef.current.p2Wins}
            isMuted={isMuted}
            onToggleMute={handleToggleMute}
            onPauseToggle={handleTogglePause}
            isPaused={isPaused}
          />
        )}

        {/* MOBILE VIRTUAL GAMEPAD OVERLAY */}
        {showTouchControls && engineRef.current && (
          <VirtualTouchPad
            onInput={handleTouchInput}
            superMeter={engineRef.current.p1Fighter.superMeter}
          />
        )}
      </div>

      {/* FLOAT TOGGLE FOR TOUCH CONTROLS ON DESKTOP/TABLET */}
      <div className="absolute top-3 right-4 z-40 hidden sm:flex items-center gap-2">
        <button
          onClick={() => setShowTouchControls(prev => !prev)}
          className="px-2.5 py-1 rounded bg-slate-900/90 border border-slate-700 text-[11px] font-mono text-slate-300 hover:text-white flex items-center gap-1.5 shadow-md backdrop-blur-xs"
        >
          {showTouchControls ? <Monitor className="w-3.5 h-3.5 text-amber-400" /> : <Smartphone className="w-3.5 h-3.5 text-sky-400" />}
          <span>{showTouchControls ? 'Hide Touch Pad' : 'Show Touch Pad'}</span>
        </button>
      </div>

      {/* PAUSE MODAL */}
      {isPaused && (
        <div className="absolute inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 text-center shadow-2xl">
            <h3 className="text-3xl font-black font-display uppercase tracking-wider text-amber-400 mb-2">
              GAME PAUSED
            </h3>
            <p className="text-xs text-slate-400 font-body mb-5">
              The debate is temporarily adjourned!
            </p>

            <div className="space-y-3">
              <button
                onClick={handleTogglePause}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-lg uppercase transition-colors"
              >
                RESUME COMBAT
              </button>
              <button
                onClick={handleToggleMute}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-mono text-xs uppercase transition-colors"
              >
                {isMuted ? 'UNMUTE AUDIO' : 'MUTE AUDIO'}
              </button>
              <button
                onClick={onQuitToTitle}
                className="w-full py-2 rounded-xl bg-red-950/60 hover:bg-red-900/80 border border-red-800 text-red-300 font-mono text-xs uppercase transition-colors"
              >
                ABANDON TO TITLE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
