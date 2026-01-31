"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { locales, Locale } from "@/i18n/translations";

const localeNames: Record<Locale, string> = {
  fr: "FR",
  en: "EN",
};

export function LanguageSwitcher({ currentLocale }: { currentLocale: Locale }) {
  const pathname = usePathname();

  // Get the path without the current locale
  const pathWithoutLocale = pathname.replace(`/${currentLocale}`, "") || "/";

  return (
    <div className="flex items-center gap-2">
      {locales.map((locale) => (
        <Link
          key={locale}
          href={`/${locale}${pathWithoutLocale}`}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
            locale === currentLocale
              ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          {localeNames[locale]}
        </Link>
      ))}
    </div>
  );
}

