/**
 * Build-time helpers that read public repo data from the GitHub REST API.
 * Every function fails soft: on any error it logs a warning and returns null,
 * so a GitHub outage or rate limit never breaks the site build.
 */

const API = 'https://api.github.com';

function headers(accept = 'application/vnd.github+json'): Record<string, string> {
  const h: Record<string, string> = {
    Accept: accept,
    'User-Agent': 'portfolio-site-build',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

export interface RepoInfo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  default_branch: string;
}

/** `repo` is "owner/name". */
export async function getRepo(repo: string): Promise<RepoInfo | null> {
  try {
    const res = await fetch(`${API}/repos/${repo}`, { headers: headers() });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as RepoInfo;
  } catch (err) {
    console.warn(`[github] could not load repo ${repo}: ${err}`);
    return null;
  }
}

/** README rendered to HTML by GitHub, with relative links/images made absolute. */
export async function getReadmeHtml(repo: string, branch: string): Promise<string | null> {
  try {
    const res = await fetch(`${API}/repos/${repo}/readme`, {
      headers: headers('application/vnd.github.html+json'),
    });
    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    return fixLinks(html, repo, branch);
  } catch (err) {
    console.warn(`[github] could not load README for ${repo}: ${err}`);
    return null;
  }
}

const isAbsolute = (url: string) => /^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(url);

function fixLinks(html: string, repo: string, branch: string): string {
  const raw = `https://raw.githubusercontent.com/${repo}/${branch}/`;
  const blob = `https://github.com/${repo}/blob/${branch}/`;
  const clean = (u: string) => u.replace(/^\.\//, '').replace(/^\//, '');

  return (
    html
      // Images → raw file URLs.
      .replace(/(<img\b[^>]*?\ssrc=")([^"]+)"/gi, (m, pre, url) =>
        isAbsolute(url) ? m : `${pre}${raw}${clean(url)}"`
      )
      // Other relative links → GitHub file view.
      .replace(/(<a\b[^>]*?\shref=")([^"]+)"/gi, (m, pre, url) =>
        isAbsolute(url) ? m : `${pre}${blob}${clean(url)}"`
      )
      // GitHub prefixes heading ids with "user-content-"; drop it so #anchors work.
      .replace(/\sid="user-content-/g, ' id="')
  );
}
