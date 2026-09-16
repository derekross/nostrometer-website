import { useMemo, useState } from 'react';
import { useSeoMeta } from '@unhead/react';
import { RefreshCw } from 'lucide-react';
import { PageHeader, Section } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { MatrixLegend } from '@/components/matrix/MatrixLegend';
import { MatrixSkeleton, MatrixTable } from '@/components/matrix/MatrixTable';
import { useMatrix } from '@/hooks/useMatrix';
import { TRACKED_NIPS } from '@/lib/appReviews';
import { TRACKED_NIP_IDS, rowHasData } from '@/lib/matrix';
import { DEFAULT_OG_IMAGE, NOSTRHUB_APPS_URL, REPO_URL } from '@/lib/site';
import { formatDay, formatUtc } from '@/lib/staticData';

const ALL = 'all';

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
  const [nip, setNip] = useState<string>(ALL);

  const rows = useMemo(() => {
    let list = matrix.rows ?? [];
    const q = search.trim().toLowerCase();
    if (q) list = list.filter((r) => r.name.toLowerCase().includes(q) || r.identifier.toLowerCase().includes(q));
    if (hideEmpty) list = list.filter(rowHasData);
    if (nip !== ALL) list = list.filter((r) => r.cells.has(nip) || r.claimed.has(nip));
    return list;
  }, [matrix.rows, search, hideEmpty, nip]);

  const nips = nip === ALL ? TRACKED_NIP_IDS : [nip];
  const m = matrix.metrics;
  const provenance = m?.crawled_at
    ? `Usage: ${m.metric ?? 'distinct authors'} on ${m.relay ?? 'the relay'}, ${formatDay(m.since)} to ${formatDay(m.until)}, crawled ${formatUtc(m.crawled_at)}.`
    : 'Usage data is not available for this build.';

  return (
    <>
      <PageHeader
        eyebrow="Results"
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
        <MatrixLegend />

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-end">
          <div className="flex-1">
            <Label htmlFor="search" className="eyebrow mb-2 block">
              Search
            </Label>
            <Input id="search" type="search" placeholder="App name" value={search} onChange={(e) => setSearch(e.target.value)} className="h-10 max-w-sm" />
          </div>
          <div>
            <Label htmlFor="nip" className="eyebrow mb-2 block">
              NIP
            </Label>
            <Select value={nip} onValueChange={setNip}>
              <SelectTrigger id="nip" className="h-10 w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>All tracked NIPs</SelectItem>
                {TRACKED_NIPS.map((n) => (
                  <SelectItem key={n.id} value={n.id}>
                    <span className="font-mono">{n.id.toUpperCase()}</span> · {n.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex h-10 items-center gap-3">
            <Switch id="hide-empty" checked={hideEmpty} onCheckedChange={setHideEmpty} />
            <Label htmlFor="hide-empty">Hide apps with no data</Label>
          </div>
        </div>

        <div className="mt-6">
          {matrix.isLoading && <MatrixSkeleton rows={8} cols={16} />}

          {matrix.isError && (
            <div className="rounded-md border border-dashed bg-card px-8 py-12 text-center">
              <p className="text-lg font-semibold">The relays did not answer.</p>
              <p className="mx-auto mt-2 max-w-md text-muted-foreground">
                Ratings are read live from Nostr relays. Try again, or browse the same ratings on nostrhub.io.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Button onClick={() => matrix.refetch()}>
                  <RefreshCw className="size-4" /> Retry
                </Button>
                <Button asChild variant="outline">
                  <a href={NOSTRHUB_APPS_URL} target="_blank" rel="noopener noreferrer">
                    nostrhub.io/apps
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

          {rows.length > 0 && <MatrixTable rows={rows} nips={nips} caption="Client × NIP interoperability matrix" />}
        </div>

        <p className="mt-4 text-sm text-muted-foreground">
          {provenance} Ratings: crawl snapshot of {matrix.snapshotCount}
          {matrix.snapshotDate ? ` (${formatUtc(matrix.snapshotDate)})` : ''} merged with a live relay read
          {matrix.isLive ? ' (still reading…)' : ` (${matrix.liveCount} returned)`}; newest revision per rater, app and NIP wins.
          Raw files:{' '}
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
