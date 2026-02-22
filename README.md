# ✈️ Skytinker

A 3D physics-based game where you build custom aircraft and fly them through obstacles. Built with React + Three.js.

![Game Preview](public/captaindylan.png)

---

## 🎮 How to Play

### New Players
Jump straight into flight mode with a pre-built aircraft. After your first crash, create an account and follow the interactive tutorial to learn building.

### Build Mode
1. Select a part type from the toolbar (Fuselage, Wing, Engine, Cockpit)
2. Click the ground to place parts
3. Click existing parts to stack and build 3D structures
4. Need at least 1 engine to fly

### Flight Mode
1. Click "🚀 Start Flight"
2. Hold SPACE or tap screen to rise
3. Release to descend
4. Navigate through obstacle gaps to score
5. Avoid collisions

---

## ✨ Features

- **Dual-mode gameplay** — Build your aircraft, then test it in a Flappy Bird-style challenge
- **Real physics** — Vehicle weight, thrust, and center of mass affect flight behavior
- **4 part types** — Fuselage, Wings, Engines, Cockpit with unique physics properties
- **VIP system** — Golden parts with lighter weight and more power
- **Global leaderboard** — Real-time rankings via Supabase
- **Account system** — Nickname + optional PIN, with account recovery
- **8-step tutorial** — Interactive onboarding with auto-detection of player actions
- **8 languages** — EN, ZH-CN, ZH-TW, JA, KO, DE, RU, FR
- **Mobile optimized** — Touch controls, fallback collision detection for mobile browsers
- **Sound effects** — Place, remove, flap, crash, score

---

## 🚀 Quick Start

```bash
npm install
npm run dev
```

Visit: http://localhost:5173

### Supabase Setup (optional, for leaderboard)

```bash
cp .env.example .env
```

Fill in your Supabase credentials in `.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for details.

---

## 📦 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite |
| 3D Rendering | Three.js, React Three Fiber, @react-three/drei |
| Physics | Cannon.js (@react-three/cannon) |
| State | Zustand (with persist middleware) |
| Backend | Supabase (PostgreSQL) |
| Deployment | Vercel |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── BuildingSystem.jsx    # Grid-based building with boundary limits
│   ├── FlightSystem.jsx      # Physics-driven Flappy Bird mechanics
│   ├── ObstacleManager.jsx   # Procedural obstacle generation
│   ├── Ground.jsx            # Build area with visual boundaries
│   ├── Scene.jsx             # 3D scene orchestration
│   ├── models/               # 3D part models (Roblox-style)
│   └── UI/
│       ├── AccountModal.jsx  # Account create/recover (Safari-compatible)
│       ├── TutorialOverlay.jsx # 8-step interactive tutorial
│       ├── Leaderboard.jsx   # Global rankings
│       ├── GameOverModal.jsx # Score display + restart
│       ├── Toolbar.jsx       # Part selection
│       ├── ModeToggle.jsx    # Build/Flight switch
│       └── VIPShop.jsx       # VIP membership
├── store/
│   └── useGameStore.js       # Zustand store (new user flow + persistence)
├── constants/
│   └── gameConstants.js      # Physics config, part stats, build limits
├── i18n/                     # 8-language translation system
├── services/
│   └── leaderboard.js        # Supabase API calls
├── hooks/
│   └── useSound.js           # Audio system
└── lib/
    └── supabase.js           # Supabase client
```

---

## 🔧 Development

```bash
npm run dev       # Start dev server
npm run build     # Production build
npm run preview   # Preview production build
npm run lint      # ESLint check
```

---

## 📄 License

MIT
