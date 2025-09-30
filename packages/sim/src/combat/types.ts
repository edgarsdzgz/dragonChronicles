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
  takeDamage(_amount: number): void;
  heal(_amount: number): void;
  startRecovery(_currentDistance: number, _landLevel: number, _wardLevel: number): void;
  updateRecovery(_deltaTime: number): void;
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
  | 'fire'
  | 'lava'
  | 'steam' // Heat triangle
  | 'ice'
  | 'frost'
  | 'mist' // Cold triangle
  | 'lightning'
  | 'plasma'
  | 'void'; // Energy triangle

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
  | 'burn'
  | 'melt'
  | 'scorch' // Heat effects
  | 'freeze'
  | 'chill'
  | 'blind' // Cold effects
  | 'stun'
  | 'overheat'
  | 'corrupt'; // Energy effects

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
  data: unknown;
}

// ============================================================================
// TARGETING SYSTEM TYPES
// ============================================================================

export type TargetingStrategy =
  | 'closest' // Default: Target nearest enemy
  | 'highest_threat' // Target highest threat enemy
  | 'lowest_threat' // Target lowest threat enemy (easiest to kill)
  | 'highest_hp' // Target enemy with most HP
  | 'lowest_hp' // Target enemy with least HP
  | 'highest_damage' // Target enemy dealing most damage
  | 'lowest_damage' // Target enemy dealing least damage
  | 'fastest' // Target fastest moving enemy
  | 'slowest' // Target slowest moving enemy
  | 'highest_armor' // Target enemy with most armor
  | 'lowest_armor' // Target enemy with least armor
  | 'shielded' // Target shielded enemies first
  | 'unshielded' // Target unshielded enemies first
  | 'elemental_weak' // Target enemies weak to dragon's element
  | 'elemental_strong' // Target enemies strong against dragon's element
  | 'custom'; // Custom strategy (future expansion)

export interface TargetingMetrics {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatAssessmentTime: number;
  totalUpdateTime: number;
  targetSwitchCount: number;
  averageTargetLifetime: number;
  strategyEffectiveness: Map<TargetingStrategy, number>;
}

export type TargetPersistenceMode =
  | 'keep_target' // Default: Keep current target until it dies or goes out of range
  | 'switch_freely' // Switch targets based on strategy changes
  | 'switch_aggressive' // Switch targets frequently for optimal strategy
  | 'manual_only'; // Only switch targets when player manually changes strategy

export interface TargetingConfig {
  primaryStrategy: TargetingStrategy;
  fallbackStrategy: TargetingStrategy;
  range: number;
  updateInterval: number; // How often to recalculate target (ms)
  switchThreshold: number; // Minimum difference to switch targets (0-1)
  enabledStrategies: TargetingStrategy[]; // Player-unlocked strategies
  persistenceMode: TargetPersistenceMode; // How to handle target switching
  targetLockDuration: number; // How long to keep target locked (ms)
  threatWeights: {
    proximity: number;
    health: number;
    damage: number;
    speed: number;
  };
  customSettings: Record<string, any>;
}

export interface TargetingState {
  currentTarget: Enemy | null;
  lastTarget: Enemy | null;
  targetHistory: Enemy[];
  lastUpdateTime: number;
  strategy: TargetingStrategy;
  isTargetLocked: boolean; // Prevent target switching temporarily
  targetLockStartTime: number; // When target was locked
  targetSwitchCount: number; // How many times target has switched
  lastStrategyChange: number; // When strategy was last changed
}

export interface TargetingSystem {
  config: TargetingConfig;
  state: TargetingState;
  findTarget(_enemies: Enemy[]): Enemy | null;
  updateTarget(_enemies: Enemy[]): void;
  switchStrategy(_strategy: TargetingStrategy): void;
  lockTarget(_enemy: Enemy): void;
  unlockTarget(): void;
  isInRange(_enemy: Enemy): boolean;
  calculateThreatLevel(_enemy: Enemy): number;
  shouldSwitchTarget(_enemies: Enemy[]): boolean;
  canSwitchTarget(): boolean;
  setPersistenceMode(_mode: TargetPersistenceMode): void;
}

export interface Enemy {
  id: string;
  position: { x: number; y: number };
  health: { current: number; max: number };
  damage: number;
  speed: number;
  armor: number;
  shield: number;
  elementalType?: ElementalType;
  elementalResistance?: ElementalResistance;
  isAlive: boolean;
  threatLevel: number;
  distance: number;
  type: string;
}

export interface Dragon {
  position: { x: number; y: number };
  attackRange: number;
  elementalType: ElementalType;
  targetingConfig: TargetingConfig;
}

export interface ThreatFactor {
  type: 'proximity' | 'health' | 'damage' | 'speed' | 'armor' | 'shield' | 'elemental';
  weight: number; // 0-1, how much this factor influences targeting
  value: number; // Calculated value for this enemy
  normalizedValue: number; // 0-1 normalized value
}

export interface ThreatAssessment {
  enemy: Enemy;
  totalThreat: number;
  factors: ThreatFactor[];
  strategy: TargetingStrategy;
}

export interface RangeDetection {
  getTargetsInRange(_enemies: Enemy[], _dragon: Dragon): Enemy[];
  calculateDistance(_dragon: Dragon, _enemy: Enemy): number;
  isWithinRange(_dragon: Dragon, _enemy: Enemy): boolean;
  getOptimalRange(_dragon: Dragon): number;
}

export interface TargetingStrategyHandler {
  strategy: TargetingStrategy;
  calculate(_enemies: Enemy[], _dragon: Dragon): Enemy | null | Promise<Enemy | null>;
  getDescription(): string;
  isUnlocked(): boolean;
}

export interface TargetPersistenceHandler {
  mode: TargetPersistenceMode;
  shouldSwitchTarget(
    _currentTarget: Enemy | null,
    _newTarget: Enemy | null,
    _state: TargetingState,
    _config: TargetingConfig,
  ): boolean;
  getDescription(): string;
  isUnlocked: boolean;
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

export interface TargetingMetrics {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatCalculationTime: number;
  totalUpdateTime: number;
  targetsEvaluated: number;
  targetSwitches: number;
  strategyChanges: number;
  performanceScore: number;
}

export interface ThreatWeights {
  proximity: number;
  health: number;
  damage: number;
  speed: number;
}

export interface PlayerTargetingPreferences {
  preferredStrategies: TargetingStrategy[];
  preferredPersistenceMode: TargetPersistenceMode;
  customWeights: Partial<ThreatWeights>;
  autoSwitchEnabled: boolean;
  manualOverrideEnabled: boolean;
}
