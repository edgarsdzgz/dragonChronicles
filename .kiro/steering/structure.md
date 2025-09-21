# Project Structure & Organization

## Monorepo Layout

````bash

dragonChronicles/
├── packages/              # Shared libraries
│   ├── shared/           # Common utilities and types
│   ├── logger/           # Structured logging system
│   ├── db/              # Database persistence layer
│   ├── sim/             # Game simulation engine
│   └── engine/          # Core game engine
├── apps/                # Applications
│   ├── web/             # SvelteKit web application
│   └── sandbox/         # Development CLI tool
├── tests/               # Test suites and utilities
├── docs/                # Documentation hub
├── scripts/             # Automation and utility scripts
└── configs/             # Shared configuration files

```text

## Package Architecture

### Core Packages (`packages/`)

#### `@draconia/shared`

- **Purpose**: Common utilities, types, and constants

- **Exports**: Base types, utility functions, shared constants

- **Dependencies**: None (foundation package)

#### `@draconia/logger`

- **Purpose**: Structured logging with ring buffer and PII redaction

- **Exports**: Logger interface, log sinks, performance monitoring

- **Dependencies**: `@draconia/shared`

#### `@draconia/db`

- **Purpose**: Database persistence with Dexie and Zod validation

- **Exports**: Database schema, atomic operations, migration system

- **Dependencies**: `@draconia/shared`, `dexie`, `zod`

#### `@draconia/sim`

- **Purpose**: Game simulation engine for Web Workers

- **Exports**: Simulation logic, worker protocol, game state

- **Dependencies**: `@draconia/shared`, `@draconia/logger`

#### `@draconia/engine`

- **Purpose**: Core game engine and mechanics

- **Exports**: Game systems, entity management, physics

- **Dependencies**: `@draconia/shared`

### Applications (`apps/`)

#### `@draconia/web`

- **Purpose**: Main SvelteKit web application

- **Technology**: SvelteKit, PixiJS, TypeScript

- **Features**: PWA, offline support, responsive design

- **Dependencies**: All packages

#### `@draconia/sandbox`

- **Purpose**: Development CLI tool for testing

- **Technology**: Node.js CLI application

- **Features**: Database testing, simulation debugging

- **Dependencies**: Core packages (shared, logger, db, sim)

## Configuration Structure

### Shared Configs (`configs/`)

- `eslint/` - ESLint configuration

- `prettier/` - Prettier configuration

- `vitest/` - Vitest test configuration

- `playwright.config.ts` - E2E test configuration

### Root Configuration Files

- `tsconfig.base.json` - Base TypeScript configuration

- `tsconfig.json` - Root project references

- `pnpm-workspace.yaml` - Workspace package definitions

- `eslint.config.mjs` - ESLint 9 flat configuration

## Documentation Organization (`docs/`)

### Structure

```text

docs/
├── README.md              # Documentation hub
├── adr/                   # Architectural Decision Records
├── engineering/           # Development standards and guides
├── overview/              # Project status and summaries
├── runbooks/              # Operational procedures
└── optimization/          # Performance optimization guides

```javascript

### Key Documents

- **ADRs**: Technical decisions with rationale

- **Engineering**: Development practices, testing, TypeScript standards

- **Runbooks**: Setup guides, CI/CD procedures

- **Overview**: Project status, changelog, phase completion

## Testing Structure (`tests/`)

### Test Organization

```javascript

tests/
├── db/                    # Database tests
├── e2e/                   # End-to-end tests
├── integration/           # Integration tests
├── render/                # Render tests
├── fixtures/              # Test data and mocks
├── utils/                 # Test utilities
└── _tiny-runner.mjs       # Custom test runner

```javascript

### Test Types

- **Unit Tests**: Individual function/component testing

- **Integration Tests**: Package interaction testing

- **Database Tests**: Persistence and migration testing

- **Render Tests**: UI component and graphics testing

- **E2E Tests**: Full application workflow testing

## Scripts & Automation (`scripts/`)

### Categories

- **Build Scripts**: Compilation and bundling utilities

- **Test Scripts**: Test execution and validation

- **Maintenance Scripts**: Cleanup and optimization

- **Development Scripts**: Developer experience tools

### Key Scripts

- `fix-markdown-universal.py` - Markdown linting fixes

- `memory-manager.py` - AI memory system management

- `size-budgets.mjs` - Bundle size monitoring

- `verify-implementation.sh` - Implementation validation

## Development Workflow

### Branch Strategy

- **Main Branch**: `main` - production-ready code

- **Feature Branches**: `feat/wX-description` for workpacks

- **Planning**: Create `WXPlan.md` for each workpack

- **Cleanup**: Delete feature branches and planning docs after merge

### File Naming Conventions

- **Packages**: kebab-case directory names

- **TypeScript**: PascalCase for classes, camelCase for functions

- **Components**: PascalCase for Svelte components

- **Tests**: `*.test.ts` or `*.spec.ts` suffixes

### Import Patterns

```typescript

// Internal package imports
import { Logger } from '@draconia/logger';
import { Database } from '@draconia/db';

// Relative imports within package
import { utils } from './utils.js';
import type { GameState } from '../types/index.js';

```text

## Quality Gates

### Code Quality

- **TypeScript Strict**: All packages use strict mode

- **ESLint**: Zero errors policy

- **Prettier**: Consistent formatting

- **Tests**: 100% pass rate required

### Documentation Standards

- **All docs in `/docs`**: No root-level documentation

- **Markdown Linting**: 100% compliance required

- **ADRs**: Document all architectural decisions

- **Planning Docs**: Temporary, delete after completion

### Performance Requirements

- **Bundle Size**: Strict size budgets

- **Test Speed**: Unit tests under 1s

- **Build Time**: Incremental compilation

- **Runtime**: 60fps desktop, 40fps mobile target

## Dependency Management

### Workspace Dependencies

- Use `workspace:*` for internal packages

- Pin external dependencies to specific versions

- Regular dependency audits and updates

### Package Boundaries

- **No Circular Dependencies**: Enforce acyclic dependency graph

- **Clear Interfaces**: Well-defined package APIs

- **Minimal Coupling**: Packages should be loosely coupled
````
