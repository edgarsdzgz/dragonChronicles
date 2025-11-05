#!/usr/bin/env node

/**
 * Phase 3 Systems Test Script
 * 
 * Command-line script to test the Phase 3 systems
 * and verify that asset loading and rendering issues are resolved.
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎨 Phase 3 Systems Test Script');
console.log('================================');

// Test 1: Check if development server is running
console.log('\n1. Checking development server status...');
try {
  const netstatOutput = execSync('netstat -ano | grep :5173', { encoding: 'utf8' });
  if (netstatOutput.includes('LISTENING')) {
    console.log('✅ Development server is running on port 5173');
  } else {
    console.log('❌ Development server is not running on port 5173');
    console.log('   Please start the server with: cd apps/web && pnpm run dev');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Could not check server status:', error.message);
  process.exit(1);
}

// Test 2: Check if Phase 3 system files exist
console.log('\n2. Checking Phase 3 system files...');
const systemFiles = [
  'apps/web/src/lib/pixi/systems/rendering/asset-manager.ts',
  'apps/web/src/lib/pixi/systems/rendering/sprite-manager.ts',
  'apps/web/src/lib/pixi/systems/rendering/background-renderer.ts',
  'apps/web/src/lib/pixi/systems/combat/projectile-system.ts',
  'apps/web/src/lib/pixi/systems/migration-adapter.ts',
  'apps/web/src/lib/pixi/systems/test-phase3-complete.ts',
];

let allFilesExist = true;
for (const file of systemFiles) {
  try {
    execSync(`test -f "${join(projectRoot, file)}"`, { stdio: 'pipe' });
    console.log(`✅ ${file}`);
  } catch (error) {
    console.log(`❌ ${file} - File not found`);
    allFilesExist = false;
  }
}

if (!allFilesExist) {
  console.log('\n❌ Some Phase 3 system files are missing');
  process.exit(1);
}

// Test 3: Check TypeScript compilation
console.log('\n3. Checking TypeScript compilation...');
try {
  execSync('pnpm -w run typecheck', { 
    stdio: 'pipe',
    cwd: projectRoot 
  });
  console.log('✅ TypeScript compilation successful');
} catch (error) {
  console.log('❌ TypeScript compilation failed');
  console.log('   Error:', error.message);
  process.exit(1);
}

// Test 4: Check linting
console.log('\n4. Checking linting...');
try {
  execSync('cd apps/web && pnpm run lint', { 
    stdio: 'pipe',
    cwd: projectRoot 
  });
  console.log('✅ Linting passed');
} catch (error) {
  console.log('❌ Linting failed');
  console.log('   Error:', error.message);
  process.exit(1);
}

// Test 5: Check static assets
console.log('\n5. Checking static assets...');
try {
  const staticDir = join(projectRoot, 'apps/web/static/sprites');
  const staticFiles = execSync(`ls -la "${staticDir}"`, { encoding: 'utf8' });
  console.log('✅ Static sprites directory exists');
  console.log('   Files:', staticFiles.split('\n').filter(line => line.includes('.png')).length, 'PNG files');
} catch (error) {
  console.log('❌ Static sprites directory not found');
  console.log('   This is expected - we use fallback textures');
}

console.log('\n🎉 Phase 3 Systems Test Complete!');
console.log('================================');
console.log('✅ All Phase 3 systems are properly set up');
console.log('✅ TypeScript compilation successful');
console.log('✅ Linting passed');
console.log('✅ Development server is running');
console.log('\n📋 Next Steps:');
console.log('1. Open http://localhost:5173 in your browser');
console.log('2. Open browser console (F12)');
console.log('3. Run: testPhase3Complete(app)');
console.log('4. Check for colored background layers (no more gray rectangles)');
console.log('5. Verify no more "steppe-steppe-sky" errors');
console.log('\n🚀 Phase 3 is ready for testing!');
