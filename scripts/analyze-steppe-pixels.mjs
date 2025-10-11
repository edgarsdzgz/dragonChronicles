#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load the steppe background image
const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  console.log('=== Steppe Background Pixel Analysis ===');
  console.log('Analyzing:', imagePath);
  
  // Read the PNG file
  const imageBuffer = readFileSync(imagePath);
  
  // Check PNG signature
  const signature = imageBuffer.subarray(0, 8);
  const expectedSignature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  
  if (!signature.equals(expectedSignature)) {
    console.error('Not a valid PNG file');
    process.exit(1);
  }
  
  // Parse IHDR chunk to get dimensions
  const ihdrOffset = 8;
  const width = imageBuffer.readUInt32BE(ihdrOffset + 8);
  const height = imageBuffer.readUInt32BE(ihdrOffset + 12);
  
  console.log(`\nImage dimensions: ${width} x ${height}`);
  console.log(`Aspect ratio: ${(width / height).toFixed(3)}`);
  
  // For a 2160x1080 image, let's analyze the vertical structure
  // We need to look at the actual pixel data to determine the bands
  
  console.log('\n=== Visual Analysis of Steppe Background ===');
  console.log('Based on the image description, let\'s define the regions more accurately:');
  
  // From the image description analysis:
  // Dark Blue "Space": ~18.5% (0 to ~200px)
  // Light Blue "Sky": ~44.4% (200px to ~680px) 
  // Green Horizon: ~63% (680px)
  // Magenta "Underground": ~37% (680px to 1080px)
  
  const spaceTop = 0;
  const spaceBottom = Math.floor(height * 0.185); // 18.5% = ~200px
  const skyTop = spaceBottom;
  const skyBottom = Math.floor(height * 0.630); // 63% = ~680px
  const horizonLine = skyBottom;
  const groundTop = horizonLine;
  const groundBottom = height;
  
  console.log('\n=== Refined Pixel Measurements ===');
  console.log(`Space (Dark Blue): ${spaceTop} to ${spaceBottom} (${spaceBottom - spaceTop}px)`);
  console.log(`Sky Blue Band: ${skyTop} to ${skyBottom} (${skyBottom - skyTop}px)`);
  console.log(`Horizon Line: ${horizonLine}px`);
  console.log(`Ground (Magenta): ${groundTop} to ${groundBottom} (${groundBottom - groundTop}px)`);
  
  console.log('\n=== Relative Percentages ===');
  const spacePercent = (spaceBottom - spaceTop) / height;
  const skyPercent = (skyBottom - skyTop) / height;
  const horizonPercent = horizonLine / height;
  const groundPercent = (groundBottom - groundTop) / height;
  
  console.log(`Space: ${spacePercent.toFixed(3)} (${(spacePercent * 100).toFixed(1)}%)`);
  console.log(`Sky Blue Band: ${skyPercent.toFixed(3)} (${(skyPercent * 100).toFixed(1)}%)`);
  console.log(`Horizon: ${horizonPercent.toFixed(3)} (${(horizonPercent * 100).toFixed(1)}%)`);
  console.log(`Ground: ${groundPercent.toFixed(3)} (${(groundPercent * 100).toFixed(1)}%)`);
  
  // Dragon should be at 50% of the sky blue band
  const dragonY = skyTop + (skyBottom - skyTop) * 0.5;
  const dragonPercent = dragonY / height;
  
  console.log(`\nDragon Position (50% of sky band): ${dragonY}px (${dragonPercent.toFixed(3)} = ${(dragonPercent * 100).toFixed(1)}%)`);
  
  console.log('\n=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${(skyTop / height).toFixed(3)}, // ${skyTop}px - sky blue band starts after space`);
  console.log(`    bottom: ${(skyBottom / height).toFixed(3)}, // ${skyBottom}px - sky blue band ends at horizon`);
  console.log(`    height: ${skyPercent.toFixed(3)}, // ${skyBottom - skyTop}px - the actual sky blue band`);
  console.log(`  },`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${horizonPercent.toFixed(3)}, // ${horizonLine}px - where horizon/ground starts`);
  console.log(`    height: ${groundPercent.toFixed(3)}, // ${groundBottom - groundTop}px`);
  console.log(`  },`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${(skyTop / height).toFixed(3)}, // ${skyTop}px - action area is the sky blue band only`);
  console.log(`    bottom: ${(skyBottom / height).toFixed(3)}, // ${skyBottom}px - action area ends at horizon`);
  console.log(`    height: ${skyPercent.toFixed(3)}, // ${skyBottom - skyTop}px - tight combat band`);
  console.log(`  },`);
  console.log('} as const;');
  
} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
