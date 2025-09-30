/**
 * Targeting Analytics System for Draconia Chronicles
 * Collects and analyzes targeting performance data and player behavior
 */

import type {
  TargetingStrategy,
  TargetPersistenceMode,
  Enemy,
  Dragon,
  TargetingMetrics,
} from './types.js';

/**
 * Analytics event types
 */
export type AnalyticsEventType =
  | 'target_selected'
  | 'target_switched'
  | 'strategy_changed'
  | 'persistence_mode_changed'
  | 'performance_measurement'
  | 'error_occurred'
  | 'session_start'
  | 'session_end';

/**
 * Analytics event data
 */
export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: number;
  sessionId: string;
  data: Record<string, any>;
  metadata: {
    version: string;
    platform: string;
    userAgent?: string;
  };
}

/**
 * Target selection analytics data
 */
export interface TargetSelectionData {
  strategy: TargetingStrategy;
  persistenceMode: TargetPersistenceMode;
  targetId: string;
  targetType: string;
  targetHealth: number;
  targetDistance: number;
  threatLevel: number;
  selectionTime: number;
  confidence: number;
  reasoning: string;
  enemyCount: number;
  enemiesInRange: number;
}

/**
 * Target switch analytics data
 */
export interface TargetSwitchData {
  fromTargetId: string;
  toTargetId: string;
  fromTargetType: string;
  toTargetType: string;
  switchReason: string;
  timeSinceLastSwitch: number;
  switchCount: number;
  strategy: TargetingStrategy;
  persistenceMode: TargetPersistenceMode;
}

/**
 * Performance measurement data
 */
export interface PerformanceData {
  targetSelectionTime: number;
  rangeDetectionTime: number;
  threatCalculationTime: number;
  totalUpdateTime: number;
  memoryUsage: number;
  enemyCount: number;
  enemiesInRange: number;
  cacheHitRate: number;
  spatialGridEfficiency: number;
}

/**
 * Strategy usage analytics
 */
export interface StrategyUsageData {
  strategy: TargetingStrategy;
  usageCount: number;
  totalTime: number;
  averageSelectionTime: number;
  successRate: number;
  averageConfidence: number;
  mostCommonTargets: Array<{
    targetType: string;
    count: number;
    percentage: number;
  }>;
}

/**
 * Session analytics data
 */
export interface SessionAnalyticsData {
  sessionId: string;
  startTime: number;
  endTime: number;
  duration: number;
  totalTargetSelections: number;
  totalTargetSwitches: number;
  strategiesUsed: TargetingStrategy[];
  persistenceModesUsed: TargetPersistenceMode[];
  averagePerformance: PerformanceData;
  strategyUsage: StrategyUsageData[];
  errors: Array<{
    type: string;
    message: string;
    timestamp: number;
    context: Record<string, any>;
  }>;
}

/**
 * Analytics configuration
 */
export interface AnalyticsConfig {
  enabled: boolean;
  sampleRate: number; // 0-1, percentage of events to collect
  maxEventsPerSession: number;
  maxSessionsInMemory: number;
  flushInterval: number; // milliseconds
  enablePerformanceTracking: boolean;
  enableErrorTracking: boolean;
  enableUserBehaviorTracking: boolean;
  privacyMode: boolean; // anonymize data
  retentionDays: number;
}

/**
 * Analytics storage interface
 */
export interface AnalyticsStorage {
  save(_event: AnalyticsEvent): Promise<void>;
  saveBatch(_events: AnalyticsEvent[]): Promise<void>;
  getEvents(_sessionId: string): Promise<AnalyticsEvent[]>;
  getSessions(_limit?: number): Promise<SessionAnalyticsData[]>;
  clearOldData(_retentionDays: number): Promise<void>;
  exportData(_format: 'json' | 'csv'): Promise<string>;
}

/**
 * Local storage implementation for analytics
 */
export class LocalAnalyticsStorage implements AnalyticsStorage {
  private readonly prefix = 'draconia_targeting_analytics_';
  private readonly maxStorageSize = 5 * 1024 * 1024; // 5MB

  async save(event: AnalyticsEvent): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    try {
      const key = `${this.prefix}event_${event.id}`;
      const serialized = JSON.stringify(event);

      // Check storage size
      if (this.getStorageSize() + serialized.length > this.maxStorageSize) {
        await this.cleanupOldData();
      }

      window.localStorage.setItem(key, serialized);
    } catch (error) {
      console.error('Failed to save analytics event:', error);
    }
  }

  async saveBatch(events: AnalyticsEvent[]): Promise<void> {
    for (const event of events) {
      await this.save(event);
    }
  }

  async getEvents(sessionId: string): Promise<AnalyticsEvent[]> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const events: AnalyticsEvent[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(`${this.prefix}event_`)) {
        try {
          const event = JSON.parse(window.localStorage.getItem(key) || '{}');
          if (event.sessionId === sessionId) {
            events.push(event);
          }
        } catch (error) {
          console.error('Failed to parse analytics event:', error);
        }
      }
    }

    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  async getSessions(limit = 100): Promise<SessionAnalyticsData[]> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return [];
    }

    const sessions = new Map<string, SessionAnalyticsData>();

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(`${this.prefix}event_`)) {
        try {
          const event = JSON.parse(window.localStorage.getItem(key) || '{}');
          if (!sessions.has(event.sessionId)) {
            sessions.set(event.sessionId, {
              sessionId: event.sessionId,
              startTime: event.timestamp,
              endTime: event.timestamp,
              duration: 0,
              totalTargetSelections: 0,
              totalTargetSwitches: 0,
              strategiesUsed: [],
              persistenceModesUsed: [],
              averagePerformance: {} as PerformanceData,
              strategyUsage: [],
              errors: [],
            });
          }

          const session = sessions.get(event.sessionId)!;
          session.endTime = Math.max(session.endTime, event.timestamp);
          session.duration = session.endTime - session.startTime;

          // Process event data
          this.processEventForSession(session, event);
        } catch (error) {
          console.error('Failed to process analytics event:', error);
        }
      }
    }

    return Array.from(sessions.values())
      .sort((a, b) => b.startTime - a.startTime)
      .slice(0, limit);
  }

  async clearOldData(retentionDays: number): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }

    const cutoffTime = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const keysToRemove: string[] = [];

    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(`${this.prefix}event_`)) {
        try {
          const event = JSON.parse(window.localStorage.getItem(key) || '{}');
          if (event.timestamp < cutoffTime) {
            keysToRemove.push(key);
          }
        } catch {
          // Remove corrupted data
          keysToRemove.push(key);
        }
      }
    }

    for (const key of keysToRemove) {
      window.localStorage.removeItem(key);
    }
  }

  async exportData(format: 'json' | 'csv'): Promise<string> {
    const events: AnalyticsEvent[] = [];

    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}event_`)) {
          try {
            const event = JSON.parse(window.localStorage.getItem(key) || '{}');
            events.push(event);
          } catch (error) {
            console.error('Failed to parse event for export:', error);
          }
        }
      }
    }

    if (format === 'json') {
      return JSON.stringify(events, null, 2);
    } else {
      return this.convertToCSV(events);
    }
  }

  private processEventForSession(session: SessionAnalyticsData, event: AnalyticsEvent): void {
    switch (event.type) {
      case 'target_selected':
        session.totalTargetSelections++;
        if (event.data.strategy && !session.strategiesUsed.includes(event.data.strategy)) {
          session.strategiesUsed.push(event.data.strategy);
        }
        if (
          event.data.persistenceMode &&
          !session.persistenceModesUsed.includes(event.data.persistenceMode)
        ) {
          session.persistenceModesUsed.push(event.data.persistenceMode);
        }
        break;
      case 'target_switched':
        session.totalTargetSwitches++;
        break;
      case 'error_occurred':
        session.errors.push({
          type: event.data.type || 'unknown',
          message: event.data.message || 'Unknown error',
          timestamp: event.timestamp,
          context: event.data.context || {},
        });
        break;
    }
  }

  private getStorageSize(): number {
    if (typeof window === 'undefined' || !window.localStorage) {
      return 0;
    }

    let size = 0;
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        size += key.length + (window.localStorage.getItem(key)?.length || 0);
      }
    }
    return size;
  }

  private async cleanupOldData(): Promise<void> {
    // Remove oldest 25% of events
    const events: Array<{ key: string; timestamp: number }> = [];

    if (typeof window !== 'undefined' && window.localStorage) {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith(`${this.prefix}event_`)) {
          try {
            const event = JSON.parse(window.localStorage.getItem(key) || '{}');
            events.push({ key, timestamp: event.timestamp });
          } catch {
            // Remove corrupted data
            window.localStorage.removeItem(key);
          }
        }
      }
    }

    events.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = Math.floor(events.length * 0.25);

    for (let i = 0; i < toRemove; i++) {
      if (typeof window !== 'undefined' && window.localStorage) {
        if (events[i]?.key) window.localStorage.removeItem(events[i]!.key);
      }
    }
  }

  private convertToCSV(events: AnalyticsEvent[]): string {
    if (events.length === 0) {
      return '';
    }

    const headers = ['id', 'type', 'timestamp', 'sessionId', 'data', 'metadata'];
    const rows = events.map((event) => [
      event.id,
      event.type,
      event.timestamp,
      event.sessionId,
      JSON.stringify(event.data),
      JSON.stringify(event.metadata),
    ]);

    return [headers, ...rows]
      .map((row) => row.map((field) => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');
  }
}

/**
 * Targeting analytics system
 */
export class TargetingAnalytics {
  private config: AnalyticsConfig;
  private storage: AnalyticsStorage;
  private sessionId: string;
  private eventQueue: AnalyticsEvent[] = [];
  private flushTimer: NodeJS.Timeout | null = null;
  private isEnabled: boolean;

  constructor(config: Partial<AnalyticsConfig> = {}, storage?: AnalyticsStorage) {
    this.config = {
      enabled: true,
      sampleRate: 1.0,
      maxEventsPerSession: 10000,
      maxSessionsInMemory: 100,
      flushInterval: 30000, // 30 seconds
      enablePerformanceTracking: true,
      enableErrorTracking: true,
      enableUserBehaviorTracking: true,
      privacyMode: false,
      retentionDays: 30,
      ...config,
    };

    this.storage = storage || new LocalAnalyticsStorage();
    this.sessionId = this.generateSessionId();
    this.isEnabled = this.config.enabled;

    if (this.isEnabled) {
      this.startSession();
      this.startFlushTimer();
    }
  }

  /**
   * Track target selection event
   */
  trackTargetSelection(data: TargetSelectionData): void {
    if (!this.shouldTrack()) return;

    this.addEvent('target_selected', {
      strategy: data.strategy,
      persistenceMode: data.persistenceMode,
      targetId: data.targetId,
      targetType: data.targetType,
      targetHealth: data.targetHealth,
      targetDistance: data.targetDistance,
      threatLevel: data.threatLevel,
      selectionTime: data.selectionTime,
      confidence: data.confidence,
      reasoning: data.reasoning,
      enemyCount: data.enemyCount,
      enemiesInRange: data.enemiesInRange,
    });
  }

  /**
   * Track target switch event
   */
  trackTargetSwitch(data: TargetSwitchData): void {
    if (!this.shouldTrack()) return;

    this.addEvent('target_switched', {
      fromTargetId: data.fromTargetId,
      toTargetId: data.toTargetId,
      fromTargetType: data.fromTargetType,
      toTargetType: data.toTargetType,
      switchReason: data.switchReason,
      timeSinceLastSwitch: data.timeSinceLastSwitch,
      switchCount: data.switchCount,
      strategy: data.strategy,
      persistenceMode: data.persistenceMode,
    });
  }

  /**
   * Track strategy change event
   */
  trackStrategyChange(strategy: TargetingStrategy, previousStrategy: TargetingStrategy): void {
    if (!this.shouldTrack()) return;

    this.addEvent('strategy_changed', {
      newStrategy: strategy,
      previousStrategy,
      changeTime: Date.now(),
    });
  }

  /**
   * Track persistence mode change event
   */
  trackPersistenceModeChange(
    mode: TargetPersistenceMode,
    previousMode: TargetPersistenceMode,
  ): void {
    if (!this.shouldTrack()) return;

    this.addEvent('persistence_mode_changed', {
      newMode: mode,
      previousMode,
      changeTime: Date.now(),
    });
  }

  /**
   * Track performance measurement
   */
  trackPerformance(data: PerformanceData): void {
    if (!this.shouldTrack() || !this.config.enablePerformanceTracking) return;

    this.addEvent('performance_measurement', {
      targetSelectionTime: data.targetSelectionTime,
      rangeDetectionTime: data.rangeDetectionTime,
      threatCalculationTime: data.threatCalculationTime,
      totalUpdateTime: data.totalUpdateTime,
      memoryUsage: data.memoryUsage,
      enemyCount: data.enemyCount,
      enemiesInRange: data.enemiesInRange,
      cacheHitRate: data.cacheHitRate,
      spatialGridEfficiency: data.spatialGridEfficiency,
    });
  }

  /**
   * Track error event
   */
  trackError(error: Error, context: Record<string, any> = {}): void {
    if (!this.shouldTrack() || !this.config.enableErrorTracking) return;

    this.addEvent('error_occurred', {
      type: error.name,
      message: error.message,
      stack: error.stack,
      context,
    });
  }

  /**
   * Get analytics summary for current session
   */
  async getSessionSummary(): Promise<SessionAnalyticsData | null> {
    try {
      const events = await this.storage.getEvents(this.sessionId);
      if (events.length === 0) return null;

      const summary: SessionAnalyticsData = {
        sessionId: this.sessionId,
        startTime: events[0]?.timestamp || 0,
        endTime: events[events.length - 1]?.timestamp || 0,
        duration: (events[events.length - 1]?.timestamp || 0) - (events[0]?.timestamp || 0),
        totalTargetSelections: 0,
        totalTargetSwitches: 0,
        strategiesUsed: [],
        persistenceModesUsed: [],
        averagePerformance: {} as PerformanceData,
        strategyUsage: [],
        errors: [],
      };

      // Process events
      for (const event of events) {
        switch (event.type) {
          case 'target_selected':
            summary.totalTargetSelections++;
            if (event.data.strategy && !summary.strategiesUsed.includes(event.data.strategy)) {
              summary.strategiesUsed.push(event.data.strategy);
            }
            if (
              event.data.persistenceMode &&
              !summary.persistenceModesUsed.includes(event.data.persistenceMode)
            ) {
              summary.persistenceModesUsed.push(event.data.persistenceMode);
            }
            break;
          case 'target_switched':
            summary.totalTargetSwitches++;
            break;
          case 'error_occurred':
            summary.errors.push({
              type: event.data.type || 'unknown',
              message: event.data.message || 'Unknown error',
              timestamp: event.timestamp,
              context: event.data.context || {},
            });
            break;
        }
      }

      return summary;
    } catch (_error) {
      console.error('Failed to get session summary:', _error);
      return null;
    }
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics(): Promise<{
    averageSelectionTime: number;
    averageUpdateTime: number;
    averageMemoryUsage: number;
    cacheHitRate: number;
    errorRate: number;
  }> {
    try {
      const events = await this.storage.getEvents(this.sessionId);
      const performanceEvents = events.filter((e) => e.type === 'performance_measurement');
      const errorEvents = events.filter((e) => e.type === 'error_occurred');

      if (performanceEvents.length === 0) {
        return {
          averageSelectionTime: 0,
          averageUpdateTime: 0,
          averageMemoryUsage: 0,
          cacheHitRate: 0,
          errorRate: 0,
        };
      }

      const totalSelectionTime = performanceEvents.reduce(
        (sum, e) => sum + (e.data.targetSelectionTime || 0),
        0,
      );
      const totalUpdateTime = performanceEvents.reduce(
        (sum, e) => sum + (e.data.totalUpdateTime || 0),
        0,
      );
      const totalMemoryUsage = performanceEvents.reduce(
        (sum, e) => sum + (e.data.memoryUsage || 0),
        0,
      );
      const totalCacheHits = performanceEvents.reduce(
        (sum, e) => sum + (e.data.cacheHitRate || 0),
        0,
      );

      return {
        averageSelectionTime: totalSelectionTime / performanceEvents.length,
        averageUpdateTime: totalUpdateTime / performanceEvents.length,
        averageMemoryUsage: totalMemoryUsage / performanceEvents.length,
        cacheHitRate: totalCacheHits / performanceEvents.length,
        errorRate: errorEvents.length / events.length,
      };
    } catch (error) {
      console.error('Failed to get performance metrics:', error);
      return {
        averageSelectionTime: 0,
        averageUpdateTime: 0,
        averageMemoryUsage: 0,
        cacheHitRate: 0,
        errorRate: 0,
      };
    }
  }

  /**
   * Export analytics data
   */
  async exportData(format: 'json' | 'csv' = 'json'): Promise<string> {
    return await this.storage.exportData(format);
  }

  /**
   * Clear old analytics data
   */
  async clearOldData(): Promise<void> {
    await this.storage.clearOldData(this.config.retentionDays);
  }

  /**
   * Enable/disable analytics
   */
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    if (enabled) {
      this.startSession();
      this.startFlushTimer();
    } else {
      this.endSession();
      this.stopFlushTimer();
    }
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
    this.isEnabled = this.config.enabled;
  }

  /**
   * End current session
   */
  endSession(): void {
    if (this.isEnabled) {
      this.addEvent('session_end', {
        sessionDuration: Date.now() - Number(this.sessionId),
        totalEvents: this.eventQueue.length,
      });
      this.flush();
    }
  }

  /**
   * Add event to queue
   */
  private addEvent(type: AnalyticsEventType, data: Record<string, any>): void {
    const event: AnalyticsEvent = {
      id: this.generateEventId(),
      type,
      timestamp: Date.now(),
      sessionId: this.sessionId,
      data: this.config.privacyMode ? this.anonymizeData(data) : data,
      metadata: {
        version: '1.0.0',
        platform: typeof window !== 'undefined' ? 'browser' : 'node',
        userAgent:
          typeof window !== 'undefined' ? window.navigator.userAgent || 'unknown' : 'unknown',
      },
    };

    this.eventQueue.push(event);

    // Flush if queue is full
    if (this.eventQueue.length >= this.config.maxEventsPerSession) {
      this.flush();
    }
  }

  /**
   * Flush events to storage
   */
  private async flush(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      await this.storage.saveBatch([...this.eventQueue]);
      this.eventQueue = [];
    } catch (error) {
      console.error('Failed to flush analytics events:', error);
    }
  }

  /**
   * Start session
   */
  private startSession(): void {
    this.addEvent('session_start', {
      sessionStartTime: Date.now(),
      config: this.config,
    });
  }

  /**
   * Start flush timer
   */
  private startFlushTimer(): void {
    this.stopFlushTimer();
    this.flushTimer = setInterval(() => {
      this.flush();
    }, this.config.flushInterval);
  }

  /**
   * Stop flush timer
   */
  private stopFlushTimer(): void {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
      this.flushTimer = null;
    }
  }

  /**
   * Check if event should be tracked
   */
  private shouldTrack(): boolean {
    return this.isEnabled && Math.random() < this.config.sampleRate;
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate event ID
   */
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Anonymize data for privacy
   */
  private anonymizeData(data: Record<string, any>): Record<string, any> {
    const anonymized = { ...data };

    // Remove or hash sensitive data
    if (anonymized.targetId) {
      anonymized.targetId = this.hashString(anonymized.targetId);
    }
    if (anonymized.sessionId) {
      anonymized.sessionId = this.hashString(anonymized.sessionId);
    }

    return anonymized;
  }

  /**
   * Hash string for anonymization
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }
}

/**
 * Create targeting analytics instance
 */
export function createTargetingAnalytics(
  config?: Partial<AnalyticsConfig>,
  storage?: AnalyticsStorage,
): TargetingAnalytics {
  return new TargetingAnalytics(config, storage);
}

/**
 * Analytics utility functions
 */
export const AnalyticsUtils = {
  /**
   * Create performance data from metrics
   */
  createPerformanceData(
    metrics: TargetingMetrics,
    enemyCount: number,
    enemiesInRange: number,
  ): PerformanceData {
    return {
      targetSelectionTime: metrics.targetSelectionTime,
      rangeDetectionTime: metrics.rangeDetectionTime,
      threatCalculationTime: metrics.threatCalculationTime,
      totalUpdateTime:
        metrics.targetSelectionTime + metrics.rangeDetectionTime + metrics.threatCalculationTime,
      memoryUsage: (performance as any).memory?.usedJSHeapSize || 0,
      enemyCount,
      enemiesInRange,
      cacheHitRate: 0,
      spatialGridEfficiency: 0,
    };
  },

  /**
   * Create target selection data
   */
  createTargetSelectionData(
    strategy: TargetingStrategy,
    persistenceMode: TargetPersistenceMode,
    target: Enemy | null,
    dragon: Dragon,
    selectionTime: number,
    confidence: number,
    reasoning: string,
    enemyCount: number,
    enemiesInRange: number,
  ): TargetSelectionData {
    return {
      strategy,
      persistenceMode,
      targetId: target?.id || 'null',
      targetType: target?.type || 'null',
      targetHealth: target ? target.health.current / target.health.max : 0,
      targetDistance: target
        ? Math.sqrt(
            Math.pow(dragon.position.x - target.position.x, 2) +
              Math.pow(dragon.position.y - target.position.y, 2),
          )
        : 0,
      threatLevel: target ? target.threatLevel || 0 : 0,
      selectionTime,
      confidence,
      reasoning,
      enemyCount,
      enemiesInRange,
    };
  },

  /**
   * Create target switch data
   */
  createTargetSwitchData(
    fromTarget: Enemy | null,
    toTarget: Enemy | null,
    switchReason: string,
    timeSinceLastSwitch: number,
    switchCount: number,
    strategy: TargetingStrategy,
    persistenceMode: TargetPersistenceMode,
  ): TargetSwitchData {
    return {
      fromTargetId: fromTarget?.id || 'null',
      toTargetId: toTarget?.id || 'null',
      fromTargetType: fromTarget?.type || 'null',
      toTargetType: toTarget?.type || 'null',
      switchReason,
      timeSinceLastSwitch,
      switchCount,
      strategy,
      persistenceMode,
    };
  },
};
