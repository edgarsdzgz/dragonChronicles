import { c as create_ssr_component, o as onDestroy, a as add_attribute, e as escape, b as each } from "../../../../chunks/ssr.js";
import "../../../../chunks/index.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let canvas;
  let debugInfo = [];
  onDestroy(() => {
  });
  return `<div style="position:fixed; inset:0; background: #0a0a0a;"><canvas style="width:100%; height:100%; display:block;"${add_attribute("this", canvas, 0)}></canvas> <div style="position:absolute; left:8px; top:8px; background:rgba(0,0,0,.95); color:#fff; padding:16px; border-radius:8px; font:11px 'Courier New', monospace; max-width:500px; max-height:80vh; overflow-y:auto;"><h3 style="margin:0 0 12px 0; font-size:14px; color:#4CAF50;" data-svelte-h="svelte-1ononop">🐛 Dragon Loading Debug</h3> <div style="margin-bottom:12px;"><strong data-svelte-h="svelte-1ftu2mm">Status:</strong> <span style="${"color: " + escape("#f44336", true) + ";"}">${escape("Loading...")}</span></div> <div style="border:1px solid #333; padding:8px; background:#111; border-radius:4px; max-height:400px; overflow-y:auto;"><div style="font-size:10px; color:#888; margin-bottom:6px;" data-svelte-h="svelte-60a1h0">Debug Log:</div> ${each(debugInfo, (message, i) => {
    return `<div style="${"margin:2px 0; color: " + escape(
      message.includes("ERROR") ? "#f44336" : message.includes("SUCCESS") ? "#4CAF50" : "#ccc",
      true
    ) + ";"}">${escape(message)} </div>`;
  })} ${debugInfo.length === 0 ? `<div style="color:#666; font-style:italic;" data-svelte-h="svelte-fpyjqs">Waiting for debug info...</div>` : ``}</div> <div style="margin-top:12px; font-size:10px; color:#666;" data-svelte-h="svelte-1o2hfrm">This page tests dragon texture loading step-by-step to identify issues.</div></div></div>`;
});
export {
  Page as default
};
