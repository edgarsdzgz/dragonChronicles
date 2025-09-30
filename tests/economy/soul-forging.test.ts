/**
 * Comprehensive test suite for the Enhanced Soul Forging System.
 * This file covers unit tests for SoulForgingManager, SoulForgingCosts,
 * SoulForgingPersistence, SoulForgingAnalytics, and integration scenarios.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createEnhancedSoulForgingSystem,
  type EnhancedSoulForgingSystem,
} from '../../packages/sim/src/economy/soul-forging-manager.js';
import {
  createSoulForgingCostOptimizer,
  type SoulForgingCostOptimizer,
} from '../../packages/sim/src/economy/soul-forging-costs.js';
import {
  createSoulForgingPersistenceManager,
  type SoulForgingPersistenceManager,
} from '../../packages/sim/src/economy/soul-forging-persistence.js';
import {
  createSoulForgingAnalyticsEngine,
  type SoulForgingAnalyticsEngine,
} from '../../packages/sim/src/economy/soul-forging-analytics.js';
import type { EnchantConfig } from '../../packages/sim/src/economy/enchant-types.js';

// Mock localStorage for tests
const mockLocalStorage = {
  store: new Map<string, string>(),
  length: 0,
  key: (index: number) => {
    const keys = Array.from(mockLocalStorage.store.keys());
    return keys[index] || null;
  },
  getItem: (key: string) => mockLocalStorage.store.get(key) || null,
  setItem: (key: string, value: string) => {
    mockLocalStorage.store.set(key, value);
    mockLocalStorage.length = mockLocalStorage.store.size;
  },
  removeItem: (key: string) => {
    mockLocalStorage.store.delete(key);
    mockLocalStorage.length = mockLocalStorage.store.size;
  },
  clear: () => {
    mockLocalStorage.store.clear();
    mockLocalStorage.length = 0;
  },
};

// Mock localStorage globally
Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('Enhanced Soul Forging System', () => {
  let soulForgingSystem: EnhancedSoulForgingSystem;
  let costOptimizer: SoulForgingCostOptimizer;
  let persistenceManager: SoulForgingPersistenceManager;
  let analyticsEngine: SoulForgingAnalyticsEngine;
  let config: EnchantConfig;

  beforeEach(() => {
    // Clear mock localStorage before each test
    mockLocalStorage.clear();

    config = {
      baseCosts: {
        firepower: 10,
        scales: 10,
      },
      growthRate: 1.12,
      baseCap: 100,
      soulForgingMultiplier: 60,
      temporarySoulForgingCost: 20,
      permanentSoulForgingCost: 5000,
    };

    soulForgingSystem = createEnhancedSoulForgingSystem(config);
    costOptimizer = createSoulForgingCostOptimizer(config);
    persistenceManager = createSoulForgingPersistenceManager();
    analyticsEngine = createSoulForgingAnalyticsEngine();
  });

  describe('Enhanced Soul Forging Manager', () => {
    it('should initialize with zero levels', () => {
      expect(soulForgingSystem.temporaryLevels).toBe(0);
      expect(soulForgingSystem.permanentLevels).toBe(0);
      expect(soulForgingSystem.totalCapExtension).toBe(0);
    });

    it('should handle temporary Soul Forging purchases', () => {
      const transaction = soulForgingSystem.purchaseTemporarySoulForging(1, 1000000);
      expect(transaction.success).toBe(true);
      expect(soulForgingSystem.temporaryLevels).toBe(1);
      expect(soulForgingSystem.totalCapExtension).toBe(60);
    });

    it('should handle permanent Soul Forging purchases', () => {
      const transaction = soulForgingSystem.purchasePermanentSoulForging(1, 1000000);
      expect(transaction.success).toBe(true);
      expect(soulForgingSystem.permanentLevels).toBe(1);
      expect(soulForgingSystem.totalCapExtension).toBe(60);
    });

    it('should track milestones and achievements', () => {
      soulForgingSystem.purchaseTemporarySoulForging(1, 1000000);
      const milestones = soulForgingSystem.getSoulForgingMilestones();
      expect(milestones.length).toBeGreaterThan(0);
      expect(milestones[0].achieved).toBe(true);
    });

    it('should provide analytics', () => {
      soulForgingSystem.purchaseTemporarySoulForging(2, 1000000);
      soulForgingSystem.purchasePermanentSoulForging(1, 1000000);

      const analytics = soulForgingSystem.getSoulForgingAnalytics();
      expect(analytics.totalPurchases).toBe(2);
      expect(analytics.totalArcanaSpent).toBeGreaterThan(0);
      expect(analytics.totalSoulPowerSpent).toBeGreaterThan(0);
    });

    it('should calculate optimal Soul Forging', () => {
      const recommendation = soulForgingSystem.calculateOptimalSoulForging(10000, 'temporary');
      expect(recommendation.type).toBe('temporary');
      expect(recommendation.amount).toBeGreaterThan(0);
      expect(recommendation.cost).toBeGreaterThan(0);
      expect(recommendation.efficiency).toBeGreaterThan(0);
    });

    it('should validate Soul Forging progression', () => {
      const validation = soulForgingSystem.validateSoulForgingProgression();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should save and load state', () => {
      soulForgingSystem.purchaseTemporarySoulForging(2, 1000000);
      const state = soulForgingSystem.saveState();

      const newSystem = createEnhancedSoulForgingSystem(config);
      const loaded = newSystem.loadState(state);

      expect(loaded).toBe(true);
      expect(newSystem.temporaryLevels).toBe(2);
    });

    it('should reset temporary Soul Forging', () => {
      soulForgingSystem.purchaseTemporarySoulForging(3, 1000000);
      expect(soulForgingSystem.temporaryLevels).toBe(3);

      soulForgingSystem.resetTemporarySoulForging();
      expect(soulForgingSystem.temporaryLevels).toBe(0);
    });
  });

  describe('Soul Forging Cost Optimizer', () => {
    it('should calculate optimal purchase', () => {
      const prediction = costOptimizer.calculateOptimalPurchase(10000, 'temporary', 0);
      expect(prediction.level).toBeGreaterThan(0);
      expect(prediction.cost).toBeGreaterThan(0);
      expect(prediction.efficiency).toBeGreaterThan(0);
      expect(['buy', 'wait', 'optimize']).toContain(prediction.recommendation);
    });

    it('should calculate bulk purchase', () => {
      const bulkPurchase = costOptimizer.calculateBulkPurchase(5, 'temporary', 0);
      expect(bulkPurchase.amount).toBe(5);
      expect(bulkPurchase.totalCost).toBeGreaterThan(0);
      expect(bulkPurchase.averageCostPerLevel).toBeGreaterThan(0);
      expect(bulkPurchase.savings).toBeGreaterThanOrEqual(0);
    });

    it('should calculate cost progression', () => {
      const progression = costOptimizer.calculateCostProgression(0, 5, 'temporary');
      expect(progression.baseCost).toBeGreaterThan(0);
      expect(progression.finalCost).toBeGreaterThan(0);
      expect(progression.costPerLevel).toBeGreaterThan(0);
    });

    it('should get cost efficiency', () => {
      const efficiency = costOptimizer.getCostEfficiency('temporary', 5);
      expect(efficiency).toBeGreaterThan(0);
    });
  });

  describe('Soul Forging Persistence', () => {
    it('should save and load state', async () => {
      const state = soulForgingSystem.saveState();
      const saved = await persistenceManager.saveState('test', state);
      expect(saved).toBe(true);

      const loaded = await persistenceManager.loadState('test');
      expect(loaded).not.toBeNull();
      expect(loaded?.temporaryLevels).toBe(state.temporaryLevels);
      expect(loaded?.permanentLevels).toBe(state.permanentLevels);
    });

    it('should validate state', () => {
      const state = soulForgingSystem.saveState();
      const validation = persistenceManager.validateState(state);
      expect(validation.valid).toBe(true);
      expect(validation.errors).toEqual([]);
    });

    it('should repair invalid state', () => {
      const invalidState = {
        temporaryLevels: -1,
        permanentLevels: -1,
        totalPurchases: -1,
        totalArcanaSpent: -1,
        totalSoulPowerSpent: -1,
        milestones: null as any,
        achievements: null as any,
        lastUpdated: -1,
        version: '',
      };

      const repaired = persistenceManager.repairState(invalidState);
      expect(repaired.temporaryLevels).toBe(0);
      expect(repaired.permanentLevels).toBe(0);
      expect(repaired.totalPurchases).toBe(0);
      expect(Array.isArray(repaired.milestones)).toBe(true);
      expect(Array.isArray(repaired.achievements)).toBe(true);
    });

    it('should list saved states', async () => {
      const state = soulForgingSystem.saveState();
      await persistenceManager.saveState('test1', state);
      await persistenceManager.saveState('test2', state);

      const states = await persistenceManager.listStates();
      expect(states).toContain('test1');
      expect(states).toContain('test2');
    });

    it('should delete saved state', async () => {
      const state = soulForgingSystem.saveState();
      await persistenceManager.saveState('test', state);

      const deleted = await persistenceManager.deleteState('test');
      expect(deleted).toBe(true);

      const loaded = await persistenceManager.loadState('test');
      expect(loaded).toBeNull();
    });
  });

  describe('Soul Forging Analytics', () => {
    it('should analyze Soul Forging state', () => {
      soulForgingSystem.purchaseTemporarySoulForging(3, 1000000);
      soulForgingSystem.purchasePermanentSoulForging(2, 1000000);

      const state = soulForgingSystem.saveState();
      const analytics = analyticsEngine.analyze(state);

      expect(analytics.progression.currentLevel).toBe(5);
      expect(analytics.costs.totalSpent).toBeGreaterThan(0);
      expect(analytics.performance.totalPurchases).toBe(2);
    });

    it('should generate analytics report', () => {
      soulForgingSystem.purchaseTemporarySoulForging(2, 1000000);
      const state = soulForgingSystem.saveState();

      const report = analyticsEngine.generateReport(state);
      expect(report.summary).toBeDefined();
      expect(report.keyMetrics).toBeDefined();
      expect(report.insights).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    it('should get progression analytics', () => {
      soulForgingSystem.purchaseTemporarySoulForging(5, 1000000);
      const state = soulForgingSystem.saveState();

      const progression = analyticsEngine.getProgressionAnalytics(state);
      expect(progression.currentLevel).toBe(5);
      expect(progression.totalLevels).toBe(5);
      expect(progression.milestonesAchieved).toBeGreaterThan(0);
    });

    it('should get cost analytics', () => {
      soulForgingSystem.purchaseTemporarySoulForging(3, 1000000);
      const state = soulForgingSystem.saveState();

      const costs = analyticsEngine.getCostAnalytics(state);
      expect(costs.totalSpent).toBeGreaterThan(0);
      expect(costs.averageCostPerLevel).toBeGreaterThan(0);
      expect(costs.costEfficiency).toBeGreaterThan(0);
    });

    it('should get performance analytics', () => {
      soulForgingSystem.purchaseTemporarySoulForging(2, 1000000);
      soulForgingSystem.purchasePermanentSoulForging(1, 1000000);
      const state = soulForgingSystem.saveState();

      const performance = analyticsEngine.getPerformanceAnalytics(state);
      expect(performance.totalPurchases).toBe(2);
      expect(performance.averagePurchaseSize).toBeGreaterThan(0);
      expect(performance.performanceScore).toBeGreaterThan(0);
    });

    it('should get trend analytics', () => {
      const state = soulForgingSystem.saveState();
      const trends = analyticsEngine.getTrendAnalytics(state);

      expect(['accelerating', 'decelerating', 'stable']).toContain(trends.progressionTrend);
      expect(['increasing', 'decreasing', 'stable']).toContain(trends.costTrend);
      expect(['improving', 'declining', 'stable']).toContain(trends.efficiencyTrend);
    });

    it('should get recommendations', () => {
      const state = soulForgingSystem.saveState();
      const recommendations = analyticsEngine.getRecommendations(state);

      expect(Array.isArray(recommendations.immediate)).toBe(true);
      expect(Array.isArray(recommendations.shortTerm)).toBe(true);
      expect(Array.isArray(recommendations.longTerm)).toBe(true);
      expect(Array.isArray(recommendations.optimization)).toBe(true);
      expect(Array.isArray(recommendations.warnings)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should integrate all Soul Forging components', () => {
      // Purchase Soul Forging
      soulForgingSystem.purchaseTemporarySoulForging(2, 1000000);
      soulForgingSystem.purchasePermanentSoulForging(1, 1000000);

      // Get analytics
      const analytics = soulForgingSystem.getSoulForgingAnalytics();
      expect(analytics.totalPurchases).toBe(2);

      // Save state
      const state = soulForgingSystem.saveState();
      expect(state.temporaryLevels).toBe(2);
      expect(state.permanentLevels).toBe(1);

      // Analyze with analytics engine
      const analysis = analyticsEngine.analyze(state);
      expect(analysis.progression.currentLevel).toBe(3);

      // Get cost optimization
      const recommendation = costOptimizer.calculateOptimalPurchase(10000, 'temporary', 2);
      expect(recommendation.level).toBeGreaterThan(0);
    });

    it('should handle complex Soul Forging scenarios', () => {
      // Multiple purchases
      soulForgingSystem.purchaseTemporarySoulForging(3, 1000000);
      soulForgingSystem.purchasePermanentSoulForging(2, 1000000);
      soulForgingSystem.purchaseTemporarySoulForging(1, 1000000);

      // Check progression
      const progression = soulForgingSystem.getProgressionStats();
      expect(progression.currentLevel).toBe(6);

      // Check milestones
      const milestones = soulForgingSystem.getSoulForgingMilestones();
      const achievedMilestones = milestones.filter((m) => m.achieved);
      expect(achievedMilestones.length).toBeGreaterThan(0);

      // Check analytics
      const analytics = soulForgingSystem.getSoulForgingAnalytics();
      expect(analytics.totalPurchases).toBe(3);
      expect(analytics.milestonesAchieved).toBeGreaterThan(0);
    });

    it('should handle state persistence across sessions', async () => {
      // Initial state
      soulForgingSystem.purchaseTemporarySoulForging(2, 1000000);
      const initialState = soulForgingSystem.saveState();

      // Save to persistence
      await persistenceManager.saveState('session1', initialState);

      // Create new system and load state
      const newSystem = createEnhancedSoulForgingSystem(config);
      const loadedState = await persistenceManager.loadState('session1');
      expect(loadedState).not.toBeNull();

      if (loadedState) {
        newSystem.loadState(loadedState);
        expect(newSystem.temporaryLevels).toBe(2);
        expect(newSystem.permanentLevels).toBe(0);
      }
    });
  });

  describe('Performance Tests', () => {
    it('should meet performance targets for Soul Forging operations', () => {
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        soulForgingSystem.getSoulForgingAnalytics();
        soulForgingSystem.getProgressionStats();
        soulForgingSystem.getCostEfficiency();
      }

      const end = performance.now();
      const averageTime = (end - start) / iterations;

      expect(averageTime).toBeLessThan(0.1); // <0.1ms per operation
    });

    it('should meet performance targets for cost calculations', () => {
      const iterations = 1000;
      const start = performance.now();

      for (let i = 0; i < iterations; i++) {
        costOptimizer.calculateOptimalPurchase(10000, 'temporary', i % 10);
        costOptimizer.calculateBulkPurchase(5, 'permanent', i % 5);
        costOptimizer.getCostEfficiency('temporary', i % 20);
      }

      const end = performance.now();
      const averageTime = (end - start) / iterations;

      expect(averageTime).toBeLessThan(0.05); // <0.05ms per calculation
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero amount purchases', () => {
      const transaction = soulForgingSystem.purchaseTemporarySoulForging(0, 1000000);
      expect(transaction.success).toBe(false);
      expect(transaction.error).toContain('Amount must be positive');
    });

    it('should handle negative amount purchases', () => {
      const transaction = soulForgingSystem.purchaseTemporarySoulForging(-1, 1000000);
      expect(transaction.success).toBe(false);
      expect(transaction.error).toContain('Amount must be positive');
    });

    it('should handle insufficient currency', () => {
      const transaction = soulForgingSystem.purchaseTemporarySoulForging(1, 0);
      expect(transaction.success).toBe(false);
      expect(transaction.error).toContain('Insufficient');
    });

    it('should handle invalid state loading', () => {
      const invalidState = {
        temporaryLevels: -1,
        permanentLevels: -1,
        totalPurchases: -1,
        totalArcanaSpent: -1,
        totalSoulPowerSpent: -1,
        milestones: null as any,
        achievements: null as any,
        lastUpdated: -1,
        version: '',
      };

      const loaded = soulForgingSystem.loadState(invalidState);
      expect(loaded).toBe(false);
    });

    it('should handle empty analytics', () => {
      const state = soulForgingSystem.saveState();
      const analytics = analyticsEngine.analyze(state);

      expect(analytics.progression.currentLevel).toBe(0);
      expect(analytics.costs.totalSpent).toBe(0);
      expect(analytics.performance.totalPurchases).toBe(0);
    });
  });
});
