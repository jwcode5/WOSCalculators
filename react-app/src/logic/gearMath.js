import gearData from '../data/chiefGear.json';

const CHIEF_GEAR_DATA = gearData;
const GEAR_SLOTS = ['hat', 'watch', 'coat', 'pants', 'ring', 'shortStaff'];

function calculateGearCost(currentLevels, targetLevels) {
  if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder) return null;
  const levelOrder = CHIEF_GEAR_DATA.levelOrder;
  const levelKeyToIndex = {};
  levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
  
  let totalHardenedAlloy = 0;
  let totalPolishingSolution = 0;
  let totalDesignPlans = 0;
  let totalLunarAmber = 0;
  
  GEAR_SLOTS.forEach(slot => {
    const currentIdx = levelKeyToIndex[currentLevels[slot] || "none"] || -1;
    const targetIdx = levelKeyToIndex[targetLevels[slot] || "none"] || -1;
    if (targetIdx > currentIdx) {
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const cost = CHIEF_GEAR_DATA.levels[levelOrder[i]];
        if (cost) {
          totalHardenedAlloy += cost.hardenedAlloy || 0;
          totalPolishingSolution += cost.polishingSolution || 0;
          totalDesignPlans += cost.designPlans || 0;
          totalLunarAmber += cost.lunarAmber || 0;
        }
      }
    }
  });
  
  return { hardenedAlloy: totalHardenedAlloy, polishingSolution: totalPolishingSolution, designPlans: totalDesignPlans, lunarAmber: totalLunarAmber };
}

const SVS_GEAR_SCORES = {
  "green_0": 1125, "green_1": 1875,
  "blue_0": 300, "blue_1": 4500, "blue_2": 5100, "blue_3": 5440,
  "purple_0": 3230, "purple_1": 3230, "purple_2": 3225, "purple_3": 3225,
  "purple_t1_0": 3440, "purple_t1_1": 3440, "purple_t1_2": 4085, "purple_t1_3": 4085,
  "gold_0": 6250, "gold_1": 6250, "gold_2": 6250, "gold_3": 6250,
  "gold_t1_0": 6250, "gold_t1_1": 6250, "gold_t1_2": 6250, "gold_t1_3": 6250,
  "gold_t2_0": 6250, "gold_t2_1": 6250, "gold_t2_2": 6250, "gold_t2_3": 6250
};

function getGearSvsPoints(levelKey) {
  return SVS_GEAR_SCORES[levelKey] || 0;
}

/**
 * Core math logic for Chief Gear Calculator.
 * Takes raw inputs from the UI and returns a pure data object with the calculation results.
 */
export function calculateChiefGear(inputs) {
  const {
    currentLevels,
    targetLevels,
    materials, // { gearHardenedAlloy, gearPolishingSolution, gearDesignPlans, gearLunarAmber }
    valeriaMult
  } = inputs;

  const costs = calculateGearCost(currentLevels, targetLevels);
  if (!costs) return null;

  const remainingMaterials = {
    hardenedAlloy: (materials.hardenedAlloy || 0) - costs.hardenedAlloy,
    polishingSolution: (materials.polishingSolution || 0) - costs.polishingSolution,
    designPlans: (materials.designPlans || 0) - costs.designPlans,
    lunarAmber: (materials.lunarAmber || 0) - costs.lunarAmber
  };

  // --- Optimized Plan Calculation ---
  function calcOptimizedPlan(curLevels, tgtLevels, availableMats) {
    if (!CHIEF_GEAR_DATA) return null;
    const levelKeyToIndex = {};
    CHIEF_GEAR_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const optimizedLevels = { ...curLevels };
    const resources = { ...availableMats };
    
    let upgradesMade = true;
    while (upgradesMade) {
      upgradesMade = false;
      let bestSlot = null;
      let bestNextIdx = Infinity;
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
            // Prioritize the cheapest upgrade (lowest level) for most efficient material use
            if (curIdx + 1 < bestNextIdx) {
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
        upgradesMade = true;
      }
    }

    // Condense the plan: 1 line per item showing its final highest level
    const plan = [];
    GEAR_SLOTS.forEach(slot => {
      if (optimizedLevels[slot] !== curLevels[slot]) {
        const finalLevelKey = optimizedLevels[slot];
        const finalCostObj = CHIEF_GEAR_DATA.levels[finalLevelKey];
        plan.push({ 
          slot: slot, 
          to: finalLevelKey, 
          label: finalCostObj ? finalCostObj.label : finalLevelKey 
        });
      }
    });

    return { optimizedLevels, resources, plan };
  }

  const availableMaterials = {
    hardenedAlloy: materials.hardenedAlloy || 0,
    polishingSolution: materials.polishingSolution || 0,
    designPlans: materials.designPlans || 0,
    lunarAmber: materials.lunarAmber || 0
  };
  const optimized = calcOptimizedPlan(currentLevels, targetLevels, availableMaterials);

  // --- SVS Points Calculation ---
  let totalSvsPoints = 0;
  GEAR_SLOTS.forEach(slot => {
    const current = currentLevels[slot] || "none";
    const target = optimized.optimizedLevels[slot] || "none";
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
      const score = getGearSvsPoints(levelKey);
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

