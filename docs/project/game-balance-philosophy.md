# Game Balance Philosophy - Draconia Chronicles

**Version**: 1.0
**Created**: 2025-10-25
**Status**: Living Document - Guiding Star for All Balance Decisions

---

## Core Philosophy: Small Numbers, Big Feelings

**Guiding Principle**: Every 10× increase should feel like a major achievement.

**Number Growth Targets**:

- **0.10**: "I did it!" - First achievement feeling
- **1.0**: "I'm getting powerful!" - Major milestone
- **10.0**: "I'm unstoppable!" - Amazing achievement
- **100.0**: "I'm a legend!" - Late-game power
- **1000.0**: "I've mastered this!" - Endgame power

**Anti-Pattern**: Avoid explosive number inflation where players see "1,234,567 damage" and numbers lose meaning.

---

## Ward 1 Balance (The Foundation)

### Duration & Pacing

**Target Duration**: 90-120 seconds (1.5-2 minutes)
**Design Goal**: Fast enough to feel progression, slow enough to require 1-2 upgrades

**Calculation**:

```
Distance: 500m (from Tome)
Auto-advance speed: 4.17 m/s
Duration: 500m ÷ 4.17 m/s = 120 seconds ✓
```

**Why 120 seconds?**

- Fast enough: Not boring, maintains engagement
- Slow enough: Player must engage with upgrade system
- Sweet spot: Feel success, learn loop, want to return

---

### Micro-Progression

**Interval**: Every 10m (not 5m)
**Scaling**: +1% per interval
**Total Ramps**: 500m ÷ 10m = 50 ramps

**Enemy Scaling by Distance**:

```
0m:    100% base stats
10m:   101% base stats
50m:   105% base stats
100m:  110% base stats
250m:  125% base stats
500m:  150% base stats (50% harder)
```

**Why +1% every 10m?**

- Smooth difficulty curve
- Player notices gradual increase
- Not punishing, but requires growth
- 50% harder by end feels challenging but fair

---

## Currency Economy

### Arcana (Run Currency)

**Base Reward per Kill**: 0.02-0.04 Arcana
**Banner-Runner**: 0.03 Arcana

**Ward 1 Progression** (assuming 20 enemy kills):

```
Kill 1:  +0.03 = 0.03 total
Kill 5:  +0.03 = 0.15 total
Kill 10: +0.03 = 0.30 total
Kill 15: +0.03 = 0.45 total
Kill 20: +0.03 = 0.60 total ← End of Ward 1
```

**Upgrade Cost Progression** (×1.12 geometric growth):

```
Upgrade 1: 0.10 Arcana (at ~3 kills)
Upgrade 2: 0.11 Arcana (at ~7 kills)
Upgrade 3: 0.12 Arcana (at ~11 kills)
Upgrade 4: 0.13 Arcana (at ~15 kills)
Upgrade 5: 0.15 Arcana (at ~19 kills)

Total spent: ~0.61 Arcana
Total earned: ~0.60 Arcana
```

**Result**: Player makes 4-5 upgrades in Ward 1, spending almost all Arcana

**Why 0.03 per kill?**

- Small enough to feel earned
- Big enough to see progress
- Reaching 0.10 feels like an achievement
- Forces strategic thinking about upgrades

---

### Soul Power (Meta Currency)

**Base Reward per Kill**: 0.003 Soul Power (10× rarer than Arcana)
**Banner-Runner**: 0.003 Soul Power

**Ward 1 Progression** (20 kills):

```
Total Soul Power: 20 × 0.003 = 0.06 Soul Power
```

**Why 10× rarer?**

- Feels precious and rare
- NOT spent in Ward 1 (meta progression later)
- Accumulates slowly across multiple runs
- 0.10 Soul Power = major milestone
- 1.0 Soul Power = significant meta upgrade

**Usage** (Phase 3+):

- Unlock tech tree nodes
- Permanent upgrades
- Research discoveries
- Major power spikes

---

### Gold (QoL Currency)

**Source**: Selling items to Town vendors (Phase 2)
**NOT** direct enemy drops

**Item Value Range**:

- Common items: 0.01-0.05 gold
- Uncommon items: 0.10-0.20 gold
- Rare items: 0.50-1.00 gold
- Epic items: 5.00-10.00 gold

**Why small gold values?**

- Consistent with overall number scale
- 0.10 gold = meaningful
- 1.0 gold = significant purchase
- 10.0 gold = major investment

---

### Item Drops

**Ward 1 Drop Rate**: 2% (1 in 50 kills)

**Ward 1 Experience** (20 kills):

```
Expected drops: 20 × 0.02 = 0.4 items
Actual: 0-1 item per run (variance is okay)
```

**Scaling by Ward**:

```
Ward 1: 2% drop rate
Ward 2: 3% drop rate
Ward 3: 4% drop rate
Ward 4: 5% drop rate
Ward 5: 6% drop rate
```

**Why 2% in Ward 1?**

- Rare enough to feel special
- Common enough to learn system exists
- Doesn't distract from core combat loop
- Grows with progression

---

## Enemy Stats Scaling

### Banner-Runner (Ward 1 Base Enemy)

**Base Stats**:

```typescript
{
  baseHP: 1.0,        // 1.0 HP (not 120!)
  baseDMG: 0.15,      // 0.15 damage per attack
  moveSpeed: 1.2,     // m/s
  attackCooldown: 2.8, // seconds

  // Rewards
  arcana: 0.03,
  soulPower: 0.003,
  itemDropChance: 0.02
}
```

**Why 1.0 HP?**

- Clean base unit
- Easy to calculate
- Scales beautifully
- 10.0 HP feels like a tanky enemy
- 100.0 HP feels like a boss

**Scaling Example**:

```
Ward 1 at 0m:   1.0 HP × 1.0 = 1.0 HP
Ward 1 at 500m: 1.0 HP × 1.5 = 1.5 HP
Ward 2 at 0m:   1.0 HP × 1.22 = 1.22 HP (ward bump)
Ward 3 at 0m:   1.0 HP × 1.49 = 1.49 HP
Ward 5 at 0m:   1.0 HP × 2.21 = 2.21 HP
```

---

### Dragon (Player) Stats

**Base Stats**:

```typescript
{
  maxHP: 10.0,           // 10× enemy HP
  attackDamage: 0.25,    // Kills enemy in 4 hits
  attackSpeed: 1.5,      // Seconds between attacks
  attackRange: 400,      // Pixels
  projectileSpeed: 500   // Pixels per second
}
```

**Why 10.0 HP?**

- Should be stronger than basic enemy
- 10× feels right (dragon vs minion)
- Leaves room to grow
- Boss fights will be challenging

**Time to Kill (TTK) Calculation**:

```
Enemy HP: 1.0
Dragon Damage: 0.25
Hits to kill: 1.0 ÷ 0.25 = 4 hits
Attack speed: 1.5s
TTK: 4 × 1.5s = 6 seconds per enemy
```

**Ward 1 Combat Math**:

```
Duration: 120 seconds
Spawn rate: 1 enemy per 6 seconds
Enemies spawned: 120 ÷ 6 = 20 enemies ✓
TTK: 6 seconds
Perfect balance: Can barely keep up without upgrades
```

---

## Upgrade Scaling

### First Enchantment: Ember Potency (Dragon Damage)

**Level Progression**:

```
Level 0: 0.25 damage (base)
Level 1: 0.28 damage (+12%) - Cost: 0.10 Arcana
Level 2: 0.31 damage (+12%) - Cost: 0.11 Arcana
Level 3: 0.35 damage (+12%) - Cost: 0.12 Arcana
Level 4: 0.39 damage (+12%) - Cost: 0.13 Arcana
Level 5: 0.44 damage (+12%) - Cost: 0.15 Arcana
```

**Why +12% per level?**

- Tome specifies ×1.12 growth
- Feels meaningful but not overpowered
- 5 levels ≈ 76% stronger (1.12^5 = 1.76)
- Matches enemy scaling at 500m (50% harder)

---

## Balance Milestones

### 0.10 Milestone: First Achievement

**When**: ~3 kills into Ward 1
**Player State**:

- Earned 0.10 Arcana
- Can afford first upgrade
- Damage: 0.25 → 0.28
- **Feeling**: "I'm getting stronger!"

---

### 1.0 Milestone: Major Achievement

**When**: ~33 kills (Ward 2-3)
**Player State**:

- Accumulated 1.0 Arcana total (across runs)
- Multiple upgrades purchased
- Damage: ~0.50
- **Feeling**: "I'm powerful now!"

---

### 10.0 Milestone: Amazing Achievement

**When**: ~333 kills (Ward 5-7)
**Player State**:

- Accumulated 10.0 Arcana total
- Many upgrades, multiple nodes
- Damage: ~2.0
- **Feeling**: "I'm unstoppable!"

---

### 100.0 Milestone: Legendary Achievement

**When**: ~3,333 kills (Land 2-3)
**Player State**:

- Accumulated 100.0 Arcana
- Advanced tech tree nodes
- Damage: ~20.0
- **Feeling**: "I'm a legend!"

---

## Design Guidelines

### DO:

✅ **Start small**: Use 0.01-0.05 as base units
✅ **Scale gradually**: +10-20% per upgrade tier
✅ **Make 10× feel huge**: 0.10 → 1.0 → 10.0 → 100.0
✅ **Use decimals freely**: 0.03 Arcana is perfectly fine
✅ **Celebrate milestones**: UI feedback when crossing 10× boundaries

### DON'T:

❌ **Inflate too fast**: Avoid jumping from 10 to 1000 in one ward
❌ **Use huge base numbers**: Starting at 100 HP makes 1000 HP meaningless
❌ **Round unnecessarily**: 0.03 is better than 3 with "×100" notation
❌ **Fear decimals**: Players understand 0.25 perfectly well
❌ **Skip milestones**: Always acknowledge 10× achievements

---

## Testing Balance

### Key Metrics to Track

**Ward 1 Success**:

- [ ] Duration: 90-120 seconds ✓
- [ ] Player makes 1-2 required upgrades
- [ ] Player makes 4-5 total upgrades possible
- [ ] Final Arcana: ~0.60
- [ ] Final Soul Power: ~0.06
- [ ] Item drops: 0-1 expected
- [ ] Feels challenging but fair

**TTK (Time to Kill)**:

- [ ] Base enemy: 6 seconds
- [ ] With 1 upgrade: 5 seconds
- [ ] With 5 upgrades: 3-4 seconds
- [ ] Boss: 30-60 seconds (future)

**Player Retention**:

- [ ] Ward 1 completion rate: >90%
- [ ] Return rate: >80%
- [ ] Second journey rate: >70%
- [ ] Average session: 5-10 minutes

---

## Formula Reference

### Core Formulas

```typescript
// Micro-ramp scaling
function microRamp(distM: number, stepM = 10, inc = 0.01): number {
  return 1 + Math.floor(distM / stepM) * inc;
}

// Ward bump scaling
function wardBump(ward: number, bump = 1.22): number {
  return Math.pow(bump, ward - 1);
}

// Enemy HP at distance
function enemyHP(baseHP: number, ward: number, distM: number): number {
  const wardMult = wardBump(ward);
  const microMult = microRamp(distM);
  return baseHP * wardMult * microMult;
}

// Upgrade cost (geometric growth)
function upgradeCost(baseCost: number, level: number, mult = 1.12): number {
  return baseCost * Math.pow(mult, level);
}

// Currency reward scaling
function arcanaReward(baseArcana: number, ward: number, distM: number): number {
  const wardMult = Math.pow(1.15, ward - 1);
  const distMult = 1 + (distM / 1000) * 0.1;
  return baseArcana * wardMult * distMult;
}
```

---

## Version History

**v1.0** (2025-10-25): Initial philosophy document

- Established 0.10 → 1.0 → 10.0 milestone system
- Defined Ward 1 as 90-120 seconds
- Set Arcana at 0.02-0.04 per kill
- Set Soul Power at 10× rarer than Arcana
- Set item drops at 2% for Ward 1

---

## Future Considerations

### Phase 2+ Balance

- Town upgrades should cost 0.50-5.00 gold (match scale)
- Lair comfort should provide 5-15% bonuses (not 50-100%)
- Research should cost 0.10-10.0 Soul Power depending on tier
- Synth materials should have similar small-scale values

### Endgame Balance

- Consider prestige/NG+ at 1000.0 milestone
- Soft cap around 10,000.0 (10K milestone)
- If numbers grow beyond 10K, consider prestige layer
- Never exceed 6-digit numbers without prestige

---

**Remember**: This is the guiding star. When in doubt, go smaller. Make players earn every 10× increase. Make 0.10 feel like an achievement.
