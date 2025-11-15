# Economy System - Draconia Chronicles v2.4.0

**Document:** 02_Economy_System.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Currency systems, item economy, and progression costs

---

## Overview

The Economy System manages three primary currencies and various items that drive player progression:

**Currencies:**
1. **Arcana** - Run currency, pendant capacity system, return tax
2. **Gold** - City Council funding, building unlocks
3. **Soul Power** - Permanent upgrade currency (unlocked Ward 3+)

**Items:**
- Silver/Nickel items (sell for Gold)
- Scrolls (research unlocks)
- Cartography Pages (mine discovery)

---

## Arcana Currency

### Core Mechanics

**Acquisition:**
- Defeat enemies: 10-20 Arcana per common enemy
- Boss waves: Fills to max capacity
- Scaling: Increases with ward progression

**Storage:**
- Arcana Pendant: Limited capacity (starts 1,000 Arcana)
- Visual: Arcana Bar shows current / max capacity
- Full pendant: Encouraged to return to Draconia

**25% Return Tax (EVERY RETURN):**
```
Player has 1,000 Arcana → Returns to Draconia
Barrier Tax (25%): 250 Arcana deducted
Remaining: 750 Arcana available
```

**Tax vs Deposited:**
- Tax: Goes to barrier (does NOT count as deposited)
- Deposited: Voluntary deposits at Arcana Bank (counts toward capacity upgrades)

### Arcana Bank Deposit System

**Purpose:** Increase max pendant capacity through cumulative deposits

**Deposit Flow:**
```
1. Return to Draconia (25% tax deducted)
2. Visit Arcana Bank
3. Deposit remaining Arcana (voluntary)
4. Cumulative total tracked
5. Thresholds reached → Max capacity increases
```

**Capacity Upgrade Thresholds (Example):**

| Total Deposited | Max Capacity | Increase |
|-----------------|--------------|----------|
| 0 | 1,000 | Base |
| 5,000 | 1,250 | +25% |
| 15,000 | 1,625 | +62.5% |
| 40,000 | 2,250 | +125% |
| 100,000 | 3,250 | +225% |
| 250,000 | 5,000 | +400% |

**Formula (Example):**
```typescript
function calculateMaxCapacity(totalDeposited: number): number {
  const base = 1000;
  const scalingFactor = 0.0001; // Logarithmic scaling
  const increase = Math.floor(Math.log(totalDeposited + 1) * base * scalingFactor);
  return base + increase;
}
```

**Lore Justification:**
- "The soul of Draconia recognizes your contribution"
- "A spark of the first flame enhances your pendant's capacity"

---

## Gold Currency

### Core Mechanics

**Acquisition:**
- Sell Silver/Nickel items at Market
- Mine clicker minigame (200-500 Gold per visit)
- First Scroll discovery reward (700 Gold, one-time)

**Purpose:** Fund City Council projects (building unlocks)

**Permanent:** Gold never resets (permanent state)

### Item → Gold Conversion

**Silver Items:**
| Item | Gold Value | Drop Rate |
|------|------------|-----------|
| Silver Coin | 10 | 5% per enemy |
| Silver Bar | 50 | 1% per enemy |
| Silver Ingot | 100 | 0.5% per boss wave |

**Nickel Items:**
| Item | Gold Value | Drop Rate |
|------|------------|-----------|
| Nickel Coin | 15 | 4% per enemy |
| Nickel Ingot | 75 | 0.5% per boss wave |
| Nickel Plate | 150 | 0.1% per large enemy |

**Guaranteed Drops (Ward 1 Tutorial):**
- 5 enemies: 1 Silver Coin (10 Gold)
- 15 enemies: 1 Nickel Coin (15 Gold)
- 50 enemies: 1 Silver Bar (50 Gold)
- Ward 1 boss: 1 Nickel Ingot (75 Gold)
- **Total:** 150 Gold by Ward 1 completion

### City Council Projects

**Building Unlock Costs:**

| Building | Cost | Prerequisite | Purpose |
|----------|------|--------------|---------|
| **Aethervault** | 500 Gold | Ward 3 Scroll | Scroll decryption |
| **Librarium** | 1,000 Gold | Soul Power unlock | Research Soul Power usage |
| **Rune Forge** | 1,500 Gold | Librarium research | Craft permanent upgrades |
| **Mining Guild** | 800 Gold | First Cartography Page | Mine discovery |
| **Fast Travel** | 2,000 Gold | Ward 10+ | Checkpoint navigation |

**Maintenance Costs:**
- Rune Forge: 50 Gold every 10 uses
- Scroll Researcher: 200 Gold per researcher (funds 5 Scrolls)
- Librarium Researcher: 100 Gold per researcher

**Gold Sink Design:**
- Early game: 500-1,500 Gold (Aethervault, Librarium, Rune Forge)
- Mid game: 800-2,000 Gold (Mining Guild, Fast Travel)
- Late game: Maintenance costs (ongoing Gold sink)

### Lore Integration

**Food Shortage:**
- Dragons eating gold as last-resort food
- Nickel/Silver more nutritious than gold
- Meat ideal (scarce during Unmaking siege)

**Economic Justification:**
- Player sells Nickel/Silver for Gold
- Gold funds city projects (Librarium, Rune Forge)
- Projects help player + city (mutual benefit)

---

## Soul Power Currency

### Unlock Condition

**Gated Until Ward 3:**
1. Ward 3 boss wave: FIRST SCROLL drop (100% guaranteed, one-time)
2. Return to Draconia: 25% tax
3. Fund Aethervault: 500 Gold (City Council)
4. Elder deciphers Scroll: Instant (uses personal Arcana)
5. **Soul Power Unlocked:** Pendant now gathers Soul Power

**UI State:**
- Pre-unlock: Soul Power display HIDDEN
- Post-unlock: Soul Power display VISIBLE, starts accumulating

### Accumulation

**Sources:**
- Defeat enemies: 5 Soul Power per common enemy (post-unlock)
- Boss waves: 50-100 Soul Power (scales with ward)
- Large enemies: 500 Soul Power
- World boss (Sirocco): 10,000 Soul Power (one-time)

**Scaling (Example):**
```typescript
function calculateSoulPowerDrop(enemy: Enemy, wardNumber: number): number {
  const base = enemy.type === 'common' ? 5 : 50;
  const wardMultiplier = 1 + (wardNumber * 0.1);
  return Math.floor(base * wardMultiplier);
}

// Ward 1 common: 5 SP
// Ward 10 common: 10 SP
// Ward 20 common: 15 SP
```

**Never Resets:** Permanent currency, persists across all journeys

### Usage

**Rune Forge Permanent Upgrades:**

| Upgrade | Tier | Soul Power Cost | Effect |
|---------|------|-----------------|--------|
| Fire Potency | 1 | 500 | +10% fire damage |
| Fire Potency | 2 | 1,500 | +20% fire damage (cumulative: 30%) |
| Fire Potency | 3 | 4,500 | +30% fire damage (cumulative: 60%) |
| Draconic Vitality | 1 | 500 | +15% max health |
| Draconic Vitality | 2 | 1,500 | +30% max health (cumulative: 45%) |
| Arcane Resonance | 1 | 750 | +5% Arcana gain |
| Arcane Resonance | 2 | 2,250 | +10% Arcana gain (cumulative: 15%) |

**Cost Scaling:**
```typescript
function calculateUpgradeCost(baseCost: number, tier: number): number {
  return baseCost * Math.pow(3, tier - 1);
}

// Fire Potency: 500, 1500, 4500, 13500, 40500...
```

**Crafting Time:** 3-5 minutes IRL time (can journey while crafting)

---

## Item Economy

### Consumable Items

**Silver/Nickel Items:**
- Purpose: Sell for Gold at Draconia Market
- Storage: Inventory (unlimited capacity)
- Guaranteed drops: Ward 1 milestones (5, 15, 50 enemies)
- Random drops: Low % chance per enemy

### Scroll Items

**Acquisition:**
- Random drops: 0.5% per common enemy, 5% per boss wave
- Guaranteed locations: Ward 2, Ward 5 (specific chests/enemies)
- First Scroll: Ward 3 boss wave (100%, one-time)

**Purpose:**
- Decipher at Aethervault (costs Scroll Researcher hiring: 200 Gold)
- Unlocks: Research topics, lore entries, abilities, tech tree nodes

**Scroll Types (Examples):**
| Scroll | Location | Unlock |
|--------|----------|--------|
| Soul Power Scroll | Ward 3 boss (first) | Soul Power system |
| Fire Mastery Scroll | Ward 2 guaranteed | Firecraft Tier 2 research |
| Ancient Tactics Scroll | Ward 5 guaranteed | Combat ability unlock |
| Hidden Path Scroll | Random drop | Reveals Ward 22C path |

### Cartography Pages

**Acquisition:**
- Rare drops: 0.1% per common enemy, 1% per boss wave
- Land-specific: "Cartography Page (Horizon Steppe)"

**Purpose:**
- Collect 3 pages of same land → Mine location revealed
- Mining Guild Cartographer marks alternate path

**Mine Rewards:**
- Clicker minigame: 200-500 Gold (manual gold mining)
- Post-Worldstone: Mining automation (passive gold income)

---

## Economic Flows

### Early Game Loop (Ward 1-5)

```
Journey → Defeat enemies → Gain Arcana + Items
    ↓
Return (25% tax) → Sell items for Gold → Arcana Bank deposit
    ↓
Gold accumulated → Fund Aethervault (500) → Soul Power unlock
    ↓
Continue journeying → Accumulate Gold for Librarium (1,000)
```

### Mid Game Loop (Ward 6-15)

```
Soul Power accumulating → Fund Librarium → Research (IRL time)
    ↓
Fund Rune Forge (1,500 Gold) → Craft permanent upgrades (Soul Power cost)
    ↓
Find Cartography Pages → Fund Mining Guild (800 Gold) → Discover mines
    ↓
Mine clicker minigame → 200-500 Gold per visit → Fund Fast Travel (2,000)
```

### Late Game Loop (Ward 16-25)

```
Fast Travel unlocked → Efficient exploration of branching paths
    ↓
Continue accumulating Soul Power → Higher-tier Rune Forge upgrades
    ↓
Arcana Bank deposits → Max capacity increases → More Arcana per journey
    ↓
Defeat Sirocco → 10,000 Soul Power → Major upgrade spike
    ↓
Optional: Power Worldstone (50,000 Arcana investment)
```

---

## Balance Considerations

### Arcana Capacity Scaling

**Design Goals:**
- Early game (Wards 1-10): 1,000-2,000 capacity (manageable)
- Mid game (Wards 11-20): 2,000-4,000 capacity (progression felt)
- Late game (Ward 21+): 4,000-8,000 capacity (significant power)

**25% Tax Impact:**
- Encourages deposits (voluntary contribution feels better)
- Discourages constant returns (time cost of returning)
- Gold sink alternative: Can focus on Gold earning instead

### Gold Availability

**Tutorial Phase (Ward 1-3):**
- Guaranteed: 150 Gold (Ward 1 milestones + boss)
- First Scroll reward: 700 Gold (total: 850 Gold by Ward 3)
- Aethervault cost: 500 Gold (achievable by Ward 3)

**Mid-Game (Ward 4-10):**
- Item drops accumulate: ~500-1,000 Gold per journey (Ward 4-10)
- Multiple returns needed for Librarium (1,000) + Rune Forge (1,500)
- Pacing: 2-3 returns to accumulate 2,500 Gold total

**Late-Game (Ward 11+):**
- Mine access: 200-500 Gold per visit (repeatable)
- Fast Travel unlock: 2,000 Gold (significant investment, late-game convenience)

### Soul Power Progression

**Early Post-Unlock (Ward 4-10):**
- ~500-1,000 Soul Power gained
- Enough for 1-2 Tier 1 upgrades (500 SP each)

**Mid-Game (Ward 11-20):**
- ~2,000-5,000 Soul Power gained
- Enough for Tier 2 upgrades (1,500 SP each)

**Late-Game (Ward 21-25 + Sirocco):**
- ~10,000-20,000 Soul Power total (including Sirocco bonus)
- Enough for multiple Tier 3 upgrades (4,500 SP each)

---

## Implementation Specifications

### Currency Tracking

```typescript
interface EconomyState {
  // Arcana (Per-Journey + Permanent)
  currentArcana: number; // In pendant (journey state)
  maxArcanaCapacity: number; // Upgraded via deposits (permanent)
  totalArcanaDeposited: number; // Cumulative (permanent)

  // Gold (Permanent)
  gold: number; // Never resets

  // Soul Power (Permanent)
  soulPower: number; // Never resets
  soulPowerUnlocked: boolean; // Ward 3 Scroll trigger
}

// Arcana gain
function gainArcana(amount: number): void {
  journeyState.arcana = Math.min(
    journeyState.arcana + amount,
    permanentState.maxArcanaCapacity
  );

  if (journeyState.arcana >= permanentState.maxArcanaCapacity) {
    showNotification("Arcana pendant full! Return to Draconia.");
  }
}

// Return tax (25%)
function applyReturnTax(): number {
  const taxAmount = Math.floor(journeyState.arcana * 0.25);
  journeyState.arcana -= taxAmount;
  showMessage(`Barrier Tax: ${taxAmount} Arcana deducted`);
  return journeyState.arcana; // Remaining
}

// Arcana Bank deposit
function depositArcana(amount: number): void {
  if (journeyState.arcana < amount) {
    showMessage("Not enough Arcana");
    return;
  }

  journeyState.arcana -= amount;
  permanentState.totalArcanaDeposited += amount;

  // Check for capacity upgrade
  const newCapacity = calculateMaxCapacity(permanentState.totalArcanaDeposited);
  if (newCapacity > permanentState.maxArcanaCapacity) {
    permanentState.maxArcanaCapacity = newCapacity;
    showMessage(`Capacity increased to ${newCapacity}! (Spark of First Flame)`);
  }

  saveGame();
}

// Gold gain (item sale)
function sellItem(itemId: string): void {
  const item = getItemDefinition(itemId);
  const quantity = journeyState.items.get(itemId) || 0;

  if (quantity === 0) {
    showMessage("No items to sell");
    return;
  }

  const goldGained = item.goldValue * quantity;
  permanentState.gold += goldGained;
  journeyState.items.delete(itemId);

  showMessage(`Sold ${quantity}x ${item.name} for ${goldGained} Gold`);
  saveGame();
}

// Soul Power gain (post-unlock)
function gainSoulPower(amount: number): void {
  if (!permanentState.soulPowerUnlocked) {
    return; // Not unlocked yet
  }

  permanentState.soulPower += amount;
  // Soul Power never resets (permanent)
}
```

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Tutorial Sequence: [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md)
- Building System: [04_Building_System.md](./04_Building_System.md)
- State Persistence: [07_State_Persistence.md](./07_State_Persistence.md)

---

*This document provides complete specifications for the v2.4.0 economy system, including all currencies, items, and economic flows.*
