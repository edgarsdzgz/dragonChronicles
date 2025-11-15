# Draconia Chronicles Documentation

Welcome to the Draconia Chronicles documentation hub. This documentation covers the v2.0.0
architecture, processes, and engineering standards.

## Navigation

### 🎮 Game Design (v2.4)

**Current authoritative documentation** for all game systems and mechanics:

- **[GDD v2.4.0](./v2.4/GDD_v2.4.0.md)** - Complete Game Design Document
- **[Tome Index](./v2.4/tome/00_TOME_Index.md)** - Master navigation for all specifications
- **Game Systems:**
  - [Tutorial Sequence](./v2.4/tome/01_Game_Flow_MVP.md) - 15-step Ward 1 → Soul Power unlock
  - [Economy System](./v2.4/tome/02_Economy_System.md) - Arcana, Gold, Soul Power
  - [Progression System](./v2.4/tome/03_Progression_System.md) - Branching paths, boss encounters
  - [Building System](./v2.4/tome/04_Building_System.md) - City Council hub
  - [Combat System](./v2.4/tome/05_Combat_System.md) - Boss waves, world bosses
  - [Path Navigation](./v2.4/tome/06_Path_Navigation_System.md) - Fast travel, checkpoints
  - [State Persistence](./v2.4/tome/07_State_Persistence.md) - Save system (Dexie)

**Supporting Documentation:**
- [Aethervault & Scrolls](./Aethervault_and_Scroll_System_Spec.md) - Scroll collection system
- [Lore Compendium](./Draconia_Lore_Compendium.md) - World-building canon
- [Gold Mining Economy](./GOLD_MINING_ECONOMY_SPEC_v1_0.md) - Mining mini-game
- [Horizon Steppe Colors](./Horizon_Steppe_Color_Palette.md) - Visual reference

**Historical Archive:**
- [Archive Index](./archive/README.md) - Complete archive of superseded versions (v2.2, v2.3)

### 📋 [Overview](./overview/README.md)

Product summaries, architecture overviews, and project status:

- [Project Overview](./overview/README.md) - Status, metrics, architecture

- [Phase 0 Completion](./overview/phase0-completion.md) - Foundation milestone achievement

- [Changelog](./overview/changelog.md) - v2.0.0 release notes and versioning

### 🔧 Engineering

Development standards, policies, and technical guidelines:

- [Engineering Overview](./engineering/README.md) - Complete engineering documentation index

- [Development Practices](./engineering/dev-practices.md) - Key development practices and guidelines

- [LLM Onboarding](./engineering/llm-onboarding-complete.md) - Complete context for AI assistants

- [Development Workflow](./engineering/development-workflow.md) - Workflow, safeguards, and best

  practices

- [Testing Strategy](./engineering/testing.md) - Test layers, runner behavior, execution guide

- [TypeScript Standards](./engineering/typescript.md) - Strict mode policy, examples, best practices

- [Database Persistence](./engineering/database-persistence.md) - Dexie integration, schema design,

  atomic operations

- [Structured Logging](./engineering/structured-logging.md) - Ring buffer, Dexie sink, PII

  redaction,
  performance monitoring

- [PWA Implementation](./engineering/pwa-implementation.md) - Progressive Web App implementation

  guide

### 🏛️ Architectural Decision Records (ADRs)

Key technical decisions and their rationale:

- [ADR Template](./adr/TEMPLATE.md) - For documenting architectural decisions

- [ADR-0001: Testing Strategy](./adr/0001-testing-strategy.md)

- [ADR-0002: TypeScript Strict Gate](./adr/0002-typescript-strict-gate.md)

### 📚 Runbooks

Operational procedures and setup guides:

- [Local Development](./runbooks/local-dev.md) - Clone to running tests

- [CI/CD](./runbooks/ci.md) - Continuous integration execution

- [PR Cleanup](./runbooks/pr-cleanup.md) - Post-merge cleanup workflow

### 🚀 Optimization

Performance optimization framework and implementation:

- [Optimization Overview](./optimization/README.md) - Complete optimization documentation index

- [Optimization Summary](./optimization/OPTIMIZATION_SUMMARY.md) - Implementation summary of

  completed optimizations

- [Optimization Blueprint](./optimization/OPTIMIZATION_BLUEPRINT.md) - Reusable 8-phase optimization

  framework

- [Code Optimization Guide](./optimization/CODE_OPTIMIZATION_GUIDE.md) - Comprehensive optimization

  techniques

- [Optimization Journey](./optimization/OPTIMIZATION_JOURNEY_SUMMARY.md) - Complete optimization

  journey timeline

### 📋 Workpack Planning

Current and future workpack planning documents:

### 🎨 UI

Design specifications, wireframes, and visual guidelines.

---

## Contributing to Documentation

All code changes that affect packages, apps, or tests require corresponding documentation
updates.

### Planning Document Standards

- **All planning documents** must be created in the `/docs/` folder

- **Workpack plans** (W7, W8, etc.) go directly in `/docs/` folder

- **Feature plans** go in appropriate subdirectories within `/docs/`

- **No planning documents** should be created in the root directory

### Quick Links

- [ADR Template](./adr/TEMPLATE.md) - For documenting architectural decisions

- [Testing Documentation](./engineering/testing.md) - Current test strategy and execution

- [TypeScript Guidelines](./engineering/typescript.md) - Strict mode enforcement and examples
