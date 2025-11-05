# Git Commit Strategy: Profile UI Completion Save Point

**Date**: 2025-01-XX
**Purpose**: Create safe "save point" for profile selection UI completion
**Status**: Ready for execution

---

## Overview

This document outlines the strategy for committing the completed profile selection UI work, ensuring we have a safe restore point if anything goes wrong in future development.

### Work Completed
1. ✅ Shared world data module created (single source of truth for lands/wards)
2. ✅ Profile repository refactored to use shared world data
3. ✅ Ward name "undefined" issue fixed
4. ✅ Dragon name left-aligned
5. ✅ Location text vertically centered on attachment gem
6. ✅ Decorative corner tinting behavior fixed
7. ✅ Footer removed from profile selection (only on name entry)
8. ✅ Comprehensive specifications documented

---

## Recommended Commit Strategy

### Option 1: Single Comprehensive Commit (Recommended)

**Advantages:**
- ✅ All related changes grouped together
- ✅ Easy to revert as a single unit
- ✅ Clear "save point" for this milestone
- ✅ Simplified git history

**Disadvantages:**
- ❌ Large commit size
- ❌ Harder to cherry-pick individual changes

**Implementation:**
```bash
# 1. Check current branch status
git status

# 2. Stage all changes
git add -A

# 3. Create comprehensive commit
git commit -m "feat(ui): complete profile selection UI with world data integration

FEATURES:
- Create shared world data module as single source of truth
- Refactor profile repository to use shared world data lookups
- Fix ward name 'undefined' issue
- Implement dragon name left-alignment
- Center location text vertically on attachment gem
- Fix decorative corner tinting to match attachment behavior
- Remove footer from profile selection (only on name entry screen)
- Add comprehensive UI specifications documentation

TECHNICAL DETAILS:
- New file: packages/shared/src/game-data/world-data.ts
  - 22 Horizon Steppe wards with complete data
  - Type-safe lookup functions
  - Exported from packages/shared/src/index.ts

- Modified: packages/db/src/profile-repo.ts
  - Import getWardName/getLandName from @draconia/shared
  - Remove ~50 lines of duplicate ward/land lookups
  - Fix undefined ward name bug

- Modified: apps/web/src/lib/pixi/systems/profile-selection-manager.ts
  - Dragon name: left-aligned (anchor 0,0) at x=20
  - Location text: vertically centered (anchor 0,0.5) on gem at y=20
  - Decorative corner: tint matching in all states
  - Footer: commented out (contextual to name entry only)

- New file: docs/ui/profile-selection-specifications.md
  - Complete UI specifications (measurements, colors, behaviors)
  - Official reference implementation documentation
  - Maintenance and testing guidelines

ARCHITECTURE IMPROVEMENTS:
- Eliminated code duplication (~100+ lines removed)
- Single source of truth for world data
- Type-safe data contracts
- Future-proof for adding new lands/wards

Closes #XXX (if applicable)"

# 4. Push to remote as backup
git push origin <current-branch>

# 5. Create annotated tag for this milestone
git tag -a v0.0.2-profile-ui-complete -m "Profile Selection UI Complete - Safe Save Point"
git push origin v0.0.2-profile-ui-complete
```

---

### Option 2: Atomic Commits (Alternative)

**Advantages:**
- ✅ Granular history
- ✅ Easy to cherry-pick specific changes
- ✅ Clearer blame/attribution

**Disadvantages:**
- ❌ More complex to revert (multiple commits)
- ❌ More commits to manage
- ❌ Potential for incomplete state between commits

**Implementation:**
```bash
# Commit 1: Shared world data module
git add packages/shared/src/game-data/world-data.ts
git add packages/shared/src/index.ts
git commit -m "feat(shared): create world data module as single source of truth

- Add world-data.ts with all 22 Horizon Steppe wards
- Export from packages/shared/src/index.ts
- Provide type-safe lookup functions"

# Commit 2: Refactor profile repository
git add packages/db/src/profile-repo.ts
git commit -m "refactor(db): use shared world data in profile repository

- Import getWardName/getLandName from @draconia/shared
- Remove duplicate ward/land lookups (~50 lines)
- Fix ward name 'undefined' bug"

# Commit 3: UI alignment fixes
git add apps/web/src/lib/pixi/systems/profile-selection-manager.ts
git commit -m "fix(ui): profile selection alignment and behavior fixes

- Dragon name left-aligned (anchor 0,0) at x=20
- Location text vertically centered (anchor 0,0.5) on gem
- Decorative corner tint matches attachment in all states
- Remove footer from profile selection (contextual to name entry)"

# Commit 4: Documentation
git add docs/ui/profile-selection-specifications.md
git add docs/git/commit-strategy-profile-ui-complete.md
git commit -m "docs(ui): add comprehensive profile selection specifications

- Complete UI measurements and design decisions
- Official reference implementation documentation
- Maintenance and testing guidelines"

# Push all commits
git push origin <current-branch>

# Tag the final state
git tag -a v0.0.2-profile-ui-complete -m "Profile Selection UI Complete"
git push origin v0.0.2-profile-ui-complete
```

---

## Recommended Approach: Option 1 (Single Commit)

**Rationale:**
- This work represents a cohesive feature completion
- All changes are interdependent (world data → profile repo → UI)
- Reverting should be all-or-nothing
- Simplified history for this milestone

---

## Pre-Commit Verification Checklist

Before committing, verify:

### Build & Compilation
- [ ] `pnpm run build` succeeds in packages/shared
- [ ] `pnpm run build` succeeds in packages/db
- [ ] No TypeScript compilation errors
- [ ] All packages properly linked

### Visual Verification
- [ ] Ward name displays correctly (not "undefined")
- [ ] Dragon name is left-aligned
- [ ] Location text is vertically centered on gem
- [ ] Decorative corner matches attachment color
- [ ] Footer is removed from profile selection
- [ ] All 3 slots display correctly
- [ ] All state transitions work (empty, normal, hovered, selected)

### Data Verification
- [ ] Ward names match world-data.ts
- [ ] Land names match world-data.ts
- [ ] Profile data loads correctly from IndexedDB
- [ ] No console errors when loading profiles

### Documentation Verification
- [ ] Profile specifications document is complete
- [ ] All measurements are documented
- [ ] All design decisions are explained
- [ ] Commit strategy document is complete

---

## Post-Commit Actions

After committing:

1. **Verify Remote Backup**
   ```bash
   git log --oneline -1  # Verify commit message
   git remote -v         # Verify remote URL
   git push origin <branch>  # Push to remote
   ```

2. **Create Annotated Tag**
   ```bash
   git tag -a v0.0.2-profile-ui-complete -m "Profile Selection UI Complete - Safe Save Point"
   git push origin v0.0.2-profile-ui-complete
   ```

3. **Document in Changelog** (if applicable)
   Update `docs/overview/changelog.md` with this milestone

4. **Create GitHub Issue/PR** (if applicable)
   - Reference this commit in issue tracker
   - Close any related issues
   - Create PR for review if working in feature branch

---

## Recovery Procedures

### If Something Goes Wrong

**Scenario 1: Need to revert uncommitted changes**
```bash
# Discard all uncommitted changes (DANGER!)
git reset --hard HEAD

# Discard changes to specific file
git checkout HEAD -- path/to/file.ts
```

**Scenario 2: Need to revert after commit (but before push)**
```bash
# Soft reset (keeps changes in working directory)
git reset --soft HEAD~1

# Hard reset (discards all changes)
git reset --hard HEAD~1
```

**Scenario 3: Need to revert after push**
```bash
# Create revert commit (preferred - preserves history)
git revert <commit-hash>
git push origin <branch>

# Force reset (DANGER - rewrites history)
git reset --hard <previous-commit-hash>
git push --force origin <branch>
```

**Scenario 4: Restore from tag**
```bash
# Check out tagged commit
git checkout v0.0.2-profile-ui-complete

# Create new branch from tag
git checkout -b profile-ui-restore v0.0.2-profile-ui-complete
```

---

## Files Changed Summary

### New Files
- `packages/shared/src/game-data/world-data.ts` (279 lines)
- `docs/ui/profile-selection-specifications.md` (753 lines)
- `docs/git/commit-strategy-profile-ui-complete.md` (this file)

### Modified Files
- `packages/shared/src/index.ts` (1 line added)
- `packages/db/src/profile-repo.ts` (~50 lines removed, 1 import added)
- `apps/web/src/lib/pixi/systems/profile-selection-manager.ts` (multiple changes)
  - Line 266: Comment out footer creation
  - Line 362: Change dragon name to left-aligned
  - Line 607: Add decorative corner initial tint
  - Line 620: Add decorative corner initial tint
  - Line 644: Add decorative corner initial tint
  - Line 673: Change location text to vertically centered
  - Line 720-735: Add decorative corner tinting in updateSlotHighlights()

### Total Lines Changed
- **Added**: ~1050 lines (including documentation)
- **Removed**: ~50 lines (duplicate code elimination)
- **Modified**: ~15 lines

---

## Git Commands Reference

### Status & Inspection
```bash
git status                    # Check current state
git diff                      # See unstaged changes
git diff --staged             # See staged changes
git log --oneline -10         # Recent commits
git show <commit>             # Show specific commit
```

### Staging & Committing
```bash
git add -A                    # Stage all changes
git add path/to/file          # Stage specific file
git commit -m "message"       # Commit with message
git commit --amend            # Amend last commit
```

### Remote Operations
```bash
git push origin <branch>      # Push to remote
git push origin <tag>         # Push tag to remote
git pull origin <branch>      # Pull from remote
```

### Tags
```bash
git tag                       # List all tags
git tag -a <name> -m "msg"    # Create annotated tag
git tag -d <name>             # Delete local tag
git push origin --delete <tag> # Delete remote tag
```

---

## Execution Checklist

Use this checklist when executing the commit:

1. [ ] Run pre-commit verification checklist
2. [ ] Choose commit strategy (Option 1 or Option 2)
3. [ ] Review all changes with `git diff`
4. [ ] Stage changes with `git add`
5. [ ] Create commit with descriptive message
6. [ ] Verify commit with `git log --oneline -1`
7. [ ] Push to remote backup
8. [ ] Create annotated tag
9. [ ] Push tag to remote
10. [ ] Document in changelog (if applicable)
11. [ ] Create GitHub issue/PR (if applicable)
12. [ ] Test that changes work after commit
13. [ ] Verify tag exists with `git tag`
14. [ ] Celebrate successful save point! 🎉

---

## Additional Notes

### Branch Strategy Consideration
- If currently on `main` branch, consider creating feature branch first
- Feature branch naming: `feat/profile-ui-complete` or `feat/world-data-integration`
- Merge to main after testing and review

### CI/CD Considerations
- Ensure all CI/CD pipelines pass before considering this a "safe save point"
- Run tests locally: `pnpm test` (if applicable)
- Check for linting errors: `pnpm lint` (if applicable)
- Verify build succeeds: `pnpm build`

### Backup Considerations
- Git remote provides backup of committed changes
- Tags provide easy restore points
- Consider creating GitHub release for major milestones
- Local backups: Copy working directory before major changes

---

**Status**: Ready for execution
**Recommended**: Option 1 (Single Comprehensive Commit)
**Next Step**: Execute pre-commit verification checklist

---

## Questions to Consider Before Committing

1. **Are all changes tested and verified?**
   - Yes: Proceed with commit
   - No: Complete testing first

2. **Are all related changes included?**
   - Yes: Proceed with commit
   - No: Stage remaining changes

3. **Is documentation complete?**
   - Yes: Proceed with commit
   - No: Complete documentation first

4. **Is this work ready to be a restore point?**
   - Yes: Proceed with commit
   - No: Complete remaining work first

5. **Are commit messages clear and descriptive?**
   - Yes: Proceed with commit
   - No: Revise commit message

**If all answers are "Yes", proceed with commit execution! ✅**
