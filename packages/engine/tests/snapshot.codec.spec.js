/**
 * @file Snapshot codec tests for determinism verification
 * @description Phase 1 Story 1: Unit tests for snapshot encoding, decoding, and hashing
 */
import { strict as assert } from 'assert';
import { test, run } from '../../tests/_tiny-runner.mjs';
import { encodeSnapshot, decodeSnapshot, encodeSnapshotStream, decodeSnapshotStream, validateSnapshot, createSnapshot, snapshotsEqual, getSnapshotDiff, formatSnapshot, SnapshotStreamWriter } from '../src/sim/protocol/codec.js';
import { hash64, hashSnapshotStream, FastHasher, HashComparator } from '../src/sim/snapshot/hasher.js';
import { SnapshotWriter, GoldenTestManager } from '../src/sim/snapshot/writer.js';
// Test data
const TEST_SNAPSHOT = {
    now: 1000,
    enemies: 5,
    proj: 10,
    fps: 60
};
const TEST_SNAPSHOTS = [
    { now: 1000, enemies: 5, proj: 10, fps: 60 },
    { now: 2000, enemies: 8, proj: 15, fps: 58 },
    { now: 3000, enemies: 12, proj: 20, fps: 55 }
];
test('encodeSnapshot produces correct format', () => {
    const encoded = encodeSnapshot(TEST_SNAPSHOT);
    assert.equal(encoded, '1000|5|10|60', 'Encoded snapshot should match expected format');
});
test('decodeSnapshot parses correct format', () => {
    const encoded = '1000|5|10|60';
    const decoded = decodeSnapshot(encoded);
    assert.deepEqual(decoded, TEST_SNAPSHOT, 'Decoded snapshot should match original');
});
test('encodeSnapshot handles edge cases', () => {
    const edgeSnapshot = {
        now: 0,
        enemies: 0,
        proj: 0,
        fps: 0
    };
    const encoded = encodeSnapshot(edgeSnapshot);
    assert.equal(encoded, '0|0|0|0', 'Edge case snapshot should encode correctly');
    const decoded = decodeSnapshot(encoded);
    assert.deepEqual(decoded, edgeSnapshot, 'Edge case snapshot should decode correctly');
});
test('decodeSnapshot handles invalid format', () => {
    assert.throws(() => decodeSnapshot('invalid'), 'Invalid format should throw');
    assert.throws(() => decodeSnapshot('1|2'), 'Incomplete format should throw');
    assert.throws(() => decodeSnapshot('1|2|3|4|5'), 'Too many parts should throw');
    assert.throws(() => decodeSnapshot('1|2|3|invalid'), 'Non-numeric values should throw');
});
test('encodeSnapshotStream works correctly', () => {
    const encoded = encodeSnapshotStream(TEST_SNAPSHOTS);
    const expected = '1000|5|10|60\n2000|8|15|58\n3000|12|20|55';
    assert.equal(encoded, expected, 'Encoded stream should match expected format');
});
test('decodeSnapshotStream works correctly', () => {
    const encoded = '1000|5|10|60\n2000|8|15|58\n3000|12|20|55';
    const decoded = decodeSnapshotStream(encoded);
    assert.deepEqual(decoded, TEST_SNAPSHOTS, 'Decoded stream should match original');
});
test('decodeSnapshotStream handles empty input', () => {
    const decoded = decodeSnapshotStream('');
    assert.deepEqual(decoded, [], 'Empty input should return empty array');
    const decodedWhitespace = decodeSnapshotStream('   \n  \n  ');
    assert.deepEqual(decodedWhitespace, [], 'Whitespace-only input should return empty array');
});
test('validateSnapshot works correctly', () => {
    // Valid snapshot
    assert.equal(validateSnapshot(TEST_SNAPSHOT), true, 'Valid snapshot should pass validation');
    // Invalid snapshots
    assert.equal(validateSnapshot(null), false, 'Null snapshot should fail validation');
    assert.equal(validateSnapshot(undefined), false, 'Undefined snapshot should fail validation');
    assert.equal(validateSnapshot('not an object'), false, 'Non-object snapshot should fail validation');
    assert.equal(validateSnapshot({ now: 'invalid', enemies: 5, proj: 10, fps: 60 }), false, 'Invalid now should fail validation');
    assert.equal(validateSnapshot({ now: 1000, enemies: NaN, proj: 10, fps: 60 }), false, 'NaN enemies should fail validation');
    assert.equal(validateSnapshot({ now: 1000, enemies: 5, proj: 10, fps: Infinity }), false, 'Infinity fps should fail validation');
});
test('createSnapshot works correctly', () => {
    const snapshot = createSnapshot(1000.5, 5.7, 10.2, 60.8);
    assert.equal(snapshot.now, 1000, 'Now should be floored');
    assert.equal(snapshot.enemies, 5, 'Enemies should be floored');
    assert.equal(snapshot.proj, 10, 'Projectiles should be floored');
    assert.equal(snapshot.fps, 61, 'FPS should be rounded');
});
test('snapshotsEqual works correctly', () => {
    const snapshot1 = { now: 1000, enemies: 5, proj: 10, fps: 60 };
    const snapshot2 = { now: 1000, enemies: 5, proj: 10, fps: 60 };
    const snapshot3 = { now: 1000, enemies: 5, proj: 10, fps: 61 };
    assert.equal(snapshotsEqual(snapshot1, snapshot2), true, 'Identical snapshots should be equal');
    assert.equal(snapshotsEqual(snapshot1, snapshot3), false, 'Different snapshots should not be equal');
});
test('getSnapshotDiff works correctly', () => {
    const snapshot1 = { now: 1000, enemies: 5, proj: 10, fps: 60 };
    const snapshot2 = { now: 2000, enemies: 8, proj: 15, fps: 58 };
    const diff = getSnapshotDiff(snapshot1, snapshot2);
    assert.equal(diff.now, 1000, 'Time diff should be correct');
    assert.equal(diff.enemies, 3, 'Enemies diff should be correct');
    assert.equal(diff.proj, 5, 'Projectiles diff should be correct');
    assert.equal(diff.fps, -2, 'FPS diff should be correct');
});
test('formatSnapshot works correctly', () => {
    const formatted = formatSnapshot(TEST_SNAPSHOT);
    assert.equal(formatted, 't=1000ms enemies=5 proj=10 fps=60', 'Formatted snapshot should match expected format');
});
test('SnapshotStreamWriter works correctly', () => {
    const writer = new SnapshotStreamWriter(1000);
    // Start recording
    writer.start(0);
    assert.equal(writer.isActive(), true, 'Writer should be active after start');
    // Record snapshots
    const recorded1 = writer.recordSnapshot(500, 5, 10, 60);
    assert.equal(recorded1, false, 'Should not record before interval');
    const recorded2 = writer.recordSnapshot(1000, 5, 10, 60);
    assert.equal(recorded2, true, 'Should record after interval');
    const recorded3 = writer.recordSnapshot(1500, 8, 15, 58);
    assert.equal(recorded3, false, 'Should not record before next interval');
    const recorded4 = writer.recordSnapshot(2000, 8, 15, 58);
    assert.equal(recorded4, true, 'Should record after next interval');
    // Check results
    const snapshots = writer.getSnapshots();
    assert.equal(snapshots.length, 2, 'Should have recorded 2 snapshots');
    assert.equal(snapshots[0].now, 1000, 'First snapshot should have correct time');
    assert.equal(snapshots[1].now, 2000, 'Second snapshot should have correct time');
    // Check encoded stream
    const encoded = writer.getEncodedStream();
    assert.ok(encoded.includes('1000|5|10|60'), 'Encoded stream should contain first snapshot');
    assert.ok(encoded.includes('2000|8|15|58'), 'Encoded stream should contain second snapshot');
    // Stop recording
    writer.stop();
    assert.equal(writer.isActive(), false, 'Writer should be inactive after stop');
});
test('hash64 produces consistent results', () => {
    const input = 'test string';
    const hash1 = hash64(input);
    const hash2 = hash64(input);
    assert.equal(hash1, hash2, 'Same input should produce same hash');
    assert.equal(hash1.length, 16, 'Hash should be 16 characters (64 bits)');
    assert.ok(/^[0-9a-f]+$/i.test(hash1), 'Hash should be hexadecimal');
});
test('hash64 produces different results for different inputs', () => {
    const hash1 = hash64('test string 1');
    const hash2 = hash64('test string 2');
    assert.notEqual(hash1, hash2, 'Different inputs should produce different hashes');
});
test('hashSnapshotStream works correctly', () => {
    const stream = '1000|5|10|60\n2000|8|15|58\n3000|12|20|55';
    const hash = hashSnapshotStream(stream);
    assert.equal(hash.length, 16, 'Stream hash should be 16 characters');
    assert.ok(/^[0-9a-f]+$/i.test(hash), 'Stream hash should be hexadecimal');
});
test('FastHasher handles edge cases', () => {
    // Empty string
    const emptyHash = FastHasher.hash64('');
    assert.equal(emptyHash.length, 16, 'Empty string hash should be 16 characters');
    // Very long string
    const longString = 'a'.repeat(10000);
    const longHash = FastHasher.hash64(longString);
    assert.equal(longHash.length, 16, 'Long string hash should be 16 characters');
    // Multiple strings
    const multipleHash = FastHasher.hash64Multiple(['test1', 'test2', 'test3']);
    assert.equal(multipleHash.length, 16, 'Multiple strings hash should be 16 characters');
});
test('HashComparator works correctly', () => {
    const hash1 = '1234567890abcdef';
    const hash2 = '1234567890abcdef';
    const hash3 = '1234567890abcde0';
    assert.equal(HashComparator.equal(hash1, hash2), true, 'Identical hashes should be equal');
    assert.equal(HashComparator.equal(hash1, hash3), false, 'Different hashes should not be equal');
    assert.equal(HashComparator.equal(hash1.toUpperCase(), hash2), true, 'Case should not matter');
    const diff = HashComparator.diff(hash1, hash3);
    assert.equal(diff.equal, false, 'Diff should show hashes are not equal');
    assert.equal(diff.length1, 16, 'Hash 1 should be 16 characters');
    assert.equal(diff.length2, 16, 'Hash 2 should be 16 characters');
});
test('SnapshotWriter works correctly', () => {
    const writer = new SnapshotWriter(1000);
    // Start recording
    writer.start(0);
    // Record snapshots
    writer.recordSnapshot(1000, 5, 10, 60);
    writer.recordSnapshot(2000, 8, 15, 58);
    writer.recordSnapshot(3000, 12, 20, 55);
    // Check results
    assert.equal(writer.getCount(), 3, 'Should have recorded 3 snapshots');
    assert.equal(writer.getDuration(), 3000, 'Duration should be 3000ms');
    // Check hash
    const hash = writer.getStreamHash();
    assert.equal(hash.length, 16, 'Stream hash should be 16 characters');
    // Check exports
    const ndjson = writer.exportNDJSON();
    assert.ok(ndjson.includes('"now":1000'), 'NDJSON should contain first snapshot');
    const csv = writer.exportCSV();
    assert.ok(csv.includes('1000,5,10,60'), 'CSV should contain first snapshot');
    // Clear and check
    writer.clear();
    assert.equal(writer.getCount(), 0, 'Should have 0 snapshots after clear');
    assert.equal(writer.isActive(), false, 'Should be inactive after clear');
});
test('GoldenTestManager works correctly', () => {
    const manager = new GoldenTestManager();
    const writer = new SnapshotWriter(1000);
    // Set expected data
    const expectedHash = '1234567890abcdef';
    const expectedSnapshots = [
        { now: 1000, enemies: 5, proj: 10, fps: 60 },
        { now: 2000, enemies: 8, proj: 15, fps: 58 }
    ];
    manager.setExpectedHash(expectedHash);
    manager.setExpectedSnapshots(expectedSnapshots);
    // Test with matching data
    writer.start(0);
    writer.recordSnapshot(1000, 5, 10, 60);
    writer.recordSnapshot(2000, 8, 15, 58);
    // Mock the hash to match expected
    const originalGetStreamHash = writer.getStreamHash;
    writer.getStreamHash = () => expectedHash;
    const result1 = manager.validate(writer);
    assert.equal(result1.valid, true, 'Matching data should be valid');
    assert.equal(result1.hashMatch, true, 'Hash should match');
    assert.equal(result1.snapshotMatch, true, 'Snapshots should match');
    assert.equal(result1.errors.length, 0, 'Should have no errors');
    // Test with mismatching data
    writer.clear();
    writer.recordSnapshot(1000, 5, 10, 60);
    writer.recordSnapshot(2000, 8, 15, 59); // Different fps
    const result2 = manager.validate(writer);
    assert.equal(result2.valid, false, 'Mismatching data should be invalid');
    assert.equal(result2.snapshotMatch, false, 'Snapshots should not match');
    assert.ok(result2.errors.length > 0, 'Should have errors');
    // Restore original method
    writer.getStreamHash = originalGetStreamHash;
});
await run();
