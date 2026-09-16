import { useNostr } from '@nostrify/react';
import { useQueries } from '@tanstack/react-query';
import { APP_REVIEW_KIND, REVIEW_LABEL } from '@/lib/appReviews';

export interface RelayReading {
  /** Ratings the relay returned. */
  count: number;
  /** Round trip in milliseconds. */
  ms: number;
}

const PROBE_TIMEOUT_MS = 5000;

/**
 * Ask each relay, on its own, how many NIP-compatibility ratings it holds.
 *
 * A count separates a relay that answered with nothing (`0`) from one that did
 * not answer at all, which is the distinction that matters when choosing where
 * to read from. Probing opens a connection to the relay that the pool keeps
 * until the page is reloaded; that is the same connection a configured relay
 * would hold anyway.
 */
export function useRelayProbe(urls: string[], enabled: boolean) {
  const { nostr } = useNostr();

  return useQueries({
    queries: urls.map((url) => ({
      queryKey: ['relay-probe', url],
      queryFn: async ({ signal }: { signal: AbortSignal }): Promise<RelayReading> => {
        const started = performance.now();
        const events = await nostr.relay(url).query(
          [{ kinds: [APP_REVIEW_KIND], '#l': [REVIEW_LABEL], limit: 500 }],
          { signal: AbortSignal.any([signal, AbortSignal.timeout(PROBE_TIMEOUT_MS)]) },
        );
        return { count: events.length, ms: Math.round(performance.now() - started) };
      },
      enabled,
      staleTime: 30_000,
      retry: false,
    })),
    combine: (results) => {
      const byUrl = new Map<string, { status: 'reading' | 'ok' | 'error'; reading?: RelayReading }>();
      results.forEach((result, i) => {
        byUrl.set(urls[i], {
          status: result.isPending ? 'reading' : result.isError ? 'error' : 'ok',
          reading: result.data,
        });
      });
      return byUrl;
    },
  });
}
