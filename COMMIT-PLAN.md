# Commit Plan - Uncommitted Work Analysis

## Current Commit Status

### ✅ Already Committed (This Session)
- `SESSION-HANDOFF.md` - Complete session documentation
- `apps/web/src/lib/pixi/enemy-sprites.ts` - Added baseArcana + balanced damage
- `apps/web/src/lib/pixi/systems/dragon-protagonist.ts` - Increased HP to 10000

**Commit Message**: `fix(combat): add baseArcana and balance dragon HP for survivability`

---

## Uncommitted Source Files Analysis

### Modified Source Files (From Previous Session)

#### 1. `.claude/settings.local.json`
**Status**: ❌ SKIP - Local settings, should not commit
**Action**: None

#### 2. `apps/web/src/lib/pixi/app.ts`
**Status**: ⚠️ INVESTIGATE
**Context**: Modified in previous session (profile selection work)
**Action**: Check changes before committing

#### 3. `apps/web/src/lib/pixi/systems/profile-name-entry.ts`
**Status**: ⚠️ INVESTIGATE
**Context**: Profile selection UI work from previous session
**Action**: Check changes before committing

#### 4. `apps/web/src/lib/pixi/systems/profile-selection-manager.ts`
**Status**: ⚠️ INVESTIGATE
**Context**: Profile selection UI work from previous session
**Action**: Check changes before committing

#### 5. `apps/web/src/lib/pixi/systems/profile-shapes-test.ts`
**Status**: ⚠️ INVESTIGATE
**Context**: Profile selection UI work from previous session
**Action**: Check changes before committing

#### 6. `packages/db/src/profile-repo.ts`
**Status**: ⚠️ INVESTIGATE
**Context**: Profile selection backend work from previous session
**Action**: Check changes before committing

### Untracked Files

#### Documentation

1. **`TODO.md`**
   - **Content**: Old checklist from work loss incident
   - **Status**: ⚠️ REVIEW - May be outdated
   - **Action**: Check if still relevant or archive

2. **`docs/ui/combat-critical-fixes-plan.md`**
   - **Content**: Planning doc for this session's work
   - **Status**: ✅ COMMIT - Documents combat fixes
   - **Action**: Commit with combat fixes group

3. **`docs/ui/profile-selection-animation-plan.md`**
   - **Content**: Planning doc from previous session
   - **Status**: ✅ COMMIT - Documents previous work
   - **Action**: Commit with profile selection group

#### Scripts

4. **`scripts/rebuild-with-cache-clear.bat`**
   - **Content**: Windows utility script for rebuilding packages
   - **Status**: ✅ COMMIT - Useful utility
   - **Action**: Commit as utility script

5. **`scripts/rebuild-with-cache-clear.sh`**
   - **Content**: Unix/Linux utility script for rebuilding packages
   - **Status**: ✅ COMMIT - Useful utility
   - **Action**: Commit as utility script

#### Configuration

6. **`configs/eslint/eslint.config.js`**
   - **Content**: ESLint configuration
   - **Status**: ⚠️ INVESTIGATE - May be generated or custom
   - **Action**: Check if this should be committed

### Generated Files (DO NOT COMMIT)
- All `.svelte-kit/` files - SKIP
- All `tsconfig.tsbuildinfo` files - SKIP
- All `tests/.artifacts/` files - SKIP
- All `apps/web/logs/` files - SKIP

---

## Recommended Commit Strategy

### Phase 1: Investigate Previous Session Changes ⚠️

**Check what changed in profile selection files:**
```bash
git diff apps/web/src/lib/pixi/app.ts
git diff apps/web/src/lib/pixi/systems/profile-name-entry.ts
git diff apps/web/src/lib/pixi/systems/profile-selection-manager.ts
git diff apps/web/src/lib/pixi/systems/profile-shapes-test.ts
git diff packages/db/src/profile-repo.ts
```

**Decision Point**:
- If changes are complete and working → Commit as separate group
- If changes are incomplete/experimental → Create WIP commit or stash
- If changes are from previous completed work → Commit with proper message

### Phase 2: Commit Utility Scripts ✅

```bash
git add scripts/rebuild-with-cache-clear.bat
git add scripts/rebuild-with-cache-clear.sh
git commit -m "chore(scripts): add rebuild-with-cache-clear utility scripts

- Add Windows batch script for cache clearing and rebuild
- Add Unix/Linux shell script for cache clearing and rebuild
- Both scripts clear tsconfig.tsbuildinfo files and rebuild packages
- Useful for resolving build issues and ensuring clean state"
```

### Phase 3: Commit Documentation ✅

```bash
git add docs/ui/profile-selection-animation-plan.md
git add docs/ui/combat-critical-fixes-plan.md
git commit -m "docs(ui): add planning documents for profile selection and combat fixes

- Add profile-selection-animation-plan.md (previous session work)
- Add combat-critical-fixes-plan.md (current session work)
- Documents implementation plans and critical issues
- Provides context for future development"
```

### Phase 4: Review and Handle TODO.md ⚠️

**Option A**: If TODO.md is still relevant
```bash
git add TODO.md
git commit -m "docs: add feature implementation checklist

- Track missing features from work loss incident
- Checklist for Journey buttons, floating damage, enemy attributes
- Priority ordering for systematic verification"
```

**Option B**: If TODO.md is outdated
```bash
rm TODO.md
# or archive it to docs/archive/TODO-2025-11-06.md
```

### Phase 5: Commit Previous Session Work (If Complete) ✅

**Only if changes are complete and working:**
```bash
git add apps/web/src/lib/pixi/app.ts
git add apps/web/src/lib/pixi/systems/profile-name-entry.ts
git add apps/web/src/lib/pixi/systems/profile-selection-manager.ts
git add apps/web/src/lib/pixi/systems/profile-shapes-test.ts
git add packages/db/src/profile-repo.ts
git commit -m "feat(ui): complete profile selection UI with world data integration

Previous session work:
- Implement profile selection manager with animation system
- Add profile name entry system
- Integrate world data for ward/land names
- Fix 'undefined' ward name display bug
- Update profile repository with world data lookups

Related: SESSION-HANDOFF.md mentions this as previous session context"
```

---

## Files Explicitly NOT in Documentation

### Modified Files Missing from Docs ❌

The following modified files are NOT mentioned in SESSION-HANDOFF.md:
1. `apps/web/src/lib/pixi/app.ts`
2. `apps/web/src/lib/pixi/systems/profile-name-entry.ts`
3. `apps/web/src/lib/pixi/systems/profile-selection-manager.ts`
4. `apps/web/src/lib/pixi/systems/profile-shapes-test.ts`
5. `packages/db/src/profile-repo.ts`

**These are from the PREVIOUS session** (mentioned in summary but not detailed in handoff)

### What SESSION-HANDOFF.md Documents ✅

SESSION-HANDOFF.md documents:
- ✅ Arcana system fixes (baseArcana addition)
- ✅ Combat balance changes (HP + damage)
- ✅ SvelteKit cache fix
- ✅ Remaining features to implement (death sequence, hit feedback, etc.)
- ✅ Event flow verification
- ✅ Testing instructions

### What's Missing from Documentation ❌

**Previous Session Work Not in Handoff:**
- Profile selection UI implementation details
- Profile name entry system details
- World data integration details
- Ward name "undefined" fix details

**Recommendation**: Either:
1. Add previous session summary to SESSION-HANDOFF.md, OR
2. Create separate handoff for previous session work

---

## TODO Comparison

### TODOs in SESSION-HANDOFF.md ✅
- [x] Arcana rewards system working
- [x] Combat balance adjusted
- [x] Dev server running cleanly
- [x] Code changes committed to git
- [ ] Dragon survivability testing
- [ ] Arcana counter verification
- [ ] Death sequence implementation
- [ ] Enemy hit feedback
- [ ] Performance investigation
- [ ] Ground scaling fix
- [ ] Cutscene decoupling

### TODOs in Current Todo List (via TodoWrite tool) ✅
- [x] Clear Vite cache and restart dev server
- [x] Adjust combat balance for 10+ hit survivability
- [x] Write handoff document and commit changes
- [ ] Test arcana awards and combat balance in game
- [ ] Implement death sequence (4-5 seconds with pushback)
- [ ] Add enemy hit feedback (blink effect)
- [ ] Investigate and fix performance lag
- [ ] Fix ground scaling with F12 dev tools

### TODOs in TODO.md (File) ⚠️
**These are from OLD work loss incident:**
- [ ] Journey Button System (assets, hover, selected states)
- [ ] Floating Damage Number System
- [ ] Enemy Attributes System
- [ ] UI System and Layering
- [ ] Missing Assets Investigation
- [ ] Code Integration Verification
- [ ] Testing and Validation

**Status**: Unclear if these are still relevant - may have been completed or abandoned

---

## Recommended Action Plan

### Step 1: Investigate Previous Session Files
```bash
# Check what actually changed
git diff HEAD apps/web/src/lib/pixi/app.ts | head -50
git diff HEAD apps/web/src/lib/pixi/systems/profile-*.ts | head -50
git diff HEAD packages/db/src/profile-repo.ts | head -50
```

### Step 2: Commit Clean Utility/Docs
```bash
# Commit scripts (safe, useful utilities)
git add scripts/*.sh scripts/*.bat
git commit -m "chore(scripts): add rebuild utility scripts"

# Commit planning docs (safe, documentation only)
git add docs/ui/*.md
git commit -m "docs(ui): add planning documents"
```

### Step 3: Review TODO.md
- Determine if still relevant
- Either commit or archive/delete

### Step 4: Handle Previous Session Work
- Review diffs
- If complete → commit with descriptive message
- If incomplete → discuss with user
- If experimental → consider WIP commit or stash

### Step 5: Update Documentation
- Ensure SESSION-HANDOFF.md covers everything committed
- Or create additional handoff for previous session

---

## Summary

**Committed This Session**: 3 files (combat fixes)
**Uncommitted Source**: 6 files (5 previous session + 1 settings)
**Uncommitted Docs**: 3 files (TODO.md + 2 planning docs)
**Uncommitted Scripts**: 2 files (rebuild utilities)
**Generated/Temp**: Many files (should NOT commit)

**Critical Question**: Are the previous session source file changes complete and working?
**Answer Needed**: Review diffs and test before committing

**All TODOs Documented**: Yes, in multiple places (handoff, TodoWrite tool, TODO.md file)
**Documentation Complete**: No - previous session work not fully documented in handoff
