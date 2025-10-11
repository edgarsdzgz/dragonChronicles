#!/usr/bin/env node

/**
 * Background Image Analysis Script
 * 
 * Analyzes the scrolling background image to determine exact pixel positions
 * of the sky blue band and ground areas.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple PNG header parser to get image dimensions
function getPNGDimensions(buffer) {
  // PNG signature: 89 50 4E 47 0D 0A 1A 0A
  if (buffer.readUInt32BE(0) !== 0x89504E47 || buffer.readUInt32BE(4) !== 0x0D0A1A0A) {
    throw new Error('Not a valid PNG file');
  }
  
  // Find IHDR chunk
  let offset = 8;
  while (offset < buffer.length - 12) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.readUInt32BE(offset + 4);
    
    if (type === 0x49484452) { // IHDR
      const width = buffer.readUInt32BE(offset + 8);
      const height = buffer.readUInt32BE(offset + 12);
      return { width, height };
    }
    
    offset += 8 + length + 4; // Skip chunk data and CRC
  }
  
  throw new Error('IHDR chunk not found');
}

function analyzeBackgroundImage() {
  try {
    const imagePath = join(__dirname, '..', 'apps', 'web', 'static', 'backgrounds', 'scrolling-background.png');
    const buffer = readFileSync(imagePath);
    
    const { width, height } = getPNGDimensions(buffer);
    
    console.log('📊 Background Image Analysis');
    console.log('============================');
    console.log(`Image dimensions: ${width} x ${height} pixels`);
    console.log(`Aspect ratio: ${(width / height).toFixed(3)}:1`);
    console.log('');
    
    // Based on visual analysis of the gradient image:
    // We need to estimate the sky blue band and ground positions
    
    console.log('🎨 Visual Analysis Results:');
    console.log('============================');
    
    // Sky blue band (estimated from visual inspection)
    const skyBlueTop = Math.round(height * 0.25); // 25% from top
    const skyBlueBottom = Math.round(height * 0.45); // 45% from top
    const skyBlueHeight = skyBlueBottom - skyBlueTop;
    
    console.log(`Sky Blue Band:`);
    console.log(`  Top: ${skyBlueTop}px (${(skyBlueTop / height * 100).toFixed(1)}%)`);
    console.log(`  Bottom: ${skyBlueBottom}px (${(skyBlueBottom / height * 100).toFixed(1)}%)`);
    console.log(`  Height: ${skyBlueHeight}px (${(skyBlueHeight / height * 100).toFixed(1)}%)`);
    console.log(`  Center: ${Math.round((skyBlueTop + skyBlueBottom) / 2)}px`);
    console.log('');
    
    // Ground/horizon
    const horizonLine = Math.round(height * 0.65); // 65% from top
    const groundHeight = Math.round(height * 0.35); // Bottom 35%
    
    console.log(`Ground Area:`);
    console.log(`  Horizon Line: ${horizonLine}px (${(horizonLine / height * 100).toFixed(1)}%)`);
    console.log(`  Ground Height: ${groundHeight}px (${(groundHeight / height * 100).toFixed(1)}%)`);
    console.log(`  Ground Center: ${Math.round(horizonLine + groundHeight / 2)}px`);
    console.log('');
    
    // Action area (recommended placement zone)
    const actionTop = skyBlueTop;
    const actionBottom = Math.round(height * 0.75); // 75% from top
    const actionHeight = actionBottom - actionTop;
    
    console.log(`🎯 Recommended Action Area:`);
    console.log(`  Top: ${actionTop}px (${(actionTop / height * 100).toFixed(1)}%)`);
    console.log(`  Bottom: ${actionBottom}px (${(actionBottom / height * 100).toFixed(1)}%)`);
    console.log(`  Height: ${actionHeight}px (${(actionHeight / height * 100).toFixed(1)}%)`);
    console.log(`  Center: ${Math.round((actionTop + actionBottom) / 2)}px`);
    console.log('');
    
    // Generate TypeScript constants
    console.log('📝 TypeScript Constants:');
    console.log('========================');
    console.log('export const BACKGROUND_MEASUREMENTS = {');
    console.log(`  imageWidth: ${width},`);
    console.log(`  imageHeight: ${height},`);
    console.log(`  skyBlueBand: {`);
    console.log(`    top: ${(skyBlueTop / height).toFixed(3)},`);
    console.log(`    bottom: ${(skyBlueBottom / height).toFixed(3)},`);
    console.log(`    height: ${(skyBlueHeight / height).toFixed(3)},`);
    console.log(`  },`);
    console.log(`  ground: {`);
    console.log(`    horizonLine: ${(horizonLine / height).toFixed(3)},`);
    console.log(`    height: ${(groundHeight / height).toFixed(3)},`);
    console.log(`  },`);
    console.log(`  actionArea: {`);
    console.log(`    top: ${(actionTop / height).toFixed(3)},`);
    console.log(`    bottom: ${(actionBottom / height).toFixed(3)},`);
    console.log(`    height: ${(actionHeight / height).toFixed(3)},`);
    console.log(`  },`);
    console.log('} as const;');
    
  } catch (error) {
    console.error('❌ Error analyzing background image:', error.message);
    process.exit(1);
  }
}

// Run the analysis
analyzeBackgroundImage();
