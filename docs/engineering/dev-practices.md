<!-- markdownlint-disable -->

# Development Practices

This document outlines key development practices and guidelines for the Draconia
Chronicles
project.

## Engineering Standards

### Don't Bypass Agreed Requirements

When given specific technical requirements (such as using `pnpm -w -r run build` for
workspace
builds),
implement
those
exact
requirements
rather
than
falling
back
to
alternative
solutions..
If implementation fails:

1. **Debug the root cause** - Use diagnostic commands to understand why the requirement fails

1. **Fix the underlying issue** - Address configuration, environment, or tooling problems

1. **Document the solution** - Explain what was broken and how it was fixed

1. **Avoid shortcuts** - Don't substitute different approaches without explicit approval

### Provide Objective Evidence

Always support implementation claims with concrete, reproducible evidence:

1. **Use grep checks** to verify code patterns across the codebase

1. **Provide exact command outputs** when demonstrating functionality

1. **Show before/after comparisons** when making changes

1. **Document validation steps** that others can reproduce

Example validation commands:

````bash

# Verify robust TypeScript resolution (should return 0 results)

git grep -n "node_modules/typescript/bin/tsc" -- tests

# Verify normalized stdio (should return 0 results)

git grep -n 'stdio: *"inherit"' -- tests

# Count BUILD_ONCE guards (should return 3)

git grep -n "process.env.BUILD_ONCE" -- tests | wc -l

```text

### Communication Standards

When reporting work completion:

1. **Be precise** - Distinguish between "already working" vs "newly implemented"

1. **Own mistakes** - Acknowledge when incorrect assumptions were made

1. **Provide specific details** - Include exact commands, file paths, and error messages

1. **Focus on blockers** - Clearly identify what still needs to be resolved

### Module Resolution and Package Exports

When working with workspace packages, ensure proper module resolution:

1. **Package Exports**: Always point to built files, not source files

   ```json

   // ✅ Correct - points to built files
   "exports": {
     ".": {
       "types": "./dist/index.d.ts",
       "import": "./dist/index.js",
       "require": "./dist/index.js"
     }
   }

   // ❌ Incorrect - points to source files
   "exports": {
     ".": "./src/index.ts"
   }

```javascript

1. **Import Extensions**: Use `.js` extensions in TypeScript files for NodeNext resolution

   ```typescript

   // ✅ Correct
   import { db } from './db.js';

   // ❌ Incorrect
   import { db } from './db';

```javascript

1. **Module Resolution**: Use `NodeNext` for consistent resolution across packages

   ```json

   // ✅ Correct
   "compilerOptions": {
     "moduleResolution": "NodeNext"
   }

```text

### Documentation and Planning Standards

1. **Documentation Location** - All documentation must be created and organized in the `/docs/` folder

1. **Planning Documents** - All new planning documents (workpack plans, feature plans, etc.) go in `/docs/` folder

1. **File Organization** - Use appropriate subdirectories within `/docs/` for different types of documentation

1. **Cross-References** - All documentation should be properly cross-referenced and indexed

### Build and Test Standards

1. **BUILD*ONCE pattern** - All test files should check `!process.env.BUILD*ONCE` before running builds

1. **Robust path resolution** - Use `require.resolve("typescript/bin/tsc")` instead of hardcoded paths

1. **Consistent stdio** - All spawn calls should use `{ stdio: "pipe", encoding: "utf8" }`

1. **Cross-platform compatibility** - Consider Windows/Unix differences in environment variables and paths

## Quality Gates

Before claiming work is "complete":

1. **Run all validation commands** and provide copy/paste results

1. **Test the full workflow** from build through all test execution

1. **Verify cross-platform compatibility** if working on Windows/Unix systems

1. **Update documentation** with any discovered issues and their solutions

## Learning from Feedback

When receiving detailed technical feedback:

1. **Follow the exact steps provided** - Don't skip or modify diagnostic procedures

1. **Implement precisely as specified** - Match the requested patterns and approaches exactly

1. **Document deviations** if modifications are necessary and why

1. **Ask for clarification** rather than making assumptions about requirements

These practices help maintain code quality and ensure reliable, predictable development
processes.

````
