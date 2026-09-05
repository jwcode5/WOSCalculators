import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import charmData from '../data/chiefCharm.json';
import { calculateChiefCharm } from '../logic/charmMath';

const PIECES = [
  { id: 'hat', label: 'Cap (Lancer)' },
  { id: 'watch', label: 'Watch (Lancer)' },
  { id: 'coat', label: 'Coat (Infantry)' },
  { id: 'pants', label: 'Pants (Infantry)' },
  { id: 'ring', label: 'Ring (Marksman)' },
  { id: 'shortStaff', label: 'Weapon (Marksman)' }
];

const ChiefCharm = () => {
  const { activeAccount, updateAccountState } = useAccounts();
  const levels = charmData.levelOrder;

  // Initialize 18 charm slots
  const initialCharmState = {};
  PIECES.forEach(piece => {
    [1, 2, 3].forEach(num => {
      initialCharmState[`${piece.id}_charm_${num}_Current`] = 'none';
      initialCharmState[`${piece.id}_charm_${num}_Target`] = 'none';
    });
  });

  const [charmState, setCharmState] = useState(initialCharmState);
  const [materials, setMaterials] = useState({
    charmDesigns: '',
    charmGuides: '',
    jewelSecrets: ''
  });
  const [initializedAccountId, setInitializedAccountId] = useState(null);

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.state && activeAccount.state.chiefCharm) {
        const loadedLevels = { ...activeAccount.state.chiefCharm.levels };
        Object.keys(loadedLevels).forEach(k => {
          if (loadedLevels[k] === 'Lv.0') loadedLevels[k] = 'none';
        });
        setCharmState(prev => ({ ...prev, ...loadedLevels }));
        setMaterials(prev => ({ ...prev, ...activeAccount.state.chiefCharm.materials }));
      }
      setInitializedAccountId(activeAccount.id);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount && initializedAccountId === activeAccount.id) {
      updateAccountState('chiefCharm', { levels: charmState, materials });
    }
  }, [charmState, materials, initializedAccountId]);

  const handleChangeCharm = (key, type, value) => {
    setCharmState(prev => {
      const newState = { ...prev, [`${key}_${type}`]: value };
      const curLvl = type === 'Current' ? value : prev[`${key}_Current`];
      const tgtLvl = type === 'Target' ? value : prev[`${key}_Target`];
      
      if (levels.indexOf(curLvl) > levels.indexOf(tgtLvl)) {
        if (type === 'Current') newState[`${key}_Target`] = curLvl;
        else newState[`${key}_Current`] = tgtLvl;
      }
      return newState;
    });
  };

  const handleChangeMat = (id, value) => {
    setMaterials(prev => ({ ...prev, [id]: value }));
  };


  const results = useMemo(() => {
    try {
      const currentLevels = {};
      const targetLevels = {};
      PIECES.forEach(piece => {
        [1, 2, 3].forEach(num => {
          const key = `${piece.id}_charm_${num}`;
          currentLevels[key] = charmState[`${key}_Current`];
          targetLevels[key] = charmState[`${key}_Target`];
        });
      });

      const inventory = {
        charmDesigns: parseFloat(materials.charmDesigns) || 0,
        charmGuides: parseFloat(materials.charmGuides) || 0,
        jewelSecrets: parseFloat(materials.jewelSecrets) || 0
      };

      return calculateChiefCharm({ currentLevels, targetLevels, materials: inventory, valeriaMult: 1 });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [charmState, materials]);

  return (
    <section id="chiefCharmPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Chief Charm Levels</h2>


        <div className="gear-table" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="gear-table-header" style={{ display: 'flex', gap: '16px', fontWeight: 'bold', marginBottom: '8px', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
            <span style={{ flex: 1.5 }}>Charm</span>
            <span style={{ flex: 1 }}>Current Level</span>
            <span style={{ flex: 1 }}>Target Level</span>
          </div>
          
          {PIECES.map(piece => (
            <React.Fragment key={piece.id}>
              {[1, 2, 3].map(num => {
                const key = `${piece.id}_charm_${num}`;
                return (
                  <div key={key} className="gear-table-block" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span className="gear-piece-label" style={{ flex: 1.5 }}>{piece.label} - Charm {num}</span>
                    <select 
                      className="global-select" style={{ flex: 1 }}
                      value={charmState[`${key}_Current`]}
                      onChange={(e) => handleChangeCharm(key, 'Current', e.target.value)}
                    >
                      {levels.map(l => <option key={l} value={l}>{charmData.levels[l]?.label || l}</option>)}
                    </select>
                    <select 
                      className="global-select" style={{ flex: 1 }}
                      value={charmState[`${key}_Target`]}
                      onChange={(e) => handleChangeCharm(key, 'Target', e.target.value)}
                    >
                      {levels.map(l => <option key={l} value={l}>{charmData.levels[l]?.label || l}</option>)}
                    </select>
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Your Materials</h2>
        <div className="three-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Charm Designs</label>
            <input type="text" value={materials.charmDesigns} onChange={(e) => handleChangeMat('charmDesigns', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Charm Guides</label>
            <input type="text" value={materials.charmGuides} onChange={(e) => handleChangeMat('charmGuides', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Jewel Secrets</label>
            <input type="text" value={materials.jewelSecrets} onChange={(e) => handleChangeMat('jewelSecrets', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
        </div>
      </div>

      {results && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Totals</h2>
          
          <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
            <strong style={{ color: 'var(--accent-color)' }}>MATERIALS REQUIRED FOR TARGET</strong><br />
            Charm Designs: {results.costs.charmDesigns.toLocaleString()}<br />
            Charm Guides: {results.costs.charmGuides.toLocaleString()}<br />
            Jewel Secrets: {results.costs.jewelSecrets.toLocaleString()}<br />
            
            <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>REMAINING MATERIALS AFTER UPGRADES</strong>
            Charm Designs: {results.remaining.charmDesigns.toLocaleString()}<br />
            Charm Guides: {results.remaining.charmGuides.toLocaleString()}<br />
            Jewel Secrets: {results.remaining.jewelSecrets.toLocaleString()}<br />
            
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
                        <th style={{ textAlign: 'left', padding: '4px' }}>Charm Slot</th>
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
                    Charm Designs: {results.optimized.resources.charmDesigns.toLocaleString()} | Charm Guides: {results.optimized.resources.charmGuides.toLocaleString()} | Jewel Secrets: {results.optimized.resources.jewelSecrets.toLocaleString()}
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

export default ChiefCharm;
