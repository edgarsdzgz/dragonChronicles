# Building System - Draconia Chronicles v2.4.0

**Document:** 04_Building_System.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** City Council hub, building unlocks, and functionality specifications

---

## Overview

The Building System centers around the **City Council** as a funding hub for all major buildings in Draconia. Buildings unlock progression systems, permanent upgrades, and convenience features.

**Buildings:**
1. **City Council** - Central funding hub (always available)
2. **Arcana Bank** - Increase max Arcana capacity (tutorial unlock)
3. **Aethervault** - Scroll decryption, Soul Power unlock (500 Gold)
4. **Librarium** - Research Soul Power usage (1,000 Gold)
5. **Rune Forge** - Craft permanent upgrades (1,500 Gold)
6. **Mining Guild** - Mine discovery system (800 Gold)

---

## City Council (Central Hub)

### Purpose

Central funding system for all building unlocks and city projects.

### Unlock

Always available (no cost, tutorial introduction)

### Functionality

**Project List UI:**
```
Available Projects:
  ✓ Aethervault - 500 Gold [FUNDED]
  • Librarium - 1,000 Gold [AVAILABLE]
  🔒 Rune Forge - 1,500 Gold [Requires: Librarium research]
  🔒 Mining Guild - 800 Gold [Requires: Cartography Page]
  🔒 Fast Travel - 2,000 Gold [Requires: Ward 10+]
```

**Project States:**
- **Funded**: Checkmark, grayed out
- **Available**: Highlighted, can be funded
- **Locked**: Lock icon, tooltip shows unlock condition

**Funding Flow:**
1. Player visits City Council
2. Selects project
3. Confirms Gold cost
4. Gold deducted, building unlocked
5. Building button appears in Draconia UI

---

## Arcana Bank

### Purpose

Deposit Arcana to increase pendant's max capacity.

### Unlock

Tutorial (Ward 1 first return, guided)

### Cost

Free to access (deposits are voluntary)

### Functionality

**Deposit UI:**
```
Current Capacity: 1,000 Arcana
Current Arcana: 750 (after 25% tax)
Total Deposited: 0 Arcana

[Deposit Slider: 0-750]
Selected: 500 Arcana

Next Threshold: 5,000 Arcana
Progress: 500 / 5,000 (10%)

[Deposit Button]
```

**Threshold Rewards:**
- 5,000 deposited → +25% capacity (1,000 → 1,250)
- 15,000 deposited → +62.5% capacity (1,000 → 1,625)
- 40,000 deposited → +125% capacity (1,000 → 2,250)

**Lore:**
- "The soul of Draconia recognizes your contribution"
- "A spark of the first flame enhances your pendant"

---

## Aethervault

### Purpose

Decipher Scrolls to unlock research, lore, and permanent systems.

### Unlock

**City Council: 500 Gold**
- Triggered by Ward 3 First Scroll discovery
- Tutorial guides player to fund

### Functionality

**NPCs:**
- **Elder**: Deciphers First Scroll instantly (Soul Power unlock)
- **Scroll Researchers**: Hired for ongoing Scroll decryption (200 Gold each)

**First Scroll (Ward 3):**
```
Player returns with First Scroll
→ Directed to Aethervault
→ Fund at City Council (500 Gold)
→ Enter Aethervault
→ Elder takes Scroll
→ Cutscene: Elder deciphers using personal Arcana
→ Soul Power system unlocked
```

**Ongoing Scrolls:**
```
Find Scroll → Return to Draconia → Aethervault
→ Check Scroll Researchers
→ If none: Hire for 200 Gold (funds 5 Scrolls)
→ Submit Scroll for decryption (2-5 min IRL time)
→ Return when complete
→ Rewards: Research unlock, lore entry, ability
```

**Scroll Researcher Capacity:**
- Each researcher: Funds 5 Scrolls
- Decryption: One at a time per researcher
- Multiple researchers: Parallel decryption

**Assistant Role:**
- Passive research: Hints about Scroll locations
- "Scrolls can be found in Ward 2 and Ward 5"
- Shows drop rates: 0.5% common, 5% boss wave

---

## Librarium

### Purpose

Research how to USE Soul Power for permanent upgrades.

### Unlock

**City Council: 1,000 Gold**
- Triggered post-Soul Power unlock
- Tutorial guides player after Aethervault

### Functionality

**Research System:**
```
Librarium UI:
  Researchers Available: 1 (can hire more)

  Research Topics:
    • Soul Power Permanent Enchantment (5 min) [AVAILABLE]
    • Fire Mastery Research (10 min) [LOCKED: Requires Scroll]
    • Advanced Tech Trees (15 min) [LOCKED: Requires Scroll]
```

**First Research:**
- Topic: "Soul Power Permanent Enchantment"
- Duration: 5 minutes IRL time
- Cost: Free (research time only)
- Reward: Unlocks Rune Forge project at City Council

**Research Flow:**
1. Select research topic
2. Start research (timer begins)
3. Player can journey while researching
4. Notification when complete
5. Return to collect results

**Hiring Researchers:**
- Cost: 100 Gold per researcher
- Benefit: Parallel research (multiple topics simultaneously)
- Example: 3 researchers = 3 topics researching at once

---

## Rune Forge

### Purpose

Craft permanent upgrades using Soul Power.

### Unlock

**City Council: 1,500 Gold**
- Requires Librarium research completion
- Tutorial guides player after research

### Functionality

**Crafting UI:**
```
Rune Forge:
  Forgers Available: 1 (can hire more)
  Forge Usage: 0/10 (maintenance due at 10 uses)

  Available Upgrades:
    • Fire Potency Tier 1 (500 SP, 3 min) [AVAILABLE]
    • Draconic Vitality Tier 1 (500 SP, 3 min) [AVAILABLE]
    • Arcane Resonance Tier 1 (750 SP, 4 min) [LOCKED: Need 750 SP]
```

**Crafting Flow:**
1. Select upgrade
2. Confirm Soul Power cost
3. Crafting begins (timer)
4. Player can journey while crafting
5. Return when complete
6. Collect rune → Permanent stat increase applied

**Maintenance:**
- Cost: 50 Gold every 10 uses
- Warning: "Maintenance due in 3 uses"
- Blocked: Cannot craft if maintenance not paid

**Hiring Forgers:**
- Cost: 500 Gold + 10 Nickel Ingots (resources)
- Benefit: Parallel crafting (multiple runes simultaneously)
- Example: 2 forgers = 2 runes crafting at once

**Upgrade Tiers:**
- Tier 1: 500-750 SP, 3-4 min
- Tier 2: 1,500-2,250 SP, 5-6 min
- Tier 3: 4,500-6,750 SP, 7-8 min

---

## Mining Guild

### Purpose

Decipher Cartography Pages to reveal mine locations.

### Unlock

**City Council: 800 Gold**
- Triggered by first Cartography Page discovery
- Tutorial prompts funding

### Functionality

**Cartographer NPC:**
- Explains Cartography Page system
- Tracks page collection progress
- Marks mine locations on map

**Mine Discovery Flow:**
```
Find Cartography Page 1 (Horizon Steppe)
→ Notification: "Strange map fragment..."
→ Directed to Mining Guild
→ Fund at City Council (800 Gold)
→ Visit Cartographer
→ "Collect 3 pages to reveal mine"
→ Find Page 2: "2/3 pages"
→ Find Page 3: "3/3 - Mine location revealed!"
→ Map updated: "Ward 11C alternate path"
```

**Mine Visit:**
```
Journey to Ward 11 → Branch: 11A or 11B
→ Choose 11B (toward mine)
→ 11B → 11C (dead end: Mine Guardian boss)
→ Defeat Guardian
→ Enter mine → Clicker minigame
→ Earn 200-500 Gold
→ Backtrack: 11C → 11B → 12 (main path)
```

**Post-Worldstone:**
- Mining automation unlocked
- Convoys/stewards mine passively
- Mines become passive gold income

---

## Building Dependencies

### Unlock Chain

```
Tutorial:
  City Council (always available)
  Arcana Bank (tutorial unlock, Ward 1)

Ward 3+:
  Aethervault (500 Gold) → Soul Power unlock

Post-Soul Power:
  Librarium (1,000 Gold) → Research (5 min)
    ↓
  Rune Forge (1,500 Gold) → Permanent upgrades

Cartography Page Discovery:
  Mining Guild (800 Gold) → Mine discovery

Ward 10+:
  Fast Travel (2,000 Gold) → Checkpoint navigation
```

### Total Gold Required

**For All Buildings:**
- Aethervault: 500
- Librarium: 1,000
- Rune Forge: 1,500
- Mining Guild: 800
- Fast Travel: 2,000
- **Total: 5,800 Gold**

**Tutorial Phase (Ward 1-5):**
- ~850-1,500 Gold achievable
- Can fund Aethervault + Librarium

**Mid-Game (Ward 6-15):**
- ~3,000-4,000 Gold total
- Can fund all except Fast Travel

**Late-Game (Ward 16+):**
- Mines provide repeatable gold
- Fast Travel achievable

---

## Implementation Specifications

### City Council System

```typescript
interface CityCouncilProject {
  id: string; // "aethervault", "librarium", etc.
  name: string; // Display name
  description: string;
  goldCost: number;
  unlockCondition?: UnlockCondition;
  funded: boolean; // Permanent state
}

interface UnlockCondition {
  type: "research" | "item" | "ward" | "building";
  requirement: string; // "librarium-research-complete"
}

function fundProject(projectId: string): boolean {
  const project = getCityCouncilProject(projectId);

  // Check unlock condition
  if (project.unlockCondition && !checkUnlockCondition(project.unlockCondition)) {
    showMessage("Project locked: " + project.unlockCondition.requirement);
    return false;
  }

  // Check Gold
  if (permanentState.gold < project.goldCost) {
    showMessage("Not enough Gold");
    return false;
  }

  // Deduct Gold
  permanentState.gold -= project.goldCost;

  // Mark funded (permanent)
  permanentState.buildings.add(projectId);
  project.funded = true;

  // Unlock building
  unlockBuilding(projectId);

  showMessage(`${project.name} funded! Building unlocked.`);
  saveGame();
  return true;
}
```

### Arcana Bank System

```typescript
function depositArcana(amount: number): void {
  if (journeyState.arcana < amount) {
    showMessage("Not enough Arcana");
    return;
  }

  // Deduct from current
  journeyState.arcana -= amount;

  // Add to cumulative total (permanent)
  permanentState.totalArcanaDeposited += amount;

  // Check thresholds
  const oldCapacity = permanentState.maxArcanaCapacity;
  const newCapacity = calculateMaxCapacity(permanentState.totalArcanaDeposited);

  if (newCapacity > oldCapacity) {
    permanentState.maxArcanaCapacity = newCapacity;
    const increase = newCapacity - oldCapacity;
    showMessage(`Capacity increased by ${increase}! New max: ${newCapacity}`);
    playSp arkAnimation();
  } else {
    showMessage(`Deposited ${amount} Arcana. Progress toward next threshold.`);
  }

  saveGame();
}
```

### Rune Forge System

```typescript
interface RuneForgeUpgrade {
  id: string; // "fire-potency-1"
  name: string;
  tier: number; // 1, 2, 3
  soulPowerCost: number;
  craftingTimeMinutes: number;
  effect: StatModifier;
  unlocked: boolean; // Research requirement
}

async function craftUpgrade(upgradeId: string): Promise<void> {
  const upgrade = getRuneForgeUpgrade(upgradeId);

  // Check Soul Power
  if (permanentState.soulPower < upgrade.soulPowerCost) {
    showMessage("Not enough Soul Power");
    return;
  }

  // Check forge maintenance
  const forgeUsage = getForgeUsageCount();
  if (forgeUsage >= 10 && !forgeMaintenancePaid) {
    showMessage("Forge maintenance required (50 Gold)");
    return;
  }

  // Deduct Soul Power
  permanentState.soulPower -= upgrade.soulPowerCost;

  // Start crafting
  const craftingEndTime = Date.now() + (upgrade.craftingTimeMinutes * 60 * 1000);
  startCrafting(upgradeId, craftingEndTime);

  showMessage(`Crafting ${upgrade.name}... (${upgrade.craftingTimeMinutes} minutes)`);

  // Wait for crafting
  await waitForCraftingComplete(craftingEndTime);

  // Apply permanent upgrade
  applyUpgrade(upgrade);
  permanentState.permanentUpgrades.set(upgradeId, {
    id: upgradeId,
    level: upgrade.tier,
    totalInvested: upgrade.soulPowerCost
  });

  // Increment forge usage
  incrementForgeUsage();

  showMessage(`${upgrade.name} complete! Permanent stat increase applied.`);
  saveGame();
}
```

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Economy System: [02_Economy_System.md](./02_Economy_System.md)
- Tutorial Sequence: [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md)
- State Persistence: [07_State_Persistence.md](./07_State_Persistence.md)

---

*This document provides complete specifications for the v2.4.0 building system, including all six buildings and their unlock chains.*
