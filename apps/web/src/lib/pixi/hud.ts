export type FpsSample = { fps: number; frames: number; timeMs: number };

export class FpsCounter {
  private last = performance.now();
  private frames = 0;

  sample(): FpsSample {
    this.frames++;
    const now = performance.now();
    const dt = now - this.last;
    if (dt >= 1000) {
      const fps = (this.frames * 1000) / dt;
      const out = { fps, frames: this.frames, timeMs: dt };
      this.frames = 0; 
      this.last = now;
      return out;
    }
    return { fps: 0, frames: this.frames, timeMs: dt };
  }
}