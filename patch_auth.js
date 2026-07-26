const fs = require('fs');

let authJs = fs.readFileSync('auth.js', 'utf8');

// Replace syncDataToFirebase
authJs = authJs.replace(
  /const data = docSnap\.data\(\);\s*if \(data\.accounts\) \{\s*localStorage\.setItem\('wosCalc_accounts', data\.accounts\);[\s\S]*?\}\s*\}\s*\} else if/m,
  `const data = docSnap.data();
      const fbLastUpdated = data.lastUpdated;
      const localLastUpdated = localStorage.getItem('wosCalc_lastLocalUpdate');
      const shouldPull = !localLastUpdated || !fbLastUpdated || new Date(fbLastUpdated) > new Date(localLastUpdated);

      if (shouldPull && data.accounts) {
        localStorage.setItem('wosCalc_accounts', data.accounts);
        if (data.activeAccountId) localStorage.setItem('wosCalc_activeAccountId', data.activeAccountId);
        
        if (fbLastUpdated) {
          originalSetItem.call(localStorage, 'wosCalc_lastLocalUpdate', fbLastUpdated);
        }
        
        if (typeof window.loadAccounts === 'function') {
          window.loadAccounts();
          if (typeof window.loadAllStateFromAccount === 'function') window.loadAllStateFromAccount();
        }
        if (!sessionStorage.getItem('wosCalc_justSynced')) {
          sessionStorage.setItem('wosCalc_justSynced', 'true');
          window.location.reload();
        } else {
          sessionStorage.removeItem('wosCalc_justSynced');
        }
      } else if (!shouldPull) {
        if (window.forceFirebaseSync) window.forceFirebaseSync();
      }
    } else if`
);

// Replace interceptor
authJs = authJs.replace(
  /if \(key === 'wosCalc_accounts' \|\| key === 'wosCalc_activeAccountId'\) \{\s*const user = auth\.currentUser;\s*if \(user\) \{\s*\/\/ Debounce saving to Firestore[\s\S]*?lastUpdated: new Date\(\)\.toISOString\(\)\s*\}\);\s*\} catch\(e\) \{\s*console\.warn\('Failed to sync to Firebase:', e\);\s*\}\s*\}, 2000\);\s*\}\s*\}/m,
  `if (key === 'wosCalc_accounts' || key === 'wosCalc_activeAccountId') {
    const nowISO = new Date().toISOString();
    originalSetItem.call(this, 'wosCalc_lastLocalUpdate', nowISO);
    
    const user = auth.currentUser;
    if (user) {
      clearTimeout(window.fbSaveTimeout);
      window.fbSaveTimeout = setTimeout(async () => {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            accounts: localStorage.getItem('wosCalc_accounts'),
            activeAccountId: localStorage.getItem('wosCalc_activeAccountId'),
            lastUpdated: nowISO
          });
        } catch(e) {
          console.warn('Failed to sync to Firebase:', e);
        }
      }, 2000);
    }
  }`
);

fs.writeFileSync('auth.js', authJs, 'utf8');

// Update versions in index.html to cache bust iPad
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/script\.js\?v=41/g, 'script.js?v=42');
indexHtml = indexHtml.replace(/auth\.js\?v=41/g, 'auth.js?v=42');
indexHtml = indexHtml.replace(/router\.js\?v=41/g, 'router.js?v=42');
fs.writeFileSync('index.html', indexHtml, 'utf8');

console.log("Patched auth.js and index.html");
