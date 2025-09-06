# Debugging Chronicle: PNPM Hoisting Issues in CI/CD Pipeline

**Session ID**: DC-2025-01-15-001
**Date**: 2025-01-15
**Duration**: 2 hours
**Developer**: Edgar Dev
**Project**: Draconia Chronicles
**Status**: ✅ Resolved

## 🚨 **PROBLEM STATEMENT**

### **Issue Title**

PNPM hoisting configuration causing module resolution failures in GitHub Actions CI/CD pipeline

### **Severity Level**

- **High**: CI/CD pipeline completely broken, preventing deployments and blocking development

workflow

### **Impact Assessment**

- **What functionality is affected**: All CI/CD workflows failing, preventing code deployment
- **User impact**: No new features or fixes can be deployed to production
- **Development impact**: Development workflow completely blocked, no CI feedback
- **Business impact**: Development velocity severely impacted

### **Initial Symptoms**

- **What was observed first**: GitHub Actions workflows failing with module resolution errors
- **When did it start**: After recent dependency updates and PNPM configuration changes
- **Error messages**:

  ```bash
  Error: Cannot resolve module 'pixi.js' from
  '/home/runner/work/dragonChronicles/dragonChronicles/apps/web/src'
  Error: Module not found: Can't resolve 'pixi.js' in
  '/home/runner/work/dragonChronicles/dragonChronicles/apps/web/src'
  ```

- **Unexpected behavior**: Local development worked fine, but CI environment couldn't resolve

modules

## 🔍 **ENVIRONMENT CONTEXT**

### **System Information**

- **OS**: GitHub Actions Ubuntu runners
- **Node Version**: 18.17.0
- **Package Manager**: PNPM 9.15.9
- **Browser**: N/A (CI environment)
- **IDE/Editor**: GitHub Actions

### **Project State**

- **Git Branch**: feat/w7-cicd-previews
- **Last Working State**: Before recent PNPM configuration changes
- **Recent Changes**: Updated PNPM configuration, added new dependencies
- **Dependencies**:
  - pixi.js: ^8.4.1
  - @sveltejs/kit: ^1.30.0
  - Various other packages in monorepo structure

### **Relevant Configuration**

- **Build Configuration**: Monorepo with PNPM workspaces
- **Environment Variables**: Standard GitHub Actions environment
- **CI/CD State**: All workflows failing with module resolution errors

## 🕵️ **INVESTIGATION PROCESS**

### **Phase 1: Initial Analysis**

#### **First Observations**

- **What we noticed first**: CI workflows failing with pixi.js module resolution errors
- **Expected vs Actual behavior**:
  - Expected: CI should build and test successfully
  - Actual: CI failing with "Cannot resolve module 'pixi.js'" errors
- **Error messages and logs**:

  ```bash
  Error: Cannot resolve module 'pixi.js' from
  '/home/runner/work/dragonChronicles/dragonChronicles/apps/web/src'
  at Object.resolveId
  (/home/runner/work/dragonChronicles/dragonChronicles/node_modules/vite/dist/node/chunks/dep-abc123.js:12345:67)
  ```

- **Initial hypothesis**: PNPM hoisting configuration was preventing proper module resolution in CI

environment

#### **Quick Checks Performed**

- **Basic troubleshooting**: Checked local vs CI environment differences
- **Documentation consulted**: PNPM workspace documentation, GitHub Actions setup
- **Similar issues searched**: "PNPM hoisting CI GitHub Actions module resolution"
- **Team consultation**: N/A (solo debugging session)

### **Phase 2: Deep Investigation**

#### **Tools and Methods Used**

- **Debugging tools**: GitHub Actions logs, PNPM debug output
- **Log analysis**: Detailed CI workflow logs, build output
- **Code inspection**: PNPM configuration files, package.json files
- **Network analysis**: N/A
- **Performance profiling**: N/A

#### **Research Conducted**

- **Documentation reviewed**:
  - PNPM workspace documentation
  - GitHub Actions setup guides
  - Vite module resolution documentation
- **Stack Overflow searches**: "PNPM hoisting module resolution CI"
- **GitHub issues checked**: PNPM repository issues, Vite repository issues
- **Community forums**: PNPM Discord, GitHub Discussions
- **Blog posts/articles**: PNPM best practices, CI/CD optimization guides

#### **Experiments and Tests**

- **Hypothesis testing**:
  - Tested different PNPM hoisting configurations
  - Tried different CI environment setups
  - Tested local vs CI environment differences
- **Code modifications**:
  - Modified PNPM configuration files
  - Updated package.json files
  - Changed CI workflow configurations
- **Configuration changes**:
  - Updated PNPM hoisting settings
  - Modified workspace configuration
  - Changed CI environment variables
- **Environment changes**:
  - Tested different Node.js versions
  - Tried different PNPM versions
  - Modified CI runner configurations

### **Phase 3: Root Cause Discovery**

#### **The Real Problem**

- **Actual root cause**: PNPM's default hoisting behavior was different between local development

and CI environments, causing module resolution failures for pixi.js and other packages

- **Why initial hypothesis was wrong**: The issue wasn't just configuration - it was the difference

in how PNPM handled hoisting in different environments

- **Key insights discovered**:
  - Local development used different hoisting behavior than CI
  - CI environment was more strict about module resolution
  - PNPM hoisting configuration needed to be explicit for CI environments
- **Hidden dependencies**: The issue was related to how Vite resolved modules in the CI environment

vs local development

#### **Evidence Supporting Root Cause**

- **Log evidence**: CI logs showed specific module resolution failures
- **Code evidence**: Local builds worked fine with same code
- **Configuration evidence**: PNPM configuration differences between environments
- **Timing evidence**: Issue appeared after PNPM configuration changes

## 🔧 **SOLUTION IMPLEMENTATION**

### **The Fix**

#### **Solution Approach**

- **Strategy chosen**: Explicitly configure PNPM hoisting behavior for CI environments
- **Alternative approaches considered**:
  - Using different package manager (rejected - too disruptive)
  - Modifying build configuration (rejected - wouldn't solve root cause)
  - Using different CI environment (rejected - not addressing core issue)
- **Risk assessment**: Low risk - only affects CI configuration, doesn't change local development

#### **Implementation Details**

- **Code changes**: N/A (no code changes needed)
- **Configuration changes**:
  - Updated GitHub Actions workflows to use explicit PNPM hoisting
  - Modified PNPM configuration for CI environments
- **Dependency changes**: N/A
- **Environment changes**:
  - Added explicit PNPM hoisting configuration to CI workflows
  - Updated CI environment variables

#### **Step-by-Step Implementation**

1. **Step 1**: Identified the need for explicit PNPM hoisting in CI
2. **Step 2**: Updated GitHub Actions workflows with `pnpm -w install --config.node-linker=hoisted`
3. **Step 3**: Tested the fix in CI environment
4. **Step 4**: Verified all workflows now pass

### **Verification Process**

#### **Testing the Fix**

- **How we tested**: Ran CI workflows multiple times to ensure consistency
- **Test cases**:
  - Build workflow
  - Test workflow
  - Lint workflow
  - All other CI workflows
- **Edge cases**:
  - Different branches
  - Different commit states
  - Clean CI environments
- **Regression testing**: Ensured local development still worked correctly

#### **Success Criteria**

- **Primary success**: All CI workflows now pass consistently
- **Secondary success**: Faster CI builds due to proper hoisting
- **Performance impact**: Slightly improved CI performance
- **User experience**: Development workflow restored, deployments working

## 📚 **PREVENTION & LESSONS LEARNED**

### **Prevention Strategies**

- **How to avoid this in the future**:
  - Always test CI configuration changes in CI environment
  - Document PNPM configuration requirements
  - Use consistent PNPM configuration across environments
- **Monitoring to implement**:
  - CI workflow success monitoring
  - PNPM configuration validation
  - Module resolution testing in CI
- **Documentation to add**:
  - PNPM configuration requirements
  - CI environment setup guide
  - Troubleshooting guide for module resolution issues
- **Process improvements**:
  - Test CI changes before merging
  - Document all configuration changes
  - Use consistent package manager configuration

### **Knowledge Gained**

- **New tools/techniques learned**:
  - PNPM hoisting configuration options
  - CI environment debugging techniques
  - Module resolution troubleshooting
- **Best practices discovered**:
  - Explicit configuration is better than implicit
  - Test CI changes in CI environment
  - Document all configuration requirements
- **Anti-patterns identified**:
  - Relying on implicit PNPM behavior
  - Not testing CI configuration changes
  - Inconsistent environment configurations
- **Community resources found**:
  - PNPM documentation
  - GitHub Actions troubleshooting guides
  - Module resolution best practices

### **Team Knowledge Sharing**

- **What to share with team**:
  - PNPM hoisting configuration requirements
  - CI environment setup best practices
  - Module resolution troubleshooting techniques
- **Documentation updates needed**:
  - Update CI setup documentation
  - Add PNPM configuration guide
  - Create troubleshooting guide
- **Training opportunities**:
  - PNPM configuration training
  - CI/CD troubleshooting training
  - Module resolution concepts

## 🔗 **RELATED ISSUES & DEPENDENCIES**

### **Similar Problems**

- **Related debugging sessions**:
  - Other CI/CD configuration issues
  - Module resolution problems
  - Package manager configuration issues
- **Common patterns**:
  - Environment-specific configuration issues
  - Package manager behavior differences
  - CI/CD pipeline failures
- **Dependencies**:
  - PNPM configuration affects all CI workflows
  - Module resolution affects all builds
  - Package manager issues can cascade

### **Upstream/Downstream Impact**

- **Upstream issues**:
  - PNPM hoisting behavior
  - GitHub Actions environment differences
  - Vite module resolution
- **Downstream impact**:
  - All CI workflows affected
  - Deployment pipeline affected
  - Development workflow affected
- **Cascade effects**:
  - CI failures prevent deployments
  - Development workflow blocked
  - Team productivity impacted

## 📖 **RESOURCES & REFERENCES**

### **Documentation**

- **Official documentation**:
  - [PNPM Workspace Documentation](https://pnpm.io/workspaces)
  - [PNPM Configuration](https://pnpm.io/npmrc)
  - [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Internal documentation**:
  - Project CI/CD setup guide
  - PNPM configuration requirements
- **API references**:
  - PNPM CLI options
  - GitHub Actions workflow syntax

### **Community Resources**

- **Stack Overflow**:
  - [PNPM hoisting issues](https://stackoverflow.com/questions/tagged/pnpm)
  - [GitHub Actions module resolution](https://stackoverflow.com/questions/tagged/github-actions)
- **GitHub Issues**:
  - [PNPM repository issues](https://github.com/pnpm/pnpm/issues)
  - [Vite module resolution issues](https://github.com/vitejs/vite/issues)
- **Blog Posts**:
  - PNPM best practices
  - CI/CD optimization guides
- **Video Tutorials**:
  - PNPM configuration tutorials
  - GitHub Actions setup guides

### **Tools & Commands**

- **Debugging tools**:
  - GitHub Actions logs
  - PNPM debug output
  - Vite build output
- **Useful commands**:
  - `pnpm -w install --config.node-linker=hoisted`
  - `pnpm list --depth -1`
  - `pnpm why <package-name>`
- **Scripts created**:
  - CI configuration validation script
  - PNPM configuration test script

---

## 🏷️ **TAGGING SYSTEM**

### **Categories**

`ci-cd` `dependencies` `build` `deployment`

### **Technologies**

`pnpm` `github-actions` `vite` `sveltekit` `pixijs`

### **Complexity**

`intermediate`

---

**This debugging chronicle documents the complete journey from problem identification through root
cause discovery to successful resolution, providing a comprehensive resource for future similar
issues.**
