import { Assets, Texture, Application } from 'pixi.js';

interface AssetDefinition {
  id: string;
  path: string;
  type: 'texture' | 'atlas' | 'sound';
  required: boolean;
}

interface AssetResult {
  success: boolean;
  asset?: Texture;
  error?: string;
}

export class AssetManager {
  private app: Application;
  private loadedAssets: Map<string, Texture> = new Map();
  private fallbackTexture?: Texture;

  private assetDefinitions: AssetDefinition[] = [
    // Background assets - only existing files
    {
      id: 'steppe-mountains',
      path: '/backgrounds/land1_steppe/parallax/lonelyMountain-clouds-2.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'steppe-clouds',
      path: '/backgrounds/land1_steppe/parallax/steppe_clouds-1.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'steppe-ground',
      path: '/backgrounds/land1_steppe/foreground/grasslandLayer_steppe.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'steppe-hills',
      path: '/backgrounds/land1_steppe/parallax/steppe_hills-1.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'steppe-background',
      path: '/backgrounds/land1_steppe/static/steppe_background_grassless.png',
      type: 'texture',
      required: false,
    },

    // Projectile assets - using canvas-generated textures
    { id: 'projectile-fireball', path: 'canvas-generated', type: 'texture', required: false },
    { id: 'projectile-arrow', path: 'canvas-generated', type: 'texture', required: false },

    // Dragon assets
    { id: 'dragon-fly', path: '/sprites/dragon_fly_128_sheet.png', type: 'atlas', required: true },

    // Draconia Enemy assets - using your existing sprites as placeholders
    {
      id: 'enemy-wind-taken-nomad',
      path: '/sprites/wsn_mantairCorsair_sprite.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'enemy-bola-whisper',
      path: '/sprites/wsn_swarm_sprite.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'enemy-wind-taken-harrier',
      path: '/sprites/wsn_mantairCorsair_attack.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'enemy-heartwood-abomination',
      path: '/sprites/wsn_swarmAttack_sprite.png',
      type: 'texture',
      required: false,
    },

    // Splash screen assets
    {
      id: 'splash-screen',
      path: '/ui/buttons/menu/splash/draconia_splash_5.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'draconia-logo',
      path: '/ui/buttons/menu/logo/draconia_logo_v2.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'draconia-silhouette',
      path: '/ui/buttons/menu/decorations/draconia_sillouette_v2-1.png',
      type: 'texture',
      required: false,
    },

    // Journey control button assets (128x128 native, scaled to 80x80 in UI)
    {
      id: 'journey-backward-neutral',
      path: '/ui/buttons/action/backwardJourney_neutral.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-backward-hover',
      path: '/ui/buttons/action/backwardJourney_hover.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-backward-selected',
      path: '/ui/buttons/action/backwardJourney_selected.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-pause-neutral',
      path: '/ui/buttons/action/pauseJourney_neutral.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-pause-hover',
      path: '/ui/buttons/action/pauseJourney_hover.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-pause-selected',
      path: '/ui/buttons/action/pauseJourney_selected.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-forward-neutral',
      path: '/ui/buttons/action/forwardJourney_neutral.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-forward-hover',
      path: '/ui/buttons/action/forwardJourney_hover.png',
      type: 'texture',
      required: false,
    },
    {
      id: 'journey-forward-selected',
      path: '/ui/buttons/action/forwardJourney_selected.png',
      type: 'texture',
      required: false,
    },
  ];

  constructor(app: Application) {
    this.app = app;
    this.createFallbackTexture();
  }

  /**
   * Initialize the asset manager
   */
  async initialize(): Promise<boolean> {
    try {
      const success = await this.loadAllAssets();
      if (!success) {
        console.warn('⚠️ Asset Manager: Some assets failed to load');
      }
      return success;
    } catch (error) {
      console.error('❌ Asset Manager: Failed to initialize:', error);
      return false;
    }
  }

  private createFallbackTexture(): void {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d')!;

    // Create a simple fallback pattern
    ctx.fillStyle = '#7e2453';
    ctx.fillRect(0, 0, 64, 64);
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('?', 32, 36);

    this.fallbackTexture = Texture.from(canvas);
  }

  private createCanvasTexture(assetId: string): Texture {
    switch (assetId) {
      case 'projectile-fireball':
        return this.createFireballTexture();
      case 'projectile-arrow':
        return this.createArrowTexture();
      default:
        console.warn(`🎨 Asset Manager: Unknown canvas texture: ${assetId}, using fallback`);
        return this.fallbackTexture || this.createFallbackTexture();
    }
  }

  private createFireballTexture(): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Create fireball gradient
    const gradient = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradient.addColorStop(0, '#FFD700');
    gradient.addColorStop(0.5, '#FF4500');
    gradient.addColorStop(1, '#8B0000');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(16, 16, 16, 0, Math.PI * 2);
    ctx.fill();

    return Texture.from(canvas);
  }

  private createArrowTexture(): Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 16;
    canvas.height = 32;
    const ctx = canvas.getContext('2d')!;

    // Create arrow shape
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(4, 24);
    ctx.lineTo(12, 24);
    ctx.closePath();
    ctx.fill();

    return Texture.from(canvas);
  }

  async loadAllAssets(): Promise<boolean> {
    console.log(`🎨 Asset Manager: Loading ${this.assetDefinitions.length} assets...`);

    const loadPromises = this.assetDefinitions.map((assetDef) =>
      this.loadAssetFromDefinition(assetDef),
    );

    const results = await Promise.allSettled(loadPromises);

    let successCount = 0;

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.success) {
        successCount++;
        const assetDef = this.assetDefinitions[index];
        console.log(`✅ Asset Manager: Loaded ${assetDef.id}`);
      } else {
        const assetDef = this.assetDefinitions[index];
        console.warn(
          `❌ Asset Manager: Failed to load ${assetDef.id}: ${result.status === 'rejected' ? result.reason : result.value.error}`,
        );
      }
    });

    console.log(`🎨 Asset Manager: Loaded ${successCount}/${this.assetDefinitions.length} assets`);
    return successCount > 0;
  }

  private async loadAssetFromDefinition(assetDef: AssetDefinition): Promise<AssetResult> {
    try {
      // Handle canvas-generated textures (only for projectiles)
      if (assetDef.path === 'canvas-generated' && assetDef.id.startsWith('projectile-')) {
        const texture = this.createCanvasTexture(assetDef.id);
        return { success: true, asset: texture };
      }

      // Try to load the main asset
      const texture = await Assets.load(assetDef.path);

      if (texture) {
        this.loadedAssets.set(assetDef.id, texture);
        return { success: true, asset: texture };
      } else {
        throw new Error('Texture is null or undefined');
      }
    } catch (error) {
      console.warn(`⚠️ Asset Manager: Failed to load ${assetDef.id}:`, error);

      if (assetDef.required) {
        return { success: false, error: `Required asset ${assetDef.id} failed to load` };
      } else {
        // Use fallback for non-required assets
        const fallback = this.fallbackTexture || this.createFallbackTexture();
        this.loadedAssets.set(assetDef.id, fallback);
        return { success: true, asset: fallback };
      }
    }
  }

  async loadAsset(assetId: string): Promise<AssetResult> {
    // Check if asset is already loaded
    if (this.loadedAssets.has(assetId)) {
      return { success: true, asset: this.loadedAssets.get(assetId) };
    }

    // Find asset definition
    const assetDef = this.assetDefinitions.find((def) => def.id === assetId);

    if (!assetDef) {
      console.warn(`⚠️ Asset Manager: Asset definition not found for ${assetId}`);
      return { success: false, error: `Asset ${assetId} not found in definitions` };
    }

    // Load the asset
    const result = await this.loadAssetFromDefinition(assetDef);

    if (result.success && result.asset) {
      this.loadedAssets.set(assetId, result.asset);
    }

    return result;
  }

  getTexture(assetId: string): Texture | undefined {
    return this.loadedAssets.get(assetId);
  }

  hasAsset(assetId: string): boolean {
    return this.loadedAssets.has(assetId);
  }

  getLoadedAssets(): string[] {
    return Array.from(this.loadedAssets.keys());
  }

  destroy(): void {
    this.loadedAssets.forEach((texture) => {
      if (texture && !texture.destroyed) {
        texture.destroy();
      }
    });
    this.loadedAssets.clear();

    if (this.fallbackTexture && !this.fallbackTexture.destroyed) {
      this.fallbackTexture.destroy();
    }
  }
}
