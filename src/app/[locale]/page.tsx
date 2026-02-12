"use client";

import { useParams } from "next/navigation";
import { getTranslations, Locale, defaultLocale } from "@/i18n/translations";
import { useSimulationData } from "@/hooks/useSimulationData";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { HeroSection } from "@/components/HeroSection";
import { StatsGrid } from "@/components/StatsGrid";
import { BitcoinMiningChart } from "@/components/charts/BitcoinMiningChart";
import { InvestmentMinersChart } from "@/components/charts/InvestmentMinersChart";
import { EnergySurplusChart } from "@/components/charts/EnergySurplusChart";
import { HashRateChart } from "@/components/charts/HashRateChart";
import { MiningFleetCard } from "@/components/MiningFleetCard";
import { NuclearCapacityCards } from "@/components/NuclearCapacityCards";
import { UnavailabilityCard } from "@/components/UnavailabilityCard";
import { PageFooter } from "@/components/PageFooter";

export default function Home() {
  const params = useParams();
  const locale = (params.locale as Locale) || defaultLocale;
  const t = getTranslations(locale);

  const {
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
  } = useSimulationData(locale, t.error);

  return (
    <div className="relative min-h-screen bg-[#0a0f1a] text-white overflow-hidden">
      {/* Background image */}
      <div
        className="fixed inset-0 bg-auto bg-top bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/nuclear-plants-2.jpeg')" }}
      />
      {/* Dark overlay to keep text readable */}
      <div className="absolute inset-0 bg-[#0a0f1a]/80 pointer-events-none" />
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0f1a] via-transparent to-[#0a0f1a] pointer-events-none" />
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
            {simulationData && (
              <>
                <HeroSection
                  simulationData={simulationData}
                  numberLocale={numberLocale}
                  currencySymbol={currencySymbol}
                  isEuro={isEuro}
                  currentValue={currentValue}
                  optimizedValue={optimizedValue}
                  continuousRevenue={continuousRevenue}
                  t={t}
                />

                <StatsGrid
                  btcPrice={btcPrice}
                  initialInvestment={initialInvestment}
                  roiMultiple={roiMultiple}
                  currencySymbol={currencySymbol}
                  isEuro={isEuro}
                  numberLocale={numberLocale}
                  t={t}
                />
              </>
            )}

            {chartData.length > 0 && (
              <div className="space-y-8 mb-12">
                <BitcoinMiningChart
                  data={chartData}
                  title={t.charts.bitcoinMining}
                  accumulatedBtcLabel={t.charts.accumulatedBtc}
                  btcMinedLabel={t.charts.btcMined}
                  numberLocale={numberLocale}
                />
                <InvestmentMinersChart
                  data={chartData}
                  title={t.charts.investmentAndMiners}
                  note={t.charts.investmentNote}
                  investmentLabel={t.charts.investment}
                  totalMinersLabel={t.charts.totalMiners}
                  currencySymbol={currencySymbol}
                  numberLocale={numberLocale}
                />
                <EnergySurplusChart
                  data={chartData}
                  title={t.charts.energySurplusTitle}
                  energyConsumedLabel={t.charts.energyConsumed}
                  unusedSurplusLabel={t.charts.unusedSurplus}
                  numberLocale={numberLocale}
                />
                <HashRateChart
                  data={chartData}
                  title={t.charts.hashRateTitle}
                  edfHashRateLabel={t.charts.edfHashRate}
                  networkHashRateLabel={t.charts.networkHashRate}
                  numberLocale={numberLocale}
                />
              </div>
            )}

            {simulationData && (
              <MiningFleetCard
                simulationData={simulationData}
                numberLocale={numberLocale}
                t={t}
              />
            )}

            {/* Disabled: real-time unavailability data is not available from Docker on some VPS providers.
               To re-enable, uncomment the components below and the fetch in useSimulationData.ts. */}
            {/* <NuclearCapacityCards
              installedCapacity={installedCapacity}
              availableCapacity={availableCapacity}
              availabilityPercentage={availabilityPercentage}
              numberLocale={numberLocale}
              t={t}
            />

            <UnavailabilityCard
              unavailabilityData={unavailabilityData}
              numberLocale={numberLocale}
              t={t}
            /> */}

            <PageFooter t={t} />
          </>
        )}
      </main>
    </div>
  );
}
