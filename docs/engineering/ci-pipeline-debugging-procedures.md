# CI/CD Pipeline Debugging Procedures

**Purpose**: Systematic approach for debugging failing CI/CD workflows in the Draconia Chronicles project

**Created**: 2025-01-15
**Version**: 1.0.0

---

## 🎯 **Core Debugging Principles**

### **Pipeline-First Strategy (CRITICAL)**

**User Directive**: "Always go by what the GitHub logs say, not by local tests"

**Implementation**:

- Use GitHub Actions logs as the source of truth
- Don't rely on local test results to determine pipeline health
- Focus on actual CI/CD environment failures

### **Systematic Workflow-by-Workflow Approach**

**User Directive**: "Go through each workflow one by one"

**Implementation**:

1. **Identify failing workflow** from GitHub Actions logs
2. **Run equivalent commands locally** to reproduce issues
3. **Fix root cause** rather than symptoms
4. **Validate fix** with local testing
5. **Push to GitHub** and verify pipeline improvement
6. **Repeat** for next failing workflow

### **Internet Research Integration**

**User Directive**: "Use the internet to bolster your knowledge and help find a good solution!"

**Implementation**:

- Research error messages and solutions online
- Look up best practices for specific technologies
- Find community solutions for common CI/CD issues
- Use web search to understand complex error patterns

---

## 🔄 **Step-by-Step Debugging Process**

### **Step 1: Assess Current Pipeline Status**

```bash
# Check current workflow status
gh run list --limit 10

# View specific workflow logs
gh run view [RUN_ID] --log
gh run view [RUN_ID] --log-failed
```

**Identify**:

- Which workflows are failing
- Error messages and exit codes
- Patterns across multiple runs

### **Step 2: Prioritize Workflow Fixes**

**Order of Priority**:

1. **CI** - Core build and test pipeline
2. **Checks** - Linting and formatting
3. **Docs** - Documentation validation
4. **Pages Deploy** - Deployment pipeline
5. **Lighthouse** - Performance and accessibility
6. **E2E Smoke** - End-to-end testing

### **Step 3: Systematic Workflow Debugging**

For each failing workflow:

#### **3.1 Analyze the Error**

- Read the full error message from GitHub Actions logs
- Identify the specific step that failed
- Note any error codes or patterns

#### **3.2 Research the Solution**

- **Use web search** to understand the error
- Look up specific error messages and solutions
- Research best practices for the failing technology
- Find community solutions and workarounds

#### **3.3 Reproduce Locally**

```bash
# Run equivalent commands locally
pnpm run build
pnpm run test:all
pnpm run lint
pnpm run docs:lint
```

#### **3.4 Implement the Fix**

- Apply the solution based on research
- Test the fix locally
- Ensure the fix addresses the root cause

#### **3.5 Validate and Push**

```bash
# Commit and push the fix
git add .
git commit -m "fix: [specific fix description]"
git push origin [branch-name]
```

#### **3.6 Verify Pipeline Improvement**

- Check GitHub Actions for the new run
- Verify the specific workflow now passes
- Move to the next failing workflow

---

## 🛠️ **Common CI/CD Issues and Solutions**

### **Build Failures**

**Common Causes**:

- TypeScript compilation errors
- Missing dependencies
- Module resolution issues
- Environment variable problems

**Debugging Steps**:

1. Check TypeScript errors: `pnpm run typecheck`
2. Verify dependencies: `pnpm install`
3. Check module resolution in `tsconfig.json`
4. Research specific error messages online

### **Test Failures**

**Common Causes**:

- Test environment differences
- Mocking issues
- Browser API availability
- Timing and race conditions

**Debugging Steps**:

1. Run tests locally: `pnpm run test:all`
2. Check test environment setup
3. Research test framework specific issues
4. Look up mocking strategies online

### **Linting Failures**

**Common Causes**:

- Code style violations
- ESLint configuration issues
- Prettier formatting conflicts
- Markdown linting violations

**Debugging Steps**:

1. Run linting locally: `pnpm run lint`
2. Auto-fix issues: `pnpm run format`
3. Research specific linting rules
4. Check configuration files

### **Deployment Failures**

**Common Causes**:

- Environment protection rules
- Build artifact issues
- Configuration problems
- Permission issues

**Debugging Steps**:

1. Check deployment logs
2. Verify environment settings
3. Research deployment platform issues
4. Check branch protection rules

---

## 📊 **Quality Gates and Validation**

### **Required Checks**

- **ESLint**: Zero errors, strict mode compliance
- **Prettier**: Consistent code formatting
- **TypeScript**: Strict mode validation
- **Markdown**: Linting compliance
- **Tests**: 100% pass rate
- **Performance**: Size budget compliance

### **Validation Commands**

```bash
# Full quality check
pnpm run verify:all

# Individual checks
pnpm run lint:quiet
pnpm run format:check
pnpm run docs:lint
pnpm run test:all
```

---

## 🎯 **Success Metrics**

### **Pipeline Health Indicators**

- **All workflows passing**: 100% success rate
- **Build time**: Consistent and reasonable
- **Test coverage**: 100% pass rate
- **Code quality**: Zero linting errors
- **Documentation**: All checks passing

### **Debugging Efficiency**

- **Time to resolution**: Quick identification and fixing
- **Root cause fixes**: Not just symptom masking
- **Knowledge building**: Learning from each issue
- **Prevention**: Avoiding similar issues in future

---

## 📚 **Research and Learning**

### **Web Search Strategies**

1. **Error Message Research**:
   - Copy exact error messages
   - Search for specific error codes
   - Look for GitHub issues and solutions

2. **Technology-Specific Research**:
   - Best practices for failing technologies
   - Configuration examples
   - Community solutions

3. **CI/CD Platform Research**:
   - GitHub Actions documentation
   - Workflow optimization techniques
   - Common pitfalls and solutions

### **Knowledge Building**

- **Document solutions** for future reference
- **Create debugging session chronicles** in `docs/engineering/`
- **Update procedures** based on new learnings
- **Share insights** with the development team

---

## 🔄 **Continuous Improvement**

### **Process Refinement**

- **Track debugging patterns** to identify common issues
- **Optimize workflow configurations** based on learnings
- **Improve error messages** and documentation
- **Automate repetitive fixes** where possible

### **Prevention Strategies**

- **Proactive monitoring** of pipeline health
- **Regular dependency updates** to avoid compatibility issues
- **Configuration validation** before deployment
- **Team knowledge sharing** about common issues

---

## 📝 **Documentation Requirements**

### **Debugging Session Chronicles**

**Mandatory**: All debugging sessions must be documented as chronicles in `docs/engineering/`

**Format**: Follow existing chronicle format with:

- Session overview and objectives
- Issues identified and resolved
- Solutions implemented
- Key learnings and insights
- Next steps and recommendations

**Location**: `docs/engineering/*-debugging-session.md`

### **Example Chronicle Structure**

```markdown
# [Issue] Debugging Session - Complete Documentation

## 📋 Session Overview

- Date and duration
- Objective and scope
- Final status

## 🎯 Issues Identified

- List of problems found
- Root causes analyzed
- Impact assessment

## 🔧 Solutions Implemented

- Specific fixes applied
- Commands and configurations
- Validation steps

## 🎯 Key Learnings

- New insights gained
- Process improvements
- Knowledge building

## 📚 Research and Resources

- Web searches performed
- Resources consulted
- Solutions found online
```

---

**This systematic approach ensures efficient, thorough, and knowledge-building CI/CD pipeline debugging that follows established project standards and user preferences.**
