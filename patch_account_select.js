const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

scriptJs = scriptJs.replace(
  /accountSelect\.addEventListener\("change", function\(\) \{[\s\S]*?switchAccount\(this\.value\);\s*\}\);/,
  `accountSelect.addEventListener("change", function() {
    switchAccount(this.value);
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.remove('expanded');
  });`
);

fs.writeFileSync('script.js', scriptJs, 'utf8');

let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=39/g, '?v=40');
fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=39/g, '?v=40');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');

console.log("Patched accountSelect event listener properly");
