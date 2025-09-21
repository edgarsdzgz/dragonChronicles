# 🐉 DRACONIA TOME — v2.2 (Master Index)

> **Precedence:** If anything here conflicts with the **v2.1 GDD**, v2.1 is authoritative.

## Purpose

One master entrypoint for the entire game plan: design, balance, tech, telemetry, and
production
checklists..
This tome integrates the complete Draconia Chronicles specification including the
Firecraft/Safety/Scales
research
system,
Astral
Seals
premium
currency,
Horizon
Steppe
region,
and
comprehensive
UI/UX
design.

## Contents

1. [Vision, Lore & North Star](01*Vision*Lore_World.md) - Game vision, lore canon, design pillars

1. [Player Experience Overview](02*Player*Experience_Overview.md) - First session to daily rhythm flows

1. [Shooter-Idle Core Loop](03*ShooterIdle*Core_Loop.md) - Core gameplay mechanics and progression

1. [Progression: Maps, Wards & Lands](04*Progression*Maps*Wards*Lands.md) - World structure and advancement

1. [Combat Systems, Enemies & Bosses](05*Combat*Systems*Enemies*Bosses.md) - Combat mechanics and encounters

1. [Abilities, Skills & Rituals](06*Abilities*Skills_Rituals.md) - Player abilities and skill systems

1. [Economy: Currencies, Items, Market](07*Economy*Currencies*Items*Market.md) - Economic systems and currencies

1. [Town, Lair & City Public Works](08*Town*Lair*City*PublicWorks.md) - Meta progression and city building

1. [Automation: Roads, Convoys & Stewards](09*Automation*Convoys_Stewards.md) - Automation and delegation systems

1. [Endgame: Rift Siege & NG+](10*Endgame*Rift_NGPlus.md) - Endgame content and new game plus

   11..
   [Mod Policy & Extensibility](11*Mod*Policy_Extensibility.md) - Modding support and
   community
   content
   12..
   [Frontend Architecture](12*Tech*Architecture_Frontend.md) - SvelteKit, TypeScript, and UI
   architecture
   13..
   [Simulation: Workers & Protocol](13*Simulation*Workers_Protocol.md) - Web Workers and
   simulation
   systems
   14..
   [Rendering & Performance Budgets](14*Rendering*Pixi*Perf*Budgets.md) - PixiJS rendering
   and
   performance
   15..
   [Persistence: Dexie Save Schema](15*Persistence*Save*Dexie*Schema.md) - Database schema
   and
   save
   system
   16..
   [Firecraft, Safety & Scales Tech Trees](16*Firecraft*Safety*Scales*Tech_Trees.md) -
   Complete
   tech
   tree
   system
   with
   research
   discovery
   17..
   [Telemetry, Stats & Analytics](17*Telemetry*Stats_Analytics.md) - Analytics and player
   statistics
   18..
   [Region R01: Horizon Steppe](18*Region*R01*Horizon*Steppe.md) - Complete first region
   specification
   19..
   [Premium Currency: Astral Seals](19*Premium*Currency*Astral*Seals.md) - Premium currency
   system
   and
   lore
   20..
   [Balancing: Math, Curves & Tables](20*Balancing*Math*Curves*Tables.md) - Game balance and
   mathematical
   models
   21..
   [Accessibility & Mobile UX](21*A11y*UX*Mobile*Design.md) - Accessibility and mobile user
   experience

1. [Testing, QA & CI/CD](22*Testing*QA*CI*CD_Gates.md) - Testing strategy and quality assurance

   23..
   [Roadmap: Phases, Epics & Workpacks](23*Roadmap*Phases*Epics*Workpacks.md) - Development
   roadmap
   and
   phases
   24..
   [Security, Privacy & Legal](24*Security*Privacy_Legal.md) - Security, privacy, and legal
   considerations
   25..
   [Glossary & Data Dictionaries](25*Glossary*Data_Dictionaries.md) - Canonical terms and
   data
   definitions
   26..
   [Content Packs: Clans, Bestiary & Factions](26*Content*Packs*Clans*Bestiary.md) - Content
   systems
   and
   factions

1. [Assets: Audio/VFX Pipelines](27*Assets*Audio*VFX*Pipelines.md) - Asset creation and management

## Source Inputs

- **v2.1 GDD** (canonical authority for lore and core design)

- **Draconia Chronicles Spec v0.3** (Firecraft, Safety, Scales research system)

- **Astral Seals Specification** (Premium currency design)

- **Dragon Idler R01: Horizon Steppe** (Complete first region specification)

- **UI/UX v2.1 Specification** (Interface design and user experience)

- **Tech Tree Data** (Fire, Safety, Scales progression tables)

- **Repository Documentation** (README, ADRs, CI, Husky v9+, testing standards)

## Integration Philosophy

This tome follows a **systems-first approach** where:

1. **Core Loop** drives all system design decisions

1. **Research Discovery** gates progression to maintain engagement

1. **Elemental Counterplay** provides tactical depth

1. **Performance Budgets** constrain all technical decisions

1. **Accessibility** is built-in from the start

## Key Design Principles

### Combat-First Design

- Pre-Rift combat power: **≥70%** Journey research; town/meta **≤30%** (City ≤10%)

- Manual contribution target: **~20% ±10%** of damage from abilities

- Performance: 60 fps desktop; ≥40 fps mid-phones; ≤200/400 enemies; ≤600 projectiles/s

### Discovery-Driven Progression

- Only **Ember Potency** and **Draconic Vitality** visible at game start

- All Firecraft/Safety/Scales nodes **hidden** until discovered via Research

- Research requires Soul Power + Synth Materials + Time

- Discovery → Soul Unlock → Arcana Leveling progression

### Economic Balance

- **Arcana** (run currency): geometric growth ×1.12, Tier-Up 15–25×

- **Soul Power** (meta currency): permanent progression, ×1.90 growth

- **Astral Seals** (premium): cosmic lore-based, rare acquisition

- **Synth Materials**: time-based production with rank loops

## Acceptance Criteria

- All linked files exist and lint as markdown

- Cross-links resolve within the repository

- Data schemas compile with TypeScript

- All acceptance criteria in individual documents are met

- Integration with existing repository standards (Husky v9+, commitlint, etc.)

## Implementation Priority

1. **Phase 1**: Core shooter-idle loop with basic Firecraft

1. **Phase 2**: Research Lab and discovery system

1. **Phase 3**: Safety/Scales integration and tier system

1. **Phase 4**: Synth production and material economy

1. **Phase 5**: Astral Seals and premium features

1. **Phase 6**: Horizon Steppe region implementation

1. **Phase 7+**: Additional regions and endgame content

---

**This tome provides complete specification for implementing Draconia Chronicles v2.2 with all integrated systems and features.**
