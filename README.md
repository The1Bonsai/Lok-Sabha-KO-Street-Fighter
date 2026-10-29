# 🥊 Lok Sabha KO: Street Yoddha (लोकसभा KO)

> **Retro Neo Geo / King of Fighters (KOF) style 2D arcade fighting game** featuring satirical archetypes of Indian politics, fiery street leaders, bahubali strongmen, media anchors, and an epic story campaign culminating against the colossal Titan Boss: **Bhrashtachar (Corruption)**!

![Game Banner](https://img.shields.io/badge/Status-Playable-brightgreen?style=for-the-badge)
![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Stack-React_19_|_Vite_|_Tailwind_CSS_4_|_TypeScript-61dafb?style=for-the-badge)
![Controls](https://img.shields.io/badge/Controls-Keyboard_|_Mobile_Touch_|_Local_2P-orange?style=for-the-badge)

---

## 🎮 Live Game & Demo

- **Development Build**: Check your local development server at `http://localhost:3000`
- **Supported Platforms**: Modern Desktop Browsers (Chrome, Edge, Firefox, Safari) and Mobile / Tablets (with responsive touch virtual arcade joystick & buttons).

---

## ⚡ Key Features

- **🏆 3v3 Team Battle (KOF Rules)**: Pick an order of 3 fighters. Defeated fighters are eliminated; winning fighters stay with remaining health until the full squad is defeated.
- **🌐 3v3 Online Random Matchmaking**: Seamless random player-vs-player matching with automatic instant bot fallback so you never wait for a brawl.
- **🗺️ Story Campaign (Conquest of India)**: An interactive 4-zone campaign map spanning North, East, South/West, and the Capitol, concluding in a climactic showdown against **Titan Boss: Bhrashtachar**.
- **👥 Local 2-Player Head-to-Head**: Two players fight simultaneously on a single keyboard.
- **🔊 Real Voice Lines & Viral Indian Audio**:
  - Netaji: *"Mitron! 56-inch power!"*
  - Yuva: *"Khatakhat! Mohabbat ki dukan!"*
  - Didi: *"Ramba Ramba Khamba Khamba!"*
  - Muffler: Authentic cough barrage & whistleblowing.
  - Bahubali: *"Gaddari karbe?!"*
  - Anchor: *"The Nation Wants to Know!"*
  - Viral SFX: *Aayein?* on parries, *Moye Moye* at critical health, *Systumm!* on heavy blows.
- **📱 Responsive Mobile Virtual Pad**: Floating 8-way directional thumbstick and Neo Geo arcade button cluster (LP, HP, LK, HK, ROLL, SUPER).

---

## 🕹️ Controls Guide

### 🧑‍💻 Player 1 (Default / Single Player)

| Action | Keyboard Key | Description |
| :--- | :---: | :--- |
| **Move Left / Right** | `A` / `D` | Step forward or walk back (holding back auto-guards) |
| **Jump** | `W` | Jump upward (or diagonal with `A`/`D`) |
| **Crouch / Low Stance** | `S` | Crouch down (sitting punches/kicks and low defense) |
| **Light Punch (LP)** | `J` | Fast jab (4 DMG) |
| **Heavy Punch (HP)** | `U` | Powerful roundhouse blow (8 DMG) |
| **Light Kick (LK)** | `K` | Quick shin kick (5 DMG) |
| **Heavy Kick (HK)** | `I` | Heavy sweep kick (9 DMG) |
| **Special Move 1** | `S` + `D` + `J` or `U` | Fireball / Acoustic Projectile (`↓ ↘ → + P`) |
| **Special Move 2** | `S` + `D` + `K` or `I` | Anti-Air / Rush Attack (`↓ ↘ → + K`) |
| **Emergency Roll** | `Spacebar` | Invincible forward/backward dodge through attacks |
| **MAX Super Move** | `Q` | Screen-shattering cinematic super (requires 100% meter) |

---

### 🥊 Player 2 (Local 2-Player Mode on Same Keyboard)

| Action | Keyboard Key |
| :--- | :---: |
| **Move / Jump / Crouch** | `Arrow Keys (←, ↑, ↓, →)` |
| **Light Punch (LP)** | `B` |
| **Heavy Punch (HP)** | `G` |
| **Light Kick (LK)** | `N` |
| **Heavy Kick (HK)** | `H` |
| **Emergency Roll** | `M` |
| **MAX Super Move** | `Y` (at 100% Super Meter) |

---

### 📱 Mobile & Tablet Touch Controls

When opened on touch-enabled devices, on-screen arcade controls automatically appear:
- **Virtual 8-Way Joystick** on the left thumb for walking, ducking, and jumping.
- **Action Cluster** on the right thumb:
  - `LP` (Light Punch) & `HP` (Heavy Punch)
  - `LK` (Light Kick) & `HK` (Heavy Kick)
  - `ROLL` (Cyan emergency dodge button)
  - `SUPER` (Gold glowing ultimate button when gauge is full)

---

## 🎭 Fighter Roster

| Icon | Fighter | Archetype | Signature Specials & Super |
| :---: | :--- | :--- | :--- |
| 🪷 | **Netaji Vikas** | Ruling Supremo | *Mann Ki Awaaz*, *Mitron Blitz*, *56-Inch Sledge* |
| ✋ | **Yuva Aandolan** | Dynastic Striker | *Mohabbat Uppercut*, *Padyatra Flurry*, *Bharat Jodo Hurricane* |
| 🪓 | **Didi Hawaitan** | Street Rebel | *Hawai Chappal Whirl*, *Dharna Stance*, *Khela Hobe Storm* |
| 🧣 | **Muffler Comrade** | Whistleblower | *Cough Cannon*, *Dharna Sit-In*, *Mohalla Super Raid* |
| 🔫 | **Bahubali Bihari** | Regional Strongman | *Katta Quickdraw*, *Gamchha Snare*, *Gaddari Karbe Slam* |
| 🚜 | **Baba Bulldozer** | Heavy Enforcer | *Bulldozer Charge*, *Encounter Axe Kick*, *Baba Bulldozer Justice* |
| 📢 | **Nation Anchor** | Prime Time Megaphone | *Decibel Shockwave*, *Prime Time Debate*, *Nation Wants to Know* |
| 👁️ | **Titan Boss: Bhrashtachar** | Final Boss (Story) | *Black Money Storm*, *Scam Shockwave*, *System Collapse* |

---

## 🚀 Getting Started (GitHub & Local Development)

Follow these instructions to run or deploy the game locally on your machine.

### Prerequisites

Ensure you have **Node.js** (v18.0 or later) and **npm** or **bun** installed:
```bash
node -v
npm -v
```

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/lok-sabha-ko.git
cd lok-sabha-ko
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Start the Development Server
```bash
npm run dev
```
Open your browser and navigate to:
```
http://localhost:3000
```

### 4. Build for Production
To create an optimized production build:
```bash
npm run build
```
You can preview the production bundle locally with:
```bash
npm run preview
```

### 5. Typecheck & Lint
```bash
npm run lint
```

---

## 🌐 Deploying to GitHub Pages / Vercel / Netlify

### Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Build Command: `npm run build`
3. Output Directory: `dist`
4. Deploy!

### GitHub Pages
1. In `vite.config.ts`, ensure `base: './'` is configured.
2. Push to your `main` branch.
3. Enable GitHub Actions or deploy the `dist/` folder to `gh-pages`.

---

## 📂 Project Architecture

```
├── index.html                   # HTML entry point with retro arcade fonts
├── package.json                 # Project dependencies and run scripts
├── tsconfig.json                # TypeScript compiler configuration
├── vite.config.ts               # Vite bundler configuration
├── src/
│   ├── main.tsx                 # React DOM bootstrapping
│   ├── App.tsx                  # Main game state manager (Title, Select, Battle, Victory)
│   ├── index.css                # Global CSS & Tailwind styling
│   ├── audio/
│   │   └── soundEngine.ts       # Web Audio API + Speech synthesis for viral reel soundbites
│   ├── components/
│   │   ├── TitleScreen.tsx      # Arcade title screen with flashing "INSERT COIN"
│   │   ├── CharacterSelect.tsx  # KOF 3v3 order select & fighter showcase
│   │   ├── BattleArena.tsx      # Canvas renderer, HUD, super gauge, comic hit effects
│   │   ├── VictoryModal.tsx     # Match summary, Next Chapter & PvP next opponent matching
│   │   ├── MoveListModal.tsx    # In-game rulebook and command list
│   │   ├── OnlineLobbyModal.tsx # Room-based peer lobby
│   │   ├── RandomMatchmakingModal.tsx # 3v3 live matchmaking with instant bot fallback
│   │   ├── StoryCampaignMap.tsx # Interactive election conquest map of India
│   │   └── TouchControls.tsx    # Virtual arcade stick and buttons for mobile
│   ├── game/
│   │   ├── engine.ts            # High-performance 60FPS physics, combat & AI engine
│   │   ├── fightersData.ts      # 8 character definitions, stats, specials, and voice lines
│   │   ├── spriteRenderer.ts    # Retro procedural sprite and visual effects renderer
│   │   └── stagesData.ts        # 5 detailed Indian stages (Jantar Mantar, Parliament, etc.)
│   ├── network/
│   │   └── peerNetwork.ts       # Real-time multi-client communication protocol
│   └── types/
│       └── game.ts              # TypeScript interfaces for fighters, combat, and state
└── README.md                    # Project documentation & GitHub instructions
```

---

## 💡 Gameplay Tips & Pro Strats

1. **Auto-Guard**: Simply walk backwards (`A` when facing right) to block incoming regular attacks and reduce damage by 75%.
2. **Close-Quarters Brawling**: Sitting attacks (`S + J` or `S + K`) hit low and can catch opponents off guard.
3. **Emergency Roll**: Press `Spacebar` while under heavy projectile pressure to roll invincibly through fireballs and close the gap.
4. **Super Armor**: Beware of Titan Boss *Bhrashtachar* — heavy attacks do not flinch him when his armor is active!
5. **Combo Building**: Cancel a light punch (`J`) into a special move (`↓ ↘ → + P`) to launch opponents into a juggle state and charge your Super Meter!

---

## ⚖️ Satire & Fair Use Disclaimer

*Lok Sabha KO: Street Yoddha* is a satirical parody and creative tribute to retro arcade fighting games. All characters, names, dialogue, and depictions are humorous fictional caricatures inspired by public discourse and popular media culture. No real individuals, political organizations, or parties are directly represented or disparaged.

---

## 📜 License

Distributed under the Apache-2.0 License. See `LICENSE` for details.
