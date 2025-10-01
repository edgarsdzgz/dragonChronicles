/**
 * Soul Forging State Persistence
 *
 * This file implements state persistence for the Soul Forging system,
 * including save/load functionality, state validation, and recovery.
 */

/* global localStorage */

import type { SoulForgingState } from './soul-forging-manager.js';

export interface SoulForgingPersistenceStorage {
  save(_key: string, _state: SoulForgingState): Promise<boolean>;
  load(_key: string): Promise<SoulForgingState | null>;
  delete(_key: string): Promise<boolean>;
  exists(_key: string): Promise<boolean>;
  list(): Promise<string[]>;
}

export interface SoulForgingStateValidator {
  validate(_state: SoulForgingState): SoulForgingStateValidation;
  repair(_state: SoulForgingState): SoulForgingState;
  migrate(_oldState: SoulForgingState, _targetVersion: string): SoulForgingState;
}

export interface SoulForgingStateValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  version: string;
  compatibility: boolean;
}

export interface SoulForgingPersistenceManager {
  saveState(_key: string, _state: SoulForgingState): Promise<boolean>;
  loadState(_key: string): Promise<SoulForgingState | null>;
  deleteState(_key: string): Promise<boolean>;
  listStates(): Promise<string[]>;
  validateState(_state: SoulForgingState): SoulForgingStateValidation;
  repairState(_state: SoulForgingState): SoulForgingState;
  migrateState(_state: SoulForgingState, _targetVersion: string): SoulForgingState;
}

export class LocalStorageSoulForgingPersistence implements SoulForgingPersistenceStorage {
  private prefix: string;

  constructor(prefix: string = 'soul_forging_') {
    this.prefix = prefix;
  }

  async save(key: string, state: SoulForgingState): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available, skipping save');
        return false;
      }
      const serialized = JSON.stringify(state);
      localStorage.setItem(this.prefix + key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save Soul Forging state:', error);
      return false;
    }
  }

  async load(key: string): Promise<SoulForgingState | null> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available, skipping load');
        return null;
      }
      const serialized = localStorage.getItem(this.prefix + key);
      if (!serialized) {
        return null;
      }
      return JSON.parse(serialized) as SoulForgingState;
    } catch (error) {
      console.error('Failed to load Soul Forging state:', error);
      return null;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      if (typeof localStorage === 'undefined') {
        console.warn('localStorage not available, skipping delete');
        return false;
      }
      localStorage.removeItem(this.prefix + key);
      return true;
    } catch (error) {
      console.error('Failed to delete Soul Forging state:', error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    if (typeof localStorage === 'undefined') {
      return false;
    }
    return localStorage.getItem(this.prefix + key) !== null;
  }

  async list(): Promise<string[]> {
    if (typeof localStorage === 'undefined') {
      return [];
    }
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.prefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    return keys;
  }
}

export class DefaultSoulForgingStateValidator implements SoulForgingStateValidator {
  private currentVersion: string = '1.0.0';

  validate(state: SoulForgingState): SoulForgingStateValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check required fields
    if (typeof state.temporaryLevels !== 'number' || state.temporaryLevels < 0) {
      errors.push('Invalid temporaryLevels: must be a non-negative number');
    }

    if (typeof state.permanentLevels !== 'number' || state.permanentLevels < 0) {
      errors.push('Invalid permanentLevels: must be a non-negative number');
    }

    if (typeof state.totalPurchases !== 'number' || state.totalPurchases < 0) {
      errors.push('Invalid totalPurchases: must be a non-negative number');
    }

    if (typeof state.totalArcanaSpent !== 'number' || state.totalArcanaSpent < 0) {
      errors.push('Invalid totalArcanaSpent: must be a non-negative number');
    }

    if (typeof state.totalSoulPowerSpent !== 'number' || state.totalSoulPowerSpent < 0) {
      errors.push('Invalid totalSoulPowerSpent: must be a non-negative number');
    }

    if (!Array.isArray(state.milestones)) {
      errors.push('Invalid milestones: must be an array');
    }

    if (!Array.isArray(state.achievements)) {
      errors.push('Invalid achievements: must be an array');
    }

    if (typeof state.lastUpdated !== 'number' || state.lastUpdated <= 0) {
      errors.push('Invalid lastUpdated: must be a positive timestamp');
    }

    if (typeof state.version !== 'string' || !state.version) {
      errors.push('Invalid version: must be a non-empty string');
    }

    // Check version compatibility
    const versionCompatibility = this.checkVersionCompatibility(state.version);
    if (!versionCompatibility) {
      warnings.push(
        `Version ${state.version} may not be fully compatible with current version ${this.currentVersion}`,
      );
    }

    // Check data consistency
    if (
      state.totalPurchases > 0 &&
      state.totalArcanaSpent === 0 &&
      state.totalSoulPowerSpent === 0
    ) {
      warnings.push('Inconsistent data: purchases recorded but no currency spent');
    }

    if (state.temporaryLevels > 0 && state.totalArcanaSpent === 0) {
      warnings.push('Inconsistent data: temporary levels exist but no Arcana spent');
    }

    if (state.permanentLevels > 0 && state.totalSoulPowerSpent === 0) {
      warnings.push('Inconsistent data: permanent levels exist but no Soul Power spent');
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
      version: state.version,
      compatibility: versionCompatibility,
    };
  }

  repair(state: SoulForgingState): SoulForgingState {
    const repaired = { ...state };

    // Repair numeric fields
    repaired.temporaryLevels = Math.max(0, repaired.temporaryLevels || 0);
    repaired.permanentLevels = Math.max(0, repaired.permanentLevels || 0);
    repaired.totalPurchases = Math.max(0, repaired.totalPurchases || 0);
    repaired.totalArcanaSpent = Math.max(0, repaired.totalArcanaSpent || 0);
    repaired.totalSoulPowerSpent = Math.max(0, repaired.totalSoulPowerSpent || 0);

    // Repair arrays
    repaired.milestones = Array.isArray(repaired.milestones) ? repaired.milestones : [];
    repaired.achievements = Array.isArray(repaired.achievements) ? repaired.achievements : [];

    // Repair timestamp
    repaired.lastUpdated = repaired.lastUpdated || Date.now();

    // Repair version
    repaired.version = repaired.version || this.currentVersion;

    return repaired;
  }

  migrate(oldState: SoulForgingState, targetVersion: string): SoulForgingState {
    const migrated = { ...oldState };

    // Handle version-specific migrations
    if (oldState.version === '0.9.0' && targetVersion === '1.0.0') {
      // Example migration from 0.9.0 to 1.0.0
      migrated.version = targetVersion;
      migrated.lastUpdated = Date.now();
    }

    return migrated;
  }

  private checkVersionCompatibility(version: string): boolean {
    // Simple version compatibility check
    const currentParts = this.currentVersion.split('.').map(Number);
    const stateParts = version.split('.').map(Number);

    // Major version must match
    if (currentParts[0] !== stateParts[0]) {
      return false;
    }

    // Minor version should be compatible
    if (
      currentParts[1] !== undefined &&
      stateParts[1] !== undefined &&
      currentParts[1] < stateParts[1]
    ) {
      return false;
    }

    return true;
  }
}

export class DefaultSoulForgingPersistenceManager implements SoulForgingPersistenceManager {
  private storage: SoulForgingPersistenceStorage;
  private validator: SoulForgingStateValidator;

  constructor(storage: SoulForgingPersistenceStorage, validator: SoulForgingStateValidator) {
    this.storage = storage;
    this.validator = validator;
  }

  async saveState(key: string, state: SoulForgingState): Promise<boolean> {
    // Validate state before saving
    const validation = this.validator.validate(state);
    if (!validation.valid) {
      console.error('Cannot save invalid Soul Forging state:', validation.errors);
      return false;
    }

    // Repair state if needed
    const repairedState = this.validator.repair(state);

    return await this.storage.save(key, repairedState);
  }

  async loadState(key: string): Promise<SoulForgingState | null> {
    const state = await this.storage.load(key);
    if (!state) {
      return null;
    }

    // Validate loaded state
    const validation = this.validator.validate(state);
    if (!validation.valid) {
      console.warn('Loaded Soul Forging state has validation errors:', validation.errors);

      // Try to repair the state
      const repairedState = this.validator.repair(state);
      const repairedValidation = this.validator.validate(repairedState);

      if (repairedValidation.valid) {
        return repairedState;
      } else {
        console.error('Failed to repair Soul Forging state');
        return null;
      }
    }

    return state;
  }

  async deleteState(key: string): Promise<boolean> {
    return await this.storage.delete(key);
  }

  async listStates(): Promise<string[]> {
    return await this.storage.list();
  }

  validateState(state: SoulForgingState): SoulForgingStateValidation {
    return this.validator.validate(state);
  }

  repairState(state: SoulForgingState): SoulForgingState {
    return this.validator.repair(state);
  }

  migrateState(state: SoulForgingState, targetVersion: string): SoulForgingState {
    return this.validator.migrate(state, targetVersion);
  }
}

/**
 * Create a default Soul Forging persistence manager
 */
export function createSoulForgingPersistenceManager(): SoulForgingPersistenceManager {
  const storage = new LocalStorageSoulForgingPersistence();
  const validator = new DefaultSoulForgingStateValidator();
  return new DefaultSoulForgingPersistenceManager(storage, validator);
}

/**
 * Utility functions for Soul Forging persistence
 */
export function createSoulForgingState(
  temporaryLevels: number = 0,
  permanentLevels: number = 0,
): SoulForgingState {
  return {
    temporaryLevels,
    permanentLevels,
    totalPurchases: 0,
    totalArcanaSpent: 0,
    totalSoulPowerSpent: 0,
    milestones: [],
    achievements: [],
    lastUpdated: Date.now(),
    version: '1.0.0',
  };
}

export function validateSoulForgingState(state: unknown): state is SoulForgingState {
  if (typeof state !== 'object' || state === null) {
    return false;
  }

  const s = state as SoulForgingState;
  return (
    typeof s.temporaryLevels === 'number' &&
    typeof s.permanentLevels === 'number' &&
    typeof s.totalPurchases === 'number' &&
    typeof s.totalArcanaSpent === 'number' &&
    typeof s.totalSoulPowerSpent === 'number' &&
    Array.isArray(s.milestones) &&
    Array.isArray(s.achievements) &&
    typeof s.lastUpdated === 'number' &&
    typeof s.version === 'string'
  );
}

export function createBackupState(state: SoulForgingState): SoulForgingState {
  return {
    ...state,
    lastUpdated: Date.now(),
  };
}

export function restoreFromBackup(backup: SoulForgingState): SoulForgingState {
  return {
    ...backup,
    lastUpdated: Date.now(),
  };
}
