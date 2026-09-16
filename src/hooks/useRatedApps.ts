import { useNostr } from '@nostrify/react';
import { useQuery } from '@tanstack/react-query';
import type { NostrFilter } from '@nostrify/nostrify';
import { APP_HANDLER_KIND, dedupeAppEvents, type AppInfo } from '@/lib/apps';
import type { ReviewReport } from '@/lib/appReviews';
import { parseAddress } from '@/lib/matrix';

/**
 * Fetch the kind 31990 listings behind a set of reviews. Addresses are grouped
 * by publisher so every filter is author-scoped (the `d` tag alone is not a
 * trust boundary), and all filters go out in one request.
 */
export function useRatedApps(reviews: ReviewReport[] | undefined) {
  const { nostr } = useNostr();

  const addresses = Array.from(new Set((reviews ?? []).map((r) => r.appAddress))).sort();

  return useQuery<AppInfo[]>({
    queryKey: ['rated-apps', addresses],
    queryFn: async ({ signal }) => {
      const byPubkey = new Map<string, Set<string>>();
      for (const address of addresses) {
        const parsed = parseAddress(address);
        if (!parsed) continue;
        const ds = byPubkey.get(parsed.pubkey) ?? new Set<string>();
        ds.add(parsed.identifier);
        byPubkey.set(parsed.pubkey, ds);
      }
      if (byPubkey.size === 0) return [];

      const filters: NostrFilter[] = Array.from(byPubkey, ([pubkey, ds]) => ({
        kinds: [APP_HANDLER_KIND],
        authors: [pubkey],
        '#d': Array.from(ds),
        limit: ds.size * 3,
      }));

      const events = await nostr.query(filters, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(10000)]),
      });
      return dedupeAppEvents(events);
    },
    enabled: addresses.length > 0,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}

/**
 * Fetch a single app listing by its (pubkey, d-tag) address. The author filter
 * is mandatory for addressable events.
 */
export function useApp(pubkey: string | undefined, identifier: string | undefined) {
  const { nostr } = useNostr();

  return useQuery<AppInfo | null>({
    queryKey: ['app', pubkey ?? '', identifier ?? ''],
    queryFn: async ({ signal }) => {
      const events = await nostr.query(
        [{ kinds: [APP_HANDLER_KIND], authors: [pubkey!], '#d': [identifier!], limit: 5 }],
        { signal: AbortSignal.any([signal, AbortSignal.timeout(8000)]) },
      );
      return dedupeAppEvents(events)[0] ?? null;
    },
    enabled: Boolean(pubkey && identifier),
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
}
