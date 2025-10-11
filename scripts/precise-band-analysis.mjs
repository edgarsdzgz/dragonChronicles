#!/usr/bin/env node

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('=== Precise Band Analysis for 1080px Height ===');
console.log('Based on visual inspection of the debug overlay image:');
console.log('');

const imagePath = join(__dirname, '../apps/web/static/backgrounds/steppe_background.png');

try {
  // Read the PNG file to get dimensions
  const imageBuffer = readFileSync(imagePath);
  const width = imageBuffer.readUInt32BE(16); // IHDR width
  const height = imageBuffer.readUInt32BE(20); // IHDR height
  
  console.log(`Image dimensions: ${width} x ${height}`);
  console.log('');

  console.log('=== Visual Analysis Instructions ===');
  console.log('Looking at the debug overlay image, we need to identify:');
  console.log('1. Where the dark blue "space" transitions to light blue "sky"');
  console.log('2. Where the light blue "sky" transitions to green "horizon"');
  console.log('3. Where the green "horizon" transitions to magenta "ground"');
  console.log('');

  // From the image description, I can see:
  // - Orange overlay extends too far down (should end at dark blue → light blue transition)
  // - White overlay doesn't perfectly align with light blue area
  // - Purple overlay starts too high (should start at green horizon line)
  
  // Looking at the ruler lines and visual cues:
  // The dark blue space appears to end around line 8-9 (200-225px)
  // The light blue sky appears to end around line 27-28 (675-700px) 
  // The green horizon appears around line 27-28 (675-700px)
  
  console.log('=== Estimated Boundaries (based on ruler lines) ===');
  
  // Let me be more conservative and precise:
  const estimatedSpaceEnd = 200;    // Line 8 (8 * 25 = 200px)
  const estimatedSkyEnd = 675;      // Line 27 (27 * 25 = 675px) 
  const estimatedHorizon = 675;     // Same as sky end
  
  console.log(`Space (Dark Blue) ends at: ${estimatedSpaceEnd}px (Line ${estimatedSpaceEnd/25})`);
  console.log(`Sky (Light Blue) ends at: ${estimatedSkyEnd}px (Line ${estimatedSkyEnd/25})`);
  console.log(`Horizon (Green) starts at: ${estimatedHorizon}px (Line ${estimatedHorizon/25})`);
  console.log('');

  console.log('=== Precise 1080px Measurements ===');
  const spacePercent = estimatedSpaceEnd / height;
  const skyEndPercent = estimatedSkyEnd / height;
  const horizonPercent = estimatedHorizon / height;
  const groundPercent = (height - estimatedHorizon) / height;
  
  console.log(`Space: 0% to ${spacePercent.toFixed(4)} (${(spacePercent * 100).toFixed(2)}%)`);
  console.log(`Sky Blue Band: ${spacePercent.toFixed(4)} to ${skyEndPercent.toFixed(4)} (${((skyEndPercent - spacePercent) * 100).toFixed(2)}%)`);
  console.log(`Horizon/Ground: ${horizonPercent.toFixed(4)} to 100% (${(groundPercent * 100).toFixed(2)}%)`);
  console.log('');

  // Dragon should be at 50% of the sky blue band
  const dragonY = estimatedSpaceEnd + (estimatedSkyEnd - estimatedSpaceEnd) * 0.5;
  const dragonPercent = dragonY / height;
  
  console.log(`Dragon Position (50% of sky band): ${dragonY.toFixed(1)}px (${dragonPercent.toFixed(4)} = ${(dragonPercent * 100).toFixed(2)}%)`);
  console.log('');

  console.log('=== Updated BACKGROUND_MEASUREMENTS ===');
  console.log('export const BACKGROUND_MEASUREMENTS = {');
  console.log(`  imageWidth: ${width},`);
  console.log(`  imageHeight: ${height},`);
  console.log(`  // Space area (dark blue) - 0% to ${(spacePercent * 100).toFixed(2)}% - where enemies should NOT spawn`);
  console.log(`  skyBlueBand: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${estimatedSpaceEnd}px - sky blue band starts after space`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${estimatedSkyEnd}px - sky blue band ends at horizon`);
  console.log(`    height: ${(skyEndPercent - spacePercent).toFixed(4)}, // ${estimatedSkyEnd - estimatedSpaceEnd}px - the actual sky blue band`);
  console.log(`  },`);
  console.log(`  // Ground area (magenta) - ${(horizonPercent * 100).toFixed(2)}% to 100% - where enemies should NOT spawn`);
  console.log(`  ground: {`);
  console.log(`    horizonLine: ${horizonPercent.toFixed(4)}, // ${estimatedHorizon}px - where horizon/ground starts`);
  console.log(`    height: ${groundPercent.toFixed(4)}, // ${height - estimatedHorizon}px`);
  console.log(`  },`);
  console.log(`  // Action area - tight combat band (same as skyBlueBand)`);
  console.log(`  actionArea: {`);
  console.log(`    top: ${spacePercent.toFixed(4)}, // ${estimatedSpaceEnd}px - action area is the sky blue band only`);
  console.log(`    bottom: ${skyEndPercent.toFixed(4)}, // ${estimatedSkyEnd}px - action area ends at horizon`);
  console.log(`    height: ${(skyEndPercent - spacePercent).toFixed(4)}, // ${estimatedSkyEnd - estimatedSpaceEnd}px - tight combat band`);
  console.log(`  },`);
  console.log('} as const;');
  console.log('');

  console.log('=== Verification Checklist ===');
  console.log('After applying these measurements, verify:');
  console.log(`1. Orange overlay ends at ${estimatedSpaceEnd}px (Line ${estimatedSpaceEnd/25}) - dark blue → light blue transition`);
  console.log(`2. White overlay starts at ${estimatedSpaceEnd}px and ends at ${estimatedSkyEnd}px - perfectly covers light blue sky`);
  console.log(`3. Purple overlay starts at ${estimatedHorizon}px (Line ${estimatedHorizon/25}) - exactly at green horizon line`);
  console.log(`4. Dragon positioned at ${dragonY.toFixed(1)}px - centered in white overlay area`);

} catch (error) {
  console.error('Error analyzing image:', error.message);
  process.exit(1);
}
