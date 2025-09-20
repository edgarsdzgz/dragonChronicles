<!-- markdownlint-disable -->

# Overview

Product summaries, architecture overviews, and project status for Draconia Chronicles
v0.0.1-alpha.

## Project Status

**Version**: 0.0.1-alpha (Phase 1/16 - P1-S1 Core Determinism Complete)
**Phase**: Phase 1/16 (P1-S1 core determinism engine implemented)
**Architecture**: TypeScript Monorepo with Deterministic Engine, Strict Mode Enforcement & Persistence
**Development Model**: 16-phase development cycle (0.0.1-alpha → 0.7.0-beta)

## Key Metrics

### Test Coverage

- **Unit Tests**: ✅ Shared utilities, constants, and simulation components

- **Integration Tests**: ✅ Cross-package communication and worker protocol

- **E2E Tests**: ✅ Full build pipeline and CLI contracts

- **TypeScript Strict Gate**: ✅ Type safety enforcement

- **Worker Simulation**: ✅ Protocol v1, RNG, fixed-timestep clock, auto-recovery

- **Database Persistence**: ✅ Dexie schema, Zod validation, atomic writes, export/import

- **Structured Logging**: ✅ Ring buffer with Dexie persistence, PII redaction, performance monitoring

- **PWA Implementation**: ✅ Service worker, manifest, icons, workbox caching, offline support

- **CI/CD Pipeline**: ✅ GitHub Actions, size budgets, E2E tests, Lighthouse CI, PR previews

### Documentation Status

- **Engineering Standards**: ✅ Complete ([Testing](/docs/engineering/testing.md), [TypeScript](/docs/engineering/typescript.md), [Database Persistence](/docs/engineering/database-persistence.md))

- **Architectural Decisions**: ✅ ADRs 0001-0002 documented

- **Runbooks**: ✅ [Local Development](/docs/runbooks/local-dev.md), [CI/CD](/docs/runbooks/ci.md)

- **Player Documentation**: ❌ Not yet implemented

### Code Quality

- **TypeScript Strict Mode**: ✅ Enforced across all packages

- **Build System**: ✅ Incremental compilation with project references

- **Test Optimization**: ✅ BUILD_ONCE pattern reduces build time 3x

- **Database Layer**: ✅ Atomic writes, data validation, migration scaffolding

## Architecture Summary

### Monorepo Structure

````bash

packages/           # Shared libraries
├── shared/        # Common utilities, constants, protocol v1, RNG
├── logger/        # Structured logging system (W5 complete ✅)
├── db/           # Database layer (IndexedDB) - W4 complete ✅
└── sim/          # Game simulation engine (W3 complete ✅)

apps/              # Applications
├── web/          # SvelteKit web app with PixiJS renderer
└── sandbox/      # CLI testing and contracts

tests/             # Test infrastructure
├── _tiny-runner.mjs    # Custom test runner
├── test-unit-*.mjs     # Unit tests
├── test-integration-*.mjs  # Integration tests
├── test-e2e-*.mjs      # End-to-end tests
├── test-ts-strict.mjs  # TypeScript enforcement
└── sim/              # Worker simulation tests

```javascript

### Technology Stack

- **Language**: TypeScript 5.4.0 with strict mode

- **Runtime**: Node.js 18.17+ with ES modules

- **Package Manager**: pnpm 9.0.0 with workspace support

- **Build System**: TypeScript project references

- **Testing**: Custom tiny-runner (future: Vitest + Playwright)

- **Documentation**: Markdown with structured ADRs

## Development Workflow

### Quality Gates

1. **TypeScript Strict**: All code must pass strict type checking

1. **Test Suite**: Unit + Integration + E2E tests must pass

1. **Documentation**: Code changes require documentation updates

1. **Build Verification**: Full workspace must compile successfully

### Performance Optimizations

- **BUILD_ONCE**: Reduces test execution time by building once, testing multiple times

- **Incremental Builds**: TypeScript project references for faster compilation

- **Robust Tooling**: `require.resolve()` for reliable binary resolution

## Game Design Overview

**Genre**: Shooter-Idle
**Core Loop**: Combat → Arcana → Enchants → Progression
**Architecture**: PWA with offline-first design
**Platform**: Desktop/Mobile browsers with installable PWA

For complete game design, see [Draconia Chronicles v2
GDD](/Draconia*Chronicles*v2_GDD.md).

## Next Milestones

### Phase 1/16 — Core Determinism Engine (COMPLETED)

**P1-S1 Implementation**: Core determinism engine with comprehensive testing

- ✅ **P1-S1**: Core Determinism Engine (PCG32 RNG, fixed clock, snapshot system, protocol validation)

  - Deterministic RNG system with PCG32 and named streams

  - Fixed clock accumulator for 60Hz/2Hz timing

  - Snapshot stream codec and hasher for byte-equal determinism

  - Protocol validation layer with security guards

  - Comprehensive test matrix with unit, integration, and E2E tests

  - Engine bootstrap API and documentation

**Current Status**: Phase 1/16 complete. P1-S1 core determinism engine provides solid foundation for deterministic game simulation with comprehensive testing and validation. Ready for Phase 2/16 development.

### Phase 0 Success Criteria

- Base app cold start ≤ 2s desktop; base JS bundle ≤ 200 KB gz; logger layer ≤ 8 KB gz

- Deterministic worker sim (≥60fps desktop with UI disconnected)

- Dexie v1 schema + migrations scaffold; 3 profiles; export/import proven ✅

- Structured JSON logging; 2 MB / 10k rolling buffer; export; no PII beyond dragon name

- PWA installs; update toast on SW waiting ✅

- CI gates: typecheck, unit, integration, Playwright smoke, Lighthouse a11y ✅

### Development Timeline (16 Phases)

**Version Progression**: 0.0.1-alpha → 0.7.0-beta

#### **Major Milestones (0.#.0 releases)**

- **Phase 4/16** → 0.1.0-alpha (Foundation complete)

- **Phase 8/16** → 0.2.0-alpha (Core systems complete)

- **Phase 12/16** → 0.3.0-alpha (Gameplay complete)

- **Phase 16/16** → 0.7.0-beta (Full beta ready)

#### **Minor Releases (0.#.# releases)**

- **Phase 1/16** → 0.0.1-alpha ✅ (P1-S1 core determinism)

- **Phase 2/16** → 0.0.2-alpha (Next phase)

- **Phase 3/16** → 0.0.3-alpha

- **Phase 5/16** → 0.1.1-alpha

- **Phase 6/16** → 0.1.2-alpha

- **Phase 7/16** → 0.1.3-alpha

- **Phase 9/16** → 0.2.1-alpha

- **Phase 10/16** → 0.2.2-alpha

- **Phase 11/16** → 0.2.3-alpha

- **Phase 13/16** → 0.3.1-alpha

- **Phase 14/16** → 0.3.2-alpha

- **Phase 15/16** → 0.3.3-alpha

**Total Development Scope**: 16-phase development cycle reaching 0.7.0-beta for comprehensive game development

## Links and Resources

### Internal Documentation

- [Engineering Standards](/docs/engineering/testing.md) - Technical guidelines and policies

- [Architectural Decisions](/docs/adr/0001-testing-strategy.md) - Key technical decisions (ADRs)

- [Runbooks](/docs/runbooks/local-dev.md) - Operational procedures and setup guides

### External Resources

- [Game Design Document](/Draconia*Chronicles*v2_GDD.md) - Complete game design

- [Project Repository](https://github.com/edgarsdzgz/dragonChronicles) - Source code and issues

- [Development Guidelines](/CLAUDE.md) - Development processes and standards

---

Last updated: 2025-08-28

````
