import fs from 'fs';

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
  'Use Custom Resource Chests': 'Usar Baús de Recursos Personalizados',
  'Level 1 Unsecured': 'Nível 1 Não Seguro',
  'Level 1 Secured': 'Nível 1 Seguro',
  'Level 2 Unsecured': 'Nível 2 Não Seguro',
  'Level 2 Secured': 'Nível 2 Seguro',
  'Level 3 Unsecured': 'Nível 3 Não Seguro',
  'Level 3 Secured': 'Nível 3 Seguro',
  'Unsecured Chests': 'Baús Não Seguros',
  'Secured Chests': 'Baús Seguros',
  'General Speedups': 'Aceleradores Gerais',
  'Construction Speedups': 'Aceleradores de Construção',
  'Double Time (Chief Skill)': 'Tempo Duplo (Habilidade do Chefe)',
  'Castle Buff': 'Bônus do Castelo',
  'Construction Speed (Research)': 'Velocidade de Construção (Pesquisa)',
  'Hyena Buff': 'Bônus da Hiena',
  'Zinman / Bastionist': 'Zinman / Bastião',
  'Position Buff (Minister/President)': 'Bônus de Posição (Ministro/Presidente)',
  'Building Upgrades': 'Melhorias de Construção',
  'Required Resources': 'Recursos Necessários',
  'Total Material Upgrade Cost': 'Custo Total de Materiais de Melhoria',
  'Speedup Options': 'Opções de Aceleração',
  'Total Upgrade Time (Base)': 'Tempo Total de Melhoria (Base)',
  'Total Upgrade Time (Boosted)': 'Tempo Total de Melhoria (Acelerado)',
  'Bear Hunt Mail': 'Correio de Caça ao Urso',
  'Damage Tier': 'Nível de Dano',
  'Mail': 'Correio',
  'Target Building': 'Edif�cio Alvo',
  'None (0h)': 'Nenhum (0h)',
  'Additive Speed': 'Velocidade Aditiva',
  'saved': 'economizado',
  'Double Time': 'Tempo Duplo',
  "Agnus' Project Management Skill": 'Habilidade de Gest�o de Projetos do Agnus',
  'Add Bear Hunt Mail': 'Adicionar Correio de Ca�a ao Urso',
  'Add Building': 'Adicionar Edif�cio'
};

(async () => {
  const content = fs.readFileSync('src/data/i18n.js', 'utf8');
  fs.writeFileSync('src/data/i18n.mjs', content);
  const mod = await import('./src/data/i18n.mjs');
  const TRANSLATIONS = mod.TRANSLATIONS;
  
  const translateObj = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'object') {
        translateObj(obj[key]);
      } else if (typeof obj[key] === 'string') {
        if (dict[obj[key]]) {
          obj[key] = dict[obj[key]];
        }
      }
    }
  };
  translateObj(TRANSLATIONS.pt);
  
  const prefix = 'const LANGUAGE_STORAGE_KEY = "wosCalc_language";\nconst DEFAULT_LANGUAGE = "en";\n\nconst TRANSLATIONS = ';
  const serialized = JSON.stringify(TRANSLATIONS, null, 2);
  const suffix = ';\n\nexport { TRANSLATIONS };\n';

  fs.writeFileSync('src/data/i18n.js', prefix + serialized + suffix, 'utf8');
  fs.unlinkSync('src/data/i18n.mjs');
  console.log('Translated PT entries!');
})();
