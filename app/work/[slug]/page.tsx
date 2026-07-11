import { ProjectCase } from "@/components/ProjectCase";
import {
  getAdjacentSlugs,
  getAllProjectSlugs,
  getCuratedBySlug,
} from "@/data/projects";
import { fetchRepos } from "@/lib/github";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllProjectSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const curated = getCuratedBySlug(decoded);
  const projects = await fetchRepos();
  const project =
    projects.find((p) => p.slug.toLowerCase() === decoded.toLowerCase()) ??
    curated;

  if (!project) {
    return { title: "Project" };
  }

  return {
    title: project.title,
    description: project.description,
  };
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  const decoded = decodeURIComponent(slug);
  const projects = await fetchRepos();
  const curated = getCuratedBySlug(decoded);
  const project =
    projects.find((p) => p.slug.toLowerCase() === decoded.toLowerCase()) ??
    curated;

  if (!project) {
    notFound();
  }

  // Prefer curated case-study fields when API merge omitted them
  const enriched = {
    ...project,
    role: project.role ?? curated?.role,
    year: project.year ?? curated?.year,
    stack: project.stack ?? curated?.stack,
    highlights: project.highlights ?? curated?.highlights,
  };

  const { prev, next } = getAdjacentSlugs(decoded);
  const titleFor = (s: string | null) => {
    if (!s) return undefined;
    return (
      getCuratedBySlug(s)?.title ??
      projects.find((p) => p.slug === s)?.title
    );
  };

  return (
    <ProjectCase
      project={enriched}
      prevSlug={prev}
      nextSlug={next}
      prevTitle={titleFor(prev)}
      nextTitle={titleFor(next)}
    />
  );
}
