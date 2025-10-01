#!/bin/bash

# Pre-PR Validation Script
# This script runs all necessary checks before creating a PR to prevent CI failures

set -e  # Exit on any error

echo "🔍 Running Pre-PR Validation..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Function to run command and check result
run_check() {
    local description="$1"
    local command="$2"
    
    echo -e "${YELLOW}🔧 $description...${NC}"
    
    if eval "$command" > /dev/null 2>&1; then
        print_status 0 "$description"
    else
        print_status 1 "$description"
        echo "Command failed: $command"
        return 1
    fi
}

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Not in project root directory${NC}"
    exit 1
fi

echo "📁 Working in: $(pwd)"

# 1. TypeScript compilation check
run_check "TypeScript compilation" "pnpm run typecheck"

# 2. ESLint check
run_check "ESLint validation" "pnpm run lint"

# 3. Prettier format check
run_check "Prettier formatting" "pnpm run format --check"

# 4. Run all tests
run_check "All tests passing" "pnpm run test:all"

# 5. Build check
run_check "Project build" "pnpm run build:ci"

# 6. Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    echo "Uncommitted files:"
    git status --porcelain
    echo ""
    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborting due to uncommitted changes${NC}"
        exit 1
    fi
fi

# 7. Check if we're on a feature branch
current_branch=$(git branch --show-current)
if [[ "$current_branch" == "main" || "$current_branch" == "master" ]]; then
    echo -e "${RED}❌ You are on the main branch! Create a feature branch first.${NC}"
    exit 1
fi

# 8. Check if branch is up to date with main
echo -e "${YELLOW}🔧 Checking if branch is up to date with main...${NC}"
git fetch origin main
if ! git merge-base --is-ancestor origin/main HEAD; then
    echo -e "${YELLOW}⚠️  Your branch is not up to date with main${NC}"
    echo "Consider running: git rebase origin/main"
fi

# 9. Check for common issues
echo -e "${YELLOW}🔧 Checking for common issues...${NC}"

# Check for console.log statements
if grep -r "console\.log" packages/ --include="*.ts" --include="*.js" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Found console.log statements in packages:${NC}"
    grep -r "console\.log" packages/ --include="*.ts" --include="*.js"
fi

# Check for TODO/FIXME comments
if grep -r "TODO\|FIXME" packages/ --include="*.ts" --include="*.js" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Found TODO/FIXME comments:${NC}"
    grep -r "TODO\|FIXME" packages/ --include="*.ts" --include="*.js"
fi

# Check for any TypeScript errors
if grep -r "any" packages/ --include="*.ts" > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Found 'any' types (consider using proper types):${NC}"
    grep -r "any" packages/ --include="*.ts" | head -5
fi

echo ""
echo -e "${GREEN}🎉 Pre-PR validation completed successfully!${NC}"
echo -e "${GREEN}✅ Your code is ready for PR creation${NC}"
echo ""
echo "Next steps:"
echo "1. Create your PR: gh pr create --title 'your title' --body 'your description'"
echo "2. Monitor the CI pipeline: gh run list --limit 5"
echo "3. Address any remaining issues if the pipeline fails"
