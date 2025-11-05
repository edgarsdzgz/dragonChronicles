/**
 * Land Manager System
 *
 * Handles loading and managing different lands/regions with their
 * background layers, parallax effects, and terrain.
 *
 * GAME WORLD COORDINATES:
 * All layers positioned in 1920x1080 game world space.
 * ResponsiveManager.getGameWorldScale() applied uniformly to all layers.
 */

import { Container, Sprite, type Application } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { AssetManager } from './rendering/asset-manager';
import type { ResponsiveManager } from './responsive-manager';
import type { EventBus, EventSubscription, UIEvent } from '@draconia/shared';

/**
 * Land layer configuration
 */
export interface LandLayer {
  id: string;
  assetPath: string;
  zIndex: number;
  parallaxSpeed: number;
  x: number;
  y: number;
  width: number;
  height: number;
  sprite?: Sprite;
}

/**
 * Movement state for journey controls
 */
export type MovementState = 'backward' | 'paused' | 'forward';

/**
 * Land configuration
 */
export interface LandConfig {
  id: string;
  name: string;
  backgroundColor: number; // Hex color for canvas background (underground color)
  layers: LandLayer[];
  scrollSpeed: number;
  enableParallax: boolean;
}

/**
 * Land Manager class
 */
export interface LandManagerConfig {
  eventBus?: EventBus; // Event bus for event-driven communication
}

export class LandManager {
  private app: Application;
  private assetManager: AssetManager;
  private responsiveManager: ResponsiveManager;
  private container: Container;
  private currentLand: LandConfig | null = null;
  private landLayers: Map<string, Sprite> = new Map();
  private landLayersTiled: Map<string, Sprite> = new Map(); // Second sprite for seamless tiling
  private scrollOffset: number = 0;
  private isActive: boolean = false;
  private resizeCallback: (() => void) | null = null;
  private movementState: MovementState = 'forward'; // Default: moving forward

  // Event system
  private eventBus: EventBus | null = null;
  private eventSubscriptions: EventSubscription[] = [];

  // Cutscene state
  private isInCutscene: boolean = false;
  private cutsceneScale: number = 1.0; // Scale multiplier for layers during cutscene
  private cutsceneSpeedMultiplier: number = 1.0; // Speed multiplier for scrolling during cutscene
  private cutsceneBackgroundYOffset: number = 0; // Y offset for background during cutscene (in pixels)
  private cutsceneCloudXOffsetProgress: number = 0; // Cloud X-offset progress: 1.0 = 75% offset, 0.0 = no offset (smooth transition)
  private cutsceneCloudScaleMultiplier: number = 1.0; // Cloud scale multiplier: 1.0 = same as other layers, <1.0 = slower zoom
  private cloudDriftOffset: number = 0; // Independent cloud drift offset (pixels) - clouds slowly drift right to help hide bad cloud

  constructor(
    app: Application,
    assetManager: AssetManager,
    responsiveManager: ResponsiveManager,
    config: LandManagerConfig = {},
  ) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;
    this.container = new Container();
    this.container.label = 'land-manager';
    app.stage.addChildAt(this.container, 0);

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);

    // Set up event bus and listeners
    this.eventBus = config.eventBus || null;
    if (this.eventBus) {
      this.setupEventListeners();
    }
  }

  /**
   * Set up event listeners for UI events
   */
  private setupEventListeners(): void {
    if (!this.eventBus) return;

    // Listen for movement button clicked events
    const movementSub = this.eventBus.on<UIEvent>('ui', 'movement_button_clicked', (event) => {
      const payload = event.payload as { buttonType: 'backward' | 'pause' | 'forward' };
      // Convert JourneyButtonType to MovementState
      const movementState = payload.buttonType === 'pause' ? 'paused' : payload.buttonType;
      this.setMovementState(movementState);
    });
    this.eventSubscriptions.push(movementSub);
  }

  /**
   * Load a specific land
   */
  async loadLand(landId: string): Promise<boolean> {
    try {
      console.log(`🌍 Land Manager: Loading land ${landId}...`);

      // Clear current land
      this.clearCurrentLand();

      // Get land configuration
      const landConfig = this.getLandConfig(landId);
      if (!landConfig) {
        console.error(`❌ Land Manager: Unknown land ${landId}`);
        return false;
      }

      this.currentLand = landConfig;

      // Set canvas background color for this land
      this.setBackgroundColor(landConfig.backgroundColor);

      // Load all layers
      for (const layer of landConfig.layers) {
        await this.loadLandLayer(layer);
      }

      console.log(`✅ Land Manager: Successfully loaded land ${landId}`);
      return true;
    } catch (error) {
      console.error(`❌ Land Manager: Failed to load land ${landId}:`, error);
      return false;
    }
  }

  /**
   * Get land configuration
   */
  private getLandConfig(landId: string): LandConfig | null {
    const landConfigs: Record<string, LandConfig> = {
      land1_steppe: {
        id: 'land1_steppe',
        name: 'Horizon Steppe',
        backgroundColor: 0x7e2453, // Underground purple
        scrollSpeed: 0, // Static scene - no movement
        enableParallax: false, // Static scene - no parallax
        layers: [
          // Layer 1: Base background (sky/horizon)
          {
            id: 'background',
            assetPath: 'steppe-background', // Asset ID from AssetManager definitions
            zIndex: 0,
            parallaxSpeed: 0,
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
          },
          // Layer 2: Clouds parallax (6.94% from top, 5% from left edge)
          {
            id: 'clouds',
            assetPath: 'steppe-clouds', // Asset ID from AssetManager definitions
            zIndex: 1,
            parallaxSpeed: 0.125, // 12.5% of dragon speed
            x: 96, // 5% from left (96px at 1080p)
            y: 75, // 6.94% from top (365px above hills)
            width: 2048, // Approximate width (extends off-screen to the right)
            height: 500, // Approximate height
          },
          // Layer 3: Mountains parallax (8.33% from top, starts offscreen right)
          {
            id: 'mountains',
            assetPath: 'steppe-mountains', // Asset ID from AssetManager definitions
            zIndex: 2,
            parallaxSpeed: 0.005, // 0.5% of dragon speed (slowest)
            x: 1920, // Start completely offscreen right (100% of game world width)
            y: 90, // 8.33% from top (raised 5px from 95)
            width: 2048, // Approximate width (extends off-screen to the right)
            height: 500, // Approximate height
          },
          // Layer 4: Hills parallax (40.28% from top, 5% from left edge)
          {
            id: 'hills',
            assetPath: 'steppe-hills', // Asset ID from AssetManager definitions
            zIndex: 3,
            parallaxSpeed: 0.6, // 60% of dragon speed
            x: 96, // 5% from left (96px at 1080p)
            y: 435, // 40.28% from top (raised 5px from 440)
            width: 2048, // Native width (extends off-screen to the right)
            height: 80, // Native height
          },
          // Layer 5: Grassland foreground (44.72% from top, -2% offscreen left)
          {
            id: 'foreground-grass',
            assetPath: 'steppe-ground', // Asset ID from AssetManager definitions
            zIndex: 4,
            parallaxSpeed: 1.0, // 100% of dragon speed (full speed)
            x: -38, // -2% offscreen left (-38.4px at 1080p)
            y: 483, // 44.72% from top (raised 7px from 490)
            width: 2048, // Native width
            height: 64, // Native height (estimated, will scale naturally)
          },
        ],
      },
    };

    return landConfigs[landId] || null;
  }

  /**
   * Load a single land layer
   * Uses UNIFIED GAME WORLD SCALING - all layers scale uniformly
   */
  private async loadLandLayer(layer: LandLayer): Promise<void> {
    try {
      console.log(`🌍 Land Manager: Loading layer ${layer.id}...`);

      // Load texture using the asset manager's loadAsset method
      console.log(`🔍 Land Manager: Requesting asset from path: ${layer.assetPath}`);
      const assetResult = await this.assetManager.loadAsset(layer.assetPath);
      console.log(`🔍 Land Manager: Asset result for ${layer.id}:`, {
        success: assetResult.success,
        hasAsset: !!assetResult.asset,
        error: assetResult.error,
      });

      if (!assetResult.success || !assetResult.asset) {
        console.error(
          `❌ Land Manager: Failed to load texture for ${layer.id}: ${assetResult.error}`,
        );
        return;
      }

      // Get uniform game world scale
      const gameWorldScale = this.responsiveManager.getGameWorldScale();

      // Create sprite
      const sprite = new Sprite(assetResult.asset);

      // Apply uniform game world scale and positioning
      // All coordinates are in game world space (1920x1080 baseline)
      if (layer.id === 'background') {
        // Background: 1920x1080, positioned at (0, 0) in game world
        // Intended scale: 1.0 at baseline
        sprite.scale.set(gameWorldScale);
        sprite.x = 0;
        sprite.y = 0;
      } else if (layer.id === 'foreground-grass') {
        // Grass: 2048x64 native, positioned at (-38.4, 483) in game world
        // -38.4 = -2% of 1920, 483 = 44.72% of 1080 (raised 25px from original 508)
        // Intended scale: 1.0 at baseline (native size)
        sprite.scale.set(gameWorldScale);
        sprite.x = -38.4 * gameWorldScale;
        sprite.y = 483 * gameWorldScale;
      } else {
        // Other layers: Use game world scale
        sprite.scale.set(gameWorldScale);
        sprite.x = layer.x * gameWorldScale;
        sprite.y = layer.y * gameWorldScale;
      }

      // Set z-index
      const zIndex = Z_LAYERS.BACKGROUND + layer.zIndex;
      setZIndex(sprite, zIndex);

      console.log(
        `🔍 Land Manager: Created sprite for ${layer.id} at (${sprite.x.toFixed(0)}, ${sprite.y.toFixed(0)}), scale: ${sprite.scale.x.toFixed(2)}, z-index: ${zIndex}`,
      );

      // Add to container
      this.container.addChild(sprite);
      console.log(
        `🔍 Land Manager: Added sprite to container. Container children count: ${this.container.children.length}`,
      );

      // Store reference
      this.landLayers.set(layer.id, sprite);

      // Create second sprite for tiling (except for static background)
      if (layer.id !== 'background') {
        const tiledSprite = new Sprite(assetResult.asset);
        tiledSprite.scale.set(sprite.scale.x, sprite.scale.y);
        tiledSprite.y = sprite.y;
        setZIndex(tiledSprite, zIndex);
        this.container.addChild(tiledSprite);
        this.landLayersTiled.set(layer.id, tiledSprite);
        console.log(`🔍 Land Manager: Created tiled sprite for ${layer.id}`);
      }

      console.log(`✅ Land Manager: Loaded layer ${layer.id}`);
    } catch (error) {
      console.error(`❌ Land Manager: Failed to load layer ${layer.id}:`, error);
    }
  }

  /**
   * Clear current land
   */
  private clearCurrentLand(): void {
    console.log('🧹 Land Manager: Clearing current land...');

    // Remove all sprites
    this.landLayers.forEach((sprite) => {
      this.container.removeChild(sprite);
      sprite.destroy();
    });
    this.landLayers.clear();

    // Remove tiled sprites
    this.landLayersTiled.forEach((sprite) => {
      this.container.removeChild(sprite);
      sprite.destroy();
    });
    this.landLayersTiled.clear();

    this.currentLand = null;
    this.scrollOffset = 0;
  }

  /**
   * Update land rendering with parallax scrolling
   * @param deltaTime - Time elapsed since last frame (milliseconds)
   * @param dragonSpeed - Dragon movement speed in pixels per second
   */
  update(deltaTime: number, dragonSpeed: number): void {
    if (!this.currentLand || !this.isActive) {
      return;
    }

    // Calculate scroll delta based on movement state
    let scrollDelta = 0;
    const deltaSeconds = deltaTime / 1000; // Convert to seconds

    // Apply cutscene speed multiplier if in cutscene mode
    const effectiveSpeed = this.isInCutscene
      ? dragonSpeed * this.cutsceneSpeedMultiplier
      : dragonSpeed;

    switch (this.movementState) {
      case 'forward':
        // Forward: scroll right to left (positive scroll)
        scrollDelta = effectiveSpeed * deltaSeconds;
        break;
      case 'backward':
        // Backward: scroll left to right (negative scroll)
        scrollDelta = -effectiveSpeed * deltaSeconds;
        break;
      case 'paused':
        // Paused: no scrolling
        scrollDelta = 0;
        break;
    }

    // Update cumulative scroll offset
    this.scrollOffset += scrollDelta;

    // If in cutscene mode, apply slow rightward drift to clouds
    // This helps counteract the visual effect of zoom "pulling" bad clouds into view
    if (this.isInCutscene) {
      const CLOUD_DRIFT_SPEED = 25; // pixels per second - slow rightward drift
      this.cloudDriftOffset += CLOUD_DRIFT_SPEED * deltaSeconds;
    }

    // Apply parallax scrolling to each layer
    this.currentLand.layers.forEach((layer) => {
      const sprite = this.landLayers.get(layer.id);
      if (!sprite) return;

      // Calculate layer-specific scroll offset based on parallax speed
      const layerScrollOffset = this.scrollOffset * layer.parallaxSpeed;

      // Apply scroll offset (move layers left/right)
      const gameWorldScale = this.responsiveManager.getGameWorldScale();

      // Apply cutscene scale if in cutscene mode
      // Clouds get special slower zoom treatment
      let effectiveScale: number;
      if (this.isInCutscene) {
        if (layer.id === 'clouds') {
          // Clouds use separate scale multiplier for slower zoom
          effectiveScale = gameWorldScale * this.cutsceneScale * this.cutsceneCloudScaleMultiplier;
        } else {
          effectiveScale = gameWorldScale * this.cutsceneScale;
        }
      } else {
        effectiveScale = gameWorldScale;
      }

      sprite.scale.set(effectiveScale);
      const tiledSprite = this.landLayersTiled.get(layer.id);
      if (tiledSprite) {
        tiledSprite.scale.set(effectiveScale);
      }

      // Apply cutscene Y offset if in cutscene mode
      // Foreground and hills get special treatment - needs to align with horizon
      let effectiveY: number;
      if (this.isInCutscene) {
        if (layer.id === 'foreground-grass') {
          // Calculate normal Y position
          const normalY = layer.y * gameWorldScale;
          // Calculate cutscene Y position (fixed at 700 game world coords)
          const cutsceneY = 700 * gameWorldScale;

          // During zoom out (scale < 3x), interpolate from cutscene Y to normal Y
          // This keeps the ground at the horizon line as we zoom out
          const zoomProgress = Math.max(0, Math.min(1, (3.0 - this.cutsceneScale) / (3.0 - 1.0))); // 0 at 3x, 1 at 1x
          effectiveY = cutsceneY + (normalY - cutsceneY) * zoomProgress;

          console.log(
            `🎬 Land Manager: Foreground Y=${effectiveY.toFixed(0)}px (zoom: ${zoomProgress.toFixed(2)}, scale: ${this.cutsceneScale.toFixed(2)}x, normal: ${normalY.toFixed(0)})`,
          );
        } else if (layer.id === 'hills') {
          // Calculate normal Y position
          const normalY = layer.y * gameWorldScale;
          // Calculate cutscene Y position (just above the ground)
          const cutsceneY = 580;

          // During zoom out (scale < 3x), interpolate from cutscene Y to normal Y
          const zoomProgress = Math.max(0, Math.min(1, (3.0 - this.cutsceneScale) / (3.0 - 1.0))); // 0 at 3x, 1 at 1x
          effectiveY = cutsceneY + (normalY - cutsceneY) * zoomProgress;

          console.log(
            `🎬 Land Manager: Hills Y=${effectiveY.toFixed(0)}px (zoom: ${zoomProgress.toFixed(2)}, scale: ${this.cutsceneScale.toFixed(2)}x, normal: ${normalY.toFixed(0)})`,
          );
        } else if (layer.id === 'clouds') {
          // Clouds: Apply background Y offset with 10% acceleration during zoom out
          // This makes clouds drop into position faster to avoid clipping
          const zoomProgress = Math.max(0, Math.min(1, (3.0 - this.cutsceneScale) / (3.0 - 1.0)));
          const acceleratedProgress = Math.min(1, zoomProgress * 1.1); // 10% faster drop

          // Interpolate background Y offset with acceleration
          const acceleratedBgYOffset = this.cutsceneBackgroundYOffset * (1 - acceleratedProgress);
          effectiveY = layer.y * gameWorldScale + acceleratedBgYOffset * gameWorldScale;

          console.log(
            `🎬 Land Manager: Clouds Y=${effectiveY.toFixed(0)}px (zoom: ${zoomProgress.toFixed(2)}, accel: ${acceleratedProgress.toFixed(2)}, bgOffset: ${acceleratedBgYOffset.toFixed(0)})`,
          );
        } else {
          // Background layers: Apply standard background Y offset
          effectiveY = layer.y * gameWorldScale + this.cutsceneBackgroundYOffset * gameWorldScale;
        }
      } else {
        // Normal mode: Use standard game world positioning
        effectiveY = layer.y * gameWorldScale;
      }

      sprite.y = effectiveY;
      if (tiledSprite) {
        tiledSprite.y = effectiveY;
      }

      if (layer.id === 'background') {
        // Background: static, no scrolling
        sprite.x = 0;
      } else {
        // All scrolling layers: implement seamless tiling with dual sprites
        const tiledSprite = this.landLayersTiled.get(layer.id);
        if (!tiledSprite) return;

        let baseX: number;

        if (layer.id === 'foreground-grass') {
          baseX = -38.4;
        } else if (layer.id === 'hills') {
          baseX = 96;
        } else if (layer.id === 'clouds') {
          baseX = 96;
        } else if (layer.id === 'mountains') {
          baseX = 1920;
        } else {
          baseX = layer.x;
        }

        // Calculate wrapped position for seamless looping
        // Handle negative modulo correctly for backward scrolling
        // Use actual texture width, not configured width, for accurate tiling
        const layerWidth = sprite.texture.width; // Use actual texture width
        const scaledLayerWidth = layerWidth * effectiveScale;

        // For clouds during cutscene, apply X-axis offset based on progress (smoothly transition from 75% to 0%)
        let xOffsetAdjustment = 0;
        if (layer.id === 'clouds') {
          // Static offset: 0-75% based on progress (hides bad cloud initially)
          const staticOffset = layerWidth * 0.75 * this.cutsceneCloudXOffsetProgress;
          // Drift offset: slow rightward drift to counteract zoom's leftward pull
          const driftOffset = this.cloudDriftOffset;
          xOffsetAdjustment = staticOffset + driftOffset;
        }

        const normalizedOffset = (((layerScrollOffset + xOffsetAdjustment) % layerWidth) + layerWidth) % layerWidth;

        // Position first sprite
        sprite.x = (baseX - normalizedOffset) * effectiveScale;

        // Position second sprite to always create seamless tile to the right
        // This works for both forward and backward scrolling
        tiledSprite.x = sprite.x + scaledLayerWidth;
      }
    });
  }

  /**
   * Set canvas background color
   */
  private setBackgroundColor(color: number): void {
    if (this.app.renderer) {
      this.app.renderer.background.color = color;
      console.log(`🎨 Land Manager: Set background color to 0x${color.toString(16)}`);
    }
  }

  /**
   * Set scroll speed
   */
  setScrollSpeed(speed: number): void {
    if (this.currentLand) {
      this.currentLand.scrollSpeed = speed;
    }
  }

  /**
   * Set movement state (controlled by UI journey buttons)
   */
  setMovementState(state: MovementState): void {
    const previousState = this.movementState;
    this.movementState = state;
    console.log(`🌍 Land Manager: Movement state changed: ${previousState} → ${state}`);
  }

  /**
   * Get current movement state
   */
  getMovementState(): MovementState {
    return this.movementState;
  }

  /**
   * Get current land
   */
  getCurrentLand(): LandConfig | null {
    return this.currentLand;
  }

  /**
   * Check if land is loaded
   */
  isLandLoaded(): boolean {
    return this.currentLand !== null;
  }

  /**
   * Start land rendering
   */
  start(): void {
    this.isActive = true;
    console.log('🌍 Land Manager: Started');
  }

  /**
   * Stop land rendering
   */
  stop(): void {
    this.isActive = false;
    console.log('🌍 Land Manager: Stopped');
  }

  /**
   * Destroy land manager
   */
  /**
   * Handle resize events from ResponsiveManager
   * ResponsiveManager has already handled app.resize() and app.render()
   * Uses UNIFIED GAME WORLD SCALING - all layers scale uniformly
   */
  handleResize(): void {
    if (!this.currentLand) return;

    console.log(
      `🌍 Land Manager: Handling resize - ${this.app.screen.width}x${this.app.screen.height}`,
    );

    // Get uniform game world scale
    const gameWorldScale = this.responsiveManager.getGameWorldScale();

    console.log(`🌍 Land Manager: Game world scale: ${gameWorldScale.toFixed(3)}`);

    // Update all land layers using game world coordinates
    this.landLayers.forEach((sprite, layerId) => {
      const layer = this.currentLand?.layers.find((l) => l.id === layerId);
      if (layer) {
        if (layerId === 'background') {
          // Background: 1920x1080, positioned at (0, 0) in game world
          sprite.scale.set(gameWorldScale);
          sprite.x = 0;
          sprite.y = 0;

          console.log(
            `🌍 Land Manager: Updated ${layerId} - scale: ${gameWorldScale.toFixed(3)}, pos: (${sprite.x.toFixed(0)}, ${sprite.y.toFixed(0)})`,
          );
        } else {
          // Other layers: Use game world coordinates and update scale
          sprite.scale.set(gameWorldScale);
          sprite.y = layer.y * gameWorldScale;

          // Update tiled sprite as well
          const tiledSprite = this.landLayersTiled.get(layerId);
          if (tiledSprite) {
            tiledSprite.scale.set(gameWorldScale);
            tiledSprite.y = layer.y * gameWorldScale;
          }

          console.log(`🌍 Land Manager: Updated ${layerId} - scale: ${gameWorldScale.toFixed(3)}`);
        }
      }
    });

    console.log(
      `🌍 Land Manager: Resize completed - ${this.app.screen.width}x${this.app.screen.height}`,
    );
  }

  /**
   * Set cutscene state (scale, speed multiplier, and background Y offset)
   * Used by cutscene manager to control land appearance and scrolling
   * @param scale - Scale multiplier for all layers (1.0 = normal, 3.0 = 3x zoomed in)
   * @param speedMultiplier - Speed multiplier for scrolling (1.0 = normal, 3.0 = 3x faster)
   * @param backgroundYOffset - Y offset for background in pixels (negative moves up)
   */
  setCutsceneState(scale: number, speedMultiplier: number, backgroundYOffset: number = 0): void {
    this.isInCutscene = true;
    this.cutsceneScale = scale;
    this.cutsceneSpeedMultiplier = speedMultiplier;
    this.cutsceneBackgroundYOffset = backgroundYOffset;

    console.log(
      `🎬 Land Manager: Cutscene state set - scale: ${scale.toFixed(2)}x, speed: ${speedMultiplier.toFixed(2)}x, Y offset: ${backgroundYOffset}px`,
    );
  }

  /**
   * Set cloud scale multiplier for slower zoom
   * @param multiplier - Scale multiplier (1.0 = normal zoom, <1.0 = slower zoom)
   */
  setCutsceneCloudScaleMultiplier(multiplier: number): void {
    this.cutsceneCloudScaleMultiplier = Math.max(0.1, Math.min(1, multiplier));
  }

  /**
   * Set cloud X-offset progress for smooth transition
   * @param progress - 0.0 to 1.0, where 1.0 = 75% offset (clouds offscreen), 0.0 = no offset (normal)
   */
  setCutsceneCloudXOffsetProgress(progress: number): void {
    const oldProgress = this.cutsceneCloudXOffsetProgress;
    const newProgress = Math.max(0, Math.min(1, progress));

    // Compensate scroll offset to maintain visual cloud alignment
    // Get cloud sprite to calculate offset delta
    const cloudSprite = this.landLayers.get('clouds');
    if (cloudSprite && cloudSprite.texture) {
      const cloudLayerWidth = cloudSprite.texture.width;
      const oldOffset = cloudLayerWidth * 0.75 * oldProgress;
      const newOffset = cloudLayerWidth * 0.75 * newProgress;
      const offsetDelta = oldOffset - newOffset;

      // Adjust base scroll offset to compensate
      // When offset decreases, increase scrollOffset by the same amount to keep clouds in place
      if (Math.abs(offsetDelta) > 0.01) {
        this.scrollOffset += offsetDelta;
        console.log(
          `🎬 Land Manager: Cloud offset compensation - delta=${offsetDelta.toFixed(1)}px (progress ${oldProgress.toFixed(2)} → ${newProgress.toFixed(2)})`,
        );
      }
    }

    this.cutsceneCloudXOffsetProgress = newProgress;
  }

  /**
   * Exit cutscene mode and return to normal state
   */
  exitCutsceneMode(): void {
    this.isInCutscene = false;
    this.cutsceneScale = 1.0;
    this.cutsceneSpeedMultiplier = 1.0;
    this.cutsceneCloudXOffsetProgress = 0; // Reset cloud offset progress
    this.cutsceneCloudScaleMultiplier = 1.0; // Reset cloud scale
    // NOTE: Do NOT reset cloudDriftOffset - preserve accumulated drift to prevent visual snap
    // The drift will remain constant after cutscene (only accumulates during isInCutscene)

    console.log(`🎬 Land Manager: Exited cutscene mode (cloudDrift preserved: ${this.cloudDriftOffset.toFixed(1)}px)`);
  }

  destroy(): void {
    // Unsubscribe from event listeners
    for (const subscription of this.eventSubscriptions) {
      subscription.unsubscribe();
    }
    this.eventSubscriptions = [];

    // Unsubscribe from responsive manager
    if (this.resizeCallback) {
      this.responsiveManager.offResize(this.resizeCallback);
      this.resizeCallback = null;
    }

    this.clearCurrentLand();
    this.container.destroy();
    console.log('🌍 Land Manager: Destroyed');
  }
}
