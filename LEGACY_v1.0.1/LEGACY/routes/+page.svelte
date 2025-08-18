<script lang="ts">
	import { gameState, advanceLevel } from '$lib/stores';
	import GameWindow from '$lib/components/GameWindow.svelte';
	import CombatScreen from '$lib/components/CombatScreen.svelte';
	import UpgradePanel from '$lib/components/UpgradePanel.svelte';
	import WorldMap from '$lib/components/WorldMap.svelte';
	import GearPanel from '$lib/components/GearPanel.svelte';
	import TreasuryPanel from '$lib/components/TreasuryPanel.svelte';
	import CraftingPanel from '$lib/components/CraftingPanel.svelte';
	import TabContainer from '$lib/components/TabContainer.svelte';
	import DistancePillar from '$lib/components/DistancePillar.svelte';
	import TopBar from '$lib/components/TopBar.svelte';
	import ControlsDock from '$lib/components/ControlsDock.svelte';
	import WorldMapDrawer from '$lib/components/WorldMapDrawer.svelte';
	import type { Tab } from '$lib/components/TabContainer.svelte';
	import { formatInt } from '$lib/format';
	
	$: state = $gameState;
	
	function testAdvanceLevel() {
		advanceLevel();
	}
	
	// Define tabs for the interface (worldmap moved to drawer)
	$: tabs = [
		{
			id: 'treasury',
			label: 'Treasury',
			icon: '💰',
			component: TreasuryPanel,
			props: { gameState: state }
		},
		{
			id: 'equipment',
			label: 'Equipment', 
			icon: '⚔️',
			component: GearPanel,
			props: { gameState: state }
		},
		{
			id: 'crafting',
			label: 'Crafting',
			icon: '🔨',
			component: CraftingPanel,
			props: { gameState: state }
		}
	] as Tab[];
	
	let activeTab = 'treasury'; // Start with treasury since worldmap is now in drawer
	let isMapDrawerOpen = false;
	
	function handleMapToggle() {
		isMapDrawerOpen = !isMapDrawerOpen;
	}
	
	function handleMapClose() {
		isMapDrawerOpen = false;
	}
	
	function handleGoHome() {
		// TODO: Implement go home functionality
		console.log('Go home clicked');
	}
</script>

{#if state}
	<div class="app-container">
		<!-- Top Navigation Bar -->
		<TopBar gameState={state} />
		
		<!-- Main Dashboard -->
		<div class="dashboard">
			<!-- Combat Area - Left Side -->
			<div class="combat-area">
				<CombatScreen />
			</div>
			
			<!-- Interface Panel - Right Side with Integrated Pillar -->
			<div class="interface-panel forge-panel forge-corner-rivets ambient-forge">
				<!-- Interface Content Area -->
				<div class="interface-content">
					<!-- Main tabbed interface -->
					<div class="tabs-area">
						<TabContainer 
							{tabs} 
							bind:activeTab 
							on:tabchange={(e) => activeTab = e.detail.tabId}
						/>
					</div>
					
					<!-- Integrated Distance Pillar with enhanced connection -->
					<div class="pillar-area">
						<div class="pillar-connector metal-frame"></div>
						<DistancePillar gameState={state} />
					</div>
				</div>
			</div>
		</div>
		
		<!-- Controls Dock - Bottom -->
		<ControlsDock 
			gameState={state} 
			onMapToggle={handleMapToggle}
			onGoHome={handleGoHome}
		/>
	</div>
	
	<!-- World Map Drawer -->
	<WorldMapDrawer 
		gameState={state} 
		isOpen={isMapDrawerOpen}
		onClose={handleMapClose}
	/>
{:else}
	<div class="loading">Loading your treasury...</div>
{/if}

<style>
	.app-container {
		min-height: 100vh;
		background: var(--color-bg-primary);
		padding: var(--spacing-md); /* Reduced from lg for more screen usage */
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs); /* Further reduced gap for maximum space efficiency */
	}
	
	.dashboard {
		display: grid;
		grid-template-columns: 2fr 380px; /* Combat ~68% | Comfortable sidebar width */
		grid-template-rows: 1fr; /* Single row takes full available height */
		gap: var(--spacing-lg);
		flex: 1; /* Take all available vertical space in flex container */
		min-height: 520px; /* Reasonable minimum without over-stretching */
		box-sizing: border-box;
		max-width: 100vw;
		overflow: hidden;
	}
	
	.combat-area {
		grid-column: 1;
		grid-row: 1;
		/* Let content drive the size - no artificial min-height */
		border-radius: var(--radius-lg);
		overflow: hidden;
		background: var(--gradient-forge-panel);
		border: var(--border-forge-thick);
		box-shadow: var(--shadow-metal-raised);
		position: relative;
		/* Ensure it takes full grid space available */
		width: 100%;
		height: 100%;
	}

	.combat-area::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: var(--gradient-ember-bg);
		pointer-events: none;
		z-index: 0;
	}
	
	.interface-panel {
		grid-column: 2;
		grid-row: 1;
		display: flex;
		flex-direction: column;
		min-height: 600px;
		max-width: 380px; /* Comfortable width for interface elements */
		overflow: hidden;
		padding: var(--spacing-md); /* Reduced padding for more content space */
	}
	
	.interface-content {
		display: grid;
		grid-template-columns: 1fr 140px; /* Reduced pillar width for compact layout */
		gap: var(--spacing-md); /* Reduced gap for tighter spacing */
		flex: 1;
		overflow: hidden;
	}
	
	.tabs-area {
		grid-column: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}
	
	.pillar-area {
		grid-column: 2;
		display: flex;
		flex-direction: column;
		justify-content: stretch;
		align-items: stretch;
		position: relative;
	}

	.pillar-connector {
		height: 8px;
		width: 100%;
		margin-bottom: var(--spacing-sm);
		border-radius: var(--radius-sm);
		background: var(--gradient-metal-frame);
		box-shadow: var(--shadow-metal-deep);
		position: relative;
	}

	.pillar-connector::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 20px;
		height: 20px;
		background: radial-gradient(circle, var(--color-forge-primary) 0%, var(--color-forge-secondary) 70%);
		border-radius: 50%;
		box-shadow: 
			0 0 10px rgba(255, 107, 53, 0.5),
			inset 0 2px 4px rgba(255, 255, 255, 0.2);
	}
	
	.loading {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		padding: var(--spacing-2xl);
		color: var(--color-text-muted);
		font-style: italic;
	}
	
	/* Responsive design */
	@media (max-width: 1200px) {
		.dashboard {
			grid-template-columns: 2fr 350px; /* Balanced proportions */
		}
		
		.interface-panel {
			max-width: 350px;
		}
		
		.interface-content {
			grid-template-columns: 1fr 120px;
		}

		.pillar-connector {
			height: 6px;
		}
	}
	
	@media (max-width: 1024px) {
		.app-container {
			padding: var(--spacing-md);
		}
		
		.dashboard {
			grid-template-columns: 1fr;
			grid-template-rows: auto 1fr;
			gap: var(--spacing-md);
			min-height: calc(100vh - 250px);
		}
		
		.combat-area {
			grid-column: 1;
			grid-row: 1;
			min-height: 400px;
		}
		
		.interface-panel {
			grid-column: 1;
			grid-row: 2;
			min-height: 500px;
			max-width: none;
		}
		
		.interface-content {
			grid-template-columns: 1fr;
			grid-template-rows: 1fr auto;
		}

		.pillar-connector {
			height: 4px;
			width: 60%;
			margin: 0 auto var(--spacing-sm) auto;
		}
		
		.tabs-area {
			grid-column: 1;
			grid-row: 1;
		}
		
		.pillar-area {
			grid-column: 1;
			grid-row: 2;
			min-height: 200px;
			justify-content: center;
		}
	}
	
	@media (max-width: 768px) {
		.app-container {
			padding: var(--spacing-sm);
		}
		
		.dashboard {
			gap: var(--spacing-md);
			min-height: calc(100vh - 300px);
		}
		
		.interface-panel {
			min-height: 400px;
		}
		
		.pillar-area {
			min-height: 150px;
		}
	}
</style>