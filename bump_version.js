const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=33/g, '?v=34');
fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=33/g, '?v=34');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');

console.log("Bumped version to 34 for cache busting");
