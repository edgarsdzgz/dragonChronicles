/**
 * @file Core constants for Draconia Chronicles Engine
 * @description Phase 1 Story 1: Essential constants for timing, budgets, and system limits
 */

export const BUILD_VERSION = "__INJECTED_GIT_SHA__"; // replaced in CI

// Timing constants
export const DT_MS = 1000 / 60; // 16.666… ms (60 Hz)
export const BG_HZ = 2; // background tick rate (2 Hz)

// Entity limits
export const MAX_ENEMIES_DESKTOP = 200;
export const MAX_ENEMIES_MIDPHONE = 400;
export const MAX_PROJECTILES = 600;

// Snapshot and performance
export const SNAPSHOT_INTERVAL_MS = 1000; // 1 Hz snapshotting
export const PERF_BUDGET_SIM_MS = 4; // per-step p95

// Clock and accumulator limits
export const MAX_FRAME_TIME_MS = 250; // clamp to avoid spiral of death
export const MAX_STEPS_PER_FRAME = 8; // emergency step cap

// RNG constants
export const RNG_STREAM_NAMES = [
  'spawns',
  'crits', 
  'drops',
  'variance'
] as const;

// Message validation limits
export const MAX_OFFLINE_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
export const ABILITY_COOLDOWN_MS = 100; // minimum cooldown between abilities

// Performance monitoring
export const PERF_SAMPLE_SIZE = 100; // samples for p95 calculation
export const PERF_WARNING_THRESHOLD_MS = 8; // warn if step takes >8ms
