# Automation Standards & Principles

## Automation-First Principle

**CRITICAL RULE**: When manual attempts fail repeatedly (3+ times), check the scripts folder for existing automation tools first. If none exist, create bash scripts for simple tasks or Python scripts for complex ones. This saves tokens, thinking time, and ensures consistent results.

## Existing Automation Tools

### Scripts Directory (`/scripts/`)

#### Core Automation Scripts

- **`fix-markdown-universal.py`**: Universal markdown linting fixer (comprehensive, file-agnostic)

- **`memory-manager.py`**: AI memory system management (read, update, add, search)

- **`size-budgets.mjs`**: Bundle size validation and monitoring

- **`verify-implementation.sh`**: Implementation completeness verification

#### Test Automation

- **`test-*.mjs`**: Individual test suite runners

- **`run-all.mjs`**: Cross-platform test orchestrator with BUILD_ONCE optimization

- **`_tiny-runner.mjs`**: Custom test runner with proper exit codes

#### Maintenance Scripts

- **`nuke-idb.mjs`**: Clear IndexedDB for testing

- **`seed-profiles.mjs`**: Seed database with sample data

- **`tsconfig-audit.mjs`**: TypeScript configuration validation

### Git Hooks (Husky v9+)

#### Pre-commit Hook

````bash

pnpm exec lint-staged

```text

**Triggers**: Automatic ESLint fix and Prettier formatting on staged files

#### Commit-msg Hook

```bash

pnpm exec commitlint --edit "$1"

```text

**Validates**: Conventional commit message format

#### Lint-staged Configuration

```json

{
  "*.{ts,tsx,js,svelte}": [
    "eslint --config ./configs/eslint/.eslintrc.cjs --fix"
  ],
  "*.{ts,tsx,js,json,md,css,scss,svelte}": [
    "prettier --config ./configs/prettier/.prettierrc.cjs --write"
  ]
}

```javascript

### Package.json Scripts

#### Build Automation

```bash

pnpm run build        # Build all packages and apps
pnpm run build:ci     # Force rebuild for CI
pnpm run clean        # Clean all build artifacts
pnpm run typecheck    # TypeScript validation

```bash

#### Test Automation (2)

```bash

node tests/run-all.mjs     # Primary test command (cross-platform)
pnpm run test:all          # Alternative test execution
pnpm run test:vitest       # Vitest test suites
pnpm run test:e2e          # End-to-end tests
pnpm run test:ts-strict    # TypeScript strict gate

```bash

#### Quality Automation

```bash

pnpm run lint             # ESLint with auto-fix
pnpm run format           # Prettier auto-format
pnpm run verify:style     # Combined lint + format check
pnpm run verify:all       # All quality checks

```bash

#### Documentation Automation

```bash

pnpm run docs:lint        # Markdown linting
pnpm run docs:links       # Link validation
python scripts/fix-markdown-universal.py  # Auto-fix markdown

```text

## CI/CD Automation

### GitHub Actions Workflows

#### Automated Quality Gates

1. **Checks Workflow**: ESLint, Prettier, TypeScript, Markdown linting

1. **CI Workflow**: Build, tests, size budgets, deployment

1. **Docs Workflow**: Documentation validation and link checking

1. **Pages Deploy**: Automated GitHub Pages deployment

1. **Lighthouse**: Performance and accessibility validation

1. **E2E Smoke**: End-to-end testing automation

#### Environment Variables

- **HUSKY**: Set to '0' in CI to prevent hook execution

- **BUILD_ONCE**: Optimize test execution by skipping rebuilds

- **BUDGET*BASE*KB**: Size budget for base app (200KB)

- **BUDGET*LOGGER*KB**: Size budget for logger (8KB)

### Automated Dependency Management

#### PNPM Automation

```bash

# Workspace root commands (automated in CI)

pnpm -w install
pnpm -w install --lockfile-only  # Sync lockfile
pnpm -w list --depth -1          # Workspace validation

```bash

#### Lockfile Sync (Pre-commit Hook)

```bash

# Automatic lockfile sync when package.json changes

if git diff --cached --name-only | grep -qE '(^|/)(package\.json)$'; then
  echo "package.json changed -> syncing pnpm-lock.yaml"
  pnpm -w install --lockfile-only
  git add pnpm-lock.yaml
fi

```text

## Automation Patterns

### Sequential Problem Solving

**Focus on one issue at a time with a slow and steady approach.** This provides better control over testing, breaking, and fixing, preventing cascading failures.

### Pipeline-First Strategy

**Always trust GitHub Actions logs over local tests for debugging.** When CI fails, investigate and resolve each workflow one at a time, using online resources to bolster research and debugging.

### BUILD_ONCE Optimization

**Pattern**: Single build followed by multiple test executions

```javascript

// In test files
if (!process.env.BUILD_ONCE) {
  const r = spawnSync('node', [tscBin, '-b'], { stdio: 'pipe', encoding: 'utf8' });
  assert.equal(r.status, 0, 'Build failed');
}

```javascript

### Cross-Platform Automation

```javascript

// Platform detection for automation
const isWindows = process.platform === 'win32';
const cmd = isWindows ? 'cmd' : 'npx';
const args = isWindows ? ['/c', 'node_modules\\.bin\\command.CMD'] : ['command'];

const result = spawnSync(cmd, args, {
  stdio: 'pipe',
  encoding: 'utf8',
  // Never use shell: true - causes Windows path issues
});

```text

## Automation Creation Guidelines

### When to Create Automation

1. **3+ Manual Attempts**: If you've done something manually 3+ times, automate it

1. **Repetitive Tasks**: Any task that's done regularly across development

1. **Error-Prone Processes**: Manual processes that frequently have mistakes

1. **Cross-Platform Issues**: Tasks that behave differently on different platforms

### Script Types by Complexity

#### Simple Tasks → Bash Scripts

- File operations

- Basic git commands

- Simple validation checks

- Environment setup

#### Complex Tasks → Python Scripts

- File parsing and manipulation

- Complex logic and conditionals

- Cross-platform compatibility

- Data processing and analysis

### Automation Standards

#### Script Requirements

1. **Error Handling**: Proper error codes and messages

1. **Documentation**: Clear usage instructions and examples

1. **Cross-Platform**: Work on Windows, macOS, and Linux

1. **Idempotent**: Safe to run multiple times

1. **Validation**: Verify results and provide feedback

#### Script Location

- **`/scripts/`**: All automation scripts

- **Naming**: Descriptive names with action-object pattern

- **Documentation**: Include usage examples in script headers

## Memory System Automation

### AI Memory Management

```bash

# Automated memory operations

python scripts/memory-manager.py read
python scripts/memory-manager.py update "Current Session" "Session summary"
python scripts/memory-manager.py add "Key Learnings" "New discovery"
python scripts/memory-manager.py search "keyword"
python scripts/memory-manager.py timestamp

```text

### Memory Update Triggers

- **Session Start**: Initialize session context

- **Issue Resolution**: Document solutions and learnings

- **Phase Completion**: Update project status

- **Discovery**: Capture new knowledge and patterns

## Performance Automation

### Size Budget Monitoring

```javascript

// Automated size checking
const BUDGET*BASE*KB = Number(process.env.BUDGET*BASE*KB || 200);
const BUDGET*LOGGER*KB = Number(process.env.BUDGET*LOGGER*KB || 8);

// Automated gzip size calculation
function gzipSize(buf) { return zlib.gzipSync(buf).length; }

```bash

### Bundle Analysis Automation

```bash

pnpm run bundle:analyze     # Analyze bundle composition
pnpm run bundle:optimize    # Optimize bundle size
pnpm run bundle:size        # Size analysis
pnpm run performance:monitor # Performance monitoring

```text

## Debugging Automation

### Systematic Debugging Process

1. **One Workflow at a Time**: Fix failing workflows systematically

1. **Pipeline-First**: Trust CI logs over local tests

1. **Online Research**: Use web search for known solutions

1. **Documentation**: Chronicle all debugging sessions

### Automated Debugging Tools

```bash

gh run list --limit 5                    # Check pipeline status
python scripts/memory-manager.py search "error"  # Search previous solutions
pnpm run workspace:health                # Workspace integrity check

```text

## Quality Automation (2)

### Automated Quality Checks

```bash

# Pre-commit automation (via Husky)

pnpm exec lint-staged

# Pre-push validation

pnpm run verify:all

# CI automation

pnpm run test:all && pnpm run lint && pnpm run format:check

```bash

### Automated Fixes

```bash

# Code formatting

pnpm run format

# Markdown fixing

python scripts/fix-markdown-universal.py docs/

# Dependency sync

pnpm -w install --lockfile-only

```text

This automation framework ensures consistent, efficient development processes while
reducing
manual
effort
and
human
error.
````
