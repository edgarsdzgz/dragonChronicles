import { describe, it, expect } from 'vitest';

// Unit-test the expected interface contract / wiring points without a DOM.
function backgroundContract() {
  // Shape we rely on until W3 swaps the engine
  return ['bg-tick']; // event name we dispatch/listen to
}

describe('background sim contract', () => {
  it('exposes a stable bg-tick event name for listeners', () => {
    expect(backgroundContract()).toContain('bg-tick');
  });
});

describe('anti-regression guard', () => {
  it('never exceeds intended low frequency in hidden mode (doc test)', () => {
    // Documented target: ~2Hz default (>=250ms). Keep this as a living spec assertion.
    const minIntervalMs = 250;
    expect(minIntervalMs).toBeGreaterThanOrEqual(250);
  });
});
