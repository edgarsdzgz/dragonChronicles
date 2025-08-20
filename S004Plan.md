<!-- markdownlint-disable -->

# S004 Planning Document

## Issue Analysis

**Issue #18**: P0-S004 — Git Hooks & Conventional Commits

**Goal**: Enforce conventional commits policy and format-on-commit. Bad commit messages are rejected, and staged files are auto-fixed by ESLint/Prettier before commit.

**Dependencies**: 
- P0-S001 (monorepo) ✅ Complete
- P0-S003 (Husky + lint-staged installed; lint/format scripts exist) ✅ Complete

**Current State**: 
- Husky is installed and configured (v9+ format)
- lint-staged is configured in package.json
- ESLint and Prettier are set up with proper configs
- Pre-commit hook exists and works

**Required Outcomes**:
1. Husky hooks: pre-commit runs lint-staged; commit-msg runs commitlint
2. Non-conforming commit messages rejected with helpful error text
3. Staged files formatted (ESLint --fix + Prettier) as part of commit
4. Automated unit, integration, E2E scripts demonstrate the above reliably

## Implementation Plan

### Phase 1: Dependencies and Configuration
1. Install commitlint dependencies: `@commitlint/cli @commitlint/config-conventional`
2. Create `commitlint.config.cjs` at repo root with conventional commit rules
3. Update package.json scripts for commitlint and testing
4. Verify lint-staged configuration is present from P0-S003

### Phase 2: Husky Hook Setup
1. Ensure `pnpm prepare` installs Husky properly
2. Update `.husky/pre-commit` to use correct v9+ format (already done)
3. Create `.husky/commit-msg` hook to run commitlint validation
4. Make hooks executable

### Phase 3: Test Infrastructure
1. Create test fixture directories: `/tests/hooks/` and `/scripts/`
2. Create test fixtures:
   - `commit-good.txt` - valid conventional commit message
   - `commit-bad.txt` - invalid commit message  
   - `messy.ts` - poorly formatted TypeScript file
3. Create test scripts:
   - `test-commitlint-unit.mjs` - unit test commitlint via STDIN
   - `test-precommit-format.mjs` - integration test lint-staged formatting
   - `test-commit-msg-hook.mjs` - e2e test full commit flow

### Phase 4: Testing and Validation
1. Run unit tests: `pnpm run test:hooks:unit`
2. Run integration tests: `pnpm run test:hooks:integration` 
3. Run e2e tests: `pnpm run test:hooks:e2e`
4. Run full test suite: `pnpm run test:hooks:all`
5. Manual smoke testing with good/bad commit messages

## Risk Assessment

### Identified Risks:

**Risk 1: Husky v9+ Format Conflicts**
- **Issue**: Spec shows old Husky format with shebang/husky.sh
- **Mitigation**: Use v9+ format (plain commands only) as established in S003
- **Impact**: Medium - could cause hook failures

**Risk 2: Windows Git Bash Compatibility**  
- **Issue**: Path interpretation issues in test scripts
- **Mitigation**: Use proven patterns from CLAUDE.md (no shell: true in spawnSync)
- **Impact**: High - tests could fail on Windows

**Risk 3: Git Repository State**
- **Issue**: E2E tests assume git repo exists and is configured
- **Mitigation**: E2E script initializes git repo if needed
- **Impact**: Medium - tests could fail in non-git environments

**Risk 4: Existing Husky Configuration**
- **Issue**: Conflicts with current pre-commit hook setup
- **Mitigation**: Preserve existing lint-staged integration, only add commit-msg
- **Impact**: Low - pre-commit already working

**Risk 5: Commitlint Rule Strictness**
- **Issue**: Rules might be too strict for development workflow
- **Mitigation**: Start with reasonable rules, can adjust later
- **Impact**: Low - can be tuned

### Mitigation Strategies:

1. **Follow CLAUDE.md Guidelines**:
   - Use Husky v9+ format (no shebang, no husky.sh)
   - Use cross-platform spawn patterns
   - Implement proper test hygiene (no fake "ok" messages)

2. **Incremental Testing**:
   - Test each component individually before integration
   - Use manual verification alongside automated tests
   - Validate hooks work in actual git workflow

3. **Robust Error Handling**:
   - Test scripts should provide clear error messages
   - Handle git repo initialization gracefully
   - Proper exit codes and assertion messages

## TODO List

### High Priority
- [ ] Install commitlint dependencies
- [ ] Create commitlint.config.cjs with conventional commit rules  
- [ ] Update package.json with new scripts
- [ ] Create .husky/commit-msg hook (using v9+ format)
- [ ] Create test fixture directories and files
- [ ] Create test-commitlint-unit.mjs script
- [ ] Create test-precommit-format.mjs script  
- [ ] Create test-commit-msg-hook.mjs script

### Medium Priority  
- [ ] Run and validate unit tests
- [ ] Run and validate integration tests
- [ ] Run and validate e2e tests
- [ ] Manual smoke testing with git commits

### Low Priority
- [ ] Document any deviations from spec in CLAUDE.md
- [ ] Performance test with large staged files
- [ ] Test edge cases (empty commits, merge commits, etc.)

## Acceptance Criteria

**Automated Tests**:
- ✅ `pnpm run test:hooks:unit` prints UNIT: ok (good passes, bad fails)
- ✅ `pnpm run test:hooks:integration` prints INTEGRATION: pre-commit formatting ok
- ✅ `pnpm run test:hooks:e2e` prints E2E: ok (bad rejected, good accepted, file formatted)

**Manual Tests**:
- ✅ `git commit -m "fix(repo): tidy up"` succeeds
- ✅ `git commit -m "update code"` fails with clear commitlint error
- ✅ Messy file staged + valid commit → resulting commit shows cleaned file content

**Configuration**:
- ✅ Husky hooks (pre-commit, commit-msg) exist and executable
- ✅ Commitlint enforces conventional commit rules
- ✅ lint-staged auto-fixes staged files on commit

## Implementation Notes

**Husky Format**: Will use v9+ format (plain commands) as established in previous work, not the deprecated format shown in the spec.

**Cross-Platform**: Will follow CLAUDE.md patterns for Windows Git Bash compatibility in test scripts.

**Test Hygiene**: Will implement proper test runners with real exit codes, no fake "ok" messages.

**Git Integration**: E2E tests will handle git repo initialization to work in any environment.