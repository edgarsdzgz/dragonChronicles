# Epic 1.1: Core Game Loop Foundation - Detailed Technical Specifications

**Status:** 🔄 **IN PROGRESS** - P1-S1 Completed, Remaining Stories Pending
**Priority:** Critical
**Estimated Effort:** 3-4 weeks
**Dependencies:** Phase 0 Complete
**Total Stories:** 7 (including completed P1-S1)

## 🎯 **Epic 1.1 Overview - What This Epic Does**

**For Non-Coders:** Epic 1.1 creates the fundamental "engine" that powers the core game loop. Think of it as building the foundation of a house - everything else in the game will be built on top of this. This epic handles:

1. **Starting and Stopping Journeys** - How players begin their dragon adventures

1. **Distance Travel** - How far the dragon travels at constant speed with enemies getting stronger

1. **Ward Progression** - How players advance through different areas (Ward 1, Ward 2, etc.)

1. **Return System** - How players come back to Draconia with their rewards

1. **Offline Progress** - How the game continues even when players aren't actively playing

1. **Divine Favor System** - How players can earn temporary divine blessings for active play

**Technical Summary:** Epic 1.1 establishes the core game loop infrastructure including journey state management, constant-speed distance progression with enemy stat micro-ramps, ward/land advancement systems, return-to-Draconia flow with arcana donation and enchantment reset, offline progression simulation with decay mechanics, and divine favor system with cooldowns.

## 🏗️ **What We'll Have Completed After Epic 1.1**

**For Non-Coders:** At the end of Epic 1.1, we'll have a fully functional core game loop where:

- ✅ Players can start a journey and travel through different areas

- ✅ The dragon automatically moves forward at constant speed

- ✅ Players progress through 5 different wards (areas) in the first land

- ✅ Players can return to Draconia with their earned rewards

- ✅ The game continues progressing even when players are offline

- ✅ Players can earn temporary progression bonuses for active play

- ✅ **Enchantment system supports both temporary and permanent upgrades**

**Technical Deliverables:** Complete journey state machine, constant-speed distance progression with enemy stat micro-ramps, ward advancement system, return flow with Shield Tax and enchantment reset, offline simulation with 8-hour linear + decay model, rested bonus system with 15-minute duration and 30-minute cooldown, and **dual-layer enchantment system with permanent starting levels**.

## Quality Gates

- **Test Coverage:** 100% unit tests, 95%+ integration tests

- **Performance:** Zero per-frame allocations, 60fps desktop, ≥40fps mobile

- **Security:** All UI messages validated, rate limiting implemented

- **Determinism:** Byte-equal snapshots across platforms

- **Progression Rule:** Cannot advance to 1.1.X+1 until 1.1.X passes 100% tests

---

## 1.1.0: Core Determinism Engine ✅ **COMPLETED**

**Status:** ✅ **COMPLETED** - January 15, 2025
**Implementation:** P1-S1 Core Types, Constants, and Determinism
**Branch:** `feat/p1-s1-core-determinism`
**Commit:** `429c248`

### 📖 **What This Story Does**

**For Non-Coders:** This story created the "foundation" that makes sure the game runs exactly the same way every time. Think of it like creating a perfectly consistent clock and random number generator that never changes. This ensures that when players play the game, everything happens in the same predictable way, which is crucial for:

- Fair gameplay (no cheating through randomness)

- Bug testing (problems can be reproduced exactly)

- Performance (the game runs smoothly and consistently)

**Technical Summary:** Establishes deterministic simulation infrastructure with PCG32 RNG system for consistent randomness, fixed clock system with 60Hz foreground and 2Hz background processing, comprehensive message validation for security, snapshot system for deterministic verification, and clean engine bootstrap API for system initialization.

### 🔧 **Technical Specifications**

- **PCG32 RNG System:** High-quality deterministic random number generation

- **Fixed Clock System:** 60Hz foreground, 2Hz background with accumulator pattern

- **Message Validation:** Security guards for UI→Sim communication

- **Snapshot System:** Byte-equal verification for deterministic behavior

- **Engine Bootstrap API:** Clean engine creation and management interface

### Deliverables

- ✅ `shared/constants.ts` - Essential constants and system limits

- ✅ `shared/enums.ts` - Core enums for game entities

- ✅ `shared/ids.ts` - Type-safe ID constants with validation

- ✅ `shared/types.ts` - Entity types and message contracts

- ✅ `shared/validation.ts` - Security guards for untrusted messages

- ✅ `sim/rng/pcg32.ts` - PCG32 implementation

- ✅ `sim/rng/seed.ts` - Seed management utilities

- ✅ `sim/rng/streams.ts` - Named RNG streams

- ✅ `sim/clock/accumulator.ts` - Fixed-timestep clock

- ✅ `sim/clock/bgTick.ts` - Background tick system

- ✅ `sim/protocol/codec.ts` - Snapshot encoding/decoding

- ✅ `sim/protocol/uiToSim.ts` - UI to Sim message contracts

- ✅ `sim/protocol/simToUi.ts` - Sim to UI message contracts

- ✅ `sim/snapshot/hasher.ts` - Fast 64-bit hash function

- ✅ `sim/snapshot/writer.ts` - Snapshot collection system

- ✅ `engine.ts` - Main engine bootstrap API

### Tests

- ✅ **Unit Tests:** 95%+ coverage for sim/* modules

- ✅ **Integration Tests:** 100% coverage for shared/* modules

- ✅ **Golden Tests:** Byte-equal verification over 60 seconds

- ✅ **Cross-Platform Tests:** Consistent results across platforms

### 🎯 **What We Completed in 1.1.0**

**For Non-Coders:** We successfully built the game's "operating system" - the core foundation that makes everything else work reliably. This includes:

- ✅ **Perfect Randomness:** The game's random number generator works consistently every time

- ✅ **Smooth Timing:** The game runs at exactly 60 frames per second on desktop, 40+ on mobile

- ✅ **Security System:** All messages between different parts of the game are validated and secure

- ✅ **Consistency Checker:** The game can verify that it's running exactly the same way every time

- ✅ **Quality Assurance:** All 152 tests pass, ensuring everything works perfectly

**Technical Completion:** Achieved deterministic simulation with byte-equal snapshots, cross-platform RNG consistency, precise timing with accumulator pattern, comprehensive message validation, and 100% test coverage with TypeScript strict compliance.

### ✅ **Completion Criteria**

- ✅ Given fixed seed + inputs, two 60-second runs produce byte-equal snapshots

- ✅ RNG sequence unit tests pass across platforms

- ✅ Accumulator never skips >1 frame at 60Hz in FG; BG ticks fire at 2Hz ±1 frame

- ✅ Zero per-frame allocations in core loop verified

- ✅ All 152 tests passing (100% success rate)

- ✅ TypeScript strict mode compliance

- ✅ ESLint/Prettier validation clean

- ✅ Size budget compliance (≤25KB engine bundle)

---

## 1.1.1: Journey State Management

**Status:** ⏳ **PENDING**
**Dependencies:** 1.1.0 Complete
**Estimated Effort:** 2-3 days

### 📖 **What This Story Does** (2)

**For Non-Coders:** This story creates the system that manages when players start, pause, resume, and end their dragon journeys. Think of it like the "play button" system in a music player - it handles all the different states (playing, paused, stopped) and makes sure the game knows exactly what the player is doing at any moment. This includes:

- **Starting a Journey:** When a player clicks "Begin Journey" and selects their land/ward

- **Pausing:** When a player temporarily stops (like closing the app or switching tabs)

- **Resuming:** When a player comes back and wants to continue where they left off

- **Stopping:** When a player decides to return to Draconia with their rewards

- **Error Handling:** When something goes wrong and the game needs to recover gracefully

**Technical Summary:** Implements journey state machine with 7 states (IDLE, STARTING, ACTIVE, PAUSED, STOPPING, STOPPED, ERROR), state transition logic, message handling for UI→Sim communication, context management for journey data, and comprehensive validation for all state changes.

### 🏗️ **What We'll Have After 1.1.1**

**For Non-Coders:** After completing this story, players will be able to:

- Start their dragon journey by selecting a land and ward

- Pause their journey (like closing the app) and resume later without losing progress

- Stop their journey and return to Draconia with their earned rewards

- Have the game automatically handle errors and recovery situations

**Technical Deliverables:** Complete journey state management system with state machine, message contracts, validation, context tracking, and telemetry for all state changes.

### 🔧 **Technical Specifications** (2)

#### Core State Machine

**What This Does:** Defines the 7 different "modes" the journey can be in at any time.

```typescript

// What this does: Defines all possible states a journey can be in
// Why this exists: Ensures the game knows exactly what the player is doing at all times
// How it integrates: Used by the journey manager to control game flow and UI display
// Usage context: Referenced throughout the journey lifecycle to determine available
actions
enum JourneyState {
IDLE = 'idle', // Player is in Draconia, not on a journey - can start new journey
  STARTING = 'starting',   // Journey is being initialized - loading assets and setting up
ACTIVE = 'active', // Player is actively traveling and progressing through the world
PAUSED = 'paused', // Journey is temporarily stopped (app closed, tab hidden, etc.)
STOPPING = 'stopping', // Journey is ending - processing rewards and returning to Draconia
  STOPPED = 'stopped',     // Journey complete - player is back in Draconia with rewards
  ERROR = 'error'          // Something critical went wrong - needs recovery or reset
}

// What this does: Stores all the information needed to track a journey session
// Why this exists: Provides complete context for the current journey state and history
// How it integrates: Passed between journey manager, UI, and save system
// Usage context: Created when journey starts, updated throughout, saved on pause/stop
interface JourneyContext {
  state: JourneyState;           // Current journey state - determines what player can do
startTime: number; // When journey began (timestamp) - used for duration calculations
pauseTime?: number; // When journey was paused (if paused) - for resume calculations
totalPausedDuration: number; // Total time spent paused - subtracted from journey duration
sessionId: string; // Unique identifier for this journey - used for telemetry and saves
landId: LandId; // Which land player is currently in (1, 2, 3...) - affects enemy types
wardId: WardId; // Which ward within that land (1, 2, 3...) - affects difficulty
}

```bash

#### State Transitions

**What This Does:** Defines the rules for how the journey moves between different states. Like a flowchart that shows what can happen next.

- **IDLE → STARTING:** When user clicks "Begin Journey" button

- **STARTING → ACTIVE:** After the game successfully loads the journey

- **ACTIVE → PAUSED:** When user closes app or switches to another app

- **PAUSED → ACTIVE:** When user reopens app and wants to continue

- **ACTIVE → STOPPING:** When user clicks "Return to Draconia" or dragon dies

- **STOPPING → STOPPED:** After processing rewards and returning to town

- **ANY → ERROR:** When something critical goes wrong (network failure, etc.)

#### Message Handling

**What This Does:** Defines the "messages" that the user interface sends to the game simulation to control the journey. Like remote control commands.

```typescript

// What this does: Defines the communication protocol between UI and simulation
// Why this exists: Allows the user interface to control the game simulation safely
// How it integrates: Used by the message router to process UI commands
// Usage context: Created by UI components and sent to simulation worker

// UI → Sim Messages (User Interface sends these to the Game Simulation)
// What this does: Message sent when player wants to start a new journey
// Why this exists: Provides safe way for UI to initiate journey without direct access to
simulation
// How it integrates: Processed by journey manager to transition from IDLE to STARTING
state
// Usage context: Created when player clicks "Begin Journey" button
interface StartJourneyMessage {
  t: 'start_journey';     // Message type identifier - tells simulation what to do
landId: LandId; // Which land to start in (1, 2, 3...) - determines enemy types and
difficulty
wardId: WardId; // Which ward within that land (1, 2, 3...) - starting difficulty level
  sessionId: string;      // Unique session ID for tracking - used for telemetry and saves
}

// What this does: Message sent when journey needs to be paused
// Why this exists: Handles app suspension, tab switching, or user-requested pauses
// How it integrates: Transitions journey from ACTIVE to PAUSED state
// Usage context: Triggered by browser events or user actions
interface PauseJourneyMessage {
  t: 'pause_journey';      // Message type identifier - tells simulation to pause
reason: 'user*request' | 'tab*hidden' | 'system_sleep'; // Why it was paused - affects
resume
behavior
}

// What this does: Message sent when journey should be resumed after being paused
// Why this exists: Allows seamless continuation of journey after pause
// How it integrates: Transitions journey from PAUSED to ACTIVE state with time correction
// Usage context: Created when player returns to app or clicks resume button
interface ResumeJourneyMessage {
  t: 'resume_journey';     // Message type identifier - tells simulation to resume
elapsedMs: number; // How much time passed while paused - used for offline progression
calculation
}

// What this does: Message sent when journey should be ended and player returned to
Draconia
// Why this exists: Handles all journey ending scenarios (manual return, death, boss
defeat,
errors)
// How it integrates: Transitions journey from ACTIVE to STOPPING state
// Usage context: Created by various game events or user actions
interface StopJourneyMessage {
  t: 'stop_journey';       // Message type identifier - tells simulation to end journey
reason: 'user*return' | 'boss*defeated' | 'dragon_death' | 'error'; // Why it stopped -
affects
reward
processing
}

// Sim → UI Messages (Game Simulation sends these back to User Interface)
interface JourneyStateMessage {
  t: 'journey_state';      // Message type: "here's the current journey status"
  state: JourneyState;     // Current state (active, paused, etc.)
  duration: number;        // How long the journey has been running
  distance: number;        // How far the dragon has traveled
}

```text

### 📦 **Deliverables**

**What These Files Do:** These are the actual code files that will be created to implement the journey state management system.

- `sim/journey/stateMachine.ts` - **Core state management** - The main logic that controls journey states

- `sim/journey/context.ts` - **Journey context and data** - Stores all the journey information (location, time, etc.)

- `sim/journey/transitions.ts` - **State transition logic** - Rules for moving between different states

- `sim/journey/validation.ts` - **Message validation** - Security checks for all incoming messages

- `sim/journey/telemetry.ts` - **State change tracking** - Logs all state changes for debugging and analytics

### 🧪 **Unit Tests**

**What These Tests Do:** These are automated tests that verify each piece of the journey state system works correctly in isolation.

```typescript

describe('Journey State Machine', () => {
  test('should transition IDLE → STARTING → ACTIVE', () => {
    // Test: Start with idle state, send start message, then initialize
    const sm = new JourneyStateMachine();
    expect(sm.getState()).toBe(JourneyState.IDLE);  // Should start idle

    sm.handleMessage({ t: 'start_journey', landId: 1, wardId: 1, sessionId: 'test' });
    expect(sm.getState()).toBe(JourneyState.STARTING);  // Should move to starting

    sm.initialize();
    expect(sm.getState()).toBe(JourneyState.ACTIVE);  // Should become active
  });

  test('should handle pause/resume cycle', () => {
    // Test: Verify pause timing and duration tracking works correctly
  });

  test('should validate message inputs', () => {
    // Test: Make sure invalid inputs (bad landId, wardId, sessionId) are rejected
  });
});

```javascript

### 🔗 **Integration Tests**

**What These Tests Do:** These tests verify that the journey state system works correctly when combined with other parts of the game.

- **Journey state persistence across worker restarts** - Make sure journey state survives app crashes/restarts

- **State synchronization between UI and Sim** - Ensure UI and game simulation stay in sync

- **Error recovery from invalid states** - Test that the system can recover from bad states

### 🎮 **E2E Tests**

**What These Tests Do:** These are "end-to-end" tests that simulate a real player using the game from start to finish.

- **Complete journey lifecycle: start → pause → resume → stop** - Test the full player experience

- **Error scenarios: network failure, invalid data, system errors** - Test what happens when things go wrong

- **Performance under rapid state changes** - Make sure the system can handle quick state changes without breaking

### ✅ **Completion Criteria** (2)

**What We Need to Achieve:** These are the specific goals that must be met before we can move on to the next story.

- [ ] **All state transitions work correctly** - Every state change (idle→starting→active→paused, etc.) works as expected

- [ ] **Message validation prevents invalid state changes** - Bad messages can't break the system

- [ ] **State persistence works across sessions** - Journey state survives app restarts

- [ ] **Telemetry captures all state changes** - We can track and debug all state changes

- [ ] **100% unit test coverage** - Every function has automated tests

- [ ] **95%+ integration test coverage** - Tests cover how components work together

- [ ] **E2E tests pass for complete lifecycle** - Full player journey works from start to finish

---

## 1.1.2: Distance Progression System

**Status:** ⏳ **PENDING**
**Dependencies:** 1.1.1 Complete
**Estimated Effort:** 3-4 days

### 📖 **What This Story Does** (3)

**For Non-Coders:** This story creates the system that tracks how far the dragon travels at a **constant speed**. The dragon doesn't get faster over time - instead, the enemies get stronger as the dragon travels further. Think of it like a progress meter that tracks distance and enemy difficulty. The key features include:

- **Distance Tracking:** How far the dragon has traveled (in meters)

- **Constant Movement:** Dragon moves at steady speed throughout the journey

- **Enemy Scaling:** Enemies get stronger every 5-10 meters (micro-ramps in enemy stats)

- **Progress Visualization:** The UI shows players their current distance and enemy difficulty

- **Speed Boosts:** Later unlocked through enchants and tech tree abilities (not automatic)

**Technical Summary:** Implements constant-speed distance progression with enemy stat scaling at micro-ramp intervals, distance state management, and integration with journey state machine for progression tracking.

### 🏗️ **What We'll Have After 1.1.2**

**For Non-Coders:** After completing this story, players will see:

- Their dragon moving forward at a steady, constant speed

- Distance counter showing how far they've traveled

- Enemy difficulty scaling as they progress further

- Progress visualization showing current distance and enemy strength

**Technical Deliverables:** Complete distance progression system with constant-speed movement, enemy stat scaling at micro-ramp intervals, state management, and telemetry for progression tracking.

### 🔧 **Technical Specifications** (3)

#### Distance Calculation

**What This Does:** Defines the configuration settings that control constant dragon movement speed and enemy stat scaling intervals.

```typescript

interface DistanceConfig {
  baseSpeedMps: number;        // Base dragon speed (15 m/s, upgradeable)
  microRampInterval: number;   // Base enemy scaling interval (5m, upgradeable)
  enemyStatMultiplier: number; // Base enemy scaling rate (1.05x, upgradeable)
  maxEnemyDifficulty: number;  // Base difficulty cap (10x, upgradeable)
}

// What this does: Tracks distance progression upgrades purchased with Soul Power
// Why this exists: Allows players to improve movement speed and adjust enemy scaling
through
meta-progression
// How it integrates: Modifies DistanceConfig values when calculating progression and
enemy
difficulty
interface DistanceUpgrades {
  speedBonus: number;              // Additional speed in m/s (e.g., +5 m/s from upgrades)
rampIntervalReduction: number; // Reduction to micro-ramp interval (0.0 = no reduction,
0.5
=
50%
reduction)
enemyScalingReduction: number; // Reduction to enemy scaling rate (0.0 = no reduction, 0.1
=
10%
reduction)
  difficultyCapBonus: number;      // Additional difficulty cap (e.g., +5x from upgrades)
}

interface DistanceState {
  currentDistance: number;     // How far the dragon has traveled (e.g., 1,250 meters)
enemyDifficultyLevel: number; // Current enemy difficulty multiplier (e.g., 2.5x base
stats)
  lastUpdateTime: number;      // When we last updated the distance (timestamp)
  totalDistance: number;       // Total distance in this journey (for tracking)
microRampCount: number; // How many enemy difficulty increases have occurred (e.g., 250
boosts)
}

```bash

#### Enemy Difficulty Scaling Formula

**What This Does:** This function calculates how much stronger enemies should be based on how far the dragon has traveled.

```typescript

// What this does: Calculates effective distance configuration with upgrades applied
// Why this exists: Allows players to improve movement speed and adjust enemy scaling
through
Soul
Power
purchases
// How it integrates: Used by all distance calculation methods to apply upgrade bonuses
function getEffectiveDistanceConfig(config: DistanceConfig, upgrades: DistanceUpgrades):
DistanceConfig
{
  return {
    baseSpeedMps: config.baseSpeedMps + upgrades.speedBonus,
    microRampInterval: config.microRampInterval * (1 - upgrades.rampIntervalReduction),
enemyStatMultiplier: config.enemyStatMultiplier * (1 - upgrades.enemyScalingReduction),
    maxEnemyDifficulty: config.maxEnemyDifficulty + upgrades.difficultyCapBonus
  };
}

function calculateEnemyDifficulty(distance: number, config: DistanceConfig, upgrades:
DistanceUpgrades):
number
{
  const effectiveConfig = getEffectiveDistanceConfig(config, upgrades);
const rampCount = Math.floor(distance / effectiveConfig.microRampInterval); // How many
difficulty
increases
const difficulty = Math.pow(effectiveConfig.enemyStatMultiplier, rampCount); // Calculate
total
difficulty
return Math.min(difficulty, effectiveConfig.maxEnemyDifficulty); // Cap at maximum
difficulty
}

```text

**Example:** If dragon travels 50 meters with 5m intervals and 1.05x enemy scaling:

- Ramp count = 50 ÷ 5 = 10 increases

- Difficulty = 1.05^10 = 1.63x enemy stats (63% stronger enemies)

function updateDistance(state: DistanceState, dtMs: number, config: DistanceConfig,
upgrades:
DistanceUpgrades):
DistanceState
{
  const effectiveConfig = getEffectiveDistanceConfig(config, upgrades);
const currentSpeed = effectiveConfig.baseSpeedMps; // Dragon speed with upgrades applied
const distanceDelta = (currentSpeed * dtMs) / 1000; // How far to move this frame
  const newDistance = state.currentDistance + distanceDelta;        // New total distance

  return {
    ...state,
currentDistance: newDistance, // Update distance traveled
enemyDifficultyLevel: calculateEnemyDifficulty(newDistance, config, upgrades), // Update
enemy
difficulty
totalDistance: state.totalDistance + distanceDelta, // Update total distance
microRampCount: Math.floor(newDistance / effectiveConfig.microRampInterval) // Update
difficulty
level
count
  };
}

```text

**What This Does:** Updates the dragon's distance at constant speed and calculates current enemy difficulty level.

#### Micro-Ramp System

**What This Does:** Manages the individual enemy difficulty scaling points as the dragon travels further.

```typescript

interface DifficultyRamp {
distance: number; // At what distance this difficulty increase activates (e.g., 5m, 10m,
15m)
difficultyMultiplier: number; // How much stronger enemies become (e.g., 1.05x, 1.10x,
1.15x)
  isActive: boolean;          // Whether the dragon has reached this difficulty level yet
}

class DifficultyRampManager {
  private ramps: DifficultyRamp[] = [];  // List of all difficulty scaling points

  constructor(private config: DistanceConfig) {
    this.generateRamps();  // Create all the difficulty scaling points upfront
  }

  private generateRamps(): void {
    for (let i = 0; i < 1000; i++) { // Generate first 1000 difficulty scaling points
const distance = i * this.config.microRampInterval; // Distance for this scaling (5m, 10m,
etc.)
const difficulty = Math.pow(this.config.enemyStatMultiplier, i); // Enemy difficulty
multiplier
      this.ramps.push({
distance, // Where this scaling happens
difficultyMultiplier: Math.min(difficulty, this.config.maxEnemyDifficulty), // Cap at max
difficulty
        isActive: false  // Start as inactive (dragon hasn't reached it yet)
      });
    }
  }

  updateActiveRamps(currentDistance: number): void {
    this.ramps.forEach(ramp => {
ramp.isActive = currentDistance >= ramp.distance; // Mark as active if dragon has reached
this
distance
    });
  }

```javascript

**What This Does:** Checks which enemy difficulty scaling points have been reached based on how far the dragon has traveled and marks them as active.

### 📦 **Deliverables** (2)

**What These Files Do:** These are the actual code files that will be created to implement the distance progression system.

- `sim/distance/config.ts` - **Distance configuration constants** - Settings for base speed, enemy scaling intervals, and limits

- `sim/distance/upgrades.ts` - **Distance progression upgrade system** - Soul Power upgrades for speed, scaling, and difficulty adjustments

- `sim/distance/state.ts` - **Distance state management** - Tracks current distance and enemy difficulty level

- `sim/distance/calculator.ts` - **Distance and enemy difficulty calculations** - Math functions for progression with upgrades

- `sim/distance/ramps.ts` - **Micro-ramp management system** - Handles enemy difficulty scaling points with upgrade support

- `sim/distance/telemetry.ts` - **Distance progression tracking** - Logs distance and difficulty data for analytics

### 🧪 **Unit Tests** (2)

**What These Tests Do:** These are automated tests that verify the distance progression and enemy difficulty scaling math works correctly.

```typescript

describe('Distance Progression System', () => {
  test('should calculate correct enemy difficulty', () => {
    // Test: Verify enemy difficulty calculation with different distances
    const config: DistanceConfig = {
      baseSpeedMps: 15,           // Constant 15 meters per second
      microRampInterval: 5,       // Enemy scaling every 5 meters
      enemyStatMultiplier: 1.05,  // 5% stronger each scaling
      maxEnemyDifficulty: 10.0    // Cap at 10x difficulty
    };

const zeroUpgrades: DistanceUpgrades = { speedBonus: 0, rampIntervalReduction: 0,
enemyScalingReduction:
0,
difficultyCapBonus:
0
};

expect(calculateEnemyDifficulty(0, config, zeroUpgrades)).toBe(1.0); // No scaling at 0m
expect(calculateEnemyDifficulty(5, config, zeroUpgrades)).toBeCloseTo(1.05, 2); // 1
scaling
at
5m
=
5%
stronger
expect(calculateEnemyDifficulty(50, config, zeroUpgrades)).toBeCloseTo(2.65, 2); // 10
scalings
at
50m
=
165%
stronger
expect(calculateEnemyDifficulty(500, config, zeroUpgrades)).toBe(10.0); // Capped at
maximum
difficulty
  });

  test('should apply distance upgrades correctly', () => {
    const config: DistanceConfig = {
      baseSpeedMps: 15,
      microRampInterval: 5,
      enemyStatMultiplier: 1.05,
      maxEnemyDifficulty: 10.0
    };

    const upgrades: DistanceUpgrades = {
      speedBonus: 5,                    // +5 m/s speed bonus
rampIntervalReduction: 0.5, // 50% reduction to ramp interval (2.5m instead of 5m)
enemyScalingReduction: 0.1, // 10% reduction to enemy scaling (1.045x instead of 1.05x)
      difficultyCapBonus: 5             // +5x difficulty cap (15x instead of 10x)
    };

    // Test speed upgrade
    const effectiveConfig = getEffectiveDistanceConfig(config, upgrades);
    expect(effectiveConfig.baseSpeedMps).toBe(20);  // 15 + 5 = 20 m/s

    // Test ramp interval reduction
    expect(effectiveConfig.microRampInterval).toBe(2.5);  // 5 * (1 - 0.5) = 2.5m

    // Test enemy scaling reduction
expect(effectiveConfig.enemyStatMultiplier).toBeCloseTo(1.045, 3); // 1.05 * (1 - 0.1) =
1.045

    // Test difficulty cap bonus
    expect(effectiveConfig.maxEnemyDifficulty).toBe(15);  // 10 + 5 = 15x
  });

  test('should update distance correctly over time', () => {
    // Test: Verify distance updates correctly at constant speed
    const state: DistanceState = {
      currentDistance: 0,        // Start at 0 meters
      enemyDifficultyLevel: 1.0, // No difficulty scaling yet
      lastUpdateTime: 0,
      totalDistance: 0,
      microRampCount: 0
    };

    const config: DistanceConfig = {
      baseSpeedMps: 15,           // 15 meters per second constant
      microRampInterval: 5,       // Enemy scaling every 5 meters
      enemyStatMultiplier: 1.05,  // 5% stronger each scaling
      maxEnemyDifficulty: 10.0
    };

const zeroUpgrades: DistanceUpgrades = { speedBonus: 0, rampIntervalReduction: 0,
enemyScalingReduction:
0,
difficultyCapBonus:
0
};
const updatedState = updateDistance(state, 1000, config, zeroUpgrades); // Simulate 1
second
(1000ms)
expect(updatedState.currentDistance).toBeCloseTo(15, 1); // Should travel ~15 meters in 1
second
expect(updatedState.totalDistance).toBeCloseTo(15, 1); // Total distance should match
expect(updatedState.microRampCount).toBe(3); // Should have 3 enemy scaling events (0-5,
5-10,
10-15)
  });
});

```javascript

### 🔗 **Integration Tests** (2)

**What These Tests Do:** These tests verify that the distance progression system works correctly when combined with other game systems.

- **Distance progression with pause/resume** - Make sure distance tracking continues correctly after pausing and resuming

- **Enemy difficulty changes at micro-ramp boundaries** - Verify enemy scaling activates at exactly the right distances

- **Performance with large distance values** - Ensure the system remains fast even with very large distances

### 🎮 **E2E Tests** (2)

**What These Tests Do:** These tests simulate a real player experiencing the distance progression system.

- **Complete distance progression over 1 hour of gameplay** - Test the full progression experience

- **Micro-ramp activation at correct distances** - Verify enemy difficulty scaling happens at the right times

- **Enemy difficulty visualization in UI** - Make sure players can see enemy strength changes

### ✅ **Completion Criteria** (3)

**What We Need to Achieve:** These are the specific goals that must be met before we can move on to the next story.

- [ ] **Distance calculation is mathematically correct** - All distance and enemy difficulty math works perfectly

- [ ] **Micro-ramp system activates at proper intervals** - Enemy difficulty scaling happens exactly when it should

- [ ] **Enemy difficulty scaling follows defined formula** - Enemy stats increase according to the design

- [ ] **Constant dragon speed maintained** - Dragon moves at steady speed throughout journey

- [ ] **Performance remains stable at high distances** - System stays fast even after traveling very far

- [ ] **Distance upgrade system integrates with Soul Power** - Players can upgrade speed and scaling parameters

- [ ] **Upgrades persist across sessions and modify distance parameters** - Upgrade bonuses apply consistently

- [ ] **Upgrade costs scale appropriately** - Prevents infinite progression while allowing meaningful improvements

- [ ] **100% unit test coverage** - Every function has automated tests

- [ ] **95%+ integration test coverage** - Tests cover how components work together

- [ ] **E2E tests pass for extended progression and upgrade scenarios** - Full progression experience works from start to finish

---

## 1.1.3: Ward/Land State Machine

**Status:** ⏳ **PENDING**
**Dependencies:** 1.1.2 Complete
**Estimated Effort:** 2-3 days

### 🎯 **What This Story Does**

**For Non-Coders:** This story creates the system that manages how players progress through different areas (wards) within each land. Think of it like level progression in a game - players start in Ward 1, then advance to Ward 2, Ward 3, etc. as they get stronger. Each ward has different enemies, difficulty, and rewards. The system also handles what happens when players reach the end of a ward and need to advance to the next one. Key features include:

- **Ward Progression:** How players advance from Ward 1 → Ward 2 → Ward 3 → Ward 4 → Ward 5

- **Land Management:** How players unlock new lands (Land 1, Land 2, Land 3, etc.)

- **Difficulty Scaling:** Each ward gets progressively harder with stronger enemies

- **Transition Logic:** What happens when players complete a ward and move to the next

- **Configuration System:** How the game knows what enemies and rewards each ward should have

**Technical Summary:** Implement ward/land state machine with progression logic, configuration management for ward parameters, transition handling between wards, and integration with journey state machine for area advancement.

### 🏗️ **What We'll Have After 1.1.3**

**For Non-Coders:** After this story, players will be able to progress through different wards within each land, with each ward getting progressively more challenging. The game will automatically handle transitions between wards and track the player's current location and progress.

**Technical Summary:** Complete ward/land progression system with configuration management, state transitions, and integration with journey and distance systems.

### 🔧 **Technical Specifications** (4)

**What This Section Does:** This section defines the technical implementation details for the ward/land progression system, including data structures, state management, and configuration systems.

#### Ward/Land Configuration

**What This Does:** Defines the data structures that store information about different lands and wards, including their difficulty, length, enemies, and progression requirements.

**Why This Exists:** Provides the foundation for managing player progression through different areas and ensures consistent difficulty scaling.

**How It Integrates:** Used by the ward state machine to determine when players can advance and what challenges they'll face.

```typescript

interface LandConfig {
  id: LandId;
  name: string;
  description: string;
  baseDifficultyMultiplier: number;  // Base difficulty multiplier (upgradeable)
  wards: WardConfig[];
}

interface WardConfig {
  id: WardId;
  landId: LandId;
  name: string;
  baseLengthM: number;       // Base distance to complete ward (upgradeable)
  bossId?: BossId;          // Optional boss at end
  enemyPools: EnemyPool[];
  baseScalingFactor: number; // Base ward-specific scaling (upgradeable)
}

// What this does: Tracks ward/land upgrades purchased with Soul Power
// Why this exists: Allows players to reduce ward lengths, adjust difficulty scaling, and
modify
land
progression
through
meta-progression
// How it integrates: Modifies LandConfig and WardConfig values when calculating
progression
requirements
and
difficulty
scaling
interface WardLandUpgrades {
  // Ward Length Reductions - Reduce distance needed to complete wards
wardLengthReduction: number; // Reduction to ward lengths (0.0 = no reduction, 0.5 = 50%
reduction)

  // Difficulty Scaling Modifications - Adjust enemy scaling within wards
scalingFactorReduction: number; // Reduction to ward scaling factors (0.0 = no reduction,
0.3
=
30%
reduction)

  // Land Difficulty Adjustments - Modify overall land difficulty
landDifficultyReduction: number; // Reduction to land difficulty multipliers (0.0 = no
reduction,
0.2
=
20%
reduction)

  // Progression Bonuses - Additional benefits for ward completion
wardCompletionBonus: number; // Bonus rewards for completing wards (0.0 = no bonus, 0.25 =
+25%
rewards)

  // Boss Encounter Modifications - Adjust boss difficulty and rewards
bossDifficultyReduction: number; // Reduction to boss difficulty (0.0 = no reduction, 0.15
=
15%
reduction)
bossRewardBonus: number; // Bonus rewards from bosses (0.0 = no bonus, 0.5 = +50% rewards)
}

interface WardState {
  currentWard: WardId;
  progress: number;         // 0.0 to 1.0
  distanceInWard: number;   // Meters traveled in current ward
  enemiesSpawned: number;
  bossesDefeated: number;
}

```text

#### State Transitions (2)

**What This Does:** Defines the logic for how players advance between wards and the different reasons why ward transitions can occur.

**Why This Exists:** Ensures consistent and predictable ward advancement while supporting different progression scenarios (distance-based, boss defeat, manual advancement).

**How It Integrates:** Used by the ward state machine to determine when and why players should advance to the next ward.

```typescript

// What this does: Defines the different reasons why a player might advance to the next
ward
// Why this exists: Allows the system to handle various progression scenarios consistently
// How it integrates: Used by the WardLandStateMachine to determine transition logic
enum WardTransitionReason {
  DISTANCE*REACHED = 'distance*reached',
  BOSS*DEFEATED = 'boss*defeated',
  MANUAL*ADVANCE = 'manual*advance',
  RESET = 'reset'
}

class WardLandStateMachine {
  private currentLand: LandId;
  private currentWard: WardId;
  private wardProgress: Map<WardId, WardState>;

  constructor(
    private landConfigs: Map<LandId, LandConfig>,
    private upgrades: WardLandUpgrades
  ) {
    this.wardProgress = new Map();
  }

  // What this does: Calculates effective ward configuration with upgrades applied
// Why this exists: Allows players to reduce ward lengths and adjust difficulty through
Soul
Power
purchases
  // How it integrates: Used by all ward progression calculations to apply upgrade bonuses
  private getEffectiveWardConfig(wardConfig: WardConfig): WardConfig {
    return {
      ...wardConfig,
      baseLengthM: wardConfig.baseLengthM * (1 - this.upgrades.wardLengthReduction),
baseScalingFactor: wardConfig.baseScalingFactor * (1 -
this.upgrades.scalingFactorReduction)
    };
  }

  // What this does: Calculates effective land configuration with upgrades applied
// Why this exists: Allows players to reduce overall land difficulty through Soul Power
purchases
  // How it integrates: Used by all land difficulty calculations to apply upgrade bonuses
  private getEffectiveLandConfig(landConfig: LandConfig): LandConfig {
    return {
      ...landConfig,
baseDifficultyMultiplier: landConfig.baseDifficultyMultiplier * (1 -
this.upgrades.landDifficultyReduction)
    };
  }

  advanceToNextWard(reason: WardTransitionReason): boolean {
    const currentConfig = this.getCurrentWardConfig();
    if (!currentConfig) return false;

    const nextWardId = this.getNextWardId();
    if (!nextWardId) return false; // No more wards

    // Complete current ward
    this.completeWard(currentConfig, reason);

    // Start next ward
    this.startWard(nextWardId);

    return true;
  }

  updateProgress(distanceDelta: number): void {
    const currentConfig = this.getCurrentWardConfig();
    if (!currentConfig) return;

    const effectiveConfig = this.getEffectiveWardConfig(currentConfig);
    const wardState = this.wardProgress.get(this.currentWard)!;
    wardState.distanceInWard += distanceDelta;
wardState.progress = Math.min(wardState.distanceInWard / effectiveConfig.baseLengthM,
1.0);

    // Check for ward completion
    if (wardState.progress >= 1.0) {
      this.advanceToNextWard(WardTransitionReason.DISTANCE_REACHED);
    }
  }
}

```javascript

### 📦 **Deliverables** (3)

**What This Section Does:** Lists all the files and components that will be created to implement the ward/land progression system.

**For Non-Coders:** These are the "building blocks" that developers will create to make the ward progression system work.

- `sim/ward/config.ts` - Ward and land configuration with upgradeable base values

- `sim/ward/upgrades.ts` - Ward/land upgrade system with Soul Power integration

- `sim/ward/stateMachine.ts` - Ward progression state machine with upgrade support

- `sim/ward/progress.ts` - Progress tracking system with effective config calculations

- `sim/ward/transitions.ts` - Ward transition logic with upgrade bonuses

- `sim/ward/telemetry.ts` - Ward progression tracking with upgrade analytics

### 🧪 **Unit Tests** (3)

**What This Section Does:** Defines the individual tests that verify each component of the ward/land system works correctly in isolation.

**For Non-Coders:** These are automated tests that check if each piece of the ward progression system works properly by itself.

```typescript

// What this does: Tests the ward/land state machine to ensure it works correctly
// Why this exists: Ensures ward progression logic is reliable and predictable
// How it integrates: Part of the overall test suite that validates the ward system
describe('Ward/Land State Machine', () => {
  test('should advance wards based on distance', () => {
    const config = createTestLandConfig();
    const zeroUpgrades: WardLandUpgrades = {
      wardLengthReduction: 0,
      scalingFactorReduction: 0,
      landDifficultyReduction: 0,
      wardCompletionBonus: 0,
      bossDifficultyReduction: 0,
      bossRewardBonus: 0
    };
    const sm = new WardLandStateMachine(config, zeroUpgrades);

    expect(sm.getCurrentWard()).toBe(WardId.W1);

    // Travel full distance of W1 (1000 meters - test uses fixed value for reliability)
    sm.updateProgress(1000); // Fixed test value for consistent testing
    expect(sm.getCurrentWard()).toBe(WardId.W2);
  });

  test('should handle boss defeat transitions', () => {
    const config = createTestConfig();
    const zeroUpgrades: WardLandUpgrades = {
      wardLengthReduction: 0,
      scalingFactorReduction: 0,
      landDifficultyReduction: 0,
      wardCompletionBonus: 0,
      bossDifficultyReduction: 0,
      bossRewardBonus: 0
    };
    const sm = new WardLandStateMachine(config, zeroUpgrades);
    sm.advanceToNextWard(WardTransitionReason.BOSS_DEFEATED);
    expect(sm.getCurrentWard()).toBe(WardId.W2);
  });

  test('should apply ward length upgrades correctly', () => {
    const config = createTestLandConfig();
    const upgrades: WardLandUpgrades = {
      wardLengthReduction: 0.5,  // 50% reduction - test uses fixed value for reliability
      scalingFactorReduction: 0,
      landDifficultyReduction: 0,
      wardCompletionBonus: 0,
      bossDifficultyReduction: 0,
      bossRewardBonus: 0
    };
    const sm = new WardLandStateMachine(config, upgrades);

    expect(sm.getCurrentWard()).toBe(WardId.W1);

    // With 50% length reduction, only need 500 meters instead of 1000
    sm.updateProgress(500); // Fixed test value for consistent testing
    expect(sm.getCurrentWard()).toBe(WardId.W2);
  });
});

```javascript

### 🔗 **Integration Tests** (3)

**What This Section Does:** Defines tests that verify how the ward/land system works together with other game systems (like distance tracking and boss encounters).

**For Non-Coders:** These tests ensure that the ward progression system works correctly when combined with other parts of the game.

- Ward progression with distance updates

- Boss defeat triggering ward advancement

- Land completion and reset functionality

### 🎮 **E2E Tests** (3)

**What This Section Does:** Defines end-to-end tests that verify the complete ward progression experience from a player's perspective.

**For Non-Coders:** These tests simulate a real player going through the entire ward progression system to ensure everything works together smoothly.

- Complete ward progression through all 5 wards

- Boss encounters at ward boundaries

- Land completion and restart

### ✅ **Completion Criteria** (4)

**What This Section Does:** Lists the specific requirements that must be met for this story to be considered complete and ready for the next story.

**For Non-Coders:** These are the "checklist items" that developers must complete before moving on to the next part of the system.

- [ ] Ward progression works based on distance

- [ ] Boss defeats advance to next ward

- [ ] Progress tracking is accurate

- [ ] Land completion triggers appropriate events

- [ ] Configuration system is flexible and upgradeable

- [ ] Upgrade system reduces ward lengths and difficulty correctly

- [ ] Effective configuration calculations work with all upgrade combinations

- [ ] Soul Power upgrades integrate with ward progression

- [ ] 100% unit test coverage including upgrade scenarios

- [ ] 95%+ integration test coverage with upgrade system

- [ ] E2E tests pass for complete ward progression with upgrades

---

## 1.1.4: Return to Draconia System

**Status:** ⏳ **PENDING**
**Dependencies:** 1.1.3 Complete
**Estimated Effort:** 3-4 days

### 🎯 **What This Story Does** (2)

**For Non-Coders:** This story creates the system for when players return to Draconia from their journey. Instead of donating all their Arcana (like in the old system), players now keep their Arcana but pay a Shield Tax. This tax is 25% of their total Arcana and goes to help protect the city. The system also resets temporary enchantments while keeping permanent upgrades, and handles selling items for Gold.

**Technical Summary:** Implement return flow with Shield Tax system (25% of total Arcana), enchantment reset to permanent starting levels, item sales for Gold, and complete journey lifecycle management.

### 🔧 **Technical Specifications** (5)

**What This Section Does:** This section defines the technical implementation details for the return to Draconia system, including the Shield Tax calculation, enchantment reset logic, and item sales processing.

#### Return Flow State Machine

**What This Does:** Defines the different states that the return process can be in, ensuring a smooth and reliable return experience for players.

**Why This Exists:** Provides clear state management for the return process, preventing errors and ensuring all return steps are completed properly.

**How It Integrates:** Used by the return system to track progress and handle different return scenarios (manual return, boss defeat, death).

```typescript

// What this does: Defines the states for the return to Draconia process
// Why this exists: Ensures reliable and predictable return flow
// How it integrates: Used by the return manager to track return progress
enum ReturnState {
  IDLE = 'idle',
  INITIATING = 'initiating',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

interface ReturnContext {
  state: ReturnState;
  reason: ReturnReason;
  shieldTaxPaid: number;        // Amount paid as Shield Tax
  arcanaRetained: number;       // Arcana kept after tax
  enchantmentsReset: boolean;
  itemsSold: ItemSale[];
  sessionStats: SessionStats;
  timestamp: number;
}

enum ReturnReason {
  USER*REQUEST = 'user*request',
  BOSS*DEFEATED = 'boss*defeated',
  DRAGON*DEATH = 'dragon*death',
  TIME*LIMIT = 'time*limit',
  ERROR*RECOVERY = 'error*recovery'
}

```bash

#### Shield Tax System (v2.3.1)

```typescript

interface ShieldTaxConfig {
  baseTaxRate: number;          // Base tax rate (0.25 = 25%, upgradeable)
maxLegendaryReduction: number; // Maximum reduction from legendary status (0.15 = 15%,
upgradeable)
legendaryReductionRate: number; // Reduction per legendary level (0.01 = 1%, upgradeable)
}

// What this does: Tracks Shield Tax upgrades purchased with Soul Power
// Why this exists: Allows players to reduce tax burden and improve legendary benefits
through
meta-progression
// How it integrates: Modifies ShieldTaxConfig values when calculating tax rates and
reductions
interface ShieldTaxUpgrades {
taxRateReduction: number; // Reduction to base tax rate (0.0 = no reduction, 0.1 = 10%
reduction)
legendaryBonus: number; // Additional legendary reduction (e.g., +0.05 = +5% reduction)
maxReductionBonus: number; // Additional maximum reduction (e.g., +0.05 = +5% max
reduction)
}

interface ShieldTaxCalculation {
  totalArcana: number;          // Total arcana before tax
  baseTaxRate: number;          // Base tax rate (upgradeable)
  legendaryReduction: number;   // Reduction from legendary status
  effectiveTaxRate: number;     // Final tax rate after reductions
  taxAmount: number;            // Amount paid as tax
  arcanaRetained: number;       // Arcana kept after tax
}

class ShieldTaxCalculator {
  constructor(
    private config: ShieldTaxConfig,
    private upgrades: ShieldTaxUpgrades
  ) {}

  // What this does: Calculates effective Shield Tax configuration with upgrades applied
  // Why this exists: Allows players to reduce tax burden through Soul Power purchases
  // How it integrates: Used by tax calculation methods to apply upgrade bonuses
  private getEffectiveConfig(): ShieldTaxConfig {
    return {
      baseTaxRate: this.config.baseTaxRate * (1 - this.upgrades.taxRateReduction),
maxLegendaryReduction: this.config.maxLegendaryReduction +
this.upgrades.maxReductionBonus,
legendaryReductionRate: this.config.legendaryReductionRate + this.upgrades.legendaryBonus
    };
  }

  calculateShieldTax(
    totalArcana: number,
    legendaryStatus: number = 0
  ): ShieldTaxCalculation {
    const effectiveConfig = this.getEffectiveConfig();
    const legendaryReduction = Math.min(
      legendaryStatus * effectiveConfig.legendaryReductionRate,
      effectiveConfig.maxLegendaryReduction
    );
    const effectiveTaxRate = effectiveConfig.baseTaxRate - legendaryReduction;
    const taxAmount = Math.floor(totalArcana * effectiveTaxRate);
    const arcanaRetained = totalArcana - taxAmount;

    return {
      totalArcana,
      baseTaxRate: effectiveConfig.baseTaxRate,
      legendaryReduction,
      effectiveTaxRate,
      taxAmount,
      arcanaRetained
    };
  }

  // What this does: Calculates the Shield Tax based on total Arcana and legendary status
  // Higher legendary status reduces the tax rate (up to 15% reduction)
  // Players keep most of their Arcana instead of donating it all
}

```javascript

#### Dual-Layer Enchantment Reset System

```typescript

interface EnchantmentState {
  temporary: {
    firepower: number;
    scales: number;
    tier: number;
  };
  permanent: {
    firepower: number;
    scales: number;
    tier: number;
  };
  effective: {
    firepower: number;
    scales: number;
    tier: number;
  };
}

class EnchantmentResetSystem {
  resetEnchantments(currentState: EnchantmentState): EnchantmentReset {
    // Reset temporary levels to permanent starting levels
    const newTemporaryState = { ...currentState.permanent };
const newEffectiveState = this.calculateEffectiveLevels(newTemporaryState,
currentState.permanent);

    return {
      previousState: currentState,
      newState: {
        temporary: newTemporaryState,
        permanent: currentState.permanent, // Permanent levels never change
        effective: newEffectiveState
      },
      timestamp: Date.now()
    };
  }

  private calculateEffectiveLevels(temporary: any, permanent: any): any {
    // Effective levels = temporary + permanent
    return {
      firepower: temporary.firepower + permanent.firepower,
      scales: temporary.scales + permanent.scales,
      tier: Math.max(temporary.tier, permanent.tier)
    };
  }

  // What this does: Resets temporary enchant levels to permanent starting levels
  // Permanent levels are never changed during reset
  // Effective levels are recalculated as temporary + permanent
}

```bash

### 📦 **Deliverables** (4)

**What These Files Do:** These are the actual code files that will be created to implement the complete return-to-Draconia system, including the new Shield Tax and persistent Arcana features.

**For Non-Coders:** These files handle everything that happens when a dragon returns home from a journey - calculating taxes, processing rewards, resetting temporary upgrades, and saving progress.

**Technical Context:** Each file has a specific responsibility in the return flow, ensuring modular design and easy testing of individual components.

- `sim/return/stateMachine.ts` - **Return flow state machine** - Controls the step-by-step process of returning to Draconia

- `sim/return/shieldTax.ts` - **Shield Tax calculation system** - Calculates configurable tax on gained Arcana with legendary status reductions and upgrades

- `sim/return/shieldTaxUpgrades.ts` - **Shield Tax upgrade system** - Soul Power upgrades for reducing tax rates and improving legendary benefits

- `sim/return/enchantments.ts` - **Dual-layer enchantment reset system** - Resets temporary enchantments while preserving permanent upgrades

- `sim/return/items.ts` - **Item sale system** - Handles selling journey items for Gold currency

- `sim/return/telemetry.ts` - **Return flow tracking** - Logs all return activities for analytics and debugging

### 🧪 **Unit Tests** (4)

**What These Tests Do:** These are automated tests that verify each component of the return system works correctly in isolation, ensuring the Shield Tax, enchantment reset, and Arcana persistence all function properly.

**For Non-Coders:** These tests act like quality checks that run automatically to make sure the return system calculates taxes correctly, saves progress properly, and doesn't lose any player data.

**Technical Context:** Unit tests verify individual functions and classes work as expected, providing confidence that the return flow will handle edge cases and error conditions properly.

```typescript

describe('Return to Draconia System', () => {
  test('should calculate correct Shield Tax with base configuration', () => {
    const config: ShieldTaxConfig = {
      baseTaxRate: 0.25,
      maxLegendaryReduction: 0.15,
      legendaryReductionRate: 0.01
    };
const zeroUpgrades: ShieldTaxUpgrades = { taxRateReduction: 0, legendaryBonus: 0,
maxReductionBonus:
0
};
    const calculator = new ShieldTaxCalculator(config, zeroUpgrades);
    const tax = calculator.calculateShieldTax(1000, 0);

    expect(tax.taxAmount).toBe(250); // 25% of 1000
    expect(tax.arcanaRetained).toBe(750);
    expect(tax.effectiveTaxRate).toBe(0.25);
  });

  test('should apply Shield Tax upgrades correctly', () => {
    const config: ShieldTaxConfig = {
      baseTaxRate: 0.25,
      maxLegendaryReduction: 0.15,
      legendaryReductionRate: 0.01
    };
    const upgrades: ShieldTaxUpgrades = {
      taxRateReduction: 0.2,        // 20% reduction to base tax rate
      legendaryBonus: 0.005,        // +0.5% per legendary level
      maxReductionBonus: 0.05       // +5% maximum reduction
    };
    const calculator = new ShieldTaxCalculator(config, upgrades);
    const tax = calculator.calculateShieldTax(1000, 10); // 10 legendary status

    // Base tax rate should be 20% (25% * (1 - 0.2) = 20%)
    // Legendary reduction should be 15% (10 * 0.015 = 15%, capped at 20% max)
    // Effective tax rate should be 5% (20% - 15% = 5%)
    expect(tax.effectiveTaxRate).toBeCloseTo(0.05, 2);
    expect(tax.taxAmount).toBe(50);  // 5% of 1000
    expect(tax.arcanaRetained).toBe(950);
  });

  test('should reduce Shield Tax with legendary status', () => {
    const config: ShieldTaxConfig = {
      baseTaxRate: 0.25,
      maxLegendaryReduction: 0.15,
      legendaryReductionRate: 0.01
    };
const zeroUpgrades: ShieldTaxUpgrades = { taxRateReduction: 0, legendaryBonus: 0,
maxReductionBonus:
0
};
    const calculator = new ShieldTaxCalculator(config, zeroUpgrades);
    const tax = calculator.calculateShieldTax(1000, 10); // 10 legendary status

    expect(tax.legendaryReduction).toBe(0.10); // 10% reduction
    expect(tax.effectiveTaxRate).toBe(0.15); // 25% - 10% = 15%
    expect(tax.taxAmount).toBe(150); // 15% of 1000
    expect(tax.arcanaRetained).toBe(850);
  });

  test('should reset enchantments to permanent starting levels', () => {
    const resetSystem = new EnchantmentResetSystem();
    const currentState: EnchantmentState = {
      temporary: { firepower: 15, scales: 8, tier: 3 },
      permanent: { firepower: 5, scales: 3, tier: 2 },
      effective: { firepower: 20, scales: 11, tier: 3 }
    };

    const reset = resetSystem.resetEnchantments(currentState);
    expect(reset.newState.temporary).toEqual({ firepower: 5, scales: 3, tier: 2 });
    expect(reset.newState.permanent).toEqual({ firepower: 5, scales: 3, tier: 2 });
    expect(reset.newState.effective).toEqual({ firepower: 10, scales: 6, tier: 2 });
  });
});

```javascript

### 🔗 **Integration Tests** (4)

**What These Tests Do:** These tests verify that all the return system components work together correctly, ensuring the complete return flow processes Shield Tax, resets enchantments, and saves progress seamlessly.

**For Non-Coders:** These tests make sure that when a dragon returns home, everything happens in the right order - taxes are calculated, temporary upgrades are reset, permanent upgrades are preserved, and all progress is saved properly.

**Technical Context:** Integration tests verify that multiple systems work together correctly, catching issues that individual unit tests might miss, such as data flow between components.

- Complete return flow with Shield Tax calculation

- Dual-layer enchantment reset system

- Item sale integration with Gold currency

- Arcana persistence across journeys

### 🎮 **E2E Tests** (4)

**What These Tests Do:** These tests simulate complete player scenarios from the end of a journey all the way back to Draconia, ensuring the entire return experience works correctly from the player's perspective.

**For Non-Coders:** These tests act like a player actually playing the game - they simulate clicking buttons, waiting for processes to complete, and verifying that everything works as expected from start to finish.

**Technical Context:** End-to-end tests verify the complete user journey and catch integration issues that only appear when all systems work together in realistic scenarios.

- Full return flow from journey end to Draconia

- Multiple return scenarios (boss defeat, manual return, death)

- Shield Tax calculation with legendary status

- Enchantment reset to permanent starting levels

- Data persistence after return

### ✅ **Completion Criteria** (5)

**What These Criteria Ensure:** These are the specific requirements that must be met before Story 1.1.4 is considered complete, covering functionality, testing, and quality standards.

**For Non-Coders:** These checkboxes ensure that the return system works reliably and safely, protecting player progress and providing a smooth experience when coming back from journeys.

**Technical Context:** Completion criteria provide measurable goals and ensure all aspects of the return system are thoroughly tested and validated before moving to the next story.

- [ ] Return flow state machine works correctly

- [ ] Shield Tax calculations are accurate with configurable base rates and legendary reductions

- [ ] Shield Tax upgrade system integrates with Soul Power for tax rate reductions and legendary bonuses

- [ ] Dual-layer enchantment reset system functions properly

- [ ] Arcana persists across journeys (not donated)

- [ ] Item sales are processed correctly for Gold

- [ ] All return scenarios work (boss, manual, death)

- [ ] Upgrade costs scale appropriately to prevent infinite progression

- [ ] 100% unit test coverage

- [ ] 95%+ integration test coverage

- [ ] E2E tests pass for all return scenarios and upgrade combinations

### 🏗️ **What We'll Have After 1.1.4**

**For Non-Coders:** After this story, players will have a complete return system that handles coming back to Draconia from journeys. They'll keep most of their Arcana (paying a small tax to help protect the city), their temporary enchantments will reset, but their permanent upgrades will remain. They'll also be able to sell items for Gold and see a summary of their journey rewards.

**Technical Summary:** Complete return flow system with Shield Tax calculation, dual-layer enchantment reset, item sales processing, and comprehensive journey lifecycle management with telemetry tracking.

---

## 1.1.5: Basic Offline Progression

**Status:** ⏳ **PENDING**
**Dependencies:** 1.1.4 Complete
**Estimated Effort:** 4-5 days

### 🎯 **What This Story Does** (3)

**For Non-Coders:** This story creates the system that allows the game to continue progressing even when players are not actively playing. Think of it like a city simulation that keeps running in the background - when players come back after being away, they'll find that their dragon has made some progress automatically. The system includes:

- **Offline Simulation:** The game continues running even when the app is closed

- **Progression Decay:** The longer players are away, the less efficient the offline progress becomes

- **Time Limits:** Offline progress has a maximum duration (24 hours) to prevent infinite gains

- **Linear to Diminishing:** First 8 hours give full progress, then efficiency decreases over time

- **Return Calculation:** When players come back, the game calculates how much progress was made

**Technical Summary:** Implement offline progression simulation with linear decay model (8h full efficiency, then diminishing returns), maximum 24-hour offline limit, and comprehensive offline session management with telemetry tracking.

### 🏗️ **What We'll Have After 1.1.5**

**For Non-Coders:** After this story, players can close the game and come back later to find that their dragon has made some progress automatically. This makes the game feel alive and rewards players for returning, while preventing excessive offline gains that would break the game balance.

**Technical Summary:** Complete offline progression system with decay mechanics, session management, and integration with journey state machine for seamless offline/online transitions.

### 🔧 **Technical Specifications** (6)

**What This Section Does:** This section defines the technical implementation details for the offline progression system, including data structures, simulation models, and background processing systems.

**For Non-Coders:** This section explains the technical blueprint for how the game continues to make progress even when players aren't actively playing, detailing the underlying code and calculations that make offline progression work.

**Technical Context:** The offline progression system uses mathematical models to simulate what would have happened if the player had been actively playing, with realistic decay mechanics to prevent exploitation.

#### Offline Simulation Model

**What This Does:** Defines the configuration settings that control how offline progression works, including time limits, efficiency decay, and progression rates.

**Why This Exists:** Provides a balanced system where players get meaningful progress when offline but can't exploit the system with excessive offline time, maintaining game balance and encouraging active play.

**How It Integrates:** These settings are used by the offline simulator to calculate how much progress a player should receive when they return, based on how long they were away.

**Implementation Details:** The model uses a two-phase system: full efficiency for the first 8 hours, then linear decay down to 10% minimum efficiency over the next 16 hours.

```typescript

interface OfflineConfig {
  maxOfflineHours: number;        // Maximum offline time (24 hours base, upgradeable)
  linearDecayStart: number;       // Hours before decay starts (8 hours base, upgradeable)
  decayRate: number;              // Decay rate per hour (0.1 = 10% base, reducible)
  minEfficiency: number;          // Minimum efficiency (0.1 = 10% base, upgradeable)
  baseProgressionRate: number;    // Base progression rate (1.0 = 100%, upgradeable)
}

// What this does: Tracks offline progression upgrades purchased with Soul Power
// Why this exists: Allows players to improve offline progression through meta-progression
// How it integrates: Modifies OfflineConfig values when calculating offline gains
interface OfflineUpgrades {
  maxHoursBonus: number;          // Additional hours added to maxOfflineHours
  decayStartBonus: number;        // Additional hours before decay starts
decayReduction: number; // Reduction to decayRate (0.0 = no reduction, 0.5 = 50%
reduction)
  minEfficiencyBonus: number;     // Bonus added to minEfficiency
  progressionBonus: number;       // Multiplier to baseProgressionRate
}

interface OfflineSession {
  startTime: number;              // Timestamp when offline started
  endTime: number;                // Timestamp when returning
  totalOfflineMs: number;         // Total offline time in milliseconds
  effectiveOfflineMs: number;     // Effective offline time after decay
  progressionGained: number;      // Total progression gained
  arcanaEarned: number;           // Arcana earned during offline
  itemsFound: ItemDrop[];         // Items found during offline
}

class OfflineSimulator {
  private config: OfflineConfig;
  private upgrades: OfflineUpgrades;

  constructor(config: OfflineConfig, upgrades: OfflineUpgrades) {
    this.config = config;
    this.upgrades = upgrades;
  }

  // What this does: Calculates the effective offline configuration with upgrades applied
// Why this exists: Allows players to improve offline progression through Soul Power
purchases
  // How it integrates: Used by all offline calculation methods to apply upgrade bonuses
  private getEffectiveConfig(): OfflineConfig {
    return {
      maxOfflineHours: this.config.maxOfflineHours + this.upgrades.maxHoursBonus,
      linearDecayStart: this.config.linearDecayStart + this.upgrades.decayStartBonus,
      decayRate: this.config.decayRate * (1 - this.upgrades.decayReduction),
      minEfficiency: this.config.minEfficiency + this.upgrades.minEfficiencyBonus,
baseProgressionRate: this.config.baseProgressionRate * (1 +
this.upgrades.progressionBonus)
    };
  }

  simulateOfflineProgress(
    startTime: number,
    endTime: number,
    currentState: GameState
  ): OfflineSession {
    const totalOfflineMs = endTime - startTime;
    const totalOfflineHours = totalOfflineMs / (1000 * 60 * 60);

    // Calculate effective offline time with decay
    const effectiveHours = this.calculateEffectiveTime(totalOfflineHours);
    const effectiveOfflineMs = effectiveHours * (1000 * 60 * 60);

    // Simulate progression
    const progressionGained = this.simulateProgression(effectiveOfflineMs, currentState);
    const arcanaEarned = this.simulateArcanaGains(effectiveOfflineMs, currentState);
    const itemsFound = this.simulateItemDrops(effectiveOfflineMs, currentState);

    return {
      startTime,
      endTime,
      totalOfflineMs,
      effectiveOfflineMs,
      progressionGained,
      arcanaEarned,
      itemsFound
    };
  }

  private calculateEffectiveTime(totalHours: number): number {
    const effectiveConfig = this.getEffectiveConfig();

    if (totalHours <= effectiveConfig.linearDecayStart) {
      return totalHours; // Full efficiency for upgraded duration
    }

    const decayHours = totalHours - effectiveConfig.linearDecayStart;
    const decayFactor = Math.pow(1 - effectiveConfig.decayRate, decayHours);
    const minEfficiency = effectiveConfig.minEfficiency;

    // Linear period + decay period with upgrades applied
    const linearHours = effectiveConfig.linearDecayStart;
    const decayEfficiency = Math.max(decayFactor, minEfficiency);
    const effectiveDecayHours = decayHours * decayEfficiency;

    return linearHours + effectiveDecayHours;
  }
}

```javascript

#### Offline Progression Upgrade System

**What This Does:** Provides a system for players to improve their offline progression capabilities through Soul Power purchases, allowing customization of offline time limits, decay rates, and efficiency bonuses.

**Why This Exists:** Creates long-term progression goals and allows players to optimize their offline experience based on their playstyle and schedule, while providing meaningful Soul Power sinks.

**How It Integrates:** Works with the Soul Power meta-progression system to allow permanent upgrades that modify offline progression parameters, creating player agency and customization.

**Implementation Details:** Uses a separate upgrade tracking system that modifies base configuration values, ensuring upgrades persist across sessions and provide consistent benefits.

```typescript

// Example upgrade scenarios:
// Base: 24h max, 8h linear, 10% decay, 10% min efficiency
// With upgrades: 48h max, 16h linear, 5% decay, 20% min efficiency

class OfflineUpgradeManager {
  private upgrades: OfflineUpgrades;

  // What this does: Purchases an offline progression upgrade with Soul Power
  // Why this exists: Allows players to permanently improve their offline experience
  // How it integrates: Modifies the upgrade state and deducts Soul Power cost
purchaseUpgrade(upgradeType: keyof OfflineUpgrades, cost: number, soulPower: number):
boolean
{
    if (soulPower >= cost) {
      this.upgrades[upgradeType] += this.getUpgradeValue(upgradeType);
      return true;
    }
    return false;
  }

  // What this does: Calculates the cost of the next upgrade level
  // Why this exists: Provides clear progression goals and prevents infinite scaling
  // How it integrates: Used by the UI to display upgrade costs and availability
  getUpgradeCost(upgradeType: keyof OfflineUpgrades, currentLevel: number): number {
    // Example scaling: 100, 250, 500, 1000, 2000 Soul Power
    return 100 * Math.pow(2, Math.floor(currentLevel / 2));
  }
}

```text

#### Background Tick System

**What This Does:** Simulates the game's normal tick-based progression system while the player is offline, processing game logic in discrete time steps to maintain accuracy and consistency.

**Why This Exists:** Ensures that offline progression follows the same rules as online play, maintaining game balance and preventing exploits while providing realistic progress simulation.

**How It Integrates:** Works with the offline simulator to process game state changes over time, ensuring that offline progress is calculated using the same logic as active gameplay.

**Implementation Details:** Uses a tick-based approach where each tick represents 5 seconds of game time, with a maximum of 10 hours worth of ticks to prevent excessive calculations.

```typescript

class OfflineBackgroundTicker {
  private tickInterval: number = 5000; // 5 seconds
  private maxTicks: number = 7200;     // 10 hours worth of ticks
  private currentTick: number = 0;

  simulateBackgroundTicks(
    offlineMs: number,
    gameState: GameState
  ): BackgroundTickResult[] {
    const ticks: BackgroundTickResult[] = [];
    const totalTicks = Math.min(
      Math.floor(offlineMs / this.tickInterval),
      this.maxTicks
    );

    for (let i = 0; i < totalTicks; i++) {
      const tickTime = i * this.tickInterval;
      const tickResult = this.simulateTick(tickTime, gameState);
      ticks.push(tickResult);
      gameState = this.updateGameState(gameState, tickResult);
    }

    return ticks;
  }

  private simulateTick(tickTime: number, gameState: GameState): BackgroundTickResult {
    // Simulate enemy spawns, combat, progression
    const enemiesSpawned = this.simulateEnemySpawns(gameState);
    const combatResult = this.simulateCombat(enemiesSpawned, gameState);
    const progressionDelta = this.calculateProgressionDelta(combatResult);

    return {
      tickTime,
      enemiesSpawned,
      combatResult,
      progressionDelta,
      arcanaGained: combatResult.arcanaDrops
    };
  }
}

```javascript

### 📦 **Deliverables** (5)

**What These Files Do:** These are the actual code files that will be created to implement the complete offline progression system, including configuration, simulation, and tracking components.

**For Non-Coders:** These files handle everything related to offline progress - setting up the rules, calculating how much progress players should get, and tracking all offline activities for analytics.

**Technical Context:** Each file has a specific responsibility in the offline progression system, ensuring modular design and easy testing of individual components.

- `sim/offline/config.ts` - **Offline progression configuration** - Settings for time limits, decay rates, and progression calculations

- `sim/offline/simulator.ts` - **Offline progression simulator** - Main logic that calculates offline progress based on time away

- `sim/offline/upgrades.ts` - **Offline progression upgrade system** - Soul Power upgrades for extending offline time, reducing decay, and improving efficiency

- `sim/offline/backgroundTicker.ts` - **Background tick simulation** - Simulates game ticks while offline to maintain accuracy

- `sim/offline/decay.ts` - **Efficiency decay calculations** - Math functions for calculating how efficiency decreases over time

- `sim/offline/telemetry.ts` - **Offline progression tracking** - Logs all offline activities for analytics and debugging

### 🧪 **Unit Tests** (5)

**What These Tests Do:** These are automated tests that verify each component of the offline progression system works correctly in isolation, ensuring accurate calculations, proper decay mechanics, and reliable background simulation.

**For Non-Coders:** These tests act like quality checks that run automatically to make sure the offline progression system calculates progress correctly, handles different time scenarios properly, and doesn't give players unfair advantages or lose their progress.

**Technical Context:** Unit tests verify individual functions and classes work as expected, providing confidence that the offline progression system will handle edge cases and error conditions properly.

```typescript

describe('Basic Offline Progression', () => {
  test('should calculate correct effective time with decay', () => {
    const config: OfflineConfig = {
      maxOfflineHours: 24,
      linearDecayStart: 8,
      decayRate: 0.1,
      minEfficiency: 0.1,
      baseProgressionRate: 1.0
    };

    const simulator = new OfflineSimulator(config);

    // Test linear period (no decay)
    const session1 = simulator.simulateOfflineProgress(0, 8 * 3600 * 1000, initialState);
    expect(session1.effectiveOfflineMs).toBe(8 * 3600 * 1000);

    // Test decay period
    const session2 = simulator.simulateOfflineProgress(0, 16 * 3600 * 1000, initialState);
    expect(session2.effectiveOfflineMs).toBeLessThan(16 * 3600 * 1000);
  });

  test('should respect maximum offline time limit', () => {
    const config: OfflineConfig = {
      maxOfflineHours: 24,
      linearDecayStart: 8,
      decayRate: 0.1,
      minEfficiency: 0.1,
      baseProgressionRate: 1.0
    };

    const simulator = new OfflineSimulator(config);
const longSession = simulator.simulateOfflineProgress(0, 48 * 3600 * 1000, initialState);
    expect(longSession.totalOfflineMs).toBe(24 * 3600 * 1000); // Capped at 24 hours
  });

  test('should apply offline upgrades correctly', () => {
    const config: OfflineConfig = {
      maxOfflineHours: 24,
      linearDecayStart: 8,
      decayRate: 0.1,
      minEfficiency: 0.1,
      baseProgressionRate: 1.0
    };

    const upgrades: OfflineUpgrades = {
      maxHoursBonus: 12,        // Extend to 36 hours
      decayStartBonus: 4,       // Extend linear to 12 hours
      decayReduction: 0.5,      // Reduce decay by 50%
      minEfficiencyBonus: 0.1,  // Increase min efficiency to 20%
      progressionBonus: 0.25    // 25% progression bonus
    };

    const simulator = new OfflineSimulator(config, upgrades);
    const result = simulator.simulateOfflineProgress(
      Date.now() - (30 * 3600 * 1000), // 30 hours ago
      Date.now(),
      mockGameState
    );

    // Should cap at 36 hours (24 + 12 upgrade)
    expect(result.totalOfflineMs).toBe(30 * 3600 * 1000);
    // Should have improved efficiency due to upgrades
    expect(result.effectiveOfflineMs).toBeGreaterThan(24 * 3600 * 1000);
  });
});

```javascript

### 🔗 **Integration Tests** (5)

**What These Tests Do:** These tests verify that all the offline progression components work together correctly, ensuring the complete offline system processes different game states, simulates background ticks, and calculates decay seamlessly.

**For Non-Coders:** These tests make sure that when a player goes offline, all the different parts of the offline system work together properly - calculating progress, applying decay, and simulating game time accurately.

**Technical Context:** Integration tests verify that multiple systems work together correctly, catching issues that individual unit tests might miss, such as data flow between components.

- Offline progression with different game states

- Background tick simulation accuracy

- Decay calculation integration

- Offline upgrade system integration with Soul Power

- Upgrade persistence across sessions

### 🎮 **E2E Tests** (5)

**What These Tests Do:** These tests simulate complete offline scenarios from start to finish, ensuring the entire offline progression experience works correctly from the player's perspective over extended periods.

**For Non-Coders:** These tests act like a player actually going offline for different amounts of time - they simulate closing the game, waiting, and coming back to verify that everything works as expected over long periods.

**Technical Context:** End-to-end tests verify the complete user journey and catch integration issues that only appear when all systems work together in realistic scenarios.

- Complete offline session simulation

- Offline progression accuracy over 24 hours

- Performance with maximum offline time

- Complete upgrade purchase and application cycle

- Offline progression with various upgrade combinations

### ✅ **Completion Criteria** (6)

**What These Criteria Ensure:** These are the specific requirements that must be met before Story 1.1.5 is considered complete, covering functionality, testing, and quality standards for offline progression.

**For Non-Coders:** These checkboxes ensure that the offline progression system works reliably and fairly, providing meaningful progress while preventing exploitation and maintaining game balance.

**Technical Context:** Completion criteria provide measurable goals and ensure all aspects of the offline progression system are thoroughly tested and validated before moving to the next story.

- [ ] Offline simulation produces accurate results

- [ ] Decay system works correctly after 8 hours

- [ ] Maximum offline time is enforced

- [ ] Background ticks simulate realistic progression

- [ ] Offline upgrade system integrates with Soul Power

- [ ] Upgrades persist across sessions and modify offline parameters

- [ ] Upgrade costs scale appropriately to prevent infinite progression

- [ ] 100% unit test coverage

- [ ] 95%+ integration test coverage

- [ ] E2E tests pass for extended offline periods and upgrade scenarios

---

## 1.1.6: Divine Favor System

**Status:** ⏳ **PENDING**
**Dependencies:** 1.1.5 Complete
**Estimated Effort:** 2-3 days

### 🎯 **What This Story Does** (4)

**For Non-Coders:** This story creates a divine blessing system that rewards players for being active and engaged with the game. When players are actively playing for a certain amount of time, they can earn "Divine Favor" that gives them 50% more progression for 15 minutes. This encourages active play and rewards dedicated players with the favor of the ancient gods. The system includes:

- **Divine Favor Activation:** Players earn divine blessing after playing actively for a certain time

- **Divine Blessing:** The blessing lasts for 15 minutes and gives +50% progression

- **Sacred Cooldown:** After using the blessing, there's a 30-minute cooldown before it can be earned again

- **Visual Feedback:** Clear indicators when divine favor is available, active, or on cooldown

- **Usage Tracking:** The system tracks how many times players have received divine blessings

**Story Integration:** "Through your dedication to Draconia's defense, you have earned the favor of the ancient gods. Their divine blessing flows through you, enhancing your dragon's power for a time."

**Technical Summary:** Implement divine favor system with activation triggers, 15-minute duration with +50% progression multiplier, 30-minute cooldown period, and comprehensive state management with telemetry tracking.

### 🏗️ **What We'll Have After 1.1.6**

**For Non-Coders:** After this story, players will have a clear incentive to play actively and will be rewarded with temporary divine blessings. The system encourages regular engagement while preventing abuse through sacred cooldown periods.

**Technical Summary:** Complete divine favor system with activation logic, duration management, cooldown handling, and integration with progression systems for balanced active play rewards.

### 🔧 **Technical Specifications** (7)

**What This Section Does:** This section defines the technical implementation details for the divine favor system, including data structures, state management, and integration with progression systems.

**For Non-Coders:** This section explains the technical blueprint for how the divine favor system tracks player activity, calculates blessing eligibility, and applies progression multipliers.

**Technical Context:** The divine favor system uses precise timing and state management to ensure fair and balanced blessing distribution while encouraging active play.

#### Divine Favor State Management

**What This Does:** Defines the data structure that tracks the current status of the divine favor system, including whether it's active, when it started, and when it can be earned again.

**Why This Exists:** Provides a complete picture of the divine favor state at any given time, enabling the system to make decisions about blessing eligibility and duration.

**How It Integrates:** This state is used by the UI to show divine favor status, by the progression system to apply multipliers, and by the cooldown system to track when blessings can be earned.

**Implementation Details:** Uses precise timestamps and boolean flags to track all aspects of the divine favor lifecycle, ensuring accurate blessing management.

```typescript

interface DivineFavorState {
  isActive: boolean;           // Whether divine blessing is currently active
  startTime: number;           // When divine blessing started
  duration: number;            // How long divine blessing lasts (15 minutes)
  multiplier: number;          // Blessing multiplier (1.5 = +50%)
  cooldownEndTime: number;     // When divine blessing can be earned again
  totalUses: number;           // Total times divine blessing has been used
}

interface DivineFavorConfig {
  baseDurationMs: number;      // Base duration (15 minutes, upgradeable)
  baseCooldownMs: number;      // Base cooldown (30 minutes, upgradeable)
  baseMultiplier: number;      // Base multiplier (1.5x, upgradeable)
  baseMinActiveTimeMs: number; // Base requirement (30 minutes, upgradeable)
  maxUsesPerDay: number;       // Maximum uses per day (upgradeable)
}

// What this does: Tracks divine favor upgrades purchased with Soul Power
// Why this exists: Allows players to improve divine favor effectiveness and reduce
requirements
through
meta-progression
// How it integrates: Modifies DivineFavorConfig values when calculating blessing
parameters
and
eligibility
interface DivineFavorUpgrades {
durationBonus: number; // Additional duration in milliseconds (e.g., +5 minutes)
cooldownReduction: number; // Reduction to cooldown (0.0 = no reduction, 0.5 = 50%
reduction)
  multiplierBonus: number;        // Additional multiplier (e.g., +0.25 = +25% bonus)
activeTimeReduction: number; // Reduction to active time requirement (0.0 = no reduction,
0.5
=
50%
reduction)
  maxUsesBonus: number;          // Additional daily uses (e.g., +5 uses per day)
}

// What this does: Provides comprehensive upgrade descriptions for divine favor system
// Why this exists: Gives players clear understanding of what each upgrade provides and
encourages
progression
// How it integrates: Used by UI to display upgrade benefits and by progression system to
calculate
effects
const DIVINE*FAVOR*UPGRADES = {
  // Duration Upgrades - Extend blessing duration
  "Divine Grace I": "Extends blessing duration by 2 minutes",
  "Divine Grace II": "Extends blessing duration by 5 minutes",
  "Divine Grace III": "Extends blessing duration by 8 minutes",
  "Divine Grace IV": "Extends blessing duration by 12 minutes",
  "Divine Grace V": "Extends blessing duration by 15 minutes",

  // Cooldown Upgrades - Reduce time between blessings
  "Celestial Favor I": "Reduces cooldown between blessings by 15%",
  "Celestial Favor II": "Reduces cooldown between blessings by 25%",
  "Celestial Favor III": "Reduces cooldown between blessings by 35%",
  "Celestial Favor IV": "Reduces cooldown between blessings by 45%",
  "Celestial Favor V": "Reduces cooldown between blessings by 50%",

  // Multiplier Upgrades - Increase blessing power
  "Cosmic Blessing I": "Increases bonus multiplier to +60%",
  "Cosmic Blessing II": "Increases bonus multiplier to +75%",
  "Cosmic Blessing III": "Increases bonus multiplier to +90%",
  "Cosmic Blessing IV": "Increases bonus multiplier to +110%",
  "Cosmic Blessing V": "Increases bonus multiplier to +125%",

  // Requirement Upgrades - Reduce active time needed
  "Sacred Ritual I": "Reduces active time requirement by 20%",
  "Sacred Ritual II": "Reduces active time requirement by 35%",
  "Sacred Ritual III": "Reduces active time requirement by 50%",
  "Sacred Ritual IV": "Reduces active time requirement by 65%",
  "Sacred Ritual V": "Reduces active time requirement by 75%",

  // Daily Use Upgrades - More blessings per day
  "Divine Presence I": "Allows 2 additional daily blessings",
  "Divine Presence II": "Allows 4 additional daily blessings",
  "Divine Presence III": "Allows 6 additional daily blessings",
  "Divine Presence IV": "Allows 8 additional daily blessings",
  "Divine Presence V": "Allows 10 additional daily blessings",

  // Advanced Upgrades - Special combinations
  "Ancient Covenant": "Blessings last 50% longer and require 25% less active time",
  "Stellar Alignment": "Cooldown reduced by 30% and multiplier increased by +40%",
  "Eternal Flame": "Allows unlimited daily blessings with 75% cooldown reduction",
  "Cosmic Devotion": "All blessing effects increased by 25% and last 20% longer",
  "Divine Champion": "Blessings activate instantly and last 100% longer"
};

class DivineFavorSystem {
  private config: DivineFavorConfig;
  private upgrades: DivineFavorUpgrades;
  private state: DivineFavorState;

  constructor(config: DivineFavorConfig, upgrades: DivineFavorUpgrades) {
    this.config = config;
    this.upgrades = upgrades;
    this.state = this.initializeState();
  }

  // What this does: Calculates effective divine favor configuration with upgrades applied
// Why this exists: Allows players to improve divine favor effectiveness through Soul
Power
purchases
// How it integrates: Used by all divine favor calculation methods to apply upgrade
bonuses
  private getEffectiveConfig(): DivineFavorConfig {
    return {
      baseDurationMs: this.config.baseDurationMs + this.upgrades.durationBonus,
      baseCooldownMs: this.config.baseCooldownMs * (1 - this.upgrades.cooldownReduction),
      baseMultiplier: this.config.baseMultiplier + this.upgrades.multiplierBonus,
baseMinActiveTimeMs: this.config.baseMinActiveTimeMs * (1 -
this.upgrades.activeTimeReduction),
      maxUsesPerDay: this.config.maxUsesPerDay + this.upgrades.maxUsesBonus
    };
  }

  canEarnDivineFavor(currentTime: number, activePlayTimeMs: number): boolean {
    const effectiveConfig = this.getEffectiveConfig();
    if (this.state.isActive) return false;
    if (currentTime < this.state.cooldownEndTime) return false;
    if (activePlayTimeMs < effectiveConfig.baseMinActiveTimeMs) return false;

    return true;
  }

  activateDivineFavor(currentTime: number): boolean {
    if (!this.canEarnDivineFavor(currentTime, 0)) return false;

    const effectiveConfig = this.getEffectiveConfig();
    this.state = {
      isActive: true,
      startTime: currentTime,
      duration: effectiveConfig.baseDurationMs,
      multiplier: effectiveConfig.baseMultiplier,
cooldownEndTime: currentTime + effectiveConfig.baseDurationMs +
effectiveConfig.baseCooldownMs,
      totalUses: this.state.totalUses + 1
    };

    return true;
  }

  updateDivineFavor(currentTime: number): void {
    if (!this.state.isActive) return;

    const elapsed = currentTime - this.state.startTime;
    if (elapsed >= this.state.duration) {
      this.state.isActive = false;
    }
  }

  getCurrentMultiplier(): number {
    return this.state.isActive ? this.state.multiplier : 1.0;
  }
}

```text

#### Integration with Progression Systems

**What This Does:** Defines how the divine favor system integrates with the game's progression systems, applying multipliers to various progression types (distance, Arcana, experience) when the blessing is active.

**Why This Exists:** Ensures that divine favor provides meaningful benefits across all progression systems while maintaining balanced gameplay and preventing exploitation.

**How It Integrates:** Works with the progression calculation systems to apply divine blessing multipliers to distance traveled, Arcana gained, and experience earned during active blessing periods.

**Implementation Details:** Uses a modifier pattern that wraps progression calculations with bonus multipliers, ensuring consistent application across all progression types.

```typescript

class DivineFavorProgressionModifier {
  constructor(private divineFavorSystem: DivineFavorSystem) {}

  applyDivineFavor(baseProgression: number, currentTime: number): number {
    this.divineFavorSystem.updateDivineFavor(currentTime);
    const multiplier = this.divineFavorSystem.getCurrentMultiplier();
    return baseProgression * multiplier;
  }

  applyDivineFavorToArcana(baseArcana: number, currentTime: number): number {
    this.divineFavorSystem.updateDivineFavor(currentTime);
    const multiplier = this.divineFavorSystem.getCurrentMultiplier();
    return Math.floor(baseArcana * multiplier);
  }
}

```javascript

### 📦 **Deliverables** (6)

**What These Files Do:** These are the actual code files that will be created to implement the complete divine favor system, including configuration, state management, and progression integration components.

**For Non-Coders:** These files handle everything related to the divine favor system - setting up the rules, tracking player activity, applying divine blessing multipliers, and logging all blessing activities for analytics.

**Technical Context:** Each file has a specific responsibility in the divine favor system, ensuring modular design and easy testing of individual components.

- `sim/divine-favor/config.ts` - **Divine favor configuration** - Settings for base activation requirements, blessing duration, multipliers, and cooldowns

- `sim/divine-favor/upgrades.ts` - **Divine favor upgrade system** - Soul Power upgrades for improving blessing effectiveness and reducing requirements

- `sim/divine-favor/state.ts` - **Divine favor state management** - Data structures and logic for tracking blessing status and timing

- `sim/divine-favor/system.ts` - **Divine favor system logic** - Main logic that manages blessing activation, duration, and cooldowns with upgrade support

- `sim/divine-favor/modifier.ts` - **Progression modifier integration** - Integration with progression systems to apply divine blessing multipliers

- `sim/divine-favor/telemetry.ts` - **Divine favor tracking** - Logs all blessing activities for analytics and debugging

### 🧪 **Unit Tests** (6)

**What These Tests Do:** These are automated tests that verify each component of the divine favor system works correctly in isolation, ensuring accurate activation logic, proper duration management, and reliable progression multipliers.

**For Non-Coders:** These tests act like quality checks that run automatically to make sure the divine favor system activates correctly, applies the right divine blessings, and doesn't give players unfair advantages or lose their blessing status.

**Technical Context:** Unit tests verify individual functions and classes work as expected, providing confidence that the divine favor system will handle edge cases and error conditions properly.

```typescript

describe('Divine Favor System', () => {
  test('should activate divine favor with base configuration', () => {
    const config: DivineFavorConfig = {
      baseDurationMs: 15 * 60 * 1000,    // 15 minutes - fixed test value
      baseCooldownMs: 30 * 60 * 1000,    // 30 minutes - fixed test value
      baseMultiplier: 1.5,               // Fixed test value
      baseMinActiveTimeMs: 30 * 60 * 1000, // 30 minutes - fixed test value
      maxUsesPerDay: 10                  // Fixed test value
    };
const zeroUpgrades: DivineFavorUpgrades = { durationBonus: 0, cooldownReduction: 0,
multiplierBonus:
0,
activeTimeReduction:
0,
maxUsesBonus:
0
};

    const system = new DivineFavorSystem(config, zeroUpgrades);
    const currentTime = Date.now();

    // Should not be able to activate immediately
    expect(system.canEarnDivineFavor(currentTime, 0)).toBe(false);

    // Should be able to activate after meeting requirements
expect(system.canEarnDivineFavor(currentTime, 35 * 60 * 1000)).toBe(true); // Fixed test
value

    const activated = system.activateDivineFavor(currentTime);
    expect(activated).toBe(true);
    expect(system.getCurrentMultiplier()).toBe(1.5); // Fixed test value
  });

  test('should deactivate after duration expires', () => {
    const config: DivineFavorConfig = {
      baseDurationMs: 1000,  // 1 second for testing - fixed test value
      baseCooldownMs: 2000,  // 2 seconds - fixed test value
      baseMultiplier: 1.5,   // Fixed test value
      baseMinActiveTimeMs: 0, // Fixed test value
      maxUsesPerDay: 10      // Fixed test value
    };
    const zeroUpgrades: DivineFavorUpgrades = {
      durationBonus: 0, cooldownReduction: 0, multiplierBonus: 0,
      activeTimeReduction: 0, maxUsesBonus: 0
    };

    const system = new DivineFavorSystem(config, zeroUpgrades);
    const startTime = Date.now();

    system.activateDivineFavor(startTime);
    expect(system.getCurrentMultiplier()).toBe(1.5); // Fixed test value

    // After duration expires
    system.updateDivineFavor(startTime + 1500); // Fixed test value
    expect(system.getCurrentMultiplier()).toBe(1.0); // Fixed test value
  });

  test('should apply divine favor upgrades correctly', () => {
    const config: DivineFavorConfig = {
      baseDurationMs: 15 * 60 * 1000,    // 15 minutes base - fixed test value
      baseCooldownMs: 30 * 60 * 1000,    // 30 minutes base - fixed test value
      baseMultiplier: 1.5,               // 1.5x base - fixed test value
      baseMinActiveTimeMs: 30 * 60 * 1000, // 30 minutes base - fixed test value
      maxUsesPerDay: 10                  // Fixed test value
    };

    const upgrades: DivineFavorUpgrades = {
      durationBonus: 5 * 60 * 1000,      // +5 minutes duration - fixed test value
      cooldownReduction: 0.5,            // 50% cooldown reduction - fixed test value
      multiplierBonus: 0.25,             // +0.25x multiplier - fixed test value
      activeTimeReduction: 0.5,          // 50% active time reduction - fixed test value
      maxUsesBonus: 5                    // +5 daily uses - fixed test value
    };

    const system = new DivineFavorSystem(config, upgrades);
    const currentTime = Date.now();

// Test: Should be able to activate with reduced active time requirement (15 minutes
instead
of
30)
expect(system.canEarnDivineFavor(currentTime, 15 * 60 * 1000)).toBe(true); // Fixed test
value

    // Test: Activate blessing and verify upgraded parameters
    expect(system.activateDivineFavor(currentTime)).toBe(true);
expect(system.getCurrentMultiplier()).toBe(1.75); // 1.5 + 0.25 = 1.75x - fixed test value

    // Test: Cooldown should be reduced (15 minutes instead of 30)
const nextActivationTime = currentTime + (20 * 60 * 1000); // 20 minutes later - fixed
test
value
    expect(system.canEarnDivineFavor(nextActivationTime, 0)).toBe(true);
  });
});

```javascript

### 🔗 **Integration Tests** (6)

**What These Tests Do:** These tests verify that all the divine favor components work together correctly, ensuring the complete divine favor system integrates properly with progression systems, enforces cooldowns, and tracks active play time accurately.

**For Non-Coders:** These tests make sure that when the divine favor system is active, it properly boosts all types of progression (distance, Arcana, experience) and that the cooldown system prevents players from abusing the blessing system.

**Technical Context:** Integration tests verify that multiple systems work together correctly, catching issues that individual unit tests might miss, such as data flow between components.

- Divine favor integration with progression systems

- Cooldown enforcement across sessions

- Active play time tracking

### 🎮 **E2E Tests** (6)

**What These Tests Do:** These tests simulate complete divine favor scenarios from earning the blessing through activation, expiration, and cooldown, ensuring the entire divine favor experience works correctly from the player's perspective.

**For Non-Coders:** These tests act like a player actually earning and using divine blessings - they simulate the complete cycle of earning a blessing, activating it, using it, and waiting for cooldowns to verify that everything works as expected.

**Technical Context:** End-to-end tests verify the complete user journey and catch integration issues that only appear when all systems work together in realistic scenarios.

- Complete divine favor cycle: earn → activate → expire → cooldown

- Divine favor application to all progression systems

- Performance with frequent divine favor checks

### ✅ **Completion Criteria** (7)

**What These Criteria Ensure:** These are the specific requirements that must be met before Story 1.1.6 is considered complete, covering functionality, testing, and quality standards for the divine favor system.

**For Non-Coders:** These checkboxes ensure that the divine favor system works reliably and fairly, providing meaningful rewards for active play while preventing exploitation and maintaining game balance.

**Technical Context:** Completion criteria provide measurable goals and ensure all aspects of the divine favor system are thoroughly tested and validated before moving to the next story.

- [ ] Divine favor activates correctly after cooldown

- [ ] Blessing duration and cooldown work as specified

- [ ] Active play time requirement is enforced

- [ ] Multiplier applies to all progression systems

- [ ] Divine favor upgrade system integrates with Soul Power for improved effectiveness

- [ ] Upgrades persist across sessions and modify blessing parameters consistently

- [ ] Upgrade costs scale appropriately to prevent infinite progression

- [ ] 100% unit test coverage

- [ ] 95%+ integration test coverage

- [ ] E2E tests pass for complete divine favor cycle and upgrade scenarios

---

## 📚 **Story 1.1.8: Draconia Tech Tree System Architecture**

### 🎯 **What This Story Does** (5)

**For Non-Coders:** This story creates the foundation for the technology tree system that allows players to permanently upgrade their dragon's capabilities using Soul Power. Think of it like a skill tree in an RPG - players can unlock and upgrade different abilities across three main categories: Flamecraft (offensive abilities), Scales (defensive abilities), and Safety (utility and progression abilities). Each upgrade provides permanent benefits that persist across all journeys.

**Technical Summary:** Implement comprehensive tech tree system with database-driven node definitions, upgrade progression tracking, and integration with all existing upgrade systems. The system supports dynamic tree expansion and flexible upgrade mechanics.

### 🔧 **Technical Specifications** (8)

#### Core Tech Tree Data Structures

```typescript

// What this does: Defines the core data structure for tech tree nodes
// Why this exists: Provides a flexible, database-friendly way to define upgrade nodes
that
can
be
easily
modified
or
expanded
// How it integrates: Used by the TechTreeManager to track available upgrades and player
progression
interface TechTreeNode {
  id: string;                    // Unique identifier (e.g., "flamecraft*damage*1")
  treeId: TechTreeId;           // Which tree this node belongs to
  nodeName: string;             // Display name (e.g., "Damage 1")
  upgradeType: UpgradeType;     // What this upgrade affects
  tier: number;                 // Tier level (1-6)
  prerequisites: string[];      // Required node IDs that must be unlocked first
  soulPowerCost: number;        // Soul Power cost to unlock this node
  maxLevel: number;             // Maximum level this node can be upgraded to (default: 1)
  upgradeCostScaling: number;   // Cost scaling factor for leveling up (default: 1.5)

  // Upgrade Effects - What this node actually does when purchased
  effects: TechTreeNodeEffect[];
}

// What this does: Defines what effect a tech tree node has when purchased
// Why this exists: Allows each node to have multiple effects and different types of
bonuses
// How it integrates: Applied to the appropriate system when the node is unlocked or
leveled
up
interface TechTreeNodeEffect {
targetSystem: SystemId; // Which system this affects (e.g., "distance", "ward",
"shield_tax")
effectType: EffectType; // Type of effect (e.g., "bonus", "reduction", "multiplier")
targetProperty: string; // Specific property being modified (e.g., "speedBonus",
"wardLengthReduction")
  value: number;                // Effect value (amount of bonus/reduction)
valueType: ValueType; // How the value is applied ("additive", "multiplicative",
"percentage")
}

// What this does: Defines the different types of tech trees available
// Why this exists: Organizes upgrades into logical categories for better player
experience
// How it integrates: Used by the UI to group and display upgrades by category
enum TechTreeId {
  FLAMECRAFT = "flamecraft",    // Offensive abilities and fire-based attacks
  SCALES = "scales",            // Defensive capabilities and survivability
  SAFETY = "safety"             // Utility, progression, and quality-of-life improvements
}

// What this does: Defines the different types of upgrades available
// Why this exists: Categorizes upgrade effects for better organization and system
integration
// How it integrates: Used by the TechTreeManager to apply effects to the correct systems
enum UpgradeType {
  // Flamecraft Tree - Offensive abilities
  DAMAGE = "damage",
  FIRE*RATE = "fire*rate",
  RANGE = "range",
  SPLASH*CHANCE = "splash*chance",
  SPLASH*RADIUS = "splash*radius",
  SPLASH*DAMAGE*PERCENT = "splash*damage*percent",
  ON*HIT*EFFECT = "on*hit*effect",
  ON*KILL*EFFECT = "on*kill*effect",
  ARMOR*SHRED = "armor*shred",
  CRITICAL*CHANCE = "critical*chance",
  CRITICAL*DAMAGE = "critical*damage",
  MULTISHOT = "multishot",
  RAMPAGE = "rampage",

  // Scales Tree - Defensive abilities
  MAX*HP = "max*hp",
  HP*REGENERATION = "hp*regeneration",
  ARMOR = "armor",
  STATUS*RESIST = "status*resist",
  SHOCKWAVE*RADIUS = "shockwave*radius",
  SHOCKWAVE*DAMAGE = "shockwave*damage",
  THORNS = "thorns",
  LIFESTEAL = "lifesteal",
  DAMAGE*REDUCTION*PERCENT = "damage*reduction*percent",
  SECOND*CHANCE = "second*chance",

  // Safety Tree - Utility and progression
  FLIGHT*SPEED = "flight*speed",
  COOLDOWN*REDUCTION = "cooldown*reduction",
  GOLD*GAIN = "gold*gain",
  ARCANA*GAIN = "arcana*gain",
  XP*SOUL*POWER*GAIN = "xp*soul*power*gain",
  DROP*CHANCE = "drop*chance",
  OFFLINE*IDLE*BOOST = "offline*idle*boost"
}

// What this does: Defines which game system an upgrade effect targets
// Why this exists: Allows tech tree nodes to modify any system in the game
// How it integrates: Used by the TechTreeManager to route effects to the correct upgrade
interfaces
enum SystemId {
  DISTANCE = "distance",           // Distance progression system
  WARD*LAND = "ward*land",         // Ward/land progression system
  SHIELD*TAX = "shield*tax",       // Shield tax system
  OFFLINE = "offline",             // Offline progression system
  DIVINE*FAVOR = "divine*favor",   // Divine favor system
  ENCHANTMENT = "enchantment",     // Enchantment system
  COMBAT = "combat",               // Combat system
  ECONOMY = "economy"              // Economy system
}

// What this does: Defines how an upgrade effect is applied to a target property
// Why this exists: Allows different types of bonuses (additive, multiplicative,
percentage-based)
// How it integrates: Used by the TechTreeManager to calculate the correct effect values
enum EffectType {
  BONUS = "bonus",                 // Additive bonus (e.g., +5 damage)
  REDUCTION = "reduction",         // Percentage reduction (e.g., -25% cooldown)
  MULTIPLIER = "multiplier",       // Multiplicative bonus (e.g., ×1.5 damage)
  CAP*INCREASE = "cap*increase",   // Increase to maximum values (e.g., +10 max level)
  COST*REDUCTION = "cost*reduction" // Reduce costs (e.g., -50% upgrade cost)
}

// What this does: Defines how the effect value is interpreted and applied
// Why this exists: Allows flexible value application for different types of upgrades
// How it integrates: Used by the TechTreeManager to calculate final effect values
enum ValueType {
  ADDITIVE = "additive",           // Value is added directly (+5)
  MULTIPLICATIVE = "multiplicative", // Value is multiplied (×1.5)
  PERCENTAGE = "percentage"        // Value is a percentage (0.25 = 25%)
}

```javascript

#### Tech Tree Database Schema

```typescript

// What this does: Defines the database schema for tech tree nodes
// Why this exists: Provides persistent storage for tech tree definitions and player
progression
// How it integrates: Used by the TechTreeManager to load tree definitions and track
player
unlocks
interface TechTreeDatabaseSchema {
  // Tech Tree Definitions - Static data loaded from CSV/database
  nodes: Map<string, TechTreeNode>;

  // Player Progression - Dynamic data tracking what each player has unlocked
  playerProgress: Map<string, PlayerTechTreeProgress>;
}

// What this does: Tracks a player's progress through the tech trees
// Why this exists: Persists which nodes a player has unlocked and their current levels
// How it integrates: Used by the TechTreeManager to determine available upgrades and
apply
effects
interface PlayerTechTreeProgress {
  playerId: string;
unlockedNodes: Map<string, number>; // nodeId -> current level (0 = locked, 1+ = unlocked)
  totalSoulPowerSpent: number;         // Total Soul Power invested in tech trees
  lastUpdated: number;                 // Timestamp of last update
}

// What this does: Defines the profile schema extension for tech tree progress
// Why this exists: Integrates tech tree progress with the existing profile system
// How it integrates: Stored in the same profile database as other player data
export interface ProfileV1 {
  // ... existing fields ...

  // Tech Tree Progress - Player's unlocked nodes and levels
  techTreeProgress: PlayerTechTreeProgress;
}

```javascript

#### Tech Tree Manager Implementation

```typescript

// What this does: Manages the tech tree system, including node definitions, player
progress,
and
effect
application
// Why this exists: Centralizes all tech tree logic and provides a clean interface for the
rest
of
the
game
// How it integrates: Works with all upgrade systems to apply tech tree effects to
gameplay
class TechTreeManager {
  private nodes: Map<string, TechTreeNode>;
  private playerProgress: PlayerTechTreeProgress;
  private systemUpgrades: Map<SystemId, any>;  // Maps to existing upgrade interfaces

  constructor(
    private database: TechTreeDatabaseSchema,
    private playerId: string
  ) {
    this.loadNodeDefinitions();
    this.loadPlayerProgress();
    this.initializeSystemUpgrades();
  }

  // What this does: Loads tech tree node definitions from the database
  // Why this exists: Allows tech trees to be modified without code changes
  // How it integrates: Called during initialization to populate the nodes map
  private loadNodeDefinitions(): void {
    // Load from CSV file or database
    // This allows easy modification of tech trees without code changes
  }

  // What this does: Imports tech tree nodes from CSV data
  // Why this exists: Allows designers to modify tech trees without developer involvement
  // How it integrates: Called during initialization to populate the nodes map from CSV
  importFromCSV(csvData: string): void {
    const lines = csvData.split('\n');
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(',');
      if (row.length < 4) continue;

      const node: TechTreeNode = {
        id: this.generateNodeId(row[0], row[1]), // tree + nodeName
        treeId: row[0].toLowerCase() as TechTreeId,
        nodeName: row[1],
        upgradeType: row[2].toLowerCase().replace(/\s+/g, '_') as UpgradeType,
        tier: parseInt(row[3]),
        prerequisites: this.calculatePrerequisites(row[0], row[1], parseInt(row[3])),
        soulPowerCost: this.calculateBaseCost(parseInt(row[3])),
        maxLevel: 1, // Default to 1, can be overridden in effect definitions
        upgradeCostScaling: 1.5, // Default scaling
        effects: this.generateEffects(row[2], row[0])
      };

      this.nodes.set(node.id, node);
    }
  }

  // What this does: Generates unique node IDs from tree and node name
  // Why this exists: Creates consistent, readable IDs for database storage
  // How it integrates: Used by the CSV import system to create unique identifiers
  private generateNodeId(treeName: string, nodeName: string): string {
    return `${treeName.toLowerCase()}*${nodeName.toLowerCase().replace(/\s+/g, '*')}`;
  }

  // What this does: Calculates prerequisite nodes based on tier and upgrade type
  // Why this exists: Automatically determines prerequisites without manual configuration
  // How it integrates: Used by the CSV import system to set up node dependencies
private calculatePrerequisites(treeName: string, nodeName: string, tier: number): string[]
{
    const prerequisites: string[] = [];

    // Higher tier nodes require previous tier nodes of the same type
    if (tier > 1) {
      const baseNodeName = nodeName.replace(/\s+\d+$/, ''); // Remove tier number
      const previousTier = tier - 1;
prerequisites.push(`${treeName.toLowerCase()}_${baseNodeName.toLowerCase().replace(/\s+/g,
'*')}*${previousTier}`);
    }

    // Some nodes might require cross-tree prerequisites (can be extended)
    return prerequisites;
  }

  // What this does: Generates effect definitions based on upgrade type and tree
// Why this exists: Automatically creates meaningful effects without manual configuration
// How it integrates: Used by the CSV import system to define what each node actually does
  private generateEffects(upgradeType: string, treeName: string): TechTreeNodeEffect[] {
    const effects: TechTreeNodeEffect[] = [];

    switch (upgradeType.toLowerCase()) {
      case 'damage':
        effects.push({
          targetSystem: SystemId.COMBAT,
          effectType: EffectType.BONUS,
          targetProperty: 'damageBonus',
          value: 10, // Base damage bonus
          valueType: ValueType.ADDITIVE
        });
        break;

      case 'fire rate':
        effects.push({
          targetSystem: SystemId.COMBAT,
          effectType: EffectType.MULTIPLIER,
          targetProperty: 'fireRateMultiplier',
          value: 1.1, // 10% fire rate increase
          valueType: ValueType.MULTIPLICATIVE
        });
        break;

      case 'range':
        effects.push({
          targetSystem: SystemId.COMBAT,
          effectType: EffectType.BONUS,
          targetProperty: 'rangeBonus',
          value: 50, // 50 unit range increase
          valueType: ValueType.ADDITIVE
        });
        break;

      case 'flight speed':
        effects.push({
          targetSystem: SystemId.DISTANCE,
          effectType: EffectType.BONUS,
          targetProperty: 'speedBonus',
          value: 5, // 5 m/s speed increase
          valueType: ValueType.ADDITIVE
        });
        break;

      case 'gold gain':
        effects.push({
          targetSystem: SystemId.ECONOMY,
          effectType: EffectType.MULTIPLIER,
          targetProperty: 'goldMultiplier',
          value: 1.15, // 15% gold increase
          valueType: ValueType.MULTIPLICATIVE
        });
        break;

      case 'arcana gain':
        effects.push({
          targetSystem: SystemId.ECONOMY,
          effectType: EffectType.MULTIPLIER,
          targetProperty: 'arcanaMultiplier',
          value: 1.1, // 10% arcana increase
          valueType: ValueType.MULTIPLICATIVE
        });
        break;

      case 'offline / idle boost':
        effects.push({
          targetSystem: SystemId.OFFLINE,
          effectType: EffectType.BONUS,
          targetProperty: 'progressionBonus',
          value: 0.1, // 10% offline progression bonus
          valueType: ValueType.MULTIPLICATIVE
        });
        break;

      case 'cooldown reduction':
        effects.push({
          targetSystem: SystemId.DIVINE_FAVOR,
          effectType: EffectType.REDUCTION,
          targetProperty: 'cooldownReduction',
          value: 0.1, // 10% cooldown reduction
          valueType: ValueType.PERCENTAGE
        });
        break;

      case 'max hp':
        effects.push({
          targetSystem: SystemId.COMBAT,
          effectType: EffectType.BONUS,
          targetProperty: 'maxHpBonus',
          value: 100, // 100 HP increase
          valueType: ValueType.ADDITIVE
        });
        break;

      case 'armor':
        effects.push({
          targetSystem: SystemId.COMBAT,
          effectType: EffectType.BONUS,
          targetProperty: 'armorBonus',
          value: 25, // 25 armor increase
          valueType: ValueType.ADDITIVE
        });
        break;

      default:
        // Default effect for unknown upgrade types
        effects.push({
          targetSystem: SystemId.ECONOMY,
          effectType: EffectType.BONUS,
          targetProperty: 'generalBonus',
          value: 1,
          valueType: ValueType.ADDITIVE
        });
    }

    return effects;
  }

  // What this does: Calculates base Soul Power cost based on tier
  // Why this exists: Provides consistent cost scaling across all tech trees
  // How it integrates: Used by the CSV import system to set node costs
  private calculateBaseCost(tier: number): number {
    return Math.pow(2, tier) * 100; // 100, 200, 400, 800, 1600, 3200 for tiers 1-6
  }

// What this does: Initializes all system upgrade interfaces with current tech tree
effects
// Why this exists: Applies all unlocked tech tree bonuses to the appropriate game systems
  // How it integrates: Creates upgrade objects that are passed to each system's manager
  private initializeSystemUpgrades(): void {
    this.systemUpgrades.set(SystemId.DISTANCE, this.calculateDistanceUpgrades());
    this.systemUpgrades.set(SystemId.WARD_LAND, this.calculateWardLandUpgrades());
    this.systemUpgrades.set(SystemId.SHIELD_TAX, this.calculateShieldTaxUpgrades());
    this.systemUpgrades.set(SystemId.OFFLINE, this.calculateOfflineUpgrades());
    this.systemUpgrades.set(SystemId.DIVINE_FAVOR, this.calculateDivineFavorUpgrades());
    this.systemUpgrades.set(SystemId.ENCHANTMENT, this.calculateEnchantmentUpgrades());
  }

// What this does: Calculates the total distance upgrades from all unlocked tech tree
nodes
// Why this exists: Aggregates all distance-related tech tree effects into a single
upgrade
object
// How it integrates: Returns a DistanceUpgrades object that can be used by the distance
system
  private calculateDistanceUpgrades(): DistanceUpgrades {
    const effects = this.getEffectsForSystem(SystemId.DISTANCE);
    return {
      speedBonus: this.sumEffects(effects, "speedBonus"),
      rampIntervalReduction: this.sumEffects(effects, "rampIntervalReduction"),
      enemyScalingReduction: this.sumEffects(effects, "enemyScalingReduction"),
      difficultyCapBonus: this.sumEffects(effects, "difficultyCapBonus")
    };
  }

  // What this does: Checks if a player can unlock a specific tech tree node
// Why this exists: Validates prerequisites and Soul Power requirements before allowing
purchases
  // How it integrates: Called by the UI before allowing node purchases
  canUnlockNode(nodeId: string): { canUnlock: boolean; reason?: string } {
    const node = this.nodes.get(nodeId);
    if (!node) return { canUnlock: false, reason: "Node not found" };

    // Check prerequisites
    for (const prereqId of node.prerequisites) {
      if (!this.isNodeUnlocked(prereqId)) {
        return { canUnlock: false, reason: `Prerequisite ${prereqId} not unlocked` };
      }
    }

    // Check Soul Power cost
    const currentLevel = this.playerProgress.unlockedNodes.get(nodeId) || 0;
    if (currentLevel >= node.maxLevel) {
      return { canUnlock: false, reason: "Node already at maximum level" };
    }

    const cost = this.calculateNodeCost(node, currentLevel);
    if (this.getAvailableSoulPower() < cost) {
      return { canUnlock: false, reason: "Insufficient Soul Power" };
    }

    return { canUnlock: true };
  }

  // What this does: Unlocks a tech tree node for the player
  // Why this exists: Handles the purchase logic and updates player progress
// How it integrates: Called when a player purchases a node, updates progress and applies
effects
  unlockNode(nodeId: string): boolean {
    const canUnlock = this.canUnlockNode(nodeId);
    if (!canUnlock.canUnlock) return false;

    const node = this.nodes.get(nodeId)!;
    const currentLevel = this.playerProgress.unlockedNodes.get(nodeId) || 0;
    const cost = this.calculateNodeCost(node, currentLevel);

    // Deduct Soul Power
    this.spendSoulPower(cost);

    // Update progress
    this.playerProgress.unlockedNodes.set(nodeId, currentLevel + 1);
    this.playerProgress.totalSoulPowerSpent += cost;
    this.playerProgress.lastUpdated = Date.now();

    // Recalculate system upgrades
    this.initializeSystemUpgrades();

    // Save progress
    this.savePlayerProgress();

    return true;
  }

  // What this does: Gets all available upgrades for a specific tech tree
  // Why this exists: Provides data for the UI to display available upgrades
  // How it integrates: Called by the UI to populate the tech tree interface
  getAvailableUpgrades(treeId: TechTreeId): TechTreeNode[] {
    return Array.from(this.nodes.values())
      .filter(node => node.treeId === treeId)
      .filter(node => this.canUnlockNode(node.id).canUnlock)
      .sort((a, b) => a.tier - b.tier);
  }
}

```text

### 📦 **Deliverables** (7)

#### Core Systems

- ✅ `TechTreeNode` interface with flexible effect system

- ✅ `TechTreeManager` class for node management and effect application

- ✅ Database schema for tech tree definitions and player progress

- ✅ Integration with all existing upgrade systems

- ✅ CSV import system for easy tech tree modification

- ✅ Automatic effect generation based on upgrade types

- ✅ Automatic prerequisite calculation based on tiers

- ✅ Flexible cost scaling system for Soul Power requirements

#### Integration Points

- ✅ Distance system integration with Flamecraft and Safety tree effects

- ✅ Ward/Land system integration with Scales and Safety tree effects

- ✅ Shield Tax system integration with Safety tree effects

- ✅ Offline progression integration with Safety tree effects

- ✅ Divine Favor system integration with Safety tree effects

- ✅ Enchantment system integration with all tree effects

- ✅ UI integration for tech tree display and interaction

#### Data Persistence

- ✅ Profile schema extension with `techTreeProgress` field

- ✅ CSV-based node definition system for easy modification

- ✅ Migration logic for existing profiles (default: no nodes unlocked)

- ✅ Save/load logic for tech tree progress

#### Database Extensibility Features

- ✅ **Easy Node Addition:** Add new nodes by simply adding rows to CSV

- ✅ **New Tree Creation:** Create new tech trees by adding new Tree column values

- ✅ **Effect Customization:** Modify effect values without code changes

- ✅ **Cost Scaling:** Adjust Soul Power costs through configuration

- ✅ **Prerequisite Logic:** Automatic prerequisite calculation with override capability

- ✅ **Hot Reloading:** Tech tree changes can be applied without game restart

- ✅ **Version Control:** CSV files can be version controlled and diffed easily

- ✅ **Designer-Friendly:** Non-programmers can modify tech trees independently

### 🧪 **Testing Requirements**

#### Unit Tests

```typescript

describe('TechTreeManager', () => {
  test('should load node definitions from CSV', () => {
    const manager = new TechTreeManager(mockDatabase, 'test-player');
    expect(manager.nodes.size).toBeGreaterThan(0);
    expect(manager.nodes.has('flamecraft*damage*1')).toBe(true);
  });

  test('should validate prerequisites before unlocking nodes', () => {
    const manager = new TechTreeManager(mockDatabase, 'test-player');
    const result = manager.canUnlockNode('flamecraft*damage*2');
    expect(result.canUnlock).toBe(false);
    expect(result.reason).toContain('Prerequisite');
  });

  test('should apply effects to system upgrades correctly', () => {
    const manager = new TechTreeManager(mockDatabase, 'test-player');
    manager.unlockNode('flamecraft*damage*1');

    const distanceUpgrades = manager.getSystemUpgrades(SystemId.DISTANCE);
    expect(distanceUpgrades.speedBonus).toBeGreaterThan(0);
  });
});

```javascript

#### Integration Tests

- Tech tree effect application to all game systems

- Prerequisite validation across multiple nodes

- Soul Power cost calculation and deduction

- Progress persistence across sessions

#### E2E Tests

- Complete tech tree progression through all three trees

- Effect application verification in gameplay

- UI interaction and node unlocking flow

- Performance with large tech tree datasets

### ✅ **Completion Criteria** (8)

#### Functional Requirements

- ✅ Tech tree system supports all 84 nodes from CSV definition

- ✅ Node unlocking works with prerequisites and Soul Power costs

- ✅ Effects are correctly applied to all game systems

- ✅ Progress persists across sessions and updates

- ✅ System supports easy addition of new nodes and trees

#### Technical Requirements

- ✅ Database schema supports flexible node definitions

- ✅ CSV import system allows non-code modifications

- ✅ Integration with all existing upgrade systems

- ✅ Performance remains stable with full tech tree loaded

- ✅ Zero per-frame allocations in tech tree calculations

#### Quality Requirements

- ✅ 100% unit test coverage for tech tree logic

- ✅ Integration tests verify effect application to all systems

- ✅ E2E tests verify complete tech tree progression

- ✅ Performance tests confirm no frame drops with full tree

### 🏗️ **What We'll Have After 1.1.8**

**For Non-Coders:** After completing this story, we'll have a comprehensive technology tree system that allows players to permanently upgrade their dragon's capabilities using Soul Power. Players can unlock offensive abilities (Flamecraft), defensive abilities (Scales), and utility improvements (Safety). Each upgrade provides permanent benefits that make every journey more powerful and efficient.

**Technical Summary:** Complete tech tree system with 84 upgrade nodes across 3 trees, database-driven configuration, flexible effect system, and full integration with all existing upgrade systems. The system supports easy expansion and modification without code changes.

---

## 📚 **Story 1.1.7: Dual-Layer Enchantment System Architecture**

### 🎯 **What This Story Does** (6)

**For Non-Coders:** This story creates the foundation for the enchantment system that will support both temporary upgrades (that reset each journey) and permanent upgrades (that players keep forever). Think of it like having both temporary power-ups and permanent character improvements. The system tracks both types separately so that when players return from a journey, their temporary upgrades reset but their permanent improvements stay.

**Technical Summary:** Implement dual-layer enchantment system with temporary journey levels (reset on return) and permanent starting levels (persist across journeys), including data structures, initialization logic, and reset mechanics.

### 🔧 **Technical Specifications** (9)

#### Core Data Structures

```typescript

// Enchantment system interfaces
interface EnchantLevels {
  firepower: number;  // Current level (upgradeable max)
  scales: number;     // Current level (upgradeable max)
  tier: number;       // Current tier (upgradeable max)
}

interface EnchantConfig {
  baseMaxFirepowerLevel: number;  // Base maximum firepower level (45, upgradeable)
  baseMaxScalesLevel: number;     // Base maximum scales level (45, upgradeable)
  baseMaxTier: number;            // Base maximum tier (upgradeable)
  baseArcanaCostPerLevel: number; // Base Arcana cost per level increase (upgradeable)
}

// What this does: Tracks enchantment system upgrades purchased with Soul Power
// Why this exists: Allows players to increase level caps, reduce costs, and improve
enchantment
effectiveness
through
meta-progression
// How it integrates: Modifies EnchantConfig values when calculating level limits and
upgrade
costs
interface EnchantmentUpgrades {
  // Level Cap Increases - Allow higher maximum levels
maxFirepowerBonus: number; // Additional maximum firepower levels (e.g., +10 levels)
  maxScalesBonus: number;         // Additional maximum scales levels (e.g., +10 levels)
  maxTierBonus: number;           // Additional maximum tiers (e.g., +5 tiers)

  // Cost Reductions - Reduce Arcana costs for upgrades
arcanaCostReduction: number; // Reduction to Arcana costs (0.0 = no reduction, 0.5 = 50%
reduction)

  // Effectiveness Bonuses - Improve enchantment power
firepowerEffectivenessBonus: number; // Additional effectiveness for firepower (0.0 = no
bonus,
0.25
=
+25%)
scalesEffectivenessBonus: number; // Additional effectiveness for scales (0.0 = no bonus,
0.25
=
+25%)

  // Permanent Level Bonuses - Start journeys with higher permanent levels
permanentLevelBonus: number; // Additional permanent starting levels (e.g., +5 levels to
all)
}

interface EnchantSystem {
  // Temporary levels that reset on journey end
  temporary: EnchantLevels;

  // Permanent starting levels (purchased with Soul Power)
  permanent: EnchantLevels;

  // Calculated effective levels for gameplay
  effective: EnchantLevels;
}

// What this does: Creates a system that tracks both temporary and permanent enchant
levels
// The effective levels are what actually affect gameplay (temporary + permanent)
// All level limits and costs are upgradeable through Soul Power purchases

```javascript

#### Journey Initialization

```typescript

class EnchantManager {
  private system: EnchantSystem;

  constructor(
    private config: EnchantConfig,
    private upgrades: EnchantmentUpgrades
  ) {}

  // What this does: Calculates effective enchantment configuration with upgrades applied
// Why this exists: Allows players to increase level caps, reduce costs, and improve
effectiveness
through
Soul
Power
purchases
  // How it integrates: Used by all enchantment calculations to apply upgrade bonuses
  private getEffectiveConfig(): EnchantConfig {
    return {
baseMaxFirepowerLevel: this.config.baseMaxFirepowerLevel +
this.upgrades.maxFirepowerBonus,
      baseMaxScalesLevel: this.config.baseMaxScalesLevel + this.upgrades.maxScalesBonus,
      baseMaxTier: this.config.baseMaxTier + this.upgrades.maxTierBonus,
baseArcanaCostPerLevel: this.config.baseArcanaCostPerLevel * (1 -
this.upgrades.arcanaCostReduction)
    };
  }

  initializeJourney(): void {
    const effectiveConfig = this.getEffectiveConfig();

    // Reset temporary levels to permanent starting levels (including permanent bonuses)
    this.system.temporary = {
firepower: Math.min(this.system.permanent.firepower + this.upgrades.permanentLevelBonus,
effectiveConfig.baseMaxFirepowerLevel),
scales: Math.min(this.system.permanent.scales + this.upgrades.permanentLevelBonus,
effectiveConfig.baseMaxScalesLevel),
tier: Math.min(this.system.permanent.tier + this.upgrades.maxTierBonus,
effectiveConfig.baseMaxTier)
    };
    this.updateEffectiveLevels();
  }

  private updateEffectiveLevels(): void {
    // Calculate effective levels (temporary + permanent) with effectiveness bonuses
    this.system.effective = {
firepower: Math.floor((this.system.temporary.firepower + this.system.permanent.firepower)
*
(1
+
this.upgrades.firepowerEffectivenessBonus)),
scales: Math.floor((this.system.temporary.scales + this.system.permanent.scales) * (1 +
this.upgrades.scalesEffectivenessBonus)),
      tier: Math.max(this.system.temporary.tier, this.system.permanent.tier)
    };
  }

// What this does: When starting a journey, temporary levels start at permanent levels
(including
upgrade
bonuses)
  // Then players can spend Arcana to increase temporary levels during the journey
  // All level limits and costs are affected by Soul Power upgrades
}

// What this does: Creates the manager that handles enchant initialization and updates
// When a journey starts, temporary levels are set to permanent starting levels
// During the journey, temporary levels can be increased with Arcana

```javascript

#### Journey Reset Logic

```typescript

class JourneyResetManager {
  resetEnchants(): void {
    // Reset temporary levels to permanent starting levels
    enchantManager.system.temporary = { ...enchantManager.system.permanent };
    enchantManager.updateEffectiveLevels();

    // Log the reset for telemetry
    telemetry.log('enchant_reset', {
      permanentLevels: enchantManager.system.permanent,
      arcanaSpent: this.calculateArcanaSpent()
    });
  }

// What this does: When returning to Draconia, temporary levels reset to permanent levels
  // This preserves the permanent upgrades while resetting temporary ones
}

// What this does: Handles the reset process when returning to Draconia
// Temporary levels go back to permanent starting levels
// Permanent levels remain unchanged

```javascript

#### Database Schema Updates

```typescript

// Updated profile schema to support dual-layer enchant system
export interface ProfileV1 {
  // ... existing fields ...

  // Temporary journey levels (reset on return)
  enchants: {
    firepower: number;
    scales: number;
    tier: number;
  };

  // Permanent starting levels (persist across journeys)
  enchantStartingLevels: {
    firepower: number;  // Current permanent level (upgradeable max)
    scales: number;     // Current permanent level (upgradeable max)
    tier: number;       // Current permanent tier (upgradeable max)
  };
}

// What this does: Extends the database schema to track both temporary and permanent
enchant
levels
// This allows the system to remember permanent upgrades between journeys

```text

### 📦 **Deliverables** (8)

#### Core Systems (2)

- ✅ `EnchantSystem` interface with temporary/permanent/effective level tracking

- ✅ `EnchantConfig` and `EnchantmentUpgrades` interfaces for upgradeable system

- ✅ `EnchantManager` class for initialization and level calculations with upgrade support

- ✅ `JourneyResetManager` for handling enchant resets on return

- ✅ Database schema updates for dual-layer enchant system with upgradeable limits

#### Integration Points (2)

- ✅ Journey state machine integration for enchant initialization

- ✅ Return flow integration for enchant reset

- ✅ Telemetry integration for enchant level tracking

- ✅ UI integration for displaying effective enchant levels

#### Data Persistence (2)

- ✅ Profile schema extension with `enchantStartingLevels` field

- ✅ Migration logic for existing profiles (default permanent levels to 0)

- ✅ Save/load logic for dual-layer enchant system

### 🧪 **Testing Requirements** (2)

#### Unit Tests (2)

```typescript

describe('EnchantManager', () => {
  test('should initialize journey with permanent starting levels', () => {
    const config: EnchantConfig = {
      baseMaxFirepowerLevel: 45,  // Fixed test value for reliability
      baseMaxScalesLevel: 45,     // Fixed test value for reliability
      baseMaxTier: 10,            // Fixed test value for reliability
      baseArcanaCostPerLevel: 100 // Fixed test value for reliability
    };
    const zeroUpgrades: EnchantmentUpgrades = {
      maxFirepowerBonus: 0, maxScalesBonus: 0, maxTierBonus: 0,
      arcanaCostReduction: 0, firepowerEffectivenessBonus: 0, scalesEffectivenessBonus: 0,
      permanentLevelBonus: 0
    };

    const manager = new EnchantManager(config, zeroUpgrades);
    manager.system.permanent = { firepower: 5, scales: 3, tier: 2 }; // Fixed test values

    manager.initializeJourney();

expect(manager.system.temporary).toEqual({ firepower: 5, scales: 3, tier: 2 }); // Fixed
test
values
expect(manager.system.effective).toEqual({ firepower: 10, scales: 6, tier: 2 }); // Fixed
test
values
  });

  test('should apply upgrade bonuses correctly', () => {
    const config: EnchantConfig = {
      baseMaxFirepowerLevel: 45,  // Fixed test value for reliability
      baseMaxScalesLevel: 45,     // Fixed test value for reliability
      baseMaxTier: 10,            // Fixed test value for reliability
      baseArcanaCostPerLevel: 100 // Fixed test value for reliability
    };
    const upgrades: EnchantmentUpgrades = {
      maxFirepowerBonus: 10,      // +10 levels - fixed test value
      maxScalesBonus: 10,         // +10 levels - fixed test value
      maxTierBonus: 5,            // +5 tiers - fixed test value
      arcanaCostReduction: 0.5,   // 50% reduction - fixed test value
      firepowerEffectivenessBonus: 0.25, // +25% effectiveness - fixed test value
      scalesEffectivenessBonus: 0.25,    // +25% effectiveness - fixed test value
      permanentLevelBonus: 5      // +5 permanent levels - fixed test value
    };

    const manager = new EnchantManager(config, upgrades);
    manager.system.permanent = { firepower: 5, scales: 3, tier: 2 }; // Fixed test values

    manager.initializeJourney();

    // Should start with permanent + permanent bonus levels
expect(manager.system.temporary).toEqual({ firepower: 10, scales: 8, tier: 7 }); // Fixed
test
values
    // Should apply effectiveness bonuses to effective levels
expect(manager.system.effective).toEqual({ firepower: 18, scales: 14, tier: 7 }); // Fixed
test
values
  });
});

// What this tests: Ensures the enchant system correctly calculates effective levels
// and initializes journeys with the right starting values

```javascript

#### Integration Tests (2)

```typescript

describe('Journey Enchant Integration', () => {
  test('should reset enchants to permanent levels on return', async () => {
    const journey = await createTestJourney();
    journey.enchantManager.system.permanent = { firepower: 5, scales: 3, tier: 2 };
    journey.enchantManager.system.temporary = { firepower: 15, scales: 8, tier: 3 };

    await journey.returnToDraconia();

expect(journey.enchantManager.system.temporary).toEqual({ firepower: 5, scales: 3, tier: 2
});
expect(journey.enchantManager.system.effective).toEqual({ firepower: 10, scales: 6, tier:
2
});
  });
});

// What this tests: Ensures the complete journey flow correctly resets enchants
// and maintains permanent starting levels

```javascript

#### E2E Tests (2)

```typescript

describe('Enchant System E2E', () => {
  test('should maintain permanent upgrades across multiple journeys', async () => {
    // Start journey with permanent +5 firepower
    await page.goto('/journey');
    await page.click('[data-testid="start-journey"]');

    // Verify starting levels
    await expect(page.locator('[data-testid="firepower-level"]')).toHaveText('5');

    // Spend Arcana to increase temporary levels
    await page.click('[data-testid="upgrade-firepower"]');
    await expect(page.locator('[data-testid="firepower-level"]')).toHaveText('6');

    // Return to Draconia
    await page.click('[data-testid="return-to-draconia"]');

    // Start new journey - should start at permanent level again
    await page.click('[data-testid="start-journey"]');
    await expect(page.locator('[data-testid="firepower-level"]')).toHaveText('5');
  });
});

// What this tests: Ensures the complete user experience works correctly
// Permanent upgrades persist across journeys while temporary ones reset

```javascript

### ✅ **Completion Criteria** (9)

#### Functional Requirements (2)

- ✅ Enchant system supports both temporary and permanent level tracking

- ✅ Journey initialization sets temporary levels to permanent starting levels (including upgrade bonuses)

- ✅ Journey reset preserves permanent levels while resetting temporary ones

- ✅ Effective levels correctly calculated as temporary + permanent with effectiveness bonuses

- ✅ Database schema supports dual-layer enchant system with upgradeable limits

- ✅ Upgrade system increases level caps and reduces costs correctly

- ✅ Soul Power upgrades integrate with enchantment progression

#### Technical Requirements (2)

- ✅ Zero per-frame allocations in enchant level calculations

- ✅ Enchant system integrates with existing journey state machine

- ✅ Telemetry tracks enchant level changes and resets

- ✅ Database migrations handle existing profile data

#### Quality Requirements (2)

- ✅ 100% unit test coverage for enchant system logic including upgrade scenarios

- ✅ Integration tests verify journey lifecycle with enchants and upgrade system

- ✅ E2E tests verify complete user experience with upgrade progression

- ✅ Performance tests confirm no frame drops during enchant operations with upgrades

- ✅ Test values use fixed constants for reliable, consistent testing

### 🏗️ **What We'll Have After 1.1.7**

**For Non-Coders:** After completing this story, we'll have a robust enchantment system that supports both temporary upgrades (that reset each journey) and permanent upgrades (that players keep forever). This means players can spend Arcana during a journey to get temporary power boosts, but they can also spend Soul Power to get permanent starting bonuses that make every journey start stronger.

**Technical Summary:** Complete dual-layer enchantment system with temporary journey levels, permanent starting levels, effective level calculations, journey initialization/reset logic, database schema support, and full integration with the journey lifecycle.

---

## Epic 1.1 Integration Tests

### Cross-Story Integration

- Journey state management with distance progression

- Ward advancement with return system

- Offline progression with rested bonus

- Enchant system with journey lifecycle and permanent upgrades

- Complete Epic 1.1 workflow

### Performance Integration

- All systems working together at 60fps

- Memory usage within budgets

- Deterministic behavior across all systems

### E2E Epic Tests

- Complete journey: start → progress → ward advancement → return

- Offline progression with rested bonus

- Error recovery across all systems

## Epic 1.1 Completion Criteria

### Technical Requirements (3)

- [ ] All 8 stories (1.1.0 through 1.1.7) completed

- [ ] 100% unit test coverage across all stories

- [ ] 95%+ integration test coverage

- [ ] All E2E tests passing

- [ ] Performance budgets met (60fps desktop, ≥40fps mobile)

- [ ] Zero per-frame allocations

- [ ] Deterministic behavior verified

- [ ] Tech tree system with 84+ upgrade nodes integrated

### Quality Gates (2)

- [ ] TypeScript strict mode compliance

- [ ] ESLint/Prettier validation clean

- [ ] All CI/CD workflows passing

- [ ] Documentation complete for all systems

- [ ] API contracts stable and documented

### Epic 1.1 Definition of Done

Players can start a journey, progress through distance with micro-ramps, advance through
wards,
return
to
Draconia
with
proper
arcana
donation
and
enchantment
reset,
benefit
from
offline
progression
with
decay,
earn/use
divine
favor
bonuses
for
increased
progression
rates,
and
permanently
upgrade
their
dragon's
capabilities
through
the
comprehensive
tech
tree
system
with
84+
upgrade
nodes
across
Flamecraft,
Scales,
and
Safety
trees.

**Epic 1.1 serves as the foundation for all subsequent Phase 1 epics and must be 100% complete before advancing to Epic 1.2.**
