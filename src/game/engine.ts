/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  ActionState,
  ActiveFighter,
  FighterDef,
  HitEffect,
  MatchResult,
  MatchSettings,
  Particle,
  Projectile,
  Rect,
} from '../types/game';
import { FIGHTERS } from './fightersData';
import { STAGES } from './stagesData';
import { SpriteRenderer } from './spriteRenderer';
import { sound } from '../audio/soundEngine';
import { multiplayer, NetworkInputPayload } from '../network/multiplayerSync';

export class FightingEngine {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  public settings: MatchSettings;
  public p1Fighter: ActiveFighter;
  public p2Fighter: ActiveFighter;
  public p1TeamIndex: number = 0;
  public p2TeamIndex: number = 0;
  public p1Wins: number = 0;
  public p2Wins: number = 0;

  public roundTimer: number = 99;
  public roundTimeAccumulator: number = 0;
  public roundState: 'INTRO' | 'FIGHT' | 'ROUND_OVER' | 'MATCH_OVER' = 'INTRO';
  public roundIntroTimer: number = 1.8;
  public roundNumber: number = 1;

  public particles: Particle[] = [];
  public projectiles: Projectile[] = [];
  public hitEffects: HitEffect[] = [];

  // Hitstop & Camera Shake
  public hitstopTimer: number = 0;
  public screenShake: number = 0;

  // Super move freeze
  public superFreezeTimer: number = 0;
  public superFighter: ActiveFighter | null = null;

  // Arena Dimensions
  public arenaWidth: number = 1100;
  public groundY: number = 420;

  // Inputs
  public heldKeys: Set<string> = new Set();
  public justPressedKeys: Set<string> = new Set();
  public touchInputs: { [key: string]: boolean } = {};
  public touchJustPressed: Set<string> = new Set();

  // P2 Touch inputs (for shared tablet / dual touchpads)
  public p2TouchInputs: { [key: string]: boolean } = {};
  public p2TouchJustPressed: Set<string> = new Set();

  // Online network inputs received for P2
  private networkP2Inputs: NetworkInputPayload['p2Keys'] | null = null;

  // Callbacks
  public onStateUpdate?: () => void;
  public onMatchEnd?: (result: MatchResult) => void;

  private matchStartTime: number = Date.now();
  private p1TotalDamage: number = 0;
  private p2TotalDamage: number = 0;
  private maxComboRecorded: number = 0;
  private superFinishes: number = 0;

  constructor(canvas: HTMLCanvasElement, settings: MatchSettings) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.settings = settings;

    // Initialize fighters
    const p1Def = FIGHTERS.find(f => f.id === settings.p1Team[0]) || FIGHTERS[0];
    const p2Def = FIGHTERS.find(f => f.id === settings.p2Team[0]) || FIGHTERS[1];

    this.p1Fighter = this.createFighter(1, p1Def, 260, 1);
    this.p2Fighter = this.createFighter(2, p2Def, 840, -1);

    this.setupWindowListeners();
    this.setupNetworkSync();
  }

  private createFighter(playerNum: 1 | 2, def: FighterDef, x: number, facing: 1 | -1): ActiveFighter {
    const isBoss = def.id === 'boss_corruption';
    const initialHp = isBoss ? 300 : 100;
    return {
      playerNumber: playerNum,
      def,
      x,
      y: this.groundY,
      vx: 0,
      vy: 0,
      facing,
      state: 'IDLE',
      stateTimer: 0,
      animFrame: 0,
      health: initialHp,
      maxHealth: initialHp,
      redHealth: initialHp,
      superMeter: isBoss ? 150 : 50,
      isGrounded: true,
      isCrouching: false,
      isGuarding: false,
      isInvincible: false,
      comboCount: 0,
      hitstun: 0,
      blockstun: 0,
      currentAttackDamage: 0,
      hasHitInCurrentAttack: false,
    };
  }

  private setupWindowListeners() {
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    window.addEventListener('blur', this.handleBlur);
  }

  private setupNetworkSync() {
    if (this.settings.mode === 'ONLINE_PVP') {
      multiplayer.onOpponentInput = (payload) => {
        this.networkP2Inputs = payload.p2Keys;
      };
    }
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
    sound.stopBattleBgm();
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('blur', this.handleBlur);
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    if (!this.heldKeys.has(key)) {
      this.justPressedKeys.add(key);
    }
    this.heldKeys.add(key);
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const key = e.key.toLowerCase();
    this.heldKeys.delete(key);
  };

  private handleBlur = () => {
    this.heldKeys.clear();
    this.justPressedKeys.clear();
    this.touchInputs = {};
    this.touchJustPressed.clear();
    this.p2TouchInputs = {};
    this.p2TouchJustPressed.clear();
  };

  public setTouchInput(key: string, isPressed: boolean, playerNum: 1 | 2 = 1) {
    if (playerNum === 1) {
      if (isPressed && !this.touchInputs[key]) {
        this.touchJustPressed.add(key);
      }
      this.touchInputs[key] = isPressed;
    } else {
      if (isPressed && !this.p2TouchInputs[key]) {
        this.p2TouchJustPressed.add(key);
      }
      this.p2TouchInputs[key] = isPressed;
    }
  }

  public start() {
    this.lastTime = performance.now();
    sound.startBattleBgm(false);
    sound.announce(`Round ${this.roundNumber}! Fight!`);
    this.loop(this.lastTime);
  }

  private loop = (time: number) => {
    const rawDt = (time - this.lastTime) / 1000;
    this.lastTime = time;
    const dt = Math.min(rawDt, 0.05); // Clamp dt to prevent tunneling

    this.update(dt);
    this.render();

    // Clear edge-triggered keys for next frame
    this.justPressedKeys.clear();
    this.touchJustPressed.clear();
    this.p2TouchJustPressed.clear();

    if (this.onStateUpdate) {
      this.onStateUpdate();
    }

    if (this.roundState !== 'MATCH_OVER') {
      this.animFrameId = requestAnimationFrame(this.loop);
    }
  };

  // --- UPDATE SIMULATION ---
  private update(dt: number) {
    // Hitstop freeze (for impactful punch feel)
    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      return;
    }

    // Super move freeze
    if (this.superFreezeTimer > 0) {
      this.superFreezeTimer -= dt;
      if (this.superFreezeTimer <= 0) {
        this.superFighter = null;
      }
      return;
    }

    // Screen shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Round intro countdown
    if (this.roundState === 'INTRO') {
      this.roundIntroTimer -= dt;
      if (this.roundIntroTimer <= 0) {
        this.roundState = 'FIGHT';
      }
      return;
    }

    // Round Timer in FIGHT state
    if (this.roundState === 'FIGHT') {
      this.roundTimeAccumulator += dt;
      if (this.roundTimeAccumulator >= 1) {
        this.roundTimeAccumulator -= 1;
        this.roundTimer = Math.max(0, this.roundTimer - 1);
        if (this.roundTimer === 0) {
          this.handleTimeOver();
        }
      }
    }

    // Red Health Bar Catch-up
    [this.p1Fighter, this.p2Fighter].forEach(f => {
      if (f.redHealth > f.health) {
        f.redHealth = Math.max(f.health, f.redHealth - dt * 18);
      }
    });

    // State Watchdog: ensure no fighter is stuck in attack state once stateTimer expires
    [this.p1Fighter, this.p2Fighter].forEach(f => {
      if (this.isAttackingState(f.state) && f.stateTimer <= 0) {
        f.state = f.isCrouching ? 'CROUCH' : 'IDLE';
        f.vx = 0;
      }
    });

    // Update Player 1 Input & Actions
    if (this.roundState === 'FIGHT') {
      this.processPlayerInput(this.p1Fighter, dt);

      // Player 2 control mode: AI vs Local 2P vs Online PvP
      if (this.settings.mode === 'LOCAL_2P') {
        this.processLocalP2Input(this.p2Fighter, dt);
      } else if (this.settings.mode === 'ONLINE_PVP') {
        this.processNetworkP2Input(this.p2Fighter, dt);
      } else {
        this.processAIInput(this.p2Fighter, dt);
      }
    }

    // Physics & Movement
    this.updateFighterPhysics(this.p1Fighter, dt);
    this.updateFighterPhysics(this.p2Fighter, dt);

    // Pushback & Facing
    this.handlePushbackAndFacing();

    // Hitbox & Hurtbox Collisions
    if (this.roundState === 'FIGHT') {
      this.checkCombatCollisions();
    }

    // Update Projectiles
    this.updateProjectiles(dt);

    // Update Particles & Hit Sparks
    this.updateParticles(dt);
  }

  // --- PLAYER 1 INPUT PROCESSING ---
  private processPlayerInput(f: ActiveFighter, dt: number) {
    if (
      f.hitstun > 0 ||
      f.blockstun > 0 ||
      f.state === 'KNOCKDOWN' ||
      f.state === 'GET_UP' ||
      this.isAttackingState(f.state) ||
      this.superFreezeTimer > 0
    ) {
      return;
    }

    const isLeft = this.heldKeys.has('a') || (this.settings.mode !== 'LOCAL_2P' && this.heldKeys.has('arrowleft')) || this.touchInputs['LEFT'];
    const isRight = this.heldKeys.has('d') || (this.settings.mode !== 'LOCAL_2P' && this.heldKeys.has('arrowright')) || this.touchInputs['RIGHT'];
    const isUp = this.heldKeys.has('w') || (this.settings.mode !== 'LOCAL_2P' && this.heldKeys.has('arrowup')) || this.touchInputs['UP'];
    const isDown = this.heldKeys.has('s') || (this.settings.mode !== 'LOCAL_2P' && this.heldKeys.has('arrowdown')) || this.touchInputs['DOWN'];

    const lpJust = this.justPressedKeys.has('j') || this.touchJustPressed.has('LP');
    const hpJust = this.justPressedKeys.has('u') || this.touchJustPressed.has('HP');
    const lkJust = this.justPressedKeys.has('k') || this.touchJustPressed.has('LK');
    const hkJust = this.justPressedKeys.has('i') || this.touchJustPressed.has('HK');
    const rollJust = this.justPressedKeys.has(' ') || this.touchJustPressed.has('ROLL');
    const superJust = this.justPressedKeys.has('q') || this.touchJustPressed.has('SUPER');

    // Broadcast input if online host
    if (this.settings.mode === 'ONLINE_PVP' && multiplayer.isHost) {
      multiplayer.sendInput({
        p2Keys: {
          isLeft, isRight, isUp, isDown,
          lpJust, hpJust, lkJust, hkJust, rollJust, superJust,
        },
      });
    }

    this.executeFighterAction(f, isLeft, isRight, isUp, isDown, lpJust, hpJust, lkJust, hkJust, rollJust, superJust);
  }

  // --- LOCAL PLAYER 2 INPUT PROCESSING (SAME KEYBOARD / SCREEN) ---
  private processLocalP2Input(f: ActiveFighter, dt: number) {
    if (
      f.hitstun > 0 ||
      f.blockstun > 0 ||
      f.state === 'KNOCKDOWN' ||
      f.state === 'GET_UP' ||
      this.isAttackingState(f.state) ||
      this.superFreezeTimer > 0
    ) {
      return;
    }

    // P2 Keyboard Keys: Arrow keys + B/N/G/H/M/Y or Numpad
    const isLeft = this.heldKeys.has('arrowleft') || this.p2TouchInputs['LEFT'];
    const isRight = this.heldKeys.has('arrowright') || this.p2TouchInputs['RIGHT'];
    const isUp = this.heldKeys.has('arrowup') || this.p2TouchInputs['UP'];
    const isDown = this.heldKeys.has('arrowdown') || this.p2TouchInputs['DOWN'];

    const lpJust = this.justPressedKeys.has('b') || this.justPressedKeys.has('1') || this.p2TouchJustPressed.has('LP');
    const lkJust = this.justPressedKeys.has('n') || this.justPressedKeys.has('2') || this.p2TouchJustPressed.has('LK');
    const hpJust = this.justPressedKeys.has('g') || this.justPressedKeys.has('4') || this.p2TouchJustPressed.has('HP');
    const hkJust = this.justPressedKeys.has('h') || this.justPressedKeys.has('5') || this.p2TouchJustPressed.has('HK');
    const rollJust = this.justPressedKeys.has('m') || this.justPressedKeys.has('0') || this.p2TouchJustPressed.has('ROLL');
    const superJust = this.justPressedKeys.has('y') || this.justPressedKeys.has('7') || this.p2TouchJustPressed.has('SUPER');

    this.executeFighterAction(f, isLeft, isRight, isUp, isDown, lpJust, hpJust, lkJust, hkJust, rollJust, superJust);
  }

  // --- ONLINE NETWORK PLAYER 2 PROCESSING ---
  private processNetworkP2Input(f: ActiveFighter, dt: number) {
    if (!this.networkP2Inputs) return;
    const inp = this.networkP2Inputs;
    this.executeFighterAction(
      f,
      inp.isLeft,
      inp.isRight,
      inp.isUp,
      inp.isDown,
      inp.lpJust,
      inp.hpJust,
      inp.lkJust,
      inp.hkJust,
      inp.rollJust,
      inp.superJust
    );
    // Reset edge-triggered network inputs
    inp.lpJust = false;
    inp.hpJust = false;
    inp.lkJust = false;
    inp.hkJust = false;
    inp.rollJust = false;
    inp.superJust = false;
  }

  // --- UNIFIED FIGHTER ACTION CONTROLLER ---
  private executeFighterAction(
    f: ActiveFighter,
    isLeft: boolean,
    isRight: boolean,
    isUp: boolean,
    isDown: boolean,
    lpJust: boolean,
    hpJust: boolean,
    lkJust: boolean,
    hkJust: boolean,
    rollJust: boolean,
    superJust: boolean
  ) {
    const awayDir = (f.facing === 1) ? isLeft : isRight;
    const fwdDir = (f.facing === 1) ? isRight : isLeft;

    // 1. Super Move Activation (28-32 fixed damage)
    if (superJust && f.superMeter >= 100 && f.isGrounded) {
      this.triggerSuperMove(f);
      return;
    }

    // 2. Emergency Roll (Dodge)
    if (rollJust && f.isGrounded && f.state !== 'ROLL') {
      this.triggerRoll(f, isLeft ? -1 : 1);
      return;
    }

    // Check special move combo motion: Forward + Down + Punch or Down + Forward + Punch
    const movingForward = (f.facing === 1 && isRight) || (f.facing === -1 && isLeft);
    if (isDown && movingForward && (lpJust || hpJust) && f.isGrounded) {
      this.triggerSpecial(f, 1);
      return;
    }
    if (isDown && movingForward && (lkJust || hkJust) && f.isGrounded) {
      this.triggerSpecial(f, 2);
      return;
    }

    // 3. Crouching Attacks ("Sitting" punches and kicks)
    if (isDown && f.isGrounded) {
      f.isCrouching = true;
      f.vx = 0;
      f.isGuarding = awayDir; // Only guard while crouching if explicitly holding away

      if (lpJust) {
        this.startAttack(f, 'LIGHT_PUNCH', 0.2, 4); // Fixed 4 damage
        return;
      }
      if (hpJust) {
        this.startAttack(f, 'HEAVY_PUNCH', 0.35, 8); // Fixed 8 damage
        return;
      }
      if (lkJust) {
        this.startAttack(f, 'LIGHT_KICK', 0.22, 5); // Fixed 5 damage
        return;
      }
      if (hkJust) {
        this.startAttack(f, 'HEAVY_KICK', 0.38, 9); // Fixed 9 damage (low sweep)
        return;
      }

      f.state = 'CROUCH';
      return;
    } else {
      f.isCrouching = false;
    }

    // 4. Standing Normal Attacks (BALANCED FIXED DAMAGE!)
    if (lpJust) {
      this.startAttack(f, 'LIGHT_PUNCH', 0.2, 4); // Fixed 4 damage
      return;
    }
    if (hpJust) {
      this.startAttack(f, 'HEAVY_PUNCH', 0.36, 8); // Fixed 8 damage
      return;
    }
    if (lkJust) {
      this.startAttack(f, 'LIGHT_KICK', 0.22, 5); // Fixed 5 damage
      return;
    }
    if (hkJust) {
      this.startAttack(f, 'HEAVY_KICK', 0.4, 9); // Fixed 9 damage
      return;
    }

    // 5. Jump
    if (isUp && f.isGrounded) {
      f.vy = -560;
      f.isGrounded = false;
      if (isLeft) f.vx = -180;
      else if (isRight) f.vx = 180;
      else f.vx = 0;
      f.state = 'JUMP_UP';
      sound.playWhoosh(false);
      return;
    }

    // 6. Ground Movement (Walk / Guard)
    if (f.isGrounded && !this.isAttackingState(f.state) && f.state !== 'ROLL') {
      if (fwdDir) {
        f.vx = f.facing * 180;
        f.state = 'WALK_FWD';
        f.isGuarding = false;
      } else if (awayDir) {
        f.vx = -f.facing * 130;
        f.state = 'WALK_BACK';
        f.isGuarding = true; // Auto-guard while walking backward
      } else {
        f.vx = 0;
        f.state = 'IDLE';
        f.isGuarding = false;
      }
    }
  }

  // --- AI INPUT CONTROLLER ---
  private processAIInput(f: ActiveFighter, dt: number) {
    if (
      f.hitstun > 0 ||
      f.blockstun > 0 ||
      f.state === 'KNOCKDOWN' ||
      f.state === 'GET_UP' ||
      this.isAttackingState(f.state) ||
      this.superFreezeTimer > 0
    ) {
      return;
    }

    const dist = Math.abs(f.x - this.p1Fighter.x);
    const p1Attacking = this.isAttackingState(this.p1Fighter.state);

    // AI Difficulty settings
    const diff = this.settings.aiDifficulty;
    const blockChance = diff === 'HARD' ? 0.7 : diff === 'MEDIUM' ? 0.45 : 0.2;
    const attackChance = diff === 'HARD' ? 0.75 : diff === 'MEDIUM' ? 0.45 : 0.25;

    // 1. Guard against incoming attacks
    if (p1Attacking && dist < 170 && Math.random() < blockChance) {
      f.isGuarding = true;
      f.vx = -f.facing * 90;
      f.state = 'GUARD';
      return;
    }
    f.isGuarding = false;

    // 2. Super Move when meter full
    if (f.superMeter >= 100 && dist < 220 && Math.random() < 0.02) {
      this.triggerSuperMove(f);
      return;
    }

    // 3. Specials
    if (dist > 260 && Math.random() < 0.035) {
      this.triggerSpecial(f, 1);
      return;
    }

    // 4. Close combat attacks & Combos (BALANCED DAMAGE)
    const inCloseCombat = dist < 125;
    const effectiveAttackChance = dist < 85 ? Math.max(attackChance, 0.72) : attackChance;
    if (inCloseCombat && f.isGrounded && Math.random() < effectiveAttackChance) {
      // Ensure AI faces opponent before starting the attack
      f.facing = (f.x < this.p1Fighter.x) ? 1 : -1;
      const roll = Math.random();
      if (roll < 0.35) {
        this.startAttack(f, 'LIGHT_PUNCH', 0.2, 4);
      } else if (roll < 0.65) {
        this.startAttack(f, 'LIGHT_KICK', 0.22, 5);
      } else if (roll < 0.85) {
        this.startAttack(f, 'HEAVY_PUNCH', 0.36, 8);
      } else {
        this.startAttack(f, 'HEAVY_KICK', 0.4, 9);
      }
      return;
    }

    // 5. Anti-air jump
    if (!this.p1Fighter.isGrounded && dist < 140 && Math.random() < 0.04 && f.isGrounded) {
      f.vy = -520;
      f.isGrounded = false;
      f.vx = f.facing * 120;
      f.state = 'JUMP_UP';
      return;
    }

    // 6. Navigation toward or away
    if (f.isGrounded && !this.isAttackingState(f.state)) {
      if (dist > 130) {
        f.vx = f.facing * 145;
        f.state = 'WALK_FWD';
      } else if (dist < 48) {
        f.vx = -f.facing * 75;
        f.state = 'WALK_BACK';
      } else {
        f.vx = 0;
        f.state = 'IDLE';
      }
    }
  }

  // --- ACTIONS & COMBAT ENGINE ---

  private isAttackingState(state: ActionState): boolean {
    return (
      state === 'LIGHT_PUNCH' ||
      state === 'HEAVY_PUNCH' ||
      state === 'LIGHT_KICK' ||
      state === 'HEAVY_KICK' ||
      state === 'SPECIAL_1' ||
      state === 'SPECIAL_2' ||
      state === 'SUPER' ||
      state === 'BLOWBACK'
    );
  }

  private startAttack(f: ActiveFighter, state: ActionState, duration: number, damage: number) {
    f.state = state;
    f.stateTimer = duration;
    f.currentAttackDamage = damage;
    f.hasHitInCurrentAttack = false;
    f.isGuarding = false; // Strictly deactivate guard while attacking

    // Step-in forward momentum so punches and kicks connect cleanly
    if (f.isGrounded) {
      const stepSpeed = state.includes('SPECIAL') ? 170 : state.includes('HEAVY') ? 130 : 90;
      f.vx = f.facing * stepSpeed;
    }
    sound.playWhoosh(state.includes('HEAVY'));
  }

  private triggerRoll(f: ActiveFighter, dir: number) {
    f.state = 'ROLL';
    f.stateTimer = 0.42;
    f.isInvincible = true;
    f.isGuarding = false;
    f.vx = dir * 280;
    sound.playDash();
    this.createDustPuff(f.x, f.y);
  }

  private triggerSpecial(f: ActiveFighter, slot: 1 | 2) {
    const special = f.def.specials[slot - 1];
    if (!special) return;

    f.state = (slot === 1) ? 'SPECIAL_1' : 'SPECIAL_2';
    f.stateTimer = 0.55;
    f.isGuarding = false;
    // Fixed balanced special damage: 13-16 HP
    f.currentAttackDamage = Math.min(16, special.damage);
    f.hasHitInCurrentAttack = false;

    // Character-specific viral sound / Real voice lines
    if (f.def.id === 'didi_khela') {
      sound.playDidiRambaRamba();
    } else if (f.def.id === 'muffler_babu') {
      sound.playMufflerCough();
    } else if (f.def.id === 'netaji_vikas') {
      sound.playNetajiMitron();
    } else if (f.def.id === 'yuva_rahul') {
      sound.playRahulKhatakhat();
    } else if (f.def.id === 'bahubali_goon') {
      sound.playBahubaliGaddari();
    } else if (f.def.id === 'arnab_prime') {
      sound.playAnchorNationWantsToKnow();
    } else if (f.def.id === 'bulldozer_baba') {
      sound.playBulldozerHorn();
    } else if (f.def.id === 'raid_raja') {
      sound.playPoliceSiren();
    } else if (f.def.id === 'boss_corruption') {
      sound.playBossLaughter();
    }

    // Projectile spawning for projectile characters
    if (special.type === 'projectile') {
      setTimeout(() => {
        if (this.roundState === 'MATCH_OVER') return;
        this.spawnProjectile(f, special);
      }, 140);
    } else {
      // Rush or uppercut forward momentum
      f.vx = f.facing * 290;
      sound.playWhoosh(true);
    }

    sound.playHit(true);
    this.createDustPuff(f.x, f.y);
  }

  private triggerSuperMove(f: ActiveFighter) {
    f.superMeter = Math.max(0, f.superMeter - 100);
    f.state = 'SUPER';
    f.stateTimer = 0.85; // Clean 0.85s duration
    f.currentAttackDamage = 30;
    f.hasHitInCurrentAttack = false;
    f.isGuarding = false;

    this.superFreezeTimer = 0.28; // Snappy 0.28s freeze
    this.superFighter = f;
    this.screenShake = 16;

    sound.playSuperFlash();

    // Trigger character-specific real voice lines on Super
    if (f.def.id === 'didi_khela') {
      sound.playDidiRambaRamba();
    } else if (f.def.id === 'muffler_babu') {
      sound.playMufflerCough();
    } else if (f.def.id === 'netaji_vikas') {
      sound.playNetajiMitron();
    } else if (f.def.id === 'yuva_rahul') {
      sound.playRahulKhatakhat();
    } else if (f.def.id === 'bahubali_goon') {
      sound.playBahubaliGaddari();
    } else if (f.def.id === 'arnab_prime') {
      sound.playAnchorNationWantsToKnow();
    } else if (f.def.id === 'bulldozer_baba') {
      sound.playBulldozerHorn();
    } else if (f.def.id === 'raid_raja') {
      sound.playPoliceSiren();
    } else if (f.def.id === 'boss_corruption') {
      sound.playBossLaughter();
    } else {
      sound.announce(`${f.def.name}! ${f.def.superMove.name}!`);
    }

    // Golden burst particles
    for (let i = 0; i < 20; i++) {
      this.particles.push({
        x: f.x,
        y: f.y - 70,
        vx: (Math.random() - 0.5) * 350,
        vy: (Math.random() - 0.5) * 350,
        life: 0.6,
        maxLife: 0.6,
        size: Math.random() * 8 + 4,
        color: '#facc15',
        shape: 'spark',
      });
    }

    // Controlled forward dash
    setTimeout(() => {
      if (this.roundState !== 'MATCH_OVER' && f.state === 'SUPER') {
        f.vx = f.facing * 340;
      }
    }, 280);
  }

  private spawnProjectile(f: ActiveFighter, special: any) {
    const projId = Date.now() + Math.random();
    const vx = f.facing * 380;
    const spawnX = f.x + f.facing * 45;
    const spawnY = f.y - 65;

    let projType: 'megaphone' | 'heart' | 'cough' | 'football' | 'paper' | 'generic' = 'generic';
    let color = f.def.partyColor;

    if (f.def.id === 'netaji_vikas') {
      projType = 'megaphone';
      color = '#ea580c';
      sound.playMegaphoneWave();
    } else if (f.def.id === 'yuva_rahul') {
      projType = 'heart';
      color = '#ef4444';
      sound.playWhoosh(false);
    } else if (f.def.id === 'muffler_babu') {
      projType = 'cough';
      color = '#0284c7';
      sound.playWhoosh(false);
    } else if (f.def.id === 'didi_khela') {
      projType = 'football';
      color = '#10b981';
      sound.playWhoosh(true);
    } else if (f.def.id === 'arnab_prime') {
      projType = 'paper';
      color = '#dc2626';
      sound.playMegaphoneWave();
    } else if (f.def.id === 'raid_raja') {
      projType = 'paper'; // Yellow warrant summons paper
      color = '#eab308';
      sound.playWhoosh(false);
    }

    this.projectiles.push({
      id: projId,
      ownerId: f.playerNumber,
      x: spawnX,
      y: spawnY,
      vx,
      radius: 20,
      color,
      label: special.name,
      damage: 12, // Fixed balanced projectile damage: 12 HP
      hitbox: { x: spawnX - 20, y: spawnY - 20, width: 40, height: 40 },
      active: true,
      type: projType,
    });
  }

  // --- PHYSICS & COLLISION ---
  private updateFighterPhysics(f: ActiveFighter, dt: number) {
    f.animFrame++;

    // Gravity
    if (!f.isGrounded) {
      f.vy += 1200 * dt;
    }

    // Apply Velocity
    f.x += f.vx * dt;
    f.y += f.vy * dt;

    // Floor Collision
    if (f.y >= this.groundY) {
      f.y = this.groundY;
      f.vy = 0;
      if (!f.isGrounded) {
        f.isGrounded = true;
        this.createDustPuff(f.x, f.y);
      }
    }

    // Screen Bounds
    const halfWidth = 35;
    if (f.x < halfWidth) f.x = halfWidth;
    if (f.x > this.arenaWidth - halfWidth) f.x = this.arenaWidth - halfWidth;

    // State Timer Countdown
    if (f.stateTimer > 0) {
      f.stateTimer -= dt;
      if (f.stateTimer <= 0) {
        if (f.state === 'ROLL') {
          f.isInvincible = false;
        }
        f.state = f.isCrouching ? 'CROUCH' : 'IDLE';
        f.vx = 0;
      }
    }

    // Hitstun / Blockstun decay
    if (f.hitstun > 0) {
      f.hitstun -= dt;
      if (f.hitstun <= 0) {
        f.state = f.isCrouching ? 'CROUCH' : 'IDLE';
        f.comboCount = 0;
      }
    }
    if (f.blockstun > 0) {
      f.blockstun -= dt;
      if (f.blockstun <= 0) {
        f.state = f.isCrouching ? 'CROUCH' : 'IDLE';
      }
    }
  }

  private handlePushbackAndFacing() {
    // Face each other unless in middle of forward attack or roll
    if (this.p1Fighter.state !== 'ROLL' && !this.isAttackingState(this.p1Fighter.state)) {
      this.p1Fighter.facing = (this.p1Fighter.x < this.p2Fighter.x) ? 1 : -1;
    }
    if (this.p2Fighter.state !== 'ROLL' && !this.isAttackingState(this.p2Fighter.state)) {
      this.p2Fighter.facing = (this.p2Fighter.x < this.p1Fighter.x) ? 1 : -1;
    }

    // Character body overlap pushback
    const dist = Math.abs(this.p1Fighter.x - this.p2Fighter.x);
    const minDist = 48;
    if (dist < minDist) {
      const overlap = (minDist - dist) / 2;
      if (this.p1Fighter.x < this.p2Fighter.x) {
        this.p1Fighter.x -= overlap;
        this.p2Fighter.x += overlap;
      } else {
        this.p1Fighter.x += overlap;
        this.p2Fighter.x -= overlap;
      }
    }

    // Auto-align facing when in point-blank proximity before hit registration
    if (dist <= 75) {
      if (!this.p1Fighter.hasHitInCurrentAttack && this.p1Fighter.state !== 'ROLL') {
        this.p1Fighter.facing = (this.p1Fighter.x < this.p2Fighter.x) ? 1 : -1;
      }
      if (!this.p2Fighter.hasHitInCurrentAttack && this.p2Fighter.state !== 'ROLL') {
        this.p2Fighter.facing = (this.p2Fighter.x < this.p1Fighter.x) ? 1 : -1;
      }
    }
  }

  // Combat Collisions (Attacks -> Opponent Hurtbox)
  private checkCombatCollisions() {
    this.checkAttackHit(this.p1Fighter, this.p2Fighter);
    this.checkAttackHit(this.p2Fighter, this.p1Fighter);
  }

  private checkAttackHit(attacker: ActiveFighter, defender: ActiveFighter) {
    const isAttacking = this.isAttackingState(attacker.state);
    if (!isAttacking || attacker.hasHitInCurrentAttack) return;
    if (defender.isInvincible || defender.state === 'ROLL') return;

    // Calculate attack reach
    let reach = 95;
    if (attacker.state.includes('HEAVY')) reach = 125;
    if (attacker.state.includes('SPECIAL')) reach = 150;
    if (attacker.state === 'SUPER') reach = 185;

    const dist = Math.abs(attacker.x - defender.x);

    // If close range scuffle, guarantee attacker faces defender
    if (dist <= 85) {
      attacker.facing = attacker.x <= defender.x ? 1 : -1;
    }

    // Attack box accounts for standing vs crouching heights and covers attacker body depth
    const attackY = Math.min(attacker.y - 120, defender.y - 120);
    const attackHeight = 135;

    const attackMinX = attacker.facing === 1 ? attacker.x - 45 : attacker.x - reach;
    const attackMaxX = attacker.facing === 1 ? attacker.x + reach : attacker.x + 45;

    const attackBox: Rect = {
      x: attackMinX,
      y: attackY,
      width: Math.max(reach, attackMaxX - attackMinX),
      height: attackHeight,
    };

    // Defender hurtbox accounts for crouching vs standing
    const defHeight = defender.isCrouching ? 85 : 125;
    const defY = defender.y - defHeight;

    const defenderHurtbox: Rect = {
      x: defender.x - 45,
      y: defY,
      width: 90,
      height: defHeight,
    };

    // Proximity check: at close range (dist <= 85) and grounded/near-ground, connect guaranteed!
    const isCloseRange = dist <= 85 && Math.abs(attacker.y - defender.y) < 75;
    const isHit = isCloseRange || this.rectsIntersect(attackBox, defenderHurtbox);

    if (isHit) {
      attacker.hasHitInCurrentAttack = true; // PREVENTS MULTIPLE DAMAGE TICKS!
      this.applyHit(attacker, defender, attacker.currentAttackDamage, attacker.state.includes('HEAVY') || attacker.state === 'SUPER');
    }
  }

  private applyHit(attacker: ActiveFighter, defender: ActiveFighter, rawDamage: number, isHeavy: boolean) {
    const hitX = (attacker.x + defender.x) / 2;
    const hitY = defender.y - 65;

    // Check Guard: ONLY active if defender is facing the attack, holding back, NOT in an attack, and not in hitstun
    const facingAttacker = (defender.x - attacker.x) * defender.facing < 0;
    const canBlock = defender.isGuarding && facingAttacker && !this.isAttackingState(defender.state) && defender.hitstun <= 0;

    if (canBlock) {
      // 25% chip damage on block
      const chipDamage = Math.max(1, Math.round(rawDamage * 0.25));
      defender.health = Math.max(0, defender.health - chipDamage);
      defender.blockstun = 0.2;
      defender.state = 'GUARD';
      defender.vx = attacker.facing * 120; // Guard pushback
      sound.playBlock();
      sound.playAayein(); // Viral "Aayein?" sound on blocked parry!

      this.hitEffects.push({
        x: hitX,
        y: hitY,
        text: 'BLOCKED! (AAYEIN?)',
        life: 0.35,
        color: '#38bdf8',
        scale: 1.0,
      });
      return;
    }

    // Boss Corruption attributes: 25% damage mitigation + super armor on heavy attacks
    if (defender.def.id === 'boss_corruption') {
      rawDamage = Math.max(1, Math.round(rawDamage * 0.75));
    }

    // Boss Super Armor: Does not flinch or enter HURT state while performing heavy or super attacks
    const hasSuperArmor = defender.def.id === 'boss_corruption' && (defender.state.includes('HEAVY') || defender.state === 'SUPER');
    if (hasSuperArmor) {
      defender.health = Math.max(0, defender.health - rawDamage);
      this.hitEffects.push({
        x: hitX,
        y: hitY - 20,
        text: 'SUPER ARMOR!',
        life: 0.4,
        color: '#c084fc',
        scale: 1.2,
      });
      sound.playBlock();
      if (defender.health <= 0) {
        this.handleKnockout(attacker, defender);
      }
      return;
    }

    // Successful Clean Hit (FIXED CONTROLLED DAMAGE)
    defender.health = Math.max(0, defender.health - rawDamage);
    defender.comboCount++;
    if (defender.comboCount > this.maxComboRecorded) {
      this.maxComboRecorded = defender.comboCount;
    }

    // Build Super Meter
    attacker.superMeter = Math.min(300, attacker.superMeter + 14);
    defender.superMeter = Math.min(300, defender.superMeter + 10);

    // Track damage stats
    if (attacker.playerNumber === 1) this.p1TotalDamage += rawDamage;
    else this.p2TotalDamage += rawDamage;

    // Hitstop & Screen Shake
    this.hitstopTimer = isHeavy ? 0.07 : 0.035;
    this.screenShake = isHeavy ? 8 : 3;

    // Knockback with Corner Wall Rebound
    const isLeftCorner = defender.x <= 75;
    const isRightCorner = defender.x >= this.arenaWidth - 75;

    if (isLeftCorner) {
      defender.x = 95;
      defender.vx = 140; // Wall rebound inward toward center stage
      attacker.vx = 0;   // Stop attacker rush
    } else if (isRightCorner) {
      defender.x = this.arenaWidth - 95;
      defender.vx = -140; // Wall rebound inward toward center stage
      attacker.vx = 0;    // Stop attacker rush
    } else {
      defender.vx = attacker.facing * (isHeavy ? 240 : 130);
    }

    defender.hitstun = isHeavy ? 0.38 : 0.22;
    defender.state = 'HURT';

    if (isHeavy) {
      defender.vy = -160;
      defender.isGrounded = false;
      // Viral "Systumm" or "Gaddari Karbe" audio sting on heavy impact
      if (Math.random() > 0.5) {
        sound.playSystumm();
      } else {
        sound.playGaddari();
      }
    } else {
      sound.playHit(false);
    }

    // Play "Moye Moye" when a fighter reaches critical low health (< 20%)
    if (defender.health > 0 && defender.health <= 20 && defender.comboCount === 1) {
      sound.playMoyeMoye();
    }

    // Dynamic Indian Masala Comic Words
    const comicWords = ['DHISHUM!', 'DHAMAKA!', 'FATAK!', 'KHELA!', 'ARREST!', '56 INCH!', 'SYSTUMM!'];
    const chosenWord = comicWords[Math.floor(Math.random() * comicWords.length)];

    this.hitEffects.push({
      x: hitX,
      y: hitY,
      text: isHeavy ? chosenWord : 'HIT!',
      life: 0.45,
      color: isHeavy ? '#ef4444' : '#facc15',
      scale: isHeavy ? 1.3 : 0.95,
    });

    // Particle Sparks
    for (let i = 0; i < (isHeavy ? 12 : 6); i++) {
      this.particles.push({
        x: hitX,
        y: hitY,
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 0.5) * 300,
        life: 0.35,
        maxLife: 0.35,
        size: Math.random() * 5 + 2,
        color: isHeavy ? '#f97316' : '#fde047',
        shape: 'spark',
      });
    }

    // Check KO
    if (defender.health <= 0) {
      this.handleKnockout(attacker, defender);
    }
  }

  private handleKnockout(winner: ActiveFighter, loser: ActiveFighter) {
    this.roundState = 'ROUND_OVER';
    this.superFreezeTimer = 0;
    this.superFighter = null;
    winner.vx = 0;

    loser.state = 'KNOCKDOWN';
    loser.vy = -340;
    loser.vx = -loser.facing * 180;
    loser.isGrounded = false;

    this.screenShake = 16;
    this.hitstopTimer = 0.12;
    sound.playSuperImpact();
    sound.announce('K.O.!');
    sound.playMoyeMoye(); // Viral "Moye Moye" plays on KO!

    if (winner.state === 'SUPER') {
      this.superFinishes++;
    }

    // Fast, crisp arcade round transition (1.1s standard)
    setTimeout(() => {
      this.advanceRound(winner.playerNumber);
    }, 1100);
  }

  private advanceRound(roundWinnerNum: 1 | 2) {
    if (roundWinnerNum === 1) this.p1Wins++;
    else this.p2Wins++;

    // Check 3v3 KOF Team Mode Elimination (Standard 3v3, Online Random 3v3, and Story Mode)
    const is3v3Mode =
      this.settings.mode === '3v3_TEAM' ||
      this.settings.mode === '3v3_ONLINE_RANDOM' ||
      this.settings.mode === 'STORY_CAMPAIGN';

    if (is3v3Mode) {
      if (roundWinnerNum === 1) {
        this.p2TeamIndex++;
        if (this.p2TeamIndex >= this.settings.p2Team.length) {
          this.endMatch(1);
          return;
        }
      } else {
        this.p1TeamIndex++;
        if (this.p1TeamIndex >= this.settings.p1Team.length) {
          this.endMatch(2);
          return;
        }
      }

      // Next reserve fighter enters the ring
      this.roundNumber++;
      this.resetRoundForNextFighter();
    } else {
      // 1v1 / Local 2P / Online PvP Mode (Best of 3)
      if (this.p1Wins >= 2) {
        this.endMatch(1);
      } else if (this.p2Wins >= 2) {
        this.endMatch(2);
      } else {
        this.roundNumber++;
        this.resetRoundStandard();
      }
    }
  }

  private resetRoundForNextFighter() {
    this.roundState = 'INTRO';
    this.roundIntroTimer = 1.8;
    this.roundTimer = this.settings.roundTime;

    // Load next fighter for the team that lost
    const nextP1Def = FIGHTERS.find(f => f.id === this.settings.p1Team[this.p1TeamIndex]) || FIGHTERS[0];
    const nextP2Def = FIGHTERS.find(f => f.id === this.settings.p2Team[this.p2TeamIndex]) || FIGHTERS[1];

    if (this.p1Fighter.health <= 0) {
      this.p1Fighter = this.createFighter(1, nextP1Def, 260, 1);
    } else {
      // Surviving fighter gets 20% health restored + retains meter
      this.p1Fighter.health = Math.min(100, this.p1Fighter.health + 20);
      this.p1Fighter.redHealth = this.p1Fighter.health;
      this.p1Fighter.x = 260;
    }

    if (this.p2Fighter.health <= 0) {
      this.p2Fighter = this.createFighter(2, nextP2Def, 840, -1);
    } else {
      this.p2Fighter.health = Math.min(100, this.p2Fighter.health + 20);
      this.p2Fighter.redHealth = this.p2Fighter.health;
      this.p2Fighter.x = 840;
    }

    this.projectiles = [];
    sound.announce(`Round ${this.roundNumber}! Ready, Fight!`);
  }

  private resetRoundStandard() {
    this.roundState = 'INTRO';
    this.roundIntroTimer = 1.8;
    this.roundTimer = this.settings.roundTime;

    this.p1Fighter.health = 100;
    this.p1Fighter.redHealth = 100;
    this.p1Fighter.x = 260;
    this.p1Fighter.y = this.groundY;
    this.p1Fighter.state = 'IDLE';

    this.p2Fighter.health = 100;
    this.p2Fighter.redHealth = 100;
    this.p2Fighter.x = 840;
    this.p2Fighter.y = this.groundY;
    this.p2Fighter.state = 'IDLE';

    this.projectiles = [];
    sound.announce(`Round ${this.roundNumber}! Ready, Fight!`);
  }

  private handleTimeOver() {
    this.roundState = 'ROUND_OVER';
    sound.announce('Time Over!');

    const winner = (this.p1Fighter.health > this.p2Fighter.health) ? 1 : (this.p2Fighter.health > this.p1Fighter.health) ? 2 : 1;
    setTimeout(() => {
      this.advanceRound(winner);
    }, 1100);
  }

  private endMatch(winner: 1 | 2) {
    this.roundState = 'MATCH_OVER';
    sound.stopBattleBgm();
    sound.announce(winner === 1 ? 'Player 1 Wins! Victory!' : 'Player 2 Wins!');
    sound.playJustLookingLikeAWow(); // "So beautiful, so elegant, just looking like a wow" fanfare!

    // Save story campaign progress if player 1 won
    if (this.settings.mode === 'STORY_CAMPAIGN' && winner === 1) {
      try {
        const cur = parseInt(localStorage.getItem('lok_sabha_story_stage') || '1', 10);
        localStorage.setItem('lok_sabha_story_stage', Math.min(4, cur + 1).toString());
      } catch {}
    }

    const winningTeam = (winner === 1 ? this.settings.p1Team : this.settings.p2Team).map(
      id => FIGHTERS.find(f => f.id === id) || FIGHTERS[0]
    );

    if (this.onMatchEnd) {
      this.onMatchEnd({
        winner,
        winningTeam,
        maxCombo: this.maxComboRecorded,
        superFinishes: this.superFinishes,
        durationSeconds: Math.floor((Date.now() - this.matchStartTime) / 1000),
        p1DamageDealt: this.p1TotalDamage,
        p2DamageDealt: this.p2TotalDamage,
      });
    }
  }

  // --- PROJECTILES & PARTICLES ---
  private updateProjectiles(dt: number) {
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt;
      p.hitbox.x = p.x - p.radius;

      // Screen edge boundary despawn
      if (p.x < -40 || p.x > this.arenaWidth + 40) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check collision with opposing fighter
      const target = (p.ownerId === 1) ? this.p2Fighter : this.p1Fighter;
      const targetHurtbox: Rect = {
        x: target.x - 30,
        y: target.y - (target.isCrouching ? 70 : 100),
        width: 60,
        height: target.isCrouching ? 70 : 100,
      };

      if (this.rectsIntersect(p.hitbox, targetHurtbox)) {
        const attacker = (p.ownerId === 1) ? this.p1Fighter : this.p2Fighter;
        this.applyHit(attacker, target, p.damage, false);
        this.projectiles.splice(i, 1);
        continue;
      }

      // Check projectile vs projectile clashes
      for (let j = i - 1; j >= 0; j--) {
        const other = this.projectiles[j];
        if (p.ownerId !== other.ownerId && this.rectsIntersect(p.hitbox, other.hitbox)) {
          // Clash explosion!
          this.createClashSparks((p.x + other.x) / 2, (p.y + other.y) / 2);
          this.projectiles.splice(i, 1);
          this.projectiles.splice(j, 1);
          break;
        }
      }
    }
  }

  private updateParticles(dt: number) {
    // Physical particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Floating text hit sparks
    for (let i = this.hitEffects.length - 1; i >= 0; i--) {
      const hf = this.hitEffects[i];
      hf.life -= dt;
      hf.y -= dt * 45;
      if (hf.life <= 0) {
        this.hitEffects.splice(i, 1);
      }
    }
  }

  private createDustPuff(x: number, y: number) {
    for (let i = 0; i < 4; i++) {
      this.particles.push({
        x: x + (Math.random() - 0.5) * 30,
        y: y - 4,
        vx: (Math.random() - 0.5) * 80,
        vy: -Math.random() * 50,
        life: 0.35,
        maxLife: 0.35,
        size: Math.random() * 8 + 4,
        color: '#94a3b8',
        shape: 'circle',
      });
    }
  }

  private createClashSparks(x: number, y: number) {
    sound.playHit(false);
    for (let i = 0; i < 12; i++) {
      this.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 300,
        vy: (Math.random() - 0.5) * 300,
        life: 0.35,
        maxLife: 0.35,
        size: Math.random() * 6 + 2,
        color: '#38bdf8',
        shape: 'spark',
      });
    }
  }

  private rectsIntersect(a: Rect, b: Rect): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  // --- RENDERING ---
  private render() {
    const { width, height } = this.canvas;
    const ctx = this.ctx;

    // Apply Screen Shake
    ctx.save();
    if (this.screenShake > 0) {
      const shakeX = (Math.random() - 0.5) * this.screenShake;
      const shakeY = (Math.random() - 0.5) * this.screenShake;
      ctx.translate(shakeX, shakeY);
    }

    // 1. Draw Stage Background
    this.drawStageBackground(ctx, width, height);

    // 2. Shadows
    SpriteRenderer.drawShadow(ctx, this.p1Fighter, this.groundY);
    SpriteRenderer.drawShadow(ctx, this.p2Fighter, this.groundY);

    // 3. Draw Fighters
    SpriteRenderer.drawFighter(ctx, this.p1Fighter);
    SpriteRenderer.drawFighter(ctx, this.p2Fighter);

    // 4. Draw Projectiles
    this.drawProjectiles(ctx);

    // 5. Draw Particles & Dust
    this.drawParticles(ctx);

    // 6. Super Freeze Cut-in Backdrop
    if (this.superFreezeTimer > 0 && this.superFighter) {
      this.drawSuperCutIn(ctx, width, height, this.superFighter);
    }

    // 7. Hit text effects ("DHISHUM!", "BLOCKED!")
    this.drawHitEffects(ctx);

    // 8. Round state banners ("ROUND 1", "FIGHT!", "K.O.")
    this.drawRoundBanners(ctx, width, height);

    ctx.restore();
  }

  private drawStageBackground(ctx: CanvasRenderingContext2D, w: number, h: number) {
    const stage = STAGES.find(s => s.id === this.settings.stageId) || STAGES[0];

    // Sky gradient
    const skyGrad = ctx.createLinearGradient(0, 0, 0, this.groundY);
    skyGrad.addColorStop(0, stage.skyColor);
    skyGrad.addColorStop(1, stage.bgColor);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, this.groundY);

    // Background silhouettes (rally tents, city flyover, studio lights)
    this.drawStageScenery(ctx, stage.id, w);

    // Arena Floor
    const groundGrad = ctx.createLinearGradient(0, this.groundY, 0, h);
    groundGrad.addColorStop(0, stage.groundColor);
    groundGrad.addColorStop(1, '#090d16');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, this.groundY, w, h - this.groundY);

    // Arena Edge Lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, this.groundY);
    ctx.lineTo(w, this.groundY);
    ctx.stroke();

    // Perspective floor grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    for (let x = 80; x < w; x += 120) {
      ctx.beginPath();
      ctx.moveTo(x, this.groundY);
      ctx.lineTo(x + (x - w / 2) * 0.4, h);
      ctx.stroke();
    }
  }

  private drawStageScenery(ctx: CanvasRenderingContext2D, stageId: string, w: number) {
    ctx.save();
    if (stageId === 'jantar_mantar') {
      // Protest Tents and Waving Tricolor Flags
      for (let i = 40; i < w; i += 180) {
        ctx.fillStyle = '#334155';
        ctx.beginPath();
        ctx.moveTo(i, this.groundY);
        ctx.lineTo(i + 50, this.groundY - 75);
        ctx.lineTo(i + 100, this.groundY);
        ctx.fill();

        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(i + 50, this.groundY - 75);
        ctx.lineTo(i + 50, this.groundY - 110);
        ctx.stroke();

        ctx.fillStyle = '#ea580c';
        ctx.fillRect(i + 52, this.groundY - 110, 22, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(i + 52, this.groundY - 104, 22, 6);
        ctx.fillStyle = '#10b981';
        ctx.fillRect(i + 52, this.groundY - 98, 22, 6);
      }
    } else if (stageId === 'news_studio') {
      // Giant Breaking News Ticker Wall
      ctx.fillStyle = '#18181b';
      ctx.fillRect(100, this.groundY - 160, w - 200, 120);
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.strokeRect(100, this.groundY - 160, w - 200, 120);

      ctx.fillStyle = 'rgba(239, 68, 68, 0.15)';
      ctx.beginPath();
      ctx.moveTo(200, 0);
      ctx.lineTo(120, this.groundY);
      ctx.lineTo(380, this.groundY);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      ctx.fillRect(100, this.groundY - 60, w - 200, 22);
      ctx.fillStyle = '#ffffff';
      ctx.font = '10px monospace';
      ctx.fillText('🔴 LIVE DEBATE: HIGH COMMAND COMBOS UNDER INVESTIGATION · THE NATION WANTS TO KNOW', 110, this.groundY - 45);
    } else if (stageId === 'rally_ground') {
      ctx.fillStyle = '#064e3b';
      for (let i = 20; i < w; i += 35) {
        const bob = Math.sin((this.p1Fighter.animFrame + i) * 0.1) * 8;
        ctx.beginPath();
        ctx.arc(i, this.groundY - 45 + bob, 14, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillRect(i - 12, this.groundY - 35 + bob, 24, 40);
      }
    } else {
      ctx.fillStyle = '#1e1b4b';
      ctx.fillRect(0, this.groundY - 130, w, 28);
      for (let i = 100; i < w; i += 220) {
        ctx.fillStyle = '#312e81';
        ctx.fillRect(i, this.groundY - 130, 36, 130);
      }
    }
    ctx.restore();
  }

  private drawProjectiles(ctx: CanvasRenderingContext2D) {
    this.projectiles.forEach(p => {
      ctx.save();
      ctx.translate(p.x, p.y);

      if (p.type === 'megaphone') {
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, -Math.PI * 0.4, Math.PI * 0.4);
        ctx.stroke();
        ctx.fillStyle = 'rgba(250, 204, 21, 0.3)';
        ctx.fill();
      } else if (p.type === 'heart') {
        ctx.fillStyle = '#ef4444';
        ctx.font = '24px sans-serif';
        ctx.fillText('🌹', -12, 8);
      } else if (p.type === 'cough') {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else if (p.type === 'football') {
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(-6, -6, 12, 12);
        ctx.fillStyle = 'rgba(249, 115, 22, 0.6)';
        ctx.beginPath();
        ctx.arc(-p.vx * 0.05, 0, p.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Official Summons Paper / Breaking News Paper
        ctx.fillStyle = '#fef08a';
        ctx.fillRect(-18, -12, 36, 24);
        ctx.fillStyle = '#b91c1c';
        ctx.font = '8px monospace';
        ctx.fillText('NOTICE', -15, 4);
      }

      ctx.restore();
    });
  }

  private drawParticles(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(pt => {
      ctx.save();
      ctx.globalAlpha = pt.life / pt.maxLife;
      ctx.fillStyle = pt.color;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  private drawSuperCutIn(ctx: CanvasRenderingContext2D, w: number, h: number, fighter: ActiveFighter) {
    ctx.save();
    ctx.fillStyle = 'rgba(11, 15, 25, 0.85)';
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = 'rgba(250, 204, 21, 0.3)';
    ctx.lineWidth = 2;
    for (let i = -w; i < w * 2; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 200, h);
      ctx.stroke();
    }

    ctx.fillStyle = '#facc15';
    ctx.font = '900 36px "Big Shoulders Display", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`★ MAX SUPER: ${fighter.def.superMove.name.toUpperCase()} ★`, w / 2, h / 2 - 20);

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 18px "Outfit", sans-serif';
    ctx.fillText(`"${fighter.def.superMove.cinematicQuote}"`, w / 2, h / 2 + 25);

    ctx.restore();
  }

  private drawHitEffects(ctx: CanvasRenderingContext2D) {
    this.hitEffects.forEach(hf => {
      ctx.save();
      ctx.font = `900 ${Math.floor(22 * hf.scale)}px "Big Shoulders Display", sans-serif`;
      ctx.fillStyle = hf.color;
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 3;
      ctx.textAlign = 'center';
      ctx.strokeText(hf.text, hf.x, hf.y);
      ctx.fillText(hf.text, hf.x, hf.y);
      ctx.restore();
    });
  }

  private drawRoundBanners(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.save();
    ctx.textAlign = 'center';

    if (this.roundState === 'INTRO') {
      const bannerText = (this.roundIntroTimer > 0.8) ? `ROUND ${this.roundNumber}` : 'FIGHT!';
      ctx.font = '900 64px "Big Shoulders Display", sans-serif';
      ctx.fillStyle = (this.roundIntroTimer > 0.8) ? '#facc15' : '#ef4444';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 6;
      ctx.strokeText(bannerText, w / 2, h / 2 - 20);
      ctx.fillText(bannerText, w / 2, h / 2 - 20);
    } else if (this.roundState === 'ROUND_OVER') {
      ctx.font = '900 76px "Big Shoulders Display", sans-serif';
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 8;
      ctx.strokeText('K.O.!', w / 2, h / 2 - 20);
      ctx.fillText('K.O.!', w / 2, h / 2 - 20);
    }

    ctx.restore();
  }
}
