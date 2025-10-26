import { Application } from 'pixi.js';
import { CombatManager } from './combat-manager';
import { ProjectileSystem } from './projectile-system';

export interface GameplayConfig {
  autoPlay: boolean;
  enemySpawnRate: number;
  maxEnemies: number;
  enemyTypes: string[];
  dragonSpeed: number;
  projectileSpeed: number;
}

export interface GameplayStats {
  enemiesKilled: number;
  damageDealt: number;
  timePlayed: number;
  currentEnemies: number;
  combatStats: unknown;
  projectileStats: unknown;
}

export class GameplayLoopManager {
  private app: Application;
  private combatManager: CombatManager;
  private projectileSystem: ProjectileSystem;
  private config: GameplayConfig;
  private stats: GameplayStats;
  private isActive: boolean = false;
  private lastSpawnTime: number = 0;
  private startTime: number = 0;

  constructor(app: Application, config: GameplayConfig) {
    this.app = app;
    this.config = config;
    this.combatManager = new CombatManager(app);
    this.projectileSystem = new ProjectileSystem(app);

    this.stats = {
      enemiesKilled: 0,
      damageDealt: 0,
      timePlayed: 0,
      currentEnemies: 0,
      combatStats: {},
      projectileStats: {},
    };
  }

  start(): void {
    this.isActive = true;
    this.startTime = performance.now();
    this.lastSpawnTime = this.startTime;
  }

  stop(): void {
    this.isActive = false;
  }

  update(deltaTime: number): void {
    if (!this.isActive) return;

    // Update time played
    this.stats.timePlayed = performance.now() - this.startTime;

    // Update combat system
    this.combatManager.update(deltaTime);

    // Update projectile system
    this.projectileSystem.update(deltaTime);

    // Handle enemy spawning
    this.handleEnemySpawning(deltaTime);

    // Handle collisions
    this.handleCollisions();

    // Update stats
    this.updateStats();
  }

  private handleEnemySpawning(_deltaTime: number): void {
    if (!this.config.autoPlay) return;

    const currentTime = performance.now();
    const timeSinceLastSpawn = currentTime - this.lastSpawnTime;
    const spawnInterval = 1000 / this.config.enemySpawnRate; // Convert rate to interval

    if (timeSinceLastSpawn >= spawnInterval && this.stats.currentEnemies < this.config.maxEnemies) {
      this.spawnRandomEnemy();
      this.lastSpawnTime = currentTime;
    }
  }

  private spawnRandomEnemy(): void {
    if (this.config.enemyTypes.length === 0) return;

    const randomType =
      this.config.enemyTypes[Math.floor(Math.random() * this.config.enemyTypes.length)];
    this.spawnEnemy(randomType);
  }

  spawnEnemy(type: string): void {
    // This would integrate with the enemy spawning system
    this.stats.currentEnemies++;
  }

  private handleCollisions(): void {
    // This would handle projectile-enemy collisions
    const collisions: unknown[] = []; // Placeholder for collision detection

    collisions.forEach((_collision) => {
      // Handle collision logic
      this.stats.enemiesKilled++;
      this.stats.currentEnemies = Math.max(0, this.stats.currentEnemies - 1);
    });
  }

  private updateStats(): void {
    // Update current enemy count
    this.stats.currentEnemies = this.getCurrentEnemyCount();

    // Update combat stats
    this.stats.combatStats = this.combatManager.getStats();

    // Update projectile stats
    this.stats.projectileStats = this.projectileSystem.getStats();
  }

  private getCurrentEnemyCount(): number {
    // This would get the actual count from the enemy system
    return 0; // Placeholder
  }

  findNearestEnemy(_x: number, _y: number): unknown {
    // This would find the nearest enemy to the given position
    return null; // Placeholder
  }

  getStats(): GameplayStats {
    return { ...this.stats };
  }

  getCombatManager(): CombatManager {
    return this.combatManager;
  }

  getProjectileSystem(): ProjectileSystem {
    return this.projectileSystem;
  }

  destroy(): void {
    this.stop();
    this.combatManager.destroy();
    this.projectileSystem.destroy();
  }
}
