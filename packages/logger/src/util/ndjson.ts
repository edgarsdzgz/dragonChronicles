import type { LogEvent } from '../types.js';

export function toNDJSON(events: LogEvent[]): string {
  return events.map((e) => JSON.stringify(e)).join('\n') + '\n';
}
