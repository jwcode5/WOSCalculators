const fs = require('fs');

let router = fs.readFileSync('ui/router.js', 'utf8');
router = router.replace(
  /localStorage\.setItem\('activeRoute', route\);/,
  `localStorage.setItem('activeRoute', route);\n  if (window.setActiveCalculator) window.setActiveCalculator(route);\n  else window.activeCalculator = route;`
);
fs.writeFileSync('ui/router.js', router, 'utf8');
console.log("Patched router.js to update activeCalculator");

let scriptJs = fs.readFileSync('script.js', 'utf8');
const newSwitchAccount = `function switchAccount(id) {
  if (id === activeAccountId) return; // Already on this account, nothing to do
  // Save the current calculator state for the active account before switching
  if (activeCalculator === CALCULATOR_KEYS.UPGRADE) {
    if (typeof captureCurrentStateToAccount === 'function') captureCurrentStateToAccount();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_GEAR) {
    if (typeof saveChiefGearState === 'function') saveChiefGearState();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_CHARM) {
    if (typeof saveChiefCharmState === "function") saveChiefCharmState();
  } else if (activeCalculator === CALCULATOR_KEYS.PETS) {
    if (typeof savePetsState === "function") savePetsState();
  } else if (activeCalculator === CALCULATOR_KEYS.EXPERTS || activeCalculator === CALCULATOR_KEYS.EXPERT_SKILLS) {
    if (typeof saveExpertsState === "function") saveExpertsState();
  }

  activeAccountId = id;
  localStorage.setItem("wosCalc_activeAccountId", id);

  // Instead of trying to parse out which UI modules to call, reload the page
  // so the entire SPA rehydrates correctly for the new account.
  window.location.reload();
}`;

// Replace the old switchAccount function
scriptJs = scriptJs.replace(/function switchAccount\(id\) \{[\s\S]*?renderComingSoonPanel\(activeCalculator\);\s*\}/, newSwitchAccount);

fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log("Patched script.js switchAccount to use reload");
