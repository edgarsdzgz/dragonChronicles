<!-- markdownlint-disable -->
# Changelog

All notable changes to Draconia Chronicles v2.0.0 will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Comprehensive documentation system with engineering standards
- ADR system for architectural decisions
- PR template with required docs checkboxes
- CI enforcement for documentation presence

## [2.0.0] - TBD

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

- **v2.0.0 Focus**: This changelog covers the ground-up v2.0.0 rewrite only
- **Legacy Exclusion**: v1.x documentation and changes are not migrated
- **Release Cadence**: Updated with each sprint/phase completion
- **Format**: Follows Keep a Changelog format for consistency

## Related Issues

- #15: Centralize Game Documentation: Developer & Player Dual Structure
- S001: Testing Strategy Implementation  
- S002: TypeScript Strict Enforcement