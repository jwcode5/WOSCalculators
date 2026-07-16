
/**
 * Core math logic for Chief Gear Calculator.
 * Takes raw inputs from the UI and returns a pure data object with the calculation results.
 */
function calculateChiefGear(inputs) {
  const {
    currentLevels,
    targetLevels,
    materials, // { gearHardenedAlloy, gearPolishingSolution, gearDesignPlans, gearLunarAmber }
    valeriaMult
  } = inputs;

  const costs = calculateGearCost(currentLevels, targetLevels);
  if (!costs) return null;

  const remainingMaterials = {
    hardenedAlloy: materials.gearHardenedAlloy - costs.hardenedAlloy,
    polishingSolution: materials.gearPolishingSolution - costs.polishingSolution,
    designPlans: materials.gearDesignPlans - costs.designPlans,
    lunarAmber: materials.gearLunarAmber - costs.lunarAmber
  };

  // --- Optimized Plan Calculation ---
  function calcOptimizedPlan(curLevels, tgtLevels, availableMats) {
    if (!CHIEF_GEAR_DATA) return null;
    const levelKeyToIndex = {};
    CHIEF_GEAR_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const optimizedLevels = { ...curLevels };
    const resources = { ...availableMats };
    const plan = [];
    let upgradesMade = true;
    while (upgradesMade) {
      upgradesMade = false;
      let bestSlot = null;
      let bestNextIdx = -1;
      let bestCost = null;
      GEAR_SLOTS.forEach(slot => {
        const curIdx = levelKeyToIndex[optimizedLevels[slot] || "none"] || -1;
        const tgtIdx = levelKeyToIndex[tgtLevels[slot] || "none"] || -1;
        if (curIdx < tgtIdx && curIdx < CHIEF_GEAR_DATA.levelOrder.length - 1) {
          const nextLevelKey = CHIEF_GEAR_DATA.levelOrder[curIdx + 1];
          const cost = CHIEF_GEAR_DATA.levels[nextLevelKey];
          if (cost &&
            resources.hardenedAlloy >= (cost.hardenedAlloy || 0) &&
            resources.polishingSolution >= (cost.polishingSolution || 0) &&
            resources.designPlans >= (cost.designPlans || 0) &&
            resources.lunarAmber >= (cost.lunarAmber || 0)
          ) {
            if (curIdx + 1 > bestNextIdx) {
              bestSlot = slot;
              bestNextIdx = curIdx + 1;
              bestCost = cost;
            }
          }
        }
      });
      if (bestSlot) {
        const nextLevelKey = CHIEF_GEAR_DATA.levelOrder[bestNextIdx];
        optimizedLevels[bestSlot] = nextLevelKey;
        resources.hardenedAlloy -= bestCost.hardenedAlloy || 0;
        resources.polishingSolution -= bestCost.polishingSolution || 0;
        resources.designPlans -= bestCost.designPlans || 0;
        resources.lunarAmber -= bestCost.lunarAmber || 0;
        plan.push({ slot: bestSlot, to: nextLevelKey, label: bestCost.label });
        upgradesMade = true;
      } else {
        upgradesMade = false;
      }
    }
    return { optimizedLevels, resources, plan };
  }

  const availableMaterials = {
    hardenedAlloy: materials.gearHardenedAlloy || 0,
    polishingSolution: materials.gearPolishingSolution || 0,
    designPlans: materials.gearDesignPlans || 0,
    lunarAmber: materials.gearLunarAmber || 0
  };
  const optimized = calcOptimizedPlan(currentLevels, targetLevels, availableMaterials);

  // --- SVS Points Calculation ---
  let totalSvsPoints = 0;
  GEAR_SLOTS.forEach(slot => {
    const current = currentLevels[slot] || "none";
    const target = targetLevels[slot] || "none";
    if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder) return;
    const levelOrder = CHIEF_GEAR_DATA.levelOrder;
    const levelKeyToIndex = {};
    levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const currentIdx = levelKeyToIndex[current] || -1;
    const targetIdx = levelKeyToIndex[target] || -1;
    for (let i = currentIdx + 1; i <= targetIdx; i++) {
      const levelKey = levelOrder[i];
      const levelInfo = CHIEF_GEAR_DATA.levels[levelKey];
      if (!levelInfo || levelInfo.isCharm) continue;
      const tier = levelInfo.tier;
      const stars = levelInfo.stars;
      const score = getGearSvsPoints(tier, stars);
      totalSvsPoints += score * 36;
    }
  });
  totalSvsPoints = Math.floor(totalSvsPoints * valeriaMult);

  return {
    costs,
    remainingMaterials,
    optimized,
    totalSvsPoints
  };
}

