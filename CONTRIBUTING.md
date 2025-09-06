# Contributing to Draconia Chronicles

Welcome to Draconia Chronicles! This guide will help you get up and running in under 10 minutes.

## 🚀 Quick Start (10 Minutes)

### Prerequisites

- **Node.js**: 18.17+ ([Download](https://nodejs.org/))
- **pnpm**: 9.0.0+ (`npm install -g pnpm`)
- **Git**: Latest version

### 1. Clone and Setup (2 minutes)

```bash
# Clone the repository
git clone https://github.com/edgarsdzgz/dragonChronicles.git
cd dragonChronicles

# Install dependencies
pnpm install
```

### 2. Verify Installation (3 minutes)

```bash
# Run the test suite to verify everything works
node tests/run-all.mjs
```

**Expected output**: `ok - 2 passed` for each test suite.

### 3. Start Development (2 minutes)

```bash
# Start the web application
pnpm --filter @draconia/web run dev
```

Visit `http://localhost:5173` to see the app running!

### 4. Run Tests (3 minutes)

```bash
# Run all tests
pnpm run test:all

# Or run specific test types
pnpm run test:unit        # Unit tests
pnpm run test:integration # Integration tests
pnpm run test:e2e         # End-to-end tests
```

## 📋 Development Workflow

### Project Structure

```text
dragonChronicles/
├── packages/           # Shared libraries
│   ├── shared/        # Common utilities, constants, protocol v1, RNG
│   ├── logger/        # Structured logging system
│   ├── db/           # Database layer (IndexedDB/Dexie)
│   └── sim/          # Game simulation engine
├── apps/              # Applications
│   ├── web/          # SvelteKit web app with PixiJS renderer
│   └── sandbox/      # CLI testing and contracts
├── tests/             # Test infrastructure
├── configs/           # Shared configuration files
├── scripts/           # Development and build scripts
└── docs/              # Documentation hub
```

### Essential Commands

#### **Build & Development**

```bash
# Build all packages and apps
pnpm run build

# Build with CI optimizations
pnpm run build:ci

# Type checking only
pnpm run typecheck

# Clean build artifacts
pnpm run clean
```

#### **Testing**

```bash
# Run all tests (recommended)
pnpm run test:all

# Individual test suites
pnpm run test:unit        # Unit tests
pnpm run test:integration # Integration tests
pnpm run test:e2e         # End-to-end tests
pnpm run test:ts-strict   # TypeScript strict mode gate

# Database tests
pnpm run test:db

# Vitest tests
pnpm run test:vitest
pnpm run test:vitest:render
```

#### **Code Quality**

```bash
# Linting
pnpm run lint            # ESLint with auto-fix
pnpm run lint:quiet      # ESLint without warnings

# Formatting
pnpm run format          # Prettier with auto-fix
pnpm run format:check    # Prettier check only

# Combined quality checks
pnpm run verify:style    # Lint + format check
pnpm run verify:all      # All quality checks
```

#### **Documentation**

```bash
# Markdown linting
pnpm run docs:lint

# Link checking
pnpm run docs:links

# Documentation validation
pnpm run docs:check
```

#### **Database Operations**

```bash
# Clear database for testing
pnpm run db:nuke

# Seed database with sample data
pnpm run db:seed
```

#### **Performance & Analysis**

```bash
# Size budget validation
pnpm run size:check

# Bundle analysis
pnpm run bundle:analyze

# Performance monitoring
pnpm run performance:monitor
```

## 🎛️ Feature Flags

Draconia Chronicles uses a comprehensive feature flag system for development and testing.

### Flag Types

| Flag             | Type    | Description                                  | Default |
| ---------------- | ------- | -------------------------------------------- | ------- |
| `hud`            | boolean | Show development HUD overlay                 | `false` |
| `devMenu`        | boolean | Show developer navigation menu               | `false` |
| `logConsole`     | boolean | Enable console logging sink (dev override)   | `false` |
| `useLegacyBgSim` | boolean | Use legacy in-page background simulation     | `false` |
| `forceMode`      | string  | Force simulation mode: `fg`, `bg`, or `auto` | `auto`  |

### Using Feature Flags

#### **Query String Parameters (Development Only)**

```bash
# Enable HUD and dev menu
http://localhost:5173/?hud=1&dev=1

# Force background simulation mode
http://localhost:5173/?mode=bg

# Enable all dev features
http://localhost:5173/?hud=1&dev=1&logConsole=1&legacyBg=1&mode=fg
```

#### **Environment Variables (Build Time)**

```bash
# Set environment variables
export VITE_HUD_ENABLED=true
export VITE_DEV_MENU_ENABLED=true
export VITE_LOG_CONSOLE=true
export VITE_LEGACY_BG_SIM=true
export VITE_FORCE_MODE=fg

# Then run the app
pnpm --filter @draconia/web run dev
```

### Flag Precedence

1. **Query String** (highest priority)
2. **Environment Variables**
3. **Default Values** (lowest priority)

## 📝 Conventional Commits

We use [Conventional Commits](https://www.conventionalcommits.org/) for consistent commit messages.

### Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types

- **feat**: New feature
- **fix**: Bug fix
- **docs**: Documentation changes
- **style**: Code style changes (formatting, etc.)
- **refactor**: Code refactoring
- **test**: Adding or updating tests
- **chore**: Maintenance tasks
- **perf**: Performance improvements
- **ci**: CI/CD changes
- **build**: Build system changes

### Examples

```bash
# New feature
git commit -m "feat: add error boundary with log export"

# Bug fix
git commit -m "fix: resolve ESLint errors in DevMenu component"

# Documentation
git commit -m "docs: update CONTRIBUTING.md with feature flags"

# Breaking change
git commit -m "feat!: redesign API interface

BREAKING CHANGE: The API interface has been completely redesigned"
```

### Commit Validation

All commits are automatically validated using commitlint. Invalid commit messages will be rejected.

## 🐛 Troubleshooting

### Common Issues

#### **Build Failures**

```bash
# Clean and rebuild
pnpm run clean
pnpm run build:ci

# Check TypeScript configuration
pnpm run test:ts:all
```

#### **Test Failures**

```bash
# Run individual test suites to isolate issues
pnpm run test:unit
pnpm run test:integration
pnpm run test:e2e

# Check test configuration
pnpm run test:ts-strict
```

#### **Linting Errors**

```bash
# Auto-fix linting issues
pnpm run lint

# Check specific files
npx eslint apps/web/src/lib/ui/DevMenu.svelte --fix
```

#### **Formatting Issues**

```bash
# Auto-fix formatting
pnpm run format

# Check specific files
npx prettier apps/web/src/lib/ui/DevMenu.svelte --write
```

#### **Database Issues**

```bash
# Clear and reset database
pnpm run db:nuke
pnpm run db:seed

# Check database tests
pnpm run test:db
```

#### **Package Installation Issues**

```bash
# Clear pnpm cache
pnpm store prune

# Reinstall dependencies
rm -rf node_modules
pnpm install
```

#### **TypeScript Issues**

```bash
# Check TypeScript configuration
pnpm run test:ts:audit

# Verify workspace integrity
pnpm run workspace:check
```

### Performance Issues

#### **Slow Builds**

```bash
# Use build-once optimization for tests
BUILD_ONCE=1 node tests/run-all.mjs

# Check bundle size
pnpm run size:check
pnpm run bundle:analyze
```

#### **Memory Issues**

```bash
# Monitor memory usage
pnpm run performance:monitor

# Check for memory leaks
pnpm run test:db
```

### Getting Help

1. **Check the logs**: Most issues have detailed error messages
2. **Run diagnostics**: Use the health check commands
3. **Check documentation**: See [docs/README.md](./docs/README.md)
4. **Review ADRs**: See [docs/adr/](./docs/adr/) for architectural decisions

### Health Check Commands

```bash
# Full health check
pnpm run health:full

# Workspace integrity
pnpm run workspace:health

# Build verification
pnpm run build:verify
```

## 🧪 Testing Strategy

### Test Layers

1. **Unit Tests**: Individual functions and utilities
2. **Integration Tests**: Cross-package interactions
3. **End-to-End Tests**: Full application workflows
4. **TypeScript Strict Gate**: Type safety enforcement

### Running Tests

```bash
# All tests (recommended)
pnpm run test:all

# Specific test types
pnpm run test:unit        # Unit tests
pnpm run test:integration # Integration tests
pnpm run test:e2e         # End-to-end tests
pnpm run test:db          # Database tests
```

### Test Optimization

The project uses `BUILD_ONCE=1` optimization to reduce build times during testing:

```bash
# Automatic optimization
node tests/run-all.mjs

# Manual optimization
BUILD_ONCE=1 pnpm run test:unit
```

## 📚 Additional Resources

### Documentation

- **[Documentation Hub](./docs/README.md)** - Complete documentation index
- **[Local Development Guide](./docs/runbooks/local-dev.md)** - Detailed setup guide
- **[Testing Strategy](./docs/engineering/testing.md)** - Comprehensive testing guide
- **[TypeScript Standards](./docs/engineering/typescript.md)** - Type safety guidelines
- **[Architectural Decisions](./docs/adr/)** - ADRs for key technical decisions

### Key Files

- **[Game Design Document](./Draconia_Chronicles_v2_GDD.md)** - Complete game design
- **[Package.json](./package.json)** - All available scripts
- **[TypeScript Config](./tsconfig.json)** - TypeScript configuration
- **[ESLint Config](./configs/eslint/)** - Linting rules
- **[Prettier Config](./configs/prettier/)** - Formatting rules

### External Resources

- **[SvelteKit Documentation](https://kit.svelte.dev/)**
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)**
- **[pnpm Documentation](https://pnpm.io/)**
- **[Conventional Commits](https://www.conventionalcommits.org/)**

## 🤝 Contributing Guidelines

### Before You Start

1. **Read the documentation**: Familiarize yourself with the project structure
2. **Run the tests**: Ensure everything works on your machine
3. **Check existing issues**: Look for similar work or discussions
4. **Follow the workflow**: Use feature branches and conventional commits

### Pull Request Process

1. **Create a feature branch**: `git checkout -b feat/your-feature`
2. **Make your changes**: Follow the coding standards
3. **Run quality checks**: `pnpm run verify:all`
4. **Update documentation**: Include relevant documentation updates
5. **Submit PR**: Use the [PR template](./.github/pull_request_template.md)

### Code Standards

- **TypeScript**: Strict mode compliance required
- **Testing**: All new code must include tests
- **Documentation**: Update relevant documentation
- **Commits**: Use conventional commit format
- **Linting**: All code must pass ESLint and Prettier

### Review Process

- **Automated checks**: All CI/CD checks must pass
- **Code review**: At least one approval required
- **Documentation**: Ensure documentation is updated
- **Testing**: Verify all tests pass

---

**Welcome to the Draconia Chronicles development team!** 🐉

For questions or support, please refer to the documentation or create an issue on GitHub.
