import { describe, expect, it } from 'vitest';
import { mergeReviews, snapshotToReview, snapshotToReviews } from './reviews';
import type { RatingSnapshot } from './staticData';

const DEV = 'a'.repeat(64);
const RATER = 'b'.repeat(64);
const ADDR = `31990:${DEV}:app`;

function row(over: Partial<RatingSnapshot> = {}): RatingSnapshot {
  return { id: 'id1', pubkey: RATER, created_at: 100, address: ADDR, nip: 'nip-17', rating: 0.6, content: 'note', ...over };
}

describe('snapshotToReview', () => {
  it('rebuilds a parseable report with tier and address', () => {
    const r = snapshotToReview(row());
    expect(r?.appAddress).toBe(ADDR);
    expect(r?.nip).toBe('nip-17');
    expect(r?.tier).toBe('incomplete');
    expect(r?.authorPubkey).toBe(RATER);
    expect(r?.content).toBe('note');
  });
  it('drops rows with an invalid rating', () => {
    expect(snapshotToReview(row({ rating: 7 }))).toBeNull();
    expect(snapshotToReviews([row(), row({ id: 'x', rating: -1 })])).toHaveLength(1);
  });
});

describe('mergeReviews', () => {
  it('keeps the newest revision per rater+app+nip regardless of source order', () => {
    const old = snapshotToReview(row({ id: 'old', created_at: 100, rating: 0.3 }))!;
    const fresh = snapshotToReview(row({ id: 'new', created_at: 200, rating: 1.0 }))!;
    expect(mergeReviews([old], [fresh]).map((r) => r.event.id)).toEqual(['new']);
    expect(mergeReviews([fresh], [old]).map((r) => r.event.id)).toEqual(['new']);
  });
  it('unions ratings that only one source has and tolerates undefined', () => {
    const a = snapshotToReview(row({ id: 'a', nip: 'nip-01' }))!;
    const b = snapshotToReview(row({ id: 'b', nip: 'nip-02', created_at: 300 }))!;
    const merged = mergeReviews([a], undefined, [b]);
    expect(merged.map((r) => r.event.id)).toEqual(['b', 'a']);
  });
});
