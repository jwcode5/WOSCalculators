
/**
 * Core math logic for Expert Calculator.
 */

import EXPERTS_DATA from '../data/expertsData.json';

export function calculateExpertUpgrade(expertTargets, inventory) {
  let totalAffinityNeeded = 0;
  let totalGeneralSigilsNeeded = 0;

  // Track state for smart upgrade
  const curLevels = {};
  const targetLevels = {};
  const optimizedLevels = {};
  const specificSigils = {};

  expertTargets.forEach(t => {
    const expertData = EXPERTS_DATA[t.name];
    if (!expertData || !expertData.levels) return;

    curLevels[t.name] = t.curLvl;
    targetLevels[t.name] = t.tgtLvl;
    optimizedLevels[t.name] = t.curLvl;
    specificSigils[t.name] = t.specSigilsAvail || 0;

    let affinity = 0;
    let sigils = 0;

    if (t.curLvl < t.tgtLvl) {
      for (let l = t.curLvl + 1; l <= t.tgtLvl; l++) {
        const row = expertData.levels.find(r => r.level === l);
        if (row) {
          affinity += (row.affinity || 0);
          sigils += (row.advancement || 0);
        }
      }
    }

    let remainingSigilsForExpert = sigils;
    if (t.specSigilsAvail >= remainingSigilsForExpert) {
      remainingSigilsForExpert = 0;
    } else {
      remainingSigilsForExpert -= t.specSigilsAvail;
    }

    totalAffinityNeeded += affinity;
    totalGeneralSigilsNeeded += remainingSigilsForExpert;
  });

  // Calculate Smart Upgrade Plan
  const resources = { ...inventory };
  let currentAffinity = (resources.compass || 0) * 10 + (resources.fieryHeart || 0) * 100 + (resources.sail || 0) * 1000;
  let currentSigils = resources.genSigils || 0;
  
  let upgradesMade = true;
  while (upgradesMade) {
    upgradesMade = false;
    let bestExpert = null;
    let bestCost = null;
    let bestCostValue = Infinity;

    Object.keys(curLevels).forEach(name => {
      const curLvl = optimizedLevels[name];
      const targetLvl = targetLevels[name];
      const expertData = EXPERTS_DATA[name];

      if (curLvl < targetLvl && expertData && expertData.levels) {
        const next = expertData.levels.find(r => r.level === curLvl + 1);
        if (next) {
          const affinityCost = next.affinity || 0;
          const totalSigilCost = next.advancement || 0;
          const commonCost = Math.max(0, totalSigilCost - specificSigils[name]);
          
          if (affinityCost <= currentAffinity && commonCost <= currentSigils) {
            const costValue = affinityCost + commonCost * 100;
            if (costValue < bestCostValue) {
              bestCostValue = costValue;
              bestExpert = name;
              bestCost = { affinityCost, commonCost, totalSigilCost };
            }
          }
        }
      }
    });

    if (bestExpert) {
      optimizedLevels[bestExpert]++;
      currentAffinity -= bestCost.affinityCost;
      currentSigils -= bestCost.commonCost;
      specificSigils[bestExpert] = Math.max(0, specificSigils[bestExpert] - bestCost.totalSigilCost);
      upgradesMade = true;
    }
  }

  const plan = [];
  Object.keys(curLevels).forEach(name => {
    if (optimizedLevels[name] > curLevels[name]) {
      plan.push({
        slot: name,
        to: optimizedLevels[name],
        label: `Lv. ${optimizedLevels[name]}`
      });
    }
  });

  return {
    costs: {
      affinity: totalAffinityNeeded,
      generalSigils: totalGeneralSigilsNeeded
    },
    optimized: {
      plan,
      resources: {
        affinity: currentAffinity,
        generalSigils: currentSigils
      }
    }
  };
}

export function calculateExpertSmartUpgrade(expertStates, inventory) {
  let commonSigils = inventory.genSigils;
  let totalAffinity = (inventory.compass * 10) + (inventory.fieryHeart * 100) + (inventory.sail * 1000);

  const currentStates = [];
  expertStates.forEach(s => {
    const expertData = EXPERTS_DATA[s.name];
    if (expertData && expertData.levels) {
      currentStates.push({
        name: s.name,
        upgrades: expertData.levels,
        startIndex: expertData.levels.findIndex(l => l.level === s.curLvl),
        currentIndex: expertData.levels.findIndex(l => l.level === s.curLvl),
        specificSigils: s.specSigilsAvail
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
          const costValue = affinityCost + commonCost * 100;
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

  const upgradedExperts = currentStates
    .filter(s => s.currentIndex > s.startIndex)
    .map(s => ({ name: s.name, newTargetLvl: s.upgrades[s.currentIndex].level }));

  return { upgradesDone, upgradedExperts };
}

export function getLevelForRelationship(expertName, relTitle) {
  if (!EXPERTS_DATA || !EXPERTS_DATA[expertName] || !EXPERTS_DATA[expertName].levels) return 1;
  const match = EXPERTS_DATA[expertName].levels.find(r => r.relationship === relTitle);
  return match ? match.level : 1;
}

export function calculateExpertSkillsUpgrade(skillTargets, inventory) {
  let totalSkillExpNeeded = 0;
  let totalSkillBooksNeeded = 0;
  const warnings = [];

  const curLevels = {};
  const targetLevels = {};
  const optimizedLevels = {};
  const affinityLevels = {};
  const specificSavedExp = {};

  skillTargets.forEach(t => {
    const key = `${t.name}_${t.skillId}`;
    const expertData = EXPERTS_DATA[t.name];
    if (!expertData) return;

    curLevels[key] = t.curLvl;
    targetLevels[key] = t.tgtLvl;
    optimizedLevels[key] = t.curLvl;
    affinityLevels[t.name] = t.curAffinityLevel;
    specificSavedExp[key] = t.savedExp || 0;

    let skillExpForThisTarget = 0;

    if (t.curLvl < t.tgtLvl) {
      const sArr = expertData.skills[t.skillId.toString()];
      if (sArr) {
        for (let sl = t.curLvl + 1; sl <= t.tgtLvl; sl++) {
          const row = sArr.find(r => r.level === sl);
          if (row) {
            skillExpForThisTarget += (row.exp || 0);
            totalSkillBooksNeeded += (row.book || 0);
            
            // Check warnings for target level
            if (row.relationship && row.relationship !== "-") {
              const reqLevel = getLevelForRelationship(t.name, row.relationship);
              if (t.curAffinityLevel < reqLevel && !warnings.some(w => w.includes(`${t.name} Skill ${t.skillId}`))) {
                warnings.push(`${t.name} Skill ${t.skillId} Target Lv.${t.tgtLvl} requires Affinity '${row.relationship}' (Lv.${reqLevel}). Current is Lv.${t.curAffinityLevel}.`);
              }
            }
          }
        }
      }
    }
    
    // Apply saved exp discount to total
    const expAfterDiscount = Math.max(0, skillExpForThisTarget - specificSavedExp[key]);
    totalSkillExpNeeded += expAfterDiscount;
  });

  // Calculate Smart Upgrade Plan
  const resources = { ...inventory };
  let currentExp = resources.skillExpSeconds || 0;
  let currentBooks = resources.skillBooks || 0;

  let upgradesMade = true;
  while (upgradesMade) {
    upgradesMade = false;
    let bestSkill = null;
    let bestCost = null;
    let bestCostValue = Infinity;

    Object.keys(curLevels).forEach(key => {
      const [name, skillId] = key.split('_');
      const curLvl = optimizedLevels[key];
      const targetLvl = targetLevels[key];
      const expertData = EXPERTS_DATA[name];

      if (curLvl < targetLvl && expertData && expertData.skills[skillId]) {
        const next = expertData.skills[skillId].find(r => r.level === curLvl + 1);
        if (next) {
          // Check if we meet relationship reqs for smart upgrade
          let canUpgrade = true;
          if (next.relationship && next.relationship !== "-") {
            const reqLevel = getLevelForRelationship(name, next.relationship);
            if (affinityLevels[name] < reqLevel) {
              canUpgrade = false;
            }
          }

          if (canUpgrade) {
            let expCost = next.exp || 0;
            const bookCost = next.book || 0;
            
            // Apply saved exp discount to this specific level up
            const discount = Math.min(expCost, specificSavedExp[key]);
            expCost -= discount;
            
            if (expCost <= currentExp && bookCost <= currentBooks) {
              const costValue = expCost + (bookCost * 50);
              if (costValue < bestCostValue) {
                bestCostValue = costValue;
                bestSkill = key;
                bestCost = { expCost, bookCost, discountApplied: discount };
              }
            }
          }
        }
      }
    });

    if (bestSkill) {
      optimizedLevels[bestSkill]++;
      currentExp -= bestCost.expCost;
      currentBooks -= bestCost.bookCost;
      specificSavedExp[bestSkill] -= bestCost.discountApplied;
      upgradesMade = true;
    }
  }

  const plan = [];
  Object.keys(curLevels).forEach(key => {
    if (optimizedLevels[key] > curLevels[key]) {
      const [name, skillId] = key.split('_');
      plan.push({
        slot: `${name} - Skill ${skillId}`,
        to: optimizedLevels[key],
        label: `Lv. ${optimizedLevels[key]}`
      });
    }
  });

  return {
    costs: {
      skillExp: totalSkillExpNeeded,
      skillBooks: totalSkillBooksNeeded
    },
    optimized: {
      plan,
      resources: {
        skillExp: currentExp,
        skillBooks: currentBooks
      }
    },
    warnings
  };
}


