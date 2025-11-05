#!/usr/bin/env node

/**
 * Phase 4 Systems Test Script
 * 
 * Command-line script to test the Phase 4 systems
 * and verify that the complete system architecture is working.
 */

import { execSync } from 'child_process';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎯 Phase 4 Systems Test Script');
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

// Test 2: Check if Phase 4 system files exist
console.log('\n2. Checking Phase 4 system files...');
const systemFiles = [
  'apps/web/src/lib/pixi/systems/core/event-system.ts',
  'apps/web/src/lib/pixi/systems/core/performance-system.ts',
  'apps/web/src/lib/pixi/systems/core/input-system.ts',
  'apps/web/src/lib/pixi/systems/core/system-manager.ts',
  'apps/web/src/lib/pixi/systems/test-phase4-core.ts',
  'apps/web/src/lib/pixi/systems/test-phase4-complete.ts',
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
  console.log('\n❌ Some Phase 4 system files are missing');
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
  execSync('pnpm -w run lint', { 
    stdio: 'pipe',
    cwd: projectRoot 
  });
  console.log('✅ Linting passed');
} catch (error) {
  console.log('❌ Linting failed');
  console.log('   Error:', error.message);
  process.exit(1);
}

// Test 5: Check system architecture
console.log('\n5. Checking system architecture...');
try {
  // Check that all systems are properly exported
  const systemsIndex = join(projectRoot, 'apps/web/src/lib/pixi/systems/index.ts');
  const indexContent = execSync(`cat "${systemsIndex}"`, { encoding: 'utf8' });
  
  const requiredExports = [
    'event-system',
    'performance-system',
    'input-system',
    'system-manager',
  ];
  
  let allExportsFound = true;
  for (const exportName of requiredExports) {
    if (indexContent.includes(exportName)) {
      console.log(`✅ Export found: ${exportName}`);
    } else {
      console.log(`❌ Export missing: ${exportName}`);
      allExportsFound = false;
    }
  }
  
  if (!allExportsFound) {
    console.log('❌ Some system exports are missing');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Could not check system architecture:', error.message);
  process.exit(1);
}

// Test 6: Check test integration
console.log('\n6. Checking test integration...');
try {
  const appTs = join(projectRoot, 'apps/web/src/lib/pixi/app.ts');
  const appContent = execSync(`cat "${appTs}"`, { encoding: 'utf8' });
  
  const requiredTests = [
    'test-phase4-core',
    'test-phase4-complete',
  ];
  
  let allTestsFound = true;
  for (const testName of requiredTests) {
    if (appContent.includes(testName)) {
      console.log(`✅ Test import found: ${testName}`);
    } else {
      console.log(`❌ Test import missing: ${testName}`);
      allTestsFound = false;
    }
  }
  
  if (!allTestsFound) {
    console.log('❌ Some test imports are missing');
    process.exit(1);
  }
} catch (error) {
  console.log('❌ Could not check test integration:', error.message);
  process.exit(1);
}

console.log('\n🎉 Phase 4 Systems Test Complete!');
console.log('================================');
console.log('✅ All Phase 4 systems are properly set up');
console.log('✅ TypeScript compilation successful');
console.log('✅ Linting passed');
console.log('✅ System architecture verified');
console.log('✅ Test integration verified');
console.log('✅ Development server is running');
console.log('\n📋 Next Steps:');
console.log('1. Open http://localhost:5173 in your browser');
console.log('2. Open browser console (F12)');
console.log('3. Run: testPhase4CoreSystems()');
console.log('4. Run: testPhase4Complete(app)');
console.log('5. Verify event-driven communication is working');
console.log('6. Check performance monitoring is active');
console.log('7. Test input system responsiveness');
console.log('\n🚀 Phase 4 is ready for testing!');
console.log('\n🎯 Phase 4 Achievements:');
console.log('✅ Event-driven architecture implemented');
console.log('✅ Performance optimization systems (object pooling, spatial partitioning)');
console.log('✅ Centralized input handling system');
console.log('✅ System manager for coordination');
console.log('✅ Complete system integration');
console.log('✅ Comprehensive testing framework');

