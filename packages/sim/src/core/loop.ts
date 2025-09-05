/**
 * Simulation loop with foreground and background modes
 *
 * Handles different simulation modes:
 * - Foreground: Full-rate simulation using requestAnimationFrame
 * - Background: 2Hz simulation using setInterval
 */

import { STEP_MS, StepClock } from './clock.js';
import type { SimMode } from '@draconia/shared';

/**
 * Simulation loop with mode-aware execution
 *
 * Provides different execution strategies for foreground and background modes
 * with proper throttling to prevent message spam.
 */
export class SimLoop {
  private clock = new StepClock();
  private rafId: number | null = null;
  private tId: NodeJS.Timeout | null = null;
  private mode: SimMode = 'fg';
  private isRunning = false;

  /**
   * Creates a new simulation loop
   * @param onStep - Function called for each simulation step
   * @param onBeat - Function called when simulation produces output (throttled)
   */
  constructor(
    // eslint-disable-next-line no-unused-vars
    private onStep: (_dt: number) => void,
    // eslint-disable-next-line no-unused-vars
    private onBeat: (_covered: number, _mode: SimMode) => void
  ) {}

  /**
   * Starts the simulation loop in the current mode
   */
  start(): void {
    if (this.isRunning) return;

    this.isRunning = true;
    this.mode === 'fg' ? this.startFg() : this.startBg();
  }

  /**
   * Stops the simulation loop
   */
  stop(): void {
    this.isRunning = false;

    if (this.rafId != null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    if (this.tId != null) {
      clearInterval(this.tId);
      this.tId = null;
    }
  }

  /**
   * Changes the simulation mode
   * @param mode - New simulation mode
   */
  setMode(mode: SimMode): void {
    if (this.mode === mode) return;

    this.stop();
    this.mode = mode;
    this.start();
  }

  /**
   * Gets the current simulation mode
   */
  getMode(): SimMode {
    return this.mode;
  }

  /**
   * Checks if the simulation is currently running
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Starts foreground mode using requestAnimationFrame
   */
  private startFg(): void {
    const frame = () => {
      if (!this.isRunning) return;

      const { ran } = this.clock.tick(this.onStep);

      // Only send beat if we actually ran steps
      if (ran > 0) {
        this.onBeat(ran * STEP_MS, 'fg');
      }

      this.rafId = requestAnimationFrame(frame);
    };

    this.rafId = requestAnimationFrame(frame);
  }

  /**
   * Starts background mode using setInterval at 2Hz
   */
  private startBg(): void {
    this.tId = setInterval(() => {
      if (!this.isRunning) return;

      let covered = 0;
      const steps = Math.round(500 / STEP_MS); // 500ms = 2Hz

      // Run multiple steps to simulate the time that passed
      for (let i = 0; i < steps; i++) {
        this.onStep(STEP_MS);
        covered += STEP_MS;
      }

      this.onBeat(covered, 'bg');
    }, 500); // 2Hz = 500ms intervals
  }
}
