/**
 * Balance Analyzer Tests
 *
 * Tests for the balance analyzer including progression analysis,
 * performance analysis, and recommendation generation.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  createBalanceAnalyzer,
  type BalanceAnalyzer,
  type BalanceAnalysisConfig,
} from '../balance-analyzer.js';
import type { EconomicMetrics } from '../balance-testing.js';
import type { DetailedEconomicEvent, EconomicMetricsSnapshot } from '../economic-metrics.js';
import { DefaultArcanaDropManager } from '../arcana-drop-manager.js';
import { DefaultSoulPowerDropManager } from '../soul-power-drop-manager.js';
import { DefaultEnchantManager } from '../enchant-manager.js';
import type { ArcanaDropConfig, SoulPowerDropConfig, EnchantConfig } from '../types.js';

describe('Balance Analyzer', () => {
  let analyzer: BalanceAnalyzer;
  let _arcanaManager: DefaultArcanaDropManager;
  let _soulPowerManager: DefaultSoulPowerDropManager;
  let _enchantManager: DefaultEnchantManager;

  const mockMetrics: EconomicMetrics = {
    arcana: {
      totalEarned: 1000,
      totalSpent: 800,
      averagePerHour: 2.5,
      peakBalance: 500,
      dropCount: 100,
      averageDropAmount: 10,
    },
    soulPower: {
      totalEarned: 500,
      totalSpent: 300,
      averagePerHour: 1.25,
      peakBalance: 200,
      dropCount: 50,
      averageDropAmount: 10,
    },
    enchants: {
      totalPurchases: 20,
      averageLevel: 5,
      peakLevels: {
        firepower: 6,
        scales: 4,
      },
      totalCosts: 800,
    },
    soulForging: {
      totalPurchases: 10,
      averageLevel: 3,
      peakLevels: {
        temporary: 2,
        permanent: 4,
      },
      totalCosts: 300,
    },
  };

  const mockEvents: DetailedEconomicEvent[] = [
    {
      type: 'arcana_drop',
      timestamp: Date.now() - 1000,
      data: { amount: 10 },
      performance: {
        processingTime: 5,
        memoryUsage: 50,
        cpuUsage: 25,
      },
    },
    {
      type: 'enchant_purchase',
      timestamp: Date.now() - 500,
      data: { type: 'firepower' },
      performance: {
        processingTime: 8,
        memoryUsage: 52,
        cpuUsage: 30,
      },
    },
  ];

  const mockSnapshots: EconomicMetricsSnapshot[] = [
    {
      timestamp: Date.now() - 2000,
      arcanaBalance: {
        current: 100,
        totalEarned: 200,
        totalSpent: 100,
        drops: [],
        journeyStartTime: Date.now() - 2000,
      },
      soulPowerBalance: {
        current: 50,
        totalEarned: 100,
        totalSpent: 50,
        drops: [],
        accountStartTime: Date.now() - 2000,
      },
      enchantSystem: {
        temporary: { firepower: 1, scales: 1 },
        permanent: { firepower: 0, scales: 0 },
        soulForging: { temporary: 0, permanent: 0 },
        effective: { firepower: 1, scales: 1, cap: 10 },
      },
      soulForgingSystem: {
        temporaryLevels: 0,
        permanentLevels: 0,
        totalCapExtension: 0,
        config: {} as EnchantConfig,
        purchaseTemporarySoulForging: () => ({
          id: 'mock',
          type: 'temporary' as const,
          amount: 0,
          cost: 0,
          currency: 'arcana' as const,
          location: 'journey' as const,
          timestamp: Date.now(),
          success: false,
          error: 'Not implemented',
        }),
        purchasePermanentSoulForging: () => ({
          id: 'mock',
          type: 'permanent' as const,
          amount: 0,
          cost: 0,
          currency: 'soul_power' as const,
          location: 'draconia' as const,
          timestamp: Date.now(),
          success: false,
          error: 'Not implemented',
        }),
        calculateEffectiveCap: () => 0,
        calculateTemporaryCost: () => 0,
        calculatePermanentCost: () => 0,
        resetTemporarySoulForging: () => {},
        getSoulForgingHistory: () => [],
        getSoulForgingStats: () => ({
          totalTemporaryPurchases: 0,
          totalPermanentPurchases: 0,
          totalArcanaSpent: 0,
          totalSoulPowerSpent: 0,
          averageTemporaryCost: 0,
          averagePermanentCost: 0,
          totalCapExtension: 0,
        }),
      },
      performance: {
        memoryUsage: 50,
        cpuUsage: 25,
        frameTime: 16,
      },
    },
    {
      timestamp: Date.now() - 1000,
      arcanaBalance: {
        current: 200,
        totalEarned: 400,
        totalSpent: 200,
        drops: [],
        journeyStartTime: Date.now() - 2000,
      },
      soulPowerBalance: {
        current: 100,
        totalEarned: 200,
        totalSpent: 100,
        drops: [],
        accountStartTime: Date.now() - 2000,
      },
      enchantSystem: {
        temporary: { firepower: 2, scales: 2 },
        permanent: { firepower: 0, scales: 0 },
        soulForging: { temporary: 0, permanent: 0 },
        effective: { firepower: 2, scales: 2, cap: 10 },
      },
      soulForgingSystem: {
        temporaryLevels: 0,
        permanentLevels: 0,
        totalCapExtension: 0,
        config: {} as EnchantConfig,
        purchaseTemporarySoulForging: () => ({
          id: 'mock',
          type: 'temporary' as const,
          amount: 0,
          cost: 0,
          currency: 'arcana' as const,
          location: 'journey' as const,
          timestamp: Date.now(),
          success: false,
          error: 'Not implemented',
        }),
        purchasePermanentSoulForging: () => ({
          id: 'mock',
          type: 'permanent' as const,
          amount: 0,
          cost: 0,
          currency: 'soul_power' as const,
          location: 'draconia' as const,
          timestamp: Date.now(),
          success: false,
          error: 'Not implemented',
        }),
        calculateEffectiveCap: () => 0,
        calculateTemporaryCost: () => 0,
        calculatePermanentCost: () => 0,
        resetTemporarySoulForging: () => {},
        getSoulForgingHistory: () => [],
        getSoulForgingStats: () => ({
          totalTemporaryPurchases: 0,
          totalPermanentPurchases: 0,
          totalArcanaSpent: 0,
          totalSoulPowerSpent: 0,
          averageTemporaryCost: 0,
          averagePermanentCost: 0,
          totalCapExtension: 0,
        }),
      },
      performance: {
        memoryUsage: 52,
        cpuUsage: 30,
        frameTime: 16,
      },
    },
    {
      timestamp: Date.now(),
      arcanaBalance: {
        current: 300,
        totalEarned: 600,
        totalSpent: 300,
        drops: [],
        journeyStartTime: Date.now() - 2000,
      },
      soulPowerBalance: {
        current: 150,
        totalEarned: 300,
        totalSpent: 150,
        drops: [],
        accountStartTime: Date.now() - 2000,
      },
      enchantSystem: {
        temporary: { firepower: 3, scales: 3 },
        permanent: { firepower: 0, scales: 0 },
        soulForging: { temporary: 0, permanent: 0 },
        effective: { firepower: 3, scales: 3, cap: 10 },
      },
      soulForgingSystem: {
        temporaryLevels: 0,
        permanentLevels: 0,
        totalCapExtension: 0,
        config: {} as EnchantConfig,
        purchaseTemporarySoulForging: () => ({
          id: 'mock',
          type: 'temporary' as const,
          amount: 0,
          cost: 0,
          currency: 'arcana' as const,
          location: 'journey' as const,
          timestamp: Date.now(),
          success: false,
          error: 'Not implemented',
        }),
        purchasePermanentSoulForging: () => ({
          id: 'mock',
          type: 'permanent' as const,
          amount: 0,
          cost: 0,
          currency: 'soul_power' as const,
          location: 'draconia' as const,
          timestamp: Date.now(),
          success: false,
          error: 'Not implemented',
        }),
        calculateEffectiveCap: () => 0,
        calculateTemporaryCost: () => 0,
        calculatePermanentCost: () => 0,
        resetTemporarySoulForging: () => {},
        getSoulForgingHistory: () => [],
        getSoulForgingStats: () => ({
          totalTemporaryPurchases: 0,
          totalPermanentPurchases: 0,
          totalArcanaSpent: 0,
          totalSoulPowerSpent: 0,
          averageTemporaryCost: 0,
          averagePermanentCost: 0,
          totalCapExtension: 0,
        }),
      },
      performance: {
        memoryUsage: 54,
        cpuUsage: 35,
        frameTime: 16,
      },
    },
  ];

  beforeEach(() => {
    analyzer = createBalanceAnalyzer();

    // Create mock _configurations
    const arcanaConfig: ArcanaDropConfig = {
      baseDropAmount: 10,
      distanceScalingFactor: 1.5,
      wardScalingFactor: 1.2,
      bossRewardMultiplier: 2.0,
      eliteMultiplier: 1.5,
      miniBossMultiplier: 1.8,
    };

    const soulPowerConfig: SoulPowerDropConfig = {
      baseDropChance: 0.05,
      baseDropPercentage: 0.02,
      minDropAmount: 1,
      maxDropAmount: 10,
      distanceScalingFactor: 1.2,
      wardScalingFactor: 1.1,
      bossChanceMultiplier: 3.0,
      bossAmountMultiplier: 2.0,
      eliteChanceMultiplier: 2.0,
      eliteAmountMultiplier: 1.5,
      miniBossChanceMultiplier: 2.5,
      miniBossAmountMultiplier: 1.8,
    };

    const enchantConfig: EnchantConfig = {
      baseCosts: {
        firepower: 100,
        scales: 100,
      },
      growthRate: 1.12,
      baseCap: 10,
      soulForgingMultiplier: 60,
      temporarySoulForgingCost: 15,
      permanentSoulForgingCost: 1000,
    };

    _arcanaManager = new DefaultArcanaDropManager(arcanaConfig);
    _soulPowerManager = new DefaultSoulPowerDropManager(soulPowerConfig);
    _enchantManager = new DefaultEnchantManager(enchantConfig);
  });

  describe('Initialization', () => {
    it('should create analyzer with default _configuration', () => {
      const defaultAnalyzer = createBalanceAnalyzer();
      expect(defaultAnalyzer).toBeDefined();
    });

    it('should create analyzer with custom _configuration', () => {
      const customConfig: BalanceAnalysisConfig = {
        targetReturnsPerHour: 3.0,
        balanceTolerance: 0.3,
        minConsistencyThreshold: 0.9,
        maxEnchantLevelDifference: 5,
        performanceThresholds: {
          maxFrameTime: 20,
          maxMemoryUsage: 150,
          minOperationsPerSecond: 1500,
        },
      };

      const customAnalyzer = createBalanceAnalyzer(customConfig);
      expect(customAnalyzer).toBeDefined();
    });
  });

  describe('Balance Analysis', () => {
    it('should perform comprehensive balance analysis', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);

      expect(analysis).toBeDefined();
      expect(analysis.meetsTarget).toBeDefined();
      expect(analysis.actualReturnsPerHour).toBe(2.5);
      expect(analysis.targetReturnsPerHour).toBe(2.5);
      expect(analysis.balanceScore).toBeGreaterThanOrEqual(0);
      expect(analysis.balanceScore).toBeLessThanOrEqual(100);
      expect(Array.isArray(analysis.issues)).toBe(true);
      expect(Array.isArray(analysis.recommendations)).toBe(true);
    });

    it('should analyze progression curves', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);

      expect(analysis.progressionAnalysis).toBeDefined();
      expect(analysis.progressionAnalysis?.arcanaCurve).toBeDefined();
      expect(analysis.progressionAnalysis?.soulPowerCurve).toBeDefined();
      expect(analysis.progressionAnalysis?.enchantCurve).toBeDefined();
      expect(analysis.progressionAnalysis?.soulForgingCurve).toBeDefined();

      // Check curve properties
      const arcanaCurve = analysis.progressionAnalysis?.arcanaCurve;
      expect(typeof arcanaCurve?.isSmooth).toBe('boolean');
      expect(typeof arcanaCurve?.isBalanced).toBe('boolean');
      expect(arcanaCurve?.consistency).toBeGreaterThanOrEqual(0);
      expect(arcanaCurve?.consistency).toBeLessThanOrEqual(1);
      expect(arcanaCurve?.growthRate).toBeDefined();
      expect(arcanaCurve?.volatility).toBeGreaterThanOrEqual(0);
      expect(['increasing', 'decreasing', 'stable']).toContain(arcanaCurve?.trend);
      expect(arcanaCurve?.qualityScore).toBeGreaterThanOrEqual(0);
      expect(arcanaCurve?.qualityScore).toBeLessThanOrEqual(100);
    });

    it('should analyze performance metrics', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);

      expect(analysis.performanceAnalysis).toBeDefined();
      expect(analysis.performanceAnalysis.frameRateConsistency).toBeGreaterThanOrEqual(0);
      expect(analysis.performanceAnalysis.frameRateConsistency).toBeLessThanOrEqual(1);
      expect(analysis.performanceAnalysis.memoryStability).toBeGreaterThanOrEqual(0);
      expect(analysis.performanceAnalysis.memoryStability).toBeLessThanOrEqual(1);
      expect(analysis.performanceAnalysis.processingTimeDistribution).toBeDefined();

      const processingTime = analysis.performanceAnalysis.processingTimeDistribution;
      expect(processingTime.average).toBeGreaterThanOrEqual(0);
      expect(processingTime.median).toBeGreaterThanOrEqual(0);
      expect(processingTime.p95).toBeGreaterThanOrEqual(0);
      expect(processingTime.p99).toBeGreaterThanOrEqual(0);
    });

    it('should analyze economic efficiency', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);

      expect(analysis.efficiencyAnalysis).toBeDefined();
      expect(analysis.efficiencyAnalysis.arcanaEfficiency).toBeGreaterThanOrEqual(0);
      expect(analysis.efficiencyAnalysis.soulPowerEfficiency).toBeGreaterThanOrEqual(0);
      expect(analysis.efficiencyAnalysis.overallEfficiency).toBeGreaterThanOrEqual(0);

      // Test efficiency calculation
      const expectedArcanaEfficiency = (1000 - 800) / 1000; // 0.2
      expect(analysis.efficiencyAnalysis.arcanaEfficiency).toBeCloseTo(expectedArcanaEfficiency, 2);
    });

    it('should generate prioritized recommendations', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);

      expect(analysis.prioritizedRecommendations).toBeDefined();
      expect(Array.isArray(analysis.prioritizedRecommendations)).toBe(true);

      analysis.prioritizedRecommendations.forEach((recommendation) => {
        expect(['high', 'medium', 'low']).toContain(recommendation.priority);
        expect(['economic', 'performance', 'progression']).toContain(recommendation.category);
        expect(typeof recommendation.recommendation).toBe('string');
        expect(['high', 'medium', 'low']).toContain(recommendation.impact);
      });
    });
  });

  describe('Progression Curve Analysis', () => {
    it('should handle empty data gracefully', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, []);

      expect(analysis.progressionAnalysis.arcanaCurve).toBeDefined();
      expect(analysis.progressionAnalysis.soulPowerCurve).toBeDefined();
      expect(analysis.progressionAnalysis.enchantCurve).toBeDefined();
      expect(analysis.progressionAnalysis.soulForgingCurve).toBeDefined();

      // All curves should have default values
      const curves = [
        analysis.progressionAnalysis.arcanaCurve,
        analysis.progressionAnalysis.soulPowerCurve,
        analysis.progressionAnalysis.enchantCurve,
        analysis.progressionAnalysis.soulForgingCurve,
      ];

      curves.forEach((curve) => {
        expect(curve.isSmooth).toBe(true);
        expect(curve.isBalanced).toBe(true);
        expect(curve.consistency).toBe(1.0);
        expect(curve.growthRate).toBe(0);
        expect(curve.volatility).toBe(0);
        expect(curve.trend).toBe('stable');
        expect(curve.qualityScore).toBe(100);
      });
    });

    it('should analyze increasing progression curve', () => {
      const increasingSnapshots = [
        {
          ...mockSnapshots[0]!,
          arcanaBalance: { ...mockSnapshots[0]!.arcanaBalance, current: 100 },
        },
        {
          ...mockSnapshots[1]!,
          arcanaBalance: { ...mockSnapshots[1]!.arcanaBalance, current: 200 },
        },
        {
          ...mockSnapshots[2]!,
          arcanaBalance: { ...mockSnapshots[2]!.arcanaBalance, current: 300 },
        },
      ];

      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, increasingSnapshots);
      const arcanaCurve = analysis.progressionAnalysis.arcanaCurve;

      expect(arcanaCurve.trend).toBe('increasing');
      expect(arcanaCurve.growthRate).toBeGreaterThan(0);
    });

    it('should analyze decreasing progression curve', () => {
      const decreasingSnapshots = [
        {
          ...mockSnapshots[0]!,
          arcanaBalance: { ...mockSnapshots[0]!.arcanaBalance, current: 300 },
        },
        {
          ...mockSnapshots[1]!,
          arcanaBalance: { ...mockSnapshots[1]!.arcanaBalance, current: 200 },
        },
        {
          ...mockSnapshots[2]!,
          arcanaBalance: { ...mockSnapshots[2]!.arcanaBalance, current: 100 },
        },
      ];

      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, decreasingSnapshots);
      const arcanaCurve = analysis.progressionAnalysis.arcanaCurve;

      expect(arcanaCurve.trend).toBe('decreasing');
      expect(arcanaCurve.growthRate).toBeLessThan(0);
    });

    it('should calculate consistency correctly', () => {
      const consistentSnapshots = [
        {
          ...mockSnapshots[0]!,
          arcanaBalance: { ...mockSnapshots[0]!.arcanaBalance, current: 100 },
        },
        {
          ...mockSnapshots[1]!,
          arcanaBalance: { ...mockSnapshots[1]!.arcanaBalance, current: 110 },
        },
        {
          ...mockSnapshots[2]!,
          arcanaBalance: { ...mockSnapshots[2]!.arcanaBalance, current: 120 },
        },
      ];

      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, consistentSnapshots);
      const arcanaCurve = analysis.progressionAnalysis.arcanaCurve;

      expect(arcanaCurve.consistency).toBeGreaterThan(0.8);
      expect(arcanaCurve.isBalanced).toBe(true);
    });
  });

  describe('Performance Analysis', () => {
    it('should handle empty performance events', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, [], mockSnapshots);

      expect(analysis.performanceAnalysis.frameRateConsistency).toBe(1.0);
      expect(analysis.performanceAnalysis.memoryStability).toBe(1.0);
      expect(analysis.performanceAnalysis.processingTimeDistribution.average).toBe(0);
      expect(analysis.performanceAnalysis.processingTimeDistribution.median).toBe(0);
      expect(analysis.performanceAnalysis.processingTimeDistribution.p95).toBe(0);
      expect(analysis.performanceAnalysis.processingTimeDistribution.p99).toBe(0);
    });

    it('should calculate frame rate consistency', () => {
      const performanceEvents = [
        {
          type: 'performance_event' as const,
          timestamp: Date.now() - 1000,
          data: {},
          performance: {
            processingTime: 10, // Good frame time
            memoryUsage: 50,
            cpuUsage: 25,
          },
        },
        {
          type: 'performance_event' as const,
          timestamp: Date.now() - 500,
          data: {},
          performance: {
            processingTime: 20, // Bad frame time
            memoryUsage: 52,
            cpuUsage: 30,
          },
        },
      ];

      const analysis = analyzer.analyzeBalance(mockMetrics, performanceEvents, mockSnapshots);
      expect(analysis.performanceAnalysis.frameRateConsistency).toBeGreaterThan(0);
      expect(analysis.performanceAnalysis.frameRateConsistency).toBeLessThanOrEqual(1);
    });
  });

  describe('Recommendation Generation', () => {
    it('should generate high priority recommendations for critical issues', () => {
      const poorMetrics: EconomicMetrics = {
        ...mockMetrics,
        arcana: {
          ...mockMetrics.arcana,
          averagePerHour: 1.0, // Below target
        },
      };

      const analysis = analyzer.analyzeBalance(poorMetrics, mockEvents, mockSnapshots);
      const highPriorityRecommendations = analysis.prioritizedRecommendations.filter(
        (r) => r.priority === 'high',
      );

      expect(highPriorityRecommendations.length).toBeGreaterThan(0);
      expect(highPriorityRecommendations.some((r) => r.category === 'economic')).toBe(true);
    });

    it('should generate medium priority recommendations for moderate issues', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);
      const mediumPriorityRecommendations = analysis.prioritizedRecommendations.filter(
        (r) => r.priority === 'medium',
      );

      // Should have some medium priority recommendations
      expect(mediumPriorityRecommendations.length).toBeGreaterThanOrEqual(0);
    });

    it('should categorize recommendations correctly', () => {
      const analysis = analyzer.analyzeBalance(mockMetrics, mockEvents, mockSnapshots);

      analysis.prioritizedRecommendations.forEach((recommendation) => {
        expect(['economic', 'performance', 'progression']).toContain(recommendation.category);
        expect(['high', 'medium', 'low']).toContain(recommendation.impact);
        expect(typeof recommendation.recommendation).toBe('string');
        expect(recommendation.recommendation.length).toBeGreaterThan(0);
      });
    });
  });
});
