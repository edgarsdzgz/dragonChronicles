# 03 — Shooter-Idle Core Loop

## Loop Diagram

````mermaid

flowchart LR
    Start[Begin Journey] --> Fight[Auto-combat & Abilities]
    Fight -->|Arcana + Soul Power| Research[Research Lab]
    Research -->|Discover Nodes| Unlock[Soul Power Unlock]
    Unlock -->|Arcana Spending| Level[Level Enchants]
    Level --> Fight
    Fight -->|Return Decision| Return[Return to Draconia]
    Return --> Synth[Synth Production]
    Synth --> Research
    Return --> Start

```text

## Core Systems Integration

### Distance & Progression

- **Distance System**: Continuous meters with micro-ramps every 5-10m

- **Ward Structure**: Each Ward contains multiple distance milestones

- **Land Progression**: Wards group into Lands with distinct biomes and factions

- **Scaling**: Enemy stats increase with distance using exponential curves

### Combat Mechanics

- **Auto-Combat**: Dragon automatically attacks enemies in range

- **Manual Abilities**: Player-triggered abilities contribute ~20% damage

- **Elemental System**: Fire/Ice/Lightning/Poison with tactical counters

- **Lane Objects**: Destructible environment pieces that buff enemies

### Research Discovery System

**Core Innovation**: Only **Ember Potency** and **Draconic Vitality** are visible at game start. All other nodes in Firecraft, Safety, and Scales trees are **hidden** until discovered via Research.

#### Research Lab Progression

```typescript

interface LabLevel {
  level: number;
  slots: number;      // Parallel research capacity
  queue: number;      // Queued research capacity
  topics: string[];   // Available research topics
}

const labProgression: LabLevel[] = [
  { level: 1, slots: 1, queue: 2, topics: ["Parabronchial Lungs"] },
{ level: 2, slots: 1, queue: 2, topics: ["Resin Still", "Piezo Cartilage", "Nozzle
Morphs"]
},
{ level: 3, slots: 2, queue: 3, topics: ["Oxygenator Gland", "Bombardier Pulse Reactor",
"Honeycomb
Kiln-Throat",
"Catalytic
Pilot
Comb",
"Electro
Arc
Organ"]
},
  // ... continues through L8+
];

```javascript

#### Research Costs

```typescript

interface ResearchTitle {
  title: string;
  nodeId: string;
  labMin: number;
  timeBand: 'S' | 'M' | 'L';  // Short/Medium/Long duration
  soulCost: number;
  materials: MaterialRequirement[];
}

interface MaterialRequirement {
  materialId: string;
  quantity: number;
}

```text

### Fire Tier System

**Global Risk States** that modify breath nature and increase self-hazard:

| Tier | Hazard Mult | Key Triggers | Effects |
|------|-------------|--------------|---------|
| Regular | 1.00 | Default | Baseline breath |
| Blue | 1.05 | Hydride≥6 + Oxygenator≥4 + Honeycomb≥1 | Smokeless, piercing jets |
| Green | 1.10 | Resin≥6 + Honeycomb≥3 + Swirl≥3 | Caustic DoT, armor melt |
| Purple | 1.15 | Arc Organ≥6 + Pulse Reactor≥3 + Variable Swirlers≥2 | Chain arcs, pulse
staggers
|
| Dark | 1.20 | Arc Organ≥4 + Pulse Rate Tuning + Oxy-Shunt | Terror ticks, overburn |
| Black | 1.25 | Napalm Fractionator + Dust Cyclone + Preheater≥4 | Smoke fields, stacking
DoT
|
| Holy | 1.30 | Honeycomb≥5 + Pilot Comb≥4 + Oxy-Shunt | Radiant vs corrupted,
self-cleanse
|
| Azure | 1.35 | Blue + Heater≥5 + Jet Discipline≥3 + Beam≥3 | Armor-piercing lance |
| Prismatic | 1.40 | Any 3 styles + Dual Split-Beams | Cross-style combos |
| Void | 1.50 | Black+Dark+Azure depth≥24 | Apex glass-cannon |

### Synth Production System

**Time-first production** with material tiers and rank loops:

#### Material Tiers

```typescript

enum MaterialTier {
  T1_BASE = 1,    // Aetherglass Pane, Runed Copper Wire
  T1_EXPANDED,    // Drakebone Resin, Ceramic Honeycomb, etc.
  T2_ADVANCED,    // Mythril Filament, Phoenix Ash, etc.
}

enum MaterialRank {
  NONE = 0,
  FINE = 1,
  GOOD = 2,
  SUPERIOR = 3,
  REFINED = 4,
  GREATER = 5,
  MAJESTIC = 6,
  ASCENDANT = 7,
  MYTHIC = 8,
  ROYAL = 9
}

```javascript

#### Production Formulas

```typescript

// Per-craft time calculation
function craftTime(material: Material, level: number, rank: MaterialRank): number {
  const baseTime = material.baseTime;
  const rankMult = RANK_MULTIPLIERS[material.tier][rank];
  const levelMult = Math.pow(1 + material.timeSlope, level - 1);
  const discounts = calculateDiscounts(level);

  return baseTime * rankMult * levelMult * (1 - discounts);
}

// Input quantity calculation
function inputQuantity(baseQty: number, level: number): number {
  const qtySlope = 0.35;
  return Math.ceil(baseQty * (1 + qtySlope * Math.floor((level - 1) / 10)));
}

```text

## Economic Flows

### Currency System

```typescript

interface Currencies {
  arcana: number;      // Run-bound, geometric growth ×1.12
  soulPower: number;   // Meta-permanent, growth ×1.90
  gold: number;        // QoL currency from item sales
  astralSeals: number; // Premium currency, cosmic lore
}

```text

### Progression Gates

1. **Discovery Gate**: Research reveals hidden nodes

1. **Soul Gate**: Soul Power unlocks discovered nodes

1. **Arcana Gate**: Arcana levels unlocked nodes during runs

1. **Safety Gate**: Scales nodes gate Safety usage

1. **Material Gate**: Synth materials enable research

### Arcana Economy

```typescript

// Per-kill Arcana (draft curve)
function arcanaPerKill(playerLevel: number): number {
  return 0.03 * Math.pow(1.40, playerLevel - 1);
}

// Node cost progression
function nodeCost(baseArcana: number, currentLevel: number): number {
  return Math.floor(baseArcana * Math.pow(1.17, currentLevel));
}

// Tier-up cost (15-25× last cost)
function tierUpCost(lastCost: number): number {
  return lastCost * (15 + Math.random() * 10); // 15-25× multiplier
}

```text

## Balancing Framework

### Heat & Risk Accounting

```typescript

interface HazardSystem {
  fireLoad: number;      // Weighted sum of Firecraft outputs × Tier Hazard
  safetyCapacity: number; // Sum of Safety mitigations (gated by Scales)
  chassisLimit: number;   // Structural allowances from Scales
}

// Self-damage calculation
function calculateSelfDamage(hazard: HazardSystem): number {
  const k1 = 0.005; // Tuning constant
  const k2 = 0.003; // Tuning constant

  let selfDamage = 0;
  if (hazard.fireLoad > hazard.safetyCapacity) {
    selfDamage += k1 * (hazard.fireLoad - hazard.safetyCapacity);
  }
  if (hazard.safetyCapacity > hazard.chassisLimit) {
    selfDamage += k2 * (hazard.safetyCapacity - hazard.chassisLimit);
  }

  return selfDamage;
}

```javascript

### Performance Budgets

- **Enemy Limits**: ≤200 ground, ≤400 total on screen

- **Projectile Limits**: ≤600 projectiles/second

- **Frame Rate**: 60fps desktop, ≥40fps mid-phones

- **Memory**: Pooled objects, efficient culling

## Offline Progression

### Offline Model

```typescript

interface OfflineProgress {
  linearHours: 8;        // Full rate progression
  decayStart: 8;         // When diminishing returns begin
  baseCap: 24;          // Base offline cap in hours
  metaCap: 96;          // META upgrade cap
  restedBonus: 0.5;     // +50% gains
  restedDuration: 15;   // 15 minutes of bonus
  restedCooldown: 30;   // 30 minutes active play required
}

function calculateOfflineGains(hoursOffline: number, metaLevel: number): number {
  const effectiveHours = Math.min(hoursOffline, getOfflineCap(metaLevel));

  if (effectiveHours <= 8) {
    return effectiveHours; // Linear progression
  } else {
    const linearGains = 8;
    const decayHours = effectiveHours - 8;
    const decayGains = decayHours * Math.exp(-decayHours / 12); // Exponential decay
    return linearGains + decayGains;
  }
}

```javascript

## Telemetry Events

### Core Loop Events

```typescript

type CoreLoopEvent =
  | { type: 'journey_start', distance: number, timestamp: number }
  | { type: 'enemy_kill', enemyId: string, arcanaGained: number }
  | { type: 'research_complete', nodeId: string, duration: number }
  | { type: 'node_unlock', nodeId: string, soulCost: number }
  | { type: 'enchant_level', nodeId: string, newLevel: number, arcanaCost: number }
  | { type: 'tier_unlock', tier: string, requirements: string[] }
  | { type: 'return*to*draconia', distance: number, arcanaSpent: number }
  | { type: 'offline_return', hoursOffline: number, gainsApplied: number };

```text

### Key Metrics to Track

- **Upgrade Cadence**: Target 30-45s early game, 60-75s mid-game

- **Research Completion**: Discovery rate vs Lab Level progression

- **Tier Progression**: Time to unlock each Fire Tier

- **Safety Usage**: Percentage of players investing in Safety per Tier

- **Return Frequency**: Average returns per hour of play

## Acceptance Criteria

- [ ] Core loop completes: Journey → Combat → Research → Unlock → Level → Return

- [ ] Only Ember Potency and Draconic Vitality visible at game start

- [ ] Research Lab progression gates discovery appropriately

- [ ] Fire Tier system increases both power and risk

- [ ] Synth production provides meaningful research materials

- [ ] Offline progression respects time caps and decay

- [ ] Performance budgets maintained under all conditions

- [ ] Telemetry captures all critical progression events

## Cross-References

- [Vision, Lore & North Star](01*Vision*Lore_World.md) - Design philosophy and constraints

- [Progression: Maps, Wards & Lands](04*Progression*Maps*Wards*Lands.md) - Distance and world structure

- [Abilities, Skills & Rituals](06*Abilities*Skills_Rituals.md) - Manual ability system

- [Economy: Currencies, Items, Market](07*Economy*Currencies*Items*Market.md) - Currency flows and balance

- [Balancing: Math, Curves & Tables](17*Balancing*Math*Curves*Tables.md) - Mathematical formulas and tuning
````
