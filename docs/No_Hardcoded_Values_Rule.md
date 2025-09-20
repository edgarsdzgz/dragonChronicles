# 🚫 **No Hardcoded Values Rule - Scalability & Future-Proofing**

## 📋 **Rule Overview**

**MANDATORY:** All technical specifications, code examples, and system designs MUST be free of hardcoded values that affect gameplay. Every numeric constant, duration, rate, threshold, limit, and configuration value that directly impacts player experience MUST be upgradeable through player progression systems.

**IMPORTANT:** Test values and testing-specific constants are exempt from this rule. Tests should focus on reliability and consistency, using fixed values that ensure predictable test behavior.

## 🎯 **What This Rule Does**

**For Non-Coders:** This rule ensures that every aspect of the game that affects the player can be improved or modified in the future. Gameplay elements are not permanently fixed - players can upgrade everything through gameplay, and developers can adjust difficulty or add new features without rewriting code. Test values remain fixed to ensure reliable testing.

**Technical Summary:** Establishes a comprehensive upgrade system architecture where all gameplay parameters are configurable, upgradeable, and extensible through player progression, tech trees, and future content additions. Testing systems use fixed values for consistency and reliability.

## 🔧 **Implementation Requirements**

### **1. Configuration-First Design**

- **All gameplay values** must be stored in configuration objects

- **No magic numbers** in gameplay code examples or interfaces

- **Base values** defined in config, **upgrades** modify base values

- **Examples** must show both base and upgraded scenarios

- **Test values** can be hardcoded for reliability and consistency

### **2. Upgrade System Integration**

- **Soul Power upgrades** for permanent improvements

- **Tech tree integration** for research-based enhancements

- **Premium currency options** for convenience features

- **Difficulty level scaling** for different player preferences

### **3. Future-Proofing Requirements**

- **Modular upgrade interfaces** that can accommodate new parameters

- **Extensible configuration systems** that support new upgrade types

- **Difficulty scaling systems** that can adjust all parameters

- **Premium feature integration** without breaking existing progression

## 📊 **Examples of What Must Be Upgradeable**

### **❌ FORBIDDEN - Hardcoded Values:**

```typescript

// BAD: Hardcoded values
const duration = 15 * 60 * 1000;  // 15 minutes hardcoded
const cooldown = 30 * 60 * 1000;  // 30 minutes hardcoded
const taxRate = 0.25;             // 25% hardcoded
const maxHours = 24;              // 24 hours hardcoded

```javascript

### **✅ REQUIRED - Upgradeable Values:**

```typescript

// GOOD: Configuration-based with upgrades
interface RestedBonusConfig {
  baseDurationMs: number;         // Base duration (15 minutes)
  baseCooldownMs: number;         // Base cooldown (30 minutes)
  baseMultiplier: number;         // Base multiplier (1.5x)
  baseMinActiveTimeMs: number;    // Base requirement (30 minutes)
}

interface RestedBonusUpgrades {
  durationBonus: number;          // Additional duration from upgrades
  cooldownReduction: number;      // Cooldown reduction from upgrades
  multiplierBonus: number;        // Additional multiplier from upgrades
  activeTimeReduction: number;    // Reduced requirement from upgrades
}

// Effective values with upgrades applied
private getEffectiveConfig(): RestedBonusConfig {
  return {
    baseDurationMs: this.config.baseDurationMs + this.upgrades.durationBonus,
    baseCooldownMs: this.config.baseCooldownMs * (1 - this.upgrades.cooldownReduction),
    baseMultiplier: this.config.baseMultiplier + this.upgrades.multiplierBonus,
baseMinActiveTimeMs: this.config.baseMinActiveTimeMs * (1 -
this.upgrades.activeTimeReduction)
  };
}

```text

## 🎮 **Game System Categories That Must Be Upgradeable**

### **1. Time-Based Systems**

- **Durations:** All bonus durations, cooldowns, timeouts

- **Intervals:** Tick rates, update frequencies, check intervals

- **Limits:** Maximum offline time, session limits, daily caps

### **2. Progression Systems**

- **Rates:** Experience gain, Arcana gain, progression multipliers

- **Thresholds:** Level requirements, unlock conditions, achievement triggers

- **Scaling:** Enemy difficulty curves, reward scaling, cost inflation

### **3. Economy Systems**

- **Taxes:** Shield Tax rates, transaction fees, penalty rates

- **Costs:** Upgrade costs, item prices, service fees

- **Rewards:** Drop rates, bonus multipliers, special event bonuses

### **4. Combat Systems**

- **Damage:** Base damage, scaling factors, critical hit rates

- **Health:** Base health, scaling factors, regeneration rates

- **Speed:** Movement speed, attack speed, animation durations

### **5. UI/UX Systems**

- **Display:** Animation speeds, transition durations, auto-save intervals

- **Interaction:** Click cooldowns, drag thresholds, gesture recognition

- **Performance:** Frame rate targets, memory limits, cache sizes

## 🔄 **Upgrade Integration Patterns**

### **1. Base + Upgrade Pattern**

```typescript

interface BaseConfig {
  baseValue: number;              // Base game value
  // ... other base values
}

interface Upgrades {
  valueBonus: number;             // Upgrade bonus
  valueMultiplier: number;        // Upgrade multiplier
  // ... other upgrade bonuses
}

// Effective value calculation
effectiveValue = (baseValue + valueBonus) * (1 + valueMultiplier);

```javascript

### **2. Difficulty Scaling Pattern**

```typescript

interface DifficultyLevels {
  easy: { multiplier: 0.8, bonus: 0.2 };
  normal: { multiplier: 1.0, bonus: 0.0 };
  hard: { multiplier: 1.2, bonus: -0.1 };
  nightmare: { multiplier: 1.5, bonus: -0.2 };
}

```javascript

### **3. Premium Integration Pattern**

```typescript

interface PremiumUpgrades {
  isActive: boolean;              // Premium status
  bonusMultiplier: number;        // Premium bonus
  convenienceFeatures: string[];  // Premium-only features
}

```javascript

## 🧪 **Testing Requirements**

### **Unit Tests Must Cover:**

- **Base configuration** values work correctly

- **Upgrade application** modifies values as expected

- **Effective value calculation** produces correct results

- **Edge cases** with maximum/minimum upgrades

### **Integration Tests Must Cover:**

- **Upgrade persistence** across sessions

- **Multiple upgrade types** working together

- **Difficulty scaling** affects all parameters

- **Premium features** integrate with base progression

### **E2E Tests Must Cover:**

- **Complete upgrade cycles** from purchase to application

- **Player progression** through upgrade tiers

- **Game balance** with various upgrade combinations

- **Performance** with maximum upgrade levels

## 📋 **Quality Gates**

### **Documentation Review Checklist:**

- [ ] **No hardcoded values** in any technical specifications

- [ ] **All parameters** have base configuration and upgrade paths

- [ ] **Examples show** both base and upgraded scenarios

- [ ] **Upgrade integration** is documented for each system

- [ ] **Future extensibility** is demonstrated through modular design

- [ ] **Testing covers** upgrade scenarios and edge cases

### **Code Review Checklist:**

- [ ] **Configuration objects** define all base values

- [ ] **Upgrade interfaces** modify base values appropriately

- [ ] **Effective value calculations** are clearly implemented

- [ ] **No magic numbers** in production code

- [ ] **Upgrade systems** integrate with existing progression

- [ ] **Performance** remains stable with upgrades applied

## 🚀 **Benefits of This Rule**

### **For Players:**

- **Meaningful progression** through upgradeable systems

- **Customizable experience** based on playstyle and schedule

- **Long-term goals** with upgrade paths for all systems

- **Premium options** for convenience and enhanced experience

### **For Developers:**

- **Easy balancing** through configuration changes

- **Simple feature additions** through upgrade system extensions

- **Difficulty scaling** without code rewrites

- **Future content** can leverage existing upgrade infrastructure

### **For Business:**

- **Monetization opportunities** through premium upgrades

- **Player retention** through meaningful progression systems

- **Content scalability** for future expansions

- **Competitive advantage** through superior customization

---

## 📖 **Summary**

**This rule ensures that Draconia Chronicles is built for the future.** Every system is designed to grow, adapt, and improve over time. Players can customize their experience, developers can balance and expand content easily, and the business can scale through premium features and long-term progression systems.

**No hardcoded values = Infinite possibilities for growth and improvement.**
