# Manager Architecture Registry

**Version**: 1.0
**Last Updated**: 2025-10-25
**Status**: Living Document

## Purpose

This document serves as the **single source of truth** for all managers in Draconia
Chronicles. It follows a **just-in-time architecture** approach: managers are documented
when needed, not speculatively created.

## Core Principles

1. **Single Responsibility**: Each manager handles ONE concern
2. **Just-in-Time Creation**: Create managers when features are implemented
3. **Clear Dependencies**: Explicit manager dependency chains
4. **Progressive Disclosure**: Start simple, add complexity as needed

## Manager Status Legend

- ✅ **Implemented**: Manager exists and is functional
- 🚧 **In Progress**: Currently being built
- 📋 **Planned**: Documented and ready for implementation
- 💭 **Future**: Noted for future phases, not yet needed

---

## Step 0: Splash Screen + City (Draconia Menu)

**Goal**: Show splash screen → Show Draconia city → Display Journey button

### Required Managers

#### GameStartManager ✅

**File**: `apps/web/src/lib/pixi/systems/game-start-manager.ts`
**Responsibility**: Orchestrate game flow (splash → menu → journey)
**Dependencies**: AssetManager, SplashScreenManager, DraconiaMenuManager

```typescript
class GameStartManager {
  // Game state transitions
  initialize(): Promise<boolean>;
  startJourney(): Promise<void>;

  // State queries
  getCurrentPhase(): 'splash' | 'draconia' | 'journey' | 'complete';
  isJourneyStarted(): boolean;
}
```

**Current Issues**:

- Creates duplicate DragonProtagonistManager (needs refactoring)
- Should delegate entity creation to EntityManager

---

#### SplashScreenManager ✅

**File**: `apps/web/src/lib/pixi/systems/splash-screen.ts`
**Responsibility**: Display splash screen with fade-in/fade-out animations
**Dependencies**: AssetManager

```typescript
class SplashScreenManager {
  show(): Promise<void>;
  hide(): Promise<void>;
  isComplete(): boolean;
}
```

---

#### DraconiaMenuManager ✅

**File**: `apps/web/src/lib/pixi/systems/draconia-menu.ts`
**Responsibility**: Display Draconia city menu with Journey button
**Dependencies**: AssetManager

```typescript
class DraconiaMenuManager {
  show(): Promise<void>;
  hide(): Promise<void>;
  isComplete(): boolean; // True when Journey button clicked
}
```

**Current Implementation**:

- Displays city background with silhouette
- Shows "Journey" button
- Handles button click → triggers journey start

**Future Evolution**:

- Journey button → Building sprite
- Add more buildings for other features (Town, Lair, Research, etc.)
- Each building becomes clickable for its respective system

---

#### AssetManager ✅

**File**: `apps/web/src/lib/pixi/systems/rendering/asset-manager.ts`
**Responsibility**: Load and cache all game assets
**Dependencies**: None (foundational)

```typescript
class AssetManager {
  loadAsset(path: string): Promise<AssetResult>;
  initialize(): Promise<void>;
  destroy(): void;
}
```

---

#### ResponsiveManager ✅

**File**: `apps/web/src/lib/pixi/systems/responsive-manager.ts`
**Responsibility**: Handle window resize and responsive behavior
**Dependencies**: None

```typescript
class ResponsiveManager {
  handleResize(): void;
  getScreenSize(): { width: number; height: number };
}
```

---

## Level 1: First Journey (Ward 1, Steppe)

**Goal**: Journey button → Combat → Kill enemies → Earn Arcana + Soul Power →
Rare item drops → Reach end of Ward 1 → Return to Draconia

### Primary Managers (Core Loop)

#### EntityManager 🚧

**File**: `apps/web/src/lib/pixi/systems/entity-manager.ts` (TO BE CREATED)
**Responsibility**: Lifecycle management for ALL game entities
**Dependencies**: AssetManager

```typescript
class EntityManager {
  // Dragon (player character)
  createDragonProtagonist(config: DragonConfig): Promise<string>;
  getDragonProtagonist(): DragonProtagonistManager | null;

  // Enemies
  spawnEnemy(type: EnemyType, position: Vector2): string;
  despawnEnemy(enemyId: string): void;
  getEnemy(enemyId: string): Enemy | null;
  getAllEnemies(): Enemy[];

  // Tracking
  getEntityCount(): { dragons: number; enemies: number; total: number };

  // Health bar integration
  registerEntityWithHealthBar(entityId: string, entity: Entity): void;
}
```

**Why Needed**:

- Single source of truth for entity creation
- Fixes duplicate dragon bug
- Prepares for enemy spawning
- Centralizes entity-to-health-bar registration

---

#### CombatManager 📋

**File**: `apps/web/src/lib/pixi/systems/combat/combat-manager.ts` (EXISTS, needs
refactoring)
**Responsibility**: Combat state, rules, and coordination
**Dependencies**: EntityManager, TargetingSystem

```typescript
class CombatManager {
  // Combat state
  startCombat(): void;
  endCombat(): void;
  pauseCombat(): void;
  isCombatActive(): boolean;

  // Damage handling
  dealDamage(attackerId: string, targetId: string, damage: number): void;
  calculateDamage(attacker: Entity, target: Entity): DamageResult;

  // Death handling
  handleEntityDeath(entityId: string): void;
}
```

**Current State**:

- Partially exists in `combat/` directory
- Needs refactoring to work with EntityManager
- Should NOT spawn entities (delegate to EnemySpawnManager)

---

#### UIManager 📋

**File**: `apps/web/src/lib/pixi/systems/ui-manager.ts` (TO BE CREATED)
**Responsibility**: HUD and overlay UI during journey
**Dependencies**: CurrencyManager, ProgressionManager

```typescript
class UIManager {
  // Currency displays
  updateArcanaDisplay(amount: number): void;
  updateSoulPowerDisplay(amount: number): void;

  // Distance/progression
  updateDistanceBar(currentDistance: number, wardEnd: number): void;

  // Combat feedback
  showDamageNumber(position: Vector2, damage: number, isCrit: boolean): void;

  // UI state
  show(): void;
  hide(): void;
}
```

**Level 1 Needs**:

- Arcana counter (top-right)
- Soul Power counter (top-right)
- Distance progress bar (top-center)
- Mini-map or ward indicator (optional for Level 1)

---

#### ProgressionManager 📋

**File**: `apps/web/src/lib/pixi/systems/progression-manager.ts` (TO BE CREATED)
**Responsibility**: Track distance, wards, lands progression
**Dependencies**: None

```typescript
class ProgressionManager {
  // Current state
  currentDistance: number;
  currentWard: Ward;
  currentLand: Land;

  // Progression
  advanceDistance(meters: number): void;
  getCurrentMilestone(): Milestone;
  getNextMilestone(): Milestone;

  // Ward/Land transitions
  transitionToWard(wardId: string): void;
  transitionToLand(landId: string): void;

  // Queries
  getDistanceToWardEnd(): number;
  isWardComplete(): boolean;
}
```

**Level 1 Needs**:

- Track distance in meters (starts at 0, ends at ~5000m for Ward 1)
- Know when Ward 1 is complete
- Trigger "Return to Draconia" event

---

#### CurrencyManager 📋

**File**: `apps/web/src/lib/pixi/systems/currency-manager.ts` (TO BE CREATED)
**Responsibility**: Track ALL currencies and transactions
**Dependencies**: None

```typescript
class CurrencyManager {
  // Currencies
  arcana: number; // Run currency (resets on return)
  soulPower: number; // Meta currency (permanent)
  gold: number; // QoL currency (future)
  astralSeals: number; // Premium currency (future)

  // Transactions
  earnArcana(amount: number): void;
  spendArcana(amount: number): boolean;
  earnSoulPower(amount: number): void;
  spendSoulPower(amount: number): boolean;

  // Queries
  canAfford(currency: CurrencyType, amount: number): boolean;
  getCurrency(type: CurrencyType): number;

  // Events
  onCurrencyChanged(callback: (type: CurrencyType, newAmount: number) => void): void;
}
```

**Level 1 Needs**:

- Track Arcana earned from kills
- Track Soul Power earned from kills
- NO spending mechanics yet (that's for enchantments later)

---

#### EnemySpawnManager 📋

**File**: `apps/web/src/lib/pixi/systems/enemy-spawn-manager.ts` (TO BE CREATED)
**Responsibility**: Enemy spawning logic ONLY
**Dependencies**: EntityManager, ProgressionManager, FactionManager

```typescript
class EnemySpawnManager {
  // Spawning logic
  calculateSpawnRate(distance: number): number;
  selectEnemyType(distance: number): EnemyType;
  shouldSpawnEnemy(currentTime: number): boolean;

  // Spawn execution (delegates to EntityManager)
  spawnEnemy(type: EnemyType, position: Vector2): void;

  // Configuration
  setSpawnRate(rate: number): void;
  setMaxEnemies(max: number): void;
}
```

**Level 1 Needs**:

- Spawn 1 enemy type: "Briar Stalker" (from Wind-Taken Nomads faction)
- Simple spawn rate: 1 enemy every 3-5 seconds
- Max enemies on screen: 10 (start simple)
- Spawn position: Right side of screen, random Y

---

#### FactionManager 📋

**File**: `apps/web/src/lib/pixi/systems/faction-manager.ts` (TO BE CREATED)
**Responsibility**: Faction definitions and enemy rosters
**Dependencies**: None

```typescript
class FactionManager {
  // Faction data
  getFaction(factionId: string): Faction;
  getFactionForWard(wardId: string): Faction;
  getEnemyTypes(factionId: string): EnemyType[];

  // Enemy definitions
  getEnemyDefinition(enemyTypeId: string): EnemyDefinition;
}

interface EnemyDefinition {
  id: string;
  name: string;
  baseHP: number;
  baseDMG: number;
  moveSpeed: number;
  attackCooldown: number;
  arcanaReward: number;
  soulPowerReward: number;
  itemDropChance: number; // NEW for Level 1
}
```

**Level 1 Needs**:

- Define Wind-Taken Nomads faction
- Define Briar Stalker enemy with stats:
  - HP: 110
  - DMG: 16
  - Speed: 1.3
  - Attack cooldown: 2.5s
  - Arcana reward: 10
  - Soul Power reward: 2
  - Item drop chance: 5% (1 in 20 kills)

---

#### ProjectileManager 📋

**File**: `apps/web/src/lib/pixi/systems/projectile-manager.ts` (TO BE CREATED)
**Responsibility**: Projectile lifecycle and pooling
**Dependencies**: EntityManager

```typescript
class ProjectileManager {
  // Projectile creation
  createProjectile(config: ProjectileConfig): string;

  // Pooling
  getProjectile(projectileId: string): Projectile | null;
  returnToPool(projectileId: string): void;

  // Update
  update(deltaTime: number): void;

  // Collision
  checkCollisions(): CollisionResult[];
}
```

**Level 1 Needs**:

- Simple fireball projectile for dragon auto-attack
- Basic collision detection (projectile hits enemy)
- Pool size: 50 projectiles max
- NO enemy projectiles yet (enemies only melee attack)

---

#### ItemManager 📋

**File**: `apps/web/src/lib/pixi/systems/item-manager.ts` (TO BE CREATED)
**Responsibility**: Item generation and inventory tracking
**Dependencies**: None

```typescript
class ItemManager {
  // Random item generation
  generateRandomItem(enemyLevel: number): Item;

  // Item definitions
  getItemDefinition(itemId: string): ItemDefinition;

  // Item operations
  addItemToInventory(item: Item): void;
  getInventory(): Item[];
  getItemValue(item: Item): number;
}

interface Item {
  id: string;
  name: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  baseValue: number; // in gold
  iconPath: string;
}
```

**Level 1 Needs**:

- Generate random items with:
  - Random name from pool (e.g., "Worn Leather", "Rusty Dagger", "Old Coin")
  - Common rarity only
  - Value: 5-15 gold
- Store items in simple array (no inventory UI yet)
- Display item pickup notification (simple text popup)

---

### Secondary Managers (Infrastructure)

These are needed for Level 1 but are more infrastructure/support:

#### LandManager ✅ (needs refactoring)

**File**: `apps/web/src/lib/pixi/systems/land-manager.ts`
**Responsibility**: Environment ONLY (backgrounds, terrain, parallax)
**Dependencies**: AssetManager

**Current Issues**:

- Creates DragonProtagonistManager (should NOT)
- Should ONLY handle background rendering

**Refactoring Plan**:

- Remove dragon creation
- Keep background/terrain management
- Keep parallax system (static for now)

---

#### HealthBarManager ✅

**File**: `apps/web/src/lib/pixi/systems/health-bar-manager.ts`
**Responsibility**: ALL health bars for ALL entities
**Dependencies**: None

**Current State**: Already implemented, works well

**Level 1 Needs**:

- Create health bar for dragon protagonist
- Create health bars for all enemies
- Update positions in sync with entities
- Remove health bars when entities die

---

#### FloatingDamageManager ✅

**File**: `apps/web/src/lib/pixi/systems/floating-damage.ts`
**Responsibility**: Damage number popups
**Dependencies**: None

**Current State**: Already implemented

**Level 1 Needs**:

- Show damage numbers when dragon hits enemies
- Simple animation (float up and fade out)
- NO critical hit styling yet

---

#### LayerManager ✅

**File**: `apps/web/src/lib/pixi/systems/rendering/layer-manager.ts`
**Responsibility**: Z-index management for proper rendering order
**Dependencies**: None

**Current State**: Already implemented

**Layer Order for Level 1**:

```
Z_LAYERS.BACKGROUND (0)        - Land background
Z_LAYERS.ENEMIES (100)         - Enemy sprites
Z_LAYERS.PLAYER (200)          - Dragon sprite
Z_LAYERS.PROJECTILES (300)     - Fireballs
Z_LAYERS.UI_ELEMENTS (800)     - Health bars
Z_LAYERS.FLOATING_DAMAGE (900) - Damage numbers
Z_LAYERS.UI (1000)             - HUD overlays
```

---

#### MigrationAdapter ✅

**File**: `apps/web/src/lib/pixi/systems/migration-adapter.ts`
**Responsibility**: System initialization and coordination
**Dependencies**: AssetManager, HealthBarManager, FloatingDamageManager, LayerManager

**Current State**: Already implemented

**Level 1 Usage**:

- Initialize shared systems (health bars, damage numbers)
- Coordinate update loops
- Provide system access to other managers

---

### Tertiary Managers (Future)

These are noted for completeness but NOT needed for Level 1:

#### SaveManager 💭

**Responsibility**: Save/load game state
**When Needed**: Level 2+ (when we have meaningful progression to save)
**Dependencies**: All managers (needs to serialize their state)

**Quick Summary**:

- Serialize all manager states to JSON
- Write to Dexie database
- Load on game start
- Handle save corruption gracefully

---

#### OfflineProgressManager 💭

**Responsibility**: Calculate offline gains
**When Needed**: Level 2+ (after first return to Draconia)
**Dependencies**: ProgressionManager, CombatManager, CurrencyManager

**Quick Summary**:

- Calculate gains based on time offline (8h linear, then decay)
- Apply rested bonuses (+50% for 15 minutes)
- Simulate combat and progression
- Cap at 24h base (96h with upgrades)

---

#### TelemetryManager 💭

**Responsibility**: Analytics and metrics
**When Needed**: After Level 1 is stable
**Dependencies**: All managers (reads state)

**Quick Summary**:

- Track key metrics: TTK, DPS, kills/hour, Arcana/hour
- Log progression milestones
- Detect balance issues
- NO external analytics initially (local only)

---

#### BossEncounterManager 💭

**Responsibility**: Boss fight mechanics
**When Needed**: Ward 1 boss (after basic combat works)
**Dependencies**: CombatManager, EntityManager

**Quick Summary**:

- Trigger boss spawn at end of ward
- Manage boss phases
- Handle special boss abilities
- Reward on boss defeat

---

## Future Phase Managers (Not Level 1)

These are documented for future reference but should NOT be built yet:

### Enchantment System (Phase 1, after Level 1)

- **EnchantmentManager**: Arcana spending and node leveling
- **ResearchManager**: Tech tree discovery system
- **AbilityManager**: Manual abilities (~20% damage contribution)
- **WeaponManager**: Auto-attack weapon types

### Town & Meta (Phase 2)

- **TownManager**: Vendor economy and item sales
- **LairManager**: Comfort and rested bonuses
- **CityManager**: Public works and buildings (evolve from DraconiaMenuManager)

### Automation (Phase 3-4)

- **ConvoyManager**: Transport routes and guards
- **StewardManager**: Delegation and automation
- **SynthProductionManager**: Material synthesis

---

## Manager Creation Checklist

When creating a new manager:

1. **Documentation First**
   - Add to this registry
   - Define responsibility (one sentence)
   - List dependencies
   - Sketch interface

2. **Create Manager File**
   - Follow naming: `{feature}-manager.ts`
   - Add to appropriate directory:
     - Core systems: `apps/web/src/lib/pixi/systems/`
     - Combat systems: `apps/web/src/lib/pixi/systems/combat/`
     - Rendering systems: `apps/web/src/lib/pixi/systems/rendering/`

3. **Implement Interface**
   - Keep methods focused on single responsibility
   - Delegate to other managers when needed
   - Add proper TypeScript types

4. **Integration**
   - Wire up dependencies
   - Add to GameStartManager or appropriate parent
   - Update MigrationAdapter if shared system

5. **Testing**
   - Unit tests for core logic
   - Integration tests for manager interactions
   - Manual testing in-game

6. **Update Documentation**
   - Update this registry (change status to ✅)
   - Add code examples
   - Document any gotchas

---

## Manager Dependency Graph (Level 1)

```
GameStartManager (Root)
├── AssetManager (Assets)
├── SplashScreenManager (Splash)
├── DraconiaMenuManager (City Menu)
├── MigrationAdapter (System Coordinator)
│   ├── HealthBarManager ✅
│   ├── FloatingDamageManager ✅
│   └── LayerManager ✅
├── LandManager (Environment ONLY)
├── EntityManager 🚧 (NEW - Entity Lifecycle)
│   ├── DragonProtagonistManager (moves here from LandManager)
│   └── Enemies (spawned by EnemySpawnManager)
├── CombatManager 📋 (Combat State & Rules)
│   └── ProjectileManager 📋 (Projectiles)
├── EnemySpawnManager 📋 (Spawning Logic)
│   └── FactionManager 📋 (Enemy Definitions)
├── ProgressionManager 📋 (Distance/Ward/Land)
├── CurrencyManager 📋 (Arcana/Soul Power)
├── ItemManager 📋 (Items & Inventory)
└── UIManager 📋 (HUD & Overlays)
```

---

## Next Steps

1. **Fix Current Bug**: Create EntityManager, refactor duplicate dragon creation
2. **Implement Level 1 Managers**: Follow priority order above
3. **Test Level 1**: Complete journey from start to return
4. **Iterate**: Refine based on gameplay feel
5. **Document Learnings**: Update this registry with insights

---

**Remember**: Don't create managers speculatively. Build them when the feature is
actively being implemented. Keep this document updated as the single source of truth.
