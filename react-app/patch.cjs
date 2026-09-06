const fs = require('fs');
const path = require('path');

const componentsDir = path.join(__dirname, 'src/components');

function replaceInFile(file, replacements) {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;
  
  for (const [from, to] of replacements) {
    // using split join to replace all instances
    content = content.split(from).join(to);
  }
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Patched ${file}`);
  }
}

// 1. Buildings.jsx
replaceInFile('Buildings.jsx', [
  ['Additional Buildings', '{t(\'sections.optionalAdditionalBuildings\', {}, \'Additional Buildings\')}'],
  ['<label style={{ display: \'block\', fontSize: \'0.85em\', marginBottom: \'4px\' }}>Current</label>', '<label style={{ display: \'block\', fontSize: \'0.85em\', marginBottom: \'4px\' }}>{t(\'labels.currentLevel\', {}, \'Current\')}</label>'],
  ['<label style={{ display: \'block\', fontSize: \'0.85em\', marginBottom: \'4px\' }}>Target</label>', '<label style={{ display: \'block\', fontSize: \'0.85em\', marginBottom: \'4px\' }}>{t(\'labels.targetGoalLevel\', {}, \'Target\')}</label>'],
  ['>Meat: {', '>{t(\'labels.meat\', {}, \'Meat\')}: {'],
  ['| Wood: {', '| {t(\'labels.wood\', {}, \'Wood\')}: {'],
  ['| Coal: {', '| {t(\'labels.coal\', {}, \'Coal\')}: {'],
  ['| Iron: {', '| {t(\'labels.iron\', {}, \'Iron\')}: {'],
  ['>Fire Crystals: {', '>{t(\'labels.fireCrystals\', {}, \'Fire Crystals\')}: {'],
  ['| Refined Fire Crystals: {', '| {t(\'labels.refinedFireCrystals\', {}, \'Refined Fire Crystals\')}: {'],
  ['>Base Cost (Before Zinman Discount) - ', '>{t(\'results.baseCost\', {}, \'Base Cost (Before Zinman Discount) - \')}'],
  ['Total Upgrade Time (Base): ', '{t(\'results.totalUpgradeTimeBase\', {}, \'Total Upgrade Time (Base):\')} '],
  ['Remaining Time After Speedups: ', '{t(\'results.remainingTimeAfterSpeedups\', {}, \'Remaining Time After Speedups:\')} '],
  ['Chests Used: L3 ', '{t(\'results.chestsUsed\', {}, \'Chests Used:\')} L3 '],
  // also the grand totals that didn't catch
  [' Meat: ', ' {t(\'labels.meat\', {}, \'Meat\')}: '],
  ['<br />Fire Crystals: ', '<br />{t(\'labels.fireCrystals\', {}, \'Fire Crystals\')}: ']
]);

// 2. ChiefGear.jsx / ChiefCharm.jsx labels
replaceInFile('ChiefGear.jsx', [
  ['>{gearData.levels[l]?.label || l}<', '>{t(`gear.${l}`, {}, gearData.levels[l]?.label || l)}<'],
  ['>Hat<', '>{t(\'labels.hat\', {}, \'Hat\')}<'],
  ['>Watch<', '>{t(\'labels.watch\', {}, \'Watch\')}<'],
  ['>Coat<', '>{t(\'labels.coat\', {}, \'Coat\')}<'],
  ['>Pants<', '>{t(\'labels.pants\', {}, \'Pants\')}<'],
  ['>Ring<', '>{t(\'labels.ring\', {}, \'Ring\')}<'],
  ['>Weapon<', '>{t(\'labels.shortStaff\', {}, \'Weapon\')}<'],
  ['>Hardened Alloy<', '>{t(\'labels.hardenedAlloy\', {}, \'Hardened Alloy\')}<'],
  ['>Polishing Solution<', '>{t(\'labels.polishingSolution\', {}, \'Polishing Solution\')}<'],
  ['>Design Plans<', '>{t(\'labels.designPlans\', {}, \'Design Plans\')}<'],
  ['>Lunar Amber<', '>{t(\'labels.lunarAmber\', {}, \'Lunar Amber\')}<'],
  ['>Target Level<', '>{t(\'labels.targetGoalLevel\', {}, \'Target Level\')}<'],
  ['>Current Level<', '>{t(\'labels.currentLevel\', {}, \'Current Level\')}<']
]);

replaceInFile('ChiefCharm.jsx', [
  ['>{charmData.levels[l]?.label || l}<', '>{t(`charm.${l}`, {}, charmData.levels[l]?.label || l)}<'],
  ['>Target Level<', '>{t(\'labels.targetGoalLevel\', {}, \'Target Level\')}<'],
  ['>Current Level<', '>{t(\'labels.currentLevel\', {}, \'Current Level\')}<']
]);

// Pets and Experts total cards
replaceInFile('Pets.jsx', [
  ['>Pet Food<', '>{t(\'labels.petFood\', {}, \'Pet Food\')}<'],
  ['>Taming Manual<', '>{t(\'labels.tamingManual\', {}, \'Taming Manual\')}<'],
  ['>Energizing Potion<', '>{t(\'labels.energizingPotion\', {}, \'Energizing Potion\')}<'],
  ['>Strengthening Serum<', '>{t(\'labels.strengtheningSerum\', {}, \'Strengthening Serum\')}<'],
  ['>Advancement Sigils<', '>{t(\'labels.advancementSigils\', {}, \'Advancement Sigils\')}<']
]);
