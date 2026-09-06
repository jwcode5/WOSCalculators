import fs from 'fs';
import path from 'path';

// Deep merge helper
function setDeep(obj, pathStr, value) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (!current[parts[i]]) current[parts[i]] = {};
    current = current[parts[i]];
  }
  current[parts[parts.length - 1]] = value;
}

function getDeep(obj, pathStr) {
  const parts = pathStr.split('.');
  let current = obj;
  for (let i = 0; i < parts.length; i++) {
    if (!current[parts[i]]) return undefined;
    current = current[parts[i]];
  }
  return current;
}

(async () => {
  const content = fs.readFileSync('src/data/i18n.js', 'utf8');
  fs.writeFileSync('src/data/i18n.mjs', content);
  const mod = await import('./src/data/i18n.mjs');
  const TRANSLATIONS = mod.TRANSLATIONS;
  
  // Basic translations dictionary we might need
  const ptTranslations = {
    'Day 1: City Construction': 'Dia 1: Construção da Cidade',
    'Day 2: Research Day': 'Dia 2: Dia de Pesquisa',
    'Day 3: Beast Elimination': 'Dia 3: Eliminação de Feras',
    'Day 4: Hero Development': 'Dia 4: Desenvolvimento de Herói',
    'Day 5: Power Increase': 'Dia 5: Aumento de Poder',
    'Current': 'Atual',
    'Target': 'Alvo',
    'Saved EXP': 'EXP Salvo',
    'Specific Sigils': 'Sigilos Específicos',
    'Not Obtained': 'Não Obtido',
    'Skill prerequisites depend on your Affinity levels. Please ensure you have filled out your current/target Affinity levels above first to accurately see what skill targets you are eligible for.': 'Os pré-requisitos das habilidades dependem dos seus níveis de Afinidade. Certifique-se de preencher seus níveis de Afinidade atuais/alvo acima primeiro para ver com precisão para quais alvos de habilidade você é elegível.',
    'Fire Crystals': 'Cristais de Fogo',
    'Fire Crystal Shards': 'Fragmentos de Cristal de Fogo',
    'Construction Speedups (min)': 'Aceleradores de Construção (min)',
    'Research Speedups (min)': 'Aceleradores de Pesquisa (min)',
    'Expert Sigils': 'Sigilos de Especialista',
    'Books of Knowledge': 'Livros de Conhecimento',
    'Pet Advancement Score': 'Pontuação de Avanço de Mascote',
    'Polar Terror Attacks': 'Ataques ao Terror Polar',
    'Chief Charm Score': 'Pontuação de Amuleto do Chefe',
    'Troop Training Score': 'Pontuação de Treinamento de Tropas',
    'Mithril': 'Mithril',
    'Chief Gear Score': 'Pontuação de Equip. do Chefe',
    'No target upgrades selected and no optimized upgrades possible with current materials.': 'Nenhuma melhoria alvo selecionada e nenhuma melhoria otimizada possível com os materiais atuais.'
  };

  // Find all t('key', {}, 'English') calls in all components
  const componentsDir = 'src/components';
  const files = fs.readdirSync(componentsDir).filter(f => f.endsWith('.jsx'));
  
  let addedCount = 0;

  for (const file of files) {
    const code = fs.readFileSync(path.join(componentsDir, file), 'utf8');
    const regex = /t\(\s*[`'"]([a-zA-Z0-9_.]+)[`'"]\s*,\s*[^,]+,\s*[`'"]([^`'"]+)[`'"]\s*\)/g;
    let match;
    while ((match = regex.exec(code)) !== null) {
      const key = match[1];
      const enText = match[2];
      
      if (!getDeep(TRANSLATIONS.en, key)) {
        setDeep(TRANSLATIONS.en, key, enText);
      }
      
      if (!getDeep(TRANSLATIONS.pt, key)) {
        // Try to translate it
        let ptText = ptTranslations[enText] || enText;
        setDeep(TRANSLATIONS.pt, key, ptText);
        addedCount++;
        console.log(`Added missing key: ${key} -> ${ptText}`);
      }
    }
  }

  // Look for DAYS array in SvS.jsx manually if it doesn't use static literals in t()
  const svsCode = fs.readFileSync('src/components/SvS.jsx', 'utf8');
  // the map is t(`svsDays.day${idx+1}`, {}, day.title)
  // day titles: Day 1: City Construction, etc.
  TRANSLATIONS.en.svsDays = {
    day1: 'Day 1: City Construction',
    day2: 'Day 2: Research Day',
    day3: 'Day 3: Beast Elimination',
    day4: 'Day 4: Hero Development',
    day5: 'Day 5: Power Increase'
  };
  TRANSLATIONS.pt.svsDays = {
    day1: 'Dia 1: Construção da Cidade',
    day2: 'Dia 2: Dia de Pesquisa',
    day3: 'Dia 3: Eliminação de Feras',
    day4: 'Dia 4: Desenvolvimento de Herói',
    day5: 'Dia 5: Aumento de Poder'
  };

  // svsFields
  TRANSLATIONS.en.svsFields = {
    d1_fc: 'Fire Crystals', d1_fcShards: 'Fire Crystal Shards', d1_construct: 'Construction Speedups (min)',
    d2_fc: 'Fire Crystals', d2_research: 'Research Speedups (min)',
    d3_pet: 'Pet Advancement Score', d3_polar: 'Polar Terror Attacks',
    d4_expert: 'Expert Sigils', d4_books: 'Books of Knowledge',
    d5_charm: 'Chief Charm Score', d5_gear: 'Chief Gear Score', d5_mithril: 'Mithril', d5_troops: 'Troop Training Score'
  };
  TRANSLATIONS.pt.svsFields = {
    d1_fc: 'Cristais de Fogo', d1_fcShards: 'Fragmentos de Cristal de Fogo', d1_construct: 'Aceleradores de Construção (min)',
    d2_fc: 'Cristais de Fogo', d2_research: 'Aceleradores de Pesquisa (min)',
    d3_pet: 'Pontuação de Avanço de Mascote', d3_polar: 'Ataques ao Terror Polar',
    d4_expert: 'Sigilos de Especialista', d4_books: 'Livros de Conhecimento',
    d5_charm: 'Pontuação de Amuleto do Chefe', d5_gear: 'Pontuação de Equip. do Chefe', d5_mithril: 'Mithril', d5_troops: 'Pontuação de Treinamento de Tropas'
  };
  
  // also inject Buildings.jsx headers
  TRANSLATIONS.en.results = TRANSLATIONS.en.results || {};
  TRANSLATIONS.pt.results = TRANSLATIONS.pt.results || {};
  
  const prefix = 'const LANGUAGE_STORAGE_KEY = "wosCalc_language";\nconst DEFAULT_LANGUAGE = "en";\n\nconst TRANSLATIONS = ';
  const serialized = JSON.stringify(TRANSLATIONS, null, 2);
  const suffix = ';\n\nexport { TRANSLATIONS };\n';

  fs.writeFileSync('src/data/i18n.js', prefix + serialized + suffix, 'utf8');
  fs.unlinkSync('src/data/i18n.mjs');
  console.log('Successfully swept all components and updated dictionary!');
})();
