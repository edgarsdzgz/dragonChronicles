import type { Logger, LogEvent } from './types';
import { approxJsonBytesFast } from './util/bytes-optimized';
import { toNDJSON } from './util/ndjson';
import { createConsoleSink } from './sinks/console';
import { createDexieSink, type DexieSink } from './sinks/dexie';
import { redactEvent } from './redact';
import { CircularBuffer } from './circular-buffer';

type Options = {
  maxBytes?: number; // default 2MB
  maxEntries?: number; // default 10_000
  devConsole?: boolean;
  dexie?: DexieSink | null;
};

export function createLogger(opts: Options = {}): Logger {
  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024;
  const maxEntries = opts.maxEntries ?? 10_000;

  // Use circular buffer for O(1) operations
  const ring = new CircularBuffer<LogEvent>(maxEntries);
  let bytes = 0;

  const consoleSink = createConsoleSink();
  const dexieSink = opts.dexie ?? null;

  function evictIfNeeded() {
    // Circular buffer automatically handles eviction
    // Just need to track bytes
    while (bytes > maxBytes && ring.length > 0) {
      const first = ring.shift();
      if (first) {
        bytes -= approxJsonBytesFast(first);
      }
    }
  }

  function log(e: LogEvent) {
    const cleaned = redactEvent(e);
    const b = approxJsonBytesFast(cleaned);

    // Add to circular buffer (O(1) operation)
    ring.push(cleaned);
    bytes += b;

    // Evict if needed
    evictIfNeeded();

    // Send to sinks
    if (consoleEnabled) consoleSink.log(cleaned);
    dexieSink?.enqueue(cleaned);
  }

  let consoleEnabled = !!opts.devConsole;

  async function exportNDJSON(): Promise<Blob> {
    // Use circular buffer's efficient toArray method
    const events = ring.toArray();
    const text = toNDJSON(events);
    return new Blob([text], { type: 'application/x-ndjson' });
  }

  async function clear() {
    ring.clear();
    bytes = 0;
    await dexieSink?.clear();
  }

  function enableConsole(enable: boolean) {
    consoleEnabled = enable;
  }

  return { log, exportNDJSON, clear, enableConsole };
}
