const fs = require('fs');
const path = require('path');

const expertsCsv = fs.readFileSync('WOS Calculator - Experts.csv', 'utf8');
const skillsCsv = fs.readFileSync('WOS Calculator - Expert Skills.csv', 'utf8');

const output = {};

function parseCsv(text) {
  const lines = text.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim().replace(/\r$/, ''));
  const data = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Simple CSV parser supporting unquoted strings
    const parts = line.split(',');
    const obj = {};
    headers.forEach((h, idx) => {
      obj[h] = parts[idx] ? parts[idx].trim().replace(/\r$/, '') : '';
    });
    data.push(obj);
  }
  return data;
}

const expertsData = parseCsv(expertsCsv);
const skillsData = parseCsv(skillsCsv);

// Process experts
expertsData.forEach(row => {
  const expertName = row['Expert'];
  if (!expertName) return;

  if (!output[expertName]) {
    output[expertName] = { levels: [], skills: {} };
  }

  output[expertName].levels.push({
    level: parseInt(row['Level']) || 0,
    affinity: parseInt(row['Affinity']) || 0,
    advancement: parseInt(row['Advancement']) || 0,
    statBoosted: row['Stat Boosted'],
    stats: row['Stats'],
    relationship: row['Relationship Status']
  });
});

// Process skills
skillsData.forEach(row => {
  const expertName = row['Expert'];
  if (!expertName || !output[expertName]) return;

  const skillId = row['Skill'];
  if (!output[expertName].skills[skillId]) {
    output[expertName].skills[skillId] = [];
  }

  output[expertName].skills[skillId].push({
    level: parseInt(row['Level']) || 0,
    exp: parseInt(row['Exp']) || 0,
    book: parseInt(row['Book']) || 0,
    relationship: row['Relationship']
  });
});

fs.writeFileSync('expertsData.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Successfully updated expertsData.json');
