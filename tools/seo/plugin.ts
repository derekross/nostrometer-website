/**
 * Vite plugin that emits sitemap.xml into dist/ for the static pages plus any
 * dynamic routes discovered at build time (see fetch.ts).
 */
import type { Plugin } from 'vite';
import { SITE_URL } from '../../src/lib/site.ts';
import type { DynamicRoute } from './fetch.ts';

export const STATIC_ROUTES = ['/', '/results', '/methodology', '/developers', '/updates', '/about', '/privacy'];

/**
 * Prerendered so dist/404.html is a real "not found" document rather than a
 * copy of the home page. The router resolves any unknown path to NotFound, so
 * this renders that. Kept out of STATIC_ROUTES: it must never reach the
 * sitemap, and its own output file is discarded.
 */
export const NOT_FOUND_ROUTE = '/__404__';

/**
 * Strip references to the prerender server's own origin.
 *
 * React injects <link rel="modulepreload"> for each lazy route chunk at
 * runtime, and the snapshot captures them with the prerenderer's absolute
 * origin (http://127.0.0.1:<port>/...). Shipped as-is they are two failed
 * requests and a Content-Security-Policy violation on every prerendered page.
 * The build's own relative preloads are already in the document, so these are
 * pure waste and can go.
 */
export function stripPrerenderOrigin(html: string): string {
  return html
    .replace(/<link\b[^>]*\bhref=["']https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/[^"']*["'][^>]*>/gi, '')
    .replace(/<script\b[^>]*\bsrc=["']https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/[^"']*["'][^>]*><\/script>/gi, '');
}

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

interface HtmlFixOptions {
  /** Rendered `/`, captured in postProcess. Undefined on a non-prerendered build. */
  home: () => string | undefined;
  /** Rendered NotFound page, captured the same way. */
  notFound: () => string | undefined;
  outDir?: string;
}

/**
 * Writes the two HTML files the bundler will not produce correctly on its own.
 *
 * `index.html`: the prerender plugin deletes the entry from the bundle and
 * re-emits the rendered `/` route under the same name; on Vite 8 that re-emit
 * is dropped and dist/ ends up with no root index.html.
 *
 * `404.html`: the build used to `cp dist/index.html dist/404.html`, which on a
 * prerendered build made the 404 document a copy of the fully rendered home
 * page, carrying the home page's title, description and og:url. Prefer the
 * prerendered NotFound; fall back to the shell so a plain build still gets a
 * usable file.
 */
export function prerenderHtmlFix({ home, notFound, outDir = 'dist' }: HtmlFixOptions): Plugin {
  return {
    name: 'nostrometer-html-fix',
    apply: 'build',
    enforce: 'post',
    async closeBundle() {
      const fs = await import('node:fs');
      const index = `${outDir}/index.html`;

      const homeHtml = home();
      if (homeHtml && !fs.existsSync(index)) fs.writeFileSync(index, homeHtml.trim());

      const notFoundHtml = notFound();
      if (notFoundHtml) {
        fs.writeFileSync(`${outDir}/404.html`, notFoundHtml.trim());
      } else if (fs.existsSync(index)) {
        fs.copyFileSync(index, `${outDir}/404.html`);
      }
    },
  };
}
