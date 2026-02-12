import type { SimulationData } from "@/types";
import type { getTranslations } from "@/i18n/translations";

interface HeroSectionProps {
  simulationData: SimulationData;
  numberLocale: string;
  currencySymbol: string;
  isEuro: boolean;
  currentValue: number;
  optimizedValue: number;
  continuousRevenue: number;
  t: ReturnType<typeof getTranslations>;
}

export function HeroSection({
  simulationData,
  numberLocale,
  currencySymbol,
  isEuro,
  currentValue,
  optimizedValue,
  continuousRevenue,
  t,
}: HeroSectionProps) {
  return (
    <div className="mb-12">
      <div className="relative bg-gradient-to-br from-amber-500/20 via-amber-600/10 to-orange-500/20 rounded-3xl p-10 border border-amber-500/30 overflow-hidden">
        {/* Background Bitcoin symbol */}
        <div className="absolute -right-10 -top-10 text-[200px] font-bold text-amber-500/5 select-none">
          ₿
        </div>
        <div className="relative text-center">
          <p className="text-amber-400 text-lg font-medium mb-2">
            {t.simulation.totalBtc} *
          </p>
          <p className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-orange-400 bg-clip-text text-transparent mb-1">
            {Math.floor(simulationData.btc_balance).toLocaleString(
              numberLocale
            )}
            <span className="text-4xl md:text-5xl ml-2">₿</span>
          </p>
          <p className="text-slate-400 text-xl mb-6">
            {t.simulation.since}
          </p>

          {/* Strategy Outcomes */}
          <div className="grid md:grid-cols-3 gap-4 mt-2">
            {/* Strategy 1: Bitcoin Reserve */}
            <div className="bg-gradient-to-br from-emerald-500/15 to-emerald-600/5 rounded-2xl p-5 border border-emerald-500/30 text-center">
              <p className="text-emerald-400 text-sm font-semibold uppercase tracking-wider mb-1">
                {t.simulation.strategies.reserve.name}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                {currencySymbol}
                {(currentValue / 1e9).toLocaleString(numberLocale, {
                  maximumFractionDigits: 2,
                })}
                {isEuro ? " Md" : "B"}
              </p>
              <p className="text-xs text-slate-400">
                {t.simulation.strategies.reserve.description}
              </p>
            </div>

            {/* Strategy 2: Sell at ATH */}
            <div className="bg-gradient-to-br from-purple-500/15 to-purple-600/5 rounded-2xl p-5 border border-purple-500/30 text-center">
              <p className="text-purple-400 text-sm font-semibold uppercase tracking-wider mb-1">
                {t.simulation.strategies.optimized.name}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                {currencySymbol}
                {(optimizedValue / 1e9).toLocaleString(numberLocale, {
                  maximumFractionDigits: 2,
                })}
                {isEuro ? " Md" : "B"}
              </p>
              <p className="text-xs text-slate-400">
                {t.simulation.strategies.optimized.description}
              </p>
            </div>

            {/* Strategy 3: Continuous Selling */}
            <div className="bg-gradient-to-br from-cyan-500/15 to-cyan-600/5 rounded-2xl p-5 border border-cyan-500/30 text-center">
              <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-1">
                {t.simulation.strategies.continuous.name}
              </p>
              <p className="text-2xl md:text-3xl font-bold text-white mb-1">
                {currencySymbol}
                {(continuousRevenue / 1e9).toLocaleString(numberLocale, {
                  maximumFractionDigits: 2,
                })}
                {isEuro ? " Md" : "B"}
              </p>
              <p className="text-xs text-slate-400">
                {t.simulation.strategies.continuous.description}
              </p>
            </div>
          </div>

          <p className="text-sm text-amber-400/70 mt-6 leading-relaxed italic">
            {t.simulation.disclaimer}
          </p>
        </div>
      </div>
    </div>
  );
}

