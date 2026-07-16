function calculateExperts() {
  if (!EXPERTS_DATA) return;

  let totalAffinityNeeded = 0;
  let totalGeneralSigilsNeeded = 0; // After using specific sigils
  let resultsHTML = "";
  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];

  EXPERT_ORDER.forEach(name => {
    const currentSel = document.querySelector(`.expert-current-select[data-expert="${name}"]`);
    const targetSel = document.querySelector(`.expert-target-select[data-expert="${name}"]`);
    const specSigilsInp = document.querySelector(`.expert-specific-sigils[data-expert="${name}"]`);
    
    if (!currentSel || !targetSel) return;

    const curLvl = parseInt(currentSel.value) || 1;
    const tgtLvl = parseInt(targetSel.value) || 1;
    if (curLvl === -1) return;
    let specSigilsAvail = parseInt(specSigilsInp?.value) || 0;

    const expertData = EXPERTS_DATA[name];
    if (!expertData || !expertData.levels) return;

    let affinity = 0;
    let sigils = 0;
    // Affinity and Sigils
    if (curLvl < tgtLvl) {
      for (let l = curLvl + 1; l <= tgtLvl; l++) {
        const row = expertData.levels.find(r => r.level === l);
        if (row) {
          affinity += (row.affinity || 0);
          sigils += (row.advancement || 0);
        }
      }
    }
    
    // Apply specific sigils
    let remainingSigilsForExpert = sigils;
    if (specSigilsAvail >= remainingSigilsForExpert) {
      remainingSigilsForExpert = 0;
    } else {
      remainingSigilsForExpert -= specSigilsAvail;
    }

    totalAffinityNeeded += affinity;
    totalGeneralSigilsNeeded += remainingSigilsForExpert;
    if (affinity > 0 || sigils > 0 ) {
      const localizedName = translateText(`expert.${name.toLowerCase()}`, {}, name);
      resultsHTML += `
        <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);">
          <strong>${escapeHtml(localizedName)}</strong><br>
          ${affinity > 0 ? `${translateText("labels.affinity", {}, "Affinity Needed")}: ${affinity.toLocaleString()} <br>` : ""}
          ${sigils > 0 ? `${translateText("labels.advancementSigils", {}, "Advancement Sigils Needed")}: ${sigils.toLocaleString()} (After Specific Sigils: ${remainingSigilsForExpert.toLocaleString()})<br>` : ""}
          
        </div>
      `;
    }
  });

  const invGenSigils = parseInt(document.getElementById("expertAdvancementSigils")?.value) || 0;
  const invCompass = parseInt(document.getElementById("expertCompass")?.value) || 0;
  const invFieryHeart = parseInt(document.getElementById("expertFieryHeart")?.value) || 0;
  const invSail = parseInt(document.getElementById("expertSailOfConquest")?.value) || 0;
  
  const totalInvAffinity = (invCompass * 10) + (invFieryHeart * 100) + (invSail * 1000);

  const remainingAffinity = Math.max(0, totalAffinityNeeded - totalInvAffinity);
  const remainingGenSigils = Math.max(0, totalGeneralSigilsNeeded - invGenSigils);
  
  let grandTotalHTML = `
    <div class="card-panel" style="margin-top: 15px;">
      <strong>${translateText("results.grandTotal", {}, "GRAND TOTAL")}</strong><br>
      ${translateText("labels.totalAffinity", {}, "Total Affinity Required")}: ${totalAffinityNeeded.toLocaleString()}<br>
      ${translateText("labels.totalSigils", {}, "Total General Sigils Required")}: ${totalGeneralSigilsNeeded.toLocaleString()}<br>
      <br>
      
      <strong>${translateText("results.afterInventory", {}, "Remaining After Inventory")}</strong><br>
      ${translateText("labels.remainingAffinity", {}, "Affinity Needed")}: ${remainingAffinity.toLocaleString()}<br>
      ${translateText("labels.remainingSigils", {}, "General Sigils Needed")}: ${remainingGenSigils.toLocaleString()}<br>
      
    </div>
  `;

  if (totalAffinityNeeded === 0 && totalGeneralSigilsNeeded === 0 ) {
    resultsHTML = `<div class="card-panel" style="margin-top: 15px;">${translateText("results.noUpgrades", {}, "No upgrades selected or already at target level.")}</div>`;
  } else {
    resultsHTML += grandTotalHTML;
  }

  const resultEl = document.getElementById("expertsResult");
  if (resultEl) {
    resultEl.dataset.hasResults = "true";
    resultEl.innerHTML = resultsHTML;
  }
}

// ==========================================
// SVS Calculator Logic
// ==========================================

function initSvSPanel() {
  const panel = document.getElementById("svsPanel");
  if (!panel) return;

  const importAllBtn = document.getElementById("svsImportAllBtn");
  if (importAllBtn) importAllBtn.addEventListener("click", importSvSData);

  const importBtns = [
    { id: "svsImportBuildingsBtn", handler: importSvSBuildings },
    { id: "svsImportResearchBtn", handler: importSvSResearch },
    { id: "svsImportPetsBtn", handler: importSvSPets },
    { id: "svsImportCharmsBtn", handler: importSvSCharms },
    { id: "svsImportGearBtn", handler: importSvSGear },
    { id: "svsImportExpertsBtn", handler: importSvSExperts },
    { id: "svsImportTroopsBtn", handler: importSvSTroops }
  ];

  importBtns.forEach(b => {
    const el = document.getElementById(b.id);
    if (el) el.addEventListener("click", b.handler);
  });

  // Attach input listeners for live calculation
  const inputs = panel.querySelectorAll("input[type='number']");
  inputs.forEach(input => {
    input.addEventListener("input", calculateSvSPoints);
  });
  const selects = panel.querySelectorAll("select");
  selects.forEach(select => {
    select.addEventListener("change", calculateSvSPoints);
  });
}

function calculateSvSPoints() {
  const resultEl = document.getElementById("svsResult");
  if (!resultEl) return;

  const getVal = (id) => {
    const el = document.getElementById(id);
    return el ? (parseInt(el.value) || 0) : 0;
  };

  // Day 1
  let day1 = 0;
  day1 += getVal("svsD1_FC") * 2000;
  day1 += getVal("svsD1_FCShards") * 1000;
  day1 += getVal("svsD1_RefinedFC") * 30000;
  day1 += getVal("svsD1_Speedups") * 30;
  day1 += getVal("svsD1_Charm") * 70;

  // Day 2
  let day2 = 0;
  day2 += getVal("svsD2_FC") * 2000;
  day2 += getVal("svsD2_FCShards") * 1000;
  day2 += getVal("svsD2_RefinedFC") * 30000;
  day2 += getVal("svsD2_Speedups") * 30;
  day2 += getVal("svsD2_LuckyWheel") * 8000;
  day2 += getVal("svsD2_RareHero") * 350;
  day2 += getVal("svsD2_EpicHero") * 1220;
  day2 += getVal("svsD2_MythicHero") * 3040;
  day2 += getVal("svsD2_Meat") * 2;
  day2 += getVal("svsD2_Wood") * 2;
  day2 += getVal("svsD2_Coal") * 2;
  day2 += getVal("svsD2_Iron") * 2;

  // Day 3
  let day3 = 0;
  day3 += getVal("svsD3_PetAdv") * 50;
  day3 += getVal("svsD3_AdvWildMark") * 15000;
  day3 += getVal("svsD3_ComWildMark") * 1150;
  day3 += getVal("svsD3_LuckyWheel") * 8000;
  day3 += getVal("svsD3_Charm") * 70;
  day3 += getVal("svsD3_RareHero") * 350;
  day3 += getVal("svsD3_EpicHero") * 1220;
  day3 += getVal("svsD3_MythicHero") * 3040;
  day3 += getVal("svsD3_PolarTerror") * 30000;
  day3 += getVal("svsD3_Beast1") * 9000;
  day3 += getVal("svsD3_Beast11") * 9750;
  day3 += getVal("svsD3_Beast16") * 10500;
  day3 += getVal("svsD3_Beast21") * 11250;
  day3 += getVal("svsD3_Beast26") * 12000;

  // Day 4
  let day4 = 0;
  day4 += getVal("svsD4_Charm") * 70;
  day4 += getVal("svsD4_EssenceStone") * 4000;
  day4 += getVal("svsD4_Widget") * 8000;
  day4 += getVal("svsD4_Mithril") * 40000;
  day4 += getVal("svsD4_T1") * 3;
  day4 += getVal("svsD4_T2") * 4;
  day4 += getVal("svsD4_T3") * 5;
  day4 += getVal("svsD4_T4") * 8;
  day4 += getVal("svsD4_T5") * 12;
  day4 += getVal("svsD4_T6") * 18;
  day4 += getVal("svsD4_T7") * 25;
  day4 += getVal("svsD4_T8") * 35;
  day4 += getVal("svsD4_T9") * 45;
  day4 += getVal("svsD4_T10") * 60;
  day4 += getVal("svsD4_T11") * 75;

  // Day 5
  let day5 = 0;
  day5 += getVal("svsD5_PetAdv") * 50;
  day5 += getVal("svsD5_AdvWildMark") * 15000;
  day5 += getVal("svsD5_ComWildMark") * 1150;
  day5 += getVal("svsD5_EssenceStone") * 4000;
  day5 += getVal("svsD5_Widget") * 8000;
  day5 += getVal("svsD5_Mithril") * 40000;
  day5 += getVal("svsD5_GearScore") * 36;
  day5 += getVal("svsD5_FC") * 2000;
  day5 += getVal("svsD5_FCShards") * 1000;
  day5 += getVal("svsD5_RefinedFC") * 30000;
  day5 += getVal("svsD5_Speedups") * 30;

  const valeriaLevel = getVal("globalValeriaSkill");
  const valeriaMultiplier = 1 + (valeriaLevel * 2) / 100;

  day1 = Math.floor(day1 * valeriaMultiplier);
  day2 = Math.floor(day2 * valeriaMultiplier);
  day3 = Math.floor(day3 * valeriaMultiplier);
  day4 = Math.floor(day4 * valeriaMultiplier);
  day5 = Math.floor(day5 * valeriaMultiplier);

  const total = day1 + day2 + day3 + day4 + day5;

  let resultsHTML = `
    <div class="result-box">
      <h3>Total SvS Points: ${total.toLocaleString()}</h3>
      <ul>
        <li><strong>Day 1 (City Construction):</strong> ${day1.toLocaleString()}</li>
        <li><strong>Day 2 (Research Day):</strong> ${day2.toLocaleString()}</li>
        <li><strong>Day 3 (Beast Slay):</strong> ${day3.toLocaleString()}</li>
        <li><strong>Day 4 (Hero Development):</strong> ${day4.toLocaleString()}</li>
        <li><strong>Day 5 (Power Boost):</strong> ${day5.toLocaleString()}</li>
      </ul>
    </div>
  `;

  resultEl.innerHTML = resultsHTML;
}

function importSvSData() {
  console.log("Import SVS Data (All) triggered.");
  importSvSBuildings();
  importSvSResearch();
  importSvSPets();
  importSvSCharms();
  importSvSGear();
  importSvSExperts();
  importSvSTroops();
  alert("Import All triggered. Logic will be wired up once values and calculations are finalized. Currently, no data was found or all values were 0.");
}

function handleImportStub(sectionName) {
  console.log(`Import ${sectionName} triggered.`);
  alert(`Import ${sectionName} successful, but no data was available (or all values were 0). Make sure you have entered data in the ${sectionName} calculator first.`);
}

function importSvSBuildings() {
  console.log("Import Buildings triggered.");
  const account = getActiveAccount();
  const upgradeState = getUpgradeStateFromAccount(account);

  if (!upgradeState || !upgradeState.building) {
    alert("No building data found to import. Please visit the Upgrade calculator first.");
    return;
  }

  const { building: targetBuilding, currentLevel, targetLevel, prereqState, optionalBuildings } = upgradeState;
  const buildingsToCalc = [{ building: targetBuilding, currentLevel, targetLevel }];

  const prereqMap = getAggregatedPrerequisites(targetBuilding, currentLevel, targetLevel);
  for (const [bName, reqLvl] of prereqMap.entries()) {
    if (!BUILDING_COSTS[bName]) continue;
    
    const savedForTarget = prereqState?.[targetBuilding]?.[bName];
    const prereqLevels = getBuildingLevelOrder(bName);
    
    const curLvl = savedForTarget?.currentLevel || prereqLevels[0];
    const reqLvlStr = String(reqLvl);
    const tgtLvl = savedForTarget?.targetLevel || (prereqLevels.includes(reqLvlStr) ? reqLvlStr : prereqLevels[prereqLevels.length - 1]);
    
    const curIdx = prereqLevels.indexOf(curLvl);
    const tgtIdx = prereqLevels.indexOf(tgtLvl);
    const safeTgt = (tgtIdx >= curIdx && tgtIdx >= 0) ? tgtLvl : curLvl;
    
    buildingsToCalc.push({ building: bName, currentLevel: curLvl, targetLevel: safeTgt });
  }

  if (optionalBuildings) {
    for (const opt of optionalBuildings) {
      const optLevels = getBuildingLevelOrder(opt.building);
      const optCurIdx = optLevels.indexOf(opt.currentLevel);
      const optTgtIdx = optLevels.indexOf(opt.targetLevel);
      if (optCurIdx >= 0 && optTgtIdx >= 0 && optCurIdx < optTgtIdx) {
        buildingsToCalc.push({ building: opt.building, currentLevel: opt.currentLevel, targetLevel: opt.targetLevel });
      }
    }
  }

  let totalFC = 0;
  let totalRFC = 0;
  let totalSeconds = 0;

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    if (!BUILDING_COSTS[building]) continue;

    const path = getUpgradePathKeys(building, curLvl, tgtLvl);
    for (const level of path) {
      const lvlData = BUILDING_COSTS[building][level];
      if (!lvlData) continue;
      totalFC += lvlData.fireCrystals || 0;
      totalRFC += lvlData.refinedFireCrystals || 0;
      totalSeconds += lvlData.seconds || 0;
    }
  }

  if (totalFC === 0 && totalRFC === 0 && totalSeconds === 0) {
    alert("Import successful, but calculated building costs were 0. Ensure your target levels are higher than current levels.");
    return;
  }

  const fcEl1 = document.getElementById("svsD1_FC");
  const rfcEl1 = document.getElementById("svsD1_RefinedFC");
  const speedupsEl1 = document.getElementById("svsD1_Speedups");
  const fcEl2 = document.getElementById("svsD2_FC");
  const rfcEl2 = document.getElementById("svsD2_RefinedFC");
  const speedupsEl2 = document.getElementById("svsD2_Speedups");
  const fcEl5 = document.getElementById("svsD5_FC");
  const rfcEl5 = document.getElementById("svsD5_RefinedFC");
  const speedupsEl5 = document.getElementById("svsD5_Speedups");

  if (fcEl1) fcEl1.value = totalFC;
  if (rfcEl1) rfcEl1.value = totalRFC;
  if (speedupsEl1) speedupsEl1.value = Math.ceil(totalSeconds / 60);

  if (fcEl2) fcEl2.value = totalFC;
  if (rfcEl2) rfcEl2.value = totalRFC;
  if (speedupsEl2) speedupsEl2.value = Math.ceil(totalSeconds / 60);

  if (fcEl5) fcEl5.value = totalFC;
  if (rfcEl5) rfcEl5.value = totalRFC;
  if (speedupsEl5) speedupsEl5.value = Math.ceil(totalSeconds / 60);

  calculateSvSPoints();
  alert(`Imported ${totalFC} Fire Crystals, ${totalRFC} Refined FC, and ${Math.ceil(totalSeconds/60)}m of Construction Speedups to Day 1, Day 2, and Day 5.`);
}
function importSvSResearch() {
  alert("The Research calculator hasn't been built yet, so there is no data to import!");
}

function importSvSPets() {
  console.log("Import Pets triggered.");
  const account = getActiveAccount();
  if (!account || !account.calculators || !account.calculators.pets || !account.calculators.pets.petTargets) {
    alert("No Pet data found to import. Please visit the Pets calculator first.");
    return;
  }

  const petState = account.calculators.pets;
  const petTargetsMap = petState.petTargets;
  const petCurrentsMap = petState.petCurrents || {};

  const targets = [];
  Object.keys(petTargetsMap).forEach(petName => {
    const curLevel = petCurrentsMap[petName];
    const tgtLevel = petTargetsMap[petName];
    if (curLevel && tgtLevel) {
      const petData = PET_UPGRADES.pets[petName];
      if (petData) {
        let upgrades = petData.customUpgrades || PET_UPGRADES.tiers[petData.tier]?.upgrades || [];
        const startIdx = upgrades.findIndex(u => u.level === curLevel);
        const endIdx = upgrades.findIndex(u => u.level === tgtLevel);
        if (startIdx >= 0 && endIdx >= 0 && startIdx < endIdx) {
          targets.push({ name: petName, startIdx, endIdx });
        }
      }
    }
  });

  if (targets.length === 0) {
    alert("Import successful, but no pet upgrades were found. Ensure target levels are higher than current levels.");
    return;
  }

  const grandTotal = calculateMultiPetUpgrade(targets);
  const scoreDiff = grandTotal.svsPoints || 0;

  if (scoreDiff === 0) {
    alert("Calculated Pet Advancement Score difference was 0.");
    return;
  }

  const petAdvEl3 = document.getElementById("svsD3_PetAdv");
  const petAdvEl5 = document.getElementById("svsD5_PetAdv");
  if (petAdvEl3) petAdvEl3.value = scoreDiff;
  if (petAdvEl5) petAdvEl5.value = scoreDiff;

  calculateSvSPoints();
  alert(`Imported a Pet Advancement Score increase of ${scoreDiff} to Day 3 and Day 5.`);
}

function importSvSCharms() {
  console.log("Import Charms triggered.");
  const account = getActiveAccount();
  const state = account?.calculators?.chiefCharm;
  if (!state || !state.levels) {
    alert("No Chief Charm data found to import. Please visit the Chief Charm calculator first.");
    return;
  }
  
  let totalScoreDiff = 0;
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentKey = state.levels[slot.slotKey]?.current || "none";
    const targetKey = state.levels[slot.slotKey]?.target || "none";
    const levelKeyToIndex = {};
    if (CHIEF_CHARM_DATA && CHIEF_CHARM_DATA.levelOrder) {
      CHIEF_CHARM_DATA.levelOrder.forEach((k, idx) => { levelKeyToIndex[k] = idx; });
      const currentIdx = levelKeyToIndex[currentKey] || -1;
      const targetIdx = levelKeyToIndex[targetKey] || -1;
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const levelKey = CHIEF_CHARM_DATA.levelOrder[i];
        totalScoreDiff += getSvsPointsForUpgrade(levelKey) / 70;
      }
    }
  });

  if (totalScoreDiff === 0) {
    alert("Import successful, but calculated Charm Score difference was 0. Ensure target levels are higher than current levels.");
    return;
  }

  const d1 = document.getElementById("svsD1_Charm");
  const d3 = document.getElementById("svsD3_Charm");
  const d4 = document.getElementById("svsD4_Charm");
  if (d1) d1.value = totalScoreDiff;
  if (d3) d3.value = totalScoreDiff;
  if (d4) d4.value = totalScoreDiff;

  calculateSvSPoints();
  alert(`Imported a Chief Charm Score increase of ${totalScoreDiff} to Days 1, 3, and 4.`);
}

function importSvSGear() {
  console.log("Import Gear triggered.");
  const account = getActiveAccount();
  const state = account?.calculators?.chiefGear;
  if (!state || !state.levels) {
    alert("No Chief Gear data found to import. Please visit the Chief Gear calculator first.");
    return;
  }

  let totalScoreDiff = 0;
  GEAR_SLOTS.forEach(slot => {
    const currentKey = state.levels[slot]?.current || "none";
    const targetKey = state.levels[slot]?.target || "none";
    const levelKeyToIndex = {};
    if (CHIEF_GEAR_DATA && CHIEF_GEAR_DATA.levelOrder) {
      CHIEF_GEAR_DATA.levelOrder.forEach((k, idx) => { levelKeyToIndex[k] = idx; });
      const currentIdx = levelKeyToIndex[currentKey] || -1;
      const targetIdx = levelKeyToIndex[targetKey] || -1;
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const levelKey = CHIEF_GEAR_DATA.levelOrder[i];
        const levelInfo = CHIEF_GEAR_DATA.levels[levelKey];
        if (levelInfo && !levelInfo.isCharm) {
          totalScoreDiff += getGearSvsPoints(levelInfo.tier, levelInfo.stars);
        }
      }
    }
  });

  if (totalScoreDiff === 0) {
    alert("Import successful, but calculated Gear Score difference was 0. Ensure target levels are higher than current levels.");
    return;
  }

  const gearEl = document.getElementById("svsD5_GearScore");
  if (gearEl) gearEl.value = totalScoreDiff;

  calculateSvSPoints();
  alert(`Imported a Chief Gear Score increase of ${totalScoreDiff} to Day 5.`);
}

function importSvSExperts() {
  alert("The Experts calculator does not currently map its outputs (Affinity/General Sigils) to SvS Hero fields (Rare/Epic/Mythic Shards). This data cannot be imported directly yet.");
}

function importSvSTroops() {
  alert("The Troops calculator hasn't been built yet, so there is no data to import!");
}

function initExpertSkillsPanel() {
  const container = document.getElementById("expertSkillCollectionContainer");
  if (!container || !EXPERTS_DATA) return;

  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];
  let html = "";

  EXPERT_ORDER.forEach(name => {
    const key = name.toLowerCase();
    const localizedName = translateText(`expert.${key}`, {}, name);

    html += `
      <div class="card-panel expert-skill-card" data-expert="${name}" style="display: flex; flex-direction: column; gap: 12px; padding: 16px;">
        <div class="expert-skill-name-row" style="border-bottom: 1px solid var(--glass-border); padding-bottom: 8px; font-weight: 600; font-size: 1.1em; text-align: center;">${escapeHtml(localizedName)}</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; text-align: center; font-size: 0.85em; color: var(--text-secondary); margin-bottom: 4px;">
          <span>Skill</span><span>Current</span><span>Target</span>
        </div>
        
        <div class="expert-skill-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: center;">
          <span class="expert-skill-label" style="font-size: 0.9em;">${translateText("labels.skill1", {}, "Skill 1")}</span>
          <select class="skill-current-select global-select" data-expert="${name}" data-skill="1"></select>
          <select class="skill-target-select global-select" data-expert="${name}" data-skill="1"></select>
        </div>
        <div class="expert-skill-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: center;">
          <span class="expert-skill-label" style="font-size: 0.9em;">${translateText("labels.skill2", {}, "Skill 2")}</span>
          <select class="skill-current-select global-select" data-expert="${name}" data-skill="2"></select>
          <select class="skill-target-select global-select" data-expert="${name}" data-skill="2"></select>
        </div>
        <div class="expert-skill-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: center;">
          <span class="expert-skill-label" style="font-size: 0.9em;">${translateText("labels.skill3", {}, "Skill 3")}</span>
          <select class="skill-current-select global-select" data-expert="${name}" data-skill="3"></select>
          <select class="skill-target-select global-select" data-expert="${name}" data-skill="3"></select>
        </div>
        <div class="expert-skill-row" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; align-items: center;">
          <span class="expert-skill-label" style="font-size: 0.9em;">${translateText("labels.skill4", {}, "Skill 4")}</span>
          <select class="skill-current-select global-select" data-expert="${name}" data-skill="4"></select>
          <select class="skill-target-select global-select" data-expert="${name}" data-skill="4"></select>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;

  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData || !expertData.levels) return;

    [1, 2, 3, 4].forEach(skill => {
      const skillArr = expertData.skills[skill.toString()];
      let sHtml = `<option value="-1">${translateText("labels.notObtained", {}, "Not Obtained")}</option>`;
      if (skillArr) {
        for (let i = 0; i < skillArr.length; i++) {
          const sLvl = skillArr[i].level;
          const sRel = skillArr[i].relationship;
          const reqStr = (sRel && sRel !== '-') ? ` (Req: ${sRel})` : '';
          sHtml += `<option value="${sLvl}" data-req="${sRel}">Lv.${sLvl}${reqStr}</option>`;
        }
      } else {
        sHtml = `<option value="1">Lv.1</option>`;
      }
      const sCur = container.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${skill}"]`);
      const sTgt = container.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${skill}"]`);
      if (sCur) sCur.innerHTML = sHtml;
      if (sTgt) sTgt.innerHTML = sHtml;
    });
  });

  const batchCurrent = document.getElementById("setAllExpertSkillCurrent");
  const batchTarget = document.getElementById("setAllExpertSkillTarget");
  if (batchCurrent && batchTarget && EXPERTS_DATA["Agnes"]) {
    let optionsHTML = `<option value="-1">${translateText("labels.notObtained", {}, "Not Obtained")}</option>`;
    const skillArr = EXPERTS_DATA["Agnes"].skills["1"];
    if (skillArr) {
      for (let i = 0; i < skillArr.length; i++) {
        const sLvl = skillArr[i].level;
        optionsHTML += `<option value="${sLvl}">Lv.${sLvl}</option>`;
      }
    }
    batchCurrent.innerHTML = optionsHTML;
    batchTarget.innerHTML = optionsHTML;
  }

  document.getElementById("setAllExpertSkillCurrentBtn")?.addEventListener("click", () => {
    const val = document.getElementById("setAllExpertSkillCurrent")?.value;
    if (val) {
      document.querySelectorAll(".skill-current-select").forEach(sel => {
        sel.value = val;
        const name = sel.dataset.expert;
        const s = sel.dataset.skill;
        const tgtSel = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
        if (tgtSel && parseInt(tgtSel.value) < parseInt(val)) tgtSel.value = val;
      });
      saveExpertsState();
    }
  });

  document.getElementById("setAllExpertSkillTargetBtn")?.addEventListener("click", () => {
    const val = document.getElementById("setAllExpertSkillTarget")?.value;
    if (val) {
      document.querySelectorAll(".skill-target-select").forEach(sel => {
        const name = sel.dataset.expert;
        const s = sel.dataset.skill;
        const curSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
        if (curSel && parseInt(curSel.value) > parseInt(val)) {
        } else {
          sel.value = val;
        }
      });
      saveExpertsState();
    }
  });

  document.querySelectorAll(".skill-current-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const name = e.target.dataset.expert;
      const s = e.target.dataset.skill;
      const tgtSel = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
      if (tgtSel && parseInt(tgtSel.value) < parseInt(e.target.value)) tgtSel.value = e.target.value;
      saveExpertsState();
    });
  });

  document.querySelectorAll(".skill-target-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const name = e.target.dataset.expert;
      const s = e.target.dataset.skill;
      const curSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
      if (curSel && parseInt(curSel.value) > parseInt(e.target.value)) e.target.value = curSel.value;
      saveExpertsState();
    });
  });

  document.getElementById("expertSkillsCalculateBtn")?.addEventListener("click", calculateExpertSkills);
  document.getElementById("expertSkillsSmartUpgradeBtn")?.addEventListener("click", onExpertSkillsSmartUpgradeClick);

  ["expertSkillExp", "expertSkillBooks"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", saveExpertsState);
  });

  loadExpertsState();
}

function calculateExpertSkills() {
  if (!EXPERTS_DATA) return;

  let totalSkillExpNeeded = 0;
  let totalSkillBooksNeeded = 0;
  let resultsHTML = "";

  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];

  // Read affinity state
  const account = getActiveAccount();
  const expertsState = (account && account.calculators && account.calculators.experts) ? account.calculators.experts : { levels: {} };

  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData) return;

    let skillExp = 0;
    let skillBooks = 0;
    
    // Evaluate if affinity prerequisite is met
    const curAffinityLevel = expertsState.levels[name]?.current ? parseInt(expertsState.levels[name].current) : 1;

    let expertWarnings = [];

    [1, 2, 3, 4].forEach(s => {
      const sCurSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
      const sTgtSel = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
      
      if (sCurSel && sTgtSel) {
        const sc = parseInt(sCurSel.value) || 1;
        const st = parseInt(sTgtSel.value) || 1;
        if (sc === -1) return;
        
        // Check affinity requirement for target skill
        const opt = sTgtSel.options[sTgtSel.selectedIndex];
        const reqRel = opt?.dataset?.req;
        if (reqRel && reqRel !== '-' && reqRel !== '') {
            const reqLevel = getLevelForRelationship(name, reqRel);
            if (curAffinityLevel < reqLevel) {
                expertWarnings.push(`Skill ${s} Target Lv.${st} requires Affinity ${reqRel} (Lv.${reqLevel}). Current is Lv.${curAffinityLevel}.`);
            }
        }

        if (sc < st) {
          const sArr = expertData.skills[s.toString()];
          if (sArr) {
            for (let sl = sc + 1; sl <= st; sl++) {
              const row = sArr.find(r => r.level === sl);
              if (row) {
                skillExp += (row.exp || 0);
                skillBooks += (row.book || 0);
              }
            }
          }
        }
      }
    });

    totalSkillExpNeeded += skillExp;
    totalSkillBooksNeeded += skillBooks;

    if (skillExp > 0 || skillBooks > 0 || expertWarnings.length > 0) {
      const localizedName = translateText(`expert.${name.toLowerCase()}`, {}, name);
      resultsHTML += `
        <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,165,0,0.5);">
          <strong>${escapeHtml(localizedName)}</strong><br>
          ${expertWarnings.map(w => `<div style="color: orange; font-size: 0.9em;">&#9888; ${w}</div>`).join("")}
          ${skillExp > 0 ? `${translateText("labels.skillExp", {}, "Learning Speedups Needed")}: ${formatDuration(skillExp)} <br>` : ""}
          ${skillBooks > 0 ? `${translateText("labels.skillBooks", {}, "Skill Books Needed")}: ${skillBooks.toLocaleString()} <br>` : ""}
        </div>
      `;
    }
  });

  const invSkillExpSeconds = (parseInt(document.getElementById("expertSkillExp")?.value) || 0) * 60;
  const invSkillBooks = parseInt(document.getElementById("expertSkillBooks")?.value) || 0;

  const remainingSkillExpSeconds = Math.max(0, totalSkillExpNeeded - invSkillExpSeconds);
  const remainingSkillBooks = Math.max(0, totalSkillBooksNeeded - invSkillBooks);

  let grandTotalHTML = `
    <div class="card-panel" style="margin-top: 15px;">
      <strong>${translateText("results.grandTotal", {}, "GRAND TOTAL")}</strong><br>
      ${translateText("labels.skillExp", {}, "Total Learning Speedups Required")}: ${formatDuration(totalSkillExpNeeded)}<br>
      ${translateText("labels.skillBooks", {}, "Total Skill Books Required")}: ${totalSkillBooksNeeded.toLocaleString()}<br><br>
      
      <strong>${translateText("results.afterInventory", {}, "Remaining After Inventory")}</strong><br>
      ${translateText("labels.remainingSkillExp", {}, "Learning Speedups Needed")}: ${formatDuration(remainingSkillExpSeconds)}<br>
      ${translateText("labels.remainingSkillBooks", {}, "Skill Books Needed")}: ${remainingSkillBooks.toLocaleString()}
    </div>
  `;

  if (totalSkillExpNeeded === 0 && totalSkillBooksNeeded === 0) {
    resultsHTML += `<div class="card-panel" style="margin-top: 15px;">${translateText("results.noUpgrades", {}, "No upgrades selected or already at target level.")}</div>`;
  } else {
    resultsHTML += grandTotalHTML;
  }

  const resultEl = document.getElementById("expertSkillsResult");
  if (resultEl) {
    resultEl.dataset.hasResults = "true";
    resultEl.innerHTML = resultsHTML;
  }
}
function onExpertSmartUpgradeClick() {
  if (!EXPERTS_DATA) return;
  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];

  let commonSigils = parseInt(document.getElementById("expertAdvancementSigils")?.value) || 0;
  const invCompass = parseInt(document.getElementById("expertCompass")?.value) || 0;
  const invFieryHeart = parseInt(document.getElementById("expertFieryHeart")?.value) || 0;
  const invSail = parseInt(document.getElementById("expertSailOfConquest")?.value) || 0;
  let totalAffinity = (invCompass * 10) + (invFieryHeart * 100) + (invSail * 1000);

  const currentStates = [];
  EXPERT_ORDER.forEach(name => {
    const currentSel = document.querySelector(`.expert-current-select[data-expert="${name}"]`);
    if (!currentSel) return;
    const curLvl = parseInt(currentSel.value) || 1;
    if (curLvl === -1) return; // Skip Not Obtained
    
    const specSigilsInp = document.querySelector(`.expert-specific-sigils[data-expert="${name}"]`);
    const specSigilsAvail = parseInt(specSigilsInp?.value) || 0;

    const expertData = EXPERTS_DATA[name];
    if (expertData && expertData.levels) {
      currentStates.push({
        name,
        upgrades: expertData.levels,
        startIndex: expertData.levels.findIndex(l => l.level === curLvl),
        currentIndex: expertData.levels.findIndex(l => l.level === curLvl),
        specificSigils: specSigilsAvail
      });
    }
  });

  let upgradesDone = 0;
  while (true) {
    let bestExpert = null;
    let minCostValue = Infinity;

    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        const affinityCost = next.affinity || 0;
        const sigilCost = next.advancement || 0;
        
        const commonCost = Math.max(0, sigilCost - state.specificSigils);
        
        if (affinityCost <= totalAffinity && commonCost <= commonSigils) {
          const costValue = affinityCost + commonCost * 100; // Prefer lower affinity and common sigil usage
          if (costValue < minCostValue) {
            minCostValue = costValue;
            bestExpert = state;
          }
        }
      }
    });

    if (!bestExpert) break;

    const next = bestExpert.upgrades[bestExpert.currentIndex + 1];
    const affinityCost = next.affinity || 0;
    const sigilCost = next.advancement || 0;
    const commonCost = Math.max(0, sigilCost - bestExpert.specificSigils);

    totalAffinity -= affinityCost;
    commonSigils -= commonCost;
    bestExpert.specificSigils = Math.max(0, bestExpert.specificSigils - sigilCost);
    bestExpert.currentIndex++;
    upgradesDone++;
  }

  // Apply back to UI
  currentStates.forEach(state => {
    if (state.currentIndex > state.startIndex) {
      const targetSel = document.querySelector(`.expert-target-select[data-expert="${state.name}"]`);
      if (targetSel) {
        targetSel.value = state.upgrades[state.currentIndex].level;
      }
    }
  });

  if (upgradesDone > 0) {
    saveExpertsState();
    calculateExperts();
    alert(translateText("results.smartUpgradeCompleteMsg", { count: upgradesDone }, `Smart Upgrade complete! Optimized targets set. (${upgradesDone} upgrades simulated)`));
  } else {
    alert(translateText("results.noUpgradesPossible", {}, "No upgrades possible with current materials."));
  }
}

function onExpertSkillsSmartUpgradeClick() {
  if (!EXPERTS_DATA) return;
  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];

  let invSkillExpSeconds = (parseInt(document.getElementById("expertSkillExp")?.value) || 0) * 60;
  let invSkillBooks = parseInt(document.getElementById("expertSkillBooks")?.value) || 0;

  // Need affinity bounds for skills
  const account = getActiveAccount();
  const expertsState = (account && account.calculators && account.calculators.experts) ? account.calculators.experts : { levels: {} };

  const currentStates = [];
  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData) return;
    const curAffinityLevel = expertsState.levels[name]?.current ? parseInt(expertsState.levels[name].current) : 1;

    [1, 2, 3, 4].forEach(s => {
      const curSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
      if (curSel) {
        const sc = parseInt(curSel.value) || 1;
        if (sc !== -1) {
          const skillArr = expertData.skills[s.toString()];
          if (skillArr) {
            currentStates.push({
              name,
              skill: s,
              upgrades: skillArr,
              startIndex: skillArr.findIndex(l => l.level === sc),
              currentIndex: skillArr.findIndex(l => l.level === sc),
              maxAffinity: curAffinityLevel
            });
          }
        }
      }
    });
  });

  let upgradesDone = 0;
  while (true) {
    let bestSkill = null;
    let minCostValue = Infinity;

    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        
        // Check affinity requirement
        const reqRel = next.relationship;
        let reqLevel = 1;
        if (reqRel && reqRel !== '-' && reqRel !== '') {
          reqLevel = getLevelForRelationship(state.name, reqRel);
        }

        if (state.maxAffinity >= reqLevel) {
          const expCost = next.exp || 0;
          const bookCost = next.book || 0;
          
          if (expCost <= invSkillExpSeconds && bookCost <= invSkillBooks) {
            const costValue = expCost + (bookCost * 50); // Weighted cost
            if (costValue < minCostValue) {
              minCostValue = costValue;
              bestSkill = state;
            }
          }
        }
      }
    });

    if (!bestSkill) break;

    const next = bestSkill.upgrades[bestSkill.currentIndex + 1];
    invSkillExpSeconds -= (next.exp || 0);
    invSkillBooks -= (next.book || 0);
    bestSkill.currentIndex++;
    upgradesDone++;
  }

  // Apply back to UI
  currentStates.forEach(state => {
    if (state.currentIndex > state.startIndex) {
      const targetSel = document.querySelector(`.skill-target-select[data-expert="${state.name}"][data-skill="${state.skill}"]`);
      if (targetSel) {
        targetSel.value = state.upgrades[state.currentIndex].level;
      }
    }
  });

  if (upgradesDone > 0) {
    saveExpertsState();
    calculateExpertSkills();
    alert(translateText("results.smartUpgradeCompleteMsg", { count: upgradesDone }, `Smart Upgrade complete! Optimized targets set. (${upgradesDone} upgrades simulated)`));
  } else {
    alert(translateText("results.noUpgradesPossible", {}, "No upgrades possible with current materials."));
  }
}



// Auto-calc poller for initial load
let initialCalcDone = false;
setInterval(() => {
  if (initialCalcDone) return;
  if (typeof BUILDING_COSTS !== 'undefined' && BUILDING_COSTS && Object.keys(BUILDING_COSTS).length > 0) {
    initialCalcDone = true;
    if (document.getElementById('upgradeCalculatorPanel') && typeof onUpgradeCalculateClick === 'function') onUpgradeCalculateClick();
    if (document.getElementById('gearPanel') && typeof onGearCalculateClick === 'function') onGearCalculateClick();
    if (document.getElementById('charmPanel') && typeof onCharmCalculateClick === 'function') onCharmCalculateClick();
    if (document.getElementById('petsPanel') && typeof onPetsCalculateClick === 'function') onPetsCalculateClick();
    if (document.getElementById('expertsPanel') && typeof calculateExperts === 'function') calculateExperts();
    if (document.getElementById('expertSkillsPanel') && typeof calculateExpertSkills === 'function') calculateExpertSkills();
  }
}, 200);