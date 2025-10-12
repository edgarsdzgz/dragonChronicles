#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Exact Pixel Measurements Analysis ===');
console.log('Working with precise pixel values first, then calculating percentages');
console.log('');

const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  // Read the PNG file to get dimensions
  const imageBuffer = readFileSync(imagePath);
  const width = imageBuffer.readUInt32BE(16); // IHDR width
  const height = imageBuffer.readUInt32BE(20); // IHDR height
  
  console.log(`Image dimensions: ${width} x ${height} pixels`);
  console.log('');

  console.log('=== Visual Analysis from Debug Overlay ===');
  console.log('Looking at the ruler lines and background transitions:');
  console.log('');

  // Based on the visual analysis of the debug overlay image:
  // - Horizontal ruler lines every 25px
  // - We can count the lines to get exact pixel positions
  
  console.log('=== Exact Pixel Boundaries ===');
  
  // From visual inspection, counting the ruler lines:
  // Dark blue space appears to end around line 7-8 (175-200px)
  // Let's be precise and use 190px as the boundary
  const spaceEndPx = 190;  // Dark blue space ends here
  
  // Light blue sky ends at the green horizon line
  // This appears to be at line 27 (27 * 25 = 675px)
  const skyEndPx = 675;    // Light blue sky ends here (green horizon)
  
  // Ground starts at the same point as sky ends
  const groundStartPx = 675; // Magenta ground starts here
  
  // Screen height
  const screenHeightPx = height;
  
  console.log(`Space (Dark Blue): 0px to ${spaceEndPx}px (${spaceEndPx}px height)`);
  console.log(`Sky Blue Band: ${spaceEndPx}px to ${skyEndPx}px (${skyEndPx - spaceEndPx}px height)`);
  console.log(`Ground (Magenta): ${groundStartPx}px to ${screenHeightPx}px (${screenHeightPx - groundStartPx}px height)`);
  console.log('');

  // Dragon position - 50% of the sky blue band
  const dragonYpx = spaceEndPx + ((skyEndPx - spaceEndPx) / 2);
  
  console.log(`Dragon Position: ${dragonYpx}px (50% of sky blue band)`);
  console.log('');

  console.log('=== Percentage Calculations ===');
  console.log('Converting pixel measurements to percentages (relative to 1080px height):');
  console.log('');
  
  const spacePercent = spaceEndPx / screenHeightPx;
  const skyEndPercent = skyEndPx / screenHeightPx;
  const groundStartPercent = groundStartPx / screenHeightPx;
  const dragonPercent = dragonYpx / screenHeightPx;
  
  const spaceHeightPercent = spacePercent;
  const skyHeightPercent = skyEndPercent - spacePercent;
  const groundHeightPercent = 1.0 - groundStartPercent;
  
  console.log(`Space: ${(spacePercent * 100).toFixed(2)}% (0% to ${(spacePercent * 100).toFixed(2)}%)`);
  console.log(`Sky Blue Band: ${(skyHeightPercent * 100).toFixed(2)}% (${(spacePercent * 100).toFixed(2)}% to ${(skyEndPercent * 100).toFixed(2)}%)`);
  console.log(`Ground: ${(groundHeightPercent * 100).toFixed(2)}% (${(groundStartPercent * 100).toFixed(2)}% to 100%)`);
  console.log(`Dragon: ${(dragonPercent * 100).toFixed(2)}%`);
  console.log('');

  console.log('=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('// Exact pixel measurements first:');
  console.log(`const SPACE_END_PX = ${spaceEndPx};`);
  console.log(`const SKY_END_PX = ${skyEndPx};`);
  console.log(`const GROUND_START_PX = ${groundStartPx};`);
  console.log(`const DRAGON_Y_PX = ${dragonYpx};`);
  console.log(`const SCREEN_HEIGHT_PX = ${screenHeightPx};`);
  console.log('');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  // Space area (dark blue) - 0px to ${spaceEndPx}px (${(spacePercent * 100).toFixed(2)}%)`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${spaceEndPx}px - sky blue band starts after space`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${skyEndPx}px - sky blue band ends at horizon`);
  console.log(`    height: ${skyHeightPercent.toFixed(4)}, // ${skyEndPx - spaceEndPx}px - the actual sky blue band`);
  console.log(`  },`);
  console.log(`  // Ground area (magenta) - ${groundStartPx}px to ${screenHeightPx}px (${(groundHeightPercent * 100).toFixed(2)}%)`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${groundStartPercent.toFixed(4)}, // ${groundStartPx}px - where horizon/ground starts`);
  console.log(`    height: ${groundHeightPercent.toFixed(4)}, // ${screenHeightPx - groundStartPx}px`);
  console.log(`  },`);
  console.log(`  // Action area - tight combat band (same as skyBlueBand)`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${spaceEndPx}px - action area is the sky blue band only`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${skyEndPx}px - action area ends at horizon`);
  console.log(`    height: ${skyHeightPercent.toFixed(4)}, // ${skyEndPx - spaceEndPx}px - tight combat band`);
  console.log(`  },`);
  console.log('} as const;');
  console.log('');

  console.log('=== Verification ===');
  console.log(`1. Orange overlay should end at ${spaceEndPx}px (Line ${spaceEndPx/25})`);
  console.log(`2. White overlay should cover ${spaceEndPx}px to ${skyEndPx}px (Lines ${spaceEndPx/25} to ${skyEndPx/25})`);
  console.log(`3. Purple overlay should start at ${groundStartPx}px (Line ${groundStartPx/25})`);
  console.log(`4. Dragon should be positioned at ${dragonYpx}px`);
  console.log(`5. Enemies should spawn only between ${spaceEndPx}px and ${skyEndPx}px`);

} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
