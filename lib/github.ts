import { curatedAsProjects, curatedProjects } from "@/data/projects";
import type { Project } from "@/lib/types";

const GITHUB_USER = "soumikbelel3-commits";
const API_URL = `https://api.github.com/users/${GITHUB_USER}/repos?per_page=100&sort=updated`;

const EXCLUDE = new Set(
  [
    "soumik-portfolio",
    "Portfolio",
    "personal-website",
    "soumik_protfolio-website",
    "personal-brand",
    "data-analyst-skills",
    "r4ds",
  ].map((n) => n.toLowerCase()),
);

type GitHubRepo = {
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  html_url: string;
  homepage: string | null;
  fork: boolean;
  updated_at: string;
  pushed_at: string;
};

const curatedByRepo = new Map(
  curatedProjects.map((p) => [p.repo.toLowerCase(), p]),
);

function normalizeName(name: string) {
  return name.toLowerCase();
}

function toProject(repo: GitHubRepo): Project {
  const curated = curatedByRepo.get(normalizeName(repo.name));
  return {
    id: repo.name,
    name: repo.name,
    title: curated?.title ?? formatRepoName(repo.name),
    description:
      curated?.description ??
      repo.description ??
      "Open-source project on GitHub.",
    language: curated?.language ?? repo.language,
    stars: repo.stargazers_count,
    url: repo.html_url,
    homepage: repo.homepage || curated?.homepage || null,
    featured: curated?.featured ?? false,
    updatedAt: repo.pushed_at || repo.updated_at,
    slug: repo.name,
    role: curated?.role,
    year: curated?.year,
    stack: curated?.stack,
    highlights: curated?.highlights,
  };
}

function formatRepoName(name: string) {
  return name
    .replace(/^-+/, "")
    .replace(/-+$/g, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function sortProjects(projects: Project[]) {
  return [...projects].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    return (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  });
}

export async function fetchRepos(): Promise<Project[]> {
  try {
    const res = await fetch(API_URL, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "soumik-belele-portfolio",
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.warn(`GitHub API ${res.status}; using curated fallback.`);
      return sortProjects(curatedAsProjects());
    }

    const repos = (await res.json()) as GitHubRepo[];
    const filtered = repos
      .filter((r) => !r.fork && !EXCLUDE.has(r.name.toLowerCase()))
      .map(toProject);

    if (filtered.length === 0) {
      return sortProjects(curatedAsProjects());
    }

    // Ensure curated featured projects appear even if missing from API
    const byName = new Map(filtered.map((p) => [normalizeName(p.name), p]));
    for (const curated of curatedAsProjects()) {
      const key = normalizeName(curated.name);
      if (!byName.has(key)) {
        byName.set(key, curated);
      }
    }

    return sortProjects([...byName.values()]);
  } catch (err) {
    console.warn("GitHub fetch failed; using curated fallback.", err);
    return sortProjects(curatedAsProjects());
  }
}
