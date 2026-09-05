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

  const [initializedAccountId, setInitializedAccountId] = useState(null);

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.state && activeAccount.state.chiefGear) {
        const loadedLevels = { ...activeAccount.state.chiefGear.levels };
        // Normalize 'Lv.0' to 'none' if present from older data
        Object.keys(loadedLevels).forEach(k => {
          if (loadedLevels[k] === 'Lv.0') loadedLevels[k] = 'none';
        });
        setGearState(prev => ({ ...prev, ...loadedLevels }));
        setMaterials(prev => ({ ...prev, ...activeAccount.state.chiefGear.materials }));
      }
      setInitializedAccountId(activeAccount.id);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount && initializedAccountId === activeAccount.id) {
      updateAccountState('chiefGear', { levels: gearState, materials });
    }
  }, [gearState, materials, initializedAccountId]);

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
          <div className="gear-table-header" style={{ display: 'flex', gap: '16px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
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
          
          <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
            <strong style={{ color: 'var(--accent-color)' }}>MATERIALS REQUIRED FOR TARGET</strong><br />
            Hardened Alloy: {results.costs.hardenedAlloy.toLocaleString()}<br />
            Polishing Solution: {results.costs.polishingSolution.toLocaleString()}<br />
            Design Plans: {results.costs.designPlans.toLocaleString()}<br />
            Lunar Amber: {results.costs.lunarAmber.toLocaleString()}<br />
            
            <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>REMAINING MATERIALS AFTER UPGRADES</strong>
            Hardened Alloy: {results.remainingMaterials.hardenedAlloy.toLocaleString()}<br />
            Polishing Solution: {results.remainingMaterials.polishingSolution.toLocaleString()}<br />
            Design Plans: {results.remainingMaterials.designPlans.toLocaleString()}<br />
            Lunar Amber: {results.remainingMaterials.lunarAmber.toLocaleString()}<br />
            
            <div className="card-panel" style={{ marginTop: '10px', background: '#1e2a3a', color: '#ffe08a', fontSize: '1.15em', textAlign: 'center' }}>
              <strong>SVS Points Gained:</strong> <span style={{ fontSize: '1.2em' }}>{results.totalSvsPoints.toLocaleString()}</span>
            </div>
          </div>

          {results.optimized && (
            <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
              <strong style={{ color: 'var(--accent-color)' }}>OPTIMIZED PLAN</strong><br />
              {results.optimized.plan.length > 0 ? (
                <>
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '8px' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                        <th style={{ textAlign: 'left', padding: '4px' }}>Gear Piece</th>
                        <th style={{ textAlign: 'left', padding: '4px' }}>Final Level</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.optimized.plan.map((step, idx) => (
                        <tr key={idx}>
                          <td style={{ padding: '4px' }}>{step.slot.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                          <td style={{ padding: '4px' }}>{step.label}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ marginTop: '10px' }}>
                    <strong>Materials Remaining:</strong><br />
                    Hardened Alloy: {results.optimized.resources.hardenedAlloy.toLocaleString()} | Polishing Solution: {results.optimized.resources.polishingSolution.toLocaleString()} | Design Plans: {results.optimized.resources.designPlans.toLocaleString()} | Lunar Amber: {results.optimized.resources.lunarAmber.toLocaleString()}
                  </div>
                </>
              ) : (
                <em style={{ display: 'block', marginTop: '8px' }}>No upgrades possible with current resources.</em>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ChiefGear;
