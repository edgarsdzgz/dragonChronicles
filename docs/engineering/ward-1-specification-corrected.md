# Ward 1 Specification (Balance-Corrected)

**Version**: 2.0 (Corrected)
**Date**: 2025-10-25
**Supersedes**: level-1-implementation-plan.md (v1.0)
**Based On**: game-balance-philosophy.md + Tome specifications

---

## Overview

**Ward Name**: Sunwake Downs (Ward 1 of Horizon Steppe)
**Distance**: 0-500m
**Duration**: 90-120 seconds
**Purpose**: Tutorial ward, teach core loop, feel progression

---

## Player Experience Flow

```
Start Journey
  ↓
Combat begins (enemies spawn at 0:03)
  ↓
Kill enemy #1 (0:09) → Earn 0.03 Arcana
  ↓
Kill enemy #3 (0:27) → Total: 0.09 Arcana
  ↓
First Upgrade Available! (0:30) → Spend 0.10 Arcana
  ↓
Continue killing enemies (getting stronger)
  ↓
Kill enemy #20 (2:00) → Total: 0.60 Arcana, 0.06 Soul Power
  ↓
Ward 1 Complete → Return to Draconia
```

---

## Technical Specifications

### Distance & Timing

```typescript
const WARD_1_SPEC = {
  distance: {
    start: 0,
    end: 500, // meters
    total: 500,
  },

  timing: {
    autoAdvanceSpeed: 4.17, // m/s (500m ÷ 120s)
    targetDuration: 120, // seconds (2 minutes)
    minDuration: 90, // seconds (with fast clearing)
    maxDuration: 150, // seconds (if struggling)
  },

  scaling: {
    microRampInterval: 10, // meters
    microRampIncrease: 0.01, // +1% per interval
    totalMicroRamps: 50, // 500m ÷ 10m
    finalMultiplier: 1.5, // 50% harder at 500m
  },
};
```

---

### Enemy Specifications

#### Banner-Runner (Primary Enemy)

```typescript
const BANNER_RUNNER = {
  // Identity
  id: 'WT_BANNER_RUNNER',
  name: 'Banner-Runner',
  faction: 'Wind-Taken Nomads',
  class: 'skirmisher',
  laneType: 'ground',

  // Base Stats (at 0m)
  baseHP: 1.0,
  baseDMG: 0.15,
  moveSpeed: 1.2, // m/s
  attackCooldown: 2.8, // seconds
  attackRange: 2.0, // meters (melee)

  // Scaling (at 500m)
  finalHP: 1.5, // 1.0 × 1.50 = 1.5 HP
  finalDMG: 0.225, // 0.15 × 1.50 = 0.225 DMG

  // Rewards
  arcana: 0.03,
  soulPower: 0.003,
  itemDropChance: 0.02, // 2% = 1 in 50 kills

  // AI Behavior
  ai: {
    type: 'simple_melee',
    moveTowardsDragon: true,
    stopAtRange: 2.0, // meters
    attackWhenInRange: true,
  },
};
```

**Spawn Rate**:

```typescript
const SPAWN_CONFIG = {
  firstSpawnDelay: 3.0, // seconds (let player orient)
  spawnInterval: 6.0, // seconds between spawns
  maxEnemies: 5, // max on screen at once
  totalEnemiesInWard: 20, // ~120s ÷ 6s per enemy
};
```

---

### Dragon (Player) Specifications

```typescript
const DRAGON_STATS = {
  // Base Stats
  maxHP: 10.0,
  currentHP: 10.0,
  attackDamage: 0.25, // 4 hits to kill 1.0 HP enemy
  attackSpeed: 1.5, // seconds between attacks
  attackRange: 400, // pixels
  projectileSpeed: 500, // pixels per second

  // Position (fixed during combat)
  x: 150, // pixels from left
  y: 300, // pixels from top

  // Time to Kill (TTK)
  baseTTK: 6.0, // 4 hits × 1.5s = 6 seconds
  upgradedTTK: 3.5, // After 5 upgrades: ~3.5 seconds
};
```

---

### Currency Economy

#### Arcana (Run Currency)

```typescript
const ARCANA_CONFIG = {
  // Rewards
  perKill: 0.03,
  wardTotal: 0.6, // 20 enemies × 0.03

  // Upgrade Costs (geometric ×1.12)
  upgrades: [
    { level: 1, cost: 0.1 }, // Available at ~3 kills
    { level: 2, cost: 0.11 }, // Available at ~7 kills
    { level: 3, cost: 0.12 }, // Available at ~11 kills
    { level: 4, cost: 0.13 }, // Available at ~15 kills
    { level: 5, cost: 0.15 }, // Available at ~19 kills
  ],

  // Progression
  firstUpgradeAt: 0.1, // ~3 kills, 27 seconds
  totalUpgrades: 5, // Possible in Ward 1
  totalSpent: 0.61, // Sum of all upgrades
  totalEarned: 0.6, // Will be slightly short

  // Milestone
  firstMilestone: 0.1, // "Achievement unlocked!" feeling
};
```

#### Soul Power (Meta Currency)

```typescript
const SOUL_POWER_CONFIG = {
  // Rewards
  perKill: 0.003, // 10× rarer than Arcana
  wardTotal: 0.06, // 20 enemies × 0.003

  // Usage (NOT in Ward 1)
  firstUnlock: 0.1, // Unlock first tech node (Phase 3)
  purpose: 'meta progression',
  spent: false, // Not spent in Ward 1

  // Feeling
  rarity: 'precious',
  accumulation: 'slow', // Across multiple runs

  // Milestone
  firstMilestone: 0.1, // ~33 kills total (Ward 2-3)
};
```

#### Items & Gold

```typescript
const ITEM_DROP_CONFIG = {
  // Drop Rate
  chance: 0.02, // 2% = 1 in 50 kills
  expectedDrops: 0.4, // 20 kills × 0.02 = 0-1 item
  actualDrops: [0, 1], // Most runs: 0 or 1 item

  // Item Properties (if dropped)
  rarity: 'common',
  namePool: ['Worn Leather', 'Rusty Dagger', 'Old Coin', 'Torn Cloth', 'Cracked Gem'],
  goldValue: [0.01, 0.05], // Random between 0.01-0.05 gold

  // Gold Economy (Phase 2)
  sellingEnabled: false, // No Town yet
  goldEarned: 0, // Can't sell items yet
  itemsStored: true, // Stored in inventory for later
};
```

---

## Combat Math & Balance

### Time to Kill (TTK) Progression

```typescript
// Base Dragon: 0.25 damage, 1.5s attack speed
const TTK_TABLE = {
  // Enemy HP at 0m: 1.0
  noUpgrades: {
    hitsToKill: 4, // 1.0 ÷ 0.25 = 4 hits
    timeToKill: 6.0, // 4 hits × 1.5s = 6.0s
  },

  // After Upgrade 1: 0.28 damage (+12%)
  oneUpgrade: {
    hitsToKill: 4, // 1.0 ÷ 0.28 = 3.57 → 4 hits
    timeToKill: 6.0, // Still 4 hits
  },

  // After Upgrade 2: 0.31 damage (+12%)
  twoUpgrades: {
    hitsToKill: 4, // 1.0 ÷ 0.31 = 3.23 → 4 hits
    timeToKill: 6.0, // Still 4 hits
  },

  // After Upgrade 3: 0.35 damage (+12%)
  threeUpgrades: {
    hitsToKill: 3, // 1.0 ÷ 0.35 = 2.86 → 3 hits!
    timeToKill: 4.5, // 3 hits × 1.5s = 4.5s ✓
  },

  // After Upgrade 5: 0.44 damage (+12%)
  fiveUpgrades: {
    hitsToKill: 3, // 1.0 ÷ 0.44 = 2.27 → 3 hits
    timeToKill: 4.5, // 3 hits × 1.5s = 4.5s

    // But at 500m, enemy has 1.5 HP
    hitsAt500m: 4, // 1.5 ÷ 0.44 = 3.41 → 4 hits
    timeAt500m: 6.0, // Back to 6.0s (balanced!)
  },
};
```

**Design Notes**:

- Without upgrades: Struggling by end (enemies get harder faster than you kill them)
- With 1-2 upgrades: Can keep up, but still challenged
- With 5 upgrades: Perfectly balanced at 500m (same TTK as start)

---

### Enemy Spawn vs. Kill Rate

```typescript
const SPAWN_VS_KILL = {
  // Spawning
  spawnRate: 6.0,            // 1 enemy every 6 seconds
  spawnTotal: 20,            // 120s ÷ 6s = 20 enemies

  // Killing (no upgrades)
  killRate: 6.0,             // 6 seconds per enemy
  killsPerMinute: 10,        // 60s ÷ 6s = 10 enemies/min

  // Balance point
  balanced: {
    spawnRate: 6.0,
    killRate: 6.0,
    result: 'Just barely keeping up'
  },

  // With upgrades
  withUpgrades: {
    spawnRate: 6.0,
    killRate: 4.5,           // 33% faster
    result: 'Clearing comfortably'
  },

  // Failure state
  withoutUpgrades: {
    spawnRate: 6.0,
    killRate: 6.0 + (increasing difficulty),
    result: 'Enemies pile up, player fails'
  }
}
```

**Design Goal**: Force 1-2 upgrades minimum to succeed.

---

## UI Specifications

### HUD Layout

```
╔════════════════════════════════════════════════════════════╗
║  Distance: 234m / 500m    Arcana: 0.24    SP: 0.024      ║
╠════════════════════════════════════════════════════════════╣
║                                                             ║
║     🐉                          👹                          ║
║    Dragon                     Enemy                         ║
║   [10.0/10.0]                [1.2/1.5]                      ║
║                                                             ║
║                      -0.25                                  ║
║                                                             ║
╚════════════════════════════════════════════════════════════╝
```

**HUD Elements**:

1. **Distance Bar**: "234m / 500m" (top-center)
2. **Arcana Counter**: "0.24" (top-right)
3. **Soul Power Counter**: "0.024" (top-right, smaller font)
4. **Dragon Health**: "10.0/10.0" (above dragon)
5. **Enemy Health**: "1.2/1.5" (above enemy)
6. **Damage Numbers**: "-0.25" (floating, fade out)

**Number Formatting**:

- **Always show 2 decimals** for values < 1.0
- Examples: "0.03", "0.24", "0.10"
- Round to 1 decimal for values 1.0-10.0
- Examples: "1.5", "5.2", "9.8"
- Whole numbers for values > 10.0
- Examples: "12", "45", "103"

---

### Upgrade UI (Simple)

```
╔═══════════════════════════════════════╗
║      EMBER POTENCY                    ║
║      Level 0 → Level 1                ║
║                                       ║
║      Damage: 0.25 → 0.28 (+12%)       ║
║                                       ║
║      Cost: 0.10 Arcana                ║
║      [You have: 0.12 Arcana]          ║
║                                       ║
║      [UPGRADE] [Cancel]               ║
╚═══════════════════════════════════════╝
```

**Upgrade Flow**:

1. Player presses "U" key (or clicks button)
2. Pause combat
3. Show upgrade panel
4. Player clicks "Upgrade"
5. Arcana deducted
6. Damage increases immediately
7. Resume combat

---

## Acceptance Criteria

### Duration & Pacing

- [ ] Ward duration: 90-120 seconds ✓
- [ ] First enemy spawns at 3 seconds
- [ ] Last enemy killed around 2:00 mark
- [ ] Auto-advance speed: 4.17 m/s
- [ ] Distance increases smoothly

### Enemy Behavior

- [ ] Banner-Runner spawns every 6 seconds
- [ ] Max 5 enemies on screen
- [ ] ~20 total enemies in Ward 1
- [ ] Enemies move towards dragon at 1.2 m/s
- [ ] Enemies stop at 2.0m range
- [ ] Enemies attack every 2.8s when in range

### Combat Balance

- [ ] Dragon kills enemy in 4 hits (6 seconds) without upgrades
- [ ] Dragon kills enemy in 3 hits (4.5 seconds) with 3+ upgrades
- [ ] At 500m with 5 upgrades, back to 4 hits (balanced)
- [ ] Player MUST upgrade 1-2 times to keep up
- [ ] No deaths on first run if player upgrades properly

### Currency Rewards

- [ ] Each kill awards 0.03 Arcana
- [ ] Each kill awards 0.003 Soul Power
- [ ] Total at end: ~0.60 Arcana, ~0.06 Soul Power
- [ ] First upgrade available at ~27 seconds (0.10 Arcana)
- [ ] Can afford 5 upgrades total

### Item Drops

- [ ] 2% drop chance
- [ ] 0-1 items drop in Ward 1 (expected: 0.4)
- [ ] Item notification shows name + value
- [ ] Items stored in inventory (no selling yet)

### Progression Feel

- [ ] Player notices enemy HP increasing
- [ ] Player notices self getting stronger with upgrades
- [ ] Reaching 0.10 Arcana feels like achievement
- [ ] Killing 20th enemy feels satisfying
- [ ] Ward completion feels earned, not given

### UI/UX

- [ ] Distance bar updates smoothly
- [ ] Currency counters update on kill
- [ ] Health bars accurate
- [ ] Damage numbers float and fade
- [ ] No UI overlap or clipping
- [ ] Numbers formatted correctly (2 decimals)

### Performance

- [ ] 60 FPS on desktop
- [ ] 40+ FPS on mid-range phone
- [ ] No lag with 5 enemies + projectiles
- [ ] No memory leaks after multiple runs

---

## Implementation Checklist

### Phase 0.5: Bug Fix (First)

- [ ] Create EntityManager
- [ ] Remove duplicate dragon from GameStartManager
- [ ] Refactor LandManager (environment only)
- [ ] Fix health bar system
- [ ] Test: Only one dragon visible

### Phase 1.1: Core Systems

- [ ] CombatManager with correct balance
- [ ] ProgressionManager (500m, 4.17 m/s, 10m ramps)
- [ ] CurrencyManager (0.03 Arcana, 0.003 SP per kill)
- [ ] ItemManager (2% drop rate)
- [ ] Test: Systems initialize correctly

### Phase 1.2: Enemy Spawning

- [ ] FactionManager with Banner-Runner (1.0 HP, 0.15 DMG)
- [ ] EnemySpawnManager (6s interval, max 5)
- [ ] Enemy AI (move, stop, attack)
- [ ] Test: 20 enemies spawn in 120 seconds

### Phase 1.3: Combat System

- [ ] Dragon auto-attack (0.25 damage, 1.5s cooldown)
- [ ] ProjectileManager
- [ ] Collision detection
- [ ] Damage application
- [ ] Death handling
- [ ] Test: Dragon kills enemy in 4 hits

### Phase 1.4: Rewards System

- [ ] Arcana drops (0.03 per kill)
- [ ] Soul Power drops (0.003 per kill)
- [ ] Item drops (2% chance)
- [ ] Currency UI updates
- [ ] Item notification
- [ ] Test: Currencies accumulate correctly

### Phase 1.5: Upgrade System

- [ ] Ember Potency enchantment
- [ ] Upgrade UI
- [ ] Geometric cost scaling (×1.12)
- [ ] Damage scaling (+12% per level)
- [ ] Test: 5 upgrades possible, costs match

### Phase 1.6: Progression & Completion

- [ ] Micro-ramps (+1% every 10m)
- [ ] Enemy scaling formula
- [ ] Ward completion detection (500m)
- [ ] "Ward Complete" screen
- [ ] Return to Draconia flow
- [ ] Test: Journey completes at 500m

### Phase 1.7: Polish & Balance

- [ ] Number formatting (2 decimals)
- [ ] UI polish
- [ ] Balance tuning
- [ ] Playtesting
- [ ] Bug fixes
- [ ] Test: Feels good, balanced, fun

---

## Testing Scenarios

### Happy Path

```
1. Start journey
2. Wait 27 seconds (earn 0.09 Arcana from 3 kills)
3. Get first upgrade available notification
4. Upgrade Ember Potency (0.10 Arcana spent)
5. Continue killing enemies (now faster)
6. Earn enough for 2nd upgrade at ~54 seconds
7. Upgrade again
8. Continue to 500m
9. Ward complete, total: 0.60 Arcana, 0.06 Soul Power
10. Return to Draconia
✓ Success
```

### Struggle Path

```
1. Start journey
2. Player doesn't upgrade
3. Enemies pile up (spawning faster than killing)
4. Dragon takes damage
5. Player realizes need to upgrade
6. Upgrades at 0.15 Arcana (late)
7. Barely clears Ward 1
8. Learns lesson: upgrade early
✓ Educational failure → success
```

### Optimal Path

```
1. Start journey
2. Upgrade immediately at 0.10 Arcana
3. Upgrade again at 0.21 Arcana
4. Upgrade again at 0.33 Arcana
5. Upgrade again at 0.46 Arcana
6. Crushing enemies easily
7. Complete Ward 1 with 0.61 Arcana (all spent)
8. Feels powerful and efficient
✓ Mastery rewarded
```

---

## Success Metrics

### Target Metrics

- **Completion Rate**: >85% of players complete Ward 1
- **Average Duration**: 100-130 seconds
- **Upgrade Count**: 2-4 upgrades per run (average 3)
- **Death Rate**: <15% on first attempt
- **Return Rate**: >75% start Ward 2
- **Session Length**: 5-8 minutes (includes menu time)

### Balance Validation

- **TTK Variance**: 4-6 seconds throughout ward (with upgrades)
- **Currency Earned**: 0.55-0.65 Arcana (target: 0.60)
- **Upgrades Possible**: 4-5 (target: 5)
- **Item Drops**: 0-2 per run (expected: 0.4)
- **Player HP Remaining**: >50% (shouldn't be close to death)

---

## Next Steps After Ward 1

1. **Phase 1.2**: Add Enchantment System
   - Ember Potency unlocked
   - Persist between runs
   - Multiple nodes (future)

2. **Phase 1.3**: Implement Ward 2 (500-1000m)
   - Add Dust-Mane Strider (2.0 HP, 0.20 DMG)
   - Ward bump: 1.22× multiplier
   - More challenging

3. **Phase 1.4**: Add Ward 3-4 + Boss
   - Add aerial enemies
   - Heartwood Abomination boss
   - Boss mechanics

4. **Phase 2**: Town System
   - Sell items for gold
   - Buy QoL upgrades
   - Vendor management

---

**Remember**: Keep numbers small, make 0.10 feel like an achievement, and ensure progression feels earned, not given. Ward 1 is the foundation - get this right, and the rest follows.
