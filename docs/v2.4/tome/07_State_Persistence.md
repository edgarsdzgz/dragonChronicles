# State Persistence System - Draconia Chronicles v2.4.0

**Document:** 07_State_Persistence.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Journey state vs permanent state tracking and persistence specifications

---

## Overview

The State Persistence System manages two distinct state categories:
- **Journey State**: Per-journey progress, resets on new journey
- **Permanent State**: Cross-journey progress, never resets

This separation enables:
- Boss respawning (ward bosses) vs permanent defeat (world bosses)
- Temporary progression vs permanent upgrades
- Replayability while maintaining permanent growth

---

## Journey State (Per-Journey)

### Definition

State that tracks current journey progress and resets when player starts a new journey.

### Data Structure

```typescript
interface JourneyState {
  // Identity
  journeyId: string; // UUID for this journey
  startTime: number; // Unix timestamp

  // Boss Defeats (Reset on New Journey)
  wardBossesDefeated: Map<string, boolean>; // "ward-4A-boss": true
  largeEnemiesDefeated: Map<number, boolean>; // 10: true, 20: false

  // Path Navigation
  currentWard: string; // "ward-5B"
  visitedWards: string[]; // ["ward-1", "ward-2", "ward-3", "ward-4A", "ward-5B"]
  branchChoices: Map<number, string>; // 4: "A", 11: "B"

  // Resources (Design Decision: Reset or Persist)
  arcana: number; // Current Arcana in pendant (0-maxCapacity)
  items: ItemInventory; // Current item inventory

  // Temporary Buffs
  activeBuffs: Buff[]; // Time-limited stat increases
  buffExpirations: Map<string, number>; // buffId: expirationTimestamp
}

interface ItemInventory {
  consumables: Map<string, number>; // "silver-coin": 5
  equipment: Map<string, EquipmentItem>; // Temporary gear (if applicable)
}

interface Buff {
  id: string; // "fire-boost-1"
  name: string; // "Fire Potency Boost"
  effect: StatModifier;
  duration: number; // milliseconds
  expiresAt: number; // Unix timestamp
}
```

### Reset Conditions

**When Journey State Resets:**
1. Player starts new journey (manual restart or death)
2. Player completes journey and chooses to restart

**What Resets:**
- ✓ All ward boss defeats (bosses respawn)
- ✓ All large enemy defeats (respawn)
- ✓ Path history (can make new branch choices)
- ✓ Active buffs (time-limited effects expire)
- ? Arcana and items (design decision: could persist)

**What Persists (Carried to Next Journey):**
- ✗ World boss defeats (permanent state)
- ✗ Building unlocks (permanent state)
- ✗ Permanent upgrades (permanent state)
- ✗ Soul Power and Gold (permanent state)

### Persistence Across Returns

**Mid-Journey Returns to Draconia:**
- Journey state persists
- Ward bosses stay defeated
- Path choices remain (can't re-choose at same branch in same journey)
- Arcana deducted (25% tax) but journey continues

**Example:**
```
Journey 1:
  Start → Ward 1 boss → Ward 5 → Return to Draconia (25% tax)
  → Continue → Ward 10 → Return → Ward 15

  Ward 1-5 bosses: Stay defeated throughout journey

Journey 2 (New Journey):
  All ward bosses reset (respawn)
```

---

## Permanent State (Cross-Journey)

### Definition

State that persists across ALL journeys and represents permanent player progression.

### Data Structure

```typescript
interface PermanentState {
  // Player Identity
  playerId: string; // UUID
  createdAt: number; // Unix timestamp

  // World Boss Defeats (NEVER RESET)
  worldBosses: Map<string, boolean>; // "sirocco": true
  worldBossDefeatTimestamps: Map<string, number>; // "sirocco": timestamp

  // Worldstones
  worldstones: Map<string, WorldstoneState>;

  // Fast Travel
  fastTravelUnlocked: boolean; // City Council funded?
  fastTravelTier: 1 | 2 | 3; // Current upgrade tier
  fastTravelCheckpoints: Map<string, FastTravelCheckpoint>;

  // Path Discoveries
  discoveredPaths: Set<string>; // ["ward-11C-mine", "ward-22C-hidden"]

  // Buildings
  buildings: Set<string>; // ["arcanaBank", "aethervault", "librarium", "runeForge"]
  buildingFundTimestamps: Map<string, number>; // "librarium": timestamp

  // Permanent Upgrades
  permanentUpgrades: Map<string, UpgradeState>; // "fire-potency": {level: 3, ...}
  upgradeHistory: UpgradeHistoryEntry[]; // [{upgradeId, timestamp, cost}, ...]

  // Currencies (Permanent)
  soulPower: number; // Total Soul Power (never resets)
  gold: number; // Total Gold (never resets)
  arcanaDeposited: number; // Total deposited to Arcana Bank (cumulative)
  maxArcanaCapacity: number; // Current max capacity

  // Scrolls & Research
  scrollsDeciphered: Set<string>; // ["scroll-soul-power", "scroll-ward-2"]
  scrollDecipherTimestamps: Map<string, number>;
  researchCompleted: Set<string>; // ["soul-power-enchantment"]
  researchHistory: ResearchHistoryEntry[];

  // Items & Cartography
  cartographyPages: Map<string, number>; // "horizonSteppe": 3
  minesDiscovered: Set<string>; // ["horizonSteppe-mine-1"]
  mineVisitCount: Map<string, number>; // "horizonSteppe-mine-1": 5

  // Statistics
  totalJourneys: number; // How many journeys started
  totalEnemiesDefeated: number; // Lifetime count
  totalArcanaGained: number; // Lifetime accumulation
  playtimeSeconds: number; // Total playtime
}

interface WorldstoneState {
  discovered: boolean; // Has player found it?
  powered: boolean; // Has player powered it?
  arcanaDeposited: number; // Total Arcana invested
  discoveryTimestamp: number; // When discovered
  poweringTimestamp?: number; // When powered (if applicable)
}

interface UpgradeState {
  id: string; // "fire-potency"
  level: number; // Current level (1-10)
  totalInvested: number; // Total Soul Power spent
}

interface UpgradeHistoryEntry {
  upgradeId: string;
  level: number; // Level achieved
  soulPowerCost: number;
  timestamp: number;
}

interface ResearchHistoryEntry {
  researchId: string;
  completedAt: number;
  durationSeconds: number;
}
```

### Never Resets

**Permanent Progression Elements:**
- ✓ World boss defeats (Sirocco stays defeated forever)
- ✓ Building unlocks (once funded, always available)
- ✓ Permanent upgrades (Rune Forge stat increases)
- ✓ Soul Power accumulation (permanent currency)
- ✓ Gold accumulation (permanent currency)
- ✓ Arcana Bank deposits (cumulative, increases max capacity)
- ✓ Fast travel checkpoints (convenience persists)
- ✓ Worldstone discoveries and powering
- ✓ Scroll decryptions and research
- ✓ Mine discoveries (Cartography Pages)

---

## Save System

### Save Data Structure

```typescript
interface SaveData {
  version: string; // "2.4.0"
  saveId: string; // UUID
  lastSaved: number; // Unix timestamp

  journeyState: JourneyState;
  permanentState: PermanentState;

  settings: PlayerSettings; // UI prefs, accessibility, etc.
}

interface PlayerSettings {
  tutorialCompleted: boolean;
  tutorialVerbosity: "low" | "medium" | "high";
  audioVolume: number; // 0-100
  musicVolume: number; // 0-100
  language: string; // "en", "es", etc.
}
```

### Auto-Save Triggers

**Auto-Save Events:**
- Ward completion (checkpoint created)
- Boss wave defeat (major milestone)
- Return to Draconia (player safe)
- Building funded (permanent unlock)
- Rune Forge crafting complete (permanent upgrade)
- World boss defeat (critical permanent event)
- Every 5 minutes of gameplay (failsafe)

**Manual Save:**
- Player can trigger save from menu
- "Save & Quit" option (save + close game)

### Save Implementation (Dexie)

```typescript
import Dexie, { Table } from 'dexie';

class GameDatabase extends Dexie {
  saves!: Table<SaveData, string>; // saveId as key

  constructor() {
    super('DraconiaChroniclesDB');
    this.version(1).stores({
      saves: 'saveId, lastSaved, version'
    });
  }
}

const db = new GameDatabase();

// Save game
async function saveGame(saveId: string = 'current-save'): Promise<void> {
  const saveData: SaveData = {
    version: '2.4.0',
    saveId,
    lastSaved: Date.now(),
    journeyState: serializeJourneyState(journeyState),
    permanentState: serializePermanentState(permanentState),
    settings: playerSettings
  };

  await db.saves.put(saveData, saveId);
  console.log('Game saved:', saveId);
}

// Load game
async function loadGame(saveId: string = 'current-save'): Promise<SaveData | null> {
  const saveData = await db.saves.get(saveId);

  if (!saveData) {
    console.log('No save found, creating new game');
    return null;
  }

  // Deserialize states
  journeyState = deserializeJourneyState(saveData.journeyState);
  permanentState = deserializePermanentState(saveData.permanentState);
  playerSettings = saveData.settings;

  console.log('Game loaded:', saveId);
  return saveData;
}

// New journey (reset journey state, keep permanent)
function startNewJourney(): void {
  journeyState = {
    journeyId: generateUUID(),
    startTime: Date.now(),
    wardBossesDefeated: new Map(),
    largeEnemiesDefeated: new Map(),
    currentWard: 'ward-1',
    visitedWards: [],
    branchChoices: new Map(),
    arcana: 0,
    items: new ItemInventory(),
    activeBuffs: []
  };

  // Permanent state persists (not reset)
  permanentState.totalJourneys += 1;

  saveGame();
}
```

### Serialization

**Map/Set Serialization:**
```typescript
function serializeJourneyState(state: JourneyState): any {
  return {
    ...state,
    wardBossesDefeated: Array.from(state.wardBossesDefeated.entries()),
    largeEnemiesDefeated: Array.from(state.largeEnemiesDefeated.entries()),
    branchChoices: Array.from(state.branchChoices.entries())
  };
}

function deserializeJourneyState(data: any): JourneyState {
  return {
    ...data,
    wardBossesDefeated: new Map(data.wardBossesDefeated),
    largeEnemiesDefeated: new Map(data.largeEnemiesDefeated),
    branchChoices: new Map(data.branchChoices)
  };
}
```

---

## State Validation

### Integrity Checks

**On Load:**
```typescript
function validateSaveData(saveData: SaveData): boolean {
  // Version check
  if (saveData.version !== '2.4.0') {
    console.warn('Save version mismatch, attempting migration');
    return migrateSaveData(saveData);
  }

  // Journey state validation
  if (!saveData.journeyState.journeyId) {
    console.error('Invalid journey state');
    return false;
  }

  // Permanent state validation
  if (saveData.permanentState.soulPower < 0) {
    console.error('Invalid Soul Power value');
    return false;
  }

  // World boss consistency
  if (saveData.permanentState.worldBosses.get('sirocco') === true) {
    // Sirocco defeated: Worldstone path should be unlocked
    if (!saveData.permanentState.discoveredPaths.has('ward-26A-worldstone')) {
      console.warn('Fixing Worldstone path unlock');
      saveData.permanentState.discoveredPaths.add('ward-26A-worldstone');
    }
  }

  return true;
}
```

### Corruption Recovery

**Fallback Strategy:**
```typescript
async function loadGameSafe(): Promise<SaveData> {
  try {
    const saveData = await loadGame('current-save');

    if (!saveData || !validateSaveData(saveData)) {
      console.error('Save corrupted, attempting backup load');
      const backup = await loadGame('backup-save');

      if (backup && validateSaveData(backup)) {
        return backup;
      }

      // Last resort: Create new save
      console.error('All saves corrupted, starting new game');
      return createNewSave();
    }

    return saveData;
  } catch (error) {
    console.error('Save load failed:', error);
    return createNewSave();
  }
}
```

---

## Migration System

### Version Migration

**From v2.3 to v2.4:**
```typescript
function migrateSaveData(oldSave: any): SaveData {
  const newSave: SaveData = {
    version: '2.4.0',
    saveId: oldSave.saveId || generateUUID(),
    lastSaved: Date.now(),
    journeyState: migrateJourneyState(oldSave),
    permanentState: migratePermanentState(oldSave),
    settings: oldSave.settings || defaultSettings()
  };

  return newSave;
}

function migratePermanentState(oldSave: any): PermanentState {
  // v2.3 had different world boss system
  const worldBosses = new Map<string, boolean>();

  // Migrate old "bossDefeats" to new world boss system
  if (oldSave.bossDefeats?.includes('sirocco')) {
    worldBosses.set('sirocco', true);
  }

  // v2.4 adds branching path discoveries
  const discoveredPaths = new Set<string>();

  return {
    // ... migrate all fields
    worldBosses,
    discoveredPaths,
    // ... rest of fields
  };
}
```

---

## State Query APIs

### Helper Functions

```typescript
// Journey State Queries
function isWardBossDefeated(wardId: string): boolean {
  return journeyState.wardBossesDefeated.get(`${wardId}-boss`) || false;
}

function hasVisitedWard(wardId: string): boolean {
  return journeyState.visitedWards.includes(wardId);
}

function getBranchChoice(wardNumber: number): string | null {
  return journeyState.branchChoices.get(wardNumber) || null;
}

// Permanent State Queries
function isWorldBossDefeated(bossId: string): boolean {
  return permanentState.worldBosses.get(bossId) || false;
}

function isBuildingUnlocked(buildingId: string): boolean {
  return permanentState.buildings.has(buildingId);
}

function getUpgradeLevel(upgradeId: string): number {
  return permanentState.permanentUpgrades.get(upgradeId)?.level || 0;
}

function hasDiscoveredPath(pathId: string): boolean {
  return permanentState.discoveredPaths.has(pathId);
}

function isWorldstoneDiscovered(landId: string): boolean {
  return permanentState.worldstones.get(landId)?.discovered || false;
}

function isWorldstonePowered(landId: string): boolean {
  return permanentState.worldstones.get(landId)?.powered || false;
}
```

---

## Backup Strategy

### Automatic Backups

**Backup Schedule:**
- Create backup on major milestones (world boss defeat, building unlock)
- Keep last 3 backups (current, backup-1, backup-2)
- Rotate backups: backup-1 → backup-2, current → backup-1

**Implementation:**
```typescript
async function createBackup(): Promise<void> {
  const currentSave = await db.saves.get('current-save');
  if (!currentSave) return;

  // Rotate backups
  const backup1 = await db.saves.get('backup-1');
  if (backup1) {
    await db.saves.put(backup1, 'backup-2');
  }

  await db.saves.put(currentSave, 'backup-1');

  console.log('Backup created');
}

// Trigger backup on major events
async function onWorldBossDefeated(bossId: string): Promise<void> {
  permanentState.worldBosses.set(bossId, true);
  await saveGame();
  await createBackup(); // Create backup after saving
}
```

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Progression System: [03_Progression_System.md](./03_Progression_System.md)
- Economy System: [02_Economy_System.md](./02_Economy_System.md)
- Tutorial Sequence: [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md)

---

*This document provides complete specifications for the v2.4.0 state persistence system, ensuring proper tracking of per-journey vs permanent progression.*
