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

### Breath Weapon Mechanics

```typescript

export interface BreathWeapon {
  baseDamage: number;
  damageType: 'fire' | 'ice' | 'lightning' | 'poison';
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
