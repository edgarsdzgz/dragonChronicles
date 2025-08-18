// MVP 1.1 Principal Engineer Implementation - Offline Progress per CTO Spec §2
import { Decimal } from '$lib/num/decimal';
import type { Save110 } from './saveSystem';

export interface EWMAState {
  arcanaPerSec: Decimal;
  alpha: Decimal;      // 0.2 per spec
  samples: number;     // track sample count for validation
}

export interface OfflineResult {
  elapsedMs: Decimal;
  appliedMs: Decimal;  // clamped to 24h max
  arcanaGain: Decimal;
  wasOffline: boolean;
}

/**
 * Initialize EWMA state with spec-compliant alpha value
 */
export function createEWMAState(): EWMAState {
  return {
    arcanaPerSec: new Decimal(0),
    alpha: new Decimal(0.2), // α=0.2 per spec
    samples: 0,
  };
}

/**
 * Update EWMA with new sample per spec formula:
 * avg = α*current + (1-α)*avg
 */
export function updateEWMA(ewma: EWMAState, currentArcanaPerSec: Decimal): void {
  const alpha = ewma.alpha;
  const oneMinusAlpha = new Decimal(1).minus(alpha);
  
  ewma.arcanaPerSec = alpha.mul(currentArcanaPerSec).plus(oneMinusAlpha.mul(ewma.arcanaPerSec));
  ewma.samples++;
}

/**
 * Calculate offline progress on game resume
 * Only applies to Arcana - distance unchanged per spec
 */
export function calculateOfflineProgress(save: Save110): OfflineResult {
  const now = new Decimal(Date.now());
  const lastSave = new Decimal(save.lastSaveTimestampMs);
  const elapsedMs = now.minus(lastSave);
  
  // No offline time if save is in future or same timestamp
  if (elapsedMs.lte(0)) {
    return {
      elapsedMs: new Decimal(0),
      appliedMs: new Decimal(0),
      arcanaGain: new Decimal(0),
      wasOffline: false,
    };
  }
  
  // Cap offline time to 24 hours per spec
  const maxOfflineMs = new Decimal(24 * 60 * 60 * 1000); // 24h in ms
  const appliedMs = Decimal.min(elapsedMs, maxOfflineMs);
  const appliedSec = appliedMs.div(1000);
  
  // Calculate Arcana gain from EWMA rate
  const arcanaRate = new Decimal(save.ewma.arcana);
  const arcanaGain = arcanaRate.mul(appliedSec);
  
  // Apply exploit guard: clamp EWMA to reasonable bounds
  // For MVP 1.1, we trust EWMA but could add p95 validation later
  
  return {
    elapsedMs,
    appliedMs,
    arcanaGain,
    wasOffline: elapsedMs.gt(30000), // 30s threshold for "offline"
  };
}

/**
 * Apply offline gains to save state
 */
export function applyOfflineProgress(save: Save110, offline: OfflineResult): void {
  if (offline.arcanaGain.gt(0)) {
    const currentArcana = new Decimal(save.currencies.arcana);
    save.currencies.arcana = currentArcana.plus(offline.arcanaGain).toString();
  }
  
  // Distance unchanged per spec - dragon "rests" offline
  // Motion state is preserved for resume but doesn't affect offline distance
}

/**
 * Create welcome back message for NDJSON logging
 */
export function createWelcomeBackLog(offline: OfflineResult): string {
  const event = {
    event: 'offlinePayout',
    timestamp: Date.now(),
    elapsedSec: offline.appliedMs.div(1000).toString(),
    arcanaRateStr: '0', // Will be filled by caller with actual rate
    arcanaGainStr: offline.arcanaGain.toString(),
  };
  
  return JSON.stringify(event);
}

/**
 * Deterministic fallback when no EWMA samples available
 * Computes base rate from current enchant levels
 */
export function computeFallbackRate(save: Save110): Decimal {
  // Simple base rate calculation for MVP 1.1
  // In full game, this would calculate from enchants, equipment, etc.
  const firepowerLevel = save.enchants.firepower.level;
  const scalesLevel = save.enchants.scales.level;
  
  // Base rate: 1 arcana/sec + 0.1 per firepower level + 0.05 per scales level
  const baseRate = new Decimal(1);
  const firepowerBonus = new Decimal(firepowerLevel).mul(0.1);
  const scalesBonus = new Decimal(scalesLevel).mul(0.05);
  
  return baseRate.plus(firepowerBonus).plus(scalesBonus);
}