# Phase 1 Combat System - Final Specification

**Status**: Executor Approved
**Date**: 2025-10-29
**Version**: 1.0

---

## Executive Summary

This document defines the FINAL specifications for Phase 1 combat implementation in Draconia Chronicles, incorporating all Executor decisions and balance requirements.

**Key Design Goals**:

1. Force enchant engagement by 50% of Ward 1 (2500m)
2. Wave-based enemy spawning with scaling
3. Dragon death creates farming opportunities
4. Smart targeting prevents visual bugs
5. Enemy attack ranges create tactical depth

---

## 1. BASE COMBAT STATS

### 1.1 Dragon Stats

```typescript
const DRAGON_STATS = {
  // Health
  baseHP: 5, // Starting health
  maxHP: 5, // Maximum health

  // Damage
  baseDamage: 2.5, // HP per attack

  // Attack
  fireRate: 500, // ms between attacks (2 attacks/second)
  attackRange: 1100, // pixels
  dps: 5.0, // 2.5 damage × 2 attacks/s

  // Speed
  flightSpeed: 40, // m/s (144 km/h)
};
```

### 1.2 Enemy Base Stats (0m distance)

```typescript
const ENEMY_BASE_STATS = {
  // Health
  baseHP: 10, // Starting health at 0m

  // Damage (fixed per enemy at spawn)
  minDamage: 1.5, // Minimum damage roll
  maxDamage: 2.5, // Maximum damage roll
  // Each enemy rolls once at spawn: damage = random(1.5, 2.5)

  // Attack
  baseFireRate: 2000, // ms between attacks (0.5 attacks/second)

  // Attack Ranges (by enemy type)
  attackRanges: {
    bannerRunner: 800, // px - Takes 1-2 dragon hits before firing
    steppeCorsair: 950, // px - Takes 1 dragon hit before firing
    windRaider: 1050, // px - Almost dragon range
  },

  // Movement
  moveSpeed: 1.2, // m/s (approaches dragon)
};
```

### 1.3 Design Ratios

```typescript
const DESIGN_RATIOS = {
  // Time to Kill (0m)
  dragonTTK: 2.0, // seconds (4 hits × 0.5s)

  // Damage per enemy (0m)
  enemyDamagePerFight: 2.0, // HP (1 attack while dying)

  // Critical Point (2500m)
  criticalDistance: 2500, // m - Player MUST enchant by here
  enemyHPAt2500m: 12.8, // HP
  enemyDamageAt2500m: 3.2, // HP (max roll)
  dragonSurvivalAt2500m: 2, // enemies before death (no enchants)
};
```

---

## 2. SCALING SYSTEM

### 2.1 Enemy Stat Scaling

**Formula**: `baseStat × 1.01^(distance / 100)`

**Implementation**:

```typescript
export function calculateEnemyStats(distance: number): EnemyStats {
  const scalingFactor = Math.pow(1.01, Math.floor(distance / 100));

  return {
    hp: Math.floor(10 * scalingFactor),
    minDamage: 1.5 * scalingFactor,
    maxDamage: 2.5 * scalingFactor,
  };
}
```

**Progression Table**:

| Distance | Scaling Factor | Enemy HP | Enemy Damage Range | Dragon TTK | Dragon HP Lost |
| -------- | -------------- | -------- | ------------------ | ---------- | -------------- |
| 0m       | 1.000          | 10.0     | 1.5 - 2.5          | 2.0s       | 1.5 - 2.5      |
| 1000m    | 1.105          | 11.0     | 1.7 - 2.8          | 2.2s       | 1.7 - 2.8      |
| 2500m    | 1.282          | 12.8     | 1.9 - 3.2          | 2.6s       | 1.9 - 3.2      |
| 5000m    | 1.645          | 16.5     | 2.5 - 4.1          | 3.3s       | 2.5 - 8.2      |

**Critical Points**:

- **0-1000m**: Safe zone, dragon easily wins
- **2500m**: Without enchants, dragon dies after 2-3 enemies
- **5000m**: Without enchants, enemies can 2-hit kill dragon

### 2.2 Ward 1 Specifications

```typescript
const WARD_1_SPECS = {
  totalDistance: 5000, // meters
  duration: 125, // seconds (5000m ÷ 40 m/s)
  scalingIntervals: 50, // bumps (every 100m)
  scalingPerInterval: 0.01, // 1% multiplicative

  // Challenge curve
  easyZone: [0, 1000], // 0-20% distance
  mediumZone: [1000, 2500], // 20-50% distance
  hardZone: [2500, 5000], // 50-100% distance
};
```

---

## 3. ENEMY SPAWNING SYSTEM

### 3.1 Wave-Based Spawning

**Not** continuous spawning - enemies spawn in **waves** every 6 seconds.

```typescript
const WAVE_SPAWNING = {
  waveInterval: 6000, // ms between waves
  baseMinEnemies: 1, // Starting minimum per wave
  baseMaxEnemies: 3, // Starting maximum per wave
  maxConcurrentEnemies: 10, // Screen limit

  // Random enemies per wave: random(minEnemies, maxEnemies)
};
```

### 3.2 Wave Scaling (Every 10km)

Every 10,000 meters traveled, roll for spawn increase:

```typescript
const WAVE_SCALING = {
  scalingInterval: 10000, // meters

  // Roll at each interval:
  minIncreaseChance: 1 / 3, // 33% chance: minEnemies += 1
  maxIncreaseChance: 2 / 3, // 67% chance: maxEnemies += 1
};

// Example progression:
// 0-10km:   1-3 enemies per wave
// 10-20km:  1-4 enemies per wave (max increased)
// 20-30km:  2-4 enemies per wave (min increased)
// 30-40km:  2-5 enemies per wave (max increased)
```

**Implementation**:

```typescript
export class WaveSpawner {
  private minEnemies = 1;
  private maxEnemies = 3;
  private lastScalingDistance = 0;

  updateScaling(currentDistance: number): void {
    const intervals = Math.floor(currentDistance / 10000);
    const newIntervals = intervals - this.lastScalingDistance;

    for (let i = 0; i < newIntervals; i++) {
      // Roll for increases
      if (Math.random() < 1 / 3) {
        this.minEnemies += 1;
      }
      if (Math.random() < 2 / 3) {
        this.maxEnemies += 1;
      }
    }

    this.lastScalingDistance = intervals;
  }

  getWaveSize(): number {
    return Math.floor(Math.random() * (this.maxEnemies - this.minEnemies + 1)) + this.minEnemies;
  }
}
```

### 3.3 Spawn Timing

```typescript
const SPAWN_TIMING = {
  firstWaveDelay: 3000, // ms - Give player time to orient
  waveInterval: 6000, // ms between waves

  // Ward 1 example (125 seconds):
  totalWaves: 20, // (125s - 3s) / 6s ≈ 20 waves
  averageEnemies: 40, // 20 waves × 2 avg enemies
};
```

---

## 4. DRAGON DEATH & PUSHBACK SYSTEM

### 4.1 Death Sequence

When Dragon HP reaches 0:

```typescript
const DEATH_SEQUENCE = {
  // 1. Death animation
  deathAnimation: {
    duration: 500, // ms
    blinkCount: 3, // blinks
    blinkInterval: 167, // ms per blink
  },

  // 2. Calculate pushback
  pushbackPercent: 0.05, // 5% of current ward distance
  minDistance: 0, // Never go negative

  // 3. Pushback animation
  pushbackDuration: 3000, // ms (3 seconds)

  // 4. Pause journey
  postDeathState: 'PAUSED', // Player must unpause

  // 5. Allow farming
  farmingEnabled: true, // Can fight enemies at 0m
};
```

### 4.2 Pushback Distance Calculation

```typescript
export function calculatePushback(
  currentDistance: number,
  wardStartDistance: number,
  wardEndDistance: number,
): number {
  const wardLength = wardEndDistance - wardStartDistance;
  const distanceIntoWard = currentDistance - wardStartDistance;

  // 5% of distance INTO current ward
  const pushbackAmount = distanceIntoWard * 0.05;

  // Never go below ward start
  const newDistance = Math.max(wardStartDistance, currentDistance - pushbackAmount);

  return newDistance;
}

// Examples:
// Ward 1: 0-5000m
// Death at 2500m: pushback 125m → 2375m
// Death at 500m:  pushback 25m  → 475m
// Death at 100m:  pushback 5m   → 95m
```

### 4.3 Background Speed Matching (CRITICAL)

**Problem**: Pushback must maintain visual consistency with background parallax.

**Solution**: Background scroll speed during pushback must match distance regression rate.

```typescript
export function calculateBackgroundPushbackSpeed(
  pushbackDistance: number, // meters
  pushbackDuration: number, // ms
  dragonFlightSpeed: number, // m/s (40 m/s normally)
): number {
  // Speed = distance / time
  const pushbackSpeed = pushbackDistance / (pushbackDuration / 1000);

  // Background scroll multiplier
  const speedMultiplier = pushbackSpeed / dragonFlightSpeed;

  return speedMultiplier;
}

// Example:
// Ward 1 death at 2500m:
// - Pushback: 125m in 3 seconds = 41.67 m/s
// - Normal: 40 m/s
// - Multiplier: 1.04× (4% faster background scroll)

// Ward 5 death at 12500m:
// - Pushback: 625m in 3 seconds = 208.33 m/s
// - Normal: 40 m/s
// - Multiplier: 5.21× (521% faster background scroll)
```

**Visual Consistency Rule**:

> If dragon reaches distance X from background point A, and is pushed back, they MUST return to background point A when reaching distance X again. This ensures mountains, landmarks, and parallax elements remain predictable.

### 4.4 Pause System Integration

```typescript
export interface DeathPauseState {
  isPaused: true;
  reason: 'DRAGON_DEATH';
  canResume: true;
  canRetreat: true; // Allow manual retreat button
  farmingMode: true; // Enemies still spawn and can be killed
}
```

**Farming Mechanic**:

- After pushback, journey pauses
- Enemies continue to spawn (wave system active)
- Player can kill enemies to gain arcana
- Player must unpause to advance
- Allows "grinding" for enchant resources

---

## 5. PROJECTILE & COLLISION SYSTEM

### 5.1 Dragon Projectiles

```typescript
const DRAGON_PROJECTILES = {
  type: 'homing', // Tracks target position
  speed: 250, // pixels per second
  damage: 2.5, // HP
  pierceDelay: 70, // ms - persist after hit

  // Smart targeting
  smartTargeting: true, // Switch if killing blow predicted
  targetPriority: 'closest', // Always attack closest first
};
```

### 5.2 Enemy Projectiles

```typescript
const ENEMY_PROJECTILES = {
  type: 'straight_line', // Fire at dragon's position
  speed: 150, // pixels per second (slower)
  damage: 'per_enemy', // 1.5-2.5, fixed at spawn
  pierceDelay: 70, // ms

  // Targeting
  smartTargeting: false, // Dumb fire
  targetPosition: 'snapshot', // Aim at dragon's position at fire time
};
```

### 5.3 Smart Targeting Algorithm

```typescript
export function findBestTarget(
  dragonSprite: Sprite,
  enemies: EnemyData[],
  dragonDamage: number,
  attackRange: number,
): EnemyData | null {
  // 1. Find all enemies in range
  const enemiesInRange = enemies.filter(
    (enemy) => !enemy.isDefeated && getDistance(dragonSprite, enemy.sprite) <= attackRange,
  );

  if (enemiesInRange.length === 0) return null;

  // 2. Find closest enemy
  const closest = findClosest(dragonSprite, enemiesInRange);

  // 3. Check if killing blow predicted
  const activeProjectiles = getActiveProjectilesToTarget(closest);
  const incomingDamage = activeProjectiles.length * dragonDamage;

  if (closest.health <= incomingDamage) {
    // Killing blow predicted, find next target
    const remainingEnemies = enemiesInRange.filter((e) => e !== closest);
    if (remainingEnemies.length > 0) {
      return findClosest(dragonSprite, remainingEnemies);
    }
  }

  return closest;
}
```

**Purpose**: Prevents projectiles passing through defeated enemies (immersion breaking).

### 5.4 Collision Detection

```typescript
const COLLISION_CONFIG = {
  type: 'AABB', // Axis-Aligned Bounding Box
  hitboxScale: 0.5, // 50% of sprite size
  performanceTarget: 0.1, // ms per frame (60fps safe)
};
```

---

## 6. ENEMY BEHAVIOR & ATTACK RANGES

### 6.1 Attack Range Hierarchy

All enemy ranges ≤ dragon range (1100px) for first 17 wards.

```typescript
const ENEMY_ATTACK_RANGES = {
  // Tier 1: Weak (short range)
  bannerRunner: 800, // Takes 1-2 hits before firing back
  steppeScout: 750, // Takes 2 hits before firing back

  // Tier 2: Standard (medium range)
  steppeCorsair: 950, // Takes 1 hit before firing back
  windHunter: 900, // Takes 1 hit before firing back

  // Tier 3: Strong (long range)
  windRaider: 1050, // Almost dragon range
  skyMarshal: 1000, // Almost dragon range

  // Dragon range (reference)
  dragon: 1100,
};
```

### 6.2 Enemy Behavior State Machine

```typescript
export enum EnemyState {
  APPROACHING = 'APPROACHING', // Moving toward dragon
  ATTACKING = 'ATTACKING', // In range, stopped, firing
  DEFEATED = 'DEFEATED', // Dead, playing death animation
}

export interface EnemyBehavior {
  state: EnemyState;

  // Approaching state
  approachSpeed: 1.2; // m/s

  // Attack state
  attackRange: number; // pixels (per enemy type)
  fireRate: 2000; // ms cooldown
  lastFireTime: number; // timestamp

  // Combat
  damage: number; // 1.5-2.5, rolled at spawn
  health: number; // Current HP
  maxHealth: number; // Max HP
}
```

### 6.3 Enemy Update Logic

```typescript
export function updateEnemy(enemy: EnemyData, dragon: Sprite, deltaTime: number): void {
  if (enemy.state === 'DEFEATED') {
    updateDeathAnimation(enemy, deltaTime);
    return;
  }

  const distance = getDistance(enemy.sprite, dragon);

  if (distance > enemy.attackRange) {
    // APPROACHING: Move toward dragon
    enemy.state = 'APPROACHING';
    moveTowardTarget(enemy.sprite, dragon, enemy.approachSpeed, deltaTime);
  } else {
    // ATTACKING: Stop and fire
    enemy.state = 'ATTACKING';

    const currentTime = performance.now();
    if (currentTime - enemy.lastFireTime >= enemy.fireRate) {
      fireProjectileAtDragon(enemy, dragon);
      enemy.lastFireTime = currentTime;
    }
  }
}
```

### 6.4 Visual "Ring" Formation

**Design Goal**: Enemies with different attack ranges create visual tactical depth.

```
         [Dragon] (1100px range)
            |
       _____|_____
      /           \
    [Wind Raider]  1050px - Almost dragon range, fires immediately

    [Steppe Corsair] 950px - Takes 1 dragon hit before firing

    [Banner Runner]  800px - Takes 2 dragon hits before firing
```

**Gameplay Impact**:

- Weak enemies (short range) die before firing (less dangerous)
- Strong enemies (long range) fire almost immediately (more dangerous)
- Player can upgrade dragon range to gain advantage

---

## 7. REWARD SYSTEM

### 7.1 Per-Kill Rewards

```typescript
const ENEMY_REWARDS = {
  arcana: 0.03, // Per kill
  soulPower: 0.003, // Per kill
  itemDropChance: 0.02, // 2% = 1 in 50 kills
};
```

### 7.2 Ward 1 Total Rewards

```typescript
const WARD_1_TOTALS = {
  averageEnemies: 40, // 20 waves × 2 avg

  // Total rewards (no deaths)
  totalArcana: 1.2, // 40 × 0.03
  totalSoulPower: 0.12, // 40 × 0.003
  expectedItemDrops: 0.8, // 40 × 0.02

  // Milestones
  firstEnchantAt: 0.1, // ~3 kills (0.09 arcana)
  secondEnchantAt: 0.2, // ~7 kills (0.21 arcana)
};
```

---

## 8. IMPLEMENTATION CHECKLIST

### Phase 1: Core Combat Systems ✅

- [x] CollisionSystem (AABB, 50% hitbox) ✅
- [x] ProjectileManager (homing + straight-line) ✅
- [ ] DamageSystem (damage application, death processing)
- [ ] CombatManager (orchestration, auto-attack)

### Phase 2: Enemy Systems

- [ ] Update EnemyManager with combat state
- [ ] Add enemy damage rolls (1.5-2.5 at spawn)
- [ ] Add enemy attack ranges per type
- [ ] Add enemy state machine (APPROACHING/ATTACKING/DEFEATED)
- [ ] Implement wave-based spawning
- [ ] Implement wave scaling (every 10km)

### Phase 3: Dragon Systems

- [ ] Dragon death detection
- [ ] Pushback calculation (5% distance)
- [ ] Background speed matching
- [ ] Pause system integration
- [ ] Farming mode (pause + spawn continues)

### Phase 4: Smart Targeting

- [ ] Implement killing blow prediction
- [ ] Target switching logic
- [ ] Prevent projectile waste

### Phase 5: Integration & Testing

- [ ] Wire CombatManager into GameStartManager
- [ ] Test wave spawning
- [ ] Test scaling (0m, 2500m, 5000m)
- [ ] Test dragon death + pushback
- [ ] Test background consistency
- [ ] Test farming mode

---

## 9. PERFORMANCE TARGETS

```typescript
const PERFORMANCE_TARGETS = {
  frameRate: 60, // fps (desktop)
  updateTime: 1, // ms per frame budget

  // Collision detection
  collisionTime: 0.1, // ms per frame
  maxProjectiles: 100, // concurrent
  maxEnemies: 10, // concurrent

  // Combat calculations
  damageCalculationTime: 0.05, // ms per hit
  targetingTime: 0.2, // ms per frame
};
```

---

## 10. CRITICAL IMPLEMENTATION NOTES

### 10.1 Enemy Damage Application

- Enemy damage is **fixed per enemy** at spawn time
- Roll once: `damage = random(1.5, 2.5)`
- Store in `enemy.damage` field
- Use this value for all attacks by that enemy

### 10.2 Scaling Timing

- Stats calculated **at spawn time** based on current player distance
- Stats do NOT update dynamically as player advances
- Allows strategic retreat (enemies behind are weaker)

### 10.3 Background Consistency

- Pushback must maintain visual landmarks
- Background scroll speed = `(pushbackDistance / pushbackDuration) / dragonSpeed`
- Test: "If I reach mountain X at 2500m, get pushed back, and return to 2500m, I should see mountain X again"

### 10.4 Smart Targeting Prevention

- Always check killing blow prediction
- Switch targets to prevent wasted projectiles
- Prevents visual bug of projectiles passing through dead enemies

### 10.5 Attack Range Design

- All Ward 1-17 enemies have range ≤ 1100px
- Creates tactical "rings" of enemies
- Weak = short range = less dangerous
- Strong = long range = more dangerous

---

## APPROVAL STATUS

✅ **Executor Approved**: 2025-10-29

**Key Design Validations**:

- Dragon: 5 HP, 2.5 damage ✅
- Enemy: 10 HP base, 1.5-2.5 damage ✅
- Scaling: 1.01^(distance/100) ✅
- Wave spawning: 1-3 enemies per 6s ✅
- Death pushback: 5% distance + pause ✅
- Smart targeting: Always enabled ✅
- Attack ranges: Tiered system ✅

Ready for implementation.
