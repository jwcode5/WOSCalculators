const fs = require('fs');
let scriptJs = fs.readFileSync('script.js', 'utf8');

// Patch Chief Gear Optimized Plan
scriptJs = scriptJs.replace(
  /const tgtIdx = levelKeyToIndex\[targetLevels\[slot\] \|\| "none"\] \|\| -1;\s*if \(curIdx < tgtIdx && curIdx < CHIEF_GEAR_DATA\.levelOrder\.length - 1\)/g,
  `// const tgtIdx = levelKeyToIndex[targetLevels[slot] || "none"] || -1;
        if (curIdx < CHIEF_GEAR_DATA.levelOrder.length - 1)`
);

// Patch Chief Charm Optimized Plan
scriptJs = scriptJs.replace(
  /const tgtIdx = levelKeyToIndex\[targetLevels\[slot\.slotKey\] \|\| "none"\] \|\| -1;\s*if \(curIdx < tgtIdx && curIdx < CHIEF_CHARM_DATA\.levelOrder\.length - 1\)/g,
  `// const tgtIdx = levelKeyToIndex[targetLevels[slot.slotKey] || "none"] || -1;
        if (curIdx < CHIEF_CHARM_DATA.levelOrder.length - 1)`
);

fs.writeFileSync('script.js', scriptJs, 'utf8');

// Cache bust to 41
let indexHtml = fs.readFileSync('index.html', 'utf8');
indexHtml = indexHtml.replace(/\?v=40/g, '?v=41');
fs.writeFileSync('index.html', indexHtml, 'utf8');

let routerJs = fs.readFileSync('ui/router.js', 'utf8');
routerJs = routerJs.replace(/\?v=40/g, '?v=41');
fs.writeFileSync('ui/router.js', routerJs, 'utf8');

console.log("Patched optimization logic to ignore target levels for Gear and Charm");
