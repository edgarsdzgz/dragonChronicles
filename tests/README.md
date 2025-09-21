# Test Suite

## Running Tests

### Individual Tests

- `npm run test:unit` - Unit tests for shared utilities

- `npm run test:integration` - Integration tests between packages

- `npm run test:e2e` - End-to-end build and sandbox tests

- `npm run test:ts-strict` - TypeScript strict mode enforcement

### All Tests

- `npm run test:all` - Runs all tests with BUILD_ONCE=1 optimization

## BUILD_ONCE Optimization

The test suite supports `BUILD_ONCE=1` environment variable to skip rebuilding when
running
multiple tests:

````bash

# Build once, then run all tests without rebuilding

tsc -b && BUILD*ONCE=1 npm run test:unit && BUILD*ONCE=1 npm run test:integration

```text

The `npm run test:all` script automatically uses this pattern for optimal performance.

## Test Infrastructure

- Uses custom `_tiny-runner.mjs` for simple test execution

- All tests use `require.resolve("typescript/bin/tsc")` for robust TypeScript binary resolution

- Consistent `stdio: "pipe"` handling for clean output

- Error assertions focus on exit codes and specific error codes (not full text matching)
````
