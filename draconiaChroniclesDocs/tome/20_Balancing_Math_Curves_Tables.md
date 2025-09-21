--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/20*Balancing*Math*Curves*Tables.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 20 — Balancing: Math, Curves & Tables

## Mathematical Framework

### Core Balancing Principles

- **Geometric Progression**: Most costs and rewards use geometric growth

- **Diminishing Returns**: Benefits decrease as investment increases

- **Risk vs Reward**: Higher risk activities provide better rewards

- **Player Agency**: Multiple viable strategies for progression

### Mathematical Constants

````typescript

export const BALANCING_CONSTANTS = {
  // Cost Growth Rates
  ARCANA*COST*GROWTH: 1.12,        // ×1.12 per level
  SOUL*COST*GROWTH: 1.90,          // ×1.90 per rank
  TIER*UP*MULTIPLIER: 20,          // 15-25× last level cost

  // Enemy Scaling
  ENEMY*HP*GROWTH: 1.18,           // ×1.18 per ward
  ENEMY*DMG*GROWTH: 1.15,          // ×1.15 per ward
  MICRO*RAMP*INTERVAL: 10,         // every 10 meters
  MICRO*RAMP*INCREMENT: 0.01,      // +1% per interval

  // Distance Scaling
  DISTANCE*HP*MULTIPLIER: 1.25,    // ×1.25 per distance milestone
  DISTANCE*DMG*MULTIPLIER: 1.10,   // ×1.10 per distance milestone

  // Offline Progression
  OFFLINE*BASE*RATE: 0.1,          // 10% of active play rate
  OFFLINE*DECAY*RATE: 0.5,         // 50% decay per hour after 8h
  OFFLINE*CAP*HOURS: 24,           // 24 hour cap
  RESTED_BONUS: 0.5,               // +50% for 15 minutes
  RESTED_COOLDOWN: 30,             // 30 minute cooldown
};

```text

## Cost & Progression Curves

### Enchant Cost Formulas

```typescript

export function calculateEnchantCost(
  baseCost: number,
  level: number,
  growthRate: number = BALANCING*CONSTANTS.ARCANA*COST_GROWTH
): number {
  return Math.floor(baseCost * Math.pow(growthRate, level));
}

export function calculateTierUpCost(
  lastLevelCost: number,
  multiplier: number = BALANCING*CONSTANTS.TIER*UP_MULTIPLIER
): number {
  return Math.floor(lastLevelCost * multiplier);
}

export function calculateSoulCost(
  baseCost: number,
  rank: number,
  growthRate: number = BALANCING*CONSTANTS.SOUL*COST_GROWTH
): number {
  return Math.floor(baseCost * Math.pow(growthRate, rank));
}

```javascript

### Research Cost Formulas

```typescript

export function calculateResearchCost(
  labLevel: number,
  researchType: 'short' | 'medium' | 'long'
): ResearchCost {
  const baseCosts = {
    short: { soulPower: 50, time: 300 },    // 5 minutes
    medium: { soulPower: 100, time: 900 },  // 15 minutes
    long: { soulPower: 200, time: 1800 }    // 30 minutes
  };

  const cost = baseCosts[researchType];
  const labMultiplier = Math.pow(1.5, labLevel - 1);

  return {
    soulPower: Math.floor(cost.soulPower * labMultiplier),
    time: Math.floor(cost.time * labMultiplier),
    materials: calculateMaterialCost(labLevel, researchType)
  };
}

export function calculateMaterialCost(
  labLevel: number,
  researchType: string
): MaterialRequirement[] {
  const materialTiers = ['T1', 'T2', 'T3'];
  const tierIndex = Math.min(labLevel - 1, materialTiers.length - 1);

  return [
    {
      materialId: `material*${materialTiers[tierIndex]}*basic`,
      quantity: Math.floor(10 * Math.pow(1.3, labLevel - 1))
    },
    {
      materialId: `material*${materialTiers[tierIndex]}*advanced`,
      quantity: Math.floor(5 * Math.pow(1.3, labLevel - 1))
    }
  ];
}

```text

## Enemy Scaling Mathematics

### HP & Damage Scaling

```typescript

export function calculateEnemyHP(
  baseHP: number,
  ward: number,
  distanceM: number,
  enemyType: 'minion' | 'elite' | 'boss'
): number {
  const wardMultiplier = Math.pow(BALANCING*CONSTANTS.ENEMY*HP_GROWTH, ward - 1);
  const microRampMultiplier = calculateMicroRamp(distanceM);
  const typeMultiplier = getEnemyTypeMultiplier(enemyType);

  return Math.floor(baseHP * wardMultiplier * microRampMultiplier * typeMultiplier);
}

export function calculateEnemyDamage(
  baseDamage: number,
  ward: number,
  distanceM: number,
  enemyType: 'minion' | 'elite' | 'boss'
): number {
  const wardMultiplier = Math.pow(BALANCING*CONSTANTS.ENEMY*DMG_GROWTH, ward - 1);
  const microRampMultiplier = calculateMicroRamp(distanceM);
  const typeMultiplier = getEnemyTypeMultiplier(enemyType);

  return Math.floor(baseDamage * wardMultiplier * microRampMultiplier * typeMultiplier);
}

export function calculateMicroRamp(
  distanceM: number,
  interval: number = BALANCING*CONSTANTS.MICRO*RAMP_INTERVAL,
  increment: number = BALANCING*CONSTANTS.MICRO*RAMP_INCREMENT
): number {
  const rampCount = Math.floor(distanceM / interval);
  return 1 + (rampCount * increment);
}

export function getEnemyTypeMultiplier(enemyType: string): number {
  const multipliers = {
    minion: 1.0,
    elite: 3.2,
    boss: 40.0
  };

  return multipliers[enemyType] || 1.0;
}

```javascript

### Arcana Reward Scaling

```typescript

export function calculateArcanaReward(
  baseArcana: number,
  ward: number,
  distanceM: number,
  enemyType: 'minion' | 'elite' | 'boss',
  bonuses: ArcanaBonus[] = []
): number {
  const wardMultiplier = Math.pow(1.15, ward - 1);
  const distanceMultiplier = 1 + (distanceM / 1000) * 0.1;
  const typeMultiplier = getEnemyTypeMultiplier(enemyType);

let totalArcana = Math.floor(baseArcana * wardMultiplier * distanceMultiplier *
typeMultiplier);

  // Apply bonuses
  for (const bonus of bonuses) {
    totalArcana = Math.floor(totalArcana * (1 + bonus.multiplier));
  }

  return totalArcana;
}

export function calculateSoulPowerReward(
  baseSoulPower: number,
  ward: number,
  distanceM: number,
  enemyType: string
): number {
  const wardMultiplier = Math.pow(1.05, ward - 1);
  const distanceMultiplier = 1 + (distanceM / 1000) * 0.05;
  const typeMultiplier = getEnemyTypeMultiplier(enemyType);

  return Math.floor(baseSoulPower * wardMultiplier * distanceMultiplier * typeMultiplier);
}

```text

## Offline Progression Models

### Linear → Decay Model

```typescript

export function calculateOfflineProgress(
  elapsedMs: number,
  baseRate: number = BALANCING*CONSTANTS.OFFLINE*BASE_RATE,
  decayRate: number = BALANCING*CONSTANTS.OFFLINE*DECAY_RATE,
  capHours: number = BALANCING*CONSTANTS.OFFLINE*CAP_HOURS
): OfflineProgress {
  const elapsedHours = elapsedMs / (60 * 60 * 1000);
  const cappedHours = Math.min(elapsedHours, capHours);

  // Linear progression for first 8 hours
  const linearHours = 8;
  let progress = 0;

  if (cappedHours <= linearHours) {
    progress = cappedHours * baseRate;
  } else {
    // Linear + diminishing returns
    const linearProgress = linearHours * baseRate;
    const diminishingHours = cappedHours - linearHours;
const diminishingProgress = diminishingHours * baseRate * Math.exp(-decayRate *
diminishingHours);
    progress = linearProgress + diminishingProgress;
  }

  return {
    elapsedMs: elapsedMs,
    progress: progress,
    rewards: calculateOfflineRewards(progress)
  };
}

```javascript

### Logistic Cap Model

```typescript

export function calculateLogisticOfflineProgress(
  elapsedMs: number,
  cap: number,
  growthRate: number = 0.1,
  midpoint: number = 8
): OfflineProgress {
  const elapsedHours = elapsedMs / (60 * 60 * 1000);

  // Logistic function: cap / (1 + e^(-growthRate * (elapsedHours - midpoint)))
  const progress = cap / (1 + Math.exp(-growthRate * (elapsedHours - midpoint)));

  return {
    elapsedMs: elapsedMs,
    progress: progress,
    rewards: calculateOfflineRewards(progress)
  };
}

```javascript

### Piecewise Power Model

```typescript

export function calculatePiecewiseOfflineProgress(
  elapsedMs: number,
  baseRate: number = 0.1,
  powerExponent: number = 0.7
): OfflineProgress {
  const elapsedHours = elapsedMs / (60 * 60 * 1000);

  let progress: number;

  if (elapsedHours <= 8) {
    // Full rate for first 8 hours
    progress = elapsedHours * baseRate;
  } else {
    // Reduced rate with power function
    const fullRateProgress = 8 * baseRate;
    const remainingHours = elapsedHours - 8;
const reducedRateProgress = remainingHours * baseRate * Math.pow(remainingHours,
powerExponent
-
1);
    progress = fullRateProgress + reducedRateProgress;
  }

  return {
    elapsedMs: elapsedMs,
    progress: progress,
    rewards: calculateOfflineRewards(progress)
  };
}

```text

## Fire Tier System Mathematics

### Fire Tier Triggers

```typescript

export function calculateFireTier(
  firecraftNodes: Record<string, number>,
  safetyNodes: Record<string, number>,
  scalesNodes: Record<string, number>
): FireTier {
  const tierRequirements = {
    Regular: { min: 0, max: 5 },
    Blue: { min: 6, max: 10 },
    Green: { min: 11, max: 15 },
    Purple: { min: 16, max: 20 },
    Dark: { min: 21, max: 25 },
    Black: { min: 26, max: 30 },
    Holy: { min: 31, max: 35 },
    Azure: { min: 36, max: 40 },
    Prismatic: { min: 41, max: 45 },
    Void: { min: 46, max: 50 }
  };

  const totalDepth = calculateCombinedDepth(firecraftNodes, safetyNodes, scalesNodes);

  for (const [tier, range] of Object.entries(tierRequirements)) {
    if (totalDepth >= range.min && totalDepth <= range.max) {
      return tier as FireTier;
    }
  }

  return 'Regular';
}

export function calculateCombinedDepth(
  firecraftNodes: Record<string, number>,
  safetyNodes: Record<string, number>,
  scalesNodes: Record<string, number>
): number {
const firecraftDepth = Object.values(firecraftNodes).reduce((sum, level) => sum + level,
0);
  const safetyDepth = Object.values(safetyNodes).reduce((sum, level) => sum + level, 0);
  const scalesDepth = Object.values(scalesNodes).reduce((sum, level) => sum + level, 0);

  return firecraftDepth + safetyDepth + scalesDepth;
}

```javascript

### Fire Tier Hazard Scaling

```typescript

export function calculateFireTierHazard(tier: FireTier): number {
  const hazardMultipliers = {
    Regular: 1.00,
    Blue: 1.05,
    Green: 1.10,
    Purple: 1.15,
    Dark: 1.20,
    Black: 1.25,
    Holy: 1.30,
    Azure: 1.35,
    Prismatic: 1.40,
    Void: 1.50
  };

  return hazardMultipliers[tier];
}

```text

## Synth Materials Mathematics

### Production Formulas

```typescript

export function calculateSynthProduction(
  materialId: string,
  tier: number,
  rank: number,
  mineralsLevel: number
): SynthProduction {
  const baseProduction = getBaseProduction(materialId, tier);
  const rankMultiplier = Math.pow(1.2, rank);
  const mineralsBonus = Math.pow(1.1, mineralsLevel);

  return {
    productionRate: baseProduction * rankMultiplier * mineralsBonus,
    timePerUnit: 1 / (baseProduction * rankMultiplier * mineralsBonus),
    costReduction: Math.min(0.5, mineralsLevel * 0.05) // Max 50% reduction
  };
}

export function calculateCheckpointRewards(
  materialId: string,
  tier: number,
  rank: number
): CheckpointReward[] {
  const rewards: CheckpointReward[] = [];

  // Rank completion rewards
  if (rank % 5 === 0) {
    rewards.push({
      type: 'material',
      materialId: materialId,
      quantity: Math.floor(10 * Math.pow(1.5, tier))
    });
  }

  // Tier completion rewards
  if (rank === 10) {
    rewards.push({
      type: 'soulPower',
      quantity: Math.floor(100 * Math.pow(1.3, tier))
    });
  }

  return rewards;
}

```text

## Balancing Tables

### Enchant Cost Tables

```typescript

export const ENCHANT*COST*TABLES = {
  Firepower: {
    baseCost: 10,
    growthRate: 1.12,
    maxLevel: 50,
    tierUpCost: 20
  },
  Scales: {
    baseCost: 15,
    growthRate: 1.12,
    maxLevel: 50,
    tierUpCost: 30
  },
  Safety: {
    baseCost: 20,
    growthRate: 1.12,
    maxLevel: 50,
    tierUpCost: 40
  }
};

```javascript

### Enemy Scaling Tables

```typescript

export const ENEMY*SCALING*TABLES = {
  minion: {
    baseHP: 100,
    baseDamage: 10,
    baseArcana: 10,
    baseSoulPower: 1
  },
  elite: {
    baseHP: 320,
    baseDamage: 20,
    baseArcana: 30,
    baseSoulPower: 3
  },
  boss: {
    baseHP: 4000,
    baseDamage: 100,
    baseArcana: 450,
    baseSoulPower: 45
  }
};

```javascript

### Research Cost Tables

```typescript

export const RESEARCH*COST*TABLES = {
  L1: {
    short: { soulPower: 50, time: 300, materials: ['T1_basic:10'] },
    medium: { soulPower: 100, time: 900, materials: ['T1*basic:20', 'T1*advanced:5'] },
    long: { soulPower: 200, time: 1800, materials: ['T1*basic:40', 'T1*advanced:10'] }
  },
  L2: {
    short: { soulPower: 75, time: 450, materials: ['T1*basic:15', 'T1*advanced:3'] },
    medium: { soulPower: 150, time: 1350, materials: ['T1*basic:30', 'T1*advanced:8'] },
    long: { soulPower: 300, time: 2700, materials: ['T1*basic:60', 'T1*advanced:15'] }
  }
  // ... continue for all lab levels
};

```javascript

## Anti-Cheese Measures

### Session Requirements

```typescript

export function validateSessionRequirements(
  lastSessionEnd: number,
  currentSessionStart: number,
  minimumSessionTime: number = 300 // 5 minutes
): boolean {
  const sessionGap = currentSessionStart - lastSessionEnd;
  return sessionGap >= minimumSessionTime;
}

```javascript

### Rested Bonus Validation

```typescript

export function validateRestedBonus(
  lastRestedTime: number,
  currentTime: number,
  cooldownMinutes: number = 30
): boolean {
  const timeSinceLastRested = currentTime - lastRestedTime;
  const cooldownMs = cooldownMinutes * 60 * 1000;

  return timeSinceLastRested >= cooldownMs;
}

```javascript

### Progression Validation

```typescript

export function validateProgression(
  currentProgress: ProgressState,
  previousProgress: ProgressState,
  maxProgressRate: number = 2.0
): boolean {
  const progressIncrease = currentProgress.distance - previousProgress.distance;
  const timeElapsed = currentProgress.timestamp - previousProgress.timestamp;
  const progressRate = progressIncrease / (timeElapsed / 1000); // per second

  return progressRate <= maxProgressRate;
}

```text

## Acceptance Criteria

- [ ] All cost formulas use geometric progression with defined growth rates

- [ ] Enemy scaling provides appropriate difficulty curves

- [ ] Offline progression models prevent exploitation

- [ ] Fire tier system scales hazard appropriately

- [ ] Synth materials production scales with investment

- [ ] Balancing tables provide clear reference values

- [ ] Anti-cheese measures prevent progression exploitation

- [ ] Mathematical constants are easily tunable

- [ ] Formulas are deterministic and reproducible

- [ ] Performance impact of calculations is minimal
````
