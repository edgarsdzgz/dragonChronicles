# Draconia Chronicles v2.0.0

🐉 A shooter-idle game built with TypeScript, SvelteKit, and modern web technologies.

## Quick Start

```bash
# Clone and setup
git clone https://github.com/edgarsdzgz/dragonChronicles.git
cd dragonChronicles
pnpm install

# Build and test
pnpm run build
pnpm run test:all
```

**Expected output**: `ok - 2 passed` for each test suite.

## Development

### Project Structure
- `packages/` - Shared libraries (shared, logger, db, sim)
- `apps/` - Applications (sandbox CLI)
- `tests/` - Test suites with tiny-runner
- `docs/` - **Documentation hub** 📚

### Common Commands
```bash
pnpm run build          # Build all packages and apps
pnpm run test:all        # Run all tests (optimized)
pnpm run test:ts-strict  # TypeScript strict mode enforcement
pnpm run dev:sandbox     # Run sandbox app in dev mode
```

## Documentation

📚 **[Full Documentation](./docs/README.md)** - Complete documentation hub

### Key Resources
- **[Local Development](./docs/runbooks/local-dev.md)** - Setup guide from clone to tests
- **[Testing Strategy](./docs/engineering/testing.md)** - Test layers, execution, BUILD_ONCE optimization
- **[TypeScript Standards](./docs/engineering/typescript.md)** - Strict mode policy, examples, troubleshooting
- **[Architectural Decisions](./docs/adr/)** - Key technical decisions (ADRs)

### Quick Links
- [ADR-0001: Testing Strategy](./docs/adr/0001-testing-strategy.md)
- [ADR-0002: TypeScript Strict Gate](./docs/adr/0002-typescript-strict-gate.md)

## Technology Stack

- **Language**: TypeScript with strict mode enforcement
- **Framework**: SvelteKit for UI components  
- **Runtime**: Node.js 18.17+ with ES modules
- **Package Manager**: pnpm 9.0.0+ with workspace support
- **Testing**: Custom tiny-runner (migrating to Vitest/Playwright)
- **Build**: TypeScript project references with incremental compilation

## Contributing

All PRs require:
- ✅ Passing tests (`pnpm run test:all`)
- ✅ TypeScript strict mode compliance
- ✅ Documentation updates (see [PR template](./.github/pull_request_template.md))

See [Development Workflow](./docs/runbooks/local-dev.md#development-workflow) for detailed guidance.

## Architecture

**Monorepo Structure**: TypeScript packages with project references  
**Test Strategy**: Unit → Integration → E2E with BUILD_ONCE optimization  
**Type Safety**: Strict TypeScript enforcement with automated gates  
**Documentation**: Engineering standards with ADRs and runbooks

For technical details, see [Documentation Hub](./docs/README.md).

---

**Game Design**: See [Draconia Chronicles v2 GDD](./Draconia_Chronicles_v2_GDD.md)  
**Development**: See [Documentation](./docs/README.md) for engineering standards