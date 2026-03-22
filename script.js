const calculateBtn = document.getElementById("calculateBtn");
const resultEl = document.getElementById("result");

calculateBtn.addEventListener("click", () => {
  const currentLevel = Number(document.getElementById("currentLevel").value);
  const targetLevel = Number(document.getElementById("targetLevel").value);
  const ownedWood = Number(document.getElementById("ownedWood").value);

  if (targetLevel <= currentLevel) {
    resultEl.textContent = "Target level must be greater than current level.";
    return;
  }

  const levelSteps = targetLevel - currentLevel;
  const woodPerLevel = 1000;
  const requiredWood = levelSteps * woodPerLevel;
  const missingWood = Math.max(requiredWood - ownedWood, 0);

  resultEl.textContent =
    `Need ${requiredWood.toLocaleString()} wood. ` +
    `You own ${ownedWood.toLocaleString()}. ` +
    `Missing ${missingWood.toLocaleString()}.`;
});