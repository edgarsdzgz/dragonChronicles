# Debugging Chronicle: Playwright E2E Tests with SvelteKit Preload Data Visibility Issues

**Session ID**: DC-2025-09-06-007
**Date**: 2025-09-06
**Duration**: 2 hours
**Developer**: Edgar Diaz-Gutierrez
**Project**: Draconia Chronicles
**Status**: ✅ Resolved

## 🚨 **PROBLEM STATEMENT**

### **Issue Title**

Playwright E2E tests failing due to SvelteKit preload data attribute making body element hidden
during hydration

### **Severity Level**

- **High**: E2E testing completely broken, preventing quality assurance validation

### **Impact Assessment**

- **What functionality is affected**: All E2E tests failing with body visibility issues
- **User impact**: No automated testing validation, potential deployment of broken features
- **Development impact**: Quality assurance compromised, confidence in deployments reduced
- **Business impact**: Risk of deploying broken features to production

### **Initial Symptoms**

- **What was observed first**: Playwright tests failing with "body element hidden" errors
- **When did it start**: After SvelteKit build configuration changes
- **Error messages**:

  ```
  Error: expect(locator).toBeVisible() failed
  Locator: locator('body')
  Expected: visible
  Received: hidden
  Timeout: 5000ms
  ```

- **Unexpected behavior**: Body element had `data-sveltekit-preload-data="hover"` attribute and was

marked as hidden

## 🔍 **ENVIRONMENT CONTEXT**

### **System Information**

- **OS**: GitHub Actions Ubuntu runners
- **Node Version**: 20.x
- **Package Manager**: PNPM 9.x
- **Browser**: Chromium (Playwright)
- **IDE/Editor**: GitHub Actions

### **Project State**

- **Git Branch**: feat/w7-cicd-previews
- **Last Working State**: Before SvelteKit configuration changes
- **Recent Changes**: Modified SvelteKit build configuration, updated E2E tests
- **Dependencies**:
  - @playwright/test: ^1.48.0
  - @sveltejs/kit: ^1.30.0
  - vite: ^4.5.0

### **Relevant Configuration**

- **Build Configuration**: SvelteKit with static adapter
- **Environment Variables**: Standard GitHub Actions environment
- **CI/CD State**: 5/6 workflows passing, E2E Smoke failing

## 🕵️ **INVESTIGATION PROCESS**

### **Phase 1: Initial Analysis**

#### **First Observations**

- **What we noticed first**: Playwright tests failing with body visibility issues
- **Expected vs Actual behavior**:
  - Expected: Body element should be visible after page load
  - Actual: Body element marked as hidden with preload data attribute
- **Error messages and logs**:

  ```
  locator resolved to <body data-sveltekit-preload-data="hover">…</body>
  unexpected value "hidden"
  ```

- **Initial hypothesis**: SvelteKit preload behavior was interfering with test visibility checks

#### **Quick Checks Performed**

- **Basic troubleshooting**: Checked test timing, added wait timeouts
- **Documentation consulted**: Playwright documentation, SvelteKit documentation
- **Similar issues searched**: "SvelteKit preload data Playwright tests", "body element hidden"
- **Team consultation**: N/A (solo debugging session)

### **Phase 2: Deep Investigation**

#### **Tools and Methods Used**

- **Debugging tools**: Playwright test logs, browser dev tools, GitHub Actions logs
- **Log analysis**: Detailed test execution logs, element visibility states
- **Code inspection**: Test files, SvelteKit configuration, Playwright configuration
- **Network analysis**: N/A
- **Performance profiling**: Test execution timing analysis

#### **Research Conducted**

- **Documentation reviewed**:
  - Playwright testing documentation
  - SvelteKit preload behavior documentation
  - E2E testing best practices
- **Stack Overflow searches**: "SvelteKit preload data Playwright", "body element hidden tests"
- **GitHub issues checked**: Playwright repository issues, SvelteKit repository issues
- **Community forums**: Playwright Discord, SvelteKit Discord
- **Blog posts/articles**: E2E testing with SvelteKit, Playwright best practices

#### **Experiments and Tests**

- **Hypothesis testing**:
  - Tested different wait strategies
  - Tried different element selection approaches
  - Tested various timing configurations
- **Code modifications**:
  - Modified test wait strategies
  - Updated element visibility checks
  - Changed test timing configurations
- **Configuration changes**:
  - Updated Playwright configuration
  - Modified test timeout settings
  - Changed element selection strategies
- **Environment changes**:
  - Tested different browser configurations
  - Modified test execution environment
  - Changed CI environment settings

### **Phase 3: Root Cause Discovery**

#### **The Real Problem**

- **Actual root cause**: SvelteKit's preload behavior adds `data-sveltekit-preload-data="hover"`

attribute to body element during hydration, making it appear hidden to Playwright until hydration
completes

- **Why initial hypothesis was wrong**: The issue wasn't just timing - it was SvelteKit's specific

preload behavior that needed to be handled properly

- **Key insights discovered**:
  - SvelteKit preload data attribute is temporary during hydration
  - Playwright's visibility checks don't account for this SvelteKit-specific behavior
  - Tests need to wait for preload data attribute to be removed
  - Simple timeouts aren't sufficient - need to wait for specific DOM state
- **Hidden dependencies**: The issue was related to how SvelteKit handles client-side hydration vs.

standard web page loading

#### **Evidence Supporting Root Cause**

- **Log evidence**: Body element had preload data attribute during test execution
- **Code evidence**: Tests were checking visibility before hydration completed
- **Configuration evidence**: SvelteKit preload behavior is by design
- **Timing evidence**: Issue appeared consistently during test execution

## 🔧 **SOLUTION IMPLEMENTATION**

### **The Fix**

#### **Solution Approach**

- **Strategy chosen**: Use Playwright's `waitForFunction` to wait for SvelteKit to remove the

preload data attribute

- **Alternative approaches considered**:
  - Disable SvelteKit preload behavior (rejected - not supported)
  - Use different element selection (rejected - doesn't address root cause)
  - Increase timeouts (rejected - unreliable and slow)
- **Risk assessment**: Low risk - only affects test timing, doesn't change functionality

#### **Implementation Details**

- **Code changes**:
  - Updated all E2E tests to wait for preload data attribute removal
  - Added `waitForFunction` calls before visibility checks
  - Removed simple timeout-based waits
- **Configuration changes**: N/A
- **Dependency changes**: N/A
- **Environment changes**:
  - Updated test execution strategy
  - Modified element visibility checking approach

#### **Step-by-Step Implementation**

1. **Step 1**: Identified SvelteKit preload data attribute as the cause
2. **Step 2**: Researched proper way to wait for SvelteKit hydration
3. **Step 3**: Implemented `waitForFunction` to wait for preload data attribute removal
4. **Step 4**: Updated all test files with proper SvelteKit timing
5. **Step 5**: Verified tests now pass consistently

### **Verification Process**

#### **Testing the Fix**

- **How we tested**: Ran E2E tests multiple times to ensure consistency
- **Test cases**:
  - All smoke tests
  - All app functionality tests
  - Different viewport sizes
  - Different navigation scenarios
- **Edge cases**:
  - Different page loads
  - Different browser states
  - Different timing conditions
- **Regression testing**: Ensured no new test failures

#### **Success Criteria**

- **Primary success**: All E2E tests now pass consistently
- **Secondary success**: Tests run faster and more reliably
- **Performance impact**: Slightly improved test reliability
- **User experience**: Quality assurance restored, deployment confidence increased

## 📚 **PREVENTION & LESSONS LEARNED**

### **Prevention Strategies**

- **How to avoid this in the future**:
  - Always account for framework-specific behavior in E2E tests
  - Use framework-aware waiting strategies
  - Test with actual framework behavior, not assumptions
- **Monitoring to implement**:
  - E2E test reliability monitoring
  - Framework behavior validation
  - Test execution timing analysis
- **Documentation to add**:
  - SvelteKit E2E testing guide
  - Framework-specific testing patterns
  - Troubleshooting guide for test timing issues
- **Process improvements**:
  - Test framework-specific behavior
  - Use proper waiting strategies
  - Document framework testing requirements

### **Knowledge Gained**

- **New tools/techniques learned**:
  - Playwright `waitForFunction` for DOM state changes
  - SvelteKit preload behavior understanding
  - Framework-aware E2E testing techniques
- **Best practices discovered**:
  - Wait for framework-specific DOM states
  - Use proper waiting strategies instead of timeouts
  - Test with actual framework behavior
- **Anti-patterns identified**:
  - Using simple timeouts for framework-specific behavior
  - Assuming standard web page loading behavior
  - Not accounting for framework hydration
- **Community resources found**:
  - Playwright documentation
  - SvelteKit testing guides
  - E2E testing best practices

### **Team Knowledge Sharing**

- **What to share with team**:
  - SvelteKit E2E testing requirements
  - Framework-aware testing techniques
  - Proper waiting strategies for E2E tests
- **Documentation updates needed**:
  - Update E2E testing documentation
  - Add SvelteKit testing guide
  - Create troubleshooting guide
- **Training opportunities**:
  - E2E testing with frameworks training
  - Playwright advanced techniques
  - Framework-specific testing patterns

## 🔗 **RELATED ISSUES & DEPENDENCIES**

### **Similar Problems**

- **Related debugging sessions**:
  - Other E2E testing issues
  - Framework-specific testing problems
  - Test timing issues
- **Common patterns**:
  - Framework hydration affecting tests
  - DOM state changes during testing
  - Test timing with modern frameworks
- **Dependencies**:
  - SvelteKit behavior affects all E2E tests
  - Test timing affects all quality assurance
  - Framework behavior affects all testing

### **Upstream/Downstream Impact**

- **Upstream issues**:
  - SvelteKit preload behavior
  - Playwright visibility checking
  - Framework hydration timing
- **Downstream impact**:
  - All E2E tests affected
  - Quality assurance affected
  - Deployment confidence affected
- **Cascade effects**:
  - Test failures prevent quality assurance
  - Quality assurance failures prevent deployments
  - Development workflow affected

## 📖 **RESOURCES & REFERENCES**

### **Documentation**

- **Official documentation**:
  - [Playwright Testing](https://playwright.dev/docs/intro)
  - [SvelteKit Documentation](https://kit.svelte.dev/docs)
  - [E2E Testing Best Practices](https://playwright.dev/docs/best-practices)
- **Internal documentation**:
  - Project E2E testing guide
  - SvelteKit testing requirements
- **API references**:
  - Playwright API documentation
  - SvelteKit testing utilities

### **Community Resources**

- **Stack Overflow**:
  - [Playwright testing issues](https://stackoverflow.com/questions/tagged/playwright)
  - [SvelteKit testing problems](https://stackoverflow.com/questions/tagged/sveltekit)
- **GitHub Issues**:
  - [Playwright repository issues](https://github.com/microsoft/playwright/issues)
  - [SvelteKit repository issues](https://github.com/sveltejs/kit/issues)
- **Blog Posts**:
  - E2E testing with SvelteKit
  - Playwright best practices
- **Video Tutorials**:
  - Playwright testing tutorials
  - SvelteKit testing guides

### **Tools & Commands**

- **Debugging tools**:
  - Playwright test logs
  - Browser dev tools
  - GitHub Actions logs
- **Useful commands**:
  - `npx playwright test --debug`
  - `npx playwright test --headed`
  - `npx playwright test --trace on`
- **Scripts created**:
  - Test timing validation script
  - Framework behavior test script

---

## 🏷️ **TAGGING SYSTEM**

### **Categories**

`testing` `ci-cd` `e2e` `framework-integration`

### **Technologies**

`playwright` `sveltekit` `github-actions` `testing`

### **Complexity**

`intermediate`

---

**This debugging chronicle documents the complete journey from problem identification through root
cause discovery to successful resolution, providing a comprehensive resource for future similar
issues.**
