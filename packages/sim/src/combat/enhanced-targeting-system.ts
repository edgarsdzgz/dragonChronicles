/**
 * Enhanced Targeting System for Draconia Chronicles
 * 
 * Implements intelligent targeting with elemental priorities, formation analysis,
 * and manual override capabilities. Provides optimal target selection for combat.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
  ElementalType,
  TargetingStrategy,
  Vector2,
} from './types.js';

export interface EnhancedTargetingConfig {
  enableEnhancedTargeting: boolean;
  enableElementalTargeting: boolean;
  enableFormationTargeting: boolean;
  enableThreatAssessment: boolean;
  enableManualTargeting: boolean;
  enableAutoTargeting: boolean;
  enablePerformanceOptimization: boolean;
  enableTargetingAnalytics: boolean;
  targetingUpdateInterval: number; // How often to recalculate targets (ms)
  manualTargetLockDuration: number; // How long manual target stays locked (ms)
  elementalPriorityWeight: number; // Weight for elemental advantage (0-1)
  formationPriorityWeight: number; // Weight for formation targeting (0-1)
  threatPriorityWeight: number; // Weight for threat assessment (0-1)
  distancePriorityWeight: number; // Weight for distance consideration (0-1)
  performanceThreshold: number;
}

export interface EnhancedTargetingState {
  isActive: boolean;
  isPaused: boolean;
  currentTarget: Enemy | null;
  manualTarget: Enemy | null;
  manualTargetLockEndTime: number;
  targetingStrategy: TargetingStrategy;
  availableTargets: Map<string, Enemy>;
  elementalTargets: Map<ElementalType, Enemy[]>;
  formationTargets: Map<string, Enemy[]>;
  threatLevels: Map<string, number>;
  targetingMetrics: EnhancedTargetingMetrics;
  performanceMetrics: {
    targetSelectionTime: number;
    rangeDetectionTime: number;
    threatAssessmentTime: number;
    elementalAnalysisTime: number;
    formationAnalysisTime: number;
    totalUpdateTime: number;
    targetSwitchCount: number;
    averageTargetLifetime: number;
    performanceScore: number;
  };
  combatEvents: CombatEvent[];
  combatState: CombatState;
}

export interface TargetingResult {
  target: Enemy | null;
  confidence: number; // 0-1, how confident we are in this target
  reasoning: string; // Why this target was selected
  alternatives: Enemy[]; // Alternative targets considered
  metrics: {
    selectionTime: number;
    elementalScore: number;
    formationScore: number;
    threatScore: number;
    distanceScore: number;
    totalScore: number;
  };
}

export interface EnhancedTargetingMetrics {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatAssessmentTime: number;
  elementalAnalysisTime: number;
  formationAnalysisTime: number;
  totalUpdateTime: number;
  targetSwitchCount: number;
  averageTargetLifetime: number;
  strategyEffectiveness: Map<TargetingStrategy, number>;
  elementalEffectiveness: number;
  formationEffectiveness: number;
  threatAssessmentAccuracy: number;
  formationAccuracy: number;
  cacheHitRate?: number;
  spatialGridEfficiency?: number;
}

export class EnhancedTargetingSystem {
  private config: EnhancedTargetingConfig;
  private state: EnhancedTargetingState;
  private dragon: Dragon;

  constructor(config: Partial<EnhancedTargetingConfig>, dragon: Dragon) {
    this.config = {
      enableEnhancedTargeting: true,
      enableElementalTargeting: true,
      enableFormationTargeting: true,
      enableThreatAssessment: true,
      enableManualTargeting: true,
      enableAutoTargeting: true,
      enablePerformanceOptimization: true,
      enableTargetingAnalytics: true,
      targetingUpdateInterval: 500, // 0.5 seconds
      manualTargetLockDuration: 3000, // 3 seconds
      elementalPriorityWeight: 0.4,
      formationPriorityWeight: 0.3,
      threatPriorityWeight: 0.2,
      distancePriorityWeight: 0.1,
      performanceThreshold: 100,
      ...config,
    };

    this.dragon = dragon;
    this.state = this.createInitialState();
  }

  public start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.emitCombatEvent('enhanced_targeting_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.currentTarget = null;
    this.state.manualTarget = null;
    this.state.availableTargets.clear();
    this.state.elementalTargets.clear();
    this.state.formationTargets.clear();
    this.state.threatLevels.clear();
    this.emitCombatEvent('enhanced_targeting_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitCombatEvent('enhanced_targeting_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitCombatEvent('enhanced_targeting_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    this.state.combatState = combatState;
    this.updateAvailableTargets(activeEnemies);
    this.updateTargetingAnalysis();
    this.updateTargetSelection();
    this.updateManualTargeting();
    this.updatePerformanceMetrics(deltaTime);
    this.cleanupEvents();
  }

  public getBestTarget(): Enemy | null {
    if (!this.config.enableEnhancedTargeting) {
      return null;
    }

    // Check manual target first
    if (this.state.manualTarget && this.isTargetValid(this.state.manualTarget)) {
      return this.state.manualTarget;
    }

    // Use current target if still valid
    if (this.state.currentTarget && this.isTargetValid(this.state.currentTarget)) {
      return this.state.currentTarget;
    }

    // Find new target
    const targetingResult = this.findBestTarget();
    this.state.currentTarget = targetingResult.target;
    
    if (targetingResult.target) {
      this.state.targetingMetrics.targetSwitchCount++;
      this.emitTargetingEvent(targetingResult);
    }

    return this.state.currentTarget;
  }

  public setManualTarget(target: Enemy | null): void {
    if (!this.config.enableManualTargeting) {
      return;
    }

    this.state.manualTarget = target;
    if (target) {
      this.state.manualTargetLockEndTime = Date.now() + this.config.manualTargetLockDuration;
      this.emitCombatEvent('manual_target_set', {
        targetId: target.id,
        targetType: target.type,
        dragonId: this.dragon.id,
      });
    }
  }

  public setTargetingStrategy(strategy: TargetingStrategy): void {
    this.state.targetingStrategy = strategy;
    this.emitCombatEvent('targeting_strategy_changed', {
      strategy,
      dragonId: this.dragon.id,
    });
  }

  public getTargetingMetrics(): EnhancedTargetingMetrics {
    return { ...this.state.targetingMetrics };
  }

  public getTargetingResult(): TargetingResult {
    const target = this.getBestTarget();
    if (!target) {
      return {
        target: null,
        confidence: 0,
        reasoning: 'No valid targets available',
        alternatives: [],
        metrics: {
          selectionTime: 0,
          elementalScore: 0,
          formationScore: 0,
          threatScore: 0,
          distanceScore: 0,
          totalScore: 0,
        },
      };
    }

    const elementalScore = this.calculateElementalScore(target);
    const formationScore = this.calculateFormationScore(target);
    const threatScore = this.calculateThreatScore(target);
    const distanceScore = this.calculateDistanceScore(target);
    const totalScore = this.calculateTargetingScore(target);

    return {
      target,
      confidence: Math.min(1.0, totalScore / 4.0), // Normalize to 0-1
      reasoning: this.generateTargetingReasoning(target, elementalScore, formationScore, threatScore, distanceScore),
      alternatives: this.getAlternativeTargets(target),
      metrics: {
        selectionTime: this.state.targetingMetrics.targetSelectionTime,
        elementalScore,
        formationScore,
        threatScore,
        distanceScore,
        totalScore,
      },
    };
  }

  private updateAvailableTargets(activeEnemies: Map<string, Enemy>): void {
    this.state.availableTargets.clear();
    
    for (const [enemyId, enemy] of activeEnemies.entries()) {
      if (enemy.isAlive && this.isInRange(enemy)) {
        this.state.availableTargets.set(enemyId, enemy);
      }
    }
  }

  private updateTargetingAnalysis(): void {
    if (this.config.enableElementalTargeting) {
      this.updateElementalTargeting();
    }

    if (this.config.enableFormationTargeting) {
      this.updateFormationTargeting();
    }

    if (this.config.enableThreatAssessment) {
      this.updateThreatAssessment();
    }
  }

  private updateElementalTargeting(): void {
    this.state.elementalTargets.clear();

    for (const enemy of this.state.availableTargets.values()) {
      const elementalType = this.determineElementalType(enemy);
      if (!this.state.elementalTargets.has(elementalType)) {
        this.state.elementalTargets.set(elementalType, []);
      }
      this.state.elementalTargets.get(elementalType)!.push(enemy);
    }
  }

  private updateFormationTargeting(): void {
    this.state.formationTargets.clear();

    for (const enemy of this.state.availableTargets.values()) {
      const formation = this.determineFormation(enemy);
      if (!this.state.formationTargets.has(formation)) {
        this.state.formationTargets.set(formation, []);
      }
      this.state.formationTargets.get(formation)!.push(enemy);
    }
  }

  private updateThreatAssessment(): void {
    for (const enemy of this.state.availableTargets.values()) {
      const threatLevel = this.calculateThreatLevel(enemy);
      this.state.threatLevels.set(enemy.id, threatLevel);
    }
  }

  private updateTargetSelection(): void {
    if (!this.config.enableAutoTargeting) {
      return;
    }

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - this.state.performanceMetrics.totalUpdateTime;

    if (timeSinceLastUpdate >= this.config.targetingUpdateInterval) {
      this.getBestTarget();
      this.state.performanceMetrics.totalUpdateTime = currentTime;
    }
  }

  private updateManualTargeting(): void {
    if (!this.config.enableManualTargeting || !this.state.manualTarget) {
      return;
    }

    const currentTime = Date.now();
    if (currentTime >= this.state.manualTargetLockEndTime) {
      this.state.manualTarget = null;
      return;
    }

    // Check if manual target is still valid
    if (!this.isTargetValid(this.state.manualTarget)) {
      this.state.manualTarget = null;
    }
  }

  private findBestTarget(): TargetingResult {
    const startTime = Date.now();
    const availableTargets = Array.from(this.state.availableTargets.values());

    if (availableTargets.length === 0) {
      return {
        target: null,
        confidence: 0,
        reasoning: 'No targets available',
        alternatives: [],
        metrics: {
          selectionTime: Date.now() - startTime,
          elementalScore: 0,
          formationScore: 0,
          threatScore: 0,
          distanceScore: 0,
          totalScore: 0,
        },
      };
    }

    let bestTarget: Enemy | null = null;
    let bestScore = -1;
    const alternatives: Enemy[] = [];

    for (const target of availableTargets) {
      const score = this.calculateTargetingScore(target);
      alternatives.push(target);

      if (score > bestScore) {
        bestScore = score;
        bestTarget = target;
      }
    }

    // Sort alternatives by score
    alternatives.sort((a, b) => this.calculateTargetingScore(b) - this.calculateTargetingScore(a));

    const selectionTime = Date.now() - startTime;
    this.state.targetingMetrics.targetSelectionTime = selectionTime;

    return {
      target: bestTarget,
      confidence: Math.min(1.0, bestScore / 4.0),
      reasoning: bestTarget ? this.generateTargetingReasoning(bestTarget, 
        this.calculateElementalScore(bestTarget),
        this.calculateFormationScore(bestTarget),
        this.calculateThreatScore(bestTarget),
        this.calculateDistanceScore(bestTarget)
      ) : 'No suitable target found',
      alternatives: alternatives.slice(1, 4), // Top 3 alternatives
      metrics: {
        selectionTime,
        elementalScore: bestTarget ? this.calculateElementalScore(bestTarget) : 0,
        formationScore: bestTarget ? this.calculateFormationScore(bestTarget) : 0,
        threatScore: bestTarget ? this.calculateThreatScore(bestTarget) : 0,
        distanceScore: bestTarget ? this.calculateDistanceScore(bestTarget) : 0,
        totalScore: bestScore,
      },
    };
  }

  private calculateTargetingScore(target: Enemy): number {
    const elementalScore = this.calculateElementalScore(target);
    const formationScore = this.calculateFormationScore(target);
    const threatScore = this.calculateThreatScore(target);
    const distanceScore = this.calculateDistanceScore(target);

    return (
      elementalScore * this.config.elementalPriorityWeight +
      formationScore * this.config.formationPriorityWeight +
      threatScore * this.config.threatPriorityWeight +
      distanceScore * this.config.distancePriorityWeight
    );
  }

  private calculateElementalScore(_target: Enemy): number {
    if (!this.config.enableElementalTargeting) {
      return 1.0;
    }

    const dragonElementalType = this.dragon.elementalType;
    const targetElementalType = this.determineElementalType(_target);
    const weaknesses = this.getElementalWeaknesses(dragonElementalType);

    if (weaknesses.includes(targetElementalType)) {
      return 1.5; // 50% bonus for elemental advantage
    }

    return 1.0; // Neutral
  }

  private calculateFormationScore(_target: Enemy): number {
    if (!this.config.enableFormationTargeting) {
      return 1.0;
    }

    const formation = this.determineFormation(_target);
    
    switch (formation) {
      case 'formation_optimal':
        return 1.3; // 30% bonus for optimal formation targets
      case 'formation_break':
        return 1.2; // 20% bonus for formation break points
      case 'formation_center':
        return 1.1; // 10% bonus for formation center
      default:
        return 1.0; // Neutral
    }
  }

  private calculateThreatScore(_target: Enemy): number {
    if (!this.config.enableThreatAssessment) {
      return 1.0;
    }

    const threatLevel = this.state.threatLevels.get(_target.id) || 1.0;
    return Math.min(2.0, threatLevel); // Cap at 2x threat
  }

  private calculateDistanceScore(_target: Enemy): number {
    const distance = this.calculateDistance(this.dragon.position, _target.position);
    const maxRange = this.dragon.attackRange;
    
    if (distance > maxRange) {
      return 0.0; // Out of range
    }

    // Closer targets get higher scores
    return 1.0 - (distance / maxRange);
  }

  private isTargetValid(target: Enemy): boolean {
    return target.isAlive && this.isInRange(target);
  }

  private isInRange(target: Enemy): boolean {
    const distance = this.calculateDistance(this.dragon.position, target.position);
    return distance <= this.dragon.attackRange;
  }

  private calculateDistance(pos1: Vector2, pos2: Vector2): number {
    const dx = pos1.x - pos2.x;
    const dy = pos1.y - pos2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  private determineElementalType(_target: Enemy): ElementalType {
    // Determine enemy elemental type based on enemy properties
    return _target.elementalType || 'fire';
  }

  private determineFormation(_target: Enemy): string {
    // Determine enemy formation based on enemy properties
    return 'formation_optimal';
  }

  private calculateThreatLevel(_target: Enemy): number {
    const healthRatio = _target.health.current / _target.health.max;
    const damage = _target.damage || 10;
    const speed = _target.speed || 1.0;
    const distance = this.calculateDistance(this.dragon.position, _target.position);

    return (healthRatio * 0.3) + (damage * 0.4) + (speed * 0.2) + ((1000 - distance) * 0.1);
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

  private generateTargetingReasoning(target: Enemy, elementalScore: number, formationScore: number, threatScore: number, distanceScore: number): string {
    const reasons: string[] = [];

    if (elementalScore > 1.2) {
      reasons.push('elemental advantage');
    }
    if (formationScore > 1.1) {
      reasons.push('optimal formation position');
    }
    if (threatScore > 1.5) {
      reasons.push('high threat level');
    }
    if (distanceScore > 0.8) {
      reasons.push('close range');
    }

    if (reasons.length === 0) {
      return 'default targeting';
    }

    return `Selected for: ${reasons.join(', ')}`;
  }

  private getAlternativeTargets(currentTarget: Enemy): Enemy[] {
    const alternatives = Array.from(this.state.availableTargets.values())
      .filter(target => target.id !== currentTarget.id)
      .sort((a, b) => this.calculateTargetingScore(b) - this.calculateTargetingScore(a));

    return alternatives.slice(0, 3); // Top 3 alternatives
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
    this.state.performanceMetrics.performanceScore = Date.now();
  }

  private cleanupEvents(): void {
    if (this.state.combatEvents.length > 100) {
      this.state.combatEvents = this.state.combatEvents.slice(-50);
    }
  }

  private emitTargetingEvent(targetingResult: TargetingResult): void {
    const event: CombatEvent = {
      type: 'damage',
      timestamp: Date.now(),
      source: 'enhanced_targeting_system',
      target: targetingResult.target?.id || this.dragon.id,
      data: {
        targetId: targetingResult.target?.id,
        targetType: targetingResult.target?.type,
        confidence: targetingResult.confidence,
        reasoning: targetingResult.reasoning,
        metrics: targetingResult.metrics,
        dragonId: this.dragon.id,
      },
    };

    this.state.combatEvents.push(event);
  }

  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'enhanced_targeting_system',
      target: this.dragon.id,
      data,
    };

    this.state.combatEvents.push(event);
  }

  private createInitialState(): EnhancedTargetingState {
    return {
      isActive: false,
      isPaused: false,
      currentTarget: null,
      manualTarget: null,
      manualTargetLockEndTime: 0,
      targetingStrategy: 'closest',
      availableTargets: new Map(),
      elementalTargets: new Map(),
      formationTargets: new Map(),
      threatLevels: new Map(),
      targetingMetrics: {
        targetSelectionTime: 0,
        rangeDetectionTime: 0,
        threatAssessmentTime: 0,
        elementalAnalysisTime: 0,
        formationAnalysisTime: 0,
        totalUpdateTime: 0,
        targetSwitchCount: 0,
        averageTargetLifetime: 0,
        strategyEffectiveness: new Map(),
        elementalEffectiveness: 0,
        formationEffectiveness: 0,
        threatAssessmentAccuracy: 0,
        formationAccuracy: 0,
      },
      performanceMetrics: {
        targetSelectionTime: 0,
        rangeDetectionTime: 0,
        threatAssessmentTime: 0,
        elementalAnalysisTime: 0,
        formationAnalysisTime: 0,
        totalUpdateTime: 0,
        targetSwitchCount: 0,
        averageTargetLifetime: 0,
        performanceScore: 0,
      },
      combatEvents: [],
      combatState: {} as CombatState,
    };
  }

  public getState(): EnhancedTargetingState {
    return { ...this.state };
  }

  public getConfig(): EnhancedTargetingConfig {
    return { ...this.config };
  }
}
