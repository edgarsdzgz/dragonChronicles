<script lang="ts">
	export let title = '';
	export let size: 'default' | 'large' | 'compact' = 'default';
</script>

<div class="window" class:large={size === 'large'} class:compact={size === 'compact'}>
	<div class="header">{title}</div>
	<div class="body">
		<slot />
	</div>
</div>

<style>
	.window {
		max-width: 500px;
		margin: 0 auto;
		padding: 1rem 1.25rem;
		border: 1px solid rgba(0, 0, 0, 0.1);
		border-radius: 12px;
		box-shadow: 0 6px 24px rgba(0, 0, 0, 0.08);
		background: #fff;
		width: 100%;
		box-sizing: border-box;
	}
	
	.window.large {
		max-width: 800px;
		min-height: 600px;
		padding: 1.5rem 2rem;
	}
	
	.window.compact {
		max-width: 320px;
		padding: 1rem;
	}
	
	.header {
		font-weight: 800;
		font-size: 1.25rem;
		margin-bottom: 0.75rem;
		text-align: center;
		color: #333;
	}
	
	.compact .header {
		font-size: 1.1rem;
		margin-bottom: 0.5rem;
	}
	
	.body {
		text-align: center;
	}
</style>