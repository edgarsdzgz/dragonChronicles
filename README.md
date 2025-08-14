# 🐉 Dragon Forge Chronicles

An idle/incremental dragon combat game built with SvelteKit where players command a stationary dragon through increasingly challenging encounters.

## 🎮 Game Overview

- **Stationary Combat**: Dragon remains in position while enemies approach in tactical arc formations
- **Arcana Collection**: Defeat enemies to collect magical essence for character progression  
- **Temporary Enchants**: Enhance dragon stats (Firepower/Scales) during journey expeditions
- **Distance Progression**: Travel through levels based on cumulative distance with logarithmic scaling
- **Strategic Respec**: Return home to equip new gear/allies, restarting journey with enhanced capabilities

## 🚀 Current Status

**MVP Development Phase** - Core combat and progression systems in active development.

### Implemented Features
- ✅ Basic project structure and SvelteKit setup
- ✅ Game design document and technical architecture
- ✅ Development workflow and documentation system

### In Development
- 🔄 Dragon combat area with arc formation enemies
- 🔄 Arcana currency and collection system
- 🔄 Enchantment progression bars (Firepower/Scales)
- 🔄 Distance-based level advancement
- 🔄 Journey management and reset mechanics

## 🛠️ Technology Stack

- **Frontend**: SvelteKit + TypeScript
- **Game Logic**: Web Workers for performance
- **Storage**: IndexedDB via Dexie
- **Build**: Vite + ESBuild
- **Testing**: Vitest

## 🏗️ Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

## 📋 Project Structure

```
src/
├── lib/
│   ├── components/     # Svelte components
│   ├── stores/         # Game state management
│   ├── types/          # TypeScript definitions
│   └── workers/        # Game logic workers
├── routes/             # SvelteKit routes
└── app.html            # Main app template

LEGACY/                 # Previous implementation (preserved)
GDD.md                  # Game Design Document
CLAUDE.md              # AI Assistant context
```

## 🎯 Game Design

The core gameplay loop centers around **meaningful progression through temporary enhancement**:

1. **Journey Start**: Begin expedition with current dragon capabilities
2. **Combat Loop**: Advance → Fight → Collect Arcana → Enhance Stats
3. **Strategic Reset**: Return home to respec equipment/allies, restart journey stronger
4. **Distance Progression**: Each level requires increasing distance with logarithmic scaling

See [GDD.md](GDD.md) for complete design specification.

## 🤝 Contributing

This is currently a personal project in early development. The codebase and game design are evolving rapidly as we establish core mechanics.

## 📄 License

MIT License - See LICENSE file for details

---

**Latest Update**: 2025-08-14 - MVP architecture design and fresh implementation start# dragonChronicles
