<script lang="ts">
	import { currencies110 } from '$lib/stores110';
	import { formatDecimal } from '$lib/numberFormat';
	import { Decimal } from '$lib/num/decimal';
	
	// MVP 1.1 - Currency data structure with proper formatting
	$: currencyList = [
		{ icon: '🔮', name: 'Arcana', amount: $currencies110.arcana, locked: false },
		{ icon: '🪙', name: 'Forgegold', amount: $currencies110.forgegold, locked: true },
		{ icon: '🐲', name: 'Dragonscales', amount: $currencies110.dragonscales, locked: true },
		{ icon: '💎', name: 'Gems', amount: $currencies110.gems, locked: true },
		// Future currencies can be added here
		{ icon: '⚡', name: 'Essence', amount: '0', locked: true },
		{ icon: '🌟', name: 'Stardust', amount: '0', locked: true }
	];
	
	function formatCurrencyAmount(amount: string): string {
		return formatDecimal(new Decimal(amount));
	}
</script>

<!-- Spec §3.1 - Currency rail (sticky, right column) -->
<aside class="currency-rail">
	<div class="currency-content">
		{#each currencyList as currency}
			<div class="currency-item" class:locked={currency.locked}>
				<div class="currency-icon">{currency.icon}</div>
				<div class="currency-name">{currency.name}</div>
				<div class="currency-amount">
					{#if currency.locked}
						🔒
					{:else}
						{formatCurrencyAmount(currency.amount)}
					{/if}
				</div>
			</div>
		{/each}
	</div>
</aside>

<style>
	/* Principal Engineer Implementation - EXACT Spec §3 compliance */
	
	/* Spec §3.1 - Currency rail (fixed width, sticky) */
	.currency-rail {
		position: sticky;
		top: 0;
		z-index: 10;
		width: var(--rail-w);
		background: #0f1430;
		border-radius: var(--radius-m);
		padding: 12px;
		grid-column: 2; /* right column only */
		
		/* Spec §1.2 - Rail is sticky with combat strip */
		height: var(--combat-h);
		overflow: hidden;
	}
	
	/* Spec §3.1 - Content area with scroll after 4 items */
	.currency-content {
		height: 100%;
		overflow-y: auto;
		
		/* Style scrollbar */
		scrollbar-width: thin;
		scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
	}
	
	.currency-content::-webkit-scrollbar {
		width: 4px;
	}
	
	.currency-content::-webkit-scrollbar-track {
		background: transparent;
	}
	
	.currency-content::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}
	
	/* Spec §3.2 - Currency item cells (48-56px height) */
	.currency-item {
		display: grid;
		grid-template-columns: 24px 1fr auto;
		align-items: center;
		gap: 8px;
		height: 52px; /* Within 48-56px range */
		padding: 12px;
		border-radius: var(--radius-m);
		transition: background-color 0.2s ease;
		margin-bottom: 4px;
	}
	
	.currency-item:hover:not(.locked) {
		background: rgba(255, 255, 255, 0.05);
	}
	
	.currency-item.locked {
		opacity: 0.4;
	}
	
	/* Small icon (left) */
	.currency-icon {
		font-size: 18px;
		display: flex;
		align-items: center;
		justify-content: center;
	}
	
	/* Currency name (center) */
	.currency-name {
		font-size: 14px;
		font-weight: 500;
		color: #e2e8f0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	
	/* Amount (right-aligned) */
	.currency-amount {
		font-family: 'Courier New', monospace;
		font-size: 13px;
		font-weight: bold;
		color: #fff;
		text-align: right;
		min-width: 50px;
		font-variant-numeric: tabular-nums;
	}
	
	/* Highlight active currency (Arcana) */
	.currency-item:first-child .currency-amount {
		color: #e6b3ff;
	}
</style>