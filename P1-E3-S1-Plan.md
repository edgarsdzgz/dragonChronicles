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

2. **Implement Health Manager**
   - Create `DragonHealthManager` class
   - Implement HP tracking and damage application
   - Add death detection and pushback respawn logic
   - Implement progressive health recovery system
   - Add distance pushback calculation based on land/ward levels

3. **Integration Points**
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

2. **Integration Tests**
   - Health system with enemy AI
   - State persistence verification
   - Performance under load

### Phase 3: Documentation and Cleanup
1. **Code Documentation**
   - Add comprehensive JSDoc comments
   - Update architecture documentation
   - Create usage examples

2. **Performance Optimization**
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
- [ ] Pushback percentage: 3% (L1W1) to 15% (L3W3+) based on land/ward
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

1. **Base Pushback Distance**: Start with a fixed base distance (e.g., 100-200 meters)
2. **Land/Ward Modifiers**: Higher land and ward levels reduce pushback distance
3. **Progressive Recovery**: Health recovery time correlates with pushback distance
4. **Minimum Pushback**: Ensure minimum pushback to maintain challenge

### Proposed Formula
```typescript
// Percentage-based pushback system
const PUSHBACK_PERCENTAGES = {
  // Base percentages by land/ward combination
  '1-1': 0.03,  // Land 1, Ward 1: 3% pushback
  '1-2': 0.05,  // Land 1, Ward 2: 5% pushback
  '1-3': 0.07,  // Land 1, Ward 3: 7% pushback
  '2-1': 0.05,  // Land 2, Ward 1: 5% pushback
  '2-2': 0.08,  // Land 2, Ward 2: 8% pushback
  '2-3': 0.10,  // Land 2, Ward 3: 10% pushback
  '3-1': 0.08,  // Land 3, Ward 1: 8% pushback
  '3-2': 0.12,  // Land 3, Ward 2: 12% pushback
  '3-3': 0.15,  // Land 3, Ward 3: 15% pushback
  // Higher lands/wards can have up to 15% pushback
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
```

### Recovery Time Calculation
```typescript
// Health recovery time (seconds) - scales with pushback distance
const BASE_RECOVERY_TIME = 6; // Base 6 seconds
const MAX_RECOVERY_TIME = 12; // Maximum 12 seconds

// Calculate recovery time based on pushback percentage
function calculateRecoveryTime(pushbackPercentage: number): number {
  // Longer recovery for larger pushbacks
  const recoveryTime = BASE_RECOVERY_TIME + (pushbackPercentage * 100);
  return Math.min(recoveryTime, MAX_RECOVERY_TIME);
}

// Pushback rate (meters per second)
function calculatePushbackRate(pushbackDistance: number, recoveryTime: number): number {
  return pushbackDistance / recoveryTime;
}
```

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
```

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
```

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
```

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
2. **Execute Implementation**: Work through TODO list systematically
3. **Testing and Validation**: Ensure all requirements are met
4. **Documentation**: Update all relevant documentation
5. **Pre-PR Check**: Comprehensive summary before PR creation
6. **Final PR**: Create and merge PR after approval

---

**Created**: 2025-01-28
**Status**: Planning Complete
**Next**: User Approval Required
