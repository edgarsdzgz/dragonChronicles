<script lang="ts">
  import { onMount } from 'svelte';
  import { mountPixi } from '$lib/pixi/app';
  import type { PixiHandle } from '$lib/pixi/app';

  let canvas: HTMLCanvasElement;
  let handle: PixiHandle | null = null;
  let uiManager: any = null;

  onMount(async () => {
    handle = await mountPixi(canvas);
    
    // Get the UI Manager from the game start manager
    if (handle.gameStartManager) {
      uiManager = handle.gameStartManager.getUIManager();
      
      // Initialize UI Manager if not already initialized
      if (uiManager && !uiManager.isInitialized) {
        await uiManager.initialize();
      }
      
      // Test currency updates
      if (uiManager) {
        // Set initial currencies
        uiManager.updateCurrencies({
          arcana: 1250,
          soulPower: 45,
          gold: 8900,
          astralSeals: 3
        });
        
        // Simulate currency changes every 2 seconds
        const interval = setInterval(() => {
          if (uiManager) {
            const randomArcana = Math.floor(Math.random() * 2000) + 1000;
            const randomSoulPower = Math.floor(Math.random() * 100) + 20;
            const randomGold = Math.floor(Math.random() * 15000) + 5000;
            const randomAstralSeals = Math.floor(Math.random() * 10);
            
            uiManager.updateCurrencies({
              arcana: randomArcana,
              soulPower: randomSoulPower,
              gold: randomGold,
              astralSeals: randomAstralSeals
            });
          }
        }, 2000);
        
        // Cleanup interval on component destroy
        return () => clearInterval(interval);
      }
    }
  });
</script>

<div class="container">
  <h1>Currency Topbar Display Test</h1>
  <p>This page demonstrates the currency display system integrated into the topbar.</p>
  
  <div class="info">
    <h2>Currency Layout (2x2 Grid):</h2>
    <ul>
      <li><strong>Top Row:</strong> Arcana (left) | Gold (right)</li>
      <li><strong>Bottom Row:</strong> Soul Power (left) | Astral Seals (right)</li>
    </ul>
    
    <h2>Features:</h2>
    <ul>
      <li>Uses default <strong>Cinzel</strong> font (serif)</li>
      <li>Integrated directly into existing topbar (no separate container)</li>
      <li>Positioned on left side of topbar</li>
      <li>Numbers formatted with K/M/B suffixes for large values</li>
      <li>Responsive scaling with game world coordinates</li>
      <li>White text for visibility on purple background</li>
    </ul>
    
    <h2>Test Behavior:</h2>
    <ul>
      <li>Currencies update automatically every 2 seconds</li>
      <li>Values are randomized to demonstrate the display system</li>
      <li>All four currencies are displayed simultaneously</li>
      <li>Journey stats (distance/speed) appear below currencies</li>
    </ul>
  </div>
  
  <canvas bind:this={canvas} class="game-canvas"></canvas>
</div>

<style>
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    font-family: 'Cinzel', serif;
  }
  
  h1 {
    color: #4b0093;
    text-align: center;
    margin-bottom: 20px;
  }
  
  .info {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 20px;
    border-left: 4px solid #4b0093;
  }
  
  .info h2 {
    color: #4b0093;
    margin-top: 0;
  }
  
  .info ul {
    margin: 10px 0;
  }
  
  .info li {
    margin: 5px 0;
  }
  
  .game-canvas {
    width: 100%;
    max-width: 1920px;
    height: 600px;
    border: 2px solid #4b0093;
    border-radius: 8px;
    display: block;
    margin: 0 auto;
  }
</style>
