import { c as create_ssr_component, o as onDestroy, a as add_attribute, e as escape } from "../../../../chunks/ssr.js";
import "../../../../chunks/index.js";
import { c as createSpritePool } from "../../../../chunks/displayPool.js";
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
