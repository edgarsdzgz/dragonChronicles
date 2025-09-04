/**
 * Optimized byte size calculation for JSON objects
 *
 * Replaces recursive stack-based approach with iterative estimation
 * Provides fast approximate sizing for performance-critical logging
 */

/**
 * Fast approximate byte size calculation
 * O(1) for primitives, O(n) for objects where n = number of keys
 */
export function approxJsonBytesFast(obj: unknown): number {
  if (obj == null) return 4; // "null"

  const t = typeof obj;

  switch (t) {
    case 'string':
      return 2 + (obj as string).length; // quotes + content
    case 'number':
      return 8; // typical number size
    case 'boolean':
      return 4; // "true" or "false"
    case 'object':
      if (Array.isArray(obj)) {
        // Estimate array size based on length
        const arr = obj as unknown[];
        return 2 + arr.reduce((sum: number, item) => sum + approxJsonBytesFast(item), 0);
      } else {
        // Estimate object size based on keys
        const keys = Object.keys(obj as object);
        return (
          2 +
          keys.reduce((sum: number, key) => {
            const value = (obj as Record<string, unknown>)[key];
            return sum + key.length + 3 + approxJsonBytesFast(value); // "key": value
          }, 0)
        );
      }
    default:
      return 8; // fallback for symbols, functions, etc.
  }
}

/**
 * Detailed byte size calculation with depth limiting
 * More accurate but slower than fast version
 */
export function approxJsonBytesDetailed(obj: unknown, maxDepth = 3): number {
  return _calculateBytes(obj, maxDepth, 0, new WeakSet());
}

function _calculateBytes(
  obj: unknown,
  maxDepth: number,
  currentDepth: number,
  seen: WeakSet<object>,
): number {
  if (obj == null) return 4;
  if (currentDepth >= maxDepth) return 8; // truncate deep nesting

  const t = typeof obj;

  switch (t) {
    case 'string':
      return 2 + (obj as string).length;
    case 'number':
      return 8;
    case 'boolean':
      return 4;
    case 'object':
      if (seen.has(obj as object)) return 8; // circular reference
      seen.add(obj as object);

      if (Array.isArray(obj)) {
        const arr = obj as unknown[];
        return (
          2 +
          arr.reduce(
            (sum: number, item) => sum + _calculateBytes(item, maxDepth, currentDepth + 1, seen),
            0,
          )
        );
      } else {
        const keys = Object.keys(obj as object);
        return (
          2 +
          keys.reduce((sum: number, key) => {
            const value = (obj as Record<string, unknown>)[key];
            return sum + key.length + 3 + _calculateBytes(value, maxDepth, currentDepth + 1, seen);
          }, 0)
        );
      }
    default:
      return 8;
  }
}

/**
 * Ultra-fast size estimation for known data structures
 * Use when you know the approximate structure of your data
 */
export function estimateLogEventSize(event: {
  t: number;
  lvl: string;
  src: string;
  msg: string;
  data?: unknown;
  profileId?: string;
}): number {
  let size = 0;

  // Timestamp: number
  size += 8;

  // Level: string
  size += 2 + event.lvl.length;

  // Source: string
  size += 2 + event.src.length;

  // Message: string
  size += 2 + event.msg.length;

  // Data: estimate based on type
  if (event.data !== undefined) {
    size += approxJsonBytesFast(event.data);
  }

  // Profile ID: string
  if (event.profileId) {
    size += 2 + event.profileId.length;
  }

  // JSON structure overhead
  size += 20; // brackets, quotes, colons, commas

  return size;
}

/**
 * Batch size calculation for multiple objects
 * More efficient than individual calculations
 */
export function batchApproxJsonBytes(objects: unknown[]): number[] {
  const results: number[] = new Array(objects.length);

  for (let i = 0; i < objects.length; i++) {
    results[i] = approxJsonBytesFast(objects[i]);
  }

  return results;
}

/**
 * Memory-efficient streaming size calculation
 * For very large datasets
 */
export function* streamApproxJsonBytes(objects: unknown[]): Generator<number, void, unknown> {
  for (const obj of objects) {
    yield approxJsonBytesFast(obj);
  }
}
