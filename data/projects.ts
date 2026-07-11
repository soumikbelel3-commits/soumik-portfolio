import type { CuratedProject, Project } from "@/lib/types";

const GITHUB_USER = "soumikbelel3-commits";
const BASE = `https://github.com/${GITHUB_USER}`;

export const curatedProjects: CuratedProject[] = [
  {
    repo: "clearledger",
    title: "ClearLedger",
    description:
      "Fintech marketing site for a ledger product — sharp positioning, fast Next.js delivery.",
    language: "TypeScript",
    featured: true,
    role: "Product & front-end",
    year: "2025",
    stack: ["Next.js", "TypeScript", "Tailwind"],
    highlights: [
      "Positioned a ledger product with crisp marketing narrative",
      "Shipped a fast App Router site with conversion-focused layout",
      "Balanced brand polish with developer-speed delivery",
    ],
  },
  {
    repo: "gold-trading-execution",
    title: "Gold Trading Execution",
    description:
      "Pre-session gold dashboard with composite alpha, multi-timeframe technicals, and macro scoring.",
    language: "Python",
    featured: true,
    role: "Quant research & dashboard",
    year: "2025",
    stack: ["Python", "Pandas", "Technical analysis"],
    highlights: [
      "Composite alpha across multi-timeframe technicals",
      "Macro scoring layered into a pre-session briefing view",
      "Built for execution readiness, not post-hoc charts",
    ],
  },
  {
    repo: "ai-strategy-backtester",
    title: "AI Strategy Backtester",
    description:
      "Strategy backtesting product that turns signal ideas into measurable equity curves.",
    language: "TypeScript",
    featured: true,
    role: "Full-stack product",
    year: "2025",
    stack: ["TypeScript", "Next.js", "Backtesting"],
    highlights: [
      "Turned signal ideas into measurable equity curves",
      "Product surface for exploring and comparing strategies",
      "Focused on clarity of risk and return, not black-box magic",
    ],
  },
  {
    repo: "sanatani-bhakti",
    title: "Sanatani Bhakti",
    description:
      "All-in-one Hindu devotional app with multi-language support and daily practice flows.",
    language: "TypeScript",
    featured: true,
    role: "Product design & build",
    year: "2025",
    stack: ["TypeScript", "Next.js", "i18n"],
    highlights: [
      "Multi-language support for daily practice flows",
      "Unified rituals, readings, and reminders in one app",
      "Crafted calm UX for recurring spiritual routines",
    ],
  },
  {
    repo: "Local-Food-Wastage-Management-System",
    title: "Local Food Wastage Management",
    description:
      "Full-stack platform connecting surplus food with local demand to cut waste.",
    language: "TypeScript",
    featured: true,
    role: "Full-stack",
    year: "2024",
    stack: ["TypeScript", "APIs", "Full-stack"],
    highlights: [
      "Matched surplus supply with local demand in real time",
      "End-to-end flows for donors, receivers, and operators",
      "Designed to reduce waste with measurable handoffs",
    ],
  },
  {
    repo: "retail-sales-inventory-intelligence",
    title: "Retail Sales & Inventory Intelligence",
    description:
      "Retail intelligence layer for sales trends, stock risk, and replenishment signals.",
    language: "JavaScript",
    featured: true,
    role: "Data product",
    year: "2025",
    stack: ["JavaScript", "SQL", "Analytics"],
    highlights: [
      "Surfaced sales trends alongside stock-risk signals",
      "Replenishment cues grounded in inventory reality",
      "Intelligence layer meant for operators, not slide decks",
    ],
  },
  {
    repo: "european-bank-churn",
    title: "European Bank Churn",
    description:
      "Churn analytics that surface who leaves, why, and which levers retain them.",
    language: "Python",
    featured: true,
    role: "Analytics & modeling",
    year: "2024",
    stack: ["Python", "SQL", "ML"],
    highlights: [
      "Identified who churns and the drivers behind exits",
      "Retention levers ranked by actionable impact",
      "Analysis packaged for decision-makers, not notebooks alone",
    ],
  },
  {
    repo: "TCS-Quant-Trading-Guide",
    title: "TCS Quant Trading Guide",
    description:
      "End-to-end quant path: data, EDA, indicators, backtesting, ML, risk, and portfolio optimization.",
    language: "Python",
    featured: true,
    role: "Curriculum & research",
    year: "2024",
    stack: ["Python", "Quant", "ML", "Risk"],
    highlights: [
      "End-to-end path from data through portfolio optimization",
      "Indicators, backtesting, and ML in one coherent guide",
      "Risk framing kept equal to signal generation",
    ],
  },
  {
    repo: "us-airline-performance-analysis",
    title: "US Airline Performance Analysis",
    description:
      "Airline ops analytics across delay, route, and carrier performance.",
    language: "Python",
    featured: false,
  },
  {
    repo: "Cricbuzz_livestats",
    title: "Cricbuzz Live Stats",
    description:
      "Live cricket stats pipeline for match-time insight, not post-game summaries.",
    language: "Python",
    featured: false,
  },
  {
    repo: "real-estate-price-prediction",
    title: "Real Estate Price Prediction",
    description:
      "ML price models that turn listing features into calibrated valuations.",
    language: "Jupyter Notebook",
    featured: false,
  },
  {
    repo: "Global_supply_chain_risk_2026-",
    title: "Global Supply Chain Risk 2026",
    description:
      "Supply-chain risk map for disruption exposure across regions and lanes.",
    language: "Jupyter Notebook",
    featured: false,
  },
  {
    repo: "Superstore-sale-dashboard",
    title: "Superstore Sales Dashboard",
    description:
      "Python/SQL + Power BI sales analysis for category, region, and margin clarity.",
    language: "Python",
    featured: false,
  },
  {
    repo: "Fed-Ex-Supply-Chain",
    title: "FedEx Supply Chain",
    description:
      "Labmentix supply-chain study focused on flow, cost, and bottleneck diagnosis.",
    language: "Jupyter Notebook",
    featured: false,
  },
  {
    repo: "Instructor-Effectiveness-Modeling",
    title: "Instructor Effectiveness Modeling",
    description:
      "Accredian intern project modeling instructor impact on learner outcomes.",
    language: "Jupyter Notebook",
    featured: false,
  },
  {
    repo: "Customer-Engagement-Product-Utilization-Analytics-for-Retention-Strategy",
    title: "Customer Engagement & Retention",
    description:
      "Engagement and product-utilization analytics that feed retention strategy.",
    language: "Python",
    featured: false,
  },
  {
    repo: "Retail-Data-Analytics-Project-Python-SQL-Integration",
    title: "Retail Data Analytics",
    description:
      "Python + SQL retail analytics from raw tables to decision-ready views.",
    language: "Python",
    featured: false,
  },
  {
    repo: "-trader-behavior-and-performance",
    title: "Trader Behavior & Performance",
    description:
      "Fear/Greed sentiment linked to trader behavior and performance patterns.",
    language: "Python",
    featured: false,
  },
  {
    repo: "Online-vs-Store-shopping-",
    title: "Online vs Store Shopping",
    description:
      "Channel comparison that separates online and store shopping behavior.",
    language: "Python",
    featured: false,
  },
  {
    repo: "IPL-Data-Analysis",
    title: "IPL Data Analysis",
    description:
      "IPL match and player analytics for form, matchup, and season trends.",
    language: "Python",
    featured: false,
  },
  {
    repo: "euro-bank-web",
    title: "Euro Bank Web",
    description:
      "Web surface for European bank churn insights — analysis made shareable.",
    language: "TypeScript",
    featured: false,
  },
];

function curatedToProject(p: CuratedProject): Project {
  return {
    id: p.repo,
    name: p.repo,
    title: p.title,
    description: p.description,
    language: p.language,
    stars: 0,
    url: `${BASE}/${p.repo}`,
    homepage: p.homepage ?? null,
    featured: p.featured,
    updatedAt: "1970-01-01T00:00:00Z",
    slug: p.repo,
    role: p.role,
    year: p.year,
    stack: p.stack,
    highlights: p.highlights,
  };
}

export function curatedAsProjects(): Project[] {
  return curatedProjects.map(curatedToProject);
}

export function getFeaturedProjects(): Project[] {
  return curatedAsProjects().filter((p) => p.featured);
}

export function getAllProjectSlugs(): string[] {
  return curatedProjects.map((p) => p.repo);
}

export function getCuratedBySlug(slug: string): Project | undefined {
  const curated = curatedProjects.find(
    (p) => p.repo.toLowerCase() === slug.toLowerCase(),
  );
  return curated ? curatedToProject(curated) : undefined;
}

export function getAdjacentSlugs(slug: string): {
  prev: string | null;
  next: string | null;
} {
  const featured = curatedProjects.filter((p) => p.featured);
  const inFeatured = featured.some(
    (p) => p.repo.toLowerCase() === slug.toLowerCase(),
  );
  const list = inFeatured ? featured : curatedProjects;
  const idx = list.findIndex(
    (p) => p.repo.toLowerCase() === slug.toLowerCase(),
  );
  if (idx === -1) {
    return { prev: null, next: null };
  }
  return {
    prev: idx > 0 ? list[idx - 1].repo : null,
    next: idx < list.length - 1 ? list[idx + 1].repo : null,
  };
}

export const site = {
  name: "Soumik Belel",
  email: "soumikbelel3@gmail.com",
  github: BASE,
  githubUser: GITHUB_USER,
  headline: "Data, markets, and products that ship.",
  tagline:
    "Data analyst and quant-minded builder. Fintech, trading systems, analytics dashboards, full-stack products.",
};
