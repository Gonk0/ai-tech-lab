"use client";

import { useLanguage } from "@/components/LanguageProvider";
import type { Locale } from "@/lib/i18n";

export function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage();

  return (
    <div className="flex items-center gap-1 border border-white/[0.1] p-0.5 text-[11px] uppercase tracking-[0.14em]">
      {(["sk", "en"] as Locale[]).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => setLocale(code)}
          className={`px-2.5 py-1 transition-colors ${
            locale === code
              ? "bg-white text-black"
              : "text-white/40 hover:text-white/70"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
