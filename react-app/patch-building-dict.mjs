import fs from 'fs';

const buildingsPT = {
  furnace: 'Fornalha',
  embassy: 'Embaixada',
  research_center: 'Centro de Pesquisa',
  infirmary: 'Enfermaria',
  infantry_camp: 'Acamp. de Infantaria',
  lancer_camp: 'Acamp. de Lanceiros',
  marksman_camp: 'Acamp. de Atiradores',
  barricade: 'Barricada',
  command_center: 'Centro de Comando',
  storehouse: 'Armazém',
  war_academy: 'Academia de Guerra'
};

const buildingsEN = {
  furnace: 'Furnace',
  embassy: 'Embassy',
  research_center: 'Research Center',
  infirmary: 'Infirmary',
  infantry_camp: 'Infantry Camp',
  lancer_camp: 'Lancer Camp',
  marksman_camp: 'Marksman Camp',
  barricade: 'Barricade',
  command_center: 'Command Center',
  storehouse: 'Storehouse',
  war_academy: 'War Academy'
};

(async () => {
  const content = fs.readFileSync('src/data/i18n.js', 'utf8');
  fs.writeFileSync('src/data/i18n.mjs', content);
  const mod = await import('./src/data/i18n.mjs');
  const TRANSLATIONS = mod.TRANSLATIONS;
  
  if (!TRANSLATIONS.pt.building) TRANSLATIONS.pt.building = {};
  if (!TRANSLATIONS.en.building) TRANSLATIONS.en.building = {};
  
  for (let key in buildingsPT) {
    TRANSLATIONS.pt.building[key] = buildingsPT[key];
    TRANSLATIONS.en.building[key] = buildingsEN[key];
  }

  const prefix = 'const LANGUAGE_STORAGE_KEY = "wosCalc_language";\nconst DEFAULT_LANGUAGE = "en";\n\nconst TRANSLATIONS = ';
  const serialized = JSON.stringify(TRANSLATIONS, null, 2);
  const suffix = ';\n\nexport { TRANSLATIONS };\n';

  fs.writeFileSync('src/data/i18n.js', prefix + serialized + suffix, 'utf8');
  fs.unlinkSync('src/data/i18n.mjs');
  console.log('Translated Building Dropdowns!');
})();
