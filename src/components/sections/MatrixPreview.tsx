import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MatrixLegend } from '@/components/matrix/MatrixLegend';
import { MatrixSkeleton, MatrixTable } from '@/components/matrix/MatrixTable';
import { TRACKED_NIP_IDS, type MatrixRow } from '@/lib/matrix';

/** The columns the home preview shows: the NIPs most apps touch. */
const PREVIEW_NIPS = ['nip-01', 'nip-02', 'nip-05', 'nip-09', 'nip-10', 'nip-17', 'nip-19', 'nip-23', 'nip-25', 'nip-46', 'nip-57', 'nip-65'].filter(
  (id) => TRACKED_NIP_IDS.includes(id),
);

interface MatrixPreviewProps {
  rows: MatrixRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
}

export function MatrixPreview({ rows, isLoading, isError }: MatrixPreviewProps) {
  const top = rows?.slice(0, 10) ?? [];
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow mb-4">The scoreboard</p>
          <h2 className="t-h2 max-w-[22ch]">
            Top apps by <mark className="hl">real usage</mark>.
          </h2>
        </div>
        <Button asChild variant="outline">
          <Link to="/results">
            Full matrix <ArrowRight className="size-4" />
          </Link>
        </Button>
      </div>

      <MatrixLegend className="mt-8" />

      <div className="mt-4">
        {isLoading && <MatrixSkeleton rows={6} cols={PREVIEW_NIPS.length} />}
        {isError && (
          <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
            The relays did not answer. <Link to="/results" className="text-primary underline">Open the results page</Link> to retry.
          </div>
        )}
        {rows && rows.length === 0 && (
          <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
            No ratings found on the configured relays yet.
          </div>
        )}
        {top.length > 0 && <MatrixTable rows={top} nips={PREVIEW_NIPS} caption="Top ten rated apps by monthly authors" />}
      </div>
    </div>
  );
}
