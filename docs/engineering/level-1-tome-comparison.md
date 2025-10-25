# Level 1 / Ward 1 - Tome Comparison & Reconciliation

**Created**: 2025-10-25
**Purpose**: Compare Level 1 Implementation Plan vs. Tome specifications

---

## What the Tome Says

### From [04_Progression_Maps_Wards_Lands.md](../tome/04_Progression_Maps_Wards_Lands.md)

#### Ward Structure

```
Ward 1: Tutorial Plains (D0-D1)
├── Distance: 0-1000m from Draconia
├── Scaling: +1% every 5m (not 10m!)
├── Enemies: Basic units, simple AI patterns
├── Bosses: Tutorial boss with telegraph windows
└── Purpose: Onboarding, system introduction
```

**But also says**:

```
Land 1: Horizon Steppe
├── Ward 1: Sunwake Downs (D0-D0.5) — Tutorial area
└── Distance: 0-500m (shorter than 1000m!)
```

#### Ward Scaling Formula

```typescript
export function wardBump(ward: number, mult = 1, bump = 1.22) {
  return mult * Math.pow(bump, ward - 1);
}

export function microRamp(distM: number, stepM: number, inc = 0.01) {
  return 1 + Math.floor(distM / stepM) * inc;
}
```

**Key Points**:

- `inc = 0.01` means **+1% per step** (not +5% as I wrote!)
- `stepM` varies: 5m early, 10m later
- Ward bump = 1.22× multiplier per ward

---

### From [regions/01_Horizon_Steppe_Complete.md](../tome/regions/01_Horizon_Steppe_Complete.md)

#### Faction: Wind-Taken Nomads

**NOT** "Briar Stalkers" - that was from a different faction!

**Actual Enemy Roster**:

1. **Banner-Runner** (Ground, Skirmisher)
   - HP: 120 (not 110)
   - DMG: 18 (not 16)
   - Speed: 1.2 (not 1.3)
   - Cooldown: 2.8s
   - Arcana: 12 (not 10)

2. **Dust-Mane Strider** (Ground, Bruiser)
   - HP: 220
   - DMG: 32
   - Speed: 1.0
   - Cooldown: 4.5s
   - Arcana: 16

3. **Kite-Sail Corsair** (Air, Harasser)
   - HP: 95
   - DMG: 15
   - Speed: 1.1
   - Cooldown: 3.0s
   - Arcana: 11

4. **Bola Whisper** (Air, Controller)
   - HP: 80
   - DMG: 10
   - Speed: 1.0
   - Cooldown: 3.2s
   - Arcana: 10

**Boss: Heartwood Abomination** (yes, this is correct)

- HP: 1200
- DMG: 45
- Arcana: 100

---

### From [26_Content_Packs_Clans_Bestiary.md](../tome/26_Content_Packs_Clans_Bestiary.md)

#### Sunwake Downs (Ward 1)

```typescript
{
  id: 'sunwake_downs',
  name: 'Sunwake Downs',
  distanceRange: [0, 500],  // ONLY 500m, not 5000m!
  description: 'Tutorial area with gentle slopes and scattered boulders',
  visualTheme: 'golden grasslands, morning light, scattered wildflowers'
}
```

---

### From [02_Player_Experience_Overview.md](../tome/02_Player_Experience_Overview.md)

#### First Session Targets

- **30 seconds**: Player sees action (enemies spawning, combat starting)
- **5 minutes**: Player reaches 100m
- **3 minutes**: Player makes first upgrade
- **8 minutes**: Player understands Return mechanics
- **30-45 minutes**: First boss encountered
- **Return Cadence**: 2-3 returns per hour

**This implies**:

- Ward 1 (500m) should take ~15-20 minutes
- Boss fight happens AFTER Ward 1, possibly Ward 3-4

---

### From [05_Combat_Systems_Enemies_Bosses.md](../tome/05_Combat_Systems_Enemies_Bosses.md)

#### Pushback Percentage

```
Land 1: Horizon Steppe
├── Ward 1: 3% (Sunwake Downs - tutorial)
├── Ward 2: 5% (Waystone Mile - basic)
├── Ward 3: 7% (Skylark Flats - air combat)
├── Ward 4: 10% (Longgrass Reach - accuracy)
└── Ward 5: 12% (Bluewind Shelf - crosswind)
```

#### Elemental Tutorial

- **Ward 1 teaches**: Heat enemies (Fire-based)
- **Player uses**: Cold attacks (Ice, Frost, Mist)
- **Tutorial**: "Heat beats Cold, but Cold beats Energy"

---

## What I Wrote vs. What Tome Says

### Distance Discrepancy

| Category                 | My Plan      | Tome Says                                     |
| ------------------------ | ------------ | --------------------------------------------- |
| **Ward 1 Distance**      | 0-5000m      | 0-500m or 0-1000m                             |
| **"Level 1" Definition** | Full Ward 1  | Unclear - possibly just tutorial section      |
| **Duration**             | ~8.3 minutes | ~15-20 minutes (500m at 10 m/s = 50 seconds?) |

**Issue**: I made "Level 1" WAY too long (5000m). Tome suggests:

- Sunwake Downs (Ward 1) = 500m only
- Maybe I meant "all of Land 1" not "Ward 1"?

---

### Enemy Discrepancy

| Category        | My Plan                     | Tome Says                  |
| --------------- | --------------------------- | -------------------------- |
| **Enemy Type**  | Briar Stalker               | Banner-Runner (or 4 types) |
| **Faction**     | Wind-Taken Nomads (correct) | Wind-Taken Nomads ✓        |
| **Base HP**     | 110                         | 120 (Banner-Runner)        |
| **Base DMG**    | 16                          | 18 (Banner-Runner)         |
| **Arcana**      | 10                          | 12 (Banner-Runner)         |
| **Enemy Count** | 1 type                      | 4 types (2 ground, 2 air)  |

**Issue**: "Briar Stalker" doesn't exist in Wind-Taken Nomads faction.

- I may have confused it with "Thorn-Bound Covenant" faction
- Should use Banner-Runner as the basic tutorial enemy

---

### Scaling Discrepancy

| Category         | My Plan    | Tome Says                       |
| ---------------- | ---------- | ------------------------------- |
| **Micro-Ramps**  | Every 500m | Every 5m early, 10m later       |
| **Scaling Rate** | +5%        | +1% per step                    |
| **Formula**      | Custom     | `microRamp(distM, stepM, 0.01)` |

**Issue**: I made scaling way too coarse (500m intervals). Tome says:

- +1% every 5m early game
- 500m would have 100 micro-ramps!

---

### Boss Timing Discrepancy

| Category             | My Plan        | Tome Says                   |
| -------------------- | -------------- | --------------------------- |
| **Boss at End of**   | Ward 1 (5000m) | After Ward 3-4 (~30-45 min) |
| **Ward 1 has Boss?** | Yes            | Probably not for tutorial   |

---

### Currency Discrepancy

| Category       | My Plan     | Tome Says                |
| -------------- | ----------- | ------------------------ |
| **Soul Power** | 2 per kill  | NOT mentioned in Tome!   |
| **Arcana**     | 10 per kill | 12 per Banner-Runner ✓   |
| **Item Drops** | 5% chance   | NOT mentioned for Ward 1 |

**Issue**: I added Soul Power and item drops without Tome confirmation

- May be correct for later, but probably not for tutorial Ward 1

---

## Reconciliation: What Should "Level 1" Be?

### Option A: Level 1 = Sunwake Downs (Ward 1) ONLY

**Distance**: 0-500m
**Duration**: ~2-5 minutes of combat
**Enemies**: Banner-Runner only (simplest)
**Boss**: None (tutorial area)
**Currencies**: Arcana only
**End State**: Return to Draconia, unlock Ward 2

**Pros**:

- Matches Tome specification exactly
- Very focused, minimal scope
- Perfect for "first playable"

**Cons**:

- Very short
- Might feel incomplete
- Need to implement Ward 2 soon after

---

### Option B: Level 1 = All Tutorial Content (Wards 1-2)

**Distance**: 0-1000m
**Duration**: ~10-15 minutes of combat
**Enemies**: Banner-Runner (Ward 1), add more in Ward 2
**Boss**: Mini-boss at end of Ward 2
**Currencies**: Arcana only
**End State**: Return to Draconia, unlock Ward 3

**Pros**:

- More substantial first experience
- Can show ward transitions
- Better matches "30-45 min to first boss" if we add Ward 3

**Cons**:

- More complex to implement
- Still need boss mechanics

---

### Option C: Level 1 = First Boss Clear (Wards 1-4)

**Distance**: 0-2000m (Wards 1-4)
**Duration**: 30-45 minutes to first boss
**Enemies**: All 4 Wind-Taken Nomads types
**Boss**: Heartwood Abomination
**Currencies**: Arcana + Soul Power
**End State**: Return to Draconia with boss clear

**Pros**:

- Matches Tome's "first boss at 30-45 min"
- Complete arc
- Multiple wards showcase progression

**Cons**:

- Much larger scope
- Complex implementation
- Far from "minimum viable"

---

## Recommendations

### Immediate Fix: Align with Tome

1. **Rename**: "Level 1" → "Ward 1: Sunwake Downs"
2. **Distance**: 5000m → 500m
3. **Enemy**: Briar Stalker → Banner-Runner
4. **Stats**: Update to Tome values (120 HP, 18 DMG, 12 Arcana)
5. **Scaling**: 500m intervals → 5m intervals (+1% each)
6. **Currencies**: Keep Arcana only for now
7. **Boss**: Remove from Ward 1, plan for Ward 3-4

### Phased Approach

**Phase 0.5**: Fix duplicate dragon bug
**Phase 1.1**: Implement Ward 1 (Sunwake Downs) 0-500m
**Phase 1.2**: Implement Ward 2 (Waystone Mile) 500-1000m
**Phase 1.3**: Implement Ward 3-4 with first boss
**Phase 1.4**: Implement full Land 1 (all 7 wards)

### Items & Soul Power - Where Do They Come From?

**Need to search Tome for**:

- When does Soul Power start dropping?
- When do items start dropping?
- Are these Phase 1 or Phase 2+ features?

---

## Questions for User

1. **What should "Level 1" actually mean?**
   - Just Ward 1 (Sunwake Downs, 500m)?
   - Wards 1-2 (0-1000m)?
   - Or all the way to first boss (Wards 1-4)?

2. **Should we implement item drops in Ward 1?**
   - Tome doesn't mention them for tutorial
   - May be Phase 2 feature (Town system)?

3. **Should Ward 1 have Soul Power drops?**
   - Tome doesn't clearly specify when Soul Power starts
   - May only be from boss kills initially?

4. **Should we start with 1 enemy type or all 4?**
   - Banner-Runner only = simpler
   - All 4 types = more variety, better showcase

---

## Next Steps

1. **User clarifies** "Level 1" scope
2. **Update** level-1-implementation-plan.md with Tome-accurate specs
3. **Search Tome** for Soul Power and item drop specifications
4. **Proceed** with Phase 0.5 (fix duplicate dragon bug)
