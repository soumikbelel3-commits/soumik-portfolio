import Link from "next/link";
import { site } from "@/data/projects";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="section-pad border-t border-line py-8">
      <div className="section-max flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
          © {year} {site.name}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <Link
            href="/work"
            className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink"
          >
            Work
          </Link>
          <Link
            href="/about"
            className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase transition-colors hover:text-ink"
          >
            Contact
          </Link>
          <p className="font-mono text-[11px] tracking-[0.14em] text-muted uppercase">
            Abstract craft · Next.js
          </p>
        </div>
      </div>
    </footer>
  );
}
