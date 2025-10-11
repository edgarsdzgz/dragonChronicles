import { Application } from 'pixi.js';
import { clampDPR } from './dpr';
import { createScrollingBackground, type ScrollingBackgroundHandle } from './scrolling-background';
// Lazy load background simulation to reduce initial bundle size
let createBackgroundSim: typeof import('../sim/background').createBackgroundSim | null = null;

export type PixiHandle = {
  app: Application;
  scrollingBackground: ScrollingBackgroundHandle;
  resize: () => void;
  destroy: () => void;
};

export type BgSimHandle = {
  start: () => void;
  stop: () => void;
  isRunning: () => boolean;
};

export async function mountPixi(canvas: HTMLCanvasElement): Promise<PixiHandle> {
  const dpr = clampDPR();
  const app = new Application({
    view: canvas,
    antialias: false,
    resolution: dpr,
    autoDensity: true,
    backgroundAlpha: 0,
  });
  await app.init({ resizeTo: canvas.parentElement ?? window });

  // Lazy load background simulation
  if (!createBackgroundSim) {
    const bgSimModule = await import('../sim/background');
    createBackgroundSim = bgSimModule.createBackgroundSim;
  }

  // New: render-only pause; keep background sim running while hidden
  const bg: BgSimHandle = createBackgroundSim(2); // 2 Hz is thrifty and predictable

  const applyVisibilityPolicy = () => {
    if (document.hidden) {
      if (!app.ticker.stopped) app.ticker.stop(); // pause rendering/GPU
      bg.start(); // continue simulation (lightweight)
    } else {
      bg.stop(); // foreground sim handled by ticker/W3 later
      if (app.ticker.stopped) app.ticker.start(); // resume rendering/GPU
    }
  };

  document.addEventListener('visibilitychange', applyVisibilityPolicy);
  // also apply once on mount to honor current state
  applyVisibilityPolicy();

  // Create scrolling background
  const scrollingBackground = await createScrollingBackground(app, {
    scrollSpeed: 100, // 100 pixels per second
    enabled: true,
  });

  const handle: PixiHandle = {
    app,
    scrollingBackground,
    resize: () => app.renderer.resize(canvas.clientWidth, canvas.clientHeight),
    destroy: () => {
      document.removeEventListener('visibilitychange', applyVisibilityPolicy);
      bg.stop();
      scrollingBackground.destroy();
      app.destroy(true, { children: true });
    },
  };
  return handle;
}
