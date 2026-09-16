import path from "node:path";
import process from "node:process";

import prerender from "@prerenderer/rollup-plugin";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

import { fetchDynamicRoutes, type DynamicRoute } from "./tools/seo/fetch.ts";
import { STATIC_ROUTES, prerenderIndexFix, seoPlugin } from "./tools/seo/plugin.ts";

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // Only reach out to relays for the prerendered production build. Dev, test
  // and plain builds get static routes only; pages still load live data.
  let dynamic: DynamicRoute[] = [];
  if (process.env.PRERENDER) {
    try {
      dynamic = await fetchDynamicRoutes();
      console.log(`[seo] discovered ${dynamic.length} dynamic routes for prerender + sitemap`);
    } catch (err) {
      console.warn("[seo] route discovery failed; prerendering static routes only", err);
    }
  }

  let homeHtml: string | undefined;

  return {
    server: {
      host: "::",
      port: 8080,
    },
    build: {
      // Never inline assets as data: URIs; the CSP only allows fonts from 'self'.
      assetsInlineLimit: 0,
    },
    plugins: [
      react(),
      tailwindcss(),
      process.env.PRERENDER
        ? prerender({
            routes: [...STATIC_ROUTES, ...dynamic.map((r) => r.path)],
            renderer: "@prerenderer/renderer-puppeteer",
            postProcess(route) {
              if (route.route === "/") homeHtml = route.html;
            },
            rendererOptions: {
              // Lazy route chunks + relay round-trips: wait before snapshotting.
              renderAfterTime: 4000,
              maxConcurrentRoutes: 4,
              launchOptions: { args: ["--no-sandbox", "--disable-setuid-sandbox"] },
            },
          })
        : null,
      seoPlugin(dynamic),
      process.env.PRERENDER ? prerenderIndexFix(() => homeHtml) : null,
    ],
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      exclude: [
        '**/node_modules/**',
        '**/dist/**',
        '**/{vite,eslint}.config.*',
        '.agents/**',
      ],
      onConsoleLog(log) {
        return !log.includes("React Router Future Flag Warning");
      },
      env: {
        DEBUG_PRINT_LIMIT: '0', // Suppress DOM output that exceeds AI context windows
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
  };
});
