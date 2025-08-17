<script lang="ts">
	import type { GameState } from '$lib/types';
	import TravelControls from './TravelControls.svelte';
	
	export let gameState: GameState;
	export let onMapToggle: () => void;
	export let onGoHome: () => void;
	
	$: travelState = gameState.travelState;
</script>

<div class="controls-dock forge-panel metal-frame">
	<!-- Travel Controls (Start/Stop) -->
	<div class="travel-section">
		<TravelControls gameState={gameState} />
	</div>
	
	<!-- Navigation Controls -->
	<div class="nav-section">
		<button 
			class="dock-button forge-button forge-ripple" 
			on:click={onMapToggle}
			aria-label="Open World Map"
			title="World Map - Select travel destination"
		>
			<span class="button-icon">🗺️</span>
			<span class="button-text">Map</span>
		</button>
		
		<button 
			class="dock-button forge-button forge-ripple" 
			on:click={onGoHome}
			aria-label="Return Home"
			title="Return to starting region"
		>
			<span class="button-icon">🏠</span>
			<span class="button-text">Home</span>
		</button>
	</div>
</div>

<style>
	.controls-dock {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-md) var(--spacing-lg);
		gap: var(--spacing-lg);
		border-radius: var(--radius-lg) var(--radius-lg) 0 0; /* Rounded top, squared bottom for connection */
		background: var(--gradient-forge-panel);
		border: var(--border-forge-thick);
		border-bottom: none; /* Remove bottom border for edge-to-edge feel */
		box-shadow: var(--shadow-metal-raised);
		/* Visual connection elements */
		position: relative;
		width: 100%; /* Ensure it spans the full container width */
		box-sizing: border-box;
	}
	
	/* Add connection indicator to show relationship with main interface */
	.controls-dock::before {
		content: '';
		position: absolute;
		top: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 8px;
		background: var(--gradient-metal-frame);
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		border: 2px solid var(--color-forge-primary);
		border-bottom: none;
		box-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
	}

	.travel-section {
		flex: 0 0 auto;
	}

	.nav-section {
		display: flex;
		gap: var(--spacing-md);
		flex: 0 0 auto;
	}

	.dock-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		font-size: 0.9rem;
		min-width: 100px;
		justify-content: center;
	}

	.button-icon {
		font-size: 1.1rem;
	}

	.button-text {
		font-weight: 600;
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.controls-dock {
			flex-direction: column;
			gap: var(--spacing-md);
			padding: var(--spacing-md);
		}

		.nav-section {
			width: 100%;
			justify-content: center;
		}

		.dock-button {
			flex: 1;
			min-width: 0;
		}
	}

	@media (max-width: 480px) {
		.nav-section {
			flex-direction: column;
			gap: var(--spacing-sm);
		}

		.dock-button {
			width: 100%;
		}
	}
</style>