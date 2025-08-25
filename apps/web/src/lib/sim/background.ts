// Lightweight background simulation loop for hidden tabs.
// Emits window 'bg-tick' CustomEvents with an approximate dt (ms).
// Replace with Worker wiring in P0-W3 (same event name to keep API stable).

import { realTicker, type Ticker } from './ticker';
import { isVisible } from './visibility-gate';

export type BgTickDetail = { dt: number };
export type BgSimHandle = { start: () => void; stop: () => void; isRunning: () => boolean };

const PERIOD_MS = 500; // ~2Hz
let stop: null | (() => void) = null;
let last = performance.now();

export function createBackgroundSim(ticker: Ticker = realTicker): BgSimHandle {
  return {
    start() {
      if (stop) return;
      last = performance.now();
      stop = ticker.start(PERIOD_MS, () => {
        if (!isVisible()) return;
        const now = performance.now();
        const dt = now - last;
        last = now;
        // Use microtask to avoid blocking visibility handler
        queueMicrotask(() => {
          window.dispatchEvent(new CustomEvent<BgTickDetail>('bg-tick', { detail: { dt } }));
        });
      });
    },
    stop() {
      if (stop) {
        stop();
        stop = null;
      }
    },
    isRunning() {
      return stop !== null;
    }
  };
}

// Legacy API for backward compatibility
export function startBackground(ticker: Ticker = realTicker) {
  const sim = createBackgroundSim(ticker);
  sim.start();
  return sim;
}

export function stopBackground() {
  if (stop) {
    stop();
    stop = null;
  }
}