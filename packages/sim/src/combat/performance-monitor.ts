/**
 * Performance Monitor for Draconia Chronicles Targeting System
 * Monitors and tracks performance metrics for targeting operations
 */

import type {
  TargetingStrategy,
  TargetPersistenceMode,
} from './types.js';

/**
 * Performance measurement data
 */
export interface PerformanceMeasurement {
  operation: string;
  startTime: number;
  endTime: number;
  duration: number;
  memoryBefore: number;
  memoryAfter: number;
  memoryDelta: number;
  metadata: Record<string, any>;
}

/**
 * Performance threshold configuration
 */
export interface PerformanceThresholds {
  targetSelectionTime: number; // ms
  rangeDetectionTime: number; // ms
  threatCalculationTime: number; // ms
  totalUpdateTime: number; // ms
  memoryUsage: number; // bytes
  cacheHitRate: number; // 0-1
  spatialGridEfficiency: number; // 0-1
}

/**
 * Performance alert configuration
 */
export interface PerformanceAlert {
  id: string;
  type: 'threshold_exceeded' | 'performance_degradation' | 'memory_leak' | 'error_rate_high';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold: number;
  actualValue: number;
  timestamp: number;
  metadata: Record<string, any>;
}

/**
 * Performance statistics
 */
export interface PerformanceStats {
  operation: string;
  count: number;
  totalTime: number;
  averageTime: number;
  minTime: number;
  maxTime: number;
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  standardDeviation: number;
  memoryUsage: {
    average: number;
    peak: number;
    current: number;
  };
}

/**
 * Performance monitor configuration
 */
export interface PerformanceMonitorConfig {
  enabled: boolean;
  sampleRate: number; // 0-1
  maxMeasurements: number;
  alertThresholds: PerformanceThresholds;
  enableMemoryTracking: boolean;
  enableDetailedTracking: boolean;
  enableAlerts: boolean;
  alertCooldown: number; // ms
  retentionPeriod: number; // ms
}

/**
 * Performance monitor class
 */
export class PerformanceMonitor {
  private config: PerformanceMonitorConfig;
  private measurements: PerformanceMeasurement[] = [];
  private activeMeasurements: Map<string, PerformanceMeasurement> = new Map();
  private alerts: PerformanceAlert[] = [];
  private lastAlertTimes: Map<string, number> = new Map();
  private stats: Map<string, PerformanceStats> = new Map();
  private isEnabled: boolean;

  constructor(config: Partial<PerformanceMonitorConfig> = {}) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxMeasurements: 10000,
      alertThresholds: {
        targetSelectionTime: 0.1, // 100ms
        rangeDetectionTime: 0.05, // 50ms
        threatCalculationTime: 0.02, // 20ms
        totalUpdateTime: 0.2, // 200ms
        memoryUsage: 10 * 1024 * 1024, // 10MB
        cacheHitRate: 0.8, // 80%
        spatialGridEfficiency: 0.7, // 70%
      },
      enableMemoryTracking: true,
      enableDetailedTracking: true,
      enableAlerts: true,
      alertCooldown: 5000, // 5 seconds
      retentionPeriod: 300000, // 5 minutes
      ...config,
    };

    this.isEnabled = this.config.enabled;
  }

  /**
   * Start performance measurement
   */
  startMeasurement(operation: string, metadata: Record<string, any> = {}): string {
    if (!this.shouldMeasure()) return '';

    const measurementId = this.generateMeasurementId();
    const measurement: PerformanceMeasurement = {
      operation,
      startTime: performance.now(),
      endTime: 0,
      duration: 0,
      memoryBefore: this.getCurrentMemoryUsage(),
      memoryAfter: 0,
      memoryDelta: 0,
      metadata,
    };

    this.activeMeasurements.set(measurementId, measurement);
    return measurementId;
  }

  /**
   * End performance measurement
   */
  endMeasurement(measurementId: string): PerformanceMeasurement | null {
    if (!measurementId || !this.activeMeasurements.has(measurementId)) {
      return null;
    }

    const measurement = this.activeMeasurements.get(measurementId)!;
    measurement.endTime = performance.now();
    measurement.duration = measurement.endTime - measurement.startTime;
    measurement.memoryAfter = this.getCurrentMemoryUsage();
    measurement.memoryDelta = measurement.memoryAfter - measurement.memoryBefore;

    this.activeMeasurements.delete(measurementId);
    this.addMeasurement(measurement);

    return measurement;
  }

  /**
   * Measure target selection performance
   */
  measureTargetSelection<T>(
    strategy: TargetingStrategy,
    persistenceMode: TargetPersistenceMode,
    enemyCount: number,
    operation: () => T,
  ): T {
    const measurementId = this.startMeasurement('target_selection', {
      strategy,
      persistenceMode,
      enemyCount,
    });

    try {
      const result = operation();
      const measurement = this.endMeasurement(measurementId);

      if (measurement && this.config.enableAlerts) {
        this.checkPerformanceThresholds(measurement);
      }

      return result;
    } catch (error) {
      this.endMeasurement(measurementId);
      throw error;
    }
  }

  /**
   * Measure range detection performance
   */
  measureRangeDetection<T>(enemyCount: number, enemiesInRange: number, operation: () => T): T {
    const measurementId = this.startMeasurement('range_detection', {
      enemyCount,
      enemiesInRange,
    });

    try {
      const result = operation();
      const measurement = this.endMeasurement(measurementId);

      if (measurement && this.config.enableAlerts) {
        this.checkPerformanceThresholds(measurement);
      }

      return result;
    } catch (error) {
      this.endMeasurement(measurementId);
      throw error;
    }
  }

  /**
   * Measure threat calculation performance
   */
  measureThreatCalculation<T>(
    enemyCount: number,
    strategy: TargetingStrategy,
    operation: () => T,
  ): T {
    const measurementId = this.startMeasurement('threat_calculation', {
      enemyCount,
      strategy,
    });

    try {
      const result = operation();
      const measurement = this.endMeasurement(measurementId);

      if (measurement && this.config.enableAlerts) {
        this.checkPerformanceThresholds(measurement);
      }

      return result;
    } catch (error) {
      this.endMeasurement(measurementId);
      throw error;
    }
  }

  /**
   * Get performance statistics for an operation
   */
  getStats(operation: string): PerformanceStats | null {
    return this.stats.get(operation) || null;
  }

  /**
   * Get all performance statistics
   */
  getAllStats(): Map<string, PerformanceStats> {
    return new Map(this.stats);
  }

  /**
   * Get recent measurements
   */
  getRecentMeasurements(operation?: string, limit = 100): PerformanceMeasurement[] {
    let measurements = this.measurements;

    if (operation) {
      measurements = measurements.filter((m) => m.operation === operation);
    }

    return measurements.sort((a, b) => b.startTime - a.startTime).slice(0, limit);
  }

  /**
   * Get performance alerts
   */
  getAlerts(severity?: 'low' | 'medium' | 'high' | 'critical'): PerformanceAlert[] {
    let alerts = this.alerts;

    if (severity) {
      alerts = alerts.filter((a) => a.severity === severity);
    }

    return alerts.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get performance summary
   */
  getPerformanceSummary(): {
    totalMeasurements: number;
    averagePerformance: Record<string, number>;
    currentAlerts: number;
    memoryUsage: {
      current: number;
      peak: number;
      average: number;
    };
    topSlowOperations: Array<{
      operation: string;
      averageTime: number;
      count: number;
    }>;
  } {
    const totalMeasurements = this.measurements.length;
    const averagePerformance: Record<string, number> = {};
    const currentAlerts = this.alerts.filter(
      (a) => Date.now() - a.timestamp < this.config.retentionPeriod,
    ).length;

    // Calculate average performance by operation
    for (const [operation, stats] of this.stats) {
      averagePerformance[operation] = stats.averageTime;
    }

    // Calculate memory usage
    const memoryMeasurements = this.measurements.filter((m) => m.memoryAfter > 0);
    const memoryUsage = {
      current: this.getCurrentMemoryUsage(),
      peak: Math.max(...memoryMeasurements.map((m) => m.memoryAfter), 0),
      average:
        memoryMeasurements.length > 0
          ? memoryMeasurements.reduce((sum, m) => sum + m.memoryAfter, 0) /
            memoryMeasurements.length
          : 0,
    };

    // Get top slow operations
    const topSlowOperations = Array.from(this.stats.entries())
      .map(([operation, stats]) => ({
        operation,
        averageTime: stats.averageTime,
        count: stats.count,
      }))
      .sort((a, b) => b.averageTime - a.averageTime)
      .slice(0, 5);

    return {
      totalMeasurements,
      averagePerformance,
      currentAlerts,
      memoryUsage,
      topSlowOperations,
    };
  }

  /**
   * Clear old measurements and alerts
   */
  clearOldData(): void {
    const cutoffTime = Date.now() - this.config.retentionPeriod;

    // Remove old measurements
    this.measurements = this.measurements.filter((m) => m.startTime > cutoffTime);

    // Remove old alerts
    this.alerts = this.alerts.filter((a) => a.timestamp > cutoffTime);

    // Recalculate stats
    this.recalculateStats();
  }

  /**
   * Enable/disable performance monitoring
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<PerformanceMonitorConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = this.config.enabled;
  }

  /**
   * Reset all measurements and stats
   */
  reset(): void {
    this.measurements = [];
    this.activeMeasurements.clear();
    this.alerts = [];
    this.lastAlertTimes.clear();
    this.stats.clear();
  }

  /**
   * Add measurement to collection
   */
  private addMeasurement(measurement: PerformanceMeasurement): void {
    this.measurements.push(measurement);

    // Limit measurements
    if (this.measurements.length > this.config.maxMeasurements) {
      this.measurements = this.measurements.slice(-this.config.maxMeasurements);
    }

    // Update stats
    this.updateStats(measurement);
  }

  /**
   * Update performance statistics
   */
  private updateStats(measurement: PerformanceMeasurement): void {
    const operation = measurement.operation;
    const existingStats = this.stats.get(operation);

    if (existingStats) {
      // Update existing stats
      const newCount = existingStats.count + 1;
      const newTotalTime = existingStats.totalTime + measurement.duration;
      const newAverageTime = newTotalTime / newCount;

      // Calculate percentiles (simplified)
      const operationMeasurements = this.measurements.filter((m) => m.operation === operation);
      const sortedDurations = operationMeasurements.map((m) => m.duration).sort((a, b) => a - b);

      const p50 = this.calculatePercentile(sortedDurations, 0.5);
      const p90 = this.calculatePercentile(sortedDurations, 0.9);
      const p95 = this.calculatePercentile(sortedDurations, 0.95);
      const p99 = this.calculatePercentile(sortedDurations, 0.99);

      const standardDeviation = this.calculateStandardDeviation(sortedDurations, newAverageTime);

      this.stats.set(operation, {
        operation,
        count: newCount,
        totalTime: newTotalTime,
        averageTime: newAverageTime,
        minTime: Math.min(existingStats.minTime, measurement.duration),
        maxTime: Math.max(existingStats.maxTime, measurement.duration),
        p50,
        p90,
        p95,
        p99,
        standardDeviation,
        memoryUsage: {
          average:
            (existingStats.memoryUsage.average * existingStats.count + measurement.memoryAfter) /
            newCount,
          peak: Math.max(existingStats.memoryUsage.peak, measurement.memoryAfter),
          current: measurement.memoryAfter,
        },
      });
    } else {
      // Create new stats
      this.stats.set(operation, {
        operation,
        count: 1,
        totalTime: measurement.duration,
        averageTime: measurement.duration,
        minTime: measurement.duration,
        maxTime: measurement.duration,
        p50: measurement.duration,
        p90: measurement.duration,
        p95: measurement.duration,
        p99: measurement.duration,
        standardDeviation: 0,
        memoryUsage: {
          average: measurement.memoryAfter,
          peak: measurement.memoryAfter,
          current: measurement.memoryAfter,
        },
      });
    }
  }

  /**
   * Recalculate all statistics
   */
  private recalculateStats(): void {
    this.stats.clear();

    for (const measurement of this.measurements) {
      this.updateStats(measurement);
    }
  }

  /**
   * Check performance thresholds and generate alerts
   */
  private checkPerformanceThresholds(measurement: PerformanceMeasurement): void {
    const thresholds = this.config.alertThresholds;
    const alerts: PerformanceAlert[] = [];

    // Check target selection time
    if (
      measurement.operation === 'target_selection' &&
      measurement.duration > thresholds.targetSelectionTime
    ) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'threshold_exceeded',
        severity: this.getSeverity(measurement.duration, thresholds.targetSelectionTime),
        message: `Target selection time exceeded threshold: ${measurement.duration.toFixed(2)}ms > ${thresholds.targetSelectionTime}ms`,
        threshold: thresholds.targetSelectionTime,
        actualValue: measurement.duration,
        timestamp: Date.now(),
        metadata: measurement.metadata,
      });
    }

    // Check range detection time
    if (
      measurement.operation === 'range_detection' &&
      measurement.duration > thresholds.rangeDetectionTime
    ) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'threshold_exceeded',
        severity: this.getSeverity(measurement.duration, thresholds.rangeDetectionTime),
        message: `Range detection time exceeded threshold: ${measurement.duration.toFixed(2)}ms > ${thresholds.rangeDetectionTime}ms`,
        threshold: thresholds.rangeDetectionTime,
        actualValue: measurement.duration,
        timestamp: Date.now(),
        metadata: measurement.metadata,
      });
    }

    // Check threat calculation time
    if (
      measurement.operation === 'threat_calculation' &&
      measurement.duration > thresholds.threatCalculationTime
    ) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'threshold_exceeded',
        severity: this.getSeverity(measurement.duration, thresholds.threatCalculationTime),
        message: `Threat calculation time exceeded threshold: ${measurement.duration.toFixed(2)}ms > ${thresholds.threatCalculationTime}ms`,
        threshold: thresholds.threatCalculationTime,
        actualValue: measurement.duration,
        timestamp: Date.now(),
        metadata: measurement.metadata,
      });
    }

    // Check memory usage
    if (this.config.enableMemoryTracking && measurement.memoryAfter > thresholds.memoryUsage) {
      alerts.push({
        id: this.generateAlertId(),
        type: 'memory_leak',
        severity: this.getSeverity(measurement.memoryAfter, thresholds.memoryUsage),
        message: `Memory usage exceeded threshold: ${(measurement.memoryAfter / 1024 / 1024).toFixed(2)}MB > ${(thresholds.memoryUsage / 1024 / 1024).toFixed(2)}MB`,
        threshold: thresholds.memoryUsage,
        actualValue: measurement.memoryAfter,
        timestamp: Date.now(),
        metadata: measurement.metadata,
      });
    }

    // Add alerts with cooldown
    for (const alert of alerts) {
      const lastAlertTime = this.lastAlertTimes.get(alert.type) || 0;
      if (Date.now() - lastAlertTime > this.config.alertCooldown) {
        this.alerts.push(alert);
        this.lastAlertTimes.set(alert.type, Date.now());
      }
    }
  }

  /**
   * Get severity level based on threshold exceedance
   */
  private getSeverity(
    actualValue: number,
    threshold: number,
  ): 'low' | 'medium' | 'high' | 'critical' {
    const ratio = actualValue / threshold;

    if (ratio >= 5) return 'critical';
    if (ratio >= 3) return 'high';
    if (ratio >= 2) return 'medium';
    return 'low';
  }

  /**
   * Calculate percentile
   */
  private calculatePercentile(sortedValues: number[], percentile: number): number {
    if (sortedValues.length === 0) return 0;

    const index = Math.ceil(sortedValues.length * percentile) - 1;
    return sortedValues[Math.max(0, index)] || 0;
  }

  /**
   * Calculate standard deviation
   */
  private calculateStandardDeviation(values: number[], mean: number): number {
    if (values.length === 0) return 0;

    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  /**
   * Get current memory usage
   */
  private getCurrentMemoryUsage(): number {
    if (!this.config.enableMemoryTracking) return 0;

    if (typeof performance !== 'undefined' && (performance as any).memory) {
      return (performance as any).memory.usedJSHeapSize;
    }

    return 0;
  }

  /**
   * Check if measurement should be taken
   */
  private shouldMeasure(): boolean {
    return this.isEnabled && Math.random() < this.config.sampleRate;
  }

  /**
   * Generate measurement ID
   */
  private generateMeasurementId(): string {
    return `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate alert ID
   */
  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Create performance monitor instance
 */
export function createPerformanceMonitor(
  config?: Partial<PerformanceMonitorConfig>,
): PerformanceMonitor {
  return new PerformanceMonitor(config);
}

/**
 * Performance monitoring utilities
 */
export const PerformanceUtils = {
  /**
   * Create performance thresholds for different scenarios
   */
  createThresholds(scenario: 'development' | 'production' | 'testing'): PerformanceThresholds {
    switch (scenario) {
      case 'development':
        return {
          targetSelectionTime: 1.0, // 1s - relaxed for development
          rangeDetectionTime: 0.5, // 500ms
          threatCalculationTime: 0.2, // 200ms
          totalUpdateTime: 2.0, // 2s
          memoryUsage: 50 * 1024 * 1024, // 50MB
          cacheHitRate: 0.5, // 50%
          spatialGridEfficiency: 0.5, // 50%
        };

      case 'testing':
        return {
          targetSelectionTime: 0.5, // 500ms
          rangeDetectionTime: 0.2, // 200ms
          threatCalculationTime: 0.1, // 100ms
          totalUpdateTime: 1.0, // 1s
          memoryUsage: 25 * 1024 * 1024, // 25MB
          cacheHitRate: 0.7, // 70%
          spatialGridEfficiency: 0.6, // 60%
        };

      case 'production':
      default:
        return {
          targetSelectionTime: 0.1, // 100ms
          rangeDetectionTime: 0.05, // 50ms
          threatCalculationTime: 0.02, // 20ms
          totalUpdateTime: 0.2, // 200ms
          memoryUsage: 10 * 1024 * 1024, // 10MB
          cacheHitRate: 0.8, // 80%
          spatialGridEfficiency: 0.7, // 70%
        };
    }
  },

  /**
   * Format performance measurement for logging
   */
  formatMeasurement(measurement: PerformanceMeasurement): string {
    return `[${measurement.operation}] ${measurement.duration.toFixed(2)}ms (memory: ${(measurement.memoryDelta / 1024).toFixed(2)}KB)`;
  },

  /**
   * Format performance alert for logging
   */
  formatAlert(alert: PerformanceAlert): string {
    return `[${alert.severity.toUpperCase()}] ${alert.type}: ${alert.message}`;
  },

  /**
   * Check if performance is acceptable
   */
  isPerformanceAcceptable(
    measurement: PerformanceMeasurement,
    thresholds: PerformanceThresholds,
  ): boolean {
    switch (measurement.operation) {
      case 'target_selection':
        return measurement.duration <= thresholds.targetSelectionTime;
      case 'range_detection':
        return measurement.duration <= thresholds.rangeDetectionTime;
      case 'threat_calculation':
        return measurement.duration <= thresholds.threatCalculationTime;
      default:
        return measurement.duration <= thresholds.totalUpdateTime;
    }
  },
};
