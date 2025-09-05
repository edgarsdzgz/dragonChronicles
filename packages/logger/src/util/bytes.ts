// Fast approximate byte size of a JSON event without building the string every time.
export function approxJsonBytes(obj: unknown, limit = 1 << 20): number {
  let bytes = 0;
  const stack = [obj];
  const seen = new WeakSet<object>();

  while (stack.length) {
    const v = stack.pop();
    if (v == null) {
      bytes += 4;
      continue; // "null"
    }

    const t = typeof v;
    if (t === 'string') {
      bytes += 2 + (v as string).length;
    } else if (t === 'number') {
      bytes += 8;
    } else if (t === 'boolean') {
      bytes += 4;
    } else if (t === 'object') {
      if (seen.has(v as object)) continue;
      seen.add(v as object);
      const isArr = Array.isArray(v);
      bytes += isArr ? 2 : 2; // [] or {}
      for (const k in v as Record<string, unknown>) {
        bytes += k.length + 3; // "k":
        stack.push((v as Record<string, unknown>)[k]);
      }
    }

    if (bytes > limit) return bytes;
  }

  return bytes;
}
