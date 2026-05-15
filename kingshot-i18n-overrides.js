/**
 * kingshot-i18n-overrides.js
 *
 * Overrides selected English (and all-language) translation keys
 * so that the Kingshot reskin uses the correct in-game terminology.
 *
 * This file is only loaded when the site detects it is running on
 * the kscalculator domain (or in local ks-dev mode).
 *
 * It patches TRANSLATIONS after i18n.js has already defined them,
 * so the full language-switcher system keeps working — the overrides
 * are applied on top of every locale's base strings via the t() fallback.
 */

(function applyKingshotOverrides() {
  // Wait until TRANSLATIONS is available (i18n.js must load first)
  if (typeof TRANSLATIONS === 'undefined') {
    console.warn('[KS] TRANSLATIONS not found — kingshot overrides skipped.');
    return;
  }

  // ─── Helper to deep-merge override objects into a locale ──────────────
  function deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (
        source[key] !== null &&
        typeof source[key] === 'object' &&
        !Array.isArray(source[key])
      ) {
        if (!target[key]) target[key] = {};
        deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
  }

  // ─── English Kingshot overrides ────────────────────────────────────────
  const ksEnglish = {
    page: {
      title: {
        index: 'KS Calc',
        about: 'About - KS Calc',
        contact: 'Contact - KS Calc'
      }
    },
    app: {
      name: 'KS Calc'
    },
    labels: {
      // Resources
      meat: 'Bread',
      coal: 'Stone',
      fireCrystals: 'Truegold',
      refinedFireCrystals: 'Tempered Truegold',
      // Construction buffs
      hyenaBuff: "Construction Aide (Gray Wolf) Buff",
      zinmanBastionist: "Saul's Resourceful Skill",
      agnusProjectManagement: "Pan's Master Architect Skill",
    },
    resource: {
      meat: 'Bread',
      coal: 'Stone'
    },
    building: {
      // Core buildings
      furnace: 'Town Center',
      infantry_camp: 'Barracks',
      lancer_camp: 'Stable',
      marksman_camp: 'Range',
      research_center: 'Academy',
      cookhouse: 'Kitchen',
      barricade: 'Guard Station',
      // Shared names kept identical — included for completeness
      embassy: 'Embassy',
      command_center: 'Command Center',
      infirmary: 'Infirmary',
      storehouse: 'Storehouse',
      war_academy: 'War Academy'
    },
    results: {
      // Update any result strings that reference "Zinman" by name
      baseCostBeforeZinman: "Base Cost Before Saul's Discount"
    },
    alerts: {
      goalExceedsFurnace:
        "{building}: goal level cannot exceed the Town Center goal level. The Town Center must be upgraded first."
    }
  };

  // Apply to the English locale
  if (TRANSLATIONS.en) {
    deepMerge(TRANSLATIONS.en, ksEnglish);
  }

  // ─── Spanish Kingshot overrides ────────────────────────────────────────
  const ksSpanish = {
    page: { title: { index: 'KS Calc', about: 'Acerca de - KS Calc', contact: 'Contacto - KS Calc' } },
    app: { name: 'KS Calc' },
    labels: {
      meat: 'Pan',
      coal: 'Piedra',
      fireCrystals: 'Truegold',
      refinedFireCrystals: 'Truegold templado',
      hyenaBuff: 'Ayudante Constructor (Lobo Gris)',
      zinmanBastionist: 'Habilidad Astuta de Saul',
      agnusProjectManagement: 'Habilidad Arquitecto de Pan',
    },
    resource: { meat: 'Pan', coal: 'Piedra' },
    building: {
      furnace: 'Centro de la ciudad',
      infantry_camp: 'Barracas',
      lancer_camp: 'Establo',
      marksman_camp: 'Polígono',
      research_center: 'Academia',
      cookhouse: 'Cocina',
      barricade: 'Puesto de guardia',
    }
  };
  if (TRANSLATIONS.es) deepMerge(TRANSLATIONS.es, ksSpanish);

  // ─── German Kingshot overrides ─────────────────────────────────────────
  const ksGerman = {
    page: { title: { index: 'KS Calc', about: 'Über - KS Calc', contact: 'Kontakt - KS Calc' } },
    app: { name: 'KS Calc' },
    labels: {
      meat: 'Brot',
      coal: 'Stein',
      fireCrystals: 'Wahres Gold',
      refinedFireCrystals: 'Gehärtetes Wahres Gold',
      hyenaBuff: 'Bauhilfe (Grauer Wolf)',
      zinmanBastionist: "Sauls Fähigkeit: Einfallsreich",
      agnusProjectManagement: "Pans Fähigkeit: Chefarchitekt",
    },
    resource: { meat: 'Brot', coal: 'Stein' },
    building: {
      furnace: 'Stadtzentrum',
      infantry_camp: 'Kaserne',
      lancer_camp: 'Stall',
      marksman_camp: 'Schießstand',
      research_center: 'Akademie',
      cookhouse: 'Küche',
      barricade: 'Wachposten',
    }
  };
  if (TRANSLATIONS.de) deepMerge(TRANSLATIONS.de, ksGerman);

  // ─── French Kingshot overrides ─────────────────────────────────────────
  const ksFrench = {
    page: { title: { index: 'KS Calc', about: 'À propos - KS Calc', contact: 'Contact - KS Calc' } },
    app: { name: 'KS Calc' },
    labels: {
      meat: 'Pain',
      coal: 'Pierre',
      fireCrystals: 'Vraior',
      refinedFireCrystals: 'Vraior trempé',
      hyenaBuff: 'Aide Construction (Loup Gris)',
      zinmanBastionist: "Compétence Astucieuse de Saul",
      agnusProjectManagement: "Compétence Architecte de Pan",
    },
    resource: { meat: 'Pain', coal: 'Pierre' },
    building: {
      furnace: 'Centre-ville',
      infantry_camp: 'Caserne',
      lancer_camp: 'Écurie',
      marksman_camp: 'Champ de tir',
      research_center: 'Académie',
      cookhouse: 'Cuisine',
      barricade: 'Poste de garde',
    }
  };
  if (TRANSLATIONS.fr) deepMerge(TRANSLATIONS.fr, ksFrench);

  console.log('[KS] Kingshot i18n overrides applied successfully.');
})();
