/**
 * Fixed-timestep clock for simulation
 *
 * Implements an accumulator pattern to maintain consistent simulation timesteps
 * regardless of frame rate variations. Uses a 16.67ms timestep (~60Hz).
 */

export const STEP_MS = 16.6667;

/**
 * Fixed-timestep clock with accumulator pattern
 *
 * Ensures simulation runs at a consistent rate regardless of frame rate.
 * Uses accumulator pattern to handle variable frame times.
 */
export class StepClock {
  private last = 0;
  private acc = 0;

  /**
   * Creates a new step clock
   * @param now - Function to get current time (default: performance.now)
   */
  constructor(private _now: () => number = () => performance.now()) {}

  /**
   * Advances the clock and executes simulation steps
   * @param stepFn - Function to call for each simulation step
   * @param maxStepsPerFrame - Maximum steps to run per frame (prevents spiral of death)
   * @returns Information about the frame execution
   */
  tick(stepFn: (_dt: number) => void, maxStepsPerFrame = 5): { ran: number; acc: number } {
    const n = this._now();

    // Initialize last time on first call
    if (this.last === 0) {
      this.last = n;
    }

    // Calculate delta time and add to accumulator
    let delta = n - this.last;
    this.acc += delta;
    this.last = n;

    // Run simulation steps
    let ran = 0;
    while (this.acc >= STEP_MS && ran < maxStepsPerFrame) {
      stepFn(STEP_MS);
      this.acc -= STEP_MS;
      ran++;
    }

    return { ran, acc: this.acc };
  }

  /**
   * Resets the clock state
   */
  reset(): void {
    this.last = 0;
    this.acc = 0;
  }

  /**
   * Gets the current accumulator value
   */
  getAccumulator(): number {
    return this.acc;
  }

  /**
   * Gets the time since the last frame
   */
  getDeltaTime(): number {
    return this.now() - this.last;
  }
}
