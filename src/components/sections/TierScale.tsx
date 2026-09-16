import { TIER_ORDER, TIERS } from '@/lib/appReviews';
import { TIER_LETTER } from '@/lib/tiers';

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
            <p className="mt-4 text-base leading-6 text-muted-foreground">{t.description}</p>
          </div>
        );
      })}
    </div>
  );
}
