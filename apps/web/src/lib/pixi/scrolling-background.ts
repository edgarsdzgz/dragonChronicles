/**
 * Infinite Scrolling Background System
 *
 * Creates a seamless infinite scrolling background that moves right to left
 * when the dragon is moving forward, creating a flying effect.
 */

import { Container, Sprite, Texture, type Application } from 'pixi.js';

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

  // Load the background texture
  const texture = await Texture.from('/backgrounds/scrolling-background.png');

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
    destroy: () => {
      app.ticker.remove(onTick);
      app.renderer.off('resize', onResize);
      container.destroy({ children: true });
    },
  };
}
