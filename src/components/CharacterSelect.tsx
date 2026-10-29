/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, MatchSettings } from '../types/game';
import { FIGHTERS } from '../game/fightersData';
import { STAGES } from '../game/stagesData';
import { sound } from '../audio/soundEngine';
import { Swords, Users, Shield, Zap, Sparkles, MapPin, Gauge } from 'lucide-react';

interface CharacterSelectProps {
  mode: GameMode;
  onStartMatch: (settings: MatchSettings) => void;
  onBackToTitle: () => void;
}

export const CharacterSelect: React.FC<CharacterSelectProps> = ({ mode, onStartMatch, onBackToTitle }) => {
  const is3v3 = mode === '3v3_TEAM';
  const isLocal2P = mode === 'LOCAL_2P';
  const targetTeamCount = is3v3 ? 3 : 1;

  const [activePickingPlayer, setActivePickingPlayer] = useState<1 | 2>(1);
  const [p1Team, setP1Team] = useState<string[]>(is3v3 ? ['netaji_vikas', 'yuva_rahul', 'muffler_babu'] : ['netaji_vikas']);
  const [p2Team, setP2Team] = useState<string[]>(is3v3 ? ['bulldozer_baba', 'raid_raja', 'arnab_prime'] : ['bulldozer_baba']);
  const [selectedStageId, setSelectedStageId] = useState<string>('jantar_mantar');
  const [aiDifficulty, setAiDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [hoveredFighterId, setHoveredFighterId] = useState<string>(p1Team[0]);

  const activeFighter = FIGHTERS.find(f => f.id === hoveredFighterId) || FIGHTERS[0];
  const selectedStage = STAGES.find(s => s.id === selectedStageId) || STAGES[0];

  const handleSelectFighter = (id: string) => {
    sound.playHit(false);

    if (isLocal2P && activePickingPlayer === 2) {
      setP2Team([id]);
      return;
    }

    if (is3v3) {
      if (p1Team.includes(id)) {
        if (p1Team.length > 1) {
          setP1Team(p1Team.filter(fid => fid !== id));
        }
      } else {
        if (p1Team.length < 3) {
          setP1Team([...p1Team, id]);
        } else {
          setP1Team([p1Team[0], p1Team[1], id]);
        }
      }
    } else {
      setP1Team([id]);
    }
  };

  const handleStart = () => {
    sound.playSuperImpact();
    sound.announce('Team Assembled! Proceed to the Arena!');
    onStartMatch({
      mode,
      aiDifficulty,
      roundTime: 99,
      stageId: selectedStageId,
      p1Team,
      p2Team,
    });
  };

  return (
    <div className="relative w-full h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 overflow-y-auto crt-overlay">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToTitle}
            className="px-3 py-1 text-xs font-mono rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          >
            ← TITLE MENU
          </button>
          <div>
            <h1 className="text-2xl font-black font-display tracking-wider uppercase text-amber-400">
              {is3v3 ? 'KOF 3v3 TEAM DRAFT' : '1v1 ARCADE SELECT'}
            </h1>
            <p className="text-xs text-slate-400 font-body">
              {is3v3 ? 'Draft 3 fighters in order: Point, Middle, Anchor' : 'Select your champion'}
            </p>
          </div>
        </div>

        {/* Difficulty Toggle */}
        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Gauge className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-xs font-mono text-slate-400">AI:</span>
          {(['EASY', 'MEDIUM', 'HARD'] as const).map(diff => (
            <button
              key={diff}
              onClick={() => {
                sound.playBlock();
                setAiDifficulty(diff);
              }}
              className={`px-2 py-0.5 text-xs font-mono font-bold rounded transition-colors ${
                aiDifficulty === diff
                  ? 'bg-amber-500 text-slate-950'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN SELECTION GRID & DETAILS */}
      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 my-4 items-stretch">
        {/* LEFT COLUMN: ROSTER GRID & TEAM LINEUP */}
        <div className="lg:col-span-7 flex flex-col justify-between gap-4">
          {/* P1 ACTIVE SQUAD LINEUP */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4" />
                Player 1 Lineup ({p1Team.length}/{targetTeamCount})
              </span>
              <span className="text-[11px] text-slate-400 font-body">
                Click roster cards to toggle order
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[0, 1, 2].slice(0, targetTeamCount).map(slotIndex => {
                const fighterId = p1Team[slotIndex];
                const f = fighterId ? FIGHTERS.find(it => it.id === fighterId) : null;
                const slotLabel = slotIndex === 0 ? 'Point' : slotIndex === 1 ? 'Middle' : 'Anchor';

                return (
                  <div
                    key={slotIndex}
                    className={`h-20 rounded-lg border flex flex-col justify-between p-2 relative overflow-hidden transition-all ${
                      f
                        ? 'bg-slate-800/80 border-amber-500/50 shadow-md'
                        : 'bg-slate-900/40 border-dashed border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-amber-400/90 font-bold">
                        #{slotIndex + 1} {slotLabel}
                      </span>
                      {f && <span className="text-base">{f.avatarIcon}</span>}
                    </div>
                    {f ? (
                      <div>
                        <div className="text-sm font-black font-display text-white leading-tight truncate">
                          {f.name}
                        </div>
                        <div className="text-[10px] text-amber-300 font-mono truncate">
                          {f.specials[0]?.name}
                        </div>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono flex items-center justify-center my-auto">
                        Empty Slot
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* LOCAL 2P TOGGLE PICKER BAR */}
          {isLocal2P && (
            <div className="flex items-center gap-2 p-2 bg-slate-900 border border-purple-500/50 rounded-xl">
              <span className="text-xs font-mono text-purple-400 font-bold uppercase">Picking Champion For:</span>
              <button
                onClick={() => setActivePickingPlayer(1)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  activePickingPlayer === 1 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Player 1 ({FIGHTERS.find(f => f.id === p1Team[0])?.name.split(' ')[0]})
              </button>
              <button
                onClick={() => setActivePickingPlayer(2)}
                className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                  activePickingPlayer === 2 ? 'bg-purple-500 text-white' : 'bg-slate-800 text-slate-400'
                }`}
              >
                Player 2 ({FIGHTERS.find(f => f.id === p2Team[0])?.name.split(' ')[0]})
              </button>
            </div>
          )}

          {/* 8-FIGHTER SELECTION GRID (4 COLUMNS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {FIGHTERS.map(f => {
              const isP1 = p1Team.includes(f.id);
              const isP2 = isLocal2P && p2Team.includes(f.id);
              const orderIndex = p1Team.indexOf(f.id);
              const isHovered = hoveredFighterId === f.id;

              return (
                <button
                  key={f.id}
                  onMouseEnter={() => {
                    setHoveredFighterId(f.id);
                    sound.playWhoosh(false);
                  }}
                  onClick={() => handleSelectFighter(f.id)}
                  className={`p-2.5 rounded-xl border text-left relative flex flex-col justify-between h-28 transition-all active:scale-[0.98] ${
                    isP1
                      ? 'border-amber-400 bg-amber-950/30 shadow-md shadow-amber-500/10'
                      : isP2
                      ? 'border-purple-400 bg-purple-950/40 shadow-md shadow-purple-500/10'
                      : isHovered
                      ? 'border-slate-500 bg-slate-800/80'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  {/* Selected Badge */}
                  {isP1 && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 font-mono font-black text-[9px]">
                      {is3v3 ? `P1 #${orderIndex + 1}` : 'P1'}
                    </div>
                  )}
                  {isP2 && (
                    <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-purple-500 text-white font-mono font-black text-[9px]">
                      P2
                    </div>
                  )}

                  <div className="text-xl">{f.avatarIcon}</div>

                  <div>
                    <div className="text-sm font-black font-display text-white uppercase tracking-wide leading-tight truncate">
                      {f.name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-body truncate">
                      {f.faction}
                    </div>
                    <div className="text-[9px] text-amber-400 font-mono mt-0.5 font-bold truncate">
                      {f.superMove.name}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* STAGE PICKER */}
          <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400 uppercase tracking-wider mb-2">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              Battle Stage Location
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {STAGES.map(s => (
                <button
                  key={s.id}
                  onClick={() => {
                    setSelectedStageId(s.id);
                    sound.playBlock();
                  }}
                  className={`p-2 rounded-lg border text-left transition-colors ${
                    selectedStageId === s.id
                      ? 'bg-amber-500/20 border-amber-400 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-bold font-display truncate">{s.name}</div>
                  <div className="text-[9px] text-slate-400 font-mono truncate">{s.crowdCheer}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: FIGHTER PROFILE & SPECIAL MOVE LAB */}
        <div className="lg:col-span-5 p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            {/* Fighter Name Lockup */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-3 mb-3">
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
                  {activeFighter.faction}
                </span>
                <h2 className="text-3xl font-black font-display uppercase tracking-wide text-white leading-tight">
                  {activeFighter.name}
                </h2>
                <p className="text-xs text-slate-300 italic font-body">
                  "{activeFighter.tagline}"
                </p>
              </div>
              <span className="text-4xl filter drop-shadow">{activeFighter.avatarIcon}</span>
            </div>

            {/* Fighter Radar Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4 bg-slate-950/60 p-3 rounded-lg border border-slate-800/80">
              {(
                [
                  ['power', 'Power', 'text-red-400'],
                  ['speed', 'Speed', 'text-amber-400'],
                  ['defense', 'Defense', 'text-blue-400'],
                  ['range', 'Range', 'text-emerald-400'],
                ] as const
              ).map(([key, label, color]) => {
                const val = activeFighter.stats[key];
                return (
                  <div key={key} className="flex flex-col">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{label}</span>
                      <span className={`font-bold ${color}`}>{val}/5</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${
                          key === 'power'
                            ? 'bg-red-500'
                            : key === 'speed'
                            ? 'bg-amber-400'
                            : key === 'defense'
                            ? 'bg-blue-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${(val / 5) * 100}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Special Moves Breakdown */}
            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Special Moves & Command List
              </span>
              <div className="space-y-2">
                {activeFighter.specials.map(sp => (
                  <div key={sp.id} className="p-2 rounded bg-slate-950/70 border border-slate-800 text-xs">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-bold text-amber-300 font-display text-sm tracking-wide">
                        {sp.name} <span className="text-[10px] text-slate-400 font-normal">({sp.hindiName})</span>
                      </span>
                      <span className="font-mono text-[10px] text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">
                        {sp.command}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-body leading-relaxed">
                      {sp.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Super MAX Move */}
            <div className="p-2.5 rounded-lg bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-950 border border-amber-500/40">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 uppercase mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                MAX Super Move ({activeFighter.superMove.command})
              </div>
              <div className="text-sm font-black font-display text-white">
                {activeFighter.superMove.name}
              </div>
              <p className="text-[11px] text-slate-300 font-body leading-relaxed mt-1">
                {activeFighter.superMove.description}
              </p>
            </div>
          </div>

          {/* Primary Action Button */}
          <div className="pt-4 border-t border-slate-800 mt-4">
            <button
              onClick={handleStart}
              disabled={p1Team.length < targetTeamCount}
              className={`w-full py-3.5 rounded-xl font-display font-black text-xl tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${
                p1Team.length >= targetTeamCount
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Swords className="w-5 h-5" />
              START BATTLE IN {selectedStage.name.split(' ')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
