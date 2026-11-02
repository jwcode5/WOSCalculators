export async function renderExpertSkillsCalculator(container) {
  container.innerHTML = `
    <!-- Expert Skills Calculator Panel -->
    <div id="expertSkillsPanel">

      <div class="card-panel" style="background: rgba(255, 170, 0, 0.1); border-color: rgba(255, 170, 0, 0.3);">
        <span data-i18n="messages.expertSkillsAffinityNote">Skill prerequisites depend on your Affinity levels. Please ensure you have filled out your current/target Affinity levels on the Experts Calculator page first to accurately see what skill targets you are eligible for.</span>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.expertSkillsLevels" style="margin-bottom: 16px;">Expert Skills</h2>
        
        <div class="pet-batch-controls" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label data-i18n="labels.setAllCurrentLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all current levels</label>
            <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
              <select id="setAllExpertSkillCurrent" class="global-select" style="flex: 2;"></select>
              <button type="button" id="setAllExpertSkillCurrentBtn" class="secondary-button" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
          <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label data-i18n="labels.setAllTargetLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all target levels</label>
            <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
              <select id="setAllExpertSkillTarget" class="global-select" style="flex: 2;"></select>
              <button type="button" id="setAllExpertSkillTargetBtn" class="secondary-button" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
        </div>

        <div class="expert-skill-collection-grid" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="expert-row-header" style="display: flex; gap: 16px; font-weight: bold; margin-bottom: 8px;">
            <span style="flex: 1;"></span>
            <span style="flex: 1;" data-i18n="labels.currentLevel">Current Level</span>
            <span style="flex: 1;" data-i18n="labels.targetLevel">Target Level</span>
          </div>
          <div id="expertSkillCollectionContainer" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Expert Skills rows injected by script.js -->
          </div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.expertSkillsMaterials" style="margin-bottom: 16px;">Your Materials</h2>
        <div class="gear-materials-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field">
            <label for="expertSkillExp" data-i18n="labels.skillExp" style="display:block; margin-bottom: 8px;">Learning Speedups (minutes)</label>
            <input id="expertSkillExp" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
          <div class="gear-material-field">
            <label for="expertSkillBooks" data-i18n="labels.skillBooks" style="display:block; margin-bottom: 8px;">Skill Books</label>
            <input id="expertSkillBooks" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
        </div>
      </div>

      

      <div id="expertSkillsResult" class="card-panel" style="margin-top: 24px; display: none;"></div>
    </div>
  `;

  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  if (typeof initExpertSkillsPanel === 'function') {
    initExpertSkillsPanel();
  }
  
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
}
