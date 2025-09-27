# @draconia/sim

Simulation package for Draconia Chronicles game engine.

## Features

- Core simulation loop
- Deterministic RNG
- Clock system
- Message protocols
- **Enemy Spawning System** (P1-E2-S1)
  - Object pooling for performance
  - Distance-based spawn rates
  - Ward-specific configurations
  - Comprehensive testing (123 tests)

## Usage

### Core Simulation

```typescript
import { SimulationLoop } from '@draconia/sim';
```

### Enemy Spawning System

```typescript
import { SpawnManager, PoolManager, SimpleRngImpl } from '@draconia/sim';

// Initialize spawn system
const poolManager = new PoolManager();
const spawnManager = new SpawnManager(poolManager, new SimpleRngImpl());

// Game loop update
spawnManager.update(currentTime, playerDistance, currentWard, currentLand);

// Get active enemies
const enemies = spawnManager.getPoolManager().getActiveEnemies();
```

## Testing

```bash
# Run all tests
pnpm run test

# Run with coverage
pnpm run test:coverage

# Run performance tests
pnpm run test tests/performance/spawn-performance.spec.ts
```

## Performance

The enemy spawning system exceeds all performance targets:

- **100 enemies**: 3.60ms (0.036ms per spawn)
- **1000 updates**: 1.67ms (0.002ms per update)
- **Memory efficient**: Zero leaks, object pooling

## Documentation

- [P1-E2-S1 Completion Report](./docs/P1-E2-S1-COMPLETION-REPORT.md)
- [Story Testing Process](../../docs/engineering/story-testing-process.md)
