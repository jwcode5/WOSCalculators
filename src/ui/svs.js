export async function renderSvsCalculator(container) {
  container.innerHTML = `
    <div id="svsPanel">

      <div class="card-panel">
        <h2 data-i18n="sections.svsImport" style="margin-bottom: 16px;">Import Data</h2>
        <div class="gear-button-row" style="display: flex; flex-wrap: wrap; gap: 10px;">
          <button id="svsImportBuildingsBtn" type="button" class="secondary-button" data-i18n="buttons.importBuildings" style="flex: 1; min-width: 140px;">Import Buildings</button>
          <button id="svsImportResearchBtn" type="button" class="secondary-button" data-i18n="buttons.importResearch" style="flex: 1; min-width: 140px;">Import Research</button>
          <button id="svsImportPetsBtn" type="button" class="secondary-button" data-i18n="buttons.importPets" style="flex: 1; min-width: 140px;">Import Pets</button>
          <button id="svsImportCharmsBtn" type="button" class="secondary-button" data-i18n="buttons.importCharms" style="flex: 1; min-width: 140px;">Import Charms</button>
          <button id="svsImportGearBtn" type="button" class="secondary-button" data-i18n="buttons.importGear" style="flex: 1; min-width: 140px;">Import Gear</button>
          <button id="svsImportExpertsBtn" type="button" class="secondary-button" data-i18n="buttons.importExperts" style="flex: 1; min-width: 140px;">Import Experts</button>
          <button id="svsImportTroopsBtn" type="button" class="secondary-button" data-i18n="buttons.importTroops" style="flex: 1; min-width: 140px;">Import Troops</button>
          <button id="svsImportAllBtn" type="button" class="accent-button" data-i18n="buttons.importAll" style="flex: 1; min-width: 140px;">Import All</button>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.svsExpertSkills" style="margin-bottom: 16px;">Expert Skills</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field">
            <label style="display:block; margin-bottom: 8px;">Valeria: Well Prepared (What-If Level)</label>
            <select id="svsValeriaSkill" class="global-select" style="width: 100%;">
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
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.svsDay1" style="margin-bottom: 16px;">Day 1: City Construction</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Fire Crystals</label><input id="svsD1_FC" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Fire Crystal Shards</label><input id="svsD1_FCShards" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Refined Fire Crystals</label><input id="svsD1_RefinedFC" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Speedups (minutes)</label><input id="svsD1_Speedups" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Chief Charm Score</label><input id="svsD1_Charm" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.svsDay2" style="margin-bottom: 16px;">Day 2: Basic Skills Up</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Fire Crystals</label><input id="svsD2_FC" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Fire Crystal Shards</label><input id="svsD2_FCShards" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Refined Fire Crystals</label><input id="svsD2_RefinedFC" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Speedups (minutes)</label><input id="svsD2_Speedups" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Lucky Wheel Spins</label><input id="svsD2_LuckyWheel" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Rare Hero Shards</label><input id="svsD2_RareHero" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Epic Hero Shards</label><input id="svsD2_EpicHero" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Mythic Hero Shards</label><input id="svsD2_MythicHero" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Gather Meat (x1000)</label><input id="svsD2_Meat" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Gather Wood (x1000)</label><input id="svsD2_Wood" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Gather Coal (x200)</label><input id="svsD2_Coal" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Gather Iron (x50)</label><input id="svsD2_Iron" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.svsDay3" style="margin-bottom: 16px;">Day 3: Beast Slay</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Pet Advancement Score</label><input id="svsD3_PetAdv" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Advanced Wild Mark</label><input id="svsD3_AdvWildMark" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Common Wild Mark</label><input id="svsD3_ComWildMark" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Lucky Wheel Spins</label><input id="svsD3_LuckyWheel" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Chief Charm Score</label><input id="svsD3_Charm" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Rare Hero Shards</label><input id="svsD3_RareHero" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Epic Hero Shards</label><input id="svsD3_EpicHero" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Mythic Hero Shards</label><input id="svsD3_MythicHero" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Polar Terror Rallies</label><input id="svsD3_PolarTerror" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Beast Lv 1-10</label><input id="svsD3_Beast1" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Beast Lv 11-15</label><input id="svsD3_Beast11" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Beast Lv 16-20</label><input id="svsD3_Beast16" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Beast Lv 21-25</label><input id="svsD3_Beast21" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Beast Lv 26-30</label><input id="svsD3_Beast26" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.svsDay4" style="margin-bottom: 16px;">Day 4: Hero Development</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Chief Charm Score</label><input id="svsD4_Charm" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Hero Gear Essence Stone</label><input id="svsD4_EssenceStone" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Hero Exclusive Gear Widget</label><input id="svsD4_Widget" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Mithril</label><input id="svsD4_Mithril" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T1 Troops</label><input id="svsD4_T1" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T2 Troops</label><input id="svsD4_T2" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T3 Troops</label><input id="svsD4_T3" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T4 Troops</label><input id="svsD4_T4" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T5 Troops</label><input id="svsD4_T5" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T6 Troops</label><input id="svsD4_T6" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T7 Troops</label><input id="svsD4_T7" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T8 Troops</label><input id="svsD4_T8" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T9 Troops</label><input id="svsD4_T9" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T10 Troops</label><input id="svsD4_T10" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Train T11 Troops</label><input id="svsD4_T11" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
        </div>
      </div>

      <div class="card-panel">
        <h2 data-i18n="sections.svsDay5" style="margin-bottom: 16px;">Day 5: Power Boost</h2>
        <div class="two-col-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px;">
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Pet Advancement Score</label><input id="svsD5_PetAdv" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Advanced Wild Mark</label><input id="svsD5_AdvWildMark" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Common Wild Mark</label><input id="svsD5_ComWildMark" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Hero Gear Essence Stone</label><input id="svsD5_EssenceStone" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Hero Exclusive Gear Widget</label><input id="svsD5_Widget" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Mithril</label><input id="svsD5_Mithril" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Chief Gear Score</label><input id="svsD5_GearScore" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Fire Crystals</label><input id="svsD5_FC" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Fire Crystal Shards</label><input id="svsD5_FCShards" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Refined Fire Crystals</label><input id="svsD5_RefinedFC" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
          <div class="gear-material-field"><label style="display:block; margin-bottom: 8px;">Speedups (minutes)</label><input id="svsD5_Speedups" class="global-select" style="width: 100%;" type="number" min="0" value="0" /></div>
        </div>
      </div>

      <section id="svsResult" class="result"></section>
    </div>
  `;

  if (window.dataReadyPromise) {
    await window.dataReadyPromise;
  }
  
  setTimeout(() => {
    const svsPanel = document.getElementById('svsPanel');
    if (svsPanel && typeof window.updateSVSState === 'function') {
      svsPanel.addEventListener('change', window.updateSVSState);
      svsPanel.addEventListener('input', window.updateSVSState);
      window.updateSVSState();
    }
  }, 100);

  if (typeof initSvSPanel === 'function') {
    initSvSPanel();
  }
  
  if (typeof loadAllStateFromAccount === 'function') {
    loadAllStateFromAccount();
  }
}
