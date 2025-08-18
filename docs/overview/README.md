# Overview

Product summaries, architecture overviews, and project status for Draconia Chronicles v2.0.0.

## Project Status

**Version**: 2.0.0 (In Development)  
**Phase**: MVP Development with Shooter-Idle Focus  
**Architecture**: TypeScript Monorepo with Strict Mode Enforcement

## Key Metrics

### Test Coverage
- **Unit Tests**: ✅ Shared utilities and constants
- **Integration Tests**: ✅ Cross-package communication
- **E2E Tests**: ✅ Full build pipeline and CLI contracts
- **TypeScript Strict Gate**: ✅ Type safety enforcement

### Documentation Status
- **Engineering Standards**: ✅ Complete ([Testing](../engineering/testing.md), [TypeScript](../engineering/typescript.md))
- **Architectural Decisions**: ✅ ADRs 0001-0002 documented
- **Runbooks**: ✅ [Local Development](../runbooks/local-dev.md), [CI/CD](../runbooks/ci.md)
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

For complete game design, see [Draconia Chronicles v2 GDD](../../Draconia_Chronicles_v2_GDD.md).

## Next Milestones

### Current Phase (Phase 0)
- ✅ **S001**: Testing Strategy Implementation
- ✅ **S002**: TypeScript Strict Enforcement
- ✅ **Documentation**: Engineering standards and processes

### Upcoming Phases
- **Phase 1**: Core Game Loop Implementation
- **Phase 2**: UI/UX Development with SvelteKit
- **Phase 3**: Performance Optimization and Polish
- **Phase 4**: Player Documentation and Onboarding

## Links and Resources

### Internal Documentation
- [Engineering Standards](../engineering/) - Technical guidelines and policies
- [Architectural Decisions](../adr/) - Key technical decisions (ADRs)
- [Runbooks](../runbooks/) - Operational procedures and setup guides

### External Resources
- [Game Design Document](../../Draconia_Chronicles_v2_GDD.md) - Complete game design
- [Project Repository](https://github.com/edgarsdzgz/dragonChronicles) - Source code and issues
- [Development Guidelines](../../CLAUDE.md) - Development processes and standards

---

Last updated: 2025-08-18