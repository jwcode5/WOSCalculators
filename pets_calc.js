// Pets Upgrade Calculator Logic
let PETS_DATA = null;

async function loadPetsData() {
  if (!PETS_DATA) {
    const resp = await fetch('../WOSCalculators/data/petUpgrades.tiered.json');
    PETS_DATA = await resp.json();
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
    const tier = petsData.pets[pet].tier;
    if (tier) {
      const opt = document.createElement('option');
      opt.value = pet;
      opt.textContent = `${pet} (${tier})`;
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
    total.svsPoints += u.svsPoints||0;
    details.push({level:lvl+1, ...u});
  }
  return {total, details};
}

function renderResults(pet, current, target, result) {
  let html = `<h2>${pet} Upgrade: Lv${current} → Lv${target}</h2>`;
  html += `<table style="margin:1em auto;max-width:500px;text-align:center;"><thead><tr><th>Level</th><th>Pet Food</th><th>Taming Manual</th><th>Energizing Potion</th><th>Strengthening Serum</th><th>SvS Points</th></tr></thead><tbody>`;
  result.details.forEach(row => {
    html += `<tr><td>${row.level}</td><td>${row.petFood||0}</td><td>${row.tamingManual||0}</td><td>${row.energizingPotion||0}</td><td>${row.strengtheningSerum||0}</td><td>${row.svsPoints||0}</td></tr>`;
  });
  html += `</tbody></table>`;
  html += `<h3>Total</h3><ul style="list-style:disc inside;text-align:left;max-width:400px;margin:0 auto;">
    <li>Pet Food: ${result.total.petFood}</li>
    <li>Taming Manual: ${result.total.tamingManual}</li>
    <li>Energizing Potion: ${result.total.energizingPotion}</li>
    <li>Strengthening Serum: ${result.total.strengtheningSerum}</li>
    <li>SvS Points: ${result.total.svsPoints}</li>
  </ul>`;
  document.getElementById('petResults').innerHTML = html;
}

async function initPetCalc() {
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

document.addEventListener('DOMContentLoaded', initPetCalc);
