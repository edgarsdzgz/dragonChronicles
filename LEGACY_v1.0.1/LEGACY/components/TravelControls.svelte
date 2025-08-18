<script lang="ts">
	import type { GameState, TravelState } from '$lib/types';
	import { startTravel, stopTravel } from '$lib/stores';
	
	export let gameState: GameState;
	
	$: travelState = gameState.travelState;
	$: isAdvancing = travelState === 'ADVANCING';
	
	function handleStartTravel() {
		startTravel();
	}
	
	function handleStopTravel() {
		stopTravel();
	}
	
	function getTravelStateDisplay(state: TravelState): { text: string; color: string } {
		switch (state) {
			case 'ADVANCING':
				return { text: 'Advancing', color: 'var(--color-success)' };
			case 'HOVERING':
				return { text: 'Hovering', color: 'var(--color-text-muted)' };
			case 'RETREATING':
				return { text: 'Retreating', color: 'var(--color-warning)' };
			case 'GATE':
				return { text: 'At Gate', color: 'var(--color-forge-primary)' };
			case 'TRAVEL_TO_TARGET':
				return { text: 'Traveling', color: 'var(--color-info)' };
			default:
				return { text: 'Unknown', color: 'var(--color-text-muted)' };
		}
	}
	
	$: stateDisplay = getTravelStateDisplay(travelState);
</script>

<div class="travel-controls metal-frame forge-rivets">
	<div class="travel-status">
		<div class="status-indicator status-pulse" style="background-color: {stateDisplay.color}; animation: statusGlow 2s ease-in-out infinite"></div>
		<span class="status-text">{stateDisplay.text}</span>
	</div>
	
	<div class="control-buttons">
		{#if isAdvancing}
			<button 
				class="travel-button stop-button forge-button forge-ripple" 
				on:click={handleStopTravel}
				aria-label="Stop Travel"
			>
				<span class="button-icon">⏸️</span>
				<span class="button-text">Stop</span>
			</button>
		{:else}
			<button 
				class="travel-button start-button forge-button forge-ripple" 
				on:click={handleStartTravel}
				aria-label="Start Travel"
			>
				<span class="button-icon">▶️</span>
				<span class="button-text">Start</span>
			</button>
		{/if}
	</div>
</div>

<style>
	
	.travel-status {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}
	
	.status-indicator {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	.status-text {
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--color-text-primary);
	}
	
	.control-buttons {
		display: flex;
		gap: var(--spacing-sm);
	}
	
	.travel-button {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm) var(--spacing-md);
		border: none;
		border-radius: var(--radius-md);
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 600;
		transition: all var(--transition-fast);
		flex: 1;
		justify-content: center;
	}
	
	.start-button {
		background: var(--color-forge-primary);
		color: white;
		box-shadow: var(--shadow-sm);
	}
	
	.start-button:hover {
		background: var(--color-forge-secondary);
		box-shadow: var(--shadow-md);
		transform: translateY(-1px);
	}
	
	.start-button:active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}
	
	.stop-button {
		background: linear-gradient(145deg, var(--color-error) 0%, #d32f2f 100%) !important;
	}
	
	.stop-button:hover {
		background: linear-gradient(145deg, #d32f2f 0%, var(--color-error) 100%) !important;
	}
	
	.stop-button:active {
		transform: translateY(0);
		box-shadow: var(--shadow-sm);
	}
	
	.button-icon {
		font-size: 1rem;
	}
	
	.button-text {
		font-size: 0.85rem;
	}
	
	/* Accessibility improvements */
	.travel-button:focus {
		outline: 2px solid var(--color-forge-ember);
		outline-offset: 2px;
	}
	
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.travel-button {
			transition: none;
		}
		
		.start-button:hover,
		.stop-button:hover {
			transform: none;
		}
	}
</style>