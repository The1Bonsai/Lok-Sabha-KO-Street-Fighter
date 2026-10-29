/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MatchResult } from '../types/game';
import { Trophy, RotateCcw, Home, Sparkles, Flame, Clock, Users } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface VictoryModalProps {
  result: MatchResult;
  isStoryMode?: boolean;
  storyStage?: number;
  isPvP?: boolean;
  onNextChapter?: () => void;
  onFindNextOpponent?: () => void;
  onRematch: () => void;
  onReturnTitle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  result,
  isStoryMode = false,
  storyStage = 1,
  isPvP = false,
  onNextChapter,
  onFindNextOpponent,
  onRematch,
  onReturnTitle,
}) => {
  const isP1Win = result.winner === 1;
  const leadFighter = result.winningTeam[0];
  const quote = isP1Win
    ? leadFighter.winQuotes[Math.floor(Math.random() * leadFighter.winQuotes.length)]
    : leadFighter.winQuotes[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 text-center relative overflow-hidden crt-overlay animate-in fade-in zoom-in-95 duration-200">
        {/* Decorative Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-400 text-amber-300 font-mono text-xs uppercase tracking-widest mb-3">
          <Trophy className="w-4 h-4 text-amber-400" />
          {isPvP
            ? isP1Win
              ? 'RANKED BRAWL VICTORY (+35 RP)'
              : 'PVP MATCH COMPLETE'
            : isP1Win
            ? 'VICTORY BY ELECTORAL KNOCKOUT'
            : 'OPPOSITION ROUTED'}
        </div>

        {/* Big Win Title */}
        <h2 className="text-4xl font-black font-display uppercase tracking-wider text-white mb-1">
          {isP1Win ? 'PLAYER 1 TRIUMPH!' : isPvP ? 'OPPONENT TRIUMPH!' : 'CPU BOSS TRIUMPH!'}
        </h2>
        <p className="text-xs text-slate-400 font-mono mb-4">
          Winning Coalition: {leadFighter.faction}
        </p>

        {/* PVP Mode: Option to match with next opponent */}
        {isPvP && (
          <div className="mb-4">
            <button
              onClick={() => {
                sound.playSuperImpact();
                onFindNextOpponent?.();
              }}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-display font-black text-xl tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-cyan-500/25 active:scale-95 transition-transform animate-pulse border-2 border-cyan-400"
            >
              <Users className="w-6 h-6 text-cyan-200" />
              MATCH WITH NEXT OPPONENT ➔
            </button>
            <p className="text-[11px] font-mono text-cyan-300/80 mt-1.5">
              Instant 3v3 live matchmaking & random rival queue
            </p>
          </div>
        )}

        {/* Story Mode Boss Victory or Next Chapter Banner */}
        {isStoryMode && isP1Win && (
          <div className="mb-4">
            {storyStage < 4 ? (
              <button
                onClick={() => {
                  sound.playSuperImpact();
                  onNextChapter?.();
                }}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-display font-black text-xl tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl shadow-emerald-500/20 active:scale-95 transition-transform animate-pulse"
              >
                <Sparkles className="w-6 h-6 text-slate-950" />
                NEXT CHAPTER: PROCEED TO ZONE {storyStage + 1} ➔
              </button>
            ) : (
              <div className="p-3.5 bg-gradient-to-r from-purple-950/80 via-indigo-950/90 to-purple-950/80 border-2 border-purple-400 rounded-xl shadow-lg">
                <span className="text-xl font-black font-display text-amber-300 uppercase tracking-wider block">
                  👑 DEMOCRACY RESTORED! CORRUPTION DESTROYED! 👑
                </span>
                <span className="text-xs text-purple-200 font-mono mt-0.5 block">
                  You conquered all 4 zones and defeated the Titan Boss Bhrashtachar!
                </span>
              </div>
            )}
          </div>
        )}

        {/* Lead Fighter Showcase */}
        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 mb-5 text-left">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-4xl filter drop-shadow">{leadFighter.avatarIcon}</span>
            <div>
              <div className="text-lg font-black font-display uppercase text-amber-300">
                {leadFighter.name}
              </div>
              <div className="text-xs text-slate-400 font-body">
                {leadFighter.title}
              </div>
            </div>
          </div>
          <p className="text-sm italic text-slate-200 font-body border-l-2 border-amber-400 pl-3 py-1 bg-amber-500/5 rounded-r">
            "{quote}"
          </p>
        </div>

        {/* Match Statistics */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <Clock className="w-4 h-4 text-slate-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Match Time</span>
            <span className="text-base font-black font-display text-white tabular-nums">
              {result.durationSeconds}s
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <Flame className="w-4 h-4 text-orange-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Max Combo</span>
            <span className="text-base font-black font-display text-amber-300 tabular-nums">
              {result.maxCombo} Hits
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 flex flex-col items-center">
            <Sparkles className="w-4 h-4 text-yellow-400 mb-1" />
            <span className="text-[10px] font-mono text-slate-400 uppercase">Super Finishes</span>
            <span className="text-base font-black font-display text-yellow-300 tabular-nums">
              {result.superFinishes}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playHit(false);
              onRematch();
            }}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-display font-black text-lg tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-transform"
          >
            <RotateCcw className="w-5 h-5" />
            {isStoryMode && isP1Win && storyStage === 4 ? 'REPLAY STORY' : 'REMATCH BRAWL'}
          </button>
          <button
            onClick={() => {
              sound.playBlock();
              onReturnTitle();
            }}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-display font-bold text-base uppercase flex items-center gap-1.5 transition-colors"
          >
            <Home className="w-4 h-4" />
            TITLE
          </button>
        </div>
      </div>
    </div>
  );
};
