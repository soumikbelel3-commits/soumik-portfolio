"use client";

import { Reveal } from "@/components/Reveal";
import type { Project } from "@/lib/types";
import Link from "next/link";

type FeaturedTeaserProps = {
  projects: Project[];
};

export function FeaturedTeaser({ projects }: FeaturedTeaserProps) {
  return (
    <section className="section-pad border-t border-line py-20 sm:py-28">
      <div className="section-max">
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                Featured
              </p>
              <h2 className="mt-3 font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl">
                Recent work
              </h2>
            </div>
            <Link
              href="/work"
              className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-accent"
            >
              All work →
            </Link>
          </div>
        </Reveal>

        <ul className="mt-12 divide-y divide-line border-y border-line">
          {projects.map((project, index) => (
            <Reveal key={project.id} delay={Math.min(index * 0.06, 0.24)}>
              <li>
                <Link
                  href={`/work/${encodeURIComponent(project.slug)}`}
                  className="group grid grid-cols-1 items-baseline gap-2 py-6 transition-transform duration-300 hover:translate-x-1 sm:grid-cols-[1fr_auto] sm:gap-8"
                >
                  <div>
                    <h3 className="font-display text-xl tracking-[-0.02em] text-ink transition-colors group-hover:text-accent sm:text-2xl">
                      {project.title}
                    </h3>
                    <p className="mt-2 max-w-xl text-[15px] text-muted">
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
      </div>
    </section>
  );
}
