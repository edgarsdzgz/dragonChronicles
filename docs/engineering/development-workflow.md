# Development Workflow & Safeguards

**Date**: September 3, 2025
**Purpose**: Comprehensive development workflow guidelines and safeguards

## 🎯 Overview

This document outlines the development workflow, safeguards, and best practices for the Draconia
Chronicles project. It includes lessons learned from critical workflow failures and prevention
measures.

## 🚨 Critical Workflow Lessons

### W6 PWA Recovery Incident

**Date**: September 3, 2024
**Issue**: Complete PWA implementation was lost due to git workflow failure
**Impact**: W6 PWA implementation was accidentally stashed instead of committed
**Resolution**: Successfully recovered from `git stash@{0}` and implemented safeguards

#### Root Causes Identified

1. **Workflow Failure**: Work was stashed during lint-staged automatic backup instead of being

   committed

1. **Misleading Commit Messages**: Commits claimed implementation without actual files

1. **Branch Confusion**: Wrong branch was merged (planning vs implementation)

1. **No Verification**: No automated checks to ensure implementation matches commit messages

1. **No Safeguards**: No prevention measures against stashing important work

#### Prevention Measures Implemented

1. **Verification Scripts**: Automated validation of implementation completeness

1. **Pre-commit Hooks**: Prevent misleading commit messages

1. **Pre-push Hooks**: Verify implementation completeness before pushing

1. **Pre-stash Hooks**: Warn before stashing important changes

## 🛡️ Development Safeguards

### 1. Git Hooks

#### Pre-commit Hook

- **Purpose**: Prevent commits claiming features without actual files

- **Validation**: Checks that staged files match commit claims

- **PWA-Specific**: Validates PWA implementation claims against actual files

#### Pre-push Hook

- **Purpose**: Verify implementation completeness before pushing

- **Feature Branch**: Runs implementation verification on feature branches

- **Quality Gate**: Prevents pushing incomplete implementations

#### Pre-stash Hook

- **Purpose**: Warn before stashing critical implementation files

- **User Confirmation**: Requires explicit confirmation for stashing important work

- **Workflow Guidance**: Provides clear instructions for proper commit workflow

### 2. Verification Scripts

#### Implementation Verification

````bash

#!/bin/bash

# scripts/verify-implementation.sh

# File existence checks

check_file() {
  local file="$1"
  local expected_lines="$2"

  if [[ ! -f "$file" ]]; then
    echo "❌ Missing file: $file"
    return 1
  fi

  local actual_lines=$(wc -l < "$file")
  if [[ $actual*lines -lt $expected*lines ]]; then
    echo "❌ File too short: $file (expected $expected*lines, got $actual*lines)"
    return 1
  fi

  echo "✅ File OK: $file ($actual_lines lines)"
  return 0
}

# Verify PWA implementation

check_file "apps/web/static/manifest.json" 100
check_file "apps/web/static/sw.js" 150
check_file "apps/web/src/lib/pwa/InstallPrompt.svelte" 200
check_file "apps/web/src/lib/pwa/UpdateToast.svelte" 200
check_file "apps/web/src/lib/pwa/update-manager.ts" 150

```text

### 3. Commit Message Standards

#### Required Format

```text

type(scope): description

[optional body]

[optional footer]

```text

#### Validation Rules

- **Accurate Claims**: Commit messages must accurately reflect actual changes

- **File Verification**: Claims about features must be backed by actual files

- **Implementation Completeness**: Feature claims require complete implementation

#### Examples

```bash

# ✅ Good - accurate and complete

feat(pwa): implement PWA installation prompt

- Add InstallPrompt.svelte component

- Integrate with app layout

- Add installation detection logic

# ❌ Bad - claims feature without files

feat(pwa): implement PWA installation prompt

# ❌ Bad - incomplete implementation

feat(pwa): implement PWA installation prompt

- Add InstallPrompt.svelte component (incomplete)

```text

## 🔄 Development Workflow

### 1. Feature Development

#### Planning Phase

1. **Create Planning Document**: Document requirements and implementation plan in `/docs/` folder

1. **Create Feature Branch**: Use clear naming convention (e.g., `feat/w6-pwa-update-ux`)

1. **Review Plan**: Get approval before implementation

#### Implementation Phase

1. **Implement Features**: Develop complete implementation

1. **Test Thoroughly**: Ensure all functionality works

1. **Verify Implementation**: Run verification scripts

1. **Commit Frequently**: Commit working code regularly

#### Completion Phase

1. **Final Testing**: Comprehensive testing of all features

1. **Documentation Update**: Update all relevant documentation

1. **Code Review**: Review implementation for quality

1. **Merge to Main**: Merge complete implementation

### 2. Branch Management

#### Branch Naming Convention

- **Feature Branches**: `feat/w6-pwa-update-ux`

- **Planning Branches**: `feat/p0-w6-pwa-update-ux`

- **Bug Fixes**: `fix/issue-description`

- **Hotfixes**: `hotfix/critical-issue`

#### Branch Verification

- **Implementation Branches**: Must contain actual implementation

- **Planning Branches**: Must contain only planning documents

- **Merge Verification**: Verify correct branch before merging

### 3. Planning Document Standards

#### Planning Document Location

- **All planning documents** must be created in the `/docs/` folder

- **Workpack plans** (W7, W8, etc.) go directly in `/docs/` folder

- **Feature plans** go in appropriate subdirectories (e.g., `/docs/engineering/`,

  `/docs/optimization/`)

- **No planning documents** should be created in the root directory

#### Planning Document Structure

```markdown

# [Workpack/Feature] Planning Document: [Title]

## Issue Analysis

- Workpack/Feature name

- Phase and priority

- Dependencies

## Implementation Plan

- Detailed implementation steps

- Risk assessment

- Timeline estimates

## Acceptance Criteria

- Functional requirements

- Performance requirements

- Quality requirements

```text

### 4. Commit Workflow

#### Before Committing

1. **Stage Changes**: `git add` only relevant files

1. **Verify Changes**: Review staged changes

1. **Run Tests**: Ensure tests pass

1. **Check Hooks**: Pre-commit hooks will run automatically

#### Commit Message

1. **Accurate Description**: Describe actual changes made

1. **Complete Information**: Include all relevant details

1. **Reference Issues**: Link to related issues or PRs

#### After Committing

1. **Verify Commit**: Check that commit contains expected changes

1. **Run Verification**: Run implementation verification if applicable

1. **Push Changes**: Push to remote repository

## 🚫 Anti-Patterns to Avoid

### 1. Stashing Important Work

```bash

# ❌ Never do this with important implementation work

git stash

# ✅ Instead, commit the work

git add .
git commit -m "feat: implement feature X"

```bash

### 2. Misleading Commit Messages

```bash

# ❌ Don't claim features without implementation

git commit -m "feat: implement PWA" # when no PWA files exist

# ✅ Be accurate about what was actually done

git commit -m "docs: add PWA planning document"

```bash

### 3. Merging Wrong Branches

```bash

# ❌ Don't merge planning branches as implementation

git merge feat/p0-w6-pwa-update-ux  # planning branch

# ✅ Merge actual implementation branches

git merge feat/w6-pwa-update-ux     # implementation branch

```bash

### 4. Incomplete Implementations

```bash

# ❌ Don't claim complete implementation with partial work

git commit -m "feat: complete PWA implementation" # when only 50% done

# ✅ Be honest about implementation status

git commit -m "feat: add PWA manifest and service worker"

```text

## 🔍 Verification Checklist

### Pre-Commit Checklist

- [ ] All changes are staged correctly

- [ ] Commit message accurately describes changes

- [ ] Tests pass locally

- [ ] No sensitive information in commit

- [ ] Implementation is complete (if claiming completion)

### Before Pushing

- [ ] All commits are accurate and complete

- [ ] Implementation verification passes

- [ ] No merge conflicts

- [ ] Branch is up to date with main

- [ ] All documentation is updated

### Before Merging

- [ ] Feature is completely implemented

- [ ] All tests pass

- [ ] Code review completed

- [ ] Documentation updated

- [ ] Implementation verification passes

## 🛠️ Tools and Scripts

### Verification Scripts

- **`scripts/verify-implementation.sh`**: Verify PWA implementation completeness

- **`scripts/check-commit-accuracy.sh`**: Validate commit message accuracy

- **`scripts/verify-branch.sh`**: Verify branch contains expected content

### Git Hooks

- **`.git/hooks/pre-commit`**: Prevent misleading commits

- **`.git/hooks/pre-push`**: Verify implementation completeness

- **`.git/hooks/pre-stash`**: Warn about important changes

### Development Tools

- **Lint-staged**: Automatic code formatting and linting

- **Husky**: Git hooks management

- **Commitlint**: Commit message validation

## 📚 Best Practices

### 1. Workflow Discipline

- **Never Stash Important Work**: Always commit implementation work immediately

- **Verify Before Claiming**: Never claim features in commit messages without actual files

- **Branch Verification**: Always verify correct branch before merging

- **Automated Validation**: Use scripts to verify implementation completeness

### 2. Communication Standards

- **Be Precise**: Distinguish between "already working" vs "newly implemented"

- **Own Mistakes**: Acknowledge when incorrect assumptions were made

- **Provide Specific Details**: Include exact commands, file paths, and error messages

- **Focus on Blockers**: Clearly identify what still needs to be resolved

### 3. Quality Assurance

- **Test Thoroughly**: Maintain comprehensive test coverage

- **Document Changes**: Document all implementation decisions

- **Review Code**: Always review code before merging

- **Monitor Performance**: Ensure changes don't degrade performance

## 🎯 Success Metrics

### Workflow Health

- **Zero Lost Work**: No important work lost due to workflow failures

- **Accurate Commits**: 100% of commit messages accurately reflect changes

- **Complete Implementations**: All claimed features are fully implemented

- **Successful Recoveries**: Any issues are quickly identified and resolved

### Development Efficiency

- **Faster Development**: Streamlined workflow reduces development time

- **Fewer Errors**: Safeguards prevent common workflow mistakes

- **Better Quality**: Verification ensures high-quality implementations

- **Improved Collaboration**: Clear workflow enables better team collaboration

---

**This workflow ensures reliable, high-quality development while preventing the types of
workflow failures that can lead to lost work and project delays.**
````
