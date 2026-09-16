import { Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TierCell } from '@/components/matrix/TierCell';
import { TIER_ORDER, TRACKED_NIPS, type ReviewReport } from '@/lib/appReviews';
import { columnCoverage, type MatrixRow } from '@/lib/matrix';
import { formatMau } from '@/lib/staticData';

interface NipDetailPanelProps {
  nip: string;
  rows: MatrixRow[];
  reviews: ReviewReport[] | undefined;
  onClose: () => void;
}

const BY_ID = new Map(TRACKED_NIPS.map((n) => [n.id, n]));

/** One column of the matrix, opened: tier split, every app's chip, the latest rater note. */
export function NipDetailPanel({ nip, rows, reviews, onClose }: NipDetailPanelProps) {
  const info = BY_ID.get(nip);
  const c = columnCoverage(rows, nip);
  const apps = rows.filter((r) => r.cells.has(nip) || r.claimed.has(nip));
  const nameByAddress = new Map(rows.map((r) => [r.address, r.name]));
  const latest = (reviews ?? []).filter((r) => r.nip === nip && r.content.trim() && nameByAddress.has(r.appAddress))[0];

  return (
    <aside className="rounded-md border bg-card p-5" aria-label={`${nip.toUpperCase()} detail`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="eyebrow">Column</p>
          <p className="mt-1 font-mono text-xl font-semibold">{nip.toUpperCase()}</p>
          {info && <p className="text-sm text-muted-foreground">{info.name}</p>}
        </div>
        <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close column detail">
          <X className="size-4" />
        </Button>
      </div>

      <div className="mt-4 flex h-2 gap-px overflow-hidden rounded-[2px] bg-muted" role="img" aria-label={`${c.rated} rated, ${c.claimed} claimed, ${c.none} no data`}>
        {TIER_ORDER.map((t) =>
          c.counts[t] > 0 ? <span key={t} style={{ flex: `${c.counts[t]} 0 0`, background: `var(--tier-${t})` }} /> : null,
        )}
        {c.claimed > 0 && <span style={{ flex: `${c.claimed} 0 0`, background: 'color-mix(in oklab, var(--muted-foreground) 35%, transparent)' }} />}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-xs text-muted-foreground tabular-nums">
        <span>{c.rated} rated</span>
        <span>{c.claimed} claimed</span>
        <span>{c.none} no data</span>
      </div>

      <ul className="mt-4 space-y-2 text-sm">
        {apps.map((r) => (
          <li key={r.address} className="flex items-center gap-2.5">
            <TierCell cell={r.cells.get(nip)} claimed={r.claimed.has(nip)} nipId={nip} appName={r.name} />
            <Link to={`/app/${r.naddr}#${nip}`} className="font-semibold hover:text-primary hover:underline">
              {r.name}
            </Link>
            <span className="ml-auto font-mono text-xs text-muted-foreground tabular-nums">{formatMau(r.mau)}</span>
          </li>
        ))}
        {apps.length === 0 && <li className="text-muted-foreground">No app has a rating or a claim for this NIP yet.</li>}
      </ul>

      {latest && (
        <p className="mt-4 border-t pt-3 text-[13px] leading-5 text-muted-foreground">
          <span className="font-semibold text-foreground">Latest note · {nameByAddress.get(latest.appAddress)}:</span> {latest.content}
        </p>
      )}
    </aside>
  );
}
