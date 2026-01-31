import * as fs from "fs";
import * as path from "path";
import Papa from "papaparse";

interface AvailabilityRow {
  date: string;
  availability: string;
}

interface ProductionRow {
  date: string;
  production: string;
}

interface MonthlyData {
  month: string;
  optimal_production_twh: number;
  actual_production_twh: number;
  surplus_twh: number;
  surplus_pj: number;
  avg_availability_gw: number;
  days_in_month: number;
}

// Parse availability CSV (daily data in GW)
function parseAvailability(csvPath: string): Map<string, number> {
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<AvailabilityRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const dailyAvailability = new Map<string, number>();

  for (const row of parsed.data) {
    if (row.date && row.availability) {
      // Convert date format from YYYY/MM/DD to YYYY-MM-DD
      const normalizedDate = row.date.replace(/\//g, "-");
      const availability = parseFloat(row.availability);
      if (!isNaN(availability)) {
        dailyAvailability.set(normalizedDate, availability);
      }
    }
  }

  return dailyAvailability;
}

// Parse production CSV (monthly data in TWh)
function parseProduction(csvPath: string): Map<string, number> {
  const csvText = fs.readFileSync(csvPath, "utf-8");
  const parsed = Papa.parse<ProductionRow>(csvText, {
    header: true,
    skipEmptyLines: true,
  });

  const monthlyProduction = new Map<string, number>();

  for (const row of parsed.data) {
    if (row.date && row.production) {
      const production = parseFloat(row.production);
      if (!isNaN(production)) {
        monthlyProduction.set(row.date, production);
      }
    }
  }

  return monthlyProduction;
}

// Get month key from date (YYYY-MM)
function getMonthKey(date: string): string {
  const parts = date.split("-");
  return `${parts[0]}-${parts[1]}`;
}

// Compute monthly surplus
function computeMonthlySurplus(
  dailyAvailability: Map<string, number>,
  monthlyProduction: Map<string, number>,
  startDate: string = "2020-01"
): MonthlyData[] {
  // Group daily availability by month
  const monthlyAvailability = new Map<
    string,
    { totalGW: number; days: number }
  >();

  for (const [date, availabilityGW] of dailyAvailability) {
    const monthKey = getMonthKey(date);

    // Skip months before start date
    if (monthKey < startDate) continue;

    const existing = monthlyAvailability.get(monthKey) || {
      totalGW: 0,
      days: 0,
    };
    existing.totalGW += availabilityGW;
    existing.days += 1;
    monthlyAvailability.set(monthKey, existing);
  }

  // Compute surplus for each month
  const results: MonthlyData[] = [];

  // Sort months chronologically
  const sortedMonths = Array.from(monthlyAvailability.keys()).sort();

  for (const month of sortedMonths) {
    const availability = monthlyAvailability.get(month)!;
    const actualProduction = monthlyProduction.get(month);

    if (actualProduction === undefined) {
      console.warn(`No production data for ${month}, skipping...`);
      continue;
    }

    // Calculate optimal production:
    // Daily availability is in GW
    // Optimal daily production = availability (GW) * 24 hours = GWh
    // Monthly optimal = sum of daily optimal / 1000 = TWh
    const optimalProductionTWh = (availability.totalGW * 24) / 1000;
    const avgAvailabilityGW = availability.totalGW / availability.days;

    // Surplus = optimal - actual
    const surplusTWh = optimalProductionTWh - actualProduction;

    // Convert TWh to PJ (petajoules): 1 TWh = 3.6 PJ
    const surplusPJ = surplusTWh * 3.6;

    results.push({
      month,
      optimal_production_twh: Math.round(optimalProductionTWh * 1000) / 1000,
      actual_production_twh: Math.round(actualProduction * 1000) / 1000,
      surplus_twh: Math.round(surplusTWh * 1000) / 1000,
      surplus_pj: Math.round(surplusPJ * 100) / 100,
      avg_availability_gw: Math.round(avgAvailabilityGW * 100) / 100,
      days_in_month: availability.days,
    });
  }

  return results;
}

// Main
function main() {
  const dataDir = path.join(__dirname, "..", "public", "data");

  const availabilityPath = path.join(dataDir, "nuclear-availability.csv");
  const productionPath = path.join(dataDir, "nuclear-production.csv");

  console.log("Loading availability data...");
  const dailyAvailability = parseAvailability(availabilityPath);
  console.log(`Loaded ${dailyAvailability.size} daily availability records`);

  console.log("Loading production data...");
  const monthlyProduction = parseProduction(productionPath);
  console.log(`Loaded ${monthlyProduction.size} monthly production records`);

  console.log("\nComputing monthly surplus (starting from 2020-06 - 3rd Bitcoin halving)...\n");
  const results = computeMonthlySurplus(
    dailyAvailability,
    monthlyProduction,
    "2020-06"
  );

  // Print results as table
  console.log(
    "Month      | Optimal (TWh) | Actual (TWh) | Surplus (TWh) | Surplus (PJ) | Avg Avail (GW) | Days"
  );
  console.log(
    "-----------|---------------|--------------|---------------|--------------|----------------|-----"
  );

  let totalSurplus = 0;
  for (const row of results) {
    console.log(
      `${row.month}    | ${row.optimal_production_twh.toFixed(3).padStart(13)} | ${row.actual_production_twh.toFixed(3).padStart(12)} | ${row.surplus_twh.toFixed(3).padStart(13)} | ${row.surplus_pj.toFixed(2).padStart(12)} | ${row.avg_availability_gw.toFixed(2).padStart(14)} | ${row.days_in_month.toString().padStart(4)}`
    );
    totalSurplus += row.surplus_twh;
  }

  const totalSurplusPJ = totalSurplus * 3.6; // TWh to PJ
  console.log(
    "-----------|---------------|--------------|---------------|--------------|----------------|-----"
  );
  console.log(
    `TOTAL      |               |              | ${totalSurplus.toFixed(3).padStart(13)} | ${totalSurplusPJ.toFixed(2).padStart(12)} |                |`
  );

  // Save to CSV
  const outputPath = path.join(dataDir, "nuclear-surplus.csv");
  const csvOutput = Papa.unparse(results);
  fs.writeFileSync(outputPath, csvOutput);
  console.log(`\nResults saved to ${outputPath}`);
}

main();

