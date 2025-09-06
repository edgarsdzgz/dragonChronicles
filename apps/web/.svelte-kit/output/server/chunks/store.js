import { d as derived, w as writable } from "./index2.js";
const appFlags = writable({
  hud: false,
  devMenu: false,
  logConsole: false,
  useLegacyBgSim: false,
  forceMode: "auto"
});
const hudEnabled = derived(appFlags, ($flags) => $flags.hud);
derived(appFlags, ($flags) => $flags.devMenu);
derived(
  appFlags,
  ($flags) => $flags.logConsole
);
derived(
  appFlags,
  ($flags) => $flags.useLegacyBgSim
);
derived(appFlags, ($flags) => $flags.forceMode);
export {
  appFlags as a,
  hudEnabled as h
};
