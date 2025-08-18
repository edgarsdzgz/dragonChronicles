# Claude Development Guidelines

This file contains important guidelines and patterns for working on the Draconia Chronicles project.

## Testing Guidelines

### Exit Codes and Output

**Don't add a naked `console.log("ok")` at the end—that lies about the result.** The runner already prints derived results and sets the exit code correctly.

❌ **WRONG:**
```javascript
assert.equal(someFunction(), expectedValue);
console.log("UNIT(shared): ok"); // Meaningless - always prints even if asserts failed
```

✅ **CORRECT:**
```javascript
test("function works correctly", () => {
  assert.equal(someFunction(), expectedValue);
});
await run(); // Prints "ok - 1 passed" or "FAIL - 1 failed" with proper exit codes
```

### Current Test Architecture

These scripts currently build and import from `dist/`. That's fine for now, but when we move to Vitest/Playwright we'll import source for unit/integration and run a browser for true UI E2E. (This file set is focused on quick smoke/unit/integration checks and a build-level E2E.)

**Current Pattern:**
- **Unit tests:** Build specific packages, import from `dist/`, test isolated functions
- **Integration tests:** Build dependencies, import from `dist/`, test package interactions  
- **E2E tests:** Build workspace, run compiled sandbox app, test CLI contracts

**Future Migration:**
- **Unit/Integration:** Direct source imports via Vitest for faster feedback
- **E2E:** Browser-based testing via Playwright for real UI validation

### Test Structure

Use the tiny test runner for structured, countable tests:

```javascript
import { test, run } from "./_tiny-runner.mjs";

test("descriptive test name", () => {
  // Your assertions here
});

test("another test case", () => {
  // More assertions
});

await run(); // Handles exit codes and reporting
```

This ensures:
- ✅ Proper exit codes (0 = pass, 1 = fail)
- ✅ Meaningful output ("ok - 2 passed" vs "FAIL - 1 failed, 1 passed")
- ✅ CI/pnpm compatibility
- ✅ Individual test case tracking

## Build Optimization Notes

### Current Build Pattern
The current test scripts trigger TypeScript compilation multiple times:
1. Unit tests build specific packages (`tsc -b packages/shared`)  
2. Integration tests build dependencies (`tsc -b packages/shared packages/logger packages/sim`)
3. E2E tests build entire workspace (`tsc -b`)

This results in multiple rebuilds of the same packages during `test:all`.

### Future Optimization Options
- **SKIP_BUILD environment variable:** Allow tests to skip compilation when artifacts are known to be current
- **Workspace scripts:** Use `pnpm --filter` patterns instead of direct TypeScript paths for better dependency management
- **Build-once pattern:** Run full workspace build once, then run all tests against existing artifacts

Example improved pattern:
```bash
# Instead of rebuilding per test
npm run build  # Once
SKIP_BUILD=1 npm run test:all  # Skip rebuilds
```