/**
 * Economic Metrics Collection Tests
 *
 * Tests for the economic metrics collection system including event tracking,
 * performance monitoring, and data export.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createEconomicMetricsCollector,
  type EconomicMetricsCollector,
  type DetailedEconomicEvent,
  type EconomicEventType,
} from '../../packages/sim/src/economy/economic-metrics.js';
import { DefaultArcanaDropManager } from '../../packages/sim/src/economy/arcana-drop-manager.js';
import { DefaultSoulPowerDropManager } from '../../packages/sim/src/economy/soul-power-drop-manager.js';
import { DefaultEnchantManager } from '../../packages/sim/src/economy/enchant-manager.js';
import type {
  ArcanaDropConfig,
  SoulPowerDropConfig,
  EnchantConfig,
} from '../../packages/sim/src/economy/types.js';

describe('Economic Metrics Collector', () => {
  let collector: EconomicMetricsCollector;
  let arcanaManager: DefaultArcanaDropManager;
  let soulPowerManager: DefaultSoulPowerDropManager;
  let enchantManager: DefaultEnchantManager;

  beforeEach(() => {
    collector = createEconomicMetricsCollector({
      collectPerformance: true,
      maxEvents: 1000,
      enableRealTimeAnalysis: false,
      performanceSamplingRate: 0.1,
    });

    // Create mock configurations
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

    arcanaManager = new DefaultArcanaDropManager(arcanaConfig);
    soulPowerManager = new DefaultSoulPowerDropManager(soulPowerConfig);
    enchantManager = new DefaultEnchantManager(enchantConfig);
  });

  describe('Collection Control', () => {
    it('should start and stop collection', () => {
      expect(collector.isCollecting).toBe(false);

      collector.startCollection();
      expect(collector.isCollecting).toBe(true);

      collector.stopCollection();
      expect(collector.isCollecting).toBe(false);
    });

    it('should not record events when not collecting', () => {
      collector.recordEvent('arcana_drop', { amount: 10 });
      expect(collector.getEvents()).toHaveLength(0);
    });

    it('should record events when collecting', () => {
      collector.startCollection();
      collector.recordEvent('arcana_drop', { amount: 10 });
      expect(collector.getEvents()).toHaveLength(1);
    });
  });

  describe('Event Recording', () => {
    beforeEach(() => {
      collector.startCollection();
    });

    it('should record different event types', () => {
      const eventTypes: EconomicEventType[] = [
        'arcana_drop',
        'arcana_spend',
        'soul_power_drop',
        'soul_power_spend',
        'enchant_purchase',
        'soul_forging_purchase',
        'balance_change',
        'cost_calculation',
        'performance_event',
      ];

      eventTypes.forEach((type, index) => {
        collector.recordEvent(type, { testData: index });
      });

      const events = collector.getEvents();
      expect(events).toHaveLength(eventTypes.length);

      eventTypes.forEach((type, index) => {
        expect(events[index]?.type).toBe(type);
        expect(events[index]?.data.testData).toBe(index);
      });
    });

    it('should include performance metrics when enabled', () => {
      collector.recordEvent('arcana_drop', { amount: 10 }, 5);

      const events = collector.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.performance).toBeDefined();
      expect(events[0]?.performance?.processingTime).toBe(5);
      expect(events[0]?.performance?.memoryUsage).toBeGreaterThanOrEqual(0);
      expect(events[0]?.performance?.cpuUsage).toBeGreaterThanOrEqual(0);
    });

    it('should not include performance metrics when disabled', () => {
      const collectorWithoutPerformance = createEconomicMetricsCollector({
        collectPerformance: false,
        maxEvents: 1000,
        enableRealTimeAnalysis: false,
        performanceSamplingRate: 0.1,
      });

      collectorWithoutPerformance.startCollection();
      collectorWithoutPerformance.recordEvent('arcana_drop', { amount: 10 }, 5);

      const events = collectorWithoutPerformance.getEvents();
      expect(events).toHaveLength(1);
      expect(events[0]?.performance).toBeUndefined();
    });

    it('should trim events when exceeding maximum', () => {
      const collectorWithLimit = createEconomicMetricsCollector({
        collectPerformance: false,
        maxEvents: 5,
        enableRealTimeAnalysis: false,
        performanceSamplingRate: 0.1,
      });

      collectorWithLimit.startCollection();

      // Record 10 events (exceeds limit of 5)
      for (let i = 0; i < 10; i++) {
        collectorWithLimit.recordEvent('arcana_drop', { index: i });
      }

      const events = collectorWithLimit.getEvents();
      expect(events).toHaveLength(5);
      // Should keep the last 5 events
      expect(events[0]?.data.index).toBe(5);
      expect(events[4]?.data.index).toBe(9);
    });
  });

  describe('Event Filtering', () => {
    beforeEach(() => {
      collector.startCollection();

      // Record various events
      collector.recordEvent('arcana_drop', { amount: 10 });
      collector.recordEvent('soul_power_drop', { amount: 5 });
      collector.recordEvent('arcana_drop', { amount: 15 });
      collector.recordEvent('enchant_purchase', { type: 'firepower' });
      collector.recordEvent('soul_power_drop', { amount: 8 });
    });

    it('should filter events by type', () => {
      const arcanaEvents = collector.getEventsByType('arcana_drop');
      expect(arcanaEvents).toHaveLength(2);
      expect(arcanaEvents.every((e) => e.type === 'arcana_drop')).toBe(true);

      const soulPowerEvents = collector.getEventsByType('soul_power_drop');
      expect(soulPowerEvents).toHaveLength(2);
      expect(soulPowerEvents.every((e) => e.type === 'soul_power_drop')).toBe(true);

      const enchantEvents = collector.getEventsByType('enchant_purchase');
      expect(enchantEvents).toHaveLength(1);
      expect(enchantEvents[0]?.type).toBe('enchant_purchase');
    });

    it('should filter events by time range', () => {
      const startTime = Date.now() - 1000;
      const endTime = Date.now() + 1000;

      const eventsInRange = collector.getEventsInRange(startTime, endTime);
      expect(eventsInRange).toHaveLength(5);

      // All events should be within the time range
      eventsInRange.forEach((event) => {
        expect(event.timestamp).toBeGreaterThanOrEqual(startTime);
        expect(event.timestamp).toBeLessThanOrEqual(endTime);
      });
    });

    it('should return empty array for events outside time range', () => {
      const futureStart = Date.now() + 10000;
      const futureEnd = Date.now() + 20000;

      const futureEvents = collector.getEventsInRange(futureStart, futureEnd);
      expect(futureEvents).toHaveLength(0);
    });
  });

  describe('Snapshot Management', () => {
    beforeEach(() => {
      collector.startCollection();
    });

    it('should take snapshots', () => {
      collector.takeSnapshot(arcanaManager, soulPowerManager, enchantManager);

      const snapshots = collector.getSnapshots();
      expect(snapshots).toHaveLength(1);

      const snapshot = snapshots[0];
      expect(snapshot?.timestamp).toBeGreaterThan(0);
      expect(snapshot?.arcanaBalance).toBeDefined();
      expect(snapshot?.soulPowerBalance).toBeDefined();
      expect(snapshot?.enchantSystem).toBeDefined();
      expect(snapshot?.soulForgingSystem).toBeDefined();
      expect(snapshot?.performance).toBeDefined();
    });

    it('should get latest snapshot', () => {
      collector.takeSnapshot(arcanaManager, soulPowerManager, enchantManager);

      const latestSnapshot = collector.getLatestSnapshot();
      expect(latestSnapshot).toBeDefined();
      expect(latestSnapshot?.timestamp).toBeGreaterThan(0);
    });

    it('should return undefined for latest snapshot when none exist', () => {
      const latestSnapshot = collector.getLatestSnapshot();
      expect(latestSnapshot).toBeUndefined();
    });
  });

  describe('Metrics Summary', () => {
    beforeEach(() => {
      collector.startCollection();

      // Record various events with performance data
      collector.recordEvent('arcana_drop', { amount: 10 }, 5);
      collector.recordEvent('soul_power_drop', { amount: 5 }, 3);
      collector.recordEvent('enchant_purchase', { type: 'firepower' }, 8);
    });

    it('should generate metrics summary', () => {
      const summary = collector.getMetricsSummary();

      expect(summary.totalEvents).toBe(3);
      expect(summary.eventsByType).toBeDefined();
      expect(summary.eventsByType.arcana_drop).toBe(1);
      expect(summary.eventsByType.soul_power_drop).toBe(1);
      expect(summary.eventsByType.enchant_purchase).toBe(1);
      expect(summary.collectionDuration).toBeGreaterThanOrEqual(0); // Can be 0 in test mode
      expect(summary.averageEventsPerSecond).toBeGreaterThanOrEqual(0); // Can be 0 in test mode
      expect(summary.performanceSummary).toBeDefined();
    });

    it('should calculate performance summary correctly', () => {
      const summary = collector.getMetricsSummary();
      const perfSummary = summary.performanceSummary;

      expect(perfSummary.averageProcessingTime).toBeGreaterThan(0);
      expect(perfSummary.peakProcessingTime).toBeGreaterThan(0);
      expect(perfSummary.averageMemoryUsage).toBeGreaterThanOrEqual(0);
      expect(perfSummary.peakMemoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Data Export', () => {
    beforeEach(() => {
      collector.startCollection();

      collector.recordEvent('arcana_drop', { amount: 10 }, 5);
      collector.takeSnapshot(arcanaManager, soulPowerManager, enchantManager);
    });

    it('should export complete data', () => {
      const exportedData = collector.exportData();

      expect(exportedData.events).toBeDefined();
      expect(exportedData.snapshots).toBeDefined();
      expect(exportedData.summary).toBeDefined();
      expect(exportedData.config).toBeDefined();

      expect(exportedData.events).toHaveLength(1);
      expect(exportedData.snapshots).toHaveLength(1);
      expect(exportedData.summary.totalEvents).toBe(1);
    });
  });

  describe('Data Clearing', () => {
    beforeEach(() => {
      collector.startCollection();

      collector.recordEvent('arcana_drop', { amount: 10 });
      collector.takeSnapshot(arcanaManager, soulPowerManager, enchantManager);
    });

    it('should clear all data', () => {
      expect(collector.getEvents()).toHaveLength(1);
      expect(collector.getSnapshots()).toHaveLength(1);

      collector.clear();

      expect(collector.getEvents()).toHaveLength(0);
      expect(collector.getSnapshots()).toHaveLength(0);
      expect(collector.getMetricsSummary().totalEvents).toBe(0);
    });
  });

  describe('Real-time Analysis', () => {
    it('should perform real-time analysis when enabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      const collectorWithAnalysis = createEconomicMetricsCollector({
        collectPerformance: false,
        maxEvents: 1000,
        enableRealTimeAnalysis: true,
        performanceSamplingRate: 0.1,
      });

      collectorWithAnalysis.startCollection();
      collectorWithAnalysis.recordEvent('arcana_drop', { amount: 10 });

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Real-time analysis: arcana_drop'),
      );

      consoleSpy.mockRestore();
    });

    it('should not perform real-time analysis when disabled', () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      collector.startCollection();
      collector.recordEvent('arcana_drop', { amount: 10 });

      expect(consoleSpy).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
