--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/04*Progression*Maps*Wards*Lands.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 04 — Progression: Maps, Wards & Lands

## World Structure Hierarchy

### Geographic Organization

````text

World
├── Lands (Major Regions)
│   ├── R01: Horizon Steppe (Tutorial/Starting Area)
│   ├── R02: Ember Recess (Heat-themed)
│   ├── R03: Mistral Peaks (Energy/Cold-themed)
│   ├── R04: Riverglass Delta (Steam-themed)
│   ├── R05: Elderbough Crown (Mist-themed)
│   ├── R06: Gloamfen Mire (Void-themed)
│   ├── R07: Saffron Dunes (Plasma-themed)
│   ├── R08: Tideglass Coast (Lightning-themed)
│   ├── R09: Hollowspire Below (Ice-themed)
│   └── R10+: Additional Lands (Post-Launch)
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

- ✅ **Ember Recess** — warm basin of terraces and kiln-caves

- ✅ **Mistral Peaks** — high-altitude wind-swept mountains

- ✅ **Riverglass Delta** — braided channels and mirror shallows

- ✅ **Elderbough Crown** — high treelines and living bridges

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
**Total Wards**: 22 named wards
**Distance Range**: D0 → D110km
**Complete Lore**: See [Horizon Steppe Ward Lore](Horizon_Steppe_Ward_Lore.md)

#### Ward Breakdown:

**Starting Wards (Draconia's Gates)**
- **Ward 1**: The Parting Stones (D0→D5km) — Seven ancient stones at city gates
- **Ward 2**: Windwhisper Plains (D5km→D12.5km) — Wind-singing grasslands
- **Ward 3**: Sunstone Outlook (D12.5km→D25km) — Warm stones, information hub
- **Ward 4**: Embergrass Crossing (D25km→D50km) — Iron-grass ford with Pyrean bridge
- **Ward 5**: Stormwatch Frontier (D50km→D60km) — Old watchtowers, former border

**Early Journey (Transition to Wilds)**
- **Ward 6**: Sunwake Downs (D60km→D65km) — Tutorial picnic grounds
- **Ward 7**: Waystone Mile (D65km→D70km) — Ancient trade markers
- **Ward 8**: Skylark Flats (D70km→D75km) — Bird migration routes
- **Ward 9**: Longgrass Reach (D75km→D80km) — Erosion prevention gone wild
- **Ward 10**: Bluewind Shelf (D80km→D85km) — Glider training cliffs
- **Ward 11**: Old Hoard Road (D85km→D90km) — Mining convoy route

**Mid Journey (Rising Tension)**
- **Ward 12**: First Horizon (D90km→D93km) — Mountains first visible
- **Ward 13**: Windwhisper Plain (D93km→D96km) — Whistling rock formations
- **Ward 14**: Duskrunner's Stand (D96km→D99km) — Famous last stand site

**Rising Danger (Nomad Territory)**
- **Ward 15**: Thornhedge Crossing (D99km→D101km) — Natural barrier path
- **Ward 16**: Kite-Banner Flats (D101km→D103km) — Nomad communication zone
- **Ward 17**: Rumblefoot Trace (D103km→D105km) — Beast migration trail

**Final Approach (The Scorched Border)**
- **Ward 18**: Emberwatch Ridge (D105km→D106.5km) — View of eternal flame
- **Ward 19**: Scorchline Gap (D106.5km→D107.5km) — Vegetation death line
- **Ward 20**: Ashfall March (D107.5km→D108.5km) — Gray zone of volcanic ash
- **Ward 21**: Border's End (D108.5km→D109.5km) — Last fortifications
- **Ward 22**: Pyrean Gate (D109.5km→D110km) — The arch that refuses to fall
- **Boss Encounter**: Khagan of the Sirocco (D110km+) — Beneath Pyrean Gate

### Land 2: Ember Reaches (The Pyrean Commonwealth's Grave)

**Status**: Lore complete, mechanical specification in progress

#### Historical Context:

**Former Identity**: The Pyrean Commonwealth - Draconia's closest ally, a prosperous
federation of mixed races living in symbiosis with Lesser Drakes. Known for industrial
thaumaturgy and the philosophy of "controlled fire."

**The Fall**: The Pyrean Combustion - a catastrophic magical failure when the Crucible
Engine's Flame-Ward was corrupted by the Human-Wrought Evil. In three days, an entire
nation burned. 80% casualties. The Lesser Drakes became pain-mad Ember Wraiths.

**Current State**: A volcanic hellscape where former kiln-caves exhale poison, lava flows
bury agricultural terraces, and the Crucible Engine still burns at Mount Ashencrown - an
eternal wound visible from Draconia.

#### Mechanical Framework:

- **Theme**: Corrupted fire, volcanic devastation, heat accumulation

- **Faction**: Flame-Touched Cultists (survivors who embraced corruption as transcendence)

- **Mechanics**: Heat system (reduces accuracy, increases fire damage taken), lava hazards,
volcanic vents, ember storms, fire resistance challenges

- **Environmental Storytelling**: Melted Drake-Rider statues, half-finished ceramics fused
to volcanic glass, cultist camps in family home ruins, road signs to cities that no longer
exist

- **Boss**: Forge-Master of the Inferno (the Pyrean Archmage who built the Crucible Engine,
now completely insane, believes he achieved transcendence)

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
