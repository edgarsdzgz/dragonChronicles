/**
 * Boss AI Integration System
 * 
 * Integrates the Boss AI System with the main combat and gameplay loops.
 * Orchestrates boss encounters, phase transitions, and special abilities.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
} from './types.js';
import { BossAISystem } from './boss-ai-system.js';
import type { 
  BossAIState, 
  EnvironmentalElement
} from './boss-ai-system.js';

/**
 * Boss AI Integration Configuration
 */
export interface BossAIIntegrationConfig {
  enableBossAI: boolean;
  enablePhaseTransitions: boolean;
  enableSpecialAbilities: boolean;
  enableEnvironmentalInteraction: boolean;
  enableThreatAssessment: boolean;
  enablePerformanceOptimization: boolean;
  enableCombatIntegration: boolean;
  enableCombatEvents: boolean;
  enableCombatStateUpdates: boolean;
  enableCombatTesting: boolean;
  enableCombatValidation: boolean;
  enableCombatOptimization: boolean;
  phaseTransitionCooldown: number;
  specialAbilityCooldown: number;
  environmentalInteractionCooldown: number;
  threatAssessmentInterval: number;
  performanceThreshold: number;
  combatIntegrationInterval: number;
  combatEventProcessingInterval: number;
  combatStateUpdateInterval: number;
  combatTestingInterval: number;
  combatValidationInterval: number;
  combatOptimizationInterval: number;
}

/**
 * Boss AI Integration State
 */
export interface BossAIIntegrationState {
  isActive: boolean;
  activeBosses: string[];
  currentPhase: string;
  phaseHistory: string[];
  lastPhaseTransition: number;
  specialAbilities: string[];
  environmentalElements: string[];
  threatLevel: number;
  isChanneling: boolean;
  channelingAbility: string | null;
  channelingStartTime: number;
  channelingDuration: number;
  lastThreatAssessment: number;
  performanceMetrics: {
    phaseTransitionsPerSecond: number;
    specialAbilitiesPerSecond: number;
    environmentalInteractionsPerSecond: number;
    threatAssessmentsPerSecond: number;
    performanceScore: number;
  };
  combatIntegration: {
    isIntegrated: boolean;
    lastIntegration: number;
    integrationScore: number;
  };
  combatEvents: {
    totalEvents: number;
    eventsPerSecond: number;
    lastEventTime: number;
  };
  combatState: {
    isUpdated: boolean;
    lastUpdate: number;
    updateScore: number;
  };
  combatTesting: {
    isTesting: boolean;
    lastTest: number;
    testScore: number;
  };
  combatValidation: {
    isValid: boolean;
    lastValidation: number;
    validationScore: number;
  };
  combatOptimization: {
    isOptimized: boolean;
    lastOptimization: number;
    optimizationScore: number;
  };
}

/**
 * Boss AI Integration System
 */
export class BossAIIntegrationSystem {
  private bossAISystem: BossAISystem;
  private activeBosses: Map<string, Enemy> = new Map();
  private bossAIStates: Map<string, BossAIState> = new Map();
  private environmentalElements: Map<string, EnvironmentalElement[]> = new Map();
  private performanceMetrics: Map<string, Record<string, unknown>> = new Map();
  private eventHandlers: Map<string, (_event: CombatEvent) => void> = new Map();
  private config: BossAIIntegrationConfig;
  private state!: BossAIIntegrationState;

  constructor(config: Partial<BossAIIntegrationConfig> = {}) {
    this.config = {
      enableBossAI: true,
      enablePhaseTransitions: true,
      enableSpecialAbilities: true,
      enableEnvironmentalInteraction: true,
      enableThreatAssessment: true,
      enablePerformanceOptimization: true,
      enableCombatIntegration: true,
      enableCombatEvents: true,
      enableCombatStateUpdates: true,
      enableCombatTesting: true,
      enableCombatValidation: true,
      enableCombatOptimization: true,
      phaseTransitionCooldown: 2000,
      specialAbilityCooldown: 1000,
      environmentalInteractionCooldown: 500,
      threatAssessmentInterval: 1000,
      performanceThreshold: 0.8,
      combatIntegrationInterval: 100,
      combatEventProcessingInterval: 50,
      combatStateUpdateInterval: 16,
      combatTestingInterval: 1000,
      combatValidationInterval: 500,
      combatOptimizationInterval: 2000,
      ...config,
    };

    this.bossAISystem = new BossAISystem({
      enablePhaseTransitions: this.config.enablePhaseTransitions,
      enableSpecialAbilities: this.config.enableSpecialAbilities,
      enableEnvironmentalInteraction: this.config.enableEnvironmentalInteraction,
      enableThreatAssessment: this.config.enableThreatAssessment,
      phaseTransitionCooldown: this.config.phaseTransitionCooldown,
      abilityCooldownReduction: 0.1,
      threatAssessmentInterval: this.config.threatAssessmentInterval,
      environmentalElementLifetime: 10000,
      maxConcurrentAbilities: 3,
      performanceOptimization: this.config.enablePerformanceOptimization,
    });

    this.initializeState();
  }

  /**
   * Initialize integration state
   */
  private initializeState(): void {
    this.state = {
      isActive: false,
      activeBosses: [],
      currentPhase: 'seed_circuit',
      phaseHistory: ['seed_circuit'],
      lastPhaseTransition: 0,
      specialAbilities: [],
      environmentalElements: [],
      threatLevel: 0,
      isChanneling: false,
      channelingAbility: null,
      channelingStartTime: 0,
      channelingDuration: 0,
      lastThreatAssessment: 0,
      performanceMetrics: {
        phaseTransitionsPerSecond: 0,
        specialAbilitiesPerSecond: 0,
        environmentalInteractionsPerSecond: 0,
        threatAssessmentsPerSecond: 0,
        performanceScore: 0,
      },
      combatIntegration: {
        isIntegrated: false,
        lastIntegration: 0,
        integrationScore: 0,
      },
      combatEvents: {
        totalEvents: 0,
        eventsPerSecond: 0,
        lastEventTime: 0,
      },
      combatState: {
        isUpdated: false,
        lastUpdate: 0,
        updateScore: 0,
      },
      combatTesting: {
        isTesting: false,
        lastTest: 0,
        testScore: 0,
      },
      combatValidation: {
        isValid: false,
        lastValidation: 0,
        validationScore: 0,
      },
      combatOptimization: {
        isOptimized: false,
        lastOptimization: 0,
        optimizationScore: 0,
      },
    };
  }

  /**
   * Update boss AI integration
   */
  public update(dragon: Dragon, enemies: Enemy[], combatState: CombatState, deltaTime: number): void {
    if (!this.config.enableBossAI) return;

    this.state.isActive = true;
    this.updateBosses(dragon, enemies, combatState, deltaTime);
    this.updateCombatIntegration(deltaTime);
    this.updateCombatEvents(deltaTime);
    this.updateCombatState(combatState, deltaTime);
    this.updateCombatTesting(deltaTime);
    this.updateCombatValidation(deltaTime);
    this.updateCombatOptimization(deltaTime);
  }

  /**
   * Update boss AI for all active bosses
   */
  private updateBosses(dragon: Dragon, enemies: Enemy[], combatState: CombatState, deltaTime: number): void {
    // Find boss enemies
    const bossEnemies = enemies.filter(enemy => enemy.isBoss);
    
    for (const boss of bossEnemies) {
      // Update boss AI
      this.bossAISystem.update(boss, dragon, combatState, deltaTime);
      
      // Store boss AI state
      this.bossAIStates.set(boss.id, this.bossAISystem.getState());
      this.activeBosses.set(boss.id, boss);
      
      // Update environmental elements
      this.environmentalElements.set(boss.id, this.bossAISystem.getEnvironmentalElements());
      
      // Update performance metrics
      this.performanceMetrics.set(boss.id, this.bossAISystem.getPerformanceMetrics());
    }

    // Update integration state
    this.state.activeBosses = bossEnemies.map(boss => boss.id);
    this.state.currentPhase = this.bossAISystem.getCurrentPhase().id;
    this.state.threatLevel = this.bossAISystem.getState().threatLevel;
    this.state.isChanneling = this.bossAISystem.isChanneling();
    
    if (this.state.isChanneling) {
      this.state.channelingAbility = this.bossAISystem.getState().channelingAbility?.id || null;
      this.state.channelingStartTime = this.bossAISystem.getState().channelingStartTime;
      this.state.channelingDuration = this.bossAISystem.getState().channelingDuration;
    }
  }

  /**
   * Update combat integration
   */
  private updateCombatIntegration(_deltaTime: number): void {
    if (!this.config.enableCombatIntegration) return;

    const currentTime = Date.now();
    const timeSinceLastIntegration = currentTime - this.state.combatIntegration.lastIntegration;
    
    if (timeSinceLastIntegration >= this.config.combatIntegrationInterval) {
      this.state.combatIntegration.isIntegrated = true;
      this.state.combatIntegration.lastIntegration = currentTime;
      this.state.combatIntegration.integrationScore = this.calculateIntegrationScore();
    }
  }

  /**
   * Update combat events
   */
  private updateCombatEvents(_deltaTime: number): void {
    if (!this.config.enableCombatEvents) return;

    const currentTime = Date.now();
    this.state.combatEvents.totalEvents++;
    this.state.combatEvents.lastEventTime = currentTime;
    
    // Calculate events per second
    const timeWindow = 1000;
    this.state.combatEvents.eventsPerSecond = this.state.combatEvents.totalEvents / 
      Math.max(1, (currentTime - this.state.combatEvents.lastEventTime) / timeWindow);
  }

  /**
   * Update combat state
   */
  private updateCombatState(combatState: CombatState, _deltaTime: number): void {
    if (!this.config.enableCombatStateUpdates) return;

    const currentTime = Date.now();
    const timeSinceLastUpdate = currentTime - this.state.combatState.lastUpdate;
    
    if (timeSinceLastUpdate >= this.config.combatStateUpdateInterval) {
      this.state.combatState.isUpdated = true;
      this.state.combatState.lastUpdate = currentTime;
      this.state.combatState.updateScore = this.calculateStateUpdateScore(combatState);
    }
  }

  /**
   * Update combat testing
   */
  private updateCombatTesting(_deltaTime: number): void {
    if (!this.config.enableCombatTesting) return;

    const currentTime = Date.now();
    const timeSinceLastTest = currentTime - this.state.combatTesting.lastTest;
    
    if (timeSinceLastTest >= this.config.combatTestingInterval) {
      this.state.combatTesting.isTesting = true;
      this.state.combatTesting.lastTest = currentTime;
      this.state.combatTesting.testScore = this.calculateTestScore();
    }
  }

  /**
   * Update combat validation
   */
  private updateCombatValidation(_deltaTime: number): void {
    if (!this.config.enableCombatValidation) return;

    const currentTime = Date.now();
    const timeSinceLastValidation = currentTime - this.state.combatValidation.lastValidation;
    
    if (timeSinceLastValidation >= this.config.combatValidationInterval) {
      this.state.combatValidation.isValid = this.validateCombatState();
      this.state.combatValidation.lastValidation = currentTime;
      this.state.combatValidation.validationScore = this.calculateValidationScore();
    }
  }

  /**
   * Update combat optimization
   */
  private updateCombatOptimization(_deltaTime: number): void {
    if (!this.config.enableCombatOptimization) return;

    const currentTime = Date.now();
    const timeSinceLastOptimization = currentTime - this.state.combatOptimization.lastOptimization;
    
    if (timeSinceLastOptimization >= this.config.combatOptimizationInterval) {
      this.state.combatOptimization.isOptimized = this.optimizeCombatPerformance();
      this.state.combatOptimization.lastOptimization = currentTime;
      this.state.combatOptimization.optimizationScore = this.calculateOptimizationScore();
    }
  }

  /**
   * Calculate integration score
   */
  private calculateIntegrationScore(): number {
    const bossCount = this.state.activeBosses.length;
    const phaseTransitions = this.state.performanceMetrics.phaseTransitionsPerSecond;
    const specialAbilities = this.state.performanceMetrics.specialAbilitiesPerSecond;
    const environmentalInteractions = this.state.performanceMetrics.environmentalInteractionsPerSecond;
    
    return Math.min(1, (bossCount * 0.3 + phaseTransitions * 0.2 + specialAbilities * 0.3 + environmentalInteractions * 0.2));
  }

  /**
   * Calculate state update score
   */
  private calculateStateUpdateScore(combatState: CombatState): number {
    const dragonHealth = combatState.dragonHealth.currentHP / combatState.dragonHealth.maxHP;
    const activeEnemies = this.state.activeBosses.length;
    const environmentalElements = this.state.environmentalElements.length;
    
    return Math.min(1, (dragonHealth * 0.4 + activeEnemies * 0.3 + environmentalElements * 0.3));
  }

  /**
   * Calculate test score
   */
  private calculateTestScore(): number {
    const performanceScore = this.state.performanceMetrics.performanceScore;
    const integrationScore = this.state.combatIntegration.integrationScore;
    const stateScore = this.state.combatState.updateScore;
    
    return (performanceScore + integrationScore + stateScore) / 3;
  }

  /**
   * Calculate validation score
   */
  private calculateValidationScore(): number {
    const isValid = this.state.combatValidation.isValid;
    const performanceScore = this.state.performanceMetrics.performanceScore;
    const integrationScore = this.state.combatIntegration.integrationScore;
    
    return isValid ? (performanceScore + integrationScore) / 2 : 0;
  }

  /**
   * Calculate optimization score
   */
  private calculateOptimizationScore(): number {
    const performanceScore = this.state.performanceMetrics.performanceScore;
    const testScore = this.state.combatTesting.testScore;
    const validationScore = this.state.combatValidation.validationScore;
    
    return (performanceScore + testScore + validationScore) / 3;
  }

  /**
   * Validate combat state
   */
  private validateCombatState(): boolean {
    // Check if boss AI is properly integrated
    if (!this.state.combatIntegration.isIntegrated) return false;
    
    // Check if performance metrics are within acceptable ranges
    const performanceScore = this.state.performanceMetrics.performanceScore;
    if (performanceScore < this.config.performanceThreshold) return false;
    
    // Check if combat state is being updated
    if (!this.state.combatState.isUpdated) return false;
    
    return true;
  }

  /**
   * Optimize combat performance
   */
  private optimizeCombatPerformance(): boolean {
    // Check if performance optimization is needed
    const performanceScore = this.state.performanceMetrics.performanceScore;
    if (performanceScore >= this.config.performanceThreshold) return true;
    
    // Apply performance optimizations
    this.applyPerformanceOptimizations();
    
    return true;
  }

  /**
   * Apply performance optimizations
   */
  private applyPerformanceOptimizations(): void {
    // Reduce environmental element lifetime for better performance
    if (this.state.environmentalElements.length > 10) {
      this.state.environmentalElements = this.state.environmentalElements.slice(0, 10);
    }
    
    // Optimize threat assessment frequency
    if (this.state.performanceMetrics.threatAssessmentsPerSecond > 2) {
      this.config.threatAssessmentInterval *= 1.5;
    }
    
    // Optimize special ability frequency
    if (this.state.performanceMetrics.specialAbilitiesPerSecond > 1) {
      this.config.specialAbilityCooldown *= 1.2;
    }
  }

  /**
   * Get boss AI state for specific boss
   */
  public getBossAIState(bossId: string): BossAIState | null {
    return this.bossAIStates.get(bossId) || null;
  }

  /**
   * Get environmental elements for specific boss
   */
  public getEnvironmentalElements(bossId: string): EnvironmentalElement[] {
    return this.environmentalElements.get(bossId) || [];
  }

  /**
   * Get performance metrics for specific boss
   */
  public getPerformanceMetrics(bossId: string): Record<string, unknown> {
    return this.performanceMetrics.get(bossId) || {};
  }

  /**
   * Get integration state
   */
  public getState(): BossAIIntegrationState {
    return { ...this.state };
  }

  /**
   * Get current phase
   */
  public getCurrentPhase(): string {
    return this.state.currentPhase;
  }

  /**
   * Get active bosses
   */
  public getActiveBosses(): string[] {
    return [...this.state.activeBosses];
  }

  /**
   * Check if boss is channeling
   */
  public isBossChanneling(bossId: string): boolean {
    const bossState = this.bossAIStates.get(bossId);
    return bossState?.isChanneling || false;
  }

  /**
   * Get channeling progress for boss
   */
  public getBossChannelingProgress(bossId: string): number {
    const bossState = this.bossAIStates.get(bossId);
    if (!bossState?.isChanneling) return 0;
    
    const currentTime = Date.now();
    const elapsed = currentTime - bossState.channelingStartTime;
    return Math.min(1, elapsed / bossState.channelingDuration);
  }

  /**
   * Interrupt boss channeling
   */
  public interruptBossChanneling(_bossId: string): void {
    this.bossAISystem.interruptChanneling();
  }

  /**
   * Destroy environmental element
   */
  public destroyEnvironmentalElement(bossId: string, elementId: string): void {
    this.bossAISystem.destroyEnvironmentalElement(elementId);
    
    // Update local state
    const elements = this.environmentalElements.get(bossId) || [];
    const updatedElements = elements.filter(element => element.id !== elementId);
    this.environmentalElements.set(bossId, updatedElements);
  }

  /**
   * Register event handler
   */
  public registerEventHandler(eventType: string, handler: (_event: CombatEvent) => void): void {
    this.eventHandlers.set(eventType, handler);
  }

  /**
   * Unregister event handler
   */
  public unregisterEventHandler(eventType: string): void {
    this.eventHandlers.delete(eventType);
  }

  /**
   * Emit combat event
   */
  public emitCombatEvent(event: CombatEvent): void {
    const handler = this.eventHandlers.get(event.type);
    if (handler) {
      handler(event);
    }
  }

  /**
   * Get integration statistics
   */
  public getIntegrationStatistics(): Record<string, unknown> {
    return {
      activeBosses: this.state.activeBosses.length,
      currentPhase: this.state.currentPhase,
      threatLevel: this.state.threatLevel,
      isChanneling: this.state.isChanneling,
      performanceScore: this.state.performanceMetrics.performanceScore,
      integrationScore: this.state.combatIntegration.integrationScore,
      stateUpdateScore: this.state.combatState.updateScore,
      testScore: this.state.combatTesting.testScore,
      validationScore: this.state.combatValidation.validationScore,
      optimizationScore: this.state.combatOptimization.optimizationScore,
    };
  }

  /**
   * Reset integration state
   */
  public reset(): void {
    this.activeBosses.clear();
    this.bossAIStates.clear();
    this.environmentalElements.clear();
    this.performanceMetrics.clear();
    this.eventHandlers.clear();
    this.initializeState();
  }

  /**
   * Destroy integration system
   */
  public destroy(): void {
    this.reset();
  }
}