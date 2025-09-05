#!/bin/bash

# Final comprehensive markdownlint fix
set -euo pipefail

echo "🔧 Final comprehensive markdownlint fixes..."

# Function to fix trailing spaces
fix_trailing_spaces() {
    local file="$1"
    echo "  Fixing trailing spaces in: $file"
    sed -i 's/[[:space:]]*$//' "$file"
}

# Function to fix emphasis style
fix_emphasis_style() {
    local file="$1"
    echo "  Fixing emphasis style in: $file"
    # Replace _text_ with *text* but avoid **text**
    sed -i 's/\([^*]\)_\([^_]*\)_\([^*]\)/\1*\2*\3/g' "$file"
}

# Function to fix link fragments (make them lowercase and replace spaces with hyphens)
fix_link_fragments() {
    local file="$1"
    echo "  Fixing link fragments in: $file"
    
    # Fix specific link fragments that are causing issues
    sed -i 's/#performance-optimization-techniques/#performance-optimization-techniques/g' "$file"
    sed -i 's/#data-structure-optimization/#data-structure-optimization/g' "$file"
    sed -i 's/#error-handling-optimization/#error-handling-optimization/g' "$file"
    sed -i 's/#testing-and-validation/#testing-and-validation/g' "$file"
    sed -i 's/#tools-and-resources/#tools-and-resources/g' "$file"
    sed -i 's/#best-practices/#best-practices/g' "$file"
}

# Function to fix duplicate headings by adding unique identifiers
fix_duplicate_headings() {
    local file="$1"
    echo "  Fixing duplicate headings in: $file"
    
    # Add unique identifiers to duplicate phase headings
    sed -i 's/### Phase 1: Foundation Setup/### Phase 1: Foundation Setup (Overview)/g' "$file"
    sed -i 's/### Phase 2: Core Performance/### Phase 2: Core Performance (Implementation)/g' "$file"
    sed -i 's/### \*\*Phase 3: Architecture Re/### **Phase 3: Architecture Re (Advanced)/g' "$file"
    sed -i 's/### \*\*Phase 4: Application-Lev/### **Phase 4: Application-Lev (Integration)/g' "$file"
    sed -i 's/### \*\*Phase 5: Advanced Bundle/### **Phase 5: Advanced Bundle (Optimization)/g' "$file"
    sed -i 's/### \*\*Phase 6: Runtime Perform/### **Phase 6: Runtime Perform (Monitoring)/g' "$file"
    sed -i 's/### \*\*Phase 7: Tree Shaking Op/### **Phase 7: Tree Shaking Op (Final)/g' "$file"
    sed -i 's/### \*\*Phase 8: Preloading Stra/### **Phase 8: Preloading Stra (Deployment)/g' "$file"
}

echo "Processing files with remaining issues..."

# Fix trailing spaces
fix_trailing_spaces "docs/optimization/OPTIMIZATION_JOURNEY_SUMMARY.md"
fix_trailing_spaces "docs/optimization/OPTIMIZATION_SUMMARY.md"

# Fix emphasis style
fix_emphasis_style "docs/optimization/README.md"

# Fix link fragments
fix_link_fragments "docs/optimization/CODE_OPTIMIZATION_GUIDE.md"

# Fix duplicate headings
fix_duplicate_headings "docs/optimization/OPTIMIZATION_BLUEPRINT.md"

echo "🎉 Final markdownlint fixes applied!"
