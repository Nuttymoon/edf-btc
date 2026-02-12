export interface UnavailabilityData {
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

export interface CapacityData {
  year: number;
  capacity: number;
}

export interface SimulationData {
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

export interface SurplusData {
  month: string;
  optimal_production_twh: number;
  actual_production_twh: number;
  surplus_twh: number;
  surplus_pj: number;
}

export interface BtcMiningMonthlyData {
  month: string;
  max_price_usd: number;
}

export interface BtcPriceResponse {
  priceUsd: number;
  priceEur: number | null;
  eurUsdRate?: number;
  symbol?: string;
  source?: string;
  error?: string;
}

export interface ChartDataPoint {
  month: string;
  capex: number;
  totalMiners: number;
  btcMined: number;
  btcBalance: number;
  energyConsumed: number;
  unusedSurplus: number;
  edfHashRateEh: number;
  networkHashRateEh: number;
}

