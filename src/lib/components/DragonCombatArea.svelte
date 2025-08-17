<script lang="ts">
	import { gameState110, dragonState110, distanceState110, startTravel, stopTravel, reverseTravel } from '$lib/stores110';
	import { formatDistanceHeader } from '$lib/distanceSystem';
	import { formatDistance } from '$lib/numberFormat';
	import { Decimal } from '$lib/num/decimal';
	import EnemyRenderer from './EnemyRenderer.svelte';
	import YouWinDialog from './YouWinDialog.svelte';
	import EnemyDebugOverlay from '$lib/dev/EnemyDebugOverlay.svelte';
	import { debugOverlayEnabled } from '$lib/state/debug';
	import { enemySystem } from '$lib/enemySystem';
	import { onMount } from 'svelte';
	
	// Phase 0.1-B: Single overlay mount guard
	$: devOverlay = $debugOverlayEnabled;
	
	// YOU WIN dialog state
	let showYouWinDialog = false;
	
	// Initialize enemy system
	onMount(() => {
		// Set up boss death callback per spec §8
		enemySystem.setBossDeathCallback(() => {
			showYouWinDialog = true;
			// Pause distance progression when boss is defeated
			stopTravel();
		});
	});
	
	// Handle YOU WIN dialog actions
	function handleReturnToDraconia() {
		showYouWinDialog = false;
		// TODO: Trigger journey reset logic
		console.log('Returning to Draconia - journey reset needed');
	}
	
	// Spec §6.1 - Control actions
	function handleReverse() {
		reverseTravel();
	}
	
	function handleStop() {
		stopTravel();
	}
	
	function handleStart() {
		startTravel();
	}
	
	// Reactive distance header per MVP 1.1 Spec
	$: distanceHeader = $distanceState110 ? 
		formatDistanceHeader(new Decimal($distanceState110.runTotalKm)) :
		'Land 1 | Verdant Dragonplains 0.00 km';
	
	// Control states per Spec §2.3
	$: isRunning = $dragonState110.travelState === 'ADVANCING';
	$: isReversing = $dragonState110.travelState === 'RETREATING';
	$: canReverse = $distanceState110 ? ($distanceState110.currentLevel > 1 || new Decimal($distanceState110.runTotalKm).gt(0)) : false;
	$: isTraveling = isRunning || isReversing;
	
	// HP chip color states per Spec §2.5
	$: hpPercentage = $dragonState110.hpPercentage;
	$: hpColorClass = hpPercentage <= 0.05 ? 'critical' : hpPercentage <= 0.1 ? 'low' : hpPercentage <= 0.3 ? 'warning' : 'normal';
</script>

<!-- Spec §2.1 - Combat strip (sticky, full width of left column) -->
<div class="combat-strip combat-root">
	<!-- Spec §2.2 - Distance header (top-left inside combat) -->
	<div class="distance-header">
		{distanceHeader}
	</div>
	
	<!-- Spec §2.3 - Controls + Distance bar row -->
	<div class="controls-row">
		<!-- Left controls (Reverse, Stop, Start) -->
		<div class="controls">
			<button 
				class="control-btn" 
				class:active={isReversing}
				title="Reverse"
				aria-label="Reverse"
				disabled={!canReverse}
				on:click={handleReverse}
			>◀</button>
			<button 
				class="control-btn" 
				title="Stop"
				aria-label="Stop"
				disabled={!isTraveling}
				on:click={handleStop}
			>■</button>
			<button 
				class="control-btn" 
				class:active={isRunning}
				title="Start"
				aria-label="Start"
				disabled={isTraveling}
				on:click={handleStart}
			>▶</button>
		</div>
		
		<!-- Distance bar (fills remainder) -->
		<div class="distance-bar" aria-label="Level Progress">
			<div 
				class="fill" 
				style="width: {$distanceState110?.levelProgress ? $distanceState110.levelProgress * 100 : 0}%"
			></div>
		</div>
	</div>
	
	<!-- Spec §2.4 - Dragon placement (16px from left, vertically centered) -->
	<div class="dragon" aria-hidden="true">
		🐉
		
		<!-- Spec §2.5 - HP chip above dragon -->
		<div class="hp-chip">
			<div 
				class="hp-bar {hpColorClass}" 
				style="width: {hpPercentage * 100}%"
			></div>
			<span class="hp-text">{$dragonState110.hp}</span>
		</div>
	</div>
	
	<!-- Enemy MVP 1.1: Enemy rendering system -->
	<EnemyRenderer 
		combatWidth={800}
		combatHeight={250}
		dragonX={80}
		dragonY={125}
		playerIsReversing={isReversing}
		playerIsTraveling={isTraveling}
		currentLand={$distanceState110?.currentLevel || 1}
		currentDistance={$distanceState110?.runTotalKm || '0'}
	/>
	
	<!-- Phase 0.1-B: Single canonical overlay mount -->
	{#if devOverlay}
		<EnemyDebugOverlay />
	{/if}
</div>

<!-- YOU WIN Dialog per spec §8 -->
<YouWinDialog 
	bind:show={showYouWinDialog}
	on:returnToDraconia={handleReturnToDraconia}
/>

<style>
	/* Principal Engineer Implementation - EXACT Spec §2 compliance */
	
	/* Spec §2.1 - Combat strip (sticky, height from CSS variables) */
	.combat-strip, .combat-root {
		position: sticky; /* Phase 0.1-A: sticky acts as positioning context for overlay */
		top: 0;
		z-index: 10;
		height: var(--combat-h);
		background: radial-gradient(120% 120% at 0% 0%, #0e1a3a, #0b1230 60%, #09102a);
		border-radius: var(--radius-m);
		padding: 12px;
		overflow: hidden;
		grid-column: 1; /* left column only */
	}
	
	/* Spec §2.2 - Distance header (small text, top-left) */
	.distance-header {
		font-size: 13px;
		color: rgba(255, 255, 255, 0.8);
		margin-bottom: 8px;
		font-weight: 400;
	}
	
	/* Spec §2.3 - Controls + Distance bar row */
	.controls-row {
		display: flex;
		align-items: center;
		gap: 12px;
		margin-bottom: 16px;
	}
	
	.controls {
		display: flex;
		gap: 8px;
	}
	
	/* Spec §2.3 - Control buttons (28px square, high-contrast icons) */
	.control-btn {
		width: var(--controls-size);
		height: var(--controls-size);
		border: 1px solid rgba(255, 255, 255, 0.3);
		border-radius: var(--radius-s);
		background: rgba(255, 255, 255, 0.1);
		color: #fff;
		font-size: 14px;
		font-weight: bold;
		cursor: pointer;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	.control-btn:not(:disabled):hover {
		background: rgba(255, 255, 255, 0.2);
		border-color: rgba(255, 255, 255, 0.5);
	}
	
	.control-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	
	.control-btn.active {
		background: rgba(47, 122, 247, 0.3);
		border-color: #2f7af7;
		color: #2f7af7;
		box-shadow: 0 0 8px rgba(47, 122, 247, 0.3);
	}
	
	/* Spec §2.3 - Distance bar (fills remainder, 10-12px height) */
	.distance-bar {
		flex: 1;
		height: 12px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-s);
		overflow: hidden;
		position: relative;
	}
	
	.distance-bar .fill {
		height: 100%;
		background: linear-gradient(90deg, #20b2aa, #4169e1); /* teal→indigo per spec */
		transition: width 200ms ease; /* 150-250ms per spec */
		border-radius: var(--radius-s);
	}
	
	/* Spec §2.4 - Dragon placement (16px from left, vertically centered) */
	.dragon {
		position: absolute;
		left: 16px;
		/* Vertical center between distance row bottom and strip bottom */
		top: calc(50px + (var(--combat-h) - 50px) / 2);
		transform: translateY(-50%);
		font-size: 48px;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
		z-index: 5;
	}
	
	/* Spec §2.5 - HP chip (small rectangle above dragon, not pill) */
	.hp-chip {
		position: absolute;
		bottom: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-bottom: 8px;
		
		width: 60px;
		height: 18px;
		background: rgba(0, 0, 0, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-s); /* small radius, not pill */
		
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
		overflow: hidden;
	}
	
	/* HP bar fill (behind the number) */
	.hp-bar {
		position: absolute;
		left: 0;
		top: 0;
		height: 100%;
		transition: width 300ms ease;
		border-radius: var(--radius-s);
	}
	
	/* Spec §2.5 - HP color states */
	.hp-bar.normal {
		background: linear-gradient(90deg, #32cd32, #4169e1); /* >30%: green→blue */
	}
	
	.hp-bar.warning {
		background: linear-gradient(90deg, #ffd700, #ffa500); /* ≤30%: yellow→orange */
	}
	
	.hp-bar.low {
		background: linear-gradient(90deg, #ff4444, #cc0000); /* ≤10%: red */
	}
	
	.hp-bar.critical {
		background: linear-gradient(90deg, #ff0000, #aa0000); /* ≤5%: red */
		animation: blink 0.5s infinite alternate; /* blinking */
	}
	
	@keyframes blink {
		0% { opacity: 1; }
		100% { opacity: 0.3; }
	}
	
	.hp-text {
		position: relative;
		z-index: 1;
		font-size: 10px;
		font-weight: bold;
		color: #fff;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
	}
	
	/* Enemies (right to left runway) */
	.enemy {
		position: absolute;
		font-size: 24px;
		filter: drop-shadow(2px 2px 4px rgba(0, 0, 0, 0.5));
		z-index: 4;
		transform: translate(-50%, -50%);
	}
</style>