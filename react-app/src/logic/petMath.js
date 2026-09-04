import PET_UPGRADES from '../data/petUpgrades.tiered.json';

/**
 * Core math logic for Pet Calculator.
 */
export function calculateMultiPetUpgrade(targets, inventory) {
  const costs = {
    petFood: 0,
    tamingManual: 0,
    energizingPotion: 0,
    strengtheningSerum: 0
  };
  let totalSvsPoints = 0;

  // Track state for smart upgrade
  const curLevels = {};
  const targetLevels = {};
  const optimizedLevels = {};
  const upgradesMap = {};

  targets.forEach(t => {
    const petInfo = PET_UPGRADES.pets[t.name];
    if (!petInfo) return;
    
    let upgrades = [];
    if (petInfo.customUpgrades) {
      upgrades = petInfo.customUpgrades;
    } else if (PET_UPGRADES.tiers[petInfo.tier]) {
      upgrades = PET_UPGRADES.tiers[petInfo.tier].upgrades;
    }
    if (upgrades.length === 0) return;
    upgradesMap[t.name] = upgrades;

    // Find the actual indices for current and target levels
    let startIdx = t.currentLevel === "Not Tamed" ? -1 : upgrades.findIndex(u => String(u.level) === String(t.currentLevel));
    let endIdx = t.targetLevel === "Not Tamed" ? -1 : upgrades.findIndex(u => String(u.level) === String(t.targetLevel));
    
    curLevels[t.name] = startIdx;
    targetLevels[t.name] = endIdx;
    optimizedLevels[t.name] = startIdx; // Start optimized at current

    if (endIdx === -1 || startIdx >= endIdx) return;

    for (let i = startIdx + 1; i <= endIdx; i++) {
      const u = upgrades[i];
      costs.petFood += (u.petFood || 0);
      costs.tamingManual += (u.tamingManual || 0);
      costs.energizingPotion += (u.energizingPotion || 0);
      costs.strengtheningSerum += (u.strengtheningSerum || 0);
    }
  });

  // Calculate Smart Upgrade Plan
  const resources = { ...inventory };
  let upgradesMade = true;
  
  while (upgradesMade) {
    upgradesMade = false;
    let bestPet = null;
    let bestCost = null;
    let bestCostValue = Infinity;

    Object.keys(curLevels).forEach(name => {
      const curIdx = optimizedLevels[name];
      const targetIdx = targetLevels[name];
      const upgrades = upgradesMap[name];

      if (curIdx < targetIdx) {
        const nextIdx = curIdx + 1;
        const u = upgrades[nextIdx];
        
        // Check if we can afford it
        if (
          resources.petFood >= (u.petFood || 0) &&
          resources.tamingManual >= (u.tamingManual || 0) &&
          resources.energizingPotion >= (u.energizingPotion || 0) &&
          resources.strengtheningSerum >= (u.strengtheningSerum || 0)
        ) {
          // Weighting logic (approximate relative value of items)
          const costValue = (u.petFood || 0) + (u.tamingManual || 0) * 10 + (u.energizingPotion || 0) * 50 + (u.strengtheningSerum || 0) * 200;
          if (costValue < bestCostValue) {
            bestPet = name;
            bestCostValue = costValue;
            bestCost = u;
          }
        }
      }
    });

    if (bestPet) {
      optimizedLevels[bestPet]++;
      resources.petFood -= (bestCost.petFood || 0);
      resources.tamingManual -= (bestCost.tamingManual || 0);
      resources.energizingPotion -= (bestCost.energizingPotion || 0);
      resources.strengtheningSerum -= (bestCost.strengtheningSerum || 0);
      totalSvsPoints += (bestCost.svsPoints || 0);
      upgradesMade = true;
    }
  }

  const plan = [];
  Object.keys(curLevels).forEach(name => {
    if (optimizedLevels[name] > curLevels[name]) {
      const finalLevel = upgradesMap[name][optimizedLevels[name]].level;
      plan.push({
        slot: name,
        to: finalLevel,
        label: finalLevel
      });
    }
  });

  return { 
    costs, 
    totalSvsPoints, 
    optimized: { plan, resources } 
  };
}

export function calculatePetSmartUpgrade(currentStates, materials) {
  const used = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };
  
  while (true) {
    let bestPet = null;
    let minCostValue = Infinity;

    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        const costValue = (next.petFood || 0) + (next.tamingManual || 0) * 10 + (next.energizingPotion || 0) * 50 + (next.strengtheningSerum || 0) * 200;
        
        if (costValue < minCostValue &&
            materials.petFood >= (next.petFood || 0) &&
            materials.tamingManual >= (next.tamingManual || 0) &&
            materials.energizingPotion >= (next.energizingPotion || 0) &&
            materials.strengtheningSerum >= (next.strengtheningSerum || 0)) {
          minCostValue = costValue;
          bestPet = state;
        }
      }
    });

    if (bestPet) {
      const next = bestPet.upgrades[bestPet.currentIndex + 1];
      materials.petFood -= (next.petFood || 0);
      materials.tamingManual -= (next.tamingManual || 0);
      materials.energizingPotion -= (next.energizingPotion || 0);
      materials.strengtheningSerum -= (next.strengtheningSerum || 0);

      used.petFood += (next.petFood || 0);
      used.tamingManual += (next.tamingManual || 0);
      used.energizingPotion += (next.energizingPotion || 0);
      used.strengtheningSerum += (next.strengtheningSerum || 0);
      used.svsPoints += (next.svsPoints || 0);

      bestPet.currentIndex++;
    } else {
      break;
    }
  }

  const upgradedPets = currentStates.filter(s => s.currentIndex > s.startIndex);
  const breakdown = upgradedPets.map(s => {
    const subTotal = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };
    for (let i = s.startIndex + 1; i <= s.currentIndex; i++) {
      const u = s.upgrades[i];
      subTotal.petFood += (u.petFood || 0);
      subTotal.tamingManual += (u.tamingManual || 0);
      subTotal.energizingPotion += (u.energizingPotion || 0);
      subTotal.strengtheningSerum += (u.strengtheningSerum || 0);
      subTotal.svsPoints += (u.svsPoints || 0);
    }
    return { name: s.name, startLevel: s.upgrades[s.startIndex].level, endLevel: s.upgrades[s.currentIndex].level, totals: subTotal };
  });

  return { grandTotal: used, petBreakdown: breakdown, upgradedPets };
}

