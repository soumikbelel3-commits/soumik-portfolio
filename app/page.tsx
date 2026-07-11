import { FeaturedTeaser } from "@/components/FeaturedTeaser";
import { Hero } from "@/components/Hero";
import { getFeaturedProjects } from "@/data/projects";
import { fetchRepos } from "@/lib/github";

export default async function Home() {
  const projects = await fetchRepos();
  const featuredOrdered = getFeaturedProjects().map((curated) => {
    return (
      projects.find((p) => p.id.toLowerCase() === curated.id.toLowerCase()) ??
      curated
    );
  });
  const teaser = featuredOrdered.slice(0, 4);

  return (
    <>
      <Hero />
      <FeaturedTeaser projects={teaser} />
    </>
  );
}
