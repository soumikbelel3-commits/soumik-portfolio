import { WorkList } from "@/components/WorkList";
import { getFeaturedProjects } from "@/data/projects";
import { fetchRepos } from "@/lib/github";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Work",
  description:
    "Selected builds and archive — fintech, markets, analytics, and full-stack products by Soumik Belel.",
};

export default async function WorkPage() {
  const projects = await fetchRepos();
  const featuredIds = new Set(
    getFeaturedProjects().map((p) => p.id.toLowerCase()),
  );

  const featuredOrdered = getFeaturedProjects().map((curated) => {
    return (
      projects.find((p) => p.id.toLowerCase() === curated.id.toLowerCase()) ??
      curated
    );
  });

  const archive = projects.filter(
    (p) => !featuredIds.has(p.id.toLowerCase()) && !p.featured,
  );

  return (
    <section className="section-pad pb-24 pt-28 sm:pb-32 sm:pt-36">
      <WorkList featured={featuredOrdered} archive={archive} />
    </section>
  );
}
