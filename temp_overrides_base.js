function onPetsCalculateClick() {
  try {
    const targets = [];    let debugStr = "";
    PET_ORDER.forEach(name => {
      const row = document.querySelector(`.pet-row[data-pet="${name}"]`);
      if (row) {
        const startIdx = parseInt(row.querySelector(".pet-current-select").value);
        const endIdx = parseInt(row.querySelector(".pet-target-select").value);
        if (name === "Snow Leopard") debugStr = `Snow Leopard: start=${startIdx}, end=${endIdx}`;
        if (endIdx > startIdx) {
          targets.push({ name, startIdx, endIdx });
        }
      }
    });

    const resEl = document.getElementById("petsResult");
    if (!resEl) return;

    if (targets.length === 0) {
      resEl.innerHTML = `<div style="padding:16px;">Debug: No targets. ${debugStr}</div>`;
      resEl.style.display = "block";
      return;
    }

    const result = calculateMultiPetUpgrade(targets);
    renderPetsResult(result);
  } catch(err) {
    const resEl = document.getElementById("petsResult");
    if (resEl) {
      resEl.innerHTML = `<div style="color:red; padding:20px;">Error calculating pets: ${err.message}<br>${err.stack}</div>`;
      resEl.style.display = "block";
    }
  }
}

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
      startLevel: t.startIdx === -1 ? 'Not Obtained' : upgrades[t.startIdx].level,
      endLevel: upgrades[t.endIdx].level,
      totals: subTotal
    });
  });

  return { grandTotal, petBreakdown };
}

function onPetsSmartUpgradeClick() {
  const materials = {
    petFood: parseInt(document.getElementById("petFoodInput").value) || 0,
    tamingManual: parseInt(document.getElementById("tamingManualInput").value) || 0,
    energizingPotion: parseInt(document.getElementById("energizingPotionInput").value) || 0,
    strengtheningSerum: parseInt(document.getElementById("strengtheningSerumInput").value) || 0
  };

  // Build a list of all possible "next steps" across all pets
  // Strategy: Greedy - always pick the "cheapest" next upgrade across the entire collection.
  // This maximizes levels/svs points per resource.
  
  const currentStates = [];
  PET_ORDER.forEach(name => {
    const row = document.querySelector(`.pet-row[data-pet="${name}"]`);
    if (row) {
      const petData = PET_UPGRADES.pets[name];
      let upgrades = [];
      if (petData.customUpgrades) {
        upgrades = petData.customUpgrades;
      } else if (PET_UPGRADES.tiers[petData.tier]) {
        upgrades = PET_UPGRADES.tiers[petData.tier].upgrades;
      }
      const startIdx = parseInt(row.querySelector(".pet-current-select").value);
      if (startIdx === -1) return; // Skip if not obtained

      currentStates.push({
        name,
        upgrades,
        startIndex: startIdx,
        currentIndex: startIdx
      });
    }
  });

  const used = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };
  const upgradeLog = [];

  while (true) {
    let bestPet = null;
    let minCostValue = Infinity;

    // Find the cheapest upgrade available right now
    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        // Heuristic for "cost": weight the materials.
        // Food is common, serums are rare.
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
  if (upgradedPets.length > 0) {
    upgradedPets.forEach(s => {
      const row = document.querySelector(`.pet-row[data-pet="${s.name}"]`);
      row.querySelector(".pet-target-select").value = s.currentIndex;
    });
    savePetsState();
    
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

    renderPetsResult({ grandTotal: used, petBreakdown: breakdown });
  } else {
    alert(translateText("results.charmNoUpgradesPossible", {}, "No upgrades possible with current materials."));
  }
}

function renderPetsResult(result) {
  const resEl = document.getElementById("petsResult");
  if (!resEl) return;

  if (!result) {
    resEl.innerHTML = "";
    return;
  }

  const { grandTotal, petBreakdown } = result;

  const petFoodEl = document.getElementById("petFoodInput");
  const tamingManualEl = document.getElementById("tamingManualInput");
  const energizingPotionEl = document.getElementById("energizingPotionInput");
  const strengtheningSerumEl = document.getElementById("strengtheningSerumInput");

  const petFoodOwned = petFoodEl ? (parseInt(petFoodEl.value) || 0) : 0;
  const tamingManualOwned = tamingManualEl ? (parseInt(tamingManualEl.value) || 0) : 0;
  const energizingPotionOwned = energizingPotionEl ? (parseInt(energizingPotionEl.value) || 0) : 0;
  const strengtheningSerumOwned = strengtheningSerumEl ? (parseInt(strengtheningSerumEl.value) || 0) : 0;

  const petFoodDiff = petFoodOwned - grandTotal.petFood;
  const tamingManualDiff = tamingManualOwned - grandTotal.tamingManual;
  const energizingPotionDiff = energizingPotionOwned - grandTotal.energizingPotion;
  const strengtheningSerumDiff = strengtheningSerumOwned - grandTotal.strengtheningSerum;

  let html = `
    <div class="card-panel">
      <h3 style="margin-top:0; color:#ffe08a;">${translateText("results.grandTotal", {}, "GRAND TOTAL")}</h3>
      ${translateText("labels.petFood", {}, "Pet Food")}: ${formatNumber(grandTotal.petFood)} | 
      ${translateText("labels.tamingManual", {}, "Taming Manual")}: ${formatNumber(grandTotal.tamingManual)}<br>
      ${translateText("labels.energizingPotion", {}, "Energizing Potion")}: ${formatNumber(grandTotal.energizingPotion)} | 
      ${translateText("labels.strengtheningSerum", {}, "Strengthening Serum")}: ${formatNumber(grandTotal.strengtheningSerum)}
    </div>
    <div class="card-panel" style="margin-top: 10px;">
      <strong>${translateText("results.afterUpgradeBalance", {}, "After Upgrade (Material Balance)")}</strong><br>
      ${translateText("labels.petFood", {}, "Pet Food")}: <span style="color: ${petFoodDiff < 0 ? '#ff6b6b' : '#51cf66'}">${formatNumber(petFoodDiff)}</span><br>
      ${translateText("labels.tamingManual", {}, "Taming Manual")}: <span style="color: ${tamingManualDiff < 0 ? '#ff6b6b' : '#51cf66'}">${formatNumber(tamingManualDiff)}</span><br>
      ${translateText("labels.energizingPotion", {}, "Energizing Potion")}: <span style="color: ${energizingPotionDiff < 0 ? '#ff6b6b' : '#51cf66'}">${formatNumber(energizingPotionDiff)}</span><br>
      ${translateText("labels.strengtheningSerum", {}, "Strengthening Serum")}: <span style="color: ${strengtheningSerumDiff < 0 ? '#ff6b6b' : '#51cf66'}">${formatNumber(strengtheningSerumDiff)}</span>
    </div>
    <div class="card-panel" style="margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;">
      <strong>${translateText("results.svsPointsGained", {}, "SVS Points Gained:")}</strong> <span style="font-size:1.2em;">${formatNumber(grandTotal.svsPoints)}</span>
    </div>

    <h4 style="margin: 15px 0 10px;">${translateText("results.breakdown", {}, "Breakdown")}</h4>
  `;

  petBreakdown.forEach(p => {
    html += `
      <div class="card-panel" style="margin-bottom: 10px; border-left: 3px solid #ffe08a;">
        <strong>${escapeHtml(translateText(`pet.${p.name}`, {}, p.name))}</strong> (${p.startLevel} → ${p.endLevel})<br>
        <span style="font-size:0.9em; opacity:0.8;">
          ${translateText("labels.meat", {}, "Food")}: ${formatNumber(p.totals.petFood)} | 
          ${translateText("labels.tamingManual", {}, "Manuals")}: ${formatNumber(p.totals.tamingManual)} | 
          ${translateText("labels.energizingPotion", {}, "Potions")}: ${formatNumber(p.totals.energizingPotion)} | 
          ${translateText("labels.strengtheningSerum", {}, "Serums")}: ${formatNumber(p.totals.strengtheningSerum)}
        </span>
      </div>
    `;
  });

  resEl.innerHTML = html;
  resEl.style.display = "block";
}

// ============================================================
// DATA LOADING
// Fetches buildings.json and prerequisites.json, then
// initializes accounts and restores all saved state.
// "async" lets us use "await" to wait for the fetch to finish
// before continuing — cleaner than nesting callbacks.
// ============================================================

// Load both buildings and prerequisites data on page open
async function loadData() {
  try {
    // Load all data files and SVS points CSV in parallel
    const [buildingsResponse, preqResponse, gearResponse, charmResponse, petsResponse, expertsResponse] = await Promise.all([
      fetch("data/buildings.json" + window.location.search),
      fetch("data/prerequisites.json" + window.location.search),
      fetch("data/chiefGear.json" + window.location.search),
      fetch("data/chiefCharm.json" + window.location.search),
      fetch("data/petUpgrades.tiered.json" + window.location.search),
      fetch("data/expertsData.json" + window.location.search)
    ]);
    await loadSvsPointsCsv();

    const buildingsData = await buildingsResponse.json();
    BUILDING_COSTS = buildingsData.buildings;

    const preqData = await preqResponse.json();
    PREREQUISITES = preqData.prerequisites;

    const gearData = await gearResponse.json();
    CHIEF_GEAR_DATA = gearData;

    const charmData = await charmResponse.json();
    CHIEF_CHARM_DATA = charmData;

    const petsData = await petsResponse.json();
    PET_UPGRADES = petsData;

    const expertsData = await expertsResponse.json();
    EXPERTS_DATA = expertsData;

    console.log("Data loaded successfully", { BUILDING_COSTS, PREREQUISITES, CHIEF_GEAR_DATA, CHIEF_CHARM_DATA, PET_UPGRADES, EXPERTS_DATA, SVS_POINTS_LOOKUP });

    // Initialize accounts (migrates legacy flat keys on first run)
    initAccounts();

    // Load all state from the active account
    loadAllStateFromAccount();

    applyTheme(loadThemePreference());
  } catch (error) {
    console.error("Error loading data:", error);
    alert(translateText("alerts.dataLoadingError", {}, "Error loading calculator data. Please refresh the page."));
  }
}

// (Upgrade Calculator event listeners have been moved to main_spa_loader.js inside initUpgradeCalculatorPanel)


// ============================================================
// EVENT LISTENERS — ACCOUNT BAR
// ============================================================

// Account dropdown: switch to the selected account
const accountSelect = document.getElementById("accountSelect");
if (accountSelect) {
  accountSelect.addEventListener("change", function() {
    switchAccount(this.value);
  });
}

// Add Account button: prompt for a name, create, and switch
const addAccountBtn = document.getElementById("addAccountBtn");
if (addAccountBtn) {
  addAccountBtn.addEventListener("click", function() {
    // prompt() shows a native browser dialog and returns the typed string,
    // or null if the user clicked Cancel
    const name = prompt(
      translateText("account.namePrompt", {}, "Account name:"),
      translateText("account.defaultName", { number: accounts.length + 1 }, `Account ${accounts.length + 1}`)
    );
    if (name === null) return; // User cancelled
    const newAccount = addAccount(name.trim() || translateText("account.defaultName", { number: accounts.length + 1 }, `Account ${accounts.length + 1}`));
    switchAccount(newAccount.id);
  });
}

// Rename button: prompt for a new name and update the dropdown
const renameAccountBtn = document.getElementById("renameAccountBtn");
if (renameAccountBtn) {
  renameAccountBtn.addEventListener("click", function() {
    const account = getActiveAccount();
    if (!account) return;
    const newName = prompt(translateText("account.renamePrompt", {}, "Rename account:"), account.name);
    if (newName === null) return;
    renameAccount(account.id, newName);
    renderAccountSelector();
  });
}

// Delete button: confirm then delete, and reload from the new active account
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", function() {
    const account = getActiveAccount();
    if (!account) return;
    if (accounts.length <= 1) { alert(translateText("account.cannotDeleteOnly", {}, "Cannot delete the only account.")); return; }
    if (!confirm(translateText("account.deleteConfirm", { name: account.name }, `Delete "${account.name}"? This cannot be undone.`))) return;
    deleteAccount(account.id);
    loadAllStateFromAccount();
  });
}

// ============================================================
// EVENT LISTENERS — MISC UI
// ============================================================

document.querySelectorAll(".calculator-tab").forEach(tab => {
  tab.addEventListener("click", function() {
    const nextCalculator = this.dataset.calculator;
    if (!nextCalculator) return;
    setActiveCalculator(nextCalculator);
  });
});

// "Use Custom Chests" checkbox: show/hide the chest inputs and save
const useCustomChestsToggle = document.getElementById("useCustomChests");
if (useCustomChestsToggle) {
  useCustomChestsToggle.addEventListener("change", function() {
    updateCustomChestVisibility();
    saveSuppliesState();
  });
}

// Theme toggle button: flip between wos and dark themes
const themeToggleBtn = document.getElementById("themeToggleBtn");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", function() {
    const currentTheme = document.body.dataset.theme || "wos";
    const nextTheme = currentTheme === "dark" ? "wos" : "dark";
    applyTheme(nextTheme);
    saveThemePreference(nextTheme);
  });
}
// (Add Building and Bear Hunt Mail event listeners moved to main_spa_loader.js)

// ============================================================
// CALCULATE BUTTON
// This is the main calculation handler. It:
//   1. Reads all form inputs
//   2. Builds a list of every building to calculate (target +
//      prerequisites + optional)
//   3. Sums up total resource/time costs
//   4. Computes remaining resources after all upgrades
//   5. Applies construction speed buffs and speedup items
//   6. Optionally recommends custom chest usage
//   7. Outputs the full results as HTML
// ============================================================

function onUpgradeCalculateClick() {
  // Guard: bail out if data hasn't loaded yet
  if (!BUILDING_COSTS || !PREREQUISITES) {
    console.log("Data loading...");
    return;
  }

  const targetBuilding = document.getElementById("targetBuilding").value;
  const currentLevel = document.getElementById("currentLevel").value;
  const targetLevel = document.getElementById("targetLevel").value;

  // Validate that current ≤ target
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
        <strong>${buildingDisplay}</strong> (${curLvl} → ${tgtLvl})<br>
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

  // Inject all the generated HTML into the results section
  const resultEl = document.getElementById("result");
  resultEl.dataset.hasResults = "true";
  resultEl.innerHTML = resultsHTML;
}


// ============================================================
// STARTUP
// ============================================================

// Kick off the data load as soon as the script runs.
// Because loadData is async, the rest of the page stays
// interactive while it fetches the JSON files.
// window.dataReadyPromise = loadData();

// Language change is now handled by main_spa_loader.js to fully re-render the active panel.

function showUpdateToast(registration) {
  const existingToast = document.getElementById("swUpdateToast");
  if (existingToast) return;

  const toast = document.createElement("div");
  toast.id = "swUpdateToast";
  toast.className = "update-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span>${escapeHtml(translateText("update.ready", {}, "A new version is ready."))}</span>
    <button id="swUpdateBtn" type="button">${escapeHtml(translateText("buttons.refresh", {}, "Refresh"))}</button>
  `;

  document.body.appendChild(toast);

  const refreshBtn = document.getElementById("swUpdateBtn");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", () => {
    const waitingWorker = registration && registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      return;
    }
    window.location.reload();
  });
}

// Register the service worker for PWA (installable app) support.
// The service worker caches files so the app works offline.
// Register the service worker for PWA (installable app) support.
// The service worker caches files so the app works offline.
if ('serviceWorker' in navigator && 
    !window.location.hostname.includes('localhost') && 
    !window.location.hostname.includes('127.0.0.1')) {
  const SW_VERSION = '17';

  window.addEventListener('load', () => {
    const swUrl = `service-worker.js?v=${SW_VERSION}`;
    navigator.serviceWorker.register(swUrl, { scope: './', updateViaCache: 'none' })
      .then(registration => {
        console.log('Service Worker registered:', registration);

        if (registration.waiting) {
          showUpdateToast(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(registration);
            }
          });
        });
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) registration.update();
    });
  });

  // When the service worker updates (new version deployed), reload the
  // page automatically so the user always gets the latest version.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    // Only reload if there was an old controller (i.e., we are updating, not first-time installing)
    if (!navigator.serviceWorker.controller) return;
    refreshing = true;
    window.location.reload();
  });
}

// Initialize the data loading and store the promise globally so the SPA loader can wait for it
window.dataReadyPromise = loadData();
