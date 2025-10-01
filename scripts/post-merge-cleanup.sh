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
