# Data Processing Scripts

This folder contains TypeScript scripts for processing energy and Bitcoin data.

## Prerequisites

All scripts are run using `tsx` via npm scripts defined in `package.json`.

## Scripts

### 1. `compute-surplus.ts`

**Command:** `npm run compute-surplus`

**Output:** `public/data/nuclear-surplus.csv`

Computes the monthly nuclear energy surplus in France by comparing:
- **Optimal production**: What could have been produced based on daily reactor availability
- **Actual production**: What was actually produced

**Input files:**
- `public/data/nuclear-availability.csv` - Daily nuclear availability in GW
- `public/data/nuclear-production.csv` - Monthly actual production in TWh

**Output columns:**
| Column | Description |
|--------|-------------|
| `month` | Year-month (YYYY-MM) |
| `optimal_production_twh` | Maximum possible production based on availability |
| `actual_production_twh` | Actual recorded production |
| `surplus_twh` | Energy surplus (optimal - actual) |
| `surplus_pj` | Surplus converted to petajoules (1 TWh = 3.6 PJ) |
| `avg_availability_gw` | Average reactor availability that month |
| `days_in_month` | Number of days in the month |

**Note:** Data starts from June 2020 (3rd Bitcoin halving).

---

### 2. `bitcoin-mining-monthly.ts`

**Command:** `npm run bitcoin-mining-monthly`

**Output:** `public/data/bitcoin-mining-monthly.csv`

Aggregates Bitcoin network data by month, including hash rate, BTC creation, and price.

**Input files:**
- `public/data/hash-rate.json` - Network hash rate over time
- `public/data/total-bitcoins.json` - Total BTC in circulation over time
- `public/data/bitcoin-market-price.json` - Bitcoin market price over time

**Output columns:**
| Column | Description |
|--------|-------------|
| `month` | Year-month (YYYY-MM) |
| `avg_hash_rate_eh_s` | Average network hash rate in EH/s |
| `bitcoins_created` | Total BTC created that month |
| `th_s_per_bitcoin` | Hash power (TH/s) required per BTC mined |
| `max_price_usd` | Maximum BTC price during the month |

---

### 3. `mining-simulation.ts`

**Command:** `npm run mining-simulation`

**Output:** `public/data/mining-simulation.csv`

Simulates a Bitcoin mining operation using France's nuclear energy surplus, following a realistic investment strategy.

**Input files:**
- `public/data/nuclear-surplus.csv` - Monthly energy surplus (from script 1)
- `public/data/bitcoin-mining-monthly.csv` - Network data (from script 2)
- `public/data/bitcoin-miners-strat.csv` - ASIC miner specifications

#### Investment Strategy

The simulation follows this strategy:

1. **June 2020 (Start):** Initial investment of **$10M** in Antminer S19 Pro miners
2. **July 2020 - December 2021:** Each month, sell **50% of mined BTC** and reinvest in additional S19 Pro miners
3. **January 2022 - September 2023:** Continue mining and **accumulate BTC** (no new S19 Pro available)
4. **October 2023:** Initial investment of **$50M** in Antminer S21 miners (keep S19 Pro running!)
5. **November 2023 - December 2024:** Sell **50% of mined BTC** and reinvest in additional S21 miners
6. **January 2025 onwards:** Mine and **accumulate BTC** with combined S19 Pro + S21 fleet

#### Miner Specifications

| Model | Hash Rate | Power | Cost | Available |
|-------|-----------|-------|------|-----------|
| Antminer S19 Pro | 110 TH/s | 3,250W | $2,630 | 2020-2021 |
| Antminer S21 | 200 TH/s | 3,500W | $2,800 | 2024-2025 |

#### Key Features

- **50% reinvestment:** Only 50% of newly mined BTC is sold for reinvestment, the rest is accumulated
- **Dual fleet:** S19 Pro miners are kept running alongside newer S21 miners (not retired)
- **Energy constraint:** Miners can only operate if there's enough surplus nuclear energy. If the fleet requires more energy than the surplus, only a fraction of miners can run.

**Output columns:**
| Column | Description |
|--------|-------------|
| `month` | Year-month (YYYY-MM) |
| `s19_pro_count` | Number of S19 Pro miners in fleet |
| `s21_count` | Number of S21 miners in fleet |
| `total_hash_rate_th_s` | Total operational hash rate |
| `network_hash_rate_th_s` | Network-wide hash rate |
| `our_share_percent` | Our percentage of network hash rate |
| `btc_mined_this_month` | BTC mined this month |
| `btc_sold_this_month` | BTC sold this month (for reinvestment) |
| `btc_balance` | Current BTC holdings |
| `capex_this_month_usd` | Equipment purchased this month |
| `total_capex_usd` | Cumulative equipment investment |

---

## Running All Scripts

To regenerate all data files:

```bash
npm run compute-surplus
npm run bitcoin-mining-monthly
npm run mining-simulation
```

**Note:** Scripts should be run in order, as `mining-simulation.ts` depends on outputs from the other two scripts.

