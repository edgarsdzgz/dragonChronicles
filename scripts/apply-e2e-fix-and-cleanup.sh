#!/bin/bash
# Script to apply E2E fix and cleanup old branches

set -e

echo "=== Applying E2E Test Fix to Current Branch ==="
echo "Cherry-picking commit d9ddb0c32839f9613d071878b410c5b65baea859"
git cherry-pick d9ddb0c32839f9613d071878b410c5b65baea859 || {
    echo "Cherry-pick failed or already applied"
    echo "Checking if changes are already present..."
    git cherry-pick --abort 2>/dev/null || true
}

echo ""
echo "=== Cleaning Up Old Local Branches ==="

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"

# List branches to delete
BRANCHES_TO_DELETE=(
    "feat/p1-e3-s2-targeting-logic"
    "feat/dependency-updates-security-fixes"
    "feat/p1-e4-arcana-economy-enchant-system"
    "feat/p1-e4-s3-soul-forging-system"
)

echo ""
echo "Branches to delete:"
for branch in "${BRANCHES_TO_DELETE[@]}"; do
    if git show-ref --verify --quiet refs/heads/"$branch"; then
        echo "  - $branch"
    fi
done

echo ""
read -p "Proceed with deleting these branches? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    for branch in "${BRANCHES_TO_DELETE[@]}"; do
        if git show-ref --verify --quiet refs/heads/"$branch"; then
            if [ "$branch" != "$CURRENT_BRANCH" ]; then
                echo "Deleting branch: $branch"
                git branch -D "$branch" || echo "Failed to delete $branch"
            else
                echo "Skipping current branch: $branch"
            fi
        fi
    done
    echo "Branch cleanup complete!"
else
    echo "Branch cleanup cancelled"
fi

echo ""
echo "=== Current Local Branches ==="
git branch

echo ""
echo "=== Done ==="

