# Phase 0/1 Verification Guide

## Quick Start
- **Development**: `npm run dev` then visit http://localhost:5173/
- **Unit Tests**: `npm run test` (111 tests should pass)
- **E2E Tests**: `npm run e2e` (4 accessibility and overlay tests should pass)

## Enemy Config System
- **Location**: `/public/enemy-config.json`
- **Loading**: Automatically loaded on app startup in `src/routes/+page.svelte`
- **Validation**: Zod schema in `src/lib/config/enemyConfig.ts`
- **State**: Sets `enemyConfigLoaded` store to `true` when successfully loaded

## Debug Overlay Features
- **Position**: Bottom-right of combat pane (12px from edges)
- **Non-blocking**: `pointer-events: none` allows clicking through overlay
- **Required counters**: Config loaded, Enemies, Projectiles, Spawns/s, Cull count, InRange, Tracking, Distance
- **Single instance**: Guaranteed by conditional mount in `DragonCombatArea.svelte`

## Accessibility Improvements
- **Tabs**: All use semantic `<button>` elements with proper ARIA roles
- **Keyboard**: Enter/Space navigation works on all tabs
- **Focus**: Visible focus rings on all interactive elements
- **Warnings**: All Svelte a11y warnings for MainTabsRow have been resolved

## Acceptance Checklist ✅
- [x] Overlay: bottom-right, single instance, shows all required counters, non-blocking
- [x] Decimal: unified ESM import only via `$lib/num/decimal`; no require anywhere; unit test passes
- [x] Config: `/public/enemy-config.json` exists, validated by zod; loader sets `enemyConfigLoaded=true`
- [x] Tabs a11y: semantic buttons with roles/aria/keyboard; no Svelte a11y warnings; e2e passes
- [x] Tests: Vitest all green (111 tests); Playwright all green (4 tests)
- [x] Console: `[BOOT OK]` lines present; no break_eternity or config 404 errors