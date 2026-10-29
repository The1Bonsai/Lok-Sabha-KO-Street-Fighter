/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ShieldAlert, Zap } from 'lucide-react';

interface VirtualTouchPadProps {
  onInput: (key: string, isPressed: boolean) => void;
  superMeter: number;
}

export const VirtualTouchPad: React.FC<VirtualTouchPadProps> = ({ onInput, superMeter }) => {
  const joystickBaseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const [activeDirections, setActiveDirections] = useState<{ [dir: string]: boolean }>({});
  const activeTouchIdRef = useRef<number | null>(null);

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate(12);
      } catch {
        // Ignore haptic errors on unsupported devices
      }
    }
  };

  const handleJoystickMove = useCallback((clientX: number, clientY: number) => {
    if (!joystickBaseRef.current) return;
    const rect = joystickBaseRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const distance = Math.hypot(dx, dy);
    const maxRadius = 38;

    const clampedDist = Math.min(distance, maxRadius);
    const angle = Math.atan2(dy, dx);

    const knobX = Math.cos(angle) * clampedDist;
    const knobY = Math.sin(angle) * clampedDist;
    setKnobPos({ x: knobX, y: knobY });

    // Deadzone check
    const deadzone = 12;
    const newDirs: { [dir: string]: boolean } = {
      UP: false,
      DOWN: false,
      LEFT: false,
      RIGHT: false,
    };

    if (distance > deadzone) {
      // 8-way interpretation
      const deg = (angle * 180) / Math.PI; // -180 to 180

      if (deg > -157.5 && deg < -22.5) newDirs.UP = true;
      if (deg > 22.5 && deg < 157.5) newDirs.DOWN = true;
      if (deg > 112.5 || deg < -112.5) newDirs.LEFT = true;
      if (deg > -67.5 && deg < 67.5) newDirs.RIGHT = true;
    }

    // Emit changes
    ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(dir => {
      if (newDirs[dir] !== activeDirections[dir]) {
        onInput(dir, newDirs[dir]);
      }
    });

    setActiveDirections(newDirs);
  }, [activeDirections, onInput]);

  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    if (activeTouchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    activeTouchIdRef.current = touch.identifier;
    triggerHaptic();
    handleJoystickMove(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === activeTouchIdRef.current) {
        handleJoystickMove(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === activeTouchIdRef.current) {
        activeTouchIdRef.current = null;
        setKnobPos({ x: 0, y: 0 });
        ['UP', 'DOWN', 'LEFT', 'RIGHT'].forEach(dir => {
          onInput(dir, false);
        });
        setActiveDirections({});
        break;
      }
    }
  };

  const handleButtonPress = (btn: string) => {
    triggerHaptic();
    onInput(btn, true);
  };

  const handleButtonRelease = (btn: string) => {
    onInput(btn, false);
  };

  return (
    <div className="absolute inset-0 pointer-events-none select-none z-30 flex justify-between items-end p-4 pb-6">
      {/* --- LEFT: 8-WAY ARCADE JOYSTICK --- */}
      <div className="pointer-events-auto touch-none flex flex-col items-center">
        <div
          ref={joystickBaseRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          className="w-28 h-28 rounded-full bg-slate-900/70 border-2 border-slate-600/80 shadow-2xl relative flex items-center justify-center backdrop-blur-xs active:border-amber-400"
        >
          {/* Direction indicator notches */}
          <div className="absolute top-1 text-[9px] text-slate-400 font-bold">▲</div>
          <div className="absolute bottom-1 text-[9px] text-slate-400 font-bold">▼</div>
          <div className="absolute left-1 text-[9px] text-slate-400 font-bold">◀</div>
          <div className="absolute right-1 text-[9px] text-slate-400 font-bold">▶</div>

          {/* Draggable Stick Knob */}
          <div
            className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg border-2 border-amber-200 flex items-center justify-center transition-transform duration-75"
            style={{
              transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            }}
          >
            <div className="w-5 h-5 rounded-full bg-amber-200/50" />
          </div>
        </div>
        <span className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
          Arcade Stick
        </span>
      </div>

      {/* --- RIGHT: 4-BUTTON DIAMOND & MACROS --- */}
      <div className="pointer-events-auto touch-none flex flex-col items-end gap-2">
        {/* MACRO BUTTONS: ROLL & SUPER */}
        <div className="flex items-center gap-2 mb-1">
          {/* Quick Roll (Dodge) Button */}
          <button
            onTouchStart={() => handleButtonPress('ROLL')}
            onTouchEnd={() => handleButtonRelease('ROLL')}
            onMouseDown={() => handleButtonPress('ROLL')}
            onMouseUp={() => handleButtonRelease('ROLL')}
            className="px-3 py-1.5 rounded-lg bg-blue-600/80 active:bg-blue-500 border border-blue-400/60 text-white font-mono text-xs font-bold flex items-center gap-1 shadow-md active:scale-95 transition-transform"
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            ROLL
          </button>

          {/* Quick MAX Super Button */}
          <button
            onTouchStart={() => handleButtonPress('SUPER')}
            onTouchEnd={() => handleButtonRelease('SUPER')}
            onMouseDown={() => handleButtonPress('SUPER')}
            onMouseUp={() => handleButtonRelease('SUPER')}
            disabled={superMeter < 100}
            className={`px-3 py-1.5 rounded-lg font-mono text-xs font-black flex items-center gap-1 shadow-md transition-all active:scale-95 ${
              superMeter >= 100
                ? 'bg-gradient-to-r from-amber-500 to-orange-600 border border-yellow-300 text-white animate-pulse'
                : 'bg-slate-800/80 border border-slate-700 text-slate-500 opacity-60'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            SUPER (MAX)
          </button>
        </div>

        {/* 4-BUTTON NEO GEO DIAMOND CLUSTER */}
        <div className="relative w-36 h-36">
          {/* TOP: HP (Heavy Punch) */}
          <button
            onTouchStart={() => handleButtonPress('HP')}
            onTouchEnd={() => handleButtonRelease('HP')}
            onMouseDown={() => handleButtonPress('HP')}
            onMouseUp={() => handleButtonRelease('HP')}
            className="absolute top-0 left-12 w-12 h-12 rounded-full bg-orange-600 active:bg-orange-500 border-2 border-orange-300 shadow-lg text-white font-black text-sm flex flex-col items-center justify-center active:scale-90 transition-transform"
          >
            <span>HP</span>
            <span className="text-[7px] opacity-75">Heavy</span>
          </button>

          {/* LEFT: LP (Light Punch) */}
          <button
            onTouchStart={() => handleButtonPress('LP')}
            onTouchEnd={() => handleButtonRelease('LP')}
            onMouseDown={() => handleButtonPress('LP')}
            onMouseUp={() => handleButtonRelease('LP')}
            className="absolute top-12 left-0 w-12 h-12 rounded-full bg-amber-500 active:bg-amber-400 border-2 border-amber-200 shadow-lg text-slate-950 font-black text-sm flex flex-col items-center justify-center active:scale-90 transition-transform"
          >
            <span>LP</span>
            <span className="text-[7px] opacity-75">Light</span>
          </button>

          {/* RIGHT: HK (Heavy Kick) */}
          <button
            onTouchStart={() => handleButtonPress('HK')}
            onTouchEnd={() => handleButtonRelease('HK')}
            onMouseDown={() => handleButtonPress('HK')}
            onMouseUp={() => handleButtonRelease('HK')}
            className="absolute top-12 right-0 w-12 h-12 rounded-full bg-rose-600 active:bg-rose-500 border-2 border-rose-300 shadow-lg text-white font-black text-sm flex flex-col items-center justify-center active:scale-90 transition-transform"
          >
            <span>HK</span>
            <span className="text-[7px] opacity-75">Kick</span>
          </button>

          {/* BOTTOM: LK (Light Kick) */}
          <button
            onTouchStart={() => handleButtonPress('LK')}
            onTouchEnd={() => handleButtonRelease('LK')}
            onMouseDown={() => handleButtonPress('LK')}
            onMouseUp={() => handleButtonRelease('LK')}
            className="absolute bottom-0 left-12 w-12 h-12 rounded-full bg-blue-500 active:bg-blue-400 border-2 border-blue-200 shadow-lg text-white font-black text-sm flex flex-col items-center justify-center active:scale-90 transition-transform"
          >
            <span>LK</span>
            <span className="text-[7px] opacity-75">Low</span>
          </button>
        </div>
      </div>
    </div>
  );
};
