# zieberthe.github.io

My personal portfolio — profile, CV, projects, and posts. Built with
[Astro](https://astro.build) + [Tailwind CSS](https://tailwindcss.com) and deployed to
GitHub Pages. Live at **https://zieberthe.github.io**.

The homepage features an interactive "function being learned" animation: a small model fits
a curve to data points via gradient descent. Click to add points, drag to move them, and
watch it re-learn.

## Develop locally

```bash
npm install      # first time only
npm run dev      # start dev server at http://localhost:4321
npm run build    # production build into dist/
npm run preview  # preview the production build locally
```

Requires Node.js 18+.

## Make it yours

| What | Where |
| --- | --- |
| Name, role, intro, social links, CV path, skills | `src/site.config.ts` |
| Accent color, fonts, article styling | `src/styles/global.css` (`--color-accent`) |
| CV content (experience, education) | `src/pages/cv.astro` |
| Downloadable CV PDF | replace `public/cv/zie-berthe-cv.pdf` |
| Projects (list of GitHub repos + PDFs) | `src/data/projects.ts` |
| Avatar / social-share image | `public/images/` (swap `og.svg` for a 1200×630 PNG) |
| Hero animation behaviour | `src/scripts/learning-curve.ts` |

## Add a project

1. (Optional) Put the report and/or poster PDF in `public/projects/`.
2. Add an entry to `entries` in `src/data/projects.ts`:

```ts
{
  repo: 'zieberthe/my-project',               // GitHub repo
  report: '/projects/my-project-report.pdf',  // optional
  poster: '/projects/my-project-poster.pdf',  // optional
  featured: true,                             // optional: show on the Home page
}
```

Title, description, tags and the README are pulled from GitHub when the site is built
(write `title`, `description` or `tags` yourself to override them). The project gets its own
page at `/projects/my-project` with the README, a GitHub link and the PDFs.

## Add a post

Create a Markdown file in `src/content/posts/`, e.g. `my-post.md`:

```markdown
---
title: 'My post title'
description: 'A one-line summary shown in listings and previews.'
date: 2026-07-02
tags: ['machine-learning']
draft: false
---

Your content here…
```

The post appears automatically at `/posts/my-post`. Set `draft: true` to hide it from the
production build.

**PDF posts** (e.g. an article written in LaTeX): put the PDF in `public/posts/` and add
`pdf: '/posts/my-article.pdf'` to the frontmatter. The page shows any Markdown text you write,
then the PDF with open/download buttons.

## Deployment

Pushing to `main` triggers the workflow in `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment** and
set **Source** to **GitHub Actions**.
