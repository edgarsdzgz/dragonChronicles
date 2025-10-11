/**
 * Infinite Scrolling Background System
 *
 * Creates a seamless infinite scrolling background that moves right to left
 * when the dragon is moving forward, creating a flying effect.
 */

import { Container, Sprite, Texture, Assets, Graphics, type Application } from 'pixi.js';
import { createAnimatedDragonSprite, type DragonAnimator } from './dragon-sprites';
import { createAnimatedEnemySprite, type EnemyType, type EnemyAnimator } from './enemy-sprites';
import {
  createProjectile,
  getProjectileTypeForEnemy,
  getDragonProjectileType,
  type Projectile,
} from './projectile-sprites';
import { BackgroundPositioning } from './background-analyzer';
import { createDefaultArcanaDropManager, type ArcanaDropManager } from '@draconia/sim';

export interface ScrollingBackgroundConfig {
  /** Scroll speed in pixels per second (default: 100) */
  scrollSpeed?: number;
  /** Whether scrolling is enabled (default: true) */
  enabled?: boolean;
}

export interface ScrollingBackgroundHandle {
  /** Start scrolling */
  start: () => void;
  /** Stop scrolling */
  stop: () => void;
  /** Check if scrolling is active */
  isScrolling: () => boolean;
  /** Set scroll speed */
  setSpeed: (_speed: number) => void;
  /** Get dragon protagonist sprite */
  getDragon: () => Sprite | null;
  /** Get dragon animator */
  getDragonAnimator: () => DragonAnimator | null;
  /** Start automatic gameplay (enemy spawning, combat) */
  startAutomaticGameplay: () => void;
  /** Stop automatic gameplay */
  stopAutomaticGameplay: () => void;
  /** Check if gameplay is active */
  isGameplayActive: () => boolean;
  /** Spawn a specific enemy type */
  spawnEnemy: (_type: EnemyType) => void;
  /** Get current gameplay statistics */
  getGameplayStats: () => { dragons: number; enemies: number; projectiles: number };
  /** Destroy the background */
  destroy: () => void;
}

/**
 * Create an infinite scrolling background
 */
export async function createScrollingBackground(
  app: Application,
  config: ScrollingBackgroundConfig = {},
): Promise<ScrollingBackgroundHandle> {
  const scrollSpeed = config.scrollSpeed ?? 100; // pixels per second
  let currentSpeed = scrollSpeed;
  let isActive = config.enabled ?? true;

  // Create container for background sprites
  const container = new Container();
  container.label = 'scrolling-background';

  // Add container to stage at the bottom (z-index 0)
  app.stage.addChildAt(container, 0);

  // Create dragon protagonist
  console.log('DEBUG: Creating dragon protagonist...');
  let dragonSprite: Sprite | null = null;
  let dragonAnimator: DragonAnimator | null = null;

  try {
    const { sprite, animator } = await createAnimatedDragonSprite(app.renderer, app.stage);
    dragonSprite = sprite;
    dragonAnimator = animator;

    // Position dragon using background positioning utilities in the sky blue band
    const positioning = new BackgroundPositioning(app.screen.width, app.screen.height);
    dragonSprite.x = 100; // Left side of screen
    dragonSprite.y = positioning.getSkyBlueBandY(); // Center of sky blue band

    // Scale dragon to appropriate size
    dragonSprite.scale.set(1.5); // Make dragon visible but not too large

    // Add dragon to stage (above background)
    app.stage.addChild(dragonSprite);

    // Start dragon animation
    await dragonAnimator.start();
    dragonAnimator.setFPS(8); // 8 FPS for smooth flying animation

    console.log('DEBUG: Dragon protagonist created and positioned successfully:', {
      x: dragonSprite.x,
      y: dragonSprite.y,
      scale: dragonSprite.scale.x,
      animating: dragonAnimator.isAnimating(),
    });
  } catch (error) {
    console.error('DEBUG: Failed to create dragon protagonist:', error);
  }

  // Combat system variables
  const enemies: Array<{
    sprite: Sprite;
    animator: EnemyAnimator;
    x: number;
    y: number;
    type: EnemyType;
    isMoving: boolean;
    lastFireTime: number;
    fireRate: number;
    health: number;
    maxHealth: number;
    previousHealth: number;
    healthAnimationStartTime: number;
    isAnimatingHealth: boolean;
  }> = [];
  const projectiles: Array<Projectile> = [];
  const projectileTargets: Map<Projectile, any> = new Map(); // Track which projectile targets which enemy
  let isGameplayActive = false;

  // Arcana and health systems
  let arcanaManager: ArcanaDropManager;
  let dragonHealth = 100;
  let dragonMaxHealth = 100;
  let dragonPreviousHealth = 100;
  let dragonHealthAnimationStartTime = 0;

  // Health bars graphics
  let healthBarsGraphics: Graphics | null = null;
  let autoSpawnInterval: number | null = null;
  let projectileUpdateLoop: number | null = null;
  let combatUpdateLoop: number | null = null;

  // Initialize arcana manager
  arcanaManager = createDefaultArcanaDropManager();

  // Combat constants
  const DRAGON_ATTACK_RANGE = 1100; // Increased by 175%
  const ENEMY_ATTACK_RANGE = 300;
  const ENEMY_MOVE_SPEED = 50;
  const DRAGON_BASE_DAMAGE = 5;
  const ENEMY_HEALTH_CONFIG: Record<EnemyType, number> = {
    'mantair-corsair': 13, // 2.6 hits to kill (5 × 2.6 = 13)
    swarm: 7, // 1.4 hits to kill (5 × 1.4 = 7)
  };
  const AUTO_SPAWN_CONFIG = {
    baseInterval: 3000,
    intervalVariation: 1000,
    enemyTypes: ['mantair-corsair', 'swarm'] as EnemyType[],
    maxEnemies: 8,
  };

  // Load the background texture using Assets API for better reliability
  console.log('Loading background texture from: /backgrounds/steppe_background_2-1.png');

  let texture: Texture;
  try {
    // Try using Assets API first
    console.log('DEBUG: Attempting Assets.load...');
    texture = await Assets.load('/backgrounds/steppe_background_2-1.png');
    console.log('DEBUG: Assets.load successful, texture:', {
      texture: !!texture,
      source: !!texture?.source,
      valid: texture?.source?.valid,
      width: texture?.width,
      height: texture?.height,
    });
  } catch (error) {
    console.warn('Assets.load failed, trying Texture.from:', error);
    // Fallback to Texture.from
    console.log('DEBUG: Attempting Texture.from...');
    texture = await Texture.from('/backgrounds/steppe_background_2-1.png');
    console.log('DEBUG: Texture.from result:', {
      texture: !!texture,
      source: !!texture?.source,
      valid: texture?.source?.valid,
      width: texture?.width,
      height: texture?.height,
    });
  }

  // Debug texture source properties
  console.log('DEBUG: Texture source analysis:', {
    hasTexture: !!texture,
    hasSource: !!texture?.source,
    sourceValid: texture?.source?.valid,
    sourceProperties: texture?.source ? Object.keys(texture.source) : 'no source',
    textureWidth: texture?.width,
    textureHeight: texture?.height,
    textureProperties: texture ? Object.keys(texture) : 'no texture',
  });

  // In PixiJS v8, Assets.load() returns a ready texture - no need to wait for source.valid
  console.log(
    'DEBUG: Skipping texture ready state wait - Assets.load() should return ready texture',
  );

  if (!texture || !texture.width || !texture.height) {
    console.error('DEBUG: Texture validation failed:', {
      hasTexture: !!texture,
      hasWidth: !!texture?.width,
      hasHeight: !!texture?.height,
      texture: texture,
    });
    throw new Error('Background texture failed to load');
  }

  console.log('DEBUG: Background texture loaded successfully:', {
    width: texture.width,
    height: texture.height,
    source: texture.source?.resource?.url,
    textureValid: !!texture,
    sourceValid: texture.source?.valid,
  });

  // Create two sprites for seamless tiling
  // The image is 2160x1080, perfect for tiling horizontally
  const sprite1 = new Sprite(texture);
  const sprite2 = new Sprite(texture);

  // Position sprites side by side
  sprite1.position.set(0, 0);
  sprite2.position.set(texture.width, 0);

  // Scale sprites to fill the screen height
  const scaleToFit = () => {
    const screenHeight = app.screen.height;
    const bgHeight = texture.height;

    // Scale to fill screen height
    const scale = screenHeight / bgHeight;
    sprite1.scale.set(scale);
    sprite2.scale.set(scale);

    // Reposition sprite2 to be adjacent to sprite1
    sprite2.position.x = sprite1.width;

    // Center vertically if needed
    container.position.y = 0;
  };

  scaleToFit();

  // Add sprites to container
  container.addChild(sprite1);
  container.addChild(sprite2);

  // Create visual debugging overlays
  const debugGraphics = new Graphics();
  debugGraphics.label = 'debug-overlays';
  app.stage.addChild(debugGraphics);

  // Function to redraw debug overlays
  const redrawDebugOverlays = async () => {
    debugGraphics.clear();

    // Import Text class first
    const { Text } = await import('pixi.js');

    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;
    const positioning = new BackgroundPositioning(screenWidth, screenHeight);

    // Draw horizontal ruler lines every 25 pixels with labels
    debugGraphics.stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    for (let y = 0; y < screenHeight; y += 25) {
      debugGraphics.moveTo(0, y).lineTo(screenWidth, y);

      // Add pixel labels every 100 pixels
      if (y % 100 === 0) {
        const pixelLabel = new Text({
          text: `${y}px`,
          style: { fontSize: 10, fill: 0x000000, fontWeight: 'bold' },
        });
        pixelLabel.position.set(5, y + 2);
        debugGraphics.addChild(pixelLabel);
      }
    }

    // Draw vertical ruler lines every 100 pixels
    debugGraphics.stroke({ width: 1, color: 0x000000, alpha: 0.6 });
    for (let x = 0; x < screenWidth; x += 100) {
      debugGraphics.moveTo(x, 0).lineTo(x, screenHeight);
    }

    // Draw colored overlay boxes for each area with precise measurements
    // Space area (dark blue) - Orange overlay
    const spaceTop = 0;
    const spaceBottom = positioning.getActionAreaTopY();
    debugGraphics.rect(0, spaceTop, screenWidth, spaceBottom - spaceTop);
    debugGraphics.fill({ color: 0xffa500, alpha: 0.1 }); // Orange, very low opacity
    debugGraphics.stroke({ width: 2, color: 0xffa500, alpha: 0.3 });

    // Sky blue band (combat area) - White overlay
    const skyTop = positioning.getActionAreaTopY();
    const skyBottom = positioning.getActionAreaBottomY();
    debugGraphics.rect(0, skyTop, screenWidth, skyBottom - skyTop);
    debugGraphics.fill({ color: 0xffffff, alpha: 0.1 }); // White, very low opacity
    debugGraphics.stroke({ width: 2, color: 0xffffff, alpha: 0.3 });

    // Ground area (magenta) - Purple overlay
    const groundTop = positioning.getGroundY();
    const groundBottom = screenHeight;
    debugGraphics.rect(0, groundTop, screenWidth, groundBottom - groundTop);
    debugGraphics.fill({ color: 0x800080, alpha: 0.1 }); // Purple, very low opacity
    debugGraphics.stroke({ width: 2, color: 0x800080, alpha: 0.3 });

    // Add boundary markers with exact pixel measurements
    // Space-Sky boundary marker
    const spaceSkyMarker = new Text({
      text: `SPACE END: ${spaceBottom}px (${((spaceBottom / screenHeight) * 100).toFixed(1)}%)`,
      style: { fontSize: 12, fill: 0xffa500, fontWeight: 'bold' },
    });
    spaceSkyMarker.position.set(screenWidth - 200, spaceBottom + 5);
    debugGraphics.addChild(spaceSkyMarker);

    // Sky-Ground boundary marker
    const skyGroundMarker = new Text({
      text: `SKY END: ${skyBottom}px (${((skyBottom / screenHeight) * 100).toFixed(1)}%)`,
      style: { fontSize: 12, fill: 0xffffff, fontWeight: 'bold' },
    });
    skyGroundMarker.position.set(screenWidth - 200, skyBottom + 5);
    debugGraphics.addChild(skyGroundMarker);

    // Ground start marker
    const groundStartMarker = new Text({
      text: `GROUND START: ${groundTop}px (${((groundTop / screenHeight) * 100).toFixed(1)}%)`,
      style: { fontSize: 12, fill: 0x800080, fontWeight: 'bold' },
    });
    groundStartMarker.position.set(screenWidth - 200, groundTop + 5);
    debugGraphics.addChild(groundStartMarker);

    // Add labels using Text objects
    const spaceLabel = new Text({
      text: 'SPACE (Orange)',
      style: { fontSize: 12, fill: 0xffa500, fontWeight: 'bold' },
    });
    spaceLabel.position.set(10, spaceTop + 10);
    debugGraphics.addChild(spaceLabel);

    const skyLabel = new Text({
      text: 'SKY BLUE BAND (White)',
      style: { fontSize: 12, fill: 0xffffff, fontWeight: 'bold' },
    });
    skyLabel.position.set(10, skyTop + 10);
    debugGraphics.addChild(skyLabel);

    const groundLabel = new Text({
      text: 'GROUND (Purple)',
      style: { fontSize: 12, fill: 0x800080, fontWeight: 'bold' },
    });
    groundLabel.position.set(10, groundTop + 10);
    debugGraphics.addChild(groundLabel);

    // Show dragon position indicator
    if (dragonSprite) {
      debugGraphics.stroke({ width: 3, color: 0xff0000, alpha: 0.8 });
      debugGraphics.circle(dragonSprite.x, dragonSprite.y, 20);
      const dragonLabel = new Text({
        text: 'DRAGON',
        style: { fontSize: 10, fill: 0xff0000, fontWeight: 'bold' },
      });
      dragonLabel.position.set(dragonSprite.x + 25, dragonSprite.y - 10);
      debugGraphics.addChild(dragonLabel);
    }

    console.log('Debug overlays drawn:', {
      screenWidth,
      screenHeight,
      spaceArea: { top: spaceTop, bottom: spaceBottom, height: spaceBottom - spaceTop },
      skyArea: { top: skyTop, bottom: skyBottom, height: skyBottom - skyTop },
      groundArea: { top: groundTop, bottom: groundBottom, height: groundBottom - groundTop },
      dragonPosition: dragonSprite ? { x: dragonSprite.x, y: dragonSprite.y } : null,
    });
  };

  // Initial draw
  await redrawDebugOverlays();

  // Track position for infinite scrolling
  let offset = 0;

  // Scrolling animation
  const onTick = (ticker: { deltaTime: number; deltaMS: number }) => {
    if (!isActive) return;

    // Calculate scroll amount based on time elapsed
    // deltaMS is in milliseconds, so convert speed from px/sec to px/ms
    const scrollAmount = (currentSpeed / 1000) * ticker.deltaMS;

    // Move left (negative direction for right-to-left scrolling)
    offset -= scrollAmount;

    // When sprite1 moves completely off screen to the left, reset it to the right
    const spriteWidth = sprite1.width;
    if (offset <= -spriteWidth) {
      offset += spriteWidth;
    }

    // Update sprite positions
    sprite1.position.x = offset;
    sprite2.position.x = offset + spriteWidth;
  };

  // Add ticker
  app.ticker.add(onTick);

  // Handle resize
  const onResize = async () => {
    scaleToFit();

    // Reposition dragon on resize
    if (dragonSprite) {
      const positioning = new BackgroundPositioning(app.screen.width, app.screen.height);
      dragonSprite.x = 100; // Keep at left side
      dragonSprite.y = positioning.getSkyBlueBandY(); // Reposition in sky blue band
    }

    // Redraw debug overlays on resize
    await redrawDebugOverlays();
  };

  app.renderer.on('resize', onResize);

  // Combat system functions
  async function spawnEnemy(type: EnemyType) {
    if (!app || enemies.length >= AUTO_SPAWN_CONFIG.maxEnemies) return;

    try {
      const { sprite, animator } = await createAnimatedEnemySprite(type, app.renderer, app.stage);

      // Position enemy on right side of screen, but only in the sky action area
      const positioning = new BackgroundPositioning(app.screen.width, app.screen.height);
      const spawnX = app.screen.width - 100;

      // Spawn only in the sky blue band (action area)
      const actionAreaTop = positioning.getActionAreaTopY();
      const actionAreaBottom = positioning.getActionAreaBottomY();
      const spawnY = actionAreaTop + Math.random() * (actionAreaBottom - actionAreaTop);

      sprite.position.set(spawnX, spawnY);
      sprite.scale.set(0.75);
      sprite.visible = true;

      app.stage.addChild(sprite);
      await animator.start();
      animator.setFPS(8);

      const maxHealth = ENEMY_HEALTH_CONFIG[type] || 10;
      const enemyData = {
        sprite,
        animator,
        x: spawnX,
        y: spawnY,
        type,
        isMoving: true,
        lastFireTime: 0,
        fireRate: 2000 + Math.random() * 500,
        health: maxHealth,
        maxHealth,
        previousHealth: maxHealth, // For smooth HP bar animation
        healthAnimationStartTime: 0, // When the animation started
        isAnimatingHealth: false, // Whether health bar is currently animating
      };

      enemies.push(enemyData);
      console.log(`Spawned ${type} enemy (${enemies.length}/${AUTO_SPAWN_CONFIG.maxEnemies})`);
    } catch (error) {
      console.error(`Failed to spawn ${type} enemy:`, error);
    }
  }

  async function fireProjectileFromEnemy(enemyIndex: number) {
    if (!app || enemyIndex >= enemies.length || !dragonSprite) return;

    const enemy = enemies[enemyIndex];
    const dx = dragonSprite.x - enemy.x;
    const dy = dragonSprite.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > ENEMY_ATTACK_RANGE) return;

    try {
      const projectileType = getProjectileTypeForEnemy(enemy.type);
      const collisionCallback = (projectileSprite: Sprite) => {
        if (!dragonSprite) return false;
        const projectileBounds = projectileSprite.getBounds();
        const dragonBounds = dragonSprite.getBounds();

        const isColliding =
          projectileBounds.x < dragonBounds.x + dragonBounds.width &&
          projectileBounds.x + projectileBounds.width > dragonBounds.x &&
          projectileBounds.y < dragonBounds.y + dragonBounds.height &&
          projectileBounds.y + projectileBounds.height > dragonBounds.y;

        if (isColliding) {
          console.log('Dragon hit by enemy projectile!');
          const oldHealth = dragonHealth;
          dragonHealth -= 10; // Enemy projectile damage

          // Start health bar animation
          dragonPreviousHealth = oldHealth;
          dragonHealthAnimationStartTime = performance.now();

          console.log(
            `💥 DRAGON HIT by ${enemy.type}! Took 10 damage! Health: ${oldHealth} -> ${dragonHealth}/${dragonMaxHealth}`,
          );
          return true;
        }
        return false;
      };

      const projectile = await createProjectile(
        projectileType,
        enemy.x,
        enemy.y,
        dragonSprite.x,
        dragonSprite.y,
        app.renderer,
        app.stage,
        collisionCallback,
      );

      projectile.setFPS(8);
      projectiles.push(projectile);
    } catch (error) {
      console.error(`Failed to fire projectile from enemy:`, error);
    }
  }

  async function fireProjectileFromDragon() {
    if (!app || !dragonSprite || enemies.length === 0) return;

    // Find closest enemy in range
    let closestEnemy = enemies[0];
    let closestDistance = Infinity;

    enemies.forEach((enemy) => {
      const dx = enemy.x - dragonSprite!.x;
      const dy = enemy.y - dragonSprite!.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance && distance <= DRAGON_ATTACK_RANGE) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestDistance > DRAGON_ATTACK_RANGE) return;

    try {
      const projectileType = getDragonProjectileType();
      const collisionCallback = (projectileSprite: Sprite) => {
        // Only check collision with the specific target enemy (closestEnemy)
        if (closestEnemy.sprite.userData && closestEnemy.sprite.userData.isDefeated) {
          return false; // Target is already defeated, don't hit
        }

        // Use custom collision detection with individual enemy hitboxes
        const isColliding = checkSpriteCollision(
          projectileSprite,
          closestEnemy.sprite,
          closestEnemy.type,
        );

        // Log collision attempts for debugging
        if (isColliding) {
          console.log(`🎯 Dragon projectile HIT ${closestEnemy.type}!`);
        }

        if (isColliding) {
          const oldHealth = closestEnemy.health;
          closestEnemy.health -= DRAGON_BASE_DAMAGE;

          // Start health bar animation
          closestEnemy.previousHealth = oldHealth;
          closestEnemy.healthAnimationStartTime = performance.now();
          closestEnemy.isAnimatingHealth = true;

          console.log(
            `💥 DRAGON HIT! ${closestEnemy.type} took ${DRAGON_BASE_DAMAGE} damage! Health: ${oldHealth} -> ${closestEnemy.health}/${closestEnemy.maxHealth}`,
          );

          if (closestEnemy.health <= 0) {
            // Mark enemy as defeated and record death time, but don't remove immediately
            if (!closestEnemy.sprite.userData) {
              closestEnemy.sprite.userData = {};
            }
            if (!closestEnemy.sprite.userData.isDefeated) {
              closestEnemy.sprite.userData.isDefeated = true;
              closestEnemy.sprite.userData.deathTime = performance.now();

              // Award arcana based on enemy type using the proper arcana drop manager
              const arcanaReward = closestEnemy.type === 'mantair-corsair' ? 0.03 : 0.01; // Corsairs give more arcana (0.01-0.05 range)
              arcanaManager.dropArcana(arcanaReward, {
                type: 'enemy_kill',
                enemyType: closestEnemy.type,
                timestamp: Date.now(),
              });
              console.log(
                `💀 ${closestEnemy.type} DEFEATED! Awarded ${arcanaReward} arcana! Total: ${arcanaManager.getCurrentBalance()}`,
              );
            }
          }

          // Mark the projectile as "hit" and schedule its destruction with delay
          if (!projectileSprite.userData) {
            projectileSprite.userData = {};
          }
          if (!projectileSprite.userData.hasHit) {
            projectileSprite.userData.hasHit = true;
            projectileSprite.userData.hitTime = performance.now();
            console.log(`⚡ Projectile piercing through ${closestEnemy.type} for 0.07 seconds...`);
          }
          return false; // Don't destroy projectile immediately - let it pierce through
        }
        // If no collision with any enemy, projectile MISSES and continues traveling
        console.log(`💨 Projectile MISSED - continuing forward`);
        return false; // Continue traveling
      };

      const projectile = await createProjectile(
        projectileType,
        dragonSprite.x,
        dragonSprite.y,
        closestEnemy.x,
        closestEnemy.y,
        app.renderer,
        app.stage,
        collisionCallback,
      );

      projectile.setFPS(8);

      // Enable homing behavior - projectile will follow the target enemy
      projectile.enableHoming(() => {
        // Find the enemy in the current enemies array to check its current state
        const currentEnemy = enemies.find(
          (enemy) => enemy.sprite === closestEnemy.sprite && !enemy.sprite.userData?.isDefeated,
        );

        if (!currentEnemy) {
          return null; // Enemy is defeated or no longer exists, disable homing
        }

        return {
          x: currentEnemy.sprite.x,
          y: currentEnemy.sprite.y,
        };
      });

      projectiles.push(projectile);
      projectileTargets.set(projectile, closestEnemy); // Track which enemy this projectile targets
    } catch (error) {
      console.error('Failed to fire projectile from dragon:', error);
    }
  }

  function startProjectileUpdateLoop() {
    if (projectileUpdateLoop) return;

    let lastTime = performance.now();

    function updateProjectiles() {
      if (!app) return;

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const activeProjectiles = [];
      for (const projectile of projectiles) {
        const stillActive = projectile.update(deltaTime);
        if (stillActive) {
          activeProjectiles.push(projectile);
        }
      }

      // Clean up projectile targets map for destroyed projectiles
      const destroyedProjectiles = projectiles.filter((p) => !activeProjectiles.includes(p));
      destroyedProjectiles.forEach((projectile) => {
        projectileTargets.delete(projectile);
      });

      projectiles.length = 0;
      projectiles.push(...activeProjectiles);

      requestAnimationFrame(updateProjectiles);
    }

    projectileUpdateLoop = requestAnimationFrame(updateProjectiles);
  }

  function startCombatUpdateLoop() {
    if (combatUpdateLoop) return;

    let lastTime = performance.now();

    function updateCombat() {
      if (!app) return;

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      // Update enemy movement and combat
      const activeEnemies = [];
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        if (!dragonSprite) continue;

        // Handle defeated enemies
        if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
          const timeSinceDeath = performance.now() - enemy.sprite.userData.deathTime;
          if (timeSinceDeath >= 330) {
            // 0.33 seconds = 330ms
            console.log(`👻 ${enemy.type} disappearing after death delay.`);

            // Destroy all projectiles targeting this enemy at the same time
            const projectilesToDestroy: Projectile[] = [];
            projectileTargets.forEach((targetEnemy, projectile) => {
              if (targetEnemy === enemy) {
                projectilesToDestroy.push(projectile);
                projectileTargets.delete(projectile);
              }
            });

            // Destroy the projectiles
            projectilesToDestroy.forEach((projectile) => {
              projectile.destroy();
            });

            enemy.animator.destroy();
            app.stage.removeChild(enemy.sprite);
            // Don't add to activeEnemies, effectively removing it
          } else {
            // Add blinking effect for defeated enemies
            const blinkSpeed = 100; // milliseconds per blink
            const timeSinceDeath = performance.now() - enemy.sprite.userData.deathTime;
            const blinkPhase = Math.floor(timeSinceDeath / blinkSpeed) % 2;

            // Blink between visible (alpha 1) and semi-transparent (alpha 0.3)
            enemy.sprite.alpha = blinkPhase === 0 ? 1.0 : 0.3;

            // Make projectiles targeting this defeated enemy blink in sync
            projectileTargets.forEach((targetEnemy, projectile) => {
              if (targetEnemy === enemy) {
                const projectileSprite = projectile.getSprite();
                projectileSprite.alpha = blinkPhase === 0 ? 1.0 : 0.3;
              }
            });

            activeEnemies.push(enemy);
          }
        } else {
          // Ensure living enemies have normal alpha
          enemy.sprite.alpha = 1.0;
          activeEnemies.push(enemy);
        }
      }

      // Update the enemies array with only active enemies
      enemies.length = 0;
      enemies.push(...activeEnemies);

      // Update remaining active enemies
      enemies.forEach((enemy, index) => {
        if (!dragonSprite) return;

        const dx = dragonSprite.x - enemy.x;
        const dy = dragonSprite.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Move enemy toward dragon if not in attack range
        if (enemy.isMoving && distance > ENEMY_ATTACK_RANGE) {
          const moveDistance = ENEMY_MOVE_SPEED * (deltaTime / 1000);
          if (distance > 0) {
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;

            enemy.x += moveX;
            enemy.y += moveY;
            enemy.sprite.position.set(enemy.x, enemy.y);
          }
        } else if (distance <= ENEMY_ATTACK_RANGE) {
          enemy.isMoving = false;

          // Auto-fire if enough time has passed
          if (currentTime - enemy.lastFireTime >= enemy.fireRate) {
            fireProjectileFromEnemy(index);
            enemy.lastFireTime = currentTime;
          }
        } else if (distance > ENEMY_ATTACK_RANGE * 1.2) {
          enemy.isMoving = true;
        }
      });

      // Dragon auto-combat
      if (dragonSprite && dragonAnimator) {
        const dragonLastFireTime = (dragonAnimator as any).lastFireTime || 0;
        const dragonFireRate = 1500;

        if (currentTime - dragonLastFireTime >= dragonFireRate) {
          fireProjectileFromDragon();
          (dragonAnimator as any).lastFireTime = currentTime;
        }
      }

      // Update UI elements
      drawHealthBars();
      drawArcanaCounter();

      requestAnimationFrame(updateCombat);
    }

    combatUpdateLoop = requestAnimationFrame(updateCombat);
  }

  function startAutoSpawning() {
    if (autoSpawnInterval) return;

    const scheduleNextSpawn = () => {
      if (!isGameplayActive) return;

      const baseTime = AUTO_SPAWN_CONFIG.baseInterval;
      const variation = (Math.random() - 0.5) * AUTO_SPAWN_CONFIG.intervalVariation;
      const nextSpawnTime = baseTime + variation;

      autoSpawnInterval = window.setTimeout(() => {
        if (!isGameplayActive) return;

        if (enemies.length < AUTO_SPAWN_CONFIG.maxEnemies) {
          const randomEnemyType =
            AUTO_SPAWN_CONFIG.enemyTypes[
              Math.floor(Math.random() * AUTO_SPAWN_CONFIG.enemyTypes.length)
            ];
          spawnEnemy(randomEnemyType);
        }

        scheduleNextSpawn();
      }, nextSpawnTime);
    };

    scheduleNextSpawn();
  }

  function stopAutoSpawning() {
    if (autoSpawnInterval) {
      clearTimeout(autoSpawnInterval);
      autoSpawnInterval = null;
    }
  }

  function startAutomaticGameplay() {
    if (isGameplayActive) return;

    isGameplayActive = true;
    console.log('Starting automatic gameplay...');

    startProjectileUpdateLoop();
    startCombatUpdateLoop();
    startAutoSpawning();
  }

  function stopAutomaticGameplay() {
    if (!isGameplayActive) return;

    isGameplayActive = false;
    console.log('Stopping automatic gameplay...');

    stopAutoSpawning();

    if (projectileUpdateLoop) {
      cancelAnimationFrame(projectileUpdateLoop);
      projectileUpdateLoop = null;
    }

    if (combatUpdateLoop) {
      cancelAnimationFrame(combatUpdateLoop);
      combatUpdateLoop = null;
    }

    // Clean up all enemies
    enemies.forEach((enemy) => {
      enemy.animator.destroy();
      app.stage.removeChild(enemy.sprite);
    });
    enemies.length = 0;

    // Clean up all projectiles
    projectiles.forEach((projectile) => projectile.destroy());
    projectiles.length = 0;
    projectileTargets.clear();
  }

  // Function to draw health bars with smooth animations
  function drawHealthBars() {
    if (!app || (!dragonSprite && enemies.length === 0)) {
      // Hide health bars if no dragon or enemies
      if (healthBarsGraphics) {
        healthBarsGraphics.visible = false;
      }
      return;
    }

    // Create graphics object if it doesn't exist
    if (!healthBarsGraphics) {
      healthBarsGraphics = new Graphics();
      app.stage.addChild(healthBarsGraphics);
    }

    healthBarsGraphics.clear();

    // Get current scale for responsive sizing
    const currentScale = app.screen.height / 512; // Based on 512px background height

    // Draw dragon health bar
    if (dragonSprite) {
      const barWidth = 60 * currentScale;
      const barHeight = 8 * currentScale;
      const barX = dragonSprite.x - barWidth / 2;
      const barY = dragonSprite.y - 40 * currentScale; // Position above dragon, scaled

      // Calculate health percentage with smooth animation
      const currentHealthPercent = Math.max(0, dragonHealth / dragonMaxHealth);
      const previousHealthPercent = Math.max(0, dragonPreviousHealth / dragonMaxHealth);

      // Animate health bar if there's a difference
      let displayHealthPercent = currentHealthPercent;
      if (dragonHealthAnimationStartTime > 0) {
        const animationDuration = 500; // 0.5 seconds
        const timeSinceDamage = performance.now() - dragonHealthAnimationStartTime;
        const animationProgress = Math.min(timeSinceDamage / animationDuration, 1);

        // Smooth interpolation from previous to current health
        displayHealthPercent =
          previousHealthPercent +
          (currentHealthPercent - previousHealthPercent) * animationProgress;

        // Update previous health to current after animation completes
        if (animationProgress >= 1) {
          dragonPreviousHealth = dragonHealth;
          dragonHealthAnimationStartTime = 0; // Reset animation
        }
      }

      // Health bar (green to yellow to red based on health)
      if (displayHealthPercent > 0) {
        let healthColor = 0x00ff00; // Green
        if (displayHealthPercent < 0.6) {
          healthColor = 0xffff00; // Yellow
        }
        if (displayHealthPercent < 0.3) {
          healthColor = 0xff4500; // Orange-red
        }

        const currentBarWidth = barWidth * displayHealthPercent;
        healthBarsGraphics.rect(barX, barY, currentBarWidth, barHeight);
        healthBarsGraphics.fill({ color: healthColor, alpha: 0.8 });
      }

      // Health bar background (black border)
      healthBarsGraphics.rect(barX, barY, barWidth, barHeight);
      healthBarsGraphics.stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    }

    // Draw enemy health bars
    enemies.forEach((enemy) => {
      const barWidth = 60 * currentScale;
      const barHeight = 8 * currentScale;
      const barX = enemy.sprite.x - barWidth / 2;
      const barY = enemy.sprite.y - 40 * currentScale; // Position above enemy, scaled

      // Calculate health percentage with smooth animation
      const currentHealthPercent = Math.max(0, enemy.health / enemy.maxHealth);
      const previousHealthPercent = Math.max(0, enemy.previousHealth / enemy.maxHealth);

      // Animate health bar if there's a difference
      let displayHealthPercent = currentHealthPercent;
      if (enemy.isAnimatingHealth && enemy.healthAnimationStartTime > 0) {
        const animationDuration = 500; // 0.5 seconds
        const timeSinceDamage = performance.now() - enemy.healthAnimationStartTime;
        const animationProgress = Math.min(timeSinceDamage / animationDuration, 1);

        // Smooth interpolation from previous to current health
        displayHealthPercent =
          previousHealthPercent +
          (currentHealthPercent - previousHealthPercent) * animationProgress;

        // Update previous health to current after animation completes
        if (animationProgress >= 1) {
          enemy.previousHealth = enemy.health;
          enemy.isAnimatingHealth = false;
          enemy.healthAnimationStartTime = 0; // Reset animation
        }
      }

      // Health bar (red to orange based on health)
      if (displayHealthPercent > 0) {
        let healthColor = 0xff0000; // Red
        if (displayHealthPercent < 0.5) {
          healthColor = 0xff4500; // Orange-red
        }

        const currentBarWidth = barWidth * displayHealthPercent;
        healthBarsGraphics.rect(barX, barY, currentBarWidth, barHeight);
        healthBarsGraphics.fill({ color: healthColor, alpha: 0.8 });
      }

      // Health bar background (black border)
      healthBarsGraphics.rect(barX, barY, barWidth, barHeight);
      healthBarsGraphics.stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    });

    healthBarsGraphics.visible = true;
  }

  // Function to draw arcana counter
  function drawArcanaCounter() {
    if (!app) return;

    // Get current scale for responsive sizing
    const currentScale = app.screen.height / 512; // Based on 512px background height

    // Create or update arcana text
    let arcanaText = app.stage.children.find((child) => child.label === 'arcana-counter') as any;
    if (!arcanaText) {
      const { Text } = require('pixi.js');
      arcanaText = new Text({
        text: '0.00',
        style: {
          fontFamily: 'Cinzel',
          fontSize: 18 * currentScale,
          fill: 0xffff00, // Yellow color
          fontWeight: 'bold',
        },
      });
      arcanaText.label = 'arcana-counter';
      app.stage.addChild(arcanaText);
    }

    // Update position and text
    arcanaText.x = 20 * currentScale;
    arcanaText.y = 20 * currentScale;
    arcanaText.text = arcanaManager.getCurrentBalance().toFixed(2);
    arcanaText.style.fontSize = 18 * currentScale;
  }

  return {
    start: () => {
      isActive = true;
    },
    stop: () => {
      isActive = false;
    },
    isScrolling: () => {
      return isActive;
    },
    setSpeed: (speed: number) => {
      currentSpeed = speed;
    },
    getDragon: () => {
      return dragonSprite;
    },
    getDragonAnimator: () => {
      return dragonAnimator;
    },
    startAutomaticGameplay,
    stopAutomaticGameplay,
    isGameplayActive: () => isGameplayActive,
    spawnEnemy,
    getGameplayStats: () => ({
      dragons: dragonSprite ? 1 : 0,
      enemies: enemies.length,
      projectiles: projectiles.length,
    }),
    destroy: () => {
      // Stop gameplay first
      stopAutomaticGameplay();

      app.ticker.remove(onTick);
      app.renderer.off('resize', onResize);

      // Destroy dragon
      if (dragonAnimator) {
        dragonAnimator.destroy();
      }
      if (dragonSprite) {
        app.stage.removeChild(dragonSprite);
        dragonSprite.destroy();
      }

      container.destroy({ children: true });

      // Clean up health bars graphics
      if (healthBarsGraphics) {
        app.stage.removeChild(healthBarsGraphics);
        healthBarsGraphics.destroy();
        healthBarsGraphics = null;
      }

      // Clean up debug graphics
      if (debugGraphics) {
        app.stage.removeChild(debugGraphics);
        debugGraphics.destroy();
      }
    },
  };
}
