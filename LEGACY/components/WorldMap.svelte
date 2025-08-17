<script lang="ts">
	import type { GameState } from '$lib/types';
	import { selectLevel } from '$lib/stores';
	
	export let gameState: GameState;
	
	// Calculate level grid (5 columns x rows)
	const LEVELS_PER_ROW = 5;
	const MAX_VISIBLE_LEVELS = 25; // Show 5 rows at a time
	
	$: currentLevel = gameState.currentLevel;
	$: unlockedLevels = gameState.worldMap.unlockedLevels;
	$: completedLevels = gameState.worldMap.completedLevels;
	$: currentRegion = gameState.worldMap.currentRegion;
	
	
	// Calculate which levels to display based on current level
	$: startLevel = Math.max(1, Math.floor((currentLevel - 1) / MAX_VISIBLE_LEVELS) * MAX_VISIBLE_LEVELS + 1);
	$: endLevel = Math.min(startLevel + MAX_VISIBLE_LEVELS - 1, Math.max(...unlockedLevels));
	$: displayLevels = Array.from({length: endLevel - startLevel + 1}, (_, i) => startLevel + i);
	
	function handleLevelSelect(level: number) {
		if (unlockedLevels.includes(level)) {
			selectLevel(level);
		}
	}
	
	function getLevelStatus(level: number): 'completed' | 'current' | 'unlocked' | 'locked' {
		if (completedLevels.includes(level)) return 'completed';
		if (level === currentLevel) return 'current';
		if (unlockedLevels.includes(level)) return 'unlocked';
		return 'locked';
	}
	
	function isBossLevel(level: number): boolean {
		return level % 10 === 0;
	}
	
	function getLevelIcon(level: number): string {
		if (isBossLevel(level)) return '🐉'; // Dragon for boss levels
		if (completedLevels.includes(level)) return '✅'; // Checkmark for completed
		if (level === currentLevel) return '⚔️'; // Swords for current level
		if (unlockedLevels.includes(level)) return '🏰'; // Castle for unlocked
		return '🔒'; // Lock for locked levels
	}
</script>

<div class="world-map">
	<div class="region-header">
		<h3 class="region-title">{currentRegion}</h3>
		<div class="region-subtitle">Levels {startLevel}-{endLevel}</div>
		
	</div>
	
	<div class="level-grid">
		{#each displayLevels as level}
			<button 
				class="level-node {getLevelStatus(level)} {isBossLevel(level) ? 'boss' : ''}"
				on:click={() => handleLevelSelect(level)}
				disabled={!unlockedLevels.includes(level)}
				title="Level {level}{isBossLevel(level) ? ' (Boss)' : ''}"
			>
				<div class="level-icon">{getLevelIcon(level)}</div>
				<div class="level-number">{level}</div>
				{#if isBossLevel(level)}
					<div class="boss-indicator">BOSS</div>
				{/if}
			</button>
		{/each}
	</div>
	
	<div class="map-legend">
		<div class="legend-item">
			<span class="legend-icon">⚔️</span>
			<span class="legend-text">Current</span>
		</div>
		<div class="legend-item">
			<span class="legend-icon">✅</span>
			<span class="legend-text">Completed</span>
		</div>
		<div class="legend-item">
			<span class="legend-icon">🏰</span>
			<span class="legend-text">Available</span>
		</div>
		<div class="legend-item">
			<span class="legend-icon">🐉</span>
			<span class="legend-text">Boss</span>
		</div>
	</div>
</div>

<style>
	.world-map {
		padding: 0.75rem;
		width: 100%;
		box-sizing: border-box;
		overflow-y: auto;
		height: 100%;
	}
	
	.region-header {
		text-align: center;
		margin-bottom: 0.75rem;
		padding-bottom: 0.4rem;
		border-bottom: 2px solid #d4af37;
	}
	
	.region-title {
		font-size: 1rem;
		font-weight: 700;
		color: #4a5568;
		margin: 0 0 0.2rem 0;
	}
	
	.region-subtitle {
		font-size: 0.8rem;
		color: #718096;
		margin: 0;
	}
	
	.distance-progress {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #f8f9fa;
		border-radius: 8px;
		border: 1px solid #e9ecef;
	}
	
	.progress-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		font-size: 0.875rem;
	}
	
	.level-info {
		font-weight: 600;
		color: #495057;
	}
	
	.distance-info {
		color: #6c757d;
		font-family: monospace;
		font-size: 0.8rem;
	}
	
	.progress-bar {
		width: 100%;
		height: 8px;
		background: #e9ecef;
		border-radius: 4px;
		overflow: hidden;
		margin-bottom: 0.5rem;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #28a745 0%, #20c997 50%, #17a2b8 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
	}
	
	.total-distance {
		text-align: center;
		font-size: 0.75rem;
		color: #6c757d;
		font-style: italic;
	}
	
	.level-grid {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 0.4rem;
		margin-bottom: 0.75rem;
	}
	
	.level-node {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		padding: 0.4rem;
		min-height: 50px;
		border: 2px solid #e2e8f0;
		border-radius: 0.4rem;
		background: #f8fafc;
		cursor: pointer;
		transition: all 0.2s ease;
		font-size: 0.7rem;
	}
	
	.level-node:hover:not(:disabled) {
		transform: scale(1.05);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}
	
	.level-node:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}
	
	.level-node.current {
		border-color: #4299e1;
		background: #ebf8ff;
		box-shadow: 0 0 10px rgba(66, 153, 225, 0.3);
	}
	
	.level-node.completed {
		border-color: #48bb78;
		background: #f0fff4;
	}
	
	.level-node.unlocked {
		border-color: #d4af37;
		background: #fffbeb;
	}
	
	.level-node.locked {
		border-color: #a0aec0;
		background: #f7fafc;
	}
	
	.level-node.boss {
		border-width: 3px;
		border-color: #e53e3e;
		background: linear-gradient(135deg, #fed7d7, #feb2b2);
	}
	
	.level-node.boss.completed {
		border-color: #38a169;
		background: linear-gradient(135deg, #c6f6d5, #9ae6b4);
	}
	
	.level-icon {
		font-size: 1rem;
		margin-bottom: 0.15rem;
	}
	
	.level-number {
		font-weight: 600;
		color: #2d3748;
		font-size: 0.7rem;
	}
	
	.boss-indicator {
		position: absolute;
		bottom: 2px;
		left: 50%;
		transform: translateX(-50%);
		font-size: 0.6rem;
		font-weight: 700;
		color: #e53e3e;
		text-shadow: 1px 1px 1px rgba(255, 255, 255, 0.8);
	}
	
	.map-legend {
		display: flex;
		justify-content: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}
	
	.legend-item {
		display: flex;
		align-items: center;
		gap: 0.2rem;
		font-size: 0.7rem;
		color: #4a5568;
	}
	
	.legend-icon {
		font-size: 0.85rem;
	}
	
	/* Responsive adjustments */
	@media (max-width: 480px) {
		.level-grid {
			grid-template-columns: repeat(4, 1fr);
		}
		
		.level-node {
			min-height: 50px;
			font-size: 0.7rem;
		}
		
		.map-legend {
			gap: 0.5rem;
		}
		
		.legend-item {
			font-size: 0.7rem;
		}
	}
</style>