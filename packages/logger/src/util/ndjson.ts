import type { LogEvent } from '../types';

export function toNDJSON(events: LogEvent[]): string {
  return events.map((e) => JSON.stringify(e)).join('\n') + '\n';
}
