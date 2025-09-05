# W7 Completion Plan: CI/CD & Previews

## Overview

This document outlines the comprehensive multi-phase plan to complete W7 (CI/CD & Previews) according to GitHub issue #31 requirements. Each phase includes detailed implementation steps, testing strategies, guardrails, and validation criteria.

## Current Status Analysis

### ✅ What's Already Working

- Core CI infrastructure (80% complete)
- TypeScript strict checking
- ESLint with 0 errors/warnings
- Full test suite execution
- Basic GitHub Pages deployment (main branch only)
- Playwright configuration exists
- Size budget scripts exist (but not integrated)

### ❌ Critical Gaps Identified

- Size budget enforcement missing from CI
- BASE_PATH not configured for Pages
- No E2E workflow for PRs
- No Lighthouse workflow for PRs
- No PR preview deployments
- Missing Lighthouse configuration

## Multi-Phase Implementation Plan

---

## Phase 1: Fix Current CI Workflow

**Duration**: 1 day  
**Priority**: CRITICAL  
**Goal**: Integrate size budgets and BASE_PATH into existing CI

### Implementation Steps

#### 1.1 Update CI Workflow

- [ ] Add size budget enforcement to `ci.yml`
- [ ] Add BASE_PATH configuration for all builds
- [ ] Update artifact upload for PR previews
- [ ] Ensure proper pnpm caching

#### 1.2 Size Budget Integration

- [ ] Integrate `pnpm run size:check` into CI pipeline
- [ ] Set environment variables: `BUDGET_BASE_KB=200`, `BUDGET_LOGGER_KB=8`
- [ ] Make size budget failures block PRs (hard gate)
- [ ] Add size budget reporting to CI output

#### 1.3 BASE_PATH Configuration

- [ ] Set `BASE_PATH: /${{ github.event.repository.name }}` in all builds
- [ ] Ensure SvelteKit builds respect BASE_PATH
- [ ] Test asset resolution with BASE_PATH

### Testing Strategy

- [ ] **Local Testing**: Run size budget checks locally
- [ ] **CI Testing**: Verify size budgets fail when exceeded
- [ ] **BASE_PATH Testing**: Test builds with different BASE_PATH values
- [ ] **Artifact Testing**: Verify artifacts are uploaded correctly

### Guardrails

- [ ] **Size Budget Gate**: PRs fail if size budgets exceeded
- [ ] **BASE_PATH Validation**: Builds must include BASE_PATH
- [ ] **Artifact Verification**: Artifacts must be uploaded for all PRs

### Success Criteria

- [ ] Size budgets enforced in CI (hard gate)
- [ ] BASE_PATH configured for all builds
- [ ] Artifacts uploaded for PR previews
- [ ] All existing CI functionality preserved

---

## Phase 2: E2E Playwright Workflow

**Duration**: 1 day  
**Priority**: HIGH  
**Goal**: Create comprehensive E2E testing pipeline

### Implementation Steps

#### 2.1 Create E2E Workflow

- [ ] Create `.github/workflows/e2e-playwright.yml`
- [ ] Configure Playwright browser caching
- [ ] Set up preview server startup
- [ ] Implement proper server waiting

#### 2.2 Smoke Test Implementation

- [ ] Create minimal smoke tests for core functionality
- [ ] Test root page renders (canvas exists)
- [ ] Test `/dev/pool` page loads
- [ ] Test basic UI interactions
- [ ] Test PWA functionality (if applicable)

#### 2.3 Test Artifacts & Reporting

- [ ] Upload Playwright reports on failure
- [ ] Configure test artifacts for debugging
- [ ] Add test result reporting

### Testing Strategy

- [ ] **Local E2E Testing**: Run Playwright tests locally
- [ ] **CI E2E Testing**: Verify E2E tests run in CI
- [ ] **Failure Testing**: Test artifact upload on failures
- [ ] **Performance Testing**: Ensure E2E tests complete quickly

### Guardrails

- [ ] **E2E Gate**: PRs fail if smoke tests fail
- [ ] **Artifact Upload**: Test reports uploaded on failure
- [ ] **Performance Gate**: E2E tests must complete in <5 minutes

### Success Criteria

- [ ] E2E workflow runs on all PRs
- [ ] Smoke tests cover core functionality
- [ ] Test artifacts uploaded on failures
- [ ] E2E tests complete quickly (<5 minutes)

---

## Phase 3: Lighthouse Workflow

**Duration**: 0.5 days  
**Priority**: MEDIUM  
**Goal**: Create PR-level Lighthouse monitoring

### Implementation Steps

#### 3.1 Create Lighthouse Workflow

- [ ] Create `.github/workflows/lighthouse.yml`
- [ ] Configure Lighthouse CI for PRs
- [ ] Set up preview server for Lighthouse
- [ ] Implement warn-only accessibility threshold

#### 3.2 Lighthouse Configuration

- [ ] Create `.lighthouserc.json` configuration
- [ ] Set accessibility threshold to 95% (warn-only)
- [ ] Configure performance monitoring
- [ ] Set up artifact upload for reports

#### 3.3 Lighthouse Integration

- [ ] Test Lighthouse runs on PRs
- [ ] Verify accessibility warnings work
- [ ] Ensure reports are uploaded
- [ ] Test non-blocking behavior

### Testing Strategy

- [ ] **Local Lighthouse Testing**: Run Lighthouse locally
- [ ] **CI Lighthouse Testing**: Verify Lighthouse runs in CI
- [ ] **Threshold Testing**: Test accessibility threshold behavior
- [ ] **Report Testing**: Verify reports are uploaded

### Guardrails

- [ ] **Warn-Only Gate**: Lighthouse warnings don't block PRs
- [ ] **Report Upload**: Lighthouse reports always uploaded
- [ ] **Performance Monitoring**: Performance regressions tracked

### Success Criteria

- [ ] Lighthouse runs on all PRs
- [ ] Accessibility threshold set to 95% (warn-only)
- [ ] Reports uploaded as artifacts
- [ ] Non-blocking behavior verified

---

## Phase 4: PR Preview Deployment

**Duration**: 1 day  
**Priority**: CRITICAL  
**Goal**: Create PR preview deployment system

### Implementation Steps

#### 4.1 Create Pages Workflow

- [ ] Create `.github/workflows/pages.yml`
- [ ] Configure PR preview deployment
- [ ] Set up production deployment for main
- [ ] Implement proper permissions

#### 4.2 PR Preview Integration

- [ ] Generate unique URLs for each PR
- [ ] Post preview URLs as PR comments
- [ ] Configure BASE_PATH for previews
- [ ] Set up proper concurrency control

#### 4.3 Production Deployment

- [ ] Configure main branch deployment
- [ ] Set up production environment
- [ ] Ensure proper asset resolution
- [ ] Test deployment pipeline

### Testing Strategy

- [ ] **PR Preview Testing**: Create test PR and verify preview
- [ ] **URL Testing**: Verify preview URLs work correctly
- [ ] **Comment Testing**: Verify PR comments are posted
- [ ] **Production Testing**: Test main branch deployment

### Guardrails

- [ ] **Preview Gate**: All PRs get preview URLs
- [ ] **Comment Gate**: Preview URLs posted in PR comments
- [ ] **Production Gate**: Main branch deploys to production

### Success Criteria

- [ ] PR previews deploy automatically
- [ ] Preview URLs posted in PR comments
- [ ] Production deploys on main branch push
- [ ] BASE_PATH works correctly for previews

---

## Phase 5: Configuration Files & Templates

**Duration**: 0.5 days  
**Priority**: LOW  
**Goal**: Create supporting configuration files

### Implementation Steps

#### 5.1 Lighthouse Configuration

- [ ] Create `.lighthouserc.json` with proper settings
- [ ] Configure accessibility thresholds
- [ ] Set up performance monitoring
- [ ] Test configuration locally

#### 5.2 PR Template Updates

- [ ] Update `.github/PULL_REQUEST_TEMPLATE.md`
- [ ] Add preview URL placeholder
- [ ] Include testing checklist
- [ ] Add W7-specific requirements

#### 5.3 Documentation Updates

- [ ] Update W7 plan with completion status
- [ ] Document new workflows
- [ ] Create troubleshooting guide
- [ ] Update contributing guidelines

### Testing Strategy

- [ ] **Config Testing**: Test all configuration files
- [ ] **Template Testing**: Verify PR template works
- [ ] **Documentation Testing**: Verify all docs are accurate

### Guardrails

- [ ] **Config Validation**: All config files must be valid
- [ ] **Template Validation**: PR template must include required fields
- [ ] **Documentation Validation**: All docs must be up-to-date

### Success Criteria

- [ ] All configuration files created and tested
- [ ] PR template updated with preview URL placeholder
- [ ] Documentation updated and accurate

---

## Phase 6: Comprehensive Testing & Validation

**Duration**: 1 day  
**Priority**: CRITICAL  
**Goal**: Ensure all W7 functionality works correctly

### Testing Strategy

#### 6.1 End-to-End Testing

- [ ] **Full Pipeline Testing**: Test complete CI/CD pipeline
- [ ] **PR Testing**: Create test PR and verify all workflows
- [ ] **Preview Testing**: Verify PR preview URLs work
- [ ] **Production Testing**: Test main branch deployment

#### 6.2 Quality Gate Testing

- [ ] **Size Budget Testing**: Test size budget enforcement
- [ ] **E2E Testing**: Test E2E smoke tests
- [ ] **Lighthouse Testing**: Test Lighthouse monitoring
- [ ] **Lint Testing**: Test linting enforcement

#### 6.3 Failure Scenario Testing

- [ ] **Size Budget Failure**: Test PR fails when size exceeded
- [ ] **E2E Failure**: Test PR fails when smoke tests fail
- [ ] **Lint Failure**: Test PR fails when linting fails
- [ ] **TypeCheck Failure**: Test PR fails when typecheck fails

### Validation Criteria

- [ ] **All Workflows Green**: All CI workflows pass
- [ ] **PR Previews Work**: Preview URLs accessible and functional
- [ ] **Quality Gates Work**: All gates enforce requirements
- [ ] **Performance Acceptable**: All workflows complete in reasonable time

### Success Criteria

- [ ] Complete CI/CD pipeline functional
- [ ] All quality gates working correctly
- [ ] PR previews working for all PRs
- [ ] Production deployment working

---

## Phase 7: Guardrails & Monitoring

**Duration**: 0.5 days  
**Priority**: HIGH  
**Goal**: Implement comprehensive guardrails and monitoring

### Implementation Steps

#### 7.1 Quality Gate Guardrails

- [ ] **Size Budget Guardrails**: Enforce size limits strictly
- [ ] **E2E Guardrails**: Ensure smoke tests always run
- [ ] **Lint Guardrails**: Enforce 0 errors/warnings
- [ ] **TypeCheck Guardrails**: Enforce strict TypeScript

#### 7.2 Performance Monitoring

- [ ] **CI Performance**: Monitor CI execution time
- [ ] **E2E Performance**: Monitor E2E test duration
- [ ] **Build Performance**: Monitor build times
- [ ] **Deployment Performance**: Monitor deployment times

#### 7.3 Failure Monitoring

- [ ] **Failure Alerts**: Set up alerts for CI failures
- [ ] **Performance Alerts**: Set up alerts for performance regressions
- [ ] **Size Alerts**: Set up alerts for size budget violations
- [ ] **E2E Alerts**: Set up alerts for E2E test failures

### Guardrails Implementation

- [ ] **Automated Checks**: All quality gates automated
- [ ] **Failure Prevention**: Prevent common failure scenarios
- [ ] **Recovery Procedures**: Document recovery procedures
- [ ] **Monitoring Dashboard**: Set up monitoring dashboard

### Success Criteria

- [ ] All guardrails implemented and working
- [ ] Performance monitoring active
- [ ] Failure alerts configured
- [ ] Recovery procedures documented

---

## Testing Coverage Strategy

### Code Coverage Requirements

- [ ] **Workflow Coverage**: All GitHub Actions workflows tested
- [ ] **Configuration Coverage**: All config files validated
- [ ] **Script Coverage**: All scripts tested locally and in CI
- [ ] **Integration Coverage**: All integrations tested end-to-end

### Test Types

- [ ] **Unit Tests**: Individual component testing
- [ ] **Integration Tests**: Component interaction testing
- [ ] **E2E Tests**: Full pipeline testing
- [ ] **Performance Tests**: Performance and load testing

### Test Environments

- [ ] **Local Testing**: All functionality tested locally
- [ ] **CI Testing**: All functionality tested in CI
- [ ] **PR Testing**: All functionality tested with real PRs
- [ ] **Production Testing**: All functionality tested in production

---

## Success Metrics

### Primary Metrics

- [ ] **CI Success Rate**: 100% for compliant PRs
- [ ] **Quality Gate Compliance**: All gates pass for compliant code
- [ ] **E2E Reliability**: Smoke tests pass consistently
- [ ] **Preview Deployment**: 100% success rate for PR previews

### Secondary Metrics

- [ ] **Pipeline Speed**: CI completes in <10 minutes
- [ ] **E2E Speed**: Smoke tests complete in <5 minutes
- [ ] **Lighthouse Coverage**: All key pages monitored
- [ ] **Preview Availability**: PR previews available within 5 minutes

### Quality Metrics

- [ ] **Size Budget Compliance**: 100% compliance with size limits
- [ ] **Accessibility Score**: ≥95% accessibility score maintained
- [ ] **Performance Score**: ≥90% performance score maintained
- [ ] **Test Coverage**: ≥80% test coverage for new code

---

## Risk Mitigation

### High Risk Items

- [ ] **GitHub Actions Limits**: Monitor workflow execution limits
- [ ] **Pages Deployment Issues**: Test BASE_PATH configuration thoroughly
- [ ] **E2E Test Flakiness**: Keep tests minimal and stable
- [ ] **Size Budget Enforcement**: Set reasonable budgets with optimization guidance

### Mitigation Strategies

- [ ] **Optimization**: Optimize workflows for speed and reliability
- [ ] **Testing**: Comprehensive testing before deployment
- [ ] **Documentation**: Clear documentation for troubleshooting
- [ ] **Monitoring**: Continuous monitoring of all systems

---

## Timeline Summary

| Phase                 | Duration | Priority | Dependencies |
| --------------------- | -------- | -------- | ------------ |
| Phase 1: Fix CI       | 1 day    | CRITICAL | None         |
| Phase 2: E2E Workflow | 1 day    | HIGH     | Phase 1      |
| Phase 3: Lighthouse   | 0.5 days | MEDIUM   | Phase 1      |
| Phase 4: PR Previews  | 1 day    | CRITICAL | Phase 1      |
| Phase 5: Config Files | 0.5 days | LOW      | None         |
| Phase 6: Testing      | 1 day    | CRITICAL | Phases 1-5   |
| Phase 7: Guardrails   | 0.5 days | HIGH     | Phase 6      |

**Total Estimated Time**: 5.5 days

---

## Next Steps

1. **User Approval**: Present this plan for approval
2. **Phase 1 Start**: Begin with CI workflow fixes
3. **Daily Updates**: Provide daily progress updates
4. **Continuous Testing**: Test each phase thoroughly
5. **Documentation**: Update all documentation upon completion

---

**Note**: This plan ensures W7 is completed according to GitHub issue #31 requirements with comprehensive testing, guardrails, and validation. Each phase builds upon the previous one, ensuring a solid foundation for the CI/CD pipeline.
