<!-- markdownlint-disable -->

# Overview

Product summaries, architecture overviews, and project status for Draconia Chronicles v2.0.0.

## Project Status

**Version**: 2.0.0 (In Development)  
**Phase**: Phase 1 Ready (Phase 0 Repository Standards Complete)  
**Architecture**: TypeScript Monorepo with Strict Mode Enforcement  
**Workpack Model**: Consolidated development approach (W1-W12)

## Key Metrics

### Test Coverage

- **Unit Tests**: ✅ Shared utilities and constants
- **Integration Tests**: ✅ Cross-package communication
- **E2E Tests**: ✅ Full build pipeline and CLI contracts
- **TypeScript Strict Gate**: ✅ Type safety enforcement

### Documentation Status

- **Engineering Standards**: ✅ Complete ([Testing](/docs/engineering/testing.md), [TypeScript](/docs/engineering/typescript.md))
- **Architectural Decisions**: ✅ ADRs 0001-0002 documented
- **Runbooks**: ✅ [Local Development](/docs/runbooks/local-dev.md), [CI/CD](/docs/runbooks/ci.md)
- **Player Documentation**: ❌ Not yet implemented

### Code Quality

- **TypeScript Strict Mode**: ✅ Enforced across all packages
- **Build System**: ✅ Incremental compilation with project references
- **Test Optimization**: ✅ BUILD_ONCE pattern reduces build time 3x

## Architecture Summary

### Monorepo Structure

```
packages/           # Shared libraries
├── shared/        # Common utilities, constants
├── logger/        # Structured logging system
├── db/           # Database layer (IndexedDB)
└── sim/          # Game simulation engine

apps/              # Applications
└── sandbox/      # CLI testing and contracts

tests/             # Test infrastructure
├── _tiny-runner.mjs    # Custom test runner
├── test-unit-*.mjs     # Unit tests
├── test-integration-*.mjs  # Integration tests
├── test-e2e-*.mjs      # End-to-end tests
└── test-ts-strict.mjs  # TypeScript enforcement
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

### Phase 0 — Repository Standards (COMPLETED ✅)

**Workpack Structure**: Individual stories (S001-S004) consolidated into comprehensive workpack W1

- ✅ **S001**: Testing Strategy Implementation (pnpm monorepo, TypeScript strict mode)
- ✅ **S002**: TypeScript Strict Enforcement (project references, build optimization)  
- ✅ **S003**: ESLint + Prettier Integration (TypeScript + Svelte support)
- ✅ **S004**: Git Hooks & Conventional Commits (Husky v9+, commitlint)
- ✅ **W1**: Repository Standards & Hygiene (GitHub templates, CODEOWNERS, size budgets)

**Key Outcomes**: Production-ready monorepo with strict TypeScript, automated quality gates, conventional commits, and comprehensive testing infrastructure.

### Upcoming Phases

- **Phase 1**: Core Game Loop Implementation (W2-W4)
- **Phase 2**: UI/UX Development with SvelteKit (W5-W7)  
- **Phase 3**: Performance Optimization and Polish (W8-W10)
- **Phase 4**: Player Documentation and Onboarding (W11-W12)

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

Last updated: 2025-08-23
