/**
 * Projects shown on the Home page (featured) and the Projects page (all).
 * Add, remove, or reorder entries here — the pages update automatically.
 */
export interface Project {
  title: string;
  description: string;
  /** Small tech/skill tags shown under the title. */
  tags: string[];
  /** Live demo / project link. Optional. */
  href?: string;
  /** Source-code link. Optional. */
  repo?: string;
  /** Screenshot in /public/images. Optional — a gradient is shown if omitted. */
  image?: string;
  /** Featured projects appear on the Home page. */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    title: 'This Portfolio',
    description:
      'The site you are looking at.',
    tags: ['Astro', 'TypeScript', 'Tailwind CSS'],
    href: 'https://zieberthe.github.io',
    repo: 'https://github.com/zieberthe/zieberthe.github.io',
    featured: true,
  },
];
