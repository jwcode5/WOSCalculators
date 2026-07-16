const fs = require('fs');

function unhideSmartButtons() {
    const files = ["ui/pets.js", "ui/chiefGear.js", "ui/chiefCharm.js", "ui/experts.js", "ui/expertSkills.js"];
    for (const file of files) {
        if (!fs.existsSync(file)) continue;
        let content = fs.readFileSync(file, 'utf8');
        
        content = content.replace(/<div class="gear-button-row"[^>]*>[\s\S]*?<\/div>/g, '');
        content = content.replace(/<button id="[^"]+SmartUpgradeBtn"[^>]*>[\s\S]*?<\/button>/g, '');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Removed smart buttons from " + file);
    }
}
unhideSmartButtons();

// We append the new logic for Pets and Experts to the end of script.js
const overrides = `
// ==========================================
// OVERRIDES FOR OPTIMIZED PLANS
// ==========================================

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
    const optimized = calculatePetsOptimizedPlan();
    renderPetsResult(result, optimized);
  } catch(err) {
    const resEl = document.getElementById("petsResult");
    if (resEl) {
      resEl.innerHTML = \`<div style="color:red; padding:20px;">Error calculating pets: \${err.message}<br>\${err.stack}</div>\`;
      resEl.style.display = "block";
    }
  }
};

window.renderPetsResult = function(result, optimized) {
  const resEl = document.getElementById("petsResult");
  if (!resEl) return;

  let html = "";
  if (result) {
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

    html += \`
      <div class="card-panel">
        <h3 style="margin-top:0; color:#ffe08a;">\${translateText("results.grandTotal", {}, "TARGET UPGRADES TOTAL")}</h3>
        \${translateText("labels.petFood", {}, "Pet Food")}: \${formatNumber(grandTotal.petFood)} | 
        \${translateText("labels.tamingManual", {}, "Taming Manual")}: \${formatNumber(grandTotal.tamingManual)}<br>
        \${translateText("labels.energizingPotion", {}, "Energizing Potion")}: \${formatNumber(grandTotal.energizingPotion)} | 
        \${translateText("labels.strengtheningSerum", {}, "Strengthening Serum")}: \${formatNumber(grandTotal.strengtheningSerum)}
      </div>
      <div class="card-panel" style="margin-top: 10px;">
        <strong>\${translateText("results.afterUpgradeBalance", {}, "After Upgrade (Material Balance)")}</strong><br>
        \${translateText("labels.petFood", {}, "Pet Food")}: <span style="color: \${petFoodDiff < 0 ? '#ff6b6b' : '#51cf66'}">\${formatNumber(petFoodDiff)}</span><br>
        \${translateText("labels.tamingManual", {}, "Taming Manual")}: <span style="color: \${tamingManualDiff < 0 ? '#ff6b6b' : '#51cf66'}">\${formatNumber(tamingManualDiff)}</span><br>
        \${translateText("labels.energizingPotion", {}, "Energizing Potion")}: <span style="color: \${energizingPotionDiff < 0 ? '#ff6b6b' : '#51cf66'}">\${formatNumber(energizingPotionDiff)}</span><br>
        \${translateText("labels.strengtheningSerum", {}, "Strengthening Serum")}: <span style="color: \${strengtheningSerumDiff < 0 ? '#ff6b6b' : '#51cf66'}">\${formatNumber(strengtheningSerumDiff)}</span>
      </div>
      <div class="card-panel" style="margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;">
        <strong>\${translateText("results.svsPointsGained", {}, "SVS Points Gained:")}</strong> <span style="font-size:1.2em;">\${formatNumber(grandTotal.svsPoints)}</span>
      </div>
    \`;
  }

  if (optimized) {
    html += \`<div class='card-panel' style='margin-top:15px; border-left: 3px solid var(--accent-color);'>
      <strong style="color:var(--accent-color);">OPTIMIZED PLAN</strong><br>
      Based on your available resources:<br>
    \`;
    optimized.petBreakdown.forEach(p => {
      html += \`<div style="margin-top: 10px;">
        <strong>\${escapeHtml(translateText(\`pet.\${p.name}\`, {}, p.name))}</strong> (\${p.startLevel} → \${p.endLevel})<br>
        <span style="font-size:0.9em; opacity:0.8;">
          Food: \${formatNumber(p.totals.petFood)} | Manuals: \${formatNumber(p.totals.tamingManual)} | 
          Potions: \${formatNumber(p.totals.energizingPotion)} | Serums: \${formatNumber(p.totals.strengtheningSerum)}
        </span>
      </div>\`;
    });
    html += \`<div style="margin-top: 10px; border-top: 1px solid var(--glass-border); padding-top: 10px;">
      <strong>Total Cost:</strong> 
      Food: \${formatNumber(optimized.grandTotal.petFood)} | Manuals: \${formatNumber(optimized.grandTotal.tamingManual)} | 
      Potions: \${formatNumber(optimized.grandTotal.energizingPotion)} | Serums: \${formatNumber(optimized.grandTotal.strengtheningSerum)}
      <br><strong>Total SVS Points Gained: \${formatNumber(optimized.grandTotal.svsPoints)}</strong>
    </div>\`;
    html += \`</div>\`;
  }

  if (!result && !optimized) {
    resEl.innerHTML = \`<div style="padding:16px;">No target upgrades selected and no optimized upgrades possible with current materials.</div>\`;
  } else {
    resEl.innerHTML = html;
  }
  resEl.style.display = "block";
};

// Re-assign existing functions
onPetsCalculateClick = window.onPetsCalculateClick;
renderPetsResult = window.renderPetsResult;

// Override Experts
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
    const curLvl = parseInt(currentSel.value) || 1;
    if (curLvl === -1) return;
    
    const specSigilsInp = document.querySelector(\`.expert-specific-sigils[data-expert="\${name}"]\`);
    const specSigilsAvail = parseInt(specSigilsInp?.value) || 0;

    const expertData = EXPERTS_DATA[name];
    if (expertData && expertData.levels) {
      currentStates.push({
        name, upgrades: expertData.levels,
        startIndex: expertData.levels.findIndex(l => l.level === curLvl),
        currentIndex: expertData.levels.findIndex(l => l.level === curLvl),
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

const originalCalculateExperts = window.calculateExperts || calculateExperts;
window.calculateExperts = function() {
  originalCalculateExperts();
  
  const optimized = window.calculateExpertsOptimizedPlan();
  if (optimized) {
    const resultEl = document.getElementById("expertsResult");
    if (!resultEl) return;
    let html = \`<div class='card-panel' style='margin-top:15px; border-left: 3px solid var(--accent-color);'>
      <strong style="color:var(--accent-color);">OPTIMIZED PLAN</strong><br>
      Based on your available resources:<br>\`;
    optimized.breakdown.forEach(p => {
      html += \`<div style="margin-top: 10px;">
        <strong>\${escapeHtml(translateText(\`expert.\${p.name.toLowerCase()}\`, {}, p.name))}</strong> (\${p.startLevel} → \${p.endLevel})
      </div>\`;
    });
    html += \`<div style="margin-top: 10px; border-top: 1px solid var(--glass-border); padding-top: 10px;">
      <strong>Total Cost:</strong> Affinity: \${formatNumber(optimized.totalAffinityUsed)} | General Sigils: \${formatNumber(optimized.totalSigilsUsed)}
    </div></div>\`;
    
    resultEl.innerHTML += html;
  }
};
calculateExperts = window.calculateExperts;

// We will also just suppress the SmartUpgrade buttons entirely by clearing the functions so they don't error
window.onPetsSmartUpgradeClick = function(){};
window.onExpertSmartUpgradeClick = function(){};
window.onExpertSkillsSmartUpgradeClick = function(){};
window.onGearSmartUpgradeClick = function(){};
window.onCharmSmartUpgradeClick = function(){};

`;

fs.appendFileSync('script.js', overrides, 'utf8');
console.log("Appended overrides to script.js");
