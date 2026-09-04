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
  const { activeAccount, updateAccountState } = useAccounts();
  const [petState, setPetState] = useState({});
  const [materials, setMaterials] = useState({
    petFood: '',
    tamingManual: '',
    energizingPotion: '',
    strengtheningSerum: ''
  });
  const [batchCurrent, setBatchCurrent] = useState('Not Tamed');
  const [batchTarget, setBatchTarget] = useState('Not Tamed');

  useEffect(() => {
    if (activeAccount && activeAccount.state && activeAccount.state.pets) {
      setPetState(prev => ({ ...prev, ...activeAccount.state.pets.levels }));
      setMaterials(prev => ({ ...prev, ...activeAccount.state.pets.materials }));
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount) {
      updateAccountState('pets', { levels: petState, materials });
    }
  }, [petState, materials]);

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

  const handleSetAllCurrent = () => {
    const newState = { ...petState };
    PET_ORDER.forEach(name => {
      const petInfo = petData.pets[name];
      if (!petInfo) return;
      const levels = getLevels(petInfo);
      const key = getPetKey(name);
      newState[`${key}Current`] = String(batchCurrent);
      
      const curIdx = levels.findIndex(l => String(l) === String(batchCurrent));
      const tgtIdx = levels.findIndex(l => String(l) === String(newState[`${key}Target`] || levels[0]));
      
      if (curIdx > tgtIdx && curIdx !== -1) {
        newState[`${key}Target`] = String(levels[curIdx]);
      }
    });
    setPetState(newState);
  };

  const handleSetAllTarget = () => {
    const newState = { ...petState };
    PET_ORDER.forEach(name => {
      const petInfo = petData.pets[name];
      if (!petInfo) return;
      const levels = getLevels(petInfo);
      const key = getPetKey(name);
      newState[`${key}Target`] = String(batchTarget);
      
      const curIdx = levels.findIndex(l => String(l) === String(newState[`${key}Current`] || levels[0]));
      const tgtIdx = levels.findIndex(l => String(l) === String(batchTarget));
      
      if (curIdx > tgtIdx && tgtIdx !== -1) {
        newState[`${key}Current`] = String(levels[tgtIdx]);
      }
    });
    setPetState(newState);
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
        <h2 style={{ marginBottom: '16px' }}>Pet Collection</h2>
        
        <div className="pet-batch-controls" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="pet-batch-group" style={{ flex: 1, padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95em' }}>Set all current levels</label>
            <div className="pet-batch-inline" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select className="global-select" style={{ flex: 2 }} value={batchCurrent} onChange={e => setBatchCurrent(e.target.value)}>
                <option value="Not Tamed">Not Tamed</option>
                {Array.from({length: 120}, (_, i) => i + 1).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button type="button" className="inlineActionBtn inlineActionBtnPrimary" style={{ flex: 1 }} onClick={handleSetAllCurrent}>Set All</button>
            </div>
          </div>
          <div className="pet-batch-group" style={{ flex: 1, padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95em' }}>Set all target levels</label>
            <div className="pet-batch-inline" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select className="global-select" style={{ flex: 2 }} value={batchTarget} onChange={e => setBatchTarget(e.target.value)}>
                <option value="Not Tamed">Not Tamed</option>
                {Array.from({length: 120}, (_, i) => i + 1).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button type="button" className="inlineActionBtn inlineActionBtnPrimary" style={{ flex: 1 }} onClick={handleSetAllTarget}>Set All</button>
            </div>
          </div>
        </div>

        <div className="gear-table" style={{ background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%)', padding: '20px', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
          <div className="gear-table-header" style={{ display: 'flex', gap: '16px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
            <span style={{ flex: 1.5 }}>Pet</span>
            <span style={{ flex: 1 }}>Current Level</span>
            <span style={{ flex: 1 }}>Target Level</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {PET_ORDER.map(name => {
              const petInfo = petData.pets[name];
              if (!petInfo) return null;
              const key = getPetKey(name);
              const levels = getLevels(petInfo);
              
              return (
                <div key={name} style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ flex: 1.5 }}>{name} ({petInfo.tier})</span>
                  <select 
                    className="global-select" style={{ flex: 1 }}
                    value={petState[`${key}Current`] || 'Not Tamed'}
                    onChange={(e) => handleChangePet(key, 'Current', e.target.value, levels)}
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <select 
                    className="global-select" style={{ flex: 1 }}
                    value={petState[`${key}Target`] || 'Not Tamed'}
                    onChange={(e) => handleChangePet(key, 'Target', e.target.value, levels)}
                  >
                    {levels.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Your Materials</h2>
        <div className="four-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Pet Food</label>
            <input type="text" value={materials.petFood} onChange={(e) => handleChangeMat('petFood', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Taming Manual</label>
            <input type="text" value={materials.tamingManual} onChange={(e) => handleChangeMat('tamingManual', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Energizing Potion</label>
            <input type="text" value={materials.energizingPotion} onChange={(e) => handleChangeMat('energizingPotion', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Strengthening Serum</label>
            <input type="text" value={materials.strengtheningSerum} onChange={(e) => handleChangeMat('strengtheningSerum', e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>
      </div>

      {results && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Totals</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: '#ffeb3b' }}>Materials Required for Target</h3>
            <p><strong>Pet Food Needed:</strong> {results.costs.petFood.toLocaleString()}</p>
            <p><strong>Taming Manuals Needed:</strong> {results.costs.tamingManual.toLocaleString()}</p>
            <p><strong>Energizing Potions Needed:</strong> {results.costs.energizingPotion.toLocaleString()}</p>
            <p><strong>Strengthening Serums Needed:</strong> {results.costs.strengtheningSerum.toLocaleString()}</p>
          </div>

          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <h3 style={{ marginBottom: '12px', color: '#4CAF50' }}>SvS Points</h3>
            <p style={{ fontSize: '1.2em' }}><strong>{results.totalSvsPoints.toLocaleString()} Points</strong></p>
          </div>

          <div>
            <h3 style={{ marginBottom: '12px', color: '#03A9F4' }}>Smart Upgrade Plan (Based on Your Materials)</h3>
            {results.optimized && results.optimized.plan.length > 0 ? (
              <>
                <ul style={{ listStyleType: 'disc', paddingLeft: '20px', marginBottom: '16px' }}>
                  {results.optimized.plan.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>
                      Upgrade <strong>{step.slot}</strong> to {step.label}
                    </li>
                  ))}
                </ul>
                <h4 style={{ marginBottom: '8px' }}>Remaining Materials After Plan:</h4>
                <p>Food: {results.optimized.resources.petFood.toLocaleString()} | Manuals: {results.optimized.resources.tamingManual.toLocaleString()} | Potions: {results.optimized.resources.energizingPotion.toLocaleString()} | Serums: {results.optimized.resources.strengtheningSerum.toLocaleString()}</p>
              </>
            ) : (
              <p>You don't have enough materials to make any upgrades toward your target.</p>
            )}
          </div>
        </div>
      )}
    </section>
  );
};

export default Pets;
