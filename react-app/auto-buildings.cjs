const fs = require('fs');

const files = ['Buildings.jsx'];

const enDict = JSON.parse(fs.readFileSync('temp_en.json', 'utf8'));

// Flatten the dictionary to find full keys
const flatDict = {};
function flatten(obj, prefix = '') {
  for (let k in obj) {
    if (typeof obj[k] === 'object') {
      flatten(obj[k], prefix + k + '.');
    } else {
      flatDict[prefix + k] = obj[k];
    }
  }
}
flatten(enDict);

// Build inverse map
const inverseDict = {};
for (let key in flatDict) {
  const text = flatDict[key];
  if (!inverseDict[text]) {
    inverseDict[text] = key;
  }
}

for (const file of files) {
  const fp = `src/components/${file}`;
  let content = fs.readFileSync(fp, 'utf8');
  let original = content;

  // Regex to find exact >Text< 
  const regex = />([^<>{}\n]+)</g;
  let match;
  let replacements = [];

  while ((match = regex.exec(original)) !== null) {
    const rawText = match[1];
    const trimmed = rawText.trim();
    if (!trimmed || trimmed.match(/^[0-9]+$/)) continue;

    // Is this trimmed text in our inverse dictionary?
    const key = inverseDict[trimmed];
    if (key) {
      const replaced = rawText.replace(trimmed, `{t('${key}', {}, '${trimmed.replace(/'/g, "\\'")}')}`);
      replacements.push({
        start: match.index + 1,
        end: match.index + 1 + rawText.length,
        text: replaced
      });
    }
  }

  // Apply backwards
  for (let i = replacements.length - 1; i >= 0; i--) {
    const r = replacements[i];
    content = content.slice(0, r.start) + r.text + content.slice(r.end);
  }

  // Also replace some common ones like placeholder=""
  const pRegex = /placeholder="([^"]+)"/g;
  let pMatch;
  let pReplacements = [];
  while ((pMatch = pRegex.exec(original)) !== null) {
    const val = pMatch[1];
    if (inverseDict[val]) {
      pReplacements.push({
        start: pMatch.index,
        end: pMatch.index + pMatch[0].length,
        text: `placeholder={t('${inverseDict[val]}', {}, '${val.replace(/'/g, "\\'")}')}`
      });
    }
  }
  for (let i = pReplacements.length - 1; i >= 0; i--) {
    const r = pReplacements[i];
    content = content.slice(0, r.start) + r.text + content.slice(r.end);
  }

  fs.writeFileSync(fp, content, 'utf8');
  console.log(`Translated ${file}`);
}
