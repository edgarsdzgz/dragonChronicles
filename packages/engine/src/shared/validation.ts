/**
 * @file Message validation for Draconia Chronicles Engine
 * @description Phase 1 Story 1: Security guards and validation for untrusted UI messages
 */

import type { UiToSim, SimToUi, AbilityId, LogLvl } from './types.js';
import { MessageType, LogLvl as LogLvlEnum, AbilityId as AbilityIdEnum } from './enums.js';
import { isLandId, isWardId } from './ids.js';
import { BUILD_VERSION, MAX_OFFLINE_MS, ABILITY_COOLDOWN_MS } from './constants.js';

/**
 * Type guard for UiToSim messages
 */
export function isUiToSim(x: unknown): x is UiToSim {
  if (!x || typeof x !== 'object' || !('t' in x)) {
    return false;
  }

  const msg = x as Record<string, unknown>;

  switch (msg.t) {
    case MessageType.Boot:
      return (
        Number.isFinite(msg.seed) &&
        typeof msg.build === 'string' &&
        msg.build.length > 0
      );

    case MessageType.Start:
      return (
        isLandId(msg.land) &&
        isWardId(msg.ward)
      );

    case MessageType.Stop:
      return true;

    case MessageType.Ability:
      return (
        typeof msg.id === 'number' &&
        Object.values(AbilityIdEnum).includes(msg.id as AbilityId)
      );

    case MessageType.Offline:
      return (
        Number.isFinite(msg.elapsedMs as number) &&
        (msg.elapsedMs as number) >= 0 &&
        (msg.elapsedMs as number) <= MAX_OFFLINE_MS
      );

    default:
      return false;
  }
}

/**
 * Type guard for SimToUi messages
 */
export function isSimToUi(x: unknown): x is SimToUi {
  if (!x || typeof x !== 'object' || !('t' in x)) {
    return false;
  }

  const msg = x as Record<string, unknown>;

  switch (msg.t) {
    case MessageType.Ready:
      return true;

    case MessageType.Tick:
      return (
        Number.isFinite(msg.now) &&
        typeof msg.stats === 'object' &&
        msg.stats !== null &&
        Number.isFinite((msg.stats as Record<string, unknown>).fps) &&
        Number.isFinite((msg.stats as Record<string, unknown>).enemies) &&
        Number.isFinite((msg.stats as Record<string, unknown>).proj) &&
        Number.isFinite((msg.stats as Record<string, unknown>).dps)
      );

    case MessageType.Log:
      return (
        typeof msg.lvl === 'string' &&
        Object.values(LogLvlEnum).includes(msg.lvl as LogLvl) &&
        typeof msg.msg === 'string'
      );

    case MessageType.Fatal:
      return typeof msg.reason === 'string';

    default:
      return false;
  }
}

/**
 * Validates build version compatibility
 */
export function validateBuildVersion(build: string): boolean {
  return build === BUILD_VERSION;
}

/**
 * Validates ability cooldown timing
 */
export function validateAbilityCooldown(lastAbilityTime: number, currentTime: number): boolean {
  return currentTime - lastAbilityTime >= ABILITY_COOLDOWN_MS;
}

/**
 * Sanitizes seed value to uint32
 */
export function sanitizeSeed(seed: unknown): number {
  if (typeof seed !== 'number' || !Number.isFinite(seed)) {
    throw new Error('Invalid seed: must be a finite number');
  }
  
  // Clamp to uint32 range
  return Math.floor(seed) >>> 0;
}

/**
 * Validates offline time is reasonable
 */
export function validateOfflineTime(elapsedMs: number): boolean {
  return (
    Number.isFinite(elapsedMs) &&
    elapsedMs >= 0 &&
    elapsedMs <= MAX_OFFLINE_MS
  );
}

/**
 * Rate limiter for ability messages
 */
export class AbilityRateLimiter {
  private lastAbilityTime = 0;

  canUseAbility(currentTime: number): boolean {
    if (validateAbilityCooldown(this.lastAbilityTime, currentTime)) {
      this.lastAbilityTime = currentTime;
      return true;
    }
    return false;
  }

  reset(): void {
    this.lastAbilityTime = 0;
  }
}

/**
 * Message validation context
 */
export class ValidationContext {
  private lastAbilityTime = 0;
  private bootTime = 0;
  private messageCount = 0;
  private errorCount = 0;

  constructor() {
    this.bootTime = performance.now();
  }

  validateMessage(msg: unknown): { valid: boolean; error?: string } {
    this.messageCount++;

    if (!isUiToSim(msg)) {
      this.errorCount++;
      return { valid: false, error: 'Invalid message format' };
    }

    const uiMsg = msg as UiToSim;

    switch (uiMsg.t) {
      case MessageType.Boot:
        if (!validateBuildVersion(uiMsg.build)) {
          this.errorCount++;
          return { valid: false, error: 'Build version mismatch' };
        }
        break;

      case MessageType.Ability:
        if (!this.canUseAbility(performance.now())) {
          this.errorCount++;
          return { valid: false, error: 'Ability cooldown active' };
        }
        break;

      case MessageType.Offline:
        if (!validateOfflineTime(uiMsg.elapsedMs)) {
          this.errorCount++;
          return { valid: false, error: 'Invalid offline time' };
        }
        break;
    }

    return { valid: true };
  }

  private canUseAbility(currentTime: number): boolean {
    if (validateAbilityCooldown(this.lastAbilityTime, currentTime)) {
      this.lastAbilityTime = currentTime;
      return true;
    }
    return false;
  }

  getStats() {
    return {
      messageCount: this.messageCount,
      errorCount: this.errorCount,
      errorRate: this.messageCount > 0 ? this.errorCount / this.messageCount : 0,
      uptime: performance.now() - this.bootTime
    };
  }
}
