/**
 * Combat Testing System for Draconia Chronicles
 * 
 * Provides comprehensive testing, validation, and quality assurance for all combat systems.
 * Ensures combat balance, performance targets, and system integration are maintained.
 */

import type {
  Dragon,
  Enemy,
  CombatState,
  CombatEvent,
  ExtendedPerformance,
} from './types.js';
import { CombatIntegrationSystem } from './combat-integration-system.js';

export interface CombatTestingConfig {
  enableCombatTesting: boolean;
  enableAutomatedTesting: boolean;
  enableBalanceTesting: boolean;
  enablePerformanceTesting: boolean;
  enableIntegrationTesting: boolean;
  enableQualityGates: boolean;
  enableContinuousTesting: boolean;
  enableTestReporting: boolean;
  enableTestAnalytics: boolean;
  testingInterval: number; // How often to run tests (ms)
  balanceTestDuration: number; // How long to run balance tests (ms)
  performanceTestDuration: number; // How long to run performance tests (ms)
  integrationTestDuration: number; // How long to run integration tests (ms)
  qualityGateThreshold: number; // Minimum score to pass quality gates (0-1)
  performanceThreshold: number; // Performance threshold for optimization
}

export interface CombatTestingState {
  isActive: boolean;
  isPaused: boolean;
  currentTests: Map<string, TestExecution>;
  testResults: TestResult[];
  qualityGates: Map<string, QualityGate>;
  performanceBaselines: Map<string, PerformanceBaseline>;
  balanceMetrics: BalanceMetrics;
  performanceMetrics: PerformanceMetrics;
  integrationMetrics: IntegrationMetrics;
  testEvents: CombatEvent[];
  lastTestRun: number;
  lastBalanceTest: number;
  lastPerformanceTest: number;
  lastIntegrationTest: number;
  lastQualityGateCheck: number;
}

export interface TestExecution {
  testId: string;
  testType: 'balance' | 'performance' | 'integration' | 'quality_gate';
  startTime: number;
  endTime: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number; // 0-1
  results: TestResult[];
  errors: string[];
  warnings: string[];
}

export interface TestResult {
  testId: string;
  testName: string;
  testType: 'balance' | 'performance' | 'integration' | 'quality_gate';
  timestamp: number;
  status: 'passed' | 'failed' | 'warning';
  score: number; // 0-1
  metrics: Record<string, number>;
  details: string;
  recommendations: string[];
  duration: number;
}

export interface QualityGate {
  gateId: string;
  gateName: string;
  description: string;
  threshold: number; // 0-1
  currentScore: number; // 0-1
  status: 'passed' | 'failed' | 'warning';
  lastCheck: number;
  requirements: string[];
  metrics: Record<string, number>;
}

export interface PerformanceBaseline {
  metricName: string;
  baselineValue: number;
  currentValue: number;
  threshold: number;
  status: 'passed' | 'failed' | 'warning';
  lastUpdate: number;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface BalanceMetrics {
  autoCombatDamagePercentage: number; // Target: 70-80%
  manualAbilityDamagePercentage: number; // Target: 20% ±10%
  enemyDamagePercentage: number; // Target: 5%
  totalDamageContribution: number; // Should equal 100%
  balanceScore: number; // 0-1
  lastUpdate: number;
}

export interface PerformanceMetrics {
  frameRate: number; // Target: 60fps desktop, 40fps mobile
  frameTime: number; // Target: ≤16.67ms
  memoryUsage: number; // Target: <100MB
  cpuUsage: number; // Target: <50%
  enemyLimit: number; // Target: ≤200/400 enemies
  projectileLimit: number; // Target: ≤600 projectiles/s
  performanceScore: number; // 0-1
  lastUpdate: number;
}

export interface IntegrationMetrics {
  systemHealthScore: number; // 0-1
  eventLossRate: number; // Target: <1%
  systemFailureRate: number; // Target: <0.1%
  integrationScore: number; // 0-1
  lastUpdate: number;
}

export interface CombatTestingMetrics {
  totalTestsRun: number;
  totalTestsPassed: number;
  totalTestsFailed: number;
  totalTestsWarning: number;
  totalBalanceTests: number;
  totalPerformanceTests: number;
  totalIntegrationTests: number;
  totalQualityGateChecks: number;
  averageTestDuration: number;
  averageTestScore: number;
  averageBalanceScore: number;
  averagePerformanceScore: number;
  averageIntegrationScore: number;
  averageQualityGateScore: number;
  testSuccessRate: number;
  qualityGatePassRate: number;
}

export class CombatTestingSystem {
  private config: CombatTestingConfig;
  private state: CombatTestingState;
  private metrics: CombatTestingMetrics;
  private dragon: Dragon;
  private combatIntegrationSystem: CombatIntegrationSystem;

  constructor(config: Partial<CombatTestingConfig>, dragon: Dragon, combatIntegrationSystem: CombatIntegrationSystem) {
    this.config = {
      enableCombatTesting: true,
      enableAutomatedTesting: true,
      enableBalanceTesting: true,
      enablePerformanceTesting: true,
      enableIntegrationTesting: true,
      enableQualityGates: true,
      enableContinuousTesting: true,
      enableTestReporting: true,
      enableTestAnalytics: true,
      testingInterval: 1000, // 1 second
      balanceTestDuration: 10000, // 10 seconds
      performanceTestDuration: 5000, // 5 seconds
      integrationTestDuration: 3000, // 3 seconds
      qualityGateThreshold: 0.7, // 70%
      performanceThreshold: 100,
      ...config,
    };

    this.dragon = dragon;
    this.combatIntegrationSystem = combatIntegrationSystem;
    this.state = this.createInitialState();
    this.metrics = this.createInitialMetrics();
    this.initializeQualityGates();
  }

  public start(): void {
    this.state.isActive = true;
    this.state.isPaused = false;
    this.emitTestEvent('combat_testing_started', { dragonId: this.dragon.id });
  }

  public stop(): void {
    this.state.isActive = false;
    this.state.isPaused = false;
    this.state.currentTests.clear();
    this.emitTestEvent('combat_testing_stopped', { dragonId: this.dragon.id });
  }

  public pause(): void {
    this.state.isPaused = true;
    this.emitTestEvent('combat_testing_paused', { dragonId: this.dragon.id });
  }

  public resume(): void {
    this.state.isPaused = false;
    this.emitTestEvent('combat_testing_resumed', { dragonId: this.dragon.id });
  }

  public update(deltaTime: number, activeEnemies: Map<string, Enemy>, combatState: CombatState): void {
    if (!this.state.isActive || this.state.isPaused) {
      return;
    }

    const currentTime = Date.now();

    // Run automated tests
    if (this.config.enableAutomatedTesting) {
      this.runAutomatedTests(currentTime, activeEnemies, combatState);
    }

    // Update metrics
    this.updateBalanceMetrics(activeEnemies, combatState);
    this.updatePerformanceMetrics(currentTime);
    this.updateIntegrationMetrics(currentTime);

    // Check quality gates
    if (this.config.enableQualityGates) {
      this.checkQualityGates(currentTime);
    }

    // Cleanup old test results
    this.cleanupTestResults();
  }

  public runBalanceTest(): TestResult {
    const testId = `balance_test_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Test auto-combat damage contribution (target: 70-80%)
      const autoCombatDamage = this.measureAutoCombatDamage();
      const autoCombatPercentage = (autoCombatDamage / this.getTotalDamage()) * 100;
      const autoCombatScore = this.calculateBalanceScore(autoCombatPercentage, 70, 80);

      // Test manual ability damage contribution (target: 20% ±10%)
      const manualAbilityDamage = this.measureManualAbilityDamage();
      const manualAbilityPercentage = (manualAbilityDamage / this.getTotalDamage()) * 100;
      const manualAbilityScore = this.calculateBalanceScore(manualAbilityPercentage, 10, 30); // 20% ±10%

      // Test enemy damage contribution (target: 5%)
      const enemyDamage = this.measureEnemyDamage();
      const enemyPercentage = (enemyDamage / this.getTotalDamage()) * 100;
      const enemyScore = this.calculateBalanceScore(enemyPercentage, 0, 10);

      // Calculate overall balance score
      const overallScore = (autoCombatScore + manualAbilityScore + enemyScore) / 3;

      const result: TestResult = {
        testId,
        testName: 'Combat Balance Test',
        testType: 'balance',
        timestamp: startTime,
        status: overallScore >= this.config.qualityGateThreshold ? 'passed' : 'failed',
        score: overallScore,
        metrics: {
          autoCombatPercentage,
          manualAbilityPercentage,
          enemyPercentage,
          autoCombatScore,
          manualAbilityScore,
          enemyScore,
        },
        details: `Auto-combat: ${autoCombatPercentage.toFixed(1)}%, Manual: ${manualAbilityPercentage.toFixed(1)}%, Enemy: ${enemyPercentage.toFixed(1)}%`,
        recommendations: this.generateBalanceRecommendations(autoCombatPercentage, manualAbilityPercentage, enemyPercentage),
        duration: Date.now() - startTime,
      };

      this.state.testResults.push(result);
      this.metrics.totalBalanceTests++;
      return result;

    } catch (error) {
      const result: TestResult = {
        testId,
        testName: 'Combat Balance Test',
        testType: 'balance',
        timestamp: startTime,
        status: 'failed',
        score: 0,
        metrics: {},
        details: `Test failed: ${error}`,
        recommendations: ['Fix balance test implementation'],
        duration: Date.now() - startTime,
      };

      this.state.testResults.push(result);
      this.metrics.totalBalanceTests++;
      return result;
    }
  }

  public runPerformanceTest(): TestResult {
    const testId = `performance_test_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Test frame rate (target: 60fps desktop, 40fps mobile)
      const frameRate = this.measureFrameRate();
      const frameRateScore = this.calculatePerformanceScore(frameRate, 40, 60);

      // Test frame time (target: ≤16.67ms)
      const frameTime = this.measureFrameTime();
      const frameTimeScore = this.calculatePerformanceScore(16.67 - frameTime, 0, 16.67);

      // Test memory usage (target: <100MB)
      const memoryUsage = this.measureMemoryUsage();
      const memoryScore = this.calculatePerformanceScore(100 - memoryUsage, 0, 100);

      // Test enemy limit (target: ≤200/400 enemies)
      const enemyCount = this.measureEnemyCount();
      const enemyScore = this.calculatePerformanceScore(400 - enemyCount, 0, 400);

      // Calculate overall performance score
      const overallScore = (frameRateScore + frameTimeScore + memoryScore + enemyScore) / 4;

      const result: TestResult = {
        testId,
        testName: 'Combat Performance Test',
        testType: 'performance',
        timestamp: startTime,
        status: overallScore >= this.config.qualityGateThreshold ? 'passed' : 'failed',
        score: overallScore,
        metrics: {
          frameRate,
          frameTime,
          memoryUsage,
          enemyCount,
          frameRateScore,
          frameTimeScore,
          memoryScore,
          enemyScore,
        },
        details: `FPS: ${frameRate.toFixed(1)}, Frame Time: ${frameTime.toFixed(2)}ms, Memory: ${memoryUsage.toFixed(1)}MB, Enemies: ${enemyCount}`,
        recommendations: this.generatePerformanceRecommendations(frameRate, frameTime, memoryUsage, enemyCount),
        duration: Date.now() - startTime,
      };

      this.state.testResults.push(result);
      this.metrics.totalPerformanceTests++;
      return result;

    } catch (error) {
      const result: TestResult = {
        testId,
        testName: 'Combat Performance Test',
        testType: 'performance',
        timestamp: startTime,
        status: 'failed',
        score: 0,
        metrics: {},
        details: `Test failed: ${error}`,
        recommendations: ['Fix performance test implementation'],
        duration: Date.now() - startTime,
      };

      this.state.testResults.push(result);
      this.metrics.totalPerformanceTests++;
      return result;
    }
  }

  public runIntegrationTest(): TestResult {
    const testId = `integration_test_${Date.now()}`;
    const startTime = Date.now();

    try {
      // Test system health
      const systemHealth = this.measureSystemHealth();
      const systemHealthScore = systemHealth;

      // Test event loss rate (target: <1%)
      const eventLossRate = this.measureEventLossRate();
      const eventLossScore = this.calculatePerformanceScore(1 - eventLossRate, 0, 1);

      // Test system failure rate (target: <0.1%)
      const systemFailureRate = this.measureSystemFailureRate();
      const systemFailureScore = this.calculatePerformanceScore(0.1 - systemFailureRate, 0, 0.1);

      // Calculate overall integration score
      const overallScore = (systemHealthScore + eventLossScore + systemFailureScore) / 3;

      const result: TestResult = {
        testId,
        testName: 'Combat Integration Test',
        testType: 'integration',
        timestamp: startTime,
        status: overallScore >= this.config.qualityGateThreshold ? 'passed' : 'failed',
        score: overallScore,
        metrics: {
          systemHealth,
          eventLossRate,
          systemFailureRate,
          systemHealthScore,
          eventLossScore,
          systemFailureScore,
        },
        details: `System Health: ${(systemHealth * 100).toFixed(1)}%, Event Loss: ${(eventLossRate * 100).toFixed(2)}%, System Failures: ${(systemFailureRate * 100).toFixed(3)}%`,
        recommendations: this.generateIntegrationRecommendations(systemHealth, eventLossRate, systemFailureRate),
        duration: Date.now() - startTime,
      };

      this.state.testResults.push(result);
      this.metrics.totalIntegrationTests++;
      return result;

    } catch (error) {
      const result: TestResult = {
        testId,
        testName: 'Combat Integration Test',
        testType: 'integration',
        timestamp: startTime,
        status: 'failed',
        score: 0,
        metrics: {},
        details: `Test failed: ${error}`,
        recommendations: ['Fix integration test implementation'],
        duration: Date.now() - startTime,
      };

      this.state.testResults.push(result);
      this.metrics.totalIntegrationTests++;
      return result;
    }
  }

  private runAutomatedTests(currentTime: number, _activeEnemies: Map<string, Enemy>, _combatState: CombatState): void {
    // Run balance tests
    if (this.config.enableBalanceTesting && currentTime - this.state.lastBalanceTest >= this.config.balanceTestDuration) {
      this.runBalanceTest();
      this.state.lastBalanceTest = currentTime;
    }

    // Run performance tests
    if (this.config.enablePerformanceTesting && currentTime - this.state.lastPerformanceTest >= this.config.performanceTestDuration) {
      this.runPerformanceTest();
      this.state.lastPerformanceTest = currentTime;
    }

    // Run integration tests
    if (this.config.enableIntegrationTesting && currentTime - this.state.lastIntegrationTest >= this.config.integrationTestDuration) {
      this.runIntegrationTest();
      this.state.lastIntegrationTest = currentTime;
    }
  }

  private updateBalanceMetrics(_activeEnemies: Map<string, Enemy>, _combatState: CombatState): void {
    const currentTime = Date.now();
    
    // Update balance metrics
    this.state.balanceMetrics.autoCombatDamagePercentage = this.measureAutoCombatDamagePercentage();
    this.state.balanceMetrics.manualAbilityDamagePercentage = this.measureManualAbilityDamagePercentage();
    this.state.balanceMetrics.enemyDamagePercentage = this.measureEnemyDamagePercentage();
    this.state.balanceMetrics.totalDamageContribution = 
      this.state.balanceMetrics.autoCombatDamagePercentage + 
      this.state.balanceMetrics.manualAbilityDamagePercentage + 
      this.state.balanceMetrics.enemyDamagePercentage;
    
    // Calculate balance score
    const autoCombatScore = this.calculateBalanceScore(this.state.balanceMetrics.autoCombatDamagePercentage, 70, 80);
    const manualAbilityScore = this.calculateBalanceScore(this.state.balanceMetrics.manualAbilityDamagePercentage, 10, 30);
    const enemyScore = this.calculateBalanceScore(this.state.balanceMetrics.enemyDamagePercentage, 0, 10);
    this.state.balanceMetrics.balanceScore = (autoCombatScore + manualAbilityScore + enemyScore) / 3;
    
    this.state.balanceMetrics.lastUpdate = currentTime;
  }

  private updatePerformanceMetrics(_currentTime: number): void {
    // Update performance metrics
    this.state.performanceMetrics.frameRate = this.measureFrameRate();
    this.state.performanceMetrics.frameTime = this.measureFrameTime();
    this.state.performanceMetrics.memoryUsage = this.measureMemoryUsage();
    this.state.performanceMetrics.enemyLimit = this.measureEnemyCount();
    this.state.performanceMetrics.projectileLimit = this.measureProjectileCount();
    
    // Calculate performance score
    const frameRateScore = this.calculatePerformanceScore(this.state.performanceMetrics.frameRate, 40, 60);
    const frameTimeScore = this.calculatePerformanceScore(16.67 - this.state.performanceMetrics.frameTime, 0, 16.67);
    const memoryScore = this.calculatePerformanceScore(100 - this.state.performanceMetrics.memoryUsage, 0, 100);
    const enemyScore = this.calculatePerformanceScore(400 - this.state.performanceMetrics.enemyLimit, 0, 400);
    
    this.state.performanceMetrics.performanceScore = (frameRateScore + frameTimeScore + memoryScore + enemyScore) / 4;
    this.state.performanceMetrics.lastUpdate = Date.now();
  }

  private updateIntegrationMetrics(_currentTime: number): void {
    // Update integration metrics
    this.state.integrationMetrics.systemHealthScore = this.measureSystemHealth();
    this.state.integrationMetrics.eventLossRate = this.measureEventLossRate();
    this.state.integrationMetrics.systemFailureRate = this.measureSystemFailureRate();
    
    // Calculate integration score
    const systemHealthScore = this.state.integrationMetrics.systemHealthScore;
    const eventLossScore = this.calculatePerformanceScore(1 - this.state.integrationMetrics.eventLossRate, 0, 1);
    const systemFailureScore = this.calculatePerformanceScore(0.1 - this.state.integrationMetrics.systemFailureRate, 0, 0.1);
    
    this.state.integrationMetrics.integrationScore = (systemHealthScore + eventLossScore + systemFailureScore) / 3;
    this.state.integrationMetrics.lastUpdate = Date.now();
  }

  private checkQualityGates(currentTime: number): void {
    if (currentTime - this.state.lastQualityGateCheck < this.config.testingInterval) {
      return;
    }

    this.state.lastQualityGateCheck = currentTime;

    // Check balance quality gate
    const balanceGate = this.state.qualityGates.get('balance');
    if (balanceGate) {
      balanceGate.currentScore = this.state.balanceMetrics.balanceScore;
      balanceGate.status = balanceGate.currentScore >= balanceGate.threshold ? 'passed' : 'failed';
      balanceGate.lastCheck = currentTime;
    }

    // Check performance quality gate
    const performanceGate = this.state.qualityGates.get('performance');
    if (performanceGate) {
      performanceGate.currentScore = this.state.performanceMetrics.performanceScore;
      performanceGate.status = performanceGate.currentScore >= performanceGate.threshold ? 'passed' : 'failed';
      performanceGate.lastCheck = currentTime;
    }

    // Check integration quality gate
    const integrationGate = this.state.qualityGates.get('integration');
    if (integrationGate) {
      integrationGate.currentScore = this.state.integrationMetrics.integrationScore;
      integrationGate.status = integrationGate.currentScore >= integrationGate.threshold ? 'passed' : 'failed';
      integrationGate.lastCheck = currentTime;
    }

    this.metrics.totalQualityGateChecks++;
  }

  // Measurement methods (placeholders - would be implemented with actual metrics)
  private measureAutoCombatDamage(): number {
    const autoCombatSystem = this.combatIntegrationSystem.getAutoCombatSystem();
    return autoCombatSystem ? autoCombatSystem.getMetrics().totalDamage : 0;
  }

  private measureManualAbilityDamage(): number {
    const manualAbilitySystem = this.combatIntegrationSystem.getManualAbilitySystem();
    return manualAbilitySystem ? manualAbilitySystem.getMetrics().totalDamageDealt : 0;
  }

  private measureEnemyDamage(): number {
    const enemyAI = this.combatIntegrationSystem.getEnhancedEnemyAI();
    return enemyAI ? enemyAI.getMetrics().totalAttacks * 10 : 0; // Placeholder calculation
  }

  private getTotalDamage(): number {
    return this.measureAutoCombatDamage() + this.measureManualAbilityDamage() + this.measureEnemyDamage();
  }

  private measureAutoCombatDamagePercentage(): number {
    const total = this.getTotalDamage();
    return total > 0 ? (this.measureAutoCombatDamage() / total) * 100 : 0;
  }

  private measureManualAbilityDamagePercentage(): number {
    const total = this.getTotalDamage();
    return total > 0 ? (this.measureManualAbilityDamage() / total) * 100 : 0;
  }

  private measureEnemyDamagePercentage(): number {
    const total = this.getTotalDamage();
    return total > 0 ? (this.measureEnemyDamage() / total) * 100 : 0;
  }

  private measureFrameRate(): number {
    // Placeholder - would measure actual frame rate
    return 60;
  }

  private measureFrameTime(): number {
    // Placeholder - would measure actual frame time
    return 16.67;
  }

  private measureMemoryUsage(): number {
    // Placeholder - would measure actual memory usage
    if (typeof performance !== 'undefined' && (performance as unknown as ExtendedPerformance).memory) {
      const memory = (performance as unknown as ExtendedPerformance).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 50; // Placeholder
  }

  private measureEnemyCount(): number {
    // Placeholder - would count actual enemies
    return 100;
  }

  private measureProjectileCount(): number {
    // Placeholder - would count actual projectiles
    return 200;
  }

  private measureSystemHealth(): number {
    const integrationState = this.combatIntegrationSystem.getState();
    return integrationState.performanceMetrics.performanceScore;
  }

  private measureEventLossRate(): number {
    // Placeholder - would measure actual event loss rate
    return 0.001; // 0.1%
  }

  private measureSystemFailureRate(): number {
    // Placeholder - would measure actual system failure rate
    return 0.0001; // 0.01%
  }

  private calculateBalanceScore(value: number, min: number, max: number): number {
    if (value < min || value > max) {
      return Math.max(0, 1 - Math.abs(value - (min + max) / 2) / ((max - min) / 2));
    }
    return 1.0;
  }

  private calculatePerformanceScore(value: number, min: number, max: number): number {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  private generateBalanceRecommendations(autoCombat: number, manualAbility: number, enemy: number): string[] {
    const recommendations: string[] = [];

    if (autoCombat < 70) {
      recommendations.push('Increase auto-combat damage contribution');
    } else if (autoCombat > 80) {
      recommendations.push('Decrease auto-combat damage contribution');
    }

    if (manualAbility < 10) {
      recommendations.push('Increase manual ability damage contribution');
    } else if (manualAbility > 30) {
      recommendations.push('Decrease manual ability damage contribution');
    }

    if (enemy > 10) {
      recommendations.push('Decrease enemy damage contribution');
    }

    return recommendations;
  }

  private generatePerformanceRecommendations(frameRate: number, frameTime: number, memoryUsage: number, enemyCount: number): string[] {
    const recommendations: string[] = [];

    if (frameRate < 40) {
      recommendations.push('Optimize rendering performance');
    }

    if (frameTime > 16.67) {
      recommendations.push('Reduce frame processing time');
    }

    if (memoryUsage > 100) {
      recommendations.push('Optimize memory usage');
    }

    if (enemyCount > 400) {
      recommendations.push('Implement enemy culling');
    }

    return recommendations;
  }

  private generateIntegrationRecommendations(systemHealth: number, eventLossRate: number, systemFailureRate: number): string[] {
    const recommendations: string[] = [];

    if (systemHealth < 0.8) {
      recommendations.push('Improve system health monitoring');
    }

    if (eventLossRate > 0.01) {
      recommendations.push('Optimize event processing');
    }

    if (systemFailureRate > 0.001) {
      recommendations.push('Improve error handling');
    }

    return recommendations;
  }

  private initializeQualityGates(): void {
    // Balance quality gate
    this.state.qualityGates.set('balance', {
      gateId: 'balance',
      gateName: 'Combat Balance',
      description: 'Ensures proper damage contribution balance between auto-combat, manual abilities, and enemies',
      threshold: 0.7,
      currentScore: 0,
      status: 'failed',
      lastCheck: 0,
      requirements: ['Auto-combat: 70-80%', 'Manual abilities: 20% ±10%', 'Enemies: ≤5%'],
      metrics: {},
    });

    // Performance quality gate
    this.state.qualityGates.set('performance', {
      gateId: 'performance',
      gateName: 'Combat Performance',
      description: 'Ensures combat systems meet performance targets',
      threshold: 0.7,
      currentScore: 0,
      status: 'failed',
      lastCheck: 0,
      requirements: ['Frame rate: ≥40fps', 'Frame time: ≤16.67ms', 'Memory: <100MB', 'Enemies: ≤400'],
      metrics: {},
    });

    // Integration quality gate
    this.state.qualityGates.set('integration', {
      gateId: 'integration',
      gateName: 'System Integration',
      description: 'Ensures all combat systems work together properly',
      threshold: 0.7,
      currentScore: 0,
      status: 'failed',
      lastCheck: 0,
      requirements: ['System health: ≥80%', 'Event loss: <1%', 'System failures: <0.1%'],
      metrics: {},
    });
  }

  private cleanupTestResults(): void {
    // Keep only the last 100 test results
    if (this.state.testResults.length > 100) {
      this.state.testResults = this.state.testResults.slice(-100);
    }
  }

  private emitTestEvent(type: string, data: Record<string, unknown>): void {
    const event: CombatEvent = {
      type: type as CombatEvent['type'],
      timestamp: Date.now(),
      source: 'combat_testing_system',
      target: this.dragon.id,
      data,
    };

    this.state.testEvents.push(event);
  }

  private createInitialState(): CombatTestingState {
    return {
      isActive: false,
      isPaused: false,
      currentTests: new Map(),
      testResults: [],
      qualityGates: new Map(),
      performanceBaselines: new Map(),
      balanceMetrics: {
        autoCombatDamagePercentage: 0,
        manualAbilityDamagePercentage: 0,
        enemyDamagePercentage: 0,
        totalDamageContribution: 0,
        balanceScore: 0,
        lastUpdate: 0,
      },
      performanceMetrics: {
        frameRate: 0,
        frameTime: 0,
        memoryUsage: 0,
        cpuUsage: 0,
        enemyLimit: 0,
        projectileLimit: 0,
        performanceScore: 0,
        lastUpdate: 0,
      },
      integrationMetrics: {
        systemHealthScore: 0,
        eventLossRate: 0,
        systemFailureRate: 0,
        integrationScore: 0,
        lastUpdate: 0,
      },
      testEvents: [],
      lastTestRun: 0,
      lastBalanceTest: 0,
      lastPerformanceTest: 0,
      lastIntegrationTest: 0,
      lastQualityGateCheck: 0,
    };
  }

  private createInitialMetrics(): CombatTestingMetrics {
    return {
      totalTestsRun: 0,
      totalTestsPassed: 0,
      totalTestsFailed: 0,
      totalTestsWarning: 0,
      totalBalanceTests: 0,
      totalPerformanceTests: 0,
      totalIntegrationTests: 0,
      totalQualityGateChecks: 0,
      averageTestDuration: 0,
      averageTestScore: 0,
      averageBalanceScore: 0,
      averagePerformanceScore: 0,
      averageIntegrationScore: 0,
      averageQualityGateScore: 0,
      testSuccessRate: 0,
      qualityGatePassRate: 0,
    };
  }

  public getState(): CombatTestingState {
    return { ...this.state };
  }

  public getMetrics(): CombatTestingMetrics {
    return { ...this.metrics };
  }

  public getConfig(): CombatTestingConfig {
    return { ...this.config };
  }

  public getQualityGates(): Map<string, QualityGate> {
    return new Map(this.state.qualityGates);
  }

  public getTestResults(): TestResult[] {
    return [...this.state.testResults];
  }

  public getLatestTestResult(): TestResult | null {
    return this.state.testResults.length > 0 ? this.state.testResults[this.state.testResults.length - 1] || null : null;
  }
}
