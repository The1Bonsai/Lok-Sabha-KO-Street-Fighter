# Lok Sabha KO: Street Yoddha — 3v3 Random Matchmaking, Story Campaign & Corner Bug Fix

An expansion plan introducing an instant 3v3 Online Random Matchmaking queue (matching live peers or simulated online players), an interactive State Election Map of India Story Campaign featuring colossal shadow titan boss **Corruption**, guaranteed full 3-fighter round progression, and a complete engine fix for the corner super freeze glitch.

## User Review & Critical Decisions

> [!IMPORTANT]
> The design integrates all user selections from the clarification turn:
> - **3v3 Online Random Matchmaking**: Instant matchmaking pool that discovers live peers or pairs with a simulated online rival after 4 seconds (with real-time ping, gamer tag, and rank banner).
> - **Full 3-Fighter Elimination Rule**: A match strictly requires defeating all 3 fighters on a team. Knocking out Fighter 1 and Fighter 2 automatically transitions to the next teammate until all 3 are defeated.
> - **Interactive Map of India Story Mode**: A multi-stage election conquest map across North, East, West/South India culminating in the secret high-command vault of Boss **Corruption** (*Bhrashtachar*).
> - **Boss "Corruption"**: A colossal shadow titan boss possessing dark purple miasma auras, hyper-armor, floating briefcases of black money, and signature moves (*Black Money Tsunami*, *Scam Shockwave*, *Horse-Trading Grab*).
> - **Corner Super Glitch Fix**: Re-architected corner collision, wall bounce, and strict timeout clamps preventing AI supers from freezing play against screen boundaries.

- **Confirmed Decision 1**: Online Random Matchmaking replaces private room code typing with an instant 1-click "FIND 3v3 OPPONENT" button.
- **Confirmed Decision 2**: Story Campaign presents an interactive election map showing conquered states, regional party alliances, and unlocking boss Corruption.
- **Confirmed Decision 3**: Complete fix of physics timers, hitstop caps, corner bounce, and round transition callbacks to eliminate all corner stalls.

---

## 1. Overview & Core Concept

- **What It Delivers**:
  1. **3v3 Online Random Matchmaking**: One-click matchmaking that queues players into 3v3 team battles against active online players or authentic-feeling rivals.
  2. **Interactive Map of India Story Campaign**: Regional election conquest from Capital Delhi through Uttar Pradesh, West Bengal, and South/West coalitions, leading to the ultimate showdown with Boss Corruption.
  3. **Boss "Corruption" (Bhrashtachar)**: A unique non-playable boss archetype rendered as an imposing dark titan with multi-armed silhouette, golden Swiss vault locks, and screen-clearing super moves.
  4. **Corner Physics & Super Freeze Bug Fix**: Comprehensive elimination of infinite freezes during AI supers in corners.

---

## 2. User Experience & Visual Design

### Key User Flows

1. **Title Screen Update**:
   - Primary Modes:
     - `Story Campaign` (Conquer India & Defeat Corruption)
     - `3v3 Online Random Match` (Instant 1-Click Matchmaking)
     - `3v3 Team Battle` (Custom KOF vs AI)
     - `Local 2-Player` (Same Screen Brawl)
     - `Practice Lab & Guide`
2. **Interactive Map of India Story Mode**:
   - Visual SVG map of India highlighting regional electoral battlegrounds:
     - **Stage 1 (North - Delhi/UP)**: Against *Netaji Vikas* & *Bulldozer Baba*
     - **Stage 2 (East - Bengal/Bihar)**: Against *Didi Tigress* & *Bahubali Bhaiya*
     - **Stage 3 (National Alliance Floor)**: Against *Yuva Rahul*, *Muffler Babu*, & *Anchor Prime*
     - **Final Climax (The Vault of Corruption)**: Against colossal titan *Corruption*
   - Interactive state conquest indicators, pre-fight political rally banter, and victory proclamation headlines.
3. **3v3 Online Random Matchmaking Queue**:
   - Radar matchmaking overlay displaying: *"Searching for 3v3 Challenger..."* with active ping counter.
   - Pair with live peer or instant simulated rival with custom gamertags (e.g. `DelhiStriker_99`, `VikasBhai_2026`, `BengalTiger_X`).
   - Seamless transition into 3v3 character draft and battle.
4. **Guaranteed 3-Fighter KOF Elimination**:
   - Fighter 1 K.O. -> Fighter 2 drops in with entrance quote.
   - Fighter 2 K.O. -> Fighter 3 drops in with last-stand aura.
   - Only when Fighter 3 is knocked out is match victory/defeat declared.

### Visual Identity & Boss "Corruption" Design

- **Boss Palette**: Dark Obsidian (`#09090b`), Shadow Violet (`#4c1d95`), Glowing Neon Toxic Purple (`#c084fc`), and Swiss Vault Gold (`#eab308`).
- **Boss Silhouette**: Imposing 1.4x scale multi-armed silhouette with glowing violet eyes, floating black suitcases, scattered rupee note particles, and dark vortex aura.
- **Boss Special Moves**:
  - *Scam Shockwave*: Expels a ground-clearing shockwave of shredded files.
  - *Horse-Trading Grab*: Unblockable shadowy chain grab that drains 20% super meter.
  - *Black Money Tsunami (MAX Super)*: Tidal wave of black briefcases and shadowy tentacles crashing across the arena.

---

## 3. Key Product Decisions & Bug Fixes

- **Corner Super Freeze Glitch Root Cause & Fix**:
  - *Cause*: When an AI activated a super while the opponent was trapped at the corner boundary (`x <= 35` or `x >= arenaWidth - 35`), `f.vx = f.facing * 440` continually pushed against the boundary, while `hitstopTimer` or lingering attack state prevented physics settling.
  - *Fix*:
    1. Added a **Corner Wall Bounce** mechanism: when an opponent hits the corner wall during hitstun, they rebound slightly inward by 40px with a dust crack, decoupling the two fighters.
    2. Hard-clamped `superFreezeTimer` to a max duration of 0.35s and decoupled it from physics state recovery.
    3. Added a fail-safe state watchdog: if any fighter stays in an attack or super state for $> 1.4\text{s}$, the engine forcefully resets them to `IDLE` with `vx = 0`.
    4. Ensured round-transition timers clear and trigger reliably regardless of corner positions.
- **Strict 3-Loss Rule for 3v3**:
  - Enforced check `teamIndex >= 2` before `endMatch` can ever be invoked in 3v3 mode. Rounds 1 and 2 always promote the next reserve fighter.

---

## 4. Technical Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        App.tsx (Game Shell)                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Modes: [STORY_MAP] | [RANDOM_ONLINE] | [3v3_TEAM] | [LOCAL_2P]   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│             │                                 │                        │
│             ▼                                 ▼                        │
│  ┌───────────────────────┐       ┌──────────────────────────────────┐  │
│  │ StoryCampaignMap.tsx  │       │ RandomMatchmakingModal.tsx       │  │
│  │ - SVG India Map       │       │ - Auto-queue radar               │  │
│  │ - 4 Regional Stages   │       │ - Live peer & instant rival pool │  │
│  │ - Boss Corruption Arc │       │ - Direct 3v3 launch              │  │
│  └───────────────────────┘       └──────────────────────────────────┘  │
│             │                                 │                        │
│             └────────────────┬────────────────┘                        │
│                              ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ BattleArena.tsx (Canvas Engine)                                  │  │
│  │  - Fixed Corner Pushback & Wall Bounce Physics                   │  │
│  │  - Strict 3-Fighter Elimination Counter (No early match end)     │  │
│  │  - Boss Corruption Sprite & Custom Titan AI                      │  │
│  │  - Fail-safe state watchdog timers                               │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```
