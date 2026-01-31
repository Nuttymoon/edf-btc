import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

interface DataEntry {
  x: number; // timestamp in milliseconds
  y: number; // value
}

interface HashRateJson {
  "hash-rate": DataEntry[];
}

interface TotalBitcoinsJson {
  "total-bitcoins": DataEntry[];
}

interface MarketPriceJson {
  "market-price": DataEntry[];
}

function timestampToMonthString(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function computeMonthlyHashRates(
  entries: DataEntry[]
): Map<string, { sum: number; count: number }> {
  const monthlyData = new Map<string, { sum: number; count: number }>();

  for (const entry of entries) {
    const monthStr = timestampToMonthString(entry.x);
    const existing = monthlyData.get(monthStr);

    if (existing) {
      existing.sum += entry.y;
      existing.count += 1;
    } else {
      monthlyData.set(monthStr, { sum: entry.y, count: 1 });
    }
  }

  return monthlyData;
}

function computeMonthlyMaxPrice(
  entries: DataEntry[]
): Map<string, number> {
  const monthlyData = new Map<string, number>();

  for (const entry of entries) {
    const monthStr = timestampToMonthString(entry.x);
    const existing = monthlyData.get(monthStr);

    if (existing === undefined || entry.y > existing) {
      monthlyData.set(monthStr, entry.y);
    }
  }

  return monthlyData;
}

function computeMonthlyBitcoins(
  entries: DataEntry[]
): Map<string, { startTotal: number; endTotal: number }> {
  // Sort entries by timestamp
  const sorted = [...entries].sort((a, b) => a.x - b.x);

  // Group by month, keeping first and last value for each month
  const monthlyData = new Map<
    string,
    { startTotal: number; endTotal: number; startTs: number; endTs: number }
  >();

  for (const entry of sorted) {
    const monthStr = timestampToMonthString(entry.x);
    const existing = monthlyData.get(monthStr);

    if (existing) {
      // Update end value if this is later
      if (entry.x > existing.endTs) {
        existing.endTotal = entry.y;
        existing.endTs = entry.x;
      }
      // Update start value if this is earlier
      if (entry.x < existing.startTs) {
        existing.startTotal = entry.y;
        existing.startTs = entry.x;
      }
    } else {
      monthlyData.set(monthStr, {
        startTotal: entry.y,
        endTotal: entry.y,
        startTs: entry.x,
        endTs: entry.x,
      });
    }
  }

  // Convert to just start/end totals
  const result = new Map<string, { startTotal: number; endTotal: number }>();
  for (const [month, data] of monthlyData) {
    result.set(month, { startTotal: data.startTotal, endTotal: data.endTotal });
  }

  return result;
}

function main() {
  const dataDir = path.join(__dirname, "..", "public", "data");
  const hashRatePath = path.join(dataDir, "hash-rate.json");
  const totalBitcoinsPath = path.join(dataDir, "total-bitcoins.json");
  const marketPricePath = path.join(dataDir, "bitcoin-market-price.json");
  const outputPath = path.join(dataDir, "bitcoin-mining-monthly.csv");

  // Load hash rate data
  console.log("Loading hash rate data...");
  const hashRateJson: HashRateJson = JSON.parse(
    fs.readFileSync(hashRatePath, "utf-8")
  );
  const hashRateEntries = hashRateJson["hash-rate"];
  console.log(`Loaded ${hashRateEntries.length} hash rate entries`);

  // Load total bitcoins data
  console.log("Loading total bitcoins data...");
  const totalBitcoinsJson: TotalBitcoinsJson = JSON.parse(
    fs.readFileSync(totalBitcoinsPath, "utf-8")
  );
  const totalBitcoinsEntries = totalBitcoinsJson["total-bitcoins"];
  console.log(`Loaded ${totalBitcoinsEntries.length} total bitcoins entries`);

  // Load market price data
  console.log("Loading market price data...");
  const marketPriceJson: MarketPriceJson = JSON.parse(
    fs.readFileSync(marketPricePath, "utf-8")
  );
  const marketPriceEntries = marketPriceJson["market-price"];
  console.log(`Loaded ${marketPriceEntries.length} market price entries`);

  // Compute monthly aggregates
  console.log("\nComputing monthly hash rates...");
  const monthlyHashRates = computeMonthlyHashRates(hashRateEntries);
  console.log(`Generated ${monthlyHashRates.size} monthly hash rate records`);

  console.log("Computing monthly Bitcoin totals...");
  const monthlyBitcoins = computeMonthlyBitcoins(totalBitcoinsEntries);
  console.log(`Generated ${monthlyBitcoins.size} monthly Bitcoin records`);

  console.log("Computing monthly max prices...");
  const monthlyMaxPrices = computeMonthlyMaxPrice(marketPriceEntries);
  console.log(`Generated ${monthlyMaxPrices.size} monthly max price records`);

  // Merge data - only include months that have both datasets
  const hashMonths = new Set(monthlyHashRates.keys());
  const btcMonths = new Set(monthlyBitcoins.keys());
  const commonMonths = Array.from(hashMonths)
    .filter((m) => btcMonths.has(m))
    .sort();

  console.log(`\nFound ${commonMonths.length} months with both datasets`);

  const mergedData: {
    month: string;
    avg_hash_rate_eh_s: number;
    bitcoins_created: number;
    th_s_per_bitcoin: number | null;
    max_price_usd: number | null;
  }[] = [];

  for (const month of commonMonths) {
    const hashRate = monthlyHashRates.get(month)!;
    const btcData = monthlyBitcoins.get(month)!;
    const maxPrice = monthlyMaxPrices.get(month) ?? null;

    const avgHashRate = hashRate.sum / hashRate.count;
    const btcCreated = btcData.endTotal - btcData.startTotal;

    // Hash rate is in TH/s, compute TH/s per Bitcoin
    const thSPerBitcoin = btcCreated > 0 ? avgHashRate / btcCreated : null;

    mergedData.push({
      month,
      avg_hash_rate_eh_s: avgHashRate / 1e6, // Convert TH/s to EH/s
      bitcoins_created: Math.max(0, btcCreated),
      th_s_per_bitcoin: thSPerBitcoin,
      max_price_usd: maxPrice,
    });
  }

  // Show date range
  if (mergedData.length > 0) {
    console.log(
      `Date range: ${mergedData[0].month} to ${mergedData[mergedData.length - 1].month}`
    );
  }

  // Format for CSV output
  const csvData = mergedData.map((d) => ({
    month: d.month,
    avg_hash_rate_eh_s: d.avg_hash_rate_eh_s.toFixed(2),
    bitcoins_created: d.bitcoins_created.toFixed(2),
    th_s_per_bitcoin: d.th_s_per_bitcoin?.toFixed(2) ?? "",
    max_price_usd: d.max_price_usd?.toFixed(2) ?? "",
  }));

  // Save to CSV
  const csvOutput = Papa.unparse(csvData);
  fs.writeFileSync(outputPath, csvOutput);
  console.log(`\nResults saved to ${outputPath}`);

  // Print some sample data
  console.log("\nSample output (last 12 months):");
  console.log("Month   | Hash Rate (EH/s) | BTC Created | TH/s per BTC | Max Price USD");
  console.log("--------|------------------|-------------|--------------|---------------");
  for (const row of csvData.slice(-12)) {
    console.log(
      `${row.month} | ${row.avg_hash_rate_eh_s.padStart(16)} | ${row.bitcoins_created.padStart(11)} | ${(row.th_s_per_bitcoin || "N/A").padStart(12)} | ${row.max_price_usd || "N/A"}`
    );
  }
}

main();
