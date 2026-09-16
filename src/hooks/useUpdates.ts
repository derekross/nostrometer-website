import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrEvent } from '@nostrify/nostrify';
import { DEREK_PUBKEY_HEX, UPDATES_TAG } from '@/lib/site';

export const ARTICLE_KIND = 30023;

export function articleTag(event: NostrEvent, name: string): string | undefined {
  return event.tags.find(([n]) => n === name)?.[1];
}

/** Published timestamp (seconds): the `published_at` tag when sane, else created_at. */
export function articlePublishedAt(event: NostrEvent): number {
  const raw = articleTag(event, 'published_at');
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : event.created_at;
}

/** Latest revision per d-tag, titled and non-empty, newest published first. */
export function toArticles(events: NostrEvent[]): NostrEvent[] {
  const latest = new Map<string, NostrEvent>();
  for (const event of events) {
    if (event.kind !== ARTICLE_KIND || event.pubkey !== DEREK_PUBKEY_HEX) continue;
    const d = articleTag(event, 'd') ?? '';
    const prev = latest.get(d);
    if (!prev || event.created_at > prev.created_at) latest.set(d, event);
  }
  return Array.from(latest.values())
    .filter((e) => articleTag(e, 'title') && e.content.trim().length > 0)
    .sort((a, b) => articlePublishedAt(b) - articlePublishedAt(a));
}

/** Derek's kind 30023 articles tagged #nostrometer. */
export function useUpdates() {
  const { nostr } = useNostr();

  return useQuery<NostrEvent[]>({
    queryKey: ['updates', UPDATES_TAG],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [{ kinds: [ARTICLE_KIND], authors: [DEREK_PUBKEY_HEX], '#t': [UPDATES_TAG], limit: 50 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]) },
      );
      return toArticles(events);
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/** One article by d-tag. Only Derek's key is trusted for this feed. */
export function useUpdate(identifier: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<NostrEvent | null>({
    queryKey: ['update', identifier ?? ''],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [{ kinds: [ARTICLE_KIND], authors: [DEREK_PUBKEY_HEX], '#d': [identifier!], limit: 5 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) },
      );
      return toArticles(events)[0] ?? null;
    },
    enabled: !!identifier,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
