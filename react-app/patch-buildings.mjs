import fs from 'fs';
import path from 'path';

let content = fs.readFileSync('src/components/Buildings.jsx', 'utf8');

// The English keys we need to translate in Buildings.jsx
const dict = {
  'Meat': 'labels.meat',
  'Wood': 'labels.wood',
  'Coal': 'labels.coal',
  'Iron': 'labels.iron',
  'Fire Crystals': 'labels.fireCrystals',
  'Refined Fire Crystals': 'labels.refinedFireCrystals',
  'Use Custom Resource Chests': 'labels.useCustomResourceChests',
  'Level 1 Unsecured': 'labels.level1Unsecured',
  'Level 1 Secured': 'labels.level1Secured',
  'Level 2 Unsecured': 'labels.level2Unsecured',
  'Level 2 Secured': 'labels.level2Secured',
  'Level 3 Unsecured': 'labels.level3Unsecured',
  'Level 3 Secured': 'labels.level3Secured',
  'Unsecured Chests': 'labels.unsecuredChests',
  'Secured Chests': 'labels.securedChests',
  'General Speedups': 'labels.generalSpeedups',
  'Construction Speedups': 'labels.constructionSpeedups',
  'Double Time (Chief Skill)': 'labels.doubleTime',
  'Castle Buff': 'labels.castleBuff',
  'Construction Speed (Research)': 'labels.constructionSpeed',
  'Hyena Buff': 'labels.hyenaBuff',
  'Zinman / Bastionist': 'labels.zinmanBastionist',
  'Position Buff (Minister/President)': 'labels.positionBuff',
  'Building Upgrades': 'sections.buildingUpgrades',
  'Required Resources': 'sections.requiredResources',
  'Total Material Upgrade Cost': 'sections.totalMaterialUpgradeCost',
  'Speedup Options': 'sections.speedupOptions',
  'Total Upgrade Time (Base)': 'sections.totalUpgradeTimeBase',
  'Total Upgrade Time (Boosted)': 'sections.totalUpgradeTimeBoosted',
  'Bear Hunt Mail': 'sections.bearHuntMail',
  'Damage Tier': 'labels.damageTier',
  'Mail': 'labels.mail',
  'Totals': 'results.totals',
  'Grand Total': 'results.grandTotal',
  'Materials Remaining:': 'results.materialsRemaining',
  'Base Cost (Before Zinman Discount) - ': 'results.baseCost',
  'Remaining After Upgrades': 'results.remainingAfterUpgrades'
};

// 1. We replace exact matching >Text<
for (const [en, key] of Object.entries(dict)) {
  // regex for >Text< or >Text:< or >Text :<
  const regex = new RegExp(`>\\s*${en.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&')}\\s*<`, 'g');
  content = content.replace(regex, `>{t("${key}", {}, "${en}")}<`);
}

// 2. Some might be rendered as `Text: ` inside a span or directly
for (const [en, key] of Object.entries(dict)) {
  const regex2 = new RegExp(`>\\s*${en.replace(/[.*+?^$\{}()|[\]\\]/g, '\\$&')}:\\s*<`, 'g');
  content = content.replace(regex2, `>{t("${key}", {}, "${en}")}: <`);
}

// 3. Raw strings like `Meat: ` or `Wood: ` might be missed if they aren't enclosed in > < exactly
content = content.replace(/Meat: /g, '{t("labels.meat", {}, "Meat")}: ');
content = content.replace(/Wood: /g, '{t("labels.wood", {}, "Wood")}: ');
content = content.replace(/Coal: /g, '{t("labels.coal", {}, "Coal")}: ');
content = content.replace(/Iron: /g, '{t("labels.iron", {}, "Iron")}: ');
content = content.replace(/Fire Crystals: /g, '{t("labels.fireCrystals", {}, "Fire Crystals")}: ');
content = content.replace(/Refined Fire Crystals: /g, '{t("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ');
content = content.replace(/Total Upgrade Time \(Base\): /g, '{t("sections.totalUpgradeTimeBase", {}, "Total Upgrade Time (Base)")}: ');
content = content.replace(/Total Upgrade Time \(Boosted\): /g, '{t("sections.totalUpgradeTimeBoosted", {}, "Total Upgrade Time (Boosted)")}: ');
content = content.replace(/Materials Remaining:/g, '{t("results.materialsRemaining", {}, "Materials Remaining:")}');
content = content.replace(/Grand Total/g, '{t("results.grandTotal", {}, "Grand Total")}');
content = content.replace(/>Damage Tier</g, '>{t("labels.damageTier", {}, "Damage Tier")}<');
content = content.replace(/>Mail</g, '>{t("labels.mail", {}, "Mail")}<');
content = content.replace(/>Bear Hunt Mail</g, '>{t("sections.bearHuntMail", {}, "Bear Hunt Mail")}<');

// Remove double t(t( nested calls if they happened
content = content.replace(/\{t\("[^"]+", \{\}, "\{t\("[^"]+", \{\}, "([^"]+)"\)\}"\)\}/g, (match, text) => {
  return `{t("labels.placeholder", {}, "${text}")}`; // simplistic un-nesting
});

fs.writeFileSync('src/components/Buildings.jsx', content, 'utf8');
console.log('Buildings.jsx patched directly.');
