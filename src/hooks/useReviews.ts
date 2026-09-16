import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAllAppReviews, useAppReviews } from '@/hooks/useAllAppReviews';
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
  snapshotCount: number;
  snapshotDate: string | null;
  refetch: () => void;
}

function combine(
  live: { data?: ReviewReport[]; isLoading: boolean; isError: boolean; isFetching: boolean; refetch: () => unknown },
  snapshot: { data?: RatingsData; isLoading: boolean },
  filter?: (r: ReviewReport) => boolean,
): ReviewsResult {
  const snapReviews = snapshot.data ? snapshotToReviews(snapshot.data.ratings) : undefined;
  const filtered = filter && snapReviews ? snapReviews.filter(filter) : snapReviews;
  const haveAny = live.data !== undefined || filtered !== undefined;
  const reviews = haveAny ? mergeReviews(filtered, live.data) : undefined;
  const snapshotHasData = (filtered?.length ?? 0) > 0;
  return {
    reviews,
    isLoading: live.isLoading && snapshot.isLoading,
    isError: live.isError && !snapshotHasData,
    liveFailed: live.isError && snapshotHasData,
    isLive: live.isFetching,
    liveCount: live.data?.length ?? 0,
    snapshotCount: filtered?.length ?? 0,
    snapshotDate: snapshot.data?.crawled_at ?? null,
    refetch: () => void live.refetch(),
  };
}

/** Every rating, snapshot ∪ live. */
export function useReviews(): ReviewsResult {
  const live = useAllAppReviews();
  const snapshot = useRatingsSnapshot();
  return useMemo(() => combine(live, snapshot), [live, snapshot]);
}

/** Ratings for one listing address, snapshot ∪ live. */
export function useReviewsForApp(address: string): ReviewsResult {
  const live = useAppReviews(address);
  const snapshot = useRatingsSnapshot();
  return useMemo(() => combine(live, snapshot, (r) => r.appAddress === address), [live, snapshot, address]);
}
