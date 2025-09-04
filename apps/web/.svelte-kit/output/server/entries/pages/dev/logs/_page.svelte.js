import { c as create_ssr_component, o as onDestroy, a as add_attribute, e as escape } from "../../../../chunks/ssr.js";
import Dexie from "dexie";
import { z } from "zod";
function approxJsonBytesFast(obj) {
  if (obj == null)
    return 4;
  const t = typeof obj;
  switch (t) {
    case "string":
      return 2 + obj.length;
    case "number":
      return 8;
    case "boolean":
      return 4;
    case "object":
      if (Array.isArray(obj)) {
        const arr = obj;
        return 2 + arr.reduce((sum, item) => sum + approxJsonBytesFast(item), 0);
      } else {
        const keys = Object.keys(obj);
        return 2 + keys.reduce((sum, key) => {
          const value = obj[key];
          return sum + key.length + 3 + approxJsonBytesFast(value);
        }, 0);
      }
    default:
      return 8;
  }
}
function toNDJSON(events) {
  return events.map((e) => JSON.stringify(e)).join("\n") + "\n";
}
function createConsoleSink() {
  return {
    log(e) {
      const tag = `[${e.src}${e.mode ? `/${e.mode}` : ""}]`;
      (console[e.lvl] ?? console.log)(tag, e.msg, e.data ?? "");
    }
  };
}
const ALLOWED_DATA_KEYS = /* @__PURE__ */ new Set([
  // numeric metrics allowed freely
  "fps",
  "draws",
  "enemies",
  "proj",
  "arcana",
  "gold",
  // safe identifiers
  "dragonName",
  "profileId",
  "land",
  "ward"
]);
function redactEvent(e) {
  const out = {
    t: e.t,
    lvl: e.lvl,
    src: e.src,
    msg: e.msg
  };
  if (e.mode !== void 0)
    out.mode = e.mode;
  if (e.profileId !== void 0)
    out.profileId = e.profileId;
  if (e.data && typeof e.data === "object") {
    const clean = {};
    for (const [k, v] of Object.entries(e.data)) {
      if (!ALLOWED_DATA_KEYS.has(k))
        continue;
      if (typeof v === "string" && k !== "dragonName")
        continue;
      clean[k] = v;
    }
    out.data = clean;
  }
  return out;
}
class CircularBuffer {
  constructor(capacity) {
    this.buffer = [];
    this.head = 0;
    this.tail = 0;
    this.size = 0;
    this.capacity = capacity;
    this.buffer = new Array(capacity);
  }
  /**
   * Add item to buffer, evicting oldest if at capacity
   * O(1) operation
   */
  push(item) {
    if (this.size === this.capacity) {
      this.buffer[this.head] = item;
      this.head = (this.head + 1) % this.capacity;
      this.tail = (this.tail + 1) % this.capacity;
    } else {
      this.buffer[this.tail] = item;
      this.tail = (this.tail + 1) % this.capacity;
      this.size++;
    }
  }
  /**
   * Remove and return oldest item
   * O(1) operation
   */
  shift() {
    if (this.size === 0)
      return void 0;
    const item = this.buffer[this.head];
    this.head = (this.head + 1) % this.capacity;
    this.size--;
    return item;
  }
  /**
   * Get current number of items
   */
  get length() {
    return this.size;
  }
  /**
   * Check if buffer is empty
   */
  get isEmpty() {
    return this.size === 0;
  }
  /**
   * Check if buffer is full
   */
  get isFull() {
    return this.size === this.capacity;
  }
  /**
   * Get all items as array (for export)
   * O(n) operation, use sparingly
   */
  toArray() {
    if (this.size === 0)
      return [];
    const result = [];
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      const item = this.buffer[current];
      if (item !== void 0) {
        result.push(item);
      }
      current = (current + 1) % this.capacity;
    }
    return result;
  }
  /**
   * Clear all items
   * O(1) operation
   */
  clear() {
    this.head = 0;
    this.tail = 0;
    this.size = 0;
  }
  /**
   * Get items up to a specific limit
   * Useful for partial exports
   */
  toArrayLimited(limit) {
    if (this.size === 0 || limit <= 0)
      return [];
    const result = [];
    let current = this.head;
    const count = Math.min(limit, this.size);
    for (let i = 0; i < count; i++) {
      const item = this.buffer[current];
      if (item !== void 0) {
        result.push(item);
      }
      current = (current + 1) % this.capacity;
    }
    return result;
  }
  /**
   * Iterate over items without removing them
   */
  forEach(callback) {
    if (this.size === 0)
      return;
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      const item = this.buffer[current];
      if (item !== void 0) {
        callback(item, i);
      }
      current = (current + 1) % this.capacity;
    }
  }
  /**
   * Map items to new array without removing them
   */
  map(callback) {
    if (this.size === 0)
      return [];
    const result = [];
    let current = this.head;
    for (let i = 0; i < this.size; i++) {
      const item = this.buffer[current];
      if (item !== void 0) {
        result.push(callback(item, i));
      }
      current = (current + 1) % this.capacity;
    }
    return result;
  }
}
function createLogger(opts = {}) {
  const maxBytes = opts.maxBytes ?? 2 * 1024 * 1024;
  const maxEntries = opts.maxEntries ?? 1e4;
  const ring = new CircularBuffer(maxEntries);
  let bytes = 0;
  const consoleSink = createConsoleSink();
  const dexieSink = opts.dexie ?? null;
  function evictIfNeeded() {
    while (bytes > maxBytes && ring.length > 0) {
      const first = ring.shift();
      if (first) {
        bytes -= approxJsonBytesFast(first);
      }
    }
  }
  function log(e) {
    const cleaned = redactEvent(e);
    const b = approxJsonBytesFast(cleaned);
    ring.push(cleaned);
    bytes += b;
    evictIfNeeded();
    if (consoleEnabled)
      consoleSink.log(cleaned);
    dexieSink?.enqueue(cleaned);
  }
  let consoleEnabled = !!opts.devConsole;
  async function exportNDJSON() {
    const events = ring.toArray();
    const text = toNDJSON(events);
    return new Blob([text], { type: "application/x-ndjson" });
  }
  async function clear() {
    ring.clear();
    bytes = 0;
    await dexieSink?.clear();
  }
  function enableConsole(enable) {
    consoleEnabled = enable;
  }
  return { log, exportNDJSON, clear, enableConsole };
}
class DraconiaDB extends Dexie {
  // Table definitions with proper typing
  saves;
  meta;
  logs;
  constructor() {
    super("draconia_v1");
    this.version(1).stores({
      saves: "++id, profileId, version, createdAt",
      meta: "key",
      logs: "++id, timestamp, level, source"
    });
  }
}
const db = new DraconiaDB();
const W3TimeAccountingSchema = z.object({
  lastSimWallClock: z.number().int().min(0),
  bgCoveredMs: z.number().int().min(0)
});
const ProfileProgressSchema = z.object({
  land: z.number().int().min(0),
  ward: z.number().int().min(0),
  distanceM: z.number().int().min(0)
});
const ProfileCurrenciesSchema = z.object({
  arcana: z.number().int().min(0),
  gold: z.number().int().min(0)
});
const ProfileEnchantsSchema = z.object({
  firepower: z.number().int().min(0),
  scales: z.number().int().min(0),
  tier: z.number().int().min(0)
});
const ProfileStatsSchema = z.object({
  playtimeS: z.number().int().min(0),
  deaths: z.number().int().min(0),
  totalDistanceM: z.number().int().min(0)
});
const ProfileLeaderboardSchema = z.object({
  highestWard: z.number().int().min(0),
  fastestBossS: z.number().int().min(0)
});
const ProfileV1Schema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  createdAt: z.number().int().min(0),
  lastActive: z.number().int().min(0),
  progress: ProfileProgressSchema,
  currencies: ProfileCurrenciesSchema,
  enchants: ProfileEnchantsSchema,
  stats: ProfileStatsSchema,
  leaderboard: ProfileLeaderboardSchema,
  sim: W3TimeAccountingSchema
});
const SettingsSchema = z.object({
  a11yReducedMotion: z.boolean()
});
const SaveV1Schema = z.object({
  version: z.literal(1),
  profiles: z.array(ProfileV1Schema).min(1).max(6),
  settings: SettingsSchema
});
z.object({
  version: z.literal(1),
  profiles: z.array(ProfileV1Schema).min(0).max(6),
  settings: SettingsSchema
});
z.object({
  id: z.number().int().positive().optional(),
  profileId: z.string().min(1),
  version: z.literal(1),
  data: SaveV1Schema,
  createdAt: z.number().int().min(0),
  checksum: z.string().min(1)
});
z.object({
  key: z.string().min(1),
  value: z.string(),
  updatedAt: z.number().int().min(0)
});
z.object({
  id: z.number().int().positive().optional(),
  timestamp: z.number().int().min(0),
  level: z.enum(["debug", "info", "warn", "error"]),
  source: z.enum(["ui", "worker", "render", "net"]),
  message: z.string().min(1),
  data: z.record(z.string(), z.unknown()).optional(),
  profileId: z.string().min(1).optional()
});
z.object({
  fileVersion: z.literal(1),
  exportedAt: z.number().int().min(0),
  checksum: z.string().min(1),
  data: SaveV1Schema
});
function createDexieSink(batchMs = 1e3, maxRows = 1e4) {
  let buf = [];
  let timer = null;
  const flush = async () => {
    const items = buf;
    buf = [];
    if (!items.length)
      return;
    const rows = items.map((e) => ({
      timestamp: e.t,
      level: e.lvl,
      source: e.src,
      message: e.msg,
      data: e.data,
      profileId: e.profileId
    }));
    await db.logs.bulkAdd(rows);
    const count = await db.logs.count();
    if (count > maxRows) {
      const toDelete = count - maxRows;
      const olds = await db.logs.orderBy("id").limit(toDelete).toArray();
      await db.logs.bulkDelete(olds.map((o) => o.id));
    }
  };
  function schedule() {
    if (timer)
      return;
    timer = setTimeout(async () => {
      timer = null;
      try {
        await flush();
      } catch {
      }
    }, batchMs);
  }
  function enqueue(e) {
    buf.push(e);
    schedule();
  }
  async function clear() {
    buf = [];
    if (timer)
      clearTimeout(timer), timer = null;
    await db.logs.clear();
  }
  if (typeof window !== "undefined") {
    window.addEventListener("beforeunload", () => {
      void flush();
    }, { once: true });
  }
  return { enqueue, clear };
}
createLogger({
  maxBytes: 2 * 1024 * 1024,
  maxEntries: 1e4,
  devConsole: false,
  dexie: createDexieSink(1e3, 1e4)
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rate = 100;
  let seconds = 10;
  let produced = 0, dropped = 0;
  function stop() {
    return;
  }
  onDestroy(stop);
  return `<div style="padding:12px; font:14px system-ui;"><h3 data-svelte-h="svelte-1uzt7vn">Logging Perf Lab</h3> <div style="margin-bottom: 16px;"><label>Rate (logs/sec) <input type="number" min="10" max="10000"${add_attribute("value", rate, 0)}></label> <label>Duration (s) <input type="number" min="1" max="30"${add_attribute("value", seconds, 0)}></label></div> <div style="margin-bottom: 16px;"><button ${""}>Start</button> <button ${"disabled"}>Stop</button> <button data-svelte-h="svelte-ghayiv">Export NDJSON</button></div> <div>Produced: ${escape(produced)} Dropped: ${escape(dropped)} Running: ${escape("no")}</div></div>`;
});
export {
  Page as default
};
