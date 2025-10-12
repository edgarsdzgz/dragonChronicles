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
  const app = new Application();
  await app.init({
    view: canvas,
    antialias: false,
    resolution: dpr,
    autoDensity: true,
    background: 0x7e2453, // Underground color #7e2453
    resizeTo: canvas.parentElement ?? window,
  });

  // Lazy load background simulation
  if (!createBackgroundSim) {
    const bgSimModule = await import('../sim/background');
    createBackgroundSim = bgSimModule.createBackgroundSim;
  }

  // New: render-only pause; keep background sim running while hidden
  const bg: BgSimHandle = createBackgroundSim(); // Use default realTicker

  const applyVisibilityPolicy = () => {
    if (document.hidden) {
      if (!app.ticker.stopped) app.ticker.stop(); // pause rendering/GPU
      bg.start(); // continue simulation (lightweight)
    } else {
      bg.stop(); // foreground sim handled by ticker/W3 later
      // In PixiJS v8, ticker starts automatically when needed
    }
  };

  document.addEventListener('visibilitychange', applyVisibilityPolicy);
  // also apply once on mount to honor current state
  applyVisibilityPolicy();

  // Create scrolling background
  console.log('🚀 MOUNTING: About to create scrolling background...');
  const scrollingBackground = await createScrollingBackground(app, {
    scrollSpeed: 100, // 100 pixels per second
    enabled: true,
  });
  console.log('✅ MOUNTING: Scrolling background created successfully!', scrollingBackground);

  // Start automatic gameplay for preview
  console.log('🎮 MOUNTING: Starting automatic gameplay...');
  scrollingBackground.startAutomaticGameplay();
  console.log('✅ MOUNTING: Automatic gameplay started!');

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
