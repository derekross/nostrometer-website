import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NipHeader } from '@/components/matrix/NipHeader';
import { TierCell } from '@/components/matrix/TierCell';
import { TIER_ORDER } from '@/lib/appReviews';
import { columnCoverage, type MatrixRow } from '@/lib/matrix';
import { formatMau } from '@/lib/staticData';
import { TIER_LETTER } from '@/lib/tiers';
import { cn } from '@/lib/utils';

interface MatrixTableProps {
  rows: MatrixRow[];
  nips: string[];
  className?: string;
  caption?: string;
  /** Show the per-NIP tier split under the headers. */
  coverage?: boolean;
  /** Smaller chips so all 30 columns fit at desktop width. */
  compact?: boolean;
  /** Column headers become buttons; the selected column is highlighted. */
  selectedNip?: string | null;
  onSelectNip?: (nip: string) => void;
}

const stickyCol = 'sticky left-0 z-10 bg-card group-hover/row:bg-muted';

function CoverageBar({ rows, nip }: { rows: MatrixRow[]; nip: string }) {
  const c = columnCoverage(rows, nip);
  const label = `${c.rated} rated: ${TIER_ORDER.map((t) => `${c.counts[t]} ${t}`).join(', ')}; ${c.claimed} claimed; ${c.none} no data`;
  return (
    <div className="px-0.5" title={label}>
      <div className="flex h-1.5 gap-px overflow-hidden rounded-[2px] bg-muted" role="img" aria-label={label}>
        {TIER_ORDER.map((t) =>
          c.counts[t] > 0 ? <span key={t} style={{ flex: `${c.counts[t]} 0 0`, background: `var(--tier-${t})` }} /> : null,
        )}
      </div>
      <div className="mt-1 text-center font-mono text-[10px] text-muted-foreground tabular-nums">{c.rated}</div>
    </div>
  );
}

export function MatrixTable({ rows, nips, className, caption, coverage, compact, selectedNip, onSelectNip }: MatrixTableProps) {
  const navigate = useNavigate();
  const pad = compact ? 'px-px py-1' : 'px-1 py-2';

  return (
    <div className={cn('matrix-glow rounded-md border bg-card', className)}>
      <div className="max-h-[75vh] overflow-auto">
        <Table className="w-max min-w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-card">
              <TableHead scope="col" className={cn(stickyCol, 'z-30 border-r pl-4', compact ? 'min-w-36' : 'min-w-44')}>
                App
              </TableHead>
              <TableHead scope="col" className="text-right font-mono text-xs">
                <abbr title="Distinct monthly authors" className="no-underline">MAU</abbr>
              </TableHead>
              <TableHead scope="col" className="text-center font-mono text-xs">
                Overall
              </TableHead>
              {nips.map((id) => (
                <TableHead
                  key={id}
                  scope="col"
                  aria-sort={undefined}
                  className={cn('px-0.5 text-center', compact ? 'w-[34px] min-w-[34px]' : 'w-10 min-w-10', selectedNip === id && 'bg-accent')}
                >
                  {onSelectNip ? (
                    <button
                      type="button"
                      onClick={() => onSelectNip(id)}
                      aria-pressed={selectedNip === id}
                      className="rounded-sm px-1 py-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    >
                      <NipHeader id={id} />
                    </button>
                  ) : (
                    <NipHeader id={id} />
                  )}
                </TableHead>
              ))}
            </TableRow>
            {coverage && (
              <TableRow className="hover:bg-card">
                <TableHead scope="row" className={cn(stickyCol, 'eyebrow z-30 h-auto border-r pb-2 pl-4 text-[11px]')}>
                  Coverage
                </TableHead>
                <TableHead className="h-auto" />
                <TableHead className="h-auto" />
                {nips.map((id) => (
                  <TableHead key={id} className={cn('h-auto px-0.5 pb-2 align-bottom', selectedNip === id && 'bg-accent')}>
                    <CoverageBar rows={rows} nip={id} />
                  </TableHead>
                ))}
              </TableRow>
            )}
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.address}
                className="group/row cursor-pointer hover:bg-muted"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('a, [tabindex], button')) return;
                  navigate(`/app/${row.naddr}`);
                }}
              >
                <TableCell className={cn(stickyCol, 'border-r pl-4', compact && 'py-1')}>
                  <Link
                    to={`/app/${row.naddr}`}
                    className="rounded-sm font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
                  >
                    {row.name}
                  </Link>
                  {row.raters > 0 && (
                    <span className="ml-2 font-mono text-xs text-muted-foreground tabular-nums">
                      {row.raters}
                      <span className="sr-only"> distinct raters</span>
                      <span aria-hidden="true">r</span>
                    </span>
                  )}
                </TableCell>
                <TableCell className={cn('text-right font-mono tabular-nums', compact && 'py-1')}>{formatMau(row.mau)}</TableCell>
                <TableCell className={cn('text-center', compact && 'py-1')}>
                  {row.overall ? (
                    <span
                      data-tier={row.overall.tier}
                      className={cn('tier-chip inline-flex items-center justify-center rounded-[4px] leading-none', compact ? 'h-[22px] w-7 text-[13px]' : 'h-6 w-8 text-sm')}
                      aria-label={`Overall ${row.overall.tier}`}
                    >
                      {TIER_LETTER[row.overall.tier]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">·</span>
                  )}
                </TableCell>
                {nips.map((id) => (
                  <TableCell key={id} className={cn(pad, 'text-center', selectedNip === id && 'bg-accent/60')}>
                    <TierCell cell={row.cells.get(id)} claimed={row.claimed.has(id)} nipId={id} appName={row.name} compact={compact} />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

/** Skeleton grid shown while reviews load. */
export function MatrixSkeleton({ rows = 6, cols = 12 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-md border bg-card p-4" aria-busy="true" aria-label="Loading matrix">
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center gap-2">
            <div className="h-5 w-36 animate-pulse rounded bg-muted" />
            <div className="h-5 w-10 animate-pulse rounded bg-muted" />
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-6 w-8 animate-pulse rounded-[4px] bg-muted" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
