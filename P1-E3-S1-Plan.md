# P1-E3-S1 Planning Document

## Issue Analysis

**Story**: P1-E3-S1: Dragon Health System
**Epic**: P1-E3 (Dragon Combat System)
**Priority**: Critical
**Effort**: 3 story points
**Dependencies**: P1-E2-S2 (Basic AI State Machine) ✅ Complete

### Current State

- Enemy spawning and AI systems are complete and working

- Core determinism engine is in place

- We need to implement the dragon's health system to enable combat

### Requirements Summary

- Dragon must have health points (HP) that decrease when taking damage

- **Death/Respawn Logic**: When dragon health reaches 0:
  - Clear all projectiles and enemies from screen

  - Dragon enters "idle" mode

  - Health bar progressively recovers from 0% to 100%

  - During recovery, dragon loses journey distance (pushback effect)

  - Once health is fully restored, enemies resume spawning and attacking

  - Journey continues automatically (no Arcana lost)

- Health system integrates with damage calculation

- Health state persists during combat sessions

- **Journey End**: Only occurs when player manually hits "Return to Draconia"

## Implementation Plan

### Phase 1: Core Health System

1. **Create Health Types and Interfaces**
   - Define `DragonHealth` interface

   - Create health-related type definitions

   - Set up health configuration options

1. **Implement Health Manager**
   - Create `DragonHealthManager` class

   - Implement HP tracking and damage application

   - Add death detection and pushback respawn logic

   - Implement progressive health recovery system

   - Add distance pushback calculation based on land/ward levels

1. **Integration Points**
   - Connect with existing enemy AI system

   - Integrate with journey distance tracking

   - Implement pushback distance calculation

   - Set up health state persistence

   - Connect with projectile/enemy clearing system

### Phase 2: Testing and Validation

1. **Unit Tests**
   - Health state management tests

   - Damage application tests

   - Death/respawn logic tests

   - Performance tests

1. **Integration Tests**
   - Health system with enemy AI

   - State persistence verification

   - Performance under load

### Phase 3: Documentation and Cleanup

1. **Code Documentation**
   - Add comprehensive JSDoc comments

   - Update architecture documentation

   - Create usage examples

1. **Performance Optimization**
   - Ensure health updates are efficient

   - Optimize memory usage

   - Validate performance targets

## Risk Assessment

### High Risk

- **Performance Impact**: Health system updates could affect frame rate

- **State Persistence**: Health state might not persist correctly across sessions

### Medium Risk

- **Integration Complexity**: Connecting with existing systems might be complex

- **Death Logic**: Respawn mechanics might need careful tuning

### Mitigation Strategies

- **Early Performance Testing**: Test health updates under load

- **Incremental Integration**: Connect systems gradually

- **Comprehensive Testing**: Extensive unit and integration tests

- **State Validation**: Verify persistence at each step

## TODO List

### Core Implementation

- [ ] Create `packages/sim/src/combat/types.ts` - Health and damage type definitions

- [ ] Create `packages/sim/src/combat/dragon-health.ts` - Dragon health management

- [ ] Implement `DragonHealthManager` class with core functionality

- [ ] Implement percentage-based pushback calculation (3-15% based on land/ward)

- [ ] Implement progressive health recovery system with scaling recovery time

- [ ] Implement ward/land transition logic during pushback

- [ ] Add health state persistence

- [ ] Integrate with existing enemy AI system

- [ ] Integrate with journey distance tracking

- [ ] Implement projectile/enemy clearing on death

### Testing

- [ ] Create `packages/sim/tests/combat/dragon-health.test.ts` - Health system tests

- [ ] Unit tests for health state management

- [ ] Unit tests for percentage-based pushback calculation

- [ ] Unit tests for ward/land transition logic

- [ ] Unit tests for progressive recovery system

- [ ] Integration tests with enemy AI

- [ ] Integration tests with journey distance tracking

- [ ] Edge case tests (pushback at distance 0, ward boundaries)

- [ ] Performance tests under load

- [ ] State persistence verification

### Documentation

- [ ] Add JSDoc comments to all functions

- [ ] Update CLAUDE.md with new system

- [ ] Update changelog with implementation

- [ ] Create usage examples

### Performance Validation

- [ ] Health updates: <0.1ms per frame

- [ ] Memory usage: <1MB for health system

- [ ] State persistence: <5ms save/load

## Acceptance Criteria

### Functional Requirements

- [ ] Dragon has health points (HP) that decrease when taking damage

- [ ] Dragon can die and enter recovery mode with progressive health restoration

- [ ] Death clears all projectiles and enemies from screen

- [ ] During recovery, dragon loses journey distance (percentage-based pushback)

- [ ] Pushback percentage: 3% (new land tutorial) to 15% (final ward) with land difficulty spikes

- [ ] Ward/land transitions handled correctly during pushback

- [ ] Pushback never results in negative distance (minimum 0)

- [ ] Health system integrates with damage calculation

- [ ] Health state persists during combat sessions

- [ ] Journey continues automatically after recovery (no Arcana lost)

- [ ] Journey only ends when player manually returns to Draconia

### Technical Requirements

- [ ] All unit tests pass

- [ ] Integration tests pass

- [ ] Performance targets achieved

- [ ] Code follows project standards (TypeScript strict, ESLint)

- [ ] Documentation updated

### Quality Requirements

- [ ] Code reviewed and approved

- [ ] Performance benchmarks met

- [ ] Memory usage within limits

- [ ] State persistence verified

## Pushback Distance Calculation

### Research Findings

Based on research of Unnamed Space Idle and similar idle games, the pushback mechanic should:

1. **Percentage-Based System**: Pushback as percentage of current distance (3-15%)

1. **Land Difficulty Spikes**: New lands start with gentle 3% pushback to ease into difficulty

1. **Ward Progression**: Within each land, pushback increases from 3% to 15% across wards

1. **Progressive Recovery**: Health recovery time scales with pushback percentage

1. **Minimum Pushback**: Ensure minimum pushback to maintain challenge

### Progression Pattern

````text

Land 1: Horizon Steppe
├── Ward 1: 3% (tutorial)
├── Ward 2: 5% (basic)
├── Ward 3: 7% (air combat)
├── Ward 4: 10% (accuracy)
└── Ward 5: 12% (crosswind)

Land 2: Ember Reaches (Difficulty Spike!)
├── Ward 1: 3% (new land tutorial - gentle)
├── Ward 2: 6% (fire basics)
├── Ward 3: 9% (heat resistance)
├── Ward 4: 12% (lava flows)
└── Ward 5: 15% (ember mastery)

Land 3: Mistral Peaks (Difficulty Spike!)
├── Ward 1: 3% (new land tutorial - gentle)
├── Ward 2: 7% (wind basics)
├── Ward 3: 11% (ice resistance)
├── Ward 4: 14% (storm peaks)
└── Ward 5: 15% (summit mastery)

```javascript

### Proposed Formula

```typescript

// Percentage-based pushback system with land difficulty spikes
const PUSHBACK_PERCENTAGES = {
  // Land 1: Horizon Steppe (Tutorial → Advanced)
  '1-1': 0.03,  // Sunwake Downs: 3% (gentle tutorial)
  '1-2': 0.05,  // Waystone Mile: 5% (basic progression)
  '1-3': 0.07,  // Skylark Flats: 7% (air combat intro)
  '1-4': 0.10,  // Longgrass Reach: 10% (accuracy challenges)
  '1-5': 0.12,  // Bluewind Shelf: 12% (crosswind mechanics)

  // Land 2: Ember Reaches (Difficulty spike → Advanced)
  '2-1': 0.03,  // New land tutorial: 3% (ease into difficulty spike)
  '2-2': 0.06,  // Fire progression: 6% (learning fire mechanics)
  '2-3': 0.09,  // Heat challenges: 9% (fire resistance)
  '2-4': 0.12,  // Lava flows: 12% (advanced fire combat)
  '2-5': 0.15,  // Ember peaks: 15% (master fire mechanics)

  // Land 3: Mistral Peaks (Difficulty spike → Advanced)
  '3-1': 0.03,  // New land tutorial: 3% (ease into wind/ice)
  '3-2': 0.07,  // Wind currents: 7% (learning wind mechanics)
  '3-3': 0.11,  // Ice challenges: 11% (ice resistance)
  '3-4': 0.14,  // Storm peaks: 14% (advanced wind/ice)
  '3-5': 0.15,  // Summit: 15% (master wind/ice mechanics)

  // Land 4+: Additional Lands (Same pattern)
  '4-1': 0.03,  // New land tutorial: 3% (ease into new mechanics)
  '4-2': 0.08,  // Mid-progression: 8% (learning new systems)
  '4-3': 0.12,  // Advanced: 12% (mastering new mechanics)
  '4-4': 0.15,  // Expert: 15% (endgame challenge)
  '4-5': 0.15,  // Master: 15% (maximum difficulty)
};

// Calculate pushback distance based on current distance and land/ward
function calculatePushbackDistance(
  currentDistance: number,
  landLevel: number,
  wardLevel: number
): number {
  const key = `${landLevel}-${wardLevel}`;
  const pushbackPercentage = PUSHBACK_PERCENTAGES[key] || 0.10; // Default 10%

  // Calculate pushback distance
  const pushbackDistance = currentDistance * pushbackPercentage;

  // Ensure we don't go below 0 distance
  const maxSafePushback = currentDistance;
  const finalPushback = Math.min(pushbackDistance, maxSafePushback);

  return Math.max(finalPushback, 0); // Never negative
}

// Alternative dynamic calculation for any land/ward combination
function calculateDynamicPushbackPercentage(landLevel: number, wardLevel: number): number {
  // Base percentage for new land (always 3%)
  const newLandPercentage = 0.03;

  // Maximum percentage for final ward (15%)
  const maxPercentage = 0.15;

  // If it's the first ward of a new land, use gentle pushback
  if (wardLevel === 1) {
    return newLandPercentage;
  }

  // Calculate progression within the land
  const wardProgression = (wardLevel - 1) / 4; // 0.0 to 1.0 across 5 wards
  const percentageRange = maxPercentage - newLandPercentage;
  const dynamicPercentage = newLandPercentage + (percentageRange * wardProgression);

  return Math.min(dynamicPercentage, maxPercentage);
}

```javascript

### Recovery Time Calculation

```typescript

// Health recovery time (seconds) - scales with pushback distance
const BASE*RECOVERY*TIME = 6; // Base 6 seconds
const MAX*RECOVERY*TIME = 12; // Maximum 12 seconds

// Calculate recovery time based on pushback percentage
function calculateRecoveryTime(pushbackPercentage: number): number {
  // Longer recovery for larger pushbacks
  const recoveryTime = BASE*RECOVERY*TIME + (pushbackPercentage * 100);
  return Math.min(recoveryTime, MAX*RECOVERY*TIME);
}

// Pushback rate (meters per second)
function calculatePushbackRate(pushbackDistance: number, recoveryTime: number): number {
  return pushbackDistance / recoveryTime;
}

```javascript

### Ward/Land Transition Logic

```typescript

// Handle ward/land transitions during pushback
function handlePushbackTransition(
  currentDistance: number,
  pushbackDistance: number,
  landLevel: number,
  wardLevel: number
): { newDistance: number; newLand: number; newWard: number } {
  const newDistance = Math.max(currentDistance - pushbackDistance, 0);

  // Determine new land/ward based on distance
  const newLand = determineLandFromDistance(newDistance);
  const newWard = determineWardFromDistance(newDistance, newLand);

  return {
    newDistance,
    newLand,
    newWard
  };
}

// Example ward boundaries (from documentation)
function determineWardFromDistance(distance: number, land: number): number {
  if (land === 1) {
    if (distance < 500) return 1;      // Sunwake Downs (0-500m)
    if (distance < 1000) return 2;      // Waystone Mile (500-1000m)
    if (distance < 1500) return 3;      // Skylark Flats (1000-1500m)
    if (distance < 2000) return 4;     // Longgrass Reach (1500-2000m)
    return 5; // Bluewind Shelf (2000m+)
  }
  // Add other land boundaries as needed
  return 1; // Default
}

```javascript

## Technical Architecture

### Core Components

#### DragonHealth Interface

```typescript

interface DragonHealth {
  currentHP: number;
  maxHP: number;
  isAlive: boolean;
  isRecovering: boolean;
  recoveryProgress: number; // 0.0 to 1.0
  pushbackDistance: number;
  pushbackPercentage: number; // Percentage of current distance to push back
  takeDamage(amount: number): void;
  heal(amount: number): void;
  startRecovery(currentDistance: number, landLevel: number, wardLevel: number): void;
  updateRecovery(deltaTime: number): void;
  getPushbackDistance(): number;
  respawn(): void;
}

```javascript

#### Health Manager

```typescript

class DragonHealthManager {
  private health: DragonHealth;
  private config: HealthConfig;
  private landLevel: number;
  private wardLevel: number;
  private currentDistance: number;

  constructor(config: HealthConfig, landLevel: number, wardLevel: number, currentDistance: number);
  update(deltaTime: number): void;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  isAlive(): boolean;
  isRecovering(): boolean;
  getRecoveryProgress(): number;
  getPushbackDistance(): number;
  getPushbackPercentage(): number;
  startRecovery(): void;
  handleWardTransition(): { newLand: number; newWard: number; newDistance: number };
  respawn(): void;
}

```text

### Files to Create/Modify

#### New Files

- `packages/sim/src/combat/types.ts` - Health and damage type definitions

- `packages/sim/src/combat/dragon-health.ts` - Dragon health management

- `packages/sim/tests/combat/dragon-health.test.ts` - Health system tests

#### Modified Files

- `packages/sim/src/index.ts` - Export new health system

- `CLAUDE.md` - Update with new system documentation

- `docs/overview/changelog.md` - Add implementation entry

### Performance Targets

- Health updates: <0.1ms per frame

- Memory usage: <1MB for health system

- State persistence: <5ms save/load

- Integration: <0.5ms additional overhead

## Success Metrics

### Functional Metrics

- Health system responds correctly to damage

- Death/respawn cycle works smoothly

- State persistence maintains data integrity

- Integration with enemy AI is seamless

### Performance Metrics

- Health updates complete within target time

- Memory usage stays within limits

- No performance degradation in combat

- State persistence is reliable

### Quality Metrics

- 100% test coverage for health system

- All tests pass consistently

- Code follows project standards

- Documentation is complete and accurate

## Next Steps

1. **Get User Approval**: Present this plan for review and approval

1. **Execute Implementation**: Work through TODO list systematically

1. **Testing and Validation**: Ensure all requirements are met

1. **Documentation**: Update all relevant documentation

1. **Pre-PR Check**: Comprehensive summary before PR creation

1. **Final PR**: Create and merge PR after approval

---

**Created**: 2025-01-28
**Status**: Planning Complete
**Next**: User Approval Required
````
