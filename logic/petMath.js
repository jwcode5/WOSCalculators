
/**
 * Core math logic for Pet Calculator.
 */
function calculateMultiPetUpgrade(targets) {
  const grandTotal = {
    petFood: 0,
    tamingManual: 0,
    energizingPotion: 0,
    strengtheningSerum: 0,
    svsPoints: 0
  };
  const petBreakdown = [];

  targets.forEach(t => {
    const petData = PET_UPGRADES.pets[t.name];
    let upgrades = [];
    if (petData.customUpgrades) {
      upgrades = petData.customUpgrades;
    } else if (PET_UPGRADES.tiers[petData.tier]) {
      upgrades = PET_UPGRADES.tiers[petData.tier].upgrades;
    }

    const subTotal = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };
    for (let i = t.startIdx + 1; i <= t.endIdx; i++) {
      const u = upgrades[i];
      subTotal.petFood += (u.petFood || 0);
      subTotal.tamingManual += (u.tamingManual || 0);
      subTotal.energizingPotion += (u.energizingPotion || 0);
      subTotal.strengtheningSerum += (u.strengtheningSerum || 0);
      subTotal.svsPoints += (u.svsPoints || 0);
    }

    grandTotal.petFood += subTotal.petFood;
    grandTotal.tamingManual += subTotal.tamingManual;
    grandTotal.energizingPotion += subTotal.energizingPotion;
    grandTotal.strengtheningSerum += subTotal.strengtheningSerum;
    grandTotal.svsPoints += subTotal.svsPoints;

    petBreakdown.push({
      name: t.name,
      startLevel: upgrades[t.startIdx].level,
      endLevel: upgrades[t.endIdx].level,
      totals: subTotal
    });
  });

  return { grandTotal, petBreakdown };
}

function calculatePetSmartUpgrade(currentStates, materials) {
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

