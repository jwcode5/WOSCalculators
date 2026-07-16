export async function renderExpertsCalculator(container) {
  container.innerHTML = `
    <!-- Experts Calculator Panel -->
    <div id="expertsPanel">
      <div class="card-panel">
        <h2 data-i18n="sections.expertLevels" style="margin-bottom: 16px;">Expert Levels</h2>
        
        <div class="pet-batch-controls" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label data-i18n="labels.setAllCurrentLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all current levels</label>
            <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
              <select id="setAllExpertCurrent" class="global-select" style="flex: 2;"></select>
              <button type="button" id="setAllExpertCurrentBtn" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
          <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label data-i18n="labels.setAllTargetLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all target levels</label>
            <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
              <select id="setAllExpertTarget" class="global-select" style="flex: 2;"></select>
              <button type="button" id="setAllExpertTargetBtn" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
        </div>

        <div class="gear-table">
          <div id="expertCollectionContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
            <!-- Expert rows injected by script.js -->
          </div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.expertMaterials" style="margin-bottom: 16px;">Your Materials</h2>
        <div class="four-col-grid">
          <div class="gear-material-field">
            <label for="expertAdvancementSigils" data-i18n="labels.generalAdvancementSigils" style="display:block; margin-bottom: 8px;">Common Expert Sigil</label>
            <input id="expertAdvancementSigils" type="number" min="0" value="0" class="global-select" />
          </div>
          <div class="gear-material-field">
            <label for="expertCompass" data-i18n="labels.compass" style="display:block; margin-bottom: 8px;">Compass (10 Affinity)</label>
            <input id="expertCompass" type="number" min="0" value="0" class="global-select" />
          </div>
          <div class="gear-material-field">
            <label for="expertFieryHeart" data-i18n="labels.fieryHeart" style="display:block; margin-bottom: 8px;">Fiery Heart (100 Affinity)</label>
            <input id="expertFieryHeart" type="number" min="0" value="0" class="global-select" />
          </div>
          <div class="gear-material-field">
            <label for="expertSailOfConquest" data-i18n="labels.sailOfConquest" style="display:block; margin-bottom: 8px;">Sail of Conquest (1000 Affinity)</label>
            <input id="expertSailOfConquest" type="number" min="0" value="0" class="global-select" />
          </div>
        </div>
      </div>

      

      <div id="expertsResult" class="card-panel" style="margin-top: 24px; display: none;"></div>
      
      <!-- Expert Skills Calculator Panel -->
      <div id="expertSkillsPanel" style="margin-top: 32px;">
        <div class="card-panel" style="background: rgba(255,165,0,0.05); border-left: 4px solid #f59e0b; margin-bottom: 24px;">
          <strong data-i18n="labels.note" style="color: #f59e0b;">Note:</strong> 
          <span data-i18n="messages.expertSkillsAffinityNote">Skill prerequisites depend on your Affinity levels. Please ensure you have filled out your current/target Affinity levels on the Experts Calculator page first to accurately see what skill targets you are eligible for.</span>
        </div>

        <div class="card-panel">
          <h2 data-i18n="sections.expertSkillsLevels" style="margin-bottom: 16px;">Expert Skills</h2>

          <div class="pet-batch-controls" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
            <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
              <label data-i18n="labels.setAllCurrentLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all skill current levels</label>
              <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
                <select id="setAllExpertSkillCurrent" class="global-select" style="flex: 2;"></select>
                <button type="button" id="setAllExpertSkillCurrentBtn" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
              </div>
            </div>
            <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
              <label data-i18n="labels.setAllTargetLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all skill target levels</label>
              <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
                <select id="setAllExpertSkillTarget" class="global-select" style="flex: 2;"></select>
                <button type="button" id="setAllExpertSkillTargetBtn" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
              </div>
            </div>
          </div>

          <div class="gear-table">
            <div id="expertSkillCollectionContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px;">
              <!-- Expert Skills rows injected by script.js -->
            </div>
          </div>
        </div>

        <div class="card-panel">
          <h2 data-i18n="sections.expertSkillsMaterials" style="margin-bottom: 16px;">Your Materials</h2>
          <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
            <div class="gear-material-field">
              <label for="expertSkillExp" data-i18n="labels.skillExp" style="display:block; margin-bottom: 8px;">Learning Speedups (minutes)</label>
              <input id="expertSkillExp" type="number" min="0" value="0" class="global-select" style="width: 100%; box-sizing: border-box;" />
            </div>
            <div class="gear-material-field">
              <label for="expertSkillBooks" data-i18n="labels.skillBooks" style="display:block; margin-bottom: 8px;">Skill Books</label>
              <input id="expertSkillBooks" type="number" min="0" value="0" class="global-select" style="width: 100%; box-sizing: border-box;" />
            </div>
          </div>
        </div>

        

        <div id="expertSkillsResult" class="card-panel" style="margin-top: 24px; display: none;"></div>
      </div>

    </div>
  `;

  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  if (typeof initExpertsPanel === 'function') {
    initExpertsPanel();
  }
  if (typeof initExpertSkillsPanel === 'function') {
    initExpertSkillsPanel();
  }
  
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
  setTimeout(() => {
    const expertsPanel = document.getElementById('expertsPanel');
    if (expertsPanel && typeof window.calculateExperts === 'function') {
      expertsPanel.addEventListener('change', window.calculateExperts);
      expertsPanel.addEventListener('input', window.calculateExperts);
      window.calculateExperts();
    }
    const skillsPanel = document.getElementById('expertSkillsPanel');
    if (skillsPanel && typeof window.calculateExpertSkills === 'function') {
      skillsPanel.addEventListener('change', window.calculateExpertSkills);
      skillsPanel.addEventListener('input', window.calculateExpertSkills);
      window.calculateExpertSkills();
    }
  }, 100);

}
