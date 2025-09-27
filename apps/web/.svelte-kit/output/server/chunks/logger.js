let _logger = null;
async function getLogger() {
  if (!_logger) {
    const { createLogger, createDexieSink } = await import("@draconia/logger");
    _logger = createLogger({
      maxBytes: 2 * 1024 * 1024,
      maxEntries: 1e4,
      devConsole: false,
      dexie: createDexieSink(1e3, 1e4)
    });
  }
  return _logger;
}
new Proxy({}, {
  get(target, prop) {
    return async (...args) => {
      const actualLogger = await getLogger();
      return actualLogger[prop](...args);
    };
  }
});
