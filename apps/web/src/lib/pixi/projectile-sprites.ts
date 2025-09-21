import { Sprite, type Renderer, type Container } from 'pixi.js';
import { TextureAtlas, type SpriteFrame } from './texture-atlas';
import type { EnemyType } from './enemy-sprites';

export type ProjectileType = 'mantair-corsair-attack' | 'swarm-attack' | 'dragon-attack';
export type ProjectileFrame = 'idle' | 'fly_1' | 'fly_2' | 'fly_3';

// Projectile configurations
export const projectileConfigs: Record<
  ProjectileType,
  {
    name: string;
    imagePath: string;
    frameWidth: number;
    frameHeight: number;
    rows: number;
    cols: number;
    speed: number; // pixels per second
    scale: number; // visual scaling factor for balanced appearance
  }
> = {
  'mantair-corsair-attack': {
    name: 'Mantair Corsair Projectile',
    imagePath: '/sprites/wsn_mantairCorsair_attack.svg',
    frameWidth: 32, // 64x64 sprite sheet with 2x2 layout = 32x32 per frame
    frameHeight: 32,
    rows: 2,
    cols: 2,
    speed: 150, // pixels per second
    scale: 0.75, // Larger, more visible projectiles
  },
  'swarm-attack': {
    name: 'Swarm Projectile',
    imagePath: '/sprites/wsn_swarm_attack.svg',
    frameWidth: 32, // 64x64 sprite sheet with 2x2 layout = 32x32 per frame
    frameHeight: 32,
    rows: 2,
    cols: 2,
    speed: 200, // faster projectiles
    scale: 0.75, // Same size as other projectiles for consistency
  },
  'dragon-attack': {
    name: 'Dragon Attack Projectile',
    imagePath: '/sprites/protagonist_dragon_attack.svg',
    frameWidth: 32, // Assuming 64x64 sprite sheet with 2x2 layout = 32x32 per frame
    frameHeight: 32,
    rows: 2,
    cols: 2,
    speed: 250, // fast dragon projectiles
    scale: 0.75, // Larger, more visible projectiles
  },
};

// Frame mapping (same pattern as enemies)
export const projectileFrameMap: Record<ProjectileFrame, { row: number; col: number }> = {
  idle: { row: 0, col: 0 }, // Top-left frame
  fly_1: { row: 0, col: 1 }, // Top-right frame
  fly_2: { row: 1, col: 0 }, // Bottom-left frame
  fly_3: { row: 1, col: 1 }, // Bottom-right frame
};

// Create texture atlases for each projectile type
const projectileAtlases: Record<ProjectileType, TextureAtlas> = {} as Record<
  ProjectileType,
  TextureAtlas
>;

for (const [projectileType, config] of Object.entries(projectileConfigs)) {
  projectileAtlases[projectileType as ProjectileType] = new TextureAtlas({
    imagePath: config.imagePath,
    frameWidth: config.frameWidth,
    frameHeight: config.frameHeight,
    rows: config.rows,
    cols: config.cols,
  });
}

export async function getProjectileFrame(
  projectileType: ProjectileType,
  frameType: ProjectileFrame,
): Promise<SpriteFrame | undefined> {
  try {
    const atlas = projectileAtlases[projectileType];
    if (!atlas) {
      console.error(`No atlas found for projectile type: ${projectileType}`);
      return undefined;
    }

    const { row, col } = projectileFrameMap[frameType];
    const frame = await atlas.getFrame(row, col);

    if (!frame) {
      console.error(
        `Failed to get projectile frame: ${projectileType} ${frameType} (${row}, ${col})`,
      );
      return undefined;
    }

    return frame;
  } catch (error) {
    console.error(`Error loading projectile frame ${projectileType} ${frameType}:`, error);
    return undefined;
  }
}

export async function createProjectileSprite(
  projectileType: ProjectileType,
  frameType: ProjectileFrame = 'idle',
): Promise<Sprite> {
  const frame = await getProjectileFrame(projectileType, frameType);
  if (!frame) {
    throw new Error(`Invalid projectile frame: ${projectileType} ${frameType}`);
  }

  const sprite = new Sprite(frame.texture);
  sprite.anchor.set(0.5); // Center anchor for easier positioning
  return sprite;
}

// Projectile class for movement and animation
export class Projectile {
  private sprite: Sprite;
  private projectileType: ProjectileType;
  private targetX: number;
  private targetY: number;
  private speed: number;
  private isActive = true;
  private animationFrameIndex = 0;
  private readonly frameSequence: ProjectileFrame[] = ['idle', 'fly_1', 'fly_2', 'fly_3'];
  private lastFrameUpdate = 0;
  private frameDuration = 125; // 8 FPS default
  private renderer: Renderer | null = null;
  private stage: Container | null = null;
  private collisionCallback?: (_projectileSprite: Sprite) => boolean; // Returns true if collision occurred

  constructor(
    sprite: Sprite,
    projectileType: ProjectileType,
    targetX: number,
    targetY: number,
    renderer?: Renderer,
    stage?: Container,
    collisionCallback?: (_projectileSprite: Sprite) => boolean,
  ) {
    this.sprite = sprite;
    this.projectileType = projectileType;
    this.targetX = targetX;
    this.targetY = targetY;
    this.speed = projectileConfigs[projectileType].speed;
    this.renderer = renderer || null;
    this.stage = stage || null;
    this.collisionCallback = collisionCallback;
    this.lastFrameUpdate = performance.now();
  }

  update(deltaTime: number): boolean {
    if (!this.isActive) return false;

    // Update animation
    this.updateAnimation(deltaTime);

    // Check for collision using callback if provided
    if (this.collisionCallback && this.collisionCallback(this.sprite)) {
      this.destroy();
      return false; // Projectile hit target
    }

    // Calculate movement direction
    const dx = this.targetX - this.sprite.x;
    const dy = this.targetY - this.sprite.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if reached target position (fallback collision detection)
    if (distance < 20) {
      // 20 pixel collision radius
      this.destroy();
      return false; // Projectile should be removed
    }

    // Move toward target
    const moveDistance = this.speed * (deltaTime / 1000);
    if (distance > 0) {
      const moveX = (dx / distance) * moveDistance;
      const moveY = (dy / distance) * moveDistance;

      this.sprite.x += moveX;
      this.sprite.y += moveY;
    }

    // Force render if renderer available
    if (this.renderer && this.stage) {
      this.renderer.render(this.stage);
    }

    return true; // Projectile is still active
  }

  private async updateAnimation(_deltaTime: number) {
    const now = performance.now();
    if (now - this.lastFrameUpdate >= this.frameDuration) {
      this.animationFrameIndex = (this.animationFrameIndex + 1) % this.frameSequence.length;
      this.lastFrameUpdate = now;

      const frameType = this.frameSequence[this.animationFrameIndex];
      const frame = await getProjectileFrame(this.projectileType, frameType);

      if (frame) {
        this.sprite.texture = frame.texture;
      }
    }
  }

  setFPS(fps: number): void {
    this.frameDuration = 1000 / fps;
  }

  getSprite(): Sprite {
    return this.sprite;
  }

  isAlive(): boolean {
    return this.isActive;
  }

  destroy(): void {
    this.isActive = false;
    if (this.sprite.parent) {
      this.sprite.parent.removeChild(this.sprite);
    }
    this.sprite.destroy();
  }
}

export async function createProjectile(
  projectileType: ProjectileType,
  startX: number,
  startY: number,
  targetX: number,
  targetY: number,
  renderer?: Renderer,
  stage?: Container,
  collisionCallback?: (_projectileSprite: Sprite) => boolean,
): Promise<Projectile> {
  const sprite = await createProjectileSprite(projectileType, 'idle');
  sprite.position.set(startX, startY);

  // Use individual scale factor for each projectile type
  const config = projectileConfigs[projectileType];
  sprite.scale.set(config.scale);
  sprite.visible = true;

  const projectile = new Projectile(
    sprite,
    projectileType,
    targetX,
    targetY,
    renderer,
    stage,
    collisionCallback,
  );

  if (stage) {
    stage.addChild(sprite);
  }

  console.log(
    `Created ${projectileType} projectile from (${startX}, ${startY}) to (${targetX}, ${targetY}) at scale ${config.scale}`,
  );

  return projectile;
}

// Map enemy types to their projectile types
export function getProjectileTypeForEnemy(enemyType: EnemyType): ProjectileType {
  switch (enemyType) {
    case 'mantair-corsair':
      return 'mantair-corsair-attack';
    case 'swarm':
      return 'swarm-attack';
    default:
      return 'mantair-corsair-attack'; // fallback
  }
}

// Get dragon projectile type
export function getDragonProjectileType(): ProjectileType {
  return 'dragon-attack';
}
