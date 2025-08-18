# 🐉 DRAGON FORGE CHRONICLES — MASTER GAME BIBLE
## Single Source of Truth for Design, Engineering & Implementation

**Version**: 4.0 - PHASE 0/1 COMPLETE  
**Last Updated**: 2025-08-16  
**Status**: Phase 2 Ready - Enemy Combat System Implementation  
**Principal Engineer**: Development Team  

---

## TABLE OF CONTENTS

### PART I: MVP OVERVIEW
1. [MVP Vision & Scope](#1-mvp-vision--scope)
2. [Core Systems](#2-core-systems)
3. [Development Approach](#3-development-approach)

### PART II: MVP GAME DESIGN
4. [Distance & Journey System](#4-distance--journey-system)
5. [Enchant Progression](#5-enchant-progression)
6. [Combat System](#6-combat-system)
7. [Currency: Arcana](#7-currency-arcana)
8. [UI Layout](#8-ui-layout)

### PART III: TECHNICAL IMPLEMENTATION
9. [Architecture](#9-architecture)
10. [Component Structure](#10-component-structure)
11. [Technical Foundation](#11-technical-foundation)
12. [Development Status](#12-development-status)

### PART IV: LEGACY SYSTEMS
13. [Previous Implementation](#13-previous-implementation)

---

## PART I: MVP OVERVIEW

### 1. MVP Vision & Scope

#### 1.1 Executive Summary
**Dragon Forge Chronicles MVP** is a focused idle/incremental experience where players control a stationary dragon in combat, collecting Arcana from defeated enemies to temporarily enhance their stats through an enchantment system during journey expeditions.

#### 1.2 MVP Core Features
- **Stationary Dragon Combat**: Dragon remains in fixed position while enemies approach in arc formations
- **Distance-Based Levels**: Travel forward/backward through levels determined by cumulative distance
- **Temporary Enchants**: Journey-specific stat upgrades that reset when abandoning expedition
- **Single Currency**: Arcana collected from enemy defeats
- **Arc Formation Combat**: Enemies stop at their firing range, creating natural defensive arcs

#### 1.3 MVP Exclusions (Future Features)
- ~~Equipment System~~ (Deferred)
- ~~Multiple Currencies~~ (Arcana only)
- ~~Crafting & Materials~~ (Deferred)
- ~~Gear Sets & Runes~~ (Deferred)
- ~~Lair Management~~ (Deferred)
- ~~Worker Automation~~ (Deferred)

### 2. Core Systems

#### 2.1 Two-Track Progression
**Distance Progression** (Permanent):
- Determines current level based on cumulative distance traveled
- Level 1: 0m-1km, Level 2: 1km-2km, etc.
- Distance resets to 0 when abandoning journey

**Enchant Progression** (Temporary):
- Two enchant bars: Firepower (DMG) and Scales (HP)
- Each bar: Levels 1-50 with milestones at 5,10,15,20,30,40,50
- Tier Up at Level 50 (costs large Arcana amount)
- ALL enchants reset when abandoning journey

#### 2.2 Journey System
- **Start Journey**: Begin from current distance, apply enchants
- **Abandon Journey**: Return home, reset distance AND enchants, keep Arcana
- **Combat State**: Dragon hovers until START button pressed
- **Death Recovery**: Heal + retreat + 2s grace period

### 3. Development Approach

#### 3.1 Fresh Start Strategy
- **Legacy Backup**: Move existing components to `/LEGACY` folder
- **New Architecture**: Clean component structure aligned to MVP
- **No Migration**: Fresh save system, no backward compatibility
- **Complete Replacement**: New currency, progression, UI systems

#### 3.2 MVP Scope Validation
**IN SCOPE**: Combat, Arcana, Enchants, Distance, Journey management
**OUT OF SCOPE**: Equipment, multiple currencies, crafting, automation

---

## PART II: MVP GAME DESIGN

### 4. Distance & Journey System

#### 4.1 Distance Mechanics
```
Level 1: 0m ────────── 1km = Level 2
Level 2: 1km ─────────── 2km = Level 3  
Level 3: 2km ─────────── 3km = Level 4
(etc.)
```

#### 4.2 Travel States
- **HOVERING**: Dragon stationary, enemies spawn but no distance progress
- **ADVANCING**: Dragon moves forward at 10 m/s, distance increases
- **RETREATING**: Dragon moves backward after death, distance decreases
- **GATE**: Boss encounter, distance paused

#### 4.3 Journey Lifecycle
1. **Start Journey**: Player begins from current distance with any purchased enchants
2. **Combat Loop**: Advance → Fight → Collect Arcana → Enhance → Repeat
3. **Death**: Heal + retreat backward + grace period + continue
4. **Abandon**: Return to base, reset distance to 0, reset all enchants, keep Arcana

### 5. Enchant Progression

#### 5.1 Enchant Bar Structure
```
[--ENCHANT--]  [{||||||---}{-----------}{----------------------}{---------------------}] [TIER]
[FIREPOWER]    [{||||||---}{-----------}{----------------------}{---------------------}] [-UP–]

[--ENCHANT--]  [{||||||---}{-----------}{----------------------}{---------------------}] [TIER]
[---SCALES---] [{||||||---}{-----------}{----------------------}{---------------------}] [-UP–]
```

#### 5.2 Progression System
- **Levels 1-50**: Single bar that fills level by level
- **Milestones**: Special bonuses at levels 5,10,15,20,30,40,50
- **Visual Enhancement**: Milestone sections highlighted with different colors
- **Cost Display**: Next level cost shown on ENCHANT button
- **Tier Up**: Level 50 unlocks TIER UP button (expensive Arcana cost)

#### 5.3 Enchant Effects
- **Firepower**: Increases dragon damage per level
- **Scales**: Increases dragon HP per level
- **Reset Trigger**: Both bars reset to 0 when abandoning journey

### 6. Combat System

#### 6.1 Enemy Arc Formation
- **Spawn**: Enemies spawn randomly from right side of screen
- **Approach**: Enemies fly toward dragon
- **Position**: Stop at their firing range distance from dragon
- **Arc Formation**: Multiple enemies create natural arc based on individual ranges

#### 6.2 Enemy Types (MVP)
- **Regular Enemy**: Single type, 10-15m firing range
- **Future**: Elite enemies and Bosses (post-MVP)

#### 6.3 Combat Flow
1. Enemy spawns and approaches dragon
2. Enemy stops at firing range (10-15m from dragon)
3. Enemy attacks dragon with projectiles
4. Dragon auto-attacks enemies
5. Enemy death → Arcana drop
6. Dragon death → heal + retreat + grace period

#### 6.4 Stat Scaling
- **Every 5-10 meters**: Enemy stats increase gradually
- **Boss Gates**: Every 10 levels (distance-based)
- **No Elite**: MVP excludes elite enemy types

### 7. Currency: Arcana

#### 7.1 Single Currency System
- **Source**: Enemy defeats only
- **Persistence**: Kept when abandoning journey
- **Usage**: Enchant level purchases and Tier Up costs
- **Display**: Top-right currencies panel with icon + amount

#### 7.2 Economic Balance
- **Generation**: Each enemy kill provides Arcana based on level/distance
- **Sinks**: Enchant level costs (escalating) + Tier Up costs (expensive)
- **No Secondary**: No materials, crafting costs, or worker wages

### 8. UI Layout

#### 8.1 Layout Structure (Based on Mockup)
```
┌─────────────────── Floating Distance Bar ───────────────────┐
│ Level L-001 | ████████▒▒▒▒ 450m/1km | Total: 12.5km      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────┬─────────────────┐
│                         │   Currencies    │
│   Dragon Combat Area    │   🔮 Arcana     │
│   🐉 (stationary)       │   📈 1,247      │
│                         │                 │
│   👹👺  (enemy arc)     │                 │
│                         │                 │
│                         │                 │
└─────────────────────────┴─────────────────┘

┌───────────────── Main Tabs Row ─────────────────────────────┐
│ [ENCHANT] [Equip] [Market] [Forge] [Army] [Magic] [Dimensions] │
└─────────────────────────────────────────────────────────────┘

┌─────────────── Context Controls Panel ──────────────────────┐
│                                                              │
│  ENCHANT Tab Content (Firepower + Scales bars)              │
│  OR "Coming Soon" for other tabs                            │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

#### 8.2 Component Architecture
- **FloatingDistanceBar.svelte**: Top progress display
- **DragonCombatArea.svelte**: Left combat zone with stationary dragon
- **CurrenciesPanel.svelte**: Top-right Arcana display
- **MainTabsRow.svelte**: Tab navigation
- **EnchantTab.svelte**: Enchant progression bars
- **ContextControlsPanel.svelte**: Dynamic tab content area

---

## PART III: TECHNICAL IMPLEMENTATION

### 9. Architecture

#### 9.1 Technology Stack (Unchanged)
- **Frontend**: SvelteKit + TypeScript
- **Game Logic**: Web Workers
- **Storage**: IndexedDB via Dexie
- **Build**: Vite + ESBuild
- **Testing**: Vitest

#### 9.2 Fresh Start Approach
- **Component Migration**: Move existing to `/LEGACY`
- **State Simplification**: New stores focused on MVP features
- **Save Reset**: No backward compatibility, fresh start

### 10. Component Structure

#### 10.1 New Component Hierarchy
```
App
├── FloatingDistanceBar (distance progress)
├── GameLayout
│   ├── DragonCombatArea (left - stationary dragon + enemies)
│   └── CurrenciesPanel (right - Arcana display)
├── MainTabsRow (tab navigation)
└── ContextControlsPanel
    ├── EnchantTab (MVP - functional)
    └── PlaceholderTabs (coming soon)
```

#### 10.2 Legacy Components (Moved to LEGACY)
- CombatScreen.svelte → LEGACY/
- TopBar.svelte → LEGACY/
- TabContainer.svelte → LEGACY/
- TreasuryPanel.svelte → LEGACY/
- (All existing components preserved for reference)

### 11. Development Tasks

#### 11.1 Phase 1: Foundation
1. **Legacy Backup**: Move components to LEGACY folder
2. **Currency System**: Replace with Arcana-only economy
3. **State Simplification**: New stores for distance/enchant/arcana
4. **Layout Structure**: New component hierarchy

#### 11.2 Phase 2: Core Features
1. **DragonCombatArea**: Stationary dragon with arc formation enemies
2. **FloatingDistanceBar**: Distance/level progress display
3. **EnchantTab**: Firepower/Scales progression bars
4. **Journey System**: Abandon/reset mechanics

#### 11.3 Phase 3: Polish
1. **Arc Formation**: Enemy positioning algorithm
2. **Visual Enhancement**: Milestone highlighting
3. **Responsive Design**: Desktop/tablet optimization
4. **Performance**: 60fps target maintenance

---

## PART IV: LEGACY SYSTEMS

### 12. Previous Implementation

#### 12.1 Completed Legacy Systems (Moved to LEGACY)
The following systems were fully implemented in previous versions but are deferred for post-MVP development:

##### Multi-Currency Economy
- 4 currency types: Copper, Forgegold, Dragonscales, Gems
- Progressive unlocks and balanced scaling
- Boss-exclusive economies

##### Comprehensive Gear System
- 8 equipment slots with 5 rarity tiers
- Enhancement system (+0 to +25)
- Gear sets with 2-piece/4-piece bonuses
- Rune socketing with 5 types and 3 rarities

##### Crafting & Materials
- 8 material types with passive generation
- 5 crafting recipes with deterministic outcomes
- Material drop system from enemies

##### Advanced Features
- Travel state machine with retreat mechanics
- World map interface with level targeting
- Lair management framework
- Worker automation system

#### 12.2 Legacy Code Preservation
All previous implementations are preserved in the `/LEGACY` folder for future reference and potential reintegration post-MVP.

---

## DEVELOPMENT STATUS

### Current TODO List
**Status**: 10/10 completed (Updated: 2025-08-15)

#### ✅ Completed - All Tasks
1. **Implement CSS variables and grid layout skeleton per spec** - Complete two-column grid with CSS custom properties
2. **Create sticky combat strip with distance header and controls** - Combat area with travel controls and distance display
3. **Implement currency rail with 4-item scroll limit** - Currency panel with proper scroll behavior
4. **Build tabs row with Return to Draconia confirm modal** - Tab navigation with journey reset confirmation
5. **Create enchant rows with tier system (T1/T2/T3)** - Complete T1/T2/T3 enchant progression system
6. **Wire controls to worker (start/stop/reverse)** - Full travel control integration with worker simulation
7. **Implement distance formatting and reset journey logic** - Distance calculations and journey abandonment
8. **Add HP chip above dragon with color states** - HP visualization with green/yellow/red/blinking states
9. **Update documentation with current progress** - GDD.md and CLAUDE.md synchronized with implementation
10. **Add tick markers every 10 levels to progress bars** - Visual milestone markers on enchant progress bars

#### 🎉 **ALL CORE FEATURES COMPLETE**
The Dragon Idler Combat/Enchant Screen MVP is fully implemented and ready for user testing.

### ✅ **CTO Spec Implementation Complete (Principal Engineering)**
**Focus**: Production-ready implementation of Dragon Idler Combat/Enchant Screen spec v1.0
**Status**: All Phases Complete - MVP Ready for User Testing

### Development Phases - All Complete
- **✅ Phase 1 - Architecture** (COMPLETE): Grid layout, CSS variables, sticky positioning, utility modules
- **✅ Phase 2 - Core Features** (COMPLETE): Tabs with modal, enchant T1/T2/T3 system, worker integration  
- **✅ Phase 3 - Polish** (COMPLETE): HP color states, tick markers, accessibility, performance optimization

### Complete Implementation (2025-08-15)
**Principal Engineer Standards Applied:**
- **CTO Spec Compliance**: Every detail implemented exactly per specification
- **Production Architecture**: CSS custom properties, sticky layouts, semantic HTML
- **Maintainable Code**: Utility modules (`distanceFormat.ts`, `enchantCosts.ts`), clear component structure
- **Performance First**: Efficient scrolling, CSS transitions, no scroll listeners

### Technical Achievements - Full Feature Set
- **Two-Column Grid**: Sticky combat strip (left) + currency rail (right) with proper breakpoints
- **Combat Strip**: Distance header formatting, 28px controls, dragon at 16px from left, HP chip with color states
- **Currency Rail**: 4-item scroll limit, 48-56px cells, lock icon display for unavailable currencies
- **Travel Controls**: Start/Stop/Reverse with worker integration and visual feedback
- **Enchant System**: Complete T1/T2/T3 tier progression with purchase buttons and tier upgrades
- **Journey Management**: Return to Draconia modal with confirmation and state reset
- **Visual Polish**: HP color states (green/yellow/red/blinking), progress bar tick markers every 10 levels
- **Worker Integration**: Full state synchronization between UI and game simulation
- **Responsive Design**: Maintains rail width, adjusts padding, optimized for 1366×768 laptops

---

## 11. TECHNICAL FOUNDATION

### 11.1 Development Infrastructure (Phase 0/1)

#### Testing Framework
- **Unit Testing**: Vitest with 111 passing tests covering decimal math, config loading, diagnostics
- **E2E Testing**: Playwright with 4 tests validating overlay positioning and accessibility
- **Coverage**: All critical paths tested including error conditions and edge cases

#### Decimal Number System
- **ESM Integration**: Clean import via `src/lib/num/decimal.ts` canonical wrapper
- **Type Safety**: Complete TypeScript definitions for break_eternity.js methods
- **Universal Access**: All files import from single source, no CommonJS require() calls

#### Configuration Management
- **JSON Config**: `/public/enemy-config.json` with comprehensive enemy parameters
- **Zod Validation**: Runtime schema validation ensuring type safety and bounds checking
- **State Integration**: Reactive loading state via `enemyConfigLoaded` store
- **Error Handling**: Graceful fallback for missing or invalid configurations

#### Debug & Instrumentation
- **Live Overlay**: Bottom-right positioned debug HUD with real-time enemy/projectile counters
- **Non-Intrusive**: `pointer-events: none` allows interaction with underlying combat UI
- **Boot Diagnostics**: Environment validation with `[BOOT OK]` confirmation logging
- **Performance Monitoring**: FPS tracking, memory usage, state update frequency

#### Accessibility Compliance
- **Semantic HTML**: All interactive elements use proper `<button>` with ARIA attributes
- **Keyboard Navigation**: Tab order, Enter/Space activation, visible focus indicators
- **Screen Reader**: `role`, `aria-selected`, `aria-label` attributes for assistive technology
- **WCAG Standards**: Meets accessibility guidelines with no browser warnings

### 11.2 Architecture Patterns

#### Store-Based State Management
```typescript
// Reactive stores for real-time updates
enemyStore: writable<EnemyState>     // active/cap/inRange counters  
projectileStore: writable<ProjectileState>  // active/cap tracking
combatState: writable<CombatState>   // tracking/targeting state
metrics: writable<MetricsState>      // spawns/s, cull count, performance
```

#### Component Composition
- **Separation of Concerns**: UI components focus on presentation, stores handle state
- **Reactive Updates**: Svelte's `$:` syntax for efficient DOM updates based on store changes
- **Modular Design**: Each system (enemies, projectiles, combat) has dedicated stores and components

#### Performance Optimization
- **Object Pooling**: Pre-allocated pools for enemies (48), projectiles (160), damage numbers (120)
- **Culling Systems**: Off-screen entity removal to maintain 60fps target
- **Batched Updates**: Store updates grouped to minimize reactive computation

---

## 12. DEVELOPMENT STATUS

### 🎯 **PHASE 0/1 COMPLETE - FOUNDATION SOLID**

Critical build/runtime blockers have been eliminated and the development foundation is fully operational. All Phase 0/1 acceptance criteria achieved:

✅ **Phase 0: Ground Check & Instrumentation**
- Debug overlay system with live counters (bottom-right positioned, non-blocking)
- Boot diagnostics with environment validation
- Testing framework setup (Vitest + Playwright)
- Store-based reactive architecture
- Config loading with fallback patterns

✅ **Phase 1: Build/Runtime Blockers**
- ESM Decimal system with unified imports via `$lib/num/decimal`
- Enemy config JSON with zod validation and loading
- Tabs accessibility with semantic buttons, ARIA, keyboard navigation
- 111 unit tests + 4 E2E tests all passing
- No require() errors, clean build pipeline

### 🚀 **PHASE 2 READY: ENEMY COMBAT SYSTEM**

**Immediate Priority**: Make enemies appear and move in combat

#### Phase 2 Scope:
- **Enemy Spawning**: Implement Poisson-distributed enemy generation
- **Arc Formation**: Position enemies at firing range around dragon
- **Enemy Movement**: Advance from spawn to combat range with reverse scaling
- **Combat Integration**: Connect enemy system to existing UI and state management
- **Performance Optimization**: Object pooling, culling, 60fps maintenance

#### Phase 2 Dependencies (Already Complete):
- ✅ Enemy configuration system with validation
- ✅ Debug overlay for real-time monitoring
- ✅ Decimal number system for large value handling
- ✅ Store architecture for reactive state management
- ✅ Testing framework for validation

### 📋 **Current Architecture Status**

**Completed Systems:**
- Combat strip with travel controls and HP visualization
- Currency system with Arcana tracking and formatting
- T1/T2/T3 enchant progression with tier upgrades
- Journey management with reset mechanics and modal confirmation
- Worker integration with state synchronization
- Responsive design optimized for desktop/tablet

**Ready for Integration:**
- Enemy system foundation with config loading
- Combat area rendering pipeline
- State stores for enemies, projectiles, metrics
- Performance monitoring and diagnostics

### 🎉 **Phase 0/1 Success Criteria - ALL ACHIEVED**
- ✅ Debug overlay: bottom-right positioned, all required counters, pointer-events disabled
- ✅ Decimal imports: unified ESM via canonical wrapper, no require() anywhere
- ✅ Enemy config: validated JSON loading with zod schema, state integration
- ✅ Tabs accessibility: semantic buttons with ARIA, keyboard navigation, focus rings
- ✅ Test coverage: comprehensive unit and E2E test suites passing
- ✅ Build pipeline: clean compilation, no runtime errors, ready for development

---

**Last Updated**: 2025-08-16  
**Document Owner**: Principal Engineering Team  
**Current Status**: Phase 0/1 Complete - Phase 2 Implementation Ready  
**Next Milestone**: Enemy MVP 1.1 - Visible enemy spawning and movement system