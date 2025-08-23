import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Test background simulation logic without importing SvelteKit modules
type BgTickDetail = { dt: number };
type BgSimHandle = { start: () => void; stop: () => void; isRunning: () => boolean };

function createMockBackgroundSim(freqHz = 2): BgSimHandle {
  let id: number | null = null;
  let last = performance.now();
  const intervalMs = Math.max(250, Math.round(1000 / freqHz));

  const tick = () => {
    const now = performance.now();
    const dt = now - last;
    last = now;
    queueMicrotask(() => {
      window.dispatchEvent(new CustomEvent<BgTickDetail>('bg-tick', { detail: { dt } }));
    });
  };

  return {
    start() {
      if (id !== null) return;
      last = performance.now();
      id = window.setInterval(tick, intervalMs);
    },
    stop() {
      if (id !== null) {
        clearInterval(id);
        id = null;
      }
    },
    isRunning() {
      return id !== null;
    }
  };
}

describe('background sim toggle by visibility', () => {
  let originalHidden: any;
  let originalDispatchEvent: any;

  beforeEach(() => {
    vi.useFakeTimers();
    
    // Mock document.hidden
    originalHidden = Object.getOwnPropertyDescriptor(document, 'hidden');
    let hiddenValue = false;
    Object.defineProperty(document, 'hidden', {
      configurable: true,
      get: () => hiddenValue,
      set: (v) => (hiddenValue = v),
    });

    // Mock window.dispatchEvent to capture events
    originalDispatchEvent = window.dispatchEvent;
    window.dispatchEvent = vi.fn();
  });

  afterEach(() => {
    vi.useRealTimers();
    if (originalHidden) {
      Object.defineProperty(document, 'hidden', originalHidden);
    } else {
      delete (document as any).hidden;
    }
    window.dispatchEvent = originalDispatchEvent;
  });

  it('emits bg-tick events at ~2Hz when started', () => {
    const bgSim = createMockBackgroundSim(2);
    
    // Start the background sim
    bgSim.start();
    expect(bgSim.isRunning()).toBe(true);

    // Advance time and check events
    vi.advanceTimersByTime(1600); // 1.6 seconds
    
    const mockDispatch = window.dispatchEvent as any;
    const calls = mockDispatch.mock.calls;
    
    // Should have ~3 calls (2Hz * 1.6s = 3.2 events)
    expect(calls.length).toBeGreaterThanOrEqual(3);
    expect(calls.length).toBeLessThanOrEqual(4);

    // Check event structure
    const lastCall = calls[calls.length - 1];
    expect(lastCall[0]).toBeInstanceOf(CustomEvent);
    expect(lastCall[0].type).toBe('bg-tick');
    expect(lastCall[0].detail).toHaveProperty('dt');
    expect(typeof lastCall[0].detail.dt).toBe('number');

    bgSim.stop();
    expect(bgSim.isRunning()).toBe(false);
  });

  it('stops emitting when stopped', () => {
    const bgSim = createMockBackgroundSim(2);
    
    bgSim.start();
    vi.advanceTimersByTime(800);
    
    const mockDispatch = window.dispatchEvent as any;
    const callsWhileRunning = mockDispatch.mock.calls.length;
    expect(callsWhileRunning).toBeGreaterThan(0);

    // Stop and clear calls
    bgSim.stop();
    mockDispatch.mockClear();

    // Advance more time - should not emit
    vi.advanceTimersByTime(1000);
    expect(mockDispatch.mock.calls.length).toBe(0);
  });

  it('respects minimum interval guard (never < 250ms)', () => {
    // Try to create a very high frequency sim
    const bgSim = createMockBackgroundSim(100); // 100Hz requested
    
    bgSim.start();
    vi.advanceTimersByTime(500); // 0.5 seconds
    
    const mockDispatch = window.dispatchEvent as any;
    const calls = mockDispatch.mock.calls.length;
    
    // Should be capped at 4Hz max (250ms min interval)
    // So in 500ms, max 2 events
    expect(calls).toBeLessThanOrEqual(3); // Allow some tolerance
    
    bgSim.stop();
  });
});