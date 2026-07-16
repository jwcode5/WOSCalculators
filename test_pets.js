const PET_UPGRADES = {
  tiers: {
    N: {
      upgrades: [
        { level: 1, petFood: 0 },
        { level: 2, petFood: 500 },
        { level: 3, petFood: 600 },
        { level: 4, petFood: 700 }
      ]
    }
  },
  pets: {
    "Dog": { tier: "N" },
    "Cat": { tier: "N" }
  }
};
const PET_ORDER = ["Dog", "Cat"];

function calculatePetsOptimizedPlan() {
  const materials = {
    petFood: 1000,
    tamingManual: 0,
    energizingPotion: 0,
    strengtheningSerum: 0
  };

  const currentStates = [
    { name: "Dog", upgrades: PET_UPGRADES.tiers.N.upgrades, startIndex: 0, currentIndex: 0 },
    { name: "Cat", upgrades: PET_UPGRADES.tiers.N.upgrades, startIndex: 0, currentIndex: 0 }
  ];

  const used = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };

  while (true) {
    let bestPet = null;
    let minCostValue = Infinity;
    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        const costValue = (next.petFood || 0) + (next.tamingManual || 0) * 10 + (next.energizingPotion || 0) * 50 + (next.strengtheningSerum || 0) * 200;
        if (costValue < minCostValue &&
            materials.petFood >= (next.petFood || 0) && materials.tamingManual >= (next.tamingManual || 0) &&
            materials.energizingPotion >= (next.energizingPotion || 0) && materials.strengtheningSerum >= (next.strengtheningSerum || 0)) {
          minCostValue = costValue; bestPet = state;
        }
      }
    });

    if (bestPet) {
      const next = bestPet.upgrades[bestPet.currentIndex + 1];
      materials.petFood -= (next.petFood || 0); materials.tamingManual -= (next.tamingManual || 0);
      materials.energizingPotion -= (next.energizingPotion || 0); materials.strengtheningSerum -= (next.strengtheningSerum || 0);
      used.petFood += (next.petFood || 0); used.tamingManual += (next.tamingManual || 0);
      used.energizingPotion += (next.energizingPotion || 0); used.strengtheningSerum += (next.strengtheningSerum || 0);
      used.svsPoints += (next.svsPoints || 0);
      bestPet.currentIndex++;
    } else {
      break;
    }
  }

  const upgradedPets = currentStates.filter(s => s.currentIndex > s.startIndex);
  if (upgradedPets.length > 0) {
    const breakdown = upgradedPets.map(s => {
      const subTotal = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };
      for (let i = s.startIndex + 1; i <= s.currentIndex; i++) {
        const u = s.upgrades[i];
        subTotal.petFood += (u.petFood || 0);
      }
      return { name: s.name, startLevel: s.upgrades[s.startIndex].level, endLevel: s.upgrades[s.currentIndex].level, totals: subTotal };
    });
    return { grandTotal: used, petBreakdown: breakdown };
  }
  return null;
}

console.log(JSON.stringify(calculatePetsOptimizedPlan(), null, 2));
