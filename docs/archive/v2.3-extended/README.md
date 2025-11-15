# Version 2.3 Extended Archive

**Version Range:** v2.2 through v2.3
**Archive Date:** 2025-11-15
**Status:** Superseded by v2.4
**Purpose:** Historical reference documents and implementation artifacts

---

## Contents

### Tome Documents (v2.2 Era)

**Foundational Design:**
- `01_Vision_Lore_World.md` - Core vision, lore canon, design pillars
- `04_Progression_Maps_Wards_Lands.md` - World structure, distance formulas, Land 1 (Horizon Steppe) complete
- `26_Content_Packs_Clans_Bestiary.md` - Enemy factions, Wind-Taken Nomads bestiary, Khagan of the Sirocco boss

**Narrative & Lore:**
- `Horizon_Steppe_Ward_Lore.md` - Complete narrative lore for all 22 wards of Horizon Steppe (D0→D110km)
- `Ember_Reaches_Visual_Description.md` - Visual description for Land 2

### Implementation Artifacts

**UI & Visual Reference:**
- `Draconia_Opening_Cutscene.md` - Opening cutscene specification
- `parallax-positioning-reference.md` - Parallax background positioning guide
- `SPRITE_ANIMATION_QUICK_REFERENCE.md` - Sprite animation system quick reference

**Technical Specifications:**
- `TechTree_CSV_Integration_Example.md` - Tech tree CSV integration example

---

## Document Purpose by Category

### 🎯 Foundational Design (Tome Documents)

These documents represent the core design philosophy and world structure that informed v2.2 and v2.3 development. While specific mechanics have evolved in v2.4, the fundamental vision and lore remain relevant.

**Key Concepts Preserved:**
- Player promise: "Push forward, overcome waves, return to Draconia to invest, then surge farther"
- Discovery-driven research system
- Fire tier mechanics and elemental mastery
- Land/Ward hierarchy and scaling mathematics
- Content pack modular architecture

### 🛠️ Implementation Artifacts

These documents were created to support specific implementation work during v2.2-v2.3 development. They represent snapshots of technical decisions and specifications at that time.

**Historical Value:**
- Show evolution of UI/UX thinking
- Document technical approaches that may inform future work
- Preserve specific implementation details for reference

---

## Relationship to Current Documentation

### v2.4 Documentation
- **Location:** `docs/v2.4/`
- **Relationship:** Complete redesign with new game flow, but informed by principles in these archived documents
- **Key Differences:**
  - Branching progression (Ward##A/B/C notation)
  - Boss structure changes (every ward, not every 5 wards)
  - City Council central hub
  - 15-step tutorial sequence

### Active Reference Documents
These documents remain in root `docs/` as current reference:
- `Aethervault_and_Scroll_System_Spec.md` - Active feature specification
- `Draconia_Lore_Compendium.md` - Timeless lore reference
- `GOLD_MINING_ECONOMY_SPEC_v1_0.md` - Active side-system specification
- `Horizon_Steppe_Color_Palette.md` - Visual reference for Land 1
- `Steppe_Images_Detailed_Analysis.md` - Detailed visual analysis

---

## Usage Guidelines

### When to Reference These Documents

**✅ Do Reference:**
- For historical context on design decisions
- To understand original vision and philosophy
- For lore consistency (world-building, narrative canon)
- When implementing features that align with archived specifications

**❌ Don't Reference:**
- For current implementation specifications (use v2.4 docs)
- For active development work (superseded by v2.4)
- Without verifying against current design (v2.4 may have different approach)

### Recovery Notes

If you need to reference specific mechanics from these archives:
1. **Check v2.4 first** - The concept may exist in updated form
2. **Validate against current GDD** - Ensure compatibility with v2.4 design
3. **Update as needed** - Archived specs may need adaptation for current architecture

---

## Version History

**v2.2 Era (Early 2025):**
- Original tome structure created
- Foundational design documents established
- Shooter-idle core systems specified

**v2.3 Era (January-November 2025):**
- Arcana Expansion features added
- Implementation artifacts created during development
- Comprehensive GDD (v2.3.2) finalized

**v2.4 Era (November 2025+):**
- Complete game flow redesign
- These documents archived for historical reference
- New tome structure created in `docs/v2.4/tome/`

---

## Archival Date

**November 15, 2025** - Archived as part of v2.4 documentation reorganization
