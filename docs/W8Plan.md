# W8 Plan: Dev UX & Docs

**Workpack**: P0-W8 — Dev UX & Docs
**Issue**: [#33](https://github.com/edgarsdzgz/dragonChronicles/issues/33)
**Status**: 🚧 Planning
**Developer**: Edgar Diaz-Gutierrez
**Date**: 2025-09-06

## 🎯 **Objective**

Implement comprehensive developer experience improvements and documentation infrastructure to
support the development team and future contributors. This workpack focuses on feature flags, error
handling, architectural documentation, and developer onboarding.

## 📋 **Scope & Deliverables**

### **Core Features**

- ✅ **Typed Feature Flags**: App-wide feature flags sourced from env and querystring

- ✅ **Global Error Boundary**: Friendly error page with log export capability

- ✅ **Dev Menu**: Flag-gated developer navigation menu

- ✅ **ADRs**: Architecture Decision Records documenting W1-W5 decisions

- ✅ **CONTRIBUTING.md**: 10-minute developer onboarding guide

- ✅ **Security & Privacy**: Comprehensive policy documentation

### **Technical Requirements**

- Feature flags visible in dev HUD

- Error boundary with NDJSON log export

- Dev menu with links to /dev/pool, /dev/sim, /dev/logs

- ADRs for monorepo, worker sim, Dexie, logging, PWA, size budgets

- Complete developer setup documentation

- Comprehensive test coverage

## 🏗️ **Implementation Plan**

### **Phase 1: Feature Flags System**

**Priority**: High | **Estimated Time**: 2-3 hours

#### **Files to Create/Modify**

- `apps/web/src/lib/flags/flags.ts` - Typed flags interface

- `apps/web/src/lib/flags/store.ts` - Svelte store for flags

- `apps/web/src/lib/flags/query.ts` - Query string parsing

- `apps/web/src/routes/+layout.ts` - Flag initialization

- `apps/web/src/routes/+layout.svelte` - HUD display

#### **Key Features**

```typescript

export interface AppFlags {
  hud: boolean;              // ?hud=1
  devMenu: boolean;          // ?dev=1
  logConsole: boolean;       // dev console sink override
  useLegacyBgSim: boolean;   // legacy in-page bg loop (dev fallback)
  forceMode: ForceMode;      // fg|bg|auto (auto = visibility-driven)
}

```bash

#### **Acceptance Criteria**

- [ ] Navigating with `?hud=1&dev=1&mode=bg&legacyBg=1` shows HUD

- [ ] Store reflects query values correctly

- [ ] No runtime errors in flag system

- [ ] HUD displays active flags in dev mode only

### **Phase 2: Dev Menu Component**

**Priority**: High | **Estimated Time**: 1-2 hours

#### **Files to Create/Modify** (2)

- `apps/web/src/lib/ui/DevMenu.svelte` - Dev menu component

- `apps/web/src/routes/+layout.svelte` - Mount dev menu

#### **Key Features** (2)

- Flag-gated visibility (`$appFlags.devMenu`)

- Links to /dev/pool, /dev/sim, /dev/logs

- Clean, unobtrusive design

#### **Acceptance Criteria** (2)

- [ ] `?dev=1` shows menu with links

- [ ] Menu hidden by default

- [ ] Links navigate to correct dev routes

### **Phase 3: Global Error Boundary**

**Priority**: High | **Estimated Time**: 2-3 hours

#### **Files to Create/Modify** (3)

- `apps/web/src/routes/+error.svelte` - Error boundary page

- `apps/web/src/routes/dev/boom/+page.ts` - Test error trigger

#### **Key Features** (3)

- Friendly error message

- "Reload" and "Download logs" CTAs

- Technical details (dev only)

- NDJSON log export functionality

#### **Acceptance Criteria** (3)

- [ ] Visiting `/dev/boom` shows boundary

- [ ] "Download logs" exports NDJSON file

- [ ] "Reload" button works correctly

- [ ] Dev details shown only in development

### **Phase 4: Architecture Decision Records (ADRs)**

**Priority**: Medium | **Estimated Time**: 3-4 hours

#### **Files to Create**

- `docs/adr/0000-adr-index.md` - ADR index

- `docs/adr/0001-monorepo.md` - Monorepo decision

- `docs/adr/0002-worker-sim.md` - Worker simulation

- `docs/adr/0003-dexie-v1.md` - Database choice

- `docs/adr/0004-logging-v1.md` - Logging architecture

- `docs/adr/0005-pwa.md` - PWA implementation

- `docs/adr/0006-size-budgets.md` - Size constraints

#### **Key Features** (4)

- Standard ADR template (Context → Decision → Consequences → Alternatives → References)

- Documents decisions from W1-W5

- Links between related ADRs

- Markdown lint compliance

#### **Acceptance Criteria** (4)

- [ ] Index lists and links all ADRs

- [ ] Content reflects W1-W5 decisions

- [ ] No broken links

- [ ] Markdown lint passes

### **Phase 5: CONTRIBUTING.md**

**Priority**: Medium | **Estimated Time**: 2-3 hours

#### **Files to Create/Modify** (4)

- `CONTRIBUTING.md` - Developer onboarding guide

#### **Key Features** (5)

- 10-minute setup path

- Prerequisites and installation

- Scripts cheat-sheet

- Conventional commits policy

- Feature flags matrix

- Troubleshooting guide

#### **Acceptance Criteria** (5)

- [ ] New dev can reach app within 10 minutes

- [ ] All scripts documented

- [ ] Feature flags explained

- [ ] Troubleshooting covers common issues

### **Phase 6: Security & Privacy Documentation**

**Priority**: Medium | **Estimated Time**: 1-2 hours

#### **Files to Create** (2)

- `docs/security-privacy.md` - Security and privacy policy

#### **Key Features** (6)

- PII policy (only dragon name allowed)

- Logging redaction rules

- Data classification guidelines

- Developer checklist

- Future telemetry placeholder

#### **Acceptance Criteria** (6)

- [ ] Referenced by CONTRIBUTING.md

- [ ] Aligns with W5 logging rules

- [ ] Clear PII boundaries

- [ ] Developer checklist included

### **Phase 7: Testing Implementation**

**Priority**: High | **Estimated Time**: 2-3 hours

#### **Test Files to Create**

- `tests/flags/parse.spec.ts` - Flag parsing tests

- `tests/flags/store.spec.ts` - Store behavior tests

- `tests/integration/error-boundary.int.spec.ts` - Error boundary tests

- `tests/integration/export-logs.int.spec.ts` - Log export tests

#### **Key Features** (7)

- Unit tests for flag system

- Integration tests for error boundary

- E2E tests for dev features

- Mock logger for export tests

#### **Acceptance Criteria** (7)

- [ ] All unit tests pass

- [ ] Integration tests verify UX

- [ ] E2E tests cover dev features

- [ ] Test coverage meets standards

## 🧪 **Test Plan**

### **Unit Tests**

- **Flag Parsing**: Query string to flag object conversion

- **Flag Merging**: Environment + query + default merging

- **Store Behavior**: Svelte store updates and subscriptions

### **Integration Tests**

- **Error Boundary**: Component rendering and button functionality

- **Log Export**: NDJSON blob creation and download trigger

- **Dev Menu**: Visibility and navigation

### **E2E Tests**

- **Feature Flags**: HUD display and flag updates

- **Error Boundary**: `/dev/boom` navigation and recovery

- **Dev Menu**: Visibility and link functionality

## 🔧 **Technical Considerations**

### **Security & Privacy**

- Dev-only features must never surface in production

- Feature flags should not enable legacy background sim in prod

- Error boundary must avoid infinite reload loops

- PII policy strictly enforced

### **Performance**

- Feature flags should have minimal runtime overhead

- Error boundary should not impact normal app performance

- Dev menu should be lightweight and unobtrusive

### **Maintainability**

- ADRs must be updated when core infrastructure changes

- Feature flags should be well-documented

- Error boundary should be easily testable

## 📊 **Success Metrics**

### **Developer Experience**

- [ ] New developer can run app in < 10 minutes

- [ ] Feature flags work reliably across environments

- [ ] Error boundary provides useful debugging information

- [ ] Dev menu improves development workflow

### **Documentation Quality**

- [ ] ADRs accurately reflect architectural decisions

- [ ] CONTRIBUTING.md enables smooth onboarding

- [ ] Security policy is clear and actionable

- [ ] All documentation passes markdown lint

### **Code Quality**

- [ ] All tests pass (unit, integration, E2E)

- [ ] Feature flags are type-safe

- [ ] Error boundary handles edge cases

- [ ] Code follows established patterns

## 🚀 **Implementation Strategy**

### **Approach**

1. **Incremental Development**: Implement features in logical phases

1. **Test-Driven**: Write tests before implementation where possible

1. **Documentation-First**: Create ADRs and docs alongside code

1. **Validation**: Verify each phase before proceeding

### **Risk Mitigation**

- **Feature Flag Complexity**: Keep initial implementation simple

- **Error Boundary Edge Cases**: Test thoroughly with various error types

- **Documentation Drift**: Link ADRs to code changes

- **Performance Impact**: Monitor dev-only features carefully

## 📅 **Timeline**

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Phase 1: Feature Flags | 2-3 hours | None |
| Phase 2: Dev Menu | 1-2 hours | Phase 1 |
| Phase 3: Error Boundary | 2-3 hours | None |
| Phase 4: ADRs | 3-4 hours | None |
| Phase 5: CONTRIBUTING | 2-3 hours | Phase 4 |
| Phase 6: Security Docs | 1-2 hours | Phase 4 |
| Phase 7: Testing | 2-3 hours | Phases 1-3 |
| **Total** | **13-20 hours** | |

## ✅ **Acceptance Criteria Summary**

- [ ] Typed flags from env + query; HUD displays active flags in dev; forceMode accepts fg|bg|auto

- [ ] Dev menu appears with ?dev=1 and links to /dev/pool, /dev/sim, /dev/logs

- [ ] Global error boundary renders on /dev/boom, includes Reload and Download logs; NDJSON export

works

- [ ] ADRs 0000–0006 added with index; content reflects decisions from W1–W5

- [ ] CONTRIBUTING.md enables a new dev to run the app in < 10 minutes

- [ ] Security & privacy doc present; redaction and PII stance align with W5 and are referenced in

CONTRIBUTING & ADR-0004

- [ ] Unit + integration tests for flags and boundary pass locally

## 🔗 **Related Documentation**

- [Development Workflow](../engineering/development-workflow.md) - Development practices

- [Session Handoff](../engineering/session-handoff-complete.md) - Project status and processes

- [Testing Guide](../engineering/testing.md) - Testing strategy and implementation

- [TypeScript Guide](../engineering/typescript.md) - TypeScript configuration and best practices

---

**Next Steps**: Begin implementation with Phase 1 (Feature Flags System) following the established
development workflow and testing practices.
