#!/usr/bin/env node

/**
 * Architectural Validation Script
 * 
 * This script enforces architectural gates to prevent mini-monolith creation
 * and ensures proper system separation.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Get the list of staged files
const stagedFiles = execSync('git diff --cached --name-only --diff-filter=A', { encoding: 'utf8' })
  .trim()
  .split('\n')
  .filter(file => file && file.endsWith('.ts'));

console.log('🔍 Architectural Validation: Checking staged TypeScript files...');

let hasViolations = false;

for (const file of stagedFiles) {
  if (!existsSync(file)) continue;
  
  console.log(`\n📁 Checking: ${file}`);
  
  const content = readFileSync(file, 'utf8');
  const violations = checkArchitecturalViolations(file, content);
  
  if (violations.length > 0) {
    hasViolations = true;
    console.log(`❌ VIOLATIONS FOUND in ${file}:`);
    violations.forEach(violation => console.log(`   - ${violation}`));
  } else {
    console.log(`✅ ${file} passes architectural validation`);
  }
}

if (hasViolations) {
  console.log('\n🚫 COMMIT BLOCKED: Architectural violations detected');
  console.log('\n📋 To fix these violations:');
  console.log('1. Check if functionality can be added to existing systems');
  console.log('2. Split files with multiple responsibilities');
  console.log('3. Use clear, descriptive names');
  console.log('4. Avoid "phase2", "new", or "updated" in filenames');
  console.log('5. Never create mini-monoliths that coordinate multiple systems');
  process.exit(1);
} else {
  console.log('\n✅ All files pass architectural validation');
}

/**
 * Check for architectural violations in a file
 */
function checkArchitecturalViolations(filePath, content) {
  const violations = [];
  const fileName = path.basename(filePath);
  
  // Check 1: Single Responsibility - look for multiple system imports
  const systemImports = content.match(/import.*from.*systems/g) || [];
  if (systemImports.length > 3) {
    violations.push('Multiple system imports detected - may be a mini-monolith');
  }
  
  // Check 2: Existing System Check - look for duplicate functionality
  if (fileName.includes('phase2') || fileName.includes('new') || fileName.includes('updated')) {
    violations.push('File name suggests duplicate functionality - check existing systems first');
  }
  
  // Check 3: System Integration - look for coordinator patterns
  const coordinatorPatterns = [
    /class.*Manager.*{[\s\S]*new.*Manager/g,
    /class.*System.*{[\s\S]*new.*System/g,
    /createScrollingBackground|createLandManager|createDragonProtagonist/g
  ];
  
  for (const pattern of coordinatorPatterns) {
    if (pattern.test(content)) {
      violations.push('Coordinator pattern detected - may be a mini-monolith');
      break;
    }
  }
  
  // Check 4: Naming Convention - look for unclear names
  if (fileName.includes('scrolling-background') && !fileName.includes('land-manager')) {
    violations.push('Generic "scrolling-background" name - use specific names like "land-manager"');
  }
  
  // Check 5: Mini-Monolith Detection - look for multiple responsibilities
  const responsibilityKeywords = [
    'landManager', 'dragonProtagonist', 'migrationAdapter', 'assetManager',
    'backgroundRenderer', 'healthBarManager', 'floatingDamage'
  ];
  
  const foundResponsibilities = responsibilityKeywords.filter(keyword => 
    content.includes(keyword)
  );
  
  if (foundResponsibilities.length > 2) {
    violations.push(`Multiple responsibilities detected: ${foundResponsibilities.join(', ')}`);
  }
  
  // Check 6: RequestAnimationFrame loops in non-animation files
  if (content.includes('requestAnimationFrame') && !fileName.includes('animator')) {
    violations.push('RequestAnimationFrame loop in non-animation file - consider moving to appropriate system');
  }
  
  return violations;
}
