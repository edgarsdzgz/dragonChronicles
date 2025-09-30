# P1-E4: Arcana Economy & Enchant System with Soul Forging - Epic Plan

**Epic ID:** P1-E4  
**Phase:** Phase 1 - Shooter-Idle Core  
**Priority:** Critical  
**Estimated Effort:** 2-3 weeks  
**Dependencies:** P1-E3 (Dragon Combat System) ✅ Complete

## Epic Overview

Implement the core Arcana economy system and dual-layer enchant system with **Soul Forging** that forms the progression foundation. This epic establishes the economic loop where players earn Arcana from combat, spend it on temporary enchants during journeys, and unlock permanent starting levels with Soul Power. The **Soul Forging** system allows players to extend their level caps through temporary (Arcana) or permanent (Soul Power) soul forging.

## Epic Objectives

### Primary Goals

1. **Arcana Economy**: Complete economic loop with Arcana drops and spending
2. **Dual-Layer Enchants**: Temporary (Arcana) and permanent (Soul Power) enchant systems
3. **Soul Forging System**: Unified cap extension system for both currencies
4. **Economic UI**: Complete user interface for economic interactions
5. **Balance & Telemetry**: Economic balance validation and analytics

### Success Criteria

- [ ] Complete Arcana economy system with drops and scaling
- [ ] Dual-layer enchant system (temporary + permanent)
- [ ] Soul Forging system (temporary + permanent)
- [ ] Economic UI components with Soul Forging interface
- [ ] Comprehensive test coverage (192+ tests passing)
- [ ] Economic balance validation
- [ ] Performance targets met (<1ms per frame)

## Stories Breakdown

### Story P1-E4-S1: Arcana Drop System

**Priority:** Critical | **Effort:** 4 story points | **Dependencies:** P1-E3-S6 ✅ Complete

#### Objectives

- Implement Arcana drop system from enemy kills
- Add boss encounter Arcana rewards
- Create distance-based Arcana scaling
- Integrate with combat system
- Ensure deterministic drops

#### Technical Implementation

- **Arcana Drop Manager**: Central system managing drops and collection
- **Scaling System**: Distance-based Arcana drop scaling
- **Boss Rewards**: Special Arcana rewards for boss encounters
- **Collection Integration**: Seamless integration with combat system
- **Deterministic Drops**: Use RNG from core engine for consistent drops

#### Files to Create/Modify

- `packages/sim/src/economy/arcana-drop-manager.ts` - Core Arcana drop logic
- `packages/sim/src/economy/arcana-scaling.ts` - Distance-based scaling
- `packages/sim/src/economy/types.ts` - Arcana economy type definitions
- `packages/sim/tests/economy/arcana-drop.test.ts` - Arcana drop tests

#### Acceptance Criteria

- [ ] Enemies drop Arcana when killed (base amount + scaling)
- [ ] Boss encounters provide significant Arcana rewards
- [ ] Arcana drop rates scale with distance/ward progression
- [ ] Arcana collection integrates with combat system
- [ ] Arcana drops are deterministic and consistent

### Story P1-E4-S2: Basic Enchant System

**Priority:** Critical | **Effort:** 5 story points | **Dependencies:** P1-E4-S1

#### Objectives

- Implement Firepower and Scales enchant systems
- Create geometric cost progression (×1.12 per level)
- Integrate with Soul Forging system for level caps
- Add temporary enchant state management
- Ensure cost validation and Arcana spending

#### Technical Implementation

- **Enchant Manager**: Core system managing enchant levels and costs
- **Geometric Cost Calculation**: `cost(l) = base * 1.12^l` formula
- **Soul Forging Integration**: Level caps based on soul forging extensions
- **State Management**: Temporary enchant state during journeys
- **Cost Validation**: Ensure sufficient Arcana for purchases

#### Files to Create/Modify

- `packages/sim/src/economy/enchant-manager.ts` - Core enchant system
- `packages/sim/src/economy/enchant-costs.ts` - Cost calculation logic
- `packages/sim/src/economy/enchant-types.ts` - Enchant type definitions
- `packages/sim/tests/economy/enchant-system.test.ts` - Enchant system tests

#### Acceptance Criteria

- [ ] Firepower enchant system (damage multiplier, geometric costs)
- [ ] Scales enchant system (health multiplier, geometric costs)
- [ ] Geometric cost progression (×1.12 per level)
- [ ] Level caps based on soul forging extensions
- [ ] Temporary enchant state management
- [ ] Integration with Soul Forging system

### Story P1-E4-S3: Soul Forging System

**Priority:** High | **Effort:** 4 story points | **Dependencies:** P1-E4-S2

#### Objectives

- Implement temporary Soul Forging (Arcana-based)
- Implement permanent Soul Forging (Soul Power-based)
- Create Soul Forging cost calculations
- Add level cap extension logic (+60 levels per forging)
- Ensure state persistence across journeys

#### Technical Implementation

- **Soul Forging Manager**: System managing soul forging extensions and costs
- **Temporary Soul Forging**: Arcana-based soul forging for current journey
- **Permanent Soul Forging**: Soul Power-based soul forging for permanent extensions
- **Level Cap Management**: Dynamic level caps based on soul forging
- **State Persistence**: Soul forging state saved across sessions

#### Files to Create/Modify

- `packages/sim/src/economy/soul-forging-manager.ts` - Soul forging system
- `packages/sim/src/economy/soul-forging-costs.ts` - Soul forging cost calculations
- `packages/sim/tests/economy/soul-forging.test.ts` - Soul forging system tests

#### Acceptance Criteria

- [ ] Temporary Soul Forging (Arcana-based, current journey only)
- [ ] Permanent Soul Forging (Soul Power-based, permanent)
- [ ] Soul Forging cost calculation (15-25× for temporary, high Soul Power for permanent)
- [ ] Level cap extension (+60 levels per soul forging)
- [ ] Soul Forging state persistence across journeys

### Story P1-E4-S4: Enchant UI System

**Priority:** High | **Effort:** 5 story points | **Dependencies:** P1-E4-S3

#### Objectives

- Create enchant purchase buttons (Firepower, Scales)
- Implement cost display with current Arcana balance
- Add Soul Forging interface (temporary and permanent options)
- Create purchase confirmation and feedback
- Ensure real-time cost updates and validation

#### Technical Implementation

- **Enchant UI Components**: Purchase buttons and cost displays
- **Soul Forging UI Components**: Temporary and permanent soul forging interface
- **Balance Integration**: Real-time Arcana and Soul Power balance updates
- **Purchase Flow**: Confirmation and feedback system
- **State Synchronization**: UI updates with enchant and soul forging state changes
- **Validation System**: Prevent invalid purchases

#### Files to Create/Modify

- `apps/web/src/lib/components/enchant/EnchantPanel.svelte` - Main enchant UI
- `apps/web/src/lib/components/enchant/EnchantButton.svelte` - Purchase buttons
- `apps/web/src/lib/components/enchant/CostDisplay.svelte` - Cost display
- `apps/web/src/lib/components/enchant/SoulForgingInterface.svelte` - Soul forging UI
- `apps/web/src/lib/components/enchant/SoulForgingButton.svelte` - Soul forging buttons

#### Acceptance Criteria

- [ ] Enchant purchase buttons (Firepower, Scales)
- [ ] Cost display with current Arcana balance
- [ ] Soul Forging interface (temporary and permanent options)
- [ ] Purchase confirmation and feedback
- [ ] Real-time cost updates and validation
- [ ] Soul Forging cost display and options

### Story P1-E4-S5: Economic Balance Testing

**Priority:** High | **Effort:** 3 story points | **Dependencies:** P1-E4-S4

#### Objectives

- Validate progression curves (2-3 returns/hour target)
- Test economic balance with different scenarios
- Perform performance testing under economic load
- Collect balance metrics and analysis
- Implement economic regression testing

#### Technical Implementation

- **Balance Testing Framework**: Automated economic balance testing
- **Progression Validation**: Ensure target progression rates
- **Load Testing**: Economic system performance under load
- **Metrics Collection**: Economic behavior analysis
- **Regression Testing**: Prevent economic balance regressions

#### Files to Create/Modify

- `packages/sim/tests/economy/balance.test.ts` - Economic balance tests
- `packages/sim/tests/economy/progression.test.ts` - Progression validation
- `packages/sim/src/economy/balance-metrics.ts` - Balance metrics collection

#### Acceptance Criteria

- [ ] Progression curve validation (2-3 returns/hour target)
- [ ] Economic balance testing with different scenarios
- [ ] Performance testing under economic load
- [ ] Balance metrics collection and analysis
- [ ] Economic regression testing

### Story P1-E4-S6: Economic Telemetry

**Priority:** Medium | **Effort:** 3 story points | **Dependencies:** P1-E4-S5

#### Objectives

- Implement Arcana earned/spent tracking
- Add upgrade pattern analysis
- Create economic behavior telemetry
- Add performance metrics collection
- Implement economic data export system

#### Technical Implementation

- **Telemetry System**: Economic event tracking and analysis
- **Metrics Collection**: Arcana flow and upgrade patterns
- **Data Export**: Economic data export for analysis
- **Performance Monitoring**: Economic system performance tracking
- **Analytics Integration**: Economic behavior analytics

#### Files to Create/Modify

- `packages/sim/src/economy/telemetry.ts` - Economic telemetry system
- `packages/sim/src/economy/metrics.ts` - Economic metrics collection
- `packages/sim/tests/economy/telemetry.test.ts` - Telemetry system tests

#### Acceptance Criteria

- [ ] Arcana earned/spent tracking
- [ ] Upgrade pattern analysis
- [ ] Economic behavior telemetry
- [ ] Performance metrics collection
- [ ] Economic data export system

## Technical Architecture

### Core Components

#### 1. Arcana Drop System

```typescript
interface ArcanaDropManager {
  baseDropAmount: number;
  scalingFactor: number;
  currentDistance: number;
  dropArcana(amount: number, source: ArcanaSource): void;
  calculateDropAmount(enemy: Enemy, distance: number): number;
  collectArcana(amount: number): void;
}
```

#### 2. Enchant System with Soul Forging

```typescript
interface EnchantSystem {
  temporary: {
    firepower: number;
    scales: number;
  };
  permanent: {
    firepower: number;
    scales: number;
  };
  soulForging: {
    temporary: number; // Arcana-based soul forging
    permanent: number; // Soul Power-based soul forging
  };
  effective: {
    firepower: number;
    scales: number;
    cap: number; // Effective cap based on soul forging
  };
}
```

#### 3. Soul Forging System

```typescript
interface SoulForgingManager {
  temporary: number; // Arcana-based soul forging (current journey only)
  permanent: number; // Soul Power-based soul forging (permanent)

  canSoulForge(isPermanent: boolean): boolean;
  performSoulForge(isPermanent: boolean): boolean;
  calculateSoulForgingCost(isPermanent: boolean): number;
  getEffectiveCap(): number;
}
```

### Integration Points

#### Core Engine Integration

- **RNG System**: Use deterministic RNG for Arcana drops
- **Clock System**: Integrate with fixed timestep for economic updates
- **Protocol System**: Send economic state updates to UI

#### UI Integration

- **Economic Display**: Real-time Arcana balance and costs
- **Enchant Interface**: Purchase buttons and cost displays
- **Soul Forging Interface**: Temporary and permanent soul forging options

#### Combat Integration

- **Arcana Drops**: From enemy kills and boss rewards
- **Economic State**: Synchronized with combat system
- **Performance**: Economic calculations during combat

## Performance Considerations

### Optimization Strategies

- **Efficient Calculations**: Optimized cost calculations and state updates
- **State Caching**: Cache expensive calculations
- **Batch Updates**: Process multiple economic events together
- **Memory Management**: Efficient state management

### Performance Targets

- **Economic Updates**: <1ms per frame
- **Cost Calculations**: <0.1ms per calculation
- **Memory Usage**: <5MB for economic systems
- **CPU Usage**: <2% for economic processing

## Testing Strategy

### Unit Tests

- Arcana drop calculations
- Enchant cost calculations
- Soul Forging logic
- Economic balance validation

### Integration Tests

- Economic system with combat integration
- UI synchronization with economic state
- Performance under economic load

### E2E Tests

- Complete economic flow (earn → spend → upgrade → soul forge)
- Economic balance validation
- Performance regression testing

## Risk Assessment

### High Risk

- **Economic Balance**: Getting progression curves right
- **Performance Impact**: Economic calculations affecting frame rate
- **Soul Forging Complexity**: Coordinating temporary and permanent systems

### Medium Risk

- **Integration Complexity**: Coordinating economic system with combat
- **UI Synchronization**: Keeping UI in sync with economic state
- **State Management**: Proper persistence and reset logic

### Mitigation Strategies

- **Early Balance Testing**: Test economic balance early and often
- **Performance Monitoring**: Continuous performance testing
- **Extensive Integration Testing**: Thorough testing with combat system
- **Iterative Balance Testing**: Continuous balance refinement

## Epic Completion Process

### Phase 1: Core Implementation

1. **Arcana Drop System** (P1-E4-S1)
2. **Basic Enchant System** (P1-E4-S2)
3. **Soul Forging System** (P1-E4-S3)

### Phase 2: UI & Integration

4. **Enchant UI System** (P1-E4-S4)
5. **Economic Balance Testing** (P1-E4-S5)
6. **Economic Telemetry** (P1-E4-S6)

### Phase 3: Epic Completion

7. **Epic Testing**: Ensure all stories complete and tested
8. **Epic PR**: Create PR from epic branch to main
9. **Epic Merge**: Merge epic branch into main
10. **Epic Cleanup**: Delete epic and story branches
11. **Documentation**: Update project documentation and roadmap

## Success Metrics

### Functional Requirements

- [ ] Arcana drops work correctly from enemies and bosses
- [ ] Enchant system provides meaningful progression
- [ ] Soul Forging system enables long-term progression
- [ ] Economic balance supports target progression rates

### Quality Requirements

- [ ] All unit tests pass
- [ ] Integration tests pass
- [ ] Performance benchmarks met
- [ ] Code follows project standards

### Deliverables

- [ ] Complete Arcana economy system
- [ ] Dual-layer enchant system
- [ ] Soul Forging progression system
- [ ] Economic UI components
- [ ] Comprehensive test coverage
- [ ] Economic balance validation

## Next Steps

1. **Create Epic Branch**: `feat/p1-e4-arcana-economy-enchant-system`
2. **Start Story P1-E4-S1**: Implement Arcana Drop System
3. **Follow Story Process**: Plan → Implement → Test → Commit → Merge
4. **Complete Epic**: All stories → Epic PR → Epic Merge → Cleanup

---

**Created:** 2025-01-30  
**Status:** Planning Complete  
**Next:** Implementation Phase
