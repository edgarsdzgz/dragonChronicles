/**
 * @file Draconia Chronicles Engine - Main API
 * @description Phase 1 Story 1: Bootstrap API for creating and managing the simulation engine
 */

import type { UiToSim, SimToUi, SimCtx, EngineConfig, SimStats } from './shared/types.js';
import type { SimMode } from './shared/enums.js';
import { createStandardStreams } from './sim/rng/streams.js';
import { FixedClock } from './sim/clock/accumulator.js';
import { BackgroundTickDriver } from './sim/clock/bgTick.js';
import { SnapshotWriter } from './sim/snapshot/writer.js';
import { ValidationContext } from './shared/validation.js';
import { SimToUiMessageFactory } from './sim/protocol/simToUi.js';
import { BUILD_VERSION, SNAPSHOT_INTERVAL_MS } from './shared/constants.js';
import { MessageType } from './shared/enums.js';

/**
 * Main engine class for Draconia Chronicles simulation
 */
export class DraconiaEngine {
  private ctx: SimCtx;
  private clock: FixedClock;
  private bgDriver: BackgroundTickDriver;
  private snapshotWriter: SnapshotWriter;
  private validationContext: ValidationContext;
  private onSimMessage: (_msg: SimToUi) => void;
  private isRunning = false;
  private currentMode: SimMode = 'fg' as SimMode;

  /**
   * Creates a new Draconia engine instance
   * @param seed - Simulation seed for deterministic behavior
   * @param build - Build version string
   */
  constructor(seed: number, build: string) {
    // Validate build version
    if (build !== BUILD_VERSION) {
      throw new Error(`Build version mismatch: expected ${BUILD_VERSION}, got ${build}`);
    }

    // Initialize RNG streams
    const streams = createStandardStreams(seed);

    // Initialize simulation context
    this.ctx = {
      now: 0,
      seed: seed >>> 0,
      rng: {
        spawns: streams.get('spawns'),
        crits: streams.get('crits'),
        drops: streams.get('drops'),
        variance: streams.get('variance'),
      },
      perf: { stepMsP95: 0 },
    };

    // Initialize snapshot writer
    this.snapshotWriter = new SnapshotWriter(SNAPSHOT_INTERVAL_MS);

    // Initialize validation context
    this.validationContext = new ValidationContext();

    // Initialize clock system
    this.clock = new FixedClock((dtMs) => this.step(dtMs));
    this.bgDriver = new BackgroundTickDriver(
      (dtMs) => this.step(dtMs),
      (stats) => this.emitTick(stats),
    );

    // Default message handler
    this.onSimMessage = () => {};
  }

  /**
   * Sets the message handler for Sim to UI messages
   * @param handler - Function to handle Sim to UI messages
   */
  onSimMsg(handler: (_msg: SimToUi) => void): void {
    this.onSimMessage = handler;
  }

  /**
   * Posts a UI to Sim message
   * @param msg - UI to Sim message
   */
  post(msg: UiToSim): void {
    // Validate message
    const validation = this.validationContext.validateMessage(msg);
    if (!validation.valid) {
      this.emitFatal(`Invalid message: ${validation.error}`);
      return;
    }

    // Handle message
    switch (msg.t) {
      case MessageType._Boot:
        this.handleBoot(msg);
        break;
      case MessageType._Start:
        this.handleStart(msg);
        break;
      case MessageType._Stop:
        this.handleStop();
        break;
      case MessageType._Ability:
        this.handleAbility(msg);
        break;
      case MessageType._Offline:
        this.handleOffline(msg);
        break;
    }
  }

  /**
   * Gets the current simulation context
   * @returns Current simulation context
   */
  getContext(): SimCtx {
    return { ...this.ctx };
  }

  /**
   * Gets the current simulation mode
   * @returns Current simulation mode
   */
  getMode(): SimMode {
    return this.currentMode;
  }

  /**
   * Checks if the engine is running
   * @returns True if running, false otherwise
   */
  isActive(): boolean {
    return this.isRunning;
  }

  /**
   * Gets engine statistics
   * @returns Engine statistics
   */
  getStats(): {
    isRunning: boolean;
    mode: SimMode;
    now: number;
    seed: number;
    snapshotCount: number;
    validationStats: Record<string, unknown>;
  } {
    return {
      isRunning: this.isRunning,
      mode: this.currentMode,
      now: this.ctx.now,
      seed: this.ctx.seed,
      snapshotCount: this.snapshotWriter.getCount(),
      validationStats: this.validationContext.getStats(),
    };
  }

  /**
   * Handles boot message
   * @param msg - Boot message
   */
  private handleBoot(msg: UiToSim): void {
    if (msg.t !== MessageType._Boot) return;

    // Emit ready message
    this.emitReady();

    // Start snapshot recording
    this.snapshotWriter.start(this.ctx.now);
  }

  /**
   * Handles start message
   * @param msg - Start message
   */
  private handleStart(msg: UiToSim): void {
    if (msg.t !== MessageType._Start) return;

    // Start simulation
    this.start();
  }

  /**
   * Handles stop message
   */
  private handleStop(): void {
    this.stop();
  }

  /**
   * Handles ability message
   * @param msg - Ability message
   */
  private handleAbility(msg: UiToSim): void {
    if (msg.t !== MessageType._Ability) return;

    // For P1-S1, abilities are no-op
    // Later stories will implement actual ability logic
  }

  /**
   * Handles offline message
   * @param msg - Offline message
   */
  private handleOffline(msg: UiToSim): void {
    if (msg.t !== MessageType._Offline) return;

    // For P1-S1, offline is no-op
    // Later stories will implement offline simulation
  }

  /**
   * Starts the simulation
   */
  private start(): void {
    if (this.isRunning) return;

    this.isRunning = true;

    if (this.currentMode === 'fg') {
      this.clock.start();
    } else {
      this.bgDriver.start();
    }
  }

  /**
   * Stops the simulation
   */
  private stop(): void {
    if (!this.isRunning) return;

    this.isRunning = false;

    if (this.currentMode === 'fg') {
      this.clock.stop();
    } else {
      this.bgDriver.stop();
    }

    this.snapshotWriter.stop();
  }

  /**
   * Simulation step function
   * @param dtMs - Time delta in milliseconds
   */
  private step(dtMs: number): void {
    this.ctx.now += dtMs;

    // For P1-S1, simulation step is minimal
    // Later stories will implement actual game logic

    // Emit tick with dummy stats
    this.emitTick({
      mode: this.currentMode,
      now: this.ctx.now,
      dtMs,
      stats: {
        fps: this.currentMode === 'fg' ? 60 : 2,
        enemies: 0,
        proj: 0,
        dps: 0,
      },
    });
  }

  /**
   * Emits a tick message
   * @param stats - Tick statistics
   */
  private emitTick(stats: Record<string, unknown>): void {
    const tickMsg = SimToUiMessageFactory.tick(stats.now as number, stats.stats as SimStats);
    this.onSimMessage(tickMsg);
  }

  /**
   * Emits a ready message
   */
  private emitReady(): void {
    const readyMsg = SimToUiMessageFactory.ready();
    this.onSimMessage(readyMsg);
  }

  /**
   * Emits a log message
   * @param level - Log level
   * @param message - Log message
   */
  private emitLog(level: 'info' | 'warn' | 'error', message: string): void {
    const logMsg = SimToUiMessageFactory[level](message);
    this.onSimMessage(logMsg);
  }

  /**
   * Emits a fatal error message
   * @param reason - Error reason
   */
  private emitFatal(reason: string): void {
    const fatalMsg = SimToUiMessageFactory.fatal(reason);
    this.onSimMessage(fatalMsg);
    this.stop();
  }
}

/**
 * Creates a new Draconia engine instance
 * @param seed - Simulation seed for deterministic behavior
 * @param build - Build version string
 * @returns New engine instance
 */
export function createEngine(seed: number, build: string): DraconiaEngine {
  return new DraconiaEngine(seed, build);
}

/**
 * Engine factory with configuration
 * @param config - Engine configuration
 * @returns New engine instance
 */
export function createEngineWithConfig(config: EngineConfig): DraconiaEngine {
  const engine = new DraconiaEngine(config.seed, config.build);

  // Apply configuration
  if (config.mode) {
    // Set mode (implementation would go here)
  }

  return engine;
}
