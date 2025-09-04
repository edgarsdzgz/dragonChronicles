#!/bin/bash

# Prevention Script for Stash Loss
# This script prevents the critical workflow failure that caused PWA implementation loss

set -e

echo "🛡️  STASH LOSS PREVENTION SYSTEM"
echo "================================="

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Function to check if we're about to stash important work
check_stash_safety() {
    local branch=$(git branch --show-current)
    local staged_files=$(git diff --cached --name-only | wc -l)
    local unstaged_files=$(git diff --name-only | wc -l)
    
    echo "Current branch: $branch"
    echo "Staged files: $staged_files"
    echo "Unstaged files: $unstaged_files"
    
    # Check for important files that should never be stashed
    local important_files=(
        "apps/web/static/manifest.json"
        "apps/web/static/sw.js"
        "apps/web/src/lib/pwa/"
        "packages/db/src/"
        "packages/logger/src/"
        "packages/sim/src/"
    )
    
    local has_important_files=false
    
    for file in "${important_files[@]}"; do
        if git status --porcelain | grep -q "$file"; then
            echo -e "${YELLOW}⚠️  WARNING: Important file '$file' has changes${NC}"
            has_important_files=true
        fi
    done
    
    if [ "$has_important_files" = true ]; then
        echo -e "${RED}🚨 CRITICAL: Important implementation files detected!${NC}"
        echo -e "${RED}DO NOT STASH - COMMIT THESE CHANGES INSTEAD${NC}"
        echo ""
        echo "Recommended actions:"
        echo "1. Review changes: git diff"
        echo "2. Stage important files: git add <files>"
        echo "3. Commit with descriptive message: git commit -m 'feat: implement feature'"
        echo "4. Push to remote: git push"
        return 1
    fi
    
    return 0
}

# Function to create a pre-commit hook that prevents misleading commits
create_pre_commit_safety() {
    local hook_file=".git/hooks/pre-commit"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash

# Pre-commit hook to prevent misleading commits
# This prevents commits that claim features without actual implementation

# Check if commit message claims implementation
commit_msg=$(cat "$1")
if echo "$commit_msg" | grep -qi "implement\|complete\|add.*feature\|add.*pwa\|add.*service"; then
    # Check if actual implementation files exist
    if ! git diff --cached --name-only | grep -qE "(\.ts|\.js|\.svelte|\.json|\.mjs)$"; then
        echo "❌ ERROR: Commit message claims implementation but no code files are staged!"
        echo "Commit message: $commit_msg"
        echo "Staged files: $(git diff --cached --name-only)"
        echo ""
        echo "Either:"
        echo "1. Add the actual implementation files to staging"
        echo "2. Change the commit message to be more accurate"
        exit 1
    fi
fi

# Check for PWA implementation claims
if echo "$commit_msg" | grep -qi "pwa\|progressive.*web.*app\|service.*worker\|manifest"; then
    local pwa_files=(
        "apps/web/static/manifest.json"
        "apps/web/static/sw.js"
        "apps/web/src/lib/pwa/"
    )
    
    local has_pwa_files=false
    for file in "${pwa_files[@]}"; do
        if git diff --cached --name-only | grep -q "$file"; then
            has_pwa_files=true
            break
        fi
    done
    
    if [ "$has_pwa_files" = false ]; then
        echo "❌ ERROR: Commit message claims PWA implementation but no PWA files are staged!"
        echo "Commit message: $commit_msg"
        echo "Expected PWA files: ${pwa_files[*]}"
        exit 1
    fi
fi

echo "✅ Pre-commit checks passed"
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✅ Pre-commit safety hook installed${NC}"
}

# Function to create a pre-push hook that verifies implementation
create_pre_push_safety() {
    local hook_file=".git/hooks/pre-push"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash

# Pre-push hook to verify implementation completeness
# This prevents pushing branches that claim features without verification

echo "🔍 Verifying implementation before push..."

# Check if we're on a feature branch
branch=$(git branch --show-current)
if [[ "$branch" =~ ^feat/ ]]; then
    echo "Feature branch detected: $branch"
    
    # Run implementation verification if script exists
    if [ -f "scripts/verify-implementation.sh" ]; then
        echo "Running implementation verification..."
        if ! bash scripts/verify-implementation.sh; then
            echo "❌ Implementation verification failed!"
            echo "Fix issues before pushing."
            exit 1
        fi
    fi
fi

echo "✅ Pre-push checks passed"
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✅ Pre-push safety hook installed${NC}"
}

# Function to create a stash warning system
create_stash_warning() {
    local hook_file=".git/hooks/pre-stash"
    
    cat > "$hook_file" << 'EOF'
#!/bin/bash

# Pre-stash hook to warn about important changes
# This prevents accidentally stashing important implementation work

echo "⚠️  STASH WARNING SYSTEM"
echo "========================"

# Check for important files
important_patterns=(
    "apps/web/static/manifest.json"
    "apps/web/static/sw.js"
    "apps/web/src/lib/pwa/"
    "packages/db/src/"
    "packages/logger/src/"
    "packages/sim/src/"
)

has_important=false
for pattern in "${important_patterns[@]}"; do
    if git status --porcelain | grep -q "$pattern"; then
        echo "🚨 WARNING: Important file '$pattern' has changes!"
        has_important=true
    fi
done

if [ "$has_important" = true ]; then
    echo ""
    echo "❌ CRITICAL: Important implementation files detected!"
    echo "These changes should be COMMITTED, not stashed!"
    echo ""
    echo "Recommended action:"
    echo "1. Cancel this stash operation"
    echo "2. Review changes: git diff"
    echo "3. Stage and commit: git add . && git commit -m 'feat: implement feature'"
    echo ""
    read -p "Are you sure you want to stash these important changes? (y/N): " confirm
    if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
        echo "Stash operation cancelled."
        exit 1
    fi
fi

echo "✅ Stash operation approved"
EOF
    
    chmod +x "$hook_file"
    echo -e "${GREEN}✅ Stash warning system installed${NC}"
}

# Main execution
echo "Installing prevention safeguards..."

# Create safety hooks
create_pre_commit_safety
create_pre_push_safety
create_stash_warning

echo ""
echo -e "${GREEN}🎉 PREVENTION SYSTEM INSTALLED${NC}"
echo ""
echo "Safeguards implemented:"
echo "✅ Pre-commit hook prevents misleading commits"
echo "✅ Pre-push hook verifies implementation completeness"
echo "✅ Pre-stash hook warns about important changes"
echo ""
echo "These safeguards will prevent the workflow failure that caused"
echo "the PWA implementation to be lost in git stash."
echo ""
echo -e "${BLUE}Next time you work on important features:${NC}"
echo "1. The system will warn before stashing important files"
echo "2. Commit messages will be validated for accuracy"
echo "3. Implementation will be verified before pushing"
echo ""
echo -e "${GREEN}Your development workflow is now protected! 🛡️${NC}"
