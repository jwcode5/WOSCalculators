const fs = require('fs');

let indexHtml = fs.readFileSync('index.html', 'utf8');

// Add cache buster to auth.js and bump everything else to 36
indexHtml = indexHtml.replace('src="auth.js"', 'src="auth.js?v=36"');
indexHtml = indexHtml.replace(/\?v=35/g, '?v=36');

fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=35/g, '?v=36');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');

console.log('Bumped cache versions to 36 and added to auth.js');
