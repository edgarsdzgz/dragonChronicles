<!-- markdownlint-disable -->

# ADR 0002: TypeScript Strict Gate

**Date**: 2025-08-18
**Status**: Accepted

## Context

To prevent TypeScript entropy and maintain code quality, we need to enforce type safety
early in the development process. The project requires:

- Consistent TypeScript strict mode across all packages

- Automated enforcement to catch violations before they reach production

- Clear feedback to developers about type violations

- Extensible system for adding additional TypeScript rules

Without automated enforcement, TypeScript strictness degrades over time as developers
bypass type checking or introduce implicit any types.

## Decision

Implement a **pass/fail TypeScript strict gate** with separate project compilation and
error code assertions:

### Strict Policy Configuration

- **Required flags**: `strict: true`, `noImplicitAny: true`, `exactOptionalPropertyTypes: true`

- **Compilation**: `noEmit: true`, `skipLibCheck: true`

- **Target/Module**: `ES2022`/`ESNext` for modern compatibility

- **Minimal includes**: Point only to relevant test fixtures

### Gate Implementation

- **Test command**: `node tests/test-ts-strict.mjs`

- **Test fixtures**: `tests/fixtures/strict/good.ts` and `tests/fixtures/strict/bad-implicit-any.ts`

- **Configuration files**:
  - `tests/ts-strict/tsconfig.strict.should-pass.json` - Tests good TypeScript

  - `tests/ts-strict/tsconfig.strict.should-fail.json` - Tests bad TypeScript

### Assertion Strategy

- **Exit codes**: Assert compilation success (0) vs failure (non-zero)

- **Error codes**: Assert specific TS error codes (TS7006, TS7031) for implicit any

  violations

- **No string matching**: Avoid brittle full-text error message assertions

- **Robust tooling**: Use `require.resolve("typescript/bin/tsc")` for binary

  resolution

## Consequences

### Positive

<<<<<<< HEAD

- **Immediate feedback**: Developers get clear type error messages during

  # development

- **Immediate feedback**: Developers get clear type error messages during development

  > > > > > > > main

- **Automated enforcement**: CI fails on type violations, preventing merge

- **Extensible**: Easy to add more strict TypeScript rules and fixtures

- **Non-brittle**: Error code assertions are stable across TypeScript versions

<<<<<<< HEAD

### Negative

=======

### Negative (2)

> > > > > > > main

- **Additional overhead**: Extra test execution time for TypeScript compilation

- **Maintenance**: Test fixtures need updates when adding new type patterns

- **Learning curve**: Developers must understand strict TypeScript requirements

### Operational Impact

- All PRs must pass strict gate: `pnpm run test:ts-strict`

- New type patterns require corresponding test fixtures

- TypeScript configuration changes need gate validation

- Error code documentation helps developers understand violations

### Current Implementation

<<<<<<< HEAD

- **Good fixture**: `tests/fixtures/strict/good.ts` - Properly typed function with

  optional properties

- **Bad fixture**: `tests/fixtures/strict/bad-implicit-any.ts` - Function parameters

  # with implicit any

- **Good fixture**: `tests/fixtures/strict/good.ts` - Properly typed function with optional properties

- **Bad fixture**: `tests/fixtures/strict/bad-implicit-any.ts` - Function parameters with implicit any

  > > > > > > > main

- **Gate test**: `tests/test-ts-strict.mjs` - Validates both pass and fail scenarios

- **Integration**: Included in `pnpm run test:all` execution
