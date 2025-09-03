import type { LogEvent } from './types';

// Only dragon name is allowed as player-typed PII per policy.
// Strategy: remove suspicious fields from `data` (e.g. raw input text), unless whitelisted.

const ALLOWED_ROOT_KEYS: (keyof LogEvent)[] = [
  't',
  'lvl',
  'src',
  'msg',
  'mode',
  'profileId',
  'data',
];
const ALLOWED_DATA_KEYS = new Set([
  // numeric metrics allowed freely
  'fps',
  'draws',
  'enemies',
  'proj',
  'arcana',
  'gold',
  // safe identifiers
  'dragonName',
  'profileId',
  'land',
  'ward',
]);

export function redactEvent(e: LogEvent): LogEvent {
  const out: LogEvent = {
    t: e.t,
    lvl: e.lvl,
    src: e.src,
    msg: e.msg,
  };

  // Only add optional properties if they exist
  if (e.mode !== undefined) out.mode = e.mode;
  if (e.profileId !== undefined) out.profileId = e.profileId;

  if (e.data && typeof e.data === 'object') {
    const clean: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(e.data)) {
      if (!ALLOWED_DATA_KEYS.has(k)) continue;
      // Strings allowed only for certain keys
      if (typeof v === 'string' && k !== 'dragonName') continue;
      clean[k] = v;
    }
    out.data = clean;
  }

  return out;
}
