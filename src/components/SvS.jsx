import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateSvs } from '../logic/svsMath';
import { getBuildingLevelOrder, getUpgradePathKeys, getAggregatedPrerequisites } from '../logic/upgradeMath';
import BUILDING_COSTS from '../data/buildings.json';
import PET_UPGRADES from '../data/petUpgrades.tiered.json';
import CHIEF_CHARM_DATA from '../data/chiefCharm.json';
import CHIEF_GEAR_DATA from '../data/chiefGear.json';

const SVS_CHARM_SCORES = {
  "silver_1": 1500, "silver_2": 2000, "silver_3": 2500, "silver_4": 3000, "silver_5": 3500, "silver_6": 4000,
  "gold_1": 4500, "gold_2": 5000, "gold_3": 6000, "gold_4": 7000, "gold_5": 8000, "gold_6": 9000,
  "red_1": 10000, "red_2": 11500, "red_3": 13000, "red_4": 15000, "red_5": 17000, "red_6": 20000, "red_7": 25000, "red_8": 30000, "red_9": 35000, "red_10": 40000, "red_11": 50000
};

const SVS_GEAR_SCORES = {
  "purple_0": 0, "purple_1": 0, "purple_2": 100, "purple_3": 200, "purple_4": 300,
  "gold_t0_0": 400, "gold_t0_1": 500, "gold_t0_2": 600, "gold_t0_3": 700,
  "gold_t1_0": 1250, "gold_t1_1": 1250, "gold_t1_2": 1250, "gold_t1_3": 1250,
  "gold_t2_0": 6250, "gold_t2_1": 6250, "gold_t2_2": 6250, "gold_t2_3": 6250
};

const CHARM_SLOT_DEFINITIONS = [
  { slotKey: "slot1", label: "Slot 1" },
  { slotKey: "slot2", label: "Slot 2" },
  { slotKey: "slot3", label: "Slot 3" }
];

const GEAR_SLOTS = ["hat", "clothes", "gloves", "shoes", "belt", "necklace"];

const SvS = () => {
  const { t } = useLanguage();
const DAYS = [
  {
    title: t("svsDays.day1Totals", {}, "Day 1 (City Construction)"),
    fields: [
      { id: 'd1_fc', label: t("svsFields.fireCrystals", {}, "Fire Crystals") },
      { id: 'd1_fcShards', label: t("svsFields.fireCrystalShards", {}, "Fire Crystal Shards") },
      { id: 'd1_refinedFc', label: t("svsFields.refinedFireCrystals", {}, "Refined Fire Crystals") },
      { id: 'd1_speedups', label: t("svsFields.speedupsminutes", {}, "Speedups (minutes)") },
      { id: 'd1_charm', label: t("svsFields.chiefCharmScore", {}, "Chief Charm Score") }
    ]
  },
  {
    title: t("svsDays.day2Totals", {}, "Day 2 (Basic Skills Up)"),
    fields: [
      { id: 'd2_fc', label: t("svsFields.fireCrystals", {}, "Fire Crystals") },
      { id: 'd2_fcShards', label: t("svsFields.fireCrystalShards", {}, "Fire Crystal Shards") },
      { id: 'd2_refinedFc', label: t("svsFields.refinedFireCrystals", {}, "Refined Fire Crystals") },
      { id: 'd2_speedups', label: t("svsFields.speedupsminutes", {}, "Speedups (minutes)") },
      { id: 'd2_luckyWheel', label: t("svsFields.luckyWheelSpins", {}, "Lucky Wheel Spins") },
      { id: 'd2_rareHero', label: t("svsFields.rareHeroShards", {}, "Rare Hero Shards") },
      { id: 'd2_epicHero', label: t("svsFields.epicHeroShards", {}, "Epic Hero Shards") },
      { id: 'd2_mythicHero', label: t("svsFields.mythicHeroShards", {}, "Mythic Hero Shards") },
      { id: 'd2_meat', label: t("svsFields.gatherMeatx1000", {}, "Gather Meat (x1000)") },
      { id: 'd2_wood', label: t("svsFields.gatherWoodx1000", {}, "Gather Wood (x1000)") },
      { id: 'd2_coal', label: t("svsFields.gatherCoalx200", {}, "Gather Coal (x200)") },
      { id: 'd2_iron', label: t("svsFields.gatherIronx50", {}, "Gather Iron (x50)") }
    ]
  },
  {
    title: t("svsDays.day3Totals", {}, "Day 3 (Beast Slay)"),
    fields: [
      { id: 'd3_petAdv', label: t("svsFields.petAdvancementScore", {}, "Pet Advancement Score") },
      { id: 'd3_advWildMark', label: t("svsFields.advancedWildMark", {}, "Advanced Wild Mark") },
      { id: 'd3_comWildMark', label: t("svsFields.commonWildMark", {}, "Common Wild Mark") },
      { id: 'd3_luckyWheel', label: t("svsFields.luckyWheelSpins", {}, "Lucky Wheel Spins") },
      { id: 'd3_charm', label: t("svsFields.chiefCharmScore", {}, "Chief Charm Score") },
      { id: 'd3_rareHero', label: t("svsFields.rareHeroShards", {}, "Rare Hero Shards") },
      { id: 'd3_epicHero', label: t("svsFields.epicHeroShards", {}, "Epic Hero Shards") },
      { id: 'd3_mythicHero', label: t("svsFields.mythicHeroShards", {}, "Mythic Hero Shards") },
      { id: 'd3_polarTerror', label: t("svsFields.polarTerrorRallies", {}, "Polar Terror Rallies") },
      { id: 'd3_beast1', label: t("svsFields.beastLv110", {}, "Beast Lv 1-10") },
      { id: 'd3_beast11', label: t("svsFields.beastLv1115", {}, "Beast Lv 11-15") },
      { id: 'd3_beast16', label: t("svsFields.beastLv1620", {}, "Beast Lv 16-20") },
      { id: 'd3_beast21', label: t("svsFields.beastLv2125", {}, "Beast Lv 21-25") },
      { id: 'd3_beast26', label: t("svsFields.beastLv2630", {}, "Beast Lv 26-30") }
    ]
  },
  {
    title: t("svsDays.day4Totals", {}, "Day 4 (Hero Development)"),
    fields: [
      { id: 'd4_charm', label: t("svsFields.chiefCharmScore", {}, "Chief Charm Score") },
      { id: 'd4_essenceStone', label: t("svsFields.heroGearEssenceStone", {}, "Hero Gear Essence Stone") },
      { id: 'd4_widget', label: t("svsFields.heroExclusiveGearWidget", {}, "Hero Exclusive Gear Widget") },
      { id: 'd4_mithril', label: t("svsFields.mithril", {}, "Mithril") },
      { id: 'd4_t1', label: t("svsFields.trainT1Troops", {}, "Train T1 Troops") },
      { id: 'd4_t2', label: t("svsFields.trainT2Troops", {}, "Train T2 Troops") },
      { id: 'd4_t3', label: t("svsFields.trainT3Troops", {}, "Train T3 Troops") },
      { id: 'd4_t4', label: t("svsFields.trainT4Troops", {}, "Train T4 Troops") },
      { id: 'd4_t5', label: t("svsFields.trainT5Troops", {}, "Train T5 Troops") },
      { id: 'd4_t6', label: t("svsFields.trainT6Troops", {}, "Train T6 Troops") },
      { id: 'd4_t7', label: t("svsFields.trainT7Troops", {}, "Train T7 Troops") },
      { id: 'd4_t8', label: t("svsFields.trainT8Troops", {}, "Train T8 Troops") },
      { id: 'd4_t9', label: t("svsFields.trainT9Troops", {}, "Train T9 Troops") },
      { id: 'd4_t10', label: t("svsFields.trainT10Troops", {}, "Train T10 Troops") },
      { id: 'd4_t11', label: t("svsFields.trainT11Troops", {}, "Train T11 Troops") }
    ]
  },
  {
    title: t("svsDays.day5Totals", {}, "Day 5 (Power Boost)"),
    fields: [
      { id: 'd5_petAdv', label: t("svsFields.petAdvancementScore", {}, "Pet Advancement Score") },
      { id: 'd5_advWildMark', label: t("svsFields.advancedWildMark", {}, "Advanced Wild Mark") },
      { id: 'd5_comWildMark', label: t("svsFields.commonWildMark", {}, "Common Wild Mark") },
      { id: 'd5_essenceStone', label: t("svsFields.heroGearEssenceStone", {}, "Hero Gear Essence Stone") },
      { id: 'd5_widget', label: t("svsFields.heroExclusiveGearWidget", {}, "Hero Exclusive Gear Widget") },
      { id: 'd5_mithril', label: t("svsFields.mithril", {}, "Mithril") },
      { id: 'd5_gearScore', label: t("svsFields.chiefGearScore", {}, "Chief Gear Score") },
      { id: 'd5_fc', label: t("svsFields.fireCrystals", {}, "Fire Crystals") },
      { id: 'd5_fcShards', label: t("svsFields.fireCrystalShards", {}, "Fire Crystal Shards") },
      { id: 'd5_refinedFc', label: t("svsFields.refinedFireCrystals", {}, "Refined Fire Crystals") },
      { id: 'd5_speedups', label: t("svsFields.speedupsminutes", {}, "Speedups (minutes)") }
    ]
  }
];



  const { activeAccount, updateAccountState } = useAccounts();
  const [svsState, setSvsState] = useState({});
  const [initializedAccountId, setInitializedAccountId] = useState(null);
  const [valeriaMultiplier, setValeriaMultiplier] = useState(1.0); // Global valeria state

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.state && activeAccount.state.svs) {
        setSvsState(activeAccount.state.svs);
      } else {
        setSvsState({});
      }
      setInitializedAccountId(activeAccount.id);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount && initializedAccountId === activeAccount.id) {
      updateAccountState('svs', svsState);
    }
  }, [svsState, initializedAccountId]);

  useEffect(() => {
    const valeriaSkillSelect = document.getElementById('globalValeriaSkill');
    const updateValeria = () => {
      if (valeriaSkillSelect) {
        const val = parseInt(valeriaSkillSelect.value) || 0;
        setValeriaMultiplier(1 + (val * 0.02));
      }
    };
    if (valeriaSkillSelect) {
      valeriaSkillSelect.addEventListener('change', updateValeria);
      updateValeria();
      return () => valeriaSkillSelect.removeEventListener('change', updateValeria);
    }
  }, []);

  const handleChange = (id, value) => {
    const val = parseFloat(value) || 0;
    const [, suffix] = id.split('_');
    
    setSvsState(prev => {
      const nextState = { ...prev };
      // Sync all fields with the exact same suffix
      DAYS.forEach(day => {
        day.fields.forEach(field => {
          const [, fieldSuffix] = field.id.split('_');
          if (fieldSuffix === suffix) {
            nextState[field.id] = val;
          }
        });
      });
      return nextState;
    });
  };

  const importBuildings = useCallback(() => {
    const upgradeState = activeAccount?.state?.buildings;
    if (!upgradeState || !upgradeState.targetBuilding) {
      alert("No building data found to import. Please visit the Upgrade calculator first.");
      return;
    }
    const { targetBuilding, currentLevel, targetLevel, optionalBuildings } = upgradeState;
    // For react-app, prereqState was removed in favor of recursive computation? No wait, prereq logic is just `getAggregatedPrerequisites`!
    const buildingsToCalc = [{ building: targetBuilding, currentLevel, targetLevel }];
    const prereqMap = getAggregatedPrerequisites(targetBuilding, currentLevel, targetLevel);
    for (const [bName, reqLvl] of prereqMap.entries()) {
      if (!BUILDING_COSTS[bName]) continue;
      const prereqLevels = getBuildingLevelOrder(bName);
      // We assume starting from lowest for prereqs since we don't store individual prereq state
      const curLvl = prereqLevels[0];
      const safeTgt = String(reqLvl);
      buildingsToCalc.push({ building: bName, currentLevel: curLvl, targetLevel: safeTgt });
    }
    
    if (optionalBuildings) {
      for (const opt of optionalBuildings) {
        buildingsToCalc.push({ building: opt.building, currentLevel: opt.currentLevel, targetLevel: opt.targetLevel });
      }
    }

    let totalFC = 0, totalRFC = 0, totalSeconds = 0;
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
      alert("Import successful, but calculated building costs were 0.");
      return;
    }

    const updates = {
      d1_fc: totalFC, d1_refinedFc: totalRFC, d1_speedups: Math.ceil(totalSeconds / 60),
      d2_fc: totalFC, d2_refinedFc: totalRFC, d2_speedups: Math.ceil(totalSeconds / 60),
      d5_fc: totalFC, d5_refinedFc: totalRFC, d5_speedups: Math.ceil(totalSeconds / 60)
    };
    setSvsState(prev => ({ ...prev, ...updates }));
    alert("Imported Building costs to Day 1, Day 2, and Day 5.");
  }, [activeAccount]);

  const importPets = useCallback(() => {
    const petState = activeAccount?.state?.pets?.levels;
    if (!petState) {
      alert("No Pet data found to import. Please visit the Pets calculator first.");
      return;
    }

    let totalScoreDiff = 0;
    Object.keys(petState).forEach(petName => {
      const { current, target } = petState[petName];
      if (current && target && current !== target) {
        const petData = PET_UPGRADES.pets[petName];
        if (petData) {
          let upgrades = petData.customUpgrades || PET_UPGRADES.tiers[petData.tier]?.upgrades || [];
          const startIdx = upgrades.findIndex(u => u.level === current);
          const endIdx = upgrades.findIndex(u => u.level === target);
          if (startIdx >= 0 && endIdx >= 0 && startIdx < endIdx) {
            for (let i = startIdx; i < endIdx; i++) {
              totalScoreDiff += (upgrades[i].svsPoints || 0);
            }
          }
        }
      }
    });

    if (totalScoreDiff === 0) {
      alert("Import successful, but no pet upgrades were found.");
      return;
    }

    setSvsState(prev => ({ ...prev, d3_petAdv: totalScoreDiff, d5_petAdv: totalScoreDiff }));
    alert(`Imported a Pet Advancement Score increase of ${totalScoreDiff} to Day 3 and Day 5.`);
  }, [activeAccount]);

  const importCharms = useCallback(() => {
    const state = activeAccount?.state?.chiefCharm;
    if (!state || !state.levels) {
      alert("No Chief Charm data found to import. Please visit the Chief Charm calculator first.");
      return;
    }
    
    let totalScoreDiff = 0;
    const levelKeyToIndex = {};
    if (CHIEF_CHARM_DATA && CHIEF_CHARM_DATA.levelOrder) {
      CHIEF_CHARM_DATA.levelOrder.forEach((k, idx) => { levelKeyToIndex[k] = idx; });
      Object.keys(state.levels).forEach(slot => {
        const currentKey = state.levels[slot]?.current || "none";
        const targetKey = state.levels[slot]?.target || "none";
        const currentIdx = levelKeyToIndex[currentKey] || -1;
        const targetIdx = levelKeyToIndex[targetKey] || -1;
        for (let i = currentIdx + 1; i <= targetIdx; i++) {
          const levelKey = CHIEF_CHARM_DATA.levelOrder[i];
          const score = SVS_CHARM_SCORES[levelKey] || 0;
          totalScoreDiff += score;
        }
      });
    }

    if (totalScoreDiff === 0) {
      alert("Import successful, but calculated Charm Score difference was 0.");
      return;
    }

    setSvsState(prev => ({ ...prev, d1_charm: totalScoreDiff, d3_charm: totalScoreDiff, d4_charm: totalScoreDiff }));
    alert(`Imported a Chief Charm Score increase of ${totalScoreDiff} to Days 1, 3, and 4.`);
  }, [activeAccount]);

  const importGear = useCallback(() => {
    const state = activeAccount?.state?.chiefGear;
    if (!state || !state.levels) {
      alert("No Chief Gear data found to import. Please visit the Chief Gear calculator first.");
      return;
    }

    let totalScoreDiff = 0;
    const levelKeyToIndex = {};
    if (CHIEF_GEAR_DATA && CHIEF_GEAR_DATA.levelOrder) {
      CHIEF_GEAR_DATA.levelOrder.forEach((k, idx) => { levelKeyToIndex[k] = idx; });
      GEAR_SLOTS.forEach(slot => {
        const currentKey = state.levels[slot]?.current || "none";
        const targetKey = state.levels[slot]?.target || "none";
        const currentIdx = levelKeyToIndex[currentKey] || -1;
        const targetIdx = levelKeyToIndex[targetKey] || -1;
        for (let i = currentIdx + 1; i <= targetIdx; i++) {
          const levelKey = CHIEF_GEAR_DATA.levelOrder[i];
          const levelInfo = CHIEF_GEAR_DATA.levels[levelKey];
          if (levelInfo && !levelInfo.isCharm) {
            totalScoreDiff += (SVS_GEAR_SCORES[levelKey] || 0);
          }
        }
      });
    }

    if (totalScoreDiff === 0) {
      alert("Import successful, but calculated Gear Score difference was 0.");
      return;
    }

    setSvsState(prev => ({ ...prev, d5_gearScore: totalScoreDiff }));
    alert(`Imported a Chief Gear Score increase of ${totalScoreDiff} to Day 5.`);
  }, [activeAccount]);

  const importResearch = () => alert("The Research calculator hasn't been built yet, so there is no data to import!");
  const importExperts = () => alert("The Experts calculator does not currently map its outputs (Affinity/General Sigils) to SvS Hero fields (Rare/Epic/Mythic Shards). This data cannot be imported directly yet.");
  const importTroops = () => alert("The Troops calculator hasn't been built yet, so there is no data to import!");
  const importAll = () => {
    importBuildings();
    importPets();
    importCharms();
    importGear();
  };

  const results = useMemo(() => {
    try {
      return calculateSvs({ ...svsState, valeriaMultiplier });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [svsState, valeriaMultiplier]);

  return (
    <section id="svsPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.svsImport', {}, 'Import Data')}</h2>
        <div className="gear-button-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
          <button type="button" className="secondary-button" onClick={importBuildings} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importBuildings', {}, 'Import Buildings')}</button>
          <button type="button" className="secondary-button" onClick={importResearch} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importResearch', {}, 'Import Research')}</button>
          <button type="button" className="secondary-button" onClick={importPets} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importPets', {}, 'Import Pets')}</button>
          <button type="button" className="secondary-button" onClick={importCharms} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importCharms', {}, 'Import Charms')}</button>
          <button type="button" className="secondary-button" onClick={importGear} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importGear', {}, 'Import Gear')}</button>
          <button type="button" className="secondary-button" onClick={importExperts} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importExperts', {}, 'Import Experts')}</button>
          <button type="button" className="secondary-button" onClick={importTroops} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importTroops', {}, 'Import Troops')}</button>
          <button type="button" className="accent-button" onClick={importAll} style={{ flex: 1, minWidth: '140px' }}>{t('buttons.importAll', {}, 'Import All')}</button>
        </div>
      </div>
      {DAYS.map((day, idx) => (
        <div key={idx} className="card-panel" style={{ marginTop: idx === 0 ? '0px' : '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>{day.title}</h2>
          <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            {day.fields.map(field => (
              <div key={field.id} className="gear-material-field">
                <label style={{ display: 'block', marginBottom: '8px' }}>{field.label}</label>
                <input
                  type="text"
                  value={svsState[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="global-select"
                  style={{ width: '100%' }}
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {results && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>{t("results.totals", {}, "Totals")}</h2>
          <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
            <strong style={{ color: 'var(--accent-color)' }}>{t("results.svsPointsBreakdown", {}, "SVS POINTS BREAKDOWN")}</strong><br />
            {t('svsDays.day1Totals', {}, 'Day 1 (City Construction)')}: {results.day1.toLocaleString()}<br />
            {t('svsDays.day2Totals', {}, 'Day 2 (Basic Skills Up)')}: {results.day2.toLocaleString()}<br />
            {t('svsDays.day3Totals', {}, 'Day 3 (Beast Slay)')}: {results.day3.toLocaleString()}<br />
            {t('svsDays.day4Totals', {}, 'Day 4 (Hero Development)')}: {results.day4.toLocaleString()}<br />
            {t('svsDays.day5Totals', {}, 'Day 5 (Power Boost)')}: {results.day5.toLocaleString()}<br />
            <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>{t('results.grandTotal', {}, 'GRAND TOTAL')}</strong>
            <span style={{ fontSize: '1.2em' }}>{results.total.toLocaleString()}</span>
          </div>
        </div>
      )}
    </section>
  );
};

export default SvS;
