import { c as create_ssr_component, o as onDestroy, a as add_attribute, e as escape } from "../../../../chunks/ssr.js";
import "../../../../chunks/index.js";
import { c as createSpritePool } from "../../../../chunks/displayPool.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let canvas;
  let app;
  let spawned = 0;
  let pool = createSpritePool(void 0, 50);
  onDestroy(() => app?.destroy(true, { children: true }));
  return `<div style="position:fixed; inset:0; background: #1a1a2e;"><canvas style="width:100%; height:100%; display:block;"${add_attribute("this", canvas, 0)}></canvas> <div style="position:absolute; right:8px; top:8px; background:rgba(0,0,0,.8); color:#fff; padding:12px; border-radius:8px; font:12px system-ui; min-width:200px;"><h3 style="margin:0 0 8px 0; font-size:14px;" data-svelte-h="svelte-163u3m3">Simple Dragon Test</h3> <div style="margin-bottom:8px;"><button style="margin:2px; padding:6px 12px; background:#4CAF50;" data-svelte-h="svelte-wwthx9">Spawn Dragon</button></div> <div style="margin-bottom:8px;"><button style="margin:2px; padding:6px 12px; background:#f44336;" data-svelte-h="svelte-1v1exuq">Recycle All</button></div> <div style="border-top:1px solid #444; padding-top:8px; margin-top:8px;"><div>Spawned: ${escape(spawned)}</div> <div>Pool: ${escape(pool.size())} total, ${escape(pool.inUse())} in use</div> <div style="font-size:10px; color:#888;">${escape("Loading texture...")}</div></div></div></div>`;
});
export {
  Page as default
};
