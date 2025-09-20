--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/06*Abilities*Skills*Rituals.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 06 — Abilities, Skills & Rituals

## Ability System Architecture

### Core Ability Framework

```typescript

export interface Ability {
  id: string;
  name: string;
  description: string;
  type: 'burst' | 'dot' | 'utility' | 'defensive' | 'movement';
  category: 'breath' | 'physical' | 'magical' | 'ritual';

  // Resource Management
  powerPoints: number; // Cost in PP
  cooldown: number; // Cooldown in seconds
  charges?: number; // Maximum charges (for charge-based abilities)

  // Targeting
  targetType: 'self' | 'enemy' | 'area' | 'direction';
  range: number;
  areaOfEffect?: AreaOfEffect;

  // Effects
  damage?: DamageEffect;
  buffs?: BuffEffect[];
  debuffs?: DebuffEffect[];
  utility?: UtilityEffect[];

  // Visual/Audio
  animation: string;
  soundEffect: string;
  visualEffect: string;
}

```bash

### Manual Contribution Target

**Design Goal**: Manual abilities should contribute **~20% ±10%** of total damage pre-Rift, with the remaining 70-80% coming from auto-combat and Journey research.

## Basic Abilities (Phase 1)

### Breath Burst

```typescript

const BREATH_BURST: Ability = {
  id: 'breath_burst',
  name: 'Breath Burst',
  description: 'Unleash a concentrated burst of dragonfire',
  type: 'burst',
  category: 'breath',

  powerPoints: 20,
  cooldown: 8,

  targetType: 'direction',
  range: 600,
  areaOfEffect: {
    type: 'cone',
    width: 45, // degrees
    length: 600
  },

  damage: {
    base: 150,
    type: 'fire',
    multiplier: 2.0 // 2x normal breath damage
  },

  animation: 'breath_burst',
  soundEffect: 'fire_burst',
  visualEffect: 'concentrated_fire'
};

```javascript

### Wing Guard

```typescript

const WING_GUARD: Ability = {
  id: 'wing_guard',
  name: 'Wing Guard',
  description: 'Raise wings to deflect incoming projectiles',
  type: 'defensive',
  category: 'physical',

  powerPoints: 15,
  cooldown: 12,
  duration: 3, // seconds

  targetType: 'self',

  buffs: [{
    type: 'damage_reduction',
    value: 0.75, // 75% damage reduction
    duration: 3
  }],

  animation: 'wing_guard',
  soundEffect: 'wing_rustle',
  visualEffect: 'wing_barrier'
};

```javascript

### Time Slip

```typescript

const TIME_SLIP: Ability = {
  id: 'time_slip',
  name: 'Time Slip',
  description: 'Temporarily slow time around yourself',
  type: 'utility',
  category: 'magical',

  powerPoints: 25,
  cooldown: 20,
  duration: 4, // seconds

  targetType: 'area',
  range: 400,
  areaOfEffect: {
    type: 'circle',
    radius: 400
  },

  debuffs: [{
    type: 'slow',
    target: 'enemies',
    value: 0.5, // 50% speed reduction
    duration: 4
  }],

  buffs: [{
    type: 'haste',
    target: 'self',
    value: 1.5, // 50% speed increase
    duration: 4
  }],

  animation: 'time_slip',
  soundEffect: 'time_distortion',
  visualEffect: 'temporal_field'
};

```text

## Power Point System

### PP Generation & Management

```typescript

export interface PowerPointSystem {
  maxPP: number;
  currentPP: number;
  regenerationRate: number; // PP per second
  regenerationDelay: number; // seconds before regen starts after use

  // Regeneration sources
  passiveRegen: number;
  combatRegen: number; // bonus regen during combat
  abilityRegen: number; // abilities that restore PP
}

```javascript

### PP Scaling with Progression

- **Base PP**: 100 points at start

- **PP Growth**: +10 per research node, +50 per tier unlock

- **Regeneration**: 5 PP/sec base, +1/sec per 20 max PP

- **Infinite PP Windows**: Temporary unlimited PP during power-ups

## Advanced Abilities (Post-Phase 1)

### Elemental Mastery Abilities

#### **Fire Mastery**

```typescript

const FLAME_WAVE: Ability = {
  id: 'flame_wave',
  name: 'Flame Wave',
  description: 'Send a wave of fire that ignites enemies',
  type: 'burst',
  category: 'breath',

  powerPoints: 30,
  cooldown: 15,

  targetType: 'direction',
  range: 800,
  areaOfEffect: {
    type: 'line',
    width: 200,
    length: 800
  },

  damage: {
    base: 200,
    type: 'fire',
    multiplier: 1.5
  },

  debuffs: [{
    type: 'burn',
    duration: 5,
    damage: 25 // per second
  }],

  animation: 'flame_wave',
  soundEffect: 'fire_explosion',
  visualEffect: 'flame_trail'
};

```javascript

#### **Ice Mastery**

```typescript

const FROST_NOVA: Ability = {
  id: 'frost_nova',
  name: 'Frost Nova',
  description: 'Create an expanding ring of ice that freezes enemies',
  type: 'burst',
  category: 'magical',

  powerPoints: 35,
  cooldown: 18,

  targetType: 'area',
  areaOfEffect: {
    type: 'expanding_circle',
    maxRadius: 500,
    expansionSpeed: 200 // units per second
  },

  damage: {
    base: 180,
    type: 'ice',
    multiplier: 1.3
  },

  debuffs: [{
    type: 'freeze',
    duration: 3,
    effect: 'stun'
  }],

  animation: 'frost_nova',
  soundEffect: 'ice_crack',
  visualEffect: 'frost_expansion'
};

```javascript

#### **Lightning Mastery**

```typescript

const CHAIN_LIGHTNING: Ability = {
  id: 'chain_lightning',
  name: 'Chain Lightning',
  description: 'Lightning that jumps between enemies',
  type: 'burst',
  category: 'magical',

  powerPoints: 40,
  cooldown: 20,

  targetType: 'enemy',
  range: 600,

  damage: {
    base: 120,
    type: 'lightning',
    multiplier: 1.0
  },

  specialEffects: [{
    type: 'chain',
    maxTargets: 5,
    chainRange: 300,
    damageReduction: 0.2 // 20% less damage per chain
  }],

  animation: 'chain_lightning',
  soundEffect: 'lightning_crack',
  visualEffect: 'electric_chain'
};

```text

## Scrolls & Rituals System

### Scroll Discovery

```typescript

export interface Scroll {
  id: string;
  name: string;
  description: string;
  landRequirement: number; // minimum land to drop
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  dropRate: number; // percentage chance per boss kill

  // Ritual Requirements
  ritualCost: {
    scribeInk: number;
    soulPower: number;
    time: number; // seconds
  };

  // Unlocked Ability
  unlocksAbility: string; // ability ID
  abilityVariant?: string; // variant of base ability
}

```text

### Scribe Ink Economy

- **Source**: Duplicate scrolls converted to Scribe Ink

- **Conversion Rate**: 1 duplicate scroll = 1 Scribe Ink

- **Usage**: Required for ritual casting and ability unlocking

- **Storage**: Persistent currency, doesn't reset on Return

### Ritual Casting System

```typescript

export interface Ritual {
  id: string;
  name: string;
  description: string;
  requirements: {
    scroll: string;
    scribeInk: number;
    soulPower: number;
    time: number;
  };

  // Ritual Process
  castingTime: number; // seconds
  interruptionPenalty: number; // resource loss if interrupted

  // Results
  unlocksAbility: string;
  permanentBonus?: PermanentBonus;
  cosmeticUnlock?: string;
}

```javascript

### Pity System for Scrolls

```typescript

export interface ScrollPity {
  landId: number;
  attempts: number;
  pityThreshold: number; // guaranteed drop after X attempts
  pityMultiplier: number; // increased drop rate as pity builds
}

```javascript

## Ability Variants & Customization

### Variant System

Each base ability can have multiple variants unlocked through different scrolls:

#### **Breath Burst Variants**

- **Focused Burst**: Narrower cone, higher damage

- **Wide Burst**: Wider cone, lower damage

- **Penetrating Burst**: Pierces through enemies

- **Explosive Burst**: Creates secondary explosions

#### **Wing Guard Variants**

- **Reflective Guard**: Reflects projectiles back at enemies

- **Absorptive Guard**: Absorbs damage as healing

- **Temporal Guard**: Slows time while active

- **Elemental Guard**: Provides elemental resistance

### Ability Customization

```typescript

export interface AbilityCustomization {
  abilityId: string;
  variants: AbilityVariant[];
  selectedVariant: string;

  // Modifiers from research
  researchModifiers: AbilityModifier[];

  // Rune enhancements
  runeSlots: RuneSlot[];
  equippedRunes: Rune[];
}

```text

## Skill Trees (Post-MVP)

### Conceptual Framework

Future expansion will include skill trees for different dragon specializations:

#### **Smithing Tree**

- **Weapon Crafting**: Create custom breath weapon modifications

- **Armor Crafting**: Enhance scales and defensive abilities

- **Tool Crafting**: Utility items for exploration and combat

#### **Mining Tree**

- **Resource Extraction**: Gather materials from defeated enemies

- **Gem Cutting**: Process raw materials into useful components

- **Metallurgy**: Combine materials for enhanced effects

### Skill Tree Integration

- **Unlock Gates**: Skills unlock through story progression

- **Resource Requirements**: Materials and time to learn skills

- **Cross-Skill Synergies**: Combinations between different trees

- **Mastery Bonuses**: Special abilities for max-level skills

## Balance & Tuning

### Damage Contribution Targets

```typescript

export interface DamageContribution {
  autoCombat: number; // 70-80% (Journey research + base breath)
  manualAbilities: number; // 20% ±10%
  metaProgression: number; // 0-10% (City bonuses)

  // Elemental Distribution
  fireDamage: number;
  iceDamage: number;
  lightningDamage: number;
  poisonDamage: number;
}

```javascript

### Cooldown & Resource Balance

- **High Impact**: Long cooldowns, high PP costs

- **Low Impact**: Short cooldowns, low PP costs

- **Utility Focus**: Abilities that enhance rather than replace auto-combat

- **Strategic Depth**: Multiple viable ability combinations

### Progression Integration

- **Early Game**: Basic abilities available immediately

- **Mid Game**: Elemental variants unlock through research

- **Late Game**: Advanced combinations and customizations

- **End Game**: Mastery abilities and unique combinations

## UI/UX Integration

### Ability Bar Design

```typescript

export interface AbilityBar {
  slots: AbilitySlot[];
  maxSlots: number;
  unlockedSlots: number;

  // Visual States
  cooldownIndicators: boolean;
  resourceIndicators: boolean;
  tooltipDelay: number;
}

```javascript

### Mobile Controls

- **Touch Targets**: 44×44 minimum for ability buttons

- **Gesture Support**: Swipe gestures for ability selection

- **Haptic Feedback**: Tactile response for ability activation

- **Accessibility**: Voice control and switch support

### Desktop Controls

- **Hotkeys**: Customizable key bindings for abilities

- **Mouse Targeting**: Right-click for targeted abilities

- **Quick Cast**: Instant ability activation without confirmation

- **Modifier Keys**: Shift/Ctrl combinations for ability variants

## Acceptance Criteria

- [ ] Manual abilities contribute 20% ±10% of total damage

- [ ] Power Point system provides strategic resource management

- [ ] Scroll discovery system feels rewarding and fair

- [ ] Ritual casting provides meaningful progression choices

- [ ] Ability variants offer customization without complexity

- [ ] Cooldown and resource costs feel balanced

- [ ] UI/UX supports both mobile and desktop play

- [ ] Pity system prevents frustration with rare scrolls

- [ ] Ability combinations provide tactical depth

- [ ] Performance impact of abilities stays within budgets
