<!-- markdownlint-disable -->

# CI/CD Execution

This runbook describes how Continuous Integration (CI) executes tests and documentation
checks
for
Draconia
Chronicles
v2.0.0.

## Current CI Status

⚠️ **Note**: Full CI/CD pipeline is not yet implemented..
This document describes the intended CI execution patterns for future implementation.

## Test Execution in CI

### Test Command

````bash

# Full test suite with build optimization

pnpm run test:all

```text

### Expected Execution Flow

1. **Dependencies**: `pnpm install`

1. **Build**: `tsc -b` (full workspace build)

1. **Unit Tests**: `BUILD_ONCE=1 node tests/test-unit-shared.mjs`

1. **Integration Tests**: `BUILD_ONCE=1 node tests/test-integration-graph.mjs`

1. **E2E Tests**: `BUILD_ONCE=1 node tests/test-e2e-build.mjs`

1. **TypeScript Strict Gate**: `node tests/test-ts-strict.mjs`

### Expected Output

```text

ok - 2 passed
ok - 2 passed
ok - 3 passed
ok - 2 passed

```text

## Documentation Checks in CI

### Planned Documentation Validation

```bash

# Markdown linting (when CI is implemented)

pnpm run docs:lint

# Link validation (when CI is implemented)

pnpm run docs:links

# Docs presence check (when CI is implemented)

pnpm run docs:check

```javascript

### Documentation Requirements

- All PRs changing `packages/`, `apps/`, or `tests/` must update documentation

- Markdown files must pass linting rules

- Internal links must resolve correctly

- ADRs must be added for architectural changes

## Build Verification

### TypeScript Compilation

```bash

# Type checking without emit

pnpm run typecheck

# Full build with artifacts

pnpm run build

```text

### Artifact Validation

- All packages must compile successfully

- `dist/` directories must contain expected outputs

- No TypeScript errors allowed

## Performance Considerations

### BUILD_ONCE Optimization

CI uses `BUILD_ONCE=1` environment variable to optimize test execution:

- Single workspace build: `tsc -b`

- Skip rebuilds in individual tests

- Reduces total CI time from ~3x to 1x build cost

### Parallel Execution (Future)

Planned optimization for CI pipeline:

```bash

# Run tests in parallel when CI supports it

pnpm run test:unit & pnpm run test:integration & pnpm run test:e2e & wait

```text

## Failure Scenarios

### Test Failures

**Exit Code**: 1
**Action**: Block PR merge, require fixes

```text

FAIL - 1 failed, 1 passed

```javascript

### Build Failures

**Exit Code**: Non-zero from `tsc -b`
**Action**: Block PR merge, fix TypeScript errors

### Documentation Failures

**Exit Code**: 1 from docs checks
**Action**: Block PR merge, require docs updates

### Strict Gate Failures

**Exit Code**: 1 from TypeScript strict enforcement
**Action**: Block PR merge, fix type violations

## CI Configuration (Future Implementation)

### GitHub Actions (Planned)

```yaml

# .github/workflows/ci.yml (future implementation)

name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:

      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4

        with:
          node-version: '18.17'

      - run: corepack enable

      - run: pnpm install

      - run: pnpm run build

      - run: pnpm run test:all

      - run: pnpm run docs:lint

      - run: pnpm run docs:links

      - run: pnpm run docs:check

```javascript

### Required Checks (Planned)

- ✅ All tests pass (`pnpm run test:all`)

- ✅ Build succeeds (`pnpm run build`)

- ✅ Docs pass linting (`pnpm run docs:lint`)

- ✅ Links resolve (`pnpm run docs:links`)

- ✅ Docs presence validated (`pnpm run docs:check`)

## Manual CI Simulation

Until CI is implemented, simulate locally:

```bash

# Full CI simulation

pnpm install
pnpm run build
pnpm run test:all
node scripts/check-docs-presence.mjs

# Expected: All commands exit with code 0

echo $? # Should show 0 for success

```text

### Pre-PR Checklist

Before submitting PRs, ensure:

- [ ] `pnpm run test:all` passes locally

- [ ] `pnpm run build` succeeds without errors

- [ ] Documentation updated for code changes

- [ ] `node scripts/check-docs-presence.mjs` passes

## Monitoring and Alerts (Future)

### Planned Monitoring

- Test execution duration tracking

- Build success/failure rates

- Documentation coverage metrics

- TypeScript strict compliance metrics

### Alert Conditions (Future)

- Consecutive test failures

- Build time degradation

- Documentation debt accumulation

- Type safety regression

## Deployment (Future)

### Planned Deployment Pipeline

1. **Tests Pass**: All CI checks green

1. **Build Artifacts**: Generate production build

1. **Deploy Staging**: Automated staging deployment

1. **Manual Verification**: QA approval

1. **Deploy Production**: Manual or automated production deployment

### Rollback Strategy (Future)

- Immediate rollback on critical failures

- Health check monitoring post-deployment

- Database migration rollback procedures

---

## Current Implementation Status

| Component            | Status             | Notes                                 |
| -------------------- | ------------------ | ------------------------------------- |
| Test Execution       | ✅ Implemented     | `pnpm run test:all` with BUILD_ONCE   |
| Documentation Checks | ⚠️ Partial         | Scripts ready, CI integration pending |
| GitHub Actions       | ❌ Not Implemented | Future implementation needed          |
| Monitoring           | ❌ Not Implemented | Future implementation needed          |
| Deployment           | ❌ Not Implemented | Future implementation needed          |

See [Local Development](./local-dev.md) for current development workflow.

````
