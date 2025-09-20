# Quality Standards & Gates

## Code Quality Requirements

### TypeScript Standards (MANDATORY)

#### Strict Mode Compliance

All TypeScript code MUST compile with these strict settings:

- `strict: true` - Enables all strict type checking options

- `noImplicitAny: true` - Prevents implicit any types

- `exactOptionalPropertyTypes: true` - Enforces precise optional property handling

- `noUncheckedIndexedAccess: true` - Requires index signature safety checks

- `noFallthroughCasesInSwitch: true` - Prevents switch fallthrough bugs

#### Validation Command

```bash

pnpm run test:ts-strict

```text

**Expected Output**: `ok - 2 passed`

#### Common Violations & Fixes

```typescript

// ❌ TS7006: Parameter implicitly has 'any' type
function helper(value) { return value; }

// ✅ Fixed: Explicit type annotation
function helper(value: unknown): unknown { return value; }

// ❌ TS7031: Binding element implicitly has 'any' type
function extract({ data }) { return data; }

// ✅ Fixed: Explicit destructuring types
function extract({ data }: { data: unknown }): unknown { return data; }

```text

### ESLint Standards (ZERO ERRORS POLICY)

#### Required Commands

```bash

pnpm run lint        # ESLint with auto-fix
pnpm run lint:quiet  # ESLint without warnings

```text

#### Configuration

- **ESLint 9 flat config**: Modern configuration format

- **Zero errors policy**: No ESLint errors allowed in main branch

- **Auto-fix enabled**: Use `--fix` flag for automatic corrections

- **Svelte support**: Includes eslint-plugin-svelte for .svelte files

### Prettier Standards (CONSISTENT FORMATTING)

#### Required Commands (2)

```bash

pnpm run format       # Auto-format all files
pnpm run format:check # Check formatting without changes

```javascript

#### Scope

- **File types**: TypeScript, JavaScript, JSON, Markdown, CSS, SCSS, Svelte

- **Configuration**: Centralized in `configs/prettier/.prettierrc.cjs`

- **Ignore patterns**: Defined in `configs/prettier/.prettierignore`

### Markdown Standards (100% COMPLIANCE)

#### Linting Requirements

```bash

pnpm run docs:lint   # Markdown linting validation
pnpm run docs:links  # Internal link validation

```bash

#### Auto-Fix Tool

```bash

python scripts/fix-markdown-universal.py [files/directories]

```text

#### Key Rules

- **MD013**: Line length ≤100 characters (configurable)

- **MD022**: Blank lines around headings

- **MD031**: Blank lines around fenced code blocks

- **MD032**: Blank lines around lists

- **MD040**: Language specification for code blocks

- **MD049**: Emphasis style consistency (asterisk over underscore)

## Testing Standards

### Test Execution Requirements

#### Primary Test Command

```bash

node tests/run-all.mjs

```javascript

**Benefits**: Cross-platform, BUILD_ONCE optimization, comprehensive coverage

#### Individual Test Suites

```bash

pnpm run test:unit        # Unit tests (54 tests)
pnpm run test:integration # Integration tests (26 tests)
pnpm run test:e2e        # End-to-end tests (2 tests)
pnpm run test:vitest     # Vitest tests
pnpm run test:vitest:render # Render tests (40 tests)
pnpm run test:db         # Database tests (70 tests)

```javascript

#### Test Coverage Requirements

- **Total Tests**: 192 tests

- **Pass Rate**: 100% (no failing tests in main branch)

- **Coverage Areas**: Unit, integration, database, render, E2E

### Test Hygiene Standards

#### Mandatory Rules

1. **Never hard-code tool paths**: Use `require.resolve("typescript/bin/tsc")`

1. **Keep CI output clean**: Use `{ stdio: "pipe", encoding: "utf8" }`

1. **Only tiny-runner emits "ok"**: Never add `console.log("ok")` in tests

1. **Use resilient assertions**: Filter meaningful content, avoid brittle counts

1. **Guard builds with BUILD_ONCE=1**: Skip rebuilds when artifacts exist

#### Anti-Patterns

```javascript

// ❌ Wrong: Hard-coded paths
spawnSync('npx', ['tsc', '-b'], options);

// ✅ Correct: Resolved paths
const tscBin = require.resolve('typescript/bin/tsc');
spawnSync('node', [tscBin, '-b'], options);

// ❌ Wrong: Misleading output
assert.equal(someFunction(), expectedValue);
console.log('UNIT(shared): ok'); // Always prints even if assert failed

// ✅ Correct: Let runner handle output
test('function works correctly', () => {
  assert.equal(someFunction(), expectedValue);
});
await run(); // Prints accurate results

```javascript

## Performance Standards

### Size Budgets (ENFORCED)

- **Base app**: ≤200KB gzipped

- **Logger package**: ≤8KB gzipped

- **Validation**: `pnpm run size:check` must pass

- **Environment variables**: `BUDGET*BASE*KB`, `BUDGET*LOGGER*KB`

### Build Performance

- **Incremental compilation**: TypeScript project references

- **BUILD_ONCE optimization**: Single build for multiple test runs

- **Clean builds**: Regular `pnpm run clean` to prevent stale artifacts

- **Workspace efficiency**: pnpm workspaces with proper linking

### Runtime Performance Targets

- **Desktop**: 60fps target

- **Mobile**: ≥40fps minimum

- **Cold start**: ≤2s

- **PWA installation**: <5s

## Documentation Quality

### Documentation Requirements

- **Location**: All documentation in `/docs/` folder

- **Cross-references**: Proper linking between documents

- **ADRs**: Architectural decisions documented

- **Runbooks**: Operational procedures documented

- **API documentation**: Code changes require doc updates

### Planning Document Standards

- **Temporary nature**: Delete after completion

- **Location**: `/docs/` folder (never root)

- **Structure**: Analysis, implementation plan, acceptance criteria

- **Approval required**: Get user confirmation before implementation

## CI/CD Quality Gates

### GitHub Actions Requirements

- **All workflows passing**: 6 workflows must be green

- **Pipeline-first debugging**: Trust CI logs over local tests

- **Systematic approach**: Fix one workflow at a time

- **Environment protection**: Proper branch protection rules

### Workflow Categories

1. **Checks**: ESLint, Prettier, TypeScript, Markdown

1. **CI**: Build, tests, quality gates

1. **Docs**: Documentation validation

1. **Pages Deploy**: GitHub Pages deployment

1. **Lighthouse**: Accessibility and performance

1. **E2E Smoke**: End-to-end testing

## Cross-Platform Compatibility

### Windows Considerations

- **No shell: true**: Causes path interpretation issues

- **Direct binary execution**: Use full paths to .CMD files

- **Path resolution**: Use Node.js path utilities

- **Environment variables**: Proper handling of Windows paths

### Platform Detection

```javascript

const isWindows = process.platform === 'win32';
const cmd = isWindows ? 'cmd' : 'npx';
const args = isWindows ? ['/c', 'node_modules\\.bin\\command.CMD'] : ['command'];

```text

## Quality Verification Checklist

### Before Committing

- [ ] TypeScript strict mode passes: `pnpm run test:ts-strict`

- [ ] ESLint passes: `pnpm run lint:quiet`

- [ ] Prettier formatting correct: `pnpm run format:check`

- [ ] All tests pass: `node tests/run-all.mjs`

- [ ] Documentation updated if needed

### Before Pushing

- [ ] Size budgets met: `pnpm run size:check`

- [ ] Workspace health good: `pnpm run ws:check`

- [ ] No merge conflicts

- [ ] Branch up to date with main

### Before PR Creation

- [ ] Full test suite passes: `pnpm run test:all`

- [ ] Documentation linting passes: `pnpm run docs:lint`

- [ ] All quality gates green

- [ ] User has approved pre-PR summary

This quality framework ensures consistent, high-quality code that meets all project
standards
and
performs
reliably
across
all
environments.
