import { D as slot, B as pop, z as push } from "../../chunks/index2.js";
import { r as readable } from "../../chunks/index.js";
import Dexie from "dexie";
import "break_eternity.js";
import "clsx";
class GameDB extends Dexie {
  saves;
  constructor() {
    super("dragon-idler");
    this.version(1).stores({
      saves: ""
      // simple key-value where key is string (primary key is custom)
    });
  }
}
new GameDB();
readable(null, (set) => {
  {
    return () => {
    };
  }
});
function _layout($$payload, $$props) {
  push();
  $$payload.out.push(`<main class="svelte-3giqtq"><!---->`);
  slot($$payload, $$props, "default", {});
  $$payload.out.push(`<!----> <footer class="svelte-3giqtq">v1 · saves to your browser</footer></main>`);
  pop();
}
export {
  _layout as default
};
