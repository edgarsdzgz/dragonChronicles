# Progression System - Draconia Chronicles v2.4.0

**Document:** 03_Progression_System.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Branching path progression, boss encounters, and state tracking specification

---

## Table of Contents

1. [Overview](#overview)
2. [Ward Structure](#ward-structure)
3. [Boss Encounter System](#boss-encounter-system)
4. [Branching Path System](#branching-path-system)
5. [State Persistence](#state-persistence)
6. [Land 1: Horizon Steppe](#land-1-horizon-steppe)
7. [Navigation & Traversal](#navigation--traversal)
8. [Implementation Specifications](#implementation-specifications)

---

## Overview

### Progression Philosophy

Draconia Chronicles v2.4.0 features a **non-linear branching progression system** where players navigate through wards with multiple path choices, boss encounters at key milestones, and state tracking that differentiates between per-journey and permanent progression.

**Key Principles:**
- **Journey-First**: Players can always progress forward (except boss encounters)
- **Non-Linear Exploration**: Branching paths offer choices and alternate routes
- **State Tracking**: Per-journey boss defeats vs permanent world boss defeats
- **Rewind Friendly**: Defeated bosses stay defeated within journey if player backtracks
- **Optional Content**: Mines, Worldstones accessible via alternate paths

### Progression Milestones

| Milestone | Type | Frequency | Respawn Behavior |
|-----------|------|-----------|------------------|
| Ward Boss Wave | Multi-enemy encounter | Every ward | Per-journey (resets on new journey) |
| Large Enemy | Single tough enemy | Every 10 wards | Per-journey (resets on new journey) |
| World Boss | Named unique boss | End of each land | Permanent defeat (NEVER respawns) |
| Worldstone | Endgame milestone | One per land | Permanent discovery |

---

## Ward Structure

### Ward Types

**1. Linear Wards**
- Sequential progression: Ward 1 → Ward 2 → Ward 3
- Single path forward
- Most common ward type
- Example: Tutorial wards (1-3) are linear

**2. Branching Wards**
- Multiple path options: Ward##A, Ward##B, Ward##C
- Player chooses which path to take at branch point
- Paths may have different content, challenges, or rewards
- Example: Ward 4A (easier) vs Ward 4B (harder with better rewards)

**3. Merging Wards**
- Multiple paths converge to single ward
- After branching paths, players rejoin main progression
- Example: Ward 4A/4B → Ward 5A/5B → Ward 6 (merged)

**4. Alternate Path Wards**
- Side routes off main progression
- Dead ends: Must backtrack to continue
- Use cases: Mines, Worldstones, hidden areas
- Example: Ward 11B → Ward 11C → Mine (dead end)

### Ward Notation System

**Format:** `Ward[Number][Letter]`

**Examples:**
- `Ward 1` - Linear ward (no letter)
- `Ward 4A` - Branch A of Ward 4
- `Ward 4B` - Branch B of Ward 4
- `Ward 11C` - Branch C of Ward 11 (alternate path to mine)

**Path Hierarchy:**
- Main path: Numbered wards without letters (Ward 1, Ward 2, Ward 3, etc.)
- Primary branches: A/B (Ward 4A, Ward 4B)
- Secondary branches: C/D/E... (Ward 11C for mine, Ward 22C for hidden area)

### Ward Progression Examples

**Example 1: Simple Branch**
```
Ward 3 → (Branch Point) → Ward 4A → Ward 5 → Ward 6
                       → Ward 4B → Ward 5 → Ward 6
```
Both paths lead to Ward 6 (merged)

**Example 2: Parallel Paths**
```
Ward 3 → Ward 4A → Ward 5A → Ward 6 (merged)
              ↓         ↓         ↑
          Ward 4B → Ward 5B -----
```
A and B paths are parallel, both lead to Ward 6

**Example 3: Dead End (Mine)**
```
Ward 10 → Ward 11A → Ward 12 (main path continues)
               ↓
          Ward 11B → Ward 11C → Mine (dead end)
                                   ↓
              Backtrack through 11C → 11B → rejoin at 12
```

**Example 4: Worldstone Path (Post-Boss)**
```
Ward 24 → Ward 25 (Sirocco world boss) → Ward 26A (Worldstone path - dead end)
                                                ↓
                                        Backtrack → Land 2 or continue exploring
```

---

## Boss Encounter System

### Boss Types Overview

| Boss Type | Frequency | Encounter Count | Respawn Behavior | Purpose |
|-----------|-----------|-----------------|------------------|---------|
| **Ward Boss Wave** | Every ward | Multi-enemy (3-8+) | Per-journey | Regular progression challenge |
| **Large Enemy** | Every 10 wards | Single enemy | Per-journey | Major milestone challenge |
| **World Boss** | End of land | Single named boss | ONE TIME ONLY | Land completion, story milestone |

### Ward Boss Waves (Every Ward)

**Frequency:** End of EVERY ward (Ward 1, Ward 2, Ward 3, ..., Ward N)

**Composition:**
- Multiple enemies spawn simultaneously
- Scaling: More enemies as wards progress
  - Ward 1: 3 enemies
  - Ward 5: 5 enemies
  - Ward 10: 8 enemies
  - Ward 20+: 10-12 enemies

**Enemy Types in Boss Wave:**
- Mix of melee, ranged, flying, ground enemies
- Higher stats than common enemies (2x health, 1.5x damage)
- Variety increases challenge (can't focus fire easily)

**Warning System:**
- UI popup: "⚠️ A strong enemy force is gathering!"
- Visual cues: Red tint, screen shake, ominous music
- Progression pauses (scrolling continues, but no advance to next ward)
- 5-second countdown (optional, for preparation)

**Encounter Flow:**
1. Player reaches end of ward
2. Warning triggers (5 seconds)
3. All boss wave enemies spawn simultaneously
4. Combat begins
5. Player must defeat all enemies to proceed
6. Victory: Arcana fills to max, checkpoint created

**Per-Journey Respawn:**
- Boss wave defeated: Tracked in journey state
- If player rewinds (Ward 5 → Ward 3): Ward 3 boss still defeated
- New journey: All ward boss waves reset (respawn)

**TypeScript Schema:**
```typescript
interface WardBossWaveState {
  wardId: string; // "ward-4A", "ward-5", etc.
  defeated: boolean; // true = defeated in this journey
  enemyCount: number; // 3-12 depending on ward
  composition: EnemyType[]; // ["melee", "ranged", "melee"]
}

// Tracked per journey
journeyState.wardBossesDefeated.set("ward-4A-boss", true);
```

### Large Enemies (Every 10 Wards)

**Frequency:** Every 10th ward (Ward 10, Ward 20, Ward 30, etc.)

**Type:** Single tough unnamed enemy

**Stats:**
- Very high health (10x common enemy)
- High damage (3x common enemy)
- Special mechanics (unique to each large enemy)

**Examples:**
- Ward 10: Giant Elemental (fire-based attacks)
- Ward 20: Corrupted Wyvern (aerial combat)
- Ward 30: Stone Golem (slow but devastating)

**Encounter Flow:**
1. Same warning system as boss waves
2. Single large enemy spawns
3. Combat: 1-3 minutes (challenging but solo-able)
4. Victory: Large Arcana/Soul Power bonus, rare items

**Per-Journey Respawn:**
- Tracked in journey state (like ward bosses)
- Respawns on new journey

**TypeScript Schema:**
```typescript
// Tracked per journey
journeyState.largeEnemiesDefeated.set(10, true); // Ward 10 large enemy defeated
```

### World Bosses (End of Each Land)

**Frequency:** Final ward of each Land (Sirocco at Land 1 end)

**Type:** Named unique boss with lore significance

**Encounter:** ONE TIME ONLY, PERMANENT DEFEAT, NEVER RESPAWNS

**Sirocco Example (Land 1 World Boss):**

**Warning:**
- Epic cutscene: "⚠️ THE KHAGAN OF THE SIROCCO BLOCKS YOUR PATH"
- Boss introduction: Sirocco appears (dramatic animation, music)
- Elder voiceover: "This corrupted dragon guards the Worldstone... defeat him!"

**Boss Fight:**
- **Phase 1** (100% → 66% HP):
  - Ground attacks: Wind slashes, melee swipes
  - Summon: Minor wind spirits (small adds)

- **Phase 2** (66% → 33% HP):
  - Aerial attacks: Dive bombs, wind breath
  - Environmental hazards: Tornadoes, debris

- **Phase 3** (33% → 0% HP):
  - Enrage: Faster attacks, more damage
  - Ultimate: Storm Call (powerful area attack, must dodge)

**Duration:** 3-5 minutes (challenging endgame encounter)

**Defeat:**
- Victory cutscene: Sirocco falls, land stabilizes
- Lore: Elder explains Worldstone purpose
- Worldstone alternate path unlocked

**Rewards:**
- 10,000 Soul Power (massive permanent boost)
- Unique item: "Sirocco's Crest" (cosmetic or stat item)
- Land 1 completion achievement

**Permanent State:**
- Sirocco defeated: NEVER respawns
- New journeys: Sirocco stays defeated
- Worldstone path always accessible after defeat

**TypeScript Schema:**
```typescript
// Tracked permanently
permanentState.worldBosses.set("sirocco", true);

// Never reset, even on new journeys
```

**Design Rationale:**
- **One-time only**: Makes victory feel impactful and permanent
- **Story significance**: Major narrative milestone
- **Progression gate**: Unlocks Worldstone (optional) and Land 2 (future)
- **No grinding**: Can't farm world boss for rewards

### Boss Encounter Comparison

| Aspect | Ward Boss Wave | Large Enemy | World Boss |
|--------|---------------|-------------|------------|
| **Frequency** | Every ward | Every 10 wards | End of land |
| **Enemies** | 3-12 (multi) | 1 (solo) | 1 (unique) |
| **Difficulty** | Medium | High | Very High |
| **Duration** | 30-60 seconds | 1-3 minutes | 3-5 minutes |
| **Respawn** | Per-journey | Per-journey | NEVER |
| **Rewards** | Arcana, items | Arcana, rare items | Soul Power, unique item |
| **Purpose** | Progression checkpoint | Milestone challenge | Land completion |

---

## Branching Path System

### Path Types Detailed

**1. Main Path (Linear Progression)**
- Default progression route
- Always available
- Ward numbering: 1, 2, 3, 4, 5, 6, ...
- Most straightforward difficulty curve

**2. Alternate Path (Optional Branches)**
- Discovered through exploration, NPCs, Cartography Pages
- Ward numbering with letters: 4A, 4B, 11C, etc.
- May have different challenges, rewards, or lore
- Example: Ward 4A (easier, more common loot) vs Ward 4B (harder, rare loot)

**3. Dead End Path (Mines, Worldstones)**
- Terminates at special location
- Must backtrack to continue main progression
- Example: Ward 11B → Ward 11C → Mine → Back through 11C → 11B → Ward 12
- Rewards justify backtracking (gold, permanent upgrades, lore)

**4. Merging Path (Convergence)**
- Multiple branches converge to single ward
- Example: Ward 4A/4B → Ward 6 (both lead here)
- Players on different paths rejoin at merge point

**5. Hidden Path (Unlock Required)**
- Requires special condition to access
- Examples: Scroll discovery, item found, building unlocked
- May not be visible at branch point until unlocked

### Branch Point Mechanics

**Visual Representation:**
```
Player at Ward 3 end → Branch Point UI appears
    ↓
Choice: Ward 4A (Main Path) or Ward 4B (Alternate Path)
    ↓
Player selects → Journey continues on chosen path
```

**Branch Point UI:**
- **Fork Icon:** Visual indicator of branching choice
- **Path Previews:**
  - Ward 4A: "Main Path - Balanced difficulty"
  - Ward 4B: "Alternate Path - Higher challenge, better rewards"
- **Path Status:**
  - Unlocked: Can be selected
  - Locked: Grayed out with unlock condition ("Requires: Mine location revealed")
- **Path History:** Show which paths previously taken (optional)

**Player Choice:**
- Click/tap on desired path
- Confirm choice (optional: "Are you sure?")
- Journey proceeds on selected path
- Choice tracked in journey state

**TypeScript Schema:**
```typescript
interface BranchPoint {
  wardNumber: number; // 4
  paths: BranchPath[]; // [4A, 4B, 4C]
  defaultPath: string; // "4A" (main path)
}

interface BranchPath {
  id: string; // "ward-4A"
  name: string; // "Main Path"
  description: string; // "Balanced difficulty"
  locked: boolean; // false = unlocked
  unlockCondition?: string; // "cartography-page-3" (if locked)
  difficulty: "easy" | "medium" | "hard";
  rewards: string[]; // ["common-loot", "boss-wave"]
}

// Tracked in journey state
journeyState.branchChoices.set(4, "A"); // At ward 4, chose path A
```

### Path Discovery Mechanics

**1. Visual Cues (Branch Points)**
- Player reaches ward end with branching
- UI shows available paths
- Main path always visible
- Alternate paths visible if unlocked

**2. Cartography Pages (Mine Discovery)**
- Collect 3 Cartography Pages (same land)
- Mine location revealed: "Ward 11C - Horizon Steppe Mine"
- Branch point at Ward 11 now shows Ward 11B option (toward mine)

**3. NPC Hints (Assistant, Elder)**
- Assistant: "I've found rumors of a hidden path at Ward 15..."
- Elder: "The Worldstone lies beyond Sirocco, on an alternate path"
- Hints don't unlock paths, but guide exploration

**4. Scroll Discoveries**
- Some Scrolls reveal hidden paths
- Example: "Scroll of Secret Routes" unlocks Ward 22C (hidden area)

**5. Building Unlocks**
- Mining Guild unlocked → Mine paths visible
- Fast Travel unlocked → Can revisit branch points easily

### Path Examples (Land 1)

**Example 1: Early Game Branch (Ward 4)**
```
Ward 3 → (Branch Point) → Ward 4A (main, balanced)
                       → Ward 4B (alternate, harder, rare loot)

Both paths → Ward 5 (no branching) → Ward 6
```

**Characteristics:**
- Ward 4A: 5 boss wave enemies, common loot
- Ward 4B: 7 boss wave enemies, rare loot (higher item drop %)
- Player choice: Risk vs reward

**Example 2: Mine Discovery (Ward 11)**
```
Ward 10 → Ward 11A (main path) → Ward 12
               ↓
          Ward 11B (toward mine) → Ward 11C → Mine (dead end)
                                                  ↓
                                  Backtrack: 11C → 11B → 12
```

**Characteristics:**
- Ward 11B unlocked after 3 Cartography Pages collected
- Ward 11C: Mine Guardian boss fight
- Mine: Clicker minigame (200-500 Gold reward)
- Must backtrack to rejoin main path at Ward 12

**Example 3: Worldstone Path (Post-Sirocco)**
```
Ward 24 → Ward 25 (Sirocco world boss) → Ward 26A (Worldstone path)
                                                ↓
                                        Dead end: Worldstone discovery
                                                ↓
                                        Backtrack to Ward 25 → Land 2 or continue
```

**Characteristics:**
- Ward 26A unlocked ONLY after Sirocco defeated (permanent)
- Worldstone path: Short (1-2 wards), no enemies, scenic
- Worldstone: Powering costs 50,000 Arcana (significant investment)
- Optional content (not required for Land 2 progression)

**Example 4: Parallel Paths (Mid-Game)**
```
Ward 15 → Ward 16A (melee-focused enemies) → Ward 17A → Ward 18 (merged)
               ↓                                  ↓          ↑
          Ward 16B (ranged-focused enemies) → Ward 17B -----
```

**Characteristics:**
- Ward 16A: More melee enemies, close-quarters combat
- Ward 16B: More ranged enemies, dodging emphasis
- Both paths same difficulty, different combat style
- Player choice based on preferred playstyle

---

## State Persistence

### Per-Journey State (Resets on New Journey)

**Definition:** State that tracks current journey progress, resets when player starts new journey

**Components:**
```typescript
interface JourneyState {
  journeyId: string; // UUID for this journey
  startTime: number; // Unix timestamp

  // Boss Defeats (Per-Journey)
  wardBossesDefeated: Map<string, boolean>; // "ward-4A-boss": true
  largeEnemiesDefeated: Map<number, boolean>; // 10: true, 20: false

  // Path Navigation
  currentWard: string; // "ward-5B"
  visitedWards: string[]; // ["ward-1", "ward-2", "ward-3", "ward-4A", "ward-5B"]
  branchChoices: Map<number, string>; // 4: "A", 11: "B", 16: "A"

  // Resources (Per-Journey)
  arcana: number; // Current Arcana in pendant (0-maxCapacity)
  items: ItemInventory; // Current item inventory (consumables, temporary)

  // Temporary Buffs
  activeBuffs: Buff[]; // Temporary stat increases
}
```

**Reset Conditions:**
- Player starts new journey (manual or after death/return depending on game design)
- All ward bosses respawn
- All large enemies respawn
- Path history cleared (can make new branch choices)
- Arcana/items may reset or persist (TBD: design decision)

**Persistence Across Returns:**
- If player returns to Draconia mid-journey: Journey state persists
- Ward bosses stay defeated within journey
- Path choices remain (can't re-choose at same branch point in same journey)

**Rewind Behavior Example:**
```
Journey 1:
  Defeat Ward 1 boss → Progress to Ward 5 → Rewind to Ward 1
  Ward 1 boss still defeated (no re-fight)

Journey 2:
  Ward 1 boss respawned (new journey)
```

### Permanent State (Never Resets)

**Definition:** State that persists across ALL journeys, represents permanent progression

**Components:**
```typescript
interface PermanentState {
  // World Boss Defeats (Permanent)
  worldBosses: Map<string, boolean>; // "sirocco": true (NEVER resets)

  // Worldstones (Permanent)
  worldstones: Map<string, WorldstoneState>; // "horizonSteppe": {discovered, powered}

  // Fast Travel (Permanent)
  fastTravelCheckpoints: Set<string>; // ["ward-1", "ward-5A", "ward-10"]
  fastTravelUnlocked: boolean; // System unlocked via City Council

  // Path Discoveries (Permanent)
  discoveredPaths: Set<string>; // ["ward-11C-mine", "ward-22C-hidden"]

  // Buildings (Permanent)
  buildings: Set<string>; // ["arcanaBank", "aethervault", "librarium", "runeForge"]

  // Permanent Upgrades (Permanent)
  permanentUpgrades: UpgradeState[]; // [{id: "fire-potency-1", level: 3}, ...]

  // Currencies (Permanent)
  soulPower: number; // Total Soul Power (never resets)
  gold: number; // Total Gold (never resets)
  arcanaDeposited: number; // Total Arcana deposited to Bank (cumulative)
  maxArcanaCapacity: number; // Current max capacity (upgrades)

  // Scrolls & Research (Permanent)
  scrollsDeciphered: Set<string>; // ["scroll-soul-power", "scroll-ward-2"]
  researchCompleted: Set<string>; // ["soul-power-enchantment"]

  // Items & Cartography (Permanent)
  cartographyPages: Map<string, number>; // "horizonSteppe": 3
  minesDiscovered: Set<string>; // ["horizonSteppe-mine-1"]
}

interface WorldstoneState {
  discovered: boolean; // Has player found Worldstone?
  powered: boolean; // Has player powered it?
  arcanaDeposited: number; // Arcana used to power (50,000 required)
}
```

**Never Resets:**
- World boss defeats (Sirocco NEVER respawns)
- Building unlocks (once funded, always available)
- Permanent upgrades (Rune Forge stat increases)
- Soul Power accumulation (permanent progression currency)
- Gold accumulation (permanent economy currency)
- Fast travel checkpoints (convenience unlocks)
- Worldstone discoveries and powering

**Carries Across Journeys:**
- Player gets stronger permanently (upgrades)
- World boss areas always accessible
- Buildings and systems stay unlocked

---

## Land 1: Horizon Steppe

### Overview

**Total Wards:** TBD (estimate: 25-30 wards for MVP)

**World Boss:** Sirocco (final ward)

**Biome:** Grassland steppe with wind-swept aesthetic

**Lore:** First land outside Draconia barrier, corrupted by Unmaking, home to Sirocco

### Ward Distribution (Example: 25 Wards)

| Ward Range | Content | Boss Type |
|------------|---------|-----------|
| Ward 1-3 | Tutorial (linear) | Boss waves (3-5 enemies) |
| Ward 4-9 | Early game (branching introduced) | Boss waves (5-7 enemies) |
| Ward 10 | Large enemy milestone | Large Enemy + boss wave |
| Ward 11-19 | Mid game (mine discovery) | Boss waves (7-10 enemies) |
| Ward 20 | Large enemy milestone | Large Enemy + boss wave |
| Ward 21-24 | Late game (increasing difficulty) | Boss waves (10-12 enemies) |
| Ward 25 | World boss | Sirocco (ONE TIME ONLY) |
| Ward 26A | Worldstone path (optional) | None (scenic, dead end) |

### Branching Points (Example Locations)

**Ward 4:** First branch (4A vs 4B)
- 4A: Main path, balanced
- 4B: Alternate path, higher challenge

**Ward 11:** Mine branch (11A vs 11B)
- 11A: Main path
- 11B → 11C: Mine path (dead end)

**Ward 16:** Playstyle branch (16A vs 16B)
- 16A: Melee-focused enemies
- 16B: Ranged-focused enemies

**Ward 22:** Hidden path (22A vs 22C)
- 22A: Main path
- 22C: Hidden area (Scroll unlock required)

**Ward 26:** Worldstone path (post-Sirocco)
- 26A: Worldstone path (dead end, optional)

### Enemy Scaling

| Ward Range | Common Enemy HP | Boss Wave Enemy HP | Enemy Count (Boss Wave) |
|------------|-----------------|--------------------|-----------------------|
| Ward 1-5 | 100-200 | 200-400 | 3-5 |
| Ward 6-10 | 200-400 | 400-800 | 5-7 |
| Ward 11-15 | 400-800 | 800-1600 | 7-9 |
| Ward 16-20 | 800-1600 | 1600-3200 | 9-11 |
| Ward 21-25 | 1600-3200 | 3200-6400 | 11-13 |
| Sirocco | N/A | 50,000 HP | 1 (3 phases) |

*(Scaling formulas TBD, likely exponential or logarithmic)*

### Demo Scope (MVP)

**Required:**
- ✓ Defeat Sirocco (Ward 25 world boss, permanent)
- ✓ Experience branching paths (Ward 4, Ward 11, Ward 16)
- ✓ Complete tutorial sequence (Wards 1-3)
- ✓ Demonstrate state tracking (per-journey vs permanent)

**Recommended:**
- ◯ Discover Worldstone (Ward 26A, optional)
- ◯ Discover first mine (Ward 11C, optional)
- ◯ Unlock fast travel (City Council, 2,000 Gold)

**Out of Scope:**
- Power Worldstone (requires 50,000 Arcana, significant grind)
- Complete ALL branching paths (player choice)
- Discover ALL hidden areas (exploration-based)

---

## Navigation & Traversal

### Movement Through Wards

**Ward Traversal:**
- Each ward: 1-3 minutes of gameplay (enemy encounters)
- Auto-scrolling or player-controlled (TBD: design decision)
- Enemies spawn continuously until boss wave

**Boss Wave Gate:**
- Progression pauses at boss wave
- Must defeat all enemies to proceed to next ward
- Cannot skip boss waves (hard gate)

**Branch Point Navigation:**
- At ward end with branching: UI shows choices
- Player selects path → Journey continues on chosen path
- Cannot change choice once made (within journey)

**Backtracking:**
- Manual: Travel backward through wards (Ward 5 → Ward 4 → Ward 3)
- Defeated bosses stay defeated (within journey)
- Can re-encounter common enemies (respawn continuously)
- Use case: Return to alternate path, revisit mine

**Fast Travel (Unlockable):**
- Unlock: City Council (2,000 Gold)
- Checkpoints: Each ward completion creates checkpoint
- Usage: Select checkpoint from list → Teleport instantly
- Cost: 20 Arcana per use (Tier 1)
- Restrictions: Cannot skip undefeated bosses, cannot skip first visits

### Path Memory & History

**Journey State Tracking:**
```typescript
journeyState.visitedWards = [
  "ward-1", "ward-2", "ward-3", "ward-4A", "ward-5", "ward-6",
  "ward-7", "ward-8", "ward-9", "ward-10", "ward-11B", "ward-11C"
];

journeyState.branchChoices = {
  4: "A",   // At Ward 4, chose path A
  11: "B",  // At Ward 11, chose path B (toward mine)
  16: "A"   // At Ward 16, chose path A
};
```

**Fast Travel UI:**
- Shows visited wards with checkpoints
- Highlights branch choices made
- Shows current position
- Warns if attempting to skip undefeated boss

**Rewind Behavior:**
- Player at Ward 10, fast travels to Ward 5
- Ward 5-10 bosses already defeated: Stay defeated
- Player progresses forward again: No re-fights until new journey

---

## Implementation Specifications

### Boss Encounter Implementation

**Ward Boss Wave System:**
```typescript
interface BossWaveConfig {
  wardId: string;
  enemyCount: number; // 3-13 scaling
  enemyTypes: EnemyType[]; // ["melee", "ranged", "flying"]
  spawnSimultaneous: boolean; // true (all at once)
  warningDuration: number; // 5 seconds
  rewardArcana: number; // Fills to max capacity
  rewardItems: Item[]; // Guaranteed drops
}

function triggerBossWave(wardId: string) {
  const config = getBossWaveConfig(wardId);

  // 1. Show warning
  showWarning("Strong enemy force gathering!", config.warningDuration);
  pauseProgression();

  // 2. Spawn enemies after countdown
  await delay(config.warningDuration * 1000);
  spawnEnemies(config.enemyTypes, config.enemyCount, simultaneous: true);

  // 3. Wait for all defeats
  await waitForBossWaveDefeat();

  // 4. Rewards
  fillArcanaToMax();
  dropItems(config.rewardItems);
  createCheckpoint(wardId);

  // 5. Mark defeated (per-journey)
  journeyState.wardBossesDefeated.set(`${wardId}-boss`, true);

  // 6. Resume progression
  resumeProgression();
}

function isWardBossDefeated(wardId: string): boolean {
  return journeyState.wardBossesDefeated.get(`${wardId}-boss`) || false;
}
```

**World Boss System:**
```typescript
interface WorldBossConfig {
  bossId: string; // "sirocco"
  name: string; // "Khagan of the Sirocco"
  phases: BossPhase[];
  health: number; // 50,000 HP
  cutsceneIntro: string; // Video/animation path
  cutsceneDefeat: string; // Victory animation
  rewardSoulPower: number; // 10,000 SP
  rewardItems: Item[]; // Unique items
  unlocksPath: string; // "ward-26A" (Worldstone)
}

function triggerWorldBoss(bossId: string) {
  // Check if already defeated (permanent state)
  if (permanentState.worldBosses.get(bossId)) {
    console.log("World boss already defeated");
    unlockWorldstonePath(bossId);
    return; // Skip fight
  }

  const config = getWorldBossConfig(bossId);

  // 1. Intro cutscene
  playCutscene(config.cutsceneIntro);

  // 2. Boss fight (phases)
  await bossPhase1(config);
  await bossPhase2(config);
  await bossPhase3(config);

  // 3. Defeat cutscene
  playCutscene(config.cutsceneDefeat);

  // 4. Rewards
  addSoulPower(config.rewardSoulPower);
  dropItems(config.rewardItems);

  // 5. Mark defeated PERMANENTLY
  permanentState.worldBosses.set(bossId, true);
  savePermanentState();

  // 6. Unlock Worldstone path
  unlockWorldstonePath(config.unlocksPath);
}

function isWorldBossDefeated(bossId: string): boolean {
  return permanentState.worldBosses.get(bossId) || false;
}
```

### Branching Path System Implementation

**Branch Point System:**
```typescript
interface BranchPoint {
  location: string; // "ward-4-end"
  paths: BranchPath[];
  defaultPath: string; // "ward-4A" (main path)
}

interface BranchPath {
  pathId: string; // "ward-4A", "ward-4B"
  displayName: string; // "Main Path", "Alternate Path"
  description: string; // "Balanced difficulty"
  locked: boolean; // false = available
  unlockCondition?: UnlockCondition; // If locked
  nextWard: string; // "ward-5" (where this path leads)
}

interface UnlockCondition {
  type: "cartography" | "scroll" | "building";
  requirement: string; // "3-cartography-pages-horizonSteppe"
}

function showBranchPointUI(branchPoint: BranchPoint) {
  const ui = createBranchPointUI();

  branchPoint.paths.forEach(path => {
    const button = createPathButton(path);

    if (path.locked) {
      button.disabled = true;
      button.tooltip = `Locked: ${path.unlockCondition.requirement}`;
    } else {
      button.onClick = () => selectPath(path);
    }

    ui.addButton(button);
  });

  ui.show();
}

function selectPath(path: BranchPath) {
  const wardNumber = extractWardNumber(path.pathId); // 4 from "ward-4A"
  const pathLetter = extractPathLetter(path.pathId); // "A" from "ward-4A"

  // Track choice in journey state
  journeyState.branchChoices.set(wardNumber, pathLetter);
  journeyState.currentWard = path.pathId;

  // Continue journey on selected path
  proceedToWard(path.nextWard);
}
```

### State Persistence Implementation

**Save System:**
```typescript
interface SaveData {
  version: string; // "2.4.0"
  journeyState: JourneyState;
  permanentState: PermanentState;
  timestamp: number;
}

function saveGame() {
  const saveData: SaveData = {
    version: "2.4.0",
    journeyState: serializeJourneyState(),
    permanentState: serializePermanentState(),
    timestamp: Date.now()
  };

  // Save to Dexie (IndexedDB)
  await db.saves.put(saveData, "current-save");
}

function loadGame(): SaveData {
  const saveData = await db.saves.get("current-save");

  if (!saveData) {
    return createNewSave();
  }

  // Deserialize states
  journeyState = deserializeJourneyState(saveData.journeyState);
  permanentState = deserializePermanentState(saveData.permanentState);

  return saveData;
}

function startNewJourney() {
  // Reset journey state
  journeyState = {
    journeyId: generateUUID(),
    startTime: Date.now(),
    wardBossesDefeated: new Map(),
    largeEnemiesDefeated: new Map(),
    currentWard: "ward-1",
    visitedWards: [],
    branchChoices: new Map(),
    arcana: 0,
    items: new ItemInventory(),
    activeBuffs: []
  };

  // Permanent state persists (not reset)

  saveGame();
}
```

### Fast Travel Implementation

**Fast Travel System:**
```typescript
interface FastTravelCheckpoint {
  wardId: string; // "ward-5A"
  name: string; // "Ward 5 (Path A)"
  unlocked: boolean; // true if player has visited
  bossDefeated: boolean; // true if boss defeated (per-journey)
}

function openFastTravelUI() {
  if (!permanentState.fastTravelUnlocked) {
    showMessage("Fast Travel not unlocked. Fund at City Council for 2,000 Gold.");
    return;
  }

  const checkpoints = getAllCheckpoints();
  const ui = createFastTravelUI();

  checkpoints.forEach(checkpoint => {
    if (!checkpoint.unlocked) return; // Skip unvisited wards

    const button = createCheckpointButton(checkpoint);
    button.onClick = () => fastTravelTo(checkpoint);
    ui.addButton(button);
  });

  ui.show();
}

function fastTravelTo(checkpoint: FastTravelCheckpoint) {
  // Check cost
  const cost = 20; // Arcana (Tier 1)
  if (journeyState.arcana < cost) {
    showMessage("Not enough Arcana for fast travel!");
    return;
  }

  // Deduct cost
  journeyState.arcana -= cost;

  // Check restrictions
  if (hasUndefeatedBossBetween(journeyState.currentWard, checkpoint.wardId)) {
    showMessage("Cannot skip undefeated bosses!");
    return;
  }

  // Teleport
  journeyState.currentWard = checkpoint.wardId;
  loadWard(checkpoint.wardId);

  showMessage(`Fast traveled to ${checkpoint.name} (-${cost} Arcana)`);
}
```

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Tutorial Sequence: [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md)
- Economy System: [02_Economy_System.md](./02_Economy_System.md)
- Building System: [04_Building_System.md](./04_Building_System.md)
- Combat System: [05_Combat_System.md](./05_Combat_System.md)
- Path Navigation: [06_Path_Navigation_System.md](./06_Path_Navigation_System.md)
- State Persistence: [07_State_Persistence.md](./07_State_Persistence.md)

---

*This document provides complete specifications for the v2.4.0 branching progression system, boss encounters, and state persistence.*
