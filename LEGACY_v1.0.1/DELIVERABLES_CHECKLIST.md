# Phase 0/1 Deliverables Checklist ✅

## A) Screenshots/GIFs (in `/images/`)
- [ ] `/images/phase0_overlay.png` - Debug overlay in bottom-right of combat pane
- [ ] `/images/phase0_overlay_resized.png` - Overlay position after browser resize
- [ ] `/images/phase1_tabs_focus.png` - Keyboard focus on Enchant tab with visible focus ring
- [ ] `/images/phase0_overlay_scroll.gif` (optional) - Overlay scroll/resize demo

**Note**: Screenshots need to be taken manually. See `/images/screenshots-readme.md` for instructions.

## B) Console/Build Proof ✅
- [x] `/logs/dev-console.txt` - Contains required `[BOOT OK]` lines, no break_eternity errors
- [x] `/logs/lighthouse-a11y.md` (optional) - Accessibility audit results

## C) Tests (machine-verifiable) ✅
- [x] `/tests/unit-summary.txt` - Vitest output showing 111 tests passing
- [x] `/tests/e2e-summary.txt` - Playwright output showing 4 tests passing
- [x] All required test suites included:
  - `tests/num/decimal.spec.ts` (Decimal ESM works)
  - `tests/config/enemyConfig.spec.ts` (config loader + schema)
  - `tests/boot/diagnostics.spec.ts` (boot diagnostics)
  - `e2e/overlay.spec.ts` (overlay renders with required labels)
  - `e2e/overlay-position.spec.ts` (single overlay, bottom-right anchored)
  - `e2e/no-legacy-overlay.spec.ts` (no legacy overlays)
  - `e2e/tabs-a11y.spec.ts` (tabs are keyboard accessible)

## D) Config & Code Proof ✅
- [x] `/public/enemy-config.json` - Valid JSON with agreed defaults
- [x] `/diffs/decimal-imports.txt` - Shows only one import in `src/lib/num/decimal.ts`
- [x] `/src/lib/components/MainTabsRow.svelte` - Semantic buttons with ARIA
- [x] `/src/lib/dev/EnemyDebugOverlay.svelte` - Bottom-right positioned, non-blocking

## E) Documentation ✅
- [x] `/docs/PHASE_0_1_VERIFICATION.md` - Complete verification guide

## Final Acceptance Checklist ✅
- [x] **Overlay**: bottom-right, single instance, shows all required counters, non-blocking (pointer-events:none)
- [x] **Decimal**: unified ESM import only via `$lib/num/decimal`; no require anywhere; unit test passes
- [x] **Config**: `/public/enemy-config.json` exists, validated by zod; loader sets `enemyConfigLoaded=true`; unit test passes
- [x] **Tabs a11y**: semantic buttons with roles/aria/keyboard; no Svelte a11y warnings; e2e passes
- [x] **Tests**: Vitest all green (111 tests); Playwright all green (4 tests)
- [x] **Console**: `[BOOT OK]` lines present; no break_eternity or config 404 errors
- [x] **Docs**: verification guide included

## Quick Verification Commands
```bash
# Start development
npm run dev

# Run all tests
npm run test
npm run e2e

# Build verification
npm run build
```

**Status**: Phase 0/1 implementation complete. Ready for stakeholder review and Phase 2 kickoff.