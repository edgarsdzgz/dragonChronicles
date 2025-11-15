--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/04*Progression*Maps*Wards*Lands.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 04 — Progression: Maps, Wards & Lands

## World Structure Hierarchy

### Geographic Organization

````text

World
├── Lands (Major Regions)
│   ├── Land 1: Horizon Steppe (Tutorial/Starting Area)
│   ├── Land 2: Ember Reaches (Fire-themed)
│   ├── Land 3: Mistral Peaks (Wind/Ice-themed)
│   └── Land 4+: Additional Lands (Post-Launch)
│
└── Wards (Sub-Regions within Lands)
    ├── Ward 1: Tutorial Plains (D0-D1)
    ├── Ward 2: Main Plains (D1-D2)
    ├── Ward 3: Advanced Plains (D2-D3)
    └── Ward N: Boss Gates (Distance Milestones)

```javascript

### Distance Progression System

- **Distance Units**: Meters from Draconia (starting point)

- **Micro-Ramps**: +1% scaling every 5m early, every 10m later

- **Ward Bumps**: Major scaling increases at ward boundaries

- **Boss Gates**: Significant difficulty spikes with unique encounters

## Land Design Philosophy

### Land Naming Convention

**Rule**: Dragons name lands **for themselves**, not their foes. Land names must reflect **local geography/culture** and remain **positive/neutral**, regardless of invading forces.

**Examples**:

- ✅ **Horizon Steppe** — peaceful inner rim grasslands

- ✅ **Ember Reaches** — volcanic mountain ranges

- ✅ **Mistral Peaks** — high-altitude wind-swept mountains

- ❌ ~~"Goblin Wasteland"~~ — enemy-focused naming

- ❌ ~~"Dark Lord's Domain"~~ — negative/foe-centric naming

### Land Progression Flow

1. **Discovery**: New lands revealed through story progression

1. **Access**: Unlocked by defeating previous land's final boss

1. **Exploration**: Multiple wards within each land

1. **Mastery**: Complete all wards to unlock next land

## Ward System Architecture

### Ward Scaling Formula

```typescript

export interface Ward {
  id: number;
  landId: number;
  name: string;
  distanceRange: [number, number]; // [startM, endM]
  distStepM: number; // micro-ramp interval
  bump: number; // ward-level scaling multiplier
  bossId?: number; // optional boss at end
  eliteInterval?: number; // seconds between elite spawns
}

export function wardBump(ward: number, mult = 1, bump = 1.22) {
  return mult * Math.pow(bump, ward - 1);
}

export function microRamp(distM: number, stepM: number, inc = 0.01) {
  return 1 + Math.floor(distM / stepM) * inc;
}

```text

### Ward Types by Distance

#### **Tutorial Wards (D0-D1)**

- **Distance**: 0-1000m from Draconia

- **Scaling**: Gentle introduction, +1% every 5m

- **Enemies**: Basic units, simple AI patterns

- **Bosses**: Tutorial boss with telegraph windows

- **Purpose**: Onboarding, system introduction

#### **Early Wards (D1-D2)**

- **Distance**: 1000-2000m from Draconia

- **Scaling**: Standard progression, +1% every 10m

- **Enemies**: Mixed units, basic elemental counterplay

- **Bosses**: First real challenge encounters

- **Purpose**: Core loop mastery, first research unlocks

#### **Mid-Game Wards (D2-D5)**

- **Distance**: 2000-5000m from Draconia

- **Scaling**: Accelerated difficulty, ward bumps increase

- **Enemies**: Complex formations, advanced AI

- **Bosses**: Multi-phase encounters with mechanics

- **Purpose**: Research system depth, tier progression

#### **Late-Game Wards (D5+)**

- **Distance**: 5000m+ from Draconia

- **Scaling**: Exponential difficulty curves

- **Enemies**: Elite formations, boss-like minions

- **Bosses**: Epic encounters with multiple mechanics

- **Purpose**: Endgame content, mastery challenges

## Content Distribution Strategy

### Land 1: Horizon Steppe (Complete Specification)

**Status**: Fully specified in Region R01 documentation

#### Ward Breakdown:

- **Ward 1**: Sunwake Downs (D0-D0.5) — Tutorial area

- **Ward 2**: Waystone Mile (D0.5-D1.0) — Basic progression

- **Ward 3**: Skylark Flats (D1.0-D1.5) — Air combat introduction

- **Ward 4**: Longgrass Reach (D1.5-D2.0) — Accuracy challenges

- **Ward 5**: Bluewind Shelf (D2.0-D2.5) — Crosswind mechanics

- **Ward 6**: Old Hoard Road (D2.5-D3.0) — Caravan encounters

- **Ward 7**: First Horizon (D3.0+) — Boss approach area

### Land 2: Ember Reaches (Design Framework)

**Status**: Framework established, detailed specification pending

#### Conceptual Framework:

- **Theme**: Volcanic mountain ranges, fire-elemental focus

- **Faction**: Flame-Touched Cultists (fire-worshipping invaders)

- **Mechanics**: Heat mechanics, lava hazards, fire resistance

- **Boss**: Forge-Master of the Inferno (multi-phase fire encounter)

### Land 3: Mistral Peaks (Design Framework)

**Status**: Framework established, detailed specification pending

#### Conceptual Framework: (2)

- **Theme**: High-altitude wind-swept mountains, ice/wind focus

- **Faction**: Storm-Callers (elemental weather manipulators)

- **Mechanics**: Weather systems, altitude effects, wind currents

- **Boss**: Tempest Lord of the Peaks (weather control encounter)

## Progression Gates & Checkpoints

### Distance Milestones

- **D1.0**: First boss gate (Khagan of the Sirocco)

- **D2.0**: Research Lab Level 2 unlock

- **D3.0**: First Fire Tier unlock (Blue)

- **D5.0**: Land 2 access gate

- **D10.0**: Major milestone (prestige system consideration)

### Research Gates

- **Lab Level 1**: Basic Firecraft nodes

- **Lab Level 2**: Safety node introduction

- **Lab Level 3**: Scales integration

- **Lab Level 4**: Advanced Firecraft

- **Lab Level 5+**: Tier-specific research

### Economic Gates

- **Arcana Thresholds**: Minimum Arcana required for progression

- **Soul Power Gates**: Permanent unlocks require Soul Power

- **Material Requirements**: Synth materials for advanced research

- **Astral Seal Gates**: Premium content access points

## Save & Progression Persistence

### Distance Tracking

```typescript

export interface ProgressState {
  currentLand: number;
  currentWard: number;
  currentDistanceM: number;
  maxDistanceReached: number;
  wardCompletions: Set<number>;
  bossDefeats: Set<number>;
  lastSaveDistance: number;
}

```text

### Checkpoint System

- **Auto-Save**: Every 100m of progression

- **Manual Save**: Return to Draconia triggers save

- **Boss Checkpoints**: Special saves after boss defeats

- **Land Transitions**: Save before entering new lands

### Progression Recovery

- **Death Handling**: Return to last checkpoint

- **Corruption Recovery**: Backup saves for data integrity

- **Version Migration**: Save format upgrades

- **Cross-Device Sync**: Optional cloud save integration

## Performance & Scaling Considerations

### Enemy Population Management

- **Active Limit**: ≤200 enemies on screen (burst to 400)

- **Spawn Rate**: Distance-based enemy density

- **Culling**: Off-screen enemy management

- **Pooling**: Object reuse for performance

### Distance-Based Optimization

- **LOD Systems**: Reduced detail at greater distances

- **Culling Zones**: Skip rendering distant objects

- **Memory Management**: Unload completed areas

- **Load Balancing**: Progressive content loading

### Scaling Mathematics

```typescript

// Enemy HP scaling
export function enemyHP(base: number, ward: number, distM: number, bump = 1.18) {
  const wardMultiplier = Math.pow(bump, ward - 1);
  const microRampMultiplier = microRamp(distM, 10, 0.01);
  return Math.floor(base * wardMultiplier * microRampMultiplier);
}

// Arcana reward scaling
export function arcanaReward(base: number, ward: number, distM: number) {
  const wardMultiplier = Math.pow(1.15, ward - 1);
  const distanceMultiplier = 1 + (distM / 1000) * 0.1;
  return Math.floor(base * wardMultiplier * distanceMultiplier);
}

```text

## Future Expansion Framework

### Content Pack System

- **Modular Design**: New lands as separate content packs

- **JSON Configuration**: Land/ward data in external files

- **Validation System**: Content integrity checking

- **Hot Loading**: Runtime content updates

### Seasonal Content

- **Limited-Time Lands**: Special events with unique mechanics

- **Holiday Themes**: Seasonal variations on existing content

- **Community Events**: Player-driven content additions

- **Competitive Modes**: Leaderboards and rankings

### Post-Launch Roadmap

- **Land 4**: Shadowmere (shadow-themed, post-Rift)

- **Land 5**: Crystal Caverns (earth/crystal themed)

- **Land 6**: Astral Nexus (cosmic/void themed)

- **Endgame**: Rift Siege content and NG+ systems

## Acceptance Criteria

- [ ] World structure hierarchy clearly defined and documented

- [ ] Ward scaling formulas implemented and tested

- [ ] Distance progression feels smooth and rewarding

- [ ] Boss gates provide appropriate difficulty spikes

- [ ] Land naming convention followed consistently

- [ ] Content distribution balanced across all wards

- [ ] Save system preserves progression accurately

- [ ] Performance targets met at all distance ranges

- [ ] Future expansion framework supports modular content

- [ ] Player progression feels meaningful and achievable
````
