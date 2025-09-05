import { vi, expect, it, describe, beforeEach, afterEach } from 'vitest';
import {
  createBackgroundSim as _createBackgroundSim,
  startBackground,
  stopBackground,
} from '@/sim/background';

function makeFakeTicker() {
  return {
    start: (periodMs: number, cb: () => void) => {
      const id = setInterval(cb, periodMs);
      return () => clearInterval(id);
    },
  };
}

describe('background sim toggle by visibility', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval', 'setTimeout', 'Date'] });
    // force visible in jsdom
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
  });

  afterEach(() => {
    stopBackground();
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('emits bg-tick events at ~2Hz when started', async () => {
    const calls: Event[] = [];
    const off = (e: Event) => calls.push(e);
    window.addEventListener('bg-tick', off);

    startBackground(makeFakeTicker());
    vi.advanceTimersByTime(1600); // ~3 ticks at 500ms interval

    // Wait for microtasks to flush since background uses queueMicrotask
    await new Promise((resolve) => process.nextTick(resolve));

    expect(calls.length).toBeGreaterThanOrEqual(3);
    expect(calls.length).toBeLessThanOrEqual(4);

    window.removeEventListener('bg-tick', off);
  });

  it('stops emitting when stopped', async () => {
    const calls: Event[] = [];
    const off = (e: Event) => calls.push(e);
    window.addEventListener('bg-tick', off);

    startBackground(makeFakeTicker());
    vi.advanceTimersByTime(600); // ~1 tick
    await new Promise((resolve) => process.nextTick(resolve));

    const during = calls.length;
    expect(during).toBeGreaterThan(0);

    stopBackground();
    vi.advanceTimersByTime(1000);
    await new Promise((resolve) => process.nextTick(resolve));

    const after = calls.length - during;
    expect(after).toBe(0);

    window.removeEventListener('bg-tick', off);
  });

  it('only ticks when document is visible', async () => {
    const calls: Event[] = [];
    const off = (e: Event) => calls.push(e);
    window.addEventListener('bg-tick', off);

    // Start with hidden state
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });

    startBackground(makeFakeTicker());
    vi.advanceTimersByTime(1000); // Wait for multiple intervals
    await new Promise((resolve) => process.nextTick(resolve));

    expect(calls.length).toBe(0); // No events when hidden

    // Switch to visible
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    vi.advanceTimersByTime(1000); // Wait for events
    await new Promise((resolve) => process.nextTick(resolve));

    expect(calls.length).toBeGreaterThan(0); // Events when visible

    window.removeEventListener('bg-tick', off);
  });
});
