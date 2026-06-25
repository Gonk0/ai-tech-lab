"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/components/LanguageProvider";
import { useMemo } from "react";

const easeOut = [0.22, 1, 0.36, 1] as const;

type Project = {
  name: string;
  status: string;
  statusKey: "statusLive" | "statusLiveDemo" | "statusConcept";
  target: string;
  description: string;
  tags: string[];
  url?: string;
  logo?: string;
};

type ProjectGroup = {
  id: "live" | "concepts";
  title: string;
  description: string;
  projects: Project[];
};

export default function ProjectsPage() {
  const { t } = useLanguage();
  const p = t.projects;

  const groups: ProjectGroup[] = useMemo(
    () => [
      {
        id: "live",
        title: p.liveTitle,
        description: p.liveDesc,
        projects: [
          {
            name: "vodicak.pro",
            url: "https://www.vodicak.pro",
            status: p.statusLive,
            statusKey: "statusLive",
            target: p.vodicakTarget,
            description: p.vodicakDesc,
            tags: ["EdTech", "SaaS", "B2C", "Production"],
            logo: "/logos/vodicak-pro-transparent.png",
          },
          {
            name: "Space Lab",
            url: "/lab/space",
            status: p.statusLiveDemo,
            statusKey: "statusLiveDemo",
            target: p.spaceTarget,
            description: p.spaceDesc,
            tags: ["Interactive", "Canvas", "Physics", "Demo"],
          },
        ],
      },
      {
        id: "concepts",
        title: p.conceptsTitle,
        description: p.conceptsDesc,
        projects: [
          {
            name: "AI Workspace",
            status: p.statusConcept,
            statusKey: "statusConcept",
            target: p.aiWorkspaceTarget,
            description: p.aiWorkspaceDesc,
            tags: ["B2B", "Agents", "Knowledge"],
          },
          {
            name: "Data Pipeline OS",
            status: p.statusConcept,
            statusKey: "statusConcept",
            target: p.dataPipelineTarget,
            description: p.dataPipelineDesc,
            tags: ["Data", "Ops", "Monitoring"],
          },
          {
            name: "Neural CMS",
            status: p.statusConcept,
            statusKey: "statusConcept",
            target: p.neuralCmsTarget,
            description: p.neuralCmsDesc,
            tags: ["Content", "AI", "Platform"],
          },
          {
            name: "Agent Demo Kit",
            status: p.statusConcept,
            statusKey: "statusConcept",
            target: p.agentKitTarget,
            description: p.agentKitDesc,
            tags: ["Demos", "Agents", "Education"],
          },
        ],
      },
    ],
    [p],
  );

  return (
    <main className="relative z-10 px-6 pb-28 pt-32 md:px-12 lg:px-20">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: easeOut }}
          className="mb-16"
        >
          <p className="mb-5 text-[10px] uppercase tracking-[0.28em] text-white/22">
            AI Tech Lab / {p.title}
          </p>
          <h1 className="max-w-4xl text-[clamp(3rem,7.2vw,7.6rem)] font-black leading-[0.9] tracking-[-0.05em] text-white">
            {p.pageHeadline}
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-[1.78] text-white/42 md:text-lg">
            {p.pageIntro}
          </p>
        </motion.div>

        <div className="space-y-16">
          {groups.map((group, groupIndex) => (
            <motion.section
              key={group.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ delay: groupIndex * 0.08, duration: 0.82, ease: easeOut }}
            >
              <div className="mb-7 flex flex-col justify-between gap-4 border-b border-white/[0.065] pb-5 md:flex-row md:items-end">
                <div className="flex items-center gap-3">
                  {group.id === "live" ? (
                    <span className="h-2 w-2 rounded-full bg-emerald-400 pulse-dot" />
                  ) : null}
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.28em] text-white/18">
                      0{groupIndex + 1}
                    </span>
                    <h2 className="mt-2 text-2xl font-bold text-white md:text-3xl">{group.title}</h2>
                  </div>
                </div>
                <p className="max-w-xl text-sm leading-6 text-white/34">{group.description}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                {group.projects.map((project) => (
                  <ProjectCard key={`${group.id}-${project.name}`} project={project} />
                ))}
              </div>
            </motion.section>
          ))}
        </div>
      </div>
    </main>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const isLive = project.statusKey === "statusLive" || project.statusKey === "statusLiveDemo";
  const isInternal = project.url?.startsWith("/");
  const cardContent = (
    <>
      <div className="relative flex h-52 items-center justify-center overflow-hidden bg-[#050512]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_35%_48%,rgba(37,99,235,0.5),transparent_56%),radial-gradient(ellipse_at_80%_18%,rgba(124,58,237,0.32),transparent_50%)]" />

        {project.logo ? (
          <div className="relative w-64 opacity-95 drop-shadow-[0_0_52px_rgba(37,99,235,0.72)] md:w-80">
            <Image
              src={project.logo}
              alt={`${project.name} logo`}
              width={560}
              height={560}
              className="h-auto w-full object-contain"
              priority
            />
          </div>
        ) : (
          <div className="relative grid h-28 w-28 place-items-center rounded-3xl border border-white/[0.09] bg-white/[0.04] text-4xl font-black text-white/20">
            {project.name.slice(0, 2).toUpperCase()}
          </div>
        )}

        <div className="absolute right-5 top-5 flex items-center gap-2 border border-white/[0.09] bg-black/20 px-3 py-1.5 backdrop-blur-xl">
          <span className={`h-1.5 w-1.5 rounded-full ${isLive ? "bg-emerald-400 pulse-dot" : "bg-blue-300/70"}`} />
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/50">{project.status}</span>
        </div>
      </div>

      <div className="p-7">
        <div className="mb-5 flex flex-wrap gap-2">
          {project.tags.map((tag) => (
            <span
              key={tag}
              className="border border-white/[0.085] px-3 py-1 text-[10px] uppercase tracking-wide text-white/34"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="mb-3 flex items-end justify-between gap-5">
          <h3 className="text-3xl font-bold tracking-[-0.03em] text-white md:text-4xl">
            {project.name}
          </h3>
          {project.url ? <span className="text-2xl text-white transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">↗</span> : null}
        </div>
        <p className="mb-4 text-[10px] uppercase tracking-[0.18em] text-white/24">{project.target}</p>
        <p className="text-sm leading-[1.72] text-white/42">{project.description}</p>
      </div>
    </>
  );

  const className =
    "group block overflow-hidden rounded-3xl border border-white/[0.075] bg-white/[0.032] transition-all duration-500 hover:bg-white/[0.056]";

  if (project.url && isInternal) {
    return (
      <motion.div whileHover={{ y: -5 }}>
        <Link href={project.url} className={className}>
          {cardContent}
        </Link>
      </motion.div>
    );
  }

  if (project.url) {
    return (
      <motion.a
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ y: -5 }}
        className={className}
      >
        {cardContent}
      </motion.a>
    );
  }

  return (
    <motion.article whileHover={{ y: -5 }} className={className}>
      {cardContent}
    </motion.article>
  );
}
