import { useQuery } from '@tanstack/react-query';
import { fetchClaimed, fetchMetrics, type ClaimedData, type MetricsData } from '@/lib/staticData';

/** /data/metrics.json — usage counts keyed by listing address. */
export function useMetrics() {
  return useQuery<MetricsData>({
    queryKey: ['static', 'metrics'],
    queryFn: ({ signal }) => fetchMetrics(signal),
    staleTime: Infinity,
    retry: 1,
  });
}

/** /data/claimed.json — NIPs found in client source, keyed by listing address. */
export function useClaimed() {
  return useQuery<ClaimedData>({
    queryKey: ['static', 'claimed'],
    queryFn: ({ signal }) => fetchClaimed(signal),
    staleTime: Infinity,
    retry: 1,
  });
}
