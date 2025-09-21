# Epic 1.2: Enemy Spawning & AI Framework - Implementation Plan

**Epic ID**: P1-E2  
**Phase**: Phase 1 - Shooter-Idle Core  
**Priority**: Critical  
**Estimated Effort**: 3-4 weeks  
**Dependencies**: P1-E1 (Core Determinism Engine) ✅ Complete

## Epic Overview

Implement the enemy spawning system and basic AI framework that forms the core combat foundation. This epic establishes the enemy lifecycle from spawn to death, including movement patterns, combat behaviors, and scaling systems.

## Stories Breakdown

### Story P1-E2-S1: Implement Enemy Spawning System

**Priority**: Critical  
**Effort**: 4 story points  
**Dependencies**: P1-E1-S1 (Core Determinism Engine)

#### Acceptance Criteria

- [ ] Enemies spawn at correct intervals based on distance progression
- [ ] Spawn rate scales appropriately with distance/ward progression
- [ ] Performance remains within limits (<200 enemies active)
- [ ] Enemy types vary based on current ward/land
- [ ] Spawn system integrates with deterministic simulation

#### Technical Implementation

- **Spawn Manager**: Central system managing enemy spawn timing and positioning
- **Distance Scaling**: Spawn rate increases with distance progression
- **Enemy Pools**: Object pooling for performance optimization
- **Ward Integration**: Different enemy types per ward/land
- **Deterministic Spawning**: Use RNG from core engine for consistent spawns

#### Files to Create/Modify

- `packages/sim/src/enemies/spawn-manager.ts` - Core spawning logic
- `packages/sim/src/enemies/enemy-pool.ts` - Object pooling system
- `packages/sim/src/enemies/types.ts` - Enemy type definitions
- `packages/sim/src/enemies/spawn-config.ts` - Spawn rate and scaling config

### Story P1-E2-S2: Develop Basic AI (Approach/Attack)

**Priority**: High  
**Effort**: 6 story points  
**Dependencies**: P1-E2-S1 (Enemy Spawning)

#### Acceptance Criteria

- [ ] Enemies approach the player when spawned
- [ ] Enemies stop at appropriate attack range
- [ ] Enemies attack when in range
- [ ] Basic state machine (approach → stop → attack)
- [ ] Two enemy families with different behaviors

#### Technical Implementation

- **AI State Machine**: Approach, Stop, Attack, Death states
- **Movement System**: Pathfinding and collision avoidance
- **Attack System**: Range detection and attack timing
- **Enemy Families**: Different AI patterns per enemy type
- **Performance Optimization**: Efficient state updates

#### Files to Create/Modify

- `packages/sim/src/enemies/ai/state-machine.ts` - AI state management
- `packages/sim/src/enemies/ai/movement.ts` - Movement and pathfinding
- `packages/sim/src/enemies/ai/combat.ts` - Attack and range detection
- `packages/sim/src/enemies/families/` - Different enemy behavior patterns

## Technical Architecture

### Core Components

#### 1. Spawn Manager

```typescript
interface SpawnManager {
  spawnRate: number;
  currentDistance: number;
  activeEnemies: Enemy[];
  spawnEnemy(type: EnemyType, position: Vector2): Enemy;
  updateSpawnRate(distance: number): void;
  cleanupDeadEnemies(): void;
}
```

#### 2. Enemy AI State Machine

```typescript
enum EnemyState {
  APPROACH = 'approach',
  STOP = 'stop',
  ATTACK = 'attack',
  DEATH = 'death',
}

interface EnemyAI {
  state: EnemyState;
  target: Vector2;
  attackRange: number;
  update(deltaTime: number): void;
  transitionTo(newState: EnemyState): void;
}
```

#### 3. Enemy Families

```typescript
interface EnemyFamily {
  id: string;
  movementSpeed: number;
  attackRange: number;
  attackDamage: number;
  health: number;
  behaviors: AIBehavior[];
}
```

### Integration Points

#### Core Engine Integration

- **RNG System**: Use deterministic RNG for spawn timing and AI decisions
- **Clock System**: Integrate with fixed timestep for consistent AI updates
- **Protocol System**: Send enemy state updates to UI via simToUi messages

#### UI Integration

- **Enemy Rendering**: Send enemy position and state data to PixiJS renderer
- **Health Display**: Enemy health bars and damage indicators
- **Performance Monitoring**: Track enemy count and AI performance

## Performance Considerations

### Optimization Strategies

- **Object Pooling**: Reuse enemy objects to minimize garbage collection
- **Spatial Partitioning**: Efficient collision detection for large enemy counts
- **State Culling**: Skip AI updates for enemies far from player
- **Batch Updates**: Process multiple enemies in single update cycle

### Performance Targets

- **Maximum Enemies**: 200 active enemies
- **AI Update Frequency**: 60 FPS for close enemies, 30 FPS for distant
- **Memory Usage**: <50MB for enemy systems
- **CPU Usage**: <10% for AI processing

## Testing Strategy

### Unit Tests

- Spawn manager rate calculations
- AI state transitions
- Enemy movement calculations
- Performance benchmarks

### Integration Tests

- Spawn system with distance progression
- AI behavior with player interaction
- Performance under load (200 enemies)
- Deterministic behavior verification

### E2E Tests

- Complete enemy lifecycle (spawn → approach → attack → death)
- Multiple enemy families working together
- Performance regression testing

## Risk Assessment

### High Risk

- **Performance Degradation**: Large enemy counts could impact frame rate
- **AI Complexity**: Complex state machines might be difficult to debug

### Medium Risk

- **Integration Issues**: Coordinating spawn system with distance progression
- **Balance Challenges**: Getting enemy difficulty progression right

### Mitigation Strategies

- Early performance testing with target enemy counts
- Simple AI states initially, expand complexity gradually
- Extensive integration testing with core systems
- Iterative balance testing with gameplay metrics

## Success Criteria

### Functional Requirements

- [ ] Enemies spawn correctly based on distance
- [ ] AI behaviors work as specified (approach, stop, attack)
- [ ] Two enemy families implemented with different patterns
- [ ] Performance targets met (<200 enemies, 60 FPS)

### Quality Requirements

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Performance benchmarks met
- [ ] Code follows project standards (TypeScript strict, ESLint)

### Deliverables

- [ ] Complete enemy spawning system
- [ ] Basic AI framework with state machine
- [ ] Two enemy families with distinct behaviors
- [ ] Performance optimization and monitoring
- [ ] Comprehensive test coverage
- [ ] Documentation and code comments

## Next Steps

1. **Implement Spawn Manager** (P1-E2-S1)
   - Create spawn timing and rate calculations
   - Implement object pooling system
   - Add distance-based scaling

2. **Develop AI State Machine** (P1-E2-S2)
   - Create basic state machine framework
   - Implement movement and attack behaviors
   - Add two enemy families

3. **Integration & Testing**
   - Connect with core engine systems
   - Add UI rendering integration
   - Performance testing and optimization

4. **Documentation & Review**
   - Update technical documentation
   - Code review and cleanup
   - Prepare for next epic (P1-E3: Dragon Combat)

---

**Created**: 2025-01-21  
**Status**: Planning Complete  
**Next**: Implementation Phase
