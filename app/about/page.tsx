import { AboutPageContent } from "@/components/AboutPageContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description:
    "About Soumik Belel — data analyst and quant-minded builder shipping fintech, trading systems, and full-stack products.",
};

export default function AboutPage() {
  return <AboutPageContent />;
}
