<script lang="ts">
	import { 
		gameState110, 
		currencies110, 
		enchants110, 
		purchaseEnchant, 
		tierUpEnchant, 
		selectTier,
		canAffordEnchant,
		getEnchantCost,
		getEnchantETA
	} from '$lib/stores110';
	import { 
		calculateEnchantCost, 
		calculateTierUpCost, 
		getTierBounds, 
		getTierProgress, 
		getTierTickPositions,
		canTierUp
	} from '$lib/enchantSystem';
	import { formatDecimal } from '$lib/numberFormat';
	import { Decimal } from '$lib/num/decimal';
	
	// MVP 1.1 - Enchant state from worker
	$: enchants = $enchants110;
	$: arcanaAmount = new Decimal($currencies110.arcana);
	
	// Purchase enchant level per MVP 1.1 spec
	function handlePurchaseLevel(enchantType: 'firepower' | 'scales') {
		purchaseEnchant(enchantType);
	}
	
	// Switch tier for an enchant
	function handleSelectTier(enchantType: 'firepower' | 'scales', tier: 1 | 2 | 3) {
		const enchant = enchants[enchantType];
		if (tier <= enchant.tierUnlocked) {
			selectTier(enchantType, tier);
		}
	}
	
	// Tier Up (unlock next tier)
	function handleTierUp(enchantType: 'firepower' | 'scales') {
		tierUpEnchant(enchantType);
	}
	
	// Helper functions for UI per MVP 1.1
	function getPurchaseCost(enchantType: 'firepower' | 'scales'): string {
		const cost = calculateEnchantCost(enchantType, enchants[enchantType].level);
		return formatDecimal(cost);
	}
	
	function canPurchase(enchantType: 'firepower' | 'scales'): boolean {
		if (!$gameState110) return false;
		return canAffordEnchant(enchantType, $gameState110);
	}
	
	function canTierUpEnchant(enchantType: 'firepower' | 'scales'): boolean {
		const enchant = enchants[enchantType];
		return canTierUp(enchant, arcanaAmount, enchantType);
	}
	
	function getTierUpCost(enchantType: 'firepower' | 'scales'): string {
		const cost = calculateTierUpCost(enchantType, enchants[enchantType].tierUnlocked);
		return formatDecimal(cost);
	}
	
	// Use built-in tick position function from enchant system
	function getTickPositions(tier: 1 | 2 | 3): number[] {
		return getTierTickPositions(tier);
	}
</script>

<!-- Spec §5 - Enchant Section (Firepower, Scales only) -->
<section class="enchant-section">
	<!-- Firepower Row -->
	<div class="enchant-row">
		<!-- Spec §5.1 - Purchase Button (left, fixed width 220-260px) -->
		<div class="purchase-button">
			<button 
				class="purchase-btn" 
				disabled={!canPurchase('firepower')}
				on:click={() => handlePurchaseLevel('firepower')}
			>
				<div class="purchase-name">Firepower</div>
				<div class="purchase-cost">Cost: {getPurchaseCost('firepower')} Arcana</div>
				<div class="purchase-level">Lvl {enchants.firepower.level} → {enchants.firepower.level + 1}</div>
			</button>
		</div>
		
		<!-- Spec §5.1 - Center (Tier tabs + Progress bar) -->
		<div class="enchant-center">
			<!-- Tier tabs above the bar -->
			<div class="tier-tabs">
				{#each [1, 2, 3] as tier}
					<button 
						class="tier-tab {tier === 1 ? 'active' : ''}"
						disabled={tier > enchants.firepower.tierUnlocked}
						on:click={() => handleSelectTier('firepower', tier)}
					>
						T{tier}
					</button>
				{/each}
			</div>
			
			<!-- Progress bar for selected tier -->
			<div class="tier-progress-bar">
				<div 
					class="progress-fill firepower" 
					style="width: {getTierProgress(enchants.firepower.level, 1) * 100}%"
				></div>
				<!-- Tick markers every 10 levels -->
				{#each getTickPositions(1) as tickPos}
					<div class="tick-marker" style="left: {tickPos}%"></div>
				{/each}
			</div>
		</div>
		
		<!-- Spec §5.1 - TIER UP button (right) -->
		<div class="tier-up-button">
			<button 
				class="tier-up-btn" 
				disabled={!canTierUpEnchant('firepower')}
				on:click={() => handleTierUp('firepower')}
			>
				TIER UP
				<div class="tier-up-cost">{getTierUpCost('firepower')} Arcana</div>
			</button>
		</div>
	</div>
	
	<!-- Scales Row -->
	<div class="enchant-row">
		<!-- Purchase Button -->
		<div class="purchase-button">
			<button 
				class="purchase-btn" 
				disabled={!canPurchase('scales')}
				on:click={() => handlePurchaseLevel('scales')}
			>
				<div class="purchase-name">Scales</div>
				<div class="purchase-cost">Cost: {getPurchaseCost('scales')} Arcana</div>
				<div class="purchase-level">Lvl {enchants.scales.level} → {enchants.scales.level + 1}</div>
			</button>
		</div>
		
		<!-- Center (Tier tabs + Progress bar) -->
		<div class="enchant-center">
			<div class="tier-tabs">
				{#each [1, 2, 3] as tier}
					<button 
						class="tier-tab {tier === 1 ? 'active' : ''}"
						disabled={tier > enchants.scales.tierUnlocked}
						on:click={() => handleSelectTier('scales', tier)}
					>
						T{tier}
					</button>
				{/each}
			</div>
			
			<div class="tier-progress-bar">
				<div 
					class="progress-fill scales" 
					style="width: {getTierProgress(enchants.scales.level, 1) * 100}%"
				></div>
				<!-- Tick markers every 10 levels -->
				{#each getTickPositions(1) as tickPos}
					<div class="tick-marker" style="left: {tickPos}%"></div>
				{/each}
			</div>
		</div>
		
		<!-- TIER UP Button -->
		<div class="tier-up-button">
			<button 
				class="tier-up-btn" 
				disabled={!canTierUpEnchant('scales')}
				on:click={() => handleTierUp('scales')}
			>
				TIER UP
				<div class="tier-up-cost">{getTierUpCost('scales')} Arcana</div>
			</button>
		</div>
	</div>
</section>

<style>
	/* Principal Engineer Implementation - EXACT Spec §5 compliance */
	
	/* Enchant section (scrollable below tabs) */
	.enchant-section {
		min-height: 0;
		overflow: auto;
		padding: clamp(8px, 1.2vh, 16px);
		background: #0b0f16;
		border-radius: var(--radius-m);
		grid-column: 1 / -1; /* spans both columns */
	}
	
	/* Spec §5.1 - Enchant row anatomy: [Purchase Button] [Tier Tabs/Progress Bar] [TIER UP] */
	.enchant-row {
		display: grid;
		grid-template-columns: 240px 1fr 120px; /* Purchase (220-260px) | Center | TIER UP */
		gap: 20px;
		align-items: center;
		margin-bottom: 24px;
		padding: 16px;
		background: rgba(255, 255, 255, 0.02);
		border-radius: var(--radius-m);
		border: 1px solid rgba(255, 255, 255, 0.05);
	}
	
	/* Spec §5.1 - Purchase button (left, fixed width, three lines) */
	.purchase-button {
		width: 100%;
	}
	
	.purchase-btn {
		width: 100%;
		padding: 12px 16px;
		background: rgba(47, 122, 247, 0.1);
		border: 1px solid rgba(47, 122, 247, 0.3);
		border-radius: var(--radius-s);
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: left;
	}
	
	.purchase-btn:not(:disabled):hover {
		background: rgba(47, 122, 247, 0.15);
		border-color: rgba(47, 122, 247, 0.5);
	}
	
	.purchase-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}
	
	/* Three lines in purchase button per spec */
	.purchase-name {
		font-size: 14px;
		font-weight: 600; /* Name: weight 600 per spec */
		color: #e2e8f0;
		margin-bottom: 4px;
	}
	
	.purchase-cost {
		font-size: 13px;
		font-weight: 400; /* Cost: weight 400 per spec */
		color: #a0aec0;
		margin-bottom: 4px;
	}
	
	.purchase-level {
		font-size: 13px;
		font-weight: 400; /* Level: weight 400 per spec */
		color: #a0aec0;
	}
	
	/* Spec §5.1 - Center (Tier tabs above progress bar) */
	.enchant-center {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}
	
	.tier-tabs {
		display: flex;
		gap: 8px;
		justify-content: center;
	}
	
	.tier-tab {
		padding: 6px 12px;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: var(--radius-s);
		color: #a0aec0;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;
		min-width: 40px;
	}
	
	.tier-tab:not(:disabled):hover {
		background: rgba(255, 255, 255, 0.05);
		border-color: rgba(255, 255, 255, 0.3);
		color: #e2e8f0;
	}
	
	.tier-tab.active {
		background: rgba(47, 122, 247, 0.2);
		border-color: #2f7af7;
		color: #2f7af7;
	}
	
	.tier-tab:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	
	/* Progress bar for selected tier */
	.tier-progress-bar {
		height: 16px;
		background: rgba(255, 255, 255, 0.08);
		border-radius: var(--radius-s);
		overflow: hidden;
		position: relative;
		border: 1px solid rgba(255, 255, 255, 0.1);
	}
	
	.progress-fill {
		height: 100%;
		transition: width 200ms ease; /* 200ms per spec */
		border-radius: var(--radius-s);
	}
	
	.progress-fill.firepower {
		background: linear-gradient(90deg, #f56565, #ed8936);
	}
	
	.progress-fill.scales {
		background: linear-gradient(90deg, #4299e1, #3182ce);
	}
	
	/* Tick markers every 10 levels */
	.tick-marker {
		position: absolute;
		top: 0;
		bottom: 0;
		width: 1px;
		background: rgba(255, 255, 255, 0.4);
		pointer-events: none;
		z-index: 2;
	}
	
	/* Spec §5.1 - TIER UP button (right) */
	.tier-up-button {
		display: flex;
		justify-content: center;
	}
	
	.tier-up-btn {
		padding: 12px 16px;
		background: rgba(34, 197, 94, 0.1);
		border: 1px solid rgba(34, 197, 94, 0.3);
		border-radius: var(--radius-s);
		color: #22c55e;
		font-size: 12px;
		font-weight: 700;
		cursor: pointer;
		transition: all 0.2s ease;
		text-align: center;
		min-width: 100px;
	}
	
	.tier-up-btn:not(:disabled):hover {
		background: rgba(34, 197, 94, 0.15);
		border-color: rgba(34, 197, 94, 0.5);
	}
	
	.tier-up-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}
	
	.tier-up-cost {
		font-size: 10px;
		font-weight: 400;
		margin-top: 4px;
		opacity: 0.8;
	}
</style>