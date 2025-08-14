# 🐉 DRAGON FORGE CHRONICLES — MASTER GAME BIBLE
## Single Source of Truth for Design, Engineering & Implementation

**Version**: 3.0 - MVP FOCUSED  
**Last Updated**: 2025-08-14  
**Status**: Active Development - MVP Implementation  
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
11. [Development Tasks](#11-development-tasks)

### PART IV: LEGACY SYSTEMS
12. [Previous Implementation](#12-previous-implementation)

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
**Status**: 3/10 completed (Updated: 2025-08-14)

#### ✅ Completed
1. **Analyze Current System** - Component structure and layout system analyzed
2. **Design New Layout** - Mockup-based layout structure designed 
3. **Update GDD** - GDD.md updated with MVP scope and system clarifications

#### 🔄 In Progress
- None currently

#### 📋 Pending - High Priority
4. **Create Legacy Backup** - Move existing components to LEGACY folder for backup
5. **Create New Components** - DragonCombatArea, FloatingDistanceBar, CurrenciesPanel, EnchantTab, MainTabsRow
6. **Update Main Layout** - Update main page layout to use new component structure

#### 📋 Pending - Medium Priority  
7. **Implement Arcana System** - Replace currency system with Arcana-only economy
8. **Implement Arc Combat** - Implement enemy arc formation based on firing range
9. **Implement Journey System** - Create journey abandonment and enchant reset mechanics
10. **Implement Enchant Bars** - Create Firepower/Scales enchant bars with 1-50 progression + Tier Up

### Current Phase: MVP Foundation
**Focus**: UI rework and fresh architecture implementation
**Blockers**: 6 follow-up questions from answered design questions (see CLAUDE.md)

### Development Phases
- **Phase 1 - Foundation** ⏳: Legacy backup, new component structure, Arcana system
- **Phase 2 - Core Features** 📋: Combat area, distance bar, enchant system, journey mechanics  
- **Phase 3 - Polish** 📋: Arc formation algorithm, visual enhancements, responsive design

### Session Notes
**2025-08-14**: Major scope pivot to MVP. GDD.md rewritten, component architecture designed, fresh start approach confirmed.

### Key Decisions This Session
- Complete UI rework with fresh start approach
- Single currency (Arcana) replacing 4-currency system
- Two-track progression: Distance (permanent) + Enchants (temporary)
- Component preservation in LEGACY folder
- No save migration for MVP

---

## DEVELOPMENT NEXT STEPS

### Immediate Priorities
1. **Answer Pending Questions** - 7 design/technical questions in CLAUDE.md
2. **Legacy Backup** - Preserve existing components
3. **Fresh Architecture** - Implement new component structure
4. **MVP Validation** - Focus on core gameplay loop

### Success Criteria
- Smooth dragon combat with arc formation enemies
- Functional enchant progression with milestone rewards
- Journey abandonment with proper reset mechanics
- Arcana economy balancing encouraging progression

---

**Last Updated**: 2025-08-14  
**Document Owner**: Principal Engineering Team  
**Next Review**: After answering pending questions and starting implementation