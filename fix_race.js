const fs = require('fs');

// Patch script.js to emit appDataLoaded
let scriptJs = fs.readFileSync('script.js', 'utf8');
scriptJs = scriptJs.replace(
  /function initApp\(\) \{[\s\S]*?loadActiveAccount\(\);/,
  `function initApp() {
  window.appInitialized = true;
  document.dispatchEvent(new Event('appDataLoaded'));
  loadActiveAccount();`
);
fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log("Patched script.js to dispatch appDataLoaded");

// Patch ui/router.js to wait for appDataLoaded
let router = fs.readFileSync('ui/router.js', 'utf8');
const oldDOMContent = `document.addEventListener('DOMContentLoaded', () => {
  const savedRoute = localStorage.getItem('activeRoute') || 'upgrade';
  navigateTo(savedRoute);
});`;
const newDOMContent = `document.addEventListener('DOMContentLoaded', () => {
  const savedRoute = localStorage.getItem('activeRoute') || 'upgrade';
  if (window.appInitialized) {
    navigateTo(savedRoute);
  } else {
    document.addEventListener('appDataLoaded', () => {
      navigateTo(savedRoute);
    });
  }
});`;
router = router.replace(oldDOMContent, newDOMContent);
fs.writeFileSync('ui/router.js', router, 'utf8');
console.log("Patched ui/router.js to wait for appDataLoaded");
