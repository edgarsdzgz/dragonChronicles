# Combat & Performance Critical Fixes - Implementation Plan

**Date**: 2025-01-XX
**Status**: Planning Phase
**Priority**: CRITICAL - Game-breaking issues

---

## Critical Issues Identified

1. ✅ **Profile attachment cut width** - COMPLETED (32% cut)
2. 🔴 **Ground not scaling correctly with F12 dev tools open**
3. 🔴 **Performance lag/chugging when journey starts**
4. 🔴 **Enemy damage too high** (3-hit kill)
5. 🔴 **Dragon HP too low**
6. 🔴 **Death sequence missing** (should take 4-5 seconds)
7. 🔴 **No visual feedback when enemies are hit** (should blink)
8. 🔴 **Arcana not being awarded** when enemies defeated

---

## Issue 1: ✅ Profile Attachment Cut Width (COMPLETED)

**Status**: ✅ FIXED

**Changes Made**:
- Cut percentage: 30% → 32%
- Gem position: 518px → 534px
- Text position: 548px → 564px
- Both simple and extended attachments updated

---

## Issue 2: 🔴 Ground Scaling with F12 Open

### **Problem**
When F12 dev tools are open, the ground appears "underground" - scaling incorrectly.

### **Root Cause**
Likely the responsive manager is not recalculating when viewport changes due to dev tools.

### **Investigation Steps**
```typescript
// Check responsive-manager.ts
// 1. Is resize event firing when F12 opens/closes?
// 2. Is game world scale recalculated correctly?
// 3. Are ground/land layers using the correct scale?
```

### **Files to Check**
- `apps/web/src/lib/pixi/systems/responsive-manager.ts`
- `apps/web/src/lib/pixi/systems/land-manager.ts`
- `apps/web/src/lib/pixi/scrolling-background.ts`

### **Expected Fix**
```typescript
// responsive-manager.ts
private handleResize = (): void => {
  this.updateDimensions();
  this.updateGameWorldScale();

  // Emit resize event to all systems
  this.app.emit('resize', {
    width: this.screenWidth,
    height: this.screenHeight,
    scale: this.gameWorldScale
  });
};

// land-manager.ts - listen for resize
this.app.on('resize', ({ scale }) => {
  this.updateGroundPosition(scale);
});
```

---

## Issue 3: 🔴 Performance Lag/Chugging at Journey Start

### **Problem**
Game lags when journey starts and enemies spawn. Should handle many enemies and projectiles smoothly.

### **Performance Profiling Needed**

**Step 1: Add Performance Monitoring**
```typescript
// At journey start
console.time('journeyStart');
console.time('enemySpawn');
console.time('firstFrame');

// Track metrics
performance.mark('journey-start');
performance.mark('first-enemy-spawn');
performance.mark('first-render-complete');
```

**Step 2: Check Object Pooling**
```typescript
// Verify pools are being used:
// - Enemy pool (should reuse enemy instances)
// - Projectile pool (should reuse projectile instances)
// - Particle pool (if particles exist)
```

**Step 3: Check Texture Loading**
```typescript
// Are textures loaded before journey starts?
// Or are they loading on-demand during gameplay?

// Expected: All textures pre-loaded in Assets.load()
await Assets.load([
  '/sprites/dragon.svg',
  '/sprites/enemy1.svg',
  '/sprites/projectile.svg',
  // ... all sprites
]);
```

### **Likely Causes**
1. ❌ Textures loading on-demand instead of pre-loaded
2. ❌ Object pools not initialized before spawn
3. ❌ Too many draw calls (not batching sprites)
4. ❌ Ticker running update before ready

### **Performance Targets**
- **Enemy spawn**: < 1ms per enemy
- **Projectile spawn**: < 0.5ms per projectile
- **Frame time**: < 16.67ms (60fps)
- **Startup lag**: < 500ms total

---

## Issue 4 & 5: 🔴 Combat Balance (Enemy Damage & Dragon HP)

### **Current Values** (BROKEN)
```typescript
// Current (enemies kill dragon in 3 hits)
dragon.maxHP = 100; // Too low
dragon.currentHP = 100;
enemy.damage = 33; // Too high (3-hit kill)
```

### **Proposed Balance**
```typescript
// NEW BALANCE:
dragon.maxHP = 500;        // 5x current
dragon.currentHP = 500;
enemy.damage = 10;         // Reduced by 70% (50-hit kill instead of 3)

// OR more forgiving:
dragon.maxHP = 1000;       // 10x current
dragon.currentHP = 1000;
enemy.damage = 20;         // Reduced by 40% (50-hit kill)
```

### **Where to Change**
```typescript
// File: packages/sim/src/combat/combat-state.ts OR dragon-protagonist.ts

// Dragon HP initialization
this.maxHP = 1000;  // Increase from 100
this.currentHP = 1000;

// Enemy damage (wherever enemies deal damage)
const damage = 20;  // Reduce from 33 or current value
dragon.takeDamage(damage);
```

### **Testing**
- Verify dragon survives reasonable combat duration (30-60 seconds minimum)
- Enemies should still feel threatening but not instant-kill
- Player should have time to react and use abilities

---

## Issue 6: 🔴 Death/Defeat Sequence (CRITICAL)

### **Required Sequence** (4-5 seconds total)

**Step 1: HP Hits Zero** (0ms)
```typescript
if (dragon.currentHP <= 0) {
  this.startDeathSequence();
}
```

**Step 2: Stop at Idle Sprite** (0-100ms)
```typescript
// Dragon animation stops at 'idle' frame
dragon.stopAnimation();
dragon.setFrame('idle');

// Journey progress paused
journeyManager.pause();

// Pause button should be visually selected
pauseButton.setSelected(true);
```

**Step 3: Blink Defeated Animation** (100ms - 1000ms)
```typescript
// Dragon blinks (fade in/out several times)
// Duration: ~900ms (3 blinks @ 300ms each)
await this.blinkSprite(dragon, {
  duration: 900,
  blinks: 3,
  onComplete: () => {
    // Destroy all enemies and projectiles
    this.destroyAllCombatEntities();
  }
});

// During blink:
// - Destroy all enemies
// - Destroy all projectiles
// - Clear enemy spawn queue
```

**Step 4: HP Refills & Distance Penalty** (1000ms - 3500ms)
```typescript
// Duration: 2.5 seconds
// HP refills from 0 → 100% smoothly
// Distance pushed back by 5% simultaneously

const refillDuration = 2500; // ms
const startHP = 0;
const targetHP = dragon.maxHP;
const startDistance = currentDistance;
const targetDistance = currentDistance * 0.95; // 5% penalty

// Animate over time
let elapsed = 0;
const animate = (delta: number) => {
  elapsed += delta;
  const progress = Math.min(1, elapsed / refillDuration);
  const eased = easeOutCubic(progress); // Smooth easing

  // Update HP
  dragon.currentHP = startHP + (targetHP - startHP) * eased;

  // Update distance
  currentDistance = startDistance + (targetDistance - startDistance) * eased;

  if (progress >= 1) {
    // Animation complete, move to step 5
    this.resumeAfterDeath();
  }
};
```

**Step 5: Resume Flying Animation** (3500ms - 4000ms)
```typescript
// Resume flying animation
dragon.resumeAnimation('fly');

// Unpause journey
journeyManager.resume();

// Deselect pause button
pauseButton.setSelected(false);

// Combat resumes (enemies can spawn again)
enemyManager.resumeSpawning();
```

### **Implementation Architecture**

```typescript
class DeathSequenceManager {
  private isPlaying: boolean = false;
  private currentStep: number = 0;

  async startDeathSequence(dragon: Dragon, journeyManager: JourneyManager): Promise<void> {
    if (this.isPlaying) return; // Prevent multiple sequences

    this.isPlaying = true;
    this.currentStep = 1;

    try {
      // Step 1: Stop everything
      await this.stopDragon(dragon);
      await this.pauseJourney(journeyManager);

      // Step 2: Blink and destroy enemies
      await this.blinkAndDestroy(dragon);

      // Step 3: Refill HP and penalize distance
      await this.refillAndPenalize(dragon, journeyManager);

      // Step 4: Resume
      await this.resume(dragon, journeyManager);

    } finally {
      this.isPlaying = false;
      this.currentStep = 0;
    }
  }

  private async stopDragon(dragon: Dragon): Promise<void> {
    dragon.stopAnimation();
    dragon.setFrame('idle');
    // Return immediately (synchronous)
  }

  private async pauseJourney(journeyManager: JourneyManager): Promise<void> {
    journeyManager.pause();
    journeyManager.pauseButton.setSelected(true);
    // Return immediately (synchronous)
  }

  private async blinkAndDestroy(dragon: Dragon): Promise<void> {
    // Blink for 900ms (3 blinks)
    return new Promise((resolve) => {
      const blinkCount = 3;
      const blinkDuration = 300; // ms per blink
      let currentBlink = 0;

      const blinkInterval = setInterval(() => {
        // Toggle visibility
        dragon.sprite.alpha = dragon.sprite.alpha === 1 ? 0.3 : 1;

        currentBlink++;
        if (currentBlink >= blinkCount * 2) { // *2 for on/off cycles
          clearInterval(blinkInterval);
          dragon.sprite.alpha = 1; // Reset to visible

          // Destroy all combat entities
          enemyManager.destroyAll();
          projectileManager.destroyAll();

          resolve();
        }
      }, blinkDuration / 2); // Blink twice per duration
    });
  }

  private async refillAndPenalize(dragon: Dragon, journeyManager: JourneyManager): Promise<void> {
    return new Promise((resolve) => {
      const duration = 2500; // 2.5 seconds
      const startTime = Date.now();
      const startHP = 0;
      const targetHP = dragon.maxHP;
      const startDistance = journeyManager.distanceFromHome;
      const targetDistance = startDistance * 0.95; // 5% penalty

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / duration);
        const eased = this.easeOutCubic(progress);

        // Update HP
        dragon.currentHP = startHP + (targetHP - startHP) * eased;

        // Update distance
        journeyManager.distanceFromHome = startDistance + (targetDistance - startDistance) * eased;

        if (progress >= 1) {
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }

  private async resume(dragon: Dragon, journeyManager: JourneyManager): Promise<void> {
    dragon.resumeAnimation('fly');
    journeyManager.resume();
    journeyManager.pauseButton.setSelected(false);
    enemyManager.resumeSpawning();
    // Return immediately (synchronous)
  }

  private easeOutCubic(t: number): number {
    return 1 - Math.pow(1 - t, 3);
  }
}
```

---

## Issue 7: 🔴 Enemy Hit Feedback (Blink on Hit)

### **Problem**
No visual feedback when enemy is hit - unclear if projectile connected.

### **Expected Behavior**
Enemy should blink ONCE when hit by projectile (white flash).

### **Implementation**

```typescript
// In enemy damage handler
onHit(damage: number): void {
  // Apply damage
  this.currentHP -= damage;

  // Visual feedback: Blink white once
  this.blinkOnHit();

  // Check if dead
  if (this.currentHP <= 0) {
    this.onDeath();
  }
}

private blinkOnHit(): void {
  // Store original tint
  const originalTint = this.sprite.tint;

  // Flash white
  this.sprite.tint = 0xFFFFFF;

  // Return to original after 100ms
  setTimeout(() => {
    this.sprite.tint = originalTint;
  }, 100);
}

// OR using PixiJS ticker for smoother animation:
private blinkOnHit(): void {
  const originalTint = this.sprite.tint;
  const blinkDuration = 100; // ms
  let elapsed = 0;

  const blinkTicker = (delta: number) => {
    elapsed += delta * 16.67; // Convert to ms

    if (elapsed < blinkDuration / 2) {
      // First half: fade to white
      const progress = elapsed / (blinkDuration / 2);
      this.sprite.tint = this.lerpColor(originalTint, 0xFFFFFF, progress);
    } else if (elapsed < blinkDuration) {
      // Second half: fade back to original
      const progress = (elapsed - blinkDuration / 2) / (blinkDuration / 2);
      this.sprite.tint = this.lerpColor(0xFFFFFF, originalTint, progress);
    } else {
      // Done
      this.sprite.tint = originalTint;
      this.app.ticker.remove(blinkTicker);
    }
  };

  this.app.ticker.add(blinkTicker);
}

private lerpColor(color1: number, color2: number, t: number): number {
  const r1 = (color1 >> 16) & 0xFF;
  const g1 = (color1 >> 8) & 0xFF;
  const b1 = color1 & 0xFF;

  const r2 = (color2 >> 16) & 0xFF;
  const g2 = (color2 >> 8) & 0xFF;
  const b2 = color2 & 0xFF;

  const r = Math.round(r1 + (r2 - r1) * t);
  const g = Math.round(g1 + (g2 - g1) * t);
  const b = Math.round(b1 + (b2 - b1) * t);

  return (r << 16) | (g << 8) | b;
}
```

### **Where to Implement**
- `apps/web/src/lib/pixi/systems/enemy-manager.ts` - enemy hit handling
- OR `packages/sim/src/enemies/enemy-pool.ts` - if damage logic is in sim

---

## Issue 8: 🔴 Arcana Not Being Awarded (CRITICAL)

### **Problem**
Enemies defeated but no arcana awarded to player. **Pivotal to the game.**

### **Investigation Steps**

**Step 1: Check if arcana is calculated**
```typescript
// When enemy dies, is arcana value calculated?
onEnemyDeath(enemy: Enemy): void {
  const arcanaReward = this.calculateArcanaReward(enemy);
  console.log('🎯 Enemy died, arcana reward:', arcanaReward);

  // Is this being called?
  this.awardArcana(arcanaReward);
}
```

**Step 2: Check if arcana is being added to player state**
```typescript
awardArcana(amount: number): void {
  console.log('💰 Adding arcana:', amount, 'Current:', this.playerState.arcana);
  this.playerState.arcana += amount;
  console.log('💰 New total:', this.playerState.arcana);

  // Is this being called?
  // Is the value updating?
}
```

**Step 3: Check if UI is updating**
```typescript
// Is the UI listening for arcana changes?
// Is the currency display updating?

// Expected flow:
// 1. Enemy dies
// 2. Calculate arcana reward
// 3. Add to player state
// 4. Emit event: this.app.emit('arcana-changed', newAmount)
// 5. UI listens and updates display
```

### **Expected Implementation**

```typescript
// File: combat-integration-system.ts or enemy-manager.ts

onEnemyDeath(enemy: Enemy): void {
  // Calculate arcana reward (base value * tier multiplier)
  const baseArcana = 10; // Base arcana per enemy
  const tierMultiplier = 1.0; // Increases with player tier
  const arcanaReward = Math.floor(baseArcana * tierMultiplier);

  // Award to player
  this.playerState.currencies.arcana += arcanaReward;

  // Emit event for UI update
  this.app.emit('currency-changed', {
    arcana: this.playerState.currencies.arcana,
    gold: this.playerState.currencies.gold
  });

  // Optional: Show floating text for feedback
  this.showFloatingText(`+${arcanaReward} Arcana`, enemy.x, enemy.y);

  // Log for debugging
  console.log(`💰 Arcana awarded: +${arcanaReward} (Total: ${this.playerState.currencies.arcana})`);
}
```

### **Files to Check**
1. `apps/web/src/lib/pixi/systems/enemy-manager.ts` - enemy death handling
2. `apps/web/src/lib/pixi/systems/combat/combat-integration-system.ts` - combat rewards
3. `apps/web/src/lib/pixi/systems/top-bar-ui.ts` - currency display
4. `packages/sim/src/combat/death-processing-system.ts` - death processing

### **Testing Checklist**
- [ ] Enemy death triggers arcana calculation
- [ ] Arcana value is correct (base * multiplier)
- [ ] Player state arcana increases
- [ ] UI display updates in real-time
- [ ] Arcana persists (doesn't reset)
- [ ] Multiple enemy deaths accumulate correctly

---

## Implementation Priority

### **Phase 1: Critical Gameplay Fixes** (Do First)
1. ✅ **Attachment cut width** - DONE
2. 🔴 **Arcana awards** - CRITICAL, game-breaking
3. 🔴 **Combat balance** (HP/damage) - CRITICAL, game-breaking
4. 🔴 **Enemy hit feedback** - CRITICAL for game feel

**Estimated Time**: 2-3 hours

### **Phase 2: Death Sequence** (Complex)
5. 🔴 **Death sequence** - Complex, multi-step implementation

**Estimated Time**: 4-6 hours

### **Phase 3: Performance & Polish**
6. 🔴 **Performance lag** - Requires profiling and optimization
7. 🔴 **Ground scaling** - Responsive manager fix

**Estimated Time**: 2-4 hours

---

## Total Estimated Time

- **Phase 1**: 2-3 hours (CRITICAL, do first)
- **Phase 2**: 4-6 hours (important, do second)
- **Phase 3**: 2-4 hours (polish, do third)

**Total**: 8-13 hours of focused development

---

## Next Steps

**Immediate Actions**:
1. ✅ Cut width adjustment (DONE)
2. 🔴 **Investigate arcana system** - Add debug logging to trace flow
3. 🔴 **Balance combat** - Increase dragon HP, reduce enemy damage
4. 🔴 **Add enemy hit feedback** - Blink on hit

**User Approval Needed**:
- Confirm balance values (dragon HP, enemy damage)
- Confirm death sequence timing (4-5 seconds acceptable?)
- Confirm arcana reward formula (base amount, tier multipliers)

**Ready to proceed with Phase 1 fixes?**
