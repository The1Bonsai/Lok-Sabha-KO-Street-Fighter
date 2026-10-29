/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ActiveFighter, FighterDef } from '../types/game';
import { Volume2, VolumeX, Pause, Play, Sparkles } from 'lucide-react';

interface BattleHUDProps {
  p1: ActiveFighter;
  p2: ActiveFighter;
  p1Team: FighterDef[];
  p2Team: FighterDef[];
  p1TeamIndex: number;
  p2TeamIndex: number;
  roundTimer: number;
  roundNumber: number;
  p1Wins: number;
  p2Wins: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onPauseToggle: () => void;
  isPaused: boolean;
}

export const BattleHUD: React.FC<BattleHUDProps> = ({
  p1,
  p2,
  p1Team,
  p2Team,
  p1TeamIndex,
  p2TeamIndex,
  roundTimer,
  roundNumber,
  p1Wins,
  p2Wins,
  isMuted,
  onToggleMute,
  onPauseToggle,
  isPaused,
}) => {
  // Combo title generator
  const getComboTitle = (count: number) => {
    if (count >= 10) return '🔥 LOK SABHA TSUNAMI! 🔥';
    if (count >= 7) return '⚡ 56-INCH DESTRUCTION! ⚡';
    if (count >= 4) return '💥 MASALA COMBO! 💥';
    if (count >= 2) return 'RALLY RUSH!';
    return '';
  };

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 select-none">
      {/* --- TOP HUD BAR (< 12% viewport height) --- */}
      <div className="w-full flex items-start justify-between gap-3 max-w-5xl mx-auto">
        {/* PLAYER 1 STATUS */}
        <div className="flex-1 flex flex-col items-start">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl filter drop-shadow">{p1.def.avatarIcon}</span>
            <div className="flex flex-col">
              <span className="text-sm font-black tracking-wider uppercase text-amber-400 font-display leading-none">
                {p1.def.name}
              </span>
              <span className="text-[10px] text-slate-300 font-body opacity-80 leading-tight">
                {p1.def.faction}
              </span>
            </div>
            {/* Round Wins */}
            <div className="flex gap-1 ml-2">
              <div className={`w-2.5 h-2.5 rounded-full border border-amber-400 ${p1Wins >= 1 ? 'bg-amber-400' : 'bg-transparent'}`} />
              <div className={`w-2.5 h-2.5 rounded-full border border-amber-400 ${p1Wins >= 2 ? 'bg-amber-400' : 'bg-transparent'}`} />
            </div>
          </div>

          {/* P1 Health Bar */}
          <div className="w-full h-5 bg-slate-950 border-2 border-slate-700 rounded-sm relative overflow-hidden shadow-inner">
            {/* Red Delayed Chip Damage */}
            <div
              className="absolute top-0 bottom-0 left-0 bg-red-600 transition-all duration-300"
              style={{ width: `${Math.max(0, (p1.redHealth / (p1.maxHealth || 100)) * 100)}%` }}
            />
            {/* Active Green/Gold Health */}
            <div
              className={`absolute top-0 bottom-0 left-0 transition-all duration-75 ${
                (p1.health / (p1.maxHealth || 100)) < 0.25 ? 'bg-red-500 animate-pulse' : (p1.health / (p1.maxHealth || 100)) < 0.5 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.max(0, (p1.health / (p1.maxHealth || 100)) * 100)}%` }}
            />
            <span className="absolute right-1.5 top-0.5 text-[10px] font-mono tabular-nums text-white font-bold drop-shadow">
              {Math.ceil(p1.health)} HP
            </span>
          </div>

          {/* 3v3 Reserve Teammates */}
          {p1Team.length > 1 && (
            <div className="flex items-center gap-1.5 mt-1">
              <span className="text-[9px] text-slate-400 font-mono uppercase">Reserves:</span>
              {p1Team.map((member, idx) => (
                <div
                  key={member.id}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    idx < p1TeamIndex
                      ? 'bg-red-950/70 text-red-500 line-through border border-red-900'
                      : idx === p1TeamIndex
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {member.name.split(' ')[0]}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CENTER TIMER & ROUND INFO */}
        <div className="flex flex-col items-center px-2 shrink-0">
          <div className="text-[10px] font-arcade tracking-wider text-amber-400 mb-0.5">
            ROUND {roundNumber}
          </div>
          <div className="w-16 h-12 bg-slate-950 border-2 border-amber-500/60 rounded flex items-center justify-center shadow-lg">
            <span className="text-3xl font-arcade tabular-nums font-black text-amber-300 tracking-tight">
              {roundTimer.toString().padStart(2, '0')}
            </span>
          </div>
          {/* Pause & Mute controls (Interactive with pointer-events-auto) */}
          <div className="flex items-center gap-2 mt-1.5 pointer-events-auto">
            <button
              onClick={onToggleMute}
              className="p-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-amber-400" />}
            </button>
            <button
              onClick={onPauseToggle}
              className="p-1 rounded bg-slate-900/80 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title={isPaused ? 'Resume Game' : 'Pause Game'}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400" /> : <Pause className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* PLAYER 2 STATUS */}
        <div className="flex-1 flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1 flex-row-reverse">
            <span className="text-xl filter drop-shadow">{p2.def.avatarIcon}</span>
            <div className="flex flex-col items-end">
              <span className={`text-sm font-black tracking-wider uppercase font-display leading-none ${p2.def.id === 'boss_corruption' ? 'text-purple-400 animate-pulse' : 'text-red-400'}`}>
                {p2.def.id === 'boss_corruption' ? '⚔️ TITAN BOSS BHRASHTACHAR' : p2.def.name}
              </span>
              <span className="text-[10px] text-slate-300 font-body opacity-80 leading-tight">
                {p2.def.id === 'boss_corruption' ? 'COLOSSAL SOLO RAID BOSS' : p2.def.faction}
              </span>
            </div>
            {/* Round Wins */}
            <div className="flex gap-1 mr-2">
              <div className={`w-2.5 h-2.5 rounded-full border border-red-400 ${p2Wins >= 1 ? 'bg-red-400' : 'bg-transparent'}`} />
              <div className={`w-2.5 h-2.5 rounded-full border border-red-400 ${p2Wins >= 2 ? 'bg-red-400' : 'bg-transparent'}`} />
            </div>
          </div>

          {/* P2 Health Bar */}
          <div className={`w-full h-5 bg-slate-950 border-2 rounded-sm relative overflow-hidden shadow-inner ${p2.def.id === 'boss_corruption' ? 'border-purple-500 shadow-purple-900/50' : 'border-slate-700'}`}>
            {/* Red Delayed Chip Damage */}
            <div
              className="absolute top-0 bottom-0 right-0 bg-red-600 transition-all duration-300"
              style={{ width: `${Math.max(0, (p2.redHealth / (p2.maxHealth || 100)) * 100)}%` }}
            />
            {/* Active Health */}
            <div
              className={`absolute top-0 bottom-0 right-0 transition-all duration-75 ${
                p2.def.id === 'boss_corruption'
                  ? 'bg-gradient-to-l from-purple-500 via-fuchsia-400 to-indigo-600'
                  : (p2.health / (p2.maxHealth || 100)) < 0.25
                  ? 'bg-red-500 animate-pulse'
                  : (p2.health / (p2.maxHealth || 100)) < 0.5
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.max(0, (p2.health / (p2.maxHealth || 100)) * 100)}%` }}
            />
            <span className="absolute left-1.5 top-0.5 text-[10px] font-mono tabular-nums text-white font-bold drop-shadow">
              {Math.ceil(p2.health)} / {p2.maxHealth} HP
            </span>
          </div>

          {/* 3v3 Reserve Teammates (Only shown if opponent has more than 1 fighter) */}
          {p2Team.length > 1 && (
            <div className="flex items-center gap-1.5 mt-1 flex-row-reverse">
              <span className="text-[9px] text-slate-400 font-mono uppercase">Reserves:</span>
              {p2Team.map((member, idx) => (
                <div
                  key={member.id}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                    idx < p2TeamIndex
                      ? 'bg-red-950/70 text-red-500 line-through border border-red-900'
                      : idx === p2TeamIndex
                      ? 'bg-red-500/20 text-red-300 border border-red-500/50'
                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                  }`}
                >
                  {member.name.split(' ')[0]}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- COMBO DISPLAY NOTIFICATION --- */}
      {p1.comboCount >= 2 && (
        <div className="absolute left-8 top-28 flex flex-col animate-bounce">
          <span className="text-4xl font-arcade text-amber-300 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            {p1.comboCount} HITS!
          </span>
          <span className="text-sm font-black text-rose-400 tracking-wider font-display">
            {getComboTitle(p1.comboCount)}
          </span>
        </div>
      )}

      {p2.comboCount >= 2 && (
        <div className="absolute right-8 top-28 flex flex-col items-end animate-bounce">
          <span className="text-4xl font-arcade text-red-400 drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            {p2.comboCount} HITS!
          </span>
          <span className="text-sm font-black text-amber-300 tracking-wider font-display">
            {getComboTitle(p2.comboCount)}
          </span>
        </div>
      )}

      {/* --- BOTTOM SUPER METER GAUGES --- */}
      <div className="w-full flex items-end justify-between gap-4 max-w-5xl mx-auto mb-1">
        {/* P1 Super Gauge */}
        <div className="w-64 flex flex-col">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-0.5">
            <span className="text-amber-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-300" />
              SUPER GAUGE
            </span>
            <span className={`${p1.superMeter >= 100 ? 'text-amber-300 animate-pulse font-bold' : 'text-slate-400'}`}>
              {p1.superMeter >= 100 ? '★ MAX READY ★' : `${Math.floor(p1.superMeter)}/100`}
            </span>
          </div>
          <div className="h-3.5 bg-slate-950 border border-slate-700 rounded-sm relative overflow-hidden">
            <div
              className={`h-full transition-all duration-100 ${
                p1.superMeter >= 100
                  ? 'bg-gradient-to-r from-amber-500 via-yellow-300 to-orange-500 animate-pulse'
                  : 'bg-gradient-to-r from-blue-600 to-cyan-400'
              }`}
              style={{ width: `${Math.min(100, p1.superMeter)}%` }}
            />
          </div>
        </div>

        {/* P2 Super Gauge */}
        <div className="w-64 flex flex-col items-end">
          <div className="flex justify-between items-center text-[10px] font-mono font-bold mb-0.5 w-full flex-row-reverse">
            <span className="text-red-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-red-300" />
              SUPER GAUGE
            </span>
            <span className={`${p2.superMeter >= 100 ? 'text-red-300 animate-pulse font-bold' : 'text-slate-400'}`}>
              {p2.superMeter >= 100 ? '★ MAX READY ★' : `${Math.floor(p2.superMeter)}/100`}
            </span>
          </div>
          <div className="h-3.5 bg-slate-950 border border-slate-700 rounded-sm relative overflow-hidden w-full">
            <div
              className={`h-full transition-all duration-100 float-right ${
                p2.superMeter >= 100
                  ? 'bg-gradient-to-l from-red-500 via-rose-300 to-orange-500 animate-pulse'
                  : 'bg-gradient-to-l from-purple-600 to-pink-400'
              }`}
              style={{ width: `${Math.min(100, p2.superMeter)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
