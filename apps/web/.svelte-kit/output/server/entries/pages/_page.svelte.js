import { s as subscribe } from "../../chunks/utils.js";
import { c as create_ssr_component, e as escape } from "../../chunks/ssr.js";
import { h as hudEnabled } from "../../chunks/flags.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $hudEnabled, $$unsubscribe_hudEnabled;
  $$unsubscribe_hudEnabled = subscribe(hudEnabled, (value) => $hudEnabled = value);
  let fps = 0;
  $$unsubscribe_hudEnabled();
  return `${$hudEnabled ? `<div style="position:absolute; top:8px; left:8px; padding:6px 10px; background:rgba(0,0,0,.55); color:#fff; font:12px/1.2 system-ui; border-radius:6px;">HUD on — FPS: ${escape(fps)}</div>` : ``} ${!$hudEnabled ? `<div style="position:absolute; top:8px; left:8px; padding:6px; background:#222; color:#fff; font:12px; border-radius:4px;" data-svelte-h="svelte-1awln0g">Add <code>?hud=1</code> to URL for FPS HUD</div>` : ``}`;
});
export {
  Page as default
};
