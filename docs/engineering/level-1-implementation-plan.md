# Level 1 Implementation Plan

**Version**: 1.0
**Last Updated**: 2025-10-25
**Epic**: P1-E1 (Phase 1, Epic 1 - First Playable Journey)

## Overview

This document defines the **complete implementation plan for Level 1** (Ward 1 of
Horizon Steppe). Level 1 represents the **minimum viable journey** that demonstrates
the core shooter-idle loop.

**Goal**: Player experiences the complete loop:

1. Press Enter at splash screen
2. Click "Journey" button in Draconia city
3. Dragon auto-attacks enemies
4. Enemies drop Arcana + Soul Power + rare items
5. Player advances through Ward 1 (~5000m distance)
6. Journey ends, returns to Draconia

---

## Game Design Requirements (from Tome)

### From 03_ShooterIdle_Core_Loop.md

**Core Loop**:

```
Begin Journey → Auto-combat → Earn Arcana + Soul Power →
→ Continue until Ward end → Return to Draconia
```

**Performance Budgets**:

- 60 FPS desktop mandatory
- ≥40 FPS mid-range phones
- ≤200 enemies on screen (start with ≤10 for Level 1)
- ≤600 projectiles/second (start with ≤50 for Level 1)

### From 05_Combat_Systems_Enemies_Bosses_Complete.md

**Faction**: Wind-Taken Nomads (Horizon Steppe)
**Enemy Type**: Briar Stalker (Ground, Skirmisher)

```typescript
interface BriarStalker {
  baseHP: 110;
  baseDMG: 16;
  moveSpeed: 1.3; // m/s
  attackCooldown: 2.5; // seconds
  stopArc: 'short'; // Melee range
  arcana: 10;
  // NEW: soulPower and itemDropChance added
  soulPower: 2;
  itemDropChance: 0.05; // 5% = 1 in 20 kills
}
```

### From 04_Progression_Maps_Wards_Lands.md

**Ward 1 Structure**:

- Distance: 0m → 5000m
- Micro-ramps: Every 500m (slight difficulty increase)
- Ward complete at 5000m
- NO boss for Level 1 (boss is Level 2)

**Distance Progression**:

- Player "advances" automatically (idle mechanic)
- Base speed: 10 m/s (reaches 5000m in ~8.3 minutes idle)
- Dragon stays in fixed position (background scrolls)

### From 07_Economy_Currencies_Items_Market.md

**Currencies**:

- **Arcana**: Run currency, geometric growth ×1.12
- **Soul Power**: Meta currency, growth ×1.90
- **Gold**: From item sales (Level 1: just track, no spending yet)

**Items**:

- Rare drops from enemies (5% chance)
- Common rarity only for Level 1
- Base value: 5-15 gold
- NO item sales yet (that's Town system in Phase 2)

---

## Step-by-Step Flow

### Step 0: Game Start (Already Implemented ✅)

**Flow**:

1. User opens game
2. Splash screen shows (fade in, hold 2s, fade out)
3. Draconia city menu shows
4. "Journey" button visible and clickable

**Systems Used**:

- GameStartManager ✅
- SplashScreenManager ✅
- DraconiaMenuManager ✅
- AssetManager ✅
- ResponsiveManager ✅

**Status**: ✅ Complete

---

### Step 1: Journey Initialization

**User Action**: Click "Journey" button

**What Happens**:

1. DraconiaMenuManager detects button click
2. GameStartManager.startJourney() called
3. Systems initialized in order:
   - MigrationAdapter (shared systems)
   - LandManager (background only)
   - EntityManager (NEW)
   - CombatManager
   - ProgressionManager
   - CurrencyManager
   - ItemManager
   - EnemySpawnManager
   - ProjectileManager
   - UIManager
4. EntityManager creates dragon protagonist
5. HealthBarManager creates dragon health bar
6. LandManager loads Horizon Steppe background
7. ProgressionManager sets distance = 0, ward = "ward1_steppe"
8. UIManager shows HUD (Arcana: 0, Soul Power: 0, Distance: 0/5000)
9. Journey update loop starts

**Systems Needed**:

- EntityManager 🚧 (CREATE)
- CombatManager 📋 (REFACTOR)
- ProgressionManager 📋 (CREATE)
- CurrencyManager 📋 (CREATE)
- ItemManager 📋 (CREATE)
- EnemySpawnManager 📋 (CREATE)
- ProjectileManager 📋 (CREATE)
- UIManager 📋 (CREATE)
- FactionManager 📋 (CREATE)

**Acceptance Criteria**:

- ✅ Draconia menu fades out
- ✅ Horizon Steppe background visible
- ✅ Dragon visible at fixed position (x: 150, y: 300)
- ✅ Dragon health bar visible above dragon
- ✅ HUD shows: Arcana (0), Soul Power (0), Distance (0m / 5000m)
- ✅ No errors in console
- ✅ 60 FPS maintained

---

### Step 2: Enemy Spawning

**Trigger**: Journey active, elapsed time > 3s

**What Happens**:

1. EnemySpawnManager checks: shouldSpawnEnemy()
2. FactionManager provides enemy type: "briar_stalker"
3. EnemySpawnManager calculates spawn position (right edge of screen, random Y)
4. EntityManager.spawnEnemy("briar_stalker", position) called
5. Enemy sprite created and added to stage
6. HealthBarManager creates enemy health bar
7. Enemy AI starts: move towards dragon at speed 1.3 m/s
8. Repeat every 3-5 seconds (random interval)
9. Max 10 enemies on screen at once

**Enemy AI (Simple)**:

```typescript
// Briar Stalker AI (melee attacker)
class BriarStalkerAI {
  update(deltaTime: number) {
    const dragon = entityManager.getDragonProtagonist();
    const distanceToDragon = calculateDistance(this.position, dragon.position);

    if (distanceToDragon > MELEE_RANGE) {
      // Move towards dragon
      this.moveTowards(dragon.position, this.moveSpeed * deltaTime);
    } else {
      // In range, attack on cooldown
      if (this.attackCooldownRemaining <= 0) {
        this.attack(dragon);
        this.attackCooldownRemaining = 2.5; // Reset cooldown
      }
    }

    // Update cooldown
    this.attackCooldownRemaining -= deltaTime;
  }
}
```

**Systems Needed**:

- EnemySpawnManager 📋
- FactionManager 📋
- EntityManager 🚧
- HealthBarManager ✅

**Acceptance Criteria**:

- ✅ First enemy spawns after ~3 seconds
- ✅ Enemy sprite visible on right side of screen
- ✅ Enemy health bar visible above enemy
- ✅ Enemy moves towards dragon at correct speed
- ✅ Max 10 enemies on screen
- ✅ Enemies spawn at consistent rate (3-5s intervals)
- ✅ 60 FPS maintained with 10 enemies

---

### Step 3: Dragon Auto-Attack

**Trigger**: Enemy enters dragon's attack range

**What Happens**:

1. CombatManager detects enemy in range (checking distance every frame)
2. Dragon's auto-attack cooldown checked (1.5s cooldown for Level 1)
3. If ready, ProjectileManager.createProjectile() called
4. Fireball sprite created at dragon's mouth position
5. Fireball moves towards enemy at projectile speed (500 px/s)
6. ProjectileManager checks collision every frame
7. On hit:
   - CombatManager.dealDamage(dragon, enemy, damage) called
   - Enemy HP reduced
   - HealthBarManager updates enemy health bar
   - FloatingDamageManager shows damage number
   - Projectile returned to pool

**Dragon Stats (Level 1)**:

```typescript
interface DragonStats {
  attackDamage: 25; // Base damage
  attackSpeed: 1.5; // Seconds between attacks
  attackRange: 400; // Pixels
  projectileSpeed: 500; // Pixels per second
}
```

**Projectile Behavior**:

- Simple linear movement
- Despawns on hit or off-screen
- Pooled (max 50 projectiles)

**Systems Needed**:

- CombatManager 📋
- ProjectileManager 📋
- HealthBarManager ✅
- FloatingDamageManager ✅

**Acceptance Criteria**:

- ✅ Dragon auto-attacks nearest enemy
- ✅ Fireball projectile visible and animated
- ✅ Projectile hits enemy and despawns
- ✅ Enemy health bar updates correctly
- ✅ Damage number floats up from enemy
- ✅ Attack cooldown works (1.5s between attacks)
- ✅ 60 FPS maintained with projectiles

---

### Step 4: Enemy Death & Rewards

**Trigger**: Enemy HP reaches 0

**What Happens**:

1. CombatManager detects enemy.hp <= 0
2. CombatManager.handleEntityDeath(enemyId) called
3. Death rewards calculated:
   - Arcana: 10 (from enemy definition)
   - Soul Power: 2 (from enemy definition)
   - Item drop: 5% chance
4. CurrencyManager.earnArcana(10) called
5. CurrencyManager.earnSoulPower(2) called
6. UIManager updates currency displays
7. If item drop:
   - ItemManager.generateRandomItem(level: 1) called
   - Item popup shows (simple text notification)
   - Item added to inventory array
8. Enemy sprite removed from stage
9. HealthBarManager removes enemy health bar
10. EntityManager.despawnEnemy(enemyId) called

**Item Generation (Level 1)**:

```typescript
interface RandomItemPool {
  names: ['Worn Leather', 'Rusty Dagger', 'Old Coin', 'Torn Cloth', 'Cracked Gem', 'Bent Fork'];
  rarity: 'common'; // Only common for Level 1
  valueRange: [5, 15]; // Random between 5-15 gold
}

function generateRandomItem(): Item {
  return {
    id: generateUUID(),
    name: randomFromArray(names),
    rarity: 'common',
    baseValue: randomInt(5, 15),
    iconPath: '/items/common/placeholder.png', // Use placeholder for Level 1
  };
}
```

**Systems Needed**:

- CombatManager 📋
- CurrencyManager 📋
- ItemManager 📋
- UIManager 📋
- HealthBarManager ✅
- EntityManager 🚧

**Acceptance Criteria**:

- ✅ Enemy despawns when HP reaches 0
- ✅ Arcana increases by 10
- ✅ Soul Power increases by 2
- ✅ Currency displays update correctly
- ✅ ~5% of kills drop items (1 in 20)
- ✅ Item notification shows with name and value
- ✅ Items stored in inventory (can verify in console)
- ✅ No memory leaks (entities properly cleaned up)

---

### Step 5: Distance Progression

**Trigger**: Journey active, time passes

**What Happens**:

1. ProgressionManager.update(deltaTime) called every frame
2. Distance advances automatically: distance += baseSpeed \* deltaTime
3. Base speed: 10 m/s (idle progression)
4. UIManager updates distance bar: "Distance: 1234m / 5000m"
5. Every 500m (micro-ramp):
   - Enemy HP increases by 5%
   - Enemy damage increases by 5%
   - Arcana reward increases by 5%
   - Console log: "Micro-ramp reached: 500m"
6. At 5000m:
   - ProgressionManager.isWardComplete() returns true
   - Journey end triggered

**Micro-Ramp Formula**:

```typescript
function getScalingMultiplier(distance: number): number {
  const ramp = Math.floor(distance / 500);
  return Math.pow(1.05, ramp); // 5% increase per 500m
}

// Apply to enemy stats on spawn
enemy.hp = baseHP * getScalingMultiplier(currentDistance);
enemy.damage = baseDMG * getScalingMultiplier(currentDistance);
enemy.arcanaReward = baseArcana * getScalingMultiplier(currentDistance);
```

**Systems Needed**:

- ProgressionManager 📋
- UIManager 📋
- EnemySpawnManager 📋 (reads scaling multiplier)

**Acceptance Criteria**:

- ✅ Distance advances automatically at 10 m/s
- ✅ Distance bar updates smoothly
- ✅ Micro-ramps trigger at 500m, 1000m, 1500m, etc.
- ✅ Enemy stats increase at micro-ramps
- ✅ Player can observe enemies getting tougher
- ✅ Journey completes at 5000m

---

### Step 6: Journey End & Return to Draconia

**Trigger**: Distance >= 5000m

**What Happens**:

1. ProgressionManager detects isWardComplete() = true
2. CombatManager.endCombat() called
3. EnemySpawnManager stops spawning
4. All active enemies finish current actions (don't despawn mid-combat)
5. UI shows "Ward 1 Complete!" message
6. After 2 seconds:
   - Journey systems stop updating
   - "Return to Draconia" button appears
7. User clicks "Return to Draconia"
8. Stats summary shows:
   - Total distance: 5000m
   - Enemies defeated: X
   - Arcana earned: Y (kept on return)
   - Soul Power earned: Z (kept on return)
   - Items collected: W
9. Fade to black
10. GameStartManager transitions back to Draconia menu
11. Currency values persist (Arcana + Soul Power)
12. Items persist in inventory

**Journey End Screen (Simple)**:

```
╔════════════════════════════════╗
║      WARD 1 COMPLETE!          ║
╠════════════════════════════════╣
║  Distance Traveled: 5000m      ║
║  Enemies Defeated: 42          ║
║  Arcana Earned: 420            ║
║  Soul Power Earned: 84         ║
║  Items Found: 2                ║
╠════════════════════════════════╣
║   [Return to Draconia]         ║
╚════════════════════════════════╝
```

**Systems Needed**:

- ProgressionManager 📋
- CombatManager 📋
- UIManager 📋
- CurrencyManager 📋
- ItemManager 📋
- GameStartManager ✅

**Acceptance Criteria**:

- ✅ Journey ends at exactly 5000m
- ✅ "Ward 1 Complete!" message displays
- ✅ Stats summary accurate
- ✅ Return button clickable
- ✅ Smooth transition back to Draconia
- ✅ Currencies persist (visible in console for now)
- ✅ Items persist (can verify in console)
- ✅ User can start new journey with "Continue" option

---

## UI/UX Specifications (Level 1)

### HUD Layout

```
╔═══════════════════════════════════════════════════════════╗
║  [Distance: 1234m / 5000m]           Arcana: 420  SP: 84 ║
╠═══════════════════════════════════════════════════════════╣
║                                                            ║
║     🐉                          👹                         ║
║    Dragon                     Enemy                        ║
║   [HP Bar]                  [HP Bar]                       ║
║                                                            ║
║                      💥 -25                                ║
║                                                            ║
╚═══════════════════════════════════════════════════════════╝
```

**HUD Elements**:

1. **Top Bar**:
   - Distance progress bar (center)
   - Arcana counter (top-right)
   - Soul Power counter (top-right)

2. **Combat Area**:
   - Dragon sprite (left, fixed position)
   - Dragon health bar (above dragon)
   - Enemy sprites (right, moving left)
   - Enemy health bars (above enemies)
   - Projectiles (fireballs)
   - Floating damage numbers

3. **No Buttons** (for Level 1):
   - Auto-combat only
   - No manual abilities yet
   - No pause button yet

### Visual Style

**Colors** (from Horizon Steppe palette):

- Background: Soft yellow-green plains (#B8C77C)
- Sky: Pale blue (#C8D9E6)
- Dragon: Red with green wings
- Enemies: Brown/green (Briar Stalkers)
- UI: Dark green panels (#2C4A2A)
- Arcana: Gold (#FFD700)
- Soul Power: Purple (#9B59B6)

**Fonts** (from 21_UI_UX_Design_Standards.md):

- Primary: "Cinzel" (serif, fantasy)
- Secondary: "Lato" (sans-serif, readable)
- Damage numbers: "Cinzel" bold

---

## Technical Implementation Order

### Phase 0.5: Fix Current Bug (FIRST)

**Goal**: Remove duplicate dragon, fix health bars

**Tasks**:

1. Create EntityManager class
2. Refactor GameStartManager:
   - Remove lines 260-261 (duplicate dragon creation)
   - Add EntityManager initialization
   - Delegate dragon creation to EntityManager
3. Refactor LandManager:
   - Remove lines 61 + 89 (dragon creation and enterLand)
   - Keep ONLY background/terrain management
4. Update DragonProtagonistManager:
   - Remove internal health bar (lines 271-310)
   - Keep sprite and animation only
5. Wire up HealthBarManager:
   - Create dragon health bar in GameStartManager.startJourney()
   - Update position in update loop

**Estimated Time**: 2-3 hours

---

### Phase 1.1: Core Systems Setup

**Goal**: Initialize all needed managers (empty implementations)

**Tasks**:

1. Create empty manager classes:
   - CombatManager (refactor existing)
   - ProgressionManager
   - CurrencyManager
   - ItemManager
   - EnemySpawnManager
   - ProjectileManager
   - UIManager
   - FactionManager
2. Define TypeScript interfaces for all data types
3. Wire up manager dependencies in GameStartManager
4. Test: Managers initialize without errors

**Estimated Time**: 4-6 hours

---

### Phase 1.2: Enemy Spawning

**Goal**: Enemies spawn and move towards dragon

**Tasks**:

1. Implement FactionManager:
   - Define Briar Stalker enemy
   - Load enemy stats from definition
2. Implement EnemySpawnManager:
   - Spawn logic (every 3-5s)
   - Max 10 enemies
   - Spawn position calculation
3. Implement enemy AI:
   - Move towards dragon
   - Stop at melee range
4. Create enemy sprite and animation
5. Test: Enemies spawn, move, and stop at dragon

**Estimated Time**: 6-8 hours

---

### Phase 1.3: Combat System

**Goal**: Dragon attacks enemies, enemies die

**Tasks**:

1. Implement CombatManager:
   - Detect enemies in range
   - Trigger auto-attacks
   - Calculate damage
   - Handle death
2. Implement ProjectileManager:
   - Create fireball projectiles
   - Projectile movement
   - Collision detection
   - Object pooling
3. Wire up FloatingDamageManager (already exists)
4. Test: Dragon kills enemies, damage numbers show

**Estimated Time**: 8-10 hours

---

### Phase 1.4: Rewards & Progression

**Goal**: Enemies drop Arcana, Soul Power, and items; distance advances

**Tasks**:

1. Implement CurrencyManager:
   - Track Arcana and Soul Power
   - Earn currency on kill
2. Implement ItemManager:
   - Random item generation
   - Inventory storage
   - Item drop logic (5% chance)
3. Implement ProgressionManager:
   - Distance advancement (10 m/s)
   - Micro-ramps (every 500m)
   - Ward completion detection
4. Test: Currencies increase, items drop rarely, distance advances

**Estimated Time**: 6-8 hours

---

### Phase 1.5: UI Implementation

**Goal**: HUD shows all relevant info

**Tasks**:

1. Implement UIManager:
   - Arcana counter (top-right)
   - Soul Power counter (top-right)
   - Distance bar (top-center)
   - Item pickup notification
2. Style UI elements with Draconia theme
3. Test: UI updates correctly, readable, no overlap

**Estimated Time**: 4-6 hours

---

### Phase 1.6: Journey End & Return

**Goal**: Journey completes at 5000m, returns to Draconia

**Tasks**:

1. Implement journey completion logic:
   - Detect ward complete
   - Stop combat
   - Show completion screen
2. Implement stats summary:
   - Calculate totals
   - Display in UI
3. Implement return flow:
   - "Return to Draconia" button
   - Fade transition
   - Currency persistence
4. Test: Complete flow from journey start to return

**Estimated Time**: 4-6 hours

---

### Phase 1.7: Polish & Balance

**Goal**: Game feels good, difficulty is right

**Tasks**:

1. Balance tuning:
   - Enemy spawn rate
   - Dragon damage
   - Enemy HP
   - Currency rewards
   - Item drop rate
2. Visual polish:
   - Smooth animations
   - Particle effects (optional)
   - Screen shake on hits (optional)
3. Audio (optional for Level 1):
   - Background music
   - Attack sounds
   - Enemy death sounds
4. Performance optimization:
   - Profile with DevTools
   - Optimize update loops
   - Reduce draw calls
5. Bug fixes
6. Playtesting

**Estimated Time**: 8-12 hours

---

## Total Estimated Time

**Conservative Estimate**: 42-59 hours (~1-1.5 weeks full-time)

**Aggressive Estimate**: 30-40 hours (~0.75-1 week full-time)

---

## Testing Checklist

### Step 0: Game Start ✅

- [ ] Splash screen shows and fades correctly
- [ ] Draconia menu appears
- [ ] Journey button clickable
- [ ] No console errors
- [ ] 60 FPS maintained

### Step 1: Journey Initialization

- [ ] Journey starts on button click
- [ ] Background loads correctly
- [ ] Dragon appears at correct position
- [ ] Dragon health bar visible
- [ ] HUD shows correct initial values (0, 0, 0m)
- [ ] No console errors
- [ ] 60 FPS maintained

### Step 2: Enemy Spawning

- [ ] First enemy spawns after ~3 seconds
- [ ] Enemies spawn at consistent rate
- [ ] Max 10 enemies on screen
- [ ] Enemies have health bars
- [ ] Enemies move towards dragon
- [ ] Enemies stop at melee range
- [ ] 60 FPS with 10 enemies

### Step 3: Dragon Auto-Attack

- [ ] Dragon attacks nearest enemy
- [ ] Projectile visible and animated
- [ ] Projectile hits enemy
- [ ] Damage number appears
- [ ] Enemy health bar updates
- [ ] Attack cooldown works
- [ ] 60 FPS with projectiles

### Step 4: Enemy Death & Rewards

- [ ] Enemy despawns at 0 HP
- [ ] Arcana increases by correct amount
- [ ] Soul Power increases by correct amount
- [ ] Currency UI updates
- [ ] ~5% of kills drop items
- [ ] Item notification shows
- [ ] Items stored in inventory
- [ ] No memory leaks

### Step 5: Distance Progression

- [ ] Distance advances automatically
- [ ] Distance bar updates smoothly
- [ ] Micro-ramps trigger at 500m intervals
- [ ] Enemy stats increase at micro-ramps
- [ ] Noticeable difficulty increase
- [ ] Journey completes at 5000m

### Step 6: Journey End & Return

- [ ] Journey stops at 5000m
- [ ] Completion message shows
- [ ] Stats summary accurate
- [ ] Return button works
- [ ] Smooth transition to Draconia
- [ ] Currencies persist
- [ ] Items persist
- [ ] Can start new journey

---

## Success Criteria (Definition of Done)

Level 1 is complete when:

1. ✅ **Core Loop Works**: Start → Combat → Kill enemies → Earn rewards → Complete ward → Return
2. ✅ **Two Currencies**: Arcana and Soul Power earned and tracked
3. ✅ **Item Drops**: Rare items drop and stored in inventory
4. ✅ **Distance Progression**: Auto-advances to 5000m with micro-ramps
5. ✅ **Combat Feel**: Dragon attacks feel responsive, enemies die satisfyingly
6. ✅ **Performance**: 60 FPS on desktop, 40+ FPS on mid-range phone
7. ✅ **No Critical Bugs**: No crashes, no console errors, no memory leaks
8. ✅ **Completable**: Can complete full loop 3+ times without issues
9. ✅ **Documented**: All managers documented in registry
10. ✅ **Tested**: All checklist items pass

---

## What's NOT in Level 1

These features are intentionally deferred to later levels:

- ❌ Boss fight (Ward 1 boss is Level 2)
- ❌ Manual abilities (Phase 1, after Level 1)
- ❌ Multiple enemy types (Level 2+)
- ❌ Enemy projectiles (Level 2+)
- ❌ Item selling (Town system, Phase 2)
- ❌ Enchantments (After Level 1)
- ❌ Tech tree (Phase 3)
- ❌ Save/load (Level 2+)
- ❌ Offline progression (Level 2+)
- ❌ Audio (optional, can add later)
- ❌ Particle effects (optional, can add later)

---

## Next Steps After Level 1

Once Level 1 is complete and tested:

1. **Level 2: Ward 1 Boss**
   - Add boss encounter at end of Ward 1
   - Boss mechanics and phases
   - Boss rewards

2. **Enchantment System**
   - Spend Arcana to level nodes
   - First enchant: "Ember Potency" (increase dragon damage)
   - Geometric cost scaling (×1.12)

3. **Save System**
   - Persist currencies between sessions
   - Persist inventory
   - Persist enchantment levels

4. **Polish Pass**
   - Audio integration
   - Particle effects
   - Screen shake
   - Better animations

---

**Remember**: Level 1 is about proving the core loop works. Don't add features that
aren't critical to that goal. Keep it simple, make it work, then iterate.
