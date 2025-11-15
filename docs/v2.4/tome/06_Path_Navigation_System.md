# Path Navigation System - Draconia Chronicles v2.4.0

**Document:** 06_Path_Navigation_System.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Fast travel, backtracking, and path navigation mechanics

---

## Overview

The Path Navigation System enables players to traverse branching ward networks efficiently through manual traversal, backtracking, and unlockable fast travel.

**Core Features:**
- Manual ward-to-ward traversal (default)
- Backtracking through previously visited wards
- Fast travel system (unlockable convenience)
- Checkpoint-based navigation
- Path memory and history tracking

---

## Manual Traversal

### Ward-to-Ward Movement

**Default Navigation:**
- Linear progression: Ward 1 → Ward 2 → Ward 3
- Boss gates: Must defeat boss wave to proceed
- Auto-scrolling or player-controlled movement

**Branch Point Navigation:**
```
Ward 3 (end) → Branch Point UI appears
    ├─ Ward 4A (Main Path) - SELECT
    └─ Ward 4B (Alternate Path)
```

Player selects path → Journey continues on chosen path

### Backtracking Mechanics

**Manual Backtracking:**
- Travel backward through visited wards
- Use cases: Return to mines, explore missed paths, revisit areas
- Boss encounters: Defeated bosses stay defeated (per-journey)
- Common enemies: Respawn continuously

**Example:**
- Player at Ward 10 → Backtrack to Ward 5 (Ward 10 → 9 → 8 → 7 → 6 → 5)
- Ward 5-10 bosses already defeated: No re-fights
- Common enemies in each ward: Respawn and can be re-farmed

---

## Fast Travel System

### Unlock Requirements

**City Council Project:**
- Cost: 2,000 Gold
- Available: Ward 10+ (mid-game)
- One-time unlock (permanent)

### Checkpoint System

**Auto-Checkpoints:**
- Created: Each ward completion
- Named: "Ward 5 (Path A)", "Ward 10", "Ward 11C (Mine)"
- Persistent: Checkpoints never reset (permanent state)

**Checkpoint Data:**
```typescript
interface FastTravelCheckpoint {
  wardId: string; // "ward-5A"
  name: string; // Display name
  unlocked: boolean; // Visited = true
  branch: string | null; // "A", "B", "C" or null
}
```

### Usage Mechanics

**Cost:** 20 Arcana per use (Tier 1)

**Restrictions:**
- Cannot skip undefeated bosses (per-journey state)
- Cannot skip first visits to new wards
- Can only travel to unlocked checkpoints

**UI Flow:**
1. Open Fast Travel menu
2. View list of unlocked checkpoints
3. Select destination
4. Confirm cost (20 Arcana)
5. Instant teleport to selected ward

### Upgrade Tiers

| Tier | Cost | Unlock Requirement | Features |
|------|------|-------------------|----------|
| **Tier 1** | 2,000 Gold | Ward 10+ | Basic fast travel, 20 Arcana/use |
| **Tier 2** | 1,000 Gold + Rune Forge upgrade | Ward 20+ | Reduced cost (10 Arcana/use) |
| **Tier 3** | 2,000 Gold + 5,000 Soul Power | Ward 30+ | Bulk checkpoints, skip branches |

---

## Path Network Visualization

### Map UI

**Features:**
- Visual ward network (node graph)
- Current position highlighted
- Visited wards: Filled nodes
- Unvisited wards: Grayed out
- Branch points: Fork icons
- Boss defeated: Checkmark icon
- World boss: Special icon (skull if alive, golden if defeated)

**Example Visualization:**
```
[1]──[2]──[3]─┬─[4A]──[5A]─┐
              │            ├─[6]──[7]
              └─[4B]──[5B]─┘

      [11A]─┬─[12]
            └─[11B]──[11C (Mine)]

Current Position: [5A]
Defeated Bosses: [1, 2, 3, 4A]
```

### Path History Tracking

**Journey State:**
```typescript
journeyState.visitedWards = [
  "ward-1", "ward-2", "ward-3", "ward-4A", "ward-5A"
];

journeyState.branchChoices = {
  4: "A",  // Chose path A at ward 4
  11: "B"  // Chose path B at ward 11 (toward mine)
};
```

---

## Alternate Path Mechanics

### Dead End Paths

**Behavior:**
- Terminates at special location (mine, Worldstone, hidden area)
- Must backtrack to rejoin main path
- Rewards justify time investment

**Example: Mine Path**
```
Ward 11A (main) → Ward 12 (continues)
Ward 11B → Ward 11C (dead end: Mine)
           ↓
    Backtrack: 11C → 11B → 12 (rejoin main)
```

**Fast Travel Optimization:**
- If fast travel unlocked: Can teleport to Ward 11B → visit mine → teleport to Ward 12
- Saves manual backtracking time

### Hidden Paths

**Unlock Conditions:**
- Cartography Pages (3 pages → reveal mine)
- Scroll discoveries (special Scrolls reveal hidden paths)
- Building unlocks (Mining Guild reveals mine paths)
- Quest completion (future: NPC quests unlock paths)

**Visibility:**
- Locked paths: Grayed out with tooltip ("Requires: 3 Cartography Pages")
- Unlocked paths: Highlighted, selectable

---

## Implementation Specifications

### Fast Travel System

```typescript
interface FastTravelSystem {
  unlocked: boolean; // City Council funded?
  tier: 1 | 2 | 3; // Current upgrade tier
  checkpoints: Map<string, FastTravelCheckpoint>;
  costPerUse: number; // 20 Arcana (Tier 1), 10 (Tier 2), etc.
}

function fastTravel(targetWardId: string): boolean {
  // Check unlock
  if (!permanentState.fastTravelUnlocked) {
    showMessage("Fast Travel not unlocked");
    return false;
  }

  // Check checkpoint exists and unlocked
  const checkpoint = fastTravelSystem.checkpoints.get(targetWardId);
  if (!checkpoint || !checkpoint.unlocked) {
    showMessage("Checkpoint not available");
    return false;
  }

  // Check cost
  if (journeyState.arcana < fastTravelSystem.costPerUse) {
    showMessage("Not enough Arcana");
    return false;
  }

  // Check restrictions
  if (hasUndefeatedBossBetween(journeyState.currentWard, targetWardId)) {
    showMessage("Cannot skip undefeated bosses");
    return false;
  }

  // Execute travel
  journeyState.arcana -= fastTravelSystem.costPerUse;
  journeyState.currentWard = targetWardId;
  loadWard(targetWardId);

  return true;
}
```

### Backtracking System

```typescript
function backtrackToWard(targetWardId: string): void {
  const currentIndex = getWardIndex(journeyState.currentWard);
  const targetIndex = getWardIndex(targetWardId);

  if (targetIndex > currentIndex) {
    console.error("Cannot backtrack forward");
    return;
  }

  // Manual traversal backward
  const wardsToTraverse = getWardPath(journeyState.currentWard, targetWardId);

  wardsToTraverse.forEach(wardId => {
    // Respawn common enemies
    spawnCommonEnemies(wardId);

    // Bosses stay defeated (per-journey)
    if (!isWardBossDefeated(wardId)) {
      spawnBossWave(wardId);
    }

    loadWard(wardId);
  });

  journeyState.currentWard = targetWardId;
}
```

### Checkpoint Creation

```typescript
function createCheckpoint(wardId: string): void {
  const checkpoint: FastTravelCheckpoint = {
    wardId,
    name: generateCheckpointName(wardId), // "Ward 5 (Path A)"
    unlocked: true,
    branch: extractBranch(wardId) // "A", "B", or null
  };

  permanentState.fastTravelCheckpoints.set(wardId, checkpoint);
  savePermanentState();

  showMessage(`Checkpoint created: ${checkpoint.name}`);
}
```

---

## Player Convenience Features

### Quality of Life

**Fast Travel Benefits:**
- Skip tedious manual traversal
- Revisit mines quickly
- Explore alternate paths efficiently
- Return to specific bosses (if not defeated)

**Cost-Benefit Analysis:**
- 20 Arcana per use (Tier 1) = Reasonable cost
- Saves 1-5 minutes of manual traversal per use
- Encourages exploration (can easily return to main path)

### Accessibility Options

**Fast Travel Accessibility:**
- Tooltips: "Fast travel to this checkpoint for 20 Arcana"
- Confirmation: "Confirm fast travel to Ward 5A? (-20 Arcana)"
- Undo option: If player misclicks (1-second grace period)

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Progression System: [03_Progression_System.md](./03_Progression_System.md)
- State Persistence: [07_State_Persistence.md](./07_State_Persistence.md)
- Economy System: [02_Economy_System.md](./02_Economy_System.md)

---

*This document provides specifications for the v2.4.0 path navigation and fast travel systems.*
