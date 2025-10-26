/**
 * Responsive Manager
 *
 * Unified responsive system for all screens and systems.
 * Provides consistent stretching, scaling, and positioning rules.
 *
 * GAME WORLD COORDINATE SYSTEM:
 * - Baseline: 1920x1080 "game world" coordinates
 * - All elements positioned in game world space
 * - Uniform WIDTH-FIRST scaling applied to entire game world
 * - Underground (purple) extends below viewport on tall screens
 */

import { type Application } from 'pixi.js';

/**
 * Game world dimensions (1080p baseline)
 * All game elements are positioned in this coordinate system
 */
export const GAME_WORLD_WIDTH = 1920;
export const GAME_WORLD_HEIGHT = 1080;

/**
 * Display breakpoint types for responsive design
 * Height-first detection: 4K/8K trump ultra-wide
 */
export type DisplayBreakpoint = 'mobile' | 'tablet' | 'desktop' | 'ultra-wide' | '4K' | '8K+';

/**
 * Breakpoint change event
 */
export interface BreakpointChangeEvent {
  oldBreakpoint: DisplayBreakpoint;
  newBreakpoint: DisplayBreakpoint;
  timestamp: number;
}

export interface ResponsiveConfig {
  // Screen breakpoints
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };
  ultraWide: { width: number; height: number };
  fourK: { width: number; height: number };
  eightKPlus: { width: number; height: number };

  // Scaling rules
  minScale: number;
  maxScale: number;
  maintainAspectRatio: boolean;

  // Positioning rules
  centerContent: boolean;
  allowOverflow: boolean;

  // F12/DevTools handling
  devToolsDebounceMs: number;
  forceRenderAfterResize: boolean;
}

export interface ResponsiveState {
  currentBreakpoint: DisplayBreakpoint;
  scale: number;
  viewportWidth: number;
  viewportHeight: number;
  lastResizeTime: number;
  gameWorldScale: number; // WIDTH-FIRST scale: viewport.width / GAME_WORLD_WIDTH
}

export class ResponsiveManager {
  private app: Application;
  private config: ResponsiveConfig;
  private state: ResponsiveState;
  private resizeHandler: (() => void) | null = null;
  private resizeTimeout: number | null = null;
  private breakpointChangeCallbacks: Array<(event: BreakpointChangeEvent) => void> = [];
  private resizeCallbacks: Array<() => void> = [];
  private previousBreakpoint: DisplayBreakpoint = 'desktop';

  constructor(app: Application, config: Partial<ResponsiveConfig> = {}) {
    this.app = app;
    this.config = {
      // Default breakpoints
      mobile: { width: 480, height: 800 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },
      ultraWide: { width: 2560, height: 1440 },
      fourK: { width: 3840, height: 2160 },
      eightKPlus: { width: 7680, height: 4320 },

      // Default scaling
      minScale: 0.5,
      maxScale: 2.0,
      maintainAspectRatio: true,

      // Default positioning
      centerContent: true,
      allowOverflow: false,

      // Default dev tools handling
      devToolsDebounceMs: 150,
      forceRenderAfterResize: true,

      ...config,
    };

    this.state = {
      currentBreakpoint: 'desktop',
      scale: 1.0,
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      lastResizeTime: 0,
      gameWorldScale: window.innerWidth / GAME_WORLD_WIDTH, // Initial WIDTH-FIRST scale
    };
  }

  /**
   * Initialize responsive system
   */
  initialize(): void {
    this.setupResizeHandlers();
    this.updateResponsiveState();
  }

  /**
   * Get current responsive state
   */
  getState(): ResponsiveState {
    return { ...this.state };
  }

  /**
   * Get current breakpoint
   */
  getCurrentBreakpoint(): DisplayBreakpoint {
    return this.state.currentBreakpoint;
  }

  /**
   * Get current scale factor
   */
  getScale(): number {
    return this.state.scale;
  }

  /**
   * Get game world scale (WIDTH-FIRST: viewport.width / GAME_WORLD_WIDTH)
   * All game elements should multiply their intended scale by this value
   *
   * @example
   * // Dragon intended scale: 0.8 at 1080p baseline
   * const finalScale = 0.8 * responsiveManager.getGameWorldScale();
   * dragonSprite.scale.set(finalScale);
   *
   * @example
   * // Grass positioned at 507.6px from top in game world
   * const finalY = 507.6 * responsiveManager.getGameWorldScale();
   * grassSprite.y = finalY;
   */
  getGameWorldScale(): number {
    return this.state.gameWorldScale;
  }

  /**
   * Subscribe to breakpoint change events
   */
  onBreakpointChange(callback: (event: BreakpointChangeEvent) => void): void {
    this.breakpointChangeCallbacks.push(callback);
  }

  /**
   * Unsubscribe from breakpoint change events
   */
  offBreakpointChange(callback: (event: BreakpointChangeEvent) => void): void {
    const index = this.breakpointChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.breakpointChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Subscribe to resize events
   * All managers should use this instead of window.addEventListener('resize')
   */
  onResize(callback: () => void): void {
    this.resizeCallbacks.push(callback);
  }

  /**
   * Unsubscribe from resize events
   */
  offResize(callback: () => void): void {
    const index = this.resizeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.resizeCallbacks.splice(index, 1);
    }
  }

  /**
   * Calculate responsive scale for content
   *
   * WIDTH-FIRST SCALING RULE:
   * - Width is ALWAYS more important than height
   * - Images should fill edge-to-edge horizontally (no dead space on sides)
   * - It's okay to cut off top/bottom of images
   * - Maintains aspect ratio (no stretching)
   *
   * Exception: Portrait mobile (future - force landscape for now)
   */
  calculateScale(contentWidth: number, contentHeight: number): number {
    const { viewportWidth, viewportHeight } = this.state;

    if (!this.config.maintainAspectRatio) {
      // Simple scaling based on width
      return Math.min(viewportWidth / contentWidth, this.config.maxScale);
    }

    // WIDTH-FIRST RULE: Always use width scale
    // This ensures no dead space on sides (top/bottom may be cut off)
    const scaleX = viewportWidth / contentWidth;

    return Math.max(this.config.minScale, Math.min(scaleX, this.config.maxScale));
  }

  /**
   * Calculate centered position for content
   */
  calculateCenteredPosition(
    contentWidth: number,
    contentHeight: number,
    scale: number,
  ): { x: number; y: number } {
    if (!this.config.centerContent) {
      return { x: 0, y: 0 };
    }

    const scaledWidth = contentWidth * scale;
    const scaledHeight = contentHeight * scale;

    return {
      x: (this.state.viewportWidth - scaledWidth) / 2,
      y: (this.state.viewportHeight - scaledHeight) / 2,
    };
  }

  /**
   * Convert mouse event coordinates to PixiJS canvas coordinates
   *
   * Handles browser zoom, window resize, F12 DevTools, and canvas scaling.
   * Use this for ALL mouse/pointer event handling.
   *
   * @param event MouseEvent or PointerEvent
   * @returns { x, y } coordinates in PixiJS canvas space
   *
   * @example
   * const coords = responsiveManager.getMouseCoordinates(event);
   * if (isPointInButton(coords.x, coords.y, button)) { ... }
   */
  getMouseCoordinates(event: MouseEvent | PointerEvent): { x: number; y: number } {
    const rect = this.app.canvas.getBoundingClientRect();

    // Calculate scale factors between canvas internal size and DOM display size
    const scaleX = this.app.screen.width / rect.width;
    const scaleY = this.app.screen.height / rect.height;

    // Convert client coordinates to canvas coordinates
    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  }

  /**
   * Handle window resize with unified rules
   */
  handleResize(): void {
    // Clear any pending resize
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Debounce resize to handle rapid changes (like F12 toggle)
    this.resizeTimeout = window.setTimeout(() => {
      this.processResize();
    }, this.config.devToolsDebounceMs);
  }

  /**
   * Process resize after debounce
   */
  private processResize(): void {
    // Update viewport dimensions
    this.state.viewportWidth = window.innerWidth;
    this.state.viewportHeight = window.innerHeight;
    this.state.lastResizeTime = Date.now();

    // Update game world scale (WIDTH-FIRST)
    this.state.gameWorldScale = this.state.viewportWidth / GAME_WORLD_WIDTH;

    // Detect breakpoint
    this.updateBreakpoint();

    // Force app to resize
    this.app.resize();

    // Update scale
    this.updateScale();

    // Force render if configured
    if (this.config.forceRenderAfterResize) {
      this.app.render();
    }

    // Notify all subscribers that resize is complete
    this.notifyResize();
  }

  /**
   * Update responsive state
   */
  private updateResponsiveState(): void {
    this.state.viewportWidth = window.innerWidth;
    this.state.viewportHeight = window.innerHeight;
    this.state.gameWorldScale = this.state.viewportWidth / GAME_WORLD_WIDTH; // WIDTH-FIRST
    this.updateBreakpoint();
    this.updateScale();
  }

  /**
   * Update breakpoint based on viewport size
   * HEIGHT-FIRST DETECTION: 4K/8K trump ultra-wide
   */
  private updateBreakpoint(): void {
    const { viewportWidth, viewportHeight } = this.state;
    const oldBreakpoint = this.state.currentBreakpoint;
    let newBreakpoint: DisplayBreakpoint;

    // Height-first detection (4K/8K trump ultra-wide)
    if (viewportHeight > 2160) {
      newBreakpoint = '8K+';
    } else if (viewportHeight > 1440) {
      newBreakpoint = '4K';
    } else if (viewportWidth > 2560) {
      newBreakpoint = 'ultra-wide';
    } else if (viewportWidth > 1024) {
      newBreakpoint = 'desktop';
    } else if (viewportWidth > 480) {
      newBreakpoint = 'tablet';
    } else {
      newBreakpoint = 'mobile';
    }

    this.state.currentBreakpoint = newBreakpoint;

    // Fire event if breakpoint changed
    if (oldBreakpoint !== newBreakpoint) {
      this.notifyBreakpointChange({
        oldBreakpoint,
        newBreakpoint,
        timestamp: Date.now(),
      });
    }
  }

  /**
   * Notify all subscribers of breakpoint change
   */
  private notifyBreakpointChange(event: BreakpointChangeEvent): void {
    this.breakpointChangeCallbacks.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in breakpoint change callback:', error);
      }
    });
  }

  /**
   * Notify all subscribers of resize event
   * This is called after ResponsiveManager has processed the resize
   */
  private notifyResize(): void {
    this.resizeCallbacks.forEach((callback) => {
      try {
        callback();
      } catch (error) {
        console.error('Error in resize callback:', error);
      }
    });
  }

  /**
   * Update scale factor
   */
  private updateScale(): void {
    const { viewportWidth, viewportHeight } = this.state;

    // Base scale on viewport size
    const baseScale = Math.min(
      viewportWidth / this.config.desktop.width,
      viewportHeight / this.config.desktop.height,
    );
    this.state.scale = Math.max(this.config.minScale, Math.min(baseScale, this.config.maxScale));
  }

  /**
   * Set up resize handlers
   */
  private setupResizeHandlers(): void {
    this.resizeHandler = () => {
      this.handleResize();
    };

    // Standard resize
    window.addEventListener('resize', this.resizeHandler);

    // Visual viewport API for zoom
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', this.resizeHandler);
    }

    // Note: Removed focus/blur/visibilitychange listeners - they triggered on normal
    // window interactions (clicking in/out), causing unnecessary resize events.
    // Standard resize listener handles actual viewport size changes including F12 toggle.
  }

  /**
   * Clean up handlers
   */
  private cleanupHandlers(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', this.resizeHandler);
      }
      this.resizeHandler = null;
    }

    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
      this.resizeTimeout = null;
    }
  }

  /**
   * Destroy responsive manager
   */
  destroy(): void {
    this.cleanupHandlers();
  }
}

/**
 * Create a responsive manager with default settings
 */
export function createResponsiveManager(
  app: Application,
  config?: Partial<ResponsiveConfig>,
): ResponsiveManager {
  return new ResponsiveManager(app, config);
}
