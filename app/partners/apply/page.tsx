import type { Metadata } from "next";
import Link from "next/link";
import { PartnerApplyForm } from "@/components/PartnerApplyForm";
import { BLOCKED_PLATFORMS_LABEL, MODERN_STACK } from "@/lib/partners/constants";

export const metadata: Metadata = {
  title: "Nonprofit partnership application",
  description:
    "Apply for a free nonprofit website built on a modern custom stack with long-term support from AI Tech Lab.",
};

export default function PartnerApplyPage() {
  return (
    <main className="relative z-10 px-6 pb-24 pt-28 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <Link
            href="/"
            className="mb-8 inline-flex text-sm text-white/32 transition-colors hover:text-white/65"
          >
            ← Back to home
          </Link>

          <p className="mb-5 text-[10px] uppercase tracking-[0.32em] text-white/22">
            Nonprofit partnership / Application
          </p>
          <h1 className="max-w-lg text-4xl font-black leading-[0.95] tracking-[-0.04em] text-white md:text-5xl">
            Apply for a free nonprofit website.
          </h1>
          <p className="mt-6 max-w-md text-base leading-[1.78] text-white/42">
            We build and manage websites for selected nonprofits at no cost. Tell us who you are,
            where you operate, and show us proof of the work you already do in the world.
          </p>

          <div className="mt-10 space-y-8">
            <div className="rounded-3xl border border-white/[0.075] bg-white/[0.028] p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-white/55">
                Our stack
              </h2>
              <p className="mb-4 text-sm leading-7 text-white/36">
                We do not use WordPress or drag-and-drop builders. Every site is engineered in
                code for speed, security and long-term ownership.
              </p>
              <ul className="space-y-2">
                {MODERN_STACK.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-white/48">
                    <span className="mt-2 h-1 w-1 flex-shrink-0 rounded-full bg-white/35" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-3xl border border-amber-400/15 bg-amber-400/[0.04] p-6">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-amber-200/75">
                Website condition
              </h2>
              <p className="text-sm leading-7 text-white/42">
                If you already have a website, it cannot run on {BLOCKED_PLATFORMS_LABEL}. We
                partner with organizations ready to move to a custom-built platform — or we build
                one from scratch if you do not have a site yet.
              </p>
            </div>
          </div>
        </div>

        <PartnerApplyForm />
      </div>
    </main>
  );
}
