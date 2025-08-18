<script lang="ts">
	import type { GameState } from '$lib/types';
	
	export let gameState: GameState;
	
	$: currentLevel = gameState.currentLevel;
	$: levelDistance = gameState.levelDistance;
	$: levelDistanceTarget = gameState.levelDistanceTarget;
	$: totalDistance = gameState.totalDistance;
	$: travelState = gameState.travelState;
	
	// Calculate progress percentage for current level
	$: distanceProgress = Math.min(levelDistance / levelDistanceTarget, 1);
	
	// Format distance for display
	function formatDistance(meters: number): string {
		if (meters >= 1000) {
			return `${(meters / 1000).toFixed(1)}km`;
		}
		return `${Math.floor(meters)}m`;
	}
	
	// Generate level markers for the pillar
	function generateLevelMarkers(): Array<{level: number, position: number, isPassed: boolean, isCurrent: boolean}> {
		const markers = [];
		const maxDisplayLevels = 10; // Show 10 levels worth on pillar
		const startLevel = Math.max(1, currentLevel - 5);
		const endLevel = startLevel + maxDisplayLevels - 1;
		
		for (let level = startLevel; level <= endLevel; level++) {
			const isPassed = level < currentLevel;
			const isCurrent = level === currentLevel;
			const position = ((level - startLevel) / (maxDisplayLevels - 1)) * 100;
			
			markers.push({
				level,
				position: 100 - position, // Invert so level 1 is at bottom
				isPassed,
				isCurrent
			});
		}
		
		return markers;
	}
	
	$: levelMarkers = generateLevelMarkers();
	
	// Travel state indicator
	$: stateColor = {
		'ADVANCING': 'var(--color-success)',
		'HOVERING': 'var(--color-text-muted)',
		'RETREATING': 'var(--color-error)',
		'GATE': 'var(--color-forge-primary)',
		'TRAVEL_TO_TARGET': 'var(--color-info)'
	}[travelState] || 'var(--color-text-muted)';
	
	$: stateLabel = {
		'ADVANCING': 'Advancing',
		'HOVERING': 'Hovering',
		'RETREATING': 'Retreating',
		'GATE': 'At Gate',
		'TRAVEL_TO_TARGET': 'Traveling'
	}[travelState] || 'Unknown';
</script>

<div class="distance-pillar forge-panel forge-border-thick" role="region" aria-label="Dragon progress and level tracking">
	<!-- Connection point for integration -->
	<div class="pillar-connection-point" title="Forge Power Conduit - Channeling energy from the main forge"></div>
	
	<!-- Header with current level and state -->
	<div class="pillar-header">
		<div class="level-display">
			<span class="level-number">L{currentLevel}</span>
			<div class="travel-state" style="color: {stateColor}">
				<div class="state-indicator state-{travelState.toLowerCase()}" style="background-color: {stateColor}"></div>
				<span class="state-text">{stateLabel}</span>
			</div>
		</div>
	</div>
	
	<!-- Main pillar container -->
	<div class="pillar-container" style="--distance-progress: {distanceProgress}">
		<!-- Background pillar -->
		<div class="pillar-background"></div>
		
		<!-- Progress fill -->
		<div class="pillar-progress" style="height: {distanceProgress * 100}%"></div>
		
		<!-- Level markers -->
		{#each levelMarkers as marker}
			<div 
				class="level-marker forge-interactive" 
				class:passed={marker.isPassed}
				class:current={marker.isCurrent}
				style="top: {marker.position}%"
			>
				<div class="marker-dot"></div>
				<div class="marker-label">L{marker.level}</div>
			</div>
		{/each}
		
		<!-- Current position indicator -->
		<div class="current-position" style="bottom: {distanceProgress * 100}%">
			<div class="position-dot ember-glow"></div>
			<div class="position-label metal-inset">
				<div class="distance-current ember-glow ember-flicker">{formatDistance(levelDistance)}</div>
				<div class="distance-target">/ {formatDistance(levelDistanceTarget)}</div>
			</div>
		</div>
	</div>
	
	<!-- Footer with total distance -->
	<div class="pillar-footer">
		<div class="total-distance metal-frame forge-rivets">
			<span class="total-label">Total</span>
			<span class="total-value ember-glow ember-flicker">{formatDistance(totalDistance)}</span>
		</div>
	</div>
</div>

<style>
	.distance-pillar {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		min-height: 600px;
		padding: var(--spacing-md);
		position: relative;
		overflow: hidden;
	}

	.pillar-connection-point {
		position: absolute;
		top: -8px;
		left: 50%;
		transform: translateX(-50%);
		width: 24px;
		height: 16px;
		background: var(--gradient-metal-frame);
		border: 2px solid var(--color-forge-primary);
		border-radius: var(--radius-sm) var(--radius-sm) 0 0;
		box-shadow: 
			0 0 8px rgba(255, 107, 53, 0.4),
			inset 0 2px 4px rgba(255, 255, 255, 0.1);
		z-index: 10;
	}

	.pillar-connection-point::before {
		content: '';
		position: absolute;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 8px;
		height: 8px;
		background: var(--color-forge-ember);
		border-radius: 50%;
		box-shadow: 0 0 4px rgba(255, 140, 66, 0.6);
	}
	
	.pillar-header {
		position: relative;
		z-index: 2;
		margin-bottom: var(--spacing-md);
	}
	
	.level-display {
		text-align: center;
	}
	
	.level-number {
		display: block;
		font-size: 1.5rem;
		font-weight: 700;
		color: var(--color-forge-primary);
		text-shadow: 0 0 10px rgba(255, 107, 53, 0.3);
		margin-bottom: var(--spacing-xs);
	}
	
	.travel-state {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-xs);
		font-size: 0.8rem;
		font-weight: 600;
	}
	
	.state-indicator {
		width: 8px;
		height: 8px;
		border-radius: 50%;
		flex-shrink: 0;
	}
	
	/* Dual-encoding travel state patterns for accessibility */
	.state-advancing {
		/* Forward arrow pattern: stripes pointing right */
		background: 
			repeating-linear-gradient(
				45deg,
				currentColor 0px,
				currentColor 1px,
				transparent 1px,
				transparent 2px
			) !important;
		border-radius: 0 !important;
		transform: rotate(0deg);
		clip-path: polygon(0% 20%, 60% 20%, 60% 0%, 100% 50%, 60% 100%, 60% 80%, 0% 80%);
	}
	
	.state-hovering {
		/* Stationary pattern: concentric circles */
		background: 
			radial-gradient(circle at center, currentColor 30%, transparent 32%, transparent 60%, currentColor 62%) !important;
	}
	
	.state-retreating {
		/* Backward arrow pattern: stripes pointing left */
		background: 
			repeating-linear-gradient(
				-45deg,
				currentColor 0px,
				currentColor 1px,
				transparent 1px,
				transparent 2px
			) !important;
		border-radius: 0 !important;
		clip-path: polygon(40% 0%, 40% 20%, 100% 20%, 100% 80%, 40% 80%, 40% 100%, 0% 50%);
	}
	
	.state-gate {
		/* Gate pattern: vertical bars */
		background: 
			repeating-linear-gradient(
				90deg,
				currentColor 0px,
				currentColor 1px,
				transparent 1px,
				transparent 2px
			) !important;
		border-radius: 2px !important;
	}
	
	.state-travel_to_target {
		/* Travel pattern: diagonal motion lines */
		background: 
			repeating-linear-gradient(
				30deg,
				currentColor 0px,
				currentColor 1px,
				transparent 1px,
				transparent 3px
			) !important;
		border-radius: 2px !important;
	}
	
	.state-text {
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.pillar-container {
		flex: 1;
		position: relative;
		margin: var(--spacing-md) auto;
		width: 40px;
		min-height: 400px;
		z-index: 2;
	}
	
	.pillar-background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: linear-gradient(180deg,
			var(--color-bg-tertiary) 0%,
			var(--color-bg-primary) 50%,
			var(--color-bg-tertiary) 100%);
		border: 2px solid var(--color-border-secondary);
		border-radius: var(--radius-sm);
		box-shadow: inset 0 0 20px rgba(0, 0, 0, 0.3);
	}
	
	.pillar-progress {
		position: absolute;
		bottom: 0;
		left: 2px;
		right: 2px;
		background: 
			/* Diagonal stripe pattern for accessibility */
			repeating-linear-gradient(
				45deg,
				var(--color-forge-primary) 0px,
				var(--color-forge-primary) 3px,
				var(--color-forge-ember) 3px,
				var(--color-forge-ember) 6px
			),
			/* Fallback solid color */
			linear-gradient(180deg,
				var(--color-forge-ember) 0%,
				var(--color-forge-primary) 50%,
				var(--color-forge-secondary) 100%);
		border-radius: var(--radius-sm);
		box-shadow: 
			0 0 15px rgba(255, 107, 53, 0.4),
			inset 0 2px 4px rgba(255, 255, 255, 0.2);
		transition: height var(--transition-normal);
		min-height: 4px;
		/* Pattern provides texture that works regardless of color perception */
		background-blend-mode: multiply;
	}
	
	.level-marker {
		position: absolute;
		left: -15px;
		right: -15px;
		display: flex;
		align-items: center;
		z-index: 3;
	}
	
	.marker-dot {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		background: var(--color-border-primary);
		border: 2px solid var(--color-bg-secondary);
		transition: all var(--transition-fast);
	}
	
	.level-marker.passed .marker-dot {
		background: 
			/* Checkmark pattern for passed levels */
			radial-gradient(circle at center, transparent 40%, var(--color-success) 42%, var(--color-success) 58%, transparent 60%),
			/* Concentric circles pattern */
			radial-gradient(circle at center, var(--color-success) 20%, transparent 22%, transparent 35%, var(--color-success) 37%),
			var(--color-success);
		box-shadow: 0 0 8px rgba(76, 175, 80, 0.3);
		/* Visual confirmation through both color and pattern */
	}
	
	.level-marker.current .marker-dot {
		background: 
			/* Pulsing center dot pattern for current level */
			radial-gradient(circle at center, var(--color-forge-ember) 25%, transparent 27%, transparent 45%, var(--color-forge-primary) 47%),
			/* Outer ring pattern */
			radial-gradient(circle at center, transparent 60%, var(--color-forge-primary) 62%, var(--color-forge-primary) 80%, transparent 82%),
			var(--color-forge-primary);
		box-shadow: 0 0 12px rgba(255, 107, 53, 0.5);
		scale: 1.2;
		/* Active state clearly distinguished by pattern + color */
	}
	
	.marker-label {
		position: absolute;
		left: -40px;
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--color-text-secondary);
		white-space: nowrap;
		transition: color var(--transition-fast);
	}
	
	.level-marker.current .marker-label {
		color: var(--color-forge-primary);
		font-weight: 700;
	}
	
	.current-position {
		position: absolute;
		right: -60px;
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		z-index: 4;
		transition: bottom var(--transition-normal);
	}
	
	.position-dot {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		background: 
			/* Cross-hatch pattern for current position */
			repeating-linear-gradient(
				45deg,
				var(--color-forge-ember) 0px,
				var(--color-forge-ember) 2px,
				transparent 2px,
				transparent 4px
			),
			repeating-linear-gradient(
				-45deg,
				var(--color-forge-primary) 0px,
				var(--color-forge-primary) 2px,
				transparent 2px,
				transparent 4px
			),
			var(--color-forge-ember);
		border: 3px solid var(--color-bg-secondary);
		animation: pulse 2s ease-in-out infinite;
		/* Distinctive cross-hatch pattern makes current position clear regardless of color vision */
	}
	
	@keyframes pulse {
		0%, 100% { transform: scale(1); }
		50% { transform: scale(1.1); }
	}
	
	.position-label {
		padding: var(--spacing-xs);
		font-size: 0.7rem;
		white-space: nowrap;
		border-radius: var(--radius-sm);
	}
	
	.distance-current {
		font-weight: 700;
		color: var(--color-forge-primary);
	}
	
	.distance-target {
		font-weight: 500;
		color: var(--color-text-muted);
	}
	
	.pillar-footer {
		position: relative;
		z-index: 2;
		margin-top: var(--spacing-md);
		text-align: center;
	}
	
	.total-distance {
		padding: var(--spacing-sm);
	}
	
	.total-label {
		display: block;
		font-size: 0.7rem;
		color: var(--color-text-muted);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		margin-bottom: 2px;
	}
	
	.total-value {
		display: block;
		font-size: 0.9rem;
		font-weight: 700;
		color: var(--color-forge-primary);
	}
	
	/* Responsive design */
	@media (max-width: 1200px) {
		.distance-pillar {
			width: 100px;
			min-height: 500px;
		}
		
		.current-position {
			right: -50px;
		}
		
		.marker-label {
			left: -35px;
		}
	}
	
	@media (max-width: 1024px) {
		.distance-pillar {
			width: 100%;
			max-width: 600px;
			height: 150px;
			min-height: 150px;
			flex-direction: row;
			padding: var(--spacing-md) var(--spacing-lg);
		}

		.pillar-connection-point {
			top: 50%;
			left: -12px;
			transform: translateY(-50%);
			width: 16px;
			height: 24px;
			border-radius: 0 var(--radius-sm) var(--radius-sm) 0;
		}
		
		.pillar-header {
			margin-bottom: 0;
			margin-right: var(--spacing-md);
			min-width: 80px;
		}
		
		.pillar-container {
			flex-direction: row;
			width: auto;
			height: 40px;
			min-height: 40px;
			margin: auto var(--spacing-md);
		}
		
		.pillar-background {
			background: linear-gradient(90deg,
				var(--color-bg-tertiary) 0%,
				var(--color-bg-primary) 50%,
				var(--color-bg-tertiary) 100%);
		}
		
		.pillar-progress {
			bottom: 2px;
			left: 0;
			top: 2px;
			right: auto;
			width: calc(var(--distance-progress, 0) * 100%);
			background: linear-gradient(90deg,
				var(--color-forge-ember) 0%,
				var(--color-forge-primary) 50%,
				var(--color-forge-secondary) 100%);
		}
		
		.level-marker {
			left: auto;
			right: auto;
			top: -15px;
			bottom: -15px;
			flex-direction: column;
		}
		
		.marker-label {
			left: auto;
			top: -25px;
		}
		
		.current-position {
			right: auto;
			bottom: auto;
			top: -60px;
			left: var(--position-left, 0%);
			flex-direction: column;
			align-items: center;
		}
		
		.pillar-footer {
			margin-top: 0;
			margin-left: var(--spacing-md);
			min-width: 80px;
		}
	}
	
	@media (max-width: 768px) {
		.distance-pillar {
			height: 120px;
			min-height: 120px;
			padding: var(--spacing-sm) var(--spacing-md);
		}

		.pillar-connection-point {
			width: 12px;
			height: 20px;
		}
		
		.level-number {
			font-size: 1.2rem;
		}
		
		.pillar-container {
			height: 30px;
			min-height: 30px;
		}
		
		.current-position {
			top: -50px;
		}
		
		.position-label {
			font-size: 0.6rem;
		}
	}
	
	/* Reduced motion support */
	@media (prefers-reduced-motion: reduce) {
		.pillar-progress,
		.current-position,
		.marker-dot,
		.position-dot {
			transition: none;
		}
		
		.position-dot {
			animation: none;
		}
	}
</style>