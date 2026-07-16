const fs = require('fs');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');

routerJs = routerJs.replace(
  /document\.addEventListener\('DOMContentLoaded', \(\) => \{[\s\S]*?navigateTo\(savedRoute\);\s*\}\);/,
  `document.addEventListener('DOMContentLoaded', () => {
  const savedRoute = localStorage.getItem('activeRoute') || 'upgrade';
  if (window.appInitialized) {
    navigateTo(savedRoute);
  } else {
    document.addEventListener('appDataLoaded', () => {
      navigateTo(savedRoute);
    });
  }
});`
);

fs.writeFileSync('ui/router.js', routerJs, 'utf8');
console.log("Patched ui/router.js with robust regex");
