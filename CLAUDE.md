# 🐉 DRAGON FORGE CHRONICLES - CLAUDE CONTEXT
## AI Assistant Memory & Project State

### QUICK START (Read This First)
- **Current Status**: Enemy MVP 1.1 Implementation - Core Foundation Complete ✅
- **Active TODOs**: 15 tasks (1 completed, 14 pending) - Enemy system in progress
- **Last Session**: Implemented Enemy MVP 1.1 core foundation (Poisson spawning, object pools, telemetry)
- **Next Priority**: Complete enemy movement system with arc formation and stop-at-range behavior

### PROJECT OVERVIEW
- **Vision**: Dragon idle game with stationary combat, distance progression, and temporary enchant upgrades
- **MVP Scope**: Enemy MVP 1.1 - Full enemy combat system with Poisson spawning, arc formations, projectiles, damage scaling
- **Current Architecture**: SvelteKit + TypeScript + Web Workers + IndexedDB + Enemy System with Object Pooling

### CONVERSATION PATTERNS
- **Always do first**: Read CLAUDE.md → GDD.md → Current TODOs from Development Status section
- **"Where are we?" means**: Development cycle status - what phase, what's complete, what's next
- **Update requirements**: Sync TODOs to GDD.md after major changes using TodoWrite tool
- **Documentation duty**: Update CLAUDE.md and GDD.md at session end
- **Questions policy**: Check documentation first, then ask follow-up questions about scope, technical details, and user preferences

### KEY DECISIONS MADE

#### MVP Scope (2025-08-14)
- **Fresh Start**: Complete UI rework, move existing to LEGACY folder
- **Single Currency**: Arcana only (replaces 4-currency system)
- **Two-Track Progression**: Distance (permanent) + Enchants (temporary, reset on journey abandon)
- **Combat System**: Stationary dragon, enemies in arc formation based on firing range
- **UI Layout**: Floating distance bar, combat area, currencies panel, tabs, context controls

#### Technical Approach
- **Component Strategy**: New components with MVP-focused names
- **Save System**: Fresh start, no migration from legacy saves
- **Performance**: Maintain 60fps target during combat
- **Responsive**: Desktop/tablet focus, mobile later

#### Architecture Decisions
- **Legacy Preservation**: All existing work moved to /LEGACY for future reference
- **Component Hierarchy**: FloatingDistanceBar → GameLayout → MainTabsRow → ContextControlsPanel
- **State Management**: Simplified stores for MVP features only

### DEVELOPMENT PATTERNS

#### File Organization
- **New Components**: `/src/lib/components/` with descriptive MVP names
- **Legacy Code**: `/LEGACY/` folder preserves all previous implementations
- **Documentation**: GDD.md as single source of truth, CLAUDE.md for AI context

#### Naming Conventions
- **Components**: Descriptive names (DragonCombatArea vs CombatScreen)
- **Systems**: Clear MVP scope (EnchantTab vs complex gear systems)
- **Variables**: Distance-focused (levelDistance, arcanaAmount, etc.)

#### Testing Approach
- **Performance**: 60fps combat target
- **Functionality**: Core gameplay loop validation
- **Responsive**: Desktop/tablet compatibility

### CURRENT BLOCKERS & QUESTIONS

#### ✅ User Questions Answered (2025-08-14)
1. **Journey Abandonment Trigger**: HOME/BARRACKS tab (TBD name) - equip items/allies, LOCK IN changes restarts journey
2. **Arcana Persistence**: YES - player keeps all currencies when journey resets
3. **Arc Formation Algorithm**: Closest spot at firing range, distribute near arrival point with overlap allowed
4. **Distance Scaling**: 30-45 second completion for Level 1, logarithmic progression (L2>L1, L3>L2, etc.)
5. **Boss Gates**: At level completion (every 10th level), separate encounters that pause progression
6. **MVP Priority**: One complete system at a time (Combat + Arcana collection first)
7. **Visual References**: Simple progress bars first, visual enhancements later

#### 🔄 New Questions from Answers
8. **Level 1 Distance**: What total distance for Level 1? (30-45 seconds at optimal speed)
9. **Speed Calculation**: What m/s gives 30-45 second completion for chosen L1 distance?
10. **Logarithmic Progression**: Specific formula for level lengths? (e.g., L1: 1km, L2: 1.5km, L3: 2.2km?)
11. **Enemy Scaling**: Still every 5-10m within levels, or different interval?
12. **Home Tab Name**: Final name for equipment/respec tab?
13. **Gate Waves**: What happens in non-boss level gates (levels 1-9)? Regular enemy waves?

#### Technical Considerations
- **Performance**: Combat canvas complexity with overlays
- **Arc Formation**: Algorithm for enemy positioning at firing ranges
- **State Reset**: Clean journey abandonment mechanics
- **Component Integration**: New architecture with existing worker system

### CURRENT IMPLEMENTATION STATUS

#### ✅ **Phase 1 Complete: Principal Engineer Architecture** (2025-08-14)
- **CTO Spec Implementation**: Following exact Dragon Idler Combat/Enchant Screen spec v1.0
- **CSS Variables System**: All tunable values centralized per spec (--rail-w, --combat-h, --controls-size, etc.)
- **Grid Layout**: Two-column sticky layout (combat strip + currency rail) with proper responsive breakpoints
- **Combat Strip**: Exact spec compliance - sticky positioning, distance header, 28px controls, HP chip above dragon
- **Currency Rail**: Fixed width with 4-item scroll limit, proper cell heights (48-56px)
- **Utility Modules**: Created `distanceFormat.ts` and `enchantCosts.ts` for reusable business logic

#### ✅ **All Features Complete** 
- **Combat Strip**: ✅ Distance header formatting, controls (Reverse/Stop/Start), dragon positioning, HP color states
- **Currency Rail**: ✅ Sticky positioning, internal scroll, locked currency display
- **Tabs Row**: ✅ Return to Draconia modal with journey reset confirmation
- **Enchant System**: ✅ Complete T1/T2/T3 tier system with purchase buttons, tier upgrades, progress tick markers
- **Worker Integration**: ✅ Full travel control integration with state synchronization

#### Recent Major Changes (2025-08-16)
- **Enemy MVP 1.1 Launch**: Implementing complete enemy combat system per CTO specs
- **Core Foundation Complete**: Poisson spawning, object pooling, telemetry, state management
- **Configuration-Driven**: All enemy parameters loaded from JSON for easy tuning
- **Performance-First**: Object pools prevent GC pauses, 60fps target with 48 concurrent enemies

### SESSION WORKFLOW

#### Starting New Conversation
1. Read CLAUDE.md for context
2. Read GDD.md Development Status for current TODOs
3. Check for any blockers or pending questions
4. Ask user for priority/direction

#### During Session
1. Use TodoWrite to track progress
2. Update GDD.md for major decisions
3. Ask follow-up questions frequently
4. Document key decisions in both files

#### Ending Session
1. Sync TODOs to GDD.md Development Status
2. Update CLAUDE.md with session summary
3. Note any new blockers or questions
4. Confirm next session priorities

### TECHNICAL IMPLEMENTATION NOTES

#### **Architecture Patterns Used**
- **Spec-Driven Development**: Every component built to exact CTO specifications
- **CSS Custom Properties**: Centralized theming system for easy tuning
- **Sticky Layout Strategy**: Performance-optimized scrolling with sticky positioning
- **Utility-First Logic**: Shared business logic in dedicated modules
- **Component Composition**: Single-responsibility components with clear interfaces

#### **Files Created/Modified**
- `src/lib/enemySystem.ts`: Complete enemy system with Poisson spawning, object pools, state machine
- `public/enemy-config.json`: All enemy parameters per CTO spec (spawning, movement, scaling, UI)
- `src/lib/telemetry.ts`: Extended with enemy events (spawn, death, hit, projectiles, boss)
- `src/lib/decimal.ts`: CommonJS wrapper for break_eternity.js import compatibility
- `src/routes/+page.svelte`: Main grid layout with CSS variables
- `src/lib/components/DragonCombatArea.svelte`: Combat strip with controls and dragon positioning
- `src/lib/components/CurrencyPanel.svelte`: Currency rail with scroll container
- `LEGACY/`: All previous MVP components preserved

#### **Enemy MVP 1.1 Development Phases**
1. **✅ Task A - Foundations**: Enemy state machine, Poisson scheduler, object pools
2. **✅ Task B - Movement**: Arc formation, stop-at-range, reverse scaling, overlap tolerance
3. **✅ Task C - Projectiles**: Line-circle collision, chain hits, lifetime management
4. **✅ Task D - HP/Damage Scaling**: Land progression, within-land steps, boss multipliers
5. **✅ Task E - Visual Feedback**: HP bars, damage numbers, pop/float/fade animations
6. **✅ Task F - Boss System**: Land 10 boss spawn, YOU WIN dialog, burst fire patterns
7. **✅ Task G - Performance**: Caps enforcement, culling, FPS throttling, pooling validation
8. **🔄 Task H - Integration**: System integration with UI, import issue resolution

---

**Last Updated**: 2025-08-16  
**Last Session**: Completed Enemy MVP 1.1 implementation and started integration testing - encountered CommonJS import issues with break_eternity.js requiring resolution  
**Next Session Goal**: Resolve import issues and complete system integration testing

### ENEMY MVP 1.1 SPECIFICATIONS SUMMARY

**Core Features**:
- Poisson spawning (λ = 1/1.8s, bounded 0.6-3.5s) for organic enemy arrival
- Object pools for 48 enemies, 160 projectiles, 120 damage numbers (no GC)
- Arc formation at 28% combat width attack range around dragon
- HP/Damage scaling: 1.18×/1.12× across lands, 0.85 end-ratio within lands
- Player projectile chain hits (max 1 additional enemy)
- Boss at Land 10 (2.8× HP, 2.0× damage, burst fire)
- Performance throttling if FPS < 55 for >1s

**Technical Implementation**:
- Configuration-driven from `/enemy-config.json`
- State machine: spawning → advance → inRange → dead
- Telemetry for all combat events (NDJSON format)
- Reverse travel affects spawn rates and movement speeds
- Overlap tolerance with arrival jiggle for natural clustering