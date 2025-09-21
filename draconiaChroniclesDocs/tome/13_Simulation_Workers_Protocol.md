--- tome*version: 2.2 file: /draconiaChroniclesDocs/tome/13*Simulation*Workers*Protocol.md canonical*precedence: v2.1*GDD status: detailed last_updated: 2025-01-12 ---

# 13 — Simulation: Workers & Protocol

## Web Worker Architecture

### Core Simulation Philosophy

- **Deterministic Simulation**: All game logic runs in Web Workers with fixed timestep

- **UI Separation**: UI thread handles rendering and input, simulation thread handles game logic

- **Background Processing**: Simulation continues when UI is hidden or minimized

- **Graceful Recovery**: Automatic recovery from worker crashes or errors

### Worker Lifecycle

````typescript

export interface WorkerLifecycle {
  // Initialization
  initialize: (config: WorkerConfig) => Promise<void>;
  loadState: (state: GameState) => Promise<void>;
  start: () => Promise<void>;

  // Runtime
  pause: () => Promise<void>;
  resume: () => Promise<void>;
  update: (deltaTime: number) => Promise<void>;

  // State Management
  saveState: () => Promise<GameState>;
  exportState: () => Promise<SerializedState>;
  importState: (state: SerializedState) => Promise<void>;

  // Cleanup
  stop: () => Promise<void>;
  terminate: () => Promise<void>;
}

```javascript

### Worker Configuration

```typescript

export interface WorkerConfig {
  // Timing
  fixedTimestep: number; // 16.67ms (60fps)
  maxAccumulator: number; // 250ms (prevents spiral of death)

  // Performance
  maxEntities: number; // 400 enemies
  maxProjectiles: number; // 600 projectiles/s
  maxEffects: number; // 100 effects

  // Determinism
  seed: number; // RNG seed for deterministic behavior
  deterministicMode: boolean; // strict deterministic mode

  // Debugging
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  profilingEnabled: boolean;
}

```text

## Message Protocol System

### UI ↔ Simulation Protocol

```typescript

// UI to Simulation messages
export type UIToSimMessage =
  | { type: 'boot'; config: WorkerConfig; seed: number }
  | { type: 'start' }
  | { type: 'stop' }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'ability'; id: string; target?: Vector2 }
  | { type: 'upgrade'; enchantId: string; level: number }
  | { type: 'return*to*draconia' }
  | { type: 'offline_progression'; elapsedMs: number }
  | { type: 'save_state' }
  | { type: 'load_state'; state: GameState };

// Simulation to UI messages
export type SimToUIMessage =
  | { type: 'ready' }
  | { type: 'tick';
      timestamp: number;
      stats: {
        fps: number;
        enemies: number;
        projectiles: number;
        dps: number;
        distance: number;
      }
    }
  | { type: 'enemy_spawned'; enemy: Enemy }
  | { type: 'enemy_killed'; enemyId: string; rewards: Reward[] }
  | { type: 'player_damaged'; damage: number; source: string }
  | { type: 'ability_used'; abilityId: string; cooldown: number }
  | { type: 'upgrade_completed'; enchantId: string; newLevel: number }
  | { type: 'boss_defeated'; bossId: string; rewards: Reward[] }
  | { type: 'distance_milestone'; distance: number; rewards: Reward[] }
  | { type: 'log'; level: 'info' | 'warn' | 'error'; message: string; data?: any }
  | { type: 'fatal'; reason: string; stack?: string }
  | { type: 'state_updated'; state: GameState };

```javascript

### Message Queue System

```typescript

export interface MessageQueue {
  // Queue Management
  enqueue: (message: UIToSimMessage | SimToUIMessage) => void;
  dequeue: () => UIToSimMessage | SimToUIMessage | null;
  clear: () => void;

  // Queue Status
  size: number;
  maxSize: number;
  isFull: boolean;

  // Priority Handling
  priorityQueue: boolean;
  urgentMessages: Set<string>; // message types that bypass queue

  // Error Handling
  errorHandler: (error: Error) => void;
  timeoutHandler: (message: any) => void;
}

```text

## Deterministic Simulation

### Fixed Timestep Implementation

```typescript

export class FixedTimestepSimulator {
  private accumulator: number = 0;
  private fixedTimestep: number = 16.67; // 60fps
  private maxAccumulator: number = 250; // prevent spiral of death

  constructor(config: WorkerConfig) {
    this.fixedTimestep = config.fixedTimestep;
    this.maxAccumulator = config.maxAccumulator;
  }

  update(deltaTime: number): void {
    // Add delta time to accumulator
    this.accumulator += deltaTime;

    // Prevent spiral of death
    if (this.accumulator > this.maxAccumulator) {
      this.accumulator = this.maxAccumulator;
    }

    // Run simulation steps
    while (this.accumulator >= this.fixedTimestep) {
      this.simulateStep(this.fixedTimestep);
      this.accumulator -= this.fixedTimestep;
    }
  }

  private simulateStep(deltaTime: number): void {
    // Update all game systems with fixed timestep
    this.updateEntities(deltaTime);
    this.updatePhysics(deltaTime);
    this.updateAI(deltaTime);
    this.updateCombat(deltaTime);
    this.updateEconomy(deltaTime);
  }
}

```javascript

### Deterministic RNG System

```typescript

export class DeterministicRNG {
  private streams: Map<string, RNGStream> = new Map();

  constructor(seed: number) {
    this.initializeStreams(seed);
  }

  private initializeStreams(seed: number): void {
    // Create separate RNG streams for different systems
    this.streams.set('spawns', new RNGStream(seed + 1));
    this.streams.set('combat', new RNGStream(seed + 2));
    this.streams.set('drops', new RNGStream(seed + 3));
    this.streams.set('ai', new RNGStream(seed + 4));
  }

  // Get random number from specific stream
  random(stream: string): number {
    const rngStream = this.streams.get(stream);
    if (!rngStream) {
      throw new Error(`RNG stream '${stream}' not found`);
    }
    return rngStream.next();
  }

  // Get random integer from specific stream
  randomInt(stream: string, min: number, max: number): number {
    const random = this.random(stream);
    return Math.floor(random * (max - min + 1)) + min;
  }

  // Get random boolean from specific stream
  randomBool(stream: string, probability: number = 0.5): boolean {
    return this.random(stream) < probability;
  }
}

```text

## Background Processing

### Background Simulation

```typescript

export class BackgroundSimulator {
  private isBackground: boolean = false;
  private backgroundRate: number = 2; // 2Hz background rate
  private lastBackgroundUpdate: number = 0;

  constructor(private config: WorkerConfig) {}

  update(deltaTime: number): void {
    if (this.isBackground) {
      this.updateBackground(deltaTime);
    } else {
      this.updateForeground(deltaTime);
    }
  }

  private updateBackground(deltaTime: number): void {
    const now = Date.now();
    const timeSinceLastUpdate = now - this.lastBackgroundUpdate;
    const updateInterval = 1000 / this.backgroundRate; // 500ms for 2Hz

    if (timeSinceLastUpdate >= updateInterval) {
      // Run background simulation at reduced rate
      this.simulateBackgroundStep(timeSinceLastUpdate);
      this.lastBackgroundUpdate = now;
    }
  }

  private simulateBackgroundStep(deltaTime: number): void {
    // Only update essential systems in background
    this.updateOfflineProgression(deltaTime);
    this.updateCitySystems(deltaTime);
    this.updateResearch(deltaTime);

    // Skip expensive systems like combat and rendering
  }

  setBackgroundMode(isBackground: boolean): void {
    this.isBackground = isBackground;
    if (isBackground) {
      this.lastBackgroundUpdate = Date.now();
    }
  }
}

```javascript

### Offline Progression

```typescript

export class OfflineProgression {
  private lastActiveTime: number = 0;
  private offlineCap: number = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private config: WorkerConfig) {}

  calculateOfflineProgress(elapsedMs: number): OfflineProgress {
    const cappedElapsed = Math.min(elapsedMs, this.offlineCap);

    // Linear progression for first 8 hours
    const linearHours = 8 * 60 * 60 * 1000;
    let progress = 0;

    if (cappedElapsed <= linearHours) {
      // Linear progression
      progress = this.calculateLinearProgress(cappedElapsed);
    } else {
      // Diminishing returns after 8 hours
      const linearProgress = this.calculateLinearProgress(linearHours);
      const diminishingElapsed = cappedElapsed - linearHours;
      const diminishingProgress = this.calculateDiminishingProgress(diminishingElapsed);
      progress = linearProgress + diminishingProgress;
    }

    return {
      elapsedMs: cappedElapsed,
      progress: progress,
      rewards: this.calculateOfflineRewards(progress)
    };
  }

  private calculateLinearProgress(elapsedMs: number): number {
    // Base progression rate (tune based on game balance)
    const baseRate = 0.1; // 10% of active play rate
    return elapsedMs * baseRate;
  }

  private calculateDiminishingProgress(elapsedMs: number): number {
    // Exponential decay for diminishing returns
    const decayRate = 0.5; // 50% decay per hour
    const hours = elapsedMs / (60 * 60 * 1000);
    return Math.exp(-decayRate * hours);
  }
}

```bash

## Auto-Recovery System

### Worker Crash Recovery

```typescript

export class WorkerRecovery {
  private lastKnownState: GameState | null = null;
  private recoveryAttempts: number = 0;
  private maxRecoveryAttempts: number = 3;

  constructor(private config: WorkerConfig) {}

  async handleWorkerCrash(error: Error): Promise<RecoveryResult> {
    this.recoveryAttempts++;

    if (this.recoveryAttempts > this.maxRecoveryAttempts) {
      return {
        success: false,
        reason: 'Maximum recovery attempts exceeded',
        fallbackState: this.lastKnownState
      };
    }

    try {
      // Attempt to recover worker
      await this.recoverWorker();

      // Restore last known state
      if (this.lastKnownState) {
        await this.restoreState(this.lastKnownState);
      }

      return {
        success: true,
        reason: 'Worker recovered successfully',
        restoredState: this.lastKnownState
      };
    } catch (recoveryError) {
      return {
        success: false,
        reason: `Recovery failed: ${recoveryError.message}`,
        fallbackState: this.lastKnownState
      };
    }
  }

  private async recoverWorker(): Promise<void> {
    // Terminate crashed worker
    if (this.worker) {
      this.worker.terminate();
    }

    // Create new worker
    this.worker = new Worker('/workers/simulation.js');

    // Set up message handlers
    this.setupMessageHandlers();

    // Initialize new worker
    await this.initializeWorker();
  }

  saveState(state: GameState): void {
    this.lastKnownState = this.serializeState(state);
  }

  private serializeState(state: GameState): GameState {
    // Create deep copy of state for recovery
    return JSON.parse(JSON.stringify(state));
  }
}

```javascript

### State Synchronization

```typescript

export class StateSynchronization {
  private stateHistory: GameState[] = [];
  private maxHistorySize: number = 10;

  constructor(private config: WorkerConfig) {}

  saveState(state: GameState): void {
    // Add state to history
    this.stateHistory.push(this.serializeState(state));

    // Trim history if too large
    if (this.stateHistory.length > this.maxHistorySize) {
      this.stateHistory.shift();
    }
  }

  restoreState(targetTimestamp: number): GameState | null {
    // Find closest state to target timestamp
    let closestState: GameState | null = null;
    let closestDifference = Infinity;

    for (const state of this.stateHistory) {
      const difference = Math.abs(state.timestamp - targetTimestamp);
      if (difference < closestDifference) {
        closestDifference = difference;
        closestState = state;
      }
    }

    return closestState;
  }

  private serializeState(state: GameState): GameState {
    // Create deep copy for history
    return JSON.parse(JSON.stringify(state));
  }
}

```text

## Performance Monitoring

### Simulation Performance

```typescript

export class SimulationPerformance {
  private frameTimes: number[] = [];
  private maxFrameTimeHistory: number = 60; // 1 second at 60fps

  constructor(private config: WorkerConfig) {}

  recordFrameTime(frameTime: number): void {
    this.frameTimes.push(frameTime);

    // Trim history
    if (this.frameTimes.length > this.maxFrameTimeHistory) {
      this.frameTimes.shift();
    }
  }

  getPerformanceMetrics(): PerformanceMetrics {
    const avgFrameTime = this.calculateAverageFrameTime();
    const maxFrameTime = Math.max(...this.frameTimes);
    const minFrameTime = Math.min(...this.frameTimes);
    const fps = 1000 / avgFrameTime;

    return {
      averageFrameTime: avgFrameTime,
      maxFrameTime: maxFrameTime,
      minFrameTime: minFrameTime,
      fps: fps,
      frameTimeVariance: this.calculateFrameTimeVariance(),
      performanceGrade: this.calculatePerformanceGrade(fps)
    };
  }

  private calculateAverageFrameTime(): number {
    return this.frameTimes.reduce((sum, time) => sum + time, 0) / this.frameTimes.length;
  }

  private calculateFrameTimeVariance(): number {
    const avg = this.calculateAverageFrameTime();
const variance = this.frameTimes.reduce((sum, time) => sum + Math.pow(time - avg, 2), 0) /
this.frameTimes.length;
    return Math.sqrt(variance);
  }

  private calculatePerformanceGrade(fps: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (fps >= 60) return 'A';
    if (fps >= 50) return 'B';
    if (fps >= 40) return 'C';
    if (fps >= 30) return 'D';
    return 'F';
  }
}

```text

## Acceptance Criteria

- [ ] Web Worker simulation runs deterministically with fixed timestep

- [ ] Message protocol handles all UI ↔ Simulation communication

- [ ] Background processing continues simulation when UI is hidden

- [ ] Offline progression calculates meaningful progress

- [ ] Auto-recovery system handles worker crashes gracefully

- [ ] State synchronization preserves game state across recovery

- [ ] Performance monitoring tracks simulation performance

- [ ] Deterministic RNG ensures reproducible behavior

- [ ] Message queue prevents message loss or corruption

- [ ] Worker lifecycle management handles all states correctly
````
