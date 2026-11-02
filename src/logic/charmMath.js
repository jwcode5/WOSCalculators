import charmData from '../data/chiefCharm.json';

const CHIEF_CHARM_DATA = charmData;
const PIECES = [
  { id: 'hat', label: 'Cap (Lancer)' },
  { id: 'watch', label: 'Watch (Lancer)' },
  { id: 'coat', label: 'Coat (Infantry)' },
  { id: 'pants', label: 'Pants (Infantry)' },
  { id: 'ring', label: 'Ring (Marksman)' },
  { id: 'shortStaff', label: 'Weapon (Marksman)' }
];
const CHARM_SLOT_DEFINITIONS = [];
PIECES.forEach(piece => {
  [1, 2, 3].forEach(num => {
    CHARM_SLOT_DEFINITIONS.push({
      slotKey: `${piece.id}_charm_${num}`,
      label: `${piece.label} Charm ${num}`
    });
  });
});

const SVS_CHARM_SCORES = {
  "1": 625, "2": 1250, "3": 3125, "4": 8750, "5": 2812,
  "6": 3125, "7": 3125, "8": 3250, "9": 3500, "10": 3750, "11": 4000
};

function getSvsPointsForUpgrade(levelKey) {
  const score = SVS_CHARM_SCORES[levelKey] || 0;
  return score * 70;
}

function calculateCharmCost(currentLevels, targetLevels) {
  if (!CHIEF_CHARM_DATA || !CHIEF_CHARM_DATA.levelOrder) return null;
  const levelOrder = CHIEF_CHARM_DATA.levelOrder;
  const levelKeyToIndex = {};
  levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
  
  let totalCharmDesigns = 0;
  let totalCharmGuides = 0;
  let totalJewelSecrets = 0;
  
  CHARM_SLOT_DEFINITIONS.forEach(slotDef => {
    const slot = slotDef.slotKey;
    const currentIdx = levelKeyToIndex[currentLevels[slot] || "none"] || -1;
    const targetIdx = levelKeyToIndex[targetLevels[slot] || "none"] || -1;
    if (targetIdx > currentIdx) {
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const cost = CHIEF_CHARM_DATA.levels[levelOrder[i]];
        if (cost) {
          totalCharmDesigns += cost.charmDesigns || 0;
          totalCharmGuides += cost.charmGuides || 0;
          totalJewelSecrets += cost.jewelSecrets || 0;
        }
      }
    }
  });
  
  return { charmDesigns: totalCharmDesigns, charmGuides: totalCharmGuides, jewelSecrets: totalJewelSecrets };
}

/**
 * Core math logic for Chief Charm Calculator.
 */
export function calculateChiefCharm(inputs) {
  const {
    currentLevels,
    targetLevels,
    materials, // { charmDesigns, charmGuides, jewelSecrets }
    valeriaMult
  } = inputs;

  const costs = calculateCharmCost(currentLevels, targetLevels);
  if (!costs) return null;

  const availableMaterials = {
    charmDesigns: materials.charmDesigns || 0,
    charmGuides: materials.charmGuides || 0,
    jewelSecrets: materials.jewelSecrets || 0
  };

  const remaining = {
    charmDesigns: availableMaterials.charmDesigns - costs.charmDesigns,
    charmGuides: availableMaterials.charmGuides - costs.charmGuides,
    jewelSecrets: availableMaterials.jewelSecrets - costs.jewelSecrets
  };

  // --- Optimized Plan Calculation ---
  function calcOptimizedPlan(curLevels, tgtLevels, availableMats) {
    if (!CHIEF_CHARM_DATA) return null;
    const levelKeyToIndex = {};
    CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const optimizedLevels = { ...curLevels };
    const resources = { ...availableMats };
    
    let upgradesMade = true;
    while (upgradesMade) {
      upgradesMade = false;
      let bestSlot = null;
      let bestNextIdx = Infinity;
      let bestCost = null;
      
      CHARM_SLOT_DEFINITIONS.forEach(slotDef => {
        const slot = slotDef.slotKey;
        const curIdx = levelKeyToIndex[optimizedLevels[slot] || "none"] ?? -1;
        const tgtIdx = levelKeyToIndex[tgtLevels[slot] || "none"] ?? -1;
        
        if (curIdx < tgtIdx && curIdx < CHIEF_CHARM_DATA.levelOrder.length - 1) {
          const nextLevelKey = CHIEF_CHARM_DATA.levelOrder[curIdx + 1];
          const cost = CHIEF_CHARM_DATA.levels[nextLevelKey];
          
          if (cost &&
            resources.charmDesigns >= (cost.charmDesigns || 0) &&
            resources.charmGuides >= (cost.charmGuides || 0) &&
            resources.jewelSecrets >= (cost.jewelSecrets || 0)
          ) {
            // Prioritize the cheapest upgrade (lowest level)
            if (curIdx + 1 < bestNextIdx) {
              bestSlot = slot;
              bestNextIdx = curIdx + 1;
              bestCost = cost;
            }
          }
        }
      });
      
      if (bestSlot) {
        const nextLevelKey = CHIEF_CHARM_DATA.levelOrder[bestNextIdx];
        optimizedLevels[bestSlot] = nextLevelKey;
        resources.charmDesigns -= bestCost.charmDesigns || 0;
        resources.charmGuides -= bestCost.charmGuides || 0;
        resources.jewelSecrets -= bestCost.jewelSecrets || 0;
        upgradesMade = true;
      }
    }

    const plan = [];
    CHARM_SLOT_DEFINITIONS.forEach(slotDef => {
      const slot = slotDef.slotKey;
      if (optimizedLevels[slot] !== curLevels[slot]) {
        const finalLevelKey = optimizedLevels[slot];
        const finalCostObj = CHIEF_CHARM_DATA.levels[finalLevelKey];
        plan.push({ 
          slot: slot, 
          slotLabel: slotDef.label,
          to: finalLevelKey, 
          label: finalCostObj ? finalCostObj.label : finalLevelKey 
        });
      }
    });

    return { optimizedLevels, resources, plan };
  }

  const optimized = calcOptimizedPlan(currentLevels, targetLevels, availableMaterials);

  // --- SVS Points Calculation ---
  // Base on optimized levels!
  let totalSvsPoints = 0;
  CHARM_SLOT_DEFINITIONS.forEach(slotDef => {
    const currentKey = currentLevels[slotDef.slotKey] || "none";
    const targetKey = optimized.optimizedLevels[slotDef.slotKey] || "none";
    const levelKeyToIndex = {};
    if (CHIEF_CHARM_DATA && CHIEF_CHARM_DATA.levelOrder) {
      CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
      const currentIdx = levelKeyToIndex[currentKey] || -1;
      const targetIdx = levelKeyToIndex[targetKey] || -1;
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const levelKey = CHIEF_CHARM_DATA.levelOrder[i];
        totalSvsPoints += getSvsPointsForUpgrade(levelKey);
      }
    }
  });
  totalSvsPoints = Math.floor(totalSvsPoints * valeriaMult);

  return {
    costs,
    remaining,
    optimized,
    totalSvsPoints
  };
}

