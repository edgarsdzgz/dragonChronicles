<script lang="ts">
	import type { GameState } from '$lib/types';
	
	export let gameState: GameState;
	
	$: currentLevel = gameState.currentLevel;
	$: currentRegion = gameState.worldMap.currentRegion;
	$: travelState = gameState.travelState;
	
	// Get travel state styling
	$: stateColor = {
		'ADVANCING': 'var(--color-success)',
		'HOVERING': 'var(--color-text-muted)',
		'RETREATING': 'var(--color-error)',
		'GATE': 'var(--color-forge-primary)',
		'TRAVEL_TO_TARGET': 'var(--color-info)'
	}[travelState] || 'var(--color-text-muted)';
</script>

<div class="top-bar forge-panel forge-border-heavy forge-corner-rivets forge-glow-intense" role="banner" aria-label="Dragon status and navigation">
	<!-- Game Title and Info -->
	<div class="title-section">
		<h1 class="game-title">Dragonforge Chronicles</h1>
		<div class="game-info">
			<span class="level-info">Level {currentLevel}</span>
			<span class="region-info">{currentRegion}</span>
		</div>
	</div>
	
	<!-- Central Status Display -->
	<div class="status-section metal-frame forge-rivets">
		<div class="state-display">
			<div class="state-indicator ember-glow ember-flicker" style="background-color: {stateColor}"></div>
			<div class="state-label">Dragon Status</div>
		</div>
	</div>
	
</div>

<style>
	.top-bar {
		display: grid;
		grid-template-columns: 1fr auto;
		align-items: center;
		gap: var(--spacing-lg);
		width: 100%;
		height: 80px; /* Restored proper height to prevent cutoff */
		padding: 0 var(--spacing-lg); /* Reduced horizontal padding */
		margin-bottom: var(--spacing-md); /* Reduced bottom margin */
	}
	
	.title-section {
		position: relative;
		z-index: 2;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
	
	.game-title {
		font-size: var(--font-size-3xl);
		font-weight: var(--font-weight-extrabold);
		color: var(--color-forge-primary);
		margin: 0;
		text-shadow: 0 0 15px rgba(255, 107, 53, 0.4);
		letter-spacing: 0.05em;
		line-height: var(--line-height-tight);
	}
	
	.game-info {
		display: flex;
		gap: var(--spacing-md);
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
	}
	
	.level-info {
		font-weight: var(--font-weight-semibold);
		color: var(--color-forge-ember);
	}
	
	.region-info {
		font-style: italic;
	}
	
	.status-section {
		position: relative;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-md);
	}
	
	.state-display {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
	}
	
	.state-indicator {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 2px solid var(--color-bg-secondary);
		box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
		animation: pulse 2s ease-in-out infinite;
	}
	
	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}
	
	.state-label {
		font-size: var(--font-size-xs);
		font-weight: var(--font-weight-medium);
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
	
	
	/* Responsive design */
	@media (max-width: 1024px) {
		.top-bar {
			grid-template-columns: 1fr;
			grid-template-rows: auto auto;
			height: auto;
			gap: var(--spacing-md);
			padding: var(--spacing-lg);
		}
		
		.title-section {
			grid-row: 1;
			text-align: center;
		}
		
		.status-section {
			grid-row: 2;
			justify-self: center;
		}
		
		.game-title {
			font-size: var(--font-size-2xl);
		}
	}
	
	@media (max-width: 768px) {
		.top-bar {
			padding: var(--spacing-md);
			gap: var(--spacing-sm);
		}
		
		.game-title {
			font-size: var(--font-size-xl);
		}
		
		.state-display {
			flex-direction: row;
			gap: var(--spacing-sm);
		}
	}
	
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.state-indicator {
			animation: none;
		}
	}
</style>