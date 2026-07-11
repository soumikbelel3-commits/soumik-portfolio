"use client";

import { HeroCanvas } from "@/components/three/Canvases";
import { site } from "@/data/projects";
import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export function Hero() {
  const reduce = useReducedMotion();

  const container = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: reduce ? 0 : 0.14,
        delayChildren: reduce ? 0 : 0.08,
      },
    },
  };

  const item = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] as const },
    },
  };

  return (
    <section className="atmosphere relative flex min-h-[100svh] flex-col justify-end overflow-hidden pb-16 pt-28 sm:justify-center sm:pb-24 sm:pt-32">
      <HeroCanvas />

      <div className="section-pad section-max relative z-10 w-full">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-5xl"
        >
          <motion.h1
            variants={item}
            className="font-display text-[clamp(3.25rem,12vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.03em] text-ink"
          >
            Soumik
            <br />
            Belel
          </motion.h1>

          <motion.p
            variants={item}
            className="mt-8 max-w-xl font-display text-2xl leading-snug tracking-[-0.02em] text-ink sm:mt-10 sm:text-3xl"
          >
            {site.headline}
          </motion.p>

          <motion.p
            variants={item}
            className="mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg"
          >
            {site.tagline}
          </motion.p>

          <motion.div
            variants={item}
            className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4"
          >
            <Link
              href="/work"
              className="group inline-flex items-center gap-3 font-mono text-[12px] tracking-[0.16em] text-ink uppercase"
            >
              <span className="border-b border-accent pb-1 transition-colors group-hover:border-ink">
                View work
              </span>
              <span
                aria-hidden
                className="text-accent transition-transform group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
            <Link
              href="/contact"
              className="font-mono text-[12px] tracking-[0.16em] text-muted uppercase transition-colors hover:text-ink"
            >
              Contact
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
