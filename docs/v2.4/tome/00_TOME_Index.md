# Draconia Tome Index - v2.4.0

**Version:** 2.4.0
**Last Updated:** 2025-11-15
**Purpose:** Master index for all v2.4 Tome documents

---

## Overview

The Draconia Tome v2.4.0 provides comprehensive game design specifications for the MVP/demo release, focusing on a structured 15-step tutorial, branching progression system, and complete economic/building systems.

**Authoritative Source:** [GDD_v2.4.0.md](../GDD_v2.4.0.md)

**Archived Version:** [v2.3 Documentation](../../archive/v2.3/)

---

## Document List

### Core Documents

**[GDD_v2.4.0.md](../GDD_v2.4.0.md)** (~1,800 lines)
- Executive summary and version highlights
- Complete game flow overview
- Progression architecture (branching paths, boss states)
- Economy system (Arcana, Gold, Soul Power)
- Building system (6 buildings)
- Combat system overview
- 15-step tutorial sequence
- MVP/demo scope definition
- Design philosophy
- Technical requirements

### Tome Documents

**[01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md)** (~900 lines)
- Complete 15-step tutorial sequence (implementation-ready)
- Step-by-step player guidance
- UI state management
- Narrative integration
- Tutorial triggers and gates
- Post-tutorial game flow
- Implementation checklist

**[02_Economy_System.md](./02_Economy_System.md)** (~600 lines)
- Arcana currency (pendant capacity, 25% tax, Arcana Bank)
- Gold currency (item sales, City Council projects)
- Soul Power currency (Ward 3 unlock, Rune Forge usage)
- Item economy (Silver/Nickel items, Scrolls, Cartography Pages)
- Economic flows and balance considerations
- Implementation specifications

**[03_Progression_System.md](./03_Progression_System.md)** (~900 lines)
- Ward structure (linear, branching, merging, alternate paths)
- Boss encounter system (ward bosses, large enemies, world bosses)
- Branching path system (Ward##A, Ward##B notation)
- State persistence (per-journey vs permanent)
- Land 1: Horizon Steppe structure
- Navigation and traversal mechanics
- Implementation specifications

**[04_Building_System.md](./04_Building_System.md)** (~700 lines)
- City Council (central funding hub)
- Arcana Bank (max capacity increases)
- Aethervault (Scroll decryption, Soul Power unlock)
- Librarium (Soul Power research)
- Rune Forge (permanent upgrades)
- Mining Guild (mine discovery)
- Building dependencies and unlock chains
- Implementation specifications

**[05_Combat_System.md](./05_Combat_System.md)** (~400 lines)
- Enemy types (common, boss wave, large, world bosses)
- Boss encounter mechanics (v2.4 specific)
- Boss state tracking (per-journey vs permanent)
- Rewind behavior examples
- Performance targets
- Integration with v2.4 systems
- Cross-references to v2.3 detailed combat specs

**[06_Path_Navigation_System.md](./06_Path_Navigation_System.md)** (~600 lines)
- Manual traversal mechanics
- Backtracking system
- Fast travel system (unlock, checkpoints, costs)
- Path network visualization
- Alternate path mechanics (dead ends, hidden paths)
- Implementation specifications

**[07_State_Persistence.md](./07_State_Persistence.md)** (~400 lines)
- Journey state (per-journey, resets)
- Permanent state (cross-journey, never resets)
- Save system (Dexie integration)
- State validation and corruption recovery
- Migration system (v2.3 → v2.4)
- State query APIs
- Backup strategy

---

## Document Integration Map

```
GDD_v2.4.0.md (Authoritative)
    ↓
├─ 01_Game_Flow_MVP.md (Tutorial implementation)
├─ 02_Economy_System.md (Currencies, items)
├─ 03_Progression_System.md (Branching paths, bosses)
├─ 04_Building_System.md (6 buildings, City Council)
├─ 05_Combat_System.md (v2.4 changes + v2.3 reference)
├─ 06_Path_Navigation_System.md (Fast travel, backtracking)
└─ 07_State_Persistence.md (Save system, state tracking)
```

**Cross-References:**
- All tome documents reference GDD as authoritative source
- Combat references v2.3 for detailed mechanics
- Tutorial references all systems for implementation details
- State persistence integrates with all systems

---

## Key Concepts

### Branching Progression

**Ward Notation:**
- `Ward 1, Ward 2, Ward 3` - Linear progression
- `Ward 4A, Ward 4B` - Branching paths
- `Ward 11C` - Alternate path (mine)
- `Ward 26A` - Worldstone path (post-Sirocco)

**Path Types:**
- **Linear**: Standard progression
- **Branching**: Player choice at fork
- **Merging**: Multiple paths converge
- **Dead End**: Must backtrack (mines, Worldstone)

### Boss State Tracking

**Per-Journey (Resets):**
- Ward boss waves (every ward)
- Large enemies (every 10 wards)
- Path history, branch choices

**Permanent (Never Resets):**
- World bosses (Sirocco, ONE TIME ONLY)
- Building unlocks
- Permanent upgrades (Rune Forge)
- Soul Power, Gold accumulation
- Worldstone discoveries

### Economy

**Arcana:**
- Run currency, pendant capacity
- 25% tax EVERY return
- Arcana Bank deposits → capacity increases

**Gold:**
- City Council project funding
- Building unlocks (500-2,000 Gold each)
- Maintenance costs (Rune Forge, researchers)

**Soul Power:**
- Unlocked Ward 3 (First Scroll)
- Permanent progression currency
- Rune Forge crafting (500-4,500+ SP per upgrade)

---

## Implementation Priority

### P0 - Critical (MVP Blockers)

1. **GDD Review:** Ensure all systems documented
2. **Tutorial Implementation:** 15-step sequence (01_Game_Flow_MVP.md)
3. **Progression System:** Boss state tracking, branching paths (03_Progression_System.md)
4. **State Persistence:** Save/load, journey vs permanent (07_State_Persistence.md)

### P1 - High (MVP Core)

5. **Economy System:** Arcana, Gold, Soul Power (02_Economy_System.md)
6. **Building System:** City Council, 6 buildings (04_Building_System.md)
7. **Path Navigation:** Fast travel optional, backtracking required (06_Path_Navigation_System.md)

### P2 - Medium (Polish)

8. **Combat System:** Integrate v2.3 mechanics (05_Combat_System.md)
9. **UI Implementation:** Tutorial popups, building UIs, branch point UI
10. **Testing:** Tutorial flow, state persistence, economic balance

### P3 - Low (Future)

11. **Advanced Systems:** Post-MVP content (Land 2+, advanced tech trees)
12. **Polish:** Animations, cutscenes, audio integration

---

## Version History

**v2.4.0** (2025-11-15)
- Complete redesign with branching progression
- Structured 15-step tutorial
- Boss state tracking (per-journey vs permanent)
- MVP/demo scope clearly defined
- Fresh documentation (archived v2.3)

**v2.3.2** (2025-01-28)
- [Archived](../../archive/v2.3/v2.3.2GDD.md)
- Comprehensive specifications
- Superseded by v2.4.0 redesign

---

## Usage Guide

### For Developers

1. **Start with GDD:** Read [GDD_v2.4.0.md](../GDD_v2.4.0.md) for high-level overview
2. **Implementation Planning:** Use [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md) for tutorial sequence
3. **System Details:** Refer to specific tome documents (02-07) for implementation specs
4. **v2.3 Reference:** For combat/ability details, see [v2.3 tome](../../archive/v2.3/tome/)

### For Designers

1. **Balance Review:** Check [02_Economy_System.md](./02_Economy_System.md) for costs and rewards
2. **Progression Pacing:** Review [03_Progression_System.md](./03_Progression_System.md) for difficulty curves
3. **Tutorial Flow:** Validate [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md) for player experience

### For Testers

1. **Tutorial Checklist:** Use [01_Game_Flow_MVP.md](./01_Game_Flow_MVP.md) implementation checklist
2. **State Testing:** Verify per-journey vs permanent using [07_State_Persistence.md](./07_State_Persistence.md)
3. **Path Testing:** Validate branching using [03_Progression_System.md](./03_Progression_System.md)

---

## Questions & Clarifications

**For questions about v2.4.0 design:**
- Reference: This Tome (docs/v2.4/)
- Authoritative: GDD_v2.4.0.md
- Conflicts: GDD takes precedence

**For v2.3 references:**
- Location: docs/archive/v2.3/
- Usage: Pull combat/ability details as needed
- Adaptation: Update to v2.4 boss encounter system

**For missing specifications:**
- Create ADR (Architecture Decision Record) in docs/adr/
- Document design decision and rationale
- Update relevant tome document

---

*This index provides navigation for all v2.4.0 documentation. For active development, always reference the latest version of each document.*
