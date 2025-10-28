# Combat System Implementation Plan

## Draconia Chronicles - New Architecture Integration

**Date**: 2025-10-28
**Status**: Planning Phase
**Executor Approval**: PENDING

---

## Executive Summary

This document outlines the detailed plan for implementing the combat system in the new Draconia Chronicles architecture. The combat system will integrate dragon auto-attacks, enemy attacks, projectile management, collision detection, damage calculation, and death processing.

### Key Goals

1. **70-80% Auto-Combat** - Dragon automatically attacks enemies in range
2. **Enemy Attack System** - Enemies fire projectiles at dragon
3. **Collision Detection** - Accurate hitbox-based collision with pierce mechanics
4. **Death Processing** - Enemy defeat triggers arcana rewards and removal
5. **Performance** - 60fps desktop, 40fps mobile with 10+ enemies and multiple projectiles

---

## 1. CURRENT STATE ANALYSIS

### What We Have ✅

- **EnemyManager**: Spawns and moves Mantair enemies every 3 seconds
- **DragonProtagonist**: Dragon sprite with animations and movement
- **EntityManager**: Central entity coordination
- **ResponsiveManager**: Screen scaling and responsive layouts
- **UIManager**: Health bars and UI elements
- **LandManager**: Background parallax and scrolling

### What We Need ❌

- **CombatManager**: Central combat orchestration
- **ProjectileManager**: Projectile creation, tracking, and lifecycle
- **CollisionSystem**: Hitbox detection for projectiles vs entities
- **DamageSystem**: Damage calculation and application
- **RewardSystem**: Arcana/currency drops on enemy death

---

## 2. OLD SYSTEM ARCHITECTURE (scrolling-background.ts)

### Combat Loop (Every Frame)

```typescript
// Update enemy positions and check attack range
for (enemy of enemies) {
  // Move enemy left
  enemy.x -= enemySpeed * deltaTime

  // Check if in attack range of dragon
  distance = sqrt((dragon.x - enemy.x)² + (dragon.y - enemy.y)²)
  if (distance <= ENEMY_ATTACK_RANGE && currentTime - enemy.lastFireTime >= enemy.fireRate) {
    fireProjectileFromEnemy(enemy)
    enemy.lastFireTime = currentTime
  }
}

// Update projectiles
for (projectile of projectiles) {
  projectile.update(deltaTime)

  // Check collision in projectile's collision callback
  if (collisionCallback(projectile.sprite)) {
    // Apply damage
    // Mark for destruction after pierce delay (70ms)
  }
}

// Auto-attack from dragon
if (currentTime - lastDragonFireTime >= DRAGON_FIRE_RATE) {
  target = findBestTarget() // Smart targeting with killing blow prediction
  if (target) {
    fireProjectileFromDragon(target)
    lastDragonFireTime = currentTime
  }
}
```

### Key Constants

```typescript
DRAGON_ATTACK_RANGE = 1100px
DRAGON_BASE_DAMAGE = 5 HP
DRAGON_FIRE_RATE = 500ms (2 attacks/second)

ENEMY_ATTACK_RANGE = 300px
ENEMY_DAMAGE = 5 HP
ENEMY_FIRE_RATE = 2000-2500ms (variable)

PIERCE_DELAY = 70ms (projectile persists after hit)
DEATH_BLINK_DURATION = 330ms (3 blinks before removal)
```

### Collision Detection

```typescript
function checkSpriteCollision(sprite1, sprite2, enemyType?) {
  // Get bounds
  bounds1 = sprite1.getBounds();
  bounds2 = sprite2.getBounds();

  // Custom hitbox scaling (50% of sprite size for performance)
  hitboxScale = 0.5;
  hitbox1 = {
    x: bounds1.x + (bounds1.width * (1 - hitboxScale)) / 2,
    y: bounds1.y + (bounds1.height * (1 - hitboxScale)) / 2,
    width: bounds1.width * hitboxScale,
    height: bounds1.height * hitboxScale,
  };

  // AABB collision
  return (
    hitbox1.x < hitbox2.x + hitbox2.width &&
    hitbox1.x + hitbox1.width > hitbox2.x &&
    hitbox1.y < hitbox2.y + hitbox2.height &&
    hitbox1.y + hitbox1.height > hitbox2.y
  );
}
```

### Smart Targeting System

```typescript
function findBestTarget() {
  // Find closest enemy in range
  closestEnemy = findClosestInRange(DRAGON_ATTACK_RANGE)

  // If closest will die from current projectile, switch to next target
  if (calculateKillingBlow(closestEnemy)) {
    nextTarget = findNextClosestInRange(excluding: closestEnemy)
    return nextTarget || null // Don't waste projectile if no other targets
  }

  return closestEnemy
}
```

### Projectile Behavior

- **Dragon Projectiles**: Homing (track target position)
- **Enemy Projectiles**: Straight-line (fired at dragon's position at fire time)
- **Pierce Mechanic**: Projectile persists for 70ms after hit before destruction
- **Single-Hit Prevention**: `userData.hasHit` flag prevents multi-hit bugs

### Death Processing

```typescript
if (enemy.health <= 0 && !enemy.sprite.userData.isDefeated) {
  // Mark defeated
  enemy.sprite.userData.isDefeated = true;
  enemy.sprite.userData.deathTime = performance.now();

  // Award arcana (0.03 for mantair-corsair, 0.01 for swarm)
  arcanaManager.dropArcana(arcanaReward, {
    type: 'enemy_kill',
    enemyType: enemy.type,
    timestamp: Date.now(),
  });

  // Start blink animation (330ms, 3 blinks)
  // Remove after blink completes
}
```

---

## 3. NEW ARCHITECTURE DESIGN

### Component Hierarchy

```
GameStartManager
├── EntityManager
│   ├── DragonProtagonist (player entity)
│   ├── EnemyManager (enemy spawning & movement)
│   └── CombatManager (NEW - orchestrates combat)
│       ├── ProjectileManager (NEW - projectile lifecycle)
│       ├── CollisionSystem (NEW - hitbox detection)
│       └── DamageSystem (NEW - damage calculation)
├── UIManager
│   ├── HealthBarManager (entity health bars)
│   └── FloatingDamageManager (NEW - damage numbers)
└── LandManager (background)
```

### Separation of Concerns

- **CombatManager**: Orchestrates combat, triggers attacks, coordinates systems
- **ProjectileManager**: Creates, updates, destroys projectiles
- **CollisionSystem**: Pure collision detection logic (no side effects)
- **DamageSystem**: Applies damage, handles death, triggers rewards
- **EnemyManager**: Only handles spawning and movement (no combat logic)
- **DragonProtagonist**: Only handles movement and animations (no combat logic)

---

## 4. IMPLEMENTATION PHASES

### Phase 1: Core Infrastructure (Files to Create)

**Priority: CRITICAL**

#### 1.1 CollisionSystem

**File**: `apps/web/src/lib/pixi/systems/combat/collision-system.ts`

```typescript
export class CollisionSystem {
  /**
   * Check AABB collision between two sprites with custom hitbox scaling
   */
  checkSpriteCollision(sprite1: Sprite, sprite2: Sprite, hitboxScale: number = 0.5): boolean;

  /**
   * Check if point is inside sprite bounds
   */
  checkPointCollision(
    point: { x: number; y: number },
    sprite: Sprite,
    hitboxScale: number = 0.5,
  ): boolean;

  /**
   * Get hitbox bounds for a sprite
   */
  getHitbox(
    sprite: Sprite,
    scale: number,
  ): {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}
```

**Tests Needed**:

- AABB collision accuracy
- Hitbox scaling correctness
- Performance with 10+ projectiles × 10+ enemies = 100+ checks/frame

---

#### 1.2 ProjectileManager

**File**: `apps/web/src/lib/pixi/systems/combat/projectile-manager.ts`

```typescript
export interface ProjectileData {
  id: number;
  sprite: Sprite;
  animator: any;
  type: 'dragon' | 'enemy';
  projectileType: ProjectileType;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  damage: number;
  isHoming: boolean;
  hasHit: boolean;
  hitTime: number;
  pierceDelay: number; // 70ms
}

export class ProjectileManager {
  private app: Application;
  private projectiles: ProjectileData[] = [];
  private nextId = 1;
  private projectileContainer: Container;

  /**
   * Fire projectile from dragon to target
   */
  async fireDragonProjectile(
    startX: number,
    startY: number,
    targetEnemy: EnemyData,
  ): Promise<ProjectileData>;

  /**
   * Fire projectile from enemy toward dragon
   */
  async fireEnemyProjectile(
    startX: number,
    startY: number,
    targetX: number,
    targetY: number,
    enemyType: EnemyType,
  ): Promise<ProjectileData>;

  /**
   * Update all projectiles (movement, homing, cleanup)
   */
  update(deltaTime: number, dragonX: number, dragonY: number): void;

  /**
   * Get all active projectiles
   */
  getProjectiles(): readonly ProjectileData[];

  /**
   * Mark projectile for destruction after pierce delay
   */
  markForDestruction(projectile: ProjectileData): void;

  /**
   * Destroy projectile immediately
   */
  destroyProjectile(projectileId: number): void;
}
```

**Key Features**:

- Homing projectiles (dragon) track target position
- Straight-line projectiles (enemy) fire at snapshot position
- Pierce delay (70ms) before destruction
- Single-hit prevention with `hasHit` flag

---

#### 1.3 DamageSystem

**File**: `apps/web/src/lib/pixi/systems/combat/damage-system.ts`

```typescript
export interface DamageResult {
  targetId: number;
  damage: number;
  newHealth: number;
  wasDeath: boolean;
  arcanaReward?: number;
}

export class DamageSystem {
  /**
   * Apply damage to enemy and check for death
   */
  applyDamageToEnemy(enemy: EnemyData, damage: number): DamageResult;

  /**
   * Apply damage to dragon and check for defeat
   */
  applyDamageToDragon(dragon: DragonProtagonistManager, damage: number): DamageResult;

  /**
   * Process enemy death (rewards, animations, removal)
   */
  processEnemyDeath(enemy: EnemyData, enemyManager: EnemyManager): void;

  /**
   * Calculate arcana reward for enemy type
   */
  calculateArcanaReward(enemyType: EnemyType): number;
}
```

**Reward Values** (from old system):

- `mantair-corsair`: 0.03 arcana
- `swarm`: 0.01 arcana
- Death blink: 330ms (3 blinks at 100ms each)

---

#### 1.4 CombatManager

**File**: `apps/web/src/lib/pixi/systems/combat/combat-manager.ts`

```typescript
export interface CombatManagerConfig {
  dragonFireRate?: number; // 500ms
  dragonAttackRange?: number; // 1100px
  dragonBaseDamage?: number; // 5 HP
  enemyAttackRange?: number; // 300px
  enemyBaseDamage?: number; // 5 HP
}

export class CombatManager {
  private app: Application;
  private projectileManager: ProjectileManager;
  private collisionSystem: CollisionSystem;
  private damageSystem: DamageSystem;
  private config: CombatManagerConfig;

  // Combat state
  private lastDragonFireTime = 0;
  private isCombatActive = false;

  /**
   * Initialize combat systems
   */
  async initialize(): Promise<void>;

  /**
   * Start combat (enable auto-attacks)
   */
  start(): void;

  /**
   * Stop combat
   */
  stop(): void;

  /**
   * Main combat update loop
   */
  update(
    deltaTime: number,
    dragon: DragonProtagonistManager,
    enemies: readonly EnemyData[],
    enemyManager: EnemyManager,
  ): void;

  /**
   * Find best target using smart targeting
   */
  private findBestTarget(
    dragon: DragonProtagonistManager,
    enemies: readonly EnemyData[],
  ): EnemyData | null;

  /**
   * Fire dragon auto-attack
   */
  private async fireDragonAttack(
    dragon: DragonProtagonistManager,
    target: EnemyData,
  ): Promise<void>;

  /**
   * Process enemy attacks
   */
  private processEnemyAttacks(
    deltaTime: number,
    dragon: DragonProtagonistManager,
    enemies: readonly EnemyData[],
  ): void;

  /**
   * Update projectiles and check collisions
   */
  private updateProjectilesAndCollisions(
    deltaTime: number,
    dragon: DragonProtagonistManager,
    enemies: readonly EnemyData[],
    enemyManager: EnemyManager,
  ): void;
}
```

**Main Update Loop Logic**:

```typescript
update(deltaTime, dragon, enemies, enemyManager) {
  // 1. Process enemy attacks (check range, fire projectiles)
  this.processEnemyAttacks(deltaTime, dragon, enemies)

  // 2. Process dragon auto-attack (check cooldown, find target, fire)
  currentTime = performance.now()
  if (currentTime - lastDragonFireTime >= dragonFireRate) {
    target = this.findBestTarget(dragon, enemies)
    if (target) {
      await this.fireDragonAttack(dragon, target)
      lastDragonFireTime = currentTime
    }
  }

  // 3. Update projectiles and check collisions
  this.updateProjectilesAndCollisions(deltaTime, dragon, enemies, enemyManager)
}
```

---

### Phase 2: Integration (Files to Modify)

**Priority: HIGH**

#### 2.1 EntityManager

**File**: `apps/web/src/lib/pixi/systems/entity-manager.ts`

**Changes**:

```typescript
import { CombatManager } from './combat/combat-manager';

export class EntityManager {
  private combatManager: CombatManager | null = null;

  /**
   * Create and initialize combat manager
   */
  async createCombatManager(config?: CombatManagerConfig): Promise<CombatManager> {
    if (this.combatManager) return this.combatManager;

    this.combatManager = new CombatManager(this.app, this.responsiveManager, config);
    await this.combatManager.initialize();

    return this.combatManager;
  }

  /**
   * Get combat manager
   */
  getCombatManager(): CombatManager | null {
    return this.combatManager;
  }

  update(deltaTime: number): void {
    // Update dragon
    if (this.dragonProtagonist) {
      this.dragonProtagonist.update(deltaTime);
    }

    // Update enemies
    if (this.enemyManager) {
      this.enemyManager.update(deltaTime);
    }

    // Update combat (NEW)
    if (this.combatManager && this.dragonProtagonist && this.enemyManager) {
      this.combatManager.update(
        deltaTime,
        this.dragonProtagonist,
        this.enemyManager.getEnemies(),
        this.enemyManager,
      );
    }
  }

  destroy(): void {
    // Destroy combat manager
    if (this.combatManager) {
      this.combatManager.destroy();
      this.combatManager = null;
    }

    // ... rest of destroy logic
  }
}
```

#### 2.2 EnemyManager

**File**: `apps/web/src/lib/pixi/systems/enemy-manager.ts`

**Changes**: Add lastFireTime tracking

```typescript
export interface EnemyData {
  id: number;
  sprite: Sprite;
  animator: EnemyAnimator;
  x: number;
  y: number;
  type: EnemyType;
  isMoving: boolean;
  health: number;
  maxHealth: number;
  damage: number;
  speed: number;
  lastFireTime: number; // NEW - for attack cooldown
  fireRate: number; // NEW - time between attacks (2000-2500ms)
  isDefeated: boolean; // NEW - track death state
  deathTime: number; // NEW - when enemy was defeated
}

export class EnemyManager {
  /**
   * Mark enemy as defeated and start death animation
   */
  markEnemyDefeated(enemyId: number): void {
    enemy = this.enemies.find((e) => e.id === enemyId);
    if (enemy && !enemy.isDefeated) {
      enemy.isDefeated = true;
      enemy.deathTime = performance.now();
      // Start blink animation
    }
  }

  /**
   * Remove defeated enemies after blink animation (330ms)
   */
  private cleanupDefeatedEnemies(): void {
    currentTime = performance.now();
    for (i = enemies.length - 1; i >= 0; i--) {
      enemy = enemies[i];
      if (enemy.isDefeated && currentTime - enemy.deathTime >= 330) {
        this.removeEnemy(i);
      }
    }
  }

  update(deltaTime: number): void {
    // ... existing movement logic

    // Cleanup defeated enemies (NEW)
    this.cleanupDefeatedEnemies();
  }
}
```

#### 2.3 GameStartManager

**File**: `apps/web/src/lib/pixi/systems/game-start-manager.ts`

**Changes**: Initialize combat after entity creation

```typescript
async startJourney(): Promise<void> {
  // ... existing entity setup

  // Create and start enemy manager
  await this.entityManager.createEnemyManager({
    maxEnemies: 10,
    spawnInterval: 3000
  })
  const enemyManager = this.entityManager.getEnemyManager()
  if (enemyManager) {
    enemyManager.start()
  }

  // Create and start combat manager (NEW)
  await this.entityManager.createCombatManager({
    dragonFireRate: 500, // 2 attacks/second
    dragonAttackRange: 1100,
    dragonBaseDamage: 5,
    enemyAttackRange: 300,
    enemyBaseDamage: 5
  })
  const combatManager = this.entityManager.getCombatManager()
  if (combatManager) {
    combatManager.start()
  }

  // ... rest of journey setup
}
```

---

### Phase 3: UI & Polish (Files to Create/Modify)

**Priority: MEDIUM**

#### 3.1 FloatingDamageManager

**File**: `apps/web/src/lib/pixi/systems/ui/floating-damage-manager.ts`

```typescript
export class FloatingDamageManager {
  /**
   * Create floating damage number at position
   */
  createDamageNumber(damage: number, x: number, y: number, isHealing: boolean = false): void;

  /**
   * Update all floating numbers (movement, fade)
   */
  update(deltaTime: number): void;
}
```

**Animation**:

- Rise upward for 2 seconds
- Fade out over duration
- Red for damage, green for healing
- Yellow Cinzel font (from old system)

#### 3.2 Enemy Health Bars

**Integrate with existing HealthBarManager in UIManager**

**Changes needed**:

- Track enemy health bars in UIManager
- Update positions as enemies move
- Smooth health animation (500ms transition)
- Color coding: Green (>60%), Yellow (30-60%), Red (<30%)

---

## 5. PERFORMANCE CONSIDERATIONS

### Optimization Targets

- **60fps desktop** (16.67ms frame budget)
- **40fps mobile** (25ms frame budget)
- **10+ concurrent enemies**
- **20+ concurrent projectiles**

### Performance Strategies

#### 5.1 Collision Detection

```typescript
// Spatial partitioning for large enemy counts
// Only check collisions for on-screen projectiles
// Skip defeated enemies in collision checks
```

#### 5.2 Projectile Pooling

```typescript
// Pre-allocate 50 projectile objects
// Reuse instead of create/destroy
// Reduces garbage collection pressure
```

#### 5.3 Update Frequency

```typescript
// Enemy attacks: Check every frame
// Dragon attack: Check every 500ms (fire rate)
// Collision: Check every frame for active projectiles only
// Health bars: Update only when health changes
```

---

## 6. TESTING STRATEGY

### Unit Tests

- CollisionSystem: AABB accuracy, hitbox scaling
- DamageSystem: Damage calculation, death detection
- ProjectileManager: Creation, homing behavior, cleanup

### Integration Tests

- Full combat loop with dragon + 5 enemies
- Projectile hits and damage application
- Enemy death and arcana rewards
- Performance with 10 enemies + 20 projectiles

### Manual Testing Checklist

- [ ] Dragon auto-fires every 500ms
- [ ] Projectiles home to targets correctly
- [ ] Enemies fire at dragon when in range
- [ ] Collision detection works accurately
- [ ] Enemies blink and disappear on death
- [ ] Arcana rewards display correctly
- [ ] Health bars update smoothly
- [ ] 60fps maintained with 10 enemies
- [ ] No memory leaks over 5 minutes

---

## 7. SUCCESS CRITERIA

### Functional Requirements

✅ Dragon auto-attacks closest enemy in 1100px range every 500ms
✅ Enemies attack dragon when within 300px every 2-2.5 seconds
✅ Projectiles use accurate hitbox collision
✅ Enemies die after taking damage
✅ Arcana rewards awarded on death
✅ Defeated enemies blink for 330ms then disappear

### Performance Requirements

✅ 60fps on desktop with 10 enemies + 20 projectiles
✅ 40fps on mobile with 10 enemies + 20 projectiles
✅ <16.67ms frame time average
✅ No memory leaks over 10 minutes

### Quality Requirements

✅ Health bars update smoothly (500ms animation)
✅ Floating damage numbers display clearly
✅ Smart targeting switches to next target when killing blow predicted
✅ Pierce mechanic (70ms delay) prevents multi-hit bugs
✅ Single-hit prevention works correctly

---

## 8. IMPLEMENTATION ORDER

**Week 1 - Core Systems**

1. CollisionSystem (1 day)
2. ProjectileManager (2 days)
3. DamageSystem (1 day)
4. Unit tests (1 day)

**Week 2 - Combat Manager** 5. CombatManager base implementation (2 days) 6. Smart targeting system (1 day) 7. Integration with EntityManager (1 day) 8. Integration tests (1 day)

**Week 3 - Polish & Testing** 9. FloatingDamageManager (1 day) 10. Enemy health bars (1 day) 11. Death animations & blink effects (1 day) 12. Performance optimization (1 day) 13. Final testing & bug fixes (1 day)

---

## 9. RISKS & MITIGATION

### Risk 1: Performance Degradation

**Probability**: Medium
**Impact**: High
**Mitigation**:

- Profile early and often
- Implement spatial partitioning if needed
- Use object pooling for projectiles
- Limit max concurrent projectiles (50)

### Risk 2: Multi-Hit Bugs

**Probability**: High (common issue in old system)
**Impact**: High (breaks game balance)
**Mitigation**:

- Single-hit prevention with `hasHit` flag
- Pierce delay (70ms) before destruction
- Unit tests for collision edge cases

### Risk 3: Integration Complexity

**Probability**: Medium
**Impact**: Medium
**Mitigation**:

- Clear separation of concerns
- Well-defined interfaces
- Incremental integration with testing

---

## 10. QUESTIONS FOR EXECUTOR

1. **Combat Balance**: Are the current damage values (5 HP dragon damage, 5 HP enemy damage) correct? Or should we reference the GDD for different values?

2. **Elemental System**: Should we implement elemental damage types now (Fire/Ice/Lightning from GDD) or keep it simple with flat damage for Phase 1?

3. **Enemy Variety**: All enemies currently use Mantair sprite. When should we add different sprites and behaviors for swarm vs corsair?

4. **Manual Abilities**: Should we plan for the 20% manual ability damage contribution now, or focus on 100% auto-combat first?

5. **Arcana Integration**: Should arcana rewards display as floating UI elements, or integrate with the currency top bar?

6. **Testing Priority**: Which should we prioritize - unit tests for each system, or getting the full integration working first for playtesting?

---

## APPROVAL CHECKLIST

Before implementation begins, confirm:

- [ ] Architecture design approved (CombatManager, ProjectileManager, CollisionSystem, DamageSystem)
- [ ] Separation of concerns is clear
- [ ] Performance targets are realistic
- [ ] Implementation phases make sense
- [ ] Success criteria are complete
- [ ] Questions answered by Executor

---

**Executor, please review this plan and provide approval or feedback before I begin implementation.**
