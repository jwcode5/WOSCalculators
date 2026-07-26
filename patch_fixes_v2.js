const fs = require('fs');

// --- AUTH.JS PATCHES ---
let authJs = fs.readFileSync('auth.js', 'utf8');

// 1. Fix syncDataToFirebase to use originalSetItem
authJs = authJs.replace(
  /localStorage\.setItem\('wosCalc_accounts', data\.accounts\);/g,
  `originalSetItem.call(localStorage, 'wosCalc_accounts', data.accounts);`
);

authJs = authJs.replace(
  /localStorage\.setItem\('wosCalc_activeAccountId', data\.activeAccountId\);/g,
  `originalSetItem.call(localStorage, 'wosCalc_activeAccountId', data.activeAccountId);`
);

// 2. Add beforeunload to save pending changes
if (!authJs.includes('beforeunload')) {
  authJs += '\nwindow.addEventListener(\'beforeunload\', () => { if (window.fbSaveTimeout && window.forceFirebaseSync) { window.forceFirebaseSync(); } });\n';
}

fs.writeFileSync('auth.js', authJs, 'utf8');
console.log('Patched auth.js');


// --- SCRIPT.JS PATCHES ---
let scriptJs = fs.readFileSync('script.js', 'utf8');

// 1. Force sync before switching accounts
if (!scriptJs.includes('if (window.forceFirebaseSync) {\\n    window.forceFirebaseSync();\\n  }\\n\\n  if (window.navigateToRoute)')) {
    scriptJs = scriptJs.replace(
      /activeAccountId = id;\s*localStorage\.setItem\("wosCalc_activeAccountId", id\);\s*if \(window\.navigateToRoute\) \{/g,
      `activeAccountId = id;
  localStorage.setItem("wosCalc_activeAccountId", id);

  if (window.forceFirebaseSync) {
    window.forceFirebaseSync();
  }

  if (window.navigateToRoute) {`
    );
}

// 2. Remove redundant synthetic input event that was causing double-saves
scriptJs = scriptJs.replace(
  /const panel = document\.querySelector\("#app-content > section, #app-content > div"\);\s*if \(panel\) \{\s*panel\.dispatchEvent\(new Event\("input", \{ bubbles: true \}\)\);\s*\}/g,
  ''
);

fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log('Patched script.js');


// --- CACHE BUST ---
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/script\.js\?v=\d+/g, 'script.js?v=43');
indexHtml = indexHtml.replace(/auth\.js\?v=\d+/g, 'auth.js?v=43');
fs.writeFileSync('index.html', indexHtml, 'utf8');
console.log('Busted cache in index.html');
