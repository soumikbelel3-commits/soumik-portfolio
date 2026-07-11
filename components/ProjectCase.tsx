"use client";

import { Reveal } from "@/components/Reveal";
import type { Project } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

type ProjectCaseProps = {
  project: Project;
  prevSlug: string | null;
  nextSlug: string | null;
  prevTitle?: string;
  nextTitle?: string;
};

export function ProjectCase({
  project,
  prevSlug,
  nextSlug,
  prevTitle,
  nextTitle,
}: ProjectCaseProps) {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.1,
        delayChildren: reduce ? 0 : 0.05,
      },
    },
  };

  const item = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <article className="section-pad pb-24 pt-28 sm:pb-32 sm:pt-36">
      <div className="section-max">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={item}>
            <Link
              href="/work"
              className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-accent"
            >
              ← All work
            </Link>
          </motion.div>

          <motion.p
            variants={item}
            className="mt-8 font-mono text-[11px] tracking-[0.2em] text-accent uppercase"
          >
            {[project.year, project.role].filter(Boolean).join(" · ") ||
              "Case study"}
          </motion.p>

          <motion.h1
            variants={item}
            className="mt-4 font-display text-4xl tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl"
          >
            {project.title}
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-6 text-lg leading-relaxed text-muted sm:text-xl"
          >
            {project.description}
          </motion.p>

          {project.stack && project.stack.length > 0 ? (
            <motion.ul
              variants={item}
              className="mt-8 flex flex-wrap gap-x-4 gap-y-2"
            >
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase"
                >
                  {tech}
                </li>
              ))}
            </motion.ul>
          ) : project.language ? (
            <motion.p
              variants={item}
              className="mt-8 font-mono text-[11px] tracking-[0.14em] text-muted uppercase"
            >
              {project.language}
            </motion.p>
          ) : null}

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            {project.homepage ? (
              <a
                href={project.homepage}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.16em] text-ink uppercase"
              >
                <span className="border-b border-accent pb-1 transition-colors group-hover:border-ink">
                  Live
                </span>
                <span aria-hidden className="text-accent">
                  →
                </span>
              </a>
            ) : null}
            <a
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[12px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
            >
              Code
            </a>
          </motion.div>
        </motion.div>

        {project.highlights && project.highlights.length > 0 ? (
          <Reveal className="mt-20 max-w-2xl border-t border-line pt-12">
            <h2 className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
              Highlights
            </h2>
            <ul className="mt-6 space-y-4">
              {project.highlights.map((line) => (
                <li
                  key={line}
                  className="border-b border-line/70 pb-4 text-base leading-relaxed text-ink"
                >
                  {line}
                </li>
              ))}
            </ul>
          </Reveal>
        ) : null}

        <nav className="mt-24 flex flex-col gap-6 border-t border-line pt-10 sm:flex-row sm:justify-between">
          {prevSlug ? (
            <Link
              href={`/work/${encodeURIComponent(prevSlug)}`}
              className="group max-w-xs"
            >
              <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Previous
              </span>
              <span className="mt-2 block font-display text-lg text-ink transition-colors group-hover:text-accent">
                ← {prevTitle ?? prevSlug}
              </span>
            </Link>
          ) : (
            <span />
          )}
          {nextSlug ? (
            <Link
              href={`/work/${encodeURIComponent(nextSlug)}`}
              className="group max-w-xs sm:text-right"
            >
              <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
                Next
              </span>
              <span className="mt-2 block font-display text-lg text-ink transition-colors group-hover:text-accent">
                {nextTitle ?? nextSlug} →
              </span>
            </Link>
          ) : null}
        </nav>
      </div>
    </article>
  );
}
