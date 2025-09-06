export function clampDPR(raw = globalThis.devicePixelRatio || 1, min = 1, max = 2) {
  return Math.max(min, Math.min(max, raw));
}
