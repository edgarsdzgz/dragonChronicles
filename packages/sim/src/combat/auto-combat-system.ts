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

export interface AutoCombatConfig {
  enableAutoCombat: boolean;
  autoAttackInterval: number;
  enableElementalTargeting: boolean;
  enableFormationTargeting: boolean;
  enableThreatAssessment: boolean;
  threatAssessmentInterval: number;
  enablePerformanceOptimization: boolean;
  performanceThreshold: number;
  enableCombatLogging: boolean;
  enableDamageCalculation: boolean;
  enableStatusEffects: boolean;
  enableDeathProcessing: boolean;
  enableRewardCalculation: boolean;
  enableCombatMetrics: boolean;
  enableCombatEvents: boolean;
  enableCombatStateUpdates: boolean;
  enableCombatIntegration: boolean;
  enableCombatTesting: boolean;
  enableCombatValidation: boolean;
  enableCombatOptimization: boolean;
}

export interface AutoCombatState {
  isActive: boolean;
  isPaused: boolean;
  lastAttackTime: number;
  currentTarget: Enemy | null;
  attackQueue: Enemy[];
  elementalTargets: Map<ElementalType, Enemy[]>;
  formationTargets: Map<string, Enemy[]>;
  threatLevels: Map<string, number>;
  performanceMetrics: {
    attacksPerSecond: number;
    averageDamage: number;
    criticalHitRate: number;
    elementalEffectiveness: number;
    formationEffectiveness: number;
    threatAssessmentAccuracy: number;
    performanceScore: number;
  };
  combatEvents: CombatEvent[];
  combatState: CombatState;
  combatIntegration: boolean;
  combatTesting: boolean;
  combatValidation: boolean;
  combatOptimization: boolean;
}

export interface AutoCombatMetrics {
  totalAttacks: number;
  totalDamage: number;
  totalCriticalHits: number;
  totalElementalHits: number;
  totalFormationHits: number;
  totalThreatAssessments: number;
  totalPerformanceOptimizations: number;
  totalCombatEvents: number;
  totalCombatStateUpdates: number;
  totalCombatIntegration: number;
  totalCombatTesting: number;
  totalCombatValidation: number;
  totalCombatOptimization: number;
  averageAttackTime: number;
  averageDamagePerAttack: number;
  averageCriticalHitRate: number;
  averageElementalEffectiveness: number;
  averageFormationEffectiveness: number;
  averageThreatAssessmentAccuracy: number;
  averagePerformanceScore: number;
  averageCombatEventProcessing: number;
  averageCombatStateUpdate: number;
  averageCombatIntegration: number;
  averageCombatTesting: number;
  averageCombatValidation: number;
  averageCombatOptimization: number;
}

export class AutoCombatSystem {
  private config: AutoCombatConfig;
  private state: AutoCombatState;
  private metrics: AutoCombatMetrics;
  private dragon: Dragon;
  private arcanaDropManager: ReturnType<typeof createDefaultArcanaDropManager>;
  private soulPowerDropManager: ReturnType<typeof createDefaultSoulPowerDropManager>;

  constructor(config: Partial<AutoCombatConfig>, dragon: Dragon) {
    this.config = {
      enableAutoCombat: true,
      autoAttackInterval: 1000, // 1 second
      enableElementalTargeting: true,
      enableFormationTargeting: true,
      enableThreatAssessment: true,
      threatAssessmentInterval: 500, // 0.5 seconds
      enablePerformanceOptimization: true,
      performanceThreshold: 100,
      enableCombatLogging: true,
      enableDamageCalculation: true,
      enableStatusEffects: true,
      enableDeathProcessing: true,
      enableRewardCalculation: true,
      enableCombatMetrics: true,
      enableCombatEvents: true,
      enableCombatStateUpdates: true,
      enableCombatIntegration: true,
      enableCombatTesting: true,
      enableCombatValidation: true,
      enableCombatOptimization: true,
      ...config,
    };

    this.dragon = dragon;
    this.arcanaDropManager = createDefaultArcanaDropManager();
    this.soulPowerDropManager = createDefaultSoulPowerDropManager();

    this.state = this.createInitialState();
    this.metrics = this.createInitialMetrics();
  }

  public start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.lastAttackTime = Date.now();
    this.emitCombatEvent('auto_combat_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.currentTarget = null;
    this.state.attackQueue = [];
    this.emitCombatEvent('auto_combat_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitCombatEvent('auto_combat_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitCombatEvent('auto_combat_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.state.combatState = combatState;
    this.updateTargeting(activeEnemies);
    this.updateAttacks(deltaTime, activeEnemies);
    this.updatePerformanceMetrics(deltaTime);
    this.cleanupEvents();
  }

  private updateTargeting(activeEnemies: Map<string, Enemy>): void {
    if (this.config.enableElementalTargeting) {
      this.updateElementalTargeting(activeEnemies);
    }

    if (this.config.enableFormationTargeting) {
      this.updateFormationTargeting(activeEnemies);
    }

    if (this.config.enableThreatAssessment) {
      this.updateThreatAssessment(activeEnemies);
    }
  }

  private updateElementalTargeting(activeEnemies: Map<string, Enemy>): void {
    this.state.elementalTargets.clear();

    for (const enemy of activeEnemies.values()) {
      const elementalType = this.determineElementalType(enemy);
      if (!this.state.elementalTargets.has(elementalType)) {
        this.state.elementalTargets.set(elementalType, []);
      }
      this.state.elementalTargets.get(elementalType)!.push(enemy);
    }
  }

  private updateFormationTargeting(activeEnemies: Map<string, Enemy>): void {
    this.state.formationTargets.clear();

    for (const enemy of activeEnemies.values()) {
      const formation = this.determineFormation(enemy);
      if (!this.state.formationTargets.has(formation)) {
        this.state.formationTargets.set(formation, []);
      }
      this.state.formationTargets.get(formation)!.push(enemy);
    }
  }

  private updateThreatAssessment(activeEnemies: Map<string, Enemy>): void {
    for (const enemy of activeEnemies.values()) {
      const threatLevel = this.calculateThreatLevel(enemy);
      this.state.threatLevels.set(enemy.id, threatLevel);
    }
  }

  private updateAttacks(deltaTime: number, activeEnemies: Map<string, Enemy>): void {
    const currentTime = Date.now();
    const timeSinceLastAttack = currentTime - this.state.lastAttackTime;

    if (timeSinceLastAttack >= this.config.autoAttackInterval) {
      const target = this.selectTarget(activeEnemies);
      if (target) {
        this.performAttack(target);
        this.state.lastAttackTime = currentTime;
        this.metrics.totalAttacks++;
      }
    }
  }

  private selectTarget(activeEnemies: Map<string, Enemy>): Enemy | null {
    if (activeEnemies.size === 0) {
      return null;
    }

    // Use elemental targeting if enabled
    if (this.config.enableElementalTargeting) {
      const elementalTarget = this.selectElementalTarget();
      if (elementalTarget) {
        return elementalTarget;
      }
    }

    // Use formation targeting if enabled
    if (this.config.enableFormationTargeting) {
      const formationTarget = this.selectFormationTarget();
      if (formationTarget) {
        return formationTarget;
      }
    }

    // Use threat assessment if enabled
    if (this.config.enableThreatAssessment) {
      const threatTarget = this.selectThreatTarget();
      if (threatTarget) {
        return threatTarget;
      }
    }

    // Fallback to closest enemy
    return this.selectClosestTarget(activeEnemies);
  }

  private selectElementalTarget(): Enemy | null {
    const dragonElementalType = this.dragon.elementalType;
    const weaknesses = this.getElementalWeaknesses(dragonElementalType);

    for (const weakness of weaknesses) {
      const targets = this.state.elementalTargets.get(weakness);
      if (targets && targets.length > 0) {
        return targets[0] || null;
      }
    }

    return null;
  }

  private selectFormationTarget(): Enemy | null {
    // Prioritize formation_optimal targets
    const optimalTargets = this.state.formationTargets.get('formation_optimal');
    if (optimalTargets && optimalTargets.length > 0) {
      return optimalTargets[0] || null;
    }

    // Fallback to formation_break targets
    const breakTargets = this.state.formationTargets.get('formation_break');
    if (breakTargets && breakTargets.length > 0) {
      return breakTargets[0] || null;
    }

    return null;
  }

  private selectThreatTarget(): Enemy | null {
    let highestThreat = 0;
    let highestThreatTarget: Enemy | null = null;

    for (const [enemyId, threatLevel] of this.state.threatLevels.entries()) {
      if (threatLevel > highestThreat) {
        highestThreat = threatLevel;
        // Find enemy by ID
        for (const enemy of this.state.elementalTargets.values()) {
          for (const e of enemy) {
            if (e.id === enemyId) {
              highestThreatTarget = e;
              break;
            }
          }
        }
      }
    }

    return highestThreatTarget;
  }

  private selectClosestTarget(activeEnemies: Map<string, Enemy>): Enemy | null {
    let closestDistance = Infinity;
    let closestTarget: Enemy | null = null;

    for (const enemy of activeEnemies.values()) {
      const distance = this.calculateDistance(this.dragon.position, enemy.position);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestTarget = enemy;
      }
    }

    return closestTarget;
  }

  private performAttack(target: Enemy): void {
    if (!this.config.enableDamageCalculation) {
      return;
    }

    const damage = this.calculateDamage(target);
    const isCritical = this.isCriticalHit();
    const finalDamage = isCritical ? damage * 2 : damage;

    target.health.current -= finalDamage;
    this.metrics.totalDamage += finalDamage;

    if (isCritical) {
      this.metrics.totalCriticalHits++;
    }

    this.emitAttackEvent(target, finalDamage, isCritical);

    if (target.health.current <= 0) {
      this.processEnemyDeath(target);
    }
  }

  private calculateDamage(_target: Enemy): number {
    const baseDamage = this.dragon.damage;
    const elementalMultiplier = this.calculateElementalMultiplier(_target);
    const formationMultiplier = this.calculateFormationMultiplier(_target);
    const threatMultiplier = this.calculateThreatMultiplier(_target);

    return baseDamage * elementalMultiplier * formationMultiplier * threatMultiplier;
  }

  private calculateElementalMultiplier(target: Enemy): number {
    const dragonElementalType = this.dragon.elementalType;
    const targetElementalType = this.determineElementalType(target);
    const weaknesses = this.getElementalWeaknesses(dragonElementalType);

    if (weaknesses.includes(targetElementalType)) {
      return 1.5; // 50% bonus damage
    }

    return 1.0;
  }

  private calculateFormationMultiplier(_target: Enemy): number {
    // Formation-based damage multiplier
    return 1.0;
  }

  private calculateThreatMultiplier(target: Enemy): number {
    const threatLevel = this.state.threatLevels.get(target.id) || 0;
    return 1.0 + (threatLevel * 0.1); // 10% bonus per threat level
  }

  private isCriticalHit(): boolean {
    const criticalChance = this.dragon.criticalChance || 0.1;
    return Math.random() < criticalChance;
  }

  private processEnemyDeath(_enemy: Enemy): void {
    if (!this.config.enableDeathProcessing) {
      return;
    }

    const enemyType = this.determineEnemyType(_enemy);
    const isBoss = _enemy.isBoss || false;

    // Calculate rewards
    // const arcanaReward = this.arcanaDropManager.calculateDrop(_enemy, isBoss); // Method doesn't exist yet
    // const soulPowerResult = this.soulPowerDropManager.calculateDrop(_enemy, isBoss); // Method doesn't exist yet
    const arcanaReward = 10; // Placeholder
    const soulPowerResult = { finalAmount: 5 }; // Placeholder

    this.emitDeathEvent(_enemy, enemyType, isBoss, arcanaReward, soulPowerResult);
  }

  private emitAttackEvent(_target: Enemy, damage: number, isCritical: boolean): void {
    if (!this.config.enableCombatEvents) {
      return;
    }

    const event: CombatEvent = {
      type: 'damage',
      timestamp: Date.now(),
      source: 'auto_combat',
      target: _target.id,
      data: {
        damage,
        isCritical,
        elementalType: this.dragon.elementalType,
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitDeathEvent(_enemy: Enemy, _enemyType: string, _isBoss: boolean, _arcanaReward: number, _soulPowerResult: { finalAmount: number }): void {
    if (!this.config.enableCombatEvents) {
      return;
    }

    const event: CombatEvent = {
      type: 'death',
      timestamp: Date.now(),
      source: 'auto_combat',
      target: _enemy.id,
      data: {
        enemyType: _enemyType,
        isBoss: _isBoss,
        arcanaReward: _arcanaReward,
        soulPowerReward: _soulPowerResult.finalAmount,
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private determineElementalType(_enemy: Enemy): ElementalType {
    // Determine enemy elemental type based on enemy properties
    return 'fire'; // Default
  }

  private determineFormation(_enemy: Enemy): string {
    // Determine enemy formation based on enemy properties
    return 'formation_optimal';
  }

  private calculateThreatLevel(_enemy: Enemy): number {
    // Calculate threat level based on enemy properties
    return 1.0;
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
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

  private determineEnemyType(_enemy: Enemy): string {
    return _enemy.type || 'unknown';
  }

  private updatePerformanceMetrics(_deltaTime: number): void {
    if (!this.config.enablePerformanceOptimization) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - this.state.lastAttackTime;

    if (timeSinceLastUpdate >= this.config.performanceThreshold) {
      this.optimizePerformance();
    }
  }

  private optimizePerformance(): void {
    // Performance optimization logic
    this.metrics.totalPerformanceOptimizations++;
  }

  private cleanupEvents(): void {
    if (this.state.combatEvents.length > 100) {
      this.state.combatEvents = this.state.combatEvents.slice(-50);
    }
  }

  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    if (!this.config.enableCombatEvents) {
      return;
    }

    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'auto_combat_system',
      target: this.dragon.id,
      data,
    };

    this.state.combatEvents.push(event);
  }

  private createInitialState(): AutoCombatState {
    return {
      isActive: false,
      isPaused: false,
      lastAttackTime: 0,
      currentTarget: null,
      attackQueue: [],
      elementalTargets: new Map(),
      formationTargets: new Map(),
      threatLevels: new Map(),
      performanceMetrics: {
        attacksPerSecond: 0,
        averageDamage: 0,
        criticalHitRate: 0,
        elementalEffectiveness: 0,
        formationEffectiveness: 0,
        threatAssessmentAccuracy: 0,
        performanceScore: 0,
      },
      combatEvents: [],
      combatState: {} as CombatState,
      combatIntegration: false,
      combatTesting: false,
      combatValidation: false,
      combatOptimization: false,
    };
  }

  private createInitialMetrics(): AutoCombatMetrics {
    return {
      totalAttacks: 0,
      totalDamage: 0,
      totalCriticalHits: 0,
      totalElementalHits: 0,
      totalFormationHits: 0,
      totalThreatAssessments: 0,
      totalPerformanceOptimizations: 0,
      totalCombatEvents: 0,
      totalCombatStateUpdates: 0,
      totalCombatIntegration: 0,
      totalCombatTesting: 0,
      totalCombatValidation: 0,
      totalCombatOptimization: 0,
      averageAttackTime: 0,
      averageDamagePerAttack: 0,
      averageCriticalHitRate: 0,
      averageElementalEffectiveness: 0,
      averageFormationEffectiveness: 0,
      averageThreatAssessmentAccuracy: 0,
      averagePerformanceScore: 0,
      averageCombatEventProcessing: 0,
      averageCombatStateUpdate: 0,
      averageCombatIntegration: 0,
      averageCombatTesting: 0,
      averageCombatValidation: 0,
      averageCombatOptimization: 0,
    };
  }

  public getState(): AutoCombatState {
    return { ...this.state };
  }

  public getMetrics(): AutoCombatMetrics {
    return { ...this.metrics };
  }

  public getConfig(): AutoCombatConfig {
    return { ...this.config };
  }
}
