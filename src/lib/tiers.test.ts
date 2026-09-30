import { describe, expect, it } from 'vitest';
import { ratingToTier, TIERS, TIER_ORDER } from '@/lib/appReviews';
import { formatScore } from '@/lib/tiers';

describe('formatScore', () => {
  it('shows each tier value as a whole number', () => {
    expect(TIER_ORDER.map((t) => formatScore(TIERS[t].ratingValue))).toEqual([100, 60, 30, 10]);
  });

  it('never reads a threshold its tier has not reached', () => {
    expect(formatScore(0.747)).toBe(74);
    expect(ratingToTier(0.747)).toBe('incomplete');
    expect(formatScore(0.75)).toBe(75);
  });

  it('absorbs float drift in means', () => {
    expect(formatScore((0.1 + 0.2 + 0.6) / 3)).toBe(30);
    expect(formatScore(0.29 + 0.01)).toBe(30);
  });

  it('clamps out-of-range input', () => {
    expect(formatScore(-0.2)).toBe(0);
    expect(formatScore(1.4)).toBe(100);
  });
});
