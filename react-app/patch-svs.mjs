import fs from 'fs';
import path from 'path';

// Fix SvS.jsx
let svs = fs.readFileSync('src/components/SvS.jsx', 'utf8');
svs = svs.replace(/label:\s*'([^']+)'/g, (match, text) => {
  // convert text to a valid key, e.g. "Refined Fire Crystals" -> "refinedFireCrystals"
  let key = text.replace(/[^a-zA-Z0-9 ]/g, '').split(' ').map((w,i) => i===0 ? w.toLowerCase() : w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join('');
  return `label: t("svsFields.${key}", {}, "${text}")`;
});
fs.writeFileSync('src/components/SvS.jsx', svs, 'utf8');

console.log("Patched SvS.jsx fields dynamically!");
