import { Container, Sprite, Texture, Application } from 'pixi.js';
import { AssetManager } from './asset-manager';
import { Z_LAYERS, setZIndex } from './layer-manager';

interface BackgroundLayer {
  id: string;
  sprite: Sprite;
  texture: Texture;
  scrollSpeed: number;
  parallaxOffset: number;
  initialX: number;
}

interface BackgroundConfig {
  layers: {
    id: string;
    assetPath: string;
    scrollSpeed: number;
    zIndex: number;
    x: number;
    y: number;
  }[];
}

export class BackgroundRenderer {
  private app: Application;
  private assetManager: AssetManager;
  private container: Container;
  private layers: Map<string, BackgroundLayer> = new Map();
  private scrollOffset: number = 0;
  private isActive: boolean = false;

  constructor(app: Application, assetManager: AssetManager) {
    this.app = app;
    this.assetManager = assetManager;
    this.container = new Container();
    this.container.label = 'background-renderer';
    setZIndex(this.container, Z_LAYERS.BACKGROUND);
    this.app.stage.addChildAt(this.container, 0);
  }

  async loadBackground(config: BackgroundConfig): Promise<boolean> {
    try {
      this.clearLayers();

      for (const layerConfig of config.layers) {
        await this.createBackgroundLayer(layerConfig);
      }

      this.isActive = true;
      return true;
    } catch (error) {
      console.error('❌ Background Renderer: Failed to load background:', error);
      return false;
    }
  }

  private async createBackgroundLayer(layerConfig: {
    id: string;
    assetPath: string;
    scrollSpeed: number;
    zIndex: number;
    x: number;
    y: number;
  }): Promise<void> {
    try {
      const texture = this.assetManager.getTexture(layerConfig.assetPath);
      if (!texture) {
        console.warn(
          `⚠️ Background Renderer: Texture not found for ${layerConfig.assetPath}, using fallback`,
        );
        return;
      }

      const sprite = new Sprite(texture);
      sprite.x = layerConfig.x;
      sprite.y = layerConfig.y;
      sprite.anchor.set(0, 0);

      // Set z-index
      setZIndex(sprite, layerConfig.zIndex);

      this.container.addChild(sprite);

      const layer: BackgroundLayer = {
        id: layerConfig.id,
        sprite,
        texture,
        scrollSpeed: layerConfig.scrollSpeed,
        parallaxOffset: 0,
        initialX: layerConfig.x,
      };

      this.layers.set(layerConfig.id, layer);
    } catch (error) {
      console.error(`❌ Background Renderer: Failed to create layer ${layerConfig.id}:`, error);
    }
  }

  update(deltaTime: number, scrollOffset: number): void {
    if (!this.isActive) return;

    this.scrollOffset = scrollOffset;

    // Update each layer's position based on scroll speed
    this.layers.forEach((layer) => {
      const parallaxOffset = scrollOffset * layer.scrollSpeed;
      layer.sprite.x = layer.initialX + parallaxOffset;
    });
  }

  setScrollOffset(offset: number): void {
    this.scrollOffset = offset;
    this.update(0, offset);
  }

  getScrollOffset(): number {
    return this.scrollOffset;
  }

  getLayer(id: string): BackgroundLayer | undefined {
    return this.layers.get(id);
  }

  getAllLayers(): BackgroundLayer[] {
    return Array.from(this.layers.values());
  }

  clearLayers(): void {
    this.layers.forEach((layer) => {
      if (layer.sprite && layer.sprite.parent) {
        layer.sprite.parent.removeChild(layer.sprite);
      }
    });
    this.layers.clear();
  }

  destroy(): void {
    this.clearLayers();
    if (this.container && this.container.parent) {
      this.container.parent.removeChild(this.container);
    }
    this.container.destroy();
  }
}
