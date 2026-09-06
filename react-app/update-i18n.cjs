const fs = require('fs');

const fileContent = fs.readFileSync('src/data/i18n.js', 'utf8');

const clean = fileContent.substring(0, fileContent.indexOf('// Theme Settings Logic') !== -1 ? fileContent.indexOf('// Theme Settings Logic') : fileContent.indexOf('function t(')).replace('export { TRANSLATIONS };', '').replace('const TRANSLATIONS = ', 'let TRANSLATIONS = ');
let TRANSLATIONS = eval(clean + '\nTRANSLATIONS;');

// Pieces
TRANSLATIONS.en.pieces = {
  hat: "Cap (Lancer)",
  watch: "Watch (Lancer)",
  coat: "Coat (Infantry)",
  pants: "Pants (Infantry)",
  ring: "Ring (Marksman)",
  shortStaff: "Weapon (Marksman)"
};
TRANSLATIONS.pt.pieces = {
  hat: "Boné (Lanceiro)",
  watch: "Relógio (Lanceiro)",
  coat: "Casaco (Infantaria)",
  pants: "Calças (Infantaria)",
  ring: "Anel (Atirador)",
  shortStaff: "Arma (Atirador)"
};

// Pets
TRANSLATIONS.en.pets = {
  CaveHyena: "Cave Hyena", ArcticWolf: "Arctic Wolf", MuskOx: "Musk Ox", GiantTapir: "Giant Tapir", TitanRoc: "Titan Roc",
  GiantElk: "Giant Elk", SnowLeopard: "Snow Leopard", CaveLion: "Cave Lion", SnowApe: "Snow Ape", IronRhino: "Iron Rhino",
  SaberToothTiger: "Saber-Tooth Tiger", Mammoth: "Mammoth", FrostGorilla: "Frost Gorilla", FrostscaleChameleon: "Frostscale Chameleon",
  AbyssalShelldragon: "Abyssal Shelldragon"
};
TRANSLATIONS.pt.pets = {
  CaveHyena: "Hiena da Caverna", ArcticWolf: "Lobo do Ártico", MuskOx: "Boi Almiscarado", GiantTapir: "Anta Gigante", TitanRoc: "Roca Titã",
  GiantElk: "Alce Gigante", SnowLeopard: "Leopardo das Neves", CaveLion: "Leão da Caverna", SnowApe: "Macaco da Neve", IronRhino: "Rinoceronte de Ferro",
  SaberToothTiger: "Tigre Dente-de-Sabre", Mammoth: "Mamute", FrostGorilla: "Gorila de Gelo", FrostscaleChameleon: "Camaleão Escama-de-Gelo",
  AbyssalShelldragon: "Dragão de Concha Abissal"
};

// Experts
TRANSLATIONS.en.experts = {
  Jasser: "Jasser", SeoYoon: "Seo-yoon", WalisBove: "Walis Bove",
  Patrick: "Patrick", Sergey: "Sergey",
  Bahiti: "Bahiti", Jessie: "Jessie", Jina: "Jina",
  Ling: "Ling", Natalia: "Natalia",
  Ahmose: "Ahmose", Alonso: "Alonso",
  Flint: "Flint", Greg: "Greg",
  Gwen: "Gwen", Hector: "Hector",
  Jerom: "Jerom", Logan: "Logan",
  Lynn: "Lynn", Mia: "Mia",
  Norah: "Norah", Philly: "Philly",
  Reina: "Reina", Renee: "Renee",
  Sonya: "Sonya", Wayne: "Wayne", WuMing: "Wu Ming",
  Zinman: "Zinman", Ahmose1: "Ahmose (Gen 1)", Hector1: "Hector (Gen 1)"
};
TRANSLATIONS.pt.experts = {
  Jasser: "Jasser", SeoYoon: "Seo-yoon", WalisBove: "Walis Bove",
  Patrick: "Patrick", Sergey: "Sergey",
  Bahiti: "Bahiti", Jessie: "Jessie", Jina: "Jina",
  Ling: "Ling", Natalia: "Natalia",
  Ahmose: "Ahmose", Alonso: "Alonso",
  Flint: "Flint", Greg: "Greg",
  Gwen: "Gwen", Hector: "Hector",
  Jerom: "Jerom", Logan: "Logan",
  Lynn: "Lynn", Mia: "Mia",
  Norah: "Norah", Philly: "Philly",
  Reina: "Reina", Renee: "Renee",
  Sonya: "Sonya", Wayne: "Wayne", WuMing: "Wu Ming",
  Zinman: "Zinman", Ahmose1: "Ahmose (Gen 1)", Hector1: "Hector (Gen 1)"
};

// Also Pet Levels
TRANSLATIONS.en.petLevels = {
  "Not Tamed": "Not Tamed"
};
TRANSLATIONS.pt.petLevels = {
  "Not Tamed": "Não Domado"
};
for(let i = 1; i <= 60; i++) {
  TRANSLATIONS.en.petLevels[`Lv.${i}`] = `Lv.${i}`;
  TRANSLATIONS.pt.petLevels[`Lv.${i}`] = `Nv.${i}`;
}

// Expert Levels
TRANSLATIONS.en.expertLevels = {
  "Not Unlocked": "Not Unlocked"
};
TRANSLATIONS.pt.expertLevels = {
  "Not Unlocked": "Não Desbloqueado"
};

// Also inject missing keys that were patched previously
const addLabels = (dict, enOrPt) => {
  const lbls = dict.labels || {};
  if (enOrPt === 'en') {
    lbls.unsecuredChests = "Unsecured Chests";
    lbls.securedChests = "Secured Chests";
    lbls.loggedInAs = "Logged in as:";
    lbls.logout = "Logout";
    lbls.login = "Login";
    lbls.register = "Register";
    lbls.or = "OR";
    lbls.syncPrompt = "Missing data? Click below to allow your live app to re-sync its data upwards.";
  } else {
    lbls.unsecuredChests = "Baús Não Seguros";
    lbls.securedChests = "Baús Seguros";
    lbls.loggedInAs = "Logado como:";
    lbls.logout = "Sair";
    lbls.login = "Entrar";
    lbls.register = "Registrar";
    lbls.or = "OU";
    lbls.syncPrompt = "Dados ausentes? Clique abaixo para sincronizar seus dados do aplicativo em tempo real.";
  }
  dict.labels = lbls;
};
addLabels(TRANSLATIONS.en, 'en');
addLabels(TRANSLATIONS.pt, 'pt');


const prefix = 'const LANGUAGE_STORAGE_KEY = "wosCalc_language";\nconst DEFAULT_LANGUAGE = "en";\n\nconst TRANSLATIONS = ';
const serialized = JSON.stringify(TRANSLATIONS, null, 2);
const suffix = ';\n\nexport { TRANSLATIONS };\n';

fs.writeFileSync('src/data/i18n.js', prefix + serialized + suffix, 'utf8');
console.log('Successfully generated complete Portuguese dictionary additions!');
