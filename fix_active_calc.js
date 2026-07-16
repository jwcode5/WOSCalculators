const fs = require('fs');

let scriptJs = fs.readFileSync('script.js', 'utf8');

scriptJs = scriptJs.replace(
  /if \(activeCalculator === CALCULATOR_KEYS\.UPGRADE && safeKey !== CALCULATOR_KEYS\.UPGRADE\)/,
  `if (window.activeCalculator === CALCULATOR_KEYS.UPGRADE && safeKey !== CALCULATOR_KEYS.UPGRADE)`
).replace(
  /else if \(activeCalculator === CALCULATOR_KEYS\.CHIEF_GEAR && safeKey !== CALCULATOR_KEYS\.CHIEF_GEAR\)/,
  `else if (window.activeCalculator === CALCULATOR_KEYS.CHIEF_GEAR && safeKey !== CALCULATOR_KEYS.CHIEF_GEAR)`
).replace(
  /else if \(activeCalculator === CALCULATOR_KEYS\.CHIEF_CHARM && safeKey !== CALCULATOR_KEYS\.CHIEF_CHARM\)/,
  `else if (window.activeCalculator === CALCULATOR_KEYS.CHIEF_CHARM && safeKey !== CALCULATOR_KEYS.CHIEF_CHARM)`
);

fs.writeFileSync('script.js', scriptJs, 'utf8');
console.log("Patched script.js to use window.activeCalculator safely");
