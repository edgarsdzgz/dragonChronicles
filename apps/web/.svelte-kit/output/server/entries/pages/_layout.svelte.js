import { s as subscribe } from "../../chunks/utils.js";
import { c as create_ssr_component, o as onDestroy, a as add_attribute } from "../../chunks/ssr.js";
import "../../chunks/index.js";
import { h as hudEnabled } from "../../chunks/store.js";
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $hudEnabled, $$unsubscribe_hudEnabled;
  $$unsubscribe_hudEnabled = subscribe(hudEnabled, (value) => $hudEnabled = value);
  let canvas;
  let handle = null;
  onDestroy(() => handle?.destroy());
  $$unsubscribe_hudEnabled();
  return `<div style="position:fixed; inset:0; overflow:hidden;"><canvas style="width:100%; height:100%; display:block;"${add_attribute("this", canvas, 0)}></canvas> ${$hudEnabled ? `${slots.hud ? slots.hud({}) : ``}` : ``}</div>  ${``}  ${``}  ${``} ${slots.default ? slots.default({}) : ``}`;
});
export {
  Layout as default
};
