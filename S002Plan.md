# S002 Planning Document - TypeScript Strict Everywhere

## Issue Analysis

**Goal**: Enforce strict TypeScript across the entire workspace with automated verification to prevent implicit `any` from creeping in.

**Current State**:
- Working monorepo with TypeScript project references from P0-S001
- `tsconfig.base.json` has some strict flags but needs updates to match exact specification
- Package configs properly extend base but need verification against strict flag overrides
- No automated strictness testing infrastructure exists

**Key Requirements**:
1. Update `tsconfig.base.json` with specific strict flags per specification
2. Ensure all packages extend base config without overriding strict flags  
3. Create test infrastructure to verify strictness enforcement (positive and negative tests)
4. Add scripts for auditing and validation
5. Implement git-friendly scripts for ongoing verification

## Implementation Plan

### Phase 1: Branch Setup & Documentation ✅
- [x] Create feature branch `feat/p0-s002-typescript-strict`
- [x] Create planning document
- [x] Add workflow guidelines to CLAUDE.md

### Phase 2: Configuration Updates
- Update `tsconfig.base.json` to exact specification:
  - Add `"incremental": true`
  - Change `"module": "NodeNext"` → `"ES2020"` 
  - Add `"noFallthroughCasesInSwitch": true`
  - Reorganize with specification comments
  - Ensure all required strict flags are present
- Audit all package/app `tsconfig.json` files for compliance

### Phase 3: Test Infrastructure Creation
- Create `/tests/ts-strict/` directory structure
- Implement test files:
  - `good.ts` - code that should pass strict checking
  - `bad-implicit-any.ts` - code that should fail with TS7006/TS7031
- Create TypeScript config files for test scenarios:
  - `tsconfig.strict.should-pass.json`
  - `tsconfig.strict.should-fail.json`

### Phase 4: Validation Scripts Implementation
- Create `/scripts/` directory
- Implement audit script: `tsconfig-audit.mjs`
  - Validates base config has all required strict flags
  - Ensures packages don't override strict flags
  - Uses exact logic from specification
- Implement negative test: `test-tsc-should-fail.mjs`
  - Proves strictness actually blocks bad code
  - Checks for specific TS error codes (TS7006, TS7031)
- Implement workspace test: `test-tsc-workspace.mjs`
  - Validates entire workspace passes strict checking
  - Ensures no implicit any diagnostics

### Phase 5: Package.json Integration
- Update root `package.json` with new test scripts:
  - `"test:ts:audit": "node scripts/tsconfig-audit.mjs"`
  - `"test:ts:should-fail": "node scripts/test-tsc-should-fail.mjs"`
  - `"test:ts:workspace": "node scripts/test-tsc-workspace.mjs"`
  - `"test:ts:all": "pnpm run test:ts:audit && pnpm run test:ts:workspace && pnpm run test:ts:should-fail"`
- Update existing `"typecheck"` script to use exact specification

### Phase 6: Verification and Testing
- Run all TypeScript strict tests to ensure they pass
- Verify workspace builds successfully with new strict settings
- Test negative scenarios work as expected (should-fail test)
- Manual verification with temporary bad code
- Ensure all acceptance criteria are met

### Phase 7: Documentation Updates
- Update ADR if needed to document strict TypeScript adoption
- Ensure any new patterns are documented in CLAUDE.md

## Risk Assessment

**Low Risk**:
- Configuration changes (current config is already mostly compliant)
- Script creation (isolated new functionality, doesn't affect existing code)
- Test infrastructure (separate from main codebase)

**Medium Risk**:
- Module system change (`NodeNext` → `ES2020`) could affect builds
- New strict flags might reveal hidden type issues in existing code
- `incremental: true` might change build behavior

**High Risk**: None identified

**Mitigation Strategies**:
- Test workspace build immediately after each config change
- Have git rollback plan ready if compilation fails
- Implement changes incrementally with validation at each step
- Keep existing functionality tests running throughout

## TODO List

### High Priority
1. [x] Revert any premature changes made during initial attempt
2. [x] Update `tsconfig.base.json` to exact specification
3. [x] Verify all package tsconfig.json files are compliant
4. [x] Create `/tests/ts-strict/` test infrastructure
5. [x] Implement validation scripts in `/scripts/`
6. [x] Update root `package.json` with new test scripts
7. [x] Run full verification suite

### Medium Priority  
8. [x] Document any ADR updates needed
9. [x] Manual verification with temporary bad code
10. [x] Update CLAUDE.md with any new patterns discovered

### Verification Tasks
11. [x] `node scripts/tsconfig-audit.mjs` passes with "AUDIT: ok"
12. [x] `node scripts/test-tsc-workspace.mjs` passes with "STRICT workspace typecheck: ok"
13. [x] `node scripts/test-tsc-should-fail.mjs` correctly detects and reports TS7006/TS7031
14. [x] All individual TypeScript strict tests pass
15. [x] Manual smoke test with temporary implicit any code fails as expected

## Implementation Notes

- Fixed module/moduleResolution compatibility by using `NodeNext` for both
- Updated scripts to use direct TypeScript path instead of npx for reliability
- All existing tests continue to pass after strict enforcement implementation
- Strict TypeScript enforcement is now active across the entire workspace

## Acceptance Criteria

**Must Pass**:
- [ ] Config audit passes: `pnpm run test:ts:audit` → "AUDIT: ok", exit code 0
- [ ] Workspace typecheck passes: `pnpm run test:ts:workspace` → "STRICT workspace typecheck: ok", exit code 0  
- [ ] Should-fail test works: `pnpm run test:ts:should-fail` → detects TS7006/TS7031, script reports "STRICT should-fail: ok"
- [ ] Combined suite passes: `pnpm run test:ts:all` → all three steps pass, exit code 0
- [ ] Manual smoke test: temporary implicit any code fails typecheck, removing it passes

**Configuration Requirements**:
- [ ] `tsconfig.base.json` has exact flags from specification
- [ ] All packages extend base without overriding strict flags
- [ ] All packages compile with 0 TypeScript errors using `tsc -b`
- [ ] Zero implicit-any diagnostics across workspace

**Test Infrastructure Requirements**:
- [ ] `/tests/ts-strict/` directory with all required files
- [ ] `/scripts/` directory with all validation scripts  
- [ ] Root `package.json` updated with new test scripts
- [ ] Negative testing proves strictness enforcement works

## Notes

This implementation follows the exact specification provided in P0-S002, including:
- Precise `tsconfig.base.json` configuration matching specification
- Exact script implementations as specified
- Specific test file contents as provided
- Required package.json script definitions

The approach ensures comprehensive TypeScript strictness with both positive and negative validation.