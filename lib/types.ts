export type Project = {
  id: string;
  name: string;
  title: string;
  description: string;
  language: string | null;
  stars: number;
  url: string;
  homepage: string | null;
  featured: boolean;
  updatedAt: string;
  slug: string;
  role?: string;
  year?: string;
  stack?: string[];
  highlights?: string[];
};

export type CuratedProject = {
  repo: string;
  title: string;
  description: string;
  language: string;
  featured: boolean;
  homepage?: string;
  role?: string;
  year?: string;
  stack?: string[];
  highlights?: string[];
};
