<script lang="ts">
	import type { GameState } from '$lib/types';
	import UpgradePanel from './UpgradePanel.svelte';
	import { formatInt } from '$lib/format';
	import { advanceLevel } from '$lib/stores';
	
	export let gameState: GameState;
	
	function testAdvanceLevel() {
		advanceLevel();
	}
</script>

<div class="treasury-panel">
	<!-- Level Information -->
	<div class="level-info">
		<div class="level-badge">Level {gameState.currentLevel}</div>
		<div class="region-name">{gameState.worldMap.currentRegion}</div>
		<button class="test-btn" on:click={testAdvanceLevel}>Advance Level</button>
	</div>
	
	<!-- Currency Display -->
	<div class="currencies">
		<div class="counter">
			<div class="icon steak">🥩</div>
			<div class="amount">{formatInt(gameState.currencies.steak.amount)}</div>
			<div class="label">Dragon Steak</div>
		</div>
		
		{#if gameState.currencies.gold.unlocked}
			<div class="counter">
				<div class="icon gold">🪙</div>
				<div class="amount gold">{formatInt(gameState.currencies.gold.amount)}</div>
				<div class="label">Dragon Gold</div>
			</div>
		{/if}
		
		{#if gameState.currencies.dragonscales.unlocked}
			<div class="counter">
				<div class="icon dragonscales">🐲</div>
				<div class="amount scales">{formatInt(gameState.currencies.dragonscales.amount)}</div>
				<div class="label">Dragonscales</div>
			</div>
		{/if}
		
		{#if gameState.currencies.gems.unlocked}
			<div class="counter">
				<div class="icon gems">💎</div>
				<div class="amount gems-color">{formatInt(gameState.currencies.gems.amount)}</div>
				<div class="label">Gems</div>
			</div>
		{/if}
	</div>
	
	<!-- Upgrades -->
	<div class="upgrades-section">
		<h3 class="section-title">Dragon Upgrades</h3>
		<UpgradePanel gameState={gameState} />
	</div>
</div>

<style>
	.treasury-panel {
		padding: 0.75rem;
		width: 100%;
		height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
	}
	
	.level-info {
		padding: 0.75rem;
		border-bottom: 1px solid #eee;
		text-align: center;
		margin-bottom: 0.75rem;
	}
	
	.level-badge {
		font-size: 1.25rem;
		font-weight: 700;
		color: #4a5568;
		margin-bottom: 0.4rem;
	}
	
	.region-name {
		font-size: 0.8rem;
		color: #718096;
		margin-bottom: 0.75rem;
	}
	
	.test-btn {
		padding: 0.4rem 0.8rem;
		background: #4299e1;
		color: white;
		border: none;
		border-radius: 0.375rem;
		cursor: pointer;
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.test-btn:hover {
		background: #3182ce;
	}
	
	.currencies {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
		margin-bottom: 0.75rem;
	}
	
	.counter {
		display: flex;
		flex-direction: row;
		align-items: center;
		gap: 0.75rem;
		padding: 0.6rem;
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		background: #f8fafc;
	}
	
	.icon {
		width: 32px;
		height: 32px;
		font-size: 1.5rem;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
	}
	
	.amount {
		font-size: 1.1rem;
		font-weight: 700;
		color: #B87333;
		text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.1);
		min-width: 0;
		flex-shrink: 1;
	}
	
	.amount.gold {
		color: #d4af37;
	}
	
	.amount.scales {
		color: #8b5cf6;
	}
	
	.amount.gems-color {
		color: #06b6d4;
	}
	
	.label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #666;
		min-width: 0;
		flex-shrink: 1;
	}
	
	.upgrades-section {
		margin-top: 0.75rem;
		flex: 1;
		overflow: hidden;
	}
	
	.section-title {
		font-size: 1rem;
		font-weight: 700;
		color: #4a5568;
		margin: 0 0 0.75rem 0;
		text-align: center;
		border-bottom: 2px solid #d4af37;
		padding-bottom: 0.4rem;
	}
</style>