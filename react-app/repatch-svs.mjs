import fs from 'fs';

let svs = fs.readFileSync('src/components/SvS.jsx', 'utf8');

// 1. Move DAYS inside SvS
const daysStart = svs.indexOf('const DAYS = [');
const daysEnd = svs.indexOf('const SvS = () => {');
if (daysStart !== -1 && daysStart < daysEnd) {
  const daysArrayStr = svs.substring(daysStart, daysEnd);
  svs = svs.substring(0, daysStart) + svs.substring(daysEnd);
  svs = svs.replace('const SvS = () => {', 'const SvS = () => {\n' + daysArrayStr);
}

// 2. Wrap strings in t()
svs = svs.replace(/label:\s*'([^']+)'/g, (match, text) => {
  let key = text.replace(/[^a-zA-Z0-9]/g, '');
  key = key.charAt(0).toLowerCase() + key.slice(1);
  return `label: t("svsFields.${key}", {}, "${text}")`;
});

svs = svs.replace(/title:\s*'Day 1[^']+'/g, `title: t("svsDays.day1Totals", {}, "Day 1 (City Construction)")`);
svs = svs.replace(/title:\s*'Day 2[^']+'/g, `title: t("svsDays.day2Totals", {}, "Day 2 (Basic Skills Up)")`);
svs = svs.replace(/title:\s*'Day 3[^']+'/g, `title: t("svsDays.day3Totals", {}, "Day 3 (Beast Slay)")`);
svs = svs.replace(/title:\s*'Day 4[^']+'/g, `title: t("svsDays.day4Totals", {}, "Day 4 (Hero Development)")`);
svs = svs.replace(/title:\s*'Day 5[^']+'/g, `title: t("svsDays.day5Totals", {}, "Day 5 (Power Boost)")`);

svs = svs.replace(/>Totals</g, `>{t("results.totals", {}, "Totals")}<`);
svs = svs.replace(/>SVS POINTS BREAKDOWN</g, `>{t("results.svsPointsBreakdown", {}, "SVS POINTS BREAKDOWN")}<`);
svs = svs.replace(/>GRAND TOTAL</g, `>{t("results.grandTotal", {}, "GRAND TOTAL")}<`);

svs = svs.replace(/Day 1 \(City Construction\):/g, `{t('svsDays.day1Totals', {}, 'Day 1 (City Construction)')}:`);
svs = svs.replace(/Day 2 \(Basic Skills Up\):/g, `{t('svsDays.day2Totals', {}, 'Day 2 (Basic Skills Up)')}:`);
svs = svs.replace(/Day 3 \(Beast Slay\):/g, `{t('svsDays.day3Totals', {}, 'Day 3 (Beast Slay)')}:`);
svs = svs.replace(/Day 4 \(Hero Development\):/g, `{t('svsDays.day4Totals', {}, 'Day 4 (Hero Development)')}:`);
svs = svs.replace(/Day 5 \(Power Boost\):/g, `{t('svsDays.day5Totals', {}, 'Day 5 (Power Boost)')}:`);

fs.writeFileSync('src/components/SvS.jsx', svs, 'utf8');
console.log('SvS.jsx fully translated and Days array moved.');
