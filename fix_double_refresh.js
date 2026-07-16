const fs = require('fs');

// Patch auth.js
let authJs = fs.readFileSync('auth.js', 'utf8');
const syncFunction = `window.forceFirebaseSync = async function() {
  if (window.fbSaveTimeout) clearTimeout(window.fbSaveTimeout);
  const user = auth.currentUser;
  if (!user) return;
  try {
    await updateDoc(doc(db, 'users', user.uid), {
      accounts: localStorage.getItem('wosCalc_accounts'),
      activeAccountId: localStorage.getItem('wosCalc_activeAccountId'),
      lastUpdated: new Date().toISOString()
    });
  } catch(e) {
    console.warn('Failed to force sync to Firebase:', e);
  }
};`;

authJs = authJs + '\n\n' + syncFunction;
fs.writeFileSync('auth.js', authJs, 'utf8');
console.log('Patched auth.js with forceFirebaseSync');

// Patch script.js
let scriptJs = fs.readFileSync('script.js', 'utf8');
scriptJs = scriptJs.replace(
  'window.location.reload();\n}',
  `if (window.forceFirebaseSync) {
    window.forceFirebaseSync().then(() => window.location.reload());
  } else {
    window.location.reload();
  }
}`
);
fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log('Patched script.js to wait for forceFirebaseSync before reloading');

// Cache bust again!
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=34/g, '?v=35');
fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=34/g, '?v=35');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');
