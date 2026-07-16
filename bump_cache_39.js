const fs = require('fs');
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=38/g, '?v=39');
fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=38/g, '?v=39');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');

console.log('Bumped cache versions to 39');
