export async function renderPetsCalculator(container) {
  container.innerHTML = `
    <!-- Pets Collection Dashboard -->
    <div id="petsPanel">

      <div class="card-panel">
        <h2 data-i18n="sections.petLevels" style="margin-bottom: 16px;">Pet Collection</h2>
        
        <div class="pet-batch-controls" style="display: flex; gap: 16px; margin-bottom: 24px; flex-wrap: wrap;">
          <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label data-i18n="labels.setAllCurrentLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all current levels</label>
            <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
              <select id="setAllPetCurrent" class="global-select" style="flex: 2;"></select>
              <button type="button" id="setAllPetCurrentBtn" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
          <div class="pet-batch-group" style="flex: 1; padding: 16px; background: var(--glass-bg); border-radius: 8px; border: 1px solid var(--glass-border);">
            <label data-i18n="labels.setAllTargetLevels" style="display: block; margin-bottom: 8px; font-size: 0.95em;">Set all target levels</label>
            <div class="pet-batch-inline" style="display: flex; gap: 12px; align-items: center;">
              <select id="setAllPetTarget" class="global-select" style="flex: 2;"></select>
              <button type="button" id="setAllPetTargetBtn" class="inlineActionBtn inlineActionBtnPrimary" data-i18n="buttons.setAll" style="flex: 1;">Set All</button>
            </div>
          </div>
        </div>

        <div class="gear-table" style="background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.01) 100%); padding: 20px; border-radius: 12px; border: 1px solid var(--glass-border);">
          <div class="gear-table-header" style="display: flex; gap: 16px; font-weight: bold; margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--glass-border);">
            <span style="flex: 1.5;" data-i18n="labels.pet">Pet</span>
            <span style="flex: 1;" data-i18n="labels.currentLevel">Current Level</span>
            <span style="flex: 1;" data-i18n="labels.targetLevel">Target Level</span>
          </div>
          <div id="petCollectionContainer" style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Rows injected by script.js -->
          </div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.petMaterials" style="margin-bottom: 16px;">Your Materials</h2>
        <div class="four-col-grid">
          <div class="gear-material-field">
            <label for="petFoodInput" data-i18n="labels.petFood" style="display:block; margin-bottom: 8px;">Pet Food</label>
            <input id="petFoodInput" type="number" min="0" value="0" class="global-select" />
          </div>
          <div class="gear-material-field">
            <label for="tamingManualInput" data-i18n="labels.tamingManual" style="display:block; margin-bottom: 8px;">Taming Manual</label>
            <input id="tamingManualInput" type="number" min="0" value="0" class="global-select" />
          </div>
          <div class="gear-material-field">
            <label for="energizingPotionInput" data-i18n="labels.energizingPotion" style="display:block; margin-bottom: 8px;">Energizing Potion</label>
            <input id="energizingPotionInput" type="number" min="0" value="0" class="global-select" />
          </div>
          <div class="gear-material-field">
            <label for="strengtheningSerumInput" data-i18n="labels.strengtheningSerum" style="display:block; margin-bottom: 8px;">Strengthening Serum</label>
            <input id="strengtheningSerumInput" type="number" min="0" value="0" class="global-select" />
          </div>
        </div>
      </div>

      

      <div id="petsResult" class="card-panel" style="margin-top: 24px; display: none;"></div>
    </div>
  `;

  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  if (typeof initPetsPanel === 'function') {
    initPetsPanel();
  }
  
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
  setTimeout(() => {
    const panel = document.getElementById('petsPanel');
    if (panel) {
      if (typeof window.onPetsCalculateClick !== 'function') {
        const res = document.getElementById('petsResult');
        if (res) {
          res.innerHTML = '<div style="color:red; padding: 20px;">CRITICAL ERROR: typeof initPetsPanel = ' + (typeof initPetsPanel) + ' / window keys: ' + Object.keys(window).filter(k => k.toLowerCase().includes('pet')).join(', ') + '</div>';
          res.style.display = 'block';
        }
      } else {
        panel.addEventListener('change', window.onPetsCalculateClick);
        panel.addEventListener('input', window.onPetsCalculateClick);
        window.onPetsCalculateClick();
      }
    }
  }, 100);

}
