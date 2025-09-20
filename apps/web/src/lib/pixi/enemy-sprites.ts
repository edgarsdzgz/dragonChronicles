import { Sprite, type Renderer, type Container, Assets } from 'pixi.js';
import { TextureAtlas, type SpriteFrame } from './texture-atlas';

export type EnemyType = 'mantair-corsair' | 'swarm';
export type EnemyFrame = 'idle' | 'fly_1' | 'fly_2' | 'fly_3';

// Movement pattern configuration for different enemy types
export interface MovementPattern {
  frameSpeedMultipliers: Record<EnemyFrame, number>;
  smoothTransitions: boolean;
  transitionDuration: number; // ms for smooth speed changes
  frameDurationExtensions?: Record<EnemyFrame, number>; // Extra frames to hold this speed
  frameSpeedDecay?: Record<EnemyFrame, { startMultiplier: number; endMultiplier: number }>; // Gradual speed change during extensions
}

// Default movement pattern (smooth forward movement)
const defaultMovementPattern: MovementPattern = {
  frameSpeedMultipliers: {
    idle: 1.0,
    fly_1: 1.0,
    fly_2: 1.0,
    fly_3: 1.0
  },
  smoothTransitions: true,
  transitionDuration: 50 // 50ms transition
};

// Mantair Corsair specific pattern: glide, glide, glide, THRUST-and-glide
const mantairCorsairPattern: MovementPattern = {
  frameSpeedMultipliers: {
    idle: 0.5,    // Match glide end speed for continuity
    fly_1: 0.5,   // Match glide end speed for continuity
    fly_2: 0.5,   // Match glide end speed for continuity
    fly_3: 2.0    // 200% speed on the "explosive expansion" frame
  },
  smoothTransitions: true,
  transitionDuration: 75, // Slightly longer transition for dramatic effect
  frameDurationExtensions: {
    idle: 0,      // Normal duration
    fly_1: 0,     // Normal duration  
    fly_2: 0,     // Normal duration
    fly_3: 5      // Hold lunge for 5 extra frames (total 6 frames of thrust-and-glide)
  },
  frameSpeedDecay: {
    idle: { startMultiplier: 0.5, endMultiplier: 0.5 },       // No decay - maintain glide speed
    fly_1: { startMultiplier: 0.5, endMultiplier: 0.5 },      // No decay - maintain glide speed
    fly_2: { startMultiplier: 0.5, endMultiplier: 0.5 },      // No decay - maintain glide speed
    fly_3: { startMultiplier: 2.0, endMultiplier: 0.5 }       // Decay from 200% to 50% over 6 frames
  }
};

// Movement patterns for each enemy type
export const enemyMovementPatterns: Record<EnemyType, MovementPattern> = {
  'mantair-corsair': mantairCorsairPattern,
  'swarm': defaultMovementPattern // Swarm uses default smooth movement
};

// Enemy configurations
export const enemyConfigs: Record<EnemyType, {
  name: string;
  imagePath: string;
  frameWidth: number;
  frameHeight: number;
  rows: number;
  cols: number;
}> = {
  'mantair-corsair': {
    name: 'Mantair Corsair',
    imagePath: '/sprites/wsn_mantairCorsair_sprite.svg',
    frameWidth: 128, // Assuming similar to dragon
    frameHeight: 128,
    rows: 2,
    cols: 2
  },
  'swarm': {
    name: 'Swarm',
    imagePath: '/sprites/wsn_swarm_sprite.svg',
    frameWidth: 128, // Assuming similar to dragon
    frameHeight: 128,
    rows: 2,
    cols: 2
  }
};

// Frame mapping (same as dragon for now)
export const enemyFrameMap: Record<EnemyFrame, { row: number; col: number }> = {
  idle: { row: 0, col: 0 },    // Top-left frame
  fly_1: { row: 0, col: 1 },   // Top-right frame
  fly_2: { row: 1, col: 0 },   // Bottom-left frame
  fly_3: { row: 1, col: 1 },   // Bottom-right frame
};

// Create texture atlases for each enemy type
const enemyAtlases: Record<EnemyType, TextureAtlas> = {} as any;

for (const [enemyType, config] of Object.entries(enemyConfigs)) {
  enemyAtlases[enemyType as EnemyType] = new TextureAtlas({
    imagePath: config.imagePath,
    frameWidth: config.frameWidth,
    frameHeight: config.frameHeight,
    rows: config.rows,
    cols: config.cols
  });
}

export async function getEnemyFrame(enemyType: EnemyType, frameType: EnemyFrame): Promise<SpriteFrame | undefined> {
  try {
    const atlas = enemyAtlases[enemyType];
    if (!atlas) {
      console.error(`No atlas found for enemy type: ${enemyType}`);
      return undefined;
    }

    const { row, col } = enemyFrameMap[frameType];
    const frame = await atlas.getFrame(row, col);
    
    if (!frame) {
      console.error(`Failed to get enemy frame: ${enemyType} ${frameType} (${row}, ${col})`);
      return undefined;
    }
    
    return frame;
  } catch (error) {
    console.error(`Error loading enemy frame ${enemyType} ${frameType}:`, error);
    return undefined;
  }
}

export async function createEnemySprite(enemyType: EnemyType, frameType: EnemyFrame = 'idle'): Promise<Sprite> {
  const frame = await getEnemyFrame(enemyType, frameType);
  if (!frame) {
    throw new Error(`Invalid enemy frame: ${enemyType} ${frameType}`);
  }
  
  const sprite = new Sprite(frame.texture);
  sprite.anchor.set(0.5); // Center anchor for easier positioning
  return sprite;
}

// Enemy Animator class with movement pattern support
export class EnemyAnimator {
  private sprite: Sprite;
  private enemyType: EnemyType;
  private isPlaying = false;
  private currentFrameIndex = 0;
  private intervalId: number | null = null;
  private readonly frameSequence: EnemyFrame[] = ['idle', 'fly_1', 'fly_2', 'fly_3'];
  private frameDuration = 125; // 8 FPS = 125ms per frame (default)
  private renderer: Renderer | null = null;
  private stage: Container | null = null;
  
  // Movement pattern support
  private movementPattern: MovementPattern;
  private currentSpeedMultiplier = 1.0;
  private targetSpeedMultiplier = 1.0;
  private speedTransitionStart = 0;
  private onFrameChange?: (frame: EnemyFrame, speedMultiplier: number) => void;
  
  // Frame duration extension support
  private frameExtensionCounter = 0;
  private currentExtendedFrame: EnemyFrame | null = null;

  constructor(sprite: Sprite, enemyType: EnemyType, renderer?: Renderer, stage?: Container) {
    this.sprite = sprite;
    this.enemyType = enemyType;
    this.renderer = renderer || null;
    this.stage = stage || null;
    
    // Initialize movement pattern for this enemy type
    this.movementPattern = enemyMovementPatterns[enemyType];
    this.currentSpeedMultiplier = this.movementPattern.frameSpeedMultipliers['idle'];
    this.targetSpeedMultiplier = this.currentSpeedMultiplier;
  }
  
  /**
   * Sets a callback function that will be called when the animation frame changes
   * Provides the current frame and speed multiplier for movement synchronization
   */
  setFrameChangeCallback(callback: (frame: EnemyFrame, speedMultiplier: number) => void): void {
    this.onFrameChange = callback;
  }
  
  /**
   * Gets the current speed multiplier (smoothly transitioning if enabled)
   */
  getCurrentSpeedMultiplier(): number {
    // Handle speed decay during extended frames
    if (this.currentExtendedFrame && this.frameExtensionCounter > 0) {
      const decayConfig = this.movementPattern.frameSpeedDecay?.[this.currentExtendedFrame];
      if (decayConfig) {
        const extensionFrames = this.movementPattern.frameDurationExtensions?.[this.currentExtendedFrame] || 0;
        const totalExtensionFrames = extensionFrames + 1; // +1 for the original frame
        const framesRemaining = this.frameExtensionCounter + 1; // +1 for current frame
        const framesElapsed = totalExtensionFrames - framesRemaining;
        
        // Calculate decay progress (0 = start of extension, 1 = end of extension)
        const decayProgress = framesElapsed / totalExtensionFrames;
        
        // Interpolate between start and end multipliers
        const currentDecaySpeed = decayConfig.startMultiplier + 
                                 (decayConfig.endMultiplier - decayConfig.startMultiplier) * decayProgress;
        
        console.log(`${this.enemyType} decay: ${decayConfig.startMultiplier.toFixed(2)}x → ${decayConfig.endMultiplier.toFixed(2)}x (progress: ${(decayProgress * 100).toFixed(1)}%)`);
        return currentDecaySpeed;
      }
    }
    
    // Normal smooth transitions for non-extended frames
    if (!this.movementPattern.smoothTransitions) {
      return this.targetSpeedMultiplier;
    }
    
    const now = performance.now();
    const elapsed = now - this.speedTransitionStart;
    
    if (elapsed >= this.movementPattern.transitionDuration) {
      return this.targetSpeedMultiplier;
    }
    
    // Smooth interpolation between current and target speed
    const progress = elapsed / this.movementPattern.transitionDuration;
    const smoothProgress = this.easeInOutCubic(progress);
    
    return this.currentSpeedMultiplier + 
           (this.targetSpeedMultiplier - this.currentSpeedMultiplier) * smoothProgress;
  }
  
  /**
   * Smooth easing function for speed transitions
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  async start(): Promise<void> {
    if (this.isPlaying) return;
    
    this.isPlaying = true;
    
    // Set initial frame
    await this.updateFrame();
    
    // Start animation loop
    this.intervalId = window.setInterval(async () => {
      if (!this.isPlaying) return;
      
      // Handle frame duration extensions
      if (this.currentExtendedFrame && this.frameExtensionCounter > 0) {
        // Still in extended frame duration - maintain current frame but allow speed decay
        this.frameExtensionCounter--;
        
        // Notify movement system of speed change during decay
        if (this.onFrameChange) {
          const currentSpeed = this.getCurrentSpeedMultiplier();
          this.onFrameChange(this.currentExtendedFrame, currentSpeed);
        }
        
        console.log(`${this.enemyType} holding extended frame: ${this.currentExtendedFrame} (${this.frameExtensionCounter} remaining)`);
        return;
      }
      
      // Normal frame progression
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
      const frame = await getEnemyFrame(this.enemyType, frameType);
      
      if (frame) {
        // Always update texture
        this.sprite.texture = frame.texture;
        console.log(`${this.enemyType} frame updated to: ${frameType}`);
        
        // Update movement speed for this frame
        this.updateMovementSpeed(frameType);
        
        // Force a render using the provided renderer and stage
        if (this.renderer && this.stage) {
          this.renderer.render(this.stage);
        }
      } else {
        console.warn(`Failed to load ${this.enemyType} frame: ${frameType}`);
      }
    } catch (error) {
      console.error(`Error updating ${this.enemyType} frame:`, error);
    }
  }
  
  /**
   * Updates the movement speed multiplier when frame changes
   */
  private updateMovementSpeed(frameType: EnemyFrame): void {
    const newSpeedMultiplier = this.movementPattern.frameSpeedMultipliers[frameType];
    
    if (newSpeedMultiplier !== this.targetSpeedMultiplier) {
      // Start transition to new speed
      this.currentSpeedMultiplier = this.getCurrentSpeedMultiplier(); // Get current interpolated value
      this.targetSpeedMultiplier = newSpeedMultiplier;
      this.speedTransitionStart = performance.now();
      
      console.log(`${this.enemyType} speed transition: ${this.currentSpeedMultiplier.toFixed(2)}x → ${this.targetSpeedMultiplier}x`);
    }
    
    // Check for frame duration extension
    const extensionFrames = this.movementPattern.frameDurationExtensions?.[frameType] || 0;
    if (extensionFrames > 0) {
      this.currentExtendedFrame = frameType;
      this.frameExtensionCounter = extensionFrames;
      console.log(`${this.enemyType} extending frame ${frameType} for ${extensionFrames} extra frames`);
    } else {
      this.currentExtendedFrame = null;
      this.frameExtensionCounter = 0;
    }
    
    // Notify movement system of frame change
    if (this.onFrameChange) {
      this.onFrameChange(frameType, this.getCurrentSpeedMultiplier());
    }
  }

  getCurrentFrame(): EnemyFrame {
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
    
    this.frameDuration = 1000 / fps;
    console.log(`${this.enemyType} animation FPS changed to: ${fps} (${this.frameDuration}ms per frame)`);
    
    // If currently playing, restart with new timing
    if (this.isPlaying) {
      this.stop();
      this.start();
    }
  }

  getFPS(): number {
    return 1000 / this.frameDuration;
  }
  
  /**
   * Gets the movement pattern for this enemy type
   */
  getMovementPattern(): MovementPattern {
    return this.movementPattern;
  }
  
  /**
   * Forces the animator to a specific frame and optionally holds it
   * @param frameType - The frame to force to
   * @param hold - If true, holds the frame indefinitely; if false, resumes normal animation
   */
  async forceFrame(frameType: EnemyFrame, hold: boolean): Promise<void> {
    const targetFrameIndex = this.frameSequence.indexOf(frameType);
    if (targetFrameIndex === -1) {
      console.warn(`Invalid frame type: ${frameType}`);
      return;
    }
    
    if (hold) {
      // Force to specific frame and hold it
      this.currentFrameIndex = targetFrameIndex;
      this.currentExtendedFrame = frameType;
      this.frameExtensionCounter = 999; // Large number to effectively hold indefinitely
      await this.updateFrame();
      console.log(`${this.enemyType} forced to hold frame: ${frameType}`);
    } else {
      // Resume normal animation
      this.currentExtendedFrame = null;
      this.frameExtensionCounter = 0;
      console.log(`${this.enemyType} resumed normal animation from frame: ${frameType}`);
    }
  }

  destroy(): void {
    this.stop();
  }
}

export async function createAnimatedEnemySprite(
  enemyType: EnemyType, 
  renderer?: Renderer, 
  stage?: Container
): Promise<{ sprite: Sprite; animator: EnemyAnimator }> {
  try {
    // Start with the idle frame
    const sprite = await createEnemySprite(enemyType, 'idle');
    const animator = new EnemyAnimator(sprite, enemyType, renderer, stage);
    
    console.log(`Created animated ${enemyType} sprite successfully`);
    return { sprite, animator };
  } catch (error) {
    console.error(`Failed to create animated ${enemyType} sprite:`, error);
    throw error;
  }
}

export function getAllEnemyTypes(): EnemyType[] {
  return Object.keys(enemyConfigs) as EnemyType[];
}

export function getEnemyConfig(enemyType: EnemyType) {
  return enemyConfigs[enemyType];
}
