import { useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { RaterRow } from '@/components/app/RaterRow';
import { Segmented } from '@/components/Segmented';
import { TierBadge } from '@/components/matrix/TierBadge';
import { TRACKED_NIPS, aggregateReviews, type ReviewReport } from '@/lib/appReviews';
import { nipShort } from '@/lib/nips';
import { cn } from '@/lib/utils';

const NIP_NAME = new Map(TRACKED_NIPS.map((n) => [n.id, n]));

type Filter = 'all' | 'below' | 'self' | 'claimed';

interface NipRatingListProps {
  reviews: ReviewReport[];
  appPubkey: string;
  claimed: Set<string>;
}

interface Row {
  nip: string;
  list: ReviewReport[];
  raters: number;
  selfOnly: boolean;
  claimed: boolean;
}

/** One collapsible row per NIP: aggregate tier, rater count, then every rater's report. */
export function NipRatingList({ reviews, appPubkey, claimed }: NipRatingListProps) {
  const [filter, setFilter] = useState<Filter>('all');
  const [open, setOpen] = useState<Set<string>>(() => new Set());
  const { perNip } = aggregateReviews(reviews);

  const byNip = new Map<string, ReviewReport[]>();
  for (const r of reviews) {
    const list = byNip.get(r.nip) ?? [];
    list.push(r);
    byNip.set(r.nip, list);
  }
  const rated: Row[] = Array.from(byNip, ([nip, list]) => {
    const raters = new Set(list.map((r) => r.authorPubkey));
    return { nip, list, raters: raters.size, selfOnly: [...raters].every((pk) => pk === appPubkey), claimed: claimed.has(nip) };
  });
  const claimedOnly: Row[] = Array.from(claimed)
    .filter((n) => !byNip.has(n))
    .map((nip) => ({ nip, list: [], raters: 0, selfOnly: false, claimed: true }));

  // Cells below Flawless first, then self-rated, then the rest, claimed-only last; each group by NIP id.
  const rank = (r: Row) => {
    if (r.list.length === 0) return 3;
    if (perNip.get(r.nip)?.tier !== 'flawless') return 0;
    return r.selfOnly ? 1 : 2;
  };
  const all = [...rated, ...claimedOnly].sort((a, b) => rank(a) - rank(b) || a.nip.localeCompare(b.nip));

  const shown = all.filter((r) => {
    if (filter === 'below') return r.list.length > 0 && perNip.get(r.nip)?.tier !== 'flawless';
    if (filter === 'self') return r.selfOnly && r.list.length > 0;
    if (filter === 'claimed') return r.list.length === 0;
    return true;
  });

  const counts = {
    all: all.length,
    below: all.filter((r) => r.list.length > 0 && perNip.get(r.nip)?.tier !== 'flawless').length,
    self: all.filter((r) => r.selfOnly && r.list.length > 0).length,
    claimed: claimedOnly.length,
  };

  const toggle = (nip: string) =>
    setOpen((cur) => {
      const next = new Set(cur);
      if (next.has(nip)) next.delete(nip);
      else next.add(nip);
      return next;
    });

  return (
    <div>
      <Segmented
        value={filter}
        onChange={setFilter}
        label="Filter NIPs"
        options={[
          { value: 'all', label: `All ${counts.all}` },
          { value: 'below', label: `Below Flawless ${counts.below}` },
          { value: 'self', label: `Self-rated ${counts.self}` },
          { value: 'claimed', label: `Claimed only ${counts.claimed}` },
        ]}
        className="max-w-full flex-wrap"
      />

      <ul className="mt-4 divide-y border-t">
        {shown.map((row) => {
          const agg = perNip.get(row.nip);
          const info = NIP_NAME.get(row.nip);
          const isOpen = open.has(row.nip) || filter !== 'all';
          const hasReports = row.list.length > 0;
          return (
            <li key={row.nip} id={row.nip} className="scroll-mt-24">
              <button
                type="button"
                onClick={() => hasReports && toggle(row.nip)}
                aria-expanded={hasReports ? isOpen : undefined}
                disabled={!hasReports}
                className={cn(
                  'grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-x-3 gap-y-1 py-3.5 text-left sm:grid-cols-[3.5rem_1fr_auto_auto_1.5rem]',
                  hasReports && 'cursor-pointer hover:bg-muted/60',
                  'rounded-sm focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50',
                )}
              >
                <span className="font-mono text-base font-semibold tabular-nums">{nipShort(row.nip)}</span>
                <span className="text-base">
                  {info?.name ?? row.nip.toUpperCase()}
                  {row.claimed && <span className="ml-2 font-mono text-xs text-muted-foreground">claimed in code</span>}
                </span>
                <span className="col-start-2 font-mono text-xs text-muted-foreground sm:col-start-auto">
                  {hasReports ? `${row.raters} ${row.raters === 1 ? 'rater' : 'raters'}${row.selfOnly ? ' · self-rated only' : ''}` : 'not yet rated'}
                </span>
                <span className="col-start-3 row-start-1 justify-self-end sm:col-start-auto sm:row-start-auto">
                  {agg ? <TierBadge tier={agg.tier} /> : <span data-state="claimed" className="tier-chip inline-flex h-8 items-center rounded-md px-2.5 text-sm">c</span>}
                </span>
                {hasReports && (
                  <span className="hidden text-muted-foreground sm:block" aria-hidden="true">
                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                  </span>
                )}
              </button>
              {hasReports && isOpen && (
                <ul className="mb-2 divide-y pl-0 sm:pl-[4.25rem]">
                  {row.list.map((r) => (
                    <RaterRow key={r.event.id} review={r} appPubkey={appPubkey} />
                  ))}
                </ul>
              )}
            </li>
          );
        })}
        {shown.length === 0 && <li className="py-8 text-center text-muted-foreground">Nothing in this filter.</li>}
      </ul>
    </div>
  );
}
