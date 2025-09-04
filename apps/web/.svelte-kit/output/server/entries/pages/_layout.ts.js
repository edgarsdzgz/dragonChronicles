import { h as hudEnabled } from "../../chunks/flags.js";
const load = ({ url }) => {
  if (url.searchParams.get("hud") === "1") hudEnabled.set(true);
  return {};
};
export {
  load
};
