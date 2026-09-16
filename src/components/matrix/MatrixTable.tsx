import { Link, useNavigate } from 'react-router-dom';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { NipHeader } from '@/components/matrix/NipHeader';
import { TierCell } from '@/components/matrix/TierCell';
import { TIER_LETTER } from '@/lib/tiers';
import type { MatrixRow } from '@/lib/matrix';
import { formatMau } from '@/lib/staticData';
import { cn } from '@/lib/utils';

interface MatrixTableProps {
  rows: MatrixRow[];
  nips: string[];
  /** Cap the table height so the header and first column can stick. */
  className?: string;
  caption?: string;
}

const stickyCol = 'sticky left-0 z-10 bg-card group-hover/row:bg-muted';

export function MatrixTable({ rows, nips, className, caption }: MatrixTableProps) {
  const navigate = useNavigate();

  return (
    <div className={cn('rounded-md border bg-card', className)}>
      <div className="max-h-[75vh] overflow-auto">
        <Table className="w-max min-w-full text-sm">
          {caption && <caption className="sr-only">{caption}</caption>}
          <TableHeader className="sticky top-0 z-20 bg-card">
            <TableRow className="hover:bg-card">
              <TableHead scope="col" className={cn(stickyCol, 'z-30 min-w-44 border-r pl-4')}>
                App
              </TableHead>
              <TableHead scope="col" className="text-right font-mono text-xs">
                <abbr title="Distinct monthly authors" className="no-underline">MAU</abbr>
              </TableHead>
              <TableHead scope="col" className="text-center font-mono text-xs">
                Overall
              </TableHead>
              {nips.map((id) => (
                <TableHead key={id} scope="col" className="w-10 min-w-10 px-1 text-center">
                  <NipHeader id={id} />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.address}
                className="group/row cursor-pointer hover:bg-muted"
                onClick={(e) => {
                  if ((e.target as HTMLElement).closest('a, [tabindex]')) return;
                  navigate(`/app/${row.naddr}`);
                }}
              >
                <TableCell className={cn(stickyCol, 'border-r pl-4')}>
                  <Link
                    to={`/app/${row.naddr}`}
                    className="font-semibold text-foreground hover:text-primary hover:underline focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 rounded-sm"
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
                <TableCell className="text-right font-mono tabular-nums">{formatMau(row.mau)}</TableCell>
                <TableCell className="text-center">
                  {row.overall ? (
                    <span
                      data-tier={row.overall.tier}
                      className="tier-chip inline-flex h-6 w-8 items-center justify-center rounded-[4px] text-sm leading-none"
                      aria-label={`Overall ${row.overall.tier}`}
                    >
                      {TIER_LETTER[row.overall.tier]}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">·</span>
                  )}
                </TableCell>
                {nips.map((id) => (
                  <TableCell key={id} className="px-1 text-center">
                    <TierCell cell={row.cells.get(id)} claimed={row.claimed.has(id)} nipId={id} appName={row.name} />
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
