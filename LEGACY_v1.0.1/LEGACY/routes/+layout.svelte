<script lang="ts">
	import { gameState } from '$lib/stores';
	import '../app.css';
</script>

<main>
	<slot />
	<footer>
		v1 · saves to your browser
	</footer>
</main>

<style>
	main {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background: var(--color-bg-primary);
	}
	
	footer {
		margin-top: auto;
		text-align: center;
		padding: var(--spacing-lg);
		color: var(--color-text-muted);
		font-size: 0.875rem;
		border-top: 1px solid var(--color-border-primary);
	}
</style>