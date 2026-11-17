import fs from 'node:fs';
import path from 'node:path';
import { getRepo, getReadmeHtml } from '../lib/github';

/**
 * Projects shown on the Home page (featured) and the Projects page (all).
 *
 * To add a GitHub project, add an entry with its `repo` ("owner/name").
 * Title, description, tags and README are filled in from GitHub at build time;
 * any field you write here overrides the GitHub value.
 *
 * Report / poster PDFs: drop them into the project's folder,
 * `public/projects/<slug>/` (slug = the end of the project page URL, e.g. `lipreader`).
 * A PDF whose filename contains "poster" becomes the poster; any other PDF the report.
 * An image (cover.png/jpg/webp/…) becomes the card picture and the project page banner.
 * No code change needed.
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
  /** Card image. Normally auto-detected from the project folder; a gradient is shown if none. */
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
  { repo: 'ZieBerthe/LipReader', featured: true },
  { repo: 'ZieBerthe/SigBERT_MIMIC', featured: true },
  { repo: 'ZieBerthe/P3gproject' },
  { repo: 'ZieBerthe/Nba-teams-visualization' },
  { repo: 'ZieBerthe/my-chatbot-mistralapi' },
  { repo: 'ZieBerthe/finger-counter-opencv' },
];

const prettify = (name: string) =>
  name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const PDF_ROOT = path.join(process.cwd(), 'public', 'projects');

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg)$/i;

/** Finds report/poster PDFs and a card image in public/projects/<slug>/. */
function findFiles(slug: string): { report?: string; poster?: string; image?: string } {
  const dir = path.join(PDF_ROOT, slug);
  if (!fs.existsSync(dir)) return {};
  const files = fs.readdirSync(dir).sort();
  const url = (f: string) => `/projects/${slug}/${encodeURIComponent(f)}`;

  const pdfs = files.filter((f) => f.toLowerCase().endsWith('.pdf'));
  const posters = pdfs.filter((f) => /poster/i.test(f));
  const reports = pdfs.filter((f) => !/poster/i.test(f));
  if (reports.length > 1)
    console.warn(`[projects] ${slug}: several report PDFs, using "${reports[0]}"`);
  if (posters.length > 1)
    console.warn(`[projects] ${slug}: several poster PDFs, using "${posters[0]}"`);

  const images = files.filter((f) => IMAGE_EXT.test(f));
  const cover = images.find((f) => /^cover\./i.test(f));
  if (!cover && images.length > 1)
    console.warn(`[projects] ${slug}: several images, using "${images[0]}" (name one "cover" to choose)`);
  const image = cover ?? images[0];

  return {
    report: reports[0] && url(reports[0]),
    poster: posters[0] && url(posters[0]),
    image: image && url(image),
  };
}

/** First README paragraph as plain text, for repos with no "About" description. */
function firstParagraph(html: string | null): string {
  if (!html) return '';
  for (const [, inner] of html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)) {
    const text = inner
      .replace(/<[^>]+>/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\s+/g, ' ')
      .trim();
    if (text.length >= 20) return text.length > 160 ? text.slice(0, 157).trimEnd() + '…' : text;
  }
  return '';
}

async function load(entry: ProjectEntry): Promise<Project> {
  const info = entry.repo ? await getRepo(entry.repo) : null;
  const readmeHtml =
    entry.repo && info ? await getReadmeHtml(entry.repo, info.default_branch) : null;
  const repoName = entry.repo?.split('/')[1];
  const title = entry.title ?? prettify(info?.name ?? repoName ?? 'Untitled');
  const slug = slugify(repoName ?? title);
  const files = findFiles(slug);

  return {
    slug,
    title,
    description: entry.description || info?.description || firstParagraph(readmeHtml),
    tags:
      entry.tags ??
      (info?.topics.length ? info.topics : info?.language ? [info.language] : []),
    href: entry.href ?? (info?.homepage || undefined),
    repoUrl: info?.html_url ?? (entry.repo ? `https://github.com/${entry.repo}` : undefined),
    report: entry.report ?? files.report,
    poster: entry.poster ?? files.poster,
    image: entry.image ?? files.image,
    featured: entry.featured,
    stars: info?.stargazers_count,
    readmeHtml: readmeHtml ?? undefined,
  };
}

export const projects: Project[] = await Promise.all(entries.map(load));

// Warn about PDF folders that don't belong to any project (e.g. a typo in the name).
if (fs.existsSync(PDF_ROOT)) {
  const slugs = new Set(projects.map((p) => p.slug));
  for (const d of fs.readdirSync(PDF_ROOT, { withFileTypes: true })) {
    if (d.isDirectory() && !slugs.has(d.name))
      console.warn(`[projects] public/projects/${d.name}/ doesn't match any project — check the folder name`);
  }
}
