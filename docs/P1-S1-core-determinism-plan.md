# P1-S1/9 Planning Document: Core Types, Constants, and Determinism

**Date**: January 15, 2025
**Phase**: Phase 1 - Game Content Development
**Workpack**: P1-S1/9 - Core Types, Constants, and Determinism
**Status**: Planning Complete, Ready for Implementation

## Issue Analysis

### Objective

Lock shared contracts (Sim↔UI), timing model, and deterministic RNG so every later system (spawns,
collisions,
economy)
is
reproducible,
testable,
and
fast.

### Scope

- **shared/types.ts**: DTOs for entities, messages, telemetry events

- **shared/constants.ts**: IDs, numeric budgets, tick sizes

- **Deterministic RNG**: per-system streams; PCG32 implementation

- **Fixed clock**: accumulator (DT = 16.667ms), foreground 60 Hz, background 2 Hz

- **Snapshot stream**: format + golden tests for byte-equality over 60s

- **Guards/validation**: all Sim↔UI messages

### Success Criteria

- Given fixed seed + inputs, two 60-second runs produce byte-equal snapshots

- RNG sequence unit tests pass across platforms

- Accumulator never skips >1 frame at 60 Hz in FG; BG ticks fire at 2 Hz ±1 frame

- Zero per-frame allocations in core loop (verified in perf harness later)

## Implementation Plan

### Chapter 1/10: Objectives, Scope, and Success Criteria ✅

- [x] Analyze P1-S1/9 requirements

- [x] Create comprehensive planning document

- [x] Define success criteria and quality gates

### Chapter 2/10: Directory & Build Setup

- [ ] Create `/packages/engine` directory structure

- [ ] Set up TypeScript configuration with strict mode

- [ ] Configure package.json with proper dependencies

- [ ] Set up build system with tree-shaking support

### Chapter 3/10: Constants, IDs, and Enums

- [ ] Implement `shared/constants.ts` with all required constants

- [ ] Create `shared/enums.ts` with Family, AbilityId, LogLvl enums

- [ ] Build `shared/ids.ts` with Lands and Wards type-safe IDs

- [ ] Add proper TypeScript types and validation

### Chapter 4/10: Core Types & Contracts

- [ ] Define entity types (Enemy, ProjectileHot, SimStats)

- [ ] Create SimCtx opaque context type

- [ ] Implement UiToSim and SimToUi message contracts

- [ ] Add comprehensive type definitions

### Chapter 5/10: Deterministic RNG (Streams & Seeds)

- [ ] Implement PCG32 core generator

- [ ] Create seed management and mixing utilities

- [ ] Build RngStreams class for named sub-streams

- [ ] Add deterministic stream derivation

### Chapter 6/10: Fixed Clock & Accumulator

- [ ] Implement FixedClock class with accumulator pattern

- [ ] Create background tick system (2 Hz)

- [ ] Add frame clamping and spiral-of-death prevention

- [ ] Implement timing validation and testing

### Chapter 7/10: Snapshot Stream & Codec

- [ ] Create snapshot encoding/decoding system

- [ ] Implement 64-bit xxhash-like hasher

- [ ] Build golden test framework for byte-equality

- [ ] Add snapshot interval management (1 Hz)

### Chapter 8/10: Protocol Runtime & Validation

- [ ] Implement message validation layer

- [ ] Add security guards for untrusted UI messages

- [ ] Create rate limiting and cooldown systems

- [ ] Build build string verification

### Chapter 9/10: Testing Matrix

- [ ] Create unit tests for RNG sequences

- [ ] Implement integration tests for clock accumulator

- [ ] Build E2E tests with golden snapshot verification

- [ ] Add comprehensive test coverage (95%+ for sim/_, 100% for shared/_)

### Chapter 10/10: Deliverables & Documentation

- [ ] Create engine bootstrap API (createEngine function)

- [ ] Write comprehensive documentation

- [ ] Verify all quality gates pass 100%

- [ ] Create acceptance evidence and test artifacts

## Risk Assessment

### High Risk

- **Determinism Complexity**: Ensuring byte-equal snapshots across platforms requires careful implementation

- **Performance Requirements**: Zero per-frame allocations in core loop is challenging

- **RNG Stream Management**: Named streams must be deterministic and isolated

### Medium Risk

- **Type Safety**: Complex message contracts need robust validation

- **Clock Precision**: Fixed timestep with accumulator pattern requires careful timing

- **Test Coverage**: Achieving 95%+ coverage on simulation code

### Low Risk

- **Build System**: Standard TypeScript project setup

- **Documentation**: Well-defined requirements and examples

## Mitigation Strategies

### Determinism

- Use PCG32 with well-tested implementation

- Implement comprehensive golden tests

- Add cross-platform validation

### Performance

- Use typed arrays for hot paths

- Implement object pooling patterns

- Add performance monitoring hooks

### Type Safety

- Use Zod-like validation (lightweight)

- Implement comprehensive type guards

- Add runtime validation for all messages

## Quality Gates

### Chapter Completion Gates

- [ ] All tests pass 100%

- [ ] TypeScript strict mode compliance

- [ ] ESLint/Prettier validation

- [ ] Documentation updated

- [ ] GitHub pipeline passes 100%

### Final Acceptance Gates

- [ ] Two 60-second runs produce byte-equal snapshots

- [ ] RNG sequence tests pass across platforms

- [ ] Clock accumulator maintains timing precision

- [ ] Zero per-frame allocations verified

- [ ] Size budget compliance (≤25 KB min+gz)

## Dependencies

### Internal Dependencies

- **Phase 0 Foundation**: W3 Worker Sim Harness, W4 Database, W5 Logging

- **Existing Packages**: @draconia/shared, @draconia/sim (will be restructured)

### External Dependencies

- **TypeScript**: ES2020 target, strict mode

- **Build Tools**: Rollup + Terser for tree-shaking

- **Testing**: Vitest for unit tests, custom runner for integration

## Next Story Hooks

### P1-S2 Dependencies

- Enemy/Projectile systems will import `distStepM`, `wardMicroRamp`

- Will request RNG streams "spawns" and "variance"

- Will not change any S1 behavior

### P1-S9 Dependencies

- Telemetry worker will consume SimToUi.tick stats

- Will write NDJSON logs

- Snapshot format remains stable (append-only fields allowed)

## Acceptance Criteria

### Functional Requirements

- [ ] Deterministic RNG with named streams

- [ ] Fixed timestep clock (16.667ms)

- [ ] Background tick system (2 Hz)

- [ ] Snapshot codec with byte-equality

- [ ] Message validation and security

### Performance Requirements

- [ ] Zero per-frame allocations in core loop

- [ ] ≤25 KB min+gz bundle size

- [ ] 60 Hz foreground, 2 Hz background timing

- [ ] No frame skips >1 in steady state

### Quality Requirements

- [ ] 95%+ test coverage for sim/\*

- [ ] 100% test coverage for shared/\*

- [ ] TypeScript strict mode compliance

- [ ] All CI/CD gates pass 100%

### Documentation Requirements

- [ ] Complete API documentation

- [ ] Determinism rules checklist

- [ ] RNG stream naming guidelines

- [ ] "Do/Don't" guide for contributors

---

**This planning document provides the complete roadmap for implementing P1-S1/9: Core Types, Constants, and Determinism. Each chapter builds upon the previous, with quality gates ensuring 100% success before proceeding to the next phase.**
