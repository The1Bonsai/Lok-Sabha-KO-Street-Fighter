/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FighterDef, MatchSettings } from '../types/game';
import { FIGHTERS } from '../game/fightersData';
import { sound } from '../audio/soundEngine';
import { MapPin, Trophy, Shield, Swords, Sparkles, ArrowLeft, Play, Skull } from 'lucide-react';

export interface StoryStage {
  id: number;
  name: string;
  region: string;
  stageId: string;
  opponentTeamIds: string[];
  bossName: string;
  introDialog: string;
  winDialog: string;
}

export const STORY_STAGES: StoryStage[] = [
  {
    id: 1,
    name: 'Zone 1: Northern Bastion (Delhi & UP)',
    region: 'North Corridor',
    stageId: 'vikas_marg',
    opponentTeamIds: ['netaji_vikas', 'bulldozer_baba', 'bahubali_goon'],
    bossName: 'The Double-Engine Alliance',
    introDialog: '"First cross our bulldozers and expressways before stepping into the capital!"',
    winDialog: 'Northern stronghold conquered! The electoral momentum shifts to the East!',
  },
  {
    id: 2,
    name: 'Zone 2: Eastern Vanguard (Bengal & Bihar)',
    region: 'Eastern Front',
    stageId: 'rally_ground',
    opponentTeamIds: ['didi_khela', 'muffler_babu', 'yuva_rahul'],
    bossName: 'The Grassroots Mahagathbandhan',
    introDialog: '"Khela Hobe! You cannot breach the regional fortress with Delhi slogans!"',
    winDialog: 'Eastern front liberated! Massive crowd rallies join your political march!',
  },
  {
    id: 3,
    name: 'Zone 3: National Broadcast Floor (Prime Time Arena)',
    region: 'Central Media Hub',
    stageId: 'news_studio',
    opponentTeamIds: ['arnab_prime', 'raid_raja', 'bahubali_goon'],
    bossName: 'The 9 PM Media & Agency Tribunal',
    introDialog: '"The Nation wants to know your corruption score! Prepare for the 140-decibel grilling!"',
    winDialog: 'The prime-time debate is won! Truth has shattered the studio spotlight!',
  },
  {
    id: 4,
    name: 'Zone 4: The Secret High-Command Vault (FINAL BOSS)',
    region: 'Dark Deep-State Syndicate',
    stageId: 'jantar_mantar',
    opponentTeamIds: ['boss_corruption'],
    bossName: 'Bhrashtachar (The Shadow Titan Boss)',
    introDialog: '"FOOLS! Leaders rise and fall, but I am the Swiss bank black money! I AM UNBEATABLE!"',
    winDialog: 'THE SHADOW OF CORRUPTION HAS FALLEN! A NEW ERA OF DEMOCRACY BEGINS!',
  },
];

interface StoryCampaignMapProps {
  onStartBattle: (settings: MatchSettings, stageNum: number) => void;
  onBackToTitle: () => void;
}

export const StoryCampaignMap: React.FC<StoryCampaignMapProps> = ({ onStartBattle, onBackToTitle }) => {
  // Player's selected 3-member team
  const [selectedPlayerTeam, setSelectedPlayerTeam] = useState<string[]>([
    'yuva_rahul',
    'muffler_babu',
    'didi_khela',
  ]);

  // Read highest unlocked stage from localStorage
  const [unlockedStage] = useState<number>(() => {
    try {
      return parseInt(localStorage.getItem('lok_sabha_story_stage') || '1', 10);
    } catch {
      return 1;
    }
  });

  const [activeStageId, setActiveStageId] = useState<number>(unlockedStage);

  const activeStage = STORY_STAGES.find(s => s.id === activeStageId) || STORY_STAGES[0];

  const handleLaunchStage = () => {
    sound.playSuperImpact();
    sound.announce(`Chapter ${activeStage.id}! ${activeStage.name}!`);

    onStartBattle(
      {
        mode: 'STORY_CAMPAIGN',
        aiDifficulty: activeStage.id === 4 ? 'HARD' : activeStage.id === 3 ? 'MEDIUM' : 'EASY',
        roundTime: 99,
        stageId: activeStage.stageId,
        p1Team: selectedPlayerTeam,
        p2Team: activeStage.opponentTeamIds,
      },
      activeStage.id
    );
  };

  const togglePlayerFighter = (id: string) => {
    if (id === 'boss_corruption') return; // Cannot pick the final boss in story mode
    sound.playHit(false);
    if (selectedPlayerTeam.includes(id)) {
      if (selectedPlayerTeam.length > 1) {
        setSelectedPlayerTeam(selectedPlayerTeam.filter(fid => fid !== id));
      }
    } else {
      if (selectedPlayerTeam.length < 3) {
        setSelectedPlayerTeam([...selectedPlayerTeam, id]);
      } else {
        setSelectedPlayerTeam([selectedPlayerTeam[0], selectedPlayerTeam[1], id]);
      }
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#0b0f19] text-white flex flex-col justify-between p-4 overflow-y-auto select-none crt-overlay">
      {/* HEADER BAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playBlock();
              onBackToTitle();
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono rounded bg-slate-900 border border-slate-700 text-slate-300 hover:text-white"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            TITLE MENU
          </button>
          <div>
            <h1 className="text-2xl font-black font-display tracking-wider uppercase text-amber-400">
              STORY MODE: INDIA ELECTION SAGA
            </h1>
            <p className="text-xs text-slate-400 font-body">
              Conquer regional bastions and defeat the Colossal Boss: <span className="text-purple-400 font-bold">CORRUPTION</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono text-slate-300">
            Campaign Progress: <span className="font-bold text-amber-400">{Math.min(unlockedStage, 4)} / 4</span>
          </span>
        </div>
      </div>

      {/* MAIN LAYOUT: MAP OF INDIA & STAGE SELECTION */}
      <div className="flex-1 max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-5 my-3 items-stretch">
        {/* LEFT COLUMN: INTERACTIVE MAP OF INDIA SVG */}
        <div className="lg:col-span-7 p-4 bg-slate-900/70 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-amber-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              Regional Electoral Battlefield
            </span>
            <span className="text-[11px] text-slate-400 font-body">
              Click regions on the map to inspect rivals
            </span>
          </div>

          {/* BESPOKE INTERACTIVE MAP OF INDIA SVG LOCKUP */}
          <div className="relative w-full h-80 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-center overflow-hidden p-2">
            <svg viewBox="0 0 500 520" className="w-full h-full max-h-76 drop-shadow-xl">
              {/* Stylized Silhouette of India Territories */}
              <defs>
                <linearGradient id="indiaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#ea580c" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.2" />
                </linearGradient>
              </defs>

              {/* Geographic Indian subcontinent polygon silhouette */}
              <polygon
                points="240,40 280,60 300,90 260,110 230,130 180,140 140,180 130,240 160,280 200,320 230,380 250,440 270,390 300,320 340,260 380,220 440,210 420,180 360,190 320,160 280,120 260,80"
                fill="url(#indiaGrad)"
                stroke="#475569"
                strokeWidth="2.5"
                strokeDasharray="4 2"
              />

              {/* Stage 1 Pin: North (Delhi/UP) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  sound.playHit(false);
                  setActiveStageId(1);
                }}
              >
                <circle cx="230" cy="140" r="22" fill={activeStageId === 1 ? '#f59e0b' : '#1e293b'} stroke="#f59e0b" strokeWidth="2.5" />
                <text x="230" y="145" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">1</text>
                <text x="230" y="174" textAnchor="middle" fill="#fde047" fontSize="10" fontFamily="monospace">DELHI/UP</text>
              </g>

              {/* Stage 2 Pin: East (Bengal/Bihar) */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  if (unlockedStage >= 2) {
                    sound.playHit(false);
                    setActiveStageId(2);
                  }
                }}
              >
                <circle
                  cx="330"
                  cy="210"
                  r="22"
                  fill={unlockedStage < 2 ? '#334155' : activeStageId === 2 ? '#10b981' : '#1e293b'}
                  stroke={unlockedStage < 2 ? '#64748b' : '#10b981'}
                  strokeWidth="2.5"
                />
                <text x="330" y="215" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                  {unlockedStage < 2 ? '🔒' : '2'}
                </text>
                <text x="330" y="244" textAnchor="middle" fill="#86efac" fontSize="10" fontFamily="monospace">BENGAL</text>
              </g>

              {/* Stage 3 Pin: Central Media Floor */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  if (unlockedStage >= 3) {
                    sound.playHit(false);
                    setActiveStageId(3);
                  }
                }}
              >
                <circle
                  cx="220"
                  cy="250"
                  r="22"
                  fill={unlockedStage < 3 ? '#334155' : activeStageId === 3 ? '#3b82f6' : '#1e293b'}
                  stroke={unlockedStage < 3 ? '#64748b' : '#3b82f6'}
                  strokeWidth="2.5"
                />
                <text x="220" y="255" textAnchor="middle" fill="#ffffff" fontSize="13" fontWeight="bold">
                  {unlockedStage < 3 ? '🔒' : '3'}
                </text>
                <text x="220" y="284" textAnchor="middle" fill="#93c5fd" fontSize="10" fontFamily="monospace">STUDIO 7</text>
              </g>

              {/* Stage 4 Pin: The Vault of Boss Corruption */}
              <g
                className="cursor-pointer transition-transform hover:scale-110"
                onClick={() => {
                  if (unlockedStage >= 4) {
                    sound.playSuperFlash();
                    setActiveStageId(4);
                  }
                }}
              >
                <circle
                  cx="250"
                  cy="350"
                  r="28"
                  fill={unlockedStage < 4 ? '#18181b' : activeStageId === 4 ? '#7c3aed' : '#312e81'}
                  stroke={unlockedStage < 4 ? '#52525b' : '#c084fc'}
                  strokeWidth="3.5"
                  className={unlockedStage >= 4 ? 'animate-pulse' : ''}
                />
                <text x="250" y="356" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="bold">
                  {unlockedStage < 4 ? '🔒' : '🏛️'}
                </text>
                <text x="250" y="394" textAnchor="middle" fill="#e879f9" fontSize="11" fontWeight="bold" fontFamily="monospace">
                  BOSS CORRUPTION
                </text>
              </g>
            </svg>
          </div>

          {/* PLAYER SQUAD DRAFT (PICK YOUR 3 FIGHTERS) */}
          <div className="mt-3 p-3 bg-slate-950/70 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono text-amber-300 font-bold uppercase">
                Your 3-Leader Coalition ({selectedPlayerTeam.length}/3)
              </span>
              <span className="text-[10px] text-slate-400">Click fighters below to swap</span>
            </div>
            <div className="grid grid-cols-8 gap-1.5">
              {FIGHTERS.filter(f => f.id !== 'boss_corruption').map(f => {
                const isSelected = selectedPlayerTeam.includes(f.id);
                return (
                  <button
                    key={f.id}
                    onClick={() => togglePlayerFighter(f.id)}
                    className={`p-1.5 rounded-lg border text-center transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-300 scale-105'
                        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <div className="text-xl mb-0.5">{f.avatarIcon}</div>
                    <div className="text-[9px] font-display font-bold uppercase truncate">
                      {f.name.split(' ')[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: STAGE BRIEFING & BOSS SHOWDOWN CARD */}
        <div className="lg:col-span-5 p-4 bg-slate-900/80 border border-slate-800 rounded-xl flex flex-col justify-between">
          <div>
            {/* STAGE HEADER */}
            <div className="border-b border-slate-800 pb-3 mb-3">
              <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                Chapter #{activeStage.id} · {activeStage.region}
              </span>
              <h2 className="text-2xl font-black font-display uppercase tracking-wide text-white leading-tight">
                {activeStage.name}
              </h2>
              <div className="text-xs text-slate-400 font-body mt-1">
                Enemy Alliance: <span className="text-amber-300 font-bold">{activeStage.bossName}</span>
              </div>
            </div>

            {/* PRE-FIGHT POLITICAL DIALOGUE */}
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 mb-4">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Rally Intercept & Propaganda:
              </span>
              <p className="text-xs italic text-amber-200 font-body leading-relaxed border-l-2 border-amber-400 pl-2.5">
                {activeStage.introDialog}
              </p>
            </div>

            {/* RIVAL 3-FIGHTER LINEUP DISPLAY */}
            <div className="mb-4">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-bold block mb-2">
                Enemy 3v3 Coalition Lineup:
              </span>
              <div className="space-y-2">
                {activeStage.opponentTeamIds.map((fid, idx) => {
                  const opp = FIGHTERS.find(it => it.id === fid);
                  if (!opp) return null;
                  const isBoss = opp.id === 'boss_corruption';

                  return (
                    <div
                      key={fid}
                      className={`p-2 rounded-lg border flex items-center justify-between ${
                        isBoss
                          ? 'bg-purple-950/60 border-purple-500/80 shadow-md'
                          : 'bg-slate-950/70 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl filter drop-shadow">{opp.avatarIcon}</span>
                        <div>
                          <div className={`text-sm font-black font-display uppercase leading-tight ${isBoss ? 'text-purple-300' : 'text-white'}`}>
                            {opp.name} {isBoss && '★ TITAN BOSS ★'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-body">
                            {opp.faction} · {opp.superMove.name}
                          </div>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800">
                        Slot #{idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* BOSS HIGHLIGHT BANNER */}
            {activeStage.id === 4 && (
              <div className="p-2.5 rounded-lg bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-slate-950 border border-purple-500/80 mb-3 animate-pulse">
                <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-300 uppercase mb-0.5">
                  <Skull className="w-4 h-4 text-purple-400" />
                  Warning: Hyper-Armored Final Boss
                </div>
                <p className="text-[11px] text-slate-300 font-body leading-relaxed">
                  Corruption cannot be flinched easily by light attacks. Use heavy combo chains and MAX Supers to shatter its Swiss vault shield!
                </p>
              </div>
            )}
          </div>

          {/* LAUNCH CHAPTER ACTION */}
          <div className="pt-3 border-t border-slate-800">
            <button
              onClick={handleLaunchStage}
              disabled={selectedPlayerTeam.length !== 3}
              className={`w-full py-3.5 rounded-xl font-display font-black text-xl tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${
                selectedPlayerTeam.length === 3
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 active:scale-[0.98]'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Play className="w-5 h-5" />
              START BATTLE IN {activeStage.name.split(':')[0]}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
