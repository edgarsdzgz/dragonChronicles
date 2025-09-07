/**
 * @file Simulation determinism tests for golden verification
 * @description Phase 1 Story 1: Integration tests for byte-equal determinism verification
 */

import { strict as assert } from 'assert';
import { test, run } from '../../tests/_tiny-runner.mjs';
import { createStandardStreams } from '../src/sim/rng/streams.js';
import { _FixedClock } from '../src/sim/clock/accumulator.js';
import { SnapshotWriter } from '../src/sim/snapshot/writer.js';
import { encodeSnapshotStream, _createSnapshot } from '../src/sim/protocol/codec.js';
import { hashSnapshotStream } from '../src/sim/snapshot/hasher.js';
import { _SNAPSHOT_INTERVAL_MS } from '../src/shared/constants.js';

// Golden test configuration
const GOLDEN_SEED = 123;
const GOLDEN_DURATION_MS = 60000; // 60 seconds
const GOLDEN_SNAPSHOT_INTERVAL = 1000; // 1 second

// Expected golden hash for 60-second run with seed 123
const _EXPECTED_GOLDEN_HASH = 'a1b2c3d4e5f67890'; // This would be the actual hash from a real run

test('simulation produces deterministic snapshots', () => {
  // Create two identical simulation runs
  const run1 = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);
  const run2 = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Both runs should produce identical snapshots
  assert.deepEqual(
    run1.snapshots,
    run2.snapshots,
    'Two runs with same seed should produce identical snapshots',
  );
  assert.equal(run1.hash, run2.hash, 'Two runs with same seed should produce identical hash');
});

test('simulation produces different snapshots for different seeds', () => {
  const run1 = createDeterministicRun(123, GOLDEN_DURATION_MS);
  const run2 = createDeterministicRun(456, GOLDEN_DURATION_MS);

  // Different seeds should produce different snapshots
  assert.notEqual(run1.hash, run2.hash, 'Different seeds should produce different hashes');
  assert.notDeepEqual(
    run1.snapshots,
    run2.snapshots,
    'Different seeds should produce different snapshots',
  );
});

test('simulation maintains timing precision', () => {
  const run = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Check that snapshots are taken at correct intervals
  for (let i = 1; i < run.snapshots.length; i++) {
    const prev = run.snapshots[i - 1];
    const curr = run.snapshots[i];
    const interval = curr.now - prev.now;

    assert.ok(
      interval >= GOLDEN_SNAPSHOT_INTERVAL - 10,
      `Snapshot interval should be close to ${GOLDEN_SNAPSHOT_INTERVAL}ms, got ${interval}ms`,
    );
    assert.ok(
      interval <= GOLDEN_SNAPSHOT_INTERVAL + 10,
      `Snapshot interval should be close to ${GOLDEN_SNAPSHOT_INTERVAL}ms, got ${interval}ms`,
    );
  }
});

test('simulation produces expected number of snapshots', () => {
  const run = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Should have approximately 60 snapshots (1 per second for 60 seconds)
  const expectedCount = Math.floor(GOLDEN_DURATION_MS / GOLDEN_SNAPSHOT_INTERVAL);
  assert.ok(
    run.snapshots.length >= expectedCount - 1,
    `Should have at least ${expectedCount - 1} snapshots`,
  );
  assert.ok(
    run.snapshots.length <= expectedCount + 1,
    `Should have at most ${expectedCount + 1} snapshots`,
  );
});

test('simulation maintains deterministic RNG sequences', () => {
  const run1 = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);
  const run2 = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Check that RNG sequences are identical
  assert.deepEqual(
    run1.rngSequence,
    run2.rngSequence,
    'RNG sequences should be identical for same seed',
  );
});

test('simulation handles clock precision correctly', () => {
  const run = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Check that clock maintains precision
  let maxDrift = 0;
  for (let i = 1; i < run.snapshots.length; i++) {
    const prev = run.snapshots[i - 1];
    const curr = run.snapshots[i];
    const expectedTime = prev.now + GOLDEN_SNAPSHOT_INTERVAL;
    const drift = Math.abs(curr.now - expectedTime);
    maxDrift = Math.max(maxDrift, drift);
  }

  assert.ok(maxDrift < 50, `Maximum clock drift should be less than 50ms, got ${maxDrift}ms`);
});

test('simulation produces consistent performance metrics', () => {
  const run = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Check that performance metrics are reasonable
  for (const snapshot of run.snapshots) {
    assert.ok(snapshot.fps >= 0, 'FPS should be non-negative');
    assert.ok(snapshot.fps <= 120, 'FPS should be reasonable');
    assert.ok(snapshot.enemies >= 0, 'Enemy count should be non-negative');
    assert.ok(snapshot.proj >= 0, 'Projectile count should be non-negative');
  }
});

test('simulation handles edge cases deterministically', () => {
  // Test with edge case seeds
  const edgeSeeds = [0, 1, 0xffffffff, 0x7fffffff];

  for (const seed of edgeSeeds) {
    const run1 = createDeterministicRun(seed, 10000); // 10 second run
    const run2 = createDeterministicRun(seed, 10000);

    assert.equal(
      run1.hash,
      run2.hash,
      `Edge case seed ${seed} should produce deterministic results`,
    );
  }
});

test('simulation produces byte-equal output across runs', () => {
  const run1 = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);
  const run2 = createDeterministicRun(GOLDEN_SEED, GOLDEN_DURATION_MS);

  // Encode both runs to strings
  const encoded1 = encodeSnapshotStream(run1.snapshots);
  const encoded2 = encodeSnapshotStream(run2.snapshots);

  // Strings should be byte-equal
  assert.equal(encoded1, encoded2, 'Encoded snapshots should be byte-equal');

  // Hashes should be identical
  const hash1 = hashSnapshotStream(encoded1);
  const hash2 = hashSnapshotStream(encoded2);
  assert.equal(hash1, hash2, 'Snapshot stream hashes should be identical');
});

// Helper function to create a deterministic simulation run (synchronous version)

// For testing purposes, we'll create a synchronous version
function createDeterministicRunSync(
  seed: number,
  durationMs: number,
): {
  snapshots: unknown[];
  hash: string;
  rngSequence: number[];
} {
  const streams = createStandardStreams(seed);
  const snapshotWriter = new SnapshotWriter(GOLDEN_SNAPSHOT_INTERVAL);
  const rngSequence: number[] = [];

  let currentTime = 0;
  let _stepCount = 0;

  // Simulation step function
  const step = (dtMs: number) => {
    currentTime += dtMs;
    _stepCount++;

    // Use RNG to generate deterministic values
    const spawnsRng = streams.get('spawns');
    const varianceRng = streams.get('variance');

    // Generate some deterministic values
    const enemyCount = 5 + (spawnsRng.nextU32() % 10);
    const projectileCount = 10 + (varianceRng.nextU32() % 20);
    const fps = 60 - (varianceRng.nextU32() % 5);

    // Record RNG values for verification
    rngSequence.push(spawnsRng.nextU32());

    // Record snapshot if interval has passed
    snapshotWriter.recordSnapshot(currentTime, enemyCount, projectileCount, fps);
  };

  // Start recording
  snapshotWriter.start(0);

  // Run simulation for specified duration (simplified)
  const steps = Math.floor(durationMs / 16.67); // Approximate 60Hz
  for (let i = 0; i < steps; i++) {
    step(16.67);
  }

  snapshotWriter.stop();

  const snapshots = snapshotWriter.getSnapshots();
  const hash = snapshotWriter.getStreamHash();

  return {
    snapshots,
    hash,
    rngSequence,
  };
}

// Use the synchronous version for testing
const createDeterministicRun = createDeterministicRunSync;

await run();
