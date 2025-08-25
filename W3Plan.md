<!-- markdownlint-disable -->

# W3 Planning Document — P0-W3 Worker Sim Harness

## Issue Analysis

**Goal**: Replace W2's in-page background simulation with a Web Worker-based simulation that provides full-rate foreground operation, 2Hz background operation, offline time accounting, and auto-recovery capabilities.

**Dependencies**: P0-W1 complete ✅ (repo structure, TypeScript strict, quality gates), P0-W2 complete ✅ (App Shell & Background Sim)

**Core Requirements**:
- Web Worker simulation with protocol v1 handshake
- Deterministic RNG (PCG32 or xoroshiro128+)
- Fixed-timestep loop (16.67ms) with accumulator
- Visibility-aware modes (fg/bg) with proper throttling
- Offline simulation stub with covered time accounting
- Auto-recovery supervisor with exponential backoff
- Dev route for testing and validation
- Comprehensive test suite (unit, integration, E2E)

## W2 → W3 Architecture Evolution

### W2 Background Sim (Current)
```javascript
// In-page 2Hz loop
setInterval(() => {
  window.dispatchEvent(new CustomEvent('bg-tick', { detail: { dt } }));
}, 500);
```

### W3 Worker Sim (Target)
```javascript
// Worker-owned simulation
const worker = new Worker('@draconia/sim/src/sim.worker.ts');
worker.postMessage({ t: 'boot', version: 1, seed: 12345 });
worker.postMessage({ t: 'start', mode: 'fg' }); // or 'bg'
```

**Key Improvements**:
- ✅ **True isolation**: Simulation runs in separate thread
- ✅ **Performance**: No UI blocking during simulation
- ✅ **Recovery**: Auto-restart on crashes
- ✅ **Offline accounting**: Proper wall-clock gap handling
- ✅ **Protocol**: Versioned message contract

## Implementation Strategy

### Phase 1: Protocol Foundation (Steps 1-2)
**Focus**: Establish the communication contract and deterministic foundations

**Step 1 — Protocol v1**
- Create `packages/shared/src/protocol.ts`
- Define `UIToSim` and `SimToUI` message types
- Include version handshake, mode switching, offline simulation
- Export from shared package for both UI and worker consumption

**Step 2 — Deterministic RNG**
- Implement PCG32 in `packages/shared/src/rng.ts`
- Ensure seed + sequence determinism
- Add unit tests for reproducibility
- Foundation for W4 persistence and W5 logging

**Risk Assessment**: Low - TypeScript types and RNG are well-understood patterns

### Phase 2: Core Simulation Engine (Steps 3-4)
**Focus**: Build the simulation loop and state management

**Step 3 — Fixed-timestep Clock & Loop**
- Implement `StepClock` with accumulator pattern
- Create `SimLoop` with RAF (fg) and setInterval (bg) modes
- Ensure proper throttling (≤60Hz fg, 2Hz bg)
- Handle mode switching without message flooding

**Step 4 — Minimal Sim State**
- Create placeholder `SimState` with basic counters
- Implement `step()` function (allocation-free)
- Prepare for Phase 1 gameplay integration
- Focus on performance and determinism

**Risk Assessment**: Medium - Fixed-timestep loops require careful accumulator management

### Phase 3: Worker Integration (Steps 5-6)
**Focus**: Connect worker to UI with proper error handling

**Step 5 — Worker Entry & Message Handling**
- Create `packages/sim/src/sim.worker.ts`
- Implement message routing and state management
- Handle offline simulation with covered time accounting
- Provide proper error reporting and fatal handling

**Step 6 — UI Wrapper & Visibility Bridge**
- Create `SimClient` supervisor with auto-recovery
- Implement exponential backoff for crashes
- Bridge `document.visibilityState` to worker modes
- Maintain W2 compatibility via dev flag

**Risk Assessment**: High - Worker communication and recovery logic is complex

### Phase 4: Testing & Validation (Steps 7-8)
**Focus**: Comprehensive testing and dev tools

**Step 7 — Dev Route**
- Create `/dev/sim` for manual testing
- Provide controls for all worker operations
- Show real-time metrics and cadence
- Enable crash simulation for recovery testing

**Step 8 — Test Suite**
- Unit tests for RNG determinism and clock accuracy
- Integration tests for protocol handshake and mode switching
- E2E tests for crash recovery and offline simulation
- Performance validation for message throttling

**Risk Assessment**: Low - Testing infrastructure is established

## Technical Architecture

### Protocol Design
```typescript
// UI → Worker
type UIToSim =
  | { t: 'boot'; version: number; seed: number }
  | { t: 'start'; mode: SimMode }
  | { t: 'stop' }
  | { t: 'setMode'; mode: SimMode }
  | { t: 'offline'; elapsedMs: number }
  | { t: 'ability'; id: string };

// Worker → UI
type SimToUI =
  | { t: 'ready'; version: number }
  | { t: 'tick'; now: number; dtMs: number; mode: SimMode; stats: SimStats }
  | { t: 'bgCovered'; coveredMs: number }
  | { t: 'log'; level: 'info'|'warn'|'error'; msg: string }
  | { t: 'fatal'; reason: string };
```

### Worker Lifecycle
1. **Boot**: Version handshake, seed initialization
2. **Start**: Begin simulation in specified mode
3. **Run**: Fixed-timestep loop with mode-appropriate throttling
4. **Recover**: Auto-restart on fatal errors with backoff
5. **Offline**: Simulate wall-clock gaps minus covered background time

### Auto-Recovery Strategy
```javascript
class SimClient {
  private backoffMs = 500;
  
  private handleFatal(reason: string) {
    this.w?.terminate();
    setTimeout(() => {
      this.spawn();
      this.post({ t: 'boot', version: 1, seed: this.seed });
      this.post({ t: 'start', mode: this.mode });
      this.backoffMs = Math.min(this.backoffMs * 2, 8000);
    }, this.backoffMs);
  }
}
```

## Risk Mitigation

### High-Risk Areas
1. **Worker Communication Complexity**
   - **Mitigation**: Start with simple protocol, add complexity incrementally
   - **Validation**: Comprehensive integration tests for all message flows

2. **Fixed-Timestep Accumulator**
   - **Mitigation**: Use proven accumulator pattern with max steps per frame
   - **Validation**: Unit tests with controlled time simulation

3. **Auto-Recovery Logic**
   - **Mitigation**: Exponential backoff with maximum limits
   - **Validation**: E2E tests with forced crashes

### Performance Considerations
1. **Message Throttling**: Ensure ≤60Hz in foreground, exactly 2Hz in background
2. **Memory Management**: Keep background simulation allocation-free
3. **Worker Overhead**: Minimize serialization costs for frequent messages

## Testing Strategy

### Unit Tests
- **RNG**: Determinism across seeds and sequences
- **Clock**: Fixed-step counts and accumulator bounds
- **Protocol**: Type safety and message validation

### Integration Tests
- **Handshake**: Boot → ready → start → tick flow
- **Mode Switching**: fg ↔ bg transitions without message flooding
- **Offline Simulation**: Proper covered time accounting

### E2E Tests
- **Crash Recovery**: Worker restart with state restoration
- **Visibility Changes**: Document visibility ↔ worker mode synchronization
- **Performance**: Message rate validation and memory stability

## Success Criteria

### Functional Requirements
- ✅ Worker spawns and responds to boot message
- ✅ Foreground mode produces ≤60Hz tick messages
- ✅ Background mode emits bgCovered at exactly 2Hz
- ✅ Offline simulation accounts for covered background time
- ✅ Auto-recovery restarts worker with exponential backoff
- ✅ Dev route demonstrates all functionality

### Performance Requirements
- ✅ No UI blocking during simulation
- ✅ Message throttling prevents spam
- ✅ Memory usage remains stable
- ✅ Recovery time < 8 seconds maximum

### Quality Requirements
- ✅ All tests pass (unit, integration, E2E)
- ✅ TypeScript strict mode compliance
- ✅ No runtime errors in normal operation
- ✅ Graceful degradation on worker failures

## Dependencies & Integration Points

### W2 Compatibility
- Keep `background.ts` as dev fallback (guarded by `APP_FLAGS.useLegacyBgSim`)
- Default to worker-backed simulation
- Maintain same event contract for UI components

### W4 Preparation
- RNG seed persistence ready for W4
- Worker state snapshot capability
- Protocol extensibility for persistence messages

### W5 Preparation
- Logging integration points identified
- Performance metrics collection ready
- Error reporting infrastructure in place

## Implementation Timeline

### Week 1: Foundation (Steps 1-2)
- Protocol v1 implementation
- Deterministic RNG with tests
- Basic worker message handling

### Week 2: Core Engine (Steps 3-4)
- Fixed-timestep clock and loop
- Minimal simulation state
- Worker entry point

### Week 3: Integration (Steps 5-6)
- UI wrapper and supervisor
- Visibility bridge
- Auto-recovery implementation

### Week 4: Testing (Steps 7-8)
- Dev route and manual testing
- Comprehensive test suite
- Performance validation

## TODO List

### Phase 1: Protocol Foundation
- [ ] **STEP 1**: Create protocol v1 types and exports
- [ ] **STEP 2**: Implement deterministic RNG with tests

### Phase 2: Core Engine
- [ ] **STEP 3**: Build fixed-timestep clock and loop
- [ ] **STEP 4**: Create minimal simulation state

### Phase 3: Worker Integration
- [ ] **STEP 5**: Implement worker entry and message handling
- [ ] **STEP 6**: Create UI wrapper and visibility bridge

### Phase 4: Testing & Validation
- [ ] **STEP 7**: Build dev route for manual testing
- [ ] **STEP 8**: Implement comprehensive test suite

### Integration & Polish
- [ ] **W2 Compatibility**: Dev flag for legacy background sim
- [ ] **Performance Validation**: Message rate and memory testing
- [ ] **Documentation**: Update architecture docs for worker sim
- [ ] **Cleanup**: Remove W2 background sim after validation

## Notes & Considerations

### Development Approach
- **Incremental**: Build and test each step before proceeding
- **Validation**: Use dev route for manual testing throughout
- **Recovery**: Test crash scenarios early and often
- **Performance**: Monitor message rates and memory usage

### Future Considerations
- **W4 Integration**: Worker state persistence
- **W5 Integration**: Performance logging and metrics
- **Phase 1**: Gameplay simulation integration
- **Scaling**: Multiple worker support for complex simulations

### Team Coordination
- **Code Review**: Each step should be reviewed before proceeding
- **Testing**: All team members should validate dev route functionality
- **Documentation**: Update architecture docs as implementation progresses
- **Integration**: Coordinate with W4 and W5 planning

---

**Status**: Planning Complete ✅  
**Next**: Begin Step 1 implementation  
**Estimated Duration**: 4 weeks  
**Risk Level**: Medium (Worker complexity)  
**Dependencies**: W1 ✅, W2 ✅
