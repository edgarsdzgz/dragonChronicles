// Enemy MVP 1.1 - Core Enemy System per CTO Spec
import { Decimal } from '$lib/num/decimal';
import { telemetry } from './telemetry';
import { loadEnemyConfig } from './config/loadEnemyConfig';

// Enemy states per spec Task A
export type EnemyState = 'spawning' | 'advance' | 'inRange' | 'dead';

// Enemy types (MVP: just basicShooter)
export type EnemyType = 'basicShooter';

// Core enemy instance
export interface Enemy {
  id: string;
  type: EnemyType;
  state: EnemyState;
  
  // Position and movement
  x: number;
  y: number;
  targetStopX: number;
  targetStopY: number;
  
  // Speed (includes jitter and reverse scaling)
  ownSpeedX: number;
  
  // Combat stats
  maxHP: Decimal;
  currentHP: Decimal;
  damage: Decimal;
  
  // Attack timing
  lastFireTime: number;
  nextFireDelay: number;
  
  // Land context
  spawnLand: number;
  spawnDistance: Decimal;
  
  // Visual state
  hpBarVisible: boolean;
  hpBarHideTimer: number;
}

// Projectile system
export interface Projectile {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  side: 'player' | 'enemy';
  spawnTime: number;
  lifetime: number;
  chainHitsRemaining: number; // For player projectiles
}

// Damage number system
export interface DamageNumber {
  id: string;
  x: number;
  y: number;
  amount: string;
  color: string;
  spawnTime: number;
  offsetX: number;
  offsetY: number;
  
  // Animation properties
  scale?: number;
  opacity?: number;
}

// Configuration interface
export interface EnemyConfig {
  spawning: {
    basicShooter: {
      meanIntervalSec: number;
      minDeltaSec: number;
      maxDeltaSec: number;
    };
  };
  movement: {
    ownSpeedX_px_per_s: number;
    jitterPercent: number;
    reverseSpawnSpeedScale: number;
    reverseAdvanceScale_outOfRange: number;
    attackRangeFrac_ofCombatWidth: number;
    arrivalEpsilon_px: number;
  };
  projectiles: {
    enemy: {
      speed_px_per_s: number;
      lifetimeSec: number;
      fireIntervalMinSec: number;
      fireIntervalMaxSec: number;
    };
    player: {
      chainHitsMax: number;
    };
  };
  caps: {
    enemies: number;
    projectiles: number;
    damageNumbers: number;
  };
  scaling: {
    hpAcrossLandsMul: number;
    dmgAcrossLandsMul: number;
    withinLandEndRatio: number;
    withinLandStepMeters: number;
    baseHP_atLand1_formula: string;
    baseDmg_atLand1_formula: string;
  };
  bossLand10: {
    hpMultVsEndOfLand: number;
    dmgMultVsEndOfLand: number;
    burstShots: number;
    burstGapMs: number;
    fireIntervalMinSec: number;
    fireIntervalMaxSec: number;
  };
  ui: {
    enemyHpBar: {
      visibleOnlyWhenDamaged: boolean;
      color: string;
      thicknessPx: number;
      widthPctOfEnemy: number;
      hideDelayAtFullSec: number;
    };
    damageNumbers: {
      popScale: number;
      floatUpPx: number;
      fadeDurationSec: number;
      offsetJitterX: number;
      offsetJitterY: number;
      playerHitColor: string;
      enemyHitColor: string;
      maxDotHz: number;
    };
  };
}

// Object pools per spec Task A
class ObjectPool<T> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  
  constructor(createFn: () => T, resetFn: (obj: T) => void) {
    this.createFn = createFn;
    this.resetFn = resetFn;
  }
  
  acquire(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }
  
  release(obj: T): void {
    this.resetFn(obj);
    this.pool.push(obj);
  }
  
  getPoolSize(): number {
    return this.pool.length;
  }
}

// Poisson scheduler per spec §1.1
export class PoissonScheduler {
  private lambda: number;
  private minDelta: number;
  private maxDelta: number;
  private nextSpawnTime: number = 0;
  
  constructor(meanIntervalSec: number, minDeltaSec: number, maxDeltaSec: number) {
    this.lambda = 1.0 / meanIntervalSec;
    this.minDelta = minDeltaSec * 1000; // Convert to ms
    this.maxDelta = maxDeltaSec * 1000;
    this.scheduleNext();
  }
  
  private scheduleNext(): void {
    // Poisson: Δt = max(minΔ, min(maxΔ, -ln(U) / λ))
    const u = Math.random();
    const poissonDelta = -Math.log(u) / this.lambda;
    const clampedDelta = Math.max(this.minDelta / 1000, Math.min(this.maxDelta / 1000, poissonDelta));
    this.nextSpawnTime = Date.now() + (clampedDelta * 1000);
  }
  
  shouldSpawn(): boolean {
    if (Date.now() >= this.nextSpawnTime) {
      this.scheduleNext();
      return true;
    }
    return false;
  }
  
  // For performance throttling per spec
  adjustMeanInterval(factor: number): void {
    this.lambda = this.lambda / factor; // Increase interval = decrease lambda
  }
}

// Main enemy system
export class EnemySystem {
  private config: EnemyConfig | null = null;
  private isInitialized = false;
  
  // Active objects
  private enemies: Enemy[] = [];
  private projectiles: Projectile[] = [];
  private damageNumbers: DamageNumber[] = [];
  
  // Object pools
  private enemyPool: ObjectPool<Enemy>;
  private projectilePool: ObjectPool<Projectile>;
  private damageNumberPool: ObjectPool<DamageNumber>;
  
  // Spawning
  private scheduler: PoissonScheduler | null = null;
  private bossSpawned = false;
  private bossEnemy: Enemy | null = null;
  private regularSpawnsDisabled = false;
  
  // Game state
  private combatWidth = 800; // Will be updated from UI
  private combatHeight = 200;
  private dragonX = 80;
  private dragonY = 100;
  private playerIsReversing = false;
  private playerIsTraveling = false;
  private currentLand = 1;
  private currentDistance = new Decimal(0);
  
  // Performance monitoring
  private fpsDropStartTime = 0;
  
  // Event callbacks
  private onBossDeathCallback: (() => void) | null = null;
  
  constructor() {
    // Initialize object pools
    this.enemyPool = new ObjectPool(
      () => this.createEnemy(),
      (enemy) => this.resetEnemy(enemy)
    );
    
    this.projectilePool = new ObjectPool(
      () => this.createProjectile(),
      (projectile) => this.resetProjectile(projectile)
    );
    
    this.damageNumberPool = new ObjectPool(
      () => this.createDamageNumber(),
      (damageNumber) => this.resetDamageNumber(damageNumber)
    );
  }
  
  async initialize(): Promise<void> {
    try {
      // 🚨 CRITICAL FIX: Try to load config, use fallback if failed
      let config: EnemyConfig;
      
      try {
        config = await loadEnemyConfig();
        console.log('✅ Loaded enemy config from /enemy-config.json');
      } catch (fetchError) {
        console.warn('⚠️ Config fetch failed, using embedded fallback:', fetchError);
        
        // Embedded fallback config to avoid blocking initialization
        config = {
          spawning: {
            basicShooter: {
              meanIntervalSec: 1.8,
              minDeltaSec: 0.6,
              maxDeltaSec: 3.5
            }
          },
          movement: {
            ownSpeedX_px_per_s: 140,
            attackRangeFrac_ofCombatWidth: 0.28,
            jitterPercent: 0.2,
            reverseSpawnSpeedScale: 0.9,
            reverseAdvanceSpeedScale: 0.75,
            overlapTolerancePx: 5,
            arrivalEpsilonPx: 2,
            arrivalJigglePx: 6
          },
          projectiles: {
            enemy: {
              speedPx_per_s: 480,
              lifetimeSec: 2.5,
              fireIntervalMinSec: 0.85,
              fireIntervalMaxSec: 1.35
            },
            player: {
              speedPx_per_s: 600,
              lifetimeSec: 2.0,
              chainHitsMax: 1
            }
          },
          scaling: {
            hp: {
              baseL1_fracOfPlayerDamage: 2.3,
              geometricGrowthPerLand: 1.18,
              withinLandEndRatio: 0.85,
              withinLandStepMeters: 5
            },
            damage: {
              baseL1_fracOfPlayerHP: 0.08,
              geometricGrowthPerLand: 1.12,
              withinLandEndRatio: 0.85,
              withinLandStepMeters: 5
            }
          },
          ui: {
            hpBars: {
              widthFracOfEnemy: 0.7,
              heightPx: 4,
              showOnDamageOnlySec: 1.2,
              colorHex: '#ffeb3b'
            },
            damageNumbers: {
              popScalePercent: 120,
              popDurationMs: 120,
              floatHeightPx: 20,
              fadeOutSec: 2.2,
              offsetLimitMs: 250,
              offsetXPx: 8,
              offsetYPx: 6,
              colorPlayerDamage: '#ffffff',
              colorEnemyDamage: '#ff4444'
            }
          },
          bossLand10: {
            hpMultVsEndOfLand: 2.8,
            dmgMultVsEndOfLand: 2.0,
            fireIntervalMinSec: 0.8,
            fireIntervalMaxSec: 1.2,
            burstShotCount: 2,
            burstShotGapMs: 150
          },
          caps: {
            enemies: 48,
            projectiles: 160,
            damageNumbers: 120
          },
          performance: {
            fpsThrottleThreshold: 55,
            fpsThrottleDurationMs: 1000,
            throttleSpawnRateFactor: 0.5
          }
        };
      }
      
      this.config = config;
      
      // Initialize Poisson scheduler
      const basicShooterConfig = this.config.spawning.basicShooter;
      this.scheduler = new PoissonScheduler(
        basicShooterConfig.meanIntervalSec,
        basicShooterConfig.minDeltaSec,
        basicShooterConfig.maxDeltaSec
      );
      
      this.isInitialized = true;
      console.log('🎯 Enemy system initialized successfully');
      
    } catch (error) {
      console.error('❌ Critical: Enemy system initialization failed:', error);
      throw error;
    }
  }
  
  // Object creation functions
  private createEnemy(): Enemy {
    return {
      id: '',
      type: 'basicShooter',
      state: 'spawning',
      x: 0,
      y: 0,
      targetStopX: 0,
      targetStopY: 0,
      ownSpeedX: 0,
      maxHP: new Decimal(0),
      currentHP: new Decimal(0),
      damage: new Decimal(0),
      lastFireTime: 0,
      nextFireDelay: 0,
      spawnLand: 1,
      spawnDistance: new Decimal(0),
      hpBarVisible: false,
      hpBarHideTimer: 0
    };
  }
  
  private createProjectile(): Projectile {
    return {
      id: '',
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      side: 'enemy',
      spawnTime: 0,
      lifetime: 0,
      chainHitsRemaining: 0
    };
  }
  
  private createDamageNumber(): DamageNumber {
    return {
      id: '',
      x: 0,
      y: 0,
      amount: '',
      color: '',
      spawnTime: 0,
      offsetX: 0,
      offsetY: 0
    };
  }
  
  // Object reset functions
  private resetEnemy(enemy: Enemy): void {
    enemy.state = 'spawning';
    enemy.currentHP = new Decimal(0);
    enemy.hpBarVisible = false;
    enemy.hpBarHideTimer = 0;
  }
  
  private resetProjectile(projectile: Projectile): void {
    projectile.chainHitsRemaining = 0;
  }
  
  private resetDamageNumber(damageNumber: DamageNumber): void {
    damageNumber.amount = '';
    damageNumber.color = '';
  }
  
  // Public getters for rendering
  getEnemies(): readonly Enemy[] {
    return this.enemies;
  }
  
  getProjectiles(): readonly Projectile[] {
    return this.projectiles;
  }
  
  getDamageNumbers(): readonly DamageNumber[] {
    return this.damageNumbers;
  }
  
  isReady(): boolean {
    return this.isInitialized && this.config !== null;
  }
  
  // Update game state from external systems
  updateGameState(
    combatWidth: number,
    combatHeight: number,
    dragonX: number,
    dragonY: number,
    playerIsReversing: boolean,
    playerIsTraveling: boolean,
    currentLand: number,
    currentDistance: Decimal
  ): void {
    this.combatWidth = combatWidth;
    this.combatHeight = combatHeight;
    this.dragonX = dragonX;
    this.dragonY = dragonY;
    this.playerIsReversing = playerIsReversing;
    this.playerIsTraveling = playerIsTraveling;
    this.currentLand = currentLand;
    this.currentDistance = currentDistance;
  }
  
  // Main update loop
  update(deltaTimeMs: number): void {
    if (!this.isReady()) return;
    
    // Update all systems
    this.updateSpawning();
    this.updateEnemyMovement(deltaTimeMs);
    this.updateEnemyHPBars(deltaTimeMs);
    this.updateProjectiles(deltaTimeMs);
    this.updateDamageNumbers(deltaTimeMs);
    this.updateEnemyAttacks();
  }
  
  private updateSpawning(): void {
    if (!this.scheduler || !this.config) return;
    
    // 🚨 CRITICAL FIX: Only spawn enemies when player is actively traveling
    if (!this.playerIsTraveling) {
      return; // No spawning when stopped/hovering
    }
    
    // Check if we should spawn boss (Land 10, mid-land per spec §8)
    if (this.currentLand === 10 && !this.bossSpawned) {
      const landProgress = this.getLandProgress(this.currentDistance, this.currentLand);
      
      // Spawn boss at 50% of Land 10 distance per spec §8
      if (landProgress >= 0.5) {
        this.spawnBoss();
        this.regularSpawnsDisabled = true; // Stop regular spawns per spec §8
        return;
      }
    }
    
    // Regular spawning (disabled if boss is active)
    if (!this.regularSpawnsDisabled && 
        this.scheduler.shouldSpawn() && 
        this.enemies.length < this.config.caps.enemies) {
      this.spawnEnemy('basicShooter');
    }
  }
  
  /**
   * Spawn Land 10 boss per spec §8
   */
  private spawnBoss(): void {
    if (!this.config || this.bossSpawned) return;
    
    const enemy = this.enemyPool.acquire();
    enemy.id = `boss_land10_${Date.now()}`;
    enemy.type = 'basicShooter'; // Use basicShooter as base for MVP
    enemy.state = 'spawning';
    
    // Position boss in center-right of spawn area
    enemy.x = this.combatWidth + 32;
    enemy.y = this.combatHeight / 2;
    
    // Boss has no speed jitter or reverse scaling
    enemy.ownSpeedX = this.config.movement.ownSpeedX_px_per_s;
    
    // Calculate boss stats per spec §8
    const bossStats = this.calculateBossStats(this.currentLand, this.currentDistance);
    enemy.maxHP = bossStats.hp;
    enemy.currentHP = bossStats.hp;
    enemy.damage = bossStats.damage;
    
    // Boss attack timing (different from regular enemies per spec §8)
    const bossConfig = this.config.bossLand10;
    enemy.nextFireDelay = this.randomBetween(
      bossConfig.fireIntervalMinSec * 1000,
      bossConfig.fireIntervalMaxSec * 1000
    );
    enemy.lastFireTime = Date.now();
    
    // Context
    enemy.spawnLand = this.currentLand;
    enemy.spawnDistance = this.currentDistance;
    
    this.enemies.push(enemy);
    this.bossEnemy = enemy;
    this.bossSpawned = true;
    
    // Telemetry
    telemetry.logBossSpawn();
    
    console.log('🐉 Boss spawned for Land 10!', {
      hp: bossStats.hp.toString(),
      damage: bossStats.damage.toString()
    });
  }
  
  /**
   * Get progress through current land (0.0 to 1.0)
   */
  private getLandProgress(totalDistance: Decimal, land: number): number {
    // TODO: Integrate with actual distance system
    // For now, approximate based on land distance
    const landDistanceKm = this.getLandDistanceKm(land);
    const metersIntoLand = this.getMetersIntoLand(totalDistance, land);
    
    return Math.min(1.0, metersIntoLand / (landDistanceKm * 1000));
  }
  
  private spawnEnemy(type: EnemyType): void {
    if (!this.config) return;
    
    const enemy = this.enemyPool.acquire();
    enemy.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    enemy.type = type;
    enemy.state = 'spawning';
    
    // Position per spec §1.2: right 18% band, random Y
    enemy.x = this.combatWidth + 32; // Off-screen buffer
    enemy.y = Math.random() * this.combatHeight;
    
    // Speed with jitter per spec §2.4
    const baseSpeed = this.config.movement.ownSpeedX_px_per_s;
    const jitter = 1 + (Math.random() - 0.5) * 2 * this.config.movement.jitterPercent;
    enemy.ownSpeedX = baseSpeed * jitter;
    
    // Apply reverse spawn scaling per spec §2.4
    if (this.playerIsReversing) {
      enemy.ownSpeedX *= this.config.movement.reverseSpawnSpeedScale;
    }
    
    // Calculate HP and damage based on current position
    enemy.maxHP = this.calculateEnemyHP(type, this.currentLand, this.currentDistance);
    enemy.currentHP = enemy.maxHP;
    enemy.damage = this.calculateEnemyDamage(type, this.currentLand, this.currentDistance);
    
    // Attack timing
    const fireConfig = this.config.projectiles.enemy;
    enemy.nextFireDelay = this.randomBetween(
      fireConfig.fireIntervalMinSec * 1000,
      fireConfig.fireIntervalMaxSec * 1000
    );
    enemy.lastFireTime = Date.now();
    
    // Context
    enemy.spawnLand = this.currentLand;
    enemy.spawnDistance = this.currentDistance;
    
    this.enemies.push(enemy);
    
    // 🚨 CTO DEBUG: Track spawn rate
    this.spawnCount++;
    const now = Date.now();
    const deltaSeconds = (now - this.lastSpawnTime) / 1000;
    if (deltaSeconds > 0) {
      this.spawnsPerSecond = this.spawnsPerSecond * 0.9 + (1.0 / deltaSeconds) * 0.1; // EWMA
    }
    this.lastSpawnTime = now;
    
    // Telemetry
    telemetry.logEnemySpawn(type, this.currentLand, enemy.x, enemy.y);
    
    console.log(`🚨 SPAWN DEBUG: Enemy spawned at (${enemy.x}, ${enemy.y}), traveling: ${this.playerIsTraveling}`);
  }
  
  private updateEnemyMovement(deltaTimeMs: number): void {
    if (!this.config) return;
    
    // Track world scroll speed for relative movement per spec §2.1
    const worldScrollSpeedX = this.calculateWorldScrollSpeed(); // Positive = leftward scroll
    
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      
      // Calculate target stop position per spec §2.3 - Arc Formation
      const dx = this.dragonX - enemy.x;
      const dy = this.dragonY - enemy.y;
      const distToDragon = Math.sqrt(dx * dx + dy * dy);
      
      if (distToDragon > 0) {
        // Normalize direction vector from enemy to dragon
        const nx = dx / distToDragon;
        const ny = dy / distToDragon;
        
        // Calculate attack range per spec: attackRangePx = attackRangeFrac * combatWidth
        const attackRange = this.config.movement.attackRangeFrac_ofCombatWidth * this.combatWidth;
        
        // Target stop point: S = dragon + (-v * attackRangePx)
        // This forms a circle around the dragon at attack range
        enemy.targetStopX = this.dragonX - nx * attackRange;
        enemy.targetStopY = this.dragonY - ny * attackRange;
      }
      
      // Check distance to target stop position
      const distToStop = Math.sqrt(
        (enemy.x - enemy.targetStopX) ** 2 + (enemy.y - enemy.targetStopY) ** 2
      );
      
      // State transition logic per spec §2.3
      if (distToStop <= this.config.movement.arrivalEpsilon_px) {
        // Arrived at attack range - switch to attack state
        if (enemy.state !== 'inRange') {
          enemy.state = 'inRange';
          
          // Apply arrival jiggle per spec §2.5 to prevent stacking
          const jiggleY = this.randomBetween(-6, 6);
          enemy.y += jiggleY;
          
          // Ensure enemy stays within combat bounds after jiggle
          enemy.y = Math.max(0, Math.min(this.combatHeight, enemy.y));
          
          // Check for overlap tolerance per spec §2.5
          this.resolveOverlapConflicts(enemy);
        }
      } else {
        // Still advancing toward target
        if (enemy.state !== 'advance') {
          enemy.state = 'advance';
        }
        
        // Calculate movement speed per spec §2.1 & §2.2
        let totalSpeedX = worldScrollSpeedX + enemy.ownSpeedX;
        
        // Apply reverse scaling per spec §2.2
        if (this.playerIsReversing) {
          // Out-of-range enemies advance slower during reverse
          totalSpeedX = worldScrollSpeedX + (enemy.ownSpeedX * this.config.movement.reverseAdvanceScale_outOfRange);
        }
        
        // Calculate movement vector toward stop position
        const moveSpeed = (totalSpeedX * deltaTimeMs) / 1000;
        
        if (distToStop > 0) {
          const moveX = (enemy.targetStopX - enemy.x) / distToStop * moveSpeed;
          const moveY = (enemy.targetStopY - enemy.y) / distToStop * moveSpeed;
          
          enemy.x += moveX;
          enemy.y += moveY;
        }
      }
      
      // Handle in-range behavior during reverse per spec §2.2
      if (enemy.state === 'inRange' && this.playerIsReversing) {
        // In-range enemies hold position (prevents kiting)
        // No additional movement applied
      }
      
      // Bounds checking - remove enemies that go too far off-screen
      if (enemy.x < -100 || enemy.x > this.combatWidth + 100) {
        this.despawnEnemy(enemy, 'offscreen');
      }
    }
  }
  
  /**
   * Calculate world scroll speed based on player movement per spec §2.1
   */
  private calculateWorldScrollSpeed(): number {
    // TODO: Get actual player speed from game state
    // For now, simulate based on travel state
    const basePlayerSpeed = 44; // 44 m/s = 0.044 km/s from worker spec
    
    if (this.playerIsReversing) {
      return -basePlayerSpeed; // Negative = rightward scroll when reversing
    } else {
      return basePlayerSpeed; // Positive = leftward scroll when advancing
    }
  }
  
  /**
   * Resolve overlap conflicts per spec §2.5
   * Enemies can overlap up to (full overlap - 5px)
   */
  private resolveOverlapConflicts(newEnemy: Enemy): void {
    const minSeparation = 5; // Must differ by ≥5px in either X or Y
    
    for (const existingEnemy of this.enemies) {
      if (existingEnemy.id === newEnemy.id || existingEnemy.state === 'dead') continue;
      
      const dx = Math.abs(newEnemy.x - existingEnemy.x);
      const dy = Math.abs(newEnemy.y - existingEnemy.y);
      
      // Check if too close (less than 5px separation in both axes)
      if (dx < minSeparation && dy < minSeparation) {
        // Apply small random offset to separate them
        const offsetX = this.randomBetween(-6, 6);
        const offsetY = this.randomBetween(-6, 6);
        
        newEnemy.x += offsetX;
        newEnemy.y += offsetY;
        
        // Ensure enemy stays within combat bounds
        newEnemy.x = Math.max(0, Math.min(this.combatWidth, newEnemy.x));
        newEnemy.y = Math.max(0, Math.min(this.combatHeight, newEnemy.y));
        
        // Only apply one separation per arrival
        break;
      }
    }
  }
  
  /**
   * Remove enemy from active list and return to pool
   */
  private despawnEnemy(enemy: Enemy, reason: 'killed' | 'offscreen' | 'reset'): void {
    // Check if this is the boss being killed
    const isBossKilled = (enemy === this.bossEnemy && reason === 'killed');
    
    // Remove from active enemies
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
    
    // Handle boss death per spec §8
    if (isBossKilled) {
      this.handleBossDeath();
    }
    
    // Log telemetry
    if (reason === 'killed') {
      const overkill = enemy.currentHP.lt(0) ? enemy.currentHP.abs().toString() : '0';
      telemetry.logEnemyDeath(enemy.type, 'player', overkill);
      
      if (isBossKilled) {
        telemetry.logBossDeath();
      }
    } else if (reason === 'offscreen') {
      telemetry.logEnemyDeath(enemy.type, 'offscreen', '0');
    }
    
    // Clear boss reference if this was the boss
    if (enemy === this.bossEnemy) {
      this.bossEnemy = null;
    }
    
    // Return to pool
    this.enemyPool.release(enemy);
  }
  
  /**
   * Handle boss death per spec §8
   * "spawn 'YOU WIN!' dialog; pause spawns; stop distance; show 'Return to Draconia' button"
   */
  private handleBossDeath(): void {
    console.log('🎉 Boss defeated! YOU WIN!');
    
    // Stop all spawns and disable distance progression
    this.regularSpawnsDisabled = true;
    
    // Trigger YOU WIN dialog
    if (this.onBossDeathCallback) {
      this.onBossDeathCallback();
    }
  }
  
  /**
   * Update enemy HP bar visibility per spec §6
   */
  private updateEnemyHPBars(deltaTimeMs: number): void {
    if (!this.config) return;
    
    const hpBarConfig = this.config.ui.enemyHpBar;
    
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      
      // Check if enemy is at full HP and should hide bar per spec §6
      if (enemy.currentHP.gte(enemy.maxHP) && enemy.hpBarVisible) {
        // Start hide timer if not already started
        if (enemy.hpBarHideTimer === 0) {
          enemy.hpBarHideTimer = Date.now();
        }
        
        // Check if hide delay has elapsed
        const hideDelay = hpBarConfig.hideDelayAtFullSec * 1000;
        if (Date.now() - enemy.hpBarHideTimer >= hideDelay) {
          enemy.hpBarVisible = false;
          enemy.hpBarHideTimer = 0;
        }
      } else if (enemy.currentHP.lt(enemy.maxHP)) {
        // Enemy is damaged, ensure bar is visible and reset timer
        enemy.hpBarVisible = hpBarConfig.visibleOnlyWhenDamaged;
        enemy.hpBarHideTimer = 0;
      }
    }
  }
  
  private updateProjectiles(deltaTimeMs: number): void {
    if (!this.config) return;
    
    const now = Date.now();
    
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      
      // Check lifetime per spec §3.1
      const age = (now - projectile.spawnTime) / 1000;
      if (age >= projectile.lifetime) {
        this.despawnProjectile(projectile, 'timeout');
        continue;
      }
      
      // Move projectile
      const deltaS = deltaTimeMs / 1000;
      projectile.x += projectile.vx * deltaS;
      projectile.y += projectile.vy * deltaS;
      
      // Check bounds for culling per spec §9.4
      if (projectile.x < -32 || projectile.x > this.combatWidth + 32 || 
          projectile.y < -32 || projectile.y > this.combatHeight + 32) {
        this.despawnProjectile(projectile, 'offscreen');
        continue;
      }
      
      // Collision detection per spec §4
      if (projectile.side === 'enemy') {
        // Enemy projectile hitting dragon
        if (this.checkProjectileDragonCollision(projectile)) {
          // Find the enemy that fired this to get damage amount
          const damage = this.calculateProjectileDamage(projectile);
          this.damagePlayer(damage);
          this.despawnProjectile(projectile, 'hit');
        }
      } else if (projectile.side === 'player') {
        // Player projectile hitting enemies
        const hitResult = this.checkProjectileEnemyCollisions(projectile);
        if (hitResult) {
          const { enemy, killed, overkill } = hitResult;
          
          // Handle chain hits per spec §3.1
          if (killed && projectile.chainHitsRemaining > 0) {
            projectile.chainHitsRemaining--;
            
            // Continue along same path to look for next enemy
            // Projectile continues its trajectory
          } else {
            // No more chain hits or enemy survived
            this.despawnProjectile(projectile, 'hit');
          }
        }
      }
    }
  }
  
  /**
   * Check if projectile collides with dragon using circle collision per spec §4.2
   */
  private checkProjectileDragonCollision(projectile: Projectile): boolean {
    const dragonRadius = 24; // Dragon hitbox radius (half of 48px sprite)
    const dx = projectile.x - this.dragonX;
    const dy = projectile.y - this.dragonY;
    const distSq = dx * dx + dy * dy;
    
    return distSq <= dragonRadius * dragonRadius;
  }
  
  /**
   * Check if player projectile hits any enemy using line-circle collision per spec §4.2
   */
  private checkProjectileEnemyCollisions(projectile: Projectile): { enemy: Enemy; killed: boolean; overkill: Decimal } | null {
    const projectileRadius = 2; // Small projectile radius
    
    for (const enemy of this.enemies) {
      if (enemy.state === 'dead') continue;
      
      const enemyRadius = 12; // Enemy hitbox radius
      const dx = projectile.x - enemy.x;
      const dy = projectile.y - enemy.y;
      const distSq = dx * dx + dy * dy;
      const combinedRadius = projectileRadius + enemyRadius;
      
      if (distSq <= combinedRadius * combinedRadius) {
        // Calculate damage (TODO: get from player stats)
        const damage = this.calculatePlayerProjectileDamage();
        const result = this.damageEnemy(enemy.id, damage);
        
        return {
          enemy,
          killed: result.killed,
          overkill: result.overkill
        };
      }
    }
    
    return null;
  }
  
  /**
   * Calculate projectile damage from enemy attacks
   */
  private calculateProjectileDamage(projectile: Projectile): Decimal {
    // TODO: Get actual damage from the enemy that fired this
    // For now, use base enemy damage
    return new Decimal(10);
  }
  
  /**
   * Calculate player projectile damage
   */
  private calculatePlayerProjectileDamage(): Decimal {
    // TODO: Get actual player damage from enchants/stats
    // For now, use base player damage
    return new Decimal(15);
  }
  
  /**
   * Remove projectile from active list and return to pool
   */
  private despawnProjectile(projectile: Projectile, reason: 'hit' | 'timeout' | 'offscreen'): void {
    const index = this.projectiles.indexOf(projectile);
    if (index !== -1) {
      this.projectiles.splice(index, 1);
    }
    
    telemetry.logProjectileDespawn(reason);
    this.projectilePool.release(projectile);
  }
  
  /**
   * Spawn enemy projectile per spec §3.1
   */
  private spawnEnemyProjectile(enemy: Enemy): void {
    if (!this.config || this.projectiles.length >= this.config.caps.projectiles) {
      return; // At cap, skip spawn
    }
    
    const projectile = this.projectilePool.acquire();
    projectile.id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    projectile.side = 'enemy';
    projectile.x = enemy.x;
    projectile.y = enemy.y;
    
    // Calculate velocity toward dragon per spec §3.1
    const dx = this.dragonX - enemy.x;
    const dy = this.dragonY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      const speed = this.config.projectiles.enemy.speed_px_per_s;
      projectile.vx = (dx / dist) * speed;
      projectile.vy = (dy / dist) * speed;
    }
    
    projectile.spawnTime = Date.now();
    projectile.lifetime = this.config.projectiles.enemy.lifetimeSec;
    projectile.chainHitsRemaining = 0; // Enemy projectiles don't chain
    
    this.projectiles.push(projectile);
    telemetry.logProjectileSpawn('enemy');
  }
  
  /**
   * Spawn player projectile (called externally when player attacks)
   */
  spawnPlayerProjectile(startX: number, startY: number, targetX: number, targetY: number): void {
    if (!this.config || this.projectiles.length >= this.config.caps.projectiles) {
      return; // At cap, skip spawn
    }
    
    const projectile = this.projectilePool.acquire();
    projectile.id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    projectile.side = 'player';
    projectile.x = startX;
    projectile.y = startY;
    
    // Calculate velocity toward target
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    
    if (dist > 0) {
      const speed = 600; // Player projectile speed (configurable)
      projectile.vx = (dx / dist) * speed;
      projectile.vy = (dy / dist) * speed;
    }
    
    projectile.spawnTime = Date.now();
    projectile.lifetime = 3.0; // Player projectile lifetime
    projectile.chainHitsRemaining = this.config.projectiles.player.chainHitsMax;
    
    this.projectiles.push(projectile);
    telemetry.logProjectileSpawn('player');
  }
  
  private updateDamageNumbers(deltaTimeMs: number): void {
    if (!this.config) return;
    
    const now = Date.now();
    const damageConfig = this.config.ui.damageNumbers;
    
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const damageNumber = this.damageNumbers[i];
      const age = (now - damageNumber.spawnTime) / 1000;
      
      // Check if damage number should despawn per spec §7
      if (age >= damageConfig.fadeDurationSec) {
        this.despawnDamageNumber(damageNumber);
        continue;
      }
      
      // Animate damage number per spec §7
      // Motion: scale 100%→120% over 120ms (pop), then float up +20px and fade out over 2.2s
      const popDuration = 0.12; // 120ms pop phase
      let scale = 1.0;
      let yOffset = 0;
      let opacity = 1.0;
      
      if (age <= popDuration) {
        // Pop phase: scale from 100% to 120%
        const popProgress = age / popDuration;
        scale = 1.0 + (damageConfig.popScale - 1.0) * popProgress;
      } else {
        // Float and fade phase
        scale = damageConfig.popScale;
        const floatAge = age - popDuration;
        const floatDuration = damageConfig.fadeDurationSec - popDuration;
        const floatProgress = floatAge / floatDuration;
        
        // Float up by floatUpPx over the fade duration
        yOffset = -damageConfig.floatUpPx * floatProgress;
        
        // Fade out linearly
        opacity = 1.0 - floatProgress;
      }
      
      // Update damage number visual properties
      damageNumber.y = damageNumber.offsetY + yOffset;
      damageNumber.scale = scale;
      damageNumber.opacity = opacity;
    }
  }
  
  /**
   * Spawn damage number with proper color and stacking per spec §7
   */
  spawnDamageNumber(x: number, y: number, amount: Decimal, isPlayerDamage: boolean): void {
    if (!this.config || this.damageNumbers.length >= this.config.caps.damageNumbers) {
      return; // At cap, skip spawn
    }
    
    const damageNumber = this.damageNumberPool.acquire();
    const damageConfig = this.config.ui.damageNumbers;
    
    damageNumber.id = `dmg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    damageNumber.amount = this.formatDamageAmount(amount);
    damageNumber.color = isPlayerDamage ? damageConfig.playerHitColor : damageConfig.enemyHitColor;
    damageNumber.spawnTime = Date.now();
    
    // Base position
    damageNumber.x = x;
    damageNumber.y = y;
    damageNumber.offsetY = y; // Store original Y for float calculation
    
    // Apply stacking offset per spec §7
    // "random offset ±8 px X, ±6 px Y for subsequent numbers within 250 ms to avoid stacking perfectly"
    const recentNumbers = this.getRecentDamageNumbers(250); // Within 250ms
    if (recentNumbers.length > 0) {
      damageNumber.offsetX = this.randomBetween(-damageConfig.offsetJitterX, damageConfig.offsetJitterX);
      const jitterY = this.randomBetween(-damageConfig.offsetJitterY, damageConfig.offsetJitterY);
      damageNumber.offsetY += jitterY;
      damageNumber.y = damageNumber.offsetY;
      damageNumber.x += damageNumber.offsetX;
    } else {
      damageNumber.offsetX = 0;
    }
    
    this.damageNumbers.push(damageNumber);
  }
  
  /**
   * Get damage numbers spawned within timeWindowMs
   */
  private getRecentDamageNumbers(timeWindowMs: number): DamageNumber[] {
    const now = Date.now();
    return this.damageNumbers.filter(dmg => (now - dmg.spawnTime) <= timeWindowMs);
  }
  
  /**
   * Format damage amount using same 8-char rule per spec §7
   */
  private formatDamageAmount(amount: Decimal): string {
    // Use same formatter as rest of UI per spec
    // TODO: Import formatDecimal from numberFormat
    // For now, basic formatting
    if (amount.lt(1000)) {
      return amount.toFixed(0);
    } else if (amount.lt(1000000)) {
      return (amount.toNumber() / 1000).toFixed(1) + 'K';
    } else {
      return amount.toExponential(2);
    }
  }
  
  /**
   * Remove damage number from active list and return to pool
   */
  private despawnDamageNumber(damageNumber: DamageNumber): void {
    const index = this.damageNumbers.indexOf(damageNumber);
    if (index !== -1) {
      this.damageNumbers.splice(index, 1);
    }
    
    this.damageNumberPool.release(damageNumber);
  }
  
  private updateEnemyAttacks(): void {
    if (!this.config) return;
    
    const now = Date.now();
    
    for (const enemy of this.enemies) {
      if (enemy.state !== 'inRange') continue; // Only attack when in range
      
      // Check if it's time to fire per spec §3.1
      const timeSinceLastFire = now - enemy.lastFireTime;
      if (timeSinceLastFire >= enemy.nextFireDelay) {
        
        // Check if this is the boss (special burst fire per spec §8)
        if (enemy === this.bossEnemy) {
          this.fireBossBurst(enemy);
        } else {
          // Regular enemy single shot
          this.spawnEnemyProjectile(enemy);
        }
        
        // Schedule next attack
        this.scheduleNextAttack(enemy);
        enemy.lastFireTime = now;
      }
    }
  }
  
  /**
   * Fire boss burst attack per spec §8
   * "2 shots ~150 ms apart per cadence"
   */
  private fireBossBurst(boss: Enemy): void {
    if (!this.config) return;
    
    const bossConfig = this.config.bossLand10;
    
    // Fire first shot immediately
    this.spawnEnemyProjectile(boss);
    
    // Schedule second shot after burst gap
    setTimeout(() => {
      // Check if boss is still alive and in range
      if (boss.state === 'inRange' && this.enemies.includes(boss)) {
        this.spawnEnemyProjectile(boss);
      }
    }, bossConfig.burstGapMs);
  }
  
  /**
   * Schedule next attack based on enemy type
   */
  private scheduleNextAttack(enemy: Enemy): void {
    if (!this.config) return;
    
    if (enemy === this.bossEnemy) {
      // Boss uses different timing per spec §8
      const bossConfig = this.config.bossLand10;
      enemy.nextFireDelay = this.randomBetween(
        bossConfig.fireIntervalMinSec * 1000,
        bossConfig.fireIntervalMaxSec * 1000
      );
    } else {
      // Regular enemy timing per spec §3.1
      const fireConfig = this.config.projectiles.enemy;
      enemy.nextFireDelay = this.randomBetween(
        fireConfig.fireIntervalMinSec * 1000,
        fireConfig.fireIntervalMaxSec * 1000
      );
    }
  }
  
  // Helper functions per spec §5 - HP/Damage Scaling
  
  /**
   * Calculate enemy HP based on land and distance per spec §5.2
   * Uses geometric growth across lands + linear steps within lands
   */
  private calculateEnemyHP(type: EnemyType, land: number, distance: Decimal): Decimal {
    if (!this.config) return new Decimal(100);
    
    // Get base HP for Land 1 per spec §5.1
    const baseHP_L1 = this.getBaseHP(type);
    
    // Calculate base HP for this land using geometric growth per spec §5.2
    // HP₀(L+1) = HP₀(L) * G_HP (default G_HP = 1.18)
    const G_HP = this.config.scaling.hpAcrossLandsMul;
    const baseHP_thisLand = baseHP_L1.mul(Decimal.pow(G_HP, land - 1));
    
    // Calculate within-land scaling per spec §5.2
    const withinLandMultiplier = this.calculateWithinLandMultiplier(
      land, 
      distance, 
      G_HP, 
      'hp'
    );
    
    return baseHP_thisLand.mul(withinLandMultiplier);
  }
  
  /**
   * Calculate enemy damage based on land and distance per spec §5.2
   * Uses identical scaling to HP but with different multiplier
   */
  private calculateEnemyDamage(type: EnemyType, land: number, distance: Decimal): Decimal {
    if (!this.config) return new Decimal(10);
    
    // Get base damage for Land 1 per spec §5.1
    const baseDmg_L1 = this.getBaseDamage(type);
    
    // Calculate base damage for this land using geometric growth
    // DMG₀(L+1) = DMG₀(L) * G_DMG (default G_DMG = 1.12)
    const G_DMG = this.config.scaling.dmgAcrossLandsMul;
    const baseDmg_thisLand = baseDmg_L1.mul(Decimal.pow(G_DMG, land - 1));
    
    // Calculate within-land scaling
    const withinLandMultiplier = this.calculateWithinLandMultiplier(
      land,
      distance,
      G_DMG,
      'damage'
    );
    
    return baseDmg_thisLand.mul(withinLandMultiplier);
  }
  
  /**
   * Calculate within-land multiplier per spec §5.2
   * HP_at_meter = HP₀(L) * stepMul^(floor(metersIntoL / 5m))
   */
  private calculateWithinLandMultiplier(
    land: number,
    totalDistance: Decimal,
    acrossLandsMul: number,
    type: 'hp' | 'damage'
  ): Decimal {
    if (!this.config) return new Decimal(1);
    
    // Get land distance info (TODO: integrate with actual level system)
    const landDistanceKm = this.getLandDistanceKm(land);
    const metersIntoLand = this.getMetersIntoLand(totalDistance, land);
    
    // Calculate steps per spec: steps = floor(landDistanceMeters / 5)
    const stepMeters = this.config.scaling.withinLandStepMeters;
    const totalSteps = Math.floor((landDistanceKm * 1000) / stepMeters);
    const currentStep = Math.floor(metersIntoLand / stepMeters);
    
    if (totalSteps <= 0) return new Decimal(1);
    
    // Calculate step multiplier per spec §5.2
    // stepMul = (R_end * HP₀(L+1) / HP₀(L))^(1/steps)
    // where R_end = 0.85 (withinLandEndRatio)
    const R_end = this.config.scaling.withinLandEndRatio;
    const targetEndRatio = R_end * acrossLandsMul; // 0.85 * nextLandMultiplier
    const stepMul = Math.pow(targetEndRatio, 1 / totalSteps);
    
    return new Decimal(Math.pow(stepMul, currentStep));
  }
  
  /**
   * Get base HP for enemy type at Land 1 per spec §5.1
   */
  private getBaseHP(type: EnemyType): Decimal {
    // TODO: Get actual PLAYER_BASE_DAMAGE from game state
    const PLAYER_BASE_DAMAGE = new Decimal(20); // Placeholder
    
    switch (type) {
      case 'basicShooter':
        // baseHP_atLand1 = PLAYER_BASE_DAMAGE * 2.3
        return PLAYER_BASE_DAMAGE.mul(2.3);
      default:
        return PLAYER_BASE_DAMAGE.mul(2.3);
    }
  }
  
  /**
   * Get base damage for enemy type at Land 1 per spec §5.1
   */
  private getBaseDamage(type: EnemyType): Decimal {
    // TODO: Get actual PLAYER_BASE_HP from game state
    const PLAYER_BASE_HP = new Decimal(100); // Placeholder
    
    switch (type) {
      case 'basicShooter':
        // baseDmg_atLand1 = PLAYER_BASE_HP * 0.08
        return PLAYER_BASE_HP.mul(0.08);
      default:
        return PLAYER_BASE_HP.mul(0.08);
    }
  }
  
  /**
   * Get land distance in km (TODO: integrate with actual distance system)
   */
  private getLandDistanceKm(land: number): number {
    // Placeholder - should come from actual level system
    // For now, use simple progression: Land 1 = 1.5km, growth = 1.25
    return 1.5 * Math.pow(1.25, land - 1);
  }
  
  /**
   * Get meters into current land (TODO: integrate with actual distance system)
   */
  private getMetersIntoLand(totalDistance: Decimal, land: number): number {
    // Placeholder - should calculate based on cumulative distances
    // For now, approximate
    return totalDistance.mod(this.getLandDistanceKm(land) * 1000).toNumber();
  }
  
  /**
   * Calculate boss HP/damage multipliers per spec §5 & spec Boss section
   */
  calculateBossStats(land: number, distance: Decimal): { hp: Decimal; damage: Decimal } {
    if (!this.config) {
      return { hp: new Decimal(1000), damage: new Decimal(50) };
    }
    
    // Get end-of-land baseline stats
    const endOfLandHP = this.calculateEnemyHP('basicShooter', land, distance);
    const endOfLandDamage = this.calculateEnemyDamage('basicShooter', land, distance);
    
    // Apply boss multipliers per spec
    const bossHP = endOfLandHP.mul(this.config.bossLand10.hpMultVsEndOfLand);
    const bossDamage = endOfLandDamage.mul(this.config.bossLand10.dmgMultVsEndOfLand);
    
    return { hp: bossHP, damage: bossDamage };
  }
  
  private randomBetween(min: number, max: number): number {
    return min + Math.random() * (max - min);
  }
  
  // Public methods for external game events
  
  /**
   * Set callback for boss death event per spec §8
   */
  setBossDeathCallback(callback: () => void): void {
    this.onBossDeathCallback = callback;
  }
  
  /**
   * Check if boss is currently active
   */
  isBossActive(): boolean {
    return this.bossEnemy !== null && this.enemies.includes(this.bossEnemy);
  }
  
  /**
   * Get boss enemy for special rendering/UI
   */
  getBoss(): Enemy | null {
    return this.bossEnemy && this.enemies.includes(this.bossEnemy) ? this.bossEnemy : null;
  }
  
  /**
   * Check if spawns are disabled (for external distance system)
   */
  areSpawnsDisabled(): boolean {
    return this.regularSpawnsDisabled;
  }
  
  /**
   * Clear all enemies (called on player death per spec §2.6)
   */
  clearAllEnemies(): void {
    // Return all enemies to pools
    while (this.enemies.length > 0) {
      const enemy = this.enemies.pop()!;
      this.enemyPool.release(enemy);
    }
    
    // Also clear projectiles and damage numbers
    while (this.projectiles.length > 0) {
      const projectile = this.projectiles.pop()!;
      this.projectilePool.release(projectile);
    }
    
    while (this.damageNumbers.length > 0) {
      const damageNumber = this.damageNumbers.pop()!;
      this.damageNumberPool.release(damageNumber);
    }
    
    // Reset boss state
    this.bossSpawned = false;
  }
  
  /**
   * Handle player hitting an enemy (called from external collision detection)
   */
  damageEnemy(enemyId: string, damage: Decimal): { killed: boolean; overkill: Decimal } {
    const enemy = this.enemies.find(e => e.id === enemyId);
    if (!enemy || enemy.state === 'dead') {
      return { killed: false, overkill: new Decimal(0) };
    }
    
    enemy.currentHP = enemy.currentHP.minus(damage);
    
    // Show HP bar when damaged per spec §6
    if (!enemy.hpBarVisible) {
      enemy.hpBarVisible = true;
    }
    
    // Spawn damage number per spec §7 (white for enemy taking damage)
    this.spawnDamageNumber(enemy.x, enemy.y - 10, damage, false);
    
    // Log hit telemetry
    telemetry.logEnemyHit(enemy.type, damage);
    
    if (enemy.currentHP.lte(0)) {
      // Enemy killed
      const overkill = enemy.currentHP.abs();
      enemy.state = 'dead';
      this.despawnEnemy(enemy, 'killed');
      return { killed: true, overkill };
    }
    
    return { killed: false, overkill: new Decimal(0) };
  }
  
  /**
   * Handle enemy hitting player (called from projectile collision)
   */
  damagePlayer(damage: Decimal): void {
    // Spawn damage number per spec §7 (red for player taking damage)
    this.spawnDamageNumber(this.dragonX, this.dragonY - 20, damage, true);
    
    telemetry.logPlayerHit(damage);
    // External system should handle actual player HP reduction
  }
  
  // 🚨 CTO REQUESTED: Debug counters for spawn/render integration
  private spawnCount = 0;
  private cullCount = 0;
  private lastSpawnTime = Date.now();
  private spawnsPerSecond = 0.0;
  
  /**
   * Get debug information for CTO punch list debugging
   */
  getDebugInfo(): {
    activeEnemies: number;
    activeProjectiles: number;
    activeDamageNumbers: number;
    spawnsPerSecond: number;
    cullCount: number;
    inRangeCount: number;
    poolSizes: {
      enemies: number;
      projectiles: number;
      damageNumbers: number;
    };
  } {
    // Calculate in-range count
    const inRangeCount = this.enemies.filter(e => e.state === 'inRange').length;
    
    return {
      activeEnemies: this.enemies.length,
      activeProjectiles: this.projectiles.length,
      activeDamageNumbers: this.damageNumbers.length,
      spawnsPerSecond: this.spawnsPerSecond,
      cullCount: this.cullCount,
      inRangeCount,
      poolSizes: {
        enemies: this.enemyPool.getPoolSize(),
        projectiles: this.projectilePool.getPoolSize(),
        damageNumbers: this.damageNumberPool.getPoolSize(),
      },
    };
  }
}

// Global enemy system instance
export const enemySystem = new EnemySystem();