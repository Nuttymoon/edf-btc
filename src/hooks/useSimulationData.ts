"use client";

import { useEffect, useState, useMemo } from "react";
import Papa from "papaparse";
import { Locale } from "@/i18n/translations";
import type {
  UnavailabilityData,
  CapacityData,
  SimulationData,
  SurplusData,
  BtcMiningMonthlyData,
  BtcPriceResponse,
  ChartDataPoint,
} from "@/types";

// Miner power consumption in watts
const S19_PRO_WATTS = 3250;
const S21_WATTS = 3500;
const ATH_PRICE_USD = 120_000;
const INITIAL_INVESTMENT_USD = 25_000_000;

interface UseSimulationDataReturn {
  loading: boolean;
  error: string | null;
  // Raw data
  simulationData: SimulationData | null;
  installedCapacity: CapacityData | null;
  unavailabilityData: UnavailabilityData | null;
  // Derived values
  availableCapacity: number | null;
  availabilityPercentage: string | null;
  numberLocale: string;
  isEuro: boolean;
  btcPrice: number;
  currencySymbol: string;
  initialInvestment: number;
  currentValue: number;
  roiMultiple: number;
  // Strategy values
  optimizedValue: number;
  continuousRevenue: number;
  // Chart data
  chartData: ChartDataPoint[];
}

export function useSimulationData(
  locale: Locale,
  errorMessages: { fetchFailed: string; generic: string }
): UseSimulationDataReturn {
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
  const [btcMonthlyPrices, setBtcMonthlyPrices] = useState<
    Map<string, number>
  >(new Map());
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
          const lastRow = simParsed.data[simParsed.data.length - 1];
          setSimulationData(lastRow);
        }

        // Fetch BTC monthly price data
        const btcMonthlyResponse = await fetch(
          "/data/bitcoin-mining-monthly.csv"
        );
        const btcMonthlyText = await btcMonthlyResponse.text();
        const btcMonthlyParsed = Papa.parse<BtcMiningMonthlyData>(
          btcMonthlyText,
          {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          }
        );
        if (btcMonthlyParsed.data.length > 0) {
          const priceMap = new Map<string, number>();
          for (const row of btcMonthlyParsed.data) {
            priceMap.set(row.month, row.max_price_usd);
          }
          setBtcMonthlyPrices(priceMap);
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
          throw new Error(errorMessages.fetchFailed);
        }
        const unavailData = await unavailResponse.json();
        setUnavailabilityData(unavailData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : errorMessages.generic
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [errorMessages.fetchFailed, errorMessages.generic]);

  // Derived values
  const availableCapacity =
    installedCapacity && unavailabilityData
      ? installedCapacity.capacity - unavailabilityData.totalUnavailableCapacity
      : null;

  const availabilityPercentage =
    installedCapacity && availableCapacity
      ? ((availableCapacity / installedCapacity.capacity) * 100).toFixed(1)
      : null;

  const numberLocale = locale === "fr" ? "fr-FR" : "en-US";
  const isEuro = locale === "fr";
  const btcPrice = isEuro ? btcPriceEur : btcPriceUsd;
  const currencySymbol = isEuro ? "€" : "$";
  const initialInvestment = isEuro
    ? INITIAL_INVESTMENT_USD * 0.85
    : INITIAL_INVESTMENT_USD;
  const currentValue =
    simulationData && btcPrice ? simulationData.btc_balance * btcPrice : 0;
  const roiMultiple =
    currentValue > 0 ? currentValue / initialInvestment : 0;

  // Strategy calculations
  const eurUsdRate =
    btcPriceEur && btcPriceUsd ? btcPriceEur / btcPriceUsd : 0.85;

  const optimizedValueUsd = simulationData
    ? simulationData.btc_balance * ATH_PRICE_USD
    : 0;
  const optimizedValue = isEuro
    ? optimizedValueUsd * eurUsdRate
    : optimizedValueUsd;

  const continuousRevenueUsd = allSimulationData.reduce((total, row) => {
    const netBtcKept = row.btc_mined_this_month - row.btc_sold_this_month;
    const monthPrice = btcMonthlyPrices.get(row.month) || 0;
    return total + netBtcKept * monthPrice;
  }, 0);
  const continuousRevenue = isEuro
    ? continuousRevenueUsd * eurUsdRate
    : continuousRevenueUsd;

  // Chart data
  const chartData = useMemo<ChartDataPoint[]>(() => {
    return allSimulationData.map((row, index) => {
      const surplus = surplusData[index];
      const daysInMonth = 30; // approximate
      const hoursInMonth = daysInMonth * 24;

      const energyNeededTwh =
        ((row.s19_pro_count * S19_PRO_WATTS + row.s21_count * S21_WATTS) *
          hoursInMonth) /
        1e12;

      const availableSurplusTwh = surplus?.surplus_twh || 0;
      const energyConsumedTwh = Math.min(energyNeededTwh, availableSurplusTwh);
      const unusedSurplusTwh = Math.max(
        0,
        availableSurplusTwh - energyNeededTwh
      );

      const edfHashRateEh = row.total_hash_rate_th_s / 1e6;
      const networkHashRateEh = row.network_hash_rate_th_s / 1e6;

      return {
        month: row.month,
        capex: row.capex_this_month_usd / 1e6,
        totalMiners: (row.s19_pro_count + row.s21_count) / 1000,
        btcMined: row.btc_mined_this_month,
        btcBalance: row.btc_balance,
        energyConsumed: energyConsumedTwh,
        unusedSurplus: unusedSurplusTwh,
        edfHashRateEh,
        networkHashRateEh,
      };
    });
  }, [allSimulationData, surplusData]);

  return {
    loading,
    error,
    simulationData,
    installedCapacity,
    unavailabilityData,
    availableCapacity,
    availabilityPercentage,
    numberLocale,
    isEuro,
    btcPrice,
    currencySymbol,
    initialInvestment,
    currentValue,
    roiMultiple,
    optimizedValue,
    continuousRevenue,
    chartData,
  };
}

