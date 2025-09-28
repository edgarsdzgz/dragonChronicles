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
- [ ] Implement pushback distance calculation based on land/ward levels
- [ ] Implement progressive health recovery system
- [ ] Add health state persistence
- [ ] Integrate with existing enemy AI system
- [ ] Integrate with journey distance tracking
- [ ] Implement projectile/enemy clearing on death

### Testing
- [ ] Create `packages/sim/tests/combat/dragon-health.test.ts` - Health system tests
- [ ] Unit tests for health state management
- [ ] Unit tests for pushback distance calculation
- [ ] Unit tests for progressive recovery system
- [ ] Integration tests with enemy AI
- [ ] Integration tests with journey distance tracking
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
- [ ] During recovery, dragon loses journey distance (pushback effect)
- [ ] Pushback distance calculated based on land and ward levels
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
// Base pushback distance (meters)
const BASE_PUSHBACK = 150;

// Land and ward influence factors
const LAND_FACTOR = 0.1;  // 10% reduction per land level
const WARD_FACTOR = 0.05; // 5% reduction per ward level

// Calculate pushback distance
function calculatePushbackDistance(landLevel: number, wardLevel: number): number {
  const landReduction = landLevel * LAND_FACTOR;
  const wardReduction = wardLevel * WARD_FACTOR;
  const totalReduction = Math.min(landReduction + wardReduction, 0.8); // Max 80% reduction
  
  const pushbackDistance = BASE_PUSHBACK * (1 - totalReduction);
  return Math.max(pushbackDistance, 20); // Minimum 20 meters pushback
}
```

### Recovery Time Calculation
```typescript
// Health recovery time (seconds)
const RECOVERY_TIME = 8; // 8 seconds to fully recover

// Pushback rate (meters per second)
function calculatePushbackRate(pushbackDistance: number): number {
  return pushbackDistance / RECOVERY_TIME;
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
  takeDamage(amount: number): void;
  heal(amount: number): void;
  startRecovery(pushbackDistance: number): void;
  updateRecovery(deltaTime: number): void;
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
  
  constructor(config: HealthConfig, landLevel: number, wardLevel: number);
  update(deltaTime: number): void;
  takeDamage(amount: number): void;
  heal(amount: number): void;
  isAlive(): boolean;
  isRecovering(): boolean;
  getRecoveryProgress(): number;
  getPushbackDistance(): number;
  startRecovery(): void;
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
