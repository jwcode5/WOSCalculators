import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import { useLanguage } from '../context/LanguageContext';
import {
  getResearchCategories,
  getResearchItems,
  getResearchItem,
  getResearchMaxLevel,
  calculateMultiResearchUpgrade
} from '../logic/researchMath';

function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const parts = [];
  if (days) parts.push(`${days}d`);
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs || !parts.length) parts.push(`${secs}s`);
  return parts.join(' ');
}

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

function formatResource(num) {
  const n = Number(num) || 0;
  return n.toLocaleString();
}

function formatStatName(stat, troopType) {
  if (!stat) return '';
  const cleanStat = stat.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  if (troopType && troopType !== 'all') {
    const cleanTroop = troopType.charAt(0).toUpperCase() + troopType.slice(1);
    return `${cleanTroop} ${cleanStat}`;
  }
  return cleanStat;
}

const Research = () => {
  const { t } = useLanguage();
  const { activeAccount, updateAccountState } = useAccounts();

  const categories = useMemo(() => getResearchCategories(), []);

  // Primary Selection state
  const [selectedCategory, setSelectedCategory] = useState(categories[0] || 'Growth');
  const itemsInCategory = useMemo(() => getResearchItems(selectedCategory), [selectedCategory]);
  const [selectedItemKey, setSelectedItemKey] = useState(itemsInCategory[0]?.key || '');

  // Keep item selection valid when category changes
  useEffect(() => {
    if (!itemsInCategory.some(i => i.key === selectedItemKey)) {
      setSelectedItemKey(itemsInCategory[0]?.key || '');
    }
  }, [itemsInCategory, selectedItemKey]);

  const maxLevel = useMemo(() => {
    return getResearchMaxLevel(selectedCategory, selectedItemKey);
  }, [selectedCategory, selectedItemKey]);

  const [currentLevel, setCurrentLevel] = useState(0);
  const [targetLevel, setTargetLevel] = useState(1);

  // When maxLevel changes or item changes, adjust level bounds
  useEffect(() => {
    if (targetLevel > maxLevel) {
      setTargetLevel(maxLevel || 1);
    }
    if (currentLevel > maxLevel) {
      setCurrentLevel(Math.max(0, (maxLevel || 1) - 1));
    }
  }, [maxLevel]);

  // Additional Queued Research Items: Array of { id, category, itemKey, currentLevel, targetLevel }
  const [additionalItems, setAdditionalItems] = useState([]);

  // Resources in backpack
  const [meat, setMeat] = useState('');
  const [wood, setWood] = useState('');
  const [coal, setCoal] = useState('');
  const [iron, setIron] = useState('');
  const [steel, setSteel] = useState('');

  // Speedups
  const [generalSpeedups, setGeneralSpeedups] = useState('');
  const [researchSpeedups, setResearchSpeedups] = useState('');

  // Buffs (Pet buff removed)
  const [researchSpeedPct, setResearchSpeedPct] = useState('');
  const [castleBuffEnabled, setCastleBuffEnabled] = useState(false);
  const [positionBuffPct, setPositionBuffPct] = useState('');

  // Load account saved state
  useEffect(() => {
    if (activeAccount && activeAccount.state && activeAccount.state.research) {
      const s = activeAccount.state.research;
      if (s.selectedCategory) setSelectedCategory(s.selectedCategory);
      if (s.selectedItemKey) setSelectedItemKey(s.selectedItemKey);
      if (s.currentLevel !== undefined) setCurrentLevel(s.currentLevel);
      if (s.targetLevel !== undefined) setTargetLevel(s.targetLevel);
      if (Array.isArray(s.additionalItems)) setAdditionalItems(s.additionalItems);
      if (s.meat !== undefined) setMeat(s.meat);
      if (s.wood !== undefined) setWood(s.wood);
      if (s.coal !== undefined) setCoal(s.coal);
      if (s.iron !== undefined) setIron(s.iron);
      if (s.steel !== undefined) setSteel(s.steel);
      if (s.generalSpeedups !== undefined) setGeneralSpeedups(s.generalSpeedups);
      if (s.researchSpeedups !== undefined) setResearchSpeedups(s.researchSpeedups);
      if (s.researchSpeedPct !== undefined) setResearchSpeedPct(s.researchSpeedPct);
      if (s.castleBuffEnabled !== undefined) setCastleBuffEnabled(s.castleBuffEnabled);
      if (s.positionBuffPct !== undefined) setPositionBuffPct(s.positionBuffPct);
    }
  }, [activeAccount?.id]);

  // Save account state
  useEffect(() => {
    if (activeAccount) {
      updateAccountState('research', {
        selectedCategory,
        selectedItemKey,
        currentLevel,
        targetLevel,
        additionalItems,
        meat,
        wood,
        coal,
        iron,
        steel,
        generalSpeedups,
        researchSpeedups,
        researchSpeedPct,
        castleBuffEnabled,
        positionBuffPct
      });
    }
  }, [
    selectedCategory, selectedItemKey, currentLevel, targetLevel, additionalItems,
    meat, wood, coal, iron, steel, generalSpeedups, researchSpeedups,
    researchSpeedPct, castleBuffEnabled, positionBuffPct
  ]);

  const importResourcesFromUpgrade = () => {
    if (activeAccount && activeAccount.state && activeAccount.state.buildings) {
      const b = activeAccount.state.buildings;
      if (b.meat !== undefined && b.meat !== '') setMeat(b.meat);
      if (b.wood !== undefined && b.wood !== '') setWood(b.wood);
      if (b.coal !== undefined && b.coal !== '') setCoal(b.coal);
      if (b.iron !== undefined && b.iron !== '') setIron(b.iron);
    } else {
      alert(t('research.noUpgradeData', {}, 'No Upgrade resource data found to import.'));
    }
  };

  // Add Item to queue
  const handleAddResearchItem = () => {
    const defaultCat = selectedCategory;
    const items = getResearchItems(defaultCat);
    const defaultKey = items[0]?.key || '';
    const itemMax = getResearchMaxLevel(defaultCat, defaultKey);

    setAdditionalItems(prev => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        category: defaultCat,
        itemKey: defaultKey,
        currentLevel: 0,
        targetLevel: Math.min(1, itemMax)
      }
    ]);
  };

  // Remove Item from queue
  const handleRemoveResearchItem = (id) => {
    setAdditionalItems(prev => prev.filter(item => item.id !== id));
  };

  // Update Item in queue
  const handleUpdateAdditionalItem = (id, field, value) => {
    setAdditionalItems(prev => prev.map(item => {
      if (item.id !== id) return item;

      let updated = { ...item, [field]: value };
      if (field === 'category') {
        const catItems = getResearchItems(value);
        const newKey = catItems[0]?.key || '';
        const itemMax = getResearchMaxLevel(value, newKey);
        updated.itemKey = newKey;
        updated.currentLevel = 0;
        updated.targetLevel = Math.min(1, itemMax);
      } else if (field === 'itemKey') {
        const itemMax = getResearchMaxLevel(item.category, value);
        updated.currentLevel = 0;
        updated.targetLevel = Math.min(1, itemMax);
      } else if (field === 'currentLevel') {
        const cur = parseInt(value, 10);
        const itemMax = getResearchMaxLevel(item.category, item.itemKey);
        updated.currentLevel = cur;
        if (cur >= item.targetLevel) {
          updated.targetLevel = Math.min(itemMax, cur + 1);
        }
      } else if (field === 'targetLevel') {
        const tgt = parseInt(value, 10);
        updated.targetLevel = tgt;
        if (tgt <= item.currentLevel) {
          updated.currentLevel = Math.max(0, tgt - 1);
        }
      }
      return updated;
    }));
  };

  // Add prerequisites to queue
  const handleAddPrereqsToQueue = (prereqs) => {
    if (!prereqs || !prereqs.length) return;
    setAdditionalItems(prev => {
      let updated = [...prev];
      for (const p of prereqs) {
        if (p.type !== 'research') continue;
        const existingIdx = updated.findIndex(i => i.itemKey === p.key);
        if (existingIdx >= 0) {
          if (updated[existingIdx].targetLevel < p.level) {
            updated[existingIdx] = { ...updated[existingIdx], targetLevel: p.level };
          }
        } else {
          updated.push({
            id: Date.now() + Math.random(),
            category: p.category || 'Growth',
            itemKey: p.key,
            currentLevel: 0,
            targetLevel: p.level
          });
        }
      }
      return updated;
    });
  };

  // Build combined itemsToCalc
  const itemsToCalc = useMemo(() => {
    return [
      {
        id: 'primary',
        category: selectedCategory,
        itemKey: selectedItemKey,
        currentLevel,
        targetLevel
      },
      ...additionalItems
    ];
  }, [selectedCategory, selectedItemKey, currentLevel, targetLevel, additionalItems]);

  // Results calculation
  const results = useMemo(() => {
    return calculateMultiResearchUpgrade({
      itemsToCalc,
      buffs: {
        researchSpeedPct: parseFloat(researchSpeedPct) || 0,
        castleBuffPct: castleBuffEnabled ? 10 : 0,
        positionBuffPct: parseFloat(positionBuffPct) || 0
      },
      speedups: {
        generalMinutes: (parseFloat(generalSpeedups) || 0) * 60,
        researchMinutes: (parseFloat(researchSpeedups) || 0) * 60
      },
      backpack: {
        meat: parseResourceAmount(meat),
        wood: parseResourceAmount(wood),
        coal: parseResourceAmount(coal),
        iron: parseResourceAmount(iron),
        steel: parseResourceAmount(steel)
      }
    });
  }, [
    itemsToCalc, meat, wood, coal, iron, steel,
    generalSpeedups, researchSpeedups,
    researchSpeedPct, castleBuffEnabled, positionBuffPct
  ]);

  const levelOptions = useMemo(() => {
    const opts = [];
    for (let i = 0; i <= maxLevel; i++) {
      opts.push(i);
    }
    return opts;
  }, [maxLevel]);

  const primaryCalculated = results?.calculatedItems?.[0];

  return (
    <section id="researchCalculatorPanel">
      {/* Category Tabs */}
      <div className="card-panel" style={{ paddingBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`primary-button ${selectedCategory === cat ? 'active' : ''}`}
              style={{
                flex: '1 1 120px',
                padding: '10px 18px',
                background: selectedCategory === cat ? 'var(--accent-color)' : 'var(--glass-bg)',
                color: 'var(--text-primary)',
                border: '1px solid var(--glass-border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600
              }}
              onClick={() => setSelectedCategory(cat)}
            >
              {t(`research.category.${cat}`, {}, cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Target Research & Level Selection */}
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('research.targetTech', {}, 'Target Technology')}</h2>
        <div className="three-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {t('research.selectTech', {}, 'Technology')}
            </label>
            <select
              className="global-select"
              value={selectedItemKey}
              onChange={(e) => setSelectedItemKey(e.target.value)}
            >
              {itemsInCategory.map(item => (
                <option key={item.key} value={item.key}>
                  {item.name} (Max Lv {Object.keys(item.levels || {}).length})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {t('labels.currentLevel', {}, 'Current Level')}
            </label>
            <select
              className="global-select"
              value={currentLevel}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setCurrentLevel(val);
                if (val >= targetLevel) {
                  setTargetLevel(Math.min(maxLevel, val + 1));
                }
              }}
            >
              {levelOptions.map(l => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
              {t('labels.targetGoalLevel', {}, 'Target (Goal) Level')}
            </label>
            <select
              className="global-select"
              value={targetLevel}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setTargetLevel(val);
                if (val <= currentLevel) {
                  setCurrentLevel(Math.max(0, val - 1));
                }
              }}
            >
              {levelOptions.filter(l => l > 0).map(l => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </div>
        </div>

        {primaryCalculated && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '0.95em' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>{t('research.statType', {}, 'Stat Boost')}:</strong> {formatStatName(primaryCalculated.statName, primaryCalculated.troopType)}
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>{t('research.statValue', {}, 'Stat Change')}:</strong> {primaryCalculated.startStat}% → {primaryCalculated.endStat}% (+{primaryCalculated.statGain}%)
            </span>
            <span style={{ color: 'var(--text-secondary)' }}>
              <strong>{t('research.powerGain', {}, 'Power Gain')}:</strong> +{formatResource(primaryCalculated.power)}
            </span>
          </div>
        )}
      </div>

      {/* Additional Research Items in Queue */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <div>
            <h2 style={{ margin: 0 }}>{t('research.additionalItems', {}, 'Additional Research Queue')}</h2>
            <span style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
              Queue multiple research technologies to calculate combined resources & time.
            </span>
          </div>
          <button
            type="button"
            className="secondary-button"
            onClick={handleAddResearchItem}
            style={{
              padding: '6px 14px',
              fontSize: '0.85em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            + {t('research.addItemBtn', {}, 'Add Research Item')}
          </button>
        </div>

        {additionalItems.length === 0 ? (
          <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--glass-bg)', borderRadius: '8px', border: '1px dashed var(--glass-border)' }}>
            No additional research items queued. Click <strong>"+ Add Research Item"</strong> to queue more techs.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {additionalItems.map((item) => {
              const catItems = getResearchItems(item.category);
              const itemMax = getResearchMaxLevel(item.category, item.itemKey);
              const curOpts = [];
              for (let i = 0; i <= itemMax; i++) curOpts.push(i);
              const tgtOpts = curOpts.filter(i => i > 0);

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(110px, 1fr) minmax(180px, 2fr) minmax(90px, 1fr) minmax(90px, 1fr) auto',
                    gap: '10px',
                    alignItems: 'end',
                    padding: '12px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '8px'
                  }}
                >
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px', color: 'var(--text-secondary)' }}>Category</label>
                    <select
                      className="global-select"
                      value={item.category}
                      onChange={(e) => handleUpdateAdditionalItem(item.id, 'category', e.target.value)}
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px', color: 'var(--text-secondary)' }}>Technology</label>
                    <select
                      className="global-select"
                      value={item.itemKey}
                      onChange={(e) => handleUpdateAdditionalItem(item.id, 'itemKey', e.target.value)}
                    >
                      {catItems.map(ci => (
                        <option key={ci.key} value={ci.key}>{ci.name} (Max Lv {Object.keys(ci.levels || {}).length})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px', color: 'var(--text-secondary)' }}>Current</label>
                    <select
                      className="global-select"
                      value={item.currentLevel}
                      onChange={(e) => handleUpdateAdditionalItem(item.id, 'currentLevel', e.target.value)}
                    >
                      {curOpts.map(l => <option key={l} value={l}>Lv {l}</option>)}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.8em', marginBottom: '4px', color: 'var(--text-secondary)' }}>Target</label>
                    <select
                      className="global-select"
                      value={item.targetLevel}
                      onChange={(e) => handleUpdateAdditionalItem(item.id, 'targetLevel', e.target.value)}
                    >
                      {tgtOpts.map(l => <option key={l} value={l}>Lv {l}</option>)}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveResearchItem(item.id)}
                    style={{
                      background: 'rgba(255, 107, 107, 0.15)',
                      border: '1px solid rgba(255, 107, 107, 0.4)',
                      color: '#ff6b6b',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1em'
                    }}
                    title="Remove item"
                  >
                    ✕
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Your Resources */}
      <div className="card-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h2 style={{ margin: 0 }}>{t('sections.yourResources', {}, 'Your Resources')}</h2>
          <button
            type="button"
            className="secondary-button"
            onClick={importResourcesFromUpgrade}
            style={{
              padding: '6px 14px',
              fontSize: '0.85em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}
          >
            📥 {t('research.importFromUpgrade', {}, 'Import from Upgrade')}
          </button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.meat', {}, 'Meat')}</label>
            <input
              type="text"
              className="global-input"
              placeholder="e.g. 5M"
              value={meat}
              onChange={(e) => setMeat(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.wood', {}, 'Wood')}</label>
            <input
              type="text"
              className="global-input"
              placeholder="e.g. 5M"
              value={wood}
              onChange={(e) => setWood(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.coal', {}, 'Coal')}</label>
            <input
              type="text"
              className="global-input"
              placeholder="e.g. 1M"
              value={coal}
              onChange={(e) => setCoal(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.iron', {}, 'Iron')}</label>
            <input
              type="text"
              className="global-input"
              placeholder="e.g. 500K"
              value={iron}
              onChange={(e) => setIron(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.steel', {}, 'Steel')}</label>
            <input
              type="text"
              className="global-input"
              placeholder="e.g. 100K"
              value={steel}
              onChange={(e) => setSteel(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Speedups & Buffs */}
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.speedupsAndBuffs', {}, 'Speedups & Buffs')}</h2>
        <div className="four-col-grid" style={{ marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.generalSpeedupsHours', {}, 'General Speedups (Hours)')}</label>
            <input
              type="number"
              className="global-input"
              placeholder="0"
              value={generalSpeedups}
              onChange={(e) => setGeneralSpeedups(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.researchSpeedupsHours', {}, 'Research Speedups (Hours)')}</label>
            <input
              type="number"
              className="global-input"
              placeholder="0"
              value={researchSpeedups}
              onChange={(e) => setResearchSpeedups(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.researchSpeedPct', {}, 'Research Speed (%)')}</label>
            <input
              type="number"
              className="global-input"
              placeholder="e.g. 50"
              value={researchSpeedPct}
              onChange={(e) => setResearchSpeedPct(e.target.value)}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.positionBuffPct', {}, 'Minister / Title Buff (%)')}</label>
            <input
              type="number"
              className="global-input"
              placeholder="e.g. 10"
              value={positionBuffPct}
              onChange={(e) => setPositionBuffPct(e.target.value)}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '20px', alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={castleBuffEnabled}
              onChange={(e) => setCastleBuffEnabled(e.target.checked)}
            />
            {t('buffs.castleBuff', {}, 'Castle Buff (+10% Research Speed)')}
          </label>
        </div>
      </div>

      {/* Upgrade Results / Calculation Breakdown */}
      {results && (
        <>
          <div className="card-panel">
            <h2 style={{ marginBottom: '16px' }}>{t('sections.resourceSummary', {}, 'Total Resource Cost Summary')}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
              {[
                { label: 'Meat', cost: results.costs.meat, rem: results.remainingResources.meat },
                { label: 'Wood', cost: results.costs.wood, rem: results.remainingResources.wood },
                { label: 'Coal', cost: results.costs.coal, rem: results.remainingResources.coal },
                { label: 'Iron', cost: results.costs.iron, rem: results.remainingResources.iron },
                { label: 'Steel', cost: results.costs.steel, rem: results.remainingResources.steel }
              ].map(res => (
                <div
                  key={res.label}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{res.label}</div>
                  <div style={{ fontSize: '1.2em', fontWeight: 600, margin: '4px 0' }}>
                    {formatResource(res.cost)}
                  </div>
                  <div style={{ fontSize: '0.8em', color: res.rem >= 0 ? '#4cd137' : '#e84118' }}>
                    {res.rem >= 0 ? `Surplus: +${formatResource(res.rem)}` : `Short: ${formatResource(res.rem)}`}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card-panel">
            <h2 style={{ marginBottom: '16px' }}>{t('sections.timeBreakdown', {}, 'Total Time & Speedup Breakdown')}</h2>
            <div className="three-col-grid">
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{t('time.baseTime', {}, 'Base Total Time')}</div>
                <div style={{ fontSize: '1.2em', fontWeight: 600, marginTop: '4px' }}>
                  {formatDuration(results.time.baseSeconds)}
                </div>
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>{t('time.adjustedTime', {}, 'Adjusted Time (With Buffs)')}</div>
                <div style={{ fontSize: '1.2em', fontWeight: 600, marginTop: '4px', color: 'var(--accent-color)' }}>
                  {formatDuration(results.time.adjustedSeconds)}
                </div>
                {results.time.timeSavedSeconds > 0 && (
                  <div style={{ fontSize: '0.8em', color: '#4cd137', marginTop: '2px' }}>
                    Saved: {formatDuration(results.time.timeSavedSeconds)}
                  </div>
                )}
              </div>
              <div style={{ padding: '12px', borderRadius: '8px', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)' }}>
                <div style={{ fontSize: '0.85em', color: 'var(--text-secondary)' }}>
                  {results.time.remainingTimeSeconds > 0 ? t('time.remainingAfterSpeedups', {}, 'Time Left After Speedups') : t('time.speedupSurplus', {}, 'Speedup Surplus')}
                </div>
                <div style={{ fontSize: '1.2em', fontWeight: 600, marginTop: '4px', color: results.time.remainingTimeSeconds > 0 ? '#e84118' : '#4cd137' }}>
                  {results.time.remainingTimeSeconds > 0 ? formatDuration(results.time.remainingTimeSeconds) : `+${formatDuration(results.time.speedupSurplusSeconds)}`}
                </div>
              </div>
            </div>
          </div>

          {/* Prerequisites */}
          {results.prerequisites && results.prerequisites.length > 0 && (
            <div className="card-panel">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ margin: 0 }}>{t('research.prerequisites', {}, 'Required Prerequisites')}</h2>
                {results.prerequisites.some(p => p.type === 'research') && (
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => handleAddPrereqsToQueue(results.prerequisites)}
                    style={{
                      padding: '6px 14px',
                      fontSize: '0.85em',
                      cursor: 'pointer'
                    }}
                  >
                    + Add Prerequisites to Queue
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {results.prerequisites.map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 14px',
                      background: 'var(--glass-bg)',
                      border: '1px solid var(--glass-border)',
                      borderRadius: '8px'
                    }}
                  >
                    <span>
                      <strong>{p.name}</strong> {p.type === 'building' ? '(Building)' : `(${p.category} Research)`}
                    </span>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                      Level {p.level}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Combined Breakdown by Queued Item */}
          {results.calculatedItems && results.calculatedItems.length > 0 && (
            <div className="card-panel">
              <h2 style={{ marginBottom: '16px' }}>{t('research.queueSummary', {}, 'Queue Breakdown')}</h2>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9em' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-secondary)' }}>
                      <th style={{ padding: '8px' }}>Technology</th>
                      <th style={{ padding: '8px' }}>Levels</th>
                      <th style={{ padding: '8px' }}>Stat Boost</th>
                      <th style={{ padding: '8px' }}>Power</th>
                      <th style={{ padding: '8px' }}>Base Time</th>
                      <th style={{ padding: '8px' }}>Adjusted Time</th>
                      <th style={{ padding: '8px' }}>Meat</th>
                      <th style={{ padding: '8px' }}>Wood</th>
                      <th style={{ padding: '8px' }}>Coal</th>
                      <th style={{ padding: '8px' }}>Iron</th>
                      <th style={{ padding: '8px' }}>Steel</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.calculatedItems.map((ci, idx) => (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <td style={{ padding: '8px', fontWeight: 600 }}>{ci.name}</td>
                        <td style={{ padding: '8px' }}>Lv {ci.currentLevel} → Lv {ci.targetLevel}</td>
                        <td style={{ padding: '8px' }}>
                          {formatStatName(ci.statName, ci.troopType)} (+{ci.statGain}%)
                        </td>
                        <td style={{ padding: '8px' }}>+{formatResource(ci.power)}</td>
                        <td style={{ padding: '8px' }}>{formatDuration(ci.seconds)}</td>
                        <td style={{ padding: '8px', color: 'var(--accent-color)', fontWeight: 600 }}>{formatDuration(ci.adjustedSeconds)}</td>
                        <td style={{ padding: '8px' }}>{formatResource(ci.costs.meat)}</td>
                        <td style={{ padding: '8px' }}>{formatResource(ci.costs.wood)}</td>
                        <td style={{ padding: '8px' }}>{formatResource(ci.costs.coal)}</td>
                        <td style={{ padding: '8px' }}>{formatResource(ci.costs.iron)}</td>
                        <td style={{ padding: '8px' }}>{formatResource(ci.costs.steel)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default Research;
