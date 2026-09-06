import fs from 'fs';
let content = fs.readFileSync('src/components/Buildings.jsx', 'utf8');

// 1. Target Building
content = content.replace(
  ">Target Building (React Demo)<",
  ">{t('sections.targetBuilding', {}, 'Target Building')}<"
);

// 2. Building dropdown
content = content.replace(
  "value={b}>{b.replace(/_/g, ' ')}</option>",
  "value={b}>{t(`building.${b}`, {}, b.replace(/_/g, ' '))}</option>"
);

// 3. Optional buildings dropdown
// {buildingKeys.map(b => <option key={b} value={b}>{b.replace(/_/g, ' ')}</option>)}
// Wait, that's already covered by the replacement above, let's just make sure both are hit.
content = content.replace(
  /value={b}>\{b.replace\(\/_\/g, ' '\)\}<\/option>/g,
  "value={b}>{t(`building.${b}`, {}, b.replace(/_/g, ' '))}</option>"
);

// 4. Double Time (20%)
content = content.replace(
  "{t('labels.doubleTime', {}, 'Double Time (20%)')}",
  "{t('labels.doubleTime', {}, 'Double Time')} (20%)"
);
// Wait, the string was `>Double Time (20%)<` maybe?
// Wait, my output said `{t('labels.doubleTime', {}, 'Double Time (20%)')}`.
// I can just replace `>Double Time (20%)<` if it's there.
content = content.replace(
  />Double Time \(20\%\)</g,
  ">{t('labels.doubleTime', {}, 'Double Time')} (20%)<"
);
content = content.replace(
  /\{t\('labels.doubleTime', \{\}, 'Double Time \(20\%\)'\)\}/g,
  "{t('labels.doubleTime', {}, 'Double Time')} (20%)"
);

// 5. Add Bear Hunt Mail
content = content.replace(
  "+ Add Bear Hunt Mail",
  "+ {t('buttons.addBearHuntMail', {}, 'Add Bear Hunt Mail')}"
);

// 6. Additive Speed
content = content.replace(
  /Additive Speed \(\{results.time.additiveSpeedPct.toFixed\(1\)\}\%\):/g,
  "{t('results.additiveSpeed', {}, 'Additive Speed')} ({results.time.additiveSpeedPct.toFixed(1)}%):"
);

// 7. Double Time (results output)
content = content.replace(
  /Double Time \(\{results.time.doubleTimePct.toFixed\(1\)\}\%\):/g,
  "{t('results.doubleTime', {}, 'Double Time')} ({results.time.doubleTimePct.toFixed(1)}%):"
);

// 8. saved
content = content.replace(
  /\(\{formatDuration\(results.time.additiveTimeSavedSeconds\)\} saved\)/g,
  "({formatDuration(results.time.additiveTimeSavedSeconds)} {t('labels.saved', {}, 'saved')})"
);
content = content.replace(
  /\(\{formatDuration\(results.time.doubleTimeSavedSeconds\)\} saved\)/g,
  "({formatDuration(results.time.doubleTimeSavedSeconds)} {t('labels.saved', {}, 'saved')})"
);

// 9. Agnus' Project Management Skill
content = content.replace(
  /Agnus' Project Management Skill:/g,
  "{t('results.agnusSkill', {}, 'Agnus\\' Project Management Skill')}:"
);
content = content.replace(
  /\(\{formatDuration\(results.time.agnusTimeSavedSeconds\)\} saved\)/g,
  "({formatDuration(results.time.agnusTimeSavedSeconds)} {t('labels.saved', {}, 'saved')})"
);

// 10. Agnus hours dropdown
content = content.replace(
  /<option value="">None \(0h\)<\/option>/g,
  `<option value="">{t('options.none0h', {}, 'None (0h)')}</option>`
);

fs.writeFileSync('src/components/Buildings.jsx', content, 'utf8');
console.log('Buildings.jsx fixed again.');
