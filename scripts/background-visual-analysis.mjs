#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Background Visual Analysis ===');
console.log('Using overlay as ruler to measure the actual background image');
console.log('');

const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  // Read the PNG file to get dimensions
  const imageBuffer = readFileSync(imagePath);
  const width = imageBuffer.readUInt32BE(16); // IHDR width
  const height = imageBuffer.readUInt32BE(20); // IHDR height
  
  console.log(`Image dimensions: ${width} x ${height} pixels`);
  console.log('');

  console.log('=== Visual Analysis Instructions ===');
  console.log('Looking at the actual background image (not the overlay labels):');
  console.log('');
  
  console.log('From the image description:');
  console.log('- Dark blue space visually ends around 98-99 pixels (around line 4)');
  console.log('- Orange overlay is positioned at 525 pixels (which is wrong)');
  console.log('- We need to find where light blue sky actually starts and ends');
  console.log('');

  console.log('=== Corrected Pixel Boundaries ===');
  console.log('Based on visual inspection of the actual background:');
  
  // From visual analysis:
  const actualSpaceEndPx = 100;    // Dark blue space ends around line 4 (4 * 25 = 100px)
  const actualSkyEndPx = 650;      // Light blue sky ends where it transitions to green/magenta
  const actualGroundStartPx = 650; // Ground starts where sky ends
  
  console.log(`Space (Dark Blue): 0px to ${actualSpaceEndPx}px (${actualSpaceEndPx}px height)`);
  console.log(`Sky Blue Band: ${actualSpaceEndPx}px to ${actualSkyEndPx}px (${actualSkyEndPx - actualSpaceEndPx}px height)`);
  console.log(`Ground (Magenta): ${actualGroundStartPx}px to ${height}px (${height - actualGroundStartPx}px height)`);
  console.log('');

  // Dragon position - 50% of the actual sky blue band
  const dragonYpx = actualSpaceEndPx + ((actualSkyEndPx - actualSpaceEndPx) / 2);
  
  console.log(`Dragon Position: ${dragonYpx}px (50% of actual sky blue band)`);
  console.log('');

  console.log('=== Percentage Calculations ===');
  const spacePercent = actualSpaceEndPx / height;
  const skyEndPercent = actualSkyEndPx / height;
  const groundStartPercent = actualGroundStartPx / height;
  const dragonPercent = dragonYpx / height;
  
  const spaceHeightPercent = spacePercent;
  const skyHeightPercent = skyEndPercent - spacePercent;
  const groundHeightPercent = 1.0 - groundStartPercent;
  
  console.log(`Space: ${(spacePercent * 100).toFixed(2)}% (0% to ${(spacePercent * 100).toFixed(2)}%)`);
  console.log(`Sky Blue Band: ${(skyHeightPercent * 100).toFixed(2)}% (${(spacePercent * 100).toFixed(2)}% to ${(skyEndPercent * 100).toFixed(2)}%)`);
  console.log(`Ground: ${(groundHeightPercent * 100).toFixed(2)}% (${(groundStartPercent * 100).toFixed(2)}% to 100%)`);
  console.log(`Dragon: ${(dragonPercent * 100).toFixed(2)}%`);
  console.log('');

  console.log('=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('// Corrected measurements based on actual background visual analysis:');
  console.log(`const SPACE_END_PX = ${actualSpaceEndPx};`);
  console.log(`const SKY_END_PX = ${actualSkyEndPx};`);
  console.log(`const GROUND_START_PX = ${actualGroundStartPx};`);
  console.log(`const DRAGON_Y_PX = ${dragonYpx};`);
  console.log(`const SCREEN_HEIGHT_PX = ${height};`);
  console.log('');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  // Space area (dark blue) - 0px to ${actualSpaceEndPx}px (${(spacePercent * 100).toFixed(2)}%)`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${actualSpaceEndPx}px - sky blue band starts after space`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${actualSkyEndPx}px - sky blue band ends at horizon`);
  console.log(`    height: ${skyHeightPercent.toFixed(4)}, // ${actualSkyEndPx - actualSpaceEndPx}px - the actual sky blue band`);
  console.log(`  },`);
  console.log(`  // Ground area (magenta) - ${actualGroundStartPx}px to ${height}px (${(groundHeightPercent * 100).toFixed(2)}%)`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${groundStartPercent.toFixed(4)}, // ${actualGroundStartPx}px - where horizon/ground starts`);
  console.log(`    height: ${groundHeightPercent.toFixed(4)}, // ${height - actualGroundStartPx}px`);
  console.log(`  },`);
  console.log(`  // Action area - tight combat band (same as skyBlueBand)`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${actualSpaceEndPx}px - action area is the sky blue band only`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${actualSkyEndPx}px - action area ends at horizon`);
  console.log(`    height: ${skyHeightPercent.toFixed(4)}, // ${actualSkyEndPx - actualSpaceEndPx}px - tight combat band`);
  console.log(`  },`);
  console.log('} as const;');
  console.log('');

  console.log('=== Expected Results After Update ===');
  console.log(`1. Orange overlay should end at ${actualSpaceEndPx}px (Line ${actualSpaceEndPx/25}) - where dark blue actually ends`);
  console.log(`2. White overlay should cover ${actualSpaceEndPx}px to ${actualSkyEndPx}px (Lines ${actualSpaceEndPx/25} to ${actualSkyEndPx/25}) - actual light blue sky`);
  console.log(`3. Purple overlay should start at ${actualGroundStartPx}px (Line ${actualGroundStartPx/25}) - where ground actually starts`);
  console.log(`4. Dragon should be positioned at ${dragonYpx}px - centered in actual sky band`);
  console.log(`5. Enemies should spawn only between ${actualSpaceEndPx}px and ${actualSkyEndPx}px`);

} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
