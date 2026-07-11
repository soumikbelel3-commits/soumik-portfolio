"use client";

import { Reveal } from "@/components/Reveal";
import { AboutCanvas } from "@/components/three/Canvases";

const groups = [
  {
    title: "Markets & Quant",
    items: [
      "Signal research",
      "Backtesting",
      "Risk & portfolio",
      "Trading dashboards",
    ],
  },
  {
    title: "Data & Analytics",
    items: [
      "Python / SQL",
      "EDA & modeling",
      "BI dashboards",
      "Churn & retention",
    ],
  },
  {
    title: "Product & Full-stack",
    items: [
      "Next.js / TypeScript",
      "API design",
      "Product UX",
      "Deploy & iterate",
    ],
  },
];

export function AboutPageContent() {
  return (
    <>
      <section className="section-pad pb-16 pt-28 sm:pb-20 sm:pt-36">
        <div className="section-max grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div>
            <Reveal>
              <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
                About
              </p>
              <h1 className="mt-4 font-display text-4xl tracking-[-0.03em] text-ink sm:text-5xl lg:text-6xl">
                Craft over noise.
              </h1>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="mt-8 space-y-5 text-base leading-relaxed text-muted sm:text-lg">
                <p className="text-ink">
                  I build at the intersection of data, markets, and product —
                  systems that read signals, explain risk, and ship as real
                  interfaces.
                </p>
                <p>
                  Work spans fintech marketing sites, institutional-style trading
                  dashboards, strategy backtesters, and analytics products. The
                  through-line is precision: clean models, clear UX, measurable
                  outcomes.
                </p>
                <p>
                  Less buzzword. More shipped software — from Jupyter notebooks
                  to full-stack apps people can use.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.12}>
            <AboutCanvas />
          </Reveal>
        </div>
      </section>

      <section className="section-pad border-t border-line py-20 sm:py-28">
        <div className="section-max">
          <Reveal>
            <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">
              Stack
            </p>
            <h2 className="mt-4 font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl">
              Tools that earn their place.
            </h2>
            <p className="mt-3 max-w-xl text-muted">
              A focused stack for markets, analysis, and product delivery.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-10 border-t border-line pt-10 sm:grid-cols-3 sm:gap-8">
            {groups.map((group, i) => (
              <Reveal key={group.title} delay={i * 0.06}>
                <div>
                  <h3 className="font-mono text-[11px] tracking-[0.16em] text-accent uppercase">
                    {group.title}
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {group.items.map((item) => (
                      <li
                        key={item}
                        className="border-b border-line/70 pb-3 text-[15px] text-ink"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
