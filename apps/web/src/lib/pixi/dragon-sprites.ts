import { Sprite, type Renderer, type Container } from 'pixi.js';
import { dragonAtlas, type SpriteFrame } from './texture-atlas';
import { createSpritePool } from '../pool/displayPool';
import { DragonAnimator } from './dragon-animator';

export type DragonFrame = 'idle' | 'fly_1' | 'fly_2' | 'fly_3';

export const dragonFrameMap: Record<DragonFrame, { row: number; col: number }> = {
  idle: { row: 0, col: 0 }, // Top-left frame
  fly_1: { row: 0, col: 1 }, // Top-right frame
  fly_2: { row: 1, col: 0 }, // Bottom-left frame
  fly_3: { row: 1, col: 1 }, // Bottom-right frame
};

export async function getDragonFrame(frameType: DragonFrame): Promise<SpriteFrame | undefined> {
  try {
    const { row, col } = dragonFrameMap[frameType];
    const frame = await dragonAtlas.getFrame(row, col);

    if (!frame) {
      console.error(`Failed to get dragon frame: ${frameType} (${row}, ${col})`);
      return undefined;
    }

    return frame;
  } catch (error) {
    console.error(`Error loading dragon frame ${frameType}:`, error);
    return undefined;
  }
}

export async function createDragonSpritePool(frameType: DragonFrame = 'idle', initial = 0) {
  const frame = await getDragonFrame(frameType);
  if (!frame) {
    throw new Error(`Invalid dragon frame type: ${frameType}`);
  }

  return createSpritePool(frame.texture, initial);
}

export async function createDragonSprite(frameType: DragonFrame = 'idle'): Promise<Sprite> {
  const frame = await getDragonFrame(frameType);
  if (!frame) {
    throw new Error(`Invalid dragon frame type: ${frameType}`);
  }

  const sprite = new Sprite(frame.texture);
  sprite.anchor.set(0.5); // Center the anchor for easier positioning
  return sprite;
}

export async function createAnimatedDragonSprite(
  renderer?: Renderer,
  stage?: Container,
): Promise<{ sprite: Sprite; animator: DragonAnimator }> {
  const sprite = await createDragonSprite('idle');
  const animator = new DragonAnimator(sprite, renderer, stage);
  return { sprite, animator };
}

export function getAllDragonFrames(): DragonFrame[] {
  return ['idle', 'fly_1', 'fly_2', 'fly_3'];
}
