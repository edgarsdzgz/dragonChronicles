#!/bin/bash

# Final Markdown Issues Fixer
# Handles the remaining complex issues

set -euo pipefail

echo "🔧 Final Markdown Issues Fixer..."

# Fix CODE_OPTIMIZATION_GUIDE.md
echo "Fixing CODE_OPTIMIZATION_GUIDE.md..."
sed -i 's/### \*\*Before: O(n) Linear Operations\*\*/### Before: O(n) Linear Operations/' docs/optimization/CODE_OPTIMIZATION_GUIDE.md
sed -i 's/### \*\*After: O(1) Constant Operation\*\*/### After: O(1) Constant Operation/' docs/optimization/CODE_OPTIMIZATION_GUIDE.md
sed -i 's/### \*\*Before: Recursive with Stack O\*\*/### Before: Recursive with Stack O/' docs/optimization/CODE_OPTIMIZATION_GUIDE.md
sed -i 's/### \*\*After: Iterative with Minimal\*\*/### After: Iterative with Minimal/' docs/optimization/CODE_OPTIMIZATION_GUIDE.md

# Fix remaining line length issues
echo "Fixing remaining line length issues..."
./scripts/fix-markdown-simple.sh

# Fix emphasis style in README.md
echo "Fixing emphasis style in README.md..."
sed -i 's/__/\*\*/g' docs/optimization/README.md

# Fix duplicate headings in OPTIMIZATION_BLUEPRINT.md by making them unique
echo "Fixing duplicate headings in OPTIMIZATION_BLUEPRINT.md..."
sed -i 's/### \*\*Phase 1: Foundation Setup\*\*/### Phase 1: Foundation Setup (Overview)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 2: Core Performance\*\*/### Phase 2: Core Performance (Implementation)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 3: Architecture Refactoring\*\*/### Phase 3: Architecture Refactoring (Structure)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 4: Application-Level\*\*/### Phase 4: Application-Level (Components)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 5: Advanced Bundling\*\*/### Phase 5: Advanced Bundling (Optimization)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 6: Runtime Performance\*\*/### Phase 6: Runtime Performance (Execution)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 7: Tree Shaking\*\*/### Phase 7: Tree Shaking (Dead Code)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md
sed -i 's/### \*\*Phase 8: Preloading Strategy\*\*/### Phase 8: Preloading Strategy (Resources)/' docs/optimization/OPTIMIZATION_BLUEPRINT.md

echo "🎉 Final markdown fixes complete!"
