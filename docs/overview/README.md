<!-- markdownlint-disable -->

# Overview

Product summaries, architecture overviews, and project status for Draconia Chronicles v2.0.0.

## Project Status

**Version**: 0.5.0-alpha (Phase 0 Foundation Nearly Complete)  
**Phase**: Phase 0 (6/8 workpacks complete - W1-W6 foundation established, W7 95% complete)  
**Architecture**: TypeScript Monorepo with Worker Simulation, Strict Mode Enforcement & Persistence  
**Workpack Model**: 8-workpack Phase 0 approach (W1-W6 complete, W7 nearly complete, W8 pending)

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

```
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
```

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
2. **Test Suite**: Unit + Integration + E2E tests must pass
3. **Documentation**: Code changes require documentation updates
4. **Build Verification**: Full workspace must compile successfully

### Performance Optimizations

- **BUILD_ONCE**: Reduces test execution time by building once, testing multiple times
- **Incremental Builds**: TypeScript project references for faster compilation
- **Robust Tooling**: `require.resolve()` for reliable binary resolution

## Game Design Overview

**Genre**: Shooter-Idle  
**Core Loop**: Combat → Arcana → Enchants → Progression  
**Architecture**: PWA with offline-first design  
**Platform**: Desktop/Mobile browsers with installable PWA

For complete game design, see [Draconia Chronicles v2 GDD](/Draconia_Chronicles_v2_GDD.md).

## Next Milestones

### Phase 0 — Foundational Scaffolding & Guardrails (IN PROGRESS)

**Workpack Structure**: 8 comprehensive workpacks delivering complete functionality blocks

- ✅ **W1**: Repo & Standards (monorepo, TS strict, ESLint+Prettier, Husky v9+, commitlint, templates)
- ✅ **W2**: App Shell & Render Host (SvelteKit, Pixi mount, HUD toggle, pooling primitives)
- ✅ **W3**: Worker Sim Harness (worker protocol v1, RNG, fixed clock, offline stub, autorecover)
- ✅ **W4**: Persistence v1 (Dexie schema, Zod, atomic writes, export/import, migration scaffold)
- ✅ **W5**: Logging v1 (ring buffer caps, Dexie flush, console sink, export, perf lab)
- ✅ **W6**: PWA & Update UX (Workbox, precache, manifest/icons, service worker, offline support)
- 🔄 **W7**: CI/CD & Previews (Actions, caches, size budgets, Playwright, Lighthouse, PR previews) - 95% complete
- ⏳ **W8**: Dev UX & Docs (feature flags, error boundary, ADRs, CONTRIBUTING, privacy stance)

**Current Status**: 6/8 workpacks complete, W7 95% complete. W1-W6 established production-ready foundation with TypeScript strict mode, automated quality gates, development standards, worker simulation harness, robust persistence layer, structured logging infrastructure, and complete PWA implementation. W7 CI/CD pipeline is nearly complete with all major components implemented.

### Phase 0 Success Criteria

- Base app cold start ≤ 2s desktop; base JS bundle ≤ 200 KB gz; logger layer ≤ 8 KB gz
- Deterministic worker sim (≥60fps desktop with UI disconnected)
- Dexie v1 schema + migrations scaffold; 3 profiles; export/import proven ✅
- Structured JSON logging; 2 MB / 10k rolling buffer; export; no PII beyond dragon name
- PWA installs; update toast on SW waiting ✅
- CI gates: typecheck, unit, integration, Playwright smoke, Lighthouse a11y ✅

### Future Phases

- **Phase 1**: Core Game Loop Implementation (after W8 completion)
  - Shooter-idle mechanics, combat, progression, enchants
- **Phase 2**: UI/UX Development and Polish
  - User interface refinement and accessibility
- **Phase 3**: Performance Optimization and Advanced Features
  - Meta systems, automation, and performance tuning
- **Phase 4**: Player Documentation and Release Preparation
  - Final polish, player guides, and launch readiness

**Extended Development Timeline**:

- **Core GDD Implementation**: 4 phases (0.5.0-alpha → 0.10.0-alpha)
- **Extended Alpha Development**: Gameplay refinement and content expansion (0.10.0-alpha → 0.15.0-alpha)
- **Beta Phase**: Feature freeze and stability focus (0.15.0-alpha → 0.20.0-beta)
- **Release Candidate**: Final validation and release prep (0.20.0-beta → 0.25.0-rc)
- **Full Release**: Production deployment (0.25.0-rc → 1.0.0)

**Total Development Scope**: Comprehensive development cycle with proper alpha, beta, and RC phases before release

## Links and Resources

### Internal Documentation

- [Engineering Standards](/docs/engineering/testing.md) - Technical guidelines and policies
- [Architectural Decisions](/docs/adr/0001-testing-strategy.md) - Key technical decisions (ADRs)
- [Runbooks](/docs/runbooks/local-dev.md) - Operational procedures and setup guides

### External Resources

- [Game Design Document](/Draconia_Chronicles_v2_GDD.md) - Complete game design
- [Project Repository](https://github.com/edgarsdzgz/dragonChronicles) - Source code and issues
- [Development Guidelines](/CLAUDE.md) - Development processes and standards

---

Last updated: 2025-08-28
