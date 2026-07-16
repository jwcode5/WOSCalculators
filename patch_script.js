const fs = require('fs');

function patchScriptJs() {
    const file = 'script.js';
    if (!fs.existsSync(file)) return;
    let content = fs.readFileSync(file, 'utf8');

    // 1. Add globalValeriaSkill to SUPPLY_FIELD_IDS
    if (!content.includes('"globalValeriaSkill"')) {
        content = content.replace(
            /"customChestL3UnsecuredCount"\r?\n\];/g,
            '"customChestL3UnsecuredCount",\n  "globalValeriaSkill"\n];'
        );
        console.log("Patched SUPPLY_FIELD_IDS");
    }

    // 2. Update attachSupplyPersistenceListeners
    if (!content.includes('panel.dispatchEvent(new Event("input"')) {
        const old2 = /el\.addEventListener\(eventName, saveSuppliesState\);\r?\n\s*\}\);/g;
        const new2 = `el.addEventListener(eventName, (e) => {
      saveSuppliesState();
      const panel = document.querySelector("#app-content > section, #app-content > div");
      if (panel) {
        panel.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });
  });`;
        content = content.replace(old2, new2);
        console.log("Patched attachSupplyPersistenceListeners");
    }

    // 3. Update svsValeriaSkill
    if (content.includes('getVal("svsValeriaSkill")')) {
        content = content.replace(/getVal\("svsValeriaSkill"\)/g, 'getVal("globalValeriaSkill")');
        console.log("Patched svsValeriaSkill");
    }

    fs.writeFileSync(file, content, 'utf8');
}

patchScriptJs();
