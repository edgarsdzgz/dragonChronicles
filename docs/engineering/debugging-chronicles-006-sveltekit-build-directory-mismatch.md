# Debugging Chronicle: SvelteKit Build Directory Mismatch and Invalid Preload Configuration

**Session ID**: DC-2025-09-06-006
**Date**: 2025-09-06
**Duration**: 3 hours
**Developer**: Edgar Diaz-Gutierrez
**Project**: Draconia Chronicles
**Status**: ✅ Resolved

## 🚨 **PROBLEM STATEMENT**

### **Issue Title**

SvelteKit build output directory mismatch causing vite preview server failures and invalid preload
configuration breaking builds

### **Severity Level**

- **High**: E2E testing completely broken, preventing CI/CD pipeline completion

### **Impact Assessment**

- **What functionality is affected**: E2E Smoke workflow failing, preventing 6/6 workflow success
- **User impact**: No E2E testing validation, potential deployment of broken features
- **Development impact**: CI/CD pipeline incomplete, blocking development workflow
- **Business impact**: Quality assurance compromised, deployment confidence reduced

### **Initial Symptoms**

- **What was observed first**: E2E Smoke workflow failing with server connectivity issues
- **When did it start**: After configuring SvelteKit to output to dist directory
- **Error messages**:

  ```
  ❌ Server failed to start after 20 seconds
  Server not ready yet, waiting 2 seconds...
  Error: Unexpected option config.kit.preload
  ```

- **Unexpected behavior**: Server process running but not responding to HTTP requests

## 🔍 **ENVIRONMENT CONTEXT**

### **System Information**

- **OS**: GitHub Actions Ubuntu runners
- **Node Version**: 20.x
- **Package Manager**: PNPM 9.x
- **Browser**: N/A (CI environment)
- **IDE/Editor**: GitHub Actions

### **Project State**

- **Git Branch**: feat/w7-cicd-previews
- **Last Working State**: Before SvelteKit configuration changes
- **Recent Changes**: Modified svelte.config.js for dist output, added preload configuration
- **Dependencies**:
  - @sveltejs/adapter-static: ^2.0.3
  - @sveltejs/kit: ^1.30.0
  - vite: ^4.5.0

### **Relevant Configuration**

- **Build Configuration**: SvelteKit with static adapter
- **Environment Variables**: Standard GitHub Actions environment
- **CI/CD State**: 5/6 workflows passing, E2E Smoke failing

## 🕵️ **INVESTIGATION PROCESS**

### **Phase 1: Initial Analysis**

#### **First Observations**

- **What we noticed first**: E2E Smoke workflow failing with server timeout issues
- **Expected vs Actual behavior**:
  - Expected: Server should start and respond to HTTP requests
  - Actual: Server process running but not responding, eventually timing out
- **Error messages and logs**:

  ```
  COMMAND  PID   USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
  node    6115 runner   18u  IPv6  25020      0t0  TCP *:4173 (LISTEN)
  ```

- **Initial hypothesis**: Server startup timing issues or port conflicts

#### **Quick Checks Performed**

- **Basic troubleshooting**: Checked server process status, port availability
- **Documentation consulted**: SvelteKit documentation, vite preview documentation
- **Similar issues searched**: "vite preview server running but not responding", "SvelteKit build

directory"

- **Team consultation**: N/A (solo debugging session)

### **Phase 2: Deep Investigation**

#### **Tools and Methods Used**

- **Debugging tools**: GitHub Actions logs, lsof, ps aux, curl
- **Log analysis**: Detailed CI workflow logs, server startup logs
- **Code inspection**: svelte.config.js, package.json, workflow files
- **Network analysis**: Port connectivity testing
- **Performance profiling**: Server startup timing analysis

#### **Research Conducted**

- **Documentation reviewed**:
  - SvelteKit adapter-static documentation
  - Vite preview server documentation
  - GitHub Actions debugging guides
- **Stack Overflow searches**: "SvelteKit build directory dist vs build", "vite preview not serving

content"

- **GitHub issues checked**: SvelteKit repository issues, Vite repository issues
- **Community forums**: SvelteKit Discord, GitHub Discussions
- **Blog posts/articles**: SvelteKit deployment guides, CI/CD best practices

#### **Experiments and Tests**

- **Hypothesis testing**:
  - Tested different build output directories
  - Tried different vite preview configurations
  - Tested server startup timing
- **Code modifications**:
  - Modified svelte.config.js adapter configuration
  - Updated package.json preview script
  - Changed workflow server startup commands
- **Configuration changes**:
  - Updated SvelteKit adapter settings
  - Modified build output directory configuration
  - Changed server startup parameters
- **Environment changes**:
  - Tested different server startup approaches
  - Modified CI environment variables
  - Changed server wait timeouts

### **Phase 3: Root Cause Discovery**

#### **The Real Problem**

- **Actual root cause**: Two separate but related issues:
1. **Directory Mismatch**: `vite preview` expects `dist` directory but SvelteKit creates `build`

directory by default

2. **Invalid Configuration**: Added `preload` configuration that doesn't exist in current SvelteKit

version

- **Why initial hypothesis was wrong**: The issue wasn't just timing - it was a fundamental mismatch

between build output and server expectations

- **Key insights discovered**:
  - SvelteKit's default build output is `build/`, not `dist/`
  - `vite preview` by default looks for `dist/` directory
  - SvelteKit doesn't support `preload` configuration in the way we tried to use it
  - The server was running but had no content to serve
- **Hidden dependencies**: The issue was related to how SvelteKit's static adapter works vs.

standard Vite behavior

#### **Evidence Supporting Root Cause**

- **Log evidence**: Server process running but no HTTP responses
- **Code evidence**: Build output in `build/` directory, server looking in `dist/`
- **Configuration evidence**: Invalid `preload` config causing build failures
- **Timing evidence**: Server started but immediately failed to serve content

## 🔧 **SOLUTION IMPLEMENTATION**

### **The Fix**

#### **Solution Approach**

- **Strategy chosen**: Configure SvelteKit to output to `dist` directory and remove invalid preload

configuration

- **Alternative approaches considered**:
  - Configure vite preview to look in build directory (rejected - more complex)
  - Use different build tool (rejected - too disruptive)
  - Modify server startup script (rejected - doesn't address root cause)
- **Risk assessment**: Low risk - only affects build configuration, doesn't change functionality

#### **Implementation Details**

- **Code changes**:
  - Updated `svelte.config.js` to use `dist` output directory
  - Removed invalid `preload` configuration
- **Configuration changes**:
  - Modified SvelteKit adapter configuration
  - Updated build verification in CI workflow
- **Dependency changes**: N/A
- **Environment changes**:
  - Updated build verification to look for `dist` directory
  - Modified test expectations for new build structure

#### **Step-by-Step Implementation**

1. **Step 1**: Identified directory mismatch between SvelteKit output and vite preview expectations
2. **Step 2**: Configured SvelteKit adapter to output to `dist` directory
3. **Step 3**: Removed invalid `preload` configuration that was breaking builds
4. **Step 4**: Updated build verification in CI workflow to check for `dist` directory
5. **Step 5**: Updated tests to handle SvelteKit's natural preload behavior properly

### **Verification Process**

#### **Testing the Fix**

- **How we tested**: Ran CI workflows multiple times to ensure consistency
- **Test cases**:
  - Build workflow
  - E2E Smoke workflow
  - All other CI workflows
- **Edge cases**:
  - Different branches
  - Clean CI environments
  - Different commit states
- **Regression testing**: Ensured local development still worked correctly

#### **Success Criteria**

- **Primary success**: E2E Smoke workflow now passes consistently
- **Secondary success**: Build output properly structured for deployment
- **Performance impact**: No performance impact
- **User experience**: CI/CD pipeline now complete, quality assurance restored

## 📚 **PREVENTION & LESSONS LEARNED**

### **Prevention Strategies**

- **How to avoid this in the future**:
  - Always verify build output directory matches server expectations
  - Check SvelteKit documentation for supported configuration options
  - Test build output structure before assuming server compatibility
- **Monitoring to implement**:
  - Build output validation in CI
  - Server startup verification
  - Configuration validation
- **Documentation to add**:
  - SvelteKit build configuration requirements
  - CI environment setup guide
  - Troubleshooting guide for build/server mismatches
- **Process improvements**:
  - Test configuration changes in CI environment
  - Document all build configuration requirements
  - Validate build output structure

### **Knowledge Gained**

- **New tools/techniques learned**:
  - SvelteKit adapter configuration options
  - Vite preview server behavior
  - Build output directory management
- **Best practices discovered**:
  - Explicit configuration is better than assumptions
  - Test build output structure
  - Verify server compatibility with build output
- **Anti-patterns identified**:
  - Assuming build output directory structure
  - Using unsupported configuration options
  - Not testing server compatibility
- **Community resources found**:
  - SvelteKit documentation
  - Vite preview documentation
  - CI/CD troubleshooting guides

### **Team Knowledge Sharing**

- **What to share with team**:
  - SvelteKit build configuration requirements
  - CI environment setup best practices
  - Build output validation techniques
- **Documentation updates needed**:
  - Update build configuration documentation
  - Add SvelteKit setup guide
  - Create troubleshooting guide
- **Training opportunities**:
  - SvelteKit configuration training
  - CI/CD troubleshooting training
  - Build system concepts

## 🔗 **RELATED ISSUES & DEPENDENCIES**

### **Similar Problems**

- **Related debugging sessions**:
  - Other CI/CD configuration issues
  - Build system problems
  - Server startup issues
- **Common patterns**:
  - Build output directory mismatches
  - Configuration validation issues
  - CI/CD pipeline failures
- **Dependencies**:
  - SvelteKit configuration affects all builds
  - Build output affects all deployments
  - Server configuration affects all testing

### **Upstream/Downstream Impact**

- **Upstream issues**:
  - SvelteKit build behavior
  - Vite preview server expectations
  - GitHub Actions environment differences
- **Downstream impact**:
  - All CI workflows affected
  - Deployment pipeline affected
  - Testing workflow affected
- **Cascade effects**:
  - Build failures prevent deployments
  - Testing failures prevent quality assurance
  - Development workflow blocked

## 📖 **RESOURCES & REFERENCES**

### **Documentation**

- **Official documentation**:
  - [SvelteKit Adapter Static](https://kit.svelte.dev/docs/adapter-static)
  - [Vite Preview Server](https://vitejs.dev/guide/cli.html#vite-preview)
  - [GitHub Actions Documentation](https://docs.github.com/en/actions)
- **Internal documentation**:
  - Project build configuration guide
  - SvelteKit setup requirements
- **API references**:
  - SvelteKit configuration options
  - Vite CLI options

### **Community Resources**

- **Stack Overflow**:
  - [SvelteKit build directory issues](https://stackoverflow.com/questions/tagged/sveltekit)
  - [Vite preview server problems](https://stackoverflow.com/questions/tagged/vite)
- **GitHub Issues**:
  - [SvelteKit repository issues](https://github.com/sveltejs/kit/issues)
  - [Vite repository issues](https://github.com/vitejs/vite/issues)
- **Blog Posts**:
  - SvelteKit deployment guides
  - CI/CD optimization guides
- **Video Tutorials**:
  - SvelteKit configuration tutorials
  - GitHub Actions setup guides

### **Tools & Commands**

- **Debugging tools**:
  - GitHub Actions logs
  - lsof, ps aux, curl
  - Vite build output
- **Useful commands**:
  - `lsof -i :4173`
  - `ps aux | grep vite`
  - `curl -f http://127.0.0.1:4173/`
- **Scripts created**:
  - Build verification script
  - Server startup validation script

---

## 🏷️ **TAGGING SYSTEM**

### **Categories**

`ci-cd` `build` `testing` `deployment`

### **Technologies**

`sveltekit` `vite` `github-actions` `playwright`

### **Complexity**

`intermediate`

---

**This debugging chronicle documents the complete journey from problem identification through root
cause discovery to successful resolution, providing a comprehensive resource for future similar
issues.**
