import { useMemo } from 'react';
import { useRatedApps } from '@/hooks/useRatedApps';
import { useReviews } from '@/hooks/useReviews';
import { useClaimed, useMetrics } from '@/hooks/useStaticData';
import { buildMatrix, type MatrixRow } from '@/lib/matrix';

/**
 * Reviews × listings × static usage data → matrix rows. Reviews are the crawl
 * snapshot unioned with a live relay read, so rows appear as soon as the
 * snapshot loads and only ever gain ratings as relays answer. Listing names
 * and MAU fill in when their queries resolve; the static files degrade to `?`
 * and listings degrade to the d-tag.
 */
export function useMatrix() {
  const reviews = useReviews();
  const apps = useRatedApps(reviews.reviews);
  const metrics = useMetrics();
  const claimed = useClaimed();

  const rows: MatrixRow[] | undefined = useMemo(() => {
    if (!reviews.reviews) return undefined;
    return buildMatrix(reviews.reviews, apps.data ?? [], metrics.data, claimed.data);
  }, [reviews.reviews, apps.data, metrics.data, claimed.data]);

  return {
    rows,
    reviews: reviews.reviews,
    metrics: metrics.data,
    claimed: claimed.data,
    isLoading: reviews.isLoading,
    isError: reviews.isError,
    liveFailed: reviews.liveFailed,
    isLive: reviews.isLive || apps.isFetching,
    liveCount: reviews.liveCount,
    snapshotCount: reviews.snapshotCount,
    snapshotDate: reviews.snapshotDate,
    refetch: reviews.refetch,
  };
}
