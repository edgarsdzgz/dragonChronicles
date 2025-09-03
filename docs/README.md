# Draconia Chronicles Documentation

Welcome to the Draconia Chronicles documentation hub. This documentation covers the v2.0.0
architecture, processes, and engineering standards.

## Navigation

### 📋 [Overview](./overview/README.md)

Product summaries, architecture overviews, and project status:

- [Project Overview](./overview/README.md) - Status, metrics, architecture
- [Changelog](./overview/changelog.md) - v2.0.0 release notes and versioning

### 🔧 Engineering

Development standards, policies, and technical guidelines:

- [Testing Strategy](./engineering/testing.md) - Test layers, runner behavior, execution guide
- [TypeScript Standards](./engineering/typescript.md) - Strict mode policy, examples, best practices
- [Database Persistence](./engineering/database-persistence.md) - Dexie integration, schema design,
  atomic operations
- [Structured Logging](./engineering/structured-logging.md) - Ring buffer, Dexie sink, PII redaction,
  performance monitoring

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

### 🎨 UI

Design specifications, wireframes, and visual guidelines.

---

## Contributing to Documentation

All code changes that affect packages, apps, or tests require corresponding documentation
updates.

### Quick Links

- [ADR Template](./adr/TEMPLATE.md) - For documenting architectural decisions
- [Testing Documentation](./engineering/testing.md) - Current test strategy and execution
- [TypeScript Guidelines](./engineering/typescript.md) - Strict mode enforcement and examples
