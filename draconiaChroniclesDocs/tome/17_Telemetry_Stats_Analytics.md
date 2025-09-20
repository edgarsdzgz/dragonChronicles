--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/17*Telemetry*Stats*Analytics.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 17 — Telemetry, Stats & Analytics

## Telemetry Architecture

### Core Telemetry System

```typescript

export interface TelemetrySystem {
  // Event Collection
  collectEvent: (event: TelemetryEvent) => void;
  collectMetric: (metric: TelemetryMetric) => void;
  collectError: (error: TelemetryError) => void;

  // Data Management
  flush: () => Promise<void>;
  export: () => Promise<TelemetryData>;
  clear: () => Promise<void>;

  // Configuration
  setEnabled: (enabled: boolean) => void;
  setPrivacyLevel: (level: PrivacyLevel) => void;
  setSamplingRate: (rate: number) => void;
}

export interface TelemetryEvent {
  id: string;
  timestamp: number;
  sessionId: string;
  profileId: string;
  eventType: string;
  eventData: Record<string, any>;
  context: EventContext;
}

export interface TelemetryMetric {
  id: string;
  timestamp: number;
  sessionId: string;
  profileId: string;
  metricType: string;
  value: number;
  unit: string;
  tags: Record<string, string>;
}

```javascript

### Event Collection Framework

```typescript

export class TelemetryCollector {
  private events: TelemetryEvent[] = [];
  private metrics: TelemetryMetric[] = [];
  private errors: TelemetryError[] = [];
  private isEnabled: boolean = true;
  private privacyLevel: PrivacyLevel = 'full';
  private samplingRate: number = 1.0;

  constructor(private config: TelemetryConfig) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Game events
    this.listenToGameEvents();

    // Performance events
    this.listenToPerformanceEvents();

    // Error events
    this.listenToErrorEvents();

    // User interaction events
    this.listenToUserEvents();
  }

  collectEvent(event: TelemetryEvent): void {
    if (!this.isEnabled || !this.shouldSample()) {
      return;
    }

    // Apply privacy filters
    const filteredEvent = this.applyPrivacyFilters(event);

    // Add to collection
    this.events.push(filteredEvent);

    // Check if we need to flush
    if (this.events.length >= this.config.batchSize) {
      this.flush();
    }
  }

  private shouldSample(): boolean {
    return Math.random() < this.samplingRate;
  }

  private applyPrivacyFilters(event: TelemetryEvent): TelemetryEvent {
    switch (this.privacyLevel) {
      case 'minimal':
        return this.applyMinimalPrivacy(event);
      case 'standard':
        return this.applyStandardPrivacy(event);
      case 'full':
        return event;
      default:
        return this.applyMinimalPrivacy(event);
    }
  }
}

```javascript

## Event Types & Schemas

### Gameplay Events

```typescript

export interface GameplayEvents {
  // Journey Events
  journey_start: {
    startDistance: number;
    startTime: number;
    enchants: EnchantState;
  };

  journey_end: {
    endDistance: number;
    duration: number;
    enemiesKilled: number;
    arcanaEarned: number;
    deaths: number;
    reason: 'return' | 'death' | 'manual';
  };

  // Combat Events
  enemy_killed: {
    enemyId: string;
    enemyType: string;
    distance: number;
    damageDealt: number;
    abilityUsed: string | null;
    arcanaReward: number;
  };

  player_damaged: {
    damage: number;
    source: string;
    remainingHealth: number;
    shieldAbsorbed: number;
  };

  ability_used: {
    abilityId: string;
    target: Vector2 | null;
    cooldown: number;
    powerPointsCost: number;
  };

  // Progression Events
  distance_milestone: {
    distance: number;
    land: number;
    ward: number;
    timeToReach: number;
  };

  boss_defeated: {
    bossId: string;
    bossType: string;
    duration: number;
    abilitiesUsed: string[];
    deaths: number;
    rewards: Reward[];
  };

  // Research Events
  research_started: {
    researchId: string;
    researchTitle: string;
    labLevel: number;
    materialsRequired: MaterialRequirement[];
    estimatedTime: number;
  };

  research_completed: {
    researchId: string;
    researchTitle: string;
    actualTime: number;
    materialsSpent: MaterialRequirement[];
    nodeUnlocked: string;
  };

  // Tech Tree Events
  node_unlocked: {
    nodeId: string;
    nodeName: string;
    tree: 'firecraft' | 'safety' | 'scales';
    soulPowerCost: number;
    materialsCost: MaterialRequirement[];
  };

  node_leveled: {
    nodeId: string;
    nodeName: string;
    newLevel: number;
    arcanaCost: number;
    effectsGained: Record<string, number>;
  };
}

```javascript

### Performance Events

```typescript

export interface PerformanceEvents {
  // Frame Rate Events
  fps_drop: {
    currentFPS: number;
    targetFPS: number;
    duration: number;
    cause: 'enemies' | 'effects' | 'memory' | 'unknown';
  };

  // Memory Events
  memory_usage: {
    usedMemory: number;
    totalMemory: number;
    memoryPressure: 'low' | 'medium' | 'high' | 'critical';
  };

  // Load Time Events
  scene_load: {
    sceneName: string;
    loadTime: number;
    assetCount: number;
    totalAssetSize: number;
  };

  // Error Events
  performance_error: {
    errorType: string;
    errorMessage: string;
    stackTrace: string;
    context: Record<string, any>;
  };
}

```javascript

### User Interaction Events

```typescript

export interface UserInteractionEvents {
  // UI Events
  button_clicked: {
    buttonId: string;
    buttonText: string;
    screenName: string;
    context: string;
  };

  screen_view: {
    screenName: string;
    previousScreen: string;
    timeOnScreen: number;
    interactionCount: number;
  };

  // Settings Events
  setting_changed: {
    settingName: string;
    oldValue: any;
    newValue: any;
    category: string;
  };

  // Accessibility Events
  accessibility*feature*used: {
    featureName: string;
    featureType: 'visual' | 'audio' | 'motor' | 'cognitive';
    usageCount: number;
  };
}

```text

## Analytics & Metrics

### Performance Metrics

```typescript

export interface PerformanceMetrics {
  // Frame Rate Metrics
  averageFPS: number;
  minFPS: number;
  maxFPS: number;
  fpsStability: number; // coefficient of variation

  // Frame Time Metrics
  averageFrameTime: number;
  maxFrameTime: number;
  frameTimePercentiles: {
    p50: number;
    p90: number;
    p95: number;
    p99: number;
  };

  // Memory Metrics
  averageMemoryUsage: number;
  peakMemoryUsage: number;
  memoryLeaks: number;

  // Load Time Metrics
  averageLoadTime: number;
  maxLoadTime: number;
  loadTimeReliability: number;
}

export class PerformanceAnalytics {
  private metrics: PerformanceMetrics;
  private samples: PerformanceSample[] = [];
  private maxSamples: number = 1000;

  constructor() {
    this.metrics = this.initializeMetrics();
  }

  recordSample(sample: PerformanceSample): void {
    this.samples.push(sample);

    // Trim samples if we exceed max
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    // Update metrics
    this.updateMetrics();
  }

  private updateMetrics(): void {
    if (this.samples.length === 0) return;

    const fpsValues = this.samples.map(s => s.fps);
    const frameTimeValues = this.samples.map(s => s.frameTime);
    const memoryValues = this.samples.map(s => s.memoryUsage);

    this.metrics = {
      averageFPS: this.calculateAverage(fpsValues),
      minFPS: Math.min(...fpsValues),
      maxFPS: Math.max(...fpsValues),
      fpsStability: this.calculateCoefficientOfVariation(fpsValues),

      averageFrameTime: this.calculateAverage(frameTimeValues),
      maxFrameTime: Math.max(...frameTimeValues),
      frameTimePercentiles: this.calculatePercentiles(frameTimeValues),

      averageMemoryUsage: this.calculateAverage(memoryValues),
      peakMemoryUsage: Math.max(...memoryValues),
      memoryLeaks: this.calculateMemoryLeaks(memoryValues),

      averageLoadTime: this.calculateAverageLoadTime(),
      maxLoadTime: this.calculateMaxLoadTime(),
      loadTimeReliability: this.calculateLoadTimeReliability()
    };
  }
}

```javascript

### Gameplay Analytics

```typescript

export interface GameplayAnalytics {
  // Progression Metrics
  progressionRate: number; // distance per hour
  averageSessionLength: number;
  returnFrequency: number; // returns per hour

  // Combat Metrics
  averageTimeToKill: number;
  damageDealtPerSecond: number;
  abilityUsageRate: number;
  deathRate: number;

  // Research Metrics
  researchCompletionRate: number;
  averageResearchTime: number;
  nodeUnlockRate: number;

  // Economy Metrics
  arcanaEarnedPerHour: number;
  soulPowerEarnedPerHour: number;
  goldEarnedPerHour: number;
  spendingEfficiency: number; // arcana spent vs gained

  // Engagement Metrics
  dailyActiveUsers: number;
  sessionRetention: number;
  featureUsage: Record<string, number>;
}

export class GameplayAnalytics {
  private analytics: GameplayAnalytics;
  private events: TelemetryEvent[] = [];

  constructor() {
    this.analytics = this.initializeAnalytics();
  }

  processEvents(events: TelemetryEvent[]): void {
    this.events.push(...events);
    this.updateAnalytics();
  }

  private updateAnalytics(): void {
    // Calculate progression metrics
    this.analytics.progressionRate = this.calculateProgressionRate();
    this.analytics.averageSessionLength = this.calculateAverageSessionLength();
    this.analytics.returnFrequency = this.calculateReturnFrequency();

    // Calculate combat metrics
    this.analytics.averageTimeToKill = this.calculateAverageTimeToKill();
    this.analytics.damageDealtPerSecond = this.calculateDamageDealtPerSecond();
    this.analytics.abilityUsageRate = this.calculateAbilityUsageRate();
    this.analytics.deathRate = this.calculateDeathRate();

    // Calculate research metrics
    this.analytics.researchCompletionRate = this.calculateResearchCompletionRate();
    this.analytics.averageResearchTime = this.calculateAverageResearchTime();
    this.analytics.nodeUnlockRate = this.calculateNodeUnlockRate();

    // Calculate economy metrics
    this.analytics.arcanaEarnedPerHour = this.calculateArcanaEarnedPerHour();
    this.analytics.soulPowerEarnedPerHour = this.calculateSoulPowerEarnedPerHour();
    this.analytics.goldEarnedPerHour = this.calculateGoldEarnedPerHour();
    this.analytics.spendingEfficiency = this.calculateSpendingEfficiency();

    // Calculate engagement metrics
    this.analytics.dailyActiveUsers = this.calculateDailyActiveUsers();
    this.analytics.sessionRetention = this.calculateSessionRetention();
    this.analytics.featureUsage = this.calculateFeatureUsage();
  }
}

```text

## Privacy & Data Protection

### Privacy Levels

```typescript

export enum PrivacyLevel {
  MINIMAL = 'minimal',     // Only essential gameplay events
  STANDARD = 'standard',   // Standard analytics with anonymized data
  FULL = 'full'           // Full telemetry with user consent
}

export interface PrivacySettings {
  level: PrivacyLevel;
  analyticsEnabled: boolean;
  crashReportingEnabled: boolean;
  performanceMonitoringEnabled: boolean;
  userBehaviorTrackingEnabled: boolean;
  dataRetentionDays: number;
  dataSharingEnabled: boolean;
}

export class PrivacyManager {
  private settings: PrivacySettings;

  constructor(settings: PrivacySettings) {
    this.settings = settings;
  }

  filterEvent(event: TelemetryEvent): TelemetryEvent | null {
    if (!this.shouldCollectEvent(event)) {
      return null;
    }

    return this.applyPrivacyFilters(event);
  }

  private shouldCollectEvent(event: TelemetryEvent): boolean {
    switch (this.settings.level) {
      case PrivacyLevel.MINIMAL:
        return this.isEssentialEvent(event);
      case PrivacyLevel.STANDARD:
        return this.isStandardEvent(event);
      case PrivacyLevel.FULL:
        return true;
      default:
        return false;
    }
  }

  private applyPrivacyFilters(event: TelemetryEvent): TelemetryEvent {
    const filteredEvent = { ...event };

    // Remove or anonymize sensitive data
    if (this.settings.level === PrivacyLevel.MINIMAL) {
      filteredEvent.profileId = this.anonymizeProfileId(event.profileId);
      filteredEvent.eventData = this.filterEventData(event.eventData);
    }

    return filteredEvent;
  }

  private anonymizeProfileId(profileId: string): string {
    // Create deterministic hash of profile ID
    return this.hashString(profileId);
  }

  private filterEventData(eventData: Record<string, any>): Record<string, any> {
    // Remove sensitive information
    const filtered: Record<string, any> = {};

    for (const [key, value] of Object.entries(eventData)) {
      if (this.isAllowedField(key)) {
        filtered[key] = value;
      }
    }

    return filtered;
  }
}

```javascript

### Data Retention & Cleanup

```typescript

export class DataRetentionManager {
  private retentionDays: number;
  private cleanupInterval: number;

  constructor(retentionDays: number = 30) {
    this.retentionDays = retentionDays;
    this.cleanupInterval = 24 * 60 * 60 * 1000; // 24 hours
    this.startCleanupTimer();
  }

  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredData();
    }, this.cleanupInterval);
  }

  private async cleanupExpiredData(): Promise<void> {
    const cutoffDate = Date.now() - (this.retentionDays * 24 * 60 * 60 * 1000);

    // Clean up old events
    await this.cleanupOldEvents(cutoffDate);

    // Clean up old metrics
    await this.cleanupOldMetrics(cutoffDate);

    // Clean up old logs
    await this.cleanupOldLogs(cutoffDate);
  }

  private async cleanupOldEvents(cutoffDate: number): Promise<void> {
    // Remove events older than cutoff date
    // Implementation depends on storage backend
  }
}

```text

## Export & Reporting

### Data Export

```typescript

export class TelemetryExporter {
  private db: DraconiaDatabase;

  constructor(db: DraconiaDatabase) {
    this.db = db;
  }

  async exportTelemetryData(
    profileId: string,
    startDate: number,
    endDate: number,
    format: 'json' | 'csv' | 'ndjson'
  ): Promise<ExportedTelemetryData> {
    const events = await this.db.telemetry
      .where('profileId')
      .equals(profileId)
      .and(event => event.timestamp >= startDate && event.timestamp <= endDate)
      .toArray();

    const metrics = await this.db.metrics
      .where('profileId')
      .equals(profileId)
      .and(metric => metric.timestamp >= startDate && metric.timestamp <= endDate)
      .toArray();

    return {
      profileId,
      exportDate: Date.now(),
      startDate,
      endDate,
      format,
      events,
      metrics,
      summary: this.generateSummary(events, metrics)
    };
  }

private generateSummary(events: TelemetryEvent[], metrics: TelemetryMetric[]):
TelemetrySummary
{
    return {
      totalEvents: events.length,
      totalMetrics: metrics.length,
      eventTypes: this.countEventTypes(events),
      averageFPS: this.calculateAverageFPS(metrics),
      totalPlaytime: this.calculateTotalPlaytime(events),
      progressionRate: this.calculateProgressionRate(events)
    };
  }
}

```bash

### Analytics Dashboard

```typescript

export class AnalyticsDashboard {
  private analytics: GameplayAnalytics;
  private performanceMetrics: PerformanceMetrics;

  constructor() {
    this.analytics = new GameplayAnalytics();
    this.performanceMetrics = new PerformanceMetrics();
  }

  generateReport(timeRange: TimeRange): AnalyticsReport {
    return {
      timeRange,
      gameplay: this.analytics,
      performance: this.performanceMetrics,
      insights: this.generateInsights(),
      recommendations: this.generateRecommendations()
    };
  }

  private generateInsights(): Insight[] {
    const insights: Insight[] = [];

    // Performance insights
    if (this.performanceMetrics.averageFPS < 50) {
      insights.push({
        type: 'performance',
        severity: 'warning',
        message: 'Average FPS is below target. Consider reducing quality settings.',
        recommendation: 'Enable performance optimizations'
      });
    }

    // Gameplay insights
    if (this.analytics.deathRate > 0.1) {
      insights.push({
        type: 'gameplay',
        severity: 'info',
        message: 'High death rate detected. Players may need difficulty adjustments.',
        recommendation: 'Review difficulty scaling'
      });
    }

    return insights;
  }
}

```javascript

## Acceptance Criteria

- [ ] Telemetry system collects all required game events

- [ ] Performance metrics track frame rate, memory, and load times

- [ ] Privacy system protects user data according to settings

- [ ] Analytics provide meaningful insights into player behavior

- [ ] Data retention system automatically cleans up old data

- [ ] Export system allows users to download their data

- [ ] Reporting system generates actionable insights

- [ ] Error tracking captures and reports application errors

- [ ] User interaction tracking provides UX insights

- [ ] Data validation ensures telemetry data integrity
