# P1-E4-S1: Arcana Drop System - Story Plan

**Story ID:** P1-E4-S1  
**Epic:** P1-E4 (Arcana Economy & Enchant System)  
**Priority:** Critical  
**Effort:** 4 story points  
**Dependencies:** P1-E3-S6 (Dragon Combat System) ✅ Complete

## Story Overview

Implement the core Arcana drop system that forms the foundation of the economic loop. This story establishes how players earn Arcana from combat encounters, including enemy kills, boss rewards, and distance-based scaling. The system must be deterministic, performant, and integrate seamlessly with the existing combat system.

## Objectives

### Primary Goals

1. **Arcana Drop System**: Implement core Arcana drop mechanics from enemy kills
2. **Boss Rewards**: Add significant Arcana rewards for boss encounters
3. **Distance Scaling**: Implement distance-based Arcana drop scaling
4. **Combat Integration**: Seamlessly integrate with existing combat system
5. **Deterministic Drops**: Ensure consistent, reproducible Arcana drops

### Success Criteria

- [ ] Enemies drop Arcana when killed (base amount + scaling)
- [ ] Boss encounters provide significant Arcana rewards
- [ ] Arcana drop rates scale with distance/ward progression
- [ ] Arcana collection integrates with combat system
- [ ] Arcana drops are deterministic and consistent
- [ ] Performance targets met (<1ms per frame)

## Technical Implementation

### Core Components

#### 1. Arcana Drop Manager

**File:** `packages/sim/src/economy/arcana-drop-manager.ts`

**Responsibilities:**

- Manage Arcana drop calculations and collection
- Handle distance-based scaling
- Integrate with combat system
- Provide deterministic drop behavior

**Key Methods:**

```typescript
interface ArcanaDropManager {
  baseDropAmount: number;
  scalingFactor: number;
  currentDistance: number;

  dropArcana(amount: number, source: ArcanaSource): void;
  calculateDropAmount(enemy: Enemy, distance: number): number;
  collectArcana(amount: number): void;
  getCurrentBalance(): number;
  resetForNewJourney(): void;
}
```

#### 2. Arcana Scaling System

**File:** `packages/sim/src/economy/arcana-scaling.ts`

**Responsibilities:**

- Calculate distance-based scaling factors
- Handle ward progression scaling
- Provide scaling formulas and constants

**Key Methods:**

```typescript
interface ArcanaScaling {
  calculateScalingFactor(distance: number, ward: number): number;
  getBaseDropAmount(enemyType: EnemyType): number;
  getBossRewardMultiplier(bossType: BossType): number;
}
```

#### 3. Economic Types

**File:** `packages/sim/src/economy/types.ts`

**Responsibilities:**

- Define all economic system types
- Provide type safety for Arcana system
- Export interfaces for other systems

**Key Types:**

```typescript
interface ArcanaSource {
  type: 'enemy_kill' | 'boss_reward' | 'distance_bonus';
  enemyId?: string;
  bossId?: string;
  distance?: number;
}

interface ArcanaDrop {
  amount: number;
  source: ArcanaSource;
  timestamp: number;
  scalingFactor: number;
}

interface ArcanaBalance {
  current: number;
  totalEarned: number;
  totalSpent: number;
  drops: ArcanaDrop[];
}
```

### Integration Points

#### Combat System Integration

- **Enemy Death Events**: Listen for enemy death events from combat system
- **Boss Encounter Events**: Handle special boss reward events
- **Distance Tracking**: Integrate with journey progression system
- **Performance**: Ensure economic calculations don't impact combat performance

#### Core Engine Integration

- **RNG System**: Use deterministic RNG for consistent drops
- **Clock System**: Integrate with fixed timestep for economic updates
- **Protocol System**: Send Arcana balance updates to UI

### Performance Considerations

#### Optimization Strategies

- **Efficient Calculations**: Optimized drop amount calculations
- **Event Caching**: Cache expensive scaling calculations
- **Batch Processing**: Process multiple drops together
- **Memory Management**: Efficient state management

#### Performance Targets

- **Drop Calculations**: <0.1ms per drop
- **Scaling Calculations**: <0.05ms per calculation
- **Memory Usage**: <2MB for Arcana system
- **CPU Usage**: <1% for economic processing

## Implementation Plan

### Phase 1: Core Foundation

1. **Create Economic Types** (`packages/sim/src/economy/types.ts`)
   - Define `ArcanaSource`, `ArcanaDrop`, `ArcanaBalance` interfaces
   - Export all economic types
   - Ensure type safety

2. **Implement Arcana Scaling** (`packages/sim/src/economy/arcana-scaling.ts`)
   - Distance-based scaling formulas
   - Ward progression scaling
   - Boss reward multipliers
   - Base drop amounts by enemy type

3. **Create Arcana Drop Manager** (`packages/sim/src/economy/arcana-drop-manager.ts`)
   - Core drop calculation logic
   - Balance management
   - Drop collection and tracking
   - Integration with combat system

### Phase 2: Combat Integration

4. **Combat System Integration**
   - Listen for enemy death events
   - Handle boss encounter events
   - Integrate with distance tracking
   - Ensure deterministic behavior

5. **Performance Optimization**
   - Optimize drop calculations
   - Implement efficient scaling
   - Add performance monitoring
   - Ensure frame rate targets

### Phase 3: Testing & Validation

6. **Unit Tests** (`packages/sim/tests/economy/arcana-drop.test.ts`)
   - Drop calculation tests
   - Scaling formula tests
   - Balance management tests
   - Performance tests

7. **Integration Tests**
   - Combat system integration
   - Distance tracking integration
   - Performance under load
   - Deterministic behavior validation

## Files to Create/Modify

### New Files

- `packages/sim/src/economy/arcana-drop-manager.ts` - Core Arcana drop logic
- `packages/sim/src/economy/arcana-scaling.ts` - Distance-based scaling
- `packages/sim/src/economy/types.ts` - Economic type definitions
- `packages/sim/tests/economy/arcana-drop.test.ts` - Arcana drop tests

### Modified Files

- `packages/sim/src/index.ts` - Export economic types
- `packages/sim/src/combat/targeting.ts` - Integrate with combat system
- `packages/sim/src/core/loop.ts` - Integrate with simulation loop

## Testing Strategy

### Unit Tests

- **Drop Calculations**: Test drop amount calculations
- **Scaling Formulas**: Test distance-based scaling
- **Balance Management**: Test Arcana balance tracking
- **Performance**: Test calculation performance

### Integration Tests

- **Combat Integration**: Test with combat system
- **Distance Integration**: Test with journey progression
- **Performance**: Test under combat load
- **Deterministic**: Test consistent behavior

### E2E Tests

- **Complete Flow**: Test earn → collect → spend flow
- **Performance**: Test under realistic load
- **Balance**: Test economic balance

## Acceptance Criteria

### Functional Requirements

- [ ] Enemies drop Arcana when killed (base amount + scaling)
- [ ] Boss encounters provide significant Arcana rewards
- [ ] Arcana drop rates scale with distance/ward progression
- [ ] Arcana collection integrates with combat system
- [ ] Arcana drops are deterministic and consistent

### Performance Requirements

- [ ] Drop calculations <0.1ms per drop
- [ ] Scaling calculations <0.05ms per calculation
- [ ] Memory usage <2MB for Arcana system
- [ ] CPU usage <1% for economic processing

### Quality Requirements

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Performance benchmarks met
- [ ] Code follows project standards

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests pass (unit, integration, performance)
- [ ] Performance targets achieved
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Integration with combat system verified
- [ ] Story branch merged into epic branch

## Risk Assessment

### High Risk

- **Performance Impact**: Economic calculations affecting combat performance
- **Integration Complexity**: Coordinating with combat system
- **Deterministic Behavior**: Ensuring consistent drops

### Medium Risk

- **Scaling Balance**: Getting distance scaling right
- **State Management**: Proper Arcana balance tracking
- **Event Handling**: Reliable combat event integration

### Mitigation Strategies

- **Performance Testing**: Continuous performance monitoring
- **Extensive Integration Testing**: Thorough testing with combat system
- **Deterministic Testing**: Validate consistent behavior
- **Early Balance Testing**: Test scaling formulas early

## Next Steps

1. **Create Feature Branch**: `feature/p1-e4-s1-arcana-drop-system`
2. **Implement Core Types**: Create economic type definitions
3. **Implement Scaling System**: Create distance-based scaling
4. **Implement Drop Manager**: Create core drop logic
5. **Integrate with Combat**: Connect to combat system
6. **Add Tests**: Create comprehensive test suite
7. **Performance Optimization**: Ensure performance targets
8. **Story Completion**: Test, commit, and merge

---

**Created:** 2025-01-30  
**Status:** Planning Complete  
**Next:** Implementation Phase
