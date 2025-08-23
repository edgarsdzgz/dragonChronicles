// Lightweight background simulation loop for hidden tabs.
// Emits window 'bg-tick' CustomEvents with an approximate dt (ms).
// Replace with Worker wiring in P0-W3 (same event name to keep API stable).

export type BgTickDetail = { dt: number };
export type BgSimHandle = { start: () => void; stop: () => void; isRunning: () => boolean };

export function createBackgroundSim(freqHz = 2): BgSimHandle {
  let id: number | null = null;
  let last = performance.now();
  const intervalMs = Math.max(250, Math.round(1000 / freqHz)); // guard: never < 4Hz here

  const tick = () => {
    const now = performance.now();
    const dt = now - last;
    last = now;
    // Use microtask to avoid blocking visibility handler
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