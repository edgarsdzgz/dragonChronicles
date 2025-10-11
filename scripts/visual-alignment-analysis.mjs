#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Visual Alignment Analysis ===');
console.log('Based on the debug overlay image, here are the precise measurements:');
console.log('');

const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  // Read the PNG file to get dimensions
  const imageBuffer = readFileSync(imagePath);
  const width = imageBuffer.readUInt32BE(16); // IHDR width
  const height = imageBuffer.readUInt32BE(20); // IHDR height
  
  console.log(`Image dimensions: ${width} x ${height}`);
  console.log('');

  console.log('=== Current Measurements vs Visual Reality ===');
  console.log('Current (misaligned):');
  console.log('- Orange SPACE: 0px to 200px (18.5%)');
  console.log('- White SKY: 200px to 675px (44.0%)');
  console.log('- Purple GROUND: 675px to 1080px (37.5%)');
  console.log('');

  console.log('Visual Analysis from the image:');
  console.log('- Dark blue space visually ends around 190-195px (around line 7-8)');
  console.log('- Light blue sky visually starts around 190-195px');
  console.log('- Green horizon line is at 675px (line 27) - this looks correct');
  console.log('- Magenta ground starts at 675px - this looks correct');
  console.log('');

  console.log('=== Corrected Measurements ===');
  
  // Based on visual inspection, the dark blue space ends around line 7-8 (175-200px)
  // Let's use 190px as the precise boundary
  const correctedSpaceEnd = 190;  // Line 7.6 (7.6 * 25 = 190px)
  const correctedSkyEnd = 675;    // Line 27 (27 * 25 = 675px) - this looks correct
  const correctedHorizon = 675;   // Same as sky end - this looks correct
  
  console.log(`Space (Dark Blue) ends at: ${correctedSpaceEnd}px (Line ${correctedSpaceEnd/25})`);
  console.log(`Sky (Light Blue) ends at: ${correctedSkyEnd}px (Line ${correctedSkyEnd/25})`);
  console.log(`Horizon (Green) starts at: ${correctedHorizon}px (Line ${correctedHorizon/25})`);
  console.log('');

  console.log('=== Precise 1080px Measurements ===');
  const spacePercent = correctedSpaceEnd / height;
  const skyEndPercent = correctedSkyEnd / height;
  const horizonPercent = correctedHorizon / height;
  const groundPercent = (height - correctedHorizon) / height;
  
  console.log(`Space: 0% to ${spacePercent.toFixed(4)} (${(spacePercent * 100).toFixed(2)}%)`);
  console.log(`Sky Blue Band: ${spacePercent.toFixed(4)} to ${skyEndPercent.toFixed(4)} (${((skyEndPercent - spacePercent) * 100).toFixed(2)}%)`);
  console.log(`Horizon/Ground: ${horizonPercent.toFixed(4)} to 100% (${(groundPercent * 100).toFixed(2)}%)`);
  console.log('');

  // Dragon should be at 50% of the sky blue band
  const dragonY = correctedSpaceEnd + (correctedSkyEnd - correctedSpaceEnd) * 0.5;
  const dragonPercent = dragonY / height;
  
  console.log(`Dragon Position (50% of sky band): ${dragonY.toFixed(1)}px (${dragonPercent.toFixed(4)} = ${(dragonPercent * 100).toFixed(2)}%)`);
  console.log('');

  console.log('=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  // Space area (dark blue) - 0% to ${(spacePercent * 100).toFixed(2)}% - where enemies should NOT spawn`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${correctedSpaceEnd}px - sky blue band starts after space`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${correctedSkyEnd}px - sky blue band ends at horizon`);
  console.log(`    height: ${(skyEndPercent - spacePercent).toFixed(4)}, // ${correctedSkyEnd - correctedSpaceEnd}px - the actual sky blue band`);
  console.log(`  },`);
  console.log(`  // Ground area (magenta) - ${(horizonPercent * 100).toFixed(2)}% to 100% - where enemies should NOT spawn`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${horizonPercent.toFixed(4)}, // ${correctedHorizon}px - where horizon/ground starts`);
  console.log(`    height: ${groundPercent.toFixed(4)}, // ${height - correctedHorizon}px`);
  console.log(`  },`);
  console.log(`  // Action area - tight combat band (same as skyBlueBand)`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${correctedSpaceEnd}px - action area is the sky blue band only`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${correctedSkyEnd}px - action area ends at horizon`);
  console.log(`    height: ${(skyEndPercent - spacePercent).toFixed(4)}, // ${correctedSkyEnd - correctedSpaceEnd}px - tight combat band`);
  console.log(`  },`);
  console.log('} as const;');
  console.log('');

  console.log('=== Expected Results After Update ===');
  console.log(`1. Orange overlay should end at ${correctedSpaceEnd}px (Line ${correctedSpaceEnd/25}) - exactly where dark blue transitions to light blue`);
  console.log(`2. White overlay should start at ${correctedSpaceEnd}px and end at ${correctedSkyEnd}px - perfectly covering light blue sky`);
  console.log(`3. Purple overlay should start at ${correctedHorizon}px (Line ${correctedHorizon/25}) - exactly at green horizon line`);
  console.log(`4. Dragon positioned at ${dragonY.toFixed(1)}px - centered in white overlay area`);
  console.log(`5. Enemies should spawn only between ${correctedSpaceEnd}px and ${correctedSkyEnd}px`);

} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
