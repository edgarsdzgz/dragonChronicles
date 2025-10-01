# Post-Merge Cleanup Process

## Overview

Comprehensive process for cleaning up after PR merges to maintain repository hygiene and prevent accumulation of temporary files and branches.

## Pre-Merge Checklist

- [ ] PR uses proper closing keywords: `Closes #X`, `Fixes #X`, `Resolves #X`
- [ ] All acceptance criteria met
- [ ] All tests passing
- [ ] Documentation updated
- [ ] No temporary files in PR

## Post-Merge Process (Manual)

### 1. Switch to Main Branch

```bash
git checkout main
git pull origin main
```

### 2. Delete Local Feature Branches

```bash
# List local branches
git branch

# Delete feature branches (replace with actual branch names)
git branch -d feat/branch-name
git branch -d feature/branch-name
```

### 3. Delete Remote Feature Branches

```bash
# Delete remote branches
git push origin --delete feat/branch-name
git push origin --delete feature/branch-name
```

### 4. Clean Up Temporary Files

```bash
# Delete planning documents (if temporary)
rm -f *Plan.md
rm -f docs/planning/*Plan.md

# Delete temporary scripts
rm -f scripts/temp-*.py
rm -f scripts/temp-*.sh

# Delete temporary documentation
rm -f *-CLEANUP-STEPS.md
rm -f *-FIX-PLAN.md
```

### 5. Commit Cleanup

```bash
git add .
git commit -m "chore: post-merge cleanup - remove temporary files and branches"
git push origin main
```

### 6. Verify Clean State

```bash
# Check git status
git status

# Check branches
git branch -a

# Check open issues
gh issue list --limit 10

# Run tests
pnpm run test:all
```

## Post-Merge Process (Automated)

### Create Cleanup Script

```bash
# Create scripts/post-merge-cleanup.sh
```

### Script Contents

```bash
#!/bin/bash
set -e

echo "🧹 Starting post-merge cleanup process..."

# Switch to main and pull latest
echo "📥 Switching to main and pulling latest changes..."
git checkout main
git pull origin main

# Get list of feature branches to clean
echo "🔍 Finding feature branches to clean..."
FEATURE_BRANCHES=$(git branch | grep -E "(feat/|feature/)" | sed 's/^[ *]*//')

if [ -n "$FEATURE_BRANCHES" ]; then
    echo "🗑️  Deleting local feature branches..."
    for branch in $FEATURE_BRANCHES; do
        echo "  Deleting local branch: $branch"
        git branch -d "$branch" || git branch -D "$branch"
    done

    echo "🗑️  Deleting remote feature branches..."
    for branch in $FEATURE_BRANCHES; do
        echo "  Deleting remote branch: $branch"
        git push origin --delete "$branch" || echo "  Remote branch $branch not found"
    done
else
    echo "✅ No feature branches found to clean"
fi

# Clean up temporary files
echo "🧹 Cleaning up temporary files..."
rm -f *Plan.md
rm -f docs/planning/*Plan.md
rm -f scripts/temp-*.py
rm -f scripts/temp-*.sh
rm -f *-CLEANUP-STEPS.md
rm -f *-FIX-PLAN.md

# Commit cleanup
echo "💾 Committing cleanup changes..."
git add .
if git diff --staged --quiet; then
    echo "✅ No cleanup changes to commit"
else
    git commit -m "chore: post-merge cleanup - remove temporary files and branches"
    git push origin main
    echo "✅ Cleanup committed and pushed"
fi

# Verify clean state
echo "🔍 Verifying clean state..."
echo "Git status:"
git status

echo "Remaining branches:"
git branch

echo "Open issues:"
gh issue list --limit 5

echo "✅ Post-merge cleanup complete!"
```

## PR Template Standards

### Required Closing Keywords

Always use these exact phrases in PR descriptions:

- `Closes #X` - for issues that are fully completed
- `Fixes #X` - for bug fixes
- `Resolves #X` - for resolving issues

### PR Description Template

```markdown
## Overview

Brief description of changes

## Features Implemented

- Feature 1
- Feature 2

## Files Added/Modified

- `path/to/file.ts` - Description

## Testing

- [ ] All tests passing
- [ ] Performance targets met
- [ ] Edge cases covered

## Related Issues

Closes #X
Fixes #Y
Resolves #Z

## Next Steps

What comes next in the workflow
```

## Quality Gates

### Before Creating PR

- [ ] All acceptance criteria met
- [ ] All tests passing (pnpm run test:all)
- [ ] No linting errors (pnpm run lint)
- [ ] TypeScript strict compliance (pnpm run type-check)
- [ ] Documentation updated
- [ ] No temporary files included

### After PR Merge

- [ ] Switch to main branch
- [ ] Pull latest changes
- [ ] Delete local feature branches
- [ ] Delete remote feature branches
- [ ] Clean up temporary files
- [ ] Commit and push cleanup
- [ ] Verify clean state
- [ ] Check pipeline status

## Automation Integration

### GitHub Actions Integration

Consider adding a post-merge workflow that:

1. Automatically deletes feature branches after merge
2. Cleans up temporary files
3. Verifies repository state

### Pre-commit Hooks

Add hooks to prevent temporary files from being committed:

```bash
# .gitignore additions
*Plan.md
*-CLEANUP-STEPS.md
*-FIX-PLAN.md
temp-*.py
temp-*.sh
```

## Troubleshooting

### Branch Won't Delete

```bash
# Force delete local branch
git branch -D branch-name

# Check if branch is merged
git branch --merged main
```

### Remote Branch Won't Delete

```bash
# Check if remote exists
git ls-remote --heads origin branch-name

# Force delete remote
git push origin --delete branch-name
```

### Temporary Files Won't Delete

```bash
# Check file permissions
ls -la filename

# Force delete
rm -f filename
```

## Success Criteria

- [ ] Repository on main branch
- [ ] Git status clean
- [ ] No feature branches remaining
- [ ] No temporary files
- [ ] All tests passing
- [ ] Pipeline green
- [ ] Ready for next work

---

**Last Updated**: 2025-01-30  
**Version**: 1.0  
**Maintainer**: Development Team
