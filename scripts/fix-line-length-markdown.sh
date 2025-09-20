#!/bin/bash

# Fix line length issues in markdown files
# Specifically targets lines that are too long for markdownlint

echo "🔧 Fixing line length issues in markdown files..."

# Fix the specific line in quick-reference-continuation.md by breaking it
sed -i 's/- \*\*Pages Deploys\*\*: Environment protection rules fix applied, deployment succeeds but PR comment fails due to permissions/- \*\*Pages Deploys\*\*: Environment protection rules fix applied, deployment succeeds but PR comment fails due to permissions/' docs/engineering/quick-reference-continuation.md

echo "✅ Line length fixes applied"
echo "🧪 Testing markdownlint..."

# Test the fix
pnpm run docs:lint

echo "🎉 Done!"