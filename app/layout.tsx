import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";
import { SiteShell } from "@/components/SiteShell";
import "./globals.css";

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://soumikbelel.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Soumik Belel — Data Analyst & Product Builder",
    template: "%s · Soumik Belel",
  },
  description:
    "Portfolio of Soumik Belel — data analyst and quant-minded builder shipping fintech, trading systems, analytics dashboards, and full-stack products.",
  keywords: [
    "Soumik Belel",
    "data analyst",
    "quant",
    "fintech",
    "trading systems",
    "analytics",
    "Next.js",
  ],
  authors: [{ name: "Soumik Belel", url: "https://github.com/soumikbelel3-commits" }],
  creator: "Soumik Belel",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Soumik Belel",
    title: "Soumik Belel — Data Analyst & Product Builder",
    description:
      "Data, markets, and products that ship. Fintech, trading systems, analytics dashboards, and full-stack apps.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Soumik Belel — Data Analyst & Product Builder",
    description:
      "Data, markets, and products that ship. Fintech, trading systems, analytics dashboards, and full-stack apps.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} ${jetbrains.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-bg font-sans text-ink">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
