const fs = require('fs');
const path = require('path');

// We have the raw TRANSLATIONS object from i18n.js
// But it's an ES module now. Let's just read it manually or parse it.
const i18nContent = fs.readFileSync(path.join(__dirname, 'src/data/i18n.js'), 'utf8');

// Quick and dirty parser since we know the structure
let enDict = null;
try {
  const cleanContent = i18nContent.substring(0, i18nContent.indexOf('// Theme Settings Logic') !== -1 ? i18nContent.indexOf('// Theme Settings Logic') : i18nContent.indexOf('function t(')).replace('export { TRANSLATIONS };', '').replace('const TRANSLATIONS', 'let TRANSLATIONS');
  let TRANSLATIONS = eval(cleanContent + '\nTRANSLATIONS;');
  enDict = TRANSLATIONS.en;
} catch (e) {
  console.error("Failed to parse", e);
  process.exit(1);
}

// Flatten the dictionary to a map of Text -> Key
const textToKey = new Map();
function flatten(obj, prefix = '') {
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string') {
      textToKey.set(v.trim(), `${prefix}${k}`);
    } else if (typeof v === 'object') {
      flatten(v, `${prefix}${k}.`);
    }
  }
}
flatten(enDict);

// Add some exact matches we want to catch if they are slightly off
textToKey.set('Target Building (React Demo)', 'sections.targetBuilding');
textToKey.set('Add Building', 'buttons.addBuilding');
textToKey.set('Chief Gear', 'calculator.chiefGear');

const componentsDir = path.join(__dirname, 'src/components');
const files = ['Buildings.jsx'];

for (const file of files) {
  const filePath = path.join(componentsDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Add import if not present
  if (!content.includes("useLanguage")) {
    content = content.replace(
      "import React", 
      "import { useLanguage } from '../context/LanguageContext';\nimport React"
    );
    // Try to inject const { t } = useLanguage();
    content = content.replace(
      /(const \w+ = \([^)]*\) => {\n)/,
      "$1  const { t } = useLanguage();\n"
    );
    modified = true;
  }

  // Replace text in >Text<
  content = content.replace(/>([^<{}]+)</g, (match, p1) => {
    const text = p1.trim();
    if (!text) return match;
    
    // Exact match
    let key = textToKey.get(text);
    
    // Case insensitive match
    if (!key) {
      for (const [k, v] of textToKey.entries()) {
        if (k.toLowerCase() === text.toLowerCase()) {
          key = v;
          break;
        }
      }
    }
    
    if (key) {
      modified = true;
      const leadingSpace = p1.startsWith(' ') ? ' ' : '';
      const trailingSpace = p1.endsWith(' ') ? ' ' : '';
      return `>${leadingSpace}{t('${key}', {}, '${text}')}${trailingSpace}<`;
    }
    
    return match;
  });
  
  // Replace placeholders: placeholder="0" -> placeholder={t('...', {}, '0')} - wait, placeholders are usually static numbers or already translated

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
}
