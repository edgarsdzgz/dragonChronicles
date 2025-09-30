# Targeting System Documentation

## Overview

The Draconia Chronicles targeting system provides a comprehensive, configurable, and high-performance solution for dragon combat targeting. It supports multiple targeting strategies, persistence modes, and player customization while maintaining optimal performance for 200+ enemies.

## Architecture

### Core Components

1. **TargetingSystem** - Main orchestrator
2. **RangeDetection** - Spatial partitioning and range queries
3. **ThreatAssessment** - Multi-factor threat calculation
4. **TargetingStrategies** - 15+ targeting algorithms
5. **PersistenceModes** - Target switching behavior
6. **TargetingConfig** - Player customization
7. **TargetingUnlock** - Progressive strategy unlocks
8. **TargetingPersistence** - State persistence across sessions

### System Flow

```
Enemy List → Range Detection → Threat Assessment → Strategy Selection → Target Selection → Persistence Check → Final Target
```

## Targeting Strategies

### Available Strategies

1. **closest** - Target nearest enemy
2. **highest_threat** - Target most dangerous enemy
3. **lowest_threat** - Target least dangerous enemy
4. **highest_health** - Target enemy with most HP
5. **lowest_health** - Target enemy with least HP
6. **highest_damage** - Target enemy dealing most damage
7. **lowest_damage** - Target enemy dealing least damage
8. **fastest** - Target fastest moving enemy
9. **slowest** - Target slowest moving enemy
10. **highest_armor** - Target enemy with most armor
11. **lowest_armor** - Target enemy with least armor
12. **highest_shield** - Target enemy with most shield
13. **lowest_shield** - Target enemy with least shield
14. **elemental_weakness** - Target enemy weak to dragon's element
15. **elemental_strength** - Target enemy strong against dragon's element
16. **custom** - Player-defined strategy (future)

### Strategy Implementation

Each strategy implements the `TargetingStrategyHandler` interface:

```typescript
interface TargetingStrategyHandler {
  strategy: TargetingStrategy;
  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null;
  getDescription(): string;
  isUnlocked(): boolean;
}
```

## Persistence Modes

### Available Modes

1. **keep_target** - Keep current target until it dies (default)
2. **switch_freely** - Switch to better targets when available
3. **switch_aggressive** - Always switch to best available target
4. **manual_only** - Only switch when player manually changes strategy

### Mode Implementation

Each mode implements the `TargetPersistenceHandler` interface:

```typescript
interface TargetPersistenceHandler {
  mode: TargetPersistenceMode;
  shouldSwitchTarget(
    currentTarget: Enemy | null,
    newTarget: Enemy | null,
    state: TargetingState,
    config: TargetingConfig,
  ): boolean;
  getDescription(): string;
  isUnlocked(): boolean;
}
```

## Threat Assessment

### Threat Factors

1. **Proximity** - Distance to dragon
2. **Health** - Current HP percentage
3. **Damage** - Damage output potential
4. **Speed** - Movement speed
5. **Armor** - Damage reduction
6. **Shield** - Additional protection
7. **Elemental** - Elemental advantage/disadvantage

### Threat Calculation

```typescript
threatLevel = Σ(factorWeight × factorValue)
```

Where:

- `factorWeight` is configurable per strategy
- `factorValue` is normalized (0-1) per factor
- Total threat level is used for strategy decisions

## Range Detection

### Spatial Partitioning

The system uses a grid-based spatial partitioning approach:

- **Grid Size**: 100x100 units (configurable)
- **Efficiency**: O(1) average case for range queries
- **Memory**: O(n) where n is number of enemies
- **Update**: O(1) per enemy position change

### Range Query Process

1. Calculate grid cells within range
2. Retrieve enemies from relevant cells
3. Filter by actual distance
4. Return sorted results

## Performance Optimization

### Performance Targets

- **Target Selection**: <0.1ms for 200 enemies
- **Range Detection**: <0.05ms for 200 enemies
- **Threat Calculation**: <0.02ms per enemy
- **Memory Usage**: <1MB for 200 enemies

### Optimization Techniques

1. **Spatial Partitioning** - Grid-based enemy lookup
2. **Caching** - Range query result caching
3. **Batch Updates** - Grouped enemy updates
4. **Object Pooling** - Reuse of calculation objects
5. **Early Exit** - Short-circuit evaluation
6. **Squared Distance** - Avoid square root calculations

## Configuration System

### Player Customization

```typescript
interface TargetingConfig {
  primaryStrategy: TargetingStrategy;
  fallbackStrategy: TargetingStrategy;
  persistenceMode: TargetPersistenceMode;
  range: number;
  targetLockDuration: number;
  threatWeights: Record<string, number>;
  customSettings: Record<string, any>;
}
```

### Configuration Features

- **Strategy Selection** - Choose primary and fallback strategies
- **Persistence Mode** - Control target switching behavior
- **Range Settings** - Configure attack range
- **Threat Weights** - Customize threat calculation
- **Custom Settings** - Extensible configuration

## Unlock System

### Unlock Types

1. **Level-based** - Unlock by dragon level
2. **Achievement-based** - Unlock by completing achievements
3. **Time-based** - Unlock after playing for X time
4. **Story-based** - Unlock by story progress
5. **Custom** - Player-defined unlock conditions

### Unlock Progression

- **Default Strategies**: `closest`, `keep_target`
- **Early Game**: `highest_threat`, `lowest_health`
- **Mid Game**: `elemental_weakness`, `switch_freely`
- **Late Game**: `custom`, `manual_only`

## State Persistence

### Persisted Data

1. **Targeting Configuration** - Player preferences
2. **Targeting State** - Current target and history
3. **Unlock Progress** - Strategy unlock status
4. **Performance Metrics** - Usage statistics

### Storage Options

1. **LocalStorage** - Browser storage (default)
2. **IndexedDB** - Larger data storage
3. **Custom Storage** - Pluggable storage interface

## Integration Points

### Enemy AI System

- **Target Selection** - Provides current target
- **Target Updates** - Receives target changes
- **Range Queries** - Uses range detection

### Dragon Health System

- **Elemental Types** - For elemental strategies
- **Health Status** - For health-based strategies
- **Status Effects** - For threat calculation

### Combat System

- **Damage Calculation** - For damage-based strategies
- **Armor/Shield** - For defensive strategies
- **Speed/Movement** - For speed-based strategies

## Testing Strategy

### Test Coverage

1. **Unit Tests** - Individual component testing
2. **Integration Tests** - System integration testing
3. **Performance Tests** - Performance benchmark testing
4. **Edge Case Tests** - Boundary condition testing

### Test Scenarios

1. **Basic Targeting** - Closest enemy selection
2. **Strategy Switching** - Strategy change behavior
3. **Persistence Modes** - Target switching behavior
4. **Range Detection** - Spatial partitioning accuracy
5. **Threat Assessment** - Threat calculation accuracy
6. **Performance** - Large enemy count handling

## Future Enhancements

### Planned Features

1. **UI Interface** - Player strategy selection UI
2. **Strategy Presets** - Pre-configured strategy sets
3. **Analytics Dashboard** - Performance and usage metrics
4. **Custom Strategies** - Player-defined targeting logic
5. **AI Learning** - Adaptive strategy selection
6. **Multi-target** - Simultaneous multiple targets

### Extension Points

1. **Custom Strategy Handler** - Plugin system for new strategies
2. **Custom Persistence Handler** - Plugin system for new modes
3. **Custom Threat Factor** - Plugin system for new factors
4. **Custom Storage Backend** - Plugin system for storage

## API Reference

### Core Classes

#### TargetingSystem

```typescript
class TargetingSystem {
  constructor(config: TargetingConfig, state: TargetingState);
  findTarget(enemies: Enemy[]): Enemy | null;
  updateTarget(enemies: Enemy[]): void;
  switchStrategy(strategy: TargetingStrategy): void;
  setPersistenceMode(mode: TargetPersistenceMode): void;
  getPerformanceMetrics(): TargetingMetrics;
}
```

#### RangeDetection

```typescript
class DefaultRangeDetection implements RangeDetection {
  constructor(maxRange: number, gridSize: number);
  getTargetsInRange(enemies: Enemy[], dragon: Dragon): Enemy[];
  calculateDistance(dragon: Dragon, enemy: Enemy): number;
  isWithinRange(dragon: Dragon, enemy: Enemy): boolean;
  getOptimalRange(dragon: Dragon): number;
}
```

#### ThreatAssessment

```typescript
class ThreatAssessmentSystem {
  constructor();
  calculateThreatLevel(enemy: Enemy, dragon: Dragon, strategy: TargetingStrategy): number;
  getThreatFactors(): ThreatFactor[];
  setThreatWeights(weights: Record<string, number>): void;
}
```

### Utility Functions

#### createTargetingSystem

```typescript
function createTargetingSystem(config: TargetingConfig): TargetingSystem;
```

#### createRangeDetection

```typescript
function createRangeDetection(maxRange?: number, gridSize?: number): RangeDetection;
```

#### createThreatAssessment

```typescript
function createThreatAssessment(): ThreatAssessmentSystem;
```

## Performance Monitoring

### Metrics Collected

1. **Target Selection Time** - Time to select target
2. **Range Detection Time** - Time for range queries
3. **Threat Calculation Time** - Time for threat assessment
4. **Memory Usage** - Memory consumption
5. **Cache Hit Rate** - Cache effectiveness
6. **Strategy Usage** - Strategy selection frequency

### Monitoring Tools

1. **Performance Dashboard** - Real-time metrics
2. **Historical Analysis** - Trend analysis
3. **Alert System** - Performance degradation alerts
4. **Optimization Suggestions** - Automated recommendations

## Troubleshooting

### Common Issues

1. **Performance Degradation** - Check spatial grid size
2. **Memory Leaks** - Verify object cleanup
3. **Incorrect Targeting** - Check threat weights
4. **State Persistence** - Verify storage permissions

### Debug Tools

1. **Targeting Debugger** - Visual target selection
2. **Performance Profiler** - Detailed timing analysis
3. **State Inspector** - Current state visualization
4. **Log Analyzer** - Event log analysis

## Best Practices

### Development

1. **Use TypeScript** - Strict type checking
2. **Write Tests** - Comprehensive test coverage
3. **Profile Performance** - Regular performance testing
4. **Document Changes** - Update documentation

### Configuration

1. **Start Simple** - Begin with basic strategies
2. **Test Thoroughly** - Validate all configurations
3. **Monitor Performance** - Watch for degradation
4. **Backup Settings** - Save configuration backups

### Integration

1. **Loose Coupling** - Minimize system dependencies
2. **Clear Interfaces** - Well-defined API contracts
3. **Error Handling** - Graceful failure handling
4. **Logging** - Comprehensive event logging

## Conclusion

The Draconia Chronicles targeting system provides a robust, flexible, and high-performance solution for dragon combat targeting. It supports extensive customization while maintaining optimal performance and provides a solid foundation for future enhancements.

The system is designed with extensibility in mind, allowing for easy addition of new strategies, persistence modes, and threat factors. The comprehensive testing and monitoring capabilities ensure reliable operation and provide insights for continuous improvement.
