const fs = require('fs');

let scriptJs = fs.readFileSync('script.js', 'utf8');

const targetStr = `  accountSelect.addEventListener("change", function() {
    switchAccount(this.value);
  });`;

const replaceStr = `  accountSelect.addEventListener("change", function() {
    switchAccount(this.value);
    
    // Auto-close the mobile menu so the user instantly sees the UI update
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('expanded');
  });`;

scriptJs = scriptJs.replace(targetStr, replaceStr);

fs.writeFileSync('script.js', scriptJs, 'utf8');

console.log("Patched accountSelect event listener to close the sidebar");
