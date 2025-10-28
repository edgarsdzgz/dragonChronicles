import { Application } from 'pixi.js';
import { clampDPR } from './dpr';
import { GameStartManager } from './systems/game-start-manager';
import { AssetManager } from './systems/rendering/asset-manager';
// Lazy load background simulation to reduce initial bundle size
let createBackgroundSim: typeof import('../sim/background').createBackgroundSim | null = null;

export type PixiHandle = {
  app: Application;
  gameStartManager: GameStartManager;
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
    antialias: true, // Enable antialiasing for smoother sprites
    resolution: dpr,
    autoDensity: true,
    background: 0x0d4f3c, // Draconia green background (matches splash screen, changes per land)
    resizeTo: canvas.parentElement ?? window,
  });

  // Enable z-index sorting on the stage
  app.stage.sortableChildren = true;

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

  // Create asset manager and game start manager
  const assetManager = new AssetManager(app);

  // Preload assets before showing splash screen
  console.log('🎨 Preloading assets...');
  await assetManager.initialize();
  console.log('✅ Assets preloaded');

  const gameStartManager = new GameStartManager(app, assetManager, {
    showSplashScreen: true,
    showDraconiaMenu: true,
    autoStartJourney: false,
    skipProfiles: true, // Skip profile selection for testing
  });

  // Initialize the game start sequence (splash -> menu -> journey)
  await gameStartManager.initialize();

  // Add ticker callback to update game start manager (for splash screen fade-in/out animations)
  app.ticker.add((ticker) => {
    gameStartManager.update(ticker.deltaMS);
  });

  // Set up ResizeObserver to notify game systems when canvas resizes
  // This handles window resize, F12 DevTools, browser zoom, etc.
  const resizeObserver = new ResizeObserver(() => {
    // GameStartManager will propagate resize to all active systems
    gameStartManager.handleResize();
  });
  resizeObserver.observe(canvas.parentElement ?? canvas);

  const handle: PixiHandle = {
    app,
    gameStartManager,
    resize: () => {
      app.renderer.resize(canvas.clientWidth, canvas.clientHeight);
      gameStartManager.handleResize();
    },
    destroy: () => {
      document.removeEventListener('visibilitychange', applyVisibilityPolicy);
      resizeObserver.disconnect();
      bg.stop();
      gameStartManager.destroy();
      app.destroy(true, { children: true });
    },
  };
  return handle;
}
