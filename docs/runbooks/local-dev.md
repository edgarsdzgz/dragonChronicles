# Local Development Setup

This runbook covers setting up Draconia Chronicles v2.0.0 for local development, from initial clone to running tests.

## Prerequisites

- **Node.js**: 18.17+ (check with `node --version`)
- **pnpm**: 9.0.0+ (install with `npm install -g pnpm`)
- **Git**: For repository operations

## Quick Start (5 minutes)

```bash
# 1. Clone repository
git clone https://github.com/edgarsdzgz/dragonChronicles.git
cd dragonChronicles

# 2. Install dependencies
pnpm install

# 3. Build workspace
pnpm run build

# 4. Run tests
pnpm run test:all
```

**Expected output**: `ok - 2 passed` (for each test file)

## Detailed Setup

### 1. Repository Clone
```bash
git clone https://github.com/edgarsdzgz/dragonChronicles.git
cd dragonChronicles

# Verify you're on the correct branch
git branch --show-current
```

### 2. Dependency Installation
```bash
# Install all workspace dependencies
pnpm install

# Verify installation
pnpm list --depth=0
```

**Troubleshooting**:
- If `pnpm` not found: `npm install -g pnpm`
- If Node version mismatch: Use Node 18.17+

### 3. TypeScript Compilation
```bash
# Build all packages and apps
pnpm run build

# Verify artifacts exist
ls packages/*/dist
ls apps/*/dist
```

### 4. Test Execution
```bash
# Run all tests (optimized)
pnpm run test:all

# Run individual test suites
pnpm run test:unit          # Unit tests
pnpm run test:integration   # Integration tests  
pnpm run test:e2e          # End-to-end tests
pnpm run test:ts-strict    # TypeScript strict gate
```

## Workspace Structure

```
dragonChronicles/
├── packages/           # Shared libraries
│   ├── shared/        # Common utilities
│   ├── logger/        # Logging system
│   ├── db/           # Database layer
│   └── sim/          # Simulation engine
├── apps/              # Applications
│   └── sandbox/      # CLI testing app
├── tests/             # Test files
├── docs/              # Documentation
└── scripts/           # Build/utility scripts
```

## Development Workflow

### Making Changes

1. **Create feature branch**:
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** to packages or apps

3. **Build and test**:
   ```bash
   pnpm run build
   pnpm run test:all
   ```

4. **Commit changes**:
   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

### TypeScript Development

- **Strict mode**: All code must pass `pnpm run test:ts-strict`
- **Configuration**: Uses `tsconfig.base.json` with strict settings
- **Build**: Incremental compilation with project references

### Testing Changes

```bash
# Quick test during development
node tests/test-unit-shared.mjs

# Full test suite (optimized)
pnpm run test:all

# With verbose TypeScript output
node tests/test-ts-strict.mjs
```

## Package Scripts Reference

### Build Scripts
```bash
pnpm run build        # Build all packages and apps
pnpm run clean        # Clean all build artifacts
pnpm run typecheck    # Type checking without emit
```

### Test Scripts
```bash
pnpm run test:all          # All tests with BUILD_ONCE optimization
pnpm run test:unit         # Unit tests only
pnpm run test:integration  # Integration tests only
pnpm run test:e2e         # End-to-end tests only
pnpm run test:ts-strict   # TypeScript strict enforcement
```

### Development Scripts  
```bash
pnpm run dev:sandbox   # Run sandbox app in dev mode
pnpm run list         # List all workspace packages
```

## Common Issues and Solutions

### Build Failures

**Issue**: `tsc -b` fails with compilation errors
```bash
# Solution: Check specific package errors
pnpm run typecheck

# Clean and rebuild
pnpm run clean
pnpm run build
```

**Issue**: Missing `dist/` directories
```bash
# Solution: Ensure build completed successfully
pnpm run build
ls packages/*/dist  # Should show compiled output
```

### Test Failures

**Issue**: Tests report failures but errors aren't clear
```bash
# Solution: Run individual test files for detailed output
node tests/test-unit-shared.mjs
node tests/test-integration-graph.mjs
```

**Issue**: `BUILD_ONCE=1` not working
```bash
# Solution: Ensure you've built first
pnpm run build
BUILD_ONCE=1 node tests/test-unit-shared.mjs
```

### TypeScript Issues

**Issue**: Strict mode violations (TS7006, TS7031)
```bash
# Solution: Check specific errors
pnpm run test:ts-strict

# See TypeScript documentation for fixes
cat docs/engineering/typescript.md
```

**Issue**: Module resolution errors
- Check `tsconfig.base.json` has correct `moduleResolution: "NodeNext"`
- Ensure `package.json` has `"type": "module"` if needed

### IDE Setup

#### VS Code
1. Install TypeScript extension
2. Use workspace TypeScript version
3. Enable strict mode warnings
4. Configure auto-imports from `tsconfig.base.json`

#### Other IDEs
- Point to `tsconfig.base.json` for project configuration
- Enable TypeScript strict mode checking
- Configure import resolution for monorepo structure

## Performance Tips

### Faster Builds
```bash
# Use TypeScript build mode for incremental compilation
pnpm run build

# Skip builds during testing if artifacts are current
BUILD_ONCE=1 pnpm run test:unit
```

### Faster Tests
```bash
# Run specific test categories
pnpm run test:unit      # Fastest
pnpm run test:ts-strict # Fast (no runtime execution)
pnpm run test:e2e      # Slowest (full builds)
```

### Development Mode
```bash
# Watch mode for sandbox development
pnpm run dev:sandbox

# Monitor file changes and rebuild automatically
# (Future: Add watch scripts when needed)
```

## Documentation Integration

When making changes that affect:
- **Packages/Apps**: Update relevant documentation in `/docs`
- **Tests**: Update `/docs/engineering/testing.md`
- **TypeScript**: Update `/docs/engineering/typescript.md`
- **Architectural decisions**: Add ADR in `/docs/adr/`

See [Documentation Standards](../README.md) for detailed guidance.

## Getting Help

- **Documentation**: Check `/docs` directory first
- **Issues**: Review project GitHub issues
- **ADRs**: Check `/docs/adr/` for architectural decisions
- **Team**: Contact development team for complex setup issues

## Next Steps

After completing setup:
1. Review [Testing Strategy](../engineering/testing.md)
2. Read [TypeScript Standards](../engineering/typescript.md)  
3. Check [Architectural Decision Records](../adr/)
4. Start with small changes to familiarize yourself with the workflow