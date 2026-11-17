import { getRepo, getReadmeHtml } from '../lib/github';

/**
 * Projects shown on the Home page (featured) and the Projects page (all).
 *
 * To add a GitHub project, add an entry with its `repo` ("owner/name").
 * Title, description, tags and README are filled in from GitHub at build time;
 * any field you write here overrides the GitHub value.
 *
 * Report / poster PDFs: put the file in `public/projects/` and reference it
 * as '/projects/<file>.pdf'.
 */
export interface ProjectEntry {
  /** GitHub repo as "owner/name". Optional for projects not on GitHub. */
  repo?: string;
  title?: string;
  description?: string;
  tags?: string[];
  /** Live demo / website link. */
  href?: string;
  /** Report PDF, e.g. '/projects/my-report.pdf'. */
  report?: string;
  /** Poster PDF, e.g. '/projects/my-poster.pdf'. */
  poster?: string;
  /** Screenshot in /public/images. A gradient is shown if omitted. */
  image?: string;
  /** Featured projects appear on the Home page. */
  featured?: boolean;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  href?: string;
  /** Source-code URL. */
  repoUrl?: string;
  report?: string;
  poster?: string;
  image?: string;
  featured?: boolean;
  stars?: number;
  readmeHtml?: string;
}

const entries: ProjectEntry[] = [
  {
    repo: 'zieberthe/zieberthe.github.io',
    title: 'This Portfolio',
    description: 'The site you are looking at.',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    href: 'https://zieberthe.github.io',
    featured: true,
  },
  // {
  //   repo: 'zieberthe/my-project',
  //   report: '/projects/my-project-report.pdf',
  //   poster: '/projects/my-project-poster.pdf',
  //   featured: true,
  // },
];

const prettify = (name: string) =>
  name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function load(entry: ProjectEntry): Promise<Project> {
  const info = entry.repo ? await getRepo(entry.repo) : null;
  const readmeHtml =
    entry.repo && info ? await getReadmeHtml(entry.repo, info.default_branch) : null;
  const repoName = entry.repo?.split('/')[1];
  const title = entry.title ?? prettify(info?.name ?? repoName ?? 'Untitled');

  return {
    slug: slugify(repoName ?? title),
    title,
    description: entry.description ?? info?.description ?? '',
    tags:
      entry.tags ??
      (info?.topics.length ? info.topics : info?.language ? [info.language] : []),
    href: entry.href ?? (info?.homepage || undefined),
    repoUrl: info?.html_url ?? (entry.repo ? `https://github.com/${entry.repo}` : undefined),
    report: entry.report,
    poster: entry.poster,
    image: entry.image,
    featured: entry.featured,
    stars: info?.stargazers_count,
    readmeHtml: readmeHtml ?? undefined,
  };
}

export const projects: Project[] = await Promise.all(entries.map(load));
