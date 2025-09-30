# Quick Reference - CI Pipeline Debugging

## Current Status (2025-09-30)

- **Pipeline**: 0/6 workflows passing
- **Branch**: `feat/p1-e4-s3-soul-forging-system`
- **PR**: #58
- **Main Issue**: TypeScript compilation errors

## Immediate Actions Required

### 1. Fix Missing Dependencies

```bash
pnpm add -D @types/uuid
```

### 2. Fix Export Issues

- Export `EnchantCostCalculator` interface from `enchant-costs.ts`
- Export missing classes from scaling files
- Fix duplicate exports in `index.ts`

### 3. Fix Type Mismatches

- Align interface definitions with implementations
- Fix return type mismatches in `enchant-manager.ts`
- Add missing properties to interfaces

### 4. Fix Private Method Access

- Make private methods public or create public wrappers
- Update method access in `soul-forging-costs.ts`

### 5. Fix Null Safety

- Add null checks in `soul-forging-persistence.ts`
- Handle undefined objects properly

## Commands to Run

```bash
# Check current status
gh run list --limit 5

# Run local type check
pnpm run type-check

# Run local tests
pnpm run test:all

# Fix and commit
git add .
git commit -m "fix: resolve TypeScript compilation errors"
git push
```

## Files to Fix (Priority Order)

1. `packages/sim/src/economy/enchant-costs.ts` - Export interface
2. `packages/sim/src/economy/arcana-scaling.ts` - Export class
3. `packages/sim/src/economy/soul-power-scaling.ts` - Export class
4. `packages/sim/src/economy/enchant-manager.ts` - Fix type mismatches
5. `packages/sim/src/economy/soul-forging-*.ts` - Fix remaining issues
6. `packages/sim/src/index.ts` - Fix duplicate exports
