<script lang="ts">
	import { logWriter } from '$lib/logWriter';
	import { telemetry } from '$lib/telemetry';
	import { Decimal } from '$lib/num/decimal';
	import { onMount } from 'svelte';

	let logStats = logWriter.getLogStats();
	let telemetryBufferSize = 0;

	// Update stats every second
	onMount(() => {
		const interval = setInterval(() => {
			logStats = logWriter.getLogStats();
			telemetryBufferSize = telemetry.getBufferSize();
		}, 1000);

		return () => clearInterval(interval);
	});

	function downloadLogs() {
		logWriter.downloadAllLogs();
	}

	function downloadTelemetry() {
		telemetry.downloadLogs();
	}

	function clearAllLogs() {
		if (confirm('Are you sure you want to clear all logs? This cannot be undone.')) {
			logWriter.clearAllLogs();
			telemetry.clearLogs();
			logStats = logWriter.getLogStats();
			telemetryBufferSize = 0;
		}
	}

	function testLogs() {
		console.info('[Test] Info log test');
		console.warn('[Test] Warning log test');
		console.error('[Test] Error log test');
		console.debug('[Test] Debug log test');
		
		// Test telemetry
		telemetry.logPurchase('firepower', 1, 2, new Decimal(100), new Decimal(500));
	}
</script>

<div class="log-panel">
	<h3>🗃️ Log Management</h3>
	
	<div class="stats-grid">
		<div class="stat">
			<label>Session ID:</label>
			<span class="monospace">{logStats.currentSession}</span>
		</div>
		
		<div class="stat">
			<label>Console Buffer:</label>
			<span>{logStats.bufferSize} entries</span>
		</div>
		
		<div class="stat">
			<label>Telemetry Buffer:</label>
			<span>{telemetryBufferSize} events</span>
		</div>
		
		<div class="stat">
			<label>Total Sessions:</label>
			<span>{logStats.totalSessions}</span>
		</div>
	</div>

	<div class="buttons">
		<button class="primary" on:click={downloadLogs}>
			📥 Download Console Logs
		</button>
		
		<button class="primary" on:click={downloadTelemetry}>
			📊 Download Telemetry
		</button>
		
		<button class="secondary" on:click={testLogs}>
			🧪 Test Logs
		</button>
		
		<button class="danger" on:click={clearAllLogs}>
			🗑️ Clear All
		</button>
	</div>

	<div class="info">
		<p><strong>Auto-logging is active:</strong></p>
		<ul>
			<li>All console output is captured in real-time</li>
			<li>Telemetry events are automatically logged</li>
			<li>Logs are buffered and flushed every 1 second</li>
			<li>Error logs trigger immediate flush</li>
			<li>Files are saved to browser storage with download capability</li>
		</ul>
	</div>
</div>

<style>
	.log-panel {
		background: #1a1f2e;
		border: 1px solid #3a4a5c;
		border-radius: 8px;
		padding: 16px;
		margin: 16px 0;
	}

	h3 {
		margin: 0 0 16px 0;
		color: #d4af37;
		font-size: 16px;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 12px;
		margin-bottom: 16px;
	}

	.stat {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px;
		background: #0f1419;
		border-radius: 4px;
		border: 1px solid #2a3441;
	}

	.stat label {
		color: #8892b0;
		font-size: 12px;
		font-weight: 500;
	}

	.stat span {
		color: #ccd6f6;
		font-size: 12px;
	}

	.monospace {
		font-family: 'Courier New', monospace;
		font-size: 11px !important;
	}

	.buttons {
		display: flex;
		gap: 8px;
		flex-wrap: wrap;
		margin-bottom: 16px;
	}

	button {
		padding: 8px 12px;
		border: none;
		border-radius: 4px;
		font-size: 12px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.primary {
		background: #4c9fda;
		color: white;
	}

	.primary:hover {
		background: #3a7bc8;
	}

	.secondary {
		background: #6c7b95;
		color: white;
	}

	.secondary:hover {
		background: #5a6882;
	}

	.danger {
		background: #f56565;
		color: white;
	}

	.danger:hover {
		background: #e53e3e;
	}

	.info {
		background: #0f1419;
		border: 1px solid #2a3441;
		border-radius: 4px;
		padding: 12px;
	}

	.info p {
		margin: 0 0 8px 0;
		color: #64ffda;
		font-size: 13px;
		font-weight: 500;
	}

	.info ul {
		margin: 0;
		padding-left: 16px;
		color: #8892b0;
		font-size: 12px;
		line-height: 1.4;
	}

	.info li {
		margin-bottom: 4px;
	}
</style>