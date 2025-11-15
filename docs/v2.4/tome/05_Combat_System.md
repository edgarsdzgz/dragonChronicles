# Combat System - Draconia Chronicles v2.4.0

**Document:** 05_Combat_System.md
**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Combat mechanics, enemy types, and boss encounters

**Note:** This document focuses on v2.4-specific combat changes. For detailed combat mechanics, abilities, and damage calculations, refer to [v2.3 Combat Systems](../../archive/v2.3/tome/05_Combat_Systems_Enemies_Bosses.md) and adapt as needed.

---

## Overview

The Combat System in v2.4.0 maintains core mechanics from v2.3 while introducing **boss encounter distinctions** and **per-journey vs permanent defeat tracking**.

**Key v2.4 Changes:**
- Boss waves every ward (not every 5 wards)
- Large enemies every 10 wards
- World bosses (permanent defeat, one-time only)
- Per-journey boss respawning

---

## Enemy Types (v2.4)

### 1. Common Enemies

**Characteristics:**
- Spawn continuously during ward traversal
- Variety: Melee, ranged, flying, ground
- Stats scale with ward number

**Drops:**
- Arcana: 10-20 per enemy
- Soul Power: 5 per enemy (post-Ward 3 unlock)
- Items: Low % chance (Silver/Nickel items)
- Scrolls: 0.5% chance
- Cartography Pages: 0.1% chance

**Respawn:**
- Continuous during ward traversal
- Respawn when backtracking

*For detailed enemy stats, behaviors, and AI patterns, see v2.3 tome/05_Combat_Systems_Enemies_Bosses.md*

### 2. Boss Wave Enemies

**Frequency:** End of every ward

**Characteristics:**
- Multiple enemies (3-13, scales with ward)
- Spawn simultaneously
- Higher stats: 2x health, 1.5x damage vs common
- Warning system before spawn

**Encounter Flow:**
1. Warning: "Strong enemy force gathering!"
2. 5-second countdown
3. All enemies spawn at once
4. Player must defeat all to proceed

**Drops:**
- Arcana: Fills to max capacity
- Soul Power: 50-100 (scales with ward)
- Items: Guaranteed drops (1-3 items)

**Respawn Behavior:**
- **Per-Journey:** Defeated boss waves stay defeated within journey
- **Rewind Safe:** If player backtracks, boss stays defeated
- **New Journey:** All boss waves respawn

### 3. Large Enemies

**Frequency:** Every 10th ward (Ward 10, 20, 30, etc.)

**Characteristics:**
- Single tough unnamed enemy
- Very high health: 10x common enemy
- High damage: 3x common enemy
- Special mechanics (unique per large enemy)

**Examples:**
- Ward 10: Giant Elemental (fire-based AOE)
- Ward 20: Corrupted Wyvern (aerial combat)
- Ward 30: Stone Golem (slow, devastating melee)

**Drops:**
- Arcana: Large bonus
- Soul Power: 500
- Items: Rare drops (Nickel Plates, etc.)

**Respawn Behavior:** Per-journey (same as boss waves)

### 4. World Bosses

**Frequency:** End of each Land

**Sirocco (Land 1 Example):**
- **Location:** Final ward of Horizon Steppe
- **Type:** Named unique boss, corrupted dragon
- **Encounter:** ONE TIME ONLY, PERMANENT DEFEAT
- **Phases:**
  - Phase 1 (100-66% HP): Ground attacks, wind slashes
  - Phase 2 (66-33% HP): Aerial attacks, summon adds
  - Phase 3 (33-0% HP): Enrage, ultimate abilities

**Drops:**
- Soul Power: 10,000 (massive permanent boost)
- Unique Item: "Sirocco's Crest"
- Unlocks: Worldstone path (alternate route)

**Respawn Behavior:** NEVER - Permanent defeat

*For detailed Sirocco mechanics, see v2.3 tome/05 Bosses section and adapt to three-phase structure*

---

## Boss Encounter Mechanics (v2.4)

### Boss State Tracking

```typescript
// Per-Journey (Resets)
journeyState.wardBossesDefeated.set("ward-5A-boss", true);
journeyState.largeEnemiesDefeated.set(10, true);

// Permanent (Never Resets)
permanentState.worldBosses.set("sirocco", true);
```

### Rewind Behavior Example

```
Journey 1:
  Ward 1 boss defeated → Progress to Ward 5 → Rewind to Ward 3
  Ward 1 boss: Still defeated (no re-fight)
  Ward 3: Can continue forward, Ward 3 boss still defeated if already fought

Journey 2 (New):
  Ward 1 boss: Respawned (new journey)
```

###World Boss Permanent Defeat

```
First Playthrough:
  Reach Sirocco → Epic fight → Defeat → Worldstone path unlocked

Subsequent Journeys:
  Sirocco: Already defeated, path always open
  Can proceed directly to Worldstone or Land 2
```

---

## Player Combat Mechanics

*This section should be populated from v2.3 specifications. Key areas to adapt:*

### Abilities

**Firecraft (Fire-based attacks):**
- *Pull from v2.3 tome/06_Abilities_Skills_Rituals.md*
- Adapt ability progression to Soul Power unlock (Ward 3+)

**Safety (Defensive abilities):**
- *Pull from v2.3 tome/06*
- Shields, healing, damage reduction

**Scales (Draconic transformation):**
- *Pull from v2.3 tome/06*
- Future unlock (post-MVP)

### Manual Contribution Target

**Balance Goal:**
- ~20% ±10% of total damage from player abilities
- Rest: Automated systems (research, permanent upgrades)

### Damage Calculations

*Pull damage formulas from v2.3 tome/05*

**Formula Structure:**
```
Total Damage = Base Damage × (1 + Permanent Upgrades) × (1 + Research Bonuses) × (1 + Buffs)
```

---

## Performance Targets

**Entity Limits:**
- ≤200-400 enemies on screen simultaneously
- ≤600 projectiles per second
- Boss waves: 3-13 enemies (within limits)

**Frame Rate:**
- 60 FPS desktop (target)
- ≥40 FPS mid-range phones (minimum)

**Combat Optimization:**
- Object pooling for projectiles
- Efficient collision detection
- Culling off-screen entities

*For detailed performance specifications, see v2.3 tome/14_Rendering_Pixi_Perf_Budgets.md*

---

## Integration with v2.4 Systems

### Soul Power Integration

**Pre-Ward 3:** No Soul Power drops
**Post-Ward 3:** All enemies drop Soul Power

```typescript
function onEnemyDefeated(enemy: Enemy): void {
  // Arcana (always)
  gainArcana(enemy.arcanaDrop);

  // Soul Power (post-unlock)
  if (permanentState.soulPowerUnlocked) {
    gainSoulPower(enemy.soulPowerDrop);
  }

  // Items (chance-based)
  rollItemDrops(enemy);
}
```

### Permanent Upgrades Impact

**Rune Forge Upgrades:**
- Fire Potency: +10/20/30% fire damage (cumulative)
- Draconic Vitality: +15/30/45% max health

**Combat Power Scaling:**
```
Early Game (No upgrades): Base damage
Mid Game (Tier 1-2 upgrades): 1.5-2x damage
Late Game (Tier 3 upgrades): 2.5-3x damage
```

---

## Boss Difficulty Scaling

### Ward Boss Waves

| Ward Range | Enemy Count | Enemy HP | Difficulty |
|------------|-------------|----------|------------|
| 1-5 | 3-5 | 200-400 | Easy |
| 6-10 | 5-7 | 400-800 | Medium |
| 11-15 | 7-9 | 800-1600 | Medium-Hard |
| 16-20 | 9-11 | 1600-3200 | Hard |
| 21-25 | 11-13 | 3200-6400 | Very Hard |

### Large Enemies (Every 10 Wards)

| Ward | Large Enemy | HP | Special Mechanic |
|------|-------------|----|--------------------|
| 10 | Giant Elemental | 10,000 | Fire AOE pools |
| 20 | Corrupted Wyvern | 30,000 | Aerial dive bombs |
| 30 | Stone Golem | 80,000 | Ground slam, stun |

### World Boss: Sirocco

**HP:** 50,000 (3 phases)
**Duration:** 3-5 minutes (challenging endgame)
**Mechanics:**
- Phase transitions at 66% and 33%
- Summons adds (wind spirits)
- Environmental hazards (tornadoes)
- Ultimate attack (storm call)

*For detailed mechanics, adapt from v2.3 boss specifications*

---

## Implementation Notes

### Boss Wave System

```typescript
async function triggerBossWave(wardId: string): Promise<void> {
  // Check if already defeated (per-journey)
  if (isWardBossDefeated(wardId)) {
    console.log("Boss wave already defeated, skipping");
    return;
  }

  const config = getBossWaveConfig(wardId);

  // Warning
  showWarning("Strong enemy force gathering!", 5);
  pauseProgression();
  await delay(5000);

  // Spawn
  spawnEnemiesSimultaneous(config.enemyTypes, config.enemyCount);

  // Wait for defeat
  await waitForAllEnemiesDefeated();

  // Rewards
  fillArcanaToMax();
  dropItems(config.guaranteedItems);

  // Mark defeated
  journeyState.wardBossesDefeated.set(`${wardId}-boss`, true);
  saveGame();

  // Resume
  resumeProgression();
}
```

### World Boss System

```typescript
async function triggerWorldBoss(bossId: string): Promise<void> {
  // Check permanent state
  if (permanentState.worldBosses.get(bossId)) {
    console.log("World boss already defeated permanently");
    unlockWorldstonePath();
    return; // Skip fight
  }

  // Epic intro
  await playCutscene("sirocco-intro");

  // Three-phase fight
  await bossPhase1(bossId);
  await bossPhase2(bossId);
  await bossPhase3(bossId);

  // Victory
  await playCutscene("sirocco-defeat");

  // Rewards
  permanentState.soulPower += 10000;
  giveItem("siroccos-crest");

  // Mark defeated PERMANENTLY
  permanentState.worldBosses.set(bossId, true);
  permanentState.worldBossDefeatTimestamps.set(bossId, Date.now());
  saveGame();

  // Unlock Worldstone path
  permanentState.discoveredPaths.add("ward-26A-worldstone");
}
```

---

## Future Combat Systems (Post-MVP)

*These systems are mentioned for completeness but out of MVP scope:*

- **Scales Tech Tree:** Draconic transformation abilities
- **Advanced Firecraft:** Higher-tier fire abilities
- **Advanced Safety:** Complex defensive mechanics
- **Combo System:** Ability chaining
- **Enemy Affixes:** Rare enemies with special modifiers
- **Challenge Modes:** Higher difficulty optional content

---

## Cross-References

- Core GDD: [GDD_v2.4.0.md](../GDD_v2.4.0.md)
- Progression System: [03_Progression_System.md](./03_Progression_System.md)
- Economy System: [02_Economy_System.md](./02_Economy_System.md)
- **v2.3 Combat Details:** [archive/v2.3/tome/05_Combat_Systems_Enemies_Bosses.md](../../archive/v2.3/tome/05_Combat_Systems_Enemies_Bosses.md)
- **v2.3 Abilities:** [archive/v2.3/tome/06_Abilities_Skills_Rituals.md](../../archive/v2.3/tome/06_Abilities_Skills_Rituals.md)

---

*This document focuses on v2.4-specific combat changes. For comprehensive combat mechanics, damage formulas, ability specifications, and enemy AI details, reference v2.3 tome documents and adapt to v2.4 boss encounter system.*
