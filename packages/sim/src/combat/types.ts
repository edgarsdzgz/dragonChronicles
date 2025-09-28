/**
 * Combat system type definitions for Draconia Chronicles
 * Includes health, damage, elemental system, and status effects
 */

// ============================================================================
// CORE HEALTH TYPES
// ============================================================================

export interface DragonHealth {
  currentHP: number;
  maxHP: number;
  isAlive: boolean;
  isRecovering: boolean;
  recoveryProgress: number; // 0.0 to 1.0
  pushbackDistance: number;
  pushbackPercentage: number; // Percentage of current distance to push back
  takeDamage(amount: number): void;
  heal(amount: number): void;
  startRecovery(currentDistance: number, landLevel: number, wardLevel: number): void;
  updateRecovery(deltaTime: number): void;
  getPushbackDistance(): number;
  respawn(): void;
}

export interface HealthConfig {
  maxHP: number;
  baseRecoveryTime: number; // Base recovery time in seconds
  maxRecoveryTime: number; // Maximum recovery time in seconds
  pushbackConfig: PushbackConfig;
}

export interface PushbackConfig {
  basePercentage: number; // 3% for new lands
  maxPercentage: number; // 15% for final wards
  landDifficultySpikes: boolean; // Enable land difficulty spikes
}

// ============================================================================
// ELEMENTAL SYSTEM TYPES
// ============================================================================

export type ElementalType = 
  | 'fire' | 'lava' | 'steam'    // Heat triangle
  | 'ice' | 'frost' | 'mist'     // Cold triangle  
  | 'lightning' | 'plasma' | 'void'; // Energy triangle

export type ElementalCategory = 'heat' | 'cold' | 'energy';

export interface ElementalDamage {
  baseDamage: number;
  elementalType: ElementalType;
  elementalCategory: ElementalCategory;
  statusEffect?: StatusEffect;
}

export interface ElementalResistance {
  fire?: number;
  lava?: number;
  steam?: number;
  ice?: number;
  frost?: number;
  mist?: number;
  lightning?: number;
  plasma?: number;
  void?: number;
}

export interface ElementalEffectiveness {
  attacker: ElementalType;
  defender: ElementalType;
  multiplier: number; // 0.75 (weak), 1.0 (neutral), 1.5 (strong)
}

// ============================================================================
// STATUS EFFECTS
// ============================================================================

export interface StatusEffect {
  type: StatusEffectType;
  duration: number; // Duration in seconds
  intensity: number; // Effect intensity (0-1)
  damage?: number; // Damage per second
  debuff?: StatusDebuff;
}

export type StatusEffectType = 
  | 'burn' | 'melt' | 'scorch'     // Heat effects
  | 'freeze' | 'chill' | 'blind'   // Cold effects
  | 'stun' | 'overheat' | 'corrupt'; // Energy effects

export interface StatusDebuff {
  armorReduction?: number; // Percentage armor reduction
  speedReduction?: number; // Percentage speed reduction
  accuracyReduction?: number; // Percentage accuracy reduction
  damageIncrease?: number; // Percentage damage increase
  healingPrevention?: boolean; // Prevent healing
  actionPrevention?: boolean; // Prevent actions
}

// ============================================================================
// DAMAGE CALCULATION
// ============================================================================

export interface DamageCalculation {
  baseDamage: number;
  elementalMultiplier: number;
  resistanceReduction: number;
  statusEffectBonus: number;
  finalDamage: number;
  statusEffectApplied?: StatusEffect | undefined;
}

export interface DamageSource {
  baseDamage: number;
  elementalType: ElementalType;
  statusEffectChance: number; // 0-1
  criticalChance: number; // 0-1
  criticalMultiplier: number;
}

// ============================================================================
// ELEMENTAL SYSTEM CONFIGURATION
// ============================================================================

export interface ElementalSystemConfig {
  metaTriangle: {
    heat: ElementalCategory;
    cold: ElementalCategory;
    energy: ElementalCategory;
  };
  subTriangles: {
    heat: ElementalType[];
    cold: ElementalType[];
    energy: ElementalType[];
  };
  effectivenessMatrix: ElementalEffectiveness[];
  statusEffects: StatusEffectConfig[];
}

export interface StatusEffectConfig {
  type: StatusEffectType;
  elementalType: ElementalType;
  duration: number;
  damage: number;
  debuff: StatusDebuff;
}

// ============================================================================
// LAND/WARD INTEGRATION
// ============================================================================

export interface LandWardConfig {
  landLevel: number;
  wardLevel: number;
  elementalTheme: {
    primary: ElementalCategory;
    secondary: ElementalCategory;
    resistance: ElementalCategory;
  };
  pushbackPercentage: number;
  enemyElementalTypes: ElementalType[];
}

// ============================================================================
// COMBAT INTEGRATION
// ============================================================================

export interface CombatState {
  dragonHealth: DragonHealth;
  activeStatusEffects: StatusEffect[];
  elementalResistances: ElementalResistance;
  currentLandWard: LandWardConfig;
}

export interface CombatEvent {
  type: 'damage' | 'heal' | 'status_effect' | 'death' | 'recovery';
  timestamp: number;
  data: any;
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface LandWardPosition {
  landLevel: number;
  wardLevel: number;
  distance: number;
}

export interface PushbackResult {
  newDistance: number;
  newLand: number;
  newWard: number;
  pushbackAmount: number;
  recoveryTime: number;
}
