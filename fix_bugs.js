const fs = require('fs');

// Patch router.js
let router = fs.readFileSync('ui/router.js', 'utf8');

router = router.replace(
  /document\.addEventListener\('DOMContentLoaded', \(\) => \{\s*navigateTo\('upgrade'\);\s*\}\);/,
  `document.addEventListener('DOMContentLoaded', () => {\n  const savedRoute = localStorage.getItem('activeRoute') || 'upgrade';\n  navigateTo(savedRoute);\n});`
);

router = router.replace(
  /if \(pages\[route\]\) \{/,
  `localStorage.setItem('activeRoute', route);\n  if (pages[route]) {`
);

fs.writeFileSync('ui/router.js', router, 'utf8');
console.log("Patched router.js");

// Patch script.js for the initSvSPanel
const overrides = `
// ==========================================
// FIX SVS VALERIA REVERT ON TAB LOAD
// ==========================================
const originalInitSvSPanel = window.initSvSPanel || initSvSPanel;
window.initSvSPanel = function() {
  originalInitSvSPanel();
  
  // Sync on tab load
  const glob = document.getElementById("globalValeriaSkill");
  const svsVal = document.getElementById("svsValeriaSkill");
  if (glob && svsVal) {
      if (parseInt(svsVal.value) === 0 && parseInt(glob.value) > 0) {
          svsVal.value = glob.value;
      } else if (parseInt(svsVal.value) < parseInt(glob.value)) {
          svsVal.value = glob.value;
      }
      if (typeof calculateSvSPoints === 'function') calculateSvSPoints();
  }
};
initSvSPanel = window.initSvSPanel;
`;

let scriptCode = fs.readFileSync('script.js', 'utf8');
scriptCode += '\n' + overrides;
fs.writeFileSync('script.js', scriptCode, 'utf8');
console.log("Patched script.js");
