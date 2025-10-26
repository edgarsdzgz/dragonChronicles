import { Application } from 'pixi.js';

export interface CombatStats {
  damageDealt: number;
  damageTaken: number;
  enemiesKilled: number;
  criticalHits: number;
  totalHits: number;
  accuracy: number;
}

export interface DragonStats {
  health: number;
  maxHealth: number;
  damage: number;
  criticalChance: number;
  position: { x: number; y: number };
}

export class CombatManager {
  private app: Application;
  private stats: CombatStats;
  private dragonStats: DragonStats;
  private isActive: boolean = false;

  constructor(app: Application) {
    this.app = app;

    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      enemiesKilled: 0,
      criticalHits: 0,
      totalHits: 0,
      accuracy: 0,
    };

    this.dragonStats = {
      health: 100,
      maxHealth: 100,
      damage: 10,
      criticalChance: 0.1,
      position: { x: 150, y: 300 },
    };
  }

  start(): void {
    this.isActive = true;
  }

  stop(): void {
    this.isActive = false;
  }

  update(_deltaTime: number): void {
    if (!this.isActive) return;

    // Update combat logic here
    this.updateAccuracy();
  }

  private updateAccuracy(): void {
    if (this.stats.totalHits > 0) {
      this.stats.accuracy = (this.stats.totalHits - this.stats.criticalHits) / this.stats.totalHits;
    }
  }

  dealDamage(damage: number, isCritical: boolean = false): void {
    this.stats.damageDealt += damage;
    this.stats.totalHits++;

    if (isCritical) {
      this.stats.criticalHits++;
    }
  }

  takeDamage(damage: number): void {
    this.stats.damageTaken += damage;
    this.dragonStats.health = Math.max(0, this.dragonStats.health - damage);
  }

  heal(amount: number): void {
    this.dragonStats.health = Math.min(
      this.dragonStats.maxHealth,
      this.dragonStats.health + amount,
    );
  }

  killEnemy(): void {
    this.stats.enemiesKilled++;
  }

  getStats(): CombatStats {
    return { ...this.stats };
  }

  getDragonStats(): DragonStats {
    return { ...this.dragonStats };
  }

  setDragonPosition(x: number, y: number): void {
    this.dragonStats.position.x = x;
    this.dragonStats.position.y = y;
  }

  resetStats(): void {
    this.stats = {
      damageDealt: 0,
      damageTaken: 0,
      enemiesKilled: 0,
      criticalHits: 0,
      totalHits: 0,
      accuracy: 0,
    };
  }

  destroy(): void {
    this.stop();
  }
}
