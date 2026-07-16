export async function renderUpgradeCalculator(container) {
  container.innerHTML = `
    <section id="upgradeCalculatorPanel">
      <div class="card-panel">
        <h2 data-i18n="sections.targetBuilding" style="margin-bottom: 16px;">Target Building</h2>
        <div class="three-col-grid">
          <div>
            <label for="targetBuilding" data-i18n="labels.building" style="display:block; margin-bottom: 8px; font-weight: 600;">Building</label>
            <select id="targetBuilding" class="global-select"></select>
          </div>
          <div>
            <label for="currentLevel" data-i18n="labels.currentLevel" style="display:block; margin-bottom: 8px; font-weight: 600;">Current Level</label>
            <select id="currentLevel" class="global-select"></select>
          </div>
          <div>
            <label for="targetLevel" data-i18n="labels.targetGoalLevel" style="display:block; margin-bottom: 8px; font-weight: 600;">Target (Goal) Level</label>
            <select id="targetLevel" class="global-select"></select>
          </div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.yourResources" style="margin-bottom: 16px;">Your Resources</h2>
        <div class="four-col-grid">
          <div>
            <label for="ownedMeat" data-i18n="labels.meat" style="display:block; margin-bottom: 8px;">Meat</label>
            <input id="ownedMeat" type="text" value="0" class="global-select" placeholder="e.g. 953.14M" />
          </div>
          <div>
            <label for="ownedWood" data-i18n="labels.wood" style="display:block; margin-bottom: 8px;">Wood</label>
            <input id="ownedWood" type="text" value="0" class="global-select" placeholder="e.g. 953.14M" />
          </div>
          <div>
            <label for="ownedCoal" data-i18n="labels.coal" style="display:block; margin-bottom: 8px;">Coal</label>
            <input id="ownedCoal" type="text" value="0" class="global-select" placeholder="e.g. 953.14M" />
          </div>
          <div>
            <label for="ownedIron" data-i18n="labels.iron" style="display:block; margin-bottom: 8px;">Iron</label>
            <input id="ownedIron" type="text" value="0" class="global-select" placeholder="e.g. 953.14M" />
          </div>
        </div>

        <div id="fcSuppliesSection" style="display: none; margin-top: 16px;">
          <div class="two-col-grid">
            <div>
              <label for="ownedFireCrystals" data-i18n="labels.fireCrystals" style="display:block; margin-bottom: 8px;">Fire Crystals</label>
              <input id="ownedFireCrystals" type="text" value="0" class="global-select" placeholder="e.g. 1200" />
            </div>
            <div>
              <label for="ownedRefinedFireCrystals" data-i18n="labels.refinedFireCrystals" style="display:block; margin-bottom: 8px;">Refined Fire Crystals</label>
              <input id="ownedRefinedFireCrystals" type="text" value="0" class="global-select" placeholder="e.g. 450" />
            </div>
          </div>
        </div>

        <label for="useCustomChests" style="display:flex; align-items:center; gap: 12px; cursor: pointer; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-radius: 8px; transition: background 0.2s ease; margin-top: 24px; width: fit-content;">
          <input id="useCustomChests" type="checkbox" style="width: 18px; height: 18px; cursor: pointer;" />
          <span data-i18n="labels.useCustomResourceChests" style="font-weight: 600;">Use Custom Resource Chests</span>
        </label>
        <div id="customChestSection" style="display: none; margin-top: 16px;">
          <div class="three-col-grid">
            <div>
              <label for="customChestL1UnsecuredCount" data-i18n="labels.level1Unsecured">Level 1 Unsecured</label>
              <input id="customChestL1UnsecuredCount" type="number" min="0" value="0" class="global-select" />
            </div>
            <div>
              <label for="customChestL2UnsecuredCount" data-i18n="labels.level2Unsecured">Level 2 Unsecured</label>
              <input id="customChestL2UnsecuredCount" type="number" min="0" value="0" class="global-select" />
            </div>
            <div>
              <label for="customChestL3UnsecuredCount" data-i18n="labels.level3Unsecured">Level 3 Unsecured</label>
              <input id="customChestL3UnsecuredCount" type="number" min="0" value="0" class="global-select" />
            </div>
            <div>
              <label for="customChestL1SecuredCount" data-i18n="labels.level1Secured">Level 1 Secured</label>
              <input id="customChestL1SecuredCount" type="number" min="0" value="0" class="global-select" />
            </div>
            <div>
              <label for="customChestL2SecuredCount" data-i18n="labels.level2Secured">Level 2 Secured</label>
              <input id="customChestL2SecuredCount" type="number" min="0" value="0" class="global-select" />
            </div>
            <div>
              <label for="customChestL3SecuredCount" data-i18n="labels.level3Secured">Level 3 Secured</label>
              <input id="customChestL3SecuredCount" type="number" min="0" value="0" class="global-select" />
            </div>
          </div>
        </div>

        <div class="two-col-grid" style="margin-top: 24px;">
          <div>
            <label for="generalSpeedups" data-i18n="labels.generalSpeedups" style="display:block; margin-bottom: 8px;">General Speedups (minutes)</label>
            <input id="generalSpeedups" type="number" min="0" value="0" class="global-select" />
          </div>
          <div>
            <label for="constructionSpeedups" data-i18n="labels.constructionSpeedups" style="display:block; margin-bottom: 8px;">Construction Speedups (minutes)</label>
            <input id="constructionSpeedups" type="number" min="0" value="0" class="global-select" />
          </div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.constructionBuffs" style="margin-bottom: 16px;">Construction Buffs (%)</h2>
        <div style="margin-bottom: 24px; color: #94a3b8; font-size: 0.9em; font-style: italic;">
          <div data-i18n="labels.buffNote">Note: If construction buffs (e.g. Builder's Aide) are in use already, they are counted in your current construction speed.</div>
        </div>

        <div class="two-col-grid" style="margin-bottom: 24px;">
          <label for="doubleTimeEnabled" style="display:flex; align-items:center; gap: 12px; cursor: pointer; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-radius: 8px; transition: background 0.2s ease;">
            <input id="doubleTimeEnabled" type="checkbox" style="width: 18px; height: 18px; cursor: pointer;" />
            <span data-i18n="labels.doubleTime" style="font-weight: 600;">Double Time (20%)</span>
          </label>
          <label for="castleBuffEnabled" style="display:flex; align-items:center; gap: 12px; cursor: pointer; padding: 12px 16px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-radius: 8px; transition: background 0.2s ease;">
            <input id="castleBuffEnabled" type="checkbox" style="width: 18px; height: 18px; cursor: pointer;" />
            <span data-i18n="labels.castleBuff" style="font-weight: 600;">Castle Buff (10%)</span>
          </label>
        </div>

        <div class="two-col-grid">
          <div>
            <label for="constructionSpeedPct" data-i18n="labels.constructionSpeed" style="display:block; margin-bottom: 8px;">Construction Speed</label>
            <input id="constructionSpeedPct" type="number" min="0" step="0.1" value="0" class="global-select" />
          </div>
          <div>
            <label for="hyenaBuffPct" data-i18n="labels.hyenaBuff" style="display:block; margin-bottom: 8px;">Builder's Aide (Hyena) Buff</label>
            <select id="hyenaBuffPct" class="global-select">
              <option value="" selected data-i18n="options.none0">None (0%)</option>
              <option value="5">5%</option>
              <option value="7">7%</option>
              <option value="9">9%</option>
              <option value="12">12%</option>
              <option value="15">15%</option>
            </select>
          </div>
          <div>
            <label for="zinmanBastionistPct" data-i18n="labels.zinmanBastionist" style="display:block; margin-bottom: 8px;">Zinman's Bastionist Skill</label>
            <select id="zinmanBastionistPct" class="global-select">
              <option value="" selected data-i18n="options.none0">None (0%)</option>
              <option value="3">3%</option>
              <option value="6">6%</option>
              <option value="9">9%</option>
              <option value="12">12%</option>
              <option value="15">15%</option>
            </select>
          </div>
          <div>
            <label for="agnusProjectManagementHours" data-i18n="labels.agnusProjectManagement" style="display:block; margin-bottom: 8px;">Agnus' Project Management Skill</label>
            <select id="agnusProjectManagementHours" class="global-select">
              <option value="" selected data-i18n="options.none0">None (0h)</option>
              <option value="2">2h</option>
              <option value="3">3h</option>
              <option value="4">4h</option>
              <option value="6">6h</option>
              <option value="8">8h</option>
            </select>
          </div>
          <div>
            <label for="positionBuffPct" data-i18n="labels.positionBuff" style="display:block; margin-bottom: 8px;">Position Buff</label>
            <input id="positionBuffPct" type="number" min="0" step="0.1" value="0" class="global-select" />
          </div>
        </div>
      </div>

      <div class="card-panel" id="prerequisitesSection" style="display: none;">
        <h2 data-i18n="sections.requiredBuildings" style="margin-bottom: 16px;">Required Buildings</h2>
        <div id="prerequisitesContainer"></div>
      </div>

      <div class="card-panel" id="optionalBuildingsSection">
        <h2 data-i18n="sections.optionalAdditionalBuildings" style="margin-bottom: 16px;">Optional Additional Buildings</h2>
        <div id="optionalBuildingsContainer"></div>
        <button id="addBuildingBtn" type="button" class="secondary-button" data-i18n="buttons.addBuilding" style="margin-top: 16px;">+ Add Building</button>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.bearHuntMail" style="margin-bottom: 16px;">Bear Hunt Mail</h2>
        <div id="bearHuntMailsContainer"></div>
        <button id="addBearHuntMailBtn" type="button" class="secondary-button" data-i18n="buttons.addBearHuntMail" style="margin-top: 16px;">+ Add Bear Hunt Mail</button>
      </div>

      <div style="margin-top: 24px;">
        <button id="calculateBtn" type="button" style="display: none;"></button>
      </div>

      <div class="card-panel" style="margin-top: 24px;">
        <h2 data-i18n="sections.totals" style="margin-bottom: 16px;">Totals</h2>
        <div id="result" data-i18n="results.loading">
          Loading building data...
        </div>
      </div>
    </section>
  `;

  // --- Initialization Logic ---
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  const targetBuildingSelect = document.getElementById('targetBuilding');
  if (window.BUILDING_COSTS && targetBuildingSelect) {
    const buildingKeys = Object.keys(window.BUILDING_COSTS);
    targetBuildingSelect.innerHTML = buildingKeys
      .map(b => `<option value="${b}" data-i18n="building.${b}">${b.replace(/_/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase())}</option>`)
      .join('');
  }

  // Use the global script.js logic if available
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }

  if (targetBuildingSelect) {
    targetBuildingSelect.addEventListener('change', function() {
      if (typeof updateMainLevelSelectors === 'function') updateMainLevelSelectors(this.value);
      const currentLevelKey = document.getElementById('currentLevel').value;
      const targetLevelKey = document.getElementById('targetLevel').value;
      if (typeof updatePrerequisites === 'function') updatePrerequisites(this.value, currentLevelKey, targetLevelKey, true);
      if (typeof updateFireCrystalSuppliesVisibility === 'function') updateFireCrystalSuppliesVisibility(this.value, currentLevelKey, targetLevelKey);
      if (typeof saveTargetBuildingState === 'function') saveTargetBuildingState();
    });
  }

  const currentLevelSelect = document.getElementById('currentLevel');
  if (currentLevelSelect) {
    currentLevelSelect.addEventListener('change', function() {
      const selectedBuilding = document.getElementById('targetBuilding').value;
      const currentLevelKey = this.value;
      const targetLevelSelect = document.getElementById('targetLevel');
      const orderedLevels = typeof getBuildingLevelOrder === 'function' ? getBuildingLevelOrder(selectedBuilding) : [];
      const currentIdx = orderedLevels.indexOf(currentLevelKey);
      const targetIdx = orderedLevels.indexOf(targetLevelSelect.value);
      if (targetIdx < currentIdx) {
        targetLevelSelect.value = currentLevelKey;
      }
      if (typeof updatePrerequisites === 'function') updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelSelect.value);
      if (typeof updateFireCrystalSuppliesVisibility === 'function') updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, targetLevelSelect.value);
      if (typeof saveTargetBuildingState === 'function') saveTargetBuildingState();
    });
  }

  const targetLevelSelect = document.getElementById('targetLevel');
  if (targetLevelSelect) {
    targetLevelSelect.addEventListener('change', function() {
      const selectedBuilding = document.getElementById('targetBuilding').value;
      const currentLevelKey = document.getElementById('currentLevel').value;
      const orderedLevels = typeof getBuildingLevelOrder === 'function' ? getBuildingLevelOrder(selectedBuilding) : [];
      const currentIdx = orderedLevels.indexOf(currentLevelKey);
      const targetIdx = orderedLevels.indexOf(this.value);
      if (targetIdx < currentIdx) {
        this.value = currentLevelKey;
      }
      if (typeof updatePrerequisites === 'function') updatePrerequisites(selectedBuilding, currentLevelKey, this.value, true);
      if (typeof updateFireCrystalSuppliesVisibility === 'function') updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, this.value);
      if (typeof saveTargetBuildingState === 'function') saveTargetBuildingState();
    });
  }

  if (typeof attachSupplyPersistenceListeners === 'function') attachSupplyPersistenceListeners();
  
  if (typeof updateCustomChestVisibility === 'function') {
    const customChestToggle = document.getElementById('useCustomChests');
    if (customChestToggle) customChestToggle.addEventListener('change', updateCustomChestVisibility);
    updateCustomChestVisibility();
  }
  
  if (typeof renderOptionalBuildings === 'function') {
    renderOptionalBuildings();
    const addBuildingBtn = document.getElementById('addBuildingBtn');
    if (addBuildingBtn && typeof addOptionalBuilding === 'function') addBuildingBtn.addEventListener('click', addOptionalBuilding);
  }
  
  if (typeof renderBearHuntMails === 'function') {
    renderBearHuntMails();
    const addBearHuntMailBtn = document.getElementById('addBearHuntMailBtn');
    if (addBearHuntMailBtn && typeof addBearHuntMail === 'function') addBearHuntMailBtn.addEventListener('click', addBearHuntMail);
  }

  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn && typeof onUpgradeCalculateClick === 'function') {
    calculateBtn.addEventListener('click', onUpgradeCalculateClick);
  }

  // Trigger initial populate
  if (typeof updateMainLevelSelectors === 'function' && targetBuildingSelect) {
     updateMainLevelSelectors(targetBuildingSelect.value);
  }
}

// Injected Dynamic Listeners
setTimeout(() => {
  const panel = document.getElementById('upgradeCalculatorPanel');
  if (panel && typeof onUpgradeCalculateClick === 'function') {
    panel.addEventListener('change', onUpgradeCalculateClick);
    panel.addEventListener('input', onUpgradeCalculateClick);
    onUpgradeCalculateClick();
  }
}, 100);
