<!-- markdownlint-disable -->

# S003 Planning Document

## Issue Analysis

**P0-S003 — ESLint + Prettier + Svelte ESLint (#8)**

**Goal**: Add comprehensive linting and formatting infrastructure repo-wide with TypeScript, Svelte support, and automated pre-commit hooks.

**Dependencies**:

- ✅ P0-S001 (monorepo ready)
- ✅ P0-S002 (TypeScript strict everywhere)

**Key Requirements**:

1. ESLint config covering TypeScript + Svelte with eslint-plugin-svelte + svelte-eslint-parser
2. Prettier config with prettier-plugin-svelte, resolving conflicts via eslint-config-prettier
3. `pnpm -w lint` passes with 0 errors/warnings (--max-warnings 0)
4. Pre-commit hook with lint-staged for auto-formatting and fixing
5. Automated tests verifying: rule failures, workspace lint success, pre-commit formatting

## Implementation Plan

### Phase 1: Dependencies and Directory Structure

1. Install all required dev dependencies
2. Create `/configs/` directory structure for ESLint and Prettier
3. Set up `.husky/` directory for pre-commit hooks

### Phase 2: Configuration Files

1. Create ESLint configuration (`/configs/eslint/.eslintrc.cjs` + `.eslintignore`)
2. Create Prettier configuration (`/configs/prettier/.prettierrc.cjs` + `.prettierignore`)
3. Update root `package.json` with lint/format scripts and lint-staged config

### Phase 3: Husky and Pre-commit Setup

1. Initialize Husky with `pnpm prepare`
2. Create pre-commit hook file (`.husky/pre-commit`)
3. Configure lint-staged for automated formatting on commit

### Phase 4: Test Infrastructure

1. Create test fixtures in `/tests/lint/` (bad.ts, bad.svelte, pass.ts)
2. Implement test scripts in `/scripts/` (unit, workspace, e2e)
3. Verify all test scenarios work correctly

### Phase 5: Validation and Testing

1. Run all lint tests (`pnpm run test:lint:all`)
2. Verify workspace lint is green (`pnpm -w lint`)
3. Manual testing of pre-commit formatting
4. Cross-platform verification (Windows Git Bash compatibility)

## Risk Assessment

### High Risk

- **Plugin compatibility**: eslint-plugin-svelte vs svelte3 confusion
  - _Mitigation_: Use modern stack (eslint-plugin-svelte + svelte-eslint-parser)
- **Windows path issues**: Cross-platform hook execution
  - _Mitigation_: Test on Windows Git Bash, avoid shell: true in spawnSync

### Medium Risk

- **Performance on large repos**: Slow lint times
  - _Mitigation_: Use --ext patterns and proper ignore files
- **Rule conflicts**: ESLint vs Prettier conflicts
  - _Mitigation_: eslint-config-prettier must be last in extends array

### Low Risk

- **CI integration**: Hooks not running in CI
  - _Mitigation_: CI runs `pnpm -w lint` separately, hooks are for local DX

## TODO List

### High Priority

- [ ] Install dev dependencies (eslint, prettier, husky, lint-staged + plugins)
- [ ] Create `/configs/eslint/` and `/configs/prettier/` directories
- [ ] Implement ESLint config with TypeScript + Svelte support
- [ ] Implement Prettier config with Svelte plugin
- [ ] Update root package.json with scripts and lint-staged config

### Medium Priority

- [ ] Initialize Husky and create pre-commit hook
- [ ] Create test fixtures (bad.ts, bad.svelte, pass.ts)
- [ ] Implement unit test script (test-lint-unit.mjs)
- [ ] Implement workspace test script (test-lint-workspace.mjs)
- [ ] Implement e2e test script (test-precommit-e2e.mjs)

### Low Priority

- [ ] Run comprehensive test suite
- [ ] Manual verification of pre-commit formatting
- [ ] Cross-platform compatibility testing
- [ ] Documentation updates (if needed)

## Acceptance Criteria

**Automated Tests Must Pass**:

- ✅ `pnpm run test:lint:unit` - Shows failures on bad files, formatter fixes, any still fails
- ✅ `pnpm run test:lint:workspace` - Workspace lint is green (0 warnings/errors)
- ✅ `pnpm run test:lint:e2e` - Pre-commit hook formats staged files correctly

**Manual Verification**:

- ✅ `pnpm -w lint` exits 0 with no warnings/errors
- ✅ `pnpm run format:check` passes on clean tree, fails on messy code
- ✅ Pre-commit hook auto-formats and fixes staged files on commit
- ✅ Svelte files are properly linted and formatted
- ✅ eslint-config-prettier is last in extends array (prevents conflicts)

**File Structure Created**:

```
/configs/
  eslint/.eslintrc.cjs
  eslint/.eslintignore
  prettier/.prettierrc.cjs
  prettier/.prettierignore
/.husky/
  pre-commit
/tests/lint/
  bad.ts
  bad.svelte
  pass.ts
/scripts/
  test-lint-unit.mjs
  test-lint-workspace.mjs
  test-precommit-e2e.mjs
```

## Implementation Notes

- Follow exact content specifications from issue for config files
- Use modern Svelte ESLint stack (not legacy svelte3)
- Ensure cross-platform compatibility (Windows Git Bash)
- Keep root directory clean by using `/configs/` subdirectory
- Verify TypeScript strict mode integration with ESLint rules
- Test both formatting (Prettier) and linting (ESLint) in pre-commit hook

## Next Steps

1. Get user approval for this plan
2. Execute implementation systematically following TODO list
3. Provide comprehensive pre-PR summary before creating PR
4. Reference issue #8 with "Closes #8" in PR description
