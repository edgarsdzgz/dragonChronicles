/**
 * Soul Forging Analytics System
 *
 * This file implements comprehensive analytics for the Soul Forging system,
 * including progression tracking, cost analysis, and performance metrics.
 */

import type { SoulForgingState } from './soul-forging-manager.js';

export interface SoulForgingAnalyticsData {
  progression: SoulForgingProgressionAnalytics;
  costs: SoulForgingCostAnalytics;
  performance: SoulForgingPerformanceAnalytics;
  trends: SoulForgingTrendAnalytics;
  recommendations: SoulForgingRecommendations;
}

export interface SoulForgingProgressionAnalytics {
  currentLevel: number;
  totalLevels: number;
  progressionRate: number;
  milestonesAchieved: number;
  achievementsUnlocked: number;
  nextMilestone: string | null;
  estimatedTimeToNext: number;
  progressionEfficiency: number;
}

export interface SoulForgingCostAnalytics {
  totalSpent: number;
  averageCostPerLevel: number;
  costEfficiency: number;
  optimalEfficiency: number;
  costSavings: number;
  spendingTrend: 'increasing' | 'decreasing' | 'stable';
  costPerBenefit: number;
  returnOnInvestment: number;
}

export interface SoulForgingPerformanceAnalytics {
  totalPurchases: number;
  averagePurchaseSize: number;
  purchaseFrequency: number;
  successRate: number;
  errorRate: number;
  performanceScore: number;
  optimizationLevel: number;
}

export interface SoulForgingTrendAnalytics {
  progressionTrend: 'accelerating' | 'decelerating' | 'stable';
  costTrend: 'increasing' | 'decreasing' | 'stable';
  efficiencyTrend: 'improving' | 'declining' | 'stable';
  spendingPattern: 'consistent' | 'burst' | 'gradual';
  seasonalPattern: boolean;
}

export interface SoulForgingRecommendations {
  immediate: string[];
  shortTerm: string[];
  longTerm: string[];
  optimization: string[];
  warnings: string[];
}

export interface SoulForgingAnalyticsReport {
  summary: string;
  keyMetrics: Record<string, number>;
  insights: string[];
  recommendations: SoulForgingRecommendations;
  generatedAt: number;
  period: {
    start: number;
    end: number;
    duration: number;
  };
}

export interface SoulForgingAnalyticsEngine {
  analyze(state: SoulForgingState): SoulForgingAnalyticsData;
  generateReport(
    state: SoulForgingState,
    period?: { start: number; end: number; duration?: number },
  ): SoulForgingAnalyticsReport;
  getProgressionAnalytics(state: SoulForgingState): SoulForgingProgressionAnalytics;
  getCostAnalytics(state: SoulForgingState): SoulForgingCostAnalytics;
  getPerformanceAnalytics(state: SoulForgingState): SoulForgingPerformanceAnalytics;
  getTrendAnalytics(state: SoulForgingState): SoulForgingTrendAnalytics;
  getRecommendations(state: SoulForgingState): SoulForgingRecommendations;
}

export class DefaultSoulForgingAnalyticsEngine implements SoulForgingAnalyticsEngine {
  private config: {
    optimalEfficiency: number;
    targetProgressionRate: number;
    costEfficiencyThreshold: number;
    performanceThreshold: number;
  };

  constructor(config?: Partial<typeof DefaultSoulForgingAnalyticsEngine.prototype.config>) {
    this.config = {
      optimalEfficiency: 0.001,
      targetProgressionRate: 0.1,
      costEfficiencyThreshold: 0.0005,
      performanceThreshold: 0.8,
      ...config,
    };
  }

  analyze(state: SoulForgingState): SoulForgingAnalyticsData {
    const progression = this.getProgressionAnalytics(state);
    const costs = this.getCostAnalytics(state);
    const performance = this.getPerformanceAnalytics(state);
    const trends = this.getTrendAnalytics(state);
    const recommendations = this.getRecommendations(state);

    return {
      progression,
      costs,
      performance,
      trends,
      recommendations,
    };
  }

  generateReport(
    state: SoulForgingState,
    period?: { start: number; end: number },
  ): SoulForgingAnalyticsReport {
    const analytics = this.analyze(state);
    const now = Date.now();
    const reportPeriod = period
      ? {
          start: period.start,
          end: period.end,
          duration: (period as any).duration || period.end - period.start,
        }
      : {
          start: state.lastUpdated,
          end: now,
          duration: now - state.lastUpdated,
        };

    const summary = this.generateSummary(analytics);
    const keyMetrics = this.extractKeyMetrics(analytics);
    const insights = this.generateInsights(analytics);

    return {
      summary,
      keyMetrics,
      insights,
      recommendations: analytics.recommendations,
      generatedAt: now,
      period: reportPeriod,
    };
  }

  getProgressionAnalytics(state: SoulForgingState): SoulForgingProgressionAnalytics {
    const currentLevel = state.temporaryLevels + state.permanentLevels;
    const totalLevels = currentLevel;
    const progressionRate = this.calculateProgressionRate(state);
    const milestonesAchieved = state.milestones.filter((m) => m.achieved).length;
    const achievementsUnlocked = state.achievements.filter((a) => a.achieved).length;
    const nextMilestone = this.findNextMilestone(state);
    const estimatedTimeToNext = this.estimateTimeToNext(state);
    const progressionEfficiency = this.calculateProgressionEfficiency(state);

    return {
      currentLevel,
      totalLevels,
      progressionRate,
      milestonesAchieved,
      achievementsUnlocked,
      nextMilestone,
      estimatedTimeToNext,
      progressionEfficiency,
    };
  }

  getCostAnalytics(state: SoulForgingState): SoulForgingCostAnalytics {
    const totalSpent = state.totalArcanaSpent + state.totalSoulPowerSpent;
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const averageCostPerLevel = totalLevels > 0 ? totalSpent / totalLevels : 0;
    const costEfficiency = this.calculateCostEfficiency(state);
    const optimalEfficiency = this.config.optimalEfficiency;
    const costSavings = this.calculateCostSavings(state);
    const spendingTrend = this.analyzeSpendingTrend(state);
    const costPerBenefit = this.calculateCostPerBenefit(state);
    const returnOnInvestment = this.calculateReturnOnInvestment(state);

    return {
      totalSpent,
      averageCostPerLevel,
      costEfficiency,
      optimalEfficiency,
      costSavings,
      spendingTrend,
      costPerBenefit,
      returnOnInvestment,
    };
  }

  getPerformanceAnalytics(state: SoulForgingState): SoulForgingPerformanceAnalytics {
    const totalPurchases = state.totalPurchases;
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const averagePurchaseSize = totalPurchases > 0 ? totalLevels / totalPurchases : 0;
    const purchaseFrequency = this.calculatePurchaseFrequency(state);
    const successRate = this.calculateSuccessRate(state);
    const errorRate = this.calculateErrorRate(state);
    const performanceScore = this.calculatePerformanceScore(state);
    const optimizationLevel = this.calculateOptimizationLevel(state);

    return {
      totalPurchases,
      averagePurchaseSize,
      purchaseFrequency,
      successRate,
      errorRate,
      performanceScore,
      optimizationLevel,
    };
  }

  getTrendAnalytics(state: SoulForgingState): SoulForgingTrendAnalytics {
    return {
      progressionTrend: this.analyzeProgressionTrend(state),
      costTrend: this.analyzeCostTrend(state),
      efficiencyTrend: this.analyzeEfficiencyTrend(state),
      spendingPattern: this.analyzeSpendingPattern(state),
      seasonalPattern: this.detectSeasonalPattern(state),
    };
  }

  getRecommendations(state: SoulForgingState): SoulForgingRecommendations {
    const progression = this.getProgressionAnalytics(state);
    const costs = this.getCostAnalytics(state);
    const performance = this.getPerformanceAnalytics(state);
    const trends = this.getTrendAnalytics(state);

    const immediate: string[] = [];
    const shortTerm: string[] = [];
    const longTerm: string[] = [];
    const optimization: string[] = [];
    const warnings: string[] = [];

    // Immediate recommendations
    if (costs.costEfficiency < this.config.costEfficiencyThreshold) {
      immediate.push('Consider optimizing Soul Forging purchases for better efficiency');
    }

    if (progression.progressionRate < this.config.targetProgressionRate) {
      immediate.push('Increase Soul Forging activity to improve progression rate');
    }

    // Short-term recommendations
    if (performance.performanceScore < this.config.performanceThreshold) {
      shortTerm.push('Focus on improving Soul Forging performance');
    }

    if (costs.spendingTrend === 'increasing') {
      shortTerm.push('Monitor spending patterns to avoid overspending');
    }

    // Long-term recommendations
    if (trends.progressionTrend === 'decelerating') {
      longTerm.push('Develop a long-term Soul Forging strategy');
    }

    if (trends.efficiencyTrend === 'declining') {
      longTerm.push('Review and optimize Soul Forging approach');
    }

    // Optimization recommendations
    if (costs.costSavings > 0) {
      optimization.push(`Potential cost savings: ${costs.costSavings.toFixed(2)}`);
    }

    if (performance.optimizationLevel < 0.5) {
      optimization.push('Consider bulk purchases for better efficiency');
    }

    // Warnings
    if (costs.totalSpent > 100000) {
      warnings.push('High spending detected - review Soul Forging strategy');
    }

    if (performance.errorRate > 0.1) {
      warnings.push('High error rate detected - check Soul Forging implementation');
    }

    return {
      immediate,
      shortTerm,
      longTerm,
      optimization,
      warnings,
    };
  }

  // Private helper methods

  private calculateProgressionRate(state: SoulForgingState): number {
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const timeElapsed = Date.now() - state.lastUpdated;
    const daysElapsed = timeElapsed / (1000 * 60 * 60 * 24);
    return daysElapsed > 0 ? totalLevels / daysElapsed : 0;
  }

  private findNextMilestone(state: SoulForgingState): string | null {
    const nextMilestone = state.milestones.find((m) => !m.achieved);
    return nextMilestone ? nextMilestone.name : null;
  }

  private estimateTimeToNext(state: SoulForgingState): number {
    const progressionRate = this.calculateProgressionRate(state);
    const nextMilestone = state.milestones.find((m) => !m.achieved);
    if (!nextMilestone || progressionRate === 0) {
      return 0;
    }
    const levelsNeeded =
      nextMilestone.requirement - (state.temporaryLevels + state.permanentLevels);
    return levelsNeeded / progressionRate;
  }

  private calculateProgressionEfficiency(state: SoulForgingState): number {
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const totalSpent = state.totalArcanaSpent + state.totalSoulPowerSpent;
    return totalSpent > 0 ? totalLevels / totalSpent : 0;
  }

  private calculateCostEfficiency(state: SoulForgingState): number {
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const totalSpent = state.totalArcanaSpent + state.totalSoulPowerSpent;
    return totalSpent > 0 ? totalLevels / totalSpent : 0;
  }

  private calculateCostSavings(state: SoulForgingState): number {
    // This would calculate potential savings from optimization
    return 0; // Placeholder
  }

  private analyzeSpendingTrend(state: SoulForgingState): 'increasing' | 'decreasing' | 'stable' {
    // This would analyze spending trends over time
    return 'stable'; // Placeholder
  }

  private calculateCostPerBenefit(state: SoulForgingState): number {
    const totalSpent = state.totalArcanaSpent + state.totalSoulPowerSpent;
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const benefit = totalLevels * 60; // 60 levels per Soul Forging
    return totalSpent / benefit;
  }

  private calculateReturnOnInvestment(state: SoulForgingState): number {
    const totalSpent = state.totalArcanaSpent + state.totalSoulPowerSpent;
    const totalLevels = state.temporaryLevels + state.permanentLevels;
    const benefit = totalLevels * 60; // 60 levels per Soul Forging
    return totalSpent > 0 ? (benefit - totalSpent) / totalSpent : 0;
  }

  private calculatePurchaseFrequency(state: SoulForgingState): number {
    const timeElapsed = Date.now() - state.lastUpdated;
    const daysElapsed = timeElapsed / (1000 * 60 * 60 * 24);
    return daysElapsed > 0 ? state.totalPurchases / daysElapsed : 0;
  }

  private calculateSuccessRate(state: SoulForgingState): number {
    // This would calculate success rate based on transaction history
    return 1.0; // Placeholder
  }

  private calculateErrorRate(state: SoulForgingState): number {
    // This would calculate error rate based on transaction history
    return 0.0; // Placeholder
  }

  private calculatePerformanceScore(state: SoulForgingState): number {
    const costEfficiency = this.calculateCostEfficiency(state);
    const progressionRate = this.calculateProgressionRate(state);
    const successRate = this.calculateSuccessRate(state);

    return costEfficiency * 0.4 + progressionRate * 0.3 + successRate * 0.3;
  }

  private calculateOptimizationLevel(state: SoulForgingState): number {
    const costEfficiency = this.calculateCostEfficiency(state);
    const optimalEfficiency = this.config.optimalEfficiency;
    return Math.min(costEfficiency / optimalEfficiency, 1.0);
  }

  private analyzeProgressionTrend(
    state: SoulForgingState,
  ): 'accelerating' | 'decelerating' | 'stable' {
    // This would analyze progression trends over time
    return 'stable'; // Placeholder
  }

  private analyzeCostTrend(state: SoulForgingState): 'increasing' | 'decreasing' | 'stable' {
    // This would analyze cost trends over time
    return 'stable'; // Placeholder
  }

  private analyzeEfficiencyTrend(state: SoulForgingState): 'improving' | 'declining' | 'stable' {
    // This would analyze efficiency trends over time
    return 'stable'; // Placeholder
  }

  private analyzeSpendingPattern(state: SoulForgingState): 'consistent' | 'burst' | 'gradual' {
    // This would analyze spending patterns
    return 'consistent'; // Placeholder
  }

  private detectSeasonalPattern(state: SoulForgingState): boolean {
    // This would detect seasonal patterns in Soul Forging activity
    return false; // Placeholder
  }

  private generateSummary(analytics: SoulForgingAnalyticsData): string {
    const { progression, costs, performance } = analytics;

    return `Soul Forging Analytics Summary:
    - Current Level: ${progression.currentLevel}
    - Total Spent: ${costs.totalSpent.toFixed(2)}
    - Cost Efficiency: ${costs.costEfficiency.toFixed(4)}
    - Performance Score: ${performance.performanceScore.toFixed(2)}
    - Progression Rate: ${progression.progressionRate.toFixed(2)} levels/day`;
  }

  private extractKeyMetrics(analytics: SoulForgingAnalyticsData): Record<string, number> {
    return {
      currentLevel: analytics.progression.currentLevel,
      totalSpent: analytics.costs.totalSpent,
      costEfficiency: analytics.costs.costEfficiency,
      performanceScore: analytics.performance.performanceScore,
      progressionRate: analytics.progression.progressionRate,
      milestonesAchieved: analytics.progression.milestonesAchieved,
      achievementsUnlocked: analytics.progression.achievementsUnlocked,
    };
  }

  private generateInsights(analytics: SoulForgingAnalyticsData): string[] {
    const insights: string[] = [];

    if (analytics.costs.costEfficiency > this.config.optimalEfficiency) {
      insights.push('Soul Forging efficiency is above optimal levels');
    }

    if (analytics.progression.progressionRate > this.config.targetProgressionRate) {
      insights.push('Progression rate is exceeding target');
    }

    if (analytics.performance.performanceScore > this.config.performanceThreshold) {
      insights.push('Performance is above threshold');
    }

    return insights;
  }
}

/**
 * Create a Soul Forging analytics engine
 */
export function createSoulForgingAnalyticsEngine(
  config?: Partial<DefaultSoulForgingAnalyticsEngine['config']>,
): SoulForgingAnalyticsEngine {
  return new DefaultSoulForgingAnalyticsEngine(config);
}

/**
 * Utility functions for Soul Forging analytics
 */
export function analyzeSoulForgingState(state: SoulForgingState): SoulForgingAnalyticsData {
  const engine = createSoulForgingAnalyticsEngine();
  return engine.analyze(state);
}

export function generateSoulForgingReport(
  state: SoulForgingState,
  period?: { start: number; end: number; duration?: number },
): SoulForgingAnalyticsReport {
  const engine = createSoulForgingAnalyticsEngine();
  return engine.generateReport(state, period);
}

export function getSoulForgingRecommendations(state: SoulForgingState): SoulForgingRecommendations {
  const engine = createSoulForgingAnalyticsEngine();
  return engine.getRecommendations(state);
}
