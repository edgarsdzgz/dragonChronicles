# Technology Stack & Build System

## Core Technologies

### Frontend Stack

- **Framework**: SvelteKit (static adapter for PWA)

- **Language**: TypeScript with strict mode enforcement

- **Graphics**: PixiJS for WebGL/WebGPU rendering

- **Styling**: CSS with Svelte component styles

### Backend/Data Layer

- **Runtime**: Web Workers for background simulation

- **Database**: Dexie (IndexedDB wrapper) with Zod validation

- **Persistence**: Atomic operations, export/import, migration system

- **Logging**: Structured logging with ring buffer and PII redaction

### Build System

- **Package Manager**: pnpm 9.15.9+ with workspaces

- **Build Tool**: Vite with TypeScript project references

- **Bundler**: Rollup (via Vite) with tree-shaking optimization

- **TypeScript**: Composite builds with incremental compilation

## Development Tools

### Code Quality

- **Linting**: ESLint 9 flat config (JS + TypeScript + Svelte)

- **Formatting**: Prettier with Svelte plugin

- **Type Checking**: TypeScript strict mode with exactOptionalPropertyTypes

- **Git Hooks**: Husky v9+ with commitlint and lint-staged

### Testing Framework

- **Unit/Integration**: Vitest with jsdom and fake-indexeddb

- **E2E**: Playwright for browser testing

- **Custom Runner**: tiny-runner for Node.js tests

- **Coverage**: 192 tests total (100% pass rate required)

### CI/CD Pipeline

- **Platform**: GitHub Actions

- **Workflows**: 6 workflows (checks, CI, docs, pages, lighthouse, e2e)

- **Quality Gates**: ESLint, Prettier, TypeScript, markdown linting

- **Performance**: Lighthouse CI with accessibility checks

## Common Commands

### Development

````bash

# Setup

pnpm install

# Development servers

pnpm run dev:web          # SvelteKit web app
pnpm run dev:sandbox      # CLI sandbox app

# Build

pnpm run build           # Build all packages
pnpm run build:ci        # Force rebuild for CI

```bash

### Testing

```bash

# Run all tests (recommended)

pnpm run test:all        # Comprehensive test suite

# Individual test suites

pnpm run test:vitest     # Unit/integration tests
pnpm run test:vitest:render  # Render tests
pnpm run test:e2e        # End-to-end tests
pnpm run test:db         # Database tests

```bash

### Code Quality (2)

```bash

# Linting and formatting

pnpm run lint            # ESLint check
pnpm run lint:quiet      # ESLint without warnings
pnpm run format          # Prettier format
pnpm run format:check    # Check formatting

# Type checking

pnpm run typecheck       # TypeScript validation
pnpm run test:ts-strict  # Strict mode enforcement

```bash

### Documentation

```bash

# Documentation checks

pnpm run docs:lint       # Markdown linting
pnpm run docs:links      # Link validation

```bash

### Workspace Management

```bash

# Workspace operations

pnpm run clean           # Clean build artifacts
pnpm run ws:check        # Workspace integrity
pnpm -w list --depth -1  # List workspace packages

```text

## Architecture Patterns

### Monorepo Structure

- **TypeScript Project References**: Incremental compilation

- **Workspace Dependencies**: `workspace:*` for internal packages

- **Path Mapping**: `@draconia/*` aliases for clean imports

### Module System

- **ES Modules**: `"type": "module"` throughout

- **Node.js**: NodeNext module resolution

- **Exports**: Proper package.json exports fields

### Performance Optimization

- **Tree Shaking**: `"sideEffects": false` in packages

- **Code Splitting**: Dynamic imports for large features

- **Bundle Analysis**: Size budgets and monitoring

## Configuration Files

### Core Config

- `tsconfig.base.json` - Base TypeScript configuration

- `pnpm-workspace.yaml` - Workspace package definitions

- `eslint.config.mjs` - ESLint 9 flat configuration

- `.prettierrc.cjs` - Prettier formatting rules

### Build Config

- `vite.config.js` - Vite build configuration (per app)

- `svelte.config.js` - SvelteKit configuration

- `playwright.config.ts` - E2E test configuration

- `vitest.config.ts` - Unit test configuration

## Development Standards

### TypeScript Requirements

- **Strict Mode**: All packages use strict TypeScript

- **No Implicit Any**: `noImplicitAny: true`

- **Exact Optional Properties**: `exactOptionalPropertyTypes: true`

- **No Unchecked Indexed Access**: `noUncheckedIndexedAccess: true`

### Code Style

- **ESLint**: Zero errors policy

- **Prettier**: Consistent formatting

- **Import Order**: Organized imports with proper grouping

- **Naming**: Consistent naming conventions

### Testing Requirements

- **100% Pass Rate**: All tests must pass

- **Cross-Platform**: Tests work on Windows/Unix

- **Deterministic**: No flaky tests

- **Fast Feedback**: Unit tests under 1s

## PWA Configuration

### Service Worker

- **Workbox**: Precaching and runtime caching

- **Offline Support**: Core functionality works offline

- **Update Strategy**: Prompt user for updates

### Manifest

- **Icons**: Multiple sizes for different devices

- **Theme**: Consistent branding

- **Display**: Standalone app experience
````
