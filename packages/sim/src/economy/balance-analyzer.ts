/**
 * Balance Analyzer
 *
 * This module provides comprehensive balance analysis and reporting
 * for economic systems, including progression curve analysis,
 * balance scoring, and recommendations.
 */

import type { EconomicMetrics, BalanceAnalysis } from './balance-testing.js';
import type { DetailedEconomicEvent, EconomicMetricsSnapshot } from './economic-metrics.js';

/**
 * Balance analysis configuration
 */
export interface BalanceAnalysisConfig {
  /** Target returns per hour */
  targetReturnsPerHour: number;
  /** Tolerance for balance score (0-1) */
  balanceTolerance: number;
  /** Minimum progression consistency threshold */
  minConsistencyThreshold: number;
  /** Maximum acceptable enchant level difference */
  maxEnchantLevelDifference: number;
  /** Performance thresholds */
  performanceThresholds: {
    /** Maximum acceptable frame time in milliseconds */
    maxFrameTime: number;
    /** Maximum acceptable memory usage in MB */
    maxMemoryUsage: number;
    /** Minimum acceptable operations per second */
    minOperationsPerSecond: number;
  };
}

/**
 * Detailed balance analysis result
 */
export interface DetailedBalanceAnalysis extends BalanceAnalysis {
  /** Detailed progression analysis */
  progressionAnalysis: {
    /** Arcana progression curve */
    arcanaCurve: ProgressionCurve;
    /** Soul Power progression curve */
    soulPowerCurve: ProgressionCurve;
    /** Enchant progression curve */
    enchantCurve: ProgressionCurve;
    /** Soul Forging progression curve */
    soulForgingCurve: ProgressionCurve;
  };
  /** Performance analysis */
  performanceAnalysis: {
    /** Frame rate consistency */
    frameRateConsistency: number;
    /** Memory usage stability */
    memoryStability: number;
    /** Processing time distribution */
    processingTimeDistribution: {
      average: number;
      median: number;
      p95: number;
      p99: number;
    };
  };
  /** Economic efficiency analysis */
  efficiencyAnalysis: {
    /** Arcana efficiency (earned vs spent) */
    arcanaEfficiency: number;
    /** Soul Power efficiency (earned vs spent) */
    soulPowerEfficiency: number;
    /** Overall economic efficiency */
    overallEfficiency: number;
  };
  /** Balance recommendations with priority */
  prioritizedRecommendations: Array<{
    priority: 'high' | 'medium' | 'low';
    category: 'economic' | 'performance' | 'progression';
    recommendation: string;
    impact: 'high' | 'medium' | 'low';
  }>;
}

/**
 * Progression curve analysis
 */
export interface ProgressionCurve {
  /** Whether the curve is smooth */
  isSmooth: boolean;
  /** Whether the curve is balanced */
  isBalanced: boolean;
  /** Consistency score (0-1) */
  consistency: number;
  /** Growth rate */
  growthRate: number;
  /** Volatility (standard deviation) */
  volatility: number;
  /** Trend direction */
  trend: 'increasing' | 'decreasing' | 'stable';
  /** Curve quality score (0-100) */
  qualityScore: number;
}

/**
 * Balance analyzer implementation
 */
export class BalanceAnalyzer {
  private _config: BalanceAnalysisConfig;

  constructor(
    config: BalanceAnalysisConfig = {
      targetReturnsPerHour: 2.5,
      balanceTolerance: 0.2,
      minConsistencyThreshold: 0.8,
      maxEnchantLevelDifference: 3,
      performanceThresholds: {
        maxFrameTime: 16.67, // 60 FPS
        maxMemoryUsage: 100, // MB
        minOperationsPerSecond: 1000,
      },
    },
  ) {
    this._config = config;
  }

  /**
   * Perform comprehensive balance analysis
   */
  analyzeBalance(
    metrics: EconomicMetrics,
    events: DetailedEconomicEvent[],
    snapshots: EconomicMetricsSnapshot[],
  ): DetailedBalanceAnalysis {
    // Basic balance analysis
    const basicAnalysis = this._performBasicAnalysis(metrics);

    // Progression analysis
    const progressionAnalysis = this._analyzeProgression(snapshots);

    // Performance analysis
    const performanceAnalysis = this._analyzePerformance(events);

    // Efficiency analysis
    const efficiencyAnalysis = this._analyzeEfficiency(metrics);

    // Generate prioritized recommendations
    const prioritizedRecommendations = this._generateRecommendations(
      basicAnalysis,
      progressionAnalysis,
      performanceAnalysis,
      efficiencyAnalysis,
    );

    return {
      ...basicAnalysis,
      progressionAnalysis,
      performanceAnalysis,
      efficiencyAnalysis,
      prioritizedRecommendations,
    };
  }

  /**
   * Perform basic balance analysis
   */
  private _performBasicAnalysis(metrics: EconomicMetrics): BalanceAnalysis {
    const actualReturnsPerHour = metrics.arcana.averagePerHour;
    const targetReturnsPerHour = this._config.targetReturnsPerHour;
    const meetsTarget = actualReturnsPerHour >= 2 && actualReturnsPerHour <= 3;
    const balanceScore = Math.max(
      0,
      Math.min(100, (actualReturnsPerHour / targetReturnsPerHour) * 100),
    );

    const issues: string[] = [];
    const recommendations: string[] = [];

    // Analyze returns per hour
    if (actualReturnsPerHour < 2) {
      issues.push('Economic progression too slow - below 2 returns/hour target');
      recommendations.push('Increase Arcana drop rates or reduce enchant costs');
    } else if (actualReturnsPerHour > 3) {
      issues.push('Economic progression too fast - above 3 returns/hour target');
      recommendations.push('Decrease Arcana drop rates or increase enchant costs');
    }

    // Analyze enchant progression
    if (metrics.enchants.averageLevel < 5) {
      issues.push('Enchant progression too slow');
      recommendations.push('Reduce enchant cost scaling or increase Arcana availability');
    }

    // Analyze enchant balance
    const enchantDifference = Math.abs(
      metrics.enchants.peakLevels.firepower - metrics.enchants.peakLevels.scales,
    );
    if (enchantDifference > this._config.maxEnchantLevelDifference) {
      issues.push('Enchant progression imbalanced');
      recommendations.push('Balance enchant costs or adjust drop rates');
    }

    // Analyze soul forging progression
    if (metrics.soulForging.averageLevel < 2) {
      issues.push('Soul Forging progression too slow');
      recommendations.push('Increase Soul Power drop rates or reduce soul forging costs');
    }

    return {
      meetsTarget,
      actualReturnsPerHour,
      targetReturnsPerHour,
      balanceScore,
      issues,
      recommendations,
      progressionCurve: {
        isSmooth: true, // Will be calculated in detailed analysis
        isBalanced: true, // Will be calculated in detailed analysis
        consistency: 0.9, // Will be calculated in detailed analysis
      },
    };
  }

  /**
   * Analyze progression curves
   */
  private _analyzeProgression(
    snapshots: EconomicMetricsSnapshot[],
  ): DetailedBalanceAnalysis['progressionAnalysis'] {
    if (snapshots.length < 2) {
      return {
        arcanaCurve: this._createDefaultCurve(),
        soulPowerCurve: this._createDefaultCurve(),
        enchantCurve: this._createDefaultCurve(),
        soulForgingCurve: this._createDefaultCurve(),
      };
    }

    // Extract progression data
    const arcanaData = snapshots.map((s) => s.arcanaBalance.current);
    const soulPowerData = snapshots.map((s) => s.soulPowerBalance.current);
    const enchantData = snapshots.map(
      (s) => s.enchantSystem.effective.firepower + s.enchantSystem.effective.scales,
    );
    const soulForgingData = snapshots.map(
      (s) => s.soulForgingSystem.temporaryLevels + s.soulForgingSystem.permanentLevels,
    );

    return {
      arcanaCurve: this._analyzeCurve(arcanaData),
      soulPowerCurve: this._analyzeCurve(soulPowerData),
      enchantCurve: this._analyzeCurve(enchantData),
      soulForgingCurve: this._analyzeCurve(soulForgingData),
    };
  }

  /**
   * Analyze a single progression curve
   */
  private _analyzeCurve(data: number[]): ProgressionCurve {
    if (data.length < 2) {
      return this._createDefaultCurve();
    }

    // Calculate growth rate
    const growthRate = (data[data.length - 1]! - data[0]!) / data.length;

    // Calculate volatility (standard deviation)
    const mean = data.reduce((a, b) => a + b, 0) / data.length;
    const variance = data.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / data.length;
    const volatility = Math.sqrt(variance);

    // Determine trend
    const trend = growthRate > 0.1 ? 'increasing' : growthRate < -0.1 ? 'decreasing' : 'stable';

    // Calculate consistency (inverse of volatility)
    const consistency = Math.max(0, Math.min(1, 1 - volatility / mean));

    // Calculate smoothness (based on rate of change)
    const changes = data.slice(1).map((value, index) => Math.abs(value - data[index]!));
    const averageChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const isSmooth = averageChange < mean * 0.1; // Less than 10% average change

    // Calculate quality score
    const qualityScore = consistency * 40 + (isSmooth ? 30 : 0) + (trend === 'increasing' ? 30 : 0);

    return {
      isSmooth,
      isBalanced: consistency > this._config.minConsistencyThreshold,
      consistency,
      growthRate,
      volatility,
      trend,
      qualityScore,
    };
  }

  /**
   * Analyze performance metrics
   */
  private _analyzePerformance(
    events: DetailedEconomicEvent[],
  ): DetailedBalanceAnalysis['performanceAnalysis'] {
    const performanceEvents = events.filter((e) => e.performance);

    if (performanceEvents.length === 0) {
      return {
        frameRateConsistency: 1.0,
        memoryStability: 1.0,
        processingTimeDistribution: {
          average: 0,
          median: 0,
          p95: 0,
          p99: 0,
        },
      };
    }

    // Calculate processing time distribution
    const processingTimes = performanceEvents.map((e) => e.performance!.processingTime);
    const sortedTimes = [...processingTimes].sort((a, b) => a - b);

    const processingTimeDistribution = {
      average: processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length,
      median: sortedTimes[Math.floor(sortedTimes.length / 2)] ?? 0,
      p95: sortedTimes[Math.floor(sortedTimes.length * 0.95)] ?? 0,
      p99: sortedTimes[Math.floor(sortedTimes.length * 0.99)] ?? 0,
    };

    // Calculate frame rate consistency
    const frameTimes = performanceEvents.map((e) => e.performance!.processingTime);
    const targetFrameTime = 1000 / 60; // 60 FPS
    const frameRateConsistency =
      frameTimes.filter((t) => t <= targetFrameTime).length / frameTimes.length;

    // Calculate memory stability
    const memoryUsages = performanceEvents.map((e) => e.performance!.memoryUsage);
    const memoryMean = memoryUsages.reduce((a, b) => a + b, 0) / memoryUsages.length;
    const memoryVariance =
      memoryUsages.reduce((sum, value) => sum + Math.pow(value - memoryMean, 2), 0) /
      memoryUsages.length;
    const memoryStability = Math.max(0, Math.min(1, 1 - Math.sqrt(memoryVariance) / memoryMean));

    return {
      frameRateConsistency,
      memoryStability,
      processingTimeDistribution,
    };
  }

  /**
   * Analyze economic efficiency
   */
  private _analyzeEfficiency(
    metrics: EconomicMetrics,
  ): DetailedBalanceAnalysis['efficiencyAnalysis'] {
    // Calculate Arcana efficiency
    const arcanaEfficiency =
      metrics.arcana.totalEarned > 0
        ? (metrics.arcana.totalEarned - metrics.arcana.totalSpent) / metrics.arcana.totalEarned
        : 0;

    // Calculate Soul Power efficiency
    const soulPowerEfficiency =
      metrics.soulPower.totalEarned > 0
        ? (metrics.soulPower.totalEarned - metrics.soulPower.totalSpent) /
          metrics.soulPower.totalEarned
        : 0;

    // Calculate overall efficiency
    const overallEfficiency = (arcanaEfficiency + soulPowerEfficiency) / 2;

    return {
      arcanaEfficiency,
      soulPowerEfficiency,
      overallEfficiency,
    };
  }

  /**
   * Generate prioritized recommendations
   */
  private _generateRecommendations(
    basicAnalysis: BalanceAnalysis,
    progressionAnalysis: DetailedBalanceAnalysis['progressionAnalysis'],
    performanceAnalysis: DetailedBalanceAnalysis['performanceAnalysis'],
    efficiencyAnalysis: DetailedBalanceAnalysis['efficiencyAnalysis'],
  ): DetailedBalanceAnalysis['prioritizedRecommendations'] {
    const recommendations: DetailedBalanceAnalysis['prioritizedRecommendations'] = [];

    // High priority recommendations
    if (!basicAnalysis.meetsTarget) {
      recommendations.push({
        priority: 'high',
        category: 'economic',
        recommendation: 'Adjust economic progression to meet 2-3 returns/hour target',
        impact: 'high',
      });
    }

    if (performanceAnalysis.frameRateConsistency < 0.9) {
      recommendations.push({
        priority: 'high',
        category: 'performance',
        recommendation: 'Optimize frame rate performance to maintain 60 FPS',
        impact: 'high',
      });
    }

    if (efficiencyAnalysis.overallEfficiency < 0.5) {
      recommendations.push({
        priority: 'high',
        category: 'economic',
        recommendation: 'Improve economic efficiency by balancing earned vs spent resources',
        impact: 'high',
      });
    }

    // Medium priority recommendations
    if (progressionAnalysis.arcanaCurve.consistency < this._config.minConsistencyThreshold) {
      recommendations.push({
        priority: 'medium',
        category: 'progression',
        recommendation: 'Smooth out Arcana progression curve for better consistency',
        impact: 'medium',
      });
    }

    if (progressionAnalysis.enchantCurve.consistency < this._config.minConsistencyThreshold) {
      recommendations.push({
        priority: 'medium',
        category: 'progression',
        recommendation: 'Balance enchant progression for smoother advancement',
        impact: 'medium',
      });
    }

    if (performanceAnalysis.memoryStability < 0.8) {
      recommendations.push({
        priority: 'medium',
        category: 'performance',
        recommendation: 'Improve memory usage stability to prevent performance degradation',
        impact: 'medium',
      });
    }

    // Low priority recommendations
    if (progressionAnalysis.soulPowerCurve.qualityScore < 70) {
      recommendations.push({
        priority: 'low',
        category: 'progression',
        recommendation: 'Enhance Soul Power progression curve quality',
        impact: 'low',
      });
    }

    if (progressionAnalysis.soulForgingCurve.qualityScore < 70) {
      recommendations.push({
        priority: 'low',
        category: 'progression',
        recommendation: 'Improve Soul Forging progression curve',
        impact: 'low',
      });
    }

    return recommendations;
  }

  /**
   * Create default progression curve
   */
  private _createDefaultCurve(): ProgressionCurve {
    return {
      isSmooth: true,
      isBalanced: true,
      consistency: 1.0,
      growthRate: 0,
      volatility: 0,
      trend: 'stable',
      qualityScore: 100,
    };
  }
}

/**
 * Create a new balance analyzer
 */
export function createBalanceAnalyzer(config?: BalanceAnalysisConfig): BalanceAnalyzer {
  return new BalanceAnalyzer(config);
}
