# P1-E3-S2: Targeting Logic - Implementation Plan

**Story ID**: P1-E3-S2
**Epic**: P1-E3 (Dragon Combat System)
**Priority**: Critical
**Effort**: 4 story points
**Dependencies**: P1-E3-S1 (Dragon Health System) ✅ Complete

## Story Overview

Implement the dragon targeting system that allows the dragon to intelligently select and track enemies during combat..
This system will determine which enemies to prioritize based on proximity, threat level, and combat state.

## Acceptance Criteria

- [ ] Dragon targets nearest enemy in range

- [ ] Targeting prioritizes by threat level

- [ ] Target selection updates dynamically

- [ ] Targeting works with multiple enemies

- [ ] Target switching is smooth and responsive

## Technical Implementation

### Core Components

#### 1. Target Selection System

````typescript

interface TargetingSystem {
  currentTarget: Enemy | null;
  findNearestTarget(enemies: Enemy[]): Enemy | null;
  updateTarget(): void;
  isInRange(target: Enemy): boolean;
  calculateThreatLevel(enemy: Enemy): number;
}

```javascript

#### 2. Range Detection

```typescript

interface RangeDetection {
  getTargetsInRange(enemies: Enemy[], range: number): Enemy[];
  calculateDistance(dragon: Dragon, enemy: Enemy): number;
  isWithinRange(dragon: Dragon, enemy: Enemy, range: number): boolean;
}

```javascript

#### 3. Threat Assessment

```typescript

interface ThreatAssessment {
  calculateThreatLevel(enemy: Enemy): number;
  prioritizeTargets(enemies: Enemy[]): Enemy[];
  getThreatFactors(enemy: Enemy): ThreatFactor[];
}

```text

### Implementation Steps

#### Phase 1: Core Targeting Infrastructure

1. **Create targeting types and interfaces**

    - Define `TargetingSystem` interface

    - Create `TargetingState` enum

    - Define threat calculation types

1. **Implement range detection system**

    - Create `RangeDetection` class

    - Implement distance calculation

    - Add range validation logic

1. **Create threat assessment system**

    - Implement `ThreatAssessment` class

    - Define threat factors (HP, damage, proximity, type)

    - Create threat calculation algorithm

#### Phase 2: Target Selection Logic

1. **Implement target selection algorithm**

    - Create `TargetingSystem` class

    - Implement nearest target finding

    - Add threat-based prioritization

1. **Add dynamic target updates**

    - Implement target switching logic

    - Add target validation (alive, in range)

    - Create smooth transition system

#### Phase 3: Integration and Testing

1. **Integrate with existing systems**

    - Connect with enemy AI system

    - Integrate with dragon health system

    - Add targeting state to game state

1. **Performance optimization**

    - Implement spatial partitioning for range queries

    - Add target caching for performance

    - Optimize threat calculations

## Files to Create/Modify

### New Files

- `packages/sim/src/combat/targeting.ts` - Main targeting system

- `packages/sim/src/combat/range-detection.ts` - Range calculation logic

- `packages/sim/src/combat/threat-assessment.ts` - Threat level calculation

- `packages/sim/tests/combat/targeting.test.ts` - Targeting system tests

- `packages/sim/tests/combat/range-detection.test.ts` - Range detection tests

- `packages/sim/tests/combat/threat-assessment.test.ts` - Threat assessment tests

### Modified Files

- `packages/sim/src/combat/types.ts` - Add targeting-related types

- `packages/sim/src/index.ts` - Export new targeting modules

- `packages/sim/tests/integration/combat.integration.spec.ts` - Integration tests

## Technical Specifications

### Target Selection Algorithm

1. **Range Filtering**: Filter enemies within dragon's attack range

1. **Threat Calculation**: Calculate threat level for each enemy

1. **Prioritization**: Sort by threat level, then by distance

1. **Selection**: Choose highest priority target

1. **Validation**: Ensure target is still valid (alive, in range)

### Threat Factors

- **Proximity**: Closer enemies are higher threat

- **Health**: Lower health enemies are higher threat (easier to kill)

- **Damage**: Higher damage enemies are higher threat

- **Type**: Certain enemy types have higher threat multipliers

- **Status**: Enemies with special abilities have higher threat

### Performance Requirements

- **Target Selection**: <0.1ms for 200 enemies

- **Range Detection**: <0.05ms for 200 enemies

- **Threat Calculation**: <0.02ms per enemy

- **Memory Usage**: <1MB for targeting system

## Testing Strategy

### Unit Tests

- Target selection algorithm accuracy

- Range detection precision

- Threat calculation correctness

- Target validation logic

- Performance benchmarks

### Integration Tests

- Targeting with enemy AI system

- Integration with dragon health system

- Multi-enemy targeting scenarios

- Performance under load

### E2E Tests

- Complete targeting flow

- Target switching during combat

- Performance regression testing

## Risk Assessment

### High Risk

- **Performance Degradation**: Complex targeting calculations could impact frame rate

- **Target Switching Issues**: Rapid target changes might cause visual glitches

### Medium Risk

- **Threat Calculation Complexity**: Balancing threat factors might be difficult

- **Integration Issues**: Coordinating with existing enemy AI system

### Mitigation Strategies

- Early performance testing with target enemy counts

- Simple threat model initially, expand complexity gradually

- Extensive integration testing with enemy systems

- Iterative testing with gameplay metrics

## Success Criteria

### Functional Requirements

- [ ] Dragon correctly targets nearest enemy in range

- [ ] Threat-based prioritization works as specified

- [ ] Target selection updates dynamically

- [ ] Multiple enemy targeting functions correctly

- [ ] Target switching is smooth and responsive

### Quality Requirements

- [ ] All unit tests pass

- [ ] Integration tests pass

- [ ] Performance benchmarks met

- [ ] Code follows project standards

### Deliverables

- [ ] Complete targeting system

- [ ] Range detection and threat assessment

- [ ] Performance optimization

- [ ] Comprehensive test coverage

- [ ] Documentation and code comments

## Next Steps

1. **Create feature branch**: `feat/p1-e3-s2-targeting-logic`

1. **Implement core targeting infrastructure**

1. **Develop target selection logic**

1. **Add dynamic target updates**

1. **Integrate with existing systems**

1. **Performance optimization**

1. **Comprehensive testing**

1. **Documentation and review**

---

**Created**: 2025-09-30
**Status**: Planning Complete
**Next**: Implementation Phase
````
