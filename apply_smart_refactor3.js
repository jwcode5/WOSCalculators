const fs = require('fs');

const overrides = `
// ==========================================
// OVERRIDES REVERT: OPTIMIZED PLAN USES CURRENT LEVELS AND TOTAL RESOURCES
// ==========================================

// --- PETS ---
window.calculatePetsOptimizedPlan = function() {
  const materials = {
    petFood: parseInt(document.getElementById("petFoodInput")?.value) || 0,
    tamingManual: parseInt(document.getElementById("tamingManualInput")?.value) || 0,
    energizingPotion: parseInt(document.getElementById("energizingPotionInput")?.value) || 0,
    strengtheningSerum: parseInt(document.getElementById("strengtheningSerumInput")?.value) || 0
  };

  const currentStates = [];
  PET_ORDER.forEach(name => {
    const row = document.querySelector(\`.pet-row[data-pet="\${name}"]\`);
    if (row) {
      const petData = PET_UPGRADES.pets[name];
      let upgrades = [];
      if (petData.customUpgrades) upgrades = petData.customUpgrades;
      else if (PET_UPGRADES.tiers[petData.tier]) upgrades = PET_UPGRADES.tiers[petData.tier].upgrades;
      
      const startIdx = parseInt(row.querySelector(".pet-current-select").value);
      if (startIdx === -1) return;
      
      currentStates.push({ name, upgrades, startIndex: startIdx, currentIndex: startIdx });
    }
  });

  const used = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };

  while (true) {
    let bestPet = null;
    let minCostValue = Infinity;
    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        const costValue = (next.petFood || 0) + (next.tamingManual || 0) * 10 + (next.energizingPotion || 0) * 50 + (next.strengtheningSerum || 0) * 200;
        if (costValue < minCostValue &&
            materials.petFood >= (next.petFood || 0) && materials.tamingManual >= (next.tamingManual || 0) &&
            materials.energizingPotion >= (next.energizingPotion || 0) && materials.strengtheningSerum >= (next.strengtheningSerum || 0)) {
          minCostValue = costValue; bestPet = state;
        }
      }
    });

    if (bestPet) {
      const next = bestPet.upgrades[bestPet.currentIndex + 1];
      materials.petFood -= (next.petFood || 0); materials.tamingManual -= (next.tamingManual || 0);
      materials.energizingPotion -= (next.energizingPotion || 0); materials.strengtheningSerum -= (next.strengtheningSerum || 0);
      used.petFood += (next.petFood || 0); used.tamingManual += (next.tamingManual || 0);
      used.energizingPotion += (next.energizingPotion || 0); used.strengtheningSerum += (next.strengtheningSerum || 0);
      used.svsPoints += (next.svsPoints || 0);
      bestPet.currentIndex++;
    } else {
      break;
    }
  }

  const upgradedPets = currentStates.filter(s => s.currentIndex > s.startIndex);
  if (upgradedPets.length > 0) {
    const breakdown = upgradedPets.map(s => {
      const subTotal = { petFood: 0, tamingManual: 0, energizingPotion: 0, strengtheningSerum: 0, svsPoints: 0 };
      for (let i = s.startIndex + 1; i <= s.currentIndex; i++) {
        const u = s.upgrades[i];
        subTotal.petFood += (u.petFood || 0); subTotal.tamingManual += (u.tamingManual || 0);
        subTotal.energizingPotion += (u.energizingPotion || 0); subTotal.strengtheningSerum += (u.strengtheningSerum || 0);
        subTotal.svsPoints += (u.svsPoints || 0);
      }
      return { name: s.name, startLevel: s.upgrades[s.startIndex].level, endLevel: s.upgrades[s.currentIndex].level, totals: subTotal };
    });
    return { grandTotal: used, petBreakdown: breakdown };
  }
  return null;
};

window.onPetsCalculateClick = function() {
  try {
    const targets = [];
    PET_ORDER.forEach(name => {
      const row = document.querySelector(\`.pet-row[data-pet="\${name}"]\`);
      if (row) {
        const startIdx = parseInt(row.querySelector(".pet-current-select").value);
        const endIdx = parseInt(row.querySelector(".pet-target-select").value);
        if (endIdx > startIdx) targets.push({ name, startIdx, endIdx });
      }
    });

    const resEl = document.getElementById("petsResult");
    if (!resEl) return;

    const result = targets.length > 0 ? calculateMultiPetUpgrade(targets) : null;
    const optimized = calculatePetsOptimizedPlan(); // Using full inventory and current levels
    renderPetsResult(result, optimized);
  } catch(err) {
    const resEl = document.getElementById("petsResult");
    if (resEl) {
      resEl.innerHTML = \`<div style="color:red; padding:20px;">Error calculating pets: \${err.message}<br>\${err.stack}</div>\`;
      resEl.style.display = "block";
    }
  }
};
onPetsCalculateClick = window.onPetsCalculateClick;

// --- EXPERT LEVELS ---
window.calculateExpertsOptimizedPlan = function() {
  if (!EXPERTS_DATA) return null;
  const EXPERT_ORDER = Object.keys(EXPERTS_DATA);
  let commonSigils = parseInt(document.getElementById("expertAdvancementSigils")?.value) || 0;
  const invCompass = parseInt(document.getElementById("expertCompass")?.value) || 0;
  const invFieryHeart = parseInt(document.getElementById("expertFieryHeart")?.value) || 0;
  const invSail = parseInt(document.getElementById("expertSailOfConquest")?.value) || 0;
  let totalAffinity = (invCompass * 10) + (invFieryHeart * 100) + (invSail * 1000);
  
  const currentStates = [];
  EXPERT_ORDER.forEach(name => {
    const currentSel = document.querySelector(\`.expert-current-select[data-expert="\${name}"]\`);
    if (!currentSel) return;
    const startIdxRaw = parseInt(currentSel.value) || 1;
    if (startIdxRaw === -1) return;
    
    const specSigilsInp = document.querySelector(\`.expert-specific-sigils[data-expert="\${name}"]\`);
    const specSigilsAvail = parseInt(specSigilsInp?.value) || 0;

    const expertData = EXPERTS_DATA[name];
    if (expertData && expertData.levels) {
      currentStates.push({
        name, upgrades: expertData.levels,
        startIndex: expertData.levels.findIndex(l => l.level === startIdxRaw),
        currentIndex: expertData.levels.findIndex(l => l.level === startIdxRaw),
        specificSigils: specSigilsAvail
      });
    }
  });

  let totalAffinityUsed = 0;
  let totalSigilsUsed = 0;

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
          const costValue = affinityCost + commonCost * 100;
          if (costValue < minCostValue) {
            minCostValue = costValue; bestExpert = state;
          }
        }
      }
    });

    if (!bestExpert) break;

    const next = bestExpert.upgrades[bestExpert.currentIndex + 1];
    const affinityCost = next.affinity || 0;
    const sigilCost = next.advancement || 0;
    
    totalAffinity -= affinityCost;
    totalAffinityUsed += affinityCost;
    
    if (bestExpert.specificSigils >= sigilCost) {
      bestExpert.specificSigils -= sigilCost;
    } else {
      const remainder = sigilCost - bestExpert.specificSigils;
      bestExpert.specificSigils = 0;
      commonSigils -= remainder;
      totalSigilsUsed += remainder;
    }
    bestExpert.currentIndex++;
  }

  const upgraded = currentStates.filter(s => s.currentIndex > s.startIndex);
  if (upgraded.length > 0) {
    return {
      breakdown: upgraded.map(s => ({
        name: s.name,
        startLevel: s.upgrades[s.startIndex].level,
        endLevel: s.upgrades[s.currentIndex].level
      })),
      totalAffinityUsed,
      totalSigilsUsed
    };
  }
  return null;
};

window.calculateExperts = function() {
  if (!EXPERTS_DATA) return;

  let totalAffinityNeeded = 0;
  let totalGeneralSigilsNeeded = 0; // After using specific sigils
  let resultsHTML = "";
  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];

  EXPERT_ORDER.forEach(name => {
    const currentSel = document.querySelector(\`.expert-current-select[data-expert="\${name}"]\`);
    const targetSel = document.querySelector(\`.expert-target-select[data-expert="\${name}"]\`);
    const specSigilsInp = document.querySelector(\`.expert-specific-sigils[data-expert="\${name}"]\`);
    
    if (!currentSel || !targetSel) return;

    const curLvl = parseInt(currentSel.value) || 1;
    const tgtLvl = parseInt(targetSel.value) || 1;
    
    if (curLvl === -1) return;
    let specSigilsAvail = parseInt(specSigilsInp?.value) || 0;

    const expertData = EXPERTS_DATA[name];
    if (!expertData || !expertData.levels) return;

    let affinity = 0;
    let sigils = 0;
    if (curLvl < tgtLvl) {
      for (let l = curLvl + 1; l <= tgtLvl; l++) {
        const row = expertData.levels.find(r => r.level === l);
        if (row) {
          affinity += (row.affinity || 0);
          sigils += (row.advancement || 0);
        }
      }
    }
    
    let remainingSigilsForExpert = sigils;
    if (specSigilsAvail >= remainingSigilsForExpert) {
      remainingSigilsForExpert = 0;
    } else {
      remainingSigilsForExpert -= specSigilsAvail;
    }

    totalAffinityNeeded += affinity;
    totalGeneralSigilsNeeded += remainingSigilsForExpert;
    if (affinity > 0 || sigils > 0 ) {
      const localizedName = translateText(\`expert.\${name.toLowerCase()}\`, {}, name);
      resultsHTML += \`
        <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);">
          <strong>\${escapeHtml(localizedName)}</strong><br>
          \${affinity > 0 ? \`\${translateText("labels.affinity", {}, "Affinity Needed")}: \${affinity.toLocaleString()} <br>\` : ""}
          \${sigils > 0 ? \`\${translateText("labels.advancementSigils", {}, "Advancement Sigils Needed")}: \${sigils.toLocaleString()} (After Specific Sigils: \${remainingSigilsForExpert.toLocaleString()})<br>\` : ""}
        </div>
      \`;
    }
  });

  const invGenSigils = parseInt(document.getElementById("expertAdvancementSigils")?.value) || 0;
  const invCompass = parseInt(document.getElementById("expertCompass")?.value) || 0;
  const invFieryHeart = parseInt(document.getElementById("expertFieryHeart")?.value) || 0;
  const invSail = parseInt(document.getElementById("expertSailOfConquest")?.value) || 0;
  
  const totalInvAffinity = (invCompass * 10) + (invFieryHeart * 100) + (invSail * 1000);

  const remainingAffinity = Math.max(0, totalInvAffinity - totalAffinityNeeded);
  const remainingGenSigils = Math.max(0, invGenSigils - totalGeneralSigilsNeeded);

  let grandTotalHTML = \`
    <div class="card-panel" style="margin-top: 15px;">
      <strong>\${translateText("results.grandTotal", {}, "TARGET UPGRADES TOTAL")}</strong><br>
      \${translateText("labels.totalAffinity", {}, "Total Affinity Required")}: \${totalAffinityNeeded.toLocaleString()}<br>
      \${translateText("labels.totalSigils", {}, "Total General Sigils Required")}: \${totalGeneralSigilsNeeded.toLocaleString()}<br>
      <br>
      <strong>\${translateText("results.afterInventory", {}, "Remaining After Upgrades")}</strong><br>
      \${translateText("labels.remainingAffinity", {}, "Affinity Left")}: \${remainingAffinity.toLocaleString()}<br>
      \${translateText("labels.remainingSigils", {}, "General Sigils Left")}: \${remainingGenSigils.toLocaleString()}<br>
    </div>
  \`;

  if (totalAffinityNeeded === 0 && totalGeneralSigilsNeeded === 0 ) {
    resultsHTML = \`<div class="card-panel" style="margin-top: 15px;">\${translateText("results.noUpgrades", {}, "No upgrades selected or already at target level.")}</div>\`;
  } else {
    resultsHTML += grandTotalHTML;
  }

  // Calculate Optimized Plan
  const optimized = window.calculateExpertsOptimizedPlan();
  if (optimized) {
    let optHtml = \`<div class='card-panel' style='margin-top:15px; border-left: 3px solid var(--accent-color);'>
      <strong style="color:var(--accent-color);">OPTIMIZED PLAN</strong><br>
      Based on your available resources:<br>\`;
    optimized.breakdown.forEach(p => {
      optHtml += \`<div style="margin-top: 10px;">
        <strong>\${escapeHtml(translateText(\`expert.\${p.name.toLowerCase()}\`, {}, p.name))}</strong> (\${p.startLevel} → \${p.endLevel})
      </div>\`;
    });
    optHtml += \`<div style="margin-top: 10px; border-top: 1px solid var(--glass-border); padding-top: 10px;">
      <strong>Total Cost:</strong> Affinity: \${formatNumber(optimized.totalAffinityUsed)} | General Sigils: \${formatNumber(optimized.totalSigilsUsed)}
    </div></div>\`;
    resultsHTML += optHtml;
  }

  const resultEl = document.getElementById("expertsResult");
  if (resultEl) {
    resultEl.dataset.hasResults = "true";
    resultEl.innerHTML = resultsHTML;
  }
};
calculateExperts = window.calculateExperts;

// --- EXPERT SKILLS ---
window.calculateExpertSkillsOptimizedPlan = function() {
  if (!EXPERTS_DATA) return null;
  const EXPERT_ORDER = Object.keys(EXPERTS_DATA);
  const account = getActiveAccount();
  const expertsState = (account && account.calculators && account.calculators.experts) ? account.calculators.experts : { levels: {} };

  const currentStates = [];
  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData) return;
    
    // Check affinity prerequisite level
    const curAffinityLevel = expertsState.levels[name]?.current ? parseInt(expertsState.levels[name].current) : 1;

    [1, 2, 3, 4].forEach(s => {
      const sCurSel = document.querySelector(\`.skill-current-select[data-expert="\${name}"][data-skill="\${s}"]\`);
      if (sCurSel) {
        const startIdxRaw = parseInt(sCurSel.value) || 1;
        if (startIdxRaw === -1) return;
        
        const sArr = expertData.skills[s.toString()];
        if (sArr) {
          currentStates.push({
            name, skill: s, upgrades: sArr, affinityLevel: curAffinityLevel,
            startIndex: startIdxRaw, currentIndex: startIdxRaw
          });
        }
      }
    });
  });

  let totalExpUsed = 0;
  let totalBooksUsed = 0;
  let expLeft = (parseInt(document.getElementById("expertSkillExp")?.value) || 0) * 60;
  let booksLeft = parseInt(document.getElementById("expertSkillBooks")?.value) || 0;

  while (true) {
    let bestSkill = null;
    let minCostValue = Infinity;
    currentStates.forEach(state => {
      // Find the row for the next level
      const nextLevel = state.currentIndex + 1;
      const nextRow = state.upgrades.find(r => r.level === nextLevel);
      if (nextRow) {
        // Check prerequisite
        let prereqMet = true;
        const reqRel = nextRow.relationship;
        if (reqRel && reqRel !== '-' && reqRel !== '') {
            const reqLevel = getLevelForRelationship(state.name, reqRel);
            if (state.affinityLevel < reqLevel) prereqMet = false;
        }

        if (prereqMet) {
          const expCost = nextRow.exp || 0;
          const bookCost = nextRow.book || 0;
          if (expCost <= expLeft && bookCost <= booksLeft) {
            const costValue = expCost + (bookCost * 3600); // weight books
            if (costValue < minCostValue) {
              minCostValue = costValue;
              bestSkill = state;
            }
          }
        }
      }
    });

    if (!bestSkill) break;

    const nextLevel = bestSkill.currentIndex + 1;
    const nextRow = bestSkill.upgrades.find(r => r.level === nextLevel);
    
    expLeft -= (nextRow.exp || 0);
    totalExpUsed += (nextRow.exp || 0);
    booksLeft -= (nextRow.book || 0);
    totalBooksUsed += (nextRow.book || 0);
    
    bestSkill.currentIndex++;
  }

  const upgraded = currentStates.filter(s => s.currentIndex > s.startIndex);
  if (upgraded.length > 0) {
    return {
      breakdown: upgraded.map(s => ({
        name: s.name, skill: s.skill,
        startLevel: s.startIndex,
        endLevel: s.currentIndex
      })),
      totalExpUsed,
      totalBooksUsed
    };
  }
  return null;
};

window.calculateExpertSkills = function() {
  if (!EXPERTS_DATA) return;

  let totalSkillExpNeeded = 0;
  let totalSkillBooksNeeded = 0;
  let resultsHTML = "";

  const EXPERT_ORDER = EXPERTS_DATA ? Object.keys(EXPERTS_DATA) : [];

  // Read affinity state for prerequisites
  const account = getActiveAccount();
  const expertsState = (account && account.calculators && account.calculators.experts) ? account.calculators.experts : { levels: {} };

  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData) return;

    let skillExp = 0;
    let skillBooks = 0;
    const curAffinityLevel = expertsState.levels[name]?.current ? parseInt(expertsState.levels[name].current) : 1;
    let expertWarnings = [];

    [1, 2, 3, 4].forEach(s => {
      const sCurSel = document.querySelector(\`.skill-current-select[data-expert="\${name}"][data-skill="\${s}"]\`);
      const sTgtSel = document.querySelector(\`.skill-target-select[data-expert="\${name}"][data-skill="\${s}"]\`);
      
      if (sCurSel && sTgtSel) {
        const sc = parseInt(sCurSel.value) || 1;
        const st = parseInt(sTgtSel.value) || 1;
        
        if (sc === -1) return;
        
        const opt = sTgtSel.options[sTgtSel.selectedIndex];
        const reqRel = opt?.dataset?.req;
        if (reqRel && reqRel !== '-' && reqRel !== '') {
            const reqLevel = getLevelForRelationship(name, reqRel);
            if (curAffinityLevel < reqLevel) {
                expertWarnings.push(\`Skill \${s} Target Lv.\${st} requires Affinity \${reqRel} (Lv.\${reqLevel}). Current is Lv.\${curAffinityLevel}.\`);
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
      const localizedName = translateText(\`expert.\${name.toLowerCase()}\`, {}, name);
      resultsHTML += \`
        <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,165,0,0.5);">
          <strong>\${escapeHtml(localizedName)}</strong><br>
          \${expertWarnings.map(w => \`<div style="color: orange; font-size: 0.9em;">&#9888; \${w}</div>\`).join("")}
          \${skillExp > 0 ? \`\${translateText("labels.skillExp", {}, "Learning Speedups Needed")}: \${formatDuration(skillExp)} <br>\` : ""}
          \${skillBooks > 0 ? \`\${translateText("labels.skillBooks", {}, "Skill Books Needed")}: \${skillBooks.toLocaleString()} <br>\` : ""}
        </div>
      \`;
    }
  });

  const invSkillExpSeconds = (parseInt(document.getElementById("expertSkillExp")?.value) || 0) * 60;
  const invSkillBooks = parseInt(document.getElementById("expertSkillBooks")?.value) || 0;

  const remainingSkillExpSeconds = Math.max(0, invSkillExpSeconds - totalSkillExpNeeded);
  const remainingSkillBooks = Math.max(0, invSkillBooks - totalSkillBooksNeeded);

  let grandTotalHTML = \`
    <div class="card-panel" style="margin-top: 15px;">
      <strong>\${translateText("results.grandTotal", {}, "TARGET UPGRADES TOTAL")}</strong><br>
      \${translateText("labels.skillExp", {}, "Total Learning Speedups Required")}: \${formatDuration(totalSkillExpNeeded)}<br>
      \${translateText("labels.skillBooks", {}, "Total Skill Books Required")}: \${totalSkillBooksNeeded.toLocaleString()}<br><br>
      
      <strong>\${translateText("results.afterInventory", {}, "Remaining After Upgrades")}</strong><br>
      \${translateText("labels.remainingSkillExp", {}, "Learning Speedups Left")}: \${formatDuration(remainingSkillExpSeconds)}<br>
      \${translateText("labels.remainingSkillBooks", {}, "Skill Books Left")}: \${remainingSkillBooks.toLocaleString()}
    </div>
  \`;

  if (totalSkillExpNeeded === 0 && totalSkillBooksNeeded === 0) {
    resultsHTML += \`<div class="card-panel" style="margin-top: 15px;">\${translateText("results.noUpgrades", {}, "No target upgrades selected.")}</div>\`;
  } else {
    resultsHTML += grandTotalHTML;
  }

  const optimized = window.calculateExpertSkillsOptimizedPlan();
  if (optimized) {
    let optHtml = \`<div class='card-panel' style='margin-top:15px; border-left: 3px solid var(--accent-color);'>
      <strong style="color:var(--accent-color);">OPTIMIZED PLAN</strong><br>
      Based on your available resources:<br>\`;
    optimized.breakdown.forEach(p => {
      optHtml += \`<div style="margin-top: 10px;">
        <strong>\${escapeHtml(translateText(\`expert.\${p.name.toLowerCase()}\`, {}, p.name))}</strong> Skill \${p.skill} (\${p.startLevel} → \${p.endLevel})
      </div>\`;
    });
    optHtml += \`<div style="margin-top: 10px; border-top: 1px solid var(--glass-border); padding-top: 10px;">
      <strong>Total Cost:</strong> Learning Speedups: \${formatDuration(optimized.totalExpUsed)} | Skill Books: \${formatNumber(optimized.totalBooksUsed)}
    </div></div>\`;
    resultsHTML += optHtml;
  }

  const resultEl = document.getElementById("expertSkillsResult");
  if (resultEl) {
    resultEl.dataset.hasResults = "true";
    resultEl.innerHTML = resultsHTML;
  }
};
calculateExpertSkills = window.calculateExpertSkills;

`;

fs.appendFileSync('script.js', overrides, 'utf8');
console.log("Appended overrides to script.js");
