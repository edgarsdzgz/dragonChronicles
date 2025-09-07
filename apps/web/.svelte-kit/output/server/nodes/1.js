

export const index = 1;
let component_cache;
export const component = async () => component_cache ??= (await import('../entries/pages/_error.svelte.js')).default;
export const imports = ["_app/immutable/nodes/1.f1c6df08.js","_app/immutable/chunks/scheduler.2520d29c.js","_app/immutable/chunks/index.0ed762bc.js","_app/immutable/chunks/singletons.d8260ed3.js","_app/immutable/chunks/index.5c643c0a.js","_app/immutable/chunks/logger.23a8648b.js","_app/immutable/chunks/_commonjsHelpers.725317a4.js"];
export const stylesheets = ["_app/immutable/assets/1.71a4d092.css"];
export const fonts = [];
