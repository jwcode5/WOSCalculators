const fs = require('fs');

let scriptJs = fs.readFileSync('script.js', 'utf8');

// The original code has:
//     // Load all state from the active account
//     loadAllStateFromAccount();
//
//     applyTheme(loadThemePreference());
//   } catch (error) {

scriptJs = scriptJs.replace(
  'loadAllStateFromAccount();\n\n    applyTheme(loadThemePreference());',
  `loadAllStateFromAccount();\n\n    applyTheme(loadThemePreference());\n\n    window.appInitialized = true;\n    document.dispatchEvent(new Event('appDataLoaded'));`
);

fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log("Patched script.js to dispatch appDataLoaded");
