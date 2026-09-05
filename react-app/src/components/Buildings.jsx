import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import buildingData from '../data/buildings.json';
import { calculateBuildingUpgrade, getAggregatedPrerequisites, getBuildingLevelOrder } from '../logic/upgradeMath';

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const days    = Math.floor(seconds / 86400);
  const hours   = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs    = seconds % 60;
  const parts = [];
  if (days)    parts.push(`${days}d`);
  if (hours)   parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs || !parts.length) parts.push(`${secs}s`);
  return parts.join(' ');
}

// Parses resource strings like "1.2B", "500M", "2.5K", or plain numbers.
function parseResourceAmount(rawInput) {
  const text = String(rawInput || '').trim().replace(/,/g, '').toUpperCase();
  if (!text) return 0;
  const match = text.match(/^([0-9]*\.?[0-9]+)\s*([KMB])?$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  if (Number.isNaN(value) || value < 0) return 0;
  const suffix = match[2] || '';
  const multiplier = suffix === 'B' ? 1_000_000_000 : suffix === 'M' ? 1_000_000 : suffix === 'K' ? 1_000 : 1;
  return Math.round(value * multiplier);
}

const Buildings = () => {
  const { activeAccount, accounts, setActiveAccountId, updateAccountState } = useAccounts();
  
  // State
  const [targetBuilding, setTargetBuilding] = useState('furnace');
  const [currentLevel, setCurrentLevel] = useState('1');
  const [targetLevel, setTargetLevel] = useState('2');
  
  // Resources State
  const [meat, setMeat] = useState('');
  const [wood, setWood] = useState('');
  const [coal, setCoal] = useState('');
  const [iron, setIron] = useState('');
  const [fireCrystals, setFireCrystals] = useState('');
  const [refinedFireCrystals, setRefinedFireCrystals] = useState('');
  const [useCustomChests, setUseCustomChests] = useState(false);
  const [chestCounts, setChestCounts] = useState({
    unsecuredLv1: '', unsecuredLv2: '', unsecuredLv3: '',
    securedLv1: '', securedLv2: '', securedLv3: ''
  });

  const [generalSpeedups, setGeneralSpeedups] = useState('');
  const [constructionSpeedups, setConstructionSpeedups] = useState('');
  
  // Buffs State
  const [doubleTimeEnabled, setDoubleTimeEnabled] = useState(false);
  const [castleBuffEnabled, setCastleBuffEnabled] = useState(false);
  const [constructionSpeedPct, setConstructionSpeedPct] = useState('');
  const [hyenaBuffPct, setHyenaBuffPct] = useState('');
  const [zinmanBastionistPct, setZinmanBastionistPct] = useState('');
  const [agnusProjectManagementHours, setAgnusProjectManagementHours] = useState('');
  const [positionBuffPct, setPositionBuffPct] = useState('');

  // Bear Hunt State
  const [bearHuntMails, setBearHuntMails] = useState([]);

  // Optional Buildings State
  const [optionalBuildings, setOptionalBuildings] = useState([]);

  const buildingsObject = buildingData.buildings || buildingData;
  const buildingKeys = Object.keys(buildingsObject);
  const getLevelsForBuilding = (b) => buildingsObject[b] ? Object.keys(buildingsObject[b]) : [];
  const levels = getLevelsForBuilding(targetBuilding);

  // Load state when switching accounts
  useEffect(() => {
    if (activeAccount && activeAccount.state && activeAccount.state.buildings) {
      const state = activeAccount.state.buildings;
      setTargetBuilding((state.targetBuilding || 'furnace').toLowerCase());
      setCurrentLevel(state.currentLevel || '1');
      setTargetLevel(state.targetLevel || '2');
      setMeat(state.meat || '');
      setWood(state.wood || '');
      setCoal(state.coal || '');
      setIron(state.iron || '');
      setFireCrystals(state.fireCrystals || '');
      setRefinedFireCrystals(state.refinedFireCrystals || '');
      setUseCustomChests(state.useCustomChests || false);
      setChestCounts(state.chestCounts || {
        unsecuredLv1: '', unsecuredLv2: '', unsecuredLv3: '',
        securedLv1: '', securedLv2: '', securedLv3: ''
      });
      setGeneralSpeedups(state.generalSpeedups || '');
      setConstructionSpeedups(state.constructionSpeedups || '');
      setDoubleTimeEnabled(state.doubleTimeEnabled || false);
      setCastleBuffEnabled(state.castleBuffEnabled || false);
      setConstructionSpeedPct(state.constructionSpeedPct || '');
      setHyenaBuffPct(state.hyenaBuffPct || '');
      setZinmanBastionistPct(state.zinmanBastionistPct || '');
      setAgnusProjectManagementHours(state.agnusProjectManagementHours || '');
      setPositionBuffPct(state.positionBuffPct || '');
      setBearHuntMails(state.bearHuntMails || []);
      setOptionalBuildings((state.optionalBuildings || []).map(b => ({...b, building: (b.building || 'furnace').toLowerCase()})));
    }
  }, [activeAccount?.id]);

  // Save state to context on change
  useEffect(() => {
    if (activeAccount) {
      updateAccountState('buildings', { 
        targetBuilding, currentLevel, targetLevel, meat, wood, coal, iron,
        fireCrystals, refinedFireCrystals, useCustomChests, chestCounts,
        generalSpeedups, constructionSpeedups, doubleTimeEnabled, castleBuffEnabled,
        constructionSpeedPct, hyenaBuffPct, zinmanBastionistPct, agnusProjectManagementHours,
        positionBuffPct, bearHuntMails, optionalBuildings
      });
    }
  }, [
    targetBuilding, currentLevel, targetLevel, meat, wood, coal, iron,
    fireCrystals, refinedFireCrystals, useCustomChests, chestCounts,
    generalSpeedups, constructionSpeedups, doubleTimeEnabled, castleBuffEnabled,
    constructionSpeedPct, hyenaBuffPct, zinmanBastionistPct, agnusProjectManagementHours,
    positionBuffPct, bearHuntMails, optionalBuildings
  ]);
  
  // Auto-populate required buildings into the Additional Buildings list
  useEffect(() => {
    const prereqs = getAggregatedPrerequisites(targetBuilding, currentLevel, targetLevel);
    if (!prereqs || prereqs.size === 0) return;

    setOptionalBuildings(prev => {
      let updated = [...prev];
      let changed = false;

      for (const [bName, reqLvl] of prereqs.entries()) {
        const existingIdx = updated.findIndex(b => b.building === bName);
        if (existingIdx >= 0) {
          const levels = getBuildingLevelOrder(bName);
          const currentTargetIdx = levels.indexOf(updated[existingIdx].targetLevel);
          const reqLvlIdx = levels.indexOf(reqLvl);
          if (currentTargetIdx < reqLvlIdx) {
            updated[existingIdx] = { ...updated[existingIdx], targetLevel: reqLvl };
            changed = true;
          }
        } else {
          const levels = getBuildingLevelOrder(bName);
          updated.push({
            id: Date.now() + Math.random(),
            building: bName,
            currentLevel: levels[0] || '1',
            targetLevel: reqLvl
          });
          changed = true;
        }
      }
      return changed ? updated : prev;
    });
  }, [targetBuilding, currentLevel, targetLevel]);

  // Mock calculate function - passing minimal required data to our ported logic function
  const results = useMemo(() => {
    try {
      const bhmTotals = { meat: 0, wood: 0, coal: 0, iron: 0 };
      // Parse bear hunt tiers
      const TIER_DATA = {
        "1 – 2.5K": { meat: 495500, wood: 495500, coal: 99000, iron: 25000 },
        "2.5K – 5K": { meat: 991500, wood: 991500, coal: 198500, iron: 50000 },
        "5K – 8K": { meat: 1400000, wood: 1400000, coal: 297500, iron: 75000 },
        "8K – 12K": { meat: 1900000, wood: 1900000, coal: 396500, iron: 100000 },
        "12K – 27.5K": { meat: 2400000, wood: 2400000, coal: 495500, iron: 125000 },
        "27.5K – 62.5K": { meat: 4300000, wood: 4300000, coal: 867500, iron: 218500 },
        "62.5K – 145K": { meat: 6100000, wood: 6100000, coal: 1200000, iron: 312500 },
        "145K – 325K": { meat: 8000000, wood: 8000000, coal: 1600000, iron: 406000 },
        "325K – 745K": { meat: 9900000, wood: 9900000, coal: 1900000, iron: 499500 },
        "745K – 1.7M": { meat: 11700000, wood: 11700000, coal: 2300000, iron: 593500 },
        "1.7M – 3.9M": { meat: 13800000, wood: 13800000, coal: 2700000, iron: 687000 },
        "3.9M – 8.9M": { meat: 15400000, wood: 15400000, coal: 3000000, iron: 781000 },
        "8.9M – 20.5M": { meat: 18000000, wood: 18000000, coal: 3600000, iron: 900000 },
        "20.5M – 47M": { meat: 19800000, wood: 19800000, coal: 3900000, iron: 1000000 },
        "47M – 90M": { meat: 22600000, wood: 22600000, coal: 4500000, iron: 1100000 },
        "90M – 175M": { meat: 24000000, wood: 24000000, coal: 4800000, iron: 1200000 },
        "175M – 330M": { meat: 25500000, wood: 25500000, coal: 5100000, iron: 1200000 },
        "330M – 635M": { meat: 27700000, wood: 27700000, coal: 5500000, iron: 1300000 },
        "635M – 1.2B": { meat: 29900000, wood: 29900000, coal: 5900000, iron: 1500000 },
        "1.2B – 2.4B": { meat: 32200000, wood: 32200000, coal: 6400000, iron: 1600000 },
        "2.4B – 4.8B": { meat: 34100000, wood: 34100000, coal: 6800000, iron: 1700000 }
      };
      
      bearHuntMails.forEach(mail => {
        if (mail.label && TIER_DATA[mail.label]) {
          bhmTotals.meat += TIER_DATA[mail.label].meat;
          bhmTotals.wood += TIER_DATA[mail.label].wood;
          bhmTotals.coal += TIER_DATA[mail.label].coal;
          bhmTotals.iron += TIER_DATA[mail.label].iron;
        }
      });

      const buildingsToCalc = [
        { building: targetBuilding, currentLevel, targetLevel },
        ...optionalBuildings.map(ob => ({
          building: ob.building,
          currentLevel: ob.currentLevel,
          targetLevel: ob.targetLevel
        }))
      ];

      return calculateBuildingUpgrade({
        buildingsToCalc,
        backpack: {
          meat: parseResourceAmount(meat),
          wood: parseResourceAmount(wood),
          coal: parseResourceAmount(coal),
          iron: parseResourceAmount(iron),
          fireCrystals: parseResourceAmount(fireCrystals),
          refinedFireCrystals: parseResourceAmount(refinedFireCrystals)
        },
        bearHuntTotals: bhmTotals,
        buffs: { 
          constructionSpeedPct: parseFloat(constructionSpeedPct) || 0, 
          hyenaBuffPct: parseFloat(hyenaBuffPct) || 0, 
          zinmanResourceDiscountPct: parseFloat(zinmanBastionistPct) || 0, 
          agnusProjectManagementHours: parseFloat(agnusProjectManagementHours) || 0, 
          doubleTimePct: doubleTimeEnabled ? 20 : 0, 
          castleBuffPct: castleBuffEnabled ? 10 : 0, 
          positionBuffPct: parseFloat(positionBuffPct) || 0 
        },
        speedups: { 
          generalMinutes: parseFloat(generalSpeedups) || 0, 
          constructionMinutes: parseFloat(constructionSpeedups) || 0 
        },
        useCustomChests: useCustomChests,
        chestCounts: {
          unsecuredLv1: parseFloat(chestCounts.unsecuredLv1) || 0,
          unsecuredLv2: parseFloat(chestCounts.unsecuredLv2) || 0,
          unsecuredLv3: parseFloat(chestCounts.unsecuredLv3) || 0,
          securedLv1: parseFloat(chestCounts.securedLv1) || 0,
          securedLv2: parseFloat(chestCounts.securedLv2) || 0,
          securedLv3: parseFloat(chestCounts.securedLv3) || 0
        },
        valeriaMult: 1
      });
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [
    targetBuilding, currentLevel, targetLevel, meat, wood, coal, iron, 
    fireCrystals, refinedFireCrystals, useCustomChests, chestCounts,
    generalSpeedups, constructionSpeedups, doubleTimeEnabled, castleBuffEnabled,
    constructionSpeedPct, hyenaBuffPct, zinmanBastionistPct, agnusProjectManagementHours,
    positionBuffPct, bearHuntMails, optionalBuildings
  ]);

  return (
    <section id="upgradeCalculatorPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Target Building (React Demo)</h2>
        <div className="three-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Building</label>
            <select className="global-select" value={targetBuilding} onChange={(e) => setTargetBuilding(e.target.value)}>
              {buildingKeys.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Current Level</label>
            <select className="global-select" value={currentLevel} onChange={(e) => {
              const val = e.target.value;
              setCurrentLevel(val);
              if (levels.indexOf(val) > levels.indexOf(targetLevel)) {
                setTargetLevel(val);
              }
            }}>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Target (Goal) Level</label>
            <select className="global-select" value={targetLevel} onChange={(e) => {
              const val = e.target.value;
              setTargetLevel(val);
              if (levels.indexOf(val) < levels.indexOf(currentLevel)) {
                setCurrentLevel(val);
              }
            }}>
              {levels.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Your Resources</h2>
        <div className="four-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Meat</label>
            <input type="text" value={meat} onChange={(e) => setMeat(e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Wood</label>
            <input type="text" value={wood} onChange={(e) => setWood(e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Coal</label>
            <input type="text" value={coal} onChange={(e) => setCoal(e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Iron</label>
            <input type="text" value={iron} onChange={(e) => setIron(e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>

        <div style={{ marginTop: '16px' }} className="two-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Fire Crystals</label>
            <input type="text" value={fireCrystals} onChange={(e) => setFireCrystals(e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Refined Fire Crystals</label>
            <input type="text" value={refinedFireCrystals} onChange={(e) => setRefinedFireCrystals(e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px', marginTop: '24px', width: 'fit-content' }}>
          <input type="checkbox" checked={useCustomChests} onChange={(e) => setUseCustomChests(e.target.checked)} style={{ width: '18px', height: '18px' }} />
          <span style={{ fontWeight: 600 }}>Use Custom Resource Chests</span>
        </label>
        
        {useCustomChests && (
          <div style={{ marginTop: '16px' }} className="two-col-grid">
            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: '#ffb347' }}>Unsecured Chests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3].map(lvl => (
                  <div key={`unsecuredLv${lvl}`}>
                    <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px' }}>Lv.{lvl} Chest</label>
                    <input 
                      type="text" 
                      value={chestCounts[`unsecuredLv${lvl}`]} 
                      onChange={(e) => setChestCounts({ ...chestCounts, [`unsecuredLv${lvl}`]: e.target.value })} 
                      className="global-select" 
                      placeholder="0" 
                    />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
              <h3 style={{ marginBottom: '12px', fontSize: '1rem', color: '#47ffb3' }}>Secured Chests</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[1, 2, 3].map(lvl => (
                  <div key={`securedLv${lvl}`}>
                    <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px' }}>Lv.{lvl} Chest</label>
                    <input 
                      type="text" 
                      value={chestCounts[`securedLv${lvl}`]} 
                      onChange={(e) => setChestCounts({ ...chestCounts, [`securedLv${lvl}`]: e.target.value })} 
                      className="global-select" 
                      placeholder="0" 
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="two-col-grid" style={{ marginTop: '24px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>General Speedups (minutes)</label>
            <input 
              type="number" 
              min="0" 
              value={generalSpeedups} 
              onChange={(e) => setGeneralSpeedups(e.target.value)} 
              className="global-select" 
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Construction Speedups (minutes)</label>
            <input 
              type="number" 
              min="0" 
              value={constructionSpeedups} 
              onChange={(e) => setConstructionSpeedups(e.target.value)} 
              className="global-select" 
            />
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>Construction Buffs (%)</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <input type="checkbox" checked={doubleTimeEnabled} onChange={e => setDoubleTimeEnabled(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <span style={{ fontWeight: 600 }}>Double Time (20%)</span>
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', padding: '12px 16px', background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)', borderRadius: '8px' }}>
            <input type="checkbox" checked={castleBuffEnabled} onChange={e => setCastleBuffEnabled(e.target.checked)} style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
            <span style={{ fontWeight: 600 }}>Castle Buff (10%)</span>
          </label>
        </div>

        <div className="two-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Construction Speed</label>
            <input type="number" min="0" step="0.1" className="global-select" value={constructionSpeedPct} onChange={e => setConstructionSpeedPct(e.target.value)} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Builder's Aide (Hyena) Buff</label>
            <select className="global-select" value={hyenaBuffPct} onChange={e => setHyenaBuffPct(e.target.value)}>
              <option value="">None (0%)</option>
              <option value="5">5%</option>
              <option value="7">7%</option>
              <option value="9">9%</option>
              <option value="12">12%</option>
              <option value="15">15%</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Zinman's Bastionist Skill</label>
            <select className="global-select" value={zinmanBastionistPct} onChange={e => setZinmanBastionistPct(e.target.value)}>
              <option value="">None (0%)</option>
              <option value="3">3%</option>
              <option value="6">6%</option>
              <option value="9">9%</option>
              <option value="12">12%</option>
              <option value="15">15%</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Agnus' Project Management Skill</label>
            <select className="global-select" value={agnusProjectManagementHours} onChange={e => setAgnusProjectManagementHours(e.target.value)}>
              <option value="">None (0h)</option>
              <option value="2">2h</option>
              <option value="3">3h</option>
              <option value="4">4h</option>
              <option value="6">6h</option>
              <option value="8">8h</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>Position Buff</label>
            <input type="number" min="0" step="0.1" className="global-select" value={positionBuffPct} onChange={e => setPositionBuffPct(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="card-panel" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Additional Buildings</h2>
        {optionalBuildings.map(ob => (
          <div key={ob.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '8px', marginBottom: '8px', alignItems: 'end' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px' }}>Building</label>
              <select 
                className="global-select" 
                value={ob.building}
                onChange={e => setOptionalBuildings(prev => prev.map(b => b.id === ob.id ? { ...b, building: e.target.value } : b))}
              >
                {buildingKeys.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px' }}>Current</label>
              <select 
                className="global-select" 
                value={ob.currentLevel}
                onChange={e => setOptionalBuildings(prev => prev.map(b => {
                  if (b.id !== ob.id) return b;
                  const val = e.target.value;
                  const bLevels = getLevelsForBuilding(b.building);
                  let newTgt = b.targetLevel;
                  if (bLevels.indexOf(val) > bLevels.indexOf(newTgt)) {
                    newTgt = val;
                  }
                  return { ...b, currentLevel: val, targetLevel: newTgt };
                }))}
              >
                {getLevelsForBuilding(ob.building).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85em', marginBottom: '4px' }}>Target</label>
              <select 
                className="global-select" 
                value={ob.targetLevel}
                onChange={e => setOptionalBuildings(prev => prev.map(b => {
                  if (b.id !== ob.id) return b;
                  const val = e.target.value;
                  const bLevels = getLevelsForBuilding(b.building);
                  let newCur = b.currentLevel;
                  if (bLevels.indexOf(val) < bLevels.indexOf(newCur)) {
                    newCur = val;
                  }
                  return { ...b, targetLevel: val, currentLevel: newCur };
                }))}
              >
                {getLevelsForBuilding(ob.building).map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </div>
            <button 
              className="icon-btn" 
              style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', padding: '0 12px', height: '42px', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px' }}
              onClick={() => setOptionalBuildings(prev => prev.filter(b => b.id !== ob.id))}
            >
              ×
            </button>
          </div>
        ))}
        <button 
          type="button" 
          className="secondary-button" 
          style={{ marginTop: '8px' }}
          onClick={() => setOptionalBuildings(prev => [...prev, { id: Date.now(), building: 'furnace', currentLevel: '1', targetLevel: '2' }])}
        >
          + Add Building
        </button>
      </div>

      <div className="card-panel" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Bear Hunt Mail</h2>
        {bearHuntMails.map(mail => (
          <div key={mail.id} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
            <select 
              className="global-select" 
              style={{ flex: 1 }} 
              value={mail.label} 
              onChange={e => {
                setBearHuntMails(prev => prev.map(m => m.id === mail.id ? { ...m, label: e.target.value } : m));
              }}
            >
              <option value="">Select Tier...</option>
              {/* These correspond to BEAR_HUNT_TIERS */}
              <option value="1 – 2.5K">1 – 2.5K</option>
              <option value="2.5K – 5K">2.5K – 5K</option>
              <option value="5K – 8K">5K – 8K</option>
              <option value="8K – 12K">8K – 12K</option>
              <option value="12K – 27.5K">12K – 27.5K</option>
              <option value="27.5K – 62.5K">27.5K – 62.5K</option>
              <option value="62.5K – 145K">62.5K – 145K</option>
              <option value="145K – 325K">145K – 325K</option>
              <option value="325K – 745K">325K – 745K</option>
              <option value="745K – 1.7M">745K – 1.7M</option>
              <option value="1.7M – 3.9M">1.7M – 3.9M</option>
              <option value="3.9M – 8.9M">3.9M – 8.9M</option>
              <option value="8.9M – 20.5M">8.9M – 20.5M</option>
              <option value="20.5M – 47M">20.5M – 47M</option>
              <option value="47M – 90M">47M – 90M</option>
              <option value="90M – 175M">90M – 175M</option>
              <option value="175M – 330M">175M – 330M</option>
              <option value="330M – 635M">330M – 635M</option>
              <option value="635M – 1.2B">635M – 1.2B</option>
              <option value="1.2B – 2.4B">1.2B – 2.4B</option>
              <option value="2.4B – 4.8B">2.4B – 4.8B</option>
            </select>
            <button 
              className="icon-btn" 
              style={{ background: 'rgba(255,107,107,0.1)', color: '#ff6b6b', padding: '0 12px', border: '1px solid rgba(255,107,107,0.3)', borderRadius: '8px' }}
              onClick={() => setBearHuntMails(prev => prev.filter(m => m.id !== mail.id))}
            >
              ×
            </button>
          </div>
        ))}
        <button 
          type="button" 
          className="secondary-button" 
          style={{ marginTop: '8px' }}
          onClick={() => setBearHuntMails(prev => [...prev, { id: Date.now(), label: '' }])}
        >
          + Add Bear Hunt Mail
        </button>
      </div>

      <div className="card-panel" style={{ marginTop: '24px' }}>
        <h2 style={{ marginBottom: '16px' }}>Totals</h2>
        <div id="result">
          {results ? (
            <div>
              {/* Per-building breakdown */}
              {results.buildingsCalculated.map((b, i) => (
                <div key={i} className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid rgba(255,255,255,0.35)' }}>
                  <strong>{b.building.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</strong> ({b.currentLevel} → {b.targetLevel})<br />
                  Meat: {b.costs.meat.toLocaleString()} | Wood: {b.costs.wood.toLocaleString()} | Coal: {b.costs.coal.toLocaleString()} | Iron: {b.costs.iron.toLocaleString()}
                  {(b.costs.fireCrystals > 0 || b.costs.refinedFireCrystals > 0) && (
                    <><br />Fire Crystals: {b.costs.fireCrystals.toLocaleString()} | Refined Fire Crystals: {b.costs.refinedFireCrystals.toLocaleString()}</>
                  )}
                  {(b.stats.rallyFrom || b.stats.deployFrom || b.stats.storageFrom) && (
                    <>
                      {b.stats.rallyFrom && <><br />Rally Capacity: {b.stats.rallyFrom?.toLocaleString()} → {b.stats.rallyTo?.toLocaleString()}</>}
                      {b.stats.deployFrom && <><br />Troop Deployment: {b.stats.deployFrom?.toLocaleString()} → {b.stats.deployTo?.toLocaleString()}</>}
                      {b.stats.storageFrom && <><br />Storage Capacity: {b.stats.storageFrom?.toLocaleString()} → {b.stats.storageTo?.toLocaleString()}</>}
                    </>
                  )}
                </div>
              ))}

              {/* Grand Total */}
              <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
                <strong style={{ color: 'var(--accent-color)' }}>GRAND TOTAL</strong><br />
                Meat: {results.totals.meat.toLocaleString()} | Wood: {results.totals.wood.toLocaleString()} | Coal: {results.totals.coal.toLocaleString()} | Iron: {results.totals.iron.toLocaleString()}<br />
                {(results.totals.fireCrystals > 0 || results.totals.refinedFireCrystals > 0) && (
                  <>Fire Crystals: {results.totals.fireCrystals.toLocaleString()} | Refined Fire Crystals: {results.totals.refinedFireCrystals.toLocaleString()}<br /></>
                )}
                {results.totals.baseMeat !== results.totals.meat && (
                  <>Base Cost (Before Zinman Discount) - Meat: {results.totals.baseMeat.toLocaleString()} | Wood: {results.totals.baseWood.toLocaleString()} | Coal: {results.totals.baseCoal.toLocaleString()} | Iron: {results.totals.baseIron.toLocaleString()}<br /></>
                )}
                Total Upgrade Time (Base): {formatDuration(results.time.baseSeconds)}<br />
                Additive Speed ({results.time.additiveSpeedPct.toFixed(1)}%): {formatDuration(results.time.additiveAdjustedSeconds)} ({formatDuration(results.time.additiveTimeSavedSeconds)} saved)<br />
                Double Time ({results.time.doubleTimePct.toFixed(1)}%): {formatDuration(results.time.doubleTimeAdjustedSeconds)} ({formatDuration(results.time.doubleTimeSavedSeconds)} saved)
                {results.time.agnusTimeSavedSeconds > 0 && (
                  <><br />Agnus' Project Management Skill: {formatDuration(results.time.agnusAdjustedSeconds)} ({formatDuration(results.time.agnusTimeSavedSeconds)} saved)</>
                )}
                <br /><br />
                <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>AFTER UPGRADE (BACKPACK BALANCE)</strong>
                Meat: {results.remaining.meat.toLocaleString()} | Wood: {results.remaining.wood.toLocaleString()} | Coal: {results.remaining.coal.toLocaleString()} | Iron: {results.remaining.iron.toLocaleString()}<br />
                {(results.totals.fireCrystals > 0 || results.totals.refinedFireCrystals > 0) && (
                  <>Fire Crystals: {results.remaining.fireCrystals.toLocaleString()} | Refined Fire Crystals: {results.remaining.refinedFireCrystals.toLocaleString()}<br /></>
                )}
                Remaining Time After Speedups: {formatDuration(results.time.remainingTimeSeconds)}
                {results.time.speedupSurplusSeconds > 0 && (
                  <><br />Speedup Surplus: {formatDuration(results.time.speedupSurplusSeconds)}</>
                )}
              </div>

              {/* Chest Plan */}
              {results.chestPlan && (
                <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
                  <strong style={{ color: 'var(--accent-color)' }}>CUSTOM CHEST RECOMMENDATION</strong><br />
                  Chests Used: L3 {(results.chestPlan.used.unsecuredLv3 || 0) + (results.chestPlan.used.securedLv3 || 0)} | L2 {(results.chestPlan.used.unsecuredLv2 || 0) + (results.chestPlan.used.securedLv2 || 0)} | L1 {(results.chestPlan.used.unsecuredLv1 || 0) + (results.chestPlan.used.securedLv1 || 0)}<br /><br />
                  <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>AFTER RECOMMENDED CHEST USE</strong>
                  Meat: {results.remaining.postChest.meat.toLocaleString()} | Wood: {results.remaining.postChest.wood.toLocaleString()} | Coal: {results.remaining.postChest.coal.toLocaleString()} | Iron: {results.remaining.postChest.iron.toLocaleString()}
                </div>
              )}
            </div>
          ) : (
            <p>Loading building data...</p>
          )}
        </div>
      </div>
    </section>
  );
};

export default Buildings;
