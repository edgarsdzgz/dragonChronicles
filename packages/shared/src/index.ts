export const DRACONIA_VERSION = "0.0.0-phase0";

/** Simple pure util to test cross-package import */
export function clamp(v: number, lo: number, hi: number) {
  if (lo > hi) throw new Error("lo > hi");
  return Math.min(hi, Math.max(lo, v));
}

/** Brand new seed type used later for deterministic RNG */
export type Seed = { hi: number; lo: number };