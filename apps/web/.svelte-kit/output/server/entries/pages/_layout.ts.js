import { a as appFlags } from "../../chunks/store.js";
const DEFAULT_FLAGS = {
  hud: false,
  devMenu: false,
  logConsole: false,
  useLegacyBgSim: false,
  forceMode: "auto"
};
function getEnvFlags() {
  const flags = {};
  return flags;
}
function getQueryFlags(url) {
  const flags = {};
  return flags;
}
function mergeFlags(sources) {
  return {
    ...sources.defaults,
    ...sources.env,
    ...sources.query
  };
}
function createFlags(url) {
  const sources = {
    env: getEnvFlags(),
    query: getQueryFlags(),
    defaults: DEFAULT_FLAGS
  };
  return mergeFlags(sources);
}
const load = ({ url }) => {
  const flags = createFlags();
  appFlags.set(flags);
  return {};
};
export {
  load
};
