import { Application, Sprite, Container, Graphics } from 'pixi.js';
import { Z_LAYERS, setZIndex } from '../rendering/layer-manager';

export interface Projectile {
  id: string;
  sprite: Sprite;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  damage: number;
  life: number;
  maxLife: number;
  type: string;
}

export interface ProjectileStats {
  activeProjectiles: number;
  projectilesFired: number;
  projectilesHit: number;
  totalDamage: number;
}

export class ProjectileSystem {
  private app: Application;
  private container: Container;
  private projectiles: Map<string, Projectile> = new Map();
  private stats: ProjectileStats;
  private nextId: number = 0;

  constructor(app: Application) {
    this.app = app;
    this.container = new Container();
    this.container.label = 'projectile-system';
    setZIndex(this.container, Z_LAYERS.PROJECTILES);
    this.app.stage.addChild(this.container);

    this.stats = {
      activeProjectiles: 0,
      projectilesFired: 0,
      projectilesHit: 0,
      totalDamage: 0,
    };
  }

  fireProjectile(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    damage: number = 10,
    type: string = 'fireball',
  ): string {
    const id = `projectile_${this.nextId++}`;

    // Calculate velocity
    const dx = targetX - x;
    const dy = targetY - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const speed = 5; // pixels per frame

    const velocityX = (dx / distance) * speed;
    const velocityY = (dy / distance) * speed;

    // Create projectile sprite (using a simple circle for now)
    const graphics = new Graphics();
    graphics.circle(0, 0, 8);
    graphics.fill(type === 'fireball' ? 0xff4500 : 0x8b4513);
    graphics.stroke({ color: 0x000000, width: 2 });

    const sprite = new Sprite(graphics.generateCanvasTexture());
    sprite.x = x;
    sprite.y = y;
    sprite.anchor.set(0.5, 0.5);

    const projectile: Projectile = {
      id,
      sprite,
      x,
      y,
      velocityX,
      velocityY,
      damage,
      life: 0,
      maxLife: 3000, // 3 seconds
      type,
    };

    this.projectiles.set(id, projectile);
    this.container.addChild(sprite);

    this.stats.activeProjectiles++;
    this.stats.projectilesFired++;

    return id;
  }

  update(deltaTime: number): void {
    const toRemove: string[] = [];

    this.projectiles.forEach((projectile) => {
      // Update position
      projectile.x += projectile.velocityX;
      projectile.y += projectile.velocityY;
      projectile.sprite.x = projectile.x;
      projectile.sprite.y = projectile.y;

      // Update life
      projectile.life += deltaTime;

      // Check if expired
      if (projectile.life >= projectile.maxLife) {
        toRemove.push(projectile.id);
      }

      // Check bounds (remove if off-screen)
      if (
        projectile.x < -100 ||
        projectile.x > this.app.screen.width + 100 ||
        projectile.y < -100 ||
        projectile.y > this.app.screen.height + 100
      ) {
        toRemove.push(projectile.id);
      }
    });

    // Remove expired projectiles
    toRemove.forEach((id) => {
      this.removeProjectile(id);
    });
  }

  removeProjectile(id: string): void {
    const projectile = this.projectiles.get(id);
    if (!projectile) return;

    if (projectile.sprite.parent) {
      projectile.sprite.parent.removeChild(projectile.sprite);
    }
    projectile.sprite.destroy();
    this.projectiles.delete(id);

    this.stats.activeProjectiles--;
  }

  getProjectile(id: string): Projectile | undefined {
    return this.projectiles.get(id);
  }

  getAllProjectiles(): Projectile[] {
    return Array.from(this.projectiles.values());
  }

  getStats(): ProjectileStats {
    return { ...this.stats };
  }

  clearAll(): void {
    this.projectiles.forEach((projectile) => {
      if (projectile.sprite.parent) {
        projectile.sprite.parent.removeChild(projectile.sprite);
      }
      projectile.sprite.destroy();
    });
    this.projectiles.clear();
    this.stats.activeProjectiles = 0;
  }

  destroy(): void {
    this.clearAll();
    if (this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
}
