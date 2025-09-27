import * as universal from '../entries/pages/_layout.ts.js';

export const index = 0;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_layout.svelte.js')).default;
export { universal };
export const universal_id = "src/routes/+layout.ts";
export const imports = ["_app/immutable/nodes/0.71ac7238.js","_app/immutable/chunks/store.3b89edcb.js","_app/immutable/chunks/index.045e0b2e.js","_app/immutable/chunks/scheduler.86f77edc.js","_app/immutable/chunks/preload-helper.a4192956.js","_app/immutable/chunks/index.e78d2784.js","_app/immutable/chunks/index.29d1603d.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js","_app/immutable/chunks/Application.778f7409.js"];
export const stylesheets = ["_app/immutable/assets/UpdateToast.e36696b1.css","_app/immutable/assets/InstallPrompt.0384ea2f.css","_app/immutable/assets/DevMenu.69b59bfc.css"];
export const fonts = [];
