/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameMode = '3v3_TEAM' | '1v1_ARCADE' | 'LOCAL_2P' | 'ONLINE_PVP' | '3v3_ONLINE_RANDOM' | 'STORY_CAMPAIGN' | 'TRAINING';

export type GameScreen = 'TITLE' | 'SELECT' | 'VERSUS_SCREEN' | 'BATTLE' | 'ONLINE_LOBBY' | 'RANDOM_MATCHMAKING' | 'STORY_MAP' | 'VICTORY' | 'HELP';

export type ActionState =
  | 'IDLE'
  | 'WALK_FWD'
  | 'WALK_BACK'
  | 'DASH_FWD'
  | 'DASH_BACK'
  | 'JUMP_UP'
  | 'JUMP_FWD'
  | 'JUMP_BACK'
  | 'CROUCH'
  | 'GUARD'
  | 'LIGHT_PUNCH'
  | 'HEAVY_PUNCH'
  | 'LIGHT_KICK'
  | 'HEAVY_KICK'
  | 'SPECIAL_1'
  | 'SPECIAL_2'
  | 'SUPER'
  | 'ROLL'
  | 'BLOWBACK'
  | 'HURT'
  | 'HURT_AIR'
  | 'KNOCKDOWN'
  | 'GET_UP';

export interface SpecialMove {
  id: string;
  name: string;
  hindiName: string;
  command: string; // e.g. "↓ ↘ → + Punch"
  description: string;
  type: 'projectile' | 'rush' | 'anti_air' | 'counter' | 'grab';
  damage: number;
}

export interface SuperMove {
  id: string;
  name: string;
  hindiName: string;
  command: string; // e.g. "↓ ↘ → ↓ ↘ → + HP"
  description: string;
  damage: number;
  cinematicQuote: string;
}

export interface FighterDef {
  id: string;
  name: string;
  title: string;
  tagline: string;
  faction: 'Ruling Coalition' | 'Grand Opposition' | 'Dissident Union' | 'Street Muscle' | 'Regional Front' | 'Prime Time Media' | 'Law & Order Front' | 'Central Agency' | 'Deep State Syndicate';
  partyColor: string;
  secondaryColor: string;
  avatarIcon: string; // SVG or icon token
  stats: {
    power: number; // 1-5
    speed: number; // 1-5
    defense: number; // 1-5
    range: number; // 1-5
  };
  specials: SpecialMove[];
  superMove: SuperMove;
  winQuotes: string[];
  loseQuotes: string[];
}

export interface StageDef {
  id: string;
  name: string;
  subtitle: string;
  bgColor: string;
  groundColor: string;
  skyColor: string;
  crowdCheer: string;
}

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Projectile {
  id: number;
  ownerId: 1 | 2;
  x: number;
  y: number;
  vx: number;
  radius: number;
  color: string;
  label: string;
  damage: number;
  hitbox: Rect;
  active: boolean;
  type: 'megaphone' | 'heart' | 'cough' | 'football' | 'paper' | 'generic';
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  shape: 'circle' | 'spark' | 'text' | 'star';
  text?: string;
  rotation?: number;
}

export interface HitEffect {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
  scale: number;
}

export interface InputBufferItem {
  command: string;
  timestamp: number;
}

export interface ActiveFighter {
  playerNumber: 1 | 2;
  def: FighterDef;
  x: number;
  y: number;
  vx: number;
  vy: number;
  facing: 1 | -1; // 1 = right, -1 = left
  state: ActionState;
  stateTimer: number;
  animFrame: number;
  health: number;
  maxHealth: number;
  redHealth: number; // Delayed chip damage bar
  superMeter: number; // 0 to 300 (3 stocks of 100)
  isGrounded: boolean;
  isCrouching: boolean;
  isGuarding: boolean;
  isInvincible: boolean;
  comboCount: number;
  hitstun: number;
  blockstun: number;
  currentAttackDamage: number;
  hasHitInCurrentAttack: boolean;
}

export interface MatchSettings {
  mode: GameMode;
  aiDifficulty: 'EASY' | 'MEDIUM' | 'HARD';
  roundTime: number; // seconds, default 99
  stageId: string;
  p1Team: string[]; // 1 or 3 fighter ids
  p2Team: string[]; // 1 or 3 fighter ids
}

export interface MatchResult {
  winner: 1 | 2;
  winningTeam: FighterDef[];
  maxCombo: number;
  superFinishes: number;
  durationSeconds: number;
  p1DamageDealt: number;
  p2DamageDealt: number;
}
