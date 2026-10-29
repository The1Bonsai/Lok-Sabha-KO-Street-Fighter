/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { GameMode } from '../types/game';
import { sound } from '../audio/soundEngine';
import { Swords, Users, Sparkles, BookOpen, Volume2, VolumeX, Shield, Play } from 'lucide-react';

interface TitleScreenProps {
  onSelectMode: (mode: GameMode) => void;
  onOpenGuide: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onSelectMode,
  onOpenGuide,
  isMuted,
  onToggleMute,
}) => {
  // Listen for Enter or Space to start default 3v3 team mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        sound.playSuperImpact();
        onSelectMode('3v3_TEAM');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectMode]);

  return (
    <div className="relative w-full h-screen bg-[#0b0f19] text-white flex flex-col justify-between p-6 overflow-hidden select-none crt-overlay">
      {/* BACKGROUND DECORATIVE RETRO GRID & RAYS */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/30 via-slate-900 to-transparent" />
        <div className="w-full h-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px]" />
      </div>

      {/* TOP STATUS BAR */}
      <div className="relative z-10 flex items-center justify-between max-w-5xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-ping" />
          <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase">
            NEO·GEO 90s ARCADE SYSTEM · 60FPS VER. 2.0
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playHit(false);
              onOpenGuide();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-400" />
            MOVE LIST & RULES
          </button>
          <button
            onClick={onToggleMute}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            <span>{isMuted ? 'UNMUTE' : 'DHOLAK AUDIO'}</span>
          </button>
        </div>
      </div>

      {/* HERO CENTERPIECE: BESPOKE INLINE SVG TITLE LOCKUP */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center my-4">
        {/* Satirical Ribbon Kicker */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-gradient-to-r from-orange-600/30 via-amber-500/20 to-emerald-600/30 border border-amber-500/40 text-amber-300 font-mono text-xs uppercase tracking-widest mb-4">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          THE ULTIMATE SATIRICAL INDIAN ELECTION CLASH
        </div>

        {/* Bespoke Retro Arcade SVG Lockup */}
        <div className="w-full max-w-2xl px-4">
          <svg viewBox="0 0 800 170" className="w-full h-auto drop-shadow-[0_10px_25px_rgba(245,158,11,0.3)]">
            <defs>
              <linearGradient id="saffronGold" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#fffbeb" />
                <stop offset="25%" stopColor="#fef08a" />
                <stop offset="55%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
              </linearGradient>
              <linearGradient id="flameRed" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="35%" stopColor="#f87171" />
                <stop offset="70%" stopColor="#dc2626" />
                <stop offset="100%" stopColor="#7f1d1d" />
              </linearGradient>
            </defs>

            {/* Retro 3D Shadow extrusion */}
            <text
              x="400"
              y="74"
              textAnchor="middle"
              className="font-display font-black tracking-wider"
              fontSize="82"
              fill="#020617"
              stroke="#020617"
              strokeWidth="10"
            >
              LOK SABHA KO
            </text>

            {/* Top Title Text */}
            <text
              x="400"
              y="70"
              textAnchor="middle"
              className="font-display font-black tracking-wider"
              fontSize="82"
              fill="url(#saffronGold)"
              stroke="#451a03"
              strokeWidth="3"
            >
              LOK SABHA KO
            </text>

            {/* Subtitle Street Yoddha */}
            <text
              x="400"
              y="144"
              textAnchor="middle"
              className="font-display font-black tracking-widest"
              fontSize="52"
              fill="url(#flameRed)"
              stroke="#450a0a"
              strokeWidth="2.5"
            >
              STREET YODDHA
            </text>
          </svg>
        </div>

        {/* Character Archetype Emblems */}
        <div className="flex items-center gap-5 mt-4 text-3xl filter drop-shadow">
          <span title="Netaji Vikas">🪷</span>
          <span title="Yuva Rahul">✋</span>
          <span title="Muffler Babu">🧣</span>
          <span title="Bahubali Bhaiya">🪓</span>
          <span title="Didi Tigress">🌸</span>
          <span title="Anchor Prime">🎙️</span>
        </div>

        {/* Character Archetype Emblems (8 Characters) */}
        <div className="flex items-center gap-4 mt-4 text-3xl filter drop-shadow">
          <span title="Netaji Vikas">🪷</span>
          <span title="Yuva Rahul">✋</span>
          <span title="Muffler Babu">🧣</span>
          <span title="Bahubali Bhaiya">🪓</span>
          <span title="Didi Tigress">🌸</span>
          <span title="Anchor Prime">🎙️</span>
          <span title="Bulldozer Baba">🚜</span>
          <span title="Inspector Raid Raja">🕵️</span>
        </div>

        {/* GAME MODE SELECTION CARDS (GRID OF MODES) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 max-w-5xl w-full mt-6">
          {/* Story Campaign (Conquer India to Face Boss Corruption) */}
          <button
            onClick={() => {
              sound.playSuperImpact();
              onSelectMode('STORY_CAMPAIGN');
            }}
            className="group relative p-3.5 rounded-xl bg-gradient-to-b from-red-950/60 via-slate-900 to-slate-900 border-2 border-red-500/90 hover:border-red-400 text-left transition-all hover:-translate-y-1 shadow-lg active:scale-95 col-span-2 md:col-span-1"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono font-bold text-red-400 uppercase tracking-wider flex items-center gap-1">
                <Shield className="w-3 h-3 text-red-400" />
                STORY MODE
              </span>
              <span className="px-1.5 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono font-black animate-pulse">
                BOSS FIGHT
              </span>
            </div>
            <div className="text-base font-black font-display uppercase tracking-wide text-white group-hover:text-red-300">
              Road To Corruption
            </div>
            <p className="text-[11px] text-slate-300 font-body mt-0.5 leading-tight">
              Conquer India's 4 state zones & slay Boss Bhrashtachar!
            </p>
          </button>

          {/* 3v3 Online Random Matchmaking */}
          <button
            onClick={() => {
              sound.playSuperFlash();
              onSelectMode('3v3_ONLINE_RANDOM');
            }}
            className="group relative p-3.5 rounded-xl bg-gradient-to-b from-sky-950/60 via-slate-900 to-slate-900 border-2 border-sky-500/90 hover:border-sky-400 text-left transition-all hover:-translate-y-1 shadow-lg active:scale-95"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-sky-400" />
                RANDOM MATCH
              </span>
              <span className="px-1.5 py-0.5 rounded bg-sky-500 text-slate-950 text-[9px] font-mono font-black">
                INSTANT
              </span>
            </div>
            <div className="text-base font-black font-display uppercase tracking-wide text-white group-hover:text-sky-300">
              3v3 Online Random
            </div>
            <p className="text-[11px] text-slate-300 font-body mt-0.5 leading-tight">
              Match 3v3 against live rivals with full roster battles.
            </p>
          </button>

          {/* 3v3 Team Battle (Primary KOF Mode) */}
          <button
            onClick={() => {
              sound.playSuperImpact();
              onSelectMode('3v3_TEAM');
            }}
            className="group relative p-3.5 rounded-xl bg-gradient-to-b from-amber-950/40 to-slate-900 border-2 border-amber-500/80 hover:border-amber-400 text-left transition-all hover:-translate-y-1 shadow-lg active:scale-95"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" />
                3v3 KOF
              </span>
              <span className="px-1 py-0.2 rounded bg-amber-500 text-slate-950 text-[9px] font-mono font-black">
                TEAM
              </span>
            </div>
            <div className="text-base font-black font-display uppercase tracking-wide text-white group-hover:text-amber-300">
              Team Battle
            </div>
            <p className="text-[11px] text-slate-300 font-body mt-0.5 leading-tight">
              Draft 3 leaders in full elimination order.
            </p>
          </button>

          {/* 1v1 Classic Arcade */}
          <button
            onClick={() => {
              sound.playHit(false);
              onSelectMode('1v1_ARCADE');
            }}
            className="group p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 hover:border-slate-500 text-left transition-all hover:-translate-y-1 active:scale-95"
          >
            <div className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <Swords className="w-3 h-3 text-slate-400" />
              1v1 ARCADE
            </div>
            <div className="text-base font-black font-display uppercase tracking-wide text-white group-hover:text-amber-300">
              Arcade Duel
            </div>
            <p className="text-[11px] text-slate-400 font-body mt-0.5 leading-tight">
              Best-of-3 duel against political AI bosses.
            </p>
          </button>

          {/* Local 2-Player (Same Keyboard / Screen) */}
          <button
            onClick={() => {
              sound.playSuperImpact();
              onSelectMode('LOCAL_2P');
            }}
            className="group p-3.5 rounded-xl bg-slate-900/80 border-2 border-purple-500/80 hover:border-purple-400 text-left transition-all hover:-translate-y-1 active:scale-95"
          >
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1">
                <Users className="w-3 h-3" />
                SAME SCREEN
              </span>
              <span className="px-1 py-0.2 rounded bg-purple-500 text-white text-[9px] font-mono font-black">
                LOCAL 2P
              </span>
            </div>
            <div className="text-base font-black font-display uppercase tracking-wide text-white group-hover:text-purple-300">
              Local 2-Player
            </div>
            <p className="text-[11px] text-slate-400 font-body mt-0.5 leading-tight">
              P1 (WASD) vs P2 (Arrows + Num/B/N/G).
            </p>
          </button>
        </div>
      </div>

      {/* BOTTOM SINGLE FLAT CONTROL HINT LINE */}
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full pt-3 border-t border-slate-800">
        <p className="text-xs font-mono text-slate-400 tracking-wider">
          <span className="text-amber-400 font-bold">P1:</span> WASD Move · J/U Punch · K/I Kick · Space Roll · Q Super |{' '}
          <span className="text-purple-400 font-bold">P2:</span> Arrows Move · B/G Punch · N/H Kick · M Roll · Y Super |{' '}
          <span className="text-sky-400 font-bold">Touch:</span> Virtual Pad
        </p>
      </div>
    </div>
  );
};
