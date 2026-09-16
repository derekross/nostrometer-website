/**
 * Vite plugin that emits sitemap.xml into dist/ for the static pages plus any
 * dynamic routes discovered at build time (see fetch.ts).
 */
import type { Plugin } from 'vite';
import { SITE_URL } from '../../src/lib/site.ts';
import type { DynamicRoute } from './fetch.ts';

export const STATIC_ROUTES = ['/', '/results', '/methodology', '/developers', '/updates', '/about'];

function xmlEscape(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

export function buildSitemap(dynamic: DynamicRoute[]): string {
  const entries: DynamicRoute[] = [...STATIC_ROUTES.map((path) => ({ path })), ...dynamic];
  const body = entries
    .map(({ path, lastmod }) => {
      const loc = `${SITE_URL}${path === '/' ? '/' : path}`;
      return `  <url>\n    <loc>${xmlEscape(loc)}</loc>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

export function seoPlugin(dynamic: DynamicRoute[]): Plugin {
  return {
    name: 'nostrometer-seo',
    apply: 'build',
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: buildSitemap(dynamic) });
    },
  };
}

/**
 * The prerender plugin deletes the entry `index.html` from the bundle and
 * re-emits the rendered `/` route under the same file name; on Vite 8 that
 * re-emit is dropped and dist/ ends up without a root index.html. Capture the
 * rendered home page via the prerenderer's postProcess hook (see vite.config)
 * and write it after the bundle has closed if the file is still missing.
 */
export function prerenderIndexFix(getHomeHtml: () => string | undefined, outDir = 'dist'): Plugin {
  return {
    name: 'nostrometer-prerender-index',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const html = getHomeHtml();
      if (!html) return;
      const fs = await import('node:fs');
      const target = `${outDir}/index.html`;
      if (!fs.existsSync(target)) fs.writeFileSync(target, html.trim());
    },
  };
}
