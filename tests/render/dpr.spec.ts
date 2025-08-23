import { describe, it, expect } from 'vitest';
import { clampDPR } from '../../apps/web/src/lib/pixi/dpr';

describe('clampDPR', () => {
  it('clamps to [1,2] by default', () => {
    expect(clampDPR(0.5)).toBe(1);
    expect(clampDPR(1.5)).toBe(1.5);
    expect(clampDPR(3)).toBe(2);
  });

  it('respects custom min/max bounds', () => {
    expect(clampDPR(1.5, 2, 4)).toBe(2); // below min
    expect(clampDPR(3, 2, 4)).toBe(3);   // within range
    expect(clampDPR(5, 2, 4)).toBe(4);   // above max
  });

  it('uses fallback when devicePixelRatio is undefined', () => {
    expect(clampDPR(undefined as any)).toBe(1);
  });
});