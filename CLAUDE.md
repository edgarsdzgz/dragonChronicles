# 🐉 DRAGON FORGE CHRONICLES - CLAUDE CONTEXT
## AI Assistant Memory & Project State

### QUICK START (Read This First)
- **Current Status**: MVP Planning Phase - UI Rework & Architecture Design
- **Active TODOs**: 10 tasks (3 completed, 7 pending) - See GDD.md Development Status
- **Last Session**: Updated GDD.md to MVP scope, designed new component architecture
- **Next Priority**: Create LEGACY backup and start fresh component implementation

### PROJECT OVERVIEW
- **Vision**: Dragon idle game with stationary combat, distance progression, and temporary enchant upgrades
- **MVP Scope**: Arcana currency, dragon combat with arc formations, enchant bars (Firepower/Scales), journey system
- **Current Architecture**: SvelteKit + TypeScript + Web Workers + IndexedDB

### CONVERSATION PATTERNS
- **Always do first**: Read CLAUDE.md → GDD.md → Current TODOs from Development Status section
- **Update requirements**: Sync TODOs to GDD.md after major changes using TodoWrite tool
- **Documentation duty**: Update CLAUDE.md and GDD.md at session end
- **Questions policy**: Always ask follow-up questions about scope, technical details, and user preferences

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

### CONVERSATION CONTEXT

#### Recent Major Changes
- **GDD.md**: Completely rewritten for MVP focus (Version 3.0)
- **Scope Reduction**: From complex multi-system game to focused combat+enchant experience
- **UI Rework**: From tab-based layout to mockup-inspired design

#### Development Philosophy
- **MVP First**: Build core loop before adding complexity
- **Fresh Start**: Clean architecture over incremental changes
- **User-Driven**: Always ask questions to ensure correct implementation
- **Performance**: Smooth experience over feature richness

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

---

**Last Updated**: 2025-08-14  
**Last Session**: UI rework planning and MVP scope definition  
**Next Session Goal**: Answer pending questions and begin LEGACY backup + fresh implementation