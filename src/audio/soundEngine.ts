/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Procedural Web Audio API Synthesizer with Indian Dholak Beats & Retro Arcade Sound FX

class SoundEngine {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private isBgmPlaying: boolean = false;
  private bgmIntervalId: number | null = null;
  private currentBpm: number = 112;
  private step: number = 0;
  private masterGain: GainNode | null = null;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.7, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  // --- INDIAN DHOLAK SYNTHESIZER ---

  // Bayan (Low bass drum of Dholak - warm resonant thump with pitch bend)
  public playDholakBass(decay: number = 0.28, pitch: number = 130) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(42, now + decay);

    gain.gain.setValueAtTime(0.8, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + decay);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + decay);
  }

  // Dayan / Chaanti (High treble drum of Dholak - sharp metallic rim slap)
  public playDholakChaanti(pitch: number = 650, sharp: boolean = true) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Resonant tonal ring
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(pitch, now);
    osc.frequency.exponentialRampToValueAtTime(pitch * 0.7, now + 0.12);

    oscGain.gain.setValueAtTime(sharp ? 0.6 : 0.35, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.12);

    // Filtered noise crack for rim snap
    const bufferSize = this.ctx.sampleRate * 0.05;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(pitch * 2.2, now);
    filter.Q.setValueAtTime(3.5, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.4, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);

    noise.start(now);
  }

  // Background Indian Dholak Battle Groove
  public startBattleBgm(urgent: boolean = false) {
    this.stopBattleBgm();
    this.initContext();
    this.isBgmPlaying = true;
    this.currentBpm = urgent ? 138 : 116;
    const intervalMs = (60 / this.currentBpm / 4) * 1000; // 16th note steps

    this.step = 0;
    this.bgmIntervalId = window.setInterval(() => {
      if (!this.isBgmPlaying) return;

      const beat16 = this.step % 16;

      // Authentic Punjabi / Street Rally Dhol Beat Pattern:
      // Step 0:  Heavy Dha (Bass + Slap)
      // Step 2:  Chaanti (Taa)
      // Step 4:  Bass (Dhe)
      // Step 6:  Chaanti (Ti)
      // Step 8:  Heavy Dha (Bass + Slap)
      // Step 10: Bass roll (Ge-ge)
      // Step 12: Chaanti Accent (Kat)
      // Step 14: Quick Chaanti (Na)

      if (beat16 === 0) {
        this.playDholakBass(0.35, 140);
        this.playDholakChaanti(700, true);
      } else if (beat16 === 2) {
        this.playDholakChaanti(600, false);
      } else if (beat16 === 4) {
        this.playDholakBass(0.25, 120);
        this.playDholakChaanti(550, false);
      } else if (beat16 === 6) {
        this.playDholakChaanti(620, false);
      } else if (beat16 === 8) {
        this.playDholakBass(0.32, 135);
        this.playDholakChaanti(720, true);
      } else if (beat16 === 10) {
        this.playDholakBass(0.2, 110);
      } else if (beat16 === 12) {
        this.playDholakChaanti(800, true);
        if (urgent) this.playDholakBass(0.2, 130);
      } else if (beat16 === 14) {
        this.playDholakChaanti(680, false);
      }

      // Add retro arcade bass synth line every 4 steps
      if (beat16 % 4 === 0) {
        const rootFreqs = [110, 110, 130.81, 146.83]; // A2, A2, C3, D3
        const freq = rootFreqs[Math.floor(beat16 / 4)];
        this.playRetroBassNote(freq, 0.16);
      }

      this.step++;
    }, intervalMs);
  }

  private playRetroBassNote(freq: number, duration: number) {
    if (this.isMuted || !this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(freq, now);

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(freq * 3, now);
    filter.frequency.exponentialRampToValueAtTime(freq * 1.2, now + duration);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  public stopBattleBgm() {
    if (this.bgmIntervalId !== null) {
      clearInterval(this.bgmIntervalId);
      this.bgmIntervalId = null;
    }
    this.isBgmPlaying = false;
  }

  // --- RETRO ARCADE SOUND EFFECTS ---

  public playWhoosh(heavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.15;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(heavy ? 600 : 1200, now);
    filter.frequency.exponentialRampToValueAtTime(heavy ? 200 : 400, now + 0.14);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(heavy ? 0.5 : 0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    noise.start(now);
  }

  // Punch / Kick Impact ("Dhishum")
  public playHit(heavy: boolean = false) {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Body thud
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(heavy ? 220 : 340, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + (heavy ? 0.2 : 0.12));

    gain.gain.setValueAtTime(heavy ? 0.9 : 0.6, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.2 : 0.12));

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + (heavy ? 0.2 : 0.12));

    // Crack noise
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(heavy ? 1800 : 2600, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(heavy ? 0.7 : 0.45, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.masterGain);
    noise.start(now);
  }

  // Block Clang
  public playBlock() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(880, now);
    osc.frequency.exponentialRampToValueAtTime(440, now + 0.09);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.09);
  }

  // Super Move Flash / Cinematic Freeze Chime
  public playSuperFlash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;

    // Rising dramatic chords
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * 0.7, now + idx * 0.04);
      osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + 0.4);

      gain.gain.setValueAtTime(0.3, now + idx * 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.04);
      osc.stop(now + 0.55);
    });
  }

  // Massive Super Explosion / Impact
  public playSuperImpact() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(25, now + 0.65);

    gain.gain.setValueAtTime(1.0, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.7);

    // Also dholak double burst
    this.playDholakBass(0.5, 180);
    setTimeout(() => this.playDholakChaanti(880, true), 80);
  }

  // Megaphone / Soundwave Attack
  public playMegaphoneWave() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.linearRampToValueAtTime(880, now + 0.2);

    gain.gain.setValueAtTime(0.4, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.25);
  }

  // Dash Sound
  public playDash() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, now);
    osc.frequency.exponentialRampToValueAtTime(120, now + 0.1);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.1);
  }

  // Announcer Voice Callout
  public announce(phrase: string) {
    if (this.isMuted) return;

    // Use Web Speech API if supported with dramatic pitch/rate
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 1.15;
      utterance.pitch = 0.9;
      utterance.volume = 0.9;
      window.speechSynthesis.speak(utterance);
    } else {
      // Audio synth fanfare fallback
      this.playFanfare();
    }
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const chords = [440, 554.37, 659.25, 880];
    chords.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(f, now);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.35);
      }, i * 100);
    });
  }

  // --- FAMOUS VIRAL REEL SOUND EFFECTS ---

  // 1. "Moye Moye" Melancholic Reel Theme (Played on K.O. or near-loss)
  public playMoyeMoye() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Melody notes: F#4 (370Hz), G4 (392Hz), A4 (440Hz), G4 (392Hz), F#4 (370Hz), E4 (329.6Hz)
    const notes = [
      { f: 370.0, d: 0.22, delay: 0 },
      { f: 392.0, d: 0.22, delay: 200 },
      { f: 440.0, d: 0.35, delay: 400 },
      { f: 392.0, d: 0.22, delay: 720 },
      { f: 370.0, d: 0.22, delay: 920 },
      { f: 329.6, d: 0.55, delay: 1120 },
    ];

    notes.forEach(n => {
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, now);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + n.d);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + n.d);
      }, n.delay);
    });
  }

  // 2. "Aayein?" Funny Pitch Jump (Played on blocked counters or parries)
  public playAayein() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    // Dramatic rapid glissando up: "Aayein?"
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(740, now + 0.18);
    osc.frequency.exponentialRampToValueAtTime(550, now + 0.32);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(600, now);
    filter.Q.setValueAtTime(4, now);

    gain.gain.setValueAtTime(0.5, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.36);
  }

  // 3. "Systumm" Distorted 808 Sub-Bass Drop (Played on heavy wall-bounce / combo ender)
  public playSystumm() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(36, now + 0.45);

    gain.gain.setValueAtTime(0.9, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + 0.52);

    // Also dholak bass slap
    this.playDholakBass(0.4, 160);
  }

  // 4. "Gaddari Karbe" Cinematic Brass Stinger (Played on counter-hits)
  public playGaddari() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [110, 164.81, 220].forEach(f => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);
      osc.frequency.exponentialRampToValueAtTime(f * 0.85, now + 0.4);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.45);
    });
  }

  // 5. "So Beautiful, So Elegant, Just Looking Like A Wow" Victory Fanfare
  public playJustLookingLikeAWow() {
    if (this.isMuted) return;
    this.speakDialogue("So beautiful, so elegant, just looking like a wow!", 1.1, 1.05);

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    // Sparkling bell notes
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5];
    notes.forEach((f, i) => {
      setTimeout(() => {
        if (!this.ctx || !this.masterGain) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now);
        osc.stop(now + 0.3);
      }, i * 90);
    });
  }

  // 6. Heavy Bulldozer Pneumatic Horn (Bulldozer Baba special)
  public playBulldozerHorn() {
    if (this.isMuted) return;
    this.speakDialogue("Bulldozer action shuru!", 0.85, 1.1);

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    [180, 225].forEach(f => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(f, now);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.62);
    });
  }

  // 7. Police Emergency Siren (Inspector Raid Raja)
  public playPoliceSiren() {
    if (this.isMuted) return;
    this.speakDialogue("ED aur CBI raid! Arrest warrant!", 1.05, 1.2);

    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(600, now);
    osc.frequency.linearRampToValueAtTime(950, now + 0.2);
    osc.frequency.linearRampToValueAtTime(600, now + 0.4);

    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.42);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + 0.45);
  }

  // --- REAL HUMAN VOICE DIALOGUES & VIRAL AUDIO LINES ---

  public speakDialogue(phrase: string, pitch = 1.0, rate = 1.0) {
    if (this.isMuted) return;
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.pitch = pitch;
      utterance.rate = rate;
      utterance.volume = 1.0;

      // Prefer Indian English / Hindi natural voice if available
      const voices = window.speechSynthesis.getVoices();
      const indianVoice = voices.find(v => v.lang.includes('IN') || v.lang.includes('hi') || v.name.includes('India'));
      if (indianVoice) {
        utterance.voice = indianVoice;
      }
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // Didi: "Ramba ramba khamba khamba dumba dumba bumba bumba! Khela hobe!"
  public playDidiRambaRamba() {
    if (this.isMuted) return;
    this.speakDialogue("Ramba ramba khamba khamba, dumba dumba bumba bumba, Khela hobe!", 1.25, 1.15);
    this.playDholakChaanti(720, true);
    setTimeout(() => this.playDholakBass(0.3, 160), 250);
  }

  // Muffler Babu: Real acoustic human cough + voice line
  public playMufflerCough() {
    if (this.isMuted) return;
    this.playRealAcousticCough();
    setTimeout(() => {
      this.speakDialogue("Khokh! Khokh! Khansi... Hum aam aadmi hain!", 0.95, 1.1);
    }, 150);
  }

  // Acoustic multi-burst realistic human cough synthesis
  public playRealAcousticCough() {
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const ctx = this.ctx;
    const now = ctx.currentTime;

    // Create 2 realistic hacking cough pulses
    [0, 0.22].forEach(offset => {
      const startTime = now + offset;
      const bufferSize = ctx.sampleRate * 0.16;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      // Throat rasp turbulent noise
      for (let i = 0; i < bufferSize; i++) {
        const decay = 1 - (i / bufferSize);
        data[i] = (Math.random() * 2 - 1) * Math.pow(decay, 1.8);
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      // Formant filters for human vocal tract during cough (F1: 480Hz, F2: 1300Hz, F3: 2600Hz)
      const filter1 = ctx.createBiquadFilter();
      filter1.type = 'bandpass';
      filter1.frequency.setValueAtTime(480, startTime);
      filter1.Q.setValueAtTime(3.2, startTime);

      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'bandpass';
      filter2.frequency.setValueAtTime(1300, startTime);
      filter2.Q.setValueAtTime(2.8, startTime);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.85, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.16);

      noise.connect(filter1);
      filter1.connect(filter2);
      filter2.connect(gain);
      gain.connect(this.masterGain!);

      noise.start(startTime);
      noise.stop(startTime + 0.18);
    });
  }

  // Netaji: "Mitron! Bhaiyo aur behno! 56 inch!"
  public playNetajiMitron() {
    if (this.isMuted) return;
    this.speakDialogue("Bhaiyo aur behno! Mitron! 56 inch!", 0.88, 1.05);
    this.playMegaphoneWave();
  }

  // Rahul: "Khatakhat! Khatakhat! Khatakhat!"
  public playRahulKhatakhat() {
    if (this.isMuted) return;
    this.speakDialogue("Khatakhat! Khatakhat! Khatakhat!", 1.1, 1.25);
    this.playWhoosh(true);
  }

  // Bahubali: "Gaddari karbe! Maar ke bhoot bana denge!"
  public playBahubaliGaddari() {
    if (this.isMuted) return;
    this.speakDialogue("Gaddari karbe! Maar ke bhoot bana denge!", 0.82, 1.0);
    this.playGaddari();
  }

  // Anchor Prime: "The Nation Wants To Know!"
  public playAnchorNationWantsToKnow() {
    if (this.isMuted) return;
    this.speakDialogue("The Nation wants to know! Answer me!", 1.15, 1.3);
    this.playMegaphoneWave();
  }

  // Boss Corruption Titan Demonic Speech
  public playBossLaughter() {
    if (this.isMuted) return;
    this.speakDialogue("FOOLS! I am Bhrashtachar! Swiss bank black money is immortal! You cannot defeat Corruption!", 0.7, 0.95);
    this.playSuperImpact();
  }
}

export const sound = new SoundEngine();
