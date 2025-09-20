# 18 — Region R01: Horizon Steppe

## Overview

**Region Code:** `REGION*R01*HORIZON_STEPPE`
**Canonical Short Name:** `Horizon Steppe`
**Tagline:** *Where sky kisses grass and home feels near.*
**Faction:** Wind-Taken Nomads (Veldtriders of the Open Steppe)

### World Context & Lore

The innermost prairie of the Dragonlands—wide, wind-brushed fields within sight of
Draconia's
spires..
Thermals rise warm and steady, wildflowers stripe the downs, and old waystones mark the
dragon
flight-paths
radiating
from
the
capital.
Though incursions whisper along distant horizons, this land remains largely unscarred.

**Naming Policy:** Dragons name their lands **for themselves**, not their foes. Land names reflect **local geography/culture** and remain **positive/neutral**, regardless of invading forces.

## Subzones & Landmarks

### Sunwake Downs

- **Description:** Golden grasses; tutorial stretch; gentle thermals (safe aim tests)

- **Visual:** Warm gold grasses, gentle rolling hills

- **Mechanical:** Tutorial area with reduced enemy aggression

- **Distance Range:** 0.0 - 0.5 km

### Waystone Mile

- **Description:** Line of ancient stone markers; distance gates & save icons

- **Visual:** Tall waystone monoliths with glowing runes

- **Mechanical:** Save points, distance milestones, lore fragments

- **Distance Range:** 0.5 - 1.0 km

### Skylark Flats

- **Description:** Constant updrafts; air skirmishes feel lively but forgiving

- **Visual:** Wide open plains with visible air currents

- **Mechanical:** Increased air unit spawns, wind effects on projectiles

- **Distance Range:** 1.0 - 1.5 km

### Longgrass Reach

- **Description:** Rolling swales; parallax grass "wobble" subtly tests accuracy

- **Visual:** Tall grass that sways and creates visual interference

- **Mechanical:** Accuracy debuffs from grass interference

- **Distance Range:** 1.5 - 1.8 km

### Bluewind Shelf

- **Description:** Low bluff; persistent crosswind challenges projectile travel

- **Visual:** Elevated terrain with visible wind streams

- **Mechanical:** Crosswind effects on projectiles, elevation advantages

- **Distance Range:** 1.8 - 2.0 km

### Old Hoard Road

- **Description:** Caravan trail from Draconia; lore chips and small chests

- **Visual:** Ancient stone road with scattered treasures

- **Mechanical:** Treasure spawns, lore fragments, bonus ARCANA

- **Distance Range:** 2.0 - 2.2 km

### First Horizon

- **Description:** Panoramic ridge; boss approach with skyline staging

- **Visual:** Dramatic ridge line with Draconia visible in distance

- **Mechanical:** Boss encounter area, dramatic camera angles

- **Distance Range:** 2.2+ km (Boss Gate)

## Visual & Audio Design

### Color Palette

- **Primary:** Warm golds (grass), soft teals (sky), crisp whites (clouds)

- **Secondary:** Muted slate (waystones), earth browns (paths)

- **Accent:** Zephyr blue (wind effects), banner reds (enemy standards)

### Visual Effects

- Heat shimmer above grass

- Seed-fluff motes drifting on wind

- Rippling grass sheets responding to wind

- Low-opacity dust curls at ground level

- Wind-carried particle effects

### Audio Ambience

- **Primary:** Skylark trills, grass whisper

- **Secondary:** Distant bell of Draconia carried by wind

- **Dynamic:** Occasional gusts panning L↔R

- **Combat:** Flap-snap cloth, hooffall tremolo, gusty hit-sounds

## Wind-Taken Nomads Faction

### Faction Overview

**Vibe:** Plains megafauna and sail-kites ridden by airy revenants. They sculpt crosswinds with banners and kites, scatter dust veils, and use skyhooks/bolas to tug even dragons off-line.

**Lore:** The portal's first shockwave twisted jetstreams over the steppe. Ancient steppe spirits hitched onto migrating herds and war-standards, forming a mobile storm-cult sworn to "claim every horizon."

### Visual & Sound Motifs

- **Look:** Sun-bleached banners, bone pennants, turquoise fetishes; tawny hides; taut cloth rigs; drifting dust devils

- **FX:** Flap-snap cloth, hooffall tremolo, gusty hit-sounds, singing lines on kites

### Combat Signature

- **Crosswind Control:** Temporary wind walls deflect some projectiles

- **Tethers & Pulls:** Skyhooks/bolas apply short drag/slow, nudging aim timing

- **Lane Objects:** Planted banners, kites, and gust totems are destructibles that buff allies until burned or overcharged

## Enemy Unit Specifications

### Banner-Runner (Ground Support)

```typescript

interface BannerRunner {
  id: 'WT*BANNER*RUNNER';
  class: 'support_emplacement';
  laneType: 'ground';
  stopArc: 'mid'; // ≈260px from player

  // Stats
  baseHP: 110;
  baseDMG: 6; // per second (contact)
  moveSpeed: 1.15;
  attackCooldown: 0; // emplacement

  // Abilities
  primary: 'plant_standard'; // Plants Zephyr Banner
  secondary: 'reposition'; // Evade cone/AoE

  // Counters
  fireWeakness: 'burns_banner';
  lightningWeakness: 'stuns*during*plant';

  // Rewards
  arcana: 10; // base + lane object bonus when banner dies
}

```bash

### Skyhook Lancer (Ground Skirmisher)

```typescript

interface SkyhookLancer {
  id: 'WT*SKYHOOK*LANCER';
  class: 'skirmisher';
  laneType: 'ground';
  stopArc: 'short'; // ≈140px from player

  // Stats
  baseHP: 130;
  baseDMG: 14; // per hook
  moveSpeed: 1.2;
  attackCooldown: 2.8;

  // Abilities
  primary: 'skyhook_toss'; // 0.6s drag + 10% slow
  secondary: 'hop*step*back'; // i-frames 0.2s

  // Counters
  iceWeakness: 'extends*throw*cd';
  lightningWeakness: 'stun*mid*windup';

  // Rewards
  arcana: 12;
}

```javascript

### Dust-Mane Strider (Ground Bruiser)

```typescript

interface DustManeStrider {
  id: 'WT*DUSTMANE*STRIDER';
  class: 'bruiser_mount';
  laneType: 'ground';
  stopArc: 'before_short'; // Just before short arc

  // Stats
  baseHP: 220;
  baseDMG: 32; // 8×4 ticks
  moveSpeed: 1.0;
  attackCooldown: 4.5;

  // Abilities
  primary: 'trample_cone'; // Accuracy debuff 8% for 2.0s
  secondary: 'snort'; // Minor knock, 0.1s
  vulnerability: 'takes*+25%*dmg*while*trampling';

  // Counters
  poisonWeakness: 'bleed_through';
  fireWeakness: 'burn*mane*cancels*next*trample';

  // Rewards
  arcana: 16;
}

```javascript

### Kite-Sail Corsair (Air Harasser)

```typescript

interface KiteSailCorsair {
  id: 'WT*KITESAIL*CORSAIR';
  class: 'harasser*area*denial';
  laneType: 'air';
  stopArc: 'variable_drift'; // S-curve drift pattern

  // Stats
  baseHP: 95;
  baseDMG: 15; // 5×3 volley
  moveSpeed: 1.1; // glide
  attackCooldown: 3.0;

  // Abilities
  primary: 'crosswind_wall'; // Channel, deflects 20% light projectiles for 2.2s
  secondary: 'dart_volley'; // 3 weak darts

  // Counters
  lightningWeakness: 'rigging*collapse*self*stuns*1.0s';
  fireWeakness: 'burn*through*after_1s';

  // Rewards
  arcana: 11;
}

```javascript

### Bola Whisper (Air Controller)

```typescript

interface BolaWhisper {
  id: 'WT*BOLA*WHISPER';
  class: 'controller';
  laneType: 'air';
  stopArc: 'mid_hover'; // Mid-arc hover

  // Stats
  baseHP: 80;
  baseDMG: 10; // per bola
  moveSpeed: 1.0;
  attackCooldown: 3.2;

  // Abilities
primary: 'bola_toss'; // Grounding debuff 1.5s to air adds; −12% aim speed to player for
1.2s
  secondary: 'drift_veil'; // Tiny dust cloud reduces crit UI clarity 1.0s

  // Counters
  iceWeakness: 'bolas*shatter*on*throw*negates_debuff';
  burstWeakness: 'low*HP*vulnerable';

  // Rewards
  arcana: 10;
}

```javascript

### Totem-Breaker (Ground Elite)

```typescript

interface TotemBreaker {
  id: 'WT*TOTEM*BREAKER';
  class: 'elite';
  laneType: 'ground';
  stopArc: 'short'; // ≈140px from player

  // Stats
  baseHP: 520; // Elite ×3.2 HP multiplier
  baseDMG: 20; // burst + pulses
  moveSpeed: 0.85;
  attackCooldown: 5.0;

  // Abilities
  primary: 'hammer_slam'; // Small quake, 14 + 6 shock
  secondary: 'totem_drop'; // Drops Gust Totem
  special: 'weakpoint_exposure'; // Back-plate weakpoint during slam

  // Counters
  lightningWeakness: 'interrupt*and*extends_weakpoint';
  dashWindow: 'weakpoint*exposed*during_slam';

  // Rewards
  arcana: 35; // +10% if totem destroyed before 2 pulses
}

```text

## Boss: Khagan of the Sirocco

### Boss Overview

**Description:** A colossal ridge-beast draped in a canopy of war-kites and pennants.

**Base Stats (pre-scale):**

- HP: 14,000

- Body DMG: 24/s

- Volley: 18×6 over 3s

- Shielded Kites HP: 300 each

### Phase Progression

#### Phase 1: Bannerline

- **Duration:** 0-40s or until 2 standards destroyed

- **Mechanic:** Plants three Sirocco Standards across the lane

- **Effect:** Overlapping crosswinds create wind walls

- **Counters:**

  - Lightning overcharge = 1.0s stun

  - Fire burns faster

  - Ice slows wind drift 30%

#### Phase 2: Stampede Call

- **Trigger:** 2+ standards destroyed OR 40s elapsed

- **Mechanic:** Summons Dust-Mane waves

- **Effect:** Boss gains 25% damage reduction until ≥2 standards destroyed

- **Strategy:** Focus fire on remaining standards

#### Phase 3: Bola Tempest

- **Trigger:** Stampede waves cleared

- **Mechanic:** Rotating bolas create moving "no-fly" arcs

- **Counters:**

  - Ice creates safe islands (bolas freeze mid-air)

  - Fire clears lanes

  - Lightning staggers rotation timing

### Rewards & Scaling

- **ARCANA:** 450 base + 10% per standard destroyed before Stampede ends

- **Fail Condition Aid:** If fight lasts >120s, Waystone resonance grants player +10% elemental penetration for remainder

## Lane Objects (Destructibles)

### Zephyr Banner

```typescript

interface ZephyrBanner {
  id: 'OBJ*ZEPHYR*BANNER';
  type: 'emplacement';
  baseHP: 80; // Scales with distance

  // Aura Effect
  radius: 220; // pixels
  moveSpeedBonus: 0.10; // +10% move speed
  projectileDeflection: 0.10; // +10% projectile deflection

  // Counters
  fireWeakness: 'DoT*burns*faster';
  lightningWeakness: 'overcharge*stuns*1s';

  // Rewards
  arcanaBonus: 0.10; // +10% ARCANA on destroy
}

```javascript

### Gust Totem

```typescript

interface GustTotem {
  id: 'OBJ*GUST*TOTEM';
  type: 'totem';
  baseHP: 140; // Scales with distance

  // Effect
  pulseInterval: 2.5; // seconds
  pushDuration: 0.4; // seconds
  pushStrength: 'medium';

  // Counters
  lightningWeakness: 'interrupts_pulse';
  iceWeakness: 'reduces*pulse*radius_30%';

  // Rewards
  arcanaBonus: 0.10; // +10% ARCANA on destroy
}

```javascript

### Sail Rig (Fallen Kite)

```typescript

interface SailRig {
  id: 'OBJ*SAIL*RIG';
  type: 'obstacle';
  baseHP: 100; // Scales with distance

  // Effect
  onCollapse: 'creates*sail*zone';
  projectileSlow: 0.15; // -15% projectile speed

  // Counters
  fireWeakness: 'burns*through*1s_channel';

  // Rewards
  arcanaBonus: 0.10; // +10% ARCANA on destroy
}

```text

## Elemental Counterplay System

### Fire Element

- **Burns banners/kites:** Destroys lane objects faster

- **Clears dust veils:** Removes visual interference

- **Burn-through sails:** Channels through sail zones

- **Burns Dust-Mane mane:** Cancels next trample attack

### Ice Element

- **Slows stampedes:** Reduces Dust-Mane Strider movement

- **Shatters bolas:** Bola Whisper bolas freeze mid-air, negating debuff

- **Safe pockets:** Creates protected areas during storms

- **Reduces totem radius:** Gust Totem pulse radius -30%

### Lightning Element

- **Overloads standards:** Stuns Banner-Runners during plant

- **Collapses rigging:** Kite-Sail Corsair self-stuns 1.0s

- **Interrupts slams:** Totem-Breaker hammer attacks

- **Staggers rotation:** Boss bola tempest timing disruption

### Poison Element

- **Bleed-through damage:** Effective against high-HP units

- **Suppresses micro-heals:** Counters enemy regeneration

- **Counters haste:** Reduces enemy speed buffs

## Distance Progression & Scaling

### Distance Bands

```typescript

interface DistanceBand {
  range: [number, number]; // Distance in km
  spawnWeights: Record<string, number>;
  eliteInterval?: number; // seconds
  elite?: string;
}

const distanceBands: DistanceBand[] = [
  {
    range: [0.0, 1.0],
    spawnWeights: {
      'WT*BANNER*RUNNER': 0.60,
      'WT*DUSTMANE*STRIDER': 0.30,
      'WT*KITESAIL*CORSAIR': 0.10
    }
  },
  {
    range: [1.0, 2.0],
    spawnWeights: {
      'WT*BANNER*RUNNER': 0.40,
      'WT*DUSTMANE*STRIDER': 0.30,
      'WT*SKYHOOK*LANCER': 0.20,
      'WT*KITESAIL*CORSAIR': 0.10,
      'WT*BOLA*WHISPER': 0.10
    },
    eliteInterval: 45, // seconds
    elite: 'WT*TOTEM*BREAKER'
  }
];

```javascript

### Scaling Formulas

```typescript

// Early-game friendly scaling
function scaleEnemyHP(baseHP: number, distance: number): number {
  return Math.floor(baseHP * Math.pow(1 + 0.35 * distance, 1.25));
}

function scaleEnemyDamage(baseDMG: number, distance: number): number {
  return Math.floor(baseDMG * Math.pow(1 + 0.25 * distance, 1.10));
}

function scaleArcanaReward(baseArcana: number, distance: number): number {
  return Math.floor(baseArcana * (1 + 0.20 * distance)); // Linear early ramp
}

// Elite and Boss multipliers
const ELITE*HP*MULTIPLIER = 3.2;
const ELITE*DMG*MULTIPLIER = 2.0;
const BOSS*HP*MULTIPLIER = 40.0;

```text

## ARCANA Economy

### Zephyr Arcana System

- **Type:** Zephyr Arcana — +10% ARCANA on destruction of lane objects

- **Chain Bonus:** Multi-kills via collapsed sails grant +2% ARCANA for 4s (refreshable)

### Baseline ARCANA per Kill

- **Minions:** 9–14 ARCANA

- **Elites:** 30–40 ARCANA

- **Boss:** 450+ ARCANA

### Spend Cadence Targets

- **Tutorial (D0):** Player should afford one core upgrade every 30–45s

- **Main Plains (D1.8):** Upgrade cadence drifts to 60–75s by D1.8

### Drop Chips (Cosmetic/Lore)

- Waystone etchings

- Banner tassels

- Kite batten splinters

- Dust-mote crystals

- Wind-carved bone fragments

## AI & Behavior Systems

### Common Stop-At-Range FSM

```typescript

enum EnemyState {
  APPROACH = 'approach',
  STOP*AT*RANGE = 'stop*at*range',
  ATTACK = 'attack',
  REPOSITION = 'reposition',
  DEAD = 'dead'
}

// State transitions
const stateTransitions = {
  APPROACH: {
    to: STOP*AT*RANGE,
    condition: 'dist <= desiredArc'
  },
  STOP*AT*RANGE: {
    to: ATTACK,
    condition: 'LoS && cd_ready'
  },
  STOP*AT*RANGE: {
    to: REPOSITION,
    condition: 'hitstun || proximity*crowding || scripted*stepback'
  },
  REPOSITION: {
    to: STOP*AT*RANGE,
    condition: 'arc_regained'
  }
};

```javascript

### Skyhook Lancer AI Example

```typescript

function skyhookLancerTick() {
  switch (state) {
    case APPROACH:
      moveToward(player, speed);
      if (distToPlayer() <= ARC*SHORT) state = STOP*AT_RANGE;
      break;

    case STOP*AT*RANGE:
      face(player);
      if (cdReady("hook") && hasLoS()) state = ATTACK;
      else if (crowded() || underConeThreat()) state = REPOSITION;
      break;

    case ATTACK:
      windup(0.45);
      if (stunned) { state = REPOSITION; break; }
      spawnProjectile("SKYHOOK", aimLead(player, 0.4));
      setCd("hook", 2.8);
      state = REPOSITION;
      break;

    case REPOSITION:
      stepBack(120, iframes = 0.2);
      if (distToPlayer() > ARC*SHORT + 20) state = STOP*AT_RANGE;
      break;
  }
}

```javascript

## Performance & Accessibility

### Performance Budgets

- **Target FPS:** 60 fps desktop; ≥40 fps mid-phones

- **Entity Limits:** ≤200/400 enemies on screen; ≤600 projectiles/s

- **Pooling:** Pre-warm 24 banners, 12 kites, 8 totems; recycle cloth physics bones

### Accessibility Features

- **Visual Focus:** Visible focus rings and clear UI elements

- **ARIA Labels:** Screen reader support for all interactive elements

- **Reduced Motion:** Disables cloth flutter amplitude and dust motes when enabled

- **Touch Targets:** 44×44 minimum on mobile

- **Color-Blind Safe:** No red/green reliance in UI elements

## Telemetry & Analytics

### Key Events

```typescript

type HorizonSteppeEvent =
  | { type: 'spawn_unit', unitId: string, band: string, seed: number, pos: Vector2 }
| { type: 'kill_unit', unitId: string, dNorm: number, dmgTaken: number, timeAliveMs:
number,
arcanaAwarded:
number
}
  | { type: 'object_placed', objectId: string, ownerUnit: string }
  | { type: 'object_destroyed', objectId: string, cause: string, arcanaBonus: number }
  | { type: 'boss*phase*change', bossId: string, from: string, to: string, tMs: number }
| { type: 'elemental_counter', element: string, tMs: number, hits: number, multiKill:
boolean
};

```text

### Key Ratios to Monitor

- **TTK by Class:** Target 1.8–3.5s minions early, 6–9s elites

- **Banner Uptime:** Target <45% during D1

- **Crosswind Wall Coverage:** Target <22% lane time

- **Player Upgrade Cadence:** See spend cadence targets above

## UI/UX Strings & Localization

### Loading Tips

- "Banners channel wind—burn or overcharge them to calm the lane."

- "Use Ice to shatter bolas mid-air and avoid grounding effects."

- "Lightning interrupts enemy attacks—perfect for stopping hammer slams."

### HUD Toasts

- "Overcharged Standard!"

- "Sail Collapse: +2% Arcana (4s)"

- "Crosswind Wall Deflected Projectiles"

### Localization Keys

```typescript

const localizationKeys = {
  'region.r01.name': 'Horizon Steppe',
  'region.r01.tagline': 'Where sky kisses grass and home feels near.',
  'faction.wind_taken.name': 'Wind-Taken Nomads',
  'boss.khagan_sirocco.name': 'Khagan of the Sirocco',
'tip.banner.overcharge': 'Banners channel wind—burn or overcharge them to calm the lane.',
  'tip.ice.bolas': 'Ice makes bolas shatter on throw, negating their effects.',
  'tip.lightning.interrupt': 'Lightning interrupts enemy attacks and extends weak points.'
};

```javascript

## Testing & Acceptance

### Unit Tests

- Banner-Runner: plants*banner*within*2.2s*of*reach, repositions*on*threat, stunned*by*lightning*during_windup

- Skyhook Lancer: drag*applies*0p6s, ice*increases*cd, backstep*has*iframes

- Totem-Breaker: weakpoint*exposed*on*slam, lightning*extends_exposure

### Integration Tests

- Crosswind Coverage: Sim @ 120s: coverage ≤22% lane time under baseline spawn weights

- Object Economy: Destroying ≥6 objects in D1 yields ≥+10% ARCANA over no-object run

- Boss: 3-phase transitions occur; standards respond to all elements as specified

### E2E Gates

- Finish D0→D2 with only base breath + 3 upgrades in ≤9 minutes on desktop perf profile

- Average FPS ≥58 desktop, ≥38 mid-phone (perf scene)

- Lighthouse A11y (UI shell) ≥95 when reduced-motion is ON

## Future-Proofing Hooks

### Seasonal Variants

- **Silvergrass Bloom:** Higher visibility, reduced dust debuffs

- **Storm Season:** Increased wind effects, more kite spawns

- **Harvest Time:** Bonus treasure spawns, reduced enemy aggression

### Event Integration

- **Ridge-Run Caravan:** Escort object replacing several elites

- **Waystone Resonance:** Temporary power boosts from ancient magic

- **Cross-region synergy:** Waystones echo next region's thermals (tutorial hint)

## Acceptance Criteria

- [ ] Complete Horizon Steppe specification with all 6 enemy types and boss

- [ ] Lane object system with 3 destructible types and proper counters

- [ ] Elemental counterplay matrix provides meaningful tactical choices

- [ ] ARCANA economy balanced for target upgrade cadence

- [ ] Boss mechanics with 3-phase progression and fail-safes

- [ ] Performance budgets maintained under all conditions

- [ ] Accessibility features meet WCAG 2.1 AA standards

- [ ] Telemetry captures all faction-specific interactions

- [ ] All scaling formulas maintain consistent difficulty progression

- [ ] Future-proofing hooks support seasonal and event content

## Cross-References

- [Combat Systems, Enemies & Bosses](05*Combat*Systems*Enemies*Bosses.md) - Combat mechanics and encounter design

- [Progression: Maps, Wards & Lands](04*Progression*Maps*Wards*Lands.md) - Regional structure and progression

- [Content Packs: Clans, Bestiary & Factions](22*Content*Packs*Clans*Bestiary.md) - Faction system and enemy design patterns

- [Telemetry, Stats & Analytics](16*Telemetry*Stats_Analytics.md) - Analytics and balance monitoring
