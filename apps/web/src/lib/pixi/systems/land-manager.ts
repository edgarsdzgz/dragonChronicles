/**
 * Land Manager System
 *
 * Handles loading and managing different lands/regions with their
 * background layers, parallax effects, and terrain.
 */

import { Container, Sprite, type Application } from 'pixi.js';
import { Z_LAYERS, setZIndex } from './rendering/layer-manager';
import { AssetManager } from './rendering/asset-manager';

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
 * Land configuration
 */
export interface LandConfig {
  id: string;
  name: string;
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
  private container: Container;
  private currentLand: LandConfig | null = null;
  private landLayers: Map<string, Sprite> = new Map();
  private scrollOffset: number = 0;
  private isActive: boolean = false;
  private resizeHandler: (() => void) | null = null;

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
    this.container = new Container();
    this.container.label = 'land-manager';
    app.stage.addChildAt(this.container, 0);
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
        scrollSpeed: 0, // No movement
        enableParallax: false, // No parallax
        layers: [
          // Just the basic background
          {
            id: 'background',
            assetPath: '/backgrounds/land1_steppe/static/steppe_background_2-1.png',
            zIndex: 0,
            parallaxSpeed: 0, // No movement
            x: 0,
            y: 0,
            width: 1920,
            height: 1080,
          },
        ],
      },
    };

    return landConfigs[landId] || null;
  }

  /**
   * Load a single land layer
   */
  private async loadLandLayer(layer: LandLayer): Promise<void> {
    try {
      console.log(`🌍 Land Manager: Loading layer ${layer.id}...`);

      // Load texture using the asset manager's loadAsset method
      const assetResult = await this.assetManager.loadAsset(layer.assetPath);
      if (!assetResult.success || !assetResult.asset) {
        console.error(
          `❌ Land Manager: Failed to load texture for ${layer.id}: ${assetResult.error}`,
        );
        return;
      }

      // Create sprite
      const sprite = new Sprite(assetResult.asset);
      sprite.x = layer.x;
      sprite.y = layer.y;
      sprite.width = layer.width;
      sprite.height = layer.height;

      // Set z-index
      const zIndex = Z_LAYERS.BACKGROUND + layer.zIndex;
      setZIndex(sprite, zIndex);

      // Add to container
      this.container.addChild(sprite);

      // Store reference
      this.landLayers.set(layer.id, sprite);

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

    this.currentLand = null;
    this.scrollOffset = 0;
  }

  /**
   * Update land rendering
   */
  update(_deltaTime: number, _scrollOffset: number = 0): void {
    // No movement, no parallax - just static background
    // Future: Update parallax layers here
    return;
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
    this.setupResizeHandler();
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
   * Handle window resize for responsive behavior
   */
  handleResize(): void {
    if (!this.currentLand) return;

    console.log(
      `🌍 Land Manager: Handling resize - ${this.app.screen.width}x${this.app.screen.height}`,
    );

    // Force app to resize
    this.app.resize();

    // Update all land layers to fit new screen size
    this.landLayers.forEach((sprite, layerId) => {
      const layer = this.currentLand?.layers.find((l) => l.id === layerId);
      if (layer) {
        // Scale layer to fit screen width while maintaining aspect ratio
        const scaleX = this.app.screen.width / layer.width;
        const scaleY = this.app.screen.height / layer.height;
        const scale = Math.max(scaleX, scaleY); // Cover mode

        sprite.scale.set(scale);
        sprite.x = (this.app.screen.width - layer.width * scale) / 2;
        sprite.y = (this.app.screen.height - layer.height * scale) / 2;

        console.log(
          `🌍 Land Manager: Updated layer ${layerId} - scale: ${scale.toFixed(2)}, pos: (${sprite.x.toFixed(0)}, ${sprite.y.toFixed(0)})`,
        );
      }
    });

    // Force a render to ensure the changes are visible
    this.app.render();

    console.log(
      `🌍 Land Manager: Resize completed - ${this.app.screen.width}x${this.app.screen.height}`,
    );
  }

  /**
   * Set up resize handler for responsiveness
   */
  private setupResizeHandler(): void {
    this.resizeHandler = () => {
      this.handleResize();
    };
    window.addEventListener('resize', this.resizeHandler);

    // Also listen for zoom changes (visual viewport API)
    if ('visualViewport' in window) {
      window.visualViewport?.addEventListener('resize', this.resizeHandler);
    }
  }

  /**
   * Clean up resize handler
   */
  private cleanupResizeHandler(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);

      // Also remove visual viewport listener
      if ('visualViewport' in window) {
        window.visualViewport?.removeEventListener('resize', this.resizeHandler);
      }

      this.resizeHandler = null;
    }
  }

  destroy(): void {
    this.cleanupResizeHandler();
    this.clearCurrentLand();
    this.container.destroy();
    console.log('🌍 Land Manager: Destroyed');
  }
}
