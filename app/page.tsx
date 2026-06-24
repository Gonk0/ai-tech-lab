"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const TICKER_ITEMS = [
  "AI INFRASTRUCTURE",
  "AUTONOMOUS SYSTEMS",
  "EDTECH PRODUCTS",
  "AGENTIC OPERATIONS",
  "DATA PIPELINES",
  "ENTERPRISE AUTOMATION",
  "SLOVAKIA / 2026 H2",
  "NEXT-GENERATION SOFTWARE",
  "RESEARCH TO PRODUCTION",
];

const CAPABILITIES = [
  {
    num: "01",
    title: "AI Systems",
    desc: "Production-grade AI workflows, retrieval systems, agent operations and decision engines built for real business pressure.",
  },
  {
    num: "02",
    title: "Digital Products",
    desc: "SaaS platforms and public-facing products with strong identity, clean execution and a clear path to scale.",
  },
  {
    num: "03",
    title: "Automation Layer",
    desc: "Internal tools that collapse repetitive work, connect systems and turn operational chaos into structured flow.",
  },
  {
    num: "04",
    title: "Data Infrastructure",
    desc: "Pipelines, dashboards, integrations and monitoring designed to make organizations faster and more intelligent.",
  },
];

const SIGNALS = [
  { label: "Live product", value: "01" },
  { label: "AI modules", value: "12+" },
  { label: "Market", value: "SK/EU" },
  { label: "Horizon", value: "3000" },
];

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  return (
    <main className="relative z-10">
      <HeroSection />
      <Ticker />
      <ProjectSection />
      <CapabilitiesSection />
      <OperatingModelSection />
      <CTASection />
    </main>
  );
}

function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0.5);
  const rawY = useMotionValue(0.5);
  const smoothX = useSpring(rawX, { stiffness: 55, damping: 22 });
  const smoothY = useSpring(rawY, { stiffness: 55, damping: 22 });
  const headlineX = useTransform(smoothX, [0, 1], [-10, 10]);
  const headlineY = useTransform(smoothY, [0, 1], [-6, 6]);
  const panelX = useTransform(smoothX, [0, 1], [8, -8]);
  const panelY = useTransform(smoothY, [0, 1], [5, -5]);

  const handleMove = (event: React.MouseEvent<HTMLElement>) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    rawX.set((event.clientX - rect.left) / rect.width);
    rawY.set((event.clientY - rect.top) / rect.height);
  };

  const handleLeave = () => {
    rawX.set(0.5);
    rawY.set(0.5);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className="relative flex min-h-screen items-center px-6 pb-24 pt-28 md:px-12 lg:px-20"
    >
      <div className="mx-auto grid w-full max-w-7xl gap-12 lg:grid-cols-[1.05fr_0.72fr] lg:items-end">
        <div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.18, duration: 0.8 }}
            className="mb-7 text-[10px] uppercase tracking-[0.32em] text-white/28"
          >
            AI Tech Lab / Corporate Intelligence Systems / 2026 H2
          </motion.p>

          <motion.div style={{ x: headlineX, y: headlineY }}>
            <motion.h1
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.95, ease: easeOut }}
              className="max-w-4xl text-[clamp(3rem,7.4vw,8.6rem)] font-black leading-[0.9] tracking-[-0.055em] text-white"
            >
              We build intelligent infrastructure.
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.85, ease: easeOut }}
            className="mt-8 max-w-2xl text-base leading-[1.82] text-white/48 md:text-lg"
          >
            A future-facing AI lab creating enterprise-grade systems, public digital products and
            automation layers for organizations that want to move faster than the market.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.76, duration: 0.8, ease: easeOut }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-2 bg-white px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-white/90"
            >
              View projects
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 border border-white/12 px-6 py-3 text-sm text-white/58 transition-all duration-300 hover:border-white/28 hover:text-white"
            >
              Explore lab
            </Link>
          </motion.div>
        </div>

        <motion.div
          style={{ x: panelX, y: panelY }}
          initial={{ opacity: 0, y: 26 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease: easeOut }}
          className="relative overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.035] p-5 backdrop-blur-2xl"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_10%,rgba(90,130,255,0.22),transparent_44%)]" />
          <div className="relative">
            <div className="mb-8 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.28em] text-white/30">Live field</span>
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                Online
              </span>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/[0.065]">
              {SIGNALS.map((signal) => (
                <div key={signal.label} className="bg-[#050512]/82 p-5">
                  <div className="mb-2 text-2xl font-semibold text-white">{signal.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">
                    {signal.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-7 text-white/38">
              The background is interactive. Move the cursor to bend the field. Hold anywhere to
              charge gravity. Release to send a pulse through the network.
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Ticker() {
  const doubled = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div className="overflow-hidden border-y border-white/[0.065] bg-white/[0.018]">
      <motion.div
        animate={{ x: ["0%", "-50%"] }}
        className="flex items-center"
        transition={{ repeat: Infinity, duration: 34, ease: "linear" }}
      >
        {doubled.map((item, index) => (
          <div key={`${item}-${index}`} className="flex flex-shrink-0 items-center">
            <span className="whitespace-nowrap px-8 py-4 text-[10px] uppercase tracking-[0.28em] text-white/24">
              {item}
            </span>
            <span className="select-none text-xs text-white/10">·</span>
          </div>
        ))}
      </motion.div>
    </div>
  );
}

function ProjectSection() {
  return (
    <section className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="01" title="Flagship deployment" href="/projects" linkLabel="All projects" />

        <motion.a
          href="https://www.vodicak.pro"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.9, ease: easeOut }}
          whileHover={{ y: -5 }}
          className="group block cursor-pointer overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.032] transition-all duration-500 hover:bg-white/[0.056]"
        >
          <div className="relative h-48 overflow-hidden bg-[#050512] md:h-60">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(37,99,235,0.5),transparent_54%),radial-gradient(ellipse_at_74%_20%,rgba(124,58,237,0.36),transparent_52%)]" />
            <div className="absolute inset-0 flex items-center justify-center select-none">
              <div className="relative w-56 opacity-95 drop-shadow-[0_0_46px_rgba(37,99,235,0.72)] md:w-72">
                <Image
                  src="/logos/vodicak-pro-transparent.png"
                  alt="vodicak.pro logo"
                  width={420}
                  height={420}
                  className="h-auto w-full object-contain"
                  priority
                />
              </div>
            </div>
            <div className="absolute bottom-6 left-6 right-6 grid grid-cols-4 gap-2 opacity-45">
              {[0, 1, 2, 3].map((item) => (
                <div key={item} className="h-px bg-white/15" />
              ))}
            </div>
            <div className="absolute right-5 top-5 flex items-center gap-2 border border-emerald-400/28 bg-emerald-400/[0.09] px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
              <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">Live</span>
            </div>
          </div>

          <div className="flex flex-col gap-8 p-7 md:flex-row md:items-end md:justify-between md:p-10">
            <div>
              <div className="mb-5 flex flex-wrap gap-2">
                {["EdTech", "SaaS", "Slovakia", "Production"].map((tag) => (
                  <span
                    key={tag}
                    className="border border-white/[0.09] px-3 py-1 text-[10px] uppercase tracking-wide text-white/36"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <h3 className="mb-3 text-3xl font-bold tracking-[-0.03em] text-white md:text-5xl">
                vodicak.pro
              </h3>
              <p className="max-w-2xl text-sm leading-[1.78] text-white/44 md:text-base">
                A live digital platform for driving schools and future drivers. Online tests,
                education workflows and product infrastructure for a modern learning category.
              </p>
            </div>
            <span className="inline-flex flex-shrink-0 items-center gap-2 text-sm text-white transition-all duration-300 group-hover:gap-3">
              Visit product <span className="text-xl">↗</span>
            </span>
          </div>
        </motion.a>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="02" title="What we build" />

        <div className="grid grid-cols-1 gap-px bg-white/[0.055] md:grid-cols-2">
          {CAPABILITIES.map((capability, index) => (
            <motion.div
              key={capability.num}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: index * 0.07, duration: 0.75 }}
              className="group bg-[#03030a]/90 p-7 transition-colors duration-300 hover:bg-white/[0.025] md:p-9"
            >
              <span className="text-[10px] uppercase tracking-[0.32em] text-white/14">
                {capability.num}
              </span>
              <h3 className="mb-3 mt-4 text-lg font-semibold text-white md:text-xl">
                {capability.title}
              </h3>
              <p className="text-sm leading-[1.7] text-white/40">{capability.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperatingModelSection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-12 md:grid-cols-[0.78fr_1.22fr] md:items-start">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: easeOut }}
        >
          <span className="text-[10px] uppercase tracking-[0.32em] text-white/18">03 /</span>
          <h2 className="mt-3 max-w-sm text-4xl font-black leading-[0.96] tracking-[-0.035em] text-white md:text-5xl">
            Built like a lab. Operated like a company.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.08, ease: easeOut }}
        >
          <p className="mb-7 text-lg leading-[1.78] text-white/52">
            We combine research velocity with product discipline. Every experiment is pointed
            toward a system that can be shipped, measured and scaled.
          </p>
          <p className="text-base leading-[1.78] text-white/34">
            The lab is designed for public products, internal automation and conference-grade
            demonstrations that make advanced AI feel tangible instead of theoretical.
          </p>

          <div className="mt-9 grid grid-cols-3 gap-5 border-t border-white/[0.06] pt-8">
            {[
              { value: "Live", label: "production first" },
              { value: "AI", label: "native stack" },
              { value: "EU", label: "market focus" },
            ].map((item) => (
              <div key={item.label}>
                <div className="mb-1 text-2xl font-semibold text-white">{item.value}</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-white/28">
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="border-t border-white/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: easeOut }}
        className="mx-auto max-w-5xl text-center"
      >
        <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-white/22">
          Enterprise AI / Public demos / Product systems
        </p>
        <h2 className="mb-10 text-[clamp(2.5rem,6.2vw,6.8rem)] font-black leading-[0.92] tracking-[-0.045em] text-white">
          From prototype to operational reality.
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="mailto:contact@aitechlab.sk"
            className="group inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            Start a conversation
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </a>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 border border-white/11 px-7 py-4 text-sm text-white/55 transition-all duration-300 hover:border-white/26 hover:text-white"
          >
            See active systems
          </Link>
        </div>
      </motion.div>
    </section>
  );
}

function SectionHeader({
  index,
  title,
  href,
  linkLabel,
}: {
  index: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: easeOut }}
      className="mb-12 flex items-end justify-between border-b border-white/[0.065] pb-5"
    >
      <div>
        <span className="text-xs uppercase tracking-[0.32em] text-white/18">{index} /</span>
        <h2 className="mt-1.5 text-2xl font-bold text-white md:text-3xl">{title}</h2>
      </div>
      {href && linkLabel ? (
        <Link href={href} className="text-sm text-white/30 transition-colors hover:text-white/65">
          {linkLabel} →
        </Link>
      ) : null}
    </motion.div>
  );
}
