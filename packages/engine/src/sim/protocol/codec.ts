/**
 * @file Snapshot encoding and decoding for determinism verification
 * @description Phase 1 Story 1: Compact serialization format for byte-equal determinism testing
 */

import type { Snapshot } from '../../shared/types.js';

/**
 * Encodes a snapshot to a compact string format
 * @param snapshot - Snapshot data to encode
 * @returns Encoded snapshot string
 */
export function encodeSnapshot(snapshot: Snapshot): string {
  const { now, enemies, proj, fps } = snapshot;

  // Use pipe-separated format with integer coercion for determinism
  return `${Math.floor(now)}|${enemies}|${proj}|${Math.round(fps)}`;
}

/**
 * Decodes a snapshot from a string format
 * @param encoded - Encoded snapshot string
 * @returns Decoded snapshot data
 */
export function decodeSnapshot(encoded: string): Snapshot {
  const parts = encoded.split('|');

  if (parts.length !== 4) {
    throw new Error(`Invalid snapshot format: expected 4 parts, got ${parts.length}`);
  }

  const [nowStr, enemiesStr, projStr, fpsStr] = parts;

  if (!nowStr || !enemiesStr || !projStr || !fpsStr) {
    throw new Error('Invalid snapshot format: missing parts');
  }

  return {
    now: parseInt(nowStr, 10),
    enemies: parseInt(enemiesStr, 10),
    proj: parseInt(projStr, 10),
    fps: parseInt(fpsStr, 10),
  };
}

/**
 * Encodes multiple snapshots to a stream format
 * @param snapshots - Array of snapshots to encode
 * @returns Encoded snapshot stream
 */
export function encodeSnapshotStream(snapshots: Snapshot[]): string {
  return snapshots.map(encodeSnapshot).join('\n');
}

/**
 * Decodes a snapshot stream from a string format
 * @param encoded - Encoded snapshot stream
 * @returns Array of decoded snapshots
 */
export function decodeSnapshotStream(encoded: string): Snapshot[] {
  if (!encoded.trim()) {
    return [];
  }

  return encoded.trim().split('\n').map(decodeSnapshot);
}

/**
 * Validates that a snapshot has the correct structure
 * @param snapshot - Snapshot to validate
 * @returns True if valid, false otherwise
 */
export function validateSnapshot(snapshot: unknown): snapshot is Snapshot {
  if (!snapshot || typeof snapshot !== 'object') {
    return false;
  }

  const s = snapshot as Record<string, unknown>;

  return (
    typeof s.now === 'number' &&
    Number.isFinite(s.now) &&
    typeof s.enemies === 'number' &&
    Number.isFinite(s.enemies) &&
    typeof s.proj === 'number' &&
    Number.isFinite(s.proj) &&
    typeof s.fps === 'number' &&
    Number.isFinite(s.fps)
  );
}

/**
 * Creates a snapshot from simulation state
 * @param now - Current simulation time
 * @param enemies - Number of enemies
 * @param projectiles - Number of projectiles
 * @param fps - Current FPS
 * @returns Snapshot object
 */
export function createSnapshot(
  now: number,
  enemies: number,
  projectiles: number,
  fps: number,
): Snapshot {
  return {
    now: Math.floor(now),
    enemies: Math.floor(enemies),
    proj: Math.floor(projectiles),
    fps: Math.round(fps),
  };
}

/**
 * Compares two snapshots for equality
 * @param a - First snapshot
 * @param b - Second snapshot
 * @returns True if snapshots are equal, false otherwise
 */
export function snapshotsEqual(a: Snapshot, b: Snapshot): boolean {
  return a.now === b.now && a.enemies === b.enemies && a.proj === b.proj && a.fps === b.fps;
}

/**
 * Gets the difference between two snapshots
 * @param a - First snapshot
 * @param b - Second snapshot
 * @returns Object with differences
 */
export function getSnapshotDiff(
  a: Snapshot,
  b: Snapshot,
): {
  now: number;
  enemies: number;
  proj: number;
  fps: number;
} {
  return {
    now: b.now - a.now,
    enemies: b.enemies - a.enemies,
    proj: b.proj - a.proj,
    fps: b.fps - a.fps,
  };
}

/**
 * Formats a snapshot for human-readable output
 * @param snapshot - Snapshot to format
 * @returns Formatted string
 */
export function formatSnapshot(snapshot: Snapshot): string {
  return `t=${snapshot.now}ms enemies=${snapshot.enemies} proj=${snapshot.proj} fps=${snapshot.fps}`;
}

/**
 * Snapshot stream writer for collecting snapshots over time
 */
export class SnapshotStreamWriter {
  private snapshots: Snapshot[] = [];
  private lastSnapshotTime = 0;
  private interval: number;

  /**
   * Creates a new snapshot stream writer
   * @param interval - Snapshot interval in milliseconds
   */
  constructor(interval: number = 1000) {
    this.interval = interval;
  }

  /**
   * Records a snapshot if enough time has passed
   * @param now - Current time
   * @param enemies - Number of enemies
   * @param projectiles - Number of projectiles
   * @param fps - Current FPS
   * @returns True if snapshot was recorded, false otherwise
   */
  recordSnapshot(now: number, enemies: number, projectiles: number, fps: number): boolean {
    if (now - this.lastSnapshotTime >= this.interval) {
      const snapshot = createSnapshot(now, enemies, projectiles, fps);
      this.snapshots.push(snapshot);
      this.lastSnapshotTime = now;
      return true;
    }
    return false;
  }

  /**
   * Gets all recorded snapshots
   * @returns Array of snapshots
   */
  getSnapshots(): Snapshot[] {
    return [...this.snapshots];
  }

  /**
   * Gets the encoded snapshot stream
   * @returns Encoded snapshot stream
   */
  getEncodedStream(): string {
    return encodeSnapshotStream(this.snapshots);
  }

  /**
   * Clears all recorded snapshots
   */
  clear(): void {
    this.snapshots = [];
    this.lastSnapshotTime = 0;
  }

  /**
   * Gets the number of recorded snapshots
   * @returns Snapshot count
   */
  getCount(): number {
    return this.snapshots.length;
  }

  /**
   * Gets the snapshot interval
   * @returns Interval in milliseconds
   */
  getInterval(): number {
    return this.interval;
  }

  /**
   * Sets a new snapshot interval
   * @param interval - New interval in milliseconds
   */
  setInterval(interval: number): void {
    this.interval = interval;
  }
}
