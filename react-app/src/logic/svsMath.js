
/**
 * Core math logic for SVS Calculator.
 */
export function calculateSvs(inputs) {
  let day1 = 0;
  day1 += (inputs.d1_fc || 0) * 2000;
  day1 += (inputs.d1_fcShards || 0) * 1000;
  day1 += (inputs.d1_refinedFc || 0) * 30000;
  day1 += (inputs.d1_speedups || 0) * 30;
  day1 += (inputs.d1_charm || 0) * 70;

  let day2 = 0;
  day2 += (inputs.d2_fc || 0) * 2000;
  day2 += (inputs.d2_fcShards || 0) * 1000;
  day2 += (inputs.d2_refinedFc || 0) * 30000;
  day2 += (inputs.d2_speedups || 0) * 30;
  day2 += (inputs.d2_luckyWheel || 0) * 8000;
  day2 += (inputs.d2_rareHero || 0) * 350;
  day2 += (inputs.d2_epicHero || 0) * 1220;
  day2 += (inputs.d2_mythicHero || 0) * 3040;
  day2 += (inputs.d2_meat || 0) * 2;
  day2 += (inputs.d2_wood || 0) * 2;
  day2 += (inputs.d2_coal || 0) * 2;
  day2 += (inputs.d2_iron || 0) * 2;

  let day3 = 0;
  day3 += (inputs.d3_petAdv || 0) * 50;
  day3 += (inputs.d3_advWildMark || 0) * 15000;
  day3 += (inputs.d3_comWildMark || 0) * 1150;
  day3 += (inputs.d3_luckyWheel || 0) * 8000;
  day3 += (inputs.d3_charm || 0) * 70;
  day3 += (inputs.d3_rareHero || 0) * 350;
  day3 += (inputs.d3_epicHero || 0) * 1220;
  day3 += (inputs.d3_mythicHero || 0) * 3040;
  day3 += (inputs.d3_polarTerror || 0) * 30000;
  day3 += (inputs.d3_beast1 || 0) * 9000;
  day3 += (inputs.d3_beast11 || 0) * 9750;
  day3 += (inputs.d3_beast16 || 0) * 10500;
  day3 += (inputs.d3_beast21 || 0) * 11250;
  day3 += (inputs.d3_beast26 || 0) * 12000;

  let day4 = 0;
  day4 += (inputs.d4_charm || 0) * 70;
  day4 += (inputs.d4_essenceStone || 0) * 4000;
  day4 += (inputs.d4_widget || 0) * 8000;
  day4 += (inputs.d4_mithril || 0) * 40000;
  day4 += (inputs.d4_t1 || 0) * 3;
  day4 += (inputs.d4_t2 || 0) * 4;
  day4 += (inputs.d4_t3 || 0) * 5;
  day4 += (inputs.d4_t4 || 0) * 8;
  day4 += (inputs.d4_t5 || 0) * 12;
  day4 += (inputs.d4_t6 || 0) * 18;
  day4 += (inputs.d4_t7 || 0) * 25;
  day4 += (inputs.d4_t8 || 0) * 35;
  day4 += (inputs.d4_t9 || 0) * 45;
  day4 += (inputs.d4_t10 || 0) * 60;
  day4 += (inputs.d4_t11 || 0) * 75;

  let day5 = 0;
  day5 += (inputs.d5_petAdv || 0) * 50;
  day5 += (inputs.d5_advWildMark || 0) * 15000;
  day5 += (inputs.d5_comWildMark || 0) * 1150;
  day5 += (inputs.d5_essenceStone || 0) * 4000;
  day5 += (inputs.d5_widget || 0) * 8000;
  day5 += (inputs.d5_mithril || 0) * 40000;
  day5 += (inputs.d5_gearScore || 0) * 36;
  day5 += (inputs.d5_fc || 0) * 2000;
  day5 += (inputs.d5_fcShards || 0) * 1000;
  day5 += (inputs.d5_refinedFc || 0) * 30000;
  day5 += (inputs.d5_speedups || 0) * 30;

  const valMult = inputs.valeriaMultiplier || 1.0;
  day1 = Math.floor(day1 * valMult);
  day2 = Math.floor(day2 * valMult);
  day3 = Math.floor(day3 * valMult);
  day4 = Math.floor(day4 * valMult);
  day5 = Math.floor(day5 * valMult);

  const total = day1 + day2 + day3 + day4 + day5;

  return { day1, day2, day3, day4, day5, total };
}

