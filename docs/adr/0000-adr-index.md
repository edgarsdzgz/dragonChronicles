<!-- markdownlint-disable -->

# ADR Index: Architecture Decision Records

**Date**: 2025-09-06
**Status**: Active

## Overview

This index provides a comprehensive list of all Architecture Decision Records (ADRs) for
Draconia
Chronicles
v2.0.0..
ADRs document the architectural decisions made during the foundational workpacks (W1-W5)
and
establish
the
technical
foundation
for
the
project.

## ADR List

### Foundation & Standards

- **[ADR-0001: Testing Strategy](./0001-testing-strategy.md)** - Custom tiny-runner testing approach with BUILD_ONCE optimization

- **[ADR-0002: TypeScript Strict Gate](./0002-typescript-strict-gate.md)** - Automated TypeScript strict mode enforcement

### Core Architecture Decisions

- **[ADR-0003: Monorepo Structure](./0003-monorepo.md)** - pnpm workspace-based monorepo with TypeScript project references

- **[ADR-0004: Worker Simulation Architecture](./0004-worker-sim.md)** - Web Workers for game simulation with protocol v1

- **[ADR-0005: Database Choice - Dexie v1](./0005-dexie-v1.md)** - IndexedDB with Dexie for client-side persistence

- **[ADR-0006: Logging Architecture v1](./0006-logging-v1.md)** - Structured logging with ring buffer and PII redaction

- **[ADR-0007: PWA Implementation](./0007-pwa.md)** - Progressive Web App with Workbox and offline simulation

- **[ADR-0008: Size Budgets & Performance](./0008-size-budgets.md)** - Bundle size constraints and performance targets

## Decision Categories

### **Development Infrastructure**

- Testing strategy and tooling

- TypeScript strict mode enforcement

- Monorepo structure and build system

### **Core Game Architecture**

- Worker-based simulation system

- Client-side database persistence

- Structured logging and monitoring

### **User Experience**

- Progressive Web App capabilities

- Offline functionality

- Performance optimization

## Related Documentation

- [Development Workflow](../engineering/development-workflow.md) - Implementation practices

- [Testing Strategy](../engineering/testing.md) - Detailed testing approach

- [TypeScript Standards](../engineering/typescript.md) - Type safety requirements

- [Database Persistence](../engineering/database-persistence.md) - W4 implementation details

- [Structured Logging](../engineering/structured-logging.md) - W5 implementation details

- [PWA Implementation](../engineering/pwa-implementation.md) - W6 implementation details

## ADR Maintenance

### Adding New ADRs

1. Use the next sequential number (e.g., 0009, 0010)

1. Follow the [ADR Template](./TEMPLATE.md) structure

1. Update this index with the new ADR entry

1. Ensure markdown linting passes

### Updating Existing ADRs

1. Change status to "Superseded by ADR-XXXX" when replaced

1. Create new ADR with updated decision

1. Update cross-references in related ADRs

1. Update this index if needed

### Review Process

- ADRs should be reviewed during major architectural changes

- Cross-reference related ADRs when making updates

- Ensure decisions align with project goals and constraints

---

**Last Updated**: 2025-09-06
**Total ADRs**: 8 (0001-0008)
