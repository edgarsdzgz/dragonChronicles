# P1-E2-S1: Enemy Spawning System - Implementation Plan

**Story ID**: P1-E2-S1
**Epic**: P1-E2 (Enemy Spawning & AI Framework)
**Priority**: Critical
**Effort**: 4 story points
**Dependencies**: P1-E1-S1 (Core Determinism Engine) ✅ Complete

## Story Overview

Implement the enemy spawning system that creates enemies based on distance progression, with proper
scaling,
object
pooling,
and
integration
with
the
core
determinism
engine.

## Acceptance Criteria

- [ ] Enemies spawn at correct intervals based on distance progression

- [ ] Spawn rate scales appropriately with distance/ward progression

- [ ] Performance remains within limits (<200 enemies active)

- [ ] Enemy types vary based on current ward/land

- [ ] Spawn system integrates with deterministic simulation

## Technical Implementation Plan

### Phase 1: Core Enemy Types and Interfaces

#### 1.1 Enemy Entity System

**Files**: `packages/sim/src/enemies/types.ts`

- Extend the existing `Enemy` type from `@draconia/engine`

- Add position, state, and spawn-specific properties

- Define enemy spawn configuration types

#### 1.2 Spawn Configuration

**Files**: `packages/sim/src/enemies/spawn-config.ts`

- Define spawn rates and scaling formulas

- Create ward-based enemy type mappings

- Implement distance-based spawn rate calculations

### Phase 2: Object Pooling System

#### 2.1 Enemy Pool Manager

**Files**: `packages/sim/src/enemies/enemy-pool.ts`

- Implement object pooling for performance optimization

- Create pool allocation/deallocation methods

- Add pool statistics and monitoring

#### 2.2 Pool Integration

- Integrate with existing simulation state

- Ensure deterministic behavior with object reuse

- Add pool cleanup and garbage collection prevention

### Phase 3: Spawn Manager Core

#### 3.1 Spawn Manager Implementation

**Files**: `packages/sim/src/enemies/spawn-manager.ts`

- Core spawning logic with distance-based timing

- Integration with RNG system from core engine

- Spawn position calculation and validation

#### 3.2 Spawn Integration

- Connect spawn manager to simulation state

- Update existing `step()` function to include spawning

- Ensure deterministic spawn timing

### Phase 4: Simulation Integration

#### 4.1 State Management Updates

**Files**: `packages/sim/src/core/state.ts`

- Extend `SimState` to include enemy array

- Update `step()` function with spawn manager integration

- Add enemy lifecycle management

#### 4.2 Performance Optimization

- Implement spatial partitioning for efficient updates

- Add enemy culling for distant enemies

- Optimize spawn calculations for 60 FPS target

## Detailed Technical Specifications

### Enemy Entity Structure

````typescript

// Extended from @draconia/engine types
export type SpawnedEnemy = Enemy & {
  // Position and movement
  x: number;
  y: number;
  vx: number;
  vy: number;

  // Spawn metadata
  spawnTime: number;
  spawnDistance: number;
  wardId: WardId;
  landId: LandId;

  // State management
  isActive: boolean;
  poolIndex: number;
};

```javascript

### Spawn Manager Interface

```typescript

export interface SpawnManager {
  // Core spawning
  spawnRate: number;
  currentDistance: number;
  activeEnemies: SpawnedEnemy[];

  // Spawn operations
  spawnEnemy(type: Family, position: Vector2, wardId: WardId, landId: LandId): SpawnedEnemy;
  updateSpawnRate(distance: number): void;
  cleanupDeadEnemies(): void;

  // Performance monitoring
  getPoolStats(): PoolStats;
  getActiveEnemyCount(): number;
}

```javascript

### Spawn Configuration

```typescript

export interface SpawnConfig {
  // Base spawn rates (enemies per second)
  baseRate: number;
  distanceMultiplier: number;
  maxSpawnRate: number;

  // Ward-based configurations
  wardConfigs: Map<WardId, WardSpawnConfig>;

  // Enemy type distributions
  enemyTypeWeights: Map<Family, number>;
}

export interface WardSpawnConfig {
  wardId: WardId;
  spawnRateMultiplier: number;
  availableEnemyTypes: Family[];
  enemyTypeWeights: Map<Family, number>;
}

```javascript

### Object Pool Implementation

```typescript

export class EnemyPool {
  private pool: SpawnedEnemy[];
  private activeCount: number;
  private maxSize: number;

  // Pool management
  allocate(): SpawnedEnemy;
  deallocate(enemy: SpawnedEnemy): void;

  // Statistics
  getStats(): PoolStats;
  isFull(): boolean;
}

```javascript

## Integration Points

### Core Engine Integration

#### RNG System

- Use `@draconia/engine` RNG streams for deterministic spawn timing

- Create dedicated spawn RNG stream: `spawns` stream

- Ensure reproducible spawn patterns across sessions

#### Protocol System

- Extend `SimToUi` messages to include enemy spawn events

- Add enemy state updates to tick messages

- Implement enemy death notifications

#### Clock System

- Integrate with fixed timestep for consistent spawn timing

- Use accumulator for precise spawn timing calculations

- Ensure spawn events align with simulation ticks

### Simulation State Updates

#### Extended SimState

```typescript

export type SimState = {
  // Existing fields
  enemies: number;
  proj: number;
  seed: bigint;
  time: number;

  // New enemy spawning fields
  spawnedEnemies: SpawnedEnemy[];
  currentDistance: number;
  currentWard: WardId;
  currentLand: LandId;
  spawnManager: SpawnManager;
};

```text

#### Updated Step Function

- Integrate spawn manager updates

- Add enemy lifecycle management

- Include spawn timing calculations

- Maintain deterministic behavior

## Performance Considerations

### Optimization Strategies

#### Object Pooling

- Pre-allocate enemy objects to minimize garbage collection

- Reuse enemy instances for performance

- Implement pool size monitoring and auto-scaling

#### Spatial Optimization

- Only update enemies within reasonable distance of player

- Implement enemy culling for distant enemies

- Use spatial partitioning for collision detection (future)

#### Calculation Optimization

- Cache spawn rate calculations

- Batch enemy updates where possible

- Minimize object allocations during spawn operations

### Performance Targets

- **Maximum Enemies**: 200 active enemies

- **Spawn Performance**: <1ms per spawn operation

- **Memory Usage**: <10MB for spawn system

- **Update Performance**: <5ms for all enemy updates per frame

## Testing Strategy

### Unit Tests

#### Spawn Manager Tests

- Spawn rate calculations with various distances

- Enemy type selection based on ward configuration

- Spawn timing accuracy and deterministic behavior

#### Object Pool Tests

- Pool allocation/deallocation correctness

- Pool statistics accuracy

- Memory usage validation

#### Configuration Tests

- Ward configuration loading and validation

- Distance scaling formula verification

- Enemy type weight distribution testing

### Integration Tests

#### Core Engine Integration (2)

- RNG stream integration and deterministic behavior

- Clock system integration and timing accuracy

- Protocol system integration and message flow

#### Performance Tests

- Spawn performance with 200 enemies

- Memory usage monitoring

- Frame rate impact assessment

### E2E Tests

#### Complete Spawn Lifecycle

- Enemy spawn → active → death → pool cleanup

- Multiple enemy types spawning correctly

- Distance progression affecting spawn rates

## Implementation Timeline

### Day 1: Core Types and Configuration

- [ ] Create enemy types and interfaces

- [ ] Implement spawn configuration system

- [ ] Set up basic ward configurations

### Day 2: Object Pooling System

- [ ] Implement enemy pool manager

- [ ] Create pool allocation/deallocation logic

- [ ] Add pool statistics and monitoring

### Day 3: Spawn Manager Core

- [ ] Implement spawn manager logic

- [ ] Add distance-based spawn rate calculations

- [ ] Integrate with RNG system

### Day 4: Simulation Integration

- [ ] Update simulation state management

- [ ] Integrate spawn manager with step function

- [ ] Add performance optimizations

### Day 5: Testing and Validation

- [ ] Write comprehensive unit tests

- [ ] Run integration tests

- [ ] Performance testing and optimization

- [ ] Documentation and code review

## Risk Assessment

### High Risk

- **Performance Impact**: Large enemy counts could affect frame rate

- **Determinism**: Spawn timing must be perfectly deterministic

### Medium Risk

- **Memory Usage**: Object pooling could consume excessive memory

- **Integration Complexity**: Coordinating with existing simulation systems

### Mitigation Strategies

- Early performance testing with target enemy counts

- Extensive deterministic behavior testing

- Memory usage monitoring and optimization

- Incremental integration with existing systems

## Definition of Done

### Functional Requirements

- [ ] Enemies spawn at correct intervals based on distance

- [ ] Spawn rate scales with distance progression

- [ ] Performance targets met (<200 enemies, <1ms spawn time)

- [ ] Deterministic behavior verified

- [ ] Integration with core engine working

### Quality Requirements

- [ ] All unit tests pass

- [ ] Integration tests pass

- [ ] Performance benchmarks met

- [ ] Code follows project standards (TypeScript strict, ESLint)

- [ ] Documentation complete

### Deliverables

- [ ] Complete enemy spawning system

- [ ] Object pooling implementation

- [ ] Spawn configuration system

- [ ] Integration with core simulation

- [ ] Comprehensive test coverage

- [ ] Performance monitoring tools

---

**Created**: 2025-01-21
**Status**: Planning Complete
**Next**: Implementation Phase - Day 1 (Core Types and Configuration)
````
