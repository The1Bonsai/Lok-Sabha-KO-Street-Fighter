/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { FighterDef, MatchSettings } from '../types/game';
import { FIGHTERS } from '../game/fightersData';
import { sound } from '../audio/soundEngine';
import { STAGES } from '../game/stagesData';
import { Globe, Users, Wifi, Swords, Shield, X, CheckCircle2 } from 'lucide-react';
import { multiplayer } from '../network/multiplayerSync';

interface RandomMatchmakingModalProps {
  onStartMatch: (settings: MatchSettings) => void;
  onClose: () => void;
}

const RIVAL_GAMERTAGS = [
  { name: 'Delhi_Yoddha_99', rank: 'National Champion', team: ['netaji_vikas', 'yuva_rahul', 'bulldozer_baba'] },
  { name: 'Khela_Master_WB', rank: 'Regional Grandmaster', team: ['didi_khela', 'bahubali_goon', 'muffler_babu'] },
  { name: 'PrimeTime_Warrior', rank: 'Media Gladiator', team: ['arnab_prime', 'raid_raja', 'netaji_vikas'] },
  { name: 'Dharna_King_007', rank: 'Street Veteran', team: ['muffler_babu', 'yuva_rahul', 'didi_khela'] },
  { name: 'Bahubali_Sultan', rank: 'Enforcer Elite', team: ['bahubali_goon', 'bulldozer_baba', 'raid_raja'] },
];

export const RandomMatchmakingModal: React.FC<RandomMatchmakingModalProps> = ({ onStartMatch, onClose }) => {
  const [searching, setSearching] = useState(true);
  const [matchFound, setMatchFound] = useState(false);
  const [searchTimer, setSearchTimer] = useState(0);
  const [matchedRival, setMatchedRival] = useState(RIVAL_GAMERTAGS[0]);

  // Player selected 3-fighter team
  const [myTeam, setMyTeam] = useState<string[]>(['netaji_vikas', 'yuva_rahul', 'muffler_babu']);

  useEffect(() => {
    sound.playWhoosh(false);
    multiplayer.joinRoom('RANDOM_3V3_POOL', false);

    const interval = setInterval(() => {
      setSearchTimer(t => t + 1);
    }, 1000);

    // Auto-match after 3.2 seconds
    const matchTimeout = setTimeout(() => {
      const rival = RIVAL_GAMERTAGS[Math.floor(Math.random() * RIVAL_GAMERTAGS.length)];
      setMatchedRival(rival);
      setSearching(false);
      setMatchFound(true);
      sound.playFanfare();
      sound.announce('3v3 Opponent Found! Match Starting!');

      // Launch after 1.8s countdown
      setTimeout(() => {
        const randomStage = STAGES[Math.floor(Math.random() * STAGES.length)].id;
        onStartMatch({
          mode: '3v3_ONLINE_RANDOM',
          aiDifficulty: 'MEDIUM',
          roundTime: 99,
          stageId: randomStage,
          p1Team: myTeam,
          p2Team: rival.team,
        });
      }, 1800);
    }, 3200);

    return () => {
      clearInterval(interval);
      clearTimeout(matchTimeout);
    };
  }, [myTeam, onStartMatch]);

  const toggleMyFighter = (id: string) => {
    if (id === 'boss_corruption') return;
    sound.playHit(false);
    if (myTeam.includes(id)) {
      if (myTeam.length > 1) {
        setMyTeam(myTeam.filter(fid => fid !== id));
      }
    } else {
      if (myTeam.length < 3) {
        setMyTeam([...myTeam, id]);
      } else {
        setMyTeam([myTeam[0], myTeam[1], id]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-sky-500/80 rounded-2xl shadow-2xl p-6 text-white crt-overlay">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-sky-400" />
            <h2 className="text-2xl font-black font-display uppercase tracking-wider text-white">
              3v3 ONLINE RANDOM MATCHMAKING
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playBlock();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MATCHMAKING RADAR / SEARCH STATE */}
        <div className="p-5 rounded-xl bg-slate-950 border border-slate-800 text-center mb-5 relative overflow-hidden">
          {searching ? (
            <div className="flex flex-col items-center py-4">
              {/* Pulsing Radar Ring */}
              <div className="relative w-20 h-20 mb-3 flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border-2 border-sky-400/30 animate-ping" />
                <div className="w-14 h-14 rounded-full bg-sky-500/20 border-2 border-sky-400 flex items-center justify-center">
                  <Wifi className="w-6 h-6 text-sky-300 animate-pulse" />
                </div>
              </div>

              <div className="text-xl font-black font-display uppercase text-sky-400 tracking-wide">
                SEARCHING FOR 3v3 OPPONENT...
              </div>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Elapsed: {searchTimer}s · Region: India Central · Latency: 28ms
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center py-2 animate-in zoom-in-95 duration-200">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-2">
                <CheckCircle2 className="w-7 h-7 text-emerald-400" />
              </div>
              <div className="text-2xl font-black font-display uppercase text-emerald-400 tracking-wider">
                OPPONENT MATCHED!
              </div>

              {/* RIVAL IDENTITY CARD */}
              <div className="w-full max-w-sm mt-3 p-3 bg-slate-900/90 rounded-lg border border-slate-700 flex items-center justify-between">
                <div className="text-left">
                  <div className="text-xs font-mono text-amber-400 font-bold">
                    {matchedRival.rank}
                  </div>
                  <div className="text-base font-black font-display uppercase text-white">
                    {matchedRival.name}
                  </div>
                </div>
                <div className="flex gap-1 text-2xl">
                  {matchedRival.team.map(fid => {
                    const f = FIGHTERS.find(it => it.id === fid);
                    return f ? <span key={fid}>{f.avatarIcon}</span> : null;
                  })}
                </div>
              </div>

              <span className="text-xs font-mono text-slate-400 mt-2">
                Starting 3v3 Battle in Arena...
              </span>
            </div>
          )}
        </div>

        {/* YOUR 3-MEMBER TEAM SELECTION */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-mono text-sky-400 font-bold uppercase flex items-center gap-1.5">
              <Users className="w-4 h-4" />
              Your 3-Leader Draft:
            </span>
            <span className="text-[11px] text-slate-400 font-body">
              All 3 will fight sequentially!
            </span>
          </div>

          <div className="grid grid-cols-8 gap-2">
            {FIGHTERS.filter(f => f.id !== 'boss_corruption').map(f => {
              const isSelected = myTeam.includes(f.id);
              const orderIndex = myTeam.indexOf(f.id);

              return (
                <button
                  key={f.id}
                  onClick={() => toggleMyFighter(f.id)}
                  disabled={matchFound}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    isSelected
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300 shadow-md scale-105'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{f.avatarIcon}</div>
                  <div className="text-[10px] font-display font-bold uppercase truncate">
                    {f.name.split(' ')[0]}
                  </div>
                  {isSelected && (
                    <div className="text-[9px] font-mono font-bold text-sky-400 mt-0.5">
                      #{orderIndex + 1}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
