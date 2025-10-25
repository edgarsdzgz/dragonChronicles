/**
 * Responsive Manager
 *
 * Unified responsive system for all screens and systems.
 * Provides consistent stretching, scaling, and positioning rules.
 */

import { type Application } from 'pixi.js';

export interface ResponsiveConfig {
  // Screen breakpoints
  mobile: { width: number; height: number };
  tablet: { width: number; height: number };
  desktop: { width: number; height: number };

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
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop';
  scale: number;
  viewportWidth: number;
  viewportHeight: number;
  isDevToolsOpen: boolean;
  lastResizeTime: number;
}

export class ResponsiveManager {
  private app: Application;
  private config: ResponsiveConfig;
  private state: ResponsiveState;
  private resizeHandler: (() => void) | null = null;
  private devToolsHandler: (() => void) | null = null;
  private resizeTimeout: number | null = null;

  constructor(app: Application, config: Partial<ResponsiveConfig> = {}) {
    this.app = app;
    this.config = {
      // Default breakpoints
      mobile: { width: 480, height: 800 },
      tablet: { width: 768, height: 1024 },
      desktop: { width: 1920, height: 1080 },

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
      isDevToolsOpen: false,
      lastResizeTime: 0,
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
  getCurrentBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
    return this.state.currentBreakpoint;
  }

  /**
   * Get current scale factor
   */
  getScale(): number {
    return this.state.scale;
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
  }

  /**
   * Update responsive state
   */
  private updateResponsiveState(): void {
    this.state.viewportWidth = window.innerWidth;
    this.state.viewportHeight = window.innerHeight;
    this.updateBreakpoint();
    this.updateScale();
  }

  /**
   * Update current breakpoint
   */
  private updateBreakpoint(): void {
    const { viewportWidth } = this.state;

    if (viewportWidth <= this.config.mobile.width) {
      this.state.currentBreakpoint = 'mobile';
    } else if (viewportWidth <= this.config.tablet.width) {
      this.state.currentBreakpoint = 'tablet';
    } else {
      this.state.currentBreakpoint = 'desktop';
    }
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

    this.devToolsHandler = () => {
      this.state.isDevToolsOpen = !this.state.isDevToolsOpen;
      // Force resize after dev tools toggle
      setTimeout(() => {
        this.handleResize();
      }, 200);
    };

    // Standard resize
    window.addEventListener('resize', this.resizeHandler);

    // Visual viewport API for zoom
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', this.resizeHandler);
    }

    // Dev tools detection
    document.addEventListener('visibilitychange', this.devToolsHandler);
    window.addEventListener('focus', this.devToolsHandler);
    window.addEventListener('blur', this.devToolsHandler);
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

    if (this.devToolsHandler) {
      document.removeEventListener('visibilitychange', this.devToolsHandler);
      window.removeEventListener('focus', this.devToolsHandler);
      window.removeEventListener('blur', this.devToolsHandler);
      this.devToolsHandler = null;
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
