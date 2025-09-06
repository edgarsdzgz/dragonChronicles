

export const index = 4;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/dev/logs/_page.svelte.js')).default;
export const imports = ["_app/immutable/nodes/4.8bcf3343.js","_app/immutable/chunks/scheduler.2520d29c.js","_app/immutable/chunks/index.0ed762bc.js","_app/immutable/chunks/logger.23a8648b.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js"];
export const stylesheets = [];
export const fonts = [];
