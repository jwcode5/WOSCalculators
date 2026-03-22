// ============================================
// Lesson 4: Multi-Building Calculator
// ============================================

let BUILDING_COSTS = null;
let PREREQUISITES = null;

// Show/hide prerequisites for a given building and target level
function updatePrerequisites(selectedBuilding, targetLevel) {
  const prereqsFieldset = document.getElementById("prerequisitesSection");
  const prereqsContainer = document.getElementById("prerequisitesContainer");

  if (PREREQUISITES && PREREQUISITES[selectedBuilding]) {
    const prereqs = PREREQUISITES[selectedBuilding];

    let prereqsHTML = "";
    for (const prereq of prereqs) {
      const buildingName = prereq.building;
      const levelOffset = prereq.levelOffset;
      const requiredLevel = Math.max(1, targetLevel + levelOffset);

      prereqsHTML += `
        <div style="margin-bottom: 10px;">
          <label for="${buildingName}Level">${buildingName.replace("_", " ").toUpperCase()} Level:</label>
          <input 
            type="number" 
            id="${buildingName}Level" 
            min="1" 
            max="30" 
            value="${requiredLevel}"
            data-building="${buildingName}"
          >
        </div>
      `;
    }

    prereqsContainer.innerHTML = prereqsHTML;
    prereqsFieldset.style.display = "block";
  } else {
    prereqsContainer.innerHTML = "";
    prereqsFieldset.style.display = "none";
  }
}

// Load both buildings and prerequisites data on page open
async function loadData() {
  try {
    const buildingsResponse = await fetch("data/buildings.json");
    const buildingsData = await buildingsResponse.json();
    BUILDING_COSTS = buildingsData.buildings;

    const preqResponse = await fetch("data/prerequisites.json");
    const preqData = await preqResponse.json();
    PREREQUISITES = preqData.prerequisites;

    console.log("Data loaded successfully", { BUILDING_COSTS, PREREQUISITES });

    // Trigger prerequisites display for the default selected building
    const selectedBuilding = document.getElementById("targetBuilding").value;
    const targetLevel = parseInt(document.getElementById("targetLevel").value) || 1;
    updatePrerequisites(selectedBuilding, targetLevel);
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Error loading calculator data. Please refresh the page.");
  }
}

// When target building dropdown changes, update prerequisites
document.getElementById("targetBuilding").addEventListener("change", function() {
  const targetLevel = parseInt(document.getElementById("targetLevel").value) || 1;
  updatePrerequisites(this.value, targetLevel);
});

// When target level changes, update prerequisite levels
document.getElementById("targetLevel").addEventListener("change", function() {
  const selectedBuilding = document.getElementById("targetBuilding").value;
  const targetLevel = parseInt(this.value) || 1;
  updatePrerequisites(selectedBuilding, targetLevel);
});

// Calculate total costs for target building + all prerequisites
document.getElementById("calculateBtn").addEventListener("click", function() {
  // Validate data is loaded
  if (!BUILDING_COSTS || !PREREQUISITES) {
    alert("Data is still loading. Please wait and try again.");
    return;
  }

  const targetBuilding = document.getElementById("targetBuilding").value;
  const currentLevel = parseInt(document.getElementById("currentLevel").value) || 1;
  const targetLevel = parseInt(document.getElementById("targetLevel").value) || 1;

  // Validate input
  if (currentLevel < 1 || targetLevel < 1 || currentLevel > targetLevel) {
    alert("Please ensure current level is at least 1 and doesn't exceed target level.");
    return;
  }

  // Get backpack resources
  const woodBackpack = parseInt(document.getElementById("ownedWood").value) || 0;
  const meatBackpack = parseInt(document.getElementById("ownedMeat").value) || 0;
  const coalBackpack = parseInt(document.getElementById("ownedCoal").value) || 0;
  const ironBackpack = parseInt(document.getElementById("ownedIron").value) || 0;

  // Collect all buildings to calculate (target + prerequisites)
  const buildingsToCalc = [{ building: targetBuilding, currentLevel, targetLevel }];

  if (PREREQUISITES[targetBuilding]) {
    for (const prereq of PREREQUISITES[targetBuilding]) {
      const buildingName = prereq.building;
      const input = document.getElementById(`${buildingName}Level`);
      const prereqTargetLevel = input ? parseInt(input.value) : 1;
      buildingsToCalc.push({
        building: buildingName,
        currentLevel: 1, // Prerequisites start at 1
        targetLevel: prereqTargetLevel
      });
    }
  }

  // Calculate total cost across all buildings
  let totalWood = 0, totalMeat = 0, totalCoal = 0, totalIron = 0;
  let resultsHTML = "";

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    let buildingWood = 0, buildingMeat = 0, buildingCoal = 0, buildingIron = 0;

    // Sum costs from current level + 1 to target level
    for (let level = curLvl + 1; level <= tgtLvl; level++) {
      const levelData = BUILDING_COSTS[building][level];
      if (!levelData) continue;

      buildingWood += levelData.wood || 0;
      buildingMeat += levelData.meat || 0;
      buildingCoal += levelData.coal || 0;
      buildingIron += levelData.iron || 0;
    }

    totalWood += buildingWood;
    totalMeat += buildingMeat;
    totalCoal += buildingCoal;
    totalIron += buildingIron;

    // Display results for this building
    const buildingDisplay = building.replace("_", " ").toUpperCase();
    resultsHTML += `
      <div style="margin-top: 15px; padding: 10px; border-left: 3px solid #ccc;">
        <strong>${buildingDisplay}</strong> (${curLvl} → ${tgtLvl})<br>
        Wood: ${buildingWood.toLocaleString()} | 
        Meat: ${buildingMeat.toLocaleString()} | 
        Coal: ${buildingCoal.toLocaleString()} | 
        Iron: ${buildingIron.toLocaleString()}
      </div>
    `;
  }

  // Calculate remaining resources after upgrade
  const woodRemaining = woodBackpack - totalWood;
  const meatRemaining = meatBackpack - totalMeat;
  const coalRemaining = coalBackpack - totalCoal;
  const ironRemaining = ironBackpack - totalIron;

  // Add grand total
  resultsHTML += `
    <div style="margin-top: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 5px;">
      <strong>GRAND TOTAL</strong><br>
      Wood: ${totalWood.toLocaleString()} | 
      Meat: ${totalMeat.toLocaleString()} | 
      Coal: ${totalCoal.toLocaleString()} | 
      Iron: ${totalIron.toLocaleString()}
      
      <br><br>
      <strong>After Upgrade (Backpack Balance)</strong><br>
      Wood: ${woodRemaining.toLocaleString()} | 
      Meat: ${meatRemaining.toLocaleString()} | 
      Coal: ${coalRemaining.toLocaleString()} | 
      Iron: ${ironRemaining.toLocaleString()}
    </div>
  `;

  document.getElementById("result").innerHTML = resultsHTML;
});

// Load data on page load
loadData();