import { createLogger, createDexieSink } from '@draconia/logger';

export const logger = createLogger({
  maxBytes: 2 * 1024 * 1024,
  maxEntries: 10_000,
  devConsole: import.meta.env.DEV,
  dexie: createDexieSink(1000, 10_000),
});
