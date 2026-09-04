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
  const [batchCurrent, setBatchCurrent] = useState('none');
  const [batchTarget, setBatchTarget] = useState('none');

  useEffect(() => {
    if (activeAccount && activeAccount.state && activeAccount.state.chiefCharm) {
      const loadedLevels = { ...activeAccount.state.chiefCharm.levels };
      Object.keys(loadedLevels).forEach(k => {
        if (loadedLevels[k] === 'Lv.0') loadedLevels[k] = 'none';
      });
      setCharmState(prev => ({ ...prev, ...loadedLevels }));
      setMaterials(prev => ({ ...prev, ...activeAccount.state.chiefCharm.materials }));
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount) {
      updateAccountState('chiefCharm', { levels: charmState, materials });
    }
  }, [charmState, materials]);

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

  const handleSetAllCurrent = () => {
    const newState = { ...charmState };
    PIECES.forEach(piece => {
      [1, 2, 3].forEach(num => {
        const key = `${piece.id}_charm_${num}`;
        newState[`${key}_Current`] = batchCurrent;
        
        // Ensure Target is at least the new Current
        const curIdx = levels.indexOf(batchCurrent);
        const tgtIdx = levels.indexOf(newState[`${key}_Target`]);
        if (curIdx > tgtIdx) {
          newState[`${key}_Target`] = batchCurrent;
        }
      });
    });
    setCharmState(newState);
  };

  const handleSetAllTarget = () => {
    const newState = { ...charmState };
    PIECES.forEach(piece => {
      [1, 2, 3].forEach(num => {
        const key = `${piece.id}_charm_${num}`;
        newState[`${key}_Target`] = batchTarget;
        
        // Ensure Current is at most the new Target
        const curIdx = levels.indexOf(newState[`${key}_Current`]);
        const tgtIdx = levels.indexOf(batchTarget);
        if (curIdx > tgtIdx && tgtIdx !== -1) {
          newState[`${key}_Current`] = batchTarget;
        }
      });
    });
    setCharmState(newState);
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
        
        <div className="charm-batch-row" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="charm-batch-controls" style={{ flex: 1, padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '0.95em', display: 'block', marginBottom: '8px' }}>Set all current levels</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select className="global-select" style={{ flex: 2 }} value={batchCurrent} onChange={e => setBatchCurrent(e.target.value)}>
                {levels.map(l => <option key={l} value={l}>{charmData.levels[l]?.label || l}</option>)}
              </select>
              <button type="button" className="inlineActionBtn inlineActionBtnPrimary" style={{ flex: 1 }} onClick={handleSetAllCurrent}>Set All</button>
            </div>
          </div>
          <div className="charm-batch-controls" style={{ flex: 1, padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ fontSize: '0.95em', display: 'block', marginBottom: '8px' }}>Set all target levels</label>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select className="global-select" style={{ flex: 2 }} value={batchTarget} onChange={e => setBatchTarget(e.target.value)}>
                {levels.map(l => <option key={l} value={l}>{charmData.levels[l]?.label || l}</option>)}
              </select>
              <button type="button" className="inlineActionBtn inlineActionBtnPrimary" style={{ flex: 1 }} onClick={handleSetAllTarget}>Set All</button>
            </div>
          </div>
        </div>

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
          
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ marginBottom: '8px', color: '#ffeb3b' }}>Materials Required for Target</h3>
            <p><strong>Charm Designs Needed:</strong> {results.costs.charmDesigns.toLocaleString()}</p>
            <p><strong>Charm Guides Needed:</strong> {results.costs.charmGuides.toLocaleString()}</p>
            <p><strong>Jewel Secrets Needed:</strong> {results.costs.jewelSecrets.toLocaleString()}</p>
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
                      Upgrade <strong>{step.slotLabel || step.slot}</strong> to {step.label}
                    </li>
                  ))}
                </ul>
                <h4 style={{ marginBottom: '8px' }}>Remaining Materials After Plan:</h4>
                <p>Designs: {results.optimized.resources.charmDesigns.toLocaleString()} | Guides: {results.optimized.resources.charmGuides.toLocaleString()} | Secrets: {results.optimized.resources.jewelSecrets.toLocaleString()}</p>
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

export default ChiefCharm;
