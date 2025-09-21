--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/10*Endgame*Rift*NGPlus.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 10 — Endgame: Rift Siege & NG+

## Endgame Design Philosophy

### Core Principles

- **Combat Mastery Validation**: Endgame tests mastery of combat systems learned throughout the game

- **Civic Build Value**: Good city development provides advantages but isn't required

- **Achievable Without Deep Town**: Clear achievable without extensive meta-progression

- **Meaningful Choices**: NG+ provides fresh challenges without invalidating progress

### Endgame Progression Flow

1. **Forward Outposts**: Timed mini-projects to establish footholds

1. **Siege Gauntlet**: Multi-phase battle testing all systems

1. **Rift Closure**: Final confrontation with the source of evil

1. **NG+ Unlock**: New challenges with mutator systems

## Forward Outposts System

### Outpost Establishment

````typescript

export interface ForwardOutpost {
  id: string;
  name: string;
  location: Vector2;
  type: 'supply*depot' | 'observation*post' | 'artillery*position' | 'command*center';

  // Establishment Requirements
  materials: MaterialRequirement[];
  time: number; // hours to establish
  personnel: PersonnelRequirement[];

  // Operational Benefits
  bonuses: OutpostBonus[];
  capabilities: OutpostCapability[];

  // Maintenance
  upkeepCost: number; // daily cost to maintain
  vulnerability: number; // 0-100, chance of being attacked
}

```javascript

### Outpost Mini-Projects

```typescript

export interface OutpostProject {
  id: string;
  name: string;
  outpostId: string;
  type: 'construction' | 'upgrade' | 'defense' | 'logistics';

  // Project Requirements
  materials: MaterialRequirement[];
  time: number; // hours to complete
  workforce: number; // personnel required

  // Benefits
  operationalBonus: number; // +X% to outpost effectiveness
  siegeBonus: number; // +X% to siege performance
  resourceGeneration: ResourceGeneration[];

  // Risks
  attackChance: number; // chance of being attacked during construction
  failurePenalty: number; // cost of project failure
}

```javascript

### Outpost Defense System

```typescript

export interface OutpostDefense {
  outpostId: string;
  defenseLevel: number; // 1-10
  fortifications: Fortification[];
  garrison: Garrison[];

  // Defense Mechanics
  attackResistance: number; // 0-100, reduces attack success chance
  damageReduction: number; // 0-100, reduces damage taken
  counterattackAbility: number; // 0-100, chance to counterattack

  // Maintenance
  defenseUpkeep: number; // daily cost to maintain defenses
  repairCost: number; // cost to repair after attacks
}

```text

## Siege Gauntlet System

### Siege Phases

```typescript

export interface SiegePhase {
  id: string;
  name: string;
  phaseNumber: number;
  duration: number; // minutes

  // Phase Mechanics
  objectives: SiegeObjective[];
  enemyWaves: EnemyWave[];
  environmentalHazards: EnvironmentalHazard[];

  // Success Conditions
  requiredObjectives: number; // minimum objectives to complete phase
  timeLimit: number; // maximum time to complete phase
  failureConditions: FailureCondition[];

  // Rewards
  phaseRewards: Reward[];
  progressionBonuses: ProgressionBonus[];
}

```javascript

### Siege Objectives

```typescript

export interface SiegeObjective {
  id: string;
  name: string;
  type: 'eliminate' | 'capture' | 'defend' | 'escort' | 'survive';

  // Objective Details
  target: ObjectiveTarget;
  timeLimit: number; // seconds to complete
  successCriteria: SuccessCriteria[];

  // Difficulty Scaling
  difficultyLevel: number; // 1-5
  scalingFactor: number; // multiplies enemy difficulty

  // Rewards
  completionRewards: Reward[];
  partialCompletionRewards: Reward[];
  failurePenalty: number; // penalty for failure
}

```javascript

### Siege Mechanics

```typescript

export interface SiegeMechanics {
  // Player Abilities
  siegeAbilities: SiegeAbility[];
  outpostSupport: OutpostSupport[];
  cityBonuses: CityBonus[];

  // Enemy Mechanics
  enemyScaling: EnemyScaling;
  bossMechanics: BossMechanic[];
  environmentalEffects: EnvironmentalEffect[];

  // Resource Management
  siegeResources: SiegeResource[];
  resourceRegeneration: ResourceRegeneration[];
  resourceCapacities: ResourceCapacity[];
}

```text

## Rift Closure Sequence

### Final Confrontation

```typescript

export interface RiftClosure {
  id: string;
  name: string;

  // Pre-Fight Setup
  preparationPhase: PreparationPhase;
  outpostActivation: OutpostActivation[];
  cityMobilization: CityMobilization[];

  // Main Encounter
  riftBoss: RiftBoss;
  phaseTransitions: PhaseTransition[];
  environmentalChanges: EnvironmentalChange[];

  // Victory Conditions
  victoryRequirements: VictoryRequirement[];
  alternateEndings: AlternateEnding[];

  // Post-Victory
  rewards: VictoryReward[];
  ngPlusUnlock: NGPlusUnlock;
}

```javascript

### Rift Boss Design

```typescript

export interface RiftBoss {
  id: string;
  name: string;
  title: string;

  // Boss Phases
  phases: BossPhase[];
  phaseTransitions: PhaseTransition[];

  // Unique Mechanics
  riftMechanics: RiftMechanic[];
  environmentalControl: EnvironmentalControl[];
  minionSummoning: MinionSummoning[];

  // Scaling
  difficultyScaling: DifficultyScaling;
  cityBonusIntegration: CityBonusIntegration[];

  // Rewards
  defeatRewards: Reward[];
  masteryRewards: Reward[];
  achievementUnlocks: AchievementUnlock[];
}

```javascript

## New Game Plus (NG+) System

### NG+ Unlock Requirements

```typescript

export interface NGPlusUnlock {
  requirements: {
    riftDefeated: boolean;
    minimumDistance: number; // meters reached
    cityDevelopment: number; // bastion tier achieved
    researchCompletion: number; // percentage of research completed
  };

  // Unlock Benefits
  carryOverItems: CarryOverItem[];
  startingBonuses: StartingBonus[];
  newContent: NewContent[];

  // NG+ Mutators
  availableMutators: Mutator[];
  mutatorSlots: number; // how many mutators can be active
}

```javascript

### Mutator System

```typescript

export interface Mutator {
  id: string;
  name: string;
  description: string;
  type: 'difficulty' | 'mechanics' | 'economy' | 'cosmetic';

  // Mutator Effects
  effects: MutatorEffect[];
  difficultyModifier: number; // multiplies enemy difficulty
  rewardModifier: number; // multiplies rewards

  // Mutator Categories
  category: MutatorCategory;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';

  // Unlock Requirements
  unlockRequirements: MutatorUnlock[];
  ngPlusLevel: number; // minimum NG+ level required
}

```text

### NG+ Mutator Examples

#### **Resource Attrition**

```typescript

const RESOURCE_ATTTRITION: Mutator = {
  id: 'resource_attrition',
  name: 'Resource Attrition',
  description: 'Enemies consume resources when defeated, reducing Arcana gains',
  type: 'economy',

  effects: [{
    type: 'arcana_reduction',
    value: 0.25, // 25% reduction in Arcana gains
    condition: 'on*enemy*death'
  }],

  difficultyModifier: 1.0,
  rewardModifier: 1.5, // 50% bonus rewards to compensate

  category: 'economy',
  rarity: 'common',
  ngPlusLevel: 1
};

```javascript

#### **Elemental Embargo**

```typescript

const ELEMENTAL_EMBARGO: Mutator = {
  id: 'elemental_embargo',
  name: 'Elemental Embargo',
  description: 'Certain elements are forbidden each week, reducing their effectiveness',
  type: 'mechanics',

  effects: [{
    type: 'elemental_restriction',
    restrictedElements: ['fire', 'ice'], // changes weekly
    effectivenessReduction: 0.5 // 50% reduction
  }],

  difficultyModifier: 1.2,
  rewardModifier: 1.3,

  category: 'mechanics',
  rarity: 'uncommon',
  ngPlusLevel: 2
};

```javascript

#### **Void Corruption**

```typescript

const VOID_CORRUPTION: Mutator = {
  id: 'void_corruption',
  name: 'Void Corruption',
  description: 'Void energy corrupts the land, adding new enemy types and mechanics',
  type: 'difficulty',

  effects: [{
    type: 'enemy_corruption',
    corruptionChance: 0.15, // 15% chance to corrupt enemies
    corruptionEffects: ['void*damage', 'phase*shift', 'damage_reflection']
  }],

  difficultyModifier: 1.5,
  rewardModifier: 2.0,

  category: 'difficulty',
  rarity: 'rare',
  ngPlusLevel: 3
};

```text

## NG+ Progression System

### NG+ Levels

```typescript

export interface NGPlusLevel {
  level: number;
  name: string;

  // Unlock Requirements
  requirements: {
    previousLevel: boolean;
    distanceReached: number;
    mutatorsCompleted: number;
    achievements: string[];
  };

  // New Content
  newMutators: Mutator[];
  newContent: NewContent[];
  newChallenges: Challenge[];

  // Bonuses
  startingBonuses: StartingBonus[];
  progressionBonuses: ProgressionBonus[];
  cosmeticUnlocks: CosmeticUnlock[];
}

```javascript

### Carry-Over System

```typescript

export interface CarryOverSystem {
  // What Carries Over
  researchProgress: number; // percentage of research completed
  cityDevelopment: number; // bastion tier achieved
  achievements: Achievement[];
  cosmeticUnlocks: CosmeticUnlock[];

  // What Resets
  currentDistance: number; // reset to 0
  arcana: number; // reset to 0
  enchants: Enchant[]; // reset to 0
  currentLand: number; // reset to 1

  // Starting Bonuses
  startingSoulPower: number; // bonus Soul Power
  startingMaterials: Material[]; // bonus materials
  startingResearch: Research[]; // some research unlocked
}

```text

## Seasonal & Event Content

### Seasonal Mutators

```typescript

export interface SeasonalMutator {
  id: string;
  name: string;
  season: 'spring' | 'summer' | 'autumn' | 'winter';

  // Seasonal Effects
  environmentalChanges: EnvironmentalChange[];
  enemyModifications: EnemyModification[];
  rewardModifications: RewardModification[];

  // Duration
  startDate: number; // timestamp
  endDate: number; // timestamp
  activeDuration: number; // days

  // Unlock Requirements
  ngPlusLevel: number;
  previousSeasonal: boolean; // requires previous seasonal completion
}

```javascript

### Community Events

```typescript

export interface CommunityEvent {
  id: string;
  name: string;
  type: 'global_challenge' | 'leaderboard' | 'cooperative' | 'competitive';

  // Event Mechanics
  objectives: EventObjective[];
  scoring: ScoringSystem[];
  leaderboards: Leaderboard[];

  // Rewards
  participationRewards: Reward[];
  achievementRewards: Reward[];
  leaderboardRewards: Reward[];

  // Duration
  startDate: number;
  endDate: number;
  activeDuration: number;
}

```javascript

## Performance & Optimization

### Endgame Performance Budgets

```typescript

export interface EndgamePerformance {
  // Siege Performance
  maxSiegeEnemies: number; // 500 (increased from 400)
  maxSiegeEffects: number; // 200 (increased from 100)
  siegeUpdateRate: number; // 60fps required

  // NG+ Performance
  maxMutators: number; // 5 active mutators max
  mutatorUpdateRate: number; // updates per second
  carryOverDataSize: number; // MB limit for carry-over data

  // Optimization
  siegeOptimization: SiegeOptimization[];
  mutatorOptimization: MutatorOptimization[];
  dataCompression: DataCompression[];
}

```text

### Endgame Scaling

- **Siege Scaling**: Enemies scale based on player progression and city development

- **Mutator Scaling**: Mutator effects scale with NG+ level

- **Reward Scaling**: Rewards scale with difficulty and mutator count

- **Performance Scaling**: Effects scale with device capabilities

## Acceptance Criteria

- [ ] Forward outposts provide meaningful strategic choices

- [ ] Siege gauntlet tests mastery of all combat systems

- [ ] Rift closure provides satisfying conclusion to main story

- [ ] NG+ mutators offer fresh challenges without invalidating progress

- [ ] Carry-over system preserves meaningful progression

- [ ] Seasonal content provides ongoing engagement

- [ ] Performance budgets maintained during endgame content

- [ ] Endgame content scales appropriately with player progression

- [ ] Community events foster engagement without requiring participation

- [ ] NG+ system provides long-term replayability
````
