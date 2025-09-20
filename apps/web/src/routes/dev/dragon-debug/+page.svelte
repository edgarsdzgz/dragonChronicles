<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, Texture, Assets } from 'pixi.js';
  import { dragonAtlas } from '$lib/pixi/texture-atlas';
  import { getDragonFrame, createAnimatedDragonSprite } from '$lib/pixi/dragon-sprites';

  let canvas: HTMLCanvasElement;
  let app: Application;
  let debugInfo: string[] = [];
  let isLoaded = false;

  function addDebug(message: string) {
    console.log(message);
    debugInfo = [...debugInfo, `${new Date().toLocaleTimeString()}: ${message}`];
  }

  async function testTextureLoading() {
    addDebug('Starting texture loading test...');
    
    try {
      // Test 1: Assets API texture loading
      addDebug('Test 1: Loading texture using Assets API...');
      const assetsTexture = await Assets.load('/sprites/dragon_fly_128_sheet.svg');
      addDebug(`Assets texture loaded: ${assetsTexture ? 'SUCCESS' : 'FAILED'}`);
      
      if (assetsTexture) {
        addDebug(`Texture dimensions: ${assetsTexture.width}x${assetsTexture.height}`);
      }
      
      // Test 1b: Direct texture loading (for comparison)
      addDebug('Test 1b: Loading texture directly (legacy)...');
      const directTexture = Texture.from('/sprites/dragon_fly_128_sheet.svg');
      addDebug(`Direct texture created: ${directTexture ? 'SUCCESS' : 'FAILED'}`);
      
      // Test 2: Atlas initialization
      addDebug('Test 2: Testing atlas frame loading...');
      const frame = await getDragonFrame('idle');
      addDebug(`Dragon frame loaded: ${frame ? 'SUCCESS' : 'FAILED'}`);
      
      if (frame) {
        addDebug(`Frame details: ${frame.width}x${frame.height} at (${frame.x}, ${frame.y})`);
      }
      
      // Test 3: All frames
      addDebug('Test 3: Loading all dragon frames...');
      const frames = ['idle', 'fly_1', 'fly_2', 'fly_3'] as const;
      for (const frameType of frames) {
        const testFrame = await getDragonFrame(frameType);
        addDebug(`Frame ${frameType}: ${testFrame ? 'SUCCESS' : 'FAILED'}`);
      }
      
      // Test 4: Create animated sprite
      addDebug('Test 4: Creating animated dragon sprite...');
      const { sprite, animator } = await createAnimatedDragonSprite();
      addDebug(`Animated sprite created: SUCCESS`);
      
      // Position and add to stage
      sprite.position.set(app.renderer.width / 2, app.renderer.height / 2);
      sprite.scale.set(1.0);
      app.stage.addChild(sprite);
      
      // Start animation
      await animator.start();
      addDebug('Animation started successfully!');
      
    } catch (error) {
      addDebug(`ERROR: ${error.message}`);
      console.error('Texture loading test failed:', error);
    }
  }

  onMount(async () => {
    try {
      addDebug('Initializing PIXI application...');
      app = new Application({ view: canvas, backgroundAlpha: 0 });
      await app.init({ resizeTo: canvas.parentElement ?? window });
      addDebug('PIXI application initialized');
      
      isLoaded = true;
      
      // Run tests
      await testTextureLoading();
      
    } catch (error) {
      addDebug(`Failed to initialize: ${error.message}`);
      console.error('Failed to initialize app:', error);
    }
  });

  onDestroy(() => {
    app?.destroy(true, { children: true });
  });
</script>

<div style="position:fixed; inset:0; background: #0a0a0a;">
  <canvas bind:this={canvas} style="width:100%; height:100%; display:block;"></canvas>
  
  <div style="position:absolute; left:8px; top:8px; background:rgba(0,0,0,.95); color:#fff; padding:16px; border-radius:8px; font:11px 'Courier New', monospace; max-width:500px; max-height:80vh; overflow-y:auto;">
    <h3 style="margin:0 0 12px 0; font-size:14px; color:#4CAF50;">🐛 Dragon Loading Debug</h3>
    
    <div style="margin-bottom:12px;">
      <strong>Status:</strong> 
      <span style="color: {isLoaded ? '#4CAF50' : '#f44336'};">
        {isLoaded ? 'Ready' : 'Loading...'}
      </span>
    </div>
    
    <div style="border:1px solid #333; padding:8px; background:#111; border-radius:4px; max-height:400px; overflow-y:auto;">
      <div style="font-size:10px; color:#888; margin-bottom:6px;">Debug Log:</div>
      {#each debugInfo as message, i}
        <div style="margin:2px 0; color: {message.includes('ERROR') ? '#f44336' : message.includes('SUCCESS') ? '#4CAF50' : '#ccc'};">
          {message}
        </div>
      {/each}
      {#if debugInfo.length === 0}
        <div style="color:#666; font-style:italic;">Waiting for debug info...</div>
      {/if}
    </div>
    
    <div style="margin-top:12px; font-size:10px; color:#666;">
      This page tests dragon texture loading step-by-step to identify issues.
    </div>
  </div>
</div>
