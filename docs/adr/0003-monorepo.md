<!-- markdownlint-disable -->

# ADR 0003: Monorepo Structure

**Date**: 2025-09-06  
**Status**: Accepted

## Context

Draconia Chronicles v2.0.0 requires a scalable project structure that can accommodate multiple applications and shared libraries. The project needs to support:

- **Multiple Applications**: Web app (SvelteKit), CLI sandbox, and potential future apps
- **Shared Libraries**: Common utilities, game simulation, database layer, and logging
- **Type Safety**: Consistent TypeScript configuration across all packages
- **Build Optimization**: Incremental compilation and dependency management
- **Development Workflow**: Easy local development and testing across packages

The project started as a single application but quickly grew to require shared components for game simulation, persistence, and logging systems.

## Decision

Implement a **pnpm workspace-based monorepo** with TypeScript project references for optimal build performance and dependency management.

### Monorepo Structure

```
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
└── scripts/           # Development and build scripts
```

### Package Manager: pnpm

- **Workspace Support**: Native monorepo support with `pnpm-workspace.yaml`
- **Performance**: Faster installs and better disk usage than npm/yarn
- **Dependency Management**: Strict dependency resolution and hoisting control
- **Scripts**: Workspace-wide script execution with `pnpm -w run <script>`

### Build System: TypeScript Project References

- **Incremental Compilation**: Only rebuild changed packages and dependents
- **Dependency Graph**: TypeScript automatically manages build order
- **Type Checking**: Cross-package type safety and IntelliSense
- **Performance**: 3x faster builds with BUILD_ONCE optimization

### Package Configuration

Each package has its own `package.json` with:
- **Scoped Names**: `@draconia/shared`, `@draconia/logger`, etc.
- **TypeScript Config**: Extends base configuration
- **Build Scripts**: Individual package builds
- **Dependencies**: Explicit internal and external dependencies

## Consequences

### Positive

- **Code Reuse**: Shared libraries eliminate duplication across applications
- **Type Safety**: End-to-end TypeScript support with cross-package references
- **Build Performance**: Incremental compilation reduces build times significantly
- **Dependency Management**: Clear dependency boundaries and version management
- **Development Experience**: Single repository for all related code
- **Testing**: Shared test infrastructure and cross-package integration tests

### Negative

- **Complexity**: More complex setup and configuration than single-package projects
- **Learning Curve**: Developers need to understand monorepo patterns and pnpm
- **Tooling**: Requires specialized tooling for workspace management
- **CI/CD**: More complex build and deployment pipelines

### Operational Impact

- **Development Commands**:
  - `pnpm install` - Install all workspace dependencies
  - `pnpm -w run build` - Build all packages
  - `pnpm -w run test:all` - Run all tests across packages
  - `pnpm --filter @draconia/web run dev` - Run specific app

- **Package Dependencies**:
  - Internal packages use workspace protocol: `"@draconia/shared": "workspace:*"`
  - External dependencies managed at workspace root
  - Version consistency enforced across packages

- **Build Optimization**:
  - `BUILD_ONCE=1` environment variable for test optimization
  - TypeScript project references for incremental builds
  - Shared configuration in `configs/` directory

### Migration Path

The monorepo structure was established during W1 (Repo & Standards) and has proven successful through W5:

1. **W1**: Established monorepo structure with pnpm workspaces
2. **W2**: Added shared packages for common utilities
3. **W3**: Created simulation package with worker protocol
4. **W4**: Added database package with Dexie integration
5. **W5**: Added logging package with structured logging

### Future Considerations

- **Package Splitting**: May split large packages as they grow
- **Build Optimization**: Continue optimizing build performance
- **Tooling**: Consider additional monorepo tooling as complexity increases
- **Deployment**: May need specialized deployment strategies for different apps

## References

- [pnpm Workspaces Documentation](https://pnpm.io/workspaces)
- [TypeScript Project References](https://www.typescriptlang.org/docs/handbook/project-references.html)
- [Monorepo Best Practices](https://monorepo.tools/)
- [W1 Implementation](../engineering/development-workflow.md)
