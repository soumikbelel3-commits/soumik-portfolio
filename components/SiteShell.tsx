"use client";

import { Footer } from "@/components/Footer";
import { Nav } from "@/components/Nav";
import { PageTransition } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import type { ReactNode } from "react";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <SmoothScroll>
      <Nav />
      <PageTransition>
        <main className="min-h-[100svh]">{children}</main>
      </PageTransition>
      <Footer />
    </SmoothScroll>
  );
}
