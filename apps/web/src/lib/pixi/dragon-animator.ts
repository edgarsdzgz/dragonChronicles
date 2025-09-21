import { Sprite, type Renderer, type Container } from 'pixi.js';
import { getDragonFrame, type DragonFrame } from './dragon-sprites';

export class DragonAnimator {
  private sprite: Sprite;
  private isPlaying = false;
  private currentFrameIndex = 0;
  private intervalId: number | null = null;
  private readonly frameSequence: DragonFrame[] = ['idle', 'fly_1', 'fly_2', 'fly_3'];
  private frameDuration = 125; // 8 FPS = 125ms per frame (default)
  private renderer: Renderer | null = null;
  private stage: Container | null = null;

  constructor(sprite: Sprite, renderer?: Renderer, stage?: Container) {
    this.sprite = sprite;
    this.renderer = renderer || null;
    this.stage = stage || null;
  }

  async start(): Promise<void> {
    if (this.isPlaying) return;

    this.isPlaying = true;

    // Set initial frame
    await this.updateFrame();

    // Start animation loop
    this.intervalId = window.setInterval(async () => {
      if (!this.isPlaying) return;

      this.currentFrameIndex = (this.currentFrameIndex + 1) % this.frameSequence.length;
      await this.updateFrame();
    }, this.frameDuration);
  }

  stop(): void {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  pause(): void {
    this.isPlaying = false;
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  resume(): void {
    if (!this.isPlaying) {
      this.start();
    }
  }

  private async updateFrame(): Promise<void> {
    try {
      const frameType = this.frameSequence[this.currentFrameIndex];
      const frame = await getDragonFrame(frameType);

      if (frame) {
        // Always update texture, even if it seems the same
        this.sprite.texture = frame.texture;
        console.log(`Dragon frame updated to: ${frameType}`, {
          textureValid: frame.texture?.source?.valid,
          textureWidth: frame.texture?.width,
          textureHeight: frame.texture?.height,
        });

        // Force a render using the provided renderer and stage
        if (this.renderer && this.stage) {
          this.renderer.render(this.stage);
        } else if (this.sprite.stage && 'renderer' in this.sprite.stage) {
          const stage = this.sprite.stage as { renderer?: Renderer };
          if (stage.renderer) {
            stage.renderer.render(stage);
          }
        }
      } else {
        console.warn(`Failed to load frame: ${frameType}`);
      }
    } catch (error) {
      console.error('Error updating dragon frame:', error);
    }
  }

  getCurrentFrame(): DragonFrame {
    return this.frameSequence[this.currentFrameIndex];
  }

  isAnimating(): boolean {
    return this.isPlaying;
  }

  setFPS(fps: number): void {
    if (fps <= 0) {
      console.warn('FPS must be greater than 0');
      return;
    }

    this.frameDuration = 1000 / fps; // Convert FPS to milliseconds per frame
    console.log(`Dragon animation FPS changed to: ${fps} (${this.frameDuration}ms per frame)`);

    // If currently playing, restart with new timing
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  getFPS(): number {
    return 1000 / this.frameDuration;
  }

  destroy(): void {
    this.stop();
  }
}

export async function createAnimatedDragonSprite(
  renderer?: Renderer,
  stage?: Container,
): Promise<{ sprite: Sprite; animator: DragonAnimator }> {
  try {
    // Start with the idle frame
    const frame = await getDragonFrame('idle');
    if (!frame) {
      throw new Error('Failed to load initial dragon frame');
    }

    const sprite = new Sprite(frame.texture);
    sprite.anchor.set(0.5); // Center anchor for easier positioning

    const animator = new DragonAnimator(sprite, renderer, stage);

    console.log('Created animated dragon sprite successfully');
    return { sprite, animator };
  } catch (error) {
    console.error('Failed to create animated dragon sprite:', error);
    throw error;
  }
}
