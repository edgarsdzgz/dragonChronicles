<script lang="ts" context="module">
	export interface Tab {
		id: string;
		label: string;
		icon: string;
		component: any;
		props?: any;
	}
</script>

<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	
	export let tabs: Tab[] = [];
	export let activeTab: string = '';
	
	const dispatch = createEventDispatcher();
	
	// Set default active tab if none specified
	$: if (!activeTab && tabs.length > 0) {
		activeTab = tabs[0].id;
	}
	
	// Get the currently active tab data
	$: currentTab = tabs.find(tab => tab.id === activeTab);
	
	function selectTab(tabId: string) {
		activeTab = tabId;
		dispatch('tabchange', { tabId });
	}
</script>

<div class="tab-container">
	<!-- Tab Navigation -->
	<div class="tab-nav">
		{#each tabs as tab}
			<button 
				class="tab-button {activeTab === tab.id ? 'active' : ''}"
				on:click={() => selectTab(tab.id)}
				title={tab.label}
			>
				<span class="tab-icon">{tab.icon}</span>
				<span class="tab-label">{tab.label}</span>
			</button>
		{/each}
	</div>
	
	<!-- Tab Content -->
	<div class="tab-content">
		{#if currentTab}
			<svelte:component this={currentTab.component} {...(currentTab.props || {})} />
		{/if}
	</div>
</div>

<style>
	.tab-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		background: #ffffff;
		border-radius: 0.5rem;
		overflow: hidden;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}
	
	.tab-nav {
		display: flex;
		background: #f8fafc;
		border-bottom: 2px solid #e2e8f0;
		flex-shrink: 0;
	}
	
	.tab-button {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.75rem 1rem;
		background: none;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.875rem;
		font-weight: 600;
		color: #64748b;
		border-bottom: 3px solid transparent;
		flex: 1;
		min-width: 0; /* Allow text to truncate */
	}
	
	.tab-button:hover {
		background: #e2e8f0;
		color: #475569;
	}
	
	.tab-button.active {
		background: #ffffff;
		color: #1e293b;
		border-bottom-color: #d4af37;
	}
	
	.tab-icon {
		font-size: 1.1rem;
		flex-shrink: 0;
	}
	
	.tab-label {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	
	.tab-content {
		flex: 1;
		overflow: auto;
		background: #ffffff;
		display: flex;
		flex-direction: column;
	}
	
	/* Responsive design - stack tabs on small screens */
	@media (max-width: 640px) {
		.tab-button {
			flex-direction: column;
			gap: 0.25rem;
			padding: 0.5rem;
			font-size: 0.75rem;
		}
		
		.tab-label {
			font-size: 0.7rem;
		}
		
		.tab-icon {
			font-size: 1rem;
		}
	}
	
	/* Hide labels on very narrow screens */
	@media (max-width: 480px) {
		.tab-label {
			display: none;
		}
		
		.tab-button {
			padding: 0.75rem 0.5rem;
		}
	}
</style>