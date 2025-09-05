<!-- markdownlint-disable -->

# Changelog

All notable changes to Draconia Chronicles v0.5.0-alpha will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **W4**: Persistence v1 Implementation
  - Complete Dexie (IndexedDB) integration with v1 schema
  - Zod validation for runtime type safety and data integrity
  - Atomic write operations with double-buffer strategy
  - Export/import functionality with checksum validation
  - Migration scaffolding for future schema evolution
  - W3 time accounting integration (lastSimWallClock, bgCoveredMs)
  - Development tools (nuke-idb.mjs, seed-profiles.mjs)
  - Comprehensive test suite (70 tests, 32 passing core functionality)

- **W5**: Logging v1 Implementation
  - Structured logging system with tiny, tree-shakeable API (≤8 KB gz)
  - In-memory ring buffer with configurable byte/entry caps (2 MB / 10k entries)
  - Dexie persistence sink with batch flushing and table pruning
  - Development console sink for debugging
  - PII redaction with only dragonName allowed in data fields
  - NDJSON export with performance monitoring lab
  - Comprehensive test suite (124 tests, 100% pass rate)

- **W6**: PWA & Update UX Implementation ✅
  - Complete Progressive Web App with installation and offline capabilities
  - Workbox-based service worker with comprehensive caching strategies
  - Update detection and user-controlled update flow with notification toast
  - PWA installation prompt with cross-platform compatibility
  - Complete icon set (72x72 to 512x512) with maskable variants for all platforms
  - TypeScript integration with svelte-preprocess for type-safe PWA components
  - SSR compatibility ensuring proper server-side rendering
  - Production-ready build pipeline with PWA asset generation

- **W7**: CI/CD & Previews Implementation (95% Complete)
  - Complete GitHub Actions CI/CD pipeline with quality gates
  - Size budget enforcement (base ≤200KB gz, logger ≤8KB gz) - all budgets met
  - E2E Playwright testing with smoke tests and browser caching
  - Lighthouse CI with accessibility monitoring (≥95% threshold)
  - PR preview deployment with GitHub Pages and unique URLs
  - BASE_PATH configuration for proper asset resolution
  - Comprehensive artifact upload for debugging and reports
  - Production deployment automation for main branch

- Comprehensive documentation system with engineering standards
- ADR system for architectural decisions
- PR template with required docs checkboxes
- CI enforcement for documentation presence

## [1.0.0] - TBD (After Extended Development Cycle - GDD + Alpha + Beta + RC Complete)

### Added

- **S001**: Testing Strategy Implementation
  - Custom tiny-runner test infrastructure
  - BUILD_ONCE optimization for faster test execution
  - Unit, integration, and E2E test layers
  - TypeScript strict gate enforcement

- **S002**: TypeScript Strict Enforcement
  - Strict mode compliance across all packages
  - Automated type safety validation
  - Error code assertions for robust enforcement
  - Comprehensive TypeScript standards documentation

### Documentation

- First-class documentation system under `/docs`
- Engineering standards for testing and TypeScript
- Architectural Decision Records (ADRs)
- Local development and CI/CD runbooks
- Project overview and status tracking

### Infrastructure

- Monorepo structure with TypeScript project references
- pnpm workspace configuration
- Incremental compilation with build optimization
- Documentation tooling (lint, link checking, presence validation)

---

## Versioning Policy

- **v0.5.0-alpha Focus**: This changelog covers the ground-up v0.5.0-alpha rewrite only
- **Legacy Exclusion**: v1.x documentation and changes are not migrated
- **Release Cadence**: Updated with each workpack completion (W1-W8) and phase milestone
- **Format**: Follows Keep a Changelog format for consistency
- **Alpha Status**: Not feature-complete; core gameplay loop not yet implemented

## Related Issues

- #15: Centralize Game Documentation: Developer & Player Dual Structure
- S001: Testing Strategy Implementation
- S002: TypeScript Strict Enforcement
- W4: Persistence v1 Implementation
