/**
 * Simulation engine for Draconia Chronicles
 *
 * Provides core simulation components including:
 * - Fixed-timestep clock and loop
 * - Simulation state management
 * - Worker-ready simulation components
 */

// Export core simulation components
export * from './core/clock.js';
export * from './core/loop.js';
export * from './core/state.js';

// Export enemy system components
export * from './enemies/types.js';
export * from './enemies/spawn-config.js';
export * from './enemies/enemy-pool.js';
export * from './enemies/pool-manager.js';
export * from './enemies/spawn-manager.js';

// Export combat system components
export * from './combat/elemental-system.js';
export * from './combat/dragon-health.js';
export * from './combat/types.js';
