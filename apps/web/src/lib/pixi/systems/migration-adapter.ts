import { Application } from 'pixi.js';
import { AssetManager } from './rendering/asset-manager';
import { BackgroundRenderer } from './rendering/background-renderer';
import { HealthBarManager } from './health-bar-manager';
import { FloatingDamageManager } from './floating-damage';
import { LayerManager } from './rendering/layer-manager';
import { ResponsiveManager } from './responsive-manager';

export interface MigrationAdapterConfig {
  enableNewSystems: boolean;
  enableBackgroundRenderer: boolean;
  enableHealthBarManager: boolean;
  enableFloatingDamage: boolean;
  enableLayerManager: boolean;
  debugMode: boolean;
}

export class MigrationAdapter {
  private app: Application;
  private assetManager: AssetManager;
  private config: MigrationAdapterConfig;

  // System components
  private responsiveManager: ResponsiveManager;
  private backgroundRenderer?: BackgroundRenderer;
  private healthBarManager?: HealthBarManager;
  private floatingDamageManager?: FloatingDamageManager;
  private layerManager?: LayerManager;

  constructor(app: Application, config: MigrationAdapterConfig) {
    this.app = app;
    this.assetManager = new AssetManager(app);
    this.config = config;

    // Initialize ResponsiveManager first (required by other systems)
    this.responsiveManager = new ResponsiveManager(this.app);
    this.responsiveManager.initialize();
    console.log('🔧 Migration Adapter: ResponsiveManager initialized');

    // Initialize synchronous systems immediately
    this.initializeSyncSystems();

    // Initialize async systems (asset manager)
    this.initializeAsyncSystems();
  }

  /**
   * Initialize systems that don't require async operations
   * These are available immediately after construction
   */
  private initializeSyncSystems(): void {
    try {
      // Initialize health bar manager if enabled
      if (this.config.enableHealthBarManager) {
        this.healthBarManager = new HealthBarManager(this.app, this.responsiveManager, this.app.stage);
        console.log('🔧 Migration Adapter: HealthBarManager initialized');
      }

      // Initialize floating damage manager if enabled
      if (this.config.enableFloatingDamage) {
        this.floatingDamageManager = new FloatingDamageManager(this.app);
        console.log('🔧 Migration Adapter: FloatingDamageManager initialized');
      }

      // Initialize layer manager if enabled
      if (this.config.enableLayerManager) {
        this.layerManager = new LayerManager();
        console.log('🔧 Migration Adapter: LayerManager initialized');
      }
    } catch (error) {
      console.error('❌ Migration Adapter: Failed to initialize sync systems:', error);
    }
  }

  /**
   * Initialize systems that require async operations
   * Background renderer needs asset manager to be loaded first
   */
  private async initializeAsyncSystems(): Promise<void> {
    try {
      // Initialize asset manager
      await this.assetManager.loadAllAssets();

      // Initialize background renderer if enabled (needs asset manager)
      if (this.config.enableBackgroundRenderer) {
        this.backgroundRenderer = new BackgroundRenderer(this.app, this.assetManager);
        console.log('🔧 Migration Adapter: BackgroundRenderer initialized');
      }
    } catch (error) {
      console.error('❌ Migration Adapter: Failed to initialize async systems:', error);
    }
  }

  update(deltaTime: number, currentTime: number, scrollOffset: number): void {
    // Update background renderer
    if (this.backgroundRenderer) {
      this.backgroundRenderer.update(deltaTime, scrollOffset);
    }

    // Update health bar manager
    if (this.healthBarManager) {
      this.healthBarManager.update(deltaTime);
    }

    // Update floating damage manager
    if (this.floatingDamageManager) {
      this.floatingDamageManager.update(deltaTime);
    }

    // Update layer manager
    if (this.layerManager) {
      this.layerManager.update(deltaTime);
    }
  }

  getAssetManager(): AssetManager {
    return this.assetManager;
  }

  getBackgroundRenderer(): BackgroundRenderer | undefined {
    return this.backgroundRenderer;
  }

  getHealthBarManager(): HealthBarManager | undefined {
    return this.healthBarManager;
  }

  getFloatingDamageManager(): FloatingDamageManager | undefined {
    return this.floatingDamageManager;
  }

  getLayerManager(): LayerManager | undefined {
    return this.layerManager;
  }

  getResponsiveManager(): ResponsiveManager {
    return this.responsiveManager;
  }

  destroy(): void {
    if (this.backgroundRenderer) {
      this.backgroundRenderer.destroy();
    }
    if (this.healthBarManager) {
      this.healthBarManager.destroy();
    }
    if (this.floatingDamageManager) {
      this.floatingDamageManager.destroy();
    }
    if (this.layerManager) {
      this.layerManager.destroy();
    }
    if (this.assetManager) {
      this.assetManager.destroy();
    }
  }
}
