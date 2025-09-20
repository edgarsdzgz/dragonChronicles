<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Application, type Sprite, Graphics } from 'pixi.js';
  import { createAnimatedDragonSprite, type DragonFrame } from '$lib/pixi/dragon-sprites';
  import type { DragonAnimator } from '$lib/pixi/dragon-animator';
  import { createAnimatedEnemySprite, type EnemyType, getAllEnemyTypes, getEnemyConfig } from '$lib/pixi/enemy-sprites';
  import type { EnemyAnimator } from '$lib/pixi/enemy-sprites';
   import { createProjectile, getProjectileTypeForEnemy, getDragonProjectileType, type Projectile } from '$lib/pixi/projectile-sprites';

  let canvas: HTMLCanvasElement;
  let app: Application;
  let dragons: Array<{ 
    sprite: Sprite; 
    animator: DragonAnimator; 
    x: number; 
    y: number;
    lastFireTime: number;
    fireRate: number;
  }> = [];
  let enemies: Array<{ 
    sprite: Sprite; 
    animator: EnemyAnimator; 
    x: number; 
    y: number; 
    type: EnemyType;
    isMoving: boolean;
    lastFireTime: number;
    fireRate: number;
    health: number;
    maxHealth: number;
    currentSpeedMultiplier: number;
    lastFrameChangeTime: number;
  }> = [];
  let projectiles: Array<Projectile> = [];
  let isLoaded = false;
  let globalAnimationState = true;
  let currentFPS = 8; // Default to 8 FPS
  let enemiesShooting = false;
  let enemyShootingIntervals: number[] = [];
  let showAttackRange = false;
  let showEnemyAttackRange = false;
  let attackRangeGraphics: Graphics | null = null;
  let enemyAttackRangeGraphics: Graphics | null = null;
  let healthBarsGraphics: Graphics | null = null;
  let automaticCombat = true; // Combat is now automatic
  let autoSpawning = false;
  let autoSpawnInterval: number | null = null;
  let dragonsAttacking = false;
  let dragonAttackIntervals: number[] = [];
  const DRAGON_ATTACK_RANGE = 400; // pixels - adjust as needed
  const ENEMY_ATTACK_RANGE = 300; // pixels - enemies have shorter range
  const ENEMY_MOVE_SPEED = 50; // pixels per second
  const DRAGON_BASE_DAMAGE = 5; // base attack damage per hit
  
  // Enemy health configurations
  const ENEMY_HEALTH_CONFIG: Record<EnemyType, number> = {
    'mantair-corsair': 12, // Takes 3 hits to kill (5 × 3 = 15, but 12 HP means 3 hits)
    'swarm': 3 // Takes 1 hit to kill (5 × 1 = 5, but 3 HP means 1 hit)
  };
  
  // Auto-spawn configuration
  const AUTO_SPAWN_CONFIG = {
    baseInterval: 3000, // 3 seconds between spawns
    intervalVariation: 1000, // ±1 second variation
    enemyTypes: ['mantair-corsair', 'swarm'] as EnemyType[], // Types to randomly spawn
    maxEnemies: 8 // Maximum enemies on screen at once
  };
  
  // Enemy formation tracking
  let enemyFormation = {
    currentColumn: 0,
    currentPosition: 0, // 0 = center, then alternates positive/negative
    enemiesPerColumn: 0,
    maxEnemiesPerColumn: 8, // Adjust based on screen height
    columnSpacing: 120, // Horizontal spacing between columns
    verticalSpacing: 100, // Vertical spacing between enemies
    startX: 600 // Starting X position for first enemy column (moved further right)
  };

  async function spawnAnimatedDragon() {
    if (!app || !isLoaded) return;
    
    try {
      const { sprite, animator } = await createAnimatedDragonSprite(app.renderer, app.stage);
      
      // Position randomly on screen with some margin
      const margin = 64;
      const x = margin + Math.random() * (app.renderer.width - margin * 2);
      const y = margin + Math.random() * (app.renderer.height - margin * 2);
      
      sprite.position.set(x, y);
      sprite.scale.set(0.75); // Make dragons a bit smaller
      sprite.visible = true; // Explicitly set visible
      sprite.alpha = 1.0; // Ensure fully opaque
      sprite.tint = 0xFFFFFF; // Ensure no color tinting
      
      console.log('Adding animated dragon to stage:', {
        position: sprite.position,
        visible: sprite.visible,
        stageChildren: app.stage.children.length,
        spriteTexture: sprite.texture,
        textureValid: sprite.texture?.source?.valid,
        rendererSize: { width: app.renderer.width, height: app.renderer.height }
      });
      
      app.stage.addChild(sprite);
      
      // Force render to ensure sprite appears
      app.renderer.render(app.stage);
      
      console.log('After adding sprite:', {
        stageChildren: app.stage.children.length,
        spriteInStage: app.stage.children.includes(sprite),
        spriteWorldTransform: sprite.worldTransform
      });
      
       const dragonData = { 
         sprite, 
         animator, 
         x, 
         y,
         lastFireTime: 0,
         fireRate: 1500 + Math.random() * 300 // 1.5-1.8 second fire rate variation
       };
       dragons.push(dragonData);
      
      // Set the FPS and start animation if global state is playing
      animator.setFPS(currentFPS);
      if (globalAnimationState) {
        await animator.start();
      }
      
      console.log('Animated dragon spawned successfully, total:', dragons.length);
      
       // Force reactivity update
       dragons = dragons;
       
       // Update attack range display
       drawAttackRange();
     } catch (error) {
       console.error('Failed to spawn animated dragon:', error);
     }
   }

  async function toggleGlobalAnimation() {
    globalAnimationState = !globalAnimationState;
    
    // Update dragons
    for (const dragon of dragons) {
      if (globalAnimationState) {
        await dragon.animator.start();
      } else {
        dragon.animator.pause();
      }
    }
    
    // Update enemies
    for (const enemy of enemies) {
      if (globalAnimationState) {
        await enemy.animator.start();
      } else {
        enemy.animator.pause();
      }
    }
  }

  function removeAllDragons() {
    for (const dragon of dragons) {
      dragon.animator.destroy();
      app.stage.removeChild(dragon.sprite);
    }
    dragons = [];
    
    // Update attack range display (will hide it since no dragons)
    drawAttackRange();
  }

  function removeAllEnemies() {
    // Stop shooting first
    stopEnemyShooting();
    
    for (const enemy of enemies) {
      enemy.animator.destroy();
      app.stage.removeChild(enemy.sprite);
    }
    enemies = [];
    
    // Reset enemy formation
    enemyFormation.currentColumn = 0;
    enemyFormation.currentPosition = 0;
    enemyFormation.enemiesPerColumn = 0;
    
    // Update visual displays (will hide them since no enemies)
    drawEnemyAttackRange();
    drawHealthBars();
    
    console.log('Enemy formation reset');
  }

  function removeAll() {
    removeAllDragons();
    removeAllEnemies();
    removeAllProjectiles();
  }

  function removeAllProjectiles() {
    for (const projectile of projectiles) {
      projectile.destroy();
    }
    projectiles = [];
  }

  function drawAttackRange() {
    if (!app || !showAttackRange || dragons.length === 0) {
      // Hide attack range if no dragons or disabled
      if (attackRangeGraphics) {
        attackRangeGraphics.visible = false;
      }
      return;
    }

    // Create graphics object if it doesn't exist
    if (!attackRangeGraphics) {
      attackRangeGraphics = new Graphics();
      app.stage.addChild(attackRangeGraphics);
    }

    // Clear previous drawing
    attackRangeGraphics.clear();

    // Draw attack range for each dragon
    dragons.forEach((dragon) => {
      if (!attackRangeGraphics) return;
      
      // Draw a black circle outline to show attack range
      attackRangeGraphics
        .circle(dragon.x, dragon.y, DRAGON_ATTACK_RANGE)
        .stroke({ width: 2, color: 0x000000, alpha: 0.8 });
      
      // Draw a thin line from dragon center to edge (showing range direction)
      attackRangeGraphics
        .moveTo(dragon.x, dragon.y)
        .lineTo(dragon.x + DRAGON_ATTACK_RANGE, dragon.y)
        .stroke({ width: 1, color: 0x000000, alpha: 0.6 });
      
      // Add range text
      const rangeText = `${DRAGON_ATTACK_RANGE}px`;
      // Note: For simplicity, we'll just draw the circle. 
      // Text rendering in PixiJS would require additional setup.
    });

    attackRangeGraphics.visible = true;
    
    // Force render
    app.renderer.render(app.stage);
  }

  function toggleAttackRange() {
    showAttackRange = !showAttackRange;
    drawAttackRange();
    console.log(`Dragon attack range indicator: ${showAttackRange ? 'ON' : 'OFF'}`);
  }

  function drawEnemyAttackRange() {
    if (!app || !showEnemyAttackRange || enemies.length === 0) {
      // Hide enemy attack range if no enemies or disabled
      if (enemyAttackRangeGraphics) {
        enemyAttackRangeGraphics.visible = false;
      }
      return;
    }

    // Create graphics object if it doesn't exist
    if (!enemyAttackRangeGraphics) {
      enemyAttackRangeGraphics = new Graphics();
      app.stage.addChild(enemyAttackRangeGraphics);
    }

    // Clear previous drawing
    enemyAttackRangeGraphics.clear();

    // Draw attack range for each enemy
    enemies.forEach((enemy) => {
      if (!enemyAttackRangeGraphics) return;
      
      // Draw a red circle outline to show enemy attack range
      enemyAttackRangeGraphics
        .circle(enemy.x, enemy.y, ENEMY_ATTACK_RANGE)
        .stroke({ width: 2, color: 0xFF0000, alpha: 0.6 });
      
      // Draw a thin line from enemy center to edge (showing range direction toward dragon)
      if (dragons.length > 0) {
        const dragon = dragons[0]; // Target first dragon
        const dx = dragon.x - enemy.x;
        const dy = dragon.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const lineEndX = enemy.x + (dx / distance) * ENEMY_ATTACK_RANGE;
          const lineEndY = enemy.y + (dy / distance) * ENEMY_ATTACK_RANGE;
          
          enemyAttackRangeGraphics
            .moveTo(enemy.x, enemy.y)
            .lineTo(lineEndX, lineEndY)
            .stroke({ width: 1, color: 0xFF0000, alpha: 0.4 });
        }
      }
    });

    enemyAttackRangeGraphics.visible = true;
    
    // Force render
    app.renderer.render(app.stage);
  }

  function toggleEnemyAttackRange() {
    showEnemyAttackRange = !showEnemyAttackRange;
    drawEnemyAttackRange();
    console.log(`Enemy attack range indicator: ${showEnemyAttackRange ? 'ON' : 'OFF'}`);
  }

  function drawHealthBars() {
    if (!app || enemies.length === 0) {
      // Hide health bars if no enemies
      if (healthBarsGraphics) {
        healthBarsGraphics.visible = false;
      }
      return;
    }

    // Create graphics object if it doesn't exist
    if (!healthBarsGraphics) {
      healthBarsGraphics = new Graphics();
      app.stage.addChild(healthBarsGraphics);
    }

    // Clear previous drawing
    healthBarsGraphics.clear();

    // Draw health bars for each enemy
    enemies.forEach((enemy) => {
      if (!healthBarsGraphics) return;
      
      const barWidth = 40;
      const barHeight = 6;
      const barX = enemy.x - barWidth / 2;
      const barY = enemy.y - 40; // Position above enemy
      
      // Calculate health percentage
      const healthPercent = Math.max(0, enemy.health / enemy.maxHealth);
      
      // Background bar (red)
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .fill({ color: 0xFF0000, alpha: 0.8 });
      
      // Health bar (green to yellow to red based on health)
      if (healthPercent > 0) {
        let healthColor = 0x00FF00; // Green
        if (healthPercent < 0.5) {
          healthColor = 0xFFFF00; // Yellow
        }
        if (healthPercent < 0.25) {
          healthColor = 0xFF4500; // Orange-red
        }
        
        const currentBarWidth = barWidth * healthPercent;
        healthBarsGraphics
          .rect(barX, barY, currentBarWidth, barHeight)
          .fill({ color: healthColor, alpha: 0.9 });
      }
      
      // Border around health bar
      healthBarsGraphics
        .rect(barX, barY, barWidth, barHeight)
        .stroke({ width: 1, color: 0x000000, alpha: 0.8 });
    });

    healthBarsGraphics.visible = true;
    
    // Force render
    app.renderer.render(app.stage);
  }

  async function fireProjectileFromEnemy(enemyIndex: number) {
    if (!app || enemyIndex >= enemies.length || dragons.length === 0) return;

    const enemy = enemies[enemyIndex];
    
    if (!enemy) {
      console.warn('Invalid enemy for projectile firing');
      return;
    }
    
    // Find dragons in range of this enemy
    const dragonsInRange = dragons.filter(dragon => {
      const dx = dragon.x - enemy.x;
      const dy = dragon.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= ENEMY_ATTACK_RANGE;
    });

    if (dragonsInRange.length === 0) {
      console.log(`${enemy.type} has no dragons in range (${ENEMY_ATTACK_RANGE}px) - not firing`);
      return; // No dragons in range, don't fire
    }

    // Target the closest dragon in range
    let closestDragon = dragonsInRange[0];
    let closestDistance = Infinity;
    
    dragonsInRange.forEach(dragon => {
      const dx = dragon.x - enemy.x;
      const dy = dragon.y - enemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestDragon = dragon;
      }
    });
    
    try {
      const projectileType = getProjectileTypeForEnemy(enemy.type);
      const projectile = await createProjectile(
        projectileType,
        enemy.x, // Start at enemy position
        enemy.y,
        closestDragon.x, // Target closest dragon in range
        closestDragon.y,
        app.renderer,
        app.stage
      );
      
      projectile.setFPS(currentFPS);
      projectiles.push(projectile);
      
      console.log(`${enemy.type} fired projectile toward dragon (distance: ${Math.round(closestDistance)}px)`);
      
      // Force reactivity update
      projectiles = projectiles;
    } catch (error) {
      console.error(`Failed to fire projectile from ${enemy.type}:`, error);
    }
  }

  function startEnemyShooting() {
    if (enemiesShooting || enemies.length === 0 || dragons.length === 0) return;
    
    enemiesShooting = true;
    console.log('All enemies start shooting!');
    
    // Clear any existing intervals
    enemyShootingIntervals.forEach(interval => clearInterval(interval));
    enemyShootingIntervals = [];
    
    // Create individual firing intervals for each enemy
    enemies.forEach((enemy, enemyIndex) => {
      // Stagger initial firing times to avoid all shooting at once
      const initialDelay = Math.random() * 1000; // 0-1 second random delay
      const baseFireRate = 2000; // 2 seconds base rate
      const fireRateVariation = Math.random() * 500 - 250; // ±250ms variation per enemy
      const enemyFireRate = baseFireRate + fireRateVariation;
      
      // Start with initial delay, then fire at regular intervals
      const intervalId = window.setTimeout(() => {
        // Fire immediately after initial delay
        fireProjectileFromEnemy(enemyIndex);
        
        // Then set up regular interval
        const regularInterval = window.setInterval(() => {
          if (!enemiesShooting || enemyIndex >= enemies.length || dragons.length === 0) {
            clearInterval(regularInterval);
            return;
          }
          fireProjectileFromEnemy(enemyIndex);
        }, enemyFireRate);
        
        enemyShootingIntervals.push(regularInterval);
      }, initialDelay);
      
      enemyShootingIntervals.push(intervalId);
    });
    
    console.log(`Started ${enemies.length} enemy firing intervals`);
  }

  function stopEnemyShooting() {
    enemiesShooting = false;
    
    // Clear all enemy shooting intervals
    enemyShootingIntervals.forEach(interval => clearInterval(interval));
    enemyShootingIntervals = [];
    
    console.log('All enemies stop shooting - intervals cleared');
  }

  async function fireProjectileFromDragon(dragonIndex: number) {
    if (!app || dragonIndex >= dragons.length || enemies.length === 0) return;

    const dragon = dragons[dragonIndex];
    
    // Find enemies in range
    const enemiesInRange = enemies.filter(enemy => {
      const dx = enemy.x - dragon.x;
      const dy = enemy.y - dragon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= DRAGON_ATTACK_RANGE;
    });

    if (enemiesInRange.length === 0) return;

    // Target the closest enemy in range
    let closestEnemy = enemiesInRange[0];
    let closestDistance = Infinity;
    
    enemiesInRange.forEach(enemy => {
      const dx = enemy.x - dragon.x;
      const dy = enemy.y - dragon.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestEnemy = enemy;
      }
    });

    try {
      const projectileType = getDragonProjectileType();
      
      // Create collision callback that checks if projectile hits any enemy
      const collisionCallback = (projectileSprite: Sprite) => {
        // Check collision with all enemies using sprite bounds
        for (let i = 0; i < enemies.length; i++) {
          const enemy = enemies[i];
          
          // Get sprite bounds for accurate collision detection
          const projectileBounds = projectileSprite.getBounds();
          const enemyBounds = enemy.sprite.getBounds();
          
          // Check if bounds intersect (sprite hit-box collision)
          const isColliding = (
            projectileBounds.x < enemyBounds.x + enemyBounds.width &&
            projectileBounds.x + projectileBounds.width > enemyBounds.x &&
            projectileBounds.y < enemyBounds.y + enemyBounds.height &&
            projectileBounds.y + projectileBounds.height > enemyBounds.y
          );
          
          if (isColliding) {
            // Deal damage to enemy
            enemy.health -= DRAGON_BASE_DAMAGE;
            console.log(`Dragon projectile hit ${enemy.type} for ${DRAGON_BASE_DAMAGE} damage! Health: ${enemy.health}/${enemy.maxHealth}`);
            
            // Check if enemy is killed
            if (enemy.health <= 0) {
              console.log(`${enemy.type} defeated!`);
              // Remove enemy from game
              enemy.animator.destroy();
              app.stage.removeChild(enemy.sprite);
              enemies.splice(i, 1);
              
              // Update enemy attack range display
              drawEnemyAttackRange();
              
              // Force reactivity update
              enemies = enemies;
            }
            
            return true; // Collision occurred
          }
        }
        return false; // No collision
      };

      const projectile = await createProjectile(
        projectileType,
        dragon.x, // Start at dragon position
        dragon.y,
        closestEnemy.x, // Target closest enemy position
        closestEnemy.y,
        app.renderer,
        app.stage,
        collisionCallback
      );
      
      projectile.setFPS(currentFPS);
      projectiles.push(projectile);
      
      console.log(`Dragon fired projectile toward ${closestEnemy.type}`);
      
      // Force reactivity update
      projectiles = projectiles;
    } catch (error) {
      console.error(`Failed to fire projectile from dragon:`, error);
    }
  }

  function startDragonAttacking() {
    if (dragonsAttacking || dragons.length === 0 || enemies.length === 0) return;
    
    dragonsAttacking = true;
    console.log('All dragons start attacking!');
    
    // Clear any existing intervals
    dragonAttackIntervals.forEach(interval => clearInterval(interval));
    dragonAttackIntervals = [];
    
    // Create individual attack intervals for each dragon
    dragons.forEach((dragon, dragonIndex) => {
      // Stagger initial attack times
      const initialDelay = Math.random() * 500; // 0-0.5 second random delay
      const baseAttackRate = 1500; // 1.5 seconds base rate (faster than enemies)
      const attackRateVariation = Math.random() * 200 - 100; // ±100ms variation per dragon
      const dragonAttackRate = baseAttackRate + attackRateVariation;
      
      // Start with initial delay, then attack at regular intervals
      const intervalId = window.setTimeout(() => {
        // Attack immediately after initial delay
        fireProjectileFromDragon(dragonIndex);
        
        // Then set up regular interval
        const regularInterval = window.setInterval(() => {
          if (!dragonsAttacking || dragonIndex >= dragons.length || enemies.length === 0) {
            clearInterval(regularInterval);
            return;
          }
          fireProjectileFromDragon(dragonIndex);
        }, dragonAttackRate);
        
        dragonAttackIntervals.push(regularInterval);
      }, initialDelay);
      
      dragonAttackIntervals.push(intervalId);
    });
    
    console.log(`Started ${dragons.length} dragon attack intervals`);
  }

  function stopDragonAttacking() {
    dragonsAttacking = false;
    
    // Clear all dragon attack intervals
    dragonAttackIntervals.forEach(interval => clearInterval(interval));
    dragonAttackIntervals = [];
    
    console.log('All dragons stop attacking - intervals cleared');
  }

  function startProjectileUpdateLoop() {
    let lastTime = performance.now();
    
    function updateProjectiles() {
      if (!app) return;
      
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update all projectiles
      const activeProjectiles = [];
      for (const projectile of projectiles) {
        const stillActive = projectile.update(deltaTime);
        if (stillActive) {
          activeProjectiles.push(projectile);
        } else {
          console.log('Projectile hit target and destroyed');
        }
      }
      
      // Update projectiles array if any were removed
      if (activeProjectiles.length !== projectiles.length) {
        projectiles = activeProjectiles;
      }
      
      // Continue loop
      requestAnimationFrame(updateProjectiles);
    }
    
    // Start the loop
    requestAnimationFrame(updateProjectiles);
    console.log('Projectile update loop started');
  }

  function startEnemyMovementAndCombatLoop() {
    let lastTime = performance.now();
    
    function updateEnemiesAndCombat() {
      if (!app) return;
      
      const currentTime = performance.now();
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      // Update enemy movement and combat
      enemies.forEach((enemy, index) => {
        if (!dragons.length) return;
        
        const closestDragon = dragons[0]; // For simplicity, target first dragon
        const dx = closestDragon.x - enemy.x;
        const dy = closestDragon.y - enemy.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Move enemy toward dragon if not in attack range
        if (enemy.isMoving && distance > ENEMY_ATTACK_RANGE) {
          // Get current speed multiplier from animator (with smooth transitions)
          const currentSpeedMultiplier = enemy.animator.getCurrentSpeedMultiplier();
          const moveDistance = ENEMY_MOVE_SPEED * currentSpeedMultiplier * (deltaTime / 1000);
          
          if (distance > 0) {
            const moveX = (dx / distance) * moveDistance;
            const moveY = (dy / distance) * moveDistance;
            
            enemy.x += moveX;
            enemy.y += moveY;
            enemy.sprite.position.set(enemy.x, enemy.y);
            
            // Update the stored speed multiplier for display/debugging
            enemy.currentSpeedMultiplier = currentSpeedMultiplier;
          }
        } else if (distance <= ENEMY_ATTACK_RANGE) {
          // Stop moving when in range
          enemy.isMoving = false;
          
          // For mantair corsair, hold the explosive frame when in attack range
          if (enemy.type === 'mantair-corsair' && enemy.animator.getCurrentFrame() !== 'fly_3') {
            // Force the corsair to the explosive frame and hold it
            enemy.animator.forceFrame('fly_3', true); // true = hold this frame
          }
          
          // Auto-fire if enough time has passed
          if (currentTime - enemy.lastFireTime >= enemy.fireRate) {
            fireProjectileFromEnemy(index);
            enemy.lastFireTime = currentTime;
          }
        } else if (distance > ENEMY_ATTACK_RANGE * 1.2) {
          // Resume moving if dragon moves away
          enemy.isMoving = true;
          
          // For mantair corsair, resume normal animation when moving again
          if (enemy.type === 'mantair-corsair') {
            enemy.animator.forceFrame('fly_3', false); // false = resume normal animation
          }
        }
      });
      
      // Update dragon automatic combat
      dragons.forEach((dragon, index) => {
        // Check if any enemies are in dragon's attack range
        const enemiesInRange = enemies.filter(enemy => {
          const dx = enemy.x - dragon.x;
          const dy = enemy.y - dragon.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          return distance <= DRAGON_ATTACK_RANGE;
        });
        
        // Auto-fire if enemies in range and enough time has passed
        if (enemiesInRange.length > 0 && currentTime - dragon.lastFireTime >= dragon.fireRate) {
          fireProjectileFromDragon(index);
          dragon.lastFireTime = currentTime;
        }
      });
      
      // Update visual displays
      drawAttackRange();
      drawEnemyAttackRange();
      drawHealthBars();
      
      // Continue loop
      requestAnimationFrame(updateEnemiesAndCombat);
    }
    
    // Start the loop
    requestAnimationFrame(updateEnemiesAndCombat);
    console.log('Enemy movement and combat loop started');
  }

  function startAutoSpawning() {
    if (autoSpawning || !isLoaded) return;
    
    autoSpawning = true;
    console.log('Auto-spawning started - simulating gameplay!');
    
    const scheduleNextSpawn = () => {
      if (!autoSpawning) return;
      
      // Calculate next spawn time with variation
      const baseTime = AUTO_SPAWN_CONFIG.baseInterval;
      const variation = (Math.random() - 0.5) * AUTO_SPAWN_CONFIG.intervalVariation;
      const nextSpawnTime = baseTime + variation;
      
      autoSpawnInterval = window.setTimeout(() => {
        if (!autoSpawning) return;
        
        // Check if we haven't reached max enemy limit
        if (enemies.length < AUTO_SPAWN_CONFIG.maxEnemies) {
          // Randomly select enemy type
          const randomEnemyType = AUTO_SPAWN_CONFIG.enemyTypes[
            Math.floor(Math.random() * AUTO_SPAWN_CONFIG.enemyTypes.length)
          ];
          
          // Spawn the enemy
          spawnEnemy(randomEnemyType);
          console.log(`Auto-spawned ${randomEnemyType} (${enemies.length + 1}/${AUTO_SPAWN_CONFIG.maxEnemies})`);
        } else {
          console.log(`Max enemies reached (${AUTO_SPAWN_CONFIG.maxEnemies}) - waiting for some to be defeated`);
        }
        
        // Schedule next spawn
        scheduleNextSpawn();
      }, nextSpawnTime);
    };
    
    // Start the spawning cycle
    scheduleNextSpawn();
  }

  function stopAutoSpawning() {
    autoSpawning = false;
    
    if (autoSpawnInterval) {
      clearTimeout(autoSpawnInterval);
      autoSpawnInterval = null;
    }
    
    console.log('Auto-spawning stopped');
  }

  function toggleAutoSpawning() {
    if (autoSpawning) {
      stopAutoSpawning();
    } else {
      startAutoSpawning();
    }
  }

  function changeFPS(newFPS: number) {
    currentFPS = newFPS;
    console.log(`Changing all animations to ${newFPS} FPS`);
    
    // Update FPS for all existing dragons
    for (const dragon of dragons) {
      dragon.animator.setFPS(newFPS);
    }
    
    // Update FPS for all existing enemies
    for (const enemy of enemies) {
      enemy.animator.setFPS(newFPS);
    }
    
    // Update FPS for all existing projectiles
    for (const projectile of projectiles) {
      projectile.setFPS(newFPS);
    }
  }

  function spawnCenterDragon() {
    if (!app || !isLoaded) return;
    
    // Spawn a dragon on the left side of the screen (game-like positioning)
    createAnimatedDragonSprite(app.renderer, app.stage).then(({ sprite, animator }: { sprite: Sprite; animator: DragonAnimator }) => {
      const dragonX = 150; // Left side positioning
      const dragonY = app.renderer.height / 2; // Vertically centered
      
      sprite.position.set(dragonX, dragonY);
      sprite.scale.set(1.0);
      sprite.visible = true; // Explicitly set visible
      
      console.log('Adding left-side dragon to stage:', {
        position: sprite.position,
        visible: sprite.visible,
        stageChildren: app.stage.children.length
      });
      
      app.stage.addChild(sprite);
      
      // Force render to ensure sprite appears
      app.renderer.render(app.stage);
      
       const dragonData = { 
         sprite, 
         animator, 
         x: dragonX, 
         y: dragonY,
         lastFireTime: 0,
         fireRate: 1500 + Math.random() * 300 // 1.5-1.8 second fire rate variation
       };
       dragons.push(dragonData);
      
      // Set the FPS and start animation if global state is playing
      animator.setFPS(currentFPS);
      if (globalAnimationState) {
        animator.start();
      }
      
      console.log('Left-side dragon spawned successfully, total:', dragons.length);
      
       dragons = dragons;
       
       // Update attack range display
       drawAttackRange();
     }).catch((error: unknown) => {
       console.error('Failed to spawn left-side dragon:', error);
     });
   }

  function calculateEnemyPosition(): { x: number; y: number } {
    // Spawn from right side, just in front of the test bar (about 300px from right edge)
    const spawnX = app.renderer.width - 320; // Just in front of the 280px wide test bar + margin
    
    // Random Y position with some margin from top and bottom
    const margin = 50;
    const spawnY = margin + Math.random() * (app.renderer.height - margin * 2);
    
    return { x: spawnX, y: spawnY };
  }

  // Formation tracking is no longer used - enemies spawn randomly from right side

  async function spawnEnemy(enemyType: EnemyType) {
    if (!app || !isLoaded) return;
    
    try {
      const { sprite, animator } = await createAnimatedEnemySprite(enemyType, app.renderer, app.stage);
      
      // Use smart formation positioning
      const { x, y } = calculateEnemyPosition();
      
      sprite.position.set(x, y);
      sprite.scale.set(0.75); // Make enemies a bit smaller
      sprite.visible = true;
      sprite.alpha = 1.0;
      sprite.tint = 0xFFFFFF;
      
      console.log(`Adding ${enemyType} to formation:`, {
        position: sprite.position,
        column: enemyFormation.currentColumn + 1,
        positionInColumn: enemyFormation.currentPosition + 1,
        visible: sprite.visible
      });
      
      app.stage.addChild(sprite);
      app.renderer.render(app.stage);
      
       const maxHealth = ENEMY_HEALTH_CONFIG[enemyType] || 10; // Default to 10 if not found
       const enemyData = { 
         sprite, 
         animator, 
         x, 
         y, 
         type: enemyType,
         isMoving: true, // Start moving toward dragon
         lastFireTime: 0,
         fireRate: 2000 + Math.random() * 500, // 2-2.5 second fire rate variation
         health: maxHealth,
         maxHealth: maxHealth,
         currentSpeedMultiplier: 1.0, // Track current movement speed multiplier
         lastFrameChangeTime: performance.now() // Track when frame changed for smooth transitions
       };
       enemies.push(enemyData);
      
      // Set up frame change callback to update movement speed
      animator.setFrameChangeCallback((frame: any, speedMultiplier: number) => {
        enemyData.currentSpeedMultiplier = speedMultiplier;
        enemyData.lastFrameChangeTime = performance.now();
        console.log(`${enemyType} movement speed updated: ${speedMultiplier.toFixed(2)}x (frame: ${frame})`);
      });
      
      // Set the FPS and start animation if global state is playing
      animator.setFPS(currentFPS);
      if (globalAnimationState) {
        await animator.start();
      }
      
      console.log(`${enemyType} spawned in formation, total enemies:`, enemies.length);
      
       // Force reactivity update
       enemies = enemies;
       
       // Update enemy attack range display
       drawEnemyAttackRange();
     } catch (error) {
       console.error(`Failed to spawn ${enemyType}:`, error);
     }
   }

  function spawnMantairCorsair() {
    spawnEnemy('mantair-corsair');
  }

  function spawnSwarm() {
    spawnEnemy('swarm');
  }

  onMount(async () => {
    try {
      console.log('Creating PixiJS app with explicit settings...');
      app = new Application();
      await app.init({ 
        canvas: canvas,
        backgroundAlpha: 0,
        antialias: false,
        resolution: 1,
        autoDensity: true,
        width: canvas.clientWidth || 800,
        height: canvas.clientHeight || 600
      });
      
      // Stop ticker to avoid conflicts (we'll use manual rendering)
      if (app.ticker) {
        app.ticker.stop();
        console.log('Ticker stopped to avoid conflicts');
      }
      
      console.log('PixiJS app initialized:', {
        renderer: {
          width: app.renderer.width,
          height: app.renderer.height,
          type: app.renderer.type
        },
        stage: app.stage,
        canvas: app.canvas
      });
      
      isLoaded = true;
      
       // Start projectile update loop
       startProjectileUpdateLoop();
       
       // Start enemy movement and combat loop
       startEnemyMovementAndCombatLoop();
       
       // Spawn one dragon on the left side to start
       console.log('Attempting to spawn dragon...');
       await spawnCenterDragon();
       console.log('Dragon spawn completed');
    } catch (error: unknown) {
      console.error('Failed to initialize PIXI app:', error);
      if (error instanceof Error) {
        console.error('Error details:', {
          message: error.message,
          stack: error.stack,
          name: error.name
        });
      }
    }
  });

  onDestroy(() => {
    // Stop shooting and clear all intervals
    stopEnemyShooting();
    
    // Clean up all dragons
    for (const dragon of dragons) {
      dragon.animator.destroy();
    }
    dragons = [];
    
    // Clean up all enemies
    for (const enemy of enemies) {
      enemy.animator.destroy();
    }
    enemies = [];
    
    // Clean up all projectiles
    for (const projectile of projectiles) {
      projectile.destroy();
    }
    projectiles = [];
    
    // Final cleanup of any remaining intervals
    enemyShootingIntervals.forEach(interval => clearInterval(interval));
    enemyShootingIntervals = [];
    
    // Clean up attack range graphics
    if (attackRangeGraphics) {
      attackRangeGraphics.destroy();
      attackRangeGraphics = null;
    }
    
    // Clean up enemy attack range graphics
    if (enemyAttackRangeGraphics) {
      enemyAttackRangeGraphics.destroy();
      enemyAttackRangeGraphics = null;
    }
    
    // Clean up health bars graphics
    if (healthBarsGraphics) {
      healthBarsGraphics.destroy();
      healthBarsGraphics = null;
    }
    
    // Stop auto-spawning
    stopAutoSpawning();
    
    // Note: Automatic combat loops will stop when app is destroyed
    
    if (app) {
      app.destroy(true, { children: true });
    }
  });

  // Reactive statement to show current frame info
  $: currentFrameInfo = dragons.length > 0 
    ? dragons[0]?.animator.getCurrentFrame() 
    : 'none';
</script>

<div style="position:fixed; inset:0; background: linear-gradient(to bottom, 
    /* Sky layers with authentic steppe blues */
    #4169E1 0%,     /* Deep sky blue */
    #87CEEB 15%,    /* Main sky blue from images */
    #B0E0E6 30%,    /* Powder blue for atmosphere */
    #E6F3FF 45%,    /* Morning haze near horizon */
    /* Grass layers with extracted steppe greens */
    #6B8E23 60%,    /* Primary olive drab grass */
    #228B22 75%,    /* Rich forest green grass */
    #9ACD32 85%,    /* Yellow-green sunlit grass */
    #556B2F 100%    /* Dark olive green shadows */
  );">
  
  <!-- Atmospheric depth layers -->
  <div style="position: absolute; inset: 0; 
    background: radial-gradient(ellipse at 50% 45%, 
      rgba(240, 248, 255, 0.3) 0%,     /* Heat shimmer effect */
      rgba(230, 243, 255, 0.2) 40%,    /* Morning mist */
      rgba(176, 224, 230, 0.1) 70%,    /* Atmospheric blue */
      transparent 100%
    );"></div>
  
  <!-- Distance mountains/hills layer -->
  <div style="position: absolute; inset: 0; 
    background: linear-gradient(to bottom, 
      transparent 0%, 
      transparent 40%,
      rgba(112, 128, 144, 0.15) 45%,   /* Distant slate grey mountains */
      rgba(100, 149, 237, 0.1) 50%,    /* Cornflower blue atmospheric mountains */
      transparent 55%,
      transparent 100%
    );"></div>
  
  <!-- Grass texture variation -->
  <div style="position: absolute; inset: 0; 
    background: linear-gradient(135deg, 
      transparent 0%,
      rgba(154, 205, 50, 0.1) 25%,     /* Yellow-green grass highlights */
      transparent 50%,
      rgba(85, 107, 47, 0.05) 75%,     /* Dark olive grass shadows */
      transparent 100%
    ); 
    background-size: 200px 200px;"></div>
  
  <!-- Wind and dust effects -->
  <div style="position: absolute; inset: 0; 
    background: radial-gradient(circle at 30% 70%, 
      rgba(245, 245, 220, 0.05) 0%,    /* Seed drift particles */
      transparent 30%
    ), 
    radial-gradient(circle at 70% 60%, 
      rgba(222, 184, 135, 0.03) 0%,    /* Dust swirl */
      transparent 40%
    );"></div>

  <canvas bind:this={canvas} style="width:100%; height:100%; display:block;"></canvas>
  
  <div style="position:absolute; right:8px; top:8px; background:rgba(0,0,0,.9); color:#fff; padding:16px; border-radius:12px; font:12px system-ui; min-width:280px; max-width:320px; backdrop-filter: blur(10px); overflow-wrap:break-word;">
    <h3 style="margin:0 0 12px 0; font-size:16px; color:#4CAF50;">🐉 Dragon Animation Test</h3>
    
    <div style="margin-bottom:12px; padding:8px; background:rgba(255,255,255,.1); border-radius:6px;">
      <div style="font-size:11px; color:#aaa; margin-bottom:4px;">Animation Status</div>
      <div style="color: {globalAnimationState ? '#4CAF50' : '#f44336'};">
        {globalAnimationState ? '▶️ Playing' : '⏸️ Paused'} at {currentFPS} FPS
      </div>
      <div style="font-size:10px; color:#888; margin-top:2px;">
        Current Frame: {currentFrameInfo}
      </div>
    </div>

    <div style="margin-bottom:12px; padding:8px; background:rgba(255,255,255,.1); border-radius:6px;">
      <div style="font-size:11px; color:#aaa; margin-bottom:6px;">Animation Speed</div>
      <div style="display:flex; align-items:center; gap:8px;">
        <input 
          type="range" 
          min="1" 
          max="20" 
          step="1"
          bind:value={currentFPS}
          on:input={() => changeFPS(currentFPS)}
          style="flex:1; accent-color:#4CAF50;"
        />
        <input 
          type="number" 
          min="1" 
          max="20" 
          bind:value={currentFPS}
          on:input={() => changeFPS(currentFPS)}
          style="width:50px; padding:2px 4px; background:#333; color:#fff; border:1px solid #555; border-radius:3px; font-size:10px;"
        />
        <span style="font-size:10px; color:#888;">FPS</span>
      </div>
      <div style="font-size:9px; color:#666; margin-top:4px;">
        1 FPS = Slow | 8 FPS = Default | 20 FPS = Fast
      </div>
    </div>
    
    <div style="display:flex; flex-direction:column; gap:8px;">
      <div style="display:flex; gap:6px;">
        <button 
          on:click={spawnCenterDragon} 
          disabled={!isLoaded}
          style="flex:1; padding:8px 12px; background:#4CAF50; color:white; border:none; border-radius:6px; cursor:pointer; font-size:11px;">
          🎯 Left Dragon
        </button>
        
        <button 
          on:click={spawnAnimatedDragon} 
          disabled={!isLoaded}
          style="flex:1; padding:8px 12px; background:#2196F3; color:white; border:none; border-radius:6px; cursor:pointer; font-size:11px;">
          🎲 Random Dragon
        </button>
      </div>

      <div style="font-size:10px; color:#aaa; margin:4px 0;">Wind Swept Nomads:</div>
      
      <div style="display:flex; gap:6px;">
        <button 
          on:click={spawnMantairCorsair} 
          disabled={!isLoaded}
          style="flex:1; padding:8px 12px; background:#FF6B35; color:white; border:none; border-radius:6px; cursor:pointer; font-size:10px;">
          ⚔️ Mantair Corsair
        </button>
        
        <button 
          on:click={spawnSwarm} 
          disabled={!isLoaded}
          style="flex:1; padding:8px 12px; background:#8B4513; color:white; border:none; border-radius:6px; cursor:pointer; font-size:10px;">
          🐝 Swarm
        </button>
      </div>
      
      <button 
        on:click={toggleGlobalAnimation}
        disabled={!isLoaded || (dragons.length === 0 && enemies.length === 0)}
        style="padding:8px 12px; background:{globalAnimationState ? '#FF9800' : '#4CAF50'}; color:white; border:none; border-radius:6px; cursor:pointer; font-size:11px;">
        {globalAnimationState ? '⏸️ Pause All' : '▶️ Play All'}
      </button>

       <div style="font-size:10px; color:#aaa; margin:8px 0 4px 0;">Combat Controls:</div>
       
       <div style="display:flex; gap:6px; margin-bottom:6px;">
         <button 
           on:click={toggleAttackRange}
           disabled={!isLoaded || dragons.length === 0}
           style="flex:1; padding:6px 8px; background:{showAttackRange ? '#FF9800' : '#607D8B'}; color:white; border:none; border-radius:4px; cursor:pointer; font-size:9px;">
           📏 Dragon Range ({DRAGON_ATTACK_RANGE}px)
         </button>
         
         <button 
           on:click={toggleEnemyAttackRange}
           disabled={!isLoaded || enemies.length === 0}
           style="flex:1; padding:6px 8px; background:{showEnemyAttackRange ? '#FF5722' : '#795548'}; color:white; border:none; border-radius:4px; cursor:pointer; font-size:9px;">
           📏 Enemy Range ({ENEMY_ATTACK_RANGE}px)
         </button>
       </div>
       
       <div style="padding:8px; background:rgba(76, 175, 80, 0.2); border-radius:6px; text-align:center; margin-bottom:8px;">
         <div style="font-size:11px; color:#4CAF50; font-weight:bold;">🤖 Automatic Combat</div>
         <div style="font-size:9px; color:#aaa; margin-top:2px;">
           Dragons auto-attack enemies in range<br>
           Enemies move toward dragons, then auto-attack
         </div>
       </div>
       
       <button 
         on:click={toggleAutoSpawning}
         disabled={!isLoaded || dragons.length === 0}
         style="width:100%; padding:12px; background:{autoSpawning ? '#FF5722' : '#2196F3'}; color:white; border:none; border-radius:8px; cursor:pointer; font-size:12px; font-weight:bold; margin-bottom:12px;">
         {autoSpawning ? '⏹️ Stop Game Simulation' : '🎮 Start Game Simulation'}
       </button>
       
       {#if autoSpawning}
         <div style="padding:6px 8px; background:rgba(255, 87, 34, 0.2); border-radius:4px; text-align:center; margin-bottom:8px;">
           <div style="font-size:10px; color:#FF5722; font-weight:bold;">🎮 Game Running</div>
           <div style="font-size:8px; color:#aaa; margin-top:1px;">
             Auto-spawning every ~3 seconds | Max: {AUTO_SPAWN_CONFIG.maxEnemies} enemies
           </div>
         </div>
       {/if}
      
      
      <div style="display:flex; gap:6px;">
        <button 
          on:click={removeAllDragons}
          disabled={dragons.length === 0}
          style="flex:1; padding:6px 8px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer; font-size:10px;">
          🗑️ Clear Dragons
        </button>
        
        <button 
          on:click={removeAllEnemies}
          disabled={enemies.length === 0}
          style="flex:1; padding:6px 8px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer; font-size:10px;">
          🗑️ Clear Enemies
        </button>
      </div>
      
      <button 
        on:click={removeAll}
        disabled={dragons.length === 0 && enemies.length === 0}
        style="padding:8px 12px; background:#d32f2f; color:white; border:none; border-radius:6px; cursor:pointer; font-size:11px;">
        🗑️ Remove All
      </button>
    </div>
    
    <div style="border-top:1px solid #444; padding-top:12px; margin-top:12px;">
      <div style="font-size:11px; color:#aaa; margin-bottom:6px;">Statistics</div>
      <div>Dragons: {dragons.length}</div>
      <div>Enemies: {enemies.length}</div>
      <div>Projectiles: {projectiles.length}</div>
      <div>Total Sprites: {dragons.length + enemies.length + projectiles.length}</div>
      <div style="font-size:10px; color:#888; margin-top:4px;">
        Dragon Damage: {DRAGON_BASE_DAMAGE} per hit
      </div>
      <div style="font-size:10px; color:#888;">
        Enemy Health: Mantair {ENEMY_HEALTH_CONFIG['mantair-corsair']}HP | Swarm {ENEMY_HEALTH_CONFIG['swarm']}HP
      </div>
      <div style="font-size:10px; color:#888; margin-top:4px;">
        Formation: Column {enemyFormation.currentColumn + 1}, Position {enemyFormation.currentPosition + 1}
      </div>
       <div style="font-size:10px; color:#888;">
         Combat: {automaticCombat ? 'Automatic 🤖' : 'Manual'} | Moving: {enemies.filter(e => e.isMoving).length}
       </div>
       <div style="font-size:10px; color:#888;">
         Speed Range: {enemies.length > 0 ? `${Math.min(...enemies.map(e => e.currentSpeedMultiplier)).toFixed(1)}x - ${Math.max(...enemies.map(e => e.currentSpeedMultiplier)).toFixed(1)}x` : 'none'}
       </div>
       <div style="font-size:10px; color:#888;">
         Spawning: {autoSpawning ? `Auto 🎮 (${enemies.length}/${AUTO_SPAWN_CONFIG.maxEnemies})` : 'Manual'}
       </div>
      <div style="font-size:10px; color:#888;">
        {isLoaded ? 'System ready ✓' : 'Loading...'}
      </div>
    </div>

    <div style="border-top:1px solid #444; padding-top:12px; margin-top:12px;">
      <div style="font-size:10px; color:#888; line-height:1.4;">
        <strong>Animation Sequence:</strong><br>
        idle → fly_1 → fly_2 → fly_3 → repeat<br>
        <strong>Frame Rate:</strong> {currentFPS} FPS ({Math.round(1000/currentFPS)}ms/frame)
      </div>
    </div>
  </div>
</div>
