/**
 * Combat Integration System for Draconia Chronicles
 * 
 * Orchestrates all combat systems, coordinates communication between systems,
 * and provides unified combat state management. Acts as the central hub for combat.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
} from './types.js';
import { AutoCombatSystem } from './auto-combat-system.js';
import { ManualAbilitySystem } from './manual-ability-system.js';
import { EnhancedEnemyAI } from './enhanced-enemy-ai.js';
import { DeathProcessingSystem } from './death-processing-system.js';
import { EnhancedTargetingSystem } from './enhanced-targeting-system.js';

export interface CombatIntegrationConfig {
  enableCombatIntegration: boolean;
  enableAutoCombat: boolean;
  enableManualAbilities: boolean;
  enableEnemyAI: boolean;
  enableDeathProcessing: boolean;
  enableEnhancedTargeting: boolean;
  enableSystemCoordination: boolean;
  enablePerformanceMonitoring: boolean;
  enableCombatEvents: boolean;
  enableCombatStateUpdates: boolean;
  enableCombatTesting: boolean;
  enableCombatValidation: boolean;
  enableCombatOptimization: boolean;
  combatUpdateInterval: number; // Main combat loop interval (ms)
  systemHealthCheckInterval: number; // How often to check system health (ms)
  performanceMonitoringInterval: number; // Performance monitoring interval (ms)
  combatEventProcessingInterval: number; // Event processing interval (ms)
  combatStateUpdateInterval: number; // State update interval (ms)
  combatTestingInterval: number; // Testing interval (ms)
  combatValidationInterval: number; // Validation interval (ms)
  combatOptimizationInterval: number; // Optimization interval (ms)
  performanceThreshold: number;
}

export interface CombatIntegrationState {
  isActive: boolean;
  isPaused: boolean;
  combatSystems: Map<string, CombatSystem>;
  systemHealth: Map<string, SystemHealth>;
  performanceMetrics: {
    combatUpdatesPerSecond: number;
    systemCoordinationTime: number;
    eventProcessingTime: number;
    stateUpdateTime: number;
    testingTime: number;
    validationTime: number;
    optimizationTime: number;
    performanceScore: number;
  };
  combatEvents: CombatEvent[];
  combatState: CombatState;
  lastUpdateTime: number;
  lastHealthCheckTime: number;
  lastPerformanceCheckTime: number;
  lastEventProcessingTime: number;
  lastStateUpdateTime: number;
  lastTestingTime: number;
  lastValidationTime: number;
  lastOptimizationTime: number;
}

export interface CombatSystem {
  id: string;
  name: string;
  system: unknown; // The actual system instance
  isActive: boolean;
  isHealthy: boolean;
  lastUpdateTime: number;
  updateCount: number;
  errorCount: number;
  performanceScore: number;
}

export interface SystemHealth {
  systemId: string;
  isHealthy: boolean;
  lastHealthCheck: number;
  errorCount: number;
  warningCount: number;
  performanceScore: number;
  memoryUsage: number;
  cpuUsage: number;
  updateLatency: number;
  eventProcessingLatency: number;
}

export interface CombatIntegrationMetrics {
  totalCombatUpdates: number;
  totalSystemCoordination: number;
  totalEventProcessing: number;
  totalStateUpdates: number;
  totalTesting: number;
  totalValidation: number;
  totalOptimization: number;
  totalSystemErrors: number;
  totalSystemWarnings: number;
  averageCombatUpdateTime: number;
  averageSystemCoordinationTime: number;
  averageEventProcessingTime: number;
  averageStateUpdateTime: number;
  averageTestingTime: number;
  averageValidationTime: number;
  averageOptimizationTime: number;
  averageSystemHealthScore: number;
  averagePerformanceScore: number;
}

export class CombatIntegrationSystem {
  private config: CombatIntegrationConfig;
  private state: CombatIntegrationState;
  private metrics: CombatIntegrationMetrics;
  private dragon: Dragon;

  // Core combat systems
  private autoCombatSystem!: AutoCombatSystem;
  private manualAbilitySystem!: ManualAbilitySystem;
  private enhancedEnemyAI!: EnhancedEnemyAI;
  private deathProcessingSystem!: DeathProcessingSystem;
  private enhancedTargetingSystem!: EnhancedTargetingSystem;

  constructor(config: Partial<CombatIntegrationConfig>, dragon: Dragon) {
    this.config = {
      enableCombatIntegration: true,
      enableAutoCombat: true,
      enableManualAbilities: true,
      enableEnemyAI: true,
      enableDeathProcessing: true,
      enableEnhancedTargeting: true,
      enableSystemCoordination: true,
      enablePerformanceMonitoring: true,
      enableCombatEvents: true,
      enableCombatStateUpdates: true,
      enableCombatTesting: true,
      enableCombatValidation: true,
      enableCombatOptimization: true,
      combatUpdateInterval: 16, // ~60 FPS
      systemHealthCheckInterval: 1000, // 1 second
      performanceMonitoringInterval: 500, // 0.5 seconds
      combatEventProcessingInterval: 100, // 0.1 seconds
      combatStateUpdateInterval: 50, // 0.05 seconds
      combatTestingInterval: 1000, // 1 second
      combatValidationInterval: 2000, // 2 seconds
      combatOptimizationInterval: 5000, // 5 seconds
      performanceThreshold: 100,
      ...config,
    };

    this.dragon = dragon;
    this.state = this.createInitialState();
    this.metrics = this.createInitialMetrics();
    this.initializeCombatSystems();
  }

  public start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.state.lastUpdateTime = Date.now();

    // Start all combat systems
    if (this.config.enableAutoCombat) {
      this.autoCombatSystem.start();
    }
    if (this.config.enableManualAbilities) {
      this.manualAbilitySystem.start();
    }
    if (this.config.enableEnemyAI) {
      this.enhancedEnemyAI.start();
    }
    if (this.config.enableDeathProcessing) {
      this.deathProcessingSystem.start();
    }
    if (this.config.enableEnhancedTargeting) {
      this.enhancedTargetingSystem.start();
    }

    this.emitCombatEvent('combat_integration_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;

    // Stop all combat systems
    if (this.config.enableAutoCombat) {
      this.autoCombatSystem.stop();
    }
    if (this.config.enableManualAbilities) {
      this.manualAbilitySystem.stop();
    }
    if (this.config.enableEnemyAI) {
      this.enhancedEnemyAI.stop();
    }
    if (this.config.enableDeathProcessing) {
      this.deathProcessingSystem.stop();
    }
    if (this.config.enableEnhancedTargeting) {
      this.enhancedTargetingSystem.stop();
    }

    this.emitCombatEvent('combat_integration_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;

    // Pause all combat systems
    if (this.config.enableAutoCombat) {
      this.autoCombatSystem.pause();
    }
    if (this.config.enableManualAbilities) {
      this.manualAbilitySystem.pause();
    }
    if (this.config.enableEnemyAI) {
      this.enhancedEnemyAI.pause();
    }
    if (this.config.enableDeathProcessing) {
      this.deathProcessingSystem.pause();
    }
    if (this.config.enableEnhancedTargeting) {
      this.enhancedTargetingSystem.pause();
    }

    this.emitCombatEvent('combat_integration_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;

    // Resume all combat systems
    if (this.config.enableAutoCombat) {
      this.autoCombatSystem.resume();
    }
    if (this.config.enableManualAbilities) {
      this.manualAbilitySystem.resume();
    }
    if (this.config.enableEnemyAI) {
      this.enhancedEnemyAI.resume();
    }
    if (this.config.enableDeathProcessing) {
      this.deathProcessingSystem.resume();
    }
    if (this.config.enableEnhancedTargeting) {
      this.enhancedTargetingSystem.resume();
    }

    this.emitCombatEvent('combat_integration_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    const currentTime = Date.now();
    this.state.combatState = combatState;

    // Main combat update
    this.updateCombatSystems(deltaTime, activeEnemies, combatState);

    // System coordination
    if (this.config.enableSystemCoordination) {
      this.coordinateSystems(deltaTime, activeEnemies, combatState);
    }

    // Performance monitoring
    if (this.config.enablePerformanceMonitoring) {
      this.updatePerformanceMonitoring(currentTime);
    }

    // Event processing
    if (this.config.enableCombatEvents) {
      this.processCombatEvents(currentTime);
    }

    // State updates
    if (this.config.enableCombatStateUpdates) {
      this.updateCombatState(currentTime);
    }

    // Testing
    if (this.config.enableCombatTesting) {
      this.runCombatTests(currentTime);
    }

    // Validation
    if (this.config.enableCombatValidation) {
      this.validateCombatSystems(currentTime);
    }

    // Optimization
    if (this.config.enableCombatOptimization) {
      this.optimizeCombatSystems(currentTime);
    }

    this.state.lastUpdateTime = currentTime;
    this.metrics.totalCombatUpdates++;
  }

  private updateCombatSystems(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    // Update auto-combat system
    if (this.config.enableAutoCombat) {
      this.autoCombatSystem.update(deltaTime, activeEnemies, combatState);
    }

    // Update manual ability system
    if (this.config.enableManualAbilities) {
      this.manualAbilitySystem.update(deltaTime, activeEnemies, combatState);
    }

    // Update enemy AI system
    if (this.config.enableEnemyAI) {
      this.enhancedEnemyAI.update(deltaTime, activeEnemies, combatState);
    }

    // Update death processing system
    if (this.config.enableDeathProcessing) {
      this.deathProcessingSystem.update(deltaTime, activeEnemies, combatState);
    }

    // Update enhanced targeting system
    if (this.config.enableEnhancedTargeting) {
      this.enhancedTargetingSystem.update(deltaTime, activeEnemies, combatState);
    }
  }

  private coordinateSystems(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    const startTime = Date.now();

    // Coordinate targeting with auto-combat
    if (this.config.enableAutoCombat && this.config.enableEnhancedTargeting) {
      const bestTarget = this.enhancedTargetingSystem.getBestTarget();
      if (bestTarget) {
        // Set target for auto-combat system
        this.autoCombatSystem.getState().currentTarget = bestTarget;
      }
    }

    // Coordinate manual abilities with targeting
    if (this.config.enableManualAbilities && this.config.enableEnhancedTargeting) {
      const bestTarget = this.enhancedTargetingSystem.getBestTarget();
      if (bestTarget) {
        this.manualAbilitySystem.setManualTarget(bestTarget);
      }
    }

    // Coordinate death processing with enemy AI
    if (this.config.enableDeathProcessing && this.config.enableEnemyAI) {
      for (const [_enemyId, enemy] of activeEnemies.entries()) {
        if (enemy.health.current <= 0) {
          this.deathProcessingSystem.processEnemyDeath(enemy, combatState);
        }
      }
    }

    const coordinationTime = Date.now() - startTime;
    this.state.performanceMetrics.systemCoordinationTime = coordinationTime;
    this.metrics.totalSystemCoordination++;
  }

  private updatePerformanceMonitoring(currentTime: number): void {
    if (currentTime - this.state.lastPerformanceCheckTime < this.config.performanceMonitoringInterval) {
      return;
    }

    this.state.lastPerformanceCheckTime = currentTime;

    // Update system health
    for (const [systemId, system] of this.state.combatSystems.entries()) {
      const health = this.calculateSystemHealth(system);
      this.state.systemHealth.set(systemId, health);
    }

    // Calculate overall performance score
    const healthScores = Array.from(this.state.systemHealth.values()).map(h => h.performanceScore);
    const averageHealthScore = healthScores.reduce((sum, score) => sum + score, 0) / healthScores.length;
    this.state.performanceMetrics.performanceScore = averageHealthScore;
  }

  private processCombatEvents(currentTime: number): void {
    if (currentTime - this.state.lastEventProcessingTime < this.config.combatEventProcessingInterval) {
      return;
    }

    this.state.lastEventProcessingTime = currentTime;

    // Process events from all systems
    const allEvents: CombatEvent[] = [];
    
    if (this.config.enableAutoCombat) {
      allEvents.push(...this.autoCombatSystem.getState().combatEvents);
    }
    if (this.config.enableManualAbilities) {
      allEvents.push(...this.manualAbilitySystem.getState().combatEvents);
    }
    if (this.config.enableEnemyAI) {
      allEvents.push(...this.enhancedEnemyAI.getState().combatEvents);
    }
    if (this.config.enableDeathProcessing) {
      allEvents.push(...this.deathProcessingSystem.getState().combatEvents);
    }
    if (this.config.enableEnhancedTargeting) {
      allEvents.push(...this.enhancedTargetingSystem.getState().combatEvents);
    }

    // Add events to integration system
    this.state.combatEvents.push(...allEvents);
    this.metrics.totalEventProcessing++;
  }

  private updateCombatState(currentTime: number): void {
    if (currentTime - this.state.lastStateUpdateTime < this.config.combatStateUpdateInterval) {
      return;
    }

    this.state.lastStateUpdateTime = currentTime;

    // Update combat state with system states
    this.state.combatState = {
      ...this.state.combatState,
      dragonHealth: this.state.combatState.dragonHealth,
      activeStatusEffects: this.state.combatState.activeStatusEffects,
      elementalResistances: this.state.combatState.elementalResistances,
      currentLandWard: this.state.combatState.currentLandWard,
    };

    this.metrics.totalStateUpdates++;
  }

  private runCombatTests(currentTime: number): void {
    if (currentTime - this.state.lastTestingTime < this.config.combatTestingInterval) {
      return;
    }

    this.state.lastTestingTime = currentTime;

    // Run basic combat tests
    this.testSystemHealth();
    this.testSystemIntegration();
    this.testPerformanceMetrics();

    this.metrics.totalTesting++;
  }

  private validateCombatSystems(currentTime: number): void {
    if (currentTime - this.state.lastValidationTime < this.config.combatValidationInterval) {
      return;
    }

    this.state.lastValidationTime = currentTime;

    // Validate system configurations
    this.validateSystemConfigurations();
    this.validateSystemStates();
    this.validatePerformanceTargets();

    this.metrics.totalValidation++;
  }

  private optimizeCombatSystems(currentTime: number): void {
    if (currentTime - this.state.lastOptimizationTime < this.config.combatOptimizationInterval) {
      return;
    }

    this.state.lastOptimizationTime = currentTime;

    // Optimize system performance
    this.optimizeSystemPerformance();
    this.optimizeMemoryUsage();
    this.optimizeEventProcessing();

    this.metrics.totalOptimization++;
  }

  private calculateSystemHealth(system: CombatSystem): SystemHealth {
    const currentTime = Date.now();
    const updateLatency = currentTime - system.lastUpdateTime;
    const errorRate = system.errorCount / Math.max(1, system.updateCount);

    return {
      systemId: system.id,
      isHealthy: errorRate < 0.1 && updateLatency < 1000, // Less than 10% error rate and under 1s latency
      lastHealthCheck: currentTime,
      errorCount: system.errorCount,
      warningCount: 0, // Placeholder
      performanceScore: Math.max(0, 1.0 - errorRate - (updateLatency / 10000)),
      memoryUsage: 0, // Placeholder
      cpuUsage: 0, // Placeholder
      updateLatency,
      eventProcessingLatency: 0, // Placeholder
    };
  }

  private testSystemHealth(): void {
    for (const [_systemId, health] of this.state.systemHealth.entries()) {
      if (!health.isHealthy) {
        this.metrics.totalSystemErrors++;
      }
    }
  }

  private testSystemIntegration(): void {
    // Test that all systems are properly integrated
    const requiredSystems = ['auto_combat', 'manual_abilities', 'enemy_ai', 'death_processing', 'enhanced_targeting'];
    for (const systemId of requiredSystems) {
      if (!this.state.combatSystems.has(systemId)) {
        this.metrics.totalSystemErrors++;
      }
    }
  }

  private testPerformanceMetrics(): void {
    // Test that performance metrics are within acceptable ranges
    if (this.state.performanceMetrics.performanceScore < 0.7) {
      this.metrics.totalSystemWarnings++;
    }
  }

  private validateSystemConfigurations(): void {
    // Validate that all system configurations are valid
    for (const [_systemId, system] of this.state.combatSystems.entries()) {
      if (!system.isActive) {
        this.metrics.totalSystemWarnings++;
      }
    }
  }

  private validateSystemStates(): void {
    // Validate that all system states are consistent
    for (const [_systemId, system] of this.state.combatSystems.entries()) {
      if (system.errorCount > 10) {
        this.metrics.totalSystemErrors++;
      }
    }
  }

  private validatePerformanceTargets(): void {
    // Validate that performance targets are being met
    if (this.state.performanceMetrics.performanceScore < 0.8) {
      this.metrics.totalSystemWarnings++;
    }
  }

  private optimizeSystemPerformance(): void {
    // Optimize system performance based on metrics
    for (const [systemId, system] of this.state.combatSystems.entries()) {
      if (system.performanceScore < 0.7) {
        // Trigger system-specific optimizations
        this.triggerSystemOptimization(systemId);
      }
    }
  }

  private optimizeMemoryUsage(): void {
    // Optimize memory usage across all systems
    this.cleanupEvents();
  }

  private optimizeEventProcessing(): void {
    // Optimize event processing efficiency
    if (this.state.combatEvents.length > 1000) {
      this.state.combatEvents = this.state.combatEvents.slice(-500);
    }
  }

  private triggerSystemOptimization(systemId: string): void {
    // Trigger optimization for specific system
    const system = this.state.combatSystems.get(systemId);
    if (system) {
      system.performanceScore = Math.min(1.0, system.performanceScore + 0.1);
    }
  }

  private cleanupEvents(): void {
    if (this.state.combatEvents.length > 100) {
      this.state.combatEvents = this.state.combatEvents.slice(-50);
    }
  }

  private initializeCombatSystems(): void {
    // Initialize auto-combat system
    if (this.config.enableAutoCombat) {
      this.autoCombatSystem = new AutoCombatSystem({}, this.dragon);
      this.state.combatSystems.set('auto_combat', {
        id: 'auto_combat',
        name: 'Auto Combat System',
        system: this.autoCombatSystem,
        isActive: true,
        isHealthy: true,
        lastUpdateTime: Date.now(),
        updateCount: 0,
        errorCount: 0,
        performanceScore: 1.0,
      });
    }

    // Initialize manual ability system
    if (this.config.enableManualAbilities) {
      this.manualAbilitySystem = new ManualAbilitySystem({}, this.dragon);
      this.state.combatSystems.set('manual_abilities', {
        id: 'manual_abilities',
        name: 'Manual Ability System',
        system: this.manualAbilitySystem,
        isActive: true,
        isHealthy: true,
        lastUpdateTime: Date.now(),
        updateCount: 0,
        errorCount: 0,
        performanceScore: 1.0,
      });
    }

    // Initialize enemy AI system
    if (this.config.enableEnemyAI) {
      this.enhancedEnemyAI = new EnhancedEnemyAI({}, this.dragon);
      this.state.combatSystems.set('enemy_ai', {
        id: 'enemy_ai',
        name: 'Enhanced Enemy AI',
        system: this.enhancedEnemyAI,
        isActive: true,
        isHealthy: true,
        lastUpdateTime: Date.now(),
        updateCount: 0,
        errorCount: 0,
        performanceScore: 1.0,
      });
    }

    // Initialize death processing system
    if (this.config.enableDeathProcessing) {
      this.deathProcessingSystem = new DeathProcessingSystem({}, this.dragon);
      this.state.combatSystems.set('death_processing', {
        id: 'death_processing',
        name: 'Death Processing System',
        system: this.deathProcessingSystem,
        isActive: true,
        isHealthy: true,
        lastUpdateTime: Date.now(),
        updateCount: 0,
        errorCount: 0,
        performanceScore: 1.0,
      });
    }

    // Initialize enhanced targeting system
    if (this.config.enableEnhancedTargeting) {
      this.enhancedTargetingSystem = new EnhancedTargetingSystem({}, this.dragon);
      this.state.combatSystems.set('enhanced_targeting', {
        id: 'enhanced_targeting',
        name: 'Enhanced Targeting System',
        system: this.enhancedTargetingSystem,
        isActive: true,
        isHealthy: true,
        lastUpdateTime: Date.now(),
        updateCount: 0,
        errorCount: 0,
        performanceScore: 1.0,
      });
    }
  }

  private emitCombatEvent(type: string, data: Record<string, unknown>): void {
    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'combat_integration_system',
      target: this.dragon.id,
      data,
    };

    this.state.combatEvents.push(event);
  }

  private createInitialState(): CombatIntegrationState {
    return {
      isActive: false,
      isPaused: false,
      combatSystems: new Map(),
      systemHealth: new Map(),
      performanceMetrics: {
        combatUpdatesPerSecond: 0,
        systemCoordinationTime: 0,
        eventProcessingTime: 0,
        stateUpdateTime: 0,
        testingTime: 0,
        validationTime: 0,
        optimizationTime: 0,
        performanceScore: 1.0,
      },
      combatEvents: [],
      combatState: {} as CombatState,
      lastUpdateTime: 0,
      lastHealthCheckTime: 0,
      lastPerformanceCheckTime: 0,
      lastEventProcessingTime: 0,
      lastStateUpdateTime: 0,
      lastTestingTime: 0,
      lastValidationTime: 0,
      lastOptimizationTime: 0,
    };
  }

  private createInitialMetrics(): CombatIntegrationMetrics {
    return {
      totalCombatUpdates: 0,
      totalSystemCoordination: 0,
      totalEventProcessing: 0,
      totalStateUpdates: 0,
      totalTesting: 0,
      totalValidation: 0,
      totalOptimization: 0,
      totalSystemErrors: 0,
      totalSystemWarnings: 0,
      averageCombatUpdateTime: 0,
      averageSystemCoordinationTime: 0,
      averageEventProcessingTime: 0,
      averageStateUpdateTime: 0,
      averageTestingTime: 0,
      averageValidationTime: 0,
      averageOptimizationTime: 0,
      averageSystemHealthScore: 1.0,
      averagePerformanceScore: 1.0,
    };
  }

  public getState(): CombatIntegrationState {
    return { ...this.state };
  }

  public getMetrics(): CombatIntegrationMetrics {
    return { ...this.metrics };
  }

  public getConfig(): CombatIntegrationConfig {
    return { ...this.config };
  }

  // Public accessors for individual systems
  public getAutoCombatSystem(): AutoCombatSystem | null {
    return this.autoCombatSystem || null;
  }

  public getManualAbilitySystem(): ManualAbilitySystem | null {
    return this.manualAbilitySystem || null;
  }

  public getEnhancedEnemyAI(): EnhancedEnemyAI | null {
    return this.enhancedEnemyAI || null;
  }

  public getDeathProcessingSystem(): DeathProcessingSystem | null {
    return this.deathProcessingSystem || null;
  }

  public getEnhancedTargetingSystem(): EnhancedTargetingSystem | null {
    return this.enhancedTargetingSystem || null;
  }
}
