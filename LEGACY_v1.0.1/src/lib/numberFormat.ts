// MVP 1.1 Principal Engineer Implementation - Number Formatting System per CTO Spec §1.3
import { Decimal } from '$lib/num/decimal';

/**
 * Global number formatter implementing CTO spec requirements:
 * - 8-character limit (excluding unit labels)
 * - Plain: ≤9,999.99 with thousands separators
 * - Scientific: 1e4...1e100 → m.meE format
 * - Double-E: >1e100 → m.meE format
 */
export function formatDecimal(value: Decimal | number | string): string {
  const dec = new Decimal(value);
  
  // Handle special cases
  if (!dec.isFinite()) return dec.toString();
  if (dec.eq(0)) return '0';
  if (dec.lt(0)) return '-' + formatDecimal(dec.abs());
  
  // Plain format: ≤9,999.99
  if (dec.lt(10000)) {
    return dec.toFixed(2)
      .replace(/\.?0+$/, '') // trim trailing zeros
      .replace(/\B(?=(\d{3})+(?!\d))/g, ','); // thousands separators
  }
  
  // Scientific format: 1e4...1e100
  if (dec.lt('1e101')) {
    const mantissa = dec.div(Decimal.pow(10, dec.log10().floor()));
    const exponent = dec.log10().floor().toNumber();
    return `${mantissa.toFixed(2)}e${exponent}`;
  }
  
  // Double-E format: >1e100
  const log10 = dec.log10();
  const eeExponent = log10.log10().floor();
  const eeMantissa = log10.div(Decimal.pow(10, eeExponent));
  
  return `${eeMantissa.toFixed(2)}ee${eeExponent.toNumber()}`;
}

/**
 * Distance-specific formatter with km suffix and 2 decimal places
 */
export function formatDistance(kilometers: Decimal | number | string): string {
  const dec = new Decimal(kilometers);
  if (dec.lt(10000)) {
    return dec.toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' km';
  }
  return formatDecimal(dec) + ' km';
}

/**
 * Consistent ETA formatting for tooltips
 */
export function formatETA(seconds: Decimal | number): string {
  const sec = new Decimal(seconds);
  
  if (!sec.isFinite() || sec.lte(0)) return '~—';
  
  const totalSeconds = sec.toNumber();
  
  // Less than 1 day: show HH:MM:SS
  if (totalSeconds < 86400) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  
  // 1+ days: rough units with tilde
  const days = totalSeconds / 86400;
  if (days < 14) return `~${Math.round(days)} Days`;
  
  const weeks = days / 7;
  if (weeks < 8) return `~${Math.round(weeks)} Weeks`;
  
  const months = days / 30.44;
  if (months < 12) return `~${Math.round(months)} Months`;
  
  const years = days / 365.25;
  return `~${Math.round(years)} Years`;
}

/**
 * Unit tests for acceptance criteria per spec
 */
export function runNumberFormatTests(): boolean {
  const tests = [
    [9999.99, '9,999.99'],
    [10000, '1.00e4'],
    [new Decimal('1e100'), '1.00e100'],
    [new Decimal('1e101'), '1.00ee2'],
    [new Decimal('1e308'), '1.00ee3'],
  ];
  
  let allPassed = true;
  
  for (const [input, expected] of tests) {
    const result = formatDecimal(input);
    const passed = result === expected;
    
    if (!passed) {
      console.error(`Test failed: formatDecimal(${input}) = "${result}", expected "${expected}"`);
      allPassed = false;
    }
    
    // Check 8-character limit (excluding unit suffixes)
    const withoutUnits = result.replace(/ (km|sec|%|Arcana)$/, '');
    if (withoutUnits.length > 8) {
      console.error(`Length test failed: "${withoutUnits}" is ${withoutUnits.length} chars, max 8`);
      allPassed = false;
    }
  }
  
  return allPassed;
}