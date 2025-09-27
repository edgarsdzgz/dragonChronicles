// Lazy load logger to reduce initial bundle size
let _logger: any = null;

export async function getLogger() {
  if (!_logger) {
    const { createLogger, createDexieSink } = await import('@draconia/logger');
    _logger = createLogger({
      maxBytes: 2 * 1024 * 1024,
      maxEntries: 10_000,
      devConsole: import.meta.env.DEV,
      dexie: createDexieSink(1000, 10_000),
    });
  }
  return _logger;
}

// For backward compatibility, create a proxy that lazy loads
export const logger = new Proxy({} as any, {
  get(target, prop) {
    return async (...args: any[]) => {
      const actualLogger = await getLogger();
      return (actualLogger as any)[prop](...args);
    };
  }
});
