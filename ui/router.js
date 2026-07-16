import { renderUpgradeCalculator } from './upgrades.js?v=33';
import { renderChiefGearCalculator } from './chiefGear.js?v=33';
import { renderChiefCharmCalculator } from './chiefCharm.js?v=33';
import { renderPetsCalculator } from './pets.js?v=33';
import { renderExpertsCalculator } from './experts.js?v=33';
import { renderExpertSkillsCalculator } from './expertSkills.js?v=33';
import { renderSvsCalculator } from './svs.js?v=33';

const appContent = document.getElementById('app-content');
const navItems = document.querySelectorAll('.nav-item');

const pages = {
  upgrade: renderUpgradeCalculator,
  chiefGear: renderChiefGearCalculator,
  chiefCharm: renderChiefCharmCalculator,
  pets: renderPetsCalculator,
  experts: renderExpertsCalculator,
  expertSkills: renderExpertSkillsCalculator,
  svs: renderSvsCalculator
};

async function navigateTo(route) {
  navItems.forEach(item => {
    if (item.dataset.route === route) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });

  localStorage.setItem('activeRoute', route);
  if (window.setActiveCalculator) window.setActiveCalculator(route);
  else window.activeCalculator = route;
  if (pages[route]) {
    appContent.innerHTML = '<div>Loading...</div>';
    try {
      await pages[route](appContent);
      generateQuickLinks();
    } catch (err) {
      console.error(err);
      appContent.innerHTML = '<div style="color:red">Error loading module</div>';
    }
  } else {
    appContent.innerHTML = '<h2>404 Not Found</h2>';
  }
}

const mobileMenuBtn = document.getElementById('mobileMenuBtn');
if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('expanded');
  });
}

navItems.forEach(item => {
  item.addEventListener('click', (e) => {
    const route = e.target.dataset.route;
    if (route) {
      navigateTo(route);
      // Auto-close mobile menu when a nav link is clicked
      document.getElementById('sidebar').classList.remove('expanded');
    }
  });
});

document.addEventListener('DOMContentLoaded', () => {
  const savedRoute = localStorage.getItem('activeRoute') || 'upgrade';
  navigateTo(savedRoute);
});


function generateQuickLinks() {
  const container = document.getElementById('app-content');
  // We target the entire card-panel so we don't cut off its top border
  const panels = container.querySelectorAll('.card-panel');
  
  // Only build nav if there are multiple sections
  let validSections = 0;
  panels.forEach(p => { if(p.querySelector('h2')) validSections++; });
  if (validSections < 2) return;

  const nav = document.createElement('div');
  nav.className = 'quick-links-bar';
  
  panels.forEach((panel, idx) => {
    const h2 = panel.querySelector('h2');
    if (!h2) return; // Skip panels without a title

    if (!panel.id) panel.id = 'section-' + idx;
    
    // Natively offset the scroll destination so it lands below the sticky bar
    panel.style.scrollMarginTop = '80px';

    const a = document.createElement('a');
    a.href = '#' + panel.id;
    a.className = 'quick-link';
    a.textContent = h2.textContent;
    a.addEventListener('click', (e) => {
      e.preventDefault();
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    nav.appendChild(a);
  });
  
  container.insertBefore(nav, container.firstChild);
}
