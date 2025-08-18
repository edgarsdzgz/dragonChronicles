import { I as current_component, z as push, J as fallback, K as attr, M as bind_props, B as pop, N as store_get, O as copy_payload, P as assign_payload, Q as unsubscribe_stores, G as escape_html, R as attr_class, S as attr_style, T as stringify, U as ensure_array_like } from "../../chunks/index2.js";
import { w as writable, d as derived, r as readable } from "../../chunks/index.js";
import Decimal from "break_eternity.js";
import "clsx";
import { z } from "zod";
function onDestroy(fn) {
  var context = (
    /** @type {Component} */
    current_component
  );
  (context.d ??= []).push(fn);
}
class TelemetrySystem {
  buffer = [];
  maxLines = 5e3;
  lastRateSampleTime = 0;
  rateSampleInterval = 1e4;
  // 10 seconds
  /**
   * Add event to NDJSON buffer
   */
  addEvent(event) {
    const line = JSON.stringify(event);
    this.buffer.push(line);
    if (this.buffer.length > this.maxLines) {
      this.buffer.shift();
    }
    this.persistBuffer();
  }
  /**
   * Log enchant purchase
   */
  logPurchase(enchant, fromLevel, toLevel, cost, arcanaAfter) {
    this.addEvent({
      timestamp: Date.now(),
      event: "purchase",
      enchant,
      fromLevel,
      toLevel,
      costStr: cost.toString(),
      arcanaAfterStr: arcanaAfter.toString()
    });
  }
  /**
   * Log tier up
   */
  logTierUp(enchant, fromTier, cost, arcanaAfter) {
    this.addEvent({
      timestamp: Date.now(),
      event: "tierUp",
      enchant,
      fromTier,
      costStr: cost.toString(),
      arcanaAfterStr: arcanaAfter.toString()
    });
  }
  /**
   * Log offline payout
   */
  logOfflinePayout(elapsedSec, arcanaRate, arcanaGain) {
    this.addEvent({
      timestamp: Date.now(),
      event: "offlinePayout",
      elapsedSec: elapsedSec.toString(),
      arcanaRateStr: arcanaRate.toString(),
      arcanaGainStr: arcanaGain.toString()
    });
  }
  /**
   * Log journey reset
   */
  logResetJourney(runTotalDistanceKm, lifetimeTotalDistanceKm) {
    this.addEvent({
      timestamp: Date.now(),
      event: "resetJourney",
      runTotalDistanceKmStr: runTotalDistanceKm.toString(),
      lifetimeTotalsStr: lifetimeTotalDistanceKm.toString()
    });
  }
  /**
   * Log format boundary crossing (e.g., e→ee)
   */
  logFormatBoundary(fromNotation, toNotation, value) {
    this.addEvent({
      timestamp: Date.now(),
      event: "formatBoundary",
      fromNotation,
      toNotation,
      valueStr: value.toString()
    });
  }
  /**
   * Log EWMA rate samples (throttled to every 10 seconds)
   */
  logRateSample(ewmaArcanaPerSec) {
    const now = Date.now();
    if (now - this.lastRateSampleTime < this.rateSampleInterval) {
      return;
    }
    this.lastRateSampleTime = now;
    this.addEvent({
      timestamp: now,
      event: "rateSamples",
      ewmaArcanaPerSecStr: ewmaArcanaPerSec.toString()
    });
  }
  /**
   * Enemy MVP 1.1 Telemetry Events per Spec §11
   */
  logEnemySpawn(type, land, x, y) {
    this.addEvent({
      timestamp: Date.now(),
      event: "enemySpawn",
      type,
      land,
      x,
      y
    });
  }
  logEnemyDeath(type, killedBy, overkill) {
    this.addEvent({
      timestamp: Date.now(),
      event: "enemyDeath",
      type,
      killedBy,
      overkillStr: overkill
    });
  }
  logEnemyHit(type, amount) {
    this.addEvent({
      timestamp: Date.now(),
      event: "enemyHit",
      type,
      amountStr: amount.toString()
    });
  }
  logPlayerHit(amount) {
    this.addEvent({
      timestamp: Date.now(),
      event: "playerHit",
      amountStr: amount.toString()
    });
  }
  logProjectileSpawn(side) {
    this.addEvent({
      timestamp: Date.now(),
      event: "projectileSpawn",
      side
    });
  }
  logProjectileDespawn(reason) {
    this.addEvent({
      timestamp: Date.now(),
      event: "projectileDespawn",
      reason
    });
  }
  logBossSpawn() {
    this.addEvent({
      timestamp: Date.now(),
      event: "bossSpawn"
    });
  }
  logBossDeath() {
    this.addEvent({
      timestamp: Date.now(),
      event: "bossDeath"
    });
  }
  logFPSDrop(fps, duration) {
    this.addEvent({
      timestamp: Date.now(),
      event: "fpsDrop",
      fps,
      durationMs: duration
    });
  }
  /**
   * Get buffer as NDJSON string for download
   */
  exportNDJSON() {
    return this.buffer.join("\n");
  }
  /**
   * Download logs as NDJSON file
   */
  downloadLogs() {
    const ndjson = this.exportNDJSON();
    const blob = new Blob([ndjson], { type: "application/x-ndjson" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `dragonchronicles-logs-${(/* @__PURE__ */ new Date()).toISOString().slice(0, 19)}.ndjson`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
  /**
   * Clear all logs
   */
  clearLogs() {
    this.buffer = [];
    localStorage.removeItem("dragonChronicles_telemetry");
  }
  /**
   * Get current buffer size
   */
  getBufferSize() {
    return this.buffer.length;
  }
  /**
   * Persist buffer to localStorage for crash recovery
   */
  persistBuffer() {
    try {
      const compressed = JSON.stringify(this.buffer.slice(-1e3));
      localStorage.setItem("dragonChronicles_telemetry", compressed);
    } catch (error) {
      console.warn("Failed to persist telemetry buffer:", error);
    }
  }
  /**
   * Load buffer from localStorage on startup
   */
  loadPersistedBuffer() {
    try {
      const stored = localStorage.getItem("dragonChronicles_telemetry");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          this.buffer = parsed;
        }
      }
    } catch (error) {
      console.warn("Failed to load persisted telemetry buffer:", error);
    }
  }
}
const telemetry = new TelemetrySystem();
if (typeof window !== "undefined") {
  telemetry.loadPersistedBuffer();
}
function formatDecimal(value) {
  const dec = new Decimal(value);
  if (!dec.isFinite()) return dec.toString();
  if (dec.eq(0)) return "0";
  if (dec.lt(0)) return "-" + formatDecimal(dec.abs());
  if (dec.lt(1e4)) {
    return dec.toFixed(2).replace(/\.?0+$/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  if (dec.lt("1e101")) {
    const mantissa = dec.div(Decimal.pow(10, dec.log10().floor()));
    const exponent = dec.log10().floor().toNumber();
    return `${mantissa.toFixed(2)}e${exponent}`;
  }
  const log10 = dec.log10();
  const eeExponent = log10.log10().floor();
  const eeMantissa = log10.div(Decimal.pow(10, eeExponent));
  return `${eeMantissa.toFixed(2)}ee${eeExponent.toNumber()}`;
}
const distanceUI = writable({
  km: 0
});
const distanceWorker = writable({
  km: 0
});
const gameState110 = readable(null, (set) => {
  {
    return () => {
    };
  }
});
const currencies110 = derived(
  gameState110,
  ($state) => $state?.currencies || {
    arcana: "0",
    forgegold: "0",
    dragonscales: "0",
    gems: "0"
  }
);
const enchants110 = derived(
  gameState110,
  ($state) => $state?.enchants || {
    firepower: { level: 0, tierUnlocked: 1 },
    scales: { level: 0, tierUnlocked: 1 }
  }
);
const dragonState110 = derived(
  gameState110,
  ($state) => ({
    hp: $state?.dragonHp || 100,
    maxHp: $state?.dragonMaxHp || 100,
    hpPercentage: $state ? $state.dragonHp / $state.dragonMaxHp : 1,
    travelState: $state?.travelState || "HOVERING"
  })
);
const distanceState110 = derived(
  gameState110,
  ($state) => ({
    currentLevel: $state?.currentLevel || 1,
    levelProgress: $state?.levelProgress || 0,
    runTotalKm: $state?.runTotalDistanceKm || "0",
    lifetimeTotalKm: $state?.lifetimeTotalDistanceKm || "0",
    lifetimeMaxKm: $state?.lifetimeMaxTotalDistanceKm || "0"
  })
);
derived(
  gameState110,
  ($state) => ({
    arcanaPerSec: $state?.ewmaArcanaPerSec || "0",
    arcanaPerSecFormatted: formatDecimal($state?.ewmaArcanaPerSec || "0")
  })
);
function canAffordEnchant(enchantType, state) {
  const enchant = state.enchants[enchantType];
  const arcana = new Decimal(state.currencies.arcana);
  const baseCost = enchantType === "firepower" ? 10 : 12;
  const cost = new Decimal(baseCost).mul(Decimal.pow(1.4, enchant.level)).ceil();
  return arcana.gte(cost) && enchant.level < 500;
}
function formatDistanceHeader(runTotalDistanceKm) {
  {
    return "Land 1 | Verdant Dragonplains 0.00 km";
  }
}
const enemyConfigLoaded = writable(false);
const setEnemyConfigLoaded = (v) => enemyConfigLoaded.set(v);
async function loadEnemyConfig() {
  try {
    const res = await fetch("/enemy-config.json");
    if (!res.ok) {
      setEnemyConfigLoaded(false);
      throw new Error("enemy-config.json missing");
    }
    const cfg = await res.json();
    setEnemyConfigLoaded(true);
    return cfg;
  } catch (error) {
    setEnemyConfigLoaded(false);
    throw error;
  }
}
class ObjectPool {
  pool = [];
  createFn;
  resetFn;
  constructor(createFn, resetFn) {
    this.createFn = createFn;
    this.resetFn = resetFn;
  }
  acquire() {
    if (this.pool.length > 0) {
      return this.pool.pop();
    }
    return this.createFn();
  }
  release(obj) {
    this.resetFn(obj);
    this.pool.push(obj);
  }
  getPoolSize() {
    return this.pool.length;
  }
}
class PoissonScheduler {
  lambda;
  minDelta;
  maxDelta;
  nextSpawnTime = 0;
  constructor(meanIntervalSec, minDeltaSec, maxDeltaSec) {
    this.lambda = 1 / meanIntervalSec;
    this.minDelta = minDeltaSec * 1e3;
    this.maxDelta = maxDeltaSec * 1e3;
    this.scheduleNext();
  }
  scheduleNext() {
    const u = Math.random();
    const poissonDelta = -Math.log(u) / this.lambda;
    const clampedDelta = Math.max(this.minDelta / 1e3, Math.min(this.maxDelta / 1e3, poissonDelta));
    this.nextSpawnTime = Date.now() + clampedDelta * 1e3;
  }
  shouldSpawn() {
    if (Date.now() >= this.nextSpawnTime) {
      this.scheduleNext();
      return true;
    }
    return false;
  }
  // For performance throttling per spec
  adjustMeanInterval(factor) {
    this.lambda = this.lambda / factor;
  }
}
class EnemySystem {
  config = null;
  isInitialized = false;
  // Active objects
  enemies = [];
  projectiles = [];
  damageNumbers = [];
  // Object pools
  enemyPool;
  projectilePool;
  damageNumberPool;
  // Spawning
  scheduler = null;
  bossSpawned = false;
  bossEnemy = null;
  regularSpawnsDisabled = false;
  // Game state
  combatWidth = 800;
  // Will be updated from UI
  combatHeight = 200;
  dragonX = 80;
  dragonY = 100;
  playerIsReversing = false;
  playerIsTraveling = false;
  currentLand = 1;
  currentDistance = new Decimal(0);
  // Performance monitoring
  fpsDropStartTime = 0;
  // Event callbacks
  onBossDeathCallback = null;
  constructor() {
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
  async initialize() {
    try {
      let config;
      try {
        config = await loadEnemyConfig();
        console.log("✅ Loaded enemy config from /enemy-config.json");
      } catch (fetchError) {
        console.warn("⚠️ Config fetch failed, using embedded fallback:", fetchError);
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
              lifetimeSec: 2,
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
              colorHex: "#ffeb3b"
            },
            damageNumbers: {
              popScalePercent: 120,
              popDurationMs: 120,
              floatHeightPx: 20,
              fadeOutSec: 2.2,
              offsetLimitMs: 250,
              offsetXPx: 8,
              offsetYPx: 6,
              colorPlayerDamage: "#ffffff",
              colorEnemyDamage: "#ff4444"
            }
          },
          bossLand10: {
            hpMultVsEndOfLand: 2.8,
            dmgMultVsEndOfLand: 2,
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
            fpsThrottleDurationMs: 1e3,
            throttleSpawnRateFactor: 0.5
          }
        };
      }
      this.config = config;
      const basicShooterConfig = this.config.spawning.basicShooter;
      this.scheduler = new PoissonScheduler(
        basicShooterConfig.meanIntervalSec,
        basicShooterConfig.minDeltaSec,
        basicShooterConfig.maxDeltaSec
      );
      this.isInitialized = true;
      console.log("🎯 Enemy system initialized successfully");
    } catch (error) {
      console.error("❌ Critical: Enemy system initialization failed:", error);
      throw error;
    }
  }
  // Object creation functions
  createEnemy() {
    return {
      id: "",
      type: "basicShooter",
      state: "spawning",
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
  createProjectile() {
    return {
      id: "",
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      side: "enemy",
      spawnTime: 0,
      lifetime: 0,
      chainHitsRemaining: 0
    };
  }
  createDamageNumber() {
    return {
      id: "",
      x: 0,
      y: 0,
      amount: "",
      color: "",
      spawnTime: 0,
      offsetX: 0,
      offsetY: 0
    };
  }
  // Object reset functions
  resetEnemy(enemy) {
    enemy.state = "spawning";
    enemy.currentHP = new Decimal(0);
    enemy.hpBarVisible = false;
    enemy.hpBarHideTimer = 0;
  }
  resetProjectile(projectile) {
    projectile.chainHitsRemaining = 0;
  }
  resetDamageNumber(damageNumber) {
    damageNumber.amount = "";
    damageNumber.color = "";
  }
  // Public getters for rendering
  getEnemies() {
    return this.enemies;
  }
  getProjectiles() {
    return this.projectiles;
  }
  getDamageNumbers() {
    return this.damageNumbers;
  }
  isReady() {
    return this.isInitialized && this.config !== null;
  }
  // Update game state from external systems
  updateGameState(combatWidth, combatHeight, dragonX, dragonY, playerIsReversing, playerIsTraveling, currentLand, currentDistance) {
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
  update(deltaTimeMs) {
    if (!this.isReady()) return;
    this.updateSpawning();
    this.updateEnemyMovement(deltaTimeMs);
    this.updateEnemyHPBars(deltaTimeMs);
    this.updateProjectiles(deltaTimeMs);
    this.updateDamageNumbers(deltaTimeMs);
    this.updateEnemyAttacks();
  }
  updateSpawning() {
    if (!this.scheduler || !this.config) return;
    if (!this.playerIsTraveling) {
      return;
    }
    if (this.currentLand === 10 && !this.bossSpawned) {
      const landProgress = this.getLandProgress(this.currentDistance, this.currentLand);
      if (landProgress >= 0.5) {
        this.spawnBoss();
        this.regularSpawnsDisabled = true;
        return;
      }
    }
    if (!this.regularSpawnsDisabled && this.scheduler.shouldSpawn() && this.enemies.length < this.config.caps.enemies) {
      this.spawnEnemy("basicShooter");
    }
  }
  /**
   * Spawn Land 10 boss per spec §8
   */
  spawnBoss() {
    if (!this.config || this.bossSpawned) return;
    const enemy = this.enemyPool.acquire();
    enemy.id = `boss_land10_${Date.now()}`;
    enemy.type = "basicShooter";
    enemy.state = "spawning";
    enemy.x = this.combatWidth + 32;
    enemy.y = this.combatHeight / 2;
    enemy.ownSpeedX = this.config.movement.ownSpeedX_px_per_s;
    const bossStats = this.calculateBossStats(this.currentLand, this.currentDistance);
    enemy.maxHP = bossStats.hp;
    enemy.currentHP = bossStats.hp;
    enemy.damage = bossStats.damage;
    const bossConfig = this.config.bossLand10;
    enemy.nextFireDelay = this.randomBetween(
      bossConfig.fireIntervalMinSec * 1e3,
      bossConfig.fireIntervalMaxSec * 1e3
    );
    enemy.lastFireTime = Date.now();
    enemy.spawnLand = this.currentLand;
    enemy.spawnDistance = this.currentDistance;
    this.enemies.push(enemy);
    this.bossEnemy = enemy;
    this.bossSpawned = true;
    telemetry.logBossSpawn();
    console.log("🐉 Boss spawned for Land 10!", {
      hp: bossStats.hp.toString(),
      damage: bossStats.damage.toString()
    });
  }
  /**
   * Get progress through current land (0.0 to 1.0)
   */
  getLandProgress(totalDistance, land) {
    const landDistanceKm = this.getLandDistanceKm(land);
    const metersIntoLand = this.getMetersIntoLand(totalDistance, land);
    return Math.min(1, metersIntoLand / (landDistanceKm * 1e3));
  }
  spawnEnemy(type) {
    if (!this.config) return;
    const enemy = this.enemyPool.acquire();
    enemy.id = `enemy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    enemy.type = type;
    enemy.state = "spawning";
    enemy.x = this.combatWidth + 32;
    enemy.y = Math.random() * this.combatHeight;
    const baseSpeed = this.config.movement.ownSpeedX_px_per_s;
    const jitter = 1 + (Math.random() - 0.5) * 2 * this.config.movement.jitterPercent;
    enemy.ownSpeedX = baseSpeed * jitter;
    if (this.playerIsReversing) {
      enemy.ownSpeedX *= this.config.movement.reverseSpawnSpeedScale;
    }
    enemy.maxHP = this.calculateEnemyHP(type, this.currentLand, this.currentDistance);
    enemy.currentHP = enemy.maxHP;
    enemy.damage = this.calculateEnemyDamage(type, this.currentLand, this.currentDistance);
    const fireConfig = this.config.projectiles.enemy;
    enemy.nextFireDelay = this.randomBetween(
      fireConfig.fireIntervalMinSec * 1e3,
      fireConfig.fireIntervalMaxSec * 1e3
    );
    enemy.lastFireTime = Date.now();
    enemy.spawnLand = this.currentLand;
    enemy.spawnDistance = this.currentDistance;
    this.enemies.push(enemy);
    this.spawnCount++;
    const now = Date.now();
    const deltaSeconds = (now - this.lastSpawnTime) / 1e3;
    if (deltaSeconds > 0) {
      this.spawnsPerSecond = this.spawnsPerSecond * 0.9 + 1 / deltaSeconds * 0.1;
    }
    this.lastSpawnTime = now;
    telemetry.logEnemySpawn(type, this.currentLand, enemy.x, enemy.y);
    console.log(`🚨 SPAWN DEBUG: Enemy spawned at (${enemy.x}, ${enemy.y}), traveling: ${this.playerIsTraveling}`);
  }
  updateEnemyMovement(deltaTimeMs) {
    if (!this.config) return;
    const worldScrollSpeedX = this.calculateWorldScrollSpeed();
    for (const enemy of this.enemies) {
      if (enemy.state === "dead") continue;
      const dx = this.dragonX - enemy.x;
      const dy = this.dragonY - enemy.y;
      const distToDragon = Math.sqrt(dx * dx + dy * dy);
      if (distToDragon > 0) {
        const nx = dx / distToDragon;
        const ny = dy / distToDragon;
        const attackRange = this.config.movement.attackRangeFrac_ofCombatWidth * this.combatWidth;
        enemy.targetStopX = this.dragonX - nx * attackRange;
        enemy.targetStopY = this.dragonY - ny * attackRange;
      }
      const distToStop = Math.sqrt(
        (enemy.x - enemy.targetStopX) ** 2 + (enemy.y - enemy.targetStopY) ** 2
      );
      if (distToStop <= this.config.movement.arrivalEpsilon_px) {
        if (enemy.state !== "inRange") {
          enemy.state = "inRange";
          const jiggleY = this.randomBetween(-6, 6);
          enemy.y += jiggleY;
          enemy.y = Math.max(0, Math.min(this.combatHeight, enemy.y));
          this.resolveOverlapConflicts(enemy);
        }
      } else {
        if (enemy.state !== "advance") {
          enemy.state = "advance";
        }
        let totalSpeedX = worldScrollSpeedX + enemy.ownSpeedX;
        if (this.playerIsReversing) {
          totalSpeedX = worldScrollSpeedX + enemy.ownSpeedX * this.config.movement.reverseAdvanceScale_outOfRange;
        }
        const moveSpeed = totalSpeedX * deltaTimeMs / 1e3;
        if (distToStop > 0) {
          const moveX = (enemy.targetStopX - enemy.x) / distToStop * moveSpeed;
          const moveY = (enemy.targetStopY - enemy.y) / distToStop * moveSpeed;
          enemy.x += moveX;
          enemy.y += moveY;
        }
      }
      if (enemy.state === "inRange" && this.playerIsReversing) ;
      if (enemy.x < -100 || enemy.x > this.combatWidth + 100) {
        this.despawnEnemy(enemy, "offscreen");
      }
    }
  }
  /**
   * Calculate world scroll speed based on player movement per spec §2.1
   */
  calculateWorldScrollSpeed() {
    const basePlayerSpeed = 44;
    if (this.playerIsReversing) {
      return -basePlayerSpeed;
    } else {
      return basePlayerSpeed;
    }
  }
  /**
   * Resolve overlap conflicts per spec §2.5
   * Enemies can overlap up to (full overlap - 5px)
   */
  resolveOverlapConflicts(newEnemy) {
    const minSeparation = 5;
    for (const existingEnemy of this.enemies) {
      if (existingEnemy.id === newEnemy.id || existingEnemy.state === "dead") continue;
      const dx = Math.abs(newEnemy.x - existingEnemy.x);
      const dy = Math.abs(newEnemy.y - existingEnemy.y);
      if (dx < minSeparation && dy < minSeparation) {
        const offsetX = this.randomBetween(-6, 6);
        const offsetY = this.randomBetween(-6, 6);
        newEnemy.x += offsetX;
        newEnemy.y += offsetY;
        newEnemy.x = Math.max(0, Math.min(this.combatWidth, newEnemy.x));
        newEnemy.y = Math.max(0, Math.min(this.combatHeight, newEnemy.y));
        break;
      }
    }
  }
  /**
   * Remove enemy from active list and return to pool
   */
  despawnEnemy(enemy, reason) {
    const isBossKilled = enemy === this.bossEnemy && reason === "killed";
    const index = this.enemies.indexOf(enemy);
    if (index !== -1) {
      this.enemies.splice(index, 1);
    }
    if (isBossKilled) {
      this.handleBossDeath();
    }
    if (reason === "killed") {
      const overkill = enemy.currentHP.lt(0) ? enemy.currentHP.abs().toString() : "0";
      telemetry.logEnemyDeath(enemy.type, "player", overkill);
      if (isBossKilled) {
        telemetry.logBossDeath();
      }
    } else if (reason === "offscreen") {
      telemetry.logEnemyDeath(enemy.type, "offscreen", "0");
    }
    if (enemy === this.bossEnemy) {
      this.bossEnemy = null;
    }
    this.enemyPool.release(enemy);
  }
  /**
   * Handle boss death per spec §8
   * "spawn 'YOU WIN!' dialog; pause spawns; stop distance; show 'Return to Draconia' button"
   */
  handleBossDeath() {
    console.log("🎉 Boss defeated! YOU WIN!");
    this.regularSpawnsDisabled = true;
    if (this.onBossDeathCallback) {
      this.onBossDeathCallback();
    }
  }
  /**
   * Update enemy HP bar visibility per spec §6
   */
  updateEnemyHPBars(deltaTimeMs) {
    if (!this.config) return;
    const hpBarConfig = this.config.ui.enemyHpBar;
    for (const enemy of this.enemies) {
      if (enemy.state === "dead") continue;
      if (enemy.currentHP.gte(enemy.maxHP) && enemy.hpBarVisible) {
        if (enemy.hpBarHideTimer === 0) {
          enemy.hpBarHideTimer = Date.now();
        }
        const hideDelay = hpBarConfig.hideDelayAtFullSec * 1e3;
        if (Date.now() - enemy.hpBarHideTimer >= hideDelay) {
          enemy.hpBarVisible = false;
          enemy.hpBarHideTimer = 0;
        }
      } else if (enemy.currentHP.lt(enemy.maxHP)) {
        enemy.hpBarVisible = hpBarConfig.visibleOnlyWhenDamaged;
        enemy.hpBarHideTimer = 0;
      }
    }
  }
  updateProjectiles(deltaTimeMs) {
    if (!this.config) return;
    const now = Date.now();
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const projectile = this.projectiles[i];
      const age = (now - projectile.spawnTime) / 1e3;
      if (age >= projectile.lifetime) {
        this.despawnProjectile(projectile, "timeout");
        continue;
      }
      const deltaS = deltaTimeMs / 1e3;
      projectile.x += projectile.vx * deltaS;
      projectile.y += projectile.vy * deltaS;
      if (projectile.x < -32 || projectile.x > this.combatWidth + 32 || projectile.y < -32 || projectile.y > this.combatHeight + 32) {
        this.despawnProjectile(projectile, "offscreen");
        continue;
      }
      if (projectile.side === "enemy") {
        if (this.checkProjectileDragonCollision(projectile)) {
          const damage = this.calculateProjectileDamage(projectile);
          this.damagePlayer(damage);
          this.despawnProjectile(projectile, "hit");
        }
      } else if (projectile.side === "player") {
        const hitResult = this.checkProjectileEnemyCollisions(projectile);
        if (hitResult) {
          const { enemy, killed, overkill } = hitResult;
          if (killed && projectile.chainHitsRemaining > 0) {
            projectile.chainHitsRemaining--;
          } else {
            this.despawnProjectile(projectile, "hit");
          }
        }
      }
    }
  }
  /**
   * Check if projectile collides with dragon using circle collision per spec §4.2
   */
  checkProjectileDragonCollision(projectile) {
    const dragonRadius = 24;
    const dx = projectile.x - this.dragonX;
    const dy = projectile.y - this.dragonY;
    const distSq = dx * dx + dy * dy;
    return distSq <= dragonRadius * dragonRadius;
  }
  /**
   * Check if player projectile hits any enemy using line-circle collision per spec §4.2
   */
  checkProjectileEnemyCollisions(projectile) {
    const projectileRadius = 2;
    for (const enemy of this.enemies) {
      if (enemy.state === "dead") continue;
      const enemyRadius = 12;
      const dx = projectile.x - enemy.x;
      const dy = projectile.y - enemy.y;
      const distSq = dx * dx + dy * dy;
      const combinedRadius = projectileRadius + enemyRadius;
      if (distSq <= combinedRadius * combinedRadius) {
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
  calculateProjectileDamage(projectile) {
    return new Decimal(10);
  }
  /**
   * Calculate player projectile damage
   */
  calculatePlayerProjectileDamage() {
    return new Decimal(15);
  }
  /**
   * Remove projectile from active list and return to pool
   */
  despawnProjectile(projectile, reason) {
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
  spawnEnemyProjectile(enemy) {
    if (!this.config || this.projectiles.length >= this.config.caps.projectiles) {
      return;
    }
    const projectile = this.projectilePool.acquire();
    projectile.id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    projectile.side = "enemy";
    projectile.x = enemy.x;
    projectile.y = enemy.y;
    const dx = this.dragonX - enemy.x;
    const dy = this.dragonY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const speed = this.config.projectiles.enemy.speed_px_per_s;
      projectile.vx = dx / dist * speed;
      projectile.vy = dy / dist * speed;
    }
    projectile.spawnTime = Date.now();
    projectile.lifetime = this.config.projectiles.enemy.lifetimeSec;
    projectile.chainHitsRemaining = 0;
    this.projectiles.push(projectile);
    telemetry.logProjectileSpawn("enemy");
  }
  /**
   * Spawn player projectile (called externally when player attacks)
   */
  spawnPlayerProjectile(startX, startY, targetX, targetY) {
    if (!this.config || this.projectiles.length >= this.config.caps.projectiles) {
      return;
    }
    const projectile = this.projectilePool.acquire();
    projectile.id = `proj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    projectile.side = "player";
    projectile.x = startX;
    projectile.y = startY;
    const dx = targetX - startX;
    const dy = targetY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist > 0) {
      const speed = 600;
      projectile.vx = dx / dist * speed;
      projectile.vy = dy / dist * speed;
    }
    projectile.spawnTime = Date.now();
    projectile.lifetime = 3;
    projectile.chainHitsRemaining = this.config.projectiles.player.chainHitsMax;
    this.projectiles.push(projectile);
    telemetry.logProjectileSpawn("player");
  }
  updateDamageNumbers(deltaTimeMs) {
    if (!this.config) return;
    const now = Date.now();
    const damageConfig = this.config.ui.damageNumbers;
    for (let i = this.damageNumbers.length - 1; i >= 0; i--) {
      const damageNumber = this.damageNumbers[i];
      const age = (now - damageNumber.spawnTime) / 1e3;
      if (age >= damageConfig.fadeDurationSec) {
        this.despawnDamageNumber(damageNumber);
        continue;
      }
      const popDuration = 0.12;
      let scale = 1;
      let yOffset = 0;
      let opacity = 1;
      if (age <= popDuration) {
        const popProgress = age / popDuration;
        scale = 1 + (damageConfig.popScale - 1) * popProgress;
      } else {
        scale = damageConfig.popScale;
        const floatAge = age - popDuration;
        const floatDuration = damageConfig.fadeDurationSec - popDuration;
        const floatProgress = floatAge / floatDuration;
        yOffset = -damageConfig.floatUpPx * floatProgress;
        opacity = 1 - floatProgress;
      }
      damageNumber.y = damageNumber.offsetY + yOffset;
      damageNumber.scale = scale;
      damageNumber.opacity = opacity;
    }
  }
  /**
   * Spawn damage number with proper color and stacking per spec §7
   */
  spawnDamageNumber(x, y, amount, isPlayerDamage) {
    if (!this.config || this.damageNumbers.length >= this.config.caps.damageNumbers) {
      return;
    }
    const damageNumber = this.damageNumberPool.acquire();
    const damageConfig = this.config.ui.damageNumbers;
    damageNumber.id = `dmg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    damageNumber.amount = this.formatDamageAmount(amount);
    damageNumber.color = isPlayerDamage ? damageConfig.playerHitColor : damageConfig.enemyHitColor;
    damageNumber.spawnTime = Date.now();
    damageNumber.x = x;
    damageNumber.y = y;
    damageNumber.offsetY = y;
    const recentNumbers = this.getRecentDamageNumbers(250);
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
  getRecentDamageNumbers(timeWindowMs) {
    const now = Date.now();
    return this.damageNumbers.filter((dmg) => now - dmg.spawnTime <= timeWindowMs);
  }
  /**
   * Format damage amount using same 8-char rule per spec §7
   */
  formatDamageAmount(amount) {
    if (amount.lt(1e3)) {
      return amount.toFixed(0);
    } else if (amount.lt(1e6)) {
      return (amount.toNumber() / 1e3).toFixed(1) + "K";
    } else {
      return amount.toExponential(2);
    }
  }
  /**
   * Remove damage number from active list and return to pool
   */
  despawnDamageNumber(damageNumber) {
    const index = this.damageNumbers.indexOf(damageNumber);
    if (index !== -1) {
      this.damageNumbers.splice(index, 1);
    }
    this.damageNumberPool.release(damageNumber);
  }
  updateEnemyAttacks() {
    if (!this.config) return;
    const now = Date.now();
    for (const enemy of this.enemies) {
      if (enemy.state !== "inRange") continue;
      const timeSinceLastFire = now - enemy.lastFireTime;
      if (timeSinceLastFire >= enemy.nextFireDelay) {
        if (enemy === this.bossEnemy) {
          this.fireBossBurst(enemy);
        } else {
          this.spawnEnemyProjectile(enemy);
        }
        this.scheduleNextAttack(enemy);
        enemy.lastFireTime = now;
      }
    }
  }
  /**
   * Fire boss burst attack per spec §8
   * "2 shots ~150 ms apart per cadence"
   */
  fireBossBurst(boss) {
    if (!this.config) return;
    const bossConfig = this.config.bossLand10;
    this.spawnEnemyProjectile(boss);
    setTimeout(() => {
      if (boss.state === "inRange" && this.enemies.includes(boss)) {
        this.spawnEnemyProjectile(boss);
      }
    }, bossConfig.burstGapMs);
  }
  /**
   * Schedule next attack based on enemy type
   */
  scheduleNextAttack(enemy) {
    if (!this.config) return;
    if (enemy === this.bossEnemy) {
      const bossConfig = this.config.bossLand10;
      enemy.nextFireDelay = this.randomBetween(
        bossConfig.fireIntervalMinSec * 1e3,
        bossConfig.fireIntervalMaxSec * 1e3
      );
    } else {
      const fireConfig = this.config.projectiles.enemy;
      enemy.nextFireDelay = this.randomBetween(
        fireConfig.fireIntervalMinSec * 1e3,
        fireConfig.fireIntervalMaxSec * 1e3
      );
    }
  }
  // Helper functions per spec §5 - HP/Damage Scaling
  /**
   * Calculate enemy HP based on land and distance per spec §5.2
   * Uses geometric growth across lands + linear steps within lands
   */
  calculateEnemyHP(type, land, distance) {
    if (!this.config) return new Decimal(100);
    const baseHP_L1 = this.getBaseHP(type);
    const G_HP = this.config.scaling.hpAcrossLandsMul;
    const baseHP_thisLand = baseHP_L1.mul(Decimal.pow(G_HP, land - 1));
    const withinLandMultiplier = this.calculateWithinLandMultiplier(
      land,
      distance,
      G_HP,
      "hp"
    );
    return baseHP_thisLand.mul(withinLandMultiplier);
  }
  /**
   * Calculate enemy damage based on land and distance per spec §5.2
   * Uses identical scaling to HP but with different multiplier
   */
  calculateEnemyDamage(type, land, distance) {
    if (!this.config) return new Decimal(10);
    const baseDmg_L1 = this.getBaseDamage(type);
    const G_DMG = this.config.scaling.dmgAcrossLandsMul;
    const baseDmg_thisLand = baseDmg_L1.mul(Decimal.pow(G_DMG, land - 1));
    const withinLandMultiplier = this.calculateWithinLandMultiplier(
      land,
      distance,
      G_DMG,
      "damage"
    );
    return baseDmg_thisLand.mul(withinLandMultiplier);
  }
  /**
   * Calculate within-land multiplier per spec §5.2
   * HP_at_meter = HP₀(L) * stepMul^(floor(metersIntoL / 5m))
   */
  calculateWithinLandMultiplier(land, totalDistance, acrossLandsMul, type) {
    if (!this.config) return new Decimal(1);
    const landDistanceKm = this.getLandDistanceKm(land);
    const metersIntoLand = this.getMetersIntoLand(totalDistance, land);
    const stepMeters = this.config.scaling.withinLandStepMeters;
    const totalSteps = Math.floor(landDistanceKm * 1e3 / stepMeters);
    const currentStep = Math.floor(metersIntoLand / stepMeters);
    if (totalSteps <= 0) return new Decimal(1);
    const R_end = this.config.scaling.withinLandEndRatio;
    const targetEndRatio = R_end * acrossLandsMul;
    const stepMul = Math.pow(targetEndRatio, 1 / totalSteps);
    return new Decimal(Math.pow(stepMul, currentStep));
  }
  /**
   * Get base HP for enemy type at Land 1 per spec §5.1
   */
  getBaseHP(type) {
    const PLAYER_BASE_DAMAGE = new Decimal(20);
    switch (type) {
      case "basicShooter":
        return PLAYER_BASE_DAMAGE.mul(2.3);
      default:
        return PLAYER_BASE_DAMAGE.mul(2.3);
    }
  }
  /**
   * Get base damage for enemy type at Land 1 per spec §5.1
   */
  getBaseDamage(type) {
    const PLAYER_BASE_HP = new Decimal(100);
    switch (type) {
      case "basicShooter":
        return PLAYER_BASE_HP.mul(0.08);
      default:
        return PLAYER_BASE_HP.mul(0.08);
    }
  }
  /**
   * Get land distance in km (TODO: integrate with actual distance system)
   */
  getLandDistanceKm(land) {
    return 1.5 * Math.pow(1.25, land - 1);
  }
  /**
   * Get meters into current land (TODO: integrate with actual distance system)
   */
  getMetersIntoLand(totalDistance, land) {
    return totalDistance.mod(this.getLandDistanceKm(land) * 1e3).toNumber();
  }
  /**
   * Calculate boss HP/damage multipliers per spec §5 & spec Boss section
   */
  calculateBossStats(land, distance) {
    if (!this.config) {
      return { hp: new Decimal(1e3), damage: new Decimal(50) };
    }
    const endOfLandHP = this.calculateEnemyHP("basicShooter", land, distance);
    const endOfLandDamage = this.calculateEnemyDamage("basicShooter", land, distance);
    const bossHP = endOfLandHP.mul(this.config.bossLand10.hpMultVsEndOfLand);
    const bossDamage = endOfLandDamage.mul(this.config.bossLand10.dmgMultVsEndOfLand);
    return { hp: bossHP, damage: bossDamage };
  }
  randomBetween(min, max) {
    return min + Math.random() * (max - min);
  }
  // Public methods for external game events
  /**
   * Set callback for boss death event per spec §8
   */
  setBossDeathCallback(callback) {
    this.onBossDeathCallback = callback;
  }
  /**
   * Check if boss is currently active
   */
  isBossActive() {
    return this.bossEnemy !== null && this.enemies.includes(this.bossEnemy);
  }
  /**
   * Get boss enemy for special rendering/UI
   */
  getBoss() {
    return this.bossEnemy && this.enemies.includes(this.bossEnemy) ? this.bossEnemy : null;
  }
  /**
   * Check if spawns are disabled (for external distance system)
   */
  areSpawnsDisabled() {
    return this.regularSpawnsDisabled;
  }
  /**
   * Clear all enemies (called on player death per spec §2.6)
   */
  clearAllEnemies() {
    while (this.enemies.length > 0) {
      const enemy = this.enemies.pop();
      this.enemyPool.release(enemy);
    }
    while (this.projectiles.length > 0) {
      const projectile = this.projectiles.pop();
      this.projectilePool.release(projectile);
    }
    while (this.damageNumbers.length > 0) {
      const damageNumber = this.damageNumbers.pop();
      this.damageNumberPool.release(damageNumber);
    }
    this.bossSpawned = false;
  }
  /**
   * Handle player hitting an enemy (called from external collision detection)
   */
  damageEnemy(enemyId, damage) {
    const enemy = this.enemies.find((e) => e.id === enemyId);
    if (!enemy || enemy.state === "dead") {
      return { killed: false, overkill: new Decimal(0) };
    }
    enemy.currentHP = enemy.currentHP.minus(damage);
    if (!enemy.hpBarVisible) {
      enemy.hpBarVisible = true;
    }
    this.spawnDamageNumber(enemy.x, enemy.y - 10, damage, false);
    telemetry.logEnemyHit(enemy.type, damage);
    if (enemy.currentHP.lte(0)) {
      const overkill = enemy.currentHP.abs();
      enemy.state = "dead";
      this.despawnEnemy(enemy, "killed");
      return { killed: true, overkill };
    }
    return { killed: false, overkill: new Decimal(0) };
  }
  /**
   * Handle enemy hitting player (called from projectile collision)
   */
  damagePlayer(damage) {
    this.spawnDamageNumber(this.dragonX, this.dragonY - 20, damage, true);
    telemetry.logPlayerHit(damage);
  }
  // 🚨 CTO REQUESTED: Debug counters for spawn/render integration
  spawnCount = 0;
  cullCount = 0;
  lastSpawnTime = Date.now();
  spawnsPerSecond = 0;
  /**
   * Get debug information for CTO punch list debugging
   */
  getDebugInfo() {
    const inRangeCount = this.enemies.filter((e) => e.state === "inRange").length;
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
        damageNumbers: this.damageNumberPool.getPoolSize()
      }
    };
  }
}
const enemySystem = new EnemySystem();
const enemyStore = writable({
  active: 0,
  cap: 48,
  inRange: 0
});
const projectileStore = writable({
  active: 0,
  cap: 160
});
const combatState = writable({
  tracking: false
});
const metrics = writable({
  spawnsEWMA: 0,
  cullCount: 0
});
function EnemyRenderer($$payload, $$props) {
  push();
  let combatWidth = fallback($$props["combatWidth"], 800);
  let combatHeight = fallback($$props["combatHeight"], 200);
  let dragonX = fallback($$props["dragonX"], 80);
  let dragonY = fallback($$props["dragonY"], 100);
  let playerIsReversing = fallback($$props["playerIsReversing"], false);
  let playerIsTraveling = fallback($$props["playerIsTraveling"], false);
  let currentLand = fallback($$props["currentLand"], 1);
  let currentDistance = fallback($$props["currentDistance"], "0");
  onDestroy(() => {
  });
  enemySystem.getEnemies();
  enemySystem.getProjectiles();
  enemySystem.getDamageNumbers();
  $$payload.out.push(`<canvas${attr("width", combatWidth)}${attr("height", combatHeight)} style="position: absolute; top: 0; left: 0; pointer-events: none; z-index: 1;" class="svelte-iyeoxk"></canvas>`);
  bind_props($$props, {
    combatWidth,
    combatHeight,
    dragonX,
    dragonY,
    playerIsReversing,
    playerIsTraveling,
    currentLand,
    currentDistance
  });
  pop();
}
function YouWinDialog($$payload, $$props) {
  push();
  let show = fallback($$props["show"], false);
  if (show) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="dialog-overlay svelte-m0hrd2"><div class="you-win-dialog svelte-m0hrd2"><div class="victory-header svelte-m0hrd2"><div class="victory-title svelte-m0hrd2">🎉 YOU WIN! 🎉</div> <div class="victory-subtitle svelte-m0hrd2">Land 10 Boss Defeated!</div></div> <div class="victory-content svelte-m0hrd2"><p class="victory-message svelte-m0hrd2">Congratulations! You have successfully defeated the mighty Land 10 boss 
          and conquered the Verdant Dragonplains!</p> <div class="victory-stats svelte-m0hrd2"><div class="stat-item svelte-m0hrd2"><span class="stat-label svelte-m0hrd2">Journey Complete</span> <span class="stat-value svelte-m0hrd2">Land 10 Cleared</span></div></div></div> <div class="victory-actions svelte-m0hrd2"><button class="return-btn svelte-m0hrd2">Return to Draconia</button></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { show });
  pop();
}
function EnemyDebugOverlay($$payload, $$props) {
  push();
  derived(
    [
      enemyStore,
      projectileStore,
      metrics,
      combatState,
      distanceUI,
      distanceWorker,
      enemyConfigLoaded
    ],
    ([$enemies, $proj, $m, $combat, $dUI, $dW, $cfg]) => ({
      enemies: `${$enemies.active}/${$enemies.cap}`,
      projectiles: `${$proj.active}/${$proj.cap}`,
      spawnsPerSec: $m.spawnsEWMA.toFixed(2),
      cullCount: $m.cullCount,
      inRange: $enemies.inRange,
      tracking: $combat.tracking ? "YES" : "NO",
      distance: `${$dUI.km.toFixed(2)} / ${$dW.km.toFixed(2)} km`,
      cfgLoaded: $cfg ? "true" : "false"
    })
  );
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  pop();
}
const debugOverlayEnabled = readable(false);
function DragonCombatArea($$payload, $$props) {
  push();
  var $$store_subs;
  let devOverlay, distanceHeader, isRunning, isReversing, canReverse, isTraveling, hpPercentage, hpColorClass;
  let showYouWinDialog = false;
  devOverlay = store_get($$store_subs ??= {}, "$debugOverlayEnabled", debugOverlayEnabled);
  distanceHeader = store_get($$store_subs ??= {}, "$distanceState110", distanceState110) ? formatDistanceHeader(new Decimal(store_get($$store_subs ??= {}, "$distanceState110", distanceState110).runTotalKm)) : "Land 1 | Verdant Dragonplains 0.00 km";
  isRunning = store_get($$store_subs ??= {}, "$dragonState110", dragonState110).travelState === "ADVANCING";
  isReversing = store_get($$store_subs ??= {}, "$dragonState110", dragonState110).travelState === "RETREATING";
  canReverse = store_get($$store_subs ??= {}, "$distanceState110", distanceState110) ? store_get($$store_subs ??= {}, "$distanceState110", distanceState110).currentLevel > 1 || new Decimal(store_get($$store_subs ??= {}, "$distanceState110", distanceState110).runTotalKm).gt(0) : false;
  isTraveling = isRunning || isReversing;
  hpPercentage = store_get($$store_subs ??= {}, "$dragonState110", dragonState110).hpPercentage;
  hpColorClass = hpPercentage <= 0.05 ? "critical" : hpPercentage <= 0.1 ? "low" : hpPercentage <= 0.3 ? "warning" : "normal";
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    $$payload2.out.push(`<div class="combat-strip combat-root svelte-1suxhq1"><div class="distance-header svelte-1suxhq1">${escape_html(distanceHeader)}</div> <div class="controls-row svelte-1suxhq1"><div class="controls svelte-1suxhq1"><button${attr_class("control-btn svelte-1suxhq1", void 0, { "active": isReversing })} title="Reverse" aria-label="Reverse"${attr("disabled", !canReverse, true)}>◀</button> <button class="control-btn svelte-1suxhq1" title="Stop" aria-label="Stop"${attr("disabled", !isTraveling, true)}>■</button> <button${attr_class("control-btn svelte-1suxhq1", void 0, { "active": isRunning })} title="Start" aria-label="Start"${attr("disabled", isTraveling, true)}>▶</button></div> <div class="distance-bar svelte-1suxhq1" aria-label="Level Progress"><div class="fill svelte-1suxhq1"${attr_style(`width: ${stringify(store_get($$store_subs ??= {}, "$distanceState110", distanceState110)?.levelProgress ? store_get($$store_subs ??= {}, "$distanceState110", distanceState110).levelProgress * 100 : 0)}%`)}></div></div></div> <div class="dragon svelte-1suxhq1" aria-hidden="true">🐉 <div class="hp-chip svelte-1suxhq1"><div${attr_class(`hp-bar ${stringify(hpColorClass)}`, "svelte-1suxhq1")}${attr_style(`width: ${stringify(hpPercentage * 100)}%`)}></div> <span class="hp-text svelte-1suxhq1">${escape_html(store_get($$store_subs ??= {}, "$dragonState110", dragonState110).hp)}</span></div></div> `);
    EnemyRenderer($$payload2, {
      combatWidth: 800,
      combatHeight: 250,
      dragonX: 80,
      dragonY: 125,
      playerIsReversing: isReversing,
      playerIsTraveling: isTraveling,
      currentLand: store_get($$store_subs ??= {}, "$distanceState110", distanceState110)?.currentLevel || 1,
      currentDistance: store_get($$store_subs ??= {}, "$distanceState110", distanceState110)?.runTotalKm || "0"
    });
    $$payload2.out.push(`<!----> `);
    if (devOverlay) {
      $$payload2.out.push("<!--[-->");
      EnemyDebugOverlay($$payload2);
    } else {
      $$payload2.out.push("<!--[!-->");
    }
    $$payload2.out.push(`<!--]--></div> `);
    YouWinDialog($$payload2, {
      get show() {
        return showYouWinDialog;
      },
      set show($$value) {
        showYouWinDialog = $$value;
        $$settled = false;
      }
    });
    $$payload2.out.push(`<!---->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function CurrencyPanel($$payload, $$props) {
  push();
  var $$store_subs;
  let currencyList;
  function formatCurrencyAmount(amount) {
    return formatDecimal(new Decimal(amount));
  }
  currencyList = [
    {
      icon: "🔮",
      name: "Arcana",
      amount: store_get($$store_subs ??= {}, "$currencies110", currencies110).arcana,
      locked: false
    },
    {
      icon: "🪙",
      name: "Forgegold",
      amount: store_get($$store_subs ??= {}, "$currencies110", currencies110).forgegold,
      locked: true
    },
    {
      icon: "🐲",
      name: "Dragonscales",
      amount: store_get($$store_subs ??= {}, "$currencies110", currencies110).dragonscales,
      locked: true
    },
    {
      icon: "💎",
      name: "Gems",
      amount: store_get($$store_subs ??= {}, "$currencies110", currencies110).gems,
      locked: true
    },
    { icon: "⚡", name: "Essence", amount: "0", locked: true },
    { icon: "🌟", name: "Stardust", amount: "0", locked: true }
  ];
  const each_array = ensure_array_like(currencyList);
  $$payload.out.push(`<aside class="currency-rail svelte-1skompy"><div class="currency-content svelte-1skompy"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let currency = each_array[$$index];
    $$payload.out.push(`<div${attr_class("currency-item svelte-1skompy", void 0, { "locked": currency.locked })}><div class="currency-icon svelte-1skompy">${escape_html(currency.icon)}</div> <div class="currency-name svelte-1skompy">${escape_html(currency.name)}</div> <div class="currency-amount svelte-1skompy">`);
    if (currency.locked) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`🔒`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`${escape_html(formatCurrencyAmount(currency.amount))}`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  }
  $$payload.out.push(`<!--]--></div></aside>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function MainTabsRow($$payload, $$props) {
  push();
  let activeTab = $$props["activeTab"];
  let setActiveTab = $$props["setActiveTab"];
  const leftTabs = [
    { id: "enchant", label: "Enchant" },
    { id: "return", label: "Return to Draconia" }
  ];
  const rightTabs = [{ id: "settings", label: "Settings" }];
  const each_array = ensure_array_like(leftTabs);
  const each_array_1 = ensure_array_like(rightTabs);
  $$payload.out.push(`<nav class="tabs-row svelte-1qe57pb"><div class="tabs-left svelte-1qe57pb" role="tablist" aria-label="Gameplay Tabs"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let tab = each_array[$$index];
    $$payload.out.push(`<button type="button"${attr_class(`tab ${stringify(activeTab === tab.id ? "selected" : "")}`, "svelte-1qe57pb")} role="tab"${attr("aria-selected", activeTab === tab.id)}${attr("tabindex", activeTab === tab.id ? 0 : -1)}>${escape_html(tab.label)}</button>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="tabs-right svelte-1qe57pb" role="tablist" aria-label="Meta Tabs"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let tab = each_array_1[$$index_1];
    $$payload.out.push(`<button type="button"${attr_class(`tab ${stringify(activeTab === tab.id ? "selected" : "")}`, "svelte-1qe57pb")} role="tab"${attr("aria-selected", activeTab === tab.id)}${attr("tabindex", activeTab === tab.id ? 0 : -1)}>${escape_html(tab.label)}</button>`);
  }
  $$payload.out.push(`<!--]--></div></nav> `);
  {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { activeTab, setActiveTab });
  pop();
}
const ENCHANT_BASE_COSTS = {
  firepower: new Decimal(10),
  scales: new Decimal(12)
};
function calculateEnchantCost(enchantType, fromLevel) {
  if (fromLevel >= 500) return new Decimal(Infinity);
  const base = ENCHANT_BASE_COSTS[enchantType];
  const targetLevel = fromLevel + 1;
  const exponent = targetLevel - 1;
  const cost = base.mul(Decimal.pow(1.4, exponent));
  return cost.ceil();
}
function getTierBounds(tier) {
  switch (tier) {
    case 1:
      return [0, 50];
    case 2:
      return [51, 200];
    case 3:
      return [201, 500];
  }
}
function calculateTierUpCost(enchantType, currentTier) {
  if (currentTier >= 3) return new Decimal(Infinity);
  const [, maxLevel] = getTierBounds(currentTier);
  const lastLevelCost = calculateEnchantCost(enchantType, maxLevel - 1);
  return lastLevelCost.mul(3);
}
function canTierUp(enchant, arcana, enchantType) {
  if (enchant.tierUnlocked >= 3) return false;
  const [, maxLevel] = getTierBounds(enchant.tierUnlocked);
  if (enchant.level < maxLevel) return false;
  const cost = calculateTierUpCost(enchantType, enchant.tierUnlocked);
  return arcana.gte(cost);
}
function getTierProgress(level, tier) {
  const [minLevel, maxLevel] = getTierBounds(tier);
  if (level < minLevel) return 0;
  if (level >= maxLevel) return 1;
  const tierRange = maxLevel - minLevel;
  const progress = level - minLevel;
  return progress / tierRange;
}
function getTierTickPositions(tier) {
  const [minLevel, maxLevel] = getTierBounds(tier);
  const ticks = [];
  const tierRange = maxLevel - minLevel;
  for (let level = minLevel + 10; level < maxLevel; level += 10) {
    const position = (level - minLevel) / tierRange;
    ticks.push(position * 100);
  }
  return ticks;
}
function ContextControlsPanel($$payload, $$props) {
  push();
  var $$store_subs;
  let enchants, arcanaAmount;
  function getPurchaseCost(enchantType) {
    const cost = calculateEnchantCost(enchantType, enchants[enchantType].level);
    return formatDecimal(cost);
  }
  function canPurchase(enchantType) {
    if (!store_get($$store_subs ??= {}, "$gameState110", gameState110)) return false;
    return canAffordEnchant(enchantType, store_get($$store_subs ??= {}, "$gameState110", gameState110));
  }
  function canTierUpEnchant(enchantType) {
    const enchant = enchants[enchantType];
    return canTierUp(enchant, arcanaAmount, enchantType);
  }
  function getTierUpCost(enchantType) {
    const cost = calculateTierUpCost(enchantType, enchants[enchantType].tierUnlocked);
    return formatDecimal(cost);
  }
  function getTickPositions(tier) {
    return getTierTickPositions(tier);
  }
  enchants = store_get($$store_subs ??= {}, "$enchants110", enchants110);
  arcanaAmount = new Decimal(store_get($$store_subs ??= {}, "$currencies110", currencies110).arcana);
  const each_array = ensure_array_like([1, 2, 3]);
  const each_array_1 = ensure_array_like(getTickPositions(1));
  const each_array_2 = ensure_array_like([1, 2, 3]);
  const each_array_3 = ensure_array_like(getTickPositions(1));
  $$payload.out.push(`<section class="enchant-section svelte-iwts9g"><div class="enchant-row svelte-iwts9g"><div class="purchase-button svelte-iwts9g"><button class="purchase-btn svelte-iwts9g"${attr("disabled", !canPurchase("firepower"), true)}><div class="purchase-name svelte-iwts9g">Firepower</div> <div class="purchase-cost svelte-iwts9g">Cost: ${escape_html(getPurchaseCost("firepower"))} Arcana</div> <div class="purchase-level svelte-iwts9g">Lvl ${escape_html(enchants.firepower.level)} → ${escape_html(enchants.firepower.level + 1)}</div></button></div> <div class="enchant-center svelte-iwts9g"><div class="tier-tabs svelte-iwts9g"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let tier = each_array[$$index];
    $$payload.out.push(`<button${attr_class(`tier-tab ${stringify(tier === 1 ? "active" : "")}`, "svelte-iwts9g")}${attr("disabled", tier > enchants.firepower.tierUnlocked, true)}>T${escape_html(tier)}</button>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="tier-progress-bar svelte-iwts9g"><div class="progress-fill firepower svelte-iwts9g"${attr_style(`width: ${stringify(getTierProgress(enchants.firepower.level, 1) * 100)}%`)}></div> <!--[-->`);
  for (let $$index_1 = 0, $$length = each_array_1.length; $$index_1 < $$length; $$index_1++) {
    let tickPos = each_array_1[$$index_1];
    $$payload.out.push(`<div class="tick-marker svelte-iwts9g"${attr_style(`left: ${stringify(tickPos)}%`)}></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="tier-up-button svelte-iwts9g"><button class="tier-up-btn svelte-iwts9g"${attr("disabled", !canTierUpEnchant("firepower"), true)}>TIER UP <div class="tier-up-cost svelte-iwts9g">${escape_html(getTierUpCost("firepower"))} Arcana</div></button></div></div> <div class="enchant-row svelte-iwts9g"><div class="purchase-button svelte-iwts9g"><button class="purchase-btn svelte-iwts9g"${attr("disabled", !canPurchase("scales"), true)}><div class="purchase-name svelte-iwts9g">Scales</div> <div class="purchase-cost svelte-iwts9g">Cost: ${escape_html(getPurchaseCost("scales"))} Arcana</div> <div class="purchase-level svelte-iwts9g">Lvl ${escape_html(enchants.scales.level)} → ${escape_html(enchants.scales.level + 1)}</div></button></div> <div class="enchant-center svelte-iwts9g"><div class="tier-tabs svelte-iwts9g"><!--[-->`);
  for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
    let tier = each_array_2[$$index_2];
    $$payload.out.push(`<button${attr_class(`tier-tab ${stringify(tier === 1 ? "active" : "")}`, "svelte-iwts9g")}${attr("disabled", tier > enchants.scales.tierUnlocked, true)}>T${escape_html(tier)}</button>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="tier-progress-bar svelte-iwts9g"><div class="progress-fill scales svelte-iwts9g"${attr_style(`width: ${stringify(getTierProgress(enchants.scales.level, 1) * 100)}%`)}></div> <!--[-->`);
  for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
    let tickPos = each_array_3[$$index_3];
    $$payload.out.push(`<div class="tick-marker svelte-iwts9g"${attr_style(`left: ${stringify(tickPos)}%`)}></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> <div class="tier-up-button svelte-iwts9g"><button class="tier-up-btn svelte-iwts9g"${attr("disabled", !canTierUpEnchant("scales"), true)}>TIER UP <div class="tier-up-cost svelte-iwts9g">${escape_html(getTierUpCost("scales"))} Arcana</div></button></div></div></section>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function SettingsPage($$payload, $$props) {
  push();
  var $$store_subs;
  let debugMode, bufferSize;
  debugMode = store_get($$store_subs ??= {}, "$gameState110", gameState110)?.debugMode || false;
  bufferSize = telemetry.getBufferSize();
  $$payload.out.push(`<div class="settings-page svelte-1sx7m23"><div class="settings-header svelte-1sx7m23"><h1 class="svelte-1sx7m23">Settings</h1></div> <div class="settings-content svelte-1sx7m23"><section class="settings-section svelte-1sx7m23"><div class="coming-soon svelte-1sx7m23"><h2 class="svelte-1sx7m23">Settings Coming Soon…</h2> <p class="svelte-1sx7m23">Advanced game settings and preferences will be available in future updates.</p></div></section> <section class="settings-section svelte-1sx7m23"><h3 class="svelte-1sx7m23">Data &amp; Logs</h3> <div class="setting-row svelte-1sx7m23"><div class="setting-info svelte-1sx7m23"><strong class="svelte-1sx7m23">Download Logs</strong> <p class="svelte-1sx7m23">Export gameplay telemetry as NDJSON format (${escape_html(bufferSize)} events)</p></div> <button class="btn-primary svelte-1sx7m23">Download Logs</button></div> <div class="setting-row svelte-1sx7m23"><div class="setting-info svelte-1sx7m23"><strong class="svelte-1sx7m23">Clear Logs</strong> <p class="svelte-1sx7m23">Remove all stored telemetry data</p></div> <button class="btn-secondary svelte-1sx7m23">Clear All Logs</button></div></section> <section class="settings-section svelte-1sx7m23"><div class="setting-row svelte-1sx7m23"><div class="setting-info svelte-1sx7m23"><strong class="svelte-1sx7m23">Debug Mode</strong> <p class="svelte-1sx7m23">Enable developer controls and testing features</p></div> <label class="toggle svelte-1sx7m23"><input type="checkbox"${attr("checked", debugMode, true)} class="svelte-1sx7m23"/> <span class="toggle-slider svelte-1sx7m23"></span></label></div> `);
  if (debugMode) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="debug-controls svelte-1sx7m23"><h4 class="svelte-1sx7m23">Debug Controls</h4> <div class="debug-group svelte-1sx7m23"><h5 class="svelte-1sx7m23">Add Arcana</h5> <div class="button-row svelte-1sx7m23"><button class="btn-debug svelte-1sx7m23">+10</button> <button class="btn-debug svelte-1sx7m23">+1e3</button> <button class="btn-debug svelte-1sx7m23">+1e6</button></div></div> <div class="debug-group svelte-1sx7m23"><h5 class="svelte-1sx7m23">Force HP %</h5> <div class="button-row svelte-1sx7m23"><button class="btn-debug svelte-1sx7m23">100%</button> <button class="btn-debug svelte-1sx7m23">50%</button> <button class="btn-debug svelte-1sx7m23">20%</button> <button class="btn-debug svelte-1sx7m23">10%</button> <button class="btn-debug svelte-1sx7m23">5%</button></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></section></div></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
const Shooter = z.object({
  meanIntervalSec: z.number().positive(),
  minDeltaSec: z.number().nonnegative(),
  maxDeltaSec: z.number().positive()
}).refine((s) => s.maxDeltaSec >= s.minDeltaSec);
z.object({
  spawning: z.object({ basicShooter: Shooter }),
  movement: z.object({
    ownSpeedX_px_per_s: z.number().positive(),
    jitterPercent: z.number().min(0).max(0.5),
    reverseSpawnSpeedScale: z.number().min(0).max(2),
    reverseAdvanceScale_outOfRange: z.number().min(0).max(2),
    attackRangeFrac_ofCombatWidth: z.number().min(0.1).max(0.9),
    arrivalEpsilon_px: z.number().min(0.5).max(10)
  }),
  projectiles: z.object({
    enemy: z.object({
      speed_px_per_s: z.number().positive(),
      lifetimeSec: z.number().positive(),
      fireIntervalMinSec: z.number().positive(),
      fireIntervalMaxSec: z.number().positive()
    }).refine((p) => p.fireIntervalMaxSec >= p.fireIntervalMinSec),
    player: z.object({ chainHitsMax: z.number().int().min(0).max(8) })
  }),
  caps: z.object({
    enemies: z.number().int().min(1).max(512),
    projectiles: z.number().int().min(1).max(2048),
    damageNumbers: z.number().int().min(1).max(2048)
  }),
  scaling: z.object({
    hpAcrossLandsMul: z.number().min(1.01).max(3),
    dmgAcrossLandsMul: z.number().min(1.01).max(3),
    withinLandEndRatio: z.number().min(0.3).max(0.99),
    withinLandStepMeters: z.number().int().min(1).max(50),
    baseHP_atLand1_formula: z.string().optional(),
    baseDmg_atLand1_formula: z.string().optional()
  }),
  bossLand10: z.object({
    hpMultVsEndOfLand: z.number().min(1).max(10),
    dmgMultVsEndOfLand: z.number().min(1).max(10),
    burstShots: z.number().int().min(1).max(5),
    burstGapMs: z.number().int().min(50).max(1e3),
    fireIntervalMinSec: z.number().positive(),
    fireIntervalMaxSec: z.number().positive()
  }),
  ui: z.object({
    enemyHpBar: z.object({
      visibleOnlyWhenDamaged: z.boolean(),
      color: z.string(),
      thicknessPx: z.number().positive(),
      widthPctOfEnemy: z.number().min(10).max(200),
      hideDelayAtFullSec: z.number().nonnegative()
    }),
    damageNumbers: z.object({
      popScale: z.number().positive(),
      floatUpPx: z.number(),
      fadeDurationSec: z.number().positive(),
      offsetJitterX: z.number().nonnegative(),
      offsetJitterY: z.number().nonnegative(),
      playerHitColor: z.string(),
      enemyHitColor: z.string(),
      maxDotHz: z.number().positive()
    })
  }).optional()
});
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let state;
  let activeTab = "enchant";
  function setActiveTab(tab) {
    activeTab = tab;
  }
  state = store_get($$store_subs ??= {}, "$gameState110", gameState110);
  $$payload.out.push(`<div class="page svelte-1b91on3">`);
  DragonCombatArea($$payload);
  $$payload.out.push(`<!----> `);
  CurrencyPanel($$payload);
  $$payload.out.push(`<!----> `);
  MainTabsRow($$payload, { activeTab, setActiveTab });
  $$payload.out.push(`<!----> `);
  if (activeTab === "enchant") {
    $$payload.out.push("<!--[-->");
    ContextControlsPanel($$payload);
  } else {
    $$payload.out.push("<!--[!-->");
    if (activeTab === "settings") {
      $$payload.out.push("<!--[-->");
      SettingsPage($$payload);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]-->`);
  }
  $$payload.out.push(`<!--]--></div> `);
  if (!state) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="loading svelte-1b91on3">Loading Dragon Chronicles...</div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
