
/**
 * Core math logic for Chief Charm Calculator.
 * Takes raw inputs from the UI and returns a pure data object with the calculation results.
 */
function calculateChiefCharm(inputs) {
  const {
    currentLevels,
    targetLevels,
    materials, // { charmDesigns, charmGuides, jewelSecrets }
    valeriaMult
  } = inputs;

  const costs = calculateCharmCost(currentLevels, targetLevels);
  if (!costs) return null;

  const remaining = {
    charmDesigns: materials.charmDesigns - costs.charmDesigns,
    charmGuides: materials.charmGuides - costs.charmGuides,
    jewelSecrets: materials.jewelSecrets - costs.jewelSecrets
  };

  // --- SVS Points Calculation ---
  let totalSvsPoints = 0;
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentKey = currentLevels[slot.slotKey] || "none";
    const targetKey = targetLevels[slot.slotKey] || "none";
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

  // --- Optimized Plan Calculation ---
  const optimized = calculateCharmOptimizedPlan(currentLevels, targetLevels, materials);

  return {
    costs,
    remaining,
    optimized,
    totalSvsPoints
  };
}

