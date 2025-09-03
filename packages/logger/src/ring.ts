import type { Logger, LogEvent } from './types';
import { approxJsonBytes } from './util/bytes';
import { toNDJSON } from './util/ndjson';
import { createConsoleSink } from './sinks/console';
import { createDexieSink, type DexieSink } from './sinks/dexie';
import { redactEvent } from './redact';

type Options = {
  maxBytes?: number; // default 2MB
  maxEntries?: number; // default 10_000
  devConsole?: boolean;
  dexie?: DexieSink | null;
};

export function createLogger(opts: Options = {}): Logger {
  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024;
  const maxEntries = opts.maxEntries ?? 10_000;

  let ring: LogEvent[] = [];
  let bytes = 0;

  const consoleSink = createConsoleSink();
  const dexieSink = opts.dexie ?? null;

  function evictIfNeeded() {
    while ((bytes > maxBytes || ring.length > maxEntries) && ring.length) {
      const first = ring.shift()!;
      bytes -= approxJsonBytes(first);
    }
  }

  function log(e: LogEvent) {
    const cleaned = redactEvent(e);
    const b = approxJsonBytes(cleaned);
    ring.push(cleaned);
    bytes += b;
    evictIfNeeded();
    if (consoleEnabled) consoleSink.log(cleaned);
    dexieSink?.enqueue(cleaned);
  }

  let consoleEnabled = !!opts.devConsole;

  async function exportNDJSON(): Promise<Blob> {
    const text = toNDJSON(ring);
    return new Blob([text], { type: 'application/x-ndjson' });
  }

  async function clear() {
    ring = [];
    bytes = 0;
    await dexieSink?.clear();
  }

  function enableConsole(enable: boolean) {
    consoleEnabled = enable;
  }

  return { log, exportNDJSON, clear, enableConsole };
}
