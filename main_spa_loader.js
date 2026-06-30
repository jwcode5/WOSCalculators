// Ensure calculator dropdown is always populated and value is set
function ensureCalculatorDropdown(selectedKey) {
  const dropdown = document.getElementById('calculatorDropdown');
  if (!dropdown) return;
  const calculators = [
    { key: 'upgrade', label: 'Upgrade' },
    { key: 'chiefGear', label: 'Chief Gear' },
    { key: 'chiefCharm', label: 'Chief Charm' },
    { key: 'pets', label: 'Pets' },
    { key: 'experts', label: 'Experts Calculator' },
    { key: 'expertSkills', label: 'Expert Skills' },
    { key: 'heroGear', label: 'Hero Gear' },
    { key: 'koi', label: 'KoI Calculator' },
    { key: 'research', label: 'Research Upgrades' },
    { key: 'svs', label: 'SvS Calculator' },
    { key: 'troopTraining', label: 'Troop Training' },
    { key: 'warAcademy', label: 'War Academy' },
    { key: 'whatIf', label: 'What If' },
    { key: 'about', label: 'About' },
    { key: 'contact', label: 'Contact' }
  ];
  dropdown.innerHTML = calculators.map(c => `<option value="${c.key}" data-i18n="calculator.${c.key}">${c.label}</option>`).join('');
  dropdown.value = selectedKey || dropdown.value || 'upgrade';
}
// Dedicated SPA initializer for Upgrade calculator panel
async function initUpgradeCalculatorPanel() {
  // Wait for data to be loaded before proceeding
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  // Now populate building dropdown (options must exist before setting value)
  const targetBuildingSelect = document.getElementById('targetBuilding');
  if (window.BUILDING_COSTS && targetBuildingSelect) {
    const buildingKeys = Object.keys(window.BUILDING_COSTS);
    targetBuildingSelect.innerHTML = buildingKeys
      .map(b => `<option value="${b}" data-i18n="building.${b}">${b.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>`)
      .join('');
  }

  // Restore all state from the active account (this populates levels, supplies, optional buildings, etc.)
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
  // Attach dropdown listeners
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
  // (Removed redundant updateMainLevelSelectors and loadAllStateFromAccount here)
  // Attach supply/buff listeners
  if (typeof attachSupplyPersistenceListeners === 'function') {
    attachSupplyPersistenceListeners();
  }
  // Attach listeners for custom chests, optional buildings, bear hunt, etc.
  if (typeof updateCustomChestVisibility === 'function') {
    const customChestToggle = document.getElementById('useCustomChests');
    if (customChestToggle) {
      customChestToggle.addEventListener('change', updateCustomChestVisibility);
    }
    updateCustomChestVisibility();
  }
  if (typeof renderOptionalBuildings === 'function') {
    renderOptionalBuildings();
    const addBuildingBtn = document.getElementById('addBuildingBtn');
    if (addBuildingBtn && typeof addOptionalBuilding === 'function') {
      addBuildingBtn.addEventListener('click', addOptionalBuilding);
    }
  }
  if (typeof renderBearHuntMails === 'function') {
    renderBearHuntMails();
    const addBearHuntMailBtn = document.getElementById('addBearHuntMailBtn');
    if (addBearHuntMailBtn && typeof addBearHuntMail === 'function') {
      addBearHuntMailBtn.addEventListener('click', addBearHuntMail);
    }
  }
  // Attach calculate button
  const calculateBtn = document.getElementById('calculateBtn');
  if (calculateBtn && typeof onUpgradeCalculateClick === 'function') {
    calculateBtn.addEventListener('click', onUpgradeCalculateClick);
  }
}
// main_spa_loader.js
// SPA loader for WOS Calc home page. Dynamically renders calculator panels into #spaPanel.

window.activeCalculator = localStorage.getItem("wosCalc_activeCalculator") || "upgrade";

async function renderUpgradeCalculatorPanel() {
  console.log('[SPA] renderUpgradeCalculatorPanel called');
  // Render the full Upgrade calculator panel HTML
  document.getElementById('spaPanel').innerHTML = `
    <section id="upgradeCalculatorPanel">
      <fieldset>
        <legend data-i18n="sections.targetBuilding">Target Building</legend>
        <label for="targetBuilding" data-i18n="labels.building">Building</label>
        <select id="targetBuilding"></select>
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-top: 10px;">
          <div style="flex: 1 1 200px; min-width: 180px;">
            <label for="currentLevel" data-i18n="labels.currentLevel">Current Level</label>
            <select id="currentLevel"></select>
          </div>
          <div style="flex: 1 1 200px; min-width: 180px;">
            <label for="targetLevel" data-i18n="labels.targetGoalLevel">Target (Goal) Level</label>
            <select id="targetLevel"></select>
          </div>
        </div>
      </fieldset>
      <fieldset>
        <legend data-i18n="sections.yourResources">Your Resources</legend>
        <label for="ownedMeat" data-i18n="labels.meat">Meat</label>
        <input id="ownedMeat" type="text" value="0" inputmode="text" placeholder="e.g. 953.14M" />
        <label for="ownedWood" data-i18n="labels.wood">Wood</label>
        <input id="ownedWood" type="text" value="0" inputmode="text" placeholder="e.g. 953.14M" />
        <label for="ownedCoal" data-i18n="labels.coal">Coal</label>
        <input id="ownedCoal" type="text" value="0" inputmode="text" placeholder="e.g. 953.14M" />
        <label for="ownedIron" data-i18n="labels.iron">Iron</label>
        <input id="ownedIron" type="text" value="0" inputmode="text" placeholder="e.g. 953.14M" />
        <div id="fcSuppliesSection" style="display: none; margin-top: 12px;">
          <label for="ownedFireCrystals" data-i18n="labels.fireCrystals">Fire Crystals</label>
          <input id="ownedFireCrystals" type="text" value="0" inputmode="text" placeholder="e.g. 1200" />
          <label for="ownedRefinedFireCrystals" data-i18n="labels.refinedFireCrystals">Refined Fire Crystals</label>
          <input id="ownedRefinedFireCrystals" type="text" value="0" inputmode="text" placeholder="e.g. 450" />
        </div>
        <label for="useCustomChests" class="checkbox-row" style="margin-top: 12px;">
          <input id="useCustomChests" type="checkbox" />
          <span data-i18n="labels.useCustomResourceChests">Use Custom Resource Chests</span>
        </label>
        <div id="customChestSection" style="display: none; margin-top: 12px;">
          <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 10px;">
            <div style="flex: 1 1 180px; min-width: 160px;">
              <label for="customChestL1UnsecuredCount" data-i18n="labels.level1Unsecured">Level 1 Unsecured</label>
              <input id="customChestL1UnsecuredCount" type="number" min="0" value="0" />
            </div>
            <div style="flex: 1 1 180px; min-width: 160px;">
              <label for="customChestL1SecuredCount" data-i18n="labels.level1Secured">Level 1 Secured</label>
              <input id="customChestL1SecuredCount" type="number" min="0" value="0" />
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 10px;">
            <div style="flex: 1 1 180px; min-width: 160px;">
              <label for="customChestL2UnsecuredCount" data-i18n="labels.level2Unsecured">Level 2 Unsecured</label>
              <input id="customChestL2UnsecuredCount" type="number" min="0" value="0" />
            </div>
            <div style="flex: 1 1 180px; min-width: 160px;">
              <label for="customChestL2SecuredCount" data-i18n="labels.level2Secured">Level 2 Secured</label>
              <input id="customChestL2SecuredCount" type="number" min="0" value="0" />
            </div>
          </div>
          <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
            <div style="flex: 1 1 180px; min-width: 160px;">
              <label for="customChestL3UnsecuredCount" data-i18n="labels.level3Unsecured">Level 3 Unsecured</label>
              <input id="customChestL3UnsecuredCount" type="number" min="0" value="0" />
            </div>
            <div style="flex: 1 1 180px; min-width: 160px;">
              <label for="customChestL3SecuredCount" data-i18n="labels.level3Secured">Level 3 Secured</label>
              <input id="customChestL3SecuredCount" type="number" min="0" value="0" />
            </div>
          </div>
        </div>
        <label for="generalSpeedups" data-i18n="labels.generalSpeedups">General Speedups (minutes)</label>
        <input id="generalSpeedups" type="number" min="0" value="0" />
        <label for="constructionSpeedups" data-i18n="labels.constructionSpeedups">Construction Speedups (minutes)</label>
        <input id="constructionSpeedups" type="number" min="0" value="0" />
      </fieldset>
      <fieldset>
        <legend data-i18n="sections.constructionBuffs" style="margin: 0; padding: 0; border: none;">Construction Buffs (%)</legend>
        <div style="margin-bottom: 8px; color: #ffe08a; font-size: 0.95em; font-style: italic; line-height: 1.4;">
          <div data-i18n="labels.buffNote">Note: If construction buffs, e.g. Builder's Aide (Hyena Pet), Mercantilism, and VP, are in use already then they are already counted in your current construction speed. So don't add separately in the buffs section.</div>
          <div data-i18n="labels.hyenaNote" style="margin-top: 4px; opacity: 0.9;">Builder's Aide (Hyena Pet) applies only to the resource cost of HQ/Furnace and Wall.</div>
        </div>
        <label for="doubleTimeEnabled" class="checkbox-row">
          <input id="doubleTimeEnabled" type="checkbox" />
          <span data-i18n="labels.doubleTime">Double Time (20%)</span>
        </label>
        <label for="castleBuffEnabled" class="checkbox-row">
          <input id="castleBuffEnabled" type="checkbox" />
          <span data-i18n="labels.castleBuff">Castle Buff (10%)</span>
        </label>
        <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 2px;">
          <label for="constructionSpeedPct" data-i18n="labels.constructionSpeed" style="margin: 0; padding: 0; border: none;">Construction Speed</label>
          <span class="info-icon" tabindex="0" aria-label="Located on Power Tab, bottom of list under Growth heading." title="Located on Power Tab, bottom of list under Growth heading." style="width: 18px; height: 18px; font-size: 14px;">i</span>
        </div>
        <input id="constructionSpeedPct" type="number" min="0" step="0.1" value="0" />
        <label for="hyenaBuffPct" data-i18n="labels.hyenaBuff">Builder's Aide (Hyena) Buff</label>
        <select id="hyenaBuffPct">
          <option value="" selected data-i18n="options.none0">None (0%)</option>
          <option value="5">5%</option>
          <option value="7">7%</option>
          <option value="9">9%</option>
          <option value="12">12%</option>
          <option value="15">15%</option>
        </select>
        <label for="zinmanBastionistPct" data-i18n="labels.zinmanBastionist">Zinman's Bastionist Skill</label>
        <select id="zinmanBastionistPct">
          <option value="" selected data-i18n="options.none0">None (0%)</option>
          <option value="3">3%</option>
          <option value="6">6%</option>
          <option value="9">9%</option>
          <option value="12">12%</option>
          <option value="15">15%</option>
        </select>
        <label for="agnusProjectManagementHours" data-i18n="labels.agnusProjectManagement">Agnus' Project Management Skill</label>
        <select id="agnusProjectManagementHours">
          <option value="" selected data-i18n="options.none0">None (0h)</option>
          <option value="2">2h</option>
          <option value="3">3h</option>
          <option value="4">4h</option>
          <option value="6">6h</option>
          <option value="8">8h</option>
        </select>
        <label for="positionBuffPct" data-i18n="labels.positionBuff">Position Buff</label>
        <input id="positionBuffPct" type="number" min="0" step="0.1" value="0" />
      </fieldset>
      <fieldset id="prerequisitesSection" style="display: none;">
        <legend data-i18n="sections.requiredBuildings">Required Buildings</legend>
        <div id="prerequisitesContainer"></div>
      </fieldset>
      <fieldset id="optionalBuildingsSection">
        <legend data-i18n="sections.optionalAdditionalBuildings">Optional Additional Buildings</legend>
        <div id="optionalBuildingsContainer"></div>
        <button id="addBuildingBtn" type="button" data-i18n="buttons.addBuilding">+ Add Building</button>
      </fieldset>
      <fieldset>
        <legend data-i18n="sections.bearHuntMail">Bear Hunt Mail</legend>
        <div id="bearHuntMailsContainer"></div>
        <button id="addBearHuntMailBtn" type="button" data-i18n="buttons.addBearHuntMail">+ Add Bear Hunt Mail</button>
      </fieldset>
      <button id="calculateBtn" type="button" data-i18n="buttons.calculate">Calculate</button>
      <section id="result" class="result" data-i18n="results.loading">Loading building data...</section>
    </section>
  `;
  // Call SPA initializer for Upgrade panel
  if (typeof initUpgradeCalculatorPanel === 'function') {
    await initUpgradeCalculatorPanel();
  }
}

function renderPlaceholderPanel(panelName) {
  document.getElementById('spaPanel').innerHTML = `
    <section class="coming-soon-panel" style="display:flex; flex-direction:column; align-items:center; justify-content:center; padding: 2em 1em; text-align:center;">
      <img
        src="Images/ComingSoon.png"
        alt="Coming Soon — Page Under Construction"
        style="max-width: 700px; width: 100%; height: auto; border-radius: 12px;"
      />
      <p style="margin-top: 1em; font-size: 1.05em; color: var(--muted, #aaa);" data-i18n="comingSoon.heading" data-i18n-vals='{"calculator": "${panelName}"}'>${panelName} — Coming Soon</p>
    </section>
  `;
}

function renderAboutPanel() {
  document.getElementById('spaPanel').innerHTML = `
    <div class="card-panel" style="padding:2em 1.5em; background:var(--panel); box-shadow:var(--shadow); max-width:600px; margin:2em auto;">
      <h1 data-i18n="aboutPage.heading">About</h1>
      <p data-i18n="aboutPage.placeholderOne">This About page is a placeholder and will be expanded later.</p>
      <p data-i18n="aboutPage.placeholderTwo">The calculator architecture is being prepared first so new tools can ship without data loss between accounts.</p>
    </div>
  `;
}

function renderContactPanel() {
  document.getElementById('spaPanel').innerHTML = `
    <div class="card-panel" style="padding:2em 1.5em; background:var(--panel); box-shadow:var(--shadow); max-width:600px; margin:2em auto;">
      <h1 data-i18n="contactPage.heading">Contact</h1>
      <p data-i18n="contactPage.placeholderOne">This Contact page is a placeholder and will be expanded later.</p>
      <p data-i18n="contactPage.placeholderTwo">You can keep adding calculator features first and plug in final contact details when ready.</p>
    </div>
  `;
}

async function renderChiefGearCalculatorPanel() {
  console.log('[SPA] renderChiefGearCalculatorPanel called');
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  document.getElementById('spaPanel').innerHTML = `
    <!-- Chief Gear Calculator Panel -->
    <div id="chiefGearPanel">

      <!-- Gear current & target levels -->
      <fieldset>
        <legend data-i18n="sections.chiefGearLevels">Chief Gear Levels</legend>
        <div class="gear-table">
          <div class="gear-table-header">
            <span></span>
            <span data-i18n="labels.currentLevel">Current Level</span>
            <span data-i18n="labels.targetLevel">Target Level</span>
          </div>
          <div class="gear-table-block">
            <span class="gear-piece-label" data-i18n="labels.hat">Cap (Lancer)</span>
            <select id="hatCurrent"></select>
            <select id="hatTarget"></select>
          </div>
          <div class="gear-table-block">
            <span class="gear-piece-label" data-i18n="labels.watch">Watch (Lancer)</span>
            <select id="watchCurrent"></select>
            <select id="watchTarget"></select>
          </div>
          <div class="gear-table-block">
            <span class="gear-piece-label" data-i18n="labels.coat">Coat (Infantry)</span>
            <select id="coatCurrent"></select>
            <select id="coatTarget"></select>
          </div>
          <div class="gear-table-block">
            <span class="gear-piece-label" data-i18n="labels.pants">Pants (Infantry)</span>
            <select id="pantsCurrent"></select>
            <select id="pantsTarget"></select>
          </div>
          <div class="gear-table-block">
            <span class="gear-piece-label" data-i18n="labels.ring">Ring (Marksman)</span>
            <select id="ringCurrent"></select>
            <select id="ringTarget"></select>
          </div>
          <div class="gear-table-block">
            <span class="gear-piece-label" data-i18n="labels.shortStaff">Weapon (Marksman)</span>
            <select id="shortStaffCurrent"></select>
            <select id="shortStaffTarget"></select>
          </div>
        </div>
      </fieldset>

      <!-- Available materials -->
      <fieldset>
        <legend data-i18n="sections.chiefGearMaterials">Your Materials</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field">
            <label for="gearHardenedAlloy" data-i18n="labels.hardenedAlloy">Hardened Alloy</label>
            <input id="gearHardenedAlloy" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="gearPolishingSolution" data-i18n="labels.polishingSolution">Polishing Solution</label>
            <input id="gearPolishingSolution" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="gearDesignPlans" data-i18n="labels.designPlans">Design Plans</label>
            <input id="gearDesignPlans" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="gearLunarAmber" data-i18n="labels.lunarAmber">Lunar Amber</label>
            <input id="gearLunarAmber" type="number" min="0" value="0" />
          </div>
        </div>
      </fieldset>

      <div class="gear-button-row">
        <button id="gearCalculateBtn" type="button" data-i18n="buttons.calculate">Calculate</button>
        <button id="gearSmartUpgradeBtn" type="button" data-i18n="buttons.smartUpgrade">Smart Upgrade</button>
      </div>

      <section id="gearResult" class="result"></section>
    </div>
  `;
  if (typeof initChiefGearPanel === 'function') {
    initChiefGearPanel();
  }
}

async function renderPetsCalculatorPanel() {
  console.log('[SPA] renderPetsCalculatorPanel called');
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  document.getElementById('spaPanel').innerHTML = `
    <!-- Pets Collection Dashboard -->
    <div id="petsPanel">
      <fieldset>
        <legend data-i18n="sections.petLevels">Pet Collection</legend>
        
        <div class="pet-batch-controls">
          <div class="pet-batch-group">
            <label data-i18n="labels.setAllCurrentLevels">Set all current levels</label>
            <div class="pet-batch-inline">
              <select id="setAllPetCurrent"></select>
              <button type="button" id="setAllPetCurrentBtn" class="small-btn" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
          <div class="pet-batch-group">
            <label data-i18n="labels.setAllTargetLevels">Set all target levels</label>
            <div class="pet-batch-inline">
              <select id="setAllPetTarget"></select>
              <button type="button" id="setAllPetTargetBtn" class="small-btn" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
        </div>

        <div class="pet-collection-grid">
          <div class="pet-row-header">
            <span data-i18n="labels.pet">Pet</span>
            <span data-i18n="labels.currentLevel">Current</span>
            <span data-i18n="labels.targetLevel">Target</span>
          </div>
          <div id="petCollectionContainer">
            <!-- Rows injected by script.js -->
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.petMaterials">Your Materials</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field">
            <label for="petFoodInput" data-i18n="labels.petFood">Pet Food</label>
            <input id="petFoodInput" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="tamingManualInput" data-i18n="labels.tamingManual">Taming Manual</label>
            <input id="tamingManualInput" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="energizingPotionInput" data-i18n="labels.energizingPotion">Energizing Potion</label>
            <input id="energizingPotionInput" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="strengtheningSerumInput" data-i18n="labels.strengtheningSerum">Strengthening Serum</label>
            <input id="strengtheningSerumInput" type="number" min="0" value="0" />
          </div>
        </div>
      </fieldset>

      <div class="gear-button-row">
        <button id="petsCalculateBtn" type="button" data-i18n="buttons.calculate">Calculate</button>
        <button id="petsSmartUpgradeBtn" type="button" data-i18n="buttons.smartUpgrade">Smart Upgrade</button>
      </div>

      <section id="petsResult" class="result"></section>
    </div>
  `;
  if (typeof initPetsPanel === 'function') {
    initPetsPanel();
  }
}

async function renderSvSCalculatorPanel() {
  console.log('[SPA] renderSvSCalculatorPanel called');
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  document.getElementById('spaPanel').innerHTML = `
    <!-- SVS Calculator Panel -->
    <div id="svsPanel">
      <fieldset>
        <legend data-i18n="sections.svsImport">Import Data</legend>
        <div class="gear-button-row" style="flex-wrap: wrap; gap: 10px;">
          <button id="svsImportBuildingsBtn" type="button" data-i18n="buttons.importBuildings">Import Buildings</button>
          <button id="svsImportResearchBtn" type="button" data-i18n="buttons.importResearch">Import Research</button>
          <button id="svsImportPetsBtn" type="button" data-i18n="buttons.importPets">Import Pets</button>
          <button id="svsImportCharmsBtn" type="button" data-i18n="buttons.importCharms">Import Charms</button>
          <button id="svsImportGearBtn" type="button" data-i18n="buttons.importGear">Import Gear</button>
          <button id="svsImportExpertsBtn" type="button" data-i18n="buttons.importExperts">Import Experts</button>
          <button id="svsImportTroopsBtn" type="button" data-i18n="buttons.importTroops">Import Troops</button>
          <button id="svsImportAllBtn" type="button" class="accent-button" data-i18n="buttons.importAll">Import All</button>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.svsExpertSkills">Expert Skills</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field">
            <label>Valeria: Well Prepared (Level)</label>
            <select id="svsValeriaSkill" style="padding:5px; background:var(--input-bg); color:var(--text-color); border:1px solid #444; border-radius:4px; font-size:16px;">
              <option value="0">0 (0% Boost)</option>
              <option value="1">1 (2% Boost)</option>
              <option value="2">2 (4% Boost)</option>
              <option value="3">3 (6% Boost)</option>
              <option value="4">4 (8% Boost)</option>
              <option value="5">5 (10% Boost)</option>
              <option value="6">6 (12% Boost)</option>
              <option value="7">7 (14% Boost)</option>
              <option value="8">8 (16% Boost)</option>
              <option value="9">9 (18% Boost)</option>
              <option value="10">10 (20% Boost)</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.svsDay1">Day 1: City Construction</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field"><label>Fire Crystals</label><input id="svsD1_FC" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Fire Crystal Shards</label><input id="svsD1_FCShards" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Refined Fire Crystals</label><input id="svsD1_RefinedFC" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Speedups (minutes)</label><input id="svsD1_Speedups" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Chief Charm Score</label><input id="svsD1_Charm" type="number" min="0" value="0" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.svsDay2">Day 2: Basic Skills Up</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field"><label>Fire Crystals</label><input id="svsD2_FC" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Fire Crystal Shards</label><input id="svsD2_FCShards" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Refined Fire Crystals</label><input id="svsD2_RefinedFC" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Speedups (minutes)</label><input id="svsD2_Speedups" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Lucky Wheel Spins</label><input id="svsD2_LuckyWheel" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Rare Hero Shards</label><input id="svsD2_RareHero" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Epic Hero Shards</label><input id="svsD2_EpicHero" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Mythic Hero Shards</label><input id="svsD2_MythicHero" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Gather Meat (x1000)</label><input id="svsD2_Meat" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Gather Wood (x1000)</label><input id="svsD2_Wood" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Gather Coal (x200)</label><input id="svsD2_Coal" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Gather Iron (x50)</label><input id="svsD2_Iron" type="number" min="0" value="0" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.svsDay3">Day 3: Beast Slay</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field"><label>Pet Advancement Score</label><input id="svsD3_PetAdv" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Advanced Wild Mark</label><input id="svsD3_AdvWildMark" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Common Wild Mark</label><input id="svsD3_ComWildMark" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Lucky Wheel Spins</label><input id="svsD3_LuckyWheel" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Chief Charm Score</label><input id="svsD3_Charm" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Rare Hero Shards</label><input id="svsD3_RareHero" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Epic Hero Shards</label><input id="svsD3_EpicHero" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Mythic Hero Shards</label><input id="svsD3_MythicHero" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Polar Terror Rallies</label><input id="svsD3_PolarTerror" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Beast Lv 1-10</label><input id="svsD3_Beast1" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Beast Lv 11-15</label><input id="svsD3_Beast11" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Beast Lv 16-20</label><input id="svsD3_Beast16" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Beast Lv 21-25</label><input id="svsD3_Beast21" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Beast Lv 26-30</label><input id="svsD3_Beast26" type="number" min="0" value="0" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.svsDay4">Day 4: Hero Development</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field"><label>Chief Charm Score</label><input id="svsD4_Charm" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Hero Gear Essence Stone</label><input id="svsD4_EssenceStone" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Hero Exclusive Gear Widget</label><input id="svsD4_Widget" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Mithril</label><input id="svsD4_Mithril" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T1 Troops</label><input id="svsD4_T1" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T2 Troops</label><input id="svsD4_T2" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T3 Troops</label><input id="svsD4_T3" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T4 Troops</label><input id="svsD4_T4" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T5 Troops</label><input id="svsD4_T5" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T6 Troops</label><input id="svsD4_T6" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T7 Troops</label><input id="svsD4_T7" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T8 Troops</label><input id="svsD4_T8" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T9 Troops</label><input id="svsD4_T9" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T10 Troops</label><input id="svsD4_T10" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Train T11 Troops</label><input id="svsD4_T11" type="number" min="0" value="0" /></div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.svsDay5">Day 5: Power Boost</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field"><label>Pet Advancement Score</label><input id="svsD5_PetAdv" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Advanced Wild Mark</label><input id="svsD5_AdvWildMark" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Common Wild Mark</label><input id="svsD5_ComWildMark" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Hero Gear Essence Stone</label><input id="svsD5_EssenceStone" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Hero Exclusive Gear Widget</label><input id="svsD5_Widget" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Mithril</label><input id="svsD5_Mithril" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Chief Gear Score</label><input id="svsD5_GearScore" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Fire Crystals</label><input id="svsD5_FC" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Fire Crystal Shards</label><input id="svsD5_FCShards" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Refined Fire Crystals</label><input id="svsD5_RefinedFC" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label>Speedups (minutes)</label><input id="svsD5_Speedups" type="number" min="0" value="0" /></div>
        </div>
      </fieldset>

      <section id="svsResult" class="result"></section>
    </div>
  `;
  if (typeof initSvSPanel === 'function') {
    initSvSPanel();
  }
}

async function renderChiefCharmCalculatorPanel() {
  console.log('[SPA] renderChiefCharmCalculatorPanel called');
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  document.getElementById('spaPanel').innerHTML = `
    <!-- Chief Charm Calculator Panel -->
    <div id="chiefCharmPanel">

      <fieldset>
        <legend data-i18n="sections.chiefCharmLevels">Chief Charm Levels</legend>
        <div class="charm-batch-row">
          <div class="charm-batch-controls" style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.05); border-radius: 8px;">
            <label for="charmBatchCurrent" style="font-size: 0.95em;" data-i18n="labels.setAllCurrentLevels">Set all current levels</label>
            <div style="display: flex; gap: 10px; margin-top: 8px;">
              <select id="charmBatchCurrent" style="flex: 1;"></select>
              <button id="setAllCharmCurrentBtn" type="button" class="inlineActionBtn inlineActionBtnSecondary" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
        </div>
        <div style="height: 18px;"></div>
        <div class="gear-table">
          <div class="gear-table-header">
            <span></span>
            <span data-i18n="labels.currentLevel">Current Level</span>
            <span data-i18n="labels.targetLevel">Target Level</span>
          </div>
          <div id="charmTableBody"></div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.chiefCharmMaterials">Your Materials</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field">
            <label for="charmDesignsInput" data-i18n="labels.charmDesigns">Charm Designs</label>
            <input id="charmDesignsInput" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="charmGuidesInput" data-i18n="labels.charmGuides">Charm Guides</label>
            <input id="charmGuidesInput" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="jewelSecretsInput" data-i18n="labels.jewelSecrets">Jewel Secrets</label>
            <input id="jewelSecretsInput" type="number" min="0" value="0" />
          </div>
        </div>
      </fieldset>

      <div class="gear-button-row">
        <button id="charmCalculateBtn" type="button" data-i18n="buttons.calculate">Calculate</button>
        <button id="charmSmartUpgradeBtn" type="button" data-i18n="buttons.smartUpgrade">Smart Upgrade</button>
      </div>

      <section id="charmResult" class="result"></section>
    </div>
  `;
  if (typeof initChiefCharmPanel === 'function') {
    initChiefCharmPanel();
  }
}

async function renderExpertsCalculatorPanel() {
  console.log('[SPA] renderExpertsCalculatorPanel called');
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  document.getElementById('spaPanel').innerHTML = `
    <!-- Experts Calculator Panel -->
    <div id="expertsPanel">
      <fieldset>
        <legend data-i18n="sections.expertLevels">Expert Levels &amp; Skills</legend>

        <div class="pet-batch-controls">
          <div class="pet-batch-group">
            <label data-i18n="labels.setAllCurrentLevels">Set all affinity current levels</label>
            <div class="pet-batch-inline">
              <select id="setAllExpertCurrent"></select>
              <button type="button" id="setAllExpertCurrentBtn" class="small-btn" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
          <div class="pet-batch-group">
            <label data-i18n="labels.setAllTargetLevels">Set all affinity target levels</label>
            <div class="pet-batch-inline">
              <select id="setAllExpertTarget"></select>
              <button type="button" id="setAllExpertTargetBtn" class="small-btn" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
        </div>

        <div class="expert-collection-grid">
          <div class="expert-row-header">
            <span data-i18n="labels.expert">Expert</span>
            <span data-i18n="labels.currentLevel">Current</span>
            <span data-i18n="labels.targetLevel">Target</span>
            <span data-i18n="labels.expertSigils">Sigils</span>
          </div>
          <div id="expertCollectionContainer">
            <!-- Expert rows injected by script.js -->
          </div>
        </div>

      </fieldset>

      <fieldset>
        <legend data-i18n="sections.expertMaterials">Your Materials</legend>
        <div class="gear-materials-grid">

          <div class="gear-material-field" style="grid-column: 1 / -1;">
            <strong>Affinity &amp; Advancement Sigils</strong>
          </div>
          <div class="gear-material-field">
            <label for="expertAdvancementSigils" data-i18n="labels.generalAdvancementSigils">Common Expert Sigil</label>
            <input id="expertAdvancementSigils" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="expertCompass" data-i18n="labels.compass">Compass (10 Affinity)</label>
            <input id="expertCompass" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="expertFieryHeart" data-i18n="labels.fieryHeart">Fiery Heart (100 Affinity)</label>
            <input id="expertFieryHeart" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="expertSailOfConquest" data-i18n="labels.sailOfConquest">Sail of Conquest (1000 Affinity)</label>
            <input id="expertSailOfConquest" type="number" min="0" value="0" />
          </div>


        </div>
      </fieldset>

      <div class="gear-button-row">
        <div style="display:flex; gap:10px;">
          <button id="expertsCalculateBtn" type="button" data-i18n="buttons.calculate">Calculate</button>
          <button id="expertsSmartUpgradeBtn" type="button" class="accent-button" data-i18n="buttons.smartUpgrade">Smart Upgrade</button>
        </div>
      </div>

      <section id="expertsResult" class="result"></section>
    </div>
  `;
  if (typeof initExpertsPanel === 'function') {
    initExpertsPanel();
  }
}

async function renderExpertSkillsCalculatorPanel() {
  console.log('[SPA] renderExpertSkillsCalculatorPanel called');
  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  document.getElementById('spaPanel').innerHTML = `
    <!-- Expert Skills Calculator Panel -->
    <div id="expertSkillsPanel">
      <div style="margin-bottom: 16px; padding: 12px; background: rgba(255,165,0,0.1); border-left: 4px solid orange; border-radius: 4px;">
        <strong data-i18n="labels.note">Note:</strong> 
        <span data-i18n="messages.expertSkillsAffinityNote">Skill prerequisites depend on your Affinity levels. Please ensure you have filled out your current/target Affinity levels on the Experts Calculator page first to accurately see what skill targets you are eligible for.</span>
      </div>

      <fieldset>
        <legend data-i18n="sections.expertSkillsLevels">Expert Skills</legend>

        <div class="pet-batch-controls">
          <div class="pet-batch-group">
            <label data-i18n="labels.setAllCurrentLevels">Set all skill current levels</label>
            <div class="pet-batch-inline">
              <select id="setAllExpertSkillCurrent"></select>
              <button type="button" id="setAllExpertSkillCurrentBtn" class="small-btn" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
          <div class="pet-batch-group">
            <label data-i18n="labels.setAllTargetLevels">Set all skill target levels</label>
            <div class="pet-batch-inline">
              <select id="setAllExpertSkillTarget"></select>
              <button type="button" id="setAllExpertSkillTargetBtn" class="small-btn" data-i18n="buttons.setAll">Set All</button>
            </div>
          </div>
        </div>

        <div class="expert-skill-collection-grid">
          <div class="expert-row-header" style="grid-template-columns: 80px 1fr 1fr; min-width: 0;">
            <span data-i18n="labels.skill">Skill</span>
            <span data-i18n="labels.currentLevel">Current</span>
            <span data-i18n="labels.targetLevel">Target</span>
          </div>
          <div id="expertSkillCollectionContainer">
            <!-- Expert Skills rows injected by script.js -->
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend data-i18n="sections.expertSkillsMaterials">Your Materials</legend>
        <div class="gear-materials-grid">
          <div class="gear-material-field">
            <label for="expertSkillExp" data-i18n="labels.skillExp">Learning Speedups (minutes)</label>
            <input id="expertSkillExp" type="number" min="0" value="0" />
          </div>
          <div class="gear-material-field">
            <label for="expertSkillBooks" data-i18n="labels.skillBooks">Skill Books</label>
            <input id="expertSkillBooks" type="number" min="0" value="0" />
          </div>
        </div>
      </fieldset>

      <div class="gear-button-row">
        <div style="display:flex; gap:10px;">
          <button id="expertSkillsCalculateBtn" type="button" data-i18n="buttons.calculate">Calculate</button>
          <button id="expertSkillsSmartUpgradeBtn" type="button" class="accent-button" data-i18n="buttons.smartUpgrade">Smart Upgrade</button>
        </div>
      </div>

      <section id="expertSkillsResult" class="result"></section>
    </div>
  `;
  if (typeof initExpertSkillsPanel === 'function') {
    initExpertSkillsPanel();
  }
}

function spaLoaderInit() {
  let dropdown = document.getElementById('calculatorDropdown');
  function handlePanelChange(key) {
    ensureCalculatorDropdown(key);
    // Sync the global activeCalculator for script.js
    if (typeof window !== 'undefined') {
      window.activeCalculator = key;
    }
    // Save to localStorage so it persists across refreshes
    localStorage.setItem("wosCalc_activeCalculator", key);
    
    // We wrap the switch in an async IIFE to ensure we wait for async renderers
    // before applying translations
    (async () => {
      switch (key) {
      case 'upgrade':
        await renderUpgradeCalculatorPanel();
        break;
      case 'chiefGear':
        await renderChiefGearCalculatorPanel();
        break;
      case 'chiefCharm':
        await renderChiefCharmCalculatorPanel();
        break;
      case 'pets':
        await renderPetsCalculatorPanel();
        break;
      case 'whatIf':
        await renderPlaceholderPanel('What If');
        break;
      case 'experts':
        await renderExpertsCalculatorPanel();
        break;
      case 'expertSkills':
        await renderExpertSkillsCalculatorPanel();
        break;
      case 'heroGear':
        await renderPlaceholderPanel('Hero Gear');
        break;
      case 'koi':
        await renderPlaceholderPanel('KoI');
        break;
      case 'research':
        await renderPlaceholderPanel('Research Upgrades');
        break;
      case 'svs':
        await renderSvSCalculatorPanel();
        break;
      case 'troopTraining':
        await renderPlaceholderPanel('Troop Training');
        break;
      case 'warAcademy':
        await renderPlaceholderPanel('War Academy');
        break;
      case 'about':
        await renderAboutPanel();
        break;
      case 'contact':
        await renderContactPanel();
        break;
      default:
        await renderPlaceholderPanel('Unknown');
    }
    if (window.i18n && typeof window.i18n.translatePage === 'function') {
      window.i18n.translatePage();
    }
    })();
  }
  const savedKey = localStorage.getItem("wosCalc_activeCalculator");
  if (savedKey) {
    ensureCalculatorDropdown(savedKey);
  }
  
  dropdown = document.getElementById('calculatorDropdown');
  if (dropdown) {
    dropdown.addEventListener('change', function() {
      handlePanelChange(dropdown.value);
    });
    // Render initial panel based on saved state or current dropdown value
    handlePanelChange(savedKey || dropdown.value || 'upgrade');
  } else {
    handlePanelChange(savedKey || 'upgrade');
  }

  document.addEventListener('wos:languagechange', function() {
    if (window.activeCalculator) {
      handlePanelChange(window.activeCalculator);
    }
  });
}

document.addEventListener('DOMContentLoaded', spaLoaderInit);
