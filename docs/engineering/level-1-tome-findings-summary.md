# Level 1 / Ward 1 - Complete Tome Findings

**Created**: 2025-10-25
**Purpose**: Definitive summary of what Tome says about Level 1/Ward 1

---

## Executive Summary

After reviewing the Tome, here's what we know:

1. **Ward 1 (Sunwake Downs)**: 0-500m tutorial area
2. **Enemies**: 4 types from Wind-Taken Nomads faction
3. **Currencies**: Arcana + Soul Power both drop from kills
4. **Items**: DO drop from enemies, sell for Gold (Town system, Phase 2)
5. **Boss**: Heartwood Abomination, but NOT in Ward 1 (appears later)
6. **Scaling**: +1% every 5m (100 micro-ramps in 500m!)

---

## Ward Structure from Tome

### Ward 1: Sunwake Downs (Tutorial)

**Distance**: 0-500m (D0-D0.5)
**Duration**: ~5-10 minutes at 10 m/s auto-advance + combat time
**Purpose**: Tutorial, onboarding, system introduction

**From [04_Progression_Maps_Wards_Lands.md](../tome/04_Progression_Maps_Wards_Lands.md)**:

```typescript
{
  name: 'Sunwake Downs',
  distanceRange: [0, 500],
  distStepM: 5,  // Micro-ramp every 5m
  bump: 1.0,     // No ward bump for Ward 1
  pushbackPercent: 3%
}
```

---

### Ward 2: Waystone Mile (Basic Progression)

**Distance**: 500-1000m (D0.5-D1.0)
**Purpose**: Basic progression, first real challenge

---

### Ward 3-7: Progression to Boss

**Distance**: 1000m+ (up to D3.0+)
**Boss Location**: First Horizon (Ward 7, D3.0+)
**Boss**: Heartwood Abomination

---

## Enemy Roster (Wind-Taken Nomads)

From [regions/01_Horizon_Steppe_Complete.md](../tome/regions/01_Horizon_Steppe_Complete.md):

### 1. Banner-Runner (Ground, Skirmisher) ⭐ SIMPLEST

```typescript
{
  id: 'WT_BANNER_RUNNER',
  class: 'skirmisher',
  laneType: 'ground',

  // Stats
  baseHP: 120,
  baseDMG: 18,
  moveSpeed: 1.2,  // m/s
  attackCooldown: 2.8,  // seconds

  // Abilities
  primary: 'skyhook_toss',    // 0.6s drag + 10% slow
  secondary: 'hop_step_back', // i-frames 0.2s

  // Rewards
  arcana: 12,
  // Soul Power not listed per-enemy, but IS a currency!
}
```

**Tactical Notes**: Quick skirmisher, hit-and-run tactics

---

### 2. Dust-Mane Strider (Ground, Bruiser)

```typescript
{
  baseHP: 220,
  baseDMG: 32,
  moveSpeed: 1.0,
  attackCooldown: 4.5,
  arcana: 16
}
```

**Tactical Notes**: Heavy hitter, area denial

---

### 3. Kite-Sail Corsair (Air, Harasser)

```typescript
{
  baseHP: 95,
  baseDMG: 15,
  moveSpeed: 1.1,
  attackCooldown: 3.0,
  arcana: 11
}
```

**Tactical Notes**: Airborne, creates wind barriers

---

### 4. Bola Whisper (Air, Controller)

```typescript
{
  baseHP: 80,
  baseDMG: 10,
  moveSpeed: 1.0,
  attackCooldown: 3.2,
  arcana: 10
}
```

**Tactical Notes**: Low HP, disrupts player accuracy

---

## Currency System

From [03_ShooterIdle_Core_Loop.md](../tome/03_ShooterIdle_Core_Loop.md) and [05_Combat_Systems_Enemies_Bosses.md](../tome/05_Combat_Systems_Enemies_Bosses.md):

### Currencies That Drop from Enemies

```typescript
interface DeathProcessingRewards {
  arcana: number; // Run currency, geometric ×1.12 growth
  soulPower: number; // Meta currency, growth ×1.90
  gold: number; // From item sales (indirect)
  astralSeals: number; // Premium, rare boss drops only
}
```

**Key Points**:

- ✅ **Arcana**: Drops from ALL enemies
- ✅ **Soul Power**: Drops from ALL enemies (meta progression)
- ✅ **Gold**: Comes from selling items, NOT direct drops
- ✅ **Astral Seals**: Boss drops only, rare

---

## Item Drop System

From [08_Town_Lair_City_PublicWorks.md](../tome/08_Town_Lair_City_PublicWorks.md):

### Items DO Drop from Enemies

```typescript
interface ItemDrop {
  itemId: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  baseValue: number; // in gold
  condition: 'poor' | 'fair' | 'good' | 'excellent';

  appraisalValue: number;
  appraisalBonus: number;
  finalValue: number;
}
```

**Gold Economy**:

- **Source**: "Item sales from defeated enemies"
- **Usage**: QoL upgrades, shop improvements, city investments
- **Design**: Gold provides convenience, NOT raw combat power

**This means**:

- Items drop from enemy kills
- Items are sold at Town vendors (Phase 2)
- Gold is earned from selling items
- Gold is used for QoL, not power

---

## Scaling Formulas

From [04_Progression_Maps_Wards_Lands.md](../tome/04_Progression_Maps_Wards_Lands.md):

### Micro-Ramp Formula

```typescript
export function microRamp(distM: number, stepM: number, inc = 0.01) {
  return 1 + Math.floor(distM / stepM) * inc;
}

// For Ward 1 (0-500m):
// stepM = 5 (every 5 meters)
// inc = 0.01 (1% increase)
//
// At 0m:   1.0 (100%)
// At 5m:   1.01 (101%)
// At 10m:  1.02 (102%)
// At 500m: 1.10 (110%)
//
// That's 100 micro-ramps in Ward 1!
```

### Ward Bump Formula

```typescript
export function wardBump(ward: number, mult = 1, bump = 1.22) {
  return mult * Math.pow(bump, ward - 1);
}

// Ward 1: 1.22^0 = 1.0 (no bump)
// Ward 2: 1.22^1 = 1.22 (22% harder)
// Ward 3: 1.22^2 = 1.49 (49% harder)
```

### Enemy HP Scaling

```typescript
export function enemyHP(base: number, ward: number, distM: number, bump = 1.18) {
  const wardMultiplier = Math.pow(bump, ward - 1);
  const microRampMultiplier = microRamp(distM, 10, 0.01);
  return Math.floor(base * wardMultiplier * microRampMultiplier);
}

// Banner-Runner in Ward 1:
// At 0m:   120 * 1.0 * 1.0 = 120 HP
// At 250m: 120 * 1.0 * 1.05 = 126 HP
// At 500m: 120 * 1.0 * 1.10 = 132 HP
```

---

## First Session Experience

From [02_Player_Experience_Overview.md](../tome/02_Player_Experience_Overview.md):

### Timing Targets

- **30 seconds**: Player sees action (combat starts)
- **5 minutes**: Player reaches 100m
- **3 minutes**: Player makes first upgrade (enchantment)
- **8 minutes**: Player understands Return mechanics
- **30-45 minutes**: First boss encountered (NOT in Ward 1!)
- **Return Cadence**: 2-3 returns per hour

**This means**:

- Ward 1 (500m) should take ~10-15 minutes
- Players will Return 2-3 times before reaching boss
- Boss appears in Ward 3-4, not Ward 1

---

## What Should "Level 1" Mean?

### Option A: Ward 1 Only (Recommended for MVP)

**Scope**: Sunwake Downs (0-500m)
**Duration**: 10-15 minutes
**Enemies**: Banner-Runner only (simplest)
**Boss**: None
**Currencies**: Arcana + Soul Power
**Items**: Yes, rare drops
**End**: Return to Draconia, unlock Ward 2

**Pros**:

- Matches Tome exactly
- Minimal scope
- Can iterate quickly
- Perfect MVP

**Cons**:

- Short experience
- No boss fight
- Need Ward 2 soon

---

### Option B: Wards 1-2 (Tutorial Complete)

**Scope**: Sunwake Downs + Waystone Mile (0-1000m)
**Duration**: 20-30 minutes
**Enemies**: Banner-Runner + Dust-Mane Strider
**Boss**: None (or mini-boss)
**Currencies**: Arcana + Soul Power
**Items**: Yes, rare drops
**End**: Return to Draconia, unlock Ward 3

**Pros**:

- More substantial
- Shows ward transitions
- Two enemy types

**Cons**:

- Larger scope
- Still no major boss

---

### Option C: To First Boss (Wards 1-4)

**Scope**: Sunwake Downs → First Horizon (0-2000m)
**Duration**: 30-45 minutes
**Enemies**: All 4 Wind-Taken Nomads types
**Boss**: Heartwood Abomination
**Currencies**: Arcana + Soul Power + rare Astral Seals
**Items**: Yes, scaling drops
**End**: Boss clear, major milestone

**Pros**:

- Complete arc
- Boss fight showcase
- Matches "30-45 min to first boss"

**Cons**:

- Very large scope
- Complex to implement
- Far from MVP

---

## Recommendations

### Phase 0.5: Fix Current Bug (IMMEDIATE)

1. Create EntityManager
2. Remove duplicate dragon
3. Fix health bar system
4. **Est**: 2-3 hours

---

### Phase 1.1: Ward 1 MVP (NEXT)

**Goal**: Implement Sunwake Downs (0-500m) completely

**Features**:

- ✅ Banner-Runner enemy (simplest)
- ✅ Arcana currency tracking
- ✅ Soul Power currency tracking
- ✅ Item drops (5% chance, common rarity)
- ✅ Distance progression (0-500m)
- ✅ Micro-ramps (+1% every 5m)
- ✅ Return to Draconia at 500m
- ✅ HUD (Arcana, Soul Power, Distance)
- ❌ No boss (that's Ward 3-4)
- ❌ No item selling (that's Town, Phase 2)
- ❌ No enchantments yet (Phase 1.2)

**Est**: 30-40 hours

---

### Phase 1.2: Enchantments System

**Goal**: Spend Arcana to level nodes

**Features**:

- First enchant: "Ember Potency" (increase dragon damage)
- Geometric cost scaling (×1.12)
- Persist between journeys

**Est**: 15-20 hours

---

### Phase 1.3: Ward 2 + More Enemies

**Goal**: Waystone Mile (500-1000m)

**Features**:

- Add Dust-Mane Strider enemy
- Ward transition
- Scaling difficulty

**Est**: 20-25 hours

---

### Phase 1.4: Ward 3-4 + First Boss

**Goal**: First boss encounter

**Features**:

- Add Kite-Sail Corsair + Bola Whisper
- Heartwood Abomination boss
- Boss mechanics
- Special rewards

**Est**: 40-50 hours

---

## Critical Corrections to My Original Plan

### What I Got WRONG:

1. **Distance**: 5000m → should be 500m for Ward 1
2. **Enemy Name**: "Briar Stalker" → should be "Banner-Runner"
3. **Enemy Stats**: Wrong HP/DMG/Arcana values
4. **Scaling**: 500m intervals → should be 5m intervals
5. **Boss**: Ward 1 end → should be Ward 3-4
6. **Micro-ramps**: +5% → should be +1%

### What I Got RIGHT:

1. ✅ Two currencies: Arcana + Soul Power
2. ✅ Items drop from enemies
3. ✅ Faction: Wind-Taken Nomads
4. ✅ Auto-advance progression
5. ✅ Return to Draconia flow

---

## Next Steps

1. **User Decision**: Which scope for "Level 1"?
   - Option A (Ward 1 only) - Recommended
   - Option B (Wards 1-2)
   - Option C (To first boss)

2. **Update Plans**: Correct level-1-implementation-plan.md with accurate Tome specs

3. **Proceed**: Phase 0.5 (fix duplicate dragon bug)

4. **Implement**: Ward 1 MVP with correct specifications

---

**Key Takeaway**: Ward 1 is 500m (not 5000m!), has 4 enemy types (not 1), uses Banner-Runner as the simplest tutorial enemy, and ends with Return to Draconia (no boss yet).
