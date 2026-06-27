"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useLanguage } from "@/components/LanguageProvider";

const easeOut = [0.22, 1, 0.36, 1] as const;

export default function Home() {
  return (
    <main className="relative z-10">
      <HeroSection />
      <Ticker />
      <ProjectSection />
      <CapabilitiesSection />
      <OperatingModelSection />
      <NonprofitPartnersSection />
      <CTASection />
    </main>
  );
}

function HeroSection() {
  const { t } = useLanguage();
  const h = t.home;
  const signals = [
    { label: h.signals.liveProduct, value: "01" },
    { label: h.signals.aiModules, value: "12+" },
    { label: h.signals.market, value: "SK/EU" },
    { label: h.signals.horizon, value: "3000" },
  ];
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
            {h.heroEyebrow}
          </motion.p>

          <motion.div style={{ x: headlineX, y: headlineY }}>
            <motion.h1
              initial={{ opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.32, duration: 0.95, ease: easeOut }}
              className="max-w-4xl text-[clamp(3rem,7.4vw,8.6rem)] font-black leading-[0.9] tracking-[-0.055em] text-white"
            >
              {h.heroTitle}
            </motion.h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.58, duration: 0.85, ease: easeOut }}
            className="mt-8 max-w-2xl text-base leading-[1.82] text-white/48 md:text-lg"
          >
            {h.heroBody}
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
              {h.viewProjects}
              <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </Link>
            <Link
              href="/lab"
              className="inline-flex items-center gap-2 border border-white/12 px-6 py-3 text-sm text-white/58 transition-all duration-300 hover:border-white/28 hover:text-white"
            >
              {h.exploreLab}
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
              <span className="text-[10px] uppercase tracking-[0.28em] text-white/30">{h.liveField}</span>
              <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.18em] text-emerald-300/80">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                {h.online}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-px bg-white/[0.065]">
              {signals.map((signal) => (
                <div key={signal.label} className="bg-[#050512]/82 p-5">
                  <div className="mb-2 text-2xl font-semibold text-white">{signal.value}</div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/28">
                    {signal.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-7 text-white/38">{h.panelHint}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function Ticker() {
  const { t } = useLanguage();
  const doubled = [...t.home.ticker, ...t.home.ticker];

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
  const { t } = useLanguage();
  const h = t.home;

  const featured = [
    {
      name: "vodicak.pro",
      url: "https://www.vodicak.pro",
      logo: "/logos/vodicak-pro-transparent.png",
      tags: ["EdTech", "SaaS", "Slovakia", "Production"],
      description: h.vodicakDesc,
      logoClass: "w-56 md:w-72",
    },
    {
      name: "CamEngine",
      url: "https://ghostprotocol-labs-sec.web.app/",
      logo: "/logos/camengine.png",
      tags: ["Windows", "Security", "IoT", "Desktop"],
      description: h.camengineDesc,
      logoClass: "w-48 md:w-56",
    },
  ] as const;

  return (
    <section className="px-6 py-28 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="01" title={h.liveProjects} href="/projects" linkLabel={h.allProjects} />

        <div className="grid gap-5 lg:grid-cols-2">
          {featured.map((project, index) => (
            <motion.a
              key={project.name}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.9, delay: index * 0.06, ease: easeOut }}
              whileHover={{ y: -5 }}
              className="group block cursor-pointer overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.032] transition-all duration-500 hover:bg-white/[0.056]"
            >
              <div className="relative h-44 overflow-hidden bg-[#050512] md:h-52">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_50%,rgba(37,99,235,0.5),transparent_54%),radial-gradient(ellipse_at_74%_20%,rgba(124,58,237,0.36),transparent_52%)]" />
                <div className="absolute inset-0 flex items-center justify-center select-none">
                  <div className={`relative opacity-95 drop-shadow-[0_0_46px_rgba(37,99,235,0.72)] ${project.logoClass}`}>
                    <Image
                      src={project.logo}
                      alt={`${project.name} logo`}
                      width={420}
                      height={420}
                      className="h-auto w-full object-contain"
                      priority={index === 0}
                    />
                  </div>
                </div>
                <div className="absolute right-5 top-5 flex items-center gap-2 border border-emerald-400/28 bg-emerald-400/[0.09] px-3 py-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 pulse-dot" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-emerald-300">{h.live}</span>
                </div>
              </div>

              <div className="flex flex-col gap-6 p-7 md:p-8">
                <div>
                  <div className="mb-4 flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-white/[0.09] px-3 py-1 text-[10px] uppercase tracking-wide text-white/36"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold tracking-[-0.03em] text-white md:text-4xl">
                    {project.name}
                  </h3>
                  <p className="text-sm leading-[1.78] text-white/44 md:text-base">{project.description}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm text-white transition-all duration-300 group-hover:gap-3">
                  {h.visitProduct} <span className="text-xl">↗</span>
                </span>
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}

function CapabilitiesSection() {
  const { t } = useLanguage();
  const h = t.home;
  const capabilities = [
    { num: "01", title: h.cap1Title, desc: h.cap1Desc },
    { num: "02", title: h.cap2Title, desc: h.cap2Desc },
    { num: "03", title: h.cap3Title, desc: h.cap3Desc },
    { num: "04", title: h.cap4Title, desc: h.cap4Desc },
  ];

  return (
    <section className="border-t border-white/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <SectionHeader index="02" title={h.capabilities} />

        <div className="grid grid-cols-1 gap-px bg-white/[0.055] md:grid-cols-2">
          {capabilities.map((capability, index) => (
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
  const { t } = useLanguage();
  const h = t.home;

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
            {h.operatingTitle}
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.08, ease: easeOut }}
        >
          <p className="mb-7 text-lg leading-[1.78] text-white/52">{h.operatingBody1}</p>
          <p className="text-base leading-[1.78] text-white/34">{h.operatingBody2}</p>

          <div className="mt-9 grid grid-cols-3 gap-5 border-t border-white/[0.06] pt-8">
            {[
              { value: h.opLive, label: h.opLiveLabel },
              { value: h.opAi, label: h.opAiLabel },
              { value: h.opEu, label: h.opEuLabel },
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

function NonprofitPartnersSection() {
  const { t } = useLanguage();
  const h = t.home;
  const pillars = [
    { title: h.np1Title, desc: h.np1Desc },
    { title: h.np2Title, desc: h.np2Desc },
    { title: h.np3Title, desc: h.np3Desc },
  ];

  return (
    <section className="border-t border-white/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 md:grid-cols-[0.92fr_1.08fr] md:items-start">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, ease: easeOut }}
          >
            <span className="text-[10px] uppercase tracking-[0.32em] text-white/18">04 /</span>
            <h2 className="mt-3 max-w-md text-4xl font-black leading-[0.96] tracking-[-0.035em] text-white md:text-5xl">
              {h.nonprofitTitle}
            </h2>
            <p className="mt-6 text-base leading-[1.78] text-white/38">{h.nonprofitIntro}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.08, ease: easeOut }}
            className="grid gap-px bg-white/[0.055]"
          >
            {pillars.map((pillar, index) => (
              <div
                key={pillar.title}
                className="bg-[#03030a]/90 p-7 transition-colors duration-300 hover:bg-white/[0.025] md:p-8"
              >
                <span className="text-[10px] uppercase tracking-[0.28em] text-white/14">
                  0{index + 1}
                </span>
                <h3 className="mb-2 mt-3 text-lg font-semibold text-white">{pillar.title}</h3>
                <p className="text-sm leading-[1.72] text-white/40">{pillar.desc}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.12, ease: easeOut }}
          className="mt-10 flex flex-col items-start justify-between gap-6 rounded-3xl border border-white/[0.075] bg-white/[0.028] p-7 md:flex-row md:items-center md:p-9"
        >
          <p className="max-w-2xl text-sm leading-[1.78] text-white/44 md:text-base">{h.nonprofitCta}</p>
          <Link
            href="/partners/apply"
            className="group inline-flex flex-shrink-0 items-center gap-2 border border-white/12 px-6 py-3 text-sm text-white/58 transition-all duration-300 hover:border-white/28 hover:text-white"
          >
            {h.applyPartner}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}

function CTASection() {
  const { t } = useLanguage();
  const h = t.home;

  return (
    <section className="border-t border-white/[0.06] px-6 py-24 md:px-12 lg:px-20">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: easeOut }}
        className="mx-auto max-w-5xl text-center"
      >
        <p className="mb-6 text-[10px] uppercase tracking-[0.32em] text-white/22">{h.ctaEyebrow}</p>
        <h2 className="mb-10 text-[clamp(2.5rem,6.2vw,6.8rem)] font-black leading-[0.92] tracking-[-0.045em] text-white">
          {h.ctaTitle}
        </h2>
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-2 bg-white px-7 py-4 text-sm font-semibold text-black transition-colors hover:bg-white/90"
          >
            {h.ctaContact}
            <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
          </Link>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 border border-white/11 px-7 py-4 text-sm text-white/55 transition-all duration-300 hover:border-white/26 hover:text-white"
          >
            {h.ctaProjects}
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
