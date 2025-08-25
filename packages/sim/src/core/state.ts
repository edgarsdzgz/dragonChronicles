/**
 * Minimal simulation state and stepping logic
 *
 * Provides basic simulation state management and stepping functions.
 * This is a placeholder implementation that will be expanded in Phase 1.
 */

/**
 * Simulation state structure
 *
 * Contains the current state of the simulation.
 * This is a minimal implementation for W3, to be expanded in Phase 1.
 */
export type SimState = {
  enemies: number;
  proj: number;
  seed: bigint;
  time: number;
};

/**
 * Creates initial simulation state
 * @param seed - The seed for deterministic simulation
 * @returns Initial simulation state
 */
export function createInitial(seed: bigint): SimState {
  return {
    enemies: 0,
    proj: 0,
    seed,
    time: 0
  };
}

/**
 * Steps the simulation forward by the given time delta
 * @param state - Current simulation state
 * @param dtMs - Time delta in milliseconds
 * @returns New simulation state
 */
export function step(state: SimState, dtMs: number): SimState {
  // Placeholder implementation: just advance time and increment counters
  // This will be replaced with actual gameplay logic in Phase 1

  return {
    ...state,
    time: state.time + dtMs,
    enemies: state.enemies + Math.floor(dtMs / 1000), // +1 enemy per second
    proj: state.proj + Math.floor(dtMs / 500)         // +1 projectile per 0.5 seconds
  };
}

/**
 * Gets simulation statistics for reporting
 * @param state - Current simulation state
 * @returns Simulation statistics
 */
export function getStats(state: SimState): { enemies: number; proj: number } {
  return {
    enemies: state.enemies,
    proj: state.proj
  };
}

/**
 * Creates a copy of the simulation state
 * @param state - State to copy
 * @returns New state object
 */
export function cloneState(state: SimState): SimState {
  return { ...state };
}
