/**
 * @file Draconia Chronicles Engine - Core Types, Constants, and Determinism
 * @description Phase 1 Story 1: Core simulation engine with deterministic RNG, fixed clock, and message contracts
 */

// Export shared types and constants
export * from './shared/constants.js';
export * from './shared/enums.js';
export * from './shared/ids.js';
export * from './shared/types.js';
export { ValidationContext } from './shared/validation.js';

// Export RNG system
export * from './sim/rng/pcg32.js';
export * from './sim/rng/seed.js';
export * from './sim/rng/streams.js';

// Export clock system
export * from './sim/clock/accumulator.js';
export * from './sim/clock/bgTick.js';

// Export protocol system
export * from './sim/protocol/uiToSim.js';
export * from './sim/protocol/simToUi.js';
export * from './sim/protocol/codec.js';

// Export snapshot system
export * from './sim/snapshot/writer.js';
export * from './sim/snapshot/hasher.js';

// Export main engine API
export * from './engine.js';
