#!/bin/bash

# Test Debugging Automation Script
# This script helps identify and fix failing tests systematically

set -e  # Exit on any error

echo "🔍 Debugging Failing Tests..."

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

# 1. Run tests to identify failures
echo -e "${BLUE}🔍 Step 1: Running tests to identify failures...${NC}"
echo "Running: pnpm run test:all"
pnpm run test:all 2>&1 | tee test-output.log

# 2. Extract failing test information
echo -e "${BLUE}🔍 Step 2: Analyzing test failures...${NC}"

# Count total tests and failures
TOTAL_TESTS=$(grep -o "Tests [0-9]* failed" test-output.log | grep -o "[0-9]*" | head -1 || echo "0")
FAILED_TESTS=$(grep -o "[0-9]* failed" test-output.log | grep -o "[0-9]*" | head -1 || echo "0")

echo "📊 Test Summary:"
echo "  - Total tests: $(grep -o "Tests [0-9]* passed" test-output.log | grep -o "[0-9]*" | head -1 || echo "0")"
echo "  - Failed tests: $FAILED_TESTS"

if [ "$FAILED_TESTS" -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests are passing!${NC}"
    exit 0
fi

# 3. Identify specific failing tests
echo -e "${BLUE}🔍 Step 3: Identifying specific failing tests...${NC}"

# Extract failing test names
echo "❌ Failing tests:"
grep -E "✗|FAIL|Error:" test-output.log | head -10

# 4. Run specific test files to isolate issues
echo -e "${BLUE}🔍 Step 4: Running Soul Forging tests specifically...${NC}"

# Check if Soul Forging tests exist
if [ -f "tests/economy/soul-forging.test.ts" ]; then
    echo "Running Soul Forging tests:"
    pnpm run test:vitest tests/economy/soul-forging.test.ts 2>&1 | tee soul-forging-test-output.log
    
    # Extract specific failures
    echo -e "${YELLOW}📋 Soul Forging Test Failures:${NC}"
    grep -E "✗|FAIL|Error:|AssertionError" soul-forging-test-output.log || echo "No specific failures found in Soul Forging tests"
else
    echo -e "${YELLOW}⚠️  Soul Forging test file not found${NC}"
fi

# 5. Check for common test failure patterns
echo -e "${BLUE}🔍 Step 5: Checking for common failure patterns...${NC}"

# Check for assertion errors
ASSERTION_ERRORS=$(grep -c "AssertionError" test-output.log || echo "0")
echo "Assertion errors: $ASSERTION_ERRORS"

# Check for timeout errors
TIMEOUT_ERRORS=$(grep -c "timeout" test-output.log || echo "0")
echo "Timeout errors: $TIMEOUT_ERRORS"

# Check for import/module errors
IMPORT_ERRORS=$(grep -c "Cannot find module\|Module not found" test-output.log || echo "0")
echo "Import/module errors: $IMPORT_ERRORS"

# Check for type errors
TYPE_ERRORS=$(grep -c "TypeError\|Type error" test-output.log || echo "0")
echo "Type errors: $TYPE_ERRORS"

# 6. Generate debugging report
echo -e "${BLUE}🔍 Step 6: Generating debugging report...${NC}"

cat > test-debug-report.md << EOF
# Test Debugging Report
Generated: $(date)

## Summary
- Total tests: $(grep -o "Tests [0-9]* passed" test-output.log | grep -o "[0-9]*" | head -1 || echo "0")
- Failed tests: $FAILED_TESTS
- Assertion errors: $ASSERTION_ERRORS
- Timeout errors: $TIMEOUT_ERRORS
- Import/module errors: $IMPORT_ERRORS
- Type errors: $TYPE_ERRORS

## Failing Tests
\`\`\`
$(grep -E "✗|FAIL|Error:" test-output.log | head -20)
\`\`\`

## Next Steps
1. Review specific test failures above
2. Check test assertions and expectations
3. Verify test data and mocks
4. Run individual test files to isolate issues
5. Fix failing tests one by one

## Commands to Run
\`\`\`bash
# Run specific test file
pnpm run test:vitest tests/economy/soul-forging.test.ts

# Run with verbose output
pnpm run test:vitest --reporter=verbose

# Run single test
pnpm run test:vitest --run tests/economy/soul-forging.test.ts -t "test name"
\`\`\`
EOF

echo -e "${GREEN}📄 Debug report generated: test-debug-report.md${NC}"

# 7. Provide next steps
echo -e "${BLUE}🔍 Step 7: Next steps for fixing tests...${NC}"

echo ""
echo -e "${YELLOW}📋 Recommended Actions:${NC}"
echo "1. Review the failing tests in the output above"
echo "2. Check test-debug-report.md for detailed analysis"
echo "3. Run individual test files to isolate issues:"
echo "   pnpm run test:vitest tests/economy/soul-forging.test.ts"
echo "4. Fix failing assertions and test logic"
echo "5. Re-run tests to verify fixes"
echo ""

# 8. Clean up temporary files
echo -e "${BLUE}🧹 Cleaning up temporary files...${NC}"
# Keep the log files for analysis
echo "Log files kept for analysis:"
echo "  - test-output.log"
echo "  - soul-forging-test-output.log"
echo "  - test-debug-report.md"

echo ""
echo -e "${GREEN}🎯 Test debugging analysis complete!${NC}"
echo -e "${YELLOW}Next: Review the failing tests and fix them systematically${NC}"
