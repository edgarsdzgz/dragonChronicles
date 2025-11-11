# Final Commit Plan - Corrected

## What We Committed Already ✅

**Commit 917a848**: `fix(combat): add baseArcana and balance dragon HP for survivability`
- `SESSION-HANDOFF.md` - Complete session documentation with all current TODOs
- `apps/web/src/lib/pixi/enemy-sprites.ts` - Added baseArcana + balanced damage
- `apps/web/src/lib/pixi/systems/dragon-protagonist.ts` - Increased HP to 10000

---

## Current TODOs (All Documented in SESSION-HANDOFF.md) ✅

**From SESSION-HANDOFF.md "Remaining User-Requested Features":**
1. [ ] Death sequence (4-5 seconds with pushback)
2. [ ] Enemy hit feedback (blink effect)
3. [ ] Performance lag investigation
4. [ ] Ground scaling fix (F12 dev tools)
5. [ ] Cutscene decoupling (approved but not started)

**From TodoWrite tool (matches above):**
1. [x] Clear Vite cache and restart dev server
2. [x] Adjust combat balance for 10+ hit survivability
3. [x] Write handoff document and commit changes
4. [ ] Test arcana awards and combat balance in game
5. [ ] Implement death sequence (4-5 seconds with pushback)
6. [ ] Add enemy hit feedback (blink effect)
7. [ ] Investigate and fix performance lag
8. [ ] Fix ground scaling with F12 dev tools

**All current TODOs are documented** ✅

---

## Uncommitted Files to Handle

### Group 1: Delete Outdated TODO.md ❌

**File**: `TODO.md`
**Content**: Old checklist from PREVIOUS work loss incident (Journey buttons, floating damage)
**Status**: ❌ OUTDATED - Not relevant to current session
**Action**: DELETE

```bash
rm TODO.md
git add TODO.md  # stage deletion
```

### Group 2: Commit Utility Scripts ✅

**Files**:
- `scripts/rebuild-with-cache-clear.bat`
- `scripts/rebuild-with-cache-clear.sh`

**Status**: ✅ READY TO COMMIT - Useful utilities
**Action**:
```bash
git add scripts/rebuild-with-cache-clear.bat scripts/rebuild-with-cache-clear.sh
git commit -m "chore(scripts): add rebuild-with-cache-clear utility scripts

- Windows batch script for cache clearing and rebuild
- Unix/Linux shell script for cache clearing and rebuild
- Clears tsconfig.tsbuildinfo files before rebuilding packages
- Resolves build issues by ensuring clean state"
```

### Group 3: Commit Planning Documents ✅

**Files**:
- `docs/ui/combat-critical-fixes-plan.md`
- `docs/ui/profile-selection-animation-plan.md`

**Status**: ✅ READY TO COMMIT - Planning documentation
**Action**:
```bash
git add docs/ui/combat-critical-fixes-plan.md docs/ui/profile-selection-animation-plan.md
git commit -m "docs(ui): add planning documents for combat and profile selection

- combat-critical-fixes-plan.md: Documents critical combat issues and fixes
- profile-selection-animation-plan.md: Documents profile UI implementation plan
- Both provide context for implementation decisions"
```

### Group 4: Previous Session Source Files ⚠️

**Files** (From previous session about profile selection):
- `apps/web/src/lib/pixi/app.ts`
- `apps/web/src/lib/pixi/systems/profile-name-entry.ts`
- `apps/web/src/lib/pixi/systems/profile-selection-manager.ts`
- `apps/web/src/lib/pixi/systems/profile-shapes-test.ts`
- `packages/db/src/profile-repo.ts`

**Status**: ⚠️ NEED TO REVIEW - Check what changed
**Action**: Let's review these files to see if they're complete work:

```bash
# Check the diffs
git diff apps/web/src/lib/pixi/app.ts | head -100
git diff apps/web/src/lib/pixi/systems/profile-name-entry.ts | head -100
git diff apps/web/src/lib/pixi/systems/profile-selection-manager.ts | head -100
git diff apps/web/src/lib/pixi/systems/profile-shapes-test.ts | head -100
git diff packages/db/src/profile-repo.ts | head -100
```

**Then decide**:
- If complete → Commit with message: `feat(ui): implement profile selection system`
- If incomplete → Ask user what to do
- If from completed previous work → Commit now

### Group 5: Skip Local/Generated Files ❌

**Files**:
- `.claude/settings.local.json` - Local settings
- All `.svelte-kit/` files - Generated
- All `tsconfig.tsbuildinfo` - Generated
- `apps/web/logs/` - Logs

**Status**: ❌ DO NOT COMMIT
**Action**: None

---

## Recommended Commit Sequence

### 1. Delete Outdated TODO.md
```bash
rm TODO.md
```

### 2. Commit Scripts
```bash
git add scripts/rebuild-with-cache-clear.bat scripts/rebuild-with-cache-clear.sh
git commit -m "chore(scripts): add rebuild-with-cache-clear utility scripts"
```

### 3. Commit Planning Docs
```bash
git add docs/ui/combat-critical-fixes-plan.md docs/ui/profile-selection-animation-plan.md
git commit -m "docs(ui): add planning documents for combat and profile selection"
```

### 4. Review Previous Session Files
```bash
# Show what changed in these files
git diff --stat apps/web/src/lib/pixi/app.ts
git diff --stat apps/web/src/lib/pixi/systems/profile-*.ts
git diff --stat packages/db/src/profile-repo.ts

# Then decide whether to commit
```

### 5. Final Status Check
```bash
git status
git log --oneline -5
```

---

## Answer to User's Questions

### ❓ "Are all the todos in the handoff document?"

**YES** ✅ All current TODOs are documented in SESSION-HANDOFF.md:
- Death sequence (4-5 seconds)
- Enemy hit feedback
- Performance lag
- Ground scaling fix
- Cutscene decoupling

### ❓ "Has everything we've done, is uncommitted, in documentation?"

**Current Session Work**: YES ✅
- All combat fixes documented in SESSION-HANDOFF.md
- Combat changes already committed

**Previous Session Work**: NO ❌
- Profile selection source files not documented in current handoff
- Only mentioned briefly in summary
- Need to either: commit them, document them, or clarify status

### ❓ "TODO.md relevance?"

**NO** ❌
- TODO.md is from OLD work loss incident
- About Journey buttons and floating damage
- NOT related to current session (combat fixes)
- Should be deleted

---

## Files That Need User Decision

**Previous Session Source Files** (not in current handoff):
1. `apps/web/src/lib/pixi/app.ts`
2. `apps/web/src/lib/pixi/systems/profile-name-entry.ts`
3. `apps/web/src/lib/pixi/systems/profile-selection-manager.ts`
4. `apps/web/src/lib/pixi/systems/profile-shapes-test.ts`
5. `packages/db/src/profile-repo.ts`

**Question for User**:
- Are these files from completed previous work that should be committed?
- Or are they work-in-progress that needs more development?
- Should we review the diffs before committing?

---

## Summary

✅ **Current session work**: Fully documented and committed
✅ **Current TODOs**: All in SESSION-HANDOFF.md
❌ **TODO.md**: Outdated, should delete
✅ **Scripts**: Ready to commit
✅ **Docs**: Ready to commit
⚠️ **Previous session files**: Need review before committing
