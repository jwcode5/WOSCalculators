import re

with open("script.js", "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove Skills HTML from initExpertsPanel
content = re.sub(
    r'<!-- Skills -->.*?</div>\s*</div>\s*`;',
    '</div>\n      </div>\n    `;',
    content,
    flags=re.DOTALL
)

# 2. Remove Skills dropdown population
content = re.sub(
    r'// Skills\s*\[1, 2, 3, 4\]\.forEach\(skill => \{.*?\}\);',
    '',
    content,
    flags=re.DOTALL
)

# 3. Remove skill change listeners
content = re.sub(
    r'document\.querySelectorAll\("\.skill-current-select"\)\.forEach\(sel => \{.*?\}\);\s*document\.querySelectorAll\("\.skill-target-select"\)\.forEach\(sel => \{.*?\}\);\s*',
    '',
    content,
    flags=re.DOTALL
)

# 4. Remove skill materials from materialIds
content = content.replace(
    '"expertAdvancementSigils", "expertCompass", "expertFieryHeart", "expertSailOfConquest",\n    "expertSkillExp", "expertSkillBooks"',
    '"expertAdvancementSigils", "expertCompass", "expertFieryHeart", "expertSailOfConquest"'
)

# 5. Fix saveExpertsState
old_save = '''function saveExpertsState() {
  const account = getActiveAccount();
  if (!account) return;

  const calculators = account.calculators || {};
  const expertsState = calculators.experts || {};

  expertsState.levels = {};
  const EXPERT_ORDER = ["Agnes", "Cyrille", "Holger", "Romulus"];
  EXPERT_ORDER.forEach(name => {
    const currentSel = document.querySelector(`.expert-current-select[data-expert="${name}"]`);
    const targetSel = document.querySelector(`.expert-target-select[data-expert="${name}"]`);
    const specSigils = document.querySelector(`.expert-specific-sigils[data-expert="${name}"]`);
    
    if (currentSel && targetSel) {
      expertsState.levels[name] = {
        current: currentSel.value,
        target: targetSel.value,
        specificSigils: specSigils ? parseInt(specSigils.value) || 0 : 0,
        skills: {}
      };
      
      [1, 2, 3, 4].forEach(s => {
        const sCur = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
        const sTgt = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
        if (sCur && sTgt) {
          expertsState.levels[name].skills[s] = {
            current: sCur.value,
            target: sTgt.value
          };
        }
      });
    }
  });

  expertsState.materials = {
    advancementSigils: document.getElementById("expertAdvancementSigils")?.value || 0,
    compass: document.getElementById("expertCompass")?.value || 0,
    fieryHeart: document.getElementById("expertFieryHeart")?.value || 0,
    sailOfConquest: document.getElementById("expertSailOfConquest")?.value || 0,
    skillExp: document.getElementById("expertSkillExp")?.value || 0,
    skillBooks: document.getElementById("expertSkillBooks")?.value || 0
  };

  calculators.experts = expertsState;
  updateActiveAccount({ calculators });
}'''

new_save = '''function saveExpertsState() {
  const account = getActiveAccount();
  if (!account) return;

  const calculators = account.calculators || {};
  const expertsState = calculators.experts || { levels: {}, materials: {} };
  if (!expertsState.levels) expertsState.levels = {};
  if (!expertsState.materials) expertsState.materials = {};

  const EXPERT_ORDER = ["Agnes", "Cyrille", "Holger", "Romulus"];
  EXPERT_ORDER.forEach(name => {
    if (!expertsState.levels[name]) expertsState.levels[name] = { skills: {} };
    if (!expertsState.levels[name].skills) expertsState.levels[name].skills = {};
    
    const currentSel = document.querySelector(`.expert-current-select[data-expert="${name}"]`);
    const targetSel = document.querySelector(`.expert-target-select[data-expert="${name}"]`);
    const specSigils = document.querySelector(`.expert-specific-sigils[data-expert="${name}"]`);
    
    if (currentSel) expertsState.levels[name].current = currentSel.value;
    if (targetSel) expertsState.levels[name].target = targetSel.value;
    if (specSigils) expertsState.levels[name].specificSigils = parseInt(specSigils.value) || 0;
    
    [1, 2, 3, 4].forEach(s => {
      const sCur = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
      const sTgt = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
      if (sCur) expertsState.levels[name].skills[s] = expertsState.levels[name].skills[s] || {};
      if (sCur) expertsState.levels[name].skills[s].current = sCur.value;
      if (sTgt) expertsState.levels[name].skills[s] = expertsState.levels[name].skills[s] || {};
      if (sTgt) expertsState.levels[name].skills[s].target = sTgt.value;
    });
  });

  const materialIds = [
    "expertAdvancementSigils", "expertCompass", "expertFieryHeart", "expertSailOfConquest",
    "expertSkillExp", "expertSkillBooks"
  ];
  materialIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      const key = id.replace("expert", "");
      const camelKey = key.charAt(0).toLowerCase() + key.slice(1);
      expertsState.materials[camelKey] = parseInt(el.value) || 0;
    }
  });

  calculators.experts = expertsState;
  updateActiveAccount({ calculators });
}'''
content = content.replace(old_save, new_save)

# 6. Fix calculateExperts
content = re.sub(r'let totalSkillExpNeeded = 0;\s*let totalSkillBooksNeeded = 0;\s*', '', content)
content = re.sub(r'let skillExp = 0;\s*let skillBooks = 0;\s*', '', content)
content = re.sub(r'// Skills\s*\[1, 2, 3, 4\].forEach\(s => \{.*?\}\);\s*', '', content, flags=re.DOTALL)
content = re.sub(r'totalSkillExpNeeded \+= skillExp;\s*totalSkillBooksNeeded \+= skillBooks;\s*', '', content)
content = content.replace('${skillExp > 0 ? `${translateText("labels.skillExp", {}, "Skill Exp Needed")}: ${skillExp.toLocaleString()} <br>` : ""}\n          ${skillBooks > 0 ? `${translateText("labels.skillBooks", {}, "Skill Books Needed")}: ${skillBooks.toLocaleString()} <br>` : ""}', '')
content = content.replace('|| skillExp > 0 || skillBooks > 0', '')
content = content.replace('const invSkillExp = parseInt(document.getElementById("expertSkillExp")?.value) || 0;\n  const invSkillBooks = parseInt(document.getElementById("expertSkillBooks")?.value) || 0;\n', '')
content = content.replace('const remainingSkillExp = Math.max(0, totalSkillExpNeeded - invSkillExp);\n  const remainingSkillBooks = Math.max(0, totalSkillBooksNeeded - invSkillBooks);\n', '')
content = content.replace('${translateText("labels.skillExp", {}, "Total Skill Exp Required")}: ${totalSkillExpNeeded.toLocaleString()}<br>\n      ${translateText("labels.skillBooks", {}, "Total Skill Books Required")}: ${totalSkillBooksNeeded.toLocaleString()}<br><br>', '<br>')
content = content.replace('${translateText("labels.remainingSkillExp", {}, "Skill Exp Needed")}: ${remainingSkillExp.toLocaleString()}<br>\n      ${translateText("labels.remainingSkillBooks", {}, "Skill Books Needed")}: ${remainingSkillBooks.toLocaleString()}', '')
content = content.replace('&& totalSkillExpNeeded === 0 && totalSkillBooksNeeded === 0', '')


# 7. Append initExpertSkillsPanel and calculateExpertSkills
new_funcs = '''
function initExpertSkillsPanel() {
  const container = document.getElementById("expertSkillCollectionContainer");
  if (!container || !EXPERTS_DATA) return;

  const EXPERT_ORDER = ["Agnes", "Cyrille", "Holger", "Romulus"];
  let html = "";

  EXPERT_ORDER.forEach(name => {
    const key = name.toLowerCase();
    const localizedName = translateText(`expert.${key}`, {}, name);

    html += `
      <div class="pet-row" data-expert="${name}" style="flex-wrap: wrap; margin-bottom: 15px; background: rgba(0,0,0,0.2); padding: 10px; border-radius: 5px;">
        <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div class="pet-name-cell">
            <span class="pet-name-text" style="font-size: 1.2em; color: #ffeb3b;">${escapeHtml(localizedName)}</span>
          </div>
        </div>
        
        <div style="width: 100%; display: grid; grid-template-columns: 100px 1fr 1fr; gap: 10px; align-items: center; margin-bottom: 5px;">
          <strong>${translateText("labels.skill1", {}, "Skill 1")}</strong>
          <select class="skill-current-select" data-expert="${name}" data-skill="1"></select>
          <select class="skill-target-select" data-expert="${name}" data-skill="1"></select>
          
          <strong>${translateText("labels.skill2", {}, "Skill 2")}</strong>
          <select class="skill-current-select" data-expert="${name}" data-skill="2"></select>
          <select class="skill-target-select" data-expert="${name}" data-skill="2"></select>
          
          <strong>${translateText("labels.skill3", {}, "Skill 3")}</strong>
          <select class="skill-current-select" data-expert="${name}" data-skill="3"></select>
          <select class="skill-target-select" data-expert="${name}" data-skill="3"></select>
          
          <strong>${translateText("labels.skill4", {}, "Skill 4")}</strong>
          <select class="skill-current-select" data-expert="${name}" data-skill="4"></select>
          <select class="skill-target-select" data-expert="${name}" data-skill="4"></select>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;

  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData || !expertData.levels) return;

    [1, 2, 3, 4].forEach(skill => {
      const skillArr = expertData.skills[skill.toString()];
      let sHtml = '';
      if (skillArr) {
        for (let i = 0; i < skillArr.length; i++) {
          const sLvl = skillArr[i].level;
          const sRel = skillArr[i].relationship;
          const reqStr = (sRel && sRel !== '-') ? ` (Req: ${sRel})` : '';
          sHtml += `<option value="${sLvl}" data-req="${sRel}">Lv.${sLvl}${reqStr}</option>`;
        }
      } else {
        sHtml = `<option value="1">Lv.1</option>`;
      }
      const sCur = container.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${skill}"]`);
      const sTgt = container.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${skill}"]`);
      if (sCur) sCur.innerHTML = sHtml;
      if (sTgt) sTgt.innerHTML = sHtml;
    });
  });

  const batchCurrent = document.getElementById("setAllExpertSkillCurrent");
  const batchTarget = document.getElementById("setAllExpertSkillTarget");
  if (batchCurrent && batchTarget && EXPERTS_DATA["Agnes"]) {
    let optionsHTML = '';
    const skillArr = EXPERTS_DATA["Agnes"].skills["1"];
    if (skillArr) {
      for (let i = 0; i < skillArr.length; i++) {
        const sLvl = skillArr[i].level;
        optionsHTML += `<option value="${sLvl}">Lv.${sLvl}</option>`;
      }
    }
    batchCurrent.innerHTML = optionsHTML;
    batchTarget.innerHTML = optionsHTML;
  }

  document.getElementById("setAllExpertSkillCurrentBtn")?.addEventListener("click", () => {
    const val = document.getElementById("setAllExpertSkillCurrent")?.value;
    if (val) {
      document.querySelectorAll(".skill-current-select").forEach(sel => {
        sel.value = val;
        const name = sel.dataset.expert;
        const s = sel.dataset.skill;
        const tgtSel = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
        if (tgtSel && parseInt(tgtSel.value) < parseInt(val)) tgtSel.value = val;
      });
      saveExpertsState();
    }
  });

  document.getElementById("setAllExpertSkillTargetBtn")?.addEventListener("click", () => {
    const val = document.getElementById("setAllExpertSkillTarget")?.value;
    if (val) {
      document.querySelectorAll(".skill-target-select").forEach(sel => {
        const name = sel.dataset.expert;
        const s = sel.dataset.skill;
        const curSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
        if (curSel && parseInt(curSel.value) > parseInt(val)) {
        } else {
          sel.value = val;
        }
      });
      saveExpertsState();
    }
  });

  document.querySelectorAll(".skill-current-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const name = e.target.dataset.expert;
      const s = e.target.dataset.skill;
      const tgtSel = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
      if (tgtSel && parseInt(tgtSel.value) < parseInt(e.target.value)) tgtSel.value = e.target.value;
      saveExpertsState();
    });
  });

  document.querySelectorAll(".skill-target-select").forEach(sel => {
    sel.addEventListener("change", (e) => {
      const name = e.target.dataset.expert;
      const s = e.target.dataset.skill;
      const curSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
      if (curSel && parseInt(curSel.value) > parseInt(e.target.value)) e.target.value = curSel.value;
      saveExpertsState();
    });
  });

  document.getElementById("expertSkillsCalculateBtn")?.addEventListener("click", calculateExpertSkills);

  ["expertSkillExp", "expertSkillBooks"].forEach(id => {
    document.getElementById(id)?.addEventListener("input", saveExpertsState);
  });

  loadExpertsState();
}

function calculateExpertSkills() {
  if (!EXPERTS_DATA) return;

  let totalSkillExpNeeded = 0;
  let totalSkillBooksNeeded = 0;
  let resultsHTML = "";

  const EXPERT_ORDER = ["Agnes", "Cyrille", "Holger", "Romulus"];

  // Read affinity state
  const account = getActiveAccount();
  const expertsState = (account && account.calculators && account.calculators.experts) ? account.calculators.experts : { levels: {} };

  EXPERT_ORDER.forEach(name => {
    const expertData = EXPERTS_DATA[name];
    if (!expertData) return;

    let skillExp = 0;
    let skillBooks = 0;
    
    // Evaluate if affinity prerequisite is met
    const curAffinityLevel = expertsState.levels[name]?.current ? parseInt(expertsState.levels[name].current) : 1;

    let expertWarnings = [];

    [1, 2, 3, 4].forEach(s => {
      const sCurSel = document.querySelector(`.skill-current-select[data-expert="${name}"][data-skill="${s}"]`);
      const sTgtSel = document.querySelector(`.skill-target-select[data-expert="${name}"][data-skill="${s}"]`);
      
      if (sCurSel && sTgtSel) {
        const sc = parseInt(sCurSel.value) || 1;
        const st = parseInt(sTgtSel.value) || 1;
        
        // Check affinity requirement for target skill
        const opt = sTgtSel.options[sTgtSel.selectedIndex];
        const reqRel = opt?.dataset?.req;
        if (reqRel && reqRel !== '-' && reqRel !== '') {
            const reqLevel = getLevelForRelationship(name, reqRel);
            if (curAffinityLevel < reqLevel) {
                expertWarnings.push(`Skill ${s} Target Lv.${st} requires Affinity ${reqRel} (Lv.${reqLevel}). Current is Lv.${curAffinityLevel}.`);
            }
        }

        if (sc < st) {
          const sArr = expertData.skills[s.toString()];
          if (sArr) {
            for (let sl = sc + 1; sl <= st; sl++) {
              const row = sArr.find(r => r.level === sl);
              if (row) {
                skillExp += (row.exp || 0);
                skillBooks += (row.book || 0);
              }
            }
          }
        }
      }
    });

    totalSkillExpNeeded += skillExp;
    totalSkillBooksNeeded += skillBooks;

    if (skillExp > 0 || skillBooks > 0 || expertWarnings.length > 0) {
      const localizedName = translateText(`expert.${name.toLowerCase()}`, {}, name);
      resultsHTML += `
        <div class="card-panel" style="margin-top: 15px; border-left: 3px solid rgba(255,165,0,0.5);">
          <strong>${escapeHtml(localizedName)}</strong><br>
          ${expertWarnings.map(w => `<div style="color: orange; font-size: 0.9em;">&#9888; ${w}</div>`).join("")}
          ${skillExp > 0 ? `${translateText("labels.skillExp", {}, "Skill Exp Needed")}: ${skillExp.toLocaleString()} <br>` : ""}
          ${skillBooks > 0 ? `${translateText("labels.skillBooks", {}, "Skill Books Needed")}: ${skillBooks.toLocaleString()} <br>` : ""}
        </div>
      `;
    }
  });

  const invSkillExp = parseInt(document.getElementById("expertSkillExp")?.value) || 0;
  const invSkillBooks = parseInt(document.getElementById("expertSkillBooks")?.value) || 0;

  const remainingSkillExp = Math.max(0, totalSkillExpNeeded - invSkillExp);
  const remainingSkillBooks = Math.max(0, totalSkillBooksNeeded - invSkillBooks);

  let grandTotalHTML = `
    <div class="card-panel" style="margin-top: 15px;">
      <strong>${translateText("results.grandTotal", {}, "GRAND TOTAL")}</strong><br>
      ${translateText("labels.skillExp", {}, "Total Skill Exp Required")}: ${totalSkillExpNeeded.toLocaleString()}<br>
      ${translateText("labels.skillBooks", {}, "Total Skill Books Required")}: ${totalSkillBooksNeeded.toLocaleString()}<br><br>
      
      <strong>${translateText("results.afterInventory", {}, "Remaining After Inventory")}</strong><br>
      ${translateText("labels.remainingSkillExp", {}, "Skill Exp Needed")}: ${remainingSkillExp.toLocaleString()}<br>
      ${translateText("labels.remainingSkillBooks", {}, "Skill Books Needed")}: ${remainingSkillBooks.toLocaleString()}
    </div>
  `;

  if (totalSkillExpNeeded === 0 && totalSkillBooksNeeded === 0) {
    resultsHTML += `<div class="card-panel" style="margin-top: 15px;">${translateText("results.noUpgrades", {}, "No upgrades selected or already at target level.")}</div>`;
  } else {
    resultsHTML += grandTotalHTML;
  }

  const resultEl = document.getElementById("expertSkillsResult");
  if (resultEl) {
    resultEl.dataset.hasResults = "true";
    resultEl.innerHTML = resultsHTML;
  }
}
'''
content += new_funcs

with open("script.js", "w", encoding="utf-8") as f:
    f.write(content)
