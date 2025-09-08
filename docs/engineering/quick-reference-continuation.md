# Quick Reference: CI/CD Continuation Guide

## 🚀 Immediate Actions for New Machine

### 1. Check Current Status

````bash

# Check workflow status

gh run list --limit 5

# Check Pages Deploys specifically

gh run view [LATEST*PAGES*RUN_ID] --log

```bash

### 2. If Pages Deploys is Still Failing

```bash

# Check deployment logs

gh run view [RUN_ID] --log-failed

# Verify environment settings

gh api repos/edgarsdzgz/dragonChronicles/environments/github-pages/deployment-branch-policies

```text

### 3. If Pages Deploys is Passing ✅

Move to E2E Smoke workflow:

```bash

# Check E2E workflow logs

gh run view [E2E*RUN*ID] --log

# Look for: "Project(s) 'chromium' not found"

```text

## 🔧 Key Commands

### Workflow Management

```bash

gh run list --limit 10
gh run view [RUN_ID] --log
gh run view [RUN_ID] --log-failed

```bash

### Local Testing

```bash

pnpm run docs:lint
pnpm run build
pnpm run test

```bash

### Git Operations

```bash

git status
git log --oneline -5
git push origin feat/w7-cicd-previews

```text

## 📋 Current State Summary

### ✅ FIXED (4/6 workflows)

- **CI**: Prettier formatting issues resolved

- **Checks**: Linting issues resolved

- **Lighthouse**: Was already working

- **Docs**: Markdownlint issues resolved (MD051, MD024)

### 🔄 IN PROGRESS

- **Pages Deploys**: Environment protection rules fix applied, deployment succeeds but PR comment

  fails due to permissions
  fails due to permissions

### ❌ REMAINING

- **E2E Smoke**: Playwright configuration issue

## 🎯 Next Steps Priority

1. **Verify Pages Deploys fix** (environment protection rules)

1. **Fix E2E Smoke workflow** (Playwright configuration)

1. **Clean up temporary fixes** (remove `continue-on-error: true`)

1. **Document final solutions**

## 📚 Key Files to Reference

- `docs/engineering/ci-workflow-debugging-session.md` - Complete session documentation

- `CLAUDE.md` - Updated with current status and solutions

- `.github/workflows/` - All workflow configurations

- `scripts/` - Automation scripts created during debugging

## 🧠 User Preferences (from memories)

- **Automation**: Prefers bash scripts for repetitive tasks

- **Sequential**: One issue at a time approach

- **Testing**: Local testing before CI

- **Documentation**: All docs in `/docs/` folder

- **Feature Branches**: Work on feature branches, not main

## 🎉 Success Metrics

**Before**: 1/6 workflows passing (16.7%)
**Current**: 4/6 workflows passing (66.7%)
**Target**: 6/6 workflows passing (100%)

---

**Ready for continuation!** 🚀
````
