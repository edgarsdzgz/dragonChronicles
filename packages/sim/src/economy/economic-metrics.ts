/**
 * Economic Metrics Collection System
 *
 * This module provides comprehensive metrics collection for economic events,
 * performance monitoring, and balance analysis.
 */

import type {
  ArcanaDropManager,
  SoulPowerDropManager,
  EnchantManager,
  EconomicEvent as _EconomicEvent,
  ArcanaBalance,
  SoulPowerBalance,
} from './types.js';
import type { EnchantSystem } from './enchant-types.js';
import type { SoulForgingSystem } from './soul-forging.js';

/**
 * Economic event types for metrics collection
 */
export type EconomicEventType =
  | 'arcana_drop'
  | 'arcana_spend'
  | 'soul_power_drop'
  | 'soul_power_spend'
  | 'enchant_purchase'
  | 'soul_forging_purchase'
  | 'balance_change'
  | 'cost_calculation'
  | 'performance_event';

/**
 * Detailed economic event for metrics
 */
export interface DetailedEconomicEvent {
  /** Event type */
  type: EconomicEventType;
  /** Event timestamp */
  timestamp: number;
  /** Event data */
  data: Record<string, unknown>;
  /** Performance metrics */
  performance?: {
    /** Time taken to process the event in milliseconds */
    processingTime: number;
    /** Memory usage at the time of the event */
    memoryUsage: number;
    /** CPU usage at the time of the event */
    cpuUsage: number;
  };
}

/**
 * Metrics collection _configuration
 */
export interface MetricsConfig {
  /** Whether to collect detailed performance metrics */
  collectPerformance: boolean;
  /** Maximum number of events to store in memory */
  maxEvents: number;
  /** Whether to enable real-time analysis */
  enableRealTimeAnalysis: boolean;
  /** Sampling rate for performance metrics (0-1) */
  performanceSamplingRate: number;
}

/**
 * Economic metrics snapshot
 */
export interface EconomicMetricsSnapshot {
  /** Timestamp of the snapshot */
  timestamp: number;
  /** Arcana balance at the time of snapshot */
  arcanaBalance: ArcanaBalance;
  /** Soul Power balance at the time of snapshot */
  soulPowerBalance: SoulPowerBalance;
  /** Enchant system state at the time of snapshot */
  enchantSystem: EnchantSystem;
  /** Soul Forging system state at the time of snapshot */
  soulForgingSystem: SoulForgingSystem;
  /** Performance metrics at the time of snapshot */
  performance: {
    /** Memory usage in MB */
    memoryUsage: number;
    /** CPU usage percentage */
    cpuUsage: number;
    /** Frame time in milliseconds */
    frameTime: number;
  };
}

/**
 * Economic metrics collector
 */
export class EconomicMetricsCollector {
  private _events: DetailedEconomicEvent[] = [];
  private _snapshots: EconomicMetricsSnapshot[] = [];
  private __config: MetricsConfig;
  private _startTime: number;
  private _isCollecting: boolean = false;

  constructor(
    _config: MetricsConfig = {
      collectPerformance: true,
      maxEvents: 10000,
      enableRealTimeAnalysis: false,
      performanceSamplingRate: 0.1,
    },
  ) {
    this.__config = _config;
    this._startTime = Date.now();
  }

  /**
   * Start collecting metrics
   */
  startCollection(): void {
    this._isCollecting = true;
    this._startTime = Date.now();
  }

  /**
   * Stop collecting metrics
   */
  stopCollection(): void {
    this._isCollecting = false;
  }

  /**
   * Check if metrics collection is active
   */
  get isCollecting(): boolean {
    return this._isCollecting;
  }

  /**
   * Record an economic event
   */
  recordEvent(
    type: EconomicEventType,
    data: Record<string, unknown>,
    processingTime?: number,
  ): void {
    if (!this._isCollecting) {
      return;
    }

    const event: DetailedEconomicEvent = {
      type,
      timestamp: Date.now(),
      data,
    };

    // Add performance metrics if enabled and provided
    if (this.__config.collectPerformance && processingTime !== undefined) {
      event.performance = {
        processingTime,
        memoryUsage: this._getMemoryUsage(),
        cpuUsage: this._getCpuUsage(),
      };
    }

    this._events.push(event);

    // Trim events if we exceed the maximum
    if (this._events.length > this.__config.maxEvents) {
      this._events = this._events.slice(-this.__config.maxEvents);
    }

    // Real-time analysis if enabled
    if (this.__config.enableRealTimeAnalysis) {
      this._performRealTimeAnalysis(event);
    }
  }

  /**
   * Take a snapshot of current economic state
   */
  takeSnapshot(
    arcanaManager: ArcanaDropManager,
    soulPowerManager: SoulPowerDropManager,
    enchantManager: EnchantManager,
  ): void {
    if (!this._isCollecting) {
      return;
    }

    const snapshot: EconomicMetricsSnapshot = {
      timestamp: Date.now(),
      arcanaBalance: arcanaManager.balance,
      soulPowerBalance: soulPowerManager.balance,
      enchantSystem: enchantManager.system,
      soulForgingSystem: {
        temporaryLevels: enchantManager.system.soulForging.temporary,
        permanentLevels: enchantManager.system.soulForging.permanent,
        totalCapExtension: 0, // Will be calculated from _config
        config: enchantManager.config,
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
        memoryUsage: this._getMemoryUsage(),
        cpuUsage: this._getCpuUsage(),
        frameTime: this._getFrameTime(),
      },
    };

    this._snapshots.push(snapshot);
  }

  /**
   * Get all collected events
   */
  getEvents(): DetailedEconomicEvent[] {
    return [...this._events];
  }

  /**
   * Get events of a specific type
   */
  getEventsByType(type: EconomicEventType): DetailedEconomicEvent[] {
    return this._events.filter((event) => event.type === type);
  }

  /**
   * Get events within a time range
   */
  getEventsInRange(startTime: number, _endTime: number): DetailedEconomicEvent[] {
    return this._events.filter(
      (event) => event.timestamp >= startTime && event.timestamp <= _endTime,
    );
  }

  /**
   * Get all snapshots
   */
  getSnapshots(): EconomicMetricsSnapshot[] {
    return [...this._snapshots];
  }

  /**
   * Get the latest snapshot
   */
  getLatestSnapshot(): EconomicMetricsSnapshot | undefined {
    return this._snapshots[this._snapshots.length - 1];
  }

  /**
   * Get metrics summary
   */
  getMetricsSummary(): {
    totalEvents: number;
    eventsByType: Record<EconomicEventType, number>;
    collectionDuration: number;
    averageEventsPerSecond: number;
    performanceSummary: {
      averageProcessingTime: number;
      peakProcessingTime: number;
      averageMemoryUsage: number;
      peakMemoryUsage: number;
    };
  } {
    const totalEvents = this._events.length;
    const collectionDuration = Date.now() - this._startTime;
    const averageEventsPerSecond = totalEvents / (collectionDuration / 1000);

    // Count events by type
    const eventsByType = {} as Record<EconomicEventType, number>;
    for (const event of this._events) {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    }

    // Calculate performance summary
    const performanceEvents = this._events.filter((e) => e.performance);
    const performanceSummary = {
      averageProcessingTime: 0,
      peakProcessingTime: 0,
      averageMemoryUsage: 0,
      peakMemoryUsage: 0,
    };

    if (performanceEvents.length > 0) {
      const totalProcessingTime = performanceEvents.reduce(
        (sum, e) => sum + (e.performance?.processingTime || 0),
        0,
      );
      performanceSummary.averageProcessingTime = totalProcessingTime / performanceEvents.length;
      performanceSummary.peakProcessingTime = Math.max(
        ...performanceEvents.map((e) => e.performance?.processingTime || 0),
      );

      const totalMemoryUsage = performanceEvents.reduce(
        (sum, e) => sum + (e.performance?.memoryUsage || 0),
        0,
      );
      performanceSummary.averageMemoryUsage = totalMemoryUsage / performanceEvents.length;
      performanceSummary.peakMemoryUsage = Math.max(
        ...performanceEvents.map((e) => e.performance?.memoryUsage || 0),
      );
    }

    return {
      totalEvents,
      eventsByType,
      collectionDuration,
      averageEventsPerSecond,
      performanceSummary,
    };
  }

  /**
   * Clear all collected data
   */
  clear(): void {
    this._events = [];
    this._snapshots = [];
    this._startTime = Date.now();
  }

  /**
   * Export metrics data
   */
  exportData(): {
    events: DetailedEconomicEvent[];
    snapshots: EconomicMetricsSnapshot[];
    summary: ReturnType<EconomicMetricsCollector['getMetricsSummary']>;
    config: MetricsConfig;
  } {
    return {
      events: this._events,
      snapshots: this._snapshots,
      summary: this.getMetricsSummary(),
      config: this.__config,
    };
  }

  /**
   * Get memory usage (simplified implementation)
   */
  private _getMemoryUsage(): number {
    if (typeof performance !== 'undefined' && 'memory' in performance) {
      const perfMemory = (performance as unknown as { memory: { usedJSHeapSize: number } }).memory;
      return perfMemory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  }

  /**
   * Get CPU usage (simplified implementation)
   */
  private _getCpuUsage(): number {
    // This is a simplified implementation
    // In a real implementation, this would use more sophisticated CPU monitoring
    return Math.random() * 100; // Placeholder
  }

  /**
   * Get frame time (simplified implementation)
   */
  private _getFrameTime(): number {
    // This is a simplified implementation
    // In a real implementation, this would measure actual frame time
    return 16; // Target 60 FPS
  }

  /**
   * Perform real-time analysis on an event
   */
  private _performRealTimeAnalysis(event: DetailedEconomicEvent): void {
    // This is a placeholder for real-time analysis
    // In a real implementation, this would perform actual analysis
    console.log(`Real-time analysis: ${event.type} at ${event.timestamp}`);
  }
}

/**
 * Create a new economic metrics collector
 */
export function createEconomicMetricsCollector(_config?: MetricsConfig): EconomicMetricsCollector {
  return new EconomicMetricsCollector(_config);
}
