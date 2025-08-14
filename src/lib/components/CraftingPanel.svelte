<script lang="ts">
	import type { GameState, CraftingRecipe, MaterialType } from '$lib/types';
	import { formatInt } from '$lib/format';
	import { craftGear } from '$lib/stores';
	
	export let gameState: GameState;
	
	$: state = gameState;
	$: materials = state?.materials;
	$: recipes = state?.recipes || [];
	$: unlockedRecipes = recipes.filter(r => r.unlocked);
	$: lockedRecipes = recipes.filter(r => !r.unlocked);
	
	// Material display names and colors
	const materialInfo: Record<MaterialType, {name: string, color: string, icon: string}> = {
		emberdust: { name: 'Ember Dust', color: '#ff6b35', icon: '🔥' },
		frostshards: { name: 'Frost Shards', color: '#4fb3d9', icon: '❄️' },
		stormmotes: { name: 'Storm Motes', color: '#9d4edd', icon: '⚡' },
		venomglobules: { name: 'Venom Globules', color: '#52b788', icon: '🧪' },
		emberore: { name: 'Ember Ore', color: '#d62828', icon: '💎' },
		frostmetal: { name: 'Frost Metal', color: '#023047', icon: '🧊' },
		stormsteel: { name: 'Storm Steel', color: '#6f2dbd', icon: '⚡' },
		shadowessence: { name: 'Shadow Essence', color: '#2d1b69', icon: '🌑' }
	};
	
	function canCraftRecipe(recipe: CraftingRecipe): boolean {
		if (state.currentLevel < recipe.requiredLevel) return false;
		return recipe.materials.every(req => materials[req.type] >= req.amount);
	}
	
	function craftRecipe(recipeId: string) {
		craftGear(recipeId);
	}
</script>

<div class="crafting-panel">
	<div class="panel-header">
		<h3>🔨 Dragoncrafting Forge</h3>
		<p class="subtitle">Transform raw materials into powerful equipment</p>
	</div>

	<!-- Materials Inventory -->
	<div class="materials-section">
		<h4>📦 Materials Inventory</h4>
		<div class="materials-grid">
			{#each Object.entries(materials || {}) as [materialType, amount]}
				{@const info = materialInfo[materialType]}
				<div class="material-item" class:has-materials={amount > 0}>
					<div class="material-icon" style="color: {info.color}">
						{info.icon}
					</div>
					<div class="material-info">
						<div class="material-name">{info.name}</div>
						<div class="material-count">{formatInt(amount)}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>

	<!-- Available Recipes -->
	{#if unlockedRecipes.length > 0}
		<div class="recipes-section">
			<h4>📜 Available Recipes</h4>
			<div class="recipes-list">
				{#each unlockedRecipes as recipe}
					{@const canCraft = canCraftRecipe(recipe)}
					<div class="recipe-card" class:can-craft={canCraft}>
						<div class="recipe-header">
							<div class="recipe-name">{recipe.name}</div>
							<div class="recipe-rarity" class:common={recipe.targetRarity === 'Common'} class:rare={recipe.targetRarity === 'Rare'} class:epic={recipe.targetRarity === 'Epic'}>
								{recipe.targetRarity}
							</div>
						</div>
						
						<div class="recipe-stats">
							{#each Object.entries(recipe.baseStats) as [stat, value]}
								<span class="stat-bonus">
									{#if stat === 'damage'}💥{:else if stat === 'health'}❤️{:else if stat === 'fireRate'}⚡{/if}
									+{value}
								</span>
							{/each}
						</div>
						
						<div class="recipe-materials">
							{#each recipe.materials as requirement}
								{@const info = materialInfo[requirement.type]}
								{@const hasEnough = materials[requirement.type] >= requirement.amount}
								<div class="material-requirement" class:insufficient={!hasEnough}>
									<span class="req-icon" style="color: {info.color}">{info.icon}</span>
									<span class="req-text">
										{requirement.amount} {info.name}
									</span>
									<span class="req-owned">
										({materials[requirement.type]}/{requirement.amount})
									</span>
								</div>
							{/each}
						</div>
						
						<button 
							class="craft-button" 
							class:enabled={canCraft}
							disabled={!canCraft}
							on:click={() => craftRecipe(recipe.id)}
						>
							{canCraft ? '🔨 Craft' : '❌ Insufficient Materials'}
						</button>
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<!-- Locked Recipes -->
	{#if lockedRecipes.length > 0}
		<div class="locked-section">
			<h4>🔒 Locked Recipes</h4>
			<div class="locked-recipes">
				{#each lockedRecipes as recipe}
					<div class="locked-recipe">
						<div class="locked-name">{recipe.name}</div>
						<div class="unlock-req">Unlock at Level {recipe.requiredLevel}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>

<style>
	.crafting-panel {
		padding: 1rem;
		max-height: 600px;
		overflow-y: auto;
	}

	.panel-header {
		text-align: center;
		margin-bottom: 1.5rem;
	}

	.panel-header h3 {
		margin: 0 0 0.5rem 0;
		font-size: 1.25rem;
		color: #B87333;
	}

	.subtitle {
		margin: 0;
		font-size: 0.9rem;
		color: #666;
		font-style: italic;
	}

	.materials-section, .recipes-section, .locked-section {
		margin-bottom: 1.5rem;
	}

	.materials-section h4, .recipes-section h4, .locked-section h4 {
		margin: 0 0 0.75rem 0;
		font-size: 1rem;
		color: #444;
		border-bottom: 1px solid #eee;
		padding-bottom: 0.25rem;
	}

	.materials-grid {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
	}

	.material-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem;
		border-radius: 6px;
		background: #f8f8f8;
		opacity: 0.6;
		transition: opacity 0.2s;
	}

	.material-item.has-materials {
		opacity: 1;
		background: #fff;
		border: 1px solid #e0e0e0;
	}

	.material-icon {
		font-size: 1.25rem;
	}

	.material-info {
		flex: 1;
		min-width: 0;
	}

	.material-name {
		font-size: 0.8rem;
		font-weight: 500;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.material-count {
		font-size: 0.9rem;
		font-weight: 700;
		color: #B87333;
	}

	.recipes-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.recipe-card {
		border: 2px solid #e0e0e0;
		border-radius: 8px;
		padding: 1rem;
		background: #f9f9f9;
		transition: all 0.2s;
	}

	.recipe-card.can-craft {
		border-color: #B87333;
		background: #fff;
		box-shadow: 0 2px 8px rgba(184, 115, 51, 0.1);
	}

	.recipe-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
	}

	.recipe-name {
		font-weight: 600;
		color: #333;
	}

	.recipe-rarity {
		font-size: 0.8rem;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-weight: 500;
		text-transform: uppercase;
	}

	.recipe-rarity.common {
		background: #95a5a6;
		color: white;
	}

	.recipe-rarity.rare {
		background: #3498db;
		color: white;
	}

	.recipe-rarity.epic {
		background: #9b59b6;
		color: white;
	}

	.recipe-stats {
		display: flex;
		gap: 0.5rem;
		margin-bottom: 0.75rem;
	}

	.stat-bonus {
		background: #e8f5e8;
		color: #2d6e2d;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		font-size: 0.8rem;
		font-weight: 500;
	}

	.recipe-materials {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		margin-bottom: 1rem;
	}

	.material-requirement {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-size: 0.85rem;
	}

	.material-requirement.insufficient {
		color: #e74c3c;
	}

	.req-icon {
		font-size: 1rem;
	}

	.req-text {
		flex: 1;
	}

	.req-owned {
		font-weight: 500;
		color: #666;
	}

	.material-requirement.insufficient .req-owned {
		color: #e74c3c;
	}

	.craft-button {
		width: 100%;
		padding: 0.75rem;
		border: none;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.2s;
		background: #e0e0e0;
		color: #999;
	}

	.craft-button.enabled {
		background: #B87333;
		color: white;
	}

	.craft-button.enabled:hover {
		background: #A0632D;
		transform: translateY(-1px);
		box-shadow: 0 2px 6px rgba(184, 115, 51, 0.3);
	}

	.craft-button:disabled {
		cursor: not-allowed;
	}

	.locked-recipes {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.locked-recipe {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background: #f0f0f0;
		border-radius: 4px;
		opacity: 0.7;
	}

	.locked-name {
		font-weight: 500;
		color: #666;
	}

	.unlock-req {
		font-size: 0.8rem;
		color: #999;
		font-style: italic;
	}
</style>