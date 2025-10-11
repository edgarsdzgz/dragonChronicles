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

// Extend window interface for background width tracking
declare global {
  interface Window {
    backgroundWidth?: number;
  }
}

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

  // Store the current scale factor for game elements (must be declared early)
  let currentScale = 1;

  // Create container for background sprites
  const container = new Container();
  container.label = 'scrolling-background';

  // Add container to stage at the bottom (z-index 0)
  app.stage.addChildAt(container, 0);

  // Health bars graphics
  let healthBarsGraphics: Graphics | null = null;

  // Create dragon protagonist
  console.log('DEBUG: Creating dragon protagonist...');
  let dragonSprite: Sprite | null = null;
  let dragonAnimator: DragonAnimator | null = null;
  let dragonHealth = 100;
  let dragonMaxHealth = 100;
  let dragonPreviousHealth = 100; // For smooth HP bar animation
  let dragonHealthAnimationStartTime = 0; // When dragon health animation started
  let arcanaManager: ArcanaDropManager;

  // Initialize arcana drop manager
  arcanaManager = createDefaultArcanaDropManager();

  try {
    const { sprite, animator } = await createAnimatedDragonSprite(app.renderer, app.stage);
    dragonSprite = sprite;
    dragonAnimator = animator;

    // Position dragon using background positioning utilities in the sky blue band
    // Use scaled background dimensions for accurate positioning
    const bgWidth = 2048; // Original background width
    const bgHeight = 1024; // Original background height
    const scaledBgWidth = bgWidth * currentScale;
    const scaledBgHeight = bgHeight * currentScale;
    const positioning = new BackgroundPositioning(scaledBgWidth, scaledBgHeight);
    dragonSprite.x = 100 * currentScale; // Left side of screen, scaled
    dragonSprite.y = positioning.getSkyBlueBandY(); // Center of sky blue band

    // Scale dragon to appropriate size (will be updated by scaleGameElements)
    dragonSprite.scale.set(1.5); // Base scale, will be multiplied by currentScale

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
  }> = [];
  const projectiles: Array<Projectile> = [];
  const projectileTargets: Map<Projectile, any> = new Map(); // Track which projectile targets which enemy
  let isGameplayActive = false;
  let autoSpawnInterval: number | null = null;
  let projectileUpdateLoop: number | null = null;
  let combatUpdateLoop: number | null = null;

  // Combat constants
  const DRAGON_ATTACK_RANGE = 1100; // Increased by 175% (400 * 2.75 = 1100)
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

  // Offscreen spawning area to prevent tearing and enable smooth enemy entry
  const OFFSCREEN_SPAWN_BUFFER = 300; // Extra space to the right for spawning (was 200, now 300)

  // Custom collision detection using individual hitboxes per enemy type
  function checkSpriteCollision(
    projectileSprite: Sprite,
    enemySprite: Sprite,
    enemyType?: EnemyType,
  ): boolean {
    // Get projectile center position for more accurate collision
    const projectileBounds = projectileSprite.getBounds();
    const projectileCenterX = projectileBounds.x + projectileBounds.width / 2;
    const projectileCenterY = projectileBounds.y + projectileBounds.height / 2;

    // Calculate custom hitbox based on enemy type
    let enemyHitbox = enemySprite.getBounds();

    if (enemyType) {
      const spriteWidth = enemySprite.width;
      const spriteHeight = enemySprite.height;

      // Create 50% size square hitbox centered on sprite
      const hitboxSize = Math.min(spriteWidth, spriteHeight) * 0.5; // 50% of smaller dimension
      const offsetX = (spriteWidth - hitboxSize) / 2;
      const offsetY = (spriteHeight - hitboxSize) / 2;

      enemyHitbox = {
        x: enemySprite.x - offsetX,
        y: enemySprite.y - offsetY,
        width: hitboxSize,
        height: hitboxSize,
      };

      console.log(
        `🎯 ${enemyType} hitbox: ${hitboxSize.toFixed(1)}x${hitboxSize.toFixed(1)} (50% of ${Math.min(spriteWidth, spriteHeight).toFixed(1)})`,
      );
    }

    // Option 1: Center-point collision (most accurate)
    // Projectile hits when its center point enters the enemy hitbox
    const projectileCenterInHitbox =
      projectileCenterX >= enemyHitbox.x &&
      projectileCenterX <= enemyHitbox.x + enemyHitbox.width &&
      projectileCenterY >= enemyHitbox.y &&
      projectileCenterY <= enemyHitbox.y + enemyHitbox.height;

    // Option 2: Traditional AABB collision (more forgiving)
    // Projectile hits when any part touches the hitbox
    const projectileIntersectsHitbox =
      projectileBounds.x < enemyHitbox.x + enemyHitbox.width &&
      projectileBounds.x + projectileBounds.width > enemyHitbox.x &&
      projectileBounds.y < enemyHitbox.y + enemyHitbox.height &&
      projectileBounds.y + projectileBounds.height > enemyHitbox.y;

    // Choose collision method based on your preference:
    // - Use only projectileCenterInHitbox for precise center-point collision
    // - Use only projectileIntersectsHitbox for traditional collision
    // - Use both for hybrid approach (current setting)
    const isColliding = projectileCenterInHitbox; // Change this line to choose method

    if (isColliding) {
      console.log(
        `🎯 Collision: Center in hitbox: ${projectileCenterInHitbox}, Intersects: ${projectileIntersectsHitbox}`,
      );
    }

    return isColliding;
  }

  // Draw health bars for dragon and enemies
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

    // Clear previous drawing
    healthBarsGraphics.clear();

    // Draw health bar for dragon
    if (dragonSprite) {
      const barWidth = 60 * currentScale; // Scale health bar width
      const barHeight = 8 * currentScale; // Scale health bar height
      const barX = dragonSprite.x - barWidth / 2;
      const barY = dragonSprite.y - 60 * currentScale; // Position above dragon, scaled

      // Calculate health percentage with smooth animation
      const currentHealthPercent = Math.max(0, dragonHealth / dragonMaxHealth);
      const previousHealthPercent = Math.max(0, dragonPreviousHealth / dragonMaxHealth);

      // Animate health bar if there's a difference
      let displayHealthPercent = currentHealthPercent;
      if (dragonPreviousHealth !== dragonHealth && dragonHealthAnimationStartTime > 0) {
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

      // Background bar (black)
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .fill({ color: 0x000000, alpha: 0.8 });

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
        healthBarsGraphics
          .rect(barX, barY, currentBarWidth, barHeight)
          .fill({ color: healthColor, alpha: 0.9 });
      }

      // Border around health bar
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    }

    // Draw health bars for enemies
    enemies.forEach((enemy) => {
      if (!healthBarsGraphics) return;

      // Skip health bars for defeated enemies (they're flashing and about to disappear)
      if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
        return;
      }

      const barWidth = 40 * currentScale; // Scale health bar width
      const barHeight = 6 * currentScale; // Scale health bar height
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

      // Background bar (black)
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .fill({ color: 0x000000, alpha: 0.8 });

      // Health bar (red to orange based on health)
      if (displayHealthPercent > 0) {
        let healthColor = 0xff0000; // Red
        if (displayHealthPercent < 0.5) {
          healthColor = 0xff4500; // Orange-red
        }

        const currentBarWidth = barWidth * displayHealthPercent;
        healthBarsGraphics
          .rect(barX, barY, currentBarWidth, barHeight)
          .fill({ color: healthColor, alpha: 0.9 });
      }

      // Border around health bar
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    });

    healthBarsGraphics.visible = true;
  }

  // Function to draw arcana counter with multiple font options
  async function drawArcanaCounter() {
    if (!app) return;

    // Import Text from PixiJS
    const { Text } = await import('pixi.js');

    // Remove existing arcana counters if they exist
    const existingCounters = app.stage.children.filter((child) =>
      child.name?.startsWith('arcana-counter'),
    );
    existingCounters.forEach((counter) => app.stage.removeChild(counter));

    // Selected font option - Cinzel (option 1)
    const fontOptions = [
      { name: 'Cinzel', style: 'Cinzel, serif', color: 0xffd700 }, // Selected elegant serif font
    ];

    // Position for arcana counters horizontally across the "space" area
    const startX = 20 * currentScale;
    const startY = 20 * currentScale; // Top of the space area
    const horizontalSpacing = 180 * currentScale; // Space between each font option

    fontOptions.forEach((font, index) => {
      const arcanaText = new Text({
        text: `Arcana: ${arcanaManager.getCurrentBalance().toFixed(2)}`,
        style: {
          fontFamily: font.style,
          fontSize: 18 * currentScale, // Increased from 16 to 18 (2 points larger)
          fill: font.color,
          stroke: { color: 0x000000, width: 1 },
          dropShadow: {
            color: 0x000000,
            blur: 2,
            angle: Math.PI / 4,
            distance: 2,
          },
        },
      });

      arcanaText.name = `arcana-counter-${index}`;
      arcanaText.x = startX + index * horizontalSpacing;
      arcanaText.y = startY;
      arcanaText.anchor.set(0, 0); // Top-left anchor

      app.stage.addChild(arcanaText);
    });
  }

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

  // Create two sprites for seamless tiling with anti-tearing optimizations
  // The image is 2160x1080, perfect for tiling horizontally
  const sprite1 = new Sprite(texture);
  const sprite2 = new Sprite(texture);

  // Enable pixel-perfect rendering to prevent tearing
  sprite1.roundPixels = true;
  sprite2.roundPixels = true;

  // Position sprites side by side for seamless tiling
  sprite1.position.set(0, 0);
  sprite2.position.set(0, 0); // Will be positioned after scaling

  // Scale sprites to cover the entire screen while maintaining aspect ratio
  const scaleToFit = () => {
    const screenWidth = app.screen.width;
    const screenHeight = app.screen.height;
    const bgWidth = texture.width;
    const bgHeight = texture.height;

    // Calculate scale factors for both dimensions
    const scaleX = screenWidth / bgWidth;
    const scaleY = screenHeight / bgHeight;

    // Use the smaller scale to fit within the screen (like CLICKPOCALYPSE 2)
    // This allows empty space instead of cutting off content
    const scale = Math.min(scaleX, scaleY);

    console.log(
      `🖥️ Responsive scaling: Screen(${screenWidth}x${screenHeight}), BG(${bgWidth}x${bgHeight}), Scale: ${scale.toFixed(2)}`,
    );

    // Store the scale factor for game elements
    currentScale = scale;

    sprite1.scale.set(scale);
    sprite2.scale.set(scale);

    // Create seamless loop with proper sprite positioning and anti-tearing
    const spriteWidth = Math.floor(sprite1.width); // Ensure integer width
    sprite2.position.x = spriteWidth; // Position second sprite right after first with pixel-perfect alignment

    // Center the background within the screen (it will now be smaller than or equal to screen)
    const scaledBgWidth = sprite1.width;
    const scaledBgHeight = sprite1.height;

    // Center horizontally (background is now smaller than screen width)
    container.position.x = (screenWidth - scaledBgWidth) / 2;

    // Align to top - put all extra space at the bottom
    container.position.y = 0;

    // Store the total background width for offscreen spawning calculations
    window.backgroundWidth = sprite1.width;

    // Scale all game elements to match the background
    scaleGameElements();
  };

  // Scale all game elements to match the background scaling
  function scaleGameElements() {
    // Calculate actual scaled background dimensions
    const bgWidth = 2048; // Original background width
    const bgHeight = 1024; // Original background height
    const scaledBgWidth = bgWidth * currentScale;
    const scaledBgHeight = bgHeight * currentScale;

    // Scale dragon
    if (dragonSprite) {
      dragonSprite.scale.set(1.5 * currentScale); // Base scale * background scale
      // Reposition dragon to match scaled coordinate system using actual background dimensions
      const positioning = new BackgroundPositioning(scaledBgWidth, scaledBgHeight);
      dragonSprite.x = 100 * currentScale; // Scale the fixed position
      dragonSprite.y = positioning.getSkyBlueBandY();
    }

    // Scale all enemies
    enemies.forEach((enemy) => {
      enemy.sprite.scale.set(currentScale); // Scale enemy sprites
    });

    // Scale all projectiles
    projectiles.forEach((projectile) => {
      const projectileSprite = projectile.getSprite();
      projectileSprite.scale.set(currentScale); // Scale projectile sprites
    });

    // Redraw health bars to match new scale
    drawHealthBars();
    drawArcanaCounter();
  }

  scaleToFit();

  // Add sprites to container
  container.addChild(sprite1);
  container.addChild(sprite2);

  // Track position for infinite scrolling
  let offset = 0;

  // Scrolling animation with advanced anti-tearing logic
  const onTick = (ticker: { deltaTime: number; deltaMS: number }) => {
    if (!isActive) return;

    // Calculate scroll amount based on time elapsed
    const scrollAmount = (currentSpeed / 1000) * ticker.deltaMS;

    // Move left (negative direction for right-to-left scrolling)
    offset -= scrollAmount;

    // Get the actual scaled sprite width (this is critical for seamless looping)
    const spriteWidth = Math.floor(sprite1.width); // Force integer width

    // Ultra-aggressive anti-tearing loop with larger buffer zone
    // Use a 5-pixel buffer to completely eliminate edge-case tearing
    const resetThreshold = -spriteWidth + 5;

    if (offset <= resetThreshold) {
      // Reset offset to create seamless loop
      // Use modulo to handle any accumulated floating-point errors
      offset = offset % spriteWidth;

      // Ensure offset is always within bounds and is an integer
      if (offset < -spriteWidth) {
        offset = offset + spriteWidth;
      }

      // Round to nearest integer to prevent sub-pixel positioning
      offset = Math.round(offset);

      // Final safety check - if somehow still out of bounds, reset to 0
      if (offset < -spriteWidth || offset > 0) {
        console.warn('Background loop reset failed, forcing offset to 0');
        offset = 0;
      }
    }

    // Position sprites with pixel-perfect positioning
    // Use consistent integer positioning to prevent tearing
    const sprite1X = Math.round(offset);
    const sprite2X = Math.round(offset + spriteWidth);

    sprite1.position.x = sprite1X;
    sprite2.position.x = sprite2X;

    // Debug: Log sprite positions occasionally to check for tearing
    if (Math.floor(Math.abs(offset)) % 100 === 0) {
      console.log(
        `🌅 Background offset: ${offset.toFixed(1)}, sprite1: ${sprite1X}, sprite2: ${sprite2X}, width: ${spriteWidth}`,
      );
    }

    // Update background width for offscreen spawning
    window.backgroundWidth = spriteWidth;
  };

  // Add ticker with frame rate limiting and additional anti-tearing measures
  app.ticker.maxFPS = 60; // Limit to 60 FPS to match common monitor refresh rates

  // Note: roundPixels is read-only in PixiJS v8, handled at sprite level instead
  // app.renderer.roundPixels = true; // This would cause a TypeError

  app.ticker.add(onTick);

  // Handle resize
  const onResize = () => {
    scaleToFit();

    // Scale all game elements to match the new background scale
    scaleGameElements();
  };

  app.renderer.on('resize', onResize);

  // Combat system functions
  async function spawnEnemy(type: EnemyType) {
    if (!app || enemies.length >= AUTO_SPAWN_CONFIG.maxEnemies) return;

    try {
      const { sprite, animator } = await createAnimatedEnemySprite(type, app.renderer, app.stage);

      // Position enemy offscreen to the right for smooth entry
      // Use scaled background dimensions for accurate positioning
      const bgWidth = 2048; // Original background width
      const bgHeight = 1024; // Original background height
      const scaledBgWidth = bgWidth * currentScale;
      const scaledBgHeight = bgHeight * currentScale;
      const positioning = new BackgroundPositioning(scaledBgWidth, scaledBgHeight);
      // Spawn offscreen to the right, accounting for scaled background width and buffer
      const spawnX = scaledBgWidth + OFFSCREEN_SPAWN_BUFFER;

      // Spawn only in the sky blue band (action area)
      const actionAreaTop = positioning.getActionAreaTopY();
      const actionAreaBottom = positioning.getActionAreaBottomY();
      const spawnY = actionAreaTop + Math.random() * (actionAreaBottom - actionAreaTop);

      sprite.position.set(spawnX, spawnY);
      sprite.scale.set(currentScale); // Scale to match background
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

        // Use custom collision detection with hit areas
        const isColliding = checkSpriteCollision(projectileSprite, dragonSprite);

        if (isColliding) {
          const oldHealth = dragonHealth;
          dragonHealth -= 10; // Enemy projectile damage

          // Start dragon health bar animation
          dragonPreviousHealth = oldHealth;
          dragonHealthAnimationStartTime = performance.now();

          console.log(
            `💥 DRAGON HIT by ${enemy.type}! Took 10 damage! Health: ${oldHealth} -> ${dragonHealth}/${dragonMaxHealth}`,
          );

          // Mark projectile as hit and set pierce timer
          if (!projectileSprite.userData) {
            projectileSprite.userData = {};
          }
          projectileSprite.userData.hasHit = true;
          projectileSprite.userData.hitTime = performance.now();

          return false; // Allow piercing effect
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

      // Scale the new projectile to match current game scale
      const projectileSprite = projectile.getSprite();
      projectileSprite.scale.set(currentScale);

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
      // Skip defeated enemies when selecting target
      if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
        return;
      }

      const dx = enemy.x - dragonSprite!.x;
      const dy = enemy.y - dragonSprite!.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance && distance <= DRAGON_ATTACK_RANGE) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    if (closestDistance > DRAGON_ATTACK_RANGE) return;

    // Double-check that the closest enemy is not defeated
    if (closestEnemy.sprite.userData && closestEnemy.sprite.userData.isDefeated) {
      return;
    }

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
        closestEnemy.sprite.x, // Use sprite center position for accurate aiming
        closestEnemy.sprite.y, // Use sprite center position for accurate aiming
        app.renderer,
        app.stage,
        collisionCallback,
      );

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

      projectile.setFPS(8);

      // Scale the new projectile to match current game scale
      const projectileSprite = projectile.getSprite();
      projectileSprite.scale.set(currentScale);

      projectiles.push(projectile);
      projectileTargets.set(projectile, closestEnemy); // Track which enemy this projectile targets
      console.log(
        `🚀 Dragon homing projectile created and added to array. Total projectiles: ${projectiles.length}`,
      );
    } catch (error) {
      console.error('Failed to fire projectile from dragon:', error);
    }
  }

  function startProjectileUpdateLoop() {
    if (projectileUpdateLoop) {
      console.log('⚠️ Projectile update loop already running');
      return;
    }

    console.log('🚀 Starting projectile update loop...');
    let lastTime = performance.now();
    let frameCount = 0;

    function updateProjectiles() {
      if (!app) return;

      frameCount++;
      if (frameCount % 60 === 0) {
        // Log every 60 frames (roughly once per second)
        console.log(`🔄 Projectile update loop running... frame ${frameCount}`);
      }

      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      const activeProjectiles = [];
      if (projectiles.length > 0) {
        console.log(`🔄 Updating ${projectiles.length} projectiles...`);
      }

      for (const projectile of projectiles) {
        try {
          const projectileSprite = projectile.getSprite();

          // Check if projectile sprite is valid before proceeding
          if (!projectileSprite) {
            console.log(`⚠️ Projectile sprite is null, destroying projectile`);
            projectile.destroy();
            continue;
          }

          // Check if projectile has hit and should be destroyed after pierce timer
          if (projectileSprite.userData && projectileSprite.userData.hasHit) {
            const hitTime = projectileSprite.userData.hitTime;
            const timeSinceHit = performance.now() - hitTime;

            if (timeSinceHit >= 70) {
              // 0.07 seconds = 70ms
              console.log(`⚡ Projectile pierce timer expired, destroying projectile`);
              projectile.destroy();
              continue; // Skip adding to active projectiles
            }
          }

          const stillActive = projectile.update(deltaTime);

          // Always keep projectiles active unless they've been explicitly marked for destruction
          // This ensures projectiles continue traveling even when they "miss" according to internal logic

          // Re-get sprite after update in case it was modified
          const currentProjectileSprite = projectile.getSprite();
          if (!currentProjectileSprite) {
            console.log(`⚠️ Projectile sprite became null after update, destroying projectile`);
            projectile.destroy();
            continue;
          }

          // Check if projectile is offscreen (missed) and should be despawned
          const screenWidth = app.screen.width;
          const offscreenBuffer = 100; // Extra buffer beyond screen edge

          if (currentProjectileSprite.x > screenWidth + offscreenBuffer) {
            console.log(`💨 Projectile went offscreen, despawning`);
            projectile.destroy();
          } else if (
            stillActive ||
            (currentProjectileSprite.userData && !currentProjectileSprite.userData.hasHit)
          ) {
            // Keep projectile active if:
            // 1. It's still active according to internal logic, OR
            // 2. It hasn't hit anything yet (allows missed projectiles to continue)
            activeProjectiles.push(projectile);
          }
        } catch (error) {
          console.error('Error updating projectile:', error);
          // Remove the problematic projectile
          projectile.destroy();
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

      // Remove defeated enemies after their death delay
      const activeEnemies = [];
      for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
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
      enemies.length = 0;
      enemies.push(...activeEnemies);

      // Update enemy movement and combat
      enemies.forEach((enemy, index) => {
        if (!dragonSprite) return;

        // Skip movement and combat for defeated enemies
        if (enemy.sprite.userData && enemy.sprite.userData.isDefeated) {
          return;
        }

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

      // Update health bars and arcana counter
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

      // Clean up health bars graphics
      if (healthBarsGraphics) {
        healthBarsGraphics.destroy();
        healthBarsGraphics = null;
      }

      container.destroy({ children: true });

      // Clean up debug graphics
      if (debugGraphics) {
        app.stage.removeChild(debugGraphics);
        debugGraphics.destroy();
      }
    },
  };
}
