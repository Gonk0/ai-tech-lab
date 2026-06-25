"use client";

import Link from "next/link";
import { ContactForm } from "@/components/ContactForm";
import { useLanguage } from "@/components/LanguageProvider";

export default function ContactPage() {
  const { t } = useLanguage();
  const c = t.contact;

  return (
    <main className="relative z-10 px-6 pb-24 pt-28 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
        <div>
          <Link
            href="/"
            className="mb-8 inline-flex text-sm text-white/32 transition-colors hover:text-white/65"
          >
            ←
          </Link>
          <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/22">{c.eyebrow}</p>
          <h1 className="max-w-lg text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white md:text-5xl">
            {c.title}
          </h1>
          <p className="mt-6 max-w-md text-base leading-[1.78] text-white/42">{c.intro}</p>
        </div>
        <ContactForm />
      </div>
    </main>
  );
}
