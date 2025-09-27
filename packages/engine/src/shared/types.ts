/**
 * @file Core types for Draconia Chronicles Engine
 * @description Phase 1 Story 1: Entity types, message contracts, and simulation context
 */

import type { Family, AbilityId, LogLvl, SimMode, MessageType } from './enums.js';
import type { LandId, WardId } from './ids.js';

// Re-export types for external use
export type { LandId, WardId } from './ids.js';
export type { Family, AbilityId, LogLvl, SimMode, MessageType } from './enums.js';

/**
 * Core entity types (minimal for P1-S1)
 */

/**
 * Enemy entity with basic combat properties
 */
export type Enemy = {
  id: number;
  family: Family;
  hp: number;
  maxHp: number;
  spd: number; // units/s
  contactDmg: number;
  // Ranged extras optional for P1-S1
};

/**
 * Hot path projectile data using typed arrays for performance
 */
export type ProjectileHot = {
  x: Float32Array;
  y: Float32Array;
  vx: Float32Array;
  vy: Float32Array;
  ttl: Float32Array;
  dmg: Int32Array;
  // capacity fixed, indices pooled
};

/**
 * Simulation statistics for reporting
 */
export type SimStats = {
  fps: number;
  enemies: number;
  proj: number;
  dps: number;
};

/**
 * Simulation context (opaque to UI)
 */
export type SimCtx = {
  now: number; // ms since boot (sim time)
  seed: number;
  rng: Record<string, Rng>; // named streams (spawns, crits, drops)
  perf: { stepMsP95: number };
  // world refs (pools etc.) added later stories
};

/**
 * RNG interface for deterministic random number generation
 */
export interface Rng {
  nextU32(): number;
  nextFloat01(): number;
}

/**
 * Messaging contracts (Phase-1 minimal)
 */

/**
 * UI → Sim message types
 */
export type UiToSim =
  | { t: MessageType._Boot; seed: number; build: string }
  | { t: MessageType._Start; land: LandId; ward: WardId }
  | { t: MessageType._Stop }
  | { t: MessageType._Ability; id: AbilityId }
  | { t: MessageType._Offline; elapsedMs: number };

/**
 * Sim → UI message types
 */
export type SimToUi =
  | { t: MessageType._Ready }
  | { t: MessageType._Tick; now: number; stats: SimStats }
  | { t: MessageType._Log; lvl: LogLvl; msg: string }
  | { t: MessageType._Fatal; reason: string };

/**
 * Snapshot data for determinism verification
 */
export type Snapshot = {
  now: number;
  enemies: number;
  proj: number;
  fps: number;
};

/**
 * Performance monitoring data
 */
export type PerfData = {
  stepMsP95: number;
  frameTimeMs: number;
  stepsPerFrame: number;
  accumulatorMs: number;
};

/**
 * Clock state for timing management
 */
export type ClockState = {
  running: boolean;
  lastTime: number;
  accumulator: number;
  stepCount: number;
  frameCount: number;
};

/**
 * Engine configuration
 */
export type EngineConfig = {
  seed: number;
  build: string;
  mode: SimMode;
  maxStepsPerFrame: number;
  maxFrameTime: number;
};

/**
 * Validation context for message processing
 */
export type ValidationContext = {
  lastAbilityTime: number;
  bootTime: number;
  messageCount: number;
  errorCount: number;
};
