import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import expertData from '../data/expertsData.json';
import { calculateExpertUpgrade } from '../logic/expertMath';

const EXPERT_NAMES = Object.keys(expertData);

const Experts = () => {
  const { activeAccount, updateAccountState } = useAccounts();
  const [expertState, setExpertState] = useState({});
  const [materials, setMaterials] = useState({
    advancementSigils: '',
    compass: '',
    fieryHeart: '',
    sailOfConquest: ''
  });
  const [batchCurrent, setBatchCurrent] = useState('1');
  const [batchTarget, setBatchTarget] = useState('1');

  useEffect(() => {
    if (activeAccount && activeAccount.state && activeAccount.state.experts) {
      setExpertState(prev => ({ ...prev, ...activeAccount.state.experts.levels }));
      setMaterials(prev => ({ ...prev, ...activeAccount.state.experts.materials }));
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount) {
      updateAccountState('experts', { levels: expertState, materials });
    }
  }, [expertState, materials]);

  const handleChangeExpert = (name, type, value) => {
    setExpertState(prev => {
      const newState = { ...prev, [`${name}${type}`]: value };
      const curLvl = parseInt(type === 'Current' ? value : prev[`${name}Current`] || 1, 10);
      const tgtLvl = parseInt(type === 'Target' ? value : prev[`${name}Target`] || 1, 10);
      
      if (curLvl > tgtLvl) {
        if (type === 'Current') newState[`${name}Target`] = curLvl.toString();
        else newState[`${name}Current`] = tgtLvl.toString();
      }
      return newState;
    });
  };

  const handleChangeMat = (id, value) => {
    setMaterials(prev => ({ ...prev, [id]: value }));
  };

  const handleSetAllCurrent = () => {
    const newState = { ...expertState };
    EXPERT_NAMES.forEach(name => {
      newState[`${name}Current`] = batchCurrent;
    });
    setExpertState(newState);
  };

  const handleSetAllTarget = () => {
    const newState = { ...expertState };
    EXPERT_NAMES.forEach(name => {
      newState[`${name}Target`] = batchTarget;
    });
    setExpertState(newState);
  };

  const results = useMemo(() => {
    try {
      const targets = EXPERT_NAMES.map(name => ({
        name,
        curLvl: parseInt(expertState[`${name}Current`] || 1),
        tgtLvl: parseInt(expertState[`${name}Target`] || 1),
        specSigilsAvail: 0
      })).filter(t => t.curLvl < t.tgtLvl);

      const inventory = {
        genSigils: parseFloat(materials.advancementSigils) || 0,
        compass: parseFloat(materials.compass) || 0,
        fieryHeart: parseFloat(materials.fieryHeart) || 0,
        sail: parseFloat(materials.sailOfConquest) || 0
      };

      return calculateExpertUpgrade(targets, inventory);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [expertState, materials]);

  return (
    <section id="expertsPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Expert Levels</h2>
        
        <div className="pet-batch-controls" style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
          <div className="pet-batch-group" style={{ flex: 1, padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95em' }}>Set all current levels</label>
            <div className="pet-batch-inline" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select className="global-select" style={{ flex: 2 }} value={batchCurrent} onChange={e => setBatchCurrent(e.target.value)}>
                {Array.from({length: 80}, (_, i) => i + 1).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button type="button" className="inlineActionBtn inlineActionBtnPrimary" style={{ flex: 1 }} onClick={handleSetAllCurrent}>Set All</button>
            </div>
          </div>
          <div className="pet-batch-group" style={{ flex: 1, padding: '16px', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.95em' }}>Set all target levels</label>
            <div className="pet-batch-inline" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <select className="global-select" style={{ flex: 2 }} value={batchTarget} onChange={e => setBatchTarget(e.target.value)}>
                {Array.from({length: 80}, (_, i) => i + 1).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button type="button" className="inlineActionBtn inlineActionBtnPrimary" style={{ flex: 1 }} onClick={handleSetAllTarget}>Set All</button>
            </div>
          </div>
        </div>

        <div className="gear-table">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {EXPERT_NAMES.map(name => {
              const maxLvl = expertData[name]?.levels?.length || 80;
              const levels = Array.from({length: maxLvl}, (_, i) => i + 1);
              return (
                <div key={name} style={{ background: 'var(--glass-bg)', padding: '12px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>{name}</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <select 
                      className="global-select" style={{ flex: 1 }}
                      value={expertState[`${name}Current`] || 1}
                      onChange={(e) => handleChangeExpert(name, 'Current', e.target.value)}
                    >
                      {levels.map(l => <option key={l} value={l}>Lv {l}</option>)}
                    </select>
                    <select 
                      className="global-select" style={{ flex: 1 }}
                      value={expertState[`${name}Target`] || 1}
                      onChange={(e) => handleChangeExpert(name, 'Target', e.target.value)}
                    >
                      {levels.map(l => <option key={l} value={l}>Lv {l}</option>)}
                    </select>
                  </div>
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
            <label style={{ display: 'block', marginBottom: '8px' }}>Common Expert Sigil</label>
            <input type="text" value={materials.advancementSigils} onChange={(e) => handleChangeMat('advancementSigils', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Compass (10 Affinity)</label>
            <input type="text" value={materials.compass} onChange={(e) => handleChangeMat('compass', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Fiery Heart (100 Affinity)</label>
            <input type="text" value={materials.fieryHeart} onChange={(e) => handleChangeMat('fieryHeart', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Sail of Conquest (1000 Affinity)</label>
            <input type="text" value={materials.sailOfConquest} onChange={(e) => handleChangeMat('sailOfConquest', e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>
      </div>

      {results && results.totals && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>Totals</h2>
          <div>
            <p><strong>Total Affinity Needed:</strong> {results.totals.affinity.toLocaleString()}</p>
            <p><strong>Total General Sigils Needed:</strong> {results.totals.generalSigils.toLocaleString()}</p>
            <hr style={{ margin: '12px 0', borderColor: 'var(--glass-border)' }} />
            <p><strong>Affinity Remaining:</strong> {results.remaining.affinity.toLocaleString()}</p>
            <p><strong>General Sigils Remaining:</strong> {results.remaining.generalSigils.toLocaleString()}</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default Experts;
