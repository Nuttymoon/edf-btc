# EDF + BTC: The Missed Opportunity 🥐

A retrospective simulation exploring what EDF (France's state-owned electric utility) could have accumulated in Bitcoin from June 2020 to November 2025 by using its nuclear energy surplus for Bitcoin mining.

## 🔗 Live Demo

[Coming soon]

## 💡 Concept

France's nuclear power plants often produce more electricity than needed, creating a "surplus" that's typically exported or curtailed. This project simulates what would have happened if EDF had deployed Bitcoin miners to monetize this excess energy starting from the 3rd Bitcoin halving (May 2020).

## 🎯 Key Results

The simulation shows that with:
- An initial investment of **$25M** in June 2020
- A reinvestment strategy (75% of mined BTC until end of 2021, then 50% until end of 2024)
- Two generations of miners (Antminer S19 Pro + S21)

EDF could have accumulated over **90,000 BTC** worth approximately **$9+ billion** at current prices.

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data:** CSV/JSON processing with PapaParse
- **Live Pricing:** DefiLlama API (WBTC price)
- **i18n:** French/English support

## 📊 Data Sources

- [RTE Analyses et données](https://analysesetdonnees.rte-france.com/production/nucleaire) - Nuclear production & availability
- [RTE Installed Capacity](https://www.services-rte.com/fr/visualisez-les-donnees-publiees-par-rte/capacite-installee-de-production.html) - Nuclear capacity data
- [Blockchain.com Charts](https://www.blockchain.com/explorer/charts) - Bitcoin hash rate, total BTC, market prices
- [EDF REMIT RSS Feed](https://www.edf.fr/toutes-les-indisponibilites-doaat/feed) - Real-time unavailability events

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 📁 Project Structure

```
├── public/data/           # CSV/JSON data files
├── scripts/               # Data processing scripts (see scripts/README.md)
├── src/
│   ├── app/
│   │   ├── [locale]/      # i18n pages (fr/en)
│   │   └── api/           # API routes (BTC price, EDF unavailability)
│   ├── components/        # React components
│   └── i18n/              # Translations
```

## 📝 Data Processing

See [scripts/README.md](scripts/README.md) for documentation on the data processing pipeline:

1. `compute-surplus.ts` - Calculate monthly nuclear energy surplus
2. `bitcoin-mining-monthly.ts` - Aggregate Bitcoin network data
3. `mining-simulation.ts` - Run the mining simulation