<script lang="ts">
	import { distanceState } from '$lib/mvpStores';
</script>

<div class="floating-distance-bar">
	{#if $distanceState}
		<div class="level-info">
			<span class="level">Level {$distanceState.currentLevel}</span>
			<div class="progress-bar">
				<div 
					class="progress-fill" 
					style="width: {$distanceState.levelProgress * 100}%"
				></div>
			</div>
			<span class="distance">
				{Math.floor($distanceState.totalDistance)}m / {$distanceState.levelDistanceTarget}m
			</span>
		</div>
	{/if}
</div>

<style>
	.floating-distance-bar {
		position: absolute;
		top: 20px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 100;
		
		background: rgba(0, 0, 0, 0.8);
		border: 2px solid #d4af37;
		border-radius: 20px;
		padding: 12px 24px;
		
		backdrop-filter: blur(4px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
	}
	
	.level-info {
		display: flex;
		align-items: center;
		gap: 16px;
		color: #d4af37;
		font-weight: bold;
	}
	
	.progress-bar {
		width: 200px;
		height: 8px;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 4px;
		overflow: hidden;
	}
	
	.progress-fill {
		height: 100%;
		background: linear-gradient(90deg, #d4af37 0%, #ffd700 100%);
		border-radius: 4px;
		transition: width 0.3s ease;
	}
	
	.distance {
		font-size: 12px;
		opacity: 0.8;
	}
</style>