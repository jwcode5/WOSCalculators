function onUpgradeCalculateClick() {
  // Guard: bail out if data hasn't loaded yet
  if (!BUILDING_COSTS || !PREREQUISITES) {
    alert(translateText("alerts.dataStillLoading", {}, "Data is still loading. Please wait and try again."));
    return;
  }

  const targetBuilding = document.getElementById("targetBuilding").value;
  const currentLevel = document.getElementById("currentLevel").value;
  const targetLevel = document.getElementById("targetLevel").value;

  // Validate that current â‰¤ target
  const selectedBuildingLevels = getBuildingLevelOrder(targetBuilding);
  const currentIdx = selectedBuildingLevels.indexOf(currentLevel);
  const targetIdx = selectedBuildingLevels.indexOf(targetLevel);
  if (currentIdx < 0 || targetIdx < 0 || currentIdx > targetIdx) {
    alert(translateText("alerts.currentExceedsTarget", {}, "Please ensure current level does not exceed target level."));
    return;
  }

  const validationError = getCalculationValidationError();
  if (validationError) {
    alert(validationError);
    return;
  }

  // Get backpack resources
  // --- Read backpack resources ---
  // parseResourceAmount handles "953.14M", "2.5K", plain numbers, etc.
  const woodBackpack = parseResourceAmount(document.getElementById("ownedWood").value);
  const meatBackpack = parseResourceAmount(document.getElementById("ownedMeat").value);
  const coalBackpack = parseResourceAmount(document.getElementById("ownedCoal").value);
  const ironBackpack = parseResourceAmount(document.getElementById("ownedIron").value);

  // Bear Hunt Mail resources are added to the effective backpack so they
  // count toward covering upgrade costs
  const bearHuntTotals = getBearHuntResourceTotals();
  const effectiveMeatBackpack = meatBackpack + bearHuntTotals.meat;
  const effectiveWoodBackpack = woodBackpack + bearHuntTotals.wood;
  const effectiveCoalBackpack = coalBackpack + bearHuntTotals.coal;
  const effectiveIronBackpack = ironBackpack + bearHuntTotals.iron;

  const fireCrystalsBackpack = parseResourceAmount(document.getElementById("ownedFireCrystals").value);
  const refinedFireCrystalsBackpack = parseResourceAmount(document.getElementById("ownedRefinedFireCrystals").value);
  // --- Read speedup and buff inputs ---
  const generalSpeedupsMinutes      = parseInt(document.getElementById("generalSpeedups").value) || 0;
  const constructionSpeedupsMinutes = parseInt(document.getElementById("constructionSpeedups").value) || 0;
  const constructionSpeedPct = parseFloat(document.getElementById("constructionSpeedPct").value) || 0;
  const hyenaBuffPct = parseFloat(document.getElementById("hyenaBuffPct").value) || 0;
  const zinmanResourceDiscountPct = parseFloat(document.getElementById("zinmanBastionistPct").value) || 0;
  const agnusProjectManagementHours = parseFloat(document.getElementById("agnusProjectManagementHours").value) || 0;
  const doubleTimePct = document.getElementById("doubleTimeEnabled").checked ? 20 : 0;
  const castleBuffPct = document.getElementById("castleBuffEnabled").checked ? 10 : 0;
  const positionBuffPct = parseFloat(document.getElementById("positionBuffPct").value) || 0;
  const clampedZinmanResourceDiscountPct = Math.max(0, Math.min(100, zinmanResourceDiscountPct));
  const agnusProjectManagementSeconds = Math.max(0, Math.floor(agnusProjectManagementHours * 3600));
  const zinmanResourceMultiplier = 1 - (clampedZinmanResourceDiscountPct / 100);

  // --- Build list of buildings to calculate ---
  // Start with the main target building
  const buildingsToCalc = [{ building: targetBuilding, currentLevel, targetLevel }];

  // Add all prerequisites
  const prereqMap = getAggregatedPrerequisites(targetBuilding, currentLevel, targetLevel);
  for (const [buildingName, requiredLevel] of prereqMap.entries()) {
    if (!BUILDING_COSTS[buildingName]) continue;

    const currentInput = document.getElementById(`${buildingName}CurrentLevel`);
    const input = document.getElementById(`${buildingName}Level`);
    const prereqLevels = getBuildingLevelOrder(buildingName);
    const prereqCurrentLevel = currentInput ? String(currentInput.value) : prereqLevels[0];
    const requiredLevelKey = String(requiredLevel);
    const prereqTargetLevel = input
      ? String(input.value)
      : (prereqLevels.includes(requiredLevelKey) ? requiredLevelKey : prereqLevels[prereqLevels.length - 1]);

    // Make sure target isn't below current for prerequisites too
    const prereqCurrentIdx = prereqLevels.indexOf(prereqCurrentLevel);
    const prereqTargetIdx = prereqLevels.indexOf(prereqTargetLevel);
    const safePrereqTarget = (prereqTargetIdx >= prereqCurrentIdx && prereqTargetIdx >= 0)
      ? prereqTargetLevel
      : prereqCurrentLevel;

    buildingsToCalc.push({
      building: buildingName,
      currentLevel: prereqCurrentLevel,
      targetLevel: safePrereqTarget
    });
  }

  // Add optional buildings (only if target is actually above current)
  for (const optionalItem of optionalBuildings) {
    const optBuildingLevels = getBuildingLevelOrder(optionalItem.building);
    const optCurIdx = optBuildingLevels.indexOf(optionalItem.currentLevel);
    const optTgtIdx = optBuildingLevels.indexOf(optionalItem.targetLevel);
    
    if (optCurIdx >= 0 && optTgtIdx >= 0 && optCurIdx < optTgtIdx) {
      buildingsToCalc.push({
        building: optionalItem.building,
        currentLevel: optionalItem.currentLevel,
        targetLevel: optionalItem.targetLevel
      });
    }
  }

  // Calculate total cost across all buildings
  // --- Sum costs across all buildings ---
  let baseTotalWood = 0, baseTotalMeat = 0, baseTotalCoal = 0, baseTotalIron = 0;
  let totalWood = 0, totalMeat = 0, totalCoal = 0, totalIron = 0;
  let totalFireCrystals = 0, totalRefinedFireCrystals = 0;
  let totalSeconds = 0;
  let agnusAppliedUpgradeCount = 0;
  let resultsHTML = "";

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    let baseBuildingWood = 0, baseBuildingMeat = 0, baseBuildingCoal = 0, baseBuildingIron = 0;
    let buildingWood = 0, buildingMeat = 0, buildingCoal = 0, buildingIron = 0;
    let buildingFireCrystals = 0, buildingRefinedFireCrystals = 0;

    if (!BUILDING_COSTS[building]) continue;

    // Walk every level in this building's upgrade path and add its costs
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

    // Look up optional stat changes (rally, troop deployment, storage)
    const currentData = BUILDING_COSTS[building][curLvl] || {};
    const targetData  = BUILDING_COSTS[building][tgtLvl] || {};
    const rallyFrom = currentData.rallyCapacity;
    const rallyTo = targetData.rallyCapacity;
    const deployFrom = currentData.troopDeploymentCapacity;
    const deployTo = targetData.troopDeploymentCapacity;
    const storageFrom = currentData.storageCapacity;
    const storageTo = targetData.storageCapacity;
    const extraStatLines = [];

    if (typeof rallyFrom === "number" && typeof rallyTo === "number") {
      extraStatLines.push(`${translateText("results.rallyCapacity", {}, "Rally Capacity")}: ${rallyFrom.toLocaleString()} -> ${rallyTo.toLocaleString()}`);
    }

    if (typeof deployFrom === "number" && typeof deployTo === "number") {
      extraStatLines.push(`${translateText("results.troopDeploymentCapacity", {}, "Troop Deployment Capacity")}: ${deployFrom.toLocaleString()} -> ${deployTo.toLocaleString()}`);
    }

    if (typeof storageFrom === "number" && typeof storageTo === "number") {
      extraStatLines.push(`${translateText("results.storageCapacity", {}, "Storage Capacity")}: ${storageFrom.toLocaleString()} -> ${storageTo.toLocaleString()}`);
    }

    const extraStatsHtml = extraStatLines.length
      ? `<br>${extraStatLines.join("<br>")}`
      : "";
    const crystalCostsHtml = (buildingFireCrystals > 0 || buildingRefinedFireCrystals > 0)
      ? `<br>${translateText("labels.fireCrystals", {}, "Fire Crystals")}: ${buildingFireCrystals.toLocaleString()} | ${translateText("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ${buildingRefinedFireCrystals.toLocaleString()}`
      : "";

    // Display results for this building
    const buildingDisplay = escapeHtml(getBuildingDisplayName(building).toUpperCase());
    const meatLabel = escapeHtml(translateText("labels.meat", {}, "Meat"));
    const woodLabel = escapeHtml(translateText("labels.wood", {}, "Wood"));
    const coalLabel = escapeHtml(translateText("labels.coal", {}, "Coal"));
    const ironLabel = escapeHtml(translateText("labels.iron", {}, "Iron"));
    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);">
        <strong>${buildingDisplay}</strong> (${curLvl} â†’ ${tgtLvl})<br>
        ${meatLabel}: ${buildingMeat.toLocaleString()} | 
        ${woodLabel}: ${buildingWood.toLocaleString()} | 
        ${coalLabel}: ${buildingCoal.toLocaleString()} | 
        ${ironLabel}: ${buildingIron.toLocaleString()}
        ${crystalCostsHtml}
        ${extraStatsHtml}
      </div>
    `;
  }

  // --- Compute remaining resources and time ---
  // "Effective" backpack already includes bear hunt mail resources
  const woodRemaining = effectiveWoodBackpack - totalWood;
  const meatRemaining = effectiveMeatBackpack - totalMeat;
  const coalRemaining = effectiveCoalBackpack - totalCoal;
  const ironRemaining = effectiveIronBackpack - totalIron;
  const fireCrystalsRemaining = fireCrystalsBackpack - totalFireCrystals;
  const refinedFireCrystalsRemaining = refinedFireCrystalsBackpack - totalRefinedFireCrystals;

  // Construction speed buffs are additive (all added together first)
  const additiveSpeedPct = Math.max(0, constructionSpeedPct + hyenaBuffPct + castleBuffPct + positionBuffPct);
  // Dividing base time by (1 + speed%) gives the reduced time
  const additiveAdjustedSeconds = Math.floor(totalSeconds / (1 + (additiveSpeedPct / 100)));
  const additiveTimeSavedSeconds = Math.max(0, totalSeconds - additiveAdjustedSeconds);

  // Double Time is multiplicative (applied on top of additive buffs)
  const clampedDoubleTimePct = Math.max(0, Math.min(100, doubleTimePct));
  const doubleTimeAdjustedSeconds = Math.floor(additiveAdjustedSeconds * (1 - (clampedDoubleTimePct / 100)));
  const doubleTimeSavedSeconds = Math.max(0, additiveAdjustedSeconds - doubleTimeAdjustedSeconds);

  // Agnus is a flat time cut applied per upgraded level after percentage buffs.
  const totalAgnusReductionSeconds = agnusProjectManagementSeconds * agnusAppliedUpgradeCount;
  const agnusAdjustedSeconds = Math.max(0, doubleTimeAdjustedSeconds - totalAgnusReductionSeconds);
  const agnusTimeSavedSeconds = Math.max(0, doubleTimeAdjustedSeconds - agnusAdjustedSeconds);

  // Speedups are subtracted from remaining time (converted from minutes to seconds)
  const totalSpeedupSeconds = (generalSpeedupsMinutes + constructionSpeedupsMinutes) * 60;
  const remainingTimeSeconds = Math.max(0, agnusAdjustedSeconds - totalSpeedupSeconds);
  const speedupSurplusSeconds = Math.max(0, totalSpeedupSeconds - agnusAdjustedSeconds);

  // How much of each resource is still needed after accounting for the effective backpack
  const basicDeficits = {
    meat: Math.max(0, totalMeat - effectiveMeatBackpack),
    wood: Math.max(0, totalWood - effectiveWoodBackpack),
    coal: Math.max(0, totalCoal - effectiveCoalBackpack),
    iron: Math.max(0, totalIron - effectiveIronBackpack)
  };

  const useCustomChests = !!document.getElementById("useCustomChests")?.checked;
  const chestCounts = getCustomChestCounts();
  const chestPlan = useCustomChests
    ? recommendCustomChestUsage(basicDeficits, chestCounts)
    : null;

  const postChestRemaining = {
    meat: meatRemaining + (chestPlan ? chestPlan.provided.meat : 0),
    wood: woodRemaining + (chestPlan ? chestPlan.provided.wood : 0),
    coal: coalRemaining + (chestPlan ? chestPlan.provided.coal : 0),
    iron: ironRemaining + (chestPlan ? chestPlan.provided.iron : 0)
  };

  // Bear Hunt Mail summary block
  if (bearHuntMails.length > 0) {
    const totalBearMails = bearHuntMails.reduce((sum, m) => sum + Math.max(0, m.count || 0), 0);
    const summaryLabel = translateText("results.bearHuntMailSummary", { count: totalBearMails.toLocaleString() }, `BEAR HUNT MAIL (+${totalBearMails.toLocaleString()} mail added to backpack)`);
    
    const meatLabel = translateText("labels.meat", {}, "Meat");
    const woodLabel = translateText("labels.wood", {}, "Wood");
    const coalLabel = translateText("labels.coal", {}, "Coal");
    const ironLabel = translateText("labels.iron", {}, "Iron");
    const essenceStonesLabel = translateText("labels.essenceStones", {}, "Essence Stones");
    const luckyChestsLabel = translateText("labels.luckyHeroGearChests", {}, "Lucky Hero Gear Chests");
    const allianceTokensLabel = translateText("labels.allianceTokens", {}, "Alliance Tokens");

    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,165,0,0.7);">
        <strong>${escapeHtml(summaryLabel)}</strong><br>
        ${escapeHtml(meatLabel)}: +${bearHuntTotals.meat.toLocaleString()} | ${escapeHtml(woodLabel)}: +${bearHuntTotals.wood.toLocaleString()} | ${escapeHtml(coalLabel)}: +${bearHuntTotals.coal.toLocaleString()} | ${escapeHtml(ironLabel)}: +${bearHuntTotals.iron.toLocaleString()}<br>
        ${escapeHtml(essenceStonesLabel)}: +${bearHuntTotals.essenceStones.toLocaleString()} | ${escapeHtml(luckyChestsLabel)}: +${bearHuntTotals.luckyHeroGearChest.toLocaleString()}<br>
        XP Components: +${bearHuntTotals.xp10.toLocaleString()} \xd7 10XP, +${bearHuntTotals.xp100.toLocaleString()} \xd7 100XP | ${escapeHtml(allianceTokensLabel)}: +${bearHuntTotals.allianceToken.toLocaleString()}
      </div>
    `;
  }

  // Add grand total
  resultsHTML += `
    <div class="card-panel" style="margin-top: 15px;">
      <strong>${translateText("results.grandTotal", {}, "GRAND TOTAL")}</strong><br>
      ${translateText("labels.meat", {}, "Meat")}: ${totalMeat.toLocaleString()} | 
      ${translateText("labels.wood", {}, "Wood")}: ${totalWood.toLocaleString()} | 
      ${translateText("labels.coal", {}, "Coal")}: ${totalCoal.toLocaleString()} | 
      ${translateText("labels.iron", {}, "Iron")}: ${totalIron.toLocaleString()}<br>
      ${totalFireCrystals > 0 || totalRefinedFireCrystals > 0 ? `${translateText("labels.fireCrystals", {}, "Fire Crystals")}: ${totalFireCrystals.toLocaleString()} | ${translateText("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ${totalRefinedFireCrystals.toLocaleString()}<br>` : ""}
      ${clampedZinmanResourceDiscountPct > 0 ? `${translateText("results.baseCostBeforeZinman", {}, "Base Cost Before Zinman Discount")} - ${translateText("labels.meat", {}, "Meat")}: ${baseTotalMeat.toLocaleString()} | ${translateText("labels.wood", {}, "Wood")}: ${baseTotalWood.toLocaleString()} | ${translateText("labels.coal", {}, "Coal")}: ${baseTotalCoal.toLocaleString()} | ${translateText("labels.iron", {}, "Iron")}: ${baseTotalIron.toLocaleString()}<br>` : ""}
      ${translateText("results.totalUpgradeTimeBase", {}, "Total Upgrade Time (Base)")}: ${formatDuration(totalSeconds)}<br>
      ${translateText("results.additiveSpeed", { percent: additiveSpeedPct.toFixed(1) }, `Additive Speed (${additiveSpeedPct.toFixed(1)}%)`)}: ${formatDuration(additiveAdjustedSeconds)} (${translateText("results.saved", { duration: formatDuration(additiveTimeSavedSeconds) }, `${formatDuration(additiveTimeSavedSeconds)} saved`)})<br>
      ${translateText("results.doubleTime", { percent: clampedDoubleTimePct.toFixed(1) }, `Double Time (${clampedDoubleTimePct.toFixed(1)}%)`)}: ${formatDuration(doubleTimeAdjustedSeconds)} (${translateText("results.saved", { duration: formatDuration(doubleTimeSavedSeconds) }, `${formatDuration(doubleTimeSavedSeconds)} saved`)})
      ${agnusTimeSavedSeconds > 0 ? `<br>${translateText("labels.agnusProjectManagement", {}, "Agnus' Project Management Skill")}: ${formatDuration(agnusAdjustedSeconds)} (${translateText("results.saved", { duration: formatDuration(agnusTimeSavedSeconds) }, `${formatDuration(agnusTimeSavedSeconds)} saved`)})` : ""}
      
      <br><br>
      <strong>${translateText("results.afterUpgradeBalance", {}, "After Upgrade (Backpack Balance)")}</strong><br>
      ${translateText("labels.meat", {}, "Meat")}: ${meatRemaining.toLocaleString()} | 
      ${translateText("labels.wood", {}, "Wood")}: ${woodRemaining.toLocaleString()} | 
      ${translateText("labels.coal", {}, "Coal")}: ${coalRemaining.toLocaleString()} | 
      ${translateText("labels.iron", {}, "Iron")}: ${ironRemaining.toLocaleString()}<br>
      ${totalFireCrystals > 0 || totalRefinedFireCrystals > 0 ? `${translateText("labels.fireCrystals", {}, "Fire Crystals")}: ${fireCrystalsRemaining.toLocaleString()} | ${translateText("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ${refinedFireCrystalsRemaining.toLocaleString()}<br>` : ""}
      ${translateText("results.remainingTimeAfterSpeedups", {}, "Remaining Time After Speedups")}: ${formatDuration(remainingTimeSeconds)}
      ${speedupSurplusSeconds > 0 ? `<br>${translateText("results.speedupSurplus", {}, "Speedup Surplus")}: ${formatDuration(speedupSurplusSeconds)}` : ""}
    </div>
  `;

  if (chestPlan) {
    const chestLines = [];
    BASIC_RESOURCES.forEach(resource => {
      const alloc = chestPlan.allocations[resource];
      const usedCount = alloc[1] + alloc[2] + alloc[3];
      if (usedCount === 0) return; // Skip resources that needed no chests

      const resourceLabel = getResourceDisplayName(resource);
      chestLines.push(
        `${escapeHtml(resourceLabel)}: L3 x${alloc[3]}, L2 x${alloc[2]}, L1 x${alloc[1]} ` +
        `(${escapeHtml(translateText("results.provided", { amount: chestPlan.provided[resource].toLocaleString() }, `provided ${chestPlan.provided[resource].toLocaleString()}`))}, ${escapeHtml(translateText("results.uncoveredDeficit", { amount: chestPlan.remainingDeficits[resource].toLocaleString() }, `uncovered deficit ${chestPlan.remainingDeficits[resource].toLocaleString()}`))})`
      );
    });

    const totalL1 = chestCounts[1].unsecured + chestCounts[1].secured;
    const totalL2 = chestCounts[2].unsecured + chestCounts[2].secured;
    const totalL3 = chestCounts[3].unsecured + chestCounts[3].secured;
    const leftL1 = chestPlan.countsLeft[1].unsecured + chestPlan.countsLeft[1].secured;
    const leftL2 = chestPlan.countsLeft[2].unsecured + chestPlan.countsLeft[2].secured;
    const leftL3 = chestPlan.countsLeft[3].unsecured + chestPlan.countsLeft[3].secured;
    const usedL1 = totalL1 - leftL1;
    const usedL2 = totalL2 - leftL2;
    const usedL3 = totalL3 - leftL3;

    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px;">
        <strong>${translateText("results.customChestRecommendation", {}, "CUSTOM CHEST RECOMMENDATION")}</strong><br>
        ${chestLines.length ? chestLines.join("<br>") : translateText("results.noChestUsage", {}, "No chest usage needed for current deficits.")}<br><br>
        ${translateText("results.chestsUsed", {}, "Chests Used")}: L3 ${usedL3}/${totalL3} | L2 ${usedL2}/${totalL2} | L1 ${usedL1}/${totalL1}<br>
        <strong>${translateText("results.afterRecommendedChestUse", {}, "After Recommended Chest Use")}</strong><br>
        ${translateText("labels.meat", {}, "Meat")}: ${postChestRemaining.meat.toLocaleString()} |
        ${translateText("labels.wood", {}, "Wood")}: ${postChestRemaining.wood.toLocaleString()} |
        ${translateText("labels.coal", {}, "Coal")}: ${postChestRemaining.coal.toLocaleString()} |
        ${translateText("labels.iron", {}, "Iron")}: ${postChestRemaining.iron.toLocaleString()}
      </div>
    `;
  }

  // --- Calculate SVS Points for Building Upgrades ---
  const svsBasePointsItems = (totalFireCrystals * 2000); 
  const svsSpeedupMins = Math.ceil(agnusAdjustedSeconds / 60);
  const svsBasePointsSpeedups = svsSpeedupMins * 30;
  const svsBaseTotal = svsBasePointsItems + svsBasePointsSpeedups;
  
  const valeriaMult = getValeriaBonusMultiplier();
  const svsValeriaBonus = Math.floor(svsBaseTotal * (valeriaMult - 1.0));
  const svsGrandTotal = svsBaseTotal + svsValeriaBonus;
  
  if (svsBaseTotal > 0) {
    const svsItemsLabel = escapeHtml(translateText("results.svsPointsItems", {}, "SVS Points (Items):"));
    const svsSpeedupsLabel = escapeHtml(translateText("results.svsPointsSpeedups", {}, "SVS Points (Speedups):"));
    const svsTotalLabel = escapeHtml(translateText("results.svsPointsTotal", {}, "Total SVS Points:"));
    const valeriaLabel = svsValeriaBonus > 0 ? `<br><span style="font-size:0.9em; color:#aaccff;">(Includes ${formatNumber(svsValeriaBonus)} Valeria bonus)</span>` : "";

    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px; border-left: 3px solid #ffcc00; background: #1e2a3a; text-align: center;">
        <div style="color: #ccc; margin-bottom: 4px;"><strong>${svsItemsLabel}</strong> ${formatNumber(svsBasePointsItems)}</div>
        <div style="color: #ccc; margin-bottom: 8px;"><strong>${svsSpeedupsLabel}</strong> ${formatNumber(svsBasePointsSpeedups)}</div>
        <div style="color: #ffe08a; font-size: 1.15em;">
          <strong>${svsTotalLabel}</strong> <span style="font-size:1.2em;">${formatNumber(svsGrandTotal)}</span>
          ${valeriaLabel}
        </div>
      </div>
    `;
  }

  // Inject all the generated HTML into the results section
