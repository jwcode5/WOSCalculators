import buildingData from '../data/buildings.json';

// In the vanilla app these were global vars set from script.js.
// In React we derive them directly from the imported JSON.
const BUILDING_COSTS = buildingData.buildings || buildingData;

// Sort level keys correctly: numeric first (1,2,...30), then suffixed (30a, 30b...)
function compareLevelKeys(a, b) {
  const parseKey = (k) => {
    const m = String(k).match(/^(\d+)([a-z]?)$/i);
    return m ? { num: parseInt(m[1], 10), suf: m[2] || '', raw: String(k) } : { num: Infinity, suf: '', raw: String(k) };
  };
  const pa = parseKey(a);
  const pb = parseKey(b);
  if (pa.num !== pb.num) return pa.num - pb.num;
  return pa.suf.localeCompare(pb.suf);
}

import prereqData from '../data/prerequisites.json';

const PREREQUISITES = prereqData.prerequisites || prereqData;

export function getBuildingLevelOrder(buildingName) {
  if (!BUILDING_COSTS || !BUILDING_COSTS[buildingName]) return [];
  return Object.keys(BUILDING_COSTS[buildingName]).sort(compareLevelKeys);
}

export function getUpgradePathKeys(buildingName, currentLevelKey, targetLevelKey) {
  const levels = getBuildingLevelOrder(buildingName);
  if (!levels.length) return [];
  const curKey = String(currentLevelKey || levels[0]);
  const tgtKey = String(targetLevelKey || levels[0]);
  const currentIdx = Math.max(0, levels.indexOf(curKey));
  const targetIdx = levels.indexOf(tgtKey);
  if (targetIdx < 0 || currentIdx >= targetIdx) return [];
  return levels.slice(currentIdx + 1, targetIdx + 1);
}

export function getHigherRequiredLevel(buildingName, left, right) {
  if (!left) return right;
  if (!right) return left;

  const levels = getBuildingLevelOrder(buildingName);
  if (levels.length) {
    const li = levels.indexOf(String(left));
    const ri = levels.indexOf(String(right));
    if (li >= 0 && ri >= 0) return ri > li ? String(right) : String(left);
  }

  const leftNumeric = Number(String(left));
  const rightNumeric = Number(String(right));
  if (!Number.isNaN(leftNumeric) && !Number.isNaN(rightNumeric)) {
    return rightNumeric > leftNumeric ? String(right) : String(left);
  }

  return left; // Default fallback
}

export function getAggregatedPrerequisites(selectedBuilding, currentLevelKey, targetLevelKey) {
  const result = new Map();
  if (!PREREQUISITES || !PREREQUISITES[selectedBuilding]) return result;

  const ruleSet = PREREQUISITES[selectedBuilding];
  const upgradeKeys = getUpgradePathKeys(selectedBuilding, currentLevelKey, targetLevelKey);

  for (const levelKey of upgradeKeys) {
    const levelReqs = (ruleSet.fcLevels && ruleSet.fcLevels[levelKey])
      || (ruleSet.levels && ruleSet.levels[levelKey])
      || [];

    for (const req of levelReqs) {
      const building = req.building;
      const requiredLevel = req.tier ? String(req.tier) : String(req.level || 1);
      const prev = result.get(building);
      result.set(building, getHigherRequiredLevel(building, prev, requiredLevel));
    }
  }

  if (result.size) return result;

  if (ruleSet.levels || ruleSet.fcLevels) return result;

  const legacyRules = Array.isArray(ruleSet) ? ruleSet : (ruleSet.legacy || []);
  const targetNumeric = parseInt(String(targetLevelKey || ''), 10);
  if (Number.isNaN(targetNumeric)) return result;

  for (const req of legacyRules) {
    const building = req.building;
    const requiredLevel = String(Math.max(1, targetNumeric + Number(req.levelOffset || 0)));
    const prev = result.get(building);
    result.set(building, getHigherRequiredLevel(building, prev, requiredLevel));
  }

  return result;
}

/**
 * Core math logic for Building Upgrades.
 * Takes raw inputs from the UI and returns a pure data object with the calculation results.
 */
export function calculateBuildingUpgrade(inputs) {
  const {
    buildingsToCalc, // Array of { building, currentLevel, targetLevel }
    backpack,        // { meat, wood, coal, iron, fireCrystals, refinedFireCrystals }
    bearHuntTotals,  // { meat, wood, coal, iron }
    buffs,           // { constructionSpeedPct, hyenaBuffPct, zinmanResourceDiscountPct, agnusProjectManagementHours, doubleTimePct, castleBuffPct, positionBuffPct }
    speedups,        // { generalMinutes, constructionMinutes }
    useCustomChests, // boolean
    chestCounts,     // Object from getCustomChestCounts()
    valeriaMult      // from getValeriaBonusMultiplier()
  } = inputs;

  let baseTotalWood = 0, baseTotalMeat = 0, baseTotalCoal = 0, baseTotalIron = 0;
  let totalWood = 0, totalMeat = 0, totalCoal = 0, totalIron = 0;
  let totalFireCrystals = 0, totalRefinedFireCrystals = 0;
  let totalSeconds = 0;
  let agnusAppliedUpgradeCount = 0;

  const clampedZinmanResourceDiscountPct = Math.max(0, Math.min(100, buffs.zinmanResourceDiscountPct));
  const zinmanResourceMultiplier = 1 - (clampedZinmanResourceDiscountPct / 100);
  const agnusProjectManagementSeconds = Math.max(0, Math.floor(buffs.agnusProjectManagementHours * 3600));

  const buildingsCalculated = [];

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    let baseBuildingWood = 0, baseBuildingMeat = 0, baseBuildingCoal = 0, baseBuildingIron = 0;
    let buildingWood = 0, buildingMeat = 0, buildingCoal = 0, buildingIron = 0;
    let buildingFireCrystals = 0, buildingRefinedFireCrystals = 0;

    if (!BUILDING_COSTS[building]) continue;

    const upgradePath = getUpgradePathKeys(building, curLvl, tgtLvl);
    let buildingBaseSeconds = 0;

    for (const level of upgradePath) {
      const levelData = BUILDING_COSTS[building][level];
      if (!levelData) continue;

      agnusAppliedUpgradeCount += 1;

      const levelWood = levelData.wood || 0;
      const levelMeat = levelData.meat || 0;
      const levelCoal = levelData.coal || 0;
      const levelIron = levelData.iron || 0;
      const levelFireCrystals = levelData.fireCrystals || 0;
      const levelRefinedFireCrystals = levelData.refinedFireCrystals || 0;

      baseBuildingWood += levelWood;
      baseBuildingMeat += levelMeat;
      baseBuildingCoal += levelCoal;
      baseBuildingIron += levelIron;
      buildingWood += levelWood;
      buildingMeat += levelMeat;
      buildingCoal += levelCoal;
      buildingIron += levelIron;
      buildingFireCrystals += levelFireCrystals;
      buildingRefinedFireCrystals += levelRefinedFireCrystals;
      buildingBaseSeconds += levelData.seconds || 0;
    }

    totalSeconds += buildingBaseSeconds;

    buildingWood = Math.floor(buildingWood * zinmanResourceMultiplier);
    buildingMeat = Math.floor(buildingMeat * zinmanResourceMultiplier);
    buildingCoal = Math.floor(buildingCoal * zinmanResourceMultiplier);
    buildingIron = Math.floor(buildingIron * zinmanResourceMultiplier);

    baseTotalWood += baseBuildingWood;
    baseTotalMeat += baseBuildingMeat;
    baseTotalCoal += baseBuildingCoal;
    baseTotalIron += baseBuildingIron;
    totalWood += buildingWood;
    totalMeat += buildingMeat;
    totalCoal += buildingCoal;
    totalIron += buildingIron;
    totalFireCrystals += buildingFireCrystals;
    totalRefinedFireCrystals += buildingRefinedFireCrystals;

    // Optional stat changes
    const currentData = BUILDING_COSTS[building][curLvl] || {};
    const targetData  = BUILDING_COSTS[building][tgtLvl] || {};
    
    buildingsCalculated.push({
      building,
      currentLevel: curLvl,
      targetLevel: tgtLvl,
      costs: {
        wood: buildingWood,
        meat: buildingMeat,
        coal: buildingCoal,
        iron: buildingIron,
        fireCrystals: buildingFireCrystals,
        refinedFireCrystals: buildingRefinedFireCrystals
      },
      stats: {
        rallyFrom: currentData.rallyCapacity,
        rallyTo: targetData.rallyCapacity,
        deployFrom: currentData.troopDeploymentCapacity,
        deployTo: targetData.troopDeploymentCapacity,
        storageFrom: currentData.storageCapacity,
        storageTo: targetData.storageCapacity
      }
    });
  }

  const effectiveMeatBackpack = backpack.meat + bearHuntTotals.meat;
  const effectiveWoodBackpack = backpack.wood + bearHuntTotals.wood;
  const effectiveCoalBackpack = backpack.coal + bearHuntTotals.coal;
  const effectiveIronBackpack = backpack.iron + bearHuntTotals.iron;

  const woodRemaining = effectiveWoodBackpack - totalWood;
  const meatRemaining = effectiveMeatBackpack - totalMeat;
  const coalRemaining = effectiveCoalBackpack - totalCoal;
  const ironRemaining = effectiveIronBackpack - totalIron;
  const fireCrystalsRemaining = backpack.fireCrystals - totalFireCrystals;
  const refinedFireCrystalsRemaining = backpack.refinedFireCrystals - totalRefinedFireCrystals;

  // Time calculations
  const additiveSpeedPct = Math.max(0, buffs.constructionSpeedPct + buffs.hyenaBuffPct + buffs.castleBuffPct + buffs.positionBuffPct);
  const additiveAdjustedSeconds = Math.floor(totalSeconds / (1 + (additiveSpeedPct / 100)));
  const additiveTimeSavedSeconds = Math.max(0, totalSeconds - additiveAdjustedSeconds);

  const clampedDoubleTimePct = Math.max(0, Math.min(100, buffs.doubleTimePct));
  const doubleTimeAdjustedSeconds = Math.floor(additiveAdjustedSeconds * (1 - (clampedDoubleTimePct / 100)));
  const doubleTimeSavedSeconds = Math.max(0, additiveAdjustedSeconds - doubleTimeAdjustedSeconds);

  const totalAgnusReductionSeconds = agnusProjectManagementSeconds * agnusAppliedUpgradeCount;
  const agnusAdjustedSeconds = Math.max(0, doubleTimeAdjustedSeconds - totalAgnusReductionSeconds);
  const agnusTimeSavedSeconds = Math.max(0, doubleTimeAdjustedSeconds - agnusAdjustedSeconds);

  const totalSpeedupSeconds = (speedups.generalMinutes + speedups.constructionMinutes) * 60;
  const remainingTimeSeconds = Math.max(0, agnusAdjustedSeconds - totalSpeedupSeconds);
  const speedupSurplusSeconds = Math.max(0, totalSpeedupSeconds - agnusAdjustedSeconds);

  // Chest calculations
  const basicDeficits = {
    meat: Math.max(0, totalMeat - effectiveMeatBackpack),
    wood: Math.max(0, totalWood - effectiveWoodBackpack),
    coal: Math.max(0, totalCoal - effectiveCoalBackpack),
    iron: Math.max(0, totalIron - effectiveIronBackpack)
  };

  const chestPlan = useCustomChests ? recommendCustomChestUsage(basicDeficits, chestCounts) : null;

  const postChestRemaining = {
    meat: meatRemaining + (chestPlan ? chestPlan.provided.meat : 0),
    wood: woodRemaining + (chestPlan ? chestPlan.provided.wood : 0),
    coal: coalRemaining + (chestPlan ? chestPlan.provided.coal : 0),
    iron: ironRemaining + (chestPlan ? chestPlan.provided.iron : 0)
  };

  // SVS calculations
  const svsBasePointsItems = totalFireCrystals * 2000;
  const svsSpeedupMins = Math.ceil(agnusAdjustedSeconds / 60);
  const svsBasePointsSpeedups = svsSpeedupMins * 30;
  const svsBaseTotal = svsBasePointsItems + svsBasePointsSpeedups;
  const svsValeriaBonus = Math.floor(svsBaseTotal * (valeriaMult - 1.0));
  const svsGrandTotal = svsBaseTotal + svsValeriaBonus;

  return {
    buildingsCalculated,
    totals: {
      wood: totalWood,
      meat: totalMeat,
      coal: totalCoal,
      iron: totalIron,
      fireCrystals: totalFireCrystals,
      refinedFireCrystals: totalRefinedFireCrystals,
      baseWood: baseTotalWood,
      baseMeat: baseTotalMeat,
      baseCoal: baseTotalCoal,
      baseIron: baseTotalIron
    },
    time: {
      baseSeconds: totalSeconds,
      additiveSpeedPct,
      additiveAdjustedSeconds,
      additiveTimeSavedSeconds,
      doubleTimePct: clampedDoubleTimePct,
      doubleTimeAdjustedSeconds,
      doubleTimeSavedSeconds,
      agnusAdjustedSeconds,
      agnusTimeSavedSeconds,
      totalSpeedupSeconds,
      remainingTimeSeconds,
      speedupSurplusSeconds
    },
    remaining: {
      meat: meatRemaining,
      wood: woodRemaining,
      coal: coalRemaining,
      iron: ironRemaining,
      fireCrystals: fireCrystalsRemaining,
      refinedFireCrystals: refinedFireCrystalsRemaining,
      postChest: postChestRemaining
    },
    chestPlan,
    svs: {
      baseItems: svsBasePointsItems,
      baseSpeedups: svsBasePointsSpeedups,
      baseTotal: svsBaseTotal,
      valeriaBonus: svsValeriaBonus,
      grandTotal: svsGrandTotal
    }
  };
}

function recommendCustomChestUsage(deficits, chestCounts) {
  // Define the resources provided per chest tier
  const CHEST_VALUES = {
    1: { meat: 10000, wood: 10000, coal: 2000, iron: 500 },
    2: { meat: 100000, wood: 100000, coal: 20000, iron: 5000 },
    3: { meat: 1000000, wood: 1000000, coal: 200000, iron: 50000 }
  };

  // Clone deficits so we can mutate them during calculation
  let remainingDeficits = { ...deficits };
  let provided = { meat: 0, wood: 0, coal: 0, iron: 0 };
  let used = {
    unsecuredLv1: 0, unsecuredLv2: 0, unsecuredLv3: 0,
    securedLv1: 0, securedLv2: 0, securedLv3: 0
  };

  // Helper to process a specific chest type
  const processChest = (chestKey, level) => {
    let availableCount = chestCounts[chestKey] || 0;
    if (availableCount <= 0) return;

    const values = CHEST_VALUES[level];
    
    // We only pop chests if we have ANY deficit
    while (availableCount > 0 && (remainingDeficits.meat > 0 || remainingDeficits.wood > 0 || remainingDeficits.coal > 0 || remainingDeficits.iron > 0)) {
      
      // Determine which resource has the biggest relative deficit
      // (This is a simplified strategy. Usually players pick iron first, then coal, etc.)
      // We will prioritize Iron > Coal > Wood > Meat
      let chosenResource = 'meat';
      if (remainingDeficits.iron > 0) chosenResource = 'iron';
      else if (remainingDeficits.coal > 0) chosenResource = 'coal';
      else if (remainingDeficits.wood > 0) chosenResource = 'wood';

      // Pop one chest for the chosen resource
      const amountGained = values[chosenResource];
      
      provided[chosenResource] += amountGained;
      remainingDeficits[chosenResource] = Math.max(0, remainingDeficits[chosenResource] - amountGained);
      
      used[chestKey]++;
      availableCount--;
    }
  };

  // Strategy: Use the largest chests first to cover huge deficits, 
  // then smaller ones for precision. 
  // Prioritize Unsecured over Secured (because secured can't be looted).
  processChest('unsecuredLv3', 3);
  processChest('securedLv3', 3);
  processChest('unsecuredLv2', 2);
  processChest('securedLv2', 2);
  processChest('unsecuredLv1', 1);
  processChest('securedLv1', 1);

  return { used, provided };
}

