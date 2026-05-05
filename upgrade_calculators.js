// upgrade_calculators.js
// Shared logic for all upgrade calculators (pets, charms, gear, etc.)
// This script detects the calculator type and loads the appropriate UI and data.

// Example usage: <script src="../upgrade_calculators.js" data-calc="pets"></script>

document.addEventListener('DOMContentLoaded', async function() {
    // Apply theme preference on load (matches upgrade/gear pages)
    try {
      const theme = localStorage.getItem('wosCalc_theme') || 'wos';
      document.body.dataset.theme = theme;
    } catch {}
  // Detect calculator type from script tag or body data attribute
  let calcType = document.body.dataset.calc;
  if (!calcType) {
    // Try to get from script tag
    const script = document.currentScript || Array.from(document.scripts).find(s => s.src && s.src.includes('upgrade_calculators.js'));
    if (script && script.dataset.calc) calcType = script.dataset.calc;
  }
  if (!calcType) {
    // Try from URL query string
    const params = new URLSearchParams(window.location.search);
    calcType = params.get('calc');
  }
  if (!calcType) {
    document.body.innerHTML = '<div style="color:red;">No calculator type specified.</div>';
    return;
  }

  // Render main calculator navigation
  renderCalculatorNav(calcType);
  // Load the appropriate calculator
  if (calcType === 'pets') {
    await initPetsCalculator();
  } else if (calcType === 'charms') {
    await initCharmsCalculator();
  } else if (calcType === 'gear') {
    await initGearCalculator();
  } else if (calcType === 'more') {
    await initMorePage();
  } else if (calcType === 'about') {
    await initAboutPage();
  } else if (calcType === 'contact') {
    await initContactPage();
  } else {
    document.getElementById('calcContent').innerHTML = `<div style="color:red;">Unknown calculator type: ${calcType}</div>`;
  }
// --- MAIN NAVIGATION ---
function renderCalculatorNav(active) {
  // Remove all body content
  document.body.innerHTML = '';
  // Main container
  const main = document.createElement('main');
  main.className = 'container';
  // Top row with dropdown and About/Contact buttons
  const topRow = document.createElement('div');
  topRow.className = 'top-row';
  // Calculator dropdown (alphabetical order)
  const calculators = [
    { label: 'Charms', value: 'charms' },
    { label: 'Gear', value: 'gear' },
    { label: 'Experts Calculator', value: 'experts' },
    { label: 'Hero Gear', value: 'hero-gear' },
    { label: 'KoI Calculator', value: 'koi' },
    { label: 'Pets', value: 'pets' },
    { label: 'Research Upgrades', value: 'research-upgrades' },
    { label: 'SvS Calculator', value: 'svs' },
    { label: 'Troop Training', value: 'troop-training' },
    { label: 'War Academy', value: 'war-academy' }
  ];
  calculators.sort((a, b) => a.label.localeCompare(b.label));
  // Default to 'pets' if not found
  let selectedCalc = calculators.find(c => c.value === active) ? active : 'pets';
  const select = document.createElement('select');
  select.className = 'card-panel';
  select.style.flex = '1';
  select.style.fontSize = '1.1em';
  select.style.fontWeight = '600';
  select.style.padding = '0.5em 1em';
  calculators.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.value;
    opt.textContent = c.label;
    if (c.value === selectedCalc) opt.selected = true;
    select.appendChild(opt);
  });
  select.addEventListener('change', async e => {
    const val = e.target.value;
    renderCalculatorNav(val);
    if (val === 'pets') {
      await initPetsCalculator();
    } else if (val === 'charms') {
      await initCharmsCalculator();
    } else if (val === 'gear') {
      await initGearCalculator();
    } else if (val === 'experts') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>Experts Calculator Coming Soon</h2></div>';
    } else if (val === 'hero-gear') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>Hero Gear Calculator Coming Soon</h2></div>';
    } else if (val === 'koi') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>KoI Calculator Coming Soon</h2></div>';
    } else if (val === 'research-upgrades') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>Research Upgrades Calculator Coming Soon</h2></div>';
    } else if (val === 'svs') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>SvS Calculator Coming Soon</h2></div>';
    } else if (val === 'troop-training') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>Troop Training Calculator Coming Soon</h2></div>';
    } else if (val === 'war-academy') {
      document.getElementById('calcContent').innerHTML = '<div class="container"><h2>War Academy Calculator Coming Soon</h2></div>';
    } else {
      document.getElementById('calcContent').innerHTML = `<div style=\"color:red;\">Unknown calculator type: ${val}</div>`;
    }
    window.history.replaceState({}, '', '?calc=' + val);
  });
  // About and Contact buttons
  const aboutBtn = document.createElement('button');
  aboutBtn.className = 'card-panel';
  aboutBtn.textContent = 'About';
  aboutBtn.style.marginLeft = '0.5em';
  aboutBtn.onclick = async () => {
    renderCalculatorNav('about');
    await initAboutPage();
    window.history.replaceState({}, '', '?calc=about');
  };
  const contactBtn = document.createElement('button');
  contactBtn.className = 'card-panel';
  contactBtn.textContent = 'Contact';
  contactBtn.style.marginLeft = '0.5em';
  contactBtn.onclick = async () => {
    renderCalculatorNav('contact');
    await initContactPage();
    window.history.replaceState({}, '', '?calc=contact');
  };
  // Layout for mobile: dropdown first, then About/Contact
  topRow.style.display = 'flex';
  topRow.style.flexDirection = 'row';
  topRow.style.gap = '0.5em';
  topRow.appendChild(select);
  topRow.appendChild(aboutBtn);
  topRow.appendChild(contactBtn);
  main.appendChild(topRow);
  // Content area
  const content = document.createElement('div');
  content.id = 'calcContent';
  main.appendChild(content);
  document.body.appendChild(main);
}
// --- MORE PAGE LOGIC ---
async function initMorePage() {
  document.getElementById('calcContent').innerHTML = `
    <div class="card-panel" style="padding:2em 1.5em; display: flex; flex-direction: column; gap: 1.2em; background: var(--panel); box-shadow: var(--shadow);">
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/experts-calculator.html">Experts Calculator</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/hero-gear.html">Hero Gear</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/koi-calculator.html">KoI Calculator</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/pets.html">Pets Calculator</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/research-upgrades.html">Research Upgrades</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/svs-calculator.html">SvS Calculator</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/troop-training.html">Troop Training</a>
      <a class="card-panel" style="text-align:center; font-size:1.25em; font-weight:600; text-decoration:none; transition:background 0.2s, box-shadow 0.2s; box-shadow: var(--shadow);" href="Pages/war-academy.html">War Academy</a>
      <a href="../index.html" class="card-panel" style="text-align:center; font-size:1.1em; font-weight:600; text-decoration:none; margin-top:0.5em;">Back to Home</a>
    </div>
    <p style="margin-top:2em; color:#ffd700; font-weight:600; text-align:center;">These calculators are planned for future development. Suggestions welcome!</p>
  `;
}

// --- ABOUT PAGE LOGIC ---
async function initAboutPage() {
  document.getElementById('calcContent').innerHTML = `
    <div class="card-panel" style="padding:2em 1.5em; background:var(--panel); box-shadow:var(--shadow); max-width:600px; margin:2em auto;">
      <h1>About</h1>
      <p>This About page is a placeholder and will be expanded later.</p>
      <p>The calculator architecture is being prepared first so new tools can ship without data loss between accounts.</p>
      <a href="../index.html" class="card-panel" style="display:inline-block; margin-top:1.5em;">Return to Calculator</a>
    </div>
  `;
}

// --- CONTACT PAGE LOGIC ---
async function initContactPage() {
  document.getElementById('calcContent').innerHTML = `
    <div class="card-panel" style="padding:2em 1.5em; background:var(--panel); box-shadow:var(--shadow); max-width:600px; margin:2em auto;">
      <h1>Contact</h1>
      <p>This Contact page is a placeholder and will be expanded later.</p>
      <p>You can keep adding calculator features first and plug in final contact details when ready.</p>
      <a href="../index.html" class="card-panel" style="display:inline-block; margin-top:1.5em;">Return to Calculator</a>
    </div>
  `;
}

// --- PETS CALCULATOR LOGIC (migrated from pets_calc.js) ---
async function initPetsCalculator() {
  // Render the entire calculator UI into the SPA container
  document.getElementById('calcContent').innerHTML = `
    <div class="top-row">
      <div>
        <h1>Pets Upgrade Calculator</h1>
        <p>Calculate upgrade costs and SvS points for pets</p>
      </div>
      <div class="top-controls"></div>
    </div>
    <section style="max-width: 500px; margin: 2em auto;">
      <form id="petCalcForm" style="display: flex; flex-direction: column; gap: 1em;">
        <label for="petSelect">Pet:</label>
        <select id="petSelect"></select>
        <div style="display: flex; gap: 1em; align-items: flex-end;">
          <div style="flex:1;">
            <label for="currentLevel">Current Level:</label>
            <input type="number" id="currentLevel" min="1" value="1" style="width:100%;">
          </div>
          <div style="flex:1;">
            <label for="targetLevel">Target Level:</label>
            <input type="number" id="targetLevel" min="1" value="2" style="width:100%;">
          </div>
        </div>
        <div style="display: flex; gap: 1em; margin-top:1em;">
          <div style="flex:1;">
            <label for="petFood">Pet Food:</label>
            <input type="number" id="petFood" min="0" value="0" style="width:100%;" disabled>
          </div>
          <div style="flex:1;">
            <label for="tamingManual">Taming Manual:</label>
            <input type="number" id="tamingManual" min="0" value="0" style="width:100%;" disabled>
          </div>
        </div>
        <div style="display: flex; gap: 1em;">
          <div style="flex:1;">
            <label for="energizingPotion">Energizing Potion:</label>
            <input type="number" id="energizingPotion" min="0" value="0" style="width:100%;" disabled>
          </div>
          <div style="flex:1;">
            <label for="strengtheningSerum">Strengthening Serum:</label>
            <input type="number" id="strengtheningSerum" min="0" value="0" style="width:100%;" disabled>
          </div>
        </div>
        <button type="submit" class="button-link">Calculate</button>
      </form>
      <div id="petResults" style="margin-top:2em;"></div>
      <div style="display:flex; gap:1em; margin-top:2.5em; justify-content:center;">
        <a class="card-panel" style="flex:1; text-align:center; font-size:1.1em; font-weight:600; text-decoration:none;" href="?calc=more">Back to More</a>
        <a class="card-panel" style="flex:1; text-align:center; font-size:1.1em; font-weight:600; text-decoration:none;" href="../index.html">Back to Home</a>
      </div>
    </section>
  `;

  let PETS_DATA = null;
  async function loadPetsData() {
    if (!PETS_DATA) {
      try {
        const resp = await fetch('../data/petUpgrades.tiered.json');
        if (!resp.ok) throw new Error('Fetch failed: ' + resp.status);
        PETS_DATA = await resp.json();
      } catch (err) {
        document.getElementById('petResults').innerHTML = `<p style='color:red;'>Failed to load pet data: ${err.message}</p>`;
        throw err;
      }
    }
    return PETS_DATA;
  }

  function getPetTier(petName, petsData) {
    return petsData.pets[petName]?.tier || null;
  }

  function getTierUpgrades(tier, petsData) {
    return petsData.tiers[tier]?.upgrades || [];
  }

  function populatePetSelect(petsData) {
    const select = document.getElementById('petSelect');
    select.innerHTML = '';
    Object.keys(petsData.pets).forEach(pet => {
      const petObj = petsData.pets[pet];
      const tier = petObj.tier;
      if ((tier && tier.length > 0) || petObj.customUpgrades) {
        const opt = document.createElement('option');
        opt.value = pet;
        opt.textContent = tier && tier.length > 0 ? `${pet} (${tier})` : pet;
        select.appendChild(opt);
      }
    });
  }

  function calculatePetUpgrade(pet, current, target, petsData) {
    const tier = getPetTier(pet, petsData);
    const upgrades = getTierUpgrades(tier, petsData);
    let total = {petFood:0, tamingManual:0, energizingPotion:0, strengtheningSerum:0, svsPoints:0};
    let details = [];
    for (let lvl = current; lvl < target; lvl++) {
      const u = upgrades[lvl];
      if (!u) break;
      total.petFood += u.petFood||0;
      total.tamingManual += u.tamingManual||0;
      total.energizingPotion += u.energizingPotion||0;
      total.strengtheningSerum += u.strengtheningSerum||0;
      const svsPoints = (u.score||0) * 50;
      total.svsPoints += svsPoints;
      details.push({level:lvl+1, ...u, svsPoints});
    }
    return {total, details};
  }

  function renderResults(pet, current, target, result) {
    let html = `<div class=\"card-panel result\">`;
    html += `<h2 style=\"margin-top:0;\">${pet} Upgrade: Lv${current} → Lv${target}</h2>`;
    html += `<table style=\"margin:1em auto;max-width:500px;text-align:center;\"><thead><tr><th>Level</th><th>Pet Food</th><th>Taming Manual</th><th>Energizing Potion</th><th>Strengthening Serum</th><th>SvS Points</th></tr></thead><tbody>`;
    result.details.forEach(row => {
      html += `<tr><td>${row.level}</td><td>${row.petFood||0}</td><td>${row.tamingManual||0}</td><td>${row.energizingPotion||0}</td><td>${row.strengtheningSerum||0}</td><td>${row.svsPoints||0}</td></tr>`;
    });
    html += `</tbody></table>`;
    html += `<h3 style=\"margin-bottom:0.5em;\">Total</h3><ul style=\"list-style:disc inside;text-align:left;max-width:400px;margin:0 auto;\">\n    <li>Pet Food: ${result.total.petFood}</li>\n    <li>Taming Manual: ${result.total.tamingManual}</li>\n    <li>Energizing Potion: ${result.total.energizingPotion}</li>\n    <li>Strengthening Serum: ${result.total.strengtheningSerum}</li>\n  </ul>`;
    html += `</div>`;
    html += `<div class=\"card-panel result\" style=\"margin-top:1.2em; color:var(--accent-strong); font-weight:600; text-align:center; font-size:1.2em; background:var(--panel);\">SvS Points: ${result.total.svsPoints}</div>`;
    document.getElementById('petResults').innerHTML = html;

    // Fill out the upgrade material fields in the form
    document.getElementById('petFood').value = result.total.petFood;
    document.getElementById('tamingManual').value = result.total.tamingManual;
    document.getElementById('energizingPotion').value = result.total.energizingPotion;
    document.getElementById('strengtheningSerum').value = result.total.strengtheningSerum;
  }

  const petsData = await loadPetsData();
  populatePetSelect(petsData);
  const form = document.getElementById('petCalcForm');
  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const pet = document.getElementById('petSelect').value;
    const current = parseInt(document.getElementById('currentLevel').value, 10);
    const target = parseInt(document.getElementById('targetLevel').value, 10);
    if (!pet || isNaN(current) || isNaN(target) || current < 1 || target <= current) {
      document.getElementById('petResults').innerHTML = '<p style="color:red;">Please select a pet and valid level range.</p>';
      return;
    }
    const result = calculatePetUpgrade(pet, current, target, petsData);
    renderResults(pet, current, target, result);
  });
}

// --- CHARMS CALCULATOR LOGIC (placeholder) ---
async function initCharmsCalculator() {
  // ...future charms calculator logic...
  document.body.innerHTML = '<div class="container"><h2>Charms Calculator Coming Soon</h2></div>';
}

// --- GEAR CALCULATOR LOGIC (placeholder) ---
async function initGearCalculator() {
  // ...future gear calculator logic...
  document.body.innerHTML = '<div class="container"><h2>Gear Calculator Coming Soon</h2></div>';
}
}); // <-- Close DOMContentLoaded async function and event listener
