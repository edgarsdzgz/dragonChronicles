# Commit Rules and Formatting Guide

**Purpose**: Comprehensive guide for consistent, error-free commits that follow project standards and reduce development friction.

## Overview

This project uses **Conventional Commits** with **commitlint** validation. All commits must follow strict formatting rules to pass automated validation.

## Commit Message Format

```
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### Required Components

1. **Type**: Required, must be one of the allowed types
2. **Scope**: Required, must not be empty
3. **Description**: Required, must not be empty
4. **Header Length**: Maximum 72 characters total

## Allowed Types

| Type       | Description               | Example                                         |
| ---------- | ------------------------- | ----------------------------------------------- |
| `feat`     | New feature               | `feat(spawn): add enemy spawning system`        |
| `fix`      | Bug fix                   | `fix(ai): resolve enemy movement bug`           |
| `perf`     | Performance improvement   | `perf(pool): optimize object pooling`           |
| `refactor` | Code refactoring          | `refactor(types): simplify enemy interfaces`    |
| `docs`     | Documentation changes     | `docs(readme): update installation guide`       |
| `test`     | Adding or updating tests  | `test(spawn): add unit tests for spawn manager` |
| `build`    | Build system changes      | `build(webpack): update bundler configuration`  |
| `ci`       | CI/CD pipeline changes    | `ci(github): fix workflow configuration`        |
| `chore`    | Maintenance tasks         | `chore(deps): update dependencies`              |
| `revert`   | Reverting previous commit | `revert(spawn): undo broken spawn logic`        |

## Scope Guidelines

### Required Scopes

**Scope is MANDATORY** - never commit without a scope.

### Common Scopes

| Scope      | Usage               | Examples                                   |
| ---------- | ------------------- | ------------------------------------------ |
| `p1-e2-s1` | Story-level changes | `feat(p1-e2-s1): implement enemy spawning` |
| `p1-e2`    | Epic-level changes  | `feat(p1-e2): add AI framework`            |
| `engine`   | Core engine package | `feat(engine): add RNG system`             |
| `sim`      | Simulation package  | `fix(sim): resolve state management`       |
| `web`      | Web application     | `feat(web): add enemy sprites`             |
| `docs`     | Documentation       | `docs(readme): update setup guide`         |
| `ci`       | CI/CD workflows     | `fix(ci): resolve pipeline failures`       |
| `build`    | Build system        | `build(vite): update configuration`        |
| `deps`     | Dependencies        | `chore(deps): update packages`             |

### Story/Epic Scope Format

- **Epic**: `p1-e2` (Phase 1, Epic 2)
- **Story**: `p1-e2-s1` (Phase 1, Epic 2, Story 1)

## Header Length Rules

### CRITICAL: 72 Character Limit

The header (everything before the first line break) must be ≤ 72 characters.

**Formula**: `type(scope): description` ≤ 72 characters

### Length Calculation Examples

```
feat(p1-e2-s1): implement enemy spawning system
1234567890123456789012345678901234567890123456789012345678901234567890
^-- 72 characters max
```

### Common Length Issues

❌ **TOO LONG** (74 chars):

```
feat(p1-e2-s1): implement enemy spawning system foundation
```

✅ **CORRECT** (71 chars):

```
feat(p1-e2-s1): implement enemy spawning system
```

## Description Rules

### Format Requirements

- **Required**: Must not be empty
- **Case**: No specific case requirements (but be consistent)
- **Ending**: No period at the end
- **Length**: Must fit within 72-character header limit

### Good Descriptions

✅ **Clear and concise**:

- `feat(spawn): add enemy spawning system`
- `fix(ai): resolve movement calculation bug`
- `docs(readme): update installation instructions`

✅ **Specific and actionable**:

- `refactor(pool): optimize memory allocation`
- `perf(render): reduce draw calls by 30%`

### Bad Descriptions

❌ **Too vague**:

- `feat(spawn): add stuff`
- `fix(ai): fix things`
- `docs(readme): update`

❌ **Too long for header**:

- `feat(p1-e2-s1): implement comprehensive enemy spawning system with advanced AI`
- `fix(very-long-scope-name): resolve complex bug in enemy movement system`

## Body and Footer Rules

### Body (Optional)

- **Format**: Separate from header with blank line
- **Length**: No specific limit
- **Content**: Detailed explanation, rationale, breaking changes

### Footer (Optional)

- **Format**: Separate from body with blank line
- **Content**: Breaking changes, issue references
- **Examples**: `BREAKING CHANGE:`, `Fixes #123`, `Refs #456`

## Common Mistakes and Fixes

### Mistake 1: Header Too Long

❌ **Error**:

```
feat(p1-e2-s1): implement comprehensive enemy spawning system with advanced AI and performance optimization
```

✅ **Fix**:

```
feat(p1-e2-s1): implement enemy spawning system

- Add comprehensive spawning with advanced AI
- Include performance optimization features
- Support multiple enemy types and behaviors
```

### Mistake 2: Missing Scope

❌ **Error**:

```
feat: add enemy spawning
```

✅ **Fix**:

```
feat(spawn): add enemy spawning system
```

### Mistake 3: Empty Description

❌ **Error**:

```
feat(spawn):
```

✅ **Fix**:

```
feat(spawn): add enemy spawning system
```

### Mistake 4: Wrong Type

❌ **Error**:

```
update(spawn): add enemy spawning
```

✅ **Fix**:

```
feat(spawn): add enemy spawning system
```

## Project-Specific Patterns

### Epic/Story Development

```
feat(p1-e2-s1): implement enemy spawning system
feat(p1-e2-s2): add basic AI behaviors
feat(p1-e2): complete epic integration
```

### Package-Specific Changes

```
feat(engine): add deterministic RNG system
fix(sim): resolve state management bug
refactor(web): optimize sprite rendering
```

### Documentation Updates

```
docs(readme): update installation guide
docs(api): add function documentation
docs(plan): update implementation roadmap
```

### CI/CD and Build

```
fix(ci): resolve pipeline failures
build(vite): update bundler configuration
ci(github): add new workflow
```

## Validation Process

### Pre-Commit Validation

The project uses **commitlint** with **husky** hooks:

1. **Automatic validation** on every commit
2. **Failure stops commit** until message is fixed
3. **Real-time feedback** on formatting errors

### Manual Validation

Before committing, check:

1. **Type**: Is it one of the allowed types?
2. **Scope**: Is it present and appropriate?
3. **Description**: Is it clear and ≤ 72 chars?
4. **Format**: Does it follow the pattern?

### Quick Check Script

```bash
# Test your commit message
echo "feat(p1-e2-s1): implement enemy spawning system" | npx commitlint
```

## Examples by Category

### Feature Development

```
feat(p1-e2-s1): implement enemy spawning system
feat(p1-e2-s1): add distance-based spawn scaling
feat(p1-e2-s1): integrate with deterministic RNG
```

### Bug Fixes

```
fix(spawn): resolve spawn rate calculation bug
fix(ai): prevent enemies from getting stuck
fix(render): fix sprite positioning issues
```

### Performance

```
perf(pool): optimize object allocation
perf(render): reduce draw calls by 30%
perf(sim): improve state update performance
```

### Documentation

```
docs(readme): update installation instructions
docs(api): add function documentation
docs(plan): update implementation roadmap
```

### Refactoring

```
refactor(types): simplify enemy interfaces
refactor(spawn): extract spawn logic into manager
refactor(ai): consolidate state machine logic
```

### Testing

```
test(spawn): add unit tests for spawn manager
test(ai): add integration tests for enemy behavior
test(render): add visual regression tests
```

### Build and CI

```
build(vite): update bundler configuration
ci(github): fix workflow syntax errors
chore(deps): update development dependencies
```

## Emergency Procedures

### If Commit Fails Validation

1. **Don't panic** - the commit is saved in git stash
2. **Fix the message** using `git commit --amend -m "corrected message"`
3. **Check length** - ensure header ≤ 72 characters
4. **Verify format** - type(scope): description

### If You Need to Rewrite History

```bash
# Interactive rebase to fix multiple commits
git rebase -i HEAD~3

# Fix specific commit message
git commit --amend -m "feat(scope): correct message"
```

## Best Practices Summary

### DO ✅

- **Use descriptive scopes** that indicate the area of change
- **Keep descriptions concise** but informative
- **Follow the 72-character limit** religiously
- **Use appropriate types** for the change
- **Commit small, logical changes** frequently
- **Test your message** before committing

### DON'T ❌

- **Skip the scope** - it's required
- **Make headers too long** - breaks validation
- **Use vague descriptions** - be specific
- **Commit large, unrelated changes** together
- **Use wrong types** - follow the allowed list
- **Ignore validation errors** - fix them immediately

## Quick Reference Card

```
Format: type(scope): description
Length: ≤ 72 characters total
Types: feat, fix, perf, refactor, docs, test, build, ci, chore, revert
Scope: Required, use p1-e2-s1, engine, sim, web, docs, ci, build, deps

Examples:
feat(p1-e2-s1): implement enemy spawning system
fix(spawn): resolve rate calculation bug
docs(readme): update installation guide
ci(github): fix workflow configuration
```

---

**Remember**: Good commits save time, improve collaboration, and make debugging easier. Follow these rules consistently to focus on game development instead of fixing commit messages!
