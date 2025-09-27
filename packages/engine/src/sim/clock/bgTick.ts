/**
 * @file Background tick system for 2Hz simulation
 * @description Phase 1 Story 1: Handles background simulation when tab is hidden or in BG mode
 */

import { BG_HZ } from '../../shared/constants.js';
import type { SimMode } from '../../shared/enums.js';

/**
 * Background tick driver for 2Hz simulation
 *
 * When the tab is hidden or UI requests background mode, this system
 * runs simulation steps at 2Hz with aggregated stats (no rendering).
 */
export class BackgroundTickDriver {
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private stepCallback: (_dtMs: number) => void;
  private tickCallback: (_stats: Record<string, unknown>) => void;
  private isRunning = false;
  private lastTickTime = 0;
  private tickInterval: number;

  /**
   * Creates a new background tick driver
   * @param stepCallback - Function to call for each simulation step
   * @param tickCallback - Function to call for each background tick
   */
  constructor(
    stepCallback: (_dtMs: number) => void,
    tickCallback: (_stats: Record<string, unknown>) => void,
  ) {
    this.stepCallback = stepCallback;
    this.tickCallback = tickCallback;
    this.tickInterval = 1000 / BG_HZ; // 500ms for 2Hz
  }

  /**
   * Starts background ticking
   */
  start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.lastTickTime = performance.now();

    // Use setInterval for consistent 2Hz timing
    this.intervalId = setInterval(() => {
      this.tick();
    }, this.tickInterval);
  }

  /**
   * Stops background ticking
   */
  stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Checks if background ticking is running
   * @returns True if running, false otherwise
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Processes one background tick
   */
  private tick(): void {
    if (!this.isRunning) {
      return;
    }

    const now = performance.now();
    const deltaTime = now - this.lastTickTime;
    this.lastTickTime = now;

    // Execute one simulation step with the delta time
    // In background mode, we use larger time steps
    this.stepCallback(deltaTime);

    // Emit tick stats (dummy for S1)
    this.tickCallback({
      mode: 'bg' as SimMode,
      now: now,
      dtMs: deltaTime,
      stats: {
        fps: BG_HZ,
        enemies: 0,
        proj: 0,
        dps: 0,
      },
    });
  }

  /**
   * Gets the current tick interval
   * @returns Tick interval in milliseconds
   */
  getTickInterval(): number {
    return this.tickInterval;
  }

  /**
   * Sets a new tick interval
   * @param intervalMs - New interval in milliseconds
   */
  setTickInterval(intervalMs: number): void {
    this.tickInterval = intervalMs;

    // Restart if currently running
    if (this.isRunning) {
      this.stop();
      this.start();
    }
  }

  /**
   * Gets statistics about background ticking
   * @returns Background tick statistics
   */
  getStats(): {
    isRunning: boolean;
    tickInterval: number;
    lastTickTime: number;
    uptime: number;
  } {
    return {
      isRunning: this.isRunning,
      tickInterval: this.tickInterval,
      lastTickTime: this.lastTickTime,
      uptime: this.isRunning ? performance.now() - this.lastTickTime : 0,
    };
  }
}

/**
 * Creates a new background tick driver
 * @param stepCallback - Function to call for each simulation step
 * @param tickCallback - Function to call for each background tick
 * @returns New BackgroundTickDriver instance
 */
export function createBackgroundTickDriver(
  stepCallback: (_dtMs: number) => void,
  tickCallback: (_stats: Record<string, unknown>) => void,
): BackgroundTickDriver {
  return new BackgroundTickDriver(stepCallback, tickCallback);
}

/**
 * Mode-aware simulation driver that switches between foreground and background
 */
export class ModeAwareSimDriver {
  private foregroundClock: unknown; // FixedClock
  private backgroundDriver: BackgroundTickDriver;
  private currentMode: SimMode = 'fg' as SimMode;
  private stepCallback: (_dtMs: number) => void;
  private tickCallback: (_stats: Record<string, unknown>) => void;

  /**
   * Creates a new mode-aware simulation driver
   * @param stepCallback - Function to call for each simulation step
   * @param tickCallback - Function to call for each tick
   * @param foregroundClock - Foreground clock instance
   */
  constructor(
    stepCallback: (_dtMs: number) => void,
    tickCallback: (_stats: Record<string, unknown>) => void,
    foregroundClock: unknown,
  ) {
    this.stepCallback = stepCallback;
    this.tickCallback = tickCallback;
    this.foregroundClock = foregroundClock;
    this.backgroundDriver = createBackgroundTickDriver(stepCallback, tickCallback);
  }

  /**
   * Sets the simulation mode
   * @param mode - New simulation mode
   */
  setMode(mode: SimMode): void {
    if (this.currentMode === mode) {
      return;
    }

    // Stop current mode
    if (this.currentMode === 'fg') {
      (this.foregroundClock as { stop: () => void }).stop();
    } else {
      this.backgroundDriver.stop();
    }

    // Start new mode
    this.currentMode = mode;
    if (mode === 'fg') {
      (this.foregroundClock as { start: () => void }).start();
    } else {
      this.backgroundDriver.start();
    }
  }

  /**
   * Gets the current simulation mode
   * @returns Current mode
   */
  getMode(): SimMode {
    return this.currentMode;
  }

  /**
   * Starts the simulation in the current mode
   */
  start(): void {
    if (this.currentMode === 'fg') {
      (this.foregroundClock as { start: () => void }).start();
    } else {
      this.backgroundDriver.start();
    }
  }

  /**
   * Stops the simulation
   */
  stop(): void {
    if (this.currentMode === 'fg') {
      (this.foregroundClock as { stop: () => void }).stop();
    } else {
      this.backgroundDriver.stop();
    }
  }

  /**
   * Checks if the simulation is running
   * @returns True if running, false otherwise
   */
  isRunning(): boolean {
    if (this.currentMode === 'fg') {
      return (this.foregroundClock as { isRunning: () => boolean }).isRunning();
    } else {
      return this.backgroundDriver.isActive();
    }
  }

  /**
   * Gets statistics for the current mode
   * @returns Mode-specific statistics
   */
  getStats(): Record<string, unknown> {
    if (this.currentMode === 'fg') {
      return {
        mode: 'fg',
        ...(this.foregroundClock as { getState: () => Record<string, unknown> }).getState(),
      };
    } else {
      return {
        mode: 'bg',
        ...this.backgroundDriver.getStats(),
      };
    }
  }
}
