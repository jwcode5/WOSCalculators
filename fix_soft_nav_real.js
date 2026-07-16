const fs = require('fs');

let scriptJs = fs.readFileSync('script.js', 'utf8');

// Replace the line `window.location.reload();` inside `switchAccount`
scriptJs = scriptJs.replace(
  /window\.location\.reload\(\);/,
  `if (window.navigateToRoute) {
    window.navigateToRoute(window.activeCalculator).then(() => {
      if (typeof loadAllStateFromAccount === 'function') {
        loadAllStateFromAccount();
      }
    });
  } else {
    window.location.reload();
  }`
);

fs.writeFileSync('script.js', scriptJs, 'utf8');

// Cache bust index.html and router.js to v=38
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=37/g, '?v=38');
fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=37/g, '?v=38');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');

console.log("Properly patched script.js this time");
