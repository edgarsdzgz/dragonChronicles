import type { LogEvent } from '../types.js';

export function createConsoleSink() {
  return {
    log(e: LogEvent) {
      const tag = `[${e.src}${e.mode ? `/${e.mode}` : ''}]`;
      (console[e.lvl] ?? console.log)(tag, e.msg, e.data ?? '');
    },
  };
}
