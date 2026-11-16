// Standard Whiteout Survival 1200x1200 World Map Layout Constants
// Coordinate origin (0,0) is bottom-left, Sunfire Castle center at (600, 600)

export const MAP_SIZE = 1200;

// Central Zones
// Combined Sunfire Castle & Turret footprint:
// Bottom-left at (594, 594), 12x12 area spanning x: [594, 606], y: [594, 606]
// Center point is exactly (600, 600)
export const SUNFIRE_CASTLE = {
  id: 'sunfire_castle',
  type: 'castle',
  name: 'Sunfire Castle & Turrets',
  x: 594,
  y: 594,
  width: 12,
  height: 12
};

export const CASTLE_TURRETS = [];

// Unbuildable Red Alert Zone / Castle Ruins:
// Bottom-left (552, 552), bottom-right (647, 552) -> 96x96 area spanning [552, 648] on X and Y
export const RUINS_ALERT_ZONE = {
  name: 'Ruins (No-Build Zone)',
  minX: 552,
  maxX: 648,
  minY: 552,
  maxY: 648
};

// Concentric Regional Boundaries:
// Fertile Land: Bottom-left (450, 450), bottom-right (749, 450) -> 300x300 area spanning [450, 750]
export const FERTILE_LAND_ZONE = {
  name: 'Fertile Land',
  minX: 450,
  maxX: 750,
  minY: 450,
  maxY: 750
};

// Tundra: Bottom-left (300, 300), bottom-right (899, 300) -> 600x600 area spanning [300, 900]
export const TUNDRA_ZONE = {
  name: 'Tundra',
  minX: 300,
  maxX: 900,
  minY: 300,
  maxY: 900
};

// Icefield: Everything outside Tundra (coords 0 to 1200)
export const ICEFIELD_ZONE = {
  name: 'Icefield',
  minX: 0,
  maxX: 1200,
  minY: 0,
  maxY: 1200
};

// Fixed World Map Objectives: 4 Strongholds (6x6) & 12 Fortresses (6x6)
// Coords are bottom-left
export const FIXED_STRONGHOLDS = [
  { id: 'sh_1', name: 'Stronghold 1', x: 597, y: 800, width: 6, height: 6, type: 'stronghold' },
  { id: 'sh_2', name: 'Stronghold 2', x: 400, y: 597, width: 6, height: 6, type: 'stronghold' },
  { id: 'sh_3', name: 'Stronghold 3', x: 597, y: 400, width: 6, height: 6, type: 'stronghold' },
  { id: 'sh_4', name: 'Stronghold 4', x: 800, y: 597, width: 6, height: 6, type: 'stronghold' }
];

export const FIXED_FORTRESSES = [
  { id: 'fort_1',  name: 'Fortress 1',  x: 237, y: 828, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_2',  name: 'Fortress 2',  x: 237, y: 606, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_3',  name: 'Fortress 3',  x: 237, y: 348, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_4',  name: 'Fortress 4',  x: 366, y: 237, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_5',  name: 'Fortress 5',  x: 588, y: 237, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_6',  name: 'Fortress 6',  x: 846, y: 237, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_7',  name: 'Fortress 7',  x: 957, y: 348, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_8',  name: 'Fortress 8',  x: 957, y: 606, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_9',  name: 'Fortress 9',  x: 957, y: 828, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_10', name: 'Fortress 10', x: 846, y: 957, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_11', name: 'Fortress 11', x: 606, y: 957, width: 6, height: 6, type: 'fortress' },
  { id: 'fort_12', name: 'Fortress 12', x: 366, y: 957, width: 6, height: 6, type: 'fortress' }
];

// Each Fortress & Stronghold has a 60x60 Red Alert / No-Build Zone
// Extends 27 tiles out on all 4 sides from the 6x6 building:
// [x - 27, x + 33], [y - 27, y + 33] (span 60x60)
export const getObjectiveRestrictedZone = (obj) => ({
  name: `${obj.name} Restricted Zone`,
  minX: obj.x - 27,
  maxX: obj.x + 33,
  minY: obj.y - 27,
  maxY: obj.y + 33
});
