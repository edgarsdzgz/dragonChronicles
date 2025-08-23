import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

describe('HUD flag logic', () => {
  it('detects hud=1 in query parameters', () => {
    const url1 = new URL('https://example.test/?hud=1');
    const url2 = new URL('https://example.test/?other=value');
    const url3 = new URL('https://example.test/?hud=1&other=value');
    
    expect(url1.searchParams.get('hud')).toBe('1');
    expect(url2.searchParams.get('hud')).toBe(null);
    expect(url3.searchParams.get('hud')).toBe('1');
  });

  it('parses different hud values correctly', () => {
    const url1 = new URL('https://example.test/?hud=0');
    const url2 = new URL('https://example.test/?hud=true');
    const url3 = new URL('https://example.test/?hud=1');
    
    // Only hud=1 should enable the HUD
    expect(url1.searchParams.get('hud') === '1').toBe(false);
    expect(url2.searchParams.get('hud') === '1').toBe(false);
    expect(url3.searchParams.get('hud') === '1').toBe(true);
  });
});

// HUD decoupling enforcement
describe('HUD decoupled from Pixi ticker', () => {
  it('HUD/layout does not import Pixi ticker directly', () => {
    const hudPaths = [
      path.resolve('apps/web/src/lib/pixi/hud.ts'),
      path.resolve('apps/web/src/routes/+layout.svelte'),
      path.resolve('apps/web/src/routes/+page.svelte'),
    ].filter(fs.existsSync);

    const badPatterns = [/from\s+['"]pixi.*ticker['"]/, /PIXI\.\s*ticker/i, /app\.ticker\./];
    
    for (const p of hudPaths) {
      const src = fs.readFileSync(p, 'utf8');
      for (const pat of badPatterns) {
        expect(pat.test(src)).toBe(false);
      }
    }
  });
});