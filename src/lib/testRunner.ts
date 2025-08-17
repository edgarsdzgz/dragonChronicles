// MVP 1.1 Test Runner - Validate CTO Spec Compliance
import { runNumberFormatTests } from './numberFormat';
import { initializeLevelSystem, getLandForRunDistance, getLevelProgress } from './distanceSystem';
import { calculateEnchantCost, calculateTierUpCost } from './enchantSystem';
import { Decimal } from '$lib/num/decimal';

export async function runAllTests(): Promise<boolean> {
  console.log('🧪 Running MVP 1.1 Compliance Tests...');
  let allPassed = true;
  
  // Number formatting tests per spec acceptance criteria
  console.log('📊 Testing number formatting...');
  const numberTestsPassed = runNumberFormatTests();
  if (numberTestsPassed) {
    console.log('✅ Number formatting tests passed');
  } else {
    console.log('❌ Number formatting tests failed');
    allPassed = false;
  }
  
  // Distance system tests
  console.log('🗺️ Testing distance system...');
  try {
    await initializeLevelSystem();
    
    // Test basic progression
    const level1 = getLandForRunDistance(new Decimal(0.5)); // 0.5km
    const level2 = getLandForRunDistance(new Decimal(2.0)); // 2km
    
    if (level1 !== 1 || level2 !== 2) {
      console.log(`❌ Distance system failed: level1=${level1}, level2=${level2}`);
      allPassed = false;
    } else {
      console.log('✅ Distance system tests passed');
    }
    
    // Test level progress
    const progress = getLevelProgress(new Decimal(0.75)); // 75% of level 1
    if (progress < 0.4 || progress > 0.6) {
      console.log(`❌ Level progress failed: ${progress} (expected ~0.5)`);
      allPassed = false;
    } else {
      console.log('✅ Level progress tests passed');
    }
  } catch (error) {
    console.log('❌ Distance system initialization failed:', error);
    allPassed = false;
  }
  
  // Enchant cost tests per spec
  console.log('⚡ Testing enchant costs...');
  try {
    const cost1 = calculateEnchantCost('firepower', 0); // Level 0→1
    const cost2 = calculateEnchantCost('firepower', 1); // Level 1→2
    const cost50 = calculateEnchantCost('firepower', 49); // Level 49→50
    
    // Verify exponential growth
    if (!cost2.gt(cost1) || !cost50.gt(cost2)) {
      console.log('❌ Enchant costs not growing properly');
      allPassed = false;
    } else {
      console.log('✅ Enchant cost growth tests passed');
    }
    
    // Test tier up cost (3x last level cost)
    const tierUpCost = calculateTierUpCost('firepower', 1); // T1→T2
    const expectedTierCost = calculateEnchantCost('firepower', 49).mul(3); // 3x level 50 cost
    
    if (!tierUpCost.eq(expectedTierCost)) {
      console.log(`❌ Tier up cost mismatch: got ${tierUpCost}, expected ${expectedTierCost}`);
      allPassed = false;
    } else {
      console.log('✅ Tier up cost tests passed');
    }
  } catch (error) {
    console.log('❌ Enchant cost tests failed:', error);
    allPassed = false;
  }
  
  if (allPassed) {
    console.log('🎉 All MVP 1.1 tests passed! System is spec-compliant.');
  } else {
    console.log('💥 Some tests failed. Check implementation against CTO spec.');
  }
  
  return allPassed;
}

// Auto-run tests in development
if (typeof window !== 'undefined' && import.meta.env.DEV) {
  runAllTests();
}