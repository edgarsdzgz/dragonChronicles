#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load and analyze the steppe background image
const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  // Read the PNG file
  const imageBuffer = readFileSync(imagePath);
  
  // For PNG analysis, we need to parse the header
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (imageBuffer.length < 24) {
    console.error('Image file too small to be a valid PNG');
    process.exit(1);
  }
  
  // Check PNG signature
  const signature = imageBuffer.subarray(0, 8);
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  if (!signature.equals(expectedSignature)) {
    console.error('Not a valid PNG file');
    process.exit(1);
  }
  
  // Parse IHDR chunk to get dimensions
  const ihdrOffset = 8;
  const chunkLength = imageBuffer.readUInt32BE(ihdrOffset);
  const chunkType = imageBuffer.subarray(ihdrOffset + 4, ihdrOffset + 8).toString();
  
  if (chunkType !== 'IHDR') {
    console.error('Expected IHDR chunk not found');
    process.exit(1);
  }
  
  const width = imageBuffer.readUInt32BE(ihdrOffset + 8);
  const height = imageBuffer.readUInt32BE(ihdrOffset + 12);
  
  console.log('=== Steppe Background Analysis ===');
  console.log(`Image dimensions: ${width} x ${height}`);
  console.log(`Aspect ratio: ${(width / height).toFixed(3)}`);
  
  // Based on typical steppe backgrounds, estimate the regions:
  // Sky is usually the top 60-70% of the image
  // Horizon/grass line is usually around 60-70% from top
  // Ground is the bottom 30-40%
  
  const skyTop = 0; // Top of image
  const skyBottom = Math.floor(height * 0.65); // Sky ends around 65% down
  const horizonLine = Math.floor(height * 0.65); // Grass/horizon line
  const groundTop = Math.floor(height * 0.65); // Ground starts at horizon
  const groundBottom = height; // Bottom of image
  
  console.log('\n=== Estimated Regions (pixels) ===');
  console.log(`Sky region: ${skyTop} to ${skyBottom} (${skyBottom - skyTop}px tall)`);
  console.log(`Horizon line: ${horizonLine}px from top`);
  console.log(`Ground region: ${groundTop} to ${groundBottom} (${groundBottom - groundTop}px tall)`);
  
  // Convert to relative percentages for our BackgroundPositioning class
  console.log('\n=== Relative Percentages (for BackgroundPositioning) ===');
  console.log(`Sky blue band:`);
  console.log(`  top: ${(skyTop / height).toFixed(3)} (${skyTop / height})`);
  console.log(`  bottom: ${(skyBottom / height).toFixed(3)} (${skyBottom / height})`);
  console.log(`  height: ${((skyBottom - skyTop) / height).toFixed(3)} (${(skyBottom - skyTop) / height})`);
  
  console.log(`\nGround:`);
  console.log(`  horizonLine: ${(horizonLine / height).toFixed(3)} (${horizonLine / height})`);
  console.log(`  height: ${((groundBottom - groundTop) / height).toFixed(3)} (${groundBottom - groundTop} / height)`);
  
  // Action area (sky blue band) - this is where combat should happen
  console.log(`\nAction Area (Sky Blue Band):`);
  console.log(`  top: ${(skyTop / height).toFixed(3)} (${skyTop / height})`);
  console.log(`  bottom: ${(skyBottom / height).toFixed(3)} (${skyBottom / height})`);
  console.log(`  height: ${((skyBottom - skyTop) / height).toFixed(3)} (${skyBottom - skyTop} / height)`);
  
  // Generate the updated BACKGROUND_MEASUREMENTS constant
  console.log('\n=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${(skyTop / height).toFixed(3)},`);
  console.log(`    bottom: ${(skyBottom / height).toFixed(3)},`);
  console.log(`    height: ${((skyBottom - skyTop) / height).toFixed(3)},`);
  console.log(`  },`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${(horizonLine / height).toFixed(3)},`);
  console.log(`    height: ${((groundBottom - groundTop) / height).toFixed(3)},`);
  console.log(`  },`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${(skyTop / height).toFixed(3)},`);
  console.log(`    bottom: ${(skyBottom / height).toFixed(3)},`);
  console.log(`    height: ${((skyBottom - skyTop) / height).toFixed(3)},`);
  console.log(`  },`);
  console.log('} as const;');
  
} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
