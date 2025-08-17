<script lang="ts">
	import { formatInt } from '$lib/format';
	import { purchaseUpgrade, calculateUpgradeCost } from '$lib/stores';
	import type { GameState, UpgradeType } from '$lib/types';
	
	export let gameState: GameState;
	
	interface UpgradeInfo {
		type: UpgradeType;
		name: string;
		description: string;
		icon: string;
	}
	
	const upgrades: UpgradeInfo[] = [
		{
			type: 'damage',
			name: 'Damage',
			description: '+1 damage per level',
			icon: '⚔️'
		},
		{
			type: 'fireRate', 
			name: 'Fire Rate',
			description: '+20% fire rate per level',
			icon: '🔥'
		},
		{
			type: 'health',
			name: 'Health',
			description: '+5 HP per level',
			icon: '❤️'
		},
		{
			type: 'extraDragons',
			name: 'Extra Dragon',
			description: 'Adds another dragon',
			icon: '🐉'
		}
	];
	
	function handleUpgrade(upgradeType: UpgradeType) {
		const cost = calculateUpgradeCost(upgradeType, gameState.upgrades[upgradeType]);
		if (gameState.currencies.steak.amount >= cost) {
			purchaseUpgrade(upgradeType);
		}
	}
	
	function canAfford(upgradeType: UpgradeType): boolean {
		const cost = calculateUpgradeCost(upgradeType, gameState.upgrades[upgradeType]);
		return gameState.currencies.steak.amount >= cost;
	}
</script>

<div class="upgrade-panel">
	<h3>Upgrades</h3>
	
	<!-- Dragon Stats Display -->
	<div class="stats-display">
		<div class="stat">
			<span class="stat-icon">⚔️</span>
			<span class="stat-value">{gameState.dragonStats.damage}</span>
		</div>
		<div class="stat">
			<span class="stat-icon">❤️</span>
			<span class="stat-value">{gameState.dragonStats.currentHp}/{gameState.dragonStats.maxHp}</span>
		</div>
		<div class="stat">
			<span class="stat-icon">🐉</span>
			<span class="stat-value">{gameState.dragonStats.dragonCount}</span>
		</div>
	</div>
	
	<!-- Upgrade Buttons -->
	<div class="upgrade-list">
		{#each upgrades as upgrade}
			{@const currentLevel = gameState.upgrades[upgrade.type]}
			{@const cost = calculateUpgradeCost(upgrade.type, currentLevel)}
			{@const affordable = canAfford(upgrade.type)}
			
			<div class="upgrade-item">
				<button 
					class="upgrade-btn" 
					class:affordable
					class:expensive={!affordable}
					on:click={() => handleUpgrade(upgrade.type)}
					disabled={!affordable}
				>
					<div class="upgrade-icon">{upgrade.icon}</div>
					<div class="upgrade-info">
						<div class="upgrade-name">{upgrade.name} ({currentLevel})</div>
						<div class="upgrade-desc">{upgrade.description}</div>
						<div class="upgrade-cost">{formatInt(cost)} copper</div>
					</div>
				</button>
			</div>
		{/each}
	</div>
</div>

<style>
	.upgrade-panel {
		padding: 1rem;
		max-width: 300px;
	}
	
	h3 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #333;
		text-align: center;
	}
	
	.stats-display {
		display: flex;
		justify-content: space-around;
		margin-bottom: 1rem;
		padding: 0.5rem;
		background: #f8f8f8;
		border-radius: 6px;
	}
	
	.stat {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.2rem;
	}
	
	.stat-icon {
		font-size: 1.2rem;
	}
	
	.stat-value {
		font-size: 0.9rem;
		font-weight: 600;
		color: #666;
	}
	
	.upgrade-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.upgrade-item {
		width: 100%;
	}
	
	.upgrade-btn {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		width: 100%;
		border: 2px solid #ddd;
		border-radius: 8px;
		background: #fff;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}
	
	.upgrade-btn.affordable {
		border-color: #4CAF50;
		background: #f8fff8;
	}
	
	.upgrade-btn.affordable:hover {
		border-color: #45a049;
		background: #f0fff0;
		transform: translateY(-1px);
	}
	
	.upgrade-btn.expensive {
		border-color: #ccc;
		background: #f5f5f5;
		cursor: not-allowed;
		opacity: 0.6;
	}
	
	.upgrade-icon {
		font-size: 1.5rem;
		flex-shrink: 0;
	}
	
	.upgrade-info {
		flex: 1;
		min-width: 0;
	}
	
	.upgrade-name {
		font-weight: 600;
		font-size: 0.9rem;
		color: #333;
		margin-bottom: 0.2rem;
	}
	
	.upgrade-desc {
		font-size: 0.8rem;
		color: #666;
		margin-bottom: 0.3rem;
	}
	
	.upgrade-cost {
		font-size: 0.8rem;
		font-weight: 600;
		color: #B87333;
	}
	
	.expensive .upgrade-cost {
		color: #999;
	}
</style>