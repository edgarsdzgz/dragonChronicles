<!-- markdownlint-disable -->
# Testing Strategy

This document describes the current testing approach for Draconia Chronicles v2.0.0,
including test layers, execution patterns, and the tiny-runner implementation.

## Test Layers


### Unit Tests

**Purpose**: Test individual functions and utilities in isolation
**Scope**: Single package functionality, pure functions, data transformations
**Location**: `tests/test-unit-*.mjs`
**Example**: `tests/test-unit-shared.mjs` tests the `clamp()` function and version
constants

**Current Implementation**:

- Import from compiled `dist/` artifacts (temporary approach)
- Build target package with `tsc -b packages/shared` (skipped with BUILD_ONCE=1)
- Test isolated utility functions and constants
- Assert exact values and boundary conditions


### Integration Tests

**Purpose**: Test interactions between packages and system components
**Scope**: Cross-package dependencies, logger integration, worker communication
**Location**: `tests/test-integration-*.mjs`
**Example**: `tests/test-integration-graph.mjs` tests logger + simulation package
interaction

**Current Implementation**:

- Build multiple dependencies: `packages/shared`, `packages/logger`, `packages/sim`
- Import from compiled artifacts to test real integration
- Verify cross-package contracts and data flow
- Assert message passing and state coordination


### End-to-End Tests

**Purpose**: Test full build pipeline and application contracts
**Scope**: Complete workspace builds, CLI output, JSON contracts
**Location**: `tests/test-e2e-*.mjs`
**Example**: `tests/test-e2e-build.mjs` builds workspace and tests sandbox CLI output

**Current Implementation**:

- Execute full workspace build with `tsc -b`
- Run compiled applications (e.g., `apps/sandbox/dist/index.js`)
- Validate CLI contracts and JSON output formats
- Ensure artifacts exist at expected locations


### TypeScript Strict Gate

**Purpose**: Enforce TypeScript strict mode compliance
**Scope**: Type safety, implicit any detection, configuration validation
**Location**: `tests/test-ts-strict.mjs`
**Details**: See [TypeScript Standards](./typescript.md)

## Tiny Runner Implementation


### Design Philosophy

- **Derived results**: Test outcomes determine output, not hard-coded messages
- **Exit codes**: 0 for success, 1 for failure (CI-compatible)
- **No lies**: Never print "ok" when tests actually failed


### Usage Pattern

```javascript
import { test, run } from "./_tiny-runner.mjs";

test("descriptive test name", () => {
  // Your assertions here using Node assert/strict
});

await run(); // Handles exit codes and reporting
```



### Output Format

- **Success**: `ok - N passed` (exit code 0)
- **Failure**: `FAIL - N failed, M passed` (exit code 1)
- **Count-based**: Shows exact test execution summary


### ❌ Anti-Pattern

```javascript
// DON'T: This lies about results
assert.equal(someFunction(), expectedValue);
console.log("UNIT(shared): ok"); // Always prints even if assert failed
```



### ✅ Correct Pattern

```javascript
// DO: Let the runner derive and report results
test("function works correctly", () => {
  assert.equal(someFunction(), expectedValue);
});
await run(); // Prints accurate results based on test outcomes
```


## How to Run Tests


### All Tests (Cross-Platform)

```bash
node tests/run-all.mjs
# Driver builds once, then runs all tests with BUILD_ONCE=1
# Result: ok - 2/2/3/2 passed (unit/integration/e2e/strict)
```



### Individual Test Files

```bash
pnpm run test:unit          # Unit tests only
pnpm run test:integration   # Integration tests only
pnpm run test:e2e          # End-to-end tests only
pnpm run test:ts-strict    # TypeScript strict gate only
```



### Manual Execution

```bash
# Run single test file directly
node tests/test-unit-shared.mjs

# With build optimization (after running driver or manual build)
BUILD_ONCE=1 node tests/test-unit-shared.mjs
```


## BUILD_ONCE Optimization


### Problem

Running `pnpm run test:all` triggers multiple TypeScript builds:

1. Unit tests: `tsc -b packages/shared`
2. Integration tests: `tsc -b packages/shared packages/logger packages/sim`
3. E2E tests: `tsc -b` (full workspace)


### Solution

Use the cross-platform driver which handles build-once optimization:

```bash
# Driver builds once, then runs all tests with BUILD_ONCE=1
node tests/run-all.mjs
```



### Implementation

Test files check environment variable:

```javascript
if (process.env.BUILD_ONCE !== "1") {
  const built = spawnSync("node", [tscBin, "-b", "packages/shared"], 
    { stdio: "pipe", encoding: "utf8" });
  assert.equal(built.status, 0, "Build failed");
}
```


## Failure Triage


### Test Execution Failures

1. **Check exit codes**: Non-zero indicates test failure
2. **Read tiny-runner output**: Shows which specific tests failed
3. **Run individual tests**: Isolate failing test file
4. **Check assertions**: Review assertion error messages


### Build Failures

1. **TypeScript errors**: Check `tsc -b` output for compilation errors
2. **Missing dependencies**: Ensure `pnpm install` completed successfully
3. **Path resolution**: Verify `require.resolve("typescript/bin/tsc")` works


### Common Issues

- **Silent failures**: Check that tests use tiny-runner, not hard-coded output
- **Build caching**: Clear `dist/` folders if seeing stale build artifacts
- **Path issues**: Ensure tests run from project root directory

## Migration Roadmap


### Current State (Phase 1)

- ✅ Custom tiny-runner with Node scripts
- ✅ Import from compiled `dist/` artifacts
- ✅ BUILD_ONCE optimization for performance
- ✅ TypeScript strict gate enforcement

### Future Phases


#### Phase 2: Vitest Migration (Unit/Integration)

- **Target**: Q4 2025 or when test complexity increases
- **Benefits**: Built-in mocking, coverage reporting, watch mode, better assertions
- **Scope**: Migrate unit and integration tests to Vitest
- **Imports**: Direct source imports instead of compiled artifacts


#### Phase 3: Playwright Integration (E2E)

- **Target**: When UI testing becomes critical
- **Benefits**: Real browser testing, visual regression, user interaction simulation
- **Scope**: True end-to-end testing with browser automation
- **Complements**: Vitest for unit/integration, Playwright for UI E2E


#### Phase 4: Framework Standardization

- **Target**: After Phases 2-3 complete
- **Action**: Remove custom tiny-runner infrastructure
- **Result**: Industry-standard testing stack with full tooling support

## Configuration Files


### Test Scripts (package.json)

```json
{
  "test:unit": "node tests/test-unit-shared.mjs",
  "test:integration": "node tests/test-integration-graph.mjs", 
  "test:e2e": "node tests/test-e2e-build.mjs",
  "test:ts-strict": "node tests/test-ts-strict.mjs",
  "test:all": "node tests/run-all.mjs"
}
```



### Test File Locations

```text
tests/
├── _tiny-runner.mjs           # Test runner implementation
├── test-unit-shared.mjs       # Unit tests for shared package
├── test-integration-graph.mjs # Integration tests across packages
├── test-e2e-build.mjs        # End-to-end build and CLI tests
├── test-ts-strict.mjs        # TypeScript strict mode gate
├── fixtures/strict/          # TypeScript test fixtures
└── ts-strict/               # TypeScript gate configurations
```


See [ADR-0001: Testing Strategy](../adr/0001-testing-strategy.md) for the architectural
decision record.