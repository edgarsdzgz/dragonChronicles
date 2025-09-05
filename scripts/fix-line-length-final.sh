#!/bin/bash

# Fix line length issues in markdown files by breaking long lines

echo "🔧 Fixing line length issues in markdown files..."

# Replace the long line with a broken version
sed -i '73c\
- **Pages Deploys**: Environment protection rules fix applied, deployment succeeds but PR comment\
  fails due to permissions' docs/engineering/quick-reference-continuation.md

echo "✅ Line length fixes applied"
echo "🧪 Testing markdownlint..."

# Test the fix
pnpm run docs:lint

echo "🎉 Done!"
