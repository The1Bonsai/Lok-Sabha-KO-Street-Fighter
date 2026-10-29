/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FIGHTERS } from '../game/fightersData';
import { X, Gamepad2, Sparkles, BookOpen, Smartphone } from 'lucide-react';
import { sound } from '../audio/soundEngine';

interface MoveListModalProps {
  onClose: () => void;
}

export const MoveListModal: React.FC<MoveListModalProps> = ({ onClose }) => {
  const [selectedFighterId, setSelectedFighterId] = useState<string>(FIGHTERS[0].id);
  const fighter = FIGHTERS.find(f => f.id === selectedFighterId) || FIGHTERS[0];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-3xl max-h-[90vh] bg-slate-900 border-2 border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* MODAL HEADER */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-black font-display tracking-wider uppercase text-white">
              ARCADE RULEBOOK & COMMAND LIST
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playBlock();
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENT TABS & BODY */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* CONTROL SCHEME SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Player 1 Keyboard Controls */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-400 uppercase mb-2">
                <Gamepad2 className="w-4 h-4" />
                Player 1 Controls
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Move / Jump:</span>
                  <span className="text-amber-300 font-bold">W, A, S, D</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Punch (L/H):</span>
                  <span className="text-amber-300 font-bold">J (Light), U (Heavy)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Kick (L/H):</span>
                  <span className="text-amber-300 font-bold">K (Light), I (Heavy)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Emergency Roll:</span>
                  <span className="text-amber-300 font-bold">Spacebar</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">MAX Super:</span>
                  <span className="text-amber-300 font-bold">Q Key (at 100%)</span>
                </div>
              </div>
            </div>

            {/* Player 2 Local Keyboard Controls */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-purple-400 uppercase mb-2">
                <Gamepad2 className="w-4 h-4" />
                Player 2 (Local 2P)
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Move / Jump:</span>
                  <span className="text-purple-300 font-bold">Arrow Keys</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Punch (L/H):</span>
                  <span className="text-purple-300 font-bold">B (Light), G (Heavy)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Kick (L/H):</span>
                  <span className="text-purple-300 font-bold">N (Light), H (Heavy)</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Emergency Roll:</span>
                  <span className="text-purple-300 font-bold">M Key</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">MAX Super:</span>
                  <span className="text-purple-300 font-bold">Y Key (at 100%)</span>
                </div>
              </div>
            </div>

            {/* Mobile Touch Controls */}
            <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-sky-400 uppercase mb-2">
                <Smartphone className="w-4 h-4" />
                Mobile Touch Controls
              </div>
              <div className="space-y-1 text-[11px] font-mono text-slate-300">
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">8-Way Joystick:</span>
                  <span className="text-sky-300 font-bold">Left Thumb Drag</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">Neo Geo Cluster:</span>
                  <span className="text-sky-300 font-bold">LP, HP, LK, HK</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-slate-900">
                  <span className="text-slate-400">One-Tap Roll:</span>
                  <span className="text-sky-300 font-bold">Blue ROLL Button</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-slate-400">One-Tap Super:</span>
                  <span className="text-sky-300 font-bold">Gold SUPER Button</span>
                </div>
              </div>
            </div>
          </div>

          {/* FIGHTER ROSTER TABS (8 FIGHTERS) */}
          <div>
            <div className="text-xs font-mono uppercase text-slate-400 font-bold mb-2">
              Select Fighter for Move Details (8 Satirical Legends):
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {FIGHTERS.map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    sound.playWhoosh(false);
                    setSelectedFighterId(f.id);
                  }}
                  className={`p-2 rounded-lg border text-center transition-all ${
                    selectedFighterId === f.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="text-xl mb-1">{f.avatarIcon}</div>
                  <div className="text-[10px] font-display font-bold uppercase truncate">{f.name.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE FIGHTER COMMAND LIST */}
          <div className="p-4 bg-slate-950/90 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-3">
              <span className="text-3xl filter drop-shadow">{fighter.avatarIcon}</span>
              <div>
                <h3 className="text-xl font-black font-display uppercase text-white">
                  {fighter.name}
                </h3>
                <p className="text-xs text-amber-400 font-mono">
                  {fighter.faction} · {fighter.tagline}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {fighter.specials.map(sp => (
                <div key={sp.id} className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-bold font-display text-amber-300 uppercase">
                      {sp.name} ({sp.hindiName})
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-xs font-mono font-bold text-amber-400">
                      {sp.command}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 font-body">
                    {sp.description}
                  </p>
                </div>
              ))}

              {/* Super Move */}
              <div className="p-3 rounded-lg bg-gradient-to-r from-amber-950/40 via-orange-950/30 to-slate-950 border border-amber-500/50">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-black font-display text-amber-400 uppercase flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    MAX SUPER: {fighter.superMove.name} ({fighter.superMove.hindiName})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-xs font-mono font-black">
                    {fighter.superMove.command}
                  </span>
                </div>
                <p className="text-xs text-slate-200 font-body">
                  {fighter.superMove.description}
                </p>
                <div className="mt-2 text-xs italic text-amber-300/90 font-body">
                  Quote: "{fighter.superMove.cinematicQuote}"
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div className="p-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playBlock();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs font-bold uppercase transition-colors"
          >
            CLOSE GUIDE
          </button>
        </div>
      </div>
    </div>
  );
};
