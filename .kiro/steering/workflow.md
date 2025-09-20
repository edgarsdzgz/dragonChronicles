# Development Workflow & Process Standards

## MANDATORY Workflow Requirements

### Documentation Standards Rule (DOC-STANDARDS-001)

**MANDATORY**: All documentation, especially Epics and Stories, MUST include comprehensive summaries with both technical and non-technical explanations at every hierarchical level.

**Requirements:**

- Every Epic of Epics, Epic, Story, and Chapter must have non-technical and technical summaries

- Every code example must include comprehensive inline comments explaining what it does and why

- Every section must explain its purpose and how it integrates with other systems

- Non-technical summaries must be accessible to non-coders

- Technical summaries must be precise and complete

**Implementation:**

- Use the Documentation Standards Rule template for all new documentation

- Update existing documentation to comply with this rule

- This rule applies to ALL project documentation including GDD, Epics, Stories, and technical specs

- See `docs/Documentation*Standards*Rule.md` for complete requirements and templates

### Issue Implementation Process

**CRITICAL**: When given a new issue, ALWAYS follow this sequence:

1. **Create Feature Branch**: `feat/p0-s00X-<description>` or `feat/wX-<description>`

1. **Create Planning Document**: `S00XPlan.md` or `WXPlan.md` in root directory (following Documentation Standards Rule)

1. **Present Plan to User**: Get confirmation before implementation

1. **Execute Implementation**: Work through TODO list systematically

1. **Pre-PR Check**: Comprehensive summary before creating PR

1. **Final PR Creation**: Only after user approval

### Branch Management Standards

#### Branch Naming Convention

- **Feature branches**: `feat/p0-s00X-<description>` or `feat/wX-<description>`

- **Bugfix branches**: `fix/p0-s00X-<description>`

- **Refactor branches**: `refactor/p0-s00X-<description>`

#### Branch Cleanup (MANDATORY)

**After PR merge, ALWAYS execute cleanup:**

1. Switch to main branch: `git checkout main`

1. Pull latest changes: `git pull origin main`

1. Delete local feature branch: `git branch -d <branch-name>`

1. Delete remote feature branch: `git push origin --delete <branch-name>`

1. Delete planning documents (WXPlan.md, S00XPlan.md)

1. Clean build artifacts: `pnpm run clean`

### Commit Standards

#### Conventional Commit Format (REQUIRED)

```text

type(scope): description

[optional body]

[optional footer]

```text

#### Commit Types

- **feat**: New feature

- **fix**: Bug fix

- **docs**: Documentation changes

- **style**: Code style changes (formatting, etc.)

- **refactor**: Code refactoring

- **test**: Adding or updating tests

- **build**: Build system changes

- **ci**: CI/CD changes

- **chore**: Maintenance tasks

#### Commit Rules

- **Accurate Claims**: Commit messages must accurately reflect actual changes

- **File Verification**: Claims about features must be backed by actual files

- **Implementation Completeness**: Feature claims require complete implementation

- **Header Length**: Maximum 72 characters

- **Scope Required**: Always include scope in parentheses

### Git Push Standards

**ALWAYS use explicit origin and branch when pushing:**

```bash

git push origin <BRANCH>

```bash

**Never use bare `git push`** - this can accidentally push to wrong branches.

## Quality Gates (MANDATORY)

### Before Committing

- [ ] All changes are staged correctly

- [ ] Commit message accurately describes changes

- [ ] Tests pass locally: `pnpm run test:all`

- [ ] No sensitive information in commit

- [ ] Implementation is complete (if claiming completion)

### Before Pushing

- [ ] All commits are accurate and complete

- [ ] Implementation verification passes

- [ ] No merge conflicts

- [ ] Branch is up to date with main

- [ ] All documentation is updated

### Before Creating PR

- [ ] Feature is completely implemented

- [ ] All tests pass: `pnpm run test:all`

- [ ] Code quality checks pass: `pnpm run lint` and `pnpm run format:check`

- [ ] TypeScript strict mode compliance: `pnpm run typecheck`

- [ ] Documentation updated

- [ ] User has approved pre-PR summary

## Anti-Patterns (NEVER DO)

### 1. Stashing Important Work

```bash

# ❌ Never do this with important implementation work

git stash

# ✅ Instead, commit the work

git add .
git commit -m "feat: implement feature X"

```bash

### 2. Misleading Commit Messages

```bash

# ❌ Don't claim features without implementation

git commit -m "feat: implement PWA" # when no PWA files exist

# ✅ Be accurate about what was actually done

git commit -m "docs: add PWA planning document"

```javascript

### 3. Bypassing Agreed Requirements

**Don't fall back to alternative approaches when the agreed path fails.**
Instead:

1. Debug the root cause systematically

1. Fix the underlying configuration/environment issue

1. Implement exactly what was requested

1. Document the solution and validation steps

### 4. Incomplete Implementations

```bash

# ❌ Don't claim complete implementation with partial work

git commit -m "feat: complete PWA implementation" # when only 50% done

# ✅ Be honest about implementation status

git commit -m "feat: add PWA manifest and service worker"

```javascript

## Documentation Standards

### Planning Documents

- **Location**: All planning documents in `/docs/` folder

- **Workpack plans**: Go directly in `/docs/` folder

- **Feature plans**: Go in appropriate subdirectories

- **Temporary Nature**: Delete planning documents after completion

- **No Root Planning**: Never create planning documents in root directory

### Documentation Updates

**Version changes require updates to:**

1. GDD version and status

1. Overview README version

1. Changelog new version entry

1. CLAUDE.md versioning guidelines if needed

1. Package.json version numbers across workspace

## Testing Requirements

### Test Execution Standards

- **Primary Command**: `node tests/run-all.mjs` (cross-platform with BUILD_ONCE optimization)

- **Individual Tests**: Use `pnpm run test:unit`, `pnpm run test:integration`, etc.

- **CI Compatibility**: All tests must pass in CI environment

- **100% Pass Rate**: No failing tests allowed in main branch

### Test Hygiene Rules

1. **Never hard-code tool paths**: Always resolve binaries with `require.resolve()`

1. **Keep CI output clean**: Use `{ stdio: "pipe", encoding: "utf8" }` in tests

1. **Only tiny-runner emits "ok"**: Never add `console.log("ok")` in tests

1. **Use resilient assertions**: Filter and check meaningful content, not brittle exact counts

1. **Guard builds with BUILD_ONCE=1**: Tests should build only if needed

## Performance Standards

### Size Budgets (ENFORCED)

- **Base app**: ≤200KB gzipped

- **Logger package**: ≤8KB gzipped

- **Validation**: `pnpm run size:check` must pass

### Build Performance

- **Incremental compilation**: Use TypeScript project references

- **BUILD_ONCE optimization**: Use driver for test execution

- **Clean builds**: Regular `pnpm run clean` to prevent stale artifacts

## Cross-Platform Compatibility

### Windows Considerations

- **No shell: true**: Causes path interpretation issues on Windows

- **Direct binary execution**: Use full paths to .CMD files when needed

- **Path resolution**: Use Node.js path utilities, not hardcoded paths

### Environment Variables

- **BUILD_ONCE**: Used to skip rebuilds in test execution

- **HUSKY**: Set to '0' in CI to prevent hook execution

- **Platform detection**: Use `process.platform === 'win32'` for Windows-specific logic

This workflow ensures reliable, high-quality development while preventing common workflow
failures
and
maintaining
project
standards.
