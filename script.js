// LESSON 3: Load building cost data from an external JSON file.
// Each level key = cost to upgrade TO that level (example: key 2 = cost for 1 -> 2).
// Level 1 is omitted because buildings start at level 1 with no upgrade cost.
// These are still placeholder values for now; later they can be replaced with real WOS data.
let BUILDING_COSTS = null;

// Load building data once when the page opens.
async function loadData() {
  try {
    const response = await fetch("data/buildings.json");
    const json     = await response.json();

    // For now, use only the furnace data.
    BUILDING_COSTS = json.buildings.furnace;

    // Enable the calculator only after data is available.
    document.getElementById("calculateBtn").disabled = false;
    document.getElementById("result").textContent = "Furnace data loaded. Ready to calculate.";
  } catch (error) {
    document.getElementById("result").textContent = "Error loading data. Make sure you are using Live Server.";
    console.error(error);
  }
}

const calculateBtn = document.getElementById("calculateBtn");
const resultEl     = document.getElementById("result");

// Prevent clicks before the JSON data has loaded.
calculateBtn.disabled = true;

calculateBtn.addEventListener("click", () => {
  const currentLevel = Number(document.getElementById("currentLevel").value);
  const targetLevel  = Number(document.getElementById("targetLevel").value);
  const ownedWood    = Number(document.getElementById("ownedWood").value);
  const ownedMeat    = Number(document.getElementById("ownedMeat").value);

  // Basic validation for the lesson.
  if (targetLevel <= currentLevel) {
    resultEl.textContent = "Target level must be greater than current level.";
    return;
  }

  // Add the upgrade costs for each level between current and target.
  let requiredWood = 0;
  let requiredMeat = 0;

  for (let level = currentLevel + 1; level <= targetLevel; level++) {
    const costs = BUILDING_COSTS[level];

    if (!costs) {
      resultEl.textContent = `No data found for level ${level}. Coming soon!`;
      return;
    }

    requiredWood += costs.wood;
    requiredMeat += costs.meat;
  }

  // Compare required resources against what the player already owns.
  const missingWood = Math.max(requiredWood - ownedWood, 0);
  const missingMeat = Math.max(requiredMeat - ownedMeat, 0);

  resultEl.innerHTML =
    `<strong>Wood:</strong> Need ${requiredWood.toLocaleString()}, Own ${ownedWood.toLocaleString()}, Missing ${missingWood.toLocaleString()}<br>` +
    `<strong>Meat:</strong> Need ${requiredMeat.toLocaleString()}, Own ${ownedMeat.toLocaleString()}, Missing ${missingMeat.toLocaleString()}`;
});

// Start loading data immediately when page opens.
loadData();