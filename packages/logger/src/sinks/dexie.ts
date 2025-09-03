import type { LogEvent } from '../types';
import { db, type LogRow } from '@draconia/db'; // W4 tables

export type DexieSink = {
  enqueue(e: LogEvent): void;
  clear(): Promise<void>;
};

export function createDexieSink(batchMs = 1000, maxRows = 10_000): DexieSink {
  let buf: LogEvent[] = [];
  let timer: any = null;

  const flush = async () => {
    const items = buf;
    buf = [];
    if (!items.length) return;

    const rows: LogRow[] = items.map((e) => ({
      timestamp: e.t,
      level: e.lvl,
      source: e.src,
      message: e.msg,
      data: e.data,
      profileId: e.profileId,
    }));

    await db.logs.bulkAdd(rows);
    const count = await db.logs.count();
    if (count > maxRows) {
      const toDelete = count - maxRows;
      const olds = await db.logs.orderBy('id').limit(toDelete).toArray();
      await db.logs.bulkDelete(olds.map((o: LogRow) => o.id!));
    }
  };

  function schedule() {
    if (timer) return;
    timer = setTimeout(async () => {
      timer = null;
      try {
        await flush();
      } catch {
        /* ignore */
      }
    }, batchMs);
  }

  function enqueue(e: LogEvent) {
    buf.push(e);
    schedule();
  }

  async function clear() {
    buf = [];
    if (timer) (clearTimeout(timer), (timer = null));
    await db.logs.clear();
  }

  // flush before unload
  if (typeof window !== 'undefined') {
    window.addEventListener(
      'beforeunload',
      () => {
        void flush();
      },
      { once: true },
    );
  }

  return { enqueue, clear };
}
