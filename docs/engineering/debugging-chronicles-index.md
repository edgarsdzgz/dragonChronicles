# Debugging Chronicles Index

**Purpose**: Central index of all debugging sessions for easy discovery and knowledge sharing

## 📚 Chronicles Overview

This index contains real-world debugging sessions from the Draconia Chronicles project, documenting
problems encountered and the systematic approaches used to resolve them. Each entry follows a
structured format to maximize searchability and learning value.

## 🏷️ Quick Reference

### **By Category**

- [CI/CD Issues](#cicd-issues)
- [Build System Problems](#build-system-problems)
- [Dependency Issues](#dependency-issues)
- [Performance Debugging](#performance-debugging)
- [Browser Compatibility](#browser-compatibility)
- [Database/Persistence](#databasepersistence)
- [PWA/Service Worker](#pwaservice-worker)
- [TypeScript Issues](#typescript-issues)
- [Testing Problems](#testing-problems)
- [Deployment Issues](#deployment-issues)

### **By Technology**

- [SvelteKit](#sveltekit)
- [PixiJS](#pixijs)
- [Dexie/IndexedDB](#dexieindexeddb)
- [Workbox](#workbox)
- [PNPM](#pnpm)
- [GitHub Actions](#github-actions)
- [Electron](#electron)
- [Steam Integration](#steam-integration)

### **By Complexity**

- [Beginner](#beginner)
- [Intermediate](#intermediate)
- [Advanced](#advanced)
- [Expert](#expert)

---

## 📋 Complete Chronicles List

### **DC-2025-01-15-001**: PNPM Hoisting Issues in CI/CD Pipeline

- **Date**: 2025-01-15
- **Category**: `ci-cd`, `dependencies`, `pnpm`
- **Complexity**: `intermediate`
- **Status**: ✅ Resolved
- **File**: [debugging-chronicles-001-pnpm-hoisting.md](./debugging-chronicles-001-pnpm-hoisting.md)
- **Summary**: PNPM hoisting configuration causing module resolution failures in GitHub Actions

### **DC-2025-01-15-002**: GitHub Pages Environment Protection Rules

- **Date**: 2025-01-15
- **Category**: `deployment`, `github-actions`
- **Complexity**: `beginner`
- **Status**: ✅ Resolved
- **File**: [debugging-chronicles-002-github-pages.md](./debugging-chronicles-002-github-pages.md)
- **Summary**: GitHub Pages deployment failing due to environment protection rules

### **DC-2025-01-15-003**: Playwright Configuration in CI

- **Date**: 2025-01-15
- **Category**: `testing`, `ci-cd`, `playwright`
- **Complexity**: `intermediate`
- **Status**: 🔄 In Progress
- **File**: [debugging-chronicles-003-playwright-ci.md](./debugging-chronicles-003-playwright-ci.md)
- **Summary**: Playwright "Project(s) 'chromium' not found" error in GitHub Actions

### **DC-2025-01-15-004**: Markdown Linting Violations

- **Date**: 2025-01-15
- **Category**: `build`, `markdownlint`
- **Complexity**: `beginner`
- **Status**: ✅ Resolved
- **File**: [debugging-chronicles-004-markdownlint.md](./debugging-chronicles-004-markdownlint.md)
- **Summary**: Multiple markdownlint violations (MD051, MD024, MD013, MD022, MD031, MD032)

### **DC-2025-01-15-005**: Prettier Formatting Issues

- **Date**: 2025-01-15
- **Category**: `build`, `prettier`
- **Complexity**: `beginner`
- **Status**: ✅ Resolved
- **File**: [debugging-chronicles-005-prettier.md](./debugging-chronicles-005-prettier.md)
- **Summary**: Prettier formatting inconsistencies in CLAUDE.md

### **DC-2025-09-06-006**: SvelteKit Build Directory Mismatch and Invalid Preload Configuration

- **Date**: 2025-09-06
- **Category**: `ci-cd`, `build`, `sveltekit`
- **Complexity**: `intermediate`
- **Status**: ✅ Resolved
- **File**:

[debugging-chronicles-006-sveltekit-build-directory-mismatch.md](./debugging-chronicles-006-sveltekit-build-directory-mismatch.md)

- **Summary**: vite preview expecting dist but SvelteKit creating build directory, plus invalid

preload config

### **DC-2025-09-06-007**: Playwright E2E Tests with SvelteKit Preload Data Visibility Issues

- **Date**: 2025-09-06
- **Category**: `testing`, `e2e`, `sveltekit`, `playwright`
- **Complexity**: `intermediate`
- **Status**: ✅ Resolved
- **File**:

[debugging-chronicles-007-playwright-sveltekit-timing-issues.md](./debugging-chronicles-007-playwright-sveltekit-timing-issues.md)

- **Summary**: body element hidden during SvelteKit hydration, causing Playwright test failures

### **DC-2025-09-06-008**: GitHub Pages PR Comment Permission Issues

- **Date**: 2025-09-06
- **Category**: `ci-cd`, `deployment`, `permissions`, `pr-automation`
- **Complexity**: `beginner`
- **Status**: ✅ Resolved
- **File**:

[debugging-chronicles-008-github-pages-pr-comment-permissions.md](./debugging-chronicles-008-github-pages-pr-comment-permissions.md)

- **Summary**: GitHub Pages workflow failing with "Resource not accessible by integration" error for

PR comments

### **DC-2025-09-06-009**: E2E SvelteKit Preload Visibility Issues (FINAL RESOLUTION)

- **Date**: 2025-09-06
- **Category**: `testing`, `e2e`, `sveltekit`, `playwright`, `ci-cd`
- **Complexity**: `intermediate`
- **Status**: ✅ Resolved
- **File**:

[debugging-chronicles-009-e2e-sveltekit-preload-visibility-issues.md](./debugging-chronicles-009-e2e-sveltekit-preload-visibility-issues.md)

- **Summary**: E2E tests failing due to SvelteKit preload data attribute making elements hidden,
resolved by using toBeAttached() instead of toBeVisible()

---

## 🔍 Search by Category

### CI/CD Issues

- DC-2025-01-15-001: PNPM Hoisting Issues
- DC-2025-01-15-002: GitHub Pages Environment Protection
- DC-2025-01-15-003: Playwright Configuration
- DC-2025-09-06-006: SvelteKit Build Directory Mismatch
- DC-2025-09-06-008: GitHub Pages PR Comment Permissions

### Build System Problems

- DC-2025-01-15-004: Markdown Linting Violations
- DC-2025-01-15-005: Prettier Formatting Issues
- DC-2025-09-06-006: SvelteKit Build Directory Mismatch

### Dependency Issues

- DC-2025-01-15-001: PNPM Hoisting Issues

### Performance Debugging

- *[To be added as optimization sessions are documented]*

### Browser Compatibility

- *[To be added as browser-specific issues are encountered]*

### Database/Persistence

- *[To be added as database issues are encountered]*

### PWA/Service Worker

- *[To be added as PWA issues are encountered]*

### TypeScript Issues

- *[To be added as TypeScript issues are encountered]*

### Testing Problems

- DC-2025-01-15-003: Playwright Configuration
- DC-2025-09-06-007: Playwright SvelteKit Timing Issues
- DC-2025-09-06-009: E2E SvelteKit Preload Visibility Issues

### Deployment Issues

- DC-2025-01-15-002: GitHub Pages Environment Protection
- DC-2025-09-06-008: GitHub Pages PR Comment Permissions

---

## 🔍 Search by Technology

### SvelteKit

- DC-2025-09-06-006: Build Directory Mismatch
- DC-2025-09-06-007: Preload Data Visibility Issues
- DC-2025-09-06-009: E2E Preload Visibility Issues (Final Resolution)

### PixiJS

- *[To be added as PixiJS issues are encountered]*

### Dexie/IndexedDB

- *[To be added as database issues are encountered]*

### Workbox

- *[To be added as PWA issues are encountered]*

### PNPM

- DC-2025-01-15-001: PNPM Hoisting Issues

### GitHub Actions

- DC-2025-01-15-001: PNPM Hoisting Issues
- DC-2025-01-15-002: GitHub Pages Environment Protection
- DC-2025-01-15-003: Playwright Configuration
- DC-2025-09-06-006: SvelteKit Build Directory Mismatch
- DC-2025-09-06-008: GitHub Pages PR Comment Permissions
- DC-2025-09-06-009: E2E SvelteKit Preload Visibility Issues

### Electron

- *[To be added as Steam integration progresses]*

### Steam Integration

- *[To be added as Steam integration issues are encountered]*

---

## 🔍 Search by Complexity

### Beginner

- DC-2025-01-15-002: GitHub Pages Environment Protection
- DC-2025-01-15-004: Markdown Linting Violations
- DC-2025-01-15-005: Prettier Formatting Issues
- DC-2025-09-06-008: GitHub Pages PR Comment Permissions

### Intermediate

- DC-2025-01-15-001: PNPM Hoisting Issues
- DC-2025-01-15-003: Playwright Configuration
- DC-2025-09-06-006: SvelteKit Build Directory Mismatch
- DC-2025-09-06-007: Playwright SvelteKit Timing Issues
- DC-2025-09-06-009: E2E SvelteKit Preload Visibility Issues

### Advanced

- *[To be added as complex issues are encountered]*

### Expert

- *[To be added as expert-level issues are encountered]*

---

## 📈 Statistics

- **Total Chronicles**: 9
- **Resolved**: 8
- **In Progress**: 1
- **Failed**: 0

### **By Category**

- CI/CD: 6
- Build: 3
- Dependencies: 1
- Testing: 3
- Deployment: 2

### **By Complexity Level**

- Beginner: 4
- Intermediate: 5
- Advanced: 0
- Expert: 0

---

## 🚀 How to Contribute

### **Adding New Chronicles**

1. Use the [debugging-chronicles-template.md](./debugging-chronicles-template.md)
2. Follow the structured format
3. Include all relevant tags and categories
4. Update this index with the new entry
5. Ensure searchability with proper keywords

### **Updating Existing Chronicles**

1. Add resolution status updates
2. Include follow-up issues or related problems
3. Update lessons learned as new insights emerge
4. Link to related chronicles

### **Quality Guidelines**

- Document the complete debugging process, not just the solution
- Include exact error messages and commands
- Explain the reasoning behind each step
- Add performance metrics when relevant
- Link to external resources and documentation

---

**Last Updated**: 2025-09-06
**Next Review**: 2025-09-13
