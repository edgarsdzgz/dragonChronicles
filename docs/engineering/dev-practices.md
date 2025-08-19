<!-- markdownlint-disable -->
# Development Practices

This document outlines key development practices and guidelines for the Draconia Chronicles project.

## Engineering Standards

### Don't Bypass Agreed Requirements

When given specific technical requirements (such as using `pnpm -w -r run build` for workspace builds), implement those exact requirements rather than falling back to alternative solutions. If implementation fails:

1. **Debug the root cause** - Use diagnostic commands to understand why the requirement fails
2. **Fix the underlying issue** - Address configuration, environment, or tooling problems  
3. **Document the solution** - Explain what was broken and how it was fixed
4. **Avoid shortcuts** - Don't substitute different approaches without explicit approval

### Provide Objective Evidence

Always support implementation claims with concrete, reproducible evidence:

1. **Use grep checks** to verify code patterns across the codebase
2. **Provide exact command outputs** when demonstrating functionality
3. **Show before/after comparisons** when making changes
4. **Document validation steps** that others can reproduce

Example validation commands:
```bash
# Verify robust TypeScript resolution (should return 0 results)
git grep -n "node_modules/typescript/bin/tsc" -- tests

# Verify normalized stdio (should return 0 results)  
git grep -n 'stdio: *"inherit"' -- tests

# Count BUILD_ONCE guards (should return 3)
git grep -n "process.env.BUILD_ONCE" -- tests | wc -l
```

### Communication Standards

When reporting work completion:

1. **Be precise** - Distinguish between "already working" vs "newly implemented"
2. **Own mistakes** - Acknowledge when incorrect assumptions were made
3. **Provide specific details** - Include exact commands, file paths, and error messages
4. **Focus on blockers** - Clearly identify what still needs to be resolved

### Build and Test Standards  

1. **BUILD_ONCE pattern** - All test files should check `!process.env.BUILD_ONCE` before running builds
2. **Robust path resolution** - Use `require.resolve("typescript/bin/tsc")` instead of hardcoded paths  
3. **Consistent stdio** - All spawn calls should use `{ stdio: "pipe", encoding: "utf8" }`
4. **Cross-platform compatibility** - Consider Windows/Unix differences in environment variables and paths

## Quality Gates

Before claiming work is "complete":

1. **Run all validation commands** and provide copy/paste results
2. **Test the full workflow** from build through all test execution
3. **Verify cross-platform compatibility** if working on Windows/Unix systems
4. **Update documentation** with any discovered issues and their solutions

## Learning from Feedback

When receiving detailed technical feedback:

1. **Follow the exact steps provided** - Don't skip or modify diagnostic procedures
2. **Implement precisely as specified** - Match the requested patterns and approaches exactly
3. **Document deviations** if modifications are necessary and why
4. **Ask for clarification** rather than making assumptions about requirements

These practices help maintain code quality and ensure reliable, predictable development processes.