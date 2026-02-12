import type { SimulationData } from "@/types";
import type { getTranslations } from "@/i18n/translations";

interface MiningFleetCardProps {
  simulationData: SimulationData;
  numberLocale: string;
  t: ReturnType<typeof getTranslations>;
}

export function MiningFleetCard({
  simulationData,
  numberLocale,
  t,
}: MiningFleetCardProps) {
  return (
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
            <p className="text-slate-400 text-xl">{t.simulation.s19pro}</p>
            <p className="text-2xl font-bold text-white">
              {simulationData.s19_pro_count.toLocaleString(numberLocale)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center">
            <span className="text-2xl">⚡</span>
          </div>
          <div>
            <p className="text-slate-400 text-xl">{t.simulation.s21}</p>
            <p className="text-2xl font-bold text-white">
              {simulationData.s21_count.toLocaleString(numberLocale)}
            </p>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">{t.simulation.networkShare}</span>
          <span className="text-xl font-semibold text-amber-400">
            {simulationData.our_share_percent.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  );
}

