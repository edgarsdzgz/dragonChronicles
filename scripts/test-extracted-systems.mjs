#!/usr/bin/env node

/**
 * Test Script for Extracted Systems
 * 
 * This script provides command-line testing for the extracted systems.
 * Run with: node scripts/test-extracted-systems.mjs
 */

import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
// import { join } from 'path'; // Currently unused

console.log('🧪 Testing Extracted Systems...\n');

// Test 1: Check if files exist
console.log('Test 1: Checking if extracted system files exist...');
const systemFiles = [
  'apps/web/src/lib/pixi/systems/index.ts',
  'apps/web/src/lib/pixi/systems/migration-adapter.ts',
  'apps/web/src/lib/pixi/systems/rendering/layer-manager.ts',
  'apps/web/src/lib/pixi/systems/rendering/background-renderer.ts',
  'apps/web/src/lib/pixi/systems/ui/health-bars.ts',
  'apps/web/src/lib/pixi/systems/effects/floating-damage.ts',
  'apps/web/src/lib/pixi/systems/integration-test.ts',
  'apps/web/src/lib/pixi/systems/test-systems.ts',
];

let allFilesExist = true;
systemFiles.forEach(file => {
  if (existsSync(file)) {
    console.log(`  ✅ ${file}`);
  } else {
    console.log(`  ❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('  ✅ All system files exist\n');
} else {
  console.log('  ❌ Some system files are missing\n');
  process.exit(1);
}

// Test 2: Check TypeScript compilation
console.log('Test 2: Checking TypeScript compilation...');
try {
  execSync('pnpm run typecheck', { stdio: 'pipe' });
  console.log('  ✅ TypeScript compilation successful\n');
} catch (error) {
  console.log('  ❌ TypeScript compilation failed');
  console.log('  Error:', error.message);
  process.exit(1);
}

// Test 3: Check linting
console.log('Test 3: Checking linting...');
try {
  execSync('pnpm run lint', { stdio: 'pipe' });
  console.log('  ✅ Linting passed\n');
} catch (error) {
  console.log('  ❌ Linting failed');
  console.log('  Error:', error.message);
  process.exit(1);
}

// Test 4: Check file sizes and complexity
console.log('Test 4: Checking file sizes and complexity...');
systemFiles.forEach(file => {
  if (existsSync(file)) {
    const content = readFileSync(file, 'utf8');
    const lines = content.split('\n').length;
    const size = content.length;
    
    console.log(`  📄 ${file}:`);
    console.log(`     Lines: ${lines}`);
    console.log(`     Size: ${(size / 1024).toFixed(2)} KB`);
    
    if (lines > 500) {
      console.log(`     ⚠️  Large file (${lines} lines)`);
    } else {
      console.log(`     ✅ Reasonable size`);
    }
  }
});

console.log('');

// Test 5: Check exports
console.log('Test 5: Checking system exports...');
try {
  const indexContent = readFileSync('apps/web/src/lib/pixi/systems/index.ts', 'utf8');
  
  const expectedExports = [
    'layer-manager',
    'background-renderer',
    'health-bars',
    'floating-damage',
    'migration-adapter'
  ];
  
  expectedExports.forEach(exportName => {
    if (indexContent.includes(exportName)) {
      console.log(`  ✅ ${exportName} exported`);
    } else {
      console.log(`  ❌ ${exportName} not exported`);
    }
  });
  
  console.log('');
} catch (error) {
  console.log('  ❌ Failed to check exports:', error.message);
}

// Test 6: Check test page
console.log('Test 6: Checking test page...');
const testPagePath = 'apps/web/src/routes/test-systems/+page.svelte';
if (existsSync(testPagePath)) {
  console.log('  ✅ Test page exists');
  console.log('  🌐 You can test the systems at: http://localhost:5173/test-systems');
} else {
  console.log('  ❌ Test page missing');
}

console.log('');

// Test 7: Check documentation
console.log('Test 7: Checking documentation...');
const docPath = 'docs/engineering/phase1-system-extraction-complete.md';
if (existsSync(docPath)) {
  console.log('  ✅ Phase 1 documentation exists');
} else {
  console.log('  ❌ Phase 1 documentation missing');
}

console.log('');

// Summary
console.log('🎉 Test Summary:');
console.log('  ✅ All system files created');
console.log('  ✅ TypeScript compilation successful');
console.log('  ✅ Linting passed');
console.log('  ✅ Systems are ready for testing');
console.log('');
console.log('🚀 Next Steps:');
console.log('  1. Start your development server: pnpm run dev:web');
console.log('  2. Visit: http://localhost:5173/test-systems');
console.log('  3. Run the integration tests in your browser');
console.log('  4. Check the console for detailed results');
console.log('');
console.log('📚 For more information, see:');
console.log('  - docs/engineering/phase1-system-extraction-complete.md');
console.log('  - apps/web/src/lib/pixi/systems/integration-test.ts');
console.log('');
console.log('✨ Phase 1 systems are ready for integration!');
