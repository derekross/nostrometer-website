import { useMemo, useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { RefreshCw } from 'lucide-react';
import { PageHeader, Section } from '@/components/Layout';
import { Segmented } from '@/components/Segmented';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { MatrixLegend } from '@/components/matrix/MatrixLegend';
import { MatrixSkeleton, MatrixTable } from '@/components/matrix/MatrixTable';
import { NipDetailPanel } from '@/components/matrix/NipDetailPanel';
import { useMatrix } from '@/hooks/useMatrix';
import { TRACKED_NIPS } from '@/lib/appReviews';
import { TRACKED_NIP_IDS, rowHasData, sortRows, type MatrixSort } from '@/lib/matrix';
import { DEFAULT_OG_IMAGE, NOSTRHUB_APPS_URL, REPO_URL } from '@/lib/site';
import { formatDay, formatUtc } from '@/lib/staticData';

const SORTS: { value: MatrixSort; label: string }[] = [
  { value: 'usage', label: 'By usage' },
  { value: 'overall', label: 'By overall' },
  { value: 'coverage', label: 'By coverage' },
];

export default function ResultsPage() {
  const description = 'Apps by real usage, NIPs across the top, one chip per cell. The live Nostr interoperability matrix.';
  useSeoMeta({
    title: 'Results · Nostrometer',
    description,
    ogTitle: 'The scoreboard',
    ogDescription: description,
    ogImage: DEFAULT_OG_IMAGE,
    twitterCard: 'summary_large_image',
  });

  const matrix = useMatrix();
  const [search, setSearch] = useState('');
  const [hideEmpty, setHideEmpty] = useState(false);
  const [sort, setSort] = useState<MatrixSort>('usage');
  const [selectedNip, setSelectedNip] = useState<string | null>(null);

  const rows = useMemo(() => {
    let list = matrix.rows ?? [];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q) || r.identifier.toLowerCase().includes(q));
    if (hideEmpty) list = list.filter(rowHasData);
    return sortRows(list, sort);
  }, [matrix.rows, search, hideEmpty, sort]);

  const m = matrix.metrics;
  const provenance = m?.crawled_at
    ? `Usage: ${m.metric ?? 'distinct authors'} on ${m.relay ?? 'the relay'}, ${formatDay(m.since)} to ${formatDay(m.until)}, crawled ${formatUtc(m.crawled_at)}.`
    : 'Usage data is not available for this build.';

  return (
    <>
      <PageHeader
        eyebrow="Readout · 02 · Results"
        title={
          <>
            The <mark className="hl">scoreboard</mark>.
          </>
        }
        lede="Apps by real usage, NIPs across the top, one chip per cell."
      >
        <p className="mt-6 max-w-[65ch] font-mono text-sm text-muted-foreground">
          {matrix.rows ? `${matrix.rows.length} rated apps · ${matrix.reviews?.length ?? 0} ratings · ${TRACKED_NIPS.length} NIPs` : 'Loading ratings from relays…'}
        </p>
      </PageHeader>

      <Section className="pt-0 md:pt-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-center">
          <Segmented value={sort} onChange={setSort} options={SORTS} label="Sort rows" />
          <div>
            <Label htmlFor="search" className="sr-only">
              Search apps
            </Label>
            <Input id="search" type="search" placeholder="App name" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 w-64 max-w-full" />
          </div>
          <div className="flex h-10 items-center gap-3">
            <Switch id="hide-empty" checked={hideEmpty} onCheckedChange={setHideEmpty} />
            <Label htmlFor="hide-empty">Hide apps with no data</Label>
          </div>
          <MatrixLegend className="lg:ml-auto" />
        </div>

        <div className="mt-6">
          {matrix.isLoading && <MatrixSkeleton rows={8} cols={16} />}

          {matrix.isError && (
            <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center">
              <p className="text-lg font-semibold">The relays did not answer.</p>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Ratings are read live from Nostr relays. Try again, or browse the same ratings on NostrHub.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={() => matrix.refetch()}>
                  <RefreshCw className="size-4" /> Retry
                </Button>
                <Button asChild variant="outline">
                  <a href={NOSTRHUB_APPS_URL} target="_blank" rel="noopener noreferrer">
                    Browse on NostrHub
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href={REPO_URL} target="_blank" rel="noopener noreferrer">
                    Raw data on GitHub
                  </a>
                </Button>
              </div>
            </div>
          )}

          {matrix.liveFailed && (
            <p className="mb-4 rounded-md border border-dashed bg-card px-4 py-3 text-sm text-muted-foreground">
              Live relays did not answer; showing the crawl snapshot{matrix.snapshotDate ? ` from ${formatUtc(matrix.snapshotDate)}` : ''}.{' '}
              <button type="button" onClick={() => matrix.refetch()} className="text-primary underline">
                Retry
              </button>
            </p>
          )}

          {matrix.rows && matrix.rows.length === 0 && (
            <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
              No ratings found on the configured relays yet.
            </div>
          )}

          {matrix.rows && matrix.rows.length > 0 && rows.length === 0 && (
            <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center text-muted-foreground">
              Nothing matches those filters.
            </div>
          )}

          {rows.length > 0 && (
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
              <div className="min-w-0 flex-1">
                <MatrixTable
                  rows={rows}
                  nips={TRACKED_NIP_IDS}
                  coverage
                  compact
                  selectedNip={selectedNip}
                  onSelectNip={(nip) => setSelectedNip((cur) => (cur === nip ? null : nip))}
                  caption="Client × NIP interoperability matrix"
                />
              </div>
              {selectedNip && (
                <div className="w-full lg:w-[300px] lg:shrink-0">
                  <NipDetailPanel nip={selectedNip} rows={rows} reviews={matrix.reviews} onClose={() => setSelectedNip(null)} />
                </div>
              )}
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {provenance} Ratings: crawl snapshot of {matrix.snapshotCount}
          {matrix.snapshotDate ? ` (${formatUtc(matrix.snapshotDate)})` : ''} merged with a live relay read
          {matrix.isLive ? ' (still reading…)' : ` (${matrix.liveCount} returned)`}; newest revision per rater, app and NIP wins.
          Click a column header to open its detail. Raw files:{' '}
          <a href="/data/ratings.json" className="font-mono underline underline-offset-2">ratings.json</a>,{' '}
          <a href="/data/metrics.json" className="font-mono underline underline-offset-2">metrics.json</a>,{' '}
          <a href="/data/claimed.json" className="font-mono underline underline-offset-2">claimed.json</a>,{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
            registry and ratings on GitHub
          </a>
          .
        </p>
      </Section>
    </>
  );
}
