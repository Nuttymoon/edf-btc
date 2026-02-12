import type { CapacityData } from "@/types";
import type { getTranslations } from "@/i18n/translations";

interface NuclearCapacityCardsProps {
  installedCapacity: CapacityData | null;
  availableCapacity: number | null;
  availabilityPercentage: string | null;
  numberLocale: string;
  t: ReturnType<typeof getTranslations>;
}

export function NuclearCapacityCards({
  installedCapacity,
  availableCapacity,
  availabilityPercentage,
  numberLocale,
  t,
}: NuclearCapacityCardsProps) {
  return (
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
  );
}

