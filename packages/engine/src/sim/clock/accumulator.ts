/**
 * @file Fixed-timestep clock with accumulator pattern
 * @description Phase 1 Story 1: Ensures simulation runs at consistent rate regardless of frame rate
 */

import { DT_MS, MAX_FRAME_TIME_MS, MAX_STEPS_PER_FRAME } from '../../shared/constants.js';
import type { ClockState } from '../../shared/types.js';

/**
 * Fixed-timestep clock with accumulator pattern
 * 
 * Ensures simulation runs at a consistent rate regardless of frame rate.
 * Uses accumulator pattern to handle variable frame times while maintaining
 * deterministic simulation steps.
 */
export class FixedClock {
  private state: ClockState;
  private stepCallback: (dtMs: number) => void;
  private getNowMs: () => number;

  /**
   * Creates a new fixed clock
   * @param stepCallback - Function to call for each simulation step
   * @param getNowMs - Function to get current time in milliseconds
   */
  constructor(
    stepCallback: (dtMs: number) => void,
    getNowMs: () => number = () => performance.now()
  ) {
    this.stepCallback = stepCallback;
    this.getNowMs = getNowMs;
    
    this.state = {
      running: false,
      lastTime: 0,
      accumulator: 0,
      stepCount: 0,
      frameCount: 0
    };
  }

  /**
   * Starts the clock
   */
  start(): void {
    if (this.state.running) {
      return;
    }
    
    this.state.running = true;
    this.state.lastTime = this.getNowMs();
    this.state.accumulator = 0;
    this.state.stepCount = 0;
    this.state.frameCount = 0;
    
    this.scheduleNextFrame();
  }

  /**
   * Stops the clock
   */
  stop(): void {
    this.state.running = false;
  }

  /**
   * Resets the clock state
   */
  reset(): void {
    this.stop();
    this.state.lastTime = 0;
    this.state.accumulator = 0;
    this.state.stepCount = 0;
    this.state.frameCount = 0;
  }

  /**
   * Gets the current clock state
   * @returns Current clock state
   */
  getState(): ClockState {
    return { ...this.state };
  }

  /**
   * Gets the current accumulator value
   * @returns Accumulator value in milliseconds
   */
  getAccumulator(): number {
    return this.state.accumulator;
  }

  /**
   * Gets the number of steps executed
   * @returns Total step count
   */
  getStepCount(): number {
    return this.state.stepCount;
  }

  /**
   * Gets the number of frames processed
   * @returns Total frame count
   */
  getFrameCount(): number {
    return this.state.frameCount;
  }

  /**
   * Checks if the clock is running
   * @returns True if running, false otherwise
   */
  isRunning(): boolean {
    return this.state.running;
  }

  /**
   * Schedules the next frame
   */
  private scheduleNextFrame(): void {
    if (!this.state.running) {
      return;
    }

    // Use queueMicrotask for immediate execution in the current event loop
    queueMicrotask(() => this.tick());
  }

  /**
   * Processes one frame
   */
  private tick(): void {
    if (!this.state.running) {
      return;
    }

    const now = this.getNowMs();
    let frameTime = now - this.state.lastTime;
    this.state.lastTime = now;

    // Clamp frame time to avoid spiral of death
    if (frameTime > MAX_FRAME_TIME_MS) {
      frameTime = MAX_FRAME_TIME_MS;
    }

    this.state.accumulator += frameTime;
    this.state.frameCount++;

    // Execute simulation steps
    let stepsThisFrame = 0;
    while (this.state.accumulator >= DT_MS && stepsThisFrame < MAX_STEPS_PER_FRAME) {
      this.stepCallback(DT_MS);
      this.state.accumulator -= DT_MS;
      this.state.stepCount++;
      stepsThisFrame++;
    }

    // Emergency brake: if we're still behind, drop frames
    if (this.state.accumulator >= DT_MS) {
      this.state.accumulator = 0;
    }

    // Schedule next frame
    this.scheduleNextFrame();
  }

  /**
   * Manually advances the clock by one step (for testing)
   * @param dtMs - Time delta for the step
   */
  step(dtMs: number = DT_MS): void {
    this.stepCallback(dtMs);
    this.state.stepCount++;
  }

  /**
   * Advances the clock by multiple steps (for testing)
   * @param steps - Number of steps to advance
   * @param dtMs - Time delta per step
   */
  advance(steps: number, dtMs: number = DT_MS): void {
    for (let i = 0; i < steps; i++) {
      this.step(dtMs);
    }
  }
}

/**
 * Creates a new fixed clock instance
 * @param stepCallback - Function to call for each simulation step
 * @param getNowMs - Function to get current time in milliseconds
 * @returns New FixedClock instance
 */
export function createFixedClock(
  stepCallback: (dtMs: number) => void,
  getNowMs?: () => number
): FixedClock {
  return new FixedClock(stepCallback, getNowMs);
}
