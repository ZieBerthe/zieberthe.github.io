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

Add an entry to `entries` in `src/data/projects.ts`:

```ts
{ repo: 'ZieBerthe/my-project', featured: true }   // featured = also shown on Home
```

Title, description, tags and the README are pulled from GitHub when the site is built
(write `title`, `description` or `tags` yourself to override them). The project gets its own
page at `/projects/my-project`. If the repo has no "About" description, the README's first
paragraph is used.

**Report / poster PDFs:** each project has a folder in `public/projects/` named after its page
URL (e.g. `public/projects/lipreader/`). Drop the PDF in and push — a filename containing
`poster` is shown as the poster, any other PDF as the report. For a new project, create its
folder yourself; the build warns if a folder name doesn't match any project.

**Card image:** put an image in the same folder (`cover.png`, `.jpg`, `.webp`, `.gif` or
`.svg`) and push. It replaces the blank at the top of the card and is shown as a banner on the
project page. If there are several images, the one named `cover` is used. Wide 16:9 images
(e.g. 1280×720, under ~500 KB) look best.

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

The workflow in `.github/workflows/deploy.yml` builds the site and publishes it to GitHub
Pages. It runs:

- on every push to `main`;
- once a day (05:00 UTC), so README edits in project repos show up within 24 h;
- on demand: **Actions → Deploy to GitHub Pages → Run workflow**.

GitHub pauses scheduled runs after 60 days without a push to this repo (it emails you).
The site stays online; push anything or click **Enable workflow** in the Actions tab to resume.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment** and
set **Source** to **GitHub Actions**.
