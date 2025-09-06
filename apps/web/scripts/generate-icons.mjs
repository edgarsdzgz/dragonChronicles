#!/usr/bin/env node

/**
 * Icon generation script for Draconia Chronicles PWA
 * Creates placeholder icons in multiple sizes for PWA installation
 */

import { createCanvas } from 'canvas';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Icon sizes required for PWA
const iconSizes = [72, 96, 128, 144, 152, 192, 384, 512];
const maskableSizes = [192, 512];

// Create icons directory
const iconsDir = join(__dirname, '..', 'static', 'icons');
mkdirSync(iconsDir, { recursive: true });

function createIcon(size, isMaskable = false) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // Background
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(0, 0, size, size);
  
  // Dragon silhouette (simplified)
  const centerX = size / 2;
  const centerY = size / 2;
  const _scale = size / 512;
  
  // Dragon body (simplified geometric shape)
  ctx.fillStyle = '#4a90e2';
  ctx.beginPath();
  
  // Dragon head
  ctx.arc(centerX - size * 0.15, centerY, size * 0.2, 0, Math.PI * 2);
  
  // Dragon body
  ctx.ellipse(centerX, centerY, size * 0.3, size * 0.15, 0, 0, Math.PI * 2);
  
  // Dragon tail
  ctx.ellipse(centerX + size * 0.25, centerY, size * 0.2, size * 0.1, 0, 0, Math.PI * 2);
  
  ctx.fill();
  
  // Dragon eye
  ctx.fillStyle = '#ff6b6b';
  ctx.beginPath();
  ctx.arc(centerX - size * 0.1, centerY - size * 0.05, size * 0.03, 0, Math.PI * 2);
  ctx.fill();
  
  // Add "DC" text for smaller icons
  if (size >= 96) {
    ctx.fillStyle = '#ffffff';
    ctx.font = `bold ${size * 0.15}px system-ui`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('DC', centerX, centerY + size * 0.3);
  }
  
  // For maskable icons, ensure proper padding
  if (isMaskable) {
    const padding = size * 0.1;
    const maskCanvas = createCanvas(size, size);
    const maskCtx = maskCanvas.getContext('2d');
    
    // Clear background
    maskCtx.clearRect(0, 0, size, size);
    
    // Draw icon with padding
    maskCtx.drawImage(canvas, padding, padding, size - padding * 2, size - padding * 2);
    
    return maskCanvas;
  }
  
  return canvas;
}

console.log('Generating PWA icons...');

// Generate regular icons
for (const size of iconSizes) {
  const icon = createIcon(size);
  const filename = `icon-${size}.png`;
  const filepath = join(iconsDir, filename);
  
  writeFileSync(filepath, icon.toBuffer('image/png'));
  console.log(`✓ Generated ${filename}`);
}

// Generate maskable icons
for (const size of maskableSizes) {
  const icon = createIcon(size, true);
  const filename = `icon-${size}-maskable.png`;
  const filepath = join(iconsDir, filename);
  
  writeFileSync(filepath, icon.toBuffer('image/png'));
  console.log(`✓ Generated ${filename}`);
}

console.log('✓ All icons generated successfully!');
console.log(`Icons saved to: ${iconsDir}`);
