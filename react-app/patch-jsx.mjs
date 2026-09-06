import fs from 'fs';
import path from 'path';

function patch(file, replacements) {
  const fp = path.join('src/components', file);
  if (!fs.existsSync(fp)) return;
  let c = fs.readFileSync(fp, 'utf8');
  let start = c;
  for (const [from, to] of replacements) {
    c = c.split(from).join(to);
  }
  if (c !== start) {
    fs.writeFileSync(fp, c, 'utf8');
    console.log(`Patched ${file}`);
  }
}

// 1. Buildings.jsx
patch('Buildings.jsx', [
  ['>Meat: ', '>{t("labels.meat", {}, "Meat")}: '],
  ['| Wood: ', '| {t("labels.wood", {}, "Wood")}: '],
  ['| Coal: ', '| {t("labels.coal", {}, "Coal")}: '],
  ['| Iron: ', '| {t("labels.iron", {}, "Iron")}: '],
  [' Meat: ', ' {t("labels.meat", {}, "Meat")}: ']
]);

// 2. Experts.jsx
patch('Experts.jsx', [
  ['<span>Current</span>', '<span>{t("labels.current", {}, "Current")}</span>'],
  ['<span>Target</span>', '<span>{t("labels.target", {}, "Target")}</span>'],
  ['<span>Saved EXP</span>', '<span>{t("labels.savedExp", {}, "Saved EXP")}</span>'],
  ['<span>Specific Sigils</span>', '<span>{t("labels.specificSigils", {}, "Specific Sigils")}</span>']
]);

// 3. SvS.jsx
patch('SvS.jsx', [
  ['title: \'Day 1: City Construction\'', 'title: t("svsDays.day1Totals", {}, "Day 1 (City Construction)")'],
  ['title: \'Day 2: Basic Skills Up\'', 'title: t("svsDays.day2Totals", {}, "Day 2 (Basic Skills Up)")'],
  ['title: \'Day 3: Beast Slay\'', 'title: t("svsDays.day3Totals", {}, "Day 3 (Beast Slay)")'],
  ['title: \'Day 4: Hero Development\'', 'title: t("svsDays.day4Totals", {}, "Day 4 (Hero Development)")'],
  ['title: \'Day 5: Power Boost\'', 'title: t("svsDays.day5Totals", {}, "Day 5 (Power Boost)")'],
  ['<h2 style={{ marginBottom: \'16px\' }}>{day.title}</h2>', '<h2 style={{ marginBottom: \'16px\' }}>{day.title}</h2>'],
  ['label: \'Fire Crystals\'', 'label: t("svsFields.fc", {}, "Fire Crystals")'],
  ['label: \'Fire Crystal Shards\'', 'label: t("svsFields.fcShards", {}, "Fire Crystal Shards")'],
  ['label: \'Construction Speedups (min)\'', 'label: t("svsFields.construct", {}, "Construction Speedups (min)")'],
  ['label: \'Research Speedups (min)\'', 'label: t("svsFields.research", {}, "Research Speedups (min)")'],
  ['label: \'Pet Advancement Score\'', 'label: t("svsFields.petAdv", {}, "Pet Advancement Score")'],
  ['label: \'Polar Terror Attacks\'', 'label: t("svsFields.polar", {}, "Polar Terror Attacks")'],
  ['label: \'Chief Charm Score\'', 'label: t("svsFields.charm", {}, "Chief Charm Score")'],
  ['label: \'Expert Sigils\'', 'label: t("svsFields.expert", {}, "Expert Sigils")'],
  ['label: \'Books of Knowledge\'', 'label: t("svsFields.books", {}, "Books of Knowledge")'],
  ['label: \'Mithril\'', 'label: t("svsFields.mithril", {}, "Mithril")'],
  ['label: \'Chief Gear Score\'', 'label: t("svsFields.gear", {}, "Chief Gear Score")'],
  ['label: \'Troop Training Score\'', 'label: t("svsFields.troops", {}, "Troop Training Score")'],
  ['>Totals<', '>{t("results.totals", {}, "Totals")}<'],
  ['>{day.title}<', '>{day.title}<'],
  ['>{field.label}<', '>{field.label}<'],
  ['Day 1 (City Construction):', '{t("svsDays.day1Totals", {}, "Day 1 (City Construction)")}:'],
  ['Day 2 (Basic Skills Up):', '{t("svsDays.day2Totals", {}, "Day 2 (Basic Skills Up)")}:'],
  ['Day 3 (Beast Slay):', '{t("svsDays.day3Totals", {}, "Day 3 (Beast Slay)")}:'],
  ['Day 4 (Hero Development):', '{t("svsDays.day4Totals", {}, "Day 4 (Hero Development)")}:'],
  ['Day 5 (Power Boost):', '{t("svsDays.day5Totals", {}, "Day 5 (Power Boost)")}:']
]);
