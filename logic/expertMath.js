
/**
 * Core math logic for Expert Calculator.
 */

function calculateExpertUpgrade(expertTargets, inventory) {
  let totalAffinityNeeded = 0;
  let totalGeneralSigilsNeeded = 0;
  const expertBreakdown = [];

  expertTargets.forEach(t => {
    const expertData = EXPERTS_DATA[t.name];
    if (!expertData || !expertData.levels) return;

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

    if (affinity > 0 || sigils > 0) {
      expertBreakdown.push({
        name: t.name,
        affinity,
        sigils,
        remainingSigilsForExpert
      });
    }
  });

  const totalInvAffinity = (inventory.compass * 10) + (inventory.fieryHeart * 100) + (inventory.sail * 1000);
  const remainingAffinity = Math.max(0, totalAffinityNeeded - totalInvAffinity);
  const remainingGenSigils = Math.max(0, totalGeneralSigilsNeeded - inventory.genSigils);

  return {
    totalAffinityNeeded,
    totalGeneralSigilsNeeded,
    remainingAffinity,
    remainingGenSigils,
    expertBreakdown
  };
}

function calculateExpertSmartUpgrade(expertStates, inventory) {
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

function getLevelForRelationship(expertName, relTitle) {
  if (!EXPERTS_DATA || !EXPERTS_DATA[expertName] || !EXPERTS_DATA[expertName].levels) return 1;
  const match = EXPERTS_DATA[expertName].levels.find(r => r.relationship === relTitle);
  return match ? match.level : 1;
}

function calculateExpertSkillsUpgrade(skillTargets, inventory) {
  let totalSkillExpNeeded = 0;
  let totalSkillBooksNeeded = 0;
  const expertBreakdown = {};

  skillTargets.forEach(t => {
    const expertData = EXPERTS_DATA[t.name];
    if (!expertData) return;

    if (!expertBreakdown[t.name]) {
      expertBreakdown[t.name] = { skillExp: 0, skillBooks: 0, warnings: [] };
    }

    if (t.reqRel && t.reqRel !== "-" && t.reqRel !== "") {
      const reqLevel = getLevelForRelationship(t.name, t.reqRel);
      if (t.curAffinityLevel < reqLevel) {
        expertBreakdown[t.name].warnings.push(`Skill ${t.skillId} Target Lv.${t.tgtLvl} requires Affinity ${t.reqRel} (Lv.${reqLevel}). Current is Lv.${t.curAffinityLevel}.`);
      }
    }

    if (t.curLvl < t.tgtLvl) {
      const sArr = expertData.skills[t.skillId.toString()];
      if (sArr) {
        for (let sl = t.curLvl + 1; sl <= t.tgtLvl; sl++) {
          const row = sArr.find(r => r.level === sl);
          if (row) {
            expertBreakdown[t.name].skillExp += (row.exp || 0);
            expertBreakdown[t.name].skillBooks += (row.book || 0);
            totalSkillExpNeeded += (row.exp || 0);
            totalSkillBooksNeeded += (row.book || 0);
          }
        }
      }
    }
  });

  const remainingSkillExpSeconds = Math.max(0, totalSkillExpNeeded - inventory.skillExpSeconds);
  const remainingSkillBooks = Math.max(0, totalSkillBooksNeeded - inventory.skillBooks);

  const breakdownArray = Object.keys(expertBreakdown)
    .filter(name => expertBreakdown[name].skillExp > 0 || expertBreakdown[name].skillBooks > 0 || expertBreakdown[name].warnings.length > 0)
    .map(name => ({
      name,
      ...expertBreakdown[name]
    }));

  return {
    totalSkillExpNeeded,
    totalSkillBooksNeeded,
    remainingSkillExpSeconds,
    remainingSkillBooks,
    expertBreakdown: breakdownArray
  };
}

function calculateExpertSkillsSmartUpgrade(skillStates, inventory) {
  let invSkillExpSeconds = inventory.skillExpSeconds;
  let invSkillBooks = inventory.skillBooks;

  const currentStates = [];
  skillStates.forEach(s => {
    const expertData = EXPERTS_DATA[s.name];
    if (!expertData) return;
    const skillArr = expertData.skills[s.skillId.toString()];
    if (skillArr) {
      currentStates.push({
        name: s.name,
        skillId: s.skillId,
        upgrades: skillArr,
        startIndex: skillArr.findIndex(l => l.level === s.curLvl),
        currentIndex: skillArr.findIndex(l => l.level === s.curLvl),
        maxAffinity: s.maxAffinity
      });
    }
  });

  let upgradesDone = 0;
  while (true) {
    let bestSkill = null;
    let minCostValue = Infinity;

    currentStates.forEach(state => {
      if (state.currentIndex + 1 < state.upgrades.length) {
        const next = state.upgrades[state.currentIndex + 1];
        const reqRel = next.relationship;
        let reqLevel = 1;
        if (reqRel && reqRel !== "-" && reqRel !== "") {
          reqLevel = getLevelForRelationship(state.name, reqRel);
        }

        if (state.maxAffinity >= reqLevel) {
          const expCost = next.exp || 0;
          const bookCost = next.book || 0;
          
          if (expCost <= invSkillExpSeconds && bookCost <= invSkillBooks) {
            const costValue = expCost + (bookCost * 50);
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

  const upgradedSkills = currentStates
    .filter(s => s.currentIndex > s.startIndex)
    .map(s => ({ name: s.name, skillId: s.skillId, newTargetLvl: s.upgrades[s.currentIndex].level }));

  return { upgradesDone, upgradedSkills };
}

