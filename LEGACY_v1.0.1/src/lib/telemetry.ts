// MVP 1.1 Principal Engineer Implementation - NDJSON Telemetry per CTO Spec §8
import { Decimal } from '$lib/num/decimal';
import { logWriter } from './logWriter';

interface TelemetryEvent {
  timestamp: number;
  event: string;
  [key: string]: any;
}

interface PurchaseEvent extends TelemetryEvent {
  event: 'purchase';
  enchant: 'firepower' | 'scales';
  fromLevel: number;
  toLevel: number;
  costStr: string;
  arcanaAfterStr: string;
}

interface TierUpEvent extends TelemetryEvent {
  event: 'tierUp';
  enchant: 'firepower' | 'scales';
  fromTier: 1 | 2 | 3;
  costStr: string;
  arcanaAfterStr: string;
}

interface OfflinePayoutEvent extends TelemetryEvent {
  event: 'offlinePayout';
  elapsedSec: string;
  arcanaRateStr: string;
  arcanaGainStr: string;
}

interface ResetJourneyEvent extends TelemetryEvent {
  event: 'resetJourney';
  runTotalDistanceKmStr: string;
  lifetimeTotalsStr: string;
}

interface FormatBoundaryEvent extends TelemetryEvent {
  event: 'formatBoundary';
  fromNotation: string;
  toNotation: string;
  valueStr: string;
}

interface RateSampleEvent extends TelemetryEvent {
  event: 'rateSamples';
  ewmaArcanaPerSecStr: string;
}

class TelemetrySystem {
  private buffer: string[] = [];
  private maxLines = 5000;
  private lastRateSampleTime = 0;
  private rateSampleInterval = 10000; // 10 seconds

  /**
   * Add event to NDJSON buffer
   */
  private addEvent(event: TelemetryEvent): void {
    const line = JSON.stringify(event);
    this.buffer.push(line);
    
    // Keep buffer within size limit (drop oldest)
    if (this.buffer.length > this.maxLines) {
      this.buffer.shift();
    }
    
    // Persist to localStorage for crash recovery
    this.persistBuffer();
    
    // Real-time log to file system
    if (typeof window !== 'undefined') {
      logWriter.logTelemetry(event.event, event);
    }
  }

  /**
   * Log enchant purchase
   */
  logPurchase(
    enchant: 'firepower' | 'scales',
    fromLevel: number,
    toLevel: number,
    cost: Decimal,
    arcanaAfter: Decimal
  ): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'purchase',
      enchant,
      fromLevel,
      toLevel,
      costStr: cost.toString(),
      arcanaAfterStr: arcanaAfter.toString(),
    } as PurchaseEvent);
  }

  /**
   * Log tier up
   */
  logTierUp(
    enchant: 'firepower' | 'scales',
    fromTier: 1 | 2 | 3,
    cost: Decimal,
    arcanaAfter: Decimal
  ): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'tierUp',
      enchant,
      fromTier,
      costStr: cost.toString(),
      arcanaAfterStr: arcanaAfter.toString(),
    } as TierUpEvent);
  }

  /**
   * Log offline payout
   */
  logOfflinePayout(
    elapsedSec: Decimal,
    arcanaRate: Decimal,
    arcanaGain: Decimal
  ): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'offlinePayout',
      elapsedSec: elapsedSec.toString(),
      arcanaRateStr: arcanaRate.toString(),
      arcanaGainStr: arcanaGain.toString(),
    } as OfflinePayoutEvent);
  }

  /**
   * Log journey reset
   */
  logResetJourney(
    runTotalDistanceKm: Decimal,
    lifetimeTotalDistanceKm: Decimal
  ): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'resetJourney',
      runTotalDistanceKmStr: runTotalDistanceKm.toString(),
      lifetimeTotalsStr: lifetimeTotalDistanceKm.toString(),
    } as ResetJourneyEvent);
  }

  /**
   * Log format boundary crossing (e.g., e→ee)
   */
  logFormatBoundary(
    fromNotation: string,
    toNotation: string,
    value: Decimal
  ): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'formatBoundary',
      fromNotation,
      toNotation,
      valueStr: value.toString(),
    } as FormatBoundaryEvent);
  }

  /**
   * Log EWMA rate samples (throttled to every 10 seconds)
   */
  logRateSample(ewmaArcanaPerSec: Decimal): void {
    const now = Date.now();
    if (now - this.lastRateSampleTime < this.rateSampleInterval) {
      return; // Throttle to prevent spam
    }
    
    this.lastRateSampleTime = now;
    
    this.addEvent({
      timestamp: now,
      event: 'rateSamples',
      ewmaArcanaPerSecStr: ewmaArcanaPerSec.toString(),
    } as RateSampleEvent);
  }

  /**
   * Enemy MVP 1.1 Telemetry Events per Spec §11
   */
  logEnemySpawn(type: string, land: number, x: number, y: number): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'enemySpawn',
      type,
      land,
      x,
      y,
    });
  }

  logEnemyDeath(type: string, killedBy: 'player' | 'offscreen' | 'other', overkill: string): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'enemyDeath',
      type,
      killedBy,
      overkillStr: overkill,
    });
  }

  logEnemyHit(type: string, amount: Decimal): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'enemyHit',
      type,
      amountStr: amount.toString(),
    });
  }

  logPlayerHit(amount: Decimal): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'playerHit',
      amountStr: amount.toString(),
    });
  }

  logProjectileSpawn(side: 'player' | 'enemy'): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'projectileSpawn',
      side,
    });
  }

  logProjectileDespawn(reason: 'hit' | 'timeout' | 'offscreen'): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'projectileDespawn',
      reason,
    });
  }

  logBossSpawn(): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'bossSpawn',
    });
  }

  logBossDeath(): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'bossDeath',
    });
  }

  logFPSDrop(fps: number, duration: number): void {
    this.addEvent({
      timestamp: Date.now(),
      event: 'fpsDrop',
      fps,
      durationMs: duration,
    });
  }

  /**
   * Get buffer as NDJSON string for download
   */
  exportNDJSON(): string {
    return this.buffer.join('\n');
  }

  /**
   * Download logs as NDJSON file
   */
  downloadLogs(): void {
    const ndjson = this.exportNDJSON();
    const blob = new Blob([ndjson], { type: 'application/x-ndjson' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `dragonchronicles-logs-${new Date().toISOString().slice(0, 19)}.ndjson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.buffer = [];
    localStorage.removeItem('dragonChronicles_telemetry');
  }

  /**
   * Get current buffer size
   */
  getBufferSize(): number {
    return this.buffer.length;
  }

  /**
   * Persist buffer to localStorage for crash recovery
   */
  private persistBuffer(): void {
    try {
      const compressed = JSON.stringify(this.buffer.slice(-1000)); // Keep last 1000 for persistence
      localStorage.setItem('dragonChronicles_telemetry', compressed);
    } catch (error) {
      // Ignore localStorage errors (quota exceeded, etc.)
      console.warn('Failed to persist telemetry buffer:', error);
    }
  }

  /**
   * Load buffer from localStorage on startup
   */
  loadPersistedBuffer(): void {
    try {
      const stored = localStorage.getItem('dragonChronicles_telemetry');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.buffer = parsed;
        }
      }
    } catch (error) {
      console.warn('Failed to load persisted telemetry buffer:', error);
    }
  }
}

// Global telemetry instance
export const telemetry = new TelemetrySystem();

// Initialize on module load - browser only
if (typeof window !== 'undefined') {
  telemetry.loadPersistedBuffer();
}