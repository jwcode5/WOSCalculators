const fs = require('fs');

// Patch router.js to expose navigateTo
let routerJs = fs.readFileSync('ui/router.js', 'utf8');
if (!routerJs.includes('window.navigateToRoute = navigateTo;')) {
  routerJs = routerJs.replace(
    'async function navigateTo(route) {',
    'window.navigateToRoute = navigateTo;\nasync function navigateTo(route) {'
  );
  // Also bump the cache buster
  routerJs = routerJs.replace(/\?v=36/g, '?v=37');
  fs.writeFileSync('ui/router.js', routerJs, 'utf8');
}

// Patch script.js to use navigateTo
let scriptJs = fs.readFileSync('script.js', 'utf8');
scriptJs = scriptJs.replace(
  /if \(window\.forceFirebaseSync\) \{[\s\S]*?window\.location\.reload\(\);\s*\}\s*\}/,
  `if (window.navigateToRoute) {
    window.navigateToRoute(window.activeCalculator).then(() => {
      if (typeof loadAllStateFromAccount === 'function') {
        loadAllStateFromAccount();
      }
    });
  } else {
    window.location.reload();
  }
}`
);
fs.writeFileSync('script.js', scriptJs, 'utf8');

// Patch index.html cache buster
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=36/g, '?v=37');
fs.writeFileSync('index.html', indexHtml, 'utf8');

console.log("Patched to use soft-navigation for switchAccount!");
