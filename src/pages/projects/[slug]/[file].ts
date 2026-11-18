import type { APIRoute, GetStaticPaths } from 'astro';
import { projects, repoPdfs } from '../../../data/projects';

/** Serves report/poster PDFs that were downloaded from the projects' GitHub repos. */
export const getStaticPaths = (() => {
  void projects; // make sure projects (and so repoPdfs) are loaded
  return [...repoPdfs.keys()].map((key) => {
    const [slug, file] = key.split('/');
    return { params: { slug, file } };
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute = ({ params }) => {
  const bytes = repoPdfs.get(`${params.slug}/${params.file}`);
  if (!bytes) return new Response('Not found', { status: 404 });
  return new Response(bytes, { headers: { 'Content-Type': 'application/pdf' } });
};
