# ARCHIVAL NOTICE - Version 2.3.2

**Version Archived:** v2.3.2
**Archive Date:** 2025-11-15
**Reason:** Complete game flow redesign (v2.4.0)
**Superseded By:** [docs/v2.4/GDD_v2.4.0.md](../../v2.4/GDD_v2.4.0.md)

---

## Contents of v2.3 Archive

### Game Design Documents
- **`v2.3.2GDD.md`** - Complete Game Design Document for v2.3.2 (January 2025)
  - Arcana Expansion system with persistent currency
  - Shield Tax mechanics (25% tax on first return only)
  - Dual-layer enchantment architecture
  - Nested triangle elemental system (Heat/Cold/Energy)
  - Parallax background system specifications

### Tome Documents
- **`tome/`** - 27 comprehensive design documents covering all game systems
  - See `tome/00_TOME_Index_v2.2.md` for complete navigation

---

## Why v2.3 Was Archived

Version 2.3.2 represented a comprehensive game design with many systems defined, but the core progression flow and early-game tutorial sequence required fundamental redesign to better serve the MVP/demo goals and create a more cohesive player experience.

Rather than attempting to retrofit the new design onto existing documentation (which would create conflicts and confusion), we opted for a clean start with v2.4.0, preserving v2.3 as historical reference.

---

## Major Changes from v2.3.2 to v2.4.0

### 1. **Arcana Tax System** (CRITICAL CHANGE)
- **v2.3:** 25% tax on first return only
- **v2.4:** 25% tax on EVERY return (barrier upkeep)
- **Impact:** Completely changes return frequency economics and player decision-making

### 2. **Tax vs Deposited Arcana** (NEW DISTINCTION)
- **v2.3:** Tax counted as deposited Arcana
- **v2.4:** Tax goes to barrier (does NOT count as deposited); only voluntary deposits beyond tax count
- **Impact:** Clearer separation between mandatory cost and voluntary progression

### 3. **Soul Power Unlock** (CRITICAL CHANGE)
- **v2.3:** Soul Power available from game start
- **v2.4:** Soul Power locked until Ward 3 Scroll discovery
- **Impact:** Completely changes early-game progression, tutorial flow, and research tree availability

### 4. **Return Button Availability** (TUTORIAL CHANGE)
- **v2.3:** Return button available from start (or vague)
- **v2.4:** Return button revealed after Ward 1 boss wave completion
- **Impact:** Forces player through initial content, creates tutorial gate

### 5. **Ward Boss Structure** (MAJOR REDESIGN)
- **v2.3:** Boss every 5 wards (vague)
- **v2.4:**
  - Boss wave (multiple enemies) at end of EVERY ward
  - Large enemy (single tough) every 10 wards
  - World boss (Sirocco, etc.) at end of each LAND
- **Impact:** More frequent challenges, clearer progression milestones

### 6. **Boss Encounter Persistence** (NEW SYSTEM)
- **v2.3:** Not specified
- **v2.4:**
  - Ward bosses: Single encounter per journey, respawn on new journey
  - World bosses: ONE TIME ONLY, permanent defeat, never respawn
  - Rewind behavior: Defeated bosses stay defeated within journey
- **Impact:** State tracking required, journey vs permanent progression distinction

### 7. **Branching Path System** (ENTIRELY NEW)
- **v2.3:** Linear ward progression
- **v2.4:**
  - Path notation: Ward##A, Ward##B, Ward##C
  - Branching points, merging paths, dead ends
  - Alternate paths for Worldstone, mines, future content
  - Fast travel system (unlockable convenience)
- **Impact:** Non-linear exploration, backtracking mechanics, fast travel as gold sink

### 8. **Tutorial Sequence** (COMPLETE REDESIGN)
- **v2.3:** Basic intro, vague systems
- **v2.4:** 15-step guided tutorial sequence:
  1. Cutscene → Journey (no Soul Power, no Return)
  2. Ward 1: Arcana + items (guaranteed drops: 5, 15, 50 enemies)
  3. Ward 1 boss wave → Arcana fills → Return button revealed
  4. First return: 25% tax → Arcana Bank → Max Arcana increase
  5. Ward 2-3: Continue journey, collect items
  6. Ward 3 boss wave: 100% FIRST SCROLL drop
  7. Second return: Aethervault → Soul Power unlocked
  8. City Council: Fund Librarium
  9. Librarium: Research Soul Power usage
  10. City Council: Fund Rune Forge
  11. Rune Forge: Craft permanent upgrades
  12. Continue: Scroll system, Mining Guild
  13. Progress through Land 1
  14. Beat Sirocco → Worldstone access
  15. Complete Land 1 intro
- **Impact:** Structured onboarding, progressive feature discovery

### 9. **Gold Economy Purpose** (MAJOR SHIFT)
- **v2.3:** Item sales → quality of life improvements (vague)
- **v2.4:** Item sales → City Council project funding (building unlocks)
- **Impact:** Gold becomes primary gating currency for progression systems

### 10. **Building Unlock System** (NEW CENTRALIZATION)
- **v2.3:** Various unlock paths (unclear)
- **v2.4:** City Council as central funding hub:
  - Aethervault: Gold unlock
  - Librarium: Gold unlock
  - Rune Forge: Gold unlock + maintenance
  - Mining Guild: Gold unlock
- **Impact:** Unified progression gate, clear Gold sink

### 11. **Scroll System** (REDESIGNED)
- **v2.3:** Research lab focus (unclear drop rates)
- **v2.4:**
  - Small % drop rate during journey
  - Guaranteed locations: Ward 2, Ward 5
  - First Scroll: Ward 3 boss wave (100%, one-time)
  - Scroll Researchers: Hire with Gold, fund for X scrolls
- **Impact:** Clearer acquisition, research as building system

### 12. **Worldstone System** (ENTIRELY NEW)
- **v2.3:** Not present
- **v2.4:**
  - Location: Edge of each Land (after world boss)
  - Powering: Requires Arcana deposit
  - Effect: Protection layer, enables non-pendant wearers, mining automation
  - Discovery: Optional for forward progress
  - Lore: Ancient defense against Unmaking
- **Impact:** Major endgame system, automation unlock, optional milestone

### 13. **Cartography Pages & Mining Guild** (NEW SYSTEM)
- **v2.3:** Gold mining mentioned (unclear)
- **v2.4:**
  - Cartography Pages: Rare drops, reveal mine locations
  - Mining Guild: Gold-unlocked building
  - Mine discovery: Alternate path, guardian fight, clicker minigame
  - Automation: Post-Worldstone (Land 1 complete)
- **Impact:** Side quest system, Gold generation, backtracking mechanic

### 14. **Demo/MVP Scope** (REDEFINED)
- **v2.3:** Vague completion criteria
- **v2.4:**
  - Goal: Complete Land 1 (Horizon Steppe)
  - Culmination: Beat Sirocco + discover Worldstone
  - Result: All core systems introduced, first story beat complete
- **Impact:** Clear development target, testable milestone

### 15. **Design Philosophy** (CLARIFIED)
- **v2.3:** Systems-focused
- **v2.4:**
  - Journey-first: Can always progress forward (except boss waves)
  - Optional engagement: Systems not required, but difficulty increases
  - Inconvenience first: Manual backtracking, fast travel as reward
  - Convenience at a price: Gold/Arcana costs for quality of life
- **Impact:** Player-driven progression, natural difficulty curve

---

## Historical Context

### What v2.3.2 Accomplished
- Comprehensive system specifications (27 tome documents)
- Technical architecture documentation
- Economy and progression frameworks
- Combat and ability systems
- Extensive world-building and lore

### Why v2.3.2 Existed
v2.3.2 represented a mature design with detailed system specifications. However, during development it became clear that:
1. The early-game tutorial flow needed more structure
2. Soul Power unlock timing created confusion
3. Return mechanics lacked clear economic purpose
4. Progression felt linear without branching exploration
5. MVP scope was too broad and unfocused

### What v2.3.2 Taught Us
- Need for structured tutorial sequence (15 steps)
- Importance of gating mechanics (return button, Soul Power)
- Value of centralized systems (City Council hub)
- Power of optional engagement (can skip systems, gets harder)
- Need for exploration rewards (branching paths, discoveries)

---

## Recovery Notes

### If You Need to Reference v2.3.2 Systems

**Preserved in this archive:**
- Complete GDD: [v2.3.2GDD.md](./v2.3.2GDD.md)
- All Tome documents: [tome/](./tome/)
- 27 detailed specification files

**What to pull from v2.3.2:**
- **Combat systems**: Enemy AI, damage calculations (tome/05)
- **Abilities**: Firecraft, Safety, Scales trees (tome/06, 16)
- **Technical architecture**: Frontend, workers, persistence (tome/12-15)
- **Rendering**: PixiJS specifications (tome/14)
- **Lore**: World-building details (tome/01, 18-19)

**What NOT to pull from v2.3.2:**
- Core loop (completely redesigned)
- Economy system (Gold purpose changed)
- Progression structure (branching paths added)
- Tutorial sequence (entirely new)
- Building unlock chains (City Council hub)

---

## Transition Guide for Developers

### If Implementing v2.4.0 Features

1. **Start with v2.4 documentation** as authoritative source
2. **Reference v2.3 only** for technical details not in v2.4 yet
3. **Ask for clarification** if v2.3 conflicts with v2.4 concepts
4. **Pull code patterns** from v2.3 implementation (if code exists)
5. **Don't assume v2.3 mechanics** apply to v2.4

### Key Mindset Shifts

| v2.3 Thinking | v2.4 Thinking |
|---------------|---------------|
| "Soul Power from start" | "Soul Power gated until Ward 3" |
| "Linear ward progression" | "Branching paths with choices" |
| "Tax once" | "Tax every return" |
| "Gold for QoL" | "Gold for progression gates" |
| "Systems always available" | "Systems unlock through tutorial" |
| "World boss every 5 wards" | "Boss wave every ward, world boss every land" |

---

## Contact & Questions

If you have questions about:
- **Why something changed**: See "Major Changes" section above
- **What to reference from v2.3**: See "What to pull" section above
- **How to transition code**: Reference v2.4 documentation first, then v2.3 for gaps
- **Conflicting information**: v2.4 is authoritative, v2.3 is historical reference

---

## Version History

- **v2.3.2** (2025-01-28): Last comprehensive update before redesign
- **v2.3.0** (prior): Initial comprehensive specification
- **v2.4.0** (2025-11-15): Complete redesign with branching progression, structured tutorial, MVP focus

---

*This archive preserves v2.3.2 in its entirety for historical reference. All active development should reference [v2.4 documentation](../../v2.4/).*
