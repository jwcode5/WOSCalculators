const fs = require('fs');

let js = fs.readFileSync('i18n.js', 'utf8');

const modalCode = `
// Language Modal Logic
document.addEventListener('DOMContentLoaded', () => {
  const langBtn = document.getElementById('languageMenuBtn');
  const modal = document.getElementById('languageModal');
  const closeBtn = document.getElementById('closeLanguageModal');
  const grid = document.getElementById('languageGrid');
  
  if (langBtn && modal && closeBtn && grid) {
    langBtn.addEventListener('click', () => modal.style.display = 'block');
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });

    const languages = [
      { value: 'en', label: 'English' },
      { value: 'es', label: 'Español' },
      { value: 'de', label: 'Deutsch' },
      { value: 'fr', label: 'Français' },
      { value: 'pt', label: 'Português' },
      { value: 'zh-CN', label: '简体中文' },
      { value: 'pl', label: 'Polski' },
      { value: 'ko', label: '한국어' },
      { value: 'ja', label: '日本語' },
      { value: 'fil', label: 'Filipino' }
    ];
    
    // Clear the grid first in case it was already populated
    grid.innerHTML = '';
    
    languages.forEach(lang => {
      const btn = document.createElement('button');
      btn.className = 'secondary-button';
      btn.style.padding = '12px';
      btn.textContent = lang.label;
      btn.addEventListener('click', () => {
        setLanguage(lang.value);
        modal.style.display = 'none';
      });
      grid.appendChild(btn);
    });
  }
});
`;

js = js.replace('function initI18n() {', modalCode + '\nfunction initI18n() {');

fs.writeFileSync('i18n.js', js, 'utf8');
console.log("Updated i18n.js with modal logic");
