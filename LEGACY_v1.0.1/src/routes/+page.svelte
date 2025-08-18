<script lang="ts">
	import DragonCombatArea from '$lib/components/DragonCombatArea.svelte';
	import CurrencyPanel from '$lib/components/CurrencyPanel.svelte';
	import MainTabsRow from '$lib/components/MainTabsRow.svelte';
	import ContextControlsPanel from '$lib/components/ContextControlsPanel.svelte';
	import SettingsPage from '$lib/components/SettingsPage.svelte';
	
	import { gameState110 } from '$lib/stores110';
	import { runAllTests } from '$lib/testRunner';
	import { loadEnemyConfig } from '$lib/config/enemyConfig';
	import { runBootDiagnostics } from '$lib/boot/diagnostics';
	import { logWriter } from '$lib/logWriter';
	import { onMount } from 'svelte';
	
	// Tab navigation state
	let activeTab = 'enchant';
	
	function setActiveTab(tab: string) {
		activeTab = tab;
	}
	
	$: state = $gameState110;
	
	// Initialize app on mount
	onMount(() => {
		// Initialize logging system first
		console.info('[App] Dragon Chronicles starting with auto-logging enabled');
		console.info('[App] Log session:', logWriter.getLogStats().currentSession);
		
		// Run boot diagnostics
		runBootDiagnostics();
		
		// Load enemy config
		loadEnemyConfig().catch(e => console.error('Failed to load enemy config:', e));
	});
	
</script>

<div class="page">
	<!-- COMBAT STRIP (sticky, left column) -->
	<DragonCombatArea />
	
	<!-- CURRENCY RAIL (sticky, right column) -->
	<CurrencyPanel />
	
	<!-- TABS ROW (sticky, spans both columns) -->
	<MainTabsRow {activeTab} {setActiveTab} />
	
	<!-- CONTENT SECTION (scrollable, spans both columns) -->
	{#if activeTab === 'enchant'}
		<ContextControlsPanel />
	{:else if activeTab === 'settings'}
		<SettingsPage />
	{/if}
</div>

{#if !state}
	<div class="loading">Loading Dragon Chronicles...</div>
{/if}

<style>
	/* MVP 1.1 Implementation per CTO Spec §5.3 - CSS Tokens */
	:root {
		--rail-w: 340px;                          /* 340px target per spec */
		--rail-w-min: 300px;                      /* min width */
		--rail-w-max: 360px;                      /* max width */
		--combat-h-1080: 280px;                   /* 280px @ 1080p */
		--combat-h: clamp(220px, 26vh, 280px);    /* scales down <760px */
		--tabs-h: 30px;                           /* 28-32px range */
		--ctrl-btn: 32px;                         /* square control buttons */
		--ench-bar-h: 36px;                       /* equals Tier Up height */
		--pad-xs: 8px;
		--pad-sm: 12px;
		--gutter: 16px;
		--radius-s: 6px;                          /* small rounding */
		--radius-m: 10px;
	}
	
	/* Spec §1.1 - Grid layout skeleton */
	.page {
		display: grid;
		grid-template-columns: 1fr var(--rail-w);
		grid-auto-rows: max-content;
		gap: var(--gutter);
		padding: var(--gutter);
		min-height: 100dvh;
		background: #0b0f16;
		font-family: 'Arial', sans-serif;
		font-variant-numeric: tabular-nums; /* prevents jitter */
	}
	
	/* Spec §1.3 - Responsive breakpoints */
	@media (max-width: 1200px) {
		:root {
			--gutter: 12px; /* reduce gutters on smaller screens */
		}
	}
	
	@media (max-width: 768px) {
		.page {
			padding: 8px; /* shrink padding, not rail width */
		}
	}
	
	.loading {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		color: #d4af37;
		font-size: 18px;
		font-weight: bold;
		text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
	}
	
	:global(body) {
		margin: 0;
		padding: 0;
		background: #0b0f16;
	}
</style>