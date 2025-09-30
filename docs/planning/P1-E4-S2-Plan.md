# P1-E4-S2: Basic Enchant System - Implementation Plan

## Story Overview

**Epic**: P1-E4 (Arcana Economy & Enchant System)  
**Priority**: Critical  
**Effort**: 5 story points  
**Dependencies**: P1-E4-S1 (Arcana Drop System) ✅ Complete

## Objectives

Implement the core enchant system that allows players to spend Arcana for temporary upgrades during journeys and Soul Power for permanent upgrades in Draconia. This system includes Firepower and Scales enchants with geometric cost progression and Soul Forging integration for level cap extensions.

## Acceptance Criteria

- [ ] Firepower enchant system (damage multiplier, geometric costs)
- [ ] Scales enchant system (health multiplier, geometric costs)
- [ ] Geometric cost progression (×1.12 per level)
- [ ] Level caps based on soul forging extensions
- [ ] Temporary enchant state management
- [ ] Integration with Soul Forging system
- [ ] Location-based spending restrictions (Draconia vs journey)

## Technical Implementation

### Core Components

#### 1. Enchant Manager

- **Purpose**: Central system managing enchant levels, costs, and state
- **Features**:
  - Firepower and Scales enchant management
  - Temporary vs permanent enchant tracking
  - Location-based spending validation
  - Soul Forging integration for level caps

#### 2. Cost Calculation System

- **Purpose**: Geometric cost progression for enchant levels
- **Formula**: `cost(level) = baseCost * 1.12^level`
- **Features**:
  - Firepower: Base cost 10 Arcana, ×1.12 per level
  - Scales: Base cost 10 Arcana, ×1.12 per level
  - Soul Forging costs: 15-25× last level cost (temporary), high Soul Power cost (permanent)

#### 3. Soul Forging Integration

- **Purpose**: Extend level caps through Soul Forging
- **Features**:
  - Temporary Soul Forging: +60 levels for current journey (Arcana cost)
  - Permanent Soul Forging: +60 levels for all journeys (Soul Power cost)
  - Cap calculation: `baseCap + (temporarySoulForging + permanentSoulForging) * 60`

#### 4. Location Validation System

- **Purpose**: Enforce spending restrictions based on location
- **Rules**:
  - **Arcana**: Can be spent anywhere during journeys (temporary upgrades)
  - **Soul Power**: Can ONLY be spent in Draconia (permanent upgrades)
  - **Validation**: Check location before allowing purchases

### Files to Create/Modify

#### New Files

- `packages/sim/src/economy/enchant-manager.ts` - Core enchant system
- `packages/sim/src/economy/enchant-costs.ts` - Cost calculation logic
- `packages/sim/src/economy/enchant-types.ts` - Enchant type definitions
- `packages/sim/src/economy/soul-forging.ts` - Soul Forging system
- `packages/sim/tests/economy/enchant-system.test.ts` - Enchant system tests

#### Modified Files

- `packages/sim/src/economy/types.ts` - Add enchant-related types
- `packages/sim/src/index.ts` - Export new enchant components

### Technical Architecture

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
    temporary: number; // Arcana-based soul forging (current journey only)
    permanent: number; // Soul Power-based soul forging (permanent)
  };
  effective: {
    firepower: number;
    scales: number;
    cap: number; // Effective cap = baseCap + (soulForging.temporary + soulForging.permanent) * 60
  };
}
```

### Performance Targets

- **Enchant Updates**: <0.1ms per frame
- **Cost Calculations**: <0.05ms per calculation
- **Memory Usage**: <2MB for enchant system
- **CPU Usage**: <1% for enchant processing

### Testing Requirements

- [ ] Unit tests for enchant logic
- [ ] Integration tests with economic system
- [ ] Performance tests under load
- [ ] Cost calculation accuracy
- [ ] Soul Forging integration tests
- [ ] Location validation tests

## Implementation Steps

### Phase 1: Core Enchant System

1. **Create Enchant Types** (`enchant-types.ts`)
   - Define `EnchantType`, `EnchantLevel`, `EnchantCost` interfaces
   - Define `EnchantSystem` interface with temporary/permanent/soulForging
   - Define location and spending validation types

2. **Implement Cost Calculation** (`enchant-costs.ts`)
   - Geometric cost formula: `baseCost * 1.12^level`
   - Firepower and Scales base costs (10 Arcana each)
   - Soul Forging cost calculations (15-25× for temporary, high Soul Power for permanent)

3. **Create Enchant Manager** (`enchant-manager.ts`)
   - Core enchant level management
   - Temporary vs permanent enchant tracking
   - Integration with Arcana and Soul Power systems

### Phase 2: Soul Forging Integration

4. **Implement Soul Forging System** (`soul-forging.ts`)
   - Temporary Soul Forging (Arcana-based, journey-only)
   - Permanent Soul Forging (Soul Power-based, permanent)
   - Cap extension calculations

5. **Location Validation System**
   - Draconia vs journey location detection
   - Spending restriction enforcement
   - Error handling for invalid locations

### Phase 3: Integration & Testing

6. **Integration with Economic Systems**
   - Connect with Arcana Drop Manager
   - Connect with Soul Power Drop Manager
   - Ensure proper currency validation

7. **Comprehensive Testing**
   - Unit tests for all components
   - Integration tests with economic systems
   - Performance validation
   - Location validation tests

## Definition of Done

- [ ] All acceptance criteria met
- [ ] All tests pass
- [ ] Performance targets achieved
- [ ] Code reviewed and approved
- [ ] Documentation updated
- [ ] Integration with economic system verified
- [ ] Location restrictions properly enforced
- [ ] Soul Forging system fully integrated

## Related Issues

- **Epic**: #51 (Epic 1.4: Arcana Economy & Enchant System)
- **Previous Story**: P1-E4-S1 (Arcana Drop System) ✅ Complete
- **Next Story**: P1-E4-S3 (Soul Forging System)

## Success Metrics

- **Functionality**: All enchant types working with proper cost progression
- **Performance**: All performance targets met
- **Integration**: Seamless integration with existing economic systems
- **Location Validation**: Proper enforcement of spending restrictions
- **Soul Forging**: Complete integration with level cap extensions
- **Testing**: 100% test coverage for all new components
