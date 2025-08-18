<script lang="ts">
	import { resetJourney } from '$lib/stores110';
	
	// Props from parent
	export let activeTab: string;
	export let setActiveTab: (tab: string) => void;
	
	// Modal state
	let showResetModal = false;
	
	// Left tabs (gameplay) per CTO Spec §6
	const leftTabs = [
		{ id: 'enchant', label: 'Enchant' },
		{ id: 'return', label: 'Return to Draconia' }
	];
	
	// Right tabs (meta)
	const rightTabs = [
		{ id: 'settings', label: 'Settings' }
	];
	
	function selectTab(tabId: string) {
		if (tabId === 'return') {
			// Show confirmation modal instead of switching tab
			showResetModal = true;
		} else {
			setActiveTab(tabId);
		}
	}
	
	function cancelReset() {
		showResetModal = false;
	}
	
	function confirmReset() {
		// CTO Spec §6 - Reset semantics with lifetime tracking
		resetJourney();
		showResetModal = false;
		// Remain on Enchant tab per spec
		setActiveTab('enchant');
	}
</script>

<!-- CTO Spec §6 - Tabs row split: left = gameplay, right = meta -->
<nav class="tabs-row">
	<!-- Left group: gameplay tabs -->
	<div class="tabs-left" role="tablist" aria-label="Gameplay Tabs">
		{#each leftTabs as tab}
			<button 
				type="button"
				class="tab {activeTab === tab.id ? 'selected' : ''}"
				role="tab"
				aria-selected={activeTab === tab.id}
				tabindex={activeTab === tab.id ? 0 : -1}
				on:click={() => selectTab(tab.id)}
				on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectTab(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
	
	<!-- Right group: meta tabs -->
	<div class="tabs-right" role="tablist" aria-label="Meta Tabs">
		{#each rightTabs as tab}
			<button 
				type="button"
				class="tab {activeTab === tab.id ? 'selected' : ''}"
				role="tab"
				aria-selected={activeTab === tab.id}
				tabindex={activeTab === tab.id ? 0 : -1}
				on:click={() => selectTab(tab.id)}
				on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && selectTab(tab.id)}
			>
				{tab.label}
			</button>
		{/each}
	</div>
</nav>

<!-- Spec §4 - Reset Journey Modal -->
{#if showResetModal}
	<div class="modal-overlay" role="button" tabindex="0" on:click={cancelReset} on:keydown={(e) => e.key === 'Escape' && cancelReset()}>
		<div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1" on:click|stopPropagation on:keydown={(e) => e.key === 'Escape' && cancelReset()}>
			<h2 id="modal-title" class="modal-title">Return to Draconia?</h2>
			<p class="modal-body">This resets your journey and enchant progress. Continue?</p>
			<div class="modal-buttons">
				<button class="modal-btn cancel" on:click={cancelReset}>Cancel</button>
				<button class="modal-btn reset" on:click={confirmReset}>Reset Journey</button>
			</div>
		</div>
	</div>
{/if}

<style>
	/* MVP 1.1 Implementation per CTO Spec §6 - Tab Layout */
	
	/* Tabs row with left/right split */
	.tabs-row {
		position: sticky;
		top: var(--combat-h);
		z-index: 9;
		
		display: flex;
		justify-content: space-between; /* left group vs right group */
		align-items: center;
		height: var(--tabs-h);
		
		background: rgba(11, 15, 22, 0.95);
		backdrop-filter: blur(8px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);
		
		grid-column: 1 / -1; /* spans both columns */
		padding: 0 var(--gutter);
	}
	
	.tabs-left {
		display: flex;
		gap: 16px;
	}
	
	.tabs-right {
		display: flex;
		gap: 16px;
	}
	
	/* Spec §4 - Tab buttons (proper role and minimal styling) */
	.tab {
		padding: 8px 20px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.15);
		border-radius: var(--radius-s);
		
		font-size: 15px; /* 14-15px per spec */
		font-weight: 500;
		color: #a0aec0;
		cursor: pointer;
		transition: all 0.2s ease;
		
		min-width: 120px;
		white-space: nowrap;
		outline: none;
	}
	
	.tab:focus-visible {
		box-shadow: 0 0 0 2px rgba(150, 200, 255, 0.85);
		border-radius: 8px;
	}
	
	.tab:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.25);
		color: #e2e8f0;
	}
	
	.tab.selected {
		background: rgba(47, 122, 247, 0.15);
		border-color: #2f7af7;
		color: #2f7af7;
		box-shadow: 0 0 8px rgba(47, 122, 247, 0.2);
	}
	
	/* Spec §4 - Modal styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}
	
	.modal-dialog {
		background: #1a1f2e;
		border: 2px solid rgba(255, 255, 255, 0.1);
		border-radius: var(--radius-m);
		padding: 24px;
		max-width: 400px;
		width: 90%;
		box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
	}
	
	.modal-title {
		margin: 0 0 16px 0;
		font-size: 20px;
		font-weight: 600;
		color: #e2e8f0;
		text-align: center;
	}
	
	.modal-body {
		margin: 0 0 24px 0;
		font-size: 14px;
		color: #a0aec0;
		text-align: center;
		line-height: 1.5;
	}
	
	.modal-buttons {
		display: flex;
		gap: 12px;
		justify-content: center;
	}
	
	.modal-btn {
		padding: 10px 20px;
		border-radius: var(--radius-s);
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 100px;
	}
	
	.modal-btn.cancel {
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: #a0aec0;
	}
	
	.modal-btn.cancel:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.5);
		color: #e2e8f0;
	}
	
	.modal-btn.reset {
		background: #dc3545;
		border: 1px solid #dc3545;
		color: #fff;
	}
	
	.modal-btn.reset:hover {
		background: #c82333;
		border-color: #c82333;
	}
</style>