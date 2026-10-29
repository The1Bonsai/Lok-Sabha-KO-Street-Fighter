/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { multiplayer } from '../network/multiplayerSync';
import { FIGHTERS } from '../game/fightersData';
import { sound } from '../audio/soundEngine';
import { Globe, Users, Copy, Check, Play, ArrowLeft, Shield } from 'lucide-react';

interface OnlineLobbyModalProps {
  onStartOnlineMatch: (myFighterId: string, opponentFighterId: string, isHost: boolean) => void;
  onBack: () => void;
}

export const OnlineLobbyModal: React.FC<OnlineLobbyModalProps> = ({ onStartOnlineMatch, onBack }) => {
  const [roomId, setRoomId] = useState('');
  const [inputRoomId, setInputRoomId] = useState('');
  const [isHost, setIsHost] = useState(false);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [myFighterId, setMyFighterId] = useState(FIGHTERS[0].id);
  const [opponentFighterId, setOpponentFighterId] = useState(FIGHTERS[1].id);

  useEffect(() => {
    multiplayer.onOpponentJoined = (fid) => {
      sound.playFanfare();
      setConnected(true);
      if (fid) setOpponentFighterId(fid);
    };

    multiplayer.onOpponentReady = () => {
      sound.playSuperImpact();
      onStartOnlineMatch(myFighterId, opponentFighterId, isHost);
    };

    return () => {
      multiplayer.leaveRoom();
    };
  }, [myFighterId, opponentFighterId, isHost, onStartOnlineMatch]);

  const handleCreateRoom = () => {
    sound.playHit(false);
    const code = multiplayer.createRoom();
    setRoomId(code);
    setIsHost(true);
    multiplayer.sendFighterSelect(myFighterId);
  };

  const handleJoinRoom = () => {
    if (!inputRoomId.trim()) return;
    sound.playHit(false);
    const code = inputRoomId.trim().toUpperCase();
    multiplayer.joinRoom(code, false);
    setRoomId(code);
    setIsHost(false);
    setConnected(true);
    multiplayer.sendFighterSelect(myFighterId);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStart = () => {
    sound.playSuperImpact();
    multiplayer.sendReady();
    onStartOnlineMatch(myFighterId, opponentFighterId, isHost);
  };

  const myFighter = FIGHTERS.find(f => f.id === myFighterId) || FIGHTERS[0];
  const oppFighter = FIGHTERS.find(f => f.id === opponentFighterId) || FIGHTERS[1];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-2xl p-6 text-white crt-overlay">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Globe className="w-6 h-6 text-amber-400" />
            <h2 className="text-2xl font-black font-display uppercase tracking-wider text-white">
              ONLINE PVP LOBBY (ROOM BRAWL)
            </h2>
          </div>
          <button
            onClick={() => {
              multiplayer.leaveRoom();
              onBack();
            }}
            className="flex items-center gap-1 px-3 py-1 text-xs font-mono rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            BACK
          </button>
        </div>

        {/* ROOM CODE BAR */}
        {!roomId ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            {/* Create Room */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-display uppercase text-amber-400 mb-1">
                  Host Match
                </h3>
                <p className="text-xs text-slate-400 font-body mb-4">
                  Create a new private lobby code and share with your friend.
                </p>
              </div>
              <button
                onClick={handleCreateRoom}
                className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-display font-black text-sm uppercase transition-colors"
              >
                CREATE ROOM CODE
              </button>
            </div>

            {/* Join Room */}
            <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold font-display uppercase text-sky-400 mb-1">
                  Join Match
                </h3>
                <p className="text-xs text-slate-400 font-body mb-2">
                  Enter your opponent's 4-character room code.
                </p>
                <input
                  type="text"
                  maxLength={6}
                  value={inputRoomId}
                  onChange={e => setInputRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. KOF8"
                  className="w-full px-3 py-1.5 mb-3 bg-slate-900 border border-slate-700 rounded text-center font-mono font-bold text-lg text-amber-300 tracking-widest uppercase focus:outline-none focus:border-amber-400"
                />
              </div>
              <button
                onClick={handleJoinRoom}
                disabled={!inputRoomId.trim()}
                className="w-full py-2.5 rounded-lg bg-sky-500 hover:bg-sky-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-display font-black text-sm uppercase transition-colors"
              >
                JOIN WITH CODE
              </button>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-950/90 rounded-xl border border-amber-500/60 mb-6 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                Active Room Code ({isHost ? 'Host' : 'Guest'}):
              </span>
              <span className="text-3xl font-mono font-black text-amber-300 tracking-widest">
                {roomId}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-mono text-amber-300"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'COPIED!' : 'COPY CODE'}
              </button>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-slate-900 border border-slate-700">
                <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span className="text-xs font-mono text-slate-300">
                  {connected ? '2P Connected' : 'Waiting for 2P...'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FIGHTER SELECTION & VERSUS DISPLAY */}
        <div className="mb-4">
          <div className="text-xs font-mono text-slate-400 uppercase font-bold mb-2">
            Choose Your Fighter:
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-4">
            {FIGHTERS.map(f => (
              <button
                key={f.id}
                onClick={() => {
                  sound.playWhoosh(false);
                  setMyFighterId(f.id);
                  if (roomId) multiplayer.sendFighterSelect(f.id);
                }}
                className={`p-2 rounded-lg border text-center transition-all ${
                  myFighterId === f.id
                    ? 'bg-amber-500/20 border-amber-400 text-white shadow-md'
                    : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-2xl mb-1">{f.avatarIcon}</div>
                <div className="text-[10px] font-display font-bold uppercase truncate">
                  {f.name.split(' ')[0]}
                </div>
              </button>
            ))}
          </div>

          {/* VERSUS FACE-OFF PREVIEW */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
            {/* YOU */}
            <div className="flex items-center gap-3">
              <span className="text-3xl filter drop-shadow">{myFighter.avatarIcon}</span>
              <div>
                <div className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                  Player 1 (You)
                </div>
                <div className="text-lg font-black font-display uppercase text-white">
                  {myFighter.name}
                </div>
              </div>
            </div>

            <span className="text-2xl font-black font-display text-amber-500">VS</span>

            {/* OPPONENT */}
            <div className="flex items-center gap-3 flex-row-reverse text-right">
              <span className="text-3xl filter drop-shadow">{oppFighter.avatarIcon}</span>
              <div>
                <div className="text-[10px] font-mono text-sky-400 font-bold uppercase">
                  Player 2 (Opponent)
                </div>
                <div className="text-lg font-black font-display uppercase text-white">
                  {oppFighter.name}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PRIMARY CTA */}
        <button
          onClick={handleStart}
          disabled={!roomId}
          className={`w-full py-3.5 rounded-xl font-display font-black text-xl tracking-wider uppercase flex items-center justify-center gap-2 shadow-xl transition-all ${
            roomId
              ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 active:scale-[0.98]'
              : 'bg-slate-800 text-slate-500 cursor-not-allowed'
          }`}
        >
          <Play className="w-5 h-5" />
          {roomId ? 'START ONLINE PVP BRAWL' : 'CREATE OR JOIN A ROOM FIRST'}
        </button>
      </div>
    </div>
  );
};
