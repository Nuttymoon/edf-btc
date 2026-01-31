import { NextResponse } from "next/server";
import { DefiLlama } from "@defillama/api";

const WBTC_ADDRESS = "0x2260fac5e5542a773aa44fbcfedf7c193bc2c599";
const EURC_ADDRESS = "0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c";
const WBTC_COIN = `ethereum:${WBTC_ADDRESS}`;
const EURC_COIN = `ethereum:${EURC_ADDRESS}`;

export async function GET() {
  try {
    const api = new DefiLlama();
    const data = await api.prices.getCurrentPrices([WBTC_COIN, EURC_COIN]);

    const btcPriceUsd = data.coins?.[WBTC_COIN]?.price;
    const eurcPriceUsd = data.coins?.[EURC_COIN]?.price;

    if (typeof btcPriceUsd !== "number") {
      throw new Error("Invalid BTC price data from DefiLlama");
    }

    // Calculate EUR price (EURC is pegged to EUR, so 1 EURC ≈ 1 EUR)
    // btcPriceUsd / eurcPriceUsd = BTC price in EUR
    const btcPriceEur = eurcPriceUsd ? btcPriceUsd / eurcPriceUsd : null;

    return NextResponse.json({
      priceUsd: btcPriceUsd,
      priceEur: btcPriceEur,
      eurUsdRate: eurcPriceUsd,
      symbol: "WBTC",
      source: "DefiLlama",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching BTC price:", error);
    // Fallback to a reasonable price if API fails
    return NextResponse.json(
      {
        priceUsd: 0,
        priceEur: 0,
        error: "Failed to fetch live price",
      },
      { status: 500 }
    );
  }
}

