import type { UnavailabilityData } from "@/types";
import type { getTranslations } from "@/i18n/translations";

interface UnavailabilityCardProps {
  unavailabilityData: UnavailabilityData | null;
  numberLocale: string;
  t: ReturnType<typeof getTranslations>;
}

export function UnavailabilityCard({
  unavailabilityData,
  numberLocale,
  t,
}: UnavailabilityCardProps) {
  return (
    <div className="bg-gradient-to-br from-slate-800/30 to-slate-900/30 rounded-3xl p-8 border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">
          {t.unavailability.title}
        </h3>
        <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-400 text-xl font-medium">
          {unavailabilityData?.activeEventsCount} {t.unavailability.active}
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
                  -{event.unavailableCapacity.toLocaleString(numberLocale)} MW
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
  );
}

