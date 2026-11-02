import researchData from '../data/researchUpgrades.json';

export function getResearchCategories() {
  return Object.keys(researchData);
}

export function getResearchItems(category) {
  if (!researchData[category]) return [];
  return Object.entries(researchData[category]).map(([key, item]) => ({
    key,
    ...item
  })).sort((a, b) => (a.row || 0) - (b.row || 0) || a.name.localeCompare(b.name));
}

export function getAllResearchItemsFlat() {
  const all = [];
  for (const cat of Object.keys(researchData)) {
    for (const [key, item] of Object.entries(researchData[cat])) {
      all.push({
        category: cat,
        key,
        ...item
      });
    }
  }
  return all;
}

export function getResearchItem(category, itemKey) {
  if (category && researchData[category]?.[itemKey]) {
    return { ...researchData[category][itemKey], category };
  }
  for (const cat of Object.keys(researchData)) {
    if (researchData[cat][itemKey]) {
      return { ...researchData[cat][itemKey], category: cat };
    }
  }
  return null;
}

export function getResearchMaxLevel(category, itemKey) {
  const item = getResearchItem(category, itemKey);
  if (!item || !item.levels) return 0;
  const levels = Object.keys(item.levels).map(Number);
  return Math.max(...levels, 0);
}

/**
 * Calculates upgrade costs, stats, prerequisites, and adjusted times for multiple research items.
 * 
 * itemsToCalc: Array of { id, category, itemKey, currentLevel, targetLevel }
 */
export function calculateMultiResearchUpgrade(inputs) {
  const {
    itemsToCalc = [],
    buffs = {},
    speedups = {},
    backpack = {}
  } = inputs;

  let totalMeat = 0;
  let totalWood = 0;
  let totalCoal = 0;
  let totalIron = 0;
  let totalSteel = 0;
  let totalSeconds = 0;
  let totalPowerGained = 0;

  // Buff calculations (Pet buff removed)
  const researchSpeedPct = Math.max(0, Number(buffs.researchSpeedPct) || 0);
  const castleBuffPct = Math.max(0, Number(buffs.castleBuffPct) || 0);
  const positionBuffPct = Math.max(0, Number(buffs.positionBuffPct) || 0);
  const totalSpeedBonusPct = researchSpeedPct + castleBuffPct + positionBuffPct;

  const calculatedItems = [];
  const reqResearchItems = new Map();
  let maxResearchCenterReq = 0;

  for (const entry of itemsToCalc) {
    const { category, itemKey, currentLevel, targetLevel } = entry;
    const item = getResearchItem(category, itemKey);
    if (!item) continue;

    const cur = parseInt(currentLevel, 10) || 0;
    const tgt = parseInt(targetLevel, 10) || 0;

    let itemMeat = 0;
    let itemWood = 0;
    let itemCoal = 0;
    let itemIron = 0;
    let itemSteel = 0;
    let itemSeconds = 0;
    let itemPower = 0;

    let startStat = 0;
    let endStat = 0;

    if (cur > 0 && item.levels[String(cur)]) {
      startStat = item.levels[String(cur)]['stat-addition'] || 0;
    }
    if (tgt > 0 && item.levels[String(tgt)]) {
      endStat = item.levels[String(tgt)]['stat-addition'] || 0;
    }

    const levelsBreakdown = [];

    if (tgt > cur) {
      for (let lvl = cur + 1; lvl <= tgt; lvl++) {
        const lvlKey = String(lvl);
        const lvlData = item.levels[lvlKey];
        if (!lvlData) continue;

        levelsBreakdown.push({
          level: lvl,
          ...lvlData
        });

        const cost = lvlData.cost || {};
        itemMeat += cost.meat || 0;
        itemWood += cost.wood || 0;
        itemCoal += cost.coal || 0;
        itemIron += cost.iron || 0;
        itemSteel += cost.steel || 0;
        itemSeconds += lvlData['research-time-seconds'] || 0;
        itemPower += lvlData.power || 0;

        // Requirements
        const reqs = lvlData.requirements || {};
        if (reqs['research-items']) {
          for (const [rKey, rLvl] of Object.entries(reqs['research-items'])) {
            if (rKey !== itemKey) {
              const prev = reqResearchItems.get(rKey) || 0;
              reqResearchItems.set(rKey, Math.max(prev, rLvl));
            }
          }
        }
        if (reqs.buildings) {
          const rcLvl = reqs.buildings['research-center'] || reqs.buildings['research-center-lv'] || 0;
          maxResearchCenterReq = Math.max(maxResearchCenterReq, rcLvl);
        }
      }
    }

    totalMeat += itemMeat;
    totalWood += itemWood;
    totalCoal += itemCoal;
    totalIron += itemIron;
    totalSteel += itemSteel;
    totalSeconds += itemSeconds;
    totalPowerGained += itemPower;

    const itemAdjustedSeconds = Math.floor(itemSeconds / (1 + (totalSpeedBonusPct / 100)));

    calculatedItems.push({
      ...entry,
      name: item.name,
      statName: item.stat,
      troopType: item['troop-type'],
      startStat,
      endStat,
      statGain: Math.round((endStat - startStat) * 1000) / 1000,
      power: itemPower,
      seconds: itemSeconds,
      adjustedSeconds: itemAdjustedSeconds,
      costs: {
        meat: itemMeat,
        wood: itemWood,
        coal: itemCoal,
        iron: itemIron,
        steel: itemSteel
      },
      levelsBreakdown
    });
  }

  // Buff calculations (Pet buff removed)
// totalSpeedBonusPct already defined above
  const speedAdjustedSeconds = Math.floor(totalSeconds / (1 + (totalSpeedBonusPct / 100)));
  const timeSavedSeconds = Math.max(0, totalSeconds - speedAdjustedSeconds);

  // Speedups
  const totalSpeedupMinutes = (Number(speedups.generalMinutes) || 0) + (Number(speedups.researchMinutes) || 0);
  const totalSpeedupSeconds = totalSpeedupMinutes * 60;
  const remainingTimeSeconds = Math.max(0, speedAdjustedSeconds - totalSpeedupSeconds);
  const speedupSurplusSeconds = Math.max(0, totalSpeedupSeconds - speedAdjustedSeconds);

  // Backpack checks
  const meatRemaining = (Number(backpack.meat) || 0) - totalMeat;
  const woodRemaining = (Number(backpack.wood) || 0) - totalWood;
  const coalRemaining = (Number(backpack.coal) || 0) - totalCoal;
  const ironRemaining = (Number(backpack.iron) || 0) - totalIron;
  const steelRemaining = (Number(backpack.steel) || 0) - totalSteel;

  // Prerequisites list formatted
  const prerequisites = [];
  if (maxResearchCenterReq > 0) {
    prerequisites.push({
      type: 'building',
      name: 'Research Center',
      level: maxResearchCenterReq
    });
  }
  for (const [rKey, rLvl] of reqResearchItems.entries()) {
    let foundName = rKey;
    let foundCat = 'Battle';
    for (const cat of ['Growth', 'Economy', 'Battle']) {
      if (researchData[cat]?.[rKey]) {
        foundName = researchData[cat][rKey].name;
        foundCat = cat;
        break;
      }
    }
    prerequisites.push({
      type: 'research',
      name: foundName,
      key: rKey,
      category: foundCat,
      level: rLvl
    });
  }

  return {
    calculatedItems,
    totalPowerGained,
    costs: {
      meat: totalMeat,
      wood: totalWood,
      coal: totalCoal,
      iron: totalIron,
      steel: totalSteel
    },
    remainingResources: {
      meat: meatRemaining,
      wood: woodRemaining,
      coal: coalRemaining,
      iron: ironRemaining,
      steel: steelRemaining
    },
    time: {
      baseSeconds: totalSeconds,
      adjustedSeconds: speedAdjustedSeconds,
      timeSavedSeconds,
      totalSpeedupSeconds,
      remainingTimeSeconds,
      speedupSurplusSeconds
    },
    prerequisites
  };
}
