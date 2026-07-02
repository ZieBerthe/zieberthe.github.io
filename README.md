# zieberthe.github.io

My personal portfolio — profile, CV, projects, and a blog. Built with
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
| Projects | `src/data/projects.ts` |
| Avatar / social-share image | `public/images/` (swap `og.svg` for a 1200×630 PNG) |
| Hero animation behaviour | `src/scripts/learning-curve.ts` |

## Add a blog post

Create a Markdown file in `src/content/blog/`, e.g. `my-post.md`:

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

The post appears automatically at `/blog/my-post`. Set `draft: true` to hide it from the
production build.

## Deployment

Pushing to `main` triggers the workflow in `.github/workflows/deploy.yml`, which builds the
site and publishes it to GitHub Pages.

**One-time setup:** in the repository, go to **Settings → Pages → Build and deployment** and
set **Source** to **GitHub Actions**.
