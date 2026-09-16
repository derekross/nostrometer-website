/**
 * Build-time route discovery for the prerendered production build. Reads the
 * same relays the site uses and returns the dynamic routes worth snapshotting:
 * one per rated app listing and one per update article. Best effort: any
 * failure yields an empty list and the build proceeds with static routes.
 */
import { SimplePool } from 'nostr-tools/pool';
import { nip19 } from 'nostr-tools';
import type { NostrEvent } from '@nostrify/nostrify';
import { RELAY_URLS } from '../../src/lib/appRelays.ts';
import { APP_HANDLER_KIND } from '../../src/lib/apps.ts';
import { DEREK_PUBKEY_HEX, UPDATES_TAG } from '../../src/lib/site.ts';

const ARTICLE_KIND = 30023;
// Mirrors src/lib/appReviews.ts, which cannot be imported here: it uses the
// `@/` alias that is not resolvable while Vite loads its own config.
const APP_REVIEW_KIND = 31986;
const REVIEW_LABEL = 'nip-compatibility';

export interface DynamicRoute {
  path: string;
  /** ISO date (YYYY-MM-DD) for the sitemap. */
  lastmod?: string;
}

function isoDate(seconds: number): string {
  return new Date(seconds * 1000).toISOString().slice(0, 10);
}

function parseAddress(address: string): { pubkey: string; identifier: string } | null {
  const [kind, pubkey, ...rest] = address.split(':');
  if (kind !== String(APP_HANDLER_KIND) || !/^[0-9a-f]{64}$/.test(pubkey ?? '')) return null;
  return { pubkey, identifier: rest.join(':') };
}

export async function fetchDynamicRoutes(): Promise<DynamicRoute[]> {
  const pool = new SimplePool();
  try {
    const [reviews, articles] = await Promise.all([
      pool.querySync(RELAY_URLS, { kinds: [APP_REVIEW_KIND], '#l': [REVIEW_LABEL], limit: 1000 }, { maxWait: 10_000 }),
      pool.querySync(RELAY_URLS, { kinds: [ARTICLE_KIND], authors: [DEREK_PUBKEY_HEX], '#t': [UPDATES_TAG], limit: 100 }, { maxWait: 10_000 }),
    ]);

    const apps = new Map<string, number>();
    for (const e of reviews as NostrEvent[]) {
      const a = e.tags.find(([n, v]) => n === 'a' && v?.startsWith(`${APP_HANDLER_KIND}:`))?.[1];
      if (!a) continue;
      const parsed = parseAddress(a);
      if (!parsed) continue;
      const naddr = nip19.naddrEncode({ kind: APP_HANDLER_KIND, ...parsed });
      apps.set(naddr, Math.max(apps.get(naddr) ?? 0, e.created_at));
    }

    const updates = new Map<string, number>();
    for (const e of articles as NostrEvent[]) {
      if (e.pubkey !== DEREK_PUBKEY_HEX) continue;
      const d = e.tags.find(([n]) => n === 'd')?.[1];
      const title = e.tags.find(([n]) => n === 'title')?.[1];
      if (!d || !title || !e.content.trim()) continue;
      const naddr = nip19.naddrEncode({ kind: ARTICLE_KIND, pubkey: e.pubkey, identifier: d });
      updates.set(naddr, Math.max(updates.get(naddr) ?? 0, e.created_at));
    }

    return [
      ...Array.from(apps, ([naddr, ts]) => ({ path: `/app/${naddr}`, lastmod: isoDate(ts) })),
      ...Array.from(updates, ([naddr, ts]) => ({ path: `/updates/${naddr}`, lastmod: isoDate(ts) })),
    ];
  } finally {
    pool.close(RELAY_URLS);
  }
}
