<script lang="ts">
	import type { GameState } from '$lib/types';
	import WorldMap from './WorldMap.svelte';
	
	export let gameState: GameState;
	export let isOpen: boolean = false;
	export let onClose: () => void;
	
	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			onClose();
		}
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			onClose();
		}
	}
</script>

<!-- Drawer overlay -->
{#if isOpen}
	<div 
		class="drawer-overlay" 
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="dialog" 
		aria-modal="true"
		aria-label="World Map"
		tabindex="-1"
	>
		<div class="drawer-content forge-panel forge-border-heavy">
			<!-- Header -->
			<div class="drawer-header">
				<h2 class="drawer-title">World Map</h2>
				<button 
					class="close-button forge-button" 
					on:click={onClose}
					aria-label="Close World Map"
				>
					<span class="close-icon">✕</span>
				</button>
			</div>
			
			<!-- World Map Content -->
			<div class="drawer-body">
				<WorldMap gameState={gameState} />
			</div>
		</div>
	</div>
{/if}

<style>
	.drawer-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(4px);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: var(--spacing-lg);
		animation: fadeIn 0.2s ease-out;
	}

	@keyframes fadeIn {
		from { opacity: 0; }
		to { opacity: 1; }
	}

	.drawer-content {
		width: 100%;
		max-width: 800px;
		max-height: 90vh;
		background: var(--gradient-forge-panel);
		border-radius: var(--radius-lg);
		box-shadow: 
			var(--shadow-metal-raised),
			0 0 40px rgba(255, 107, 53, 0.4);
		display: flex;
		flex-direction: column;
		overflow: hidden;
		animation: slideIn 0.3s ease-out;
	}

	@keyframes slideIn {
		from { 
			transform: translateY(-20px) scale(0.95);
			opacity: 0;
		}
		to { 
			transform: translateY(0) scale(1);
			opacity: 1;
		}
	}

	.drawer-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--spacing-lg);
		border-bottom: 2px solid var(--color-forge-primary);
		background: var(--gradient-metal-frame);
	}

	.drawer-title {
		margin: 0;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-forge-primary);
		text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
	}

	.close-button {
		padding: var(--spacing-sm);
		min-width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--color-error) !important;
	}

	.close-button:hover {
		background: #d32f2f !important;
	}

	.close-icon {
		font-size: 1.2rem;
		font-weight: bold;
	}

	.drawer-body {
		flex: 1;
		overflow-y: auto;
		padding: var(--spacing-lg);
	}

	/* Responsive design */
	@media (max-width: 768px) {
		.drawer-overlay {
			padding: var(--spacing-md);
		}

		.drawer-content {
			max-height: 85vh;
		}

		.drawer-header {
			padding: var(--spacing-md);
		}

		.drawer-title {
			font-size: 1.3rem;
		}

		.drawer-body {
			padding: var(--spacing-md);
		}
	}

	@media (max-width: 480px) {
		.drawer-overlay {
			padding: var(--spacing-sm);
		}

		.drawer-content {
			max-height: 90vh;
		}

		.drawer-header {
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.drawer-title {
			font-size: 1.2rem;
		}
	}
</style>