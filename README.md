# EDF + BTC: The Missed Opportunity 🥐

A retrospective simulation exploring what EDF (France's state-owned electric utility) could have accumulated in Bitcoin from June 2020 to November 2025 by using its nuclear energy surplus for Bitcoin mining.

## 🔗 Live Demo

[edf-btc.fr](https://edf-btc.fr)

## 💡 Concept

France's nuclear power plants often produce more electricity than needed, creating a "surplus" that's typically exported or curtailed. This project simulates what would have happened if EDF had deployed Bitcoin miners to monetize this excess energy starting from the 3rd Bitcoin halving (May 2020).

## 🎯 Key Results

The simulation shows that with:
- An initial investment of **$25M** in June 2020
- A reinvestment strategy (75% of mined BTC until end of 2021, then 50% until end of 2024)
- Two generations of miners (Antminer S19 Pro + S21)

EDF could have accumulated over **90,000 BTC** worth approximately **$9+ billion** at current prices.

## 🛠 Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Data:** CSV/JSON processing with PapaParse
- **Live Pricing:** DefiLlama API (WBTC price)
- **i18n:** French/English support
- **Deployment:** Docker + NGINX + Let's Encrypt

## 📊 Data Sources

- [RTE Analyses et données](https://analysesetdonnees.rte-france.com/production/nucleaire) - Nuclear production & availability
- [RTE Installed Capacity](https://www.services-rte.com/fr/visualisez-les-donnees-publiees-par-rte/capacite-installee-de-production.html) - Nuclear capacity data
- [Blockchain.com Charts](https://www.blockchain.com/explorer/charts) - Bitcoin hash rate, total BTC, market prices
- [EDF REMIT RSS Feed](https://www.edf.fr/toutes-les-indisponibilites-doaat/feed) - Real-time unavailability events

## 🚀 Getting Started

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

### Production Deployment (VPS)

The app runs in Docker with NGINX as a reverse proxy and automatic TLS via Let's Encrypt.

```bash
# 1. Point your domain's A records to your VPS IP
# 2. Clone the repo on your VPS
git clone <repo-url> && cd edf-btc

# 3. Run the bootstrap script (prompts for email, obtains TLS cert, starts everything)
./init-letsencrypt.sh
```

After that, the site is live at `https://edf-btc.fr`. Certificate renewal is automatic.

To rebuild after code changes:

```bash
docker compose up -d --build
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
├── nginx/                 # NGINX reverse proxy config
├── Dockerfile             # Multi-stage Next.js production build
├── docker-compose.yml     # Orchestrates Next.js + NGINX + Certbot
└── init-letsencrypt.sh    # One-time TLS certificate bootstrap
```

## 📝 Data Processing

See [scripts/README.md](scripts/README.md) for documentation on the data processing pipeline:

1. `compute-surplus.ts` - Calculate monthly nuclear energy surplus
2. `bitcoin-mining-monthly.ts` - Aggregate Bitcoin network data
3. `mining-simulation.ts` - Run the mining simulation