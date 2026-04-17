// ============================================================
// WOS Calculator — Main Script
// Handles building cost calculation, account management,
// resource planning, bear hunt mail rewards, and persistence.
// ============================================================


// ============================================================
// GLOBAL STATE
// These variables are declared at the top so every function
// in the file can read and update them. "null" means "not
// loaded yet"; arrays start empty and get filled on page load.
// ============================================================

let BUILDING_COSTS = null;      // Loaded from data/buildings.json
let PREREQUISITES = null;       // Loaded from data/prerequisites.json
let optionalBuildings = [];     // Extra buildings the user added manually
let bearHuntMails = [];         // Bear Hunt Mail reward rows
let accounts = [];              // All saved accounts (Option B blob model)
let activeAccountId = null;     // ID of the currently selected account

// ============================================================
// CONSTANTS — SUPPLY FIELD IDs
// A list of every HTML input/select/checkbox id that belongs
// to the "Your Resources" and "Buffs" sections. Used to loop
// over all fields when saving or loading state, instead of
// typing each one individually every time.
// ============================================================

const SUPPLY_FIELD_IDS = [
  "ownedMeat",
  "ownedWood",
  "ownedCoal",
  "ownedIron",
  "generalSpeedups",
  "constructionSpeedups",
  "constructionSpeedPct",
  "hyenaBuffPct",
  "positionBuffPct",
  "doubleTimeEnabled",
  "castleBuffEnabled",
  "ownedFireCrystals",
  "ownedRefinedFireCrystals",
  "useCustomChests",
  "customChestL1SecuredCount",
  "customChestL1UnsecuredCount",
  "customChestL2SecuredCount",
  "customChestL2UnsecuredCount",
  "customChestL3SecuredCount",
  "customChestL3UnsecuredCount"
];

// ============================================================
// CONSTANTS — CUSTOM CHEST VALUES
// How many resources each level of custom chest provides.
// Keyed by chest level (1, 2, 3) for easy lookup by level number.
// ============================================================

const CUSTOM_CHEST_VALUES = {
  1: { meat: 10000, wood: 10000, coal: 2000, iron: 500 },
  2: { meat: 100000, wood: 100000, coal: 20000, iron: 5000 },
  3: { meat: 1000000, wood: 1000000, coal: 200000, iron: 50000 }
};

// ============================================================
// CONSTANTS — BASIC RESOURCES
// The four main resources. Kept as an array so we can loop
// over them instead of writing meat/wood/coal/iron repeatedly.
// ============================================================

const BASIC_RESOURCES = ["meat", "wood", "coal", "iron"];

// ============================================================
// CONSTANTS — BEAR HUNT TIERS
// Each object represents one damage tier in the Bear Hunt event.
// label        : display name shown in the dropdown (K/M/B format)
// essenceStones: how many essence stones the mail rewards
// luckyHeroGearChest: lucky hero gear chest count
// xp10 / xp100 : enhancement XP component counts (10xp or 100xp each)
// allianceToken: alliance token reward
// meat/wood/coal/iron: raw resource reward amounts
// ============================================================

const BEAR_HUNT_TIERS = [
  { label: "1 – 2.5K",              essenceStones: 1,  luckyHeroGearChest: 1, xp10: 2,  xp100: 0, allianceToken: 5500,   meat: 495500,   wood: 495500,   coal: 99000,   iron: 25000   },
  { label: "2.5K – 5K",             essenceStones: 1,  luckyHeroGearChest: 1, xp10: 2,  xp100: 0, allianceToken: 7000,   meat: 991500,   wood: 991500,   coal: 198500,  iron: 50000   },
  { label: "5K – 8K",               essenceStones: 1,  luckyHeroGearChest: 1, xp10: 2,  xp100: 0, allianceToken: 8000,   meat: 1400000,  wood: 1400000,  coal: 297500,  iron: 75000   },
  { label: "8K – 12K",              essenceStones: 1,  luckyHeroGearChest: 1, xp10: 3,  xp100: 0, allianceToken: 9000,   meat: 1900000,  wood: 1900000,  coal: 396500,  iron: 100000  },
  { label: "12K – 27.5K",           essenceStones: 1,  luckyHeroGearChest: 1, xp10: 3,  xp100: 0, allianceToken: 10000,  meat: 2400000,  wood: 2400000,  coal: 495500,  iron: 125000  },
  { label: "27.5K – 62.5K",         essenceStones: 1,  luckyHeroGearChest: 1, xp10: 4,  xp100: 0, allianceToken: 14500,  meat: 4300000,  wood: 4300000,  coal: 867500,  iron: 218500  },
  { label: "62.5K – 145K",          essenceStones: 2,  luckyHeroGearChest: 1, xp10: 4,  xp100: 0, allianceToken: 18500,  meat: 6100000,  wood: 6100000,  coal: 1200000, iron: 312500  },
  { label: "145K – 325K",           essenceStones: 2,  luckyHeroGearChest: 1, xp10: 5,  xp100: 0, allianceToken: 22000,  meat: 8000000,  wood: 8000000,  coal: 1600000, iron: 406000  },
  { label: "325K – 745K",           essenceStones: 3,  luckyHeroGearChest: 1, xp10: 6,  xp100: 0, allianceToken: 26000,  meat: 9900000,  wood: 9900000,  coal: 1900000, iron: 499500  },
  { label: "745K – 1.7M",           essenceStones: 3,  luckyHeroGearChest: 2, xp10: 7,  xp100: 0, allianceToken: 30000,  meat: 11700000, wood: 11700000, coal: 2300000, iron: 593500  },
  { label: "1.7M – 3.9M",           essenceStones: 4,  luckyHeroGearChest: 2, xp10: 8,  xp100: 0, allianceToken: 35000,  meat: 13800000, wood: 13800000, coal: 2700000, iron: 687000  },
  { label: "3.9M – 8.9M",           essenceStones: 5,  luckyHeroGearChest: 2, xp10: 9,  xp100: 0, allianceToken: 40000,  meat: 15400000, wood: 15400000, coal: 3000000, iron: 781000  },
  { label: "8.9M – 20.5M",          essenceStones: 6,  luckyHeroGearChest: 2, xp10: 0,  xp100: 1, allianceToken: 43000,  meat: 17300000, wood: 17300000, coal: 3400000, iron: 874500  },
  { label: "20.5M – 47M",           essenceStones: 7,  luckyHeroGearChest: 2, xp10: 0,  xp100: 1, allianceToken: 47000,  meat: 19200000, wood: 19200000, coal: 3800000, iron: 968500  },
  { label: "47M – 90M",             essenceStones: 8,  luckyHeroGearChest: 2, xp10: 0,  xp100: 1, allianceToken: 50000,  meat: 21000000, wood: 21000000, coal: 4200000, iron: 1000000 },
  { label: "90M – 175M",            essenceStones: 9,  luckyHeroGearChest: 2, xp10: 0,  xp100: 2, allianceToken: 55000,  meat: 23200000, wood: 23200000, coal: 4600000, iron: 1100000 },
  { label: "175M – 330M",           essenceStones: 10, luckyHeroGearChest: 2, xp10: 0,  xp100: 2, allianceToken: 60000,  meat: 25500000, wood: 25500000, coal: 5100000, iron: 1200000 },
  { label: "330M – 635M",           essenceStones: 11, luckyHeroGearChest: 2, xp10: 0,  xp100: 2, allianceToken: 65000,  meat: 27700000, wood: 27700000, coal: 5500000, iron: 1300000 },
  { label: "635M – 1.2B",           essenceStones: 12, luckyHeroGearChest: 2, xp10: 0,  xp100: 3, allianceToken: 70000,  meat: 29900000, wood: 29900000, coal: 5900000, iron: 1500000 },
  { label: "1.2B – 2.4B",           essenceStones: 13, luckyHeroGearChest: 3, xp10: 0,  xp100: 3, allianceToken: 75600,  meat: 32200000, wood: 32200000, coal: 6400000, iron: 1600000 },
  { label: "2.4B – 4.8B",           essenceStones: 14, luckyHeroGearChest: 3, xp10: 0,  xp100: 4, allianceToken: 80000,  meat: 34100000, wood: 34100000, coal: 6800000, iron: 1700000 },
  { label: "4.8B – 9.6B",           essenceStones: 15, luckyHeroGearChest: 3, xp10: 0,  xp100: 4, allianceToken: 85000,  meat: 35800000, wood: 35800000, coal: 7100000, iron: 1700000 },
  { label: "9.6B – 19.2B",          essenceStones: 16, luckyHeroGearChest: 3, xp10: 0,  xp100: 5, allianceToken: 90000,  meat: 37500000, wood: 37500000, coal: 7500000, iron: 1800000 },
  { label: "19.2B – 38.4B",         essenceStones: 17, luckyHeroGearChest: 3, xp10: 0,  xp100: 5, allianceToken: 95000,  meat: 39400000, wood: 39400000, coal: 7800000, iron: 1900000 },
  { label: "38.4B+",                 essenceStones: 18, luckyHeroGearChest: 3, xp10: 0,  xp100: 6, allianceToken: 100000, meat: 41400000, wood: 41400000, coal: 8200000, iron: 2000000 }
];

// ============================================================
// ACCOUNT MANAGEMENT
// All data is stored per-account in a single localStorage key
// ("wosCalc_accounts") as a JSON array of account objects.
// This is "Option B" — one blob per account — which makes it
// easy to switch between accounts and extend in the future.
// ============================================================

// Creates a unique ID for a new account using the current
// timestamp plus a short random string to avoid collisions.
function generateAccountId() {
  return "acct_" + Date.now() + "_" + Math.random().toString(36).slice(2, 7);
}

// Returns a brand-new account object with default values.
// All fields match what the page uses so nothing is undefined.
function createDefaultAccount(name) {
  return {
    id: generateAccountId(),
    name: name || "Account 1",
    building: "furnace",
    currentLevel: null,
    targetLevel: null,
    supplies: {},
    optionalBuildings: [],
    bearHuntMails: [],
    prereqState: {}
  };
}

// Returns the account object for the currently active account.
// Falls back to the first account if activeAccountId is stale.
function getActiveAccount() {
  return accounts.find(a => a.id === activeAccountId) || accounts[0] || null;
}

// Merges a partial object into the active account and saves
// the whole accounts array to localStorage. "partial" is just
// the fields you want to update — other fields stay the same.
// Object.assign copies all properties from partial onto the account.
function updateActiveAccount(partial) {
  const idx = accounts.findIndex(a => a.id === activeAccountId);
  if (idx < 0) return;
  Object.assign(accounts[idx], partial);
  localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
}

// Called once on page load. Reads any existing accounts from
// localStorage, or creates a fresh default account if none exist.
// Also handles one-time migration: if the old flat keys exist
// (from before multi-account was added) they get moved into
// the default account and then deleted so they don't get re-used.
function initAccounts() {
  const savedAccountsRaw = localStorage.getItem("wosCalc_accounts");
  const savedActiveId = localStorage.getItem("wosCalc_activeAccountId");

  if (savedAccountsRaw) {
    try { accounts = JSON.parse(savedAccountsRaw); } catch (e) { accounts = []; }
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    const defaultAccount = createDefaultAccount("Account 1");
    // Migrate any existing flat localStorage keys into the default account
    const oldBuilding = localStorage.getItem("wosCalc_building");
    if (oldBuilding) {
      defaultAccount.building = oldBuilding;
      defaultAccount.currentLevel = localStorage.getItem("wosCalc_currentLevel");
      defaultAccount.targetLevel = localStorage.getItem("wosCalc_targetLevel");
      try { defaultAccount.optionalBuildings = JSON.parse(localStorage.getItem("wosCalc_optionalBuildings") || "[]"); } catch (e) {}
      try { defaultAccount.supplies = JSON.parse(localStorage.getItem("wosCalc_supplies") || "{}"); } catch (e) {}
      try { defaultAccount.bearHuntMails = JSON.parse(localStorage.getItem("wosCalc_bearHuntMails") || "[]"); } catch (e) {}
      try { defaultAccount.prereqState = JSON.parse(localStorage.getItem("wosCalc_prereqState") || "{}"); } catch (e) {}
      ["wosCalc_building", "wosCalc_currentLevel", "wosCalc_targetLevel",
       "wosCalc_optionalBuildings", "wosCalc_supplies", "wosCalc_bearHuntMails",
       "wosCalc_prereqState"].forEach(k => localStorage.removeItem(k));
    }
    accounts = [defaultAccount];
    localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
  }

  if (savedActiveId && accounts.find(a => a.id === savedActiveId)) {
    activeAccountId = savedActiveId;
  } else {
    activeAccountId = accounts[0].id;
    localStorage.setItem("wosCalc_activeAccountId", activeAccountId);
  }
}

// Creates a new account with the given name, pushes it onto
// the accounts array, saves, and returns the new account object.
function addAccount(name) {
  const newAccount = createDefaultAccount(name);
  accounts.push(newAccount);
  localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
  return newAccount;
}

// Removes the account with the given id. Refuses if it's the
// only account. If the deleted account was active, switches to
// the first remaining account and updates localStorage.
function deleteAccount(id) {
  if (accounts.length <= 1) return false;
  // Array.filter returns a new array excluding the matching item
  accounts = accounts.filter(a => a.id !== id);
  localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
  if (activeAccountId === id) {
    activeAccountId = accounts[0].id;
    localStorage.setItem("wosCalc_activeAccountId", activeAccountId);
  }
  return true;
}

// Updates the name of a specific account and saves.
// The .trim() removes leading/trailing whitespace from user input.
function renameAccount(id, newName) {
  const account = accounts.find(a => a.id === id);
  if (!account) return;
  account.name = newName.trim() || account.name; // Keep old name if new name is blank
  localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
}

// Reads the current state of all form fields and saves them
// into the active account object. Called before switching
// accounts so nothing is lost.
function captureCurrentStateToAccount() {
  // The ?. is "optional chaining" — returns undefined instead of
  // throwing an error if the element doesn't exist yet
  const building = document.getElementById("targetBuilding")?.value;
  const currentLevel = document.getElementById("currentLevel")?.value;
  const targetLevel = document.getElementById("targetLevel")?.value;
  // Build a plain object with every supply field's current value
  const supplies = {};
  SUPPLY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    // Checkboxes store true/false; everything else stores the string value
    supplies[id] = el.type === "checkbox" ? !!el.checked : el.value;
  });
  // The spread [...array] creates a shallow copy so we're not storing
  // a reference to the live array (which could change later)
  updateActiveAccount({
    building,
    currentLevel,
    targetLevel,
    supplies,
    optionalBuildings: [...optionalBuildings],
    bearHuntMails: [...bearHuntMails]
  });
}

// Switches to a different account:
// 1. Save current state into the old account
// 2. Update the active ID
// 3. Load all state from the new account
function switchAccount(id) {
  if (id === activeAccountId) return; // Already on this account, nothing to do
  captureCurrentStateToAccount();
  activeAccountId = id;
  localStorage.setItem("wosCalc_activeAccountId", id);
  loadAllStateFromAccount();
}

// Reads the active account's saved state and populates all
// form fields, dropdowns, optional buildings, and bear hunt rows.
// This is the "restore everything" function used on page load
// and whenever you switch accounts.
function loadAllStateFromAccount() {
  const account = getActiveAccount();
  // Don't try to restore if data isn't loaded yet
  if (!account || !BUILDING_COSTS) return;

  const targetBuildingSelect = document.getElementById("targetBuilding");
  if (account.building && [...targetBuildingSelect.options].map(o => o.value).includes(account.building)) {
    targetBuildingSelect.value = account.building;
  }
  const selectedBuilding = targetBuildingSelect.value;
  updateMainLevelSelectors(selectedBuilding);

  const currentLevelSelect = document.getElementById("currentLevel");
  const targetLevelSelect = document.getElementById("targetLevel");
  if (account.currentLevel && [...currentLevelSelect.options].map(o => o.value).includes(account.currentLevel)) {
    currentLevelSelect.value = account.currentLevel;
  }
  if (account.targetLevel && [...targetLevelSelect.options].map(o => o.value).includes(account.targetLevel)) {
    targetLevelSelect.value = account.targetLevel;
  }

  const currentLevelKey = currentLevelSelect.value;
  const targetLevelKey = targetLevelSelect.value;
  updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelKey);
  updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, targetLevelKey);

  optionalBuildings = Array.isArray(account.optionalBuildings) ? [...account.optionalBuildings] : [];
  renderOptionalBuildings();

  bearHuntMails = Array.isArray(account.bearHuntMails) ? [...account.bearHuntMails] : [];
  renderBearHuntMails();

  const supplies = account.supplies || {};
  SUPPLY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !(id in supplies)) return;
    if (el.type === "checkbox") {
      el.checked = !!supplies[id];
    } else {
      el.value = supplies[id];
    }
  });
  updateCustomChestVisibility();
  renderAccountSelector();
}

// Updates the account dropdown to reflect the current accounts
// list, and disables the delete button if only one account remains.
function renderAccountSelector() {
  const select = document.getElementById("accountSelect");
  if (!select) return;
  // Build the <option> tags from the accounts array
  select.innerHTML = accounts
    .map(a => `<option value="${a.id}"${a.id === activeAccountId ? " selected" : ""}>${a.name}</option>`)
    .join("");
  const deleteBtn = document.getElementById("deleteAccountBtn");
  if (deleteBtn) deleteBtn.disabled = accounts.length <= 1; // Prevent deleting the last account
}


// ============================================================
// LEVEL KEY PARSING & SORTING
// Building levels use string keys like "25", "30-1", "FC1",
// "FC1-2". These functions parse those strings into sortable
// objects so we can put levels in the right order.
// ============================================================

// Parses a level key string into a structured object with
// a "group" number (for ordering regular vs FC levels) and
// major/minor numbers for sorting within a group.
function parseLevelKey(levelKey) {
  const key = String(levelKey || "");

  // Plain integer: "1", "25", "30" → group 1
  if (/^\d+$/.test(key)) {
    return { group: 1, major: Number(key), minor: 0, raw: key };
  }

  // Pre-FC sub-step: "30-1", "30-2" → group 2
  const preFcMatch = key.match(/^(\d+)-(\d+)$/);
  if (preFcMatch) {
    return { group: 2, major: Number(preFcMatch[1]), minor: Number(preFcMatch[2]), raw: key };
  }

  // FC sub-step: "FC1-1", "FC2-3" → group 3
  const fcStepMatch = key.match(/^FC(\d+)-(\d+)$/i);
  if (fcStepMatch) {
    return { group: 3, major: Number(fcStepMatch[1]), minor: Number(fcStepMatch[2]), raw: key };
  }

  // FC milestone: "FC1", "FC2" → group 3, minor 0
  const fcMatch = key.match(/^FC(\d+)$/i);
  if (fcMatch) {
    return { group: 3, major: Number(fcMatch[1]), minor: 0, raw: key };
  }

  // Unknown format — sort last
  return { group: 9, major: Number.MAX_SAFE_INTEGER, minor: 0, raw: key };
}

// Comparator function used with .sort() to order level keys.
// Returns negative if a < b, 0 if equal, positive if a > b.
function compareLevelKeys(a, b) {
  const pa = parseLevelKey(a);
  const pb = parseLevelKey(b);
  if (pa.group !== pb.group) return pa.group - pb.group;
  if (pa.major !== pb.major) return pa.major - pb.major;
  if (pa.minor !== pb.minor) return pa.minor - pb.minor;
  return pa.raw.localeCompare(pb.raw);
}

// Returns all level keys for a building in correct game order.
// Object.keys() gives us the keys in insertion order, but we
// sort them with compareLevelKeys to guarantee correct sequence.
function getBuildingLevelOrder(buildingName) {
  if (!BUILDING_COSTS || !BUILDING_COSTS[buildingName]) return [];
  return Object.keys(BUILDING_COSTS[buildingName]).sort(compareLevelKeys);
}

// Returns the array of level keys the player needs to pass
// through to go from currentLevelKey to targetLevelKey.
// e.g. current=5, target=8 → ["6","7","8"]
// .slice(start, end) extracts a portion of the array.
function getUpgradePathKeys(buildingName, currentLevelKey, targetLevelKey) {
  const levels = getBuildingLevelOrder(buildingName);
  if (!levels.length) return [];

  const curKey = String(currentLevelKey || levels[0]);
  const tgtKey = String(targetLevelKey || levels[0]);
  const currentIdx = Math.max(0, levels.indexOf(curKey));
  const targetIdx = levels.indexOf(tgtKey);
  if (targetIdx < 0 || currentIdx >= targetIdx) return [];

  // slice from one after current up to and including target
  return levels.slice(currentIdx + 1, targetIdx + 1);
}

// Given two level keys for the same building, returns whichever
// is higher (further along in the level order). Used when
// multiple upgrade paths require the same prerequisite building
// at potentially different levels — we want the highest one.
function getHigherRequiredLevel(buildingName, left, right) {
  if (!left) return right;
  if (!right) return left;

  const levels = getBuildingLevelOrder(buildingName);
  if (levels.length) {
    const li = levels.indexOf(String(left));
    const ri = levels.indexOf(String(right));
    if (li >= 0 && ri >= 0) return ri > li ? String(right) : String(left);
  }

  // Fallback: compare as plain numbers if not found in the level array
  const leftNumeric = Number(String(left));
  const rightNumeric = Number(String(right));
  if (!Number.isNaN(leftNumeric) && !Number.isNaN(rightNumeric)) {
    return rightNumeric > leftNumeric ? String(right) : String(left);
  }

  return String(right);
}

// Returns the next known level for a building. If the given level is
// already the highest one, return that same level as a safe clamp.
function getNextBuildingLevel(buildingName, currentLevel) {
  const levels = getBuildingLevelOrder(buildingName);
  const currentIndex = levels.indexOf(String(currentLevel));
  if (currentIndex < 0) return levels[0] || "1";
  return levels[Math.min(currentIndex + 1, levels.length - 1)] || String(currentLevel);
}

// Converts an internal level key like "FC1-2" into a human-
// friendly label like "FC 1-2" for display in dropdowns.
function formatLevelLabel(levelKey) {
  const key = String(levelKey || "");
  const fcStepMatch = key.match(/^FC(\d+)-(\d+)$/i);
  if (fcStepMatch) return `FC ${fcStepMatch[1]}-${fcStepMatch[2]}`;

  const fcMatch = key.match(/^FC(\d+)$/i);
  if (fcMatch) return `FC ${fcMatch[1]}`;

  return key; // Plain numbers like "25" pass through unchanged
}

// ============================================================
// SAVE / LOAD — ACCOUNT-BACKED WRAPPERS
// All saving is now done by writing to the active account blob.
// These wrapper functions keep the same names as the old flat
// localStorage functions so the rest of the code didn't need
// to change when we added multi-account support.
// ============================================================

// Saving the target building just snapshots all form state
// into the current account.
function saveTargetBuildingState() {
  captureCurrentStateToAccount();
}

// Returns the saved building/level from the active account
// in the same shape the old code expected.
function loadTargetBuildingState() {
  const account = getActiveAccount();
  return {
    savedBuilding: account?.building || null,
    savedCurrent: account?.currentLevel || null,
    savedTarget: account?.targetLevel || null
  };
}

// Saving optional buildings snapshots all form state.
function saveOptionalBuildings() {
  captureCurrentStateToAccount();
}

// Reads optional buildings from the active account and
// re-renders the list on the page.
function loadOptionalBuildings() {
  const account = getActiveAccount();
  optionalBuildings = Array.isArray(account?.optionalBuildings) ? [...account.optionalBuildings] : [];
  renderOptionalBuildings();
}

// Theme is global (not per-account) so it still uses its own key.
function saveThemePreference(theme) {
  localStorage.setItem("wosCalc_theme", theme);
}

function loadThemePreference() {
  return localStorage.getItem("wosCalc_theme") || "wos";
}

// Saving supplies snapshots all form state.
function saveSuppliesState() {
  captureCurrentStateToAccount();
}

// Reads supply field values from the active account and
// populates every form field listed in SUPPLY_FIELD_IDS.
function loadSuppliesState() {
  const account = getActiveAccount();
  const supplies = account?.supplies || {};
  SUPPLY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !(id in supplies)) return;
    if (el.type === "checkbox") {
      el.checked = !!supplies[id];
    } else {
      el.value = supplies[id];
    }
  });
}

// Attaches input/change listeners to every supply field so
// that any edit automatically saves to the active account.
// We use "input" for text/number fields (fires on every keystroke)
// and "change" for selects and checkboxes (fires on selection).
function attachSupplyPersistenceListeners() {
  SUPPLY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const eventName = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";
    el.addEventListener(eventName, saveSuppliesState);
  });
}

// ============================================================
// CUSTOM CHEST UI
// ============================================================

// Shows or hides the custom chest input section based on
// whether the "Use Custom Resource Chests" checkbox is checked.
function updateCustomChestVisibility() {
  const toggle = document.getElementById("useCustomChests");
  const section = document.getElementById("customChestSection");
  if (!toggle || !section) return;
  section.style.display = toggle.checked ? "block" : "none";
}

// Reads all six chest count inputs (L1/L2/L3 × secured/unsecured)
// and returns them as a nested object for use in the chest planner.
function getCustomChestCounts() {
  const l1Secured = Math.max(0, parseInt(document.getElementById("customChestL1SecuredCount")?.value || "0", 10) || 0);
  const l1Unsecured = Math.max(0, parseInt(document.getElementById("customChestL1UnsecuredCount")?.value || "0", 10) || 0);
  const l2Secured = Math.max(0, parseInt(document.getElementById("customChestL2SecuredCount")?.value || "0", 10) || 0);
  const l2Unsecured = Math.max(0, parseInt(document.getElementById("customChestL2UnsecuredCount")?.value || "0", 10) || 0);
  const l3Secured = Math.max(0, parseInt(document.getElementById("customChestL3SecuredCount")?.value || "0", 10) || 0);
  const l3Unsecured = Math.max(0, parseInt(document.getElementById("customChestL3UnsecuredCount")?.value || "0", 10) || 0);

  return {
    1: { unsecured: l1Unsecured, secured: l1Secured },
    2: { unsecured: l2Unsecured, secured: l2Secured },
    3: { unsecured: l3Unsecured, secured: l3Secured }
  };
}

// Balanced chest algorithm that spreads usage across resources
// based on how much of each original deficit is still uncovered.
//
// Strategy:
//   - Always use unsecured chests before secured ones (same level)
//   - Work from highest level (L3) down to lowest (L1)
//   - Assign one chest at a time so different resources can interleave
//   - Prefer the resource with the lowest completion percentage,
//     which keeps the recommendation visually more balanced
//
// Returns allocations (how many of each chest per resource),
// provided (total resources each type contributed),
// remainingDeficits (anything still uncovered), and
// countsLeft (leftover chests not needed).
function recommendCustomChestUsage(deficits, availableCounts) {
  // Work on a copy so we don't modify the original deficit object
  const remainingDeficits = {
    meat: Math.max(0, deficits.meat || 0),
    wood: Math.max(0, deficits.wood || 0),
    coal: Math.max(0, deficits.coal || 0),
    iron: Math.max(0, deficits.iron || 0)
  };

  // Keep the starting values so we can compare percentage covered,
  // not just raw numbers. That avoids dumping all chests into one resource first.
  const startingDeficits = { ...remainingDeficits };

  // Track how many of each chest level we assigned to each resource
  const allocations = {
    meat: { 1: 0, 2: 0, 3: 0 },
    wood: { 1: 0, 2: 0, 3: 0 },
    coal: { 1: 0, 2: 0, 3: 0 },
    iron: { 1: 0, 2: 0, 3: 0 }
  };

  const provided = { meat: 0, wood: 0, coal: 0, iron: 0 };
  // Working copy of available chest counts
  const countsLeft = {
    1: {
      unsecured: availableCounts[1]?.unsecured || 0,
      secured: availableCounts[1]?.secured || 0
    },
    2: {
      unsecured: availableCounts[2]?.unsecured || 0,
      secured: availableCounts[2]?.secured || 0
    },
    3: {
      unsecured: availableCounts[3]?.unsecured || 0,
      secured: availableCounts[3]?.secured || 0
    }
  };

  // Helper: drain one chest from a level, unsecured first
  const consumeChest = (level) => {
    if (countsLeft[level].unsecured > 0) {
      countsLeft[level].unsecured -= 1;
      return 1;
    }
    if (countsLeft[level].secured > 0) {
      countsLeft[level].secured -= 1;
      return 1;
    }
    return 0;
  };

  // Process L3 first (most value per chest), then L2, then L1
  [3, 2, 1].forEach(level => {
    // Keep assigning chests as long as any are available at this level
    while (countsLeft[level].unsecured + countsLeft[level].secured > 0) {
      let pickResource = null;
      let highestUncoveredShare = -1;
      let highestChestNeed = -1;

      // Find whichever resource has the biggest share of its original
      // deficit still uncovered. Use chest-need as a tie-breaker.
      BASIC_RESOURCES.forEach(resource => {
        const need = remainingDeficits[resource];
        if (need <= 0) return;
        const uncoveredShare = startingDeficits[resource] > 0
          ? need / startingDeficits[resource]
          : 0;
        const chestNeed = need / CUSTOM_CHEST_VALUES[level][resource];
        if (
          uncoveredShare > highestUncoveredShare ||
          (uncoveredShare === highestUncoveredShare && chestNeed > highestChestNeed)
        ) {
          highestUncoveredShare = uncoveredShare;
          highestChestNeed = chestNeed;
          pickResource = resource;
        }
      });

      // If no resource has a remaining deficit, stop assigning chests at this level
      if (!pickResource) break;

      const consumed = consumeChest(level);
      if (consumed <= 0) break;

      const chestValue = CUSTOM_CHEST_VALUES[level][pickResource];
      allocations[pickResource][level] += consumed;
      const gained = consumed * chestValue;
      provided[pickResource] += gained;
      remainingDeficits[pickResource] = Math.max(0, remainingDeficits[pickResource] - gained);
    }
  });

  return { allocations, provided, remainingDeficits, countsLeft };
}

// ============================================================
// THEME
// ============================================================

// Applies a theme by setting the data-theme attribute on
// <body>, which CSS uses to switch variable values.
function applyTheme(theme) {
  const safeTheme = theme === "dark" ? "dark" : "wos";
  document.body.dataset.theme = safeTheme;
  const button = document.getElementById("themeToggleBtn");
  if (button) {
    button.textContent = safeTheme === "dark" ? "Light Mode" : "Dark Mode";
  }
}

// ============================================================
// PREREQUISITE STATE — SAVE / LOAD
// The prerequisite section lets you set current and target
// levels for each required building. Those selections are saved
// per-building inside the active account's prereqState object.
// ============================================================

// Saves the prerequisite current/target selections for one
// building into the active account.
function savePrerequisiteState(buildingName, state) {
  const account = getActiveAccount();
  if (!account) return;
  if (!account.prereqState) account.prereqState = {};
  account.prereqState[buildingName] = state;
  updateActiveAccount({ prereqState: account.prereqState });
}

// Returns the saved prerequisite state for one building,
// or an empty object if nothing has been saved yet.
function loadPrerequisiteState(buildingName) {
  const account = getActiveAccount();
  const prereqState = account?.prereqState || {};
  return prereqState[buildingName] || {};
}

// ============================================================
// OPTIONAL BUILDINGS — RENDER & MANAGE
// ============================================================

// Builds the HTML option list for the building dropdown,
// marking the given value as selected. Used when rendering
// each optional building row.
function getAllBuildingOptionsHTML(selectedValue) {
  const buildingSelect = document.getElementById("targetBuilding");
  if (!buildingSelect) return "";
  return Array.from(buildingSelect.options)
    .map(opt => `<option value="${opt.value}"${opt.value === selectedValue ? " selected" : ""}>${opt.text}</option>`)
    .join("");
}

// Rebuilds the entire optional buildings section from the
// optionalBuildings array. Uses template literals (backtick
// strings) to generate HTML, then sets it all at once with
// innerHTML. After setting innerHTML, event listeners must be
// re-attached because the old DOM nodes were replaced.
function renderOptionalBuildings() {
  const container = document.getElementById("optionalBuildingsContainer");
  if (optionalBuildings.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  optionalBuildings.forEach((item, index) => {
    const buildingLevels = getBuildingLevelOrder(item.building);
    const buildingOptions = getAllBuildingOptionsHTML(item.building);
    const currentOptions = buildingLevels
      .map(lvl => `<option value="${lvl}"${lvl === item.currentLevel ? " selected" : ""}>${formatLevelLabel(lvl)}</option>`)
      .join("");
    const targetOptions = buildingLevels
      .map(lvl => `<option value="${lvl}"${lvl === item.targetLevel ? " selected" : ""}>${formatLevelLabel(lvl)}</option>`)
      .join("");

    html += `
      <div class="card-panel" style="margin-bottom: 12px;">
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 8px;">
          <div style="flex: 1 1 200px; min-width: 160px;">
            <label for="optionalBuilding_${index}">Building</label>
            <select id="optionalBuilding_${index}" class="optionalBuildingSelect" data-index="${index}" style="width: 100%;">
              ${buildingOptions}
            </select>
          </div>
          <button type="button" class="removeOptionalBtn" data-index="${index}" style="background-color: #ff6b6b; color: white; padding: 10px 14px; border: none; border-radius: 3px; cursor: pointer; font-size: 14px;">Remove</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 1 1 150px; min-width: 130px;">
            <label for="optionalCurrent_${index}">Current Level</label>
            <select id="optionalCurrent_${index}" class="optionalCurrentLevel" data-index="${index}">
              ${currentOptions}
            </select>
          </div>
          <div style="flex: 1 1 150px; min-width: 130px;">
            <label for="optionalTarget_${index}">Target Level</label>
            <select id="optionalTarget_${index}" class="optionalTargetLevel" data-index="${index}">
              ${targetOptions}
            </select>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Re-attach remove button listeners
  document.querySelectorAll(".removeOptionalBtn").forEach(btn => {
    btn.addEventListener("click", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      optionalBuildings.splice(idx, 1);
      saveOptionalBuildings();
      renderOptionalBuildings();
    });
  });

  // Re-attach building dropdown listeners — when the building changes,
  // reset levels to the first available ones for that building
  document.querySelectorAll(".optionalBuildingSelect").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      const selectedBuilding = this.value;
      optionalBuildings[idx].building = selectedBuilding;
      const levels = getBuildingLevelOrder(selectedBuilding);
      optionalBuildings[idx].currentLevel = levels[0] || "1";
      optionalBuildings[idx].targetLevel = getNextBuildingLevel(selectedBuilding, optionalBuildings[idx].currentLevel);
      saveOptionalBuildings();
      renderOptionalBuildings();
    });
  });

  // Re-attach current/target level listeners
  document.querySelectorAll(".optionalCurrentLevel").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      const item = optionalBuildings[idx];
      item.currentLevel = this.value;

      const levels = getBuildingLevelOrder(item.building);
      const currentIndex = levels.indexOf(item.currentLevel);
      const targetIndex = levels.indexOf(item.targetLevel);

      // Only auto-correct the target when it would otherwise end up
      // below the current level. If the user is lowering current to fix
      // a mistake, keep their existing target choice intact.
      if (targetIndex < 0 || (currentIndex >= 0 && targetIndex < currentIndex)) {
        item.targetLevel = getNextBuildingLevel(item.building, item.currentLevel);
      }

      saveOptionalBuildings();
      renderOptionalBuildings();
    });
  });

  document.querySelectorAll(".optionalTargetLevel").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      const item = optionalBuildings[idx];
      item.targetLevel = this.value;

      const levels = getBuildingLevelOrder(item.building);
      const currentIndex = levels.indexOf(item.currentLevel);
      const targetIndex = levels.indexOf(item.targetLevel);
      if (currentIndex >= 0 && targetIndex >= 0 && targetIndex < currentIndex) {
        item.targetLevel = item.currentLevel;
      }

      saveOptionalBuildings();
      renderOptionalBuildings();
    });
  });
}

// Adds a new optional building row defaulting to the currently
// selected target building with its first two levels.
function addOptionalBuilding() {
  const selectedBuilding = document.getElementById("targetBuilding")?.value || "furnace";
  const levels = getBuildingLevelOrder(selectedBuilding);
  if (levels.length < 2) {
    alert("Cannot add optional building: no level data available");
    return;
  }
  optionalBuildings.push({
    building: selectedBuilding,
    currentLevel: levels[0],
    targetLevel: getNextBuildingLevel(selectedBuilding, levels[0])
  });
  saveOptionalBuildings();
  renderOptionalBuildings();
}

// ============================================================
// BEAR HUNT MAIL — SAVE / LOAD / RENDER
// ============================================================

// Saving bear hunt mails snapshots all form state.
function saveBearHuntMails() {
  captureCurrentStateToAccount();
}

// Reads bear hunt rows from the active account and re-renders.
function loadBearHuntMails() {
  const account = getActiveAccount();
  bearHuntMails = Array.isArray(account?.bearHuntMails) ? [...account.bearHuntMails] : [];
  renderBearHuntMails();
}

// Rebuilds the bear hunt mail rows from the bearHuntMails array.
// Same pattern as renderOptionalBuildings — generate HTML,
// set innerHTML, then re-attach event listeners.
function renderBearHuntMails() {
  const container = document.getElementById("bearHuntMailsContainer");
  if (!container) return;
  if (bearHuntMails.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  bearHuntMails.forEach((mail, index) => {
    const tierOptions = BEAR_HUNT_TIERS
      .map((tier, i) => `<option value="${i}"${i === mail.tierIndex ? " selected" : ""}>${tier.label}</option>`)
      .join("");

    html += `
      <div class="card-panel" style="margin-bottom: 10px;">
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 2 1 200px; min-width: 160px;">
            <label for="bearHuntTier_${index}">Damage Tier</label>
            <select id="bearHuntTier_${index}" class="bearHuntTierSelect" data-index="${index}" style="width: 100%;">
              ${tierOptions}
            </select>
          </div>
          <div style="flex: 1 1 100px; min-width: 80px;">
            <label for="bearHuntCount_${index}">Mail</label>
            <input id="bearHuntCount_${index}" type="number" min="0" value="${mail.count || 1}" class="bearHuntCountInput" data-index="${index}" style="width: 100%;" />
          </div>
          <button type="button" class="removeBearHuntBtn" data-index="${index}" style="background-color: #ff6b6b; color: white; padding: 10px 14px; border: none; border-radius: 3px; cursor: pointer; font-size: 14px;">Remove</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Re-attach remove, tier change, and count change listeners
  document.querySelectorAll(".removeBearHuntBtn").forEach(btn => {
    btn.addEventListener("click", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      bearHuntMails.splice(idx, 1);
      saveBearHuntMails();
      renderBearHuntMails();
    });
  });

  document.querySelectorAll(".bearHuntTierSelect").forEach(sel => {
    sel.addEventListener("change", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      bearHuntMails[idx].tierIndex = parseInt(this.value);
      saveBearHuntMails();
    });
  });

  document.querySelectorAll(".bearHuntCountInput").forEach(inp => {
    inp.addEventListener("input", function() {
      const idx = parseInt(this.getAttribute("data-index"));
      bearHuntMails[idx].count = Math.max(0, parseInt(this.value) || 0);
      saveBearHuntMails();
    });
  });
}

// Adds a new bear hunt row defaulting to tier 0 (lowest), count 1.
function addBearHuntMail() {
  bearHuntMails.push({ tierIndex: 0, count: 1 });
  saveBearHuntMails();
  renderBearHuntMails();
}

// Sums up all the resource rewards across every bear hunt mail row.
// Returns a single totals object so the calculate handler can
// add these amounts to the effective backpack in one step.
function getBearHuntResourceTotals() {
  const totals = { meat: 0, wood: 0, coal: 0, iron: 0, essenceStones: 0, luckyHeroGearChest: 0, xp10: 0, xp100: 0, allianceToken: 0 };
  for (const mail of bearHuntMails) {
    const tier = BEAR_HUNT_TIERS[mail.tierIndex];
    if (!tier) continue;
    const count = Math.max(0, mail.count || 0);
    totals.meat += tier.meat * count;
    totals.wood += tier.wood * count;
    totals.coal += tier.coal * count;
    totals.iron += tier.iron * count;
    totals.essenceStones += tier.essenceStones * count;
    totals.luckyHeroGearChest += tier.luckyHeroGearChest * count;
    totals.xp10 += tier.xp10 * count;
    totals.xp100 += tier.xp100 * count;
    totals.allianceToken += tier.allianceToken * count;
  }
  return totals;
}

// ============================================================
// PREREQUISITE PANEL HELPERS
// ============================================================

// Sets every prerequisite "Current Level" dropdown to the
// given levelKey (if that level exists in the dropdown).
// Used by the "Set All" batch button.
function setAllPrerequisiteCurrentLevels(levelKey) {
  const currentSelectors = document.querySelectorAll("#prerequisitesContainer select[id$='CurrentLevel']");
  currentSelectors.forEach(sel => {
    // Check if the desired level exists as an option before setting it
    if ([...sel.options].some(option => option.value === levelKey)) {
      sel.value = levelKey;
    }
  });
}

// Populates a <select> element with options from an array,
// preserving the previously selected value if possible.
function setSelectOptions(selectEl, optionValues, selectedValue) {
  const normalized = optionValues.map(v => String(v));
  selectEl.innerHTML = normalized
    .map(v => `<option value="${v}">${formatLevelLabel(v)}</option>`)
    .join("");

  const preferred = String(selectedValue || "");
  if (preferred && normalized.includes(preferred)) {
    selectEl.value = preferred;
  } else if (normalized.length) {
    selectEl.value = normalized[0]; // Default to first option
  }
}

// ============================================================
// FORMATTING HELPERS
// ============================================================

// Converts a raw number of seconds into a human-readable
// duration string like "2d 4h 15m 30s".
// The modulo operator (%) gives us the remainder after dividing,
// so e.g. (totalSeconds % 86400) gives seconds within the current day.
function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds || 0));
  const days    = Math.floor(seconds / 86400);
  const hours   = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs    = seconds % 60;

  const parts = [];
  if (days)    parts.push(`${days}d`);
  if (hours)   parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (secs || !parts.length) parts.push(`${secs}s`); // Always show at least "0s"
  return parts.join(" ");
}

// Parses a resource amount string like "953.14M", "2.5K", or
// "1.2B" into a plain integer. Also accepts raw numbers.
// The regex matches an optional decimal number followed by
// an optional K/M/B suffix. Returns 0 for anything invalid.
function parseResourceAmount(rawInput) {
  const text = String(rawInput || "").trim().replace(/,/g, "").toUpperCase();
  if (!text) return 0;

  const match = text.match(/^([0-9]*\.?[0-9]+)\s*([KMB])?$/);
  if (!match) return 0;

  const value = parseFloat(match[1]);
  if (Number.isNaN(value) || value < 0) return 0;

  const suffix = match[2] || "";
  // B = billion, M = million, K = thousand
  const multiplier = suffix === "B" ? 1000000000 : (suffix === "M" ? 1000000 : (suffix === "K" ? 1000 : 1));
  return Math.round(value * multiplier);
}

// Validation helper for the same resource format accepted by
// parseResourceAmount. Empty input is allowed and treated as zero.
function isValidResourceAmountInput(rawInput) {
  const text = String(rawInput || "").trim().replace(/,/g, "").toUpperCase();
  if (!text) return true;
  return /^([0-9]*\.?[0-9]+)\s*([KMB])?$/.test(text);
}

// Validation helper for plain number inputs. This catches negative
// or malformed text that some browsers still allow in number fields.
function isValidNonNegativeNumberInput(rawInput, allowDecimal = false) {
  const text = String(rawInput || "").trim();
  if (!text) return true;
  const pattern = allowDecimal ? /^(?:\d+|\d*\.\d+)$/ : /^\d+$/;
  return pattern.test(text);
}

// Focused validation pass for the main calculation action.
function getCalculationValidationError() {
  const resourceFields = [
    ["ownedMeat", "Meat"],
    ["ownedWood", "Wood"],
    ["ownedCoal", "Coal"],
    ["ownedIron", "Iron"],
    ["ownedFireCrystals", "Fire Crystals"],
    ["ownedRefinedFireCrystals", "Refined Fire Crystals"]
  ];

  for (const [id, label] of resourceFields) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (!isValidResourceAmountInput(el.value)) {
      return `${label} must be a non-negative number. You can use plain numbers or K/M/B suffixes.`;
    }
  }

  const numberFields = [
    ["generalSpeedups", "General Speedups", false],
    ["constructionSpeedups", "Construction Speedups", false],
    ["constructionSpeedPct", "Construction Speed", true],
    ["positionBuffPct", "Position Buff", true],
    ["customChestL1SecuredCount", "Level 1 secured custom chests", false],
    ["customChestL1UnsecuredCount", "Level 1 unsecured custom chests", false],
    ["customChestL2SecuredCount", "Level 2 secured custom chests", false],
    ["customChestL2UnsecuredCount", "Level 2 unsecured custom chests", false],
    ["customChestL3SecuredCount", "Level 3 secured custom chests", false],
    ["customChestL3UnsecuredCount", "Level 3 unsecured custom chests", false]
  ];

  for (const [id, label, allowDecimal] of numberFields) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (!isValidNonNegativeNumberInput(el.value, allowDecimal)) {
      return `${label} must be a non-negative ${allowDecimal ? "number" : "whole number"}.`;
    }
  }

  for (const item of optionalBuildings) {
    const levels = getBuildingLevelOrder(item.building);
    const currentIndex = levels.indexOf(String(item.currentLevel));
    const targetIndex = levels.indexOf(String(item.targetLevel));
    if (!BUILDING_COSTS[item.building] || currentIndex < 0 || targetIndex < 0) {
      return "One optional building has an invalid building or level selection. Please reselect it and try again.";
    }
    if (targetIndex < currentIndex) {
      const buildingLabel = String(item.building).replace(/_/g, " ").toUpperCase();
      return `${buildingLabel}: target level cannot be below current level.`;
    }
  }

  for (const mail of bearHuntMails) {
    const tierIndex = Number(mail.tierIndex);
    const count = Number(mail.count);
    if (!Number.isInteger(tierIndex) || tierIndex < 0 || tierIndex >= BEAR_HUNT_TIERS.length) {
      return "One Bear Hunt Mail row has an invalid damage tier. Please reselect it and try again.";
    }
    if (!Number.isFinite(count) || count < 0) {
      return "Bear Hunt Mail counts must be 0 or higher.";
    }
  }

  return null;
}

// ============================================================
// PREREQUISITE CALCULATION
// Looks at every level in the upgrade path and collects all
// required buildings, keeping the highest required level for
// each one in case different upgrade steps need different levels.
// ============================================================

// Returns a Map of { buildingName → highestRequiredLevel }
// for all prerequisites needed across the full upgrade path.
function getAggregatedPrerequisites(selectedBuilding, currentLevelKey, targetLevelKey) {
  const result = new Map();
  if (!PREREQUISITES || !PREREQUISITES[selectedBuilding]) return result;

  const ruleSet = PREREQUISITES[selectedBuilding];
  const upgradeKeys = getUpgradePathKeys(selectedBuilding, currentLevelKey, targetLevelKey);

  // Loop every level in the upgrade path and collect its requirements
  for (const levelKey of upgradeKeys) {
    const levelReqs = (ruleSet.fcLevels && ruleSet.fcLevels[levelKey])
      || (ruleSet.levels && ruleSet.levels[levelKey])
      || [];

    for (const req of levelReqs) {
      const building = req.building;
      const requiredLevel = req.tier ? String(req.tier) : String(req.level || 1);
      const prev = result.get(building);
      result.set(building, getHigherRequiredLevel(building, prev, requiredLevel));
    }
  }

  if (result.size) return result;

  // If no per-level rules matched, try the legacy schema (a single list
  // where required level = target level + an offset)
  if (ruleSet.levels || ruleSet.fcLevels) return result;

  // Legacy schema: single list with target-level offsets.
  const legacyRules = Array.isArray(ruleSet) ? ruleSet : (ruleSet.legacy || []);
  const targetNumeric = parseInt(String(targetLevelKey || ""), 10);
  if (Number.isNaN(targetNumeric)) return result;

  for (const req of legacyRules) {
    const building = req.building;
    const requiredLevel = String(Math.max(1, targetNumeric + Number(req.levelOffset || 0)));
    const prev = result.get(building);
    result.set(building, getHigherRequiredLevel(building, prev, requiredLevel));
  }

  return result;
}

// ============================================================
// FIRE CRYSTAL VISIBILITY
// Shows the Fire Crystal / Refined Fire Crystal input fields
// only when the selected upgrade path actually needs them.
// ============================================================

// Returns true if any level in the upgrade path requires
// fire crystals or refined fire crystals.
function requiresFireCrystalSupplies(selectedBuilding, currentLevelKey, targetLevelKey) {
  if (!BUILDING_COSTS || !BUILDING_COSTS[selectedBuilding]) return false;
  const upgradePath = getUpgradePathKeys(selectedBuilding, currentLevelKey, targetLevelKey);
  return upgradePath.some(levelKey => {
    const levelData = BUILDING_COSTS[selectedBuilding][levelKey] || {};
    return (levelData.fireCrystals || 0) > 0 || (levelData.refinedFireCrystals || 0) > 0;
  });
}

// Shows or hides the FC supplies section based on the result above.
function updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, targetLevelKey) {
  const section = document.getElementById("fcSuppliesSection");
  if (!section) return;
  const shouldShow = requiresFireCrystalSupplies(selectedBuilding, currentLevelKey, targetLevelKey);
  section.style.display = shouldShow ? "block" : "none";
}

// ============================================================
// LEVEL SELECTOR UPDATES
// Keeps the current/target level dropdowns in sync with
// whichever building is selected.
// ============================================================

// Rebuilds both level dropdowns for the selected building,
// trying to preserve the previously selected values.
// If the target ends up below the current level, it's clamped up.
function updateMainLevelSelectors(selectedBuilding) {
  const currentLevelSelect = document.getElementById("currentLevel");
  const targetLevelSelect = document.getElementById("targetLevel");
  const options = getBuildingLevelOrder(selectedBuilding);
  if (!options.length) return;

  const existingCurrent = currentLevelSelect.value;
  const existingTarget = targetLevelSelect.value;
  setSelectOptions(currentLevelSelect, options, existingCurrent || options[0]);
  setSelectOptions(targetLevelSelect, options, existingTarget || options[Math.min(1, options.length - 1)]);

  const currentIdx = options.indexOf(currentLevelSelect.value);
  const targetIdx = options.indexOf(targetLevelSelect.value);
  if (targetIdx < currentIdx) {
    targetLevelSelect.value = currentLevelSelect.value;
  }
}

// ============================================================
// PREREQUISITES PANEL — RENDER
// Builds the "Required Buildings" section dynamically based on
// what getAggregatedPrerequisites() returns for the current
// building and level selection.
// ============================================================

// Show/hide prerequisites for a given building and target level
function updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelKey) {
  const prereqsFieldset = document.getElementById("prerequisitesSection");
  const prereqsContainer = document.getElementById("prerequisitesContainer");

  if (PREREQUISITES && PREREQUISITES[selectedBuilding]) {
    const prereqMap = getAggregatedPrerequisites(selectedBuilding, currentLevelKey, targetLevelKey);

    let prereqsHTML = `
      <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 1 1 220px; min-width: 140px;">
          <label for="prereqBatchCurrent">Set all current levels</label>
          <select id="prereqBatchCurrent"></select>
        </div>
        <button id="setAllPrereqCurrentBtn" type="button" style="background-color: #4a90e2; color: white; padding: 10px 16px; border: none; border-radius: 4px; cursor: pointer;">Set All</button>
      </div>
    `;

    const savedPrereqState = loadPrerequisiteState(selectedBuilding);

    for (const [buildingName, requiredLevel] of prereqMap.entries()) {
      const hasCostData = !!(BUILDING_COSTS && BUILDING_COSTS[buildingName]);
      const buildingLabel = buildingName.replace("_", " ").toUpperCase();
      const existingCurrentInput = document.getElementById(`${buildingName}CurrentLevel`);
      const existingTargetInput = document.getElementById(`${buildingName}Level`);
      const levelOptions = getBuildingLevelOrder(buildingName);
      const savedState = savedPrereqState[buildingName] || {};
      const savedCurrentLevel = String(savedState.currentLevel || "");
      const savedTargetLevel = String(savedState.targetLevel || "");
      const existingCurrentLevel = existingCurrentInput ? String(existingCurrentInput.value) : savedCurrentLevel;
      const existingTargetLevel = existingTargetInput ? String(existingTargetInput.value) : savedTargetLevel;
      const requiredLevelKey = String(requiredLevel);
      const fallbackCurrent = levelOptions[0] || "1";
      const fallbackTarget = levelOptions.includes(requiredLevelKey) ? requiredLevelKey : (levelOptions[levelOptions.length - 1] || requiredLevelKey);
      const chosenCurrent = levelOptions.includes(existingCurrentLevel) ? existingCurrentLevel : fallbackCurrent;
      const chosenTargetRaw = levelOptions.includes(existingTargetLevel) ? existingTargetLevel : fallbackTarget;
      const currentIdx = levelOptions.indexOf(chosenCurrent);
      const targetIdx = levelOptions.indexOf(chosenTargetRaw);
      const chosenTarget = (targetIdx >= currentIdx && targetIdx >= 0) ? chosenTargetRaw : chosenCurrent;

      const renderOptions = (selected) => levelOptions
        .map(opt => `<option value="${opt}"${opt === selected ? " selected" : ""}>${formatLevelLabel(opt)}</option>`)
        .join("");

      if (hasCostData) {
        prereqsHTML += `
          <div style="margin-bottom: 10px;">
            <div style="font-weight: 700; margin-bottom: 6px;">${buildingLabel}</div>
            <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
              <div style="flex: 1 1 160px; min-width: 140px;">
                <label for="${buildingName}CurrentLevel">Current Level</label>
                <select
                  id="${buildingName}CurrentLevel" 
                  data-building="${buildingName}"
                >${renderOptions(chosenCurrent)}</select>
              </div>
              <div style="flex: 1 1 160px; min-width: 140px;">
                <label for="${buildingName}Level">Required Level</label>
                <select
                  id="${buildingName}Level" 
                  data-building="${buildingName}"
                >${renderOptions(chosenTarget)}</select>
              </div>
            </div>
          </div>
        `;
      } else {
        prereqsHTML += `
          <div class="card-panel" style="margin-bottom: 10px; padding: 10px;">
            <strong>${buildingLabel}</strong><br>
            <div style="margin-top: 6px;">Required Level: ${requiredLevel}</div>
          </div>
        `;
      }
    }

    prereqsContainer.innerHTML = prereqsHTML;

    const prereqBatchCurrent = document.getElementById("prereqBatchCurrent");
    if (prereqBatchCurrent) {
      const options = getBuildingLevelOrder(selectedBuilding);
      setSelectOptions(prereqBatchCurrent, options, currentLevelKey);
    }

    const setAllButton = document.getElementById("setAllPrereqCurrentBtn");
    if (setAllButton) {
      setAllButton.addEventListener("click", function() {
        const selectedValue = document.getElementById("prereqBatchCurrent").value;
        setAllPrerequisiteCurrentLevels(selectedValue);

        const savedState = loadPrerequisiteState(selectedBuilding);
        document.querySelectorAll("#prerequisitesContainer select[id$='CurrentLevel']").forEach(sel => {
          const prereqBuilding = sel.dataset.building;
          if (!prereqBuilding) return;
          if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};
          savedState[prereqBuilding].currentLevel = sel.value;
        });
        savePrerequisiteState(selectedBuilding, savedState);
      });
    }

    document.querySelectorAll("#prerequisitesContainer select[data-building][id$='CurrentLevel']").forEach(sel => {
      sel.addEventListener("change", function() {
        const prereqBuilding = this.dataset.building;
        if (!prereqBuilding) return;
        const savedState = loadPrerequisiteState(selectedBuilding);
        if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};
        savedState[prereqBuilding].currentLevel = this.value;

        const levelOptions = getBuildingLevelOrder(prereqBuilding);
        const currentIndex = levelOptions.indexOf(this.value);
        const targetSelect = document.getElementById(`${prereqBuilding}Level`);
        const targetValue = targetSelect ? String(targetSelect.value) : String(savedState[prereqBuilding].targetLevel || "");
        const targetIndex = levelOptions.indexOf(targetValue);
        if (targetSelect && currentIndex >= 0 && targetIndex >= 0 && targetIndex < currentIndex) {
          targetSelect.value = this.value;
          savedState[prereqBuilding].targetLevel = this.value;
        }

        savePrerequisiteState(selectedBuilding, savedState);
      });
    });

    document.querySelectorAll("#prerequisitesContainer select[data-building][id$='Level']").forEach(sel => {
      sel.addEventListener("change", function() {
        const prereqBuilding = this.dataset.building;
        if (!prereqBuilding) return;
        const savedState = loadPrerequisiteState(selectedBuilding);
        if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};

        const levelOptions = getBuildingLevelOrder(prereqBuilding);
        const currentSelect = document.getElementById(`${prereqBuilding}CurrentLevel`);
        const currentValue = currentSelect ? String(currentSelect.value) : String(savedState[prereqBuilding].currentLevel || "");
        const currentIndex = levelOptions.indexOf(currentValue);
        const targetIndex = levelOptions.indexOf(this.value);

        savedState[prereqBuilding].targetLevel = (currentIndex >= 0 && targetIndex >= 0 && targetIndex < currentIndex)
          ? currentValue
          : this.value;

        if (savedState[prereqBuilding].targetLevel !== this.value) {
          this.value = savedState[prereqBuilding].targetLevel;
        }

        savePrerequisiteState(selectedBuilding, savedState);
      });
    });

    prereqsFieldset.style.display = "block";
  } else {
    // No prerequisites for this building — hide the section
    prereqsContainer.innerHTML = "";
    prereqsFieldset.style.display = "none";
  }
}

// ============================================================
// DATA LOADING
// Fetches buildings.json and prerequisites.json, then
// initializes accounts and restores all saved state.
// "async" lets us use "await" to wait for the fetch to finish
// before continuing — cleaner than nesting callbacks.
// ============================================================

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

    // Initialize accounts (migrates legacy flat keys on first run)
    initAccounts();

    // Load all state from the active account
    loadAllStateFromAccount();

    applyTheme(loadThemePreference());
  } catch (error) {
    console.error("Error loading data:", error);
    alert("Error loading calculator data. Please refresh the page.");
  }
}

// ============================================================
// EVENT LISTENERS — BUILDING SELECTION DROPDOWNS
// These run immediately when the page loads (not inside a
// function) so they're always attached.
// ============================================================

// When the target building changes, rebuild level dropdowns,
// prerequisites panel, and FC visibility, then save.
document.getElementById("targetBuilding").addEventListener("change", function() {
  updateMainLevelSelectors(this.value);
  const currentLevelKey = document.getElementById("currentLevel").value;
  const targetLevelKey = document.getElementById("targetLevel").value;
  updatePrerequisites(this.value, currentLevelKey, targetLevelKey);
  updateFireCrystalSuppliesVisibility(this.value, currentLevelKey, targetLevelKey);
  saveTargetBuildingState();
});

// When current level changes, clamp target if needed, refresh prerequisites.
document.getElementById("currentLevel").addEventListener("change", function() {
  const selectedBuilding = document.getElementById("targetBuilding").value;
  const currentLevelKey = this.value;
  const targetLevelSelect = document.getElementById("targetLevel");
  const orderedLevels = getBuildingLevelOrder(selectedBuilding);
  const currentIdx = orderedLevels.indexOf(currentLevelKey);
  const targetIdx = orderedLevels.indexOf(targetLevelSelect.value);
  if (targetIdx < currentIdx) {
    targetLevelSelect.value = currentLevelKey; // Push target up to match current
  }
  updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelSelect.value);
  updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, targetLevelSelect.value);
  saveTargetBuildingState();
});

// When target level changes, clamp if below current, refresh prerequisites.
document.getElementById("targetLevel").addEventListener("change", function() {
  const selectedBuilding = document.getElementById("targetBuilding").value;
  const currentLevelKey = document.getElementById("currentLevel").value;
  const orderedLevels = getBuildingLevelOrder(selectedBuilding);
  const currentIdx = orderedLevels.indexOf(currentLevelKey);
  const targetIdx = orderedLevels.indexOf(this.value);
  if (targetIdx < currentIdx) {
    this.value = currentLevelKey;
  }
  updatePrerequisites(selectedBuilding, currentLevelKey, this.value);
  updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, this.value);
  saveTargetBuildingState();
});

// Attach save-on-change listeners to all supply/buff fields
attachSupplyPersistenceListeners();


// ============================================================
// EVENT LISTENERS — ACCOUNT BAR
// ============================================================

// Account dropdown: switch to the selected account
const accountSelect = document.getElementById("accountSelect");
if (accountSelect) {
  accountSelect.addEventListener("change", function() {
    switchAccount(this.value);
  });
}

// Add Account button: prompt for a name, create, and switch
const addAccountBtn = document.getElementById("addAccountBtn");
if (addAccountBtn) {
  addAccountBtn.addEventListener("click", function() {
    // prompt() shows a native browser dialog and returns the typed string,
    // or null if the user clicked Cancel
    const name = prompt("Account name:", `Account ${accounts.length + 1}`);
    if (name === null) return; // User cancelled
    const newAccount = addAccount(name.trim() || `Account ${accounts.length}`);
    switchAccount(newAccount.id);
  });
}

// Rename button: prompt for a new name and update the dropdown
const renameAccountBtn = document.getElementById("renameAccountBtn");
if (renameAccountBtn) {
  renameAccountBtn.addEventListener("click", function() {
    const account = getActiveAccount();
    if (!account) return;
    const newName = prompt("Rename account:", account.name);
    if (newName === null) return;
    renameAccount(account.id, newName);
    renderAccountSelector();
  });
}

// Delete button: confirm then delete, and reload from the new active account
const deleteAccountBtn = document.getElementById("deleteAccountBtn");
if (deleteAccountBtn) {
  deleteAccountBtn.addEventListener("click", function() {
    const account = getActiveAccount();
    if (!account) return;
    if (accounts.length <= 1) { alert("Cannot delete the only account."); return; }
    if (!confirm(`Delete "${account.name}"? This cannot be undone.`)) return;
    deleteAccount(account.id);
    loadAllStateFromAccount();
  });
}

// ============================================================
// EVENT LISTENERS — MISC UI
// ============================================================

// "Use Custom Chests" checkbox: show/hide the chest inputs and save
const useCustomChestsToggle = document.getElementById("useCustomChests");
if (useCustomChestsToggle) {
  useCustomChestsToggle.addEventListener("change", function() {
    updateCustomChestVisibility();
    saveSuppliesState();
  });
}

// Theme toggle button: flip between wos and dark themes
const themeToggleBtn = document.getElementById("themeToggleBtn");
if (themeToggleBtn) {
  themeToggleBtn.addEventListener("click", function() {
    const currentTheme = document.body.dataset.theme || "wos";
    const nextTheme = currentTheme === "dark" ? "wos" : "dark";
    applyTheme(nextTheme);
    saveThemePreference(nextTheme);
  });
}
// "Add Building" button
document.getElementById("addBuildingBtn").addEventListener("click", function() {
  addOptionalBuilding();
});

const addBearHuntMailBtn = document.getElementById("addBearHuntMailBtn");
if (addBearHuntMailBtn) {
  addBearHuntMailBtn.addEventListener("click", function() {
    addBearHuntMail();
  });
}

// ============================================================
// CALCULATE BUTTON
// This is the main calculation handler. It:
//   1. Reads all form inputs
//   2. Builds a list of every building to calculate (target +
//      prerequisites + optional)
//   3. Sums up total resource/time costs
//   4. Computes remaining resources after all upgrades
//   5. Applies construction speed buffs and speedup items
//   6. Optionally recommends custom chest usage
//   7. Outputs the full results as HTML
// ============================================================

document.getElementById("calculateBtn").addEventListener("click", function() {
  // Guard: bail out if data hasn't loaded yet
  if (!BUILDING_COSTS || !PREREQUISITES) {
    alert("Data is still loading. Please wait and try again.");
    return;
  }

  const targetBuilding = document.getElementById("targetBuilding").value;
  const currentLevel = document.getElementById("currentLevel").value;
  const targetLevel = document.getElementById("targetLevel").value;

  // Validate that current ≤ target
  const selectedBuildingLevels = getBuildingLevelOrder(targetBuilding);
  const currentIdx = selectedBuildingLevels.indexOf(currentLevel);
  const targetIdx = selectedBuildingLevels.indexOf(targetLevel);
  if (currentIdx < 0 || targetIdx < 0 || currentIdx > targetIdx) {
    alert("Please ensure current level does not exceed target level.");
    return;
  }

  const validationError = getCalculationValidationError();
  if (validationError) {
    alert(validationError);
    return;
  }

  // Get backpack resources
  // --- Read backpack resources ---
  // parseResourceAmount handles "953.14M", "2.5K", plain numbers, etc.
  const woodBackpack = parseResourceAmount(document.getElementById("ownedWood").value);
  const meatBackpack = parseResourceAmount(document.getElementById("ownedMeat").value);
  const coalBackpack = parseResourceAmount(document.getElementById("ownedCoal").value);
  const ironBackpack = parseResourceAmount(document.getElementById("ownedIron").value);

  // Bear Hunt Mail resources are added to the effective backpack so they
  // count toward covering upgrade costs
  const bearHuntTotals = getBearHuntResourceTotals();
  const effectiveMeatBackpack = meatBackpack + bearHuntTotals.meat;
  const effectiveWoodBackpack = woodBackpack + bearHuntTotals.wood;
  const effectiveCoalBackpack = coalBackpack + bearHuntTotals.coal;
  const effectiveIronBackpack = ironBackpack + bearHuntTotals.iron;

  const fireCrystalsBackpack = parseResourceAmount(document.getElementById("ownedFireCrystals").value);
  const refinedFireCrystalsBackpack = parseResourceAmount(document.getElementById("ownedRefinedFireCrystals").value);
  // --- Read speedup and buff inputs ---
  const generalSpeedupsMinutes      = parseInt(document.getElementById("generalSpeedups").value) || 0;
  const constructionSpeedupsMinutes = parseInt(document.getElementById("constructionSpeedups").value) || 0;
  const constructionSpeedPct = parseFloat(document.getElementById("constructionSpeedPct").value) || 0;
  const hyenaBuffPct = parseFloat(document.getElementById("hyenaBuffPct").value) || 0;
  const doubleTimePct = document.getElementById("doubleTimeEnabled").checked ? 20 : 0;
  const castleBuffPct = document.getElementById("castleBuffEnabled").checked ? 10 : 0;
  const positionBuffPct = parseFloat(document.getElementById("positionBuffPct").value) || 0;

  // --- Build list of buildings to calculate ---
  // Start with the main target building
  const buildingsToCalc = [{ building: targetBuilding, currentLevel, targetLevel }];

  // Add all prerequisites
  const prereqMap = getAggregatedPrerequisites(targetBuilding, currentLevel, targetLevel);
  for (const [buildingName, requiredLevel] of prereqMap.entries()) {
    if (!BUILDING_COSTS[buildingName]) continue;

    const currentInput = document.getElementById(`${buildingName}CurrentLevel`);
    const input = document.getElementById(`${buildingName}Level`);
    const prereqLevels = getBuildingLevelOrder(buildingName);
    const prereqCurrentLevel = currentInput ? String(currentInput.value) : prereqLevels[0];
    const requiredLevelKey = String(requiredLevel);
    const prereqTargetLevel = input
      ? String(input.value)
      : (prereqLevels.includes(requiredLevelKey) ? requiredLevelKey : prereqLevels[prereqLevels.length - 1]);

    // Make sure target isn't below current for prerequisites too
    const prereqCurrentIdx = prereqLevels.indexOf(prereqCurrentLevel);
    const prereqTargetIdx = prereqLevels.indexOf(prereqTargetLevel);
    const safePrereqTarget = (prereqTargetIdx >= prereqCurrentIdx && prereqTargetIdx >= 0)
      ? prereqTargetLevel
      : prereqCurrentLevel;

    buildingsToCalc.push({
      building: buildingName,
      currentLevel: prereqCurrentLevel,
      targetLevel: safePrereqTarget
    });
  }

  // Add optional buildings (only if target is actually above current)
  for (const optionalItem of optionalBuildings) {
    const optBuildingLevels = getBuildingLevelOrder(optionalItem.building);
    const optCurIdx = optBuildingLevels.indexOf(optionalItem.currentLevel);
    const optTgtIdx = optBuildingLevels.indexOf(optionalItem.targetLevel);
    
    if (optCurIdx >= 0 && optTgtIdx >= 0 && optCurIdx < optTgtIdx) {
      buildingsToCalc.push({
        building: optionalItem.building,
        currentLevel: optionalItem.currentLevel,
        targetLevel: optionalItem.targetLevel
      });
    }
  }

  // Calculate total cost across all buildings
  // --- Sum costs across all buildings ---
  let totalWood = 0, totalMeat = 0, totalCoal = 0, totalIron = 0;
  let totalFireCrystals = 0, totalRefinedFireCrystals = 0;
  let totalSeconds = 0;
  let resultsHTML = "";

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    let buildingWood = 0, buildingMeat = 0, buildingCoal = 0, buildingIron = 0;
    let buildingFireCrystals = 0, buildingRefinedFireCrystals = 0;

    if (!BUILDING_COSTS[building]) continue;

    // Walk every level in this building's upgrade path and add its costs
    const upgradePath = getUpgradePathKeys(building, curLvl, tgtLvl);
    for (const level of upgradePath) {
      const levelData = BUILDING_COSTS[building][level];
      if (!levelData) continue;

      buildingWood += levelData.wood || 0;
      buildingMeat += levelData.meat || 0;
      buildingCoal += levelData.coal || 0;
      buildingIron += levelData.iron || 0;
      buildingFireCrystals += levelData.fireCrystals || 0;
      buildingRefinedFireCrystals += levelData.refinedFireCrystals || 0;
      totalSeconds += levelData.seconds || 0;
    }

    totalWood += buildingWood;
    totalMeat += buildingMeat;
    totalCoal += buildingCoal;
    totalIron += buildingIron;
    totalFireCrystals += buildingFireCrystals;
    totalRefinedFireCrystals += buildingRefinedFireCrystals;

    // Look up optional stat changes (rally, troop deployment, storage)
    const currentData = BUILDING_COSTS[building][curLvl] || {};
    const targetData  = BUILDING_COSTS[building][tgtLvl] || {};
    const rallyFrom = currentData.rallyCapacity;
    const rallyTo = targetData.rallyCapacity;
    const deployFrom = currentData.troopDeploymentCapacity;
    const deployTo = targetData.troopDeploymentCapacity;
    const storageFrom = currentData.storageCapacity;
    const storageTo = targetData.storageCapacity;
    const extraStatLines = [];

    if (typeof rallyFrom === "number" && typeof rallyTo === "number") {
      extraStatLines.push(`Rally Capacity: ${rallyFrom.toLocaleString()} -> ${rallyTo.toLocaleString()}`);
    }

    if (typeof deployFrom === "number" && typeof deployTo === "number") {
      extraStatLines.push(`Troop Deployment Capacity: ${deployFrom.toLocaleString()} -> ${deployTo.toLocaleString()}`);
    }

    if (typeof storageFrom === "number" && typeof storageTo === "number") {
      extraStatLines.push(`Storage Capacity: ${storageFrom.toLocaleString()} -> ${storageTo.toLocaleString()}`);
    }

    const extraStatsHtml = extraStatLines.length
      ? `<br>${extraStatLines.join("<br>")}`
      : "";
    const crystalCostsHtml = (buildingFireCrystals > 0 || buildingRefinedFireCrystals > 0)
      ? `<br>Fire Crystals: ${buildingFireCrystals.toLocaleString()} | Refined Fire Crystals: ${buildingRefinedFireCrystals.toLocaleString()}`
      : "";

    // Display results for this building
    const buildingDisplay = building.replace("_", " ").toUpperCase();
    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);">
        <strong>${buildingDisplay}</strong> (${curLvl} → ${tgtLvl})<br>
        Meat: ${buildingMeat.toLocaleString()} | 
        Wood: ${buildingWood.toLocaleString()} | 
        Coal: ${buildingCoal.toLocaleString()} | 
        Iron: ${buildingIron.toLocaleString()}
        ${crystalCostsHtml}
        ${extraStatsHtml}
      </div>
    `;
  }

  // --- Compute remaining resources and time ---
  // "Effective" backpack already includes bear hunt mail resources
  const woodRemaining = effectiveWoodBackpack - totalWood;
  const meatRemaining = effectiveMeatBackpack - totalMeat;
  const coalRemaining = effectiveCoalBackpack - totalCoal;
  const ironRemaining = effectiveIronBackpack - totalIron;
  const fireCrystalsRemaining = fireCrystalsBackpack - totalFireCrystals;
  const refinedFireCrystalsRemaining = refinedFireCrystalsBackpack - totalRefinedFireCrystals;

  // Construction speed buffs are additive (all added together first)
  const additiveSpeedPct = Math.max(0, constructionSpeedPct + hyenaBuffPct + castleBuffPct + positionBuffPct);
  // Dividing base time by (1 + speed%) gives the reduced time
  const additiveAdjustedSeconds = Math.floor(totalSeconds / (1 + (additiveSpeedPct / 100)));
  const additiveTimeSavedSeconds = Math.max(0, totalSeconds - additiveAdjustedSeconds);

  // Double Time is multiplicative (applied on top of additive buffs)
  const clampedDoubleTimePct = Math.max(0, Math.min(100, doubleTimePct));
  const doubleTimeAdjustedSeconds = Math.floor(additiveAdjustedSeconds * (1 - (clampedDoubleTimePct / 100)));
  const doubleTimeSavedSeconds = Math.max(0, additiveAdjustedSeconds - doubleTimeAdjustedSeconds);

  // Speedups are subtracted from remaining time (converted from minutes to seconds)
  const totalSpeedupSeconds = (generalSpeedupsMinutes + constructionSpeedupsMinutes) * 60;
  const remainingTimeSeconds = Math.max(0, doubleTimeAdjustedSeconds - totalSpeedupSeconds);
  const speedupSurplusSeconds = Math.max(0, totalSpeedupSeconds - doubleTimeAdjustedSeconds);

  // How much of each resource is still needed after accounting for the effective backpack
  const basicDeficits = {
    meat: Math.max(0, totalMeat - effectiveMeatBackpack),
    wood: Math.max(0, totalWood - effectiveWoodBackpack),
    coal: Math.max(0, totalCoal - effectiveCoalBackpack),
    iron: Math.max(0, totalIron - effectiveIronBackpack)
  };

  const useCustomChests = !!document.getElementById("useCustomChests")?.checked;
  const chestCounts = getCustomChestCounts();
  const chestPlan = useCustomChests
    ? recommendCustomChestUsage(basicDeficits, chestCounts)
    : null;

  const postChestRemaining = {
    meat: meatRemaining + (chestPlan ? chestPlan.provided.meat : 0),
    wood: woodRemaining + (chestPlan ? chestPlan.provided.wood : 0),
    coal: coalRemaining + (chestPlan ? chestPlan.provided.coal : 0),
    iron: ironRemaining + (chestPlan ? chestPlan.provided.iron : 0)
  };

  // Bear Hunt Mail summary block
  if (bearHuntMails.length > 0) {
    const totalBearMails = bearHuntMails.reduce((sum, m) => sum + Math.max(0, m.count || 0), 0);
    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,165,0,0.7);">
        <strong>BEAR HUNT MAIL (+${totalBearMails.toLocaleString()} mail added to backpack)</strong><br>
        Meat: +${bearHuntTotals.meat.toLocaleString()} | Wood: +${bearHuntTotals.wood.toLocaleString()} | Coal: +${bearHuntTotals.coal.toLocaleString()} | Iron: +${bearHuntTotals.iron.toLocaleString()}<br>
        Essence Stones: +${bearHuntTotals.essenceStones.toLocaleString()} | Lucky Hero Gear Chests: +${bearHuntTotals.luckyHeroGearChest.toLocaleString()}<br>
        XP Components: +${bearHuntTotals.xp10.toLocaleString()} \xd7 10XP, +${bearHuntTotals.xp100.toLocaleString()} \xd7 100XP | Alliance Tokens: +${bearHuntTotals.allianceToken.toLocaleString()}
      </div>
    `;
  }

  // Add grand total
  resultsHTML += `
    <div class="card-panel" style="margin-top: 15px;">
      <strong>GRAND TOTAL</strong><br>
      Meat: ${totalMeat.toLocaleString()} | 
      Wood: ${totalWood.toLocaleString()} | 
      Coal: ${totalCoal.toLocaleString()} | 
      Iron: ${totalIron.toLocaleString()}<br>
      Fire Crystals: ${totalFireCrystals.toLocaleString()} | 
      Refined Fire Crystals: ${totalRefinedFireCrystals.toLocaleString()}<br>
      Total Upgrade Time (Base): ${formatDuration(totalSeconds)}<br>
      Additive Speed (${additiveSpeedPct.toFixed(1)}%): ${formatDuration(additiveAdjustedSeconds)} (${formatDuration(additiveTimeSavedSeconds)} saved)<br>
      Double Time (${clampedDoubleTimePct.toFixed(1)}%): ${formatDuration(doubleTimeAdjustedSeconds)} (${formatDuration(doubleTimeSavedSeconds)} saved)
      
      <br><br>
      <strong>After Upgrade (Backpack Balance)</strong><br>
      Meat: ${meatRemaining.toLocaleString()} | 
      Wood: ${woodRemaining.toLocaleString()} | 
      Coal: ${coalRemaining.toLocaleString()} | 
      Iron: ${ironRemaining.toLocaleString()}<br>
      Fire Crystals: ${fireCrystalsRemaining.toLocaleString()} | 
      Refined Fire Crystals: ${refinedFireCrystalsRemaining.toLocaleString()}<br>
      Remaining Time After Speedups: ${formatDuration(remainingTimeSeconds)}
      ${speedupSurplusSeconds > 0 ? `<br>Speedup Surplus: ${formatDuration(speedupSurplusSeconds)}` : ""}
    </div>
  `;

  if (chestPlan) {
    const chestLines = [];
    BASIC_RESOURCES.forEach(resource => {
      const alloc = chestPlan.allocations[resource];
      const usedCount = alloc[1] + alloc[2] + alloc[3];
      if (usedCount === 0) return; // Skip resources that needed no chests

      const resourceLabel = resource.charAt(0).toUpperCase() + resource.slice(1);
      chestLines.push(
        `${resourceLabel}: L3 x${alloc[3]}, L2 x${alloc[2]}, L1 x${alloc[1]} ` +
        `(provided ${chestPlan.provided[resource].toLocaleString()}, uncovered deficit ${chestPlan.remainingDeficits[resource].toLocaleString()})`
      );
    });

    const totalL1 = chestCounts[1].unsecured + chestCounts[1].secured;
    const totalL2 = chestCounts[2].unsecured + chestCounts[2].secured;
    const totalL3 = chestCounts[3].unsecured + chestCounts[3].secured;
    const leftL1 = chestPlan.countsLeft[1].unsecured + chestPlan.countsLeft[1].secured;
    const leftL2 = chestPlan.countsLeft[2].unsecured + chestPlan.countsLeft[2].secured;
    const leftL3 = chestPlan.countsLeft[3].unsecured + chestPlan.countsLeft[3].secured;
    const usedL1 = totalL1 - leftL1;
    const usedL2 = totalL2 - leftL2;
    const usedL3 = totalL3 - leftL3;

    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px;">
        <strong>CUSTOM CHEST RECOMMENDATION</strong><br>
        ${chestLines.length ? chestLines.join("<br>") : "No chest usage needed for current deficits."}<br><br>
        Chests Used: L3 ${usedL3}/${totalL3} | L2 ${usedL2}/${totalL2} | L1 ${usedL1}/${totalL1}<br>
        <strong>After Recommended Chest Use</strong><br>
        Meat: ${postChestRemaining.meat.toLocaleString()} |
        Wood: ${postChestRemaining.wood.toLocaleString()} |
        Coal: ${postChestRemaining.coal.toLocaleString()} |
        Iron: ${postChestRemaining.iron.toLocaleString()}
      </div>
    `;
  }

  // Inject all the generated HTML into the results section
  document.getElementById("result").innerHTML = resultsHTML;
});


// ============================================================
// STARTUP
// ============================================================

// Kick off the data load as soon as the script runs.
// Because loadData is async, the rest of the page stays
// interactive while it fetches the JSON files.
loadData();

// Register the service worker for PWA (installable app) support.
// The service worker caches files so the app works offline.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered:', registration);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });

  // When the service worker updates (new version deployed), reload the
  // page automatically so the user always gets the latest version.
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    window.location.reload();
  });
}