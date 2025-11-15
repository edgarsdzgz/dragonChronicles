# Documentation Archive

**Purpose:** Historical preservation of superseded design documents and specifications

**Archive Date:** November 15, 2025

---

## Archive Structure

### v2.4 (Current)
**Location:** `docs/v2.4/`
**Status:** ✅ ACTIVE - Current authoritative documentation
**Date:** November 2025+

Complete game design with branching progression, City Council hub, world boss system, and 15-step tutorial.

**Key Documents:**
- `GDD_v2.4.0.md` - Authoritative game design document
- `tome/` - 8 comprehensive system specifications

---

### v2.3 Archive
**Location:** `docs/archive/v2.3/`
**Status:** 📦 ARCHIVED - Superseded by v2.4
**Date:** January 2025

Complete v2.3.2 Game Design Document and comprehensive tome documentation.

**Contents:**
- `v2.3.2GDD.md` - v2.3.2 Game Design Document (January 2025)
- `tome/` - 27 comprehensive design documents
- `ARCHIVAL_NOTES.md` - Detailed list of changes from v2.3 to v2.4

**Major Features (v2.3):**
- Arcana Expansion system with persistent currency
- Shield Tax mechanics (25% tax on first return only)
- Dual-layer enchantment architecture
- Nested triangle elemental system (Heat/Cold/Energy)

**Why Archived:**
Complete game flow redesign required for MVP/demo goals. See `ARCHIVAL_NOTES.md` for 15 major breaking changes.

---

### v2.3 Extended Archive
**Location:** `docs/archive/v2.3-extended/`
**Status:** 📦 ARCHIVED - Historical reference
**Date:** v2.2 through v2.3 era

Foundational design documents (v2.2 tome) and implementation artifacts from v2.2-v2.3 development.

**Contents:**
- **Tome Documents:** Vision, lore, progression, enemy content packs, ward narrative
- **Implementation Artifacts:** Cutscene specs, parallax reference, sprite animation guides

**Value:**
- Original design philosophy and vision
- World-building and narrative canon
- Historical context for design decisions

---

### v2.2 Archive
**Location:** `docs/archive/v2.2/`
**Status:** 📦 ARCHIVED - Historical planning
**Date:** January 2025

Original comprehensive development roadmap created before v2.3 design changes.

**Contents:**
- `EPIC_OF_EPICS_v2.2.0.md` - Complete development plan
  - 6 phases (Phase 0-5)
  - 32 epics with dependencies
  - 192 individual stories
  - 52-68 week timeline estimate

**Value:**
- Historical development planning reference
- Component isolation strategy principles
- Original architectural approach

---

## Version Timeline

```
v2.2 Era (Early 2025)
  │
  ├─ EPIC_OF_EPICS_v2.2.0.md created (Jan 2025)
  ├─ Tome structure established
  └─ Foundational design documents

v2.3 Era (Jan-Nov 2025)
  │
  ├─ Arcana Expansion features (v2.3.1)
  ├─ v2.3.2GDD.md finalized (Jan 2025)
  ├─ Implementation artifacts created
  └─ Comprehensive tome documentation (27 docs)

v2.4 Era (Nov 2025+)
  │
  ├─ Complete game flow redesign
  ├─ New tome structure (8 docs)
  ├─ Branching progression system
  └─ City Council hub architecture
```

---

## Document Status Guide

| Symbol | Status | Meaning |
|--------|--------|---------|
| ✅ | **ACTIVE** | Current authoritative documentation - use for all development |
| 📦 | **ARCHIVED** | Historical reference - superseded but preserved |
| 🔄 | **REFERENCE** | Living documents that supplement current version |

---

## Usage Guidelines

### When to Reference Archives

**✅ Appropriate Uses:**
- Understanding historical design decisions
- Recovering lost context or rationale
- Comparing evolution of game systems
- Maintaining lore consistency across versions
- Researching original architectural approaches

**❌ Avoid These Uses:**
- Current implementation specifications (use v2.4 docs)
- Active development work (archives are superseded)
- Without validation against current design

### Recovery Process

If you need to recover content from archives:

1. **Identify the need** - What specific information is missing from v2.4?
2. **Check archives** - Which version contains the relevant content?
3. **Validate compatibility** - Does it align with v2.4 design philosophy?
4. **Adapt as needed** - Update specifications for current architecture
5. **Document in v2.4** - Add recovered/adapted content to current docs

---

## Archive Maintenance

### Archival Criteria

Documents are archived when:
- A new major version (v2.X) introduces breaking changes
- The old design is superseded by complete redesign
- Historical preservation serves future development

### What Gets Archived

- ✅ Complete GDD documents
- ✅ Comprehensive tome/specification documents
- ✅ Major planning documents (Epic of Epics)
- ✅ Implementation artifacts from that version
- ❌ Engineering documentation (stays in `docs/engineering/`)
- ❌ ADRs (stays in `docs/adr/`)
- ❌ Runbooks (stays in `docs/runbooks/`)

### Archive Organization

Each archive version should include:
- **README.md** - Overview of contents and context
- **ARCHIVAL_NOTES.md** (if applicable) - List of major changes to next version
- **Source documents** - Original files preserved as-is
- **Date stamps** - Clear indication of when archived

---

## Current Active Documentation

### Primary References (v2.4)
- **`docs/v2.4/GDD_v2.4.0.md`** - Authoritative game design
- **`docs/v2.4/tome/`** - 8 system specifications

### Supporting References (Active)
- **`docs/Aethervault_and_Scroll_System_Spec.md`** - Feature specification
- **`docs/Draconia_Lore_Compendium.md`** - Timeless lore reference
- **`docs/GOLD_MINING_ECONOMY_SPEC_v1_0.md`** - Side-system specification
- **`docs/Horizon_Steppe_Color_Palette.md`** - Visual reference
- **`docs/Steppe_Images_Detailed_Analysis.md`** - Visual analysis

### Living Documentation (Always Current)
- **`docs/engineering/`** - Implementation guides, debugging sessions
- **`docs/adr/`** - Architecture Decision Records
- **`docs/runbooks/`** - Operational procedures
- **`docs/overview/`** - Project status and changelog

---

## Questions?

For questions about:
- **Current design** → Reference `docs/v2.4/`
- **Historical context** → Reference appropriate archive
- **Lore consistency** → Check `Draconia_Lore_Compendium.md` and archives
- **Version differences** → See `ARCHIVAL_NOTES.md` in each archive

---

**Last Updated:** November 15, 2025
**Archive Maintainer:** Project documentation team
