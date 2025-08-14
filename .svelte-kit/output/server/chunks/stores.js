import { r as readable } from "./index.js";
import Dexie from "dexie";
class GameDB extends Dexie {
  saves;
  constructor() {
    super("dragon-idler");
    this.version(1).stores({
      saves: ""
      // simple key-value where key is string (primary key is custom)
    });
  }
}
new GameDB();
const gameState = readable(null, (set) => {
  {
    return () => {
    };
  }
});
function calculateEnhancementCost(gear) {
  const rarityMultipliers = {
    "Common": 1,
    "Rare": 1.5,
    "Epic": 2,
    "Legendary": 3,
    "Mythic": 5
  };
  const baseCost = 100;
  const multiplier = rarityMultipliers[gear.rarity] || 1;
  return Math.floor(baseCost * multiplier * Math.pow(1.25, gear.enhancement));
}
function calculateUpgradeCost(upgradeType, currentLevel) {
  const baseCosts = {
    damage: 5,
    // Reduced from 10
    fireRate: 8,
    // Reduced from 15
    health: 12,
    // Reduced from 20
    extraDragons: 500
    // Reduced from 1000
  };
  const baseCost = baseCosts[upgradeType];
  if (upgradeType === "extraDragons") {
    return baseCost * Math.pow(currentLevel + 1, 2);
  }
  return Math.floor(baseCost * Math.pow(currentLevel + 1, 1.5));
}
export {
  calculateEnhancementCost as a,
  calculateUpgradeCost as c,
  gameState as g
};
