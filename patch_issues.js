const fs = require('fs');

// 1. Patch index.html
let html = fs.readFileSync('index.html', 'utf8');
const editBtnStr = '<button id="editAccountBtn" class="icon-btn" title="Rename Account" style="background: var(--bg-accent); width: 42px; height: 42px; border-radius: 8px;">✏️</button>\n        ';
if (!html.includes('editAccountBtn')) {
  html = html.replace(
    '<button id="addAccountBtn"',
    editBtnStr + '<button id="addAccountBtn"'
  );
  fs.writeFileSync('index.html', html, 'utf8');
}

// 2. Patch script.js
let js = fs.readFileSync('script.js', 'utf8');

// Fix decimal validation
js = js.replace(
  /const pattern = allowDecimal \? \/\^\(\?:\\d\+\|\\d\*\\.\\d\+\)\$\/ : \/\^\\d\+\$\/;/g,
  `if (allowDecimal && (text === "." || text.endsWith("."))) return true;\n  const pattern = allowDecimal ? /^(?:\\d+|\\d*\\.\\d+)$/ : /^\\d+$/;`
);

// Fix fetch URL queries
js = js.replace(/ \+ window\.location\.search/g, '');

// Add event listener for editAccountBtn
if (!js.includes('editAccountBtn')) {
  const accountSelectListener = `const accountSelect = document.getElementById("accountSelect");`;
  const editListener = `
const editAccountBtn = document.getElementById("editAccountBtn");
if (editAccountBtn) {
  editAccountBtn.addEventListener("click", () => {
    const account = getActiveAccount();
    if (!account) return;
    const currentName = account.name || "Account";
    const newName = prompt(translateText("prompts.renameAccount", {}, "Enter a new name for this account:"), currentName);
    if (newName !== null && newName.trim() !== "") {
      renameAccount(account.id, newName.trim());
      if (typeof renderAccountOptions === 'function') renderAccountOptions();
    }
  });
}

`;
  js = js.replace(accountSelectListener, editListener + accountSelectListener);
}

fs.writeFileSync('script.js', js, 'utf8');
console.log('Patched index.html and script.js');
