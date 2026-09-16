import { RaterRow } from '@/components/app/RaterRow';
import { TierBadge } from '@/components/matrix/TierBadge';
import { TRACKED_NIPS, aggregateReviews, type ReviewReport } from '@/lib/appReviews';

const NIP_NAME = new Map(TRACKED_NIPS.map((n) => [n.id, n]));

interface NipRatingListProps {
  reviews: ReviewReport[];
  appPubkey: string;
  claimed: Set<string>;
}

/** One card per rated NIP: aggregate tier, then every rater's report. */
export function NipRatingList({ reviews, appPubkey, claimed }: NipRatingListProps) {
  const { perNip } = aggregateReviews(reviews);
  const byNip = new Map<string, ReviewReport[]>();
  for (const r of reviews) {
    const list = byNip.get(r.nip) ?? [];
    list.push(r);
    byNip.set(r.nip, list);
  }
  const nips = Array.from(byNip.keys()).sort();
  const claimedOnly = Array.from(claimed).filter((n) => !byNip.has(n)).sort();

  return (
    <div className="space-y-4">
      {nips.map((nip) => {
        const agg = perNip.get(nip);
        const info = NIP_NAME.get(nip);
        const list = byNip.get(nip) ?? [];
        const raters = new Set(list.map((r) => r.authorPubkey));
        const selfOnly = [...raters].every((pk) => pk === appPubkey);
        return (
          <section key={nip} id={nip} className="rounded-md border bg-card p-6" aria-labelledby={`${nip}-title`}>
            <div className="flex flex-wrap items-center gap-3">
              <h3 id={`${nip}-title`} className="font-mono text-lg font-semibold">
                {nip.toUpperCase()}
                {info && <span className="ml-2 font-sans text-base font-normal text-muted-foreground">{info.name}</span>}
              </h3>
              <div className="ml-auto flex items-center gap-2 text-sm text-muted-foreground">
                {agg && <TierBadge tier={agg.tier} />}
                <span className="font-mono tabular-nums">
                  {raters.size} {raters.size === 1 ? 'rater' : 'raters'}
                </span>
                {selfOnly && <span className="rounded-md border border-dashed px-1.5 py-0.5 font-mono text-xs">self-rated only</span>}
                {claimed.has(nip) && <span className="font-mono text-xs">claimed in code</span>}
              </div>
            </div>
            <ul className="mt-3 divide-y">
              {list.map((r) => (
                <RaterRow key={r.event.id} review={r} appPubkey={appPubkey} />
              ))}
            </ul>
          </section>
        );
      })}

      {claimedOnly.length > 0 && (
        <section className="rounded-md border border-dashed bg-card p-6">
          <h3 className="text-lg font-semibold">Claimed in source, not yet rated</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Markers for these NIPs were found in the client's code. Nobody has published a rating for them yet.
          </p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {claimedOnly.map((nip) => (
              <li key={nip} data-state="claimed" className="tier-chip rounded-md px-2 py-0.5 font-mono text-sm">
                {nip.toUpperCase()}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
