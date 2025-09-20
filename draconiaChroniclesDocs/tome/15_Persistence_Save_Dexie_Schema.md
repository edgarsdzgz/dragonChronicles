--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/15*Persistence*Save*Dexie*Schema.md canonical*precedence: v2.1*GDD status: detailed last*updated: 2025-01-12 ---

# 15 — Persistence: Dexie Save Schema

## Database Architecture

### Dexie Integration

```typescript

import Dexie, { Table } from 'dexie';

export interface SaveDatabase extends Dexie {
  profiles: Table<Profile>;
  progress: Table<Progress>;
  settings: Table<Settings>;
  telemetry: Table<TelemetryEvent>;
  logs: Table<LogEntry>;
}

export class DraconiaDatabase extends Dexie {
  profiles!: Table<Profile>;
  progress!: Table<Progress>;
  settings!: Table<Settings>;
  telemetry!: Table<TelemetryEvent>;
  logs!: Table<LogEntry>;

  constructor() {
    super('DraconiaChronicles');

    this.version(1).stores({
      profiles: '++id, name, createdAt, lastActive',
      progress: '++id, profileId, land, ward, distanceM, maxDistanceReached',
      settings: '++id, profileId, a11yReducedMotion, soundEnabled, musicEnabled',
      telemetry: '++id, profileId, timestamp, event, data',
      logs: '++id, timestamp, level, source, message, data'
    });
  }
}

```javascript

### Schema Versioning

```typescript

export interface SchemaVersion {
  version: number;
  description: string;
  migration: (db: DraconiaDatabase) => Promise<void>;
}

export const SCHEMA_VERSIONS: SchemaVersion[] = [
  {
    version: 1,
    description: 'Initial schema with profiles, progress, and settings',
    migration: async (db) => {
      // Initial schema creation
      await db.version(1).stores({
        profiles: '++id, name, createdAt, lastActive',
        progress: '++id, profileId, land, ward, distanceM, maxDistanceReached',
        settings: '++id, profileId, a11yReducedMotion, soundEnabled, musicEnabled',
        telemetry: '++id, profileId, timestamp, event, data',
        logs: '++id, timestamp, level, source, message, data'
      });
    }
  },
  {
    version: 2,
    description: 'Add research and tech tree progress',
    migration: async (db) => {
      await db.version(2).stores({
        // ... existing stores ...
        research: '++id, profileId, nodeId, status, level, unlockedAt',
        techTree: '++id, profileId, tree, nodeId, arcanaLevel, soulLevel'
      });
    }
  }
];

```text

## Core Data Models

### Profile Schema

```typescript

export interface Profile {
  id: string;
  name: string;
  createdAt: number; // timestamp
  lastActive: number; // timestamp
  totalPlaytime: number; // seconds

  // Progression
  currentLand: number;
  currentWard: number;
  currentDistanceM: number;
  maxDistanceReached: number;

  // Currencies
  currencies: {
    arcana: number;
    soulPower: number;
    gold: number;
    astralSeals: number;
  };

  // Stats
  stats: {
    totalKills: number;
    totalDeaths: number;
    totalDistanceTraveled: number;
    totalArcanaEarned: number;
    totalSoulPowerEarned: number;
    totalGoldEarned: number;
    totalAstralSealsEarned: number;
    longestJourney: number; // meters
    fastestBossKill: number; // seconds
    researchCompleted: number;
    techNodesUnlocked: number;
  };

  // Achievements
  achievements: Achievement[];
  unlockedCosmetics: string[];

  // Meta Data
  version: number;
  checksum: string;
  lastSaved: number; // timestamp
}

```javascript

### Progress Schema

```typescript

export interface Progress {
  id: string;
  profileId: string;

  // Current State
  land: number;
  ward: number;
  distanceM: number;
  maxDistanceReached: number;

  // Journey State
  currentJourney: {
    startTime: number; // timestamp
    startDistance: number;
    currentDistance: number;
    enemiesKilled: number;
    arcanaEarned: number;
    abilitiesUsed: number;
    deaths: number;
  };

  // Research Progress
  research: {
    labLevel: number;
    activeResearch: ActiveResearch[];
    completedResearch: CompletedResearch[];
    discoveredNodes: string[];
  };

  // Tech Tree Progress
  techTrees: {
    firecraft: TechTreeProgress;
    safety: TechTreeProgress;
    scales: TechTreeProgress;
  };

  // Enchants (Current Journey)
  enchants: {
    firepower: number;
    scales: number;
    safety: number;
    tier: number;
  };

  // Offline Progress
  offlineProgress: {
    lastActiveTime: number;
    offlineTime: number;
    offlineRewards: OfflineReward[];
    restedAvailable: boolean;
    restedCooldown: number;
  };
}

```javascript

### Settings Schema

```typescript

export interface Settings {
  id: string;
  profileId: string;

  // Accessibility
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
    colorBlindMode: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  };

  // Audio
  audio: {
    masterVolume: number; // 0-1
    soundEffectsVolume: number; // 0-1
    musicVolume: number; // 0-1
    voiceVolume: number; // 0-1
    muteAll: boolean;
  };

  // Graphics
  graphics: {
    quality: 'low' | 'medium' | 'high' | 'ultra';
    frameRate: '30' | '60' | 'unlimited';
    vsync: boolean;
    fullscreen: boolean;
    resolution: string; // "1920x1080"
  };

  // Gameplay
  gameplay: {
    autoReturn: boolean;
    autoUpgrade: boolean;
    showDamageNumbers: boolean;
    showFPS: boolean;
    showPerformanceMetrics: boolean;
    confirmDestructiveActions: boolean;
  };

  // Controls
  controls: {
    mouseSensitivity: number; // 0-1
    keyboardLayout: 'qwerty' | 'azerty' | 'qwertz';
    hotkeys: Record<string, string>; // ability -> key mapping
    touchControls: boolean;
    hapticFeedback: boolean;
  };

  // Privacy
  privacy: {
    analyticsEnabled: boolean;
    crashReportingEnabled: boolean;
    telemetryEnabled: boolean;
    dataSharingEnabled: boolean;
  };
}

```text

## Research & Tech Tree Persistence

### Research Schema

```typescript

export interface Research {
  id: string;
  profileId: string;
  nodeId: string;
  status: 'unknown' | 'discovered' | 'unlocked' | 'completed';
  level: number;
  arcanaLevel: number;
  soulLevel: number;

  // Research Progress
  researchProgress: {
    labLevel: number;
    researchTitle: string;
    startTime: number;
    endTime: number;
    materialsRequired: MaterialRequirement[];
    materialsSpent: MaterialRequirement[];
  };

  // Unlock Requirements
  unlockRequirements: {
    prereqNodes: string[];
    soulPowerCost: number;
    materialsCost: MaterialRequirement[];
    labLevelRequired: number;
  };

  // Effects
  effects: {
    arcanaEffects: Record<string, number>;
    soulEffects: Record<string, number>;
    tierRequirements: string[];
  };

  // Meta
  unlockedAt: number; // timestamp
  lastLeveledAt: number; // timestamp
}

```javascript

### Tech Tree Schema

```typescript

export interface TechTreeProgress {
  tree: 'firecraft' | 'safety' | 'scales';
  profileId: string;

  // Node Progress
  nodes: Record<string, TechNodeProgress>;

  // Tier Progress
  tiers: Record<string, TierProgress>;

  // Tree Stats
  stats: {
    totalNodes: number;
    unlockedNodes: number;
    maxedNodes: number;
    totalArcanaSpent: number;
    totalSoulPowerSpent: number;
  };
}

export interface TechNodeProgress {
  nodeId: string;
  status: 'unknown' | 'discovered' | 'unlocked' | 'leveled';
  arcanaLevel: number;
  soulLevel: number;
  maxArcanaLevel: number;
  maxSoulLevel: number;

  // Costs
  arcanaCost: number;
  soulCost: number;

  // Effects
  currentEffects: Record<string, number>;
  maxEffects: Record<string, number>;

  // Progress
  unlockedAt: number;
  lastLeveledAt: number;
  totalArcanaSpent: number;
  totalSoulSpent: number;
}

```text

## Atomic Write System

### Transaction Management

```typescript

export class AtomicWriteManager {
  private db: DraconiaDatabase;
  private transactionQueue: Transaction[] = [];
  private isProcessing: boolean = false;

  constructor(db: DraconiaDatabase) {
    this.db = db;
  }

  async executeTransaction(transaction: Transaction): Promise<TransactionResult> {
    return new Promise((resolve, reject) => {
      this.transactionQueue.push({
        ...transaction,
        resolve,
        reject
      });

      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.transactionQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.transactionQueue.length > 0) {
      const transaction = this.transactionQueue.shift()!;

      try {
        const result = await this.executeTransactionInternal(transaction);
        transaction.resolve(result);
      } catch (error) {
        transaction.reject(error);
      }
    }

    this.isProcessing = false;
  }

private async executeTransactionInternal(transaction: Transaction):
Promise<TransactionResult>
{
    return await this.db.transaction('rw', this.db.tables, async () => {
      const operations = transaction.operations;
      const results: any[] = [];

      for (const operation of operations) {
        const result = await this.executeOperation(operation);
        results.push(result);
      }

      return {
        success: true,
        results,
        timestamp: Date.now()
      };
    });
  }
}

```javascript

### Double-Buffer System

```typescript

export class DoubleBufferSave {
  private primaryBuffer: SaveData;
  private secondaryBuffer: SaveData;
  private isWriting: boolean = false;

  constructor(initialData: SaveData) {
    this.primaryBuffer = this.deepCopy(initialData);
    this.secondaryBuffer = this.deepCopy(initialData);
  }

  async write(data: SaveData): Promise<void> {
    if (this.isWriting) {
      throw new Error('Write operation already in progress');
    }

    this.isWriting = true;

    try {
      // Write to secondary buffer
      this.secondaryBuffer = this.deepCopy(data);

      // Validate data
      await this.validateData(this.secondaryBuffer);

      // Atomic swap
      const temp = this.primaryBuffer;
      this.primaryBuffer = this.secondaryBuffer;
      this.secondaryBuffer = temp;

      // Persist to database
      await this.persistToDatabase(this.primaryBuffer);

    } finally {
      this.isWriting = false;
    }
  }

  read(): SaveData {
    return this.deepCopy(this.primaryBuffer);
  }

  private deepCopy<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }
}

```text

## Export/Import System

### Save Export

```typescript

export class SaveExporter {
  private db: DraconiaDatabase;

  constructor(db: DraconiaDatabase) {
    this.db = db;
  }

  async exportProfile(profileId: string): Promise<ExportedSave> {
    const profile = await this.db.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile ${profileId} not found`);
    }

    const progress = await this.db.progress.where('profileId').equals(profileId).first();
    const settings = await this.db.settings.where('profileId').equals(profileId).first();
const research = await this.db.research.where('profileId').equals(profileId).toArray();
const techTree = await this.db.techTree.where('profileId').equals(profileId).toArray();

    const exportedSave: ExportedSave = {
      version: '2.2.0',
      exportDate: Date.now(),
      profile: profile,
      progress: progress,
      settings: settings,
      research: research,
      techTree: techTree,
checksum: await this.calculateChecksum(profile, progress, settings, research, techTree)
    };

    return exportedSave;
  }

  private async calculateChecksum(...data: any[]): Promise<string> {
    const jsonString = JSON.stringify(data);
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(jsonString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
}

```javascript

### Save Import

```typescript

export class SaveImporter {
  private db: DraconiaDatabase;

  constructor(db: DraconiaDatabase) {
    this.db = db;
  }

  async importSave(exportedSave: ExportedSave): Promise<ImportResult> {
    try {
      // Validate checksum
      const isValid = await this.validateChecksum(exportedSave);
      if (!isValid) {
        throw new Error('Save file checksum validation failed');
      }

      // Check version compatibility
      const isCompatible = this.checkVersionCompatibility(exportedSave.version);
      if (!isCompatible) {
        throw new Error(`Save file version ${exportedSave.version} is not compatible`);
      }

      // Import data
      await this.db.transaction('rw', this.db.tables, async () => {
        await this.db.profiles.put(exportedSave.profile);
        if (exportedSave.progress) await this.db.progress.put(exportedSave.progress);
        if (exportedSave.settings) await this.db.settings.put(exportedSave.settings);
        if (exportedSave.research) await this.db.research.bulkPut(exportedSave.research);
        if (exportedSave.techTree) await this.db.techTree.bulkPut(exportedSave.techTree);
      });

      return {
        success: true,
        profileId: exportedSave.profile.id,
        importedAt: Date.now()
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        importedAt: Date.now()
      };
    }
  }

  private async validateChecksum(exportedSave: ExportedSave): Promise<boolean> {
    const expectedChecksum = exportedSave.checksum;
    const actualChecksum = await this.calculateChecksum(
      exportedSave.profile,
      exportedSave.progress,
      exportedSave.settings,
      exportedSave.research,
      exportedSave.techTree
    );

    return expectedChecksum === actualChecksum;
  }
}

```text

## Migration System

### Schema Migration

```typescript

export class SchemaMigrator {
  private db: DraconiaDatabase;

  constructor(db: DraconiaDatabase) {
    this.db = db;
  }

  async migrateToVersion(targetVersion: number): Promise<MigrationResult> {
    const currentVersion = await this.getCurrentVersion();

    if (currentVersion >= targetVersion) {
      return { success: true, message: 'Already at target version' };
    }

const migrations = SCHEMA_VERSIONS.filter(v => v.version > currentVersion && v.version <=
targetVersion);

    for (const migration of migrations) {
      try {
        await migration.migration(this.db);
        await this.setVersion(migration.version);
      } catch (error) {
        return {
          success: false,
          error: `Migration to version ${migration.version} failed: ${error.message}`
        };
      }
    }

return { success: true, message: `Successfully migrated to version ${targetVersion}` };
  }

  private async getCurrentVersion(): Promise<number> {
    // Get version from database metadata
    return await this.db.table('_metadata').get('version') || 0;
  }

  private async setVersion(version: number): Promise<void> {
    await this.db.table('_metadata').put({ key: 'version', value: version });
  }
}

```text

## Data Validation

### Zod Schema Validation

```typescript

import { z } from 'zod';

export const ProfileSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(50),
  createdAt: z.number(),
  lastActive: z.number(),
  totalPlaytime: z.number().min(0),
  currentLand: z.number().min(1),
  currentWard: z.number().min(1),
  currentDistanceM: z.number().min(0),
  maxDistanceReached: z.number().min(0),
  currencies: z.object({
    arcana: z.number().min(0),
    soulPower: z.number().min(0),
    gold: z.number().min(0),
    astralSeals: z.number().min(0)
  }),
  stats: z.object({
    totalKills: z.number().min(0),
    totalDeaths: z.number().min(0),
    totalDistanceTraveled: z.number().min(0),
    totalArcanaEarned: z.number().min(0),
    totalSoulPowerEarned: z.number().min(0),
    totalGoldEarned: z.number().min(0),
    totalAstralSealsEarned: z.number().min(0),
    longestJourney: z.number().min(0),
    fastestBossKill: z.number().min(0),
    researchCompleted: z.number().min(0),
    techNodesUnlocked: z.number().min(0)
  }),
  achievements: z.array(z.string()),
  unlockedCosmetics: z.array(z.string()),
  version: z.number(),
  checksum: z.string(),
  lastSaved: z.number()
});

export class DataValidator {
  static validateProfile(profile: any): Profile {
    return ProfileSchema.parse(profile);
  }

  static validateProgress(progress: any): Progress {
    return ProgressSchema.parse(progress);
  }

  static validateSettings(settings: any): Settings {
    return SettingsSchema.parse(settings);
  }
}

```javascript

## Acceptance Criteria

- [ ] Dexie database schema supports all game data types

- [ ] Atomic write system prevents data corruption

- [ ] Double-buffer system ensures data consistency

- [ ] Export/import system preserves all game data

- [ ] Schema migration system handles version upgrades

- [ ] Data validation prevents invalid data entry

- [ ] Performance optimized for large datasets

- [ ] Error handling provides graceful recovery

- [ ] Checksum validation ensures data integrity

- [ ] Transaction system prevents partial updates
