"use client";

import { Reveal } from "@/components/Reveal";
import type { Project } from "@/lib/types";
import Link from "next/link";

type WorkListProps = {
  featured: Project[];
  archive: Project[];
};

export function WorkList({ featured, archive }: WorkListProps) {
  return (
    <div className="section-max">
      <Reveal>
        <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
          Work
        </p>
        <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
          Selected builds.
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Case studies across fintech, markets, analytics, and product — each
          one meant to ship.
        </p>
      </Reveal>

      <ul className="mt-16 divide-y divide-line border-y border-line">
        {featured.map((project, index) => (
          <Reveal key={project.id} delay={Math.min(index * 0.05, 0.3)}>
            <li>
              <Link
                href={`/work/${encodeURIComponent(project.slug)}`}
                className="group grid grid-cols-1 items-baseline gap-3 py-7 transition-transform duration-300 hover:translate-x-1 sm:grid-cols-[4.5rem_1fr_auto] sm:gap-8 sm:py-9"
              >
                <span className="font-mono text-[11px] tracking-[0.16em] text-muted">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <h2 className="font-display text-xl tracking-[-0.02em] text-ink transition-colors group-hover:text-accent sm:text-2xl">
                      {project.title}
                    </h2>
                    {project.language ? (
                      <span className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                        {project.language}
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 max-w-2xl text-[15px] leading-relaxed text-muted">
                    {project.description}
                  </p>
                </div>
                <span className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors group-hover:text-accent">
                  View →
                </span>
              </Link>
            </li>
          </Reveal>
        ))}
      </ul>

      {archive.length > 0 ? (
        <div className="mt-24">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
              Archive
            </p>
            <h2 className="mt-3 font-display text-2xl tracking-[-0.02em] text-ink sm:text-3xl">
              More projects
            </h2>
          </Reveal>

          <ul className="mt-10 divide-y divide-line border-y border-line">
            {archive.map((project, index) => (
              <Reveal
                key={project.id}
                delay={Math.min(index * 0.03, 0.2)}
              >
                <li>
                  <Link
                    href={`/work/${encodeURIComponent(project.slug)}`}
                    className="group flex flex-col gap-2 py-5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-8"
                  >
                    <div>
                      <h3 className="font-display text-lg tracking-[-0.02em] text-ink transition-colors group-hover:text-accent">
                        {project.title}
                      </h3>
                      <p className="mt-1 max-w-xl text-sm text-muted">
                        {project.description}
                      </p>
                    </div>
                    <span className="shrink-0 font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
                      {project.language ?? "Code"}
                    </span>
                  </Link>
                </li>
              </Reveal>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
