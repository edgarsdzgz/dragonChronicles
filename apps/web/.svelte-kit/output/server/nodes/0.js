import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.BjuDYBo_.js","_app/immutable/chunks/flags.B2YthsLQ.js","_app/immutable/chunks/index.33bCglzF.js","_app/immutable/chunks/scheduler.DCi9tjgp.js","_app/immutable/chunks/index.BID5roI-.js","_app/immutable/chunks/index.B-5O6jHt.js","_app/immutable/chunks/preload-helper.CmsKOCeN.js","_app/immutable/chunks/_commonjsHelpers.Cpj98o6Y.js"];
export const stylesheets = ["_app/immutable/assets/0.Dpyij7lW.css"];
export const fonts = [];
