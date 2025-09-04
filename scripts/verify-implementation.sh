#!/bin/bash

# W6 PWA Implementation Verification Script
# This script MUST pass before any commit claiming PWA implementation

set -e

echo "🔍 W6 PWA Implementation Verification"
echo "======================================"

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Verification counters
TOTAL_CHECKS=0
PASSED_CHECKS=0
FAILED_CHECKS=0

# Function to run a check
check() {
    local description="$1"
    local command="$2"
    local expected_result="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking: $description... "
    
    if eval "$command" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ PASS${NC}"
        PASSED_CHECKS=$((PASSED_CHECKS + 1))
    else
        echo -e "${RED}❌ FAIL${NC}"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
        if [ -n "$expected_result" ]; then
            echo "  Expected: $expected_result"
        fi
    fi
}

# Function to check file exists and has minimum lines
check_file() {
    local file="$1"
    local min_lines="$2"
    local description="$3"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking: $description... "
    
    if [ -f "$file" ]; then
        local lines=$(wc -l < "$file")
        if [ "$lines" -ge "$min_lines" ]; then
            echo -e "${GREEN}✅ PASS${NC} ($lines lines)"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${RED}❌ FAIL${NC} (only $lines lines, expected $min_lines+)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (file not found)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

# Function to check JSON validity
check_json() {
    local file="$1"
    local description="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo -n "Checking: $description... "
    
    if [ -f "$file" ]; then
        if jq empty "$file" >/dev/null 2>&1; then
            echo -e "${GREEN}✅ PASS${NC} (valid JSON)"
            PASSED_CHECKS=$((PASSED_CHECKS + 1))
        else
            echo -e "${RED}❌ FAIL${NC} (invalid JSON)"
            FAILED_CHECKS=$((FAILED_CHECKS + 1))
        fi
    else
        echo -e "${RED}❌ FAIL${NC} (file not found)"
        FAILED_CHECKS=$((FAILED_CHECKS + 1))
    fi
}

echo ""
echo "📁 Core PWA Files Verification"
echo "------------------------------"

# Check core PWA files with expected line counts
check_file "apps/web/static/manifest.json" 107 "PWA manifest file"
check_file "apps/web/static/sw.js" 193 "Service worker file"
check_file "apps/web/src/lib/pwa/InstallPrompt.svelte" 224 "Install prompt component"
check_file "apps/web/src/lib/pwa/UpdateToast.svelte" 226 "Update toast component"
check_file "apps/web/src/lib/pwa/update-manager.ts" 167 "Update manager service"
check_file "apps/web/scripts/generate-icons.mjs" 108 "Icon generation script"

echo ""
echo "🎨 PWA Icons Verification"
echo "-------------------------"

# Check all required icon files
check "[ -f 'apps/web/static/icons/icon-72.png' ]" "72x72 icon"
check "[ -f 'apps/web/static/icons/icon-96.png' ]" "96x96 icon"
check "[ -f 'apps/web/static/icons/icon-128.png' ]" "128x128 icon"
check "[ -f 'apps/web/static/icons/icon-144.png' ]" "144x144 icon"
check "[ -f 'apps/web/static/icons/icon-152.png' ]" "152x152 icon"
check "[ -f 'apps/web/static/icons/icon-192.png' ]" "192x192 icon"
check "[ -f 'apps/web/static/icons/icon-192-maskable.png' ]" "192x192 maskable icon"
check "[ -f 'apps/web/static/icons/icon-384.png' ]" "384x384 icon"
check "[ -f 'apps/web/static/icons/icon-512.png' ]" "512x512 icon"
check "[ -f 'apps/web/static/icons/icon-512-maskable.png' ]" "512x512 maskable icon"

echo ""
echo "📋 PWA Manifest Validation"
echo "--------------------------"

# Check manifest.json validity and required fields
check_json "apps/web/static/manifest.json" "Manifest JSON validity"

# Check required manifest fields
check "jq -e '.name' apps/web/static/manifest.json >/dev/null" "Manifest has name"
check "jq -e '.short_name' apps/web/static/manifest.json >/dev/null" "Manifest has short_name"
check "jq -e '.start_url' apps/web/static/manifest.json >/dev/null" "Manifest has start_url"
check "jq -e '.display' apps/web/static/manifest.json >/dev/null" "Manifest has display"
check "jq -e '.background_color' apps/web/static/manifest.json >/dev/null" "Manifest has background_color"
check "jq -e '.theme_color' apps/web/static/manifest.json >/dev/null" "Manifest has theme_color"
check "jq -e '.icons' apps/web/static/manifest.json >/dev/null" "Manifest has icons array"

echo ""
echo "🔧 Build Configuration Verification"
echo "-----------------------------------"

# Check package.json has Workbox dependencies
check "grep -q 'workbox' apps/web/package.json" "Package.json includes Workbox dependencies"

# Check build configurations are updated
check "grep -q 'process.env.NODE_ENV' apps/web/vite.config.ts" "Vite config includes environment variables"

echo ""
echo "🧪 Integration Verification"
echo "---------------------------"

# Check PWA components are imported in layout
check "grep -q 'UpdateToast' apps/web/src/routes/+layout.svelte" "Layout imports UpdateToast"
check "grep -q 'InstallPrompt' apps/web/src/routes/+layout.svelte" "Layout imports InstallPrompt"

echo ""
echo "📊 Verification Summary"
echo "======================"
echo "Total checks: $TOTAL_CHECKS"
echo -e "Passed: ${GREEN}$PASSED_CHECKS${NC}"
echo -e "Failed: ${RED}$FAILED_CHECKS${NC}"

if [ $FAILED_CHECKS -eq 0 ]; then
    echo -e "\n${GREEN}🎉 ALL VERIFICATIONS PASSED!${NC}"
    echo -e "${GREEN}PWA implementation is complete and ready for commit.${NC}"
    exit 0
else
    echo -e "\n${RED}❌ VERIFICATION FAILED!${NC}"
    echo -e "${RED}$FAILED_CHECKS checks failed. Fix issues before committing.${NC}"
    exit 1
fi
