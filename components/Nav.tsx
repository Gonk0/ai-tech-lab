"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";

const NAV_LINKS = [
  { href: "/projects", label: "Projects" },
  { href: "/lab", label: "Lab" },
];

export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

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
        className="fixed top-0 left-0 right-0 h-px bg-white/30 z-[60] origin-left"
      />

      <motion.header
        initial={{ y: -18, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#03030a]/88 backdrop-blur-2xl border-b border-white/[0.065]" : ""
        }`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-16">
          <Link
            href="/"
            className="text-white/88 font-semibold text-sm tracking-[0.04em] hover:text-white transition-colors duration-200"
          >
            AI Tech Lab
          </Link>

          <nav className="hidden md:flex items-center gap-10">
            {NAV_LINKS.map(({ href, label }) => (
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

          <a
            href="mailto:contact@aitechlab.sk"
            className="text-sm px-4 py-2 border border-white/[0.1] text-white/42 hover:text-white hover:border-white/24 transition-all duration-300"
          >
            Contact
          </a>
        </div>
      </motion.header>
    </>
  );
}
