import { TRACKED_NIPS } from '@/lib/appReviews';
import { formatUtc } from '@/lib/staticData';
import type { MetricsData } from '@/lib/staticData';

interface StatTilesProps {
  metrics: MetricsData | undefined;
  ratings: number | undefined;
  ratedApps: number | undefined;
  loading?: boolean;
}

function Tile({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="rounded-md border bg-card p-6">
      <p className="eyebrow">{label}</p>
      <p className="t-stat mt-2" aria-live="polite">
        {value}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{note}</p>
    </div>
  );
}

export function StatTiles({ metrics, ratings, ratedApps, loading }: StatTilesProps) {
  const asOf = metrics?.crawled_at ? `as of ${formatUtc(metrics.crawled_at)}` : 'from the latest crawl';
  const dash = loading ? '…' : '—';
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Tile label="Apps discovered" value={metrics?.apps ? metrics.apps.toLocaleString('en-US') : dash} note={asOf} />
      <Tile label="Apps rated" value={ratedApps === undefined ? dash : ratedApps.toLocaleString('en-US')} note="with at least one published rating" />
      <Tile label="Community ratings" value={ratings === undefined ? dash : ratings.toLocaleString('en-US')} note="kind 31986 events, snapshot plus live relays" />
      <Tile label="NIPs tracked" value={String(TRACKED_NIPS.length)} note="columns in the matrix" />
    </div>
  );
}
