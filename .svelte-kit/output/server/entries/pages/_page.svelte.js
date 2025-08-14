import { z as push, I as store_get, J as attr, K as unsubscribe_stores, B as pop, M as ensure_array_like, G as escape_html, N as attr_class, O as bind_props, P as stringify, Q as attr_style, R as fallback, S as spread_props, T as copy_payload, U as assign_payload } from "../../chunks/index2.js";
import { g as gameState, c as calculateUpgradeCost, a as calculateEnhancementCost } from "../../chunks/stores.js";
function CombatScreen($$payload, $$props) {
  push();
  var $$store_subs;
  let state;
  const CANVAS_WIDTH = 1200;
  const CANVAS_HEIGHT = 600;
  state = store_get($$store_subs ??= {}, "$gameState", gameState);
  state?.dragonStats?.dragonCount || 1;
  state?.dragonStats?.damage || 1;
  state?.dragonStats?.fireRateMultiplier || 1;
  $$payload.out.push(`<div class="combat-container svelte-ynamlo"><canvas class="game-canvas svelte-ynamlo"${attr("width", CANVAS_WIDTH)}${attr("height", CANVAS_HEIGHT)}>Your browser does not support HTML5 Canvas.</canvas></div>`);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
function formatInt(n) {
  return Math.floor(n).toLocaleString();
}
function UpgradePanel($$payload, $$props) {
  push();
  let gameState2 = $$props["gameState"];
  const upgrades = [
    {
      type: "damage",
      name: "Damage",
      description: "+1 damage per level",
      icon: "⚔️"
    },
    {
      type: "fireRate",
      name: "Fire Rate",
      description: "+20% fire rate per level",
      icon: "🔥"
    },
    {
      type: "health",
      name: "Health",
      description: "+5 HP per level",
      icon: "❤️"
    },
    {
      type: "extraDragons",
      name: "Extra Dragon",
      description: "Adds another dragon",
      icon: "🐉"
    }
  ];
  function canAfford(upgradeType) {
    const cost = calculateUpgradeCost(upgradeType, gameState2.upgrades[upgradeType]);
    return gameState2.currencies.steak.amount >= cost;
  }
  const each_array = ensure_array_like(upgrades);
  $$payload.out.push(`<div class="upgrade-panel svelte-rtj9ss"><h3 class="svelte-rtj9ss">Upgrades</h3> <div class="stats-display svelte-rtj9ss"><div class="stat svelte-rtj9ss"><span class="stat-icon svelte-rtj9ss">⚔️</span> <span class="stat-value svelte-rtj9ss">${escape_html(gameState2.dragonStats.damage)}</span></div> <div class="stat svelte-rtj9ss"><span class="stat-icon svelte-rtj9ss">❤️</span> <span class="stat-value svelte-rtj9ss">${escape_html(gameState2.dragonStats.currentHp)}/${escape_html(gameState2.dragonStats.maxHp)}</span></div> <div class="stat svelte-rtj9ss"><span class="stat-icon svelte-rtj9ss">🐉</span> <span class="stat-value svelte-rtj9ss">${escape_html(gameState2.dragonStats.dragonCount)}</span></div></div> <div class="upgrade-list svelte-rtj9ss"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let upgrade = each_array[$$index];
    const currentLevel = gameState2.upgrades[upgrade.type];
    const cost = calculateUpgradeCost(upgrade.type, currentLevel);
    const affordable = canAfford(upgrade.type);
    $$payload.out.push(`<div class="upgrade-item svelte-rtj9ss"><button${attr_class("upgrade-btn svelte-rtj9ss", void 0, { "affordable": affordable, "expensive": !affordable })}${attr("disabled", !affordable, true)}><div class="upgrade-icon svelte-rtj9ss">${escape_html(upgrade.icon)}</div> <div class="upgrade-info svelte-rtj9ss"><div class="upgrade-name svelte-rtj9ss">${escape_html(upgrade.name)} (${escape_html(currentLevel)})</div> <div class="upgrade-desc svelte-rtj9ss">${escape_html(upgrade.description)}</div> <div class="upgrade-cost svelte-rtj9ss">${escape_html(formatInt(cost))} copper</div></div></button></div>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function WorldMap($$payload, $$props) {
  push();
  let currentLevel, unlockedLevels, completedLevels, currentRegion, startLevel, endLevel, displayLevels;
  let gameState2 = $$props["gameState"];
  const MAX_VISIBLE_LEVELS = 25;
  function getLevelStatus(level) {
    if (completedLevels.includes(level)) return "completed";
    if (level === currentLevel) return "current";
    if (unlockedLevels.includes(level)) return "unlocked";
    return "locked";
  }
  function isBossLevel(level) {
    return level % 10 === 0;
  }
  function getLevelIcon(level) {
    if (isBossLevel(level)) return "🐉";
    if (completedLevels.includes(level)) return "✅";
    if (level === currentLevel) return "⚔️";
    if (unlockedLevels.includes(level)) return "🏰";
    return "🔒";
  }
  currentLevel = gameState2.currentLevel;
  unlockedLevels = gameState2.worldMap.unlockedLevels;
  completedLevels = gameState2.worldMap.completedLevels;
  currentRegion = gameState2.worldMap.currentRegion;
  startLevel = Math.max(1, Math.floor((currentLevel - 1) / MAX_VISIBLE_LEVELS) * MAX_VISIBLE_LEVELS + 1);
  endLevel = Math.min(startLevel + MAX_VISIBLE_LEVELS - 1, Math.max(...unlockedLevels));
  displayLevels = Array.from({ length: endLevel - startLevel + 1 }, (_, i) => startLevel + i);
  const each_array = ensure_array_like(displayLevels);
  $$payload.out.push(`<div class="world-map svelte-1a242jo"><div class="region-header svelte-1a242jo"><h3 class="region-title svelte-1a242jo">${escape_html(currentRegion)}</h3> <div class="region-subtitle svelte-1a242jo">Levels ${escape_html(startLevel)}-${escape_html(endLevel)}</div></div> <div class="level-grid svelte-1a242jo"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let level = each_array[$$index];
    $$payload.out.push(`<button${attr_class(`level-node ${stringify(getLevelStatus(level))} ${stringify(isBossLevel(level) ? "boss" : "")}`, "svelte-1a242jo")}${attr("disabled", !unlockedLevels.includes(level), true)}${attr("title", `Level ${stringify(level)}${stringify(isBossLevel(level) ? " (Boss)" : "")}`)}><div class="level-icon svelte-1a242jo">${escape_html(getLevelIcon(level))}</div> <div class="level-number svelte-1a242jo">${escape_html(level)}</div> `);
    if (isBossLevel(level)) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="boss-indicator svelte-1a242jo">BOSS</div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></button>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="map-legend svelte-1a242jo"><div class="legend-item svelte-1a242jo"><span class="legend-icon svelte-1a242jo">⚔️</span> <span class="legend-text">Current</span></div> <div class="legend-item svelte-1a242jo"><span class="legend-icon svelte-1a242jo">✅</span> <span class="legend-text">Completed</span></div> <div class="legend-item svelte-1a242jo"><span class="legend-icon svelte-1a242jo">🏰</span> <span class="legend-text">Available</span></div> <div class="legend-item svelte-1a242jo"><span class="legend-icon svelte-1a242jo">🐉</span> <span class="legend-text">Boss</span></div></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function GearPanel($$payload, $$props) {
  push();
  let equippedGear, inventory;
  let gameState2 = $$props["gameState"];
  const slotInfo = {
    helm: { name: "Helm", icon: "👑" },
    chest: { name: "Chest", icon: "🛡️" },
    claws: { name: "Claws", icon: "🗡️" },
    tailSpike: { name: "Tail Spike", icon: "⚔️" },
    wingGuards: { name: "Wing Guards", icon: "🛡️" },
    charm: { name: "Charm", icon: "🔮" },
    ring: { name: "Ring", icon: "💍" },
    breathFocus: { name: "Breath Focus", icon: "💎" }
  };
  const slots = Object.keys(slotInfo);
  function getRarityColor(rarity) {
    const colors = {
      "Common": "#9CA3AF",
      "Rare": "#3B82F6",
      "Epic": "#8B5CF6",
      "Legendary": "#F59E0B",
      "Mythic": "#EF4444"
    };
    return colors[rarity] || colors["Common"];
  }
  function formatGearStats(gear) {
    const stats = [];
    if (gear.stats.damage) stats.push(`+${gear.stats.damage} Damage`);
    if (gear.stats.health) stats.push(`+${gear.stats.health} Health`);
    if (gear.stats.fireRate) stats.push(`+${Math.round(gear.stats.fireRate * 10)}% Fire Rate`);
    if (gear.stats.critChance) stats.push(`+${Math.round(gear.stats.critChance * 100)}% Crit`);
    if (gear.stats.critDamage) stats.push(`+${Math.round(gear.stats.critDamage * 100)}% Crit Dmg`);
    return stats.join("\n");
  }
  function getInventoryBySlot(slot) {
    return inventory.filter((gear) => gear.slot === slot);
  }
  function canAffordEnhancement(gear) {
    if (gear.enhancement >= 25) return false;
    const cost = calculateEnhancementCost(gear);
    return gameState2.currencies.gold?.amount >= cost;
  }
  equippedGear = gameState2.equippedGear;
  inventory = gameState2.inventory;
  const each_array = ensure_array_like(slots);
  $$payload.out.push(`<div class="gear-panel svelte-zy2loi"><h3 class="panel-title svelte-zy2loi">Dragon Equipment</h3> <div class="equipment-grid svelte-zy2loi"><!--[-->`);
  for (let $$index_1 = 0, $$length = each_array.length; $$index_1 < $$length; $$index_1++) {
    let slot = each_array[$$index_1];
    $$payload.out.push(`<div class="equipment-slot svelte-zy2loi"><div class="slot-header svelte-zy2loi"><span class="slot-icon svelte-zy2loi">${escape_html(slotInfo[slot].icon)}</span> <span class="slot-name">${escape_html(slotInfo[slot].name)}</span></div> <div class="equipped-gear svelte-zy2loi">`);
    if (equippedGear[slot]) {
      $$payload.out.push("<!--[-->");
      $$payload.out.push(`<div class="gear-item equipped svelte-zy2loi"${attr_style(`border-color: ${stringify(getRarityColor(equippedGear[slot].rarity))}`)}${attr("title", `${stringify(equippedGear[slot].name)}
${stringify(formatGearStats(equippedGear[slot]))}`)}><div class="gear-name svelte-zy2loi"${attr_style(`color: ${stringify(getRarityColor(equippedGear[slot].rarity))}`)}>${escape_html(equippedGear[slot].name)}</div> `);
      if (equippedGear[slot].enhancement > 0) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<div class="enhancement svelte-zy2loi">+${escape_html(equippedGear[slot].enhancement)}</div>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--> <button class="unequip-btn svelte-zy2loi" title="Unequip">❌</button> `);
      if (equippedGear[slot].enhancement < 25) {
        $$payload.out.push("<!--[-->");
        $$payload.out.push(`<button${attr_class("enhance-btn svelte-zy2loi", void 0, { "disabled": !canAffordEnhancement(equippedGear[slot]) })}${attr("disabled", !canAffordEnhancement(equippedGear[slot]), true)}${attr("title", `Enhance (+${stringify(equippedGear[slot].enhancement + 1)})
Cost: ${stringify(formatInt(calculateEnhancementCost(equippedGear[slot])))} Forgegold`)}>⬆️</button>`);
      } else {
        $$payload.out.push("<!--[!-->");
      }
      $$payload.out.push(`<!--]--></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
      $$payload.out.push(`<div class="empty-slot svelte-zy2loi"><span class="empty-text svelte-zy2loi">Empty</span></div>`);
    }
    $$payload.out.push(`<!--]--></div> `);
    if (getInventoryBySlot(slot).length > 0) {
      $$payload.out.push("<!--[-->");
      const each_array_1 = ensure_array_like(getInventoryBySlot(slot));
      $$payload.out.push(`<div class="available-gear svelte-zy2loi"><!--[-->`);
      for (let $$index = 0, $$length2 = each_array_1.length; $$index < $$length2; $$index++) {
        let gear = each_array_1[$$index];
        $$payload.out.push(`<button class="gear-item available svelte-zy2loi"${attr_style(`border-color: ${stringify(getRarityColor(gear.rarity))}`)}${attr("title", `${stringify(gear.name)}
${stringify(formatGearStats(gear))}

Click to equip`)}><div class="gear-name svelte-zy2loi"${attr_style(`color: ${stringify(getRarityColor(gear.rarity))}`)}>${escape_html(gear.name)}</div> `);
        if (gear.enhancement > 0) {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`<div class="enhancement svelte-zy2loi">+${escape_html(gear.enhancement)}</div>`);
        } else {
          $$payload.out.push("<!--[!-->");
        }
        $$payload.out.push(`<!--]--></button>`);
      }
      $$payload.out.push(`<!--]--></div>`);
    } else {
      $$payload.out.push("<!--[!-->");
    }
    $$payload.out.push(`<!--]--></div>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function TreasuryPanel($$payload, $$props) {
  push();
  let gameState2 = $$props["gameState"];
  $$payload.out.push(`<div class="treasury-panel svelte-1if1znq"><div class="level-info svelte-1if1znq"><div class="level-badge svelte-1if1znq">Level ${escape_html(gameState2.currentLevel)}</div> <div class="region-name svelte-1if1znq">${escape_html(gameState2.worldMap.currentRegion)}</div> <button class="test-btn svelte-1if1znq">Advance Level</button></div> <div class="currencies svelte-1if1znq"><div class="counter svelte-1if1znq"><div class="icon steak svelte-1if1znq">🥩</div> <div class="amount svelte-1if1znq">${escape_html(formatInt(gameState2.currencies.steak.amount))}</div> <div class="label svelte-1if1znq">Dragon Steak</div></div> `);
  if (gameState2.currencies.gold.unlocked) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="counter svelte-1if1znq"><div class="icon gold svelte-1if1znq">🪙</div> <div class="amount gold svelte-1if1znq">${escape_html(formatInt(gameState2.currencies.gold.amount))}</div> <div class="label svelte-1if1znq">Dragon Gold</div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (gameState2.currencies.dragonscales.unlocked) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="counter svelte-1if1znq"><div class="icon dragonscales svelte-1if1znq">🐲</div> <div class="amount scales svelte-1if1znq">${escape_html(formatInt(gameState2.currencies.dragonscales.amount))}</div> <div class="label svelte-1if1znq">Dragonscales</div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (gameState2.currencies.gems.unlocked) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="counter svelte-1if1znq"><div class="icon gems svelte-1if1znq">💎</div> <div class="amount gems-color svelte-1if1znq">${escape_html(formatInt(gameState2.currencies.gems.amount))}</div> <div class="label svelte-1if1znq">Gems</div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div> <div class="upgrades-section svelte-1if1znq"><h3 class="section-title svelte-1if1znq">Dragon Upgrades</h3> `);
  UpgradePanel($$payload, { gameState: gameState2 });
  $$payload.out.push(`<!----></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function CraftingPanel($$payload, $$props) {
  push();
  let state, materials, recipes, unlockedRecipes, lockedRecipes;
  let gameState2 = $$props["gameState"];
  const materialInfo = {
    emberdust: { name: "Ember Dust", color: "#ff6b35", icon: "🔥" },
    frostshards: { name: "Frost Shards", color: "#4fb3d9", icon: "❄️" },
    stormmotes: { name: "Storm Motes", color: "#9d4edd", icon: "⚡" },
    venomglobules: { name: "Venom Globules", color: "#52b788", icon: "🧪" },
    emberore: { name: "Ember Ore", color: "#d62828", icon: "💎" },
    frostmetal: { name: "Frost Metal", color: "#023047", icon: "🧊" },
    stormsteel: { name: "Storm Steel", color: "#6f2dbd", icon: "⚡" },
    shadowessence: { name: "Shadow Essence", color: "#2d1b69", icon: "🌑" }
  };
  function canCraftRecipe(recipe) {
    if (state.currentLevel < recipe.requiredLevel) return false;
    return recipe.materials.every((req) => materials[req.type] >= req.amount);
  }
  state = gameState2;
  materials = state?.materials;
  recipes = state?.recipes || [];
  unlockedRecipes = recipes.filter((r) => r.unlocked);
  lockedRecipes = recipes.filter((r) => !r.unlocked);
  const each_array = ensure_array_like(Object.entries(materials || {}));
  $$payload.out.push(`<div class="crafting-panel svelte-122d785"><div class="panel-header svelte-122d785"><h3 class="svelte-122d785">🔨 Dragoncrafting Forge</h3> <p class="subtitle svelte-122d785">Transform raw materials into powerful equipment</p></div> <div class="materials-section svelte-122d785"><h4 class="svelte-122d785">📦 Materials Inventory</h4> <div class="materials-grid svelte-122d785"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let [materialType, amount] = each_array[$$index];
    const info = materialInfo[materialType];
    $$payload.out.push(`<div${attr_class("material-item svelte-122d785", void 0, { "has-materials": amount > 0 })}><div class="material-icon svelte-122d785"${attr_style(`color: ${stringify(info.color)}`)}>${escape_html(info.icon)}</div> <div class="material-info svelte-122d785"><div class="material-name svelte-122d785">${escape_html(info.name)}</div> <div class="material-count svelte-122d785">${escape_html(formatInt(amount))}</div></div></div>`);
  }
  $$payload.out.push(`<!--]--></div></div> `);
  if (unlockedRecipes.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array_1 = ensure_array_like(unlockedRecipes);
    $$payload.out.push(`<div class="recipes-section svelte-122d785"><h4 class="svelte-122d785">📜 Available Recipes</h4> <div class="recipes-list svelte-122d785"><!--[-->`);
    for (let $$index_3 = 0, $$length = each_array_1.length; $$index_3 < $$length; $$index_3++) {
      let recipe = each_array_1[$$index_3];
      const canCraft = canCraftRecipe(recipe);
      const each_array_2 = ensure_array_like(Object.entries(recipe.baseStats));
      const each_array_3 = ensure_array_like(recipe.materials);
      $$payload.out.push(`<div${attr_class("recipe-card svelte-122d785", void 0, { "can-craft": canCraft })}><div class="recipe-header svelte-122d785"><div class="recipe-name svelte-122d785">${escape_html(recipe.name)}</div> <div${attr_class("recipe-rarity svelte-122d785", void 0, {
        "common": recipe.targetRarity === "Common",
        "rare": recipe.targetRarity === "Rare",
        "epic": recipe.targetRarity === "Epic"
      })}>${escape_html(recipe.targetRarity)}</div></div> <div class="recipe-stats svelte-122d785"><!--[-->`);
      for (let $$index_1 = 0, $$length2 = each_array_2.length; $$index_1 < $$length2; $$index_1++) {
        let [stat, value] = each_array_2[$$index_1];
        $$payload.out.push(`<span class="stat-bonus svelte-122d785">`);
        if (stat === "damage") {
          $$payload.out.push("<!--[-->");
          $$payload.out.push(`💥`);
        } else {
          $$payload.out.push("<!--[!-->");
          if (stat === "health") {
            $$payload.out.push("<!--[-->");
            $$payload.out.push(`❤️`);
          } else {
            $$payload.out.push("<!--[!-->");
            if (stat === "fireRate") {
              $$payload.out.push("<!--[-->");
              $$payload.out.push(`⚡`);
            } else {
              $$payload.out.push("<!--[!-->");
            }
            $$payload.out.push(`<!--]-->`);
          }
          $$payload.out.push(`<!--]-->`);
        }
        $$payload.out.push(`<!--]--> +${escape_html(value)}</span>`);
      }
      $$payload.out.push(`<!--]--></div> <div class="recipe-materials svelte-122d785"><!--[-->`);
      for (let $$index_2 = 0, $$length2 = each_array_3.length; $$index_2 < $$length2; $$index_2++) {
        let requirement = each_array_3[$$index_2];
        const info = materialInfo[requirement.type];
        const hasEnough = materials[requirement.type] >= requirement.amount;
        $$payload.out.push(`<div${attr_class("material-requirement svelte-122d785", void 0, { "insufficient": !hasEnough })}><span class="req-icon svelte-122d785"${attr_style(`color: ${stringify(info.color)}`)}>${escape_html(info.icon)}</span> <span class="req-text svelte-122d785">${escape_html(requirement.amount)} ${escape_html(info.name)}</span> <span class="req-owned svelte-122d785">(${escape_html(materials[requirement.type])}/${escape_html(requirement.amount)})</span></div>`);
      }
      $$payload.out.push(`<!--]--></div> <button${attr_class("craft-button svelte-122d785", void 0, { "enabled": canCraft })}${attr("disabled", !canCraft, true)}>${escape_html(canCraft ? "🔨 Craft" : "❌ Insufficient Materials")}</button></div>`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--> `);
  if (lockedRecipes.length > 0) {
    $$payload.out.push("<!--[-->");
    const each_array_4 = ensure_array_like(lockedRecipes);
    $$payload.out.push(`<div class="locked-section svelte-122d785"><h4 class="svelte-122d785">🔒 Locked Recipes</h4> <div class="locked-recipes svelte-122d785"><!--[-->`);
    for (let $$index_4 = 0, $$length = each_array_4.length; $$index_4 < $$length; $$index_4++) {
      let recipe = each_array_4[$$index_4];
      $$payload.out.push(`<div class="locked-recipe svelte-122d785"><div class="locked-name svelte-122d785">${escape_html(recipe.name)}</div> <div class="unlock-req svelte-122d785">Unlock at Level ${escape_html(recipe.requiredLevel)}</div></div>`);
    }
    $$payload.out.push(`<!--]--></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function TabContainer($$payload, $$props) {
  push();
  let currentTab;
  let tabs = fallback($$props["tabs"], () => [], true);
  let activeTab = fallback($$props["activeTab"], "");
  if (!activeTab && tabs.length > 0) {
    activeTab = tabs[0].id;
  }
  currentTab = tabs.find((tab) => tab.id === activeTab);
  const each_array = ensure_array_like(tabs);
  $$payload.out.push(`<div class="tab-container svelte-1h8ze5m"><div class="tab-nav svelte-1h8ze5m"><!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let tab = each_array[$$index];
    $$payload.out.push(`<button${attr_class(`tab-button ${stringify(activeTab === tab.id ? "active" : "")}`, "svelte-1h8ze5m")}${attr("title", tab.label)}><span class="tab-icon svelte-1h8ze5m">${escape_html(tab.icon)}</span> <span class="tab-label svelte-1h8ze5m">${escape_html(tab.label)}</span></button>`);
  }
  $$payload.out.push(`<!--]--></div> <div class="tab-content svelte-1h8ze5m">`);
  if (currentTab) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<!---->`);
    currentTab.component?.($$payload, spread_props([currentTab.props || {}]));
    $$payload.out.push(`<!---->`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]--></div></div>`);
  bind_props($$props, { tabs, activeTab });
  pop();
}
function DistancePillar($$payload, $$props) {
  push();
  let currentLevel, levelDistance, levelDistanceTarget, totalDistance, travelState, distanceProgress, levelMarkers, stateColor, stateLabel;
  let gameState2 = $$props["gameState"];
  function formatDistance(meters) {
    if (meters >= 1e3) {
      return `${(meters / 1e3).toFixed(1)}km`;
    }
    return `${Math.floor(meters)}m`;
  }
  function generateLevelMarkers() {
    const markers = [];
    const maxDisplayLevels = 10;
    const startLevel = Math.max(1, currentLevel - 5);
    const endLevel = startLevel + maxDisplayLevels - 1;
    for (let level = startLevel; level <= endLevel; level++) {
      const isPassed = level < currentLevel;
      const isCurrent = level === currentLevel;
      const position = (level - startLevel) / (maxDisplayLevels - 1) * 100;
      markers.push({
        level,
        position: 100 - position,
        // Invert so level 1 is at bottom
        isPassed,
        isCurrent
      });
    }
    return markers;
  }
  currentLevel = gameState2.currentLevel;
  levelDistance = gameState2.levelDistance;
  levelDistanceTarget = gameState2.levelDistanceTarget;
  totalDistance = gameState2.totalDistance;
  travelState = gameState2.travelState;
  distanceProgress = Math.min(levelDistance / levelDistanceTarget, 1);
  levelMarkers = generateLevelMarkers();
  stateColor = {
    "ADVANCING": "var(--color-success)",
    "HOVERING": "var(--color-text-muted)",
    "RETREATING": "var(--color-error)",
    "GATE": "var(--color-forge-primary)",
    "TRAVEL_TO_TARGET": "var(--color-info)"
  }[travelState] || "var(--color-text-muted)";
  stateLabel = {
    "ADVANCING": "Advancing",
    "HOVERING": "Hovering",
    "RETREATING": "Retreating",
    "GATE": "At Gate",
    "TRAVEL_TO_TARGET": "Traveling"
  }[travelState] || "Unknown";
  const each_array = ensure_array_like(levelMarkers);
  $$payload.out.push(`<div class="distance-pillar forge-panel forge-border-thick svelte-11295dl" role="region" aria-label="Dragon progress and level tracking"><div class="pillar-connection-point svelte-11295dl" title="Forge Power Conduit - Channeling energy from the main forge"></div> <div class="pillar-header svelte-11295dl"><div class="level-display svelte-11295dl"><span class="level-number svelte-11295dl">L${escape_html(currentLevel)}</span> <div class="travel-state svelte-11295dl"${attr_style(`color: ${stringify(stateColor)}`)}><div${attr_class(`state-indicator state-${stringify(travelState.toLowerCase())}`, "svelte-11295dl")}${attr_style(`background-color: ${stringify(stateColor)}`)}></div> <span class="state-text svelte-11295dl">${escape_html(stateLabel)}</span></div></div></div> <div class="pillar-container svelte-11295dl"${attr_style(`--distance-progress: ${stringify(distanceProgress)}`)}><div class="pillar-background svelte-11295dl"></div> <div class="pillar-progress svelte-11295dl"${attr_style(`height: ${stringify(distanceProgress * 100)}%`)}></div> <!--[-->`);
  for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
    let marker = each_array[$$index];
    $$payload.out.push(`<div${attr_class("level-marker forge-interactive svelte-11295dl", void 0, { "passed": marker.isPassed, "current": marker.isCurrent })}${attr_style(`top: ${stringify(marker.position)}%`)}><div class="marker-dot svelte-11295dl"></div> <div class="marker-label svelte-11295dl">L${escape_html(marker.level)}</div></div>`);
  }
  $$payload.out.push(`<!--]--> <div class="current-position svelte-11295dl"${attr_style(`bottom: ${stringify(distanceProgress * 100)}%`)}><div class="position-dot ember-glow svelte-11295dl"></div> <div class="position-label metal-inset svelte-11295dl"><div class="distance-current ember-glow ember-flicker svelte-11295dl">${escape_html(formatDistance(levelDistance))}</div> <div class="distance-target svelte-11295dl">/ ${escape_html(formatDistance(levelDistanceTarget))}</div></div></div></div> <div class="pillar-footer svelte-11295dl"><div class="total-distance metal-frame forge-rivets svelte-11295dl"><span class="total-label svelte-11295dl">Total</span> <span class="total-value ember-glow ember-flicker svelte-11295dl">${escape_html(formatDistance(totalDistance))}</span></div></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function TopBar($$payload, $$props) {
  push();
  let currentLevel, currentRegion, travelState, stateColor;
  let gameState2 = $$props["gameState"];
  currentLevel = gameState2.currentLevel;
  currentRegion = gameState2.worldMap.currentRegion;
  travelState = gameState2.travelState;
  stateColor = {
    "ADVANCING": "var(--color-success)",
    "HOVERING": "var(--color-text-muted)",
    "RETREATING": "var(--color-error)",
    "GATE": "var(--color-forge-primary)",
    "TRAVEL_TO_TARGET": "var(--color-info)"
  }[travelState] || "var(--color-text-muted)";
  $$payload.out.push(`<div class="top-bar forge-panel forge-border-heavy forge-corner-rivets forge-glow-intense svelte-1p7y7ir" role="banner" aria-label="Dragon status and navigation"><div class="title-section svelte-1p7y7ir"><h1 class="game-title svelte-1p7y7ir">Dragonforge Chronicles</h1> <div class="game-info svelte-1p7y7ir"><span class="level-info svelte-1p7y7ir">Level ${escape_html(currentLevel)}</span> <span class="region-info svelte-1p7y7ir">${escape_html(currentRegion)}</span></div></div> <div class="status-section metal-frame forge-rivets svelte-1p7y7ir"><div class="state-display svelte-1p7y7ir"><div class="state-indicator ember-glow ember-flicker svelte-1p7y7ir"${attr_style(`background-color: ${stringify(stateColor)}`)}></div> <div class="state-label svelte-1p7y7ir">Dragon Status</div></div></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function TravelControls($$payload, $$props) {
  push();
  let travelState, isAdvancing, stateDisplay;
  let gameState2 = $$props["gameState"];
  function getTravelStateDisplay(state) {
    switch (state) {
      case "ADVANCING":
        return { text: "Advancing", color: "var(--color-success)" };
      case "HOVERING":
        return { text: "Hovering", color: "var(--color-text-muted)" };
      case "RETREATING":
        return { text: "Retreating", color: "var(--color-warning)" };
      case "GATE":
        return { text: "At Gate", color: "var(--color-forge-primary)" };
      case "TRAVEL_TO_TARGET":
        return { text: "Traveling", color: "var(--color-info)" };
      default:
        return { text: "Unknown", color: "var(--color-text-muted)" };
    }
  }
  travelState = gameState2.travelState;
  isAdvancing = travelState === "ADVANCING";
  stateDisplay = getTravelStateDisplay(travelState);
  $$payload.out.push(`<div class="travel-controls metal-frame forge-rivets"><div class="travel-status svelte-1jcwrev"><div class="status-indicator status-pulse svelte-1jcwrev"${attr_style(`background-color: ${stringify(stateDisplay.color)}; animation: statusGlow 2s ease-in-out infinite`)}></div> <span class="status-text svelte-1jcwrev">${escape_html(stateDisplay.text)}</span></div> <div class="control-buttons svelte-1jcwrev">`);
  if (isAdvancing) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<button class="travel-button stop-button forge-button forge-ripple svelte-1jcwrev" aria-label="Stop Travel"><span class="button-icon svelte-1jcwrev">⏸️</span> <span class="button-text svelte-1jcwrev">Stop</span></button>`);
  } else {
    $$payload.out.push("<!--[!-->");
    $$payload.out.push(`<button class="travel-button start-button forge-button forge-ripple svelte-1jcwrev" aria-label="Start Travel"><span class="button-icon svelte-1jcwrev">▶️</span> <span class="button-text svelte-1jcwrev">Start</span></button>`);
  }
  $$payload.out.push(`<!--]--></div></div>`);
  bind_props($$props, { gameState: gameState2 });
  pop();
}
function ControlsDock($$payload, $$props) {
  push();
  let gameState2 = $$props["gameState"];
  let onMapToggle = $$props["onMapToggle"];
  let onGoHome = $$props["onGoHome"];
  gameState2.travelState;
  $$payload.out.push(`<div class="controls-dock forge-panel metal-frame svelte-83wp8i"><div class="travel-section svelte-83wp8i">`);
  TravelControls($$payload, { gameState: gameState2 });
  $$payload.out.push(`<!----></div> <div class="nav-section svelte-83wp8i"><button class="dock-button forge-button forge-ripple svelte-83wp8i" aria-label="Open World Map" title="World Map - Select travel destination"><span class="button-icon svelte-83wp8i">🗺️</span> <span class="button-text svelte-83wp8i">Map</span></button> <button class="dock-button forge-button forge-ripple svelte-83wp8i" aria-label="Return Home" title="Return to starting region"><span class="button-icon svelte-83wp8i">🏠</span> <span class="button-text svelte-83wp8i">Home</span></button></div></div>`);
  bind_props($$props, { gameState: gameState2, onMapToggle, onGoHome });
  pop();
}
function WorldMapDrawer($$payload, $$props) {
  push();
  let gameState2 = $$props["gameState"];
  let isOpen = fallback($$props["isOpen"], false);
  let onClose = $$props["onClose"];
  if (isOpen) {
    $$payload.out.push("<!--[-->");
    $$payload.out.push(`<div class="drawer-overlay svelte-3fwdz3" role="dialog" aria-modal="true" aria-label="World Map" tabindex="-1"><div class="drawer-content forge-panel forge-border-heavy svelte-3fwdz3"><div class="drawer-header svelte-3fwdz3"><h2 class="drawer-title svelte-3fwdz3">World Map</h2> <button class="close-button forge-button svelte-3fwdz3" aria-label="Close World Map"><span class="close-icon svelte-3fwdz3">✕</span></button></div> <div class="drawer-body svelte-3fwdz3">`);
    WorldMap($$payload, { gameState: gameState2 });
    $$payload.out.push(`<!----></div></div></div>`);
  } else {
    $$payload.out.push("<!--[!-->");
  }
  $$payload.out.push(`<!--]-->`);
  bind_props($$props, { gameState: gameState2, isOpen, onClose });
  pop();
}
function _page($$payload, $$props) {
  push();
  var $$store_subs;
  let state, tabs;
  let activeTab = "treasury";
  let isMapDrawerOpen = false;
  function handleMapToggle() {
    isMapDrawerOpen = !isMapDrawerOpen;
  }
  function handleMapClose() {
    isMapDrawerOpen = false;
  }
  function handleGoHome() {
    console.log("Go home clicked");
  }
  state = store_get($$store_subs ??= {}, "$gameState", gameState);
  tabs = [
    {
      id: "treasury",
      label: "Treasury",
      icon: "💰",
      component: TreasuryPanel,
      props: { gameState: state }
    },
    {
      id: "equipment",
      label: "Equipment",
      icon: "⚔️",
      component: GearPanel,
      props: { gameState: state }
    },
    {
      id: "crafting",
      label: "Crafting",
      icon: "🔨",
      component: CraftingPanel,
      props: { gameState: state }
    }
  ];
  let $$settled = true;
  let $$inner_payload;
  function $$render_inner($$payload2) {
    if (state) {
      $$payload2.out.push("<!--[-->");
      $$payload2.out.push(`<div class="app-container svelte-zgf0p2">`);
      TopBar($$payload2, { gameState: state });
      $$payload2.out.push(`<!----> <div class="dashboard svelte-zgf0p2"><div class="combat-area svelte-zgf0p2">`);
      CombatScreen($$payload2);
      $$payload2.out.push(`<!----></div> <div class="interface-panel forge-panel forge-corner-rivets ambient-forge svelte-zgf0p2"><div class="interface-content svelte-zgf0p2"><div class="tabs-area svelte-zgf0p2">`);
      TabContainer($$payload2, {
        tabs,
        get activeTab() {
          return activeTab;
        },
        set activeTab($$value) {
          activeTab = $$value;
          $$settled = false;
        }
      });
      $$payload2.out.push(`<!----></div> <div class="pillar-area svelte-zgf0p2"><div class="pillar-connector metal-frame svelte-zgf0p2"></div> `);
      DistancePillar($$payload2, { gameState: state });
      $$payload2.out.push(`<!----></div></div></div></div> `);
      ControlsDock($$payload2, {
        gameState: state,
        onMapToggle: handleMapToggle,
        onGoHome: handleGoHome
      });
      $$payload2.out.push(`<!----></div> `);
      WorldMapDrawer($$payload2, {
        gameState: state,
        isOpen: isMapDrawerOpen,
        onClose: handleMapClose
      });
      $$payload2.out.push(`<!---->`);
    } else {
      $$payload2.out.push("<!--[!-->");
      $$payload2.out.push(`<div class="loading svelte-zgf0p2">Loading your treasury...</div>`);
    }
    $$payload2.out.push(`<!--]-->`);
  }
  do {
    $$settled = true;
    $$inner_payload = copy_payload($$payload);
    $$render_inner($$inner_payload);
  } while (!$$settled);
  assign_payload($$payload, $$inner_payload);
  if ($$store_subs) unsubscribe_stores($$store_subs);
  pop();
}
export {
  _page as default
};
