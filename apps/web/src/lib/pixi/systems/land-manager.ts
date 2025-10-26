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
import { GAME_WORLD_WIDTH, GAME_WORLD_HEIGHT, type ResponsiveManager } from './responsive-manager';

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

  constructor(app: Application, assetManager: AssetManager, responsiveManager: ResponsiveManager) {
    this.app = app;
    this.assetManager = assetManager;
    this.responsiveManager = responsiveManager;
    this.container = new Container();
    this.container.label = 'land-manager';
    app.stage.addChildAt(this.container, 0);

    // Subscribe to responsive manager resize events
    this.resizeCallback = () => this.handleResize();
    this.responsiveManager.onResize(this.resizeCallback);
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
        backgroundColor: 0x87ceeb, // Sky blue fallback
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

    switch (this.movementState) {
      case 'forward':
        // Forward: scroll right to left (positive scroll)
        scrollDelta = dragonSpeed * deltaSeconds;
        break;
      case 'backward':
        // Backward: scroll left to right (negative scroll)
        scrollDelta = -dragonSpeed * deltaSeconds;
        break;
      case 'paused':
        // Paused: no scrolling
        scrollDelta = 0;
        break;
    }

    // Update cumulative scroll offset
    this.scrollOffset += scrollDelta;

    // Apply parallax scrolling to each layer
    this.currentLand.layers.forEach((layer) => {
      const sprite = this.landLayers.get(layer.id);
      if (!sprite) return;

      // Calculate layer-specific scroll offset based on parallax speed
      const layerScrollOffset = this.scrollOffset * layer.parallaxSpeed;

      // Apply scroll offset (move layers left/right)
      const gameWorldScale = this.responsiveManager.getGameWorldScale();

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
        const layerWidth = layer.width; // Use unscaled width for calculations
        const scaledLayerWidth = layerWidth * gameWorldScale;
        const normalizedOffset = ((layerScrollOffset % layerWidth) + layerWidth) % layerWidth;

        // Position first sprite
        sprite.x = (baseX - normalizedOffset) * gameWorldScale;

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

  destroy(): void {
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
