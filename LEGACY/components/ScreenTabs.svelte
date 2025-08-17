<script lang="ts">
	export let activeScreen: 'treasury' | 'combat' = 'treasury';
	export let onScreenChange: (screen: 'treasury' | 'combat') => void;

	function handleTabClick(screen: 'treasury' | 'combat') {
		onScreenChange(screen);
	}
</script>

<div class="tabs">
	<button 
		class="tab" 
		class:active={activeScreen === 'treasury'}
		on:click={() => handleTabClick('treasury')}
	>
		💰 Treasury
	</button>
	<button 
		class="tab" 
		class:active={activeScreen === 'combat'}
		on:click={() => handleTabClick('combat')}
	>
		🐉 Combat
	</button>
</div>

<style>
	.tabs {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
	}

	.tab {
		padding: 0.75rem 1.5rem;
		border: 2px solid #ddd;
		border-radius: 8px;
		background: #fff;
		cursor: pointer;
		font-size: 1rem;
		font-weight: 600;
		transition: all 0.2s ease;
		color: #666;
	}

	.tab:hover {
		border-color: #999;
		background: #f8f8f8;
	}

	.tab.active {
		border-color: #B87333;
		background: #B87333;
		color: #fff;
		box-shadow: 0 2px 8px rgba(184, 115, 51, 0.3);
	}

	.tab.active:hover {
		background: #A0632D;
		border-color: #A0632D;
	}
</style>