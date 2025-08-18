<script lang="ts">
	import { onMount } from 'svelte';
	import { addSteakReward, gameState, spawnEnemy, defeatEnemy, workerMessages } from '$lib/stores';
	import type { Enemy as GameEnemy, FromWorkerMessage } from '$lib/types';
	
	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let animationFrame: number;
	
	// Canvas dimensions - Dynamic responsive sizing for maximum space utilization
	const CANVAS_WIDTH = 1200; // Increased max size to fill larger containers
	const CANVAS_HEIGHT = 600;  // Increased maintaining 2:1 ratio
	
	// Game entities - Extended to include GameState properties
	interface Enemy {
		id: number;
		x: number;
		y: number;
		width: number;
		height: number;
		health: number;
		maxHealth: number;
		speed: number;
		targetX: number; // Target stopping position (distance from dragon)
		targetY: number; // Y position along flight path
		// Extended properties from GameState
		level: number;
		type: 'normal' | 'elite' | 'boss';
		element?: 'fire' | 'ice' | 'lightning' | 'poison';
		damage: number;
		abilities: string[];
		gameEnemy: GameEnemy; // Reference to the original game enemy
	}
	
	interface Fireball {
		id: number;
		x: number;
		y: number;
		targetX: number;
		targetY: number;
		speed: number;
		damage: number;
	}
	
	// Dragon positions - horizontal flight setup
	const baseDragonX = CANVAS_WIDTH * 0.2; // Dragon anchored at left third
	const baseDragonY = CANVAS_HEIGHT * 0.5; // Centered vertically
	
	$: state = $gameState;
	$: dragonCount = state?.dragonStats?.dragonCount || 1;
	$: currentDamage = state?.dragonStats?.damage || 1;
	$: fireRateMultiplier = state?.dragonStats?.fireRateMultiplier || 1.0;
	
	// Cloud system for movement effect
	interface Cloud {
		x: number;
		y: number;
		size: number;
		speed: number;
	}
	
	let clouds: Cloud[] = [];
	
	// Game state
	let enemies: Enemy[] = [];
	let fireballs: Fireball[] = [];
	let nextEnemyId = 1;
	let nextFireballId = 1;
	let tickCounter = 0;
	let lastEnemySpawn = 0;
	let lastFireballShot = 0;
	
	// Convert GameEnemy to rendering Enemy
	function createRenderEnemy(gameEnemy: GameEnemy): Enemy {
		// Calculate stopping position (distance from dragon for beaming)
		const stoppingDistance = 60; // Distance from dragon where enemies stop to beam
		const targetX = baseDragonX + stoppingDistance;
		
		// Boss enemies are larger
		const size = gameEnemy.type === 'boss' ? 50 : 30;
		
		const renderEnemy: Enemy = {
			id: gameEnemy.id,
			x: CANVAS_WIDTH + size, // Start off-screen right
			y: Math.random() * (CANVAS_HEIGHT - size - 80) + 40, // Random Y position with padding
			width: size,
			height: size,
			health: gameEnemy.hp,
			maxHealth: gameEnemy.maxHp,
			speed: gameEnemy.type === 'boss' ? ENEMY_SPEED * 0.5 : ENEMY_SPEED, // Bosses move slower
			targetX: targetX, // Stop at beaming distance from dragon
			targetY: Math.random() * (CANVAS_HEIGHT - size - 80) + 40, // Y position along flight path
			level: gameEnemy.level,
			type: gameEnemy.type,
			element: gameEnemy.element,
			damage: gameEnemy.damage,
			abilities: gameEnemy.abilities,
			gameEnemy: gameEnemy
		};
		
		return renderEnemy;
	}
	
	// Game settings - Balanced for faster idle gameplay
	const FPS = 60;
	const ENEMY_SPAWN_MIN = 3 * FPS; // Minimum 3 seconds between enemies (faster)
	const ENEMY_SPAWN_MAX = 5 * FPS; // Maximum 5 seconds between enemies (faster)
	const BASE_FIREBALL_COOLDOWN = 1.5 * FPS; // 1.5 seconds between shots (2x faster)
	const ENEMY_SPEED = 0.25; // Even slower speed, half of previous
	const FIREBALL_SPEED = 3; // Reduced by half for better visibility
	
	// Calculate actual fireball cooldown based on upgrades
	$: actualFireballCooldown = Math.max(30, Math.floor(BASE_FIREBALL_COOLDOWN / fireRateMultiplier));
	
	onMount(() => {
		// Initialize canvas context
		ctx = canvas.getContext('2d')!;
		
		// Set canvas size
		canvas.width = CANVAS_WIDTH;
		canvas.height = CANVAS_HEIGHT;
		
		// Initialize clouds
		initializeClouds();
		
		// Subscribe to worker messages
		const unsubscribe = workerMessages.subscribe((msg) => {
			if (!msg) return;
			
			if (msg.type === 'enemy:spawn') {
				// Add enemy to render list
				const renderEnemy = createRenderEnemy(msg.enemy);
				enemies.push(renderEnemy);
			}
			
			if (msg.type === 'enemy:defeated') {
				console.log('Enemy defeated! Rewards:', msg.rewards);
			}
		});
		
		// Start game loop
		startGameLoop();
		
		return () => {
			if (animationFrame) {
				cancelAnimationFrame(animationFrame);
			}
			unsubscribe();
		};
	});
	
	function initializeClouds() {
		// Create initial clouds for movement effect
		for (let i = 0; i < 8; i++) {
			clouds.push({
				x: Math.random() * CANVAS_WIDTH,
				y: Math.random() * (CANVAS_HEIGHT - 200),
				size: 20 + Math.random() * 40,
				speed: (0.2 + Math.random() * 0.8) * 0.25 // Quarter speed
			});
		}
	}
	
	function startGameLoop() {
		function gameLoop() {
			// Update game state
			tickCounter++;
			updateClouds();
			updateEnemies();
			updateFireballs();
			spawnEnemies();
			dragonAutoShoot();
			
			// Clear canvas
			ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			
			// Draw everything
			drawBackground();
			drawClouds();
			drawDragons();
			drawEnemies();
			drawFireballs();
			drawUI();
			
			// Continue loop
			animationFrame = requestAnimationFrame(gameLoop);
		}
		
		gameLoop();
	}
	
	function updateClouds() {
		// Move clouds left to simulate forward flight (horizontal)
		clouds.forEach(cloud => {
			cloud.x -= cloud.speed;
			// Reset cloud to right when it goes off left
			if (cloud.x < -cloud.size) {
				cloud.x = CANVAS_WIDTH + cloud.size;
				cloud.y = Math.random() * (CANVAS_HEIGHT - 200);
			}
		});
	}
	
	function drawBackground() {
		// Dark forge landscape with parallax hills and ember glow
		const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
		gradient.addColorStop(0, '#1a1a1a'); // Dark sky
		gradient.addColorStop(0.7, '#2d2d30'); // Dark forge atmosphere
		gradient.addColorStop(1, '#3e3e42'); // Ground level with ember hints
		
		ctx.fillStyle = gradient;
		ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
		
		// Distant hills (parallax layer 1)
		ctx.fillStyle = '#2a2a2a';
		ctx.beginPath();
		ctx.moveTo(0, CANVAS_HEIGHT * 0.7);
		ctx.quadraticCurveTo(CANVAS_WIDTH * 0.3, CANVAS_HEIGHT * 0.6, CANVAS_WIDTH * 0.6, CANVAS_HEIGHT * 0.65);
		ctx.quadraticCurveTo(CANVAS_WIDTH * 0.8, CANVAS_HEIGHT * 0.7, CANVAS_WIDTH, CANVAS_HEIGHT * 0.75);
		ctx.lineTo(CANVAS_WIDTH, CANVAS_HEIGHT);
		ctx.lineTo(0, CANVAS_HEIGHT);
		ctx.closePath();
		ctx.fill();
		
		// Lava glow at bottom
		const lavaGradient = ctx.createLinearGradient(0, CANVAS_HEIGHT * 0.85, 0, CANVAS_HEIGHT);
		lavaGradient.addColorStop(0, 'rgba(255, 107, 53, 0.1)');
		lavaGradient.addColorStop(1, 'rgba(255, 107, 53, 0.3)');
		ctx.fillStyle = lavaGradient;
		ctx.fillRect(0, CANVAS_HEIGHT * 0.85, CANVAS_WIDTH, CANVAS_HEIGHT * 0.15);
	}
	
	function drawClouds() {
		// Render as ember particles instead of clouds for forge theme
		clouds.forEach(cloud => {
			// Ember particle with gradient
			const emberGradient = ctx.createRadialGradient(cloud.x, cloud.y, 0, cloud.x, cloud.y, cloud.size);
			emberGradient.addColorStop(0, 'rgba(255, 140, 66, 0.8)');
			emberGradient.addColorStop(0.5, 'rgba(255, 107, 53, 0.6)');
			emberGradient.addColorStop(1, 'rgba(255, 107, 53, 0.1)');
			
			ctx.fillStyle = emberGradient;
			ctx.beginPath();
			ctx.arc(cloud.x, cloud.y, cloud.size * 0.3, 0, 2 * Math.PI);
			ctx.fill();
		});
	}
	
	function spawnEnemies() {
		// Don't spawn enemies if level is complete
		if (state && state.currentLevelState && state.currentLevelState.isComplete) {
			return;
		}
		
		// Request enemies from worker at random intervals (3-5 seconds)
		const nextSpawnTime = lastEnemySpawn + ENEMY_SPAWN_MIN + 
			Math.random() * (ENEMY_SPAWN_MAX - ENEMY_SPAWN_MIN);
			
		if (tickCounter >= nextSpawnTime && enemies.length < 3) { // Max 3 enemies on screen
			// Request enemy spawn from worker
			spawnEnemy();
			lastEnemySpawn = tickCounter;
		}
	}
	
	function updateEnemies() {
		// Move enemies toward dragon (horizontal approach) and remove ones that are out of bounds
		enemies = enemies.filter(enemy => {
			// Move left toward target stopping position
			if (enemy.x > enemy.targetX) {
				enemy.x -= enemy.speed;
			}
			
			// Keep enemy if it's still on screen and alive
			return enemy.x > -enemy.width - 50 && enemy.health > 0;
		});
	}
	
	function updateFireballs() {
		// Move fireballs toward their targets (horizontal flight)
		fireballs = fireballs.filter(fireball => {
			const dx = fireball.targetX - fireball.x;
			const dy = fireball.targetY - fireball.y;
			const distance = Math.sqrt(dx * dx + dy * dy);
			
			// Move fireball toward target
			fireball.x += (dx / distance) * fireball.speed;
			fireball.y += (dy / distance) * fireball.speed;
			
			// Check for collision with any enemy
			const hitEnemy = checkFireballCollision(fireball);
			if (hitEnemy) {
				return false; // Remove fireball immediately on hit
			}
			
			// Remove fireball if it goes off screen or reaches target
			if (distance < fireball.speed || fireball.x > CANVAS_WIDTH || fireball.x < 0) {
				return false;
			}
			
			return true;
		});
	}
	
	function dragonAutoShoot() {
		// Auto-shoot at nearest enemy with upgraded timing
		if (tickCounter - lastFireballShot >= actualFireballCooldown && enemies.length > 0) {
			const nearestEnemy = findNearestEnemy();
			if (nearestEnemy) {
				// Each dragon shoots a fireball
				for (let i = 0; i < dragonCount; i++) {
					const dragonX = getDragonPosition(i).x;
					const dragonY = getDragonPosition(i).y;
					
					const fireball: Fireball = {
						id: nextFireballId++,
						x: dragonX,
						y: dragonY,
						targetX: nearestEnemy.x + nearestEnemy.width / 2,
						targetY: nearestEnemy.y + nearestEnemy.height / 2,
						speed: FIREBALL_SPEED,
						damage: currentDamage
					};
					fireballs.push(fireball);
				}
				lastFireballShot = tickCounter;
			}
		}
	}
	
	function getDragonPosition(dragonIndex: number): {x: number, y: number} {
		if (dragonCount === 1) {
			return { x: baseDragonX, y: baseDragonY };
		}
		
		// Space dragons vertically along the left side for horizontal flight
		const spacing = CANVAS_HEIGHT / (dragonCount + 1);
		return {
			x: baseDragonX,
			y: spacing * (dragonIndex + 1)
		};
	}
	
	function findNearestEnemy(): Enemy | null {
		if (enemies.length === 0) return null;
		
		// Find nearest enemy to the center dragon position
		const centerDragon = getDragonPosition(0);
		let nearest = enemies[0];
		let minDistance = getDistance(centerDragon.x, centerDragon.y, nearest.x, nearest.y);
		
		for (const enemy of enemies) {
			const distance = getDistance(centerDragon.x, centerDragon.y, enemy.x, enemy.y);
			if (distance < minDistance) {
				minDistance = distance;
				nearest = enemy;
			}
		}
		
		return nearest;
	}
	
	function getDistance(x1: number, y1: number, x2: number, y2: number): number {
		const dx = x2 - x1;
		const dy = y2 - y1;
		return Math.sqrt(dx * dx + dy * dy);
	}
	
	function checkFireballCollision(fireball: Fireball): boolean {
		for (let i = 0; i < enemies.length; i++) {
			const enemy = enemies[i];
			const fx = fireball.x;
			const fy = fireball.y;
			
			// Simple collision detection with improved bounds
			if (fx >= enemy.x && fx <= enemy.x + enemy.width &&
				fy >= enemy.y && fy <= enemy.y + enemy.height) {
				
				// Damage enemy instead of instant kill
				enemy.health -= fireball.damage;
				
				// Check if enemy is defeated
				if (enemy.health <= 0) {
					// Enemy destroyed - notify worker for rewards
					defeatEnemy(enemy.id);
					enemies.splice(i, 1);
				}
				
				return true; // Return true to indicate collision occurred
			}
		}
		return false; // No collision
	}
	
	function drawDragons() {
		// Draw all dragons based on dragonCount
		ctx.fillStyle = '#000';
		ctx.font = '24px Arial';
		ctx.textAlign = 'center';
		
		for (let i = 0; i < dragonCount; i++) {
			const pos = getDragonPosition(i);
			ctx.fillText('🐉', pos.x, pos.y);
		}
	}
	
	function drawEnemies() {
		enemies.forEach(enemy => {
			// Enemy body - color based on type
			let bodyColor = '#FF6B6B'; // Default red
			let emoji = '👹'; // Default goblin
			
			if (enemy.type === 'boss') {
				bodyColor = '#8B0000'; // Dark red for boss
				emoji = '🐉'; // Dragon for boss
			} else if (enemy.type === 'elite') {
				bodyColor = '#FF4500'; // Orange for elite
				emoji = '👺'; // Oni for elite
			}
			
			ctx.fillStyle = bodyColor;
			ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
			
			// Health bar for enemies with more than 1 HP
			if (enemy.maxHealth > 1) {
				const barWidth = enemy.width;
				const barHeight = 4;
				const healthPercent = enemy.health / enemy.maxHealth;
				
				// Background (red)
				ctx.fillStyle = '#FF0000';
				ctx.fillRect(enemy.x, enemy.y - 8, barWidth, barHeight);
				
				// Health (green)
				ctx.fillStyle = '#00FF00';
				ctx.fillRect(enemy.x, enemy.y - 8, barWidth * healthPercent, barHeight);
			}
			
			// Enemy text - larger for bosses
			ctx.fillStyle = '#000';
			ctx.font = enemy.type === 'boss' ? '24px Arial' : '16px Arial';
			ctx.textAlign = 'center';
			ctx.fillText(emoji, enemy.x + enemy.width / 2, enemy.y + enemy.height / 2 + (enemy.type === 'boss' ? 8 : 5));
			
			// Show level number for higher level enemies
			if (enemy.level > 1) {
				ctx.font = '10px Arial';
				ctx.fillStyle = '#FFF';
				ctx.fillText(`L${enemy.level}`, enemy.x + enemy.width / 2, enemy.y - 2);
			}
		});
	}
	
	function drawFireballs() {
		fireballs.forEach(fireball => {
			// Fireball
			ctx.fillStyle = '#FFA500';
			ctx.beginPath();
			ctx.arc(fireball.x, fireball.y, 6, 0, 2 * Math.PI);
			ctx.fill();
			
			// Fire emoji
			ctx.fillStyle = '#000';
			ctx.font = '12px Arial';
			ctx.textAlign = 'center';
			ctx.fillText('🔥', fireball.x, fireball.y + 3);
		});
	}
	
	function drawUI() {
		// Minimal combat UI - distance-first design
		// Gate warning overlay when at level end
		if (state && state.travelState === 'GATE') {
			// Gate warning overlay
			ctx.fillStyle = 'rgba(255, 107, 53, 0.2)';
			ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
			
			// Gate warning text
			ctx.fillStyle = '#FF6B35';
			ctx.font = 'bold 24px Arial';
			ctx.textAlign = 'center';
			ctx.fillText('⚠️ GATE AHEAD ⚠️', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2);
			
			ctx.font = '16px Arial';
			ctx.fillText('Level gate reached - clear remaining enemies', CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 30);
		}
	}
</script>

<div class="combat-container">
	<canvas 
		bind:this={canvas}
		class="game-canvas"
		width={CANVAS_WIDTH}
		height={CANVAS_HEIGHT}
	>
		Your browser does not support HTML5 Canvas.
	</canvas>
</div>

<style>
	.combat-container {
		/* Simplified container - let canvas fill available space */
		width: 100%;
		height: 100%;
		display: flex;
		padding: 0; /* Remove all padding for maximum space utilization */
	}

	.game-canvas {
		border: 2px solid var(--color-forge-primary);
		border-radius: var(--radius-sm);
		background: #1a1a1a;
		cursor: crosshair;
		box-shadow: 
			0 0 20px rgba(255, 107, 53, 0.3),
			inset 0 2px 4px rgba(0, 0, 0, 0.6);
		
		/* Fill container space efficiently */
		width: 100%;
		height: 100%;
		max-width: 1000px; /* Reasonable maximum that won't overpower */
		max-height: 500px; /* Prevent excessive vertical stretching */
		aspect-ratio: 2/1; /* Maintain 2:1 aspect ratio */
		object-fit: contain; /* Ensure proper scaling within bounds */
	}

	.game-canvas:hover {
		border-color: var(--color-forge-ember);
		box-shadow: 
			0 0 25px rgba(255, 107, 53, 0.5),
			inset 0 2px 4px rgba(0, 0, 0, 0.6);
	}

	/* Responsive scaling maintains aspect ratio on all screens */
	@media (max-width: 768px) {
		.game-canvas {
			max-width: 100%;
			max-height: 400px; /* Reasonable limit on mobile */
		}
	}
</style>