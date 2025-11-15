# Draconia Chronicles - Game Design Document v2.4.0

**Version:** 2.4.0
**Date:** 2025-11-15
**Status:** MVP/Demo Specification
**Supersedes:** [v2.3.2](../archive/v2.3/v2.3.2GDD.md)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Game Flow Overview](#game-flow-overview)
3. [Progression Architecture](#progression-architecture)
4. [Economy System](#economy-system)
5. [Building System](#building-system)
6. [Combat System](#combat-system)
7. [Tutorial Sequence](#tutorial-sequence)
8. [MVP/Demo Scope](#mvpdemo-scope)
9. [Design Philosophy](#design-philosophy)
10. [Technical Requirements](#technical-requirements)

---

## Executive Summary

### Version 2.4.0 Highlights

Draconia Chronicles v2.4.0 represents a fundamental redesign of the early-game flow and progression systems with a focus on delivering a polished MVP/demo that introduces all core systems through a structured 15-step tutorial sequence.

**Key Features:**
- **Branching Path Progression**: Non-linear ward exploration with alternate routes (Ward##A, Ward##B, Ward##C)
- **Boss State Tracking**: Per-journey ward bosses + permanent world bosses
- **Structured Tutorial**: 15-step guided introduction to all systems
- **Economy Redesign**: 25% Arcana tax every return, Gold-gated City Council projects
- **Soul Power Unlock**: Gated behind Ward 3 Scroll discovery
- **Worldstone System**: Optional endgame milestones enabling automation and land protection

**MVP Scope:**
Complete Land 1 (Horizon Steppe) by defeating Sirocco and discovering the Worldstone, introducing all core gameplay systems in a cohesive first story beat.

### Core Philosophy

- **Journey-First Design**: Players can always progress forward (except boss encounters)
- **Optional Engagement**: Systems not required to progress, but difficulty increases without them
- **Inconvenience First**: Manual backtracking; fast travel as unlockable convenience
- **Convenience at a Price**: Gold/Arcana costs for quality-of-life upgrades
- **Progressive Discovery**: Features unlock through structured tutorial, not all at once

---

## Game Flow Overview

### High-Level Loop

```
Cutscene → Journey (Ward 1-3) → First Return → Arcana Bank
    ↓
Continue Journey → Ward 3 Boss (Scroll) → Second Return → Soul Power Unlock
    ↓
City Council → Librarium → Rune Forge → Permanent Upgrades
    ↓
Ongoing: Journey → Boss Waves → Scrolls → Mines → Worldstone
    ↓
Land 1 Complete: Sirocco → Worldstone → Intro Story Beat Complete
```

### 15-Step Tutorial Sequence (Summary)

1. **Cutscene → Journey**: No Soul Power, no Return button, start collecting Arcana
2. **Ward 1 Enemies**: Arcana + items (guaranteed drops: 5, 15, 50 enemies)
3. **Ward 1 Boss Wave**: Multiple enemies, Arcana fills to max, Return button revealed
4. **First Return**: 25% tax explained, Arcana Bank deposit → Max Arcana increase
5. **Ward 2-3 Journey**: Continue collecting, small Scroll drop chance
6. **Ward 3 Boss Wave**: 100% FIRST SCROLL drop (one-time), Arcana fills
7. **Second Return**: Aethervault → Elder deciphers → Soul Power unlocked
8. **City Council**: Fund Librarium with Gold (sell Silver/Nickel items)
9. **Librarium Research**: "Soul Power Permanent Enchantment" (IRL time)
10. **City Council**: Fund Rune Forge with Gold
11. **Rune Forge Usage**: Craft permanent upgrades (Soul Power cost, IRL time)
12. **Ongoing Scrolls**: Small % drops + Ward 2/5 guaranteed, hire Scroll Researchers
13. **Cartography Pages**: Find pages → Mining Guild → mine discovery
14. **Land 1 Progress**: Progress through wards, branching paths, fast travel unlock
15. **Sirocco + Worldstone**: Beat world boss → discover Worldstone → complete intro

*(Detailed tutorial specification in [Tutorial Sequence](#tutorial-sequence) section)*

---

## Progression Architecture

### Ward Structure

**Ward Types:**
- **Linear Wards**: Standard sequential progression (Ward 1 → Ward 2 → Ward 3)
- **Branching Wards**: Multiple path options (Ward 4A or Ward 4B)
- **Merging Wards**: Multiple paths converge to single ward
- **Alternate Path Wards**: Side routes (mines, Worldstone access)

**Path Notation:**
Wards use `Ward##` for linear, `Ward##A`, `Ward##B`, `Ward##C` for branching paths.

**Examples:**
```
Linear: Ward 1 → Ward 2 → Ward 3 → Ward 4

Branching:
Ward 3 → Ward 4A → Ward 5A → Ward 6
              ↓         ↓         ↑
          Ward 4B → Ward 5B -----

Dead End (Mine):
Ward 10 → Ward 11A → Ward 12
               ↓
          Ward 11B → Ward 11C → Mine
                                   ↓
              Back through Ward 11C → Ward 11B → Ward 12

Worldstone Path:
Ward N → Sirocco (world boss) → Ward N+1A (Worldstone path - dead end)
                                         ↓
                                 Back through → Ward N+2
```

### Boss Encounter System

#### Ward Bosses (Every Ward)
- **Frequency**: End of every ward
- **Type**: Boss wave = multiple enemies spawn simultaneously
- **Encounter**: Single per journey
- **Defeat State**: Tracked per journey, stays defeated within journey
- **Respawn**: Resets on new journey
- **Rewind Behavior**: If player defeats Ward 1 boss, progresses to Ward 3, then rewinds to Ward 1, boss stays defeated in that journey

**Example:**
- Journey 1: Defeat Ward 1 boss → progress to Ward 3 → rewind to Ward 1 → boss still defeated
- Journey 2: Start new journey → all ward bosses respawn (including Ward 1)

#### Large Enemies (Every 10 Wards)
- **Frequency**: Every 10th ward (Ward 10, Ward 20, Ward 30, etc.)
- **Type**: Single tough unnamed enemy
- **Encounter**: Single per journey (like ward bosses)
- **Defeat State**: Tracked per journey, respawn on new journey
- **Purpose**: Major challenge milestone, not required for progression

#### World Bosses (End of Each Land)
- **Frequency**: Final ward of each land (Sirocco at end of Land 1)
- **Type**: Named, unique boss with special mechanics
- **Encounter**: ONE TIME ONLY, EVER - NEVER repeatable
- **Defeat State**: Permanent, tracked globally, never respawns
- **Purpose**: Unlock Worldstone access, major story milestone
- **Progression**: Block path to Worldstone alternate route

**World Boss Flow:**
```
Progress through Land 1 → Final Ward → Sirocco (world boss)
                                           ↓
                                     Defeat once (permanent)
                                           ↓
                                Worldstone path unlocked (alternate path)
                                           ↓
                              Optional: Discover Worldstone (dead end)
                                           ↓
                                   Backtrack to continue journey
```

### Branching Path System

**Path Types:**

1. **Main Path**: Always available, linear ward progression
2. **Alternate Path**: Optional routes discovered through exploration, Cartography Pages, NPCs
3. **Dead End Path**: Terminates at special location (mine, Worldstone), requires backtracking
4. **Merging Path**: Multiple routes converge to same destination
5. **Hidden Path**: Requires special unlock condition (Scroll, item, building)

**Path Discovery:**
- **Visual Cues**: Branching points visible in journey UI
- **Cartography Pages**: Reveal mine locations and alternate paths
- **NPC Hints**: Assistant passive research, Elder suggestions
- **Exploration**: Some paths only found by player choice at branch point

**Alternate Path Use Cases:**
- **Worldstone Access**: After world boss defeat (optional)
- **Mine Discovery**: Cartography Pages → alternate path → mine guardian → clicker minigame
- **Future Content**: Side quests, hidden bosses, resource nodes (TBD)

### Navigation Mechanics

#### Manual Travel (Initial)
- Walk through each ward sequentially
- Backtrack through same wards if needed (e.g., after mine visit)
- Boss encounters preserved: Defeated bosses stay defeated within journey
- Resource cost: Time, potential re-encounters with common enemies

#### Fast Travel (Unlockable)
- **Unlock**: City Council project (Gold + resources cost)
- **Checkpoints**: Each ward completion creates checkpoint
- **Named Checkpoints**: Important locations (boss arenas, branch points, mines)
- **Usage Cost**: Arcana or Gold per use (convenience at a price)
- **Restrictions**:
  - Cannot skip undefeated bosses
  - Cannot skip first visit to new wards
  - Can only travel to previously visited checkpoints

**Fast Travel Upgrade Path:**
- **Tier 1**: Travel to completed wards (high Arcana cost per use)
- **Tier 2**: Reduced cost per use (Gold unlock + upgrade)
- **Tier 3**: Bulk checkpoints, "skip entire branch" options (Gold + Soul Power)

### State Persistence

#### Per-Journey State (Resets on New Journey)
- Ward boss defeats
- Large enemy defeats
- Current position in ward network
- Path history (which wards visited this journey)
- Temporary buffs/debuffs

#### Permanent State (Never Resets)
- World boss defeats (Sirocco, etc.)
- Worldstone discoveries
- Fast travel checkpoints unlocked
- Alternate path discoveries (mines, hidden areas)
- Building unlocks
- Permanent upgrades (Rune Forge)
- Research completions

**TypeScript Schema (Conceptual):**
```typescript
interface JourneyState {
  journeyId: string; // UUID
  wardBossesDefeated: Map<string, boolean>; // "ward-4A-boss": true
  largeEnemiesDefeated: Map<number, boolean>; // 10: true, 20: false
  currentWard: string; // "ward-5B"
  visitedWards: string[]; // ["ward-1", "ward-2A", "ward-3", "ward-4A", "ward-5B"]
  branchChoices: Map<number, string>; // 4: "A", 11: "B"
}

interface PermanentState {
  worldBosses: Map<string, boolean>; // "sirocco": true
  worldstones: Map<string, WorldstoneState>; // "horizonSteppe": {discovered: true, powered: false}
  fastTravelCheckpoints: Set<string>; // ["ward-1", "ward-5A", "ward-10"]
  discoveredPaths: Set<string>; // ["ward-11C-mine", "ward-22A-worldstone"]
  buildings: Set<string>; // ["arcanaBank", "aethervault", "librarium", "runeForge"]
  permanentUpgrades: UpgradeState[]; // [{id: "fire-potency-1", level: 3}, ...]
}

interface WorldstoneState {
  discovered: boolean;
  powered: boolean;
  arcanaDeposited: number;
}
```

### Land 1: Horizon Steppe Structure

**Total Wards:** TBD (Sirocco at final ward of Land 1)

**Structure:**
- **Linear Path**: Ward 1 → Ward 2 → Ward 3 → ... → Ward N (Sirocco)
- **Branching Example**: Ward X has alternate path to mine (Ward XC)
- **World Boss**: Sirocco blocks final ward, unlocks Worldstone alternate path
- **Worldstone**: Alternate path after Sirocco defeat, backtrack to continue (optional for progression)

**Boss Distribution:**
- Boss waves: Every ward (1, 2, 3, ..., N)
- Large enemies: Every 10 wards (10, 20, 30 if Land 1 has 30+ wards)
- World boss: Sirocco at Ward N (final ward)

**Demo Scope:**
- Defeat Sirocco (permanent, one-time) ✓ Required
- Discover Worldstone (optional) ✓ Recommended
- Discover first mine (optional) ✓ Recommended
- Demonstrate branching path system ✓ Required
- Result: All core systems introduced, player ready for Land 2

---

## Economy System

### Currency Types

#### Arcana (Run Currency)
- **Acquisition**: Defeat enemies during journey
- **Storage**: Arcana Pendant (limited capacity)
- **Starting Capacity**: TBD (e.g., 1000 Arcana)
- **Capacity Upgrades**: Arcana Bank deposits increase max capacity
- **Return Tax**: 25% deducted EVERY return to Draconia (barrier upkeep)
- **Tax vs Deposited**: Tax does NOT count as deposited; only voluntary deposits beyond tax increase capacity
- **Reset**: Does not reset; accumulates across journeys (but spent on various uses)

**Arcana Flow:**
```
Journey → Gain Arcana → Fill Pendant to Max Capacity
    ↓
Return to Draconia → 25% Tax (barrier) → Remaining Arcana available
    ↓
Deposit at Arcana Bank (optional) → Increases Max Capacity
    ↓
Repeat: Journey → Gain → Tax → Deposit → Increase Capacity
```

**Capacity Upgrade Thresholds (Example):**
| Deposits (Total) | Max Capacity | Increase |
|------------------|--------------|----------|
| 0 Arcana | 1000 | Base |
| 5,000 Arcana | 1,250 | +25% |
| 15,000 Arcana | 1,625 | +62.5% |
| 40,000 Arcana | 2,250 | +125% |
| 100,000 Arcana | 3,250 | +225% |

*(Formula: TBD - likely exponential or logarithmic scaling)*

#### Gold (City Council Currency)
- **Acquisition**: Sell Silver/Nickel items obtained during journey
- **Purpose**: Fund City Council projects (building unlocks)
- **Lore**: Dragons eating gold as last-resort food during shortage; Silver/Nickel more nutritious
- **Uses**:
  - Aethervault unlock (one-time cost)
  - Librarium unlock (one-time cost)
  - Rune Forge unlock (one-time cost) + maintenance every X uses
  - Mining Guild unlock (one-time cost)
  - Fast Travel system unlock (one-time cost)
  - Hire researchers (Scroll Researchers, Librarium Researchers)
  - Ongoing maintenance costs

**Gold Costs (Example):**
| Building/Service | Unlock Cost | Maintenance/Usage |
|------------------|-------------|-------------------|
| Aethervault | 500 Gold | N/A |
| Librarium | 1,000 Gold | 100 Gold per researcher hired |
| Rune Forge | 1,500 Gold | 50 Gold every 10 uses |
| Mining Guild | 800 Gold | N/A |
| Fast Travel | 2,000 Gold | 20 Arcana per use (Tier 1) |
| Scroll Researcher | 200 Gold | Funds X scrolls (e.g., 5) |

#### Soul Power (Permanent Progression Currency)
- **Unlock Condition**: Ward 3 Scroll discovery → Aethervault decryption
- **Acquisition**: Defeat enemies (after unlock), Scroll Rune added to pendant
- **Accumulation Rate**: TBD per enemy (e.g., 1-5 Soul Power per common enemy, 50-100 per boss wave)
- **Purpose**: Craft permanent upgrades at Rune Forge
- **Does NOT Reset**: Permanent currency, persists across all journeys

**Soul Power Usage:**
- Rune Forge permanent upgrades (one-time Soul Power cost per upgrade)
- Higher-tier upgrades require more Soul Power (exponential scaling)
- Example: Fire Potency Tier 1 = 500 Soul Power, Tier 2 = 1,500 Soul Power, Tier 3 = 4,500 Soul Power

**Soul Power Flow:**
```
Pre-Ward 3: No Soul Power system (locked)
    ↓
Ward 3 Boss: Obtain First Scroll (100% drop, one-time)
    ↓
Return to Draconia → Aethervault → Elder deciphers Scroll
    ↓
Soul Power Unlocked: Pendant now gathers Soul Power from enemies
    ↓
Journey → Gain Soul Power → Accumulate (never resets)
    ↓
Rune Forge: Spend Soul Power → Craft Permanent Upgrades → Wait (IRL time)
    ↓
Collect Rune → Permanent stat increase → Continue journey stronger
```

### Item System

#### Common Items
- **Drop Source**: Defeat enemies (low % chance)
- **Guaranteed Drops**: Ward 1 milestones (5, 15, 50 enemies defeated)
- **Types**: Silver items, Nickel items (future: Meat, rare resources)
- **Purpose**: Sell for Gold at Draconia

**Item Value (Example):**
| Item Type | Gold Value | Drop Rate |
|-----------|------------|-----------|
| Silver Coin | 10 Gold | 5% per enemy |
| Silver Bar | 50 Gold | 1% per enemy |
| Nickel Coin | 15 Gold | 4% per enemy |
| Nickel Ingot | 75 Gold | 0.5% per enemy |
| Meat (future) | 100 Gold | 0.1% per boss |

**Lore:**
- **Food Shortage**: Draconia under siege, meat scarce
- **Metal as Food**: Dragons can consume metals (not ideal, but sustaining)
- **Nutritional Hierarchy**: Meat > Nickel > Silver > Gold
- **Gold Last Resort**: Gold least nutritious, but abundant in city reserves

#### Scrolls
- **Drop Source**: Defeat enemies (small % chance)
- **Guaranteed Locations**: Ward 2, Ward 5 (+ Ward 3 boss for FIRST SCROLL)
- **First Scroll**: Ward 3 boss wave (100% drop, one-time only)
- **Purpose**: Decipher at Aethervault to unlock research, lore, permanent systems
- **Drop Rate**: TBD (e.g., 0.5% per common enemy, 5% per boss wave)

**Scroll Usage:**
- Take Scroll to Aethervault
- Elder/Scroll Researcher deciphers (requires hiring researcher with Gold)
- Decryption takes IRL time (e.g., 2-5 minutes)
- Unlock: Research topic, lore entry, permanent system (Soul Power via First Scroll)

**Scroll Researcher System:**
- Hire with Gold: 200 Gold per researcher
- Each researcher funded for X scrolls (e.g., 5 scrolls)
- Decryption queue: One at a time unless multiple researchers hired
- Elder deciphers First Scroll instantly (uses personal Arcana, special narrative)

#### Cartography Pages
- **Drop Source**: Rare drops during journey (very low % chance)
- **Purpose**: Reveal mine locations when multiple pages of same land collected
- **Mechanic**: Collect 3+ Cartography Pages (Horizon Steppe) → Mine location revealed
- **Drop Rate**: TBD (e.g., 0.1% per common enemy, 1% per boss wave)
- **Usage**: Take to Mining Guild → Cartographer explains → Alternate path to mine unlocked

**Mine Discovery Flow:**
```
Find Cartography Page 1 (Horizon Steppe) → Notification
    ↓
Find Cartography Page 2 → Progress shown (2/3)
    ↓
Find Cartography Page 3 → Mine location revealed
    ↓
Visit Mining Guild (Gold unlock) → Cartographer marks path
    ↓
Journey: Branch to alternate path (Ward XC) → Mine Guardian boss
    ↓
Defeat Guardian → Enter mine → Clicker minigame (manual gold mining)
    ↓
Backtrack through Ward XC to continue main journey
    ↓
(Post-Worldstone: Mining automation unlocked)
```

---

## Building System

### City Council (Central Hub)

**Purpose:** Central funding system for all building unlocks and city projects

**Mechanic:**
- Player visits City Council building in Draconia
- UI shows list of available projects with Gold costs
- Fund project with Gold → Building unlocked, button revealed in Draconia UI
- Some buildings have maintenance costs (Rune Forge)

**Projects List (Example):**
| Project | Gold Cost | Unlock Trigger | Maintenance |
|---------|-----------|----------------|-------------|
| Aethervault | 500 Gold | Post-Ward 3 Scroll | None |
| Librarium | 1,000 Gold | Post-Soul Power unlock | 100 Gold per researcher |
| Rune Forge | 1,500 Gold | Post-Librarium research | 50 Gold every 10 uses |
| Mining Guild | 800 Gold | First Cartography Page | None |
| Fast Travel | 2,000 Gold | Post-Ward 10 (TBD) | 20 Arcana per use |

**UI:**
- Project name, description, Gold cost
- Lock/unlock status (some projects locked until prerequisites met)
- Progress bar if project has stages
- "Fund Project" button (if player has enough Gold)

### Arcana Bank

**Unlock:** Tutorial (Ward 1 first return, guided)

**Purpose:** Deposit Arcana to increase pendant's max capacity

**Mechanic:**
- Player deposits Arcana (voluntary, beyond 25% tax)
- Deposits tracked cumulatively
- Thresholds reached → "Spark of First Flame" reward → Max Arcana increases
- UI shows: Current capacity, next threshold, progress bar

**Reward Narrative:**
- "The soul of Draconia recognizes your contribution to the barrier"
- "A spark of the first flame enhances your pendant's capacity"
- Lore: Barrier powered by Arcana, city grateful for support

**Deposit Flow:**
```
Return to Draconia → 25% tax deducted → Remaining Arcana shown
    ↓
Visit Arcana Bank → See current capacity (e.g., 1000)
    ↓
Deposit X Arcana (e.g., 500) → Total deposited: 5,500
    ↓
Threshold reached (5,000) → "Spark of First Flame" animation
    ↓
Max capacity increased: 1000 → 1,250 (+25%)
    ↓
Notification: "Your pendant can now hold 1,250 Arcana"
```

### Aethervault

**Unlock:** City Council (500 Gold), triggered by Ward 3 Scroll acquisition

**NPCs:**
- **Elder**: Primary researcher, deciphers First Scroll instantly (uses personal Arcana)
- **Assistant**: Passive research, provides hints on Scroll locations (Ward 2, Ward 5)

**Purpose:**
- Decipher Scrolls to unlock research, lore, permanent systems
- Soul Power introduction (First Scroll from Ward 3 boss)
- Ongoing Scroll decryption system

**Scroll Researcher System:**
- Hire with Gold: 200 Gold per researcher (funds X scrolls, e.g., 5)
- Decryption queue: One Scroll at a time per researcher
- Multiple researchers: Parallel decryption
- Decryption time: 2-5 minutes IRL time per Scroll

**First Scroll Special:**
- Ward 3 boss drops First Scroll (100%, one-time)
- Player returns to Draconia, automatically directed to Aethervault
- Elder: "This is significant... let me research it" (uses personal Arcana)
- Instant decryption (narrative moment, no wait time)
- Reveal: Soul Power secrets, Scroll Rune added to pendant
- Elder explains: "Forbidden magic, but justified by circumstances"

**Ongoing Scrolls:**
- Assistant: "I've been researching... Scrolls can be found in Ward 2 and Ward 5"
- Shows drop rates: "Small chance from any enemy, guaranteed in certain wards"
- Hire Scroll Researchers to decipher more efficiently

### Librarium

**Unlock:** City Council (1,000 Gold), triggered post-Soul Power unlock

**Purpose:** Research how to USE Soul Power for permanent upgrades

**Mechanic:**
- One researcher at start (can hire more with Gold: 100 Gold per researcher)
- Research topics: "Soul Power Permanent Enchantment" (first), future topics TBD
- Research takes IRL time (e.g., 5 minutes for first topic)
- Completion: Unlocks knowledge to craft upgrades at Rune Forge

**First Research Flow:**
```
Visit Librarium → One researcher available → One topic visible
    ↓
Topic: "Soul Power Permanent Enchantment" (5 minutes)
    ↓
Start Research → Timer begins → Player can continue journey
    ↓
Return after 5 minutes → Research complete notification
    ↓
Researcher: "I've discovered how to infuse Runes with Soul Power!"
    ↓
Tutorial: "Visit City Council to fund the Rune Forge"
```

**Additional Researchers:**
- Hire with Gold: 100 Gold per researcher
- Each researcher: One research topic at a time
- Multiple researchers: Parallel research on different topics
- Research topics expand as game progresses (future: new abilities, tech trees)

### Rune Forge

**Unlock:** City Council (1,500 Gold), triggered post-Librarium research

**Purpose:** Craft permanent upgrades using Soul Power

**Mechanic:**
- Select upgrade from available list (research unlocks new upgrades)
- Spend Soul Power (one-time cost per upgrade)
- Crafting takes IRL time (e.g., 3 minutes per rune)
- One rune at a time (unless more forgers hired: Gold + resources)
- Collect forged rune → permanent stat increase applied immediately

**Upgrade Examples:**
| Upgrade | Soul Power Cost | Craft Time | Effect |
|---------|----------------|------------|--------|
| Fire Potency Tier 1 | 500 SP | 3 minutes | +10% fire damage |
| Draconic Vitality Tier 1 | 500 SP | 3 minutes | +15% max health |
| Arcane Resonance Tier 1 | 750 SP | 4 minutes | +5% Arcana gain |
| Fire Potency Tier 2 | 1,500 SP | 5 minutes | +20% fire damage (cumulative) |

**Maintenance:**
- Rune Forge requires Gold every X uses (e.g., 50 Gold every 10 rune crafts)
- UI shows: "Forge maintenance due in X uses"
- If not paid: Forge temporarily unavailable until paid

**Forger Hiring:**
- Hire additional forgers with Gold + resources (e.g., 500 Gold + 10 Nickel Ingots)
- Each forger: One rune at a time
- Multiple forgers: Parallel crafting (e.g., 3 forgers = 3 runes simultaneously)

**Crafting Flow:**
```
Visit Rune Forge → See available upgrades → Select "Fire Potency Tier 1"
    ↓
Cost: 500 Soul Power (have 750 SP) → Confirm
    ↓
Crafting begins → Timer: 3 minutes → Player can continue journey
    ↓
Return after 3 minutes → Notification: "Rune forged and ready!"
    ↓
Collect Rune → "Fire Potency Tier 1 applied" → +10% fire damage (permanent)
    ↓
Forge usage: 1/10 (next maintenance at 10 uses, costs 50 Gold)
```

### Mining Guild

**Unlock:** City Council (800 Gold), triggered by first Cartography Page discovery

**NPC:** Cartographer (explains mine system, marks alternate paths)

**Purpose:** Decipher Cartography Pages to reveal mine locations

**Mechanic:**
- Collect Cartography Pages (rare drops)
- Multiple pages of same land (e.g., 3 Horizon Steppe pages) → Mine location revealed
- Cartographer marks alternate path to mine on journey map
- Player travels alternate path → Mine Guardian boss → Clicker minigame

**Mine Discovery Flow:**
```
Find Cartography Page 1 → Notification: "Strange map fragment..."
    ↓
Visit Mining Guild (if unlocked) or get prompt to unlock
    ↓
Cartographer: "This is a Cartography Page! Collect more to reveal mine locations."
    ↓
Find Page 2 → Cartographer: "Progress: 2/3 Horizon Steppe pages"
    ↓
Find Page 3 → Mine location revealed: "Ward 11C alternate path"
    ↓
Journey to Ward 11 → Branch choice: 11A (main) or 11B (toward mine)
    ↓
11B → 11C (dead end) → Mine Guardian boss fight
    ↓
Defeat Guardian → Enter mine → Clicker minigame (manual gold mining)
    ↓
Exit mine → Backtrack through 11C → 11B → rejoin main path at Ward 12
```

**Clicker Minigame:**
- Manual gold mining (click to mine, gather gold directly)
- Time-limited or resource-limited (TBD)
- Post-Worldstone: Mining automation unlocked (convoys, stewards)
- Mine becomes passive gold income source

**Lore:**
- Mines abandoned when Unmaking spread, guardians corrupted
- Ancient gold veins still rich, valuable for city funding
- Mining automation: Requires Worldstone protection (non-pendant wearers can work safely)

---

## Combat System

*(This section will pull heavily from v2.3 Combat Systems document, with clarifications for v2.4 boss mechanics)*

### Enemy Types

1. **Common Enemies**:
   - Spawn continuously during ward traversal
   - Drop Arcana (guaranteed), items (low % chance), Soul Power (post-unlock)
   - Variety: Melee, ranged, flying, ground
   - Scaling: Stats increase with ward number

2. **Boss Wave Enemies**:
   - Spawn at end of every ward (multiple enemies simultaneously)
   - Higher stats than common enemies
   - Encounter: Single per journey (stay defeated if player rewinds)
   - Reward: Arcana fills to max, guaranteed item drops, Soul Power (post-unlock)

3. **Large Enemies**:
   - Spawn every 10 wards (single tough unnamed enemy)
   - Very high stats, special mechanics
   - Encounter: Single per journey (respawn on new journey)
   - Reward: Large Arcana/Soul Power bonus, rare item drops

4. **World Bosses**:
   - Named, unique (Sirocco at Land 1 end)
   - ONE TIME ONLY encounter (permanent defeat, never respawns)
   - Special mechanics, phases, patterns
   - Reward: Worldstone path unlock, major story progression, unique items/upgrades

### Boss Wave Mechanics

**Warning System:**
- Player approaches end of ward
- UI: "A strong enemy force is gathering ahead..."
- Progression pauses (scrolling continues, but player doesn't advance to next ward)
- Countdown or preparation phase (TBD - 5 seconds warning?)

**Spawn:**
- Multiple enemies spawn simultaneously (number scales with ward difficulty)
- Example: Ward 1 = 3 enemies, Ward 5 = 5 enemies, Ward 10 = 8 enemies
- Mix of enemy types (melee + ranged, ground + flying)

**Defeat:**
- All boss wave enemies must be defeated to proceed
- Arcana bar fills to maximum capacity (encourages return)
- Guaranteed item drops (1-3 items depending on ward number)
- Ward completion checkpoint created (fast travel)

**Rewind Behavior:**
- If player defeats Ward 5 boss wave, progresses to Ward 8, then rewinds to Ward 5
- Ward 5 boss wave stays defeated (no re-fight required)
- This state persists for the current journey only
- New journey: All ward boss waves reset

### World Boss: Sirocco (Land 1)

**Location:** Final ward of Land 1 (Horizon Steppe)

**Encounter:**
- ONE TIME ONLY, PERMANENT defeat
- Player reaches final ward → Warning: "The Khagan of the Sirocco blocks your path"
- Epic boss fight with phases, special mechanics (TBD from v2.3 specifications)

**Defeat:**
- Worldstone alternate path unlocked (Ward N+1A)
- Major lore revelation
- Unique reward (Soul Power boost, special item, etc.)
- Land 1 completion milestone

**Post-Defeat:**
- Sirocco NEVER respawns (even on new journeys)
- Path to Worldstone always available after defeat
- Player can continue to Land 2 (future content) or explore Worldstone

**Narrative Significance:**
- Sirocco: Corrupted by Unmaking, blocks access to Worldstone
- Defeat: First major victory against Unmaking
- Worldstone: Ancient protection device, hope for saving world
- Elder: "Powering Worldstones is how we'll push back the Unmaking"

### Player Combat Mechanics

*(To be pulled from v2.3 Combat Systems, adapted for v2.4 flow)*

**Abilities:**
- Firecraft: Fire-based attacks (primary damage source early game)
- Safety: Defensive abilities (shields, healing)
- Scales: Draconic transformation abilities (future unlock)

**Manual Contribution:**
- ~20% ±10% of total damage from player abilities
- Rest: Automated systems (research upgrades, permanent upgrades, passive bonuses)

**Progression:**
- Pre-Rift combat power: ≥70% from research, ≤30% from town/meta (City ≤10%)
- Research: Librarium + tech trees (Firecraft, Safety, Scales)
- Town/Meta: Rune Forge permanent upgrades

*(Detailed ability specifications, damage formulas, enemy stat tables to be pulled from v2.3 tome/05_Combat_Systems_Enemies_Bosses.md)*

---

## Tutorial Sequence

### Complete 15-Step Tutorial Flow

#### Step 1: Cutscene → Journey Begins
**Narrative:**
- Opening cutscene: Draconia under siege, Unmaking spreading, barrier holding
- Elder: "The Arcana Pendant will protect you and gather power from defeated enemies"
- Assistant: "Be careful out there... the world beyond the barrier is dangerous"

**UI State:**
- No Soul Power display (system not unlocked yet)
- No Return to Draconia button (gated until Ward 1 completion)
- Arcana Bar visible, empty
- Gold visible, zero

**Gameplay:**
- Player starts journey automatically
- First enemies spawn (tutorial: movement, basic attack)
- Arcana gained visibly fills Arcana Bar

---

#### Step 2: Ward 1 - First Enemies
**Tutorial Messages:**
- "Defeat enemies to gain Arcana"
- "Arcana fills your pendant - you can hold [1000] Arcana"
- "Enemies may drop items - collect them!"

**Guaranteed Drops:**
- 5 enemies defeated: 1 Silver Coin (guaranteed)
- 15 enemies defeated: 1 Nickel Coin (guaranteed)
- 50 enemies defeated: 1 Silver Bar (guaranteed)

**Progression:**
- Player continues through Ward 1 defeating enemies
- Arcana Bar gradually fills
- Items collected, visible in inventory

---

#### Step 3: Ward 1 Boss Wave
**Warning:**
- UI: "A strong enemy force is gathering at the end of this ward!"
- Progression pauses, scrolling continues
- 5-second countdown (optional)

**Boss Wave:**
- 3 enemies spawn simultaneously (Ward 1 boss wave)
- Tougher than common enemies
- Defeat all 3 → Boss wave complete

**Reward:**
- Arcana Bar fills to maximum capacity
- Guaranteed item drop: 1 Nickel Ingot
- Tutorial message: "Your pendant is full! Return to Draconia to deposit Arcana."

**UI Change:**
- **Return to Draconia button revealed** (major unlock)
- Button glows/pulses to draw attention

---

#### Step 4: First Return to Draconia
**Guidance:**
- Tutorial: "Click Return to Draconia to go back to safety"
- Transition: Journey → Draconia (loading screen or animation)

**25% Tax Introduction:**
- NPC (Elder or Guard): "The barrier requires 25% of your Arcana to maintain protection"
- Math shown: 1000 Arcana → 250 Arcana to barrier → 750 Arcana remaining
- Tutorial: "This tax is required every time you return to Draconia"

**Food Shortage Lore:**
- Elder: "We have a food shortage... dragons are eating gold as a last resort"
- "If you find Silver or Nickel items, they're more nutritious and valuable"
- "You can sell these items for Gold at the Market"

**Market Visit (Optional):**
- Tutorial prompts player to visit Market (if items in inventory)
- Sell Silver Coin, Nickel Coin, Silver Bar, Nickel Ingot → Gain Gold
- Example: 10 + 15 + 50 + 75 = 150 Gold total

---

#### Step 5: Arcana Bank Introduction (Guided)
**Guidance:**
- Tutorial: "Visit the Arcana Bank to deposit your Arcana"
- Assistant: "Depositing Arcana helps power the barrier and rewards your contribution"

**Arcana Bank UI:**
- Current capacity: 1000 Arcana
- Current Arcana: 750 (after tax)
- Deposit slider: Choose amount to deposit (e.g., deposit 500, keep 250 for other uses)

**First Deposit:**
- Player deposits (e.g., 500 Arcana)
- Total deposited: 500 Arcana (tracked cumulatively)
- Tutorial: "Depositing Arcana will increase your pendant's capacity at certain thresholds"
- Next threshold: 5,000 Arcana deposited → +25% capacity

**Reward Animation:**
- "The soul of Draconia recognizes your contribution"
- (Future: If threshold reached, "Spark of First Flame" animation → capacity increases)

**End Tutorial Phase 1:**
- Player now understands: Journey, Arcana, tax, Arcana Bank, Gold economy basics
- Ready for Ward 2-3 exploration

---

#### Step 6: Ward 2-3 Journey
**Gameplay:**
- Player continues journey through Ward 2 and Ward 3
- Continue defeating enemies, gaining Arcana, collecting items
- Small chance for Scroll drops (not guaranteed yet, foreshadowing)

**Item Collection:**
- More Silver/Nickel items drop (sell for Gold on next return)
- Goal: Build up resources for City Council projects

**Arcana Management:**
- Arcana Bar fills again
- Player can choose when to return (not forced)
- But: Ward 3 boss wave will fill Arcana to max, encouraging return

---

#### Step 7: Ward 3 Boss Wave - FIRST SCROLL
**Boss Wave:**
- End of Ward 3: Boss wave (5 enemies)
- Defeat all → Boss wave complete

**Special Drop:**
- **FIRST SCROLL** (100% guaranteed, one-time only)
- Animation: Scroll drops, glows, special sound
- Tutorial: "You've found an ancient Scroll! This is significant..."

**Reward:**
- Arcana Bar fills to maximum capacity
- Additional item drops (Silver/Nickel)

**Forced Return:**
- Tutorial: "Return to Draconia immediately to decipher this Scroll at the Aethervault"
- Return button pulses/glows

---

#### Step 8: Second Return - Aethervault Introduction
**Return:**
- 25% tax deducted again (player familiar with this now)
- Remaining Arcana available

**Automatic Guidance:**
- Tutorial: "The Scroll must be taken to the Aethervault"
- Elder: "I've heard of these ancient Scrolls... let me research it"

**City Council Prerequisite:**
- If Aethervault not unlocked: "The Aethervault requires City Council funding"
- Player visits City Council, sees project: "Aethervault - 500 Gold"
- If not enough Gold: Player must sell items or return to journey for more items
- Once 500 Gold: Fund project → Aethervault unlocked

**Aethervault Cutscene:**
- Elder takes Scroll: "This is the Soul Power Scroll... forbidden knowledge"
- Elder uses personal Arcana to decipher instantly (special narrative moment)
- Revelation: "Soul Power - the ability to strengthen yourself permanently using souls"
- Elder adds Scroll Rune to player's pendant (animation)
- "Your pendant can now gather Soul Power from defeated enemies"

**UI Change:**
- **Soul Power display now visible** (was hidden until now)
- Soul Power: 0 (will accumulate from now on)

**Lore Explanation:**
- Elder: "Soul Power was forbidden because it uses souls from defeated enemies"
- "But given the circumstances and the abundance of evil, this is justified"
- "However, you'll need knowledge to USE this power for permanent upgrades"
- "The Librarium can research how to craft Soul Power into Runes"

---

#### Step 9: City Council - Fund Librarium
**Guidance:**
- Tutorial: "Visit the City Council to fund the Librarium project"

**City Council UI:**
- Projects visible:
  - ✓ Aethervault (funded)
  - Librarium - 1,000 Gold (currently needed)
  - Rune Forge - 1,500 Gold (locked until Librarium research)
  - Mining Guild - 800 Gold (locked until first Cartography Page)
  - Fast Travel - 2,000 Gold (locked until Ward 10+)

**Funding:**
- If not enough Gold: Player must journey again, collect more items, sell for Gold
- Once 1,000 Gold: Fund Librarium → Building unlocked

**Librarium Button:**
- Librarium building button appears in Draconia UI

---

#### Step 10: Librarium Research
**Visit Librarium:**
- One researcher available
- One research topic visible: "Soul Power Permanent Enchantment"
- Research time: 5 minutes (IRL time)

**Start Research:**
- Tutorial: "This research will unlock the ability to craft permanent upgrades"
- Player starts research, timer begins
- Player can continue journey while research progresses (multitasking)

**Research Complete:**
- Notification after 5 minutes: "Research complete! Return to the Librarium."
- Researcher: "I've discovered how to infuse Runes with Soul Power!"
- "You'll need the Rune Forge to craft these upgrades"

---

#### Step 11: City Council - Fund Rune Forge
**Guidance:**
- Tutorial: "Visit the City Council to fund the Rune Forge project"

**City Council UI:**
- Rune Forge project now unlocked (research prerequisite met)
- Cost: 1,500 Gold

**Funding:**
- If not enough Gold: Player journeys again, collects items, sells for Gold
- Once 1,500 Gold: Fund Rune Forge → Building unlocked

**Rune Forge Button:**
- Rune Forge building button appears in Draconia UI

---

#### Step 12: Rune Forge Usage
**Visit Rune Forge:**
- Available upgrades visible (unlocked by Librarium research)
- Example: Fire Potency Tier 1 (500 Soul Power), Draconic Vitality Tier 1 (500 Soul Power)

**Check Soul Power:**
- By now, player has accumulated Soul Power from enemies defeated post-Ward 3
- Example: 750 Soul Power (enough for one upgrade)

**Craft Upgrade:**
- Select "Fire Potency Tier 1"
- Cost: 500 Soul Power → Confirm
- Crafting begins: 3 minutes (IRL time)
- Tutorial: "Rune crafting takes time. You can continue your journey and return to collect it."

**Crafting Complete:**
- Notification after 3 minutes: "Rune forged! Collect it at the Rune Forge."
- Collect Rune → "Fire Potency Tier 1 applied" → +10% fire damage (permanent)

**Maintenance Notice:**
- UI: "Forge usage: 1/10 (maintenance due at 10 uses, costs 50 Gold)"

**Tutorial Summary:**
- "You now understand how to permanently strengthen yourself!"
- "Gain Soul Power from enemies → Craft Runes at Rune Forge → Permanent upgrades"

---

#### Step 13: Ongoing Systems - Scrolls
**Scroll System Introduction:**
- Assistant: "I've been researching Scroll locations passively"
- "Scrolls have a small chance to drop from any enemy"
- "I've found that Ward 2 and Ward 5 have guaranteed Scroll locations"
- Drop rate shown: ~0.5% per enemy, 5% per boss wave, 100% at Ward 2/5 (specific enemies or chests)

**Scroll Researcher Hiring:**
- Tutorial: "Hire Scroll Researchers at the Aethervault to decipher Scrolls efficiently"
- Cost: 200 Gold per researcher (funds 5 Scrolls)
- Decryption time: 2-5 minutes per Scroll

**Future Scrolls:**
- Unlock new research topics (Librarium)
- Unlock new abilities (Firecraft, Safety, Scales tech tree nodes)
- Lore entries (world-building)

---

#### Step 14: Ongoing Systems - Cartography Pages & Mining Guild
**First Cartography Page:**
- Player defeats enemies, rare drop: "Cartography Page (Horizon Steppe)"
- Tutorial: "This map fragment might reveal hidden locations"

**Mining Guild Unlock:**
- Tutorial: "Visit the City Council to fund the Mining Guild"
- Cost: 800 Gold → Fund project → Mining Guild unlocked

**Visit Mining Guild:**
- Cartographer: "Cartography Pages reveal mine locations!"
- "Collect 3 pages of the same land to reveal a mine"

**Mine Discovery:**
- Find 2 more pages → Mine location revealed: "Ward 11C alternate path"
- Journey to Ward 11 → Branch choice: 11A (main) or 11B (toward mine)
- Follow 11B → 11C → Mine Guardian boss
- Defeat Guardian → Clicker minigame (manual gold mining)
- Backtrack through 11C → 11B → Continue journey

**Post-Worldstone Note:**
- Tutorial: "Mining automation will be unlocked after powering the Worldstone"

---

#### Step 15: Land 1 Progress - Sirocco & Worldstone
**Journey Through Land 1:**
- Player continues through wards, defeating boss waves, collecting resources
- Branching paths become available (demonstration of Ward##A, Ward##B system)
- Fast Travel system unlocked (City Council project, 2,000 Gold)

**Final Ward - Sirocco:**
- Warning: "The Khagan of the Sirocco blocks your path to the Worldstone"
- Epic boss fight (phases, special mechanics)
- ONE TIME ONLY encounter

**Defeat Sirocco:**
- Victory animation, major lore revelation
- Elder: "The path to the Worldstone is now open!"
- Worldstone alternate path unlocked (Ward N+1A)

**Discover Worldstone:**
- Optional: Player travels to Worldstone path (dead end)
- Find Worldstone: Ancient stone pillar, inert
- Elder: "Powering Worldstones with Arcana creates protection against the Unmaking"
- Optional: Power Worldstone (Arcana deposit) → Protection layer activated

**Land 1 Complete:**
- Tutorial: "You've completed the introduction to Draconia Chronicles!"
- "All core systems unlocked: Arcana, Gold, Soul Power, Buildings, Branching Paths"
- "Continue to Land 2 or explore more of the Horizon Steppe"

**MVP/Demo Complete:**
- Player has experienced full game loop
- All systems introduced and functional
- Ready for expanded content (Land 2+, endgame systems)

---

## MVP/Demo Scope

### Completion Criteria

**Required:**
- ✓ Defeat Sirocco (Land 1 world boss, permanent)
- ✓ Complete 15-step tutorial sequence
- ✓ All core systems introduced and functional:
  - Arcana Pendant (capacity, tax, Arcana Bank deposits)
  - Gold economy (Silver/Nickel items, City Council projects)
  - Soul Power (unlock, accumulation, Rune Forge usage)
  - Buildings (Arcana Bank, Aethervault, Librarium, Rune Forge)
  - Boss waves (every ward), Large enemies (every 10 wards), World boss (Sirocco)
  - Branching paths (demonstrate Ward##A, Ward##B choices)
  - State persistence (journey vs permanent boss defeats)

**Recommended (Optional for MVP):**
- ◯ Discover Worldstone (alternate path exploration)
- ◯ Power Worldstone (Arcana deposit, protection layer demonstration)
- ◯ Discover first mine (Cartography Pages, Mining Guild, clicker minigame)
- ◯ Unlock fast travel (City Council project, demonstrate convenience system)

**Result:**
- **First story beat complete**: Sirocco defeated, Worldstone discovered, Horizon Steppe secured
- **Player ready for Land 2**: All systems understood, permanent upgrades started, progression path clear
- **Demo playable end-to-end**: ~30-60 minutes of gameplay (TBD based on pacing)

### Out of Scope for MVP

**Future Content (Post-MVP):**
- Land 2+ regions (new biomes, enemies, bosses)
- Advanced tech trees (Scales, higher-tier Firecraft/Safety)
- Endgame systems (Rift, NG+, prestige mechanics)
- Automation (convoys, stewards, passive resource generation)
- PvP or multiplayer (if applicable)
- Extensive modding support

**Deferred Systems:**
- Mining automation (requires Worldstone, post-Land 1)
- Advanced fast travel tiers (Tier 2, Tier 3 upgrades)
- Additional buildings (future City Council projects)
- Complex branching narratives (Land 2+ story branches)

---

## Design Philosophy

### Core Principles

1. **Journey-First Design**
   - Player can always progress forward (except boss waves)
   - Return to Draconia is optional (after Ward 1)
   - Progression never "stuck" due to resource shortage

2. **Optional Engagement**
   - Systems (Librarium, Rune Forge, Mining Guild) not required to progress
   - But: Difficulty increases significantly without engagement
   - Design expectation: Players will engage to overcome difficulty
   - Player choice: Hardcore challenge (skip systems) vs balanced progression (engage systems)

3. **Inconvenience First, Convenience as Reward**
   - Manual backtracking initially (through alternate paths, mines)
   - Fast travel unlocked through City Council (Gold sink)
   - Convenience at a price: Arcana/Gold cost per use
   - Creates value for progression systems

4. **Progressive Discovery**
   - Features unlock through structured 15-step tutorial
   - Not all systems available at start (overwhelming)
   - Soul Power gated until Ward 3 (major unlock moment)
   - Branching paths introduced gradually

5. **Meaningful Choices**
   - Branching paths: Ward##A vs Ward##B choices
   - Resource allocation: Arcana Bank deposits vs immediate usage
   - Gold spending: Which City Council project to fund first
   - Upgrade priorities: Which permanent upgrades to craft first

6. **Respectful of Player Time**
   - IRL time gates short (2-5 minutes for research/crafting)
   - Fast travel reduces tedious backtracking (once unlocked)
   - Can multitask: Start research, continue journey, return to collect
   - No excessive grinding required for progression

7. **Lore-Driven Mechanics**
   - Barrier tax: Justified by barrier upkeep lore
   - Soul Power: Forbidden magic, justified by circumstances
   - Gold as food: Food shortage, metal consumption lore
   - Worldstone: Ancient protection against Unmaking

### Player Psychology

**Goals:**
- **Clear short-term goals**: Defeat next boss wave, reach next ward
- **Clear medium-term goals**: Unlock Librarium, craft first permanent upgrade
- **Clear long-term goals**: Defeat Sirocco, discover Worldstone, complete Land 1

**Progression Feel:**
- **Constant progress**: Arcana always accumulating, wards always advancing
- **Major unlocks**: Soul Power (Ward 3), Rune Forge, Fast Travel feel impactful
- **Permanent upgrades**: Rune Forge provides tangible power increases
- **Optional challenges**: Mines, branching paths provide variety

**Frustration Mitigation:**
- **No hard gates**: Can always move forward (except boss waves)
- **Fast travel**: Reduces tedious backtracking after unlock
- **Guaranteed drops**: Ward 1 milestones (5, 15, 50 enemies), Ward 3 Scroll
- **Clear costs**: Building unlocks, upgrade costs shown upfront

---

## Technical Requirements

### Performance Targets
- **Frame Rate**: 60 FPS desktop, ≥40 FPS mid-range phones
- **Entity Limits**: ≤200-400 enemies on screen, ≤600 projectiles/second
- **Memory**: <200 MB RAM usage (target for mobile compatibility)

### State Persistence Schema

**Journey State (Resets on New Journey):**
```typescript
interface JourneyState {
  journeyId: string; // UUID
  wardBossesDefeated: Map<string, boolean>; // "ward-4A-boss": true
  largeEnemiesDefeated: Map<number, boolean>; // 10: true, 20: false
  currentWard: string; // "ward-5B"
  visitedWards: string[]; // ["ward-1", "ward-2A", "ward-3", "ward-4A", "ward-5B"]
  branchChoices: Map<number, string>; // 4: "A", 11: "B"
  arcana: number; // Current Arcana in pendant
  items: ItemInventory; // Current item inventory
}
```

**Permanent State (Never Resets):**
```typescript
interface PermanentState {
  worldBosses: Map<string, boolean>; // "sirocco": true
  worldstones: Map<string, WorldstoneState>; // "horizonSteppe": {discovered: true, powered: false}
  fastTravelCheckpoints: Set<string>; // ["ward-1", "ward-5A", "ward-10"]
  discoveredPaths: Set<string>; // ["ward-11C-mine", "ward-22A-worldstone"]
  buildings: Set<string>; // ["arcanaBank", "aethervault", "librarium", "runeForge"]
  permanentUpgrades: UpgradeState[]; // [{id: "fire-potency-1", level: 3}, ...]
  soulPower: number; // Total Soul Power (never resets)
  gold: number; // Total Gold (never resets)
  arcanaDeposited: number; // Total Arcana deposited to Arcana Bank (cumulative)
  maxArcanaCapacity: number; // Current max Arcana capacity
  scrollsDeciphered: Set<string>; // ["scroll-soul-power", "scroll-ward-2", ...]
  cartographyPages: Map<string, number>; // "horizonSteppe": 3
  minesDiscovered: Set<string>; // ["horizonSteppe-mine-1"]
}

interface WorldstoneState {
  discovered: boolean;
  powered: boolean;
  arcanaDeposited: number;
}
```

### Database Integration
- **Dexie schema**: Extend existing schema for journey state and permanent state
- **Save frequency**: Auto-save every ward completion, return to Draconia, major event
- **Migration**: Version 2.4.0 schema migration from v2.3 (if applicable)

### UI Requirements
- **Arcana Bar**: Visual fill indicator, max capacity shown, tax deduction animation
- **Soul Power Display**: Locked (hidden) until Ward 3 unlock
- **Return Button**: Hidden until Ward 1 boss wave completion
- **City Council UI**: Project list, costs, lock/unlock status, progress bars
- **Building Buttons**: Dynamically appear after funding projects
- **Fast Travel Map**: Ward network visualization, checkpoints, current position

### Cross-References
- Detailed combat specifications: [v2.4 tome/05_Combat_System.md](./tome/05_Combat_System.md)
- Detailed economy formulas: [v2.4 tome/02_Economy_System.md](./tome/02_Economy_System.md)
- Detailed progression mechanics: [v2.4 tome/03_Progression_System.md](./tome/03_Progression_System.md)
- Detailed building specifications: [v2.4 tome/04_Building_System.md](./tome/04_Building_System.md)
- Path navigation details: [v2.4 tome/06_Path_Navigation_System.md](./tome/06_Path_Navigation_System.md)
- State persistence details: [v2.4 tome/07_State_Persistence.md](./tome/07_State_Persistence.md)
- Tutorial implementation: [v2.4 tome/01_Game_Flow_MVP.md](./tome/01_Game_Flow_MVP.md)

---

## Version History

- **v2.4.0** (2025-11-15): Complete redesign with branching progression, structured tutorial, MVP focus
- **v2.3.2** (2025-01-28): [Archived](../archive/v2.3/v2.3.2GDD.md) - Comprehensive specification superseded by v2.4.0
- **v2.3.0** (prior): Initial comprehensive specification

---

## Appendix: Key Differences from v2.3

For complete list of changes, see [ARCHIVAL_NOTES.md](../archive/v2.3/ARCHIVAL_NOTES.md)

**Critical Changes:**
1. Arcana tax: First return only → Every return (25%)
2. Soul Power: Available from start → Ward 3 Scroll unlock
3. Boss structure: Every 5 wards → Boss wave every ward + world boss every land
4. Progression: Linear → Branching paths (Ward##A, Ward##B, Ward##C)
5. Boss defeats: Not specified → Per-journey (ward bosses) vs permanent (world bosses)
6. Tutorial: Basic intro → 15-step structured sequence
7. Gold: QoL → City Council project funding
8. Buildings: Various unlocks → City Council centralized hub

---

*This document is the authoritative source for Draconia Chronicles v2.4.0 game design. For implementation details, refer to tome documents.*
