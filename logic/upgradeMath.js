
/**
 * Core math logic for Building Upgrades.
 * Takes raw inputs from the UI and returns a pure data object with the calculation results.
 */
function calculateBuildingUpgrade(inputs) {
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

