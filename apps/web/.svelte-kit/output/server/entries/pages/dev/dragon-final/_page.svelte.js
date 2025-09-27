import { c as create_ssr_component, o as onDestroy, e as escape } from "../../../../chunks/ssr.js";
import "../../../../chunks/index.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let spawned = 0;
  onDestroy(() => {
    console.log("Page destroyed");
  });
  return `<div style="position:absolute; top:0; left:0; z-index:1000; pointer-events:none;"><div style="position:fixed; right:8px; top:8px; background:rgba(0,0,0,.8); color:#fff; padding:12px; border-radius:8px; font:12px system-ui; min-width:200px; pointer-events:auto;"><h3 style="margin:0 0 8px 0; font-size:14px;" data-svelte-h="svelte-1j4fuxx">Final Dragon Test</h3> <div style="margin-bottom:8px;"><button style="margin:2px; padding:6px 12px; background:#4CAF50;" data-svelte-h="svelte-a1h3bn">Spawn Dragon</button></div> <div style="margin-bottom:8px;"><button style="margin:2px; padding:6px 12px; background:#f44336;" data-svelte-h="svelte-dfc7i4">Recycle All</button></div> <div style="border-top:1px solid #444; padding-top:8px; margin-top:8px;"><div>Spawned: ${escape(spawned)}</div> <div style="font-size:10px; color:#888;">${escape("Loading texture...")}</div> ${``} <div style="font-size:10px; color:#888;">App: ${escape("Not found")}</div></div></div></div>`;
});
export {
  Page as default
};
