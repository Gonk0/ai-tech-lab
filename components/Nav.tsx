"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useLanguage } from "@/components/LanguageProvider";

export function Nav() {
  const { t } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const navLinks = [
    { href: "/projects", label: t.nav.projects },
    { href: "/lab", label: t.nav.lab },
    { href: "/partners/apply", label: t.nav.partners },
  ];

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 36);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <>
      <motion.div
        style={{ scaleX: progressScaleX, transformOrigin: "left" }}
        className="fixed top-0 left-0 right-0 z-[60] h-px origin-left bg-white/30"
      />

      <motion.header
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${
          scrolled ? "border-b border-white/[0.065] bg-[#03030a]/88 backdrop-blur-2xl" : ""
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-6 md:px-10">
          <Link
            href="/"
            className="text-sm font-semibold tracking-[0.04em] text-white/88 transition-colors duration-200 hover:text-white"
          >
            AI Tech Lab
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`text-sm transition-colors duration-200 ${
                  pathname.startsWith(href) ? "text-white" : "text-white/36 hover:text-white/72"
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className={`border px-4 py-2 text-sm transition-all duration-300 ${
                pathname === "/contact"
                  ? "border-white/24 text-white"
                  : "border-white/[0.1] text-white/42 hover:border-white/24 hover:text-white"
              }`}
            >
              {t.nav.contact}
            </Link>
          </div>
        </div>
      </motion.header>
    </>
  );
}
