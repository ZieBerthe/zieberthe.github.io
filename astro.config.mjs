// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  // GitHub user site: served from the domain root, so `base` stays '/'.
  site: 'https://zieberthe.github.io',
  base: '/',
  vite: {
    plugins: [tailwindcss()],
  },
});
