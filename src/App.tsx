/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { GameMode, GameScreen, MatchResult, MatchSettings } from './types/game';
import { TitleScreen } from './components/TitleScreen';
import { CharacterSelect } from './components/CharacterSelect';
import { BattleArena } from './components/BattleArena';
import { VictoryModal } from './components/VictoryModal';
import { MoveListModal } from './components/MoveListModal';
import { OnlineLobbyModal } from './components/OnlineLobbyModal';
import { RandomMatchmakingModal } from './components/RandomMatchmakingModal';
import { StoryCampaignMap, STORY_STAGES } from './components/StoryCampaignMap';
import { sound } from './audio/soundEngine';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('TITLE');
  const [selectedMode, setSelectedMode] = useState<GameMode>('3v3_TEAM');
  const [matchSettings, setMatchSettings] = useState<MatchSettings | null>(null);
  const [matchResult, setMatchResult] = useState<MatchResult | null>(null);
  const [currentStoryStage, setCurrentStoryStage] = useState<number>(1);
  const [isMoveListOpen, setIsMoveListOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(sound.getMuted());

  // Handle Mode Selection from Title Screen
  const handleSelectMode = (mode: GameMode) => {
    setSelectedMode(mode);
    if (mode === 'ONLINE_PVP') {
      setScreen('ONLINE_LOBBY');
    } else if (mode === '3v3_ONLINE_RANDOM') {
      setScreen('RANDOM_MATCHMAKING');
    } else if (mode === 'STORY_CAMPAIGN') {
      setScreen('STORY_MAP');
    } else {
      setScreen('SELECT');
    }
  };

  // Handle Match Start from Character Select or Modals
  const handleStartMatch = (settings: MatchSettings) => {
    setMatchSettings(settings);
    setScreen('BATTLE');
  };

  // Handle Online Match Start from Online Lobby
  const handleStartOnlineMatch = (myFighterId: string, opponentFighterId: string, isHost: boolean) => {
    const settings: MatchSettings = {
      mode: 'ONLINE_PVP',
      aiDifficulty: 'MEDIUM',
      roundTime: 99,
      stageId: 'jantar_mantar',
      p1Team: [isHost ? myFighterId : opponentFighterId],
      p2Team: [isHost ? opponentFighterId : myFighterId],
    };
    setMatchSettings(settings);
    setScreen('BATTLE');
  };

  // Handle Match Finish
  const handleMatchEnd = (result: MatchResult) => {
    setMatchResult(result);
    setScreen('VICTORY');
  };

  // Handle Next Chapter in Story Mode
  const handleNextStoryChapter = () => {
    const nextStageNum = Math.min(4, currentStoryStage + 1);
    setCurrentStoryStage(nextStageNum);
    try {
      localStorage.setItem('lok_sabha_story_stage', nextStageNum.toString());
    } catch {}

    const stageData = STORY_STAGES.find(s => s.id === nextStageNum);
    if (stageData && matchSettings) {
      sound.playSuperImpact();
      sound.announce(`Chapter ${stageData.id}! ${stageData.name}!`);
      const nextSettings: MatchSettings = {
        mode: 'STORY_CAMPAIGN',
        aiDifficulty: nextStageNum === 4 ? 'HARD' : nextStageNum === 3 ? 'MEDIUM' : 'EASY',
        roundTime: 99,
        stageId: stageData.stageId,
        p1Team: matchSettings.p1Team,
        p2Team: stageData.opponentTeamIds,
      };
      setMatchSettings(nextSettings);
      setScreen('BATTLE');
    } else {
      setScreen('STORY_MAP');
    }
  };

  // Handle Next Opponent Matchmaking for PVP
  const handleFindNextOpponent = () => {
    sound.playSuperImpact();
    setScreen('RANDOM_MATCHMAKING');
  };

  // Handle Rematch / Progression
  const handleRematch = () => {
    if (matchSettings?.mode === 'STORY_CAMPAIGN') {
      setScreen('STORY_MAP');
    } else if (matchSettings) {
      setScreen('BATTLE');
    } else {
      setScreen('SELECT');
    }
  };

  // Toggle Mute
  const handleToggleMute = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <main className="w-screen h-screen bg-[#0b0f19] overflow-hidden select-none">
      {screen === 'TITLE' && (
        <TitleScreen
          onSelectMode={handleSelectMode}
          onOpenGuide={() => setIsMoveListOpen(true)}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
        />
      )}

      {screen === 'SELECT' && (
        <CharacterSelect
          mode={selectedMode}
          onStartMatch={handleStartMatch}
          onBackToTitle={() => setScreen('TITLE')}
        />
      )}

      {screen === 'ONLINE_LOBBY' && (
        <OnlineLobbyModal
          onStartOnlineMatch={handleStartOnlineMatch}
          onBack={() => setScreen('TITLE')}
        />
      )}

      {screen === 'RANDOM_MATCHMAKING' && (
        <RandomMatchmakingModal
          onStartMatch={handleStartMatch}
          onClose={() => setScreen('TITLE')}
        />
      )}

      {screen === 'STORY_MAP' && (
        <StoryCampaignMap
          onStartBattle={(settings, stageNum) => {
            setCurrentStoryStage(stageNum);
            handleStartMatch(settings);
          }}
          onBackToTitle={() => setScreen('TITLE')}
        />
      )}

      {screen === 'BATTLE' && matchSettings && (
        <BattleArena
          settings={matchSettings}
          onMatchEnd={handleMatchEnd}
          onQuitToTitle={() => setScreen('TITLE')}
        />
      )}

      {screen === 'VICTORY' && matchResult && (
        <VictoryModal
          result={matchResult}
          isStoryMode={matchSettings?.mode === 'STORY_CAMPAIGN'}
          storyStage={currentStoryStage}
          isPvP={matchSettings?.mode === 'ONLINE_PVP' || matchSettings?.mode === '3v3_ONLINE_RANDOM'}
          onFindNextOpponent={handleFindNextOpponent}
          onNextChapter={handleNextStoryChapter}
          onRematch={handleRematch}
          onReturnTitle={() => setScreen('TITLE')}
        />
      )}

      {/* Global Move List / Rules Modal */}
      {isMoveListOpen && (
        <MoveListModal onClose={() => setIsMoveListOpen(false)} />
      )}
    </main>
  );
}
