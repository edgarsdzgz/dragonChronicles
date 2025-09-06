import { createLogger, createDexieSink } from "@draconia/logger";
createLogger({
  maxBytes: 2 * 1024 * 1024,
  maxEntries: 1e4,
  devConsole: false,
  dexie: createDexieSink(1e3, 1e4)
});
