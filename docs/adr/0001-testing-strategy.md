<!-- markdownlint-disable -->
# ADR 0001: Testing Strategy

**Date**: 2025-08-18  
**Status**: Accepted

## Context

In the early phase of Draconia Chronicles v2.0.0 development, we need deterministic test execution without the overhead of a full testing framework. The project requires:

- Fast feedback loops during development
- Clear pass/fail indicators for CI/CD
- Simple test execution without complex setup
- Foundation for future migration to full testing frameworks

The codebase uses a monorepo structure with TypeScript packages that need unit, integration, and end-to-end testing coverage.

## Decision

Implement a **tiny-runner + Node scripts** testing approach with the following architecture:

### Test Layers

1. **Unit Tests**: Test individual functions and utilities from source/dist
2. **Integration Tests**: Test interactions between packages
3. **End-to-End Tests**: Test full build pipeline and CLI contracts

### Tiny Runner Behavior

- Derived test summaries with proper exit codes
- No hard-coded "OK" messages that lie about results  
- Output format: `ok - N passed` or `FAIL - N failed, N passed`
- Exit code 0 for success, 1 for failure

### Execution Commands

- `pnpm run test:all` - Run all tests with BUILD_ONCE=1 optimization
- `pnpm run test:unit` - Unit tests only
- `pnpm run test:integration` - Integration tests only
- `pnpm run test:e2e` - End-to-end tests only
- `pnpm run test:ts-strict` - TypeScript strict mode enforcement

## Consequences

### Positive

- **Fast feedback**: Minimal overhead, quick execution
- **Easy CI integration**: Simple exit codes, no complex configuration
- **Developer-friendly**: Clear output, easy to run individual tests
- **Foundation**: Establishes testing patterns for future framework migration

### Negative

- **Limited features**: No built-in mocking, coverage, or advanced assertions
- **Manual maintenance**: Test runner and utilities are project-specific
- **Migration required**: Eventually need to move to Vitest/Playwright

### Migration Path

- **Phase 1**: Current tiny-runner approach (implemented)
- **Phase 2**: Migrate unit/integration tests to Vitest for better tooling
- **Phase 3**: Add Playwright for true UI end-to-end testing
- **Phase 4**: Remove custom tiny-runner in favor of standard tools

### Operational Impact

- All PRs must pass `pnpm run test:all`
- Test files follow pattern: `tests/test-*.mjs`
- BUILD_ONCE=1 environment variable optimizes multi-test execution
- Tests use `require.resolve("typescript/bin/tsc")` for robust binary resolution
