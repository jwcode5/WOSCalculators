export async function renderChiefCharmCalculator(container) {
  container.innerHTML = `
    <!-- Chief Charm Calculator Panel -->
    <div id="chiefCharmPanel">

      <div class="card-panel">
        <h2 data-i18n="sections.chiefCharmLevels" style="margin-bottom: 16px;">Chief Charm Levels</h2>
        
        <!-- Batch controls -->
        <div class="charm-batch-row" style="margin-bottom: 24px;">
          <div class="charm-batch-controls" style="padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label for="charmBatchCurrent" style="font-size: 0.95em; display: block; margin-bottom: 8px;" data-i18n="labels.setAllCurrentLevels">Set all current levels</label>
            <div style="display: flex; gap: 12px; align-items: center;">
              <select id="charmBatchCurrent" class="global-select" style="flex: 2;"></select>
              <button id="setAllCharmCurrentBtn" type="button" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
        </div>
        <div class="gear-table">
          <div class="gear-table-header" style="display: flex; gap: 16px; font-weight: bold; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--glass-border);">
            <span style="flex: 1.5;">Charm</span>
            <span style="flex: 1;" data-i18n="labels.currentLevel">Current Level</span>
            <span style="flex: 1;" data-i18n="labels.targetLevel">Target Level</span>
          </div>
          <!-- Populated by script.js initChiefCharmPanel -->
          <div id="charmTableBody"></div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.chiefCharmMaterials" style="margin-bottom: 16px;">Your Materials</h2>
        <div class="three-col-grid">
          <div class="gear-material-field">
            <label for="charmDesignsInput" data-i18n="labels.charmDesigns" style="display:block; margin-bottom: 8px;">Charm Designs</label>
            <input id="charmDesignsInput" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
          <div class="gear-material-field">
            <label for="charmGuidesInput" data-i18n="labels.charmGuides" style="display:block; margin-bottom: 8px;">Charm Guides</label>
            <input id="charmGuidesInput" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
          <div class="gear-material-field">
            <label for="jewelSecretsInput" data-i18n="labels.jewelSecrets" style="display:block; margin-bottom: 8px;">Jewel Secrets</label>
            <input id="jewelSecretsInput" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
        </div>
      </div>

      

      <div id="charmResult" class="card-panel" style="margin-top: 24px; display: none;"></div>
    </div>
  `;

  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  if (typeof initChiefCharmPanel === 'function') {
    initChiefCharmPanel();
  }
  
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
  setTimeout(() => {
    const panel = document.getElementById('chiefCharmPanel');
    if (panel && typeof window.onCharmCalculateClick === 'function') {
      panel.addEventListener('change', window.onCharmCalculateClick);
      panel.addEventListener('input', window.onCharmCalculateClick);
      window.onCharmCalculateClick();
    }
  }, 100);

}
