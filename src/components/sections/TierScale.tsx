import { TIER_ORDER, TIERS, type CompatTier } from '@/lib/appReviews';
import { TIER_LETTER } from '@/lib/tiers';

/** What each tier means in practice, from the hands-on test rubric. */
const TIER_DETAIL: Record<CompatTier, string> = {
  flawless: 'The full round trip works and the result renders and behaves correctly in other clients.',
  incomplete: 'The common cases work but something is missing: it renders what it receives but cannot compose it, or drops metadata other clients rely on.',
  isolated: 'It functions only inside the app. Other clients do not see the result, or see it wrong.',
  borked: 'The app fails or crashes on the NIP\u2019s basic events. Never used for a feature that is simply absent.',
};

/** The four tiers, their values and their thresholds. */
export function TierScale() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {TIER_ORDER.map((tier) => {
        const t = TIERS[tier];
        return (
          <div key={tier} className="rounded-md border bg-card p-6">
            <div className="flex items-center gap-3">
              <span data-tier={tier} className="tier-chip inline-flex h-8 w-10 items-center justify-center rounded-md text-lg leading-none" aria-hidden="true">
                {TIER_LETTER[tier]}
              </span>
              <div>
                <p className="text-lg font-bold leading-6">{t.label}</p>
                <p className="font-mono text-sm text-muted-foreground tabular-nums">{t.ratingValue.toFixed(1)}</p>
              </div>
            </div>
            <p className="mt-4 text-base leading-6 text-muted-foreground">{TIER_DETAIL[tier]}</p>
          </div>
        );
      })}
    </div>
  );
}
