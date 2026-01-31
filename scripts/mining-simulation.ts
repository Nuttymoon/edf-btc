import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

interface MinerSpec {
  model: string;
  release_year: string;
  hash_rate_th: string;
  efficiency_j_th: string;
  consumption_watts: string;
  approx_cost_usd: string;
}

interface BitcoinMiningRow {
  month: string;
  avg_hash_rate_eh_s: string;
  bitcoins_created: string;
  th_s_per_bitcoin: string;
  max_price_usd: string;
}

interface SurplusRow {
  month: string;
  optimal_production_twh: string;
  actual_production_twh: string;
  surplus_twh: string;
  surplus_pj: string;
  avg_availability_gw: string;
  days_in_month: string;
}

interface SimulationResult {
  month: string;
  s19_pro_count: number;
  s21_count: number;
  total_hash_rate_th_s: number;
  network_hash_rate_th_s: number;
  our_share_percent: number;
  btc_mined_this_month: number;
  btc_sold_this_month: number;
  btc_balance: number;
  capex_this_month_usd: number;
  total_capex_usd: number;
}

function main() {
  const dataDir = path.join(__dirname, "..", "public", "data");

  // Load miner specs
  console.log("Loading miner specs...");
  const minerCsv = fs.readFileSync(
    path.join(dataDir, "bitcoin-miners-strat.csv"),
    "utf-8"
  );
  const minerData = Papa.parse<MinerSpec>(minerCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;

  const s19Pro = minerData.find((m) => m.model === "Antminer S19 Pro")!;
  const s21 = minerData.find((m) => m.model === "Antminer S21")!;

  console.log(`S19 Pro: ${s19Pro.hash_rate_th} TH/s, ${s19Pro.consumption_watts}W, $${s19Pro.approx_cost_usd}`);
  console.log(`S21: ${s21.hash_rate_th} TH/s, ${s21.consumption_watts}W, $${s21.approx_cost_usd}`);

  // Load bitcoin mining monthly data
  console.log("\nLoading bitcoin mining monthly data...");
  const btcCsv = fs.readFileSync(
    path.join(dataDir, "bitcoin-mining-monthly.csv"),
    "utf-8"
  );
  const btcData = Papa.parse<BitcoinMiningRow>(btcCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;

  const btcByMonth = new Map<string, BitcoinMiningRow>();
  for (const row of btcData) {
    btcByMonth.set(row.month, row);
  }
  console.log(`Loaded ${btcByMonth.size} monthly bitcoin records`);

  // Load nuclear surplus data
  console.log("Loading nuclear surplus data...");
  const surplusCsv = fs.readFileSync(
    path.join(dataDir, "nuclear-surplus.csv"),
    "utf-8"
  );
  const surplusData = Papa.parse<SurplusRow>(surplusCsv, {
    header: true,
    skipEmptyLines: true,
  }).data;
  console.log(`Loaded ${surplusData.length} monthly surplus records`);

  // Strategy parameters
  const INITIAL_S19_INVESTMENT = 25_000_000; // $25M initial investment for S19 Pro
  const INITIAL_S21_INVESTMENT = 50_000_000; // $50M initial investment for S21
  const REINVEST_RATIO_S19 = 0.75; // Reinvest 75% of mined BTC for S19 Pro period
  const REINVEST_RATIO_S21 = 0.5; // Reinvest 50% of mined BTC for S21 period

  // Miner specs as numbers
  const s19ProHashRate = parseFloat(s19Pro.hash_rate_th);
  const s19ProPower = parseFloat(s19Pro.consumption_watts);
  const s19ProCost = parseFloat(s19Pro.approx_cost_usd);

  const s21HashRate = parseFloat(s21.hash_rate_th);
  const s21Power = parseFloat(s21.consumption_watts);
  const s21Cost = parseFloat(s21.approx_cost_usd);

  // State variables
  let s19ProCount = 0;
  let s21Count = 0;
  let btcBalance = 0;
  let totalCapex = 0;

  console.log("\n=== MINING SIMULATION ===");
  console.log(`Strategy:`);
  console.log(`  - 2020-06: Buy $25M of S19 Pro`);
  console.log(`  - 2020-07 to 2021-12: Sell 75% of newly mined BTC → buy more S19 Pro`);
  console.log(`  - 2022-01 to 2023-09: Accumulate BTC (no new S19 Pro available)`);
  console.log(`  - 2023-10: Buy $50M of S21 (keep S19 Pro running)`);
  console.log(`  - 2023-11 to 2024-12: Sell 50% of newly mined BTC → buy more S21`);
  console.log(`  - 2025+: Accumulate BTC with combined fleet\n`);

  const results: SimulationResult[] = [];

  for (const surplus of surplusData) {
    const month = surplus.month;
    const [yearStr] = month.split("-");
    const year = parseInt(yearStr);
    const btc = btcByMonth.get(month);

    if (!btc) {
      console.warn(`No bitcoin data for ${month}, skipping...`);
      continue;
    }

    const surplusPJ = parseFloat(surplus.surplus_pj);
    const daysInMonth = parseInt(surplus.days_in_month);
    const secondsInMonth = daysInMonth * 24 * 60 * 60;
    const btcPrice = parseFloat(btc.max_price_usd);

    let capexThisMonth = 0;
    let btcSoldThisMonth = 0;

    // === BUYING LOGIC ===

    // First month (2020-06): Initial $10M investment in S19 Pro
    if (month === "2020-06") {
      const minersToBuy = Math.floor(INITIAL_S19_INVESTMENT / s19ProCost);
      s19ProCount += minersToBuy;
      capexThisMonth = minersToBuy * s19ProCost;
      totalCapex += capexThisMonth;
      console.log(`${month}: Initial S19 Pro investment - bought ${minersToBuy.toLocaleString()} miners ($${(capexThisMonth / 1e6).toFixed(2)}M)`);
    }
    // 2020-07 to 2021-12: Reinvest 50% of newly mined BTC in more S19 Pro
    // (handled after mining calculation below)
    else if ((year === 2020 && month > "2020-06") || year === 2021) {
      // Flag to handle reinvestment after mining
    }
    // 2023-10: Initial $50M investment in S21
    else if (month === "2023-10") {
      const minersToBuy = Math.floor(INITIAL_S21_INVESTMENT / s21Cost);
      s21Count += minersToBuy;
      capexThisMonth = minersToBuy * s21Cost;
      totalCapex += capexThisMonth;
      console.log(`${month}: Initial S21 investment - bought ${minersToBuy.toLocaleString()} miners ($${(capexThisMonth / 1e6).toFixed(2)}M)`);
    }
    // 2023-11 to 2024-12: Reinvest 50% of newly mined BTC in more S21
    // (handled after mining calculation below)
    else if ((year === 2023 && month > "2023-10") || year === 2024) {
      // Flag to handle reinvestment after mining
    }

    // === MINING CALCULATION ===

    // Calculate total hash rate and power consumption (both fleets combined)
    const totalHashRateTHs = (s19ProCount * s19ProHashRate) + (s21Count * s21HashRate);
    const totalPowerW = (s19ProCount * s19ProPower) + (s21Count * s21Power);

    // Check if we have enough surplus energy
    const surplusJoules = surplusPJ * 1e15;
    const energyNeededMonth = totalPowerW * secondsInMonth;

    // If we don't have enough energy, we can only run a fraction of the fleet
    const energyRatio = energyNeededMonth > 0 ? Math.min(1, surplusJoules / energyNeededMonth) : 0;
    const effectiveHashRate = totalHashRateTHs * energyRatio;

    // Network hash rate in TH/s (convert from EH/s)
    const networkHashRateTHs = parseFloat(btc.avg_hash_rate_eh_s) * 1e6;

    // Our share of the network
    const ourSharePercent = networkHashRateTHs > 0 ? (effectiveHashRate / networkHashRateTHs) * 100 : 0;

    // BTC mined this month
    const bitcoinsCreated = parseFloat(btc.bitcoins_created);
    const btcMinedThisMonth = bitcoinsCreated * (ourSharePercent / 100);

    // === POST-MINING REINVESTMENT ===
    // Sell 50% of newly mined BTC to buy more miners (during reinvestment periods)
    
    // S19 Pro reinvestment period: 2020-07 to 2021-12 (75% reinvestment)
    if ((year === 2020 && month > "2020-06") || year === 2021) {
      const btcToSell = btcMinedThisMonth * REINVEST_RATIO_S19;
      if (btcToSell > 0 && btcPrice > 0) {
        const btcValue = btcToSell * btcPrice;
        const minersToBuy = Math.floor(btcValue / s19ProCost);
        if (minersToBuy > 0) {
          btcSoldThisMonth = btcToSell;
          s19ProCount += minersToBuy;
          capexThisMonth = minersToBuy * s19ProCost;
          totalCapex += capexThisMonth;
          console.log(`${month}: Sold 75% of mined (${btcSoldThisMonth.toFixed(2)} BTC, $${(btcValue / 1e6).toFixed(2)}M) → ${minersToBuy.toLocaleString()} more S19 Pro`);
        }
      }
    }
    // S21 reinvestment period: 2023-11 to 2024-12 (50% reinvestment)
    else if ((year === 2023 && month > "2023-10") || year === 2024) {
      const btcToSell = btcMinedThisMonth * REINVEST_RATIO_S21;
      if (btcToSell > 0 && btcPrice > 0) {
        const btcValue = btcToSell * btcPrice;
        const minersToBuy = Math.floor(btcValue / s21Cost);
        if (minersToBuy > 0) {
          btcSoldThisMonth = btcToSell;
          s21Count += minersToBuy;
          capexThisMonth = minersToBuy * s21Cost;
          totalCapex += capexThisMonth;
          console.log(`${month}: Sold 50% of mined (${btcSoldThisMonth.toFixed(2)} BTC, $${(btcValue / 1e6).toFixed(2)}M) → ${minersToBuy.toLocaleString()} more S21`);
        }
      }
    }

    // Add remaining mined BTC to balance (after selling portion for reinvestment)
    btcBalance += (btcMinedThisMonth - btcSoldThisMonth);

    results.push({
      month,
      s19_pro_count: s19ProCount,
      s21_count: s21Count,
      total_hash_rate_th_s: effectiveHashRate,
      network_hash_rate_th_s: networkHashRateTHs,
      our_share_percent: ourSharePercent,
      btc_mined_this_month: btcMinedThisMonth,
      btc_sold_this_month: btcSoldThisMonth,
      btc_balance: btcBalance,
      capex_this_month_usd: capexThisMonth,
      total_capex_usd: totalCapex,
    });
  }

  // Print summary table
  console.log("\n" + "=".repeat(150));
  console.log(
    "Month   | S19 Pro  | S21      | Hash (TH/s)   | Share (%)  | BTC Mined | BTC Sold  | BTC Balance | CAPEX ($M)  | Total CAPEX"
  );
  console.log("-".repeat(150));

  for (const r of results) {
    console.log(
      `${r.month} | ${r.s19_pro_count.toLocaleString().padStart(8)} | ${r.s21_count.toLocaleString().padStart(8)} | ${r.total_hash_rate_th_s.toLocaleString(undefined, { maximumFractionDigits: 0 }).padStart(13)} | ${r.our_share_percent.toFixed(4).padStart(10)} | ${r.btc_mined_this_month.toFixed(4).padStart(9)} | ${r.btc_sold_this_month.toFixed(4).padStart(9)} | ${r.btc_balance.toFixed(4).padStart(11)} | ${(r.capex_this_month_usd / 1e6).toFixed(2).padStart(11)} | ${(r.total_capex_usd / 1e6).toFixed(2).padStart(11)}`
    );
  }

  console.log("-".repeat(150));

  // Final summary
  const lastResult = results[results.length - 1];
  const totalBtcMined = results.reduce((sum, r) => sum + r.btc_mined_this_month, 0);
  const totalBtcSold = results.reduce((sum, r) => sum + r.btc_sold_this_month, 0);
  const lastBtcPrice = parseFloat(btcByMonth.get(lastResult.month)?.max_price_usd || "0");
  const finalBtcValue = lastResult.btc_balance * lastBtcPrice;

  console.log("\n=== FINAL SUMMARY ===");
  console.log(`Total CAPEX invested: $${(totalCapex / 1e6).toFixed(2)}M`);
  console.log(`Total BTC mined: ${totalBtcMined.toFixed(4)} BTC`);
  console.log(`Total BTC sold (for reinvestment): ${totalBtcSold.toFixed(4)} BTC`);
  console.log(`Final BTC balance: ${lastResult.btc_balance.toFixed(4)} BTC`);
  console.log(`Final fleet: ${lastResult.s19_pro_count.toLocaleString()} S19 Pro + ${lastResult.s21_count.toLocaleString()} S21`);
  console.log(`Final BTC value (at $${lastBtcPrice.toFixed(0)}): $${(finalBtcValue / 1e6).toFixed(2)}M`);
  console.log(`ROI: ${(((finalBtcValue - totalCapex) / totalCapex) * 100).toFixed(1)}%`);

  // Save to CSV
  const outputPath = path.join(dataDir, "mining-simulation.csv");
  const csvOutput = Papa.unparse(results);
  fs.writeFileSync(outputPath, csvOutput);
  console.log(`\nResults saved to ${outputPath}`);
}

main();
