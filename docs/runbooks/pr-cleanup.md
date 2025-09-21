# PR Cleanup Runbook

**Purpose**: Ensure clean repository state after PR merges and prepare for next issue
implementation.

## When to Use This Runbook

**Trigger**: After receiving confirmation that a PR has been merged to main.

**Frequency**: **EVERY TIME** a PR is merged - this is mandatory, not optional.

## Prerequisites

- PR has been merged to main branch

- All CI checks have passed

- User has confirmed merge completion

## Cleanup Process

### 1. Switch to Main Branch

````bash

git checkout main
git pull origin main

```text

**Why**: Ensure we have the latest merged changes and are on the correct branch.

### 2. Delete Local Feature Branch

```bash

# For completed feature branches

git branch -d feat/p0-s00X-<description>

# If branch has unmerged changes (force delete)

git branch -D feat/p0-s00X-<description>

```text

**Why**: Clean up local branches to prevent confusion and maintain clean repository state.

### 3. Delete Remote Feature Branch

```bash

git push origin --delete feat/p0-s00X-<description>

```text

**Why**: Remove remote branches to prevent clutter and ensure no one accidentally works on completed
features.

### 4. Clean Up Planning Documents

- Delete completed `S00XPlan.md` or `WXPlan.md` files

- Update any remaining documentation references

- Remove any temporary test files created during development

**Why**: Keep repository clean and prevent confusion about what's complete vs. in progress.

### 5. Verify Clean State

```bash

git branch -a          # Should show only main and any active branches
git status             # Should be clean
git log --oneline -5   # Verify latest commits are from main

```text

**Why**: Ensure we're in a clean state ready for next issue.

### 6. Update Documentation

- Mark completed workpacks as ✅ in GDD

- Update project status in overview docs

- Update changelog with completion notes

- Verify all documentation reflects current state

**Why**: Keep documentation current and accurate for team members.

## Branch Naming Patterns

### Completed Branches to Clean Up

- **S-series**: `feat/p0-s001-foundation`, `feat/p0-s002-typescript-strict`, etc.

- **W-series**: `feat/p0-w2-app-shell-render-host`, `feat/p0-w4-persistence-v1`, etc.

- **R-series**: `feat/p0-s002-r1-simplify-strict-gate` (revision branches)

### Branches to Keep

- `main` - primary development branch

- Any active feature branches currently being worked on

- Any branches for issues that are still in progress

## Verification Checklist

Before considering cleanup complete, verify:

- [ ] Switched to main branch

- [ ] Pulled latest changes

- [ ] Local feature branch deleted

- [ ] Remote feature branch deleted

- [ ] Planning documents cleaned up

- [ ] Documentation updated

- [ ] Repository state is clean

- [ ] Ready for next issue implementation

## Common Issues and Solutions

### Issue: Branch won't delete due to unmerged changes

**Solution**: Use force delete if you're certain the work was merged:

```bash

git branch -D feat/p0-s00X-<description>

```javascript

### Issue: Remote branch deletion fails

**Solution**: Check if branch exists and try again:

```bash

git ls-remote --heads origin | grep feat/p0-s00X
git push origin --delete feat/p0-s00X-<description>

```text

### Issue: Documentation out of sync

**Solution**: Update all relevant files:

- GDD status

- Overview README

- Changelog

- Any planning documents

## Benefits of Following This Process

1. **Clean Repository**: No orphaned branches or outdated files

1. **Clear Status**: Team always knows what's complete vs. in progress

1. **Efficient Workflow**: No confusion about which branches to work on

1. **Documentation Accuracy**: All docs reflect current project state

1. **Professional Standards**: Maintains high-quality repository hygiene

## Integration with Development Workflow

This cleanup process is integrated into the main development workflow:

1. **Issue Implementation** → **PR Creation** → **PR Review** → **PR Merge**

1. **PR Cleanup** (this runbook) → **Ready for Next Issue**

**Never skip the cleanup step** - it's as important as the implementation itself.

## Team Responsibility

- **Individual Developers**: Responsible for cleaning up their own PRs

- **Team Leads**: Ensure cleanup process is followed

- **Code Reviewers**: Can remind developers about cleanup requirements

## Related Documentation

- [Development Guidelines](../CLAUDE.md) - Main development workflow

- [Issue Implementation Workflow](../CLAUDE.md#issue-implementation-workflow)

- [Branch Naming Convention](../CLAUDE.md#branch-naming-convention)

---

**Remember**: Clean repository = Happy team = Efficient development = Quality code

````
