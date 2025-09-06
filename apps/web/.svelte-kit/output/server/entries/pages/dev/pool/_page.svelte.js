import { c as create_ssr_component, o as onDestroy, a as add_attribute, e as escape } from "../../../../chunks/ssr.js";
import { S as Sprite } from "../../../../chunks/index.js";
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
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let canvas;
  let app;
  let spawned = 0;
  const pool = createSpritePool(void 0, 200);
  onDestroy(() => app?.destroy(true, { children: true }));
  return `<div style="position:fixed; inset:0;"><canvas style="width:100%; height:100%; display:block;"${add_attribute("this", canvas, 0)}></canvas> <div style="position:absolute; right:8px; top:8px; background:rgba(0,0,0,.6); color:#fff; padding:8px; border-radius:6px; font:12px system-ui;"><button style="margin-right:6px;" data-svelte-h="svelte-1qhjeqz">Spawn 100</button> <button style="margin-right:6px;" data-svelte-h="svelte-5ycajb">Spawn 1000</button> <button data-svelte-h="svelte-1vyv9z2">Recycle All</button> <div>Spawned: ${escape(spawned)}</div> <div>Pool: ${escape(pool.size())} total, ${escape(pool.inUse())} in use</div></div></div>`;
});
export {
  Page as default
};
