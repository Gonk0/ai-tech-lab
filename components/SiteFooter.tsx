"use client";

import { useLanguage } from "@/components/LanguageProvider";

export function SiteFooter() {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 mt-12 border-t border-white/[0.06] px-6 py-10 md:px-12 lg:px-20">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-6">
          <span className="text-sm text-white/22">AI Tech Lab © 2026</span>
          <span className="hidden text-white/15 sm:block">·</span>
          <span className="text-sm text-white/22">{t.footer.tagline}</span>
        </div>
        <a
          href="https://www.vodicak.pro"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-white/22 transition-colors hover:text-white/55"
        >
          vodicak.pro ↗
        </a>
      </div>
    </footer>
  );
}
