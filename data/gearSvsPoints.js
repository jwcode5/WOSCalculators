// Chief Gear SVS Points Lookup
// Generated from Sheet2.csv
// Format: { "tier,stars": levelUpScore }
// Example key: "green (uncommon),0"
const GEAR_SVS_POINTS_LOOKUP = {
  "green (uncommon),0": 1125,
  "green (uncommon),1": 1875,
  "Blue (Rare),0": 300,
  "Blue (Rare),1": 4500,
  "Blue (Rare),2": 5100,
  "Blue (Rare),3": 5440,
  "Purple (Epic),0": 3230,
  "Purple (Epic),1": 3230,
  "Purple (Epic),2": 3225,
  "Purple (Epic),3": 3225,
  "Purple (Epic) T1,0": 3440,
  "Purple (Epic) T1,1": 3440,
  "Purple (Epic) T1,2": 4085,
  "Purple (Epic) T1,3": 4085,
  "Gold (Mythic),0": 6250,
  "Gold (Mythic),1": 6250,
  "Gold (Mythic),2": 6250,
  "Gold (Mythic),3": 6250,
  "Gold (Mythic) T1,0": 6250,
  "Gold (Mythic) T1,1": 6250,
  "Gold (Mythic) T1,2": 6250,
  "Gold (Mythic) T1,3": 6250,
  "Gold (Mythic) T2,0": 6250,
  "Gold (Mythic) T2,1": 6250,
  "Gold (Mythic) T2,2": 6250,
  "Gold (Mythic) T2,3": 6250
  // Red (Legendary) and above are omitted or have '-' in the sheet
};

function getGearSvsPoints(tier, stars) {
  const key = `${tier},${stars}`;
  return GEAR_SVS_POINTS_LOOKUP[key] || 0;
}

export { GEAR_SVS_POINTS_LOOKUP, getGearSvsPoints };
