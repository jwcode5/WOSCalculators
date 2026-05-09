const LANGUAGE_STORAGE_KEY = "wosCalc_language";
const DEFAULT_LANGUAGE = "en";

const TRANSLATIONS = {
  en: {
    page: {
      title: {
        index: "WOS Calc",
        about: "About - WOS Calc",
        contact: "Contact - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Language"
    },
    theme: {
      darkMode: "Dark Mode",
      lightMode: "Light Mode"
    },
    account: {
      renameTitle: "Rename account",
      addTitle: "Add account",
      deleteTitle: "Delete account",
      addButton: "+ Account",
      activeAccount: "Active account:",
      namePrompt: "Account name:",
      renamePrompt: "Rename account:",
      defaultName: "Account {number}",
      cannotDeleteOnly: "Cannot delete the only account.",
      deleteConfirm: "Delete \"{name}\"? This cannot be undone."
    },
    nav: {
      calculatorTabs: "Calculator tabs",
      siteLinks: "Site links",
      calculator: "Calculator",
      selectCalculator: "Select Calculator",
      about: "About",
      contact: "Contact"
    },
    calculator: {
      upgrade: "Upgrade",
      chiefGear: "Chief Gear",
      chiefCharm: "Chief Charm",
      pets: "Pets",
      whatIf: "What If",
      experts: "Experts Calculator",
      heroGear: "Hero Gear",
      koi: "KoI Calculator",
      research: "Research Upgrades",
      svs: "SvS Calculator",
      troopTraining: "Troop Training",
      warAcademy: "War Academy",
      about: "About",
      contact: "Contact",
      chiefGearFull: "Chief Gear Calculator",
      chiefCharmFull: "Chief Charm Calculator",
      whatIfFull: "What If Calculator",
      generic: "Calculator"
    },
    sections: {
      targetBuilding: "Target Building",
      yourResources: "Your Resources",
      constructionBuffs: "Construction Buffs (%)",
      requiredBuildings: "Required Buildings",
      optionalAdditionalBuildings: "Optional Additional Buildings",
      bearHuntMail: "Bear Hunt Mail",
      chiefGearLevels: "Chief Gear Levels",
      chiefGearMaterials: "Your Materials",
      chiefCharmLevels: "Chief Charm Levels",
      chiefCharmMaterials: "Your Materials",
      petLevels: "Pet Levels",
      petMaterials: "Your Materials"
    },
    labels: {
      building: "Building",
      currentLevel: "Current Level",
      targetLevel: "Target Level",
      targetGoalLevel: "Target (Goal) Level",
      meat: "Meat",
      wood: "Wood",
      coal: "Coal",
      iron: "Iron",
      fireCrystals: "Fire Crystals",
      refinedFireCrystals: "Refined Fire Crystals",
      useCustomResourceChests: "Use Custom Resource Chests",
      level1Unsecured: "Level 1 Unsecured",
      level1Secured: "Level 1 Secured",
      level2Unsecured: "Level 2 Unsecured",
      level2Secured: "Level 2 Secured",
      level3Unsecured: "Level 3 Unsecured",
      level3Secured: "Level 3 Secured",
      generalSpeedups: "General Speedups (minutes)",
      constructionSpeedups: "Construction Speedups (minutes)",
      doubleTime: "Double Time (20%)",
      castleBuff: "Castle Buff (10%)",
      constructionSpeed: "Construction Speed",
      hyenaBuff: "Builder's Aide (Hyena) Buff",
      zinmanBastionist: "Zinman's Bastionist Skill",
      positionBuff: "Position Buff",
      damageTier: "Damage Tier",
      mail: "Mail",
      setAllCurrentLevels: "Set all current levels",
      requiredLevel: "Required Level",
      hat: "Cap (Lancer)",
      watch: "Watch (Lancer)",
      coat: "Coat (Infantry)",
      pants: "Pants (Infantry)",
      ring: "Ring (Marksman)",
      shortStaff: "Weapon (Marksman)",
      hardenedAlloy: "Hardened Alloy",
      polishingSolution: "Polishing Solution",
      designPlans: "Design Plans",
      lunarAmber: "Lunar Amber",
      charm: "Charm",
      charmDesigns: "Charm Designs",
      charmGuides: "Charm Guides",
      jewelSecrets: "Jewel Secrets",
      pet: "Pet",
      petFood: "Pet Food",
      tamingManual: "Taming Manual",
      energizingPotion: "Energizing Potion",
      strengtheningSerum: "Strengthening Serum"
    },
    buttons: {
      addBuilding: "+ Add Building",
      addBearHuntMail: "+ Add Bear Hunt Mail",
      calculate: "Calculate",
      remove: "Remove",
      setAll: "Set All",
      refresh: "Refresh",
      reset: "Reset",
      calculateCost: "Calculate Cost",
      smartUpgrade: "Smart Upgrade"
    },
    options: {
      none0: "None (0%)"
    },
    building: {
      furnace: "Furnace",
      embassy: "Embassy",
      research_center: "Research Center",
      infirmary: "Infirmary",
      infantry_camp: "Infantry Camp",
      lancer_camp: "Lancer Camp",
      marksman_camp: "Marksman Camp",
      barricade: "Barricade",
      command_center: "Command Center",
      storehouse: "Storehouse",
      arcticWolf: "Arctic Wolf",
      muskOx: "Musk Ox",
      giantTapir: "Giant Tapir",
      titanRoc: "Titan Roc",
      giantElk: "Giant Elk",
      snowLeopard: "Snow Leopard",
      caveLion: "Cave Lion",
      snowApe: "Snow Ape",
      ironRhino: "Iron Rhino",
      saberToothTiger: "Saber-Tooth Tiger",
      mammoth: "Mammoth",
      frostGorilla: "Frost Gorilla",
      frostscaleChameleon: "Frostscale Chameleon",
      abyssalShelldragon: "Abyssal Shelldragon",
      caveHyena: "Cave Hyena",
      setAllCurrentLevels: "Set all current levels",
      setAllTargetLevels: "Set all target levels"
    },
    comingSoon: {
      title: "Coming Soon",
      placeholderIntro: "This calculator tab is visible now as a placeholder so users can see what is planned next.",
      placeholderOutro: "Once this calculator is live, this message can be removed and replaced with the full tool.",
      heading: "{calculator} - Coming Soon",
      accountStructured: "Account data is already structured for {account}. When {calculator} goes live, its values will be saved under this same account and will switch with your account selector.",
      unlockRequirement: "Reach Lv.{level} to unlock next"
    },
    aboutPage: {
      heading: "About",
      placeholderOne: "This About page is a placeholder and will be expanded later.",
      placeholderTwo: "The calculator architecture is being prepared first so new tools can ship without data loss between accounts.",
      returnToCalculator: "Return to Calculator"
    },
    contactPage: {
      heading: "Contact",
      placeholderOne: "This Contact page is a placeholder and will be expanded later.",
      placeholderTwo: "You can keep adding calculator features first and plug in final contact details when ready.",
      returnToCalculator: "Return to Calculator"
    },
    update: {
      ready: "A new version is ready."
    },
    alerts: {
      cannotAddOptionalBuilding: "Cannot add optional building: no level data available",
      dataLoadingError: "Error loading calculator data. Please refresh the page.",
      dataStillLoading: "Data is still loading. Please wait and try again.",
      currentExceedsTarget: "Please ensure current level does not exceed target level.",
      invalidOptionalBuilding: "One optional building has an invalid building or level selection. Please reselect it and try again.",
      optionalTargetBelowCurrent: "{building}: target level cannot be below current level.",
      invalidBearHuntTier: "One Bear Hunt Mail row has an invalid damage tier. Please reselect it and try again.",
      invalidBearHuntCount: "Bear Hunt Mail counts must be 0 or higher.",
      goalExceedsFurnace: "{building}: goal level cannot exceed the furnace goal level. The furnace must be upgraded first."
    },
    validation: {
      nonNegativeResource: "{label} must be a non-negative number. You can use plain numbers or K/M/B suffixes.",
      nonNegativeNumber: "{label} must be a non-negative number.",
      nonNegativeWholeNumber: "{label} must be a non-negative whole number."
    },
    results: {
      loading: "Loading building data...",
      bearHuntMail: "BEAR HUNT MAIL (+{count} mail added to backpack)",
      grandTotal: "GRAND TOTAL",
      baseCostBeforeZinman: "Base Cost Before Zinman Discount",
      totalUpgradeTimeBase: "Total Upgrade Time (Base)",
      additiveSpeed: "Additive Speed ({percent}%)",
      doubleTime: "Double Time ({percent}%)",
      saved: "{duration} saved",
      afterUpgradeBalance: "After Upgrade (Backpack Balance)",
      remainingTimeAfterSpeedups: "Remaining Time After Speedups",
      speedupSurplus: "Speedup Surplus",
      customChestRecommendation: "CUSTOM CHEST RECOMMENDATION",
      noChestUsage: "No chest usage needed for current deficits.",
      chestsUsed: "Chests Used",
      afterRecommendedChestUse: "After Recommended Chest Use",
      provided: "provided {amount}",
      uncoveredDeficit: "uncovered deficit {amount}",
      rallyCapacity: "Rally Capacity",
      troopDeploymentCapacity: "Troop Deployment Capacity",
      storageCapacity: "Storage Capacity",
      essenceStones: "Essence Stones",
      luckyHeroGearChests: "Lucky Hero Gear Chests",
      xpComponents: "XP Components",
      allianceTokens: "Alliance Tokens",
      charmCostSummary: "COST SUMMARY",
      charmAfterUpgradeBalance: "AFTER UPGRADE (MATERIAL BALANCE)",
      charmSmartUpgradeComplete: "Smart Upgrade Complete",
      charmNoUpgradesPossible: "No upgrades possible with current materials.",
      charmMaterialsRemaining: "Materials Remaining",
      charmsUpgraded: "Charms upgraded",
      charmBatchUpgrade: "Upgraded {count} charms to {level}",
      optimizedPlan: "OPTIMIZED PLAN",
      gearPiece: "Gear Piece",
      finalLevel: "Final Level",
      svsPointsGained: "SVS Points Gained:",
      materialsRemaining: "Materials Remaining:"
    },
    resource: {
      meat: "Meat",
      wood: "Wood",
      coal: "Coal",
      iron: "Iron"
    },
    gearColor: {
      green: "Green",
      blue: "Blue",
      purple: "Purple",
      gold: "Gold",
      red: "Red"
    },
    gearLevel: {
      notCrafted: "Not Crafted",
      level: "Level"
    }
  },
  es: {
    page: {
      title: {
        index: "WOS Calc",
        about: "Acerca de - WOS Calc",
        contact: "Contacto - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Idioma"
    },
    theme: {
      darkMode: "Modo oscuro",
      lightMode: "Modo claro"
    },
    account: {
      renameTitle: "Cambiar nombre de la cuenta",
      addTitle: "Agregar cuenta",
      deleteTitle: "Eliminar cuenta",
      addButton: "+ Cuenta",
      activeAccount: "Cuenta activa:",
      namePrompt: "Nombre de la cuenta:",
      renamePrompt: "Cambiar nombre de la cuenta:",
      defaultName: "Cuenta {number}",
      cannotDeleteOnly: "No se puede eliminar la unica cuenta.",
      deleteConfirm: "¿Eliminar \"{name}\"? Esta accion no se puede deshacer."
    },
    nav: {
      calculatorTabs: "Pestanas de calculadora",
      siteLinks: "Enlaces del sitio",
      calculator: "Calculadora",
      selectCalculator: "Seleccionar Calculadora",
      about: "Acerca de",
      contact: "Contacto"
    },
    calculator: {
      upgrade: "Mejora",
      chiefGear: "Equipo del Jefe",
      chiefCharm: "Talismán del Jefe",
      pets: "Mascotas",
      whatIf: "Que pasaria si",
      experts: "Calculadora de Expertos",
      heroGear: "Equipo de Héroe",
      koi: "Calculadora de KoI",
      research: "Mejoras de Investigación",
      svs: "Calculadora de SvS",
      troopTraining: "Entrenamiento de Tropas",
      warAcademy: "Academia de Guerra",
      about: "Acerca de",
      contact: "Contacto",
      chiefGearFull: "Calculadora de Equipo del Jefe",
      chiefCharmFull: "Calculadora de Talismán del Jefe",
      whatIfFull: "Calculadora de Que Pasaria Si",
      generic: "Calculadora"
    },
    sections: {
      targetBuilding: "Edificio objetivo",
      yourResources: "Tus recursos",
      constructionBuffs: "Bonificaciones de construcción (%)",
      requiredBuildings: "Edificios requeridos",
      optionalAdditionalBuildings: "Edificios adicionales opcionales",
      bearHuntMail: "Correo de Caza del Oso",
      chiefGearLevels: "Niveles de Equipo del Jefe",
      chiefGearMaterials: "Tus materiales",
      chiefCharmLevels: "Niveles de Talismán del Jefe",
      chiefCharmMaterials: "Tus materiales",
      petLevels: "Niveles de Mascota",
      petMaterials: "Tus materiales"
    },
    labels: {
      building: "Edificio",
      currentLevel: "Nivel actual",
      targetLevel: "Nivel objetivo",
      targetGoalLevel: "Nivel objetivo final",
      meat: "Carne",
      wood: "Madera",
      coal: "Carbon",
      iron: "Hierro",
      fireCrystals: "Cristales de Fuego",
      refinedFireCrystals: "Cristales de Fuego refinados",
      useCustomResourceChests: "Usar cofres de recursos personalizados",
      level1Unsecured: "Nivel 1 sin asegurar",
      level1Secured: "Nivel 1 asegurado",
      level2Unsecured: "Nivel 2 sin asegurar",
      level2Secured: "Nivel 2 asegurado",
      level3Unsecured: "Nivel 3 sin asegurar",
      level3Secured: "Nivel 3 asegurado",
      generalSpeedups: "Aceleradores generales (minutos)",
      constructionSpeedups: "Aceleradores de construccion (minutos)",
      doubleTime: "Doble tiempo (20%)",
      castleBuff: "Bonificacion de castillo (10%)",
      constructionSpeed: "Velocidad de construccion",
      hyenaBuff: "Ayudante del Constructor (Hiena)",
      zinmanBastionist: "Habilidad Bastionista de Zinman",
      positionBuff: "Bonificacion de puesto",
      damageTier: "Rango de dano",
      mail: "Correo",
      setAllCurrentLevels: "Asignar todos los niveles actuales",
      requiredLevel: "Nivel requerido",
      hat: "Gorro (Lancero)",
      watch: "Reloj (Lancero)",
      coat: "Chaqueta (Infantería)",
      pants: "Pantalones (Infantería)",
      ring: "Anillo (Tirador)",
      shortStaff: "Arma (Tirador)",
      hardenedAlloy: "Aleación endurecida",
      polishingSolution: "Solución de pulido",
      designPlans: "Planos de diseño",
      lunarAmber: "Ámbar lunar",
      charm: "Talismán",
      charmDesigns: "Diseños de Talismán",
      charmGuides: "Guías de Talismán",
      jewelSecrets: "Secretos de Joya",
      pet: "Mascota",
      petFood: "Comida para mascotas",
      tamingManual: "Manual de doma",
      energizingPotion: "Poción energizante",
      strengtheningSerum: "Suero fortalecedor"
    },
    buttons: {
      addBuilding: "+ Agregar edificio",
      addBearHuntMail: "+ Agregar correo de Caza del Oso",
      calculate: "Calcular",
      remove: "Quitar",
      setAll: "Aplicar a todos",
      refresh: "Actualizar",
      reset: "Restablecer",
      calculateCost: "Calcular costo",
      smartUpgrade: "Mejora inteligente"
    },
    options: {
      none0: "Ninguno (0%)"
    },
    building: {
      furnace: "Horno",
      embassy: "Embajada",
      research_center: "Centro de investigacion",
      infirmary: "Enfermeria",
      infantry_camp: "Campamento de infanteria",
      lancer_camp: "Campamento de lanceros",
      marksman_camp: "Campamento de tiradores",
      barricade: "Barricada",
      command_center: "Centro de mando",
      storehouse: "Almacen",
      arcticWolf: "Lobo ártico",
      muskOx: "Buey almizclero",
      giantTapir: "Tapir gigante",
      titanRoc: "Roc titán",
      giantElk: "Alce gigante",
      snowLeopard: "Leopardo de las nieves",
      caveLion: "León de las cavernas",
      snowApe: "Simio de las nieves",
      ironRhino: "Rinoceronte de hierro",
      saberToothTiger: "Tigre dientes de sable",
      mammoth: "Mamut",
      frostGorilla: "Gorila de escarcha",
      frostscaleChameleon: "Camaleón de escarcha",
      abyssalShelldragon: "Dragón de concha abisal",
      caveHyena: "Hiena de las cavernas",
      setAllCurrentLevels: "Asignar todos los niveles actuales",
      setAllTargetLevels: "Asignar todos los niveles objetivo"
    },
    comingSoon: {
      title: "Proximamente",
      placeholderIntro: "Esta pestana de calculadora esta visible ahora como marcador para que los usuarios puedan ver lo que sigue.",
      placeholderOutro: "Cuando esta calculadora este lista, este mensaje podra eliminarse y reemplazarse por la herramienta completa.",
      heading: "{calculator} - Proximamente",
      accountStructured: "Los datos de la cuenta ya estan preparados para {account}. Cuando {calculator} este disponible, sus valores se guardaran bajo esta misma cuenta y cambiaran con tu selector de cuenta.",
      unlockRequirement: "Alcanza el Nv.{level} para desbloquear el siguiente"
    },
    aboutPage: {
      heading: "Acerca de",
      placeholderOne: "Esta pagina Acerca de es un marcador y se ampliara mas adelante.",
      placeholderTwo: "La arquitectura de la calculadora se esta preparando primero para que nuevas herramientas puedan lanzarse sin perder datos entre cuentas.",
      returnToCalculator: "Volver a la calculadora"
    },
    contactPage: {
      heading: "Contacto",
      placeholderOne: "Esta pagina de Contacto es un marcador y se ampliara mas adelante.",
      placeholderTwo: "Puedes seguir agregando funciones de calculadora primero e incorporar los datos de contacto finales cuando quieras.",
      returnToCalculator: "Volver a la calculadora"
    },
    update: {
      ready: "Hay una nueva version lista."
    },
    alerts: {
      cannotAddOptionalBuilding: "No se puede agregar un edificio opcional: no hay datos de niveles disponibles",
      dataLoadingError: "Error al cargar los datos de la calculadora. Actualiza la pagina.",
      dataStillLoading: "Los datos aun se estan cargando. Espera e intentalo de nuevo.",
      currentExceedsTarget: "Asegurate de que el nivel actual no sea mayor que el objetivo.",
      invalidOptionalBuilding: "Un edificio opcional tiene una seleccion invalida de edificio o nivel. Vuelve a seleccionarlo e intentalo de nuevo.",
      optionalTargetBelowCurrent: "{building}: el nivel objetivo no puede ser menor que el nivel actual.",
      invalidBearHuntTier: "Una fila de Correo de Caza del Oso tiene un rango de dano invalido. Vuelve a seleccionarlo e intentalo de nuevo.",
      invalidBearHuntCount: "Las cantidades de Correo de Caza del Oso deben ser 0 o mayores.",
      goalExceedsFurnace: "{building}: el nivel objetivo no puede superar el nivel objetivo del Horno. El Horno debe mejorarse primero."
    },
    validation: {
      nonNegativeResource: "{label} debe ser un numero no negativo. Puedes usar numeros normales o sufijos K/M/B.",
      nonNegativeNumber: "{label} debe ser un numero no negativo.",
      nonNegativeWholeNumber: "{label} debe ser un numero entero no negativo."
    },
    results: {
      loading: "Cargando datos de edificios...",
      bearHuntMail: "CORREO DE CAZA DEL OSO (+{count} correos agregados a la mochila)",
      grandTotal: "TOTAL GENERAL",
      baseCostBeforeZinman: "Costo base antes del descuento de Zinman",
      totalUpgradeTimeBase: "Tiempo total de mejora (base)",
      additiveSpeed: "Velocidad aditiva ({percent}%)",
      doubleTime: "Doble tiempo ({percent}%)",
      saved: "{duration} ahorrado",
      afterUpgradeBalance: "Despues de la mejora (saldo de mochila)",
      remainingTimeAfterSpeedups: "Tiempo restante despues de aceleradores",
      speedupSurplus: "Excedente de aceleradores",
      customChestRecommendation: "RECOMENDACION DE COFRES PERSONALIZADOS",
      noChestUsage: "No se necesita usar cofres para los deficits actuales.",
      chestsUsed: "Cofres usados",
      afterRecommendedChestUse: "Despues del uso recomendado de cofres",
      provided: "aportado {amount}",
      uncoveredDeficit: "deficit sin cubrir {amount}",
      rallyCapacity: "Capacidad de reunion",
      troopDeploymentCapacity: "Capacidad de despliegue de tropas",
      storageCapacity: "Capacidad de almacen",
      essenceStones: "Piedras de esencia",
      luckyHeroGearChests: "Cofres de equipo heroico de suerte",
      xpComponents: "Componentes de XP",
      allianceTokens: "Fichas de alianza",
      charmCostSummary: "RESUMEN DE COSTOS",
      charmAfterUpgradeBalance: "DESPUÉS DE LA MEJORA (SALDO DE MATERIAL)",
      charmSmartUpgradeComplete: "Mejora inteligente completada",
      charmNoUpgradesPossible: "No es posible realizar mejoras con los materiales actuales.",
      charmMaterialsRemaining: "Materiales restantes",
      charmsUpgraded: "Talismanes mejorados",
      charmBatchUpgrade: "Se mejoraron {count} talismanes al nivel {level}",
      optimizedPlan: "PLAN OPTIMIZADO",
      gearPiece: "Pieza de equipo",
      finalLevel: "Nivel final",
      svsPointsGained: "Puntos de SVS ganados:",
      materialsRemaining: "Materiales restantes:"
    },
    resource: {
      meat: "Carne",
      wood: "Madera",
      coal: "Carbon",
      iron: "Hierro"
    }
  },
  de: {
    page: {
      title: {
        index: "WOS Calc",
        about: "Über - WOS Calc",
        contact: "Kontakt - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Sprache"
    },
    theme: {
      darkMode: "Dunkler Modus",
      lightMode: "Heller Modus"
    },
    account: {
      renameTitle: "Konto umbenennen",
      addTitle: "Konto hinzufügen",
      deleteTitle: "Konto löschen",
      addButton: "+ Konto",
      activeAccount: "Aktives Konto:",
      namePrompt: "Kontoname:",
      renamePrompt: "Konto umbenennen:",
      defaultName: "Konto {number}",
      cannotDeleteOnly: "Das einzige Konto kann nicht gelöscht werden.",
      deleteConfirm: "\"{name}\" löschen? Dies kann nicht rückgängig gemacht werden."
    },
    nav: {
      calculatorTabs: "Rechner-Tabs",
      siteLinks: "Website-Links",
      calculator: "Rechner",
      selectCalculator: "Rechner auswählen",
      about: "Über",
      contact: "Kontakt"
    },
    calculator: {
      upgrade: "Upgrade",
      chiefGear: "Chef-Ausrüstung",
      chiefCharm: "Chef-Talisman",
      pets: "Haustiere",
      whatIf: "Was wäre wenn",
      experts: "Experten-Rechner",
      heroGear: "Helden-Ausrüstung",
      koi: "KoI-Rechner",
      research: "Forschungs-Upgrades",
      svs: "SvS-Rechner",
      troopTraining: "Truppenausbildung",
      warAcademy: "Kriegsakademie",
      about: "Über uns",
      contact: "Kontakt",
      chiefGearFull: "Chef-Ausrüstungsrechner",
      chiefCharmFull: "Chef-Talisman-Rechner",
      whatIfFull: "Was-wäre-wenn-Rechner",
      generic: "Rechner"
    },
    sections: {
      targetBuilding: "Zielgebäude",
      yourResources: "Deine Ressourcen",
      constructionBuffs: "Bau-Buffs (%)",
      requiredBuildings: "Erforderliche Gebäude",
      optionalAdditionalBuildings: "Optionale zusätzliche Gebäude",
      bearHuntMail: "Bärenjagd-Mail",
      chiefGearLevels: "Chef-Ausrüstungsstufen",
      chiefGearMaterials: "Deine Materialien",
      chiefCharmLevels: "Chef-Talisman-Stufen",
      chiefCharmMaterials: "Deine Materialien",
      petLevels: "Haustier-Level",
      petMaterials: "Deine Materialien"
    },
    labels: {
      building: "Gebäude",
      currentLevel: "Aktuelles Level",
      targetLevel: "Ziellevel",
      targetGoalLevel: "Ziellevel (Endziel)",
      meat: "Fleisch",
      wood: "Holz",
      coal: "Kohle",
      iron: "Eisen",
      fireCrystals: "Feuerkristalle",
      refinedFireCrystals: "Veredelte Feuerkristalle",
      useCustomResourceChests: "Benutzerdefinierte Ressourcentruhen verwenden",
      level1Unsecured: "Stufe 1 ungesichert",
      level1Secured: "Stufe 1 gesichert",
      level2Unsecured: "Stufe 2 ungesichert",
      level2Secured: "Stufe 2 gesichert",
      level3Unsecured: "Stufe 3 ungesichert",
      level3Secured: "Stufe 3 gesichert",
      generalSpeedups: "Allgemeine Beschleuniger (Minuten)",
      constructionSpeedups: "Bau-Beschleuniger (Minuten)",
      doubleTime: "Doppelte Zeit (20%)",
      castleBuff: "Burg-Buff (10%)",
      constructionSpeed: "Baugeschwindigkeit",
      hyenaBuff: "Baumeisterhilfe (Hyäne)",
      zinmanBastionist: "Zinmans Bastionisten-Fähigkeit",
      positionBuff: "Positions-Buff",
      damageTier: "Schadensstufe",
      mail: "Mail",
      setAllCurrentLevels: "Alle aktuellen Level setzen",
      requiredLevel: "Erforderliches Level",
      hat: "Kappe (Lancer)",
      watch: "Uhr (Lancer)",
      coat: "Mantel (Infanterie)",
      pants: "Hose (Infanterie)",
      ring: "Ring (Schütze)",
      shortStaff: "Waffe (Schütze)",
      hardenedAlloy: "Gehärtete Legierung",
      polishingSolution: "Polierlösung",
      designPlans: "Entwürfe",
      lunarAmber: "Mondbernstein",
      charm: "Talisman",
      charmDesigns: "Talisman-Designs",
      charmGuides: "Talisman-Anleitungen",
      jewelSecrets: "Juwelengeheimnisse",
      pet: "Haustier",
      petFood: "Haustierfutter",
      tamingManual: "Zähmungshandbuch",
      energizingPotion: "Energetisierender Trank",
      strengtheningSerum: "Stärkungsserum"
    },
    buttons: {
      addBuilding: "+ Gebäude hinzufügen",
      addBearHuntMail: "+ Bärenjagd-Mail hinzufügen",
      calculate: "Berechnen",
      remove: "Entfernen",
      setAll: "Alle setzen",
      refresh: "Aktualisieren",
      reset: "Zurücksetzen",
      calculateCost: "Kosten berechnen",
      smartUpgrade: "Intelligentes Upgrade"
    },
    options: {
      none0: "Keine (0%)"
    },
    building: {
      furnace: "Ofen",
      embassy: "Botschaft",
      research_center: "Forschungszentrum",
      infirmary: "Lazarett",
      infantry_camp: "Infanterielager",
      lancer_camp: "Lanzentragerlager",
      marksman_camp: "Scharfschutzenlager",
      barricade: "Barrikade",
      command_center: "Kommandozentrale",
      storehouse: "Lagerhaus",
      arcticWolf: "Arktischer Wolf",
      muskOx: "Moschusochse",
      giantTapir: "Riesentapir",
      titanRoc: "Titan-Roc",
      giantElk: "Riesenelch",
      snowLeopard: "Schneeleopard",
      caveLion: "Höhlenlöwe",
      snowApe: "Schneeffe",
      ironRhino: "Eisen-Nashorn",
      saberToothTiger: "Säbelzahntiger",
      mammoth: "Mammut",
      frostGorilla: "Frost-Gorilla",
      frostscaleChameleon: "Frostschuppen-Chamäleon",
      abyssalShelldragon: "Abyssaler Panzerdrache",
      caveHyena: "Höhlenhyäne",
      setAllCurrentLevels: "Alle aktuellen Level setzen",
      setAllTargetLevels: "Alle Ziellevel setzen"
    },
    comingSoon: {
      title: "Demnächst",
      placeholderIntro: "Dieser Rechner-Tab ist derzeit als Platzhalter sichtbar, damit Nutzer sehen können, was als Nächstes geplant ist.",
      placeholderOutro: "Sobald dieser Rechner live ist, kann diese Nachricht entfernt und durch das vollständige Tool ersetzt werden.",
      heading: "{calculator} - Demnächst",
      accountStructured: "Kontodaten sind bereits für {account} vorbereitet. Wenn {calculator} live geht, werden die Werte unter demselben Konto gespeichert und mit deiner Kontoauswahl umgeschaltet.",
      unlockRequirement: "Erreiche Stufe {level}, um das nächste freizuschalten"
    },
    aboutPage: {
      heading: "Über",
      placeholderOne: "Diese Über-Seite ist ein Platzhalter und wird später erweitert.",
      placeholderTwo: "Die Rechner-Architektur wird zuerst vorbereitet, damit neue Tools ohne Datenverlust zwischen Konten veröffentlicht werden können.",
      returnToCalculator: "Zurück zum Rechner"
    },
    contactPage: {
      heading: "Kontakt",
      placeholderOne: "Diese Kontaktseite ist ein Platzhalter und wird später erweitert.",
      placeholderTwo: "Du kannst zuerst weitere Rechnerfunktionen hinzufügen und die finalen Kontaktdaten später ergänzen.",
      returnToCalculator: "Zurück zum Rechner"
    },
    update: {
      ready: "Eine neue Version ist bereit."
    },
    alerts: {
      cannotAddOptionalBuilding: "Optionales Gebäude kann nicht hinzugefügt werden: keine Leveldaten verfügbar",
      dataLoadingError: "Fehler beim Laden der Rechnerdaten. Bitte aktualisiere die Seite.",
      dataStillLoading: "Daten werden noch geladen. Bitte warte und versuche es erneut.",
      currentExceedsTarget: "Bitte stelle sicher, dass das aktuelle Level nicht über dem Ziellevel liegt.",
      invalidOptionalBuilding: "Ein optionales Gebäude hat eine ungültige Gebäude- oder Levelauswahl. Bitte erneut auswählen und noch einmal versuchen.",
      optionalTargetBelowCurrent: "{building}: Das Ziellevel darf nicht unter dem aktuellen Level liegen.",
      invalidBearHuntTier: "Eine Bärenjagd-Mail-Zeile hat eine ungültige Schadensstufe. Bitte erneut auswählen und noch einmal versuchen.",
      invalidBearHuntCount: "Bärenjagd-Mail-Anzahlen müssen 0 oder höher sein.",
      goalExceedsFurnace: "{building}: Das Ziellevel darf nicht über dem Ziellevel des Ofens liegen. Der Ofen muss zuerst aufgerüstet werden."
    },
    validation: {
      nonNegativeResource: "{label} muss eine nicht negative Zahl sein. Du kannst normale Zahlen oder K/M/B-Suffixe verwenden.",
      nonNegativeNumber: "{label} muss eine nicht negative Zahl sein.",
      nonNegativeWholeNumber: "{label} muss eine nicht negative ganze Zahl sein."
    },
    results: {
      loading: "Gebäudedaten werden geladen...",
      bearHuntMail: "BÄRENJAGD-MAIL (+{count} Mails zum Rucksack hinzugefügt)",
      grandTotal: "GESAMTSUMME",
      baseCostBeforeZinman: "Basiskosten vor Zinman-Rabatt",
      totalUpgradeTimeBase: "Gesamte Upgrade-Zeit (Basis)",
      additiveSpeed: "Additive Geschwindigkeit ({percent}%)",
      doubleTime: "Doppelte Zeit ({percent}%)",
      saved: "{duration} gespart",
      afterUpgradeBalance: "Nach dem Upgrade (Rucksackbestand)",
      remainingTimeAfterSpeedups: "Verbleibende Zeit nach Beschleunigern",
      speedupSurplus: "Beschleuniger-Überschuss",
      customChestRecommendation: "EMPFEHLUNG FÜR BENUTZERDEFINIERTE TRUHEN",
      noChestUsage: "Für die aktuellen Defizite ist keine Truhennutzung erforderlich.",
      chestsUsed: "Verwendete Truhen",
      afterRecommendedChestUse: "Nach empfohlener Truhennutzung",
      provided: "bereitgestellt {amount}",
      uncoveredDeficit: "ungedecktes Defizit {amount}",
      rallyCapacity: "Rallye-Kapazität",
      troopDeploymentCapacity: "Truppeneinsatz-Kapazität",
      storageCapacity: "Lagerkapazität",
      essenceStones: "Essenzsteine",
      luckyHeroGearChests: "Lucky Hero Gear Truhen",
      xpComponents: "XP-Komponenten",
      allianceTokens: "Allianz-Token",
      charmCostSummary: "KOSTENÜBERSICHT",
      charmAfterUpgradeBalance: "NACH UPGRADE (MATERIALBESTAND)",
      charmSmartUpgradeComplete: "Intelligentes Upgrade abgeschlossen",
      charmNoUpgradesPossible: "Mit den aktuellen Materialien sind keine Upgrades möglich.",
      charmMaterialsRemaining: "Verbleibende Materialien",
      charmsUpgraded: "Talismane verbessert",
      charmBatchUpgrade: "{count} Talismane auf {level} verbessert",
      optimizedPlan: "OPTIMIERTER PLAN",
      gearPiece: "Ausrüstungsstück",
      finalLevel: "Endstufe",
      svsPointsGained: "Gewonnene SVS-Punkte:",
      materialsRemaining: "Verbleibende Materialien:"
    },
    resource: {
      meat: "Fleisch",
      wood: "Holz",
      coal: "Kohle",
      iron: "Eisen"
    }
  },
  fr: {
    page: {
      title: {
        index: "WOS Calc",
        about: "À propos - WOS Calc",
        contact: "Contact - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Langue"
    },
    theme: {
      darkMode: "Mode sombre",
      lightMode: "Mode clair"
    },
    account: {
      renameTitle: "Renommer le compte",
      addTitle: "Ajouter un compte",
      deleteTitle: "Supprimer le compte",
      addButton: "+ Compte",
      activeAccount: "Compte actif :",
      namePrompt: "Nom du compte :",
      renamePrompt: "Renommer le compte :",
      defaultName: "Compte {number}",
      cannotDeleteOnly: "Impossible de supprimer le seul compte.",
      deleteConfirm: "Supprimer \"{name}\" ? Cette action est irreversible."
    },
    nav: {
      calculatorTabs: "Onglets de calculatrice",
      siteLinks: "Liens du site",
      calculator: "Calculatrice",
      selectCalculator: "Sélectionner un calculateur",
      about: "À propos",
      contact: "Contact"
    },
    calculator: {
      upgrade: "Amélioration",
      chiefGear: "Équipement du chef",
      chiefCharm: "Charme du chef",
      pets: "Animaux",
      whatIf: "Et si",
      experts: "Calculatrice d'Experts",
      heroGear: "Équipement de Héros",
      koi: "Calculatrice de KoI",
      research: "Améliorations de Recherche",
      svs: "Calculatrice de SvS",
      troopTraining: "Entraînement de Troupes",
      warAcademy: "Académie de Guerre",
      about: "À propos",
      contact: "Contact",
      chiefGearFull: "Calculateur d'équipement du chef",
      chiefCharmFull: "Calculateur de charme du chef",
      whatIfFull: "Calculateur Et si",
      generic: "Calculatrice"
    },
    sections: {
      targetBuilding: "Bâtiment cible",
      yourResources: "Vos ressources",
      constructionBuffs: "Bonus de construction (%)",
      requiredBuildings: "Bâtiments requis",
      optionalAdditionalBuildings: "Bâtiments supplémentaires optionnels",
      bearHuntMail: "Courrier de chasse à l'ours",
      chiefGearLevels: "Niveaux d'équipement du chef",
      chiefGearMaterials: "Vos matériaux",
      chiefCharmLevels: "Niveaux de charme du chef",
      chiefCharmMaterials: "Vos matériaux",
      petLevels: "Niveaux de familier",
      petMaterials: "Vos matériaux"
    },
    labels: {
      building: "Bâtiment",
      currentLevel: "Niveau actuel",
      targetLevel: "Niveau cible",
      targetGoalLevel: "Niveau cible final",
      meat: "Viande",
      wood: "Bois",
      coal: "Charbon",
      iron: "Fer",
      fireCrystals: "Cristaux de feu",
      refinedFireCrystals: "Cristaux de feu raffinés",
      useCustomResourceChests: "Utiliser des coffres de ressources personnalisés",
      level1Unsecured: "Niveau 1 non sécurisé",
      level1Secured: "Niveau 1 sécurisé",
      level2Unsecured: "Niveau 2 non sécurisé",
      level2Secured: "Niveau 2 sécurisé",
      level3Unsecured: "Niveau 3 non sécurisé",
      level3Secured: "Niveau 3 sécurisé",
      generalSpeedups: "Accélérations générales (minutes)",
      constructionSpeedups: "Accélérations de construction (minutes)",
      doubleTime: "Double temps (20%)",
      castleBuff: "Bonus de château (10%)",
      constructionSpeed: "Vitesse de construction",
      hyenaBuff: "Aide du constructeur (Hyène)",
      zinmanBastionist: "Compétence Bastioniste de Zinman",
      positionBuff: "Bonus de poste",
      damageTier: "Palier de dégâts",
      mail: "Courrier",
      setAllCurrentLevels: "Définir tous les niveaux actuels",
      requiredLevel: "Niveau requis",
      hat: "Casquette (Lancier)",
      watch: "Montre (Lancier)",
      coat: "Manteau (Infanterie)",
      pants: "Pantalon (Infanterie)",
      ring: "Bague (Tireur)",
      shortStaff: "Arme (Tireur)",
      hardenedAlloy: "Alliage durci",
      polishingSolution: "Solution de polissage",
      designPlans: "Plans de conception",
      lunarAmber: "Ambre lunaire",
      charm: "Charme",
      charmDesigns: "Plans de charme",
      charmGuides: "Guides de charme",
      jewelSecrets: "Secrets de bijoux",
      pet: "Familier",
      petFood: "Nourriture pour familier",
      tamingManual: "Manuel d'apprivoisement",
      energizingPotion: "Potion énergisante",
      strengtheningSerum: "Sérum de renforcement"
    },
    buttons: {
      addBuilding: "+ Ajouter un bâtiment",
      addBearHuntMail: "+ Ajouter un courrier de chasse à l'ours",
      calculate: "Calculer",
      remove: "Retirer",
      setAll: "Tout appliquer",
      refresh: "Actualiser",
      reset: "Réinitialiser",
      calculateCost: "Calculer le coût",
      smartUpgrade: "Amélioration intelligente"
    },
    options: {
      none0: "Aucun (0%)"
    },
    building: {
      furnace: "Fournaise",
      embassy: "Ambassade",
      research_center: "Centre de recherche",
      infirmary: "Infirmerie",
      infantry_camp: "Camp d'infanterie",
      lancer_camp: "Camp de lanciers",
      marksman_camp: "Camp de tireurs",
      barricade: "Barricade",
      command_center: "Centre de commandement",
      storehouse: "Entrepôt",
      arcticWolf: "Loup arctique",
      muskOx: "Bœuf musqué",
      giantTapir: "Tapir géant",
      titanRoc: "Roc titan",
      giantElk: "Élan géant",
      snowLeopard: "Léopard des neiges",
      caveLion: "Lion des cavernes",
      snowApe: "Singe des neiges",
      ironRhino: "Rinocéros de fer",
      saberToothTiger: "Tigre à dents de sabre",
      mammoth: "Mammouth",
      frostGorilla: "Gorille de givre",
      frostscaleChameleon: "Caméléon de givre",
      abyssalShelldragon: "Dragon-coquille abyssal",
      caveHyena: "Hyène des cavernes",
      setAllCurrentLevels: "Définir tous les niveaux actuels",
      setAllTargetLevels: "Définir tous les niveaux cibles"
    },
    comingSoon: {
      title: "Bientôt disponible",
      placeholderIntro: "Cet onglet de calculatrice est visible comme emplacement réservé afin que les utilisateurs voient ce qui arrive ensuite.",
      placeholderOutro: "Une fois cette calculatrice disponible, ce message pourra être retiré et remplacé par l'outil complet.",
      heading: "{calculator} - Bientôt disponible",
      accountStructured: "Les données du compte sont déjà structurées pour {account}. Lorsque {calculator} sera disponible, ses valeurs seront enregistrées sous ce même compte et changeront avec votre sélecteur de compte.",
      unlockRequirement: "Atteignez le Niv.{level} pour débloquer le suivant"
    },
    aboutPage: {
      heading: "À propos",
      placeholderOne: "Cette page À propos est un emplacement réservé et sera étendue plus tard.",
      placeholderTwo: "L'architecture de la calculatrice est préparée d'abord afin que de nouveaux outils puissent être publiés sans perte de données entre les comptes.",
      returnToCalculator: "Retour à la calculatrice"
    },
    contactPage: {
      heading: "Contact",
      placeholderOne: "Cette page Contact est un emplacement réservé et sera étendue plus tard.",
      placeholderTwo: "Vous pouvez continuer à ajouter des fonctions de calculatrice d'abord, puis intégrer les informations de contact finales quand vous voulez.",
      returnToCalculator: "Retour à la calculatrice"
    },
    update: {
      ready: "Une nouvelle version est prête."
    },
    alerts: {
      cannotAddOptionalBuilding: "Impossible d'ajouter un bâtiment optionnel : aucune donnée de niveau disponible",
      dataLoadingError: "Erreur lors du chargement des données de la calculatrice. Veuillez actualiser la page.",
      dataStillLoading: "Les données sont encore en cours de chargement. Veuillez patienter puis réessayer.",
      currentExceedsTarget: "Veuillez vous assurer que le niveau actuel ne dépasse pas le niveau cible.",
      invalidOptionalBuilding: "Un bâtiment optionnel a une sélection de bâtiment ou de niveau invalide. Resélectionnez-le puis réessayez.",
      optionalTargetBelowCurrent: "{building} : le niveau cible ne peut pas être inférieur au niveau actuel.",
      invalidBearHuntTier: "Une ligne de courrier de chasse à l'ours a un palier de dégâts invalide. Resélectionnez-la puis réessayez.",
      invalidBearHuntCount: "Le nombre de courriers de chasse à l'ours doit être supérieur ou égal à 0.",
      goalExceedsFurnace: "{building} : le niveau cible ne peut pas dépasser le niveau cible de la fournaise. La fournaise doit être améliorée en premier."
    },
    validation: {
      nonNegativeResource: "{label} doit être un nombre positif ou nul. Vous pouvez utiliser des nombres simples ou les suffixes K/M/B.",
      nonNegativeNumber: "{label} doit être un nombre positif ou nul.",
      nonNegativeWholeNumber: "{label} doit être un entier positif ou nul."
    },
    results: {
      loading: "Chargement des données des bâtiments...",
      bearHuntMail: "COURRIER DE CHASSE À L'OURS (+{count} courriers ajoutés au sac)",
      grandTotal: "TOTAL GENERAL",
      baseCostBeforeZinman: "Coût de base avant réduction de Zinman",
      totalUpgradeTimeBase: "Temps total d'amélioration (base)",
      additiveSpeed: "Vitesse additive ({percent}%)",
      doubleTime: "Double temps ({percent}%)",
      saved: "{duration} économisé",
      afterUpgradeBalance: "Après amélioration (solde du sac)",
      remainingTimeAfterSpeedups: "Temps restant après accélérations",
      speedupSurplus: "Surplus d'accélérations",
      customChestRecommendation: "RECOMMANDATION DE COFFRES PERSONNALISES",
      noChestUsage: "Aucune utilisation de coffre n'est nécessaire pour les déficits actuels.",
      chestsUsed: "Coffres utilisés",
      afterRecommendedChestUse: "Après utilisation recommandée des coffres",
      provided: "fourni {amount}",
      uncoveredDeficit: "déficit non couvert {amount}",
      rallyCapacity: "Capacité de ralliement",
      troopDeploymentCapacity: "Capacité de déploiement des troupes",
      storageCapacity: "Capacité de stockage",
      essenceStones: "Pierres d'essence",
      luckyHeroGearChests: "Coffres d'équipement héroïque chanceux",
      xpComponents: "Composants XP",
      allianceTokens: "Jetons d'alliance",
      charmCostSummary: "RÉCAPITULATIF DES COÛTS",
      charmAfterUpgradeBalance: "APRÈS AMÉLIORATION (SOLDE MATÉRIEL)",
      charmSmartUpgradeComplete: "Amélioration intelligente terminée",
      charmNoUpgradesPossible: "Aucune amélioration possible avec les matériaux actuels.",
      charmMaterialsRemaining: "Matériaux restants",
      charmsUpgraded: "Charmes améliorés",
      charmBatchUpgrade: "{count} charmes améliorés au niveau {level}",
      optimizedPlan: "PLAN OPTIMISÉ",
      gearPiece: "Pièce d'équipement",
      finalLevel: "Niveau final",
      svsPointsGained: "Points SVS gagnés :",
      materialsRemaining: "Matériaux restants :"
    },
    resource: {
      meat: "Viande",
      wood: "Bois",
      coal: "Charbon",
      iron: "Fer"
    }
  },
  pt: {
    page: {
      title: {
        index: "WOS Calc",
        about: "Sobre - WOS Calc",
        contact: "Contato - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Idioma"
    },
    theme: {
      darkMode: "Modo escuro",
      lightMode: "Modo claro"
    },
    account: {
      renameTitle: "Renomear conta",
      addTitle: "Adicionar conta",
      deleteTitle: "Excluir conta",
      addButton: "+ Conta",
      activeAccount: "Conta ativa:",
      namePrompt: "Nome da conta:",
      renamePrompt: "Renomear conta:",
      defaultName: "Conta {number}",
      cannotDeleteOnly: "Não é possível excluir a única conta.",
      deleteConfirm: "Excluir \"{name}\"? Esta ação não pode ser desfeita."
    },
    nav: {
      calculatorTabs: "Abas da calculadora",
      siteLinks: "Links do site",
      calculator: "Calculadora",
      selectCalculator: "Selecionar Calculadora",
      about: "Sobre",
      contact: "Contato"
    },
    calculator: {
      upgrade: "Melhoria",
      chiefGear: "Equipamento do Chefe",
      chiefCharm: "Talismã do Chefe",
      pets: "Mascotes",
      whatIf: "E se",
      experts: "Calculadora de Especialistas",
      heroGear: "Equipamento de Herói",
      koi: "Calculadora de KoI",
      research: "Upgrades de Pesquisa",
      svs: "Calculadora de SvS",
      troopTraining: "Treinamento de Tropas",
      warAcademy: "Academia de Guerra",
      about: "Sobre",
      contact: "Contato",
      chiefGearFull: "Calculadora de Equipamento do Chefe",
      chiefCharmFull: "Calculadora de Talismã do Chefe",
      whatIfFull: "Calculadora E se",
      generic: "Calculadora"
    },
    sections: {
      targetBuilding: "Edifício alvo",
      yourResources: "Seus recursos",
      constructionBuffs: "Bônus de construção (%)",
      requiredBuildings: "Edifícios necessários",
      optionalAdditionalBuildings: "Edifícios adicionais opcionais",
      bearHuntMail: "Correio de Caça ao Urso",
      chiefGearLevels: "Níveis de Equipamento do Chefe",
      chiefGearMaterials: "Seus materiais",
      chiefCharmLevels: "Níveis de Talismã do Chefe",
      chiefCharmMaterials: "Seus materiais",
      petLevels: "Níveis de Mascote",
      petMaterials: "Seus materiais"
    },
    labels: {
      building: "Edifício",
      currentLevel: "Nível atual",
      targetLevel: "Nível alvo",
      targetGoalLevel: "Nível alvo final",
      meat: "Carne",
      wood: "Madeira",
      coal: "Carvão",
      iron: "Ferro",
      fireCrystals: "Cristais de Fogo",
      refinedFireCrystals: "Cristais de Fogo refinados",
      useCustomResourceChests: "Usar baús de recursos personalizados",
      level1Unsecured: "Nível 1 não seguro",
      level1Secured: "Nível 1 seguro",
      level2Unsecured: "Nível 2 não seguro",
      level2Secured: "Nível 2 seguro",
      level3Unsecured: "Nível 3 não seguro",
      level3Secured: "Nível 3 seguro",
      generalSpeedups: "Aceleradores gerais (minutos)",
      constructionSpeedups: "Aceleradores de construção (minutos)",
      doubleTime: "Tempo em dobro (20%)",
      castleBuff: "Bônus do castelo (10%)",
      constructionSpeed: "Velocidade de construção",
      hyenaBuff: "Ajudante do Construtor (Hiena)",
      zinmanBastionist: "Habilidade Bastionista do Zinman",
      positionBuff: "Bônus de cargo",
      damageTier: "Faixa de dano",
      mail: "Correio",
      setAllCurrentLevels: "Definir todos os níveis atuais",
      requiredLevel: "Nível necessário",
      hat: "Boné (Lanceiro)",
      watch: "Relógio (Lanceiro)",
      coat: "Casaco (Infantaria)",
      pants: "Calças (Infantaria)",
      ring: "Anel (Atirador)",
      shortStaff: "Arma (Atirador)",
      hardenedAlloy: "Liga Endurecida",
      polishingSolution: "Solução de Polimento",
      designPlans: "Planos de Design",
      lunarAmber: "Âmbar Lunar",
      pet: "Mascote",
      petFood: "Comida para Mascote",
      tamingManual: "Manual de Domesticação",
      energizingPotion: "Poção Energizante",
      strengtheningSerum: "Soro de Fortalecimento",
      charm: "Talismã",
      charmDesigns: "Desenhos de Talismã",
      charmGuides: "Guias de Talismã",
      jewelSecrets: "Segredos de Joia",
      agnusProjectManagement: "Gestão de Projetos da Agnus",
      essenceStones: "Pedras de Essência",
      luckyHeroGearChests: "Baús de Equip. Heroico de Sorte",
      allianceTokens: "Fichas de Aliança",
      buffNote: "Nota: Se bônus de construção (ex: Hiena, Mercantilismo, VP) já estiverem ativos, eles já estão contados na sua velocidade atual. Não os adicione separadamente.",
      hyenaNote: "O Ajudante do Construtor (Hiena) aplica-se apenas ao custo de recursos da Fornalha/QG e Muralha."
    },
    buttons: {
      addBuilding: "+ Adicionar edifício",
      addBearHuntMail: "+ Adicionar correio de Caça ao Urso",
      calculate: "Calcular",
      remove: "Remover",
      setAll: "Aplicar a todos",
      refresh: "Atualizar",
      reset: "Redefinir",
      calculateCost: "Calcular Custo",
      smartUpgrade: "Smart Upgrade"
    },
    options: {
      none0: "Nenhum (0%)"
    },
    building: {
      furnace: "Fornalha",
      embassy: "Embaixada",
      research_center: "Centro de Pesquisa",
      infirmary: "Enfermaria",
      infantry_camp: "Acampamento de Infantaria",
      lancer_camp: "Acampamento de Lanceiros",
      marksman_camp: "Acampamento de Atiradores",
      barricade: "Barricada",
      command_center: "Centro de Comando",
      storehouse: "Armazém",
      arcticWolf: "Lobo Ártico",
      muskOx: "Boi Almiscarado",
      giantTapir: "Anta Gigante",
      titanRoc: "Roc Titã",
      giantElk: "Alce Gigante",
      snowLeopard: "Leopardo das Neves",
      saberToothTiger: "Tigre Dente-de-Sabre",
      lavaTurtles: "Tartaruga de Lava",
      ironRhino: "Rinoceronte de Ferro",
      iceDragon: "Dragão de Gelo",
      caveLion: "Leão das Cavernas",
      snowApe: "Macaco da Neve",
      mammoth: "Mamute",
      frostGorilla: "Gorila do Gelo",
      frostscaleChameleon: "Camaleão de Escamas de Gelo",
      abyssalShelldragon: "Dragão-casca Abissal",
      caveHyena: "Hiena das Cavernas"
    },
    comingSoon: {
      title: "Em breve",
      placeholderIntro: "Esta aba da calculadora está visível como marcador para que os usuários possam ver o que vem a seguir.",
      placeholderOutro: "Quando esta calculadora estiver disponível, esta mensagem poderá ser removida e substituída pela ferramenta completa.",
      heading: "{calculator} - Em breve",
      accountStructured: "Os dados da conta já estão estruturados para {account}. Quando {calculator} estiver ativo, seus valores serão salvos nesta mesma conta e mudarão com o seletor de conta.",
      unlockRequirement: "Alcance o Nv.{level} para desbloquear o próximo"
    },
    aboutPage: {
      heading: "Sobre",
      placeholderOne: "Esta página Sobre é um marcador e será ampliada mais tarde.",
      placeholderTwo: "A arquitetura da calculadora está sendo preparada primeiro para que novas ferramentas possam ser lançadas sem perda de dados entre contas.",
      returnToCalculator: "Voltar para a calculadora"
    },
    contactPage: {
      heading: "Contato",
      placeholderOne: "Esta página de Contato é um marcador e será ampliada mais tarde.",
      placeholderTwo: "Você pode continuar adicionando recursos da calculadora primeiro e incluir os detalhes finais de contato quando quiser.",
      returnToCalculator: "Voltar para a calculadora"
    },
    update: {
      ready: "Uma nova versão está pronta."
    },
    alerts: {
      cannotAddOptionalBuilding: "Não foi possível adicionar edifício opcional: não há dados de nível disponíveis",
      dataLoadingError: "Erro ao carregar os dados da calculadora. Atualize a pagina.",
      dataStillLoading: "Os dados ainda estão carregando. Aguarde e tente novamente.",
      currentExceedsTarget: "Verifique se o nível atual não é maior que o nível alvo.",
      invalidOptionalBuilding: "Um edifício opcional possui seleção inválida de edifício ou nível. Selecione novamente e tente outra vez.",
      optionalTargetBelowCurrent: "{building}: o nível alvo não pode ser menor que o nível atual.",
      invalidBearHuntTier: "Uma linha de Correio de Caça ao Urso possui faixa de dano inválida. Selecione novamente e tente outra vez.",
      invalidBearHuntCount: "As quantidades de Correio de Caça ao Urso devem ser 0 ou maiores.",
      goalExceedsFurnace: "{building}: o nível alvo não pode superar o nível alvo da Fornalha. A Fornalha deve ser melhorada primeiro."
    },
    validation: {
      nonNegativeResource: "{label} deve ser um número não negativo. Você pode usar números simples ou sufixos K/M/B.",
      nonNegativeNumber: "{label} deve ser um número não negativo.",
      nonNegativeWholeNumber: "{label} deve ser um número inteiro não negativo."
    },
    results: {
      loading: "Carregando dados dos edifícios...",
      bearHuntMail: "CORREIO DE CAÇA AO URSO (+{count} correios adicionados à mochila)",
      grandTotal: "TOTAL GERAL",
      baseCostBeforeZinman: "Custo base antes do desconto do Zinman",
      totalUpgradeTimeBase: "Tempo total de melhoria (base)",
      additiveSpeed: "Velocidade aditiva ({percent}%)",
      doubleTime: "Tempo em dobro ({percent}%)",
      saved: "{duration} economizado",
      afterUpgradeBalance: "Após melhoria (saldo da mochila)",
      remainingTimeAfterSpeedups: "Tempo restante após aceleradores",
      speedupSurplus: "Excedente de aceleradores",
      customChestRecommendation: "RECOMENDAÇÃO DE BAÚS PERSONALIZADOS",
      noChestUsage: "Não é necessário usar baús para os déficits atuais.",
      chestsUsed: "Baús usados",
      afterRecommendedChestUse: "Após uso recomendado dos baús",
      provided: "fornecido {amount}",
      uncoveredDeficit: "déficit não coberto {amount}",
      rallyCapacity: "Capacidade de rally",
      troopDeploymentCapacity: "Capacidade de deslocamento de tropas",
      storageCapacity: "Capacidade de armazenamento",
      essenceStones: "Pedras de essência",
      luckyHeroGearChests: "Baús de equipamento heroico de sorte",
      xpComponents: "Componentes de XP",
      allianceTokens: "Fichas de aliança",
      charmCostSummary: "RESUMO DE CUSTOS",
      charmAfterUpgradeBalance: "APÓS O UPGRADE (SALDO DE MATERIAL)",
      charmSmartUpgradeComplete: "Smart Upgrade Concluído",
      charmNoUpgradesPossible: "Nenhum upgrade possível com os materiais atuais.",
      charmMaterialsRemaining: "Materiais Restantes",
      charmsUpgraded: "Talismãs aprimorados",
      charmBatchUpgrade: "Aprimorado {count} talismãs para {level}",
      optimizedPlan: "PLANO OTIMIZADO",
      gearPiece: "Peça de Equipamento",
      finalLevel: "Nível Final",
      svsPointsGained: "Pontos de SVS Ganhos:",
      materialsRemaining: "Materiais Restantes:",
      breakdown: "Detalhamento",
      bearHuntMailSummary: "CORREIO DE CAÇA AO URSO (+{count} correios adicionados à mochila)",
      setTargetHigher: "Por favor, defina pelo menos um nível alvo maior que o atual.",
      upgradedPiecesTo: "Atualizou {count} peça(s) de equipamento para {label}",
      smartUpgradeComplete: "Smart Upgrade Concluído"
    },
    resource: {
      meat: "Carne",
      wood: "Madeira",
      coal: "Carvão",
      iron: "Ferro"
    },
    gearColor: {
      green: "Verde",
      blue: "Azul",
      purple: "Roxo",
      gold: "Dourado",
      red: "Vermelho"
    },
    gearLevel: {
      notCrafted: "Não Fabricado",
      level: "Nível"
    }
  },
  "zh-CN": {
    page: {
      title: {
        index: "WOS Calc",
        about: "关于 - WOS Calc",
        contact: "联系 - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "语言"
    },
    theme: {
      darkMode: "深色模式",
      lightMode: "浅色模式"
    },
    account: {
      renameTitle: "重命名账号",
      addTitle: "添加账号",
      deleteTitle: "删除账号",
      addButton: "+ 账号",
      activeAccount: "当前账号:",
      namePrompt: "账号名称:",
      renamePrompt: "重命名账号:",
      defaultName: "账号 {number}",
      cannotDeleteOnly: "无法删除唯一账号。",
      deleteConfirm: "删除 \"{name}\"? 此操作无法撤销。"
    },
    nav: {
      calculatorTabs: "计算器选项卡",
      siteLinks: "站点链接",
      calculator: "计算器",
      selectCalculator: "选择计算器",
      about: "关于",
      contact: "联系"
    },
    calculator: {
      upgrade: "升级",
      chiefGear: "统帅装备",
      chiefCharm: "统帅护符",
      whatIf: "如果会怎样",
      chiefGearFull: "统帅装备计算器",
      chiefCharmFull: "统帅护符计算器",
      whatIfFull: "如果会怎样计算器",
      generic: "计算器"
    },
    sections: {
      targetBuilding: "目标建筑",
      yourResources: "你的资源",
      constructionBuffs: "建造加成 (%)",
      requiredBuildings: "必需建筑",
      optionalAdditionalBuildings: "可选附加建筑",
      bearHuntMail: "熊狩邮件",
      chiefGearLevels: "统帅装备等级",
      chiefGearMaterials: "你的材料",
      chiefCharmLevels: "统帅护符等级",
      chiefCharmMaterials: "你的材料",
      petLevels: "宠物等级",
      petMaterials: "你的材料"
    },
    labels: {
      building: "建筑",
      currentLevel: "当前等级",
      targetLevel: "目标等级",
      targetGoalLevel: "目标（最终）等级",
      meat: "肉",
      wood: "木材",
      coal: "煤",
      iron: "铁",
      fireCrystals: "火晶",
      refinedFireCrystals: "精炼火晶",
      useCustomResourceChests: "使用自定义资源箱",
      level1Unsecured: "1级未保护",
      level1Secured: "1级已保护",
      level2Unsecured: "2级未保护",
      level2Secured: "2级已保护",
      level3Unsecured: "3级未保护",
      level3Secured: "3级已保护",
      generalSpeedups: "通用加速（分钟）",
      constructionSpeedups: "建造加速（分钟）",
      doubleTime: "双倍时间 (20%)",
      castleBuff: "城堡加成 (10%)",
      constructionSpeed: "建造速度",
      hyenaBuff: "建造助手（鬣狗）加成",
      zinmanBastionist: "津曼堡垒技能",
      positionBuff: "职位加成",
      damageTier: "伤害档位",
      mail: "邮件",
      setAllCurrentLevels: "设置所有当前等级",
      requiredLevel: "需求等级",
      hat: "帽子 (矛兵)",
      watch: "手表 (矛兵)",
      coat: "上衣 (步兵)",
      pants: "裤子 (步兵)",
      ring: "戒指 (射手)",
      shortStaff: "武器 (射手)",
      hardenedAlloy: "强化合金",
      polishingSolution: "抛光液",
      designPlans: "设计图",
      lunarAmber: "月光琥珀",
      pet: "宠物",
      petFood: "宠物饲料",
      tamingManual: "驯服手册",
      energizingPotion: "能量药水",
      strengtheningSerum: "强化血清",
      charm: "护符",
      charmDesigns: "护符设计图",
      charmGuides: "护符指南",
      jewelSecrets: "珠宝秘籍"
    },
    buttons: {
      addBuilding: "+ 添加建筑",
      addBearHuntMail: "+ 添加熊狩邮件",
      calculate: "计算",
      remove: "移除",
      setAll: "全部设置",
      refresh: "刷新",
      reset: "重置",
      calculateCost: "计算成本",
      smartUpgrade: "智能升级"
    },
    options: {
      none0: "无 (0%)"
    },
    building: {
      furnace: "熔炉",
      embassy: "大使馆",
      research_center: "研究中心",
      infirmary: "医务室",
      infantry_camp: "步兵营",
      lancer_camp: "枪骑兵营",
      marksman_camp: "射手营",
      barricade: "路障",
      command_center: "指挥中心",
      storehouse: "仓库",
      arcticWolf: "北极狼",
      muskOx: "麝牛",
      giantTapir: "巨貘",
      titanRoc: "泰坦大鹏",
      giantElk: "巨驼鹿",
      snowLeopard: "雪豹",
      caveLion: "穴狮",
      snowApe: "雪猿",
      ironRhino: "铁犀",
      saberToothTiger: "剑齿虎",
      mammoth: "猛犸象",
      frostGorilla: "霜原大猩猩",
      frostscaleChameleon: "霜鳞变色龙",
      abyssalShelldragon: "深渊甲壳龙",
      caveHyena: "穴鬣狗"
    },
    comingSoon: {
      title: "即将推出",
      placeholderIntro: "此计算器标签当前作为占位符显示，方便用户查看后续计划。",
      placeholderOutro: "当该计算器上线后，此消息可移除并替换为完整工具。",
      heading: "{calculator} - 即将推出",
      accountStructured: "{account} 的账号数据结构已准备完成。{calculator} 上线后，其数值将保存在同一账号下，并会随账号选择器切换。",
      unlockRequirement: "达到 {level} 级解锁下一个"
    },
    aboutPage: {
      heading: "关于",
      placeholderOne: "此关于页面目前是占位页，后续会扩展。",
      placeholderTwo: "当前先完善计算器架构，以便后续工具上线时不会造成账号间数据丢失。",
      returnToCalculator: "返回计算器"
    },
    contactPage: {
      heading: "联系",
      placeholderOne: "此联系页面目前是占位页，后续会扩展。",
      placeholderTwo: "你可以先继续添加计算器功能，准备好后再补充最终联系信息。",
      returnToCalculator: "返回计算器"
    },
    update: {
      ready: "新版本已可用。"
    },
    alerts: {
      cannotAddOptionalBuilding: "无法添加可选建筑：没有可用等级数据",
      dataLoadingError: "加载计算器数据时出错。请刷新页面。",
      dataStillLoading: "数据仍在加载中。请稍后重试。",
      currentExceedsTarget: "请确保当前等级不高于目标等级。",
      invalidOptionalBuilding: "某个可选建筑的建筑或等级选择无效。请重新选择后重试。",
      optionalTargetBelowCurrent: "{building}: 目标等级不能低于当前等级。",
      invalidBearHuntTier: "某一行熊狩邮件的伤害档位无效。请重新选择后重试。",
      invalidBearHuntCount: "熊狩邮件数量必须为 0 或更大。",
      goalExceedsFurnace: "{building}：目标等级不能超过燔炉目标等级。燔炉必须首先升级。"
    },
    validation: {
      nonNegativeResource: "{label} 必须是非负数字。你可以使用普通数字或 K/M/B 后缀。",
      nonNegativeNumber: "{label} 必须是非负数字。",
      nonNegativeWholeNumber: "{label} 必须是非负整数。"
    },
    results: {
      loading: "正在加载建筑数据...",
      bearHuntMail: "熊狩邮件（+{count} 封邮件已加入背包）",
      grandTotal: "总计",
      baseCostBeforeZinman: "津曼折扣前基础成本",
      totalUpgradeTimeBase: "总升级时间（基础）",
      additiveSpeed: "加算速度 ({percent}%)",
      doubleTime: "双倍时间 ({percent}%)",
      saved: "节省 {duration}",
      afterUpgradeBalance: "升级后（背包结余）",
      remainingTimeAfterSpeedups: "加速后剩余时间",
      speedupSurplus: "加速剩余",
      customChestRecommendation: "自定义宝箱建议",
      noChestUsage: "当前缺口无需使用宝箱。",
      chestsUsed: "已使用宝箱",
      afterRecommendedChestUse: "按建议使用宝箱后",
      provided: "提供 {amount}",
      uncoveredDeficit: "未覆盖缺口 {amount}",
      rallyCapacity: "集结容量",
      troopDeploymentCapacity: "部队部署容量",
      storageCapacity: "仓储容量",
      essenceStones: "精华石",
      luckyHeroGearChests: "幸运英雄装备箱",
      xpComponents: "XP 组件",
      allianceTokens: "联盟代币",
      charmCostSummary: "成本汇总",
      charmAfterUpgradeBalance: "升级后（材料结余）",
      charmSmartUpgradeComplete: "智能升级完成",
      charmNoUpgradesPossible: "当前材料无法升级。",
      charmMaterialsRemaining: "剩余材料",
      charmsUpgraded: "护符已升级",
      charmBatchUpgrade: "已将{count}个护符升级到{level}"
    },
    resource: {
      meat: "肉",
      wood: "木材",
      coal: "煤",
      iron: "铁"
    }
  },
  pl: {
    page: {
      title: {
        index: "WOS Calc",
        about: "O nas - WOS Calc",
        contact: "Kontakt - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Język"
    },
    theme: {
      darkMode: "Tryb ciemny",
      lightMode: "Tryb jasny"
    },
    account: {
      renameTitle: "Zmień nazwę konta",
      addTitle: "Dodaj konto",
      deleteTitle: "Usuń konto",
      addButton: "+ Konto",
      activeAccount: "Aktywne konto:",
      namePrompt: "Nazwa konta:",
      renamePrompt: "Zmień nazwę konta:",
      defaultName: "Konto {number}",
      cannotDeleteOnly: "Nie można usunąć jedynego konta.",
      deleteConfirm: "Usunąć \"{name}\"? Tej operacji nie można cofnąć."
    },
    nav: {
      calculatorTabs: "Zakładki kalkulatora",
      siteLinks: "Linki strony",
      calculator: "Kalkulator",
      selectCalculator: "Wybierz kalkulator",
      about: "O nas",
      contact: "Kontakt"
    },
    calculator: {
      upgrade: "Ulepszenie",
      chiefGear: "Wyposażenie dowódcy",
      chiefCharm: "Talizman dowódcy",
      whatIf: "Co jeśli",
      chiefGearFull: "Kalkulator wyposażenia dowódcy",
      chiefCharmFull: "Kalkulator talizmanu dowódcy",
      whatIfFull: "Kalkulator Co jeśli",
      generic: "Kalkulator"
    },
    sections: {
      targetBuilding: "Budynek docelowy",
      yourResources: "Twoje zasoby",
      constructionBuffs: "Premie budowy (%)",
      requiredBuildings: "Wymagane budynki",
      optionalAdditionalBuildings: "Opcjonalne dodatkowe budynki",
      bearHuntMail: "Poczta polowania na niedźwiedzia",
      chiefGearLevels: "Poziomy wyposażenia dowódcy",
      chiefGearMaterials: "Twoje materiały",
      chiefCharmLevels: "Poziomy talizmanu dowódcy",
      chiefCharmMaterials: "Twoje materiały",
      petLevels: "Poziomy zwierząt",
      petMaterials: "Twoje materiały"
    },
    labels: {
      building: "Budynek",
      currentLevel: "Aktualny poziom",
      targetLevel: "Poziom docelowy",
      targetGoalLevel: "Poziom docelowy (końcowy)",
      meat: "Mięso",
      wood: "Drewno",
      coal: "Węgiel",
      iron: "Żelazo",
      fireCrystals: "Kryształy ognia",
      refinedFireCrystals: "Rafinowane kryształy ognia",
      useCustomResourceChests: "Użyj niestandardowych skrzyń zasobów",
      level1Unsecured: "Poziom 1 niezabezpieczony",
      level1Secured: "Poziom 1 zabezpieczony",
      level2Unsecured: "Poziom 2 niezabezpieczony",
      level2Secured: "Poziom 2 zabezpieczony",
      level3Unsecured: "Poziom 3 niezabezpieczony",
      level3Secured: "Poziom 3 zabezpieczony",
      generalSpeedups: "Ogólne przyspieszenia (minuty)",
      constructionSpeedups: "Przyspieszenia budowy (minuty)",
      doubleTime: "Podwójny czas (20%)",
      castleBuff: "Premia zamku (10%)",
      constructionSpeed: "Prędkość budowy",
      hyenaBuff: "Pomocnik budowniczego (Hiena)",
      zinmanBastionist: "Umiejętność Bastionisty Zinmana",
      positionBuff: "Premia stanowiska",
      damageTier: "Poziom obrażeń",
      mail: "Poczta",
      setAllCurrentLevels: "Ustaw wszystkie aktualne poziomy",
      requiredLevel: "Wymagany poziom",
      hat: "Czapka (Lancer)",
      watch: "Zegarek (Lancer)",
      coat: "Kurtka (Piechota)",
      pants: "Spodnie (Piechota)",
      ring: "Pierścień (Strzelec)",
      shortStaff: "Broń (Strzelec)",
      hardenedAlloy: "Utwardzony stop",
      polishingSolution: "Roztwór polerujący",
      designPlans: "Plany projektowe",
      lunarAmber: "Księżycowy bursztyn",
      charm: "Talizman",
      charmDesigns: "Projekty talizmanu",
      charmGuides: "Przewodniki po talizmanach",
      jewelSecrets: "Sekrety klejnotów"
    },
    buttons: {
      addBuilding: "+ Dodaj budynek",
      addBearHuntMail: "+ Dodaj pocztę polowania na niedźwiedzia",
      calculate: "Oblicz",
      remove: "Usuń",
      setAll: "Ustaw wszystko",
      refresh: "Odśwież",
      reset: "Resetuj",
      calculateCost: "Oblicz koszt",
      smartUpgrade: "Inteligentne ulepszenie"
    },
    options: {
      none0: "Brak (0%)"
    },
    building: {
      furnace: "Piec",
      embassy: "Ambasada",
      research_center: "Centrum badań",
      infirmary: "Lazaret",
      infantry_camp: "Obóz piechoty",
      lancer_camp: "Obóz lancerów",
      marksman_camp: "Obóz strzelców",
      barricade: "Barykada",
      command_center: "Centrum dowodzenia",
      storehouse: "Magazyn"
    },
    comingSoon: {
      title: "Wkrótce",
      placeholderIntro: "Ta zakładka kalkulatora jest obecnie widoczna jako miejsce na przyszłą funkcję, aby użytkownicy mogli zobaczyć, co będzie dalej.",
      placeholderOutro: "Gdy ten kalkulator będzie gotowy, ten komunikat można usunąć i zastąpić pełnym narzędziem.",
      heading: "{calculator} - Wkrótce",
      accountStructured: "Dane konta są już przygotowane dla {account}. Gdy {calculator} będzie dostępny, jego wartości będą zapisywane w tym samym koncie i będą się przełączać wraz z wyborem konta."
    },
    aboutPage: {
      heading: "O nas",
      placeholderOne: "Ta strona O nas jest tymczasowa i zostanie rozbudowana później.",
      placeholderTwo: "Najpierw przygotowujemy architekturę kalkulatora, aby nowe narzędzia można było wdrażać bez utraty danych między kontami.",
      returnToCalculator: "Wróć do kalkulatora"
    },
    contactPage: {
      heading: "Kontakt",
      placeholderOne: "Ta strona Kontakt jest tymczasowa i zostanie rozbudowana później.",
      placeholderTwo: "Najpierw możesz dalej dodawać funkcje kalkulatora, a finalne dane kontaktowe uzupełnić później.",
      returnToCalculator: "Wróć do kalkulatora"
    },
    update: {
      ready: "Nowa wersja jest gotowa."
    },
    results: {
      grandTotal: "SUMA CALKOWITA",
      loading: "Ładowanie danych budynków...",
      bearHuntMail: "POCZTA POLOWANIA NA NIEDŹWIEDZIA (+{count} wiadomości dodanych do plecaka)",
      baseCostBeforeZinman: "Koszt bazowy przed zniżką Zinmana",
      totalUpgradeTimeBase: "Łączny czas ulepszenia (bazowy)",
      additiveSpeed: "Prędkość addytywna ({percent}%)",
      doubleTime: "Podwójny czas ({percent}%)",
      saved: "zaoszczędzono {duration}",
      afterUpgradeBalance: "Po ulepszeniu (stan plecaka)",
      remainingTimeAfterSpeedups: "Pozostały czas po przyspieszeniach",
      speedupSurplus: "Nadwyżka przyspieszeń",
      customChestRecommendation: "REKOMENDACJA NIESTANDARDOWYCH SKRZYŃ",
      noChestUsage: "Dla obecnych braków nie jest potrzebne użycie skrzyń.",
      chestsUsed: "Użyte skrzynie",
      afterRecommendedChestUse: "Po zalecanym użyciu skrzyń",
      provided: "dostarczono {amount}",
      uncoveredDeficit: "niepokryty brak {amount}",
      rallyCapacity: "Pojemność rajdu",
      troopDeploymentCapacity: "Pojemność rozmieszczenia wojsk",
      storageCapacity: "Pojemność magazynu",
      essenceStones: "Kamienie esencji",
      luckyHeroGearChests: "Szczęśliwe skrzynie ekwipunku bohatera",
      xpComponents: "Komponenty XP",
      allianceTokens: "Tokeny sojuszu",
      charmCostSummary: "PODSUMOWANIE KOSZTÓW",
      charmAfterUpgradeBalance: "PO ULEPSZENIU (STAN MATERIAŁÓW)",
      charmSmartUpgradeComplete: "Inteligentne ulepszenie zakończone",
      charmNoUpgradesPossible: "Brak możliwości ulepszenia przy obecnych materiałach.",
      charmMaterialsRemaining: "Pozostałe materiały",
      charmsUpgraded: "Talizmany ulepszone",
      charmBatchUpgrade: "Ulepszono {count} talizmanów do {level}"
    },
    resource: {
      meat: "Mięso",
      wood: "Drewno",
      coal: "Węgiel",
      iron: "Żelazo"
    },
    alerts: {
      cannotAddOptionalBuilding: "Nie można dodać opcjonalnego budynku: brak dostępnych danych poziomów",
      dataLoadingError: "Błąd podczas ładowania danych kalkulatora. Odśwież stronę.",
      dataStillLoading: "Dane nadal się ładują. Poczekaj i spróbuj ponownie.",
      currentExceedsTarget: "Upewnij się, że aktualny poziom nie przekracza poziomu docelowego.",
      invalidOptionalBuilding: "Jeden z opcjonalnych budynków ma nieprawidłowy wybór budynku lub poziomu. Wybierz ponownie i spróbuj jeszcze raz.",
      optionalTargetBelowCurrent: "{building}: poziom docelowy nie może być niższy niż poziom aktualny.",
      invalidBearHuntTier: "Jeden z wierszy poczty polowania na niedźwiedzia ma nieprawidłowy poziom obrażeń. Wybierz ponownie i spróbuj jeszcze raz.",
      invalidBearHuntCount: "Liczba wiadomości polowania na niedźwiedzia musi wynosić co najmniej 0.",
      goalExceedsFurnace: "{building}: poziom docelowy nie może przekraczać poziomu docelowego Pieca. Piec musi być rozbudowany jako pierwszy."
    },
    validation: {
      nonNegativeResource: "{label} musi być liczbą nieujemną. Możesz używać zwykłych liczb lub sufiksów K/M/B.",
      nonNegativeNumber: "{label} musi być liczbą nieujemną.",
      nonNegativeWholeNumber: "{label} musi być nieujemną liczbą całkowitą."
    }
  },
  ko: {
    page: {
      title: {
        index: "WOS Calc",
        about: "소개 - WOS Calc",
        contact: "문의 - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "언어"
    },
    theme: {
      darkMode: "다크 모드",
      lightMode: "라이트 모드"
    },
    account: {
      renameTitle: "계정 이름 변경",
      addTitle: "계정 추가",
      deleteTitle: "계정 삭제",
      addButton: "+ 계정",
      activeAccount: "활성 계정:",
      namePrompt: "계정 이름:",
      renamePrompt: "계정 이름 변경:",
      defaultName: "계정 {number}",
      cannotDeleteOnly: "유일한 계정은 삭제할 수 없습니다.",
      deleteConfirm: "\"{name}\" 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다."
    },
    nav: {
      calculatorTabs: "계산기 탭",
      siteLinks: "사이트 링크",
      calculator: "계산기",
      selectCalculator: "계산기 선택",
      about: "소개",
      contact: "문의"
    },
    calculator: {
      upgrade: "업그레이드",
      chiefGear: "영주 장비",
      chiefCharm: "영주 보석",
      pets: "애완동물",
      whatIf: "가정 시뮬레이션",
      experts: "전문가 계산기",
      heroGear: "영웅 장비",
      koi: "KoI 계산기",
      research: "연구 업그레이드",
      svs: "SvS 계산기",
      troopTraining: "병력 훈련",
      warAcademy: "전쟁 아카데미",
      about: "소개",
      contact: "문의",
      chiefGearFull: "영주 장비 계산기",
      chiefCharmFull: "영주 보석 계산기",
      whatIfFull: "가정 시뮬레이션 계산기",
      generic: "계산기"
    },
    sections: {
      targetBuilding: "목표 건물",
      yourResources: "보유 자원",
      constructionBuffs: "건설 버프 (%)",
      requiredBuildings: "필수 건물",
      optionalAdditionalBuildings: "선택 추가 건물",
      bearHuntMail: "곰 사냥 메일",
      chiefGearLevels: "대장 장비 레벨",
      chiefGearMaterials: "보유 재료",
      chiefCharmLevels: "대장 부적 레벨",
      chiefCharmMaterials: "보유 재료",
      petLevels: "애완동물 레벨",
      petMaterials: "보유 재료"
    },
    labels: {
      building: "건물",
      currentLevel: "현재 레벨",
      targetLevel: "목표 레벨",
      targetGoalLevel: "목표(최종) 레벨",
      meat: "고기",
      wood: "목재",
      coal: "석탄",
      iron: "철",
      fireCrystals: "불의 수정",
      refinedFireCrystals: "정제된 불의 수정",
      useCustomResourceChests: "자원 선택 상자 사용",
      level1Unsecured: "1레벨 미보호",
      level1Secured: "1레벨 보호",
      level2Unsecured: "2레벨 미보호",
      level2Secured: "2레벨 보호",
      level3Unsecured: "3레벨 미보호",
      level3Secured: "3레벨 보호",
      generalSpeedups: "공용 가속 (분)",
      constructionSpeedups: "건설 가속 (분)",
      doubleTime: "건설 가속",
      castleBuff: "집행관 버프",
      constructionSpeed: "건설 속도",
      hyenaBuff: "건설 도우미(하이에나) 버프",
      zinmanBastionist: "진먼 건축 예술 스킬",
      positionBuff: "직책 버프",
      damageTier: "피해 구간",
      mail: "메일",
      setAllCurrentLevels: "모든 현재 레벨 설정",
      requiredLevel: "필요 레벨",
      hat: "모자 (창병)",
      watch: "시계 (창병)",
      coat: "상의 (방패병)",
      pants: "하의 (방패병)",
      ring: "반지 (궁병)",
      shortStaff: "무기 (궁병)",
      hardenedAlloy: "강화 합금",
      polishingSolution: "연마액",
      designPlans: "설계 도면",
      lunarAmber: "루나 앰버",
      charm: "부적",
      charmDesigns: "부적 도안",
      charmGuides: "부적 가이드",
      jewelSecrets: "보석 비밀",
      pet: "애완동물",
      petFood: "애완동물 사료",
      tamingManual: "길들이기 매뉴얼",
      energizingPotion: "에너지 물약",
      strengtheningSerum: "강화 세럼"
    },
    buttons: {
      addBuilding: "+ 건물 추가",
      addBearHuntMail: "+ 곰 사냥 메일 추가",
      calculate: "계산",
      remove: "제거",
      setAll: "모두 적용",
      refresh: "새로 고침",
      reset: "초기화",
      calculateCost: "비용 계산",
      smartUpgrade: "스마트 업그레이드"
    },
    options: {
      none0: "없음 (0%)"
    },
    building: {
      furnace: "용광로",
      embassy: "대사관",
      research_center: "연구소",
      infirmary: "의무실",
      infantry_camp: "방패병 병영",
      lancer_camp: "창병 병영",
      marksman_camp: "궁병 병영",
      barricade: "성벽",
      command_center: "지휘부",
      storehouse: "창고"
    },
    comingSoon: {
      title: "곧 출시",
      placeholderIntro: "이 계산기 탭은 다음 계획을 보여주기 위한 자리 표시자로 현재 표시됩니다.",
      placeholderOutro: "이 계산기가 출시되면 이 메시지를 제거하고 전체 도구로 교체할 수 있습니다.",
      heading: "{calculator} - 곧 출시",
      accountStructured: "{account} 계정에 대한 데이터 구조가 이미 준비되어 있습니다. {calculator}가 출시되면 해당 값은 같은 계정에 저장되고 계정 선택기에 따라 전환됩니다."
    },
    aboutPage: {
      heading: "소개",
      placeholderOne: "이 소개 페이지는 임시 페이지이며 나중에 확장됩니다.",
      placeholderTwo: "새 도구를 계정 간 데이터 손실 없이 출시할 수 있도록 계산기 구조를 먼저 준비하고 있습니다.",
      returnToCalculator: "계산기로 돌아가기"
    },
    contactPage: {
      heading: "문의",
      placeholderOne: "이 문의 페이지는 임시 페이지이며 나중에 확장됩니다.",
      placeholderTwo: "먼저 계산기 기능을 계속 추가하고 준비되면 최종 문의 정보를 넣을 수 있습니다.",
      returnToCalculator: "계산기로 돌아가기"
    },
    update: {
      ready: "새 버전이 준비되었습니다."
    },
    alerts: {
      cannotAddOptionalBuilding: "선택 건물을 추가할 수 없습니다: 사용 가능한 레벨 데이터가 없습니다",
      dataLoadingError: "계산기 데이터를 불러오는 중 오류가 발생했습니다. 페이지를 새로고침하세요.",
      dataStillLoading: "데이터를 아직 불러오는 중입니다. 잠시 후 다시 시도하세요.",
      currentExceedsTarget: "현재 레벨이 목표 레벨을 초과하지 않도록 확인하세요.",
      invalidOptionalBuilding: "선택 건물 중 하나의 건물 또는 레벨 선택이 유효하지 않습니다. 다시 선택하고 다시 시도하세요.",
      optionalTargetBelowCurrent: "{building}: 목표 레벨은 현재 레벨보다 낮을 수 없습니다.",
      invalidBearHuntTier: "곰 사냥 메일 행 중 하나의 피해 구간이 유효하지 않습니다. 다시 선택하고 다시 시도하세요.",
      invalidBearHuntCount: "곰 사냥 메일 수량은 0 이상이어야 합니다.",
      goalExceedsFurnace: "{building}: 목표 레벨은 용광로 목표 레벨을 초과할 수 없습니다. 용광로를 먼저 업그레이드해야 합니다."
    },
    validation: {
      nonNegativeResource: "{label}은(는) 0 이상의 숫자여야 합니다. 일반 숫자 또는 K/M/B 접미사를 사용할 수 있습니다.",
      nonNegativeNumber: "{label}은(는) 0 이상의 숫자여야 합니다.",
      nonNegativeWholeNumber: "{label}은(는) 0 이상의 정수여야 합니다."
    },
    results: {
      loading: "건물 데이터를 불러오는 중...",
      bearHuntMail: "곰 사냥 메일 (+{count}개의 메일이 가방에 추가됨)",
      grandTotal: "총합",
      baseCostBeforeZinman: "진만 할인 적용 전 기본 비용",
      totalUpgradeTimeBase: "총 업그레이드 시간 (기본)",
      additiveSpeed: "가산 속도 ({percent}%)",
      doubleTime: "더블 타임 ({percent}%)",
      saved: "{duration} 절약",
      afterUpgradeBalance: "업그레이드 후 (가방 잔량)",
      remainingTimeAfterSpeedups: "가속 적용 후 남은 시간",
      speedupSurplus: "가속 잉여",
      customChestRecommendation: "사용자 지정 상자 추천",
      noChestUsage: "현재 부족분에는 상자 사용이 필요하지 않습니다.",
      chestsUsed: "사용한 상자",
      afterRecommendedChestUse: "추천 상자 사용 후",
      provided: "제공됨 {amount}",
      uncoveredDeficit: "미충족 부족분 {amount}",
      rallyCapacity: "집결 수용량",
      troopDeploymentCapacity: "부대 배치 수용량",
      storageCapacity: "저장 수용량",
      essenceStones: "에센스 스톤",
      luckyHeroGearChests: "행운의 영웅 장비 상자",
      xpComponents: "XP 부품",
      allianceTokens: "연맹 토큰",
      charmCostSummary: "비용 요약",
      charmAfterUpgradeBalance: "업그레이드 후 (재료 잔량)",
      charmSmartUpgradeComplete: "스마트 업그레이드 완료",
      charmNoUpgradesPossible: "현재 재료로는 업그레이드할 수 없습니다.",
      charmMaterialsRemaining: "남은 재료",
      charmsUpgraded: "부적 업그레이드 완료",
      charmBatchUpgrade: "{count}개의 부적을 {level}(으)로 업그레이드함",
      optimizedPlan: "최적화 계획",
      gearPiece: "장비 조각",
      finalLevel: "최종 레벨",
      svsPointsGained: "획득한 SVS 포인트:",
      materialsRemaining: "남은 재료:"
    },
    resource: {
      meat: "고기",
      wood: "목재",
      coal: "석탄",
      iron: "철"
    }
  },
  ja: {
    page: {
      title: {
        index: "WOS Calc",
        about: "概要 - WOS Calc",
        contact: "連絡先 - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "言語"
    },
    theme: {
      darkMode: "ダークモード",
      lightMode: "ライトモード"
    },
    account: {
      renameTitle: "アカウント名を変更",
      addTitle: "アカウントを追加",
      deleteTitle: "アカウントを削除",
      addButton: "+ アカウント",
      activeAccount: "アクティブなアカウント:",
      namePrompt: "アカウント名:",
      renamePrompt: "アカウント名を変更:",
      defaultName: "アカウント {number}",
      cannotDeleteOnly: "唯一のアカウントは削除できません。",
      deleteConfirm: "\"{name}\" を削除しますか? この操作は元に戻せません。"
    },
    nav: {
      calculatorTabs: "計算機タブ",
      siteLinks: "サイトリンク",
      calculator: "計算機",
      selectCalculator: "計算機を選択",
      about: "概要",
      contact: "連絡先"
    },
    calculator: {
      upgrade: "アップグレード",
      chiefGear: "チーフ装備",
      chiefCharm: "チーフチャーム",
      pets: "ペット",
      whatIf: "もしもシミュレーション",
      chiefGearFull: "チーフ装備計算機",
      chiefCharmFull: "チーフチャーム計算機",
      whatIfFull: "もしもシミュレーション計算機",
      generic: "計算機"
    },
    sections: {
      targetBuilding: "目標建物",
      yourResources: "所持資源",
      constructionBuffs: "建設バフ (%)",
      requiredBuildings: "必要建物",
      optionalAdditionalBuildings: "任意の追加建物",
      bearHuntMail: "熊狩りメール",
      chiefGearLevels: "チーフ装備レベル",
      chiefGearMaterials: "所持材料",
      chiefCharmLevels: "チーフチャームレベル",
      chiefCharmMaterials: "所持材料",
      petLevels: "ペットレベル",
      petMaterials: "所持材料"
    },
    labels: {
      building: "建物",
      currentLevel: "現在レベル",
      targetLevel: "目標レベル",
      targetGoalLevel: "目標（最終）レベル",
      meat: "肉",
      wood: "木材",
      coal: "石炭",
      iron: "鉄",
      fireCrystals: "火晶",
      refinedFireCrystals: "精製火晶",
      useCustomResourceChests: "カスタム資源箱を使用",
      level1Unsecured: "レベル1 未保護",
      level1Secured: "レベル1 保護",
      level2Unsecured: "レベル2 未保護",
      level2Secured: "レベル2 保護",
      level3Unsecured: "レベル3 未保護",
      level3Secured: "レベル3 保護",
      generalSpeedups: "一般加速（分）",
      constructionSpeedups: "建設加速（分）",
      doubleTime: "ダブルタイム (20%)",
      castleBuff: "城バフ (10%)",
      constructionSpeed: "建設速度",
      hyenaBuff: "建設補助（ハイエナ）バフ",
      zinmanBastionist: "ジンマンのバスティオニストスキル",
      positionBuff: "役職バフ",
      damageTier: "ダメージ階層",
      mail: "メール",
      setAllCurrentLevels: "すべての現在レベルを設定",
      requiredLevel: "必要レベル",
      hat: "帽子 (ランサー)",
      watch: "時計 (ランサー)",
      coat: "コート (盾兵)",
      pants: "パンツ (盾兵)",
      ring: "指輪 (弓兵)",
      shortStaff: "武器 (弓兵)",
      hardenedAlloy: "強化合金",
      polishingSolution: "研磨剤",
      designPlans: "設計図",
      lunarAmber: "ルナアンバー",
      charm: "チャーム",
      charmDesigns: "チャーム設計図",
      charmGuides: "チャームガイド",
      jewelSecrets: "ジュエルの秘密",
      pet: "ペット",
      petFood: "ペットフード",
      tamingManual: "調教マニュアル",
      energizingPotion: "エナジーポーション",
      strengtheningSerum: "強化セラム"
    },
    buttons: {
      addBuilding: "+ 建物を追加",
      addBearHuntMail: "+ 熊狩りメールを追加",
      calculate: "計算",
      remove: "削除",
      setAll: "すべて設定",
      refresh: "更新",
      reset: "リセット",
      calculateCost: "コスト計算",
      smartUpgrade: "スマートアップグレード"
    },
    options: {
      none0: "なし (0%)"
    },
    building: {
      furnace: "炉",
      embassy: "大使館",
      research_center: "研究センター",
      infirmary: "診療所",
      infantry_camp: "歩兵キャンプ",
      lancer_camp: "ランサーキャンプ",
      marksman_camp: "射手キャンプ",
      barricade: "バリケード",
      command_center: "司令センター",
      storehouse: "倉庫",
      arcticWolf: "ホッキョクオオカミ",
      muskOx: "ジャコウウシ",
      giantTapir: "巨バク",
      titanRoc: "タイタンロック",
      giantElk: "巨大ヘラジカ",
      snowLeopard: "ユキヒョウ",
      caveLion: "ホラアナライオン",
      snowApe: "スノーエイプ",
      ironRhino: "アイアンサイ",
      saberToothTiger: "サーベルタイガー",
      mammoth: "マンモス",
      frostGorilla: "フロストゴリラ",
      frostscaleChameleon: "フロストスケールカメレオン",
      abyssalShelldragon: "アビサルシェルドラゴン",
      caveHyena: "ホラアナハイエナ"
    },
    comingSoon: {
      title: "近日公開",
      placeholderIntro: "この計算機タブは、今後の機能予定を示すプレースホルダーとして表示されています。",
      placeholderOutro: "この計算機が公開されたら、このメッセージは削除して完全なツールに置き換えられます。",
      heading: "{calculator} - 近日公開",
      accountStructured: "{account} のアカウントデータはすでに準備されています。{calculator} が公開されると、その値は同じアカウントに保存され、アカウント選択に応じて切り替わります。"
    },
    aboutPage: {
      heading: "概要",
      placeholderOne: "この概要ページは仮ページで、後で拡張されます。",
      placeholderTwo: "新しいツールをアカウント間のデータ損失なしで公開できるよう、先に計算機の構成を整えています。",
      returnToCalculator: "計算機に戻る"
    },
    contactPage: {
      heading: "連絡先",
      placeholderOne: "この連絡先ページは仮ページで、後で拡張されます。",
      placeholderTwo: "まずは計算機機能の追加を進め、連絡先の最終情報は後で反映できます。",
      returnToCalculator: "計算機に戻る"
    },
    update: {
      ready: "新しいバージョンが利用できます。"
    },
    results: {
      loading: "建物データを読み込み中...",
      bearHuntMail: "熊狩りメール（+{count} 件のメールをバックパックに追加）",
      grandTotal: "合計",
      baseCostBeforeZinman: "ジンマン割引前の基本コスト",
      totalUpgradeTimeBase: "合計アップグレード時間（基本）",
      additiveSpeed: "加算速度 ({percent}%)",
      doubleTime: "ダブルタイム ({percent}%)",
      saved: "{duration} 節約",
      afterUpgradeBalance: "アップグレード後（バックパック残高）",
      remainingTimeAfterSpeedups: "加速後の残り時間",
      speedupSurplus: "加速余剰",
      customChestRecommendation: "カスタム宝箱の推奨",
      noChestUsage: "現在の不足分には宝箱の使用は不要です。",
      chestsUsed: "使用した宝箱",
      afterRecommendedChestUse: "推奨宝箱使用後",
      provided: "供給 {amount}",
      uncoveredDeficit: "未補填不足分 {amount}",
      rallyCapacity: "ラリー容量",
      troopDeploymentCapacity: "部隊展開容量",
      storageCapacity: "倉庫容量",
      essenceStones: "エッセンスストーン",
      luckyHeroGearChests: "ラッキーヒーロー装備宝箱",
      xpComponents: "XPコンポーネント",
      allianceTokens: "同盟トークン",
      charmCostSummary: "コスト概要",
      charmAfterUpgradeBalance: "アップグレード後（材料残高）",
      charmSmartUpgradeComplete: "スマートアップグレード完了",
      charmNoUpgradesPossible: "現在の材料ではアップグレードできません。",
      charmMaterialsRemaining: "残りの材料",
      charmsUpgraded: "チャームをアップグレードしました",
      charmBatchUpgrade: "{count}個のチャームを{level}にアップグレード",
      optimizedPlan: "最適化プラン",
      gearPiece: "装備部位",
      finalLevel: "最終レベル",
      svsPointsGained: "獲得SVSポイント:",
      materialsRemaining: "残り材料:"
    },
    resource: {
      meat: "肉",
      wood: "木材",
      coal: "石炭",
      iron: "鉄"
    },
    alerts: {
      cannotAddOptionalBuilding: "オプション建物を追加できません: 利用可能なレベルデータがありません",
      dataLoadingError: "計算機データの読み込み中にエラーが発生しました。ページを更新してください。",
      dataStillLoading: "データを読み込み中です。しばらく待ってから再試行してください。",
      currentExceedsTarget: "現在レベルが目標レベルを超えないようにしてください。",
      invalidOptionalBuilding: "オプション建物のいずれかで建物またはレベルの選択が無効です。選び直して再試行してください。",
      optionalTargetBelowCurrent: "{building}: 目標レベルは現在レベル未満にできません。",
      invalidBearHuntTier: "熊狩りメールの行のいずれかでダメージ階層が無効です。選び直して再試行してください。",
      invalidBearHuntCount: "熊狩りメールの件数は 0 以上である必要があります。",
      goalExceedsFurnace: "{building}: 目標レベルは炉の目標レベルを超えることはできません。炉を先にアップグレードする必要があります。"
    },
    validation: {
      nonNegativeResource: "{label} は 0 以上の数値である必要があります。通常の数値または K/M/B 接尾辞を使用できます。",
      nonNegativeNumber: "{label} は 0 以上の数値である必要があります。",
      nonNegativeWholeNumber: "{label} は 0 以上の整数である必要があります。"
    }
  },
  fil: {
    page: {
      title: {
        index: "WOS Calc",
        about: "Tungkol - WOS Calc",
        contact: "Makipag-ugnayan - WOS Calc"
      }
    },
    app: {
      name: "WOS Calc"
    },
    language: {
      label: "Wika"
    },
    theme: {
      darkMode: "Dark Mode",
      lightMode: "Light Mode"
    },
    account: {
      renameTitle: "Baguhin ang pangalan ng account",
      addTitle: "Magdagdag ng account",
      deleteTitle: "Tanggalin ang account",
      addButton: "+ Account",
      activeAccount: "Active na account:",
      namePrompt: "Pangalan ng account:",
      renamePrompt: "Baguhin ang pangalan ng account:",
      defaultName: "Account {number}",
      cannotDeleteOnly: "Hindi maaaring tanggalin ang tanging account.",
      deleteConfirm: "Tanggalin ang \"{name}\"? Ang aksyong ito ay hindi maaaring bawiin."
    },
    nav: {
      calculatorTabs: "Mga tab ng calculator",
      siteLinks: "Mga link ng site",
      calculator: "Calculator",
      selectCalculator: "Pumili ng Calculator",
      about: "Tungkol",
      contact: "Makipag-ugnayan"
    },
    calculator: {
      upgrade: "Upgrade",
      chiefGear: "Chief Gear",
      chiefCharm: "Chief Charm",
      pets: "Mga Alagang Hayop",
      whatIf: "Paano kung",
      chiefGearFull: "Chief Gear Calculator",
      chiefCharmFull: "Chief Charm Calculator",
      whatIfFull: "Paano Kung Calculator",
      generic: "Calculator"
    },
    sections: {
      targetBuilding: "Target na Gusali",
      yourResources: "Iyong Mga Resources",
      constructionBuffs: "Construction Buffs (%)",
      requiredBuildings: "Kailangang Gusali",
      optionalAdditionalBuildings: "Opsyonal na Karagdagang Gusali",
      bearHuntMail: "Bear Hunt Mail",
      chiefGearLevels: "Mga Antas ng Chief Gear",
      chiefGearMaterials: "Iyong mga materyales",
      chiefCharmLevels: "Mga Antas ng Chief Charm",
      chiefCharmMaterials: "Iyong mga materyales",
      petLevels: "Mga Antas ng Pet",
      petMaterials: "Iyong mga materyales"
    },
    labels: {
      building: "Gusali",
      currentLevel: "Kasalukuyang Antas",
      targetLevel: "Target na Antas",
      targetGoalLevel: "Target (Layunin) na Antas",
      meat: "Lasa",
      wood: "Kahoy",
      coal: "Uling",
      iron: "Bakal",
      fireCrystals: "Fire Crystals",
      refinedFireCrystals: "Refined Fire Crystals",
      useCustomResourceChests: "Gumamit ng Custom Resource Chests",
      level1Unsecured: "Level 1 Unsecured",
      level1Secured: "Level 1 Secured",
      level2Unsecured: "Level 2 Unsecured",
      level2Secured: "Level 2 Secured",
      level3Unsecured: "Level 3 Unsecured",
      level3Secured: "Level 3 Secured",
      generalSpeedups: "General Speedups (minuto)",
      constructionSpeedups: "Construction Speedups (minuto)",
      doubleTime: "Double Time (20%)",
      castleBuff: "Castle Buff (10%)",
      constructionSpeed: "Construction Speed",
      hyenaBuff: "Builder's Aide (Hyena) Buff",
      zinmanBastionist: "Zinman's Bastionist Skill",
      positionBuff: "Position Buff",
      damageTier: "Damage Tier",
      mail: "Mail",
      setAllCurrentLevels: "I-set ang lahat ng kasalukuyang antas",
      requiredLevel: "Kailangang Antas",
      hat: "Sumbrero (Lancer)",
      watch: "Orasan (Lancer)",
      coat: "Kapa (Infantry)",
      pants: "Pantalon (Infantry)",
      ring: "Singsing (Marksman)",
      shortStaff: "Sandata (Marksman)",
      hardenedAlloy: "Hardened Alloy",
      polishingSolution: "Polishing Solution",
      designPlans: "Design Plans",
      lunarAmber: "Lunar Amber",
      charm: "Charm",
      charmDesigns: "Mga Disenyo ng Charm",
      charmGuides: "Mga Gabay sa Charm",
      jewelSecrets: "Mga Lihim ng Hiyas",
      pet: "Pet",
      petFood: "Pagkain ng Pet",
      tamingManual: "Taming Manual",
      energizingPotion: "Energizing Potion",
      strengtheningSerum: "Strengthening Serum"
    },
    buttons: {
      addBuilding: "+ Magdagdag ng Gusali",
      addBearHuntMail: "+ Magdagdag ng Bear Hunt Mail",
      calculate: "Kalkulahin",
      remove: "Alisin",
      setAll: "I-set ang Lahat",
      refresh: "I-refresh",
      reset: "I-reset",
      calculateCost: "Kalkulahin ang Gastos",
      smartUpgrade: "Smart Upgrade"
    },
    options: {
      none0: "Wala (0%)"
    },
    building: {
      furnace: "Furnace",
      embassy: "Embassy",
      research_center: "Research Center",
      infirmary: "Infirmary",
      infantry_camp: "Infantry Camp",
      lancer_camp: "Lancer Camp",
      marksman_camp: "Marksman Camp",
      barricade: "Barricade",
      command_center: "Command Center",
      storehouse: "Storehouse"
    },
    comingSoon: {
      title: "Malapit na",
      placeholderIntro: "Ang calculator tab na ito ay visible bilang placeholder upang makita ng mga user kung ano ang susunod.",
      placeholderOutro: "Kapag live na ang calculator na ito, ang mensaheng ito ay maaaring alisin at palitan ng buong tool.",
      heading: "{calculator} - Malapit na",
      accountStructured: "Ang account data ay nakaayos na para sa {account}. Kapag live ang {calculator}, ang mga values nito ay mae-save sa ilalim ng parehong account at magbabago kasama ang account selector."
    },
    aboutPage: {
      heading: "Tungkol",
      placeholderOne: "Ang About page na ito ay placeholder at mae-expand pa sa hinaharap.",
      placeholderTwo: "Ang calculator architecture ay ino-organize muna upang ang mga bagong tool ay maaaring ilabas nang walang mawawalang data sa pagitan ng mga account.",
      returnToCalculator: "Bumalik sa Calculator"
    },
    contactPage: {
      heading: "Makipag-ugnayan",
      placeholderOne: "Ang Contact page na ito ay placeholder at mae-expand pa sa hinaharap.",
      placeholderTwo: "Maaari kang magpatuloy sa pagdagdag ng calculator features at magdagdag ng final contact details kapag handa na.",
      returnToCalculator: "Bumalik sa Calculator"
    },
    update: {
      ready: "Handa na ang bagong bersyon."
    },
    alerts: {
      cannotAddOptionalBuilding: "Hindi maaaring magdagdag ng optional building: walang available na level data",
      dataLoadingError: "Error sa pag-load ng calculator data. Mangyaring i-refresh ang page.",
      dataStillLoading: "Ang data ay nagsisikap pang mag-load. Mangyaring maghintay at subukan muli.",
      currentExceedsTarget: "Mangyaring tiyakin na ang kasalukuyang antas ay hindi lumalampas sa target antas.",
      invalidOptionalBuilding: "Ang isang optional building ay may invalid na building o level selection. Mangyaring piliin muli at subukan.",
      optionalTargetBelowCurrent: "{building}: ang target level ay hindi maaaring mababa kaysa sa kasalukuyang antas.",
      invalidBearHuntTier: "Ang isang Bear Hunt Mail row ay may invalid na damage tier. Mangyaring piliin muli at subukan.",
      invalidBearHuntCount: "Ang Bear Hunt Mail counts ay dapat na 0 o mas mataas.",
      goalExceedsFurnace: "{building}: ang goal level ay hindi maaaring lumampas sa furnace goal level. Ang furnace ay kailangang i-upgrade muna."
    },
    validation: {
      nonNegativeResource: "{label} ay dapat na isang non-negative number. Maaari kang gumamit ng plain numbers o K/M/B suffixes.",
      nonNegativeNumber: "{label} ay dapat na isang non-negative number.",
      nonNegativeWholeNumber: "{label} ay dapat na isang non-negative whole number."
    },
    results: {
      loading: "Nag-load ng building data...",
      bearHuntMail: "BEAR HUNT MAIL (+{count} mail na idinagdag sa backpack)",
      grandTotal: "KABUUANG TOTAL",
      baseCostBeforeZinman: "Base Cost Bago ang Zinman Discount",
      totalUpgradeTimeBase: "Kabuuang Upgrade Time (Base)",
      additiveSpeed: "Additive Speed ({percent}%)",
      doubleTime: "Double Time ({percent}%)",
      saved: "{duration} na nai-save",
      afterUpgradeBalance: "Pagkatapos ng Upgrade (Backpack Balance)",
      remainingTimeAfterSpeedups: "Natitirang Oras Pagkatapos ng Speedups",
      speedupSurplus: "Speedup Surplus",
      customChestRecommendation: "CUSTOM CHEST RECOMMENDATION",
      noChestUsage: "Walang chest usage na kailangan para sa kasalukuyang deficits.",
      chestsUsed: "Chests na Ginagamit",
      afterRecommendedChestUse: "Pagkatapos ng Recommended Chest Use",
      provided: "provided {amount}",
      uncoveredDeficit: "uncovered deficit {amount}",
      rallyCapacity: "Rally Capacity",
      troopDeploymentCapacity: "Troop Deployment Capacity",
      storageCapacity: "Storage Capacity",
      essenceStones: "Essence Stones",
      luckyHeroGearChests: "Lucky Hero Gear Chests",
      xpComponents: "XP Components",
      allianceTokens: "Alliance Tokens",
      charmCostSummary: "BUOD NG GASTOS",
      charmAfterUpgradeBalance: "PAGKATAPOS NG UPGRADE (BALANSE NG MATERYAL)",
      charmSmartUpgradeComplete: "Kumpleto na ang Smart Upgrade",
      charmNoUpgradesPossible: "Walang upgrade na posible gamit ang kasalukuyang mga materyales.",
      charmMaterialsRemaining: "Natitirang mga materyales",
      charmsUpgraded: "Na-upgrade ang mga anting-anting",
      charmBatchUpgrade: "Na-upgrade ang {count} anting-anting sa {level}"
    },
    resource: {
      meat: "Lasa",
      wood: "Kahoy",
      coal: "Uling",
      iron: "Bakal"
    }
  }
};

function getCurrentLanguage() {
  const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return Object.prototype.hasOwnProperty.call(TRANSLATIONS, stored) ? stored : DEFAULT_LANGUAGE;
}

function getTranslationValue(language, key) {
  return key.split(".").reduce((acc, part) => (acc && Object.prototype.hasOwnProperty.call(acc, part) ? acc[part] : undefined), TRANSLATIONS[language]);
}

function formatTranslation(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, (_, name) => {
    return Object.prototype.hasOwnProperty.call(vars || {}, name) ? vars[name] : `{${name}}`;
  });
}

function t(key, vars = {}, fallback = "") {
  const language = getCurrentLanguage();
  const value = getTranslationValue(language, key);
  if (typeof value === "string") return formatTranslation(value, vars);

  const englishValue = getTranslationValue(DEFAULT_LANGUAGE, key);
  if (typeof englishValue === "string") return formatTranslation(englishValue, vars);

  return fallback || key;
}

function translatePage(root = document) {
  root.querySelectorAll("[data-i18n]").forEach(el => {
    el.textContent = t(el.dataset.i18n, {}, el.textContent);
  });

  root.querySelectorAll("[data-i18n-title]").forEach(el => {
    el.title = t(el.dataset.i18nTitle, {}, el.title);
  });

  root.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder, {}, el.placeholder);
  });

  root.querySelectorAll("[data-i18n-aria-label]").forEach(el => {
    el.setAttribute("aria-label", t(el.dataset.i18nAriaLabel, {}, el.getAttribute("aria-label") || ""));
  });

  document.documentElement.lang = getCurrentLanguage();
}

function populateLanguageSelectors() {
  document.querySelectorAll(".language-select").forEach(select => {
    const value = getCurrentLanguage();
    select.innerHTML = "";

    [
      { value: "en", label: "English" },
      { value: "es", label: "Español" },
      { value: "de", label: "Deutsch" },
      { value: "fr", label: "Français" },
      { value: "pt", label: "Português" },
      { value: "zh-CN", label: "中文(简体)" },
      { value: "pl", label: "Polski" },
      { value: "ko", label: "한국어" },
      { value: "ja", label: "日本語" },
      { value: "fil", label: "Filipino" }
    ].forEach(optionData => {
      const option = document.createElement("option");
      option.value = optionData.value;
      option.textContent = optionData.label;
      option.selected = optionData.value === value;
      select.appendChild(option);
    });

    if (select.dataset.bound === "true") return;
    select.dataset.bound = "true";
    select.addEventListener("change", () => setLanguage(select.value));
  });
}

function setLanguage(language) {
  const nextLanguage = Object.prototype.hasOwnProperty.call(TRANSLATIONS, language) ? language : DEFAULT_LANGUAGE;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
  populateLanguageSelectors();
  translatePage();
  document.dispatchEvent(new CustomEvent("wos:languagechange", { detail: { language: nextLanguage } }));
}

function initI18n() {
  populateLanguageSelectors();
  translatePage();
}

window.i18n = {
  t,
  setLanguage,
  getCurrentLanguage,
  translatePage
};

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initI18n, { once: true });
} else {
  initI18n();
}