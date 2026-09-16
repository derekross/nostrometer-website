import { describe, expect, it } from 'vitest';
import { combine } from './useReviews';
import { snapshotToReviews } from '@/lib/reviews';
import type { RatingsData, RatingSnapshot } from '@/lib/staticData';
import type { ReviewReport } from '@/lib/appReviews';

const DEV = 'a'.repeat(64);
const RATER = 'b'.repeat(64);
const ADDR = `31990:${DEV}:app`;

function row(over: Partial<RatingSnapshot> = {}): RatingSnapshot {
  return { id: 'snap', pubkey: RATER, created_at: 100, address: ADDR, nip: 'nip-17', rating: 0.6, content: '', ...over };
}

const snapshot: { data?: RatingsData; isLoading: boolean } = {
  data: { crawled_at: '2026-09-16T00:45:23+00:00', count: 2, ratings: [row(), row({ id: 'snap2', nip: 'nip-01' })] },
  isLoading: false,
};

function liveQuery(over: Partial<{ data: ReviewReport[]; isError: boolean; isFetching: boolean; isLoading: boolean }> = {}) {
  return { data: undefined, isLoading: false, isError: false, isFetching: false, refetch: () => undefined, ...over };
}

describe('combine', () => {
  it('merges the snapshot under the live read by default', () => {
    const live = liveQuery({ data: snapshotToReviews([row({ id: 'live', nip: 'nip-25' })]) });
    const result = combine(live, snapshot);
    expect(result.reviews?.map((r) => r.nip).sort()).toEqual(['nip-01', 'nip-17', 'nip-25']);
    expect(result.snapshotCount).toBe(2);
    expect(result.liveOnly).toBe(false);
  });

  it('drops the snapshot when liveOnly is set, but still reports its size', () => {
    const live = liveQuery({ data: snapshotToReviews([row({ id: 'live', nip: 'nip-25' })]) });
    const result = combine(live, snapshot, { liveOnly: true });
    expect(result.reviews?.map((r) => r.nip)).toEqual(['nip-25']);
    expect(result.snapshotCount).toBe(2);
    expect(result.liveOnly).toBe(true);
  });

  it('falls back to the snapshot when the relays fail', () => {
    const result = combine(liveQuery({ isError: true }), snapshot);
    expect(result.isError).toBe(false);
    expect(result.liveFailed).toBe(true);
    expect(result.reviews).toHaveLength(2);
  });

  it('errors when the relays fail and there is no floor', () => {
    const result = combine(liveQuery({ isError: true }), snapshot, { liveOnly: true });
    expect(result.isError).toBe(true);
    expect(result.liveFailed).toBe(false);
  });

  it('applies the per-app filter to the snapshot', () => {
    const other = `31990:${DEV}:other`;
    const snap: typeof snapshot = {
      data: { crawled_at: null, count: 2, ratings: [row(), row({ id: 'x', address: other })] },
      isLoading: false,
    };
    const result = combine(liveQuery(), snap, { filter: (r) => r.appAddress === ADDR });
    expect(result.reviews).toHaveLength(1);
    expect(result.snapshotCount).toBe(1);
  });
});
