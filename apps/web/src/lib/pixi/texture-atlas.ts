import { Texture, Rectangle, Assets } from 'pixi.js';

export interface SpriteFrame {
  texture: Texture;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpriteSheetConfig {
  imagePath: string;
  frameWidth: number;
  frameHeight: number;
  rows: number;
  cols: number;
  spacing?: number;
}

export class TextureAtlas {
  private baseTexture: Texture | null = null;
  private frames: Map<string, SpriteFrame> = new Map();
  private config: SpriteSheetConfig;
  private initialized = false;

  constructor(config: SpriteSheetConfig) {
    this.config = config;
  }

  private async initialize(): Promise<void> {
    if (this.initialized || typeof window === 'undefined') return;

    try {
      console.log(`Loading texture using Assets API: ${this.config.imagePath}`);

      // Use PixiJS v8 Assets API for proper texture loading
      this.baseTexture = await Assets.load(this.config.imagePath);

      if (!this.baseTexture) {
        throw new Error(`Failed to load texture: ${this.config.imagePath}`);
      }

      console.log(`Texture loaded successfully: ${this.config.imagePath}`, {
        width: this.baseTexture.width,
        height: this.baseTexture.height,
        valid: this.baseTexture.valid,
        source: this.baseTexture.source,
        hasSource: !!this.baseTexture.source,
      });

      this.generateFrames(this.config);
      this.initialized = true;

      console.log(
        `TextureAtlas initialized: ${this.config.imagePath} (${this.frames.size} frames)`,
      );

      // Log all generated frames for debugging
      console.log('Generated frames:', Array.from(this.frames.keys()));
    } catch (error) {
      console.error('Failed to initialize TextureAtlas:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        imagePath: this.config.imagePath,
      });
      throw error;
    }
  }

  private generateFrames(config: SpriteSheetConfig): void {
    if (!this.baseTexture) return;

    const { frameWidth, frameHeight, rows, cols, spacing = 0 } = config;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * (frameWidth + spacing);
        const y = row * (frameHeight + spacing);

        const frameKey = `${row}_${col}`;
        const frame: SpriteFrame = {
          texture: new Texture({
            source: this.baseTexture.source,
            frame: new Rectangle(x, y, frameWidth, frameHeight),
          }),
          x,
          y,
          width: frameWidth,
          height: frameHeight,
        };

        this.frames.set(frameKey, frame);
      }
    }
  }

  async getFrame(row: number, col: number): Promise<SpriteFrame | undefined> {
    try {
      await this.initialize();
      const frameKey = `${row}_${col}`;
      const frame = this.frames.get(frameKey);

      if (!frame) {
        console.error(`Frame not found: ${frameKey}`, {
          availableFrames: Array.from(this.frames.keys()),
          requestedRow: row,
          requestedCol: col,
          totalFrames: this.frames.size,
        });
      }

      return frame;
    } catch (error) {
      console.error(`Error getting frame (${row}, ${col}):`, error);
      return undefined;
    }
  }

  async getFrameByIndex(index: number): Promise<SpriteFrame | undefined> {
    await this.initialize();
    const config = this.config;
    const row = Math.floor(index / config.cols);
    const col = index % config.cols;
    return this.getFrame(row, col);
  }

  async getAllFrames(): Promise<SpriteFrame[]> {
    await this.initialize();
    return Array.from(this.frames.values());
  }

  async getFrameCount(): Promise<number> {
    await this.initialize();
    return this.frames.size;
  }
}

// Dragon-specific atlas instance
export const dragonAtlas = new TextureAtlas({
  imagePath: '/sprites/dragon_fly_128_sheet.svg',
  frameWidth: 128,
  frameHeight: 128,
  rows: 2,
  cols: 2,
});
