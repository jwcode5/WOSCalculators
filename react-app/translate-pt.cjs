const fs = require('fs');

const fileContent = fs.readFileSync('src/data/i18n.js', 'utf8');

// We will use eval to get the TRANSLATIONS object safely
const clean = fileContent.substring(0, fileContent.indexOf('// Theme Settings Logic') !== -1 ? fileContent.indexOf('// Theme Settings Logic') : fileContent.indexOf('function t(')).replace('export { TRANSLATIONS };', '');
let TRANSLATIONS = eval(clean + '\nTRANSLATIONS;');

// Add gear and charm to EN
const gearLevels = [
  { k: 'none', v: 'Not Crafted' },
  { k: 'green_0', v: 'Green ★0' }, { k: 'green_1', v: 'Green ★1' }, { k: 'green_2', v: 'Green ★2' }, { k: 'green_3', v: 'Green ★3' },
  { k: 'blue_0', v: 'Blue ★0' }, { k: 'blue_1', v: 'Blue ★1' }, { k: 'blue_2', v: 'Blue ★2' }, { k: 'blue_3', v: 'Blue ★3' },
  { k: 'purple_0', v: 'Purple ★0' }, { k: 'purple_1', v: 'Purple ★1' }, { k: 'purple_2', v: 'Purple ★2' }, { k: 'purple_3', v: 'Purple ★3' },
  { k: 'orange_0', v: 'Orange ★0' }, { k: 'orange_1', v: 'Orange ★1' }, { k: 'orange_2', v: 'Orange ★2' }, { k: 'orange_3', v: 'Orange ★3' },
  { k: 'red_0', v: 'Red ★0' }, { k: 'red_1', v: 'Red ★1' }, { k: 'red_2', v: 'Red ★2' }, { k: 'red_3', v: 'Red ★3' },
  { k: 'mythic_0', v: 'Mythic ★0' }, { k: 'mythic_1', v: 'Mythic ★1' }, { k: 'mythic_2', v: 'Mythic ★2' }, { k: 'mythic_3', v: 'Mythic ★3' }
];

TRANSLATIONS.en.gear = {};
TRANSLATIONS.en.charm = {};

for (const {k, v} of gearLevels) {
  TRANSLATIONS.en.gear[k] = v;
  TRANSLATIONS.en.charm[k] = v;
}

// Generate the fully updated Portuguese dictionary
// Deep copy English to PT first so we have the same structure
const pt = JSON.parse(JSON.stringify(TRANSLATIONS.en));

// Now manually overwrite PT with Portuguese translations
pt.page.title.index = "WOS Calc";
pt.page.title.about = "Sobre - WOS Calc";
pt.page.title.contact = "Contato - WOS Calc";

pt.app.name = "WOS Calc";
pt.language.label = "Idioma";
pt.theme.darkMode = "Modo escuro";
pt.theme.lightMode = "Modo claro";

pt.account = {
  renameTitle: "Renomear conta",
  addTitle: "Adicionar conta",
  deleteTitle: "Excluir conta",
  addButton: "+ Conta",
  activeAccount: "Conta ativa:",
  namePrompt: "Nome da conta:",
  renamePrompt: "Renomear conta:",
  defaultName: "Conta {number}",
  cannotDeleteOnly: "Não é possível excluir a única conta.",
  deleteConfirm: "Excluir \"{name}\"? Esta ação não pode ser desfeita."
};

pt.nav = {
  calculatorTabs: "Abas da calculadora",
  siteLinks: "Links do site",
  calculator: "Calculadora",
  selectCalculator: "Selecionar Calculadora",
  about: "Sobre",
  contact: "Contato"
};

pt.calculator = {
  upgrade: "Melhoria",
  chiefGear: "Equipamento do Chefe",
  chiefCharm: "Amuleto do Chefe",
  pets: "Mascotes",
  whatIf: "E Se",
  experts: "Calculadora de Especialistas",
  expertSkills: "Habilidades de Especialistas",
  heroGear: "Equipamento de Herói",
  koi: "Calculadora KoI",
  research: "Melhorias de Pesquisa",
  svs: "Calculadora SvS",
  troopTraining: "Treinamento de Tropas",
  warAcademy: "Academia de Guerra",
  about: "Sobre",
  contact: "Contato",
  chiefGearFull: "Calculadora de Equipamento do Chefe",
  chiefCharmFull: "Calculadora de Amuleto do Chefe",
  whatIfFull: "Calculadora E Se",
  generic: "Calculadora"
};

pt.sections = {
  targetBuilding: "Construção Alvo",
  yourResources: "Seus Recursos",
  constructionBuffs: "Bônus de Construção (%)",
  requiredBuildings: "Construções Necessárias",
  optionalAdditionalBuildings: "Construções Adicionais Opcionais",
  bearHuntMail: "Correio da Caça ao Urso",
  chiefGearLevels: "Níveis do Equipamento",
  chiefGearMaterials: "Seus Materiais",
  chiefCharmMaterials: "Seus Materiais",
  petLevels: "Níveis do Mascote",
  petMaterials: "Seus Materiais",
  expertLevels: "Níveis dos Especialistas",
  expertMaterials: "Seus Materiais",
  expertSkillsLevels: "Habilidades de Especialistas",
  expertSkillsMaterials: "Seus Materiais",
  svsImport: "Importar Dados",
  svsDay1: "Dia 1: Construção da Cidade",
  svsDay2: "Dia 2: Dia de Pesquisa",
  svsDay3: "Dia 3: Eliminação de Feras",
  svsDay4: "Dia 4: Desenvolvimento de Herói",
  svsDay5: "Dia 5: Aumento de Poder"
};

pt.labels = {
  building: "Construção",
  currentLevel: "Nível Atual",
  targetLevel: "Nível Alvo",
  targetGoalLevel: "Nível Alvo (Objetivo)",
  meat: "Carne",
  wood: "Madeira",
  coal: "Carvão",
  iron: "Ferro",
  fireCrystals: "Cristais de Fogo",
  refinedFireCrystals: "Cristais de Fogo Refinados",
  useCustomResourceChests: "Usar Baús de Recursos Personalizados",
  level1Unsecured: "Nível 1 (Não Seguro)",
  level1Secured: "Nível 1 (Seguro)",
  level2Unsecured: "Nível 2 (Não Seguro)",
  level2Secured: "Nível 2 (Seguro)",
  level3Unsecured: "Nível 3 (Não Seguro)",
  level3Secured: "Nível 3 (Seguro)",
  generalSpeedups: "Aceleradores Gerais (minutos)",
  constructionSpeedups: "Aceleradores de Construção (min)",
  doubleTime: "Tempo Duplo (20%)",
  castleBuff: "Bônus do Castelo (10%)",
  constructionSpeed: "Velocidade de Construção",
  hyenaBuff: "Bônus Ajudante de Construtor (Hiena)",
  zinmanBastionist: "Habilidade Bastião de Zinman",
  positionBuff: "Bônus de Posição",
  damageTier: "Nível de Dano",
  mail: "Correio",
  setAllCurrentLevels: "Definir todos os níveis atuais",
  requiredLevel: "Nível Necessário",
  hat: "Boné (Lanceiro)",
  watch: "Relógio (Lanceiro)",
  coat: "Casaco (Infantaria)",
  pants: "Calças (Infantaria)",
  ring: "Anel (Atirador)",
  shortStaff: "Arma (Atirador)",
  hardenedAlloy: "Liga Endurecida",
  polishingSolution: "Solução de Polimento",
  designPlans: "Planos de Design",
  lunarAmber: "Âmbar Lunar",
  charm: "Amuleto",
  charmDesigns: "Designs de Amuleto",
  charmGuides: "Guias de Amuleto",
  jewelSecrets: "Segredos das Joias",
  pet: "Mascote",
  petFood: "Comida de Mascote",
  tamingManual: "Manual de Domesticação",
  energizingPotion: "Poção Energizante",
  strengtheningSerum: "Soro de Fortalecimento",
  advancementSigils: "Sigilos de Avanço",
  generalAdvancementSigils: "Sigilo Comum de Especialista",
  compass: "Bússola (10)",
  fieryHeart: "Coração Ardente (100)",
  sailOfConquest: "Vela da Conquista (1000)",
  affinity: "Afinidade Necessária",
  totalAffinity: "Afinidade Total Necessária",
  totalSigils: "Sigilos Totais Necessários",
  remainingAffinity: "Afinidade Restante",
  remainingSigils: "Sigilos Restantes",
  expert: "Especialista",
  skillExp: "Aceleradores de Aprendizado",
  skillBooks: "Livros de Habilidade",
  note: "Nota:",
  skill: "Habilidade",
  svsFireCrystals: "Cristais de Fogo",
  svsConstructionSpeedups: "Aceleradores de Construção (min)",
  svsResearchSpeedups: "Aceleradores de Pesquisa (min)",
  svsFCShards: "Fragmentos CF",
  svsExpertSigils: "Sigilos de Especialista",
  svsBooksOfKnowledge: "Livros do Conhecimento",
  svsPetAdvancement: "Pontuação de Avanço de Mascote",
  svsPolarTerrors: "Ataques ao Terror Polar",
  svsChiefCharmScore: "Pontuação de Amuleto do Chefe",
  svsTroopTraining: "Pontuação de Treinamento de Tropas",
  svsMithril: "Mithril",
  svsChiefGearScore: "Pontuação de Equip. do Chefe"
};

pt.buttons = {
  addBuilding: "+ Adicionar Construção",
  addBearHuntMail: "+ Adicionar Correio do Urso",
  calculate: "Calcular",
  remove: "Remover",
  setAll: "Definir Todos",
  refresh: "Atualizar",
  reset: "Redefinir",
  calculateCost: "Calcular Custo",
  smartUpgrade: "Melhoria Inteligente",
  importAll: "Importar Tudo",
  importBuildings: "Importar Construções",
  importResearch: "Importar Pesquisa",
  importPets: "Importar Mascotes",
  importCharms: "Importar Amuletos",
  importGear: "Importar Equipamentos",
  importExperts: "Importar Especialistas",
  importTroops: "Importar Tropas"
};

pt.options = {
  none0: "Nenhum (0%)"
};

// Gear & Charm dropdowns
const colorTranslations = {
  'Not Crafted': 'Não Fabricado',
  'Green': 'Verde',
  'Blue': 'Azul',
  'Purple': 'Roxo',
  'Orange': 'Laranja',
  'Red': 'Vermelho',
  'Mythic': 'Mítico'
};

Object.keys(TRANSLATIONS.en.gear).forEach(k => {
  const enVal = TRANSLATIONS.en.gear[k];
  let ptVal = enVal;
  for (const [enCol, ptCol] of Object.entries(colorTranslations)) {
    ptVal = ptVal.replace(enCol, ptCol);
  }
  pt.gear[k] = ptVal;
  pt.charm[k] = ptVal;
});

pt.results = {
  timeCost: "Custo de Tempo",
  grandTotal: "TOTAL GERAL",
  afterUpgradeBalance: "APÓS A MELHORIA (SALDO NA MOCHILA)",
  customChestRecommendation: "RECOMENDAÇÃO DE BAÚS PERSONALIZADA",
  afterRecommendedChestUse: "APÓS USO DOS BAÚS RECOMENDADOS",
  loading: "Carregando dados...",
  baseCost: "Custo Base (Antes do Desconto do Zinman) - ",
  totalUpgradeTimeBase: "Tempo Total de Melhoria (Base):",
  remainingTimeAfterSpeedups: "Tempo Restante Após Aceleradores:",
  chestsUsed: "Baús Usados:"
};

// Override pt in TRANSLATIONS
TRANSLATIONS.pt = pt;

// Output the new i18n.js
const prefix = 'const LANGUAGE_STORAGE_KEY = "wosCalc_language";\nconst DEFAULT_LANGUAGE = "en";\n\nconst TRANSLATIONS = ';
const serialized = JSON.stringify(TRANSLATIONS, null, 2);
const suffix = ';\n\nexport { TRANSLATIONS };\n';

fs.writeFileSync('src/data/i18n.js', prefix + serialized + suffix, 'utf8');
console.log('Successfully generated complete Portuguese dictionary!');
