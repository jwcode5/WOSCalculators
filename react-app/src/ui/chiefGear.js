export async function renderChiefGearCalculator(container) {
  container.innerHTML = `
    <!-- Chief Gear Calculator Panel -->
    <div id="chiefGearPanel">

      <!-- Gear current & target levels -->
      <div class="card-panel">
        <h2 data-i18n="sections.chiefGearLevels" style="margin-bottom: 16px;">Chief Gear Levels</h2>
        <div class="gear-table" style="display: flex; flex-direction: column; gap: 12px;">
          <div class="gear-table-header" style="display: flex; gap: 16px; font-weight: bold; margin-bottom: 8px;">
            <span style="flex: 1;">Piece</span>
            <span style="flex: 1;" data-i18n="labels.currentLevel">Current Level</span>
            <span style="flex: 1;" data-i18n="labels.targetLevel">Target Level</span>
          </div>
          
          <div class="gear-table-block" style="display: flex; gap: 16px; align-items: center;">
            <span class="gear-piece-label" data-i18n="labels.hat" style="flex: 1;">Cap (Lancer)</span>
            <select id="hatCurrent" class="global-select" style="flex: 1;"></select>
            <select id="hatTarget" class="global-select" style="flex: 1;"></select>
          </div>
          
          <div class="gear-table-block" style="display: flex; gap: 16px; align-items: center;">
            <span class="gear-piece-label" data-i18n="labels.watch" style="flex: 1;">Watch (Lancer)</span>
            <select id="watchCurrent" class="global-select" style="flex: 1;"></select>
            <select id="watchTarget" class="global-select" style="flex: 1;"></select>
          </div>
          
          <div class="gear-table-block" style="display: flex; gap: 16px; align-items: center;">
            <span class="gear-piece-label" data-i18n="labels.coat" style="flex: 1;">Coat (Infantry)</span>
            <select id="coatCurrent" class="global-select" style="flex: 1;"></select>
            <select id="coatTarget" class="global-select" style="flex: 1;"></select>
          </div>
          
          <div class="gear-table-block" style="display: flex; gap: 16px; align-items: center;">
            <span class="gear-piece-label" data-i18n="labels.pants" style="flex: 1;">Pants (Infantry)</span>
            <select id="pantsCurrent" class="global-select" style="flex: 1;"></select>
            <select id="pantsTarget" class="global-select" style="flex: 1;"></select>
          </div>
          
          <div class="gear-table-block" style="display: flex; gap: 16px; align-items: center;">
            <span class="gear-piece-label" data-i18n="labels.ring" style="flex: 1;">Ring (Marksman)</span>
            <select id="ringCurrent" class="global-select" style="flex: 1;"></select>
            <select id="ringTarget" class="global-select" style="flex: 1;"></select>
          </div>
          
          <div class="gear-table-block" style="display: flex; gap: 16px; align-items: center;">
            <span class="gear-piece-label" data-i18n="labels.shortStaff" style="flex: 1;">Weapon (Marksman)</span>
            <select id="shortStaffCurrent" class="global-select" style="flex: 1;"></select>
            <select id="shortStaffTarget" class="global-select" style="flex: 1;"></select>
          </div>
        </div>
      </div>

      <!-- Available materials -->
      <div class="card-panel">
        <h2 data-i18n="sections.chiefGearMaterials" style="margin-bottom: 16px;">Your Materials</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field">
            <label for="gearHardenedAlloy" data-i18n="labels.hardenedAlloy" style="display:block; margin-bottom: 8px;">Hardened Alloy</label>
            <input id="gearHardenedAlloy" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
          <div class="gear-material-field">
            <label for="gearPolishingSolution" data-i18n="labels.polishingSolution" style="display:block; margin-bottom: 8px;">Polishing Solution</label>
            <input id="gearPolishingSolution" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
          <div class="gear-material-field">
            <label for="gearDesignPlans" data-i18n="labels.designPlans" style="display:block; margin-bottom: 8px;">Design Plans</label>
            <input id="gearDesignPlans" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
          <div class="gear-material-field">
            <label for="gearLunarAmber" data-i18n="labels.lunarAmber" style="display:block; margin-bottom: 8px;">Lunar Amber</label>
            <input id="gearLunarAmber" type="number" min="0" value="0" class="global-select" style="width: 100%;" />
          </div>
        </div>
      </div>

      

      <div id="gearResult" class="card-panel" style="margin-top: 24px; display: none;"></div>
    </div>
  `;

  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  if (typeof initChiefGearPanel === 'function') {
    initChiefGearPanel();
  }
  
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
  setTimeout(() => {
    const panel = document.getElementById('chiefGearPanel');
    if (panel && typeof window.onGearCalculateClick === 'function') {
      panel.addEventListener('change', window.onGearCalculateClick);
      panel.addEventListener('input', window.onGearCalculateClick);
      window.onGearCalculateClick();
    }
  }, 100);

}
