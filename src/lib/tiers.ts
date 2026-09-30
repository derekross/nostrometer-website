import type { CompatTier } from '@/lib/appReviews';

/** One letter per tier; chips always carry it so colour is never the only signal. */
export const TIER_LETTER: Record<CompatTier, string> = {
  flawless: 'F',
  incomplete: 'I',
  isolated: 'S',
  borked: 'B',
};

/**
 * A 0..1 rating as the whole number people see, 0..100.
 *
 * Truncated rather than rounded so the number never contradicts its tier: the
 * thresholds sit on whole numbers (25, 50, 75), so a mean of 0.747 reads 74
 * Incomplete rather than 75 Incomplete. The epsilon absorbs float drift, so a
 * mean that should be exactly 0.3 but lands at 0.29999… still reads 30.
 */
export function formatScore(rating: number): number {
  return Math.floor(Math.min(1, Math.max(0, rating)) * 100 + 1e-9);
}
