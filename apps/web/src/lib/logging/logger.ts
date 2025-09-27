// Lazy load logger to reduce initial bundle size
let _logger: Awaited<ReturnType<typeof import('@draconia/logger').createLogger>> | null = null;

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
export const logger = new Proxy({} as Record<string, unknown>, {
  get(target, prop) {
    return async (...args: unknown[]) => {
      const actualLogger = await getLogger();
      return (actualLogger as Record<string, unknown>)[prop as string](...args);
    };
  },
});
