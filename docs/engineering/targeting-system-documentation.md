# Targeting System Documentation

## Overview

The Draconia Chronicles targeting system provides a comprehensive, configurable, and
high-performance
solution
for
dragon
combat
targeting..
It supports multiple targeting strategies, persistence modes, and player customization while
maintaining
optimal
performance
for
200+
enemies.

## Architecture

### Core Components

1. **TargetingSystem** - Main orchestrator

1. **RangeDetection** - Spatial partitioning and range queries

1. **ThreatAssessment** - Multi-factor threat calculation

1. **TargetingStrategies** - 15+ targeting algorithms

1. **PersistenceModes** - Target switching behavior

1. **TargetingConfig** - Player customization

1. **TargetingUnlock** - Progressive strategy unlocks

1. **TargetingPersistence** - State persistence across sessions

### System Flow

````text

Enemy List → Range Detection → Threat Assessment → Strategy Selection → Target Selection →
Persistence
Check
→
Final
Target

```text

## Targeting Strategies

### Available Strategies

1. **closest** - Target nearest enemy

1. **highest_threat** - Target most dangerous enemy

1. **lowest_threat** - Target least dangerous enemy

1. **highest_health** - Target enemy with most HP

1. **lowest_health** - Target enemy with least HP

1. **highest_damage** - Target enemy dealing most damage

1. **lowest_damage** - Target enemy dealing least damage

1. **fastest** - Target fastest moving enemy

1. **slowest** - Target slowest moving enemy

1. **highest_armor** - Target enemy with most armor

1. **lowest_armor** - Target enemy with least armor

1. **highest_shield** - Target enemy with most shield

1. **lowest_shield** - Target enemy with least shield

1. **elemental_weakness** - Target enemy weak to dragon's element

1. **elemental_strength** - Target enemy strong against dragon's element

1. **custom** - Player-defined strategy (future)

### Strategy Implementation

Each strategy implements the `TargetingStrategyHandler` interface:

```typescript

interface TargetingStrategyHandler {
  strategy: TargetingStrategy;
  calculate(enemies: Enemy[], dragon: Dragon): Enemy | null;
  getDescription(): string;
  isUnlocked(): boolean;
}

```text

## Persistence Modes

### Available Modes

1. **keep_target** - Keep current target until it dies (default)

1. **switch_freely** - Switch to better targets when available

1. **switch_aggressive** - Always switch to best available target

1. **manual_only** - Only switch when player manually changes strategy

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

```text

## Threat Assessment

### Threat Factors

1. **Proximity** - Distance to dragon

1. **Health** - Current HP percentage

1. **Damage** - Damage output potential

1. **Speed** - Movement speed

1. **Armor** - Damage reduction

1. **Shield** - Additional protection

1. **Elemental** - Elemental advantage/disadvantage

### Threat Calculation

```typescript

threatLevel = Σ(factorWeight × factorValue)

```text

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

1. Retrieve enemies from relevant cells

1. Filter by actual distance

1. Return sorted results

## Performance Optimization

### Performance Targets

- **Target Selection**: <0.1ms for 200 enemies

- **Range Detection**: <0.05ms for 200 enemies

- **Threat Calculation**: <0.02ms per enemy

- **Memory Usage**: <1MB for 200 enemies

### Optimization Techniques

1. **Spatial Partitioning** - Grid-based enemy lookup

1. **Caching** - Range query result caching

1. **Batch Updates** - Grouped enemy updates

1. **Object Pooling** - Reuse of calculation objects

1. **Early Exit** - Short-circuit evaluation

1. **Squared Distance** - Avoid square root calculations

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

```text

### Configuration Features

- **Strategy Selection** - Choose primary and fallback strategies

- **Persistence Mode** - Control target switching behavior

- **Range Settings** - Configure attack range

- **Threat Weights** - Customize threat calculation

- **Custom Settings** - Extensible configuration

## Unlock System

### Unlock Types

1. **Level-based** - Unlock by dragon level

1. **Achievement-based** - Unlock by completing achievements

1. **Time-based** - Unlock after playing for X time

1. **Story-based** - Unlock by story progress

1. **Custom** - Player-defined unlock conditions

### Unlock Progression

- **Default Strategies**: `closest`, `keep_target`

- **Early Game**: `highest*threat`, `lowest*health`

- **Mid Game**: `elemental*weakness`, `switch*freely`

- **Late Game**: `custom`, `manual_only`

## State Persistence

### Persisted Data

1. **Targeting Configuration** - Player preferences

1. **Targeting State** - Current target and history

1. **Unlock Progress** - Strategy unlock status

1. **Performance Metrics** - Usage statistics

### Storage Options

1. **LocalStorage** - Browser storage (default)

1. **IndexedDB** - Larger data storage

1. **Custom Storage** - Pluggable storage interface

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

1. **Integration Tests** - System integration testing

1. **Performance Tests** - Performance benchmark testing

1. **Edge Case Tests** - Boundary condition testing

### Test Scenarios

1. **Basic Targeting** - Closest enemy selection

1. **Strategy Switching** - Strategy change behavior

1. **Persistence Modes** - Target switching behavior

1. **Range Detection** - Spatial partitioning accuracy

1. **Threat Assessment** - Threat calculation accuracy

1. **Performance** - Large enemy count handling

## Future Enhancements

### Planned Features

1. **UI Interface** - Player strategy selection UI

1. **Strategy Presets** - Pre-configured strategy sets

1. **Analytics Dashboard** - Performance and usage metrics

1. **Custom Strategies** - Player-defined targeting logic

1. **AI Learning** - Adaptive strategy selection

1. **Multi-target** - Simultaneous multiple targets

### Extension Points

1. **Custom Strategy Handler** - Plugin system for new strategies

1. **Custom Persistence Handler** - Plugin system for new modes

1. **Custom Threat Factor** - Plugin system for new factors

1. **Custom Storage Backend** - Plugin system for storage

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

```javascript

#### RangeDetection

```typescript

class DefaultRangeDetection implements RangeDetection {
  constructor(maxRange: number, gridSize: number);
  getTargetsInRange(enemies: Enemy[], dragon: Dragon): Enemy[];
  calculateDistance(dragon: Dragon, enemy: Enemy): number;
  isWithinRange(dragon: Dragon, enemy: Enemy): boolean;
  getOptimalRange(dragon: Dragon): number;
}

```javascript

#### ThreatAssessment

```typescript

class ThreatAssessmentSystem {
  constructor();
  calculateThreatLevel(enemy: Enemy, dragon: Dragon, strategy: TargetingStrategy): number;
  getThreatFactors(): ThreatFactor[];
  setThreatWeights(weights: Record<string, number>): void;
}

```text

### Utility Functions

#### createTargetingSystem

```typescript

function createTargetingSystem(config: TargetingConfig): TargetingSystem;

```javascript

#### createRangeDetection

```typescript

function createRangeDetection(maxRange?: number, gridSize?: number): RangeDetection;

```javascript

#### createThreatAssessment

```typescript

function createThreatAssessment(): ThreatAssessmentSystem;

```text

## Performance Monitoring

### Metrics Collected

1. **Target Selection Time** - Time to select target

1. **Range Detection Time** - Time for range queries

1. **Threat Calculation Time** - Time for threat assessment

1. **Memory Usage** - Memory consumption

1. **Cache Hit Rate** - Cache effectiveness

1. **Strategy Usage** - Strategy selection frequency

### Monitoring Tools

1. **Performance Dashboard** - Real-time metrics

1. **Historical Analysis** - Trend analysis

1. **Alert System** - Performance degradation alerts

1. **Optimization Suggestions** - Automated recommendations

## Troubleshooting

### Common Issues

1. **Performance Degradation** - Check spatial grid size

1. **Memory Leaks** - Verify object cleanup

1. **Incorrect Targeting** - Check threat weights

1. **State Persistence** - Verify storage permissions

### Debug Tools

1. **Targeting Debugger** - Visual target selection

1. **Performance Profiler** - Detailed timing analysis

1. **State Inspector** - Current state visualization

1. **Log Analyzer** - Event log analysis

## Best Practices

### Development

1. **Use TypeScript** - Strict type checking

1. **Write Tests** - Comprehensive test coverage

1. **Profile Performance** - Regular performance testing

1. **Document Changes** - Update documentation

### Configuration

1. **Start Simple** - Begin with basic strategies

1. **Test Thoroughly** - Validate all configurations

1. **Monitor Performance** - Watch for degradation

1. **Backup Settings** - Save configuration backups

### Integration

1. **Loose Coupling** - Minimize system dependencies

1. **Clear Interfaces** - Well-defined API contracts

1. **Error Handling** - Graceful failure handling

1. **Logging** - Comprehensive event logging

## Conclusion

The Draconia Chronicles targeting system provides a robust, flexible, and high-performance solution
for
dragon
combat
targeting..
It supports extensive customization while maintaining optimal performance and provides a solid
foundation
for
future
enhancements.

The system is designed with extensibility in mind, allowing for easy addition of new strategies,
persistence
modes,
and
threat
factors..
The comprehensive testing and monitoring capabilities ensure reliable operation and provide insights
for
continuous
improvement.

````
