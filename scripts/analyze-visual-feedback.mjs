#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Visual Feedback Analysis ===');
console.log('Based on the debug overlay image, let\'s analyze the misalignments:');
console.log('');

const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  // Read the PNG file to get dimensions
  const imageBuffer = readFileSync(imagePath);
  const width = imageBuffer.readUInt32BE(16); // IHDR width
  const height = imageBuffer.readUInt32BE(20); // IHDR height
  
  console.log(`Image dimensions: ${width} x ${height}`);
  console.log('');

  // From visual analysis of the debug overlay image:
  // Looking at the ruler lines and overlays, I can see:
  
  console.log('=== Visual Analysis from Debug Overlay ===');
  console.log('Issues observed:');
  console.log('1. Orange space overlay extends too far down into light blue sky');
  console.log('2. White sky band overlay doesn\'t align with actual light blue area');
  console.log('3. Purple ground overlay starts too high, overlapping green horizon');
  console.log('');

  // Let me estimate based on the ruler lines visible:
  // If we have ruler lines every 25px, I can count them to estimate positions
  
  console.log('=== Estimated Pixel Positions (based on ruler lines) ===');
  
  // From the image, counting ruler lines:
  // Space (dark blue) appears to end around line 8-9 (200-225px)
  // Light blue sky appears to end around line 27-28 (675-700px)
  // Green horizon appears around line 27-28 (675-700px)
  
  const estimatedSpaceEnd = 220; // ~8.8 lines * 25px
  const estimatedSkyEnd = 680;   // ~27.2 lines * 25px
  const estimatedHorizon = 680;  // Same as sky end
  
  console.log(`Estimated Space End: ${estimatedSpaceEnd}px (line ${Math.round(estimatedSpaceEnd/25)})`);
  console.log(`Estimated Sky End: ${estimatedSkyEnd}px (line ${Math.round(estimatedSkyEnd/25)})`);
  console.log(`Estimated Horizon: ${estimatedHorizon}px (line ${Math.round(estimatedHorizon/25)})`);
  console.log('');

  console.log('=== Refined Measurements ===');
  const spacePercent = estimatedSpaceEnd / height;
  const skyEndPercent = estimatedSkyEnd / height;
  const horizonPercent = estimatedHorizon / height;
  const groundPercent = (height - estimatedHorizon) / height;
  
  console.log(`Space: 0% to ${spacePercent.toFixed(3)} (${(spacePercent * 100).toFixed(1)}%)`);
  console.log(`Sky Blue Band: ${spacePercent.toFixed(3)} to ${skyEndPercent.toFixed(3)} (${((skyEndPercent - spacePercent) * 100).toFixed(1)}%)`);
  console.log(`Horizon: ${horizonPercent.toFixed(3)} (${(horizonPercent * 100).toFixed(1)}%)`);
  console.log(`Ground: ${horizonPercent.toFixed(3)} to 100% (${(groundPercent * 100).toFixed(1)}%)`);
  console.log('');

  // Dragon should be at 50% of the sky blue band
  const dragonY = estimatedSpaceEnd + (estimatedSkyEnd - estimatedSpaceEnd) * 0.5;
  const dragonPercent = dragonY / height;
  
  console.log(`Dragon Position (50% of sky band): ${dragonY.toFixed(1)}px (${dragonPercent.toFixed(3)} = ${(dragonPercent * 100).toFixed(1)}%)`);
  console.log('');

  console.log('=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  // Space area (dark blue) - 0% to ${(spacePercent * 100).toFixed(1)}% - where enemies should NOT spawn`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${spacePercent.toFixed(3)}, // ${estimatedSpaceEnd}px - sky blue band starts after space`);
  console.log(`    bottom: ${skyEndPercent.toFixed(3)}, // ${estimatedSkyEnd}px - sky blue band ends at horizon`);
  console.log(`    height: ${(skyEndPercent - spacePercent).toFixed(3)}, // ${estimatedSkyEnd - estimatedSpaceEnd}px - the actual sky blue band`);
  console.log(`  },`);
  console.log(`  // Ground area (magenta) - ${(horizonPercent * 100).toFixed(1)}% to 100% - where enemies should NOT spawn`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${horizonPercent.toFixed(3)}, // ${estimatedHorizon}px - where horizon/ground starts`);
  console.log(`    height: ${groundPercent.toFixed(3)}, // ${height - estimatedHorizon}px`);
  console.log(`  },`);
  console.log(`  // Action area - tight combat band (same as skyBlueBand)`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${spacePercent.toFixed(3)}, // ${estimatedSpaceEnd}px - action area is the sky blue band only`);
  console.log(`    bottom: ${skyEndPercent.toFixed(3)}, // ${estimatedSkyEnd}px - action area ends at horizon`);
  console.log(`    height: ${(skyEndPercent - spacePercent).toFixed(3)}, // ${estimatedSkyEnd - estimatedSpaceEnd}px - tight combat band`);
  console.log(`  },`);
  console.log('} as const;');
  console.log('');

  console.log('=== Visual Verification Needed ===');
  console.log('After applying these measurements, the overlays should:');
  console.log('1. Orange overlay should end at the transition from dark blue to light blue');
  console.log('2. White overlay should perfectly cover the light blue sky area');
  console.log('3. Purple overlay should start exactly at the green horizon line');
  console.log('4. Dragon should be centered in the white overlay area');

} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
