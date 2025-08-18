# S002-R1 Planning Document - Simplify & Refactor Strict-Mode Gate

## Issue Analysis

**Issue**: #13 (S002-R1: Simplify & Refactor the Strict-Mode Gate)  
**Goal**: Refactor the S002 strict TypeScript gate to be simpler, clearer, and less brittle while maintaining identical behavior and outcomes.

**Current State**:
- Working strict TypeScript test infrastructure from S002
- Test uses `require.resolve('typescript/bin/tsc')` (already good)
- Configs extend base tsconfig but could be more minimal
- Fixtures are in `tests/ts-strict/` directory
- Test script works but could be cleaner with helper function

**Key Requirements**:
- Must maintain exact same output: `ok - 2 passed` with exit code 0
- Keep same test behavior but improve code clarity
- Make tsconfigs minimal and explicit
- Improve determinism and accessibility
- No behavior changes to tiny runner output

## Implementation Plan

### Phase 1: Baseline & Analysis ✅
- [x] Create feature branch `feat/p0-s002-r1-simplify-strict-gate`
- [x] Create planning document
- [ ] Capture current baseline output

### Phase 2: Test Script Improvements
- [ ] Add clear documentation header explaining test intent
- [ ] Extract `runTscProject` helper function for DRY principle
- [ ] Ensure robust path resolution (already using `require.resolve`)
- [ ] Keep assertions focused on exit codes and error codes only

### Phase 3: Minimize TypeScript Configs
- [ ] Simplify both tsconfigs with minimal, explicit options:
  - `"strict": true`
  - `"noImplicitAny": true` 
  - `"noEmit": true`
  - `"skipLibCheck": true`
  - `"target": "ES2022"`
  - `"module": "ESNext"`
- [ ] Remove unused fields (outDir, declaration, references to base config)
- [ ] Add documentation comments explaining purpose
- [ ] Ensure precise includes pointing only to relevant fixtures

### Phase 4: Optional Fixture Organization
- [ ] Move fixtures to `tests/fixtures/strict/` for better organization
- [ ] Update tsconfig includes to point to new locations
- [ ] Ensure test script behavior remains unchanged

### Phase 5: Documentation & Comments
- [ ] Add header comment in test script explaining:
  - What "pass" test checks
  - What "fail" test checks  
  - Why we assert exit codes and error codes only
- [ ] Add purpose comments to each tsconfig

### Phase 6: Verification
- [ ] Run `node tests/test-ts-strict.mjs` → must output `ok - 2 passed`, exit 0
- [ ] Manual flip tests to ensure gates work properly
- [ ] Verify no regression in existing test suite

## Risk Assessment

**Low Risk**:
- Code organization and documentation improvements
- Helper function extraction (pure refactoring)
- Config simplification (removing unused options)

**Medium Risk**:
- Moving fixture files could break includes if not updated properly
- Changing tsconfig structure might affect compilation

**Mitigation Strategies**:
- Test after each change to ensure behavior unchanged
- Keep baseline output for comparison
- Make incremental changes with validation

## TODO List

### High Priority
1. [x] Capture current baseline output for comparison
2. [x] Add clear documentation to test script
3. [x] Extract helper function for TypeScript project execution
4. [x] Simplify and minimize both tsconfig files
5. [x] Add documentation comments to configs
6. [x] Move fixtures to better organized location
7. [x] Update config includes for new fixture paths
8. [x] Verify exact same behavior and output

### Verification Tasks
9. [x] `node tests/test-ts-strict.mjs` outputs exactly `ok - 2 passed`
10. [x] Exit code remains 0
11. [x] Manual flip test: break good.ts → pass test fails
12. [x] Manual flip test: fix bad-implicit-any.ts → fail test fails
13. [x] Full test suite still passes

## Implementation Summary

✅ **All tasks completed successfully**

**Key Improvements Made:**
- Added comprehensive documentation explaining test intent and approach
- Extracted `runTscProject` helper function for DRY principle  
- Simplified tsconfigs to be minimal, explicit, and self-contained
- Organized fixtures into `tests/fixtures/strict/` for better structure
- Maintained 100% behavioral compatibility

**Verification Results:**
- ✅ Exact same output: `ok - 2 passed` with exit code 0
- ✅ Manual flip tests confirm gates work properly
- ✅ Full test suite passes unchanged
- ✅ No regression in existing functionality

## Acceptance Criteria

**Must Pass**:
- [ ] `node tests/test-ts-strict.mjs` prints `ok - 2 passed` and exits 0
- [ ] Script uses `require.resolve('typescript/bin/tsc')` for robust path resolution
- [ ] Both tsconfigs are minimal, explicit, and use `noEmit: true`
- [ ] Error assertions match TS7006/TS7031 by code only
- [ ] If fixtures moved, paths updated only in tsconfigs
- [ ] Test behavior completely unchanged

**Code Quality Requirements**:
- [ ] Clear documentation explaining test intent
- [ ] Helper function reduces code duplication
- [ ] Minimal tsconfigs with precise includes
- [ ] No hard-coded paths or brittle assumptions
- [ ] Improved developer accessibility with comments

## Implementation Notes

This refactoring focuses on:
- **Clarity**: Better documentation and helper functions
- **Minimalism**: Leaner tsconfigs with only necessary options
- **Robustness**: No hard-coded paths or fragile assumptions
- **Organization**: Better file structure for fixtures
- **Maintainability**: Clear comments explaining purpose and behavior

The refactoring maintains 100% behavioral compatibility while improving code quality and developer experience.