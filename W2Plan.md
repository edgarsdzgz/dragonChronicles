# W2 Planning Document — P0-W2 App Shell & Render Host

## Issue Analysis

**Goal**: Ship a bootable SvelteKit app that mounts a PixiJS stage with resize/DPR handling, HUD toggle (?hud=1) and object pooling primitives. Target ~60fps desktop, smart background simulation (render pause + lightweight sim continues), UI overlay decoupled from render tick.

**Dependencies**: P0-W1 complete ✅ (repo structure, TypeScript strict, quality gates established)

**Core Requirements**:
- SvelteKit app with adapter-static (GitHub Pages ready)
- PixiJS integration with smart visibility handling (pause rendering, continue lightweight simulation)
- DPR clamping (1-2x) and responsive canvas resize
- HUD toggle via query parameter
- Object pooling for performance
- UI/render decoupling via Svelte stores
- Performance harness for validation

## Implementation Plan

### Step 1: Bootstrap SvelteKit App
- Create `/apps/web` workspace package
- Install SvelteKit + adapter-static + PixiJS dependencies
- Configure for GitHub Pages deployment
- Verify basic app serves on port 5173

### Step 2: PixiJS Application Mount with Background Simulation
- Implement DPR clamping utility (1-2x range)
- Create lightweight BackgroundSim system (2Hz default, CustomEvent-based)
- Create mountPixi() function with smart visibility handling
- **Smart pause**: render stops when hidden, background sim continues via `bg-tick` events
- Implement resize handling and proper cleanup

### Step 3: HUD Overlay System
- Create FPS counter utility
- Implement query parameter detection (?hud=1)
- Build HUD overlay using Svelte slots
- Ensure UI updates via stores/timers, completely decoupled from Pixi ticker

### Step 4: Object Pooling Primitives
- Generic Pool interface and implementation
- PixiJS-specific sprite pool
- Reset logic for proper reuse
- High reuse rate verification (≥90%)

### Step 5: Performance Harness
- `/dev/pool` route for stress testing
- Spawn/recycle controls for validation
- Memory stability verification
- Smooth performance after warmup

### Step 6: Local Testing Infrastructure
- Vitest configuration for web package
- Unit tests for pool, DPR, updated visibility policy, background sim
- Integration testing via manual verification

## Key Innovation: Background Simulation

**Smart Visibility Policy**:
- **Hidden**: Pause expensive rendering, continue lightweight simulation at 2Hz
- **Visible**: Resume full rendering, stop background simulation

**Benefits**:
- ✅ True idle game behavior (progress continues when hidden)
- ✅ Battery efficient (rendering paused saves CPU/GPU)
- ✅ Smooth resume experience
- ✅ W3-ready (same `bg-tick` event contract for Worker integration)

**Technical Architecture**:
```javascript
// Background sim dispatches standardized events
window.dispatchEvent(new CustomEvent('bg-tick', { detail: { dt } }));

// UI can listen without coupling to render loop
window.addEventListener('bg-tick', handleBackgroundTick);
```

## Risk Assessment

**Low Risk - Background Sim Implementation**:
- Simple CustomEvent-based architecture
- Conservative 2Hz frequency (≥250ms intervals)
- Stateless design (fire events only)
- *Mitigation*: Well-defined contract, W3-compatible

**Medium Risk - PixiJS Integration Complexity**:
- Canvas mounting in SvelteKit lifecycle
- Proper cleanup on component destroy
- *Mitigation*: Follow established patterns, comprehensive handle cleanup

**Low Risk - Performance Requirements**:
- 60fps target when visible
- Memory stability with pooling
- *Mitigation*: Stress test harness, pool reuse validation

## TODO List

### Core Implementation
- [ ] **STEP 1**: Bootstrap SvelteKit app
  - [ ] Create workspace package structure
  - [ ] Install dependencies (SvelteKit, adapter-static, PixiJS)
  - [ ] Configure svelte.config.js for static deployment
  - [ ] Verify dev server runs

- [ ] **STEP 2**: PixiJS application with background simulation
  - [ ] Implement DPR clamping utility
  - [ ] Create BackgroundSim system (2Hz, CustomEvent-based)
  - [ ] Create mountPixi() function with smart visibility policy
  - [ ] Implement responsive resize and cleanup
  - [ ] Verify render pause + background sim continues

- [ ] **STEP 3**: HUD overlay system
  - [ ] Create FPS counter (store-driven, not ticker-coupled)
  - [ ] Implement query parameter detection
  - [ ] Build HUD using Svelte slots
  - [ ] Create flags store for UI state

- [ ] **STEP 4**: Object pooling
  - [ ] Implement generic Pool interface
  - [ ] Create PixiJS sprite pool
  - [ ] Add reset logic
  - [ ] Verify high reuse rates (≥90%)

- [ ] **STEP 5**: Performance harness
  - [ ] Create /dev/pool route
  - [ ] Add spawn/recycle controls
  - [ ] Implement stress testing
  - [ ] Verify memory stability

- [ ] **STEP 6**: Testing infrastructure
  - [ ] Configure Vitest for web package
  - [ ] Write unit tests (pool, DPR, visibility policy, background sim)
  - [ ] Manual integration verification

### Quality Assurance
- [ ] Verify all acceptance criteria met
- [ ] Manual testing: tab switching behavior
- [ ] Performance validation (60fps visible, 2Hz hidden, memory stable)
- [ ] Build verification (static adapter)

## Acceptance Criteria

Must all be true before merge:

✅ **Deliverables Checklist**:
- [ ] `/apps/web` SvelteKit app builds & serves
- [ ] adapter-static ready for GitHub Pages/Cloudflare
- [ ] PixiJS blank stage renders at target fps when visible
- [ ] **Smart visibility**: rendering pauses when hidden, background sim continues at ~2Hz via `bg-tick` events
- [ ] DPR clamp (1–2x) + responsive canvas resize
- [ ] HUD toggle via ?hud=1 showing FPS (store-driven, not ticker-coupled)
- [ ] Object pooling utilities with ≥90% reuse rate
- [ ] UI overlay completely decoupled from Pixi ticker
- [ ] Local perf harness route (/dev/pool) works smoothly
- [ ] Unit tests pass for all components

✅ **Performance Requirements**:
- [ ] ~60fps idle when visible
- [ ] **Smart pause**: rendering stops when hidden, background sim continues at 2Hz
- [ ] Smooth spawning/recycling of 1000 sprites
- [ ] No unbounded memory growth
- [ ] Cold load <2s (dev server)
- [ ] Battery efficient when backgrounded

✅ **Integration Requirements**:
- [ ] Canvas fills viewport and resizes properly
- [ ] HUD toggles without reload glitches
- [ ] Tab switching: smooth hide/show with continued progress
- [ ] No frame-loop coupling in UI components

## File Structure

```
apps/web/
  package.json                        # SvelteKit + PixiJS dependencies
  svelte.config.js                   # adapter-static, GitHub Pages config
  vite.config.ts                     # Build configuration
  src/
    app.d.ts                         # TypeScript definitions
    routes/+layout.svelte            # Canvas mount + HUD slot
    routes/+layout.ts                # Query parameter detection
    routes/+page.svelte              # HUD implementation (store-driven)
    routes/dev/pool/+page.svelte     # Performance harness
    lib/pixi/app.ts                  # PixiJS mounting + smart visibility
    lib/pixi/hud.ts                  # FPS counter utility
    lib/pixi/dpr.ts                  # DPR clamping
    lib/sim/background.ts            # NEW: Background simulation system
    lib/pool/pool.ts                 # Generic pooling
    lib/pool/displayPool.ts          # PixiJS sprite pool
    lib/stores/flags.ts              # UI state management
  static/
    favicon.svg
    robots.txt

configs/vitest/vitest.config.ts      # Test configuration

tests/render/
  pool.spec.ts                       # Pool reuse validation
  dpr.spec.ts                        # DPR clamping tests  
  ticker.spec.ts                     # Updated visibility policy tests
  background.spec.ts                 # NEW: Background sim contract tests
```

## Background Simulation API

**Event Contract** (stable through W3 Worker integration):
```typescript
// Dispatched by BackgroundSim, listened to by game logic
type BgTickDetail = { dt: number };
window.dispatchEvent(new CustomEvent<BgTickDetail>('bg-tick', { detail: { dt } }));

// UI listens without render coupling
window.addEventListener('bg-tick', (e: CustomEvent<BgTickDetail>) => {
  const { dt } = e.detail;
  // Update stores, accumulate progress, etc.
});
```

**Handle Interface**:
```typescript
type BgSimHandle = { 
  start: () => void; 
  stop: () => void; 
  isRunning: () => boolean 
};
```

## W3 Integration Strategy

The `bg-tick` event contract remains stable when W3 introduces Worker simulation:
- Background simulation moves to Worker thread
- Same `bg-tick` CustomEvent dispatched to main thread
- UI code requires no changes
- Cleaner separation of concerns

## Validation Commands

```bash
# Development
pnpm i
pnpm --filter @draconia/web dev
# → Open http://localhost:5173/?hud=1 and /dev/pool
# → Test tab hide/show: render pauses, bg-tick continues

# Testing  
pnpm --filter @draconia/web test

# Production build
pnpm --filter @draconia/web build
```

## Code Quality Guidelines

Following user feedback on balance between concise and readable:
- ✅ **Clear function/variable names** over abbreviated
- ✅ **Single responsibility** functions
- ✅ **Consistent patterns** across similar components
- ✅ **Type safety** without excessive verbosity
- ❌ Avoid over-abstraction or unnecessary complexity
- ❌ Avoid obfuscated one-liners for the sake of brevity