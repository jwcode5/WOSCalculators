import os

def patch_script_js():
    path = "script.js"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. Add globalValeriaSkill to SUPPLY_FIELD_IDS
    old1 = '  "customChestL3SecuredCount",\n  "customChestL3UnsecuredCount"\n];'
    new1 = '  "customChestL3SecuredCount",\n  "customChestL3UnsecuredCount",\n  "globalValeriaSkill"\n];'
    if old1 in content:
        content = content.replace(old1, new1)
        print("Patched SUPPLY_FIELD_IDS")
    
    # 2. Update attachSupplyPersistenceListeners to trigger calculation
    old2 = 'const eventName = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";\n    el.addEventListener(eventName, saveSuppliesState);\n  });'
    new2 = 'const eventName = el.type === "checkbox" || el.tagName === "SELECT" ? "change" : "input";\n    el.addEventListener(eventName, (e) => {\n      saveSuppliesState();\n      const panel = document.querySelector("#app-content > section, #app-content > div");\n      if (panel) {\n        panel.dispatchEvent(new Event("input", { bubbles: true }));\n      }\n    });\n  });'
    if old2 in content:
        content = content.replace(old2, new2)
        print("Patched attachSupplyPersistenceListeners")

    # 3. Use globalValeriaSkill instead of svsValeriaSkill
    old3 = 'const valeriaLevel = getVal("svsValeriaSkill");\n  const valeriaMultiplier = 1 + (valeriaLevel * 2) / 100;'
    new3 = 'const valeriaLevel = getVal("globalValeriaSkill");\n  const valeriaMultiplier = 1 + (valeriaLevel * 2) / 100;'
    if old3 in content:
        content = content.replace(old3, new3)
        print("Patched svsValeriaSkill to globalValeriaSkill")
        
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)

def unhide_smart_buttons():
    files = ["ui/pets.js", "ui/chiefGear.js", "ui/chiefCharm.js", "ui/experts.js", "ui/expertSkills.js"]
    for path in files:
        if not os.path.exists(path):
            continue
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Remove display: none !important; from button rows and buttons
        content = content.replace('style="display: none !important; display: flex;', 'style="display: flex;')
        content = content.replace('style="display: none !important; flex: 1;', 'style="flex: 1;')
        
        with open(path, "w", encoding="utf-8") as f:
            f.write(content)
        print("Unhid buttons in " + path)

patch_script_js()
unhide_smart_buttons()
