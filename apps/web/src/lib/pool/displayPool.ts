import { Sprite, Texture } from 'pixi.js';
import { createPool, type Pool } from './pool';

export function createSpritePool(tex?: Texture, initial = 0): Pool<Sprite> {
  return createPool<Sprite>(
    () => new Sprite(tex),
    (s) => {
      s.visible = false;
      s.alpha = 1;
      s.rotation = 0;
      s.scale.set(1);
      s.position.set(0, 0);
      s.parent?.removeChild(s);
    },
    initial
  );
}