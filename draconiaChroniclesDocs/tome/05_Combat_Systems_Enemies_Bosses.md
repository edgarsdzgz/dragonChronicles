--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/05*Combat*Systems*Enemies*Bosses.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 05 — Combat Systems, Enemies & Bosses

## Core Combat Philosophy

### Combat-First Design Principles

- **Pre-Rift Power Budget**: ≥70% Journey research; town/meta ≤30% (City ≤10%)

- **Manual Contribution**: ~20% ±10% of damage from abilities pre-Rift

- **Performance Targets**: 60 fps desktop; ≥40 fps mid-phones; ≤200/400 enemies; ≤600 projectiles/s

- **Engagement Depth**: Auto-combat foundation with manual skill expression

### Combat Loop Architecture

````typescript

export interface CombatLoop {
  // Core Systems
  distance: DistanceSystem;
  spawning: SpawnSystem;
  ai: AISystem;
  dragon: DragonCombat;
  abilities: AbilitySystem;

  // Performance
  pooling: ObjectPooling;
  culling: OffscreenCulling;
  optimization: PerformanceOptimization;
}

```text

## Dragon Combat System

### Dragon Health & Defeat Mechanics

#### Health System Overview
```typescript
export interface DragonHealth {
  currentHP: number;
  maxHP: number;
  isAlive: boolean;
  isRecovering: boolean;
  recoveryProgress: number; // 0.0 to 1.0
  pushbackDistance: number;
  pushbackPercentage: number;
  
  // Health management
  takeDamage(amount: number): void;
  heal(amount: number): void;
  startRecovery(currentDistance: number, landLevel: number, wardLevel: number): void;
  updateRecovery(deltaTime: number): void;
  respawn(): void;
}
```

#### Defeat & Pushback System
When the dragon's health reaches 0, the following sequence occurs:

1. **Immediate Effects**:
   - All projectiles and enemies are cleared from screen
   - Dragon enters "idle" mode (stops moving/attacking)
   - Dragon becomes invulnerable during recovery

2. **Progressive Health Recovery**:
   - Health bar progressively recovers from 0% to 100%
   - Recovery time scales with pushback percentage (6-12 seconds)
   - Dragon loses journey distance during recovery (pushback effect)

3. **Pushback Distance Calculation**:
   - Percentage-based system (3-15% of current distance)
   - Land difficulty spikes: New lands start with 3% (gentle)
   - Ward progression: Within each land, pushback increases to 15%
   - Never pushes back below distance 0

4. **Ward/Land Transitions**:
   - Pushback can move dragon to different ward/land
   - Example: L2W2 at 1000m, 6% pushback = 940m (L2W1)
   - Seamless transition between areas

5. **Journey Continuation**:
   - Journey continues automatically after recovery
   - No Arcana lost during defeat
   - Journey only ends when player manually returns to Draconia

#### Pushback Percentage Progression
```
Land 1: Horizon Steppe (Tutorial → Advanced)
├── Ward 1: 3% (Sunwake Downs - tutorial)
├── Ward 2: 5% (Waystone Mile - basic)
├── Ward 3: 7% (Skylark Flats - air combat)
├── Ward 4: 10% (Longgrass Reach - accuracy)
└── Ward 5: 12% (Bluewind Shelf - crosswind)

Land 2: Ember Reaches (Difficulty Spike!)
├── Ward 1: 3% (New land tutorial - gentle)
├── Ward 2: 6% (Fire basics)
├── Ward 3: 9% (Heat resistance)
├── Ward 4: 12% (Lava flows)
└── Ward 5: 15% (Ember mastery)

Land 3: Mistral Peaks (Difficulty Spike!)
├── Ward 1: 3% (New land tutorial - gentle)
├── Ward 2: 7% (Wind basics)
├── Ward 3: 11% (Ice resistance)
├── Ward 4: 14% (Storm peaks)
└── Ward 5: 15% (Summit mastery)
```

### Dragon Elemental System

#### Nested Triangle System Overview
The dragon's breath weapon system uses a **nested triangle system** with three main categories, each containing three sub-elements that follow their own internal triangle relationships.

#### Meta-Triangle (Main Categories)
```
Heat > Cold > Energy > Heat
```

**Category Relationships:**
- **Heat beats Cold**: Fire melts ice, steam defrosts, lava vaporizes frost
- **Cold beats Energy**: Ice insulates electricity, frost grounds lightning, cold slows energy
- **Energy beats Heat**: Lightning disrupts fire, electricity conducts through heat, energy cuts through thermal systems

#### Sub-Triangles (Internal Elements)

##### **Heat Triangle: Fire > Lava > Steam > Fire**
- **Fire**: Pure flame, burning damage, ignites enemies
- **Lava**: Molten rock, armor penetration, area denial
- **Steam**: Scorching vapor, area denial, concealment

**Internal Logic:**
- **Fire beats Lava**: Pure flame burns through molten rock
- **Lava beats Steam**: Molten rock vaporizes steam
- **Steam beats Fire**: Scorching vapor extinguishes flames

##### **Cold Triangle: Ice > Frost > Mist > Ice**
- **Ice**: Solid freezing, immobilization, armor shattering
- **Frost**: Slowing effects, brittleness, surface coating
- **Mist**: Concealment, confusion, area denial

**Internal Logic:**
- **Ice beats Frost**: Solid ice crushes frost
- **Frost beats Mist**: Frost crystallizes mist
- **Mist beats Ice**: Mist conceals and confuses ice attacks

##### **Energy Triangle: Lightning > Plasma > Void > Lightning**
- **Lightning**: Electrical damage, stunning, precision
- **Plasma**: Superheated energy, explosive, area effect
- **Void**: Dark energy, corruption, disruption

**Internal Logic:**
- **Lightning beats Plasma**: Electrical precision disrupts plasma
- **Plasma beats Void**: Superheated energy burns through void
- **Void beats Lightning**: Dark energy absorbs electrical attacks

#### Cross-Triangle Rules
- **Any Heat element beats any Cold element** (150% damage)
- **Any Cold element beats any Energy element** (150% damage)
- **Any Energy element beats any Heat element** (150% damage)
- **Within same triangle**: Follow internal A > B > C > A rules (150% damage)
- **Same element**: 100% damage (neutral)
- **Opposite triangle**: 75% damage (weakness)

#### Elemental Status Effects
```typescript
const ELEMENTAL_EFFECTS = {
  // Heat effects
  fire: { name: 'Burn', damage: '2% max HP per second', duration: '5 seconds' },
  lava: { name: 'Melt', damage: 'Reduces armor by 25%', duration: '8 seconds' },
  steam: { name: 'Scorch', damage: 'Reduces accuracy by 30%', duration: '6 seconds' },
  
  // Cold effects
  ice: { name: 'Freeze', damage: 'Immobilizes for 3 seconds', duration: '3 seconds' },
  frost: { name: 'Chill', damage: 'Reduces speed by 40%', duration: '8 seconds' },
  mist: { name: 'Blind', damage: 'Reduces accuracy by 50%', duration: '4 seconds' },
  
  // Energy effects
  lightning: { name: 'Stun', damage: 'Prevents actions for 2 seconds', duration: '2 seconds' },
  plasma: { name: 'Overheat', damage: 'Increases damage taken by 25%', duration: '6 seconds' },
  void: { name: 'Corrupt', damage: 'Prevents healing for 10 seconds', duration: '10 seconds' }
};
```

#### Land-Based Elemental Themes
```typescript
const LAND_ELEMENTAL_THEMES = {
  'Land 1: Horizon Steppe': {
    primary: 'cold',      // Wind-based enemies (ice, frost, mist)
    secondary: 'energy',  // Lightning-based enemies
    resistance: 'heat'    // Resistant to heat (dry, windy land)
  },
  'Land 2: Ember Reaches': {
    primary: 'heat',      // Fire-based enemies (fire, lava, steam)
    secondary: 'cold',    // Ice-based enemies (volcanic ice)
    resistance: 'energy'  // Resistant to energy (volcanic grounding)
  },
  'Land 3: Mistral Peaks': {
    primary: 'energy',    // Lightning-based enemies
    secondary: 'cold',    // Wind-based enemies (ice, frost, mist)
    resistance: 'heat'    // Resistant to heat (mountainous, cold)
  }
};
```

#### Elemental System Introduction Strategy

##### **Phase 1: Meta-Triangle Introduction (Weeks 1-2)**
**Objective**: Teach players the core Heat > Cold > Energy > Heat relationship

**Land 1: Horizon Steppe - Meta-Triangle Tutorial**
```
Ward 1: Heat Enemies (Fire-based)
├── Enemy Types: Fire-breathing creatures, lava golems
├── Player Strategy: Use Cold attacks (Ice, Frost, Mist)
├── Tutorial: "Heat beats Cold, but Cold beats Energy"
└── Visual Cues: Red enemies, blue attack indicators

Ward 2: Cold Enemies (Ice-based)
├── Enemy Types: Ice elementals, frost wolves
├── Player Strategy: Use Energy attacks (Lightning, Plasma, Void)
├── Tutorial: "Cold beats Energy, but Energy beats Heat"
└── Visual Cues: Blue enemies, yellow attack indicators

Ward 3: Energy Enemies (Lightning-based)
├── Enemy Types: Storm elementals, electric beasts
├── Player Strategy: Use Heat attacks (Fire, Lava, Steam)
├── Tutorial: "Energy beats Heat, completing the triangle"
└── Visual Cues: Yellow enemies, red attack indicators
```

**Player Experience:**
- Learn basic triangle relationships
- See clear 150% damage bonuses
- Understand strategic thinking
- Build confidence with simple system

##### **Phase 2: Sub-Triangle Introduction (Weeks 3-4)**
**Objective**: Introduce internal triangle relationships and status effects

**Land 2: Ember Reaches - Sub-Triangle Mastery**
```
Ward 1: Heat Sub-Triangle (Fire > Lava > Steam > Fire)
├── Fire Enemies: Pure flame damage, burn status
├── Lava Enemies: Armor penetration, melt status
├── Steam Enemies: Area denial, scorch status
└── Tutorial: "Within Heat, Fire beats Lava, Lava beats Steam, Steam beats Fire"

Ward 2: Cold Sub-Triangle (Ice > Frost > Mist > Ice)
├── Ice Enemies: Freezing damage, freeze status
├── Frost Enemies: Slowing effects, chill status
├── Mist Enemies: Concealment, blind status
└── Tutorial: "Within Cold, Ice beats Frost, Frost beats Mist, Mist beats Ice"

Ward 3: Energy Sub-Triangle (Lightning > Plasma > Void > Lightning)
├── Lightning Enemies: Electrical damage, stun status
├── Plasma Enemies: Explosive damage, overheat status
├── Void Enemies: Dark energy, corrupt status
└── Tutorial: "Within Energy, Lightning beats Plasma, Plasma beats Void, Void beats Lightning"
```

**Player Experience:**
- Master internal triangle relationships
- Learn status effects and tactical advantages
- Develop specialized strategies
- Understand cross-triangle rules

##### **Phase 3: Advanced Combinations (Week 5+)**
**Objective**: Master complex elemental interactions and combinations

**Land 3: Mistral Peaks - Advanced Tactics**
```
Ward 1: Mixed Elemental Encounters
├── Heat + Cold combinations
├── Energy + Heat combinations
├── Cold + Energy combinations
└── Tutorial: "Combine elements for maximum effectiveness"

Ward 2: Dynamic Elemental Phases
├── Enemies that change elemental affinity
├── Bosses with multiple elemental phases
├── Environmental elemental interactions
└── Tutorial: "Adapt to changing elemental threats"

Ward 3: Master Elemental Challenges
├── All 9 elements in single encounters
├── Complex status effect combinations
├── Advanced tactical decision-making
└── Tutorial: "Master the complete elemental system"
```

**Player Experience:**
- Handle complex elemental combinations
- Master status effect synergies
- Develop advanced tactical strategies
- Achieve elemental system mastery

##### **Visual Design Progression**
```typescript
const VISUAL_DESIGN_PROGRESSION = {
  phase1: {
    heat: 'Bright Red',
    cold: 'Bright Blue', 
    energy: 'Bright Yellow',
    indicators: 'Simple color coding'
  },
  phase2: {
    fire: 'Bright Red',
    lava: 'Orange-Red',
    steam: 'Light Red',
    ice: 'Bright Blue',
    frost: 'Light Blue',
    mist: 'Pale Blue',
    lightning: 'Bright Yellow',
    plasma: 'Orange-Yellow',
    void: 'Dark Purple',
    indicators: 'Subtle variations within colors'
  },
  phase3: {
    combinations: 'Complex visual effects',
    status: 'Particle effects and animations',
    interactions: 'Dynamic visual feedback',
    indicators: 'Advanced visual communication'
  }
};
```

##### **Tutorial Integration Strategy**
```typescript
const TUTORIAL_PROGRESSION = {
  phase1: {
    tooltips: 'Heat beats Cold, Cold beats Energy, Energy beats Heat',
    indicators: 'Clear damage bonus notifications',
    feedback: 'Visual and audio confirmation of effectiveness'
  },
  phase2: {
    tooltips: 'Internal triangle relationships and status effects',
    indicators: 'Status effect duration and effects',
    feedback: 'Tactical advantage explanations'
  },
  phase3: {
    tooltips: 'Advanced combinations and synergies',
    indicators: 'Complex interaction explanations',
    feedback: 'Mastery achievement recognition'
  }
};
```

### Breath Weapon Mechanics

```typescript

export interface BreathWeapon {
  baseDamage: number;
  damageType: 'fire' | 'lava' | 'steam' | 'ice' | 'frost' | 'mist' | 'lightning' | 'plasma' | 'void';
  range: number;
  coneWidth: number;
  duration: number;
  tickRate: number; // damage per second
  criticalChance: number;
  criticalMultiplier: number;
}

export interface DragonCombat {
  health: number;
  maxHealth: number;
  breathWeapon: BreathWeapon;
  abilities: Ability[];
  position: Vector2;
  facing: number; // radians
}

```text

### Auto-Attack System

- **Targeting**: Nearest enemy within range

- **Damage Calculation**: Base damage + enchant bonuses + tier multipliers

- **Critical Hits**: Random crits with damage multipliers

- **Hit Detection**: Projectile collision with enemy hitboxes

### Manual Abilities Integration

- **Power Budget**: 20% ±10% of total damage contribution

- **Cooldown Management**: Strategic timing for maximum impact

- **Resource Costs**: Power Points (PP) or cooldown-based

- **Synergy Effects**: Abilities that enhance auto-attack

## Enemy AI Framework

### State Machine Architecture

```typescript

export interface EnemyAI {
  state: 'APPROACH' | 'STOP*AT*RANGE' | 'ATTACK' | 'REPOSITION' | 'DEAD';
  targetArc: 'SHORT' | 'MID' | 'LONG';
  stopDistance: number;
  attackCooldown: number;
  repositionCooldown: number;
}

export interface EnemyBehavior {
  approachSpeed: number;
  stopAtRange: boolean;
  attackPattern: AttackPattern;
  repositionBehavior: RepositionBehavior;
  specialAbilities: SpecialAbility[];
}

```text

### Common AI Patterns

#### **Stop-at-Range FSM**

```typescript

tick() {
  switch(state) {
    case APPROACH:
      moveToward(player, speed);
      if (distToPlayer() <= targetArc) state = STOP*AT*RANGE;
      break;
    case STOP*AT*RANGE:
      face(player);
      if (canAttack() && hasLoS()) state = ATTACK;
      else if (shouldReposition()) state = REPOSITION;
      break;
    case ATTACK:
      executeAttack();
      setCooldown("attack", attackCooldown);
      state = REPOSITION;
      break;
    case REPOSITION:
      executeReposition();
      if (repositionComplete()) state = STOP*AT*RANGE;
      break;
  }
}

```javascript

#### **Formation Behaviors**

- **Swarm Formation**: Multiple units coordinate movement

- **Phalanx Formation**: Shielded units protect ranged units

- **Skirmish Formation**: Units maintain optimal spacing

- **Boss Escort**: Minions protect and buff boss units

## Enemy Archetypes & Families

### Core Enemy Types

#### **Swarm Units**

- **Role**: Overwhelm through numbers

- **Characteristics**: Low HP, high count, fast movement

- **Counterplay**: AoE abilities, area denial

- **Examples**: Goblin Scouts, Rat Swarms

#### **Ranged Units**

- **Role**: Pressure from distance

- **Characteristics**: Projectile attacks, kiting behavior

- **Counterplay**: Close distance, interrupt attacks

- **Examples**: Archer Goblins, Mage Apprentices

#### **Shielded Units**

- **Role**: Damage absorption and protection

- **Characteristics**: High HP, damage reduction, taunt abilities

- **Counterplay**: Ignore shields, flank attacks

- **Examples**: Orc Warriors, Shield Bearers

#### **Spectral Units**

- **Role**: Phase mechanics and disruption

- **Characteristics**: Intangible phases, teleportation

- **Counterplay**: Phase prediction, timing attacks

- **Examples**: Wraiths, Shadow Phantoms

#### **Chitin Units**

- **Role**: Armor-based defense

- **Characteristics**: Armor breakpoints, resistance layers

- **Counterplay**: Armor penetration, sustained damage

- **Examples**: Beetle Guards, Chitin Warriors

### Enemy Scaling System

#### **HP Scaling Formula**

```typescript

export function enemyHP(base: number, ward: number, distM: number, bump = 1.18) {
  const wardMultiplier = Math.pow(bump, ward - 1);
  const microRampMultiplier = microRamp(distM, 10, 0.01);
  return Math.floor(base * wardMultiplier * microRampMultiplier);
}

```javascript

#### **Damage Scaling Formula**

```typescript

export function enemyDamage(base: number, ward: number, distM: number, bump = 1.15) {
  const wardMultiplier = Math.pow(bump, ward - 1);
  const distanceMultiplier = 1 + (distM / 1000) * 0.05;
  return Math.floor(base * wardMultiplier * distanceMultiplier);
}

```javascript

#### **Elite & Boss Multipliers**

- **Elite Units**: ×3.2 HP, ×2.0 DMG, special abilities

- **Boss Units**: ×40 HP, ×5.0 DMG, unique mechanics

- **Mini-Bosses**: ×15 HP, ×3.0 DMG, simplified mechanics

## Elemental Counterplay System

### Element Interactions

```typescript

export interface ElementalInteraction {
  attacker: Element;
  defender: Element;
  damageMultiplier: number;
  specialEffect?: SpecialEffect;
}

export const ELEMENTAL_MATRIX = {
  fire: {
    ice: { multiplier: 1.5, effect: 'melt' },
    lightning: { multiplier: 1.2, effect: 'overcharge' },
    poison: { multiplier: 0.8, effect: 'neutralize' },
    fire: { multiplier: 1.0, effect: 'resistance' }
  },
  ice: {
    fire: { multiplier: 0.7, effect: 'freeze_resist' },
    lightning: { multiplier: 1.3, effect: 'conduct' },
    poison: { multiplier: 1.1, effect: 'slow_metabolism' },
    ice: { multiplier: 1.0, effect: 'immunity' }
  },
  lightning: {
    fire: { multiplier: 1.1, effect: 'chain' },
    ice: { multiplier: 0.9, effect: 'ground' },
    poison: { multiplier: 1.4, effect: 'electrolyze' },
    lightning: { multiplier: 1.0, effect: 'resistance' }
  },
  poison: {
    fire: { multiplier: 0.6, effect: 'burn_away' },
    ice: { multiplier: 1.2, effect: 'preserve' },
    lightning: { multiplier: 0.8, effect: 'purify' },
    poison: { multiplier: 1.0, effect: 'immunity' }
  }
};

```javascript

### Lane Object Interactions

- **Destructible Objects**: Banners, totems, kites that buff enemies

- **Elemental Weaknesses**: Objects vulnerable to specific elements

- **Strategic Value**: Destroying objects provides Arcana bonuses

- **Counterplay Depth**: Multiple ways to interact with each object

## Boss Design Framework

### Boss Encounter Structure

```typescript

export interface BossEncounter {
  id: string;
  name: string;
  phases: BossPhase[];
  healthThresholds: number[]; // [0.75, 0.5, 0.25] for 4 phases
  mechanics: BossMechanic[];
  rewards: BossRewards;
}

export interface BossPhase {
  name: string;
  duration: number; // seconds, or until health threshold
  mechanics: BossMechanic[];
  spawnPattern: SpawnPattern;
  environmentalEffects: EnvironmentalEffect[];
}

```text

### Boss Mechanics Categories

#### **Telegraph Mechanics**

- **Wind-up Indicators**: Clear visual/audio cues before attacks

- **Safe Zones**: Areas that avoid damage

- **Danger Zones**: Areas to avoid

- **Timing Windows**: "Use ability now" moments

#### **Phase Transition Mechanics**

- **Health Gates**: Boss changes behavior at HP thresholds

- **Time Gates**: Boss changes behavior after time intervals

- **Mechanic Gates**: Boss changes behavior after mechanic completion

- **Environmental Changes**: Arena modifications between phases

#### **Add Management**

- **Minion Spawns**: Boss summons additional enemies

- **Priority Targets**: Which enemies to kill first

- **Crowd Control**: Managing multiple threats

- **Resource Management**: Balancing boss damage vs add clearing

### Example Boss: Khagan of the Sirocco

**Complete specification available in Region R01 documentation**

#### Phase Breakdown:

1. **Bannerline Phase**: Plants three Sirocco Standards, overlapping crosswinds

1. **Stampede Call Phase**: Summons Dust-Mane waves, gains damage reduction

1. **Bola Tempest Phase**: Rotating bolas create moving "no-fly" arcs

#### Elemental Interactions:

- **Lightning**: Overcharges standards (stun), interrupts totem pulses

- **Fire**: Burns banners faster, enables burn-through on sails

- **Ice**: Slows wind drift, creates safe pockets during storms

## Performance Optimization

### Object Pooling System

```typescript

export interface ObjectPool<T> {
  active: T[];
  inactive: T[];
  create(): T;
  acquire(): T;
  release(obj: T): void;
  cleanup(): void;
}

// Pool types for combat
export const COMBAT_POOLS = {
  enemies: new ObjectPool<Enemy>(),
  projectiles: new ObjectPool<Projectile>(),
  effects: new ObjectPool<Effect>(),
  damageNumbers: new ObjectPool<DamageNumber>()
};

```javascript

### Culling & LOD Systems

- **Offscreen Culling**: Don't update enemies outside viewport

- **Distance LOD**: Reduced update rate for distant enemies

- **Effect LOD**: Simplified effects for distant objects

- **Audio LOD**: Reduced audio complexity for distant sources

### Performance Budgets

- **Enemy Limit**: ≤200 active enemies (burst to 400)

- **Projectile Limit**: ≤600 projectiles per second

- **Effect Limit**: ≤100 active effects

- **Audio Limit**: ≤32 concurrent audio sources

## Combat Telemetry & Analytics

### Performance Metrics

```typescript

export interface CombatMetrics {
  // Performance
  fps: number;
  frameTime: number;
  enemyCount: number;
  projectileCount: number;

  // Combat Stats
  damageDealt: number;
  damageTaken: number;
  kills: number;
  deaths: number;
  abilityUsage: Record<string, number>;

  // Progression
  distanceReached: number;
  timeToKill: Record<string, number>;
  survivalTime: number;
}

```text

### Balance Analytics

- **TTK Tracking**: Time-to-kill for different enemy types

- **Damage Distribution**: Auto vs manual damage ratios

- **Ability Usage**: Most/least used abilities

- **Death Analysis**: Common causes of player death

- **Progression Bottlenecks**: Where players struggle most

## Acceptance Criteria

- [ ] Combat system supports 60fps desktop, ≥40fps mobile

- [ ] Enemy AI behaviors feel responsive and intelligent

- [ ] Elemental counterplay provides tactical depth

- [ ] Boss encounters have clear telegraph windows

- [ ] Manual abilities contribute 20% ±10% of damage

- [ ] Performance budgets maintained under load

- [ ] Object pooling prevents memory leaks

- [ ] Telemetry captures key combat metrics

- [ ] Enemy scaling feels fair and progressive

- [ ] Lane object interactions add strategic value
````
