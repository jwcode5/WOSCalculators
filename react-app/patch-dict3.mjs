import fs from 'fs';

(async () => {
  const svs = fs.readFileSync('src/components/SvS.jsx', 'utf8');
  const regex = /t\(['"]([^'"]+)['"],\s*\{[^}]*\},\s*['"]([^'"]+)['"]\)/g;
  let match;
  
  const content = fs.readFileSync('src/data/i18n.js', 'utf8');
  fs.writeFileSync('src/data/i18n.mjs', content);
  const mod = await import('./src/data/i18n.mjs');
  const TRANSLATIONS = mod.TRANSLATIONS;
  
  const dict = {
    'Day 1 (City Construction)': 'Dia 1 (Construção da Cidade)',
    'Refined Fire Crystals': 'Cristais de Fogo Refinados',
    'Speedups (minutes)': 'Aceleradores (minutos)',
    'Day 2 (Basic Skills Up)': 'Dia 2 (Habilidades Básicas)',
    'Lucky Wheel Spins': 'Giros na Roleta da Sorte',
    'Rare Hero Shards': 'Fragmentos de Herói Raro',
    'Epic Hero Shards': 'Fragmentos de Herói Épico',
    'Mythic Hero Shards': 'Fragmentos de Herói Mítico',
    'Gather Meat (x1000)': 'Coletar Carne (x1000)',
    'Gather Wood (x1000)': 'Coletar Madeira (x1000)',
    'Gather Coal (x200)': 'Coletar Carvão (x200)',
    'Gather Iron (x50)': 'Coletar Ferro (x50)',
    'Day 3 (Beast Slay)': 'Dia 3 (Eliminação de Feras)',
    'Advanced Wild Mark': 'Marca Selvagem Avançada',
    'Common Wild Mark': 'Marca Selvagem Comum',
    'Polar Terror Rallies': 'Ataques ao Terror Polar',
    'Beast Lv 1-10': 'Fera Nv 1-10',
    'Beast Lv 11-15': 'Fera Nv 11-15',
    'Beast Lv 16-20': 'Fera Nv 16-20',
    'Beast Lv 21-25': 'Fera Nv 21-25',
    'Beast Lv 26-30': 'Fera Nv 26-30',
    'Day 4 (Hero Development)': 'Dia 4 (Desenvolvimento de Herói)',
    'Hero Gear Essence Stone': 'Pedra de Essência de Equip. de Herói',
    'Hero Exclusive Gear Widget': 'Componente de Equip. Exclusivo de Herói',
    'Train T1 Troops': 'Treinar Tropas T1',
    'Train T2 Troops': 'Treinar Tropas T2',
    'Train T3 Troops': 'Treinar Tropas T3',
    'Train T4 Troops': 'Treinar Tropas T4',
    'Train T5 Troops': 'Treinar Tropas T5',
    'Train T6 Troops': 'Treinar Tropas T6',
    'Train T7 Troops': 'Treinar Tropas T7',
    'Train T8 Troops': 'Treinar Tropas T8',
    'Train T9 Troops': 'Treinar Tropas T9',
    'Train T10 Troops': 'Treinar Tropas T10',
    'Train T11 Troops': 'Treinar Tropas T11',
    'Day 5 (Power Boost)': 'Dia 5 (Aumento de Poder)',
    'Import Building Needs': 'Importar Necessidades de Construção',
    'Import Data': 'Importar Dados',
    'Import Chief Gear Needs': 'Importar Necessidades de Equip. do Chefe',
    'Import Chief Charm Needs': 'Importar Necessidades de Amuleto do Chefe',
    'Import Pets Needs': 'Importar Necessidades de Mascotes',
    'Import Expert Needs': 'Importar Necessidades de Especialistas',
    'Import Buildings': 'Importar Edifícios',
    'Import Research': 'Importar Pesquisa',
    'Import Pets': 'Importar Mascotes',
    'Import Charms': 'Importar Amuletos',
    'Import Gear': 'Importar Equipamento',
    'Import Experts': 'Importar Especialistas',
    'Import Troops': 'Importar Tropas',
    'Import All': 'Importar Tudo',
    'Totals': 'Totais',
    'SVS POINTS BREAKDOWN': 'RESUMO DE PONTOS SVS',
    'GRAND TOTAL': 'TOTAL GERAL',
    'Fire Crystals': 'Cristais de Fogo',
    'Fire Crystal Shards': 'Fragmentos de Cristal de Fogo',
    'Chief Charm Score': 'Pontuação de Amuleto do Chefe',
    'Pet Advancement Score': 'Pontuação de Avanço de Mascote',
    'Mithril': 'Mithril',
    'Chief Gear Score': 'Pontuação de Equip. do Chefe'
  };

  const assign = (obj, path, value) => {
    let curr = obj;
    for (let i = 0; i < path.length - 1; i++) {
      if (!curr[path[i]]) curr[path[i]] = {};
      curr = curr[path[i]];
    }
    if (!curr[path[path.length - 1]]) {
      curr[path[path.length - 1]] = value;
    }
  };

  while ((match = regex.exec(svs)) !== null) {
    const keyPath = match[1].split('.');
    const enVal = match[2];
    
    // Assign to EN
    assign(TRANSLATIONS.en, keyPath, enVal);
    
    // Assign to PT
    const ptVal = dict[enVal] || enVal;
    assign(TRANSLATIONS.pt, keyPath, ptVal);
  }

  // Also fix weird characters that snuck in
  const fixEncoding = (obj) => {
    for (let k in obj) {
      if (typeof obj[k] === 'object') {
        fixEncoding(obj[k]);
      } else if (typeof obj[k] === 'string') {
        obj[k] = obj[k].replace(/A A/g, 'çã');
        obj[k] = obj[k].replace(/A o/g, 'ço');
      }
    }
  }
  fixEncoding(TRANSLATIONS.pt);

  const prefix = 'const LANGUAGE_STORAGE_KEY = "wosCalc_language";\nconst DEFAULT_LANGUAGE = "en";\n\nconst TRANSLATIONS = ';
  const serialized = JSON.stringify(TRANSLATIONS, null, 2);
  const suffix = ';\n\nexport { TRANSLATIONS };\n';

  fs.writeFileSync('src/data/i18n.js', prefix + serialized + suffix, 'utf8');
  fs.unlinkSync('src/data/i18n.mjs');
  console.log('Fixed Dictionary forever.');
})();
