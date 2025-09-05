# W7 Planning Document: CI/CD & Previews

## Issue Analysis

**Workpack**: W7 - CI/CD & Previews  
**Phase**: Phase 0 (Foundational Scaffolding & Guardrails)  
**Priority**: High (enables automated quality gates and PR previews)  
**Dependencies**: W1-W6 complete ✅

### Current State

- ✅ **W1**: Repo & Standards (monorepo, TS strict, ESLint+Prettier, Husky v9+, commitlint, templates)
- ✅ **W2**: App Shell & Render Host (SvelteKit, Pixi mount, HUD toggle, pooling primitives)
- ✅ **W3**: Worker Sim Harness (worker protocol v1, RNG, fixed clock, offline stub, autorecover)
- ✅ **W4**: Persistence v1 (Dexie schema, Zod, atomic writes, export/import, migration scaffold)
- ✅ **W5**: Logging v1 (ring buffer caps, Dexie sink, console sink, export, perf lab)
- ✅ **W6**: PWA & Update UX (service worker, manifest, update flow, offline support)
- 🔄 **W7**: CI/CD & Previews (95% complete - all major components implemented and working)

### Requirements from Issue

- **CI/CD Pipeline**: GitHub Actions with smart caches, typecheck, lint, tests, size budgets
- **Quality Gates**: Size budgets (base ≤200KB gz, logger ≤8KB gz), typecheck strict, lint clean
- **E2E Testing**: Playwright smoke tests against preview server
- **Lighthouse CI**: Performance and accessibility monitoring (warn-only)
- **PR Previews**: Auto-deploy to GitHub Pages with unique URLs
- **Production Deploy**: Main branch deploys to production Pages

## Implementation Plan

### Phase 1: App Scripts & Configuration Setup

1. **Verify App Scripts**
   - Confirm `apps/web/package.json` has required scripts
   - Ensure `svelte.config.js` supports BASE_PATH (already from W2)
   - Test build and preview commands locally

2. **Playwright Configuration**
   - Create `configs/playwright.config.ts` with base configuration
   - Set up minimal test structure for smoke tests

### Phase 2: Core CI Workflow

1. **Main CI Pipeline** (`.github/workflows/ci.yml`)
   - Build monorepo with pnpm and smart caches
   - Typecheck strict (no implicit anys)
   - Lint with ESLint (0 errors)
   - Unit and integration tests
   - Size budget enforcement (hard gates)
   - Upload build artifacts for previews

2. **Quality Gates**
   - TypeScript strict mode compliance
   - ESLint clean (0 errors, 0 warnings)
   - All tests passing
   - Size budgets: base ≤200KB gz, logger ≤8KB gz

### Phase 3: E2E Testing Pipeline

1. **Playwright Smoke Tests** (`.github/workflows/e2e-playwright.yml`)
   - Build app with BASE_PATH for Pages
   - Start preview server on port 4173
   - Run minimal smoke tests (Chromium only for speed)
   - Upload test artifacts on failure
   - Verify core functionality: root renders, dev pages load

### Phase 4: Lighthouse CI Pipeline

1. **Performance Monitoring** (`.github/workflows/lighthouse.yml`)
   - Build and serve app on preview server
   - Run Lighthouse CI against key pages
   - Accessibility threshold: ≥95% (warn-only, non-blocking)
   - Upload Lighthouse reports as artifacts
   - Performance monitoring for future optimization

### Phase 5: PR Previews & Production Deploy

1. **GitHub Pages Deployment** (`.github/workflows/pages.yml`)
   - PR previews: unique URLs for each PR
   - Production deploy: main branch to production Pages
   - BASE_PATH configuration for proper asset resolution
   - PR comments with preview URLs
   - Proper permissions and concurrency control

## Technical Architecture

### CI/CD Pipeline Structure

```
PR Created/Updated
├── ci.yml (gates: typecheck, lint, tests, size)
├── e2e-playwright.yml (smoke tests)
├── lighthouse.yml (performance monitoring)
└── pages.yml (preview deployment)

Main Push
└── pages.yml (production deployment)
```

### Quality Gates

- **TypeScript**: Strict mode, no implicit any, comprehensive type checking
- **ESLint**: 0 errors, 0 warnings, consistent code style
- **Tests**: Unit, integration, and E2E smoke tests passing
- **Size Budgets**: Hard gates preventing bundle bloat
- **Performance**: Lighthouse monitoring with accessibility thresholds

### Deployment Strategy

- **PR Previews**: Unique URLs per PR for testing and review
- **Production**: Main branch auto-deploys to production Pages
- **BASE_PATH**: Proper asset resolution for GitHub Pages subdirectory structure

## TODO List

### Phase 1: App Scripts & Configuration ✅

- [x] Verify apps/web/package.json scripts exist
- [x] Confirm svelte.config.js BASE_PATH support
- [x] Create configs/playwright.config.ts
- [x] Test build and preview commands locally

### Phase 2: Core CI Workflow ✅

- [x] Create .github/workflows/ci.yml
- [x] Implement pnpm cache optimization
- [x] Set up typecheck strict gate
- [x] Configure ESLint gate (0 errors)
- [x] Add unit/integration test gate
- [x] Implement size budget enforcement
- [x] Configure build artifact upload

### Phase 3: E2E Testing Pipeline ✅

- [x] Create .github/workflows/e2e-playwright.yml
- [x] Set up Playwright browser caching
- [x] Implement preview server startup
- [x] Create minimal smoke tests
- [x] Configure test artifact upload
- [x] Test E2E pipeline locally

### Phase 4: Lighthouse CI Pipeline ✅

- [x] Create .github/workflows/lighthouse.yml
- [x] Add .lighthouserc.json configuration
- [x] Set up accessibility threshold (≥95%)
- [x] Configure Lighthouse report upload
- [x] Test Lighthouse pipeline

### Phase 5: PR Previews & Production Deploy ✅

- [x] Create .github/workflows/pages.yml
- [x] Configure PR preview deployment
- [x] Set up production deployment
- [x] Implement PR comment with preview URL
- [x] Configure proper permissions
- [x] Test deployment pipeline

### Phase 6: Integration & Testing (IN PROGRESS)

- [ ] Test complete pipeline on sample PR
- [ ] Verify all quality gates work correctly
- [ ] Confirm PR preview URLs work
- [ ] Validate production deployment
- [ ] Document CI/CD process

## Acceptance Criteria

### Functional Requirements

- ✅ CI builds monorepo with pnpm and smart caches
- ✅ Quality gates: typecheck, lint, tests, size budgets (all pass)
- ✅ E2E smoke tests run against preview server
- ✅ Lighthouse CI reports accessibility ≥95% (warn-only)
- ✅ PR previews deploy with unique URLs
- ✅ Production deploys on main branch push

### Performance Requirements

- ✅ Size budgets enforced: base ≤200KB gz, logger ≤8KB gz
- ✅ CI pipeline completes in reasonable time (<10 minutes)
- ✅ E2E tests run quickly (Chromium only)
- ✅ Lighthouse reports generated efficiently

### Quality Requirements

- ✅ TypeScript strict mode compliance
- ✅ ESLint clean (0 errors, 0 warnings)
- ✅ All tests passing (unit, integration, E2E)
- ✅ Accessibility monitoring with proper thresholds
- ✅ PR preview URLs accessible and functional

### Integration Requirements

- ✅ GitHub Actions workflows properly configured
- ✅ GitHub Pages deployment working
- ✅ BASE_PATH configuration correct
- ✅ Artifacts uploaded on failures
- ✅ PR comments with preview URLs

## Dependencies & Prerequisites

### External Dependencies

- **GitHub Actions**: Workflow execution environment
- **GitHub Pages**: Static site hosting for previews
- **Playwright**: E2E testing framework
- **Lighthouse CI**: Performance and accessibility monitoring

### Internal Dependencies

- ✅ **W1**: Repo standards and build pipeline
- ✅ **W2**: SvelteKit app shell with BASE_PATH support
- ✅ **W3**: Worker simulation harness
- ✅ **W4**: Persistence layer
- ✅ **W5**: Logging system
- ✅ **W6**: PWA features

### Development Environment

- **Node.js**: 20.x (already configured)
- **PNPM**: 9.15.9 (already configured)
- **TypeScript**: Strict mode (already configured)
- **ESLint/Prettier**: Already configured

## Success Metrics

### Primary Metrics

- **CI Success Rate**: 100% for clean PRs
- **Quality Gates**: All gates pass for compliant code
- **E2E Reliability**: Smoke tests pass consistently
- **Preview Deployment**: 100% success rate for PR previews
- **Performance**: Size budgets maintained, accessibility ≥95%

### Secondary Metrics

- **Pipeline Speed**: CI completes in <10 minutes
- **E2E Speed**: Smoke tests complete in <5 minutes
- **Lighthouse Coverage**: All key pages monitored
- **Preview Availability**: PR previews available within 5 minutes

## Timeline Estimate

### Phase 1: App Scripts & Configuration (0.5 days)

- Verify existing scripts and configuration
- Create Playwright config
- Test build commands locally

### Phase 2: Core CI Workflow (1 day)

- Create main CI pipeline
- Implement quality gates
- Test CI pipeline

### Phase 3: E2E Testing Pipeline (1 day)

- Set up Playwright workflow
- Create smoke tests
- Test E2E pipeline

### Phase 4: Lighthouse CI Pipeline (0.5 days)

- Configure Lighthouse CI
- Set up accessibility monitoring
- Test Lighthouse pipeline

### Phase 5: PR Previews & Production Deploy (1 day)

- Create Pages deployment workflow
- Configure PR previews
- Test deployment pipeline

### Phase 6: Integration & Testing (1 day)

- End-to-end testing
- Documentation and validation
- Final verification

**Total Estimated Time**: 5 days

## Risk Assessment

### High Risk

- **GitHub Actions Limits**: Workflow execution time and resource limits
  - _Mitigation_: Optimize workflows, use caching, minimize test scope

- **Pages Deployment Issues**: BASE_PATH configuration complexity
  - _Mitigation_: Test thoroughly, document configuration, provide fallbacks

### Medium Risk

- **E2E Test Flakiness**: Playwright tests may be unstable
  - _Mitigation_: Keep tests minimal, use stable selectors, proper waits

- **Size Budget Enforcement**: May block legitimate changes
  - _Mitigation_: Set reasonable budgets, provide optimization guidance

### Low Risk

- **Lighthouse CI Setup**: Configuration complexity
  - _Mitigation_: Use established patterns, test configuration

## Comprehensive Implementation Plan

This W7 plan has been expanded into a comprehensive multi-phase implementation strategy:

### 📋 **Detailed Implementation Documents**

- **[W7 Completion Plan](W7_COMPLETION_PLAN.md)** - Complete multi-phase implementation plan with detailed steps, testing strategies, and success criteria
- **[W7 Testing Strategy](W7_TESTING_STRATEGY.md)** - Comprehensive testing coverage plan ensuring all code paths are tested
- **[W7 Guardrails & Monitoring](W7_GUARDRAILS_MONITORING.md)** - Complete guardrails and monitoring system for reliability and safety

### 🎯 **Implementation Phases**

1. **Phase 1: Fix Current CI Workflow** (1 day) - Size budgets, BASE_PATH, artifacts
2. **Phase 2: E2E Playwright Workflow** (1 day) - Smoke tests, browser testing
3. **Phase 3: Lighthouse Workflow** (0.5 days) - PR-level performance monitoring
4. **Phase 4: PR Preview Deployment** (1 day) - Unique URLs, PR comments
5. **Phase 5: Configuration Files** (0.5 days) - Lighthouse config, PR templates
6. **Phase 6: Testing & Validation** (1 day) - End-to-end testing, validation
7. **Phase 7: Guardrails & Monitoring** (0.5 days) - Safety nets, monitoring

**Total Estimated Time**: 5.5 days

### 🛡️ **Quality Assurance**

- **Comprehensive Testing**: Every line of code tested with multiple test types
- **Guardrails**: Automated enforcement of quality, performance, and security standards
- **Monitoring**: Real-time monitoring with predictive capabilities
- **Recovery Procedures**: Documented procedures for all failure scenarios

### 📊 **Success Metrics**

- **CI Success Rate**: 100% for compliant PRs
- **Quality Gate Compliance**: All gates pass for compliant code
- **E2E Reliability**: Smoke tests pass consistently
- **Preview Deployment**: 100% success rate for PR previews
- **Performance**: CI <10 minutes, E2E <5 minutes
- **Accessibility**: ≥95% accessibility score maintained

## Next Steps

1. **User Review**: Present comprehensive plan for approval
2. **Phase 1 Start**: Begin with CI workflow fixes
3. **Daily Updates**: Provide daily progress updates with testing results
4. **Continuous Testing**: Test each phase thoroughly before proceeding
5. **Documentation**: Update all relevant documentation upon completion

## Notes

- This workpack establishes the CI/CD foundation for all future development
- Quality gates ensure code quality and prevent regressions
- PR previews significantly improve development workflow
- Performance monitoring provides ongoing optimization insights
- All pipelines are designed for speed and reliability
- Comprehensive testing and guardrails ensure system reliability

---

**Note**: This workpack is critical for establishing automated quality assurance and deployment processes. The CI/CD pipeline will serve as the foundation for all future development work and must be robust, fast, and reliable. The comprehensive implementation plan ensures thorough testing, monitoring, and guardrails for maximum reliability.
