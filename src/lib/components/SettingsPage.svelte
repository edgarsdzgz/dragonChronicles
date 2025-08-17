<script lang="ts">
	import { telemetry } from '$lib/telemetry';
	import { gameState110, debugAddArcana, debugForceHP } from '$lib/stores110';
	import { Decimal } from '$lib/num/decimal';
	import LogManagementPanel from './LogManagementPanel.svelte';
	
	// Debug mode toggle
	$: debugMode = $gameState110?.debugMode || false;
	
	// Debug functions
	function addArcana(amount: number) {
		debugAddArcana(amount);
	}
	
	function forceHP(percentage: number) {
		debugForceHP(percentage);
	}
	
</script>

<!-- Settings Page per CTO Spec §6 -->
<div class="settings-page">
	<div class="settings-header">
		<h1>Settings</h1>
	</div>
	
	<div class="settings-content">
		<!-- Coming Soon Section -->
		<section class="settings-section">
			<div class="coming-soon">
				<h2>Settings Coming Soon…</h2>
				<p>Advanced game settings and preferences will be available in future updates.</p>
			</div>
		</section>
		
		<!-- Advanced Log Management -->
		<LogManagementPanel />
		
		<!-- Debug Mode Section -->
		<section class="settings-section">
			<div class="setting-row">
				<div class="setting-info">
					<strong>Debug Mode</strong>
					<p>Enable developer controls and testing features</p>
				</div>
				<label class="toggle">
					<input type="checkbox" bind:checked={debugMode} />
					<span class="toggle-slider"></span>
				</label>
			</div>
			
			{#if debugMode}
				<div class="debug-controls">
					<h4>Debug Controls</h4>
					
					<div class="debug-group">
						<h5>Add Arcana</h5>
						<div class="button-row">
							<button class="btn-debug" on:click={() => addArcana(10)}>+10</button>
							<button class="btn-debug" on:click={() => addArcana(1000)}>+1e3</button>
							<button class="btn-debug" on:click={() => addArcana(1000000)}>+1e6</button>
						</div>
					</div>
					
					<div class="debug-group">
						<h5>Force HP %</h5>
						<div class="button-row">
							<button class="btn-debug" on:click={() => forceHP(100)}>100%</button>
							<button class="btn-debug" on:click={() => forceHP(50)}>50%</button>
							<button class="btn-debug" on:click={() => forceHP(20)}>20%</button>
							<button class="btn-debug" on:click={() => forceHP(10)}>10%</button>
							<button class="btn-debug" on:click={() => forceHP(5)}>5%</button>
						</div>
					</div>
				</div>
			{/if}
		</section>
	</div>
</div>

<style>
	/* MVP 1.1 Settings Page per CTO Spec */
	
	.settings-page {
		padding: 24px;
		max-width: 800px;
		margin: 0 auto;
		background: #0b0f16;
		min-height: 100vh;
	}
	
	.settings-header {
		margin-bottom: 32px;
		border-bottom: 1px solid rgba(255, 255, 255, 0.1);
		padding-bottom: 16px;
	}
	
	.settings-header h1 {
		font-size: 28px;
		font-weight: 600;
		color: #e2e8f0;
		margin: 0;
	}
	
	.settings-content {
		display: flex;
		flex-direction: column;
		gap: 32px;
	}
	
	.settings-section {
		background: rgba(255, 255, 255, 0.02);
		border: 1px solid rgba(255, 255, 255, 0.05);
		border-radius: 12px;
		padding: 24px;
	}
	
	.settings-section h3 {
		font-size: 20px;
		font-weight: 600;
		color: #e2e8f0;
		margin: 0 0 20px 0;
	}
	
	.coming-soon {
		text-align: center;
		padding: 40px 20px;
	}
	
	.coming-soon h2 {
		font-size: 24px;
		color: #a0aec0;
		margin: 0 0 12px 0;
	}
	
	.coming-soon p {
		color: #6b7280;
		font-size: 16px;
		margin: 0;
	}
	
	.setting-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 0;
		border-bottom: 1px solid rgba(255, 255, 255, 0.05);
	}
	
	.setting-row:last-child {
		border-bottom: none;
	}
	
	.setting-info {
		flex: 1;
	}
	
	.setting-info strong {
		display: block;
		color: #e2e8f0;
		font-weight: 600;
		margin-bottom: 4px;
	}
	
	.setting-info p {
		color: #a0aec0;
		font-size: 14px;
		margin: 0;
	}
	
	/* Buttons */
	.btn-primary, .btn-secondary, .btn-debug {
		padding: 8px 16px;
		border-radius: 6px;
		font-size: 14px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		border: 1px solid;
	}
	
	.btn-primary {
		background: #2f7af7;
		border-color: #2f7af7;
		color: white;
	}
	
	.btn-primary:hover {
		background: #1e5db8;
		border-color: #1e5db8;
	}
	
	.btn-secondary {
		background: transparent;
		border-color: rgba(255, 255, 255, 0.3);
		color: #a0aec0;
	}
	
	.btn-secondary:hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.5);
		color: #e2e8f0;
	}
	
	.btn-debug {
		background: rgba(34, 197, 94, 0.1);
		border-color: rgba(34, 197, 94, 0.3);
		color: #22c55e;
		font-size: 12px;
		padding: 6px 12px;
	}
	
	.btn-debug:hover {
		background: rgba(34, 197, 94, 0.15);
		border-color: rgba(34, 197, 94, 0.5);
	}
	
	/* Toggle Switch */
	.toggle {
		position: relative;
		display: inline-block;
		width: 50px;
		height: 24px;
	}
	
	.toggle input {
		opacity: 0;
		width: 0;
		height: 0;
	}
	
	.toggle-slider {
		position: absolute;
		cursor: pointer;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background-color: #374151;
		transition: 0.2s;
		border-radius: 24px;
	}
	
	.toggle-slider:before {
		position: absolute;
		content: "";
		height: 18px;
		width: 18px;
		left: 3px;
		bottom: 3px;
		background-color: white;
		transition: 0.2s;
		border-radius: 50%;
	}
	
	.toggle input:checked + .toggle-slider {
		background-color: #2f7af7;
	}
	
	.toggle input:checked + .toggle-slider:before {
		transform: translateX(26px);
	}
	
	/* Debug Controls */
	.debug-controls {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.debug-controls h4 {
		color: #22c55e;
		font-size: 16px;
		margin: 0 0 16px 0;
	}
	
	.debug-group {
		margin-bottom: 20px;
	}
	
	.debug-group h5 {
		color: #a0aec0;
		font-size: 14px;
		margin: 0 0 8px 0;
		font-weight: 500;
	}
	
	.button-row {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
	}
</style>