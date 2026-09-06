const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/components');

function patch(file, replacements) {
  const fp = path.join(componentsDir, file);
  if (!fs.existsSync(fp)) return;
  let c = fs.readFileSync(fp, 'utf8');
  let start = c;
  for (const [from, to] of replacements) {
    c = c.split(from).join(to);
  }
  if (c !== start) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log(`Patched ${file}`);
  }
}

// 1. AuthModal
patch('AuthModal.jsx', [
  ['placeholder="Email"', 'placeholder={t("auth.email", {}, "Email")}'],
  ['placeholder="Password"', 'placeholder={t("auth.password", {}, "Password")}'],
  ['Logged in as:', '{t("auth.loggedInAs", {}, "Logged in as:")}'],
  ['>Logout<', '>{t("auth.logout", {}, "Logout")}<'],
  ['>Login<', '>{t("auth.login", {}, "Login")}<'],
  ['>Register<', '>{t("auth.register", {}, "Register")}<'],
  ['>OR<', '>{t("auth.or", {}, "OR")}<'],
  ['Missing data? Click below to allow your live app to re-sync its data upwards.', '{t("auth.syncPrompt", {}, "Missing data? Click below to allow your live app to re-sync its data upwards.")}']
]);

// 2. ChiefGear & ChiefCharm
patch('ChiefGear.jsx', [
  // Pieces
  ['{piece.label}', '{t(`labels.${piece.id}`, {}, piece.label)}'],
  // Dropdowns
  ['{gearData.levels[l]?.label || l}', '{t(`gear.${l}`, {}, gearData.levels[l]?.label || l)}'],
  // Totals card missing tags
  ['Hardened Alloy:', '{t("labels.hardenedAlloy", {}, "Hardened Alloy")}:'],
  ['Polishing Solution:', '{t("labels.polishingSolution", {}, "Polishing Solution")}:'],
  ['Design Plans:', '{t("labels.designPlans", {}, "Design Plans")}:'],
  ['Lunar Amber:', '{t("labels.lunarAmber", {}, "Lunar Amber")}:']
]);

patch('ChiefCharm.jsx', [
  ['{piece.label}', '{t(`labels.${piece.id}`, {}, piece.label)}'],
  ['{charmData.levels[l]?.label || l}', '{t(`charm.${l}`, {}, charmData.levels[l]?.label || l)}'],
  ['Charm Designs:', '{t("labels.charmDesigns", {}, "Charm Designs")}:'],
  ['Charm Guides:', '{t("labels.charmGuides", {}, "Charm Guides")}:'],
  ['Jewel Secrets:', '{t("labels.jewelSecrets", {}, "Jewel Secrets")}:']
]);

// 3. Pets
patch('Pets.jsx', [
  // PET_ORDER rendering
  ['{pet}', '{t(`pets.${pet.replace(/\\s+/g, "")}`, {}, pet)}'],
  ['{levels.map(l => <option key={l} value={l}>{l}</option>)}', '{levels.map(l => <option key={l} value={l}>{t(`petLevels.${l}`, {}, l)}</option>)}'],
  // Resources
  ['Pet Food:', '{t("labels.petFood", {}, "Pet Food")}:'],
  ['Taming Manual:', '{t("labels.tamingManual", {}, "Taming Manual")}:'],
  ['Energizing Potion:', '{t("labels.energizingPotion", {}, "Energizing Potion")}:'],
  ['Strengthening Serum:', '{t("labels.strengtheningSerum", {}, "Strengthening Serum")}:'],
  ['Advancement Sigils:', '{t("labels.advancementSigils", {}, "Advancement Sigils")}:']
]);

// 4. Experts
patch('Experts.jsx', [
  ['{expert}', '{t(`experts.${expert.replace(/\\s+/g, "")}`, {}, expert)}'],
  ['{levels.map(l => <option key={l} value={l}>{l}</option>)}', '{levels.map(l => <option key={l} value={l}>{t(`expertLevels.${l}`, {}, l)}</option>)}'],
  // Results Resources
  ['Skill Exp:', '{t("labels.skillExp", {}, "Skill Exp")}:'],
  ['Skill Books:', '{t("labels.skillBooks", {}, "Skill Books")}:'],
  ['General Advancement Sigils:', '{t("labels.generalAdvancementSigils", {}, "General Advancement Sigils")}:'],
  ['Compass:', '{t("labels.compass", {}, "Compass")}:'],
  ['Fiery Heart:', '{t("labels.fieryHeart", {}, "Fiery Heart")}:'],
  ['Sail of Conquest:', '{t("labels.sailOfConquest", {}, "Sail of Conquest")}:'],
  ['>Level<', '>{t("labels.level", {}, "Level")}<'],
  ['>Affinity<', '>{t("labels.affinity", {}, "Affinity")}<']
]);

// 5. SvS
patch('SvS.jsx', [
  ['{DAYS.map(day => (', '{DAYS.map(day => (\n          <div key={day.id} className="card-panel" style={{ marginTop: "16px" }}>\n            <h3 style={{ marginBottom: "12px", borderBottom: "1px solid var(--glass-border)", paddingBottom: "8px" }}>{t(`svs.${day.id}`, {}, day.label)}</h3>'],
  ['<h3 style={{ marginBottom: \'12px\', borderBottom: \'1px solid var(--glass-border)\', paddingBottom: \'8px\' }}>{day.label}</h3>', ''],
  ['{day.keys.map(k => {', '{day.keys.map(k => { const label = SVS_MAPPINGS[k].label;'],
  ['<div>{SVS_MAPPINGS[k].label}</div>', '<div>{t(`svs.${k}`, {}, label)}</div>'],
  ['<div>{svsState[k] || 0}</div>', '<div>{(svsState[k] || 0).toLocaleString()}</div>'], // also add comma formatting to result box
  ['<label style={{ display: \'block\', marginBottom: \'8px\', fontSize: \'0.9em\' }}>{SVS_MAPPINGS[k].label}</label>', '<label style={{ display: "block", marginBottom: "8px", fontSize: "0.9em" }}>{t(`svs.${k}`, {}, label)}</label>']
]);

// 6. Buildings missing resources from first pass
patch('Buildings.jsx', [
  ['>Meat<', '>{t("labels.meat", {}, "Meat")}<'],
  ['>Wood<', '>{t("labels.wood", {}, "Wood")}<'],
  ['>Coal<', '>{t("labels.coal", {}, "Coal")}<'],
  ['>Iron<', '>{t("labels.iron", {}, "Iron")}<'],
  ['Unsecured Chests', '{t("labels.unsecuredChests", {}, "Unsecured Chests")}'],
  ['Secured Chests', '{t("labels.securedChests", {}, "Secured Chests")}']
]);

console.log("Done patching components.");
