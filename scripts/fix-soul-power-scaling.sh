#!/bin/bash

# Fix Soul Power Scaling Issues Script
# This script systematically fixes the Soul Power scaling calculation issues

set -e  # Exit on any error

echo "🔧 Fixing Soul Power Scaling Issues..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

echo -e "${BLUE}🔍 Step 1: Analyzing Soul Power scaling issues...${NC}"

# Check the current Soul Power scaling implementation
echo "📁 Checking Soul Power scaling files:"
ls -la packages/sim/src/economy/soul-power-*.ts

echo ""
echo -e "${BLUE}🔍 Step 2: Examining the failing test expectations...${NC}"

# The issues are:
# 1. finalChance should be > baseChance (0.03)
# 2. finalAmount should be > baseAmount (2) for distance scaling
# 3. finalAmount should be > baseAmount (2) for ward scaling  
# 4. averageScalingFactor should be > 1.0

echo "❌ Current Issues:"
echo "  - finalChance = baseChance (no scaling applied)"
echo "  - finalAmount = baseAmount (no scaling applied)"
echo "  - averageScalingFactor = 1.0 (no scaling applied)"

echo ""
echo -e "${BLUE}🔍 Step 3: Checking Soul Power scaling implementation...${NC}"

# Let's examine the Soul Power scaling logic
echo "📄 Soul Power scaling factors:"
if [ -f "packages/sim/src/economy/soul-power-scaling.ts" ]; then
    echo "✅ Soul Power scaling file exists"
    
    # Check the scaling factors
    echo "🔍 Current scaling factors:"
    grep -n "distanceScalingFactor\|wardScalingFactor" packages/sim/src/economy/soul-power-scaling.ts || echo "No scaling factors found"
    
    # Check the calculation methods
    echo "🔍 Scaling calculation methods:"
    grep -n "calculateDistanceScaling\|calculateWardScaling\|calculateTotalScaling" packages/sim/src/economy/soul-power-scaling.ts || echo "No calculation methods found"
else
    echo "❌ Soul Power scaling file not found"
fi

echo ""
echo -e "${BLUE}🔍 Step 4: Checking Soul Power drop manager...${NC}"

if [ -f "packages/sim/src/economy/soul-power-drop-manager.ts" ]; then
    echo "✅ Soul Power drop manager exists"
    
    # Check how scaling is applied
    echo "🔍 Scaling application in drop manager:"
    grep -n "scaling\|finalChance\|finalAmount" packages/sim/src/economy/soul-power-drop-manager.ts || echo "No scaling application found"
else
    echo "❌ Soul Power drop manager not found"
fi

echo ""
echo -e "${BLUE}🔍 Step 5: Running specific failing tests to see exact values...${NC}"

# Run the specific failing test to see the actual values
echo "🧪 Running Soul Power drop tests to see actual values:"
pnpm run test:vitest tests/economy/soul-power-drop.test.ts --reporter=verbose 2>&1 | grep -A 5 -B 5 "expected.*to be greater" || echo "No specific error details found"

echo ""
echo -e "${YELLOW}📋 Analysis Summary:${NC}"
echo "The issue is that Soul Power scaling is not being applied correctly."
echo "The tests expect:"
echo "  - finalChance > baseChance (scaling should increase chance)"
echo "  - finalAmount > baseAmount (scaling should increase amount)"
echo "  - averageScalingFactor > 1.0 (scaling should be > 1.0)"
echo ""
echo "But we're getting:"
echo "  - finalChance = baseChance (no scaling)"
echo "  - finalAmount = baseAmount (no scaling)"
echo "  - averageScalingFactor = 1.0 (no scaling)"

echo ""
echo -e "${BLUE}🔍 Step 6: Next steps to fix the issues...${NC}"
echo "1. Check if scaling factors are being applied in the drop calculation"
echo "2. Verify the scaling calculation methods are working correctly"
echo "3. Ensure the drop manager is using the scaling results"
echo "4. Test the fixes with the failing tests"

echo ""
echo -e "${GREEN}🎯 Soul Power scaling analysis complete!${NC}"
echo -e "${YELLOW}Next: Fix the scaling calculation logic in the Soul Power system${NC}"
