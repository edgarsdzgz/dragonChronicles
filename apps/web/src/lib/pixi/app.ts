import { Application } from 'pixi.js';
import { clampDPR } from './dpr';
import { createBackgroundSim, type BgSimHandle } from '../sim/background';

export type PixiHandle = {
  app: Application;
  resize: () => void;
  destroy: () => void;
};

export async function mountPixi(canvas: HTMLCanvasElement): Promise<PixiHandle> {
  const dpr = clampDPR();
  const app = new Application({
    view: canvas,
    antialias: false,
    resolution: dpr,
    autoDensity: true,
    backgroundAlpha: 0
  });
  await app.init({ resizeTo: canvas.parentElement ?? window });

  // New: render-only pause; keep background sim running while hidden
  const bg: BgSimHandle = createBackgroundSim(2); // 2 Hz is thrifty and predictable

  const applyVisibilityPolicy = () => {
    if (document.hidden) {
      if (!app.ticker.stopped) app.ticker.stop(); // pause rendering/GPU
      bg.start();                                  // continue simulation (lightweight)
    } else {
      bg.stop();                                   // foreground sim handled by ticker/W3 later
      if (app.ticker.stopped) app.ticker.start();  // resume rendering/GPU
    }
  };

  document.addEventListener('visibilitychange', applyVisibilityPolicy);
  // also apply once on mount to honor current state
  applyVisibilityPolicy();

  const handle: PixiHandle = {
    app,
    resize: () => app.renderer.resize(canvas.clientWidth, canvas.clientHeight),
    destroy: () => {
      document.removeEventListener('visibilitychange', applyVisibilityPolicy);
      bg.stop();
      app.destroy(true, { children: true });
    }
  };
  return handle;
}