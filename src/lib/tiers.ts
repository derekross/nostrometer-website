import type { CompatTier } from '@/lib/appReviews';

/** One letter per tier; chips always carry it so colour is never the only signal. */
export const TIER_LETTER: Record<CompatTier, string> = {
  flawless: 'F',
  incomplete: 'I',
  isolated: 'S',
  borked: 'B',
};
