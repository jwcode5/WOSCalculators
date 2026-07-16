const fs = require('fs');

let authJs = fs.readFileSync('auth.js', 'utf8');

// Replace the infinite loop reload logic
authJs = authJs.replace(
  /window\.location\.reload\(\);/g,
  `if (!sessionStorage.getItem('wosCalc_justSynced')) {
          sessionStorage.setItem('wosCalc_justSynced', 'true');
          window.location.reload();
        } else {
          sessionStorage.removeItem('wosCalc_justSynced');
        }`
);

fs.writeFileSync('auth.js', authJs, 'utf8');
console.log("Fixed infinite refresh loop in auth.js");
