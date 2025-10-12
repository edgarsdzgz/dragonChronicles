# Quick Reference - Currency Background & UI Debugging

## Current Status (2025-01-15)

- **Game Status**: ✅ RENDERING (Fixed critical crash)
- **Branch**: Working on main branch
- **Main Issue**: Currency background panel not rendering visually
- **Critical Error**: `TypeError: Cannot read properties of null (reading 'x') at updateProjectiles`

## Immediate Actions Required

### 1. Fix Currency Background Panel Rendering

- **File**: `apps/web/src/lib/pixi/scrolling-background.ts`
- **Issue**: Graphics object created and added to stage but not visible
- **Current Status**: Panel is bright red (debugging color) but still not visible
- **Console Evidence**: Panel added at index 0, visible: true, alpha: 0.8

### 2. Fix Critical Projectile Update Error

- **File**: `apps/web/src/lib/pixi/scrolling-background.ts` line 1309
- **Error**: `TypeError: Cannot read properties of null (reading 'x')`
- **Impact**: Game instability during projectile updates
- **Action**: Add null checks before accessing object properties

### 3. Debug Dragon Health Bar Rendering

- **Issue**: Dragon health bar not visible despite dragon being damaged (-110 HP)
- **Console Shows**: "Drawing dragon health bar" but no visual output
- **Action**: Investigate why Graphics drawing doesn't produce visible health bar

### 4. Investigate Persistent Black Box

- **Issue**: Small black box appearing above currency area intermittently
- **Status**: Not visible in current screenshot but reported by user
- **Action**: Enhanced debugging added to track Graphics objects

## Debugging Commands

```bash
# Check current branch and status
git status
git branch

# Run game locally
pnpm run dev:web

# Check for linting errors
pnpm run lint

# Check TypeScript compilation
pnpm run typecheck
```
