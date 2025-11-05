/**
 * Manual Ability System for Draconia Chronicles
 * 
 * Implements player-activated abilities with Power Points, cooldowns, and manual targeting.
 * Provides 20% ±10% of total damage contribution through strategic player input.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
  ElementalType,
  Vector2,
} from './types.js';
import { createDefaultArcanaDropManager } from '../economy/arcana-drop-manager.js';
import { createDefaultSoulPowerDropManager } from '../economy/soul-power-drop-manager.js';

export interface ManualAbilityConfig {
  enableManualAbilities: boolean;
  powerPointRegenerationRate: number; // Points per second
  powerPointRegenerationDelay: number; // Delay after using ability (ms)
  maxPowerPoints: number;
  enableCooldowns: boolean;
  enableCharges: boolean;
  enableManualTargeting: boolean;
  manualTargetLockDuration: number; // How long manual target stays locked (ms)
  enableAbilityEffects: boolean;
  enablePerformanceOptimization: boolean;
  performanceThreshold: number;
}

export interface ManualAbilityState {
  isActive: boolean;
  isPaused: boolean;
  currentPowerPoints: number;
  maxPowerPoints: number;
  lastRegenerationTime: number;
  regenerationDelayEndTime: number;
  manualTarget: Enemy | null;
  manualTargetLockEndTime: number;
  activeAbilities: Map<string, ActiveAbility>;
  performanceMetrics: {
    abilitiesUsedPerSecond: number;
    averagePowerPointUsage: number;
    manualTargetingAccuracy: number;
    abilityEffectiveness: number;
    performanceScore: number;
  };
  combatEvents: CombatEvent[];
  combatState: CombatState;
}

export interface ActiveAbility {
  id: string;
  name: string;
  type: 'offensive' | 'defensive' | 'utility' | 'elemental';
  category: 'breath' | 'claw' | 'wing' | 'elemental' | 'special';
  cooldown: number;
  lastUsed: number;
  charges: number;
  maxCharges: number;
  powerPointCost: number;
  range: number;
  effects: Map<string, unknown>;
  isChanneling: boolean;
  channelingStartTime: number;
  channelingDuration: number;
}

export interface ManualAbilityMetrics {
  totalAbilitiesUsed: number;
  totalPowerPointsSpent: number;
  totalDamageDealt: number;
  totalHealingDone: number;
  totalBuffsApplied: number;
  totalDebuffsApplied: number;
  totalUtilityEffects: number;
  averageAbilityCooldown: number;
  averagePowerPointEfficiency: number;
  averageDamagePerAbility: number;
  averageHealingPerAbility: number;
  averageBuffDuration: number;
  averageDebuffDuration: number;
  averageUtilityEffectiveness: number;
  performanceOptimizations: number;
}

export class ManualAbilitySystem {
  private config: ManualAbilityConfig;
  private state: ManualAbilityState;
  private metrics: ManualAbilityMetrics;
  private dragon: Dragon;
  private arcanaDropManager: ReturnType<typeof createDefaultArcanaDropManager>;
  private soulPowerDropManager: ReturnType<typeof createDefaultSoulPowerDropManager>;

  constructor(config: Partial<ManualAbilityConfig>, dragon: Dragon) {
    this.config = {
      enableManualAbilities: true,
      powerPointRegenerationRate: 2.0, // 2 points per second
      powerPointRegenerationDelay: 2000, // 2 second delay
      maxPowerPoints: 100,
      enableCooldowns: true,
      enableCharges: true,
      enableManualTargeting: true,
      manualTargetLockDuration: 3000, // 3 seconds
      enableAbilityEffects: true,
      enablePerformanceOptimization: true,
      performanceThreshold: 100,
      ...config,
    };

    this.dragon = dragon;
    this.arcanaDropManager = createDefaultArcanaDropManager();
    this.soulPowerDropManager = createDefaultSoulPowerDropManager();

    this.state = this.createInitialState();
    this.metrics = this.createInitialMetrics();
    this.initializeDefaultAbilities();
  }

  public start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.currentPowerPoints = this.config.maxPowerPoints;
    this.state.lastRegenerationTime = Date.now();
    this.emitCombatEvent('manual_abilities_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.manualTarget = null;
    this.state.activeAbilities.clear();
    this.emitCombatEvent('manual_abilities_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitCombatEvent('manual_abilities_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitCombatEvent('manual_abilities_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.state.combatState = combatState;
    this.updatePowerPointRegeneration(deltaTime);
    this.updateAbilityCooldowns(deltaTime);
    this.updateChannelingAbilities(deltaTime);
    this.updateManualTargeting(activeEnemies);
    this.updatePerformanceMetrics(deltaTime);
    this.cleanupEvents();
  }

  public useManualAbility(abilityId: string, target?: Enemy): boolean {
    if (!this.config.enableManualAbilities) {
      return false;
    }

    const ability = this.state.activeAbilities.get(abilityId);
    if (!ability) {
      return false;
    }

    // Check if ability is available
    if (!this.canUseAbility(ability)) {
      return false;
    }

    // Check power point cost
    if (this.state.currentPowerPoints < ability.powerPointCost) {
      return false;
    }

    // Use the ability
    this.executeAbility(ability, target);
    return true;
  }

  public setManualTarget(target: Enemy | null): void {
    if (!this.config.enableManualTargeting) {
      return;
    }

    this.state.manualTarget = target;
    if (target) {
      this.state.manualTargetLockEndTime = Date.now() + this.config.manualTargetLockDuration;
    }
  }

  public getAvailableAbilities(): ActiveAbility[] {
    return Array.from(this.state.activeAbilities.values()).filter(ability => 
      this.canUseAbility(ability)
    );
  }

  public getPowerPointStatus(): { current: number; max: number; regenerationRate: number } {
    return {
      current: this.state.currentPowerPoints,
      max: this.state.maxPowerPoints,
      regenerationRate: this.config.powerPointRegenerationRate,
    };
  }

  private updatePowerPointRegeneration(_deltaTime: number): void {
    const currentTime = Date.now();
    
    // Check if we're in regeneration delay
    if (currentTime < this.state.regenerationDelayEndTime) {
      return;
    }

    // Check if we need to regenerate
    if (this.state.currentPowerPoints < this.state.maxPowerPoints) {
      const timeSinceLastRegeneration = currentTime - this.state.lastRegenerationTime;
      const pointsToRegenerate = (timeSinceLastRegeneration / 1000) * this.config.powerPointRegenerationRate;
      
      this.state.currentPowerPoints = Math.min(
        this.state.maxPowerPoints,
        this.state.currentPowerPoints + pointsToRegenerate
      );
      this.state.lastRegenerationTime = currentTime;
    }
  }

  private updateAbilityCooldowns(_deltaTime: number): void {
    if (!this.config.enableCooldowns) {
      return;
    }

    for (const ability of this.state.activeAbilities.values()) {
      const timeSinceLastUsed = Date.now() - ability.lastUsed;
      if (timeSinceLastUsed >= ability.cooldown && ability.charges < ability.maxCharges) {
        ability.charges = Math.min(ability.maxCharges, ability.charges + 1);
      }
    }
  }

  private updateChannelingAbilities(_deltaTime: number): void {
    for (const ability of this.state.activeAbilities.values()) {
      if (ability.isChanneling) {
        const channelingTime = Date.now() - ability.channelingStartTime;
        if (channelingTime >= ability.channelingDuration) {
          this.completeChannelingAbility(ability);
        }
      }
    }
  }

  private updateManualTargeting(activeEnemies: Map<string, Enemy>): void {
    if (!this.config.enableManualTargeting || !this.state.manualTarget) {
      return;
    }

    // Check if manual target is still valid
    const currentTime = Date.now();
    if (currentTime >= this.state.manualTargetLockEndTime) {
      this.state.manualTarget = null;
      return;
    }

    // Check if target is still alive and in range
    const target = activeEnemies.get(this.state.manualTarget.id);
    if (!target || !target.isAlive) {
      this.state.manualTarget = null;
      return;
    }

    const distance = this.calculateDistance(this.dragon.position, target.position);
    const maxRange = Math.max(...Array.from(this.state.activeAbilities.values()).map(a => a.range));
    
    if (distance > maxRange) {
      this.state.manualTarget = null;
    }
  }

  private canUseAbility(ability: ActiveAbility): boolean {
    // Check charges
    if (this.config.enableCharges && ability.charges <= 0) {
      return false;
    }

    // Check cooldown
    if (this.config.enableCooldowns) {
      const timeSinceLastUsed = Date.now() - ability.lastUsed;
      if (timeSinceLastUsed < ability.cooldown) {
        return false;
      }
    }

    // Check power points
    if (this.state.currentPowerPoints < ability.powerPointCost) {
      return false;
    }

    // Check if already channeling
    if (ability.isChanneling) {
      return false;
    }

    return true;
  }

  private executeAbility(ability: ActiveAbility, target?: Enemy): void {
    // Spend power points
    this.state.currentPowerPoints -= ability.powerPointCost;
    this.metrics.totalPowerPointsSpent += ability.powerPointCost;

    // Start regeneration delay
    this.state.regenerationDelayEndTime = Date.now() + this.config.powerPointRegenerationDelay;

    // Update ability state
    ability.lastUsed = Date.now();
    if (this.config.enableCharges) {
      ability.charges = Math.max(0, ability.charges - 1);
    }

    // Start channeling if needed
    if (ability.channelingDuration > 0) {
      ability.isChanneling = true;
      ability.channelingStartTime = Date.now();
    }

    // Apply ability effects
    if (this.config.enableAbilityEffects) {
      this.applyAbilityEffects(ability, target);
    }

    this.metrics.totalAbilitiesUsed++;
    this.emitAbilityUsedEvent(ability, target);
  }

  private applyAbilityEffects(ability: ActiveAbility, target?: Enemy): void {
    switch (ability.type) {
      case 'offensive': {
        this.applyOffensiveEffect(ability, target);
        break;
      }
      case 'defensive': {
        this.applyDefensiveEffect(ability);
        break;
      }
      case 'utility': {
        this.applyUtilityEffect(ability, target);
        break;
      }
      case 'elemental': {
        this.applyElementalEffect(ability, target);
        break;
      }
    }
  }

  private applyOffensiveEffect(ability: ActiveAbility, target?: Enemy): void {
    if (!target) {
      return;
    }

    const damage = this.calculateAbilityDamage(ability);
    target.health.current -= damage;
    this.metrics.totalDamageDealt += damage;
    this.emitDamageDealtEvent(ability, target, damage);
  }

  private applyDefensiveEffect(ability: ActiveAbility): void {
    // Apply defensive buffs to dragon
    this.metrics.totalBuffsApplied++;
    this.emitStatusEffectAppliedEvent(ability, 'buff', this.dragon.id);
  }

  private applyUtilityEffect(ability: ActiveAbility, target?: Enemy): void {
    if (target) {
      // Apply utility effects to target
      this.metrics.totalUtilityEffects++;
      this.emitStatusEffectAppliedEvent(ability, 'utility', target.id);
    }
  }

  private applyElementalEffect(ability: ActiveAbility, target?: Enemy): void {
    if (!target) {
      return;
    }

    const elementalDamage = this.calculateElementalDamage(ability, target);
    target.health.current -= elementalDamage;
    this.metrics.totalDamageDealt += elementalDamage;
    this.emitDamageDealtEvent(ability, target, elementalDamage);
  }

  private calculateAbilityDamage(ability: ActiveAbility): number {
    const baseDamage = this.dragon.damage;
    const abilityMultiplier = this.getAbilityDamageMultiplier(ability);
    return baseDamage * abilityMultiplier;
  }

  private calculateElementalDamage(ability: ActiveAbility, target: Enemy): number {
    const baseDamage = this.calculateAbilityDamage(ability);
    const elementalMultiplier = this.getElementalMultiplier(target);
    return baseDamage * elementalMultiplier;
  }

  private getAbilityDamageMultiplier(ability: ActiveAbility): number {
    // Different abilities have different damage multipliers
    switch (ability.category) {
      case 'breath': return 2.0;
      case 'claw': return 1.5;
      case 'wing': return 1.0;
      case 'elemental': return 2.5;
      case 'special': return 3.0;
      default: return 1.0;
    }
  }

  private getElementalMultiplier(target: Enemy): number {
    const dragonElementalType = this.dragon.elementalType;
    const targetElementalType = target.elementalType;
    
    if (!targetElementalType) {
      return 1.0;
    }

    // Check for elemental advantage
    const weaknesses = this.getElementalWeaknesses(dragonElementalType);
    if (weaknesses.includes(targetElementalType)) {
      return 1.5; // 50% bonus damage
    }

    return 1.0;
  }

  private getElementalWeaknesses(elementalType: ElementalType): ElementalType[] {
    const weaknesses: Record<ElementalType, ElementalType[]> = {
      fire: ['steam'],
      lava: ['fire'],
      steam: ['lava'],
      ice: ['mist'],
      frost: ['ice'],
      mist: ['frost'],
      lightning: ['void'],
      plasma: ['lightning'],
      void: ['plasma'],
    };

    return weaknesses[elementalType] || [];
  }

  private completeChannelingAbility(ability: ActiveAbility): void {
    ability.isChanneling = false;
    ability.channelingStartTime = 0;
    this.emitCombatEvent('ability_channeling_complete', {
      abilityId: ability.id,
      abilityName: ability.name,
    });
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private updatePerformanceMetrics(_deltaTime: number): void {
    if (!this.config.enablePerformanceOptimization) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - this.state.performanceMetrics.performanceScore;

    if (timeSinceLastUpdate >= this.config.performanceThreshold) {
      this.optimizePerformance();
    }
  }

  private optimizePerformance(): void {
    // Performance optimization logic
    this.metrics.performanceOptimizations++;
  }

  private cleanupEvents(): void {
    if (this.state.combatEvents.length > 100) {
      this.state.combatEvents = this.state.combatEvents.slice(-50);
    }
  }

  private emitAbilityUsedEvent(ability: ActiveAbility, target?: Enemy): void {
    const event: CombatEvent = {
      type: 'damage',
      timestamp: Date.now(),
      source: 'manual_ability_system',
      target: target?.id || this.dragon.id,
      data: {
        abilityId: ability.id,
        abilityName: ability.name,
        abilityType: ability.type,
        abilityCategory: ability.category,
        powerPointCost: ability.powerPointCost,
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitDamageDealtEvent(ability: ActiveAbility, target: Enemy, damage: number): void {
    const event: CombatEvent = {
      type: 'damage',
      timestamp: Date.now(),
      source: 'manual_ability_system',
      target: target.id,
      data: {
        abilityId: ability.id,
        abilityName: ability.name,
        damage,
        targetType: target.type,
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitStatusEffectAppliedEvent(ability: ActiveAbility, effectType: string, targetId: string): void {
    const event: CombatEvent = {
      type: 'status_effect',
      timestamp: Date.now(),
      source: 'manual_ability_system',
      target: targetId,
      data: {
        abilityId: ability.id,
        abilityName: ability.name,
        effectType,
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'manual_ability_system',
      target: this.dragon.id,
      data,
    };

    this.state.combatEvents.push(event);
  }

  private initializeDefaultAbilities(): void {
    const defaultAbilities: ActiveAbility[] = [
      {
        id: 'breath_burst',
        name: 'Breath Burst',
        type: 'offensive',
        category: 'elemental',
        cooldown: 5000,
        lastUsed: 0,
        charges: 1,
        maxCharges: 1,
        powerPointCost: 25,
        range: 300,
        effects: new Map<string, unknown>([
          ['damage', 150],
          ['area_of_effect', 100],
          ['elemental_type', this.dragon.elementalType],
        ]),
        isChanneling: false,
        channelingStartTime: 0,
        channelingDuration: 0,
      },
      {
        id: 'wing_guard',
        name: 'Wing Guard',
        type: 'defensive',
        category: 'wing',
        cooldown: 8000,
        lastUsed: 0,
        charges: 1,
        maxCharges: 1,
        powerPointCost: 20,
        range: 0,
        effects: new Map<string, unknown>([
          ['damage_reduction', 0.5],
          ['duration', 5000],
          ['shield_strength', 100],
        ]),
        isChanneling: false,
        channelingStartTime: 0,
        channelingDuration: 0,
      },
      {
        id: 'time_slip',
        name: 'Time Slip',
        type: 'utility',
        category: 'special',
        cooldown: 15000,
        lastUsed: 0,
        charges: 1,
        maxCharges: 1,
        powerPointCost: 40,
        range: 0,
        effects: new Map<string, unknown>([
          ['speed_boost', 2.0],
          ['duration', 3000],
          ['cooldown_reduction', 0.5],
        ]),
        isChanneling: false,
        channelingStartTime: 0,
        channelingDuration: 0,
      },
    ];

    for (const ability of defaultAbilities) {
      this.state.activeAbilities.set(ability.id, ability);
    }
  }

  private createInitialState(): ManualAbilityState {
    return {
      isActive: false,
      isPaused: false,
      currentPowerPoints: 0,
      maxPowerPoints: this.config.maxPowerPoints,
      lastRegenerationTime: 0,
      regenerationDelayEndTime: 0,
      manualTarget: null,
      manualTargetLockEndTime: 0,
      activeAbilities: new Map(),
      performanceMetrics: {
        abilitiesUsedPerSecond: 0,
        averagePowerPointUsage: 0,
        manualTargetingAccuracy: 0,
        abilityEffectiveness: 0,
        performanceScore: 0,
      },
      combatEvents: [],
      combatState: {} as CombatState,
    };
  }

  private createInitialMetrics(): ManualAbilityMetrics {
    return {
      totalAbilitiesUsed: 0,
      totalPowerPointsSpent: 0,
      totalDamageDealt: 0,
      totalHealingDone: 0,
      totalBuffsApplied: 0,
      totalDebuffsApplied: 0,
      totalUtilityEffects: 0,
      averageAbilityCooldown: 0,
      averagePowerPointEfficiency: 0,
      averageDamagePerAbility: 0,
      averageHealingPerAbility: 0,
      averageBuffDuration: 0,
      averageDebuffDuration: 0,
      averageUtilityEffectiveness: 0,
      performanceOptimizations: 0,
    };
  }

  public getState(): ManualAbilityState {
    return { ...this.state };
  }

  public getMetrics(): ManualAbilityMetrics {
    return { ...this.metrics };
  }

  public getConfig(): ManualAbilityConfig {
    return { ...this.config };
  }
}
