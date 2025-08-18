# Claude Development Guidelines

This file contains important guidelines and patterns for working on the Draconia Chronicles project.

## Testing Guidelines

### Exit Codes and Output

**Don't add a naked `console.log("ok")` at the end—that lies about the result.** The runner already prints derived results and sets the exit code correctly.

❌ **WRONG:**
```javascript
assert.equal(someFunction(), expectedValue);
console.log("UNIT(shared): ok"); // Meaningless - always prints even if asserts failed
```

✅ **CORRECT:**
```javascript
test("function works correctly", () => {
  assert.equal(someFunction(), expectedValue);
});
await run(); // Prints "ok - 1 passed" or "FAIL - 1 failed" with proper exit codes
```

### Current Test Architecture

These scripts currently build and import from `dist/`. That's fine for now, but when we move to Vitest/Playwright we'll import source for unit/integration and run a browser for true UI E2E. (This file set is focused on quick smoke/unit/integration checks and a build-level E2E.)

**Current Pattern:**
- **Unit tests:** Build specific packages, import from `dist/`, test isolated functions
- **Integration tests:** Build dependencies, import from `dist/`, test package interactions  
- **E2E tests:** Build workspace, run compiled sandbox app, test CLI contracts

**Future Migration:**
- **Unit/Integration:** Direct source imports via Vitest for faster feedback
- **E2E:** Browser-based testing via Playwright for real UI validation

### Test Structure

Use the tiny test runner for structured, countable tests:

```javascript
import { test, run } from "./_tiny-runner.mjs";

test("descriptive test name", () => {
  // Your assertions here
});

test("another test case", () => {
  // More assertions
});

await run(); // Handles exit codes and reporting
```

This ensures:
- ✅ Proper exit codes (0 = pass, 1 = fail)
- ✅ Meaningful output ("ok - 2 passed" vs "FAIL - 1 failed, 1 passed")
- ✅ CI/pnpm compatibility
- ✅ Individual test case tracking

## Build Optimization Notes

### Current Build Pattern
The current test scripts trigger TypeScript compilation multiple times:
1. Unit tests build specific packages (`tsc -b packages/shared`)  
2. Integration tests build dependencies (`tsc -b packages/shared packages/logger packages/sim`)
3. E2E tests build entire workspace (`tsc -b`)

This results in multiple rebuilds of the same packages during `test:all`.

### Future Optimization Options
- **SKIP_BUILD environment variable:** Allow tests to skip compilation when artifacts are known to be current
- **Workspace scripts:** Use `pnpm --filter` patterns instead of direct TypeScript paths for better dependency management
- **Build-once pattern:** Run full workspace build once, then run all tests against existing artifacts

Example improved pattern:
```bash
# Instead of rebuilding per test
npm run build  # Once
SKIP_BUILD=1 npm run test:all  # Skip rebuilds
```

## GitHub PR Guidelines

### PR References and Issue Closing

**Always reference related PRs and issues in PR descriptions using GitHub keywords:**

✅ **CORRECT:**
```markdown
## Summary
This PR implements feature X...

## Resolves
- Closes #123 (the issue this PR addresses)
- Related to #124 (if there are related issues)

## Previous Work
- Builds on #120 (if this continues work from another PR)
```

❌ **WRONG:**
```markdown
## Summary  
This PR implements feature X...
// No issue references - GitHub won't auto-close issues
```

### Keywords for Auto-Closing Issues
Use these keywords in PR descriptions to automatically close issues when the PR is merged:
- `Closes #123`
- `Fixes #123` 
- `Resolves #123`
- `Closes: #123`

### PR Linking Best Practices
- **Always** reference the original issue being resolved
- Link to previous PRs when work is iterative
- Use "Related to #X" for issues that are connected but not directly resolved
- Include issue numbers in commit messages when relevant

## Issue Implementation Workflow

### New Issue Process (MANDATORY)

**When given a new issue, ALWAYS follow this sequence:**

1. **Create Feature Branch**
   - Create new git branch: `feat/p0-s00X-<short-description>`
   - Example: `feat/p0-s002-typescript-strict`

2. **Create Planning Document** 
   - Create `S00XPlan.md` in root directory
   - Include: analysis, implementation plan, risk assessment, TODO list
   - Commit the planning document to the new branch
   - Push branch to create PR placeholder

3. **Present Plan to User**
   - Review plan with user before implementation
   - Get confirmation to proceed

4. **Execute Implementation**
   - Work through TODO list systematically
   - Update plan document if scope changes
   - Regular commits with clear messages

5. **Final PR**
   - Reference original issue with `Closes #X`
   - Include plan summary in PR description

### Branch Naming Convention
- Feature branches: `feat/p0-s00X-<description>`
- Bugfix branches: `fix/p0-s00X-<description>`  
- Refactor branches: `refactor/p0-s00X-<description>`

### Planning Document Template
```markdown
# S00X Planning Document

## Issue Analysis
[Summary of requirements and current state]

## Implementation Plan
[Detailed step-by-step plan]

## Risk Assessment
[Potential issues and mitigation strategies]

## TODO List
[Actionable items with priorities]

## Acceptance Criteria
[How to verify completion]
```

**Remember: No implementation work until plan is approved!**

## Commit Message Guidelines

### DO NOT Include Claude Attribution

**NEVER include these lines in commit messages:**
- `🤖 Generated with [Claude Code](https://claude.ai/code)`
- `Co-Authored-By: Claude <noreply@anthropic.com>`
- Any other Claude/Anthropic attribution

**Write commit messages as if you are the developer.** Keep them professional and focused on the technical changes.

## PR Summary Guidelines

### Always Provide PR Summary

**After completing implementation and before git push, ALWAYS provide:**
- PR title
- PR body with summary, key changes, verification results
- Reference to issue being closed (`Closes #X`)
- Any special notes for reviewer

### Issue Number Verification

**ALWAYS ask for issue number if not provided:**
- When starting new work, confirm the GitHub issue number
- Update planning documents with correct issue reference
- Ensure PR will close the right issue with `Closes #X`
- If user forgets to provide issue number, ASK before proceeding

### Planning Document Cleanup

**After PR merge, clean up old planning documents:**
- When finishing an issue and pushing final PR, ASK if the PR was merged
- Once confirmed merged, delete the corresponding S00XPlan.md file to avoid clutter
- Keep only active/current planning documents
- Example: After S002 merges, delete S002Plan.md when working on S002-R1

**Template:**
```markdown
## PR Title
feat: [brief description]

## PR Body
### Summary
- Brief overview of changes

### Key Changes
- Specific technical changes made

### Verification
- Test results and validation

### Resolves
- Closes #[issue-number]
```