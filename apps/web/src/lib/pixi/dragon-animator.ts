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

  // Wing flap crest hold: variable hold (2-5 frames) at fly_3
  private readonly crestFrame = 'fly_3'; // The crest of the wing flap
  private crestHoldCounter = 0; // Current hold count
  private crestHoldDuration = 0; // Random duration (2-5) for this loop

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

      // Check if we're on the crest frame and should hold it
      const currentFrame = this.frameSequence[this.currentFrameIndex];
      if (currentFrame === this.crestFrame) {
        // If we haven't set a hold duration yet, pick a random one (2-5 frames)
        if (this.crestHoldDuration === 0) {
          this.crestHoldDuration = Math.floor(Math.random() * 4) + 2; // Random 2-5
        }

        // Hold the frame
        if (this.crestHoldCounter < this.crestHoldDuration) {
          this.crestHoldCounter++;
          // Stay on current frame (don't advance)
          await this.updateFrame();
          return;
        }

        // Hold complete, reset counters and advance to next frame
        this.crestHoldCounter = 0;
        this.crestHoldDuration = 0;
      }

      // Advance to next frame
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
      // Simple validation - frameSequence should always be initialized
      if (this.currentFrameIndex < 0 || this.currentFrameIndex >= this.frameSequence.length) {
        this.currentFrameIndex = 0; // Reset to safe value
      }

      const frameType = this.frameSequence[this.currentFrameIndex];

      const frame = await getDragonFrame(frameType);

      if (frame && frame.texture) {
        this.sprite.texture = frame.texture;

        // Force a render if we have renderer and stage
        if (this.renderer && this.stage) {
          this.renderer.render(this.stage);
        }
      } else {
        console.warn(`Failed to load frame: ${frameType}`);
      }
    } catch (error) {
      console.error('Error updating dragon frame:', error);
      // Reset to safe state on error
      this.currentFrameIndex = 0;
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

    return { sprite, animator };
  } catch (error) {
    console.error('Failed to create animated dragon sprite:', error);
    throw error;
  }
}
