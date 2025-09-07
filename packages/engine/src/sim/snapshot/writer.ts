/**
 * @file Snapshot writer for determinism verification
 * @description Phase 1 Story 1: Collects and manages snapshots for golden test verification
 */

import type { Snapshot } from '../../shared/types.js';
import { SNAPSHOT_INTERVAL_MS } from '../../shared/constants.js';
import { encodeSnapshot, createSnapshot } from '../protocol/codec.js';
import { hashSnapshotStream } from './hasher.js';

/**
 * Snapshot writer for collecting deterministic snapshots
 * 
 * Collects snapshots at regular intervals and provides utilities
 * for golden test verification and determinism checking.
 */
export class SnapshotWriter {
  private snapshots: Snapshot[] = [];
  private lastSnapshotTime = 0;
  private interval: number;
  private startTime = 0;
  private isRecording = false;

  /**
   * Creates a new snapshot writer
   * @param interval - Snapshot interval in milliseconds
   */
  constructor(interval: number = SNAPSHOT_INTERVAL_MS) {
    this.interval = interval;
  }

  /**
   * Starts recording snapshots
   * @param startTime - Initial time for recording
   */
  start(startTime: number = performance.now()): void {
    this.startTime = startTime;
    this.lastSnapshotTime = startTime;
    this.isRecording = true;
    this.snapshots = [];
  }

  /**
   * Stops recording snapshots
   */
  stop(): void {
    this.isRecording = false;
  }

  /**
   * Records a snapshot if enough time has passed
   * @param now - Current simulation time
   * @param enemies - Number of enemies
   * @param projectiles - Number of projectiles
   * @param fps - Current FPS
   * @returns True if snapshot was recorded, false otherwise
   */
  recordSnapshot(
    now: number,
    enemies: number,
    projectiles: number,
    fps: number
  ): boolean {
    if (!this.isRecording) {
      return false;
    }

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
    return this.snapshots.map(encodeSnapshot).join('\n');
  }

  /**
   * Gets the hash of the snapshot stream
   * @returns 64-bit hash as hex string
   */
  getStreamHash(): string {
    const stream = this.getEncodedStream();
    return hashSnapshotStream(stream);
  }

  /**
   * Clears all recorded snapshots
   */
  clear(): void {
    this.snapshots = [];
    this.lastSnapshotTime = 0;
    this.startTime = 0;
    this.isRecording = false;
  }

  /**
   * Gets the number of recorded snapshots
   * @returns Snapshot count
   */
  getCount(): number {
    return this.snapshots.length;
  }

  /**
   * Gets the recording duration
   * @returns Duration in milliseconds
   */
  getDuration(): number {
    if (this.snapshots.length === 0) {
      return 0;
    }
    
    const lastSnapshot = this.snapshots[this.snapshots.length - 1];
    return lastSnapshot!.now - this.startTime;
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

  /**
   * Checks if recording is active
   * @returns True if recording, false otherwise
   */
  isActive(): boolean {
    return this.isRecording;
  }

  /**
   * Gets statistics about the recording
   * @returns Recording statistics
   */
  getStats(): {
    isRecording: boolean;
    snapshotCount: number;
    duration: number;
    interval: number;
    startTime: number;
    lastSnapshotTime: number;
  } {
    return {
      isRecording: this.isRecording,
      snapshotCount: this.snapshots.length,
      duration: this.getDuration(),
      interval: this.interval,
      startTime: this.startTime,
      lastSnapshotTime: this.lastSnapshotTime
    };
  }

  /**
   * Exports snapshots to NDJSON format
   * @returns NDJSON string
   */
  exportNDJSON(): string {
    return this.snapshots
      .map(snapshot => JSON.stringify(snapshot))
      .join('\n');
  }

  /**
   * Exports snapshots to CSV format
   * @returns CSV string
   */
  exportCSV(): string {
    const header = 'now,enemies,proj,fps';
    const rows = this.snapshots
      .map(s => `${s.now},${s.enemies},${s.proj},${s.fps}`)
      .join('\n');
    
    return `${header}\n${rows}`;
  }
}

/**
 * Golden test manager for determinism verification
 */
export class GoldenTestManager {
  private expectedHash: string | null = null;
  private expectedSnapshots: Snapshot[] | null = null;

  /**
   * Sets the expected golden hash
   * @param hash - Expected hash value
   */
  setExpectedHash(hash: string): void {
    this.expectedHash = hash;
  }

  /**
   * Sets the expected golden snapshots
   * @param snapshots - Expected snapshots
   */
  setExpectedSnapshots(snapshots: Snapshot[]): void {
    this.expectedSnapshots = snapshots;
  }

  /**
   * Validates snapshots against golden data
   * @param writer - Snapshot writer to validate
   * @returns Validation result
   */
  validate(writer: SnapshotWriter): {
    valid: boolean;
    hashMatch: boolean;
    snapshotMatch: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    let hashMatch = true;
    let snapshotMatch = true;

    // Validate hash if expected
    if (this.expectedHash !== null) {
      const actualHash = writer.getStreamHash();
      if (actualHash !== this.expectedHash) {
        hashMatch = false;
        errors.push(`Hash mismatch: expected ${this.expectedHash}, got ${actualHash}`);
      }
    }

    // Validate snapshots if expected
    if (this.expectedSnapshots !== null) {
      const actualSnapshots = writer.getSnapshots();
      if (actualSnapshots.length !== this.expectedSnapshots.length) {
        snapshotMatch = false;
        errors.push(`Snapshot count mismatch: expected ${this.expectedSnapshots.length}, got ${actualSnapshots.length}`);
      } else {
        for (let i = 0; i < actualSnapshots.length; i++) {
          const expected = this.expectedSnapshots[i];
          const actual = actualSnapshots[i];
          
          if (expected!.now !== actual!.now ||
              expected!.enemies !== actual!.enemies ||
              expected!.proj !== actual!.proj ||
              expected!.fps !== actual!.fps) {
            snapshotMatch = false;
            errors.push(`Snapshot ${i} mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
          }
        }
      }
    }

    return {
      valid: hashMatch && snapshotMatch,
      hashMatch,
      snapshotMatch,
      errors
    };
  }
}
