import type { getTranslations } from "@/i18n/translations";

interface PageFooterProps {
  t: ReturnType<typeof getTranslations>;
}

export function PageFooter({ t }: PageFooterProps) {
  return (
    <footer className="mt-12 text-center space-y-4">
      {/* GitHub & Data Links */}
      <div className="flex flex-wrap justify-center gap-4 text-lg">
        <a
          href="https://github.com/Nuttymoon/edf-btc"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:border-amber-500/50 transition-all"
        >
          <svg
            className="w-5 h-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
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
        <p className="text-lg text-slate-600 mb-2">
          {t.footer.dataSources} :
        </p>
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
  );
}

