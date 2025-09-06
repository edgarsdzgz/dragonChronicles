import { c as create_ssr_component, o as onDestroy, a as add_attribute, e as escape } from "../../../../chunks/ssr.js";
import "../../../../chunks/logger.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rate = 100;
  let seconds = 10;
  let produced = 0, dropped = 0;
  function stop() {
    return;
  }
  onDestroy(stop);
  return `<div style="padding:12px; font:14px system-ui;"><h3 data-svelte-h="svelte-1uzt7vn">Logging Perf Lab</h3> <div style="margin-bottom: 16px;"><label>Rate (logs/sec) <input type="number" min="10" max="10000"${add_attribute("value", rate, 0)}></label> <label>Duration (s) <input type="number" min="1" max="30"${add_attribute("value", seconds, 0)}></label></div> <div style="margin-bottom: 16px;"><button ${""}>Start</button> <button ${"disabled"}>Stop</button> <button data-svelte-h="svelte-ghayiv">Export NDJSON</button></div> <div>Produced: ${escape(produced)} Dropped: ${escape(dropped)} Running: ${escape("no")}</div></div>`;
});
export {
  Page as default
};
