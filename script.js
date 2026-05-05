// ============================================================
// SVS POINTS — Chief Charm & Chief Gear Level Up
// Loads and parses SVS points from CSV for use in calculations
// Chief Gear uses Sheet2.csv, Chief Charm uses Sheet4.csv
// ============================================================

let SVS_POINTS_LOOKUP = {};
let GEAR_SVS_POINTS_LOOKUP = {};

async function loadSvsPointsCsv() {
  // Chief Charm (Sheet4.csv)
  const response = await fetch('data/WOS%20Calculator%20-%20Sheet4.csv');
  const text = await response.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  for (let i = 1; i < lines.length; ++i) {
    const [level, status, score] = lines[i].split(',');
    if (!level || !score) continue;
    if (!SVS_POINTS_LOOKUP[level]) SVS_POINTS_LOOKUP[level] = {};
    SVS_POINTS_LOOKUP[level][status] = parseInt(score, 10);
  }
  // Chief Gear (Sheet2.csv)
  const gearResp = await fetch('data/WOS%20Calculator%20-%20Sheet2.csv');
  const gearText = await gearResp.text();
  const gearLines = gearText.split(/\r?\n/).filter(Boolean);
  const header = gearLines[0].split(',');
  const tierIdx = header.indexOf('Tier');
  const starsIdx = header.indexOf('Stars');
  const scoreIdx = header.indexOf('level up score');
  for (let i = 1; i < gearLines.length; ++i) {
    const cols = gearLines[i].split(',');
    const tier = cols[tierIdx];
    const stars = cols[starsIdx];
    const score = cols[scoreIdx];
    if (!tier || !stars || !score || score === '-') continue;
    GEAR_SVS_POINTS_LOOKUP[`${tier},${stars}`] = parseInt(score, 10);
  }
}

function getSvsPointsForUpgrade(level, stage = '-') {
  if (SVS_POINTS_LOOKUP[level] && SVS_POINTS_LOOKUP[level][stage]) {
    return SVS_POINTS_LOOKUP[level][stage] * 70;
  }
  return 0;
}

function getGearSvsPoints(tier, stars) {
  const key = `${tier},${stars}`;
  return GEAR_SVS_POINTS_LOOKUP[key] || 0;
}
// Show info icon tooltips on tap/click for mobile users
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.info-icon').forEach(function(icon) {
    // Remove any existing tooltip
    function removeTooltip() {
      const tip = document.getElementById('info-tooltip');
      if (tip) tip.remove();
    }
    // Show tooltip
    function showTooltip() {
      removeTooltip();
      const tip = document.createElement('div');
      tip.id = 'info-tooltip';
      tip.textContent = icon.getAttribute('title') || icon.getAttribute('aria-label') || '';
      tip.style.position = 'fixed';
      tip.style.zIndex = 9999;
      tip.style.background = '#222a3a';
      tip.style.color = '#ffe08a';
      tip.style.padding = '10px 14px';
      tip.style.borderRadius = '8px';
      tip.style.boxShadow = '0 4px 16px rgba(0,0,0,0.25)';
      tip.style.fontSize = '1em';
      tip.style.maxWidth = '90vw';
      tip.style.wordBreak = 'break-word';
      // Position below the icon
      const rect = icon.getBoundingClientRect();
      tip.style.left = Math.min(rect.left, window.innerWidth - 220) + 'px';
      tip.style.top = (rect.bottom + 8) + 'px';
      document.body.appendChild(tip);
    }
    // Desktop: show on hover
    icon.addEventListener('mouseenter', showTooltip);
    icon.addEventListener('mouseleave', removeTooltip);
    // Mobile: show on tap/click
    icon.addEventListener('click', function(e) {
      e.stopPropagation();
      if (document.getElementById('info-tooltip')) {
        removeTooltip();
      } else {
        showTooltip();
      }
    });
  });
  // Hide tooltip on outside tap
  document.addEventListener('click', function(e) {
    const tip = document.getElementById('info-tooltip');
    if (tip) tip.remove();
  });
});
// Ensure info icons always display the "i" character, even if inner text is missing
document.addEventListener("DOMContentLoaded", function() {
  document.querySelectorAll('.info-icon').forEach(function(el) {
    if (!el.textContent.trim()) el.textContent = 'i';
  });
});
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

var BUILDING_COSTS = null;      // Loaded from data/buildings.json
var PREREQUISITES = null;       // Loaded from data/prerequisites.json
var CHIEF_GEAR_DATA = null;     // Loaded from data/chiefGear.json
var CHIEF_CHARM_DATA = null;    // Loaded from data/chiefCharm.json
var optionalBuildings = [];     // Extra buildings the user added manually
var bearHuntMails = [];         // Bear Hunt Mail reward rows
var accounts = [];              // All saved accounts (Option B blob model)
var activeAccountId = null;     // ID of the currently selected account

var CALCULATOR_KEYS = {
  UPGRADE: "upgrade",
  CHIEF_GEAR: "chiefGear",
  CHIEF_CHARM: "chiefCharm",
  WHAT_IF: "whatIf"
};

function translateText(key, vars = {}, fallback = "") {
  if (window.i18n && typeof window.i18n.t === "function") {
    return window.i18n.t(key, vars, fallback);
  }
  return fallback || key;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(value) {
  return escapeHtml(value);
}

function formatNumber(num) {
  return (num || 0).toLocaleString();
}

function prettifyBuildingName(buildingName) {
  return String(buildingName || "")
    .replace(/_/g, " ")
    .replace(/\b\w/g, char => char.toUpperCase());
}

function getBuildingDisplayName(buildingName) {
  return translateText(`building.${buildingName}`, {}, prettifyBuildingName(buildingName));
}

function getResourceDisplayName(resourceKey) {
  return translateText(`resource.${resourceKey}`, {}, prettifyBuildingName(resourceKey));
}

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
  "zinmanBastionistPct",
  "agnusProjectManagementHours",
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
// CONSTANTS — CHIEF GEAR CONFIGURATION
// Defines the 6 gear slots and their corresponding HTML input IDs,
// plus the material field IDs used in the Chief Gear calculator.
// ============================================================

const GEAR_SLOTS = ["hat", "watch", "coat", "pants", "ring", "shortStaff"];

const GEAR_SLOT_FIELDS = {
  hat: { current: "hatCurrent", target: "hatTarget" },
  watch: { current: "watchCurrent", target: "watchTarget" },
  coat: { current: "coatCurrent", target: "coatTarget" },
  pants: { current: "pantsCurrent", target: "pantsTarget" },
  ring: { current: "ringCurrent", target: "ringTarget" },
  shortStaff: { current: "shortStaffCurrent", target: "shortStaffTarget" }
};

const GEAR_MATERIAL_FIELDS = [
  "gearHardenedAlloy",
  "gearPolishingSolution",
  "gearDesignPlans",
  "gearLunarAmber"
];

const CHARM_MATERIAL_FIELDS = [
  "charmDesignsInput",
  "charmGuidesInput",
  "jewelSecretsInput"
];

const CHARM_GEAR_PIECES = [
  { id: "hat", labelKey: "labels.hat", fallback: "Cap (Lancer)" },
  { id: "watch", labelKey: "labels.watch", fallback: "Watch (Lancer)" },
  { id: "coat", labelKey: "labels.coat", fallback: "Coat (Infantry)" },
  { id: "pants", labelKey: "labels.pants", fallback: "Pants (Infantry)" },
  { id: "ring", labelKey: "labels.ring", fallback: "Ring (Marksman)" },
  { id: "shortStaff", labelKey: "labels.shortStaff", fallback: "Weapon (Marksman)" }
];

const CHARM_SLOT_DEFINITIONS = CHARM_GEAR_PIECES.flatMap(piece =>
  [1, 2, 3].map(charmNumber => ({
    slotKey: `${piece.id}_charm_${charmNumber}`,
    currentId: `${piece.id}Charm${charmNumber}Current`,
    targetId: `${piece.id}Charm${charmNumber}Target`,
    pieceLabelKey: piece.labelKey,
    pieceFallback: piece.fallback,
    charmNumber
  }))
);

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

function createDefaultUpgradeState() {
  return {
    building: "furnace",
    currentLevel: null,
    targetLevel: null,
    supplies: {},
    optionalBuildings: [],
    bearHuntMails: [],
    prereqState: {}
  };
}

// Ensures each account has calculator namespaces. Also migrates
// legacy top-level upgrade fields into calculators.upgrade.
function ensureAccountCalculatorShape(account) {
  if (!account || typeof account !== "object") return createDefaultAccount("Account");

  const legacyUpgrade = {
    building: account.building,
    currentLevel: account.currentLevel,
    targetLevel: account.targetLevel,
    supplies: account.supplies,
    optionalBuildings: account.optionalBuildings,
    bearHuntMails: account.bearHuntMails,
    prereqState: account.prereqState
  };

  const calculators = (account.calculators && typeof account.calculators === "object") ? account.calculators : {};
  const existingUpgrade = (calculators.upgrade && typeof calculators.upgrade === "object") ? calculators.upgrade : {};

  const mergedUpgrade = {
    ...createDefaultUpgradeState(),
    ...legacyUpgrade,
    ...existingUpgrade,
    supplies: {
      ...(createDefaultUpgradeState().supplies || {}),
      ...(legacyUpgrade.supplies || {}),
      ...(existingUpgrade.supplies || {})
    },
    optionalBuildings: Array.isArray(existingUpgrade.optionalBuildings)
      ? [...existingUpgrade.optionalBuildings]
      : (Array.isArray(legacyUpgrade.optionalBuildings) ? [...legacyUpgrade.optionalBuildings] : []),
    bearHuntMails: Array.isArray(existingUpgrade.bearHuntMails)
      ? [...existingUpgrade.bearHuntMails]
      : (Array.isArray(legacyUpgrade.bearHuntMails) ? [...legacyUpgrade.bearHuntMails] : []),
    prereqState: {
      ...(legacyUpgrade.prereqState || {}),
      ...(existingUpgrade.prereqState || {})
    }
  };

  calculators.upgrade = mergedUpgrade;
  calculators.chiefGear = (calculators.chiefGear && typeof calculators.chiefGear === "object") ? calculators.chiefGear : {};
  calculators.chiefCharm = (calculators.chiefCharm && typeof calculators.chiefCharm === "object") ? calculators.chiefCharm : {};
  calculators.whatIf = (calculators.whatIf && typeof calculators.whatIf === "object") ? calculators.whatIf : {};

  account.calculators = calculators;
  return account;
}

function getUpgradeStateFromAccount(account) {
  if (!account) return createDefaultUpgradeState();
  ensureAccountCalculatorShape(account);
  return account.calculators.upgrade || createDefaultUpgradeState();
}

// Returns a brand-new account object with default values.
// All fields match what the page uses so nothing is undefined.
function createDefaultAccount(name) {
  const upgradeDefaults = createDefaultUpgradeState();
  return {
    id: generateAccountId(),
    name: name || "Account 1",
    calculators: {
      upgrade: { ...upgradeDefaults },
      chiefGear: {},
      chiefCharm: {},
      whatIf: {}
    }
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

  if (Array.isArray(accounts)) {
    accounts = accounts.map(acc => ensureAccountCalculatorShape(acc));
    if (accounts.length) {
      localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
    }
  }

  if (!Array.isArray(accounts) || accounts.length === 0) {
    const defaultAccount = createDefaultAccount("Account 1");
    // Migrate any existing flat localStorage keys into the default account
    const oldBuilding = localStorage.getItem("wosCalc_building");
    if (oldBuilding) {
      const migratedUpgrade = { ...createDefaultUpgradeState() };
      migratedUpgrade.building = oldBuilding;
      migratedUpgrade.currentLevel = localStorage.getItem("wosCalc_currentLevel");
      migratedUpgrade.targetLevel = localStorage.getItem("wosCalc_targetLevel");
      try { migratedUpgrade.optionalBuildings = JSON.parse(localStorage.getItem("wosCalc_optionalBuildings") || "[]"); } catch (e) {}
      try { migratedUpgrade.supplies = JSON.parse(localStorage.getItem("wosCalc_supplies") || "{}"); } catch (e) {}
      try { migratedUpgrade.bearHuntMails = JSON.parse(localStorage.getItem("wosCalc_bearHuntMails") || "[]"); } catch (e) {}
      try { migratedUpgrade.prereqState = JSON.parse(localStorage.getItem("wosCalc_prereqState") || "{}"); } catch (e) {}
      defaultAccount.calculators.upgrade = migratedUpgrade;
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
  const account = getActiveAccount();
  const existingUpgrade = getUpgradeStateFromAccount(account);
  updateActiveAccount({
    calculators: {
      ...(account?.calculators || {}),
      upgrade: {
        ...existingUpgrade,
        building,
        currentLevel,
        targetLevel,
        supplies,
        optionalBuildings: [...optionalBuildings],
        bearHuntMails: [...bearHuntMails]
      }
    }
  });
}

// Switches to a different account:
// 1. Save current state into the old account
// 2. Update the active ID
// 3. Load all state from the new account
function switchAccount(id) {
  if (id === activeAccountId) return; // Already on this account, nothing to do
  // Save the current calculator state for the active account before switching
  if (activeCalculator === CALCULATOR_KEYS.UPGRADE) {
    captureCurrentStateToAccount();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_GEAR) {
    saveChiefGearState();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_CHARM) {
    if (typeof saveChiefCharmState === "function") saveChiefCharmState();
  }

  activeAccountId = id;
  localStorage.setItem("wosCalc_activeAccountId", id);

  // Load the correct calculator state for the new account
  if (activeCalculator === CALCULATOR_KEYS.UPGRADE) {
    loadAllStateFromAccount();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_GEAR) {
    renderAccountSelector();
    initChiefGearPanel();
    loadChiefGearState();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_CHARM) {
    renderAccountSelector();
    if (typeof initChiefCharmPanel === "function") initChiefCharmPanel();
    if (typeof loadChiefCharmState === "function") loadChiefCharmState();
  } else {
    renderAccountSelector();
    renderComingSoonPanel(activeCalculator);
  }
}

// Reads the active account's saved state and populates all
// form fields, dropdowns, optional buildings, and bear hunt rows.
// This is the "restore everything" function used on page load
// and whenever you switch accounts.
function loadAllStateFromAccount() {
  const account = getActiveAccount();
  const upgradeState = getUpgradeStateFromAccount(account);
  // Don't try to restore if data isn't loaded yet
  if (!account || !BUILDING_COSTS) return;

  const targetBuildingSelect = document.getElementById("targetBuilding");
  if (targetBuildingSelect && upgradeState.building && [...targetBuildingSelect.options].map(o => o.value).includes(upgradeState.building)) {
    targetBuildingSelect.value = upgradeState.building;
  }
  const selectedBuilding = targetBuildingSelect?.value;
  if (selectedBuilding) {
    updateMainLevelSelectors(selectedBuilding);
  }

  const currentLevelSelect = document.getElementById("currentLevel");
  const targetLevelSelect = document.getElementById("targetLevel");
  if (currentLevelSelect && upgradeState.currentLevel && [...currentLevelSelect.options].map(o => o.value).includes(upgradeState.currentLevel)) {
    currentLevelSelect.value = upgradeState.currentLevel;
  }
  if (targetLevelSelect && upgradeState.targetLevel && [...targetLevelSelect.options].map(o => o.value).includes(upgradeState.targetLevel)) {
    targetLevelSelect.value = upgradeState.targetLevel;
  }

  if (targetBuildingSelect && currentLevelSelect && targetLevelSelect) {
    const currentLevelKey = currentLevelSelect.value;
    const targetLevelKey = targetLevelSelect.value;
    updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelKey);
    updateFireCrystalSuppliesVisibility(selectedBuilding, currentLevelKey, targetLevelKey);
  }

  if (document.getElementById("optionalBuildingsContainer")) {
    optionalBuildings = Array.isArray(upgradeState.optionalBuildings) ? [...upgradeState.optionalBuildings] : [];
    renderOptionalBuildings();
  }

  if (document.getElementById("bearHuntMailsContainer")) {
    bearHuntMails = Array.isArray(upgradeState.bearHuntMails) ? [...upgradeState.bearHuntMails] : [];
    renderBearHuntMails();
  }

  const supplies = upgradeState.supplies || {};
  SUPPLY_FIELD_IDS.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !(id in supplies)) return;
    if (el.type === "checkbox") {
      el.checked = !!supplies[id];
    } else {
      el.value = supplies[id];
    }
  });

  if (document.getElementById("useCustomChests")) {
    updateCustomChestVisibility();
  }
  renderAccountSelector();
}

// Updates the account dropdown to reflect the current accounts
// list, and disables the delete button if only one account remains.
function renderAccountSelector() {
  const select = document.getElementById("accountSelect");
  if (!select) return;

  // Build option nodes directly instead of interpolating account names into
  // HTML strings. That keeps user-provided names as plain text.
  select.innerHTML = "";
  accounts.forEach(account => {
    const option = document.createElement("option");
    option.value = account.id;
    option.textContent = account.name;
    option.selected = account.id === activeAccountId;
    select.appendChild(option);
  });

  const deleteBtn = document.getElementById("deleteAccountBtn");
  if (deleteBtn) deleteBtn.disabled = accounts.length <= 1; // Prevent deleting the last account
}

function renderComingSoonPanel(calculatorKey) {
  const titleEl = document.getElementById("comingSoonTitle");
  const messageEl = document.getElementById("comingSoonMessage");
  const accountNameEl = document.getElementById("comingSoonAccountName");
  const account = getActiveAccount();
  const accountName = account?.name || "this account";

  const friendlyNameMap = {
    [CALCULATOR_KEYS.CHIEF_GEAR]: translateText("calculator.chiefGearFull", {}, "Chief Gear Calculator"),
    [CALCULATOR_KEYS.CHIEF_CHARM]: translateText("calculator.chiefCharmFull", {}, "Chief Charm Calculator"),
    [CALCULATOR_KEYS.WHAT_IF]: translateText("calculator.whatIfFull", {}, "What If Calculator")
  };

  const calculatorName = friendlyNameMap[calculatorKey] || translateText("calculator.generic", {}, "Calculator");
  if (titleEl) {
    titleEl.textContent = translateText("comingSoon.heading", { calculator: calculatorName }, `${calculatorName} - Coming Soon`);
  }
  if (accountNameEl) accountNameEl.textContent = accountName;
  if (messageEl) {
    messageEl.textContent = translateText("comingSoon.accountStructured", {
      account: accountName,
      calculator: calculatorName
    });
  }
}

function ensureCalculatorBucketForActiveAccount(calculatorKey) {
  const account = getActiveAccount();
  if (!account || calculatorKey === CALCULATOR_KEYS.UPGRADE) return;

  const nowIso = new Date().toISOString();
  const calculators = { ...(account.calculators || {}) };
  const existingBucket = (calculators[calculatorKey] && typeof calculators[calculatorKey] === "object")
    ? calculators[calculatorKey]
    : {};

  calculators[calculatorKey] = {
    initializedAt: existingBucket.initializedAt || nowIso,
    lastVisitedAt: nowIso,
    ...existingBucket
  };

  updateActiveAccount({ calculators });
}

function setActiveCalculator(calculatorKey) {
  const currentSaved = localStorage.getItem("wosCalc_activeCalculator");
  const keyToUse = calculatorKey || currentSaved || CALCULATOR_KEYS.UPGRADE;
  
  const safeKey = Object.values(CALCULATOR_KEYS).includes(keyToUse)
    ? keyToUse
    : CALCULATOR_KEYS.UPGRADE;

  if (activeCalculator === CALCULATOR_KEYS.UPGRADE && safeKey !== CALCULATOR_KEYS.UPGRADE) {
    captureCurrentStateToAccount();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_GEAR && safeKey !== CALCULATOR_KEYS.CHIEF_GEAR) {
    saveChiefGearState();
  } else if (activeCalculator === CALCULATOR_KEYS.CHIEF_CHARM && safeKey !== CALCULATOR_KEYS.CHIEF_CHARM) {
    if (typeof saveChiefCharmState === "function") saveChiefCharmState();
  }

  window.activeCalculator = safeKey;
  localStorage.setItem("wosCalc_activeCalculator", window.activeCalculator);
  ensureCalculatorBucketForActiveAccount(window.activeCalculator);

  const dropdown = document.getElementById("calculatorDropdown");
  if (dropdown && dropdown.value !== safeKey) {
    dropdown.value = safeKey;
    dropdown.dispatchEvent(new Event('change'));
  }
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
  const upgradeState = getUpgradeStateFromAccount(account);
  return {
    savedBuilding: upgradeState?.building || null,
    savedCurrent: upgradeState?.currentLevel || null,
    savedTarget: upgradeState?.targetLevel || null
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
  const upgradeState = getUpgradeStateFromAccount(account);
  optionalBuildings = Array.isArray(upgradeState?.optionalBuildings) ? [...upgradeState.optionalBuildings] : [];
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
  const upgradeState = getUpgradeStateFromAccount(account);
  const supplies = upgradeState?.supplies || {};
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
    button.textContent = safeTheme === "dark"
      ? translateText("theme.lightMode", {}, "Light Mode")
      : translateText("theme.darkMode", {}, "Dark Mode");
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
  const existingUpgrade = getUpgradeStateFromAccount(account);
  const nextPrereqState = {
    ...(existingUpgrade.prereqState || {}),
    [buildingName]: state
  };
  updateActiveAccount({
    calculators: {
      ...(account.calculators || {}),
      upgrade: {
        ...existingUpgrade,
        prereqState: nextPrereqState
      }
    }
  });
}

// Returns the saved prerequisite state for one building,
// or an empty object if nothing has been saved yet.
function loadPrerequisiteState(buildingName) {
  const account = getActiveAccount();
  const upgradeState = getUpgradeStateFromAccount(account);
  const prereqState = upgradeState?.prereqState || {};
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
    .map(opt => `<option value="${escapeAttr(opt.value)}"${opt.value === selectedValue ? " selected" : ""}>${escapeHtml(opt.text)}</option>`)
    .join("");
}

// Rebuilds the entire optional buildings section from the
// optionalBuildings array. Uses template literals (backtick
// strings) to generate HTML, then sets it all at once with
// innerHTML. After setting innerHTML, event listeners must be
// re-attached because the old DOM nodes were replaced.
function renderOptionalBuildings() {
  const container = document.getElementById("optionalBuildingsContainer");
  if (!container) return; // Safety check for SPA
  if (optionalBuildings.length === 0) {
    container.innerHTML = "";
    return;
  }

  let html = "";
  optionalBuildings.forEach((item, index) => {
    const buildingLevels = getBuildingLevelOrder(item.building);
    const buildingOptions = getAllBuildingOptionsHTML(item.building);
    const currentOptions = buildingLevels
      .map(lvl => `<option value="${escapeAttr(lvl)}"${lvl === item.currentLevel ? " selected" : ""}>${escapeHtml(formatLevelLabel(lvl))}</option>`)
      .join("");
    const targetOptions = buildingLevels
      .map(lvl => `<option value="${escapeAttr(lvl)}"${lvl === item.targetLevel ? " selected" : ""}>${escapeHtml(formatLevelLabel(lvl))}</option>`)
      .join("");

    const buildingLabel = escapeHtml(translateText("labels.building", {}, "Building"));
    const removeLabel = escapeHtml(translateText("buttons.remove", {}, "Remove"));
    const currentLevelLabel = escapeHtml(translateText("labels.currentLevel", {}, "Current Level"));
    const targetLevelLabel = escapeHtml(translateText("labels.targetLevel", {}, "Target Level"));

    html += `
      <div class="card-panel" style="margin-bottom: 12px;">
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap; margin-bottom: 8px;">
          <div style="flex: 1 1 200px; min-width: 160px;">
            <label for="optionalBuilding_${index}">${buildingLabel}</label>
            <select id="optionalBuilding_${index}" class="optionalBuildingSelect" data-index="${index}" style="width: 100%;">
              ${buildingOptions}
            </select>
          </div>
          <button type="button" class="removeOptionalBtn inlineActionBtn inlineActionBtnDanger" data-index="${index}">${removeLabel}</button>
        </div>
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 1 1 180px; min-width: 180px;">
            <label for="optionalCurrent_${index}">${currentLevelLabel}</label>
            <select id="optionalCurrent_${index}" class="optionalCurrentLevel" data-index="${index}">
              ${currentOptions}
            </select>
          </div>
          <div style="flex: 1 1 180px; min-width: 180px;">
            <label for="optionalTarget_${index}">${targetLevelLabel}</label>
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
    alert(translateText("alerts.cannotAddOptionalBuilding", {}, "Cannot add optional building: no level data available"));
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
  const upgradeState = getUpgradeStateFromAccount(account);
  bearHuntMails = Array.isArray(upgradeState?.bearHuntMails) ? [...upgradeState.bearHuntMails] : [];
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
    const safeTierIndex = Number.isFinite(Number(mail.tierIndex))
      ? Math.max(0, Math.min(BEAR_HUNT_TIERS.length - 1, Number(mail.tierIndex)))
      : 0;
    const parsedMailCount = parseInt(String(mail.count ?? "1"), 10);
    const safeMailCount = Number.isNaN(parsedMailCount) ? 1 : Math.max(0, parsedMailCount);
    const tierOptions = BEAR_HUNT_TIERS
      .map((tier, i) => `<option value="${i}"${i === safeTierIndex ? " selected" : ""}>${escapeHtml(tier.label)}</option>`)
      .join("");

    const damageTierLabel = escapeHtml(translateText("labels.damageTier", {}, "Damage Tier"));
    const mailLabel = escapeHtml(translateText("labels.mail", {}, "Mail"));
    const removeLabel = escapeHtml(translateText("buttons.remove", {}, "Remove"));

    html += `
      <div class="card-panel" style="margin-bottom: 10px;">
        <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
          <div style="flex: 2 1 200px; min-width: 160px;">
            <label for="bearHuntTier_${index}">${damageTierLabel}</label>
            <select id="bearHuntTier_${index}" class="bearHuntTierSelect" data-index="${index}" style="width: 100%;">
              ${tierOptions}
            </select>
          </div>
          <div style="flex: 1 1 100px; min-width: 80px;">
            <label for="bearHuntCount_${index}">${mailLabel}</label>
            <input id="bearHuntCount_${index}" type="number" min="0" value="${safeMailCount}" class="bearHuntCountInput" data-index="${index}" style="width: 100%;" />
          </div>
          <button type="button" class="removeBearHuntBtn inlineActionBtn inlineActionBtnDanger" data-index="${index}">${removeLabel}</button>
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
    .map(v => `<option value="${escapeAttr(v)}">${escapeHtml(formatLevelLabel(v))}</option>`)
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
// Returns the furnace's effective goal level for the current form state,
// or null if furnace is not present in any tracked position.
// Priority: (1) main target building is furnace → use target level dropdown
//           (2) furnace appears in optional buildings → use that item's target
//           (3) furnace appears in the prereq panel → read its select element
function getEffectiveFurnaceGoalLevel() {
  const mainBuilding = document.getElementById("targetBuilding")?.value;
  if (mainBuilding === "furnace") {
    return document.getElementById("targetLevel")?.value || null;
  }

  // Check optional buildings array
  const optFurnace = optionalBuildings.find(b => b.building === "furnace");
  if (optFurnace) return String(optFurnace.targetLevel);

  // Check prereq panel DOM
  const prereqSelect = document.getElementById("furnaceLevel");
  if (prereqSelect) return String(prereqSelect.value);

  return null;
}

function getCalculationValidationError() {
  const resourceFields = [
    ["ownedMeat", "labels.meat"],
    ["ownedWood", "labels.wood"],
    ["ownedCoal", "labels.coal"],
    ["ownedIron", "labels.iron"],
    ["ownedFireCrystals", "labels.fireCrystals"],
    ["ownedRefinedFireCrystals", "labels.refinedFireCrystals"]
  ];

  for (const [id, labelKey] of resourceFields) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (!isValidResourceAmountInput(el.value)) {
      return translateText("validation.nonNegativeResource", {
        label: translateText(labelKey, {}, labelKey)
      });
    }
  }

  const numberFields = [
    ["generalSpeedups", "labels.generalSpeedups", false],
    ["constructionSpeedups", "labels.constructionSpeedups", false],
    ["constructionSpeedPct", "labels.constructionSpeed", true],
    ["positionBuffPct", "labels.positionBuff", true],
    ["customChestL1SecuredCount", "labels.level1Secured", false],
    ["customChestL1UnsecuredCount", "labels.level1Unsecured", false],
    ["customChestL2SecuredCount", "labels.level2Secured", false],
    ["customChestL2UnsecuredCount", "labels.level2Unsecured", false],
    ["customChestL3SecuredCount", "labels.level3Secured", false],
    ["customChestL3UnsecuredCount", "labels.level3Unsecured", false]
  ];

  for (const [id, labelKey, allowDecimal] of numberFields) {
    const el = document.getElementById(id);
    if (!el) continue;
    if (!isValidNonNegativeNumberInput(el.value, allowDecimal)) {
      return translateText(
        allowDecimal ? "validation.nonNegativeNumber" : "validation.nonNegativeWholeNumber",
        { label: translateText(labelKey, {}, labelKey) }
      );
    }
  }

  for (const item of optionalBuildings) {
    const levels = getBuildingLevelOrder(item.building);
    const currentIndex = levels.indexOf(String(item.currentLevel));
    const targetIndex = levels.indexOf(String(item.targetLevel));
    if (!BUILDING_COSTS[item.building] || currentIndex < 0 || targetIndex < 0) {
      return translateText("alerts.invalidOptionalBuilding");
    }
    if (targetIndex < currentIndex) {
      const buildingLabel = getBuildingDisplayName(item.building).toUpperCase();
      return translateText("alerts.optionalTargetBelowCurrent", { building: buildingLabel });
    }
  }

  // Furnace ceiling check — every non-furnace building's goal level must
  // not exceed the furnace goal level, since furnace must always lead.
  const furnaceGoalLevel = getEffectiveFurnaceGoalLevel();
  if (furnaceGoalLevel !== null) {
    const furnaceLevels = getBuildingLevelOrder("furnace");
    const furnaceGoalIdx = furnaceLevels.indexOf(furnaceGoalLevel);

    // Check optional buildings
    for (const item of optionalBuildings) {
      if (item.building === "furnace") continue;
      const furnaceComparableLevels = getBuildingLevelOrder("furnace");
      const itemTargetStr = String(item.targetLevel);
      const itemGoalIdx = furnaceComparableLevels.indexOf(itemTargetStr);
      // Only flag if both levels are in the furnace level list (same scale)
      if (furnaceGoalIdx >= 0 && itemGoalIdx > furnaceGoalIdx) {
        const buildingLabel = getBuildingDisplayName(item.building).toUpperCase();
        return translateText("alerts.goalExceedsFurnace", { building: buildingLabel });
      }
    }

    // Check required (prerequisite) buildings via the DOM
    const prereqContainer = document.getElementById("prerequisitesContainer");
    if (prereqContainer) {
      prereqContainer.querySelectorAll("select[data-building][id$='Level']").forEach(sel => {
        // error already returned above — can't short-circuit forEach, collect first
      });
      const prereqSelects = prereqContainer.querySelectorAll("select[data-building][id$='Level']");
      for (const sel of prereqSelects) {
        const prereqBuilding = sel.dataset.building;
        if (!prereqBuilding || prereqBuilding === "furnace") continue;
        const prereqTargetStr = String(sel.value);
        const prereqGoalIdx = furnaceLevels.indexOf(prereqTargetStr);
        if (furnaceGoalIdx >= 0 && prereqGoalIdx > furnaceGoalIdx) {
          const buildingLabel = getBuildingDisplayName(prereqBuilding).toUpperCase();
          return translateText("alerts.goalExceedsFurnace", { building: buildingLabel });
        }
      }
    }
  }

  for (const mail of bearHuntMails) {
    const tierIndex = Number(mail.tierIndex);
    const count = Number(mail.count);
    if (!Number.isInteger(tierIndex) || tierIndex < 0 || tierIndex >= BEAR_HUNT_TIERS.length) {
      return translateText("alerts.invalidBearHuntTier");
    }
    if (!Number.isFinite(count) || count < 0) {
      return translateText("alerts.invalidBearHuntCount");
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

// Show/hide prerequisites for a given building and target level.
// Pass resetTargetsToRequired = true to force all prereq target levels
// back to their minimum required level (used when the main building or
// goal level changes).
function updatePrerequisites(selectedBuilding, currentLevelKey, targetLevelKey, resetTargetsToRequired = false) {
  const prereqsFieldset = document.getElementById("prerequisitesSection");
  const prereqsContainer = document.getElementById("prerequisitesContainer");

  if (PREREQUISITES && PREREQUISITES[selectedBuilding]) {
    // When the main goal changes, wipe saved target levels so the
    // render loop falls back to the fresh required level.
    if (resetTargetsToRequired) {
      const existingState = loadPrerequisiteState(selectedBuilding);
      const clearedState = {};
      Object.keys(existingState).forEach(b => {
        clearedState[b] = { currentLevel: existingState[b].currentLevel };
      });
      savePrerequisiteState(selectedBuilding, clearedState);
    }

    const prereqMap = getAggregatedPrerequisites(selectedBuilding, currentLevelKey, targetLevelKey);

    // If the main building is NOT the furnace, but the furnace is being
    // upgraded as part of this plan (either as a required building or as an
    // optional building), also pull in the prerequisites needed to upgrade the
    // furnace itself and merge them into the displayed required buildings.
    if (selectedBuilding !== "furnace") {
      let furnaceFrom = null;
      let furnaceTo   = null;

      if (prereqMap.has("furnace")) {
        // Furnace is a required building — read current/target from saved state.
        const prereqState   = loadPrerequisiteState(selectedBuilding);
        const furnaceState  = prereqState["furnace"] || {};
        const furnaceLevels = getBuildingLevelOrder("furnace");
        furnaceFrom = (furnaceState.currentLevel && furnaceLevels.includes(String(furnaceState.currentLevel)))
          ? String(furnaceState.currentLevel)
          : (furnaceLevels[0] || "1");
        furnaceTo = (furnaceState.targetLevel && furnaceLevels.includes(String(furnaceState.targetLevel)))
          ? String(furnaceState.targetLevel)
          : prereqMap.get("furnace"); // fall back to minimum required level
      }

      if (!furnaceTo) {
        // Furnace is in optional buildings instead.
        const optFurnace = optionalBuildings.find(b => b.building === "furnace");
        if (optFurnace) {
          furnaceFrom = String(optFurnace.currentLevel);
          furnaceTo   = String(optFurnace.targetLevel);
        }
      }

      if (furnaceFrom && furnaceTo && furnaceFrom !== furnaceTo) {
        const furnacePrereqMap = getAggregatedPrerequisites("furnace", furnaceFrom, furnaceTo);
        for (const [building, level] of furnacePrereqMap.entries()) {
          if (building === selectedBuilding) continue; // skip the main building itself
          const existing = prereqMap.get(building);
          prereqMap.set(building, getHigherRequiredLevel(building, existing, level));
        }
      }
    }

    let prereqsHTML = `
      <div style="margin-bottom: 10px; display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
        <div style="flex: 1 1 220px; min-width: 140px;">
          <label for="prereqBatchCurrent">${escapeHtml(translateText("labels.setAllCurrentLevels", {}, "Set all current levels"))}</label>
          <select id="prereqBatchCurrent"></select>
        </div>
        <button id="setAllPrereqCurrentBtn" type="button" class="inlineActionBtn inlineActionBtnPrimary">${escapeHtml(translateText("buttons.setAll", {}, "Set All"))}</button>
      </div>
    `;

    const savedPrereqState = loadPrerequisiteState(selectedBuilding);

    for (const [buildingName, requiredLevel] of prereqMap.entries()) {
      const hasCostData = !!(BUILDING_COSTS && BUILDING_COSTS[buildingName]);
      const buildingLabel = escapeHtml(getBuildingDisplayName(buildingName).toUpperCase());
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
        .map(opt => `<option value="${escapeAttr(opt)}"${opt === selected ? " selected" : ""}>${escapeHtml(formatLevelLabel(opt))}</option>`)
        .join("");

      if (hasCostData) {
        prereqsHTML += `
          <div style="margin-bottom: 10px;">
            <div style="font-weight: 700; margin-bottom: 6px;">${buildingLabel}</div>
            <div style="display: flex; gap: 10px; align-items: flex-end; flex-wrap: wrap;">
              <div style="flex: 1 1 160px; min-width: 140px;">
                <label for="${buildingName}CurrentLevel">${escapeHtml(translateText("labels.currentLevel", {}, "Current Level"))}</label>
                <select
                  id="${buildingName}CurrentLevel" 
                  data-building="${buildingName}"
                >${renderOptions(chosenCurrent)}</select>
              </div>
              <div style="flex: 1 1 160px; min-width: 140px;">
                <label for="${buildingName}Level">${escapeHtml(translateText("labels.requiredLevel", {}, "Required Level"))}</label>
                <select
                  id="${buildingName}Level" 
                  data-building="${buildingName}"
                >${renderOptions(chosenTarget)}</select>
              </div>
              <button type="button" class="prereqResetBtn inlineActionBtn inlineActionBtnSecondary" data-building="${escapeAttr(buildingName)}" data-required="${escapeAttr(requiredLevelKey)}" title="${escapeAttr(translateText('buttons.reset', {}, 'Reset'))}">${escapeHtml(translateText("buttons.reset", {}, "Reset"))}</button>
            </div>
          </div>
        `;
      } else {
        prereqsHTML += `
          <div class="card-panel" style="margin-bottom: 10px; padding: 10px;">
            <strong>${buildingLabel}</strong><br>
            <div style="margin-top: 6px;">${escapeHtml(translateText("labels.requiredLevel", {}, "Required Level"))}: ${escapeHtml(requiredLevel)}</div>
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

    // Reset button: snap the target level back to the minimum required level.
    document.querySelectorAll("#prerequisitesContainer .prereqResetBtn").forEach(btn => {
      btn.addEventListener("click", function() {
        const prereqBuilding = this.dataset.building;
        const requiredLevel = this.dataset.required;
        if (!prereqBuilding || !requiredLevel) return;

        const levelOptions = getBuildingLevelOrder(prereqBuilding);
        const currentSelect = document.getElementById(`${prereqBuilding}CurrentLevel`);
        const currentValue = currentSelect ? currentSelect.value : (levelOptions[0] || "1");
        const currentIdx = levelOptions.indexOf(currentValue);
        const requiredIdx = levelOptions.indexOf(requiredLevel);
        // Never go below current level
        const finalLevel = (requiredIdx >= currentIdx && requiredIdx >= 0) ? requiredLevel : currentValue;

        const targetSelect = document.getElementById(`${prereqBuilding}Level`);
        if (targetSelect) targetSelect.value = finalLevel;

        const savedState = loadPrerequisiteState(selectedBuilding);
        if (!savedState[prereqBuilding]) savedState[prereqBuilding] = {};
        savedState[prereqBuilding].targetLevel = finalLevel;
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
// CHIEF GEAR CALCULATOR HELPERS
// Functions for managing Chief Gear state, calculations,
// and the Smart Upgrade feature.
// ============================================================

function buildGearLevelDropdown(selectEl) {
  if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder) return;
  selectEl.innerHTML = "";
  CHIEF_GEAR_DATA.levelOrder.forEach(levelKey => {
    const opt = document.createElement("option");
    opt.value = levelKey;
    const levelInfo = CHIEF_GEAR_DATA.levels[levelKey];
    opt.textContent = levelInfo && levelInfo.label ? levelInfo.label : levelKey;
    selectEl.appendChild(opt);
  });
}

function normalizeChiefGearLevelKey(levelKey) {
  const raw = String(levelKey || "none");
  if (!raw.startsWith("pink")) return raw;

  // Backward compatibility for older saved state before red-tier key rename.
  if (raw.startsWith("pink_t2_")) return raw.replace("pink_t2_", "red_t2_");
  if (raw.startsWith("pink_t1_")) return raw.replace("pink_t1_", "red_t1_");
  if (raw.startsWith("pink_")) return raw.replace("pink_", "red_");
  return raw;
}

function clampChiefGearTargetToCurrent(slot) {
  if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder || !GEAR_SLOT_FIELDS[slot]) return;

  const currentEl = document.getElementById(GEAR_SLOT_FIELDS[slot].current);
  const targetEl = document.getElementById(GEAR_SLOT_FIELDS[slot].target);
  if (!currentEl || !targetEl) return;

  const currentIdx = CHIEF_GEAR_DATA.levelOrder.indexOf(currentEl.value || "none");
  const targetIdx = CHIEF_GEAR_DATA.levelOrder.indexOf(targetEl.value || "none");

  if (currentIdx >= 0 && targetIdx >= 0 && targetIdx < currentIdx) {
    targetEl.value = currentEl.value;
  }
}

function clampAllChiefGearTargets() {
  GEAR_SLOTS.forEach(slot => {
    clampChiefGearTargetToCurrent(slot);
  });
}

function initChiefGearPanel() {
  // Populate all gear level dropdowns
  GEAR_SLOTS.forEach(slot => {
    const currentId = GEAR_SLOT_FIELDS[slot].current;
    const targetId = GEAR_SLOT_FIELDS[slot].target;
    const currentEl = document.getElementById(currentId);
    const targetEl = document.getElementById(targetId);
    if (currentEl) buildGearLevelDropdown(currentEl);
    if (targetEl) buildGearLevelDropdown(targetEl);

    if (currentEl) {
      currentEl.removeEventListener("change", handleChiefGearCurrentChange);
      currentEl.addEventListener("change", handleChiefGearCurrentChange);
    }
    if (targetEl) {
      targetEl.removeEventListener("change", handleChiefGearTargetChange);
      targetEl.addEventListener("change", handleChiefGearTargetChange);
    }
  });

  GEAR_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (!el) return;

    el.removeEventListener("input", saveChiefGearState);
    el.removeEventListener("change", saveChiefGearState);
    el.addEventListener("input", saveChiefGearState);
    el.addEventListener("change", saveChiefGearState);
  });

  // Wire up button listeners
  const calculateBtn = document.getElementById("gearCalculateBtn");
  const smartUpgradeBtn = document.getElementById("gearSmartUpgradeBtn");

  if (calculateBtn) {
    calculateBtn.removeEventListener("click", onGearCalculateClick);
    calculateBtn.addEventListener("click", onGearCalculateClick);
  }
  if (smartUpgradeBtn) {
    smartUpgradeBtn.removeEventListener("click", onGearSmartUpgradeClick);
    smartUpgradeBtn.addEventListener("click", onGearSmartUpgradeClick);
  }

  // Restore saved state
  loadChiefGearState();
}

function handleChiefGearCurrentChange(event) {
  const slot = GEAR_SLOTS.find(candidate => GEAR_SLOT_FIELDS[candidate].current === event.target.id);
  if (!slot) return;

  clampChiefGearTargetToCurrent(slot);
  saveChiefGearState();
}

function handleChiefGearTargetChange(event) {
  const slot = GEAR_SLOTS.find(candidate => GEAR_SLOT_FIELDS[candidate].target === event.target.id);
  if (!slot) return;

  clampChiefGearTargetToCurrent(slot);
  saveChiefGearState();
}

function saveChiefGearState() {
  if (!activeAccountId) return;
  const account = accounts.find(a => a.id === activeAccountId);
  if (!account) return;
  if (!account.calculators) account.calculators = {};
  if (!account.calculators.chiefGear) account.calculators.chiefGear = {};

  const state = account.calculators.chiefGear;
  
  // Save gear levels
  state.levels = {};
  GEAR_SLOTS.forEach(slot => {
    const currentEl = document.getElementById(GEAR_SLOT_FIELDS[slot].current);
    const targetEl = document.getElementById(GEAR_SLOT_FIELDS[slot].target);
    state.levels[slot] = {
      current: currentEl ? currentEl.value : "none",
      target: targetEl ? targetEl.value : "none"
    };
  });

  // Save materials
  state.materials = {};
  GEAR_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    state.materials[fieldId] = el ? (parseResourceAmount(el.value) || 0) : 0;
  });

  localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
}

function loadChiefGearState() {
  if (!activeAccountId) return;
  const account = accounts.find(a => a.id === activeAccountId);
  if (!account || !account.calculators || !account.calculators.chiefGear) {
    // Initialize defaults if not yet set
    initializeChiefGearDefaults();
    return;
  }

  const state = account.calculators.chiefGear;

  // Load gear levels
  if (state.levels) {
    GEAR_SLOTS.forEach(slot => {
      const currentEl = document.getElementById(GEAR_SLOT_FIELDS[slot].current);
      const targetEl = document.getElementById(GEAR_SLOT_FIELDS[slot].target);
      const normalizedCurrent = normalizeChiefGearLevelKey(state.levels[slot]?.current || "none");
      const normalizedTarget = normalizeChiefGearLevelKey(state.levels[slot]?.target || "none");
      if (currentEl) currentEl.value = normalizedCurrent;
      if (targetEl) targetEl.value = normalizedTarget;

      // Persist migrated keys so future loads no longer rely on compatibility mapping.
      if (!state.levels[slot]) state.levels[slot] = {};
      state.levels[slot].current = normalizedCurrent;
      state.levels[slot].target = normalizedTarget;
    });
  }

  clampAllChiefGearTargets();

  // Load materials
  if (state.materials) {
    GEAR_MATERIAL_FIELDS.forEach(fieldId => {
      const el = document.getElementById(fieldId);
      if (el && fieldId in state.materials) {
        el.value = String(state.materials[fieldId] ?? 0);
      }
    });
  }
}

function initializeChiefGearDefaults() {
  GEAR_SLOTS.forEach(slot => {
    const currentEl = document.getElementById(GEAR_SLOT_FIELDS[slot].current);
    const targetEl = document.getElementById(GEAR_SLOT_FIELDS[slot].target);
    if (currentEl) currentEl.value = "none";
    if (targetEl) targetEl.value = "none";
  });
  GEAR_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) el.value = "0";
  });
}

function getGearBadgeClass(levelKey) {
  if (!levelKey || levelKey === "none") return "gear-badge-none";
  if (levelKey.startsWith("green")) return "gear-badge-green";
  if (levelKey.startsWith("blue")) return "gear-badge-blue";
  if (levelKey.startsWith("purple")) return "gear-badge-purple";
  if (levelKey.startsWith("gold")) return "gear-badge-gold";
  if (levelKey.startsWith("pink")) return "gear-badge-red";
  if (levelKey.startsWith("red")) return "gear-badge-red";
  return "gear-badge-none";
}

function getGearBonusStatus(levelMap) {
  if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder) {
    return { defenseActive: false, attackActive: false, defenseThreshold: -1, attackThreshold: -1 };
  }

  // Create a map of level key to its index for easy comparison
  const levelKeyToIndex = {};
  CHIEF_GEAR_DATA.levelOrder.forEach((key, idx) => {
    levelKeyToIndex[key] = idx;
  });

  // For each possible threshold level (in order), check how many pieces meet or exceed it
  let defenseThreshold = -1;
  let attackThreshold = -1;
  let maxDefenseGearCount = 0;
  let maxAttackGearCount = 0;

  for (let i = 0; i < CHIEF_GEAR_DATA.levelOrder.length; i++) {
    const thresholdLevel = CHIEF_GEAR_DATA.levelOrder[i];
    const thresholdIndex = i;

    // Count how many pieces have level >= thresholdIndex
    let countAtThreshold = 0;
    GEAR_SLOTS.forEach(slot => {
      const levelKey = levelMap[slot] || "none";
      const levelIndex = levelKeyToIndex[levelKey] || -1;
      if (levelIndex >= thresholdIndex) countAtThreshold++;
    });

    if (countAtThreshold >= 3 && defenseThreshold === -1) {
      defenseThreshold = i;
      maxDefenseGearCount = countAtThreshold;
    }

    if (countAtThreshold === 6 && attackThreshold === -1) {
      attackThreshold = i;
      maxAttackGearCount = 6;
    }
  }

  return {
    defenseActive: defenseThreshold !== -1,
    attackActive: attackThreshold !== -1,
    defenseThreshold,
    attackThreshold
  };
}

function calculateGearCost(currentLevels, targetLevels) {
  if (!CHIEF_GEAR_DATA) return null;

  const costs = {
    hardenedAlloy: 0,
    polishingSolution: 0,
    designPlans: 0,
    lunarAmber: 0,
    shortfall: {}
  };

  const levelKeyToIndex = {};
  CHIEF_GEAR_DATA.levelOrder.forEach((key, idx) => {
    levelKeyToIndex[key] = idx;
  });

  GEAR_SLOTS.forEach(slot => {
    const currentKey = currentLevels[slot] || "none";
    const targetKey = targetLevels[slot] || "none";

    const currentIdx = levelKeyToIndex[currentKey] || -1;
    const targetIdx = levelKeyToIndex[targetKey] || -1;

    // Iterate from current+1 to target (inclusive)
    for (let i = currentIdx + 1; i <= targetIdx; i++) {
      const levelKey = CHIEF_GEAR_DATA.levelOrder[i];
      const levelData = CHIEF_GEAR_DATA.levels[levelKey];
      if (levelData) {
        costs.hardenedAlloy += levelData.hardenedAlloy || 0;
        costs.polishingSolution += levelData.polishingSolution || 0;
        costs.designPlans += levelData.designPlans || 0;
        costs.lunarAmber += levelData.lunarAmber || 0;
      }
    }
  });

  return costs;
}

function canAffordGearUpgrade(materials, cost) {
  return materials.hardenedAlloy >= (cost.hardenedAlloy || 0)
    && materials.polishingSolution >= (cost.polishingSolution || 0)
    && materials.designPlans >= (cost.designPlans || 0)
    && materials.lunarAmber >= (cost.lunarAmber || 0);
}

function getAffordableGearBatchCount(materials, cost, maxCount) {
  if (!cost || maxCount <= 0) return 0;

  const limits = [
    cost.hardenedAlloy > 0 ? Math.floor(materials.hardenedAlloy / cost.hardenedAlloy) : maxCount,
    cost.polishingSolution > 0 ? Math.floor(materials.polishingSolution / cost.polishingSolution) : maxCount,
    cost.designPlans > 0 ? Math.floor(materials.designPlans / cost.designPlans) : maxCount,
    cost.lunarAmber > 0 ? Math.floor(materials.lunarAmber / cost.lunarAmber) : maxCount
  ];

  return Math.max(0, Math.min(maxCount, ...limits));
}

function runSmartUpgrade(currentLevels, materials) {
  if (!CHIEF_GEAR_DATA) {
    return {
      finalLevels: currentLevels,
      upgradeLog: [],
      materialsRemaining: materials,
      totalPiecesUpgraded: 0
    };
  }

  const levelKeyToIndex = {};
  const indexToLevelKey = {};
  CHIEF_GEAR_DATA.levelOrder.forEach((key, idx) => {
    levelKeyToIndex[key] = idx;
    indexToLevelKey[idx] = key;
  });

  // Make a copy to work with
  const finalLevels = { ...currentLevels };
  const remainingMaterials = { ...materials };
  const upgradeLog = [];
  let totalPiecesUpgraded = 0;

  let changed = true;
  while (changed) {
    changed = false;

    // If all materials are zero or negative, break to avoid infinite loop
    if ((remainingMaterials.hardenedAlloy <= 0) && (remainingMaterials.polishingSolution <= 0) && (remainingMaterials.designPlans <= 0) && (remainingMaterials.lunarAmber <= 0)) {
      break;
    }

    let slotsUpgradedThisPass = [];
    // For each slot, try to upgrade if possible
    GEAR_SLOTS.forEach(slot => {
      const currentKey = finalLevels[slot] || "none";
      const currentIdx = levelKeyToIndex[currentKey] || -1;
      if (currentIdx >= CHIEF_GEAR_DATA.levelOrder.length - 1) return; // Already max
      const nextLevelKey = CHIEF_GEAR_DATA.levelOrder[currentIdx + 1];
      const cost = CHIEF_GEAR_DATA.levels[nextLevelKey];
      if (!cost) return;
      // If all costs are zero, break to avoid infinite loop
      if ((cost.hardenedAlloy || 0) === 0 && (cost.polishingSolution || 0) === 0 && (cost.designPlans || 0) === 0 && (cost.lunarAmber || 0) === 0) {
        return;
      }
      // Check if we can afford this upgrade for this slot
      if (
        remainingMaterials.hardenedAlloy >= (cost.hardenedAlloy || 0) &&
        remainingMaterials.polishingSolution >= (cost.polishingSolution || 0) &&
        remainingMaterials.designPlans >= (cost.designPlans || 0) &&
        remainingMaterials.lunarAmber >= (cost.lunarAmber || 0)
      ) {
        // Deduct materials and upgrade
        remainingMaterials.hardenedAlloy -= cost.hardenedAlloy || 0;
        remainingMaterials.polishingSolution -= cost.polishingSolution || 0;
        remainingMaterials.designPlans -= cost.designPlans || 0;
        remainingMaterials.lunarAmber -= cost.lunarAmber || 0;
        finalLevels[slot] = nextLevelKey;
        slotsUpgradedThisPass.push({ slot, label: cost.label });
        changed = true;
      }
    });
    if (slotsUpgradedThisPass.length > 0) {
      // Group by label for summary
      const labelGroups = {};
      slotsUpgradedThisPass.forEach(({ label }) => {
        labelGroups[label] = (labelGroups[label] || 0) + 1;
      });
      Object.entries(labelGroups).forEach(([label, count]) => {
        upgradeLog.push(`Upgraded ${count} gear piece${count === 1 ? "" : "s"} to ${label}`);
        totalPiecesUpgraded += count;
      });
    }
  }

  return {
    finalLevels,
    upgradeLog,
    materialsRemaining: remainingMaterials,
    totalPiecesUpgraded
  };
}

function renderChiefGearResult(html) {
  const resultEl = document.getElementById("gearResult");
  if (resultEl) {
    resultEl.innerHTML = html;
    resultEl.setAttribute("data-has-results", "true");
  }
}

function onGearCalculateClick() {
  clampAllChiefGearTargets();

  const currentLevels = {};
  const targetLevels = {};

  GEAR_SLOTS.forEach(slot => {
    const currentEl = document.getElementById(GEAR_SLOT_FIELDS[slot].current);
    const targetEl = document.getElementById(GEAR_SLOT_FIELDS[slot].target);
    currentLevels[slot] = currentEl ? currentEl.value : "none";
    targetLevels[slot] = targetEl ? targetEl.value : "none";
  });

  const costs = calculateGearCost(currentLevels, targetLevels);
  if (!costs) {
    renderChiefGearResult("<p>Error: Gear data not loaded.</p>");
    return;
  }

  // Get materials available
  const materials = {};
  GEAR_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    materials[fieldId] = el ? (parseResourceAmount(el.value) || 0) : 0;
  });

  const remainingMaterials = {
    hardenedAlloy: materials.gearHardenedAlloy - costs.hardenedAlloy,
    polishingSolution: materials.gearPolishingSolution - costs.polishingSolution,
    designPlans: materials.gearDesignPlans - costs.designPlans,
    lunarAmber: materials.gearLunarAmber - costs.lunarAmber
  };

  const hasDeficit = Object.values(remainingMaterials).some(value => value < 0);
  const hardenedAlloyLabel = escapeHtml(translateText("labels.hardenedAlloy", {}, "Hardened Alloy"));
  const polishingSolutionLabel = escapeHtml(translateText("labels.polishingSolution", {}, "Polishing Solution"));
  const designPlansLabel = escapeHtml(translateText("labels.designPlans", {}, "Design Plans"));
  const lunarAmberLabel = escapeHtml(translateText("labels.lunarAmber", {}, "Lunar Amber"));

  let html = "";
  html += `
    <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);">
      <strong>COST SUMMARY</strong><br>
      ${hardenedAlloyLabel}: ${formatNumber(costs.hardenedAlloy)} | 
      ${polishingSolutionLabel}: ${formatNumber(costs.polishingSolution)} | 
      ${designPlansLabel}: ${formatNumber(costs.designPlans)} | 
      ${lunarAmberLabel}: ${formatNumber(costs.lunarAmber)}
    </div>
  `;

  html += `
    <div class="card-panel" style="margin-top: 15px;">
      <strong>AFTER UPGRADE (MATERIAL BALANCE)</strong><br>
      ${hardenedAlloyLabel}: ${formatNumber(remainingMaterials.hardenedAlloy)} | 
      ${polishingSolutionLabel}: ${formatNumber(remainingMaterials.polishingSolution)} | 
      ${designPlansLabel}: ${formatNumber(remainingMaterials.designPlans)} | 
      ${lunarAmberLabel}: ${formatNumber(remainingMaterials.lunarAmber)}
    </div>
  `;

  // --- Optimized Plan Calculation ---
  // For each slot, upgrade as far as possible toward the target, maximizing resource use
  function calculateOptimizedPlan(currentLevels, targetLevels, materials) {
    if (!CHIEF_GEAR_DATA) return null;
    const levelKeyToIndex = {};
    CHIEF_GEAR_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const optimizedLevels = { ...currentLevels };
    const resources = { ...materials };
    const plan = [];
    let upgradesMade = true;
    while (upgradesMade) {
      upgradesMade = false;
      let bestSlot = null;
      let bestNextIdx = -1;
      let bestCost = null;
      // Find the slot that can be upgraded the furthest (by one step) and is still below its target
      GEAR_SLOTS.forEach(slot => {
        const curIdx = levelKeyToIndex[optimizedLevels[slot] || "none"] || -1;
        const tgtIdx = levelKeyToIndex[targetLevels[slot] || "none"] || -1;
        if (curIdx < tgtIdx && curIdx < CHIEF_GEAR_DATA.levelOrder.length - 1) {
          const nextLevelKey = CHIEF_GEAR_DATA.levelOrder[curIdx + 1];
          const cost = CHIEF_GEAR_DATA.levels[nextLevelKey];
          if (cost &&
            resources.hardenedAlloy >= (cost.hardenedAlloy || 0) &&
            resources.polishingSolution >= (cost.polishingSolution || 0) &&
            resources.designPlans >= (cost.designPlans || 0) &&
            resources.lunarAmber >= (cost.lunarAmber || 0)
          ) {
            if (curIdx + 1 > bestNextIdx) {
              bestSlot = slot;
              bestNextIdx = curIdx + 1;
              bestCost = cost;
            }
          }
        }
      });
      if (bestSlot) {
        const nextLevelKey = CHIEF_GEAR_DATA.levelOrder[bestNextIdx];
        optimizedLevels[bestSlot] = nextLevelKey;
        resources.hardenedAlloy -= bestCost.hardenedAlloy || 0;
        resources.polishingSolution -= bestCost.polishingSolution || 0;
        resources.designPlans -= bestCost.designPlans || 0;
        resources.lunarAmber -= bestCost.lunarAmber || 0;
        plan.push({ slot: bestSlot, to: nextLevelKey, label: bestCost.label });
        upgradesMade = true;
      } else {
        upgradesMade = false;
      }
    }
    return { optimizedLevels, resources, plan };
  }

  // Prepare materials for the optimized plan
  const availableMaterials = {
    hardenedAlloy: materials.gearHardenedAlloy || 0,
    polishingSolution: materials.gearPolishingSolution || 0,
    designPlans: materials.gearDesignPlans || 0,
    lunarAmber: materials.gearLunarAmber || 0
  };
  const optimized = calculateOptimizedPlan(currentLevels, targetLevels, availableMaterials);

  // Render Optimized Plan results
  let optimizedHtml = "<div class='card-panel' style='margin-top:15px;'><strong>OPTIMIZED PLAN</strong><br>";
  if (optimized && optimized.plan.length > 0) {
    optimizedHtml += "<table class='optimized-plan-table'><thead><tr><th>Gear Piece</th><th>Final Level</th></tr></thead><tbody>";
    GEAR_SLOTS.forEach(slot => {
      const finalLevel = optimized.optimizedLevels[slot] || currentLevels[slot] || "none";
      const levelLabel = CHIEF_GEAR_DATA.levels[finalLevel]?.label || finalLevel;
      const pieceLabel = translateText(`labels.${slot}`, {}, prettifyBuildingName(slot));
      optimizedHtml += `<tr><td>${escapeHtml(pieceLabel)}</td><td>${escapeHtml(levelLabel)}</td></tr>`;
    });
    optimizedHtml += "</tbody></table>";
    optimizedHtml += `<div style='margin-top:10px;'><strong>Materials Remaining:</strong><br>
      Hardened Alloy: ${formatNumber(optimized.resources.hardenedAlloy)} | 
      Polishing Solution: ${formatNumber(optimized.resources.polishingSolution)} | 
      Design Plans: ${formatNumber(optimized.resources.designPlans)} | 
      Lunar Amber: ${formatNumber(optimized.resources.lunarAmber)}
    </div>`;
  } else {
    optimizedHtml += "<em>No upgrades possible with current resources.</em>";
  }
  optimizedHtml += "</div>";

  // --- SVS Points Calculation for Chief Gear ---
  let totalSvsPoints = 0;
  GEAR_SLOTS.forEach(slot => {
    const current = currentLevels[slot] || "none";
    const target = targetLevels[slot] || "none";
    if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder) return;
    const levelOrder = CHIEF_GEAR_DATA.levelOrder;
    const levelKeyToIndex = {};
    levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const currentIdx = levelKeyToIndex[current] || -1;
    const targetIdx = levelKeyToIndex[target] || -1;
    for (let i = currentIdx + 1; i <= targetIdx; i++) {
      const levelKey = levelOrder[i];
      const levelInfo = CHIEF_GEAR_DATA.levels[levelKey];
      if (!levelInfo) continue;
      // Exclude charm slots if any (per user request)
      if (levelInfo.isCharm) continue;
      const tier = levelInfo.tier;
      const stars = levelInfo.stars;
      const score = getGearSvsPoints(tier, stars);
      totalSvsPoints += score * 36;
    }
  });
  let svsPointsHtml = `<div class=\"card-panel\" style=\"margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;\">\n      <strong>SVS Points Gained:</strong> <span style=\"font-size:1.2em;\">${formatNumber(totalSvsPoints)}</span>\n    </div>`;
  renderChiefGearResult(html + svsPointsHtml + optimizedHtml);
  saveChiefGearState();
}

function onGearSmartUpgradeClick() {
  clampAllChiefGearTargets();

  const currentLevels = {};
  const materials = {};

  GEAR_SLOTS.forEach(slot => {
    const currentEl = document.getElementById(GEAR_SLOT_FIELDS[slot].current);
    currentLevels[slot] = currentEl ? currentEl.value : "none";
  });

  GEAR_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    materials[fieldId] = el ? (parseResourceAmount(el.value) || 0) : 0;
  });

  // Rename materials keys to match upgrade result keys
  const materialsForUpgrade = {
    hardenedAlloy: materials.gearHardenedAlloy || 0,
    polishingSolution: materials.gearPolishingSolution || 0,
    designPlans: materials.gearDesignPlans || 0,
    lunarAmber: materials.gearLunarAmber || 0
  };

  const result = runSmartUpgrade(currentLevels, materialsForUpgrade);

  // Update the UI with final levels (Optional: we keep user targets now per request)
  /*
  GEAR_SLOTS.forEach(slot => {
    const targetEl = document.getElementById(GEAR_SLOT_FIELDS[slot].target);
    if (targetEl) targetEl.value = result.finalLevels[slot] || "none";
  });
  */

  // Build HTML result
  let html = `<div class="gear-result-container">`;
  html += `<div class="gear-result-row"><strong>Smart Upgrade Complete</strong></div>`;
  if (result.upgradeLog.length > 0) {
    html += `<div class="gear-result-row">Gear pieces upgraded: ${formatNumber(result.totalPiecesUpgraded)}</div>`;
    html += `<div class="gear-upgrade-log">`;
    result.upgradeLog.forEach(logEntry => {
      html += `<div class="gear-log-entry">• ${logEntry}</div>`;
    });
    html += `</div>`;
  } else {
    html += `<p>No upgrades possible with current materials.</p>`;
  }
  html += `<div class="gear-result-row"><strong>Materials Remaining</strong></div>`;
  html += `<div class="gear-result-row">Hardened Alloy: ${formatNumber(result.materialsRemaining.hardenedAlloy)}</div>`;
  html += `<div class="gear-result-row">Polishing Solution: ${formatNumber(result.materialsRemaining.polishingSolution)}</div>`;
  html += `<div class="gear-result-row">Design Plans: ${formatNumber(result.materialsRemaining.designPlans)}</div>`;
  html += `<div class="gear-result-row">Lunar Amber: ${formatNumber(result.materialsRemaining.lunarAmber)}</div>`;
  // --- SVS Points Calculation for Chief Gear Smart Upgrade ---
  let totalSvsPoints = 0;
  GEAR_SLOTS.forEach(slot => {
    const start = currentLevels[slot] || "none";
    const end = result.finalLevels[slot] || start;
    if (!CHIEF_GEAR_DATA || !CHIEF_GEAR_DATA.levelOrder) return;
    const levelOrder = CHIEF_GEAR_DATA.levelOrder;
    const levelKeyToIndex = {};
    levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
    const startIdx = levelKeyToIndex[start] || -1;
    const endIdx = levelKeyToIndex[end] || -1;
    for (let i = startIdx + 1; i <= endIdx; i++) {
      const levelKey = levelOrder[i];
      const levelInfo = CHIEF_GEAR_DATA.levels[levelKey];
      if (!levelInfo) continue;
      // Exclude charm slots if any (per user request)
      if (levelInfo.isCharm) continue;
      const tier = levelInfo.tier;
      const stars = levelInfo.stars;
      const score = getGearSvsPoints(tier, stars);
      totalSvsPoints += score * 36;
    }
  });
  let svsPointsHtml = `<div class=\"card-panel\" style=\"margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;\">\n      <strong>SVS Points Gained:</strong> <span style=\"font-size:1.2em;\">${formatNumber(totalSvsPoints)}</span>\n    </div>`;
  html += svsPointsHtml;
  html += `</div>`;
  renderChiefGearResult(html);
  saveChiefGearState();
}

// ============================================================
// CHIEF CHARM CALCULATOR HELPERS
// Mirrors Chief Gear behavior with charm-specific materials.
// ============================================================

function renderChiefCharmRows() {
  const tableBody = document.getElementById("charmTableBody");
  if (!tableBody) return;

  let html = "";
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const pieceLabel = escapeHtml(translateText(slot.pieceLabelKey, {}, slot.pieceFallback));
    const charmWord = translateText("labels.charm", {}, "Charm");
    const charmLabel = escapeHtml(`${charmWord} ${slot.charmNumber}`);
    html += `
      <div class="gear-table-block">
        <span class="gear-piece-label">${pieceLabel} ${charmLabel}</span>
        <select id="${escapeAttr(slot.currentId)}"></select>
        <select id="${escapeAttr(slot.targetId)}"></select>
      </div>
    `;
  });

  tableBody.innerHTML = html;
}

function buildCharmLevelDropdown(selectEl) {
  if (!CHIEF_CHARM_DATA || !CHIEF_CHARM_DATA.levelOrder) return;
  selectEl.innerHTML = "";
  CHIEF_CHARM_DATA.levelOrder.forEach(levelKey => {
    const opt = document.createElement("option");
    opt.value = levelKey;
    const levelInfo = CHIEF_CHARM_DATA.levels[levelKey];
    opt.textContent = levelInfo && levelInfo.label ? levelInfo.label : levelKey;
    selectEl.appendChild(opt);
  });
}

function clampCharmTargetToCurrent(slotDefinition) {
  if (!CHIEF_CHARM_DATA || !CHIEF_CHARM_DATA.levelOrder) return;

  const currentEl = document.getElementById(slotDefinition.currentId);
  const targetEl = document.getElementById(slotDefinition.targetId);
  if (!currentEl || !targetEl) return;

  const currentIdx = CHIEF_CHARM_DATA.levelOrder.indexOf(currentEl.value || "none");
  const targetIdx = CHIEF_CHARM_DATA.levelOrder.indexOf(targetEl.value || "none");
  if (currentIdx >= 0 && targetIdx >= 0 && targetIdx < currentIdx) {
    targetEl.value = currentEl.value;
  }
}

function clampAllCharmTargets() {
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    clampCharmTargetToCurrent(slot);
  });
}

function initChiefCharmPanel() {

  renderChiefCharmRows();

  // Populate the batch current level dropdown
  const batchCurrentSelect = document.getElementById("charmBatchCurrent");
  if (batchCurrentSelect) {
    buildCharmLevelDropdown(batchCurrentSelect);
  }

  // Set All button logic
  const setAllBtn = document.getElementById("setAllCharmCurrentBtn");
  if (setAllBtn && batchCurrentSelect) {
    setAllBtn.onclick = function() {
      const selectedValue = batchCurrentSelect.value;
      CHARM_SLOT_DEFINITIONS.forEach(slot => {
        const currentEl = document.getElementById(slot.currentId);
        const targetEl = document.getElementById(slot.targetId);
        if (currentEl) currentEl.value = selectedValue;
        if (currentEl && targetEl && CHIEF_CHARM_DATA && CHIEF_CHARM_DATA.levelOrder) {
          const currentIdx = CHIEF_CHARM_DATA.levelOrder.indexOf(selectedValue);
          const targetIdx = CHIEF_CHARM_DATA.levelOrder.indexOf(targetEl.value);
          if (currentIdx >= 0 && targetIdx >= 0 && targetIdx < currentIdx) {
            targetEl.value = selectedValue;
          }
        }
      });
      saveChiefCharmState();
    };
  }

  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentEl = document.getElementById(slot.currentId);
    const targetEl = document.getElementById(slot.targetId);
    if (currentEl) buildCharmLevelDropdown(currentEl);
    if (targetEl) buildCharmLevelDropdown(targetEl);

    if (currentEl) {
      currentEl.removeEventListener("change", onCharmSlotCurrentChange);
      currentEl.addEventListener("change", onCharmSlotCurrentChange);
    }
    if (targetEl) {
      targetEl.removeEventListener("change", onCharmSlotTargetChange);
      targetEl.addEventListener("change", onCharmSlotTargetChange);
    }
  });

  CHARM_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (!el) return;
    el.removeEventListener("input", saveChiefCharmState);
    el.removeEventListener("change", saveChiefCharmState);
    el.addEventListener("input", saveChiefCharmState);
    el.addEventListener("change", saveChiefCharmState);
  });

  const calculateBtn = document.getElementById("charmCalculateBtn");
  const smartUpgradeBtn = document.getElementById("charmSmartUpgradeBtn");
  if (calculateBtn) {
    calculateBtn.removeEventListener("click", onCharmCalculateClick);
    calculateBtn.addEventListener("click", onCharmCalculateClick);
  }
  if (smartUpgradeBtn) {
    smartUpgradeBtn.removeEventListener("click", onCharmSmartUpgradeClick);
    smartUpgradeBtn.addEventListener("click", onCharmSmartUpgradeClick);
  }

  // Restore saved state
  loadChiefCharmState();
}

function onCharmSlotCurrentChange(event) {
  const slot = CHARM_SLOT_DEFINITIONS.find(candidate => candidate.currentId === event.target.id);
  if (!slot) return;
  clampCharmTargetToCurrent(slot);
  saveChiefCharmState();
}

function onCharmSlotTargetChange(event) {
  const slot = CHARM_SLOT_DEFINITIONS.find(candidate => candidate.targetId === event.target.id);
  if (!slot) return;
  clampCharmTargetToCurrent(slot);
  saveChiefCharmState();
}

function saveChiefCharmState() {
  if (!activeAccountId) return;
  const account = accounts.find(a => a.id === activeAccountId);
  if (!account) return;
  if (!account.calculators) account.calculators = {};
  if (!account.calculators.chiefCharm) account.calculators.chiefCharm = {};

  const state = account.calculators.chiefCharm;

  state.levels = {};
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentEl = document.getElementById(slot.currentId);
    const targetEl = document.getElementById(slot.targetId);
    state.levels[slot.slotKey] = {
      current: currentEl ? currentEl.value : "none",
      target: targetEl ? targetEl.value : "none"
    };
  });

  state.materials = {};
  CHARM_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    state.materials[fieldId] = el ? (parseResourceAmount(el.value) || 0) : 0;
  });

  localStorage.setItem("wosCalc_accounts", JSON.stringify(accounts));
}

function loadChiefCharmState() {
  if (!activeAccountId) return;
  const account = accounts.find(a => a.id === activeAccountId);
  if (!account || !account.calculators || !account.calculators.chiefCharm) {
    initializeChiefCharmDefaults();
    return;
  }

  const state = account.calculators.chiefCharm;

  if (state.levels) {
    CHARM_SLOT_DEFINITIONS.forEach(slot => {
      const currentEl = document.getElementById(slot.currentId);
      const targetEl = document.getElementById(slot.targetId);
      if (currentEl) currentEl.value = state.levels[slot.slotKey]?.current || "none";
      if (targetEl) targetEl.value = state.levels[slot.slotKey]?.target || "none";
    });
  }

  clampAllCharmTargets();

  if (state.materials) {
    CHARM_MATERIAL_FIELDS.forEach(fieldId => {
      const el = document.getElementById(fieldId);
      if (el && fieldId in state.materials) {
        el.value = String(state.materials[fieldId] ?? 0);
      }
    });
  }
}

function initializeChiefCharmDefaults() {
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentEl = document.getElementById(slot.currentId);
    const targetEl = document.getElementById(slot.targetId);
    if (currentEl) currentEl.value = "none";
    if (targetEl) targetEl.value = "none";
  });

  CHARM_MATERIAL_FIELDS.forEach(fieldId => {
    const el = document.getElementById(fieldId);
    if (el) el.value = "0";
  });
}

function calculateCharmCost(currentLevels, targetLevels) {
  if (!CHIEF_CHARM_DATA) return null;

  const costs = {
    charmDesigns: 0,
    charmGuides: 0,
    jewelSecrets: 0
  };

  const levelKeyToIndex = {};
  CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => {
    levelKeyToIndex[key] = idx;
  });

  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentKey = currentLevels[slot.slotKey] || "none";
    const targetKey = targetLevels[slot.slotKey] || "none";
    const currentIdx = levelKeyToIndex[currentKey] || -1;
    const targetIdx = levelKeyToIndex[targetKey] || -1;

    for (let i = currentIdx + 1; i <= targetIdx; i++) {
      const levelKey = CHIEF_CHARM_DATA.levelOrder[i];
      const levelData = CHIEF_CHARM_DATA.levels[levelKey];
      if (levelData) {
        costs.charmDesigns += levelData.charmDesigns || 0;
        costs.charmGuides += levelData.charmGuides || 0;
        costs.jewelSecrets += levelData.jewelSecrets || 0;
      }
    }
  });

  return costs;
}

function canAffordCharmUpgrade(materials, cost) {
  return materials.charmDesigns >= (cost.charmDesigns || 0)
    && materials.charmGuides >= (cost.charmGuides || 0)
    && materials.jewelSecrets >= (cost.jewelSecrets || 0);
}

function getAffordableCharmBatchCount(materials, cost, maxCount) {
  if (!cost || maxCount <= 0) return 0;

  const limits = [
    cost.charmDesigns > 0 ? Math.floor(materials.charmDesigns / cost.charmDesigns) : maxCount,
    cost.charmGuides > 0 ? Math.floor(materials.charmGuides / cost.charmGuides) : maxCount,
    cost.jewelSecrets > 0 ? Math.floor(materials.jewelSecrets / cost.jewelSecrets) : maxCount
  ];

  return Math.max(0, Math.min(maxCount, ...limits));
}

function runSmartCharmUpgrade(currentLevels, materials) {
  if (!CHIEF_CHARM_DATA) {
    return {
      finalLevels: currentLevels,
      upgradeLog: [],
      materialsRemaining: materials,
      totalPiecesUpgraded: 0
    };
  }

  const levelKeyToIndex = {};
  CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => {
    levelKeyToIndex[key] = idx;
  });

  const finalLevels = { ...currentLevels };
  const remainingMaterials = { ...materials };
  const upgradeLog = [];
  let totalPiecesUpgraded = 0;


  let changed = true;
  while (changed) {
    changed = false;

    // If all materials are zero or negative, break to avoid infinite loop
    if ((remainingMaterials.charmDesigns <= 0) && (remainingMaterials.charmGuides <= 0) && (remainingMaterials.jewelSecrets <= 0)) {
      break;
    }

    let lowestIndex = Infinity;
    CHARM_SLOT_DEFINITIONS.forEach(slot => {
      const levelKey = finalLevels[slot.slotKey] || "none";
      const idx = levelKeyToIndex[levelKey] || -1;
      if (idx < lowestIndex) lowestIndex = idx;
    });

    if (lowestIndex >= CHIEF_CHARM_DATA.levelOrder.length - 1) break;

    const piecesAtLowest = CHARM_SLOT_DEFINITIONS.filter(slot => {
      const levelKey = finalLevels[slot.slotKey] || "none";
      return (levelKeyToIndex[levelKey] || -1) === lowestIndex;
    });

    const nextLevelKey = CHIEF_CHARM_DATA.levelOrder[lowestIndex + 1];
    if (!nextLevelKey) break;

    const costPerPiece = CHIEF_CHARM_DATA.levels[nextLevelKey];
    if (!costPerPiece) break;

    // If all costs are zero, break to avoid infinite loop
    if ((costPerPiece.charmDesigns || 0) === 0 && (costPerPiece.charmGuides || 0) === 0 && (costPerPiece.jewelSecrets || 0) === 0) {
      break;
    }

    const affordableCount = getAffordableCharmBatchCount(remainingMaterials, costPerPiece, piecesAtLowest.length);
    if (affordableCount <= 0 || !canAffordCharmUpgrade(remainingMaterials, costPerPiece)) break;

    const slotsToUpgrade = piecesAtLowest.slice(0, affordableCount);
    slotsToUpgrade.forEach(slot => {
      finalLevels[slot.slotKey] = nextLevelKey;
      remainingMaterials.charmDesigns -= costPerPiece.charmDesigns || 0;
      remainingMaterials.charmGuides -= costPerPiece.charmGuides || 0;
      remainingMaterials.jewelSecrets -= costPerPiece.jewelSecrets || 0;
    });

    totalPiecesUpgraded += slotsToUpgrade.length;
    upgradeLog.push(translateText(
      "results.charmBatchUpgrade",
      { count: formatNumber(slotsToUpgrade.length), level: costPerPiece.label },
      `Upgraded ${formatNumber(slotsToUpgrade.length)} charms to ${costPerPiece.label}`
    ));
    changed = true;
  }

  return {
    finalLevels,
    upgradeLog,
    materialsRemaining: remainingMaterials,
    totalPiecesUpgraded
  };
}

function renderChiefCharmResult(html) {
  const resultEl = document.getElementById("charmResult");
  if (resultEl) {
    resultEl.innerHTML = html;
    resultEl.setAttribute("data-has-results", "true");
  }
}


// --- Optimized Plan Calculation for Chief Charm ---
function calculateCharmOptimizedPlan(currentLevels, targetLevels, materials) {
  if (!CHIEF_CHARM_DATA) return null;
  const levelKeyToIndex = {};
  CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
  const optimizedLevels = { ...currentLevels };
  const resources = { ...materials };
  const plan = [];
  let upgradesMade = true;
  while (upgradesMade) {
    upgradesMade = false;
    let bestSlot = null;
    let bestNextIdx = -1;
    let bestCost = null;
    // Find the slot that can be upgraded the furthest (by one step) and is still below its target
    CHARM_SLOT_DEFINITIONS.forEach(slot => {
      const curIdx = levelKeyToIndex[optimizedLevels[slot.slotKey] || "none"] || -1;
      const tgtIdx = levelKeyToIndex[targetLevels[slot.slotKey] || "none"] || -1;
      if (curIdx < tgtIdx && curIdx < CHIEF_CHARM_DATA.levelOrder.length - 1) {
        const nextLevelKey = CHIEF_CHARM_DATA.levelOrder[curIdx + 1];
        const cost = CHIEF_CHARM_DATA.levels[nextLevelKey];
        if (cost &&
          resources.charmDesigns >= (cost.charmDesigns || 0) &&
          resources.charmGuides >= (cost.charmGuides || 0) &&
          resources.jewelSecrets >= (cost.jewelSecrets || 0)
        ) {
          if (curIdx + 1 > bestNextIdx) {
            bestSlot = slot;
            bestNextIdx = curIdx + 1;
            bestCost = cost;
          }
        }
      }
    });
    if (bestSlot) {
      const nextLevelKey = CHIEF_CHARM_DATA.levelOrder[bestNextIdx];
      optimizedLevels[bestSlot.slotKey] = nextLevelKey;
      resources.charmDesigns -= bestCost.charmDesigns || 0;
      resources.charmGuides -= bestCost.charmGuides || 0;
      resources.jewelSecrets -= bestCost.jewelSecrets || 0;
      plan.push({ slot: bestSlot.slotKey, to: nextLevelKey, label: bestCost.label });
      upgradesMade = true;
    } else {
      upgradesMade = false;
    }
  }
  return { optimizedLevels, resources, plan };
}

function onCharmCalculateClick() {
  clampAllCharmTargets();

  const currentLevels = {};
  const targetLevels = {};
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentEl = document.getElementById(slot.currentId);
    const targetEl = document.getElementById(slot.targetId);
    currentLevels[slot.slotKey] = currentEl ? currentEl.value : "none";
    targetLevels[slot.slotKey] = targetEl ? targetEl.value : "none";
  });

  const costs = calculateCharmCost(currentLevels, targetLevels);
  if (!costs) {
    renderChiefCharmResult(`<p>${escapeHtml(translateText("alerts.charmDataNotLoaded", {}, "Error: Charm data not loaded."))}</p>`);
    return;
  }

  const materials = {
    charmDesigns: parseResourceAmount(document.getElementById("charmDesignsInput")?.value || "0") || 0,
    charmGuides: parseResourceAmount(document.getElementById("charmGuidesInput")?.value || "0") || 0,
    jewelSecrets: parseResourceAmount(document.getElementById("jewelSecretsInput")?.value || "0") || 0
  };

  const remaining = {
    charmDesigns: materials.charmDesigns - costs.charmDesigns,
    charmGuides: materials.charmGuides - costs.charmGuides,
    jewelSecrets: materials.jewelSecrets - costs.jewelSecrets
  };

  const charmDesignsLabel = translateText("labels.charmDesigns", {}, "Charm Designs");
  const charmGuidesLabel = translateText("labels.charmGuides", {}, "Charm Guides");
  const jewelSecretsLabel = translateText("labels.jewelSecrets", {}, "Jewel Secrets");
  const costSummaryLabel = translateText("results.charmCostSummary", {}, "COST SUMMARY");
  const afterUpgradeLabel = translateText("results.charmAfterUpgradeBalance", {}, "AFTER UPGRADE (MATERIAL BALANCE)");


  // --- SVS Points Calculation ---
  let totalSvsPoints = 0;
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentKey = currentLevels[slot.slotKey] || "none";
    const targetKey = targetLevels[slot.slotKey] || "none";
    const levelKeyToIndex = {};
    if (CHIEF_CHARM_DATA && CHIEF_CHARM_DATA.levelOrder) {
      CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
      const currentIdx = levelKeyToIndex[currentKey] || -1;
      const targetIdx = levelKeyToIndex[targetKey] || -1;
      for (let i = currentIdx + 1; i <= targetIdx; i++) {
        const levelKey = CHIEF_CHARM_DATA.levelOrder[i];
        totalSvsPoints += getSvsPointsForUpgrade(levelKey);
      }
    }
  });

  // Render SVS Points container
  const svsPointsEl = document.getElementById("charmSvsPoints");
  if (svsPointsEl) {
    if (totalSvsPoints > 0) {
      svsPointsEl.style.display = "block";
      svsPointsEl.innerHTML = `<div class="card-panel" style="margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;">
        <strong>SVS Points Gained:</strong> <span style="font-size:1.2em;">${formatNumber(totalSvsPoints)}</span>
      </div>`;
    } else {
      svsPointsEl.style.display = "none";
      svsPointsEl.innerHTML = "";
    }
  }

        let html = `
          <div class=\"card-panel\" style=\"margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);\">
            <strong>${costSummaryLabel}</strong><br>
            ${charmDesignsLabel}: ${formatNumber(costs.charmDesigns)} |
            ${charmGuidesLabel}: ${formatNumber(costs.charmGuides)} |
            ${jewelSecretsLabel}: ${formatNumber(costs.jewelSecrets)}
          </div>
          <div class=\"card-panel\" style=\"margin-top: 15px;\">
            <strong>${afterUpgradeLabel}</strong><br>
            ${charmDesignsLabel}: ${formatNumber(remaining.charmDesigns)} |
            ${charmGuidesLabel}: ${formatNumber(remaining.charmGuides)} |
            ${jewelSecretsLabel}: ${formatNumber(remaining.jewelSecrets)}
          </div>
          <div class=\"card-panel\" style=\"margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;\">
            <strong>SVS Points Gained:</strong> <span style=\"font-size:1.2em;\">${formatNumber(totalSvsPoints)}</span>
          </div>
        `;

  // --- Optimized Plan for Chief Charm ---
  const optimized = calculateCharmOptimizedPlan(currentLevels, targetLevels, materials);
  let optimizedHtml = "<div class='card-panel' style='margin-top:15px;'><strong>OPTIMIZED PLAN</strong><br>";
  if (optimized && optimized.plan.length > 0) {
    optimizedHtml += "<table class='optimized-plan-table'><thead><tr><th>Charm Slot</th><th>Final Level</th></tr></thead><tbody>";
    CHARM_SLOT_DEFINITIONS.forEach(slot => {
      const finalLevel = optimized.optimizedLevels[slot.slotKey] || currentLevels[slot.slotKey] || "none";
      const levelLabel = CHIEF_CHARM_DATA.levels[finalLevel]?.label || finalLevel;
      const slotLabel = translateText(`labels.${slot.slotKey}`, {}, slot.slotKey);
      optimizedHtml += `<tr><td>${escapeHtml(slotLabel)}</td><td>${escapeHtml(levelLabel)}</td></tr>`;
    });
    optimizedHtml += "</tbody></table>";
    optimizedHtml += `<div style='margin-top:10px;'><strong>Materials Remaining:</strong><br>
      ${charmDesignsLabel}: ${formatNumber(optimized.resources.charmDesigns)} |
      ${charmGuidesLabel}: ${formatNumber(optimized.resources.charmGuides)} |
      ${jewelSecretsLabel}: ${formatNumber(optimized.resources.jewelSecrets)}
    </div>`;
  } else {
    optimizedHtml += "<em>No upgrades possible with current resources.</em>";
  }
  optimizedHtml += "</div>";

  renderChiefCharmResult(html + optimizedHtml);
  saveChiefCharmState();
}

function onCharmSmartUpgradeClick() {
  clampAllCharmTargets();

  const currentLevels = {};
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const currentEl = document.getElementById(slot.currentId);
    currentLevels[slot.slotKey] = currentEl ? currentEl.value : "none";
  });

  const materials = {
    charmDesigns: parseResourceAmount(document.getElementById("charmDesignsInput")?.value || "0") || 0,
    charmGuides: parseResourceAmount(document.getElementById("charmGuidesInput")?.value || "0") || 0,
    jewelSecrets: parseResourceAmount(document.getElementById("jewelSecretsInput")?.value || "0") || 0
  };

  const result = runSmartCharmUpgrade(currentLevels, materials);

  /*
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const targetEl = document.getElementById(slot.targetId);
    if (targetEl) targetEl.value = result.finalLevels[slot.slotKey] || "none";
  });
  */

  const smartUpgradeCompleteLabel = translateText("results.charmSmartUpgradeComplete", {}, "Smart Upgrade Complete");
  const charmsUpgradedLabel = translateText("results.charmsUpgraded", {}, "Charms upgraded");
  const noUpgradesLabel = translateText("results.charmNoUpgradesPossible", {}, "No upgrades possible with current materials.");
  const materialsRemainingLabel = translateText("results.charmMaterialsRemaining", {}, "Materials Remaining");
  const charmDesignsLabel = translateText("labels.charmDesigns", {}, "Charm Designs");
  const charmGuidesLabel = translateText("labels.charmGuides", {}, "Charm Guides");
  const jewelSecretsLabel = translateText("labels.jewelSecrets", {}, "Jewel Secrets");

  // --- SVS Points Calculation for Smart Upgrade ---
  let totalSvsPoints = 0;
  CHARM_SLOT_DEFINITIONS.forEach(slot => {
    const startKey = currentLevels[slot.slotKey] || "none";
    const endKey = result.finalLevels[slot.slotKey] || startKey;
    const levelKeyToIndex = {};
    if (CHIEF_CHARM_DATA && CHIEF_CHARM_DATA.levelOrder) {
      CHIEF_CHARM_DATA.levelOrder.forEach((key, idx) => { levelKeyToIndex[key] = idx; });
      const startIdx = levelKeyToIndex[startKey] || -1;
      const endIdx = levelKeyToIndex[endKey] || -1;
      for (let i = startIdx + 1; i <= endIdx; i++) {
        const levelKey = CHIEF_CHARM_DATA.levelOrder[i];
        totalSvsPoints += getSvsPointsForUpgrade(levelKey);
      }
    }
  });

  let html = `<div class="gear-result-container">`;
  html += `<div class="gear-result-row"><strong>${smartUpgradeCompleteLabel}</strong></div>`;
  if (result.upgradeLog.length > 0) {
    html += `<div class="gear-result-row">${charmsUpgradedLabel}: ${formatNumber(result.totalPiecesUpgraded)}</div>`;
    html += `<div class="gear-upgrade-log">`;
    result.upgradeLog.forEach(logEntry => {
      html += `<div class="gear-log-entry">• ${escapeHtml(logEntry)}</div>`;
    });
    html += `</div>`;
  } else {
    html += `<p>${noUpgradesLabel}</p>`;
  }

  html += `<div class="gear-result-row"><strong>${materialsRemainingLabel}</strong></div>`;
  html += `<div class="gear-result-row">${charmDesignsLabel}: ${formatNumber(result.materialsRemaining.charmDesigns)}</div>`;
  html += `<div class="gear-result-row">${charmGuidesLabel}: ${formatNumber(result.materialsRemaining.charmGuides)}</div>`;
  html += `<div class="gear-result-row">${jewelSecretsLabel}: ${formatNumber(result.materialsRemaining.jewelSecrets)}</div>`;
  html += `<div class=\"card-panel\" style=\"margin-top: 10px; background: #1e2a3a; color: #ffe08a; font-size: 1.15em; text-align: center;\">\n      <strong>SVS Points Gained:</strong> <span style=\"font-size:1.2em;\">${formatNumber(totalSvsPoints)}</span>\n    </div>`;
  html += `</div>`;

  renderChiefCharmResult(html);
  saveChiefCharmState();
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
    // Load all data files and SVS points CSV in parallel
    const [buildingsResponse, preqResponse, gearResponse, charmResponse] = await Promise.all([
      fetch("data/buildings.json"),
      fetch("data/prerequisites.json"),
      fetch("data/chiefGear.json"),
      fetch("data/chiefCharm.json")
    ]);
    await loadSvsPointsCsv();

    const buildingsData = await buildingsResponse.json();
    BUILDING_COSTS = buildingsData.buildings;

    const preqData = await preqResponse.json();
    PREREQUISITES = preqData.prerequisites;

    const gearData = await gearResponse.json();
    CHIEF_GEAR_DATA = gearData;

    const charmData = await charmResponse.json();
    CHIEF_CHARM_DATA = charmData;

    console.log("Data loaded successfully", { BUILDING_COSTS, PREREQUISITES, CHIEF_GEAR_DATA, CHIEF_CHARM_DATA, SVS_POINTS_LOOKUP });

    // Initialize accounts (migrates legacy flat keys on first run)
    initAccounts();

    // Load all state from the active account
    loadAllStateFromAccount();

    applyTheme(loadThemePreference());
  } catch (error) {
    console.error("Error loading data:", error);
    alert(translateText("alerts.dataLoadingError", {}, "Error loading calculator data. Please refresh the page."));
  }
}

// (Upgrade Calculator event listeners have been moved to main_spa_loader.js inside initUpgradeCalculatorPanel)


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
    const name = prompt(
      translateText("account.namePrompt", {}, "Account name:"),
      translateText("account.defaultName", { number: accounts.length + 1 }, `Account ${accounts.length + 1}`)
    );
    if (name === null) return; // User cancelled
    const newAccount = addAccount(name.trim() || translateText("account.defaultName", { number: accounts.length + 1 }, `Account ${accounts.length + 1}`));
    switchAccount(newAccount.id);
  });
}

// Rename button: prompt for a new name and update the dropdown
const renameAccountBtn = document.getElementById("renameAccountBtn");
if (renameAccountBtn) {
  renameAccountBtn.addEventListener("click", function() {
    const account = getActiveAccount();
    if (!account) return;
    const newName = prompt(translateText("account.renamePrompt", {}, "Rename account:"), account.name);
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
    if (accounts.length <= 1) { alert(translateText("account.cannotDeleteOnly", {}, "Cannot delete the only account.")); return; }
    if (!confirm(translateText("account.deleteConfirm", { name: account.name }, `Delete "${account.name}"? This cannot be undone.`))) return;
    deleteAccount(account.id);
    loadAllStateFromAccount();
  });
}

// ============================================================
// EVENT LISTENERS — MISC UI
// ============================================================

document.querySelectorAll(".calculator-tab").forEach(tab => {
  tab.addEventListener("click", function() {
    const nextCalculator = this.dataset.calculator;
    if (!nextCalculator) return;
    setActiveCalculator(nextCalculator);
  });
});

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
// (Add Building and Bear Hunt Mail event listeners moved to main_spa_loader.js)

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

function onUpgradeCalculateClick() {
  // Guard: bail out if data hasn't loaded yet
  if (!BUILDING_COSTS || !PREREQUISITES) {
    alert(translateText("alerts.dataStillLoading", {}, "Data is still loading. Please wait and try again."));
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
    alert(translateText("alerts.currentExceedsTarget", {}, "Please ensure current level does not exceed target level."));
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
  const zinmanResourceDiscountPct = parseFloat(document.getElementById("zinmanBastionistPct").value) || 0;
  const agnusProjectManagementHours = parseFloat(document.getElementById("agnusProjectManagementHours").value) || 0;
  const doubleTimePct = document.getElementById("doubleTimeEnabled").checked ? 20 : 0;
  const castleBuffPct = document.getElementById("castleBuffEnabled").checked ? 10 : 0;
  const positionBuffPct = parseFloat(document.getElementById("positionBuffPct").value) || 0;
  const clampedZinmanResourceDiscountPct = Math.max(0, Math.min(100, zinmanResourceDiscountPct));
  const agnusProjectManagementSeconds = Math.max(0, Math.floor(agnusProjectManagementHours * 3600));
  const zinmanResourceMultiplier = 1 - (clampedZinmanResourceDiscountPct / 100);

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
  let baseTotalWood = 0, baseTotalMeat = 0, baseTotalCoal = 0, baseTotalIron = 0;
  let totalWood = 0, totalMeat = 0, totalCoal = 0, totalIron = 0;
  let totalFireCrystals = 0, totalRefinedFireCrystals = 0;
  let totalSeconds = 0;
  let agnusAppliedUpgradeCount = 0;
  let resultsHTML = "";

  for (const item of buildingsToCalc) {
    const { building, currentLevel: curLvl, targetLevel: tgtLvl } = item;
    let baseBuildingWood = 0, baseBuildingMeat = 0, baseBuildingCoal = 0, baseBuildingIron = 0;
    let buildingWood = 0, buildingMeat = 0, buildingCoal = 0, buildingIron = 0;
    let buildingFireCrystals = 0, buildingRefinedFireCrystals = 0;

    if (!BUILDING_COSTS[building]) continue;

    // Walk every level in this building's upgrade path and add its costs
    const upgradePath = getUpgradePathKeys(building, curLvl, tgtLvl);
    let buildingBaseSeconds = 0;
    for (const level of upgradePath) {
      const levelData = BUILDING_COSTS[building][level];
      if (!levelData) continue;

      agnusAppliedUpgradeCount += 1;

      const levelWood = levelData.wood || 0;
      const levelMeat = levelData.meat || 0;
      const levelCoal = levelData.coal || 0;
      const levelIron = levelData.iron || 0;
      const levelFireCrystals = levelData.fireCrystals || 0;
      const levelRefinedFireCrystals = levelData.refinedFireCrystals || 0;

      baseBuildingWood += levelWood;
      baseBuildingMeat += levelMeat;
      baseBuildingCoal += levelCoal;
      baseBuildingIron += levelIron;
      buildingWood += levelWood;
      buildingMeat += levelMeat;
      buildingCoal += levelCoal;
      buildingIron += levelIron;
      buildingFireCrystals += levelFireCrystals;
      buildingRefinedFireCrystals += levelRefinedFireCrystals;
      buildingBaseSeconds += levelData.seconds || 0;
    }

    totalSeconds += buildingBaseSeconds;

    buildingWood = Math.floor(buildingWood * zinmanResourceMultiplier);
    buildingMeat = Math.floor(buildingMeat * zinmanResourceMultiplier);
    buildingCoal = Math.floor(buildingCoal * zinmanResourceMultiplier);
    buildingIron = Math.floor(buildingIron * zinmanResourceMultiplier);

    baseTotalWood += baseBuildingWood;
    baseTotalMeat += baseBuildingMeat;
    baseTotalCoal += baseBuildingCoal;
    baseTotalIron += baseBuildingIron;
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
      extraStatLines.push(`${translateText("results.rallyCapacity", {}, "Rally Capacity")}: ${rallyFrom.toLocaleString()} -> ${rallyTo.toLocaleString()}`);
    }

    if (typeof deployFrom === "number" && typeof deployTo === "number") {
      extraStatLines.push(`${translateText("results.troopDeploymentCapacity", {}, "Troop Deployment Capacity")}: ${deployFrom.toLocaleString()} -> ${deployTo.toLocaleString()}`);
    }

    if (typeof storageFrom === "number" && typeof storageTo === "number") {
      extraStatLines.push(`${translateText("results.storageCapacity", {}, "Storage Capacity")}: ${storageFrom.toLocaleString()} -> ${storageTo.toLocaleString()}`);
    }

    const extraStatsHtml = extraStatLines.length
      ? `<br>${extraStatLines.join("<br>")}`
      : "";
    const crystalCostsHtml = (buildingFireCrystals > 0 || buildingRefinedFireCrystals > 0)
      ? `<br>${translateText("labels.fireCrystals", {}, "Fire Crystals")}: ${buildingFireCrystals.toLocaleString()} | ${translateText("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ${buildingRefinedFireCrystals.toLocaleString()}`
      : "";

    // Display results for this building
    const buildingDisplay = escapeHtml(getBuildingDisplayName(building).toUpperCase());
    const meatLabel = escapeHtml(translateText("labels.meat", {}, "Meat"));
    const woodLabel = escapeHtml(translateText("labels.wood", {}, "Wood"));
    const coalLabel = escapeHtml(translateText("labels.coal", {}, "Coal"));
    const ironLabel = escapeHtml(translateText("labels.iron", {}, "Iron"));
    resultsHTML += `
      <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,255,255,0.35);">
        <strong>${buildingDisplay}</strong> (${curLvl} → ${tgtLvl})<br>
        ${meatLabel}: ${buildingMeat.toLocaleString()} | 
        ${woodLabel}: ${buildingWood.toLocaleString()} | 
        ${coalLabel}: ${buildingCoal.toLocaleString()} | 
        ${ironLabel}: ${buildingIron.toLocaleString()}
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

  // Agnus is a flat time cut applied per upgraded level after percentage buffs.
  const totalAgnusReductionSeconds = agnusProjectManagementSeconds * agnusAppliedUpgradeCount;
  const agnusAdjustedSeconds = Math.max(0, doubleTimeAdjustedSeconds - totalAgnusReductionSeconds);
  const agnusTimeSavedSeconds = Math.max(0, doubleTimeAdjustedSeconds - agnusAdjustedSeconds);

  // Speedups are subtracted from remaining time (converted from minutes to seconds)
  const totalSpeedupSeconds = (generalSpeedupsMinutes + constructionSpeedupsMinutes) * 60;
  const remainingTimeSeconds = Math.max(0, agnusAdjustedSeconds - totalSpeedupSeconds);
  const speedupSurplusSeconds = Math.max(0, totalSpeedupSeconds - agnusAdjustedSeconds);

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
      <strong>${translateText("results.grandTotal", {}, "GRAND TOTAL")}</strong><br>
      ${translateText("labels.meat", {}, "Meat")}: ${totalMeat.toLocaleString()} | 
      ${translateText("labels.wood", {}, "Wood")}: ${totalWood.toLocaleString()} | 
      ${translateText("labels.coal", {}, "Coal")}: ${totalCoal.toLocaleString()} | 
      ${translateText("labels.iron", {}, "Iron")}: ${totalIron.toLocaleString()}<br>
      ${totalFireCrystals > 0 || totalRefinedFireCrystals > 0 ? `${translateText("labels.fireCrystals", {}, "Fire Crystals")}: ${totalFireCrystals.toLocaleString()} | ${translateText("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ${totalRefinedFireCrystals.toLocaleString()}<br>` : ""}
      ${clampedZinmanResourceDiscountPct > 0 ? `${translateText("results.baseCostBeforeZinman", {}, "Base Cost Before Zinman Discount")} - ${translateText("labels.meat", {}, "Meat")}: ${baseTotalMeat.toLocaleString()} | ${translateText("labels.wood", {}, "Wood")}: ${baseTotalWood.toLocaleString()} | ${translateText("labels.coal", {}, "Coal")}: ${baseTotalCoal.toLocaleString()} | ${translateText("labels.iron", {}, "Iron")}: ${baseTotalIron.toLocaleString()}<br>` : ""}
      ${translateText("results.totalUpgradeTimeBase", {}, "Total Upgrade Time (Base)")}: ${formatDuration(totalSeconds)}<br>
      ${translateText("results.additiveSpeed", { percent: additiveSpeedPct.toFixed(1) }, `Additive Speed (${additiveSpeedPct.toFixed(1)}%)`)}: ${formatDuration(additiveAdjustedSeconds)} (${translateText("results.saved", { duration: formatDuration(additiveTimeSavedSeconds) }, `${formatDuration(additiveTimeSavedSeconds)} saved`)})<br>
      ${translateText("results.doubleTime", { percent: clampedDoubleTimePct.toFixed(1) }, `Double Time (${clampedDoubleTimePct.toFixed(1)}%)`)}: ${formatDuration(doubleTimeAdjustedSeconds)} (${translateText("results.saved", { duration: formatDuration(doubleTimeSavedSeconds) }, `${formatDuration(doubleTimeSavedSeconds)} saved`)})
      ${agnusTimeSavedSeconds > 0 ? `<br>${translateText("labels.agnusProjectManagement", {}, "Agnus' Project Management Skill")}: ${formatDuration(agnusAdjustedSeconds)} (${translateText("results.saved", { duration: formatDuration(agnusTimeSavedSeconds) }, `${formatDuration(agnusTimeSavedSeconds)} saved`)})` : ""}
      
      <br><br>
      <strong>${translateText("results.afterUpgradeBalance", {}, "After Upgrade (Backpack Balance)")}</strong><br>
      ${translateText("labels.meat", {}, "Meat")}: ${meatRemaining.toLocaleString()} | 
      ${translateText("labels.wood", {}, "Wood")}: ${woodRemaining.toLocaleString()} | 
      ${translateText("labels.coal", {}, "Coal")}: ${coalRemaining.toLocaleString()} | 
      ${translateText("labels.iron", {}, "Iron")}: ${ironRemaining.toLocaleString()}<br>
      ${totalFireCrystals > 0 || totalRefinedFireCrystals > 0 ? `${translateText("labels.fireCrystals", {}, "Fire Crystals")}: ${fireCrystalsRemaining.toLocaleString()} | ${translateText("labels.refinedFireCrystals", {}, "Refined Fire Crystals")}: ${refinedFireCrystalsRemaining.toLocaleString()}<br>` : ""}
      ${translateText("results.remainingTimeAfterSpeedups", {}, "Remaining Time After Speedups")}: ${formatDuration(remainingTimeSeconds)}
      ${speedupSurplusSeconds > 0 ? `<br>${translateText("results.speedupSurplus", {}, "Speedup Surplus")}: ${formatDuration(speedupSurplusSeconds)}` : ""}
    </div>
  `;

  if (chestPlan) {
    const chestLines = [];
    BASIC_RESOURCES.forEach(resource => {
      const alloc = chestPlan.allocations[resource];
      const usedCount = alloc[1] + alloc[2] + alloc[3];
      if (usedCount === 0) return; // Skip resources that needed no chests

      const resourceLabel = getResourceDisplayName(resource);
      chestLines.push(
        `${escapeHtml(resourceLabel)}: L3 x${alloc[3]}, L2 x${alloc[2]}, L1 x${alloc[1]} ` +
        `(${escapeHtml(translateText("results.provided", { amount: chestPlan.provided[resource].toLocaleString() }, `provided ${chestPlan.provided[resource].toLocaleString()}`))}, ${escapeHtml(translateText("results.uncoveredDeficit", { amount: chestPlan.remainingDeficits[resource].toLocaleString() }, `uncovered deficit ${chestPlan.remainingDeficits[resource].toLocaleString()}`))})`
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
        <strong>${translateText("results.customChestRecommendation", {}, "CUSTOM CHEST RECOMMENDATION")}</strong><br>
        ${chestLines.length ? chestLines.join("<br>") : translateText("results.noChestUsage", {}, "No chest usage needed for current deficits.")}<br><br>
        ${translateText("results.chestsUsed", {}, "Chests Used")}: L3 ${usedL3}/${totalL3} | L2 ${usedL2}/${totalL2} | L1 ${usedL1}/${totalL1}<br>
        <strong>${translateText("results.afterRecommendedChestUse", {}, "After Recommended Chest Use")}</strong><br>
        ${translateText("labels.meat", {}, "Meat")}: ${postChestRemaining.meat.toLocaleString()} |
        ${translateText("labels.wood", {}, "Wood")}: ${postChestRemaining.wood.toLocaleString()} |
        ${translateText("labels.coal", {}, "Coal")}: ${postChestRemaining.coal.toLocaleString()} |
        ${translateText("labels.iron", {}, "Iron")}: ${postChestRemaining.iron.toLocaleString()}
      </div>
    `;
  }

  // Inject all the generated HTML into the results section
  const resultEl = document.getElementById("result");
  resultEl.dataset.hasResults = "true";
  resultEl.innerHTML = resultsHTML;
}


// ============================================================
// STARTUP
// ============================================================

// Kick off the data load as soon as the script runs.
// Because loadData is async, the rest of the page stays
// interactive while it fetches the JSON files.
window.dataReadyPromise = loadData();

document.addEventListener("wos:languagechange", () => {
  applyTheme(document.body.dataset.theme || localStorage.getItem(THEME_STORAGE_KEY) || "wos");

  if (activeCalculator !== CALCULATOR_KEYS.UPGRADE) {
    renderComingSoonPanel(activeCalculator);
  }

  if (BUILDING_COSTS && PREREQUISITES) {
    const targetBuilding = document.getElementById("targetBuilding")?.value || "furnace";
    const currentLevelKey = document.getElementById("currentLevel")?.value || "1";
    const targetLevelKey = document.getElementById("targetLevel")?.value || currentLevelKey;

    renderOptionalBuildings();
    renderBearHuntMails();
    updatePrerequisites(targetBuilding, currentLevelKey, targetLevelKey);

    const resultEl = document.getElementById("result");
    if (resultEl?.dataset.hasResults === "true") {
      document.getElementById("calculateBtn")?.click();
    }
  }

  const updateToast = document.getElementById("swUpdateToast");
  if (updateToast) {
    const label = updateToast.querySelector("span");
    const button = updateToast.querySelector("button");
    if (label) label.textContent = translateText("update.ready", {}, "A new version is ready.");
    if (button) button.textContent = translateText("buttons.refresh", {}, "Refresh");
  }
});

function showUpdateToast(registration) {
  const existingToast = document.getElementById("swUpdateToast");
  if (existingToast) return;

  const toast = document.createElement("div");
  toast.id = "swUpdateToast";
  toast.className = "update-toast";
  toast.setAttribute("role", "status");
  toast.innerHTML = `
    <span>${escapeHtml(translateText("update.ready", {}, "A new version is ready."))}</span>
    <button id="swUpdateBtn" type="button">${escapeHtml(translateText("buttons.refresh", {}, "Refresh"))}</button>
  `;

  document.body.appendChild(toast);

  const refreshBtn = document.getElementById("swUpdateBtn");
  if (!refreshBtn) return;

  refreshBtn.addEventListener("click", () => {
    const waitingWorker = registration && registration.waiting;
    if (waitingWorker) {
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
      return;
    }
    window.location.reload();
  });
}

// Register the service worker for PWA (installable app) support.
// The service worker caches files so the app works offline.
// Register the service worker for PWA (installable app) support.
// The service worker caches files so the app works offline.
if ('serviceWorker' in navigator && 
    !window.location.hostname.includes('localhost') && 
    !window.location.hostname.includes('127.0.0.1')) {
  const SW_VERSION = '17';

  window.addEventListener('load', () => {
    const swUrl = `service-worker.js?v=${SW_VERSION}`;
    navigator.serviceWorker.register(swUrl, { scope: './', updateViaCache: 'none' })
      .then(registration => {
        console.log('Service Worker registered:', registration);

        if (registration.waiting) {
          showUpdateToast(registration);
        }

        registration.addEventListener('updatefound', () => {
          const installingWorker = registration.installing;
          if (!installingWorker) return;

          installingWorker.addEventListener('statechange', () => {
            if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
              showUpdateToast(registration);
            }
          });
        });
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return;
    navigator.serviceWorker.getRegistration().then(registration => {
      if (registration) registration.update();
    });
  });

  // When the service worker updates (new version deployed), reload the
  // page automatically so the user always gets the latest version.
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (refreshing) return;
    // Only reload if there was an old controller (i.e., we are updating, not first-time installing)
    if (!navigator.serviceWorker.controller) return;
    refreshing = true;
    window.location.reload();
  });
}

// Initialize the data loading and store the promise globally so the SPA loader can wait for it
window.dataReadyPromise = loadData();