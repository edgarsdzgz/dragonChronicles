/**
 * Infinite Scrolling Background System
 *
 * Creates a seamless infinite scrolling background that moves right to left
 * when the dragon is moving forward, creating a flying effect.
 */

import { Container, Sprite, Texture, Assets, type Application } from 'pixi.js';
import { createAnimatedDragonSprite, type DragonAnimator } from './dragon-sprites';
import { BackgroundPositioning } from './background-analyzer';

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

    // Position dragon using background positioning utilities
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

  // Load the background texture using Assets API for better reliability
  console.log('Loading background texture from: /backgrounds/scrolling-background.png');

  let texture: Texture;
  try {
    // Try using Assets API first
    console.log('DEBUG: Attempting Assets.load...');
    texture = await Assets.load('/backgrounds/scrolling-background.png');
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
    texture = await Texture.from('/backgrounds/scrolling-background.png');
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
  const onResize = () => {
    scaleToFit();

    // Reposition dragon on resize
    if (dragonSprite) {
      const positioning = new BackgroundPositioning(app.screen.width, app.screen.height);
      dragonSprite.x = 100; // Keep at left side
      dragonSprite.y = positioning.getSkyBlueBandY(); // Reposition in sky blue band
    }
  };

  app.renderer.on('resize', onResize);

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
    destroy: () => {
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
    },
  };
}
