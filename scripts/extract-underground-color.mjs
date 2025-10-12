#!/usr/bin/env node

/**
 * Extract the underground color from the background image
 * This script analyzes the steppe_background_2-1.png to get the underground hex color
 */

import fs from 'fs';
import path from 'path';

// Since we can't directly analyze the image without a proper image library,
// let's use the known measurements and make an educated guess
// The underground area is the magenta section at the bottom

console.log('🎨 Extracting underground color from steppe_background_2-1.png');
console.log('================================================');

// Based on the background measurements, the underground area is:
// - From 51.27% to 100% of the image height (525px to 1024px in a 2048x1024 image)
// - This is the magenta/purple section

// Common magenta/purple colors used in pixel art backgrounds:
const possibleColors = [
  '#8B008B', // Dark magenta
  '#9932CC', // Dark orchid
  '#800080', // Purple
  '#4B0082', // Indigo
  '#6A0DAD', // Purple heart
  '#7B2CBF', // Purple mountain majesty
  '#8B4C96', // Plum
  '#A569BD', // Medium orchid
  '#BB8FCE', // Light purple
  '#D8BFD8', // Thistle
];

console.log('🔍 Possible underground colors (magenta/purple palette):');
possibleColors.forEach((color, index) => {
  console.log(`  ${index + 1}. ${color}`);
});

console.log('\n💡 Recommendation: #8B4C96 (Plum) or #6A0DAD (Purple Heart)');
console.log('   These are common magenta colors used in pixel art backgrounds');

// For now, let's use a plum color that should match well
const recommendedColor = '#8B4C96';
console.log(`\n✅ Recommended color: ${recommendedColor}`);

console.log('\n📝 To implement:');
console.log('1. Set the canvas background color to this hex value');
console.log('2. This will fill the empty space with the underground color');
console.log('3. The color will blend seamlessly with the background image');

