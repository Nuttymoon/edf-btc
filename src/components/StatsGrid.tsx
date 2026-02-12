import type { getTranslations } from "@/i18n/translations";

interface StatsGridProps {
  btcPrice: number;
  initialInvestment: number;
  roiMultiple: number;
  currencySymbol: string;
  isEuro: boolean;
  numberLocale: string;
  t: ReturnType<typeof getTranslations>;
}

export function StatsGrid({
  btcPrice,
  initialInvestment,
  roiMultiple,
  currencySymbol,
  isEuro,
  numberLocale,
  t,
}: StatsGridProps) {
  return (
    <div className="grid md:grid-cols-3 gap-4 mb-12">
      {/* BTC Price */}
      <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 rounded-2xl p-6 border border-amber-500/20">
        <p className="text-amber-400 text-xl font-medium mb-1">
          {t.simulation.btcPrice}
        </p>
        <p className="text-3xl font-bold text-white">
          {currencySymbol}
          {Math.round(btcPrice).toLocaleString(numberLocale)}
        </p>
      </div>

      {/* Initial Investment */}
      <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 rounded-2xl p-6 border border-slate-600/30">
        <p className="text-slate-400 text-xl font-medium mb-1">
          {t.simulation.initialInvestment}
        </p>
        <p className="text-3xl font-bold text-white">
          {currencySymbol}
          {(initialInvestment / 1e6).toLocaleString(numberLocale)}
          {isEuro ? " M" : "M"}
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
  );
}

