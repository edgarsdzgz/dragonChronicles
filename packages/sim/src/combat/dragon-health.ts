/**
 * Dragon Health System Implementation for Draconia Chronicles
 * Handles health, death/respawn, pushback mechanics, and elemental integration
 */

import type { 
  DragonHealth, 
  HealthConfig, 
  PushbackResult,
  ElementalResistance,
  StatusEffect
} from './types.js';
import { ElementalSystem } from './elemental-system.js';

// ============================================================================
// PUSHBACK CONFIGURATION
// ============================================================================

const PUSHBACK_PERCENTAGES: Record<string, number> = {
  // Land 1: Horizon Steppe (Tutorial → Advanced)
  '1-1': 0.03,  // Sunwake Downs: 3% (gentle tutorial)
  '1-2': 0.05,  // Waystone Mile: 5% (basic progression)
  '1-3': 0.07,  // Skylark Flats: 7% (air combat intro)
  '1-4': 0.10,  // Longgrass Reach: 10% (accuracy challenges)
  '1-5': 0.12,  // Bluewind Shelf: 12% (crosswind mechanics)
  
  // Land 2: Ember Reaches (Difficulty spike → Advanced)
  '2-1': 0.03,  // New land tutorial: 3% (ease into difficulty spike)
  '2-2': 0.06,  // Fire progression: 6% (learning fire mechanics)
  '2-3': 0.09,  // Heat challenges: 9% (fire resistance)
  '2-4': 0.12,  // Lava flows: 12% (advanced fire combat)
  '2-5': 0.15,  // Ember peaks: 15% (master fire mechanics)
  
  // Land 3: Mistral Peaks (Difficulty spike → Advanced)
  '3-1': 0.03,  // New land tutorial: 3% (ease into wind/ice)
  '3-2': 0.07,  // Wind currents: 7% (learning wind mechanics)
  '3-3': 0.11,  // Ice challenges: 11% (ice resistance)
  '3-4': 0.14,  // Storm peaks: 14% (advanced wind/ice)
  '3-5': 0.15,  // Summit: 15% (master wind/ice mechanics)
  
  // Land 4+: Additional Lands (Same pattern)
  '4-1': 0.03,  // New land tutorial: 3% (ease into new mechanics)
  '4-2': 0.08,  // Mid-progression: 8% (learning new systems)
  '4-3': 0.12,  // Advanced: 12% (mastering new mechanics)
  '4-4': 0.15,  // Expert: 15% (endgame challenge)
  '4-5': 0.15,  // Master: 15% (maximum difficulty)
};

// ============================================================================
// DRAGON HEALTH IMPLEMENTATION
// ============================================================================

export class DragonHealthImpl implements DragonHealth {
  public currentHP: number;
  public maxHP: number;
  public isAlive: boolean;
  public isRecovering: boolean;
  public recoveryProgress: number;
  public pushbackDistance: number;
  public pushbackPercentage: number;

  private config: HealthConfig;
  private elementalSystem: ElementalSystem;
  private elementalResistances: ElementalResistance;
  private activeStatusEffects: StatusEffect[];
  private recoveryStartTime: number;
  private recoveryDuration: number;

  constructor(config: HealthConfig, elementalSystem: ElementalSystem) {
    this.config = config;
    this.elementalSystem = elementalSystem;
    this.maxHP = config.maxHP;
    this.currentHP = config.maxHP;
    this.isAlive = true;
    this.isRecovering = false;
    this.recoveryProgress = 0;
    this.pushbackDistance = 0;
    this.pushbackPercentage = 0;
    this.elementalResistances = {};
    this.activeStatusEffects = [];
    this.recoveryStartTime = 0;
    this.recoveryDuration = 0;
  }

  // ============================================================================
  // HEALTH MANAGEMENT
  // ============================================================================

  public takeDamage(amount: number): void {
    if (!this.isAlive || this.isRecovering) {
      return;
    }

    this.currentHP = Math.max(0, this.currentHP - amount);
    
    if (this.currentHP <= 0) {
      this.die();
    }
  }

  public heal(amount: number): void {
    if (!this.isAlive) {
      return;
    }

    this.currentHP = Math.min(this.maxHP, this.currentHP + amount);
  }

  public respawn(): void {
    this.currentHP = this.maxHP;
    this.isAlive = true;
    this.isRecovering = false;
    this.recoveryProgress = 0;
    this.pushbackDistance = 0;
    this.pushbackPercentage = 0;
    this.activeStatusEffects = [];
  }

  // ============================================================================
  // DEATH AND RECOVERY SYSTEM
  // ============================================================================

  private die(): void {
    this.isAlive = false;
    this.isRecovering = true;
    this.recoveryProgress = 0;
    this.recoveryStartTime = Date.now();
    
    // Clear all status effects on death
    this.activeStatusEffects = [];
  }

  public startRecovery(currentDistance: number, landLevel: number, wardLevel: number): void {
    if (!this.isRecovering) {
      return;
    }

    // Calculate pushback percentage based on land/ward
    this.pushbackPercentage = this.calculatePushbackPercentage(landLevel, wardLevel);
    this.pushbackDistance = Math.max(0, currentDistance * this.pushbackPercentage);
    
    // Calculate recovery time based on pushback percentage
    this.recoveryDuration = this.calculateRecoveryTime(this.pushbackPercentage);
    
    // Reset recovery progress
    this.recoveryProgress = 0;
    this.recoveryStartTime = Date.now();
  }

  public updateRecovery(deltaTime: number): void {
    if (!this.isRecovering) {
      return;
    }

    // Use deltaTime in milliseconds for consistency
    const elapsed = deltaTime / 1000; // Convert milliseconds to seconds
    this.recoveryProgress = Math.min(1.0, elapsed / this.recoveryDuration);

    // Progressive health recovery
    const targetHP = this.maxHP * this.recoveryProgress;
    this.currentHP = Math.min(this.maxHP, targetHP);

    // Check if recovery is complete
    if (this.recoveryProgress >= 1.0) {
      this.completeRecovery();
    }
  }

  private completeRecovery(): void {
    this.isRecovering = false;
    this.isAlive = true;
    this.currentHP = this.maxHP;
    this.recoveryProgress = 1.0;
  }

  public getPushbackDistance(): number {
    return this.pushbackDistance;
  }

  // ============================================================================
  // PUSHBACK CALCULATION
  // ============================================================================

  private calculatePushbackPercentage(landLevel: number, wardLevel: number): number {
    const key = `${landLevel}-${wardLevel}`;
    const percentage = PUSHBACK_PERCENTAGES[key];
    
    if (percentage !== undefined) {
      return percentage;
    }

    // Dynamic calculation for any land/ward combination
    return this.calculateDynamicPushbackPercentage(landLevel, wardLevel);
  }

  private calculateDynamicPushbackPercentage(landLevel: number, wardLevel: number): number {
    // Base percentage for new land (always 3%)
    const newLandPercentage = 0.03;
    
    // Maximum percentage for final ward (15%)
    const maxPercentage = 0.15;
    
    // If it's the first ward of a new land, use gentle pushback
    if (wardLevel === 1) {
      return newLandPercentage;
    }
    
    // Calculate progression within the land
    const wardProgression = (wardLevel - 1) / 4; // 0.0 to 1.0 across 5 wards
    const percentageRange = maxPercentage - newLandPercentage;
    const dynamicPercentage = newLandPercentage + (percentageRange * wardProgression);
    
    return Math.min(dynamicPercentage, maxPercentage);
  }

  private calculateRecoveryTime(pushbackPercentage: number): number {
    const baseTime = this.config.baseRecoveryTime;
    const maxTime = this.config.maxRecoveryTime;
    
    // Longer recovery for larger pushbacks
    const recoveryTime = baseTime + (pushbackPercentage * 100);
    return Math.min(recoveryTime, maxTime);
  }

  // ============================================================================
  // ELEMENTAL INTEGRATION
  // ============================================================================

  public takeElementalDamage(
    baseDamage: number, 
    _elementalType: string, 
    statusEffectChance: number = 0.1
  ): void {
    if (!this.isAlive || this.isRecovering) {
      return;
    }

    // Apply elemental resistance
    const resistance = this.elementalResistances[_elementalType as keyof ElementalResistance] || 0;
    const resistanceMultiplier = 1 - (resistance / 100);
    const finalDamage = baseDamage * resistanceMultiplier;

    this.takeDamage(finalDamage);

    // Roll for status effect
    if (Math.random() < statusEffectChance) {
      this.applyStatusEffect(_elementalType);
    }
  }

  private applyStatusEffect(_elementalType: string): void {
    // TODO: Implement status effect application based on elemental type
    // This would integrate with the ElementalSystem to get the appropriate status effect
  }

  public updateStatusEffects(deltaTime: number): void {
    this.activeStatusEffects = this.activeStatusEffects.filter(effect => {
      effect.duration -= deltaTime / 1000;
      return effect.duration > 0;
    });
  }

  // ============================================================================
  // LAND/WARD TRANSITION
  // ============================================================================

  public handleWardTransition(
    currentDistance: number, 
    landLevel: number, 
    wardLevel: number
  ): PushbackResult {
    const pushbackPercentage = this.calculatePushbackPercentage(landLevel, wardLevel);
    const pushbackAmount = Math.max(0, currentDistance * pushbackPercentage);
    const newDistance = Math.max(0, currentDistance - pushbackAmount);
    
    // Determine new land/ward based on distance
    const newLand = this.determineLandFromDistance(newDistance);
    const newWard = this.determineWardFromDistance(newDistance, newLand);
    const recoveryTime = this.calculateRecoveryTime(pushbackPercentage);

    return {
      newDistance,
      newLand,
      newWard,
      pushbackAmount,
      recoveryTime
    };
  }

  private determineLandFromDistance(distance: number): number {
    // Example land boundaries - should be configured based on game design
    if (distance < 2000) return 1;      // Horizon Steppe
    if (distance < 5000) return 2;       // Ember Reaches  
    if (distance < 10000) return 3;     // Mistral Peaks
    return 4; // Additional lands
  }

  private determineWardFromDistance(distance: number, land: number): number {
    if (land === 1) {
      if (distance < 500) return 1;      // Sunwake Downs (0-500m)
      if (distance < 1000) return 2;     // Waystone Mile (500-1000m)
      if (distance < 1500) return 3;     // Skylark Flats (1000-1500m)
      if (distance < 2000) return 4;     // Longgrass Reach (1500-2000m)
      return 5; // Bluewind Shelf (2000m+)
    }
    if (land === 2) {
      if (distance < 2500) return 1;     // New land tutorial
      if (distance < 3000) return 2;     // Fire progression
      if (distance < 3500) return 3;     // Heat challenges
      if (distance < 4000) return 4;     // Lava flows
      return 5; // Ember peaks
    }
    // Add other land boundaries as needed
    return 1; // Default
  }

  // ============================================================================
  // GETTERS
  // ============================================================================

  public getHealthPercentage(): number {
    return this.currentHP / this.maxHP;
  }

  public getRecoveryProgress(): number {
    return this.recoveryProgress;
  }

  public getActiveStatusEffects(): StatusEffect[] {
    return [...this.activeStatusEffects];
  }

  public getElementalResistances(): ElementalResistance {
    return { ...this.elementalResistances };
  }

  public setElementalResistance(elementalType: string, resistance: number): void {
    const clampedResistance = Math.max(0, Math.min(100, resistance));
    (this.elementalResistances as Record<string, number>)[elementalType] = clampedResistance;
  }
}

// ============================================================================
// HEALTH MANAGER
// ============================================================================

export class DragonHealthManager {
  private health: DragonHealthImpl;
  private elementalSystem: ElementalSystem;
  private landLevel: number;
  private wardLevel: number;
  private currentDistance: number;

  constructor(
    config: HealthConfig, 
    landLevel: number, 
    wardLevel: number, 
    currentDistance: number
  ) {
    this.elementalSystem = new ElementalSystem();
    this.health = new DragonHealthImpl(config, this.elementalSystem);
    this.landLevel = landLevel;
    this.wardLevel = wardLevel;
    this.currentDistance = currentDistance;
  }

  public update(deltaTime: number): void {
    this.health.updateRecovery(deltaTime);
    this.health.updateStatusEffects(deltaTime);
  }

  public takeDamage(amount: number): void {
    this.health.takeDamage(amount);
  }

  public takeElementalDamage(
    baseDamage: number, 
    _elementalType: string, 
    statusEffectChance: number = 0.1
  ): void {
    this.health.takeElementalDamage(baseDamage, _elementalType, statusEffectChance);
  }

  public heal(amount: number): void {
    this.health.heal(amount);
  }

  public isAlive(): boolean {
    return this.health.isAlive;
  }

  public isRecovering(): boolean {
    return this.health.isRecovering;
  }

  public getRecoveryProgress(): number {
    return this.health.getRecoveryProgress();
  }

  public getPushbackDistance(): number {
    return this.health.getPushbackDistance();
  }

  public getPushbackPercentage(): number {
    return this.health.pushbackPercentage;
  }

  public startRecovery(): void {
    this.health.startRecovery(this.currentDistance, this.landLevel, this.wardLevel);
  }

  public handleWardTransition(): PushbackResult {
    return this.health.handleWardTransition(this.currentDistance, this.landLevel, this.wardLevel);
  }

  public respawn(): void {
    this.health.respawn();
  }

  public getHealthPercentage(): number {
    return this.health.getHealthPercentage();
  }

  public getActiveStatusEffects(): StatusEffect[] {
    return this.health.getActiveStatusEffects();
  }

  public setElementalResistance(elementalType: string, resistance: number): void {
    this.health.setElementalResistance(elementalType, resistance);
  }

  public getElementalResistances(): ElementalResistance {
    return this.health.getElementalResistances();
  }

  public updatePosition(landLevel: number, wardLevel: number, distance: number): void {
    this.landLevel = landLevel;
    this.wardLevel = wardLevel;
    this.currentDistance = distance;
  }
}
