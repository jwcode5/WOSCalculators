const fs = require('fs');

let scriptCode = fs.readFileSync('script.js', 'utf8');

// 1. Change calculateSvSPoints to use svsValeriaSkill
scriptCode = scriptCode.replace(/const valeriaLevel = getVal\("globalValeriaSkill"\);/g, 'const valeriaLevel = getVal("svsValeriaSkill");');

// 2. Add an event listener sync
const syncCode = `
// Sync global Valeria skill to SvS what-if on change
document.getElementById("globalValeriaSkill")?.addEventListener("input", (e) => {
    const svsVal = document.getElementById("svsValeriaSkill");
    if (svsVal) {
        svsVal.value = e.target.value;
        if (typeof calculateSvSPoints === 'function') calculateSvSPoints();
    }
});
// Initial sync on load
document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
        const glob = document.getElementById("globalValeriaSkill");
        const svsVal = document.getElementById("svsValeriaSkill");
        if (glob && svsVal && parseInt(svsVal.value) < parseInt(glob.value)) {
            svsVal.value = glob.value;
        }
    }, 500);
});
`;

scriptCode += '\n' + syncCode;

fs.writeFileSync('script.js', scriptCode, 'utf8');
console.log("Updated script.js with SvS Valeria what-if logic.");
