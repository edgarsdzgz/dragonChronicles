/**
 * Targeting state persistence system for Draconia Chronicles
 * Handles saving and loading targeting configurations and state across sessions
 */

import type {
  TargetingConfig,
  TargetingState,
  PlayerTargetingPreferences,
} from './types.js';
import { createTargetingConfigManager } from './targeting-config.js';
import { createTargetingUnlockSystem } from './targeting-unlock.js';

/**
 * Persistence storage interface
 */
export interface TargetingPersistenceStorage {
  save(_key: string, _data: any): Promise<void>;
  load(_key: string): Promise<any>;
  remove(_key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * Local storage implementation
 */
export class LocalStoragePersistence implements TargetingPersistenceStorage {
  async save(key: string, data: any): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const serialized = JSON.stringify(data);
        window.localStorage.setItem(key, serialized);
      } catch (error) {
        console.error('Failed to save to localStorage:', error);
        throw error;
      }
    }
  }

  async load(key: string): Promise<any> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const serialized = window.localStorage.getItem(key);
        return serialized ? JSON.parse(serialized) : null;
      } catch (error) {
        console.error('Failed to load from localStorage:', error);
        return null;
      }
    }
    return null;
  }

  async remove(key: string): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (error) {
        console.error('Failed to remove from localStorage:', error);
        throw error;
      }
    }
  }

  async clear(): Promise<void> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.clear();
      } catch (error) {
        console.error('Failed to clear localStorage:', error);
        throw error;
      }
    }
  }
}

/**
 * IndexedDB storage implementation for larger data
 */
export class IndexedDBPersistence implements TargetingPersistenceStorage {
  private dbName = 'DraconiaTargetingDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    if (typeof window === 'undefined' || !window.indexedDB) {
      throw new Error('IndexedDB not available');
    }

    return new Promise((resolve, reject) => {
      const request = window.indexedDB.open(this.dbName, this.version);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores
        if (!db.objectStoreNames.contains('targeting_configs')) {
          db.createObjectStore('targeting_configs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('targeting_state')) {
          db.createObjectStore('targeting_state', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('player_preferences')) {
          db.createObjectStore('player_preferences', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('unlock_progress')) {
          db.createObjectStore('unlock_progress', { keyPath: 'id' });
        }
      };
    });
  }

  async save(key: string, data: any): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const storeName = this.getStoreName(key);
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.put({ id: key, data, timestamp: Date.now() });

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async load(key: string): Promise<any> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const storeName = this.getStoreName(key);
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);

      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        resolve(result ? result.data : null);
      };
    });
  }

  async remove(key: string): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    return new Promise((resolve, reject) => {
      const storeName = this.getStoreName(key);
      const transaction = this.db!.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);

      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    if (!this.db) {
      await this.init();
    }

    const storeNames = [
      'targeting_configs',
      'targeting_state',
      'player_preferences',
      'unlock_progress',
    ];

    for (const storeName of storeNames) {
      await new Promise<void>((resolve, reject) => {
        const transaction = this.db!.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const request = store.clear();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve();
      });
    }
  }

  private getStoreName(key: string): string {
    if (key.startsWith('config_')) return 'targeting_configs';
    if (key.startsWith('state_')) return 'targeting_state';
    if (key.startsWith('preferences_')) return 'player_preferences';
    if (key.startsWith('unlock_')) return 'unlock_progress';
    return 'targeting_configs'; // default
  }
}

/**
 * Targeting persistence manager
 */
export class TargetingPersistenceManager {
  private storage: TargetingPersistenceStorage;
  private configManager = createTargetingConfigManager();
  private unlockSystem = createTargetingUnlockSystem();

  constructor(storage?: TargetingPersistenceStorage) {
    this.storage = storage || new LocalStoragePersistence();
  }

  /**
   * Save targeting configuration
   */
  async saveTargetingConfig(config: TargetingConfig, profileId: string = 'default'): Promise<void> {
    const key = `config_${profileId}`;
    await this.storage.save(key, config);
  }

  /**
   * Load targeting configuration
   */
  async loadTargetingConfig(profileId: string = 'default'): Promise<TargetingConfig | null> {
    const key = `config_${profileId}`;
    return await this.storage.load(key);
  }

  /**
   * Save targeting state
   */
  async saveTargetingState(state: TargetingState, profileId: string = 'default'): Promise<void> {
    const key = `state_${profileId}`;
    // Only save essential state, not live references
    const serializableState = {
      currentTargetId: state.currentTarget?.id || null,
      lastTargetId: state.lastTarget?.id || null,
      targetHistoryIds: state.targetHistory.map((t) => t.id),
      lastUpdateTime: state.lastUpdateTime,
      strategy: state.strategy,
      isTargetLocked: state.isTargetLocked,
      targetLockStartTime: state.targetLockStartTime,
      targetSwitchCount: state.targetSwitchCount,
      lastStrategyChange: state.lastStrategyChange,
    };
    await this.storage.save(key, serializableState);
  }

  /**
   * Load targeting state
   */
  async loadTargetingState(profileId: string = 'default'): Promise<Partial<TargetingState> | null> {
    const key = `state_${profileId}`;
    return await this.storage.load(key);
  }

  /**
   * Save player preferences
   */
  async savePlayerPreferences(
    preferences: PlayerTargetingPreferences,
    profileId: string = 'default',
  ): Promise<void> {
    const key = `preferences_${profileId}`;
    await this.storage.save(key, preferences);
  }

  /**
   * Load player preferences
   */
  async loadPlayerPreferences(
    profileId: string = 'default',
  ): Promise<PlayerTargetingPreferences | null> {
    const key = `preferences_${profileId}`;
    return await this.storage.load(key);
  }

  /**
   * Save unlock progress
   */
  async saveUnlockProgress(progress: any, profileId: string = 'default'): Promise<void> {
    const key = `unlock_${profileId}`;
    await this.storage.save(key, progress);
  }

  /**
   * Load unlock progress
   */
  async loadUnlockProgress(profileId: string = 'default'): Promise<any> {
    const key = `unlock_${profileId}`;
    return await this.storage.load(key);
  }

  /**
   * Save complete targeting system state
   */
  async saveCompleteState(
    config: TargetingConfig,
    state: TargetingState,
    preferences: PlayerTargetingPreferences,
    profileId: string = 'default',
  ): Promise<void> {
    try {
      await Promise.all([
        this.saveTargetingConfig(config, profileId),
        this.saveTargetingState(state, profileId),
        this.savePlayerPreferences(preferences, profileId),
      ]);
    } catch (error) {
      console.error('Failed to save complete targeting state:', error);
      throw error;
    }
  }

  /**
   * Load complete targeting system state
   */
  async loadCompleteState(profileId: string = 'default'): Promise<{
    config: TargetingConfig | null;
    state: Partial<TargetingState> | null;
    preferences: PlayerTargetingPreferences | null;
  }> {
    try {
      const [config, state, preferences] = await Promise.all([
        this.loadTargetingConfig(profileId),
        this.loadTargetingState(profileId),
        this.loadPlayerPreferences(profileId),
      ]);

      return { config, state, preferences };
    } catch (error) {
      console.error('Failed to load complete targeting state:', error);
      return { config: null, state: null, preferences: null };
    }
  }

  /**
   * Export targeting configuration for backup/sharing
   */
  async exportConfiguration(profileId: string = 'default'): Promise<string> {
    const state = await this.loadCompleteState(profileId);
    const exportData = {
      version: '1.0.0',
      timestamp: Date.now(),
      profileId,
      ...state,
    };
    return JSON.stringify(exportData, null, 2);
  }

  /**
   * Import targeting configuration from backup
   */
  async importConfiguration(configData: string, profileId: string = 'default'): Promise<boolean> {
    try {
      const importData = JSON.parse(configData);

      if (importData.version !== '1.0.0') {
        throw new Error('Unsupported configuration version');
      }

      if (importData.config) {
        await this.saveTargetingConfig(importData.config, profileId);
      }
      if (importData.state) {
        await this.saveTargetingState(importData.state, profileId);
      }
      if (importData.preferences) {
        await this.savePlayerPreferences(importData.preferences, profileId);
      }

      return true;
    } catch (error) {
      console.error('Failed to import configuration:', error);
      return false;
    }
  }

  /**
   * Clear all targeting data for a profile
   */
  async clearProfileData(profileId: string = 'default'): Promise<void> {
    try {
      await Promise.all([
        this.storage.remove(`config_${profileId}`),
        this.storage.remove(`state_${profileId}`),
        this.storage.remove(`preferences_${profileId}`),
        this.storage.remove(`unlock_${profileId}`),
      ]);
    } catch (error) {
      console.error('Failed to clear profile data:', error);
      throw error;
    }
  }

  /**
   * Clear all targeting data
   */
  async clearAllData(): Promise<void> {
    try {
      await this.storage.clear();
    } catch (error) {
      console.error('Failed to clear all data:', error);
      throw error;
    }
  }

  /**
   * Get storage usage information
   */
  async getStorageInfo(): Promise<{
    totalSize: number;
    itemCount: number;
    items: Array<{ key: string; size: number; lastModified: number }>;
  }> {
    // This is a simplified implementation
    // In a real implementation, you'd calculate actual storage usage
    return {
      totalSize: 0,
      itemCount: 0,
      items: [],
    };
  }

  /**
   * Migrate data from old format to new format
   */
  async migrateData(fromVersion: string, toVersion: string): Promise<void> {
    // Implementation for data migration between versions
    console.log(`Migrating targeting data from ${fromVersion} to ${toVersion}`);

    // Add migration logic here as needed
    // For now, this is a placeholder
  }

  /**
   * Validate saved data integrity
   */
  async validateData(profileId: string = 'default'): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      const state = await this.loadCompleteState(profileId);

      // Validate configuration
      if (state.config) {
        if (!state.config.primaryStrategy) {
          errors.push('Missing primary strategy in configuration');
        }
        if (!state.config.fallbackStrategy) {
          errors.push('Missing fallback strategy in configuration');
        }
        if (state.config.range <= 0) {
          errors.push('Invalid range in configuration');
        }
      }

      // Validate state
      if (state.state) {
        if (state.state.lastUpdateTime && state.state.lastUpdateTime > Date.now()) {
          warnings.push('Future timestamp in targeting state');
        }
        if (state.state.targetSwitchCount && state.state.targetSwitchCount < 0) {
          errors.push('Negative target switch count');
        }
      }

      // Validate preferences
      if (state.preferences) {
        if (!Array.isArray(state.preferences.unlockedStrategies)) {
          errors.push('Invalid unlocked strategies format');
        }
        if (!Array.isArray(state.preferences.unlockedPersistenceModes)) {
          errors.push('Invalid unlocked persistence modes format');
        }
      }
    } catch (error) {
      errors.push(`Failed to validate data: ${error}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }
}

/**
 * Create a targeting persistence manager
 */
export function createTargetingPersistenceManager(
  storage?: TargetingPersistenceStorage,
): TargetingPersistenceManager {
  return new TargetingPersistenceManager(storage);
}

/**
 * Utility functions for targeting persistence
 */
export const TargetingPersistenceUtils = {
  /**
   * Create a backup of all targeting data
   */
  async createBackup(
    manager: TargetingPersistenceManager,
    profileId: string = 'default',
  ): Promise<string> {
    return await manager.exportConfiguration(profileId);
  },

  /**
   * Restore from backup
   */
  async restoreFromBackup(
    manager: TargetingPersistenceManager,
    backupData: string,
    profileId: string = 'default',
  ): Promise<boolean> {
    return await manager.importConfiguration(backupData, profileId);
  },

  /**
   * Get available profiles
   */
  async getAvailableProfiles(manager: TargetingPersistenceManager): Promise<string[]> {
    // This would need to be implemented based on the storage backend
    // For now, return default profile
    return ['default'];
  },

  /**
   * Check if profile exists
   */
  async profileExists(manager: TargetingPersistenceManager, profileId: string): Promise<boolean> {
    const config = await manager.loadTargetingConfig(profileId);
    return config !== null;
  },

  /**
   * Duplicate profile
   */
  async duplicateProfile(
    manager: TargetingPersistenceManager,
    sourceProfileId: string,
    targetProfileId: string,
  ): Promise<boolean> {
    try {
      const sourceState = await manager.loadCompleteState(sourceProfileId);
      if (sourceState.config) {
        await manager.saveCompleteState(
          sourceState.config,
          sourceState.state as any,
          sourceState.preferences as any,
          targetProfileId,
        );
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to duplicate profile:', error);
      return false;
    }
  },
};
