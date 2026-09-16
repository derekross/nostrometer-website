import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAllAppReviews, useAppReviews } from '@/hooks/useAllAppReviews';
import { useAppContext } from '@/hooks/useAppContext';
import { fetchRatings, type RatingsData } from '@/lib/staticData';
import { mergeReviews, snapshotToReviews } from '@/lib/reviews';
import type { ReviewReport } from '@/lib/appReviews';

/** /data/ratings.json — the last crawl's ratings, the floor for every view. */
export function useRatingsSnapshot() {
  return useQuery<RatingsData>({
    queryKey: ['static', 'ratings'],
    queryFn: ({ signal }) => fetchRatings(signal),
    staleTime: Infinity,
    retry: 1,
  });
}

export interface ReviewsResult {
  /** Snapshot ∪ live, newest revision per rater+app+NIP. Undefined until either source has answered. */
  reviews: ReviewReport[] | undefined;
  /** Neither source has answered yet. */
  isLoading: boolean;
  /** Live relays failed and there is no snapshot to fall back on. */
  isError: boolean;
  /** Live relays failed; what is shown comes from the snapshot alone. */
  liveFailed: boolean;
  /** Live relays are still being read; rows may still gain ratings. */
  isLive: boolean;
  liveCount: number;
  /** Ratings in the crawl snapshot, whether or not they are being shown. */
  snapshotCount: number;
  snapshotDate: string | null;
  /** The snapshot floor is switched off; what is shown came from relays alone. */
  liveOnly: boolean;
  refetch: () => void;
}

interface LiveQuery {
  data?: ReviewReport[];
  isLoading: boolean;
  isError: boolean;
  isFetching: boolean;
  refetch: () => unknown;
}

/**
 * Fold the crawl snapshot and the live relay read into one set of reports.
 *
 * `liveOnly` drops the snapshot, so the view shows exactly what the configured
 * relays returned. That is the point of the relay picker: without it a dead
 * relay set still renders the full snapshot and nothing appears to change.
 */
export function combine(
  live: LiveQuery,
  snapshot: { data?: RatingsData; isLoading: boolean },
  options: { filter?: (r: ReviewReport) => boolean; liveOnly?: boolean } = {},
): ReviewsResult {
  const { filter, liveOnly = false } = options;
  const snapReviews = snapshot.data ? snapshotToReviews(snapshot.data.ratings) : undefined;
  const filtered = filter && snapReviews ? snapReviews.filter(filter) : snapReviews;
  const floor = liveOnly ? undefined : filtered;
  const haveAny = live.data !== undefined || floor !== undefined;
  const reviews = haveAny ? mergeReviews(floor, live.data) : undefined;
  const floorHasData = (floor?.length ?? 0) > 0;
  return {
    reviews,
    isLoading: liveOnly ? live.isLoading : live.isLoading && snapshot.isLoading,
    isError: live.isError && !floorHasData,
    liveFailed: live.isError && floorHasData,
    isLive: live.isFetching,
    liveCount: live.data?.length ?? 0,
    snapshotCount: filtered?.length ?? 0,
    snapshotDate: snapshot.data?.crawled_at ?? null,
    liveOnly,
    refetch: () => void live.refetch(),
  };
}

/** Every rating, snapshot ∪ live. */
export function useReviews(): ReviewsResult {
  const live = useAllAppReviews();
  const snapshot = useRatingsSnapshot();
  const { config } = useAppContext();
  const liveOnly = config.liveOnly;
  return useMemo(() => combine(live, snapshot, { liveOnly }), [live, snapshot, liveOnly]);
}

/** Ratings for one listing address, snapshot ∪ live. */
export function useReviewsForApp(address: string): ReviewsResult {
  const live = useAppReviews(address);
  const snapshot = useRatingsSnapshot();
  const { config } = useAppContext();
  const liveOnly = config.liveOnly;
  return useMemo(
    () => combine(live, snapshot, { filter: (r) => r.appAddress === address, liveOnly }),
    [live, snapshot, address, liveOnly],
  );
}
