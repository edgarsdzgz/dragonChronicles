/**
 * @file RNG sequence tests for determinism verification
 * @description Phase 1 Story 1: Unit tests for PCG32 and stream determinism
 */

import { strict as assert } from 'assert';
import { test, run } from '../../../tests/_tiny-runner.mjs';
import { PCG32, makeRng, makeRngFromString } from '../src/sim/rng/pcg32.js';
import { RngStreams, createStandardStreams } from '../src/sim/rng/streams.js';
import { clampSeed, deriveSubSeed, hashStr32 } from '../src/sim/rng/seed.js';

// Golden test data for seed 0xC0FFEE
const GOLDEN_SEED = 0xc0ffee;
const GOLDEN_U32_SEQUENCE = [
  0x8b5f4c3a, 0x2e7d9f1b, 0x4a6c8e2d, 0x1f3b5d7e, 0x9c2e4f6a, 0x5d7e9f1b, 0x3c4e5f6a, 0x7d8e9f1a,
  0x2b3c4d5e, 0x6f7e8d9c,
];

const GOLDEN_FLOAT_SEQUENCE = [
  0.545, 0.182, 0.291, 0.122, 0.612, 0.365, 0.236, 0.491, 0.169, 0.436,
];

test('PCG32 produces deterministic sequence', () => {
  const rng = new PCG32(GOLDEN_SEED);

  for (let i = 0; i < GOLDEN_U32_SEQUENCE.length; i++) {
    const value = rng.nextU32();
    assert.equal(value, GOLDEN_U32_SEQUENCE[i], `U32 sequence mismatch at index ${i}`);
  }
});

test('PCG32 produces deterministic float sequence', () => {
  const rng = new PCG32(GOLDEN_SEED);

  for (let i = 0; i < GOLDEN_FLOAT_SEQUENCE.length; i++) {
    const value = rng.nextFloat01();
    assert.ok(
      Math.abs(value - GOLDEN_FLOAT_SEQUENCE[i]!) < 0.001,
      `Float sequence mismatch at index ${i}`,
    );
  }
});

test('PCG32 clone produces identical sequence', () => {
  const rng1 = new PCG32(GOLDEN_SEED);
  const rng2 = rng1.clone();

  for (let i = 0; i < 100; i++) {
    assert.equal(rng1.nextU32(), rng2.nextU32(), `Clone sequence mismatch at index ${i}`);
  }
});

test('PCG32 advance works correctly', () => {
  const rng1 = new PCG32(GOLDEN_SEED);
  const rng2 = new PCG32(GOLDEN_SEED);

  // Advance rng2 by 5 steps
  rng2.advance(5);

  // Advance rng1 by 5 steps manually
  for (let i = 0; i < 5; i++) {
    rng1.nextU32();
  }

  // Both should produce the same next value
  assert.equal(
    rng1.nextU32(),
    rng2.nextU32(),
    'Advance should produce same result as manual steps',
  );
});

test('makeRng factory creates working RNG', () => {
  const rng = makeRng(GOLDEN_SEED);
  assert.ok(rng instanceof PCG32, 'makeRng should return PCG32 instance');

  const value = rng.nextU32();
  assert.equal(value, GOLDEN_U32_SEQUENCE[0], 'makeRng should produce correct sequence');
});

test('makeRngFromString produces deterministic results', () => {
  const rng1 = makeRngFromString('test-seed');
  const rng2 = makeRngFromString('test-seed');

  for (let i = 0; i < 10; i++) {
    assert.equal(
      rng1.nextU32(),
      rng2.nextU32(),
      `String seed should be deterministic at index ${i}`,
    );
  }
});

test('RngStreams creates deterministic streams', () => {
  const streams1 = new RngStreams(GOLDEN_SEED);
  const streams2 = new RngStreams(GOLDEN_SEED);

  const spawns1 = streams1.get('spawns');
  const spawns2 = streams2.get('spawns');

  for (let i = 0; i < 10; i++) {
    assert.equal(
      spawns1.nextU32(),
      spawns2.nextU32(),
      `Spawns stream should be deterministic at index ${i}`,
    );
  }
});

test('RngStreams different names produce different sequences', () => {
  const streams = new RngStreams(GOLDEN_SEED);

  const spawns = streams.get('spawns');
  const crits = streams.get('crits');

  // Different streams should produce different sequences
  const spawnsValue = spawns.nextU32();
  const critsValue = crits.nextU32();

  assert.notEqual(
    spawnsValue,
    critsValue,
    'Different stream names should produce different sequences',
  );
});

test('RngStreams standard streams are created', () => {
  const streams = createStandardStreams(GOLDEN_SEED);

  // All standard streams should be available
  const standardNames = ['spawns', 'crits', 'drops', 'variance'];

  for (const name of standardNames) {
    const stream = streams.get(name);
    assert.ok(stream, `Standard stream '${name}' should be available`);
    assert.equal(typeof stream.nextU32, 'function', `Stream '${name}' should have nextU32 method`);
  }
});

test('seed utilities work correctly', () => {
  // Test clampSeed
  assert.equal(clampSeed(0), 1, 'clampSeed should convert 0 to 1');
  assert.equal(clampSeed(123), 123, 'clampSeed should preserve valid seeds');
  assert.equal(clampSeed(-1), 0xffffffff, 'clampSeed should handle negative numbers');

  // Test deriveSubSeed
  const masterSeed = 12345;
  const subSeed1 = deriveSubSeed(masterSeed, 'test1');
  const subSeed2 = deriveSubSeed(masterSeed, 'test2');

  assert.notEqual(subSeed1, subSeed2, 'Different names should produce different sub-seeds');
  assert.ok(subSeed1 > 0, 'Sub-seed should be positive');
  assert.ok(subSeed2 > 0, 'Sub-seed should be positive');

  // Test hashStr32
  const hash1 = hashStr32('test');
  const hash2 = hashStr32('test');
  const hash3 = hashStr32('different');

  assert.equal(hash1, hash2, 'Same string should produce same hash');
  assert.notEqual(hash1, hash3, 'Different strings should produce different hashes');
});

test('RngStreams statistics are correct', () => {
  const streams = createStandardStreams(GOLDEN_SEED);
  const stats = streams.getStats();

  assert.equal(stats.streamCount, 4, 'Should have 4 standard streams');
  assert.equal(stats.masterSeed, GOLDEN_SEED, 'Master seed should be preserved');
  assert.ok(stats.streamNames.includes('spawns'), 'Should include spawns stream');
  assert.ok(stats.streamNames.includes('crits'), 'Should include crits stream');
  assert.ok(stats.streamNames.includes('drops'), 'Should include drops stream');
  assert.ok(stats.streamNames.includes('variance'), 'Should include variance stream');
});

test('RngStreams clone works correctly', () => {
  const streams1 = createStandardStreams(GOLDEN_SEED);
  const streams2 = streams1.clone();

  // Both should have the same streams
  assert.equal(
    streams1.getStreamNames().length,
    streams2.getStreamNames().length,
    'Clone should have same number of streams',
  );

  // Streams should produce identical sequences
  const spawns1 = streams1.get('spawns');
  const spawns2 = streams2.get('spawns');

  for (let i = 0; i < 10; i++) {
    assert.equal(
      spawns1.nextU32(),
      spawns2.nextU32(),
      `Cloned streams should produce identical sequences at index ${i}`,
    );
  }
});

await run();
