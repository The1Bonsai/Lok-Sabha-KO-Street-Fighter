/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ActiveFighter } from '../types/game';

export class SpriteRenderer {
  // Render character shadow on the arena floor
  public static drawShadow(ctx: CanvasRenderingContext2D, fighter: ActiveFighter, groundY: number) {
    const shadowWidth = Math.max(25, 55 - (groundY - fighter.y) * 0.25);
    const shadowHeight = Math.max(8, 16 - (groundY - fighter.y) * 0.08);

    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(fighter.x, groundY + 4, shadowWidth, shadowHeight, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw character with stance, state, and clothes
  public static drawFighter(ctx: CanvasRenderingContext2D, fighter: ActiveFighter) {
    ctx.save();
    ctx.translate(fighter.x, fighter.y);
    ctx.scale(fighter.facing, 1);

    // Hit flash effect when in hurt state
    if (fighter.state === 'HURT' || fighter.state === 'HURT_AIR') {
      if (Math.floor(Date.now() / 40) % 2 === 0) {
        ctx.filter = 'brightness(2.5) contrast(1.5)';
      }
    }

    // Super move golden aura
    if (fighter.state === 'SUPER') {
      ctx.shadowColor = '#facc15';
      ctx.shadowBlur = 24;
    }

    // Squash and stretch / bobbing during idle/walk
    const anim = fighter.animFrame;
    const idleBob = (fighter.state === 'IDLE') ? Math.sin(anim * 0.1) * 3 : 0;
    const walkBob = (fighter.state.startsWith('WALK')) ? Math.abs(Math.sin(anim * 0.25)) * 6 : 0;
    const crouchOffset = fighter.isCrouching ? 35 : 0;

    // Body dimensions
    const bodyHeight = 125 - crouchOffset;
    const bodyWidth = 48;

    // 1. Draw character based on ID
    switch (fighter.def.id) {
      case 'netaji_vikas':
        this.drawNetaji(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'yuva_rahul':
        this.drawYuva(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'muffler_babu':
        this.drawMufflerBabu(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'bahubali_goon':
        this.drawBahubali(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'didi_khela':
        this.drawDidi(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'arnab_prime':
        this.drawArnab(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'bulldozer_baba':
        this.drawBulldozerBaba(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'raid_raja':
        this.drawRaidRaja(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      case 'boss_corruption':
        this.drawBossCorruption(ctx, fighter, idleBob, walkBob, crouchOffset);
        break;
      default:
        this.drawGenericFighter(ctx, fighter, idleBob, crouchOffset);
        break;
    }

    // 2. Draw active attack effects/weapons extending from body
    this.drawAttackOverlays(ctx, fighter);

    // 3. Draw Guarding Shield
    if (fighter.isGuarding) {
      ctx.save();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(15, -60, 48, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.2)';
      ctx.fill();
      ctx.restore();
    }

    ctx.restore();
  }

  // --- NETAJI VIKAS (Crisp White Kurta + Saffron Bandi Jacket + Lotus Pin) ---
  private static drawNetaji(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Legs / Dhoti-Pajama
    ctx.fillStyle = '#f8fafc';
    if (f.state.startsWith('WALK')) {
      const legStride = Math.sin(f.animFrame * 0.25) * 18;
      ctx.fillRect(-18 + legStride, -40, 14, 40);
      ctx.fillRect(4 - legStride, -40, 14, 40);
    } else if (f.isCrouching) {
      ctx.fillRect(-22, -25, 20, 25);
      ctx.fillRect(2, -25, 20, 25);
    } else {
      ctx.fillRect(-16, -45, 14, 45);
      ctx.fillRect(2, -45, 14, 45);
    }

    // Traditional Kohlapuri / Black Formal Shoes
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-18, -6, 18, 6);
    ctx.fillRect(2, -6, 18, 6);

    // Long Kurta (White)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(-22, -90 + yOff, 44, 52);

    // Saffron Bandi Jacket
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(-22, -90 + yOff, 44, 38);
    // Jacket collar & button strip
    ctx.fillStyle = '#c2410c';
    ctx.fillRect(-2, -90 + yOff, 5, 38);
    // Golden Lotus Brooch
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(12, -80 + yOff, 5, 0, Math.PI * 2);
    ctx.fill();

    // Head & Beard
    this.drawHeadWithBeard(ctx, 0, -105 + yOff, '#fcd34d', '#e2e8f0', '#ffffff');

    // Arms & Hands
    this.drawArms(ctx, f, yOff, '#f1f5f9', '#fcd34d');
  }

  // --- YUVA AANDOLAN RAHUL (White T-shirt, Trimmed Stubble, Energetic Stance) ---
  private static drawYuva(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Jeans / Dark Trousers
    ctx.fillStyle = '#1e3a8a';
    if (f.state.startsWith('WALK')) {
      const legStride = Math.sin(f.animFrame * 0.25) * 18;
      ctx.fillRect(-16 + legStride, -45, 13, 45);
      ctx.fillRect(3 - legStride, -45, 13, 45);
    } else if (f.isCrouching) {
      ctx.fillRect(-20, -26, 18, 26);
      ctx.fillRect(2, -26, 18, 26);
    } else {
      ctx.fillRect(-14, -48, 12, 48);
      ctx.fillRect(2, -48, 12, 48);
    }

    // White Running Sneakers
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-16, -6, 16, 6);
    ctx.fillRect(2, -6, 16, 6);

    // Iconic White T-Shirt
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-20, -92 + yOff, 40, 48);
    // Tricolor wrist band
    ctx.fillStyle = '#f97316';
    ctx.fillRect(14, -75 + yOff, 4, 3);
    ctx.fillStyle = '#10b981';
    ctx.fillRect(14, -72 + yOff, 4, 3);

    // Head, Dark Hair & Athletic Stubble
    this.drawHeadWithBeard(ctx, 0, -107 + yOff, '#fed7aa', '#1e293b', '#475569');

    // Arms
    this.drawArms(ctx, f, yOff, '#f8fafc', '#fed7aa');
  }

  // --- MUFFLER BABU (Head Muffler, Oversized Sweater, Glasses, Broom) ---
  private static drawMufflerBabu(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Formal Trousers
    ctx.fillStyle = '#475569';
    ctx.fillRect(-15, -45, 13, 45);
    ctx.fillRect(2, -45, 13, 45);

    // Brown Sandals
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-16, -6, 16, 6);
    ctx.fillRect(2, -6, 16, 6);

    // Oversized Wool Sweater (Beige / Grey)
    ctx.fillStyle = '#71717a';
    ctx.fillRect(-22, -90 + yOff, 44, 48);

    // Head with Wrapped Blue Muffler
    const headX = 0;
    const headY = -104 + yOff;

    // Face
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(headX - 10, headY - 12, 20, 22);

    // Wrapped Muffler (Sky blue with hanging tails)
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(headX - 14, headY - 16, 28, 12); // Muffler top/ears
    ctx.fillRect(headX - 12, headY + 8, 24, 9);   // Muffler neck wrap
    // Hanging muffler tail
    ctx.fillRect(headX - 10, headY + 16, 8, 18);

    // Eyeglasses
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.strokeRect(headX - 8, headY - 4, 8, 7);
    ctx.strokeRect(headX + 2, headY - 4, 8, 7);
    ctx.beginPath();
    ctx.moveTo(headX, headY - 1);
    ctx.lineTo(headX + 2, headY - 1);
    ctx.stroke();

    // Arms & Jhaadu (Broom)
    this.drawArms(ctx, f, yOff, '#71717a', '#fed7aa');

    // Draw broom in hand
    ctx.save();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, -60 + yOff);
    ctx.lineTo(26, -10 + yOff);
    ctx.stroke();
    // Broom bristles
    ctx.fillStyle = '#eab308';
    ctx.fillRect(22, -10 + yOff, 12, 14);
    ctx.restore();
  }

  // --- BAHUBALI GOON (Gamcha, Muscle Vest, Gold Chain, Heavy Bamboo Lathi) ---
  private static drawBahubali(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Cargo Pants / Dhoti
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(-18, -48, 16, 48);
    ctx.fillRect(3, -48, 16, 48);

    // Heavy Boots
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-20, -7, 20, 7);
    ctx.fillRect(3, -7, 20, 7);

    // Muscular Torso / Vest (White tank)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(-25, -94 + yOff, 50, 48);

    // Gold Chain
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -82 + yOff, 12, 0, Math.PI);
    ctx.stroke();

    // Red Gamcha wrapped around neck/head
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(-18, -75 + yOff, 36, 8);
    ctx.fillRect(-16, -114 + yOff, 32, 10); // Red bandana headband

    // Face & Heavy Beard
    this.drawHeadWithBeard(ctx, 0, -106 + yOff, '#f59e0b', '#0f172a', '#0f172a');

    // Muscular Bare Arms with tattoo
    this.drawArms(ctx, f, yOff, '#f59e0b', '#f59e0b', true);

    // Bamboo Lathi in hand
    ctx.save();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(20, -100 + yOff, 5, 80);
    // Brass caps on lathi ends
    ctx.fillStyle = '#facc15';
    ctx.fillRect(19, -102 + yOff, 7, 4);
    ctx.fillRect(19, -22 + yOff, 7, 4);
    ctx.restore();
  }

  // --- DIDI BENGAL TIGRESS (White-Blue Border Saree, Hawai Chappal) ---
  private static drawDidi(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // White Cotton Saree with Blue Borders
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(-20, -60, 40, 56);
    // Blue Border line
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(-20, -10, 40, 5);
    ctx.fillRect(-20, -58, 4, 50);

    // Hawai Chappal (Blue strap slippers)
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-16, -4, 15, 4);
    ctx.fillRect(2, -4, 15, 4);

    // Saree Pallu (Torso)
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(-20, -92 + yOff, 40, 45);
    ctx.fillStyle = '#0284c7';
    // Diagonal Pallu Stripe
    ctx.beginPath();
    ctx.moveTo(-18, -92 + yOff);
    ctx.lineTo(16, -55 + yOff);
    ctx.lineTo(20, -55 + yOff);
    ctx.lineTo(-14, -92 + yOff);
    ctx.fill();

    // Head, Bun Hair & Round Spectacles
    const headX = 0;
    const headY = -106 + yOff;
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(headX - 9, headY - 10, 18, 20);

    // Hair Bun at back
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(headX - 12, headY - 2, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(headX - 10, headY - 14, 20, 8);

    // Spectacles
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(headX - 7, headY - 4, 6, 6);
    ctx.strokeRect(headX + 1, headY - 4, 6, 6);

    // Arms
    this.drawArms(ctx, f, yOff, '#ffffff', '#fed7aa');
  }

  // --- ARNAB PRIME ANCHOR (Navy Suit, Red Tie, Headset, Silver Mic) ---
  private static drawArnab(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Dark Suit Trousers
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(-15, -46, 13, 46);
    ctx.fillRect(2, -46, 13, 46);

    // Polished Oxford Shoes
    ctx.fillStyle = '#09090b';
    ctx.fillRect(-17, -6, 16, 6);
    ctx.fillRect(2, -6, 16, 6);

    // Navy Suit Jacket
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-22, -92 + yOff, 44, 48);

    // White Shirt V & Red Power Tie
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(-8, -92 + yOff);
    ctx.lineTo(8, -92 + yOff);
    ctx.lineTo(0, -74 + yOff);
    ctx.fill();

    ctx.fillStyle = '#dc2626'; // Red tie
    ctx.fillRect(-2, -88 + yOff, 4, 18);

    // Head with Broadcast Headset
    const headX = 0;
    const headY = -107 + yOff;
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(headX - 10, headY - 10, 20, 20);

    // Neat hair
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(headX - 11, headY - 14, 22, 7);

    // Headset band & ear muff
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(headX, headY - 8, 12, Math.PI, 0);
    ctx.stroke();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(headX - 14, headY - 6, 4, 8); // Ear cushion
    // Mic boom to mouth
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(headX - 12, headY);
    ctx.lineTo(headX + 4, headY + 5);
    ctx.stroke();

    // Arms & Large Silver TV Studio Mic
    this.drawArms(ctx, f, yOff, '#1e293b', '#fed7aa');

    ctx.save();
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(18, -75 + yOff, 4, 20); // Mic handle
    ctx.fillStyle = '#ef4444'; // Red foam mic cube
    ctx.fillRect(15, -88 + yOff, 10, 13);
    ctx.fillStyle = '#ffffff';
    ctx.font = '7px sans-serif';
    ctx.fillText('9PM', 15, -79 + yOff);
    ctx.restore();
  }

  // Generic fallback
  private static drawGenericFighter(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, crouch: number) {
    const yOff = idleBob + crouch * 0.5;
    ctx.fillStyle = f.def.partyColor;
    ctx.fillRect(-20, -90 + yOff, 40, 50);
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(-10, -110 + yOff, 20, 20);
    ctx.fillRect(-15, -40, 12, 40);
    ctx.fillRect(3, -40, 12, 40);
  }

  // Reusable head with hair and beard
  private static drawHeadWithBeard(ctx: CanvasRenderingContext2D, x: number, y: number, skin: string, hair: string, beard: string) {
    // Face
    ctx.fillStyle = skin;
    ctx.fillRect(x - 10, y - 10, 20, 20);

    // Hair
    ctx.fillStyle = hair;
    ctx.fillRect(x - 11, y - 14, 22, 6);

    // Eyes
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x + 2, y - 3, 3, 3);

    // Beard / Moustache
    if (beard) {
      ctx.fillStyle = beard;
      ctx.fillRect(x - 8, y + 2, 18, 9);
      ctx.fillRect(x - 5, y + 8, 13, 5);
    }
  }

  // --- BULLDOZER BABA (Saffron Robes, Sacred Rudraksha, Bulldozer Blade) ---
  private static drawBulldozerBaba(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Saffron Dhoti
    ctx.fillStyle = '#ea580c';
    if (f.state.startsWith('WALK')) {
      const legStride = Math.sin(f.animFrame * 0.25) * 16;
      ctx.fillRect(-16 + legStride, -45, 14, 45);
      ctx.fillRect(2 - legStride, -45, 14, 45);
    } else if (f.isCrouching) {
      ctx.fillRect(-20, -25, 18, 25);
      ctx.fillRect(2, -25, 18, 25);
    } else {
      ctx.fillRect(-15, -45, 13, 45);
      ctx.fillRect(2, -45, 13, 45);
    }

    // Wooden Paduka / Slippers
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-16, -6, 15, 6);
    ctx.fillRect(2, -6, 15, 6);

    // Full Saffron Ascetic Robe
    ctx.fillStyle = '#f97316';
    ctx.fillRect(-22, -92 + yOff, 44, 52);

    // Rudraksha Necklace
    ctx.fillStyle = '#7c2d12';
    for (let i = -14; i <= 14; i += 7) {
      ctx.beginPath();
      ctx.arc(i, -82 + yOff, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shaved Head with Saffron Wrap and Red Tilak
    const headX = 0;
    const headY = -106 + yOff;
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(headX - 10, headY - 10, 20, 20);

    // Tilak (Red vertical stripe + Yellow Chandan)
    ctx.fillStyle = '#facc15';
    ctx.fillRect(headX - 3, headY - 8, 6, 8);
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(headX - 1, headY - 8, 2, 8);

    // Saffron ear wrap / scarf
    ctx.fillStyle = '#ea580c';
    ctx.fillRect(headX - 12, headY - 14, 24, 7);

    // Arms
    this.drawArms(ctx, f, yOff, '#f97316', '#fed7aa');

    // Mini Golden Bulldozer on shoulder / aura
    ctx.save();
    ctx.fillStyle = '#eab308'; // Bulldozer yellow
    ctx.fillRect(16, -100 + yOff, 18, 12);
    // Bulldozer scoop blade
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(32, -96 + yOff, 6, 12);
    // Tracks
    ctx.fillStyle = '#334155';
    ctx.fillRect(15, -88 + yOff, 20, 4);
    ctx.restore();
  }

  // --- INSPECTOR RAID RAJA (Khaki Safari Suit, Aviators, CBI Badge, Warrant Case) ---
  private static drawRaidRaja(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    // Khaki Trousers
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-15, -45, 13, 45);
    ctx.fillRect(2, -45, 13, 45);

    // Leather Boots
    ctx.fillStyle = '#1c1917';
    ctx.fillRect(-16, -6, 16, 6);
    ctx.fillRect(2, -6, 16, 6);

    // Safari Jacket (Khaki / Slate)
    ctx.fillStyle = '#475569';
    ctx.fillRect(-21, -92 + yOff, 42, 48);

    // Official Identity Badge
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(8, -80 + yOff, 6, 8);

    // Head, Mustache & Dark Aviator Sunglasses
    const headX = 0;
    const headY = -106 + yOff;
    ctx.fillStyle = '#fed7aa';
    ctx.fillRect(headX - 10, headY - 10, 20, 20);

    // Dark sleek hair
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(headX - 11, headY - 14, 22, 6);

    // Aviator Sunglasses
    ctx.fillStyle = '#09090b';
    ctx.fillRect(headX - 8, headY - 5, 7, 5);
    ctx.fillRect(headX + 1, headY - 5, 7, 5);
    ctx.strokeStyle = '#f59e0b'; // Gold wire frame
    ctx.lineWidth = 1;
    ctx.strokeRect(headX - 8, headY - 5, 7, 5);
    ctx.strokeRect(headX + 1, headY - 5, 7, 5);

    // Police Moustache
    ctx.fillStyle = '#09090b';
    ctx.fillRect(headX - 6, headY + 3, 12, 4);

    // Arms
    this.drawArms(ctx, f, yOff, '#475569', '#fed7aa');

    // Official Yellow Summons File in hand
    ctx.save();
    ctx.fillStyle = '#fef08a'; // Yellow file folder
    ctx.fillRect(18, -75 + yOff, 12, 16);
    ctx.fillStyle = '#b91c1c'; // Red stamp
    ctx.fillRect(22, -68 + yOff, 5, 5);
    ctx.restore();
  }

  // --- BOSS: BHRASHTACHAR (Colossal Shadow Titan of Corruption) ---
  private static drawBossCorruption(ctx: CanvasRenderingContext2D, f: ActiveFighter, idleBob: number, walkBob: number, crouch: number) {
    const yOff = idleBob - walkBob + crouch * 0.5;

    ctx.save();
    // 1.25x Titan Scale
    ctx.scale(1.25, 1.25);

    // Dark Purple Miasma Aura Glow
    ctx.shadowColor = '#c084fc';
    ctx.shadowBlur = 24;

    // Colossal Obsidian Legs
    ctx.fillStyle = '#0f051d';
    ctx.fillRect(-22, -48, 20, 48);
    ctx.fillRect(4, -48, 20, 48);

    // Shadowy Robes / Dark Overcoat
    ctx.fillStyle = '#1e0836';
    ctx.fillRect(-30, -96 + yOff, 60, 52);

    // Glowing Swiss Bank Gold Chains & Keys
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -84 + yOff, 18, 0, Math.PI);
    ctx.stroke();

    // Towering Head Silhouette with glowing neon violet eyes
    const headX = 0;
    const headY = -112 + yOff;
    ctx.fillStyle = '#0a0118';
    ctx.fillRect(headX - 14, headY - 12, 28, 26);

    // Glowing Piercing Violet Eyes
    ctx.fillStyle = '#e879f9';
    ctx.fillRect(headX - 8, headY - 4, 5, 5);
    ctx.fillRect(headX + 4, headY - 4, 5, 5);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(headX - 6, headY - 2, 2, 2);
    ctx.fillRect(headX + 6, headY - 2, 2, 2);

    // Multiple Shadow Arms (4 arms)
    // Left Extra Arm
    ctx.fillStyle = '#1e0836';
    ctx.fillRect(-36, -95 + yOff, 12, 34);
    // Right Extra Arm holding Black Money Briefcase
    ctx.fillRect(24, -95 + yOff, 12, 34);

    // Front Main Arms
    this.drawArms(ctx, f, yOff, '#2e1065', '#3b0764');

    // Floating Black Money Suitcases
    ctx.fillStyle = '#09090b';
    ctx.fillRect(28, -80 + yOff, 18, 14);
    ctx.strokeStyle = '#eab308'; // Gold lock
    ctx.lineWidth = 1.5;
    ctx.strokeRect(28, -80 + yOff, 18, 14);

    // Floating Rupee Notes Particle aura
    ctx.fillStyle = '#4ade80';
    for (let i = -2; i <= 2; i++) {
      ctx.fillRect(headX + i * 14, headY - 18 + Math.sin(f.animFrame * 0.15 + i) * 6, 8, 4);
    }

    ctx.restore();
  }

  // Dynamic Arms according to attacking / walking state
  private static drawArms(ctx: CanvasRenderingContext2D, f: ActiveFighter, yOff: number, sleeveColor: string, skinColor: string, bareArms = false) {
    ctx.save();

    // Default arm positions
    let backArmAngle = 0.2;
    let frontArmAngle = -0.3;
    let punchReach = 0;

    if (f.state === 'LIGHT_PUNCH') {
      frontArmAngle = 0;
      punchReach = 38;
    } else if (f.state === 'HEAVY_PUNCH') {
      frontArmAngle = -0.1;
      punchReach = 55;
    } else if (f.state === 'SPECIAL_1' || f.state === 'SPECIAL_2') {
      frontArmAngle = -0.2;
      punchReach = 45;
    }

    // Front arm
    ctx.fillStyle = bareArms ? skinColor : sleeveColor;
    ctx.fillRect(0, -85 + yOff, 18 + punchReach, 10);
    // Fist
    ctx.fillStyle = skinColor;
    ctx.fillRect(18 + punchReach, -86 + yOff, 11, 12);

    ctx.restore();
  }

  // Draw attack visual overlays (kicks, slashes, fire auras)
  private static drawAttackOverlays(ctx: CanvasRenderingContext2D, f: ActiveFighter) {
    if (f.state === 'LIGHT_KICK') {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(35, -35, 14, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (f.state === 'HEAVY_KICK') {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.ellipse(45, -45, 24, 12, Math.PI * 0.15, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else if (f.state === 'SUPER') {
      // Golden / Electric flaming aura around the fighter
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        const randX = (Math.random() - 0.5) * 60;
        const randY = -Math.random() * 120;
        ctx.arc(randX, randY, Math.random() * 8 + 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
    }
  }
}
