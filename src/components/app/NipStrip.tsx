import { TierCell } from '@/components/matrix/TierCell';
import { TIER_ORDER, TRACKED_NIPS, aggregateReviews, type ReviewReport } from '@/lib/appReviews';
import type { MatrixCell } from '@/lib/matrix';
import { nipShort } from '@/lib/nips';
import { TIER_LETTER } from '@/lib/tiers';

interface NipStripProps {
  reviews: ReviewReport[];
  appPubkey: string;
  claimed: Set<string>;
  appName: string;
}

/** Every tracked NIP as one chip, so the whole row is visible before scrolling. */
export function NipStrip({ reviews, appPubkey, claimed, appName }: NipStripProps) {
  const { perNip } = aggregateReviews(reviews);
  const cells = new Map<string, MatrixCell>();
  const byNip = new Map<string, Set<string>>();
  for (const r of reviews) {
    const set = byNip.get(r.nip) ?? new Set<string>();
    set.add(r.authorPubkey);
    byNip.set(r.nip, set);
  }
  for (const [nip, agg] of perNip) {
    const raters = byNip.get(nip) ?? new Set<string>();
    cells.set(nip, { tier: agg.tier, rating: agg.rating, raters: raters.size, selfOnly: [...raters].every((pk) => pk === appPubkey) });
  }
  const counts = TIER_ORDER.map((t) => [t, [...cells.values()].filter((c) => c.tier === t).length] as const).filter(([, n]) => n > 0);
  const selfOnly = [...cells.values()].filter((c) => c.selfOnly).length;

  return (
    <div className="rounded-md border bg-card p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="eyebrow">At a glance · {TRACKED_NIPS.length} NIPs</h2>
        <p className="font-mono text-xs text-muted-foreground tabular-nums">
          {counts.map(([t, n]) => `${n} ${TIER_LETTER[t]}`).join(' · ')}
          {selfOnly > 0 && ` · ${selfOnly} self-rated`}
        </p>
      </div>
      <div className="mt-4 grid grid-cols-6 gap-x-1 gap-y-2 sm:grid-cols-10 lg:grid-cols-15">
        {TRACKED_NIPS.map((n) => (
          <a key={n.id} href={`#${n.id}`} className="flex flex-col items-center gap-1 rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50">
            <span className="font-mono text-[10px] text-muted-foreground">{nipShort(n.id)}</span>
            <TierCell cell={cells.get(n.id)} claimed={claimed.has(n.id)} nipId={n.id} appName={appName} />
          </a>
        ))}
      </div>
    </div>
  );
}
