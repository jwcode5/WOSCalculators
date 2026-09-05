import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import { calculateSvs } from '../logic/svsMath';

const SvS = () => {
  const { activeAccount, updateAccountState } = useAccounts();
  const [svsState, setSvsState] = useState({});

  const [initializedAccountId, setInitializedAccountId] = useState(null);

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.state && activeAccount.state.svs) {
        setSvsState(activeAccount.state.svs);
      }
      setInitializedAccountId(activeAccount.id);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount && initializedAccountId === activeAccount.id) {
      updateAccountState('svs', svsState);
    }
  }, [svsState, initializedAccountId]);

  const handleChange = (id, value) => {
    setSvsState(prev => ({ ...prev, [id]: parseFloat(value) || 0 }));
  };

  const results = useMemo(() => {
    try {
      return calculateSvs(svsState);
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [svsState]);

  return (
    <section id="svsPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Day 1: Upgrades (FC / Speedups / Charm)</h2>
        <div className="four-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Fire Crystals</label>
            <input type="text" value={svsState.d1_fc || ''} onChange={(e) => handleChange('d1_fc', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Speedups (Mins)</label>
            <input type="text" value={svsState.d1_speedups || ''} onChange={(e) => handleChange('d1_speedups', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Charm Guides</label>
            <input type="text" value={svsState.d1_charm || ''} onChange={(e) => handleChange('d1_charm', e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>
      </div>

      <div className="card-panel" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Day 2: Heroes (Wheel / Shards)</h2>
        <div className="four-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Mythic Shards</label>
            <input type="text" value={svsState.d2_mythicHero || ''} onChange={(e) => handleChange('d2_mythicHero', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Lucky Wheel Spins</label>
            <input type="text" value={svsState.d2_luckyWheel || ''} onChange={(e) => handleChange('d2_luckyWheel', e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>
      </div>
      
      {/* Shortened for React port proof of concept */}
      <div className="card-panel" style={{ marginTop: '24px' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          Note: This is an accelerated demo. Additional days (3-6) will be ported using the same structural pattern.
        </p>
      </div>

      {results && (
        <div className="card-panel" style={{ marginTop: '24px' }}>
          <h2 style={{ marginBottom: '16px' }}>SvS Point Totals</h2>
          <div>
            <p><strong>Day 1:</strong> {results.day1.toLocaleString()} points</p>
            <p><strong>Day 2:</strong> {results.day2.toLocaleString()} points</p>
            <hr style={{ margin: '12px 0', borderColor: 'var(--glass-border)' }} />
            <p><strong>Total:</strong> {results.total.toLocaleString()} points</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SvS;
