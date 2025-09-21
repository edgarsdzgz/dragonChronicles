import { S as Sprite } from "./index.js";
function createPool(factory, reset = () => {
}, initial = 0) {
  const free = [];
  let created = 0;
  for (let i = 0; i < initial; i++) {
    const obj = factory();
    created++;
    free.push(obj);
  }
  return {
    acquire() {
      const obj = free.pop();
      if (obj) {
        return obj;
      }
      created++;
      return factory();
    },
    release(obj) {
      reset(obj);
      free.push(obj);
    },
    size() {
      return created;
    },
    inUse() {
      return created - free.length;
    }
  };
}
function createSpritePool(tex, initial = 0) {
  return createPool(
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
export {
  createSpritePool as c
};
