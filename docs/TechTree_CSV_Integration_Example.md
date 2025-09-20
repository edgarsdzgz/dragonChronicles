# 🌳 **Draconia Tech Tree CSV Integration Example**

## 📋 **Overview**

This document demonstrates how the `Draconia*TechTrees*Main3.csv` file integrates with the
tech
tree
system
architecture
defined
in
Epic
1.1.8.

## 🔄 **CSV Processing Flow**

### **Input CSV Data:**

```csv

Tree,NodeName,UpgradeType,Tier
Flamecraft,Damage 1,Damage,1
Flamecraft,Damage 2,Damage,2
Flamecraft,Flight Speed 1,Flight Speed,1
Safety,Gold Gain 1,Gold Gain,1

```javascript

### **Generated Tech Tree Nodes:**

```typescript

// After CSV processing, these nodes are created:

const flamecraftDamage1: TechTreeNode = {
  id: "flamecraft*damage*1",
  treeId: TechTreeId.FLAMECRAFT,
  nodeName: "Damage 1",
  upgradeType: UpgradeType.DAMAGE,
  tier: 1,
  prerequisites: [], // No prerequisites for tier 1
  soulPowerCost: 200, // 2^1 * 100
  maxLevel: 1,
  upgradeCostScaling: 1.5,
  effects: [{
    targetSystem: SystemId.COMBAT,
    effectType: EffectType.BONUS,
    targetProperty: 'damageBonus',
    value: 10,
    valueType: ValueType.ADDITIVE
  }]
};

const flamecraftDamage2: TechTreeNode = {
  id: "flamecraft*damage*2",
  treeId: TechTreeId.FLAMECRAFT,
  nodeName: "Damage 2",
  upgradeType: UpgradeType.DAMAGE,
  tier: 2,
  prerequisites: ["flamecraft*damage*1"], // Auto-calculated prerequisite
  soulPowerCost: 400, // 2^2 * 100
  maxLevel: 1,
  upgradeCostScaling: 1.5,
  effects: [{
    targetSystem: SystemId.COMBAT,
    effectType: EffectType.BONUS,
    targetProperty: 'damageBonus',
    value: 10,
    valueType: ValueType.ADDITIVE
  }]
};

const safetyFlightSpeed1: TechTreeNode = {
  id: "safety*flight*speed_1",
  treeId: TechTreeId.SAFETY,
  nodeName: "Flight Speed 1",
  upgradeType: UpgradeType.FLIGHT_SPEED,
  tier: 1,
  prerequisites: [],
  soulPowerCost: 200,
  maxLevel: 1,
  upgradeCostScaling: 1.5,
  effects: [{
    targetSystem: SystemId.DISTANCE,
    effectType: EffectType.BONUS,
    targetProperty: 'speedBonus',
    value: 5,
    valueType: ValueType.ADDITIVE
  }]
};

const safetyGoldGain1: TechTreeNode = {
  id: "safety*gold*gain_1",
  treeId: TechTreeId.SAFETY,
  nodeName: "Gold Gain 1",
  upgradeType: UpgradeType.GOLD_GAIN,
  tier: 1,
  prerequisites: [],
  soulPowerCost: 200,
  maxLevel: 1,
  upgradeCostScaling: 1.5,
  effects: [{
    targetSystem: SystemId.ECONOMY,
    effectType: EffectType.MULTIPLIER,
    targetProperty: 'goldMultiplier',
    value: 1.15,
    valueType: ValueType.MULTIPLICATIVE
  }]
};

```text

## 🎯 **System Integration**

### **Distance System Integration:**

When a player unlocks "Flight Speed 1", the `TechTreeManager` automatically applies the
effect
to
the
distance
system:

```typescript

// In DistanceProgressionSystem constructor:
const distanceUpgrades = techTreeManager.getSystemUpgrades(SystemId.DISTANCE);
// distanceUpgrades.speedBonus = 5 (from Flight Speed 1)

const distanceSystem = new DistanceProgressionSystem(
  distanceConfig,
  distanceUpgrades // Contains tech tree bonuses
);

```javascript

### **Combat System Integration:**

When a player unlocks "Damage 1" and "Damage 2", both effects are combined:

```typescript

// In CombatSystem constructor:
const combatUpgrades = techTreeManager.getSystemUpgrades(SystemId.COMBAT);
// combatUpgrades.damageBonus = 20 (10 + 10 from both damage nodes)

const combatSystem = new CombatSystem(
  combatConfig,
  combatUpgrades // Contains all unlocked damage bonuses
);

```text

### **Economy System Integration:**

When a player unlocks "Gold Gain 1", the effect is applied to economy calculations:

```typescript

// In EconomySystem:
const economyUpgrades = techTreeManager.getSystemUpgrades(SystemId.ECONOMY);
// economyUpgrades.goldMultiplier = 1.15 (15% gold increase)

const baseGoldGain = 100;
const finalGoldGain = baseGoldGain * economyUpgrades.goldMultiplier; // 115 gold

```text

## 🚀 **Adding New Content**

### **Adding a New Node:**

Simply add a row to the CSV:

```csv

Safety,Gold Gain 5,Gold Gain,5

```text

This automatically creates:

- ID: `safety*gold*gain_5`

- Prerequisites: `["safety*gold*gain_4"]` (auto-calculated)

- Cost: 3200 Soul Power (2^5 * 100)

- Effect: +15% gold multiplier

### **Adding a New Tree:**

Add a new tree column value:

```csv

Magic,Fireball 1,Fireball,1
Magic,Fireball 2,Fireball,2

```text

The system automatically:

- Creates new `TechTreeId.MAGIC` enum value

- Generates appropriate node IDs

- Calculates prerequisites

- Applies default effects (can be customized)

### **Adding a New Upgrade Type:**

Add a new upgrade type to the CSV:

```csv

Safety,Shield Regen 1,Shield Regen,1

```bash

The system automatically:

- Creates new `UpgradeType.SHIELD_REGEN` enum value

- Generates default effect (can be customized in code)

- Integrates with appropriate systems

## 🔧 **Customization Options**

### **Effect Customization:**

Effects can be customized by modifying the `generateEffects()` method:

```typescript

case 'shield regen':
  effects.push({
    targetSystem: SystemId.COMBAT,
    effectType: EffectType.BONUS,
    targetProperty: 'shieldRegenRate',
    value: 2, // 2 shield per second
    valueType: ValueType.ADDITIVE
  });
  break;

```javascript

### **Cost Customization:**

Costs can be customized by modifying the `calculateBaseCost()` method:

```typescript

private calculateBaseCost(tier: number): number {
  // Custom cost scaling: exponential with different base
  return Math.pow(3, tier) * 50; // 50, 150, 450, 1350, 4050, 12150
}

```text

### **Prerequisite Customization:**

Prerequisites can be customized by modifying the `calculatePrerequisites()` method:

```typescript

private calculatePrerequisites(treeName: string, nodeName: string, tier: number): string[]
{
  const prerequisites: string[] = [];

  // Custom logic for cross-tree prerequisites
  if (nodeName.includes('Advanced') && tier >= 3) {
    prerequisites.push('safety*basic*understanding_1');
  }

  return prerequisites;
}

```javascript

## 📊 **Benefits of This System**

### **For Designers:**

- ✅ **No Code Required:** Add nodes by editing CSV files

- ✅ **Version Control:** Track changes with Git

- ✅ **Easy Balancing:** Adjust costs and effects without developer involvement

- ✅ **Rapid Iteration:** Test changes without rebuilding the game

### **For Developers:**

- ✅ **Type Safety:** All tech tree data is strongly typed

- ✅ **Automatic Integration:** Effects automatically apply to game systems

- ✅ **Extensible:** Easy to add new effect types and systems

- ✅ **Performance:** Efficient lookup and calculation

### **For Players:**

- ✅ **Rich Progression:** 84+ upgrade nodes across 3 trees

- ✅ **Meaningful Choices:** Each upgrade provides tangible benefits

- ✅ **Long-term Goals:** Clear progression paths with prerequisites

- ✅ **Permanent Benefits:** Upgrades persist across all journeys

---

## 🎮 **Summary**

The CSV integration system provides a powerful, flexible foundation for the Draconia tech
tree
system..
It allows for easy content creation and modification while maintaining type safety and
performance.
The system automatically handles prerequisites, costs, and effect application, making it
accessible
to
both
designers
and
developers.

**Result:** A scalable, maintainable tech tree system that can grow with the game's needs while remaining easy to balance and expand.
