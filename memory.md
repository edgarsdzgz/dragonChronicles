# Draconia Chronicles - AI Memory System

**Purpose**: File-based memory system for AI assistant to maintain context and important information
across sessions

**Last Updated**: 2025-09-06
**Version**: 1.0.0

---

## 🧠 **Memory Categories**

### **Project Context**

- **Project Name**: Draconia Chronicles

- **Type**: Browser-based offline idle game

- **Tech Stack**: TypeScript, SvelteKit, PixiJS, Web Workers, Dexie (IndexedDB), Workbox PWA

- **Platform**: Desktop browsers, mobile browsers, installable PWA

- **Current Phase**: Phase 0 Foundation in Progress (Shooter-Idle focus)

### **Current Development Status**

Branch: feat/w8-dev-ux-docs, W8 Phase 1: Feature flags system completed and PR #34 created, Pipeline
validation
in
progress

### **Key Technical Decisions**

- **Offline-first PWA architecture** - No compromise on browser-based design

- **TypeScript strict mode** - 100% strict compliance required

- **Performance targets** - 60fps desktop, ≥40fps mobile

- **Monorepo structure** - PNPM workspaces with clear package separation

---

## 🎯 **Current Session Context**

### **Active Issues**

1. **CI/CD Pipeline Debugging**

    - PNPM hoisting issues resolved

    - GitHub Pages environment protection rules fixed

    - Playwright configuration still failing

    - Markdown linting violations resolved

1. **Steam Distribution Research**

    - Confirmed: Browser-based game can be published on Steam

    - Solution: Electron wrapper with Steamworks.js

    - No compromise to original browser-based design

    - Dual distribution strategy: Steam + direct browser

1. **Debugging Chronicles System**

    - Created comprehensive documentation system

    - Real-time debugging session capture

    - Searchable knowledge base for community

    - Template and index system established

### **Recent Discoveries**

- **Steam Overlay Compatibility**: Enhanced Electron configuration with command-line switches

- **Memory Tool Issue**: Cursor 1.5.11 on Linux missing memory tools

- **Alternative Solutions**: File-based memory system, MCP configuration

- **Community Value**: Debugging chronicles will help other developers

---

## 📚 **Knowledge Base**

### **Steam Integration Research**

- **Electron + Steamworks.js**: Modern, well-maintained solution

- **Command-line switches**: `--in-process-gpu`, `--disable-direct-composition`

- **Canvas workaround**: Transparent canvas for overlay rendering

- **Dual distribution**: Steam version + browser version from same codebase

### **CI/CD Solutions**

- **PNPM hoisting**: `pnpm -w install --config.node-linker=hoisted`

- **GitHub Pages**: Environment protection rules configuration

- **Playwright**: Project configuration issues in CI

- **Markdown linting**: MD051, MD024, MD013, MD022, MD031, MD032 violations

### **Performance Optimization**

- **8-phase optimization framework** implemented

- **Bundle size limits**: Base app ≤200KB gz, Logger ≤8KB gz

- **Performance budgets**: Cold start ≤2s, PWA installation <5s

- **Circular buffer logging**: 2MB cap, 10k entries max

---

## 🔧 **Technical Environment**

### **Development Setup**

- **OS**: Linux 6.8.0-65-generic

- **Node**: 20.19.1

- **PNPM**: 9.15.9

- **Cursor**: 1.5.11 (memory tool missing)

- **Git**: Feature branch workflow

### **Project Structure**

````text

dragonChronicles/
├── apps/
│   ├── web/          # Main SvelteKit app
│   └── sandbox/      # Development sandbox
├── packages/
│   ├── db/           # Database layer
│   ├── logger/       # Logging system
│   ├── shared/       # Shared utilities
│   └── sim/          # Game simulation
├── docs/             # Documentation
└── scripts/          # Automation scripts

```text

### **Key Files**

- `Draconia*Chronicles*v2_GDD.md` - Game Design Document

- `CLAUDE.md` - AI context and rules

- `docs/engineering/` - Technical documentation

- `docs/optimization/` - Performance optimization docs

---

## 🚀 **Future Plans**

### **Immediate (Next Session)**

1. Complete CI/CD pipeline fixes

1. Test Steam integration approach

1. Continue optimization phases

1. Document debugging sessions

### **Short Term**

1. Implement Electron wrapper for Steam

1. Complete optimization framework

1. Performance testing and validation

1. Community documentation publishing

### **Long Term**

1. Steam distribution launch

1. Browser distribution launch

1. Community feedback integration

1. Feature expansion based on user feedback

---

## 📝 **Session Notes**

### **Current Session (2025-01-15)**

- **Focus**: Memory system creation, Steam research, debugging documentation

- **Key Outcomes**:

  - Confirmed Steam distribution feasibility

  - Created debugging chronicles system

  - Identified memory tool issue and solution

- **Next Actions**: Test file-based memory system, continue CI/CD fixes

W8 Implementation: Started comprehensive feature flags system with typed interface, query parsing,
and enhanced HUD display. Created flags/flags.ts, flags/store.ts, flags/query.ts. Updated layout
files to use new system. Removed old flags.ts. Need to fix logger package build issue.### **Previous
Sessions**

- **CI/CD Debugging**: Resolved PNPM hoisting, GitHub Pages, markdown linting

- **Optimization Journey**: Implemented 8-phase framework, performance budgets

- **Steam Research**: Confirmed Electron wrapper approach, dual distribution strategy

---

## 🔍 **Search Keywords**

**For AI Assistant Reference:**

- Draconia Chronicles, browser game, idle shooter

- SvelteKit, PixiJS, Web Workers, IndexedDB, PWA

- Steam distribution, Electron wrapper, Steamworks.js

- CI/CD, PNPM, GitHub Actions, Playwright

- Performance optimization, bundle size, TypeScript strict

- Debugging chronicles, documentation, community knowledge

**Technical Terms:**

- Monorepo, workspace, package manager

- WebGL, Canvas, Service Worker, Workbox

- MCP, Model Context Protocol, memory tools

- AppImage, Linux, Cursor IDE

---

**Note**: This memory system is maintained by the AI assistant and updated throughout sessions to
maintain context and knowledge continuity.

### **W8 Phase 1 Complete (2025-01-15)**

Successfully implemented comprehensive feature flags system: Created typed AppFlags
interface, reactive Svelte stores, query string utilities, enhanced HUD display.
Fixed logger package build issues, updated all test references.
All render tests passing, build successful.
Created PR #34 for pipeline validation.

### **Script Consolidation (2025-01-15)**

COMPLETED: Created universal markdown fixer script (fix-markdown-universal.py) that
combines all functionality from redundant scripts.
File-agnostic, comprehensive, handles all markdownlint violations.
Deleted 18 redundant scripts, keeping only the universal one.
Script tested and working perfectly.

### **Pipeline Debugging Strategy (2025-01-15)**

CRITICAL PIPELINE DEBUGGING RULE: When pipeline is failing, work on ONE workflow at a
time.
Use knowledge and internet research to find resolution path.
Only move to next workflow when current one reaches 100% success.
Exception: If workflow has cascading issues that prevent other workflows from ever
succeeding, prioritize the cascading workflow first.
This ensures systematic resolution and prevents scattered fixes.

````

### **W8 Phase 1 Pipeline Debugging (2025-01-15)**

COMPLETED: Successfully applied systematic pipeline debugging strategy..
Fixed ALL workflows to 100% success: checks (Prettier + Vitest config), CI, docs (MD049 emphasis),
Pages Deploy (environment protection), Lighthouse, E2E.
Pipeline now 100% healthy.
Key learning: Work on ONE workflow at a time until 100% success, using knowledge and
internet research for resolution paths.
