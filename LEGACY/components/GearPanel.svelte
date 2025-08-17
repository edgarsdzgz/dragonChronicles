<script lang="ts">
	import type { GameState, GearPiece, GearSlot } from '$lib/types';
	import { equipGear, unequipGear, enhanceGear, calculateEnhancementCost } from '$lib/stores';
	import { formatInt } from '$lib/format';
	
	export let gameState: GameState;
	
	$: equippedGear = gameState.equippedGear;
	$: inventory = gameState.inventory;
	
	// Define slot display information
	const slotInfo: Record<GearSlot, { name: string; icon: string }> = {
		helm: { name: 'Helm', icon: '👑' },
		chest: { name: 'Chest', icon: '🛡️' },
		claws: { name: 'Claws', icon: '🗡️' },
		tailSpike: { name: 'Tail Spike', icon: '⚔️' },
		wingGuards: { name: 'Wing Guards', icon: '🛡️' },
		charm: { name: 'Charm', icon: '🔮' },
		ring: { name: 'Ring', icon: '💍' },
		breathFocus: { name: 'Breath Focus', icon: '💎' }
	};

	// Get properly typed slots array
	const slots = Object.keys(slotInfo) as GearSlot[];
	
	// Get rarity color
	function getRarityColor(rarity: string): string {
		const colors = {
			'Common': '#9CA3AF',
			'Rare': '#3B82F6', 
			'Epic': '#8B5CF6',
			'Legendary': '#F59E0B',
			'Mythic': '#EF4444'
		};
		return colors[rarity] || colors['Common'];
	}
	
	// Format gear stats for display
	function formatGearStats(gear: GearPiece): string {
		const stats = [];
		if (gear.stats.damage) stats.push(`+${gear.stats.damage} Damage`);
		if (gear.stats.health) stats.push(`+${gear.stats.health} Health`);
		if (gear.stats.fireRate) stats.push(`+${Math.round(gear.stats.fireRate * 10)}% Fire Rate`);
		if (gear.stats.critChance) stats.push(`+${Math.round(gear.stats.critChance * 100)}% Crit`);
		if (gear.stats.critDamage) stats.push(`+${Math.round(gear.stats.critDamage * 100)}% Crit Dmg`);
		return stats.join('\n');
	}
	
	function handleEquip(gearId: string, slot: GearSlot) {
		equipGear(gearId, slot);
	}
	
	function handleUnequip(slot: GearSlot) {
		unequipGear(slot);
	}
	
	function getInventoryBySlot(slot: GearSlot): GearPiece[] {
		return inventory.filter(gear => gear.slot === slot);
	}
	
	function handleEnhance(gear: GearPiece, slot?: GearSlot) {
		enhanceGear(gear.id, slot);
	}
	
	function canAffordEnhancement(gear: GearPiece): boolean {
		if (gear.enhancement >= 25) return false;
		const cost = calculateEnhancementCost(gear);
		return gameState.currencies.gold?.amount >= cost;
	}
</script>

<div class="gear-panel">
	<h3 class="panel-title">Dragon Equipment</h3>
	
	<!-- Equipment Slots -->
	<div class="equipment-grid">
		{#each slots as slot (slot)}
			<div class="equipment-slot">
				<div class="slot-header">
					<span class="slot-icon">{slotInfo[slot].icon}</span>
					<span class="slot-name">{slotInfo[slot].name}</span>
				</div>
				
				<div class="equipped-gear">
					{#if equippedGear[slot]}
						<div 
							class="gear-item equipped"
							style="border-color: {getRarityColor(equippedGear[slot].rarity)}"
							title="{equippedGear[slot].name}\n{formatGearStats(equippedGear[slot])}"
						>
							<div class="gear-name" style="color: {getRarityColor(equippedGear[slot].rarity)}">
								{equippedGear[slot].name}
							</div>
							{#if equippedGear[slot].enhancement > 0}
								<div class="enhancement">+{equippedGear[slot].enhancement}</div>
							{/if}
							<button 
								class="unequip-btn"
								on:click={() => handleUnequip(slot)}
								title="Unequip"
							>
								❌
							</button>
							{#if equippedGear[slot].enhancement < 25}
								<button 
									class="enhance-btn"
									class:disabled={!canAffordEnhancement(equippedGear[slot])}
									disabled={!canAffordEnhancement(equippedGear[slot])}
									on:click={() => handleEnhance(equippedGear[slot], slot)}
									title="Enhance (+{equippedGear[slot].enhancement + 1})\nCost: {formatInt(calculateEnhancementCost(equippedGear[slot]))} Forgegold"
								>
									⬆️
								</button>
							{/if}
						</div>
					{:else}
						<div class="empty-slot">
							<span class="empty-text">Empty</span>
						</div>
					{/if}
				</div>
				
				<!-- Available gear for this slot -->
				{#if getInventoryBySlot(slot).length > 0}
					<div class="available-gear">
						{#each getInventoryBySlot(slot) as gear}
							<button
								class="gear-item available"
								style="border-color: {getRarityColor(gear.rarity)}"
								title="{gear.name}\n{formatGearStats(gear)}\n\nClick to equip"
								on:click={() => handleEquip(gear.id, slot)}
							>
								<div class="gear-name" style="color: {getRarityColor(gear.rarity)}">
									{gear.name}
								</div>
								{#if gear.enhancement > 0}
									<div class="enhancement">+{gear.enhancement}</div>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</div>
</div>

<style>
	.gear-panel {
		padding: 0.75rem;
		width: 100%;
		box-sizing: border-box;
		overflow-y: auto;
		height: 100%;
	}
	
	.panel-title {
		font-size: 1rem;
		font-weight: 700;
		color: #4a5568;
		margin: 0 0 0.75rem 0;
		text-align: center;
		border-bottom: 2px solid #d4af37;
		padding-bottom: 0.4rem;
	}
	
	.equipment-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 0.5rem;
	}
	
	.equipment-slot {
		border: 1px solid #e2e8f0;
		border-radius: 0.375rem;
		padding: 0.4rem;
		background: #f8fafc;
	}
	
	.slot-header {
		display: flex;
		align-items: center;
		gap: 0.35rem;
		margin-bottom: 0.4rem;
		font-size: 0.75rem;
		font-weight: 600;
		color: #4a5568;
	}
	
	.slot-icon {
		font-size: 0.9rem;
	}
	
	.equipped-gear {
		margin-bottom: 0.4rem;
	}
	
	.gear-item {
		position: relative;
		display: block;
		width: 100%;
		padding: 0.4rem;
		border: 2px solid;
		border-radius: 0.3rem;
		background: #ffffff;
		text-align: left;
		transition: all 0.2s ease;
		margin-bottom: 0.2rem;
		font-size: 0.75rem;
	}
	
	.gear-item.equipped {
		background: #f0fff4;
		cursor: default;
	}
	
	.gear-item.available {
		cursor: pointer;
		background: #fefefe;
	}
	
	.gear-item.available:hover {
		transform: scale(1.02);
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
	}
	
	.empty-slot {
		padding: 0.6rem;
		border: 2px dashed #cbd5e0;
		border-radius: 0.3rem;
		background: #f7fafc;
		text-align: center;
	}
	
	.empty-text {
		color: #a0aec0;
		font-style: italic;
		font-size: 0.75rem;
	}
	
	.gear-name {
		font-weight: 600;
		font-size: 0.7rem;
		margin-bottom: 0.2rem;
		line-height: 1.2;
	}
	
	.enhancement {
		position: absolute;
		top: 2px;
		right: 2px;
		background: #4299e1;
		color: white;
		padding: 0.1rem 0.3rem;
		border-radius: 0.25rem;
		font-size: 0.7rem;
		font-weight: 700;
	}
	
	.unequip-btn {
		position: absolute;
		bottom: 2px;
		right: 2px;
		background: none;
		border: none;
		cursor: pointer;
		font-size: 0.8rem;
		opacity: 0.7;
		transition: opacity 0.2s ease;
	}
	
	.unequip-btn:hover {
		opacity: 1;
	}
	
	.enhance-btn {
		position: absolute;
		bottom: 2px;
		left: 2px;
		background: #10b981;
		color: white;
		border: 1px solid #059669;
		border-radius: 0.25rem;
		padding: 0.1rem 0.3rem;
		cursor: pointer;
		font-size: 0.7rem;
		transition: all 0.2s ease;
	}
	
	.enhance-btn:hover:not(.disabled) {
		background: #059669;
		transform: scale(1.05);
	}
	
	.enhance-btn.disabled {
		background: #9ca3af;
		border-color: #6b7280;
		cursor: not-allowed;
		opacity: 0.5;
	}
	
	.available-gear {
		max-height: 80px;
		overflow-y: auto;
	}
	
	/* Responsive adjustments */
	@media (max-width: 600px) {
		.equipment-grid {
			grid-template-columns: 1fr;
		}
		
		.gear-item {
			font-size: 0.8rem;
		}
	}
</style>