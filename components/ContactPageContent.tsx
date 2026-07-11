"use client";

import { Reveal } from "@/components/Reveal";
import { ContactCanvas } from "@/components/three/Canvases";
import { site } from "@/data/projects";

export function ContactPageContent() {
  return (
    <section className="atmosphere relative min-h-[100svh] overflow-hidden">
      <ContactCanvas />
      <div className="section-pad section-max relative z-10 flex min-h-[100svh] flex-col justify-center py-28 sm:py-36">
        <Reveal>
          <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
            Contact
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-4xl tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
            Let&apos;s build something precise.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
            Open to roles and collaborations in data, markets, and product.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="mt-14 flex flex-col gap-8 sm:flex-row sm:items-end sm:gap-16">
            <a
              href={`mailto:${site.email}`}
              className="group inline-flex flex-col gap-2"
            >
              <span className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
                Email
              </span>
              <span className="border-b border-accent pb-1 font-display text-xl text-ink transition-colors group-hover:text-accent sm:text-2xl">
                {site.email}
              </span>
            </a>
            <a
              href={site.github}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex flex-col gap-2"
            >
              <span className="font-mono text-[11px] tracking-[0.16em] text-muted uppercase">
                GitHub
              </span>
              <span className="border-b border-line pb-1 font-display text-xl text-ink transition-colors group-hover:border-accent group-hover:text-accent sm:text-2xl">
                @{site.githubUser}
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
