# Pipeline Fix Plan - P1-E4-S1

**Date**: October 1, 2025
**Branch**: `feature/p1-e4-s1-arcana-drop-system`
**Current Status**: 3/6 workflows failing

## 🎯 Overview

We have 3 failing workflows with 2 distinct issue types:

1. **Markdown linting errors** (docs workflow)

1. **ESLint unused variable errors** (CI and checks workflows)

## 📋 Issue Summary

### Issue 1: Markdown Linting (docs workflow) ❌

**Files affected:**

- `docs/planning/P1-E4-Epic-Plan.md`

- `docs/planning/P1-E4-S1-Plan.md`

- `docs/planning/P1-E4-S2-Plan.md`

**Error types:**

- MD013: Line length exceeds 100 characters (3 violations)

- MD024: Duplicate heading content (15 violations)

- MD029: Ordered list numbering issues (19 violations)

**Total violations**: 37 errors

### Issue 2: ESLint Unused Variables (CI + checks workflows) ❌

**Files affected:**

- `packages/sim/src/economy/arcana-drop-manager.ts` (1 error)

- `packages/sim/src/economy/enchant-manager.ts` (2 errors)

- `packages/sim/src/economy/enchant-types.ts` (29 errors)

- `packages/sim/src/economy/soul-forging.ts` (8 errors)

- `packages/sim/src/economy/soul-power-drop-manager.ts` (1 error)

- `packages/sim/src/economy/soul-power-scaling.ts` (2 errors)

- `packages/sim/src/economy/types.ts` (33 errors)

**Total violations**: 76 errors

## 🔧 Available Tools

### Tool 1: `fix-markdown-universal.py`

- **Location**: `scripts/fix-markdown-universal.py`

- **Purpose**: Comprehensive markdown linting fixer

- **Capabilities**: Fixes MD013, MD024, MD029, and 12+ other markdown violations

- **Usage**: `python scripts/fix-markdown-universal.py [files/directories]`

### Tool 2: Manual Fix or Custom Script

- **For**: ESLint unused variable errors

- **Action**: Prefix unused parameters with `_` per ESLint rules

- **Note**: Existing `fix-unused-vars.py` targets test files, not economy files

## 📝 Execution Plan

### Phase 1: Fix Markdown Issues (Quick Win) ✅

**Estimated Time**: 2-3 minutes

**Steps:**

1. Run `fix-markdown-universal.py` on planning docs

   ```bash

   ```

python scripts/fix-markdown-universal.py docs/planning/P1-E4-Epic-Plan.md
docs/planning/P1-E4-S1-Plan.md
docs/planning/P1-E4-S2-Plan.md

````bash

1. Verify fixes with local markdown linting

   ```bash

   pnpm run docs:lint

```bash

1. Stage and commit changes

   ```bash

   git add docs/planning/*.md
   git commit -m "fix(docs): resolve markdown linting violations in planning docs"

```text

**Expected Result**: docs workflow passes ✅

### Phase 2: Fix ESLint Unused Variables

**Estimated Time**: 10-15 minutes

**Approach**: Create targeted script or manual fix

**Files to fix:**

1. `packages/sim/src/economy/arcana-drop-manager.ts`

    - Line 16: `BossType` → `_BossType` (unused import)

1. `packages/sim/src/economy/enchant-manager.ts`

    - Line 81: `type` → `_type` (unused param)

    - Line 285: `soulForgingStats` → `_soulForgingStats` (unused var)

1. `packages/sim/src/economy/enchant-types.ts`

    - 29 unused stub function parameters (lines 102-147)

    - Prefix all with `*` (e.g., `type` → `*type`, `category` → `_category`)

1. `packages/sim/src/economy/soul-forging.ts`

    - 8 unused stub function parameters (lines 19-25)

    - Prefix all with `_`

1. `packages/sim/src/economy/soul-power-drop-manager.ts`

    - Line 17: `BossType` → `_BossType` (unused import)

1. `packages/sim/src/economy/soul-power-scaling.ts`

    - Line 51: `BOSS*CHANCE*MULTIPLIERS` → `*BOSS*CHANCE_MULTIPLIERS`

    - Line 60: `BOSS*AMOUNT*MULTIPLIERS` → `*BOSS*AMOUNT_MULTIPLIERS`

1. `packages/sim/src/economy/types.ts`

    - 33 unused stub function parameters (lines 246-348)

    - Prefix all with `_`

**Steps:**

1. Create custom script `scripts/fix-economy-unused-vars.py` OR

1. Manual fix with search-replace in each file

1. Verify fixes with local ESLint

   ```bash

   pnpm run lint

```bash

1. Stage and commit changes

   ```bash

   git add packages/sim/src/economy/*.ts
   git commit -m "fix(sim): prefix unused parameters with underscore in economy stubs"

```text

**Expected Result**: CI and checks workflows pass ✅

### Phase 3: Verify Pipeline

**Estimated Time**: 5 minutes

**Steps:**

1. Push changes to remote

   ```bash

   git push origin feature/p1-e4-s1-arcana-drop-system

```text

1. Wait for GitHub Actions to run

1. Check workflow status

   ```bash

   gh run list --limit 5

```bash

1. Verify all 6 workflows pass

   ```bash

   gh run list --limit 5 --branch feature/p1-e4-s1-arcana-drop-system

```text

**Expected Result**: 6/6 workflows passing ✅

## 🎯 Success Criteria

- [ ] All markdown linting errors resolved (37 violations)

- [ ] All ESLint unused variable errors resolved (76 violations)

- [ ] Local validation passes (`pnpm run docs:lint` + `pnpm run lint`)

- [ ] All 6 GitHub Actions workflows pass

- [ ] Changes committed with conventional commit messages

## 📊 Progress Tracking

| Workflow | Before | After | Status |
|----------|--------|-------|--------|
| CI | ❌ | ⏳ | Pending |
| Checks | ❌ | ⏳ | Pending |
| Docs | ❌ | ⏳ | Pending |
| E2E Smoke | ✅ | ✅ | Already passing |
| Lighthouse | ✅ | ✅ | Already passing |
| Pages Deploy | ✅ | ✅ | Already passing |

## 🚀 Execution Order

Following project rules for systematic problem-solving:

1. **Start**: Fix markdown (simpler, isolated issue)

1. **Continue**: Fix ESLint errors (more complex, multiple files)

1. **Verify**: Check pipeline status

1. **Complete**: Update todos and document results

## 📚 Reference Documentation

- **CLAUDE.md**: Automation principles, sequential problem solving

- **Quick Reference**: `docs/engineering/quick-reference-continuation.md`

- **CI Runbook**: `docs/runbooks/ci.md`

- **Memory Rules**: Focus on one issue at a time, automation first

---

**Ready to execute systematically!** 🎯
````
