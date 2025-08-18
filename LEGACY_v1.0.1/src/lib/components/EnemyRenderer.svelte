<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { enemySystem } from '$lib/enemySystem';
  import type { Enemy, Projectile, DamageNumber } from '$lib/enemySystem';
  import { Decimal } from '$lib/num/decimal';
  import { enemyStore } from '$lib/state/enemies';
  import { projectileStore } from '$lib/state/projectiles';
  import { combatState } from '$lib/state/combat';
  import { metrics } from '$lib/state/metrics';
  import { distanceUI } from '$lib/state/distance';
  
  // Props for rendering context
  export let combatWidth = 800;
  export let combatHeight = 200;
  export let dragonX = 80;
  export let dragonY = 100;
  export let playerIsReversing = false;
  export let playerIsTraveling = false;
  export let currentLand = 1;
  export let currentDistance = '0';
  
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;
  let animationFrame: number;
  let lastTime = 0;
  
  // Enemy system state
  $: enemies = enemySystem.getEnemies();
  $: projectiles = enemySystem.getProjectiles();
  $: damageNumbers = enemySystem.getDamageNumbers();
  
  onMount(async () => {
    // Phase 0.2: Set renderer subscribed flag
    if (import.meta.env.DEV) (window as any).__rendererSubscribed = true;
    
    // Initialize enemy system
    if (!enemySystem.isReady()) {
      try {
        await enemySystem.initialize();
      } catch (error) {
        console.error('Failed to initialize enemy system:', error);
        return;
      }
    }
    
    // Setup canvas
    ctx = canvas.getContext('2d')!;
    canvas.width = combatWidth;
    canvas.height = combatHeight;
    
    // Start animation loop
    animate();
  });
  
  onDestroy(() => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
    }
  });
  
  function animate() {
    const now = performance.now();
    const deltaTime = now - lastTime;
    lastTime = now;
    
    // Update enemy system
    enemySystem.updateGameState(
      combatWidth,
      combatHeight,
      dragonX,
      dragonY,
      playerIsReversing,
      playerIsTraveling,
      currentLand,
      new Decimal(currentDistance)
    );
    enemySystem.update(deltaTime);
    
    // Phase 0.1: Update debug stores
    const debugInfo = enemySystem.getDebugInfo();
    enemyStore.set({
      active: debugInfo.activeEnemies,
      cap: 48,
      inRange: debugInfo.inRangeCount
    });
    projectileStore.set({
      active: debugInfo.activeProjectiles,
      cap: 160
    });
    combatState.set({
      tracking: playerIsTraveling
    });
    metrics.set({
      spawnsEWMA: debugInfo.spawnsPerSecond,
      cullCount: debugInfo.cullCount
    });
    distanceUI.set({
      km: parseFloat(currentDistance)
    });
    
    // Render
    render();
    
    animationFrame = requestAnimationFrame(animate);
  }
  
  function render() {
    // Clear canvas
    ctx.clearRect(0, 0, combatWidth, combatHeight);
    
    // Draw order per spec §9.3: background → player (dragon) + enemies → HP bars → damage numbers → UI overlays
    
    // 1. Enemies (rendered as simple circles for MVP)
    renderEnemies();
    
    // 2. Projectiles
    renderProjectiles();
    
    // 3. HP bars (z-order: above enemy sprites, below damage numbers)
    renderHPBars();
    
    // 4. Damage numbers (highest z-order)
    renderDamageNumbers();
    
    // Debug info (if enabled)
    if (import.meta.env.DEV) {
      renderDebugInfo();
    }
  }
  
  function renderEnemies() {
    const boss = enemySystem.getBoss();
    
    for (const enemy of enemies) {
      if (enemy.state === 'dead') continue;
      
      // Check if this is the boss (render larger and different color)
      const isBoss = enemy === boss;
      const radius = isBoss ? 20 : 12;
      
      ctx.fillStyle = isBoss ? '#8B0000' : '#ff6b6b'; // Dark red for boss, red for regular
      ctx.beginPath();
      ctx.arc(enemy.x, enemy.y, radius, 0, Math.PI * 2);
      ctx.fill();
      
      // Boss outline
      if (isBoss) {
        ctx.strokeStyle = '#FF4500';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
      
      // Enemy type indicator
      ctx.fillStyle = 'white';
      ctx.font = isBoss ? 'bold 14px Arial' : '10px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(isBoss ? 'BOSS' : 'E', enemy.x, enemy.y + (isBoss ? 4 : 3));
    }
  }
  
  function renderProjectiles() {
    for (const projectile of projectiles) {
      if (projectile.side === 'enemy') {
        ctx.fillStyle = '#ff4444'; // Red enemy projectiles
      } else {
        ctx.fillStyle = '#44ff44'; // Green player projectiles
      }
      
      ctx.beginPath();
      ctx.arc(projectile.x, projectile.y, 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  
  function renderHPBars() {
    for (const enemy of enemies) {
      if (enemy.state === 'dead' || !enemy.hpBarVisible) continue;
      
      // HP bar per spec §6: thin yellow line, 70% of enemy width, 4px thick
      const barWidth = 24 * 0.7; // 70% of enemy width (12px radius = 24px width)
      const barHeight = 4;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - 20; // Above enemy
      
      // Background
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(barX - 1, barY - 1, barWidth + 2, barHeight + 2);
      
      // HP fill
      const hpPercentage = enemy.currentHP.div(enemy.maxHP).toNumber();
      ctx.fillStyle = '#ffeb3b'; // Yellow per spec
      ctx.fillRect(barX, barY, barWidth * hpPercentage, barHeight);
      
      // Border
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = 1;
      ctx.strokeRect(barX, barY, barWidth, barHeight);
    }
  }
  
  function renderDamageNumbers() {
    for (const damageNumber of damageNumbers) {
      const scale = damageNumber.scale || 1.0;
      const opacity = damageNumber.opacity || 1.0;
      
      ctx.save();
      ctx.translate(damageNumber.x, damageNumber.y);
      ctx.scale(scale, scale);
      ctx.globalAlpha = opacity;
      
      // Text styling per spec §7
      ctx.fillStyle = damageNumber.color;
      ctx.font = 'bold 14px Arial';
      ctx.textAlign = 'center';
      ctx.strokeStyle = 'black';
      ctx.lineWidth = 2;
      
      // Outline for readability
      ctx.strokeText(damageNumber.amount, 0, 0);
      ctx.fillText(damageNumber.amount, 0, 0);
      
      ctx.restore();
    }
  }
  
  function renderDebugInfo() {
    const debugInfo = enemySystem.getDebugInfo();
    
    // 🚨 CTO REQUESTED: DEV overlay with live counters
    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(10, 10, 280, 120);
    
    ctx.fillStyle = '#00ff00'; // Bright green for visibility
    ctx.font = '12px monospace';
    ctx.textAlign = 'left';
    
    // Live counters per CTO spec
    ctx.fillText(`🚨 ENEMY DEBUG OVERLAY`, 15, 25);
    ctx.fillText(`Enemies: ${debugInfo.activeEnemies}/48`, 15, 40);
    ctx.fillText(`Projectiles: ${debugInfo.activeProjectiles}/160`, 15, 55);
    ctx.fillText(`Spawns/s: ${debugInfo.spawnsPerSecond || '0.0'}`, 15, 70);
    ctx.fillText(`Cull count: ${debugInfo.cullCount || 0}`, 15, 85);
    ctx.fillText(`InRange: ${debugInfo.inRangeCount || 0}`, 15, 100);
    ctx.fillText(`Traveling: ${playerIsTraveling ? 'YES' : 'NO'}`, 15, 115);
  }
  
  // Handle canvas resize
  $: if (canvas) {
    canvas.width = combatWidth;
    canvas.height = combatHeight;
  }
</script>

<!-- Enemy rendering canvas per spec §9.3 draw order -->
<canvas 
  bind:this={canvas}
  width={combatWidth}
  height={combatHeight}
  style="
    position: absolute;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 1;
  "
></canvas>

<style>
  canvas {
    image-rendering: pixelated;
    image-rendering: -moz-crisp-edges;
    image-rendering: crisp-edges;
  }
</style>