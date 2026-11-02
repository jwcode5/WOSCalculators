import { useLanguage } from '../context/LanguageContext';
import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import petData from '../data/petUpgrades.tiered.json';
import { calculateMultiPetUpgrade } from '../logic/petMath';

const PET_ORDER = [
  "Cave Hyena", "Arctic Wolf", "Musk Ox", "Giant Tapir", "Titan Roc",
  "Giant Elk", "Snow Leopard", "Cave Lion", "Snow Ape", "Iron Rhino",
  "Saber-Tooth Tiger", "Mammoth", "Frost Gorilla", "Frostscale Chameleon",
  "Abyssal Shelldragon"
];

const Pets = () => {
  const { t } = useLanguage();
  const { activeAccount, updateAccountState } = useAccounts();
  const [petState, setPetState] = useState({});
  const [materials, setMaterials] = useState({
    petFood: '',
    tamingManual: '',
    energizingPotion: '',
    strengtheningSerum: ''
  });
  const [initializedAccountId, setInitializedAccountId] = useState(null);

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.state && activeAccount.state.pets) {
        setPetState(prev => ({ ...prev, ...activeAccount.state.pets.levels }));
        setMaterials(prev => ({ ...prev, ...activeAccount.state.pets.materials }));
      }
      setInitializedAccountId(activeAccount.id);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount && initializedAccountId === activeAccount.id) {
      updateAccountState('pets', { levels: petState, materials });
    }
  }, [petState, materials, initializedAccountId]);

  const getPetKey = (name) => name.charAt(0).toLowerCase() + name.slice(1).replace(/ /g, '').replace(/-/g, '');

  const getLevels = (petInfo) => {
    let levels = [];
    if (petInfo.customUpgrades) {
      levels = petInfo.customUpgrades.map(u => u.level);
    } else {
      levels = petData.tiers[petInfo.tier]?.upgrades.map(u => u.level) || [];
    }
    return ["Not Tamed", ...levels];
  };

  const handleChangePet = (key, type, value, levels) => {
    setPetState(prev => {
      const newState = { ...prev, [`${key}${type}`]: String(value) };
      const curLvl = type === 'Current' ? String(value) : String(prev[`${key}Current`] || levels[0]);
      const tgtLvl = type === 'Target' ? String(value) : String(prev[`${key}Target`] || levels[0]);
      
      const curIdx = levels.findIndex(l => String(l) === curLvl);
      const tgtIdx = levels.findIndex(l => String(l) === tgtLvl);

      if (curIdx > tgtIdx && curIdx !== -1) {
        if (type === 'Current') newState[`${key}Target`] = String(levels[curIdx]);
        else newState[`${key}Current`] = String(levels[tgtIdx]);
      }
      return newState;
    });
  };

  const handleChangeMat = (id, value) => {
    setMaterials(prev => ({ ...prev, [id]: value }));
  };


  const results = useMemo(() => {
    try {
      const targets = [];
      PET_ORDER.forEach(name => {
        const petInfo = petData.pets[name];
        if (!petInfo) return;
        const key = getPetKey(name);
        const currentLevel = petState[`${key}Current`] || 'Not Tamed';
        const targetLevel = petState[`${key}Target`] || 'Not Tamed';
        
        targets.push({
          name,
          currentLevel,
          targetLevel
        });
      });

      const inventory = {
        petFood: parseFloat(materials.petFood) || 0,
        tamingManual: parseFloat(materials.tamingManual) || 0,
        energizingPotion: parseFloat(materials.energizingPotion) || 0,
        strengtheningSerum: parseFloat(materials.strengtheningSerum) || 0
      };

      return calculateMultiPetUpgrade(targets, inventory);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [petState]);

  return (
    <section id="petsPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.petCollection', {}, 'Pet Collection')}</h2>
        

        <div className="gear-table" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div className="gear-table-header" style={{ display: 'flex', gap: '16px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
            <span style={{ flex: 1.5 }}>{t('labels.pet', {}, 'Pet')}</span>
            <span style={{ flex: 1 }}>{t('labels.currentLevel', {}, 'Current Level')}</span>
            <span style={{ flex: 1 }}>{t('labels.targetLevel', {}, 'Target Level')}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PET_ORDER.map((name, index) => {
              const petInfo = petData.pets[name];
              if (!petInfo) return null;
              const key = getPetKey(name);
              const levels = getLevels(petInfo);
              const tier = petInfo.tier || "";
              
              let divider = null;
              if (index > 0) {
                const prevName = PET_ORDER[index - 1];
                const prevData = petData.pets[prevName];
                const reqLevel = (prevData.tier === "SSR") ? 30 : 15;
                
                divider = (
                  <div key={`div-${name}`} style={{ height: '2px', background: 'linear-gradient(90deg, transparent, rgba(255,224,138,0.3), transparent)', margin: '10px 0', position: 'relative' }}>
                    <span style={{ position: 'absolute', right: '10px', top: '-12px', fontSize: '0.65em', color: '#ffe08a', fontStyle: 'italic', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('labels.reachUnlockNext', { reqLevel }, `Reach Lv.${reqLevel} to unlock next`)}</span>
                  </div>
                );
              }
              
              return (
                <React.Fragment key={name}>
                  {divider}
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '8px 10px', borderBottom: index < PET_ORDER.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                    <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontWeight: 500, fontSize: '0.95em' }}>{t(`pets.${name.replace(/\s+/g, '')}`, {}, name)}</span>
                      {tier && <span style={{ fontSize: '0.7em', fontWeight: 'bold', opacity: 0.7, textTransform: 'uppercase' }}>{tier}</span>}
                    </div>
                    <select 
                      className="global-select" style={{ flex: 1 }}
                      value={petState[`${key}Current`] || 'Not Tamed'}
                      onChange={(e) => handleChangePet(key, 'Current', e.target.value, levels)}
                    >
                      {levels.map(l => <option key={l} value={l}>{l === 'Not Tamed' ? t('labels.notTamed', {}, 'Not Tamed') : l}</option>)}
                    </select>
                    <select 
                      className="global-select" style={{ flex: 1 }}
                      value={petState[`${key}Target`] || 'Not Tamed'}
                      onChange={(e) => handleChangePet(key, 'Target', e.target.value, levels)}
                    >
                      {levels.map(l => <option key={l} value={l}>{l === 'Not Tamed' ? t('labels.notTamed', {}, 'Not Tamed') : l}</option>)}
                    </select>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.expertSkillsMaterials', {}, 'Your Materials')}</h2>
        <div className="four-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.petFood', {}, 'Pet Food')}</label>
            <input type="text" value={materials.petFood} onChange={(e) => handleChangeMat('petFood', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.tamingManual', {}, 'Taming Manual')}</label>
            <input type="text" value={materials.tamingManual} onChange={(e) => handleChangeMat('tamingManual', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.energizingPotion', {}, 'Energizing Potion')}</label>
            <input type="text" value={materials.energizingPotion} onChange={(e) => handleChangeMat('energizingPotion', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.strengtheningSerum', {}, 'Strengthening Serum')}</label>
            <input type="text" value={materials.strengtheningSerum} onChange={(e) => handleChangeMat('strengtheningSerum', e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>
      </div>

      {results && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>{t('results.totals', {}, 'Totals')}</h2>
          
          <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
            <strong style={{ color: 'var(--accent-color)' }}>{t('results.targetUpgradesTotal', {}, 'TARGET UPGRADES TOTAL')}</strong><br />
            {t('labels.petFood', {}, 'Pet Food')}: {results.costs.petFood.toLocaleString()}<br />
            {t('labels.tamingManual', {}, 'Taming Manuals')}: {results.costs.tamingManual.toLocaleString()}<br />
            {t('labels.energizingPotion', {}, 'Energizing Potions')}: {results.costs.energizingPotion.toLocaleString()}<br />
            {t('labels.strengtheningSerum', {}, 'Strengthening Serums')}: {results.costs.strengtheningSerum.toLocaleString()}<br />
            
            <div className="card-panel" style={{ marginTop: '10px', background: '#1e2a3a', color: '#ffe08a', fontSize: '1.15em', textAlign: 'center' }}>
              <strong>{t('results.svsPointsGained', {}, 'SVS Points Gained:')}</strong> <span style={{ fontSize: '1.2em' }}>{results.totalSvsPoints.toLocaleString()}</span>
            </div>
          </div>

          {results.optimized && (
            <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
              <strong style={{ color: 'var(--accent-color)' }}>{t('results.optimizedPlan', {}, 'OPTIMIZED PLAN')}</strong><br />
              {t('results.basedOnResources', {}, 'Based on your available resources:')}<br />
              {results.optimized.plan.length > 0 ? (
                <>
                  {results.optimized.plan.map((step, idx) => (
                    <div key={idx} style={{ marginTop: '10px' }}>
                      <strong>{t(`pets.${step.slot.replace(/\s+/g, '')}`, {}, step.slot)}</strong> (→ {step.label === 'Not Tamed' ? t('labels.notTamed', {}, 'Not Tamed') : step.label})
                    </div>
                  ))}
                  <div style={{ marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                    <strong>{t('results.totalCost', {}, 'Total Cost:')}</strong><br />
                    {t('labels.petFood', {}, 'Food')}: {((parseFloat(materials.petFood)||0) - results.optimized.resources.petFood).toLocaleString()} | {t('labels.tamingManual', {}, 'Manuals')}: {((parseFloat(materials.tamingManual)||0) - results.optimized.resources.tamingManual).toLocaleString()} | {t('labels.energizingPotion', {}, 'Potions')}: {((parseFloat(materials.energizingPotion)||0) - results.optimized.resources.energizingPotion).toLocaleString()} | {t('labels.strengtheningSerum', {}, 'Serums')}: {((parseFloat(materials.strengtheningSerum)||0) - results.optimized.resources.strengtheningSerum).toLocaleString()}<br />
                    <strong>{t('results.totalSvsPointsGainedText', {}, 'Total SVS Points Gained:')} {results.optimized.svsPoints.toLocaleString()}</strong>
                  </div>
                </>
              ) : (
                <em style={{ display: 'block', marginTop: '8px' }}>{t('results.noPetUpgrades', {}, 'No target upgrades selected and no optimized upgrades possible with current materials.')}</em>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default Pets;
