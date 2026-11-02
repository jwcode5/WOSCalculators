import { useLanguage } from '../context/LanguageContext';
import React, { useState, useEffect, useMemo } from 'react';
import { useAccounts } from '../context/AccountContext';
import expertData from '../data/expertsData.json';
import { calculateExpertUpgrade, calculateExpertSkillsUpgrade } from '../logic/expertMath';

const EXPERT_NAMES = Object.keys(expertData);

const Experts = () => {
  const { t } = useLanguage();
  const { activeAccount, updateAccountState } = useAccounts();
  const [expertState, setExpertState] = useState({});
  const [materials, setMaterials] = useState({
    advancementSigils: '',
    compass: '',
    fieryHeart: '',
    sailOfConquest: '',
    skillExp: '',
    skillBooks: ''
  });
  const [initializedAccountId, setInitializedAccountId] = useState(null);

  useEffect(() => {
    if (activeAccount) {
      if (activeAccount.state && activeAccount.state.experts) {
        setExpertState(prev => ({ ...prev, ...activeAccount.state.experts.levels }));
        setMaterials(prev => ({ ...prev, ...activeAccount.state.experts.materials }));
      }
      setInitializedAccountId(activeAccount.id);
    }
  }, [activeAccount?.id]);

  useEffect(() => {
    if (activeAccount && initializedAccountId === activeAccount.id) {
      updateAccountState('experts', { levels: expertState, materials });
    }
  }, [expertState, materials, initializedAccountId]);

  const handleChangeExpert = (name, type, value) => {
    setExpertState(prev => {
      const newState = { ...prev, [`${name}${type}`]: value };
      
      if (type !== 'Sigils' && !type.includes('skill')) {
        const curLvl = parseInt(type === 'Current' ? value : prev[`${name}Current`] || 1, 10);
        const tgtLvl = parseInt(type === 'Target' ? value : prev[`${name}Target`] || 1, 10);
        
        if (curLvl > tgtLvl) {
          if (type === 'Current') newState[`${name}Target`] = curLvl.toString();
          else newState[`${name}Current`] = tgtLvl.toString();
        }
      } else if (type.includes('skill')) {
        if (!type.includes('Exp')) {
          const base = `${name}_skill${type.split('skill')[1].split('_')[0]}`;
          const isCur = type.includes('Current');
          
          let curLvl = parseInt(isCur ? value : prev[`${base}_Current`] || -1, 10);
          let tgtLvl = parseInt(!isCur ? value : prev[`${base}_Target`] || -1, 10);

          // If Not Obtained, treat it as level 0 for comparison
          const curCompare = curLvl === -1 ? 0 : curLvl;
          const tgtCompare = tgtLvl === -1 ? 0 : tgtLvl;

          if (curCompare > tgtCompare) {
            if (isCur) newState[`${base}_Target`] = value; // Push target up
            else newState[`${base}_Current`] = value; // Push current down
          }
        }
      }
      return newState;
    });
  };

  const handleChangeMat = (id, value) => {
    setMaterials(prev => ({ ...prev, [id]: value }));
  };

  const results = useMemo(() => {
    try {
      const targets = EXPERT_NAMES.map(name => ({
        name,
        curLvl: parseInt(expertState[`${name}Current`] || 1),
        tgtLvl: parseInt(expertState[`${name}Target`] || 1),
        specSigilsAvail: parseFloat(expertState[`${name}Sigils`]) || 0
      })).filter(t => t.curLvl < t.tgtLvl);

      const skillTargets = [];
      EXPERT_NAMES.forEach(name => {
        const curAffinityLevel = parseInt(expertState[`${name}Current`] || 1);
        [1, 2, 3, 4].forEach(skillId => {
          const curLvl = parseInt(expertState[`${name}_skill${skillId}_Current`] || -1);
          const tgtLvl = parseInt(expertState[`${name}_skill${skillId}_Target`] || -1);
          const savedExp = parseFloat(expertState[`${name}_skill${skillId}_Exp`]) || 0;
          if (curLvl !== -1 && tgtLvl !== -1 && curLvl < tgtLvl) {
            skillTargets.push({ name, skillId, curLvl, tgtLvl, curAffinityLevel, savedExp });
          }
        });
      });

      const inventory = {
        genSigils: parseFloat(materials.advancementSigils) || 0,
        compass: parseFloat(materials.compass) || 0,
        fieryHeart: parseFloat(materials.fieryHeart) || 0,
        sail: parseFloat(materials.sailOfConquest) || 0,
        skillExpSeconds: (parseFloat(materials.skillExp) || 0) * 60,
        skillBooks: parseFloat(materials.skillBooks) || 0
      };

      return {
        affinityResults: calculateExpertUpgrade(targets, inventory),
        skillResults: calculateExpertSkillsUpgrade(skillTargets, inventory)
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  }, [expertState, materials]);

  return (
    <section id="expertsPanel">
      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.expertLevels', {}, 'Expert Levels')}</h2>

        <div className="gear-table">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {EXPERT_NAMES.map(name => {
              const maxLvl = expertData[name]?.levels?.length || 80;
              const levels = Array.from({length: maxLvl}, (_, i) => i + 1);
              return (
                <div key={name} style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                    {t(`experts.${name.replace(/\s+/g, '')}`, {}, name)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>{t('labels.current', {}, 'Current')}</span><span>{t('labels.target', {}, 'Target')}</span><span>{t('labels.specificSigils', {}, 'Specific Sigils')}</span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', alignItems: 'center' }}>
                    <select 
                      className="global-select" 
                      value={expertState[`${name}Current`] || 1}
                      onChange={(e) => handleChangeExpert(name, 'Current', e.target.value)}
                    >
                      {expertData[name]?.levels?.map(row => (
                        <option key={row.level} value={row.level}>
                          {row.level} {row.relationship && row.relationship !== "-" ? `- ${row.relationship}` : ""}
                        </option>
                      ))}
                    </select>
                    <select 
                      className="global-select" 
                      value={expertState[`${name}Target`] || 1}
                      onChange={(e) => handleChangeExpert(name, 'Target', e.target.value)}
                    >
                      {expertData[name]?.levels?.map(row => (
                        <option key={row.level} value={row.level}>
                          {row.level} {row.relationship && row.relationship !== "-" ? `- ${row.relationship}` : ""}
                        </option>
                      ))}
                    </select>
                    <input
                      type="text"
                      className="global-select"
                      placeholder="0"
                      value={expertState[`${name}Sigils`] || ''}
                      onChange={(e) => handleChangeExpert(name, 'Sigils', e.target.value)}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.expertSkillsMaterials', {}, 'Your Materials')}</h2>
        <div className="four-col-grid">
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.generalAdvancementSigils', {}, 'Common Expert Sigil')}</label>
            <input type="text" value={materials.advancementSigils} onChange={(e) => handleChangeMat('advancementSigils', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.compass', {}, 'Compass (10 Affinity)')}</label>
            <input type="text" value={materials.compass} onChange={(e) => handleChangeMat('compass', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.fieryHeart', {}, 'Fiery Heart (100 Affinity)')}</label>
            <input type="text" value={materials.fieryHeart} onChange={(e) => handleChangeMat('fieryHeart', e.target.value)} className="global-select" placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.sailOfConquest', {}, 'Sail of Conquest (1000 Affinity)')}</label>
            <input type="text" value={materials.sailOfConquest} onChange={(e) => handleChangeMat('sailOfConquest', e.target.value)} className="global-select" placeholder="0" />
          </div>
        </div>
      </div>

      {results && results.affinityResults && (() => {
        const totalInvAffinity = (parseFloat(materials.compass) || 0) * 10 + (parseFloat(materials.fieryHeart) || 0) * 100 + (parseFloat(materials.sailOfConquest) || 0) * 1000;
        const totalInvSigils = parseFloat(materials.advancementSigils) || 0;
        const remainingAffinity = Math.max(0, totalInvAffinity - results.affinityResults.costs.affinity);
        const remainingSigils = Math.max(0, totalInvSigils - results.affinityResults.costs.generalSigils);
        
        return (
          <div className="card-panel" style={{ marginTop: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>{t('results.totals', {}, 'Totals')}</h2>
            
            <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
              <strong style={{ color: 'var(--accent-color)' }}>{t('results.targetUpgradesTotal', {}, 'TARGET UPGRADES TOTAL')}</strong><br />
              {t('results.totalAffinityRequired', {}, 'Total Affinity Required:')} {results.affinityResults.costs.affinity.toLocaleString()}<br />
              {t('results.totalGeneralSigilsRequired', {}, 'Total General Sigils Required:')} {results.affinityResults.costs.generalSigils.toLocaleString()}<br />
              
              <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>{t('results.remainingAfterUpgrades', {}, 'Remaining After Upgrades')}</strong>
              {t('results.affinityLeft', {}, 'Affinity Left:')} {remainingAffinity.toLocaleString()}<br />
              {t('results.generalSigilsLeft', {}, 'General Sigils Left:')} {remainingSigils.toLocaleString()}<br />
            </div>

            {results.affinityResults.optimized && (
              <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
                <strong style={{ color: 'var(--accent-color)' }}>{t('results.optimizedPlan', {}, 'OPTIMIZED PLAN')}</strong><br />
                {t('results.basedOnResources', {}, 'Based on your available resources:')}<br />
                {results.affinityResults.optimized.plan.length > 0 ? (
                  <>
                    {results.affinityResults.optimized.plan.map((step, idx) => (
                      <div key={idx} style={{ marginTop: '10px' }}>
                        <strong>{t(`experts.${step.slot.replace(/\s+/g, '')}`, {}, step.slot)}</strong> ({step.startLevel || 1} → {step.label})
                      </div>
                    ))}
                    <div style={{ marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                      <strong>{t('results.totalCost', {}, 'Total Cost:')}</strong> {t('labels.affinity', {}, 'Affinity')}: {(totalInvAffinity - results.affinityResults.optimized.resources.affinity).toLocaleString()} | {t('labels.generalAdvancementSigils', {}, 'General Sigils')}: {(totalInvSigils - results.affinityResults.optimized.resources.generalSigils).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <em style={{ display: 'block', marginTop: '8px' }}>{t('results.noPetUpgrades', {}, 'No target upgrades selected and no optimized upgrades possible with current materials.')}</em>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* --- EXPERT SKILLS SECTION --- */}
      
      <div className="card-panel" style={{ marginTop: '32px' }}>
        <h2 style={{ marginBottom: '16px' }}>{t('sections.expertSkillsLevels', {}, 'Expert Skills')}</h2>
        <div className="card-panel" style={{ background: 'rgba(255,165,0,0.05)', borderLeft: '4px solid #f59e0b', marginBottom: '24px' }}>
          <strong style={{ color: '#f59e0b' }}>{t('labels.note', {}, 'Note:')}</strong> {t('labels.skillPrerequisitesNote', {}, 'Skill prerequisites depend on your Affinity levels. Please ensure you have filled out your current/target Affinity levels above first to accurately see what skill targets you are eligible for.')}
        </div>

        <div className="gear-table">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {EXPERT_NAMES.map(name => {
              const skillsData = expertData[name]?.skills;
              if (!skillsData) return null;
              
              return (
                <div key={`${name}-skills`} style={{ background: 'var(--glass-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '12px', textAlign: 'center', borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
                    {t(`experts.${name.replace(/\s+/g, '')}`, {}, name)}
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', textAlign: 'center', fontSize: '0.85em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    <span>{t('labels.skill', {}, 'Skill')}</span><span>{t('labels.current', {}, 'Current')}</span><span>{t('labels.target', {}, 'Target')}</span><span>{t('labels.savedExp', {}, 'Saved EXP')}</span>
                  </div>

                  {[1, 2, 3, 4].map(skillId => {
                    const sArr = skillsData[skillId.toString()];
                    if (!sArr) return null;
                    const maxLvl = sArr.length;
                    const levels = Array.from({length: maxLvl}, (_, i) => i + 1);

                    return (
                      <div key={skillId} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.9em' }}>{t('labels.skill', {}, 'Skill')} {skillId}</span>
                        <select 
                          className="global-select" 
                          value={expertState[`${name}_skill${skillId}_Current`] || -1}
                          onChange={(e) => handleChangeExpert(name, `_skill${skillId}_Current`, e.target.value)}
                        >
                          <option value="-1">{t('labels.notObtained', {}, 'Not Obtained')}</option>
                          {levels.map(l => <option key={l} value={l}>{t(`expertLevels.${l}`, {}, l)}</option>)}
                        </select>
                        <select 
                          className="global-select"
                          value={expertState[`${name}_skill${skillId}_Target`] || -1}
                          onChange={(e) => handleChangeExpert(name, `_skill${skillId}_Target`, e.target.value)}
                        >
                          <option value="-1">{t('labels.notObtained', {}, 'Not Obtained')}</option>
                          {levels.map(l => <option key={l} value={l}>{t(`expertLevels.${l}`, {}, l)}</option>)}
                        </select>
                        <input
                          type="text"
                          className="global-select"
                          placeholder="0"
                          title={t('labels.enterSavedExp', {}, 'Enter saved EXP points (not minutes)')}
                          value={expertState[`${name}_skill${skillId}_Exp`] || ''}
                          onChange={(e) => handleChangeExpert(name, `_skill${skillId}_Exp`, e.target.value)}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card-panel">
        <h2 style={{ marginBottom: '16px' }}>{t('sections.yourSkillMaterials', {}, 'Your Skill Materials')}</h2>
        <div className="two-col-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.learningSpeedups', {}, 'Learning Speedups (minutes)')}</label>
            <input type="text" value={materials.skillExp} onChange={(e) => handleChangeMat('skillExp', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '8px' }}>{t('labels.skillBooks', {}, 'Skill Books')}</label>
            <input type="text" value={materials.skillBooks} onChange={(e) => handleChangeMat('skillBooks', e.target.value)} className="global-select" style={{ width: '100%' }} placeholder="0" />
          </div>
        </div>
      </div>

      {results && results.skillResults && (() => {
        const totalInvSkillExp = (parseFloat(materials.skillExp) || 0) * 60;
        const totalInvSkillBooks = parseFloat(materials.skillBooks) || 0;
        const remainingSkillExp = Math.max(0, totalInvSkillExp - results.skillResults.costs.skillExp);
        const remainingSkillBooks = Math.max(0, totalInvSkillBooks - results.skillResults.costs.skillBooks);

        return (
          <div className="card-panel" style={{ marginTop: '24px' }}>
            <h2 style={{ marginBottom: '16px' }}>{t('results.skillTotals', {}, 'Skill Totals')}</h2>
            
            {results.skillResults.warnings && results.skillResults.warnings.length > 0 && (
              <div style={{ marginBottom: '24px', background: 'rgba(244,67,54,0.1)', borderLeft: '4px solid #f44336', padding: '12px' }}>
                <h3 style={{ color: '#f44336', marginBottom: '8px' }}>{t('results.requirementsNotMet', {}, 'Requirements Not Met')}</h3>
                <ul style={{ listStyleType: 'circle', paddingLeft: '20px' }}>
                  {results.skillResults.warnings.map((w, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{w}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
              <strong style={{ color: 'var(--accent-color)' }}>{t('results.targetUpgradesTotal', {}, 'TARGET UPGRADES TOTAL')}</strong><br />
              {t('results.totalLearningSpeedupsRequired', {}, 'Total Learning Speedups Required:')} {Math.ceil(results.skillResults.costs.skillExp / 60).toLocaleString()} {t('labels.mins', {}, 'mins')}<br />
              {t('results.totalSkillBooksRequired', {}, 'Total Skill Books Required:')} {results.skillResults.costs.skillBooks.toLocaleString()}<br />
              
              <strong style={{ color: 'var(--accent-color)', display: 'block', marginTop: '15px' }}>{t('results.remainingAfterUpgrades', {}, 'Remaining After Upgrades')}</strong>
              {t('results.learningSpeedupsLeft', {}, 'Learning Speedups Left:')} {Math.floor(remainingSkillExp / 60).toLocaleString()} {t('labels.mins', {}, 'mins')}<br />
              {t('results.skillBooksLeft', {}, 'Skill Books Left:')} {remainingSkillBooks.toLocaleString()}<br />
            </div>

            {results.skillResults.optimized && (
              <div className="card-panel" style={{ marginTop: '15px', borderLeft: '3px solid var(--accent-color)' }}>
                <strong style={{ color: 'var(--accent-color)' }}>{t('results.optimizedPlan', {}, 'OPTIMIZED PLAN')}</strong><br />
                {t('results.basedOnResources', {}, 'Based on your available resources:')}<br />
                {results.skillResults.optimized.plan.length > 0 ? (
                  <>
                    {results.skillResults.optimized.plan.map((step, idx) => (
                      <div key={idx} style={{ marginTop: '10px' }}>
                        <strong>{t(`experts.${step.slot.split('_')[0].replace(/\s+/g, '')}`, {}, step.slot.split('_')[0])} - {t('labels.skill', {}, 'Skill')} {step.slot.split('_')[1].replace('skill', '')}</strong> ({step.startLevel || 1} → {step.label})
                      </div>
                    ))}
                    <div style={{ marginTop: '10px', borderTop: '1px solid var(--glass-border)', paddingTop: '10px' }}>
                      <strong>{t('results.totalCost', {}, 'Total Cost:')}</strong> {t('labels.speedups', {}, 'Speedups')}: {Math.ceil((totalInvSkillExp - results.skillResults.optimized.resources.skillExp) / 60).toLocaleString()} {t('labels.mins', {}, 'mins')} | {t('labels.skillBooks', {}, 'Skill Books')}: {(totalInvSkillBooks - results.skillResults.optimized.resources.skillBooks).toLocaleString()}
                    </div>
                  </>
                ) : (
                  <em style={{ display: 'block', marginTop: '8px' }}>{t('results.noPetUpgrades', {}, 'No target upgrades selected and no optimized upgrades possible with current materials.')}</em>
                )}
              </div>
            )}
          </div>
        );
      })()}
    </section>
  );
};

export default Experts;
