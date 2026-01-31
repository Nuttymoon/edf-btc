export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "fr";

export const translations = {
  fr: {
    meta: {
      title: "EDF + BTC. L'occasion manquée 🥐",
      description:
        "Simulation de ce qu'EDF aurait pu accumuler en Bitcoin depuis juin 2020 en utilisant le surplus d'énergie nucléaire français.",
    },
    header: {
      liveData: "Simulation rétrospective",
      title: "EDF + BTC. L'occasion manquée",
      subtitle: "Et si EDF avait miné du Bitcoin avec son surplus nucléaire depuis 2020 ?",
      edfNote: "",
    },
    loading: "Chargement des données...",
    error: {
      fetchFailed: "Échec du chargement des données",
      generic: "Une erreur est survenue",
    },
    simulation: {
      totalBtc: "Bitcoins qui auraient été accumulés",
      since: "Juin 2020 → Novembre 2025",
      initialInvestment: "Investissement initial",
      currentValue: "Valeur aujourd'hui",
      btcPrice: "Prix actuel du BTC",
      roi: "Retour sur investissement",
      fleet: "Flotte de mineurs (fin 2025)",
      s19pro: "Antminer S19 Pro",
      s21: "Antminer S21",
      networkShare: "Part du réseau",
      strategy: "Stratégie simulée",
      strategyDesc: "Réinvestissement de 75% des BTC minés (2020-2021), puis 50% (2023-2024)",
    },
    capacity: {
      installed: "Capacité installée",
      available: "Capacité disponible",
      fleet: "Parc nucléaire français",
    },
    unavailability: {
      title: "Indisponibilités en cours",
      active: "actives",
      none: "Aucune indisponibilité signalée",
      lastUpdated: "Dernière mise à jour",
    },
    footer: {
      dataSources: "Sources des données",
      rteCapacity: "RTE Capacité installée",
      rteProduction: "RTE Analyses et données",
      edfFeed: "Flux RSS REMIT EDF",
      blockchainData: "Blockchain.com Charts",
      github: "Code source sur GitHub",
      checkData: "Vérifiez les données !",
    },
    languageSwitcher: {
      label: "Langue",
    },
    charts: {
      bitcoinMining: "Production de Bitcoin",
      accumulatedBtc: "BTC accumulés",
      btcMined: "BTC minés/mois",
      investmentAndMiners: "Investissement & Flotte de mineurs",
      investmentNote: "Un investissement équivalent à 25 millions de dollars aurait été fait début 2020 pour acheter les mineurs initiaux. Tous les investissements ultérieurs auraient été financés à 100% par le produit du minage.",
      investment: "Investissement",
      totalMiners: "Nombre de mineurs",
      energySurplusTitle: "Surplus énergétique nucléaire",
      energyConsumed: "Énergie consommée",
      unusedSurplus: "Surplus non utilisé",
      hashRateTitle: "Puissance de calcul : EDF vs Réseau BTC",
      edfHashRate: "Hash rate EDF",
      networkHashRate: "Hash rate réseau BTC",
    },
  },
  en: {
    meta: {
      title: "EDF + BTC. The Missed Opportunity 🥐",
      description:
        "Simulating what EDF could have accumulated in Bitcoin since June 2020 using France's nuclear energy surplus.",
    },
    header: {
      liveData: "Retrospective Simulation",
      title: "EDF* + BTC. The Missed Opportunity",
      subtitle: "What if EDF had mined Bitcoin with its nuclear surplus since 2020?",
      edfNote: "*EDF (Électricité de France) is France's state-owned electric utility company, operating the world's largest nuclear fleet.",
    },
    loading: "Loading capacity data...",
    error: {
      fetchFailed: "Failed to fetch data",
      generic: "An error occurred",
    },
    simulation: {
      totalBtc: "Bitcoins That Could Have Been Accumulated",
      since: "June 2020 → November 2025",
      initialInvestment: "Initial Investment",
      currentValue: "Value Today",
      btcPrice: "Current BTC Price",
      roi: "Return on Investment",
      fleet: "Mining Fleet (end of 2025)",
      s19pro: "Antminer S19 Pro",
      s21: "Antminer S21",
      networkShare: "Network Share",
      strategy: "Simulated Strategy",
      strategyDesc: "Reinvesting 75% of mined BTC (2020-2021), then 50% (2023-2024)",
    },
    capacity: {
      installed: "Installed Capacity",
      available: "Available Capacity",
      fleet: "French nuclear fleet",
    },
    unavailability: {
      title: "Current Unavailabilities",
      active: "active",
      none: "No current unavailability events reported",
      lastUpdated: "Last updated",
    },
    footer: {
      dataSources: "Data sources",
      rteCapacity: "RTE Installed Capacity",
      rteProduction: "RTE Analytics & Data",
      edfFeed: "EDF REMIT RSS Feed",
      blockchainData: "Blockchain.com Charts",
      github: "Source code on GitHub",
      checkData: "Check the data!",
    },
    languageSwitcher: {
      label: "Language",
    },
    charts: {
      bitcoinMining: "Bitcoin Production",
      accumulatedBtc: "Accumulated BTC",
      btcMined: "BTC Mined/Month",
      investmentAndMiners: "Investment & Mining Fleet",
      investmentNote: "An equivalent investment of $25 million would have been made in early 2020 to purchase the initial miners. All subsequent investments would have been 100% funded by mining proceeds.",
      investment: "Investment",
      totalMiners: "Total Miners",
      energySurplusTitle: "Nuclear Energy Surplus",
      energyConsumed: "Energy Consumed",
      unusedSurplus: "Unused Surplus",
      hashRateTitle: "Hash Rate: EDF vs BTC Network",
      edfHashRate: "EDF Hash Rate",
      networkHashRate: "BTC Network Hash Rate",
    },
  },
} as const;

export function getTranslations(locale: Locale) {
  return translations[locale] || translations[defaultLocale];
}

