"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Papa from "papaparse";
import { getTranslations, Locale, defaultLocale } from "@/i18n/translations";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface UnavailabilityData {
  totalUnavailableCapacity: number;
  activeEventsCount: number;
  activeEvents: {
    unit: string;
    unavailableCapacity: number;
    eventStart: string;
    eventStop: string;
    type: string;
  }[];
  lastUpdated: string;
}

interface CapacityData {
  year: number;
  capacity: number;
}

interface SimulationData {
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

interface SurplusData {
  month: string;
  optimal_production_twh: number;
  actual_production_twh: number;
  surplus_twh: number;
  surplus_pj: number;
}

interface BtcPriceResponse {
  priceUsd: number;
  priceEur: number | null;
  eurUsdRate?: number;
  symbol?: string;
  source?: string;
  error?: string;
}

export default function Home() {
  const params = useParams();
  const locale = (params.locale as Locale) || defaultLocale;
  const t = getTranslations(locale);

  const [installedCapacity, setInstalledCapacity] =
    useState<CapacityData | null>(null);
  const [unavailabilityData, setUnavailabilityData] =
    useState<UnavailabilityData | null>(null);
  const [simulationData, setSimulationData] = useState<SimulationData | null>(
    null
  );
  const [allSimulationData, setAllSimulationData] = useState<SimulationData[]>(
    []
  );
  const [surplusData, setSurplusData] = useState<SurplusData[]>([]);
  const [btcPriceUsd, setBtcPriceUsd] = useState<number>(0);
  const [btcPriceEur, setBtcPriceEur] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch simulation data
        const simResponse = await fetch("/data/mining-simulation.csv");
        const simText = await simResponse.text();
        const simParsed = Papa.parse<SimulationData>(simText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        if (simParsed.data.length > 0) {
          setAllSimulationData(simParsed.data);
          // Get the last row (most recent month)
          const lastRow = simParsed.data[simParsed.data.length - 1];
          setSimulationData(lastRow);
        }

        // Fetch nuclear surplus data
        const surplusResponse = await fetch("/data/nuclear-surplus.csv");
        const surplusText = await surplusResponse.text();
        const surplusParsed = Papa.parse<SurplusData>(surplusText, {
          header: true,
          skipEmptyLines: true,
          dynamicTyping: true,
        });
        if (surplusParsed.data.length > 0) {
          setSurplusData(surplusParsed.data);
        }

        // Fetch live BTC price from DefiLlama via our API route
        const btcPriceResponse = await fetch("/api/btc-price");
        const btcPriceData: BtcPriceResponse = await btcPriceResponse.json();
        if (btcPriceData.priceUsd > 0) {
          setBtcPriceUsd(btcPriceData.priceUsd);
        }
        if (btcPriceData.priceEur && btcPriceData.priceEur > 0) {
          setBtcPriceEur(btcPriceData.priceEur);
        }

        // Fetch installed capacity from CSV
        const csvResponse = await fetch("/data/edf-nuclear-capacity.csv");
        const csvText = await csvResponse.text();
        const parsed = Papa.parse<{ year: string; capacity: string }>(csvText, {
          header: true,
          skipEmptyLines: true,
        });
        if (parsed.data.length > 0) {
          const currentYear = new Date().getFullYear();
          const capacityData = parsed.data.map((row) => ({
            year: parseInt(row.year, 10),
            capacity: parseInt(row.capacity, 10),
          }));

          const currentYearData = capacityData.find(
            (d) => d.year === currentYear
          );
          const mostRecentData = capacityData.sort(
            (a, b) => b.year - a.year
          )[0];

          setInstalledCapacity(currentYearData || mostRecentData);
        }

        // Fetch unavailability data from API
        const unavailResponse = await fetch("/api/edf-unavailability");
        if (!unavailResponse.ok) {
          throw new Error(t.error.fetchFailed);
        }
        const unavailData = await unavailResponse.json();
        setUnavailabilityData(unavailData);
      } catch (err) {
        setError(err instanceof Error ? err.message : t.error.generic);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [t.error.fetchFailed, t.error.generic]);

  const availableCapacity =
    installedCapacity && unavailabilityData
      ? installedCapacity.capacity - unavailabilityData.totalUnavailableCapacity
      : null;

  const availabilityPercentage =
    installedCapacity && availableCapacity
      ? ((availableCapacity / installedCapacity.capacity) * 100).toFixed(1)
      : null;

  const numberLocale = locale === "fr" ? "fr-FR" : "en-US";

  // Calculate current BTC value
  // Use EUR for French locale, USD for English
  const isEuro = locale === "fr";
  const btcPrice = isEuro ? btcPriceEur : btcPriceUsd;
  const currencySymbol = isEuro ? "€" : "$";
  const initialInvestmentUsd = 25_000_000; // $25M initial investment in 2020
  // Convert initial investment to EUR if needed (approximate rate at the time)
  const initialInvestment = isEuro ? initialInvestmentUsd * 0.85 : initialInvestmentUsd;
  const currentValue =
    simulationData && btcPrice ? simulationData.btc_balance * btcPrice : 0;
  // ROI as a multiple (e.g., 349x means 349 times the initial investment)
  const roiMultiple = currentValue > 0 ? currentValue / initialInvestment : 0;

  // Prepare chart data
  // Miner power consumption in watts
  const S19_PRO_WATTS = 3250;
  const S21_WATTS = 3500;

  const chartData = allSimulationData.map((row, index) => {
    const surplus = surplusData[index];
    const daysInMonth = surplus?.surplus_twh ? 30 : 30; // approximate
    const hoursInMonth = daysInMonth * 24;

    // Calculate energy miners NEED in TWh
    // Energy = (miners × watts × hours) / 1e12
    const energyNeededTwh =
      ((row.s19_pro_count * S19_PRO_WATTS + row.s21_count * S21_WATTS) *
        hoursInMonth) /
      1e12;

    // Available surplus from nuclear
    const availableSurplusTwh = surplus?.surplus_twh || 0;

    // Actual energy consumed (capped by available surplus)
    const energyConsumedTwh = Math.min(energyNeededTwh, availableSurplusTwh);

    // Unused surplus (if any)
    const unusedSurplusTwh = Math.max(0, availableSurplusTwh - energyNeededTwh);

    // Convert TH/s to EH/s: 1 EH = 1,000,000 TH
    const edfHashRateEh = row.total_hash_rate_th_s / 1e6;
    const networkHashRateEh = row.network_hash_rate_th_s / 1e6;

    return {
      month: row.month,
      capex: row.capex_this_month_usd / 1e6, // in millions
      totalMiners: (row.s19_pro_count + row.s21_count) / 1000, // in thousands
      btcMined: row.btc_mined_this_month,
      btcBalance: row.btc_balance,
      // Energy data in TWh
      energyConsumed: energyConsumedTwh,
      unusedSurplus: unusedSurplusTwh,
      // Hash rate data in EH/s
      edfHashRateEh,
      networkHashRateEh,
    };
  });

  return (
    <div className="relative min-h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0a0f1a] via-[#0d1525] to-[#0f1a2e] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/10 via-transparent to-transparent pointer-events-none" />

      <main className="relative z-10 container mx-auto px-6 py-16 max-w-5xl">
        {/* Language Switcher */}
        <div className="absolute top-6 right-6">
          <LanguageSwitcher currentLocale={locale} />
        </div>

        {/* Header */}
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-400 text-sm font-medium tracking-wide">
              {t.header.liveData}
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-4">
            <span className="bg-gradient-to-r from-white via-amber-100 to-amber-200 bg-clip-text text-transparent">
              {t.header.title}
            </span>
            <span className="ml-3">🇫🇷</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            {t.header.subtitle}
          </p>
          {t.header.edfNote && (
            <p className="text-lg text-slate-500 mt-3 max-w-xl mx-auto">
              {t.header.edfNote}
            </p>
          )}
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-500 rounded-full animate-spin" />
            <p className="mt-6 text-slate-400">{t.loading}</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8 text-center">
            <p className="text-red-400">{error}</p>
          </div>
        ) : (
          <>
            {/* Hero BTC Number */}
            {simulationData && (
              <div className="mb-12">
                <div className="relative bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-orange-500/20 rounded-3xl p-10 border border-amber-500/30 overflow-hidden">
                  {/* Background Bitcoin symbol */}
                  <div className="absolute -right-10 -top-10 text-[200px] font-bold text-amber-500/5 select-none">
                    ₿
                  </div>
                  <div className="relative text-center">
                    <p className="text-amber-400 text-lg font-medium mb-2">
                      {t.simulation.totalBtc}
                    </p>
                    <p className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent mb-1">
                      {Math.floor(simulationData.btc_balance).toLocaleString(
                        numberLocale
                      )}
                      <span className="text-4xl md:text-5xl ml-2">₿</span>
                    </p>
                    <p className="text-3xl md:text-4xl font-semibold text-emerald-400 mb-3">
                      ≈ {currencySymbol}
                      {(currentValue / 1e9).toLocaleString(numberLocale, {
                        maximumFractionDigits: 2,
                      })}
                      {isEuro ? " Md" : "B"}
                    </p>
                    <p className="text-slate-400 text-xl">
                      {t.simulation.since}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Simulation Stats Grid */}
            {simulationData && (
              <div className="grid md:grid-cols-3 gap-4 mb-12">
                {/* BTC Price */}
                <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl p-6 border border-amber-500/20">
                  <p className="text-amber-400 text-xl font-medium mb-1">
                    {t.simulation.btcPrice}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {currencySymbol}{Math.round(btcPrice).toLocaleString(numberLocale)}
                  </p>
                </div>

                {/* Initial Investment */}
                <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30">
                  <p className="text-slate-400 text-xl font-medium mb-1">
                    {t.simulation.initialInvestment}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {currencySymbol}{(initialInvestment / 1e6).toLocaleString(numberLocale)}{isEuro ? " M" : "M"}
                  </p>
                </div>

                {/* ROI */}
                <div className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 rounded-2xl p-6 border border-purple-500/20">
                  <p className="text-purple-400 text-xl font-medium mb-1">
                    {t.simulation.roi}
                  </p>
                  <p className="text-3xl font-bold text-white">
                    {Math.round(roiMultiple)}x
                  </p>
                </div>
              </div>
            )}

            {/* Charts Section */}
            {chartData.length > 0 && (
              <div className="space-y-8 mb-12">
                {/* Bitcoin Mining Chart */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-3xl font-semibold text-white mb-4">
                    {t.charts.bitcoinMining}
                  </h3>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="btcGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f59e0b"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f59e0b"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 16 }}
                          tickFormatter={(value) => value.slice(2, 7)}
                        />
                        <YAxis
                          yAxisId="accumulated"
                          stroke="#f59e0b"
                          tick={{ fill: "#f59e0b", fontSize: 16 }}
                          tickFormatter={(value) =>
                            `${(value / 1000).toFixed(0)}k`
                          }
                        />
                        <YAxis
                          yAxisId="mined"
                          orientation="right"
                          stroke="#10b981"
                          tick={{ fill: "#10b981", fontSize: 16 }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value: number | undefined, name: string | undefined) => {
                            const label = name === "btcBalance" 
                              ? t.charts.accumulatedBtc 
                              : t.charts.btcMined;
                            const decimals = name === "btcBalance" ? 0 : 2;
                            return [
                              `${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: decimals })} ₿`,
                              label,
                            ];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "10px" }}
                          formatter={(value) =>
                            value === "btcBalance"
                              ? t.charts.accumulatedBtc
                              : t.charts.btcMined
                          }
                        />
                        <Area
                          yAxisId="accumulated"
                          type="monotone"
                          dataKey="btcBalance"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#btcGradient)"
                        />
                        <Bar
                          yAxisId="mined"
                          dataKey="btcMined"
                          fill="#10b981"
                          radius={[4, 4, 0, 0]}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Investment & Miners Chart */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-3xl font-semibold text-white mb-2">
                    {t.charts.investmentAndMiners}
                  </h3>
                  <p className="text-lg text-slate-400 mb-4 leading-relaxed">
                    {t.charts.investmentNote}
                  </p>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={chartData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 16 }}
                          tickFormatter={(value) => value.slice(2, 7)}
                        />
                        <YAxis
                          yAxisId="capex"
                          stroke="#8b5cf6"
                          tick={{ fill: "#8b5cf6", fontSize: 16 }}
                          tickFormatter={(value) => `${currencySymbol}${value}M`}
                        />
                        <YAxis
                          yAxisId="miners"
                          orientation="right"
                          stroke="#f59e0b"
                          tick={{ fill: "#f59e0b", fontSize: 16 }}
                          tickFormatter={(value) => `${value.toFixed(0)}k`}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value: number | undefined, name: string | undefined) => {
                            if (name === "capex") {
                              return [
                                `${currencySymbol}${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 1 })}M`,
                                t.charts.investment,
                              ];
                            }
                            return [
                              `${((value ?? 0) * 1000).toLocaleString(numberLocale, { maximumFractionDigits: 0 })}`,
                              t.charts.totalMiners,
                            ];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "10px" }}
                          formatter={(value) =>
                            value === "capex"
                              ? t.charts.investment
                              : t.charts.totalMiners
                          }
                        />
                        <Bar
                          yAxisId="capex"
                          dataKey="capex"
                          fill="#8b5cf6"
                          radius={[4, 4, 0, 0]}
                        />
                        <Line
                          yAxisId="miners"
                          type="monotone"
                          dataKey="totalMiners"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Energy Surplus Chart */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-3xl font-semibold text-white mb-4">
                    {t.charts.energySurplusTitle}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="surplusGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#06b6d4"
                              stopOpacity={0.4}
                            />
                            <stop
                              offset="95%"
                              stopColor="#06b6d4"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="excessGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#64748b"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#64748b"
                              stopOpacity={0}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 16 }}
                          tickFormatter={(value) => value.slice(2, 7)}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 16 }}
                          tickFormatter={(value) => `${value.toFixed(1)}`}
                          label={{
                            value: "TWh",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#64748b",
                            fontSize: 16,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value: number | undefined, name: string | undefined) => {
                            const label = name === "energyConsumed" 
                              ? t.charts.energyConsumed 
                              : t.charts.unusedSurplus;
                            return [
                              `${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 3 })} TWh`,
                              label,
                            ];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "10px" }}
                          formatter={(value) =>
                            value === "energyConsumed"
                              ? t.charts.energyConsumed
                              : t.charts.unusedSurplus
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="energyConsumed"
                          stroke="#06b6d4"
                          strokeWidth={2}
                          fill="url(#surplusGradient)"
                          stackId="1"
                        />
                        <Area
                          type="monotone"
                          dataKey="unusedSurplus"
                          stroke="#64748b"
                          strokeWidth={1}
                          fill="url(#excessGradient)"
                          stackId="1"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Hash Rate Comparison Chart */}
                <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-6 border border-slate-700/50">
                  <h3 className="text-3xl font-semibold text-white mb-4">
                    {t.charts.hashRateTitle}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient
                            id="networkGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#64748b"
                              stopOpacity={0.3}
                            />
                            <stop
                              offset="95%"
                              stopColor="#64748b"
                              stopOpacity={0}
                            />
                          </linearGradient>
                          <linearGradient
                            id="edfGradient"
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor="#f59e0b"
                              stopOpacity={0.6}
                            />
                            <stop
                              offset="95%"
                              stopColor="#f59e0b"
                              stopOpacity={0.1}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="#334155"
                        />
                        <XAxis
                          dataKey="month"
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 16 }}
                          tickFormatter={(value) => value.slice(2, 7)}
                        />
                        <YAxis
                          stroke="#64748b"
                          tick={{ fill: "#64748b", fontSize: 16 }}
                          tickFormatter={(value) => `${Math.round(value)}`}
                          label={{
                            value: "EH/s",
                            angle: -90,
                            position: "insideLeft",
                            fill: "#64748b",
                            fontSize: 16,
                          }}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#1e293b",
                            border: "1px solid #334155",
                            borderRadius: "8px",
                          }}
                          labelStyle={{ color: "#94a3b8" }}
                          formatter={(value: number | undefined, name: string | undefined) => {
                            const label = name === "edfHashRateEh" 
                              ? t.charts.edfHashRate 
                              : t.charts.networkHashRate;
                            return [
                              `${(value ?? 0).toLocaleString(numberLocale, { maximumFractionDigits: 2 })} EH/s`,
                              label,
                            ];
                          }}
                        />
                        <Legend
                          wrapperStyle={{ paddingTop: "10px" }}
                          formatter={(value) =>
                            value === "edfHashRateEh"
                              ? t.charts.edfHashRate
                              : t.charts.networkHashRate
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="networkHashRateEh"
                          stroke="#64748b"
                          strokeWidth={1}
                          fill="url(#networkGradient)"
                        />
                        <Area
                          type="monotone"
                          dataKey="edfHashRateEh"
                          stroke="#f59e0b"
                          strokeWidth={2}
                          fill="url(#edfGradient)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {/* Mining Fleet Details */}
            {simulationData && (
              <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-8 border border-slate-700/50 mb-12">
                <h3 className="text-xl font-semibold text-white mb-6">
                  {t.simulation.fleet}
                </h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xl">
                        {t.simulation.s19pro}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {simulationData.s19_pro_count.toLocaleString(
                          numberLocale
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                      <span className="text-2xl">⚡</span>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xl">
                        {t.simulation.s21}
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {simulationData.s21_count.toLocaleString(numberLocale)}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-700/50">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">
                      {t.simulation.networkShare}
                    </span>
                    <span className="text-xl font-semibold text-amber-400">
                      {simulationData.our_share_percent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Nuclear Capacity Stats */}
            <div className="grid md:grid-cols-2 gap-6 mb-12">
              {/* Installed Capacity Card */}
              <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-700/50 hover:border-amber-500/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-amber-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-slate-400 font-medium">
                      {t.capacity.installed}
                    </h2>
                  </div>
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {installedCapacity?.capacity.toLocaleString(numberLocale)}
                    <span className="text-2xl text-slate-400 ml-2">MW</span>
                  </p>
                  <p className="text-xl text-slate-500">
                    {t.capacity.fleet} ({installedCapacity?.year})
                  </p>
                </div>
              </div>

              {/* Available Capacity Card */}
              <div className="group relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl p-8 border border-slate-700/50 hover:border-emerald-500/30 transition-all duration-300">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-emerald-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h2 className="text-slate-400 font-medium">
                      {t.capacity.available}
                    </h2>
                  </div>
                  <p className="text-4xl md:text-5xl font-bold text-white mb-2">
                    {availableCapacity?.toLocaleString(numberLocale)}
                    <span className="text-2xl text-slate-400 ml-2">MW</span>
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                        style={{ width: `${availabilityPercentage}%` }}
                      />
                    </div>
                    <span className="text-xl font-medium text-emerald-400">
                      {availabilityPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Unavailability Summary */}
            <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-8 border border-slate-700/50">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">
                  {t.unavailability.title}
                </h3>
                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xl font-medium">
                  {unavailabilityData?.activeEventsCount}{" "}
                  {t.unavailability.active}
                </span>
              </div>

              {unavailabilityData?.activeEvents &&
              unavailabilityData.activeEvents.length > 0 ? (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {unavailabilityData.activeEvents.map((event, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl border border-slate-700/30"
                    >
                      <div>
                        <p className="font-medium text-white">{event.unit}</p>
                        <p className="text-xl text-slate-500">{event.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-red-400">
                          -
                          {event.unavailableCapacity.toLocaleString(
                            numberLocale
                          )}{" "}
                          MW
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  {t.unavailability.none}
                </p>
              )}

              {unavailabilityData?.lastUpdated && (
                <p className="text-lg text-slate-600 mt-6 text-center">
                  {t.unavailability.lastUpdated} :{" "}
                  {new Date(unavailabilityData.lastUpdated).toLocaleString(
                    numberLocale
                  )}
                </p>
              )}
            </div>

            {/* Data Sources */}
            <footer className="mt-12 text-center space-y-4">
              {/* GitHub & Data Links */}
              <div className="flex flex-wrap justify-center gap-4 text-lg">
                <a
                  href="https://github.com/Nuttymoon/edf-btc"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-amber-500/50 transition-all"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                  {t.footer.github}
                </a>
                <a
                  href="https://github.com/Nuttymoon/edf-btc/tree/main/public/data"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 hover:border-amber-500/50 transition-all"
                >
                  📊 {t.footer.checkData}
                </a>
              </div>

              {/* Data Sources */}
              <div className="pt-4 border-t border-slate-800">
                <p className="text-lg text-slate-600 mb-2">{t.footer.dataSources} :</p>
                <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-lg">
                  <a
                    href="https://analysesetdonnees.rte-france.com/production/nucleaire"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {t.footer.rteProduction}
                  </a>
                  <span className="text-slate-700">•</span>
                  <a
                    href="https://www.services-rte.com/fr/visualisez-les-donnees-publiees-par-rte/capacite-installee-de-production.html"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {t.footer.rteCapacity}
                  </a>
                  <span className="text-slate-700">•</span>
                  <a
                    href="https://www.blockchain.com/explorer/charts"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {t.footer.blockchainData}
                  </a>
                  <span className="text-slate-700">•</span>
                  <a
                    href="https://www.edf.fr/toutes-les-indisponibilites-doaat/feed"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-500 hover:text-amber-400 transition-colors"
                  >
                    {t.footer.edfFeed}
                  </a>
                </div>
              </div>
            </footer>
          </>
        )}
      </main>
    </div>
  );
}
