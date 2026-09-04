import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import gearData from '../data/chiefGear.json';
import { calculateChiefGear } from '../logic/gearMath';

const PIECES = [
  { id: 'hat', label: 'Cap (Lancer)' },
  { id: 'watch', label: 'Watch (Lancer)' },
  { id: 'coat', label: 'Coat (Infantry)' },
  { id: 'pants', label: 'Pants (Infantry)' },
  { id: 'ring', label: 'Ring (Marksman)' },
  { id: 'shortStaff', label: 'Weapon (Marksman)' }
];

const ChiefGear = () => {
  const { activeAccount, updateAccountState } = useAccounts();
  const levels = gearData.levelOrder;

  // State
  const [gearState, setGearState] = useState({
    hatCurrent: 'none', hatTarget: 'none',
    watchCurrent: 'none', watchTarget: 'none',
    coatCurrent: 'none', coatTarget: 'none',
    pantsCurrent: 'none', pantsTarget: 'none',
    ringCurrent: 'none', ringTarget: 'none',
    shortStaffCurrent: 'none', shortStaffTarget: 'none',
  });

  const [materials, setMaterials] = useState({
    hardenedAlloy: '',
    polishingSolution: '',
    designPlans: '',
    lunarAmber: ''
  });

  useEffect(() => {
    if (activeAccount && activeAccount.state && activeAccount.state.chiefGear) {
      const loadedLevels = { ...activeAccount.state.chiefGear.levels };
      Object.keys(loadedLevels).forEach(k => {
        if (loadedLevels[k] === 'Lv.0') loadedLevels[k] = 'none';
      });
      setGearState(prev => ({ ...prev, ...loadedLevels }));
      setMaterials(prev => ({ ...prev, ...activeAccount.state.chiefGear.materials }));
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount) {
      updateAccountState('chiefGear', { levels: gearState, materials });
    }
  }, [gearState, materials]);

  const handleChangeGear = (id, type, value) => {
    setGearState(prev => {
      const newState = { ...prev, [`${id}${type}`]: value };
      const curLvl = type === 'Current' ? value : prev[`${id}Current`];
      const tgtLvl = type === 'Target' ? value : prev[`${id}Target`];
      
      if (levels.indexOf(curLvl) > levels.indexOf(tgtLvl)) {
        if (type === 'Current') newState[`${id}Target`] = curLvl;
        else newState[`${id}Current`] = tgtLvl;
      }
      return newState;
    });
  };

  const handleChangeMat = (id, value) => {
    setMaterials(prev => ({ ...prev, [id]: value }));
  };

  const results = useMemo(() => {
    try {
      const currentLevels = {
        hat: gearState.hatCurrent, watch: gearState.watchCurrent,
        coat: gearState.coatCurrent, pants: gearState.pantsCurrent,
        ring: gearState.ringCurrent, shortStaff: gearState.shortStaffCurrent
      };
      const targetLevels = {
        hat: gearState.hatTarget, watch: gearState.watchTarget,
        coat: gearState.coatTarget, pants: gearState.pantsTarget,
        ring: gearState.ringTarget, shortStaff: gearState.shortStaffTarget
      };
      const inventory = {
        hardenedAlloy: parseFloat(materials.hardenedAlloy) || 0,
        polishingSolution: parseFloat(materials.polishingSolution) || 0,
        designPlans: parseFloat(materials.designPlans) || 0,
        lunarAmber: parseFloat(materials.lunarAmber) || 0
      };

      return calculateChiefGear({ currentLevels, targetLevels, materials: inventory, valeriaMult: 1 });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [gearState, materials]);

  return (
    <section id="chiefGearPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Chief Gear Levels</h2>
        <div className="gear-table" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="gear-table-header" style={{ display: 'flex', gap: '16px', fontWeight: 'bold', marginBottom: '8px' }}>
            <span style={{ flex: 1 }}>Piece</span>
            <span style={{ flex: 1 }}>Current Level</span>
            <span style={{ flex: 1 }}>Target Level</span>
          </div>
          
          {PIECES.map(piece => (
            <div key={piece.id} className="gear-table-block" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span className="gear-piece-label" style={{ flex: 1 }}>{piece.label}</span>
              <select 
                className="global-select" style={{ flex: 1 }}
                value={gearState[`${piece.id}Current`]}
                onChange={(e) => handleChangeGear(piece.id, 'Current', e.target.value)}
              >
                {levels.map(l => <option key={l} value={l}>{gearData.levels[l]?.label || l}</option>)}
              </select>
              <select 
                className="global-select" style={{ flex: 1 }}
                value={gearState[`${piece.id}Target`]}
                onChange={(e) => handleChangeGear(piece.id, 'Target', e.target.value)}
              >
                {levels.map(l => <option key={l} value={l}>{gearData.levels[l]?.label || l}</option>)}
              </select>
            </div>
          ))}
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Your Materials</h2>
        <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Hardened Alloy</label>
            <input type="text" value={materials.hardenedAlloy} onChange={(e) => handleChangeMat('hardenedAlloy', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Polishing Solution</label>
            <input type="text" value={materials.polishingSolution} onChange={(e) => handleChangeMat('polishingSolution', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Design Plans</label>
            <input type="text" value={materials.designPlans} onChange={(e) => handleChangeMat('designPlans', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Lunar Amber</label>
            <input type="text" value={materials.lunarAmber} onChange={(e) => handleChangeMat('lunarAmber', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
        </div>
      </div>

      {results && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Totals</h2>
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: '#ffeb3b' }}>Materials Required for Target</h3>
            <p><strong>Hardened Alloy Needed:</strong> {results.costs.hardenedAlloy.toLocaleString()}</p>
            <p><strong>Polishing Solution Needed:</strong> {results.costs.polishingSolution.toLocaleString()}</p>
            <p><strong>Design Plans Needed:</strong> {results.costs.designPlans.toLocaleString()}</p>
            <p><strong>Lunar Amber Needed:</strong> {results.costs.lunarAmber.toLocaleString()}</p>
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
                      Upgrade <strong>{PIECES.find(p => p.id === step.slot)?.label || step.slot}</strong> to {step.label}
                    </li>
                  ))}
                </ul>
                <h4 style={{ marginBottom: '8px' }}>Remaining Materials After Plan:</h4>
                <p>Alloy: {results.optimized.resources.hardenedAlloy.toLocaleString()} | Solution: {results.optimized.resources.polishingSolution.toLocaleString()} | Plans: {results.optimized.resources.designPlans.toLocaleString()} | Amber: {results.optimized.resources.lunarAmber.toLocaleString()}</p>
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

export default ChiefGear;
