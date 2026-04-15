// ============================================
// Lesson 4: Multi-Building Calculator
// ============================================

let BUILDING_COSTS = null;
let PREREQUISITES = null;
let optionalBuildings = [];

function parseLevelKey(levelKey) {
  const key = String(levelKey || "");

  if (/^\d+$/.test(key)) {
    return { group: 1, major: Number(key), minor: 0, raw: key };
  }

  const preFcMatch = key.match(/^(\d+)-(\d+)$/);
  if (preFcMatch) {
    return { group: 2, major: Number(preFcMatch[1]), minor: Number(preFcMatch[2]), raw: key };
  }

  const fcStepMatch = key.match(/^FC(\d+)-(\d+)$/i);
  if (fcStepMatch) {
    // Keep FC base tier before its sub-steps, then advance to next FC tier.
    return { group: 3, major: Number(fcStepMatch[1]), minor: Number(fcStepMatch[2]), raw: key };
  }

  const fcMatch = key.match(/^FC(\d+)$/i);
  if (fcMatch) {
    return { group: 3, major: Number(fcMatch[1]), minor: 0, raw: key };
  }

  return { group: 9, major: Number.MAX_SAFE_INTEGER, minor: 0, raw: key };
}

function compareLevelKeys(a, b) {
  const pa = parseLevelKey(a);
  const pb = parseLevelKey(b);
  if (pa.group !== pb.group) return pa.group - pb.group;
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.raw.localeCompare(pb.raw);
}

function getBuildingLevelOrder(buildingName) {
  if (!BUILDING_COSTS || !BUILDING_COSTS[buildingName]) return [];
  return Object.keys(BUILDING_COSTS[buildingName]).sort(compareLevelKeys);
}

function getUpgradePathKeys(buildingName, currentLevelKey, targetLevelKey) {
  const levels = getBuildingLevelOrder(buildingName);
  if (!levels.length) return [];

  const curKey = String(currentLevelKey || levels[0]);
  const tgtKey = String(targetLevelKey || levels[0]);
  const currentIdx = Math.max(0, levels.indexOf(curKey));
  const targetIdx = levels.indexOf(tgtKey);
  if (targetIdx < 0 || currentIdx >= targetIdx) return [];

  return levels.slice(currentIdx + 1, targetIdx + 1);
}

function getHigherRequiredLevel(buildingName, left, right) {
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

  return String(right);
}

function formatLevelLabel(levelKey) {
  const key = String(levelKey || "");
  const fcStepMatch = key.match(/^FC(\d+)-(\d+)$/i);
  if (fcStepMatch) return `FC ${fcStepMatch[1]}-${fcStepMatch[2]}`;

  const fcMatch = key.match(/^FC(\d+)$/i);
  if (fcMatch) return `FC ${fcMatch[1]}`;

  return key;
}

function saveTargetBuildingState() {
  const building = document.getElementById("targetBuilding").value;
  const current = document.getElementById("currentLevel").value;
  const target = document.getElementById("targetLevel").value;
  localStorage.setItem("wosCalc_building", building);
  localStorage.setItem("wosCalc_currentLevel", current);
  localStorage.setItem("wosCalc_targetLevel", target);
}

function loadTargetBuildingState() {
  const savedBuilding = localStorage.getItem("wosCalc_building");
  const savedCurrent = localStorage.getItem("wosCalc_currentLevel");
  const savedTarget = localStorage.getItem("wosCalc_targetLevel");
  return { savedBuilding, savedCurrent, savedTarget };
}

function saveOptionalBuildings() {
  localStorage.setItem("wosCalc_optionalBuildings", JSON.stringify(optionalBuildings));
}

function loadOptionalBuildings() {
  const saved = localStorage.getItem("wosCalc_optionalBuildings");
  if (saved) {
    try {
      optionalBuildings = JSON.parse(saved);
    } catch (e) {
      optionalBuildings = [];
    }
  }
  renderOptionalBuildings();
}

function savePrerequisiteState(buildingName, state) {
  const existing = {};
  const raw = localStorage.getItem("wosCalc_prereqState");
  if (raw) {
    try {
      Object.assign(existing, JSON.parse(raw));
    } catch (e) {
      // ignore corrupt data
    }
  }
  existing[buildingName] = state;
  localStorage.setItem("wosCalc_prereqState", JSON.stringify(existing));
}

function loadPrerequisiteState(buildingName) {
  const raw = localStorage.getItem("wosCalc_prereqState");
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && parsed[buildingName] ? parsed[buildingName] : {};
  } catch (e) {
    return {};
  }
}

function getAllBuildingOptionsHTML(selectedValue) {
  const buildingSelect = document.getElementById("targetBuilding");
  if (!buildingSelect) return "";
  return Array.from(buildingSelect.options)
    .map(opt => `<option value="${opt.value}"${opt.value === selectedValue ? " selected" : ""}>${opt.text}</option>`)
    .join("");
}

function renderOptionalBuildings() {
  const container = document.getElementById("optionalBuildingsContainer");
  if (optionalBuildings.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  optionalBuildings.forEach((item, index) => {
    const buildingLevels = getBuildingLevelOrder(item.building);
    const buildingOptions = getAllBuildingOptionsHTML(item.building);
    const currentOptions = buildingLevels
      .map(lvl => `<option value="${lvl}"${lvl === item.currentLevel ? " selected" : ""}>${formatLevelLabel(lvl)}</option>`)
      .join("");
    const targetOptions = buildingLevels
      .map(lvl => `<option value="${lvl}"${lvl === item.targetLevel ? " selected" : ""}>${formatLevelLabel(lvl)}</option>`)
      .join("");

    html += `
      <div style="margin-bottom: 12px; padding: 10px; background: #f9f9f9; border-radius: 4px;">
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 8px;">
          <div style="flex: 1 1 200px; min-width: 160px;">
            <label for="optionalBuilding_${index}">Building</label>
            <select id="optionalBuilding_${index}" class="optionalBuildingSelect" data-index="${index}" style="width: 100%;">
              ${buildingOptions}
            </select>
          </div>
          <button type="button" class="removeOptionalBtn" data-index="${index}" style="background-color: #ff6b6b; color: white; padding: 10px 14px; border: none; border-radius: 3px; cursor: pointer; font-size: 14px;">Remove</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 1 1 150px; min-width: 130px;">
            <label for="optionalCurrent_${index}">Current Level</label>
            <select id="optionalCurrent_${index}" class="optionalCurrentLevel" data-index="${index}">
              ${currentOptions}
            </select>
          </div>
          <div style="flex: 1 1 150px; min-width: 130px;">
            <label for="optionalTarget_${index}">Target Level</label>
            <select id="optionalTarget_${index}" class="optionalTargetLevel" data-index="${index}">
              ${targetOptions}
            </select>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Attach event listeners to remove buttons
  document.querySelectorAll(".removeOptionalBtn").forEach(btn => {
    btn.addEventListener("click", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      optionalBuildings.splice(idx, 1);
      saveOptionalBuildings();
      renderOptionalBuildings();
    });
  });

  document.querySelectorAll(".optionalBuildingSelect").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      const selectedBuilding = this.value;
      optionalBuildings[idx].building = selectedBuilding;
      const levels = getBuildingLevelOrder(selectedBuilding);
      optionalBuildings[idx].currentLevel = levels[0] || "1";
      optionalBuildings[idx].targetLevel = levels[Math.min(1, levels.length - 1)] || "1";
      saveOptionalBuildings();
      renderOptionalBuildings();
    });
  });

  // Attach event listeners to level selects
  document.querySelectorAll(".optionalCurrentLevel").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      optionalBuildings[idx].currentLevel = this.value;
      saveOptionalBuildings();
    });
  });

  document.querySelectorAll(".optionalTargetLevel").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      optionalBuildings[idx].targetLevel = this.value;
      saveOptionalBuildings();
    });
  });
}

function addOptionalBuilding() {
  const selectedBuilding = document.getElementById("targetBuilding")?.value || "furnace";
  const levels = getBuildingLevelOrder(selectedBuilding);
  if (levels.length < 2) {
    alert("Cannot add optional building: no level data available");
    return;
  }
  optionalBuildings.push({
    building: selectedBuilding,
    currentLevel: levels[0],
    targetLevel: levels[1]
  });
  saveOptionalBuildings();
  renderOptionalBuildings();
}

function setAllPrerequisiteCurrentLevels(levelKey) {
  const currentSelectors = document.querySelectorAll("#prerequisitesContainer select[id$='CurrentLevel']");
  currentSelectors.forEach(sel => {
    if ([...sel.options].some(option => option.value === levelKey)) {
      sel.value = levelKey;
    }
  });
}

function setSelectOptions(selectEl, optionValues, selectedValue) {
  const normalized = optionValues.map(v => String(v));
  selectEl.innerHTML = normalized
    .map(v => `<option value="${v}">${formatLevelLabel(v)}</option>`)
    .join("");

  const preferred = String(selectedValue || "");
  if (preferred && normalized.includes(preferred)) {
    selectEl.value = preferred;
  } else if (normalized.length) {
    selectEl.value = normalized[0];
  }
}

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;

  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs || !parts.length) parts.push(`${secs}s`);
  return parts.join(" ");
}

function parseResourceAmount(rawInput) {
  const text = String(rawInput || "").trim().replace(/,/g, "").toUpperCase();
  if (!text) return 0;

  const match = text.match(/^([0-9]*\.?[0-9]+)\s*([KMB])?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  if (Number.isNaN(value) || value < 0) return 0;

  const suffix = match[2] || "";
  const multiplier = suffix === "B" ? 1000000000 : (suffix === "M" ? 1000000 : (suffix === "K" ? 1000 : 1));
  return Math.round(value * multiplier);
}

function getAggregatedPrerequisites(selectedBuilding, currentLevelKey, targetLevelKey) {
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

  // New schema: prerequisites by target level.
  if (ruleSet.levels || ruleSet.fcLevels) return result;

  // Legacy schema: single list with target-level offsets.
  const legacyRules = Array.isArray(ruleSet) ? ruleSet : (ruleSet.legacy || []);
  const targetNumeric = parseInt(String(targetLevelKey || ""), 10);
  if (Number.isNaN(targetNumeric)) return result;

  for (const req of legacyRules) {
    const building = req.building;
    const requiredLevel = String(Math.max(1, targetNumeric + Number(req.levelOffset || 0)));
    const prev = result.get(building);
    result.set(building, getHigherRequiredLevel(building, prev, requiredLevel));
  }

  return result;
}

function updateMainLevelSelectors(selectedBuilding) {
  const currentLevelSelect = document.getElementById("currentLevel");
  const targetLevelSelect = document.getElementById("targetLevel");
  const options = getBuildingLevelOrder(selectedBuilding);
  if (!options.length) return;

  const existingCurrent = currentLevelSelect.value;
  const existingTarget = targetLevelSelect.value;
  setSelectOptions(currentLevelSelect, options, existingCurrent || options[0]);
  setSelectOptions(targetLevelSelect, options, existingTarget || options[Math.min(1, options.length - 1)]);

  const currentIdx = options.indexOf(currentLevelSelect.value);
  const targetIdx = options.indexOf(targetLevelSelect.value);
  if (targetIdx < currentIdx) {
    targetLevelSelect.value = currentLevelSelect.value;
  }
}

// Show/hide prerequisites for a given building and target level
function updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelKey) {
  const prereqsFieldset = document.getElementById("prerequisitesSection");
  const prereqsContainer = document.getElementById("prerequisitesContainer");

  if (PREREQUISITES && PREREQUISITES[selectedBuilding]) {
    const prereqMap = getAggregatedPrerequisites(selectedBuilding, currentLevelKey, targetLevelKey);

    let prereqsHTML = `
      <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 1 1 220px; min-width: 140px;">
          <label for="prereqBatchCurrent">Set all current levels</label>
          <select id="prereqBatchCurrent"></select>
        </div>
        <button id="setAllPrereqCurrentBtn" type="button" style="background-color: #4a90e2; color: white; padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer;">Set All</button>
      </div>
    `;

    const savedPrereqState = loadPrerequisiteState(selectedBuilding);

    for (const [buildingName, requiredLevel] of prereqMap.entries()) {
      const hasCostData = !!(BUILDING_COSTS && BUILDING_COSTS[buildingName]);
      const buildingLabel = buildingName.replace("_", " ").toUpperCase();
      const existingCurrentInput = document.getElementById(`${buildingName}CurrentLevel`);
      const existingTargetInput = document.getElementById(`${buildingName}Level`);
      const levelOptions = getBuildingLevelOrder(buildingName);
      const savedState = savedPrereqState[buildingName] || {};
      const savedCurrentLevel = String(savedState.currentLevel || "");
      const savedTargetLevel = String(savedState.targetLevel || "");
      const existingCurrentLevel = existingCurrentInput ? String(existingCurrentInput.value) : savedCurrentLevel;
      const existingTargetLevel = existingTargetInput ? String(existingTargetInput.value) : savedTargetLevel;
      const requiredLevelKey = String(requiredLevel);
      const fallbackCurrent = levelOptions[0] || "1";
      const fallbackTarget = levelOptions.includes(requiredLevelKey) ? requiredLevelKey : (levelOptions[levelOptions.length - 1] || requiredLevelKey);
      const chosenCurrent = levelOptions.includes(existingCurrentLevel) ? existingCurrentLevel : fallbackCurrent;
      const chosenTargetRaw = levelOptions.includes(existingTargetLevel) ? existingTargetLevel : fallbackTarget;
      const currentIdx = levelOptions.indexOf(chosenCurrent);
      const targetIdx = levelOptions.indexOf(chosenTargetRaw);
      const chosenTarget = (targetIdx >= currentIdx && targetIdx >= 0) ? chosenTargetRaw : chosenCurrent;

      const renderOptions = (selected) => levelOptions
        .map(opt => `<option value="${opt}"${opt === selected ? " selected" : ""}>${formatLevelLabel(opt)}</option>`)
        .join("");

      if (hasCostData) {
        prereqsHTML += `
          <div style="margin-bottom: 10px;">
            <div style="font-weight: 700; margin-bottom: 6px;">${buildingLabel}</div>
            <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
              <div style="flex: 1 1 160px; min-width: 140px;">
                <label for="${buildingName}CurrentLevel">Current Level</label>
                <select
                  id="${buildingName}CurrentLevel" 
                  data-building="${buildingName}"
                >${renderOptions(chosenCurrent)}</select>
              </div>
              <div style="flex: 1 1 160px; min-width: 140px;">
                <label for="${buildingName}Level">Required Level</label>
                <select
                  id="${buildingName}Level" 
                  data-building="${buildingName}"
                >${renderOptions(chosenTarget)}</select>
              </div>
            </div>
          </div>
        `;
      } else {
        prereqsHTML += `
          <div style="margin-bottom: 10px; padding: 8px; background: #f7f7f7; border-radius: 6px;">
            <strong>${buildingLabel}</strong><br>
            <div style="margin-top: 6px;">Required Level: ${requiredLevel}</div>
          </div>
        `;
      }
    }

    prereqsContainer.innerHTML = prereqsHTML;

    const prereqBatchCurrent = document.getElementById("prereqBatchCurrent");
    if (prereqBatchCurrent) {
      const options = getBuildingLevelOrder(selectedBuilding);
      setSelectOptions(prereqBatchCurrent, options, currentLevelKey);
    }

    const setAllButton = document.getElementById("setAllPrereqCurrentBtn");
    if (setAllButton) {
      setAllButton.addEventListener("click", function() {
        const selectedValue = document.getElementById("prereqBatchCurrent").value;
        setAllPrerequisiteCurrentLevels(selectedValue);

        const savedState = loadPrerequisiteState(selectedBuilding);
        document.querySelectorAll("#prerequisitesContainer select[id$='CurrentLevel']").forEach(sel => {
          const prereqBuilding = sel.dataset.building;
          if (!prereqBuilding) return;
          if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};
          savedState[prereqBuilding].currentLevel = sel.value;
        });
        savePrerequisiteState(selectedBuilding, savedState);
      });
    }

    document.querySelectorAll("#prerequisitesContainer select[data-building][id$='CurrentLevel']").forEach(sel => {
      sel.addEventListener("change", function() {
        const prereqBuilding = this.dataset.building;
        if (!prereqBuilding) return;
        const savedState = loadPrerequisiteState(selectedBuilding);
        if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};
        savedState[prereqBuilding].currentLevel = this.value;
        savePrerequisiteState(selectedBuilding, savedState);
      });
    });

    document.querySelectorAll("#prerequisitesContainer select[data-building][id$='Level']").forEach(sel => {
      sel.addEventListener("change", function() {
        const prereqBuilding = this.dataset.building;
        if (!prereqBuilding) return;
        const savedState = loadPrerequisiteState(selectedBuilding);
        if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};
        savedState[prereqBuilding].targetLevel = this.value;
        savePrerequisiteState(selectedBuilding, savedState);
      });
    });

    prereqsFieldset.style.display = "block";
  } else {
    prereqsContainer.innerHTML = "";
    prereqsFieldset.style.display = "none";
  }
}

// Load both buildings and prerequisites data on page open
async function loadData() {
  try {
    const buildingsResponse = await fetch("data/buildings.json");
    const buildingsData = await buildingsResponse.json();
    BUILDING_COSTS = buildingsData.buildings;

    const preqResponse = await fetch("data/prerequisites.json");
    const preqData = await preqResponse.json();
    PREREQUISITES = preqData.prerequisites;

    console.log("Data loaded successfully", { BUILDING_COSTS, PREREQUISITES });

    // Restore saved building and level state, or use defaults
    const { savedBuilding, savedCurrent, savedTarget } = loadTargetBuildingState();
    const targetBuildingSelect = document.getElementById("targetBuilding");
    
    if (savedBuilding && [...targetBuildingSelect.options].map(o => o.value).includes(savedBuilding)) {
      targetBuildingSelect.value = savedBuilding;
    }
    
    const selectedBuilding = targetBuildingSelect.value;
    updateMainLevelSelectors(selectedBuilding);
    
    const currentLevelSelect = document.getElementById("currentLevel");
    const targetLevelSelect = document.getElementById("targetLevel");
    
    if (savedCurrent && [...currentLevelSelect.options].map(o => o.value).includes(savedCurrent)) {
      currentLevelSelect.value = savedCurrent;
    }
    if (savedTarget && [...targetLevelSelect.options].map(o => o.value).includes(savedTarget)) {
      targetLevelSelect.value = savedTarget;
    }
    
    const currentLevelKey = currentLevelSelect.value;
    const targetLevelKey = targetLevelSelect.value;
    updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelKey);
    
    // Load optional buildings after data is available
    loadOptionalBuildings();
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Error loading calculator data. Please refresh the page.");
  }
}

// When target building dropdown changes, update prerequisites
document.getElementById("targetBuilding").addEventListener("change", function() {
  updateMainLevelSelectors(this.value);
  const currentLevelKey = document.getElementById("currentLevel").value;
  const targetLevelKey = document.getElementById("targetLevel").value;
  updatePrerequisites(this.value, currentLevelKey, targetLevelKey);
  saveTargetBuildingState();
});

// When current level changes, update prerequisite levels
document.getElementById("currentLevel").addEventListener("change", function() {
  const selectedBuilding = document.getElementById("targetBuilding").value;
  const currentLevelKey = this.value;
  const targetLevelSelect = document.getElementById("targetLevel");
  const orderedLevels = getBuildingLevelOrder(selectedBuilding);
  const currentIdx = orderedLevels.indexOf(currentLevelKey);
  const targetIdx = orderedLevels.indexOf(targetLevelSelect.value);
  if (targetIdx < currentIdx) {
    targetLevelSelect.value = currentLevelKey;
  }
  updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelSelect.value);
  saveTargetBuildingState();
});

// When target level changes, update prerequisite levels
document.getElementById("targetLevel").addEventListener("change", function() {
  const selectedBuilding = document.getElementById("targetBuilding").value;
  const currentLevelKey = document.getElementById("currentLevel").value;
  const orderedLevels = getBuildingLevelOrder(selectedBuilding);
  const currentIdx = orderedLevels.indexOf(currentLevelKey);
  const targetIdx = orderedLevels.indexOf(this.value);
  if (targetIdx < currentIdx) {
    this.value = currentLevelKey;
  }
  updatePrerequisites(selectedBuilding, currentLevelKey, this.value);
  saveTargetBuildingState();
});

// Add optional building
document.getElementById("addBuildingBtn").addEventListener("click", function() {
  addOptionalBuilding();
});

// Calculate total costs for target building + all prerequisites
document.getElementById("calculateBtn").addEventListener("click", function() {
  // Validate data is loaded
  if (!BUILDING_COSTS || !PREREQUISITES) {
    alert("Data is still loading. Please wait and try again.");
    return;
  }

  const targetBuilding = document.getElementById("targetBuilding").value;
  const currentLevel = document.getElementById("currentLevel").value;
  const targetLevel = document.getElementById("targetLevel").value;

  // Validate input
  const selectedBuildingLevels = getBuildingLevelOrder(targetBuilding);
  const currentIdx = selectedBuildingLevels.indexOf(currentLevel);
  const targetIdx = selectedBuildingLevels.indexOf(targetLevel);
  if (currentIdx < 0 || targetIdx < 0 || currentIdx > targetIdx) {
    alert("Please ensure current level does not exceed target level.");
    return;
  }

  // Get backpack resources
  const woodBackpack = parseResourceAmount(document.getElementById("ownedWood").value);
  const meatBackpack = parseResourceAmount(document.getElementById("ownedMeat").value);
  const coalBackpack = parseResourceAmount(document.getElementById("ownedCoal").value);
  const ironBackpack = parseResourceAmount(document.getElementById("ownedIron").value);
  const generalSpeedupsMinutes = parseInt(document.getElementById("generalSpeedups").value) || 0;
  const constructionSpeedupsMinutes = parseInt(document.getElementById("constructionSpeedups").value) || 0;
  const constructionSpeedPct = parseFloat(document.getElementById("constructionSpeedPct").value) || 0;
  const hyenaBuffPct = parseFloat(document.getElementById("hyenaBuffPct").value) || 0;
  const doubleTimePct = document.getElementById("doubleTimeEnabled").checked ? 20 : 0;
  const castleBuffPct = document.getElementById("castleBuffEnabled").checked ? 10 : 0;
  const positionBuffPct = parseFloat(document.getElementById("positionBuffPct").value) || 0;

  // Collect all buildings to calculate (target + prerequisites)
  const buildingsToCalc = [{ building: targetBuilding, currentLevel, targetLevel }];

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

  // Add optional buildings to calculation
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
  let totalWood = 0, totalMeat = 0, totalCoal = 0, totalIron = 0;
  let totalSeconds = 0;
  let resultsHTML = "";

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    let buildingWood = 0, buildingMeat = 0, buildingCoal = 0, buildingIron = 0;

    if (!BUILDING_COSTS[building]) continue;

    // Sum costs from the next level after current through target.
    const upgradePath = getUpgradePathKeys(building, curLvl, tgtLvl);
    for (const level of upgradePath) {
      const levelData = BUILDING_COSTS[building][level];
      if (!levelData) continue;

      buildingWood += levelData.wood || 0;
      buildingMeat += levelData.meat || 0;
      buildingCoal += levelData.coal || 0;
      buildingIron += levelData.iron || 0;
      totalSeconds += levelData.seconds || 0;
    }

    totalWood += buildingWood;
    totalMeat += buildingMeat;
    totalCoal += buildingCoal;
    totalIron += buildingIron;

    const currentData = BUILDING_COSTS[building][curLvl] || {};
    const targetData = BUILDING_COSTS[building][tgtLvl] || {};
    const rallyFrom = currentData.rallyCapacity;
    const rallyTo = targetData.rallyCapacity;
    const deployFrom = currentData.troopDeploymentCapacity;
    const deployTo = targetData.troopDeploymentCapacity;
    const storageFrom = currentData.storageCapacity;
    const storageTo = targetData.storageCapacity;
    const extraStatLines = [];

    if (typeof rallyFrom === "number" && typeof rallyTo === "number") {
      extraStatLines.push(`Rally Capacity: ${rallyFrom.toLocaleString()} -> ${rallyTo.toLocaleString()}`);
    }

    if (typeof deployFrom === "number" && typeof deployTo === "number") {
      extraStatLines.push(`Troop Deployment Capacity: ${deployFrom.toLocaleString()} -> ${deployTo.toLocaleString()}`);
    }

    if (typeof storageFrom === "number" && typeof storageTo === "number") {
      extraStatLines.push(`Storage Capacity: ${storageFrom.toLocaleString()} -> ${storageTo.toLocaleString()}`);
    }

    const extraStatsHtml = extraStatLines.length
      ? `<br>${extraStatLines.join("<br>")}`
      : "";

    // Display results for this building
    const buildingDisplay = building.replace("_", " ").toUpperCase();
    resultsHTML += `
      <div style="margin-top: 15px; padding: 10px; border-left: 3px solid #ccc;">
        <strong>${buildingDisplay}</strong> (${curLvl} → ${tgtLvl})<br>
        Meat: ${buildingMeat.toLocaleString()} | 
        Wood: ${buildingWood.toLocaleString()} | 
        Coal: ${buildingCoal.toLocaleString()} | 
        Iron: ${buildingIron.toLocaleString()}
        ${extraStatsHtml}
      </div>
    `;
  }

  // Calculate remaining resources after upgrade
  const woodRemaining = woodBackpack - totalWood;
  const meatRemaining = meatBackpack - totalMeat;
  const coalRemaining = coalBackpack - totalCoal;
  const ironRemaining = ironBackpack - totalIron;
  const additiveSpeedPct = Math.max(0, constructionSpeedPct + hyenaBuffPct + castleBuffPct + positionBuffPct);
  const additiveAdjustedSeconds = Math.floor(totalSeconds / (1 + (additiveSpeedPct / 100)));
  const additiveTimeSavedSeconds = Math.max(0, totalSeconds - additiveAdjustedSeconds);
  const clampedDoubleTimePct = Math.max(0, Math.min(100, doubleTimePct));
  const doubleTimeAdjustedSeconds = Math.floor(additiveAdjustedSeconds * (1 - (clampedDoubleTimePct / 100)));
  const doubleTimeSavedSeconds = Math.max(0, additiveAdjustedSeconds - doubleTimeAdjustedSeconds);
  const totalSpeedupSeconds = (generalSpeedupsMinutes + constructionSpeedupsMinutes) * 60;
  const remainingTimeSeconds = Math.max(0, doubleTimeAdjustedSeconds - totalSpeedupSeconds);
  const speedupSurplusSeconds = Math.max(0, totalSpeedupSeconds - doubleTimeAdjustedSeconds);

  // Add grand total
  resultsHTML += `
    <div style="margin-top: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
      <strong>GRAND TOTAL</strong><br>
      Meat: ${totalMeat.toLocaleString()} | 
      Wood: ${totalWood.toLocaleString()} | 
      Coal: ${totalCoal.toLocaleString()} | 
      Iron: ${totalIron.toLocaleString()}<br>
      Total Upgrade Time (Base): ${formatDuration(totalSeconds)}<br>
      Additive Speed (${additiveSpeedPct.toFixed(1)}%): ${formatDuration(additiveAdjustedSeconds)} (${formatDuration(additiveTimeSavedSeconds)} saved)<br>
      Double Time (${clampedDoubleTimePct.toFixed(1)}%): ${formatDuration(doubleTimeAdjustedSeconds)} (${formatDuration(doubleTimeSavedSeconds)} saved)
      
      <br><br>
      <strong>After Upgrade (Backpack Balance)</strong><br>
      Meat: ${meatRemaining.toLocaleString()} | 
      Wood: ${woodRemaining.toLocaleString()} | 
      Coal: ${coalRemaining.toLocaleString()} | 
      Iron: ${ironRemaining.toLocaleString()}<br>
      Remaining Time After Speedups: ${formatDuration(remainingTimeSeconds)}
      ${speedupSurplusSeconds > 0 ? `<br>Speedup Surplus: ${formatDuration(speedupSurplusSeconds)}` : ""}
    </div>
  `;

  document.getElementById("result").innerHTML = resultsHTML;
});

// Load data on page load
loadData();