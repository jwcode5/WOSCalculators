const fs = require('fs');

let scriptJs = fs.readFileSync('script.js', 'utf8');

scriptJs = scriptJs.replace(
  /loadAllStateFromAccount\(\);[\s\S]*?applyTheme\(loadThemePreference\(\)\);/,
  `loadAllStateFromAccount();\n\n    applyTheme(loadThemePreference());\n\n    window.appInitialized = true;\n    document.dispatchEvent(new Event('appDataLoaded'));`
);

fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log("Patched script.js with robust regex");
